import type { CurriculumModule } from '@/types/curriculum';

export const designModule: CurriculumModule = {
  id: 'design',
  order: 13,
  title: 'Design Principles and Design Patterns',
  shortTitle: 'Design Patterns',
  summary: 'SOLID applied to real refactorings, composition over inheritance, and the creational, structural and behavioural patterns that still matter in modern Java — plus when they hurt.',
  level: 'advanced',
  prerequisites: ['oop', 'functional'],
  bossChallengeId: 'boss-text-pipeline',
  lessons: [
    {
      id: 'd-solid',
      moduleId: 'design',
      title: 'SOLID in practice and composition over inheritance',
      summary: 'Refactoring a do-everything class with SRP and DIP, spotting LSP and ISP violations, and why composition beats inheritance for reuse.',
      estimatedMinutes: 40,
      difficulty: 'advanced',
      prerequisites: ['o-solid', 'o-inheritance', 'o-interfaces'],
      versionNotes: [
        { feature: 'Sealed classes and interfaces', since: 17, note: 'A closed hierarchy plus pattern-matching switch is a deliberate alternative to open extension' },
        { feature: 'Pattern matching for switch', since: 21 },
      ],
      objectives: [
        'Split a class with several responsibilities into collaborators wired through constructor injection.',
        'Recognise Open/Closed, Liskov and Interface Segregation violations in real code and fix them.',
        'Explain the fragile base class problem and replace inheritance with composition and delegation.',
        'Balance SOLID against YAGNI and know when sealed types are a better fit than open extension.',
      ],
      plainEnglish: `The OOP module introduced the five SOLID principles. This lesson applies them to code you are likely to meet: a class that parses, validates and saves all at once; a subclass that breaks its parent's promises; a base class whose internals leak into its children.

The common thread is **managing change**. Each principle reduces how much code you must touch — and re-test — when one requirement changes. And the most practical rule of all is older than SOLID: **favour composition over inheritance**. Build objects out of smaller objects you hold and delegate to, instead of inheriting behaviour from a parent you do not control.`,
      technical: `### SRP: one reason to change
Group code by the actor that requests changes. A \`CustomerImporter\` that parses CSV, validates emails and writes to the database changes when the file format, the validation rules or the storage changes. Extract \`CustomerParser\`, \`CustomerValidator\` and \`CustomerStore\`; the importer becomes a short **policy** that orchestrates them. Smells: a class name ending in Manager/Helper/Util, many unrelated imports, tests that need ten collaborators.

### OCP: extend by adding code
A growing \`if/else\` or \`switch\` on a type code that you must edit for every new variant violates OCP. Replace it with polymorphism or a registry (\`Map<String, Strategy>\`). Modern nuance: when the set of variants is **closed and known** (e.g. \`sealed interface Shape permits Circle, Square\`), a pattern-matching \`switch\` without \`default\` is fine — the compiler forces every switch to be updated when a variant is added. Use open extension for plug-ins, sealed types for closed domain models.

### LSP: subtypes keep the contract
A subtype may **accept more** (weaker preconditions) and **promise more** (stronger postconditions), never the reverse; it must not throw new kinds of exceptions or break invariants. The JDK itself bends this: \`List.of(...)\` returns a \`List\` whose \`add\` throws \`UnsupportedOperationException\` — "optional operations" are documented in the contract, but code that silently assumes mutability breaks. Design methods so they do not mutate their inputs, or accept narrower types.

### ISP: small client-specific interfaces
A 25-method \`AccountService\` forces every implementation and every test double to deal with all 25. Split by client: \`BalanceQuery\`, \`TransferCommand\`, \`StatementExporter\`. A class can implement several; a client depends only on what it calls. Functional interfaces are the extreme case: one method, lambda-friendly.

### DIP: policy owns the abstraction
The high-level module defines the interface it needs (\`CustomerStore\` lives next to \`CustomerImporter\`), and low-level modules (JDBC, HTTP, files) implement it. Dependencies point **towards** the policy, so the business logic compiles and tests without any infrastructure. Constructor injection wires it together — by hand in \`main\`, or by a container such as Spring.

### Composition over inheritance
Inheritance is white-box reuse: a subclass depends on **how** its parent is implemented, not just on what it promises. If the parent calls its own overridable methods ("self-use"), overriding one changes the behaviour of others — the **fragile base class** problem (Effective Java, "Favor composition over inheritance"). Composition is black-box reuse: wrap an instance, implement the same interface, forward calls, and add behaviour around them. Use inheritance only for genuine is-a relationships within code you control, or classes explicitly designed and documented for extension.`,
      whyItExists: `Requirements change constantly, and most of the cost of software is in modifying it. These principles localise change: new behaviour arrives as new classes, collaborators can be swapped for fakes in tests, and a change to one concern does not ripple into unrelated code.`,
      whenToUse: [
        'Apply SRP when a class is hard to name, hard to test or changes for unrelated reasons.',
        'Introduce an abstraction (OCP/DIP) when a second implementation or a test double is actually needed.',
        'Prefer composition whenever you want to reuse a class you do not own or that was not designed for extension.',
        'Use sealed types when the set of variants is part of the domain and should be exhaustive.',
      ],
      whenNotToUse: [
        'Do not add interfaces "just in case" for classes with one implementation and no test seam needed.',
        'Do not fragment cohesive logic into many tiny classes to satisfy SRP mechanically.',
        'Do not extend concrete JDK classes such as HashMap or ArrayList to add behaviour; wrap them.',
      ],
      examples: [
        {
          id: 'srp-dip-importer',
          title: 'SRP and DIP: an importer that only orchestrates',
          runnable: true,
          code: `import java.util.*;

record Customer(String email, String name) {}

interface CustomerParser { Customer parse(String line); }
interface CustomerValidator { List<String> problems(Customer c); }
interface CustomerStore { void save(Customer c); int count(); }

class CsvCustomerParser implements CustomerParser {
    public Customer parse(String line) {
        String[] parts = line.split(",", -1);
        if (parts.length != 2) throw new IllegalArgumentException("expected 2 fields: " + line);
        return new Customer(parts[0].trim().toLowerCase(), parts[1].trim());
    }
}

class BasicValidator implements CustomerValidator {
    public List<String> problems(Customer c) {
        List<String> problems = new ArrayList<>();
        if (!c.email().contains("@")) problems.add("bad email " + c.email());
        if (c.name().isBlank()) problems.add("missing name");
        return problems;
    }
}

class InMemoryStore implements CustomerStore {
    private final Map<String, Customer> byEmail = new LinkedHashMap<>();
    public void save(Customer c) { byEmail.put(c.email(), c); }
    public int count() { return byEmail.size(); }
}

// High-level policy: knows the steps, not the details
class CustomerImporter {
    private final CustomerParser parser;
    private final CustomerValidator validator;
    private final CustomerStore store;

    CustomerImporter(CustomerParser parser, CustomerValidator validator, CustomerStore store) {
        this.parser = parser;
        this.validator = validator;
        this.store = store;
    }

    List<String> importLines(List<String> lines) {
        List<String> report = new ArrayList<>();
        for (int i = 0; i < lines.size(); i++) {
            try {
                Customer c = parser.parse(lines.get(i));
                List<String> problems = validator.problems(c);
                if (problems.isEmpty()) store.save(c);
                else report.add("line " + (i + 1) + ": " + String.join(", ", problems));
            } catch (IllegalArgumentException e) {
                report.add("line " + (i + 1) + ": " + e.getMessage());
            }
        }
        return report;
    }
}

public class Main {
    public static void main(String[] args) {
        CustomerStore store = new InMemoryStore();
        CustomerImporter importer = new CustomerImporter(new CsvCustomerParser(), new BasicValidator(), store);
        List<String> report = importer.importLines(List.of(
            "Ada@Example.com, Ada Lovelace",
            "not-an-email, ",
            "grace@example.com",
            "linus@example.com, Linus"));
        report.forEach(System.out::println);
        System.out.println("imported: " + store.count());
    }
}`,
          expectedOutput: `line 2: bad email not-an-email, missing name
line 3: expected 2 fields: grace@example.com
imported: 2`,
          explanation: 'Swapping CSV for JSON, adding a validation rule or storing in PostgreSQL each touches exactly one class. main is the composition root where the concrete pieces are wired together.',
        },
        {
          id: 'fragile-base-class',
          title: 'The fragile base class: inheritance vs composition',
          runnable: true,
          code: `import java.util.*;

// Inheritance: depends on HashSet's internal self-use of add()
class CountingHashSet<E> extends HashSet<E> {
    int attempts = 0;

    @Override public boolean add(E e) {
        attempts++;
        return super.add(e);
    }

    @Override public boolean addAll(Collection<? extends E> c) {
        attempts += c.size();
        return super.addAll(c);          // HashSet's addAll calls add() for each element
    }
}

// Composition: wraps any Set and forwards; no assumptions about its internals
class CountingSet<E> {
    private final Set<E> inner;
    int attempts = 0;

    CountingSet(Set<E> inner) { this.inner = inner; }

    boolean add(E e) {
        attempts++;
        return inner.add(e);
    }

    boolean addAll(Collection<? extends E> c) {
        attempts += c.size();
        return inner.addAll(c);          // inner calls its own add(), not ours
    }

    int size() { return inner.size(); }
}

public class Main {
    public static void main(String[] args) {
        List<String> words = List.of("a", "b", "c");

        CountingHashSet<String> inherited = new CountingHashSet<>();
        inherited.addAll(words);
        System.out.println("inheritance: " + inherited.attempts);

        CountingSet<String> composed = new CountingSet<>(new TreeSet<>());
        composed.addAll(words);
        System.out.println("composition: " + composed.attempts + " (size " + composed.size() + ")");
    }
}`,
          expectedOutput: `inheritance: 6
composition: 3 (size 3)`,
          explanation: 'The subclass counts every element twice because AbstractCollection.addAll (inherited by HashSet) calls the overridden add. That is an undocumented implementation detail which could change in any JDK release. The wrapper works with any Set implementation.',
        },
        {
          id: 'lsp-unmodifiable',
          title: 'An LSP trap in the JDK: unmodifiable lists',
          runnable: true,
          code: `import java.util.*;

public class Main {
    // This method's contract silently assumes a mutable list
    static void addDefaultTag(List<String> tags) {
        tags.add("new");
    }

    // Safer: never mutate inputs; return a new value
    static List<String> withDefaultTag(List<String> tags) {
        List<String> copy = new ArrayList<>(tags);
        copy.add("new");
        return List.copyOf(copy);
    }

    public static void main(String[] args) {
        List<String> mutable = new ArrayList<>(List.of("java"));
        addDefaultTag(mutable);
        System.out.println(mutable);

        try {
            addDefaultTag(List.of("java"));
        } catch (UnsupportedOperationException e) {
            System.out.println("List.of rejected add: " + e.getClass().getSimpleName());
        }
        System.out.println(withDefaultTag(List.of("java")));
    }
}`,
          expectedOutput: `[java, new]
List.of rejected add: UnsupportedOperationException
[java, new]`,
          explanation: 'Both lists are a List, but only one supports add. Java 21\'s SequencedCollection did not change this. The robust fix is on the caller side: do not mutate parameters.',
        },
      ],
      walkthrough: {
        exampleId: 'fragile-base-class',
        steps: [
          { lines: [3, 10], text: 'The subclass overrides add to count insert attempts, then delegates to HashSet.' },
          { lines: [12, 15], text: 'addAll adds the collection size and calls super.addAll — which, inside the JDK, loops and calls add() for each element. Dynamic dispatch sends those calls to our override.' },
          { lines: [18, 36], text: 'The composed version holds a Set and forwards to it. When inner.addAll calls add internally, it calls the inner set\'s own add, not ours, so nothing is counted twice.' },
          { lines: [42, 44], text: 'Adding three words reports 6 attempts: each element was counted once by addAll and again by the overridden add.' },
          { lines: [46, 48], text: 'The wrapper reports 3 and works unchanged with a TreeSet, HashSet or any other Set — black-box reuse.' },
        ],
      },
      realWorld: {
        title: 'The audit map that stopped auditing',
        scenario: `A team extended \`HashMap\` as \`AuditedMap\` and overrode \`put\` to log every change. Later, code started using \`putAll\`, \`merge\` and \`computeIfAbsent\` — which in HashMap do **not** call \`put\` — and those writes silently bypassed the audit log. Nobody noticed until a compliance review found gaps.

The fix was composition: a small \`AuditedSettings\` class holding a private \`Map\` and exposing only the four operations the application needed, each of which logged. The narrower interface (ISP) also made it impossible to bypass the audit through methods nobody had thought about.`,
      },
      commonMistakes: [
        {
          mistake: 'Extending a concrete collection or framework class to add a little behaviour.',
          why: 'Your subclass depends on undocumented self-use inside the parent and on every method the parent adds in future releases.',
          fix: 'Wrap an instance and forward (composition); expose only what clients need.',
        },
        {
          mistake: 'Calling overridable methods from a constructor.',
          why: 'The subclass override runs before the subclass\'s fields are initialised and sees nulls or zeros.',
          fix: 'Call only private, static or final methods from constructors, or use a static factory that completes initialisation.',
        },
        {
          mistake: 'Creating an interface for every class "for DIP".',
          why: 'Single-implementation interfaces with no test or variation need double the files and hide navigation without reducing coupling.',
          fix: 'Introduce the abstraction at real boundaries (I/O, external services) or when a second implementation appears.',
        },
        {
          mistake: 'Adding a default branch that throws to a switch over a sealed type.',
          why: 'The default silences the compiler\'s exhaustiveness check, so new variants fail at runtime instead of compile time.',
          fix: 'Omit default when switching over a sealed hierarchy with pattern matching.',
        },
      ],
      checks: [
        {
          id: 'dg1-c1',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'Which principle does this class violate most directly?',
          code: `class FeeCalculator {
    long fee(Account a) {
        if (a.type().equals("STUDENT")) return 0;
        else if (a.type().equals("STANDARD")) return 500;
        else if (a.type().equals("PREMIUM")) return 1500;
        throw new IllegalArgumentException(a.type());
    }
}`,
          options: [
            { id: 'a', text: 'Liskov Substitution' },
            { id: 'b', text: 'Open/Closed: every new account type requires editing this method' },
            { id: 'c', text: 'Interface Segregation' },
            { id: 'd', text: 'None; string comparison is the recommended approach' },
          ],
          correctOptionId: 'b',
          explanation: 'A registry of fee strategies or polymorphic account types removes the edit point. If account types are a closed set, a sealed hierarchy with an exhaustive switch is also acceptable — the compiler then finds every place to update.',
        },
        {
          id: 'dg1-c2',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'The base class calls an overridable method from its constructor. What is printed?',
          code: `class Base {
    Base() { describe(); }
    void describe() { System.out.println("base"); }
}

class Child extends Base {
    private String name = "child";

    @Override
    void describe() { System.out.println("name=" + name); }
}

public class Main {
    public static void main(String[] args) {
        new Child();
    }
}`,
          options: [
            { id: 'a', text: 'base' },
            { id: 'b', text: 'name=child' },
            { id: 'c', text: 'name=null' },
            { id: 'd', text: 'NullPointerException' },
          ],
          correctOptionId: 'c',
          explanation: 'The Base constructor runs before Child\'s field initialisers, but the call dispatches to Child.describe(), which sees the default value null. Concatenating null prints "null" rather than throwing. This is one way subclasses become fragile.',
        },
        {
          id: 'dg1-c3',
          kind: 'mcq',
          dimension: 'interview',
          prompt: 'Under the Dependency Inversion Principle, where should the `CustomerStore` interface used by `CustomerImporter` be defined?',
          options: [
            { id: 'a', text: 'In the JDBC module, next to the implementation' },
            { id: 'b', text: 'Next to the high-level policy (the importer) that needs it; infrastructure implements it' },
            { id: 'c', text: 'In a shared utils package used by everyone' },
            { id: 'd', text: 'It does not matter where interfaces live' },
          ],
          correctOptionId: 'b',
          explanation: 'The policy owns the abstraction, so source dependencies point from infrastructure towards business logic. The importer then compiles and tests without any database code.',
        },
        {
          id: 'dg1-c4',
          kind: 'multi-select',
          dimension: 'debugging',
          prompt: 'Which are signs that a class violates the Single Responsibility Principle? Select all that apply.',
          options: [
            { id: 'a', text: 'Its tests need a database, an SMTP server and a template engine' },
            { id: 'b', text: 'It is called OrderManager and has 40 public methods' },
            { id: 'c', text: 'It changed in the last month for a tax rule, a PDF layout tweak and a new email provider' },
            { id: 'd', text: 'It has exactly one public method' },
            { id: 'e', text: 'It is a record with three fields' },
          ],
          correctOptionIds: ['a', 'b', 'c'],
          explanation: 'Many unrelated collaborators, vague names and changes driven by different stakeholders all point to several responsibilities. Size alone is not the test; reasons to change are.',
        },
        {
          id: 'dg1-c5',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: '`Shipping.cost(int grams)` requires grams > 0. Which override in a subclass respects the Liskov Substitution Principle?',
          options: [
            { id: 'a', text: 'One that requires grams > 100' },
            { id: 'b', text: 'One that also accepts grams == 0 and returns 0' },
            { id: 'c', text: 'One that throws IOException for heavy parcels' },
            { id: 'd', text: 'One that returns negative costs for some inputs although the parent promises non-negative' },
          ],
          correctOptionId: 'b',
          explanation: 'Subtypes may weaken preconditions (accept more) and strengthen postconditions (promise more). Stronger preconditions, new checked exceptions and weaker guarantees break callers written against the parent.',
        },
        {
          id: 'dg1-c6',
          kind: 'mcq',
          dimension: 'coding',
          prompt: 'A reporting job only reads balances, but depends on `AccountService` with 25 methods including `transfer` and `close`. What does Interface Segregation suggest?',
          options: [
            { id: 'a', text: 'Make the unused methods throw UnsupportedOperationException' },
            { id: 'b', text: 'Define a small BalanceQuery interface that AccountService implements, and let the job depend only on it' },
            { id: 'c', text: 'Copy the balance code into the reporting job' },
            { id: 'd', text: 'Make AccountService abstract' },
          ],
          correctOptionId: 'b',
          explanation: 'The job can no longer call transfer by accident, and its tests need a one-method double (often a lambda) instead of a 25-method mock.',
        },
      ],
      challengeIds: ['ch-shipping-strategy'],
      masteryCriteria: [
        'Refactor a multi-responsibility class into a policy plus injected collaborators.',
        'Identify OCP, LSP and ISP violations in a code review and propose a fix.',
        'Explain the fragile base class problem with a concrete example and rewrite it using composition.',
        'Decide between open extension and a sealed hierarchy for a given domain.',
      ],
      relatedLessonIds: ['o-solid', 'o-inheritance', 'o-interfaces', 'd-patterns', 'ts-mocking'],
      revision: [
        { id: 'r1', question: 'What does "one reason to change" mean in SRP?', answer: 'A class should serve one actor or concern; changes requested by different stakeholders (finance, design, ops) should land in different classes.' },
        { id: 'r2', question: 'What is the fragile base class problem?', answer: 'A subclass depends on its parent\'s internal implementation (e.g. which methods call which), so a parent change or an override can break behaviour in unexpected ways.' },
        { id: 'r3', question: 'How may a subtype change preconditions and postconditions under LSP?', answer: 'It may weaken preconditions (accept more inputs) and strengthen postconditions (guarantee more), never the reverse.' },
        { id: 'r4', question: 'When is a switch over types acceptable despite OCP?', answer: 'When the type set is closed and sealed, so a pattern-matching switch without default is checked for exhaustiveness by the compiler.' },
      ],
    },
    {
      id: 'd-patterns',
      moduleId: 'design',
      title: 'Design patterns in modern Java',
      summary: 'Strategy with lambdas, static factories, Builder, Observer, Decorator, Adapter and the enum Singleton — and when patterns do more harm than good.',
      estimatedMinutes: 50,
      difficulty: 'advanced',
      prerequisites: ['d-solid', 'fn-lambdas'],
      versionNotes: [
        { feature: 'Lambdas make single-method strategies one-liners', since: 8 },
        { feature: 'Records remove most value-object boilerplate', since: 16 },
      ],
      objectives: [
        'Implement Strategy with functional interfaces, lambdas and enums.',
        'Choose between constructors, static factory methods and a Builder.',
        'Implement Observer, Decorator and Adapter and explain how they differ.',
        'Implement a Singleton as an enum and explain why most code should use dependency injection instead.',
        'Recognise pattern overuse.',
      ],
      plainEnglish: `A **design pattern** is a named, reusable solution to a problem that keeps coming up. Knowing the names lets a team say "wrap it in a decorator" instead of describing the whole structure.

Patterns are not goals. Many classic patterns from the 1994 "Gang of Four" book exist to work around missing language features — and modern Java has many of those features now (lambdas, records, enums, sealed types). A pattern earns its place only when it removes a real problem: duplicated conditionals, unreadable constructors, tight coupling to a third-party API.`,
      technical: `### Strategy (behavioural)
Encapsulate an interchangeable algorithm behind an interface. With a single-method (functional) interface, each strategy is a **lambda**; pick strategies from a \`Map<String, Strategy>\` or an **enum** whose constants implement the interface. JDK examples: \`Comparator\`, \`java.util.function.*\`. Removes \`if/else\` chains and satisfies Open/Closed.

### Static factory methods and Factory (creational)
\`List.of\`, \`Optional.of\`, \`Integer.valueOf\`, \`Path.of\`: named, can validate, can cache instances (Integer.valueOf caches -128..127), and can return a subtype or a different implementation. A **factory** class or method centralises "which implementation for this input" — e.g. turning a config token into the right object. Downside: static factories are not discoverable as constructors, so name them well (\`of\`, \`from\`, \`parse\`, \`newInstance\`).

### Builder (creational)
For objects with many optional parameters, telescoping constructors (\`new Request(url, null, null, 3, true)\`) are unreadable. A builder names each parameter, validates once in \`build()\`, and produces an immutable object. JDK: \`HttpRequest.newBuilder()\`, \`StringBuilder\`, \`Stream.builder()\`. For two or three required fields a record with a compact constructor is simpler.

### Observer (behavioural)
A subject keeps a list of listeners and notifies them of events; it knows only the listener interface. In modern Java a listener is often a \`Consumer<Event>\`. Pitfalls: listeners that are never removed leak memory; a listener that throws can stop the others; notification order is often relied on but rarely specified; listeners that modify the list during notification (iterate over a copy). Reactive and messaging systems (Flow, Kafka) are Observer at scale.

### Decorator (structural)
Implements the same interface as the object it wraps and adds behaviour before or after delegating — caching, logging, retries, metrics. Decorators stack in any order. JDK: \`BufferedReader(new InputStreamReader(...))\`, \`Collections.unmodifiableList\`, \`Collections.synchronizedMap\`. This is composition over inheritance applied systematically.

### Adapter (structural)
Converts one interface into the one clients expect, typically to use a third-party or legacy API behind your own port (\`SmsAdapter implements Notifier\`). JDK: \`Arrays.asList\` (array as List), \`InputStreamReader\` (bytes to characters). Adapter **changes** the interface; Decorator **keeps** it and adds behaviour.

### Singleton (creational)
Exactly one instance. The safest Java form is a single-constant **enum**: thread-safe initialisation by the class loader, serialization-safe and reflection-proof. But a singleton is global state: hidden dependencies, hard to replace in tests. In applications, prefer one instance created at startup and **injected** (Spring beans are singletons by default without the static access).

### When patterns hurt
- Speculative generality: a \`StrategyFactoryProvider\` for one algorithm.
- Indirection that hides a simple \`if\`; five classes where one function would do.
- Singletons as convenient global variables.
- Deep decorator stacks nobody can debug.
Apply a pattern when the second or third variation appears, and prefer the simplest language feature (lambda, record, enum, sealed type) that expresses it.`,
      whyItExists: `Patterns capture proven ways to keep variation isolated and code decoupled, and give teams a shared vocabulary. Modern Java absorbs many of them into the language, so knowing both the pattern and its lightweight modern form lets you recognise them in frameworks and choose the simplest implementation.`,
      whenToUse: [
        'Strategy: several interchangeable algorithms chosen at runtime.',
        'Builder: four or more parameters, several optional, or validation across fields.',
        'Decorator: cross-cutting behaviour (caching, retries, logging) around an interface.',
        'Adapter: isolating a third-party or legacy API behind your own interface.',
        'Observer: decoupling event producers from a varying set of consumers.',
      ],
      whenNotToUse: [
        'Do not use a Singleton to share mutable state; inject a single instance instead.',
        'Do not build a strategy hierarchy for a single algorithm.',
        'Do not write a Builder for a two-field value; use a record.',
        'Do not hide straightforward logic behind layers of factories and decorators.',
      ],
      examples: [
        {
          id: 'strategy-lambdas',
          title: 'Strategy with an enum and with lambdas',
          runnable: true,
          code: `import java.util.LinkedHashMap;
import java.util.Map;

public class Main {
    @FunctionalInterface
    interface PricingStrategy {
        long priceCents(long baseCents);
    }

    // A fixed, named set of strategies: enum constants implementing the interface
    enum Tier implements PricingStrategy {
        STANDARD { public long priceCents(long base) { return base; } },
        MEMBER   { public long priceCents(long base) { return base * 90 / 100; } },
        STAFF    { public long priceCents(long base) { return base / 2; } }
    }

    public static void main(String[] args) {
        // An open set of strategies: lambdas registered by name
        Map<String, PricingStrategy> promotions = new LinkedHashMap<>();
        promotions.put("none", base -> base);
        promotions.put("minus5", base -> Math.max(0, base - 500));
        promotions.put("blackFriday", base -> base * 70 / 100);

        long base = 4_000;
        for (Tier tier : Tier.values()) {
            System.out.println(tier + " " + tier.priceCents(base));
        }
        promotions.forEach((name, strategy) ->
            System.out.println(name + " " + strategy.priceCents(base)));

        PricingStrategy combined = b -> promotions.get("minus5").priceCents(Tier.MEMBER.priceCents(b));
        System.out.println("member+minus5 " + combined.priceCents(base));
    }
}`,
          expectedOutput: `STANDARD 4000
MEMBER 3600
STAFF 2000
none 4000
minus5 3500
blackFriday 2800
member+minus5 3100`,
          explanation: 'Adding a promotion is one map entry; no if/else to edit. Strategies compose because they share one interface.',
        },
        {
          id: 'builder-factory',
          title: 'Static factories and a validating Builder',
          runnable: true,
          code: `import java.time.Duration;
import java.util.*;

final class HttpCall {
    private final String method;
    private final String url;
    private final Map<String, String> headers;
    private final Duration timeout;

    private HttpCall(Builder b) {
        this.method = b.method;
        this.url = b.url;
        this.headers = Map.copyOf(b.headers);
        this.timeout = b.timeout;
    }

    // Static factories: named, validated, can hide the concrete construction
    static HttpCall get(String url) { return builder(url).build(); }
    static Builder builder(String url) { return new Builder(url); }

    @Override public String toString() {
        return method + " " + url + " headers=" + new TreeMap<>(headers) + " timeout=" + timeout.toSeconds() + "s";
    }

    static final class Builder {
        private final String url;
        private String method = "GET";
        private final Map<String, String> headers = new HashMap<>();
        private Duration timeout = Duration.ofSeconds(10);

        private Builder(String url) { this.url = Objects.requireNonNull(url); }

        Builder method(String method) { this.method = method; return this; }
        Builder header(String name, String value) { headers.put(name, value); return this; }
        Builder timeout(Duration timeout) { this.timeout = timeout; return this; }

        HttpCall build() {
            if (!url.startsWith("https://")) throw new IllegalStateException("https required: " + url);
            if (timeout.isNegative() || timeout.isZero()) throw new IllegalStateException("timeout must be positive");
            return new HttpCall(this);
        }
    }
}

public class Main {
    public static void main(String[] args) {
        System.out.println(HttpCall.get("https://api.example.com/health"));
        System.out.println(HttpCall.builder("https://api.example.com/orders")
            .method("POST")
            .header("Content-Type", "application/json")
            .header("Idempotency-Key", "abc-123")
            .timeout(Duration.ofSeconds(3))
            .build());
        try {
            HttpCall.builder("http://insecure.example.com").build();
        } catch (IllegalStateException e) {
            System.out.println("rejected: " + e.getMessage());
        }
    }
}`,
          expectedOutput: `GET https://api.example.com/health headers={} timeout=10s
POST https://api.example.com/orders headers={Content-Type=application/json, Idempotency-Key=abc-123} timeout=3s
rejected: https required: http://insecure.example.com`,
          explanation: 'The constructor is private, so every HttpCall passes through build() and its validation. Map.copyOf makes the result immutable even though the builder\'s map keeps changing.',
        },
        {
          id: 'decorator-adapter',
          title: 'Decorator and Adapter around one Notifier interface',
          runnable: true,
          code: `import java.util.*;

interface Notifier {
    void send(String user, String message);
}

class ConsoleNotifier implements Notifier {
    public void send(String user, String message) {
        System.out.println("to " + user + ": " + message);
    }
}

// Decorators: same interface, wrap another Notifier and add behaviour
class PrefixingNotifier implements Notifier {
    private final Notifier inner;
    private final String prefix;
    PrefixingNotifier(Notifier inner, String prefix) { this.inner = inner; this.prefix = prefix; }
    public void send(String user, String message) { inner.send(user, prefix + message); }
}

class DedupNotifier implements Notifier {
    private final Notifier inner;
    private final Set<String> seen = new HashSet<>();
    DedupNotifier(Notifier inner) { this.inner = inner; }
    public void send(String user, String message) {
        if (seen.add(user + "|" + message)) inner.send(user, message);
    }
}

// A third-party SMS client with an incompatible API
class LegacySmsClient {
    int transmit(String phoneNumber, String text) {
        System.out.println("SMS " + phoneNumber + " <" + text + ">");
        return 0;
    }
}

// Adapter: makes LegacySmsClient usable wherever a Notifier is expected
class SmsAdapter implements Notifier {
    private final LegacySmsClient client;
    private final Map<String, String> phoneBook;
    SmsAdapter(LegacySmsClient client, Map<String, String> phoneBook) { this.client = client; this.phoneBook = phoneBook; }
    public void send(String user, String message) {
        int status = client.transmit(phoneBook.get(user), message);
        if (status != 0) throw new IllegalStateException("SMS failed with status " + status);
    }
}

public class Main {
    public static void main(String[] args) {
        Notifier notifier = new DedupNotifier(new PrefixingNotifier(new ConsoleNotifier(), "[shop] "));
        notifier.send("ada", "order shipped");
        notifier.send("ada", "order shipped");
        notifier.send("bob", "order shipped");

        Notifier sms = new PrefixingNotifier(
            new SmsAdapter(new LegacySmsClient(), Map.of("ada", "+44 7700 900123")), "[shop] ");
        sms.send("ada", "out for delivery");
    }
}`,
          expectedOutput: `to ada: [shop] order shipped
to bob: [shop] order shipped
SMS +44 7700 900123 <[shop] out for delivery>`,
          explanation: 'The same PrefixingNotifier decorates both the console and the adapted SMS client — the adapter makes the legacy API look like any other Notifier.',
        },
        {
          id: 'observer-singleton',
          title: 'Observer with Consumer listeners, and an enum Singleton',
          runnable: true,
          code: `import java.util.*;
import java.util.function.Consumer;

record OrderPlaced(String orderId, long cents) {}

// Observer: the publisher knows only the listener type, not the listeners
class EventBus<E> {
    private final List<Consumer<? super E>> listeners = new ArrayList<>();

    Runnable subscribe(Consumer<? super E> listener) {
        listeners.add(listener);
        return () -> listeners.remove(listener);          // handle to unsubscribe
    }

    void publish(E event) {
        for (Consumer<? super E> l : List.copyOf(listeners)) l.accept(event);
    }
}

// Singleton: one instance, thread-safe initialisation, serialization-safe
enum Metrics {
    INSTANCE;

    private final Map<String, Integer> counters = new TreeMap<>();
    synchronized void increment(String name) { counters.merge(name, 1, Integer::sum); }
    synchronized String snapshot() { return counters.toString(); }
}

public class Main {
    public static void main(String[] args) {
        EventBus<OrderPlaced> bus = new EventBus<>();
        bus.subscribe(e -> System.out.println("email: receipt for " + e.orderId()));
        Runnable stopAudit = bus.subscribe(e -> System.out.println("audit: " + e));
        bus.subscribe(e -> Metrics.INSTANCE.increment("orders"));

        bus.publish(new OrderPlaced("o-1", 2_500));
        stopAudit.run();
        bus.publish(new OrderPlaced("o-2", 900));

        System.out.println("metrics: " + Metrics.INSTANCE.snapshot());
    }
}`,
          expectedOutput: `email: receipt for o-1
audit: OrderPlaced[orderId=o-1, cents=2500]
email: receipt for o-2
metrics: {orders=2}`,
          explanation: 'Returning an unsubscribe handle makes it easy to avoid the classic listener leak. Iterating over a copy lets listeners unsubscribe during notification.',
        },
      ],
      walkthrough: {
        exampleId: 'decorator-adapter',
        steps: [
          { lines: [3, 11], text: 'One small interface is the contract every notifier honours. ConsoleNotifier is the plain base implementation.' },
          { lines: [13, 19], text: 'PrefixingNotifier implements Notifier and holds another Notifier. It changes the message and delegates — the core shape of every decorator.' },
          { lines: [21, 28], text: 'DedupNotifier adds different behaviour (dropping repeats) with the same shape. Decorators are independent and can be stacked in any order.' },
          { lines: [30, 36], text: 'The legacy client has a different method name, different parameters and a status code instead of exceptions — it cannot be used where a Notifier is expected.' },
          { lines: [38, 47], text: 'The adapter implements Notifier, translates the user to a phone number, calls transmit and converts a bad status into an exception. Clients never see the legacy API.' },
          { lines: [51, 54], text: 'Stacking: Dedup wraps Prefixing wraps Console. The second identical message is dropped before it reaches the inner layers.' },
          { lines: [56, 58], text: 'The same decorator wraps the adapter, proving that adapted and native notifiers are interchangeable.' },
        ],
      },
      realWorld: {
        title: 'Retries, metrics and a vendor switch without touching business code',
        scenario: `A payments team defined its own \`PaymentGateway\` interface and wrote \`StripeGatewayAdapter\` around the vendor SDK. Over time they added \`RetryingGateway\` (retry idempotent calls with backoff), \`MeteredGateway\` (latency and error metrics) and \`CircuitBreakerGateway\` as decorators, assembled in one configuration class.

When the company added a second provider for some countries, they wrote \`AdyenGatewayAdapter\` and a \`RoutingGateway\` strategy that picked an adapter by country — no change to checkout code or its tests. Later, a code review rejected a proposed \`GatewayFactoryProviderSingleton\`: the existing constructor wiring already did the job, and a global singleton would have made tests share state.`,
      },
      commonMistakes: [
        {
          mistake: 'Using a classic lazy singleton with a static getInstance() and unsynchronised null check.',
          why: 'Two threads can create two instances; reflection and serialization can create more; tests cannot replace it.',
          fix: 'Use an enum singleton when you truly need one, and otherwise create one instance at startup and inject it.',
          code: `// Fragile
static Config instance;
static Config getInstance() { if (instance == null) instance = new Config(); return instance; }
// Robust
enum Config { INSTANCE; }`,
        },
        {
          mistake: 'Writing a class hierarchy for strategies that are one expression each.',
          why: 'Boilerplate obscures the actual rules.',
          fix: 'Use a functional interface with lambdas, or an enum when the set is fixed.',
        },
        {
          mistake: 'Forgetting to unsubscribe observers.',
          why: 'The subject keeps the listener (and everything it references) reachable: a memory leak and stale callbacks.',
          fix: 'Return an unsubscribe handle or AutoCloseable from subscribe, and call it when the listener\'s owner is done.',
        },
        {
          mistake: 'Letting a builder produce partially valid objects.',
          why: 'Without validation in build(), invalid combinations surface far away at runtime.',
          fix: 'Validate all cross-field rules in build() and make the built object immutable.',
        },
      ],
      checks: [
        {
          id: 'dg2-c1',
          kind: 'predict-output',
          dimension: 'coding',
          prompt: 'Function composition stacks behaviour like decorators. What is printed?',
          code: `import java.util.function.Function;
import java.util.function.UnaryOperator;

public class Main {
    public static void main(String[] args) {
        UnaryOperator<String> trim = String::trim;
        UnaryOperator<String> shout = s -> s.toUpperCase() + "!";
        UnaryOperator<String> brackets = s -> "[" + s + "]";
        Function<String, String> pipeline = brackets.andThen(shout).andThen(trim);
        System.out.println(pipeline.apply("  hi "));
    }
}`,
          options: [
            { id: 'a', text: '[HI]!' },
            { id: 'b', text: '[  HI ]!' },
            { id: 'c', text: '[HI!]' },
            { id: 'd', text: '[  hi ]' },
          ],
          correctOptionId: 'b',
          explanation: 'andThen applies left to right: brackets first ("[  hi ]"), then shout ("[  HI ]!"), then trim — which has nothing to remove because the spaces are now inside the brackets. Order matters in decorator chains.',
        },
        {
          id: 'dg2-c2',
          kind: 'mcq',
          dimension: 'interview',
          prompt: 'Why is a single-element enum the preferred way to implement a Singleton in Java?',
          options: [
            { id: 'a', text: 'Enums are faster than classes' },
            { id: 'b', text: 'The JVM guarantees one instance with thread-safe initialisation, and serialization and reflection cannot create another' },
            { id: 'c', text: 'Enums can be mocked more easily' },
            { id: 'd', text: 'Enums cannot have fields, so the singleton is stateless' },
          ],
          correctOptionId: 'b',
          explanation: 'Enum constants are created once during class initialisation, which the JVM synchronises. Reflection cannot instantiate enums and serialization resolves to the existing constant. Enums can have fields and methods.',
        },
        {
          id: 'dg2-c3',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: '`new BufferedReader(new InputStreamReader(System.in))` combines two patterns. Which ones?',
          options: [
            { id: 'a', text: 'InputStreamReader is an Adapter (bytes to characters); BufferedReader is a Decorator (adds buffering to any Reader)' },
            { id: 'b', text: 'Both are Singletons' },
            { id: 'c', text: 'Both are Builders' },
            { id: 'd', text: 'InputStreamReader is an Observer; BufferedReader is a Strategy' },
          ],
          correctOptionId: 'a',
          explanation: 'InputStreamReader converts the InputStream interface into the Reader interface (adapter). BufferedReader is a Reader that wraps another Reader and adds buffering and readLine (decorator).',
        },
        {
          id: 'dg2-c4',
          kind: 'mcq',
          dimension: 'coding',
          prompt: 'A `Report` has 2 required fields and 7 optional ones, some of which must be validated together. Which construction approach fits best?',
          options: [
            { id: 'a', text: 'Nine overloaded constructors' },
            { id: 'b', text: 'A public no-arg constructor and setters' },
            { id: 'c', text: 'A Builder whose constructor takes the required fields and whose build() validates and returns an immutable Report' },
            { id: 'd', text: 'A Singleton Report' },
          ],
          correctOptionId: 'c',
          explanation: 'Telescoping constructors are unreadable and setters allow half-built, mutable objects. A builder names each option and validates once.',
        },
        {
          id: 'dg2-c5',
          kind: 'multi-select',
          dimension: 'conceptual',
          prompt: 'Which are signs that a pattern is hurting rather than helping? Select all that apply.',
          options: [
            { id: 'a', text: 'A Strategy interface with exactly one implementation and no plan for more' },
            { id: 'b', text: 'A Singleton used so that any class can read and modify shared settings' },
            { id: 'c', text: 'An Adapter isolating a vendor SDK behind your own interface' },
            { id: 'd', text: 'Following a simple call requires stepping through four factories' },
            { id: 'e', text: 'A Builder for an object with 10 parameters' },
          ],
          correctOptionIds: ['a', 'b', 'd'],
          explanation: 'Speculative abstractions, global mutable state and needless indirection add cost without benefit. Adapters at vendor boundaries and builders for many parameters are textbook good uses.',
        },
        {
          id: 'dg2-c6',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'What is the key difference between an Adapter and a Decorator?',
          options: [
            { id: 'a', text: 'An Adapter converts one interface into another that clients expect; a Decorator keeps the same interface and adds behaviour' },
            { id: 'b', text: 'An Adapter always uses inheritance; a Decorator always uses static methods' },
            { id: 'c', text: 'Decorators can only wrap JDK classes' },
            { id: 'd', text: 'There is no difference; they are synonyms' },
          ],
          correctOptionId: 'a',
          explanation: 'Both wrap an object (composition), but for different reasons: the adapter changes the shape of the API, the decorator enriches it without changing it.',
        },
      ],
      challengeIds: ['ch-event-bus', 'boss-text-pipeline'],
      masteryCriteria: [
        'Implement Strategy, Builder, Decorator, Adapter and Observer from memory in modern Java.',
        'Name a JDK example of each pattern in the lesson.',
        'Explain why an enum Singleton is safest and why dependency injection is usually better still.',
        'Argue against an unnecessary pattern in a code review.',
      ],
      relatedLessonIds: ['d-solid', 'fn-lambdas', 'o-interfaces', 'e-resources', 'ts-mocking'],
      revision: [
        { id: 'r1', question: 'How do lambdas change the Strategy pattern?', answer: 'With a functional interface each strategy is a lambda or method reference, so no class per strategy is needed; strategies can be stored in maps and composed.' },
        { id: 'r2', question: 'Give three advantages of static factory methods over constructors.', answer: 'They have descriptive names, can return cached instances or subtypes, and can validate or choose the implementation before constructing.' },
        { id: 'r3', question: 'Decorator vs Adapter in one sentence.', answer: 'A decorator keeps the interface and adds behaviour; an adapter converts an incompatible interface into the expected one.' },
        { id: 'r4', question: 'What are the main risks of the Observer pattern?', answer: 'Listener leaks when subscribers are never removed, one failing listener affecting others, unspecified ordering, and modification of the listener list during notification.' },
      ],
    },
  ],
};
