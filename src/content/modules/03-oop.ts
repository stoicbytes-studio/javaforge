import type { CurriculumModule } from '@/types/curriculum';

export const oopModule: CurriculumModule = {
  id: 'oop',
  order: 3,
  title: 'Object-Oriented Programming and SOLID',
  shortTitle: 'OOP & SOLID',
  summary: 'Classes and encapsulation, inheritance and polymorphism, interfaces and sealed types, object contracts and the SOLID principles.',
  level: 'core',
  prerequisites: ['fundamentals'],
  bossChallengeId: 'boss-library-loans',
  lessons: [
    // -----------------------------------------------------------------------
    {
      id: 'o-classes-objects',
      moduleId: 'oop',
      title: 'Classes, objects, constructors and encapsulation',
      summary: 'Model data and behaviour together, protect invariants, and know static from instance.',
      estimatedMinutes: 35,
      difficulty: 'beginner',
      prerequisites: ['f-methods'],
      objectives: [
        'Write a class with private state, constructors and methods that protect its invariants.',
        'Explain the difference between static and instance members.',
        'Use constructor chaining with this(...).',
        'Know which variables get default values and which must be initialised.',
      ],
      plainEnglish: `A **class** is a blueprint; an **object** is a thing built from it. A \`BankAccount\` class describes what every account has (an owner, a balance) and can do (deposit, withdraw). Each \`new BankAccount(...)\` creates a separate object with its own balance.

**Encapsulation** means hiding the data (\`private\` fields) and only allowing changes through methods that enforce the rules — for example, "a balance can never go negative".

**Static** members belong to the class itself and are shared by all objects; **instance** members belong to each object.`,
      technical: `### Objects and references
\`new\` allocates an object on the heap, runs field initialisers and the constructor, and returns a reference. Variables of class type hold references, never objects.

### Constructors
A constructor has the class name and no return type. If you declare none, the compiler adds a public no-argument constructor; declaring any constructor removes that default. \`this(...)\` delegates to another constructor and must be the first statement (Java 22–24 previewed relaxing this, and Java 25 made it standard via JEP 513; on Java 21 the rule still applies).

### Initialisation rules
- **Fields** get default values (0, false, null) before the constructor runs.
- **Local variables** have no default; reading one before assignment is a compile error ("might not have been initialized").
- \`final\` fields must be assigned exactly once, by the end of every constructor.

### Static vs instance
Static fields exist once per class (per class loader) and are initialised when the class is initialised. Static methods have no \`this\`, so they cannot access instance fields directly. Static mutable state is shared global state — convenient, but hard to test and not thread-safe by default.

### Encapsulation and invariants
Make fields \`private\`, validate in constructors and mutators, and expose behaviour ("withdraw") rather than raw setters ("setBalance"). Return defensive copies of mutable internal objects. Prefer immutability where possible: \`final\` fields, no setters.`,
      whyItExists: `Bundling state with the operations that maintain it lets a class guarantee its own consistency. Callers cannot put the object into an invalid state, so bugs are found at the boundary instead of deep in unrelated code.`,
      whenToUse: [
        'Use a class when data and the rules that govern it belong together.',
        'Use private fields with intention-revealing methods to protect invariants.',
        'Use static for stateless utilities and true per-class constants (`static final`).',
      ],
      whenNotToUse: [
        'Do not add getters and setters for every field by reflex; expose behaviour instead.',
        'Do not use mutable static fields as a convenient global store.',
        'Do not use a class with only data and no rules when a record expresses it better (see records).',
      ],
      examples: [
        {
          id: 'bank-account',
          title: 'An encapsulated BankAccount',
          runnable: true,
          code: `class BankAccount {
    private static int accountsOpened = 0;

    private final String owner;
    private long balanceCents;

    BankAccount(String owner) {
        this(owner, 0);
    }

    BankAccount(String owner, long openingCents) {
        if (owner == null || owner.isBlank()) throw new IllegalArgumentException("owner is required");
        if (openingCents < 0) throw new IllegalArgumentException("opening balance cannot be negative");
        this.owner = owner;
        this.balanceCents = openingCents;
        accountsOpened++;
    }

    void deposit(long cents) {
        if (cents <= 0) throw new IllegalArgumentException("deposit must be positive");
        balanceCents += cents;
    }

    boolean withdraw(long cents) {
        if (cents <= 0 || cents > balanceCents) return false;
        balanceCents -= cents;
        return true;
    }

    long balance() { return balanceCents; }

    static int accountsOpened() { return accountsOpened; }

    @Override
    public String toString() {
        return owner + ": " + balanceCents + " cents";
    }
}

public class Main {
    public static void main(String[] args) {
        BankAccount a = new BankAccount("Ada");
        BankAccount b = new BankAccount("Linus", 5_000);
        a.deposit(2_500);
        System.out.println(a.withdraw(1_000) + " " + a);
        System.out.println(b.withdraw(9_000) + " " + b);
        System.out.println("Accounts opened: " + BankAccount.accountsOpened());
    }
}`,
          expectedOutput: `true Ada: 1500 cents
false Linus: 5000 cents
Accounts opened: 2`,
        },
      ],
      walkthrough: {
        exampleId: 'bank-account',
        steps: [
          { lines: [2, 2], text: 'A static field: one counter shared by every BankAccount.' },
          { lines: [4, 5], text: 'Instance fields are private. `owner` is final, so it can never change after construction.' },
          { lines: [7, 9], text: 'Constructor chaining: the one-argument constructor delegates to the two-argument one with this(...).' },
          { lines: [11, 17], text: 'The constructor validates its inputs before assigning, so an invalid account can never exist.' },
          { lines: [24, 28], text: 'withdraw enforces the invariant "balance never goes negative" and reports failure instead of corrupting state.' },
          { lines: [44, 49], text: 'Each object has its own balance; the static counter is shared and reads 2.' },
        ],
      },
      realWorld: {
        title: 'The setter that allowed negative stock',
        scenario: `An inventory service exposed \`setQuantity(int)\` on its \`Product\` entity. Three different code paths decremented stock by calling \`setQuantity(getQuantity() - n)\`, and none checked for underflow. Overselling produced negative stock and refunds.

Replacing the setter with \`reserve(int n)\` that validates availability — and making it the only way to reduce stock — moved the rule into one place. The bug class disappeared, and the method name now documents the business operation.`,
      },
      commonMistakes: [
        {
          mistake: 'Making fields public "for convenience".',
          why: 'Any code can then break the object\'s invariants, and you can never change the representation.',
          fix: 'Keep fields private and expose operations.',
        },
        {
          mistake: 'Declaring a constructor and expecting the no-arg constructor to still exist.',
          why: 'The default constructor is only generated when no constructor is declared.',
          fix: 'Declare the no-arg constructor explicitly if frameworks need it.',
        },
        {
          mistake: 'Accessing an instance field from a static method.',
          why: 'Static methods have no `this`; the compiler reports "non-static variable cannot be referenced from a static context".',
          fix: 'Create an object, pass one in, or make the method an instance method.',
        },
      ],
      checks: [
        {
          id: 'o1-c1',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this print?',
          code: `class Ticket {
    static int issued = 0;
    final int number;

    Ticket() {
        issued++;
        number = issued;
    }
}

public class Main {
    public static void main(String[] args) {
        Ticket a = new Ticket();
        Ticket b = new Ticket();
        Ticket c = new Ticket();
        System.out.println(a.number + " " + c.number + " " + Ticket.issued + " " + b.issued);
    }
}`,
          options: [
            { id: 'a', text: '1 3 3 3' },
            { id: 'b', text: '1 3 3 2' },
            { id: 'c', text: '3 3 3 3' },
            { id: 'd', text: '1 1 3 1' },
          ],
          correctOptionId: 'a',
          explanation:
            '`issued` is shared, `number` is per object. `b.issued` compiles (with a warning in IDEs) but still reads the single static field, which is 3.',
        },
        {
          id: 'o1-c2',
          kind: 'predict-output',
          dimension: 'conceptual',
          prompt: 'What happens when you compile this?',
          code: `public class Main {
    static int total;

    public static void main(String[] args) {
        int count;
        System.out.println(total);
        System.out.println(count);
    }
}`,
          options: [
            { id: 'a', text: '0\n0' },
            { id: 'b', text: 'Compile error: variable count might not have been initialized' },
            { id: 'c', text: '0\nnull' },
            { id: 'd', text: 'Runtime NullPointerException' },
          ],
          correctOptionId: 'b',
          expectCompileError: true,
          explanation: 'Fields (like `total`) get default values; local variables do not and must be definitely assigned before use.',
        },
        {
          id: 'o1-c3',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'Which design best protects the invariant "an order total can never be negative"?',
          options: [
            { id: 'a', text: 'A public `total` field with a comment' },
            { id: 'b', text: 'A private field changed only by methods like addLine/applyDiscount that validate' },
            { id: 'c', text: 'A public setter `setTotal(double)`' },
            { id: 'd', text: 'A static total shared by all orders' },
          ],
          correctOptionId: 'b',
          explanation: 'Encapsulation puts the rule in one place: the only ways to change the state enforce it.',
        },
        {
          id: 'o1-c4',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this print?',
          code: `class Point {
    int x, y;
    Point(int x, int y) { this.x = x; this.y = y; }
}

public class Main {
    public static void main(String[] args) {
        Point a = new Point(1, 2);
        Point b = new Point(1, 2);
        Point c = a;
        c.x = 10;
        System.out.println((a == b) + " " + a.equals(b) + " " + (a == c) + " " + a.x);
    }
}`,
          options: [
            { id: 'a', text: 'true true true 10' },
            { id: 'b', text: 'false false true 10' },
            { id: 'c', text: 'false true true 1' },
            { id: 'd', text: 'false false false 1' },
          ],
          correctOptionId: 'b',
          explanation: 'a and b are different objects; Point does not override equals, so equals is identity too. c is an alias of a, so changing c.x changes a.x.',
        },
      ],
      challengeIds: ['ch-bank-commands'],
      masteryCriteria: [
        'Design a class that cannot be put into an invalid state.',
        'Explain static vs instance members and their lifetimes.',
        'Predict default values and definite-assignment errors.',
      ],
      relatedLessonIds: ['o-inheritance', 'o-object-contracts'],
      revision: [
        { id: 'r1', question: 'What is encapsulation and why does it matter?', answer: 'Hiding state behind methods that enforce the class\'s rules. It keeps objects valid, localises rules and lets the representation change without affecting callers.' },
        { id: 'r2', question: 'When does Java generate a default constructor?', answer: 'Only when the class declares no constructors at all.' },
        { id: 'r3', question: 'Do local variables get default values?', answer: 'No. Fields and array elements do; locals must be definitely assigned before they are read.' },
      ],
    },

    // -----------------------------------------------------------------------
    {
      id: 'o-inheritance',
      moduleId: 'oop',
      title: 'Inheritance, overriding and polymorphism',
      summary: 'How dynamic dispatch works, what is and is not polymorphic, and the initialisation order of class hierarchies.',
      estimatedMinutes: 40,
      difficulty: 'intermediate',
      prerequisites: ['o-classes-objects'],
      objectives: [
        'Override methods correctly and explain dynamic dispatch.',
        'Know that fields and static methods are not polymorphic.',
        'Predict initialisation order across a class hierarchy.',
        'Avoid calling overridable methods from constructors.',
      ],
      plainEnglish: `**Inheritance** lets a class (\`Dog\`) extend another (\`Animal\`) and reuse or change its behaviour. A \`Dog\` *is an* \`Animal\`, so anywhere an \`Animal\` is expected you can pass a \`Dog\`.

**Polymorphism** means "many forms": when you call \`animal.speak()\`, Java runs the version that belongs to the **actual object**, not the version of the variable's declared type. That decision happens while the program runs.`,
      technical: `### Overriding rules
An overriding method has the same name and parameter types. Its return type may be a subtype (covariant return). It cannot reduce visibility (public → protected is a compile error) or throw broader checked exceptions. \`@Override\` makes the compiler verify that you really override something — always use it.

### Dynamic dispatch
Instance method calls compile to \`invokevirtual\`/\`invokeinterface\`. At runtime the JVM looks up the method in the object's actual class (using a virtual method table), so the most specific override runs. \`super.method()\` explicitly calls the parent version (\`invokespecial\`).

### What is NOT polymorphic
- **Fields**: \`animal.name\` uses the declared type of the variable. A subclass field with the same name *hides* the parent's.
- **Static methods**: resolved at compile time from the declared type; a subclass static method with the same signature *hides* it.
- **Private methods**: not inherited, so not overridden.

### Initialisation order
1. When a class is first used, its superclass is initialised first: static initialisers run parent → child, once.
2. For each \`new\`: the constructor calls \`super(...)\` first (implicitly if omitted). Parent field initialisers and instance blocks run, then the parent constructor body, then the child's field initialisers and instance blocks, then the child constructor body.

### The constructor trap
If a parent constructor calls an overridable method, the child override runs **before the child's fields are initialised**, observing nulls and zeros. Make such methods \`private\` or \`final\`, or avoid calling them from constructors.`,
      whyItExists: `Polymorphism lets you write code against a general type and plug in new behaviour without changing that code — the foundation of frameworks, plugin systems and the Open/Closed principle.`,
      whenToUse: [
        'Use inheritance for a genuine "is-a" relationship where the subclass honours the parent\'s contract.',
        'Use polymorphism to replace type-checking if/else chains.',
        'Use `@Override` on every override.',
      ],
      whenNotToUse: [
        'Do not inherit just to reuse code — prefer composition (has-a).',
        'Do not build deep hierarchies; two levels are usually plenty.',
        'Do not extend classes not designed for extension; mark your own classes final unless designed for it.',
      ],
      examples: [
        {
          id: 'dispatch',
          title: 'What is and is not polymorphic',
          runnable: true,
          code: `class Animal {
    String name = "animal";
    static String kingdom() { return "Animalia"; }
    String speak() { return "..."; }
}

class Dog extends Animal {
    String name = "dog";                     // hides Animal.name
    static String kingdom() { return "Dogs"; } // hides Animal.kingdom()
    @Override
    String speak() { return "Woof"; }        // overrides
}

public class Main {
    public static void main(String[] args) {
        Animal a = new Dog();
        System.out.println(a.speak());
        System.out.println(a.name);
        System.out.println(((Dog) a).name);
        System.out.println(Animal.kingdom() + " " + Dog.kingdom());
    }
}`,
          expectedOutput: `Woof
animal
dog
Animalia Dogs`,
        },
        {
          id: 'init-order',
          title: 'Initialisation order in a hierarchy',
          runnable: true,
          code: `class Parent {
    static { System.out.println("1 Parent static"); }
    { System.out.println("3 Parent instance block"); }
    Parent() { System.out.println("4 Parent constructor"); }
}

class Child extends Parent {
    static { System.out.println("2 Child static"); }
    { System.out.println("5 Child instance block"); }
    Child() { System.out.println("6 Child constructor"); }
}

public class Main {
    public static void main(String[] args) {
        new Child();
        System.out.println("-- again --");
        new Child();
    }
}`,
          expectedOutput: `1 Parent static
2 Child static
3 Parent instance block
4 Parent constructor
5 Child instance block
6 Child constructor
-- again --
3 Parent instance block
4 Parent constructor
5 Child instance block
6 Child constructor`,
        },
        {
          id: 'ctor-trap',
          title: 'Calling an overridable method from a constructor',
          runnable: true,
          code: `class Base {
    Base() {
        describe();
    }
    void describe() { System.out.println("Base"); }
}

class Derived extends Base {
    private String name = "configured";

    @Override
    void describe() { System.out.println("name = " + name); }
}

public class Main {
    public static void main(String[] args) {
        Derived d = new Derived();
        d.describe();
    }
}`,
          expectedOutput: `name = null
name = configured`,
          explanation: 'During Base(), the Derived override runs but Derived\'s field initialisers have not run yet.',
        },
      ],
      walkthrough: {
        exampleId: 'ctor-trap',
        steps: [
          { lines: [17, 17], text: '`new Derived()` allocates the object; all fields start at their defaults, so `name` is null.' },
          { lines: [2, 4], text: 'Derived\'s implicit constructor calls super() first, entering Base(), which calls describe().' },
          { lines: [11, 12], text: 'Dynamic dispatch picks Derived.describe because the object is a Derived — even though its own initialisers have not run. It prints "name = null".' },
          { lines: [9, 9], text: 'Only after Base() returns does Derived run its field initialiser, setting name to "configured".' },
          { lines: [18, 18], text: 'Calling describe() later prints the initialised value.' },
        ],
      },
      realWorld: {
        title: 'A NullPointerException that only occurred in a subclass',
        scenario: `A UI framework's base \`Widget\` constructor called an overridable \`render()\` method. A team's \`ChartWidget\` override used its \`dataSource\` field — which was still null during the super constructor — and crashed only for that widget type.

The fix was to move rendering out of the constructor into an explicit \`init()\` lifecycle step called after construction, and to make constructors only assign fields. Many style guides (and static analysis rules) flag overridable calls in constructors for exactly this reason.`,
      },
      commonMistakes: [
        {
          mistake: 'Expecting fields to behave polymorphically.',
          why: 'Field access is resolved from the declared type at compile time.',
          fix: 'Keep fields private and access them through overridable methods if variation is needed.',
        },
        {
          mistake: 'Accidentally overloading instead of overriding (e.g. `equals(Point)` instead of `equals(Object)`).',
          why: 'A different parameter type creates a new overload, which callers using the base type never reach.',
          fix: 'Always add @Override; the compiler then rejects the mistake.',
        },
        {
          mistake: 'Using inheritance for code reuse between unrelated concepts.',
          why: 'Subclasses inherit every public method and become coupled to the parent\'s implementation details.',
          fix: 'Use composition: hold a reference to a helper and delegate.',
        },
      ],
      checks: [
        {
          id: 'o2-c1',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this print?',
          code: `class Shape {
    String label = "shape";
    String describe() { return "I am a " + label; }
}

class Circle extends Shape {
    String label = "circle";
    @Override
    String describe() { return "I am a " + label; }
}

public class Main {
    public static void main(String[] args) {
        Shape s = new Circle();
        System.out.println(s.describe() + ", " + s.label);
    }
}`,
          options: [
            { id: 'a', text: 'I am a circle, circle' },
            { id: 'b', text: 'I am a circle, shape' },
            { id: 'c', text: 'I am a shape, shape' },
            { id: 'd', text: 'I am a shape, circle' },
          ],
          correctOptionId: 'b',
          explanation: 'describe() is dispatched dynamically to Circle and reads Circle\'s field. `s.label` is resolved from the declared type Shape.',
        },
        {
          id: 'o2-c2',
          kind: 'predict-output',
          dimension: 'conceptual',
          prompt: 'What happens when you compile this?',
          code: `class Service {
    public void start() { }
}

class FastService extends Service {
    @Override
    protected void start() { }
}

public class Main {
    public static void main(String[] args) {
        new FastService().start();
    }
}`,
          options: [
            { id: 'a', text: 'It compiles and runs, printing nothing' },
            { id: 'b', text: 'Compile error: attempting to assign weaker access privileges' },
            { id: 'c', text: 'Runtime IllegalAccessError' },
          ],
          correctOptionId: 'b',
          expectCompileError: true,
          explanation: 'An override cannot reduce visibility: code holding a Service reference must always be able to call the public start().',
        },
        {
          id: 'o2-c3',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this print?',
          code: `class A {
    static String id() { return "A"; }
    String name() { return "A"; }
}

class B extends A {
    static String id() { return "B"; }
    @Override
    String name() { return "B"; }
}

public class Main {
    public static void main(String[] args) {
        A ref = new B();
        System.out.println(ref.id() + ref.name());
    }
}`,
          options: [
            { id: 'a', text: 'BB' },
            { id: 'b', text: 'AB' },
            { id: 'c', text: 'AA' },
            { id: 'd', text: 'BA' },
          ],
          correctOptionId: 'b',
          explanation: 'Static methods are bound at compile time using the declared type A (calling them through an instance is legal but misleading). Instance methods dispatch on the runtime type B.',
        },
        {
          id: 'o2-c4',
          kind: 'mcq',
          dimension: 'runtime',
          prompt: 'In what order do these run for `new Child()` the first time Child is used?',
          options: [
            { id: 'a', text: 'Child static, Parent static, Parent constructor, Child constructor' },
            { id: 'b', text: 'Parent static, Child static, Parent instance init + constructor, Child instance init + constructor' },
            { id: 'c', text: 'Parent constructor, Child constructor, then all static blocks' },
            { id: 'd', text: 'Child instance init, Child constructor, Parent constructor' },
          ],
          correctOptionId: 'b',
          explanation: 'Class initialisation (statics) happens parent-first, once. Each object then initialises parent-first: parent instance initialisers and constructor body, then the child\'s.',
        },
        {
          id: 'o2-c5',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'You want a `ReportExporter` to reuse CSV-writing code from `CsvWriter`, but a report is not a kind of writer. What should you do?',
          options: [
            { id: 'a', text: 'ReportExporter extends CsvWriter' },
            { id: 'b', text: 'ReportExporter has a CsvWriter field and delegates to it' },
            { id: 'c', text: 'Copy the CSV code into ReportExporter' },
            { id: 'd', text: 'Make CsvWriter methods static and call them' },
          ],
          correctOptionId: 'b',
          explanation: 'Composition models has-a/uses-a relationships without exposing CsvWriter\'s API or coupling to its internals. It is also easy to swap in a different writer or a test fake.',
        },
      ],
      challengeIds: [],
      masteryCriteria: [
        'Predict dynamic dispatch, field hiding and static method hiding.',
        'Write the full initialisation order of a two-level hierarchy.',
        'Explain why overridable calls in constructors are dangerous.',
      ],
      relatedLessonIds: ['o-inheritance-types', 'o-polymorphism-types', 'o-interfaces', 'o-solid'],
      revision: [
        { id: 'r1', question: 'What does dynamic dispatch mean?', answer: 'For instance method calls the JVM chooses the implementation based on the runtime class of the object, not the declared type of the variable.' },
        { id: 'r2', question: 'Which members are not polymorphic?', answer: 'Fields, static methods and private methods. Fields and statics are resolved from the declared type (hiding, not overriding).' },
        { id: 'r3', question: 'Why avoid calling overridable methods from a constructor?', answer: 'The subclass override runs before the subclass\'s fields are initialised, so it sees default values (null/0).' },
      ],
    },

    // -----------------------------------------------------------------------
    {
      id: 'o-inheritance-types',
      moduleId: 'oop',
      title: 'Types of inheritance',
      summary: 'Single, multilevel, hierarchical, multiple and hybrid inheritance — which Java allows for classes, which only through interfaces, and why.',
      estimatedMinutes: 35,
      difficulty: 'intermediate',
      prerequisites: ['o-inheritance'],
      versionNotes: [
        { feature: 'Default methods (multiple inheritance of behaviour via interfaces)', since: 8 },
        { feature: 'Sealed classes and interfaces (restricting who may inherit)', since: 17 },
      ],
      objectives: [
        'Name the five inheritance types and say which Java supports for classes and which only via interfaces.',
        'Explain the diamond problem and why Java forbids multiple class inheritance.',
        'Resolve a default-method conflict with `Interface.super.method()`.',
        'Trace constructor chaining across three or more levels.',
        'Use `final` to stop inheritance and choose between IS-A and HAS-A.',
      ],
      plainEnglish: `Inheritance comes in a few common shapes:

- **Single**: one child, one parent (\`Car extends Vehicle\`).
- **Multilevel**: a chain — \`ElectricCar extends Car\`, which \`extends Vehicle\`.
- **Hierarchical**: one parent, many children — \`Car\` and \`Truck\` both extend \`Vehicle\`.
- **Multiple**: one child with two or more parents. Java does **not** allow this for classes (\`class C extends A, B\` will not compile), but a class can **implement** many interfaces.
- **Hybrid**: a mix of the above. In Java it is only possible when the "multiple" part comes from interfaces.

Every class you write ultimately extends \`java.lang.Object\`, even when you do not say so.`,
      technical: `### What Java allows
A class has exactly one direct superclass (\`Object\` if you write no \`extends\`), so single, multilevel and hierarchical inheritance are supported for classes. An interface may \`extends\` many interfaces and a class may \`implements\` many interfaces, so **multiple inheritance of type** is supported. Since Java 8 default methods also give a limited **multiple inheritance of behaviour**, but never of state: interfaces have no instance fields.

### The diamond problem
If \`B\` and \`C\` both extend \`A\` and \`D\` extended both, which copy of \`A\`'s fields would \`D\` have, which constructor runs, and whose override of a method wins? C++ answers with virtual inheritance; Java avoids the question for classes entirely.

### Default-method conflict rules (JLS 8.4.8)
1. **Class wins**: a method from the superclass chain beats any interface default.
2. **More specific interface wins**: if \`Guard extends Animal\` and both define \`sound()\`, \`Guard\`'s wins — even if the class also reaches \`Animal\` through another path.
3. Otherwise the class **must** override, and may call a chosen parent with \`Flyer.super.move()\` (only a direct superinterface may be named).

### Constructor chaining across levels
Every constructor starts with \`this(...)\` or \`super(...)\` (the compiler inserts \`super()\` if you write neither). So \`new ElectricCar()\` runs \`Object()\`, then \`Vehicle\`, then \`Car\`, then \`ElectricCar\` constructor bodies — top-down. If the parent has no no-arg constructor, the child must call \`super(args)\` explicitly.

### Stopping inheritance
- \`final class\` cannot be extended (\`String\`, \`Integer\`, records).
- \`final\` method cannot be overridden.
- \`sealed ... permits\` (Java 17) allows only listed subclasses.
- A class with only \`private\` constructors cannot be subclassed from outside it.

### IS-A vs HAS-A
\`extends\`/\`implements\` express IS-A (a \`Car\` is a \`Vehicle\`). A field expresses HAS-A (a \`Car\` has an \`Engine\`). Prefer HAS-A unless substitutability is genuinely intended.`,
      whyItExists: `Inheritance shapes let you reuse and specialise behaviour along real "is-a" lines. Java deliberately limits class inheritance to a single parent so that object layout, constructor order and method lookup stay unambiguous, while interfaces still give a class many types — the flexibility of multiple inheritance without the diamond's state problems.`,
      whenToUse: [
        'Use single or hierarchical inheritance for a genuine is-a family that shares a contract (Shape → Circle, Square).',
        'Use multilevel inheritance sparingly, when each level adds a real specialisation.',
        'Use multiple interfaces when a class plays several roles (Comparable, AutoCloseable, Runnable).',
        'Use `Interface.super.method()` to combine or pick between conflicting defaults explicitly.',
      ],
      whenNotToUse: [
        'Do not build deep multilevel chains: each level couples to everything above it.',
        'Do not try to simulate multiple class inheritance with default methods that fake state.',
        'Do not use inheritance for HAS-A relationships; hold a field and delegate instead.',
      ],
      examples: [
        {
          id: 'o6-forms',
          title: 'Single, multilevel and hierarchical inheritance with constructor chaining',
          runnable: true,
          code: `class Vehicle {
    final String plate;
    Vehicle(String plate) {
        this.plate = plate;
        System.out.println("Vehicle(" + plate + ")");
    }
    String describe() { return "vehicle"; }
}

class Car extends Vehicle {                 // single: Car -> Vehicle
    Car(String plate) {
        super(plate);
        System.out.println("Car()");
    }
    @Override
    String describe() { return "car, a " + super.describe(); }
}

class ElectricCar extends Car {             // multilevel: ElectricCar -> Car -> Vehicle
    ElectricCar(String plate) {
        super(plate);
        System.out.println("ElectricCar()");
    }
    @Override
    String describe() { return "electric " + super.describe(); }
}

class Truck extends Vehicle {               // hierarchical: Car and Truck share Vehicle
    Truck(String plate) { super(plate); }
    @Override
    String describe() { return "truck"; }
}

public class Main {
    public static void main(String[] args) {
        ElectricCar tesla = new ElectricCar("EV-1");
        System.out.println(tesla.describe());
        Vehicle lorry = new Truck("TR-9");
        System.out.println(lorry.describe() + " extends " + Truck.class.getSuperclass().getSimpleName());
        System.out.println("Vehicle extends " + Vehicle.class.getSuperclass().getSimpleName());
        System.out.println(tesla instanceof Vehicle);
    }
}`,
          expectedOutput: `Vehicle(EV-1)
Car()
ElectricCar()
electric car, a vehicle
Vehicle(TR-9)
truck extends Vehicle
Vehicle extends Object
true`,
          explanation: 'Constructors run top-down because each one calls super(...) first. super.describe() walks back up the chain one level at a time. Vehicle has no explicit extends, so its superclass is Object.',
        },
        {
          id: 'o6-interface-diamond',
          title: 'Multiple and hybrid inheritance through interfaces',
          runnable: true,
          code: `interface Flyer {
    default String move() { return "fly"; }
}

interface Swimmer {
    default String move() { return "swim"; }
}

abstract class Bird {
    String name() { return getClass().getSimpleName(); }
}

// hybrid: one superclass + two interfaces whose defaults clash
class Duck extends Bird implements Flyer, Swimmer {
    @Override
    public String move() {
        return Flyer.super.move() + " and " + Swimmer.super.move();
    }
}

// multiple inheritance of type without any conflict
class Penguin extends Bird implements Swimmer { }

public class Main {
    public static void main(String[] args) {
        Duck duck = new Duck();
        Flyer asFlyer = duck;
        Swimmer asSwimmer = duck;
        System.out.println(duck.name() + ": " + duck.move());
        System.out.println(asFlyer.move().equals(asSwimmer.move()));
        System.out.println(new Penguin().name() + ": " + new Penguin().move());
    }
}`,
          expectedOutput: `Duck: fly and swim
true
Penguin: swim`,
          explanation: 'Duck inherits two unrelated move() defaults, so it must override; it combines both with Interface.super calls. Whatever reference type you use, the single Duck override runs.',
        },
        {
          id: 'o6-final-hasa',
          title: 'final stops inheritance; HAS-A versus IS-A',
          runnable: true,
          code: `import java.lang.reflect.Modifier;

final class Money {                       // final: no class may extend Money
    final long cents;
    Money(long cents) { this.cents = cents; }
}

class Account {
    private final Money balance;          // HAS-A: an Account has a Money
    Account(Money balance) { this.balance = balance; }
    final String audit() {                // final: subclasses cannot override
        return getClass().getSimpleName() + " balance=" + balance.cents;
    }
}

class SavingsAccount extends Account {    // IS-A: a SavingsAccount is an Account
    SavingsAccount(Money opening) { super(opening); }
    // String audit() { ... }  would not compile: audit() is final in Account
}

public class Main {
    public static void main(String[] args) {
        Account savings = new SavingsAccount(new Money(1_500));
        System.out.println(savings.audit());
        System.out.println(savings instanceof Account);
        System.out.println(Modifier.isFinal(Money.class.getModifiers()));
        System.out.println(Modifier.isFinal(String.class.getModifiers()));
    }
}`,
          expectedOutput: `SavingsAccount balance=1500
true
true
true`,
        },
      ],
      walkthrough: {
        exampleId: 'o6-interface-diamond',
        steps: [
          { lines: [1, 7], text: 'Two unrelated interfaces each provide a default `move()`. Neither is more specific than the other.' },
          { lines: [9, 11], text: 'Bird is the single superclass. It has no `move()`, so the "class wins" rule cannot settle the conflict.' },
          { lines: [14, 14], text: 'Hybrid inheritance: one `extends` plus two `implements`. Without an override this line would be a compile error ("inherits unrelated defaults").' },
          { lines: [15, 18], text: '`Flyer.super.move()` and `Swimmer.super.move()` call each interface\'s default explicitly. You may only name a direct superinterface here.' },
          { lines: [22, 22], text: 'Penguin implements only one interface, so there is no conflict and it simply inherits `Swimmer.move()`.' },
          { lines: [26, 31], text: 'One Duck object, three reference types. Every call dispatches to Duck\'s single override, so both interface views print the same text.' },
        ],
      },
      realWorld: {
        title: 'A library upgrade that broke compilation',
        scenario: `A team's \`AuditedList\` implemented both their own \`Auditable\` interface (with a default \`describe()\`) and a third-party \`Describable\` interface. After a minor library upgrade, \`Describable\` gained its own default \`describe()\` and the build failed with "inherits unrelated defaults for describe()".

The fix took two minutes: override \`describe()\` in \`AuditedList\` and delegate to \`Auditable.super.describe()\`. The lesson the team wrote down: adding a default method to a widely implemented interface is *source*-incompatible for classes that already inherit a same-signature default from elsewhere — the diamond problem in Java is a compile-time error, never a silent runtime surprise.`,
      },
      commonMistakes: [
        {
          mistake: 'Writing `class C extends A, B`.',
          why: 'Java classes have exactly one direct superclass; this is a syntax error.',
          fix: 'Extend one class and implement interfaces for the other roles, or compose: hold a B and delegate to it.',
        },
        {
          mistake: 'Forgetting `super(args)` when the parent has no no-arg constructor.',
          why: 'The compiler inserts `super()`, which does not exist, so you get "constructor Vehicle in class Vehicle cannot be applied to given types".',
          fix: 'Call the right parent constructor explicitly as the first statement.',
          code: `class Car extends Vehicle {
    Car(String plate) { super(plate); }
}`,
        },
        {
          mistake: 'Calling `Flyer.super.move()` from a class that does not directly implement Flyer.',
          why: '`X.super.m()` may only name a direct superinterface (or the direct superclass with plain `super`).',
          fix: 'Implement the interface directly, or call through the intermediate interface that extends it.',
        },
        {
          mistake: 'Modelling HAS-A as IS-A (e.g. `Car extends Engine`).',
          why: 'Car would expose every Engine method and could be passed wherever an Engine is expected.',
          fix: 'Give Car an `Engine` field and delegate.',
        },
      ],
      checks: [
        {
          id: 'o6-c1',
          kind: 'multi-select',
          dimension: 'conceptual',
          prompt: 'Which inheritance types can Java express using classes alone (only `extends`, no interfaces)?',
          options: [
            { id: 'a', text: 'Single' },
            { id: 'b', text: 'Multilevel' },
            { id: 'c', text: 'Hierarchical' },
            { id: 'd', text: 'Multiple' },
            { id: 'e', text: 'Hybrid' },
          ],
          correctOptionIds: ['a', 'b', 'c'],
          explanation: 'A class has exactly one direct superclass, which allows chains (multilevel) and fan-out (hierarchical) but not several parents. Multiple and hybrid inheritance need interfaces.',
        },
        {
          id: 'o6-c2',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this print?',
          code: `class A {
    A() { System.out.print("A"); }
}

class B extends A {
    B() {
        this(0);
        System.out.print("B");
    }
    B(int x) { System.out.print("b" + x); }
}

class C extends B {
    C() { System.out.print("C"); }
}

public class Main {
    public static void main(String[] args) {
        new C();
        System.out.println();
    }
}`,
          options: [
            { id: 'a', text: 'Ab0BC' },
            { id: 'b', text: 'CBb0A' },
            { id: 'c', text: 'ABb0C' },
            { id: 'd', text: 'Ab0CB' },
          ],
          correctOptionId: 'a',
          hints: ['Every constructor first calls this(...) or super(...), and only then runs its own body.'],
          explanation: 'C() implicitly calls super() → B() calls this(0) → B(int) implicitly calls super() → A() prints "A". Then the bodies unwind: B(int) prints "b0", B() prints "B", C() prints "C".',
        },
        {
          id: 'o6-c3',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'Dog reaches `Animal.sound()` through two paths. What happens?',
          code: `interface Animal {
    default String sound() { return "generic"; }
}

interface Pet extends Animal { }

interface Guard extends Animal {
    default String sound() { return "bark"; }
}

class Dog implements Pet, Guard { }

public class Main {
    public static void main(String[] args) {
        System.out.println(new Dog().sound());
    }
}`,
          options: [
            { id: 'a', text: 'generic' },
            { id: 'b', text: 'bark' },
            { id: 'c', text: 'Compile error: Dog inherits unrelated defaults for sound()' },
            { id: 'd', text: 'Runtime AbstractMethodError' },
          ],
          correctOptionId: 'b',
          explanation: 'This is an interface diamond, but it is not ambiguous: Guard.sound() overrides Animal.sound(), so the more specific interface wins. Pet adds no competing method of its own.',
        },
        {
          id: 'o6-c4',
          kind: 'predict-output',
          dimension: 'conceptual',
          prompt: 'What happens when you compile this?',
          code: `final class Config {
    String env() { return "prod"; }
}

class DevConfig extends Config {
    @Override
    String env() { return "dev"; }
}

public class Main {
    public static void main(String[] args) {
        System.out.println(new DevConfig().env());
    }
}`,
          options: [
            { id: 'a', text: 'dev' },
            { id: 'b', text: 'prod' },
            { id: 'c', text: 'Compile error: cannot inherit from final Config' },
            { id: 'd', text: 'Runtime VerifyError' },
          ],
          correctOptionId: 'c',
          expectCompileError: true,
          explanation: 'A final class cannot have subclasses. The compiler rejects `extends Config` before any code runs.',
        },
        {
          id: 'o6-c5',
          kind: 'mcq',
          dimension: 'interview',
          prompt: 'Why does Java forbid a class from extending two classes but allow it to implement two interfaces?',
          options: [
            { id: 'a', text: 'Interfaces are faster to dispatch than classes' },
            { id: 'b', text: 'Classes carry state and constructors, so two parents would make field layout, construction order and method choice ambiguous; interfaces carry no instance state and conflicting defaults must be resolved explicitly' },
            { id: 'c', text: 'The JVM cannot load more than one superclass file at a time' },
            { id: 'd', text: 'Multiple class inheritance was removed in Java 8 when default methods arrived' },
          ],
          correctOptionId: 'b',
          explanation: 'The diamond problem is mainly about duplicated state and ambiguous behaviour. Interfaces never contribute fields, and Java turns any default-method ambiguity into a compile error the class must resolve.',
        },
        {
          id: 'o6-c6',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'A `Car` needs an engine that can be swapped between petrol and electric at runtime. Which design fits?',
          options: [
            { id: 'a', text: '`class Car extends PetrolEngine`' },
            { id: 'b', text: '`class Car` with a field `private Engine engine` (HAS-A) where Engine is an interface' },
            { id: 'c', text: '`class Car extends PetrolEngine, ElectricEngine`' },
            { id: 'd', text: '`interface Car extends Engine` with default methods holding the engine state' },
          ],
          correctOptionId: 'b',
          explanation: 'A car is not an engine; it has one. Composition through an interface-typed field lets you swap implementations at runtime, which inheritance (fixed at compile time) cannot do.',
        },
      ],
      challengeIds: [],
      masteryCriteria: [
        'List all five inheritance types with Java\'s support status for each.',
        'Explain the diamond problem and state the three default-method resolution rules.',
        'Predict constructor order across three levels including this(...) delegation.',
        'Choose IS-A vs HAS-A and justify it.',
      ],
      relatedLessonIds: ['o-inheritance', 'o-interfaces', 'o-polymorphism-types', 'o-solid'],
      revision: [
        { id: 'r1', question: 'Which inheritance types does Java support for classes, and which only via interfaces?', answer: 'Classes: single, multilevel, hierarchical. Multiple and hybrid inheritance are only possible through interfaces (multiple inheritance of type, and of behaviour via default methods, never of state).' },
        { id: 'r2', question: 'What is the diamond problem?', answer: 'When a class inherits the same member through two parents that share an ancestor, it is ambiguous which state and implementation it gets. Java forbids multiple class inheritance and makes conflicting interface defaults a compile error.' },
        { id: 'r3', question: 'How do you resolve two conflicting default methods?', answer: 'Override the method in the class and, if needed, call a chosen one with InterfaceName.super.method().' },
        { id: 'r4', question: 'In what order do constructors run for a three-level hierarchy?', answer: 'Top-down: Object, then grandparent, parent, child — because each constructor calls super(...) (or this(...)) before its own body.' },
      ],
    },

    // -----------------------------------------------------------------------
    {
      id: 'o-polymorphism-types',
      moduleId: 'oop',
      title: 'Types of polymorphism',
      summary: 'Compile-time overloading, runtime overriding, generics and subtyping — what is decided when, and why fields and static methods do not take part.',
      estimatedMinutes: 40,
      difficulty: 'intermediate',
      prerequisites: ['o-inheritance', 'f-methods'],
      versionNotes: [
        { feature: 'Generics (parametric polymorphism)', since: 5 },
        { feature: 'Pattern matching for instanceof', since: 16 },
        { feature: 'Type patterns in switch', since: 21 },
      ],
      objectives: [
        'Distinguish compile-time (static) and runtime (dynamic) polymorphism.',
        'Predict which overload the compiler picks, including widening, boxing and varargs.',
        'Explain dynamic dispatch and why fields and static methods are hidden, not overridden.',
        'Recognise parametric, subtype and ad-hoc polymorphism in Java code.',
        'Upcast safely and downcast with `instanceof` patterns instead of blind casts.',
      ],
      plainEnglish: `**Polymorphism** means one name, many forms. Java has several kinds:

- **Compile-time (static)**: several methods share a name but take different parameters (**overloading**). The compiler picks one by looking at the argument types you wrote.
- **Runtime (dynamic)**: a subclass replaces a parent method (**overriding**). Which version runs is decided while the program runs, by the real object.
- **Parametric**: one generic method or class works for any type — \`List<T>\`.
- **Subtype**: a \`Dog\` can be used anywhere an \`Animal\` is expected.

A quick rule: **overloads are chosen by the variable types, overrides by the object.**`,
      technical: `### Compile-time polymorphism: overload resolution (JLS 15.12.2)
The compiler finds every applicable method in three phases and stops at the first phase that finds any:
1. **Strict/loose without boxing or varargs**: exact matches and primitive widening (\`int → long\`), plus reference subtyping.
2. **With boxing/unboxing** (\`int → Integer\`), still no varargs.
3. **With varargs**.
Within a phase it chooses the **most specific** method (one whose parameter types are all subtypes of another's); if none is most specific the call is ambiguous. Consequence: \`f(5)\` prefers \`f(long)\` over \`f(Integer)\`, and \`f(Object)\` (via boxing) over \`f(int...)\`.

### Runtime polymorphism: overriding and dynamic dispatch
The compiler fixes the method *signature*; the JVM picks the *implementation* from the receiver's runtime class. Conceptually each class has a **virtual method table** (vtable): an array of method slots, where a subclass copies its parent's table and replaces the slots it overrides. \`invokevirtual\` indexes that table, so the call costs about the same no matter how deep the hierarchy. The JIT often removes even that cost by inlining when it sees one receiver type.

### Parametric, subtype and ad-hoc
- **Parametric**: generics — \`<T> T firstOr(List<T>, T)\` has one body for all \`T\`. Bounded with \`<T extends Comparable<T>>\`.
- **Subtype (inclusion)**: any \`Notifier\` subclass is accepted where \`Notifier\` is expected. This is what makes dynamic dispatch useful.
- **Ad-hoc**: one name, separate implementations per type — overloading (and operator \`+\` for numbers vs strings).

### What does NOT take part
Fields, static methods and private methods are bound at compile time from the declared type. A subclass field or static method with the same name **hides** the parent's; only instance methods are **overridden**.

### Upcasting and downcasting
Upcasting (\`Notifier n = new EmailNotifier()\`) is implicit and always safe. Downcasting (\`(EmailNotifier) n\`) is checked at runtime and throws \`ClassCastException\` on the wrong type. Prefer \`if (n instanceof EmailNotifier e)\` (Java 16), or a \`switch\` with type patterns over a sealed type (Java 21).`,
      whyItExists: `Polymorphism lets code depend on *what* something can do instead of *which class* it is. Callers stay unchanged when new implementations appear (Open/Closed), libraries can be written once for all element types (generics), and convenient APIs can accept different argument types under one name (overloading).`,
      whenToUse: [
        'Use overriding to replace type-checking if/else chains with polymorphic calls.',
        'Use overloading for genuinely equivalent operations on different input types (println(int), println(String)).',
        'Use generics when an algorithm does not care about the element type.',
        'Use instanceof patterns or sealed-type switches when you truly need the concrete type.',
      ],
      whenNotToUse: [
        'Do not overload with parameter types that are related by boxing or widening (f(long) vs f(Integer)) — callers will be surprised.',
        'Do not expect fields or static methods to behave polymorphically.',
        'Do not scatter downcasts through code; it usually means a method belongs on the base type.',
      ],
      examples: [
        {
          id: 'o7-dispatch',
          title: 'Runtime polymorphism, hiding and safe downcasting',
          runnable: true,
          minJavaVersion: 16,
          code: `abstract class Notifier {
    String tag = "notifier";
    static String channel() { return "generic"; }
    abstract String send(String msg);
}

class EmailNotifier extends Notifier {
    String tag = "email";                          // hides Notifier.tag
    static String channel() { return "email"; }    // hides Notifier.channel()
    @Override
    String send(String msg) { return "Email: " + msg; }
    String subject() { return "[Alert]"; }
}

class SmsNotifier extends Notifier {
    @Override
    String send(String msg) { return "SMS: " + msg; }
}

public class Main {
    public static void main(String[] args) {
        Notifier[] all = { new EmailNotifier(), new SmsNotifier() };   // upcasts
        for (Notifier n : all) {
            System.out.println(n.send("disk full"));                  // dynamic dispatch
        }
        Notifier first = all[0];
        System.out.println(first.tag + " " + ((EmailNotifier) first).tag);
        System.out.println(Notifier.channel() + " " + EmailNotifier.channel());
        for (Notifier n : all) {
            if (n instanceof EmailNotifier email) {                    // safe downcast
                System.out.println("email subject " + email.subject());
            } else {
                System.out.println("not email: " + n.getClass().getSimpleName());
            }
        }
    }
}`,
          expectedOutput: `Email: disk full
SMS: disk full
notifier email
generic email
email subject [Alert]
not email: SmsNotifier`,
        },
        {
          id: 'o7-overloads',
          title: 'How the compiler picks an overload',
          runnable: true,
          code: `public class Main {
    static String pick(int x)     { return "int"; }
    static String pick(long x)    { return "long"; }
    static String pick(Integer x) { return "Integer"; }
    static String pick(Object x)  { return "Object"; }

    static String take(long x)    { return "long"; }
    static String take(Integer x) { return "Integer"; }

    static String only(Object x)  { return "Object"; }
    static String only(int... xs) { return "varargs"; }

    public static void main(String[] args) {
        byte small = 1;
        System.out.println(pick(5) + " " + pick(small) + " " + pick(5L));
        System.out.println(pick(Integer.valueOf(5)) + " " + pick("hi"));
        System.out.println(take(5));
        System.out.println(only(7) + " " + only());
    }
}`,
          expectedOutput: `int int long
Integer Object
long
Object varargs`,
          explanation: 'Phase 1 (no boxing) wins whenever it finds anything: byte widens to int (more specific than long), and int widens to long before it would ever box to Integer. Boxing to Integer then Object (phase 2) beats varargs (phase 3).',
        },
        {
          id: 'o7-parametric',
          title: 'Parametric polymorphism with generics',
          runnable: true,
          code: `import java.util.List;

public class Main {
    // one body works for every element type T
    static <T> T firstOr(List<T> items, T fallback) {
        return items.isEmpty() ? fallback : items.get(0);
    }

    // bounded: works for any T that can compare itself to another T
    static <T extends Comparable<T>> T max(List<T> items) {
        T best = items.get(0);
        for (T item : items) {
            if (item.compareTo(best) > 0) best = item;
        }
        return best;
    }

    public static void main(String[] args) {
        String fruit = firstOr(List.of("kiwi", "fig"), "none");
        Integer number = firstOr(List.<Integer>of(), -1);
        System.out.println(fruit + " " + number);
        System.out.println(max(List.of(3, 9, 4)) + " " + max(List.of("pear", "apple", "plum")));
    }
}`,
          expectedOutput: `kiwi -1
9 plum`,
        },
      ],
      walkthrough: {
        exampleId: 'o7-dispatch',
        steps: [
          { lines: [1, 5], text: 'The base type declares a field, a static method and an abstract instance method — three members that behave very differently under polymorphism.' },
          { lines: [7, 13], text: 'EmailNotifier redeclares the field and the static method (hiding) and overrides send (overriding). subject() exists only on EmailNotifier.' },
          { lines: [22, 25], text: 'Storing subclasses in a Notifier[] is upcasting. The loop calls send through the base type, and dispatch picks each object\'s own override at runtime.' },
          { lines: [26, 27], text: 'Field access uses the declared type: `first.tag` reads Notifier.tag ("notifier"); after a cast to EmailNotifier the same object shows "email".' },
          { lines: [28, 28], text: 'Static methods are resolved by the class name you write; there is no object involved, so nothing is dynamic.' },
          { lines: [29, 35], text: 'The instanceof pattern tests and downcasts in one step and binds `email` only when the test succeeds, so ClassCastException is impossible.' },
        ],
      },
      realWorld: {
        title: 'The overload that silently changed behaviour',
        scenario: `A metrics library had \`record(long value)\` and, later, gained \`record(Object tagged)\` for tagged values. Callers passing an \`int\` kept calling \`record(long)\` (widening beats boxing), but callers passing an \`Integer\` read from a map started hitting \`record(Object)\` — and those counts quietly disappeared from dashboards.

Overload resolution happens at compile time from the *static* argument types, so the same number took different paths depending on whether it was boxed. The fix was to rename the new method \`recordTagged(...)\`. Many API style guides (including *Effective Java*, Item 52) advise against overloads with the same arity whose parameter types can be converted into each other.`,
      },
      commonMistakes: [
        {
          mistake: 'Believing an overload is chosen by the runtime type of the argument.',
          why: 'Overload selection is compile-time, based on the declared types of the arguments; only the receiver of an overridden method is dynamic.',
          fix: 'If behaviour must depend on the argument\'s runtime type, move the method onto that type (override it) or use a pattern switch.',
          code: `Object doc = "report";
printer.print(doc);   // calls print(Object), even though doc holds a String`,
        },
        {
          mistake: 'Redeclaring a field in a subclass and expecting it to override.',
          why: 'Fields are hidden, not overridden; access through the parent type sees the parent\'s field.',
          fix: 'Keep fields private and expose behaviour through overridable methods.',
        },
        {
          mistake: 'Downcasting without checking the type.',
          why: 'A wrong cast compiles but throws ClassCastException at runtime.',
          fix: 'Use `if (x instanceof Type t)` or, better, a method on the base type.',
        },
      ],
      checks: [
        {
          id: 'o7-c1',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'Static binding meets dynamic binding. What does this print?',
          code: `class Printer {
    static String kind() { return "Printer"; }
    String name() { return "printer"; }
    String print(Object o) { return "P-Object"; }
    String print(String s) { return "P-String"; }
}

class LaserPrinter extends Printer {
    static String kind() { return "Laser"; }
    @Override
    String name() { return "laser"; }
    @Override
    String print(Object o) { return "L-Object"; }
}

public class Main {
    public static void main(String[] args) {
        Printer p = new LaserPrinter();
        Object doc = "report";
        System.out.println(p.kind() + " " + p.name() + " " + p.print(doc));
    }
}`,
          options: [
            { id: 'a', text: 'Laser laser P-String' },
            { id: 'b', text: 'Printer laser L-Object' },
            { id: 'c', text: 'Printer laser P-String' },
            { id: 'd', text: 'Laser laser L-Object' },
          ],
          correctOptionId: 'b',
          hints: ['Ask two questions per call: which signature does the compiler pick from the declared types, and does the JVM then dispatch on the object?'],
          explanation: '`kind()` is static, bound to the declared type Printer. `name()` is overridden, so the LaserPrinter version runs. For `print(doc)` the compiler sees an Object argument and fixes the signature print(Object); at runtime that signature dispatches to LaserPrinter\'s override, giving L-Object. print(String) is never considered.',
        },
        {
          id: 'o7-c2',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'Which overloads are chosen?',
          code: `public class Main {
    static String f(long x)       { return "long"; }
    static String f(Integer x)    { return "Integer"; }
    static String f(Object x)     { return "Object"; }
    static String g(double... xs) { return "varargs"; }
    static String g(Double x)     { return "Double"; }

    public static void main(String[] args) {
        System.out.println(f(3) + " " + f(Integer.valueOf(3)) + " " + g(2.0) + " " + g(2));
    }
}`,
          options: [
            { id: 'a', text: 'Integer Integer Double Double' },
            { id: 'b', text: 'long Integer Double varargs' },
            { id: 'c', text: 'long Object varargs varargs' },
            { id: 'd', text: 'Integer Integer varargs Double' },
          ],
          correctOptionId: 'b',
          explanation: 'f(3): widening int→long is phase 1, so it beats boxing. f(Integer) matches exactly in phase 1 and is more specific than Object. g(2.0) needs boxing double→Double (phase 2), which beats varargs. g(2) cannot box int to Double (it would box to Integer), so only varargs (phase 3) applies, with int widened to double.',
        },
        {
          id: 'o7-c3',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'A method `static <T> void swap(T[] a, int i, int j)` works for arrays of any reference type with one body. Which kind of polymorphism is this?',
          options: [
            { id: 'a', text: 'Ad-hoc polymorphism (overloading)' },
            { id: 'b', text: 'Parametric polymorphism' },
            { id: 'c', text: 'Runtime polymorphism (overriding)' },
            { id: 'd', text: 'Coercion' },
          ],
          correctOptionId: 'b',
          explanation: 'Parametric polymorphism: one implementation abstracts over a type parameter. Ad-hoc polymorphism would need a separate implementation per type.',
        },
        {
          id: 'o7-c4',
          kind: 'multi-select',
          dimension: 'interview',
          prompt: 'Which of these are decided at compile time from declared types (not by the runtime class of an object)?',
          options: [
            { id: 'a', text: 'Which overload of a method is called' },
            { id: 'b', text: 'Which field `ref.name` reads when a subclass redeclares `name`' },
            { id: 'c', text: 'Which static method `ref.util()` calls' },
            { id: 'd', text: 'Which override of an instance method runs' },
            { id: 'e', text: 'Which private method a class calls on itself' },
          ],
          correctOptionIds: ['a', 'b', 'c', 'e'],
          explanation: 'Overload choice, field access, static methods and private methods are all bound statically. Only the implementation of a non-private, non-static, non-final instance method is chosen at runtime.',
        },
        {
          id: 'o7-c5',
          kind: 'predict-output',
          dimension: 'debugging',
          prompt: 'What does this print?',
          code: `class Animal { }
class Dog extends Animal { }
class Cat extends Animal { }

public class Main {
    public static void main(String[] args) {
        Animal a = new Cat();
        if (a instanceof Dog d) {
            System.out.println("dog " + d);
        } else {
            System.out.println("not a dog");
        }
        try {
            Dog forced = (Dog) a;
            System.out.println("cast ok " + forced);
        } catch (ClassCastException e) {
            System.out.println("ClassCastException");
        }
    }
}`,
          options: [
            { id: 'a', text: 'not a dog\nClassCastException' },
            { id: 'b', text: 'not a dog\ncast ok' },
            { id: 'c', text: 'Compile error: incompatible types Animal and Dog' },
            { id: 'd', text: 'dog\nClassCastException' },
          ],
          correctOptionId: 'a',
          explanation: 'The cast compiles because an Animal *might* be a Dog, but the object is a Cat, so the JVM\'s checkcast throws ClassCastException. The instanceof pattern simply tests false and never binds `d`.',
        },
      ],
      challengeIds: [],
      masteryCriteria: [
        'Name and give a Java example of compile-time, runtime, parametric, subtype and ad-hoc polymorphism.',
        'Predict overload choice through the widening, boxing and varargs phases.',
        'Separate what is bound statically (overloads, fields, statics, privates) from what is dispatched dynamically.',
        'Downcast safely with instanceof patterns.',
      ],
      relatedLessonIds: ['o-inheritance', 'o-inheritance-types', 'o-interfaces', 't-generics', 'f-methods'],
      revision: [
        { id: 'r1', question: 'Compile-time vs runtime polymorphism in one sentence each?', answer: 'Compile-time: the compiler chooses among overloads using the declared argument types. Runtime: the JVM chooses an override using the receiver object\'s actual class.' },
        { id: 'r2', question: 'What are the three phases of overload resolution?', answer: '1) without boxing or varargs (exact, widening, subtyping), 2) with boxing/unboxing, 3) with varargs. The first phase that finds an applicable method wins, then the most specific is chosen.' },
        { id: 'r3', question: 'Why are fields and static methods not polymorphic?', answer: 'They are resolved from the declared type at compile time. Redeclaring them in a subclass hides the parent member rather than overriding it.' },
        { id: 'r4', question: 'What is a virtual method table?', answer: 'A per-class array of method slots used for dynamic dispatch; a subclass copies its parent\'s table and replaces slots it overrides, so a virtual call is an index lookup at runtime.' },
      ],
    },

    // -----------------------------------------------------------------------
    {
      id: 'o-interfaces',
      moduleId: 'oop',
      title: 'Abstract classes, interfaces and sealed types',
      summary: 'Choosing between abstract classes and interfaces, default methods, the diamond problem and sealed hierarchies.',
      estimatedMinutes: 40,
      difficulty: 'intermediate',
      prerequisites: ['o-inheritance'],
      versionNotes: [
        { feature: 'Default and static interface methods', since: 8 },
        { feature: 'Private interface methods', since: 9 },
        { feature: 'Sealed classes and interfaces', since: 17 },
        { feature: 'Pattern matching for switch', since: 21 },
      ],
      objectives: [
        'Choose between an abstract class and an interface.',
        'Resolve default-method conflicts.',
        'Model a closed set of variants with a sealed interface and an exhaustive switch.',
      ],
      plainEnglish: `An **interface** is a contract: "anything that implements \`PaymentMethod\` can \`pay(amount)\`". A class can implement many interfaces.

An **abstract class** is a partially built class: it can hold fields and shared code, but some methods are left for subclasses to fill in. A class can extend only one class.

A **sealed** type (Java 17) lists exactly which classes may implement or extend it, so the compiler knows every possible variant.`,
      technical: `### Abstract classes
Can have constructors, instance fields, any visibility and both abstract and concrete methods. Cannot be instantiated. Use them to share state and implementation across closely related subclasses (template method pattern).

### Interfaces
Members are implicitly public. They can declare abstract methods, \`default\` methods (Java 8), \`static\` methods (Java 8), \`private\` helper methods (Java 9) and constants (implicitly \`public static final\`). They cannot hold instance state. A class may implement any number of interfaces.

### Default method conflict resolution
1. **Classes win**: a method inherited from a superclass beats an interface default.
2. **More specific interfaces win**: if B extends A and both define a default, B's wins.
3. Otherwise the class **must** override and may call a chosen one with \`A.super.method()\`. If it doesn't, compilation fails.

### Sealed types
\`sealed interface Shape permits Circle, Square\` restricts implementations. Each permitted subtype must be \`final\`, \`sealed\` or \`non-sealed\`. Records are implicitly final, which makes them natural variants. With pattern matching for \`switch\` (Java 21) the compiler checks **exhaustiveness**: a switch over a sealed type needs no \`default\`, and adding a new variant makes every incomplete switch a compile error.`,
      whyItExists: `Interfaces decouple "what" from "how", allowing multiple implementations and easy substitution in tests. Default methods were added so interfaces such as Collection could evolve (e.g. adding stream()) without breaking every implementation. Sealed types restore compile-time exhaustiveness for closed domain models.`,
      whenToUse: [
        'Use interfaces to define capabilities and the boundaries between components.',
        'Use an abstract class when subclasses share state and a common algorithm skeleton.',
        'Use a sealed interface with records for a fixed set of variants (payment results, AST nodes, events).',
      ],
      whenNotToUse: [
        'Do not use default methods to give interfaces state-like behaviour or to build multiple inheritance of implementation.',
        'Do not create an interface for every class "just in case" — add one when a second implementation or a seam is needed.',
        'Do not seal types that external code legitimately needs to extend.',
      ],
      examples: [
        {
          id: 'diamond',
          title: 'Default methods and the diamond',
          runnable: true,
          code: `interface Logger {
    default String prefix() { return "LOG"; }
}

interface Auditor {
    default String prefix() { return "AUDIT"; }
}

class Base {
    public String prefix() { return "BASE"; }
}

class Both implements Logger, Auditor {
    @Override
    public String prefix() {
        return Logger.super.prefix() + "+" + Auditor.super.prefix();
    }
}

class Inherits extends Base implements Logger {
}

public class Main {
    public static void main(String[] args) {
        System.out.println(new Both().prefix());
        System.out.println(new Inherits().prefix());
    }
}`,
          expectedOutput: `LOG+AUDIT
BASE`,
          explanation: 'Both must override because two unrelated defaults conflict. Inherits gets Base\'s method because classes win over interface defaults.',
        },
        {
          id: 'sealed',
          title: 'Sealed interface with an exhaustive switch',
          runnable: true,
          minJavaVersion: 21,
          code: `sealed interface Shape permits Circle, Rectangle, Square {}

record Circle(double radius) implements Shape {}
record Rectangle(double width, double height) implements Shape {}
record Square(double side) implements Shape {}

public class Main {
    static double area(Shape shape) {
        return switch (shape) {
            case Circle c -> Math.PI * c.radius() * c.radius();
            case Rectangle r -> r.width() * r.height();
            case Square s -> s.side() * s.side();
        };
    }

    public static void main(String[] args) {
        Shape[] shapes = { new Circle(1), new Rectangle(2, 3), new Square(4) };
        for (Shape s : shapes) {
            System.out.println(s + " -> " + area(s));
        }
    }
}`,
          expectedOutput: `Circle[radius=1.0] -> 3.141592653589793
Rectangle[width=2.0, height=3.0] -> 6.0
Square[side=4.0] -> 16.0`,
        },
      ],
      walkthrough: {
        exampleId: 'sealed',
        steps: [
          { lines: [1, 1], text: 'The sealed interface permits exactly three implementations; no other class may implement Shape.' },
          { lines: [3, 5], text: 'Records are implicitly final, which satisfies the sealed rule, and they generate constructors, accessors, equals, hashCode and toString.' },
          { lines: [8, 14], text: 'A switch over the sealed type with type patterns. No default is needed: the compiler proves all three cases are covered.' },
          { lines: [10, 10], text: '`case Circle c` tests the type and binds a typed variable in one step — no cast required.' },
          { lines: [17, 20], text: 'If someone adds `record Triangle(...)` to the permits list, this switch stops compiling until it handles Triangle.' },
        ],
      },
      realWorld: {
        title: 'A payment result that could not be ignored',
        scenario: `A checkout service modelled payment outcomes with an enum plus nullable fields (\`errorCode\`, \`redirectUrl\`), and callers frequently forgot to handle the "requires 3-D Secure" case, leaving orders stuck.

Remodelling outcomes as \`sealed interface PaymentResult permits Approved, Declined, RequiresAction\` with records carrying exactly the data each case needs made invalid combinations unrepresentable, and exhaustive switches meant the compiler listed every place that needed updating when a new outcome was added.`,
      },
      commonMistakes: [
        {
          mistake: 'Trying to add instance fields to an interface.',
          why: 'Interface fields are implicitly public static final constants.',
          fix: 'Use an abstract class (or composition) when implementations need shared state.',
        },
        {
          mistake: 'Ignoring a default-method conflict.',
          why: 'Implementing two interfaces with the same default method is a compile error until you override it.',
          fix: 'Override and choose explicitly with `InterfaceName.super.method()`.',
        },
        {
          mistake: 'Adding a `default` branch to a switch over a sealed type.',
          why: 'It silences the exhaustiveness check, so new variants are silently routed to the default.',
          fix: 'List every permitted type and let the compiler enforce completeness.',
        },
      ],
      checks: [
        {
          id: 'o3-c1',
          kind: 'predict-output',
          dimension: 'conceptual',
          prompt: 'What happens when you compile this?',
          code: `interface Walker {
    default String move() { return "walk"; }
}

interface Swimmer {
    default String move() { return "swim"; }
}

class Duck implements Walker, Swimmer {
}

public class Main {
    public static void main(String[] args) {
        System.out.println(new Duck().move());
    }
}`,
          options: [
            { id: 'a', text: 'walk' },
            { id: 'b', text: 'swim' },
            { id: 'c', text: 'Compile error: Duck inherits unrelated defaults for move()' },
            { id: 'd', text: 'Runtime AbstractMethodError' },
          ],
          correctOptionId: 'c',
          expectCompileError: true,
          explanation: 'Neither interface is more specific, so Duck must override move() and may delegate with Walker.super.move().',
        },
        {
          id: 'o3-c2',
          kind: 'multi-select',
          dimension: 'conceptual',
          prompt: 'Since Java 9, which of these can an interface declare? Select all that apply.',
          options: [
            { id: 'a', text: 'Abstract methods' },
            { id: 'b', text: 'Default methods' },
            { id: 'c', text: 'Private helper methods' },
            { id: 'd', text: 'Mutable instance fields' },
            { id: 'e', text: 'Static methods' },
            { id: 'f', text: 'Constructors' },
          ],
          correctOptionIds: ['a', 'b', 'c', 'e'],
          explanation: 'Interfaces have no instance state and no constructors. Fields in interfaces are constants.',
        },
        {
          id: 'o3-c3',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'Several report generators share a database connection field and a fixed sequence (load → transform → render), differing only in transform. What fits best?',
          options: [
            { id: 'a', text: 'An interface with three default methods' },
            { id: 'b', text: 'An abstract class with the shared field, a final template method and an abstract transform step' },
            { id: 'c', text: 'A sealed interface' },
            { id: 'd', text: 'A utility class with static methods' },
          ],
          correctOptionId: 'b',
          explanation: 'Shared state plus a fixed algorithm skeleton is the template method pattern, which needs an abstract class.',
        },
        {
          id: 'o3-c4',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this print?',
          code: `interface Greeter {
    default String greet() { return "Hello from interface"; }
}

class Person {
    public String greet() { return "Hello from class"; }
}

class Employee extends Person implements Greeter {
}

public class Main {
    public static void main(String[] args) {
        Greeter g = new Employee();
        System.out.println(g.greet());
    }
}`,
          options: [
            { id: 'a', text: 'Hello from interface' },
            { id: 'b', text: 'Hello from class' },
            { id: 'c', text: 'Compile error: conflicting methods' },
          ],
          correctOptionId: 'b',
          explanation: '"Classes win": a method inherited from a superclass takes priority over an interface default, even when called through the interface type.',
        },
      ],
      challengeIds: ['ch-shapes'],
      masteryCriteria: [
        'Justify abstract class vs interface for a given design.',
        'Apply the three default-method resolution rules.',
        'Model a closed domain with a sealed interface and records.',
      ],
      relatedLessonIds: ['o-inheritance', 't-modern-types', 'o-solid'],
      revision: [
        { id: 'r1', question: 'Abstract class vs interface — when do you pick each?', answer: 'Interface for a capability/contract with possibly many unrelated implementations and multiple inheritance of type. Abstract class when subclasses share state, constructors or a template algorithm.' },
        { id: 'r2', question: 'State the default-method conflict rules.', answer: 'Class methods win; the more specific interface wins; otherwise the class must override (optionally calling X.super.m()).' },
        { id: 'r3', question: 'What do sealed types give you with switch?', answer: 'Exhaustiveness checking: the compiler knows all permitted subtypes, so no default is needed and adding a variant breaks incomplete switches at compile time.' },
      ],
    },

    // -----------------------------------------------------------------------
    {
      id: 'o-object-contracts',
      moduleId: 'oop',
      title: 'equals, hashCode, toString and records',
      summary: 'The contracts every object must honour, why breaking them corrupts collections, and how records help.',
      estimatedMinutes: 35,
      difficulty: 'intermediate',
      prerequisites: ['o-classes-objects'],
      versionNotes: [{ feature: 'Records', since: 16 }],
      objectives: [
        'State the equals and hashCode contracts.',
        'Implement equals and hashCode correctly, or use a record.',
        'Explain how broken contracts break HashMap and HashSet.',
      ],
      plainEnglish: `By default two objects are "equal" only if they are the very same object. For value-like classes — a \`Money\` amount, a \`Point\` — you usually want two objects with the same data to count as equal. You do that by overriding \`equals\`.

If you override \`equals\`, you **must** also override \`hashCode\`, because hash-based collections use the hash code to decide where to look. **Records** (Java 16) generate both for you.`,
      technical: `### The equals contract (Object.equals)
- Reflexive: \`x.equals(x)\` is true.
- Symmetric: \`x.equals(y)\` ⇔ \`y.equals(x)\`.
- Transitive.
- Consistent: repeated calls return the same result while the objects are unchanged.
- \`x.equals(null)\` is false.

### The hashCode contract
Equal objects **must** have equal hash codes. Unequal objects may collide, but fewer collisions mean faster hash tables. A HashSet first finds the bucket with \`hashCode\`, then compares with \`equals\`, so if equal objects produce different hashes they land in different buckets and are never compared — duplicates appear and lookups fail.

### Writing them
Compare the class (\`getClass() != o.getClass()\` for strict equality, or a \`final\` class with \`instanceof\`), then the significant fields with \`Objects.equals\`/\`==\` for primitives. Use \`Objects.hash(a, b)\` (simple) or a manual \`31 * h + ...\` (faster). The parameter type must be \`Object\` — \`equals(Point p)\` is an overload, not an override.

### Mutable keys
If fields used by \`hashCode\` change after an object is put in a HashMap/HashSet, the entry is stuck in the wrong bucket: \`contains\` returns false and \`remove\` silently fails. Keys should be immutable.

### Records
\`record Money(long cents, String currency) {}\` creates a final class with private final fields, a canonical constructor, accessors (\`cents()\`), and value-based \`equals\`, \`hashCode\` and \`toString\`. A compact constructor validates or normalises: \`record Money { Money { Objects.requireNonNull(currency); } }\`. Records are shallowly immutable: a record holding a \`List\` should copy it (\`List.copyOf\`).`,
      whyItExists: `Collections, caches and deduplication all depend on a consistent notion of equality. Records exist because hand-written value classes were verbose and frequently got equals/hashCode subtly wrong.`,
      whenToUse: [
        'Override equals/hashCode for value objects (money, coordinates, identifiers).',
        'Use records for immutable data carriers and DTOs.',
        'Override toString for anything that appears in logs or test failures.',
      ],
      whenNotToUse: [
        'Do not base equals on mutable fields of objects that live in hash collections.',
        'Do not override equals for entities that represent identity (e.g. a JPA entity) without care — compare stable identifiers.',
        'Do not use records when you need mutable state or inheritance.',
      ],
      examples: [
        {
          id: 'broken-hash',
          title: 'equals without hashCode breaks HashSet',
          runnable: true,
          code: `import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

class BadPoint {
    final int x, y;
    BadPoint(int x, int y) { this.x = x; this.y = y; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof BadPoint p)) return false;
        return x == p.x && y == p.y;
    }
    // hashCode NOT overridden: identity hash codes differ
}

record GoodPoint(int x, int y) {}

public class Main {
    public static void main(String[] args) {
        Set<BadPoint> bad = new HashSet<>();
        bad.add(new BadPoint(1, 2));
        bad.add(new BadPoint(1, 2));

        Set<GoodPoint> good = new HashSet<>();
        good.add(new GoodPoint(1, 2));
        good.add(new GoodPoint(1, 2));

        System.out.println("BadPoint set size:  " + bad.size());
        System.out.println("GoodPoint set size: " + good.size());
        System.out.println("equals? " + new BadPoint(1, 2).equals(new BadPoint(1, 2)));
        System.out.println(new GoodPoint(1, 2));
        System.out.println(Objects.hash(1, 2) == new GoodPoint(1, 2).hashCode());
    }
}`,
          expectedOutput: `BadPoint set size:  2
GoodPoint set size: 1
equals? true
GoodPoint[x=1, y=2]
false`,
          explanation:
            'The last line shows that a record\'s hashCode is not specified to equal Objects.hash of its components — only to be consistent with equals. Never depend on exact hash values.',
        },
        {
          id: 'mutable-key',
          title: 'A mutable key gets lost',
          runnable: true,
          code: `import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

class Tag {
    String name;
    Tag(String name) { this.name = name; }
    @Override public boolean equals(Object o) { return o instanceof Tag t && Objects.equals(name, t.name); }
    @Override public int hashCode() { return Objects.hashCode(name); }
}

public class Main {
    public static void main(String[] args) {
        Set<Tag> tags = new HashSet<>();
        Tag java = new Tag("java");
        tags.add(java);
        java.name = "kotlin";                // mutate a key that is already in the set
        System.out.println(tags.contains(java));
        System.out.println(tags.remove(java));
        System.out.println(tags.size());
    }
}`,
          expectedOutput: `false
false
1`,
        },
      ],
      walkthrough: {
        exampleId: 'broken-hash',
        steps: [
          { lines: [9, 14], text: 'equals is overridden correctly, using a pattern-matching instanceof to test and cast in one step.' },
          { lines: [15, 15], text: 'hashCode is inherited from Object, so two equal BadPoints almost certainly get different hash codes.' },
          { lines: [22, 24], text: 'HashSet uses hashCode to choose a bucket. The second BadPoint lands in a different bucket, equals is never consulted, and the set keeps both.' },
          { lines: [17, 17], text: 'A record generates equals and hashCode from its components, consistently.' },
          { lines: [26, 28], text: 'The duplicate GoodPoint hashes to the same bucket, equals returns true, and the set keeps one.' },
        ],
      },
      realWorld: {
        title: 'A cache that never hit',
        scenario: `A pricing service cached quotes in a \`HashMap<QuoteKey, Quote>\`. \`QuoteKey\` overrode \`equals\` but not \`hashCode\`, so every request built a "new" key that hashed differently. The cache grew without bound, the hit rate was zero and the service eventually ran out of memory.

Converting \`QuoteKey\` to a record fixed both problems at once. A unit test that puts a key, builds an equal key and asserts \`map.get(equalKey) != null\` now guards the contract.`,
      },
      commonMistakes: [
        {
          mistake: 'Overriding equals but not hashCode.',
          why: 'Equal objects then usually have different hashes, which breaks every hash-based collection.',
          fix: 'Always override both — or use a record.',
        },
        {
          mistake: 'Declaring `public boolean equals(Point other)`.',
          why: 'That overloads equals; collections call equals(Object) and never see it.',
          fix: 'Use `equals(Object o)` with @Override.',
        },
        {
          mistake: 'Mutating an object while it is a key in a HashMap or element of a HashSet.',
          why: 'Its hash changes but it stays in the old bucket, so it can no longer be found or removed.',
          fix: 'Make keys immutable (records, final fields).',
        },
      ],
      checks: [
        {
          id: 'o4-c1',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'Which statement is required by the Object contract?',
          options: [
            { id: 'a', text: 'Objects with equal hash codes must be equal' },
            { id: 'b', text: 'Equal objects must have equal hash codes' },
            { id: 'c', text: 'Unequal objects must have different hash codes' },
            { id: 'd', text: 'hashCode must return the memory address' },
          ],
          correctOptionId: 'b',
          explanation: 'Collisions between unequal objects are allowed. Equal objects having different hashes is what breaks hash collections.',
        },
        {
          id: 'o4-c2',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this print?',
          code: `import java.util.ArrayList;
import java.util.List;

class Isbn {
    final String value;
    Isbn(String value) { this.value = value; }

    public boolean equals(Isbn other) {
        return other != null && value.equals(other.value);
    }
}

public class Main {
    public static void main(String[] args) {
        List<Isbn> list = new ArrayList<>();
        list.add(new Isbn("978-0134685991"));
        Isbn probe = new Isbn("978-0134685991");
        System.out.println(probe.equals(list.get(0)) + " " + list.contains(probe));
    }
}`,
          options: [
            { id: 'a', text: 'true true' },
            { id: 'b', text: 'true false' },
            { id: 'c', text: 'false false' },
            { id: 'd', text: 'false true' },
          ],
          correctOptionId: 'b',
          explanation:
            'equals(Isbn) is an overload. Calling it directly with an Isbn argument picks it (true), but ArrayList.contains calls equals(Object), which is still Object\'s identity check (false).',
          hints: ['Which method does ArrayList.contains call — equals(Object) or equals(Isbn)?'],
        },
        {
          id: 'o4-c3',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this print?',
          code: `import java.util.List;

record Order(String id, List<String> items) {}

public class Main {
    public static void main(String[] args) {
        Order a = new Order("A1", List.of("pen"));
        Order b = new Order("A1", List.of("pen"));
        System.out.println(a.equals(b) + " " + (a == b) + " " + a);
    }
}`,
          options: [
            { id: 'a', text: 'true false Order[id=A1, items=[pen]]' },
            { id: 'b', text: 'false false Order@1b6d3586' },
            { id: 'c', text: 'true true Order[id=A1, items=[pen]]' },
            { id: 'd', text: 'true false Order{id=A1, items=[pen]}' },
          ],
          correctOptionId: 'a',
          explanation: 'Records compare components with equals (List.of lists are equal by content) and print as Name[component=value, ...].',
        },
        {
          id: 'o4-c4',
          kind: 'mcq',
          dimension: 'debugging',
          prompt: 'After changing a field of an object stored in a HashSet, `set.contains(obj)` returns false but iterating the set shows the object. Why?',
          options: [
            { id: 'a', text: 'HashSet is not thread-safe' },
            { id: 'b', text: 'The field is used in hashCode, so the object now hashes to a different bucket than the one it is stored in' },
            { id: 'c', text: 'contains uses == instead of equals' },
            { id: 'd', text: 'The set was resized' },
          ],
          correctOptionId: 'b',
          explanation: 'Lookups go to the bucket for the new hash, but the entry still sits in the bucket for the old hash.',
        },
      ],
      challengeIds: ['ch-money-key'],
      masteryCriteria: [
        'Recite the equals/hashCode contracts and the consequences of breaking them.',
        'Write a correct equals/hashCode pair or choose a record.',
        'Diagnose the mutable-key and overloaded-equals bugs.',
      ],
      relatedLessonIds: ['c-hashmap', 'o-classes-objects'],
      revision: [
        { id: 'r1', question: 'Why must equal objects have equal hash codes?', answer: 'Hash collections locate the bucket with hashCode and only then use equals. Different hashes for equal objects send them to different buckets, causing duplicates and failed lookups.' },
        { id: 'r2', question: 'What does a record generate?', answer: 'A final class with private final fields, a canonical constructor, accessor methods, and value-based equals, hashCode and toString.' },
        { id: 'r3', question: 'What goes wrong if a HashMap key is mutated?', answer: 'Its hash changes while it stays in the old bucket, so get/containsKey/remove can no longer find it.' },
      ],
    },

    // -----------------------------------------------------------------------
    {
      id: 'o-solid',
      moduleId: 'oop',
      title: 'SOLID principles and composition',
      summary: 'Five design principles in practical Java terms, with the trade-offs that matter in real code.',
      estimatedMinutes: 40,
      difficulty: 'intermediate',
      prerequisites: ['o-interfaces'],
      objectives: [
        'Explain each SOLID principle with a Java example.',
        'Recognise violations in code and propose a refactoring.',
        'Prefer composition and dependency injection where they reduce coupling.',
      ],
      plainEnglish: `SOLID is five guidelines for code that is easy to change:

- **S**ingle Responsibility: a class should have one reason to change.
- **O**pen/Closed: add new behaviour by adding code, not by editing working code.
- **L**iskov Substitution: a subclass must work anywhere its parent is expected.
- **I**nterface Segregation: many small, focused interfaces beat one huge one.
- **D**ependency Inversion: depend on abstractions (interfaces), not concrete details.

They are guidelines, not laws: applying them blindly creates needless layers.`,
      technical: `### Single Responsibility (SRP)
"Reason to change" means a stakeholder or concern. An \`InvoiceService\` that calculates totals, formats PDFs and sends emails changes for finance, design and infrastructure reasons. Split it into \`InvoiceCalculator\`, \`InvoiceRenderer\`, \`InvoiceMailer\`.

### Open/Closed (OCP)
Use polymorphism to make the variable part pluggable. A list of \`DiscountRule\` implementations lets you add a "loyalty discount" without editing the calculator. Don't pre-abstract everything — introduce the seam when variation actually appears.

### Liskov Substitution (LSP)
Subtypes must honour the parent's contract: no stronger preconditions, no weaker postconditions, no new exceptions callers do not expect. The classic violation: \`Square extends Rectangle\` breaks code that sets width and height independently.

### Interface Segregation (ISP)
Clients should not depend on methods they do not use. Split \`Repository\` with 30 methods into \`OrderReader\` and \`OrderWriter\`; read-only code then cannot accidentally write.

### Dependency Inversion (DIP)
High-level policy depends on an interface it owns (\`PaymentGateway\`); low-level details (\`StripeGateway\`) implement it. Pass dependencies through the **constructor** (dependency injection). This makes code testable with fakes and lets frameworks like Spring wire implementations.

### Composition over inheritance
Inheritance couples a subclass to its parent's implementation (the "fragile base class" problem). Composition — holding a collaborator and delegating — gives the same reuse with looser coupling and runtime flexibility.`,
      whyItExists: `Most software cost is in changing existing code. These principles reduce the blast radius of change: fewer classes are touched per feature, and behaviour can be tested and replaced in isolation.`,
      whenToUse: [
        'Apply SRP when a class keeps changing for unrelated reasons or is hard to name.',
        'Introduce an interface (DIP/OCP) when you need a second implementation or a test seam.',
        'Use constructor injection for required collaborators.',
      ],
      whenNotToUse: [
        'Do not create an interface for every class with only one implementation and no test need.',
        'Do not split a cohesive 80-line class into five classes to satisfy a rule.',
        'Do not apply patterns speculatively; YAGNI ("you aren\'t gonna need it") balances SOLID.',
      ],
      examples: [
        {
          id: 'ocp-dip',
          title: 'Open/Closed and Dependency Inversion together',
          runnable: true,
          code: `import java.util.List;

interface DiscountRule {
    long discountCents(long subtotalCents, int items);
}

class BulkDiscount implements DiscountRule {
    public long discountCents(long subtotal, int items) {
        return items >= 10 ? subtotal / 10 : 0;          // 10% off for 10+ items
    }
}

class CouponDiscount implements DiscountRule {
    private final long amount;
    CouponDiscount(long amount) { this.amount = amount; }
    public long discountCents(long subtotal, int items) {
        return Math.min(amount, subtotal);
    }
}

class PriceCalculator {
    private final List<DiscountRule> rules;

    PriceCalculator(List<DiscountRule> rules) {          // dependencies are injected
        this.rules = List.copyOf(rules);
    }

    long total(long unitCents, int items) {
        long subtotal = unitCents * items;
        long discount = 0;
        for (DiscountRule rule : rules) discount += rule.discountCents(subtotal, items);
        return Math.max(0, subtotal - discount);
    }
}

public class Main {
    public static void main(String[] args) {
        PriceCalculator plain = new PriceCalculator(List.of());
        PriceCalculator promo = new PriceCalculator(List.of(new BulkDiscount(), new CouponDiscount(500)));
        System.out.println(plain.total(1_000, 12));
        System.out.println(promo.total(1_000, 12));
        System.out.println(promo.total(300, 1));
    }
}`,
          expectedOutput: `12000
10300
0`,
        },
        {
          id: 'lsp',
          title: 'Square extends Rectangle violates LSP',
          runnable: true,
          code: `class Rectangle {
    protected int width, height;
    void setWidth(int w) { width = w; }
    void setHeight(int h) { height = h; }
    int area() { return width * height; }
}

class Square extends Rectangle {
    @Override void setWidth(int w) { width = w; height = w; }
    @Override void setHeight(int h) { width = h; height = h; }
}

public class Main {
    static int resizeAndMeasure(Rectangle r) {
        r.setWidth(5);
        r.setHeight(4);
        return r.area();            // caller reasonably expects 20
    }

    public static void main(String[] args) {
        System.out.println(resizeAndMeasure(new Rectangle()));
        System.out.println(resizeAndMeasure(new Square()));
    }
}`,
          expectedOutput: `20
16`,
          explanation: 'Square changes the meaning of setWidth/setHeight, so it cannot be substituted for Rectangle. Model them as separate immutable shapes instead.',
        },
      ],
      walkthrough: {
        exampleId: 'ocp-dip',
        steps: [
          { lines: [3, 5], text: 'A small interface owned by the pricing policy: the abstraction that high-level code depends on (DIP).' },
          { lines: [7, 19], text: 'Each discount is a separate class. Adding a new discount means adding a class, not editing PriceCalculator (OCP).' },
          { lines: [21, 27], text: 'Collaborators arrive through the constructor (dependency injection) and are copied into an immutable list.' },
          { lines: [29, 34], text: 'The calculator only knows the interface. It never changes when discount policies change (SRP).' },
          { lines: [40, 42], text: '12 × 1000 = 12000; with 10% bulk (1200) and a 500 coupon the total is 10300; a coupon larger than the subtotal clamps to 0.' },
        ],
      },
      realWorld: {
        title: 'Testing a service that sent real emails',
        scenario: `An \`OrderService\` created \`new SmtpMailer()\` inside its constructor. Unit tests either sent real emails or could not run without an SMTP server, so the team stopped writing tests for order flows.

Introducing a \`Notifier\` interface and injecting it through the constructor let tests pass an in-memory fake that records messages. The production wiring (Spring) supplies the SMTP implementation. Test coverage for order flows went from almost none to complete within a sprint.`,
      },
      commonMistakes: [
        {
          mistake: 'Treating SRP as "one method per class".',
          why: 'Responsibility is about reasons to change, not size.',
          fix: 'Group code that changes together; split code that changes for different stakeholders.',
        },
        {
          mistake: 'Creating dependencies with `new` deep inside business logic.',
          why: 'It hard-wires implementations and makes testing impossible without the real dependency.',
          fix: 'Inject collaborators through the constructor.',
        },
        {
          mistake: 'Subclassing to "reuse" a few methods and overriding others to throw UnsupportedOperationException.',
          why: 'That breaks substitutability (LSP).',
          fix: 'Compose instead, or split the interface (ISP).',
        },
      ],
      checks: [
        {
          id: 'o5-c1',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: '`ReportService` loads data from SQL, computes statistics, renders HTML and uploads to S3. Which principle does it violate most directly?',
          options: [
            { id: 'a', text: 'Liskov Substitution' },
            { id: 'b', text: 'Single Responsibility' },
            { id: 'c', text: 'Interface Segregation' },
            { id: 'd', text: 'None — it is cohesive' },
          ],
          correctOptionId: 'b',
          explanation: 'Data access, statistics, presentation and storage change for different reasons and should be separate collaborators.',
        },
        {
          id: 'o5-c2',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'A `ReadOnlyList extends ArrayList` overrides add() to throw UnsupportedOperationException. Which principle is at risk?',
          options: [
            { id: 'a', text: 'Open/Closed' },
            { id: 'b', text: 'Liskov Substitution' },
            { id: 'c', text: 'Dependency Inversion' },
            { id: 'd', text: 'Single Responsibility' },
          ],
          correctOptionId: 'b',
          explanation: 'Code written for ArrayList expects add() to work. The subtype weakens the parent\'s contract.',
        },
        {
          id: 'o5-c3',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'What does Dependency Inversion recommend for `CheckoutService` that needs to charge cards?',
          options: [
            { id: 'a', text: 'Call `new StripeClient()` inside checkout()' },
            { id: 'b', text: 'Depend on a `PaymentGateway` interface passed into the constructor' },
            { id: 'c', text: 'Make CheckoutService extend StripeClient' },
            { id: 'd', text: 'Use a static StripeClient singleton' },
          ],
          correctOptionId: 'b',
          explanation: 'High-level policy depends on an abstraction; the concrete gateway is supplied from outside, enabling substitution and testing.',
        },
        {
          id: 'o5-c4',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this print?',
          code: `import java.util.ArrayList;
import java.util.List;

class CountingList extends ArrayList<String> {
    int addCount = 0;

    @Override
    public boolean add(String s) {
        addCount++;
        return super.add(s);
    }

    @Override
    public boolean addAll(java.util.Collection<? extends String> c) {
        addCount += c.size();
        return super.addAll(c);
    }
}

public class Main {
    public static void main(String[] args) {
        CountingList list = new CountingList();
        list.addAll(List.of("a", "b", "c"));
        System.out.println(list.addCount);
    }
}`,
          options: [
            { id: 'a', text: '3' },
            { id: 'b', text: '6' },
            { id: 'c', text: '0' },
          ],
          correctOptionId: 'a',
          explanation:
            'In current JDKs ArrayList.addAll copies the array directly and does not call add(), so the count is 3. But this depends on an implementation detail: in other collections (e.g. HashSet extends AbstractCollection.addAll) addAll calls add and the count would double. That fragility is why composition is preferred over inheriting from concrete classes.',
          hints: ['Whether this is 3 or 6 depends on how the parent implements addAll — an implementation detail you should not depend on.'],
        },
      ],
      challengeIds: [],
      masteryCriteria: [
        'Name a concrete violation and refactoring for each SOLID principle.',
        'Refactor a class to use constructor injection.',
        'Argue when NOT to add an abstraction.',
      ],
      relatedLessonIds: ['o-interfaces', 'o-inheritance'],
      revision: [
        { id: 'r1', question: 'State the five SOLID principles in one line each.', answer: 'SRP: one reason to change. OCP: extend without modifying. LSP: subtypes substitutable for base types. ISP: small client-specific interfaces. DIP: depend on abstractions; inject details.' },
        { id: 'r2', question: 'Why does Square extends Rectangle violate LSP?', answer: 'Square changes the behaviour of setWidth/setHeight, so code relying on independent width and height breaks when given a Square.' },
        { id: 'r3', question: 'Why prefer composition over inheritance?', answer: 'Inheritance couples subclasses to the parent\'s implementation (fragile base class); composition reuses behaviour through a narrower interface and can be swapped at runtime.' },
      ],
    },
  ],
};
