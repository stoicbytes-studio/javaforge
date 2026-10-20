import type { MemoryAid } from '@/types/curriculum';

/** "Make it stick" memory aids for the fork/join and CompletableFuture lessons, keyed by lesson id. */
export const asyncParallelMemory: Record<string, MemoryAid> = {
  'cc-forkjoin-parallel': {
    oneLiner: 'Split a big job into small pieces, let every core work on them, then join the answers.',
    story:
      'Imagine counting a mountain of election ballots. The head counter splits the pile in half and passes one half on; each helper keeps splitting until their pile is small enough to count quickly. Helpers who finish early grab piles from busy helpers, so nobody sits idle. Finally the counts are added together. In Java, the mountain is the input, splitting is `fork()`, adding is `join()`, the helpers are worker threads in a `ForkJoinPool`, and grabbing piles is work stealing. A parallel stream does the same splitting for you on the shared common pool.',
    keyPoints: [
      'Fork/join (Java 7) splits work until pieces are small, then combines the results.',
      'Idle workers steal tasks from busy ones, so all cores stay busy.',
      'Parallel streams help only for large, CPU-heavy, easily split work with no shared state.',
    ],
    types: [
      {
        title: 'Types of fork/join task',
        items: [
          { name: '`RecursiveTask<V>`', simple: 'Splits the job and gives back an answer, like friends each counting part of a jar of coins and adding up.' },
          { name: '`RecursiveAction`', simple: 'Splits the job but returns nothing, like painters each painting their own section of a fence.' },
          { name: '`CountedCompleter<T>`', simple: 'An advanced task that finishes itself when all its pieces report back, so no thread has to wait.' },
        ],
      },
      {
        title: 'Parallel-stream sources',
        items: [
          { name: 'Arrays and number ranges', simple: 'Easy to cut exactly in half, like a chocolate bar with clear lines. The best case.' },
          { name: '`ArrayList`', simple: 'Also splits well by position, though boxed numbers add some cost.' },
          { name: '`HashSet` and `HashMap`', simple: 'Split by buckets, so pieces can be uneven in size.' },
          { name: '`LinkedList`', simple: 'Must be walked link by link to split, like a paper chain, so speed-ups are small or negative.' },
          { name: '`Stream.iterate`', simple: 'Each value depends on the one before, so it cannot be shared out at all.' },
        ],
      },
    ],
    confusion: {
      mixedUpWith: 'making any slow job faster with `.parallel()`',
      difference: 'Parallel streams split CPU work across cores. They do not help with waiting on I/O, and small inputs often get slower.',
    },
    tryIt: 'Sum `LongStream.rangeClosed(1, 50_000_000)` once with `sum()` and once with `.parallel().sum()`, timing each with `System.nanoTime()`. Then try it with 1,000 numbers.',
    recall: [
      { question: 'What is work stealing?', answer: 'Idle worker threads take waiting tasks from busy workers\' queues.' },
      { question: 'Which pool do parallel streams use by default?', answer: 'The shared `ForkJoinPool` common pool.' },
      { question: 'Why must a parallel reduction be associative?', answer: 'Pieces are combined in groups in any order, so grouping must not change the answer.' },
    ],
    picture: {
      title: 'Split the pile, add the counts',
      caption: 'The big pile (input) is split (fork) into halves for different helpers (threads), and their counts are added together (join).',
      items: [
        { icon: 'boxes', label: 'Big pile', x: 13, y: 28, size: 0.8, tone: 'neutral' },
        { icon: 'box', label: 'Half A', x: 50, y: 10, size: 0.8, tone: 'primary' },
        { icon: 'box', label: 'Half B', x: 50, y: 46, size: 0.8, tone: 'primary' },
        { icon: 'calculator', label: 'Total', x: 87, y: 28, size: 0.8, tone: 'success' },
      ],
      arrows: [
        { from: 0, to: 1, label: 'fork' },
        { from: 0, to: 2 },
        { from: 1, to: 3, label: 'join' },
        { from: 2, to: 3 },
      ],
    },
  },
  'cc-completablefuture': {
    oneLiner: 'A `CompletableFuture` lets you say what happens next when a result arrives, without waiting for it.',
    story:
      'Think of ordering a parcel online. You do not wait at the door. Instead you leave instructions: when it arrives, unpack it; then send the contents on to a friend; when both parcels are here, put them together; if it gets lost, ask for a refund. In Java, the order is `supplyAsync`, the parcel is a `CompletableFuture`, unpacking is `thenApply`, sending on (another async step) is `thenCompose`, putting two together is `thenCombine`, and the refund is `exceptionally`. Waiting at the door is calling `join()` or `get()`, which blocks.',
    keyPoints: [
      '`thenApply` transforms a result; `thenCompose` chains another async step without nesting futures.',
      '`thenCombine` and `allOf` join independent results; `exceptionally` and `handle` deal with failures.',
      'Async methods use the common pool by default, so give slow I/O work its own executor.',
    ],
    types: [
      {
        title: 'Composition methods',
        items: [
          { name: '`thenApply`', simple: 'Change the result when it arrives, like adding sauce to a dish as soon as it is cooked.' },
          { name: '`thenCompose`', simple: 'Start another background job that needs the first result, then wait for that one instead.' },
          { name: '`thenCombine`', simple: 'Wait for two independent jobs and put both results together, like food and drinks on one tray.' },
          { name: '`thenAccept` / `thenRun`', simple: 'Use the result, or just do something, without producing a new value.' },
          { name: '`allOf`', simple: 'Wait until every job in a group is done.' },
          { name: '`anyOf`', simple: 'Take whichever job finishes first, like taking the first taxi that arrives.' },
        ],
      },
      {
        title: 'Error-handling and timeout methods',
        items: [
          { name: '`exceptionally`', simple: 'Runs only when something failed and supplies a replacement value, like a backup meal.' },
          { name: '`handle`', simple: 'Always runs and sees either the value or the error, and decides the final result.' },
          { name: '`whenComplete`', simple: 'Always runs to watch or log what happened, but cannot change the outcome.' },
          { name: '`orTimeout`', simple: 'Gives up with an error if the job takes too long. The job itself keeps running.' },
          { name: '`completeOnTimeout`', simple: 'If the job is too slow, finish with a default value instead.' },
        ],
      },
      {
        title: 'Ways to create one',
        items: [
          { name: '`supplyAsync`', simple: 'Start a background job that returns a value.' },
          { name: '`runAsync`', simple: 'Start a background job that returns nothing.' },
          { name: '`completedFuture`', simple: 'A future that is already done, holding a ready answer.' },
          { name: '`new CompletableFuture<>()`', simple: 'An empty promise that you fill in later yourself with `complete(...)`.' },
        ],
      },
    ],
    confusion: {
      mixedUpWith: '`thenApply` and `thenCompose`',
      difference: 'Use `thenApply` when your function returns a plain value. Use `thenCompose` when it returns another `CompletableFuture`, to avoid a nested future.',
    },
    tryIt: 'Write `CompletableFuture.supplyAsync(() -> 21).thenApply(x -> x * 2).thenAccept(System.out::println).join();` then make the supplier throw and add `exceptionally(e -> -1)` before printing.',
    recall: [
      { question: 'Which method chains a step that itself returns a `CompletableFuture`?', answer: '`thenCompose`, which flattens the result instead of nesting futures.' },
      { question: 'Where do `supplyAsync` tasks run if you pass no executor?', answer: 'On the shared `ForkJoinPool` common pool.' },
      { question: 'How do you recover from a failed stage?', answer: 'With `exceptionally` or `handle`, which can return a fallback value.' },
    ],
    picture: {
      title: 'Leave instructions, do not wait',
      caption: 'The order (`supplyAsync`) starts the work, each instruction (`thenApply`, `thenCombine`) runs when the parcel arrives, and the refund note (`exceptionally`) handles a lost parcel.',
      items: [
        { icon: 'phone', label: 'supplyAsync', x: 13, y: 12, size: 0.8, tone: 'primary' },
        { icon: 'truck', label: 'thenApply', x: 50, y: 12, size: 0.8, tone: 'accent' },
        { icon: 'gift', label: 'thenCombine', x: 86, y: 12, size: 0.8, tone: 'success' },
        { icon: 'warning', label: 'exceptionally', x: 50, y: 48, size: 0.8, tone: 'warning' },
      ],
      arrows: [
        { from: 0, to: 1 },
        { from: 1, to: 2 },
        { from: 1, to: 3, label: 'fails', dashed: true },
      ],
    },
  },
};
