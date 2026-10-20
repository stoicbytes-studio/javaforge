import type { LessonConcepts } from '@/types/curriculum';

/** Concept pages for module 13 (Design principles and patterns), keyed by lesson id. */
export const designConcepts: Record<string, LessonConcepts> = {
  'd-solid': {
    textbook: {
      definition:
        '**SOLID** is a set of five object-oriented **design principles**, collected by Robert C. Martin. They govern how classes and modules depend on one another, so that software stays cheap to extend and maintain. They are the **Single Responsibility**, **Open/Closed**, **Liskov Substitution**, **Interface Segregation** and **Dependency Inversion** principles. Together they aim for high **cohesion** inside a module and low **coupling** between modules. They favour reuse through abstractions and **composition** over reuse through implementation inheritance. They are rules of thumb (heuristics) for managing change, not rules the compiler enforces.',
      terms: [
        { term: 'Cohesion', meaning: 'How much the parts of a module belong together and serve one clear purpose or actor.' },
        { term: 'Coupling', meaning: 'How much one module depends on the internal details of another, so that a change in one forces a change in the other.' },
        { term: 'Behavioural subtyping', meaning: 'The Liskov and Wing rule that a subtype keeps its supertype\'s contract. It must not demand stronger preconditions or promise weaker postconditions, and it must keep the invariants.' },
        { term: 'Abstraction', meaning: 'An interface or abstract type that states what a collaborator does, but not how. So different implementations can sit behind it.' },
        { term: 'Composition', meaning: 'Building behaviour by holding references to other objects and passing calls on to them (delegating), rather than inheriting their implementation.' },
      ],
      source: 'Robert C. Martin, Agile Software Development: Principles, Patterns, and Practices (2002); Liskov and Wing (1994)',
    },
    interviewDefinition:
      '**SOLID** is five object-oriented design principles that keep code cheap to change. **S**ingle Responsibility: a class has one reason to change — one actor it serves. **O**pen/Closed: add behaviour by adding code, not by editing working code. **L**iskov Substitution: a subtype must honour its supertype\'s contract. **I**nterface Segregation: clients depend only on the methods they use. **D**ependency Inversion: policy and details both depend on abstractions the policy owns. Its companion rule is **composition over inheritance**: reuse by holding objects and delegating to them, not by subclassing implementations.',
    interviewFollowUps: [
      {
        question: 'Give a classic Liskov violation.',
        answer: '`Square extends Rectangle`. Setting the width of a square also changes its height. So code that sets width 5 and height 4 and expects area 20 breaks. The JDK\'s own example is `List.of(...)`, whose `add` throws `UnsupportedOperationException`. This is legal only because the `List` contract marks mutators as optional.',
      },
      {
        question: 'Is Dependency Inversion the same as dependency injection?',
        answer: 'No. DIP is a design rule about the **direction** of source-code dependencies: details depend on abstractions owned by the policy. Dependency injection is a technique for supplying those implementations from outside (constructor injection, Spring). IoC is the wider idea that a framework, not your code, controls wiring and flow.',
      },
      {
        question: 'Do sealed interfaces violate the Open/Closed principle?',
        answer: 'Yes, on purpose, and that is fine for closed domain models. Use `sealed` with an exhaustive pattern-matching `switch`. Then the compiler flags every switch when a variant is added. This is safer than a forgotten `default`. Keep open extension for plug-ins and third-party implementations.',
      },
      {
        question: 'When is inheritance the right choice?',
        answer: 'Use it for a real is-a relationship inside code you control. Also use it when a class is clearly designed and documented for extension (an abstract class with protected hooks, as in Template Method). Otherwise, wrap and forward.',
      },
    ],
    mnemonic: {
      device: 'SOLID — a building that can be renovated without cracking',
      expansion: [
        { key: 'S', meaning: 'Single reason to change — one actor per class (separate rooms for separate uses)' },
        { key: 'O', meaning: 'Open for extension, closed for modification — add a room, do not knock down walls' },
        { key: 'L', meaning: 'Liskov — any replacement part must fit and behave like the original' },
        { key: 'I', meaning: 'Interface segregation — small, client-specific interfaces (one switch per light)' },
        { key: 'D', meaning: 'Dependency inversion — appliances plug into a standard socket the house defines' },
      ],
      visual: 'Picture a house where every appliance plugs into a standard wall socket (DIP), each room has one purpose (SRP), extensions bolt on without demolishing walls (OCP), any certified replacement part fits (LSP), and each light has its own switch instead of one giant control panel (ISP).',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'The wall socket is Dependency Inversion',
        body: 'A house does not depend on a particular toaster; it defines a socket standard, and every appliance adapts to it. Your business logic is the house: it declares `CustomerStore`, and JDBC, files or a test fake plug into it. Swapping the appliance never requires rewiring the house.',
      },
      {
        kind: 'insight',
        title: 'SOLID is about people and change, not classes',
        body: 'SRP is defined by *who* asks for changes (finance, compliance, the UI team), not by counting methods. A 300-line class serving one actor can be fine; a 50-line class that changes for three teams will keep causing merge conflicts and regression bugs. Ask "why would this change?" before asking "how big is it?".',
      },
      {
        kind: 'real-world',
        title: 'Adding a payment provider without touching checkout',
        body: 'When checkout depends on a `PaymentGateway` interface it owns (DIP), adding a provider is a new adapter class plus one line of wiring (OCP). Checkout tests keep using an in-memory fake. Teams that called the vendor SDK directly from checkout instead face a cross-cutting rewrite and a re-test of the whole flow.',
      },
      {
        kind: 'angle',
        title: 'The cost of over-applying SOLID',
        body: 'Every interface is a level of indirection that readers must follow. One-implementation interfaces "for flexibility", ten tiny classes for one cohesive algorithm, or factories for objects that never vary make code harder to change, not easier. Apply a principle when the second variation or a real test seam appears (YAGNI).',
      },
      {
        kind: 'insight',
        title: 'Inheritance couples you to the implementation',
        body: 'A subclass depends on the parent\'s *self-use* — which of its own overridable methods it calls internally. `HashSet.addAll` calls `add`, so a counting subclass counts twice; `HashMap.putAll` does not call `put`, so an auditing subclass misses writes. Composition depends only on the published interface.',
      },
    ],
    diagrams: [
      {
        id: 'd-solid-srp-split',
        kind: 'concept',
        title: 'SRP: one class per reason to change',
        caption: 'The god class changes whenever the file format, validation rules or storage change. After the split, the importer only coordinates, and each collaborator changes for exactly one actor.',
        explanation: [
          'Start at the top-left **CustomerImporter**. It is a god class that parses, validates and saves customers all by itself.',
          'The dashed arrow points to the note **3 reasons to change**: the file format, the validation rules and the database. Three different actors can each force an edit to the same class.',
          'The arrow labelled refactor leads to the new **CustomerImporter**. It now only coordinates: it calls its collaborators in order but holds none of their logic.',
          'Each collaborator in the bottom row has one job. **CustomerParser** changes with the CSV format, **CustomerValidator** with the business rules and **CustomerStore** with the storage technology.',
          'The green group, after: one actor each, is the takeaway. A change asked for by one team now touches one small class. So edits stop colliding and regressions stay local.',
        ],
        cols: 4,
        rows: 3,
        nodes: [
          { id: 'god', label: 'CustomerImporter', detail: 'parses + validates + saves', col: 0, row: 0, span: 2, tone: 'danger' },
          { id: 'reasons', label: '3 reasons to change', detail: 'format, rules, database', col: 2, row: 0, span: 2, shape: 'note', tone: 'warning' },
          { id: 'policy', label: 'CustomerImporter', detail: 'orchestrates only', col: 1, row: 1, span: 2, tone: 'primary' },
          { id: 'parser', label: 'CustomerParser', detail: 'changes with CSV format', col: 0, row: 2, tone: 'success' },
          { id: 'validator', label: 'CustomerValidator', detail: 'changes with rules', col: 1, row: 2, span: 2, tone: 'success' },
          { id: 'store', label: 'CustomerStore', detail: 'changes with storage', col: 3, row: 2, tone: 'success' },
        ],
        edges: [
          { from: 'god', to: 'reasons', dashed: true },
          { from: 'god', to: 'policy', label: 'refactor' },
          { from: 'policy', to: 'parser' },
          { from: 'policy', to: 'validator' },
          { from: 'policy', to: 'store' },
        ],
        groups: [{ label: 'After: one actor each', fromCol: 0, toCol: 3, fromRow: 1, toRow: 2, tone: 'success' }],
      },
      {
        id: 'd-solid-dip-arch',
        kind: 'architecture',
        title: 'Dependency Inversion: arrows point toward the policy',
        caption: 'The interface lives with the business logic. Infrastructure implements it. So every source-code dependency points inward, and the policy compiles and tests with no database at all.',
        explanation: [
          'Start in the domain group at the top. **CustomerImporter** is the business policy. It depends only on **CustomerStore**, an interface that the policy itself owns.',
          'In the infrastructure row, **JdbcCustomerStore** and **InMemoryStore** both point up with implements arrows. The details depend on the abstraction, not the other way round.',
          'Only **JdbcCustomerStore** talks to the **Database**, shown by the dashed arrow. The domain code never imports JDBC, so it compiles and runs without a database.',
          'The dashed arrow from **main / Spring** shows wiring. At start-up, the composition root picks an implementation and injects it into the importer through its constructor.',
          'The takeaway: every source-code arrow crosses the boundary toward the policy. So swapping storage or using a test fake never requires changing business logic.',
        ],
        cols: 3,
        rows: 3,
        nodes: [
          { id: 'importer', label: 'CustomerImporter', detail: 'business policy', col: 0, row: 0, tone: 'primary' },
          { id: 'port', label: 'CustomerStore', detail: 'interface owned by policy', col: 1, row: 0, tone: 'accent' },
          { id: 'jdbc', label: 'JdbcCustomerStore', detail: 'implements the port', col: 0, row: 2, tone: 'neutral' },
          { id: 'fake', label: 'InMemoryStore', detail: 'test double', col: 1, row: 2, tone: 'neutral' },
          { id: 'db', label: 'Database', col: 2, row: 2, shape: 'cylinder', tone: 'neutral' },
          { id: 'main', label: 'main / Spring', detail: 'wires implementations', col: 2, row: 0, shape: 'pill', tone: 'warning' },
        ],
        edges: [
          { from: 'importer', to: 'port', label: 'depends on' },
          { from: 'jdbc', to: 'port', label: 'implements' },
          { from: 'fake', to: 'port', label: 'implements' },
          { from: 'jdbc', to: 'db', dashed: true },
          { from: 'main', to: 'port', label: 'injects impl', dashed: true },
        ],
        groups: [
          { label: 'Domain (no infrastructure imports)', fromCol: 0, toCol: 1, fromRow: 0, toRow: 0, tone: 'primary' },
          { label: 'Infrastructure', fromCol: 0, toCol: 2, fromRow: 2, toRow: 2, tone: 'neutral' },
        ],
      },
      {
        id: 'd-solid-fragile-base',
        kind: 'flow',
        title: 'Why the inherited counter says 6',
        caption: 'The subclass counts in addAll. Then HashSet.addAll calls the overridden add for each element, which counts again. The composed wrapper forwards to the inner set, and the inner set\'s own calls never reach the wrapper.',
        explanation: [
          'Read the top row first: the inheritance path. The call **addAll(a, b, c)** reaches **CountingHashSet**. It adds 3 to its counter and then calls super.addAll.',
          '**HashSet.addAll** works by calling this.add once per element. The arrow labels this hidden self-use, and the call goes to the subclass.',
          'So the **overridden add** runs three more times and adds 1 each time, leaving the counter at 6 instead of 3. The subclass was coupled to the parent\'s internals.',
          'Now the bottom row: the composition path. The same **addAll(a, b, c)** reaches **CountingSet**. This wrapper adds 3 and forwards to the set it holds.',
          '**inner.addAll** calls inner.add on the wrapped HashSet, not on the wrapper. So the wrapper is never entered again, and the result is **attempts = 3**.',
          'The takeaway from the two groups: inheritance is white-box reuse that depends on implementation details. Composition is black-box reuse that depends only on the public interface.',
        ],
        cols: 4,
        rows: 3,
        nodes: [
          { id: 'call', label: 'addAll(a, b, c)', col: 0, row: 0, shape: 'pill', tone: 'primary' },
          { id: 'sub', label: 'CountingHashSet', detail: 'attempts += 3', col: 1, row: 0, tone: 'warning' },
          { id: 'super', label: 'HashSet.addAll', detail: 'calls this.add() x3', col: 2, row: 0, tone: 'neutral' },
          { id: 'add', label: 'overridden add', detail: 'attempts++ x3 → 6', col: 3, row: 0, tone: 'danger' },
          { id: 'call2', label: 'addAll(a, b, c)', col: 0, row: 2, shape: 'pill', tone: 'primary' },
          { id: 'wrap', label: 'CountingSet', detail: 'attempts += 3', col: 1, row: 2, tone: 'success' },
          { id: 'inner', label: 'inner.addAll', detail: 'calls inner.add()', col: 2, row: 2, tone: 'neutral' },
          { id: 'ok', label: 'attempts = 3', detail: 'wrapper not re-entered', col: 3, row: 2, shape: 'pill', tone: 'success' },
        ],
        edges: [
          { from: 'call', to: 'sub' },
          { from: 'sub', to: 'super', label: 'super.addAll' },
          { from: 'super', to: 'add', label: 'self-use' },
          { from: 'call2', to: 'wrap' },
          { from: 'wrap', to: 'inner', label: 'forward' },
          { from: 'inner', to: 'ok' },
        ],
        groups: [
          { label: 'Inheritance (white-box)', fromCol: 0, toCol: 3, fromRow: 0, toRow: 0, tone: 'danger' },
          { label: 'Composition (black-box)', fromCol: 0, toCol: 3, fromRow: 2, toRow: 2, tone: 'success' },
        ],
      },
    ],
    variants: [
      {
        title: 'The five SOLID principles',
        intro: 'Each principle with its typical violation and the usual fix.',
        items: [
          {
            name: 'Single Responsibility (SRP)',
            summary: 'A class should have one reason to change: it serves one actor. Violation: an importer that parses, validates and saves. Fix: extract collaborators and keep a thin orchestrating policy.',
          },
          {
            name: 'Open/Closed (OCP)',
            summary: 'Add behaviour by adding classes, not by editing a growing switch on a type code. Fix: polymorphism, a strategy registry, or — for closed sets — a sealed type with an exhaustive switch.',
            code: 'Map<String, Discount> discounts = Map.of(\n    "student", p -> p * 0.8,\n    "none", p -> p);',
          },
          {
            name: 'Liskov Substitution (LSP)',
            summary: 'A subtype may accept more and promise more, never less: no stronger preconditions, weaker postconditions, broken invariants or surprise exceptions. Violation: Square extends Rectangle.',
          },
          {
            name: 'Interface Segregation (ISP)',
            summary: 'Split fat interfaces by client so implementations and test doubles only deal with what is used. Functional interfaces are the extreme: one method, lambda-friendly.',
            code: 'interface BalanceQuery { Money balance(AccountId id); }\ninterface TransferCommand { void transfer(Transfer t); }',
          },
          {
            name: 'Dependency Inversion (DIP)',
            summary: 'High-level policy defines the abstraction it needs; low-level details implement it. Wire with constructor injection by hand or with a container.',
            code: 'CustomerImporter(CustomerParser p, CustomerValidator v, CustomerStore s)',
          },
        ],
      },
      {
        title: 'Ways to reuse behaviour in Java',
        intro: 'How Java supports each reuse mechanism, from most to least coupled.',
        items: [
          {
            name: 'Class inheritance (extends)',
            summary: 'White-box reuse of a parent\'s implementation; single parent only.',
            support: 'supported',
            note: 'Use for genuine is-a relationships in code you control, or classes designed for extension. Mark others final.',
          },
          {
            name: 'Multiple class inheritance',
            summary: 'Inheriting state and implementation from several classes.',
            support: 'not-supported',
            note: 'Deliberately excluded to avoid the diamond problem for state.',
          },
          {
            name: 'Interface inheritance and default methods',
            summary: 'A class implements many interfaces and may inherit default method behaviour (Java 8+), but no instance state.',
            support: 'partial',
            note: 'Conflicting defaults must be resolved explicitly with Interface.super.method().',
          },
          {
            name: 'Composition and delegation',
            summary: 'Hold a reference to a collaborator and forward calls, adding behaviour around them (Decorator, Adapter, Strategy).',
            support: 'supported',
            note: 'Black-box reuse: depends only on the collaborator\'s interface. Preferred default.',
          },
          {
            name: 'Sealed hierarchies',
            summary: 'A closed set of permitted subtypes (Java 17) for domain models that should be exhaustive.',
            support: 'supported',
            code: 'sealed interface Shape permits Circle, Square {}',
          },
        ],
      },
    ],
    deepDive: [
      {
        title: 'LSP is behavioural subtyping — and the compiler only checks half of it',
        body: 'Liskov and Wing\'s formulation requires that subtypes preserve the supertype\'s behaviour: preconditions may be weakened, postconditions strengthened, invariants kept, and history constraints respected. Java\'s type system enforces only the **signature** rules: an override may have a covariant (narrower) return type, may not throw broader checked exceptions, and may not reduce visibility. Contravariant parameters are not overrides at all in Java — a method taking `Object` where the parent takes `String` is an *overload*. Everything else in the contract lives in Javadoc and tests, which is why LSP violations survive compilation.',
        sources: [
          { label: 'JLS §8.4.8.3: Requirements in Overriding and Hiding', url: 'https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html#jls-8.4.8.3' },
          { label: 'Barbara Liskov and Jeannette Wing, "A Behavioral Notion of Subtyping" (1994)' },
        ],
      },
      {
        title: 'Design and document for inheritance, or prohibit it',
        body: '*Effective Java* argues that a class open to subclassing must document its self-use of overridable methods ("This implementation calls `add`…" — the `@implSpec` Javadoc tag exists for this), must never call overridable methods from constructors, and becomes impossible to change freely once released. Most classes should therefore be `final` or have only private constructors with static factories. Records, enums and sealed hierarchies make this the default for many modern types.',
        sources: [
          { label: 'Effective Java (3rd ed.), Items 18 and 19: Favor composition over inheritance; Design and document for inheritance or else prohibit it' },
          { label: 'JEP 409: Sealed Classes', url: 'https://openjdk.org/jeps/409' },
        ],
      },
      {
        title: 'DIP at module scale: ServiceLoader and JPMS',
        body: 'Dependency inversion also works across JARs without any framework. A module declares an interface and `uses` it; provider modules declare `provides Interface with Impl`; `ServiceLoader.load(Interface.class)` discovers implementations at run time. JDBC drivers, `java.nio.file` file-system providers and logging back-ends are found this way — the core never depends on the plug-in, only the reverse.',
        sources: [
          { label: 'java.util.ServiceLoader (Java SE 21 API)', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/ServiceLoader.html' },
        ],
      },
    ],
  },

  'd-patterns': {
    textbook: {
      definition:
        'A **design pattern** is a named, documented description of a general, reusable solution to a recurring problem in object-oriented design, within a particular **context**. Gamma, Helm, Johnson and Vlissides set the standard form. In it, each pattern has four essential parts: a **pattern name**, the **problem** it solves, the **solution** and the **consequences**. The solution is an abstract arrangement of classes and objects that work together. The consequences are its trade-offs. A pattern is not finished code or a library; it is a template you adapt to each situation. The catalogue groups patterns by purpose as **creational**, **structural** or **behavioural**.',
      terms: [
        { term: 'Context', meaning: 'The repeating situation, with its forces and limits, in which the design problem comes up and the pattern applies.' },
        { term: 'Consequences', meaning: 'The results and trade-offs of using a pattern, such as flexibility gained, extra indirection, or costs in performance and complexity.' },
        { term: 'Creational pattern', meaning: 'A pattern that hides how objects are created: which concrete classes are made and how they are put together.' },
        { term: 'Structural pattern', meaning: 'A pattern about combining classes and objects into larger structures while keeping them flexible and efficient.' },
        { term: 'Behavioural pattern', meaning: 'A pattern about algorithms, how responsibilities are shared between objects, and how those objects communicate.' },
      ],
      source: 'Gamma, Helm, Johnson and Vlissides, Design Patterns: Elements of Reusable Object-Oriented Software (1994), chapter 1',
    },
    interviewDefinition:
      'A **design pattern** is a named, reusable solution to a recurring design problem in a given context. The Gang of Four catalogue (1994) lists 23. It groups them as **creational** (how objects are created), **structural** (how objects are composed) and **behavioural** (how objects share responsibility and communicate). In modern Java many shrink to language features. Strategy and Command become lambdas. Singleton becomes an enum or a DI-managed bean. Iterator is `Iterable`. Visitor is often replaced by sealed types with pattern-matching `switch`. The lasting value is a shared vocabulary and recognising intent.',
    interviewFollowUps: [
      {
        question: 'Decorator, Proxy and Adapter all wrap an object. How do they differ?',
        answer: 'Intent. **Adapter** changes the interface to one the client expects. **Decorator** keeps the interface and adds behaviour; decorators stack. **Proxy** keeps the interface and controls *access* — lazy loading, remote calls, security or transactions (Spring\'s `@Transactional` is a proxy).',
      },
      {
        question: 'Why is a single-element enum the best Singleton?',
        answer: 'The JVM guarantees exactly one instance per class loader, with thread-safe lazy class initialisation. Enum serialization returns the same constant. Reflection cannot create enum instances. Even so, prefer creating one instance at start-up and injecting it, so tests can replace it.',
      },
      {
        question: 'Factory Method vs Abstract Factory?',
        answer: 'Factory Method is **one** method that decides which concrete class to create. It is often overridable or static (e.g. `List.of`, `Calendar.getInstance`). Abstract Factory is an **object** that creates a family of related products that must match. For example, a UI toolkit that makes buttons and checkboxes for the same theme, or `DocumentBuilderFactory`.',
      },
      {
        question: 'Has Java made Visitor obsolete?',
        answer: 'Mostly, for closed hierarchies. Use `sealed` interfaces (17) and pattern matching for `switch` (21). Then a new operation is a method with an exhaustive switch over the record types. You need no `accept`/`visit` double dispatch. Visitor still fits open hierarchies, or frameworks such as annotation processors (`ElementVisitor`).',
      },
    ],
    mnemonic: {
      device: 'Create, Compose, Communicate',
      expansion: [
        { key: 'Create', meaning: 'Creational patterns decide how objects are made: Singleton, Factory Method, Abstract Factory, Builder, Prototype' },
        { key: 'Compose', meaning: 'Structural patterns decide how objects fit together: Adapter, Decorator, Facade, Proxy, Composite, Bridge, Flyweight' },
        { key: 'Communicate', meaning: 'Behavioural patterns decide who does what and how they talk: Strategy, Observer, Command, Template Method, Iterator, State, Chain of Responsibility, Visitor' },
      ],
      visual: 'A workshop with three benches: a factory bench where parts are made, an assembly bench where parts are bolted together, and a radio between workers who hand each other jobs.',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'Patterns are chess openings',
        body: 'A chess player who knows the Sicilian Defence does not memorise every move; they recognise a familiar situation and a proven plan with known trade-offs. Patterns work the same way: "this is an adapter at the vendor boundary" compresses a design discussion into one sentence — but playing an opening in the wrong position still loses the game.',
      },
      {
        kind: 'insight',
        title: 'Many patterns are workarounds for missing language features',
        body: 'Peter Norvig observed in 1996 that most GoF patterns become simpler or invisible in languages with first-class functions and dynamic types. Java caught up: lambdas absorb Strategy, Command and Template Method callbacks; records absorb value-object boilerplate; enums absorb Singleton and State; sealed types and pattern matching absorb Visitor. When a pattern needs a class per variant, check whether a language feature already says it.',
      },
      {
        kind: 'real-world',
        title: 'Patterns hiding inside the JDK and Spring',
        body: '`BufferedReader(new InputStreamReader(in))` is a Decorator around an Adapter. `Comparator` is Strategy, `Iterator` is Iterator, `Runnable` is Command, `HttpClient.newBuilder()` is Builder, `java.util.logging.Handler` chains are Chain of Responsibility. Spring\'s `JdbcTemplate` is Template Method with callbacks, `@Transactional` works through a Proxy, and `ApplicationEvent` listeners are Observer.',
      },
      {
        kind: 'angle',
        title: 'Recognise patterns more than you write them',
        body: 'Day to day, the biggest win is *reading*: recognising that a framework hands you a proxy explains why a `@Transactional` method called from the same class does nothing (the call bypasses the proxy). Writing new pattern scaffolding is rarer — and a code reviewer asking "which problem does this pattern remove?" is the best defence against over-engineering.',
      },
    ],
    diagrams: [
      {
        id: 'd-patterns-families',
        kind: 'concept',
        title: 'The three families of GoF patterns',
        caption: 'Each family answers one question. The bottom row shows the modern Java feature that most often replaces or simplifies patterns in that family.',
        explanation: [
          'The top row names the three families, each answering one question: **Creational** asks how objects are made, **Structural** how they are composed, and **Behavioural** how they communicate.',
          'Under each family, a note lists well-known members: **Builder, Factory** for creation, **Adapter, Decorator** for structure, and **Strategy, Observer** for behaviour.',
          'The dashed arrows labelled modern Java lead to the bottom row. It shows the language feature that most often simplifies that family today.',
          'Creational patterns often shrink to **Records + factories**, an enum singleton or dependency injection. Structural ones use plain **Composition** and dynamic proxies. Behavioural ones become **Lambdas** or sealed types with switch.',
          'The takeaway: learn the family and the intent. Then check whether a modern language feature already expresses it, before writing pattern scaffolding.',
        ],
        cols: 3,
        rows: 3,
        nodes: [
          { id: 'cre', label: 'Creational', detail: 'how objects are made', col: 0, row: 0, tone: 'primary' },
          { id: 'str', label: 'Structural', detail: 'how objects are composed', col: 1, row: 0, tone: 'accent' },
          { id: 'beh', label: 'Behavioural', detail: 'how objects communicate', col: 2, row: 0, tone: 'success' },
          { id: 'cre-ex', label: 'Builder, Factory', detail: 'Singleton, Prototype', col: 0, row: 1, shape: 'note' },
          { id: 'str-ex', label: 'Adapter, Decorator', detail: 'Proxy, Facade, Composite', col: 1, row: 1, shape: 'note' },
          { id: 'beh-ex', label: 'Strategy, Observer', detail: 'Command, State, Visitor', col: 2, row: 1, shape: 'note' },
          { id: 'cre-mod', label: 'Records + factories', detail: 'enum singleton, DI', col: 0, row: 2, shape: 'pill', tone: 'neutral' },
          { id: 'str-mod', label: 'Composition', detail: 'dynamic proxies', col: 1, row: 2, shape: 'pill', tone: 'neutral' },
          { id: 'beh-mod', label: 'Lambdas', detail: 'sealed types + switch', col: 2, row: 2, shape: 'pill', tone: 'neutral' },
        ],
        edges: [
          { from: 'cre', to: 'cre-ex' },
          { from: 'str', to: 'str-ex' },
          { from: 'beh', to: 'beh-ex' },
          { from: 'cre-ex', to: 'cre-mod', label: 'modern Java', dashed: true },
          { from: 'str-ex', to: 'str-mod', label: 'modern Java', dashed: true },
          { from: 'beh-ex', to: 'beh-mod', label: 'modern Java', dashed: true },
        ],
      },
      {
        id: 'd-patterns-wrappers',
        kind: 'architecture',
        title: 'Decorators and an adapter around one interface',
        caption: 'Checkout depends only on PaymentGateway. Decorators keep that interface and add retries and metrics. The adapter at the edge translates it into the vendor SDK\'s API.',
        explanation: [
          'Start at **Checkout**, the client. It calls charge() on something it knows only as a **PaymentGateway**. That is the single interface shown in the note below.',
          'The call first reaches **RetryingGateway**, a Decorator that retries failed charges. Then it reaches **MeteredGateway**, a Decorator that records timings. Both forward the same charge() call.',
          'The dashed arrows show that both decorators implement **PaymentGateway**. They share one interface, so the group says you can stack them in any order.',
          'At the edge, **StripeAdapter** is an Adapter. It implements the same interface but translates charge() into createIntent() on the **Vendor SDK**, which has a different API.',
          'The takeaway: decorators keep the interface and add behaviour. The adapter changes the interface. Checkout never knows which wrappers or vendor sit behind it.',
        ],
        cols: 5,
        rows: 2,
        nodes: [
          { id: 'client', label: 'Checkout', detail: 'uses PaymentGateway', col: 0, row: 0, tone: 'primary' },
          { id: 'retry', label: 'RetryingGateway', detail: 'Decorator', col: 1, row: 0, tone: 'accent' },
          { id: 'metric', label: 'MeteredGateway', detail: 'Decorator', col: 2, row: 0, tone: 'accent' },
          { id: 'adapter', label: 'StripeAdapter', detail: 'Adapter', col: 3, row: 0, tone: 'warning' },
          { id: 'sdk', label: 'Vendor SDK', detail: 'its own API', col: 4, row: 0, tone: 'neutral' },
          { id: 'iface', label: 'PaymentGateway', detail: 'one interface', col: 1, row: 1, span: 2, shape: 'note', tone: 'primary' },
        ],
        edges: [
          { from: 'client', to: 'retry', label: 'charge()' },
          { from: 'retry', to: 'metric', label: 'charge()' },
          { from: 'metric', to: 'adapter', label: 'charge()' },
          { from: 'adapter', to: 'sdk', label: 'createIntent()' },
          { from: 'retry', to: 'iface', dashed: true },
          { from: 'metric', to: 'iface', dashed: true },
        ],
        groups: [{ label: 'Same interface: stackable', fromCol: 1, toCol: 3, fromRow: 0, toRow: 1, tone: 'accent' }],
      },
      {
        id: 'd-patterns-choose',
        kind: 'flow',
        title: 'Which wrapper or pattern fits?',
        caption: 'Start from the problem, not the pattern. Several questions end in a plain language feature rather than a class hierarchy.',
        explanation: [
          'Read the questions on the left from top to bottom. A yes arrow leads right to a pattern. A no arrow drops to the next question.',
          '**Varying algorithm?** If yes, use **Strategy**, usually just a lambda or an enum. If not, ask **Wrong interface?** and, if so, write an **Adapter** that translates at the edge.',
          '**Add behaviour around?** If an existing object needs retries, logging or caching, use a **Decorator**. Use a Proxy when the goal is to control access.',
          '**Many optional args?** If construction has many optional parameters, use a **Builder**; with only a few fields a record is enough.',
          'If the answer is no every time, you reach **None of these?**: write plain code first. The takeaway: start from the problem, and add a pattern only when it removes one.',
        ],
        cols: 2,
        rows: 5,
        nodes: [
          { id: 'q1', label: 'Varying algorithm?', col: 0, row: 0, tone: 'primary' },
          { id: 'a1', label: 'Strategy', detail: 'a lambda or enum', col: 1, row: 0, shape: 'pill', tone: 'success' },
          { id: 'q2', label: 'Wrong interface?', col: 0, row: 1, tone: 'primary' },
          { id: 'a2', label: 'Adapter', detail: 'translate at the edge', col: 1, row: 1, shape: 'pill', tone: 'success' },
          { id: 'q3', label: 'Add behaviour around?', col: 0, row: 2, tone: 'primary' },
          { id: 'a3', label: 'Decorator', detail: 'or Proxy to control access', col: 1, row: 2, shape: 'pill', tone: 'success' },
          { id: 'q4', label: 'Many optional args?', col: 0, row: 3, tone: 'primary' },
          { id: 'a4', label: 'Builder', detail: 'or a record if few', col: 1, row: 3, shape: 'pill', tone: 'success' },
          { id: 'none', label: 'None of these?', detail: 'write plain code first', col: 0, row: 4, shape: 'pill', tone: 'neutral' },
        ],
        edges: [
          { from: 'q1', to: 'a1', label: 'yes' },
          { from: 'q1', to: 'q2', label: 'no' },
          { from: 'q2', to: 'a2', label: 'yes' },
          { from: 'q2', to: 'q3', label: 'no' },
          { from: 'q3', to: 'a3', label: 'yes' },
          { from: 'q3', to: 'q4', label: 'no' },
          { from: 'q4', to: 'a4', label: 'yes' },
          { from: 'q4', to: 'none', label: 'no' },
        ],
      },
    ],
    variants: [
      {
        title: 'Creational patterns',
        intro: 'How objects are created. "Support" shows how directly the Java language or JDK provides the pattern.',
        items: [
          {
            name: 'Singleton',
            summary: 'Exactly one instance with a global access point.',
            support: 'supported',
            note: 'Modern Java: a single-constant enum is the safest form, but prefer one instance created at start-up and injected (Spring beans are singleton-scoped by default).',
            code: 'enum Registry { INSTANCE; }',
          },
          {
            name: 'Factory Method',
            summary: 'A method decides which concrete class to instantiate, hiding the choice from callers.',
            support: 'supported',
            note: 'Modern Java: static factories everywhere — List.of, Optional.of, Path.of, Integer.valueOf (which caches -128..127).',
            code: 'static Shape of(String kind) { return switch (kind) { case "c" -> new Circle(1); default -> new Square(1); }; }',
          },
          {
            name: 'Abstract Factory',
            summary: 'An object that creates families of related products that must be used together.',
            support: 'partial',
            note: 'Modern Java: still useful for pluggable families (DocumentBuilderFactory, XML/JDBC providers); often a record of Supplier fields is enough.',
          },
          {
            name: 'Builder',
            summary: 'Assemble a complex object step by step with named options; validate once in build().',
            support: 'supported',
            note: 'Modern Java: very much alive — HttpRequest.newBuilder(), Stream.builder(), StringBuilder. For two or three fields use a record.',
          },
          {
            name: 'Prototype',
            summary: 'Create new objects by copying an existing one.',
            support: 'partial',
            note: 'Modern Java: avoid Cloneable/clone() (broken contract, shallow copies); use copy constructors, static copy factories or record "withers".',
          },
        ],
      },
      {
        title: 'Structural patterns',
        intro: 'How classes and objects are composed into larger structures.',
        items: [
          {
            name: 'Adapter',
            summary: 'Convert one interface into the interface clients expect.',
            support: 'supported',
            note: 'Modern Java: essential at vendor and legacy boundaries. JDK: InputStreamReader, Arrays.asList.',
          },
          {
            name: 'Decorator',
            summary: 'Wrap an object implementing the same interface to add behaviour; decorators stack.',
            support: 'supported',
            note: 'Modern Java: retries, caching, metrics. JDK: BufferedInputStream, Collections.unmodifiableList. Function.andThen composes functional decorators.',
          },
          {
            name: 'Facade',
            summary: 'One simple entry point over a complicated subsystem.',
            support: 'supported',
            note: 'Modern Java: an application service in front of several repositories and clients; java.net.http.HttpClient over sockets, TLS and HTTP/2.',
          },
          {
            name: 'Proxy',
            summary: 'A stand-in with the same interface that controls access: lazy loading, remoting, security, transactions.',
            support: 'supported',
            note: 'Modern Java: java.lang.reflect.Proxy for interfaces; frameworks generate subclasses (Spring AOP, Hibernate lazy entities).',
          },
          {
            name: 'Composite',
            summary: 'Treat individual objects and trees of objects uniformly through one interface.',
            support: 'supported',
            note: 'Modern Java: a sealed interface with leaf and group records, processed recursively. JDK: java.awt Container/Component, file trees.',
            code: 'sealed interface Node permits Leaf, Group {}\nrecord Group(List<Node> children) implements Node {}',
          },
          {
            name: 'Bridge',
            summary: 'Split an abstraction from its implementation so both vary independently.',
            support: 'partial',
            note: 'Modern Java: appears as "abstraction holds an interface" — JDBC\'s API (abstraction) over vendor drivers (implementation); rarely named explicitly.',
          },
          {
            name: 'Flyweight',
            summary: 'Share immutable instances to save memory when many objects are equal.',
            support: 'supported',
            note: 'Modern Java: Integer.valueOf cache, interned string literals, Boolean.TRUE. Only worth it for very large numbers of identical small objects.',
          },
        ],
      },
      {
        title: 'Behavioural patterns',
        intro: 'How objects divide responsibility and communicate.',
        items: [
          {
            name: 'Strategy',
            summary: 'Encapsulate interchangeable algorithms behind one interface.',
            support: 'supported',
            note: 'Modern Java: a functional interface plus lambdas, or an enum implementing it. JDK: Comparator.',
            code: 'list.sort(Comparator.comparing(Order::total).reversed());',
          },
          {
            name: 'Observer',
            summary: 'Subscribers register with a subject and are notified of events.',
            support: 'partial',
            note: 'Modern Java: List<Consumer<Event>> listeners, java.util.concurrent.Flow, or a message broker. java.util.Observable is deprecated since Java 9.',
          },
          {
            name: 'Command',
            summary: 'Turn a request into an object that can be queued, logged or undone.',
            support: 'supported',
            note: 'Modern Java: Runnable/Callable submitted to an ExecutorService; records for undoable or serialisable commands.',
          },
          {
            name: 'Template Method',
            summary: 'A base class fixes the algorithm skeleton and subclasses fill in steps.',
            support: 'partial',
            note: 'Modern Java: prefer passing the varying step as a lambda (JdbcTemplate with RowMapper) over subclassing; AbstractList is a JDK example.',
          },
          {
            name: 'Iterator',
            summary: 'Traverse a collection without exposing its structure.',
            support: 'supported',
            note: 'Modern Java: built into the language — Iterable and the for-each loop; Spliterator and streams for bulk and parallel traversal.',
          },
          {
            name: 'State',
            summary: 'An object changes behaviour when its internal state changes, with one class per state.',
            support: 'supported',
            note: 'Modern Java: an enum with per-constant behaviour, or a sealed interface of state records with a switch for transitions.',
          },
          {
            name: 'Chain of Responsibility',
            summary: 'Pass a request along a chain of handlers until one handles it (or each adds to it).',
            support: 'supported',
            note: 'Modern Java: servlet Filter chains, Spring Security filter chain, logging handlers; a List<Function<Req, Optional<Resp>>> for simple cases.',
          },
          {
            name: 'Visitor',
            summary: 'Add operations to a fixed class hierarchy without changing it, via double dispatch (accept/visit).',
            support: 'partial',
            note: 'Modern Java: for closed hierarchies, sealed types with an exhaustive pattern-matching switch (Java 21) replace it. Still used for open or framework hierarchies.',
            code: 'double area(Shape s) {\n    return switch (s) {\n        case Circle c -> Math.PI * c.r() * c.r();\n        case Square q -> q.side() * q.side();\n    };\n}',
          },
        ],
      },
    ],
    deepDive: [
      {
        title: 'Why the enum Singleton is bullet-proof — and the lazy holder alternative',
        body: 'An enum constant is created during class initialisation, which the JVM performs exactly once under a lock (JLS §12.4.2), so no explicit synchronisation is needed. `Constructor.newInstance` refuses to create enum instances, and enum serialization writes only the constant\'s name, so deserialising returns the existing instance. For a non-enum lazy singleton, the **initialization-on-demand holder** idiom (a private static nested `Holder` class with the instance) gets the same guarantee lazily; double-checked locking is only correct with a `volatile` field, because without it another thread can see a reference to a partially constructed object under the Java Memory Model.',
        sources: [
          { label: 'JLS §12.4.2: Detailed Initialization Procedure', url: 'https://docs.oracle.com/javase/specs/jls/se21/html/jls-12.html#jls-12.4.2' },
          { label: 'Effective Java (3rd ed.), Item 3: Enforce the singleton property with a private constructor or an enum type' },
          { label: 'Java Concurrency in Practice, §16.2: Safe publication' },
        ],
      },
      {
        title: 'Visitor versus sealed types: the expression problem',
        body: 'Object-oriented hierarchies make it easy to add new **types** (a new subclass) but hard to add new **operations** (every class changes). Visitor flips that trade-off: new operations are easy, new types break every visitor. Sealed interfaces with record patterns give the same "easy operations" side without double dispatch, and the compiler checks exhaustiveness: adding a permitted subtype turns every non-exhaustive switch into a compile error. Choosing between polymorphic methods and exhaustive switches is choosing which axis of change you expect.',
        sources: [
          { label: 'JEP 409: Sealed Classes', url: 'https://openjdk.org/jeps/409' },
          { label: 'JEP 441: Pattern Matching for switch', url: 'https://openjdk.org/jeps/441' },
        ],
      },
      {
        title: 'Proxies explain framework "magic" — and its traps',
        body: '`java.lang.reflect.Proxy` creates, at run time, a class implementing given interfaces that routes every call to an `InvocationHandler`. Frameworks use this (or generated subclasses) to add transactions, security checks, caching and lazy loading around your beans. The consequence interviewers love: a call from one method of a bean to another method **on `this`** never passes through the proxy, so `@Transactional`, `@Cacheable` or `@Async` on the inner method silently does nothing. `final` classes and methods cannot be proxied by subclassing at all.',
        sources: [
          { label: 'java.lang.reflect.Proxy (Java SE 21 API)', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/reflect/Proxy.html' },
          { label: 'Spring Framework reference: Understanding AOP Proxies' },
        ],
      },
      {
        title: 'Where the catalogue came from',
        body: 'The idea of a pattern language comes from architect Christopher Alexander (*A Pattern Language*, 1977). Gamma, Helm, Johnson and Vlissides applied it to C++ and Smalltalk in *Design Patterns: Elements of Reusable Object-Oriented Software* (1994). Its two core rules are still the most quoted: "program to an interface, not an implementation" and "favor object composition over class inheritance".',
        sources: [{ label: 'Design Patterns: Elements of Reusable Object-Oriented Software (Gamma, Helm, Johnson, Vlissides, 1994)' }],
      },
    ],
  },
};
