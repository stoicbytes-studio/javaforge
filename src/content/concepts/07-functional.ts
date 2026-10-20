import type { LessonConcepts } from '@/types/curriculum';

/** Concept pages for module 7 (Lambdas, Streams and Modern Java), keyed by lesson id. */
export const functionalConcepts: Record<string, LessonConcepts> = {
  // -------------------------------------------------------------------------
  'fn-lambdas': {
    quick: {
      definition: 'A **lambda** is a short piece of code that you can pass around like a value. It is a quick way to write a small function without a name.',
      points: [
        'The form is `(parameters) -> result`, for example `x -> x * x`.',
        'A lambda works where Java expects a functional interface, which has just one abstract method.',
        '`Function`, `Predicate` and `Runnable` are common functional interfaces.',
        'A lambda can read local variables only if they are never changed after being set.',
        'A method reference like `String::length` is a shorter lambda.',
      ],
      example: {
        title: 'Lambdas in action',
        code: 'import java.util.*;\nimport java.util.function.*;\n\npublic class Main {\n  public static void main(String[] args) {\n    Function<Integer, Integer> square = x -> x * x;\n    System.out.println(square.apply(5));\n\n    List<String> names = new ArrayList<>(List.of("Cara", "Al", "Bob"));\n    names.sort((a, b) -> Integer.compare(a.length(), b.length()));\n    System.out.println(names);\n\n    Runnable hello = () -> System.out.println("Hi");\n    hello.run();\n  }\n}',
        output: '25\n[Al, Bob, Cara]\nHi',
        runnable: true,
        explain: '`square` is a lambda that multiplies a number by itself. The second lambda tells `sort` to order names by length. The last lambda takes no input and just prints.',
      },
      tip: 'Keep lambdas short. If one needs many lines, move the code into a normal method.',
    },
    textbook: {
      definition:
        'A **lambda expression** is an expression for an anonymous function. It has a parameter list and a body, but no name. It evaluates to an instance of a **functional interface**. A lambda expression is a **poly expression** (its type comes from its context). It has no type on its own. It is legal only in an assignment, invocation or casting context whose **target type** is a functional interface. The compiler checks its parameters and result against that interface\'s single abstract method. The body may use local variables of the enclosing scope only if they are final or **effectively final**. A **method reference** is a shorter expression of the same kind. It names an existing method or constructor.',
      terms: [
        { term: 'Functional interface', meaning: 'An interface with exactly one abstract method, not counting public methods of `Object`. It may be marked with `@FunctionalInterface`.' },
        { term: 'Target type', meaning: 'The functional interface type that the surrounding context expects. The compiler uses it to infer the lambda\'s parameter and return types.' },
        { term: 'Effectively final', meaning: 'A local variable that is never assigned again after it is initialised. So it could be declared `final` without changing the program.' },
        { term: 'Method reference', meaning: 'An expression of the form `Type::method`, `expr::method` or `Type::new`. It refers to a method or constructor without calling it.' },
        { term: 'Poly expression', meaning: 'An expression whose type depends on the context it appears in, not on the expression alone.' },
      ],
      source: 'JLS §9.8, §15.13 and §15.27; Javadoc for java.util.function',
    },
    interviewDefinition:
      'A **lambda** is an anonymous function that implements a **functional interface**, which is an interface with exactly one abstract method. A lambda has no type of its own. The compiler infers it from the target type (assignment, parameter or return). Lambdas capture local variables only if they are **effectively final**. Inside a lambda, `this` means the enclosing instance. Lambdas compile to `invokedynamic` call sites linked by `LambdaMetafactory`, not to anonymous inner classes. **Method references** (`Type::method`) are short forms of lambdas that just call one method.',
    interviewFollowUps: [
      {
        question: 'Lambda vs anonymous inner class?',
        answer: 'A lambda does not create a new scope: `this` is the enclosing object, and it cannot shadow local variables. It has no state of its own and can only implement a functional interface. It is linked at run time through `invokedynamic`, with no extra `.class` file. An anonymous class can implement any interface or extend a class. It has its own `this` and fields, and it is a real compiled class.',
      },
      {
        question: 'Why must captured locals be effectively final?',
        answer: 'The lambda copies the value when it is created, and it may run later or on another thread. If the local could still change, the copy and the variable would not match. Fields are different. The lambda captures `this` and reads the field through it, so fields can change. That is exactly why shared mutable fields in lambdas cause races.',
      },
      {
        question: 'Can a lambda throw a checked exception?',
        answer: 'Only if the functional interface\'s method declares it. `Callable.call()` declares `throws Exception`, so a lambda for it may throw. `Function.apply` and `Runnable.run` do not. So checked exceptions must be caught or wrapped inside the lambda.',
      },
      {
        question: 'What does @FunctionalInterface do?',
        answer: 'It asks the compiler to check that the interface has exactly one abstract method. Some methods do not count: default methods, static methods, and abstract methods that override public `Object` methods (like `equals` in `Comparator`). Any interface with a single abstract method works with lambdas, even without the annotation.',
      },
    ],
    mnemonic: {
      device: 'Give, Take, Change, Check',
      expansion: [
        { key: 'Give', meaning: 'Supplier<T>: () -> T — gives you a value from nothing' },
        { key: 'Take', meaning: 'Consumer<T>: T -> void — takes a value and returns nothing' },
        { key: 'Change', meaning: 'Function<T, R>: T -> R — changes a value into another (UnaryOperator and BinaryOperator keep the type)' },
        { key: 'Check', meaning: 'Predicate<T>: T -> boolean — checks a value' },
      ],
      visual: 'A vending machine (gives), a bin (takes), a blender (changes) and a metal detector (checks): four machines, each with one slot in and/or one slot out.',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'A recipe card handed to the chef',
        body: 'A lambda is a recipe card, not a cooked meal. You hand it to an API (the chef) — `list.sort(...)`, `stream.filter(...)`, `executor.submit(...)` — and the API decides when and how many times to follow it. That is why a lambda can run later, run many times, or never run at all.',
      },
      {
        kind: 'insight',
        title: 'The same lambda can have different types',
        body: '`x -> x.isEmpty()` is a `Predicate<String>` in one place and a `Function<String, Boolean>` in another; `() -> 42` can be a `Supplier<Integer>` or a `Callable<Integer>`. The lambda has no type until the context (the target type) gives it one. That is also why `var f = x -> x;` does not compile.',
      },
      {
        kind: 'real-world',
        title: 'Strategies without a class hierarchy',
        body: 'Validation rules, pricing strategies, retry policies and event handlers used to need an interface plus one class per variant. With lambdas a rule is a `Predicate<Order>`, a discount is a `UnaryOperator<Money>`, and they live in a `Map<Country, List<Rule>>` that the compliance team can read top to bottom.',
      },
      {
        kind: 'angle',
        title: 'Lambdas close over values, not variables',
        body: 'Languages like JavaScript capture the *variable*, so a closure sees later reassignments. Java captures the *value* and forbids reassignment to keep the two indistinguishable. If you really need a mutable cell, you must make it explicit (`AtomicInteger`, a one-element array) — and that visible awkwardness is a deliberate nudge towards reductions instead.',
      },
    ],
    diagrams: [
      {
        id: 'fn-lambdas-families',
        kind: 'concept',
        title: 'The four core shapes of behaviour',
        caption: 'Every java.util.function type is a variation on these four shapes: what goes in and what comes out. Bi- versions take two inputs. Primitive versions avoid boxing.',
        explanation: [
          'Read each row from left to right as input, interface, output. In the top row, **(nothing)** goes into a **Supplier<T>**. Its get() produces a **T**: a factory or lazy value.',
          'In the second row, a **T** goes into a **Consumer<T>**, whose accept(t) returns **void (side effect)**. It does something, such as printing or saving, instead of returning a value.',
          'On the right, **Function<T, R>** takes a T and returns an R. **Predicate<T>** takes a T and returns a boolean, the shape used by filter.',
          'The dashed arrow labelled specialised as leads to **UnaryOperator<T> / BinaryOperator<T>**. These are Functions whose result has the same type as their input or inputs.',
          'Takeaway: almost every type in java.util.function is one of these shapes. There are Bi- versions for two inputs, and Int, Long and Double versions to avoid boxing.',
        ],
        cols: 4,
        rows: 3,
        nodes: [
          { id: 'sIn', label: '(nothing)', col: 0, row: 0, shape: 'pill', tone: 'neutral' },
          { id: 'sup', label: 'Supplier<T>', detail: 'get()', col: 1, row: 0, tone: 'primary' },
          { id: 'sOut', label: 'T', col: 2, row: 0, shape: 'pill', tone: 'success' },
          { id: 'cIn', label: 'T', col: 0, row: 1, shape: 'pill', tone: 'neutral' },
          { id: 'con', label: 'Consumer<T>', detail: 'accept(t)', col: 1, row: 1, tone: 'primary' },
          { id: 'cOut', label: 'void (side effect)', col: 2, row: 1, shape: 'pill', tone: 'warning' },
          { id: 'fun', label: 'Function<T, R>', detail: 'apply(t) → R', col: 3, row: 0, tone: 'accent' },
          { id: 'pred', label: 'Predicate<T>', detail: 'test(t) → boolean', col: 3, row: 1, tone: 'accent' },
          { id: 'ops', label: 'UnaryOperator<T> / BinaryOperator<T>', detail: 'Functions whose result has the input type', col: 1, row: 2, span: 3, tone: 'neutral' },
        ],
        edges: [
          { from: 'sIn', to: 'sup' },
          { from: 'sup', to: 'sOut' },
          { from: 'cIn', to: 'con' },
          { from: 'con', to: 'cOut' },
          { from: 'fun', to: 'ops', dashed: true, label: 'specialised as' },
        ],
      },
      {
        id: 'fn-lambdas-indy',
        kind: 'flow',
        title: 'How a lambda becomes an object',
        caption: 'javac moves the lambda body into a private method and leaves an invokedynamic instruction. The first time it runs, LambdaMetafactory links it. Later runs reuse the linked call site, and non-capturing lambdas reuse one instance.',
        explanation: [
          'In the **Compile time** group, **javac** reads the source **x -> x * 2**. It moves the lambda body into a private static method such as lambda$main$0.',
          'Where the lambda was, javac leaves an **invokedynamic** instruction in the bytecode instead of creating an inner class. So no extra .class file is written.',
          'In the **Run time** group, the first run of that instruction calls the **LambdaMetafactory** bootstrap. The bootstrap links the call site once.',
          'The metafactory generates a **Hidden class** at run time. It implements the functional interface and forwards calls to the private method.',
          'An instance of that class is the **Function object** your code receives. Later runs reuse the linked call site, and a non-capturing lambda reuses a single instance.',
          'Takeaway: lambdas are cheap because the translation is decided and linked at run time. It is not baked into inner classes.',
        ],
        cols: 4,
        rows: 2,
        nodes: [
          { id: 'src', label: 'x -> x * 2', detail: 'source', col: 0, row: 0, shape: 'note', tone: 'neutral' },
          { id: 'javac', label: 'javac', detail: 'private static lambda$main$0', col: 1, row: 0, tone: 'primary' },
          { id: 'indy', label: 'invokedynamic', detail: 'call site in bytecode', col: 2, row: 0, tone: 'primary' },
          { id: 'lmf', label: 'LambdaMetafactory', detail: 'first call: bootstrap', col: 3, row: 0, tone: 'accent' },
          { id: 'hidden', label: 'Hidden class', detail: 'implements the interface', col: 3, row: 1, tone: 'accent' },
          { id: 'obj', label: 'Function object', detail: 'reused if non-capturing', col: 2, row: 1, shape: 'pill', tone: 'success' },
        ],
        edges: [
          { from: 'src', to: 'javac' },
          { from: 'javac', to: 'indy' },
          { from: 'indy', to: 'lmf', label: 'link once' },
          { from: 'lmf', to: 'hidden', label: 'spins' },
          { from: 'hidden', to: 'obj', label: 'instance' },
        ],
        groups: [
          { label: 'Compile time', fromCol: 0, toCol: 1, fromRow: 0, toRow: 0, tone: 'neutral' },
          { label: 'Run time', fromCol: 2, toCol: 3, fromRow: 0, toRow: 1, tone: 'primary' },
        ],
      },
      {
        id: 'fn-lambdas-method-refs',
        kind: 'concept',
        title: 'Four method references and the lambdas they stand for',
        caption: 'Bound and unbound differ in where the receiver comes from. It is either captured when the reference is created, or passed as the first argument when it is called.',
        explanation: [
          'Each column shows a method reference on top. Below it, after the arrow labelled means, is the lambda it stands for.',
          'A static reference, **Integer::parseInt**, simply passes its argument through: it means **s -> Integer.parseInt(s)**.',
          'A bound reference, **prefix::concat**, captures the receiver prefix when the reference is created. So it means **s -> prefix.concat(s)**.',
          'An unbound reference, **String::length**, names a type, not an object. The first argument becomes the receiver, so it means **s -> s.length()**.',
          'A constructor reference, **ArrayList::new**, calls a matching constructor and means **() -> new ArrayList<>()**.',
          'Takeaway: the key question is where the receiver comes from. Either it is captured up front (bound), or it is passed in at call time (unbound).',
        ],
        cols: 4,
        rows: 2,
        nodes: [
          { id: 'st', label: 'Integer::parseInt', detail: 'static', col: 0, row: 0, tone: 'primary' },
          { id: 'bd', label: 'prefix::concat', detail: 'bound: receiver captured', col: 1, row: 0, tone: 'accent' },
          { id: 'ub', label: 'String::length', detail: 'unbound: receiver = arg', col: 2, row: 0, tone: 'warning' },
          { id: 'ct', label: 'ArrayList::new', detail: 'constructor', col: 3, row: 0, tone: 'success' },
          { id: 'stL', label: 's -> Integer.parseInt(s)', col: 0, row: 1, shape: 'note', tone: 'neutral' },
          { id: 'bdL', label: 's -> prefix.concat(s)', col: 1, row: 1, shape: 'note', tone: 'neutral' },
          { id: 'ubL', label: 's -> s.length()', col: 2, row: 1, shape: 'note', tone: 'neutral' },
          { id: 'ctL', label: '() -> new ArrayList<>()', col: 3, row: 1, shape: 'note', tone: 'neutral' },
        ],
        edges: [
          { from: 'st', to: 'stL', label: 'means' },
          { from: 'bd', to: 'bdL', label: 'means' },
          { from: 'ub', to: 'ubL', label: 'means' },
          { from: 'ct', to: 'ctL', label: 'means' },
        ],
      },
    ],
    variants: [
      {
        title: 'Functional interface families (java.util.function)',
        intro: 'Over 40 interfaces, but they all follow a few naming patterns.',
        items: [
          { name: 'Function<T, R> / BiFunction<T, U, R>', summary: 'Transform one (or two) inputs into a result. Compose with andThen and compose.', code: 'Function<String, Integer> len = String::length;' },
          { name: 'Predicate<T> / BiPredicate<T, U>', summary: 'Return boolean. Compose with and, or, negate; Predicate.not (Java 11) for method references.', code: 'Predicate<String> blank = String::isBlank;' },
          { name: 'Consumer<T> / BiConsumer<T, U>', summary: 'Accept input, return nothing — for side effects such as printing or saving. andThen chains them.', code: 'map.forEach((k, v) -> log(k, v)); // BiConsumer' },
          { name: 'Supplier<T>', summary: 'Produce a value on demand: factories, lazy defaults (orElseGet), ThreadLocal.withInitial.', code: 'Supplier<List<String>> make = ArrayList::new;' },
          { name: 'UnaryOperator<T> / BinaryOperator<T>', summary: 'Functions whose result has the same type as the input(s). Used by replaceAll and reduce.', code: 'BinaryOperator<Integer> add = Integer::sum;' },
          { name: 'Primitive specialisations', summary: 'IntFunction, ToIntFunction, IntPredicate, IntUnaryOperator, IntBinaryOperator, IntSupplier, ObjIntConsumer, and Long/Double versions — avoid boxing in hot paths.', code: 'IntBinaryOperator max = Math::max;' },
          { name: 'Older single-method interfaces', summary: 'Runnable, Callable, Comparator, and any custom interface with one abstract method also accept lambdas.' },
        ],
      },
      {
        title: 'The four kinds of method reference',
        items: [
          { name: 'Static method', summary: 'ClassName::staticMethod — arguments are passed straight through.', support: 'supported', code: 'Function<String, Integer> p = Integer::parseInt;' },
          { name: 'Bound instance method', summary: 'expression::method — the receiver is evaluated once, when the reference is created.', support: 'supported', code: 'Consumer<String> out = System.out::println;' },
          { name: 'Unbound instance method', summary: 'ClassName::instanceMethod — the first argument becomes the receiver.', support: 'supported', code: 'BiFunction<String, String, Boolean> eq = String::equalsIgnoreCase;' },
          { name: 'Constructor', summary: 'ClassName::new (and int[]::new for arrays) — calls a matching constructor.', support: 'supported', code: 'IntFunction<String[]> arr = String[]::new;' },
        ],
      },
    ],
    deepDive: [
      {
        title: 'invokedynamic, LambdaMetafactory and hidden classes',
        body: 'Java 8 deliberately did not compile lambdas to inner classes (which would mean one `.class` file per lambda and slower start-up). Instead `javac` emits the body as a private synthetic method and an `invokedynamic` instruction whose bootstrap method is `LambdaMetafactory.metafactory`. On first execution the JVM spins a small class implementing the interface — since Java 15 a **hidden class** (JEP 371) — and links the call site permanently. Because the translation strategy is decided at run time, the JDK can improve it without recompiling your code.',
        sources: [
          { label: 'JLS §15.27: Lambda Expressions', url: 'https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.27' },
          { label: 'JEP 371: Hidden Classes', url: 'https://openjdk.org/jeps/371' },
          { label: 'LambdaMetafactory API documentation (Java 21)', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/invoke/LambdaMetafactory.html' },
        ],
      },
      {
        title: 'Method references can be ambiguous',
        body: '`Function<Integer, String> f = Integer::toString;` does **not** compile: it could mean the static `Integer.toString(int)` (argument passed in) or the instance `toString()` on the argument (unbound receiver), and both fit. The compiler reports an ambiguous method reference; write the lambda `i -> i.toString()` instead. Overloads also bite with lambdas: `executor.submit(() -> doWork())` picks `submit(Callable)` if `doWork` returns a value and `submit(Runnable)` if it is `void` — which decides whether exceptions are captured in the Future.',
        sources: [{ label: 'JLS §15.13: Method Reference Expressions', url: 'https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.13' }],
      },
      {
        title: 'Identity, allocation and serialisation',
        body: 'The JLS does not promise that evaluating a lambda creates a new object or that two evaluations give distinct objects. In HotSpot a non-capturing lambda is typically a singleton, while a capturing one allocates per evaluation (often removed by escape analysis). Never compare lambdas with `==` or use them as map keys expecting meaningful equality. Serializable lambdas (`(Runnable & Serializable) () -> …`) work but depend on synthetic method names, so recompiling can break deserialisation — avoid persisting them.',
        sources: [
          { label: 'JLS §15.27.4: Run-Time Evaluation of Lambda Expressions', url: 'https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.27.4' },
          { label: 'Effective Java, 3rd edition — Item 42: Prefer lambdas to anonymous classes' },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  'fn-streams': {
    quick: {
      definition: 'A **stream** lets you process a list of items step by step, such as filtering, changing and adding them up. It does not change the original list.',
      points: [
        'Start with `list.stream()`.',
        'Middle steps like `filter` and `map` return a new stream.',
        'A final step like `toList()`, `sum()` or `count()` produces the result.',
        'Nothing runs until the final step is called.',
        'A stream can be used only once.',
      ],
      example: {
        title: 'Filter, map and sum',
        code: 'import java.util.*;\n\npublic class Main {\n  public static void main(String[] args) {\n    List<Integer> nums = List.of(1, 2, 3, 4, 5, 6);\n\n    List<Integer> result = nums.stream()\n        .filter(n -> n % 2 == 0)\n        .map(n -> n * 10)\n        .toList();\n    System.out.println(result);\n\n    int sum = nums.stream().mapToInt(Integer::intValue).sum();\n    System.out.println(sum);\n  }\n}',
        output: '[20, 40, 60]\n21',
        runnable: true,
        explain: '`filter` keeps the even numbers. `map` multiplies each one by 10, and `toList()` collects them. The second stream adds all six numbers to get 21.',
      },
      tip: 'A stream does not store data. It describes the steps, and the final call runs them.',
    },
    textbook: {
      definition:
        'A **stream** (`java.util.stream.Stream<T>`) is a sequence of elements that supports sequential and parallel aggregate operations. Unlike a collection, a stream stores no elements. It carries elements from a **source** through a **stream pipeline**. The pipeline has the source, zero or more **intermediate operations**, and exactly one **terminal operation**. Each intermediate operation returns a new stream. The terminal operation produces a result or side effect. Intermediate operations are **lazy**: no work is done on the source until the terminal operation starts. Source elements are used only as needed. A stream may be traversed only once.',
      terms: [
        { term: 'Source', meaning: 'Where a stream\'s elements come from, such as a collection, an array, a generator function or an I/O channel.' },
        { term: 'Intermediate operation', meaning: 'An operation such as `filter`, `map` or `sorted` that returns a new stream. It does not run until a terminal operation runs.' },
        { term: 'Terminal operation', meaning: 'An operation such as `collect`, `reduce` or `forEach` that runs through the pipeline to produce a result or side effect. After it, the stream is used up (consumed).' },
        { term: 'Stateful operation', meaning: 'An intermediate operation, such as `sorted` or `distinct`, that may need to see earlier elements before it can process a new one.' },
        { term: 'Short-circuiting operation', meaning: 'An operation that may produce its result without looking at every element. This allows finite results from infinite streams.' },
        { term: 'Mutable reduction', meaning: 'A reduction done by `collect` with a `Collector`. It gathers elements into a mutable result container, such as a list or map.' },
      ],
      source: 'Javadoc for the java.util.stream package and java.util.stream.Stream',
    },
    interviewDefinition:
      'A **stream** is a lazy, single-use pipeline over a source. Zero or more **intermediate** operations (`filter`, `map`, `sorted`) build a recipe. One **terminal** operation (`collect`, `reduce`, `count`, `findFirst`) runs it. Elements are pulled through all stages one at a time. So short-circuiting operations can stop early, while stateful operations like `sorted` must buffer. Streams do not store data or change their source. Behaviour you pass in should be stateless and free of side effects. `parallel()` splits the source with a `Spliterator` and runs the parts on the common ForkJoinPool.',
    interviewFollowUps: [
      {
        question: 'map vs flatMap?',
        answer: '`map` turns each element into exactly one element. `flatMap` turns each element into a **stream** of zero or more elements and joins them together, for example orders into their order lines. Java 16 added `mapMulti` as an imperative alternative for small expansions.',
      },
      {
        question: 'reduce vs collect?',
        answer: '`reduce` combines immutable values (sum, max, string concatenation of a few items) by creating new values. `collect` is a **mutable reduction**. It gathers into a container (list, map, StringBuilder) through a `Collector`. That is far cheaper for building collections.',
      },
      {
        question: 'Why can\'t you reuse a stream?',
        answer: 'A stream is a one-time traversal of its source. The source may be an I/O channel or an iterator that cannot be rewound. After a terminal operation the stream is consumed, and a second terminal operation throws `IllegalStateException`. Instead, keep a `Supplier<Stream<T>>` or stream the collection again.',
      },
      {
        question: 'When are parallel streams a bad idea?',
        answer: 'They are a bad idea in these cases: small inputs, I/O or blocking calls, and sources that split badly (`LinkedList`, `Stream.iterate`). They are also a bad idea for ordered operations such as `limit` or `findFirst`, and for shared mutable state. They also share the JVM-wide common pool with every other parallel stream and `CompletableFuture` default task.',
      },
    ],
    mnemonic: {
      device: 'Source → Shape → Ship, and the belt moves only when Ship pulls',
      expansion: [
        { key: 'Source', meaning: 'Collection.stream(), Stream.of, Arrays.stream, IntStream.range, Files.lines' },
        { key: 'Shape', meaning: 'Intermediate operations: filter, map, flatMap, sorted, distinct, limit — lazy, return a new stream' },
        { key: 'Ship', meaning: 'Terminal operation: collect, toList, reduce, count, forEach, findFirst — produces the result' },
        { key: 'Pull', meaning: 'Laziness: nothing runs until the terminal operation pulls elements, one at a time' },
      ],
      visual: 'A factory conveyor belt that stays still until the shipping dock at the end pulls the next box — each box passes every station before the next box moves.',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'An assembly line driven from the end',
        body: 'Each intermediate operation is a station on a conveyor belt; the terminal operation is the shipping dock. The dock pulls one item, which passes through every station (vertical processing) before the next item moves. If the dock only needs the first good item (`findFirst`), the belt stops as soon as one arrives.',
      },
      {
        kind: 'insight',
        title: 'Order of operations matters for cost',
        body: 'Putting `filter` before `map` means discarded elements are never mapped; putting `sorted` after `filter` sorts fewer elements; `limit` after `sorted` still sorts everything because sorting is a barrier. Stream code reads declaratively, but the stage order is still an execution plan.',
      },
      {
        kind: 'real-world',
        title: 'A sales report in one pipeline',
        body: 'Paid orders → group by region into a `TreeMap` → sum cents per region is one expression: `filter(Order::paid).collect(groupingBy(Order::region, TreeMap::new, summingInt(Order::cents)))`. The same in loops needs a map, a containsKey check and manual accumulation — more lines and more room for null bugs.',
      },
      {
        kind: 'angle',
        title: 'A Collector is four functions',
        body: 'Every collector is a supplier (new container), an accumulator (add one element), a combiner (merge two containers, for parallel runs) and an optional finisher (convert the container to the result). `groupingBy` with a downstream collector is just a collector whose accumulator feeds another collector per key. Seeing this makes custom collectors, `teeing` and `collectingAndThen` unsurprising.',
      },
    ],
    diagrams: [
      {
        id: 'fn-streams-pipeline',
        kind: 'flow',
        title: 'A lazy pipeline pulled by its terminal operation',
        caption: 'Nothing happens while the pipeline is built. findFirst pulls "a" (rejected by filter), then "bb" (mapped to "BB"), and stops. "ccc" and "dddd" are never read.',
        explanation: [
          'Everything in the group **Lazy until the terminal operation** is only a recipe. Building the **Source**, **filter** and **map** stages does no work at all.',
          'When **findFirst()** runs, it pulls elements from the source one at a time. The first, "a", is shorter than 2 characters. The dashed arrow shows it ends as **"a" dropped** and never reaches map.',
          'The next element, "bb", passes the filter, and **map** turns it into "BB", as the arrow labels show.',
          'findFirst receives "BB" and returns **Optional[BB]**. It is short-circuiting, so it can **stop pulling**. "ccc" and "dddd" are never read.',
          'Takeaway: the terminal operation drives the pipeline. So streams do only as much work as the result needs.',
        ],
        cols: 5,
        rows: 2,
        nodes: [
          { id: 'src', label: 'Source', detail: 'a, bb, ccc, dddd', col: 0, row: 0, shape: 'cylinder', tone: 'neutral' },
          { id: 'filter', label: 'filter', detail: 'length ≥ 2 (stateless)', col: 1, row: 0, tone: 'primary' },
          { id: 'map', label: 'map', detail: 'toUpperCase (stateless)', col: 2, row: 0, tone: 'primary' },
          { id: 'find', label: 'findFirst()', detail: 'terminal, short-circuit', col: 3, row: 0, tone: 'accent' },
          { id: 'res', label: 'Optional[BB]', col: 4, row: 0, shape: 'pill', tone: 'success' },
          { id: 'rej', label: '"a" dropped', detail: 'never reaches map', col: 1, row: 1, shape: 'pill', tone: 'danger' },
          { id: 'stop', label: 'stop pulling', detail: 'ccc, dddd untouched', col: 3, row: 1, shape: 'pill', tone: 'warning' },
        ],
        edges: [
          { from: 'src', to: 'filter', label: 'one at a time' },
          { from: 'filter', to: 'map', label: 'bb' },
          { from: 'map', to: 'find', label: 'BB' },
          { from: 'find', to: 'res' },
          { from: 'filter', to: 'rej', dashed: true },
          { from: 'find', to: 'stop', dashed: true },
        ],
        groups: [{ label: 'Lazy until the terminal operation', fromCol: 0, toCol: 2, fromRow: 0, toRow: 1, tone: 'neutral' }],
      },
      {
        id: 'fn-streams-vertical',
        kind: 'concept',
        title: 'Element by element, not stage by stage',
        caption: 'A stateless pipeline runs vertically: each element finishes its trip before the next starts (f3 m3, then f1, then f2 m2). A stateful operation such as sorted is a barrier. It must collect everything first.',
        explanation: [
          'Each row is one element\'s full trip through the pipeline. **element 3** goes through **filter: pass** and straight on to **map → 30** before the next element is touched.',
          'Then **element 1** reaches **filter: drop** and stops there. map is never called for it.',
          'Then **element 2** goes through **filter: pass** and **map → 20**. Stateless stages are fused into one pass per element. They do not run as separate loops.',
          'The dashed arrows into **sorted()** show the exception. Sorting cannot output anything until it has seen every element. So it buffers all of them, as a barrier.',
          'Takeaway: streams process element by element, except at stateful barriers such as sorted.',
        ],
        cols: 4,
        rows: 3,
        nodes: [
          { id: 'e3', label: 'element 3', col: 0, row: 0, shape: 'pill', tone: 'neutral' },
          { id: 'f3', label: 'filter: pass', col: 1, row: 0, tone: 'success' },
          { id: 'm3', label: 'map → 30', col: 2, row: 0, tone: 'primary' },
          { id: 'e1', label: 'element 1', col: 0, row: 1, shape: 'pill', tone: 'neutral' },
          { id: 'f1', label: 'filter: drop', col: 1, row: 1, tone: 'danger' },
          { id: 'e2', label: 'element 2', col: 0, row: 2, shape: 'pill', tone: 'neutral' },
          { id: 'f2', label: 'filter: pass', col: 1, row: 2, tone: 'success' },
          { id: 'm2', label: 'map → 20', col: 2, row: 2, tone: 'primary' },
          { id: 'sorted', label: 'sorted()', detail: 'barrier: buffers all', col: 3, row: 1, tone: 'warning' },
        ],
        edges: [
          { from: 'e3', to: 'f3' },
          { from: 'f3', to: 'm3' },
          { from: 'e1', to: 'f1' },
          { from: 'e2', to: 'f2' },
          { from: 'f2', to: 'm2' },
          { from: 'm3', to: 'sorted', dashed: true },
          { from: 'm2', to: 'sorted', dashed: true },
        ],
      },
      {
        id: 'fn-streams-parallel',
        kind: 'architecture',
        title: 'How a parallel stream executes',
        caption: 'The Spliterator splits the source into chunks. Worker threads from the shared common ForkJoinPool run the pipeline on each chunk. The collector\'s combiner merges the partial results. Splitting and merging cost extra work, and only large CPU-bound workloads pay it back.',
        explanation: [
          'The **Source**, ideally an ArrayList, array or numeric range, goes to a **Spliterator**. Its trySplit() keeps halving it into chunks.',
          'Each chunk goes to a thread in the group **ForkJoinPool.commonPool() — shared JVM-wide**. The threads are **Worker 1**, **Worker 2** and the **Caller thread**, which also does work instead of just waiting.',
          'Every thread runs the whole pipeline (filter, then map, then accumulate) on its own chunk. Each builds a partial result.',
          'The **Combiner** merges the partial results into the final answer. That is why collectors and reductions need an associative combine step.',
          'Takeaway: splitting, scheduling and merging cost extra work, and the pool is shared. So parallel streams pay off only for large, CPU-bound work.',
        ],
        cols: 4,
        rows: 3,
        nodes: [
          { id: 'src', label: 'Source', detail: 'ArrayList / array / range', col: 0, row: 1, shape: 'cylinder', tone: 'neutral' },
          { id: 'split', label: 'Spliterator', detail: 'trySplit() halves', col: 1, row: 1, tone: 'primary' },
          { id: 'w1', label: 'Worker 1', detail: 'filter → map → acc', col: 2, row: 0, tone: 'accent' },
          { id: 'w2', label: 'Worker 2', detail: 'filter → map → acc', col: 2, row: 1, tone: 'accent' },
          { id: 'w3', label: 'Caller thread', detail: 'also does work', col: 2, row: 2, tone: 'accent' },
          { id: 'comb', label: 'Combiner', detail: 'merge partial results', col: 3, row: 1, tone: 'success' },
        ],
        edges: [
          { from: 'src', to: 'split' },
          { from: 'split', to: 'w1', label: 'chunk' },
          { from: 'split', to: 'w2', label: 'chunk' },
          { from: 'split', to: 'w3', label: 'chunk' },
          { from: 'w1', to: 'comb' },
          { from: 'w2', to: 'comb' },
          { from: 'w3', to: 'comb' },
        ],
        groups: [{ label: 'ForkJoinPool.commonPool() — shared JVM-wide', fromCol: 2, toCol: 2, fromRow: 0, toRow: 2, tone: 'warning' }],
      },
    ],
    variants: [
      {
        title: 'Stream operation categories',
        items: [
          { name: 'Intermediate, stateless', summary: 'Process each element independently; fuse into one pass: filter, map, mapToInt, flatMap, mapMulti (16), peek.', code: 'orders.stream().filter(Order::paid).map(Order::total)' },
          { name: 'Intermediate, stateful', summary: 'Need to remember previous elements: sorted (buffers everything), distinct (remembers seen), skip, limit, takeWhile, dropWhile (9).', note: 'sorted is a full barrier; distinct and limit keep state but stream through.' },
          { name: 'Terminal', summary: 'Trigger execution and consume the stream: collect, toList (16), reduce, count, min, max, forEach, toArray, sum/average on primitive streams.' },
          { name: 'Short-circuiting', summary: 'Can finish without seeing every element, so they work on infinite streams: findFirst, findAny, anyMatch, allMatch, noneMatch (terminal), limit and takeWhile (intermediate).', code: 'Stream.iterate(1, n -> n * 2).filter(n -> n > 1000).findFirst()' },
        ],
      },
      {
        title: 'Collector types',
        items: [
          { name: 'To a collection', summary: 'toList, toSet, toCollection(TreeSet::new), toUnmodifiableList (10). Stream.toList() (16) is the short unmodifiable form.' },
          { name: 'toMap', summary: 'Key and value functions; throws IllegalStateException on duplicate keys unless you pass a merge function; optional map factory.', code: 'toMap(User::id, u -> u, (a, b) -> a, LinkedHashMap::new)' },
          { name: 'groupingBy', summary: 'Map<K, List<T>> by default; a downstream collector aggregates each group; a map factory controls order.', code: 'groupingBy(Order::region, TreeMap::new, counting())' },
          { name: 'partitioningBy', summary: 'Always a Map<Boolean, …> with both true and false keys present.' },
          { name: 'Aggregating', summary: 'counting, summingInt, averagingDouble, summarizingInt, minBy, maxBy, reducing.' },
          { name: 'Adapting downstreams', summary: 'mapping, filtering (9), flatMapping (9), collectingAndThen.', code: 'groupingBy(Emp::dept, mapping(Emp::name, joining(", ")))' },
          { name: 'joining', summary: 'Concatenate CharSequences with optional delimiter, prefix and suffix.' },
          { name: 'teeing (12)', summary: 'Feed every element to two collectors and merge their results.', code: 'teeing(counting(), summingInt(x -> x), (n, s) -> s / n)' },
        ],
      },
      {
        title: 'Common stream sources',
        items: [
          { name: 'Collections and arrays', summary: 'list.stream(), Arrays.stream(array), Stream.of(a, b, c). Ordered and SIZED, so they split and count well.' },
          { name: 'Numeric ranges', summary: 'IntStream.range(0, n), rangeClosed — primitive, no boxing, perfect splitting.' },
          { name: 'Generated', summary: 'Stream.iterate(seed, next), iterate(seed, hasNext, next) (9), Stream.generate(supplier) — infinite unless limited.' },
          { name: 'I/O and text', summary: 'Files.lines(path), BufferedReader.lines(), String.lines() (11), string.chars() — close I/O-backed streams with try-with-resources.' },
        ],
      },
    ],
    deepDive: [
      {
        title: 'Stream flags let the library skip work',
        body: 'Every pipeline stage carries characteristics such as SIZED, SORTED, DISTINCT and ORDERED. The implementation uses them: `sorted()` on an already SORTED source does nothing, `distinct()` on a DISTINCT source (a `Set`) is free, and since Java 9 `count()` may not traverse at all if the size is known — so `list.stream().map(f).count()` might never call `f`. This is why the stream javadoc insists behavioural parameters must not rely on side effects: you cannot assume they run.',
        sources: [
          { label: 'java.util.stream package summary — Stream operations and pipelines, side effects', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/stream/package-summary.html' },
          { label: 'Stream.count API documentation (Java 21)', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/stream/Stream.html' },
        ],
      },
      {
        title: 'Encounter order is a parallel tax',
        body: 'Ordered sources (lists, arrays) give parallel streams an encounter order that `findFirst`, `limit`, `forEachOrdered` and `toList` must respect, which forces buffering and coordination between chunks. When order does not matter, `findAny`, `unordered()` or `forEach` remove that cost. The common pool has `availableProcessors() - 1` worker threads by default and the calling thread joins in; one blocking parallel stream can starve every other user of the pool in the same JVM.',
        sources: [
          { label: 'ForkJoinPool API documentation — common pool (Java 21)', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/ForkJoinPool.html' },
          { label: 'Effective Java, 3rd edition — Item 48: Use caution when making streams parallel' },
        ],
      },
      {
        title: 'Gatherers: custom intermediate operations (Java 24)',
        body: 'Collectors made terminal operations extensible, but intermediate operations were fixed. JEP 485 (final in Java 24, after previews in 22 and 23) adds `Stream.gather(Gatherer)` with built-ins such as `Gatherers.windowFixed`, `windowSliding`, `fold`, `scan` and `mapConcurrent`. A gatherer has an initializer, integrator, combiner and finisher — mirroring the collector design — and can be stateful and short-circuiting. Code targeting Java 21 must still write such operations by hand.',
        sources: [{ label: 'JEP 485: Stream Gatherers', url: 'https://openjdk.org/jeps/485' }],
      },
    ],
  },

  // -------------------------------------------------------------------------
  'fn-optional-modern': {
    quick: {
      definition: 'An `Optional` is a box that holds one value or nothing. It makes it clear that a result might be missing, so you do not have to return `null`.',
      points: [
        'Create one with `Optional.of(value)` or `Optional.empty()`.',
        'Use `orElse(other)` to get a default value when the box is empty.',
        'Use `map` to change the value inside, and `ifPresent` to act on it.',
        'Use `ifPresentOrElse` (Java 9) to handle both cases, and `isEmpty()` (Java 11) to check for nothing.',
        'Do not call `get()` without checking first. It throws an exception on an empty box.',
      ],
      example: {
        title: 'A value that may be missing',
        code: 'import java.util.*;\n\npublic class Main {\n  public static void main(String[] args) {\n    Optional<String> name = Optional.of("Ann");\n    Optional<String> none = Optional.empty();\n\n    System.out.println(none.isEmpty());\n    System.out.println(none.orElse("unknown"));\n    System.out.println(name.map(String::toUpperCase).orElse("none"));\n    name.ifPresentOrElse(\n        n -> System.out.println("Hello " + n),\n        () -> System.out.println("No name"));\n  }\n}',
        output: 'true\nunknown\nANN\nHello Ann',
        runnable: true,
        explain: '`none` is empty, so `orElse` gives the default text. `map` changes `Ann` to capital letters. `ifPresentOrElse` runs the first action because the box has a value.',
      },
      tip: 'Use `Optional` for return values. Avoid it for fields and method parameters.',
    },
    textbook: {
      definition:
        '`java.util.Optional<T>` is a **container object** that may or may not contain a non-null value. An Optional with a value is **present**. One with no value is **empty**. It is a final, immutable, **value-based class**. It is meant mainly as a **method return type**. Use it where there is a clear need to show "no result", and where `null` would likely cause errors. Some methods transform the value only when it is present (`map`, `flatMap`, `filter`). Others give a default or throw an exception when it is absent (`orElse`, `orElseGet`, `orElseThrow`).',
      terms: [
        { term: 'Present', meaning: 'The state of an Optional that holds a non-null value. `isPresent()` returns true and `get()` returns the value.' },
        { term: 'Empty', meaning: 'The state of an Optional that holds no value. Transformation methods return empty, and unwrapping methods use the given fallback.' },
        { term: 'Value-based class', meaning: 'A class whose instances are immutable and should be compared only with `equals`. Do not rely on identity operations such as `==` or synchronisation.' },
        { term: 'Primitive optional', meaning: '`OptionalInt`, `OptionalLong` or `OptionalDouble`. They hold a primitive value that may be absent, and they avoid boxing.' },
      ],
      source: 'Javadoc for java.util.Optional; Effective Java, 3rd edition, Item 55',
    },
    interviewDefinition:
      '`Optional<T>` is a value-based container that is either empty or holds one non-null value. It was designed as a **method return type** that makes possible absence clear. It was not designed for fields, parameters or collection elements. Create it with `of`, `ofNullable` or `empty`. Transform it with `map`, `flatMap` and `filter`. Unwrap it with `orElse` (argument evaluated eagerly), `orElseGet` (lazy supplier), `orElseThrow` or `ifPresentOrElse`. Calling `get()` without checking just turns the NullPointerException into a NoSuchElementException.',
    interviewFollowUps: [
      {
        question: 'orElse vs orElseGet?',
        answer: '`orElse(x)` takes a value, so `x` is computed before the call, even when the Optional is present. `orElseGet(supplier)` calls the supplier only when empty. Use orElseGet for anything expensive or with side effects (database calls, logging, object creation).',
      },
      {
        question: 'map vs flatMap on Optional?',
        answer: 'Use `map` when the function returns a plain value (a null result becomes empty). Use `flatMap` when the function already returns an `Optional`. This avoids `Optional<Optional<T>>`.',
      },
      {
        question: 'Why not use Optional for fields?',
        answer: 'It is not `Serializable` and adds an object per field. It does not stop the field itself from being null. It also makes JPA/JSON mapping awkward. Keep the field nullable, and add a getter that returns an `Optional` if absence is meaningful.',
      },
      {
        question: 'Which modern features are final in Java 21?',
        answer: 'Records (16), sealed classes (17), pattern matching for instanceof (16), and for switch with record patterns (21). Also text blocks (15), switch expressions (14), virtual threads (21) and sequenced collections (21). String templates were only a preview and were withdrawn.',
      },
    ],
    mnemonic: {
      device: 'Wrap → Map → Unwrap (lazily)',
      expansion: [
        { key: 'Wrap', meaning: 'Optional.of (non-null), ofNullable (maybe null), empty()' },
        { key: 'Map', meaning: 'map, flatMap, filter, or (9) — transform while staying inside the box' },
        { key: 'Unwrap', meaning: 'orElse, orElseGet, orElseThrow, ifPresent, ifPresentOrElse — leave the box once, at the end' },
        { key: 'Lazily', meaning: 'Prefer orElseGet / orElseThrow(supplier) when the fallback costs something' },
      ],
      visual: 'A parcel that may be empty travels down a conveyor of machines; each machine works only if something is inside, and you open it exactly once at the end of the line.',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'A parcel that might be empty',
        body: 'A method returning `Optional<Customer>` hands you a parcel and says honestly "it might be empty". You can relabel what is inside without opening it (`map`), throw it away if it does not meet a condition (`filter`), and decide what to do with an empty parcel at the end (`orElse...`). A method returning a bare `Customer` that might be null is a parcel that explodes when you open it.',
      },
      {
        kind: 'insight',
        title: 'Railway-oriented code',
        body: 'An Optional pipeline has two tracks: present and empty. Every `map` or `filter` either keeps the value on the present track or switches it to the empty track, after which later steps are skipped. Nested null checks (`if (a != null) { if (a.b() != null) ... }`) collapse into one straight line with a single decision at the end.',
      },
      {
        kind: 'real-world',
        title: 'A cache lookup that hit the database anyway',
        body: '`cache.get(key).orElse(loadFromDatabase(key))` looks lazy but calls the database on every request, because Java evaluates method arguments before the call. Switching to `orElseGet(() -> loadFromDatabase(key))` reduced database load by two orders of magnitude in the lesson\'s incident. Static analysers flag method calls inside orElse for this reason.',
      },
      {
        kind: 'angle',
        title: 'Optional is value-based',
        body: 'Optional is documented as a **value-based class**: do not compare instances with `==`, synchronise on them, or rely on identity. That leaves the JDK free to make it a value class in the future (Project Valhalla), so a well-used Optional may eventually cost no allocation at all.',
      },
    ],
    diagrams: [
      {
        id: 'fn-optional-modern-railway',
        kind: 'flow',
        title: 'Two tracks: present and empty',
        caption: 'For Bob, map(Customer::address) returns null, so the Optional switches to the empty track. map(Address::city) is skipped, and orElse supplies "no city". No NullPointerException can happen on the way.',
        explanation: [
          'The pipeline starts at **findByEmail**, which wraps its possibly null result with `Optional.ofNullable`. If no customer is found, the dashed arrow labelled not found switches straight to the **Empty track**.',
          'On the **Present track**, **map(address)** gets the customer\'s address. For Bob it returns null, so the dashed arrow labelled null result also switches to **Optional.empty**.',
          '**map(city)** runs only if a value is still present. For Ada it produces **"London"**.',
          'On the empty track every later step is skipped, and **orElse("no city")** supplies the fallback at the end.',
          'Takeaway: each step either keeps the value or switches to the empty track. So nested null checks become one straight line, with one decision at the end.',
        ],
        cols: 4,
        rows: 2,
        nodes: [
          { id: 'find', label: 'findByEmail', detail: 'Optional.ofNullable', col: 0, row: 0, tone: 'primary' },
          { id: 'addr', label: 'map(address)', detail: 'null → empty', col: 1, row: 0, tone: 'primary' },
          { id: 'city', label: 'map(city)', detail: 'runs only if present', col: 2, row: 0, tone: 'primary' },
          { id: 'val', label: '"London"', detail: 'Ada', col: 3, row: 0, shape: 'pill', tone: 'success' },
          { id: 'empty', label: 'Optional.empty', detail: 'Bob (no address), Eve', col: 1, row: 1, span: 2, tone: 'warning' },
          { id: 'def', label: 'orElse("no city")', col: 3, row: 1, shape: 'pill', tone: 'neutral' },
        ],
        edges: [
          { from: 'find', to: 'addr', label: 'present' },
          { from: 'addr', to: 'city', label: 'present' },
          { from: 'city', to: 'val' },
          { from: 'find', to: 'empty', dashed: true, label: 'not found' },
          { from: 'addr', to: 'empty', dashed: true, label: 'null result' },
          { from: 'empty', to: 'def' },
        ],
        groups: [
          { label: 'Present track', fromCol: 0, toCol: 3, fromRow: 0, toRow: 0, tone: 'success' },
          { label: 'Empty track', fromCol: 1, toCol: 3, fromRow: 1, toRow: 1, tone: 'warning' },
        ],
      },
      {
        id: 'fn-optional-modern-orelse',
        kind: 'concept',
        title: 'orElse vs orElseGet: when the fallback runs',
        caption: 'Java evaluates arguments before calling a method, so orElse(fallback()) always runs fallback(). orElseGet receives a Supplier and calls it only when the Optional is empty.',
        explanation: [
          'Both branches start from the same **Optional.of("A")**. It already holds a value, so no fallback is needed.',
          'On the left, **orElse(fallback())** is an ordinary method call. Java evaluates its argument first. So, along the arrow labelled always, **fallback() ran**, even though its result is thrown away.',
          'On the right, **orElseGet(supplier)** receives the fallback as a Supplier, a piece of code that has not run yet.',
          'The value is present, so the supplier is never called: **fallback() skipped**, and "A" is returned directly.',
          'Takeaway: use orElse for constants and orElseGet for anything expensive or with side effects, such as a database call.',
        ],
        cols: 3,
        rows: 3,
        nodes: [
          { id: 'opt', label: 'Optional.of("A")', detail: 'present', col: 1, row: 0, tone: 'primary' },
          { id: 'oe', label: 'orElse(fallback())', detail: 'argument computed first', col: 0, row: 1, tone: 'warning' },
          { id: 'oeg', label: 'orElseGet(supplier)', detail: 'fallback passed, not run', col: 2, row: 1, tone: 'success' },
          { id: 'ran', label: 'fallback() ran', detail: 'wasted work, side effects', col: 0, row: 2, shape: 'pill', tone: 'danger' },
          { id: 'skip', label: 'fallback() skipped', detail: 'returns "A" directly', col: 2, row: 2, shape: 'pill', tone: 'success' },
        ],
        edges: [
          { from: 'opt', to: 'oe' },
          { from: 'opt', to: 'oeg' },
          { from: 'oe', to: 'ran', label: 'always' },
          { from: 'oeg', to: 'skip', label: 'value present' },
        ],
      },
      {
        id: 'fn-optional-modern-timeline',
        kind: 'concept',
        title: 'Modern Java at a glance (LTS releases)',
        caption: 'Each long-term-support release bundles the features finalised since the previous one. Only final features belong in production code. Previews need --enable-preview.',
        explanation: [
          'The top row runs left to right through the long-term-support releases. **Java 8** brought lambdas, streams and Optional, the functional foundation of this module.',
          '**Java 11** bundled `var` (from Java 10) and the standard HttpClient. **Java 17** added records, sealed classes and switch expressions. Its dashed note lists **text blocks (15)** and instanceof patterns (16), finalised along the way.',
          '**Java 21** added virtual threads and pattern matching for switch. Its note lists **sequenced collections** and record patterns.',
          '**Java 25** finalised compact source files. Its note lists **scoped values** and module imports.',
          'Takeaway: each LTS release bundles everything finalised since the previous one. Only final features, not previews, belong in production code.',
        ],
        cols: 5,
        rows: 2,
        nodes: [
          { id: 'j8', label: 'Java 8', detail: 'lambdas, streams, Optional', col: 0, row: 0, tone: 'neutral' },
          { id: 'j11', label: 'Java 11', detail: 'var (10), HttpClient', col: 1, row: 0, tone: 'neutral' },
          { id: 'j17', label: 'Java 17', detail: 'records, sealed, switch', col: 2, row: 0, tone: 'primary' },
          { id: 'j21', label: 'Java 21', detail: 'virtual threads, patterns', col: 3, row: 0, tone: 'primary' },
          { id: 'j25', label: 'Java 25', detail: 'compact source files', col: 4, row: 0, tone: 'accent' },
          { id: 'tb', label: 'text blocks (15)', detail: 'instanceof patterns (16)', col: 2, row: 1, shape: 'note', tone: 'neutral' },
          { id: 'seq', label: 'sequenced collections', detail: 'record patterns', col: 3, row: 1, shape: 'note', tone: 'neutral' },
          { id: 'sv', label: 'scoped values', detail: 'module imports', col: 4, row: 1, shape: 'note', tone: 'neutral' },
        ],
        edges: [
          { from: 'j8', to: 'j11' },
          { from: 'j11', to: 'j17' },
          { from: 'j17', to: 'j21' },
          { from: 'j21', to: 'j25' },
          { from: 'j17', to: 'tb', dashed: true },
          { from: 'j21', to: 'seq', dashed: true },
          { from: 'j25', to: 'sv', dashed: true },
        ],
      },
    ],
    variants: [
      {
        title: 'Creating an Optional',
        items: [
          { name: 'Optional.of(value)', summary: 'Wraps a value that must not be null; throws NullPointerException immediately if it is.', code: 'Optional.of(user)' },
          { name: 'Optional.ofNullable(value)', summary: 'Empty if the value is null, present otherwise — the bridge from null-returning APIs.', code: 'Optional.ofNullable(map.get(key))' },
          { name: 'Optional.empty()', summary: 'The empty Optional. Return it instead of null from an Optional-returning method.' },
          { name: 'From streams', summary: 'findFirst, findAny, min, max and reduce(BinaryOperator) return Optional; OptionalInt/Long/Double from primitive streams.', code: 'list.stream().max(Comparator.naturalOrder())' },
        ],
      },
      {
        title: 'Transforming and consuming an Optional',
        items: [
          { name: 'map / flatMap / filter', summary: 'Transform while staying inside the box; flatMap for functions that return Optional.' },
          { name: 'or(supplier) (9)', summary: 'Supply an alternative Optional when empty — chain fallbacks.', code: 'cache.find(id).or(() -> db.find(id))' },
          { name: 'orElse(value)', summary: 'Fallback value, evaluated eagerly. Fine for constants.', code: '.orElse("anonymous")' },
          { name: 'orElseGet(supplier)', summary: 'Fallback computed lazily, only when empty.', code: '.orElseGet(this::loadDefault)' },
          { name: 'orElseThrow() (10) / orElseThrow(supplier)', summary: 'Unwrap or throw NoSuchElementException / your own exception — the honest replacement for get().', code: '.orElseThrow(() -> new NotFoundException(id))' },
          { name: 'ifPresent / ifPresentOrElse (9)', summary: 'Run an action for the value, optionally another for the empty case.' },
          { name: 'isPresent / isEmpty (11)', summary: 'Boolean checks; rarely needed when the functional methods fit.' },
          { name: 'stream() (9)', summary: 'Zero- or one-element stream; flattens a stream of Optionals with flatMap(Optional::stream).' },
          { name: 'get()', summary: 'Unwraps or throws NoSuchElementException.', support: 'partial', note: 'Not deprecated, but discouraged: use orElseThrow() to make the intent visible.' },
        ],
      },
      {
        title: 'Kinds of Optional class',
        intro: 'All four live in java.util and were added in Java 8.',
        items: [
          { name: 'Optional<T>', summary: 'Generic container for an object reference; the full API with map, flatMap, filter and or.', code: 'Optional<User> u = repo.findById(id);' },
          { name: 'OptionalInt', summary: 'Holds a possibly absent int without boxing; returned by IntStream.max, min, findFirst. Unwrap with getAsInt or orElse.', code: 'OptionalInt max = IntStream.of(3, 7).max();' },
          { name: 'OptionalLong', summary: 'The long version, returned by LongStream terminal operations; getAsLong, orElse, ifPresent.' },
          { name: 'OptionalDouble', summary: 'The double version, returned by average() on every primitive stream; getAsDouble, orElse.', code: 'double avg = IntStream.of(1, 2).average().orElse(0);' },
        ],
      },
      {
        title: 'Feature status by release (as of Java 25)',
        items: [
          { name: 'Records, sealed classes, text blocks, switch expressions', summary: 'Final in 16, 17, 15 and 14 respectively.', support: 'supported' },
          { name: 'Pattern matching for switch, record patterns, virtual threads, sequenced collections', summary: 'Final in Java 21.', support: 'supported' },
          { name: 'Stream gatherers, unnamed variables and patterns', summary: 'Gatherers final in 24 (JEP 485); unnamed variables `_` final in 22 (JEP 456).', support: 'supported' },
          { name: 'Compact source files and instance main, flexible constructor bodies, scoped values, module imports', summary: 'Final in Java 25 (JEPs 512, 513, 506, 511).', support: 'supported' },
          { name: 'Structured concurrency, primitive types in patterns', summary: 'Still preview features in Java 25.', support: 'partial', note: 'Need --enable-preview; APIs may change.' },
          { name: 'String templates', summary: 'Previewed in 21 and 22, then withdrawn in 23 for redesign.', support: 'not-supported', note: 'Not available in any current release.' },
        ],
      },
    ],
    deepDive: [
      {
        title: 'Optional was designed narrowly — on purpose',
        body: 'The `Optional` javadoc states it is "primarily intended for use as a method return type where there is a clear need to represent \'no result,\' and where using null is likely to cause errors." It does not implement `Serializable`, and a variable of type Optional must itself never be null. Its creators deliberately kept it small (few methods, no special language support) so it would not become a general Maybe type spread through domain models.',
        sources: [
          { label: 'Optional API documentation (Java 21)', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Optional.html' },
          { label: 'Effective Java, 3rd edition — Item 55: Return optionals judiciously' },
        ],
      },
      {
        title: 'Primitive optionals and the boxing cost',
        body: '`OptionalInt`, `OptionalLong` and `OptionalDouble` exist so that `IntStream.max()` or `average()` need not box. They are deliberately limited — no `map`, `flatMap` or `filter` — so pipelines that need transformation usually stay in the stream or box explicitly. Returning `Optional<Integer>` from a hot method allocates both an Optional and (outside the small Integer cache) an Integer; escape analysis often removes this in practice, but not always.',
        sources: [{ label: 'OptionalInt API documentation (Java 21)', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/OptionalInt.html' }],
      },
      {
        title: 'How preview features become final — or not',
        body: 'Since Java 12, new language and API features can ship as **preview** (JEP 12): fully implemented and specified, but disabled unless you compile and run with `--enable-preview`, and free to change. Most previews become final after one to three rounds (records: previews in 14 and 15, final in 16; pattern matching for switch: four previews, final in 21). String templates are the cautionary tale: previewed in 21 and 22, then dropped in 23. That is why production code and certification answers should rely only on final features.',
        sources: [
          { label: 'JEP 12: Preview Features', url: 'https://openjdk.org/jeps/12' },
          { label: 'JEP 441: Pattern Matching for switch', url: 'https://openjdk.org/jeps/441' },
          { label: 'JEP 395: Records', url: 'https://openjdk.org/jeps/395' },
        ],
      },
    ],
  },
};
