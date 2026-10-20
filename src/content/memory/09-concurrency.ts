import type { MemoryAid } from '@/types/curriculum';

/** "Make it stick" memory aids for module 9 (Concurrency), keyed by lesson id. */
export const concurrencyMemory: Record<string, MemoryAid> = {
  'cc-threads': {
    oneLiner: 'Hand tasks to an executor, which runs them on a pool of threads and gives you a `Future` ticket.',
    story:
      'Think of a post office. Customers bring jobs, a manager hands each job to a free clerk, and you get a numbered ticket to collect the result later. The post office does not hire a new clerk for every customer; it keeps a team. In Java, each job is a task (`Runnable`, or `Callable` if it returns a value), the manager is an `ExecutorService`, the clerks are threads, and the ticket is a `Future`, whose `get()` waits for the result. Since Java 21, virtual threads are like clerks who put a waiting job aside, for example while on hold on the phone, so very many waiting jobs cost little.',
    keyPoints: [
      'A thread is a separate path of work with its own stack, sharing the heap with other threads.',
      'Submit `Runnable` or `Callable` tasks to an `ExecutorService` instead of managing threads by hand.',
      'Virtual threads (Java 21) make waiting cheap, but they do not make calculations faster.',
    ],
    types: [
      {
        title: 'Ways to create concurrent work',
        items: [
          { name: 'Subclass `Thread`', simple: 'Build a worker who can only ever do one job. Works, but rarely the right choice today.' },
          { name: '`Runnable` passed to `Thread`', simple: 'Write the job on a card and hand it to a new worker. No result comes back.' },
          { name: '`Callable` + `ExecutorService`', simple: 'Hand jobs to a team with a fixed number of workers and get a receipt (`Future`) for each result.' },
          { name: 'Virtual threads (Java 21)', simple: 'Very cheap workers who step aside while waiting, so you can have one per task, even millions.' },
          { name: '`CompletableFuture`', simple: 'A chain of steps that runs in the background, like a delivery that triggers the next job when it arrives.' },
        ],
      },
      {
        title: 'Thread states',
        items: [
          { name: 'NEW', simple: 'Created but not started yet, like a hired worker before their first day.' },
          { name: 'RUNNABLE', simple: 'Working, or ready to work as soon as a CPU is free.' },
          { name: 'BLOCKED', simple: 'Waiting at a locked door (a `synchronized` block) that another thread is holding.' },
          { name: 'WAITING', simple: 'Waiting with no time limit until another thread gives a signal.' },
          { name: 'TIMED_WAITING', simple: 'Waiting with an alarm set, like `sleep(1000)`; it wakes up when time runs out.' },
          { name: 'TERMINATED', simple: 'Finished for good. A finished thread can never be started again.' },
        ],
      },
    ],
    confusion: {
      mixedUpWith: '`start()` and `run()`',
      difference: '`start()` creates a new thread that then calls `run()`. Calling `run()` yourself just runs the code on the current thread.',
    },
    tryIt: 'Create a `Thread` that prints `Thread.currentThread().getName()`. Call `run()` and then `start()` on two such threads and compare the printed names.',
    recall: [
      { question: 'What does a `Future` give you?', answer: 'A handle to a task result; `get()` waits for the value or throws if the task failed.' },
      { question: 'How is `Callable` different from `Runnable`?', answer: '`Callable` returns a value and may throw checked exceptions; `Runnable` returns nothing.' },
      { question: 'What kind of work do virtual threads help most?', answer: 'Work that spends most of its time waiting, such as network or database calls.' },
    ],
    picture: {
      title: 'Take a ticket, the clerks do the work',
      caption: 'Jobs (tasks) are handed to a team of clerks (a thread pool). You keep a ticket (`Future`) and use it to collect the result.',
      items: [
        { icon: 'queue', label: 'Tasks', x: 10, y: 12, size: 0.8, tone: 'neutral' },
        { icon: 'people', label: 'Thread pool', x: 47, y: 12, size: 0.8, tone: 'primary' },
        { icon: 'tag', label: 'Future', x: 87, y: 12, size: 0.8, tone: 'accent' },
        { icon: 'person', label: 'You: get()', x: 87, y: 44, size: 0.8, tone: 'success' },
      ],
      arrows: [
        { from: 0, to: 1, label: 'submit' },
        { from: 1, to: 2, label: 'result' },
        { from: 2, to: 3 },
      ],
    },
  },
  'cc-synchronization': {
    oneLiner: 'Shared data needs one writer at a time and a guarantee that other threads see the latest value.',
    story:
      'Two people keep a tally on one whiteboard. Both read 5, both write 6, and one count is lost. So the office adds one marker pen: only the person holding it may write, and when they hand it over, the next person sees everything already written. A separate notice board is good for one simple sign like "closed", but not for counting. In Java, the people are threads, the tally is a shared field like `count`, the lost count is a race on `count++`, the single pen is a lock (`synchronized` or `ReentrantLock`), handing it over creates a happens-before edge, which makes earlier writes visible, and the notice board is a `volatile` flag.',
    keyPoints: [
      'Atomicity: `count++` is read, add, write, so two threads can interleave and lose updates.',
      'Visibility: without a happens-before edge, one thread may never see another thread\'s write.',
      'Use `synchronized` or locks for compound actions, atomics for single counters, `volatile` for flags.',
    ],
    types: [
      {
        title: 'Lock types',
        items: [
          { name: '`synchronized`', simple: 'The built-in lock on every object. Simple and released automatically, like a bathroom door that unlocks when you leave.' },
          { name: '`ReentrantLock`', simple: 'A lock you open and close yourself, with extras such as trying for a while and then giving up.' },
          { name: '`ReentrantReadWriteLock`', simple: 'Many readers may look at once, but a writer needs the room to themselves.' },
          { name: '`StampedLock`', simple: 'Read optimistically without locking, then check a ticket to see if anyone wrote in the meantime.' },
        ],
      },
      {
        title: 'Forms of synchronized',
        items: [
          { name: 'Synchronized method', simple: 'Locks the whole object for the whole method, like locking the shop while serving one customer.' },
          { name: 'Static synchronized method', simple: 'Locks the class itself, one lock shared by every object of that class.' },
          { name: 'Synchronized block', simple: 'Locks only the few lines that touch shared data, so the rest runs freely.' },
        ],
      },
      {
        title: 'Atomic classes',
        items: [
          { name: '`AtomicInteger` / `AtomicLong`', simple: 'A counter that can be safely increased by many threads at once without a lock.' },
          { name: '`AtomicReference`', simple: 'Swap a whole object in one safe step, like replacing a sign on a door.' },
          { name: '`LongAdder`', simple: 'Many little tally sheets added up at the end; fastest for busy counters you rarely read.' },
        ],
      },
    ],
    confusion: {
      mixedUpWith: '`volatile` and `synchronized`',
      difference: '`volatile` makes each read and write visible, but `count++` on it is still not atomic. `synchronized` gives both.',
    },
    tryIt: 'Start two threads that each do `count++` 100,000 times on a shared `int`, join them, and print the total. Then use `AtomicInteger.incrementAndGet()` and compare.',
    recall: [
      { question: 'Why is `count++` not thread-safe?', answer: 'It is three steps, read, add and write, so two threads can overwrite each other.' },
      { question: 'What does a happens-before edge guarantee?', answer: 'That writes made before it are visible to the thread on the other side, such as after a lock is taken.' },
      { question: 'When is a `volatile` field enough?', answer: 'For a simple flag or a single value that one thread writes and others only read.' },
    ],
    picture: {
      title: 'One marker pen for the whiteboard',
      caption: 'Only the thread holding the pen (the lock) may update the tally (shared data). The other thread waits, then sees the latest value.',
      items: [
        { icon: 'person', label: 'Thread A', x: 13, y: 12, size: 0.8, tone: 'primary' },
        { icon: 'person', label: 'Thread B', x: 13, y: 46, size: 0.8, tone: 'warning' },
        { icon: 'key', label: 'Lock', x: 50, y: 28, size: 0.8, tone: 'accent' },
        { icon: 'note', label: 'count', x: 87, y: 28, size: 0.8, tone: 'success' },
      ],
      arrows: [
        { from: 0, to: 2 },
        { from: 1, to: 2, dashed: true },
        { from: 2, to: 3, label: 'write' },
      ],
    },
  },
  'cc-concurrency-utilities': {
    oneLiner: 'Use ready-made tools to pass work, wait for events and limit access, instead of `wait` and `notify`.',
    story:
      'Picture a toy factory. Makers put toys on a conveyor belt and packers take them off; if the belt is full, makers pause, and if it is empty, packers pause. The truck may only leave after three inspectors each sign off, counting down to zero. The loading dock has just two bays, so only two trucks load at once. In Java, the belt is a `BlockingQueue`, the inspector countdown is a `CountDownLatch`, and the two bays are a `Semaphore` with two permits. A team that must meet again and again at a checkpoint, like hikers regrouping, is a `CyclicBarrier`.',
    keyPoints: [
      '`BlockingQueue` passes work between producers and consumers and slows producers when full.',
      '`CountDownLatch` waits once for N events; `CyclicBarrier` lets threads meet repeatedly.',
      '`Semaphore` limits how many threads use a resource; `ConcurrentHashMap` offers atomic `merge` and `compute`.',
    ],
    types: [
      {
        title: 'Synchronizers',
        items: [
          { name: '`CountDownLatch`', simple: 'A gate that opens once after N things have happened, like a race that starts when every runner is ready.' },
          { name: '`CyclicBarrier`', simple: 'A group meeting point: everyone waits until all have arrived, then they all continue, round after round.' },
          { name: '`Phaser`', simple: 'A barrier where people can join or leave the group between rounds.' },
          { name: '`Semaphore`', simple: 'A fixed number of passes, like a ride with three seats: at most three threads inside at once.' },
        ],
      },
      {
        title: 'BlockingQueue implementations',
        items: [
          { name: '`ArrayBlockingQueue`', simple: 'A conveyor belt with a fixed number of spaces; the usual choice for a bounded pipeline.' },
          { name: '`LinkedBlockingQueue`', simple: 'A belt that grows as needed, with no practical limit unless you give it a size.' },
          { name: '`SynchronousQueue`', simple: 'No belt at all: each item is handed directly from one person to another.' },
          { name: '`PriorityBlockingQueue`', simple: 'The most important item is always taken first, like a hospital waiting room.' },
        ],
      },
      {
        title: 'Concurrent collections',
        items: [
          { name: '`ConcurrentHashMap`', simple: 'A map many threads can read and update at once, with safe all-in-one updates like `merge`.' },
          { name: '`CopyOnWriteArrayList`', simple: 'Makes a fresh copy on every change, so readers never wait. Best for small lists that rarely change.' },
          { name: '`ConcurrentSkipListMap`', simple: 'A thread-safe map that keeps its keys sorted.' },
          { name: '`ConcurrentLinkedQueue`', simple: 'A thread-safe queue that never blocks: taking from an empty one just returns null.' },
        ],
      },
    ],
    confusion: {
      mixedUpWith: '`CountDownLatch` and `CyclicBarrier`',
      difference: 'A latch counts down once and cannot be reset. A barrier makes a fixed group wait for each other, then resets for the next round.',
    },
    tryIt: 'Make a `CountDownLatch(3)`, start three threads that sleep a moment and call `countDown()`, and have `main` call `await()` and then print "all done".',
    recall: [
      { question: 'What happens when a producer puts into a full bounded `BlockingQueue`?', answer: 'With `put`, the producer blocks until a consumer takes something out.' },
      { question: 'Which tool limits a resource to N users at a time?', answer: 'A `Semaphore` with N permits.' },
      { question: 'Can a `CountDownLatch` be reused after reaching zero?', answer: 'No, it is single-use; use a `CyclicBarrier` or `Phaser` for repeated rounds.' },
    ],
    picture: {
      title: 'Belt, countdown and loading bays',
      caption: 'The belt (`BlockingQueue`) carries toys from makers to packers. The truck waits for the countdown (latch), and only two bays (permits) can load at once.',
      items: [
        { icon: 'factory', label: 'Producer', x: 13, y: 12, size: 0.8, tone: 'primary' },
        { icon: 'conveyor', label: 'BlockingQueue', x: 50, y: 12, size: 0.8, tone: 'accent' },
        { icon: 'person', label: 'Consumer', x: 87, y: 12, size: 0.8, tone: 'success' },
        { icon: 'hourglass', label: 'Latch: wait 3', x: 25, y: 44, size: 0.8, tone: 'warning' },
        { icon: 'truck', label: 'Semaphore: 2', x: 75, y: 44, size: 0.8, tone: 'neutral' },
      ],
      arrows: [
        { from: 0, to: 1 },
        { from: 1, to: 2 },
      ],
    },
  },
};
