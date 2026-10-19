import type { CurriculumModule } from '@/types/curriculum';

export const concurrencyModule: CurriculumModule = {
  id: 'concurrency',
  order: 9,
  title: 'Multithreading, the Java Memory Model and Virtual Threads',
  shortTitle: 'Concurrency',
  summary: 'Threads, executors and futures, virtual threads, race conditions, locks, visibility, deadlocks and the concurrent toolkit.',
  level: 'advanced',
  prerequisites: ['jvm-runtime'],
  bossChallengeId: 'boss-concurrent-ledger',
  lessons: [
    {
      id: 'cc-threads',
      moduleId: 'concurrency',
      title: 'Threads, executors, futures and virtual threads',
      summary: 'Running work concurrently with ExecutorService, collecting results with Future and CompletableFuture, and when virtual threads help.',
      estimatedMinutes: 40,
      difficulty: 'advanced',
      prerequisites: ['fn-lambdas', 'r-memory-areas'],
      versionNotes: [
        { feature: 'java.util.concurrent (ExecutorService, Future)', since: 5 },
        { feature: 'CompletableFuture', since: 8 },
        { feature: 'ExecutorService implements AutoCloseable', since: 19 },
        { feature: 'Virtual threads (JEP 444)', since: 21, note: 'Preview in 19-20, final in 21' },
        { feature: 'synchronized no longer pins virtual threads (JEP 491)', since: 24 },
      ],
      objectives: [
        'Start threads correctly and explain the difference between run() and start().',
        'Submit tasks to an ExecutorService and collect results with Future and CompletableFuture.',
        'Close executors with try-with-resources and handle task failures.',
        'Explain what virtual threads are, when they help (blocking I/O) and when they do not (CPU-bound work).',
      ],
      plainEnglish: `A **thread** is an independent path of execution inside your program. Every Java program starts with one (the \`main\` thread); you can start more so that several things happen at once — handling many requests, or splitting a big computation across CPU cores.

Creating threads by hand gets messy quickly, so Java gives you **executors**: you hand them tasks, they run the tasks on threads they manage, and they give you back a **Future** — a receipt you can later exchange for the result (or the exception).

**Virtual threads** (final in Java 21) are very cheap threads managed by the JVM instead of the operating system. You can have millions of them, which makes the simple "one thread per request" style scale for programs that spend most of their time *waiting* — for databases, HTTP calls or files.`,
      technical: `### Platform threads
\`new Thread(runnable).start()\` creates an OS thread (a **platform thread**) with its own stack (about 1 MB reserved by default). \`start()\` runs the task on the new thread; calling \`run()\` directly just executes it on the *current* thread. \`join()\` waits for a thread to finish. An uncaught exception ends only that thread (it is printed by the default handler) — the main thread never sees it.

### Executors
An \`ExecutorService\` decouples *what* to run from *how* it runs:
- \`Executors.newFixedThreadPool(n)\` — n reusable platform threads and a queue; good for CPU-bound work with n near the core count.
- \`Executors.newVirtualThreadPerTaskExecutor()\` — a new virtual thread for every task.
- \`submit(Callable<T>)\` returns a \`Future<T>\`; \`invokeAll\` submits a batch.
- \`Future.get()\` blocks until the result is ready. If the task threw, \`get()\` throws \`ExecutionException\` whose \`getCause()\` is the original exception.

Since **Java 19** \`ExecutorService\` is \`AutoCloseable\`: \`close()\` calls \`shutdown()\` and waits for submitted tasks to finish, so try-with-resources gives you a clear scope. Before that, you had to call \`shutdown()\` and \`awaitTermination()\` yourself — and a forgotten shutdown kept the JVM alive, because pool threads are non-daemon.

### CompletableFuture (Java 8)
A \`CompletableFuture\` is a Future you can compose without blocking: \`supplyAsync\` starts work (on the common ForkJoinPool unless you pass an executor), \`thenApply\` transforms, \`thenCompose\` chains another async call, \`thenCombine\` joins two independent results, and \`exceptionally\`/\`handle\` recover from failures. \`join()\` waits like \`get()\` but throws the unchecked \`CompletionException\`. Failures that pass through dependent stages arrive wrapped in \`CompletionException\` — use \`getCause()\`.

### Virtual threads (Java 21, JEP 444)
A virtual thread is a \`Thread\` whose stack lives on the heap. The JVM **mounts** it on a small pool of carrier (platform) threads; when it blocks on I/O, \`Thread.sleep\`, a lock or a \`BlockingQueue\`, it **unmounts** and the carrier runs another virtual thread. Create them with \`Thread.ofVirtual().start(r)\`, \`Thread.startVirtualThread(r)\` or \`Executors.newVirtualThreadPerTaskExecutor()\`.

- **They help** when you have many concurrent tasks that mostly wait (blocking I/O): throughput scales with the number of tasks, not the number of OS threads, while code stays plain and blocking.
- **They do not help** CPU-bound work: there are still only as many cores as there are. They are not faster threads, just cheaper ones.
- **Do not pool them.** Create one per task; limit access to scarce resources with a \`Semaphore\` or a connection pool instead.
- **Pinning:** in Java 21-23 a virtual thread that blocks *inside* a \`synchronized\` block stays pinned to its carrier, which can starve the carriers. **Java 24 (JEP 491)** removed this for \`synchronized\`; blocking inside native code (JNI) or class initialisers can still pin. On 21-23, prefer \`ReentrantLock\` around blocking calls.
- Be careful with large \`ThreadLocal\` caches: with millions of threads, per-thread caches multiply.`,
      whyItExists: `CPUs have many cores and servers spend most of their time waiting on networks and disks, so a program that does one thing at a time wastes both. Executors exist because thread creation, reuse, queueing and shutdown are hard to get right by hand. Virtual threads exist because OS threads are too expensive to give every concurrent request its own — which pushed developers towards complex asynchronous callback code just to scale. Virtual threads bring back simple blocking code at that scale.`,
      whenToUse: [
        'Use an ExecutorService (in try-with-resources) instead of creating and managing raw threads.',
        'Use a fixed pool sized near the number of cores for CPU-bound work.',
        'Use virtual threads for many concurrent tasks that block on I/O (HTTP calls, JDBC, files).',
        'Use CompletableFuture to combine independent asynchronous results without blocking in between.',
      ],
      whenNotToUse: [
        'Do not use virtual threads to speed up CPU-bound computation — use a pool sized to the cores.',
        'Do not pool virtual threads or use them as a concurrency limit; use a Semaphore for that.',
        'Do not call get() or join() on a future immediately after submitting it — you have made the work sequential again.',
        'Do not start threads you never join or executors you never close.',
      ],
      examples: [
        {
          id: 'executor-futures',
          title: 'Splitting work across a pool, then composing futures',
          runnable: true,
          code: `import java.util.*;
import java.util.concurrent.*;

public class Main {
    static long sumRange(long from, long to) {
        long sum = 0;
        for (long i = from; i < to; i++) sum += i;
        return sum;
    }

    public static void main(String[] args) throws Exception {
        List<Future<Long>> futures = new ArrayList<>();
        try (ExecutorService pool = Executors.newFixedThreadPool(4)) {
            for (int part = 0; part < 4; part++) {
                long from = part * 250_000L, to = from + 250_000L;
                futures.add(pool.submit(() -> sumRange(from, to)));
            }
            long total = 0;
            for (Future<Long> f : futures) total += f.get();   // blocks until each part is done
            System.out.println("total = " + total);
        } // close(): no new tasks, wait for running ones, release the threads

        CompletableFuture<String> user = CompletableFuture.supplyAsync(() -> "ada");
        CompletableFuture<Integer> orders = CompletableFuture.supplyAsync(() -> 3);
        String summary = user
            .thenApply(String::toUpperCase)
            .thenCombine(orders, (name, count) -> name + " has " + count + " orders")
            .join();
        System.out.println(summary);
    }
}`,
          expectedOutput: `total = 499999500000
ADA has 3 orders`,
          explanation: 'The four parts run in parallel, but the output is deterministic because results are collected from the futures in submission order, not printed by the workers.',
        },
        {
          id: 'virtual-threads',
          title: '10,000 blocking tasks on virtual threads',
          runnable: true,
          minJavaVersion: 21,
          code: `import java.time.Duration;
import java.util.*;
import java.util.concurrent.*;

public class Main {
    static int fetch(int id) throws InterruptedException {
        Thread.sleep(Duration.ofMillis(100));   // stands in for a blocking HTTP or database call
        return id % 10;
    }

    public static void main(String[] args) throws Exception {
        long start = System.nanoTime();
        List<Future<Integer>> results = new ArrayList<>();
        try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
            for (int i = 0; i < 10_000; i++) {
                int id = i;
                results.add(executor.submit(() -> fetch(id)));
            }
        } // waits for all 10,000 tasks
        long sum = 0;
        for (Future<Integer> f : results) sum += f.get();
        long millis = Duration.ofNanos(System.nanoTime() - start).toMillis();

        System.out.println("tasks: " + results.size());
        System.out.println("sum: " + sum);
        System.out.println("much faster than 1000 s sequentially: " + (millis < 10_000));
        System.out.println("virtual: " + Thread.ofVirtual().unstarted(() -> { }).isVirtual());
    }
}`,
          expectedOutput: `tasks: 10000
sum: 45000
much faster than 1000 s sequentially: true
virtual: true`,
          explanation: 'Sequentially these tasks would take 10,000 x 100 ms = 1000 s. 10,000 platform threads would reserve around 10 GB of stack address space; 10,000 virtual threads cost a few MB of heap and finish in well under a second, because a sleeping virtual thread releases its carrier. If fetch() were CPU-bound instead, virtual threads would give no speed-up.',
        },
      ],
      walkthrough: {
        exampleId: 'executor-futures',
        steps: [
          { lines: [5, 9], text: 'A CPU-bound task: sum a range of numbers. It touches only its own local variables, so it needs no synchronization.' },
          { lines: [13, 17], text: 'A pool of 4 platform threads. Each submit() returns immediately with a Future; the captured from/to are effectively final locals, so every task gets its own range.' },
          { lines: [18, 20], text: 'Future.get() blocks until that part is finished. Collecting in submission order makes the result deterministic no matter which thread finishes first. If a task had thrown, get() would throw ExecutionException.' },
          { lines: [21, 21], text: 'Leaving the try block calls close(): the pool stops accepting tasks, waits for running ones and shuts its threads down. Without it the non-daemon pool threads would keep the JVM alive.' },
          { lines: [23, 28], text: 'Two independent async computations are combined without blocking in between; join() waits only once, for the final value.' },
        ],
      },
      realWorld: {
        title: 'An order service that ran out of threads',
        scenario: `An order service called three downstream APIs per request using a Tomcat pool of 200 platform threads. Each call took about 150 ms, mostly waiting. Under a traffic spike all 200 threads sat blocked on sockets, requests queued, and latency exploded even though CPU usage was 15%.

The team first tried a reactive rewrite, which made the code hard to read and debug. On Java 21 they instead enabled virtual threads for request handling (\`spring.threads.virtual.enabled=true\` in Spring Boot 3.2+) and issued the three calls concurrently with a virtual-thread executor. Throughput rose roughly in proportion to the number of in-flight requests. They added a \`Semaphore\` in front of the slowest downstream API so that the now-unlimited concurrency did not overload it, and moved a \`synchronized\` block around a blocking call to \`ReentrantLock\` to avoid pinning on Java 21.`,
      },
      commonMistakes: [
        {
          mistake: 'Calling run() instead of start().',
          why: 'run() executes the task on the current thread; nothing runs concurrently.',
          fix: 'Call start() on a Thread, or better, submit the task to an ExecutorService.',
          code: `Thread t = new Thread(task);
t.run();    // runs on the caller - no new thread
t.start();  // runs on a new thread`,
        },
        {
          mistake: 'Never shutting down an executor.',
          why: 'Pool threads are non-daemon threads, so the JVM never exits and tasks may be silently abandoned.',
          fix: 'Use try (ExecutorService pool = ...) { ... } on Java 19+, or shutdown() plus awaitTermination() in a finally block on older versions.',
        },
        {
          mistake: 'Ignoring the Future returned by submit().',
          why: 'An exception thrown by the task is stored in the Future. If nobody calls get(), the failure disappears without a trace.',
          fix: 'Call get() (and handle ExecutionException) or attach exceptionally/handle to a CompletableFuture.',
        },
        {
          mistake: 'Using virtual threads for CPU-heavy work or putting them in a pool.',
          why: 'Virtual threads make waiting cheap, not computing faster; pooling them throws away their main benefit.',
          fix: 'CPU-bound work: fixed pool near the core count. Blocking I/O: one virtual thread per task, with a Semaphore if a resource must be limited.',
        },
      ],
      checks: [
        {
          id: 'cc1-c1',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this program print?',
          code: `public class Main {
    public static void main(String[] args) throws InterruptedException {
        Thread t = new Thread(() -> System.out.println(Thread.currentThread().getName()), "worker");
        t.run();
        t.start();
        t.join();
    }
}`,
          options: [
            { id: 'a', text: 'worker\nworker' },
            { id: 'b', text: 'main\nworker' },
            { id: 'c', text: 'worker\nmain' },
            { id: 'd', text: 'main\nmain' },
          ],
          correctOptionId: 'b',
          explanation: 'run() is an ordinary method call, so the lambda runs on the main thread. start() creates the new thread named "worker"; join() waits for it, so the order is deterministic.',
        },
        {
          id: 'cc1-c2',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'Which workload benefits most from switching to virtual threads?',
          options: [
            { id: 'a', text: 'Resizing 10,000 images in memory on an 8-core machine' },
            { id: 'b', text: 'A service handling 5,000 concurrent requests that each wait on two HTTP calls and a database query' },
            { id: 'c', text: 'A single-threaded command-line tool that parses one file' },
            { id: 'd', text: 'A tight numeric loop that must finish faster' },
          ],
          correctOptionId: 'b',
          explanation: 'Virtual threads make blocking cheap, so many concurrent I/O-bound tasks no longer need an OS thread each. CPU-bound work is limited by cores, and virtual threads do not add cores.',
        },
        {
          id: 'cc1-c3',
          kind: 'multi-select',
          dimension: 'interview',
          prompt: 'Which statements about virtual threads are true? Select all that apply.',
          options: [
            { id: 'a', text: 'They became a final (non-preview) feature in Java 21.' },
            { id: 'b', text: 'They should be pooled and reused, like platform threads.' },
            { id: 'c', text: 'When a virtual thread blocks on I/O, its carrier thread can run other virtual threads.' },
            { id: 'd', text: 'In Java 21, blocking inside a synchronized block pins the virtual thread to its carrier; Java 24 removed that limitation.' },
            { id: 'e', text: 'They make CPU-bound code run faster.' },
          ],
          correctOptionIds: ['a', 'c', 'd'],
          explanation: 'Virtual threads (JEP 444) are final in 21. They are cheap enough to create one per task, so pooling is pointless. JEP 491 in Java 24 lets virtual threads block inside synchronized without pinning. They do not speed up computation.',
        },
        {
          id: 'cc1-c4',
          kind: 'predict-output',
          dimension: 'debugging',
          prompt: 'The supplier throws. What does this program print?',
          code: `import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) {
        String result = CompletableFuture
            .supplyAsync(() -> { if (true) throw new IllegalStateException("boom"); return "ok"; })
            .thenApply(s -> s + "!")
            .exceptionally(ex -> ex.getClass().getSimpleName() + ": " + ex.getCause().getMessage())
            .join();
        System.out.println(result);
    }
}`,
          options: [
            { id: 'a', text: 'ok!' },
            { id: 'b', text: 'IllegalStateException: boom' },
            { id: 'c', text: 'CompletionException: boom' },
            { id: 'd', text: 'Exception in thread "main" java.lang.IllegalStateException: boom' },
          ],
          correctOptionId: 'c',
          explanation: 'thenApply is skipped because its input failed. The failure reaches the dependent stage wrapped in a CompletionException, so exceptionally receives the wrapper and getCause() is the original IllegalStateException. Always unwrap with getCause() before deciding what went wrong.',
        },
        {
          id: 'cc1-c5',
          kind: 'mcq',
          dimension: 'debugging',
          prompt: 'A batch job prints its final report and then never exits. A thread dump shows four idle threads named pool-1-thread-1..4 waiting in LinkedBlockingQueue.take(). What is the bug?',
          options: [
            { id: 'a', text: 'A deadlock between the four threads' },
            { id: 'b', text: 'The ExecutorService was never shut down, and its non-daemon worker threads keep the JVM alive' },
            { id: 'c', text: 'The JIT compiler is still running' },
            { id: 'd', text: 'System.out was not flushed' },
          ],
          correctOptionId: 'b',
          explanation: 'Idle pool workers wait for new tasks forever. Close the executor (try-with-resources since Java 19) or call shutdown().',
        },
      ],
      challengeIds: ['ch-parallel-sum', 'ch-job-runner'],
      masteryCriteria: [
        'Run tasks with an ExecutorService in try-with-resources and collect results deterministically.',
        'Handle task failures through ExecutionException and CompletionException.',
        'Decide between a fixed pool and virtual threads for a given workload, and explain pinning.',
      ],
      relatedLessonIds: ['cc-synchronization', 'cc-concurrency-utilities', 'fn-lambdas', 'r-memory-areas', 'e-resources'],
      revision: [
        { id: 'r1', question: 'What is the difference between Thread.run() and Thread.start()?', answer: 'start() creates a new thread that then calls run(); calling run() directly just executes the code on the current thread.' },
        { id: 'r2', question: 'What does ExecutorService.close() do (Java 19+)?', answer: 'It initiates shutdown (no new tasks) and waits until all submitted tasks have finished, so try-with-resources bounds the executor\'s lifetime.' },
        { id: 'r3', question: 'When do virtual threads improve throughput?', answer: 'When there are many concurrent tasks that spend most of their time blocked on I/O. They do not speed up CPU-bound work.' },
        { id: 'r4', question: 'What is pinning?', answer: 'A virtual thread that cannot unmount from its carrier while blocked. In Java 21-23 this happens when blocking inside synchronized; Java 24 (JEP 491) fixed that case, but native frames still pin.' },
      ],
    },
    {
      id: 'cc-synchronization',
      moduleId: 'concurrency',
      title: 'Synchronization, the Java Memory Model and deadlocks',
      summary: 'Race conditions, synchronized, volatile and happens-before, atomics, locks, deadlock avoidance, concurrent collections and scoped values.',
      estimatedMinutes: 45,
      difficulty: 'advanced',
      prerequisites: ['cc-threads'],
      versionNotes: [
        { feature: 'Revised Java Memory Model (JSR 133)', since: 5 },
        { feature: 'ReentrantLock, atomics, ConcurrentHashMap', since: 5 },
        { feature: 'LongAdder; ConcurrentHashMap rewritten without segments', since: 8 },
        { feature: 'Scoped values (JEP 506)', since: 25, note: 'Incubator in 20, preview in 21-24, final in 25' },
        { feature: 'Structured concurrency (StructuredTaskScope)', since: 21, note: 'Still a preview API (incubator in 19-20, preview from 21; still preview in 25 and 26). Requires --enable-preview; not standard Java.' },
      ],
      objectives: [
        'Explain why unsynchronized shared mutable state produces lost updates and stale reads.',
        'Use synchronized, volatile, atomics, ReentrantLock and ConcurrentHashMap appropriately.',
        'Describe the happens-before relationships that make writes visible across threads.',
        'Recognise a deadlock and prevent it with a global lock order.',
        'State the status of scoped values (final in 25) and structured concurrency (preview).',
      ],
      plainEnglish: `When two threads change the same data at the same time, the results can be wrong in ways that are rare, random and hard to reproduce. \`count++\` looks like one step but is three: read, add, write. Two threads can both read 5, both write 6, and one increment is lost. That is a **race condition**.

There is a second, sneakier problem: **visibility**. Each core may keep values in registers and caches, and both the compiler and the CPU may reorder instructions. Without the right tools, one thread may simply never see another thread's write.

Java's answer is a set of rules — the **Java Memory Model** — and tools built on them: \`synchronized\` blocks and locks (only one thread at a time, and changes become visible), \`volatile\` fields (always visible), atomic variables, and thread-safe collections such as \`ConcurrentHashMap\`.`,
      technical: `### Race conditions
A data race is two threads accessing the same variable, at least one writing, with no happens-before ordering between them. Classic shapes: **read-modify-write** (\`count++\`) and **check-then-act** (\`if (!map.containsKey(k)) map.put(k, v)\`). Making each individual call thread-safe does not make a *sequence* of calls atomic.

### synchronized
\`synchronized (lock) { ... }\` (or a synchronized method, which locks \`this\` or the Class object) gives **mutual exclusion** and **visibility**: everything a thread did before releasing a monitor is visible to the next thread that acquires the same monitor. Monitors are **reentrant** — a thread holding a lock can acquire it again. Lock on a private final object rather than on \`this\` or on strings/boxed values, which other code may also lock.

### The Java Memory Model and happens-before
If action A **happens-before** B, then B sees A's effects. Key edges (JLS 17.4.5):
- program order within one thread;
- unlocking a monitor happens-before every later lock of the same monitor;
- a write to a **volatile** field happens-before every later read of that field;
- \`Thread.start()\` happens-before anything in the started thread; everything in a thread happens-before another thread returns from \`join()\` on it;
- executor and concurrent-collection hand-offs: submitting a task happens-before it runs, and the task happens-before \`Future.get()\` returns;
- the edges are transitive.

Without such an edge there is no guarantee — a loop reading a plain \`boolean\` flag may legally never see the update, because the JIT can hoist the read out of the loop.

### volatile
A \`volatile\` field is always read from and written to main memory in order: good for **flags** and for publishing an immutable object. It does **not** make compound actions atomic: \`volatileCount++\` still loses updates.

### Atomics
\`AtomicInteger\`, \`AtomicLong\` and \`AtomicReference\` provide lock-free atomic operations using compare-and-swap: \`incrementAndGet\`, \`compareAndSet\`, \`updateAndGet\`. Under heavy contention, \`LongAdder\` (Java 8) spreads updates across cells and is faster for counters you read rarely.

### Explicit locks
\`ReentrantLock\` does what \`synchronized\` does plus \`tryLock\` (optionally with a timeout), interruptible locking, fairness and multiple \`Condition\`s. Always unlock in \`finally\`:
\`\`\`java
lock.lock();
try { /* critical section */ } finally { lock.unlock(); }
\`\`\`
\`ReadWriteLock\` and \`StampedLock\` allow many concurrent readers.

### Deadlock
Thread 1 holds lock A and waits for B; thread 2 holds B and waits for A — both wait forever. All four Coffman conditions hold: mutual exclusion, hold-and-wait, no preemption, circular wait. Break the **cycle**: acquire locks in one global order (e.g. by account id), or use \`tryLock\` with a timeout and back off. A thread dump (\`jcmd <pid> Thread.print\` or \`jstack\`) reports "Found one Java-level deadlock" with the lock owners.

### Concurrent collections
\`ConcurrentHashMap\` allows concurrent reads and updates without locking the whole map, and provides **atomic compound operations**: \`merge\`, \`compute\`, \`computeIfAbsent\`, \`putIfAbsent\`. Its iterators are weakly consistent and never throw \`ConcurrentModificationException\`. Other tools: \`CopyOnWriteArrayList\` (read-mostly lists), \`BlockingQueue\` (producer-consumer), \`CountDownLatch\`, \`Semaphore\`. Avoid \`Collections.synchronizedMap\` and \`Hashtable\` for new code.

### Scoped values and structured concurrency
- **Scoped values** (\`ScopedValue\`, **final in Java 25**, JEP 506) share immutable data with code called during a bounded scope — for example a request id — without the leaks and unbounded lifetimes of \`ThreadLocal\`. They are inherited by child threads created through structured concurrency.
- **Structured concurrency** (\`StructuredTaskScope\`) treats a group of subtasks as one unit: if one fails the others are cancelled, and the scope cannot end while subtasks are still running. It is **still a preview API** (preview since 21; still preview in 25 and 26, with its API reshaped in 25). It needs \`--enable-preview\` and may change — do not present it as standard Java or use it in production code that must compile on future releases unchanged.`,
      whyItExists: `Modern hardware reorders and caches memory aggressively for speed. A memory model that promised strict sequential consistency everywhere would make every program slow. The JMM instead gives fast defaults and precise, minimal guarantees: if you use the synchronization tools correctly, your program behaves as if it were sequentially consistent (the "data-race-free" guarantee). The higher-level tools in java.util.concurrent exist because hand-written wait/notify and locking code is notoriously easy to get wrong.`,
      whenToUse: [
        'Prefer not sharing mutable state at all: confinement, immutable objects and message passing.',
        'Use atomics or LongAdder for single counters and flags that need atomic updates.',
        'Use ConcurrentHashMap with merge/compute for shared maps instead of check-then-act code.',
        'Use synchronized or ReentrantLock when several fields must change together (an invariant spanning variables).',
        'Use volatile for a simple stop flag or to publish an immutable snapshot.',
      ],
      whenNotToUse: [
        'Do not use volatile for counters or check-then-act logic.',
        'Do not hold a lock while calling unknown code (listeners, callbacks) or doing slow I/O.',
        'Do not wrap a whole ConcurrentHashMap update sequence in your own lock "to be safe" — use its atomic methods.',
        'Do not use preview APIs such as StructuredTaskScope in production builds unless you accept --enable-preview and API changes.',
      ],
      examples: [
        {
          id: 'counters',
          title: 'Four correct ways to count from many threads',
          runnable: true,
          code: `import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

public class Main {
    static int syncCount = 0;
    static final Object LOCK = new Object();
    static final AtomicInteger atomicCount = new AtomicInteger();
    static final LongAdder adder = new LongAdder();
    static final Map<String, Integer> hits = new ConcurrentHashMap<>();

    public static void main(String[] args) throws InterruptedException {
        List<Thread> threads = new ArrayList<>();
        for (int t = 0; t < 4; t++) {
            String page = t % 2 == 0 ? "/home" : "/cart";
            Thread thread = new Thread(() -> {
                for (int i = 0; i < 100_000; i++) {
                    synchronized (LOCK) { syncCount++; }
                    atomicCount.incrementAndGet();
                    adder.increment();
                    hits.merge(page, 1, Integer::sum);
                }
            });
            threads.add(thread);
            thread.start();
        }
        for (Thread thread : threads) thread.join();   // join() also makes the threads' writes visible

        System.out.println("synchronized: " + syncCount);
        System.out.println("atomic:       " + atomicCount.get());
        System.out.println("LongAdder:    " + adder.sum());
        System.out.println("hits:         " + new TreeMap<>(hits));
    }
}`,
          expectedOutput: `synchronized: 400000
atomic:       400000
LongAdder:    400000
hits:         {/cart=200000, /home=200000}`,
          explanation: 'Replace synchronized (LOCK) { syncCount++; } with a bare syncCount++ and the first line prints a different number below 400000 on almost every run - that is a lost-update race. The other three counters are always exact.',
        },
        {
          id: 'lock-ordering',
          title: 'Avoiding deadlock with a global lock order',
          runnable: true,
          code: `import java.util.concurrent.*;
import java.util.concurrent.locks.*;

public class Main {
    static final class Account {
        final int id;
        long balance;
        final ReentrantLock lock = new ReentrantLock();
        Account(int id, long balance) { this.id = id; this.balance = balance; }
    }

    // Always lock the account with the smaller id first: no cycle, so no deadlock.
    static void transfer(Account from, Account to, long amount) {
        Account first = from.id < to.id ? from : to;
        Account second = first == from ? to : from;
        first.lock.lock();
        try {
            second.lock.lock();
            try {
                from.balance -= amount;
                to.balance += amount;
            } finally {
                second.lock.unlock();
            }
        } finally {
            first.lock.unlock();
        }
    }

    public static void main(String[] args) {
        Account a = new Account(1, 1_000), b = new Account(2, 1_000);
        try (ExecutorService pool = Executors.newFixedThreadPool(2)) {
            pool.submit(() -> { for (int i = 0; i < 100_000; i++) transfer(a, b, 1); });
            pool.submit(() -> { for (int i = 0; i < 100_000; i++) transfer(b, a, 1); });
        }
        System.out.println("a = " + a.balance + ", b = " + b.balance);
        System.out.println("total = " + (a.balance + b.balance));
    }
}`,
          expectedOutput: `a = 1000, b = 1000
total = 2000`,
          explanation: 'If transfer() locked from first and then to, the two tasks would lock (a, b) and (b, a) in opposite orders and sooner or later deadlock. Ordering by id makes both tasks lock a before b.',
        },
        {
          id: 'volatile-flag',
          title: 'A volatile stop flag',
          runnable: true,
          code: `public class Main {
    private static volatile boolean running = true;   // without volatile the loop may never stop

    public static void main(String[] args) throws InterruptedException {
        long[] spins = new long[1];
        Thread worker = new Thread(() -> {
            long n = 0;
            while (running) n++;
            spins[0] = n;
        });
        worker.start();
        Thread.sleep(100);
        running = false;              // volatile write: guaranteed to become visible to the worker
        worker.join(5_000);
        System.out.println("worker stopped: " + !worker.isAlive());
        System.out.println("did some work: " + (spins[0] > 0));
    }
}`,
          expectedOutput: `worker stopped: true
did some work: true`,
          explanation: 'Without volatile, the JIT may hoist the read of running out of the loop and the worker can spin forever. For real cancellation, prefer interruption (Thread.interrupt / Future.cancel(true)) or closing the executor.',
        },
        {
          id: 'scoped-value',
          title: 'Scoped values (Java 25)',
          runnable: false,
          minJavaVersion: 25,
          code: `public class Main {
    static final ScopedValue<String> REQUEST_ID = ScopedValue.newInstance();

    static void handle() {
        log("loading order");
    }

    static void log(String message) {
        System.out.println("[" + REQUEST_ID.get() + "] " + message);
    }

    public static void main(String[] args) {
        ScopedValue.where(REQUEST_ID, "req-42").run(Main::handle);
        System.out.println("bound after scope: " + REQUEST_ID.isBound());
    }
}`,
          expectedOutput: `[req-42] loading order
bound after scope: false`,
          explanation: 'Needs Java 25 (on 21-24 ScopedValue is a preview API). The value is visible to everything called inside run() and automatically unbound afterwards, so it cannot leak into the next task on a pooled thread the way a forgotten ThreadLocal can.',
        },
      ],
      walkthrough: {
        exampleId: 'lock-ordering',
        steps: [
          { lines: [5, 10], text: 'Each account carries its own lock, so transfers between unrelated accounts can proceed in parallel.' },
          { lines: [13, 15], text: 'The key line: choose which lock to take first by a global order (the id), not by the direction of the transfer.' },
          { lines: [16, 27], text: 'Nested lock/try/finally: both locks are always released, in reverse order, even if the update throws.' },
          { lines: [31, 35], text: 'Two tasks transfer in opposite directions 100,000 times each. With direction-based locking this is the textbook deadlock; with ordering it always completes.' },
          { lines: [36, 37], text: 'Each pair of opposite transfers cancels out, and the total is conserved because both balances change under both locks.' },
        ],
      },
      realWorld: {
        title: 'The cache that sometimes returned half-built objects',
        scenario: `A pricing service cached exchange rates in a plain \`HashMap\` that a background thread refreshed every minute while request threads read it. Most of the time it worked. Occasionally requests saw missing currencies, and once a request thread spun at 100% CPU inside \`HashMap.get\` during a concurrent resize.

The fix had two parts. The refresher now builds a complete new immutable map and publishes it through a \`volatile\` field (\`rates = Map.copyOf(fresh)\`), so readers see either the old snapshot or the new one, never a half-built one. Per-currency hit counters moved from \`map.put(k, map.get(k) + 1)\` to \`ConcurrentHashMap.merge\`. A later incident — two batch jobs deadlocked updating the same pair of accounts in opposite orders — was found from the "Found one Java-level deadlock" section of a thread dump and fixed with lock ordering by account id.`,
      },
      commonMistakes: [
        {
          mistake: 'Using volatile for a counter.',
          why: 'volatile guarantees visibility, not atomicity: count++ is still read-add-write and loses updates.',
          fix: 'Use AtomicInteger/LongAdder, or a lock.',
          code: `private volatile int count;
void hit() { count++; }   // still a race`,
        },
        {
          mistake: 'Check-then-act on a concurrent map.',
          why: 'Each call is thread-safe, but another thread can act between containsKey and put.',
          fix: 'Use computeIfAbsent, putIfAbsent or merge, which are atomic.',
          code: `if (!cache.containsKey(key)) cache.put(key, load(key));   // two loads possible
cache.computeIfAbsent(key, k -> load(k));                    // atomic`,
        },
        {
          mistake: 'Acquiring the same locks in different orders in different code paths.',
          why: 'Opposite orders form a cycle; under load the threads eventually deadlock.',
          fix: 'Define a global order (id, hash with tie-breaker) or use tryLock with a timeout.',
        },
        {
          mistake: 'Synchronizing reads but not writes (or the other way round).',
          why: 'Visibility requires both sides to use the same monitor (or volatile); half-synchronized code still races.',
          fix: 'Guard every access to the shared state with the same lock, and document which lock guards which field.',
        },
      ],
      checks: [
        {
          id: 'cc2-c1',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'Two threads each run `count++` 1,000 times on a shared plain `int` field. Why can the final value be less than 2,000?',
          options: [
            { id: 'a', text: 'int overflows' },
            { id: 'b', text: 'count++ is a read, an add and a write; two threads can read the same value and one increment overwrites the other' },
            { id: 'c', text: 'The garbage collector resets the field' },
            { id: 'd', text: 'Threads run their loops fewer times than requested' },
          ],
          correctOptionId: 'b',
          explanation: 'That interleaving is a lost update. Make the read-modify-write atomic with a lock or an atomic variable.',
        },
        {
          id: 'cc2-c2',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'What does declaring a field `volatile` guarantee?',
          options: [
            { id: 'a', text: 'All operations on it, including ++, are atomic' },
            { id: 'b', text: 'A write to it happens-before every later read of it, so readers see the latest value and the writes that came before it' },
            { id: 'c', text: 'Only one thread can access it at a time' },
            { id: 'd', text: 'It is stored on the stack' },
          ],
          correctOptionId: 'b',
          explanation: 'volatile gives visibility and ordering, not mutual exclusion. Reads and writes of the field itself are atomic, but compound actions such as ++ are not.',
        },
        {
          id: 'cc2-c3',
          kind: 'multi-select',
          dimension: 'interview',
          prompt: 'Which of these create a happens-before edge between thread A\'s earlier writes and thread B\'s later reads? Select all that apply.',
          options: [
            { id: 'a', text: 'A releases a monitor that B then acquires' },
            { id: 'b', text: 'A writes a volatile field that B then reads' },
            { id: 'c', text: 'A finishes and B returns from A.join()' },
            { id: 'd', text: 'B reads a plain field after sleeping for one second' },
            { id: 'e', text: 'A calls Thread.start() on B' },
          ],
          correctOptionIds: ['a', 'b', 'c', 'e'],
          explanation: 'Monitor release/acquire, volatile write/read, join and start are all happens-before edges. Sleeping makes a stale read less likely in practice but guarantees nothing.',
        },
        {
          id: 'cc2-c4',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this program print?',
          code: `import java.util.concurrent.locks.ReentrantLock;

public class Main {
    public static void main(String[] args) {
        ReentrantLock lock = new ReentrantLock();
        lock.lock();
        lock.lock();
        System.out.print(lock.getHoldCount() + " ");
        lock.unlock();
        System.out.print(lock.isLocked() + " ");
        lock.unlock();
        System.out.println(lock.isLocked());
    }
}`,
          options: [
            { id: 'a', text: '2 true false' },
            { id: 'b', text: '1 false false' },
            { id: 'c', text: '2 false false' },
            { id: 'd', text: 'Nothing: the second lock() deadlocks' },
          ],
          correctOptionId: 'a',
          explanation: 'ReentrantLock (like synchronized) is reentrant: the owning thread can lock again and the hold count goes to 2. It is released only when unlock() has been called as many times as lock().',
        },
        {
          id: 'cc2-c5',
          kind: 'mcq',
          dimension: 'debugging',
          prompt: 'A thread dump shows: "Thread-1 holds lock on Account#7, waiting for Account#3" and "Thread-2 holds lock on Account#3, waiting for Account#7". Which fix removes the problem for good?',
          options: [
            { id: 'a', text: 'Increase the thread pool size' },
            { id: 'b', text: 'Add Thread.sleep() before taking the second lock' },
            { id: 'c', text: 'Always acquire the two account locks in a fixed global order, e.g. lowest id first' },
            { id: 'd', text: 'Make the balance fields volatile' },
          ],
          correctOptionId: 'c',
          explanation: 'This is a lock-ordering deadlock (circular wait). A global acquisition order makes the cycle impossible. More threads or sleeps only change the timing.',
        },
        {
          id: 'cc2-c6',
          kind: 'mcq',
          dimension: 'interview',
          prompt: 'In Java 25, what is the status of ScopedValue and StructuredTaskScope?',
          options: [
            { id: 'a', text: 'Both are final, standard APIs' },
            { id: 'b', text: 'ScopedValue is final (JEP 506); StructuredTaskScope is still a preview API that needs --enable-preview' },
            { id: 'c', text: 'Both are still incubator modules' },
            { id: 'd', text: 'StructuredTaskScope is final; ScopedValue is preview' },
          ],
          correctOptionId: 'b',
          explanation: 'Scoped values were finalised in Java 25. Structured concurrency has been a preview API since Java 21 and remained preview in 25 and 26, with a reshaped API in 25.',
        },
        {
          id: 'cc2-c7',
          kind: 'mcq',
          dimension: 'coding',
          prompt: 'Many threads record visits per page in `ConcurrentHashMap<String, Integer> visits`. Which line is correct?',
          options: [
            { id: 'a', text: 'visits.put(page, visits.getOrDefault(page, 0) + 1);' },
            { id: 'b', text: 'visits.merge(page, 1, Integer::sum);' },
            { id: 'c', text: 'if (visits.containsKey(page)) visits.put(page, visits.get(page) + 1); else visits.put(page, 1);' },
            { id: 'd', text: 'synchronized (page) { visits.put(page, visits.get(page) + 1); }' },
          ],
          correctOptionId: 'b',
          explanation: 'merge performs the read-modify-write atomically for that key. The get-then-put versions lose updates; locking on the page string is unsafe (strings may be shared or different instances) and d also throws on the first visit.',
        },
      ],
      challengeIds: [],
      masteryCriteria: [
        'Identify read-modify-write and check-then-act races in code.',
        'Explain happens-before and list the edges created by locks, volatile, start and join.',
        'Choose between synchronized, volatile, atomics, ReentrantLock and ConcurrentHashMap for a scenario.',
        'Diagnose a deadlock from a thread dump and fix it with lock ordering.',
        'State accurately that scoped values are final in 25 and structured concurrency is still preview.',
      ],
      relatedLessonIds: ['cc-threads', 'cc-concurrency-utilities', 'c-hashmap', 'c-iteration', 'r-gc'],
      revision: [
        { id: 'r1', question: 'What two guarantees does synchronized give?', answer: 'Mutual exclusion (one thread at a time per monitor) and visibility (writes before an unlock are visible after the next lock of the same monitor).' },
        { id: 'r2', question: 'Why is volatile not enough for a counter?', answer: 'It guarantees visibility and ordering but not atomicity; count++ is a read-modify-write that two threads can interleave.' },
        { id: 'r3', question: 'How do you prevent lock-ordering deadlocks?', answer: 'Acquire locks in one global order (for example by id), or use tryLock with a timeout and back off.' },
        { id: 'r4', question: 'Which ConcurrentHashMap methods perform atomic compound updates?', answer: 'merge, compute, computeIfAbsent, computeIfPresent and putIfAbsent.' },
        { id: 'r5', question: 'Are scoped values and structured concurrency standard in Java 25?', answer: 'Scoped values are final in 25 (JEP 506). Structured concurrency is still a preview API that needs --enable-preview.' },
      ],
    },
    {
      id: 'cc-concurrency-utilities',
      moduleId: 'concurrency',
      title: 'Concurrency utilities: BlockingQueue, latches, semaphores and concurrent collections',
      summary: 'Ready-made building blocks from java.util.concurrent: producer-consumer queues, CountDownLatch, CyclicBarrier, Semaphore, Phaser, and atomic ConcurrentHashMap and CopyOnWriteArrayList operations.',
      estimatedMinutes: 40,
      difficulty: 'advanced',
      prerequisites: ['cc-synchronization'],
      versionNotes: [
        { feature: 'BlockingQueue, CountDownLatch, CyclicBarrier, Semaphore, ConcurrentHashMap, CopyOnWriteArrayList', since: 5, note: 'JSR 166' },
        { feature: 'Phaser, LinkedTransferQueue, ForkJoinPool', since: 7 },
        { feature: 'ConcurrentHashMap rewrite with atomic compute/merge and bulk operations', since: 8 },
        { feature: 'Virtual threads: blocking on these utilities unmounts instead of holding an OS thread', since: 21 },
      ],
      objectives: [
        'Build a producer-consumer pipeline with a bounded BlockingQueue and a clean shutdown signal.',
        'Coordinate threads with CountDownLatch, CyclicBarrier and Semaphore, and know when Phaser fits.',
        'Update shared maps atomically with ConcurrentHashMap compute, computeIfAbsent and merge.',
        'Choose CopyOnWriteArrayList only for read-mostly data.',
        'Pick the right utility for a coordination problem instead of hand-writing wait/notify.',
      ],
      plainEnglish: `Locks and atomics are the bricks of concurrent code. \`java.util.concurrent\` also ships **ready-made furniture** — tested, fast components for the coordination problems that come up again and again:

- A **BlockingQueue** is a conveyor belt between threads: producers put work on it, consumers take work off it. If the belt is full, producers wait; if it is empty, consumers wait.
- A **CountDownLatch** is a starting gate that opens once a counter reaches zero ("wait until all three services are ready").
- A **CyclicBarrier** is a meeting point: a group of threads waits until everyone has arrived, then they all continue — and it can be reused round after round.
- A **Semaphore** is a stack of tickets: at most N threads can hold one at a time ("no more than 10 calls to the payment API at once").
- **Concurrent collections** such as \`ConcurrentHashMap\` and \`CopyOnWriteArrayList\` let many threads share data safely without you writing a single lock.

Using these instead of \`wait()\`/\`notify()\` makes concurrent code shorter, easier to read and far less likely to be wrong.`,
      technical: `### BlockingQueue and producer-consumer
\`BlockingQueue<E>\` adds blocking operations to a queue. Each operation comes in four flavours: throw (\`add\`/\`remove\`), special value (\`offer\`/\`poll\`), **block** (\`put\`/\`take\`) and time out (\`offer(e, t, unit)\`/\`poll(t, unit)\`).
- \`ArrayBlockingQueue(n)\` — bounded array; the default choice for back-pressure.
- \`LinkedBlockingQueue\` — optionally bounded; **unbounded by default** (\`Integer.MAX_VALUE\`), which is why \`Executors.newFixedThreadPool\` can queue work until memory runs out.
- \`SynchronousQueue\` — no capacity: each \`put\` waits for a \`take\` (used by \`newCachedThreadPool\`).
- \`PriorityBlockingQueue\`, \`DelayQueue\`, \`LinkedTransferQueue\` for ordering, scheduling and hand-off.

A **bounded** queue gives back-pressure: a fast producer slows down to the consumers' pace instead of filling the heap. To stop consumers, send one **poison pill** per consumer, close an executor, or interrupt them — \`put\` and \`take\` respond to interruption with \`InterruptedException\` (restore the flag with \`Thread.currentThread().interrupt()\` if you cannot rethrow). Queue hand-off is also a happens-before edge: everything the producer did before \`put\` is visible to the consumer after \`take\`.

### Synchronizers
- **CountDownLatch(n)**: \`countDown()\` decrements, \`await()\` blocks until zero. **One-shot**: it cannot be reset, and counting below zero is ignored.
- **CyclicBarrier(n, action)**: \`await()\` blocks until n parties arrive; the last one runs the optional barrier action, then the barrier **resets** for the next round. If one party is interrupted or times out, the barrier **breaks** and the others get \`BrokenBarrierException\`.
- **Semaphore(n)**: \`acquire()\` takes a permit (blocking if none), \`release()\` returns it — always in \`finally\`. Permits are not owned, so any thread can release. \`tryAcquire\` (with or without a timeout) never waits forever. The idiomatic way to **limit concurrency with virtual threads**.
- **Phaser**: a reusable, dynamic barrier; parties can \`register()\` and \`arriveAndDeregister()\` between phases. Use it when the number of participants changes.
- **Exchanger**: two threads swap objects at a rendezvous point (rare).

### Concurrent collections
- **ConcurrentHashMap**: lock-free reads and fine-grained locking for writes. Single operations are atomic, and so are the compound ones: \`putIfAbsent\`, \`computeIfAbsent\`, \`computeIfPresent\`, \`compute\`, \`merge\`. The function you pass runs while that key's bin is locked, so keep it short and never update **other keys of the same map** inside it. No null keys or values. \`size()\` is an estimate while updates are running; iterators are weakly consistent and never throw \`ConcurrentModificationException\`.
- **CopyOnWriteArrayList / CopyOnWriteArraySet**: every write copies the whole array; iterators work on an immutable snapshot. Ideal for listener lists that are read constantly and changed rarely; terrible for frequent writes.
- **ConcurrentLinkedQueue / ConcurrentLinkedDeque**: non-blocking queues.
- **ConcurrentSkipListMap / ConcurrentSkipListSet**: sorted, concurrent \`NavigableMap\`/\`NavigableSet\`.
- \`Collections.synchronizedMap\` and \`Hashtable\` lock the whole map for every call and still need external locking for iteration and compound actions — avoid them in new code.`,
      whyItExists: `Before Java 5, every team wrote its own queues and gates with \`synchronized\`, \`wait()\` and \`notify()\` — and got them subtly wrong (missed signals, spurious wake-ups, lost updates). Doug Lea's JSR 166 put expert-built, heavily tested implementations into the JDK. They are faster than hand-written code because they use lock-free algorithms and fine-grained locking internally, and they encode common patterns so that code reads as intent ("wait for three services") rather than mechanics.`,
      whenToUse: [
        'Use a bounded BlockingQueue to connect producer and consumer stages with back-pressure.',
        'Use CountDownLatch to wait once for N events (start-up checks, test harnesses).',
        'Use CyclicBarrier (or Phaser when parties change) for phased algorithms where threads meet repeatedly.',
        'Use Semaphore to cap concurrent access to a scarce resource, especially from virtual threads.',
        'Use ConcurrentHashMap merge/compute/computeIfAbsent for shared counters, caches and grouping.',
        'Use CopyOnWriteArrayList for read-mostly lists such as event listeners.',
      ],
      whenNotToUse: [
        'Do not use an unbounded queue between a fast producer and a slow consumer.',
        'Do not use CopyOnWriteArrayList for data that is written often or is large.',
        'Do not do slow work or I/O inside ConcurrentHashMap.compute or computeIfAbsent — it blocks other updates to that bin.',
        'Do not hand-roll wait()/notify() coordination when one of these utilities fits.',
      ],
      examples: [
        {
          id: 'producer-consumer',
          title: 'Producer-consumer with a bounded BlockingQueue',
          runnable: true,
          code: `import java.util.*;
import java.util.concurrent.*;

public class Main {
    static final String POISON = "__done__";   // tells a consumer to stop

    public static void main(String[] args) throws InterruptedException {
        BlockingQueue<String> queue = new ArrayBlockingQueue<>(5);   // bounded: back-pressure
        Map<String, Integer> totals = new ConcurrentHashMap<>();

        Thread producer = new Thread(() -> {
            try {
                for (int i = 1; i <= 20; i++) {
                    queue.put("order-" + i);       // blocks while the queue is full
                }
                queue.put(POISON);                 // one pill per consumer
                queue.put(POISON);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        List<Thread> consumers = new ArrayList<>();
        for (int c = 0; c < 2; c++) {
            Thread consumer = new Thread(() -> {
                try {
                    while (true) {
                        String order = queue.take();   // blocks while the queue is empty
                        if (order.equals(POISON)) return;
                        totals.merge("processed", 1, Integer::sum);
                        totals.merge("sum", Integer.parseInt(order.substring(6)), Integer::sum);
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            });
            consumers.add(consumer);
            consumer.start();
        }
        producer.start();

        producer.join();
        for (Thread consumer : consumers) consumer.join();
        System.out.println("processed = " + totals.get("processed"));
        System.out.println("sum of ids = " + totals.get("sum"));
        System.out.println("queue empty = " + queue.isEmpty());
    }
}`,
          expectedOutput: `processed = 20
sum of ids = 210
queue empty = true`,
          explanation: 'Which consumer handles which order changes from run to run, so the program prints only totals computed after join(). 1 + 2 + ... + 20 = 210.',
        },
        {
          id: 'sync-toolkit',
          title: 'Latch, semaphore, barrier and concurrent collections in one program',
          runnable: true,
          code: `import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

public class Main {
    public static void main(String[] args) throws Exception {
        // 1. CountDownLatch: wait until 3 services report ready
        CountDownLatch ready = new CountDownLatch(3);
        for (String name : List.of("db", "cache", "queue")) {
            new Thread(ready::countDown, name).start();
        }
        boolean allReady = ready.await(5, TimeUnit.SECONDS);
        System.out.println("all services ready: " + allReady);

        // 2. Semaphore: at most 3 of 10 tasks inside at once
        Semaphore permits = new Semaphore(3);
        AtomicInteger inside = new AtomicInteger();
        AtomicInteger peak = new AtomicInteger();
        try (ExecutorService pool = Executors.newFixedThreadPool(10)) {
            for (int i = 0; i < 10; i++) {
                pool.submit(() -> {
                    permits.acquire();
                    try {
                        int now = inside.incrementAndGet();
                        peak.accumulateAndGet(now, Math::max);
                        Thread.sleep(20);
                        inside.decrementAndGet();
                    } finally {
                        permits.release();
                    }
                    return null;
                });
            }
        }
        System.out.println("peak concurrency <= 3: " + (peak.get() <= 3));

        // 3. CyclicBarrier: 3 workers meet at the end of each of 2 rounds
        AtomicInteger roundsCompleted = new AtomicInteger();
        CyclicBarrier barrier = new CyclicBarrier(3, roundsCompleted::incrementAndGet);
        List<Thread> workers = new ArrayList<>();
        for (int w = 0; w < 3; w++) {
            Thread t = new Thread(() -> {
                try {
                    for (int round = 0; round < 2; round++) barrier.await();
                } catch (InterruptedException | BrokenBarrierException e) {
                    throw new RuntimeException(e);
                }
            });
            workers.add(t);
            t.start();
        }
        for (Thread t : workers) t.join();
        System.out.println("barrier rounds completed: " + roundsCompleted.get());

        // 4. ConcurrentHashMap.merge: atomic word counts from 4 threads
        ConcurrentHashMap<String, Integer> counts = new ConcurrentHashMap<>();
        List<String> words = List.of("java", "jvm", "java", "thread");
        try (ExecutorService pool = Executors.newFixedThreadPool(4)) {
            for (int t = 0; t < 4; t++) {
                pool.submit(() -> {
                    for (int i = 0; i < 1_000; i++) {
                        for (String word : words) counts.merge(word, 1, Integer::sum);
                    }
                });
            }
        }
        System.out.println("word counts: " + new TreeMap<>(counts));

        // 5. CopyOnWriteArrayList: iterators see a snapshot
        List<String> listeners = new CopyOnWriteArrayList<>(List.of("audit", "metrics"));
        for (String l : listeners) {
            listeners.add(l + "-copy");     // would throw ConcurrentModificationException on ArrayList
        }
        System.out.println("listeners: " + listeners);
    }
}`,
          expectedOutput: `all services ready: true
peak concurrency <= 3: true
barrier rounds completed: 2
word counts: {java=8000, jvm=4000, thread=4000}
listeners: [audit, metrics, audit-copy, metrics-copy]`,
          explanation: 'Every line is printed after the threads involved have finished (await, executor close, join), so the output is deterministic. The barrier action runs once per round, by the last thread to arrive. The Callable form of submit (return null) lets the lambda call acquire(), which throws InterruptedException.',
        },
        {
          id: 'chm-compute',
          title: 'Grouping and caching with computeIfAbsent',
          runnable: true,
          code: `import java.util.*;
import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) {
        ConcurrentHashMap<Integer, Queue<String>> byLength = new ConcurrentHashMap<>();
        List<String> words = List.of("map", "queue", "latch", "lock", "set", "phaser");
        try (ExecutorService pool = Executors.newFixedThreadPool(3)) {
            for (String w : words) {
                pool.submit(() -> byLength
                    .computeIfAbsent(w.length(), k -> new ConcurrentLinkedQueue<>())   // atomic create
                    .add(w));
            }
        }
        Map<Integer, List<String>> sorted = new TreeMap<>();
        byLength.forEach((len, q) -> sorted.put(len, q.stream().sorted().toList()));
        System.out.println(sorted);

        ConcurrentHashMap<String, Integer> stock = new ConcurrentHashMap<>(Map.of("apple", 3));
        stock.compute("apple", (k, v) -> v == null ? 1 : v - 1);       // read-modify-write, atomic
        stock.computeIfPresent("pear", (k, v) -> v - 1);                // absent: nothing happens
        stock.merge("pear", 5, Integer::sum);                           // absent: inserts 5
        System.out.println(new TreeMap<>(stock));
    }
}`,
          expectedOutput: `{3=[map, set], 4=[lock], 5=[latch, queue], 6=[phaser]}
{apple=2, pear=5}`,
          explanation: 'computeIfAbsent guarantees exactly one queue is created per length even when several threads ask at once; a get-then-put version could create two and lose words. The value collections are themselves thread-safe, because add() runs after computeIfAbsent has returned.',
        },
      ],
      walkthrough: {
        exampleId: 'producer-consumer',
        steps: [
          { lines: [8, 9], text: 'A bounded queue of capacity 5 sits between the stages. The totals map is concurrent because both consumers update it.' },
          { lines: [11, 21], text: 'The producer puts 20 orders. put() blocks whenever 5 orders are already waiting, so the producer can never run ahead and fill memory. At the end it sends one poison pill per consumer.' },
          { lines: [24, 36], text: 'Each consumer loops on take(), which blocks while the queue is empty. A poison pill ends the loop. merge() updates the shared totals atomically.' },
          { lines: [33, 35], text: 'put() and take() throw InterruptedException. If a thread cannot propagate it, it restores the interrupt flag so code further up still sees the cancellation.' },
          { lines: [42, 46], text: 'join() waits for all three threads and makes their writes visible to main. Only then are the totals printed, so the output never depends on scheduling.' },
        ],
      },
      realWorld: {
        title: 'An import job that ran out of memory, then out of connections',
        scenario: `A nightly import read 50 million rows from files and wrote them to a database. Version one used \`Executors.newFixedThreadPool(8)\` and submitted one task per row. The file reader was far faster than the database, so the pool's **unbounded** \`LinkedBlockingQueue\` grew to millions of pending tasks and the job died with \`OutOfMemoryError: Java heap space\`.

Version two used an explicit pipeline: one reader thread \`put\`s batches of 1,000 rows into an \`ArrayBlockingQueue<>(16)\`, and eight writer threads \`take\` batches and insert them. The bounded queue gave back-pressure — the reader simply waited when writers fell behind — and heap usage became flat. A \`CountDownLatch\` let the main thread wait for all writers before it reported success, and a \`ConcurrentHashMap.merge\` per table recorded row counts.

A later move to virtual threads (one per batch) briefly opened 400 database connections at once and exhausted the pool. A \`Semaphore(20)\` around the insert call restored a safe limit while keeping the simple blocking code.`,
      },
      commonMistakes: [
        {
          mistake: 'Using an unbounded queue (or newFixedThreadPool) between a fast producer and a slow consumer.',
          why: 'Nothing slows the producer down, so pending work accumulates until the heap is exhausted.',
          fix: 'Use a bounded ArrayBlockingQueue (or a ThreadPoolExecutor with a bounded queue and a rejection policy) so producers wait.',
        },
        {
          mistake: 'Releasing a Semaphore outside finally, or releasing without having acquired.',
          why: 'An exception leaks a permit forever and capacity shrinks; an extra release silently increases the limit, because permits are not owned.',
          fix: 'acquire() just before try, release() in finally, and only on the path where the acquire succeeded.',
          code: `permits.acquire();
try {
    callPaymentApi();
} finally {
    permits.release();
}`,
        },
        {
          mistake: 'Swallowing InterruptedException in a consumer loop.',
          why: 'The thread can no longer be cancelled: shutdownNow() and Future.cancel(true) rely on interruption.',
          fix: 'Exit the loop and restore the flag with Thread.currentThread().interrupt(), or let the exception propagate.',
        },
        {
          mistake: 'Expecting a CountDownLatch to be reusable.',
          why: 'Once the count reaches zero it stays open; there is no reset.',
          fix: 'Use a CyclicBarrier for repeated rounds, or a Phaser if the number of parties changes.',
        },
        {
          mistake: 'Calling slow code or updating another key inside ConcurrentHashMap.computeIfAbsent.',
          why: 'The mapping function runs while the bin is locked; long work blocks other writers, and recursive updates of the same map can throw IllegalStateException or deadlock.',
          fix: 'Keep mapping functions short and side-effect free; for expensive loads use a caching library or store a CompletableFuture as the value.',
        },
      ],
      checks: [
        {
          id: 'cc3-c1',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this program print?',
          code: `import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        CountDownLatch latch = new CountDownLatch(2);
        latch.countDown();
        latch.countDown();
        latch.countDown();
        System.out.print(latch.getCount() + " ");
        System.out.print(latch.await(0, TimeUnit.SECONDS) + " ");
        Semaphore s = new Semaphore(1);
        System.out.print(s.tryAcquire() + " ");
        System.out.println(s.tryAcquire());
    }
}`,
          options: [
            { id: 'a', text: '-1 true true false' },
            { id: 'b', text: '0 true true false' },
            { id: 'c', text: '0 false true true' },
            { id: 'd', text: '0 true true true' },
          ],
          correctOptionId: 'b',
          explanation: 'A latch never goes below zero: extra countDown() calls are ignored. await returns true immediately because the count is zero. The semaphore has one permit, so the first tryAcquire succeeds and the second fails without blocking.',
        },
        {
          id: 'cc3-c2',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'A service handles every request on its own virtual thread and calls a partner API that allows at most 10 concurrent calls. What is the best tool?',
          options: [
            { id: 'a', text: 'A fixed pool of 10 virtual threads' },
            { id: 'b', text: 'A Semaphore(10) around the partner API call' },
            { id: 'c', text: 'A CountDownLatch(10)' },
            { id: 'd', text: 'synchronized on the API client' },
          ],
          correctOptionId: 'b',
          explanation: 'A Semaphore caps concurrent access while each request keeps its own cheap virtual thread. Pooling virtual threads defeats their purpose, a latch is one-shot, and synchronized would allow only one call at a time.',
        },
        {
          id: 'cc3-c3',
          kind: 'mcq',
          dimension: 'interview',
          prompt: 'What is the key difference between CountDownLatch and CyclicBarrier?',
          options: [
            { id: 'a', text: 'CountDownLatch works only with virtual threads' },
            { id: 'b', text: 'A latch is one-shot and its count is decremented by any threads (which need not wait); a barrier makes a fixed group of threads wait for each other and resets for the next round' },
            { id: 'c', text: 'CyclicBarrier cannot run an action when it trips' },
            { id: 'd', text: 'They are interchangeable' },
          ],
          correctOptionId: 'b',
          explanation: 'Latch: waiters and counters can be different threads, and once open it stays open. Barrier: the same parties both arrive and wait, an optional action runs when the last arrives, and it is reusable.',
        },
        {
          id: 'cc3-c4',
          kind: 'multi-select',
          dimension: 'conceptual',
          prompt: 'Which statements about BlockingQueue are true? Select all that apply.',
          options: [
            { id: 'a', text: 'put() waits while a bounded queue is full' },
            { id: 'b', text: 'take() waits while the queue is empty' },
            { id: 'c', text: 'offer() on a full ArrayBlockingQueue returns false instead of waiting' },
            { id: 'd', text: 'new LinkedBlockingQueue<>() is unbounded unless you pass a capacity' },
            { id: 'e', text: 'ArrayBlockingQueue grows automatically when it is full' },
          ],
          correctOptionIds: ['a', 'b', 'c', 'd'],
          explanation: 'ArrayBlockingQueue has a fixed capacity; that is exactly what provides back-pressure. LinkedBlockingQueue defaults to a capacity of Integer.MAX_VALUE.',
        },
        {
          id: 'cc3-c5',
          kind: 'mcq',
          dimension: 'coding',
          prompt: 'Many threads group orders by customer into `ConcurrentHashMap<String, List<Order>> byCustomer`. Which line is thread-safe?',
          options: [
            { id: 'a', text: 'if (!byCustomer.containsKey(id)) byCustomer.put(id, new ArrayList<>()); byCustomer.get(id).add(order);' },
            { id: 'b', text: 'byCustomer.computeIfAbsent(id, k -> new CopyOnWriteArrayList<>()).add(order);' },
            { id: 'c', text: 'byCustomer.computeIfAbsent(id, k -> new ArrayList<>()).add(order);' },
            { id: 'd', text: 'byCustomer.putIfAbsent(id, new ArrayList<>()); byCustomer.get(id).add(order);' },
          ],
          correctOptionId: 'b',
          explanation: 'computeIfAbsent creates the list atomically, and the list must itself be thread-safe because add() runs outside the map\'s lock. Option c shares a plain ArrayList between threads; a and d also race on the list. (For write-heavy lists, ConcurrentLinkedQueue is a better value type than CopyOnWriteArrayList.)',
        },
        {
          id: 'cc3-c6',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'Where is CopyOnWriteArrayList a good fit?',
          options: [
            { id: 'a', text: 'A log buffer that receives thousands of appends per second' },
            { id: 'b', text: 'A list of event listeners that is iterated on every event and changed only when a component registers' },
            { id: 'c', text: 'A work queue between producers and consumers' },
            { id: 'd', text: 'A large list that is sorted frequently' },
          ],
          correctOptionId: 'b',
          explanation: 'Every write copies the entire array, but reads and iteration need no locking and never throw ConcurrentModificationException. That trade-off only pays off when reads vastly outnumber writes.',
        },
      ],
      challengeIds: [],
      masteryCriteria: [
        'Build a bounded producer-consumer pipeline that shuts down cleanly and prints deterministic results.',
        'Choose between CountDownLatch, CyclicBarrier, Phaser and Semaphore for a coordination problem.',
        'Replace check-then-act map code with computeIfAbsent, compute or merge.',
        'Explain the trade-offs of CopyOnWriteArrayList and unbounded queues.',
      ],
      relatedLessonIds: ['cc-synchronization', 'cc-threads', 'c-collections-overview', 'c-hashmap'],
      revision: [
        { id: 'r1', question: 'What does a bounded BlockingQueue give a producer-consumer pipeline?', answer: 'Back-pressure: put() blocks while the queue is full, so producers slow to the consumers\' pace instead of exhausting memory. take() blocks while it is empty.' },
        { id: 'r2', question: 'CountDownLatch vs CyclicBarrier vs Semaphore?', answer: 'Latch: wait once until N events have happened. Barrier: N threads wait for each other, repeatedly. Semaphore: at most N threads inside a section at once.' },
        { id: 'r3', question: 'How do you stop consumer threads that block on take()?', answer: 'Send one poison-pill element per consumer, or interrupt them (take() throws InterruptedException), or shut down the executor that runs them.' },
        { id: 'r4', question: 'Why is CopyOnWriteArrayList safe to iterate while others modify it?', answer: 'Each write creates a new array; an iterator keeps reading the snapshot it started with, so it never sees a partial change and never throws ConcurrentModificationException.' },
      ],
    },
  ],
};
