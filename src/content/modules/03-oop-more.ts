import type { Lesson } from '@/types/curriculum';

/** Extra OOP lessons, appended to the OOP module after the existing lessons. */
export const oopMoreLessons: Lesson[] = [
  // -------------------------------------------------------------------------
  {
    id: 'o-access-modifiers',
    moduleId: 'oop',
    title: 'Access modifiers and keywords: public, private, static, final, abstract, this, super',
    summary: 'Who can see what, what static, final and abstract really mean, how this and super work, and the exact order in which a class and an object are initialised.',
    estimatedMinutes: 35,
    difficulty: 'beginner',
    prerequisites: ['o-classes-objects'],
    versionNotes: [
      { feature: 'Modules: public is only visible outside a module when its package is exported', since: 9 },
      { feature: 'Nest-based access control (nested classes share private access without synthetic bridges)', since: 11 },
      { feature: 'strictfp has no effect (all floating point is strict)', since: 17 },
      { feature: 'Flexible constructor bodies: statements before super(...)/this(...)', since: 25, note: 'preview in 22-24, final in 25 (JEP 513)' },
    ],
    objectives: [
      'Explain the four access levels (public, protected, package-private, private) and pick the narrowest one that works.',
      'Explain the protected-across-packages rule.',
      'Use static, final and abstract correctly on fields, methods and classes, and know what "effectively final" means.',
      'Use this and super for field disambiguation, constructor chaining and calling parent methods.',
      'Predict the order of static blocks, instance initialisers and constructors.',
    ],
    plainEnglish: `Think of a class as a house. **Access modifiers** decide who may come in:

- \`private\` — only people who live in this house (code inside the same class).
- *no modifier* (called **package-private**) — anyone on the same street (classes in the same package).
- \`protected\` — the street, plus your children who moved to other streets (subclasses in other packages).
- \`public\` — anyone at all.

Other keywords describe **what kind** of thing a member is rather than who can see it:

- \`static\` — belongs to the class itself, shared by every object ("the house number painted on the street sign", not something inside each room).
- \`final\` — cannot be changed: a final variable is assigned once, a final method cannot be overridden, a final class cannot be extended.
- \`abstract\` — not finished yet: an abstract method has no body, and a class with one must be abstract and cannot be created with \`new\`.

Inside a class, \`this\` means "the current object" and \`super\` means "the parent-class part of the current object".`,
    technical: `### The four access levels
From widest to narrowest:

- **public** — accessible from any class (in a modular app, only from modules that can read the module and when the package is exported).
- **protected** — accessible from the same package, *and* from subclasses in other packages, with a restriction (below).
- **package-private** (no keyword) — accessible only from classes in the same package. This is the default for class members; interface members are implicitly public instead.
- **private** — accessible only within the top-level class that declares it, including its nested classes. Access is per *class*, not per *object*: a method may read \`other.secret\` when \`other\` is the same class.

Top-level classes may only be \`public\` or package-private; nested members may use all four.

### The protected subtlety
Outside the package, a subclass \`S\` may use an inherited protected member only **through references of type S (or its subclasses)** — e.g. \`this.balance\` or \`otherS.balance\`, but not \`someParent.balance\` where the variable's type is the parent (JLS §6.6.2). Protected constructors from another package can be called only via \`super(...)\` (or an anonymous subclass), not with a plain \`new\`.

### static
- **Fields**: one copy per class, created when the class is initialised.
- **Methods**: called on the class; there is no \`this\`, so they cannot touch instance members directly. Static methods are *hidden*, not overridden.
- **Static blocks**: \`static { ... }\` run once, in source order with static field initialisers, when the class is first initialised (first \`new\`, static method call, or non-constant static field access).
- **Static nested classes**: a class inside a class with no link to an outer object.

### final
- **Variables** (fields, locals, parameters): assigned exactly once. For references, the *reference* is fixed; the object it points to can still change. A \`static final\` primitive or String initialised with a constant expression is a **compile-time constant** and is inlined by \`javac\`.
- **Effectively final**: a local that is never reassigned after initialisation; lambdas and inner classes may capture only final or effectively final locals.
- **Methods**: cannot be overridden. **Classes**: cannot be extended (\`String\`, \`Integer\`).

### abstract
An abstract method has no body; a class containing one must be abstract and cannot be instantiated. \`abstract\` cannot be combined with \`final\`, \`private\` or \`static\` on a method, because each of those prevents the overriding that abstract requires.

### Rarer modifiers (brief)
- \`synchronized\` — a method acquires the object's monitor (or the Class object's for static methods) before running.
- \`volatile\` — a field whose reads and writes are visible across threads immediately and are not reordered.
- \`transient\` — a field skipped by Java serialisation.
- \`native\` — implemented in non-Java code; \`strictfp\` — obsolete since Java 17.

### this and super
- \`this.name = name\` — the field versus the parameter that shadows it.
- \`this(...)\` — call another constructor of the same class; \`super(...)\` — call a parent constructor. Before Java 25 each must be the first statement; if neither is written, the compiler inserts \`super()\`.
- \`super.method()\` — run the parent's version of an overridden method; \`super.field\` — read a hidden parent field.

### Initialisation order
1. **Class initialisation** (once per class, parent first): static field initialisers and static blocks, top to bottom.
2. **Each \`new\`**: the constructor chain goes up via \`this(...)\`/\`super(...)\` to \`Object\`. Then, from parent down to child, each class runs its instance field initialisers and instance blocks \`{ ... }\` (top to bottom), then the rest of its constructor body.`,
    whyItExists: `Access modifiers let a class keep a small, stable public surface while its internals stay free to change. If nothing outside a class can touch a private field, you can rename it, validate it or change its type without breaking anyone. The non-access modifiers state intent the compiler can enforce: \`final\` prevents accidental change and enables safe sharing between threads, \`static\` separates per-class data from per-object data, and \`abstract\` forces subclasses to fill in the missing parts.`,
    whenToUse: [
      'Start every field as private and every class member at the narrowest level that works; widen only when a real caller needs it.',
      'Use package-private for helpers that only collaborators in the same package should use (and for test access from the same package).',
      'Use protected only for hooks deliberately designed for subclasses.',
      'Make fields final by default; make classes final unless they are designed for extension.',
      'Use static final for true constants and static methods for stateless utilities.',
    ],
    whenNotToUse: [
      'Do not make fields public or protected "just in case" — every widened member becomes a promise you must keep.',
      'Do not use mutable static fields as a convenient global store; they are shared by everything and hard to test.',
      'Do not reach for protected fields: a protected field is visible to the whole package, not only subclasses.',
      'Do not assume final makes an object immutable; it only fixes the reference.',
    ],
    examples: [
      {
        id: 'o8-init-order',
        title: 'Static blocks, instance blocks, constructors, this and super',
        runnable: true,
        code: `class Base {
    static { System.out.println("Base: static block"); }
    { System.out.println("Base: instance block"); }

    Base() {
        System.out.println("Base: constructor");
    }

    String describe() { return "Base"; }
}

class Child extends Base {
    static int created;
    static { System.out.println("Child: static block"); }

    private final String name;
    { System.out.println("Child: instance block"); }

    Child() {
        this("guest");
        System.out.println("Child: no-arg constructor done");
    }

    Child(String name) {
        super();
        this.name = name;
        created++;
        System.out.println("Child: constructor name=" + this.name);
    }

    @Override
    String describe() { return super.describe() + " > Child(" + name + ")"; }
}

public class Main {
    public static void main(String[] args) {
        System.out.println("main starts");
        Child a = new Child();
        System.out.println("---");
        Child b = new Child("Ada");
        System.out.println(a.describe() + " | " + b.describe() + " | created=" + Child.created);
    }
}`,
        expectedOutput: `main starts
Base: static block
Child: static block
Base: instance block
Base: constructor
Child: instance block
Child: constructor name=guest
Child: no-arg constructor done
---
Base: instance block
Base: constructor
Child: instance block
Child: constructor name=Ada
Base > Child(guest) | Base > Child(Ada) | created=2`,
        explanation: 'Static blocks run once, parent first, the first time Child is used. Every `new` then runs parent instance block and constructor before the child\'s. Notice the second object prints no static lines.',
      },
      {
        id: 'o8-final-static',
        title: 'final references, static members and effectively final locals',
        runnable: true,
        code: `import java.util.ArrayList;
import java.util.List;

final class Guestlist {
    static final int MAX_GUESTS = 3;
    private static int listsCreated;

    private final List<String> guests = new ArrayList<>();

    Guestlist() {
        listsCreated++;
    }

    boolean add(String guest) {
        if (guests.size() >= MAX_GUESTS) return false;
        return guests.add(guest);
    }

    List<String> guests() { return List.copyOf(guests); }

    static int listsCreated() { return listsCreated; }
}

public class Main {
    public static void main(String[] args) {
        Guestlist party = new Guestlist();
        party.add("Ada");
        party.add("Linus");
        party.add("Grace");
        System.out.println(party.add("Alan") + " " + party.guests());

        new Guestlist();
        System.out.println("lists created: " + Guestlist.listsCreated());

        final int[] scores = {1, 2, 3};
        scores[0] = 10;
        String greeting = "Hi";
        Runnable r = () -> System.out.println(greeting + " " + scores[0]);
        r.run();
    }
}`,
        expectedOutput: `false [Ada, Linus, Grace]
lists created: 2
Hi 10`,
        explanation: 'The final `guests` reference can never point at another list, but the list itself still changes. `scores` is final yet its elements change. `greeting` is never reassigned, so it is effectively final and the lambda may capture it.',
      },
      {
        id: 'o8-packages',
        title: 'Access across two packages (shown, not run)',
        code: `// file: com/shop/core/Account.java
package com.shop.core;

public class Account {
    public String id;          // everyone
    protected long balance;    // same package + subclasses (via their own type)
    String region;             // package-private: com.shop.core only
    private String pinHash;    // Account only

    protected Account() { }
}

// file: com/shop/core/Auditor.java
package com.shop.core;

class Auditor {
    void check(Account a) {
        a.id = "A-1";            // OK: public
        a.balance = 0;           // OK: protected includes the same package
        a.region = "EU";         // OK: same package
        // a.pinHash = "x";      // error: private to Account
    }
}

// file: com/shop/premium/GoldAccount.java
package com.shop.premium;

import com.shop.core.Account;

public class GoldAccount extends Account {
    void bonus(GoldAccount other, Account plain) {
        balance += 100;          // OK: inherited, accessed through this
        other.balance += 100;    // OK: reference type is GoldAccount
        // plain.balance += 100; // error: protected access only through GoldAccount
        // region = "US";        // error: package-private, different package
        // new Account();        // error: protected constructor, not via super()
    }
}`,
        explanation: 'Each commented-out line is a compile error. The protected rule outside the package is the one interviewers love: a subclass may touch the protected member only through its own type.',
      },
    ],
    walkthrough: {
      exampleId: 'o8-init-order',
      steps: [
        { lines: [1, 3], text: 'Base has a static block (runs once, when the class is initialised) and an instance block (runs for every new object, before the constructor body).' },
        { lines: [12, 17], text: 'Child declares its own static block and instance block. `name` is a final instance field, so every constructor path must assign it exactly once.' },
        { lines: [19, 22], text: 'The no-arg constructor chains to the other constructor with this("guest"). Instance blocks do not run here; they run in the constructor that calls super.' },
        { lines: [24, 29], text: 'super() runs Base\'s instance block and constructor first. Then Child\'s instance block runs, then the rest of this body. `this.name` is the field; plain `name` is the parameter shadowing it.' },
        { lines: [31, 32], text: 'super.describe() calls the parent\'s version of a method this class overrides.' },
        { lines: [38, 41], text: 'The first new Child() triggers class initialisation: Base static block, then Child static block. The second new Child("Ada") skips them, because a class is initialised only once.' },
      ],
    },
    realWorld: {
      title: 'The protected field that froze a library',
      scenario: `A payments SDK exposed \`protected Map<String, String> headers\` on its \`BaseClient\` so subclasses could add headers. Integrators subclassed it and read and wrote the map directly from many places.

When the team wanted to switch to an immutable header object to fix a thread-safety bug, every change broke customer code: the field was part of the public API by accident. The next major version made the field \`private\`, added a protected \`addHeader(name, value)\` hook and marked the other methods \`final\`. Narrow access turned a breaking change into an internal refactor.`,
    },
    commonMistakes: [
      {
        mistake: 'Believing protected means "subclasses only".',
        why: 'Protected also grants access to every class in the same package.',
        fix: 'Use private plus a deliberate protected method if only subclasses should hook in.',
      },
      {
        mistake: 'Believing final makes an object immutable.',
        why: 'final fixes the reference; the object it points to (a list, an array) can still change.',
        fix: 'Use immutable types (List.copyOf, records with immutable components) and do not expose mutable internals.',
        code: `final List<String> names = new ArrayList<>();
names.add("Ada");          // compiles: the list changes
// names = new ArrayList<>(); // error: the reference is final`,
      },
      {
        mistake: 'Writing name = name; in a constructor.',
        why: 'Both sides refer to the parameter, which shadows the field; the field stays null.',
        fix: 'Write this.name = name;',
      },
      {
        mistake: 'Calling an instance method or using this from a static method.',
        why: 'A static method runs without an object, so there is no this.',
        fix: 'Create or pass an object, or make the method an instance method.',
      },
      {
        mistake: 'Combining abstract with final, private or static on a method.',
        why: 'abstract demands an override; final, private and static all prevent one, so the compiler rejects the combination.',
        fix: 'Keep abstract methods overridable (public, protected or package-private, non-static, non-final).',
      },
    ],
    checks: [
      {
        id: 'o8-c1',
        kind: 'predict-output',
        dimension: 'runtime',
        prompt: 'What does this print?',
        code: `class Lamp {
    static { System.out.print("S "); }
    { System.out.print("I "); }
    Lamp() { System.out.print("C "); }
}

public class Main {
    public static void main(String[] args) {
        new Lamp();
        new Lamp();
        System.out.println();
    }
}`,
        options: [
          { id: 'a', text: 'S I C I C' },
          { id: 'b', text: 'S I C S I C' },
          { id: 'c', text: 'I C S I C' },
          { id: 'd', text: 'C I S C I' },
        ],
        correctOptionId: 'a',
        explanation: 'The static block runs once when Lamp is first initialised. Each new object then runs the instance block before the constructor body.',
        hints: ['How many times is a class initialised?'],
      },
      {
        id: 'o8-c2',
        kind: 'predict-output',
        dimension: 'conceptual',
        prompt: 'Does this compile, and if so what does it print?',
        code: `class Money {
    private final long cents;

    Money(long cents) { this.cents = cents; }

    boolean sameAs(Money other) {
        return this.cents == other.cents;
    }
}

public class Main {
    public static void main(String[] args) {
        System.out.println(new Money(500).sameAs(new Money(500)));
    }
}`,
        options: [
          { id: 'a', text: 'true' },
          { id: 'b', text: 'false' },
          { id: 'c', text: 'Compile error: cents has private access in Money' },
          { id: 'd', text: 'Runtime IllegalAccessError' },
        ],
        correctOptionId: 'a',
        explanation: 'private is checked per class, not per object. Code inside Money may read the private field of any Money instance, which is exactly how equals methods are written.',
      },
      {
        id: 'o8-c3',
        kind: 'multi-select',
        dimension: 'conceptual',
        prompt: 'Class `Base` in package `com.a` declares `protected int level;`. Class `Sub extends Base` lives in package `com.b`. Inside an instance method of Sub, which lines compile?',
        code: `void test(Sub otherSub, Base someBase) {
    int a = level;            // (1)
    int b = this.level;       // (2)
    int c = otherSub.level;   // (3)
    int d = someBase.level;   // (4)
}`,
        options: [
          { id: 'a', text: '(1) level' },
          { id: 'b', text: '(2) this.level' },
          { id: 'c', text: '(3) otherSub.level' },
          { id: 'd', text: '(4) someBase.level' },
        ],
        correctOptionIds: ['a', 'b', 'c'],
        explanation: 'Outside its package, a subclass may access a protected member only through references of its own type (Sub or a subclass of Sub). `someBase` has type Base, so (4) is a compile error (JLS 6.6.2.1).',
      },
      {
        id: 'o8-c4',
        kind: 'predict-output',
        dimension: 'runtime',
        prompt: 'What does this print?',
        code: `public class Main {
    public static void main(String[] args) {
        final int[] nums = {1, 2, 3};
        nums[0] = 10;
        System.out.println(nums[0] + nums[2]);
    }
}`,
        options: [
          { id: 'a', text: '13' },
          { id: 'b', text: '4' },
          { id: 'c', text: 'Compile error: cannot assign a value to final variable nums' },
          { id: 'd', text: '103' },
        ],
        correctOptionId: 'a',
        explanation: 'final fixes the reference `nums`, not the array contents. Changing an element is allowed; `nums = new int[3]` would not be. 10 + 3 is int addition, so 13.',
      },
      {
        id: 'o8-c5',
        kind: 'mcq',
        dimension: 'conceptual',
        prompt: 'Which declaration does NOT compile?',
        options: [
          { id: 'a', text: 'abstract final class Shape { }' },
          { id: 'b', text: 'static final int MAX = 10;  (inside a class)' },
          { id: 'c', text: 'protected abstract double area();  (inside an abstract class)' },
          { id: 'd', text: 'public final void audit() { }  (inside a class)' },
        ],
        correctOptionId: 'a',
        explanation: 'An abstract class exists to be extended; a final class cannot be extended. The combination is contradictory, so javac rejects it. The same logic forbids abstract with private or static on methods.',
      },
      {
        id: 'o8-c6',
        kind: 'predict-output',
        dimension: 'runtime',
        prompt: 'What does this print?',
        code: `class Parent {
    String name = "parent";
    String hello() { return "Hello from Parent"; }
}

class Kid extends Parent {
    String name = "kid";

    @Override
    String hello() { return "Hello from Kid"; }

    void show() {
        String name = "local";
        System.out.println(name + " " + this.name + " " + super.name);
        System.out.println(super.hello() + " / " + hello());
    }
}

public class Main {
    public static void main(String[] args) {
        new Kid().show();
    }
}`,
        options: [
          { id: 'a', text: 'local kid parent\nHello from Parent / Hello from Kid' },
          { id: 'b', text: 'local kid kid\nHello from Kid / Hello from Kid' },
          { id: 'c', text: 'local local local\nHello from Parent / Hello from Kid' },
          { id: 'd', text: 'kid kid parent\nHello from Parent / Hello from Parent' },
        ],
        correctOptionId: 'a',
        explanation: 'A plain name finds the nearest declaration (the local). this.name is Kid\'s field; super.name is the hidden Parent field. super.hello() calls the parent version directly; hello() is dispatched to Kid\'s override.',
      },
    ],
    challengeIds: [],
    masteryCriteria: [
      'State who can access a member at each of the four access levels, including the protected-across-packages rule.',
      'Choose the narrowest access level and add final where it fits, and justify each choice.',
      'Use this and super for shadowed fields, constructor chaining and parent method calls.',
      'Predict the exact output of a program mixing static blocks, instance blocks and chained constructors.',
    ],
    relatedLessonIds: ['o-classes-objects', 'o-inheritance', 'o-nested-classes'],
    revision: [
      { id: 'r1', question: 'List the four access levels from widest to narrowest.', answer: 'public (everyone), protected (same package plus subclasses), package-private / no keyword (same package), private (the declaring top-level class only).' },
      { id: 'r2', question: 'What extra rule applies to protected access from a subclass in another package?', answer: 'The member must be accessed through a reference whose type is the subclass itself (or a subclass of it), such as this or another instance of the subclass, not through a reference typed as the parent.' },
      { id: 'r3', question: 'What does final mean on a variable, a method and a class?', answer: 'Variable: assigned exactly once (the reference, not the object, is fixed). Method: cannot be overridden. Class: cannot be extended.' },
      { id: 'r4', question: 'In what order do static blocks, instance blocks and constructors run?', answer: 'Static initialisers once per class, parent before child, on first use. Then for each new: parent instance initialisers and constructor body, then child instance initialisers and constructor body.' },
      { id: 'r5', question: 'What is the difference between this(...) and super(...)?', answer: 'this(...) calls another constructor of the same class; super(...) calls a parent constructor. Until Java 25 each must be the first statement, and if neither is written the compiler inserts super().' },
    ],
  },

  // -------------------------------------------------------------------------
  {
    id: 'o-nested-classes',
    moduleId: 'oop',
    title: 'Nested, inner, local and anonymous classes',
    summary: 'The four kinds of classes declared inside other code, the hidden outer reference, Outer.this, captured variables, and when a lambda is the better choice.',
    estimatedMinutes: 35,
    difficulty: 'intermediate',
    prerequisites: ['o-access-modifiers'],
    versionNotes: [
      { feature: 'Lambdas replace most single-method anonymous classes', since: 8 },
      { feature: 'Effectively final locals can be captured without writing final', since: 8 },
      { feature: 'Nest-based access control (JEP 181)', since: 11 },
      { feature: 'Inner classes may declare static members; local records, enums and interfaces', since: 16, note: 'JEP 395' },
    ],
    objectives: [
      'Name the four kinds of nested class and choose the right one.',
      'Explain the hidden reference an inner class holds to its outer object and the memory-leak risk it creates.',
      'Use Outer.this to reach a shadowed outer member.',
      'Explain the effectively-final rule for captured local variables.',
      'Replace a single-method anonymous class with a lambda and explain how this differs between the two.',
    ],
    plainEnglish: `Java lets you declare a class **inside** another class, or even inside a method. There are four kinds:

- **Static nested class** — a normal class that simply lives inside another for organisation. \`Map.Entry\` is one. It does not belong to any particular outer object.
- **Inner class** (a non-static member class) — every inner object is **attached to one outer object** and can use that object's fields directly, like a pocket sewn onto a particular coat.
- **Local class** — a class declared inside a method, usable only in that method.
- **Anonymous class** — a class with no name, declared and instantiated in one expression, typically to implement an interface once.

Since Java 8, a **lambda** is usually a shorter replacement for an anonymous class that implements an interface with a single method.`,
    technical: `### Static nested classes
Declared with \`static\` inside a class. No enclosing instance: create one with \`new Outer.Nested()\`. It can access the outer class's **private static** members, and private instance members only through an outer object it is given. Ideal for helpers tightly bound to the outer class: builders, map entries, nodes of a linked list.

### Inner (member) classes
A non-static member class. Every instance carries a hidden reference to an enclosing instance (\`javac\` passes it to the constructor and stores it in a synthetic field). Create one with \`outer.new Inner()\`, or plain \`new Inner()\` from an instance method of Outer. Inside, outer fields can be used directly; when a name is shadowed, \`Outer.this.field\` reaches the outer one.

**Memory-leak risk**: as long as an inner object is reachable, its outer object is reachable too. Registering an inner-class listener with a long-lived registry keeps the whole outer object (and everything it references) alive.

### Local classes
Declared inside a block. Visible only in that block. They can read the method's local variables and parameters, but only if those are **final or effectively final** (never reassigned). If declared in an instance method, they also have an enclosing instance.

### Anonymous classes
\`new Interface() { ... }\` or \`new SomeClass(args) { ... }\` declares and instantiates a one-off subclass in an expression. Same capture rules as local classes. They can have fields and several methods, but no constructors (use an instance initialiser).

### Lambdas versus anonymous classes
A lambda can implement only a **functional interface** (exactly one abstract method). Inside a lambda, \`this\` means the enclosing object; inside an anonymous class, \`this\` means the anonymous object. A lambda that does not use \`this\` or outer instance members does not capture the outer object at all. Lambdas are compiled with \`invokedynamic\` instead of producing a separate \`Outer$1.class\` file.

### Shadowing and effectively final
A nested declaration with the same name hides the outer one: the nearest declaration wins. Use \`this.x\` for the current class's field and \`Outer.this.x\` for the enclosing instance's. Captured locals must be effectively final because the nested object receives a **copy** of the value; allowing reassignment would let the copy and the original silently disagree.`,
    whyItExists: `Some classes only make sense next to another class: an iterator for a specific collection, a builder for a specific value class, a comparator used in one method. Nesting keeps them close to the code they serve, lets them use the outer class's private members, and keeps them out of the package's public surface. Inner classes were added in Java 1.1 mainly for event listeners and iterators; lambdas later took over most of the "one small behaviour" use cases.`,
    whenToUse: [
      'Use a static nested class by default for helper types that belong to the outer class (Builder, Node, Entry).',
      'Use an inner class only when each instance genuinely needs its outer object, such as an iterator over the outer collection.',
      'Use a local class for a small named helper used only inside one method.',
      'Use a lambda for a single-method interface; use an anonymous class when you need state, several methods or to extend a class.',
    ],
    whenNotToUse: [
      'Do not use an inner class when the nested class never touches the outer instance — make it static.',
      'Do not hand inner-class or anonymous-class objects to long-lived registries, caches or threads without thinking about what outer object they keep alive.',
      'Do not write an anonymous class where a lambda or method reference would do.',
      'Do not nest deeply; two levels of nesting are already hard to read.',
    ],
    examples: [
      {
        id: 'o9-four-kinds',
        title: 'All four kinds in one class',
        runnable: true,
        code: `import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

class Playlist {
    private final String name;
    private final List<Song> songs = new ArrayList<>();

    Playlist(String name) { this.name = name; }

    static class Song {
        final String title;
        final int seconds;
        Song(String title, int seconds) { this.title = title; this.seconds = seconds; }
    }

    class Cursor {
        private int index = 0;
        boolean hasNext() { return index < songs.size(); }
        String next() { return name + "#" + (index + 1) + " " + songs.get(index++).title; }
    }

    void add(String title, int seconds) { songs.add(new Song(title, seconds)); }

    Cursor cursor() { return new Cursor(); }

    int countLongerThan(int limit) {
        class LongFilter {
            boolean test(Song s) { return s.seconds > limit; }
        }
        LongFilter filter = new LongFilter();
        int count = 0;
        for (Song s : songs) if (filter.test(s)) count++;
        return count;
    }

    List<String> titlesByLength() {
        List<Song> copy = new ArrayList<>(songs);
        copy.sort(new Comparator<Song>() {
            @Override
            public int compare(Song a, Song b) { return Integer.compare(a.seconds, b.seconds); }
        });
        List<String> titles = new ArrayList<>();
        for (Song s : copy) titles.add(s.title);
        return titles;
    }
}

public class Main {
    public static void main(String[] args) {
        Playlist p = new Playlist("Focus");
        p.add("Intro", 95);
        p.add("Deep Work", 310);
        p.add("Flow", 240);

        Playlist.Song single = new Playlist.Song("Bonus", 180);
        Playlist.Cursor c = p.cursor();
        while (c.hasNext()) System.out.println(c.next());
        System.out.println("Longer than 200s: " + p.countLongerThan(200));
        System.out.println("By length: " + p.titlesByLength());
        System.out.println("Standalone song: " + single.title);
    }
}`,
        expectedOutput: `Focus#1 Intro
Focus#2 Deep Work
Focus#3 Flow
Longer than 200s: 2
By length: [Intro, Flow, Deep Work]
Standalone song: Bonus`,
        explanation: 'Song is static nested (created without any Playlist), Cursor is inner (reads the private `name` and `songs` of its Playlist), LongFilter is local (captures the parameter `limit`) and the Comparator is anonymous. The anonymous Comparator could be the lambda `(a, b) -> Integer.compare(a.seconds, b.seconds)`.',
      },
      {
        id: 'o9-outer-this',
        title: 'Shadowing, Outer.this, and this in lambdas versus anonymous classes',
        runnable: true,
        code: `public class Main {
    private final String name = "outer";

    class Inner {
        private final String name = "inner";

        void show(String name) {
            System.out.println(name);
            System.out.println(this.name);
            System.out.println(Main.this.name);
        }
    }

    @Override
    public String toString() { return "the Main object"; }

    void compareThis() {
        Runnable anon = new Runnable() {
            @Override
            public void run() { System.out.println("anonymous class: this = " + this); }

            @Override
            public String toString() { return "the anonymous Runnable"; }
        };
        Runnable lambda = () -> System.out.println("lambda: this = " + this);
        anon.run();
        lambda.run();
    }

    public static void main(String[] args) {
        Main outer = new Main();
        Main.Inner inner = outer.new Inner();
        inner.show("parameter");
        outer.compareThis();
    }
}`,
        expectedOutput: `parameter
inner
outer
anonymous class: this = the anonymous Runnable
lambda: this = the Main object`,
        explanation: 'Three variables called `name` are in scope inside show: the nearest (the parameter) wins, this.name is Inner\'s field and Main.this.name is the enclosing object\'s field. An anonymous class introduces a new `this`; a lambda does not.',
      },
      {
        id: 'o9-leak',
        title: 'The hidden outer reference (shown, not run)',
        code: `class ReportScreen {
    private final byte[] chartImage = new byte[50_000_000]; // large state

    // Inner class: every listener secretly holds ReportScreen.this
    class PriceListener implements Listener {
        public void onPrice(double p) { System.out.println(p); }
    }

    void open(EventBus bus) {
        bus.register(new PriceListener());          // bus lives forever ->
                                                    // screen + 50 MB never freed
    }
}

// Fix 1: static nested class with only what it needs
static class PriceListener implements Listener {
    public void onPrice(double p) { System.out.println(p); }
}

// Fix 2: unregister when the screen closes (try/finally or a close() hook)

// Captured locals must be effectively final:
int retries = 3;
Runnable r = () -> System.out.println(retries);
// retries++;   // would make the lambda above a compile error`,
        explanation: 'Heap analysers show this as a chain from a long-lived registry, through the listener\'s synthetic outer field, to the screen object. Static nested classes and non-capturing lambdas have no such field.',
      },
    ],
    walkthrough: {
      exampleId: 'o9-four-kinds',
      steps: [
        { lines: [11, 15], text: 'Song is a static nested class. It has no link to a Playlist, so it can be created anywhere with new Playlist.Song(...).' },
        { lines: [17, 21], text: 'Cursor is an inner class. It reads `songs` and `name`, which are private fields of the Playlist that created it, through its hidden outer reference.' },
        { lines: [25, 25], text: 'Inside an instance method, new Cursor() automatically uses this Playlist as the outer object.' },
        { lines: [27, 35], text: 'LongFilter is a local class: visible only in this method, and it captures the parameter `limit`, which is effectively final because it is never reassigned.' },
        { lines: [37, 46], text: 'An anonymous Comparator is declared and instantiated in one expression. Because Comparator has a single abstract method, a lambda would be shorter.' },
        { lines: [56, 57], text: 'From outside, a static nested class needs no outer object; an inner class instance comes from an existing Playlist.' },
      ],
    },
    realWorld: {
      title: 'The screen that never died',
      scenario: `A trading desktop app leaked about 200 MB per hour. A heap dump showed hundreds of closed \`ChartScreen\` objects still alive. Each screen registered an anonymous \`PriceListener\` with a singleton \`MarketDataBus\` and never unregistered it.

The anonymous class captured \`ChartScreen.this\` (it called a screen method), so the bus kept every closed screen, its chart images and its data cache reachable. The fix had two parts: unregister listeners in the screen's \`close()\` method, and turn listeners that did not need the screen into static nested classes. Memory stayed flat afterwards.`,
    },
    commonMistakes: [
      {
        mistake: 'Making a nested class inner (non-static) by default.',
        why: 'Every instance then carries an outer reference it does not need: extra memory, harder serialisation and possible leaks.',
        fix: 'Add static unless the nested class really uses the outer instance (Effective Java: "favor static member classes over nonstatic").',
      },
      {
        mistake: 'Trying to create an inner class instance from a static method with new Inner().',
        why: 'There is no enclosing instance in a static context, so the compiler rejects it.',
        fix: 'Write outer.new Inner(), or make the nested class static.',
      },
      {
        mistake: 'Modifying a captured local variable inside or after a lambda or anonymous class.',
        why: 'Captured locals must be effectively final; the nested code holds a copy of the value.',
        fix: 'Use a new final variable, a field, or an AtomicInteger / one-element array if shared mutable state is really needed.',
        code: `int count = 0;
list.forEach(x -> count++);   // compile error
AtomicInteger counter = new AtomicInteger();
list.forEach(x -> counter.incrementAndGet()); // OK`,
      },
      {
        mistake: 'Expecting this inside a lambda to mean the lambda.',
        why: 'A lambda has no identity of its own for this; it refers to the enclosing instance.',
        fix: 'Use an anonymous class if you need a self-reference, or keep state in the enclosing object.',
      },
    ],
    checks: [
      {
        id: 'o9-c1',
        kind: 'predict-output',
        dimension: 'debugging',
        prompt: 'What happens when you compile this?',
        code: `public class Main {
    public static void main(String[] args) {
        int count = 0;
        Runnable r = new Runnable() {
            public void run() { System.out.println(count); }
        };
        count++;
        r.run();
    }
}`,
        options: [
          { id: 'a', text: '0' },
          { id: 'b', text: '1' },
          { id: 'c', text: 'Compile error: local variables referenced from an inner class must be final or effectively final' },
          { id: 'd', text: 'Runtime IllegalStateException' },
        ],
        correctOptionId: 'c',
        expectCompileError: true,
        explanation: '`count++` reassigns count, so it is no longer effectively final, and the anonymous class may not capture it. The rule is the same for lambdas and local classes.',
      },
      {
        id: 'o9-c2',
        kind: 'mcq',
        dimension: 'coding',
        prompt: 'Inside `public static void main` of class `Outer`, how do you create an instance of the non-static member class `Outer.Inner`?',
        options: [
          { id: 'a', text: 'Outer.Inner i = new Outer.Inner();' },
          { id: 'b', text: 'Outer.Inner i = new Outer().new Inner();' },
          { id: 'c', text: 'Outer.Inner i = Outer.Inner.new();' },
          { id: 'd', text: 'Outer.Inner i = new Inner(this);' },
        ],
        correctOptionId: 'b',
        explanation: 'An inner instance needs an enclosing instance. In a static context there is none, so you create an Outer and qualify the new: outer.new Inner(). Option a works only for a static nested class.',
      },
      {
        id: 'o9-c3',
        kind: 'multi-select',
        dimension: 'conceptual',
        prompt: 'Which statements about a static nested class are true?',
        options: [
          { id: 'a', text: 'Its instances hold no hidden reference to an outer object.' },
          { id: 'b', text: 'It can access private static members of the outer class.' },
          { id: 'c', text: 'It can read the outer class\'s instance fields directly, without any outer object.' },
          { id: 'd', text: 'It can be instantiated without an instance of the outer class.' },
        ],
        correctOptionIds: ['a', 'b', 'd'],
        explanation: 'A static nested class is a top-level class in all but name and access: it shares private access with the outer class but has no enclosing instance, so instance fields need an explicit outer object.',
      },
      {
        id: 'o9-c4',
        kind: 'predict-output',
        dimension: 'runtime',
        prompt: 'What does this print?',
        code: `class Counter {
    int value = 1;

    class Step {
        int value = 10;

        int next(int value) {
            return value + this.value + Counter.this.value;
        }
    }
}

public class Main {
    public static void main(String[] args) {
        Counter c = new Counter();
        c.value = 5;
        Counter.Step s = c.new Step();
        System.out.println(s.next(100));
    }
}`,
        options: [
          { id: 'a', text: '115' },
          { id: 'b', text: '111' },
          { id: 'c', text: '300' },
          { id: 'd', text: '120' },
        ],
        correctOptionId: 'a',
        explanation: 'value is the parameter (100), this.value is Step\'s field (10) and Counter.this.value is the enclosing Counter\'s field, which was changed to 5 before the Step was created: 100 + 10 + 5 = 115.',
      },
      {
        id: 'o9-c5',
        kind: 'mcq',
        dimension: 'debugging',
        prompt: 'A heap dump shows closed `OrderScreen` objects kept alive by a singleton event bus. Each screen registers `new OrderListener()`, where `OrderListener` is a non-static member class of OrderScreen that never uses the screen. What is the best fix?',
        options: [
          { id: 'a', text: 'Call System.gc() when a screen closes.' },
          { id: 'b', text: 'Make OrderListener a static nested class (and unregister listeners when the screen closes).' },
          { id: 'c', text: 'Mark the OrderScreen fields final.' },
          { id: 'd', text: 'Make OrderListener public.' },
        ],
        correctOptionId: 'b',
        explanation: 'The inner class holds OrderScreen.this, so the bus keeps each screen reachable. A static nested class drops the hidden reference; unregistering also removes the listener itself. GC cannot free reachable objects, and final or public changes nothing.',
      },
    ],
    challengeIds: [],
    masteryCriteria: [
      'Name and recognise all four kinds of nested class and give a fitting use for each.',
      'Explain the enclosing-instance reference and diagnose a leak caused by it.',
      'Use Outer.this and this correctly when names are shadowed.',
      'Explain the effectively-final rule and how this differs between lambdas and anonymous classes.',
    ],
    relatedLessonIds: ['o-access-modifiers', 'o-interfaces', 'fn-lambdas'],
    revision: [
      { id: 'r1', question: 'What are the four kinds of nested class?', answer: 'Static nested classes, inner (non-static member) classes, local classes (declared in a block) and anonymous classes (declared and instantiated in one expression).' },
      { id: 'r2', question: 'Why can an inner class cause a memory leak?', answer: 'Each inner instance holds a hidden reference to its outer object. If the inner object is kept by something long-lived, such as a listener registry, the outer object and everything it references stay reachable too.' },
      { id: 'r3', question: 'Why must captured local variables be effectively final?', answer: 'The nested class or lambda receives a copy of the value. Forbidding reassignment means the copy and the original can never disagree.' },
      { id: 'r4', question: 'How does this differ in a lambda and an anonymous class?', answer: 'In an anonymous class, this is the anonymous object. In a lambda, this is the enclosing instance; lambdas do not introduce a new scope for this.' },
    ],
  },

  // -------------------------------------------------------------------------
  {
    id: 'o-enums',
    moduleId: 'oop',
    title: 'Enums: type-safe constants with behaviour',
    summary: 'Fixed sets of named objects with fields, methods and per-constant behaviour, safe switches, and the fast EnumSet and EnumMap collections.',
    estimatedMinutes: 35,
    difficulty: 'beginner',
    prerequisites: ['o-classes-objects'],
    versionNotes: [
      { feature: 'Enums, EnumSet and EnumMap', since: 5 },
      { feature: 'Switch expressions with arrow labels (exhaustive over enums)', since: 14, note: 'preview in 12-13, final in 14 (JEP 361)' },
      { feature: 'Qualified enum constants as case labels (case Color.RED)', since: 21, note: 'JEP 441' },
    ],
    objectives: [
      'Declare an enum and use values(), valueOf(), name() and ordinal().',
      'Explain why ordinals should not be persisted.',
      'Give enum constants fields, a constructor and methods, including constant-specific bodies.',
      'Make an enum implement an interface.',
      'Switch over an enum with a switch expression and rely on exhaustiveness.',
      'Use EnumSet and EnumMap, and know the enum singleton pattern.',
    ],
    plainEnglish: `Some values come from a small, fixed list: the days of the week, the sizes on a coffee menu, the states of an order. Before enums, people used numbers (\`int SMALL = 0\`) or strings — and nothing stopped you passing \`7\` or \`"medum"\` by mistake.

An **enum** declares the complete list once:

\`enum Size { SMALL, MEDIUM, LARGE }\`

Now a variable of type \`Size\` can only ever hold one of those three values (or \`null\`). The compiler catches typos, your IDE autocompletes the choices, and a \`switch\` can check that you handled every case.

Enum constants are real **objects**, so they can carry data (\`LARGE\` costs 350 cents) and behaviour (\`PLUS.apply(2, 3)\`).`,
    technical: `### What an enum compiles to
\`enum Size { SMALL, MEDIUM, LARGE }\` is a class that implicitly extends \`java.lang.Enum<Size>\` and is implicitly \`final\` (unless a constant has a body). Each constant is a \`public static final\` field holding the **only** instance with that name. Constructors are implicitly private: no code can call \`new Size()\`, reflection refuses to, and deserialisation returns the existing constant. Because every constant is a singleton, comparing with \`==\` is safe and null-safe.

### Built-in methods
- \`values()\` — a new array of all constants, in declaration order.
- \`valueOf(String)\` — the constant with exactly that name (case-sensitive); throws \`IllegalArgumentException\` otherwise.
- \`name()\` — the declared name; \`toString()\` returns it too unless overridden.
- \`ordinal()\` — the zero-based position in the declaration. \`compareTo\` orders by ordinal.

### Do not persist ordinals
Ordinals change whenever someone inserts or reorders a constant. Storing \`ordinal()\` in a database or file silently remaps old data. Persist \`name()\` (JPA: \`@Enumerated(EnumType.STRING)\`) or an explicit code field.

### Fields, constructors and methods
Constants may pass arguments to a constructor: \`LARGE("L", 350)\`. Fields should be \`final\` — constants are shared globally, so mutable enum state is shared global state. When an enum has members, the constant list must end with a semicolon.

### Constant-specific methods
A constant may have a body that overrides a method, often an \`abstract\` one declared by the enum: every constant must then supply it, so a new constant cannot forget it.

### Enums implementing interfaces
Enums cannot extend a class (they already extend \`Enum\`) but can implement interfaces, which lets an enum be one implementation among others or lets callers depend on the interface.

### switch
- Classic: \`case MEDIUM:\` uses the bare constant name.
- **Switch expressions** (Java 14): \`return switch (size) { case SMALL -> ...; case MEDIUM -> ...; case LARGE -> ...; };\` must be **exhaustive**. Covering every constant is enough — no \`default\` needed — so adding a constant turns every incomplete switch expression into a compile error.

### EnumSet and EnumMap
\`EnumSet\` stores membership as bits (one \`long\` for up to 64 constants); \`EnumMap\` is an array indexed by ordinal. Both iterate in declaration order and are faster and smaller than \`HashSet\`/\`HashMap\`. Use \`EnumSet.of\`, \`range\`, \`allOf\`, \`noneOf\` and \`complementOf\`.

### Enum singleton
\`enum Registry { INSTANCE; ... }\` gives exactly one instance with thread-safe lazy initialisation by the class loader and built-in protection against reflection and serialisation creating a second copy.`,
    whyItExists: `Integer and string constants are not types: the compiler cannot tell a size from a status code, and nothing prevents invalid values. Enums (Java 5) make the set of legal values part of the type system, give each value a readable name in logs and debuggers, and let behaviour live with the value instead of in scattered if/else chains.`,
    whenToUse: [
      'Use an enum whenever a value comes from a fixed set known at compile time (statuses, sizes, directions, roles, units).',
      'Put data and behaviour that vary by constant into fields and methods on the enum.',
      'Use switch expressions over enums so the compiler checks you handled every constant.',
      'Use EnumSet for sets of flags and EnumMap for per-constant counters or configuration.',
    ],
    whenNotToUse: [
      'Do not use an enum for values that change without a redeploy (product categories managed by staff, currencies loaded from config) — use data.',
      'Do not persist or transmit ordinal(); use name() or an explicit code.',
      'Do not keep mutable state in enum constants; it is global shared state.',
      'Do not use an enum when variants need different fields per case — a sealed interface with records fits better.',
    ],
    examples: [
      {
        id: 'o10-coffee',
        title: 'Fields, valueOf, switch expressions, EnumSet and EnumMap',
        runnable: true,
        code: `import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

interface Priced {
    int priceCents();
}

enum Size implements Priced {
    SMALL("S", 250),
    MEDIUM("M", 300),
    LARGE("L", 350);

    private final String code;
    private final int priceCents;

    Size(String code, int priceCents) {
        this.code = code;
        this.priceCents = priceCents;
    }

    String code() { return code; }

    @Override
    public int priceCents() { return priceCents; }

    static Size fromCode(String code) {
        for (Size s : values()) {
            if (s.code.equals(code)) return s;
        }
        throw new IllegalArgumentException("unknown size code: " + code);
    }
}

enum Status { PLACED, BREWING, READY, COLLECTED }

public class Main {
    static String message(Status s) {
        return switch (s) {
            case PLACED -> "We got your order";
            case BREWING -> "Making it now";
            case READY -> "Ready at the counter";
            case COLLECTED -> "Enjoy!";
        };
    }

    public static void main(String[] args) {
        Size size = Size.fromCode("M");
        System.out.println(size + " ordinal=" + size.ordinal() + " price=" + size.priceCents());
        System.out.println(Size.valueOf("LARGE").code() + " " + (size == Size.MEDIUM));

        for (Status s : Status.values()) {
            System.out.println(s + ": " + message(s));
        }

        Set<Status> open = EnumSet.range(Status.PLACED, Status.READY);
        Map<Size, Integer> sold = new EnumMap<>(Size.class);
        sold.merge(Size.LARGE, 1, Integer::sum);
        sold.merge(Size.SMALL, 2, Integer::sum);
        sold.merge(Size.LARGE, 1, Integer::sum);
        System.out.println("Open: " + open + ", sold: " + sold);

        try {
            Size.valueOf("medium");
        } catch (IllegalArgumentException e) {
            System.out.println("valueOf is case-sensitive");
        }
    }
}`,
        expectedOutput: `MEDIUM ordinal=1 price=300
L true
PLACED: We got your order
BREWING: Making it now
READY: Ready at the counter
COLLECTED: Enjoy!
Open: [PLACED, BREWING, READY], sold: {SMALL=2, LARGE=2}
valueOf is case-sensitive`,
        explanation: 'Each Size constant carries its own code and price. The switch expression has no default because it covers every Status. EnumMap prints in declaration order (SMALL before LARGE) even though LARGE was added first.',
      },
      {
        id: 'o10-behaviour',
        title: 'Constant-specific methods and the enum singleton',
        runnable: true,
        code: `enum Operation {
    PLUS("+") {
        @Override
        int apply(int a, int b) { return a + b; }
    },
    MINUS("-") {
        @Override
        int apply(int a, int b) { return a - b; }
    },
    TIMES("*") {
        @Override
        int apply(int a, int b) { return a * b; }
    };

    private final String symbol;

    Operation(String symbol) { this.symbol = symbol; }

    abstract int apply(int a, int b);

    String symbol() { return symbol; }
}

enum Clock {
    INSTANCE;

    private int ticks;

    int tick() { return ++ticks; }
}

public class Main {
    public static void main(String[] args) {
        for (Operation op : Operation.values()) {
            System.out.println("6 " + op.symbol() + " 3 = " + op.apply(6, 3));
        }
        System.out.println(Operation.PLUS.getClass() == Operation.class);
        System.out.println(Operation.PLUS.getDeclaringClass() == Operation.class);
        System.out.println(Clock.INSTANCE.tick() + " " + Clock.INSTANCE.tick());
    }
}`,
        expectedOutput: `6 + 3 = 9
6 - 3 = 3
6 * 3 = 18
false
true
1 2`,
        explanation: 'Because Operation declares an abstract apply, every constant must implement it. A constant with a body is compiled to its own anonymous subclass, so getClass() differs; getDeclaringClass() always returns the enum type. Clock shows the singleton shape (its counter is not thread-safe; real code would use an AtomicInteger).',
      },
      {
        id: 'o10-persist',
        title: 'Persisting enums safely (shown, not run)',
        code: `// Version 1 stored ordinals: PENDING=0, PAID=1, SHIPPED=2
enum OrderStatus { PENDING, PAID, SHIPPED }

// Version 2 inserts a constant in the middle...
enum OrderStatus { PENDING, PAYMENT_FAILED, PAID, SHIPPED }
// ...and every old row with 1 (PAID) now reads as PAYMENT_FAILED.

// Safe: store the name...
@Enumerated(EnumType.STRING)          // JPA: column holds "PAID"
private OrderStatus status;

// ...or an explicit, stable code
enum Currency {
    EURO("EUR"), US_DOLLAR("USD");
    private final String isoCode;
    Currency(String isoCode) { this.isoCode = isoCode; }
    String isoCode() { return isoCode; }
}`,
        explanation: 'JPA defaults to EnumType.ORDINAL, which is exactly the trap. Storing names survives reordering and inserting; an explicit code also survives renaming the constant.',
      },
    ],
    walkthrough: {
      exampleId: 'o10-coffee',
      steps: [
        { lines: [10, 13], text: 'Each constant passes arguments to the enum constructor. The list ends with a semicolon because members follow.' },
        { lines: [15, 21], text: 'Final fields and an implicitly private constructor: no code outside can create a fourth Size.' },
        { lines: [25, 26], text: 'The enum implements the Priced interface like any class would.' },
        { lines: [28, 33], text: 'A lookup by a stable external code. values() returns the constants in declaration order.' },
        { lines: [39, 46], text: 'A switch expression over the enum. It covers every constant, so no default is needed, and adding a constant would make this a compile error until it is handled.' },
        { lines: [50, 51], text: 'toString() and name() print the constant name; ordinal() is its position; == is the right way to compare constants.' },
        { lines: [57, 62], text: 'EnumSet.range uses declaration order. EnumMap keeps keys in declaration order, not insertion order.' },
        { lines: [64, 68], text: 'valueOf matches the exact name and throws IllegalArgumentException for anything else, including a different case.' },
      ],
    },
    realWorld: {
      title: 'The refund that became a shipment',
      scenario: `An e-commerce team stored \`OrderStatus\` with JPA's default \`EnumType.ORDINAL\`. A developer added \`PAYMENT_FAILED\` alphabetically between \`PENDING\` and \`PAID\`. After the deploy, every existing paid order (stored as \`1\`) loaded as \`PAYMENT_FAILED\`, and a nightly job emailed thousands of customers asking them to retry payment.

The fix was a migration that rewrote the column as strings, plus \`@Enumerated(EnumType.STRING)\` on every enum field and a code-review rule. A unit test now asserts the exact list of constant names, so renaming a persisted constant fails the build.`,
    },
    commonMistakes: [
      {
        mistake: 'Persisting or sending ordinal() values.',
        why: 'Ordinals shift when constants are inserted or reordered, silently corrupting stored data.',
        fix: 'Persist name() or an explicit stable code field.',
      },
      {
        mistake: 'Using valueOf on user input without handling failure.',
        why: 'valueOf is case-sensitive and throws IllegalArgumentException for unknown names.',
        fix: 'Normalise input (e.g. toUpperCase(Locale.ROOT)) and catch the exception, or write a lookup that returns Optional.',
      },
      {
        mistake: 'Adding a default branch to every enum switch expression.',
        why: 'A default hides newly added constants: the compiler can no longer tell you which switches need updating.',
        fix: 'List every constant and omit default so exhaustiveness checking works for you.',
      },
      {
        mistake: 'Giving enum constants mutable fields.',
        why: 'Each constant is a global singleton, so mutable state is shared by the whole application and every thread.',
        fix: 'Keep enum fields final; store changing data elsewhere (an EnumMap in the owning object).',
      },
    ],
    checks: [
      {
        id: 'o10-c1',
        kind: 'predict-output',
        dimension: 'runtime',
        prompt: 'What does this print?',
        code: `enum Level { LOW, MEDIUM, HIGH }

public class Main {
    public static void main(String[] args) {
        Level l = Level.valueOf("MEDIUM");
        System.out.println(l.ordinal() + " " + l.compareTo(Level.HIGH) + " " + (l == Level.MEDIUM));
    }
}`,
        options: [
          { id: 'a', text: '1 -1 true' },
          { id: 'b', text: '2 -1 true' },
          { id: 'c', text: '1 -1 false' },
          { id: 'd', text: '1 1 true' },
        ],
        correctOptionId: 'a',
        explanation: 'Ordinals start at 0, so MEDIUM is 1. compareTo returns the ordinal difference (1 - 2 = -1). valueOf returns the single MEDIUM instance, so == is true.',
      },
      {
        id: 'o10-c2',
        kind: 'predict-output',
        dimension: 'runtime',
        prompt: 'What does this print?',
        code: `enum Color {
    RED, GREEN;

    Color() {
        System.out.println("init " + name());
    }
}

public class Main {
    public static void main(String[] args) {
        System.out.println("start");
        Color c = Color.GREEN;
        System.out.println(c);
        System.out.println(Color.RED);
    }
}`,
        options: [
          { id: 'a', text: 'start\ninit RED\ninit GREEN\nGREEN\nRED' },
          { id: 'b', text: 'init RED\ninit GREEN\nstart\nGREEN\nRED' },
          { id: 'c', text: 'start\ninit GREEN\nGREEN\ninit RED\nRED' },
          { id: 'd', text: 'start\nGREEN\nRED' },
        ],
        correctOptionId: 'a',
        explanation: 'The enum class is initialised on first use (Color.GREEN), and initialisation creates every constant in declaration order, once. Later uses reuse the same objects, so no more "init" lines appear.',
      },
      {
        id: 'o10-c3',
        kind: 'mcq',
        dimension: 'conceptual',
        prompt: 'Why should you avoid storing `ordinal()` in a database column?',
        options: [
          { id: 'a', text: 'Ordinals are random and change on every JVM start.' },
          { id: 'b', text: 'Inserting or reordering constants changes ordinals, so stored numbers silently map to different constants.' },
          { id: 'c', text: 'ordinal() is slow because it scans values().' },
          { id: 'd', text: 'Databases cannot store small integers.' },
        ],
        correctOptionId: 'b',
        explanation: 'Ordinals are stable within one version of the code but depend on declaration order. Store name() or an explicit code instead.',
      },
      {
        id: 'o10-c4',
        kind: 'multi-select',
        dimension: 'conceptual',
        prompt: 'Which statements about Java enums are true?',
        options: [
          { id: 'a', text: 'An enum can implement interfaces.' },
          { id: 'b', text: 'An enum can extend another class.' },
          { id: 'c', text: 'An enum constructor cannot be public.' },
          { id: 'd', text: 'Comparing enum constants with == is safe.' },
          { id: 'e', text: 'Other code can create new constants at runtime with new.' },
        ],
        correctOptionIds: ['a', 'c', 'd'],
        explanation: 'Enums already extend java.lang.Enum, so they cannot extend another class, but they can implement interfaces. Their constructors are implicitly private (public or protected is a compile error), and since each constant is a singleton, == is correct and null-safe.',
      },
      {
        id: 'o10-c5',
        kind: 'predict-output',
        dimension: 'debugging',
        prompt: 'What happens when you compile this?',
        code: `enum Light { RED, AMBER, GREEN }

public class Main {
    public static void main(String[] args) {
        Light l = Light.AMBER;
        String action = switch (l) {
            case RED -> "stop";
            case GREEN -> "go";
        };
        System.out.println(action);
    }
}`,
        options: [
          { id: 'a', text: 'It prints null' },
          { id: 'b', text: 'Compile error: the switch expression does not cover all possible input values' },
          { id: 'c', text: 'It prints an empty line' },
          { id: 'd', text: 'Runtime MatchException' },
        ],
        correctOptionId: 'b',
        expectCompileError: true,
        explanation: 'A switch expression must be exhaustive. AMBER is not handled and there is no default, so javac rejects the program. Adding `case AMBER -> "slow";` fixes it.',
      },
    ],
    challengeIds: [],
    masteryCriteria: [
      'Replace int or String constants with an enum and explain the type-safety gain.',
      'Add fields, constructors and constant-specific behaviour to an enum.',
      'Write an exhaustive switch expression over an enum without a default.',
      'Choose EnumSet/EnumMap over HashSet/HashMap for enum keys and explain why.',
      'Explain why ordinals must not be persisted and what to store instead.',
    ],
    relatedLessonIds: ['o-interfaces', 't-modern-types', 'c-collections-overview'],
    revision: [
      { id: 'r1', question: 'What do values(), valueOf(), name() and ordinal() do?', answer: 'values() returns all constants in declaration order; valueOf(name) returns the constant with that exact name or throws IllegalArgumentException; name() returns the declared name; ordinal() returns the zero-based declaration position.' },
      { id: 'r2', question: 'Why can you compare enums with ==?', answer: 'Each constant is the only instance of its value: constructors are private, reflection refuses to create enums and deserialisation returns the existing constant.' },
      { id: 'r3', question: 'What is a constant-specific method?', answer: 'A body attached to one constant that overrides a method declared by the enum, often abstract, so each constant supplies its own behaviour.' },
      { id: 'r4', question: 'Why prefer EnumMap over HashMap for enum keys?', answer: 'EnumMap is an array indexed by ordinal: no hashing, compact, fast and iterates in declaration order.' },
      { id: 'r5', question: 'Why is an enum a good singleton?', answer: 'The JVM guarantees one instance per constant, created lazily and thread-safely during class initialisation, and protects against reflection and serialisation creating copies.' },
    ],
  },
];
