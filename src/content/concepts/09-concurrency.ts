import type { LessonConcepts } from '@/types/curriculum';

/** Concept pages for module 9 (Concurrency), keyed by lesson id. */
export const concurrencyConcepts: Record<string, LessonConcepts> = {
  'cc-threads': {
    textbook: {
      definition:
        'A **thread** is a single sequential flow of control within a program. A Java program may have many threads running concurrently. Each thread has its own program counter and JVM stack, while all of them share the heap and the method area. On the Java platform, an instance of `java.lang.Thread` represents a thread, and the thread runs the `run` method of a **task**. There are two kinds of threads. **Platform threads** are each a thin wrapper around an operating-system thread. **Virtual threads** (Java 21) are scheduled by the JVM onto a small pool of **carrier threads**. An **executor service** separates submitting tasks from the threads that run them.',
      terms: [
        { term: 'Task', meaning: 'A unit of work. It is written as a `Runnable` (no result) or a `Callable<V>` (returns a value and may throw a checked exception).' },
        { term: 'Platform thread', meaning: 'A `Thread` built as a thin wrapper around an operating-system thread. It uses that OS thread for its entire lifetime.' },
        { term: 'Virtual thread', meaning: 'A lightweight `Thread` built by the JDK. It uses an operating-system thread only while it runs code, not while it blocks.' },
        { term: 'Carrier thread', meaning: 'A platform thread that the scheduler mounts a virtual thread on, to run it.' },
        { term: 'Executor service', meaning: 'An `Executor` that manages a set of threads. It accepts submitted tasks, returns a `Future` for each one, and supports orderly shutdown.' },
      ],
      source: 'JLS chapter 17; Javadoc for java.lang.Thread and java.util.concurrent.ExecutorService; JEP 444',
    },
    interviewDefinition:
      'A **thread** is an independent path of execution with its own stack and program counter. It shares the heap with every other thread in the process. Java exposes threads through `Thread`. But production code submits `Runnable`/`Callable` tasks to an **ExecutorService**, which manages a pool and returns a `Future`. Since Java 21, **virtual threads** are cheap threads that the JVM schedules. They unmount from their carrier while blocked, so blocking code scales to millions of concurrent tasks. They make waiting cheap; they do not make computing faster.',
    interviewFollowUps: [
      {
        question: 'Runnable or Callable — what is the difference?',
        answer: '`Runnable.run()` returns nothing and cannot throw checked exceptions. `Callable<V>.call()` returns a value and may throw `Exception`. When you submit it to an executor, you get a `Future<V>`. Its `get()` returns the value, or throws `ExecutionException` wrapping the failure.',
      },
      {
        question: 'How do you stop a thread?',
        answer: 'By cooperation. Call `interrupt()` (or `Future.cancel(true)`, `shutdownNow()`). The task must check `Thread.interrupted()`, or react to `InterruptedException` from blocking calls. `Thread.stop()` was unsafe, and it has thrown `UnsupportedOperationException` since Java 20.',
      },
      {
        question: 'Should you pool virtual threads?',
        answer: 'No. Create one per task, because they are cheap. To limit access to a scarce resource, use a `Semaphore` or the resource\'s own pool, not a small pool of threads.',
      },
    ],
    mnemonic: {
      device: '"Start, don\'t Run; Submit, then Get; Virtual when you Wait"',
      expansion: [
        { key: 'Start, don\'t Run', meaning: 'start() creates a new thread; run() just calls the method on the current one' },
        { key: 'Submit, then Get', meaning: 'Hand tasks to an ExecutorService, collect results later through the Future' },
        { key: 'Virtual when you Wait', meaning: 'Virtual threads pay off for blocking I/O, not for CPU-bound work' },
      ],
      visual: 'A taxi rank: platform threads are taxis with drivers paid by the hour; virtual threads are passengers who only occupy a taxi while actually travelling and step out to wait in the lobby whenever they are on hold.',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'A kitchen and its order tickets',
        body: 'Tasks are order tickets; an executor is the kitchen with a fixed number of cooks (threads) and a ticket rail (the queue). The waiter gets a receipt (a `Future`) immediately and comes back for the dish later. Hiring a new cook for every single order (raw `new Thread`) is slow and chaotic; a well-run kitchen reuses its cooks.',
      },
      {
        kind: 'insight',
        title: 'Threads are expensive because of their stacks and the OS',
        body: 'A platform thread maps 1:1 to an OS thread with a reserved stack (1 MB by default on 64-bit Linux) and kernel scheduling. Thousands are fine; hundreds of thousands are not. Virtual threads keep their stack as heap objects that grow and shrink, and the JVM schedules them on a small ForkJoinPool of carriers (one per core by default).',
      },
      {
        kind: 'real-world',
        title: 'Thread-per-request is back',
        body: 'Servlet containers have always used a thread per request, capped by the pool size (often 200). Under slow downstream calls every thread sits blocked and requests queue. With virtual threads (for example `spring.threads.virtual.enabled=true` in Spring Boot 3.2+), each request gets its own virtual thread and throughput is limited by downstream capacity instead of the thread pool.',
      },
      {
        kind: 'angle',
        title: 'An uncaught exception in a thread is silent for the caller',
        body: 'An exception that escapes `run()` ends only that thread and is printed by the default uncaught-exception handler; `main` carries on unaware. With executors, the exception is stored in the `Future` and disappears entirely if nobody calls `get()`. Always observe the result of the work you start.',
      },
    ],
    diagrams: [
      {
        id: 'cc-threads-carriers',
        kind: 'concept',
        title: 'Virtual threads mounted on carriers',
        caption: 'Only virtual threads that are running use a carrier. A blocked one unmounts and its stack waits on the heap. So the carrier can run another one straight away.',
        explanation: [
          'The top row shows virtual threads. **VT: request 1** and **VT: request 2** are running, so each is mounted on a platform thread.',
          'They run on **Carrier thread 1** and **Carrier thread 2**, which make up the **Carrier pool (ForkJoinPool)** group. Each carrier runs on a real **CPU core**.',
          '**VT: request 3** is blocked on a database call, so it unmounts. Its frames are saved as a **Stack chunk** on the heap, and it holds no carrier while it waits.',
          'The dashed next to mount arrow shows **Thousands more VTs** that are ready and waiting for a free carrier. One mounts as soon as a carrier is released.',
          'Takeaway: only running virtual threads use a carrier. So a few platform threads can serve a huge number of tasks that mostly wait.',
        ],
        cols: 4,
        rows: 3,
        nodes: [
          { id: 'v1', label: 'VT: request 1', detail: 'running', col: 0, row: 0, tone: 'success' },
          { id: 'v2', label: 'VT: request 2', detail: 'running', col: 1, row: 0, tone: 'success' },
          { id: 'more', label: 'Thousands more VTs', detail: 'ready, waiting a turn', col: 2, row: 0, tone: 'neutral' },
          { id: 'v3', label: 'VT: request 3', detail: 'blocked on a DB call', col: 3, row: 0, tone: 'warning' },
          { id: 'c1', label: 'Carrier thread 1', detail: 'platform thread', col: 0, row: 1, tone: 'primary' },
          { id: 'c2', label: 'Carrier thread 2', detail: 'platform thread', col: 1, row: 1, tone: 'primary' },
          { id: 'chunk', label: 'Stack chunk', detail: 'saved on the heap', col: 3, row: 1, shape: 'cylinder', tone: 'accent' },
          { id: 'cpu1', label: 'CPU core', col: 0, row: 2, shape: 'pill', tone: 'neutral' },
          { id: 'cpu2', label: 'CPU core', col: 1, row: 2, shape: 'pill', tone: 'neutral' },
        ],
        edges: [
          { from: 'v1', to: 'c1', label: 'mounted' },
          { from: 'v2', to: 'c2', label: 'mounted' },
          { from: 'more', to: 'c2', label: 'next to mount', dashed: true },
          { from: 'v3', to: 'chunk', label: 'unmounted' },
          { from: 'c1', to: 'cpu1' },
          { from: 'c2', to: 'cpu2' },
        ],
        groups: [{ label: 'Carrier pool (ForkJoinPool)', fromCol: 0, toCol: 1, fromRow: 1, toRow: 1, tone: 'primary' }],
      },
      {
        id: 'cc-threads-states',
        kind: 'flow',
        title: 'Thread states (Thread.State)',
        caption: 'A thread is NEW until start(), and TERMINATED after run() returns. In between, it moves between RUNNABLE and the three waiting states. RUNNABLE includes threads blocked in OS-level I/O.',
        explanation: [
          'A thread object starts in **NEW**. It has been created, but start() has not been called, so nothing is running yet.',
          'Calling start() moves it to **RUNNABLE**, meaning running or ready to run. This state also covers a thread blocked inside operating-system I/O.',
          'Three two-way arrows lead to the waiting states. A thread is **BLOCKED** while it waits to enter a synchronized block whose monitor (lock) another thread holds.',
          'It is **WAITING** in wait(), join() or park(), until another thread signals it. It is **TIMED_WAITING** in sleep(ms) or wait(ms), until a timeout or a signal.',
          'When run() returns or throws, the thread becomes **TERMINATED** for good. A terminated thread can never be started again.',
          'Takeaway: thread dumps show these states. Many BLOCKED threads point to lock contention. Stuck WAITING threads point to a missing signal.',
        ],
        cols: 3,
        rows: 2,
        nodes: [
          { id: 'new', label: 'NEW', detail: 'created, not started', col: 0, row: 0, shape: 'pill', tone: 'neutral' },
          { id: 'run', label: 'RUNNABLE', detail: 'running or ready', col: 1, row: 0, shape: 'pill', tone: 'success' },
          { id: 'term', label: 'TERMINATED', detail: 'run() finished', col: 2, row: 0, shape: 'pill', tone: 'neutral' },
          { id: 'blocked', label: 'BLOCKED', detail: 'waiting for a monitor', col: 0, row: 1, shape: 'pill', tone: 'danger' },
          { id: 'waiting', label: 'WAITING', detail: 'wait(), join(), park()', col: 1, row: 1, shape: 'pill', tone: 'warning' },
          { id: 'timed', label: 'TIMED_WAITING', detail: 'sleep(ms), wait(ms)', col: 2, row: 1, shape: 'pill', tone: 'warning' },
        ],
        edges: [
          { from: 'new', to: 'run', label: 'start()' },
          { from: 'run', to: 'term', label: 'returns or throws' },
          { from: 'run', to: 'blocked', label: 'synchronized entry', both: true },
          { from: 'run', to: 'waiting', label: 'until notified', both: true },
          { from: 'run', to: 'timed', label: 'until timeout', both: true },
        ],
      },
      {
        id: 'cc-threads-executor',
        kind: 'architecture',
        title: 'Inside an ExecutorService',
        caption: 'submit() returns a Future at once. Tasks wait in a queue until a worker takes them. The worker stores the result or exception in the Future, which unblocks get().',
        explanation: [
          'The **Caller thread** calls submit(callable). The task goes into the **Work queue**, and the call returns at once.',
          'In return the caller immediately receives a **Future<T>**, a receipt for a result that does not exist yet.',
          'One of the n reusable **Worker threads** takes the next task from the queue. So no thread is created per task.',
          'The **Task runs** when the worker calls call(). When it completes, the **Result or exception** is stored in the Future.',
          'Storing the result unblocks get(). The caller receives the value, or an ExecutionException that wraps the failure.',
          'Takeaway: an executor separates submitting work from running it. The Future is the only channel back to the caller.',
        ],
        cols: 4,
        rows: 2,
        nodes: [
          { id: 'caller', label: 'Caller thread', detail: 'submit(callable)', col: 0, row: 0, tone: 'primary' },
          { id: 'queue', label: 'Work queue', detail: 'e.g. LinkedBlockingQueue', col: 1, row: 0, shape: 'cylinder', tone: 'accent' },
          { id: 'workers', label: 'Worker threads', detail: 'n reusable threads', col: 2, row: 0, tone: 'primary' },
          { id: 'task', label: 'Task runs', detail: 'call() on a worker', col: 3, row: 0, tone: 'success' },
          { id: 'future', label: 'Future<T>', detail: 'returned immediately', col: 0, row: 1, shape: 'note', tone: 'accent' },
          { id: 'result', label: 'Result or exception', detail: 'stored in the Future', col: 3, row: 1, tone: 'success' },
        ],
        edges: [
          { from: 'caller', to: 'queue', label: 'enqueue' },
          { from: 'queue', to: 'workers', label: 'take()' },
          { from: 'workers', to: 'task' },
          { from: 'task', to: 'result', label: 'complete' },
          { from: 'caller', to: 'future', label: 'returns' },
          { from: 'result', to: 'future', label: 'get() unblocks' },
        ],
      },
    ],
    variants: [
      {
        title: 'Ways to create concurrent work',
        intro: 'All are supported; the later ones are what modern code should reach for first.',
        items: [
          { name: 'Subclass Thread', summary: 'Override run(). Couples the task to the thread and uses up your single superclass.', support: 'supported', note: 'Rarely appropriate in new code.', code: 'class Worker extends Thread { public void run() { ... } }\nnew Worker().start();' },
          { name: 'Runnable passed to Thread', summary: 'Separates the task from the thread; no return value and no checked exceptions.', support: 'supported', code: 'Thread t = new Thread(() -> work());\nt.start();' },
          { name: 'Callable + ExecutorService', summary: 'Submit tasks to a managed pool and get a Future with the result or the failure.', support: 'supported', code: 'try (var pool = Executors.newFixedThreadPool(4)) {\n    Future<Integer> f = pool.submit(() -> compute());\n}' },
          { name: 'Virtual threads (Java 21)', summary: 'Cheap threads for blocking work; one per task.', support: 'supported', code: 'Thread.ofVirtual().start(() -> handle(req));\nExecutors.newVirtualThreadPerTaskExecutor();' },
          { name: 'CompletableFuture', summary: 'Asynchronous pipelines composed with thenApply/thenCombine/exceptionally; runs on the common ForkJoinPool unless given an executor.', support: 'supported', code: 'CompletableFuture.supplyAsync(() -> load(id), executor)\n    .thenApply(Order::total);' },
          { name: 'Structured concurrency', summary: 'StructuredTaskScope treats a group of subtasks as one unit with shared cancellation.', support: 'partial', note: 'Still a preview API (since 21, still preview in 25); requires --enable-preview.' },
        ],
      },
      {
        title: 'Thread states (java.lang.Thread.State)',
        items: [
          { name: 'NEW', summary: 'Created but start() not yet called.' },
          { name: 'RUNNABLE', summary: 'Executing or ready to execute; also covers a thread blocked inside OS-level I/O.' },
          { name: 'BLOCKED', summary: 'Waiting to enter a synchronized block or method held by another thread.' },
          { name: 'WAITING', summary: 'Waiting indefinitely: Object.wait(), Thread.join(), LockSupport.park() (also used by ReentrantLock and BlockingQueue).' },
          { name: 'TIMED_WAITING', summary: 'Waiting with a timeout: Thread.sleep, wait(ms), join(ms), parkNanos, poll(timeout).' },
          { name: 'TERMINATED', summary: 'run() returned or threw; a thread cannot be restarted.' },
        ],
      },
      {
        title: 'Executor types (java.util.concurrent.Executors)',
        items: [
          { name: 'newFixedThreadPool(n)', summary: 'n threads and an unbounded LinkedBlockingQueue. Good for CPU-bound work; the unbounded queue can grow without limit.', support: 'supported' },
          { name: 'newCachedThreadPool()', summary: 'Creates threads on demand (SynchronousQueue) and reuses idle ones for 60 s. No upper bound on threads.', support: 'supported' },
          { name: 'newSingleThreadExecutor()', summary: 'One thread; tasks run sequentially in submission order.', support: 'supported' },
          { name: 'newScheduledThreadPool(n)', summary: 'Delayed and periodic tasks (schedule, scheduleAtFixedRate).', support: 'supported' },
          { name: 'newWorkStealingPool()', summary: 'A ForkJoinPool sized to the cores; idle workers steal tasks from busy ones (Java 8).', support: 'supported' },
          { name: 'newVirtualThreadPerTaskExecutor()', summary: 'A new virtual thread for each task, unbounded (Java 21).', support: 'supported' },
          { name: 'new ThreadPoolExecutor(...)', summary: 'Full control: core and max size, bounded queue, thread factory and rejection policy. What the factory methods build underneath.', support: 'supported' },
        ],
      },
    ],
    deepDive: [
      {
        title: 'How virtual threads are implemented',
        body: 'A virtual thread is a `java.lang.Thread` backed by a **continuation**. When it calls a blocking operation that the JDK has adapted (socket I/O, `sleep`, `BlockingQueue.take`, `ReentrantLock`), the continuation yields: its frames are copied to a heap object and the carrier thread returns to the scheduler, a FIFO `ForkJoinPool` with parallelism equal to the core count by default. When the operation completes, the virtual thread is resubmitted and its frames are copied back lazily. File I/O and some native calls cannot unmount, so the scheduler temporarily compensates by adding carriers. Java 24 (JEP 491) made `synchronized` unmount as well, removing the most common source of **pinning**.',
        sources: [
          { label: 'JEP 444: Virtual Threads', url: 'https://openjdk.org/jeps/444' },
          { label: 'JEP 491: Synchronize Virtual Threads without Pinning', url: 'https://openjdk.org/jeps/491' },
        ],
      },
      {
        title: 'Sizing pools: Little\'s law and the cores formula',
        body: 'For CPU-bound work, a pool of about **N cores** (+1) keeps every core busy without context-switch overhead. For blocking work, *Java Concurrency in Practice* gives N threads = N cores x utilisation x (1 + wait time / compute time); with 95% waiting that is 20 threads per core. Little\'s law (concurrency = throughput x latency) says 1,000 requests per second at 200 ms each need 200 in flight. Virtual threads remove the thread side of this calculation; the downstream resources (connections, rate limits) still need limits.',
        sources: [
          { label: 'Java Concurrency in Practice by Brian Goetz et al., chapter 8: Applying Thread Pools' },
          { label: 'java.util.concurrent.ThreadPoolExecutor API (Java 21)', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/ThreadPoolExecutor.html' },
        ],
      },
      {
        title: 'CompletableFuture and the common pool trap',
        body: '`supplyAsync(supplier)` without an executor runs on `ForkJoinPool.commonPool()`, which is sized for CPU work (cores - 1) and shared by parallel streams across the whole JVM. Blocking I/O there starves everyone else. Pass a dedicated executor for blocking stages — on Java 21+, a virtual-thread-per-task executor is a natural choice. Also note that `thenApply` may run on whichever thread completed the previous stage, including the caller.',
        sources: [{ label: 'java.util.concurrent.CompletableFuture API (Java 21)', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/CompletableFuture.html' }],
      },
    ],
  },

  'cc-synchronization': {
    textbook: {
      definition:
        '**Synchronization** is the coordination of threads that run concurrently. It makes sure their accesses to shared mutable state are correctly ordered and do not interfere. The Java language provides it mainly through **monitors**. Every object has a monitor that at most one thread can hold at a time. `synchronized` methods and statements acquire and release it. The **Java Memory Model** defines the resulting visibility guarantees through the **happens-before** relation. An unlock of a monitor happens-before every later lock of that monitor. A write to a `volatile` field happens-before every later read of it. A program free of **data races** is sequentially consistent.',
      terms: [
        { term: 'Monitor', meaning: 'The mutual-exclusion lock that every object has. It is reentrant: the thread that holds it may acquire it again.' },
        { term: 'Happens-before', meaning: 'A partial order on actions, defined by the JMM. If one action happens-before another, the first is visible to the second and ordered before it.' },
        { term: 'Data race', meaning: 'Two accesses to the same variable by different threads, where at least one is a write, and happens-before does not order them.' },
        { term: 'Atomicity', meaning: 'The property that a compound action, such as read-modify-write, looks to other threads like one step that cannot be split.' },
        { term: 'volatile field', meaning: 'A field where every read sees the most recent write to it in the synchronization order. A volatile write happens-before every later read of that field. But compound actions such as `count++` stay non-atomic.' },
      ],
      source: 'JLS §17.1 (Synchronization) and §17.4 (Memory Model); JLS §8.3.1.4 (volatile Fields)',
    },
    interviewDefinition:
      'Thread safety needs two things. **Atomicity** means no interleaving inside a compound action such as `count++`. **Visibility** means one thread\'s writes become visible to another. The **Java Memory Model** guarantees visibility only through **happens-before** edges: monitor unlock/lock, volatile write/read, `Thread.start`/`join`, and hand-offs in `java.util.concurrent`. The tools are: `synchronized` and `ReentrantLock` for mutual exclusion, and `volatile` for flags and safe publication. Atomics give lock-free updates of a single variable, and concurrent collections hold shared data.',
    interviewFollowUps: [
      {
        question: 'synchronized or ReentrantLock?',
        answer: 'Use `synchronized` by default. It is simpler, it is released automatically, and since Java 24 it no longer pins virtual threads. Use `ReentrantLock` when you need `tryLock` with a timeout, interruptible locking, fairness or several `Condition`s.',
      },
      {
        question: 'Why is double-checked locking broken without volatile?',
        answer: 'Without a happens-before edge, another thread can see the reference to the new object before the constructor\'s writes. In other words, it sees a half-built object. Declaring the field `volatile` (or using the holder-class idiom) fixes it.',
      },
      {
        question: 'What are the four conditions for deadlock?',
        answer: 'Mutual exclusion, hold-and-wait, no preemption and circular wait (Coffman). Breaking any one of them prevents deadlock. The practical one to break is circular wait, by using a global lock order.',
      },
    ],
    mnemonic: {
      device: '"A-V-O: Atomic, Visible, Ordered"',
      expansion: [
        { key: 'Atomic', meaning: 'Compound actions happen as one step — locks, atomics, ConcurrentHashMap.merge' },
        { key: 'Visible', meaning: 'Writes reach other threads — through a happens-before edge' },
        { key: 'Ordered', meaning: 'The compiler and CPU cannot reorder across those edges' },
      ],
      visual: 'A shared whiteboard behind a door with one key: whoever holds the key edits in peace (atomic), the next key-holder sees everything written (visible), and nothing written before the key was handed over can appear after it (ordered).',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'Two cashiers, one paper ledger',
        body: 'Each cashier reads the balance, adds a sale on a calculator and writes the new total. If both read 100 at the same moment and add 10, both write 110 — one sale vanishes. A lock is the rule that only the person holding the pen may touch the ledger.',
      },
      {
        kind: 'insight',
        title: 'Thread-safe parts do not make a thread-safe whole',
        body: '`if (!map.containsKey(k)) map.put(k, v)` on a `ConcurrentHashMap` is two individually atomic calls with a gap in between. Atomicity has to cover the whole invariant, which is why `putIfAbsent`, `computeIfAbsent` and `merge` exist and why invariants spanning several fields need one lock around all of them.',
      },
      {
        kind: 'real-world',
        title: 'Diagnosing deadlocks in production',
        body: '`jcmd <pid> Thread.print` (or `jstack`) lists every thread with the locks it holds and wants, and ends with "Found one Java-level deadlock" when there is a cycle. JFR and most APM tools flag long monitor waits. The fix is almost always a consistent lock order or a smaller critical section.',
      },
      {
        kind: 'angle',
        title: 'The best lock is no shared mutable state',
        body: 'Immutable objects need no synchronization; confined state (a local variable, a per-request object) cannot race; message passing through a `BlockingQueue` hands ownership from one thread to another. Locks are for what is left after you have shrunk the shared mutable state as far as possible.',
      },
    ],
    diagrams: [
      {
        id: 'cc-synchronization-race',
        kind: 'concept',
        title: 'A lost update',
        caption: 'Both threads read 5 before either writes, so both write 6. Two increments ran, but only one survived: the read-modify-write was not atomic.',
        explanation: [
          'At the top, **Thread A** and **Thread B** both want to increment the shared field, which starts at **count = 5**.',
          'Thread A runs **read 5**. Before it writes anything, Thread B also runs **read 5**. Nothing stops the two reads from interleaving.',
          'Each thread then does **compute 6** from its own stale copy, adding 1 to the 5 it read.',
          'Both threads **write 6**. The second write simply overwrites the first, leaving **count = 6** instead of 7.',
          'Takeaway: count++ is three separate steps: read, compute and write. So without a lock or an atomic class, concurrent increments can be lost.',
        ],
        cols: 3,
        rows: 4,
        nodes: [
          { id: 'a', label: 'Thread A', col: 0, row: 0, shape: 'pill', tone: 'primary' },
          { id: 'start', label: 'count = 5', detail: 'shared field', col: 1, row: 0, shape: 'cylinder', tone: 'accent' },
          { id: 'b', label: 'Thread B', col: 2, row: 0, shape: 'pill', tone: 'primary' },
          { id: 'ra', label: 'read 5', col: 0, row: 1 },
          { id: 'rb', label: 'read 5', col: 2, row: 1 },
          { id: 'ca', label: 'compute 6', col: 0, row: 2 },
          { id: 'cb', label: 'compute 6', col: 2, row: 2 },
          { id: 'wa', label: 'write 6', col: 0, row: 3 },
          { id: 'end', label: 'count = 6', detail: 'one increment lost', col: 1, row: 3, shape: 'cylinder', tone: 'danger' },
          { id: 'wb', label: 'write 6', col: 2, row: 3 },
        ],
        edges: [
          { from: 'a', to: 'ra' },
          { from: 'ra', to: 'ca' },
          { from: 'ca', to: 'wa' },
          { from: 'b', to: 'rb' },
          { from: 'rb', to: 'cb' },
          { from: 'cb', to: 'wb' },
          { from: 'wa', to: 'end' },
          { from: 'wb', to: 'end' },
        ],
      },
      {
        id: 'cc-synchronization-hb',
        kind: 'flow',
        title: 'Happens-before through a monitor',
        caption: 'Everything thread A did before releasing lock M is guaranteed to be visible to thread B after B acquires M. Without the shared lock, there is no such guarantee. (A volatile, start/join, or a concurrent hand-off can also give it.)',
        explanation: [
          'The left column is Thread A. Inside a synchronized block on lock M, it does a plain write, **data = 42**.',
          'It then reaches **unlock M** at the end of the block. The program order arrow means the write comes before the unlock within Thread A.',
          'Later, Thread B runs **lock M** at the start of its own synchronized block. The happens-before arrow says that unlocking a monitor happens-before every later lock of that same monitor.',
          'Thread B then does **read data**. The chain of program order, happens-before and program order guarantees that it sees 42.',
          'Takeaway: visibility needs a shared edge, such as the same lock, a volatile, start/join or a concurrent hand-off. Without one, B might see a stale (old) value.',
        ],
        cols: 2,
        rows: 4,
        nodes: [
          { id: 'w', label: 'data = 42', detail: 'plain write', col: 0, row: 0, tone: 'primary' },
          { id: 'unlock', label: 'unlock M', detail: 'end of synchronized', col: 0, row: 1, tone: 'accent' },
          { id: 'lock', label: 'lock M', detail: 'start of synchronized', col: 1, row: 2, tone: 'accent' },
          { id: 'r', label: 'read data', detail: 'guaranteed to see 42', col: 1, row: 3, tone: 'success' },
        ],
        edges: [
          { from: 'w', to: 'unlock', label: 'program order' },
          { from: 'unlock', to: 'lock', label: 'happens-before' },
          { from: 'lock', to: 'r', label: 'program order' },
        ],
        groups: [
          { label: 'Thread A', fromCol: 0, toCol: 0, fromRow: 0, toRow: 3, tone: 'primary' },
          { label: 'Thread B', fromCol: 1, toCol: 1, fromRow: 0, toRow: 3, tone: 'accent' },
        ],
      },
      {
        id: 'cc-synchronization-deadlock',
        kind: 'architecture',
        title: 'The deadlock cycle',
        caption: 'Each thread holds one lock and waits for the other. This is a cycle in the wait-for graph. Taking locks in one global order makes the cycle impossible.',
        explanation: [
          '**Thread 1** runs transfer(a, b). As the held by arrow shows, it already holds **Lock A**, and now it waits for Lock B.',
          'At the same moment, **Thread 2** runs transfer(b, a). So it holds **Lock B** and waits for Lock A.',
          'Following the arrows gives a closed loop: each thread waits for a lock the other holds. This circular wait means neither can ever continue.',
          'The **Fix: lock lowest id first** note breaks the cycle. If both threads always take A before B, the second thread waits before it holds anything.',
          'Takeaway: one global lock order removes circular wait. Circular wait is the deadlock condition that is most practical to break.',
        ],
        cols: 3,
        rows: 3,
        nodes: [
          { id: 't1', label: 'Thread 1', detail: 'transfer(a, b)', col: 0, row: 0, tone: 'primary' },
          { id: 'la', label: 'Lock A', detail: 'account 1', col: 2, row: 0, shape: 'cylinder', tone: 'warning' },
          { id: 'lb', label: 'Lock B', detail: 'account 2', col: 0, row: 1, shape: 'cylinder', tone: 'warning' },
          { id: 't2', label: 'Thread 2', detail: 'transfer(b, a)', col: 2, row: 1, tone: 'primary' },
          { id: 'fix', label: 'Fix: lock lowest id first', detail: 'both threads take A then B, so no cycle can form', col: 0, row: 2, span: 3, shape: 'note', tone: 'success' },
        ],
        edges: [
          { from: 'la', to: 't1', label: 'held by' },
          { from: 't1', to: 'lb', label: 'waits for' },
          { from: 'lb', to: 't2', label: 'held by' },
          { from: 't2', to: 'la', label: 'waits for' },
        ],
      },
    ],
    variants: [
      {
        title: 'Lock types',
        items: [
          { name: 'Intrinsic lock (synchronized)', summary: 'Every object has a monitor; reentrant, released automatically, supports wait/notify. No timeout or interruptible acquire.', support: 'supported', code: 'synchronized (lock) { balance += amount; }' },
          { name: 'ReentrantLock', summary: 'Explicit lock with tryLock (optionally timed), lockInterruptibly, optional fairness and multiple Conditions. Must unlock in finally.', support: 'supported', code: 'lock.lock();\ntry { ... } finally { lock.unlock(); }' },
          { name: 'ReentrantReadWriteLock', summary: 'Many concurrent readers or one writer. Helps only when reads dominate and are long enough to outweigh its overhead; a reader cannot upgrade to a write lock.', support: 'supported', code: 'rw.readLock().lock();' },
          { name: 'StampedLock (Java 8)', summary: 'Read, write and optimistic-read modes; an optimistic read takes no lock and validates a stamp afterwards. Not reentrant and has no Conditions.', support: 'supported', code: 'long s = sl.tryOptimisticRead();\ndouble x = this.x;\nif (!sl.validate(s)) { /* retry under readLock */ }' },
        ],
      },
      {
        title: 'Atomic classes (java.util.concurrent.atomic)',
        items: [
          { name: 'AtomicInteger / AtomicLong / AtomicBoolean', summary: 'Lock-free single-variable updates via compare-and-set: incrementAndGet, compareAndSet, updateAndGet, accumulateAndGet.', support: 'supported' },
          { name: 'AtomicReference<V>', summary: 'Atomically swap a reference, e.g. to publish a new immutable snapshot or build lock-free structures.', support: 'supported' },
          { name: 'AtomicIntegerArray / AtomicLongArray / AtomicReferenceArray', summary: 'Atomic operations on individual array elements.', support: 'supported' },
          { name: 'AtomicStampedReference / AtomicMarkableReference', summary: 'A reference plus a stamp or mark, to detect the ABA problem in compare-and-set algorithms.', support: 'supported' },
          { name: 'LongAdder / LongAccumulator (Java 8)', summary: 'Spread updates over cells to avoid contention; much faster than AtomicLong for hot counters that are read rarely. sum() is not an atomic snapshot.', support: 'supported' },
          { name: 'Field updaters and VarHandle', summary: 'AtomicIntegerFieldUpdater and, since Java 9, VarHandle give atomic operations on ordinary volatile fields without a wrapper object per field.', support: 'supported' },
        ],
      },
      {
        title: 'Forms of synchronized',
        intro: 'Every form acquires an object\'s intrinsic lock (its monitor); they differ in which object is locked and for how long.',
        items: [
          { name: 'Synchronized instance method', summary: 'Locks the monitor of `this` for the whole method. Simple, but outside code that synchronizes on the same object shares the lock.', support: 'supported', code: 'public synchronized void deposit(long c) { balance += c; }' },
          { name: 'Static synchronized method', summary: 'Locks the monitor of the `Class` object (for example `Account.class`), one lock shared by all instances and independent of their instance locks.', support: 'supported', code: 'public static synchronized int nextId() { return ++lastId; }' },
          { name: 'Synchronized block on this', summary: 'Locks `this` only around the critical section, so the rest of the method runs without holding the lock.', support: 'supported', code: 'synchronized (this) { balance += c; }' },
          { name: 'Synchronized block on a private lock', summary: 'Locks a private final object that no outside code can reach, so nobody else can take or hold the lock. Preferred in library code.', support: 'supported', code: 'private final Object lock = new Object();\nsynchronized (lock) { balance += c; }' },
          { name: 'Synchronized block on a class literal', summary: 'Locks the class monitor explicitly: the same lock that static synchronized methods of that class use.', support: 'supported', code: 'synchronized (Account.class) { lastId++; }' },
        ],
      },
    ],
    deepDive: [
      {
        title: 'Data-race-free programs are sequentially consistent',
        body: 'The JMM\'s central promise (JLS 17.4.3-17.4.5): if every conflicting access is ordered by happens-before, the program behaves as if all actions ran in some single interleaving. You only need to reason about reordering if you write racy code. Even racy code keeps **out-of-thin-air** safety and `final` field guarantees: an object whose fields are `final` and whose `this` does not escape during construction is seen fully initialised by any thread, without synchronization (JLS 17.5) — the reason immutable objects are safe to share.',
        sources: [
          { label: 'JLS §17.4: Memory Model', url: 'https://docs.oracle.com/javase/specs/jls/se21/html/jls-17.html#jls-17.4' },
          { label: 'JLS §17.5: final Field Semantics', url: 'https://docs.oracle.com/javase/specs/jls/se21/html/jls-17.html#jls-17.5' },
          { label: 'JSR 133 (Java Memory Model and Thread Specification Revision)', url: 'https://jcp.org/en/jsr/detail?id=133' },
        ],
      },
      {
        title: 'How locks got cheap — and biased locking went away',
        body: 'HotSpot locks are thin until contended: an uncontended `synchronized` is a compare-and-swap on the object header, and only contention inflates it to a full OS-backed monitor. Biased locking, which avoided even the CAS for single-thread use, was disabled by default and deprecated in Java 15 (JEP 374) and later removed, because modern CPUs made CAS cheap and its revocation pauses hurt. The JIT also removes locks on objects that do not escape (lock elision) and merges adjacent ones (lock coarsening).',
        sources: [{ label: 'JEP 374: Deprecate and Disable Biased Locking', url: 'https://openjdk.org/jeps/374' }],
      },
      {
        title: 'Compare-and-set, contention and LongAdder',
        body: 'Atomics loop on compare-and-set: read, compute, CAS; retry if another thread won. Under heavy contention many CAS attempts fail and the cache line bounces between cores. `LongAdder` keeps a base value plus a dynamically grown array of padded cells, so threads mostly update different cache lines; `sum()` adds them up. Trade-off: reads are slower and not atomic with respect to concurrent updates — fine for metrics, wrong for generating unique ids.',
        sources: [
          { label: 'java.util.concurrent.atomic.LongAdder API (Java 21)', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/atomic/LongAdder.html' },
          { label: 'Java Concurrency in Practice by Brian Goetz et al., chapter 15: Atomic Variables and Nonblocking Synchronization' },
        ],
      },
    ],
  },

  'cc-concurrency-utilities': {
    textbook: {
      definition:
        'The **concurrency utilities** are the classes and interfaces of the `java.util.concurrent` package and its subpackages. They supply reusable, well-tested parts for concurrent programming. They include executors for running tasks, and **blocking queues** for passing elements between threads. They include **synchronizers** that coordinate the progress of threads, such as `CountDownLatch`, `CyclicBarrier`, `Phaser` and `Semaphore`. They also include **concurrent collections** built for many threads to use at once, explicit locks and atomic variables. Each utility documents its **memory consistency effects**: the happens-before relations it sets up between actions in different threads.',
      terms: [
        { term: 'Blocking queue', meaning: 'A queue where insertion waits for space when the queue is full, and removal waits for an element when it is empty.' },
        { term: 'Synchronizer', meaning: 'An object that controls the flow of threads based on its state. Examples are a latch, barrier, phaser or semaphore.' },
        { term: 'Semaphore', meaning: 'A synchronizer that keeps a count of permits. `acquire` waits until a permit is available, and `release` returns one.' },
        { term: 'Concurrent collection', meaning: 'A collection designed for concurrent access. Its iterators are weakly consistent, and its compound operations, such as `merge`, are atomic.' },
        { term: 'Memory consistency effects', meaning: 'The happens-before guarantees a utility gives. For example, actions before `countDown()` are visible after `await()` returns.' },
      ],
      source: 'Javadoc for the java.util.concurrent package (Memory Consistency Properties); JSR 166',
    },
    interviewDefinition:
      '`java.util.concurrent` provides tested building blocks for coordination. **BlockingQueue** is for producer-consumer hand-off with back-pressure (producers wait when it is full). **CountDownLatch** lets threads wait once for N events. **CyclicBarrier** and **Phaser** are for threads that meet repeatedly. **Semaphore** caps concurrent access. Concurrent collections include **ConcurrentHashMap** (atomic `compute`/`merge`) and **CopyOnWriteArrayList** (snapshot iteration for read-mostly data). They replace error-prone `wait`/`notify` code. They also create happens-before edges for the data they pass.',
    interviewFollowUps: [
      {
        question: 'How would you implement producer-consumer?',
        answer: 'Use a **bounded** `BlockingQueue`: producers `put`, consumers `take`. The bound gives back-pressure. Shut down with one poison pill per consumer, or by interrupting/closing the executor. Never hand-roll it with `wait`/`notify` unless asked to.',
      },
      {
        question: 'CountDownLatch vs CyclicBarrier?',
        answer: 'A latch is one-shot. It separates the threads that count down from the threads that wait. A barrier makes a fixed group of threads wait for each other. It can run an action when the last one arrives, and it resets for the next round.',
      },
      {
        question: 'Is ConcurrentHashMap.size() exact?',
        answer: 'Only when no updates are in flight. During concurrent changes, it is an estimate. Iterators are weakly consistent: they reflect some state since they were created, and they never throw `ConcurrentModificationException`.',
      },
    ],
    mnemonic: {
      device: '"Queue to pass, Latch to wait, Barrier to meet, Semaphore to limit"',
      expansion: [
        { key: 'Queue to pass', meaning: 'BlockingQueue hands work from producers to consumers' },
        { key: 'Latch to wait', meaning: 'CountDownLatch: wait once until N things have happened' },
        { key: 'Barrier to meet', meaning: 'CyclicBarrier / Phaser: a group meets at the end of every round' },
        { key: 'Semaphore to limit', meaning: 'At most N threads inside at once' },
      ],
      visual: 'A theme park: the conveyor belt to the ride (queue), the gate that opens when the park opens (latch), the group photo that waits until every friend is there (barrier) and the ride with exactly 3 seats (semaphore).',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'A sushi conveyor belt',
        body: 'Chefs put plates on the belt, customers take them off. When the belt is full the chefs pause; when it is empty customers wait. Nobody needs to coordinate by shouting — the belt itself is the coordination. That is a bounded `BlockingQueue`.',
      },
      {
        kind: 'insight',
        title: 'Back-pressure is a feature, not a slowdown',
        body: 'An unbounded queue hides the fact that producers outrun consumers until the heap fills up. A bounded queue turns that hidden problem into a visible, safe one: producers wait. `Executors.newFixedThreadPool` uses an unbounded queue, so for high-volume pipelines build a `ThreadPoolExecutor` with a bounded queue and a rejection policy such as `CallerRunsPolicy`.',
      },
      {
        kind: 'real-world',
        title: 'Semaphores and virtual threads',
        body: 'With virtual threads you no longer limit concurrency by limiting threads. A service that fans out to a partner API allowing 20 concurrent calls wraps the call in `semaphore.acquire()` / `release()`; thousands of virtual threads wait cheaply for a permit while the partner sees at most 20.',
      },
      {
        kind: 'angle',
        title: 'Tests love latches',
        body: 'A `CountDownLatch` turns "sleep 500 ms and hope the background work finished" into a deterministic wait: the code under test counts down, the test calls `await(5, SECONDS)` and asserts on the boolean. Flaky concurrency tests are almost always sleeps that should have been latches.',
      },
    ],
    diagrams: [
      {
        id: 'cc-concurrency-utilities-pc',
        kind: 'architecture',
        title: 'Producer-consumer with a bounded queue',
        caption: 'Producers and consumers never touch each other directly. The queue blocks producers when it is full and consumers when it is empty. It passes each item with a happens-before edge.',
        explanation: [
          'On the left, **Producer 1** and **Producer 2** read files. They put each item into the shared **ArrayBlockingQueue**, which holds at most 16 items.',
          'On the right, **Consumer 1** and **Consumer 2** take items from the queue and write them to the database. Producers and consumers never call each other directly.',
          'The **put() blocks** note shows back-pressure: when the queue is full, producers wait instead of letting work pile up in memory.',
          'The **take() blocks** note shows the other side: when the queue is empty, consumers wait cheaply until an item arrives.',
          'To stop cleanly, the producers send one **Poison pill** per consumer. This is a special item that means no more work is coming.',
          'Takeaway: the bounded queue is the whole coordination mechanism. Each hand-off creates a happens-before edge, so consumers see every item fully built.',
        ],
        cols: 3,
        rows: 3,
        nodes: [
          { id: 'p1', label: 'Producer 1', detail: 'reads files', col: 0, row: 0, tone: 'primary' },
          { id: 'c1', label: 'Consumer 1', detail: 'writes to DB', col: 2, row: 0, tone: 'success' },
          { id: 'p2', label: 'Producer 2', detail: 'reads files', col: 0, row: 1, tone: 'primary' },
          { id: 'q', label: 'ArrayBlockingQueue', detail: 'capacity 16', col: 1, row: 1, shape: 'cylinder', tone: 'accent' },
          { id: 'c2', label: 'Consumer 2', detail: 'writes to DB', col: 2, row: 1, tone: 'success' },
          { id: 'full', label: 'put() blocks', detail: 'when the queue is full', col: 0, row: 2, shape: 'note', tone: 'warning' },
          { id: 'pill', label: 'Poison pill', detail: 'one per consumer to stop', col: 1, row: 2, shape: 'note', tone: 'neutral' },
          { id: 'empty', label: 'take() blocks', detail: 'when the queue is empty', col: 2, row: 2, shape: 'note', tone: 'warning' },
        ],
        edges: [
          { from: 'p1', to: 'q', label: 'put' },
          { from: 'p2', to: 'q', label: 'put' },
          { from: 'q', to: 'c1', label: 'take' },
          { from: 'q', to: 'c2', label: 'take' },
        ],
      },
      {
        id: 'cc-concurrency-utilities-sync',
        kind: 'concept',
        title: 'Latch, barrier and semaphore side by side',
        caption: 'A latch opens once for whoever waits on it. A barrier releases a group together and then resets. A semaphore lets a fixed number through at a time.',
        explanation: [
          'Left column: **Workers** call countDown() on a **CountDownLatch(3)**. When the count reaches zero, the latch opens, and the **Main thread** returns from await().',
          'The latch is one-shot: once open, it stays open. The threads that count down are different from the thread that waits.',
          'Middle column: **3 party threads** each call await() on a **CyclicBarrier(3)**. When all have arrived, it trips, runs the **Barrier action**, and resets for the next round.',
          'Right column: **10 tasks** call acquire() on a **Semaphore(3)**. Only three permits exist, so there are **At most 3 inside** at once. Each task releases its permit in finally.',
          'Takeaway: a latch waits once for events. A barrier makes a group meet repeatedly. A semaphore limits how many threads run at the same time.',
        ],
        cols: 3,
        rows: 3,
        nodes: [
          { id: 'lw', label: 'Workers', detail: 'call countDown()', col: 0, row: 0, tone: 'neutral' },
          { id: 'latch', label: 'CountDownLatch(3)', detail: 'one-shot gate', col: 0, row: 1, tone: 'primary' },
          { id: 'lm', label: 'Main thread', detail: 'await() returns at 0', col: 0, row: 2, tone: 'success' },
          { id: 'bp', label: '3 party threads', detail: 'each calls await()', col: 1, row: 0, tone: 'neutral' },
          { id: 'barrier', label: 'CyclicBarrier(3)', detail: 'reusable meeting point', col: 1, row: 1, tone: 'primary' },
          { id: 'ba', label: 'Barrier action', detail: 'then the next round', col: 1, row: 2, tone: 'success' },
          { id: 'st', label: '10 tasks', detail: 'each calls acquire()', col: 2, row: 0, tone: 'neutral' },
          { id: 'sem', label: 'Semaphore(3)', detail: 'three permits', col: 2, row: 1, tone: 'primary' },
          { id: 'si', label: 'At most 3 inside', detail: 'release() in finally', col: 2, row: 2, tone: 'success' },
        ],
        edges: [
          { from: 'lw', to: 'latch', label: 'count to zero' },
          { from: 'latch', to: 'lm', label: 'opens' },
          { from: 'bp', to: 'barrier', label: 'all arrive' },
          { from: 'barrier', to: 'ba', label: 'trips and resets' },
          { from: 'st', to: 'sem', label: 'acquire' },
          { from: 'sem', to: 'si', label: 'permit granted' },
        ],
      },
      {
        id: 'cc-concurrency-utilities-choose',
        kind: 'flow',
        title: 'Which utility do I need?',
        caption: 'Ask what the threads must do together. Each "yes" lands on the simplest tool for that job.',
        explanation: [
          'Start with **Hand work over?** If threads form the stages of a pipeline, use a bounded **BlockingQueue** with put and take.',
          'If not, ask **Wait once for N?** For start-up checks or tests that wait for N events, use a **CountDownLatch**.',
          'Next, **Meet every round?** Phased algorithms, where a group must meet repeatedly, use a **CyclicBarrier**. Use a Phaser if the number of parties changes.',
          'Then **Limit concurrency?** To protect a scarce resource such as a partner API, use a **Semaphore** with a fixed number of permits.',
          'Finally, **Share a map or list?** Choose a **Concurrent collection**, such as ConcurrentHashMap with merge or a CopyOnWriteArrayList.',
          'Takeaway: decide what the threads must do together. Each yes leads to the simplest ready-made tool, so you never need hand-written wait and notify.',
        ],
        cols: 2,
        rows: 5,
        nodes: [
          { id: 'q1', label: 'Hand work over?', detail: 'stages of a pipeline', col: 0, row: 0, tone: 'neutral' },
          { id: 'a1', label: 'BlockingQueue', detail: 'bounded, put / take', col: 1, row: 0, tone: 'primary' },
          { id: 'q2', label: 'Wait once for N?', detail: 'start-up, tests', col: 0, row: 1, tone: 'neutral' },
          { id: 'a2', label: 'CountDownLatch', col: 1, row: 1, tone: 'primary' },
          { id: 'q3', label: 'Meet every round?', detail: 'phased algorithms', col: 0, row: 2, tone: 'neutral' },
          { id: 'a3', label: 'CyclicBarrier', detail: 'Phaser if parties change', col: 1, row: 2, tone: 'primary' },
          { id: 'q4', label: 'Limit concurrency?', detail: 'scarce resource', col: 0, row: 3, tone: 'neutral' },
          { id: 'a4', label: 'Semaphore', col: 1, row: 3, tone: 'primary' },
          { id: 'q5', label: 'Share a map or list?', col: 0, row: 4, tone: 'neutral' },
          { id: 'a5', label: 'Concurrent collection', detail: 'CHM merge, COW list', col: 1, row: 4, tone: 'primary' },
        ],
        edges: [
          { from: 'q1', to: 'a1', label: 'yes' },
          { from: 'q1', to: 'q2', label: 'no' },
          { from: 'q2', to: 'a2', label: 'yes' },
          { from: 'q2', to: 'q3', label: 'no' },
          { from: 'q3', to: 'a3', label: 'yes' },
          { from: 'q3', to: 'q4', label: 'no' },
          { from: 'q4', to: 'a4', label: 'yes' },
          { from: 'q4', to: 'q5', label: 'no' },
          { from: 'q5', to: 'a5', label: 'yes' },
        ],
      },
    ],
    variants: [
      {
        title: 'BlockingQueue implementations',
        items: [
          { name: 'ArrayBlockingQueue', summary: 'Fixed capacity backed by an array; optional fairness. The default for bounded pipelines.', support: 'supported' },
          { name: 'LinkedBlockingQueue', summary: 'Linked nodes, separate locks for head and tail; unbounded (Integer.MAX_VALUE) unless you pass a capacity.', support: 'supported' },
          { name: 'SynchronousQueue', summary: 'Zero capacity: every put waits for a matching take. Direct hand-off, used by newCachedThreadPool.', support: 'supported' },
          { name: 'PriorityBlockingQueue', summary: 'Unbounded, takes the smallest element first by natural order or a Comparator.', support: 'supported' },
          { name: 'DelayQueue', summary: 'Elements become available only after their delay expires; for timers and retries.', support: 'supported' },
          { name: 'LinkedTransferQueue (Java 7)', summary: 'Unbounded; transfer() waits until a consumer has received the element.', support: 'supported' },
        ],
      },
      {
        title: 'Synchronizers',
        items: [
          { name: 'CountDownLatch', summary: 'Wait until a count reaches zero; one-shot.', support: 'supported', code: 'latch.countDown();  // workers\nlatch.await();      // waiter' },
          { name: 'CyclicBarrier', summary: 'A fixed number of parties wait for each other; optional barrier action; reusable; breaks if a party fails.', support: 'supported', code: 'new CyclicBarrier(3, () -> mergeRound())' },
          { name: 'Phaser (Java 7)', summary: 'Reusable barrier whose parties can register and deregister between phases.', support: 'supported', code: 'phaser.arriveAndAwaitAdvance();' },
          { name: 'Semaphore', summary: 'N permits; acquire and release (in finally). Not owned by a thread.', support: 'supported', code: 'sem.acquire();\ntry { call(); } finally { sem.release(); }' },
          { name: 'Exchanger', summary: 'Two threads swap objects at a rendezvous point. Rarely used.', support: 'supported' },
        ],
      },
      {
        title: 'Concurrent collections',
        items: [
          { name: 'ConcurrentHashMap', summary: 'Concurrent reads and fine-grained writes; atomic putIfAbsent, compute, computeIfAbsent, merge. No null keys or values.', support: 'supported' },
          { name: 'ConcurrentSkipListMap / Set', summary: 'Sorted concurrent NavigableMap/NavigableSet with O(log n) operations.', support: 'supported' },
          { name: 'CopyOnWriteArrayList / Set', summary: 'Copies the array on every write; snapshot iterators. For small, read-mostly data such as listener lists.', support: 'supported' },
          { name: 'ConcurrentLinkedQueue / Deque', summary: 'Lock-free, unbounded, non-blocking queues.', support: 'supported' },
          { name: 'Collections.synchronizedMap / Hashtable', summary: 'Lock the whole collection on every call; iteration and compound actions still need external locking.', support: 'partial', note: 'Legacy: prefer ConcurrentHashMap.' },
        ],
      },
    ],
    deepDive: [
      {
        title: 'AbstractQueuedSynchronizer: one engine behind many tools',
        body: '`ReentrantLock`, `Semaphore`, `CountDownLatch`, `ReentrantReadWriteLock` and the internals of `ThreadPoolExecutor` are all built on **AbstractQueuedSynchronizer** (AQS): an `int` state updated by compare-and-set plus a FIFO queue of waiting threads parked with `LockSupport.park`. Each tool only defines what the state means (hold count, permits, remaining count) and when acquiring succeeds. Because they all park through `LockSupport`, virtual threads blocked on any of them unmount from their carrier. Doug Lea\'s paper describes the design.',
        sources: [
          { label: 'The java.util.concurrent Synchronizer Framework, Doug Lea (2004)' },
          { label: 'java.util.concurrent.locks.AbstractQueuedSynchronizer API (Java 21)', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/locks/AbstractQueuedSynchronizer.html' },
        ],
      },
      {
        title: 'Memory consistency effects are part of the contract',
        body: 'The `java.util.concurrent` package documentation lists the happens-before edges each class provides: actions before placing an object into any concurrent collection happen-before its access or removal by another thread; actions before `countDown()` happen-before a successful return from `await()`; actions before `release()` happen-before a successful `acquire()`; each `await()` of a barrier happens-before the barrier action, which happens-before the other parties return. That is why the examples can safely read results after `await` or `join` with no extra locking.',
        sources: [{ label: 'java.util.concurrent package summary: Memory Consistency Properties (Java 21)', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/package-summary.html' }],
      },
      {
        title: 'Inside ConcurrentHashMap since Java 8',
        body: 'Java 8 replaced the 16 segment locks with a table of bins: an empty bin is filled with a CAS, a non-empty bin is updated while holding a lock on its first node, and reads never lock. Long collision chains turn into red-black trees. `compute`-style methods hold the bin lock while your function runs, so a slow function blocks other writers to that bin, and modifying the same map from inside the function can throw `IllegalStateException: Recursive update`. Resizes are cooperative: threads that encounter a resize help transfer bins.',
        sources: [
          { label: 'java.util.concurrent.ConcurrentHashMap API (Java 21)', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/ConcurrentHashMap.html' },
          { label: 'JEP 155: Concurrency Updates', url: 'https://openjdk.org/jeps/155' },
        ],
      },
    ],
  },
};
