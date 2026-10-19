import type { CurriculumModule } from '@/types/curriculum';

export const jvmRuntimeModule: CurriculumModule = {
  id: 'jvm-runtime',
  order: 8,
  title: 'JVM Runtime: Memory, Class Loading, JIT and GC',
  shortTitle: 'JVM Runtime',
  summary: 'Runtime data areas, how the JIT optimises, how garbage collectors work, and how to recognise and fix memory leaks.',
  level: 'advanced',
  prerequisites: ['oop', 'collections'],
  plannedTopics: ['Class loading deep dive', 'JIT compiler internals'],
  lessons: [
    {
      id: 'r-memory-areas',
      moduleId: 'jvm-runtime',
      title: 'Runtime data areas and the JIT compiler',
      summary: 'Heap, stacks, Metaspace, code cache and how HotSpot turns hot bytecode into optimised machine code.',
      estimatedMinutes: 35,
      difficulty: 'advanced',
      prerequisites: ['p-bytecode', 'f-methods'],
      versionNotes: [
        { feature: 'Metaspace replaces PermGen', since: 8 },
        { feature: 'Compact object headers (-XX:+UseCompactObjectHeaders)', since: 25, note: 'Experimental in 24, product option in 25' },
      ],
      objectives: [
        'Name the JVM runtime data areas and what lives in each.',
        'Explain the difference between StackOverflowError and OutOfMemoryError.',
        'Describe tiered compilation and common JIT optimisations.',
      ],
      plainEnglish: `When a Java program runs, the JVM organises memory into areas with different jobs:

- the **heap** holds every object and array, shared by all threads;
- each thread has its own **stack** of frames for method calls (local variables and intermediate values);
- **Metaspace** holds class metadata such as method bytecode and the constant pool;
- the **code cache** holds machine code produced by the JIT compiler.

The JVM starts by interpreting bytecode, watches which methods run often, and compiles those "hot" methods into fast machine code.`,
      technical: `### Areas (JVMS §2.5, HotSpot terms)
- **Heap**: objects and arrays; managed by the garbage collector; sized with -Xms/-Xmx (or -XX:MaxRAMPercentage in containers). Exhaustion → \`OutOfMemoryError: Java heap space\`.
- **Thread stacks**: one per platform thread, sized with -Xss (default 1 MB on 64-bit Linux). Frames hold locals, an operand stack and a reference to the class's constant pool. Deep recursion → \`StackOverflowError\`. Virtual threads keep their stacks on the heap as chunks while unmounted.
- **Metaspace** (since Java 8, native memory): class metadata. Class-loader leaks (e.g. redeploying web apps) → \`OutOfMemoryError: Metaspace\`.
- **Code cache**: JIT-compiled code.
- **Program counter** per thread, and native method stacks.
- Direct buffers and thread stacks are native memory, so a process can exceed -Xmx; container limits must leave headroom.

### Object layout
A HotSpot object has a header (mark word for hashing/locking/GC age plus a class pointer; 12 bytes with compressed class pointers) followed by fields, padded to 8 bytes. Java 25's compact object headers shrink the header to 8 bytes.

### JIT compilation
HotSpot uses **tiered compilation**: the interpreter collects profiles; C1 compiles quickly with light optimisation; methods that stay hot are recompiled by **C2** with aggressive optimisations:
- **inlining** small and frequently called methods (the gateway to most others),
- **escape analysis**: objects that never escape a method may be scalar-replaced and never allocated on the heap,
- loop unrolling, bounds-check elimination, intrinsics (e.g. String and Math methods),
- **speculative optimisation** based on profiles (e.g. a call site that only ever saw one class is devirtualised); if the assumption breaks, the JVM **deoptimises** back to the interpreter.

That is why micro-benchmarks need warm-up (use JMH) and why "Java is slow" claims from cold-start measurements are misleading.`,
      whyItExists: `Separating per-thread stacks from a shared heap makes method calls cheap and memory management automatic. Profile-guided JIT compilation lets Java optimise for the real workload and real CPU, often beating ahead-of-time compilers on long-running servers.`,
      whenToUse: [
        'Use this model to diagnose OutOfMemoryError variants and StackOverflowError.',
        'Size heap and container memory together, leaving room for native memory.',
        'Benchmark only after warm-up, with JMH.',
      ],
      whenNotToUse: [
        'Do not hand-optimise code for the interpreter (manual inlining, avoiding small methods) — the JIT does it better.',
        'Do not set -Xmx equal to the container limit.',
      ],
      examples: [
        {
          id: 'stack-vs-heap',
          title: 'Stack overflow vs heap exhaustion',
          runnable: true,
          code: `public class Main {
    static int depth = 0;

    static void recurse() {
        depth++;
        recurse();
    }

    public static void main(String[] args) {
        try {
            recurse();
        } catch (StackOverflowError e) {
            System.out.println("StackOverflowError after a deep call chain: " + (depth > 1000));
        }

        long maxHeap = Runtime.getRuntime().maxMemory();
        int length = (int) Math.min(Integer.MAX_VALUE - 8, maxHeap / 8 + 1);
        try {
            long[] tooBig = new long[length];   // more bytes than the whole heap
            System.out.println("allocated " + tooBig.length);
        } catch (OutOfMemoryError e) {
            System.out.println("OutOfMemoryError: " + e.getMessage());
        }
    }
}`,
          expectedOutput: `StackOverflowError after a deep call chain: true
OutOfMemoryError: Java heap space`,
          explanation: 'Catching these errors is done here only to demonstrate them; production code should not try to recover from either. On a JVM with a heap above 16 GB the array would fit and the program prints "allocated" instead.',
        },
        {
          id: 'runtime-memory',
          title: 'Inspecting memory from inside the JVM',
          runnable: true,
          code: `import java.lang.management.ManagementFactory;
import java.lang.management.MemoryPoolMXBean;

public class Main {
    public static void main(String[] args) {
        Runtime rt = Runtime.getRuntime();
        System.out.println("max heap MB:   " + rt.maxMemory() / (1024 * 1024));
        System.out.println("total heap MB: " + rt.totalMemory() / (1024 * 1024));
        System.out.println("free heap MB:  " + rt.freeMemory() / (1024 * 1024));
        for (MemoryPoolMXBean pool : ManagementFactory.getMemoryPoolMXBeans()) {
            System.out.println(pool.getType() + " " + pool.getName());
        }
    }
}`,
          explanation: 'Pool names depend on the garbage collector in use (e.g. "G1 Eden Space", "Metaspace", "CodeHeap ..."). Output varies by machine.',
        },
      ],
      walkthrough: {
        exampleId: 'stack-vs-heap',
        steps: [
          { lines: [4, 7], text: 'Each recursive call pushes a frame on the thread stack. With no base case, the stack fills up.' },
          { lines: [10, 14], text: 'The JVM throws StackOverflowError when the stack has no room for another frame — the heap is not involved.' },
          { lines: [16, 17], text: 'maxMemory() reports the heap limit (-Xmx). The array length is chosen so the array needs more bytes than the entire heap.' },
          { lines: [18, 23], text: 'Arrays live on the heap. When the GC cannot find enough space even after collecting, the JVM throws OutOfMemoryError: Java heap space. In real services the usual cause is reachable data accumulating, not one huge array.' },
        ],
      },
      realWorld: {
        title: 'A container killed with plenty of heap left',
        scenario: `A service ran in a 1 GiB container with \`-Xmx1g\`. Kubernetes kept killing it (OOMKilled) although heap usage never exceeded 700 MB. The JVM also uses native memory: Metaspace, code cache, thread stacks (300 threads × 1 MB) and direct buffers from the HTTP client. Together they pushed the process beyond 1 GiB.

Switching to \`-XX:MaxRAMPercentage=75\` and enabling Native Memory Tracking (\`-XX:NativeMemoryTracking=summary\`, \`jcmd <pid> VM.native_memory\`) confirmed the budget. Moving the blocking HTTP calls to virtual threads cut thread stack usage further.`,
      },
      commonMistakes: [
        {
          mistake: 'Setting -Xmx equal to the container memory limit.',
          why: 'Non-heap memory (Metaspace, stacks, code cache, direct buffers) comes on top of the heap.',
          fix: 'Use MaxRAMPercentage around 70–75% and measure with Native Memory Tracking.',
        },
        {
          mistake: 'Measuring performance in the first seconds of a run.',
          why: 'Code is still interpreted or compiled by C1; C2 has not optimised it yet.',
          fix: 'Warm up and use JMH for micro-benchmarks.',
        },
        {
          mistake: 'Increasing -Xss to "fix" StackOverflowError.',
          why: 'It usually hides unbounded recursion.',
          fix: 'Fix the base case or convert deep recursion to iteration.',
        },
      ],
      checks: [
        {
          id: 'r1-c1',
          kind: 'mcq',
          dimension: 'runtime',
          prompt: 'Where are local primitive variables of a running method stored?',
          options: [
            { id: 'a', text: 'In the heap' },
            { id: 'b', text: 'In the current stack frame of the thread' },
            { id: 'c', text: 'In Metaspace' },
            { id: 'd', text: 'In the code cache' },
          ],
          correctOptionId: 'b',
          explanation: 'Locals live in the frame on the thread\'s stack; objects they reference live on the heap.',
        },
        {
          id: 'r1-c2',
          kind: 'mcq',
          dimension: 'runtime',
          prompt: 'A web server that is redeployed many times without restarting eventually fails with `OutOfMemoryError: Metaspace`. What is the likely cause?',
          options: [
            { id: 'a', text: 'Too many objects in the heap' },
            { id: 'b', text: 'A class loader leak: old application class loaders stay reachable, so their classes are never unloaded' },
            { id: 'c', text: 'Deep recursion' },
            { id: 'd', text: 'Too many JIT compilations' },
          ],
          correctOptionId: 'b',
          explanation: 'Classes are unloaded only when their class loader becomes unreachable. A static reference or a thread from the old deployment keeps it alive.',
        },
        {
          id: 'r1-c3',
          kind: 'mcq',
          dimension: 'runtime',
          prompt: 'What does escape analysis allow the C2 compiler to do?',
          options: [
            { id: 'a', text: 'Skip garbage collection entirely' },
            { id: 'b', text: 'Avoid heap allocation for objects that never escape a method (scalar replacement) and remove unnecessary locks' },
            { id: 'c', text: 'Run code in parallel automatically' },
            { id: 'd', text: 'Compile Java source directly' },
          ],
          correctOptionId: 'b',
          explanation: 'If an object provably does not escape, its fields can live in registers or the stack frame, and synchronization on it can be removed.',
        },
        {
          id: 'r1-c4',
          kind: 'multi-select',
          dimension: 'runtime',
          prompt: 'Which of these consume memory outside the Java heap? Select all that apply.',
          options: [
            { id: 'a', text: 'Metaspace' },
            { id: 'b', text: 'Platform thread stacks' },
            { id: 'c', text: 'Direct ByteBuffers' },
            { id: 'd', text: 'Arrays created with new' },
            { id: 'e', text: 'The JIT code cache' },
          ],
          correctOptionIds: ['a', 'b', 'c', 'e'],
          explanation: 'Arrays are heap objects. The rest is native memory, which is why process memory exceeds -Xmx.',
        },
      ],
      challengeIds: [],
      masteryCriteria: [
        'Map each OutOfMemoryError variant to the memory area involved.',
        'Explain tiered compilation, inlining, escape analysis and deoptimisation.',
        'Budget container memory for heap plus native areas.',
      ],
      relatedLessonIds: ['r-gc', 'p-bytecode', 'f-methods'],
      revision: [
        { id: 'r1', question: 'Name the main JVM runtime memory areas.', answer: 'Heap (objects), per-thread stacks (frames), Metaspace (class metadata), code cache (JIT code), PC registers and native stacks.' },
        { id: 'r2', question: 'What is deoptimisation?', answer: 'When a speculative assumption made by the JIT (e.g. only one receiver class) becomes false, compiled code is discarded and execution falls back to the interpreter until recompiled.' },
        { id: 'r3', question: 'Why can a JVM process use more memory than -Xmx?', answer: 'Metaspace, thread stacks, code cache, GC structures and direct buffers are native memory outside the heap.' },
      ],
    },
    {
      id: 'r-gc',
      moduleId: 'jvm-runtime',
      title: 'Garbage collection and memory leaks',
      summary: 'Reachability, generational collection, the main HotSpot collectors and how to find leaks.',
      estimatedMinutes: 40,
      difficulty: 'advanced',
      prerequisites: ['r-memory-areas'],
      versionNotes: [
        { feature: 'G1 default collector', since: 9 },
        { feature: 'ZGC production-ready', since: 15 },
        { feature: 'Generational ZGC', since: 21, note: 'Default ZGC mode from 23' },
        { feature: 'Generational Shenandoah', since: 25 },
      ],
      objectives: [
        'Explain reachability from GC roots and why Java can still leak memory.',
        'Describe generational collection and the trade-offs of G1, ZGC, Shenandoah, Parallel and Serial.',
        'Diagnose a leak with heap histograms, heap dumps and GC logs.',
      ],
      plainEnglish: `Java frees memory for you: the **garbage collector** finds objects that the program can no longer reach and reclaims them. You never call \`free\`.

But "can no longer reach" is the rule, not "no longer needed". If a long-lived collection keeps references to objects you will never use again, the collector must keep them — that is a Java **memory leak**.`,
      technical: `### Reachability
A collection starts from **GC roots** — live thread stacks (locals), static fields, JNI references, active monitors — and marks everything reachable. Unmarked objects are garbage. Cycles are not a problem: unreachable cycles are collected.

### Generational hypothesis
Most objects die young. Young collections copy the few live objects out of Eden (to survivor spaces or the old generation) and reclaim the rest wholesale, so their cost depends on live data, not on garbage. Objects surviving several collections are promoted to the old generation, which is collected less often.

### HotSpot collectors
- **G1** (default): region-based, mostly concurrent marking, pause-time goal (-XX:MaxGCPauseMillis=200 by default). A good general choice.
- **ZGC**: concurrent compaction with pauses typically below a millisecond regardless of heap size; generational since 21 (default mode from 23). Good for large heaps and latency-sensitive services.
- **Shenandoah**: concurrent compaction (generational mode product in 25).
- **Parallel**: maximises throughput with stop-the-world pauses; good for batch jobs.
- **Serial**: single-threaded; small heaps and small containers.

### Finding leaks
1. Watch **heap after GC** over time (from GC logs: \`-Xlog:gc*\`) — a rising floor means a leak.
2. \`jcmd <pid> GC.class_histogram\` for a quick view of what is growing.
3. \`jcmd <pid> GC.heap_dump file.hprof\` (or \`-XX:+HeapDumpOnOutOfMemoryError\`) and analyse the **dominator tree** in Eclipse MAT or VisualVM to see what retains memory.

Typical culprits: unbounded caches and static maps, listeners never unregistered, ThreadLocals in thread pools, class-loader leaks, and large collections held by long-lived objects.

### Reference types
\`WeakReference\` objects are cleared when only weakly reachable (WeakHashMap keys), \`SoftReference\` when memory is tight, \`PhantomReference\`/\`Cleaner\` for post-mortem clean-up. They are tools for specific caches, not a fix for missing life-cycle management.`,
      whyItExists: `Automatic memory management eliminates use-after-free and double-free bugs and makes most allocation extremely cheap. Different collectors exist because throughput, pause time and memory overhead cannot all be optimised at once.`,
      whenToUse: [
        'Keep the default G1 unless measurements show a need.',
        'Choose ZGC for large heaps or strict latency targets; Parallel for throughput-oriented batch jobs.',
        'Enable GC logging and heap dumps on OOM in every production service.',
      ],
      whenNotToUse: [
        'Do not call System.gc() in application code.',
        'Do not "fix" a leak by increasing -Xmx.',
        'Do not tune dozens of GC flags without a measured problem.',
      ],
      examples: [
        {
          id: 'leak',
          title: 'A leak and its fix',
          runnable: true,
          code: `import java.util.*;

public class Main {
    // Leaky: grows forever because keys are unique per request
    static final Map<String, byte[]> LEAKY = new HashMap<>();

    // Bounded: LinkedHashMap LRU that evicts beyond a fixed size
    static final Map<String, byte[]> BOUNDED = new LinkedHashMap<>(16, 0.75f, true) {
        @Override
        protected boolean removeEldestEntry(Map.Entry<String, byte[]> eldest) {
            return size() > 100;
        }
    };

    public static void main(String[] args) {
        for (int i = 0; i < 10_000; i++) {
            String requestId = "req-" + i;
            LEAKY.put(requestId, new byte[1024]);
            BOUNDED.put(requestId, new byte[1024]);
        }
        System.out.println("leaky entries:   " + LEAKY.size());
        System.out.println("bounded entries: " + BOUNDED.size());
    }
}`,
          expectedOutput: `leaky entries:   10000
bounded entries: 100`,
          explanation: 'In production, prefer a cache library with size limits and expiry (e.g. Caffeine) over hand-rolled maps.',
        },
        {
          id: 'weak',
          title: 'Weak references are cleared when unreachable',
          runnable: true,
          code: `import java.lang.ref.WeakReference;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        Object strong = new Object();
        WeakReference<Object> weak = new WeakReference<>(strong);
        System.out.println("before: " + (weak.get() != null));

        strong = null;                          // drop the only strong reference
        for (int i = 0; i < 10 && weak.get() != null; i++) {
            System.gc();                        // a hint; fine in a demo, not in real code
            Thread.sleep(50);
        }
        System.out.println("after: " + (weak.get() != null));
    }
}`,
          expectedOutput: `before: true
after: false`,
        },
      ],
      walkthrough: {
        exampleId: 'leak',
        steps: [
          { lines: [4, 5], text: 'A static map is reachable from a GC root for the lifetime of the class, so everything in it stays alive.' },
          { lines: [7, 13], text: 'The bounded map evicts the least recently used entry beyond 100 entries, so its memory stays flat.' },
          { lines: [16, 20], text: 'Request ids are unique, so the leaky map never reuses an entry: 10,000 requests → 10,000 retained arrays.' },
          { lines: [21, 22], text: 'The GC cannot help: the leaky entries are reachable. Only the program\'s design can bound them.' },
        ],
      },
      realWorld: {
        title: 'ThreadLocal leak in a thread pool',
        scenario: `A request filter stored a large user context in a \`ThreadLocal\` and forgot to call \`remove()\`. Tomcat reuses its worker threads, so each of the 200 threads kept the last user's context alive indefinitely — and after a hot redeploy the old web application's class loader stayed reachable through those ThreadLocal values, leaking Metaspace on every redeploy.

The fix was \`try { context.set(...); chain.doFilter(...); } finally { context.remove(); }\`. With Java 25, scoped values offer a structured alternative that cannot leak this way.`,
      },
      commonMistakes: [
        {
          mistake: 'Assuming Java cannot leak memory because it has a GC.',
          why: 'The GC frees unreachable objects; reachable-but-useless objects are leaks.',
          fix: 'Bound caches, unregister listeners, remove ThreadLocals.',
        },
        {
          mistake: 'Reading heap usage graphs without looking at the post-GC floor.',
          why: 'Heap usage naturally saw-tooths; only a rising floor indicates retention.',
          fix: 'Plot heap-after-GC from GC logs or JFR.',
        },
        {
          mistake: 'Switching collectors to fix OutOfMemoryError.',
          why: 'No collector can free reachable memory.',
          fix: 'Find what retains the memory with a heap dump.',
        },
      ],
      checks: [
        {
          id: 'r2-c1',
          kind: 'mcq',
          dimension: 'runtime',
          prompt: 'Two objects reference each other but nothing else references either of them. What happens?',
          options: [
            { id: 'a', text: 'They leak forever because of the cycle' },
            { id: 'b', text: 'They are unreachable from GC roots and can be collected' },
            { id: 'c', text: 'Only one is collected' },
            { id: 'd', text: 'The JVM throws an error' },
          ],
          correctOptionId: 'b',
          explanation: 'Tracing collectors start from roots; unreachable cycles are garbage. (Reference counting would leak them, but HotSpot does not use it.)',
        },
        {
          id: 'r2-c2',
          kind: 'mcq',
          dimension: 'runtime',
          prompt: 'Why are young-generation collections usually cheap?',
          options: [
            { id: 'a', text: 'They run in a separate process' },
            { id: 'b', text: 'Their cost depends on the live objects copied, and most young objects are already dead' },
            { id: 'c', text: 'They never pause the application' },
            { id: 'd', text: 'They only run at night' },
          ],
          correctOptionId: 'b',
          explanation: 'Copying collection touches only survivors; dead objects are reclaimed by resetting the space.',
        },
        {
          id: 'r2-c3',
          kind: 'mcq',
          dimension: 'runtime',
          prompt: 'A latency-sensitive service with a 64 GB heap sees 800 ms G1 pauses. Which change is most appropriate to evaluate?',
          options: [
            { id: 'a', text: 'Call System.gc() every minute' },
            { id: 'b', text: 'Switch to generational ZGC and measure pause times and throughput' },
            { id: 'c', text: 'Switch to the Serial collector' },
            { id: 'd', text: 'Reduce -Xss' },
          ],
          correctOptionId: 'b',
          explanation: 'ZGC compacts concurrently with very short pauses independent of heap size. Always validate with measurements.',
        },
        {
          id: 'r2-c4',
          kind: 'mcq',
          dimension: 'debugging',
          prompt: 'Which tool output best shows *what is keeping* memory alive?',
          options: [
            { id: 'a', text: 'CPU flame graph' },
            { id: 'b', text: 'Dominator tree from a heap dump' },
            { id: 'c', text: 'Thread dump' },
            { id: 'd', text: 'Network latency metrics' },
          ],
          correctOptionId: 'b',
          explanation: 'The dominator tree shows retained sizes: which object, if freed, would release which memory.',
        },
      ],
      challengeIds: [],
      masteryCriteria: [
        'Explain reachability, GC roots and why reachable data cannot be collected.',
        'Choose between G1, ZGC, Parallel and Serial for a scenario.',
        'Walk through a leak investigation with histograms, heap dumps and GC logs.',
      ],
      relatedLessonIds: ['r-memory-areas', 'c-hashmap'],
      revision: [
        { id: 'r1', question: 'What is a memory leak in Java?', answer: 'Objects that are no longer needed but remain reachable from GC roots (e.g. via a static collection), so the GC cannot reclaim them.' },
        { id: 'r2', question: 'Name three GC roots.', answer: 'Local variables in live stack frames, static fields of loaded classes, JNI references (also active monitors and thread objects).' },
        { id: 'r3', question: 'When would you choose ZGC over G1?', answer: 'For large heaps or strict low-latency requirements, since ZGC keeps pauses very short regardless of heap size; validate by measuring.' },
      ],
    },
  ],
};
