import type { CurriculumModule } from '@/types/curriculum';

export const performanceModule: CurriculumModule = {
  id: 'performance',
  order: 16,
  title: 'Advanced Engineering: Profiling, Benchmarking and Diagnostics',
  shortTitle: 'Performance',
  summary: 'Measure before optimising: latency percentiles, JFR, thread and heap dumps, flame graphs, honest benchmarks with JMH and the optimisations that actually pay off.',
  level: 'advanced',
  prerequisites: ['jvm-runtime', 'concurrency'],
  bossChallengeId: 'boss-latency-report',
  lessons: [
    {
      id: 'perf-diagnostics',
      moduleId: 'performance',
      title: 'Diagnosing a running JVM: percentiles, JFR, thread and heap dumps',
      summary: 'Measure first, read latency distributions instead of averages, and use JFR, jcmd, thread dumps, heap histograms and flame graphs to find the real bottleneck.',
      estimatedMinutes: 40,
      difficulty: 'advanced',
      prerequisites: ['r-memory-areas', 'r-gc'],
      versionNotes: [
        { feature: 'jcmd diagnostic command tool', since: 7 },
        { feature: 'Unified JVM logging (-Xlog:gc*)', since: 9, note: 'Replaces -XX:+PrintGCDetails and friends' },
        { feature: 'Java Flight Recorder open-sourced and free to use in OpenJDK', since: 11, note: 'Commercial feature of Oracle JDK before 11; backported to OpenJDK 8u262' },
        { feature: 'jfr command-line tool for reading recordings', since: 12 },
        { feature: 'JFR event streaming API (jdk.jfr.consumer.RecordingStream)', since: 14 },
        { feature: 'jcmd Thread.dump_to_file (includes virtual threads, JSON format option)', since: 21 },
      ],
      objectives: [
        'Explain why you measure before optimising and why averages hide tail latency.',
        'Record and read a Java Flight Recorder profile with jcmd and JDK Mission Control.',
        'Take and read a thread dump, recognise thread states and spot a deadlock.',
        'Choose between a heap histogram, a heap dump, a GC log and a CPU flame graph for a given symptom.',
      ],
      plainEnglish: `Performance work is detective work. Before you change any code you need **evidence**: what is slow, how slow, and where the time goes. Guessing usually optimises the wrong thing.

Start from the user's point of view: how long do requests take? Look at the whole **distribution** — the typical request (p50) and the slow ones (p95, p99) — not the average, which hides the unlucky users.

Then look inside the JVM with the tools the JDK already ships:
- **Java Flight Recorder (JFR)** records what the JVM is doing (CPU samples, allocations, locks, GC, I/O) with very low overhead, and **JDK Mission Control** shows the recording.
- A **thread dump** is a snapshot of what every thread is doing right now — perfect for "everything is stuck".
- A **heap histogram** or **heap dump** shows what is using memory.
- A **flame graph** (for example from async-profiler) shows where CPU time is spent at a glance.`,
      technical: `### Measure first
Define the question ("p99 of /checkout rose from 120 ms to 900 ms after release 4.2") and a metric you can re-measure after the change. Optimise the biggest contributor first (Amdahl's law: speeding up 5% of the time by 10x saves at most 5%).

### Percentiles, not averages
Latency is skewed: most requests are fast, a few are very slow. The **mean** is dragged by outliers yet still hides them. Report **p50, p95, p99, p99.9 and max**. A user loading a page that makes 20 backend calls hits the backend p99 on roughly 1 - 0.99^20 = 18% of page loads. Percentiles cannot be averaged across instances — merge histograms (HdrHistogram, Micrometer, Prometheus histograms) instead. Beware **coordinated omission**: a load generator that waits for slow responses before sending the next request under-reports the tail.

### Java Flight Recorder and JDK Mission Control
JFR is built into HotSpot; with the default settings its overhead is typically around 1%, so it can run in production.
- Start at launch: \`-XX:StartFlightRecording=duration=120s,filename=app.jfr,settings=profile\` (\`settings=default\` is the low-overhead preset).
- Start on a running JVM: \`jcmd <pid> JFR.start name=slow settings=profile duration=60s filename=/tmp/slow.jfr\`, then \`JFR.dump\` / \`JFR.stop\`.
- Read it in **JDK Mission Control** (a separate download) or with \`jfr print --events jdk.ExecutionSample app.jfr\` / \`jfr summary app.jfr\`.
Useful events: method profiling (execution samples), allocation by site, \`jdk.JavaMonitorEnter\` (lock contention), \`jdk.ThreadPark\`, GC pauses, socket and file I/O, exceptions thrown. Since Java 14 \`RecordingStream\` lets a service consume events live.

### Thread dumps
\`jcmd <pid> Thread.print\` (or \`jstack <pid>\`, or \`kill -3\` to print to stdout) lists every platform thread with its state and stack. Since Java 21, \`jcmd <pid> Thread.dump_to_file -format=json dump.json\` also includes virtual threads.
- **RUNNABLE**: running or ready to run (also threads blocked in native socket reads!).
- **BLOCKED**: waiting to enter a \`synchronized\` monitor — "waiting to lock <0x...>".
- **WAITING / TIMED_WAITING**: \`Object.wait\`, \`LockSupport.park\` (ReentrantLock, queues, futures), \`Thread.sleep\`.
The JVM detects monitor and ownable-synchronizer deadlocks and prints "Found one Java-level deadlock". Take **three dumps a few seconds apart**: a thread stuck in the same frame in all of them is the suspect. Many threads waiting on the same pool or lock means contention or exhaustion. Programmatically, \`ThreadMXBean.findDeadlockedThreads()\` does the same detection.

### Memory evidence
- \`jcmd <pid> GC.class_histogram\` — instance counts and bytes per class; cheap, compare two over time.
- \`jcmd <pid> GC.heap_dump /tmp/heap.hprof\` (or \`-XX:+HeapDumpOnOutOfMemoryError\`) — analyse the dominator tree in Eclipse MAT (see the GC lesson).
- GC logs: \`-Xlog:gc*:file=gc.log:time,uptime:filecount=5,filesize=20m\` — pause times, allocation rate, heap after GC.
- \`jcmd <pid> VM.native_memory summary\` with \`-XX:NativeMemoryTracking=summary\` for memory outside the heap.

### Flame graphs
**async-profiler** (open source, Linux/macOS) samples stacks without the safepoint bias of older Java profilers and draws flame graphs: the x-axis is the share of samples (not time order), the y-axis is stack depth. Wide plateaus at the top are where CPU is burned. It can also profile allocations (\`-e alloc\`), locks (\`-e lock\`) and wall-clock time (\`-e wall\`, which shows blocked and waiting threads too). JFR's execution samples can be rendered as flame graphs in Mission Control as well.`,
      whyItExists: `Modern JVMs, JITs, garbage collectors, thread pools and networks interact in ways nobody can predict by reading code. Low-overhead, always-available diagnostics let you find the real bottleneck in the real environment — often in production, where the problem actually happens — instead of optimising by intuition.`,
      whenToUse: [
        'Before any optimisation: capture a baseline (percentiles, throughput, resource usage) you can compare against.',
        'Keep JFR or continuous profiling available in production; record during the incident window.',
        'Take several thread dumps when the service hangs, stops making progress or has CPU near zero with growing queues.',
        'Use heap histograms and dumps when heap-after-GC keeps rising; use CPU flame graphs when CPU is saturated.',
      ],
      whenNotToUse: [
        'Do not report or alert on average latency alone.',
        'Do not optimise code that the profile shows is not on the hot path.',
        'Do not take heap dumps casually on a large production heap: the JVM pauses while writing, and the file contains user data that must be protected.',
        'Do not profile only a cold JVM in the first seconds after start-up — the JIT has not finished optimising.',
      ],
      examples: [
        {
          id: 'pf-deadlock-detect',
          title: 'Detecting a deadlock from inside the JVM',
          runnable: true,
          code: `import java.lang.management.ManagementFactory;
import java.lang.management.ThreadInfo;
import java.lang.management.ThreadMXBean;
import java.util.Arrays;
import java.util.Comparator;
import java.util.concurrent.CountDownLatch;

public class Main {
    static final Object ACCOUNT_A = new Object();
    static final Object ACCOUNT_B = new Object();

    static Thread transfer(String name, Object first, Object second, CountDownLatch bothLocked) {
        Thread t = new Thread(() -> {
            synchronized (first) {
                bothLocked.countDown();
                try { bothLocked.await(); } catch (InterruptedException e) { return; }
                synchronized (second) {
                    System.out.println("never reached");
                }
            }
        }, name);
        t.setDaemon(true);   // stuck daemon threads do not keep the JVM alive
        return t;
    }

    public static void main(String[] args) throws InterruptedException {
        CountDownLatch bothLocked = new CountDownLatch(2);
        transfer("refund-worker", ACCOUNT_A, ACCOUNT_B, bothLocked).start();
        transfer("purchase-worker", ACCOUNT_B, ACCOUNT_A, bothLocked).start();

        ThreadMXBean threads = ManagementFactory.getThreadMXBean();
        long[] ids = null;
        for (int i = 0; i < 250 && ids == null; i++) {
            Thread.sleep(20);                       // poll until both threads are blocked
            ids = threads.findDeadlockedThreads();  // null when there is no deadlock
        }
        if (ids == null) {
            System.out.println("no deadlock found");
            return;
        }
        System.out.println("deadlocked threads: " + ids.length);
        ThreadInfo[] infos = threads.getThreadInfo(ids);
        Arrays.sort(infos, Comparator.comparing(ThreadInfo::getThreadName));
        for (ThreadInfo info : infos) {
            System.out.println(info.getThreadName() + " is " + info.getThreadState()
                + ", waiting for a lock held by " + info.getLockOwnerName());
        }
    }
}`,
          expectedOutput: `deadlocked threads: 2
purchase-worker is BLOCKED, waiting for a lock held by refund-worker
refund-worker is BLOCKED, waiting for a lock held by purchase-worker`,
          explanation: 'The same detection runs when you take a thread dump with jcmd Thread.print, which then prints "Found one Java-level deadlock" followed by both stacks. A health endpoint can call findDeadlockedThreads() to fail its liveness probe — note that in the inc-deadlock incident the liveness probes kept passing because nothing checked for this.',
        },
        {
          id: 'pf-percentiles',
          title: 'Why the average lies: percentiles of a latency sample',
          runnable: true,
          code: `import java.util.Arrays;

public class Main {
    // Nearest-rank percentile: the smallest value with at least p% of samples at or below it
    static long percentile(long[] sorted, int p) {
        int rank = (p * sorted.length + 99) / 100;   // ceil(p / 100 * n)
        return sorted[Math.max(rank, 1) - 1];
    }

    public static void main(String[] args) {
        long[] latenciesMs = new long[1000];
        for (int i = 0; i < 1000; i++) {
            if (i % 100 == 0) latenciesMs[i] = 2500;        // 1%: lock contention or GC
            else if (i % 20 == 0) latenciesMs[i] = 300;     // 4%: cache misses
            else latenciesMs[i] = 40 + i % 10;              // 95%: the happy path
        }
        Arrays.sort(latenciesMs);

        double mean = Arrays.stream(latenciesMs).average().orElse(0);
        System.out.printf("mean = %.1f ms%n", mean);
        for (int p : new int[] {50, 95, 99}) {
            System.out.println("p" + p + "  = " + percentile(latenciesMs, p) + " ms");
        }
        System.out.println("max  = " + latenciesMs[latenciesMs.length - 1] + " ms");
    }
}`,
          expectedOutput: `mean = 79.5 ms
p50  = 45 ms
p95  = 49 ms
p99  = 300 ms
max  = 2500 ms`,
          explanation: 'The mean of 79.5 ms describes no real request: 95% of users see under 50 ms and 1% wait 2.5 seconds. Only the full distribution (p50, p99, max) reveals both. Real systems record latencies into histograms (HdrHistogram, Micrometer) rather than keeping every sample.',
        },
        {
          id: 'pf-jdk-tools',
          title: 'The diagnostic toolbox from the command line',
          runnable: false,
          code: `# Which JVMs are running?
jcmd

# Java Flight Recorder: record 60 s of a running service, then summarise it
jcmd 4242 JFR.start name=slow settings=profile duration=60s filename=/tmp/slow.jfr
jfr summary /tmp/slow.jfr
jfr print --events jdk.ExecutionSample /tmp/slow.jfr | head -50

# ...or record from start-up
java -XX:StartFlightRecording=duration=120s,filename=app.jfr -jar app.jar

# Thread dumps: take three, a few seconds apart
jcmd 4242 Thread.print > dump1.txt
jcmd 4242 Thread.dump_to_file -format=json /tmp/threads.json   # Java 21+, includes virtual threads

# Memory
jcmd 4242 GC.class_histogram | head -20
jcmd 4242 GC.heap_dump /tmp/heap.hprof
java -Xlog:gc*:file=gc.log:time,uptime -XX:+HeapDumpOnOutOfMemoryError -jar app.jar

# CPU flame graph with async-profiler (separate download)
asprof -d 30 -e cpu -f /tmp/flame.html 4242`,
          explanation: 'jcmd talks to the JVM through its attach mechanism, so it must run as the same OS user (in a container: kubectl exec into the pod). Heap dumps contain every string in memory, including personal data and secrets — store and delete them accordingly.',
        },
      ],
      walkthrough: {
        exampleId: 'pf-deadlock-detect',
        steps: [
          { lines: [12, 16], text: 'Each worker locks its first account and counts down the latch, so both threads hold one lock before either asks for the second.' },
          { lines: [17, 21], text: 'Now each thread tries to enter the monitor the other one holds. Neither can proceed: a lock-ordering deadlock, exactly like refunds and purchases locking accounts in opposite order.' },
          { lines: [22, 23], text: 'Daemon threads let the program exit even though the two workers will never finish.' },
          { lines: [31, 36], text: 'findDeadlockedThreads() looks for cycles of threads waiting on monitors or ownable synchronizers (such as ReentrantLock). It returns null until the cycle exists, so the program polls briefly.' },
          { lines: [41, 47], text: 'ThreadInfo exposes what a thread dump shows: thread name, state (BLOCKED) and the owner of the lock it is waiting for. Sorting by name keeps the output deterministic.' },
        ],
      },
      realWorld: {
        title: 'The slow endpoint that was not slow code',
        scenario: `After a release, p99 latency of an order API jumped from 150 ms to 1.8 s while p50 stayed at 30 ms and CPU stayed at 35%. The team's first instinct was to rewrite the JSON serialisation, which a colleague "felt" was slow.

Instead they recorded 2 minutes of JFR in production with \`jcmd JFR.start settings=profile\`. CPU samples showed serialisation was 3% of time. The **Java Monitor Blocked** events, however, pointed at a \`synchronized\` method in a new audit logger: every request thread queued behind a single lock while the logger wrote to a slow network disk. Three thread dumps taken five seconds apart confirmed it — 180 threads BLOCKED "waiting to lock" the same monitor.

Making the audit logger asynchronous with a bounded queue brought p99 back to 160 ms. Rewriting the serialiser would have changed nothing.`,
      },
      commonMistakes: [
        {
          mistake: 'Optimising based on intuition or a code review instead of a profile.',
          why: 'Bottlenecks are usually somewhere unexpected: a lock, a pool, an N+1 query, GC, a DNS lookup.',
          fix: 'Capture a baseline, profile under realistic load, change one thing, measure again.',
        },
        {
          mistake: 'Alerting on average latency, or averaging the p99 of several instances.',
          why: 'Averages hide the tail; percentiles are not additive, so an average of p99s is not a p99.',
          fix: 'Record histograms, aggregate them, then compute percentiles. Alert on p99 against an SLO.',
        },
        {
          mistake: 'Reading a single thread dump and concluding a RUNNABLE thread is burning CPU.',
          why: 'Threads blocked in native socket reads show as RUNNABLE; one snapshot cannot show progress.',
          fix: 'Take three dumps a few seconds apart and compare; correlate with per-thread CPU (top -H) or JFR.',
        },
        {
          mistake: 'Taking a full heap dump of a 30 GB production heap during peak traffic.',
          why: 'Writing the dump pauses the JVM for a long time and the file holds sensitive data.',
          fix: 'Start with GC.class_histogram; take dumps on a drained instance or rely on HeapDumpOnOutOfMemoryError.',
        },
      ],
      checks: [
        {
          id: 'pf1-c1',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'A service reports an average latency of 80 ms. What is the most important missing information?',
          options: [
            { id: 'a', text: 'The median only' },
            { id: 'b', text: 'The tail of the distribution (p95, p99, max), because a small share of very slow requests can hide behind a reasonable mean' },
            { id: 'c', text: 'The minimum latency' },
            { id: 'd', text: 'Nothing: the average is the standard latency metric' },
          ],
          correctOptionId: 'b',
          explanation: 'Latency distributions are skewed. Users experience the tail; a page that makes many calls hits the backend p99 frequently.',
        },
        {
          id: 'pf1-c2',
          kind: 'mcq',
          dimension: 'runtime',
          prompt: 'In a thread dump, 150 request threads show `java.lang.Thread.State: BLOCKED (on object monitor)` "waiting to lock <0x000000071ab3c8e0>". What does it tell you?',
          options: [
            { id: 'a', text: 'The threads are burning CPU in a tight loop' },
            { id: 'b', text: 'They are all waiting to enter the same synchronized block or method: heavy contention on one monitor (or a deadlock if the owner is also waiting)' },
            { id: 'c', text: 'They are waiting for network I/O' },
            { id: 'd', text: 'They are sleeping in Thread.sleep' },
          ],
          correctOptionId: 'b',
          explanation: 'BLOCKED means waiting for a monitor. Find the thread that "locked <0x...71ab3c8e0>" to see what the owner is doing.',
        },
        {
          id: 'pf1-c3',
          kind: 'multi-select',
          dimension: 'runtime',
          prompt: 'Which statements about Java Flight Recorder are true? Select all that apply.',
          options: [
            { id: 'a', text: 'It is built into the HotSpot JVM and free to use in OpenJDK since Java 11' },
            { id: 'b', text: 'It can be started on a running JVM with jcmd <pid> JFR.start' },
            { id: 'c', text: 'Its default settings are designed for low overhead (around 1%), so it can run in production' },
            { id: 'd', text: 'It requires the application to be restarted with a Java agent jar' },
            { id: 'e', text: 'Recordings can be analysed in JDK Mission Control or with the jfr command-line tool' },
          ],
          correctOptionIds: ['a', 'b', 'c', 'e'],
          explanation: 'JFR was open-sourced in JDK 11 (JEP 328) and backported to 8u262. It needs no agent; jcmd can start, dump and stop recordings at any time.',
        },
        {
          id: 'pf1-c4',
          kind: 'mcq',
          dimension: 'debugging',
          prompt: 'Throughput has dropped to zero, CPU is near 0% and the work queue keeps growing. Which first diagnostic step fits best?',
          options: [
            { id: 'a', text: 'A CPU flame graph' },
            { id: 'b', text: 'Several thread dumps a few seconds apart' },
            { id: 'c', text: 'A JMH benchmark of the worker code' },
            { id: 'd', text: 'Increase the heap size' },
          ],
          correctOptionId: 'b',
          explanation: 'Low CPU with no progress means threads are waiting: deadlock, exhausted pool, or a blocking call without a timeout. Thread dumps show what they wait for; a CPU profile would be nearly empty.',
        },
        {
          id: 'pf1-c5',
          kind: 'predict-output',
          dimension: 'interview',
          prompt: 'What does this program print?',
          code: `import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        long[] ms = {10, 10, 10, 10, 10, 10, 10, 10, 10, 910};
        Arrays.sort(ms);
        long mean = Arrays.stream(ms).sum() / ms.length;
        int rank = (50 * ms.length + 99) / 100;
        System.out.println("mean=" + mean + " p50=" + ms[rank - 1] + " max=" + ms[ms.length - 1]);
    }
}`,
          options: [
            { id: 'a', text: 'mean=100 p50=10 max=910' },
            { id: 'b', text: 'mean=10 p50=10 max=910' },
            { id: 'c', text: 'mean=100 p50=100 max=910' },
            { id: 'd', text: 'mean=91 p50=10 max=910' },
          ],
          correctOptionId: 'a',
          explanation: 'The total is 1000 ms over 10 requests, so the mean is 100 ms — ten times what 90% of users experience. The median is 10 ms and one user waits 910 ms.',
        },
        {
          id: 'pf1-c6',
          kind: 'mcq',
          dimension: 'runtime',
          prompt: 'Heap usage after each full GC rises steadily over two days. Which tool best answers "what is retaining the memory"?',
          options: [
            { id: 'a', text: 'A heap dump analysed with a dominator tree (e.g. Eclipse MAT)' },
            { id: 'b', text: 'A CPU flame graph' },
            { id: 'c', text: 'jcmd Thread.print' },
            { id: 'd', text: 'The average response time' },
          ],
          correctOptionId: 'a',
          explanation: 'Class histograms show what grows; the dominator tree in a heap dump shows which objects keep it reachable.',
        },
      ],
      challengeIds: ['boss-latency-report'],
      masteryCriteria: [
        'Explain with numbers why p99 matters more than the mean for user experience.',
        'Start, dump and read a JFR recording with jcmd and Mission Control or the jfr tool.',
        'Read a thread dump: states, the lock a thread waits for, its owner, and a reported deadlock.',
        'Pick the right evidence (thread dump, histogram, heap dump, GC log, flame graph) for a symptom.',
      ],
      relatedLessonIds: ['r-memory-areas', 'r-gc', 'cc-synchronization', 'perf-jmh', 'perf-optimisation', 'prod-observability'],
      revision: [
        { id: 'r1', question: 'Why are percentiles preferred to averages for latency?', answer: 'Latency is skewed; the mean is distorted by outliers yet hides how many users are slow. p50/p95/p99/max describe what real users experience. Percentiles must be computed from merged histograms, not averaged.' },
        { id: 'r2', question: 'How do you start a JFR recording on a running JVM?', answer: 'jcmd <pid> JFR.start settings=profile duration=60s filename=rec.jfr (then JFR.dump/JFR.stop); open the file in JDK Mission Control or with the jfr tool.' },
        { id: 'r3', question: 'What do BLOCKED and WAITING mean in a thread dump?', answer: 'BLOCKED: waiting to enter a synchronized monitor. WAITING/TIMED_WAITING: parked in Object.wait, LockSupport.park (locks, queues, futures) or sleep.' },
        { id: 'r4', question: 'What is a flame graph?', answer: 'A visualisation of sampled stacks: width is the share of samples, height is stack depth; wide frames at the top are where CPU (or allocations, or wall time) is spent.' },
      ],
    },
    {
      id: 'perf-jmh',
      moduleId: 'performance',
      title: 'Micro-benchmarking honestly with JMH',
      summary: 'Why naive System.nanoTime loops lie, how JMH avoids warm-up, dead-code and constant-folding traps, and how to read scores with their error margins.',
      estimatedMinutes: 35,
      difficulty: 'advanced',
      prerequisites: ['perf-diagnostics', 'r-memory-areas'],
      versionNotes: [
        { feature: 'JDK microbenchmark suite written with JMH (JEP 230, test/micro in the JDK source tree)', since: 12, note: 'JMH itself is an OpenJDK project shipped as a library, not part of the JDK' },
      ],
      objectives: [
        'Name the JIT effects that make hand-written timing loops misleading.',
        'Write a JMH benchmark with @Benchmark, @State, @Setup, @Param and Blackhole.',
        'Configure warm-up, measurement iterations and forks, and explain why each exists.',
        'Interpret a score with its error margin and decide whether two results really differ.',
      ],
      plainEnglish: `A micro-benchmark measures how long a small piece of code takes. It sounds easy — read the clock, run the code a million times, read the clock again — but on the JVM that almost always gives the wrong answer.

The JVM changes the code while you measure it: it starts slow (interpreted), gets faster when the JIT compiles it, and may even notice that your result is never used and **delete the work entirely**. Your loop then measures nothing at all and reports an impossibly fast time.

**JMH** is the OpenJDK tool built by the JVM engineers to get honest numbers: it warms the code up, runs it in fresh JVMs, stops the JIT from deleting your work, and tells you how uncertain each result is.`,
      technical: `### Why naive benchmarks lie
- **Warm-up / tiered compilation**: early iterations run in the interpreter or C1 code; C2 code arrives later. Timing everything mixes several programs.
- **On-stack replacement (OSR)**: a long loop in \`main\` is compiled mid-execution as an OSR version, which is often optimised differently from a normally called method.
- **Dead-code elimination (DCE)**: if a result is never used, C2 may remove the computation.
- **Constant folding**: if inputs are compile-time constants (\`final\` fields, literals), the result can be computed once at compile time.
- **Loop optimisations**: unrolling, hoisting invariant code out of the loop, or vectorising can make a loop of N calls cost far less than N single calls.
- **Profile pollution**: benchmarking implementations A then B in the same JVM — call sites that were monomorphic for A become polymorphic, so B looks slower.
- **Noise**: GC pauses, CPU frequency scaling, other processes, and \`System.currentTimeMillis\` granularity (use \`nanoTime\` for elapsed time, never wall-clock time).

### JMH essentials
- \`@Benchmark\` methods are called repeatedly by generated harness code. **Return the result** or pass it to a \`Blackhole\` so it cannot be eliminated.
- \`@State(Scope.Thread)\` / \`Scope.Benchmark\` classes hold inputs as **non-final fields**, initialised in \`@Setup\` (Level.Trial by default), which defeats constant folding.
- \`@Param({"10", "10000"})\` runs the benchmark for each input size — performance often changes shape with size (cache effects).
- \`@BenchmarkMode(Mode.AverageTime)\` with \`@OutputTimeUnit(TimeUnit.NANOSECONDS)\`, or \`Mode.Throughput\`, \`Mode.SampleTime\` (percentiles), \`Mode.SingleShotTime\` (cold start).
- \`@Warmup(iterations = 5, time = 1)\`, \`@Measurement(iterations = 5, time = 1)\`, \`@Fork(3)\`: forks run each benchmark in fresh JVMs so profiles of other benchmarks do not leak in and run-to-run variance becomes visible. Never use \`@Fork(0)\` for real results.
- Profilers: \`-prof gc\` (allocation rate per operation), \`-prof stack\`, \`-prof perfasm\` (Linux) to see generated assembly.
- Typical setup: a separate Maven/Gradle module (the \`jmh-java-benchmark-archetype\` or the Gradle JMH plugin), run with \`java -jar target/benchmarks.jar\`.

### Reading results
JMH prints \`Score\` and \`Error\` — the error is the half-width of a **99.9% confidence interval** computed from all measurement iterations across forks. If two intervals overlap, you have **not** shown a difference. Look at the unit (ns/op vs ops/s: lower vs higher is better), check \`-prof gc\` for allocation, and remember a micro-benchmark answers a narrow question: confirm the win in the real application with a profile or load test.`,
      whyItExists: `The JVM's adaptive optimisation is what makes Java fast, but it also invalidates simple timing. JMH encodes years of JVM engineering knowledge about benchmark pitfalls so that results are reproducible and comparable.`,
      whenToUse: [
        'Compare two implementations of a small, hot piece of code that a profile identified as important.',
        'Check how an algorithm scales with input size using @Param.',
        'Detect allocation per operation with -prof gc before and after a change.',
        'Guard performance-critical library code against regressions in CI (with stable hardware).',
      ],
      whenNotToUse: [
        'Do not micro-benchmark code that is not on a hot path — measure the whole system first.',
        'Do not use JMH to measure end-to-end latency of services; use load tests and production metrics.',
        'Do not trust results run inside an IDE, with @Fork(0), on a laptop on battery, or next to other heavy processes.',
      ],
      examples: [
        {
          id: 'pf-jmh-bench',
          title: 'A correct JMH benchmark',
          runnable: false,
          code: `import java.util.*;
import java.util.concurrent.TimeUnit;
import org.openjdk.jmh.annotations.*;
import org.openjdk.jmh.infra.Blackhole;

@BenchmarkMode(Mode.AverageTime)
@OutputTimeUnit(TimeUnit.NANOSECONDS)
@Warmup(iterations = 5, time = 1)
@Measurement(iterations = 5, time = 1)
@Fork(3)
@State(Scope.Thread)
public class ContainsBenchmark {

    @Param({"10", "1000", "100000"})
    int size;                          // non-final: no constant folding

    List<Integer> list;
    Set<Integer> set;
    int target;

    @Setup
    public void setUp() {
        list = new ArrayList<>();
        for (int i = 0; i < size; i++) list.add(i);
        set = new HashSet<>(list);
        target = size - 1;             // worst case for the list
    }

    @Benchmark
    public boolean listContains() {
        return list.contains(target);  // returning the result defeats dead-code elimination
    }

    @Benchmark
    public void setContains(Blackhole bh) {
        bh.consume(set.contains(target)); // Blackhole does the same for void methods
    }
}`,
          explanation: 'Run with java -jar target/benchmarks.jar ContainsBenchmark -prof gc. Expect listContains to grow linearly with size while setContains stays flat — and, at size 10, the two may be indistinguishable within the error.',
        },
        {
          id: 'pf-naive-bench',
          title: 'The naive benchmark and everything wrong with it',
          runnable: false,
          code: `public class NaiveBenchmark {
    public static void main(String[] args) {
        long start = System.currentTimeMillis();          // 1: wall clock, coarse granularity
        for (int i = 0; i < 1_000_000; i++) {             // 2: one long loop in main -> OSR compilation
            Math.log(42.0);                               // 3: constant input -> may be folded
                                                          // 4: result unused -> may be removed entirely
        }
        long elapsed = System.currentTimeMillis() - start; // 5: includes interpreter and C1 time (no warm-up)
        System.out.println("log takes " + (elapsed * 1_000_000.0 / 1_000_000) + " ns");
        // 6: a single run in a single JVM: no idea of the variance
    }
}`,
          explanation: 'Depending on JIT decisions this reports anything from "0 ns" (the loop was deleted) to a number dominated by interpretation. The time is meaningless either way, which is why this example is not run here.',
        },
        {
          id: 'pf-jmh-error',
          title: 'Reading scores: do the confidence intervals overlap?',
          runnable: true,
          code: `import java.util.Locale;

public class Main {
    record Result(String name, double score, double error) {
        double low()  { return score - error; }
        double high() { return score + error; }
        String show() { return String.format(Locale.ROOT, "%-12s %7.1f +- %5.1f ns/op", name, score, error); }
    }

    static String compare(Result a, Result b) {
        boolean overlap = a.low() <= b.high() && b.low() <= a.high();
        if (overlap) return a.name() + " vs " + b.name() + ": no significant difference";
        Result faster = a.score() < b.score() ? a : b;
        Result slower = faster == a ? b : a;
        return String.format(Locale.ROOT, "%s is faster by %.1fx", faster.name(), slower.score() / faster.score());
    }

    public static void main(String[] args) {
        // Scores as JMH reports them (AverageTime, lower is better), copied from a run
        Result concat = new Result("concat", 412.7, 18.3);
        Result builder = new Result("builder", 398.2, 21.5);
        Result joiner = new Result("joiner", 96.4, 3.1);

        for (Result r : new Result[] {concat, builder, joiner}) System.out.println(r.show());
        System.out.println(compare(concat, builder));
        System.out.println(compare(builder, joiner));
    }
}`,
          expectedOutput: `concat         412.7 +-  18.3 ns/op
builder        398.2 +-  21.5 ns/op
joiner          96.4 +-   3.1 ns/op
concat vs builder: no significant difference
joiner is faster by 4.1x`,
          explanation: 'The numbers are fixed sample scores so the output is deterministic. 412.7 and 398.2 look different, but their 99.9% intervals overlap, so this run does not show that one is faster. Overlapping intervals are a quick sanity check, not a full statistical test.',
        },
      ],
      walkthrough: {
        exampleId: 'pf-jmh-bench',
        steps: [
          { lines: [6, 10], text: 'The mode and unit decide what Score means (average ns per call). Warm-up iterations let C2 compile the code before measurement; three forks run everything in fresh JVMs.' },
          { lines: [11, 11], text: '@State(Scope.Thread) gives each benchmark thread its own instance, so no accidental sharing or contention.' },
          { lines: [14, 15], text: '@Param runs every benchmark for each size. The field is not final, so the JIT cannot treat it as a constant.' },
          { lines: [21, 27], text: '@Setup runs before measurement (once per trial by default), so building the collections is not timed.' },
          { lines: [29, 32], text: 'Returning the result makes JMH consume it, so the contains call cannot be eliminated as dead code.' },
          { lines: [34, 37], text: 'For void benchmarks or several results, pass values to a Blackhole, which the JIT cannot see through.' },
        ],
      },
      realWorld: {
        title: 'The 40x speed-up that did not exist',
        scenario: `A developer replaced a hand-written parser with a regex-based one and posted a benchmark: "old: 2,100 ns, new: 51 ns". The benchmark parsed the same string literal in a loop and discarded the result. C2 had folded the constant input and eliminated the unused result of the new version, so it measured an empty loop.

Rewritten in JMH — input in a \`@State\` field, result returned, three forks — the regex version scored 1,940 +- 160 ns/op against 2,050 +- 140 ns/op: no significant difference, and \`-prof gc\` showed it allocated three times more per call. A JFR profile of the real service then showed parsing was under 1% of CPU anyway. The team kept the simpler code and moved on to the database calls that actually dominated latency.`,
      },
      commonMistakes: [
        {
          mistake: 'Timing a loop in main with System.currentTimeMillis.',
          why: 'Coarse clock, no warm-up, OSR compilation, possible dead-code elimination and constant folding.',
          fix: 'Use JMH; if you must time something by hand, use System.nanoTime, warm up and consume the result.',
        },
        {
          mistake: 'Storing benchmark inputs in static final fields or literals.',
          why: 'The JIT can fold the computation into a constant.',
          fix: 'Keep inputs in non-final @State fields initialised in @Setup.',
        },
        {
          mistake: 'Declaring a winner from scores whose error margins overlap.',
          why: 'The difference is within run-to-run noise; another run may reverse it.',
          fix: 'Add forks and iterations, reduce noise, or report "no measurable difference".',
        },
        {
          mistake: 'Optimising based on a micro-benchmark without checking the real application.',
          why: 'A 10x win on code that takes 0.5% of request time is invisible to users.',
          fix: 'Profile the application first; verify improvements with production-like load tests.',
        },
      ],
      checks: [
        {
          id: 'pf2-c1',
          kind: 'mcq',
          dimension: 'runtime',
          prompt: 'A benchmark computes `Math.sqrt(x)` in a loop but never uses the result. It reports 0.3 ns per call. What is the most likely explanation?',
          options: [
            { id: 'a', text: 'sqrt is a single CPU instruction, so this is accurate' },
            { id: 'b', text: 'The JIT eliminated the unused computation (dead-code elimination), so the loop measures almost nothing' },
            { id: 'c', text: 'The garbage collector sped up' },
            { id: 'd', text: 'System.nanoTime is broken' },
          ],
          correctOptionId: 'b',
          explanation: 'Return the value from the @Benchmark method or pass it to a Blackhole so the JIT must compute it.',
        },
        {
          id: 'pf2-c2',
          kind: 'multi-select',
          dimension: 'runtime',
          prompt: 'Which JMH features exist mainly to protect against JIT effects? Select all that apply.',
          options: [
            { id: 'a', text: 'Warm-up iterations' },
            { id: 'b', text: 'Blackhole.consume' },
            { id: 'c', text: 'Non-final @State fields for inputs' },
            { id: 'd', text: 'Running each benchmark in forked JVMs' },
            { id: 'e', text: '@OutputTimeUnit' },
          ],
          correctOptionIds: ['a', 'b', 'c', 'd'],
          explanation: 'Warm-up waits for C2, Blackhole prevents dead-code elimination, @State fields prevent constant folding, forks isolate profiles between benchmarks. @OutputTimeUnit only formats the result.',
        },
        {
          id: 'pf2-c3',
          kind: 'mcq',
          dimension: 'interview',
          prompt: 'JMH reports A: 120.0 +- 15.0 ns/op and B: 110.0 +- 12.0 ns/op (AverageTime). What can you conclude?',
          options: [
            { id: 'a', text: 'B is about 9% faster' },
            { id: 'b', text: 'A is faster because its score is higher' },
            { id: 'c', text: 'The intervals [105, 135] and [98, 122] overlap, so this run shows no significant difference' },
            { id: 'd', text: 'The benchmark is broken because the errors differ' },
          ],
          correctOptionId: 'c',
          explanation: 'The Error column is a 99.9% confidence half-width. Overlapping intervals mean the difference may be noise.',
        },
        {
          id: 'pf2-c4',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'Why does JMH run benchmarks in several forked JVMs by default?',
          options: [
            { id: 'a', text: 'To use more CPU cores in parallel' },
            { id: 'b', text: 'So that JIT profiles and compilation decisions from one benchmark (or one run) do not distort another, and run-to-run variance is captured' },
            { id: 'c', text: 'Because the JVM can only run one benchmark method per process' },
            { id: 'd', text: 'To avoid garbage collection' },
          ],
          correctOptionId: 'b',
          explanation: 'Profile pollution makes later benchmarks in the same JVM look slower; separate JVMs also reveal variance caused by different compilation outcomes.',
        },
        {
          id: 'pf2-c5',
          kind: 'predict-output',
          dimension: 'interview',
          prompt: 'A team compares two JMH scores (Throughput mode, higher is better). What does this program print?',
          code: `public class Main {
    public static void main(String[] args) {
        double aScore = 5200, aError = 300;   // ops/ms
        double bScore = 6100, bError = 250;
        boolean overlap = aScore - aError <= bScore + bError && bScore - bError <= aScore + aError;
        String winner = overlap ? "none" : (aScore > bScore ? "A" : "B");
        System.out.println("overlap=" + overlap + " winner=" + winner);
    }
}`,
          options: [
            { id: 'a', text: 'overlap=true winner=none' },
            { id: 'b', text: 'overlap=false winner=A' },
            { id: 'c', text: 'overlap=false winner=B' },
            { id: 'd', text: 'overlap=true winner=B' },
          ],
          correctOptionId: 'c',
          explanation: 'A spans [4900, 5500] and B spans [5850, 6350]; they do not overlap. In Throughput mode the higher score wins, so B.',
        },
      ],
      challengeIds: [],
      masteryCriteria: [
        'List at least four reasons a hand-written timing loop is wrong on the JVM.',
        'Write a JMH benchmark that cannot be constant-folded or dead-code-eliminated.',
        'Explain warm-up, measurement iterations and forks.',
        'Decide from Score and Error whether a difference is real, and confirm it in the real application.',
      ],
      relatedLessonIds: ['r-memory-areas', 'perf-diagnostics', 'perf-optimisation'],
      revision: [
        { id: 'r1', question: 'What is dead-code elimination and how does JMH defend against it?', answer: 'The JIT removes computations whose results are never used. Return the result from the @Benchmark method or pass it to Blackhole.consume.' },
        { id: 'r2', question: 'Why must benchmark inputs be non-final @State fields?', answer: 'Constants (literals, static finals) can be folded at compile time, so the measured code does no real work.' },
        { id: 'r3', question: 'What does the Error column in JMH output mean?', answer: 'The half-width of a 99.9% confidence interval for the score, from all measurement iterations across forks; overlapping intervals mean no demonstrated difference.' },
        { id: 'r4', question: 'What is OSR and why does it matter for benchmarks?', answer: 'On-stack replacement compiles a long-running loop while it executes; the OSR version may be optimised differently from normal calls, so a single big loop in main is not representative.' },
      ],
    },
    {
      id: 'perf-optimisation',
      moduleId: 'performance',
      title: 'Optimisations that actually pay off',
      summary: 'The usual real wins: better algorithms and data structures, less allocation and boxing, StringBuilder, caching, batching I/O and avoiding chatty remote calls.',
      estimatedMinutes: 30,
      difficulty: 'intermediate',
      prerequisites: ['perf-diagnostics', 'c-collections-overview'],
      versionNotes: [
        { feature: 'Compact strings (Latin-1 strings use 1 byte per char)', since: 9 },
        { feature: 'String concatenation with + compiled to invokedynamic (StringConcatFactory)', since: 9 },
        { feature: 'Virtual threads make blocking I/O cheap to scale', since: 21 },
      ],
      objectives: [
        'Rank optimisation opportunities: algorithm and I/O first, micro-tweaks last.',
        'Reduce allocation and boxing in hot loops without hurting readability.',
        'Pick collections by access pattern and size them sensibly.',
        'Batch I/O and remote calls and cache with bounds and expiry.',
      ],
      plainEnglish: `Most real speed-ups come from doing **less work**, not doing the same work cleverly:

- use an algorithm that does fewer steps (a HashSet lookup instead of scanning a list),
- make fewer trips to slow things (one database query instead of a hundred, one buffered write instead of thousands of tiny ones),
- create fewer temporary objects in the code that runs millions of times,
- remember results you will need again (caching) — but with a size limit.

Clever low-level tricks come last, and only when a profile says the code is hot.`,
      technical: `### Order of attack
1. **Remove remote round trips**: N+1 queries, chatty service calls, missing indexes. A network call costs 0.5-50 ms; a HashMap lookup costs nanoseconds.
2. **Algorithm and data structure**: O(n^2) to O(n log n) or O(n) beats any tuning. \`list.contains\` in a loop is the classic hidden O(n^2); \`HashSet\`/\`HashMap\` turn it into O(n). \`ArrayList\` beats \`LinkedList\` for almost everything (cache locality). \`ArrayDeque\` for stacks and queues. \`EnumMap\`/\`EnumSet\` for enum keys.
3. **Batch I/O**: buffered streams (\`BufferedWriter\`, \`BufferedOutputStream\`), JDBC batch inserts, bulk APIs. Each system call or network packet has fixed overhead.
4. **Allocation and boxing**: in hot loops prefer primitives (\`long\` over \`Long\`, \`IntStream\` over \`Stream<Integer>\`, primitive arrays), avoid creating objects you discard immediately, pre-size collections when the size is known (\`new ArrayList<>(n)\`, \`HashMap.newHashMap(n)\` since Java 19). Young-generation allocation is cheap, but the allocation rate drives GC frequency — check it with JFR or \`-prof gc\`.
5. **Strings**: \`+\` in a single expression is fine (since Java 9 it compiles to an optimised invokedynamic call). Concatenating in a **loop** creates a new string each iteration (O(n^2) copying) — use \`StringBuilder\` or \`String.join\`/\`Collectors.joining\`. Precompile regexes (\`Pattern.compile\` once, not \`String.split\`/\`matches\` with complex patterns in a hot loop). Guard expensive log message construction with parameterised logging.
6. **Caching**: memoise expensive pure computations and remote lookups, always with a maximum size and expiry (e.g. Caffeine). An unbounded cache is a memory leak. Measure the hit rate.
7. **Concurrency**: parallelise independent I/O (virtual threads, \`CompletableFuture\`), shrink critical sections, prefer \`ConcurrentHashMap\`/\`LongAdder\` to global locks. Parallel streams only help for large CPU-bound workloads.

### Keep the evidence loop
Every change: hypothesis from a profile, one change, re-measure the same metric (percentiles, throughput, allocation rate). Revert changes that do not move the metric — they only add complexity.`,
      whyItExists: `Hardware is fast but not free: memory access, allocation, system calls and network round trips each have costs that differ by orders of magnitude. Knowing those costs lets you focus effort where it changes the result.`,
      whenToUse: [
        'When a profile shows a specific hot method, allocation site, query or lock.',
        'When choosing data structures for code you know will process large inputs.',
        'When an endpoint makes many remote calls or writes many small records.',
      ],
      whenNotToUse: [
        'Do not micro-optimise cold code at the cost of readability.',
        'Do not add caches without bounds, expiry and an invalidation story.',
        'Do not replace clear stream pipelines with manual loops unless a measurement shows the pipeline is a bottleneck.',
      ],
      examples: [
        {
          id: 'pf-algorithm',
          title: 'Algorithm first: counting the work',
          runnable: true,
          code: `import java.util.*;

public class Main {
    static long comparisons = 0;

    // O(n^2): for each order, scan the whole list of known customers
    static int countKnownSlow(List<String> orders, List<String> customers) {
        int known = 0;
        for (String customer : orders) {
            for (String c : customers) {
                comparisons++;
                if (c.equals(customer)) { known++; break; }
            }
        }
        return known;
    }

    // O(n): build a HashSet once, then each lookup is O(1) on average
    static int countKnownFast(List<String> orders, List<String> customers) {
        Set<String> index = new HashSet<>(customers);
        int known = 0;
        for (String customer : orders) {
            comparisons++;
            if (index.contains(customer)) known++;
        }
        return known;
    }

    public static void main(String[] args) {
        List<String> customers = new ArrayList<>();
        for (int i = 0; i < 5_000; i++) customers.add("cust-" + i);
        List<String> orders = new ArrayList<>();
        for (int i = 0; i < 5_000; i++) orders.add("cust-" + (i * 7 % 10_000));

        comparisons = 0;
        System.out.println("slow: known=" + countKnownSlow(orders, customers) + " steps=" + comparisons);
        comparisons = 0;
        System.out.println("fast: known=" + countKnownFast(orders, customers) + " steps=" + comparisons);
    }
}`,
          expectedOutput: `slow: known=2857 steps=17857857
fast: known=2857 steps=5000`,
          explanation: 'Counting steps instead of printing timings keeps the output deterministic and shows the real point: the slow version does almost 18 million comparisons, the fast one 5,000 lookups. No JIT tuning can close a gap of that size.',
        },
        {
          id: 'pf-batching',
          title: 'Batching I/O: counting the expensive calls',
          runnable: true,
          code: `import java.io.*;
import java.nio.charset.StandardCharsets;

public class Main {
    // Stands in for a file or socket: every write call here would be a system call
    static class CountingStream extends OutputStream {
        int calls = 0;
        long bytes = 0;
        @Override public void write(int b) { calls++; bytes++; }
        @Override public void write(byte[] b, int off, int len) { calls++; bytes += len; }
    }

    static void writeLines(OutputStream out) throws IOException {
        for (int i = 0; i < 1000; i++) {
            out.write(String.format("line %04d%n", i).getBytes(StandardCharsets.US_ASCII));
        }
        out.flush();
    }

    public static void main(String[] args) throws IOException {
        CountingStream direct = new CountingStream();
        writeLines(direct);
        System.out.println("unbuffered: " + direct.calls + " calls, " + direct.bytes + " bytes");

        CountingStream device = new CountingStream();
        writeLines(new BufferedOutputStream(device, 8192));
        System.out.println("buffered:   " + device.calls + " calls, " + device.bytes + " bytes");
    }
}`,
          expectedOutput: `unbuffered: 1000 calls, 10000 bytes
buffered:   2 calls, 10000 bytes`,
          explanation: 'The same 10,000 bytes reach the device in 2 calls instead of 1,000. The same principle applies to JDBC batch inserts, bulk HTTP APIs and message producers that batch records.',
        },
        {
          id: 'pf-allocation',
          title: 'Hot-loop allocation and boxing',
          runnable: false,
          code: `// Before: boxes every value, builds strings with + in a loop
Long total = 0L;
String csv = "";
for (Order o : orders) {
    total += o.cents();                  // unbox, add, box a new Long each time
    csv += o.id() + ",";                 // copies the whole string each iteration: O(n^2)
}

// After: primitives and a single builder
long total = 0;
StringBuilder csv = new StringBuilder(orders.size() * 12);  // pre-sized
for (Order o : orders) {
    total += o.cents();
    csv.append(o.id()).append(',');
}

// Or, when it reads better and is not measurably slower:
long total2 = orders.stream().mapToLong(Order::cents).sum();
String csv2 = orders.stream().map(Order::id).collect(Collectors.joining(","));`,
          explanation: 'Measure allocation with JFR (allocation by site) or JMH -prof gc before and after. The stream version is often fast enough and clearer; choose the loop only when the profile says so.',
        },
      ],
      walkthrough: {
        exampleId: 'pf-algorithm',
        steps: [
          { lines: [6, 16], text: 'For every order, the slow version scans the customer list until it finds a match. Unknown customers scan all 5,000 entries: n x m work.' },
          { lines: [18, 27], text: 'The fast version pays once to build a HashSet (O(m)), then each lookup hashes the string and checks one bucket: O(n + m) overall.' },
          { lines: [30, 33], text: 'The order ids i * 7 % 10,000 are all distinct; the 2,857 below 5,000 are known customers, and every other id forces a full scan in the slow version.' },
          { lines: [35, 38], text: 'Same answer, about 3,500 times fewer steps. This is the kind of win profiles should lead you to before any micro-tuning.' },
        ],
      },
      realWorld: {
        title: 'A nightly job from 3 hours to 4 minutes',
        scenario: `A reconciliation job compared 2 million payments with 2 million bank lines. A flame graph showed 90% of CPU in \`ArrayList.indexOf\` — each payment searched the bank list linearly. JFR also showed one JDBC round trip per payment to load the merchant name.

Indexing bank lines in a \`HashMap\` keyed by reference, and loading merchants with one query into a map up front, cut the run from 3 hours to 4 minutes. Afterwards the profile showed string formatting in the report writer at the top; wrapping the \`FileWriter\` in a \`BufferedWriter\` saved another 40 seconds. Nobody touched GC flags.`,
      },
      commonMistakes: [
        {
          mistake: 'Calling list.contains or indexOf inside a loop over another large collection.',
          why: 'Hidden O(n x m) work.',
          fix: 'Build a HashSet or HashMap index once.',
        },
        {
          mistake: 'Concatenating strings with += inside a loop.',
          why: 'Each iteration copies the whole string built so far: quadratic time and garbage.',
          fix: 'Use StringBuilder, String.join or Collectors.joining.',
        },
        {
          mistake: 'Using Long/Integer accumulators and List<Integer> for large numeric work.',
          why: 'Boxing allocates and adds pointer chasing.',
          fix: 'Use primitives, primitive arrays and IntStream/LongStream.',
        },
        {
          mistake: 'Adding an unbounded HashMap cache to fix a slow lookup.',
          why: 'It becomes a memory leak and serves stale data.',
          fix: 'Use a bounded cache with expiry (e.g. Caffeine) and monitor its hit rate.',
        },
      ],
      checks: [
        {
          id: 'pf3-c1',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'An endpoint takes 900 ms. JFR shows 120 JDBC queries per request (one per order line) and 2% of time in JSON serialisation. What should you do first?',
          options: [
            { id: 'a', text: 'Switch to a faster JSON library' },
            { id: 'b', text: 'Replace the per-line queries with one query (join or IN clause) — remove the N+1 round trips' },
            { id: 'c', text: 'Tune the garbage collector' },
            { id: 'd', text: 'Add more CPU' },
          ],
          correctOptionId: 'b',
          explanation: 'Round trips dominate. Serialisation is 2% of time, so even eliminating it would barely matter.',
        },
        {
          id: 'pf3-c2',
          kind: 'predict-output',
          dimension: 'coding',
          prompt: 'How many times does the inner comparison run?',
          code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<Integer> ids = List.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
        int checks = 0;
        int duplicates = 0;
        for (int i = 0; i < ids.size(); i++) {
            for (int j = i + 1; j < ids.size(); j++) {
                checks++;
                if (ids.get(i).equals(ids.get(j))) duplicates++;
            }
        }
        System.out.println(checks + " " + duplicates);
    }
}`,
          options: [
            { id: 'a', text: '100 0' },
            { id: 'b', text: '45 0' },
            { id: 'c', text: '10 0' },
            { id: 'd', text: '90 0' },
          ],
          correctOptionId: 'b',
          explanation: 'All pairs i < j: n(n-1)/2 = 45. For 100,000 ids that becomes about 5 billion checks; a HashSet needs 100,000.',
        },
        {
          id: 'pf3-c3',
          kind: 'multi-select',
          dimension: 'coding',
          prompt: 'Which changes typically reduce allocation in a hot loop? Select all that apply.',
          options: [
            { id: 'a', text: 'Using long instead of Long for an accumulator' },
            { id: 'b', text: 'Using StringBuilder instead of += on a String in the loop' },
            { id: 'c', text: 'Pre-sizing an ArrayList whose final size is known' },
            { id: 'd', text: 'Calling System.gc() after the loop' },
            { id: 'e', text: 'Using mapToInt(...).sum() instead of map(...).reduce(0, Integer::sum)' },
          ],
          correctOptionIds: ['a', 'b', 'c', 'e'],
          explanation: 'Primitives avoid boxing, a builder avoids intermediate strings, pre-sizing avoids repeated array growth. System.gc() does not reduce allocation.',
        },
        {
          id: 'pf3-c4',
          kind: 'mcq',
          dimension: 'interview',
          prompt: 'Is `String s = "Hello, " + name + "!";` a performance problem in modern Java?',
          options: [
            { id: 'a', text: 'Yes, always use StringBuilder' },
            { id: 'b', text: 'No: a single concatenation expression is compiled efficiently (invokedynamic since Java 9); only repeated concatenation in a loop is a problem' },
            { id: 'c', text: 'Yes, because strings are immutable' },
            { id: 'd', text: 'Only on Java 21' },
          ],
          correctOptionId: 'b',
          explanation: 'StringConcatFactory builds the result in one go. The quadratic problem appears when a loop keeps creating longer and longer strings.',
        },
      ],
      challengeIds: [],
      masteryCriteria: [
        'Prioritise round trips and algorithmic complexity over micro-optimisations.',
        'Rewrite a hot loop to avoid boxing and quadratic string building.',
        'Explain why buffering and batching reduce cost, with a concrete count of calls.',
        'Add a cache with bounds and expiry, and say how you would measure that it helps.',
      ],
      relatedLessonIds: ['perf-diagnostics', 'perf-jmh', 'c-collections-overview', 'c-hashmap', 't-strings', 't-wrappers', 'fn-streams'],
      revision: [
        { id: 'r1', question: 'What usually gives the biggest performance wins?', answer: 'Removing remote round trips (N+1 queries, chatty calls) and choosing better algorithms and data structures; batching I/O; then reducing allocation in measured hot spots.' },
        { id: 'r2', question: 'When is StringBuilder necessary?', answer: 'When building a string across loop iterations; a single + expression is already optimised by the compiler.' },
        { id: 'r3', question: 'What must every cache have?', answer: 'A maximum size, an expiry or invalidation strategy, and a measured hit rate.' },
      ],
    },
  ],
};
