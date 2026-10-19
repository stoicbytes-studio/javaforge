import type { LessonConcepts } from '@/types/curriculum';

/** Concept pages for module 9 (Concurrency), keyed by lesson id. */
export const concurrencyConcepts: Record<string, LessonConcepts> = {
  'cc-threads': {
    interviewDefinition:
      'A **thread** is an independent path of execution with its own stack and program counter, sharing the heap with every other thread in the process. Java exposes threads through `Thread`, but production code submits `Runnable`/`Callable` tasks to an **ExecutorService**, which manages a pool and returns a `Future`. Since Java 21, **virtual threads** are cheap JVM-scheduled threads that unmount from their carrier while blocked, so blocking code scales to millions of concurrent tasks — they make waiting cheap, not computing faster.',
    interviewFollowUps: [
      {
        question: 'Runnable or Callable — what is the difference?',
        answer: '`Runnable.run()` returns nothing and cannot throw checked exceptions. `Callable<V>.call()` returns a value and may throw `Exception`; submitted to an executor it yields a `Future<V>` whose `get()` returns the value or throws `ExecutionException` wrapping the failure.',
      },
      {
        question: 'How do you stop a thread?',
        answer: 'Cooperatively: call `interrupt()` (or `Future.cancel(true)`, `shutdownNow()`), and have the task check `Thread.interrupted()` or react to `InterruptedException` from blocking calls. `Thread.stop()` was unsafe and has thrown `UnsupportedOperationException` since Java 20.',
      },
      {
        question: 'Should you pool virtual threads?',
        answer: 'No. Create one per task — they are cheap. To limit access to a scarce resource, use a `Semaphore` or the resource\'s own pool, not a small pool of threads.',
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
        caption: 'Only virtual threads that are running occupy a carrier. A blocked one unmounts and its stack waits on the heap, so the carrier can immediately run another.',
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
        caption: 'A thread is NEW until start(), TERMINATED after run() returns, and moves between RUNNABLE and the three waiting states in between. RUNNABLE includes threads blocked in OS-level I/O.',
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
        caption: 'submit() returns a Future at once; tasks wait in a queue until a worker takes them. The worker stores the result or exception in the Future, which unblocks get().',
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
    interviewDefinition:
      'Thread safety needs both **atomicity** (no interleaving inside a compound action such as `count++`) and **visibility** (one thread\'s writes become visible to another). The **Java Memory Model** guarantees visibility only through **happens-before** edges: monitor unlock/lock, volatile write/read, `Thread.start`/`join`, and hand-offs in `java.util.concurrent`. Tools: `synchronized` and `ReentrantLock` for mutual exclusion, `volatile` for flags and safe publication, atomics for lock-free single-variable updates, and concurrent collections for shared data.',
    interviewFollowUps: [
      {
        question: 'synchronized or ReentrantLock?',
        answer: 'Default to `synchronized`: simpler, released automatically, and since Java 24 no longer pins virtual threads. Use `ReentrantLock` when you need `tryLock` with a timeout, interruptible locking, fairness or several `Condition`s.',
      },
      {
        question: 'Why is double-checked locking broken without volatile?',
        answer: 'Without a happens-before edge, another thread can see the reference to the new object before the constructor\'s writes, i.e. a half-built object. Declaring the field `volatile` (or using the holder-class idiom) fixes it.',
      },
      {
        question: 'What are the four conditions for deadlock?',
        answer: 'Mutual exclusion, hold-and-wait, no preemption and circular wait (Coffman). Breaking any one prevents deadlock; the practical one is circular wait, via a global lock order.',
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
        caption: 'Both threads read 5 before either writes, so both write 6. Two increments ran, one survived — the read-modify-write was not atomic.',
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
        caption: 'Everything thread A did before releasing lock M is guaranteed visible to thread B after it acquires M. Without the shared lock (or a volatile, start/join, or a concurrent hand-off) there is no such guarantee.',
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
        caption: 'Each thread holds one lock and waits for the other: a cycle in the wait-for graph. Acquiring locks in one global order makes the cycle impossible.',
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
    interviewDefinition:
      '`java.util.concurrent` provides tested building blocks for coordination: **BlockingQueue** for producer-consumer hand-off with back-pressure, **CountDownLatch** to wait once for N events, **CyclicBarrier** and **Phaser** for threads that meet repeatedly, **Semaphore** to cap concurrent access, and concurrent collections such as **ConcurrentHashMap** (atomic `compute`/`merge`) and **CopyOnWriteArrayList** (snapshot iteration for read-mostly data). They replace error-prone `wait`/`notify` code and create happens-before edges for the data they pass.',
    interviewFollowUps: [
      {
        question: 'How would you implement producer-consumer?',
        answer: 'With a **bounded** `BlockingQueue`: producers `put`, consumers `take`; the bound gives back-pressure. Shut down with one poison pill per consumer or by interrupting/closing the executor. Never hand-roll it with `wait`/`notify` unless asked to.',
      },
      {
        question: 'CountDownLatch vs CyclicBarrier?',
        answer: 'A latch is one-shot and separates the threads that count down from the threads that wait. A barrier makes a fixed group of threads wait for each other, can run an action when the last arrives, and resets for the next round.',
      },
      {
        question: 'Is ConcurrentHashMap.size() exact?',
        answer: 'Only when no updates are in flight; during concurrent modification it is an estimate. Iterators are weakly consistent: they reflect some state since their creation and never throw `ConcurrentModificationException`.',
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
        caption: 'Producers and consumers never touch each other directly. The queue blocks producers when full and consumers when empty, and passes each item with a happens-before edge.',
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
        caption: 'A latch opens once for whoever waits on it; a barrier releases a group together and resets; a semaphore lets a fixed number through at a time.',
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
