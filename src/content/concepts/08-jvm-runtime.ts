import type { LessonConcepts } from '@/types/curriculum';

/** Concept pages for module 8 (JVM Runtime), keyed by lesson id. */
export const jvmRuntimeConcepts: Record<string, LessonConcepts> = {
  'r-memory-areas': {
    interviewDefinition:
      'The JVM divides memory into **per-thread** areas — a program counter, a JVM stack of frames (locals, operand stack) and a native method stack — and **shared** areas: the garbage-collected **heap** for objects and arrays, and the **method area** (Metaspace in HotSpot) for class metadata and run-time constant pools. HotSpot adds a **code cache** for JIT-compiled code. Execution starts in the interpreter; tiered JIT compilation (C1, then C2) turns hot methods into optimised machine code using run-time profiles.',
    interviewFollowUps: [
      {
        question: 'Where do static fields and interned strings live?',
        answer: 'In HotSpot, both are on the heap: interned strings moved there in Java 7, and since Java 8 static fields are stored with the `Class` mirror object. Metaspace holds class metadata such as method bytecode and constant pools, not the static values themselves.',
      },
      {
        question: 'Is every object allocated on the heap?',
        answer: 'Semantically yes. In practice C2\'s escape analysis can **scalar-replace** an object that never escapes a compiled method, so its fields live in registers or the stack frame and no heap allocation happens at all.',
      },
      {
        question: 'Why can a JVM be killed by the container while heap usage looks fine?',
        answer: 'The process also uses native memory: Metaspace, thread stacks, code cache, GC data structures and direct buffers. Size the heap with `-XX:MaxRAMPercentage` (around 75%) and measure the rest with Native Memory Tracking.',
      },
    ],
    mnemonic: {
      device: '"Private: PC, Stack, Native. Shared: Heap, Meta, Code" — think "PSN shares HMC"',
      expansion: [
        { key: 'P', meaning: 'Program counter — per thread, the current bytecode instruction' },
        { key: 'S', meaning: 'Stack — per thread, one frame per method call' },
        { key: 'N', meaning: 'Native method stack — per thread, for JNI code' },
        { key: 'H', meaning: 'Heap — shared, every object and array, managed by the GC' },
        { key: 'M', meaning: 'Metaspace — shared, class metadata in native memory' },
        { key: 'C', meaning: 'Code cache — shared, machine code produced by the JIT' },
      ],
      visual: 'An office building: each worker (thread) has a private desk with a notepad (stack) and a bookmark (PC); everyone shares the warehouse (heap), the library of blueprints (Metaspace) and the machine shop where hot jobs get custom tools built (code cache).',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'Desk notes versus the warehouse',
        body: 'A method call is like a sticky note on your desk: it holds a few numbers and the addresses of boxes, and you throw it away when the call returns — no clean-up crew needed. The boxes themselves sit in a shared warehouse (the heap), and a cleaning crew (the GC) removes boxes nobody has an address for any more.',
      },
      {
        kind: 'insight',
        title: 'Each OutOfMemoryError names the area that ran out',
        body: 'The message after `OutOfMemoryError:` tells you where to look: `Java heap space` (retained objects), `Metaspace` (too many classes, often a class loader leak), `unable to create native thread` (OS thread or memory limits), `Direct buffer memory` (off-heap buffers). `StackOverflowError` is different again: one thread\'s stack, almost always unbounded recursion.',
      },
      {
        kind: 'real-world',
        title: 'Memory budgets in containers',
        body: 'Since Java 10 the JVM reads cgroup limits, so `-XX:MaxRAMPercentage=75` sizes the heap from the container limit. The remaining 25% pays for Metaspace, code cache (240 MB reserved by default with tiered compilation), thread stacks and direct buffers. Teams that set `-Xmx` equal to the limit meet the OOM killer instead of a Java exception.',
      },
      {
        kind: 'angle',
        title: 'The JIT is a bet, and deoptimisation is the refund',
        body: 'C2 compiles for what it has *seen*: if a call site only ever received one class, it inlines that class\'s method behind a cheap type check. When a new class shows up, the check fails, the compiled code is thrown away and execution continues in the interpreter. Benchmarks that load a new subclass halfway through often show this as a sudden temporary slowdown.',
      },
    ],
    diagrams: [
      {
        id: 'r-memory-areas-map',
        kind: 'concept',
        title: 'Per-thread and shared memory',
        caption: 'Every thread gets its own stack of frames; all threads share one heap. Frames hold references, the objects themselves are always on the heap, and each object points to its class metadata in Metaspace.',
        cols: 3,
        rows: 3,
        nodes: [
          { id: 't1', label: 'Thread 1 stack', detail: 'frames, locals, operands', col: 0, row: 0, shape: 'cylinder', tone: 'primary' },
          { id: 't2', label: 'Thread 2 stack', detail: 'plus its own PC register', col: 1, row: 0, shape: 'cylinder', tone: 'primary' },
          { id: 'vt', label: 'Virtual thread', detail: 'parked stack chunks are heap objects', col: 2, row: 0, tone: 'accent' },
          { id: 'heap', label: 'Heap', detail: 'objects and arrays, managed by the GC', col: 0, row: 1, span: 2, shape: 'cylinder', tone: 'success' },
          { id: 'meta', label: 'Metaspace', detail: 'class metadata (native)', col: 2, row: 1, shape: 'cylinder', tone: 'warning' },
          { id: 'code', label: 'Code cache', detail: 'JIT-compiled methods', col: 0, row: 2, shape: 'cylinder', tone: 'neutral' },
          { id: 'direct', label: 'Direct buffers', detail: 'off-heap native memory', col: 1, row: 2, shape: 'cylinder', tone: 'neutral' },
        ],
        edges: [
          { from: 't1', to: 'heap', label: 'references' },
          { from: 't2', to: 'heap', label: 'references' },
          { from: 'vt', to: 'heap', label: 'when unmounted' },
          { from: 'heap', to: 'meta', label: 'class pointer' },
        ],
        groups: [
          { label: 'Per thread', fromCol: 0, toCol: 2, fromRow: 0, toRow: 0, tone: 'primary' },
          { label: 'Shared by all threads', fromCol: 0, toCol: 2, fromRow: 1, toRow: 2, tone: 'accent' },
        ],
      },
      {
        id: 'r-memory-areas-tiers',
        kind: 'flow',
        title: 'Tiered compilation in HotSpot',
        caption: 'Code starts interpreted, gets a quick C1 compile that gathers profiles, and only the hottest methods reach C2. If a speculative assumption breaks, the JVM deoptimises back to the interpreter and the cycle starts again.',
        cols: 4,
        rows: 2,
        nodes: [
          { id: 'bc', label: 'Bytecode', detail: 'from the .class file', col: 0, row: 0, shape: 'note' },
          { id: 'interp', label: 'Interpreter', detail: 'tier 0, counts calls', col: 1, row: 0, tone: 'neutral' },
          { id: 'c1', label: 'C1 with profiling', detail: 'tier 3, quick compile', col: 2, row: 0, tone: 'primary' },
          { id: 'c2', label: 'C2', detail: 'tier 4, inlining, escape analysis', col: 3, row: 0, tone: 'success' },
          { id: 'deopt', label: 'Deoptimise', detail: 'assumption broke', col: 1, row: 1, shape: 'pill', tone: 'danger' },
          { id: 'trivial', label: 'C1 tier 1', detail: 'trivial methods, no profile', col: 2, row: 1, tone: 'accent' },
          { id: 'cache', label: 'Code cache', detail: 'installed machine code', col: 3, row: 1, shape: 'cylinder', tone: 'accent' },
        ],
        edges: [
          { from: 'bc', to: 'interp' },
          { from: 'interp', to: 'c1', label: 'warm' },
          { from: 'c1', to: 'c2', label: 'hot + profiled' },
          { from: 'interp', to: 'trivial', label: 'getter-like' },
          { from: 'c2', to: 'cache', label: 'install' },
          { from: 'c2', to: 'deopt', label: 'uncommon trap', dashed: true },
          { from: 'deopt', to: 'interp', label: 'resume' },
        ],
      },
      {
        id: 'r-memory-areas-budget',
        kind: 'architecture',
        title: 'What fills a container\'s memory limit',
        caption: 'The heap is only one tenant. Everything in the native group comes on top of -Xmx, so leave roughly a quarter of the container limit for it.',
        cols: 4,
        rows: 3,
        nodes: [
          { id: 'limit', label: 'Container memory limit', detail: 'cgroup, read by the JVM since Java 10', col: 0, row: 0, span: 4, tone: 'primary' },
          { id: 'heap', label: 'Heap', detail: '-Xmx or MaxRAMPercentage', col: 0, row: 1, shape: 'cylinder', tone: 'success' },
          { id: 'meta', label: 'Metaspace', detail: 'MaxMetaspaceSize', col: 1, row: 1, shape: 'cylinder', tone: 'warning' },
          { id: 'stacks', label: 'Thread stacks', detail: '-Xss x platform threads', col: 2, row: 1, shape: 'cylinder', tone: 'warning' },
          { id: 'code', label: 'Code cache', detail: 'ReservedCodeCacheSize', col: 3, row: 1, shape: 'cylinder', tone: 'warning' },
          { id: 'oom', label: 'OOM: Java heap space', detail: 'a Java exception', col: 0, row: 2, shape: 'pill', tone: 'danger' },
          { id: 'direct', label: 'Direct buffers', detail: 'MaxDirectMemorySize', col: 1, row: 2, shape: 'cylinder', tone: 'warning' },
          { id: 'gc', label: 'GC structures', detail: 'remembered sets, bitmaps', col: 2, row: 2, shape: 'cylinder', tone: 'warning' },
          { id: 'nmt', label: 'Measure it', detail: 'jcmd VM.native_memory', col: 3, row: 2, shape: 'note', tone: 'neutral' },
        ],
        edges: [
          { from: 'limit', to: 'heap', label: 'about 75%' },
          { from: 'heap', to: 'oom', label: 'exhausted' },
        ],
        groups: [{ label: 'Native memory (not counted in -Xmx)', fromCol: 1, toCol: 3, fromRow: 1, toRow: 2, tone: 'warning' }],
      },
    ],
    variants: [
      {
        title: 'Runtime data areas (JVMS §2.5)',
        intro: 'The specification defines six areas; HotSpot adds the code cache.',
        items: [
          { name: 'Program counter register', summary: 'One per thread: the address of the bytecode instruction being executed (undefined while running a native method).' },
          { name: 'JVM stack', summary: 'One per thread: a frame per method call holding local variables, the operand stack and a link to the constant pool.', note: 'Too deep: StackOverflowError. Size with -Xss.' },
          { name: 'Native method stack', summary: 'One per thread, for native (JNI) code. HotSpot merges it with the JVM stack.' },
          { name: 'Heap', summary: 'Shared: all class instances and arrays, reclaimed by the garbage collector.', note: 'Exhausted: OutOfMemoryError: Java heap space.' },
          { name: 'Method area', summary: 'Shared: per-class structures — method code, field and method data, the run-time constant pool. HotSpot implements it as Metaspace in native memory (PermGen until Java 7).' },
          { name: 'Run-time constant pool', summary: 'Per class, inside the method area: literals and symbolic references that are resolved lazily as code runs.' },
          { name: 'Code cache (HotSpot)', summary: 'Shared: machine code from the JIT compilers, segmented into non-method, profiled and non-profiled heaps since Java 9 (JEP 197).', note: 'When full, the JIT stops compiling and performance quietly drops.' },
        ],
      },
      {
        title: 'OutOfMemoryError variants',
        intro: 'The detail message tells you which area is exhausted.',
        items: [
          { name: 'Java heap space', summary: 'Live objects do not fit in the heap even after a full collection: a leak, an oversized load or a heap that is simply too small.' },
          { name: 'GC overhead limit exceeded', summary: 'The JVM is spending almost all its time collecting while recovering very little memory — a heap that is nearly full of live data. Historically a Parallel collector policy (-XX:+UseGCOverheadLimit).' },
          { name: 'Metaspace / Compressed class space', summary: 'Too much class metadata: usually a class loader leak after redeploys, or unbounded generation of proxy classes.' },
          { name: 'unable to create native thread', summary: 'The OS refused another platform thread (ulimit, container PID limit or native memory). Thread pools or virtual threads, not a bigger heap, fix it.' },
          { name: 'Requested array size exceeds VM limit', summary: 'An array longer than the VM can address (close to Integer.MAX_VALUE elements).' },
          { name: 'Direct buffer memory', summary: 'Off-heap ByteBuffers exceeded -XX:MaxDirectMemorySize (by default about the size of the max heap); common with NIO and network libraries.' },
        ],
      },
      {
        title: 'JIT compilation tiers (HotSpot)',
        intro: 'Tiered compilation has been the default since Java 8. The common path is 0, then 3, then 4.',
        items: [
          { name: 'Tier 0: interpreter', summary: 'Executes bytecode directly and counts invocations and loop back-edges.' },
          { name: 'Tier 1: C1, no profiling', summary: 'Fully optimised C1 code for trivial methods (getters) that C2 could not improve.' },
          { name: 'Tier 2: C1, light profiling', summary: 'Counters only; used when the C2 queue is long so that tier 3 does not slow things down further.' },
          { name: 'Tier 3: C1, full profiling', summary: 'Quick native code that records branch frequencies and receiver types for C2.' },
          { name: 'Tier 4: C2', summary: 'Aggressive, speculative optimisation: inlining, escape analysis, loop optimisations, intrinsics. Can deoptimise.' },
        ],
      },
    ],
    deepDive: [
      {
        title: 'PermGen to Metaspace, and where things moved',
        body: 'Until Java 7, class metadata lived in a fixed-size **Permanent Generation** inside the heap, so a large application or a class loader leak hit `OutOfMemoryError: PermGen space` no matter how much RAM was free. Java 8 removed PermGen (JEP 122): class metadata moved to **Metaspace** in native memory, sized dynamically and capped only if you set `-XX:MaxMetaspaceSize`. Interned strings had already moved to the heap in Java 7, and static field values now live with the `Class` mirror object on the heap. The practical consequence: an unbounded Metaspace leak no longer fails fast — it grows until the container or OS steps in, so cap it or monitor it.',
        sources: [
          { label: 'JEP 122: Remove the Permanent Generation', url: 'https://openjdk.org/jeps/122' },
          { label: 'JVM Specification §2.5: Run-Time Data Areas', url: 'https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-2.html#jvms-2.5' },
        ],
      },
      {
        title: 'Object headers and the cost of small objects',
        body: 'On 64-bit HotSpot with compressed class pointers, every object starts with a 12-byte header (8-byte mark word for hash, lock state and GC age, plus a 4-byte class pointer), and objects are padded to 8 bytes. A `new Object()` is therefore 16 bytes and a boxed `Integer` is 16 bytes to hold 4 bytes of data — why `List<Integer>` costs several times more than `int[]`. Compact object headers (JEP 450, experimental in 24; product option in 25 via JEP 519, enabled with `-XX:+UseCompactObjectHeaders`) shrink the header to 8 bytes, which measurably reduces heap use for object-heavy applications.',
        sources: [
          { label: 'JEP 450: Compact Object Headers (Experimental)', url: 'https://openjdk.org/jeps/450' },
          { label: 'JEP 519: Compact Object Headers', url: 'https://openjdk.org/jeps/519' },
        ],
      },
      {
        title: 'Escape analysis is why "allocation is free" is almost true',
        body: 'Most allocations are a pointer bump in a thread-local allocation buffer (TLAB) — a few instructions. C2 goes further: if escape analysis proves an object never leaves the compiled method (after inlining), it can **scalar-replace** it, keeping the fields in registers, and remove locks on it (lock elision). This depends on inlining, which in turn depends on small methods, so clean code with small methods tends to optimise *better*, not worse. Measure with JMH rather than reasoning from the source, because whether an object escapes depends on what was inlined.',
        sources: [
          { label: 'OpenJDK JMH (Java Microbenchmark Harness)', url: 'https://openjdk.org/projects/code-tools/jmh/' },
          { label: 'Java Performance by Scott Oaks (O\'Reilly), chapters on the JIT compiler' },
        ],
      },
    ],
  },

  'r-class-loading': {
    interviewDefinition:
      'Class loading is how the JVM turns a class name into a usable `Class`: a **class loader** finds the bytes (**loading**), the JVM **links** them (verification, preparation of static fields, lazy resolution of references) and finally **initialises** the class by running its static initialisers once, on first active use. Loaders form a **parent-delegation** hierarchy — bootstrap, platform, application — and a class\'s runtime identity is its name **plus** its defining loader.',
    interviewFollowUps: [
      {
        question: 'What is the difference between ClassNotFoundException and NoClassDefFoundError?',
        answer: '`ClassNotFoundException` is a checked exception from an explicit lookup by name (`Class.forName`, `loadClass`). `NoClassDefFoundError` is an error raised when a class that existed at compile time cannot be provided at run time — a missing or conflicting JAR, or a class whose static initialiser already failed.',
      },
      {
        question: 'Why does String.class.getClassLoader() return null?',
        answer: 'Core classes are defined by the **bootstrap** loader, which is implemented inside the JVM and has no Java object, so the API represents it as `null`.',
      },
      {
        question: 'Why would anyone break parent delegation?',
        answer: 'Servlet containers and plugin systems load application classes **child-first** so that each application can ship its own library versions without clashing with the server\'s. They still delegate `java.*` to the parent.',
      },
      {
        question: 'When is a class unloaded?',
        answer: 'Only when its defining loader, every class that loader defined and all their instances become unreachable. Classes of the three built-in loaders are never unloaded.',
      },
    ],
    mnemonic: {
      device: '"Load, Link, Init — ask the Boss first" (BPA: Bootstrap, Platform, App)',
      expansion: [
        { key: 'Load', meaning: 'A loader finds the bytes and the JVM creates the Class object' },
        { key: 'Link', meaning: 'Verify the bytecode, prepare statics with defaults, resolve references lazily' },
        { key: 'Init', meaning: 'Run static initialisers once, in textual order, on first active use' },
        { key: 'B', meaning: 'Bootstrap loader — java.base, shown as null' },
        { key: 'P', meaning: 'Platform loader — other Java SE and JDK modules' },
        { key: 'A', meaning: 'Application loader — your classpath and module path, named "app"' },
      ],
      visual: 'A new employee (the app loader) gets a request and always asks the boss (platform) who asks the CEO (bootstrap) first; only if nobody upstairs has the file does the employee search their own drawer.',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'A library with branch librarians',
        body: 'Asking for a book goes to the central library first (bootstrap), then the regional branch (platform), then your local branch (application). The central library always wins for the classics, so nobody can slip in a fake copy of `String`. Two local branches can each hold a book called "User", but a stamp says which branch owns it — and a reader card from one branch will not accept a book stamped by another.',
      },
      {
        kind: 'insight',
        title: 'Initialisation is lazy, precise and thread-safe',
        body: 'The JVM guarantees a class is initialised exactly once, under a lock, on its first active use. That is why the **holder-class idiom** (`private static class Holder { static final Service INSTANCE = new Service(); }`) gives a lazy, thread-safe singleton without `synchronized` or `volatile`. The flip side: a static initialiser that blocks or deadlocks stalls every thread that touches the class.',
      },
      {
        kind: 'real-world',
        title: 'Jar hell and "X cannot be cast to X"',
        body: 'Two copies of a library on the classpath (say two Guava versions) mean whichever comes first wins, and the code compiled against the other version fails with `NoSuchMethodError` or `NoClassDefFoundError` at run time. In application servers and plugin hosts, the same class loaded by two loaders produces the infamous `ClassCastException: com.acme.User cannot be cast to com.acme.User`.',
      },
      {
        kind: 'angle',
        title: 'Frameworks create classes at run time',
        body: 'Spring, Hibernate, Mockito and lambdas all generate classes while the program runs — proxies, mocks and lambda implementations. Since Java 15 they can use **hidden classes** (JEP 371), which are not discoverable by name and can be unloaded independently. Metaspace growth in such applications is often generated classes, not your own code.',
      },
    ],
    diagrams: [
      {
        id: 'r-class-loading-hierarchy',
        kind: 'concept',
        title: 'The class loader hierarchy',
        caption: 'Arrows point to the parent each loader asks first. Requests travel up; only if every parent fails does the requesting loader search its own sources.',
        cols: 3,
        rows: 4,
        nodes: [
          { id: 'boot', label: 'Bootstrap loader', detail: 'java.base: String, List', col: 1, row: 0, tone: 'primary' },
          { id: 'bootnote', label: 'Appears as null', detail: 'implemented in the JVM', col: 2, row: 0, shape: 'note', tone: 'neutral' },
          { id: 'platform', label: 'Platform loader', detail: 'java.sql, java.net.http', col: 1, row: 1, tone: 'primary' },
          { id: 'app', label: 'Application loader', detail: 'classpath, module path', col: 1, row: 2, tone: 'accent' },
          { id: 'web', label: 'Web app loader', detail: 'one per deployment', col: 0, row: 3, tone: 'success' },
          { id: 'plugin', label: 'Plugin loader', detail: 'e.g. URLClassLoader', col: 2, row: 3, tone: 'success' },
        ],
        edges: [
          { from: 'platform', to: 'boot', label: 'parent' },
          { from: 'app', to: 'platform', label: 'parent' },
          { from: 'web', to: 'app', label: 'parent' },
          { from: 'plugin', to: 'app', label: 'parent' },
          { from: 'boot', to: 'bootnote', dashed: true },
        ],
        groups: [
          { label: 'Built in', fromCol: 0, toCol: 2, fromRow: 0, toRow: 2, tone: 'primary' },
          { label: 'Custom loaders', fromCol: 0, toCol: 2, fromRow: 3, toRow: 3, tone: 'success' },
        ],
      },
      {
        id: 'r-class-loading-phases',
        kind: 'flow',
        title: 'Loading, linking, initialisation — and what fails where',
        caption: 'The top row is the life of a class; the bottom row is the error each step raises. Resolution is lazy, which is why NoClassDefFoundError can appear long after start-up.',
        cols: 5,
        rows: 2,
        nodes: [
          { id: 'load', label: 'Loading', detail: 'find bytes, create Class', col: 0, row: 0, tone: 'primary' },
          { id: 'verify', label: 'Verification', detail: 'bytecode is type-safe', col: 1, row: 0, tone: 'accent' },
          { id: 'prepare', label: 'Preparation', detail: 'statics = 0 / null', col: 2, row: 0, tone: 'accent' },
          { id: 'resolve', label: 'Resolution', detail: 'lazy, on first use', col: 3, row: 0, tone: 'accent' },
          { id: 'init', label: 'Initialisation', detail: 'static init, once', col: 4, row: 0, tone: 'success' },
          { id: 'cnfe', label: 'ClassNotFound', detail: 'Exception: lookup by name', col: 0, row: 1, shape: 'pill', tone: 'danger' },
          { id: 'verr', label: 'VerifyError', detail: 'bad bytecode', col: 1, row: 1, shape: 'pill', tone: 'danger' },
          { id: 'ncdfe', label: 'NoClassDefFound', detail: 'Error: missing at run time', col: 3, row: 1, shape: 'pill', tone: 'danger' },
          { id: 'eiie', label: 'ExceptionIn', detail: 'InitializerError', col: 4, row: 1, shape: 'pill', tone: 'danger' },
        ],
        edges: [
          { from: 'load', to: 'verify' },
          { from: 'verify', to: 'prepare' },
          { from: 'prepare', to: 'resolve' },
          { from: 'resolve', to: 'init', label: 'first active use' },
          { from: 'load', to: 'cnfe', dashed: true },
          { from: 'verify', to: 'verr', dashed: true },
          { from: 'resolve', to: 'ncdfe', dashed: true },
          { from: 'init', to: 'eiie', dashed: true },
        ],
        groups: [{ label: 'Linking', fromCol: 1, toCol: 3, fromRow: 0, toRow: 0, tone: 'accent' }],
      },
      {
        id: 'r-class-loading-leak',
        kind: 'architecture',
        title: 'How one reference leaks a whole application',
        caption: 'A long-lived thread from the shared server keeps one object of the old deployment alive. Its class keeps its loader alive, and the loader keeps every class it defined in Metaspace.',
        cols: 4,
        rows: 2,
        nodes: [
          { id: 'pool', label: 'Server thread pool', detail: 'outlives deployments', col: 0, row: 0, tone: 'primary' },
          { id: 'tl', label: 'ThreadLocal value', detail: 'never removed', col: 1, row: 0, tone: 'warning' },
          { id: 'obj', label: 'UserContext object', detail: 'from old deployment', col: 2, row: 0, tone: 'warning' },
          { id: 'cls', label: 'UserContext class', detail: 'getClass()', col: 3, row: 0, tone: 'warning' },
          { id: 'loader', label: 'Old web app loader', detail: 'stopped, still reachable', col: 3, row: 1, tone: 'danger' },
          { id: 'meta', label: 'All its classes', detail: 'stuck in Metaspace', col: 1, row: 1, span: 2, shape: 'cylinder', tone: 'danger' },
          { id: 'fix', label: 'Fix', detail: 'remove() in finally', col: 0, row: 1, shape: 'note', tone: 'success' },
        ],
        edges: [
          { from: 'pool', to: 'tl' },
          { from: 'tl', to: 'obj' },
          { from: 'obj', to: 'cls' },
          { from: 'cls', to: 'loader', label: 'defining loader' },
          { from: 'loader', to: 'meta', label: 'holds' },
        ],
        groups: [{ label: 'Old deployment (should be garbage)', fromCol: 1, toCol: 3, fromRow: 0, toRow: 1, tone: 'danger' }],
      },
    ],
    variants: [
      {
        title: 'Class loader types',
        intro: 'Since Java 9 the built-in hierarchy is bootstrap, platform and application; everything else is a custom loader.',
        items: [
          { name: 'Bootstrap', summary: 'Built into the JVM; defines core classes such as those in java.base. Reported as null.', support: 'supported', code: 'String.class.getClassLoader();   // null' },
          { name: 'Platform', summary: 'Defines the remaining Java SE and JDK modules (java.sql, java.net.http...). Replaced the extension loader and the jre/lib/ext mechanism in Java 9.', support: 'supported', code: 'ClassLoader.getPlatformClassLoader();' },
          { name: 'Application (system)', summary: 'Loads your classpath and module path. Named "app"; the default parent for custom loaders.', support: 'supported', code: 'ClassLoader.getSystemClassLoader();' },
          { name: 'Extension loader', summary: 'The pre-Java 9 loader for jre/lib/ext JARs.', support: 'not-supported', note: 'Removed in Java 9; its role went to the platform loader.' },
          { name: 'Custom loaders', summary: 'Subclasses of ClassLoader or URLClassLoader for plugins, web applications, hot reload and bytecode generation. Override findClass; keep parent delegation unless isolation needs child-first.', support: 'supported', code: 'new URLClassLoader(new URL[] { jarUrl }, parent);' },
          { name: 'Thread context class loader', summary: 'Not a separate kind of loader but a per-thread reference (Thread.getContextClassLoader) that frameworks such as ServiceLoader and JDBC use to find application classes from library code.', support: 'supported' },
        ],
      },
      {
        title: 'Loading phases (JVMS chapter 5)',
        items: [
          { name: 'Loading', summary: 'Find the binary representation and create a Class object in the defining loader.' },
          { name: 'Verification', summary: 'Check the bytecode is structurally valid and type-safe.' },
          { name: 'Preparation', summary: 'Allocate static fields and set them to default values; no user code runs.' },
          { name: 'Resolution', summary: 'Replace symbolic references with direct ones. Optional and lazy in HotSpot, per instruction on first execution.' },
          { name: 'Initialisation', summary: 'Run <clinit>: static field initialisers and static blocks in textual order, after the superclass, exactly once.' },
        ],
      },
    ],
    deepDive: [
      {
        title: 'The precise rules for initialisation',
        body: 'JLS 12.4.1 lists the triggers: instance creation, static method invocation, assignment to a static field, use of a static field that is not a **constant variable**, certain reflective calls, and initialisation of a subclass. Interfaces are not initialised when an implementing class is, unless they declare default methods. Constants (`static final` primitives or Strings initialised with constant expressions) are inlined by javac, so changing a constant in a library and not recompiling the callers leaves them with the **old value** — a classic binary-compatibility trap. JVMS 5.5 then describes the 12-step initialisation procedure, including the per-class lock that makes concurrent first use safe and how a failing initialiser marks the class as erroneous.',
        sources: [
          { label: 'JLS §12.4: Initialization of Classes and Interfaces', url: 'https://docs.oracle.com/javase/specs/jls/se21/html/jls-12.html#jls-12.4' },
          { label: 'JVM Specification §5.5: Initialization', url: 'https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-5.html#jvms-5.5' },
        ],
      },
      {
        title: 'Loader constraints keep type safety across loaders',
        body: 'Because the same name can mean different classes in different loaders, the JVM records **loading constraints**: when a method in loader L1 calls into L2 with a parameter of type `com.acme.Event`, both loaders must agree on what `com.acme.Event` is. A violation surfaces as `LinkageError: loader constraint violation`. These constraints closed type-spoofing attacks found in early JVMs (described in the 1998 paper by Liang and Bracha). If you see this error, a type that crosses a loader boundary is being loaded twice — move it to a shared parent loader.',
        sources: [
          { label: 'JVM Specification §5.3.4: Loading Constraints', url: 'https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-5.html#jvms-5.3.4' },
          { label: 'Dynamic Class Loading in the Java Virtual Machine, Liang and Bracha (OOPSLA 1998)' },
        ],
      },
      {
        title: 'Start-up: CDS and AOT caches skip work the loader repeats',
        body: 'Loading and linking thousands of classes is a large part of start-up time. **Class Data Sharing** stores parsed and verified JDK classes in an archive that is memory-mapped at start-up (a default archive ships since Java 12), and AppCDS extends this to application classes. Java 24 added an **ahead-of-time cache** that also stores classes already loaded and linked from a training run (JEP 483). Frameworks such as Spring Boot document how to use these to cut start-up time without changing code.',
        sources: [
          { label: 'JEP 483: Ahead-of-Time Class Loading & Linking', url: 'https://openjdk.org/jeps/483' },
          { label: 'JEP 341: Default CDS Archives', url: 'https://openjdk.org/jeps/341' },
        ],
      },
      {
        title: 'ClassLoader API essentials',
        body: '`loadClass` implements delegation (check `findLoadedClass`, ask the parent, then `findClass`); `findClass` is the hook custom loaders override; `defineClass` turns bytes into a `Class`. Loaders that load in parallel register with `ClassLoader.registerAsParallelCapable()` and lock per class name via `getClassLoadingLock`. `Class.forName(name)` initialises the class; `Class.forName(name, false, loader)` and `loader.loadClass(name)` do not — useful when you only need to inspect a class.',
        sources: [{ label: 'java.lang.ClassLoader API (Java 21)', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/ClassLoader.html' }],
      },
    ],
  },

  'r-gc': {
    interviewDefinition:
      'Garbage collection automatically reclaims heap objects that are no longer **reachable** from GC roots (live stack frames, static fields, JNI handles). HotSpot\'s collectors are tracing and mostly **generational**: young objects are collected cheaply by copying survivors, long-lived ones are promoted. Collectors trade **throughput, pause time and memory footprint** — G1 is the default, ZGC and Shenandoah compact concurrently for sub-millisecond pauses. A Java memory leak is reachable-but-useless data, which no collector can free.',
    interviewFollowUps: [
      {
        question: 'How does the GC handle reference cycles?',
        answer: 'HotSpot uses **tracing**, not reference counting: it marks from roots, so an unreachable cycle is simply never marked and is reclaimed like any other garbage.',
      },
      {
        question: 'What is a stop-the-world pause and why can\'t every collector avoid it?',
        answer: 'All application threads are stopped at a safepoint while the GC works. Concurrent collectors (G1 marking, ZGC, Shenandoah) do most work alongside the application using read or write barriers, but still need short pauses to scan roots and switch phases.',
      },
      {
        question: 'Which collector would you choose for a 64 GB latency-sensitive service?',
        answer: 'Evaluate generational ZGC (the only ZGC mode since Java 24): pause times stay well under a millisecond regardless of heap size, at the cost of some throughput and CPU. Confirm with GC logs and latency percentiles under real load.',
      },
    ],
    mnemonic: {
      device: '"Roots, Mark, Move" — and pick your GC with "Some People Get Zero Stalls"',
      expansion: [
        { key: 'Roots', meaning: 'Start from GC roots: stack locals, static fields, JNI handles' },
        { key: 'Mark', meaning: 'Everything reachable is live; everything else is garbage' },
        { key: 'Move', meaning: 'Copy or compact survivors so free memory is contiguous' },
        { key: 'S', meaning: 'Serial — single-threaded, tiny heaps' },
        { key: 'P', meaning: 'Parallel — maximum throughput, longer pauses' },
        { key: 'G', meaning: 'G1 — balanced default since Java 9' },
        { key: 'Z / S', meaning: 'ZGC and Shenandoah — concurrent compaction, tiny pauses' },
      ],
      visual: 'A park ranger walks every trail from the entrances (roots), ties ribbons on every tent she reaches, and at dusk removes the untied tents — even two tents roped to each other in a clearing no trail leads to.',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'The restaurant that clears tables',
        body: 'Most diners (objects) leave within minutes, so staff clear the quick-turnover counter (young generation) constantly and cheaply — they only have to move the few people still eating. Regulars who stay all evening get moved to the back room (old generation), which is cleaned rarely. A memory leak is a table with a "reserved" sign that nobody ever comes back to: staff are not allowed to clear it.',
      },
      {
        kind: 'insight',
        title: 'Young collections cost what survives, not what dies',
        body: 'A copying young collection touches only live objects; dead ones are reclaimed by resetting the space. Allocating a million short-lived objects is therefore cheap, while keeping objects alive just long enough to be promoted ("middle-aged" objects, such as big per-request caches) is expensive: they get copied repeatedly and then fill the old generation.',
      },
      {
        kind: 'real-world',
        title: 'Reading a leak from GC logs',
        body: 'With `-Xlog:gc*:file=gc.log` you can plot heap occupancy **after** each collection. A saw-tooth with a flat floor is healthy. A floor that rises over hours is a leak; take two `jcmd <pid> GC.class_histogram` snapshots to see which classes grow, then a heap dump and open the dominator tree in Eclipse MAT to find what retains them.',
      },
      {
        kind: 'angle',
        title: 'Reference types let the GC help with caches',
        body: '`WeakHashMap` keys disappear when nothing else references them, `SoftReference` values survive until memory gets tight, and `Cleaner` (Java 9) runs clean-up after an object becomes phantom reachable. They are precise tools: soft references make memory use unpredictable, and none of them replaces bounding a cache by size.',
      },
    ],
    diagrams: [
      {
        id: 'r-gc-reachability',
        kind: 'concept',
        title: 'Reachable, leaked and garbage',
        caption: 'The GC keeps everything reachable from roots — including the stale cache entry nobody needs (a leak). The two objects that only reference each other are garbage despite the cycle.',
        cols: 3,
        rows: 3,
        nodes: [
          { id: 'stack', label: 'Stack local', detail: 'GC root', col: 0, row: 0, shape: 'pill', tone: 'primary' },
          { id: 'static', label: 'Static field', detail: 'GC root', col: 1, row: 0, shape: 'pill', tone: 'primary' },
          { id: 'order', label: 'Order', detail: 'live, in use', col: 0, row: 1, tone: 'success' },
          { id: 'cache', label: 'Cache map', detail: 'live, in use', col: 1, row: 1, tone: 'success' },
          { id: 'a', label: 'Session A', detail: 'unreachable', col: 2, row: 1, tone: 'neutral' },
          { id: 'item', label: 'LineItem', detail: 'live, in use', col: 0, row: 2, tone: 'success' },
          { id: 'stale', label: 'Stale entry', detail: 'reachable but useless', col: 1, row: 2, tone: 'warning' },
          { id: 'b', label: 'Session B', detail: 'unreachable', col: 2, row: 2, tone: 'neutral' },
        ],
        edges: [
          { from: 'stack', to: 'order' },
          { from: 'order', to: 'item' },
          { from: 'static', to: 'cache' },
          { from: 'cache', to: 'stale', label: 'leak' },
          { from: 'a', to: 'b', both: true, label: 'cycle' },
        ],
        groups: [
          { label: 'GC roots', fromCol: 0, toCol: 1, fromRow: 0, toRow: 0, tone: 'primary' },
          { label: 'Garbage', fromCol: 2, toCol: 2, fromRow: 1, toRow: 2, tone: 'danger' },
        ],
      },
      {
        id: 'r-gc-generations',
        kind: 'flow',
        title: 'The life of an object in a generational heap',
        caption: 'Most objects die in Eden and cost nothing to reclaim. Survivors are copied between survivor spaces and promoted to the old generation after enough collections.',
        cols: 4,
        rows: 2,
        nodes: [
          { id: 'new', label: 'new Order()', detail: 'pointer bump in a TLAB', col: 0, row: 0, shape: 'pill', tone: 'primary' },
          { id: 'eden', label: 'Eden', detail: 'young generation', col: 1, row: 0, shape: 'cylinder', tone: 'accent' },
          { id: 'surv', label: 'Survivor spaces', detail: 'ageing, copied each GC', col: 2, row: 0, shape: 'cylinder', tone: 'accent' },
          { id: 'old', label: 'Old generation', detail: 'collected less often', col: 3, row: 0, shape: 'cylinder', tone: 'warning' },
          { id: 'dead', label: 'Dead in Eden', detail: 'reclaimed wholesale', col: 1, row: 1, shape: 'pill', tone: 'success' },
          { id: 'mixed', label: 'Old collection', detail: 'G1 mixed GC or concurrent', col: 3, row: 1, tone: 'neutral' },
        ],
        edges: [
          { from: 'new', to: 'eden', label: 'allocate' },
          { from: 'eden', to: 'surv', label: 'young GC: copy live' },
          { from: 'surv', to: 'old', label: 'survived N GCs' },
          { from: 'eden', to: 'dead', label: 'most die young', dashed: true },
          { from: 'old', to: 'mixed' },
        ],
        groups: [{ label: 'Young generation', fromCol: 1, toCol: 2, fromRow: 0, toRow: 0, tone: 'accent' }],
      },
      {
        id: 'r-gc-choose',
        kind: 'flow',
        title: 'Choosing a collector',
        caption: 'Start from the default and move only for a measured reason. Each question is about the goal that matters most for the workload.',
        cols: 3,
        rows: 4,
        nodes: [
          { id: 'q1', label: 'Tiny heap, 1 CPU?', detail: 'small container, CLI tool', col: 0, row: 0, tone: 'neutral' },
          { id: 'serial', label: 'Serial', detail: '-XX:+UseSerialGC', col: 1, row: 0, tone: 'primary' },
          { id: 'q2', label: 'Throughput only?', detail: 'batch job, pauses OK', col: 0, row: 1, tone: 'neutral' },
          { id: 'parallel', label: 'Parallel', detail: '-XX:+UseParallelGC', col: 1, row: 1, tone: 'primary' },
          { id: 'q3', label: 'Strict latency?', detail: 'or a very large heap', col: 0, row: 2, tone: 'neutral' },
          { id: 'zgc', label: 'Generational ZGC', detail: '-XX:+UseZGC', col: 1, row: 2, tone: 'success' },
          { id: 'shen', label: 'Shenandoah', detail: 'not in Oracle JDK builds', col: 2, row: 2, tone: 'accent' },
          { id: 'g1', label: 'G1 (default)', detail: 'balanced pause goal', col: 1, row: 3, tone: 'success' },
        ],
        edges: [
          { from: 'q1', to: 'serial', label: 'yes' },
          { from: 'q1', to: 'q2', label: 'no' },
          { from: 'q2', to: 'parallel', label: 'yes' },
          { from: 'q2', to: 'q3', label: 'no' },
          { from: 'q3', to: 'zgc', label: 'yes' },
          { from: 'zgc', to: 'shen', label: 'alternative', dashed: true, both: true },
          { from: 'q3', to: 'g1', label: 'no' },
        ],
      },
    ],
    variants: [
      {
        title: 'HotSpot garbage collectors',
        intro: 'G1 has been the default since Java 9 on server-class machines; the JVM still picks Serial when it sees fewer than 2 CPUs or less than about 1.8 GB of memory.',
        items: [
          { name: 'Serial', summary: 'Single-threaded, stop-the-world, generational. Lowest overhead; best for small heaps and single-CPU containers.', support: 'supported', code: '-XX:+UseSerialGC' },
          { name: 'Parallel', summary: 'Multi-threaded, stop-the-world, generational. Maximises throughput; the default up to Java 8.', support: 'supported', code: '-XX:+UseParallelGC' },
          { name: 'G1 (Garbage-First)', summary: 'Region-based and generational, concurrent marking, incremental compaction with a pause-time goal (200 ms by default). Default since Java 9 (JEP 248).', support: 'supported', code: '-XX:+UseG1GC -XX:MaxGCPauseMillis=200' },
          { name: 'ZGC', summary: 'Concurrent marking and compaction with coloured pointers and load barriers; pauses typically under 1 ms independent of heap size. Experimental in 11, production in 15, generational in 21 (JEP 439), generational by default in 23, and the non-generational mode was removed in 24.', support: 'supported', code: '-XX:+UseZGC' },
          { name: 'Shenandoah', summary: 'Concurrent compaction with Brooks-style forwarding; low pauses independent of heap size. Production since 15; generational mode experimental in 24 and a product option in 25 (JEP 521), not the default mode.', support: 'partial', note: 'Included in most OpenJDK builds but not in Oracle JDK.', code: '-XX:+UseShenandoahGC' },
          { name: 'Epsilon', summary: 'A no-op collector that allocates but never frees (Java 11, JEP 318). For performance testing and very short-lived jobs only.', support: 'partial', note: 'Experimental: needs -XX:+UnlockExperimentalVMOptions.', code: '-XX:+UseEpsilonGC' },
          { name: 'CMS (Concurrent Mark Sweep)', summary: 'The old low-pause collector. Did not compact, so it suffered fragmentation.', support: 'not-supported', note: 'Deprecated in 9, removed in 14 (JEP 363).' },
        ],
      },
      {
        title: 'Reference types (java.lang.ref)',
        intro: 'From strongest to weakest; each level is cleared earlier by the GC.',
        items: [
          { name: 'Strong', summary: 'An ordinary reference. The object is never collected while strongly reachable.', support: 'supported', code: 'Order o = new Order();' },
          { name: 'Soft', summary: 'Cleared at the GC\'s discretion when memory is needed, and guaranteed to be cleared before an OutOfMemoryError. Tempting for caches, but makes memory use and GC behaviour hard to predict.', support: 'supported', code: 'new SoftReference<>(image)' },
          { name: 'Weak', summary: 'Cleared as soon as the object is only weakly reachable, at the next collection that notices. Basis of WeakHashMap and canonicalising maps.', support: 'supported', code: 'new WeakReference<>(listener)' },
          { name: 'Phantom', summary: 'get() always returns null; the reference is enqueued after the object becomes unreachable, to trigger clean-up of native resources. Since Java 9, Cleaner wraps this pattern and is the replacement for finalize().', support: 'supported', code: 'Cleaner.create().register(obj, cleanupAction);' },
        ],
      },
    ],
    deepDive: [
      {
        title: 'How ZGC compacts while your threads keep running',
        body: 'ZGC stores metadata bits in object pointers ("coloured pointers") and inserts a **load barrier** in compiled code: every time the application loads a reference from the heap, a fast check verifies the pointer is "good" for the current GC phase; if not, the barrier fixes it — marking the object or forwarding it to its new location — before the application uses it. Because the application heals pointers itself, objects can be relocated concurrently and pauses are limited to root scanning. Generational ZGC (JEP 439) added a young generation, cutting allocation stalls and CPU cost; it became the default ZGC mode in Java 23 (JEP 474) and the only mode in 24 (JEP 490).',
        sources: [
          { label: 'JEP 377: ZGC — A Scalable Low-Latency Garbage Collector (Production)', url: 'https://openjdk.org/jeps/377' },
          { label: 'JEP 439: Generational ZGC', url: 'https://openjdk.org/jeps/439' },
          { label: 'JEP 474: ZGC — Generational Mode by Default', url: 'https://openjdk.org/jeps/474' },
        ],
      },
      {
        title: 'G1: regions, remembered sets and the pause-time goal',
        body: 'G1 divides the heap into equal regions (1-32 MB) that can be Eden, survivor, old or humongous (objects at least half a region). Each region has a **remembered set** of incoming references from other regions, so a young collection can scan only the young regions plus their remembered sets instead of the whole old generation. After concurrent marking, **mixed collections** evacuate the old regions with the most garbage first — hence "Garbage-First" — choosing as many as fit the pause target. Humongous allocations and a remembered set that grows too large are two common sources of unexpected G1 pause time.',
        sources: [
          { label: 'HotSpot Virtual Machine Garbage Collection Tuning Guide (Java 21): G1', url: 'https://docs.oracle.com/en/java/javase/21/gctuning/garbage-first-g1-garbage-collector1.html' },
          { label: 'JEP 248: Make G1 the Default Garbage Collector', url: 'https://openjdk.org/jeps/248' },
        ],
      },
      {
        title: 'Finalization is on its way out',
        body: '`Object.finalize()` ran at an unpredictable time (or never), could resurrect objects, slowed allocation and held memory for an extra GC cycle. It was deprecated in Java 9 and **deprecated for removal** in Java 18 (JEP 421); it can be disabled today with `--finalization=disabled`. Use try-with-resources for deterministic clean-up and `java.lang.ref.Cleaner` only as a safety net for native resources.',
        sources: [{ label: 'JEP 421: Deprecate Finalization for Removal', url: 'https://openjdk.org/jeps/421' }],
      },
    ],
  },
};
