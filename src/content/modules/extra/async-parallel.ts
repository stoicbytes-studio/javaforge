import type { Lesson } from '@/types/curriculum';

/**
 * New lessons for module 9 (concurrency): fork/join with parallel streams, and
 * asynchronous composition with CompletableFuture. They build on cc-threads,
 * which introduces executors, Future and a first CompletableFuture example.
 */
export const asyncParallelLessons: Lesson[] = [
  {
    id: 'cc-forkjoin-parallel',
    moduleId: 'concurrency',
    title: 'Fork/join and parallel streams',
    summary: 'Divide-and-conquer on all cores: ForkJoinPool and work stealing, RecursiveTask and RecursiveAction, the common pool, and when parallel streams help or hurt.',
    estimatedMinutes: 40,
    difficulty: 'advanced',
    prerequisites: ['cc-threads', 'fn-streams'],
    versionNotes: [
      { feature: 'Fork/join framework (ForkJoinPool, RecursiveTask, RecursiveAction)', since: 7 },
      { feature: 'Common pool, CountedCompleter, parallel streams, Spliterator', since: 8 },
      { feature: 'Stream.toList()', since: 16 },
      { feature: 'ExecutorService (and so ForkJoinPool) implements AutoCloseable', since: 19 },
    ],
    objectives: [
      'Explain divide and conquer and how ForkJoinPool uses work stealing to keep every core busy.',
      'Write a RecursiveTask that returns a result and a RecursiveAction that works in place, with a sensible sequential threshold.',
      'Describe the common pool: who uses it, how it is sized and why blocking inside it is harmful.',
      'Decide when a parallel stream helps (large, splittable, CPU-bound, stateless) and when it hurts (I/O, small data, shared state, ordering, boxing).',
      'State the associativity and identity requirements of reduce and how Spliterator characteristics affect splitting.',
    ],
    plainEnglish: `Some jobs are like counting the votes in a whole country: one person would take forever, but you can split the pile in half, give each half to someone else, have them split it again, and so on until every pile is small enough to count quickly. Then the partial counts are added back together. That is **divide and conquer**, and Java's **fork/join framework** is built for exactly this.

- **Fork** means "hand this half to someone else to do later".
- **Join** means "wait for that half's answer and combine it with mine".

A **ForkJoinPool** runs these little tasks on a few worker threads — usually one per CPU core. Workers that run out of work **steal** tasks from busy workers, so no core sits idle.

**Parallel streams** use the same machinery for you: add \`.parallel()\` (or call \`parallelStream()\`) and the stream library splits the data, processes the pieces on the shared **common pool**, and combines the results. That sounds like free speed, but it only pays off for big, CPU-heavy work on data that splits easily. For small lists, network calls or code that changes shared variables, it is slower or simply wrong.`,
    technical: `### Divide and conquer with ForkJoinPool (Java 7)
A fork/join task follows one shape:
\`\`\`java
if (problem is small) solve it directly;
else { split; fork one half; compute the other half; join; combine; }
\`\`\`
- **RecursiveTask<V>** returns a value from \`compute()\` (sum, max, count).
- **RecursiveAction** returns nothing and usually works **in place** on disjoint slices of an array (scale, sort, fill).
- **CountedCompleter** (Java 8) triggers a completion action when all pending children finish instead of blocking in \`join()\`; the stream library uses it internally.

Idiomatic splitting: \`left.fork(); long r = right.compute(); return left.join() + r;\` — the current thread keeps working instead of forking both halves and idling. \`invokeAll(a, b)\` does the same for actions. Choose a **sequential threshold** large enough that each leaf does real work (thousands of cheap operations, not ten); too-small leaves drown in task overhead.

### Work stealing
Every worker owns a **double-ended queue**. It pushes the tasks it forks and pops them from the same end (LIFO — the most recent, smallest piece, still hot in cache). An idle worker **steals from the other end** of someone else's deque (FIFO — the oldest, largest piece), so one steal moves a big chunk of work. \`join()\` does not simply block: while waiting, the worker runs the awaited task itself if it is still queued, or helps with other tasks.

### The common pool
\`ForkJoinPool.commonPool()\` (Java 8) is one JVM-wide pool shared by **parallel streams**, **CompletableFuture's \`*Async\` methods without an executor**, and \`Arrays.parallelSort\`. Its parallelism defaults to \`Runtime.getRuntime().availableProcessors() - 1\` (the calling thread joins in for parallel streams); override it with \`-Djava.util.concurrent.ForkJoinPool.common.parallelism=N\`. Because it is shared, a task that **blocks** (HTTP, JDBC, \`Thread.sleep\`, a lock) holds one of very few workers and slows every other user in the JVM. Run blocking work on your own executor or on virtual threads; if you must block inside a pool, use \`ForkJoinPool.managedBlock\` so the pool can add a compensating thread.

### Parallel streams (Java 8)
A parallel pipeline asks the source's **Spliterator** to \`trySplit()\` repeatedly, runs the pieces as fork/join tasks and merges results. It helps when **all** of these hold:
- **Large**: enough elements (or expensive enough per element) to outweigh splitting and merging — a common rule of thumb is N × cost-per-element of at least about 10,000 simple operations.
- **Splittable**: arrays, \`ArrayList\`, \`IntStream.range\` split in O(1) into exact halves. \`LinkedList\`, \`Stream.iterate\` and I/O-backed sources split poorly.
- **CPU-bound**: computation, not waiting.
- **Stateless and non-interfering**: lambdas do not modify shared state or the source.

It hurts with I/O (common-pool starvation), small data, shared mutable state (races, or locks that serialise everything), order-dependent operations on ordered sources (\`limit\`, \`skip\`, \`findFirst\`, \`forEachOrdered\` must respect encounter order), and boxing (\`Stream<Integer>\` instead of \`IntStream\`).

### Spliterator characteristics
A Spliterator reports flags such as \`SIZED\`/\`SUBSIZED\` (exact sizes after splitting, so results can be written straight into an array), \`ORDERED\` (encounter order must be kept), \`SORTED\`, \`DISTINCT\`, \`NONNULL\`, \`IMMUTABLE\` and \`CONCURRENT\`. Calling \`unordered()\` drops \`ORDERED\`, which can make \`distinct()\` or \`limit()\` much cheaper in parallel when you do not care about order.

### reduce must be associative
\`reduce(identity, op)\` in parallel reduces each chunk from the identity, then combines chunk results. That is only correct if \`op\` is **associative** (\`(a op b) op c == a op (b op c)\`) and \`identity\` is a true identity (\`identity op x == x\`). \`Integer::sum\` with 0 is fine; subtraction, or \`sum\` with identity 10, gives answers that depend on how the data was split. Prefer built-in collectors (\`toList\`, \`groupingByConcurrent\`, \`summingLong\`) over mutating a shared collection.`,
    whyItExists: `Single-core speed stopped rising in the mid-2000s; hardware got more cores instead. Classic thread pools with one shared queue handle many independent requests well, but recursive, fine-grained work creates thousands of small dependent tasks and the shared queue becomes a bottleneck. Doug Lea's fork/join framework (Java 7) gives each worker its own deque and lets idle workers steal, which keeps all cores busy with very low coordination cost. Java 8 then wrapped it in parallel streams so that many data-parallel computations need one method call instead of hand-written tasks — at the price of a shared pool that must not be misused.`,
    whenToUse: [
      'Recursive, CPU-bound problems that split naturally: summing or searching huge arrays, merge sort, image tiles, tree traversals.',
      'A parallel stream over a large array, ArrayList or IntStream.range with an expensive, stateless per-element computation — after measuring that it is faster.',
      'Arrays.parallelSort or Arrays.parallelPrefix for very large primitive arrays.',
      'A dedicated ForkJoinPool when a library or batch job needs fork/join parallelism isolated from the rest of the JVM.',
    ],
    whenNotToUse: [
      'Do not use parallel streams (or the common pool) for blocking I/O such as HTTP or database calls — use your own executor or virtual threads.',
      'Do not parallelise small collections or cheap per-element work: splitting and merging costs more than it saves.',
      'Do not mutate shared variables or collections from parallel lambdas; use collectors or reductions.',
      'Do not parallelise LinkedList, Stream.iterate or iterator-backed sources and expect a speed-up.',
      'Do not add .parallel() inside request handlers of a busy server without measuring: every request competes for the same few common-pool threads.',
    ],
    examples: [
      {
        id: 'cc-forkjoin-parallel-tasks',
        title: 'RecursiveTask (sum) and RecursiveAction (scale in place)',
        runnable: true,
        code: `import java.util.concurrent.ForkJoinPool;
import java.util.concurrent.RecursiveAction;
import java.util.concurrent.RecursiveTask;

public class Main {
    static final int THRESHOLD = 10_000;

    static class SumTask extends RecursiveTask<Long> {
        final long[] data; final int from, to;
        SumTask(long[] data, int from, int to) { this.data = data; this.from = from; this.to = to; }

        @Override
        protected Long compute() {
            if (to - from <= THRESHOLD) {              // small enough: just loop
                long sum = 0;
                for (int i = from; i < to; i++) sum += data[i];
                return sum;
            }
            int mid = (from + to) >>> 1;
            SumTask left = new SumTask(data, from, mid);
            SumTask right = new SumTask(data, mid, to);
            left.fork();                               // push left half; an idle worker may steal it
            long rightSum = right.compute();           // keep working on the right half ourselves
            return left.join() + rightSum;             // wait for (or run) the left half
        }
    }

    static class ScaleAction extends RecursiveAction {
        final long[] data; final int from, to; final long factor;
        ScaleAction(long[] data, int from, int to, long factor) {
            this.data = data; this.from = from; this.to = to; this.factor = factor;
        }

        @Override
        protected void compute() {
            if (to - from <= THRESHOLD) {
                for (int i = from; i < to; i++) data[i] *= factor;   // disjoint slice: no locking needed
                return;
            }
            int mid = (from + to) >>> 1;
            invokeAll(new ScaleAction(data, from, mid, factor), new ScaleAction(data, mid, to, factor));
        }
    }

    public static void main(String[] args) {
        long[] data = new long[1_000_000];
        for (int i = 0; i < data.length; i++) data[i] = i + 1;

        try (ForkJoinPool pool = new ForkJoinPool(4)) {
            long sum = pool.invoke(new SumTask(data, 0, data.length));
            System.out.println("sum      = " + sum);

            pool.invoke(new ScaleAction(data, 0, data.length, 3));
            System.out.println("first    = " + data[0] + ", last = " + data[data.length - 1]);
            System.out.println("sum x3   = " + pool.invoke(new SumTask(data, 0, data.length)));
        }
        System.out.println("formula  = " + 1_000_000L * 1_000_001L / 2);
    }
}`,
        expectedOutput: `sum      = 500000500000
first    = 3, last = 3000000
sum x3   = 1500001500000
formula  = 500000500000`,
        explanation: 'The answer never depends on which worker ran which piece: each leaf touches only its own slice, and results are combined by join() along the same tree every time. The program prints computed values only, never thread names or timings, so the output is identical on 1 core or 64.',
      },
      {
        id: 'cc-forkjoin-parallel-streams',
        title: 'Parallel streams done right: splittable, stateless, associative',
        runnable: true,
        code: `import java.util.List;
import java.util.TreeMap;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.LongStream;

public class Main {
    static boolean isPrime(long n) {
        if (n < 2) return false;
        for (long d = 2; d * d <= n; d++) if (n % d == 0) return false;
        return true;
    }

    public static void main(String[] args) {
        // Good fit: large, splittable (a range), CPU-bound, stateless, primitive (no boxing)
        long primes = LongStream.rangeClosed(1, 200_000).parallel().filter(Main::isPrime).count();
        System.out.println("primes <= 200000: " + primes);

        // Encounter order is preserved by toList() and forEachOrdered(), even in parallel
        List<String> upper = List.of("ant", "bee", "cat", "dog").parallelStream()
            .map(String::toUpperCase)
            .toList();
        System.out.println(upper);

        // Associative reduction with a true identity: same answer as sequential
        int seq = IntStream.rangeClosed(1, 1_000).sum();
        int par = IntStream.rangeClosed(1, 1_000).parallel().reduce(0, Integer::sum);
        System.out.println("sum: " + seq + " / " + par);

        // Wrong identity: 10 is added once per chunk, not once overall
        int wrong = IntStream.rangeClosed(1, 1_000).parallel().reduce(10, Integer::sum);
        System.out.println("reduce(10, sum) equals 510500? " + (wrong == 510_500));

        // Grouping with a collector instead of mutating a shared map
        var byLength = List.of("ant", "bee", "wasp", "moth", "beetle").parallelStream()
            .collect(Collectors.groupingByConcurrent(String::length, Collectors.counting()));
        System.out.println("lengths: " + new TreeMap<>(byLength));
    }
}`,
        expectedOutput: `primes <= 200000: 17984
[ANT, BEE, CAT, DOG]
sum: 500500 / 500500
reduce(10, sum) equals 510500? false
lengths: {3=2, 4=2, 6=1}`,
        explanation: 'Every printed value is deterministic. The wrong-identity reduction prints only a boolean: its exact value depends on how many chunks the stream created, which depends on the core count, but it is never the "expected" 510500 because the stream always splits 1,000 elements into several chunks and each chunk starts from 10.',
      },
      {
        id: 'cc-forkjoin-parallel-pitfalls',
        title: 'Parallel streams done wrong (do not copy)',
        runnable: false,
        code: `// 1. Shared mutable state: ArrayList is not thread-safe -> lost elements or exceptions
List<Integer> out = new ArrayList<>();
IntStream.range(0, 100_000).parallel().forEach(out::add);          // BUG
List<Integer> ok = IntStream.range(0, 100_000).parallel().boxed().toList();

// 2. Blocking I/O on the common pool: starves every other parallel stream
//    and every CompletableFuture.supplyAsync(...) without an executor in the JVM
List<Price> prices = skus.parallelStream().map(pricingClient::fetch).toList();   // BAD

// 3. Poorly splittable source: each split walks the list; little or no speed-up
new LinkedList<>(bigList).parallelStream().map(this::score).toList();

// 4. Sequential by nature: each element depends on the previous one
Stream.iterate(1L, x -> x * 3 % 1_000_003).parallel().limit(1_000_000).count();

// 5. Boxing: millions of Long objects allocated and unboxed
List<Long> boxed = ...; boxed.parallelStream().reduce(0L, Long::sum);
long fast = LongStream.rangeClosed(1, 1_000_000).parallel().sum();

// 6. Non-associative operation: result depends on how the data was split
IntStream.rangeClosed(1, 1_000).parallel().reduce(0, (a, b) -> a - b);  // BUG`,
        explanation: 'Each snippet compiles but is either incorrect (1, 6), harmful to the whole JVM (2) or slower than the sequential version (3, 4, 5).',
      },
    ],
    walkthrough: {
      exampleId: 'cc-forkjoin-parallel-tasks',
      steps: [
        { lines: [6, 6], text: 'The sequential threshold. Below 10,000 elements a plain loop is cheaper than creating more tasks; above it, splitting pays off.' },
        { lines: [8, 10], text: 'A RecursiveTask<Long> returns a value. Each task describes a slice [from, to) of a shared array; slices never overlap.' },
        { lines: [13, 18], text: 'The base case: a small slice is summed directly with a loop. Every recursive algorithm needs one.' },
        { lines: [19, 24], text: 'The recursive case: split in the middle, fork() the left half so an idle worker can steal it, compute() the right half in the current thread, then join() the left result and combine. Computing one half yourself avoids an idle thread waiting for two forks.' },
        { lines: [28, 43], text: 'A RecursiveAction returns nothing: it multiplies its slice in place. invokeAll forks one half and runs the other, then waits for both. Because the slices are disjoint, no locking is needed.' },
        { lines: [49, 56], text: 'A dedicated pool of 4 workers in try-with-resources (ForkJoinPool is an ExecutorService, AutoCloseable since Java 19). invoke() runs the root task and returns its result.' },
        { lines: [57, 57], text: 'The closed-form check n(n+1)/2 agrees with the parallel sum — the strongest evidence that the split and combine steps are correct.' },
      ],
    },
    realWorld: {
      title: 'The report endpoint that froze the checkout',
      scenario: `A retail platform added \`.parallelStream()\` to a reporting endpoint that, for each of 300 stores, called an inventory HTTP API. On an 8-core server the common pool had 7 workers. When a few reports ran at once, all 7 workers sat blocked on sockets — and the checkout service, which used \`CompletableFuture.supplyAsync(...)\` without an executor for tax calculations, shared the same pool. Checkout latency jumped from 40 ms to several seconds, although CPU usage was under 10%.

The fix had two parts. The HTTP fan-out moved to a virtual-thread executor with a \`Semaphore\` limiting calls to the inventory API, and \`supplyAsync\` in checkout got its own bounded executor. A separate nightly job that really was CPU-bound — scoring 50 million in-memory price records — kept its parallel stream over a primitive array and ran 6x faster than the sequential loop, measured with JMH.`,
    },
    commonMistakes: [
      {
        mistake: 'Making the sequential threshold tiny (or splitting all the way down to single elements).',
        why: 'Each task has allocation and scheduling overhead. With leaves of one element, overhead dominates and the parallel version is slower than a loop.',
        fix: 'Split until each leaf does a meaningful amount of work (thousands of simple operations), and measure with JMH.',
      },
      {
        mistake: 'Forking both halves and then joining them (or joining before computing).',
        why: 'left.fork(); right.fork(); left.join(); right.join(); leaves the current worker with nothing to do but wait, and joining a task before doing your own share serialises the work.',
        fix: 'Use left.fork(); right.compute(); left.join(); or invokeAll(left, right).',
        code: `left.fork();
long r = right.compute();   // do one half yourself
return left.join() + r;     // then collect the forked half`,
      },
      {
        mistake: 'Adding to a shared ArrayList or HashMap from forEach in a parallel stream.',
        why: 'The collection is not thread-safe: elements are lost, the size is wrong, or an ArrayIndexOutOfBoundsException appears — non-deterministically.',
        fix: 'Let the stream build the result: toList(), collect(Collectors.groupingByConcurrent(...)), or a reduction.',
      },
      {
        mistake: 'Running blocking calls in a parallel stream or in supplyAsync without an executor.',
        why: 'Both use the JVM-wide common pool with only about one thread per core; blocked workers starve every other user of the pool.',
        fix: 'Use a dedicated executor or virtual threads for I/O; keep the common pool for short CPU-bound work.',
      },
      {
        mistake: 'Using a non-associative operator or a fake identity in reduce.',
        why: 'Parallel reduce starts every chunk from the identity and combines chunks in a tree, so the result depends on the split.',
        fix: 'Use associative operations with a true identity (0 for +, 1 for *), or a collector.',
      },
    ],
    checks: [
      {
        id: 'cc4-c1',
        kind: 'predict-output',
        dimension: 'runtime',
        prompt: 'What does this program print?',
        code: `import java.util.List;
import java.util.stream.IntStream;

public class Main {
    public static void main(String[] args) {
        List<Integer> squares = IntStream.rangeClosed(1, 5).parallel()
            .map(i -> i * i)
            .boxed()
            .toList();
        System.out.println(squares);
        System.out.println(IntStream.rangeClosed(1, 100).parallel().sum());
    }
}`,
        options: [
          { id: 'a', text: '[1, 4, 9, 16, 25]\n5050' },
          { id: 'b', text: 'The list order changes from run to run, then 5050' },
          { id: 'c', text: '[25, 16, 9, 4, 1]\n5050' },
          { id: 'd', text: '[1, 4, 9, 16, 25]\n0' },
        ],
        correctOptionId: 'a',
        explanation: 'The pieces may be processed in any order, but toList() respects the encounter order of an ordered source, so the list is always in order. sum() is an associative reduction with identity 0, so its result does not depend on the split.',
      },
      {
        id: 'cc4-c2',
        kind: 'predict-output',
        dimension: 'runtime',
        prompt: 'The task splits any range larger than 2. What does this program print?',
        code: `import java.util.concurrent.ForkJoinPool;
import java.util.concurrent.RecursiveTask;
import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    static final AtomicInteger leaves = new AtomicInteger();

    static class Count extends RecursiveTask<Integer> {
        final int from, to;
        Count(int from, int to) { this.from = from; this.to = to; }

        @Override
        protected Integer compute() {
            if (to - from <= 2) {
                leaves.incrementAndGet();
                return to - from;
            }
            int mid = (from + to) / 2;
            Count left = new Count(from, mid);
            left.fork();
            int right = new Count(mid, to).compute();
            return left.join() + right;
        }
    }

    public static void main(String[] args) {
        int total = ForkJoinPool.commonPool().invoke(new Count(0, 10));
        System.out.println(total + " from " + leaves.get() + " leaves");
    }
}`,
        options: [
          { id: 'a', text: '10 from 5 leaves' },
          { id: 'b', text: '10 from 6 leaves' },
          { id: 'c', text: '10 from 10 leaves' },
          { id: 'd', text: 'It depends on the number of cores' },
        ],
        correctOptionId: 'b',
        explanation: '[0,10) splits into [0,5) and [5,10). Each 5-element range splits into 2 (a leaf) and 3, and the 3 splits into 1 and 2 — three leaves per half, six in total. The split tree is decided by the code, not by the number of workers, so the answer is the same on every machine.',
      },
      {
        id: 'cc4-c3',
        kind: 'mcq',
        dimension: 'conceptual',
        prompt: 'Each source holds 5 million numbers and the per-element work is an expensive pure computation. Which source is most likely to speed up with .parallel()?',
        options: [
          { id: 'a', text: 'A LinkedList<Integer>' },
          { id: 'b', text: 'Stream.iterate(seed, x -> next(x)).limit(5_000_000)' },
          { id: 'c', text: 'A long[] array via Arrays.stream(array)' },
          { id: 'd', text: 'Files.lines(path) where each line is fetched from a network drive' },
        ],
        correctOptionId: 'c',
        explanation: 'An array is SIZED and SUBSIZED and splits into exact halves in O(1), and a primitive stream avoids boxing. A linked list must be walked to split, iterate is inherently sequential, and network I/O is not CPU-bound.',
      },
      {
        id: 'cc4-c4',
        kind: 'multi-select',
        dimension: 'interview',
        prompt: 'Which situations make a parallel stream slower or incorrect? Select all that apply.',
        options: [
          { id: 'a', text: 'Calling a REST API for each element' },
          { id: 'b', text: 'A list of 20 elements with a trivial map' },
          { id: 'c', text: 'Appending results to a shared ArrayList in forEach' },
          { id: 'd', text: 'Summing a 50-million-element int[] with IntStream.sum()' },
          { id: 'e', text: 'Using findFirst() and limit() on an ordered source where any matching element would do' },
        ],
        correctOptionIds: ['a', 'b', 'c', 'e'],
        explanation: 'I/O blocks common-pool workers, tiny inputs are dominated by overhead, a shared ArrayList races, and order-sensitive operations force extra buffering (use findAny() or unordered() when order does not matter). Summing a huge primitive array is the textbook good case.',
      },
      {
        id: 'cc4-c5',
        kind: 'mcq',
        dimension: 'debugging',
        prompt: '`IntStream.rangeClosed(1, 1000).parallel().reduce(10, Integer::sum)` returns different values on a laptop and on a 32-core server, and never 510500. Why?',
        options: [
          { id: 'a', text: 'Integer::sum is not thread-safe' },
          { id: 'b', text: '10 is not an identity for addition: each chunk starts from 10, so 10 is added once per chunk and the chunk count depends on the core count' },
          { id: 'c', text: 'Parallel streams skip some elements' },
          { id: 'd', text: 'reduce is not supported on parallel streams' },
        ],
        correctOptionId: 'b',
        explanation: 'The identity must satisfy identity op x == x. Use reduce(0, Integer::sum) and add 10 afterwards. Integer::sum itself is a pure function and is perfectly safe.',
      },
      {
        id: 'cc4-c6',
        kind: 'mcq',
        dimension: 'conceptual',
        prompt: 'In work stealing, which tasks does an idle ForkJoinPool worker take?',
        options: [
          { id: 'a', text: 'The newest task from its own deque, and when that is empty, the oldest task from another worker\'s deque' },
          { id: 'b', text: 'Tasks from a single shared FIFO queue, like a fixed thread pool' },
          { id: 'c', text: 'Only tasks submitted from outside the pool' },
          { id: 'd', text: 'The newest task from another worker\'s deque' },
        ],
        correctOptionId: 'a',
        explanation: 'Owners work LIFO on their own deque (small, cache-hot pieces); thieves take from the opposite end (FIFO), where the oldest and largest pieces sit. One steal therefore moves a lot of work and owners and thieves rarely contend for the same end.',
      },
    ],
    challengeIds: [],
    masteryCriteria: [
      'Write a correct RecursiveTask and RecursiveAction with a sensible threshold and the fork/compute/join pattern.',
      'Explain work stealing and why the common pool must not be used for blocking work.',
      'Judge whether a parallel stream will help, given the source, size, per-element cost and side effects.',
      'Spot non-associative reductions and fake identities.',
    ],
    relatedLessonIds: ['cc-threads', 'fn-streams', 'cc-synchronization', 'cc-completablefuture', 'perf-jmh'],
    revision: [
      { id: 'r1', question: 'What is the difference between RecursiveTask and RecursiveAction?', answer: 'RecursiveTask<V> returns a result from compute() (sum, max); RecursiveAction returns nothing and typically updates disjoint slices of a shared array in place.' },
      { id: 'r2', question: 'Why fork one half and compute the other, instead of forking both?', answer: 'The current worker keeps doing useful work instead of idling while it waits; it only forks what someone else might steal.' },
      { id: 'r3', question: 'How is the common pool sized, and who shares it?', answer: 'availableProcessors() - 1 workers by default (the caller helps in parallel streams), configurable with java.util.concurrent.ForkJoinPool.common.parallelism. Parallel streams, CompletableFuture async methods without an executor and Arrays.parallelSort all share it.' },
      { id: 'r4', question: 'Name four conditions for a parallel stream to pay off.', answer: 'Large input (or expensive elements), an efficiently splittable source, CPU-bound work, and stateless, non-interfering lambdas with associative reductions.' },
      { id: 'r5', question: 'What does reduce require in parallel?', answer: 'An associative operator and an identity value that leaves any element unchanged (identity op x == x).' },
    ],
  },
  {
    id: 'cc-completablefuture',
    moduleId: 'concurrency',
    title: 'Asynchronous programming with CompletableFuture',
    summary: 'Compose non-blocking pipelines: supplyAsync with the right executor, thenApply/thenCompose/thenCombine/allOf/anyOf, error handling, timeouts, and how it compares with virtual threads.',
    estimatedMinutes: 45,
    difficulty: 'advanced',
    prerequisites: ['cc-threads'],
    versionNotes: [
      { feature: 'Future', since: 5 },
      { feature: 'CompletableFuture and CompletionStage', since: 8 },
      { feature: 'orTimeout, completeOnTimeout, failedFuture, delayedExecutor (JEP 266)', since: 9 },
      { feature: 'exceptionallyAsync, exceptionallyCompose', since: 12 },
      { feature: 'Future.resultNow, exceptionNow, state', since: 19 },
      { feature: 'Virtual threads (JEP 444)', since: 21, note: 'Preview in 19-20, final in 21' },
      { feature: 'Structured concurrency (StructuredTaskScope)', since: 21, note: 'Still a preview API: incubator in 19-20, preview from 21 onwards (still preview in 25). Requires --enable-preview.' },
    ],
    objectives: [
      'Explain what a plain Future cannot do and how CompletableFuture fixes it.',
      'Start async work with supplyAsync/runAsync on an explicit executor and explain why I/O must not run on the common pool.',
      'Choose between thenApply, thenCompose, thenCombine, allOf and anyOf.',
      'Handle failures with exceptionally, handle and whenComplete, and unwrap CompletionException correctly.',
      'Add timeouts with orTimeout and completeOnTimeout, and explain join vs get and async vs non-async callbacks.',
      'Compare CompletableFuture pipelines with virtual threads and (preview) structured concurrency.',
    ],
    plainEnglish: `Ordering food at a busy counter gives you a **buzzer**. You do not stand at the counter staring at the kitchen; you go and do other things, and when the buzzer goes off you collect your meal. A plain Java \`Future\` is a buzzer you can only check by standing there and waiting (\`get()\` blocks).

A **CompletableFuture** is a smarter buzzer: you can tell it in advance what to do **when** the food is ready — "then add sauce", "then also wait for the drinks and put both on one tray", "if the kitchen burns it, give me a sandwich instead". You describe the whole plan up front, and each step runs automatically as soon as its input is ready, without any thread sitting around waiting.

That makes it ideal for calling several slow services at once and combining their answers. The things to get right are **where** the work runs (your own thread pool, not a shared default one), **how failures travel** through the plan, and **how long** you are willing to wait.`,
    technical: `### What Future cannot do
\`Future<T>\` (Java 5) offers \`get()\` (blocking), \`isDone()\` and \`cancel()\`. You cannot attach a callback, chain a second async step, combine two futures, recover from failure or complete it yourself — every one of those needs a thread blocked in \`get()\`.

### Starting work
- \`supplyAsync(supplier, executor)\` returns a value; \`runAsync(runnable, executor)\` returns \`CompletableFuture<Void>\`.
- **Without an executor** both use \`ForkJoinPool.commonPool()\` (or a new thread per task if its parallelism is below 2). The common pool is small and JVM-wide, so **never run blocking I/O there**: pass a dedicated, bounded executor — or a virtual-thread executor on Java 21+.
- \`completedFuture(v)\`, \`failedFuture(ex)\` (Java 9) and \`new CompletableFuture<>()\` + \`complete(v)\` / \`completeExceptionally(ex)\` let you create or bridge futures yourself (for example from a callback API).

### Composition
- \`thenApply(fn)\` — transform the value (like \`map\`).
- \`thenCompose(fn)\` — the next step **returns a CompletionStage**; flattens it (like \`flatMap\`). Using \`thenApply\` there gives \`CompletableFuture<CompletableFuture<T>>\`.
- \`thenCombine(other, bifn)\` — merge two **independent** results when both are ready.
- \`thenAccept\` / \`thenRun\` — consume the value / run an action, returning \`CompletableFuture<Void>\`.
- \`allOf(fs...)\` — completes when all complete; it returns \`CompletableFuture<Void>\`, so read each result with \`join()\` afterwards (in your own fixed order). If any fails, \`allOf\` fails too, but only after all have finished.
- \`anyOf(fs...)\` — completes with the first result (or failure) of any input, typed \`Object\`.

### Async vs non-async callbacks
\`thenApply(fn)\` runs \`fn\` on **whichever thread completes the previous stage** — or immediately on the **calling thread** if that stage is already complete. \`thenApplyAsync(fn, executor)\` always hands \`fn\` to an executor (the common pool if you omit it). Use non-async variants for cheap transformations, and the \`*Async(…, executor)\` variants when the callback is slow or must not run on, say, an HTTP client's I/O thread.

### Failure handling
A failure **skips** \`thenApply\`/\`thenCompose\`/\`thenCombine\` stages and flows to the first handler:
- \`exceptionally(ex -> fallback)\` — runs only on failure; returns a replacement value.
- \`handle((value, ex) -> result)\` — always runs; can map success **and** failure to a new result.
- \`whenComplete((value, ex) -> sideEffect)\` — always runs but **cannot change the result**; the original value or failure continues. Good for logging and metrics.
- \`exceptionallyCompose\` (Java 12) recovers with another async call, e.g. a fallback service.

**Wrapping:** when a supplier throws, or a failure passes through a dependent stage, the exception reaching handlers is usually a \`CompletionException\` whose \`getCause()\` is the original. A future completed directly with \`completeExceptionally(ex)\` or \`failedFuture(ex)\` exposes \`ex\` unwrapped to its *own* handlers. Robust code unwraps: \`ex instanceof CompletionException && ex.getCause() != null ? ex.getCause() : ex\`.

### join vs get
Both block until completion. \`get()\` throws checked \`ExecutionException\` (and \`InterruptedException\`), with the original exception as the cause. \`join()\` throws unchecked \`CompletionException\` — convenient inside lambdas. \`get(timeout, unit)\` adds a blocking timeout. \`cancel(true)\` completes the future with \`CancellationException\` but does **not** interrupt the running task.

### Timeouts (Java 9)
- \`orTimeout(t, unit)\` — fails the future with \`TimeoutException\` if not done in time.
- \`completeOnTimeout(value, t, unit)\` — completes it with a default value instead.

Neither stops the underlying work; they only stop *waiting* for it.

### Compared with virtual threads and structured concurrency
With **virtual threads** (final in Java 21), blocking is cheap, so the same fan-out can be written as plain sequential-looking code: submit tasks to \`Executors.newVirtualThreadPerTaskExecutor()\` and call \`get()\`. You get ordinary stack traces, \`try/catch\` and debugging, which callback chains lack. CompletableFuture remains useful when an API already returns futures (for example \`HttpClient.sendAsync\`), and for declarative fan-out/fan-in with timeouts. **Structured concurrency** (\`StructuredTaskScope\`) adds automatic cancellation of sibling tasks and bounded lifetimes, but it is **still a preview API** (preview since Java 21, reshaped and still preview in Java 25): it needs \`--enable-preview\` and is not standard Java yet.`,
    whyItExists: `Servers spend most of their time waiting on other servers. Before Java 8, combining several remote calls meant blocking a thread in Future.get() for each, or hand-written callback code that was hard to compose and lost errors. CompletableFuture (Java 8, inspired by promises and by Guava's ListenableFuture) gave Java a standard, composable promise: a pipeline of stages that run when their inputs are ready, with failures propagating like exceptions. Java 9 added timeouts and delayed executors. Virtual threads in Java 21 later made simple blocking code scale too, so today CompletableFuture is one of two good tools rather than the only one.`,
    whenToUse: [
      'Calling several independent services concurrently and combining their results (thenCombine, allOf).',
      'Chaining dependent async steps where an API already returns CompletableFuture or CompletionStage (for example HttpClient.sendAsync).',
      'Adding per-call timeouts and fallbacks declaratively with orTimeout, completeOnTimeout and exceptionally.',
      'Bridging a callback-style API into a future with new CompletableFuture<>() and complete/completeExceptionally.',
    ],
    whenNotToUse: [
      'Do not run blocking I/O in supplyAsync without passing an executor — it lands on the shared common pool.',
      'Do not call join() or get() right after supplyAsync on every step — that is sequential code with extra overhead.',
      'Do not build long callback chains when straightforward blocking code on virtual threads (Java 21+) would be clearer.',
      'Do not use whenComplete to recover from errors — it cannot change the result; use exceptionally or handle.',
      'Do not rely on cancel(true) to stop running work; CompletableFuture never interrupts the task.',
    ],
    examples: [
      {
        id: 'cc-completablefuture-compose',
        title: 'Composing calls: thenApply, thenCompose, thenCombine, allOf, anyOf',
        runnable: true,
        code: `import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class Main {
    record User(String id, String name) {}

    // Stand-ins for remote calls (a user service and a credit service)
    static User loadUser(String id) { return new User(id, id.equals("u1") ? "Ada" : "Linus"); }
    static int loadCredit(String userId) { return userId.equals("u1") ? 700 : 450; }

    public static void main(String[] args) {
        try (ExecutorService io = Executors.newFixedThreadPool(4)) {     // our own pool, not the common pool
            CompletableFuture<User> user =
                CompletableFuture.supplyAsync(() -> loadUser("u1"), io);

            // thenApply: plain transformation of the value
            CompletableFuture<String> greeting = user.thenApply(u -> "Hello, " + u.name());

            // thenCompose: the next step is itself asynchronous -> flatten, no nested future
            CompletableFuture<Integer> credit =
                user.thenCompose(u -> CompletableFuture.supplyAsync(() -> loadCredit(u.id()), io));

            // thenCombine: wait for two independent results, then merge them
            String report = greeting.thenCombine(credit, (g, c) -> g + " (credit " + c + ")").join();
            System.out.println(report);

            // allOf: fan out, then wait for every future; read results in list order
            List<CompletableFuture<Integer>> credits = List.of("u1", "u2", "u3").stream()
                .map(id -> CompletableFuture.supplyAsync(() -> loadCredit(id), io))
                .toList();
            CompletableFuture.allOf(credits.toArray(new CompletableFuture[0])).join();
            int total = credits.stream().mapToInt(CompletableFuture::join).sum();
            System.out.println("total credit = " + total);

            // anyOf: the first future to finish wins (here one is already complete)
            CompletableFuture<String> cache = CompletableFuture.completedFuture("from cache");
            CompletableFuture<String> never = new CompletableFuture<>();
            System.out.println("first = " + CompletableFuture.anyOf(cache, never).join());
        }
    }
}`,
        expectedOutput: `Hello, Ada (credit 700)
total credit = 1600
first = from cache`,
        explanation: 'All printing happens on the main thread after join(), and results are read in a fixed order, so the output never depends on which pool thread finished first. The anyOf example is deterministic because one input is already complete and the other never completes.',
      },
      {
        id: 'cc-completablefuture-errors',
        title: 'Failures and timeouts: exceptionally, handle, whenComplete, join vs get, orTimeout',
        runnable: true,
        code: `import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

public class Main {
    static int loadPrice(String sku) {
        if (sku.isBlank()) throw new IllegalArgumentException("blank sku");
        return 42;
    }

    static String describe(Throwable ex) {
        Throwable cause = ex instanceof CompletionException && ex.getCause() != null ? ex.getCause() : ex;
        return cause.getClass().getSimpleName() + ": " + cause.getMessage();
    }

    public static void main(String[] args) throws InterruptedException {
        try (ExecutorService pool = Executors.newFixedThreadPool(2)) {
            CompletableFuture<Integer> failing = CompletableFuture.supplyAsync(() -> loadPrice(" "), pool);

            // exceptionally: runs only on failure, supplies a fallback value
            System.out.println("exceptionally -> " + failing.exceptionally(ex -> -1).join());

            // handle: always runs, sees (value, exception), may change the result
            String handled = failing.handle((v, ex) -> ex == null ? "price " + v : "fallback after " + describe(ex)).join();
            System.out.println("handle        -> " + handled);

            // whenComplete: always runs, observes only; the failure keeps flowing
            List<String> log = new CopyOnWriteArrayList<>();
            CompletableFuture<Integer> logged = failing.whenComplete((v, ex) -> log.add("logged " + describe(ex)));
            try {
                logged.join();
            } catch (CompletionException e) {                  // join() throws unchecked CompletionException
                System.out.println("join threw    -> " + e.getClass().getSimpleName() + " caused by " + describe(e));
            }
            System.out.println(log.get(0));

            try {
                failing.get();                                  // get() throws checked ExecutionException
            } catch (ExecutionException e) {
                System.out.println("get threw     -> " + e.getClass().getSimpleName() + " caused by " + describe(e.getCause()));
            }

            // Java 9 timeouts on a call that never answers
            CompletableFuture<String> slow1 = new CompletableFuture<>();
            System.out.println("completeOnTimeout -> " + slow1.completeOnTimeout("cached quote", 50, TimeUnit.MILLISECONDS).join());
            CompletableFuture<String> slow2 = new CompletableFuture<>();
            try {
                slow2.orTimeout(50, TimeUnit.MILLISECONDS).join();
            } catch (CompletionException e) {
                System.out.println("orTimeout         -> " + describe(e).split(":")[0]);
            }
        }
    }
}`,
        expectedOutput: `exceptionally -> -1
handle        -> fallback after IllegalArgumentException: blank sku
join threw    -> CompletionException caused by IllegalArgumentException: blank sku
logged IllegalArgumentException: blank sku
get threw     -> ExecutionException caused by IllegalArgumentException: blank sku
completeOnTimeout -> cached quote
orTimeout         -> TimeoutException`,
        explanation: 'The whenComplete callback stores its message instead of printing it, because it may run on a pool thread; the main thread prints it after join() guarantees the callback has run. Timeouts use futures that never complete, so the outcome does not depend on machine speed.',
      },
      {
        id: 'cc-completablefuture-virtual',
        title: 'The same fan-out as plain blocking code on virtual threads (Java 21)',
        runnable: true,
        minJavaVersion: 21,
        code: `import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

public class Main {
    record User(String id, String name) {}
    static User loadUser(String id) { return new User(id, "Ada"); }
    static int loadCredit(String userId) { return 700; }

    public static void main(String[] args) throws Exception {
        // Same fan-out as the CompletableFuture version, written as plain blocking code
        try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
            User user = executor.submit(() -> loadUser("u1")).get();
            Future<String> greeting = executor.submit(() -> "Hello, " + user.name());
            Future<Integer> credit = executor.submit(() -> loadCredit(user.id()));
            System.out.println(greeting.get() + " (credit " + credit.get() + ")");
        }
    }
}`,
        expectedOutput: 'Hello, Ada (credit 700)',
        explanation: 'Blocking a virtual thread in get() is cheap, so ordinary sequential-looking code scales. Errors arrive as ExecutionException in a normal try/catch, and stack traces show the real call path. With structured concurrency (a preview API) the scope would also cancel the sibling task automatically if one failed.',
      },
    ],
    walkthrough: {
      exampleId: 'cc-completablefuture-compose',
      steps: [
        { lines: [9, 11], text: 'Two stand-ins for remote calls. In real code they would block on the network, which is exactly why they need a dedicated executor.' },
        { lines: [14, 16], text: 'A dedicated pool in try-with-resources. supplyAsync(supplier, io) starts loading the user on that pool and returns immediately.' },
        { lines: [18, 19], text: 'thenApply transforms the value once it is available. Nothing blocks here; the lambda runs when the user arrives.' },
        { lines: [21, 23], text: 'thenCompose is used because loading the credit is itself asynchronous: it flattens the inner future instead of producing CompletableFuture<CompletableFuture<Integer>>.' },
        { lines: [25, 27], text: 'thenCombine waits for both independent branches and merges them. join() is called once, at the very end of the pipeline.' },
        { lines: [29, 35], text: 'allOf fans out three calls and waits for all of them. It returns CompletableFuture<Void>, so the results are read with join() in list order — already complete, so these joins do not block.' },
        { lines: [37, 40], text: 'anyOf completes with whichever input finishes first. Its result type is Object, because the inputs may have different types.' },
      ],
    },
    realWorld: {
      title: 'A product page assembled from four services',
      scenario: `A product page needed the catalogue entry, the price, stock level and reviews. Calling them one after another took the sum of four latencies (about 450 ms at p99). The team rewrote the handler with CompletableFuture: catalogue first, then price, stock and reviews in parallel with \`thenCompose\` and \`allOf\`, all on a dedicated bounded executor.

Three production lessons followed. First, an early version used \`supplyAsync\` without an executor; under load the common pool (7 threads) blocked on HTTP and parallel streams elsewhere in the service stalled. Second, reviews were optional, so they got \`completeOnTimeout(List.of(), 150, MILLISECONDS)\` — the page renders without reviews rather than waiting. Third, the price call got \`orTimeout(300, MILLISECONDS)\` plus \`exceptionally\` returning a cached price, and a \`whenComplete\` that recorded latency and the unwrapped cause of failures in metrics. p99 dropped to about 180 ms. A year later, after moving to Java 21, a new team member rewrote a similar endpoint with virtual threads and plain blocking calls, finding it easier to debug — both approaches now coexist.`,
    },
    commonMistakes: [
      {
        mistake: 'Running blocking calls in supplyAsync without an executor.',
        why: 'They run on the JVM-wide common pool, which has about one thread per core and is shared with parallel streams; a few slow calls starve everything else.',
        fix: 'Always pass an executor for I/O: a bounded pool, or Executors.newVirtualThreadPerTaskExecutor() on Java 21+.',
        code: `CompletableFuture.supplyAsync(() -> http.get(url));          // common pool
CompletableFuture.supplyAsync(() -> http.get(url), ioPool);  // dedicated executor`,
      },
      {
        mistake: 'Using thenApply when the function returns a future.',
        why: 'The result is CompletableFuture<CompletableFuture<T>>; callers have to join twice and failure handling gets confusing.',
        fix: 'Use thenCompose whenever the next step is itself asynchronous.',
      },
      {
        mistake: 'Checking ex instanceof MyException directly in exceptionally or handle.',
        why: 'Failures that pass through a dependent stage, or come from a throwing supplier, are wrapped in CompletionException, so the check silently fails.',
        fix: 'Unwrap first: Throwable cause = ex instanceof CompletionException && ex.getCause() != null ? ex.getCause() : ex;',
      },
      {
        mistake: 'Expecting whenComplete to recover from a failure.',
        why: 'whenComplete only observes; its returned future completes with the same value or exception.',
        fix: 'Use exceptionally or handle to produce a fallback; keep whenComplete for logging and metrics.',
      },
      {
        mistake: 'Calling join() after every step, or forgetting the future entirely.',
        why: 'Joining after each step makes the code sequential again; never joining (or never attaching a handler) means failures disappear silently.',
        fix: 'Build the whole pipeline, join once at the edge (or return the future to the caller), and always attach failure handling.',
      },
    ],
    checks: [
      {
        id: 'cc5-c1',
        kind: 'predict-output',
        dimension: 'coding',
        prompt: 'What does this program print?',
        code: `import java.util.concurrent.CompletableFuture;

public class Main {
    public static void main(String[] args) {
        CompletableFuture<Integer> f = CompletableFuture.completedFuture(5);
        CompletableFuture<CompletableFuture<Integer>> nested =
            f.thenApply(x -> CompletableFuture.completedFuture(x * 2));
        CompletableFuture<Integer> flat =
            f.thenCompose(x -> CompletableFuture.completedFuture(x * 2));
        System.out.println(nested.join().join() + " " + flat.join());
        System.out.println(f.thenCombine(flat, Integer::sum).join());
    }
}`,
        options: [
          { id: 'a', text: '10 10\n15' },
          { id: 'b', text: '10 10\n20' },
          { id: 'c', text: '5 10\n15' },
          { id: 'd', text: 'Compile error: thenApply cannot return a future' },
        ],
        correctOptionId: 'a',
        explanation: 'thenApply wraps whatever the function returns, so returning a future yields a nested future that needs two joins. thenCompose flattens it. thenCombine adds 5 and 10.',
      },
      {
        id: 'cc5-c2',
        kind: 'predict-output',
        dimension: 'debugging',
        prompt: 'What does this program print?',
        code: `import java.util.concurrent.CompletableFuture;

public class Main {
    public static void main(String[] args) {
        CompletableFuture<Integer> ok = CompletableFuture.completedFuture(1);
        CompletableFuture<Integer> bad = CompletableFuture.failedFuture(new IllegalStateException("x"));
        System.out.println(ok.exceptionally(ex -> 0).join());
        System.out.println(ok.handle((v, ex) -> v + 10).join());
        System.out.println(bad.handle((v, ex) -> ex.getClass().getSimpleName()).join());
        System.out.println(bad.thenApply(v -> v * 2).handle((v, ex) -> ex.getClass().getSimpleName()).join());
    }
}`,
        options: [
          { id: 'a', text: '0\n11\nIllegalStateException\nIllegalStateException' },
          { id: 'b', text: '1\n11\nIllegalStateException\nCompletionException' },
          { id: 'c', text: '1\n11\nCompletionException\nCompletionException' },
          { id: 'd', text: '1\n1\nIllegalStateException\nCompletionException' },
        ],
        correctOptionId: 'b',
        explanation: 'exceptionally does nothing on success, so 1 passes through. handle always runs and may change the result (11). A future completed directly with failedFuture exposes the raw exception to its own handlers, but once the failure passes through a dependent stage (thenApply) it arrives wrapped in CompletionException — which is why handlers should unwrap.',
      },
      {
        id: 'cc5-c3',
        kind: 'predict-output',
        dimension: 'runtime',
        prompt: 'What does this program print?',
        code: `import java.util.concurrent.CompletableFuture;

public class Main {
    public static void main(String[] args) {
        CompletableFuture<String> f = CompletableFuture.completedFuture("a")
            .whenComplete((v, ex) -> System.out.print("saw " + v + " "))
            .thenApply(v -> v + "b");
        System.out.println(f.join());
    }
}`,
        options: [
          { id: 'a', text: 'saw a ab' },
          { id: 'b', text: 'ab' },
          { id: 'c', text: 'saw ab ab' },
          { id: 'd', text: 'saw a a' },
        ],
        correctOptionId: 'a',
        explanation: 'The source is already complete, so the non-async whenComplete callback runs immediately on the calling thread and prints "saw a ". whenComplete passes the value through unchanged, and thenApply appends "b".',
      },
      {
        id: 'cc5-c4',
        kind: 'mcq',
        dimension: 'conceptual',
        prompt: 'A service calls `CompletableFuture.supplyAsync(() -> jdbcQuery())` (no executor) for every request. Under load, unrelated parallel streams in the same JVM become very slow. Why?',
        options: [
          { id: 'a', text: 'CompletableFuture creates a new platform thread per call, exhausting memory' },
          { id: 'b', text: 'Both use the shared ForkJoinPool common pool, whose few workers are now blocked on JDBC' },
          { id: 'c', text: 'JDBC drivers disable parallel streams' },
          { id: 'd', text: 'supplyAsync runs on the calling thread, so requests serialise' },
        ],
        correctOptionId: 'b',
        explanation: 'Without an executor, async methods use ForkJoinPool.commonPool() (about cores - 1 workers). Blocked workers cannot run parallel-stream tasks. Pass a dedicated executor or a virtual-thread executor for I/O.',
      },
      {
        id: 'cc5-c5',
        kind: 'multi-select',
        dimension: 'interview',
        prompt: 'Which statements are true? Select all that apply.',
        options: [
          { id: 'a', text: 'join() throws an unchecked CompletionException; get() throws a checked ExecutionException.' },
          { id: 'b', text: 'orTimeout and completeOnTimeout were added in Java 9.' },
          { id: 'c', text: 'thenApply(fn) always runs fn on a common-pool thread.' },
          { id: 'd', text: 'cancel(true) on a CompletableFuture does not interrupt the thread running the task.' },
          { id: 'e', text: 'allOf returns a CompletableFuture<List<T>> containing every result.' },
        ],
        correctOptionIds: ['a', 'b', 'd'],
        explanation: 'Non-async thenApply runs on the thread that completed the previous stage, or on the caller if it was already complete; only the *Async variants hand work to an executor. allOf returns CompletableFuture<Void>; you read each result with join() afterwards.',
      },
      {
        id: 'cc5-c6',
        kind: 'mcq',
        dimension: 'interview',
        prompt: 'An interviewer asks: "Can I use StructuredTaskScope in production on Java 25 instead of CompletableFuture.allOf?" What is the accurate answer?',
        options: [
          { id: 'a', text: 'Yes, structured concurrency became final in Java 21 together with virtual threads' },
          { id: 'b', text: 'It is still a preview API in Java 25: it requires --enable-preview and its API may change, so most teams use virtual threads with an ExecutorService or CompletableFuture today' },
          { id: 'c', text: 'It was removed in Java 25' },
          { id: 'd', text: 'It only works with platform threads' },
        ],
        correctOptionId: 'b',
        explanation: 'Virtual threads are final in 21, but structured concurrency has stayed in preview (its API was reshaped in Java 25). Preview features are not standard Java.',
      },
    ],
    challengeIds: [],
    masteryCriteria: [
      'Build an async pipeline on an explicit executor that fans out, combines results and joins once.',
      'Choose thenApply vs thenCompose vs thenCombine vs allOf/anyOf correctly.',
      'Handle failures with exceptionally/handle/whenComplete and unwrap CompletionException.',
      'Add timeouts and fallbacks, and explain when virtual threads are the simpler choice.',
    ],
    relatedLessonIds: ['cc-threads', 'cc-forkjoin-parallel', 'cc-synchronization', 'cc-concurrency-utilities', 'fn-lambdas'],
    revision: [
      { id: 'r1', question: 'thenApply vs thenCompose?', answer: 'thenApply maps the value with a plain function; thenCompose is for functions that return another CompletionStage and flattens it (like flatMap).' },
      { id: 'r2', question: 'Which executor does supplyAsync use without an argument, and why does it matter?', answer: 'ForkJoinPool.commonPool() (or a thread per task if its parallelism is below 2). It is small and JVM-wide, so blocking I/O there starves parallel streams and other async code.' },
      { id: 'r3', question: 'exceptionally vs handle vs whenComplete?', answer: 'exceptionally runs only on failure and supplies a value; handle always runs and can change the result; whenComplete always runs but only observes — the original outcome continues.' },
      { id: 'r4', question: 'Why do handlers often receive CompletionException?', answer: 'A throwing supplier or a failure passing through a dependent stage is wrapped in CompletionException; the original is getCause(). Unwrap before inspecting.' },
      { id: 'r5', question: 'orTimeout vs completeOnTimeout?', answer: 'Both since Java 9. orTimeout fails the future with TimeoutException; completeOnTimeout completes it with a default value. Neither stops the underlying work.' },
    ],
  },
];
