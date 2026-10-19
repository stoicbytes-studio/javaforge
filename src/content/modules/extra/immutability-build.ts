import type { Lesson } from '@/types/curriculum';

/**
 * Extra lessons: immutability and object copying (module "oop") and
 * build tools (module "jvm-platform"). The coordinator appends them to their modules.
 */
export const immutabilityBuildLessons: Lesson[] = [
  // -------------------------------------------------------------------------
  {
    id: 'o-immutability',
    moduleId: 'oop',
    title: 'Immutability, defensive copies and object copying',
    summary: 'How to build objects that can never change, why that makes code safer and faster to reason about, and the right (and wrong) ways to copy objects.',
    estimatedMinutes: 40,
    difficulty: 'intermediate',
    prerequisites: ['o-object-contracts'],
    versionNotes: [
      { feature: 'List.of / Set.of / Map.of immutable factories', since: 9, note: 'JEP 269' },
      { feature: 'List.copyOf / Set.copyOf / Map.copyOf, Collectors.toUnmodifiableList', since: 10 },
      { feature: 'Records', since: 16, note: 'preview in 14-15, final in 16 (JEP 395)' },
      { feature: 'Stream.toList() returns an unmodifiable list', since: 16 },
    ],
    objectives: [
      'List the rules that make a class immutable and apply them to a class with a collection field.',
      'Explain why immutable objects are thread-safe, safe as hash keys and easy to cache.',
      'Distinguish an unmodifiable view (Collections.unmodifiableList) from an unmodifiable copy (List.copyOf).',
      'Explain shallow vs deep copy and why records are only shallowly immutable.',
      'Prefer copy constructors, static factories, builders and "withers" over Cloneable/clone().',
    ],
    plainEnglish: `An **immutable** object is one whose state can never change after it is built. \`String\`, \`Integer\`, \`LocalDate\` and \`BigDecimal\` all work this way: methods that look like they change the value (\`toUpperCase\`, \`plusDays\`, \`add\`) actually return a **new** object.

Why bother? An object that cannot change can be shared freely: between methods, between threads, as a key in a \`HashMap\`. Nobody can "pull the rug out" from under you.

The tricky part is fields that point to **mutable** things such as a \`List\` or an array. If you just store the caller's list, the caller can still change it later, and so can anyone you hand it to. The fix is a **defensive copy**: copy mutable data when it comes in, and never hand out something callers can modify.

Copying itself comes in two depths. A **shallow copy** copies the outer container but shares the elements; a **deep copy** copies the elements too.`,
    technical: `### The recipe for an immutable class
1. Make the class \`final\` (or give it only private constructors plus static factories) so no subclass can add mutable state or override methods.
2. Make every field \`private final\`.
3. Provide no setters or other mutators.
4. **Copy in:** defensively copy every mutable argument in the constructor (\`List.copyOf(list)\`, \`array.clone()\`, \`new Date(d.getTime())\`).
5. **Copy out:** never return a reference to internal mutable state. Return an unmodifiable collection, a copy, or immutable types in the first place.
6. Do not let \`this\` escape during construction (for example by registering a listener in the constructor).

Copy **before** validating, so a caller cannot change the data between your check and your copy (a time-of-check/time-of-use attack described in *Effective Java*).

### Why it pays off
- **Thread safety for free:** an immutable object needs no locks. The JLS (§17.5) also guarantees that properly constructed objects' \`final\` fields are visible to every thread without synchronisation.
- **Safe hash keys:** an object's \`hashCode\` cannot change while it sits in a \`HashSet\` or \`HashMap\`.
- **Caching and sharing:** \`Integer.valueOf\` caches small values and string literals are interned, precisely because nobody can modify them.
- **Failure atomicity:** an operation either produces a new valid object or throws; the old one is untouched.

The cost is allocation: each "change" creates a new object. Modern generational GCs make short-lived objects cheap, and for heavy step-by-step building there are mutable companions (\`StringBuilder\` for \`String\`, a builder for your own class).

### Unmodifiable view vs unmodifiable copy
- \`Collections.unmodifiableList(list)\` returns a **view**: writes through the view throw \`UnsupportedOperationException\`, but changes to the backing list show through.
- \`List.copyOf(list)\` (Java 10) returns an **independent** unmodifiable copy (and returns its argument unchanged if it already is one). It rejects \`null\` elements with \`NullPointerException\`, like \`List.of\`.

### Records are shallowly immutable
A record's fields are \`private final\` and it has no setters, but a \`List\` component is still the caller's list. Copy it in the compact constructor: \`record Basket(List<String> items) { Basket { items = List.copyOf(items); } }\`.

### Copying objects
- **Copy constructor / static factory** (\`new ArrayList<>(other)\`, \`Playlist.copyOf(p)\`): explicit, type-safe, works with \`final\` fields, and lets you decide per field how deep to copy. This is the recommended approach.
- **\`Cloneable\` / \`clone()\`**: \`Object.clone()\` makes a field-by-field (shallow) copy without calling a constructor. \`Cloneable\` has no \`clone\` method, \`clone()\` throws a checked exception, and it cannot assign \`final\` fields after the fact, so deep-copying a final field is impossible. Use it for arrays (\`int[].clone()\` is fine) and avoid it for your own classes.
- **Serialization round-trip**: deep copies anything \`Serializable\`, but is slow, fragile and a known security risk.

### Many fields: builders and withers
A constructor with eight parameters is unreadable and easy to call with arguments in the wrong order. A **builder** collects values step by step and creates the immutable object in one \`build()\` call that can validate the whole set. To change one field of an existing immutable object, add a **wither**: \`withOlives(true)\` returns a new object that differs in one component.`,
    whyItExists: `Shared mutable state is the root of a large class of bugs: aliasing ("why did my list change?"), data races between threads, and corrupted hash collections. Immutability removes the "mutable" half of that combination. Java's own core value types (String, the java.time API, BigDecimal) were designed immutable for exactly this reason, and records (Java 16) make the pattern concise.`,
    whenToUse: [
      'Value objects: money, coordinates, dates, ids, configuration, messages and events.',
      'Objects shared between threads or cached for reuse.',
      'Keys in HashMap/HashSet and elements of sorted collections.',
      'Public API return values: return List.copyOf or an unmodifiable list instead of your internal list.',
      'Builders when an immutable class has many fields or optional fields.',
    ],
    whenNotToUse: [
      'Objects that change constantly in a hot loop (pixel buffers, accumulators): use a mutable object confined to one thread, then publish an immutable snapshot.',
      'JPA/Hibernate entities, which the framework expects to mutate (use immutable DTOs or records around them instead).',
      'Do not reach for clone() or serialization to copy your own classes; write a copy constructor or static factory.',
      'Do not wrap with Collections.unmodifiableList and assume the data is frozen: the view still reflects changes to the original.',
    ],
    examples: [
      {
        id: 'o-immutability-team',
        title: 'Defensive copies in, read-only out, and a "with" method',
        runnable: true,
        code: `import java.util.ArrayList;
import java.util.List;

final class Team {
    private final String name;
    private final List<String> members;

    Team(String name, List<String> members) {
        this.name = name;
        this.members = List.copyOf(members);
    }

    String name() { return name; }
    List<String> members() { return members; }

    Team withMember(String member) {
        List<String> next = new ArrayList<>(members);
        next.add(member);
        return new Team(name, next);
    }
}

public class Main {
    public static void main(String[] args) {
        List<String> input = new ArrayList<>(List.of("Ana", "Ben"));
        Team team = new Team("Core", input);
        input.add("Mallory");
        System.out.println(team.name() + " " + team.members());

        try {
            team.members().add("Eve");
        } catch (UnsupportedOperationException e) {
            System.out.println("Blocked: " + e.getClass().getSimpleName());
        }

        Team bigger = team.withMember("Cleo");
        System.out.println(team.members() + " -> " + bigger.members());
    }
}`,
        expectedOutput: `Core [Ana, Ben]
Blocked: UnsupportedOperationException
[Ana, Ben] -> [Ana, Ben, Cleo]`,
        explanation: 'List.copyOf both copies the input (so the caller\'s later change is invisible) and makes the stored list unmodifiable (so the getter can return it directly). withMember builds a new Team instead of changing this one.',
      },
      {
        id: 'o-immutability-view-copy',
        title: 'Views, copies, shallow records and shared elements',
        runnable: true,
        code: `import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

record Basket(List<String> items) {}

public class Main {
    public static void main(String[] args) {
        List<String> source = new ArrayList<>(List.of("a", "b"));
        List<String> view = Collections.unmodifiableList(source);
        List<String> copy = List.copyOf(source);
        source.add("c");
        System.out.println("view=" + view + " copy=" + copy);

        Basket basket = new Basket(source);
        source.add("d");
        System.out.println("record sees " + basket.items().size() + " items");

        List<int[]> rows = new ArrayList<>();
        rows.add(new int[] {1, 2});
        List<int[]> shallow = new ArrayList<>(rows);
        shallow.get(0)[0] = 99;
        System.out.println("shared element: " + rows.get(0)[0]);
    }
}`,
        expectedOutput: `view=[a, b, c] copy=[a, b]
record sees 4 items
shared element: 99`,
        explanation: 'The view follows its backing list; the copy does not. The record stores the caller\'s list as-is, so it is only shallowly immutable. new ArrayList<>(rows) copies the list but shares the int[] elements, so a write through the copy is visible in the original.',
      },
      {
        id: 'o-immutability-clone',
        title: 'clone() shares mutable fields; a copy constructor does not',
        runnable: true,
        code: `import java.util.ArrayList;
import java.util.List;

class Playlist implements Cloneable {
    String title;
    List<String> songs = new ArrayList<>();

    Playlist(String title) {
        this.title = title;
    }

    // Copy constructor: explicit, and copies the list (not just the reference)
    Playlist(Playlist other) {
        this.title = other.title;
        this.songs = new ArrayList<>(other.songs);
    }

    @Override
    public Playlist clone() {
        try {
            return (Playlist) super.clone(); // field-by-field (shallow) copy
        } catch (CloneNotSupportedException e) {
            throw new AssertionError(e);
        }
    }
}

public class Main {
    public static void main(String[] args) {
        Playlist original = new Playlist("Road trip");
        original.songs.add("Song A");

        Playlist cloned = original.clone();
        Playlist copied = new Playlist(original);

        cloned.songs.add("Song B");
        copied.songs.add("Song C");

        System.out.println("original: " + original.songs);
        System.out.println("cloned:   " + cloned.songs);
        System.out.println("copied:   " + copied.songs);
        System.out.println("clone shares list? " + (cloned.songs == original.songs));
    }
}`,
        expectedOutput: `original: [Song A, Song B]
cloned:   [Song A, Song B]
copied:   [Song A, Song C]
clone shares list? true`,
        explanation: 'super.clone() copies each field\'s value, and the value of a reference field is a reference, so the clone and the original share one list. Fixing that inside clone() would require reassigning songs, which is impossible if the field is final. The copy constructor simply builds a new list.',
      },
      {
        id: 'o-immutability-builder',
        title: 'A builder and a wither for a record with many fields',
        runnable: true,
        code: `record Pizza(String size, String crust, boolean cheese, boolean olives) {

    static Builder builder() {
        return new Builder();
    }

    // A "wither": returns a new Pizza that differs in one component
    Pizza withOlives(boolean value) {
        return new Pizza(size, crust, cheese, value);
    }

    static final class Builder {
        private String size = "medium";
        private String crust = "thin";
        private boolean cheese = true;
        private boolean olives = false;

        Builder size(String value) { size = value; return this; }
        Builder crust(String value) { crust = value; return this; }
        Builder cheese(boolean value) { cheese = value; return this; }
        Builder olives(boolean value) { olives = value; return this; }

        Pizza build() {
            if (size.equals("small") && crust.equals("stuffed")) {
                throw new IllegalStateException("small pizzas cannot have stuffed crust");
            }
            return new Pizza(size, crust, cheese, olives);
        }
    }
}

public class Main {
    public static void main(String[] args) {
        Pizza plain = Pizza.builder().size("large").build();
        Pizza fancy = plain.withOlives(true);

        System.out.println(plain);
        System.out.println(fancy);
        System.out.println("same object? " + (plain == fancy));

        try {
            Pizza.builder().size("small").crust("stuffed").build();
        } catch (IllegalStateException e) {
            System.out.println("Rejected: " + e.getMessage());
        }
    }
}`,
        expectedOutput: `Pizza[size=large, crust=thin, cheese=true, olives=false]
Pizza[size=large, crust=thin, cheese=true, olives=true]
same object? false
Rejected: small pizzas cannot have stuffed crust`,
        explanation: 'The builder is mutable and short-lived; the Pizza it produces is immutable. Defaults live in the builder, each setter returns this for chaining, and build() validates the combination once. withOlives copies every other component into a new record.',
      },
    ],
    walkthrough: {
      exampleId: 'o-immutability-team',
      steps: [
        { lines: [4, 6], text: 'Rules 1 and 2: the class is `final` (no mutable subclass can sneak in) and every field is `private final` (assigned exactly once).' },
        { lines: [8, 11], text: 'Copy in: `List.copyOf` takes a snapshot of the caller\'s list and makes it unmodifiable. From now on the caller\'s list and ours are unrelated.' },
        { lines: [13, 14], text: 'Copy out: because the stored list is already unmodifiable, the getter can return it directly without another copy. There are no setters.' },
        { lines: [16, 20], text: 'A "wither"-style method: to "add" a member we copy into a fresh mutable list, change that, and build a new Team. The current object never changes.' },
        { lines: [25, 28], text: 'The caller adds "Mallory" to its own list after construction. The team still prints [Ana, Ben]: the defensive copy did its job.' },
        { lines: [30, 34], text: 'Trying to modify through the getter throws `UnsupportedOperationException`, so outsiders cannot change the team either.' },
        { lines: [36, 37], text: 'withMember returns a new object; the original team is unchanged, which is exactly what makes it safe to share.' },
      ],
    },
    realWorld: {
      title: 'The configuration object that changed under a running service',
      scenario: `A payment service built a \`RetryPolicy\` once at startup and shared it with every request thread. Its constructor stored the caller's \`List<Duration> backoffs\` directly, and a "harmless" admin endpoint later reused that same list to build a preview, calling \`backoffs.clear()\` at the end. From that moment every request retried with no backoff at all, hammering the bank's API until it rate-limited the service.

The fix was three lines: \`this.backoffs = List.copyOf(backoffs)\` in the constructor, a \`final\` class, and returning the stored (unmodifiable) list from the getter. The team then converted the class to a record with a compact constructor and added an ArchUnit rule that flags non-final fields in classes under the \`config\` package.`,
    },
    commonMistakes: [
      {
        mistake: 'Marking a List field final and assuming the object is immutable.',
        why: '`final` freezes the reference, not the object it points to. Anyone holding the list can still add and remove elements.',
        fix: 'Store an unmodifiable copy (`List.copyOf`) and never expose a mutable internal list.',
        code: `private final List<String> tags; // final reference...
tags.add("oops");                 // ...but the list still changes`,
      },
      {
        mistake: 'Returning Collections.unmodifiableList(input) without copying first.',
        why: 'An unmodifiable list is a view. If the caller still holds `input`, its changes appear through your "read-only" list.',
        fix: 'Copy first: `List.copyOf(input)`, or `Collections.unmodifiableList(new ArrayList<>(input))` when the data may contain nulls.',
      },
      {
        mistake: 'Validating the caller\'s object, then copying it.',
        why: 'Another thread can change the argument between the check and the copy, so you store data that never passed validation.',
        fix: 'Copy first, then validate the copy.',
      },
      {
        mistake: 'Implementing Cloneable to copy a class with mutable fields.',
        why: '`super.clone()` is shallow, bypasses constructors and cannot reassign `final` fields, so deep copies need awkward workarounds.',
        fix: 'Write a copy constructor or a static factory such as `copyOf(Playlist other)`.',
      },
      {
        mistake: 'Assuming a record with a List or array component is immutable.',
        why: 'Records are shallowly immutable: the component reference is final, the list it points to is not.',
        fix: 'Copy in the compact constructor (`items = List.copyOf(items);`) and prefer immutable component types.',
      },
    ],
    checks: [
      {
        id: 'o11-c1',
        kind: 'mcq',
        dimension: 'conceptual',
        prompt: 'A class is final, has only private final fields and no setters. One field is a `List<String>` stored exactly as passed to the constructor and returned from a getter. Is the class immutable?',
        options: [
          { id: 'a', text: 'Yes: final fields can never change' },
          { id: 'b', text: 'No: the caller and anyone using the getter can still modify the shared list' },
          { id: 'c', text: 'Yes, as long as the list is an ArrayList' },
          { id: 'd', text: 'No: immutable classes must not contain collections at all' },
        ],
        correctOptionId: 'b',
        explanation: 'The reference is final but the list object is shared and mutable. Copy it in (List.copyOf) and never hand out a modifiable reference.',
      },
      {
        id: 'o11-c2',
        kind: 'predict-output',
        dimension: 'runtime',
        prompt: 'What does this print?',
        code: `import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<String> base = new ArrayList<>(List.of("x"));
        List<String> view = Collections.unmodifiableList(base);
        List<String> copy = List.copyOf(base);
        base.add("y");
        System.out.println(view.size() + " " + copy.size());
    }
}`,
        options: [
          { id: 'a', text: '1 1' },
          { id: 'b', text: '2 2' },
          { id: 'c', text: '2 1' },
          { id: 'd', text: '1 2' },
        ],
        correctOptionId: 'c',
        explanation: 'Collections.unmodifiableList is a read-only view of base, so it sees the new element. List.copyOf took an independent snapshot of one element.',
        hints: ['Which of the two keeps a reference to `base`?'],
      },
      {
        id: 'o11-c3',
        kind: 'predict-output',
        dimension: 'runtime',
        prompt: 'What does this print?',
        code: `import java.util.ArrayList;
import java.util.List;

record Order(String id, List<String> lines) {}

public class Main {
    public static void main(String[] args) {
        List<String> lines = new ArrayList<>();
        lines.add("pen");
        Order order = new Order("A1", lines);
        order.lines().add("ink");
        System.out.println(order.lines());
    }
}`,
        options: [
          { id: 'a', text: '[pen]' },
          { id: 'b', text: '[pen, ink]' },
          { id: 'c', text: 'An UnsupportedOperationException is thrown' },
          { id: 'd', text: 'It does not compile: record components cannot be modified' },
        ],
        correctOptionId: 'b',
        explanation: 'Records are shallowly immutable. The accessor returns the very ArrayList that was passed in, so add succeeds. A compact constructor with `lines = List.copyOf(lines);` would make the add throw.',
      },
      {
        id: 'o11-c4',
        kind: 'multi-select',
        dimension: 'interview',
        prompt: 'Which are genuine benefits of immutable objects?',
        options: [
          { id: 'a', text: 'They can be shared between threads without locking' },
          { id: 'b', text: 'Their hashCode cannot change while they are stored in a HashMap' },
          { id: 'c', text: 'They never allocate new objects' },
          { id: 'd', text: 'They can be cached and reused freely, like Integer.valueOf(42)' },
          { id: 'e', text: 'A failed operation cannot leave them half-modified' },
        ],
        correctOptionIds: ['a', 'b', 'd', 'e'],
        explanation: 'Every "change" to an immutable object allocates a new one, which is their main cost. Thread safety, stable hash codes, safe caching and failure atomicity are the benefits.',
      },
      {
        id: 'o11-c5',
        kind: 'mcq',
        dimension: 'interview',
        prompt: 'Why does *Effective Java* recommend copy constructors or static factories over Cloneable/clone() for your own classes?',
        options: [
          { id: 'a', text: 'clone() is slower than any constructor call' },
          { id: 'b', text: 'Object.clone() is shallow, bypasses constructors, throws a checked exception and cannot reassign final fields to deep-copy them' },
          { id: 'c', text: 'clone() was removed in Java 17' },
          { id: 'd', text: 'Copy constructors make deep copies automatically' },
        ],
        correctOptionId: 'b',
        explanation: 'clone() still exists and is fine for arrays, but for classes it is an awkward, extralinguistic mechanism. A copy constructor is explicit, and you still choose how deep each field is copied.',
      },
      {
        id: 'o11-c6',
        kind: 'mcq',
        dimension: 'coding',
        prompt: 'An immutable `Report` class needs 9 fields, 6 of them optional. Which design is clearest and safest?',
        options: [
          { id: 'a', text: 'Add setters and tell callers not to use them after construction' },
          { id: 'b', text: 'One public constructor with 9 parameters' },
          { id: 'c', text: 'A static nested Builder with chained setters and a build() method that validates and creates the Report' },
          { id: 'd', text: 'Make every field public final and let callers assign them' },
        ],
        correctOptionId: 'c',
        explanation: 'A builder keeps the target immutable, names each value at the call site, provides defaults for optional fields and validates the whole combination once in build().',
      },
    ],
    challengeIds: [],
    masteryCriteria: [
      'Write an immutable class with a collection field that survives both caller-side and getter-side mutation attempts.',
      'Explain the difference between Collections.unmodifiableList and List.copyOf with a concrete example.',
      'Explain shallow vs deep copy and why records are only shallowly immutable.',
      'Argue for copy constructors, builders and withers over clone() in an interview.',
    ],
    relatedLessonIds: ['o-object-contracts', 'o-classes-objects', 't-strings', 'c-hashmap', 'cc-synchronization', 'd-patterns'],
    revision: [
      { id: 'r1', question: 'Name the rules for an immutable class.', answer: 'Final class (or private constructors), private final fields, no mutators, defensive copies of mutable inputs, never return internal mutable state, do not let this escape during construction.' },
      { id: 'r2', question: 'Collections.unmodifiableList vs List.copyOf?', answer: 'unmodifiableList is a read-only view that still reflects changes to the backing list; List.copyOf (Java 10) is an independent unmodifiable snapshot that also rejects nulls.' },
      { id: 'r3', question: 'Are records immutable?', answer: 'Shallowly: fields are private final with no setters, but mutable components such as a List can still change unless the compact constructor copies them.' },
      { id: 'r4', question: 'Shallow vs deep copy?', answer: 'A shallow copy duplicates the container and shares the referenced objects; a deep copy duplicates the referenced objects too, recursively as far as needed.' },
      { id: 'r5', question: 'What is a wither?', answer: 'A method like withOlives(true) on an immutable object that returns a new instance identical except for one field.' },
    ],
  },
  // -------------------------------------------------------------------------
  {
    id: 'p-build-tools',
    moduleId: 'jvm-platform',
    title: 'Build tools: Maven and Gradle',
    summary: 'What a build tool does, how Maven coordinates, lifecycles and scopes work, how Gradle configurations compare, and how dependency conflicts are resolved.',
    estimatedMinutes: 40,
    difficulty: 'intermediate',
    prerequisites: ['p-packages-classpath'],
    objectives: [
      'Explain what a build tool automates: dependency resolution, compilation, testing, packaging and publishing.',
      'Read Maven coordinates (groupId:artifactId:version) and a basic pom.xml.',
      'List the main phases of the Maven default lifecycle and explain that running a phase runs every earlier phase.',
      'Choose the right Maven scope or Gradle configuration for a dependency.',
      'Explain transitive dependencies, "nearest wins" conflict resolution and how to inspect it with dependency:tree.',
      'Use wrappers, BOMs, semantic versions and SNAPSHOTs correctly.',
    ],
    plainEnglish: `A real Java project uses dozens of libraries, hundreds of source files and thousands of tests. Typing \`javac\` and \`java -cp ...\` by hand does not scale. A **build tool** reads one description of your project and does the repetitive work: **download the libraries** you depend on (and the libraries *they* depend on), **compile** your code, **run the tests**, and **package** the result as a JAR.

The two dominant tools are **Maven** (configured in XML, \`pom.xml\`) and **Gradle** (configured in Kotlin or Groovy code, \`build.gradle.kts\` or \`build.gradle\`).

Every library is identified by three coordinates, like a postal address: **groupId** (who), **artifactId** (what) and **version** (which). For example \`com.google.guava:guava:33.0.0-jre\`. Build tools fetch these from a repository such as **Maven Central** and cache them on your machine.`,
    technical: `### Maven coordinates and the POM
A \`pom.xml\` declares the project's own coordinates, its packaging (\`jar\`, \`war\`, \`pom\`), properties such as \`maven.compiler.release\`, its dependencies and plugins. Most behaviour comes from **conventions**: sources in \`src/main/java\`, tests in \`src/test/java\`, output in \`target/\`.

### The lifecycle
Maven has three built-in lifecycles: \`clean\`, \`default\` and \`site\`. The default lifecycle's main phases are:
validate, compile, test, package, verify, install, deploy (with finer phases such as \`process-resources\`, \`test-compile\` and \`integration-test\` in between).

Running a phase runs **every phase before it**: \`mvn package\` validates, compiles, tests and then packages. Phases do nothing by themselves; **plugin goals** are bound to them (compiler:compile to \`compile\`, surefire:test to \`test\`, jar:jar to \`package\`). \`install\` copies the artifact into your local repository (\`~/.m2/repository\`); \`deploy\` uploads it to a remote repository.

### Dependency scopes (Maven)
- **compile** (default): needed to compile and run; transitive.
- **provided**: needed to compile, but the runtime (for example a servlet container) supplies it; not packaged and not transitive.
- **runtime**: not needed to compile, needed to run (for example a JDBC driver).
- **test**: only for compiling and running tests (JUnit, Mockito).
- **system**: like provided but from a local file path; discouraged.
- **import**: only in \`<dependencyManagement>\` with type \`pom\`; imports a BOM's managed versions.

### Transitive dependencies and conflicts
If your app needs \`web\`, and \`web\` needs \`json\`, you get \`json\` too. When two paths bring different versions of the same artifact, Maven picks the **nearest** declaration in the dependency tree (fewest hops from your project); on a tie, the first one declared wins. Pin a version explicitly with \`<dependencyManagement>\`, and inspect what was chosen with \`mvn dependency:tree\` (add \`-Dverbose\` to see omitted conflicts). Gradle, by contrast, picks the **highest** requested version by default; inspect with \`gradle dependencies\` or \`gradle dependencyInsight --dependency json\`.

### Gradle basics
A \`build.gradle.kts\` applies plugins (\`java\`, \`application\`, \`java-library\`), sets repositories and declares dependencies in **configurations**:
- \`implementation\`: compile and runtime, but not exposed to consumers' compile classpath.
- \`api\` (java-library plugin): like implementation, but leaks onto consumers' compile classpath; use it only for types in your public API.
- \`compileOnly\`: compile only (≈ provided). \`runtimeOnly\`: runtime only (≈ runtime).
- \`testImplementation\` / \`testRuntimeOnly\`: tests only.

Work is organised into **tasks** (\`compileJava\`, \`test\`, \`jar\`, \`build\`) that form a dependency graph. Gradle skips tasks whose inputs and outputs have not changed (incremental build) and can reuse outputs from a build cache.

### Wrappers, BOMs, versions, repositories
- **Wrappers** (\`mvnw\`, \`gradlew\`) are small scripts committed with the project that download and run the exact tool version the project expects, so every developer and CI agent builds the same way.
- A **BOM** (bill of materials) is a \`pom\` that only lists managed versions of libraries that belong together (Spring Boot, Jackson, JUnit). Import it once and omit versions on individual dependencies. Gradle uses \`implementation(platform("..."))\`.
- **Semantic versioning** (MAJOR.MINOR.PATCH): major = breaking change, minor = compatible feature, patch = compatible fix. A \`-SNAPSHOT\` version is a moving development build; release versions are immutable once published.
- **Repositories**: Maven Central is the default public repository; companies add a proxy/private repository (Nexus, Artifactory) for internal artifacts and caching.
- **Reproducible builds**: the same source and tool versions should produce bit-for-bit identical artifacts. Pin plugin and dependency versions, avoid version ranges and dynamic versions such as \`1.+\`, commit the wrapper and lock files, and fix archive timestamps (Maven's \`project.build.outputTimestamp\`).`,
    whyItExists: `Before build tools, teams checked JAR files into version control and wrote long Ant scripts by hand. Nobody knew which version of a library was really in use, and every project had a different layout. Maven (2004) introduced coordinates, a central repository, convention over configuration and a standard lifecycle. Gradle (2008, 1.0 in 2012) kept Maven's repositories and conventions but replaced XML with a programmable model, incremental tasks and caching for faster, more flexible builds.`,
    whenToUse: [
      'Use a build tool for every project beyond a single-file experiment, and commit its wrapper.',
      'Maven when you want a fixed, declarative structure that every Java developer can read.',
      'Gradle for large multi-module builds where incremental builds, build caching or custom logic pay off (and for Android, where it is the standard).',
      'Use a BOM or dependencyManagement / version catalog to keep related library versions aligned.',
      'Run mvn dependency:tree or gradle dependencyInsight whenever a NoSuchMethodError or NoClassDefFoundError appears after an upgrade.',
    ],
    whenNotToUse: [
      'Do not copy JARs into a lib/ folder by hand; you lose transitive resolution and version visibility.',
      'Do not use version ranges or dynamic versions (1.+, LATEST) in production builds; they break reproducibility.',
      'Do not depend on SNAPSHOT versions in a release; the artifact behind them can change at any time.',
      'Do not use the system scope; publish the jar to an internal repository instead.',
    ],
    examples: [
      {
        id: 'p-build-tools-nearest-wins',
        title: 'Resolving a tiny dependency graph with "nearest wins"',
        runnable: true,
        code: `import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class Main {
    record Dep(String artifact, String version, int depth) {
        String coordinates() { return artifact + ":" + version; }
    }

    // What each artifact:version declares in its own POM, in declaration order
    static final Map<String, List<String>> POMS = Map.of(
        "app:1.0", List.of("web:2.0", "json:1.1"),
        "web:2.0", List.of("json:1.4", "log:3.0"),
        "log:3.0", List.of("json:2.0"),
        "json:1.1", List.of(),
        "json:1.4", List.of(),
        "json:2.0", List.of());

    static List<Dep> children(String coordinates, int depth) {
        List<Dep> result = new ArrayList<>();
        for (String c : POMS.get(coordinates)) {
            String[] parts = c.split(":");
            result.add(new Dep(parts[0], parts[1], depth));
        }
        return result;
    }

    public static void main(String[] args) {
        Map<String, String> chosen = new LinkedHashMap<>();
        Deque<Dep> queue = new ArrayDeque<>(children("app:1.0", 1));

        while (!queue.isEmpty()) {
            Dep dep = queue.removeFirst(); // breadth-first = nearest first
            String winner = chosen.get(dep.artifact());
            if (winner != null) {
                System.out.println("omit    " + dep.coordinates() + " (depth " + dep.depth()
                        + ") - nearer " + dep.artifact() + ":" + winner + " wins");
                continue;
            }
            chosen.put(dep.artifact(), dep.version());
            System.out.println("resolve " + dep.coordinates() + " (depth " + dep.depth() + ")");
            queue.addAll(children(dep.coordinates(), dep.depth() + 1));
        }
        System.out.println("Classpath: " + chosen);
    }
}`,
        expectedOutput: `resolve web:2.0 (depth 1)
resolve json:1.1 (depth 1)
omit    json:1.4 (depth 2) - nearer json:1.1 wins
resolve log:3.0 (depth 2)
omit    json:2.0 (depth 3) - nearer json:1.1 wins
Classpath: {web=2.0, json=1.1, log=3.0}`,
        explanation: 'A breadth-first walk visits dependencies in order of distance from the project, and in declaration order within a level, which is exactly Maven\'s mediation rule. Notice that json 1.1 wins even though web and log asked for newer versions; Gradle\'s default (highest version) would pick 2.0.',
      },
      {
        id: 'p-build-tools-semver',
        title: 'Comparing semantic versions correctly',
        runnable: true,
        code: `import java.util.ArrayList;
import java.util.List;

public class Main {
    record Version(int major, int minor, int patch, String qualifier) implements Comparable<Version> {
        static Version parse(String text) {
            String[] dash = text.split("-", 2);
            String[] n = dash[0].split("[.]");
            return new Version(Integer.parseInt(n[0]), Integer.parseInt(n[1]),
                    Integer.parseInt(n[2]), dash.length > 1 ? dash[1] : "");
        }

        @Override
        public int compareTo(Version o) {
            int c = Integer.compare(major, o.major);
            if (c == 0) c = Integer.compare(minor, o.minor);
            if (c == 0) c = Integer.compare(patch, o.patch);
            if (c == 0 && qualifier.isEmpty() != o.qualifier.isEmpty()) {
                c = qualifier.isEmpty() ? 1 : -1; // 2.0.0-SNAPSHOT comes before 2.0.0
            }
            return c;
        }

        @Override
        public String toString() {
            return major + "." + minor + "." + patch + (qualifier.isEmpty() ? "" : "-" + qualifier);
        }
    }

    static String kindOfChange(Version from, Version to) {
        if (to.major() != from.major()) return "MAJOR (breaking changes allowed)";
        if (to.minor() != from.minor()) return "MINOR (new features, compatible)";
        return "PATCH (bug fixes only)";
    }

    public static void main(String[] args) {
        List<String> raw = List.of("1.10.0", "1.9.3", "2.0.0-SNAPSHOT", "2.0.0", "1.9.12");

        List<String> asText = new ArrayList<>(raw);
        asText.sort(null);
        System.out.println("As text:    " + asText);

        List<Version> versions = new ArrayList<>();
        for (String r : raw) versions.add(Version.parse(r));
        versions.sort(null);
        System.out.println("As version: " + versions);

        System.out.println("1.9.3 -> 1.9.12: " + kindOfChange(Version.parse("1.9.3"), Version.parse("1.9.12")));
        System.out.println("1.9.12 -> 1.10.0: " + kindOfChange(Version.parse("1.9.12"), Version.parse("1.10.0")));
        System.out.println("1.10.0 -> 2.0.0: " + kindOfChange(Version.parse("1.10.0"), Version.parse("2.0.0")));
    }
}`,
        expectedOutput: `As text:    [1.10.0, 1.9.12, 1.9.3, 2.0.0, 2.0.0-SNAPSHOT]
As version: [1.9.3, 1.9.12, 1.10.0, 2.0.0-SNAPSHOT, 2.0.0]
1.9.3 -> 1.9.12: PATCH (bug fixes only)
1.9.12 -> 1.10.0: MINOR (new features, compatible)
1.10.0 -> 2.0.0: MAJOR (breaking changes allowed)`,
        explanation: 'Sorting version strings alphabetically puts 1.10.0 before 1.9.3 and the SNAPSHOT after the release. Comparing numeric parts, and ranking a qualified pre-release before its release, gives the right order. (Real tools follow more detailed rules; this is a simplified model.)',
      },
      {
        id: 'p-build-tools-pom',
        title: 'A minimal pom.xml',
        runnable: false,
        code: `<project xmlns="http://maven.apache.org/POM/4.0.0">
  <modelVersion>4.0.0</modelVersion>

  <groupId>com.example.shop</groupId>
  <artifactId>billing</artifactId>
  <version>1.4.0-SNAPSHOT</version>
  <packaging>jar</packaging>

  <properties>
    <maven.compiler.release>21</maven.compiler.release>
    <project.build.outputTimestamp>2026-01-01T00:00:00Z</project.build.outputTimestamp>
  </properties>

  <dependencyManagement>
    <dependencies>
      <!-- BOM: aligned versions for every JUnit module -->
      <dependency>
        <groupId>org.junit</groupId>
        <artifactId>junit-bom</artifactId>
        <version>5.11.4</version>
        <type>pom</type>
        <scope>import</scope>
      </dependency>
    </dependencies>
  </dependencyManagement>

  <dependencies>
    <dependency>
      <groupId>com.fasterxml.jackson.core</groupId>
      <artifactId>jackson-databind</artifactId>
      <version>2.18.2</version>
    </dependency>
    <dependency>
      <groupId>jakarta.servlet</groupId>
      <artifactId>jakarta.servlet-api</artifactId>
      <version>6.0.0</version>
      <scope>provided</scope>
    </dependency>
    <dependency>
      <groupId>org.postgresql</groupId>
      <artifactId>postgresql</artifactId>
      <version>42.7.4</version>
      <scope>runtime</scope>
    </dependency>
    <dependency>
      <groupId>org.junit.jupiter</groupId>
      <artifactId>junit-jupiter</artifactId>
      <scope>test</scope> <!-- version comes from the BOM -->
    </dependency>
  </dependencies>
</project>`,
        explanation: 'Coordinates identify the project; properties set the Java release and a fixed archive timestamp for reproducible builds; the BOM import manages JUnit versions; and each dependency\'s scope says on which classpaths it appears. Run with ./mvnw verify.',
      },
      {
        id: 'p-build-tools-gradle',
        title: 'The same project in build.gradle.kts',
        runnable: false,
        code: `plugins {
    \`java-library\`
}

group = "com.example.shop"
version = "1.4.0-SNAPSHOT"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

repositories {
    mavenCentral()
}

dependencies {
    api("com.fasterxml.jackson.core:jackson-databind:2.18.2")   // part of our public API
    implementation("com.google.guava:guava:33.3.1-jre")         // internal detail
    compileOnly("jakarta.servlet:jakarta.servlet-api:6.0.0")    // like Maven "provided"
    runtimeOnly("org.postgresql:postgresql:42.7.4")             // like Maven "runtime"

    testImplementation(platform("org.junit:junit-bom:5.11.4"))  // BOM
    testImplementation("org.junit.jupiter:junit-jupiter")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.test {
    useJUnitPlatform()
}`,
        explanation: 'The java-library plugin adds the api configuration. implementation keeps Guava off consumers\' compile classpath, so changing it does not force them to recompile. Run with ./gradlew build, and inspect resolution with ./gradlew dependencies.',
      },
    ],
    walkthrough: {
      exampleId: 'p-build-tools-nearest-wins',
      steps: [
        { lines: [9, 11], text: 'A dependency is identified by its coordinates (here simplified to artifact:version) plus how far it is from our project in the tree.' },
        { lines: [13, 20], text: 'Each "POM" lists its own dependencies in declaration order. app needs web and json 1.1 directly; web needs json 1.4 and log; log needs json 2.0. Three versions of json are requested.' },
        { lines: [22, 29], text: 'children turns a POM\'s list into Dep records one level deeper. These are the transitive dependencies.' },
        { lines: [32, 33], text: 'The queue starts with the direct dependencies at depth 1. A LinkedHashMap records the chosen version per artifact in the order decided.' },
        { lines: [35, 42], text: 'Breadth-first order means the first version of an artifact we meet is the nearest one (ties go to whichever was declared first). Any later version of the same artifact is omitted.' },
        { lines: [43, 45], text: 'A winner is added to the classpath and only then are its own dependencies queued; Maven likewise does not expand omitted nodes.' },
        { lines: [47, 47], text: 'The result: json 1.1, even though two libraries asked for newer versions. If web really needs a json 1.4 method, this build fails at runtime with NoSuchMethodError, which is why you pin versions with dependencyManagement and read dependency:tree.' },
      ],
    },
    realWorld: {
      title: 'NoSuchMethodError after adding a "small" library',
      scenario: `A team added a reporting library to their Maven service. Everything compiled, all unit tests passed, but the first export in staging failed with \`java.lang.NoSuchMethodError: 'com.fasterxml.jackson.databind.ObjectMapper ...'\`.

\`mvn dependency:tree -Dverbose -Dincludes=com.fasterxml.jackson.core\` showed the cause: the service declared an old \`jackson-databind\` directly (depth 1), so Maven's nearest-wins rule silently replaced the newer version the reporting library was compiled against (depth 2). The fix was to import the Jackson BOM in \`<dependencyManagement>\` so every Jackson module used one aligned, recent version, and to add the Maven Enforcer plugin's dependency convergence rule so future conflicts fail the build instead of production.`,
    },
    commonMistakes: [
      {
        mistake: 'Thinking `mvn test` and `mvn install` are independent commands.',
        why: 'They are lifecycle phases. `mvn install` runs validate, compile, test, package, verify and then install.',
        fix: 'Run the latest phase you need (usually `./mvnw verify` in CI); skip tests only deliberately with `-DskipTests`.',
      },
      {
        mistake: 'Giving the servlet API or Lombok compile scope.',
        why: 'The container already provides the servlet API (duplicates cause class conflicts), and Lombok is only needed by the compiler.',
        fix: 'Use `provided` in Maven or `compileOnly` (plus `annotationProcessor` for Lombok) in Gradle.',
      },
      {
        mistake: 'Using `api` for every Gradle dependency.',
        why: 'Every api dependency leaks onto consumers\' compile classpath, coupling them to your internals and causing more recompilation.',
        fix: 'Default to `implementation`; use `api` only when the library\'s types appear in your public method signatures.',
      },
      {
        mistake: 'Assuming the newest version of a transitive dependency wins in Maven.',
        why: 'Maven chooses the nearest declaration in the tree, not the highest version. Gradle chooses the highest by default.',
        fix: 'Pin versions in dependencyManagement or a BOM and check `mvn dependency:tree`.',
      },
      {
        mistake: 'Not committing the wrapper scripts and properties.',
        why: 'Developers and CI then build with whatever Maven or Gradle happens to be installed, producing different results.',
        fix: 'Commit `mvnw`/`.mvn/wrapper` or `gradlew`/`gradle/wrapper` and always build with them.',
      },
    ],
    checks: [
      {
        id: 'p5-c1',
        kind: 'mcq',
        dimension: 'conceptual',
        prompt: 'What does `mvn package` do in a standard Maven project?',
        options: [
          { id: 'a', text: 'Only creates the JAR from whatever is already in target/' },
          { id: 'b', text: 'Runs validate, compile, test (and the phases in between), then package' },
          { id: 'c', text: 'Compiles, packages and uploads the JAR to Maven Central' },
          { id: 'd', text: 'Runs package, then install' },
        ],
        correctOptionId: 'b',
        explanation: 'Invoking a phase runs every earlier phase of the same lifecycle. Uploading happens in deploy, which comes after package, verify and install.',
      },
      {
        id: 'p5-c2',
        kind: 'mcq',
        dimension: 'coding',
        prompt: 'Your WAR runs inside Tomcat, which already ships the Servlet API. Which Maven scope should the servlet API dependency have?',
        options: [
          { id: 'a', text: 'compile' },
          { id: 'b', text: 'runtime' },
          { id: 'c', text: 'provided' },
          { id: 'd', text: 'test' },
        ],
        correctOptionId: 'c',
        explanation: 'provided puts it on the compile and test classpaths but leaves it out of the packaged artifact, because the container supplies it at runtime. Gradle\'s equivalent is compileOnly.',
      },
      {
        id: 'p5-c3',
        kind: 'predict-output',
        dimension: 'runtime',
        prompt: 'Why do build tools not compare version strings alphabetically? What does this print?',
        code: `public class Main {
    public static void main(String[] args) {
        String a = "1.10.0";
        String b = "1.9.0";
        int minorA = Integer.parseInt(a.split("[.]")[1]);
        int minorB = Integer.parseInt(b.split("[.]")[1]);
        System.out.println((a.compareTo(b) > 0) + " " + (minorA > minorB));
    }
}`,
        options: [
          { id: 'a', text: 'true true' },
          { id: 'b', text: 'false true' },
          { id: 'c', text: 'true false' },
          { id: 'd', text: 'false false' },
        ],
        correctOptionId: 'b',
        explanation: 'String comparison is character by character: at index 2, \'1\' is less than \'9\', so "1.10.0" sorts before "1.9.0". Comparing the numeric minor parts gives the correct 10 > 9.',
      },
      {
        id: 'p5-c4',
        kind: 'mcq',
        dimension: 'runtime',
        prompt: 'Your project depends on A and D. A depends on C:1.0. D depends on E, which depends on C:2.0. Which C does Maven put on the classpath by default?',
        options: [
          { id: 'a', text: 'C:2.0, because it is the highest version' },
          { id: 'b', text: 'C:1.0, because it is nearer to the project (2 hops vs 3)' },
          { id: 'c', text: 'Both versions' },
          { id: 'd', text: 'Neither: the build fails with a conflict error' },
        ],
        correctOptionId: 'b',
        explanation: 'Maven\'s dependency mediation picks the nearest definition. Only one version of an artifact can be on the classpath. Gradle would pick 2.0 (highest) by default; a fail-on-conflict policy is an opt-in in both tools.',
      },
      {
        id: 'p5-c5',
        kind: 'multi-select',
        dimension: 'conceptual',
        prompt: 'Which statements about Gradle configurations (java-library plugin) are true?',
        options: [
          { id: 'a', text: 'implementation dependencies are on your compile and runtime classpaths but not on consumers\' compile classpath' },
          { id: 'b', text: 'api dependencies are exposed to consumers\' compile classpath' },
          { id: 'c', text: 'compileOnly is the closest equivalent of Maven\'s provided scope' },
          { id: 'd', text: 'runtimeOnly dependencies can be referenced directly in your source code' },
          { id: 'e', text: 'testImplementation dependencies end up in the production JAR' },
        ],
        correctOptionIds: ['a', 'b', 'c'],
        explanation: 'runtimeOnly dependencies are not on the compile classpath, so your code cannot reference them (typical for JDBC drivers and logging back-ends). Test configurations never reach production artifacts.',
      },
      {
        id: 'p5-c6',
        kind: 'mcq',
        dimension: 'interview',
        prompt: 'Why should a project commit `gradlew` / `mvnw` and their wrapper properties?',
        options: [
          { id: 'a', text: 'They make the build run faster than an installed tool' },
          { id: 'b', text: 'They pin and download the exact build-tool version, so every machine and CI agent builds the same way' },
          { id: 'c', text: 'They replace the need for a repository such as Maven Central' },
          { id: 'd', text: 'They are required by the JVM to run the packaged JAR' },
        ],
        correctOptionId: 'b',
        explanation: 'The wrapper fetches the version named in its properties file (optionally verified by checksum) and runs it, removing "works on my machine" differences between tool versions.',
      },
    ],
    challengeIds: [],
    masteryCriteria: [
      'Read a pom.xml or build.gradle.kts and explain every dependency\'s scope or configuration.',
      'List the Maven default lifecycle phases in order and explain what mvn verify runs.',
      'Predict which version of a conflicting transitive dependency Maven and Gradle choose, and know how to inspect and pin it.',
      'Explain wrappers, BOMs, semantic versioning and SNAPSHOTs.',
    ],
    relatedLessonIds: ['p-packages-classpath', 'p-java-releases', 'ts-junit', 'sp-ioc-boot'],
    revision: [
      { id: 'r1', question: 'What are Maven coordinates?', answer: 'groupId:artifactId:version (plus optional packaging and classifier) uniquely identifying an artifact in a repository.' },
      { id: 'r2', question: 'List the main default-lifecycle phases.', answer: 'validate, compile, test, package, verify, install, deploy. Running one runs all earlier ones.' },
      { id: 'r3', question: 'How does Maven resolve two versions of the same transitive dependency?', answer: 'Nearest definition wins (fewest hops); on a tie, the first declared wins. dependencyManagement overrides it. Gradle picks the highest version by default.' },
      { id: 'r4', question: 'implementation vs api in Gradle?', answer: 'Both are on your compile and runtime classpaths; api is also exposed on consumers\' compile classpath, implementation is not.' },
      { id: 'r5', question: 'What is a BOM?', answer: 'A pom-packaged artifact listing managed versions of libraries meant to be used together; imported with scope import (Maven) or platform() (Gradle).' },
    ],
  },
];
