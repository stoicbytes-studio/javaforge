import type { InterviewQuestion, RubricPoint } from '@/types/practice';

/*
 * Senior interview questions (set A): JVM runtime, concurrency, I/O, JDBC and
 * testing. Written answers are scored by rubric matchers (case-insensitive
 * regular expressions); output questions are executed by
 * scripts/verify-java-content.mjs.
 */

const point = (id: string, label: string, matchers: string[], tip: string, weight = 1): RubricPoint => ({ id, label, weight, matchers, tip });

export const ADVANCED_QUESTIONS_A: InterviewQuestion[] = [
  // ------------------------------------------------------------ jvm-runtime
  {
    id: 'iq-a-heap-stack-oom',
    moduleId: 'jvm-runtime',
    lessonIds: ['r-memory-areas'],
    kind: 'conceptual',
    difficulty: 'intermediate',
    prompt: 'Explain the difference between the heap and the stack in the JVM. Which errors do you get when each runs out, and which kinds of OutOfMemoryError have you seen?',
    rubric: [
      point('stack', 'Each thread has its own stack of frames holding locals and partial results', ['(per|each|own)[- ]thread', 'thread[- ](local|private)', 'stack frames?', 'frames?.{0,40}(local|method call)'], 'Say that every thread owns a stack of frames with local variables and references.', 2),
      point('heap', 'The heap is shared by all threads and holds objects; it is garbage collected', ['heap.{0,60}(shared|all threads|objects)', 'objects? (live|are allocated|are stored) (on|in) the heap', 'garbage[- ]collect'], 'Say that objects live on the shared, garbage-collected heap.', 2),
      point('soe', 'Deep or infinite recursion gives StackOverflowError (-Xss)', ['stackoverflowerror', 'stack ?overflow', '-xss'], 'Name StackOverflowError and its usual cause, unbounded recursion.', 2),
      point('oom-heap', 'Java heap space OOM (-Xmx too small or a leak)', ['java heap space', '-xmx'], 'Name "Java heap space" and connect it to -Xmx or a leak.', 2),
      point('oom-other', 'Other OOM kinds: Metaspace, GC overhead limit exceeded, unable to create native thread, direct buffer memory', ['metaspace', 'gc overhead', 'native thread', 'direct buffer'], 'List at least one non-heap OOM variant: Metaspace, GC overhead, native thread, direct buffer memory.', 2),
      point('diagnose', 'Diagnose with heap dumps (-XX:+HeapDumpOnOutOfMemoryError) and tools', ['heap ?dump', 'heapdumponoutofmemory', '\\bmat\\b', 'jcmd', 'jmap', 'eclipse memory analyzer'], 'Mention capturing a heap dump on OOM and analysing it.'),
    ],
    misconceptions: [
      { id: 'objects-on-stack', pattern: 'objects are (stored|allocated) on the stack', correction: 'Objects are allocated on the heap; the stack holds primitives and references (escape analysis may scalar-replace some objects, but that is a JIT optimisation, not the model).' },
      { id: 'gc-stack', pattern: 'garbage collector (cleans|collects|frees) the stack', correction: 'Stack frames are popped when methods return; the GC manages the heap.' },
      { id: 'oom-exception', pattern: 'outofmemory ?exception', correction: 'It is OutOfMemoryError, an Error, not an Exception.' },
    ],
    modelAnswer:
      'Each thread has its own stack made of frames: one frame per method call, holding local variables, primitive values and references, and it is freed as soon as the method returns. The heap is shared by all threads; objects are allocated on the heap and reclaimed by the garbage collector when unreachable. If a thread recurses too deeply you get StackOverflowError (stack size is set with -Xss). If the heap cannot satisfy an allocation you get OutOfMemoryError: Java heap space, either because -Xmx is too small or because of a leak. Other variants are Metaspace (too many classes, often a class loader leak), GC overhead limit exceeded (the JVM spends almost all its time collecting), unable to create native thread and Direct buffer memory. In production I run with -XX:+HeapDumpOnOutOfMemoryError and analyse the heap dump in Eclipse MAT, or use jcmd for live diagnostics.',
    followUps: ['What is escape analysis and how can it avoid heap allocation?', 'Why can a container kill a JVM for memory even though the heap is not full?', 'How would you size -Xmx inside a container?'],
  },
  {
    id: 'iq-a-gc-leak',
    moduleId: 'jvm-runtime',
    lessonIds: ['r-gc', 'r-memory-areas'],
    kind: 'scenario',
    difficulty: 'advanced',
    prompt: 'A service on Java 21 shows old-generation usage that keeps growing after every full GC, plus occasional 2-second pauses. How do you investigate, and how do you choose a garbage collector for it?',
    rubric: [
      point('leak-signal', 'Live set growing after full GC indicates a leak (objects still reachable)', ['leak', 'still reachable', 'live set', 'after (each|every) (full )?gc'], 'Interpret the symptom: memory that survives full GCs is still reachable, which suggests a leak.', 2),
      point('evidence', 'Collect GC logs and heap dumps, compare dominators/retained size', ['gc log', '-xlog:gc', 'heap ?dump', 'dominator', 'retained', '\\bmat\\b', 'jcmd', 'jfr', 'flight recorder'], 'Gather evidence: GC logs (-Xlog:gc*), JFR, heap dumps compared over time.', 2),
      point('causes', 'Typical causes: static collections, unbounded caches, listeners, ThreadLocal, class loader leaks', ['static (map|collection|list|field)', 'unbounded', 'cache', 'listener', 'threadlocal', 'class ?loader'], 'Name typical leak sources: static maps, unbounded caches, unremoved listeners, ThreadLocals.', 2),
      point('g1', 'G1 is the default, balanced collector with pause-time goals', ['\\bg1\\b', 'garbage[- ]first'], 'Mention G1 as the default and what it optimises for.'),
      point('zgc', 'ZGC/Shenandoah for very low pause times on large heaps', ['zgc', 'shenandoah', 'sub[- ]?millisecond', 'low[- ]latency'], 'Mention ZGC (generational since 21) for low-latency needs.', 2),
      point('parallel', 'Parallel GC for maximum throughput when pauses do not matter', ['parallel (gc|collector)', 'throughput'], 'Mention Parallel GC for batch/throughput workloads.'),
      point('fix-first', 'Fix the leak before tuning; a bigger heap only delays the failure', ['fix the leak', 'bigger heap', 'more memory (only|just)', 'delay', 'tuning (will not|won\'t|does not)', 'not a gc problem'], 'Say that changing the collector or heap size does not fix a leak.'),
    ],
    misconceptions: [
      { id: 'no-leaks', pattern: '(java|the jvm) (cannot|can\'t|can never) (have|leak)', correction: 'Java can leak: any object that stays reachable (static maps, caches, listeners) is never collected.' },
      { id: 'system-gc', pattern: 'call(ing)? system\\.gc\\(\\) (fixes|solves|will fix)', correction: 'System.gc() cannot free reachable objects; it only triggers a collection (and may be ignored).' },
    ],
    modelAnswer:
      'Old-gen usage that keeps rising even after full GCs means the live set is growing: objects stay reachable, so this is a leak, not a collector problem. I would enable GC logging (-Xlog:gc*), record a JFR session, and take two heap dumps some time apart with jcmd GC.heap_dump, then compare dominators and retained size in Eclipse MAT. Typical culprits are static maps, unbounded caches without eviction, listeners that are never removed, ThreadLocals on pooled threads and class loader leaks after redeploys. Fix the leak first; a bigger heap only delays the failure. For the collector: G1 is the default and a good balance of throughput and pause-time goals; ZGC (generational in Java 21) or Shenandoah give sub-millisecond pauses on large heaps for latency-sensitive services; Parallel GC maximises throughput for batch jobs where pauses do not matter. The 2-second pauses are likely full GCs caused by the leak itself.',
    followUps: ['How do weak references help with caches?', 'What does a "humongous allocation" mean in G1?', 'How would you set heap size for a container?'],
  },
  {
    id: 'iq-a-out-class-init',
    moduleId: 'jvm-runtime',
    lessonIds: ['r-class-loading'],
    kind: 'output',
    difficulty: 'advanced',
    prompt: 'When is the nested class initialised? What does this program print?',
    code: `public class Main {
    static class Holder {
        static { System.out.println("Holder init"); }
        static final int CONST = 42;
        static int value = 7;
    }

    public static void main(String[] args) {
        System.out.println("start");
        System.out.println(Holder.CONST);
        System.out.println(Holder.value);
    }
}`,
    options: [
      { id: 'a', text: 'Holder init\nstart\n42\n7' },
      { id: 'b', text: 'start\nHolder init\n42\n7' },
      { id: 'c', text: 'start\n42\nHolder init\n7' },
      { id: 'd', text: 'start\n42\n7' },
    ],
    correctOptionId: 'c',
    explanation:
      'Classes are initialised lazily, on first active use. CONST is a compile-time constant (static final primitive with a constant initialiser), so javac inlines 42 into Main and reading it does not touch Holder. Reading the non-constant static field value is an active use, which triggers the static initialiser just before 7 is printed.',
    modelAnswer: '"start", "42", "Holder init", "7": compile-time constants are inlined by javac and do not trigger initialisation; the first access to a non-constant static field does.',
    followUps: ['Which actions count as an "active use" that triggers initialisation?', 'How does the initialisation-on-demand holder idiom use this for lazy singletons?'],
  },
  {
    id: 'iq-a-ncdfe-after-init',
    moduleId: 'jvm-runtime',
    lessonIds: ['r-class-loading'],
    kind: 'debugging',
    difficulty: 'advanced',
    prompt: 'The first request after startup logs ExceptionInInitializerError from `Config.<clinit>`. Every later request fails with `NoClassDefFoundError: Could not initialize class Config`, although config.jar is on the classpath. What is going on?',
    code: `public final class Config {
    static final Properties PROPS = load();

    private static Properties load() {
        String url = System.getenv("CONFIG_URL");   // null in this environment
        return fetch(url.trim());                    // NullPointerException
    }
}`,
    options: [
      { id: 'a', text: 'config.jar is missing at runtime; add it to the classpath' },
      { id: 'b', text: 'The static initialiser threw, so the class is marked as failed; the JVM never retries it and reports NoClassDefFoundError afterwards. Fix the root cause shown in the first ExceptionInInitializerError (the missing CONFIG_URL)' },
      { id: 'c', text: 'Two class loaders loaded Config, causing a ClassCastException that is reported as NoClassDefFoundError' },
      { id: 'd', text: 'Class.forName("Config") failed, which is a ClassNotFoundException; catch it and retry' },
    ],
    correctOptionId: 'b',
    explanation:
      'When a static initialiser throws, the first access gets ExceptionInInitializerError wrapping the cause, and the class is left in an erroneous state. The JVM does not run <clinit> again, so every later access throws NoClassDefFoundError "Could not initialize class". The jar is fine; the real cause is in the first error (here the NullPointerException from the missing environment variable). Since Java 17 the later NoClassDefFoundError also carries the original ExceptionInInitializerError as its cause.',
    modelAnswer:
      'The class was found, but its static initialiser failed. The first access throws ExceptionInInitializerError; afterwards the class is in an erroneous state and each use throws NoClassDefFoundError: Could not initialize class. Search the logs for the first error, fix the missing CONFIG_URL, and avoid doing fallible I/O in static initialisers (load configuration explicitly at startup and fail fast).',
    followUps: ['How does this differ from ClassNotFoundException?', 'Why is heavy work in static initialisers risky?'],
  },

  // ------------------------------------------------------------ concurrency
  {
    id: 'iq-a-sync-volatile-atomic',
    moduleId: 'concurrency',
    lessonIds: ['cc-synchronization', 'cc-concurrency-utilities'],
    kind: 'conceptual',
    difficulty: 'intermediate',
    prompt: 'Compare synchronized, volatile and the atomic classes. Where does happens-before come in, and when would you use each?',
    rubric: [
      point('sync', 'synchronized gives mutual exclusion and visibility (monitor lock)', ['synchronized.{0,80}(mutual exclusion|one thread at a time|lock|monitor|atomic)', 'mutual exclusion'], 'Explain that synchronized provides mutual exclusion plus visibility.', 2),
      point('volatile', 'volatile guarantees visibility and ordering but not atomicity of compound actions', ['volatile.{0,80}(visib|ordering|reorder)', 'not atomic', 'count\\+\\+', 'read-modify-write', 'compound'], 'Explain that volatile gives visibility/ordering, but i++ on a volatile is still a race.', 2),
      point('atomic', 'Atomic classes use lock-free CAS for single-variable atomic updates', ['\\bcas\\b', 'compare[- ]and[- ](set|swap)', 'lock[- ]free', 'atomicinteger', 'atomiclong', 'incrementandget'], 'Explain atomics: lock-free compare-and-set on a single variable.', 2),
      point('hb', 'Happens-before: unlock -> later lock, volatile write -> later read, thread start/join', ['happens[- ]before'], 'Define happens-before: the rule that guarantees one action\'s writes are visible to another.', 2),
      point('choose', 'Choosing: flag -> volatile, counter -> atomic/LongAdder, invariant across fields -> lock', ['flag', 'longadder', 'invariant', 'several (fields|variables)', 'multiple (fields|variables)', 'counter'], 'Give a decision rule with concrete examples (flags, counters, multi-field invariants).'),
    ],
    misconceptions: [
      { id: 'volatile-atomic', pattern: 'volatile (makes|guarantees|ensures) (the )?(increment|\\+\\+|operations?) atomic', correction: 'volatile does not make read-modify-write operations such as count++ atomic.' },
      { id: 'atomics-lock', pattern: 'atomic(s| classes) (use|take|acquire) (a )?(lock|synchronized)', correction: 'Atomic classes use hardware compare-and-set, not locks.' },
    ],
    modelAnswer:
      'synchronized acquires a monitor lock, so it gives mutual exclusion (one thread at a time in the critical section) and visibility: an unlock happens-before every later lock of the same monitor. volatile gives visibility and ordering only: a volatile write happens-before every subsequent read of that variable, but count++ on a volatile is still a read-modify-write race, so it is not atomic. Atomic classes such as AtomicInteger use lock-free compare-and-set (CAS) to update a single variable atomically, e.g. incrementAndGet. Happens-before is the Java Memory Model rule set that says when writes by one thread are guaranteed visible to another; besides locks and volatile it covers Thread.start, Thread.join and the java.util.concurrent hand-offs. In practice: a stop flag -> volatile; a counter -> AtomicLong or LongAdder under heavy contention; an invariant spanning several fields -> a lock (synchronized or ReentrantLock).',
    followUps: ['Why does double-checked locking need volatile?', 'When is LongAdder better than AtomicLong?', 'What does ReentrantLock add over synchronized?'],
  },
  {
    id: 'iq-a-deadlock',
    moduleId: 'concurrency',
    lessonIds: ['cc-synchronization', 'cc-concurrency-utilities'],
    kind: 'scenario',
    difficulty: 'advanced',
    prompt: 'A payment service stops processing transfers. CPU is near zero and the request threads never finish. How do you confirm a deadlock and how do you fix and prevent it?',
    rubric: [
      point('dump', 'Take thread dumps (jstack / jcmd Thread.print / JFR)', ['thread ?dump', 'jstack', 'jcmd', 'thread\\.print', 'threadmxbean', 'jconsole', 'visualvm'], 'Start with evidence: take a few thread dumps with jstack or jcmd Thread.print.', 2),
      point('read', 'Look for BLOCKED threads waiting on locks held by each other ("Found one Java-level deadlock")', ['blocked', 'found one java-level deadlock', 'waiting to lock', 'cycle', 'each other'], 'Explain what to look for: BLOCKED threads in a waiting cycle; the JVM even prints "Found one Java-level deadlock".', 2),
      point('order', 'Fix: acquire locks in a consistent global order (e.g. by account id)', ['lock order', 'same order', 'consistent order', 'global order', 'order(ing)? (of|the) locks', 'by (account )?id'], 'Give the classic fix: always acquire the locks in the same global order.', 2),
      point('trylock', 'Alternatives: tryLock with timeout, fewer/coarser locks, avoid calling out while holding a lock', ['trylock', 'timeout', 'single lock', 'coarser', 'alien method', 'calling out', 'holding a lock'], 'Mention tryLock with timeout and not calling foreign code while holding a lock.'),
      point('conditions', 'Coffman conditions: mutual exclusion, hold and wait, no preemption, circular wait', ['circular wait', 'hold and wait', 'coffman', 'no preemption'], 'Name the deadlock conditions; breaking circular wait is what lock ordering does.'),
    ],
    misconceptions: [
      { id: 'jvm-resolves', pattern: 'jvm (automatically )?(detects and )?(resolves|breaks|recovers from) (the )?deadlock', correction: 'The JVM can report a deadlock in a thread dump, but it never resolves one; the threads stay blocked until restart.' },
      { id: 'volatile-fix', pattern: '(making|make|use) .{0,30}volatile (fixes|solves|prevents) (the )?deadlock', correction: 'volatile has nothing to do with lock acquisition; it cannot prevent deadlocks.' },
    ],
    modelAnswer:
      'Low CPU with stuck threads suggests threads are waiting rather than working. I take two or three thread dumps a few seconds apart with jcmd <pid> Thread.print (or jstack). In a deadlock the JVM prints "Found one Java-level deadlock" and shows threads BLOCKED, each waiting to lock a monitor held by the other: a cycle. For transfers, the classic cause is transfer(a, b) locking a then b while transfer(b, a) locks b then a. The fix is to acquire locks in a consistent global order, for example by account id, which breaks the circular-wait condition (the other Coffman conditions are mutual exclusion, hold and wait and no preemption). Alternatives are ReentrantLock.tryLock with a timeout and retry, using a single coarser lock, and never calling out to foreign code while holding a lock. To prevent regressions I would add a stress test and alert on threads stuck in BLOCKED state.',
    followUps: ['How would a livelock look different in a thread dump?', 'Do database deadlocks show up in a Java thread dump?', 'How does ThreadMXBean.findDeadlockedThreads help monitoring?'],
  },
  {
    id: 'iq-a-out-completable',
    moduleId: 'concurrency',
    lessonIds: ['cc-completablefuture'],
    kind: 'output',
    difficulty: 'advanced',
    prompt: 'Two async calls are combined, then a dependent async step fails. What does this print?',
    code: `import java.util.concurrent.CompletableFuture;

public class Main {
    public static void main(String[] args) {
        CompletableFuture<Integer> price = CompletableFuture.supplyAsync(() -> 10);
        CompletableFuture<Integer> tax = CompletableFuture.supplyAsync(() -> 2);

        String result = price.thenCombine(tax, Integer::sum)
            .thenCompose(total -> CompletableFuture.supplyAsync(() -> {
                if (total > 10) throw new IllegalStateException("too high: " + total);
                return "ok " + total;
            }))
            .exceptionally(ex -> "fallback " + ex.getClass().getSimpleName()
                + " / " + ex.getCause().getMessage())
            .join();

        System.out.println(result);
    }
}`,
    options: [
      { id: 'a', text: 'ok 12' },
      { id: 'b', text: 'fallback IllegalStateException / too high: 12' },
      { id: 'c', text: 'fallback CompletionException / too high: 12' },
      { id: 'd', text: 'Exception in thread "main" java.util.concurrent.CompletionException: java.lang.IllegalStateException: too high: 12' },
    ],
    correctOptionId: 'c',
    explanation:
      'thenCombine waits for both futures (10 + 2 = 12), thenCompose flattens the inner future, which fails. A failure that reaches a dependent stage is wrapped in CompletionException, so exceptionally sees CompletionException with the IllegalStateException as its cause. exceptionally recovers, so join() returns the fallback string instead of throwing.',
    modelAnswer: '"fallback CompletionException / too high: 12": thenCombine joins both results, thenCompose flattens the failing inner stage, and the failure arrives at exceptionally wrapped in CompletionException; unwrap getCause() before checking the type.',
    followUps: ['What is the difference between thenApply and thenCompose?', 'Which executor runs supplyAsync without an explicit executor, and why can that hurt?', 'How do orTimeout and completeOnTimeout differ?'],
  },
  {
    id: 'iq-a-chm-lost-update',
    moduleId: 'concurrency',
    lessonIds: ['cc-concurrency-utilities', 'cc-synchronization'],
    kind: 'debugging',
    difficulty: 'intermediate',
    prompt: 'Eight threads count page hits with this code. The map is a ConcurrentHashMap, yet the totals are lower than the number of requests. What is the best fix?',
    code: `private final Map<String, Integer> hits = new ConcurrentHashMap<>();

void record(String page) {
    if (!hits.containsKey(page)) {
        hits.put(page, 0);
    }
    hits.put(page, hits.get(page) + 1);
}`,
    options: [
      { id: 'a', text: 'Replace ConcurrentHashMap with Collections.synchronizedMap(new HashMap<>())' },
      { id: 'b', text: 'Use hits.merge(page, 1, Integer::sum) (or a ConcurrentHashMap<String, LongAdder> with computeIfAbsent(page, k -> new LongAdder()).increment())' },
      { id: 'c', text: 'Declare the map field volatile' },
      { id: 'd', text: 'Use hits.putIfAbsent(page, 0) instead of the containsKey check and keep the rest' },
    ],
    correctOptionId: 'b',
    explanation:
      'Each ConcurrentHashMap call is thread-safe on its own, but get-then-put is a compound check-then-act: two threads read 5 and both write 6. merge (or compute) performs the read-modify-write atomically for the key; LongAdder scales best under heavy contention. A synchronizedMap has the same compound-action race, volatile only affects the reference, and putIfAbsent fixes only the first half.',
    modelAnswer: 'ConcurrentHashMap makes individual operations atomic, not sequences of them. The get + put increment loses updates when threads interleave. Use the atomic per-key operations merge/compute, or store LongAdder values and increment them.',
    followUps: ['Why does ConcurrentHashMap reject null keys and values?', 'Can a compute function call back into the same map?'],
  },

  // ------------------------------------------------------------ io
  {
    id: 'iq-a-io-vs-nio-threads',
    moduleId: 'io',
    lessonIds: ['io-nio-sockets', 'cc-threads'],
    kind: 'scenario',
    difficulty: 'advanced',
    prompt: 'You need a TCP gateway that holds 20,000 mostly idle client connections. Compare classic blocking java.io with a platform thread per connection, NIO with a Selector, and blocking I/O on virtual threads (Java 21). What would you pick?',
    rubric: [
      point('blocking', 'Classic java.io is stream-oriented and blocking: one thread per connection', ['blocking', 'thread[- ]per[- ]connection', 'one thread (per|for each)'], 'Describe classic I/O: blocking streams, one thread per connection.', 2),
      point('platform-cost', 'Platform threads are expensive (OS threads, ~1 MB stacks, context switches)', ['os thread', 'native thread', 'stack', 'context switch', 'expensive', 'memory per thread'], 'Explain why 20,000 platform threads hurt: each is an OS thread with its own stack.', 2),
      point('nio', 'NIO: non-blocking channels, buffers and a Selector multiplexing many connections on few threads', ['selector', 'non[- ]blocking', 'multiplex', 'channel', 'bytebuffer', 'event loop'], 'Explain NIO: non-blocking channels and buffers, a Selector watching many channels from one thread.', 2),
      point('nio-cost', 'NIO is harder: partial reads/writes, buffer state, callback/state-machine code', ['partial (read|write)', 'flip', 'state machine', 'complex', 'harder', 'netty'], 'Mention the cost of NIO: partial reads, buffer flips and state machines (or a framework such as Netty).'),
      point('virtual', 'Virtual threads let simple blocking code scale: they unmount while blocked', ['virtual thread', 'unmount', 'carrier'], 'Bring in virtual threads: blocking code that scales because blocked virtual threads unmount from carriers.', 2),
      point('choice', 'Recommendation with trade-offs (virtual threads by default; NIO/Netty for extreme scale or protocol control)', ['i would (pick|choose|use|go)', 'recommend', 'my choice', 'default to'], 'Finish with a clear recommendation and when you would change it.'),
    ],
    misconceptions: [
      { id: 'nio-faster-always', pattern: 'nio is always faster', correction: 'NIO improves scalability for many connections; for a few busy connections blocking I/O can be just as fast or faster.' },
      { id: 'vt-non-blocking', pattern: 'virtual threads (make|turn) (the )?(code|i/?o) non[- ]blocking', correction: 'The code still blocks; the JVM unmounts the virtual thread so the carrier platform thread is freed.' },
    ],
    modelAnswer:
      'Classic java.io is stream-oriented and blocking, so the natural design is one thread per connection. With platform threads that means 20,000 OS threads, each with its own stack (around 1 MB reserved) plus scheduler and context-switch overhead, mostly sitting idle: it does not scale well. NIO uses non-blocking channels and ByteBuffers; a Selector multiplexes thousands of connections onto a few event-loop threads, which scales very well but is harder to write: partial reads and writes, buffer flip/compact and per-connection state machines, which is why people use Netty. Since Java 21, virtual threads give a third option: keep simple blocking code, one virtual thread per connection; when a virtual thread blocks on a socket it unmounts from its carrier, so 20,000 of them are cheap. I would choose virtual threads with blocking sockets by default for readability, and move to NIO or Netty only if I need extreme scale, fine-grained backpressure or protocol features that the framework already provides.',
    followUps: ['What do flip() and compact() do on a ByteBuffer?', 'How do you limit how many connections hit a downstream database with virtual threads?', 'What is pinning, and why did it matter before Java 24?'],
  },
  {
    id: 'iq-a-serialization-risks',
    moduleId: 'io',
    lessonIds: ['io-serialization'],
    kind: 'conceptual',
    difficulty: 'advanced',
    prompt: 'Why do many teams forbid Java native serialization (ObjectInputStream) for data from the network? What would you use instead?',
    rubric: [
      point('rce', 'Deserializing untrusted data can run code (gadget chains, remote code execution)', ['remote code execution', '\\brce\\b', 'gadget', 'arbitrary code', 'execute code'], 'Name the main risk: gadget chains leading to remote code execution.', 2),
      point('before-cast', 'readObject instantiates objects and runs their hooks before your cast/validation', ['before (the |your )?(cast|validation|check)', 'readobject', 'magic method', 'hooks?', 'constructor (is )?(bypass|not (run|called))'], 'Explain that the damage happens inside readObject, before your code can validate the type.', 2),
      point('dos', 'Denial of service through huge or deeply nested graphs', ['denial of service', '\\bdos\\b', 'deeply nested', 'billion', 'memory exhaustion', 'huge (object )?graph'], 'Mention resource-exhaustion attacks.'),
      point('filter', 'If unavoidable: ObjectInputFilter allowlists and limits (JEP 290/415)', ['objectinputfilter', 'serialization filter', 'jdk\\.serialfilter', 'allow ?list', 'whitelist', 'jep 290'], 'Mention ObjectInputFilter with an allowlist and depth/size limits.', 2),
      point('versioning', 'Brittle versioning (serialVersionUID, exposes private fields)', ['serialversionuid', 'invalidclassexception', 'version', 'private fields', 'encapsulation'], 'Mention the maintenance problems: serialVersionUID and leaking internal representation.'),
      point('alternative', 'Use data formats: JSON (Jackson), Protobuf, records with explicit schemas', ['json', 'jackson', 'protobuf', 'protocol buffers', 'avro', 'schema'], 'Suggest a data format such as JSON or Protobuf mapped onto records/DTOs.', 2),
    ],
    misconceptions: [
      { id: 'transient-secure', pattern: 'transient (makes|keeps) (it|deserialization|serialization) (safe|secure)', correction: 'transient only omits fields from the stream; it does not protect deserialization of untrusted input.' },
      { id: 'final-class-safe', pattern: 'checking the type after (readobject|deserializ\\w*) (makes it|is) safe', correction: 'The cast happens after readObject has already built the graph and run its hooks; validate with a filter instead.' },
    ],
    modelAnswer:
      'ObjectInputStream.readObject reconstructs whatever object graph the stream describes, from any Serializable class on the classpath, and runs hooks such as readObject and readResolve while doing it, all before your cast or validation. Attackers chain such hooks in common libraries into gadget chains that achieve remote code execution, and they can also cause denial of service with huge or deeply nested graphs. It is also brittle: serialVersionUID mismatches give InvalidClassException and the stream exposes private fields, breaking encapsulation. If you truly must accept it, install an ObjectInputFilter (JEP 290, or a JVM-wide filter via jdk.serialFilter) with an allowlist of classes and limits on depth and array size. Better, exchange data in an explicit format: JSON with Jackson, or Protobuf/Avro with a schema, mapped onto records or DTOs that you validate.',
    followUps: ['How do records change how deserialization works?', 'What does a serialization proxy pattern protect against?'],
  },
  {
    id: 'iq-a-out-twr-order',
    moduleId: 'io',
    lessonIds: ['io-files'],
    kind: 'output',
    difficulty: 'intermediate',
    prompt: 'Both resources fail when closed and the body throws. What does this print?',
    code: `import java.io.IOException;

public class Main {
    static class FileRes implements AutoCloseable {
        private final String name;
        FileRes(String name) {
            this.name = name;
            System.out.println("open " + name);
        }
        @Override
        public void close() throws IOException {
            System.out.println("close " + name);
            throw new IOException("close failed: " + name);
        }
    }

    public static void main(String[] args) {
        try (FileRes in = new FileRes("in.txt"); FileRes out = new FileRes("out.txt")) {
            throw new IllegalStateException("copy failed");
        } catch (Exception e) {
            System.out.println(e.getMessage() + " suppressed=" + e.getSuppressed().length);
        } finally {
            System.out.println("finally");
        }
    }
}`,
    options: [
      { id: 'a', text: 'open in.txt\nopen out.txt\nclose out.txt\nclose in.txt\ncopy failed suppressed=2\nfinally' },
      { id: 'b', text: 'open in.txt\nopen out.txt\nclose in.txt\nclose out.txt\ncopy failed suppressed=2\nfinally' },
      { id: 'c', text: 'open in.txt\nopen out.txt\nclose out.txt\nclose in.txt\nclose failed: in.txt suppressed=1\nfinally' },
      { id: 'd', text: 'open in.txt\nopen out.txt\ncopy failed suppressed=0\nclose out.txt\nclose in.txt\nfinally' },
    ],
    correctOptionId: 'a',
    explanation:
      'Resources close in reverse order of declaration, before the catch block runs. The body\'s exception stays the primary one; both close() failures are added to it as suppressed exceptions. finally runs last.',
    modelAnswer: 'Opened in order, closed in reverse (out.txt, then in.txt) before catch runs; the original "copy failed" is kept and the two close failures are attached as suppressed exceptions, then finally runs.',
    followUps: ['Why must a FileWriter/BufferedWriter be closed before reading the file back?', 'What happens if the second resource\'s constructor throws?'],
  },
  {
    id: 'iq-a-files-lines-leak',
    moduleId: 'io',
    lessonIds: ['io-files'],
    kind: 'debugging',
    difficulty: 'intermediate',
    prompt: 'A log-scanning job runs this for thousands of files and after a while fails with `java.nio.file.FileSystemException: ... Too many open files`. What is the cause and the fix?',
    code: `long countErrors(Path file) throws IOException {
    return Files.lines(file)
                .filter(line -> line.contains("ERROR"))
                .count();
}`,
    options: [
      { id: 'a', text: 'Files.lines reads the whole file into memory; switch to Files.readAllLines' },
      { id: 'b', text: 'The stream returned by Files.lines holds an open file handle until it is closed; wrap it in try-with-resources: try (Stream<String> lines = Files.lines(file)) { ... }' },
      { id: 'c', text: 'The terminal operation count() closes the file, so the leak must be elsewhere' },
      { id: 'd', text: 'Raise the OS open-file limit (ulimit -n); the code is correct' },
    ],
    correctOptionId: 'b',
    explanation:
      'Files.lines is lazy and backed by an open channel. Terminal operations do not close a stream; only close() does, and the garbage collector does not close it in time. Each call leaks a file descriptor until the process hits its limit. try-with-resources closes it on every path. readAllLines would close the file but load everything into memory; raising ulimit only delays the failure.',
    modelAnswer: 'Files.lines (like Files.list, Files.walk and Files.newBufferedReader) returns a resource that must be closed. count() consumes the stream but does not close it, so every call leaks a descriptor. Use try-with-resources around the stream.',
    followUps: ['Which other Files methods return streams that must be closed?', 'How would you spot leaked descriptors on a running JVM?'],
  },

  // ------------------------------------------------------------ jdbc
  {
    id: 'iq-a-prepared-statement',
    moduleId: 'jdbc',
    lessonIds: ['j-jdbc'],
    kind: 'conceptual',
    difficulty: 'intermediate',
    prompt: 'Why should you use PreparedStatement instead of building SQL strings? How exactly does it prevent SQL injection, and what can it not parameterise?',
    rubric: [
      point('injection', 'String concatenation lets input change the SQL structure (SQL injection)', ['sql injection', 'inject', "' or '1'='1", 'or 1=1', 'change the (query|sql|structure)'], 'Describe the attack: concatenated input can change the query itself.', 2),
      point('binding', 'Placeholders (?) are bound as data, never parsed as SQL', ['placeholder', '\\?', 'bind', 'setstring', 'setlong', 'as data', 'never (parsed|interpreted)'], 'Explain the mechanism: ? placeholders are bound as values and never parsed as SQL.', 2),
      point('precompiled', 'Statement can be precompiled / plan cached and reused', ['precompil', 'pre-compil', 'execution plan', 'plan cach', 'statement cach', 'reuse'], 'Mention the performance side: the statement can be prepared once and reused.'),
      point('identifiers', 'Cannot bind table/column names or ORDER BY direction: use an allowlist', ['identifier', 'table name', 'column name', 'order by', 'allow ?list', 'whitelist'], 'Point out that identifiers cannot be parameters; validate them against an allowlist.', 2),
      point('types', 'Typed setters handle escaping, dates, nulls correctly', ['setnull', 'setobject', 'typed', 'escap', 'date', 'type conversion'], 'Mention typed setters (setObject, setNull) and correct type handling.'),
    ],
    misconceptions: [
      { id: 'escape-enough', pattern: 'escaping (quotes )?(is|would be) (enough|sufficient)', correction: 'Manual escaping is error-prone (encodings, database-specific rules); bind parameters instead.' },
      { id: 'bind-table', pattern: '(you can|can be used to) (bind|parameteri[sz]e) (the )?(table|column) names?', correction: 'Placeholders can only stand for values, not identifiers such as table or column names.' },
    ],
    modelAnswer:
      'With string concatenation, user input becomes part of the SQL text, so input like \' OR \'1\'=\'1 can change the structure of the query: that is SQL injection. A PreparedStatement sends the SQL with ? placeholders first, and the values are bound separately with setString, setLong or setObject; the driver and database treat them as data, never parsed as SQL, so they cannot change the query. Typed setters also handle dates, setNull and type conversion correctly. As a bonus, the statement can be precompiled and its execution plan cached and reused. Placeholders only stand for values, though: table names, column names and ORDER BY direction are identifiers and cannot be bound, so validate those against an allowlist of known values.',
    followUps: ['How do you write an IN clause with a variable number of values?', 'Can stored procedures still be vulnerable to injection?'],
  },
  {
    id: 'iq-a-isolation-anomalies',
    moduleId: 'jdbc',
    lessonIds: ['j-transactions'],
    kind: 'internals',
    difficulty: 'advanced',
    prompt: 'Explain the transaction isolation levels and the anomalies each one allows. Which level would you use for a "reserve the last seat" feature?',
    rubric: [
      point('dirty', 'Dirty read: seeing uncommitted data (READ UNCOMMITTED)', ['dirty read', 'uncommitted'], 'Define dirty reads.', 2),
      point('nonrepeatable', 'Non-repeatable read: re-reading a row gives a different value (READ COMMITTED)', ['non[- ]?repeatable', 'read committed'], 'Define non-repeatable reads and say READ COMMITTED allows them.', 2),
      point('phantom', 'Phantom read: a re-run range query returns new rows (REPEATABLE READ)', ['phantom', 'repeatable read'], 'Define phantoms and where they are prevented.', 2),
      point('serializable', 'SERIALIZABLE prevents all, at the cost of locking/aborts and retries', ['serializable', 'serialization failure', 'retry'], 'Describe SERIALIZABLE and its cost (aborts that require retries).', 2),
      point('lost-update', 'Lost update / write skew need explicit handling: SELECT ... FOR UPDATE, optimistic version column, or atomic UPDATE with a condition', ['lost update', 'write skew', 'for update', 'optimistic', 'version column', 'where (seats|available|stock)'], 'Address the actual seat problem: lost updates need row locks, optimistic versioning or a conditional UPDATE.', 2),
      point('defaults', 'Defaults differ (PostgreSQL/Oracle READ COMMITTED, MySQL InnoDB REPEATABLE READ); MVCC', ['default', 'postgres', 'mysql', 'innodb', 'mvcc', 'snapshot'], 'Mention database defaults and MVCC snapshots.'),
    ],
    misconceptions: [
      { id: 'rc-no-lost', pattern: 'read committed (prevents|stops|avoids) lost updates', correction: 'READ COMMITTED does not prevent lost updates; use SELECT ... FOR UPDATE, optimistic locking or a conditional UPDATE.' },
      { id: 'serializable-free', pattern: 'serializable (has|with) no (cost|downside|overhead)', correction: 'SERIALIZABLE costs throughput and causes serialization failures that must be retried.' },
    ],
    modelAnswer:
      'The SQL standard defines four levels. READ UNCOMMITTED allows dirty reads, i.e. seeing another transaction\'s uncommitted changes. READ COMMITTED prevents dirty reads but allows non-repeatable reads: reading the same row twice can return different committed values. REPEATABLE READ keeps rows you read stable but the standard still allows phantom reads, where re-running a range query returns new rows (MVCC snapshot implementations such as PostgreSQL also prevent phantoms). SERIALIZABLE behaves as if transactions ran one at a time, at the cost of locking or serialization failures that the application must retry. Defaults differ: PostgreSQL and Oracle use READ COMMITTED, MySQL InnoDB uses REPEATABLE READ. For "reserve the last seat" the danger is a lost update or write skew: two transactions both read "1 seat left" and both book it. I would keep READ COMMITTED and make the write itself safe: an atomic conditional UPDATE seats SET available = available - 1 WHERE id = ? AND available > 0 and check the update count, or SELECT ... FOR UPDATE, or an optimistic version column; SERIALIZABLE with retry also works.',
    followUps: ['What is write skew, and which levels allow it?', 'How does optimistic locking with a version column work in JPA?'],
  },
  {
    id: 'iq-a-connection-pool',
    moduleId: 'jdbc',
    lessonIds: ['j-jdbc', 'j-transactions'],
    kind: 'scenario',
    difficulty: 'advanced',
    prompt: 'Under load your service logs `Connection is not available, request timed out after 30000ms` from HikariCP, while the database CPU is low. What is going on and what do you change?',
    rubric: [
      point('why-pool', 'Pools reuse expensive physical connections; callers wait when all are borrowed', ['reuse', 'expensive', 'borrow', 'all connections (are )?(in use|busy|taken)', 'exhaust'], 'Explain what the error means: every connection is borrowed and callers time out waiting.', 2),
      point('leak', 'Connection leak: connections not closed on every path (use try-with-resources; leakDetectionThreshold)', ['leak', 'not closed', 'never closed', 'leakdetectionthreshold', 'try[- ]with[- ]resources'], 'Check for leaks: connections not returned; use try-with-resources and Hikari\'s leakDetectionThreshold.', 2),
      point('long-tx', 'Connections held too long: slow external calls inside transactions, long queries, N+1', ['inside (the |a )?transaction', 'long[- ]running', 'held (too long|for)', 'slow (http|remote|external)', 'n\\+1'], 'Look for connections held too long, e.g. an HTTP call made inside a transaction.', 2),
      point('size', 'Pool size should be small and bounded (cores-based), not raised blindly; bulkhead with threads', ['pool size', 'maximumpoolsize', 'bigger pool', 'increase the pool', 'cores', 'bounded', 'semaphore'], 'Discuss sizing: a bigger pool is rarely the fix; databases do best with a small pool.'),
      point('metrics', 'Use pool metrics: active, idle, pending, acquire time, usage time', ['metric', 'active', 'pending', 'idle', 'acquire time', 'usage time', 'micrometer'], 'Name the pool metrics you would look at.', 2),
    ],
    misconceptions: [
      { id: 'bigger-always', pattern: '(just|simply) (increase|raise|double) the pool size', correction: 'Raising the pool size hides leaks and long-held connections, and too many connections slow the database down.' },
      { id: 'gc-closes', pattern: 'garbage collector (will )?(closes?|returns?) (the )?connections?', correction: 'Connections are not reliably closed by the GC; close them explicitly with try-with-resources.' },
    ],
    modelAnswer:
      'A connection pool such as HikariCP keeps a bounded set of expensive physical connections and lends them out for reuse. The error means every connection is borrowed and requests waited 30 seconds for one; with low database CPU, the database is not the bottleneck, so connections are being held, not used. First I look at pool metrics (active, idle, pending threads, acquire time and usage time via Micrometer). Typical causes: a connection leak where some path never closes the connection (fix with try-with-resources everywhere and turn on leakDetectionThreshold to log the borrowing stack trace); connections held too long, for example a slow external HTTP call made inside a transaction, long-running queries or N+1 loops. Fix those before touching size: the pool size should stay small and bounded, roughly based on database cores, and if many more threads (for example virtual threads) need the database, bound them with a semaphore rather than raising maximumPoolSize.',
    followUps: ['How would you size the pool for a 4-core database?', 'Why should you not call remote services inside a @Transactional method?'],
  },
  {
    id: 'iq-a-n-plus-one',
    moduleId: 'jdbc',
    lessonIds: ['j-jdbc'],
    kind: 'debugging',
    difficulty: 'intermediate',
    prompt: 'The orders page takes 4 seconds for a customer with 300 orders. The SQL log shows 301 nearly identical queries. What is the best fix?',
    code: `List<Order> orders = orderDao.findByCustomer(customerId);      // 1 query
for (Order order : orders) {
    List<Line> lines = lineDao.findByOrderId(order.id());      // 1 query per order
    order.setLines(lines);
}`,
    options: [
      { id: 'a', text: 'Add an index on lines.order_id; the queries are just slow' },
      { id: 'b', text: 'Load all lines in one query (JOIN, or WHERE order_id IN (...) / = ANY(?)) and group them by order id in memory; in JPA use a fetch join or batch fetching' },
      { id: 'c', text: 'Run the 300 queries in parallel on a thread pool' },
      { id: 'd', text: 'Cache each Order object in a static HashMap' },
    ],
    correctOptionId: 'b',
    explanation:
      'This is the N+1 query problem: one query for the parents plus one per child collection. Each round trip costs network latency, so 301 small queries are slow even when each is indexed. Fetching all lines in one query (a join or an IN/ANY list) and grouping them in memory makes it 1 or 2 queries. Parallel queries just move the load onto the pool and database; a static map is an unbounded cache with stale data.',
    modelAnswer: 'N+1: one query for orders plus one per order. Replace the loop with a single query for all the lines (JOIN or IN/ANY over the order ids) and group them by order id; in JPA use JOIN FETCH, an entity graph or batch fetching.',
    followUps: ['How would you detect N+1 queries automatically in tests?', 'Why can JOIN FETCH with pagination be a problem?'],
  },

  // ------------------------------------------------------------ testing
  {
    id: 'iq-a-unit-vs-integration',
    moduleId: 'testing',
    lessonIds: ['ts-junit', 'ts-mocking'],
    kind: 'conceptual',
    difficulty: 'intermediate',
    prompt: 'What is the difference between unit tests and integration tests? How would you balance them for a service that talks to PostgreSQL and a payment API?',
    rubric: [
      point('unit', 'Unit tests: one class/behaviour in isolation, fast, deterministic, no real I/O', ['isolat', 'in memory', 'milliseconds', 'no (real )?(i/?o|database|network)', 'single (class|unit|behaviou?r)'], 'Define unit tests: small, isolated, fast and deterministic.', 2),
      point('integration', 'Integration tests exercise real collaborators: database, HTTP, serialization, framework wiring', ['real (database|db|postgres)', 'testcontainers', 'wiring', 'together', 'real (collaborators|dependencies|infrastructure)'], 'Define integration tests: real collaborators such as a real database, often via Testcontainers.', 2),
      point('catches', 'Each catches different bugs: logic vs SQL/mapping/configuration/contract mistakes', ['sql', 'mapping', 'configuration', 'contract', 'logic'], 'Say what each kind catches that the other misses.', 2),
      point('pyramid', 'Test pyramid: many unit tests, fewer integration, few end-to-end', ['pyramid', 'trophy', 'many unit', 'fewer integration', 'end[- ]to[- ]end'], 'Mention the pyramid (or trophy) proportions.'),
      point('external', 'External APIs: fake/stub at the boundary (WireMock) plus contract tests', ['wiremock', 'stub', 'fake', 'contract test', 'sandbox'], 'Explain how to test against an external payment API: a stub server such as WireMock or contract tests.'),
    ],
    misconceptions: [
      { id: 'h2-same', pattern: 'h2 (is|behaves) (the same as|exactly like|identical to) postgres', correction: 'In-memory databases differ in SQL dialect, locking and types; use Testcontainers with the real database for integration tests.' },
      { id: 'integration-only', pattern: 'unit tests are (useless|pointless|not needed)', correction: 'Unit tests give fast, precise feedback on logic; integration tests complement them rather than replace them.' },
    ],
    modelAnswer:
      'A unit test checks a single behaviour of one class in isolation: no real database or network, runs in milliseconds and is deterministic, so you can have thousands and they pinpoint logic bugs. An integration test exercises real collaborators together: the real PostgreSQL started with Testcontainers, the repository SQL and mapping, transaction boundaries, JSON serialization and framework wiring. Each catches different bugs: unit tests find logic errors, integration tests find wrong SQL, mapping and configuration mistakes and contract mismatches. I follow the test pyramid: many unit tests for the domain logic, fewer integration tests for the repository and HTTP layers, and very few end-to-end tests. The payment API is not mine, so I stub it at the boundary with WireMock (including error and timeout responses) and add contract tests or a sandbox check instead of calling the real provider in CI.',
    followUps: ['Why is H2 a poor substitute for PostgreSQL in tests?', 'How do you keep integration tests fast?'],
  },
  {
    id: 'iq-a-mocks-vs-fakes',
    moduleId: 'testing',
    lessonIds: ['ts-mocking'],
    kind: 'conceptual',
    difficulty: 'intermediate',
    prompt: 'Explain stubs, mocks and fakes. When do you prefer a fake over a Mockito mock, and what are the signs of over-mocking?',
    rubric: [
      point('stub', 'Stub: returns canned answers', ['stub.{0,60}(canned|return|predefined|hard[- ]?coded)', 'canned'], 'Define a stub: it returns canned answers.', 2),
      point('mock', 'Mock: records interactions so you can verify calls (behaviour verification)', ['mock.{0,80}(verif|interaction|expect|was called|records)', 'verify\\('], 'Define a mock: it records calls so the test can verify interactions.', 2),
      point('fake', 'Fake: a working lightweight implementation (in-memory repository)', ['fake.{0,80}(working|real|lightweight|simplified|in[- ]memory)', 'in[- ]memory (repository|implementation|store)'], 'Define a fake: a simplified but working implementation, e.g. an in-memory repository.', 2),
      point('state', 'Prefer state-based assertions on outcomes; fakes keep tests robust to refactoring', ['state[- ]based', 'outcome', 'refactor', 'implementation details', 'brittle'], 'Explain why fakes and state checks survive refactoring better than interaction checks.', 2),
      point('overmock', 'Over-mocking signs: mocking value objects or types you do not own, long when/verify chains, tests mirroring the implementation', ['don\'?t own', 'do not own', 'value objects?', 'mirror', 'too many mocks', 'verify every', 'long (chains?|setup)', 'over[- ]mock'], 'List over-mocking smells: mocking what you do not own, value objects, tests that mirror the code.'),
    ],
    misconceptions: [
      { id: 'same-thing', pattern: '(mocks|stubs) and (fakes|mocks) are (the same|identical)', correction: 'They differ: stubs return canned data, mocks verify interactions, fakes are working implementations.' },
      { id: 'mock-everything', pattern: '(you should|always) mock (every|all) (dependenc|collaborator)', correction: 'Mock at boundaries you need to control; use real objects for values and simple collaborators.' },
    ],
    modelAnswer:
      'A stub returns canned answers to calls so the code under test can proceed. A mock also records interactions, so the test can verify that a call happened, e.g. verify(mailer).send(...): behaviour verification. A fake is a working but lightweight implementation, like an in-memory repository backed by a HashMap. I prefer fakes for collaborators with state, such as repositories, because the test can assert on outcomes (state-based testing) and does not break when I refactor implementation details. I use Mockito mocks for side effects at the boundary where the interaction is the requirement, such as "an email is sent once". Over-mocking smells: mocking value objects or types you do not own, long when/verify chains, tests that mirror the implementation line by line, and tests that pass while the real wiring is broken.',
    followUps: ['Why is mocking a type you do not own (e.g. an HTTP client) risky?', 'What does a Mockito ArgumentCaptor give you?'],
  },
  {
    id: 'iq-a-flaky-tests',
    moduleId: 'testing',
    lessonIds: ['ts-junit', 'ts-debugging'],
    kind: 'scenario',
    difficulty: 'advanced',
    prompt: 'About 3% of CI runs fail in different tests that pass when re-run. How do you find the causes and make the suite reliable?',
    rubric: [
      point('reproduce', 'Reproduce: rerun in a loop, randomise/fix order, run in isolation vs whole suite, collect failure history', ['loop', 'repeat', '@repeatedtest', 'rerun', 're-run', 'history', 'isolation', 'random order', 'methodorderer'], 'Make it reproducible: run repeatedly, change test order, compare isolation vs the full suite.', 2),
      point('time', 'Time and timing: now(), time zones, sleeps instead of awaiting conditions', ['clock', 'now\\(\\)', 'time ?zone', 'thread\\.sleep', 'sleep', 'awaitility', 'timing'], 'Check time-dependence: inject a Clock, replace sleeps with condition polling (Awaitility).', 2),
      point('shared-state', 'Shared state between tests: static fields, database rows, files, ports, ordering assumptions', ['shared state', 'static', 'leftover', 'order[- ]dependent', 'test order', 'port', 'clean ?up', 'database rows'], 'Check shared state: statics, leftover data, files and ports that make tests order-dependent.', 2),
      point('async', 'Concurrency and async code, unordered collections (HashMap/HashSet order), randomness without a seed', ['async', 'concurren', 'race', 'hash ?(map|set) order', 'iteration order', 'seed', 'random'], 'Check concurrency, unordered collections and unseeded randomness.', 2),
      point('process', 'Process: quarantine/track flaky tests, fix root causes rather than auto-retrying forever', ['quarantine', 'track', 'owner', 'retr(y|ies) (hide|mask)', 'root cause', 'ticket'], 'Describe the process: quarantine with an owner, fix root causes; blind retries hide real bugs.'),
    ],
    misconceptions: [
      { id: 'retry-fix', pattern: 'just (add|enable) (automatic )?retries', correction: 'Automatic retries hide flakiness (and sometimes real race conditions); use them only as a temporary measure while fixing the root cause.' },
      { id: 'sleep-fix', pattern: '(increase|add|longer) (the )?(thread\\.)?sleep (fixes|solves|to fix)', correction: 'Longer sleeps slow the suite and still fail on slow machines; wait for a condition instead.' },
    ],
    modelAnswer:
      'First make the failures reproducible: collect the failure history from CI, rerun the suspect tests in a loop (@RepeatedTest or a script), run them in isolation versus the whole suite, and use a random MethodOrderer to expose order-dependence. Then go through the usual causes. Time: code calling now() or depending on the time zone, fixed by injecting a Clock; Thread.sleep used to wait for async work, replaced by polling for the condition with Awaitility. Shared state: static fields, leftover database rows, temp files or fixed ports that make tests order-dependent, fixed by proper clean up and isolated data. Concurrency and async races, assertions on HashMap or HashSet iteration order, and randomness without a fixed seed. Process-wise, quarantine a known flaky test with an owner and a ticket so it does not block everyone, and fix the root cause; blanket automatic retries hide flakiness and occasionally a real race condition in production code.',
    followUps: ['How would you test code that schedules work every five minutes?', 'When is a flaky test actually a production bug?'],
  },
  {
    id: 'iq-a-coverage-mutation',
    moduleId: 'testing',
    lessonIds: ['ts-code-quality', 'ts-junit'],
    kind: 'debugging',
    difficulty: 'advanced',
    prompt: 'JaCoCo reports 100% line and branch coverage for this class, yet PIT mutation testing reports a surviving mutant: "changed conditional boundary" on line 3. What does that tell you, and what is the right fix?',
    code: `class AgePolicy {
    boolean canRent(int age) {
        return age >= 21;
    }
}

@Test
void rentalAge() {
    assertTrue(new AgePolicy().canRent(30));
    assertFalse(new AgePolicy().canRent(16));
}`,
    options: [
      { id: 'a', text: 'PIT is wrong: 100% branch coverage proves the method is fully tested' },
      { id: 'b', text: 'Changing >= to > does not fail any test because the boundary is never tested; add cases for 20 and 21 (e.g. a @ParameterizedTest at the boundaries)' },
      { id: 'c', text: 'Add more tests with ages 40, 50 and 60 to raise confidence' },
      { id: 'd', text: 'Exclude AgePolicy from mutation testing; boundary mutants are always equivalent' },
    ],
    correctOptionId: 'b',
    explanation:
      'Coverage shows which code was executed, not whether the tests would notice a change. PIT mutates the code (here >= becomes >) and reruns the tests; since no test uses age 21, the mutant survives. Testing exactly at and just below the boundary (21 and 20) kills it. More far-away values do not help, and this mutant is not equivalent: it changes the result for 21.',
    modelAnswer: 'Coverage measures execution; mutation testing measures whether tests detect changes. The >= to > mutant survives because no test checks the boundary. Add boundary cases 20 (false) and 21 (true).',
    followUps: ['What is an equivalent mutant?', 'Why is mutation testing usually run on changed code only in CI?'],
  },
];
