import type { LessonConcepts } from '@/types/curriculum';

/** Concept pages for the extra OOP lessons (access modifiers, nested classes, enums), keyed by lesson id. */
export const oopMoreConcepts: Record<string, LessonConcepts> = {
  'o-access-modifiers': {
    textbook: {
      definition:
        '**Access modifiers** are keywords that implement **access control**, which determines from which code a declared member, constructor or type may be referred to by name. Java defines four levels: `private` (accessible only within the body of the top-level class that encloses the declaration), **package access** (the default when no modifier is given, accessible within the same package), `protected` (package access plus subclasses in other packages, subject to a qualifying-type restriction) and `public` (accessible wherever its enclosing type is, subject to module exports). **Non-access modifiers** such as `static`, `final` and `abstract` specify properties of a declaration rather than its accessibility.',
      terms: [
        { term: 'Access control', meaning: 'The compile-time and link-time checks that prevent code from referring to a declaration it is not permitted to access.' },
        { term: 'Package access', meaning: 'The default accessibility of a member or top-level type declared without public, protected or private: visible only within its own package.' },
        { term: 'Protected access', meaning: 'Access granted to the whole package and, outside it, to subclass code only through expressions whose type is that subclass or one of its subtypes.' },
        { term: 'Module export', meaning: 'A directive in module-info.java that makes a package\'s public types accessible to other modules; unexported packages stay encapsulated.' },
        { term: 'Non-access modifier', meaning: 'A modifier such as static, final, abstract, synchronized, volatile or transient that changes the meaning or behaviour of a declaration, not its visibility.' },
      ],
      source: 'JLS §6.6 (Access Control), §8.1.1, §8.3.1 and §7.7 (Module Declarations)',
    },
    interviewDefinition:
      'Access modifiers control **visibility**: `private` (the declaring top-level class), package-private (same package, no keyword), `protected` (same package plus subclasses, which outside the package may only use it through their own type) and `public` (everyone, subject to module exports). Non-access modifiers describe **nature**: `static` binds a member to the class rather than an instance, `final` forbids reassignment, overriding or subclassing, and `abstract` declares something that must be completed by a subclass.',
    interviewFollowUps: [
      {
        question: 'Can a subclass in another package access a protected field of any parent object?',
        answer: 'No. Outside the package it may access the protected member only through references of its own type or a subtype (`this.x`, `otherSub.x`), not through a reference typed as the parent (JLS §6.6.2). Same-package code has full access.',
      },
      {
        question: 'Does `final` make an object immutable?',
        answer: 'No. It makes the variable unassignable after initialisation. The referenced object can still change unless its class is itself immutable. `final` fields do get a special guarantee, though: they are safely published to other threads once the constructor finishes, provided `this` did not escape during construction.',
      },
      {
        question: 'Why can a static method not be overridden?',
        answer: 'Static calls are bound at compile time from the declared type (`invokestatic`); there is no receiver object to dispatch on. A subclass static method with the same signature merely **hides** the parent one.',
      },
      {
        question: 'Is `public` always visible everywhere?',
        answer: 'Not since Java 9 modules. A public type in a named module is accessible outside that module only if its package is exported (and the reader module requires it). Strong encapsulation of JDK internals has been the default since Java 16 (JEP 396) and was made strict in Java 17 (JEP 403).',
      },
    ],
    mnemonic: {
      device: '"Private Pockets, Package Porch, Protected Pedigree, Public Park"',
      expansion: [
        { key: 'Private Pockets', meaning: 'private: only the class itself can reach into its own pockets' },
        { key: 'Package Porch', meaning: 'no modifier: neighbours on the same package street may step onto the porch' },
        { key: 'Protected Pedigree', meaning: 'protected: the porch, plus family (subclasses) living in other packages' },
        { key: 'Public Park', meaning: 'public: anyone may walk in' },
        { key: 'S-F-A', meaning: 'Static = Shared by the class, Final = Fixed, Abstract = Awaits a subclass' },
      ],
      visual: 'Walk outward from a coat pocket, to your front porch, to a family reunion across town, to a public park: each step lets more people in.',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'An office building',
        body: 'Your desk drawer is `private`. The team floor is package-private: anyone in your team (package) can walk over. `protected` is the team floor plus your trainees placed in other departments — but they may only open the drawers you handed down to *them*, not anyone else\'s. The lobby is `public`. `static` is the shared coffee machine: one per floor (class), not one per person (object).',
      },
      {
        kind: 'insight',
        title: 'Access is checked per class, not per object',
        body: '`private` does not mean "only this object". Any code in the class may read `other.secret` of another instance — that is exactly how `equals` and `compareTo` are written. Encapsulation protects a class\'s implementation from *other code*, not objects from their siblings.',
      },
      {
        kind: 'insight',
        title: 'Every widening is a promise',
        body: 'A private member can be renamed freely; a package-private one affects one package; a protected or public one is part of your API forever. Library authors default to the narrowest level and `final` classes, because narrowing later is a breaking change while widening is always safe.',
      },
      {
        kind: 'real-world',
        title: 'Tests in the same package',
        body: 'Maven and Gradle put `src/test/java/com/shop/FooTest` in the same package as `src/main/java/com/shop/Foo`. That is why package-private methods are testable without making them public — and why "make it public for the test" is almost never needed.',
      },
      {
        kind: 'angle',
        title: 'Initialisation order is a contract you can lean on',
        body: 'Static initialisation runs once, lazily and thread-safely, guarded by the JVM\'s class-initialisation lock. The "initialization-on-demand holder" idiom uses this to build lazy singletons without any `synchronized` keyword.',
      },
    ],
    diagrams: [
      {
        id: 'o-access-ladder',
        kind: 'concept',
        title: 'Each access level adds a wider audience',
        caption: 'Read top to bottom: every level includes everyone from the level above it, plus one new group of callers.',
        explanation: [
          'Read the left column top to bottom: **private**, **package-private**, **protected** and **public**. Each widen arrow opens the member to more callers.',
          'The dashed arrow from private leads to **Same class only**: code in the declaring class and its nested classes, nothing else.',
          'Package-private adds **+ every class in the same package**, which is what you get when you write no keyword at all.',
          'Protected adds **+ subclasses in other packages**, but those subclasses may use the member only through references of their own type.',
          'Public adds **+ everyone**, provided the module exports the package that contains the type.',
          'Takeaway: each level includes everything above it, so choose the narrowest level that works and widen only when needed.',
        ],
        cols: 3,
        rows: 4,
        nodes: [
          { id: 'priv', label: 'private', detail: 'the declaring class', col: 0, row: 0, tone: 'danger' },
          { id: 'pkg', label: 'package-private', detail: 'no keyword', col: 0, row: 1, tone: 'warning' },
          { id: 'prot', label: 'protected', col: 0, row: 2, tone: 'accent' },
          { id: 'pub', label: 'public', col: 0, row: 3, tone: 'success' },
          { id: 'w1', label: 'Same class only', detail: 'and its nested classes', col: 1, row: 0, span: 2, shape: 'note', tone: 'neutral' },
          { id: 'w2', label: '+ every class in the same package', col: 1, row: 1, span: 2, shape: 'note', tone: 'neutral' },
          { id: 'w3', label: '+ subclasses in other packages', detail: 'only through their own type', col: 1, row: 2, span: 2, shape: 'note', tone: 'neutral' },
          { id: 'w4', label: '+ everyone', detail: 'if the module exports the package', col: 1, row: 3, span: 2, shape: 'note', tone: 'neutral' },
        ],
        edges: [
          { from: 'priv', to: 'pkg', label: 'widen' },
          { from: 'pkg', to: 'prot', label: 'widen' },
          { from: 'prot', to: 'pub', label: 'widen' },
          { from: 'priv', to: 'w1', dashed: true },
          { from: 'pkg', to: 'w2', dashed: true },
          { from: 'prot', to: 'w3', dashed: true },
          { from: 'pub', to: 'w4', dashed: true },
        ],
      },
      {
        id: 'o-access-packages',
        kind: 'architecture',
        title: 'Who can touch Account\'s members',
        caption: 'Arrows show what each caller can use. The subclass in another package gets protected members, but only through GoldAccount references; an unrelated class there sees only public members.',
        explanation: [
          '**Account** in package com.shop.core declares members at all four levels: public, protected, package-private and private.',
          '**Account methods** sit inside the class itself, so their all members arrow includes even the private ones.',
          '**Auditor** is in the same package, so it reaches all but private: package-private and protected members are open to the whole package.',
          'In package com.shop.premium, **GoldAccount** extends Account and gets public and protected members; the asterisk means only through GoldAccount references, not a plain Account.',
          '**Report**, an unrelated class in the premium package, follows the dashed public only arrow: with no subclassing and no shared package, it sees public members only.',
          'Takeaway: sharing a package or being a subclass is what earns access beyond the public members.',
        ],
        cols: 4,
        rows: 3,
        nodes: [
          { id: 'acc', label: 'Account', detail: 'public, protected, pkg, private', col: 0, row: 0, span: 2, tone: 'primary' },
          { id: 'aud', label: 'Auditor', detail: 'same package', col: 0, row: 2, tone: 'neutral' },
          { id: 'gold', label: 'GoldAccount', detail: 'extends Account', col: 2, row: 0, tone: 'accent' },
          { id: 'rep', label: 'Report', detail: 'unrelated class', col: 3, row: 2, tone: 'neutral' },
          { id: 'self', label: 'Account methods', detail: 'everything incl. private', col: 1, row: 2, tone: 'success' },
        ],
        edges: [
          { from: 'aud', to: 'acc', label: 'all but private' },
          { from: 'self', to: 'acc', label: 'all members' },
          { from: 'gold', to: 'acc', label: 'public + protected*' },
          { from: 'rep', to: 'gold', label: 'public only', dashed: true },
        ],
        groups: [
          { label: 'package com.shop.core', fromCol: 0, toCol: 1, fromRow: 0, toRow: 2, tone: 'primary' },
          { label: 'package com.shop.premium', fromCol: 2, toCol: 3, fromRow: 0, toRow: 2, tone: 'accent' },
        ],
      },
      {
        id: 'o-access-init-order',
        kind: 'flow',
        title: 'Initialisation order for new Child()',
        caption: 'Class initialisation (top row) happens once per class, parent first. Object creation (bottom rows) happens for every new: the parent part is fully built before the child\'s instance initialisers run.',
        explanation: [
          '**First use of Child**, such as a new, a static method call or a static field read, triggers class initialisation once, as the once arrow says.',
          'In the **Once per class** row, **Base static init** runs before **Child static init**, because a superclass must be initialised before its subclass.',
          'Then **new Child()** starts object creation; its this(...) and super(...) chain climbs up to Object first.',
          'In the **Every new** rows the parent part is built first: **Base instance init** runs field initialisers and instance blocks, then the **Base constructor body** runs.',
          'Only then do **Child instance init** and the **Child constructor body** run, and finally the **Reference returned** goes back to the caller.',
          'Takeaway: statics run once, parent first; instance initialisation repeats for every new, again parent first.',
        ],
        cols: 4,
        rows: 3,
        nodes: [
          { id: 'first', label: 'First use of Child', detail: 'new, static call, field', col: 0, row: 0, shape: 'pill', tone: 'neutral' },
          { id: 'bs', label: 'Base static init', detail: 'fields + static blocks', col: 1, row: 0, tone: 'warning' },
          { id: 'cs', label: 'Child static init', detail: 'fields + static blocks', col: 2, row: 0, tone: 'warning' },
          { id: 'newc', label: 'new Child()', detail: 'this(...) / super(...) chain', col: 3, row: 0, shape: 'pill', tone: 'primary' },
          { id: 'bi', label: 'Base instance init', detail: 'field inits + { } blocks', col: 0, row: 1, tone: 'accent' },
          { id: 'bc', label: 'Base constructor body', col: 1, row: 1, tone: 'accent' },
          { id: 'ci', label: 'Child instance init', detail: 'field inits + { } blocks', col: 2, row: 1, tone: 'accent' },
          { id: 'cc', label: 'Child constructor body', detail: 'rest after super(...)', col: 3, row: 1, tone: 'accent' },
          { id: 'done', label: 'Reference returned', col: 3, row: 2, shape: 'pill', tone: 'success' },
        ],
        edges: [
          { from: 'first', to: 'bs', label: 'once' },
          { from: 'bs', to: 'cs' },
          { from: 'cs', to: 'newc' },
          { from: 'newc', to: 'bi', label: 'up to Object first' },
          { from: 'bi', to: 'bc' },
          { from: 'bc', to: 'ci' },
          { from: 'ci', to: 'cc' },
          { from: 'cc', to: 'done' },
        ],
        groups: [
          { label: 'Once per class', fromCol: 0, toCol: 2, fromRow: 0, toRow: 0, tone: 'warning' },
          { label: 'Every new', fromCol: 0, toCol: 3, fromRow: 1, toRow: 2, tone: 'accent' },
        ],
      },
    ],
    variants: [
      {
        title: 'Access levels',
        intro: 'From narrowest to widest. Top-level classes may only be public or package-private.',
        items: [
          { name: 'private', summary: 'Visible only inside the declaring top-level class, including its nested classes.', support: 'supported', note: 'Default choice for fields.', code: 'private long balanceCents;' },
          { name: 'package-private (no keyword)', summary: 'Visible to every class in the same package.', support: 'supported', note: 'Interface members are implicitly public instead.', code: 'String region;' },
          { name: 'protected', summary: 'Same package, plus subclasses in other packages through references of their own type.', support: 'supported', note: 'Wider than most people think: it includes the whole package.', code: 'protected void onSave() { }' },
          { name: 'public', summary: 'Visible to all code that can read the module and package.', support: 'supported', note: 'In named modules, only for exported packages.', code: 'public Money total() { ... }' },
        ],
      },
      {
        title: 'Non-access modifiers',
        intro: 'They describe what a member is, not who can see it.',
        items: [
          { name: 'static', summary: 'Belongs to the class: shared fields, methods without this, static blocks, static nested classes.', support: 'supported', code: 'static int count;\nstatic { count = 0; }' },
          { name: 'final', summary: 'Variable assigned once; method not overridable; class not extendable.', support: 'supported', note: 'Locals never reassigned are "effectively final" and can be captured by lambdas.', code: 'final class Money { private final long cents; }' },
          { name: 'abstract', summary: 'Method without a body or class that cannot be instantiated.', support: 'supported', note: 'Never with final, private or static on a method.', code: 'abstract double area();' },
          { name: 'synchronized', summary: 'Method acquires the object\'s (or Class object\'s) monitor before running.', support: 'supported', code: 'synchronized void add(int n) { total += n; }' },
          { name: 'volatile', summary: 'Field reads and writes are visible to all threads and not reordered.', support: 'supported', note: 'Gives visibility, not atomicity: count++ is still a race.', code: 'private volatile boolean running = true;' },
          { name: 'transient', summary: 'Field skipped by built-in Java serialisation.', support: 'supported', code: 'private transient Cache cache;' },
          { name: 'native', summary: 'Method implemented outside Java (via JNI or the FFM API bindings).', support: 'supported', code: 'private native long nanoTime0();' },
          { name: 'strictfp', summary: 'Forced strict IEEE floating point.', support: 'partial', note: 'Obsolete since Java 17 (JEP 306): all floating point is strict and the keyword only triggers a warning.' },
        ],
      },
    ],
    deepDive: [
      {
        title: 'Nestmates: why private access between nested classes got cheaper in Java 11',
        body: 'The JLS has always let a nested class read its outer class\'s private members, but the JVM checked access per class file. Until Java 10, `javac` bridged the gap with synthetic package-private accessor methods (`access$000`), which widened access at the bytecode level and confused reflection. JEP 181 added **nest-based access control**: the class file records its nest host and members, and the JVM grants private access within the nest directly. Reflection (`Class.getNestHost()`) now agrees with the language.',
        sources: [
          { label: 'JEP 181: Nest-Based Access Control', url: 'https://openjdk.org/jeps/181' },
          { label: 'JLS §6.6: Access Control', url: 'https://docs.oracle.com/javase/specs/jls/se21/html/jls-6.html#jls-6.6' },
        ],
      },
      {
        title: 'Class initialisation is lazy, locked and triggered precisely',
        body: 'A class is initialised immediately before the first `new`, static method call, or assignment/read of a static field that is **not** a compile-time constant (JLS §12.4.1). Reading `static final int MAX = 10` does not initialise the class, because `javac` inlines the value into the caller — which also means changing a constant requires recompiling every class that uses it. Initialisation runs under a per-class lock, so static initialisers are thread-safe; a cycle between two classes\' static initialisers can, however, expose default values, and two threads initialising such classes in opposite order can deadlock.',
        sources: [
          { label: 'JLS §12.4: Initialization of Classes and Interfaces', url: 'https://docs.oracle.com/javase/specs/jls/se21/html/jls-12.html#jls-12.4' },
          { label: 'JLS §13.1: compile-time constants and binary compatibility', url: 'https://docs.oracle.com/javase/specs/jls/se21/html/jls-13.html#jls-13.1' },
        ],
      },
      {
        title: 'final fields and safe publication',
        body: 'The Java Memory Model gives `final` fields a special guarantee: once a constructor finishes, any thread that obtains a reference to the object sees the final fields\' values (and objects reachable through them as of that moment), even without synchronisation — provided `this` did not escape during construction. This is why immutable objects with all-final fields can be shared freely between threads, and why leaking `this` from a constructor (registering a listener, starting a thread) is dangerous.',
        sources: [
          { label: 'JLS §17.5: final Field Semantics', url: 'https://docs.oracle.com/javase/specs/jls/se21/html/jls-17.html#jls-17.5' },
          { label: 'Java Concurrency in Practice, chapter 3 (Sharing Objects)' },
        ],
      },
      {
        title: 'Statements before super(): flexible constructor bodies',
        body: 'For decades `this(...)`/`super(...)` had to be the first statement, forcing argument validation into static helper methods. JEP 513, final in Java 25 after previews in 22-24, allows statements before the explicit constructor call, as long as they do not read the object being constructed (they may assign its fields). Validation and argument preparation can now sit where they belong.',
        sources: [{ label: 'JEP 513: Flexible Constructor Bodies', url: 'https://openjdk.org/jeps/513' }],
      },
    ],
  },

  'o-nested-classes': {
    textbook: {
      definition:
        'A **nested class** is any class whose declaration occurs within the body of another class or interface; a class that is not nested is a **top-level class**. Nested classes are either static member classes, which have no enclosing instance, or **inner classes**, which comprise non-static member classes, local classes declared in a block, and **anonymous classes** declared and instantiated by a single class instance creation expression. An inner class declared in an instance context has an **immediately enclosing instance**, and may use local variables of enclosing blocks only if they are final or **effectively final**.',
      terms: [
        { term: 'Inner class', meaning: 'A nested class that is not explicitly or implicitly static; member, local and anonymous classes are inner classes.' },
        { term: 'Immediately enclosing instance', meaning: 'The instance of the lexically enclosing class to which an inner class object is bound, accessible in its body as `Outer.this`.' },
        { term: 'Effectively final', meaning: 'A local variable or parameter that is never assigned after initialisation, so it could be declared final without changing the program.' },
        { term: 'Anonymous class', meaning: 'A class without a name, declared by a class instance creation expression that both declares and instantiates it.' },
        { term: 'Top-level class', meaning: 'A class declared directly in a compilation unit, not inside the body of another class or interface.' },
      ],
      source: 'JLS §8.1.3 (Inner Classes and Enclosing Instances), §14.3 (Local Class Declarations) and §15.9.5 (Anonymous Class Declarations)',
    },
    interviewDefinition:
      'Java has four kinds of nested class: **static nested** (no enclosing instance), **inner** member classes (each instance holds an implicit reference to an outer instance, reachable as `Outer.this`), **local** classes (declared in a block) and **anonymous** classes (declared and instantiated in one expression). Local and anonymous classes, like lambdas, may capture only effectively final locals. Prefer static nested classes unless the outer instance is genuinely needed, and lambdas for single-method interfaces.',
    interviewFollowUps: [
      {
        question: 'Why is a non-static inner class a memory-leak risk?',
        answer: 'It holds a hidden reference to its outer object. If something long-lived (a static registry, a thread, a cache) keeps the inner object, the outer object and its whole object graph stay reachable. Effective Java Item 24 recommends making member classes static unless they need the enclosing instance.',
      },
      {
        question: 'How does `this` differ between a lambda and an anonymous class?',
        answer: 'An anonymous class is a new class, so `this` is the anonymous instance and it can shadow outer names. A lambda body is lexically scoped: `this` refers to the enclosing instance and the lambda cannot shadow local variables of the enclosing method.',
      },
      {
        question: 'Why must captured locals be effectively final?',
        answer: 'Locals live in a stack frame that may be gone when the lambda or nested object runs, so their **values are copied** into the nested object. Forbidding reassignment guarantees the copy and the original never diverge, and avoids data races on stack variables.',
      },
    ],
    mnemonic: {
      device: 'SILA: "Static, Inner, Local, Anonymous — the hidden link grows as you go"',
      expansion: [
        { key: 'S', meaning: 'Static nested: lives in the outer class\'s namespace, no link to an outer object' },
        { key: 'I', meaning: 'Inner: a member class tethered to one outer object (Outer.this)' },
        { key: 'L', meaning: 'Local: declared in a method, sees effectively final locals' },
        { key: 'A', meaning: 'Anonymous: declared and created in one expression; often replaceable by a lambda' },
      ],
      visual: 'A static nested class is a separate tenant with a key to the building; an inner class is a balloon tied by a string to one particular outer object — and the balloon keeps that object from floating away to the garbage collector.',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'Shop departments and personal assistants',
        body: 'A static nested class is a department that shares the shop\'s name and private stock room (private static members) but serves everyone. An inner class is a personal assistant assigned to one customer: helpful because it knows that customer, but it follows them everywhere — and while the assistant is booked, the customer cannot leave.',
      },
      {
        kind: 'insight',
        title: 'The compiler writes the outer reference for you',
        body: '`javac` turns `class Inner` into `Outer$Inner` with a synthetic field (traditionally `this$0`) and an extra constructor parameter holding the outer object. That is why `outer.new Inner()` exists, why inner classes cost an extra reference per instance, and why their serialisation is strongly discouraged by the Java documentation.',
      },
      {
        kind: 'real-world',
        title: 'Builders and iterators in the JDK',
        body: 'Static nested classes are everywhere in good APIs: `Map.Entry`, `AbstractMap.SimpleEntry`, `HttpRequest.Builder` (an interface nested in `HttpRequest`). Iterators of collections such as `ArrayList` are inner classes, because each iterator must read its own list\'s array and modification count.',
      },
      {
        kind: 'angle',
        title: 'Lambdas are not just short anonymous classes',
        body: 'A lambda creates no `Outer$1.class` file; it is linked at run time via `invokedynamic` and `LambdaMetafactory`. A non-capturing lambda typically evaluates to the same cached object every time, and a lambda that uses no instance members does not hold the outer object at all — so converting listeners to lambdas can also remove accidental outer references.',
      },
    ],
    diagrams: [
      {
        id: 'o-nested-kinds',
        kind: 'concept',
        title: 'The four kinds of nested class',
        caption: 'Static nested classes have no enclosing instance; the three inner kinds do (when declared in an instance context). Lambdas cover the single-method anonymous case.',
        explanation: [
          '**Class declared inside other code** at the top splits on one question: is the nested class static or not?',
          'The static arrow leads to **Static nested**: it lives in the outer class\'s namespace but holds no reference to any outer object.',
          'The non-static arrow leads to **Inner classes**, which carry an Outer.this reference whenever they are declared in an instance context.',
          'There are three inner kinds: **Member inner**, created with outer.new Inner(); **Local**, declared inside a block; and **Anonymous**, declared and created in one expression.',
          'The dashed arrow shows that an anonymous class is often replaced by a **Lambda** when the interface has a single abstract method.',
          'Takeaway: the static or non-static choice decides whether every nested object is tied to an outer object.',
        ],
        cols: 4,
        rows: 3,
        nodes: [
          { id: 'root', label: 'Class declared inside other code', col: 1, row: 0, span: 2, tone: 'primary' },
          { id: 'sn', label: 'Static nested', detail: 'no outer instance', col: 0, row: 1, tone: 'success' },
          { id: 'inner', label: 'Inner classes', detail: 'have Outer.this', col: 2, row: 1, span: 2, tone: 'warning' },
          { id: 'mem', label: 'Member inner', detail: 'outer.new Inner()', col: 1, row: 2, tone: 'accent' },
          { id: 'loc', label: 'Local', detail: 'declared in a block', col: 2, row: 2, tone: 'accent' },
          { id: 'anon', label: 'Anonymous', detail: 'new X() { ... }', col: 3, row: 2, tone: 'accent' },
          { id: 'lam', label: 'Lambda', detail: 'one-method interfaces', col: 0, row: 2, shape: 'pill', tone: 'neutral' },
        ],
        edges: [
          { from: 'root', to: 'sn', label: 'static' },
          { from: 'root', to: 'inner', label: 'non-static' },
          { from: 'inner', to: 'mem' },
          { from: 'inner', to: 'loc' },
          { from: 'inner', to: 'anon' },
          { from: 'anon', to: 'lam', label: 'often replaced by', dashed: true },
        ],
      },
      {
        id: 'o-nested-leak',
        kind: 'architecture',
        title: 'How an inner listener keeps a closed screen alive',
        caption: 'The GC frees only unreachable objects. A static registry reaches the listener, whose hidden this$0 field reaches the screen and its large data, so none of it can be collected.',
        explanation: [
          'Start at the **GC root**, a static EventBus field. The garbage collector keeps alive everything that can be reached from a root.',
          'The root reaches the **EventBus**, whose listener list holds a strong ref to a **PriceListener**, an instance of an inner class.',
          'Because PriceListener is an inner class, its hidden this$0 field points at **ReportScreen**, so the closed screen is still reachable.',
          'The screen in turn holds a **Chart image** of 50 MB, so everything in the **Heap** group stays in memory.',
          'The dashed fix arrow points to a **Static nested listener**: with no this$0 field, the screen becomes unreachable and the GC frees it.',
          'Takeaway: an inner class silently keeps its outer object alive, so prefer static nested classes for long-lived callbacks.',
        ],
        cols: 4,
        rows: 2,
        nodes: [
          { id: 'root', label: 'GC root', detail: 'static EventBus field', col: 0, row: 0, shape: 'pill', tone: 'neutral' },
          { id: 'bus', label: 'EventBus', detail: 'listener list', col: 1, row: 0, tone: 'primary' },
          { id: 'lis', label: 'PriceListener', detail: 'inner class instance', col: 2, row: 0, tone: 'warning' },
          { id: 'scr', label: 'ReportScreen', detail: 'closed, still reachable', col: 3, row: 0, tone: 'danger' },
          { id: 'img', label: 'Chart image', detail: '50 MB byte[]', col: 3, row: 1, shape: 'cylinder', tone: 'danger' },
          { id: 'fix', label: 'Static nested listener', detail: 'no this$0: screen freed', col: 1, row: 1, span: 2, tone: 'success' },
        ],
        edges: [
          { from: 'root', to: 'bus' },
          { from: 'bus', to: 'lis', label: 'strong ref' },
          { from: 'lis', to: 'scr', label: 'hidden this$0' },
          { from: 'scr', to: 'img' },
          { from: 'bus', to: 'fix', label: 'the fix', dashed: true },
        ],
        groups: [{ label: 'Heap', fromCol: 1, toCol: 3, fromRow: 0, toRow: 1, tone: 'neutral' }],
      },
      {
        id: 'o-nested-choose',
        kind: 'flow',
        title: 'Choosing the right kind',
        caption: 'Start from the cheapest option and move right only when you need more: no outer link, then a lambda, then a named or anonymous class.',
        explanation: [
          'Start with **Needs the outer object\'s state?** If no, choose a **Static nested class**, the cheapest option with no hidden outer reference.',
          'If yes, ask **Single-method interface, no own state?** If yes, write a **Lambda or method ref**, which needs no class declaration at all.',
          'Otherwise ask **Used in one method only?** If no, the class is shared across the outer class, so declare a **Member inner class**.',
          'If it is used in one method, ask **Needs a name or reuse in the method?** If yes, declare a **Local class**; if no, use an **Anonymous class**.',
          'Takeaway: move right only when you need more, because each step adds an outer link or extra syntax.',
        ],
        cols: 4,
        rows: 3,
        nodes: [
          { id: 'q1', label: 'Needs the outer object\'s state?', col: 0, row: 0, tone: 'primary' },
          { id: 'sn', label: 'Static nested class', col: 0, row: 1, shape: 'pill', tone: 'success' },
          { id: 'q2', label: 'Single-method interface, no own state?', col: 1, row: 0, tone: 'primary' },
          { id: 'lam', label: 'Lambda or method ref', col: 1, row: 1, shape: 'pill', tone: 'success' },
          { id: 'q3', label: 'Used in one method only?', col: 2, row: 0, tone: 'primary' },
          { id: 'q4', label: 'Needs a name or reuse in the method?', col: 2, row: 1, tone: 'primary' },
          { id: 'mem', label: 'Member inner class', col: 3, row: 0, shape: 'pill', tone: 'accent' },
          { id: 'loc', label: 'Local class', col: 2, row: 2, shape: 'pill', tone: 'accent' },
          { id: 'anon', label: 'Anonymous class', col: 3, row: 2, shape: 'pill', tone: 'accent' },
        ],
        edges: [
          { from: 'q1', to: 'sn', label: 'no' },
          { from: 'q1', to: 'q2', label: 'yes' },
          { from: 'q2', to: 'lam', label: 'yes' },
          { from: 'q2', to: 'q3', label: 'no' },
          { from: 'q3', to: 'mem', label: 'no' },
          { from: 'q3', to: 'q4', label: 'yes' },
          { from: 'q4', to: 'loc', label: 'yes' },
          { from: 'q4', to: 'anon', label: 'no' },
        ],
      },
    ],
    variants: [
      {
        title: 'Kinds of nested class',
        intro: 'All four are standard Java. What differs is whether there is an enclosing instance and where the class is visible.',
        items: [
          {
            name: 'Static nested class',
            summary: 'A member class marked static. No enclosing instance; accesses the outer class\'s private static members.',
            support: 'supported',
            note: 'The default choice (Effective Java Item 24).',
            code: 'class Order {\n  static class Builder { ... }\n}\nnew Order.Builder();',
          },
          {
            name: 'Inner (member) class',
            summary: 'A non-static member class. Every instance is bound to an outer instance, reachable as Outer.this.',
            support: 'supported',
            note: 'Since Java 16 it may also declare static members.',
            code: 'class Playlist {\n  class Cursor { ... }\n}\nplaylist.new Cursor();',
          },
          {
            name: 'Local class',
            summary: 'Declared inside a block; visible only there. Captures effectively final locals.',
            support: 'supported',
            note: 'Since Java 16, local records, enums and interfaces are allowed and are implicitly static.',
            code: 'void run(int limit) {\n  class Filter { boolean ok(int x) { return x > limit; } }\n}',
          },
          {
            name: 'Anonymous class',
            summary: 'Declared and instantiated in one expression, implementing an interface or extending a class.',
            support: 'supported',
            note: 'No constructors; use an instance initialiser. Prefer a lambda for functional interfaces.',
            code: 'Runnable r = new Runnable() {\n  public void run() { tick(); }\n};',
          },
          {
            name: 'Lambda (for comparison)',
            summary: 'An expression implementing a functional interface; not a class declaration, no new this.',
            support: 'partial',
            note: 'Replaces anonymous classes only for single-abstract-method interfaces.',
            code: 'Runnable r = () -> tick();',
          },
        ],
      },
    ],
    deepDive: [
      {
        title: 'Enclosing instances in the JLS and in bytecode',
        body: 'JLS §8.1.3 defines an inner class instance\'s **immediately enclosing instance**, and §15.9.2 how it is determined for `new` (implicitly `this`, or explicitly `outer.new Inner()`). In bytecode the outer reference is just a constructor argument stored in a synthetic final field, and `javac` inserts a null check on it, so `((Outer) null).new Inner()` fails with a `NullPointerException`. Before Java 11 private access between outer and inner classes also required synthetic accessor methods; JEP 181 (nestmates) removed them.',
        sources: [
          { label: 'JLS §8.1.3: Inner Classes and Enclosing Instances', url: 'https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html#jls-8.1.3' },
          { label: 'JEP 181: Nest-Based Access Control', url: 'https://openjdk.org/jeps/181' },
        ],
      },
      {
        title: 'How lambdas differ from anonymous classes at run time',
        body: 'An anonymous class compiles to its own class file and every evaluation allocates a new object. A lambda compiles to a private method plus an `invokedynamic` call site; on first execution `LambdaMetafactory` spins a hidden class, and non-capturing lambdas usually return a cached singleton afterwards. Semantically, JLS §15.27.2 makes the lambda body lexically scoped: `this` and `super` mean the same as outside it, and a lambda parameter may not reuse the name of an enclosing local.',
        sources: [
          { label: 'JLS §15.27.2: Lambda Body', url: 'https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.27.2' },
          { label: 'LambdaMetafactory API', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/invoke/LambdaMetafactory.html' },
        ],
      },
      {
        title: 'Serialising inner classes is a trap',
        body: 'The Java serialisation specification strongly discourages serialising inner classes, including local and anonymous ones: the synthetic fields and class names are compiler-specific, so the serialised form can change between compilers, and serialising one drags the outer instance along. Static nested classes have none of these issues. Lambdas are serialisable only when their target type is, and are similarly fragile.',
        sources: [
          { label: 'Java Object Serialization Specification: system architecture (note on inner classes)', url: 'https://docs.oracle.com/en/java/javase/21/docs/specs/serialization/serial-arch.html' },
          { label: 'Effective Java (3rd ed.), Item 24: Favor static member classes over nonstatic' },
        ],
      },
    ],
  },

  'o-enums': {
    textbook: {
      definition:
        'An **enum class** is a special kind of class that defines a fixed set of named instances, its **enum constants**. Each constant is a public static final field initialised, during class initialisation, to the only instance of the class (or of an anonymous subclass) for that name; no other instances can be created by `new`, cloning, reflection or deserialisation. Every enum class implicitly extends `java.lang.Enum`, has only private constructors, and provides the implicit static methods `values()` and `valueOf(String)`. Each constant has a **name** and an **ordinal**, its zero-based position in the declaration.',
      terms: [
        { term: 'Enum constant', meaning: 'A named instance declared in an enum body; it may pass arguments to a constructor and may have its own class body.' },
        { term: 'Ordinal', meaning: 'The zero-based position of a constant in its enum declaration, returned by `ordinal()` and used internally by EnumSet and EnumMap.' },
        { term: 'Constant-specific class body', meaning: 'A class body attached to one enum constant, making that constant an instance of an anonymous subclass that can override methods.' },
        { term: 'java.lang.Enum', meaning: 'The common superclass of all enum classes, which supplies name(), ordinal(), compareTo and final, identity-based equals and hashCode.' },
      ],
      source: 'JLS §8.9 (Enum Classes); Javadoc for java.lang.Enum',
    },
    interviewDefinition:
      'An **enum** is a class with a fixed, compile-time set of singleton instances. It implicitly extends `java.lang.Enum`, its constructors are private, and the JVM guarantees one instance per constant, so `==` comparison is safe. Constants can carry fields, methods and constant-specific bodies, enums can implement interfaces, and switch expressions over them are checked for exhaustiveness. Persist `name()` rather than `ordinal()`, and use `EnumSet`/`EnumMap` for compact, fast enum-keyed collections.',
    interviewFollowUps: [
      {
        question: 'Why is an enum the recommended way to write a singleton?',
        answer: 'The JVM creates the instance once during class initialisation (lazy and thread-safe), reflection refuses to instantiate enums, and serialisation writes only the name and resolves it back to the existing constant. Effective Java Item 3 calls a single-element enum often the best way to implement a singleton; its limitation is that it cannot extend a class.',
      },
      {
        question: 'Can an enum extend another class or be extended?',
        answer: 'No. Every enum already extends `java.lang.Enum`, and Java has single class inheritance. It cannot be subclassed by other code either; constants with bodies become anonymous subclasses generated by the compiler. Enums can implement any number of interfaces.',
      },
      {
        question: 'What happens if you switch over an enum and a new constant is added later?',
        answer: 'A switch **expression** without `default` stops compiling until the new constant is handled. If an old compiled class meets a new constant at run time, it throws `MatchException` (Java 21+; `IncompatibleClassChangeError` in older releases). Classic switch statements without `default` silently do nothing.',
      },
    ],
    mnemonic: {
      device: 'FIXED: an enum is a FIXED cast of objects',
      expansion: [
        { key: 'F', meaning: 'Final set: every constant is known at compile time, no new instances ever' },
        { key: 'I', meaning: 'Interfaces allowed, but no extending (already extends Enum)' },
        { key: 'X', meaning: 'eXhaustive switch expressions: the compiler checks every constant is handled' },
        { key: 'E', meaning: 'EnumSet / EnumMap: bit vectors and ordinal-indexed arrays' },
        { key: 'D', meaning: 'Data and behaviour per constant: fields, constructors, constant-specific methods' },
      ],
      visual: 'A theatre cast list printed in the programme: the roles are fixed before the show, each role is played by exactly one actor, and every actor carries their own props.',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'A vending machine\'s buttons',
        body: 'An `int` code is like typing any number on a keypad: 7 works, but so does 9999. An enum is a row of physical buttons — you can only press the ones that exist, each is labelled, and each knows its own price and product.',
      },
      {
        kind: 'insight',
        title: 'Replace switch-on-type with behaviour on the constant',
        body: 'When the same `switch (op)` appears in several places, move the behaviour into the enum (a field holding a lambda, or a constant-specific method). Adding a constant then forces you to supply its behaviour in one place, instead of hunting down every switch.',
      },
      {
        kind: 'real-world',
        title: 'Enums across the JDK',
        body: '`TimeUnit.SECONDS.toMillis(5)`, `DayOfWeek.MONDAY.plus(2)`, `ChronoUnit.DAYS.between(a, b)`, `StandardOpenOption.APPEND` and `RetentionPolicy.RUNTIME` are all enums with behaviour. `Files.newBufferedWriter(path, StandardOpenOption.CREATE, StandardOpenOption.APPEND)` shows enums as type-safe flags — the job `EnumSet` was designed for.',
      },
      {
        kind: 'angle',
        title: 'Enums versus sealed types',
        body: 'Both model a closed set with exhaustive switches. Use an enum when every case has the **same shape** and is a single instance (statuses, units). Use a sealed interface with records when cases carry **different data per occurrence** (Paid(amount), Declined(reason)).',
      },
    ],
    diagrams: [
      {
        id: 'o-enums-instances',
        kind: 'concept',
        title: 'An enum is a class with exactly N instances',
        caption: 'Size.class holds three static final fields, each pointing at the only object for that constant. Every variable of type Size points at one of them (or null), which is why == works.',
        explanation: [
          '**enum Size** at the top is a final class that extends java.lang.Enum. Each static final arrow points to one of its constants.',
          '**SMALL**, **MEDIUM** and **LARGE** form the group of the only Size objects that can ever exist; each carries its ordinal, a label and a price.',
          'The variable **Size order** holds a reference to MEDIUM. The same object arrow means it points at that very constant, not at a copy.',
          '**Size.valueOf("MEDIUM")** looks a constant up by its exact name (not by its "M" label, which would throw IllegalArgumentException). It never creates an object; it returns the existing MEDIUM, so comparing with == is safe.',
          '**new Size()** is a compile error: enum constructors are private and the language forbids instantiating an enum.',
          'Takeaway: an enum is a class with exactly N instances, which makes identity comparison and enum singletons safe.',
        ],
        cols: 3,
        rows: 3,
        nodes: [
          { id: 'cls', label: 'enum Size', detail: 'extends java.lang.Enum, final', col: 0, row: 0, span: 3, tone: 'primary' },
          { id: 's', label: 'SMALL', detail: 'ordinal 0, "S", 250', col: 0, row: 1, tone: 'accent' },
          { id: 'm', label: 'MEDIUM', detail: 'ordinal 1, "M", 300', col: 1, row: 1, tone: 'accent' },
          { id: 'l', label: 'LARGE', detail: 'ordinal 2, "L", 350', col: 2, row: 1, tone: 'accent' },
          { id: 'v1', label: 'Size order', detail: 'variable', col: 0, row: 2, shape: 'pill', tone: 'neutral' },
          { id: 'v2', label: 'Size.valueOf("MEDIUM")', detail: 'lookup by constant name', col: 1, row: 2, shape: 'pill', tone: 'neutral' },
          { id: 'nw', label: 'new Size()', detail: 'compile error', col: 2, row: 2, shape: 'pill', tone: 'danger' },
        ],
        edges: [
          { from: 'cls', to: 's', label: 'static final' },
          { from: 'cls', to: 'm' },
          { from: 'cls', to: 'l' },
          { from: 'v1', to: 'm', label: 'same object' },
          { from: 'v2', to: 'm' },
        ],
        groups: [{ label: 'The only Size objects that can ever exist', fromCol: 0, toCol: 2, fromRow: 1, toRow: 1, tone: 'accent' }],
      },
      {
        id: 'o-enums-lifecycle',
        kind: 'flow',
        title: 'From first use to switch',
        caption: 'Constants are created once, in declaration order, during class initialisation. After that, every lookup and switch reuses those same objects.',
        explanation: [
          '**First use of Size**, for example reading Size.MEDIUM, triggers **Class initialisation**, which the JVM runs once and thread-safely.',
          'During it the **Constructor per constant** runs in declaration order: SMALL, then MEDIUM, then LARGE.',
          'The constants are also stored in the hidden **$VALUES array**; values() returns a fresh copy of it on every call.',
          '**valueOf("LARGE")** looks a constant up by its name and returns it, or throws IllegalArgumentException for an unknown name.',
          'That constant can drive a **switch expression** that lists every constant and needs no default, and, as the dashed arrow suggests, can key an **EnumSet / EnumMap** indexed by ordinal.',
          'Takeaway: constants are built once, and every later lookup or switch reuses those same objects.',
        ],
        cols: 4,
        rows: 2,
        nodes: [
          { id: 'use', label: 'First use of Size', detail: 'e.g. Size.MEDIUM', col: 0, row: 0, shape: 'pill', tone: 'neutral' },
          { id: 'init', label: 'Class initialisation', detail: 'once, thread-safe', col: 1, row: 0, tone: 'primary' },
          { id: 'ctor', label: 'Constructor per constant', detail: 'SMALL, MEDIUM, LARGE', col: 2, row: 0, tone: 'accent' },
          { id: 'arr', label: '$VALUES array', detail: 'copied by values()', col: 3, row: 0, shape: 'cylinder', tone: 'accent' },
          { id: 'vo', label: 'valueOf("LARGE")', detail: 'name lookup or exception', col: 3, row: 1, tone: 'neutral' },
          { id: 'sw', label: 'switch expression', detail: 'exhaustive, no default', col: 2, row: 1, tone: 'success' },
          { id: 'map', label: 'EnumSet / EnumMap', detail: 'indexed by ordinal', col: 1, row: 1, tone: 'success' },
        ],
        edges: [
          { from: 'use', to: 'init' },
          { from: 'init', to: 'ctor', label: 'declaration order' },
          { from: 'ctor', to: 'arr' },
          { from: 'arr', to: 'vo' },
          { from: 'vo', to: 'sw', label: 'constant' },
          { from: 'sw', to: 'map', dashed: true },
        ],
      },
      {
        id: 'o-enums-collections',
        kind: 'architecture',
        title: 'Why EnumSet and EnumMap are fast',
        caption: 'Because ordinals are small consecutive integers, a set becomes bits in a long and a map becomes a plain array. No hashing, no boxing of keys, iteration in declaration order.',
        explanation: [
          '**EnumSet.of(SMALL, LARGE)** is backed by a RegularEnumSet, used whenever the enum has at most 64 constants.',
          'Its entire state is **long bits = 0b101**: bit 0 for SMALL and bit 2 for LARGE are set, so contains is a single bit test.',
          '**EnumMap<Size, Integer>** stores its values in **Object[] vals = {2, null, 2}**, where the array slot index is the key\'s ordinal and null means no mapping.',
          'Takeaway: no hashing and no boxed keys are needed, and iteration always follows declaration order.',
        ],
        cols: 4,
        rows: 2,
        nodes: [
          { id: 'set', label: 'EnumSet.of(SMALL, LARGE)', col: 0, row: 0, span: 2, tone: 'primary' },
          { id: 'bits', label: 'long bits = 0b101', detail: 'bit n = ordinal n', col: 2, row: 0, span: 2, shape: 'cylinder', tone: 'accent' },
          { id: 'map', label: 'EnumMap<Size, Integer>', col: 0, row: 1, span: 2, tone: 'primary' },
          { id: 'vals', label: 'Object[] vals = {2, null, 2}', detail: 'index = ordinal', col: 2, row: 1, span: 2, shape: 'cylinder', tone: 'accent' },
        ],
        edges: [
          { from: 'set', to: 'bits', label: 'RegularEnumSet' },
          { from: 'map', to: 'vals', label: 'array slot' },
        ],
      },
    ],
    variants: [
      {
        title: 'Ways to give enum constants behaviour',
        intro: 'From simplest to most flexible; all are standard since Java 5 (lambdas since 8).',
        items: [
          { name: 'Plain constants', summary: 'Names only; behaviour lives in switches elsewhere.', support: 'supported', code: 'enum Status { PLACED, READY }' },
          { name: 'Fields and constructor', summary: 'Each constant carries data; shared methods read it.', support: 'supported', code: 'LARGE("L", 350);\nprivate final int priceCents;' },
          { name: 'Constant-specific method bodies', summary: 'Each constant overrides an (often abstract) method.', support: 'supported', note: 'Each such constant becomes a compiler-generated subclass.', code: 'PLUS { int apply(int a, int b) { return a + b; } }' },
          { name: 'Strategy field (lambda)', summary: 'Each constant passes a function to the constructor.', support: 'supported', note: 'Shorter than constant bodies when the behaviour is one expression.', code: 'PLUS("+", (a, b) -> a + b);\nprivate final IntBinaryOperator op;' },
          { name: 'Implementing an interface', summary: 'Callers depend on the interface; the enum is one implementation.', support: 'supported', note: 'Also the way to emulate "extensible enums" (Effective Java Item 38).', code: 'enum BasicOp implements Op { ... }' },
        ],
      },
      {
        title: 'Built-in methods every enum has',
        intro: 'Generated by the compiler or inherited from java.lang.Enum (JLS §8.9.3).',
        items: [
          {
            name: 'values()',
            summary: 'Static; returns a new array of all constants in declaration order.',
            support: 'supported',
            note: 'Allocates a copy on every call; cache it in hot loops.',
            code: 'for (Size s : Size.values()) { ... }',
          },
          {
            name: 'valueOf(String)',
            summary: 'Static; returns the constant with exactly that name, or throws IllegalArgumentException.',
            support: 'supported',
            code: 'Size s = Size.valueOf("LARGE");',
          },
          {
            name: 'name()',
            summary: 'The constant\'s declared name. It is final, unlike toString(), which may be overridden for display.',
            support: 'supported',
            code: 'Size.LARGE.name()   // "LARGE"',
          },
          {
            name: 'ordinal()',
            summary: 'The zero-based declaration position. Reordering constants changes it, so never persist it.',
            support: 'supported',
            code: 'Size.LARGE.ordinal()   // 2',
          },
          {
            name: 'compareTo(E)',
            summary: 'Enums implement Comparable and are ordered by ordinal.',
            support: 'supported',
            code: 'Size.SMALL.compareTo(Size.LARGE)   // negative',
          },
          {
            name: 'getDeclaringClass()',
            summary: 'Returns the enum class even for a constant with a body, whose getClass() is an anonymous subclass.',
            support: 'supported',
            code: 'Op.PLUS.getDeclaringClass()   // Op.class',
          },
        ],
      },
    ],
    deepDive: [
      {
        title: 'What the compiler generates for an enum',
        body: 'JLS §8.9 specifies that an enum class is implicitly `final` unless a constant has a class body, that its constructors are implicitly private, and that it gets implicit `values()` and `valueOf(String)` methods. `javac` emits a `public static final` field per constant, a private `$VALUES` array, and a static initialiser that constructs constants in order. `values()` returns `$VALUES.clone()`, so it allocates on every call — cache it in hot loops. `Enum.equals` is final and identity-based, and `clone()` throws, so no copies can appear.',
        sources: [
          { label: 'JLS §8.9: Enum Classes', url: 'https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html#jls-8.9' },
          { label: 'java.lang.Enum API', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Enum.html' },
        ],
      },
      {
        title: 'Why enums are serialisation- and reflection-proof',
        body: 'Serialisation writes only the constant\'s name; deserialisation calls `Enum.valueOf`, so no new instance is created and custom `readObject`/`writeReplace` methods are ignored. `Constructor.newInstance` throws `IllegalArgumentException` ("Cannot reflectively create enum objects"). Together these make an enum the only singleton that cannot be duplicated by those two classic attacks.',
        sources: [
          { label: 'Java Object Serialization Specification, section 1.12: Serialization of Enum Constants', url: 'https://docs.oracle.com/en/java/javase/21/docs/specs/serialization/serial-arch.html' },
          { label: 'Effective Java (3rd ed.), Item 3: Enforce the singleton property with a private constructor or an enum type' },
        ],
      },
      {
        title: 'EnumSet: a bit vector behind a Set interface',
        body: '`EnumSet` is abstract; its factories return `RegularEnumSet` (a single `long`) for enums with up to 64 constants and `JumboEnumSet` (a `long[]`) otherwise. `contains`, `add` and bulk operations like `addAll` and `retainAll` are bit operations, so `EnumSet` replaces C-style `int` flag fields with full type safety at similar cost. `EnumMap` likewise stores values in an array indexed by ordinal. Effective Java Items 36 and 37 recommend both over bit fields and ordinal-indexed arrays.',
        sources: [
          { label: 'EnumSet API', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/EnumSet.html' },
          { label: 'EnumMap API', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/EnumMap.html' },
        ],
      },
      {
        title: 'Switch expressions, exhaustiveness and binary compatibility',
        body: 'Switch expressions became standard in Java 14 (JEP 361) and must be exhaustive; for an enum, listing every constant suffices. Because a library may add a constant after your class was compiled, `javac` inserts a synthetic default that throws: `MatchException` since Java 21 (JEP 441), previously `IncompatibleClassChangeError`. Java 21 also allowed qualified constants such as `case Size.LARGE ->`, useful when switching over a sealed interface implemented by several enums.',
        sources: [
          { label: 'JEP 361: Switch Expressions', url: 'https://openjdk.org/jeps/361' },
          { label: 'JEP 441: Pattern Matching for switch', url: 'https://openjdk.org/jeps/441' },
        ],
      },
    ],
  },
};
