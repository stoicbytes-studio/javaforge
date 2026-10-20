import type { LessonConcepts } from '@/types/curriculum';

/** Concept pages for module 3 (OOP & SOLID), keyed by lesson id. */
export const oopConcepts: Record<string, LessonConcepts> = {
  // -------------------------------------------------------------------------
  'o-classes-objects': {
    textbook: {
      definition:
        'A **class** is a reference type declaration that specifies the **fields**, **methods**, **constructors** and initialisers shared by a family of objects. An **object** is a class instance, created at run time by a class instance creation expression (`new`) or reflectively; it occupies storage on the heap, has its own copy of every instance field, and is manipulated only through **references**. Static members belong to the class itself rather than to any instance. **Encapsulation** restricts direct access to an object\'s state so that the class\'s own methods can maintain its invariants.',
      terms: [
        { term: 'Class instance creation expression', meaning: 'An expression of the form `new C(...)` that allocates a new object of class C, sets its fields to default values and invokes a constructor.' },
        { term: 'Reference', meaning: 'A value that points to an object, or the special value `null`; variables of a class type hold references, never objects themselves.' },
        { term: 'Instance field and static field', meaning: 'An instance field has a separate copy in every object; a static field has exactly one copy per class, shared by all its instances.' },
        { term: 'Constructor', meaning: 'A special member, named after its class and without a return type, that initialises a newly created object; it is invoked only by `new`, `this(...)` or `super(...)`.' },
        { term: 'Encapsulation', meaning: 'Hiding an object\'s representation behind access control so that only the class\'s own methods can read or change its state.' },
      ],
      source: 'JLS §8 (Classes), §12.5 (Creation of New Class Instances) and §15.9',
    },
    interviewDefinition:
      'A **class** is a type that bundles state (fields) with the behaviour (methods) allowed to change it; an **object** is a runtime instance of that class, allocated on the heap by `new` and reached only through references. Constructors establish the class\'s invariants, and **encapsulation** — private fields plus intention-revealing methods — keeps them true for the object\'s whole life.',
    interviewFollowUps: [
      {
        question: 'When does the compiler add a default constructor?',
        answer: 'Only when the class declares no constructor at all. It has the same access as the class and simply calls `super()`. Declaring any constructor removes it, which is why frameworks needing a no-arg constructor sometimes break after a constructor is added.',
      },
      {
        question: 'Can a constructor be private, final, static or abstract?',
        answer: 'It can be `private` (singletons, static factories, utility classes) but never `final`, `static` or `abstract` — constructors are not inherited or overridden, so those modifiers are meaningless and rejected by the compiler.',
      },
      {
        question: 'What is the difference between `this` and `this(...)`?',
        answer: '`this` is a reference to the current object (to disambiguate fields or pass yourself along). `this(...)` is a call to another constructor of the same class; it must be the first statement, and only one of `this(...)` or `super(...)` may appear.',
      },
    ],
    mnemonic: {
      device: '"All Zebras Initially Run" — the four steps of every `new`',
      expansion: [
        { key: 'A — Allocate', meaning: 'the JVM reserves heap memory for every field in the class hierarchy' },
        { key: 'Z — Zero', meaning: 'all fields start at default values: 0, false, null' },
        { key: 'I — Initialise', meaning: 'super(...) chain, then field initialisers and instance blocks, then the constructor body' },
        { key: 'R — Reference', meaning: '`new` returns a reference that the variable stores — never the object itself' },
      ],
      visual: 'A zebra crossing: the object is built stripe by stripe from the top of the hierarchy down, and only at the far side do you get the leash (the reference).',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'Cookie cutter and cookies',
        body: 'The class is the cutter: it fixes the shape. Each object is a cookie: same shape, its own icing (field values). Breaking one cookie does not affect the others — unless two variables are holding the *same* cookie, which is exactly what reference aliasing means.',
      },
      {
        kind: 'insight',
        title: 'Encapsulation is about invariants, not getters',
        body: 'A class with private fields and a public getter and setter for each one is not encapsulated in any useful sense — callers can still put it into any state. Encapsulation means the only way to change state is through operations that keep the rules true (`withdraw`, `reserve`, `rename`).',
      },
      {
        kind: 'real-world',
        title: 'Why JPA and Jackson want a no-arg constructor',
        body: 'Persistence and JSON frameworks create objects reflectively and then set fields. Hibernate requires a no-arg constructor (it may be `protected`), so adding a parameterised constructor to an entity without keeping a no-arg one can break loading at runtime. Records and constructor-binding modes (Jackson creators, Spring Boot `@ConfigurationProperties` constructor binding) avoid the problem.',
      },
      {
        kind: 'angle',
        title: 'Static means "per class per class loader"',
        body: 'A static field lives once per loaded class, not once per JVM. In an app server or test runner that loads the same class through two class loaders you get two independent copies of a "global" static — a classic source of confusing singleton bugs.',
      },
    ],
    diagrams: [
      {
        id: 'o-classes-objects-refs',
        kind: 'concept',
        title: 'Variables hold references; objects live on the heap',
        caption: 'a and c point at the same object, so a change through c is visible through a. The static counter exists once, alongside the class, not inside any object.',
        explanation: [
          'The **Stack** column holds local variables. **a** and **b** each hold a reference, an address that points to an object, not the object itself.',
          '**a** points at **BankAccount #1** (Ada, 1500) and **b** at **BankAccount #2** (Linus, 5000). Both objects live on the **Heap**, each with its own copy of every instance field.',
          'The dashed arrow from **c = a** shows aliasing: assignment copies the reference, not the object, so c and a now point at the same BankAccount #1.',
          'Because only one object sits behind a and c, a deposit made through c is visible when you read the balance through a.',
          'In the **Class data** column, **accountsOpened = 2** is a static field. It exists once per class, not inside any object, and counts both accounts.',
          'Takeaway: variables hold references, objects live on the heap, and static state belongs to the class rather than to any one object.',
        ],
        cols: 3,
        rows: 3,
        nodes: [
          { id: 'va', label: 'a', detail: 'local variable', col: 0, row: 0, shape: 'pill', tone: 'neutral' },
          { id: 'vb', label: 'b', detail: 'local variable', col: 0, row: 1, shape: 'pill', tone: 'neutral' },
          { id: 'vc', label: 'c = a', detail: 'alias, no copy made', col: 0, row: 2, shape: 'pill', tone: 'neutral' },
          { id: 'o1', label: 'BankAccount #1', detail: 'owner=Ada, 1500', col: 1, row: 0, tone: 'primary' },
          { id: 'o2', label: 'BankAccount #2', detail: 'owner=Linus, 5000', col: 1, row: 1, tone: 'primary' },
          { id: 'st', label: 'accountsOpened = 2', detail: 'static: one per class', col: 2, row: 0, shape: 'cylinder', tone: 'accent' },
        ],
        edges: [
          { from: 'va', to: 'o1' },
          { from: 'vb', to: 'o2' },
          { from: 'vc', to: 'o1', dashed: true },
        ],
        groups: [
          { label: 'Stack', fromCol: 0, toCol: 0, fromRow: 0, toRow: 2, tone: 'neutral' },
          { label: 'Heap', fromCol: 1, toCol: 1, fromRow: 0, toRow: 2, tone: 'primary' },
          { label: 'Class data', fromCol: 2, toCol: 2, fromRow: 0, toRow: 2, tone: 'accent' },
        ],
      },
      {
        id: 'o-classes-objects-new',
        kind: 'flow',
        title: 'What `new BankAccount("Ada")` does',
        caption: 'The class is initialised once, then every new object is zeroed and built through its constructor chain. If any step throws, no reference escapes.',
        explanation: [
          '**Class initialised?** comes first: on the first use of BankAccount the JVM runs its static initialisers once; later `new` expressions skip this step.',
          '**Allocate on heap** reserves space for every instance field, inherited ones included, because the size is known from the class. **Zero all fields** then sets them to 0, false or null.',
          'The **Constructor chain** runs next: any `this(...)` call, then `super(...)` up to Object, so the parent part is initialised before this class\'s own fields.',
          '**Validate + assign** is the constructor body: it checks the arguments and assigns fields. On the valid path the **Reference returned** is stored in the variable.',
          'The dashed invalid input arrow leads to **Exception thrown**: the constructor throws, `new` completes abruptly, and the caller never receives a reference to the half-built object.',
          'Takeaway: an object becomes usable only after its whole constructor chain succeeds, which is why constructors are the place to enforce invariants.',
        ],
        cols: 3,
        rows: 3,
        nodes: [
          { id: 'cls', label: 'Class initialised?', detail: 'statics run once, first use', col: 0, row: 0, tone: 'neutral' },
          { id: 'alloc', label: 'Allocate on heap', detail: 'size known from class', col: 1, row: 0, tone: 'primary' },
          { id: 'zero', label: 'Zero all fields', detail: '0, false, null', col: 2, row: 0, tone: 'primary' },
          { id: 'chain', label: 'Constructor chain', detail: 'this(...), then super(...)', col: 2, row: 1, tone: 'primary' },
          { id: 'body', label: 'Validate + assign', detail: 'constructor body', col: 1, row: 1, tone: 'primary' },
          { id: 'ref', label: 'Reference returned', detail: 'stored in the variable', col: 0, row: 1, shape: 'pill', tone: 'success' },
          { id: 'fail', label: 'Exception thrown', detail: 'object never reachable', col: 1, row: 2, shape: 'pill', tone: 'danger' },
        ],
        edges: [
          { from: 'cls', to: 'alloc' },
          { from: 'alloc', to: 'zero' },
          { from: 'zero', to: 'chain' },
          { from: 'chain', to: 'body' },
          { from: 'body', to: 'ref', label: 'valid' },
          { from: 'body', to: 'fail', label: 'invalid input', dashed: true },
        ],
      },
    ],
    variants: [
      {
        title: 'Kinds of constructors',
        intro: 'Java has one constructor mechanism, but these shapes come up constantly in code and interviews.',
        items: [
          {
            name: 'Default (compiler-generated)',
            summary: 'Added only when a class declares no constructor; takes no arguments, calls super() and has the class\'s access level.',
            support: 'supported',
            code: 'class Point { int x, y; }   // javac adds: Point() { super(); }',
          },
          {
            name: 'No-arg (explicit)',
            summary: 'A constructor you write with no parameters, often to set sensible defaults or satisfy frameworks.',
            support: 'supported',
            code: 'Point() { this.x = 0; this.y = 0; }',
          },
          {
            name: 'Parameterised',
            summary: 'Takes the values needed to build a valid object and validates them.',
            support: 'supported',
            code: 'Point(int x, int y) { this.x = x; this.y = y; }',
          },
          {
            name: 'Copy-style',
            summary: 'Builds a new object from an existing one. Java has no built-in copy constructor (unlike C++); it is a convention you write yourself, usually preferred over clone().',
            support: 'partial',
            note: 'Copy mutable fields defensively (new ArrayList<>(other.items)).',
            code: 'Point(Point other) { this(other.x, other.y); }',
          },
          {
            name: 'Chained with this(...)',
            summary: 'Delegates to another constructor in the same class so validation lives in one place. Must be the first statement.',
            support: 'supported',
            code: 'Point() { this(0, 0); }',
          },
          {
            name: 'Chained with super(...)',
            summary: 'Calls a specific parent constructor; inserted implicitly as super() when omitted. Required when the parent has no no-arg constructor.',
            support: 'supported',
            code: 'Point3D(int x, int y, int z) { super(x, y); this.z = z; }',
          },
          {
            name: 'Private',
            summary: 'Prevents outside instantiation — for singletons, static factory methods and utility classes.',
            support: 'supported',
            code: 'private Point(int x, int y) { ... }\nstatic Point of(int x, int y) { return new Point(x, y); }',
          },
          {
            name: 'Compact canonical (records)',
            summary: 'A record constructor without a parameter list that validates or normalises; fields are assigned automatically at the end (Java 16).',
            support: 'supported',
            code: 'record Range(int lo, int hi) {\n    Range { if (lo > hi) throw new IllegalArgumentException(); }\n}',
          },
        ],
      },
      {
        title: 'The four pillars of OOP',
        intro: 'Interviewers often open with these. Java supports all four directly.',
        items: [
          {
            name: 'Encapsulation',
            summary: 'Hide state behind methods that enforce the rules; private fields, controlled mutation.',
            support: 'supported',
            code: 'private long balanceCents;\nboolean withdraw(long cents) { ... }',
          },
          {
            name: 'Abstraction',
            summary: 'Expose what an object does, not how; interfaces and abstract classes define the contract.',
            support: 'supported',
            code: 'interface PaymentGateway { Receipt charge(Money amount); }',
          },
          {
            name: 'Inheritance',
            summary: 'Reuse and specialise a type through an is-a relationship; single class inheritance, multiple interface inheritance.',
            support: 'supported',
            code: 'class SavingsAccount extends Account { }',
          },
          {
            name: 'Polymorphism',
            summary: 'One interface, many implementations; the runtime object decides which override runs.',
            support: 'supported',
            code: 'PaymentGateway g = new StripeGateway();\ng.charge(amount);',
          },
        ],
      },
      {
        title: 'Kinds of variables in a class',
        intro: 'Where a variable is declared decides where it lives, how long it lasts and whether it gets a default value (JLS §4.12.3).',
        items: [
          {
            name: 'Instance variable (field)',
            summary: 'Declared in the class body without static. Every object gets its own copy, initialised to a default value (0, false, null).',
            support: 'supported',
            code: 'class Account { private long balanceCents; }',
          },
          {
            name: 'Static (class) variable',
            summary: 'Declared with static. One copy per class (per class loader), shared by all instances and accessed as ClassName.field.',
            support: 'supported',
            code: 'static int accountsOpened;',
          },
          {
            name: 'Local variable',
            summary: 'Declared inside a method, constructor or block. Lives in the stack frame and must be definitely assigned before use; it has no default value.',
            support: 'supported',
            code: 'int fee = 30;',
          },
          {
            name: 'Parameter',
            summary: 'A method or constructor parameter: a local variable initialised with the argument value. Java passes everything by value, including references.',
            support: 'supported',
            code: 'void deposit(long cents) { ... }',
          },
        ],
      },
    ],
    deepDive: [
      {
        title: 'What an object costs: headers, padding and compact headers',
        body: 'On 64-bit HotSpot every object starts with a header: a mark word (hash code, lock state, GC age) and a class pointer — 12 bytes with compressed class pointers — and objects are aligned to 8 bytes. A `new Object()` therefore costs 16 bytes, and a class with one `int` field also costs 16. **Compact object headers** shrink the header to 8 bytes: experimental in JDK 24 (JEP 450) and a product option, still off by default, in JDK 25 (JEP 519, `-XX:+UseCompactObjectHeaders`). For millions of small objects, header size can dominate memory use.',
        sources: [
          { label: 'JEP 450: Compact Object Headers (Experimental)', url: 'https://openjdk.org/jeps/450' },
          { label: 'JEP 519: Compact Object Headers', url: 'https://openjdk.org/jeps/519' },
        ],
      },
      {
        title: 'Flexible constructor bodies (Java 25)',
        body: 'For decades `this(...)`/`super(...)` had to be the very first statement, forcing argument validation into static helper methods. JEP 513, final in Java 25 after previews in 22–24, allows statements *before* the explicit constructor call, as long as they do not use the object under construction (no reading `this` fields or calling instance methods). You can validate arguments, or even initialise the subclass\'s own fields, before the superclass constructor runs. On Java 21 the old rule still applies.',
        sources: [{ label: 'JEP 513: Flexible Constructor Bodies', url: 'https://openjdk.org/jeps/513' }],
      },
      {
        title: '`new` does not always allocate on the heap',
        body: 'The JIT performs **escape analysis**: if an object never leaves the method that creates it (not stored in a field, not returned, not passed to non-inlined code), C2 can replace it with its fields held in registers ("scalar replacement") and skip the allocation entirely. Small, short-lived value objects — iterators, `Point`s in a loop, builders — are therefore cheaper than they look, which is one reason idiomatic encapsulated Java is not slower than hand-flattened code.',
        sources: [
          { label: 'Java Language Specification §12.5: Creation of New Class Instances', url: 'https://docs.oracle.com/javase/specs/jls/se21/html/jls-12.html#jls-12.5' },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  'o-inheritance': {
    textbook: {
      definition:
        '**Inheritance** is the mechanism by which a class, the **subclass**, is declared as an extension of another class, its direct **superclass**, and thereby acquires the superclass\'s members that are declared public or protected, together with package-access members when both classes are in the same package. Private members, constructors and initialisers are not inherited. A subclass may add members, **hide** inherited fields and static methods, and **override** inherited instance methods. Invocations of overridden methods are resolved by **dynamic dispatch** on the run-time class of the receiver. Every class except `Object` has exactly one direct superclass.',
      terms: [
        { term: 'Subclass and superclass', meaning: 'If class C extends class S, then S is the direct superclass of C and C is a direct subclass of S; the subclass relation is transitive.' },
        { term: 'Override', meaning: 'An instance method in a subclass overrides an inherited instance method when its signature is a subsignature of the inherited method\'s signature.' },
        { term: 'Hiding', meaning: 'A field, or a static method, declared in a subclass with the same name or signature as one in the superclass hides it; selection then uses the compile-time type.' },
        { term: 'Dynamic dispatch', meaning: 'Selection at run time of the method implementation to execute, based on the actual class of the receiver object rather than its declared type.' },
      ],
      source: 'JLS §8.1.4 (Superclasses and Subclasses) and §8.4.8 (Inheritance, Overriding, and Hiding)',
    },
    interviewDefinition:
      '**Inheritance** lets a subclass reuse and specialise a superclass through an is-a relationship. **Overriding** replaces an inherited instance method with the same signature, and **dynamic dispatch** makes the JVM run the override belonging to the object\'s *runtime* class, not the variable\'s declared type. Fields, static methods and private methods are bound at compile time, so they are hidden or simply not inherited — never overridden.',
    interviewFollowUps: [
      {
        question: 'What are the rules for a legal override?',
        answer: 'Same name and parameter types; return type the same or a subtype (covariant); access the same or wider; no new or broader checked exceptions. The method must be inherited and not final, static or private.',
      },
      {
        question: 'Can you override a static method?',
        answer: 'No. Declaring a static method with the same signature in a subclass *hides* the parent\'s; which one runs is fixed by the declared type at compile time. Declaring an instance method that matches a parent static method (or vice versa) is a compile error.',
      },
      {
        question: 'Why does `@Override` matter if the code compiles without it?',
        answer: 'It turns silent mistakes into compile errors: a typo in the name or a wrong parameter type (`equals(Point)` instead of `equals(Object)`) creates an overload instead of an override, and `@Override` makes the compiler reject it.',
      },
    ],
    mnemonic: {
      device: '"Same call, wider door, narrower promises"',
      expansion: [
        { key: 'Same call', meaning: 'identical method name and parameter types (otherwise it is an overload)' },
        { key: 'Wider door', meaning: 'access may stay the same or widen (protected → public), never narrow' },
        { key: 'Narrower return', meaning: 'return type may be a subtype of the parent\'s (covariant return)' },
        { key: 'Narrower throws', meaning: 'checked exceptions may be the same, fewer or more specific — never broader or new' },
      ],
      visual: 'A franchise shop (subclass) may open a bigger entrance and promise more specific goods, but it may never lock customers out or surprise them with new risks the head office never mentioned.',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'A job description and the people who fill it',
        body: 'The superclass is the job description ("can drive a vehicle"); the variable\'s declared type is the job title on the rota. Who actually turns up — and how they drive — is decided on the day by the person (the runtime object). A substitute can be *better* qualified, but must not refuse duties the job description promises.',
      },
      {
        kind: 'insight',
        title: 'Overloading versus overriding is decided at different times',
        body: 'The compiler chooses the method *signature* using declared types; the JVM chooses the *implementation* of that signature using the runtime class. That two-step split explains almost every puzzling polymorphism question, including why `equals(Point)` is never called by a `HashSet`.',
      },
      {
        kind: 'real-world',
        title: 'Frameworks rely on overridable methods',
        body: 'Spring creates subclass proxies (CGLIB) for `@Transactional` and `@Cacheable` beans that override your public methods to add behaviour around them. Mark such a method `final` or `private` and the proxy cannot override it — the annotation silently does nothing.',
      },
      {
        kind: 'angle',
        title: 'Every non-final method is a public promise',
        body: 'Once someone can extend your class, every overridable method — and every call between your own methods — becomes part of your API (the "fragile base class" problem). That is why *Effective Java* advises: design and document for inheritance, or else prohibit it with `final`.',
      },
    ],
    diagrams: [
      {
        id: 'o-inheritance-ref-vs-object',
        kind: 'concept',
        title: 'Declared type versus runtime type',
        caption: 'The declared type decides what you may call and which field you read; the runtime class decides which override runs.',
        explanation: [
          'Start at **Animal a**: the variable\'s declared type is Animal, and the references arrow shows it points at a **Dog object** whose runtime class is Dog.',
          'Calling **a.speak()** follows the dynamic dispatch arrow: the JVM looks at the real object, finds Dog\'s override and returns "Woof".',
          'The compile-time arrow leads to **a.name**: fields are never overridden, so the compiler reads Animal.name because a is declared as Animal, even if Dog declares its own name.',
          '**a.kingdom()** calls a static method, which is bound by the declared type, so Animal.kingdom runs. Static methods are hidden, never overridden.',
          'A cast changes the declared type: **((Dog) a).name** reads Dog.name. The object did not change; only the compiler\'s view of it did.',
          'Takeaway: the declared type decides fields, statics and which methods may be called; the runtime class decides which override runs.',
        ],
        cols: 3,
        rows: 2,
        nodes: [
          { id: 'var', label: 'Animal a', detail: 'declared (static) type', col: 0, row: 0, shape: 'pill', tone: 'neutral' },
          { id: 'obj', label: 'Dog object', detail: 'runtime class: Dog', col: 1, row: 0, tone: 'primary' },
          { id: 'speak', label: 'a.speak()', detail: 'runs Dog.speak: "Woof"', col: 2, row: 0, tone: 'success' },
          { id: 'name', label: 'a.name', detail: 'reads Animal.name', col: 0, row: 1, tone: 'warning' },
          { id: 'stat', label: 'a.kingdom()', detail: 'static: Animal.kingdom', col: 1, row: 1, tone: 'warning' },
          { id: 'cast', label: '((Dog) a).name', detail: 'reads Dog.name', col: 2, row: 1, tone: 'neutral' },
        ],
        edges: [
          { from: 'var', to: 'obj', label: 'references' },
          { from: 'obj', to: 'speak', label: 'dynamic dispatch' },
          { from: 'var', to: 'name', label: 'compile-time' },
        ],
      },
      {
        id: 'o-inheritance-dispatch',
        kind: 'flow',
        title: 'How `a.speak()` finds Dog.speak',
        caption: 'javac only records the signature Animal.speak(); the JVM resolves the actual method at runtime through the receiver\'s method table.',
        explanation: [
          'In the **Compile time** group, **javac** checks that Animal declares speak() and records only that signature; it cannot know which subclass will turn up.',
          'The class file contains an **invokevirtual** instruction naming Animal.speak:()String, which is everything the bytecode says about the call.',
          'At runtime the JVM answers **Receiver class?** by reading the object header, finds Dog, and looks in the **Dog vtable slot** for speak.',
          'That slot points at Dog\'s override, so **Dog.speak runs** and returns "Woof", although the source code mentioned only Animal.',
          'The dashed fixed target arrow from **super.speak()** shows the contrast: it compiles to invokespecial, which calls one exact method chosen at compile time, with no vtable lookup.',
          'Takeaway: the compiler fixes the signature, and the JVM picks the implementation from the receiver\'s class while the program runs.',
        ],
        cols: 3,
        rows: 2,
        nodes: [
          { id: 'javac', label: 'javac', detail: 'checks Animal has speak()', col: 0, row: 0, tone: 'primary' },
          { id: 'bc', label: 'invokevirtual', detail: 'Animal.speak:()String', col: 1, row: 0, shape: 'note', tone: 'accent' },
          { id: 'recv', label: 'Receiver class?', detail: 'read object header', col: 2, row: 0, tone: 'primary' },
          { id: 'vt', label: 'Dog vtable slot', detail: 'speak → Dog.speak', col: 2, row: 1, shape: 'cylinder', tone: 'accent' },
          { id: 'run', label: 'Dog.speak runs', detail: 'returns "Woof"', col: 1, row: 1, shape: 'pill', tone: 'success' },
          { id: 'sup', label: 'super.speak()', detail: 'invokespecial: no lookup', col: 0, row: 1, tone: 'neutral' },
        ],
        edges: [
          { from: 'javac', to: 'bc' },
          { from: 'bc', to: 'recv', label: 'at runtime' },
          { from: 'recv', to: 'vt' },
          { from: 'vt', to: 'run' },
          { from: 'sup', to: 'run', label: 'fixed target', dashed: true },
        ],
        groups: [
          { label: 'Compile time', fromCol: 0, toCol: 1, fromRow: 0, toRow: 0, tone: 'neutral' },
        ],
      },
      {
        id: 'o-inheritance-init',
        kind: 'flow',
        title: 'Initialisation order for `new Child()`',
        caption: 'Statics run once, parent first. Every object is then built top-down: the parent part is complete before any child initialiser runs.',
        explanation: [
          '**1 Parent static** runs first, on the first use of Child, because a superclass must be initialised before its subclass.',
          '**2 Child static** follows. Both static steps happen once per class, not once per object.',
          'The each new arrow starts object creation: once the super(...) chain reaches the parent, **3 Parent init** runs the parent\'s field initialisers and instance blocks, then **4 Parent ctor body** runs.',
          'Only then does **5 Child init** run the child\'s field initialisers and instance blocks, followed by **6 Child ctor body**, the code after super(...).',
          'Takeaway: the parent part is complete before any child code runs, so an overridable method called from a parent constructor sees uninitialised child fields.',
        ],
        cols: 3,
        rows: 2,
        nodes: [
          { id: 'ps', label: '1 Parent static', detail: 'first use only', col: 0, row: 0, tone: 'neutral' },
          { id: 'cs', label: '2 Child static', detail: 'first use only', col: 1, row: 0, tone: 'neutral' },
          { id: 'pi', label: '3 Parent init', detail: 'fields + instance blocks', col: 2, row: 0, tone: 'primary' },
          { id: 'pc', label: '4 Parent ctor body', col: 2, row: 1, tone: 'primary' },
          { id: 'ci', label: '5 Child init', detail: 'fields + instance blocks', col: 1, row: 1, tone: 'accent' },
          { id: 'cc', label: '6 Child ctor body', col: 0, row: 1, shape: 'pill', tone: 'success' },
        ],
        edges: [
          { from: 'ps', to: 'cs' },
          { from: 'cs', to: 'pi', label: 'each new' },
          { from: 'pi', to: 'pc' },
          { from: 'pc', to: 'ci' },
          { from: 'ci', to: 'cc' },
        ],
      },
    ],
    variants: [
      {
        title: 'Method overriding rules',
        intro: 'What a subclass method with the same signature may and may not do (JLS 8.4.8).',
        items: [
          {
            name: 'Covariant return type',
            summary: 'The override may return a subtype of the parent\'s return type (Java 5+). javac emits a synthetic bridge method so old callers still link.',
            support: 'supported',
            code: 'class Animal { Animal mate() { ... } }\nclass Dog extends Animal { @Override Dog mate() { ... } }',
          },
          {
            name: 'Widening access',
            summary: 'protected → public, or package-private → protected/public, is allowed.',
            support: 'supported',
            code: '@Override public String describe() { ... }  // was protected',
          },
          {
            name: 'Narrowing access',
            summary: 'public → protected is a compile error: callers of the parent type must still be able to call it.',
            support: 'not-supported',
            code: '@Override protected void start() { }  // error if Service.start() is public',
          },
          {
            name: 'Fewer or narrower checked exceptions',
            summary: 'An override may throw the same checked exceptions, subclasses of them, or none. Unchecked exceptions are unrestricted.',
            support: 'supported',
            code: '@Override void load() throws FileNotFoundException { }  // parent throws IOException',
          },
          {
            name: 'Broader or new checked exceptions',
            summary: 'Throwing Exception where the parent declared IOException breaks callers\' catch blocks, so it is rejected.',
            support: 'not-supported',
            code: '@Override void load() throws Exception { }  // error',
          },
          {
            name: 'Overriding static methods',
            summary: 'Not possible: a same-signature static method in the subclass hides the parent\'s, bound by declared type.',
            support: 'not-supported',
          },
          {
            name: 'Overriding private or final methods',
            summary: 'Private methods are not inherited (a same-named method is unrelated); final methods cannot be overridden.',
            support: 'not-supported',
          },
        ],
      },
      {
        title: 'What a subclass can do with inherited members',
        intro: 'The member kind and signature decide which of these applies (JLS §8.3, §8.4.8 and §8.4.9).',
        items: [
          {
            name: 'Inherit as-is',
            summary: 'Use the parent\'s public, protected and (in the same package) package-private members unchanged.',
            support: 'supported',
            code: 'class Dog extends Animal { }\nnew Dog().eat();   // Animal.eat',
          },
          {
            name: 'Override an instance method',
            summary: 'A method with the same signature replaces the behaviour; chosen at run time by dynamic dispatch.',
            support: 'supported',
            code: '@Override String speak() { return "Woof"; }',
          },
          {
            name: 'Extend with super.method()',
            summary: 'Override and call the parent version to add behaviour before or after it.',
            support: 'supported',
            code: '@Override void save() { audit(); super.save(); }',
          },
          {
            name: 'Overload',
            summary: 'Same name, different parameter types: a new method alongside the inherited one, chosen at compile time.',
            support: 'supported',
            code: 'void eat(Food f, int grams) { ... }',
          },
          {
            name: 'Add new members',
            summary: 'Fields and methods only the subclass has; callable only through a reference of the subclass type.',
            support: 'supported',
            code: 'void fetch() { ... }',
          },
          {
            name: 'Hide a field or static method',
            summary: 'A same-named field or same-signature static method hides the parent\'s; the declared type selects which one is used.',
            support: 'supported',
            note: 'Legal but confusing; avoid it in new code.',
            code: 'static String kingdom() { return "Canids"; }',
          },
          {
            name: 'Inherit constructors',
            summary: 'Constructors are never inherited; each subclass declares its own and chains to a parent one with super(...).',
            support: 'not-supported',
          },
        ],
      },
    ],
    deepDive: [
      {
        title: 'Bridge methods make covariant returns and generics work',
        body: 'The JVM identifies a method by name **and** full descriptor, including the return type. When `Dog.mate()` returns `Dog` but overrides `Animal mate()`, javac also emits a synthetic **bridge** `Animal mate()` in Dog that calls the `Dog`-returning method, so `invokevirtual Animal.mate()` still finds an override. The same trick makes `compareTo(T)` in a generic class override the erased `compareTo(Object)`. Bridges show up in stack traces and in `getDeclaredMethods()` with `isBridge() == true`.',
        sources: [
          { label: 'JLS §8.4.8: Inheritance, Overriding, and Hiding', url: 'https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html#jls-8.4.8' },
          { label: 'JLS §15.12.4.5: Create Frame, Synchronize, Transfer Control (bridge methods)', url: 'https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.12.4.5' },
        ],
      },
      {
        title: 'Virtual calls are usually free: class hierarchy analysis and inline caches',
        body: 'HotSpot tracks which classes are loaded. If only one class implements a virtual method (**class hierarchy analysis**) or a call site has only ever seen one or two receiver types (**inline caching** from profiling), C2 inlines the target directly, guarded by a cheap type check. If a new subclass is loaded later, the optimised code is **deoptimised**. Polymorphism becomes measurably costly only at **megamorphic** call sites that see many receiver types.',
        sources: [{ label: 'JVM Specification §6.5: invokevirtual', url: 'https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-6.html#jvms-6.5.invokevirtual' }],
      },
      {
        title: 'Design for inheritance or prohibit it',
        body: '*Effective Java* (Item 19) observes that a subclass depends on its superclass\'s **self-use**: if `addAll` happens to call `add`, an override of both double-counts. The JDK\'s own `HashSet` documentation does not promise either way. Classes meant for extension should document which overridable methods they call ("@implSpec") and never call them from constructors; all other classes should be `final` — the reason records and many JDK value types are final.',
        sources: [{ label: 'Effective Java, 3rd edition — Items 18 and 19 (Joshua Bloch)' }],
      },
    ],
  },

  // -------------------------------------------------------------------------
  'o-inheritance-types': {
    textbook: {
      definition:
        '**Types of inheritance** classify the shapes that subtype relationships among classes and interfaces can take: **single** (one direct parent), **multilevel** (a chain of parents), **hierarchical** (several subclasses of one parent), **multiple** (more than one direct parent) and **hybrid** (a combination of these). In Java a class has exactly one direct superclass but may implement any number of **superinterfaces**, and an interface may extend several interfaces. Java therefore supports multiple inheritance of type and, through default methods, of behaviour, but not multiple inheritance of **state**.',
      terms: [
        { term: 'Direct superclass', meaning: 'The class named in a class\'s extends clause, or Object when the clause is absent; every class except Object has exactly one.' },
        { term: 'Superinterface', meaning: 'An interface named in a class\'s implements clause or an interface\'s extends clause, or any interface those interfaces themselves extend.' },
        { term: 'Multiple inheritance of state', meaning: 'Inheriting instance fields from more than one class. Java forbids it, which avoids duplicated fields in diamond-shaped hierarchies.' },
        { term: 'Diamond problem', meaning: 'The ambiguity that arises when a type inherits the same member from one ancestor along two different paths through the hierarchy.' },
        { term: 'Default method', meaning: 'An interface instance method with a body, declared with default, which implementing classes inherit unless a class or more specific interface overrides it.' },
      ],
      source: 'JLS §8.1.4, §8.1.5 and §9.4.1; The Java Tutorials, "Multiple Inheritance of State, Implementation, and Type"',
    },
    interviewDefinition:
      'The classic inheritance types are **single**, **multilevel**, **hierarchical**, **multiple** and **hybrid**. Java classes have exactly one direct superclass (ultimately `Object`), so classes support single, multilevel and hierarchical inheritance only. Multiple and hybrid inheritance are available through **interfaces**: multiple inheritance of type, and since Java 8 of behaviour via default methods — but never of instance state, which is what avoids the diamond problem.',
    interviewFollowUps: [
      {
        question: 'How does Java resolve two inherited default methods with the same signature?',
        answer: 'Class methods win over interface defaults; otherwise a more specific (sub)interface wins; otherwise the class must override, optionally delegating with `Flyer.super.move()`. An unresolved conflict is a compile error, never a runtime choice.',
      },
      {
        question: 'Is Java\'s lack of multiple class inheritance a limitation in practice?',
        answer: 'Rarely. Interfaces give multiple types, default methods give shared behaviour, and composition gives reuse of stateful implementation. What you lose is inheriting *fields* from two parents, which is exactly the part that causes ambiguity.',
      },
      {
        question: 'How do you prevent a class from being extended?',
        answer: 'Declare it `final`, make every constructor `private` (subclasses outside the class cannot call one), or seal it with `sealed ... permits` (Java 17) to allow only named subclasses. Individual methods can be `final`.',
      },
    ],
    mnemonic: {
      device: '"SMH-MH": classes Shake My Hand, interfaces Mix Hybrids',
      expansion: [
        { key: 'S — Single', meaning: 'one parent, one child: classes ✔' },
        { key: 'M — Multilevel', meaning: 'a chain A → B → C: classes ✔' },
        { key: 'H — Hierarchical', meaning: 'one parent, many children: classes ✔' },
        { key: 'M — Multiple', meaning: 'many parents: interfaces only' },
        { key: 'H — Hybrid', meaning: 'a mix including multiple: interfaces only' },
      ],
      visual: 'A family tree drawn in pen (classes: every child has exactly one parent line) with dotted pencil lines added for interfaces, which may connect a child to as many "roles" as it likes.',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'One biological parent, many qualifications',
        body: 'In Java a class has one parent it physically inherits from — fields, constructors and all. Interfaces are like qualifications: a person can be a certified driver, first-aider and translator at once. Each qualification promises abilities, but none gives you a second set of organs.',
      },
      {
        kind: 'insight',
        title: 'The diamond is about state, not methods',
        body: 'If `D` inherited from `B` and `C`, both of which extend `A`, does `D` contain one copy of `A`\'s fields or two? Whose constructor initialises them? Java removes the question by never letting two parents contribute fields. Method ambiguity is then manageable — and Java makes it a compile error you must resolve.',
      },
      {
        kind: 'real-world',
        title: 'Hierarchical and multiple-of-type in the JDK',
        body: '`ArrayList` extends `AbstractList` (multilevel: `AbstractList` → `AbstractCollection` → `Object`), while also implementing `List`, `RandomAccess`, `Cloneable` and `Serializable` — a hybrid shape made possible by interfaces. `Integer`, `Long` and `Double` all extend `Number` (hierarchical), and `Integer` is `final`, so the chain stops there.',
      },
      {
        kind: 'angle',
        title: 'Adding a default method can break someone else\'s build',
        body: 'If a class already inherits `describe()` as a default from one interface, and a library adds a same-signature default to another interface it implements, the class no longer compiles. Default methods made interface evolution *binary* compatible, but not always *source* compatible.',
      },
    ],
    diagrams: [
      {
        id: 'o-inheritance-types-shapes',
        kind: 'concept',
        title: 'Single, multilevel and hierarchical in one tree',
        caption: 'Every class has exactly one parent line up to Object. Car → Vehicle is single, ElectricCar → Car → Vehicle is multilevel, and Car and Truck sharing Vehicle is hierarchical.',
        explanation: [
          'At the top sits **Object**, the root of every class. **Vehicle** extends it, so even a class with no extends clause has exactly one parent.',
          '**Car** extends Vehicle: one class with one parent is single inheritance.',
          '**Truck** also extends Vehicle. Car and Truck sharing one parent is hierarchical inheritance, which is what the **Hierarchical** group marks.',
          '**ElectricCar** extends Car, which extends Vehicle: a chain several levels deep is multilevel inheritance, and each level inherits everything above it.',
          '**final class Money** has no arrows pointing into it: final forbids subclasses, so that branch of the tree stops there.',
          'Takeaway: every extends arrow points to exactly one parent, so Java classes always form a tree with Object at the root.',
        ],
        cols: 3,
        rows: 4,
        nodes: [
          { id: 'obj', label: 'Object', detail: 'root of every class', col: 1, row: 0, shape: 'pill', tone: 'neutral' },
          { id: 'veh', label: 'Vehicle', col: 1, row: 1, tone: 'primary' },
          { id: 'car', label: 'Car', detail: 'single: one parent', col: 0, row: 2, tone: 'primary' },
          { id: 'truck', label: 'Truck', detail: 'sibling of Car', col: 2, row: 2, tone: 'primary' },
          { id: 'ev', label: 'ElectricCar', detail: 'multilevel: 3 deep', col: 0, row: 3, tone: 'accent' },
          { id: 'fin', label: 'final class Money', detail: 'no subclasses allowed', col: 2, row: 3, tone: 'danger' },
        ],
        edges: [
          { from: 'veh', to: 'obj', label: 'extends' },
          { from: 'car', to: 'veh', label: 'extends' },
          { from: 'truck', to: 'veh', label: 'extends' },
          { from: 'ev', to: 'car', label: 'extends' },
        ],
        groups: [{ label: 'Hierarchical', fromCol: 0, toCol: 2, fromRow: 1, toRow: 2, tone: 'primary' }],
      },
      {
        id: 'o-inheritance-types-diamond',
        kind: 'concept',
        title: 'The diamond: forbidden for classes, resolved for interfaces',
        caption: 'For classes, D would get two paths to A\'s fields, so `extends B, C` does not compile. With interfaces there is no state; Duck must override the clashing defaults and may pick one with X.super.',
        explanation: [
          'In the **Classes** group, **class B** and **class C** both extend **class A**, which owns the field count.',
          'The dashed arrows show **class D extends B, C**, which does not compile: D would reach A\'s field count along two paths, so whose copy and whose constructor would apply?',
          'In the **Interfaces** group, **Flyer** and **Swimmer** each supply a default move() but no instance fields, so there is no state to duplicate.',
          '**Duck implements both** interfaces legally. Because the two defaults clash, the compiler forces Duck to override move().',
          'Following the may delegate arrow, Duck\'s override can call **Flyer.super.move()** to reuse one chosen interface default explicitly.',
          'Takeaway: Java bans the class diamond because of shared state, and turns the interface diamond into a choice you make at compile time.',
        ],
        cols: 4,
        rows: 3,
        nodes: [
          { id: 'a', label: 'class A', detail: 'has field count', col: 0, row: 0, span: 2, tone: 'neutral' },
          { id: 'b', label: 'class B', col: 0, row: 1, tone: 'neutral' },
          { id: 'c', label: 'class C', col: 1, row: 1, tone: 'neutral' },
          { id: 'd', label: 'class D extends B, C', detail: 'compile error', col: 0, row: 2, span: 2, tone: 'danger' },
          { id: 'fl', label: 'Flyer', detail: 'default move()', col: 2, row: 0, tone: 'accent' },
          { id: 'sw', label: 'Swimmer', detail: 'default move()', col: 3, row: 0, tone: 'accent' },
          { id: 'duck', label: 'Duck implements both', detail: 'overrides move()', col: 2, row: 1, span: 2, tone: 'success' },
          { id: 'sup', label: 'Flyer.super.move()', detail: 'explicit choice', col: 2, row: 2, span: 2, shape: 'pill', tone: 'success' },
        ],
        edges: [
          { from: 'b', to: 'a' },
          { from: 'c', to: 'a' },
          { from: 'd', to: 'b', dashed: true },
          { from: 'd', to: 'c', dashed: true },
          { from: 'duck', to: 'fl' },
          { from: 'duck', to: 'sw' },
          { from: 'duck', to: 'sup', label: 'may delegate' },
        ],
        groups: [
          { label: 'Classes', fromCol: 0, toCol: 1, fromRow: 0, toRow: 2, tone: 'danger' },
          { label: 'Interfaces', fromCol: 2, toCol: 3, fromRow: 0, toRow: 2, tone: 'success' },
        ],
      },
      {
        id: 'o-inheritance-types-resolve',
        kind: 'flow',
        title: 'Which `move()` does a class get?',
        caption: 'The compiler applies these rules in order. The last box is not a runtime fallback: an unresolved conflict stops compilation.',
        explanation: [
          'Start with **Superclass has it?**: if a superclass declares move(), concrete or abstract, the yes arrow leads to **Class wins** and interface defaults are ignored.',
          'Otherwise ask **More specific interface?**: if one interface extends the other, as Guard extends Animal, then **Sub-interface wins** and its default is used.',
          'If neither rule applies, the class **Must override** move() itself, because two unrelated defaults are left.',
          'Inside that override it may call **X.super.move()** to delegate to the default of one chosen direct superinterface.',
          'The dashed if omitted arrow leads to **Compile error**: a missing override is rejected by javac, never resolved at run time.',
          'Takeaway: classes beat interfaces, specific interfaces beat general ones, and anything still ambiguous must be settled by you.',
        ],
        cols: 3,
        rows: 3,
        nodes: [
          { id: 'q1', label: 'Superclass has it?', detail: 'concrete or abstract', col: 0, row: 0, tone: 'primary' },
          { id: 'r1', label: 'Class wins', detail: 'interface defaults ignored', col: 1, row: 0, shape: 'pill', tone: 'success' },
          { id: 'q2', label: 'More specific interface?', detail: 'Guard extends Animal', col: 0, row: 1, tone: 'primary' },
          { id: 'r2', label: 'Sub-interface wins', detail: 'Guard.sound()', col: 1, row: 1, shape: 'pill', tone: 'success' },
          { id: 'q3', label: 'Must override', detail: 'else compile error', col: 0, row: 2, tone: 'warning' },
          { id: 'r3', label: 'X.super.move()', detail: 'optional delegation', col: 1, row: 2, shape: 'pill', tone: 'accent' },
          { id: 'err', label: 'Compile error', detail: 'inherits unrelated defaults', col: 2, row: 2, shape: 'pill', tone: 'danger' },
        ],
        edges: [
          { from: 'q1', to: 'r1', label: 'yes' },
          { from: 'q1', to: 'q2', label: 'no' },
          { from: 'q2', to: 'r2', label: 'yes' },
          { from: 'q2', to: 'q3', label: 'no' },
          { from: 'q3', to: 'r3', label: 'override' },
          { from: 'r3', to: 'err', label: 'if omitted', dashed: true },
        ],
      },
    ],
    variants: [
      {
        title: 'The five types of inheritance',
        intro: 'Support refers to Java classes; interfaces are noted where they make a type possible.',
        items: [
          {
            name: 'Single',
            summary: 'One subclass extends one superclass.',
            support: 'supported',
            code: 'class Vehicle { }\nclass Car extends Vehicle { }',
          },
          {
            name: 'Multilevel',
            summary: 'A chain where a subclass is itself a superclass; constructors run from the top of the chain down.',
            support: 'supported',
            note: 'Keep chains shallow: each level couples to everything above it.',
            code: 'class Vehicle { }\nclass Car extends Vehicle { }\nclass ElectricCar extends Car { }',
          },
          {
            name: 'Hierarchical',
            summary: 'Several subclasses share one superclass.',
            support: 'supported',
            code: 'class Car extends Vehicle { }\nclass Truck extends Vehicle { }\nclass Bus extends Vehicle { }',
          },
          {
            name: 'Multiple',
            summary: 'One type with several direct parents. Not allowed for classes (diamond problem); allowed for interfaces — a class may implement many and an interface may extend many.',
            support: 'partial',
            note: 'Classes: not supported. Interfaces: multiple inheritance of type, and of behaviour via default methods, never of state.',
            code: '// class Duck extends Flyer, Swimmer { }   // does not compile\nclass Duck implements Flyer, Swimmer {\n    @Override public String move() {\n        return Flyer.super.move() + " and " + Swimmer.super.move();\n    }\n}',
          },
          {
            name: 'Hybrid',
            summary: 'A combination of two or more types (for example hierarchical plus multiple). Possible only when the multiple part comes from interfaces.',
            support: 'partial',
            note: 'Classes alone: not supported. Class + interfaces: supported.',
            code: 'abstract class Bird { }\ninterface Flyer { default String move() { return "fly"; } }\ninterface Swimmer { default String move() { return "swim"; } }\nclass Duck extends Bird implements Flyer, Swimmer {\n    @Override public String move() { return Flyer.super.move(); }\n}\nclass Penguin extends Bird implements Swimmer { }',
          },
        ],
      },
      {
        title: 'Ways to stop or limit inheritance',
        items: [
          { name: 'final class', summary: 'No subclasses at all (String, Integer, every record and enum without bodies).', support: 'supported', code: 'final class Money { }' },
          { name: 'final method', summary: 'Subclasses inherit it but cannot override it.', support: 'supported', code: 'final String audit() { ... }' },
          { name: 'sealed ... permits', summary: 'Only the listed subclasses may extend (Java 17); each must be final, sealed or non-sealed.', support: 'supported', code: 'sealed class Shape permits Circle, Square { }' },
          { name: 'private constructors', summary: 'Subclasses must call a super constructor, so none can exist outside the class (nested classes still can).', support: 'supported', code: 'class Util { private Util() { } }' },
        ],
      },
    ],
    deepDive: [
      {
        title: 'How the compiler decides a default method is "inherited"',
        body: 'JLS 8.4.8 says a class inherits a default method from a superinterface only if no other method it inherits *overrides* it from the class. In the diamond `Pet extends Animal`, `Guard extends Animal` (with its own `sound()`), and `class Dog implements Pet, Guard`, `Animal.sound()` is overridden by `Guard.sound()`, so Dog inherits only Guard\'s — no conflict, it prints "bark". JLS 9.4.1.3 then makes it a compile error when two inherited defaults remain and neither overrides the other.',
        sources: [
          { label: 'JLS §8.4.8: Inheritance, Overriding, and Hiding', url: 'https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html#jls-8.4.8' },
          { label: 'JLS §9.4.1.3: Inheriting Methods with Override-Equivalent Signatures', url: 'https://docs.oracle.com/javase/specs/jls/se21/html/jls-9.html#jls-9.4.1.3' },
        ],
      },
      {
        title: '`X.super.m()` is a non-virtual call',
        body: '`Flyer.super.move()` compiles to `invokespecial` on the named interface\'s method, exactly like `super.m()` for a superclass: no dynamic lookup, so it always runs Flyer\'s default even if a subclass of Duck overrides `move()` again. The JLS allows naming only a *direct* superinterface, and not one whose method is already overridden by another direct superinterface — otherwise you could bypass an override the class itself inherits.',
        sources: [{ label: 'JLS §15.12.1: Compile-Time Step 1 — Determine Type to Search', url: 'https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.12.1' }],
      },
      {
        title: 'Why Java chose single class inheritance',
        body: 'Java\'s original 1990s white paper lists C++\'s multiple inheritance as a source of complexity. C++ needs virtual base classes to share one copy of a diamond\'s common base and has subtle rules for who constructs it. By keeping one superclass, Java gets a single, linear object layout (field offsets fixed down the chain), an unambiguous constructor order and simple vtable layout — then recovers most of the expressiveness with interfaces and, from Java 8, default methods (JSR 335).',
        sources: [
          { label: 'The Java Language Environment white paper (James Gosling, Henry McGilton)' },
          { label: 'JSR 335: Lambda Expressions for the Java Programming Language (default methods)', url: 'https://jcp.org/en/jsr/detail?id=335' },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  'o-polymorphism-types': {
    textbook: {
      definition:
        '**Polymorphism** is the ability of a single name, expression or operation to denote or act on values of several types. Java provides **ad-hoc polymorphism** through method overloading, resolved at compile time from the declared types of the arguments; **subtype (inclusion) polymorphism**, under which a value of a subtype may be used wherever its supertype is expected, combined with method overriding and **dynamic dispatch** at run time; and **parametric polymorphism** through generic classes and methods, type-checked at compile time and implemented by **erasure**.',
      terms: [
        { term: 'Ad-hoc polymorphism', meaning: 'One name bound to separately written implementations for different argument types, such as overloaded methods; the choice is made statically.' },
        { term: 'Subtype polymorphism', meaning: 'Substitutability of a subtype value where a supertype is expected; in Java it is realised by class extension and interface implementation.' },
        { term: 'Parametric polymorphism', meaning: 'One implementation, written once with type parameters, that works uniformly for every type argument, such as `List<T>`.' },
        { term: 'Static and dynamic binding', meaning: 'Static binding fixes a method or field at compile time; dynamic binding selects an instance-method implementation at run time from the receiver\'s class.' },
        { term: 'Type erasure', meaning: 'The compilation strategy that removes generic type arguments from bytecode, replacing type variables with their bounds and inserting casts where needed.' },
      ],
      source: 'Cardelli and Wegner, "On Understanding Types, Data Abstraction, and Polymorphism" (1985); JLS §8.4.8, §8.4.9 and §15.12',
    },
    interviewDefinition:
      '**Polymorphism** lets one name or interface work with many types. In Java: **compile-time** (static) polymorphism is method overloading, resolved by the compiler from declared argument types; **runtime** (dynamic) polymorphism is overriding, resolved by the JVM from the receiver\'s actual class; **parametric** polymorphism is generics; **subtype** polymorphism lets a subclass stand in for its supertype. Fields, static and private methods are statically bound.',
    interviewFollowUps: [
      {
        question: 'How does the compiler pick between overloads?',
        answer: 'In three phases: first without boxing or varargs (exact match, primitive widening, subtyping), then allowing boxing/unboxing, then allowing varargs. It stops at the first phase that finds a candidate and chooses the most specific; if none is most specific, the call is ambiguous.',
      },
      {
        question: 'Is method overloading really polymorphism?',
        answer: 'It is **ad-hoc** polymorphism: the same name with separately written implementations per type, chosen at compile time. Many interviewers expect "compile-time polymorphism = overloading"; the precise answer adds that it involves no dynamic dispatch at all.',
      },
      {
        question: 'Why is `obj.equals(other)` with `equals(MyType)` not called by collections?',
        answer: 'Collections call `equals(Object)`. An `equals(MyType)` method is an overload, chosen only when the compiler sees a `MyType` argument; it never overrides `Object.equals`, so dynamic dispatch never reaches it.',
      },
    ],
    mnemonic: {
      device: '"Overloads read the label, overrides read the box"',
      expansion: [
        { key: 'Label', meaning: 'the declared type written on the variable — what the compiler sees; it picks the overload, fields and statics' },
        { key: 'Box', meaning: 'the actual object inside — what the JVM sees; it picks the override' },
        { key: 'One body, any type', meaning: 'generics (parametric) never look inside the box at all: one implementation for every T' },
      ],
      visual: 'A parcel labelled "Animal" with a dog inside. The sorting office (compiler) routes it by the label; when opened (runtime) it barks, not "...".',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'A universal remote',
        body: 'The "power" button (one interface) works on a TV, a soundbar and a projector — each device decides what "power on" means (runtime polymorphism). The remote also has "volume +" and "volume + (hold)", two buttons with the same name but different inputs (overloading). And the battery slot fits any AA brand (parametric).',
      },
      {
        kind: 'insight',
        title: 'Two decisions per call, made at two different times',
        body: 'For `p.print(doc)` the compiler first chooses *which signature* from `p`\'s declared type and `doc`\'s declared type. At runtime the JVM chooses *which implementation* of that fixed signature from `p`\'s object. The argument\'s runtime type is never consulted — Java is single-dispatch. Double dispatch needs the Visitor pattern or a pattern-matching switch.',
      },
      {
        kind: 'real-world',
        title: 'Strategy beans replace if/else chains',
        body: 'Payment services commonly inject a `Map<String, PaymentGateway>` or `List<DiscountRule>` and call the interface method. Adding a new gateway means adding one class; the calling code never changes. That is subtype plus runtime polymorphism doing the Open/Closed principle\'s job.',
      },
      {
        kind: 'angle',
        title: 'Generics are erased; overriding is not',
        body: 'Parametric polymorphism exists only at compile time: `List<String>` and `List<Integer>` are the same class at runtime, so you cannot overload `f(List<String>)` and `f(List<Integer>)` (same erasure) or ask `x instanceof T`. Subtype polymorphism, by contrast, is fully visible at runtime through the object\'s class.',
      },
    ],
    diagrams: [
      {
        id: 'o-polymorphism-types-map',
        kind: 'concept',
        title: 'The kinds of polymorphism and when they are decided',
        caption: 'Everything on the left is settled by javac; only overriding defers its choice to the running JVM.',
        explanation: [
          '**Polymorphism** at the top branches into four Java mechanisms: **Overloading**, **Generics**, **Subtyping** and **Overriding**.',
          'Overloading (ad-hoc) is picked by javac from the declared argument types, so its arrow leads to **Compile time**, meaning static binding.',
          'Generics (parametric) are checked by the compiler and then erased, as the erased arrow says, so they also end at Compile time.',
          'Subtyping lets a Dog stand where an Animal is expected; the enables arrow shows that this substitution is what makes overriding useful.',
          'Overriding is the only branch that reaches **Run time**: the JVM picks the implementation from the receiver\'s class while the program runs.',
          'Takeaway: most polymorphism is settled by the compiler; only calls to overridden instance methods are decided at run time.',
        ],
        cols: 4,
        rows: 3,
        nodes: [
          { id: 'root', label: 'Polymorphism', detail: 'one name, many types', col: 1, row: 0, span: 2, shape: 'pill', tone: 'primary' },
          { id: 'ovl', label: 'Overloading', detail: 'ad-hoc: print(int), print(String)', col: 0, row: 1, tone: 'neutral' },
          { id: 'gen', label: 'Generics', detail: 'parametric: List<T>', col: 1, row: 1, tone: 'neutral' },
          { id: 'sub', label: 'Subtyping', detail: 'Dog usable as Animal', col: 2, row: 1, tone: 'accent' },
          { id: 'ovr', label: 'Overriding', detail: 'dynamic dispatch', col: 3, row: 1, tone: 'accent' },
          { id: 'ct', label: 'Compile time', detail: 'static binding', col: 0, row: 2, span: 2, shape: 'pill', tone: 'neutral' },
          { id: 'rt', label: 'Run time', detail: 'receiver\'s class decides', col: 2, row: 2, span: 2, shape: 'pill', tone: 'success' },
        ],
        edges: [
          { from: 'root', to: 'ovl' },
          { from: 'root', to: 'gen' },
          { from: 'root', to: 'sub' },
          { from: 'root', to: 'ovr' },
          { from: 'ovl', to: 'ct' },
          { from: 'gen', to: 'ct', label: 'erased' },
          { from: 'sub', to: 'ovr', label: 'enables' },
          { from: 'ovr', to: 'rt' },
        ],
      },
      {
        id: 'o-polymorphism-types-overload',
        kind: 'flow',
        title: 'Overload resolution in three phases',
        caption: 'The compiler stops at the first phase with any applicable method, then picks the most specific — so widening beats boxing, and boxing beats varargs.',
        explanation: [
          'The call **pick(5)** starts the search with the declared argument type, int; the value at run time plays no part.',
          '**Phase 1** tries methods applicable without boxing or varargs: exact match, primitive widening and subtyping. If any is found, the found arrow leads to **Most specific wins**.',
          'If none applies, **Phase 2** also allows boxing and unboxing, so pick(Integer) becomes possible; if still nothing fits, **Phase 3** also allows varargs.',
          'Among the candidates of the first successful phase, the most specific is chosen; for example pick(int) beats pick(long).',
          'The dashed arrow to **Ambiguous call** applies when no single candidate is most specific, and **No method found** means even Phase 3 failed. Both are compile errors.',
          'Takeaway: widening beats boxing and boxing beats varargs, because the compiler stops at the first phase that finds anything.',
        ],
        cols: 3,
        rows: 3,
        nodes: [
          { id: 'call', label: 'pick(5)', detail: 'declared arg types', col: 0, row: 0, shape: 'pill', tone: 'neutral' },
          { id: 'p1', label: 'Phase 1', detail: 'exact, widening, subtype', col: 1, row: 0, tone: 'primary' },
          { id: 'p2', label: 'Phase 2', detail: '+ boxing / unboxing', col: 1, row: 1, tone: 'primary' },
          { id: 'p3', label: 'Phase 3', detail: '+ varargs', col: 1, row: 2, tone: 'primary' },
          { id: 'spec', label: 'Most specific wins', detail: 'int beats long', col: 2, row: 0, tone: 'success' },
          { id: 'amb', label: 'Ambiguous call', detail: 'compile error', col: 2, row: 1, shape: 'pill', tone: 'danger' },
          { id: 'none', label: 'No method found', detail: 'compile error', col: 2, row: 2, shape: 'pill', tone: 'danger' },
        ],
        edges: [
          { from: 'call', to: 'p1' },
          { from: 'p1', to: 'spec', label: 'found' },
          { from: 'p1', to: 'p2', label: 'none' },
          { from: 'p2', to: 'spec', label: 'found' },
          { from: 'p2', to: 'p3', label: 'none' },
          { from: 'p3', to: 'none', label: 'none' },
          { from: 'spec', to: 'amb', label: 'no single best', dashed: true },
        ],
      },
      {
        id: 'o-polymorphism-types-vtable',
        kind: 'architecture',
        title: 'Virtual method tables (conceptual)',
        caption: 'A subclass copies its parent\'s table and replaces the slots it overrides. send() lives in the same slot in both tables, so a call through Notifier is one indexed lookup.',
        explanation: [
          'The call **n.send(msg)** compiles to invokevirtual for one method slot; the compiler knows the slot but not which object will be there.',
          'If the receiver is an **EmailNotifier object**, its header points to its class, whose **Email vtable** maps send to the Email implementation.',
          'If the receiver is an **SmsNotifier object**, the same slot in the **Sms vtable** maps send to the Sms implementation; toString points at Object\'s version in both.',
          'Both tables live in the **Class metadata (Metaspace)** group. A subclass copies its parent\'s table and replaces only the slots it overrides, so send sits at the same index in each.',
          '**Statics and fields** are not in the vtable at all: they are bound at compile time, which is why they are never polymorphic.',
          'Takeaway: a virtual call costs one header read plus one indexed table lookup, which is why dynamic dispatch is cheap.',
        ],
        cols: 3,
        rows: 3,
        nodes: [
          { id: 'call', label: 'n.send(msg)', detail: 'invokevirtual slot 5', col: 1, row: 0, shape: 'pill', tone: 'neutral' },
          { id: 'eh', label: 'EmailNotifier object', detail: 'header → its class', col: 0, row: 1, tone: 'primary' },
          { id: 'sh', label: 'SmsNotifier object', detail: 'header → its class', col: 2, row: 1, tone: 'primary' },
          { id: 'ev', label: 'Email vtable', detail: 'toString=Object, send=Email', col: 0, row: 2, shape: 'cylinder', tone: 'accent' },
          { id: 'sv', label: 'Sms vtable', detail: 'toString=Object, send=Sms', col: 2, row: 2, shape: 'cylinder', tone: 'accent' },
          { id: 'stat', label: 'Statics and fields', detail: 'not in the vtable', col: 1, row: 2, shape: 'note', tone: 'warning' },
        ],
        edges: [
          { from: 'call', to: 'eh', label: 'if receiver' },
          { from: 'call', to: 'sh', label: 'if receiver' },
          { from: 'eh', to: 'ev' },
          { from: 'sh', to: 'sv' },
        ],
        groups: [{ label: 'Class metadata (Metaspace)', fromCol: 0, toCol: 2, fromRow: 2, toRow: 2, tone: 'accent' }],
      },
    ],
    variants: [
      {
        title: 'Types of polymorphism',
        intro: 'Interviews usually ask for compile-time vs runtime; the type-theory names below are what the precise answer adds.',
        items: [
          {
            name: 'Compile-time (static) — overloading',
            summary: 'Same method name, different parameter lists; the compiler picks one from declared argument types.',
            support: 'supported',
            code: 'static int area(int side) { ... }\nstatic int area(int w, int h) { ... }',
          },
          {
            name: 'Runtime (dynamic) — overriding',
            summary: 'A subclass replaces an inherited instance method; the JVM picks the implementation from the object\'s class.',
            support: 'supported',
            code: 'Notifier n = new EmailNotifier();\nn.send("disk full");   // EmailNotifier.send',
          },
          {
            name: 'Parametric — generics',
            summary: 'One implementation works for any type argument; checked at compile time, erased at runtime.',
            support: 'supported',
            note: 'Type arguments must be reference types today (no List<int>).',
            code: 'static <T> T firstOr(List<T> items, T fallback) { ... }',
          },
          {
            name: 'Subtype (inclusion)',
            summary: 'A value of a subtype can be used wherever the supertype is expected — the basis of runtime polymorphism.',
            support: 'supported',
            code: 'List<String> names = new ArrayList<>();',
          },
          {
            name: 'Ad-hoc',
            summary: 'One name with type-specific implementations: overloading, and built-in operators such as + for numbers and strings. Java has no user-defined operator overloading.',
            support: 'partial',
            code: 'System.out.println(1 + 2);     // 3\nSystem.out.println("1" + 2);   // 12',
          },
          {
            name: 'Coercion',
            summary: 'Implicit conversions let one operation accept several types: primitive widening, boxing and unboxing.',
            support: 'supported',
            code: 'double d = 5;          // int widened\nInteger boxed = 5;     // autoboxing',
          },
          {
            name: 'Multiple dispatch',
            summary: 'Choosing an implementation by the runtime types of several arguments. Java dispatches only on the receiver; emulate with Visitor or a pattern-matching switch.',
            support: 'not-supported',
            code: 'switch (shape) { case Circle c -> ...; case Square s -> ...; }',
          },
        ],
      },
      {
        title: 'Static vs dynamic binding by member kind',
        items: [
          { name: 'Instance methods (non-private, non-final)', summary: 'Dynamically bound: overridden.', support: 'supported' },
          { name: 'Static methods', summary: 'Statically bound by declared type; a same-signature subclass method hides it.', support: 'not-supported' },
          { name: 'Fields', summary: 'Statically bound; a same-named subclass field hides the parent\'s.', support: 'not-supported' },
          { name: 'Private methods', summary: 'Not inherited, so never overridden; calls are bound to the declaring class.', support: 'not-supported' },
          { name: 'Overload selection', summary: 'Always compile time, from the declared types of the arguments.', support: 'not-supported' },
        ],
      },
    ],
    deepDive: [
      {
        title: 'Four invoke instructions encode the binding decision',
        body: 'javac compiles calls to `invokestatic` (static methods: no receiver), `invokespecial` (constructors, `super.m()`, and historically private methods: exact target), `invokevirtual` (class methods: vtable lookup) or `invokeinterface` (interface methods: itable search, since a class can implement interfaces in any order). Since Java 11 (JEP 181, nest-based access control) private methods between nestmates are called with `invokevirtual`/`invokeinterface`, but they still cannot be overridden. `invokedynamic` (Java 7) lets a bootstrap method choose the target — used by lambdas and string concatenation.',
        sources: [
          { label: 'JVM Specification §6.5: Instructions (invokevirtual, invokeinterface, invokespecial, invokestatic)', url: 'https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-6.html#jvms-6.5' },
          { label: 'JEP 181: Nest-Based Access Control', url: 'https://openjdk.org/jeps/181' },
        ],
      },
      {
        title: 'Overload resolution is specified in surprising detail',
        body: 'JLS 15.12.2 defines the three applicability phases (strict, loose, variable-arity) and then "most specific method" (15.12.2.5). The phase design keeps pre-Java-5 code meaning the same after boxing and varargs were added: a call that compiled in Java 1.4 still picks the same overload. That is why `remove(int)` on a `List<Integer>` removes by *index* — `list.remove(1)` matches `remove(int)` in phase 1 before `remove(Object)` via boxing in phase 2.',
        sources: [
          { label: 'JLS §15.12.2: Compile-Time Step 2 — Determine Method Signature', url: 'https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.12.2' },
          { label: 'Effective Java, 3rd edition — Item 52: Use overloading judiciously (Joshua Bloch)' },
        ],
      },
      {
        title: 'Megamorphic call sites are where dispatch costs show',
        body: 'HotSpot profiles each virtual call site. Monomorphic (one receiver class) and bimorphic sites are inlined behind a type check; a site that sees many classes becomes **megamorphic** and falls back to a real vtable/itable lookup, which also blocks inlining of the callee. In hot loops over a heterogeneous `List<Shape>`, this can matter; sealed hierarchies with a pattern-matching `switch` or splitting collections by type are common fixes when profiling shows it.',
        sources: [{ label: 'JVM Specification §5.4.6: Method Selection', url: 'https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-5.html#jvms-5.4.6' }],
      },
    ],
  },

  // -------------------------------------------------------------------------
  'o-interfaces': {
    textbook: {
      definition:
        'An **interface** is a reference type whose members are constants, abstract method declarations, default and static methods and, since Java 9, private methods; it declares no instance fields and no constructors. A class that **implements** an interface must provide implementations of its abstract methods or be declared abstract. An **abstract class** is a class that cannot be instantiated and may declare abstract methods alongside fields, constructors and concrete methods. A **sealed** class or interface restricts its direct subtypes to an explicitly **permitted** set.',
      terms: [
        { term: 'Abstract method', meaning: 'A method declared without a body; every concrete class that inherits it must provide an implementation.' },
        { term: 'Default method', meaning: 'An interface method with a body, marked default, inherited by implementing classes that do not override it (Java 8).' },
        { term: 'Functional interface', meaning: 'An interface with exactly one abstract method, whose instances can be created with lambda expressions or method references.' },
        { term: 'Sealed type and permits clause', meaning: 'A class or interface declared sealed whose permits clause lists the only classes or interfaces allowed to extend or implement it directly (Java 17).' },
      ],
      source: 'JLS §9 (Interfaces), §8.1.1.1 (abstract Classes) and §8.1.1.2 (sealed, non-sealed, and final Classes); JEP 409',
    },
    interviewDefinition:
      'An **interface** is a contract of public operations that any class may implement, many at once; it carries no instance state but may include `default`, `static` (Java 8) and `private` (Java 9) methods. An **abstract class** is a partial implementation with fields, constructors and any visibility, extended by at most one subclass parent. **Sealed** types (Java 17) restrict which classes may extend or implement them, enabling exhaustive pattern matching.',
    interviewFollowUps: [
      {
        question: 'When would you choose an abstract class over an interface today?',
        answer: 'When implementations share **state** or need a **constructor** to establish invariants, or when you want non-public members and a final template method. For a capability or a component boundary — especially one with unrelated implementors — choose an interface.',
      },
      {
        question: 'Why were default methods added?',
        answer: 'To evolve existing interfaces without breaking every implementation. Java 8 needed to add `stream()`, `forEach` and `removeIf` to `Collection`/`Iterable`; without defaults every third-party collection would have stopped compiling.',
      },
      {
        question: 'What must a subclass of a sealed type be?',
        answer: 'Exactly one of `final`, `sealed` (with its own permits) or `non-sealed` (re-opens that branch). Records and enums are implicitly final. Permitted subclasses must be in the same module, or the same package in the unnamed module.',
      },
    ],
    mnemonic: {
      device: '"Interfaces promise, abstract classes provide, sealed classes close the door"',
      expansion: [
        { key: 'Promise', meaning: 'an interface states what can be done; many per class, no instance state' },
        { key: 'Provide', meaning: 'an abstract class supplies shared fields, constructors and a template algorithm; one per class' },
        { key: 'Close the door', meaning: 'sealed ... permits lists every allowed subtype, so switches can be exhaustive' },
      ],
      visual: 'A job advert (interface), a half-built house with the foundations poured (abstract class), and a guest list at the door (sealed permits).',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'A wall socket standard',
        body: 'A socket standard (interface) says what shape the plug must be and what voltage you get. Any manufacturer can build a lamp or a laptop charger to it, and a device can support several standards at once (USB-C and Qi charging). The standard owns no electricity itself — just the promise.',
      },
      {
        kind: 'insight',
        title: 'An interface belongs to its client',
        body: 'The most useful interfaces are defined by the code that *uses* them ("I need something that can `charge(Money)`"), not extracted from an implementation. Client-owned interfaces stay small, which is the heart of both the Interface Segregation and Dependency Inversion principles.',
      },
      {
        kind: 'real-world',
        title: 'Sealed results in payment and parsing code',
        body: '`sealed interface PaymentResult permits Approved, Declined, RequiresAction` with record variants is now a common modelling pattern. Adding a variant turns every non-exhaustive switch into a compile error — the compiler hands you a to-do list instead of production finding the missed case.',
      },
      {
        kind: 'angle',
        title: 'Functional interfaces are interfaces with one hole',
        body: 'Any interface with exactly one abstract method — even one full of defaults, like `Comparator` — can be implemented by a lambda. `@FunctionalInterface` only asks the compiler to enforce the one-abstract-method rule; it is not required for lambdas to work.',
      },
    ],
    diagrams: [
      {
        id: 'o-interfaces-sealed',
        kind: 'concept',
        title: 'A sealed hierarchy',
        caption: 'Shape names its subtypes. Each one must declare how it continues: final (records are implicitly final), sealed again, or non-sealed to reopen its branch.',
        explanation: [
          '**sealed interface Shape** at the top lists its only permitted subtypes: Circle, Polygon and Blob. No other class may implement it directly.',
          '**record Circle** implements Shape and is implicitly final, so its branch ends immediately.',
          '**sealed Polygon** continues the hierarchy, but only with its own permits list; **final Square** is one of its allowed subtypes and closes that branch.',
          '**non-sealed Blob** deliberately reopens its branch, so the dashed arrow from **class Splat extends Blob** is allowed without Splat being listed anywhere.',
          'Takeaway: every permitted subtype must say final, sealed or non-sealed, so the author decides exactly where the hierarchy is closed.',
        ],
        cols: 3,
        rows: 3,
        nodes: [
          { id: 'shape', label: 'sealed interface Shape', detail: 'permits Circle, Polygon, Blob', col: 0, row: 0, span: 3, tone: 'primary' },
          { id: 'circle', label: 'record Circle', detail: 'implicitly final', col: 0, row: 1, tone: 'success' },
          { id: 'poly', label: 'sealed Polygon', detail: 'permits Square, Triangle', col: 1, row: 1, tone: 'accent' },
          { id: 'blob', label: 'non-sealed Blob', detail: 'anyone may extend', col: 2, row: 1, tone: 'warning' },
          { id: 'sq', label: 'final Square', col: 1, row: 2, tone: 'success' },
          { id: 'any', label: 'class Splat extends Blob', detail: 'allowed', col: 2, row: 2, tone: 'neutral' },
        ],
        edges: [
          { from: 'circle', to: 'shape' },
          { from: 'poly', to: 'shape' },
          { from: 'blob', to: 'shape' },
          { from: 'sq', to: 'poly' },
          { from: 'any', to: 'blob', dashed: true },
        ],
      },
      {
        id: 'o-interfaces-boundary',
        kind: 'architecture',
        title: 'An interface as a component boundary',
        caption: 'CheckoutService depends only on the PaymentGateway contract it owns. Real and fake implementations plug in from outside, and an abstract class shares plumbing between the real ones.',
        explanation: [
          '**CheckoutService** holds the business logic and depends on **PaymentGateway**, an interface declaring charge(Money), never on a concrete class.',
          '**FakeGateway** implements PaymentGateway directly, so tests can run checkout without a network or real money.',
          '**HttpGateway** is an abstract class that also implements the interface and holds shared plumbing such as retries and authentication.',
          '**StripeGateway** and **AdyenGateway** extend HttpGateway, inheriting that plumbing and adding only provider-specific code.',
          'Takeaway: the interface is the boundary that lets implementations be swapped, while the abstract class removes duplication between similar implementations.',
        ],
        cols: 3,
        rows: 3,
        nodes: [
          { id: 'svc', label: 'CheckoutService', detail: 'business logic', col: 0, row: 0, tone: 'primary' },
          { id: 'port', label: 'PaymentGateway', detail: 'interface: charge(Money)', col: 1, row: 0, tone: 'accent' },
          { id: 'base', label: 'HttpGateway', detail: 'abstract: retries, auth', col: 1, row: 1, tone: 'neutral' },
          { id: 'fake', label: 'FakeGateway', detail: 'used in tests', col: 2, row: 0, tone: 'success' },
          { id: 'stripe', label: 'StripeGateway', col: 0, row: 2, tone: 'neutral' },
          { id: 'adyen', label: 'AdyenGateway', col: 2, row: 2, tone: 'neutral' },
        ],
        edges: [
          { from: 'svc', to: 'port', label: 'depends on' },
          { from: 'fake', to: 'port', label: 'implements' },
          { from: 'base', to: 'port', label: 'implements' },
          { from: 'stripe', to: 'base', label: 'extends' },
          { from: 'adyen', to: 'base', label: 'extends' },
        ],
      },
      {
        id: 'o-interfaces-exhaustive',
        kind: 'flow',
        title: 'Why sealed switches need no default',
        caption: 'Because the compiler knows the complete list of subtypes, it can prove a switch covers them all — and flags every switch when the list grows.',
        explanation: [
          'The **permits list** tells the compiler every subtype of Shape: Circle, Rectangle and Square.',
          'A **switch (shape)** with one case per subtype covers them all, so the all covered arrow leads to **Exhaustive**: it compiles with no default branch.',
          'In the bottom row someone does **Add Triangle** to the permits list. On the next build every switch that lacks a Triangle case becomes a **Compile error**.',
          'The fix is **Add case Triangle**; the dashed arrow back to Exhaustive shows the switch is complete again.',
          'Takeaway: a sealed hierarchy turns a forgotten case into a compiler to-do list instead of a production bug.',
        ],
        cols: 3,
        rows: 2,
        nodes: [
          { id: 'perm', label: 'permits list', detail: 'Circle, Rectangle, Square', col: 0, row: 0, shape: 'note', tone: 'accent' },
          { id: 'sw', label: 'switch (shape)', detail: 'case per subtype', col: 1, row: 0, tone: 'primary' },
          { id: 'ok', label: 'Exhaustive', detail: 'compiles, no default', col: 2, row: 0, shape: 'pill', tone: 'success' },
          { id: 'add', label: 'Add Triangle', detail: 'to permits', col: 0, row: 1, tone: 'warning' },
          { id: 'err', label: 'Compile error', detail: 'switch does not cover all', col: 1, row: 1, shape: 'pill', tone: 'danger' },
          { id: 'fix', label: 'Add case Triangle', col: 2, row: 1, tone: 'success' },
        ],
        edges: [
          { from: 'perm', to: 'sw' },
          { from: 'sw', to: 'ok', label: 'all covered' },
          { from: 'add', to: 'err', label: 'next build' },
          { from: 'err', to: 'fix' },
          { from: 'fix', to: 'ok', dashed: true },
        ],
      },
    ],
    variants: [
      {
        title: 'Abstract class vs interface: features by Java version',
        intro: 'Support refers to interfaces; the note gives the abstract-class side.',
        items: [
          { name: 'Abstract methods', summary: 'Both can declare them; in an interface they are implicitly public abstract.', support: 'supported', note: 'Abstract class: yes, any non-private access.', code: 'interface Shape { double area(); }' },
          { name: 'Default methods (Java 8)', summary: 'Instance methods with a body, overridable by implementors.', support: 'supported', note: 'Abstract class: ordinary concrete methods.', code: 'default String describe() { return "area=" + area(); }' },
          { name: 'Static methods (Java 8)', summary: 'Called as Shape.unit(); not inherited by implementing classes.', support: 'supported', note: 'Abstract class: yes, and inherited by name.', code: 'static Shape unit() { return new Square(1); }' },
          { name: 'Private methods (Java 9)', summary: 'Private and private static helpers shared by default methods.', support: 'supported', note: 'Abstract class: yes, any access level.', code: 'private String fmt(double d) { return "%.2f".formatted(d); }' },
          { name: 'Instance fields', summary: 'Interface fields are implicitly public static final constants — no per-object state.', support: 'not-supported', note: 'Abstract class: yes, any fields.', code: 'int SIDES = 4;   // public static final' },
          { name: 'Constructors', summary: 'Interfaces have none and cannot enforce construction invariants.', support: 'not-supported', note: 'Abstract class: yes, called via super(...).' },
          { name: 'Non-public members', summary: 'Abstract and default methods are always public; only private helpers are hidden.', support: 'partial', note: 'Abstract class: protected and package-private allowed.' },
          { name: 'Multiple inheritance', summary: 'A class may implement many interfaces; an interface may extend many.', support: 'supported', note: 'Abstract class: a class extends at most one.' },
          { name: 'Sealed (Java 17)', summary: 'Both interfaces and abstract classes can be sealed with permits.', support: 'supported', note: 'Abstract class: same rules.', code: 'sealed interface Shape permits Circle, Square { }' },
        ],
      },
      {
        title: 'Sealed hierarchy modifiers',
        intro: 'Every permitted subtype of a sealed type must choose exactly one of these (Java 17, JEP 409).',
        items: [
          { name: 'final', summary: 'The branch ends here; no further subclasses.', support: 'supported', code: 'final class Square implements Shape { }' },
          { name: 'sealed', summary: 'The branch continues, but only with its own permits list.', support: 'supported', code: 'sealed interface Polygon extends Shape permits Square, Triangle { }' },
          { name: 'non-sealed', summary: 'Reopens the branch: anyone may extend it. Exhaustiveness still works at the Shape level because the Blob case covers all its subclasses.', support: 'supported', code: 'non-sealed class Blob implements Shape { }' },
          { name: 'record / enum', summary: 'Implicitly final (enums are implicitly sealed if constants have bodies), so they need no modifier.', support: 'supported', code: 'record Circle(double r) implements Shape { }' },
        ],
      },
      {
        title: 'Types of interfaces',
        intro: 'Java has one interface construct; these are the kinds commonly distinguished by purpose.',
        items: [
          {
            name: 'Normal interface',
            summary: 'Declares one or more abstract methods (plus optional defaults) that implementing classes must provide.',
            support: 'supported',
            code: 'interface Repository<T> {\n    T find(long id);\n    void save(T item);\n}',
          },
          {
            name: 'Functional interface (Java 8)',
            summary: 'Exactly one abstract method, so lambdas and method references can implement it. @FunctionalInterface is optional but makes the compiler check the rule.',
            support: 'supported',
            code: '@FunctionalInterface\ninterface Validator { boolean isValid(String s); }',
          },
          {
            name: 'Marker interface',
            summary: 'Declares no methods; it tags a class with a property that code or the JVM checks with instanceof.',
            support: 'supported',
            note: 'Serializable, Cloneable and RandomAccess. Annotations are the modern alternative for metadata.',
            code: 'class Order implements Serializable { }',
          },
          {
            name: 'Sealed interface (Java 17)',
            summary: 'Restricts implementors to a permits list, enabling exhaustive switches over its subtypes.',
            support: 'supported',
            code: 'sealed interface Result permits Ok, Err { }',
          },
          {
            name: 'Generic interface',
            summary: 'Declares type parameters so one contract works for many types.',
            support: 'supported',
            code: 'interface Comparable<T> { int compareTo(T other); }',
          },
          {
            name: 'Nested interface',
            summary: 'Declared inside a class or another interface; it is implicitly static and is used through the outer name.',
            support: 'supported',
            code: 'interface Map<K, V> {\n    interface Entry<K, V> { K getKey(); }\n}',
          },
        ],
      },
    ],
    deepDive: [
      {
        title: 'Sealed classes and their permits rules',
        body: 'JEP 409 (final in Java 17, previewed in 15–16) adds `sealed`, `non-sealed` and `permits`. If all subclasses are in the same source file, `permits` may be omitted and is inferred. Permitted subclasses must be in the same module (or same package if unnamed) and must directly extend the sealed class. The JVM enforces this too: the class file stores a `PermittedSubclasses` attribute and class loading of an unlisted subclass fails with `IncompatibleClassChangeError` — so it is not just a compiler check.',
        sources: [
          { label: 'JEP 409: Sealed Classes', url: 'https://openjdk.org/jeps/409' },
          { label: 'JLS §8.1.1.2: sealed, non-sealed, and final Classes', url: 'https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html#jls-8.1.1.2' },
        ],
      },
      {
        title: 'Pattern matching makes sealed types pay off',
        body: 'Pattern matching for `switch` (final in Java 21, JEP 441) and record patterns (JEP 440, also 21) let you deconstruct sealed variants: `case Rectangle(double w, double h) -> w * h`. A switch over a sealed type with no `default` is checked for exhaustiveness; at runtime, if a new subclass appears from separately compiled code, the switch throws `MatchException` rather than silently doing nothing.',
        sources: [
          { label: 'JEP 441: Pattern Matching for switch', url: 'https://openjdk.org/jeps/441' },
          { label: 'JEP 440: Record Patterns', url: 'https://openjdk.org/jeps/440' },
        ],
      },
      {
        title: 'Interface calls cost slightly more than class calls',
        body: 'A class has one superclass chain, so a virtual method always occupies the same vtable slot in every subclass. Interfaces can be implemented in any combination, so `invokeinterface` cannot rely on a fixed slot; HotSpot searches the receiver class\'s **itable** for the interface, then the method. Inline caches hide this in monomorphic code, but in megamorphic hot paths interface dispatch is measurably slower than class dispatch.',
        sources: [{ label: 'JVM Specification §6.5: invokeinterface', url: 'https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-6.html#jvms-6.5.invokeinterface' }],
      },
    ],
  },

  // -------------------------------------------------------------------------
  'o-object-contracts': {
    textbook: {
      definition:
        'The **general contract** of `Object.equals` requires the method to implement an **equivalence relation** on non-null references: it must be reflexive, symmetric and transitive, **consistent** across invocations while the compared state is unchanged, and must return false for a null argument. The contract of `Object.hashCode` requires the value to be consistent within one execution and requires objects that are equal according to `equals` to produce the same **hash code**; unequal objects may share one. `toString` should return a concise, informative textual representation. Hash-based collections depend on both contracts.',
      terms: [
        { term: 'Equivalence relation', meaning: 'A relation that is reflexive (x relates to x), symmetric (x to y implies y to x) and transitive (x to y and y to z imply x to z).' },
        { term: 'Hash code', meaning: 'An int derived from an object\'s state that hash tables use to choose a bucket; equal objects must have equal hash codes.' },
        { term: 'Consistency', meaning: 'Repeated invocations of equals or hashCode return the same result as long as no information used in the comparison is modified.' },
        { term: 'Value equality', meaning: 'Comparing objects by their state (logical equality) rather than by identity with `==`; records generate equals and hashCode from all their components.' },
      ],
      source: 'Javadoc for java.lang.Object (equals, hashCode, toString); Effective Java, 3rd ed., Items 10-12',
    },
    interviewDefinition:
      '`equals` must be an **equivalence relation** — reflexive, symmetric, transitive — consistent over time and false for `null`; `hashCode` must return equal values for equal objects. Hash-based collections find the bucket with `hashCode` and only then compare with `equals`, so overriding one without the other silently breaks `HashMap` and `HashSet`. **Records** (Java 16) generate correct value-based `equals`, `hashCode` and `toString` from their components.',
    interviewFollowUps: [
      {
        question: 'Must unequal objects have different hash codes?',
        answer: 'No. Collisions are legal; they only cost performance. The one hard rule is the other direction: equal objects must have equal hash codes. Returning a constant hash is correct but turns a HashMap into a linked list (or tree) search.',
      },
      {
        question: 'getClass() or instanceof in equals?',
        answer: '`getClass()` keeps symmetry when subclasses add state but breaks Liskov substitution (a subclass instance never equals a parent instance). `instanceof` is fine when the class is `final` or subclasses add no state that matters to equality. Records and most value types are final, so they use the type test safely.',
      },
      {
        question: 'Are records immutable?',
        answer: 'Shallowly. Their fields are private final, but a component that is a mutable object (a List, an array) can still change. Copy defensively in the compact constructor with `List.copyOf` and remember arrays use identity equality in the generated equals.',
      },
    ],
    mnemonic: {
      device: '"RSTCN" — "Real Students Take Coffee, Not tea"',
      expansion: [
        { key: 'R — Reflexive', meaning: 'x.equals(x) is true' },
        { key: 'S — Symmetric', meaning: 'x.equals(y) if and only if y.equals(x)' },
        { key: 'T — Transitive', meaning: 'x = y and y = z imply x = z' },
        { key: 'C — Consistent', meaning: 'same answer every call while the objects are unchanged' },
        { key: 'N — Null', meaning: 'x.equals(null) is false, never an exception' },
      ],
      visual: 'Students queuing at a coffee bar: everyone holding an equal order must be sent to the same counter (equal hash codes), even though one counter can serve several different orders (collisions).',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'A library: shelf number, then title',
        body: 'To find a book you first go to the shelf from the catalogue number (hashCode), then read titles on that shelf (equals). If two copies of the same book get different catalogue numbers, the librarian searches the wrong shelf and swears the book is not there — exactly what a HashSet does with a broken hashCode.',
      },
      {
        kind: 'insight',
        title: 'Equality is a design decision, not a default',
        body: 'Value objects (Money, Email, a coordinate) should compare by content. Entities (a Customer with an id) represent identity over time; comparing them by all their mutable fields makes a customer "unequal to itself" after a rename. Decide which kind each class is before writing equals.',
      },
      {
        kind: 'real-world',
        title: 'Caches that grow forever',
        body: 'A cache keyed by a class with `equals` but no `hashCode` never finds existing entries: each lookup creates a new key object with a new identity hash, misses, and inserts another copy. Memory climbs steadily until an OutOfMemoryError — a classic leak found in heap dumps as thousands of "duplicate" keys.',
      },
      {
        kind: 'angle',
        title: 'toString is a debugging contract too',
        body: '`Object.toString` gives `ClassName@hexHash`, which is useless in logs and test failures. A good toString is part of a class\'s usability, but must not leak secrets — records print every component, so a record holding a password or token prints it unless you override toString.',
      },
    ],
    diagrams: [
      {
        id: 'o-object-contracts-buckets',
        kind: 'concept',
        title: 'How a HashSet uses hashCode, then equals',
        caption: 'hashCode only chooses the bucket; equals decides within it. Two equal Points with different hashes land in different buckets and are never compared — producing a duplicate.',
        explanation: [
          'The lookup key **new Point(1, 2)** first has its hash computed: **hashCode() → 33**, which the HashSet spreads and reduces to an index for its table size.',
          'The index arrow leads to **Bucket 1**, which holds Point(1,2) and Point(9,0). The hash only narrows the search to this one bucket.',
          'Inside the bucket the set calls **equals() per entry**, walking the entries; the true arrow means a match, so the result is **Found**.',
          'The lower boxes show the bug: with **No hashCode override**, each Point uses its identity hash, so an equal key is sent to an unrelated bucket.',
          'That lookup searches the wrong place and ends in **Wrong bucket: "not found"**, because equals is never even called on the stored Point.',
          'Takeaway: hashCode chooses where to look and equals decides what matches, so the two must agree.',
        ],
        cols: 3,
        rows: 3,
        nodes: [
          { id: 'key', label: 'new Point(1, 2)', detail: 'lookup key', col: 0, row: 0, shape: 'pill', tone: 'neutral' },
          { id: 'hash', label: 'hashCode() → 33', detail: 'spread, then mod size', col: 1, row: 0, tone: 'primary' },
          { id: 'b1', label: 'Bucket 1', detail: 'Point(1,2), Point(9,0)', col: 2, row: 0, shape: 'cylinder', tone: 'accent' },
          { id: 'eq', label: 'equals() per entry', detail: 'walk the bucket', col: 2, row: 1, tone: 'primary' },
          { id: 'hit', label: 'Found', col: 2, row: 2, shape: 'pill', tone: 'success' },
          { id: 'bad', label: 'No hashCode override', detail: 'identity hash: random bucket', col: 0, row: 1, span: 2, tone: 'danger' },
          { id: 'miss', label: 'Wrong bucket: "not found"', col: 0, row: 2, span: 2, shape: 'pill', tone: 'danger' },
        ],
        edges: [
          { from: 'key', to: 'hash' },
          { from: 'hash', to: 'b1', label: 'index' },
          { from: 'b1', to: 'eq' },
          { from: 'eq', to: 'hit', label: 'true' },
          { from: 'bad', to: 'miss' },
        ],
      },
      {
        id: 'o-object-contracts-mutable-key',
        kind: 'flow',
        title: 'Mutating a key strands its entry',
        caption: 'The entry stays in the bucket chosen by the old hash. After the change, every lookup computes the new hash and searches somewhere else.',
        explanation: [
          '**set.add(tag)** computes hash h1 from the name "java", and the entry is **Stored in bucket h1**.',
          'Then **tag.name = "jvm"** changes a field used by hashCode, so the same object now hashes to h2, yet it still sits in bucket h1.',
          '**set.contains(tag)** recomputes the hash, searches bucket h2 and finds nothing there.',
          'The answer is **false** even though that very object is in the set; remove() fails for the same reason, so the entry is stranded.',
          'The dashed prevent with arrow leads to **Immutable keys**: records and classes with final fields cannot change after insertion.',
          'Takeaway: never mutate fields used by equals and hashCode while the object is a key in a hash collection.',
        ],
        cols: 3,
        rows: 2,
        nodes: [
          { id: 'put', label: 'set.add(tag)', detail: 'name="java", hash h1', col: 0, row: 0, tone: 'primary' },
          { id: 'stored', label: 'Stored in bucket h1', col: 1, row: 0, shape: 'cylinder', tone: 'accent' },
          { id: 'mut', label: 'tag.name = "jvm"', detail: 'hash is now h2', col: 2, row: 0, tone: 'warning' },
          { id: 'look', label: 'set.contains(tag)', detail: 'searches bucket h2', col: 2, row: 1, tone: 'primary' },
          { id: 'res', label: 'false', detail: 'remove() also fails', col: 1, row: 1, shape: 'pill', tone: 'danger' },
          { id: 'fix', label: 'Immutable keys', detail: 'records, final fields', col: 0, row: 1, shape: 'pill', tone: 'success' },
        ],
        edges: [
          { from: 'put', to: 'stored' },
          { from: 'stored', to: 'mut' },
          { from: 'mut', to: 'look' },
          { from: 'look', to: 'res' },
          { from: 'res', to: 'fix', label: 'prevent with', dashed: true },
        ],
      },
    ],
    variants: [
      {
        title: 'equals and hashCode contract rules',
        items: [
          { name: 'Reflexive', summary: 'x.equals(x) is true for any non-null x.', support: 'supported', code: 'p.equals(p)   // true' },
          { name: 'Symmetric', summary: 'x.equals(y) == y.equals(x). Broken by "equal to a String too" tricks and by subclass-aware instanceof checks.', support: 'supported' },
          { name: 'Transitive', summary: 'If x equals y and y equals z, then x equals z. Hard to keep when a subclass adds a value field.', support: 'supported' },
          { name: 'Consistent', summary: 'Repeated calls return the same result unless the fields used in equals change.', support: 'supported' },
          { name: 'Non-null', summary: 'x.equals(null) returns false; it must not throw.', support: 'supported', code: 'if (!(o instanceof Point p)) return false;' },
          { name: 'hashCode agrees with equals', summary: 'Equal objects must return equal hash codes. Unequal ones may collide.', support: 'supported', code: 'public int hashCode() { return Objects.hash(x, y); }' },
          { name: 'hashCode stable while unchanged', summary: 'Within one run, the hash must not change unless fields used in equals change; it may differ between runs.', support: 'supported' },
        ],
      },
      {
        title: 'What a record gives you (Java 16)',
        items: [
          { name: 'Private final fields + accessors', summary: 'One per component; accessors are named after the component, not getX().', support: 'supported', code: 'record Money(long cents, String currency) { }\nmoney.cents();' },
          { name: 'Canonical and compact constructors', summary: 'The canonical constructor is generated; a compact constructor validates or normalises before the fields are assigned.', support: 'supported', code: 'Money { Objects.requireNonNull(currency); }' },
          { name: 'equals, hashCode, toString', summary: 'Value-based over all components, in declaration order. Arrays compare by identity.', support: 'supported', code: 'new Money(5, "EUR").equals(new Money(5, "EUR"))   // true' },
          { name: 'Implicitly final, extends Record', summary: 'Records cannot extend another class or be extended, but can implement interfaces (ideal for sealed variants).', support: 'supported' },
          { name: 'Extra instance fields', summary: 'Not allowed: all state must be components. Static fields and methods are fine.', support: 'not-supported' },
          { name: 'Record patterns (Java 21)', summary: 'Deconstruct in instanceof and switch.', support: 'supported', code: 'if (o instanceof Money(long c, String cur)) { ... }' },
        ],
      },
    ],
    deepDive: [
      {
        title: 'Why you cannot add a value field and keep equals correct',
        body: '*Effective Java* (Item 10) shows that if `ColorPoint extends Point` adds a colour, no `equals` can satisfy symmetry, transitivity and substitutability at once: an `instanceof`-based check breaks symmetry, a colour-blind one breaks transitivity, and `getClass()` breaks Liskov substitution. The recommended way out is composition — `ColorPoint` *has* a `Point` and exposes `asPoint()` — or making value classes final. Records are final by design for exactly this reason.',
        sources: [
          { label: 'Effective Java, 3rd edition — Items 10 and 11 (Joshua Bloch)' },
          { label: 'Object.equals API documentation (Java 21)', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Object.html#equals(java.lang.Object)' },
        ],
      },
      {
        title: 'Records implement equals and hashCode with invokedynamic',
        body: 'A record\'s generated `equals`, `hashCode` and `toString` are not ordinary bytecode bodies; they are `invokedynamic` call sites bootstrapped by `java.lang.runtime.ObjectMethods`, which builds method handles for the component accessors. This keeps class files small and lets the JDK improve the implementation without recompiling records. The spec only promises the behaviour: equality combines components (primitives via their wrapper `compare`, references via `Objects.equals`) and the hash is derived from all component hashes.',
        sources: [
          { label: 'JEP 395: Records', url: 'https://openjdk.org/jeps/395' },
          { label: 'java.lang.Record API documentation (Java 21)', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Record.html' },
        ],
      },
      {
        title: 'HashMap survives bad hashes — up to a point',
        body: 'Since Java 8, a HashMap bucket that grows beyond 8 entries (in a table of at least 64) is converted from a linked list into a red-black tree, making worst-case lookups O(log n) instead of O(n). Trees order entries by hash and then, if keys are `Comparable`, by `compareTo`. HashMap also XORs the high 16 bits of the hash into the low bits before indexing, so hashes that differ only in high bits still spread. None of this rescues a `hashCode` that disagrees with `equals`.',
        sources: [{ label: 'JEP 180: Handle Frequent HashMap Collisions with Balanced Trees', url: 'https://openjdk.org/jeps/180' }],
      },
    ],
  },

  // -------------------------------------------------------------------------
  'o-solid': {
    textbook: {
      definition:
        '**SOLID** is an acronym for five principles of object-oriented class design collected by Robert C. Martin. The **Single Responsibility Principle** states that a module should have one reason to change; the **Open/Closed Principle**, that software entities should be open for extension but closed for modification; the **Liskov Substitution Principle**, that objects of a subtype must be substitutable for objects of their supertype without altering the correctness of the program; the **Interface Segregation Principle**, that clients should not be forced to depend on methods they do not use; and the **Dependency Inversion Principle**, that high-level modules should not depend on low-level modules, both instead depending on abstractions.',
      terms: [
        { term: 'Reason to change', meaning: 'A single actor or concern, such as finance rules or presentation, whose changing requirements may force the module to be modified.' },
        { term: 'Behavioural subtyping', meaning: 'The requirement, formalised by Liskov and Wing, that a subtype preserve its supertype\'s invariants, not strengthen preconditions and not weaken postconditions.' },
        { term: 'Abstraction (in DIP)', meaning: 'An interface or abstract class, owned by the high-level policy, that states what is needed without naming a concrete implementation.' },
        { term: 'Dependency injection', meaning: 'A technique in which an object receives its collaborators from outside, typically through constructor parameters, instead of creating them itself.' },
      ],
      source: 'Robert C. Martin, "Design Principles and Design Patterns" (2000) and Agile Software Development (2002); Liskov and Wing (1994)',
    },
    interviewDefinition:
      '**SOLID** is five object-oriented design principles that limit the cost of change: **S**ingle Responsibility (one reason to change), **O**pen/Closed (extend behaviour without editing working code), **L**iskov Substitution (subtypes honour their supertype\'s contract), **I**nterface Segregation (small, client-specific interfaces) and **D**ependency Inversion (high-level policy and low-level detail both depend on abstractions, usually injected through constructors). They are heuristics balanced against simplicity, not laws.',
    interviewFollowUps: [
      {
        question: 'Dependency Inversion vs Dependency Injection?',
        answer: 'DIP is a design principle about the *direction* of dependencies: policy owns the abstraction, details implement it. Dependency injection is a technique for supplying implementations from outside (constructor parameters, a container like Spring). DI is the usual way to *achieve* DIP, but you can inject concrete classes and still violate it.',
      },
      {
        question: 'Give an LSP violation that is not Square/Rectangle.',
        answer: 'An `UnmodifiableList` that implements `List` and throws on `add` weakens the contract callers rely on; `Collections.unmodifiableList` is a well-known, documented compromise. Another: a subclass `save()` that requires a prior `connect()` call adds a precondition the parent did not have.',
      },
      {
        question: 'Can SOLID be overdone?',
        answer: 'Yes: an interface for every class, one-method classes everywhere and speculative extension points add indirection with no benefit. Apply a principle when the change it protects against is actually happening, and keep YAGNI and KISS in balance.',
      },
    ],
    mnemonic: {
      device: 'SOLID — "a SOLID wall is built from the right bricks"',
      expansion: [
        { key: 'S', meaning: 'Single Responsibility — each brick does one job' },
        { key: 'O', meaning: 'Open/Closed — add bricks without knocking out old ones' },
        { key: 'L', meaning: 'Liskov Substitution — any brick of the right type fits the gap' },
        { key: 'I', meaning: 'Interface Segregation — small, standard brick faces, not one giant mould' },
        { key: 'D', meaning: 'Dependency Inversion — the wall is designed to a brick spec, not a particular supplier' },
      ],
      visual: 'A wall where you can pull out any brick and slide in another of the same size without the wall noticing.',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'Kitchen appliances and sockets',
        body: 'A kettle boils water (SRP). New appliances plug into existing sockets without rewiring the house (OCP). Any certified plug works in the socket (LSP). The socket offers power, not water and gas too (ISP). The house is wired to the socket standard, not to one brand of kettle (DIP).',
      },
      {
        kind: 'insight',
        title: 'SRP is about people, not size',
        body: '"One reason to change" means one *actor* or concern whose requests change the code — finance, design, infrastructure. A 300-line class serving one concern can be fine; a 40-line class mixing tax rules with email formatting is not.',
      },
      {
        kind: 'real-world',
        title: 'Spring is DIP plus OCP at scale',
        body: 'A service declares `private final PaymentGateway gateway` and receives it via its constructor. Spring wires the Stripe bean in production, tests pass a fake, and adding an Adyen implementation behind a profile needs no change to the service. Constructor injection also makes required dependencies explicit and the fields final.',
      },
      {
        kind: 'angle',
        title: 'Sealed types deliberately trade away OCP',
        body: 'A sealed interface is closed to new subtypes by design, so adding a variant forces edits to every switch. That is the right trade when the set of cases is stable and operations change often (the "expression problem"); open interfaces suit the opposite. Knowing which axis will change is the real design skill behind OCP.',
      },
    ],
    diagrams: [
      {
        id: 'o-solid-dip',
        kind: 'concept',
        title: 'Dependency inversion flips the arrow',
        caption: 'Before, policy points at a concrete client. After, both policy and detail point at an abstraction owned by the policy side, so the detail can be swapped.',
        explanation: [
          'In the **Before** group, **CheckoutService**, the high-level policy, calls new StripeClient() and so points straight at **StripeClient**, a concrete detail it cannot swap or fake.',
          'In the **After** group, CheckoutService depends on **PaymentGateway**, an interface owned by the policy side that describes only what checkout needs.',
          '**StripeGateway** implements PaymentGateway, so the arrow from the detail now points up at the abstraction: that reversal is the inversion.',
          '**FakeGateway** implements the same interface for tests, so checkout can be tested without any payment provider.',
          'Takeaway: policy and detail both depend on the abstraction, so the detail can be replaced without touching the policy.',
        ],
        cols: 4,
        rows: 3,
        nodes: [
          { id: 'b-svc', label: 'CheckoutService', detail: 'high-level policy', col: 0, row: 0, tone: 'primary' },
          { id: 'b-stripe', label: 'StripeClient', detail: 'concrete detail', col: 0, row: 2, tone: 'danger' },
          { id: 'a-svc', label: 'CheckoutService', detail: 'high-level policy', col: 2, row: 0, tone: 'primary' },
          { id: 'a-port', label: 'PaymentGateway', detail: 'interface owned by policy', col: 2, row: 1, span: 2, tone: 'accent' },
          { id: 'a-stripe', label: 'StripeGateway', col: 2, row: 2, tone: 'success' },
          { id: 'a-fake', label: 'FakeGateway', detail: 'tests', col: 3, row: 2, tone: 'success' },
        ],
        edges: [
          { from: 'b-svc', to: 'b-stripe', label: 'new StripeClient()' },
          { from: 'a-svc', to: 'a-port', label: 'depends on' },
          { from: 'a-stripe', to: 'a-port', label: 'implements' },
          { from: 'a-fake', to: 'a-port' },
        ],
        groups: [
          { label: 'Before', fromCol: 0, toCol: 1, fromRow: 0, toRow: 2, tone: 'danger' },
          { label: 'After', fromCol: 2, toCol: 3, fromRow: 0, toRow: 2, tone: 'success' },
        ],
      },
      {
        id: 'o-solid-srp-split',
        kind: 'architecture',
        title: 'Splitting a god class by reason to change',
        caption: 'Each extracted class answers to one concern. The facade keeps callers unchanged while finance, design and infrastructure changes now touch different files.',
        explanation: [
          '**InvoiceService** at the top is a god class mixing totals, PDF layout and email, so finance, design and infrastructure changes all edit the same file.',
          'The extract arrows split it by reason to change: **InvoiceCalculator** owns finance rules, **InvoiceRenderer** owns layout and branding, and **InvoiceMailer** owns SMTP and retries.',
          '**InvoiceWorkflow** at the bottom is a facade that receives the three classes through its constructor; the dashed arrows show that it uses them.',
          'Callers keep calling one entry point, so splitting the class does not ripple out to the rest of the code base.',
          'Takeaway: each class now answers to one concern, so a change requested by one team touches only one file.',
        ],
        cols: 3,
        rows: 3,
        nodes: [
          { id: 'god', label: 'InvoiceService', detail: 'totals + PDF + email', col: 0, row: 0, span: 3, tone: 'danger' },
          { id: 'calc', label: 'InvoiceCalculator', detail: 'finance rules', col: 0, row: 1, tone: 'primary' },
          { id: 'render', label: 'InvoiceRenderer', detail: 'layout and branding', col: 1, row: 1, tone: 'primary' },
          { id: 'mail', label: 'InvoiceMailer', detail: 'SMTP, retries', col: 2, row: 1, tone: 'primary' },
          { id: 'facade', label: 'InvoiceWorkflow', detail: 'composes the three via constructor', col: 0, row: 2, span: 3, tone: 'success' },
        ],
        edges: [
          { from: 'god', to: 'calc', label: 'extract' },
          { from: 'god', to: 'render', label: 'extract' },
          { from: 'god', to: 'mail', label: 'extract' },
          { from: 'facade', to: 'calc', dashed: true },
          { from: 'facade', to: 'render', dashed: true },
          { from: 'facade', to: 'mail', dashed: true },
        ],
      },
      {
        id: 'o-solid-ocp',
        kind: 'flow',
        title: 'Adding a feature under Open/Closed',
        caption: 'A new discount is a new class registered with the calculator; the tested calculator code is never edited.',
        explanation: [
          'A business request arrives: **New rule: loyalty**. The add code arrow shows that the response is new code, not edits to old code.',
          'The new class **LoyaltyDiscount** implements the DiscountRule interface, so it fits the existing extension point.',
          '**Register the bean**, or add it to the list, so that it is injected into the calculator.',
          '**PriceCalculator** simply loops over its List<DiscountRule> and applies each rule; it never names a concrete rule, so it needs no change.',
          'The dashed arrow from **Existing rules** shows they keep working untouched, and their tests still pass.',
          'Takeaway: the calculator is open for extension through new rules but closed for modification of its tested code.',
        ],
        cols: 3,
        rows: 2,
        nodes: [
          { id: 'req', label: 'New rule: loyalty', detail: 'business request', col: 0, row: 0, shape: 'pill', tone: 'neutral' },
          { id: 'cls', label: 'LoyaltyDiscount', detail: 'implements DiscountRule', col: 1, row: 0, tone: 'success' },
          { id: 'reg', label: 'Register the bean', detail: 'or add to the list', col: 2, row: 0, tone: 'primary' },
          { id: 'calc', label: 'PriceCalculator', detail: 'loops over List<DiscountRule>', col: 2, row: 1, tone: 'accent' },
          { id: 'old', label: 'Existing rules', detail: 'untouched, still tested', col: 1, row: 1, tone: 'neutral' },
        ],
        edges: [
          { from: 'req', to: 'cls', label: 'add code' },
          { from: 'cls', to: 'reg' },
          { from: 'reg', to: 'calc', label: 'injected' },
          { from: 'old', to: 'calc', dashed: true },
        ],
      },
    ],
    variants: [
      {
        title: 'The five SOLID principles',
        items: [
          {
            name: 'S — Single Responsibility',
            summary: 'A class should have one reason to change: one actor or concern.',
            support: 'supported',
            code: 'class InvoiceCalculator { Money total(Invoice i) { ... } }\nclass InvoiceMailer { void send(Invoice i) { ... } }',
          },
          {
            name: 'O — Open/Closed',
            summary: 'Open for extension, closed for modification: add a new implementation instead of editing a switch.',
            support: 'supported',
            code: 'interface DiscountRule { Money apply(Order o); }\nclass LoyaltyDiscount implements DiscountRule { ... }',
          },
          {
            name: 'L — Liskov Substitution',
            summary: 'Subtypes must be usable through the base type without surprises: no stronger preconditions, weaker postconditions or new exceptions.',
            support: 'supported',
            code: '// violation: Square overrides setWidth to also set height\nclass Square extends Rectangle { ... }',
          },
          {
            name: 'I — Interface Segregation',
            summary: 'Clients should not depend on methods they do not use; prefer several small interfaces.',
            support: 'supported',
            code: 'interface OrderReader { Optional<Order> find(Id id); }\ninterface OrderWriter { void save(Order o); }',
          },
          {
            name: 'D — Dependency Inversion',
            summary: 'High-level modules and low-level details both depend on abstractions owned by the high level; inject implementations.',
            support: 'supported',
            code: 'class CheckoutService {\n    private final PaymentGateway gateway;\n    CheckoutService(PaymentGateway gateway) { this.gateway = gateway; }\n}',
          },
        ],
      },
    ],
    deepDive: [
      {
        title: 'Where the principles came from',
        body: 'Robert C. Martin collected the principles in his 2000 paper *Design Principles and Design Patterns*; Michael Feathers later noticed they spelled SOLID. The Open/Closed principle is Bertrand Meyer\'s (*Object-Oriented Software Construction*, 1988), originally meaning extension through inheritance — Martin\'s reformulation is about abstraction and polymorphism. Liskov substitution comes from Barbara Liskov\'s 1987 keynote "Data Abstraction and Hierarchy", formalised with Jeannette Wing in 1994 as **behavioural subtyping**.',
        sources: [
          { label: 'Barbara Liskov and Jeannette Wing, "A Behavioral Notion of Subtyping", ACM TOPLAS, 1994' },
          { label: 'Robert C. Martin, Agile Software Development: Principles, Patterns, and Practices' },
        ],
      },
      {
        title: 'LSP is a contract rule the compiler only partly checks',
        body: 'Java enforces the *syntactic* part of substitutability: an override cannot narrow access, must return a compatible type and cannot add checked exceptions. The *behavioural* part — preconditions no stronger, postconditions no weaker, invariants and history preserved — is invisible to `javac`. The JDK documents these in Javadoc (`@implSpec`, "optional operation" in `Collection`), and contract tests run against every implementation are the practical enforcement.',
        sources: [{ label: 'JLS §8.4.8.3: Requirements in Overriding and Hiding', url: 'https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html#jls-8.4.8.3' }],
      },
      {
        title: 'Dependency inversion at module scale: ServiceLoader',
        body: 'The JDK applies DIP to whole modules. A module declares `uses com.example.spi.PaymentGateway` and providers declare `provides PaymentGateway with StripeGateway`; `ServiceLoader.load(PaymentGateway.class)` discovers implementations at runtime, and the consumer module never names a provider. JDBC drivers, `java.nio.file` file-system providers and logging back-ends all work this way.',
        sources: [{ label: 'java.util.ServiceLoader API documentation (Java 21)', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/ServiceLoader.html' }],
      },
    ],
  },
};
