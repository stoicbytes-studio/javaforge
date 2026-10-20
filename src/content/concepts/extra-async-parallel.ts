import type { LessonConcepts } from '@/types/curriculum';

/** Concept pages for the extra concurrency lessons (fork/join + parallel streams, CompletableFuture). */
export const asyncParallelConcepts: Record<string, LessonConcepts> = {
  'cc-forkjoin-parallel': {
    textbook: {
      definition:
        'The **fork/join framework**, introduced in Java 7, is an `ExecutorService` implementation designed for **divide-and-conquer** parallelism: a task recursively splits into subtasks until they are small enough to compute directly, **forks** subtasks for asynchronous execution and **joins** their results. Tasks are instances of `ForkJoinTask`, executed by a `ForkJoinPool` whose worker threads balance load by **work stealing**. A **parallel stream** is a stream pipeline whose operations execute on the common fork/join pool, partitioning its source with a `Spliterator` and combining partial results; it yields correct results only for non-interfering, stateless operations and associative reductions.',
      terms: [
        { term: 'Fork', meaning: 'Arranging for a subtask to execute asynchronously by pushing it onto the current worker\'s deque, from which it can be run or stolen.' },
        { term: 'Join', meaning: 'Obtaining the result of a forked subtask when it completes; a joining worker runs or helps with other tasks instead of idling.' },
        { term: 'Work stealing', meaning: 'A scheduling scheme in which each worker has its own deque and an idle worker takes the oldest task from another worker\'s deque.' },
        { term: 'Common pool', meaning: 'The JVM-wide static `ForkJoinPool` used by parallel streams and by asynchronous tasks not given an explicit executor.' },
        { term: 'Spliterator', meaning: 'An object that traverses and partitions the elements of a source, reporting characteristics such as SIZED and ORDERED.' },
        { term: 'Associative operation', meaning: 'A combining operation for which (a op b) op c equals a op (b op c), so results do not depend on how the input is split.' },
      ],
      source: 'Javadoc for java.util.concurrent.ForkJoinPool, ForkJoinTask and the java.util.stream package; Doug Lea, "A Java Fork/Join Framework" (2000)',
    },
    interviewDefinition:
      'The **fork/join framework** (Java 7) runs divide-and-conquer work: a task splits until pieces are below a threshold, `fork()`s one half, computes the other and `join()`s the results. A `ForkJoinPool` gives each worker its own deque and lets idle workers **steal** the oldest tasks from busy ones, keeping every core busy cheaply. **Parallel streams** (Java 8) run on the shared **common pool** by splitting the source with a `Spliterator`; they pay off only for large, splittable, CPU-bound, stateless work with associative reductions.',
    interviewFollowUps: [
      {
        question: 'Why is it a bad idea to make HTTP calls inside a parallel stream?',
        answer: 'Parallel streams use the JVM-wide common pool, which has about one worker per core. Blocked workers cannot do anything else, so every other parallel stream and every `CompletableFuture.supplyAsync` without an executor in the JVM slows down. Use a dedicated executor or virtual threads for I/O.',
      },
      {
        question: 'How is the common pool sized, and can you change it?',
        answer: 'By default `availableProcessors() - 1` workers; the thread that starts a parallel stream also helps. Set `-Djava.util.concurrent.ForkJoinPool.common.parallelism=N` to change it — but that affects the whole JVM, so a dedicated `ForkJoinPool` is usually the better isolation tool.',
      },
      {
        question: 'Why must the operator passed to reduce be associative?',
        answer: 'In parallel, each chunk is reduced separately from the identity and the partial results are combined in a tree whose shape depends on the split. Only an associative operator with a true identity gives the same answer for every split — subtraction or `reduce(10, Integer::sum)` do not.',
      },
      {
        question: 'Does `join()` in a fork/join task block the worker thread?',
        answer: 'Not in the simple sense. A joining worker first tries to run the awaited task itself if it is still in its deque, and otherwise helps by running or stealing other tasks, so workers rarely sit idle. That is why blocking I/O, not `join()`, is what starves a ForkJoinPool.',
      },
    ],
    mnemonic: {
      device: 'SPLIT before you go parallel',
      expansion: [
        { key: 'S', meaning: 'Size — enough elements, or expensive enough per element, to beat the split-and-merge overhead' },
        { key: 'P', meaning: 'Pure — stateless, non-interfering lambdas; no shared mutable state' },
        { key: 'L', meaning: 'Load on the CPU — computation, not waiting on I/O or locks' },
        { key: 'I', meaning: 'Identity and associativity — reduce(identity, op) must not depend on how data is split' },
        { key: 'T', meaning: 'Tidy source — arrays, ArrayList and ranges split cleanly; LinkedList and iterate do not' },
      ],
      visual: 'An axe splitting a log: a big, straight-grained log (large array) splits beautifully into equal pieces for many workers; a knotted twig (a 20-element LinkedList) just wastes the swing.',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'Marking exam papers with a stealing team',
        body: 'A teacher with 1,000 papers hands half to a colleague and keeps splitting her own pile until it is small enough to mark. Each marker keeps a stack: they always take the paper on top (the one just added). A colleague who finishes early walks over and takes from the *bottom* of a busy marker\'s stack — the oldest, biggest bundle — so one walk moves a lot of work and they never reach for the same paper.',
      },
      {
        kind: 'insight',
        title: 'Parallelism changes cost, not complexity',
        body: 'Splitting 1,000,000 additions over 8 cores can at best divide the time by 8, and you pay for splitting, task objects, merging and cache traffic. If the sequential loop takes 2 ms, the parallel one may take 3. That is why "large and CPU-heavy" is the first condition: the overhead is fixed per task, so only enough work per leaf amortises it.',
      },
      {
        kind: 'real-world',
        title: 'Where the JDK itself uses fork/join',
        body: '`Arrays.parallelSort` splits arrays and merges sorted runs on the common pool; parallel streams are built on `CountedCompleter` tasks; and CompletableFuture\'s `*Async` methods use the same common pool by default. One misbehaving blocking task can therefore affect sorting, streams and async code everywhere in the service.',
      },
      {
        kind: 'angle',
        title: 'Ordering is a hidden synchronisation cost',
        body: '`findFirst()`, `limit(n)` and `forEachOrdered` on an ordered source force the stream to remember which chunk came first and buffer results until earlier chunks finish. When order truly does not matter, `findAny()` or `.unordered()` lets each chunk stop independently — sometimes the difference between a speed-up and a slow-down.',
      },
      {
        kind: 'insight',
        title: 'Deterministic results from non-deterministic scheduling',
        body: 'Which worker runs which piece changes from run to run, yet a correct fork/join program always prints the same answer: the split tree is decided by your code (or the Spliterator), each leaf owns its data, and results are combined along the tree. If output varies between runs, you have shared state or a non-associative combine.',
      },
    ],
    diagrams: [
      {
        id: 'cc-forkjoin-parallel-tree',
        kind: 'concept',
        title: 'Divide, conquer, combine',
        caption: 'The root task splits until each slice is below the threshold. One half is forked (stealable), the other computed in place; join() combines results back up the same tree, so the answer never depends on scheduling.',
        explanation: [
          'The root task **sum [0, 1M)** is too big to compute directly, so it splits its range into two halves.',
          'The left half **[0, 500k)** is forked: pushed onto the worker\'s deque, where an idle worker may steal it. The right half **[500k, 1M)** is computed in place by the same thread.',
          'Each half splits again, giving four leaves: **[0, 250k)**, **[250k, 500k)**, **[500k, 750k)** and **[750k, 1M)**. They are below the threshold, so each runs a plain loop.',
          'The partial sums flow into **join() + combine**, which adds them back up along the same tree to produce 500000500000.',
          'Takeaway: the split tree is fixed by the code, not by scheduling, so the result is the same on every run whichever worker runs each piece.',
        ],
        cols: 4,
        rows: 4,
        nodes: [
          { id: 'root', label: 'sum [0, 1M)', detail: 'too big: split in half', col: 1, row: 0, span: 2, tone: 'primary' },
          { id: 'l', label: '[0, 500k)', detail: 'fork(): pushed, stealable', col: 0, row: 1, span: 2, tone: 'accent' },
          { id: 'r', label: '[500k, 1M)', detail: 'compute(): done in place', col: 2, row: 1, span: 2, tone: 'accent' },
          { id: 'l1', label: '[0, 250k)', detail: 'leaf: plain loop', col: 0, row: 2, tone: 'neutral' },
          { id: 'l2', label: '[250k, 500k)', detail: 'leaf: plain loop', col: 1, row: 2, tone: 'neutral' },
          { id: 'r1', label: '[500k, 750k)', detail: 'leaf: plain loop', col: 2, row: 2, tone: 'neutral' },
          { id: 'r2', label: '[750k, 1M)', detail: 'leaf: plain loop', col: 3, row: 2, tone: 'neutral' },
          { id: 'res', label: 'join() + combine', detail: '500000500000 on every run', col: 1, row: 3, span: 2, shape: 'pill', tone: 'success' },
        ],
        edges: [
          { from: 'root', to: 'l', label: 'fork' },
          { from: 'root', to: 'r', label: 'compute' },
          { from: 'l', to: 'l1' },
          { from: 'l', to: 'l2' },
          { from: 'r', to: 'r1' },
          { from: 'r', to: 'r2' },
          { from: 'l1', to: 'res', label: 'partial sum' },
          { from: 'l2', to: 'res' },
          { from: 'r1', to: 'res' },
          { from: 'r2', to: 'res', label: 'partial sum' },
        ],
      },
      {
        id: 'cc-forkjoin-parallel-stealing',
        kind: 'architecture',
        title: 'Work stealing inside a ForkJoinPool',
        caption: 'Each worker pushes and pops its own deque at the newest end (LIFO). An idle worker steals from the oldest end of another deque (FIFO), taking the biggest remaining piece with little contention.',
        explanation: [
          'At the top, **invoke(root task)**, or a parallel stream terminal operation, hands the root task to **Worker 1** inside the pool, where every worker owns one deque.',
          'Worker 1 forks subtasks onto **Deque 1** and pushes and pops at the newest end (LIFO), so it works on small, cache-warm pieces without contention.',
          '**Worker 3** does the same with **Deque 3**, busy with its own work and pushing and popping at its newest end.',
          '**Worker 2** finds nothing to pop in **Deque 2**, which is empty. Instead of idling it follows the dashed arrow and steals the oldest task, T1, from Deque 1.',
          'Stealing from the oldest end means the thief takes the biggest remaining piece and rarely collides with the owner working at the other end.',
          'Takeaway: work stealing keeps every core busy with very little coordination, which is why fork/join suits fine-grained recursive work.',
        ],
        cols: 3,
        rows: 3,
        nodes: [
          { id: 'sub', label: 'invoke(root task)', detail: 'or a parallel stream terminal op', col: 0, row: 0, span: 3, shape: 'pill', tone: 'primary' },
          { id: 'w1', label: 'Worker 1', detail: 'busy: forks subtasks', col: 0, row: 1, tone: 'primary' },
          { id: 'w2', label: 'Worker 2', detail: 'own deque empty', col: 1, row: 1, tone: 'warning' },
          { id: 'w3', label: 'Worker 3', detail: 'busy on its own work', col: 2, row: 1, tone: 'primary' },
          { id: 'd1', label: 'Deque 1', detail: 'oldest T1 ... newest T4', col: 0, row: 2, shape: 'cylinder', tone: 'accent' },
          { id: 'd2', label: 'Deque 2', detail: 'empty', col: 1, row: 2, shape: 'cylinder', tone: 'neutral' },
          { id: 'd3', label: 'Deque 3', detail: 'T7 ... T9', col: 2, row: 2, shape: 'cylinder', tone: 'accent' },
        ],
        edges: [
          { from: 'sub', to: 'w1', label: 'root task' },
          { from: 'w1', to: 'd1', label: 'push/pop newest', both: true },
          { from: 'w2', to: 'd1', label: 'steal oldest (T1)', dashed: true },
          { from: 'w3', to: 'd3', label: 'push/pop newest', both: true },
          { from: 'w2', to: 'd2', label: 'nothing to pop', dashed: true },
        ],
        groups: [{ label: 'ForkJoinPool (one deque per worker)', fromCol: 0, toCol: 2, fromRow: 1, toRow: 2, tone: 'primary' }],
      },
      {
        id: 'cc-forkjoin-parallel-decision',
        kind: 'flow',
        title: 'Should this stream be parallel?',
        caption: 'Every "no" has a better answer than .parallel(). Only when all four questions are "yes" is a parallel stream worth trying — and then measure it.',
        explanation: [
          'First ask **Large or costly?** If the number of elements times the cost per element is small, **Stay sequential**, because splitting and merging overhead would dominate.',
          'Next, **Splittable source?** Arrays, ArrayList and ranges split cleanly. For a LinkedList or an iterator-backed source, **Copy to an array first** or stay sequential.',
          'Then **CPU-bound?** Work that waits on I/O or locks blocks the shared common-pool workers, so use an **Own executor** or virtual threads instead.',
          'Then **Stateless, associative?** Shared mutation or a non-associative reduce gives wrong answers in parallel, so **Fix the pipeline** with collectors and a true identity.',
          'Only when every answer is yes do you reach **Try .parallel()**, and even then you measure the result with JMH.',
          'Takeaway: each no has a better answer than a parallel stream, which is worth trying only in the narrow case where all four conditions hold.',
        ],
        cols: 2,
        rows: 5,
        nodes: [
          { id: 'q1', label: 'Large or costly?', detail: 'N x cost per element', col: 0, row: 0, tone: 'primary' },
          { id: 'q2', label: 'Splittable source?', detail: 'array, ArrayList, range', col: 0, row: 1, tone: 'primary' },
          { id: 'q3', label: 'CPU-bound?', detail: 'no I/O, no locks', col: 0, row: 2, tone: 'primary' },
          { id: 'q4', label: 'Stateless, associative?', detail: 'no shared mutation', col: 0, row: 3, tone: 'primary' },
          { id: 'go', label: 'Try .parallel()', detail: 'and measure with JMH', col: 0, row: 4, shape: 'pill', tone: 'success' },
          { id: 'n1', label: 'Stay sequential', detail: 'overhead would dominate', col: 1, row: 0, shape: 'pill', tone: 'neutral' },
          { id: 'n2', label: 'Copy to an array first', detail: 'or stay sequential', col: 1, row: 1, shape: 'pill', tone: 'warning' },
          { id: 'n3', label: 'Own executor', detail: 'or virtual threads for I/O', col: 1, row: 2, shape: 'pill', tone: 'warning' },
          { id: 'n4', label: 'Fix the pipeline', detail: 'collectors, true identity', col: 1, row: 3, shape: 'pill', tone: 'danger' },
        ],
        edges: [
          { from: 'q1', to: 'q2', label: 'yes' },
          { from: 'q2', to: 'q3', label: 'yes' },
          { from: 'q3', to: 'q4', label: 'yes' },
          { from: 'q4', to: 'go', label: 'yes' },
          { from: 'q1', to: 'n1', label: 'no' },
          { from: 'q2', to: 'n2', label: 'no' },
          { from: 'q3', to: 'n3', label: 'no' },
          { from: 'q4', to: 'n4', label: 'no' },
        ],
      },
    ],
    variants: [
      {
        title: 'Types of fork/join task',
        intro: 'All are subclasses of `ForkJoinTask<V>`; you implement `compute()` and the pool schedules the pieces.',
        items: [
          {
            name: 'RecursiveTask<V>',
            summary: 'Returns a result from compute(); combine child results after join(). Sums, maxima, counts, merge results.',
            support: 'supported',
            note: 'Java 7',
            code: 'left.fork();\nlong r = right.compute();\nreturn left.join() + r;',
          },
          {
            name: 'RecursiveAction',
            summary: 'Returns nothing; usually works in place on disjoint slices of a shared array (scale, fill, sort).',
            support: 'supported',
            note: 'Java 7',
            code: 'invokeAll(new Scale(a, lo, mid), new Scale(a, mid, hi));',
          },
          {
            name: 'CountedCompleter<T>',
            summary: 'Keeps a pending-children count and runs onCompletion when it reaches zero, so no thread waits in join(). Harder to write; used internally by parallel streams.',
            support: 'supported',
            note: 'Java 8',
          },
          {
            name: 'Adapted Runnable / Callable',
            summary: 'ForkJoinTask.adapt(...) or pool.submit(callable) wraps ordinary tasks. They run on the pool but do not split themselves, so they gain nothing from work stealing.',
            support: 'partial',
          },
        ],
      },
      {
        title: 'Parallel-stream sources: good vs bad',
        intro: 'Here "support" means how well the source splits for parallel execution.',
        items: [
          {
            name: 'Arrays, IntStream.range / rangeClosed',
            summary: 'SIZED and SUBSIZED: split in O(1) into exact halves, no boxing with primitive streams. The best case.',
            support: 'supported',
            code: 'LongStream.rangeClosed(1, n).parallel().sum()',
          },
          {
            name: 'ArrayList, List.of',
            summary: 'Index-based Spliterator splits by halving the index range; good parallel behaviour (watch out for boxing).',
            support: 'supported',
          },
          {
            name: 'HashSet, HashMap views, TreeSet',
            summary: 'Split by bucket ranges or subtrees; sizes are estimates, so pieces can be uneven.',
            support: 'partial',
          },
          {
            name: 'Files.lines',
            summary: 'Since Java 9 it can split a memory-mapped file for UTF-8, US-ASCII and ISO-8859-1 — but the work is I/O-bound unless each line is expensive to process.',
            support: 'partial',
          },
          {
            name: 'LinkedList, BufferedReader.lines, iterator-backed sources',
            summary: 'Must walk elements to split; the stream copies batches into arrays, so speed-ups are small or negative.',
            support: 'not-supported',
          },
          {
            name: 'Stream.iterate, Stream.generate + limit',
            summary: 'Each element depends on the previous one (or the size is unknown), so the source is inherently sequential.',
            support: 'not-supported',
          },
        ],
      },
    ],
    deepDive: [
      {
        title: 'Why work stealing scales where a shared queue does not',
        body: 'A classic thread pool has one queue that every worker locks to take a task. Fine-grained recursive work creates thousands of tiny tasks, so that queue becomes the bottleneck. Fork/join gives each worker its own deque: the owner pushes and pops at the top without contention, and thieves take from the bottom with a single atomic operation. Because recursive tasks are pushed in decreasing size, the bottom holds the largest pieces, so steals are rare and each one transfers a lot of work. Doug Lea\'s design paper describes the scheme, derived from the Cilk work-stealing scheduler.',
        sources: [
          { label: 'Doug Lea, "A Java Fork/Join Framework" (ACM Java Grande, 2000)' },
          { label: 'ForkJoinPool API (Java 21)', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/ForkJoinPool.html' },
        ],
      },
      {
        title: 'The common pool, blocking and managedBlock',
        body: 'The common pool is created lazily with parallelism `availableProcessors() - 1` (settable with system properties), and its threads are daemon threads, so it never keeps the JVM alive. A worker blocked on a socket simply disappears from the pool\'s capacity. `ForkJoinPool.managedBlock(ManagedBlocker)` tells the pool a worker is about to block so it can activate a spare thread, which is how some JDK classes cooperate with fork/join. A well-known trick runs a parallel stream inside `customPool.submit(() -> list.parallelStream()...)` so that its tasks use the custom pool; it works because tasks fork into the pool of the current worker, but it is an implementation behaviour, not a documented guarantee.',
        sources: [
          { label: 'ForkJoinPool API: common pool and managedBlock', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/ForkJoinPool.html' },
          { label: 'Effective Java, 3rd edition — Item 48: Use caution when making streams parallel' },
        ],
      },
      {
        title: 'Spliterator characteristics drive parallel performance',
        body: 'A parallel stream is only as good as its Spliterator. `SIZED | SUBSIZED` lets operations like `toArray` and `toList` pre-allocate and write each chunk into its exact slot; `ORDERED` forces order-sensitive operations to coordinate between chunks; `CONCURRENT` or `IMMUTABLE` promise the source will not throw `ConcurrentModificationException`. Without `SIZED`, the stream batches elements into arrays of growing size to create splittable work, which is why iterator-based sources parallelise poorly. The package documentation also spells out the rules for **non-interference**, **statelessness** and **associativity** that every parallel pipeline must obey.',
        sources: [
          { label: 'Spliterator API (Java 21)', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Spliterator.html' },
          { label: 'java.util.stream package summary: Parallelism, Non-interference, Associativity', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/stream/package-summary.html' },
        ],
      },
    ],
  },
  'cc-completablefuture': {
    textbook: {
      definition:
        '`CompletableFuture<T>` is a class in `java.util.concurrent`, introduced in Java 8, that implements both the `Future` and **CompletionStage** interfaces. It represents the result of an asynchronous computation that may be **explicitly completed**, by setting its value or an exception, and it supports dependent functions and actions triggered upon its completion. Each **dependent stage** performs its action when the stage or stages it depends on complete, and itself returns a new stage, so computations form a dependency graph. If an upstream computation fails, dependent stages **complete exceptionally**, typically with a `CompletionException`. Asynchronous methods without an explicit executor use a **default executor**, normally the common pool.',
      terms: [
        { term: 'CompletionStage', meaning: 'An interface for a stage of a possibly asynchronous computation that performs an action or computes a value when another stage completes.' },
        { term: 'Explicit completion', meaning: 'Setting the outcome directly with `complete(value)` or `completeExceptionally(ex)`; only the first completion takes effect.' },
        { term: 'Dependent stage', meaning: 'A stage created by a method such as `thenApply` or `thenCombine` that runs when its source stages have completed.' },
        { term: 'Exceptional completion', meaning: 'Completion with an exception instead of a value; dependent stages then skip their functions and complete exceptionally as well.' },
        { term: 'Default executor', meaning: 'The executor used by `...Async` methods called without one: `ForkJoinPool.commonPool()`, unless its parallelism is below 2.' },
      ],
      source: 'Javadoc for java.util.concurrent.CompletableFuture and CompletionStage; JEP 266',
    },
    interviewDefinition:
      '`CompletableFuture<T>` (Java 8) is a composable promise: a `Future` you can complete yourself and chain with non-blocking stages — `thenApply` to map, `thenCompose` to flatten another async step, `thenCombine`/`allOf`/`anyOf` to join independent results, and `exceptionally`/`handle`/`whenComplete` for failures, which usually arrive wrapped in `CompletionException`. Async methods default to the shared common pool, so I/O work must get its own executor. Java 9 added `orTimeout` and `completeOnTimeout`.',
    interviewFollowUps: [
      {
        question: 'What is the difference between thenApply and thenCompose?',
        answer: '`thenApply` maps the value with an ordinary function (like `map`). `thenCompose` takes a function that returns another `CompletionStage` and flattens it (like `flatMap`); using `thenApply` there yields a `CompletableFuture<CompletableFuture<T>>`.',
      },
      {
        question: 'On which thread does a thenApply callback run?',
        answer: 'On the thread that completes the previous stage, or immediately on the calling thread if that stage is already complete. Only the `*Async` variants guarantee hand-off to an executor (the common pool unless you pass one). That is why slow callbacks should use `thenApplyAsync(fn, executor)`.',
      },
      {
        question: 'Why do exception handlers often see CompletionException instead of my exception?',
        answer: 'A throwing supplier, or a failure passing through a dependent stage, is wrapped in `CompletionException` with the original as its cause. `join()` throws it too, while `get()` throws `ExecutionException`. Handlers should unwrap `getCause()` before inspecting the type.',
      },
      {
        question: 'With virtual threads in Java 21, do we still need CompletableFuture?',
        answer: 'Less often. Plain blocking calls on virtual threads scale for I/O and are easier to read and debug. CompletableFuture still fits APIs that return futures (such as `HttpClient.sendAsync`) and declarative fan-out with timeouts. Structured concurrency, which adds automatic cancellation, is still a preview API.',
      },
    ],
    mnemonic: {
      device: '"Map it, flat it, zip it — catch it, clock it, pool it"',
      expansion: [
        { key: 'Map it', meaning: 'thenApply — transform the value' },
        { key: 'Flat it', meaning: 'thenCompose — next step is async; flatten the nested future' },
        { key: 'Zip it', meaning: 'thenCombine / allOf / anyOf — join independent results' },
        { key: 'Catch it', meaning: 'exceptionally / handle (recover), whenComplete (observe); unwrap CompletionException' },
        { key: 'Clock it', meaning: 'orTimeout / completeOnTimeout (Java 9) — never wait forever' },
        { key: 'Pool it', meaning: 'pass your own executor for I/O; the default is the shared common pool' },
      ],
      visual: 'A restaurant pass: each plate (stage) is finished the moment its ingredients arrive, two plates are zipped onto one tray, a burnt dish is caught and replaced, a kitchen timer rings if an order takes too long — and the cooks come from your own kitchen, not the shared food court.',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'A buzzer with instructions attached',
        body: 'A plain `Future` is a restaurant buzzer you can only use by staring at it (`get()`). A `CompletableFuture` is a buzzer you can program: "when it buzzes, add sauce (thenApply); also wait for the drinks and put both on one tray (thenCombine); if the dish is burnt, bring a sandwich (exceptionally); if it takes over 10 minutes, give me the soup of the day (completeOnTimeout)."',
      },
      {
        kind: 'insight',
        title: 'A pipeline is a graph, not a sequence',
        body: 'Each `then…` call adds a node to a dependency graph and returns immediately. Work runs as inputs become available, possibly in parallel branches. The first `join()` or `get()` is where your thread actually waits — so join once, at the edge of the system (or return the future to your caller), never after every step.',
      },
      {
        kind: 'real-world',
        title: 'Fan-out to downstream services',
        body: 'A product page needs catalogue, price, stock and reviews. Sequentially the latency is the *sum* of the four calls; with `supplyAsync(…, ioExecutor)` and `allOf` it is roughly the *slowest* one. Optional parts get `completeOnTimeout(default, …)`, critical ones get `orTimeout` plus `exceptionally` with a cached fallback, and `whenComplete` records metrics.',
      },
      {
        kind: 'angle',
        title: 'Timeouts and cancellation stop the waiting, not the work',
        body: '`orTimeout` and `cancel(true)` complete the future exceptionally, but the supplier keeps running on its thread — CompletableFuture never interrupts it. Real cancellation needs cooperation: timeouts on the HTTP or JDBC client itself, or structured tasks that are interrupted when their scope closes.',
      },
      {
        kind: 'insight',
        title: 'Errors short-circuit like exceptions',
        body: 'A failed stage skips every following `thenApply`/`thenCompose`/`thenCombine` and travels to the first handler, just as an exception skips statements until a `catch`. `handle` is the `catch` that can return a value; `whenComplete` is the `finally` that observes but cannot change the outcome.',
      },
    ],
    diagrams: [
      {
        id: 'cc-completablefuture-graph',
        kind: 'concept',
        title: 'A CompletableFuture pipeline is a dependency graph',
        caption: 'Stages start as soon as their inputs complete: the greeting and the credit lookup run in parallel after the user loads, a failed credit lookup is replaced by a fallback, and the caller waits only once, at the end.',
        explanation: [
          '**loadUser** starts the pipeline with supplyAsync on an I/O executor. Its User result feeds two branches at the same time.',
          'The upper branch, **greeting**, is a thenApply: a plain function that maps the User to a String.',
          'The lower branch, **loadCredit**, is a thenCompose, because looking up credit is itself asynchronous. The two branches run in parallel.',
          'Whatever loadCredit produces, a value or an error, goes to **fallback**, an exceptionally stage that replaces a failure with 0.',
          '**report** is a thenCombine that zips the String and the Integer once both are ready, and **join()** is the only place where the caller waits.',
          'Takeaway: the pipeline is a graph that runs as its inputs arrive, and blocking happens once, at the very end.',
        ],
        cols: 4,
        rows: 3,
        nodes: [
          { id: 'user', label: 'loadUser', detail: 'supplyAsync(..., io)', col: 0, row: 1, tone: 'primary' },
          { id: 'greet', label: 'greeting', detail: 'thenApply (map)', col: 1, row: 0, tone: 'accent' },
          { id: 'credit', label: 'loadCredit', detail: 'thenCompose (async)', col: 1, row: 2, tone: 'accent' },
          { id: 'fb', label: 'fallback', detail: 'exceptionally(ex -> 0)', col: 2, row: 2, tone: 'warning' },
          { id: 'report', label: 'report', detail: 'thenCombine (zip)', col: 2, row: 1, tone: 'primary' },
          { id: 'join', label: 'join()', detail: 'the only wait', col: 3, row: 1, shape: 'pill', tone: 'success' },
        ],
        edges: [
          { from: 'user', to: 'greet', label: 'User' },
          { from: 'user', to: 'credit', label: 'User' },
          { from: 'credit', to: 'fb', label: 'value or error' },
          { from: 'greet', to: 'report', label: 'String' },
          { from: 'fb', to: 'report', label: 'Integer' },
          { from: 'report', to: 'join' },
        ],
      },
      {
        id: 'cc-completablefuture-failure',
        kind: 'flow',
        title: 'How a failure travels through stages',
        caption: 'The exception skips transformation stages and arrives wrapped in CompletionException. exceptionally or handle can turn it into a value; whenComplete only observes, so join() still throws.',
        explanation: [
          'The **supplyAsync** stage fails because its supplier throws an IllegalArgumentException.',
          'The next stage, **thenApply**, is skipped entirely, and the failure moves on wrapped in a CompletionException, just as an exception skips statements until a catch.',
          'On the top path a **Recover** stage, exceptionally or handle, turns the failure into a fallback value, so **join() returns** that value normally.',
          'On the dashed lower path the failure is only observed by **whenComplete**, which can log it but cannot change the outcome.',
          'Because the failure continues, **join() throws** a CompletionException with the original exception as its cause.',
          'Takeaway: only exceptionally and handle recover; whenComplete is like finally, and handlers should unwrap getCause() before inspecting the type.',
        ],
        cols: 4,
        rows: 2,
        nodes: [
          { id: 'src', label: 'supplyAsync', detail: 'supplier throws IAE', col: 0, row: 0, tone: 'danger' },
          { id: 'map', label: 'thenApply', detail: 'skipped', col: 1, row: 0, tone: 'neutral' },
          { id: 'rec', label: 'Recover', detail: 'exceptionally / handle', col: 2, row: 0, tone: 'warning' },
          { id: 'ok', label: 'join() returns', detail: 'the fallback value', col: 3, row: 0, shape: 'pill', tone: 'success' },
          { id: 'obs', label: 'whenComplete', detail: 'logs it; cannot recover', col: 2, row: 1, tone: 'neutral' },
          { id: 'boom', label: 'join() throws', detail: 'CompletionException(IAE)', col: 3, row: 1, shape: 'pill', tone: 'danger' },
        ],
        edges: [
          { from: 'src', to: 'map', label: 'fails' },
          { from: 'map', to: 'rec', label: 'CompletionException' },
          { from: 'rec', to: 'ok', label: 'recovered' },
          { from: 'map', to: 'obs', label: 'or only observed', dashed: true },
          { from: 'obs', to: 'boom', label: 'failure continues' },
        ],
      },
      {
        id: 'cc-completablefuture-threads',
        kind: 'architecture',
        title: 'Where stages run',
        caption: 'supplyAsync without an executor lands on the JVM-wide common pool, shared with parallel streams. Pass your own executor for I/O; non-async callbacks run on whichever thread completed the previous stage.',
        explanation: [
          'The **Caller thread** builds the pipeline and later calls join(); it does not run the asynchronous work itself.',
          '**supplyAsync(f, io)** names an executor, so it runs on **Your executor**, a bounded pool or virtual threads, where blocking I/O is fine.',
          '**supplyAsync(f)** gives no executor, so it lands on the **Common pool**: about cores minus one workers, shared by the whole JVM.',
          '**Parallel streams** compete for those same common-pool workers, so blocking I/O there slows down unrelated code across the service.',
          'A non-async **thenApply(fn)** callback has no executor of its own: it runs on whichever thread completed the previous stage, here a thread of your executor.',
          'Takeaway: the Thread pools group shows the choice that matters, so pass your own executor to any stage that blocks.',
        ],
        cols: 3,
        rows: 3,
        nodes: [
          { id: 'caller', label: 'Caller thread', detail: 'builds pipeline, join()', col: 0, row: 0, tone: 'primary' },
          { id: 'own', label: 'Your executor', detail: 'bounded pool or virtual threads', col: 1, row: 1, shape: 'cylinder', tone: 'success' },
          { id: 'common', label: 'Common pool', detail: 'about cores - 1, JVM-wide', col: 2, row: 1, shape: 'cylinder', tone: 'warning' },
          { id: 'io', label: 'supplyAsync(f, io)', detail: 'blocking I/O is fine', col: 1, row: 0, tone: 'accent' },
          { id: 'def', label: 'supplyAsync(f)', detail: 'no executor given', col: 2, row: 0, tone: 'danger' },
          { id: 'cb', label: 'thenApply(fn)', detail: 'runs on completing thread', col: 1, row: 2, tone: 'neutral' },
          { id: 'ps', label: 'Parallel streams', detail: 'share the same workers', col: 2, row: 2, tone: 'neutral' },
        ],
        edges: [
          { from: 'caller', to: 'io' },
          { from: 'io', to: 'own', label: 'runs on' },
          { from: 'def', to: 'common', label: 'runs on' },
          { from: 'own', to: 'cb', label: 'then completes' },
          { from: 'ps', to: 'common', label: 'compete for' },
        ],
        groups: [{ label: 'Thread pools', fromCol: 1, toCol: 2, fromRow: 1, toRow: 1, tone: 'accent' }],
      },
    ],
    variants: [
      {
        title: 'Composition methods',
        intro: 'Each has an `…Async` variant (optionally with an executor) that runs the callback on an executor instead of the completing thread.',
        items: [
          { name: 'thenApply', summary: 'Transform the value with a plain function (map).', support: 'supported', code: 'f.thenApply(u -> u.name())' },
          { name: 'thenCompose', summary: 'Chain a step that itself returns a CompletionStage, flattening it (flatMap).', support: 'supported', code: 'f.thenCompose(u -> loadCreditAsync(u.id()))' },
          { name: 'thenCombine', summary: 'Merge two independent futures when both complete (zip).', support: 'supported', code: 'a.thenCombine(b, (x, y) -> x + y)' },
          { name: 'thenAccept / thenRun', summary: 'Consume the value, or run an action, ending in CompletableFuture<Void>.', support: 'supported' },
          { name: 'allOf', summary: 'Complete when every input completes; returns CompletableFuture<Void>, so read each result with join() afterwards.', support: 'supported', code: 'CompletableFuture.allOf(fs).join();' },
          { name: 'anyOf / applyToEither', summary: 'Complete with the first input to finish (anyOf is typed Object; applyToEither keeps the type for two futures).', support: 'supported' },
        ],
      },
      {
        title: 'Error-handling and timeout methods',
        items: [
          { name: 'exceptionally', summary: 'Runs only on failure; returns a replacement value. Success passes through untouched.', support: 'supported', code: 'f.exceptionally(ex -> fallback)' },
          { name: 'handle', summary: 'Always runs with (value, exception); can map both outcomes to a new result.', support: 'supported', code: 'f.handle((v, ex) -> ex == null ? v : fallback)' },
          { name: 'whenComplete', summary: 'Always runs with (value, exception) but cannot change the outcome. For logging, metrics and cleanup.', support: 'supported' },
          { name: 'exceptionallyCompose', summary: 'Recover by starting another async call, such as a fallback service.', support: 'supported', note: 'Java 12 (with exceptionallyAsync)' },
          { name: 'orTimeout', summary: 'Fail with TimeoutException if not complete in time. Does not stop the underlying work.', support: 'supported', note: 'Java 9' },
          { name: 'completeOnTimeout', summary: 'Complete with a default value if not complete in time.', support: 'supported', note: 'Java 9' },
        ],
      },
      {
        title: 'Ways to create a CompletableFuture',
        intro: 'Static factories start a pipeline; the constructor gives you a future to complete yourself.',
        items: [
          { name: 'supplyAsync', summary: 'Runs a Supplier asynchronously and completes with its result. Uses the common pool unless you pass an executor.', support: 'supported', code: 'CompletableFuture.supplyAsync(() -> load(id), io)' },
          { name: 'runAsync', summary: 'Runs a Runnable asynchronously and completes with null, as a CompletableFuture<Void>.', support: 'supported', code: 'CompletableFuture.runAsync(() -> audit(event), io)' },
          { name: 'completedFuture', summary: 'An already completed future holding a value; useful for cache hits, default values and tests.', support: 'supported', code: 'CompletableFuture.completedFuture(cached)' },
          { name: 'failedFuture', summary: 'An already failed future holding an exception, so callers see the failure through the normal handlers.', support: 'supported', note: 'Java 9 (JEP 266)', code: 'CompletableFuture.failedFuture(new IOException("down"))' },
          { name: 'new CompletableFuture<>() + complete', summary: 'An incomplete future that you complete yourself with complete or completeExceptionally, typically to adapt a callback-based API.', support: 'supported', code: 'var f = new CompletableFuture<Reply>();\nlistener.onReply(f::complete);' },
        ],
      },
    ],
    deepDive: [
      {
        title: 'The wrapping rules behind CompletionException',
        body: 'The class documentation states that if a stage\'s computation completes abruptly with an exception, every dependent stage completes exceptionally with a `CompletionException` holding it as the cause. Internally, a throwing supplier is also stored wrapped. But a future completed directly by `completeExceptionally(ex)` or `failedFuture(ex)` stores `ex` as is, so its own handlers see the raw exception while dependents see the wrapper. `get()` unwraps into `ExecutionException(cause)`; `join()` throws the `CompletionException`. Robust handlers always unwrap — and `CancellationException` is never wrapped by `join()`.',
        sources: [
          { label: 'CompletableFuture API (Java 21)', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/CompletableFuture.html' },
          { label: 'CompletionStage API (Java 21)', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/CompletionStage.html' },
        ],
      },
      {
        title: 'Default executor, memory visibility and Java 9 additions',
        body: 'Async methods without an executor use `ForkJoinPool.commonPool()` — unless its parallelism is below 2, in which case a new thread is created for every task. Completion establishes happens-before: actions before completing a future are visible to dependent stages, so values passed along a pipeline need no extra synchronisation. JEP 266 (Java 9) added `orTimeout`, `completeOnTimeout`, `failedFuture`, `completeAsync`, `delayedExecutor` and a `defaultExecutor()` that subclasses can override to change the default pool.',
        sources: [
          { label: 'JEP 266: More Concurrency Updates', url: 'https://openjdk.org/jeps/266' },
          { label: 'java.util.concurrent package summary: Memory Consistency Properties', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/package-summary.html' },
        ],
      },
      {
        title: 'Callbacks, virtual threads and structured concurrency',
        body: 'Callback pipelines scale because no thread waits, but stack traces show pool internals instead of your call path, and `try/catch`, loops and debuggers do not follow the logic. Virtual threads (final in Java 21, JEP 444) make blocking cheap, so the same fan-out can be plain code on `newVirtualThreadPerTaskExecutor()`. Structured concurrency (`StructuredTaskScope`) adds what both lack — subtasks bound to a scope, with siblings cancelled when one fails — but it is **still a preview API**: previewed since Java 21 and reshaped in Java 25 (JEP 505), so it requires `--enable-preview` and is not standard Java yet.',
        sources: [
          { label: 'JEP 444: Virtual Threads', url: 'https://openjdk.org/jeps/444' },
          { label: 'JEP 505: Structured Concurrency (Fifth Preview)', url: 'https://openjdk.org/jeps/505' },
        ],
      },
    ],
  },
};
