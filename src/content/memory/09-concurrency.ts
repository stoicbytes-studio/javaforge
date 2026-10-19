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
