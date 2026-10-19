import type { LessonConcepts } from '@/types/curriculum';

/** Concept pages for module 16 (Performance), keyed by lesson id. */
export const performanceConcepts: Record<string, LessonConcepts> = {
  // -------------------------------------------------------------------------
  'perf-diagnostics': {
    interviewDefinition:
      'Diagnosing a JVM is evidence-gathering on a live process with the JDK\'s own tools: **latency percentiles** to define the symptom, **Java Flight Recorder** for low-overhead continuous recording of CPU samples, allocations, locks, GC and I/O, **jcmd** as the front end for thread dumps, heap histograms, heap dumps, JFR control and native-memory tracking, and sampling profilers such as **async-profiler** for flame graphs. The skill is matching each symptom — hot CPU, stuck threads, growing heap, long pauses — to the cheapest tool that can prove its cause.',
    interviewFollowUps: [
      {
        question: 'A Java process is at 100% CPU. How do you find the guilty code?',
        answer: 'Find the hot OS threads (`top -H -p <pid>`), convert their thread ids to hex and match the `nid=0x...` field in a `jcmd <pid> Thread.print` dump — repeat a few times. Better still, record a CPU profile (JFR execution samples or async-profiler) and read the widest frames of the flame graph.',
      },
      {
        question: 'Heap histogram or heap dump?',
        answer: 'Start with `GC.class_histogram`: cheap, small, and two snapshots minutes apart show which classes keep growing. Take a heap dump only when you need to know *who holds* those objects (the dominator tree and paths to GC roots); it pauses the JVM, is as large as the live heap and contains user data.',
      },
      {
        question: 'Why can latency be bad while CPU is idle?',
        answer: 'Threads are waiting, not computing — on locks, pool checkouts, database calls, remote services or GC. A CPU profiler shows nothing; use thread dumps, JFR lock and park events, or wall-clock profiling (`async-profiler -e wall`).',
      },
    ],
    mnemonic: {
      device: '"Hot, Stuck, Fat, Paused" — four symptoms, four tools',
      expansion: [
        { key: 'Hot', meaning: 'CPU saturated → CPU flame graph (JFR execution samples or async-profiler).' },
        { key: 'Stuck', meaning: 'No progress, CPU low → three thread dumps a few seconds apart; look for BLOCKED and deadlocks.' },
        { key: 'Fat', meaning: 'Heap after GC keeps rising → class histograms over time, then a heap dump analysed in Eclipse MAT.' },
        { key: 'Paused', meaning: 'Latency spikes with idle code → GC logs (`-Xlog:gc*`) and JFR GC and safepoint events.' },
      ],
      visual: 'Picture a patient who is feverish (hot), frozen (stuck), swelling (fat) or fainting (paused) — each needs a different scan.',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'A hospital, not a guessing game',
        body: 'Metrics are vital signs on the ward monitor. JFR is a continuous ECG you can leave running. A thread dump is an X-ray: cheap, instant, a single moment. A heap dump is an MRI: hugely detailed, slow, and the patient must hold still (the JVM pauses). Doctors do not order an MRI for a fever; you should not take a 30 GB heap dump for high CPU.',
      },
      {
        kind: 'insight',
        title: 'RUNNABLE does not mean running',
        body: 'A thread blocked in a native socket read shows as `RUNNABLE` in a thread dump, because the JVM cannot see inside the system call. A dump full of RUNNABLE threads in `SocketInputStream.read` (or `NioSocketImpl.read`) is a slow dependency, not a CPU problem. Read the top frames, not just the state.',
      },
      {
        kind: 'real-world',
        title: 'Continuous profiling in production',
        body: 'Many teams run JFR (or async-profiler) permanently with the low-overhead `default` settings and ship recordings to a profiling backend. When p99 jumps after a deploy, they compare flame graphs from before and after instead of trying to reproduce the problem on a laptop that has different data, load and hardware.',
      },
      {
        kind: 'angle',
        title: 'Safepoint bias: when a profiler lies',
        body: 'Classic JVMTI-based samplers can only capture stacks when threads reach a **safepoint**, so they blame the next safepoint poll (often a loop back-edge or method return) rather than the code actually burning CPU. JFR and async-profiler sample threads asynchronously and avoid this bias — one reason their flame graphs disagree with older profilers.',
      },
    ],
    diagrams: [
      {
        id: 'perf-diagnostics-symptom-tool',
        kind: 'concept',
        title: 'Match the symptom to the tool',
        caption: 'Each symptom has a cheapest tool that can prove its cause. Start there; escalate to expensive evidence such as heap dumps only when the cheap one points that way.',
        cols: 4,
        rows: 2,
        nodes: [
          { id: 'hot', label: 'Hot CPU', detail: 'cores saturated', col: 0, row: 0, shape: 'pill', tone: 'danger' },
          { id: 'stuck', label: 'Stuck', detail: 'no progress, CPU low', col: 1, row: 0, shape: 'pill', tone: 'warning' },
          { id: 'fat', label: 'Growing heap', detail: 'heap after GC rises', col: 2, row: 0, shape: 'pill', tone: 'warning' },
          { id: 'paused', label: 'Latency spikes', detail: 'code looks idle', col: 3, row: 0, shape: 'pill', tone: 'warning' },
          { id: 'flame', label: 'CPU flame graph', detail: 'JFR or async-profiler', col: 0, row: 1, tone: 'primary' },
          { id: 'dumps', label: '3 thread dumps', detail: 'jcmd Thread.print', col: 1, row: 1, tone: 'primary' },
          { id: 'heap', label: 'Histogram, then dump', detail: 'GC.class_histogram, MAT', col: 2, row: 1, tone: 'primary' },
          { id: 'gc', label: 'GC log + JFR GC', detail: '-Xlog:gc*', col: 3, row: 1, tone: 'primary' },
        ],
        edges: [
          { from: 'hot', to: 'flame' },
          { from: 'stuck', to: 'dumps' },
          { from: 'fat', to: 'heap' },
          { from: 'paused', to: 'gc' },
        ],
      },
      {
        id: 'perf-diagnostics-loop',
        kind: 'flow',
        title: 'The diagnostic loop',
        caption: 'Quantify the symptom first, capture evidence for one hypothesis, change one thing and re-measure the same metric. A change that does not move the metric is reverted.',
        cols: 4,
        rows: 2,
        nodes: [
          { id: 'alert', label: 'Symptom', detail: 'alert or user report', col: 0, row: 0, shape: 'pill', tone: 'warning' },
          { id: 'quant', label: 'Quantify', detail: 'p50/p99, which endpoint', col: 1, row: 0, tone: 'primary' },
          { id: 'hyp', label: 'Hypothesis', detail: 'hot, stuck, fat, paused?', col: 2, row: 0, tone: 'primary' },
          { id: 'cap', label: 'Capture evidence', detail: 'JFR, dumps, GC log', col: 3, row: 0, tone: 'accent' },
          { id: 'ana', label: 'Analyse', detail: 'JMC, MAT, flame graph', col: 3, row: 1, tone: 'accent' },
          { id: 'change', label: 'Change one thing', detail: 'smallest fix', col: 2, row: 1, tone: 'primary' },
          { id: 'remeasure', label: 'Re-measure', detail: 'same metric, same load', col: 1, row: 1, tone: 'primary' },
          { id: 'done', label: 'Improved', detail: 'keep it, record why', col: 0, row: 1, shape: 'pill', tone: 'success' },
        ],
        edges: [
          { from: 'alert', to: 'quant' },
          { from: 'quant', to: 'hyp' },
          { from: 'hyp', to: 'cap' },
          { from: 'cap', to: 'ana' },
          { from: 'ana', to: 'change' },
          { from: 'change', to: 'remeasure' },
          { from: 'remeasure', to: 'done', label: 'better' },
          { from: 'remeasure', to: 'hyp', label: 'no change: revert', dashed: true },
        ],
      },
      {
        id: 'perf-diagnostics-toolbox',
        kind: 'architecture',
        title: 'How the tools reach a running JVM',
        caption: 'jcmd, jstack and async-profiler connect through the Attach API; the JVM itself writes recordings and dumps to files that are analysed elsewhere, ideally off the production host.',
        cols: 3,
        rows: 3,
        nodes: [
          { id: 'jcmd', label: 'jcmd', detail: 'Thread.print, GC.*, JFR.*', col: 0, row: 0, tone: 'primary' },
          { id: 'jstack', label: 'jstack', detail: 'thread dump (older tool)', col: 1, row: 0, tone: 'neutral' },
          { id: 'ap', label: 'async-profiler', detail: 'agent, Linux/macOS', col: 2, row: 0, tone: 'neutral' },
          { id: 'jvm', label: 'Target JVM', detail: 'HotSpot + JFR buffers', col: 1, row: 1, tone: 'accent' },
          { id: 'hprof', label: 'heap.hprof', detail: 'Eclipse MAT', col: 0, row: 2, shape: 'note', tone: 'neutral' },
          { id: 'jfr', label: 'app.jfr', detail: 'JMC or jfr print', col: 1, row: 2, shape: 'note', tone: 'neutral' },
          { id: 'flame', label: 'flame.html', detail: 'open in a browser', col: 2, row: 2, shape: 'note', tone: 'neutral' },
        ],
        edges: [
          { from: 'jcmd', to: 'jvm', label: 'Attach API' },
          { from: 'jstack', to: 'jvm', label: 'Attach API' },
          { from: 'ap', to: 'jvm', label: 'loads agent' },
          { from: 'jvm', to: 'hprof', label: 'GC.heap_dump' },
          { from: 'jvm', to: 'jfr', label: 'JFR.dump' },
          { from: 'ap', to: 'flame', label: 'writes' },
        ],
        groups: [{ label: 'Production host', fromCol: 0, toCol: 2, fromRow: 0, toRow: 1, tone: 'neutral' }],
      },
    ],
    variants: [
      {
        title: 'Diagnostic tools',
        items: [
          { name: 'Java Flight Recorder (JFR)', summary: 'Event recorder built into HotSpot: CPU samples, allocations, locks, GC, I/O, exceptions. Read with JDK Mission Control or the `jfr` tool.', support: 'supported', note: 'Open-sourced in JDK 11 (JEP 328); about 1% overhead with default settings.', code: 'jcmd <pid> JFR.start duration=60s filename=app.jfr settings=profile' },
          { name: 'jcmd', summary: 'Sends diagnostic commands to a running JVM: threads, GC, heap, JFR, VM flags, native memory. The recommended single entry point.', support: 'supported', code: 'jcmd <pid> help' },
          { name: 'jstack', summary: 'Prints a thread dump of a running JVM.', support: 'partial', note: 'Still shipped, but documented as experimental and unsupported; prefer `jcmd <pid> Thread.print`.', code: 'jstack -l <pid>' },
          { name: 'Heap dumps', summary: 'A snapshot of every live object in `.hprof` format, analysed for leaks with Eclipse MAT or VisualVM.', support: 'supported', note: 'Pauses the JVM while writing and contains user data — protect and delete it.', code: 'jcmd <pid> GC.heap_dump /tmp/heap.hprof\n-XX:+HeapDumpOnOutOfMemoryError' },
          { name: 'async-profiler', summary: 'Open-source sampling profiler without safepoint bias; CPU, allocation, lock and wall-clock modes; outputs flame graphs.', support: 'partial', note: 'Third-party tool (not in the JDK), Linux and macOS.', code: 'asprof -d 30 -e cpu -f flame.html <pid>' },
          { name: 'GC logs', summary: 'Unified logging of every collection: pause times, heap before and after, causes.', support: 'supported', note: 'Unified logging since JDK 9 (JEP 158, JEP 271).', code: '-Xlog:gc*:file=gc.log:time,uptime' },
        ],
      },
      {
        title: 'Thread states in a dump',
        intro: 'These are the values of `Thread.State`; reading them correctly is half of thread-dump analysis.',
        items: [
          { name: 'NEW', summary: 'Created but `start()` not yet called — rarely seen in dumps.' },
          { name: 'RUNNABLE', summary: 'Executing or ready to run — including threads blocked inside native I/O.' },
          { name: 'BLOCKED', summary: 'Waiting to enter a `synchronized` block or method ("waiting to lock <0x...>"). Many of these on one monitor means contention.' },
          { name: 'WAITING', summary: 'Waiting indefinitely: `Object.wait()`, `Thread.join()`, `LockSupport.park()` (used by `ReentrantLock`, queues, futures).' },
          { name: 'TIMED_WAITING', summary: 'Waiting with a timeout: `Thread.sleep`, `wait(ms)`, `parkNanos`, a pool poll with timeout.' },
          { name: 'TERMINATED', summary: 'Finished running; no longer appears in dumps of live threads.' },
        ],
      },
    ],
    deepDive: [
      {
        title: 'How JFR stays cheap enough for production',
        body: 'JFR writes binary events into **thread-local buffers** with no locking, promotes full buffers to global buffers, and periodically flushes chunks to a disk repository. Expensive events are throttled or sampled (execution samples every 10–20 ms per thread by default), and stack traces are de-duplicated into constant pools. Since JDK 14 (JEP 349) the same data can be consumed live with `RecordingStream`. JDK 25 added an experimental CPU-time sampler for Linux (JEP 509) that measures actual CPU time per thread rather than wall-clock intervals.',
        sources: [
          { label: 'JEP 328: Flight Recorder', url: 'https://openjdk.org/jeps/328' },
          { label: 'JEP 349: JFR Event Streaming', url: 'https://openjdk.org/jeps/349' },
          { label: 'JEP 509: JFR CPU-Time Profiling (Experimental)', url: 'https://openjdk.org/jeps/509' },
        ],
      },
      {
        title: 'Percentiles cannot be averaged — and load tests can hide the tail',
        body: 'The average of ten instances\' p99s is not the fleet p99; merge the underlying histograms (HdrHistogram, Prometheus buckets) instead. And a load generator that waits for each response before sending the next request backs off precisely when the system is slow, so stalls are recorded as one slow sample instead of many — Gil Tene\'s **coordinated omission**. Use constant-arrival-rate load tools, or correct for the intended send schedule, or your p99 will look far better than users experience.',
        sources: [{ label: 'Gil Tene, "How NOT to Measure Latency" (conference talk); HdrHistogram project' }],
      },
      {
        title: 'Deadlock detection is built in',
        body: 'HotSpot tracks the owners of monitors and of `java.util.concurrent` ownable synchronizers (such as `ReentrantLock`). A thread dump ends with "Found one Java-level deadlock" and the cycle of threads and locks, and `ThreadMXBean.findDeadlockedThreads()` returns the same information programmatically — useful for a health indicator. It cannot detect livelocks, starvation, or a thread waiting on a `CountDownLatch` that nobody will count down; for those, compare successive dumps.',
        sources: [
          { label: 'ThreadMXBean API (Java SE 21)', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.management/java/lang/management/ThreadMXBean.html' },
          { label: 'jcmd command reference (Java SE 21)', url: 'https://docs.oracle.com/en/java/javase/21/docs/specs/man/jcmd.html' },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  'perf-jmh': {
    interviewDefinition:
      '**JMH** (Java Microbenchmark Harness) is the OpenJDK project for writing benchmarks that survive the JVM\'s adaptive optimisation. It generates harness code around `@Benchmark` methods, runs **warm-up** iterations until compiled code is steady, isolates each benchmark in **forked JVMs**, defeats dead-code elimination through return values and `Blackhole`, and prevents constant folding by reading inputs from non-final `@State` fields. Every score comes with an error margin (a 99.9% confidence interval), so you can tell a real difference from noise.',
    interviewFollowUps: [
      {
        question: 'Why does JMH fork a new JVM per benchmark?',
        answer: 'JIT decisions depend on everything the JVM has run so far. If benchmark A runs first, call sites it made monomorphic become polymorphic when B runs, so B looks slower. Fresh forks also expose run-to-run variance (different inlining and code layout) that is invisible inside one JVM.',
      },
      {
        question: 'What does `Blackhole` do?',
        answer: 'It "consumes" values in a way the JIT cannot prove is useless, so the computation that produced them cannot be eliminated. Returning a value from the `@Benchmark` method has the same effect for a single result.',
      },
      {
        question: 'Two benchmarks score 120 ± 15 and 110 ± 12 ns/op. Is the second faster?',
        answer: 'Not shown: the intervals [105, 135] and [98, 122] overlap. Increase forks and iterations, reduce noise, or accept that the difference is too small to matter.',
      },
    ],
    mnemonic: {
      device: '"Warm it, Fork it, Sink it, State it, Doubt it"',
      expansion: [
        { key: 'Warm it', meaning: '`@Warmup` iterations run until the JIT has produced steady-state code; their results are discarded.' },
        { key: 'Fork it', meaning: '`@Fork(n)` runs each benchmark in fresh JVMs so profiles of other benchmarks cannot leak in.' },
        { key: 'Sink it', meaning: 'Return the result or pass it to a `Blackhole` so dead-code elimination cannot delete the work.' },
        { key: 'State it', meaning: 'Read inputs from non-final `@State` fields set in `@Setup` so they cannot be constant-folded.' },
        { key: 'Doubt it', meaning: 'Read the Error column: overlapping confidence intervals mean no proven difference.' },
      ],
      visual: 'Picture a sprinter: let them warm up, race them on a fresh track each time, make sure they actually cross the finish line, give them a course they cannot memorise, and do not crown a winner by a hair.',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'Homework nobody collects',
        body: 'A clever student notices the teacher never collects the homework, so they stop doing it — and still "finish" instantly. The JIT is that student: if your loop\'s result is never used, it deletes the work. `Blackhole` is the teacher collecting the homework, so the work must really be done.',
      },
      {
        kind: 'insight',
        title: 'Never loop inside a @Benchmark method',
        body: 'Writing `for (int i = 0; i < 1000; i++) sum += f(i);` inside a benchmark invites unrolling, hoisting and vectorisation that would not happen at the real call site, so cost per call is understated. Let JMH call the method repeatedly; if you need many inputs, put them in a `@State` array and benchmark one realistic operation per invocation.',
      },
      {
        kind: 'real-world',
        title: 'The JDK benchmarks itself with JMH',
        body: 'Since JDK 12 the OpenJDK source tree contains a suite of JMH microbenchmarks (JEP 230) that engineers run before and after changes to collections, strings or the JIT. Library teams do the same in CI on dedicated, quiet machines — shared CI runners are too noisy for small differences.',
      },
      {
        kind: 'angle',
        title: 'Setup per invocation is a trap',
        body: '`@Setup(Level.Invocation)` runs before every single call. For operations taking nanoseconds, the timestamps and setup overhead dominate the measurement and the JMH documentation warns against it. Use `Level.Trial` or `Level.Iteration`, or design the state so each call works on fresh data without per-call setup.',
      },
    ],
    diagrams: [
      {
        id: 'perf-jmh-jit-timeline',
        kind: 'concept',
        title: 'Why a naive timer measures the wrong program',
        caption: 'The same method runs as interpreted code, then C1 code, then C2 code. A naive timer averages all three; JMH discards warm-up and measures only the steady state.',
        cols: 4,
        rows: 2,
        nodes: [
          { id: 'int', label: 'Interpreter', detail: 'slowest, profiling', col: 0, row: 0, shape: 'pill', tone: 'neutral' },
          { id: 'c1', label: 'C1 compiled', detail: 'quick, with counters', col: 1, row: 0, shape: 'pill', tone: 'neutral' },
          { id: 'c2', label: 'C2 compiled', detail: 'aggressive: DCE, folding', col: 2, row: 0, shape: 'pill', tone: 'accent' },
          { id: 'steady', label: 'Steady state', detail: 'what you want to know', col: 3, row: 0, shape: 'pill', tone: 'success' },
          { id: 'naive', label: 'Naive nanoTime loop', detail: 'averages three different programs', col: 0, row: 1, span: 2, tone: 'danger' },
          { id: 'jmh', label: 'JMH warm-up, then measure', detail: 'only steady-state iterations recorded', col: 2, row: 1, span: 2, tone: 'success' },
        ],
        edges: [
          { from: 'int', to: 'c1', label: 'hot method' },
          { from: 'c1', to: 'c2', label: 'profiled' },
          { from: 'c2', to: 'steady' },
        ],
      },
      {
        id: 'perf-jmh-run-structure',
        kind: 'architecture',
        title: 'Anatomy of a JMH run',
        caption: 'Each fork is a fresh JVM that runs warm-up iterations (discarded) and measurement iterations (recorded). Scores from all forks are combined into one result with a confidence interval.',
        cols: 4,
        rows: 3,
        nodes: [
          { id: 'jar', label: 'benchmarks.jar', detail: 'generated harness', col: 0, row: 1, shape: 'note', tone: 'neutral' },
          { id: 'f1', label: 'Fork 1', detail: 'fresh JVM', col: 1, row: 0, tone: 'primary' },
          { id: 'f2', label: 'Fork 2', detail: 'fresh JVM', col: 1, row: 1, tone: 'primary' },
          { id: 'f3', label: 'Fork 3', detail: 'fresh JVM', col: 1, row: 2, tone: 'primary' },
          { id: 'warm', label: 'Warm-up iterations', detail: 'results discarded', col: 2, row: 0, tone: 'neutral' },
          { id: 'meas', label: 'Measurement', detail: 'iterations recorded', col: 3, row: 0, tone: 'accent' },
          { id: 'bh', label: 'Blackhole', detail: 'consumes results', col: 2, row: 1, tone: 'neutral' },
          { id: 'score', label: 'Score ± Error', detail: '99.9% CI across all forks', col: 2, row: 2, span: 2, shape: 'pill', tone: 'success' },
        ],
        edges: [
          { from: 'jar', to: 'f1' },
          { from: 'jar', to: 'f2' },
          { from: 'jar', to: 'f3' },
          { from: 'f1', to: 'warm' },
          { from: 'warm', to: 'meas' },
          { from: 'meas', to: 'bh', label: 'results sunk', dashed: true },
          { from: 'meas', to: 'score' },
          { from: 'f2', to: 'score', label: 'same cycle', dashed: true },
          { from: 'f3', to: 'score', label: 'same cycle', dashed: true },
        ],
      },
      {
        id: 'perf-jmh-decide',
        kind: 'flow',
        title: 'Is B really faster than A?',
        caption: 'A benchmark win is only a candidate until the intervals separate, allocation is understood, and the real application confirms it.',
        cols: 3,
        rows: 2,
        nodes: [
          { id: 'run', label: 'Run A and B', detail: 'same machine, forks ≥ 3', col: 0, row: 0, tone: 'primary' },
          { id: 'ci', label: 'Intervals overlap?', detail: 'Score ± Error', col: 1, row: 0, tone: 'warning' },
          { id: 'none', label: 'No proven difference', detail: 'more forks, or stop', col: 2, row: 0, shape: 'pill', tone: 'neutral' },
          { id: 'gc', label: 'Check -prof gc', detail: 'bytes/op, unit, mode', col: 1, row: 1, tone: 'primary' },
          { id: 'app', label: 'Confirm in the app', detail: 'profile or load test', col: 2, row: 1, shape: 'pill', tone: 'success' },
        ],
        edges: [
          { from: 'run', to: 'ci' },
          { from: 'ci', to: 'none', label: 'yes' },
          { from: 'ci', to: 'gc', label: 'no' },
          { from: 'gc', to: 'app' },
        ],
      },
    ],
    variants: [
      {
        title: 'Benchmark modes',
        intro: 'Set with `@BenchmarkMode`; pair time-based modes with `@OutputTimeUnit`.',
        items: [
          { name: 'Throughput', summary: 'Operations per unit of time (ops/s). Higher is better.', code: '@BenchmarkMode(Mode.Throughput)' },
          { name: 'AverageTime', summary: 'Average time per operation (e.g. ns/op). Lower is better.', code: '@BenchmarkMode(Mode.AverageTime)\n@OutputTimeUnit(TimeUnit.NANOSECONDS)' },
          { name: 'SampleTime', summary: 'Samples individual call times and reports a distribution with percentiles (p50, p99, max).', note: 'Use when tail behaviour matters, not just the mean.', code: '@BenchmarkMode(Mode.SampleTime)' },
          { name: 'SingleShotTime', summary: 'Times one invocation per iteration without warm-up looping — measures cold-start cost.', code: '@BenchmarkMode(Mode.SingleShotTime)' },
          { name: 'All', summary: 'Runs every mode above, one after another.', code: '@BenchmarkMode(Mode.All)' },
        ],
      },
      {
        title: 'State scopes',
        items: [
          { name: 'Scope.Thread', summary: 'Each benchmark thread gets its own state instance — no sharing, no contention.', code: '@State(Scope.Thread)' },
          { name: 'Scope.Benchmark', summary: 'One instance shared by all threads of the benchmark — for measuring contention on shared data.', code: '@State(Scope.Benchmark)' },
          { name: 'Scope.Group', summary: 'One instance per thread group, used with `@Group` for asymmetric benchmarks such as producer and consumer.', code: '@State(Scope.Group)' },
        ],
      },
      {
        title: 'Setup and teardown levels',
        items: [
          { name: 'Level.Trial', summary: 'Once per fork, before warm-up (the default). Build inputs here.' },
          { name: 'Level.Iteration', summary: 'Before each warm-up or measurement iteration — e.g. reset a collection that grows during an iteration.' },
          { name: 'Level.Invocation', summary: 'Before every call. Only for operations much longer than a millisecond; otherwise the overhead swamps the result.' },
        ],
      },
    ],
    deepDive: [
      {
        title: 'What the Error column really is',
        body: 'JMH computes the mean of all measurement iterations across all forks and the half-width of a **99.9% confidence interval** using Student\'s t-distribution. It assumes iterations are independent samples; strongly bimodal results (some forks fast, some slow because of different JIT decisions) produce a huge error — a signal to look at per-fork results, not to average them away. Increase forks rather than iterations to capture between-JVM variance.',
        sources: [{ label: 'OpenJDK JMH project', url: 'https://github.com/openjdk/jmh' }],
      },
      {
        title: 'Profilers inside JMH',
        body: '`-prof gc` reports `gc.alloc.rate.norm` — bytes allocated per operation — the most useful number for allocation-reduction work because it is independent of speed. `-prof stack` gives a quick hot-stack view; `-prof perfasm` (Linux, with hsdis) shows the generated machine code annotated with where cycles go, which is how you confirm whether a loop was vectorised or a bounds check removed. `-prof jfr` and the async-profiler integration produce full profiles of the measured section only.',
        sources: [{ label: 'JMH samples and profiler documentation (openjdk/jmh repository)', url: 'https://github.com/openjdk/jmh' }],
      },
      {
        title: 'Micro-benchmarks answer narrow questions',
        body: 'A benchmark that shows `HashMap.get` taking 8 ns measures a hot cache, a warmed branch predictor and a perfectly inlined call. In the application the same lookup may miss caches because other code evicted the data. Use JMH to compare alternatives for a hot spot that a profile already identified, and accept a change only when the application-level metric (latency percentiles, throughput, allocation rate) moves too.',
        sources: [{ label: 'JEP 230: Microbenchmark Suite', url: 'https://openjdk.org/jeps/230' }],
      },
    ],
  },

  // -------------------------------------------------------------------------
  'perf-optimisation': {
    interviewDefinition:
      'Effective optimisation is **subtractive**: remove work in order of cost. First cut network and disk round trips (N+1 queries, chatty calls, unbuffered I/O), then fix algorithmic complexity and data-structure choice, then reduce allocation, boxing and copying in hot paths, and only then consider micro-level tuning — much of which the JIT already does. Every change starts from a profile, targets one hotspot and is re-measured against the same metric; changes that do not move it are reverted, because they only add complexity.',
    interviewFollowUps: [
      {
        question: 'Why is `ArrayList` usually faster than `LinkedList`, even for inserts?',
        answer: 'An `ArrayList` stores references contiguously, so iteration and indexed access are cache-friendly, and inserts at the end are amortised O(1). A `LinkedList` allocates a node per element and chases pointers scattered across the heap; finding a middle position is O(n) anyway, so its O(1) insert rarely wins in practice.',
      },
      {
        question: 'Is `a + b + c` string concatenation slow?',
        answer: 'Not in a single expression: since Java 9 it compiles to an `invokedynamic` call that builds the result efficiently. It is slow in a loop (`s += x`), which copies the growing string each time — O(n²). Use `StringBuilder` or `String.join` there.',
      },
      {
        question: 'How does caching go wrong?',
        answer: 'Unbounded caches become memory leaks, stale entries return wrong data, a low hit rate adds cost for nothing, and cold-cache stampedes overload the backend after a restart. Use a bounded cache with expiry (e.g. Caffeine), measure the hit rate, and define how entries are invalidated.',
      },
    ],
    mnemonic: {
      device: '"Fewer Trips, Fewer Steps, Fewer Objects — then Tricks"',
      expansion: [
        { key: 'Fewer Trips', meaning: 'Batch and cache remote calls, queries and system calls: milliseconds each.' },
        { key: 'Fewer Steps', meaning: 'Better algorithms and data structures: O(n²) to O(n) beats any tuning.' },
        { key: 'Fewer Objects', meaning: 'Less allocation, boxing and copying in hot loops lowers GC pressure.' },
        { key: 'then Tricks', meaning: 'Micro-optimisations last, and only where a profile proves the code is hot.' },
      ],
      visual: 'Picture a delivery driver: first stop driving back to the depot for every parcel, then plan a shorter route, then carry fewer boxes — and only at the end polish the van.',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'The shopping list',
        body: 'Going to the shop once per ingredient takes all afternoon however fast you walk. Writing a list and going once is the N+1-query fix; buying a bigger basket is batching. Walking faster (micro-optimising the loop) barely matters compared to the number of trips.',
      },
      {
        kind: 'insight',
        title: 'Costs differ by orders of magnitude',
        body: 'Rough numbers worth memorising: an L1 cache hit is about a nanosecond, a main-memory access about 100 ns, an SSD random read tens of microseconds to ~100 µs, and a network round trip inside a data centre around half a millisecond — far more across regions. One avoided remote call can pay for millions of avoided allocations.',
      },
      {
        kind: 'real-world',
        title: 'The innocent `contains`',
        body: 'A de-duplication step called `list.contains(id)` for each of 100,000 incoming ids against a growing `ArrayList`: about 5 billion comparisons, minutes of CPU. Switching the seen-set to a `HashSet` made the step take milliseconds — no tuning flags, no parallelism, just the right data structure.',
      },
      {
        kind: 'angle',
        title: 'The JIT already does the micro-tricks',
        body: 'C2 inlines small methods, hoists invariant code, removes redundant bounds checks, vectorises simple loops and, through escape analysis, can avoid allocating objects that never leave a method. Hand-unrolling loops or caching `list.size()` in a local rarely helps and can make code harder for the JIT to optimise. Write clear code and let the profile tell you where it is not enough.',
      },
    ],
    diagrams: [
      {
        id: 'perf-optimisation-cost-ladder',
        kind: 'concept',
        title: 'Attack the most expensive work first',
        caption: 'Costs fall by orders of magnitude from top to bottom, and so does the typical payoff of fixing them. Each level has its own standard remedy.',
        cols: 2,
        rows: 5,
        nodes: [
          { id: 'net', label: 'Remote round trip', detail: '~0.5 ms to 100+ ms', col: 0, row: 0, tone: 'danger' },
          { id: 'disk', label: 'Disk / system call', detail: 'µs each, adds up fast', col: 0, row: 1, tone: 'warning' },
          { id: 'algo', label: 'Algorithm', detail: 'O(n²) vs O(n)', col: 0, row: 2, tone: 'warning' },
          { id: 'alloc', label: 'Allocation, boxing', detail: 'drives GC frequency', col: 0, row: 3, tone: 'accent' },
          { id: 'cpu', label: 'Instruction level', detail: '~1 ns, JIT territory', col: 0, row: 4, tone: 'neutral' },
          { id: 'f-net', label: 'Batch, cache, join', detail: 'fix N+1 and chattiness', col: 1, row: 0, tone: 'success' },
          { id: 'f-disk', label: 'Buffer and batch', detail: 'BufferedWriter, JDBC batch', col: 1, row: 1, tone: 'success' },
          { id: 'f-algo', label: 'Right data structure', detail: 'HashSet, ArrayDeque', col: 1, row: 2, tone: 'success' },
          { id: 'f-alloc', label: 'Primitives, presize', detail: 'long over Long', col: 1, row: 3, tone: 'success' },
          { id: 'f-cpu', label: 'Leave it to the JIT', detail: 'unless a profile says so', col: 1, row: 4, tone: 'neutral' },
        ],
        edges: [
          { from: 'net', to: 'f-net' },
          { from: 'disk', to: 'f-disk' },
          { from: 'algo', to: 'f-algo' },
          { from: 'alloc', to: 'f-alloc' },
          { from: 'cpu', to: 'f-cpu' },
        ],
      },
      {
        id: 'perf-optimisation-n-plus-one',
        kind: 'concept',
        title: 'N+1 round trips vs one batched query',
        caption: 'The per-row query pays network latency a hundred times; collecting ids and asking once pays it once, whatever the database does internally.',
        cols: 3,
        rows: 2,
        nodes: [
          { id: 'loop', label: 'Loop over 100 orders', detail: 'per-row lookup', col: 0, row: 0, tone: 'danger' },
          { id: 'calls', label: 'findCustomer(id)', detail: '× 100 round trips', col: 1, row: 0, tone: 'danger' },
          { id: 'db1', label: 'Database', detail: '100 queries', col: 2, row: 0, shape: 'cylinder', tone: 'neutral' },
          { id: 'ids', label: 'Collect ids first', detail: 'Set<Long>', col: 0, row: 1, tone: 'success' },
          { id: 'in', label: 'WHERE id IN (...)', detail: '1 round trip', col: 1, row: 1, tone: 'success' },
          { id: 'db2', label: 'Database', detail: '1 query, map by id', col: 2, row: 1, shape: 'cylinder', tone: 'neutral' },
        ],
        edges: [
          { from: 'loop', to: 'calls' },
          { from: 'calls', to: 'db1', label: '100 × latency' },
          { from: 'ids', to: 'in' },
          { from: 'in', to: 'db2', label: '1 × latency' },
        ],
      },
      {
        id: 'perf-optimisation-loop',
        kind: 'flow',
        title: 'One change at a time',
        caption: 'Optimise the biggest contributor from the profile, change one thing, and keep it only if the same metric improves under the same load.',
        cols: 4,
        rows: 2,
        nodes: [
          { id: 'prof', label: 'Profile', detail: 'JFR, flame graph, SQL log', col: 0, row: 0, tone: 'primary' },
          { id: 'pick', label: 'Biggest contributor', detail: 'Amdahl: it bounds the win', col: 1, row: 0, tone: 'primary' },
          { id: 'change', label: 'One change', detail: 'smallest that helps', col: 2, row: 0, tone: 'accent' },
          { id: 'measure', label: 'Re-measure', detail: 'p99, throughput, alloc', col: 3, row: 0, tone: 'primary' },
          { id: 'keep', label: 'Keep', detail: 'and note why', col: 3, row: 1, shape: 'pill', tone: 'success' },
          { id: 'revert', label: 'Revert', detail: 'complexity, no gain', col: 2, row: 1, shape: 'pill', tone: 'danger' },
        ],
        edges: [
          { from: 'prof', to: 'pick' },
          { from: 'pick', to: 'change' },
          { from: 'change', to: 'measure' },
          { from: 'measure', to: 'keep', label: 'improved' },
          { from: 'measure', to: 'revert', label: 'no change', dashed: true },
          { from: 'revert', to: 'pick', label: 'next hypothesis', dashed: true },
        ],
      },
    ],
    variants: [
      {
        title: 'Choosing a collection by access pattern',
        intro: 'Most "collection performance" problems are a mismatch between the structure and how it is used.',
        items: [
          { name: 'ArrayList', summary: 'Indexed access and iteration; append amortised O(1). The default list.', support: 'supported', code: 'new ArrayList<>(expectedSize)' },
          { name: 'LinkedList', summary: 'O(1) insert/remove at a known node, but poor cache locality and per-node allocation.', support: 'supported', note: 'Rarely the fastest choice; prefer ArrayList or ArrayDeque.' },
          { name: 'ArrayDeque', summary: 'Stack or queue with O(1) operations at both ends, array-backed.', support: 'supported', code: 'Deque<Task> q = new ArrayDeque<>();' },
          { name: 'HashMap / HashSet', summary: 'O(1) average lookup by key; turns `contains` in a loop from O(n²) into O(n).', support: 'supported', code: 'HashMap.newHashMap(expected) // Java 19+' },
          { name: 'TreeMap / TreeSet', summary: 'Sorted keys and range queries in O(log n).', support: 'supported' },
          { name: 'EnumMap / EnumSet', summary: 'Array or bit-vector backed structures for enum keys — compact and very fast.', support: 'supported' },
          { name: 'Primitive arrays', summary: 'No boxing, contiguous memory: the fastest option for large numeric data.', support: 'supported', code: 'long[] totals = new long[n];' },
        ],
      },
    ],
    deepDive: [
      {
        title: 'Escape analysis: allocations the JIT can remove',
        body: 'When C2 can prove an object never escapes the compiled method (it is not stored in a field, returned, or passed to a non-inlined call), it can replace the object with its fields in registers — **scalar replacement** — so no allocation happens. It works only after inlining, so a large method that is not inlined, or an object stored in a collection, defeats it. That is why "avoid allocation" advice must be checked with `-prof gc` or JFR: some allocations you see in source never happen, while others you did not expect do.',
        sources: [{ label: 'Java HotSpot VM performance enhancements (Escape Analysis)', url: 'https://docs.oracle.com/en/java/javase/21/vm/java-hotspot-virtual-machine-performance-enhancements.html' }],
      },
      {
        title: 'Strings got faster without code changes',
        body: 'Compact strings (JDK 9, JEP 254) store Latin-1 text in one byte per character, roughly halving memory for most strings. Indified string concatenation (JDK 9, JEP 280) compiles `+` into an `invokedynamic` call whose strategy the JVM chooses at run time. Code that hand-converted every `+` into `StringBuilder` for "performance" gained nothing and lost readability — a good example of why folklore must be re-measured on each Java release.',
        sources: [
          { label: 'JEP 254: Compact Strings', url: 'https://openjdk.org/jeps/254' },
          { label: 'JEP 280: Indify String Concatenation', url: 'https://openjdk.org/jeps/280' },
        ],
      },
      {
        title: 'Little\'s law sizes pools and queues',
        body: 'For a stable system, concurrency = throughput × latency (L = λW). A service handling 200 requests/s where each holds a database connection for 50 ms needs about 200 × 0.05 = 10 connections on average; making queries 25 ms halves that. The law also explains why slow dependencies exhaust pools: if latency jumps tenfold at the same arrival rate, ten times as many requests are in flight. Reducing latency is often the cheapest way to "add capacity".',
        sources: [{ label: 'J. D. C. Little, "A Proof for the Queuing Formula: L = λW", Operations Research (1961)' }],
      },
    ],
  },
};
