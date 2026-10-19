import type { CurriculumModule } from '@/types/curriculum';

export const functionalModule: CurriculumModule = {
  id: 'functional',
  order: 7,
  title: 'Lambdas, Streams and Modern Java',
  shortTitle: 'Lambdas & Streams',
  summary: 'Functional interfaces and lambdas, stream pipelines and collectors, Optional, and a tour of modern Java from 8 to 21.',
  level: 'core',
  prerequisites: ['collections'],
  bossChallengeId: 'boss-sales-analytics',
  lessons: [
    // -----------------------------------------------------------------------
    {
      id: 'fn-lambdas',
      moduleId: 'functional',
      title: 'Lambdas, functional interfaces and method references',
      summary: 'Passing behaviour as data: the java.util.function toolkit, captured variables and the four kinds of method references.',
      estimatedMinutes: 30,
      difficulty: 'intermediate',
      prerequisites: ['o-interfaces', 't-generics'],
      versionNotes: [{ feature: 'Lambdas, method references, java.util.function', since: 8 }],
      objectives: [
        'Write lambdas for the core functional interfaces.',
        'Compose functions and predicates.',
        'Use the four kinds of method references.',
        'Explain effectively final capture and `this` inside lambdas.',
      ],
      plainEnglish: `A **lambda** is a small, anonymous function you can pass around like a value: \`x -> x * 2\` means "given x, return x times two".

Lambdas fill in **functional interfaces** — interfaces with exactly one abstract method. Java provides the common ones in \`java.util.function\`: \`Function\` (takes one value, returns one), \`Predicate\` (returns true/false), \`Supplier\` (returns a value from nothing), \`Consumer\` (takes a value, returns nothing).

A **method reference** like \`String::toUpperCase\` is a shorter way to write a lambda that just calls an existing method.`,
      technical: `### Functional interfaces
Any interface with a single abstract method (SAM) can be the target of a lambda; \`@FunctionalInterface\` makes the compiler enforce it. Core types: \`Function<T,R>\`, \`BiFunction<T,U,R>\`, \`UnaryOperator<T>\`, \`BinaryOperator<T>\`, \`Predicate<T>\`, \`Supplier<T>\`, \`Consumer<T>\`, plus primitive specialisations (\`IntPredicate\`, \`ToIntFunction\`, …) that avoid boxing. Older SAM types (\`Runnable\`, \`Callable\`, \`Comparator\`) work too.

### Composition
\`f.andThen(g)\` runs f then g; \`f.compose(g)\` runs g then f. \`Predicate\` has \`and\`, \`or\`, \`negate\` and \`Predicate.not(...)\` (Java 11).

### Captured variables
A lambda may read local variables from the enclosing scope only if they are **effectively final** (never reassigned). The value is captured, so the rule avoids confusing races on locals. Fields can be read and written (they live on the heap) — which is why mutating shared fields from lambdas run in parallel is a bug magnet.

### this
Inside a lambda, \`this\` refers to the enclosing instance; a lambda does not introduce a new scope. Inside an anonymous class, \`this\` is the anonymous object.

### Method references
1. Static: \`Integer::parseInt\` → \`s -> Integer.parseInt(s)\`
2. Bound instance: \`prefix::concat\` → \`s -> prefix.concat(s)\`
3. Unbound instance: \`String::length\` → \`s -> s.length()\`
4. Constructor: \`ArrayList::new\` → \`() -> new ArrayList<>()\`

### Implementation
Lambdas compile to \`invokedynamic\` call sites; \`LambdaMetafactory\` generates an implementation class at first use. Non-capturing lambdas are typically allocated once and reused.`,
      whyItExists: `Passing behaviour — a sort order, a filter, a callback — previously required verbose anonymous classes. Lambdas make APIs like streams, CompletableFuture and comparators practical and readable.`,
      whenToUse: [
        'Use lambdas for short, single-purpose behaviour passed to APIs.',
        'Use method references when they read more clearly than the lambda.',
        'Use primitive functional interfaces in hot paths to avoid boxing.',
      ],
      whenNotToUse: [
        'Do not write multi-line lambdas with complex logic — extract a named method and reference it.',
        'Do not mutate captured state (fields, collections) from lambdas, especially in parallel code.',
        'Do not create your own functional interface when a java.util.function type fits.',
      ],
      examples: [
        {
          id: 'toolkit',
          title: 'The functional toolkit',
          runnable: true,
          code: `import java.util.*;
import java.util.function.*;

public class Main {
    public static void main(String[] args) {
        Function<String, String> trim = String::strip;              // unbound instance method
        Function<String, String> upper = s -> s.toUpperCase(Locale.ROOT);
        Function<String, Integer> length = String::length;
        System.out.println(trim.andThen(upper).apply("  java  "));
        System.out.println(trim.andThen(length).apply("  java  "));

        Predicate<String> blank = String::isBlank;
        Predicate<String> shortWord = s -> s.length() < 4;
        List<String> words = List.of("stream", " ", "map", "lambda", "", "io");
        System.out.println(words.stream().filter(Predicate.not(blank).and(shortWord)).toList());

        Supplier<List<String>> factory = ArrayList::new;             // constructor reference
        List<String> fresh = factory.get();
        String prefix = "jf-";
        Function<String, String> tag = prefix::concat;                // bound instance method
        Function<String, Integer> parse = Integer::parseInt;          // static method
        fresh.add(tag.apply("42"));
        System.out.println(fresh + " " + (parse.apply("40") + 2));

        BinaryOperator<Integer> max = BinaryOperator.maxBy(Comparator.naturalOrder());
        System.out.println(max.apply(3, 9));
    }
}`,
          expectedOutput: `JAVA
4
[map, io]
[jf-42] 42
9`,
        },
        {
          id: 'capture',
          title: 'Capture rules and this',
          runnable: true,
          code: `public class Main {
    private final String name = "outer instance";
    private int counter = 0;

    void demo() {
        int base = 10;                     // effectively final: never reassigned
        Runnable lambda = () -> {
            counter++;                     // fields may be modified
            System.out.println("lambda sees this.name = " + this.name + ", base = " + base);
        };
        Runnable anonymous = new Runnable() {
            private final String name = "anonymous object";
            @Override
            public void run() {
                System.out.println("anonymous class sees this.name = " + this.name);
            }
        };
        lambda.run();
        anonymous.run();
        System.out.println("counter = " + counter);
    }

    public static void main(String[] args) {
        new Main().demo();
    }
}`,
          expectedOutput: `lambda sees this.name = outer instance, base = 10
anonymous class sees this.name = anonymous object
counter = 1`,
        },
      ],
      walkthrough: {
        exampleId: 'toolkit',
        steps: [
          { lines: [6, 8], text: 'Three Function values: two method references and one lambda. The type on the left tells the compiler which interface the lambda implements.' },
          { lines: [9, 10], text: 'andThen chains functions left to right: strip first, then uppercase (or length).' },
          { lines: [12, 15], text: 'Predicates compose with not/and/or. The filter keeps non-blank words shorter than 4 characters.' },
          { lines: [17, 23], text: 'Constructor, bound and static method references. `prefix::concat` captures the prefix object.' },
          { lines: [25, 26], text: 'BinaryOperator.maxBy builds a two-argument function from a Comparator.' },
        ],
      },
      realWorld: {
        title: 'Pluggable validation rules',
        scenario: `A KYC (know-your-customer) service had a 400-line method of nested ifs. Each country added more branches. The team modelled each rule as a \`Predicate<Application>\` with a message, kept them in a \`Map<Country, List<Rule>>\`, and evaluated them with a simple loop.

New rules became one-line lambdas or small named methods referenced with \`::\`, unit tests targeted rules individually, and the compliance team could review a readable list of rules per country.`,
      },
      commonMistakes: [
        {
          mistake: 'Modifying a local counter from a lambda.',
          why: 'Captured locals must be effectively final; the code will not compile.',
          fix: 'Use a stream reduction (count, sum) instead of manual counting, or an AtomicInteger if you truly need shared mutable state.',
        },
        {
          mistake: 'Confusing andThen and compose.',
          why: 'f.compose(g) runs g first — the opposite of reading order.',
          fix: 'Prefer andThen, which reads left to right.',
        },
        {
          mistake: 'Writing large lambdas inline.',
          why: 'Stack traces show lambda$main$0 and the logic is hard to test or reuse.',
          fix: 'Extract a well-named private method and pass a method reference.',
        },
      ],
      checks: [
        {
          id: 'fn1-c1',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this print?',
          code: `import java.util.function.Function;

public class Main {
    public static void main(String[] args) {
        Function<Integer, Integer> plus2 = x -> x + 2;
        Function<Integer, Integer> times3 = x -> x * 3;
        System.out.println(plus2.andThen(times3).apply(1) + " " + plus2.compose(times3).apply(1));
    }
}`,
          options: [
            { id: 'a', text: '9 5' },
            { id: 'b', text: '5 9' },
            { id: 'c', text: '9 9' },
            { id: 'd', text: '5 5' },
          ],
          correctOptionId: 'a',
          explanation: 'andThen: (1 + 2) × 3 = 9. compose: plus2(times3(1)) = 3 + 2 = 5.',
        },
        {
          id: 'fn1-c2',
          kind: 'predict-output',
          dimension: 'conceptual',
          prompt: 'What happens when you compile this?',
          code: `import java.util.List;

public class Main {
    public static void main(String[] args) {
        int total = 0;
        List.of(1, 2, 3).forEach(n -> total += n);
        System.out.println(total);
    }
}`,
          options: [
            { id: 'a', text: '6' },
            { id: 'b', text: '0' },
            { id: 'c', text: 'Compile error: local variables referenced from a lambda must be final or effectively final' },
          ],
          correctOptionId: 'c',
          expectCompileError: true,
          explanation: 'Use `int total = List.of(1, 2, 3).stream().mapToInt(Integer::intValue).sum();` instead.',
        },
        {
          id: 'fn1-c3',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'Which functional interface fits a method that takes an Order and returns whether it is eligible for free shipping?',
          options: [
            { id: 'a', text: 'Supplier<Order>' },
            { id: 'b', text: 'Consumer<Order>' },
            { id: 'c', text: 'Predicate<Order>' },
            { id: 'd', text: 'Function<Boolean, Order>' },
          ],
          correctOptionId: 'c',
          explanation: 'A Predicate<T> takes a T and returns boolean.',
        },
        {
          id: 'fn1-c4',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'What kind of method reference is `String::length` used as a Function<String, Integer>?',
          options: [
            { id: 'a', text: 'Static method reference' },
            { id: 'b', text: 'Bound instance method reference' },
            { id: 'c', text: 'Unbound instance method reference — the receiver is the function\'s argument' },
            { id: 'd', text: 'Constructor reference' },
          ],
          correctOptionId: 'c',
          explanation: 'It means s -> s.length(): the String to call length() on is supplied when the function is applied.',
        },
      ],
      challengeIds: ['ch-text-pipeline'],
      masteryCriteria: [
        'Pick the right java.util.function type for a given signature.',
        'Compose functions and predicates and predict the order.',
        'Explain capture rules and `this` in lambdas vs anonymous classes.',
      ],
      relatedLessonIds: ['fn-streams', 'o-interfaces'],
      revision: [
        { id: 'r1', question: 'What is a functional interface?', answer: 'An interface with exactly one abstract method, so a lambda or method reference can implement it.' },
        { id: 'r2', question: 'Name the four kinds of method references.', answer: 'Static (Integer::parseInt), bound instance (obj::method), unbound instance (String::length), constructor (ArrayList::new).' },
        { id: 'r3', question: 'Why must captured locals be effectively final?', answer: 'Lambdas capture the value; allowing reassignment would make it ambiguous which value is seen and invite races, so the language forbids it.' },
      ],
    },

    // -----------------------------------------------------------------------
    {
      id: 'fn-streams',
      moduleId: 'functional',
      title: 'Streams, collectors and laziness',
      summary: 'Declarative data processing: pipelines, lazy evaluation, grouping and the pitfalls of side effects and parallelism.',
      estimatedMinutes: 45,
      difficulty: 'intermediate',
      prerequisites: ['fn-lambdas', 'c-collections-overview'],
      versionNotes: [
        { feature: 'Streams API', since: 8 },
        { feature: 'takeWhile, dropWhile, iterate with predicate', since: 9 },
        { feature: 'Stream.toList()', since: 16 },
        { feature: 'Stream gatherers', since: 24, note: 'Final in Java 24 (JEP 485)' },
      ],
      objectives: [
        'Build pipelines from a source, intermediate operations and a terminal operation.',
        'Explain laziness, short-circuiting and element-by-element processing.',
        'Use groupingBy, partitioningBy, toMap and joining.',
        'Avoid side effects, stream reuse and careless parallelism.',
      ],
      plainEnglish: `A **stream** describes *what* to do with a sequence of data, not *how* to loop: "take the orders, keep the paid ones, get their totals, add them up".

A pipeline has three parts:
1. a **source** (a collection, an array, a range of numbers),
2. zero or more **intermediate** steps (\`filter\`, \`map\`, \`sorted\`…), and
3. one **terminal** step that produces a result (\`toList\`, \`sum\`, \`count\`, \`collect\`…).

Nothing happens until the terminal step runs — streams are **lazy**.`,
      technical: `### Laziness and fusion
Intermediate operations only build the pipeline. The terminal operation pulls elements through **one at a time**: each element goes through filter → map → ... before the next one starts. Short-circuiting operations (\`findFirst\`, \`anyMatch\`, \`limit\`) stop early, so a pipeline over a huge or infinite source can finish quickly. Stateful operations (\`sorted\`, \`distinct\`) must see all elements first.

### Collectors
- \`Collectors.groupingBy(classifier, downstream)\` → \`Map<K, ...>\`; downstreams: \`counting()\`, \`summingInt\`, \`averagingDouble\`, \`mapping\`, \`toSet\`, \`maxBy\`. Pass a map factory (\`TreeMap::new\`) for sorted keys.
- \`partitioningBy(predicate)\` → \`Map<Boolean, List<T>>\`.
- \`toMap(key, value)\` throws \`IllegalStateException\` on duplicate keys unless you pass a merge function.
- \`joining(", ", "[", "]")\`.
- \`teeing\` (Java 12) combines two collectors.

### Primitive streams
\`IntStream\`/\`LongStream\`/\`DoubleStream\` avoid boxing and offer \`sum\`, \`average\` (returns OptionalDouble), \`summaryStatistics\`, \`range\`/\`rangeClosed\`. Convert with \`mapToInt\` and \`boxed\`.

### Rules
- A stream can be consumed only once (\`IllegalStateException: stream has already been operated upon or closed\`).
- Operations should be **non-interfering** (don't modify the source) and **stateless/side-effect free**. Use collectors, not \`forEach\` adding to an external list.
- \`Stream.toList()\` returns an unmodifiable list; \`Collectors.toList()\` makes no guarantee (currently ArrayList).
- **Parallel streams** use the common ForkJoinPool. They help only for large, CPU-bound, easily splittable workloads with no shared mutable state; they hurt for small inputs, I/O, or ordered operations. Never call blocking I/O inside them on a server.`,
      whyItExists: `Streams express data transformations declaratively, which is usually shorter and clearer than nested loops, and lets the library optimise execution (short-circuiting, fusion, optional parallelism).`,
      whenToUse: [
        'Use streams for transformations, filtering, grouping and aggregation of collections.',
        'Use primitive streams for numeric aggregation.',
        'Use collectors with explicit map factories when order matters.',
      ],
      whenNotToUse: [
        'Do not force complex control flow (early returns, checked exceptions, multiple accumulators) into streams — a loop can be clearer.',
        'Do not use peek or forEach for business side effects.',
        'Do not use parallel() without measuring.',
      ],
      examples: [
        {
          id: 'pipeline',
          title: 'Pipelines and collectors on real data',
          runnable: true,
          code: `import java.util.*;
import java.util.stream.*;

public class Main {
    record Order(String id, String customer, String region, int cents, boolean paid) {}

    public static void main(String[] args) {
        List<Order> orders = List.of(
            new Order("o1", "ann", "EU", 4_000, true),
            new Order("o2", "bob", "US", 12_500, true),
            new Order("o3", "ann", "EU", 900, false),
            new Order("o4", "cid", "APAC", 7_200, true),
            new Order("o5", "bob", "US", 3_100, true),
            new Order("o6", "dee", "EU", 15_000, true));

        int paidTotal = orders.stream().filter(Order::paid).mapToInt(Order::cents).sum();
        System.out.println("paid total: " + paidTotal);

        Map<String, Integer> byRegion = orders.stream().filter(Order::paid)
            .collect(Collectors.groupingBy(Order::region, TreeMap::new, Collectors.summingInt(Order::cents)));
        System.out.println(byRegion);

        Map<String, Long> ordersPerCustomer = orders.stream()
            .collect(Collectors.groupingBy(Order::customer, TreeMap::new, Collectors.counting()));
        System.out.println(ordersPerCustomer);

        Map<Boolean, List<String>> bigOrSmall = orders.stream()
            .collect(Collectors.partitioningBy(o -> o.cents() >= 10_000,
                     Collectors.mapping(Order::id, Collectors.toList())));
        System.out.println(bigOrSmall);

        String topTwo = orders.stream()
            .sorted(Comparator.comparingInt(Order::cents).reversed())
            .limit(2)
            .map(o -> o.id() + "=" + o.cents())
            .collect(Collectors.joining(", ", "[", "]"));
        System.out.println(topTwo);

        IntSummaryStatistics stats = orders.stream().mapToInt(Order::cents).summaryStatistics();
        System.out.println(stats.getMin() + " " + stats.getMax() + " " + stats.getAverage());
    }
}`,
          expectedOutput: `paid total: 41800
{APAC=7200, EU=19000, US=15600}
{ann=2, bob=2, cid=1, dee=1}
{false=[o1, o3, o4, o5], true=[o2, o6]}
[o6=15000, o2=12500]
900 15000 7116.666666666667`,
        },
        {
          id: 'laziness',
          title: 'Laziness and element-by-element processing',
          runnable: true,
          code: `import java.util.stream.*;

public class Main {
    public static void main(String[] args) {
        Stream<String> pipeline = Stream.of("a", "bb", "ccc", "dddd")
            .peek(s -> System.out.println("source " + s))
            .filter(s -> s.length() >= 2)
            .map(String::toUpperCase);
        System.out.println("pipeline built, nothing ran yet");

        String first = pipeline.findFirst().orElse("none");
        System.out.println("result " + first);

        Stream<Integer> once = Stream.of(1, 2, 3);
        once.count();
        try {
            once.count();
        } catch (IllegalStateException e) {
            System.out.println("reuse: " + e.getMessage());
        }
    }
}`,
          expectedOutput: `pipeline built, nothing ran yet
source a
source bb
result BB
reuse: stream has already been operated upon or closed`,
          explanation: 'peek is used here only to observe evaluation order; do not use it for real logic.',
        },
      ],
      walkthrough: {
        exampleId: 'laziness',
        steps: [
          { lines: [5, 8], text: 'Building the pipeline runs nothing: peek, filter and map are lazy intermediate operations.' },
          { lines: [9, 9], text: 'This line prints first, proving no element has been processed yet.' },
          { lines: [11, 11], text: 'findFirst is the terminal operation. It pulls "a" through: peek prints it, filter rejects it.' },
          { lines: [11, 12], text: 'Then "bb" passes filter and map, findFirst gets "BB" and short-circuits — "ccc" and "dddd" are never touched.' },
          { lines: [14, 20], text: 'A stream is single-use. The second terminal operation throws IllegalStateException.' },
        ],
      },
      realWorld: {
        title: 'A parallel stream that slowed the whole server',
        scenario: `To "speed up" an endpoint, a developer added \`.parallel()\` to a stream that called a remote pricing API for each item. Parallel streams run on the JVM-wide common ForkJoinPool, sized to the CPU count. Under load, every request's blocking HTTP calls occupied those few threads, starving every other parallel stream and CompletableFuture in the process, and latency for unrelated endpoints spiked.

Removing \`.parallel()\` and using a bounded executor (or virtual threads, in Java 21) for the remote calls fixed it. Parallel streams are for CPU-bound work on large in-memory data, not I/O.`,
      },
      commonMistakes: [
        {
          mistake: 'Collecting with forEach and an external list.',
          why: 'It is a side effect, breaks in parallel and is less clear.',
          fix: 'Use collect(Collectors.toList()) or toList().',
        },
        {
          mistake: 'toMap without a merge function on data that can have duplicate keys.',
          why: 'It throws IllegalStateException: Duplicate key.',
          fix: 'Pass a merge function, or use groupingBy.',
        },
        {
          mistake: 'Calling get() on the Optional from max/findFirst without checking.',
          why: 'Empty input throws NoSuchElementException.',
          fix: 'Use orElse, orElseThrow with a message, or ifPresent.',
        },
      ],
      checks: [
        {
          id: 'fn2-c1',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this print?',
          code: `import java.util.stream.*;

public class Main {
    public static void main(String[] args) {
        Stream.of(3, 1, 2)
            .filter(n -> {
                System.out.print("f" + n + " ");
                return n > 1;
            })
            .map(n -> {
                System.out.print("m" + n + " ");
                return n * 10;
            });
        System.out.println("done");
    }
}`,
          options: [
            { id: 'a', text: 'f3 m3 f1 f2 m2 done' },
            { id: 'b', text: 'f3 f1 f2 m3 m2 done' },
            { id: 'c', text: 'done' },
            { id: 'd', text: 'Compile error' },
          ],
          correctOptionId: 'c',
          explanation: 'There is no terminal operation, so the pipeline never runs.',
        },
        {
          id: 'fn2-c2',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this print?',
          code: `import java.util.stream.*;

public class Main {
    public static void main(String[] args) {
        long n = Stream.of(3, 1, 2)
            .filter(x -> {
                System.out.print("f" + x + " ");
                return x > 1;
            })
            .map(x -> {
                System.out.print("m" + x + " ");
                return x * 10;
            })
            .count();
        System.out.println("= " + n);
    }
}`,
          options: [
            { id: 'a', text: 'f3 m3 f1 f2 m2 = 2' },
            { id: 'b', text: 'f3 f1 f2 m3 m2 = 2' },
            { id: 'c', text: 'f3 f1 f2 = 2' },
            { id: 'd', text: '= 2' },
          ],
          correctOptionId: 'a',
          explanation:
            'Elements flow one at a time: 3 passes the filter and is mapped before 1 is even looked at. Since Java 9, count() may skip the pipeline entirely when the size is known in advance (e.g. list.stream().map(...).count() never calls map) — but a filter makes the size unknown, so every element is traversed. Never put required side effects in stream lambdas.',
          hints: ['Is the work done stage by stage for all elements, or element by element?'],
        },
        {
          id: 'fn2-c3',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this print?',
          code: `import java.util.*;
import java.util.stream.*;

public class Main {
    public static void main(String[] args) {
        Map<Integer, List<String>> byLength = Stream.of("kiwi", "fig", "pear", "plum", "date")
            .collect(Collectors.groupingBy(String::length, TreeMap::new, Collectors.toList()));
        System.out.println(byLength);
    }
}`,
          options: [
            { id: 'a', text: '{3=[fig], 4=[kiwi, pear, plum, date]}' },
            { id: 'b', text: '{4=[kiwi, pear, plum, date], 3=[fig]}' },
            { id: 'c', text: '{3=[fig], 4=[date, kiwi, pear, plum]}' },
            { id: 'd', text: '{fig=3, kiwi=4}' },
          ],
          correctOptionId: 'a',
          explanation: 'TreeMap sorts the keys; each group keeps the encounter order of the source.',
        },
        {
          id: 'fn2-c4',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this print?',
          code: `import java.util.*;
import java.util.stream.*;

public class Main {
    public static void main(String[] args) {
        List<String> names = Stream.of("b", "a").toList();
        try {
            names.add("c");
            System.out.println(names);
        } catch (UnsupportedOperationException e) {
            System.out.println("unmodifiable");
        }
    }
}`,
          options: [
            { id: 'a', text: '[b, a, c]' },
            { id: 'b', text: 'unmodifiable' },
            { id: 'c', text: '[a, b, c]' },
          ],
          correctOptionId: 'b',
          explanation: 'Stream.toList() (Java 16) returns an unmodifiable list.',
        },
        {
          id: 'fn2-c5',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'When is `.parallel()` most likely to help?',
          options: [
            { id: 'a', text: 'Calling a REST API for each of 20 items in a web request' },
            { id: 'b', text: 'Summing a CPU-heavy computation over 50 million array elements on a multi-core machine' },
            { id: 'c', text: 'Processing 10 elements' },
            { id: 'd', text: 'Writing lines to a file in order' },
          ],
          correctOptionId: 'b',
          explanation: 'Parallel streams pay off for large, splittable, CPU-bound work with no shared state. I/O and small inputs make them slower or harmful.',
        },
      ],
      challengeIds: ['ch-stream-report'],
      masteryCriteria: [
        'Predict evaluation order and short-circuiting in a pipeline.',
        'Write grouping/partitioning/joining collectors fluently.',
        'Judge when a loop or a sequential stream beats a parallel one.',
      ],
      relatedLessonIds: ['fn-lambdas', 'fn-optional-modern', 'cc-threads'],
      revision: [
        { id: 'r1', question: 'What makes a stream run?', answer: 'A terminal operation. Intermediate operations are lazy and only describe the pipeline.' },
        { id: 'r2', question: 'What happens with toMap and duplicate keys?', answer: 'IllegalStateException unless you pass a merge function (or use groupingBy).' },
        { id: 'r3', question: 'Why are parallel streams dangerous on servers?', answer: 'They share the JVM-wide common ForkJoinPool; blocking work or many concurrent requests starve it, hurting unrelated code.' },
      ],
    },

    // -----------------------------------------------------------------------
    {
      id: 'fn-optional-modern',
      moduleId: 'functional',
      title: 'Optional and modern Java from 8 to 21',
      summary: 'Using Optional well, and the language features that changed how idiomatic Java looks.',
      estimatedMinutes: 35,
      difficulty: 'intermediate',
      prerequisites: ['fn-streams', 't-modern-types'],
      versionNotes: [
        { feature: 'Optional', since: 8 },
        { feature: 'Optional.ifPresentOrElse, or, stream', since: 9 },
        { feature: 'Optional.isEmpty, orElseThrow()', since: 11 },
        { feature: 'Records', since: 16 },
        { feature: 'Sealed types', since: 17 },
        { feature: 'Pattern matching for switch, record patterns, sequenced collections, virtual threads', since: 21 },
      ],
      objectives: [
        'Use Optional for return values that may be absent, and avoid its anti-patterns.',
        'Know the difference between orElse and orElseGet.',
        'Recognise and choose modern Java features by version.',
      ],
      plainEnglish: `\`Optional<T>\` is a box that either contains a value or is empty. Returning \`Optional<Customer>\` from \`findByEmail\` tells callers clearly: "there may be no customer — deal with it", instead of returning a surprise \`null\`.

Java has also changed a lot since Java 8. Records, switch expressions, text blocks, pattern matching and virtual threads make modern Java far more concise than the Java many tutorials still teach.`,
      technical: `### Optional
- Create: \`Optional.of(v)\` (v must not be null), \`Optional.ofNullable(v)\`, \`Optional.empty()\`.
- Transform: \`map\` (a null result becomes empty), \`flatMap\` (when the function returns Optional), \`filter\`.
- Extract: \`orElse(default)\`, \`orElseGet(supplier)\`, \`orElseThrow()\`/\`orElseThrow(supplier)\`, \`ifPresent\`, \`ifPresentOrElse\`.
- **orElse evaluates its argument eagerly** — even when a value is present. If the default is expensive (a database call), use \`orElseGet\`.

### Anti-patterns
- Optional fields, parameters or collection elements — Optional is designed for return types and is not Serializable.
- \`opt.isPresent() ? opt.get() : x\` — use \`orElse\`.
- \`Optional<List<T>>\` — return an empty list instead.
- Returning null from a method declared to return Optional.

### Modern Java highlights (LTS releases)
- **11**: \`var\` in lambdas, \`String.strip/isBlank/lines/repeat\`, \`Files.readString\`, the standard \`HttpClient\`, single-file source launch.
- **17**: records (16), sealed classes, pattern matching for instanceof (16), text blocks (15), switch expressions (14), helpful NPE messages, strong encapsulation of JDK internals.
- **21**: virtual threads, pattern matching for switch and record patterns, sequenced collections, generational ZGC option. (String templates were a preview and were later withdrawn — do not rely on them.)
- **25**: compact source files and instance main methods, flexible constructor bodies, scoped values, module import declarations.
- **26 and 27** (non-LTS): HTTP/3 in HttpClient, Applet API removed, new Math and String helpers; see **Curriculum → Java version updates** for the full, compiler-verified list.

Preview features require \`--enable-preview\` and can change or be removed; production code should use finalised features only.`,
      whyItExists: `Optional makes absence visible in method signatures, reducing NullPointerExceptions at API boundaries. The later language features remove boilerplate and push towards safer, data-oriented designs.`,
      whenToUse: [
        'Return Optional from lookups that may legitimately find nothing.',
        'Use orElseGet for expensive defaults and orElseThrow for "must exist".',
        'Adopt records, switch expressions and pattern matching once your baseline is Java 17/21.',
      ],
      whenNotToUse: [
        'Do not use Optional for fields, parameters or collections.',
        'Do not use preview features in production code.',
        'Do not wrap every null check in Optional inside a method body when a simple if is clearer.',
      ],
      examples: [
        {
          id: 'optional',
          title: 'Optional done right — and orElse eagerness',
          runnable: true,
          code: `import java.util.*;

public class Main {
    record Address(String city) {}
    record Customer(String email, Address address) {}

    static final Map<String, Customer> DB = Map.of(
        "ada@example.com", new Customer("ada@example.com", new Address("London")),
        "bob@example.com", new Customer("bob@example.com", null));

    static Optional<Customer> findByEmail(String email) {
        return Optional.ofNullable(DB.get(email));
    }

    static String expensiveDefault() {
        System.out.println("  (computing default)");
        return "Unknown";
    }

    public static void main(String[] args) {
        for (String email : List.of("ada@example.com", "bob@example.com", "eve@example.com")) {
            String city = findByEmail(email)
                .map(Customer::address)          // null address -> empty
                .map(Address::city)
                .orElse("no city");
            System.out.println(email + " -> " + city);
        }

        System.out.println("orElse:");
        String a = findByEmail("ada@example.com").map(Customer::email).orElse(expensiveDefault());
        System.out.println("orElseGet:");
        String b = findByEmail("ada@example.com").map(Customer::email).orElseGet(Main::expensiveDefault);
        System.out.println(a.equals(b));

        findByEmail("eve@example.com").ifPresentOrElse(
            c -> System.out.println("found " + c.email()),
            () -> System.out.println("eve not found"));
    }
}`,
          expectedOutput: `ada@example.com -> London
bob@example.com -> no city
eve@example.com -> no city
orElse:
  (computing default)
orElseGet:
true
eve not found`,
        },
        {
          id: 'modern-tour',
          title: 'Modern Java in one program',
          runnable: true,
          minJavaVersion: 21,
          code: `import java.util.*;

public class Main {
    sealed interface Payment permits Card, BankTransfer, Voucher {}
    record Card(String last4, long cents) implements Payment {
        Card {                                         // compact constructor: validation
            if (last4.length() != 4) throw new IllegalArgumentException("last4");
        }
    }
    record BankTransfer(String iban, long cents) implements Payment {}
    record Voucher(String code) implements Payment {}

    static String describe(Payment p) {
        return switch (p) {                            // exhaustive: no default needed
            case Card(var last4, var cents) when cents > 100_000 -> "large card payment ****" + last4;
            case Card c -> "card ****" + c.last4();
            case BankTransfer(var iban, var cents) -> "transfer from " + iban.substring(0, 4) + "...";
            case Voucher(var code) -> "voucher " + code;
        };
    }

    public static void main(String[] args) {
        var payments = new ArrayList<Payment>(List.of(
            new Card("4242", 2_500), new BankTransfer("DE89370400440532013000", 90_000),
            new Card("1881", 250_000), new Voucher("WELCOME10")));
        payments.forEach(p -> System.out.println(describe(p)));

        var report = """
            first: %s
            last:  %s""".formatted(payments.getFirst(), payments.getLast());
        System.out.println(report);
    }
}`,
          expectedOutput: `card ****4242
transfer from DE89...
large card payment ****1881
voucher WELCOME10
first: Card[last4=4242, cents=2500]
last:  Voucher[code=WELCOME10]`,
        },
      ],
      walkthrough: {
        exampleId: 'optional',
        steps: [
          { lines: [11, 13], text: 'The lookup returns Optional, so absence is part of the method\'s contract.' },
          { lines: [21, 25], text: 'map chains transformations; if any step yields null (Bob has no address) the Optional becomes empty instead of throwing.' },
          { lines: [28, 29], text: 'orElse evaluates its argument first, so expensiveDefault runs even though Ada exists.' },
          { lines: [30, 31], text: 'orElseGet takes a Supplier and calls it only when the Optional is empty — nothing is printed.' },
          { lines: [34, 36], text: 'ifPresentOrElse (Java 9) handles both cases without unwrapping.' },
        ],
      },
      realWorld: {
        title: 'A default that hit the database on every request',
        scenario: `A configuration service resolved settings with \`cache.get(key).orElse(loadFromDatabase(key))\`. Monitoring showed one database query per request even though the cache hit rate was 99%: orElse evaluated \`loadFromDatabase\` every time before checking the Optional.

Changing it to \`orElseGet(() -> loadFromDatabase(key))\` cut database load by two orders of magnitude. A static analysis rule now flags method calls inside orElse.`,
      },
      commonMistakes: [
        {
          mistake: 'Using orElse with a method call that has cost or side effects.',
          why: 'The argument is always evaluated.',
          fix: 'Use orElseGet(supplier).',
        },
        {
          mistake: 'Calling get() without checking.',
          why: 'It throws NoSuchElementException when empty — a null pointer by another name.',
          fix: 'Use orElseThrow(() -> new NotFoundException(...)) to make intent explicit.',
        },
        {
          mistake: 'Declaring Optional parameters.',
          why: 'Callers must wrap arguments and can still pass null.',
          fix: 'Overload the method or accept a nullable parameter and document it.',
        },
      ],
      checks: [
        {
          id: 'fn3-c1',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this print?',
          code: `import java.util.Optional;

public class Main {
    static String fallback() {
        System.out.print("fallback ");
        return "F";
    }

    public static void main(String[] args) {
        String a = Optional.of("A").orElse(fallback());
        String b = Optional.of("B").orElseGet(Main::fallback);
        String c = Optional.<String>empty().orElseGet(Main::fallback);
        System.out.println(a + b + c);
    }
}`,
          options: [
            { id: 'a', text: 'ABF' },
            { id: 'b', text: 'fallback ABF' },
            { id: 'c', text: 'fallback fallback ABF' },
            { id: 'd', text: 'fallback fallback fallback ABF' },
          ],
          correctOptionId: 'c',
          explanation: 'orElse evaluates fallback() eagerly even though "A" is present; orElseGet calls it only for the empty Optional.',
        },
        {
          id: 'fn3-c2',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this print?',
          code: `import java.util.Optional;

public class Main {
    public static void main(String[] args) {
        Optional<String> name = Optional.of("  ");
        String result = name.map(String::strip)
                            .filter(s -> !s.isEmpty())
                            .map(String::toUpperCase)
                            .orElse("anonymous");
        System.out.println(result);
    }
}`,
          options: [
            { id: 'a', text: '(two spaces)' },
            { id: 'b', text: 'anonymous' },
            { id: 'c', text: 'Optional.empty' },
            { id: 'd', text: 'NoSuchElementException' },
          ],
          correctOptionId: 'b',
          explanation: 'strip produces "", the filter rejects it, the Optional becomes empty, and orElse supplies the default.',
        },
        {
          id: 'fn3-c3',
          kind: 'multi-select',
          dimension: 'conceptual',
          prompt: 'Which of these are standard (non-preview) in Java 21? Select all that apply.',
          options: [
            { id: 'a', text: 'Virtual threads' },
            { id: 'b', text: 'Pattern matching for switch' },
            { id: 'c', text: 'Records' },
            { id: 'd', text: 'String templates (STR."...")' },
            { id: 'e', text: 'Sequenced collections (getFirst/getLast)' },
          ],
          correctOptionIds: ['a', 'b', 'c', 'e'],
          explanation: 'String templates were only a preview in 21–22 and were withdrawn before becoming final.',
        },
        {
          id: 'fn3-c4',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'Where is Optional most appropriate?',
          options: [
            { id: 'a', text: 'As the type of an entity field that may be null' },
            { id: 'b', text: 'As a method parameter for optional arguments' },
            { id: 'c', text: 'As the return type of a lookup that may find nothing' },
            { id: 'd', text: 'Inside a List<Optional<T>>' },
          ],
          correctOptionId: 'c',
          explanation: 'Optional was designed as a return type that signals possible absence.',
        },
      ],
      challengeIds: ['ch-optional-lookup'],
      masteryCriteria: [
        'Refactor null-check chains into Optional pipelines where it helps.',
        'Explain orElse vs orElseGet with a real consequence.',
        'Name the key features of Java 11, 17 and 21 and avoid preview features in production.',
      ],
      relatedLessonIds: ['t-modern-types', 'fn-streams', 'e-design'],
      revision: [
        { id: 'r1', question: 'orElse vs orElseGet?', answer: 'orElse always evaluates its argument; orElseGet takes a Supplier and calls it only when the Optional is empty.' },
        { id: 'r2', question: 'Where should you not use Optional?', answer: 'Fields, method parameters and collection elements; it is meant for return types.' },
        { id: 'r3', question: 'Name three standard features of Java 21.', answer: 'Virtual threads, pattern matching for switch with record patterns, sequenced collections (and generational ZGC).' },
      ],
    },
  ],
};
