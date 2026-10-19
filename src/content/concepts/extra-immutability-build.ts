import type { LessonConcepts } from '@/types/curriculum';

/** Concept pages for the extra lessons o-immutability and p-build-tools, keyed by lesson id. */
export const immutabilityBuildConcepts: Record<string, LessonConcepts> = {
  'o-immutability': {
    interviewDefinition:
      'An **immutable** object\'s observable state cannot change after construction. In Java that means a `final` class (or private constructors), `private final` fields, no mutators, and **defensive copies** of mutable data both when it comes in and when it goes out. Immutable objects are thread-safe without locks, safe as hash keys and freely shareable. Copying is shallow (shared elements) or deep (copied elements); prefer copy constructors, static factories, builders and withers over `clone()`.',
    interviewFollowUps: [
      {
        question: 'Is a class with only `final` fields immutable?',
        answer: 'Not necessarily. `final` freezes the reference, not the object it points to. A `final List` or `final Date` field can still be mutated by anyone holding the same reference, so mutable fields need defensive copies or immutable types.',
      },
      {
        question: 'What is the difference between `Collections.unmodifiableList(list)` and `List.copyOf(list)`?',
        answer: 'The first is a read-only **view**: writes through it throw, but changes to the backing list are visible. `List.copyOf` (Java 10) is an independent unmodifiable **copy**; it rejects nulls and returns its argument unchanged when that is already an unmodifiable list from `List.of`/`copyOf`.',
      },
      {
        question: 'Are records immutable?',
        answer: 'Shallowly. Their fields are `private final` and there are no setters, but a `List` or array component is still mutable. Copy it in the compact constructor, e.g. `items = List.copyOf(items);`.',
      },
      {
        question: 'Why is `clone()` considered broken?',
        answer: '`Cloneable` has no `clone` method, `Object.clone()` is protected, throws a checked exception, skips constructors and copies shallowly; and because it assigns fields after the fact, it cannot deep-copy into `final` fields. A copy constructor or static factory avoids all of that. Array `clone()` is the accepted exception.',
      },
    ],
    mnemonic: {
      device: '"Frozen FRIDGE": Final class, Read-only fields, Inputs copied, Don\'t add setters, Guard outputs, Escape-proof constructor',
      expansion: [
        { key: 'F', meaning: 'Final class (or private constructors with static factories) so no subclass can add mutable state' },
        { key: 'R', meaning: 'Read-only fields: every field is private final' },
        { key: 'I', meaning: 'Inputs copied: defensively copy mutable arguments in the constructor, before validating them' },
        { key: 'D', meaning: 'Don\'t add setters or any other method that changes state; return new objects (withers) instead' },
        { key: 'G', meaning: 'Guard outputs: never return internal mutable state; return unmodifiable or copied data' },
        { key: 'E', meaning: 'Escape-proof constructor: do not let `this` leak before construction finishes' },
      ],
      visual: 'A fridge with a frozen door: you can look in through the glass and take a photo (a copy) of the contents, but nothing inside can ever be moved, and anything you put in was photographed and replaced by a frozen replica at the door.',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'A printed contract versus a shared whiteboard',
        body: 'A mutable object is a whiteboard in a shared office: anyone who walks past can erase and rewrite it, and you only notice later. An immutable object is a signed, printed contract: to "change" it you print a new version, and every copy already handed out stays exactly as it was. A defensive copy is making your own photocopy before you sign, so the other party cannot edit the draft you agreed to.',
      },
      {
        kind: 'insight',
        title: 'The danger is aliasing, not mutation itself',
        body: 'Mutation is harmless when exactly one piece of code holds the reference. Bugs appear when two references point at the same mutable object and one side changes it behind the other\'s back. Immutability removes one half of "shared mutable state"; confinement (one owner, no sharing) removes the other. Both are valid designs; the trouble is the combination.',
      },
      {
        kind: 'real-world',
        title: 'The JDK\'s own lessons: Date versus LocalDate',
        body: '`java.util.Date` is mutable, so every class that stored one needed `new Date(d.getTime())` defensive copies, and shared `SimpleDateFormat` instances caused notorious thread-safety bugs. The `java.time` API (Java 8, JSR 310) made `LocalDate`, `Instant` and `DateTimeFormatter` immutable and thread-safe: `plusDays` returns a new object, and a single formatter can be shared by every thread.',
      },
      {
        kind: 'angle',
        title: 'Immutable does not mean slow',
        body: 'Each "change" allocates, but young-generation allocation is a pointer bump and short-lived garbage is almost free to collect. In return the JIT can trust `final` fields more, objects can be cached (`Integer.valueOf`, string literals), and you skip locks and defensive copies on every read. Persistent collections go further by sharing structure between versions instead of copying everything.',
      },
      {
        kind: 'insight',
        title: 'Builders and withers are two halves of one idea',
        body: 'A builder is a short-lived **mutable** helper used to create the first immutable instance from many optional values; a wither (`withOlives(true)`) derives the next instance from an existing one. Together they give you the ergonomics of setters without ever mutating a published object.',
      },
    ],
    diagrams: [
      {
        id: 'o-immutability-defensive',
        kind: 'concept',
        title: 'Defensive copies in, read-only data out',
        caption: 'The caller keeps its own mutable list, so the constructor stores an unmodifiable copy. Later edits to the caller\'s list have no effect, and attempts to modify through the getter throw.',
        cols: 4,
        rows: 2,
        nodes: [
          { id: 'caller', label: 'Caller\'s list', detail: 'ArrayList, mutable', col: 0, row: 0, shape: 'note', tone: 'neutral' },
          { id: 'ctor', label: 'Constructor', detail: 'List.copyOf(input)', col: 1, row: 0, tone: 'primary' },
          { id: 'field', label: 'private final field', detail: 'unmodifiable copy', col: 2, row: 0, shape: 'cylinder', tone: 'accent' },
          { id: 'getter', label: 'Getter', detail: 'returns the same copy', col: 3, row: 0, tone: 'primary' },
          { id: 'edit', label: 'input.add("x")', detail: 'caller edits original', col: 0, row: 1, shape: 'pill', tone: 'warning' },
          { id: 'safe', label: 'Object unchanged', detail: 'its copy is independent', col: 1, row: 1, shape: 'pill', tone: 'success' },
          { id: 'attack', label: 'members().add("x")', detail: 'UnsupportedOperation', col: 3, row: 1, shape: 'pill', tone: 'danger' },
        ],
        edges: [
          { from: 'caller', to: 'ctor', label: 'copy in' },
          { from: 'ctor', to: 'field', label: 'store' },
          { from: 'field', to: 'getter', label: 'read-only out' },
          { from: 'caller', to: 'edit', dashed: true },
          { from: 'edit', to: 'safe', label: 'no effect', dashed: true },
          { from: 'getter', to: 'attack', label: 'caller tries', dashed: true },
        ],
        groups: [{ label: 'Inside the immutable class', fromCol: 1, toCol: 3, fromRow: 0, toRow: 0, tone: 'primary' }],
      },
      {
        id: 'o-immutability-recipe',
        kind: 'flow',
        title: 'Turning a class immutable, step by step',
        caption: 'Each step closes one way the state could change: subclassing, reassignment, mutator methods, aliasing through inputs, and aliasing through outputs.',
        cols: 3,
        rows: 2,
        nodes: [
          { id: 's1', label: 'final class', detail: 'no mutable subclasses', col: 0, row: 0, tone: 'primary' },
          { id: 's2', label: 'private final fields', detail: 'assigned exactly once', col: 1, row: 0, tone: 'primary' },
          { id: 's3', label: 'No setters', detail: 'withers return new objects', col: 2, row: 0, tone: 'primary' },
          { id: 's4', label: 'Copy inputs', detail: 'copy first, then validate', col: 2, row: 1, tone: 'accent' },
          { id: 's5', label: 'Guard outputs', detail: 'unmodifiable or copied', col: 1, row: 1, tone: 'accent' },
          { id: 's6', label: 'Immutable object', detail: 'share across threads', col: 0, row: 1, shape: 'pill', tone: 'success' },
        ],
        edges: [
          { from: 's1', to: 's2' },
          { from: 's2', to: 's3' },
          { from: 's3', to: 's4', label: 'mutable fields?' },
          { from: 's4', to: 's5' },
          { from: 's5', to: 's6' },
        ],
      },
      {
        id: 'o-immutability-shallow-deep',
        kind: 'architecture',
        title: 'Shallow copy versus deep copy',
        caption: 'A shallow copy is a new container holding the same element references, so writing through it changes what the original sees. A deep copy also duplicates the elements.',
        cols: 3,
        rows: 3,
        nodes: [
          { id: 'orig', label: 'Original list', detail: 'ArrayList<int[]>', col: 0, row: 0, tone: 'neutral' },
          { id: 'shal', label: 'Shallow copy', detail: 'new ArrayList<>(orig)', col: 1, row: 0, tone: 'warning' },
          { id: 'deep', label: 'Deep copy', detail: 'copies each element', col: 2, row: 0, tone: 'success' },
          { id: 'elem', label: 'int[] {1, 2}', detail: 'one shared array object', col: 0, row: 1, span: 2, shape: 'cylinder', tone: 'accent' },
          { id: 'elem2', label: 'int[] {1, 2}', detail: 'its own array object', col: 2, row: 1, shape: 'cylinder', tone: 'accent' },
          { id: 'bad', label: 'copy.get(0)[0] = 99', detail: 'original sees 99 too', col: 0, row: 2, span: 2, shape: 'pill', tone: 'danger' },
          { id: 'good', label: 'Writes stay local', detail: 'original keeps 1', col: 2, row: 2, shape: 'pill', tone: 'success' },
        ],
        edges: [
          { from: 'orig', to: 'elem', label: 'reference' },
          { from: 'shal', to: 'elem', label: 'same reference' },
          { from: 'deep', to: 'elem2', label: 'new reference' },
          { from: 'elem', to: 'bad', dashed: true },
          { from: 'elem2', to: 'good', dashed: true },
        ],
        groups: [
          { label: 'Shares elements', fromCol: 0, toCol: 1, fromRow: 0, toRow: 2, tone: 'warning' },
          { label: 'Independent', fromCol: 2, toCol: 2, fromRow: 0, toRow: 2, tone: 'success' },
        ],
      },
    ],
    variants: [
      {
        title: 'Ways to copy an object',
        intro: 'Java has no universal deep-copy operation; you choose how deep each field is copied.',
        items: [
          {
            name: 'Shallow copy',
            summary: 'New outer object, same references inside. Collection copy constructors (`new ArrayList<>(list)`), `List.copyOf` and `Object.clone()` are all shallow.',
            support: 'supported',
            note: 'Perfectly safe when the elements are immutable (String, Integer, records of immutables).',
            code: 'List<int[]> copy = new ArrayList<>(rows); // int[] elements shared',
          },
          {
            name: 'Deep copy',
            summary: 'Copies the referenced objects too, as deep as mutability requires. Written by hand per class; there is no built-in generic deep copy.',
            support: 'partial',
            note: 'Watch for cycles and shared sub-objects; a naive recursive copy can loop forever or duplicate what should stay shared.',
            code: 'List<int[]> deep = rows.stream().map(int[]::clone).toList();',
          },
          {
            name: 'Copy constructor',
            summary: 'A constructor that takes an instance of the same class and copies each field, deciding per field how deep to go.',
            support: 'supported',
            note: 'Recommended: explicit, type-safe, works with final fields, no casts or checked exceptions.',
            code: 'Playlist(Playlist other) { this.songs = new ArrayList<>(other.songs); }',
          },
          {
            name: 'Static copy factory',
            summary: 'A static method such as `copyOf(other)` or `from(other)`. Like a copy constructor, but can return a cached instance or a subtype, and has a descriptive name.',
            support: 'supported',
            note: 'The JDK uses this style: `List.copyOf`, `Map.copyOf`, `EnumSet.copyOf`.',
            code: 'static Playlist copyOf(Playlist p) { return new Playlist(p); }',
          },
          {
            name: 'clone() / Cloneable',
            summary: '`super.clone()` produces a field-by-field shallow copy without running a constructor; the class must implement the marker interface `Cloneable`.',
            support: 'partial',
            note: 'Works, but discouraged for your own classes (*Effective Java*). Fine for arrays: `int[] c = a.clone();`.',
            code: 'Playlist c = (Playlist) super.clone(); // shallow',
          },
          {
            name: 'Serialization round-trip',
            summary: 'Write the object graph to bytes and read it back to get a full deep copy of anything `Serializable`.',
            support: 'partial',
            note: 'Slow, requires every class to be Serializable, bypasses constructors and carries deserialization security risks. Avoid in production code.',
          },
        ],
      },
      {
        title: 'Ways to get a read-only collection',
        intro: 'Unmodifiable means "throws on write"; whether the data can still change depends on whether it is a view or a copy.',
        items: [
          {
            name: 'Collections.unmodifiableList / Set / Map',
            summary: 'A read-only **view** over an existing collection. Writes through the view throw, but changes to the backing collection show through.',
            support: 'supported',
            note: 'Available since Java 1.2. Allows nulls. Copy first if the caller still holds the original.',
            code: 'List<String> view = Collections.unmodifiableList(list);',
          },
          {
            name: 'List.of / Set.of / Map.of',
            summary: 'Unmodifiable collections built from literal elements.',
            support: 'supported',
            note: 'Java 9 (JEP 269). Reject nulls; Set.of and Map.of reject duplicates and have unspecified iteration order.',
            code: 'List<String> days = List.of("Mon", "Tue");',
          },
          {
            name: 'List.copyOf / Set.copyOf / Map.copyOf',
            summary: 'An independent unmodifiable **copy** of an existing collection.',
            support: 'supported',
            note: 'Java 10. Rejects nulls. Returns the argument itself if it is already such an unmodifiable collection, so repeated copying is cheap.',
            code: 'this.items = List.copyOf(items);',
          },
          {
            name: 'Stream.toList / Collectors.toUnmodifiableList',
            summary: 'Collect a stream straight into an unmodifiable list.',
            support: 'supported',
            note: '`toUnmodifiableList` (Java 10) rejects nulls; `Stream.toList()` (Java 16) allows nulls. `Collectors.toList()` makes no unmodifiability guarantee.',
            code: 'List<String> names = people.stream().map(Person::name).toList();',
          },
          {
            name: 'Truly immutable third-party collections',
            summary: 'Libraries such as Guava\'s `ImmutableList` provide immutable types whose API makes immutability visible in signatures.',
            support: 'not-supported',
            note: 'Not part of the JDK. JDK unmodifiable collections still implement mutator methods that throw at runtime.',
          },
        ],
      },
    ],
    deepDive: [
      {
        title: 'final fields come with a memory-model guarantee',
        body: 'JLS §17.5 gives `final` fields special semantics: once a constructor finishes, any thread that obtains a reference to the object (even through a data race) is guaranteed to see the correctly initialised values of its `final` fields and of everything reachable through them as of the end of construction. That is why properly constructed immutable objects need no synchronisation to publish. The guarantee is void if `this` escapes during construction, for example by starting a thread or registering a listener in the constructor, which is why the escape rule is part of the recipe.',
        sources: [
          { label: 'Java Language Specification §17.5: final Field Semantics', url: 'https://docs.oracle.com/javase/specs/jls/se21/html/jls-17.html#jls-17.5' },
          { label: 'Java Concurrency in Practice (Goetz et al.), chapter 3: Sharing Objects' },
        ],
      },
      {
        title: 'Copy first, validate second: the TOCTOU attack',
        body: '*Effective Java* (Item 50) describes a `Period` class that checked `start.before(end)` on two caller-supplied `Date` objects and then stored them. An attacker could call `end.setYear(...)` from another thread between the check and the store, or simply after construction, producing a "valid" period that ends before it starts. Copying first and validating the copies closes the window. Note that `clone()` must not be used for this copy when the argument\'s class may be an untrusted subclass, because an overridden `clone` can return anything.',
        sources: [
          { label: 'Effective Java, 3rd ed. (Bloch), Item 50: Make defensive copies when needed' },
          { label: 'Effective Java, 3rd ed. (Bloch), Item 17: Minimize mutability' },
        ],
      },
      {
        title: 'Why Cloneable is a design mistake the JDK cannot remove',
        body: '`Cloneable` is a marker interface that changes the behaviour of a protected method in another class (`Object.clone`): without it, `clone()` throws `CloneNotSupportedException`. The interface declares no methods, so you cannot call `clone()` through a `Cloneable` reference, and the "contract" (x.clone() != x, usually equal) is described as non-binding in the Javadoc. Because `clone` assigns fields after the object exists, it cannot give a copy fresh values for `final` fields, which is incompatible with immutable designs. *Effective Java* Item 13 recommends copy constructors or copy factories instead, with arrays as the sole common exception.',
        sources: [
          { label: 'Object.clone() Javadoc (Java 21)', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Object.html#clone()' },
          { label: 'Effective Java, 3rd ed. (Bloch), Item 13: Override clone judiciously' },
        ],
      },
      {
        title: 'Records, withers and where the language is heading',
        body: 'Records (JEP 395, final in Java 16) give you private final fields, accessors, `equals`, `hashCode` and `toString`, plus a compact constructor for validation and defensive copies, but they remain shallowly immutable and you still write withers by hand. JEP 468 (Derived Record Creation) proposes a `with` expression for records, and Project Valhalla\'s value classes (JEP 401) explore identity-free immutable objects; both are proposals or previews, not standard Java features, so do not rely on them in production code.',
        sources: [
          { label: 'JEP 395: Records', url: 'https://openjdk.org/jeps/395' },
          { label: 'JEP 468: Derived Record Creation (Preview)', url: 'https://openjdk.org/jeps/468' },
          { label: 'JEP 401: Value Classes and Objects (Preview)', url: 'https://openjdk.org/jeps/401' },
        ],
      },
    ],
  },
  'p-build-tools': {
    interviewDefinition:
      'A **build tool** turns a declarative project description into repeatable work: resolve dependencies (including transitive ones) from repositories, compile, test, package and publish. **Maven** uses an XML `pom.xml`, artifact coordinates (`groupId:artifactId:version`), a fixed lifecycle of phases bound to plugin goals, and dependency scopes; it resolves version conflicts by **nearest wins**. **Gradle** uses a Kotlin or Groovy DSL, a task graph with incremental builds and caching, and configurations such as `implementation` and `api`; it picks the **highest** conflicting version by default.',
    interviewFollowUps: [
      {
        question: 'What is the difference between `mvn install` and `mvn deploy`?',
        answer: 'Both run the whole lifecycle up to that phase. `install` copies the artifact into the local repository (`~/.m2/repository`) so other projects on the same machine can use it; `deploy` additionally uploads it to a remote repository for the team or the public.',
      },
      {
        question: 'How do you find out why an unexpected library version is on the classpath?',
        answer: 'Maven: `mvn dependency:tree -Dverbose -Dincludes=group:artifact` shows every path and which versions were omitted for conflict. Gradle: `gradle dependencyInsight --dependency <name> --configuration runtimeClasspath`. Then pin the version with `dependencyManagement`, a BOM or a Gradle constraint.',
      },
      {
        question: 'When would you use Gradle `api` instead of `implementation`?',
        answer: 'Only in a library, for dependencies whose types appear in your public API (method parameters, return types, superclasses). Everything else is `implementation`, which keeps consumers\' compile classpaths small and avoids recompiling them when your internals change.',
      },
      {
        question: 'Why are SNAPSHOT dependencies dangerous in a release?',
        answer: 'A SNAPSHOT is a moving target: the repository can serve a newer build tomorrow under the same version, so the same source produces a different artifact. Releases must depend only on immutable release versions; the Maven Release plugin refuses to release with SNAPSHOT dependencies.',
      },
    ],
    mnemonic: {
      device: '"Very Cool Teams Pack Very Important Deliveries" (validate, compile, test, package, verify, install, deploy)',
      expansion: [
        { key: 'Very', meaning: 'validate: the project and POM are correct and complete' },
        { key: 'Cool', meaning: 'compile: compile src/main/java into target/classes' },
        { key: 'Teams', meaning: 'test: run unit tests (Surefire) against the compiled classes' },
        { key: 'Pack', meaning: 'package: bundle into a jar or war in target/' },
        { key: 'Very', meaning: 'verify: integration tests and quality checks on the package (Failsafe, Enforcer)' },
        { key: 'Important', meaning: 'install: copy the artifact into the local repository ~/.m2/repository' },
        { key: 'Deliveries', meaning: 'deploy: upload the artifact to a remote repository' },
      ],
      visual: 'A relay race of seven runners on one track: you can stop the race at any runner (mvn package), but nobody gets the baton without every runner before them running their leg.',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'A build file is a recipe plus a shopping list',
        body: 'The dependency section is a shopping list written as exact product codes (coordinates). The build tool goes to the supermarket (Maven Central), buys each item plus the ingredients those items need (transitive dependencies), keeps them in your pantry (the local cache) and then follows a fixed recipe: prepare, cook, taste, plate, deliver (compile, test, package, install, deploy).',
      },
      {
        kind: 'insight',
        title: 'Only one version of a class can win',
        body: 'The classpath is flat: if three libraries need three versions of Jackson, only one JAR is loaded. Conflict resolution is therefore not a convenience feature but an unavoidable decision, and the wrong choice shows up only at runtime as `NoSuchMethodError` or `NoClassDefFoundError`. Make it explicit with BOMs, dependencyManagement or Gradle constraints, and fail the build on divergence (Maven Enforcer\'s dependencyConvergence, Gradle\'s failOnVersionConflict).',
      },
      {
        kind: 'real-world',
        title: 'Spring Boot\'s BOM and the Log4Shell scramble',
        body: 'Spring Boot projects omit most dependency versions because the Boot BOM (spring-boot-dependencies) aligns hundreds of libraries that are tested together. In December 2021, when Log4Shell (CVE-2021-44228) hit, teams learned to run `mvn dependency:tree -Dincludes=org.apache.logging.log4j` across every service to find transitive log4j-core copies, and to override one managed property (`log4j2.version`) instead of hunting through each library.',
      },
      {
        kind: 'angle',
        title: 'The wrapper makes the build tool a dependency too',
        body: 'Your code depends on libraries, but your build depends on Maven or Gradle itself, and on plugin versions. `mvnw`/`gradlew` pin the tool version in a committed properties file (optionally with a SHA-256 checksum), and pinned plugin versions make the build behave the same on a laptop, in CI and in five years when you need to patch an old release.',
      },
    ],
    diagrams: [
      {
        id: 'p-build-tools-jobs',
        kind: 'architecture',
        title: 'What a build tool does with one build file',
        caption: 'The build file declares coordinates and dependencies. Libraries are downloaded once from a remote repository into a local cache, then placed on the classpath for compiling, testing and packaging.',
        cols: 4,
        rows: 3,
        nodes: [
          { id: 'file', label: 'pom.xml or build.gradle.kts', detail: 'coordinates, dependencies, plugins', col: 1, row: 0, span: 2, shape: 'note', tone: 'accent' },
          { id: 'central', label: 'Maven Central', detail: 'remote repository', col: 0, row: 1, shape: 'cylinder', tone: 'neutral' },
          { id: 'compile', label: 'Compile', detail: 'javac with classpath', col: 1, row: 1, tone: 'primary' },
          { id: 'test', label: 'Test', detail: 'JUnit via Surefire', col: 2, row: 1, tone: 'primary' },
          { id: 'package', label: 'Package', detail: 'billing-1.4.0.jar', col: 3, row: 1, shape: 'note', tone: 'primary' },
          { id: 'local', label: 'Local cache', detail: '~/.m2 or ~/.gradle', col: 0, row: 2, shape: 'cylinder', tone: 'neutral' },
          { id: 'publish', label: 'Publish', detail: 'install / deploy', col: 3, row: 2, shape: 'pill', tone: 'success' },
        ],
        edges: [
          { from: 'file', to: 'compile', label: 'drives' },
          { from: 'central', to: 'local', label: 'download once' },
          { from: 'local', to: 'compile', label: 'classpath' },
          { from: 'compile', to: 'test' },
          { from: 'test', to: 'package' },
          { from: 'package', to: 'publish' },
        ],
        groups: [{ label: 'Build steps', fromCol: 1, toCol: 3, fromRow: 1, toRow: 2, tone: 'primary' }],
      },
      {
        id: 'p-build-tools-lifecycle',
        kind: 'flow',
        title: 'The Maven default lifecycle',
        caption: 'Phases always run in this order, and invoking one runs every phase before it: mvn install executes validate through install. Plugin goals bound to each phase do the actual work.',
        cols: 4,
        rows: 2,
        nodes: [
          { id: 'validate', label: 'validate', detail: 'POM is correct', col: 0, row: 0, tone: 'neutral' },
          { id: 'compile', label: 'compile', detail: 'src/main/java', col: 1, row: 0, tone: 'primary' },
          { id: 'test', label: 'test', detail: 'unit tests (Surefire)', col: 2, row: 0, tone: 'primary' },
          { id: 'package', label: 'package', detail: 'jar / war in target/', col: 3, row: 0, tone: 'primary' },
          { id: 'verify', label: 'verify', detail: 'integration tests, checks', col: 3, row: 1, tone: 'accent' },
          { id: 'install', label: 'install', detail: 'into ~/.m2/repository', col: 2, row: 1, tone: 'accent' },
          { id: 'deploy', label: 'deploy', detail: 'to a remote repository', col: 1, row: 1, tone: 'success' },
          { id: 'cmd', label: 'mvn install', detail: 'stops after install', col: 0, row: 1, shape: 'note', tone: 'warning' },
        ],
        edges: [
          { from: 'validate', to: 'compile' },
          { from: 'compile', to: 'test', label: 'test-compile first' },
          { from: 'test', to: 'package' },
          { from: 'package', to: 'verify' },
          { from: 'verify', to: 'install' },
          { from: 'install', to: 'deploy' },
          { from: 'cmd', to: 'validate', label: 'starts here', dashed: true },
        ],
      },
      {
        id: 'p-build-tools-conflict',
        kind: 'concept',
        title: 'Nearest wins: resolving a version conflict',
        caption: 'Two versions of json are requested. Maven keeps the one nearest to the project (1.1, one hop) and omits 1.4 (two hops). Gradle\'s default would choose the highest version, 1.4.',
        cols: 3,
        rows: 3,
        nodes: [
          { id: 'app', label: 'app:1.0', detail: 'your project', col: 1, row: 0, shape: 'pill', tone: 'primary' },
          { id: 'web', label: 'web:2.0', detail: 'depth 1', col: 0, row: 1, tone: 'neutral' },
          { id: 'json11', label: 'json:1.1', detail: 'depth 1, chosen', col: 2, row: 1, tone: 'success' },
          { id: 'json14', label: 'json:1.4', detail: 'depth 2, omitted', col: 0, row: 2, tone: 'danger' },
          { id: 'log', label: 'log:3.0', detail: 'depth 2', col: 1, row: 2, tone: 'neutral' },
        ],
        edges: [
          { from: 'app', to: 'web' },
          { from: 'app', to: 'json11', label: 'direct' },
          { from: 'web', to: 'json14', label: 'transitive', dashed: true },
          { from: 'web', to: 'log' },
        ],
      },
    ],
    variants: [
      {
        title: 'Maven default lifecycle phases (main ones)',
        intro: 'Maven also has a clean lifecycle (pre-clean, clean, post-clean) and a site lifecycle; the default lifecycle contains about 23 phases, of which these are the ones you invoke.',
        items: [
          { name: 'validate', summary: 'Checks that the project is correct and all necessary information is available.' },
          { name: 'compile', summary: 'Compiles main sources (compiler:compile), after process-resources copies resources.' },
          { name: 'test', summary: 'Runs unit tests with Surefire after test-compile; failures stop the build.', code: './mvnw test -Dtest=InvoiceTest' },
          { name: 'package', summary: 'Bundles compiled code into its distributable format (jar, war) in target/.' },
          { name: 'verify', summary: 'Runs integration tests (Failsafe, via integration-test) and quality checks on the package. The usual CI command.', code: './mvnw verify' },
          { name: 'install', summary: 'Installs the artifact into the local repository for use by other local projects.' },
          { name: 'deploy', summary: 'Copies the final artifact to a remote repository, usually done by CI for releases.' },
        ],
      },
      {
        title: 'Maven scopes vs Gradle configurations',
        intro: 'Each line answers: on which classpaths does this dependency appear, and does it reach consumers?',
        items: [
          { name: 'compile ≈ implementation / api', summary: 'Needed to compile and run. Maven compile scope is transitive to consumers\' compile classpath; in Gradle, api is, implementation is not.', code: 'implementation("com.google.guava:guava:33.3.1-jre")' },
          { name: 'provided ≈ compileOnly', summary: 'Needed to compile, supplied by the runtime environment (servlet container, annotation-only libraries). Not packaged, not transitive.', code: 'compileOnly("jakarta.servlet:jakarta.servlet-api:6.0.0")' },
          { name: 'runtime ≈ runtimeOnly', summary: 'Not needed to compile, needed to run: JDBC drivers, logging back-ends.', code: 'runtimeOnly("org.postgresql:postgresql:42.7.4")' },
          { name: 'test ≈ testImplementation / testRuntimeOnly', summary: 'Only for compiling and running tests; never in the production artifact.', code: 'testImplementation("org.junit.jupiter:junit-jupiter")' },
          { name: 'system', summary: 'Like provided, but from a hard-coded local file path. Deprecated in practice; publish to a repository instead. Gradle has no equivalent configuration (use files() if you must).' },
          { name: 'import ≈ platform()', summary: 'Maven: only inside dependencyManagement with type pom, imports a BOM\'s managed versions. Gradle: platform() or enforcedPlatform().', code: 'implementation(platform("org.springframework.boot:spring-boot-dependencies:3.4.1"))' },
        ],
      },
      {
        title: 'Maven vs Gradle',
        items: [
          { name: 'Build file', summary: 'Maven: declarative XML pom.xml. Gradle: Kotlin DSL build.gradle.kts (the default for new builds) or Groovy build.gradle.' },
          { name: 'Model', summary: 'Maven: fixed lifecycle of phases with plugin goals bound to them. Gradle: a directed graph of tasks that plugins add and wire together.' },
          { name: 'Conflict resolution', summary: 'Maven: nearest definition wins, then first declared. Gradle: highest version wins by default.' },
          { name: 'Performance', summary: 'Gradle: incremental tasks, a build cache and a long-lived daemon. Maven: simpler, with incremental compilation and parallel module builds (-T) but less caching out of the box.' },
          { name: 'Flexibility', summary: 'Maven: custom logic needs a plugin, so builds stay uniform. Gradle: logic can live in the build script or convention plugins, which is powerful but easier to make complex.' },
          { name: 'Ecosystem', summary: 'Both use Maven repositories and coordinates, so either can consume any library. Gradle is the standard for Android; Maven remains very common for server-side Java.' },
        ],
      },
    ],
    deepDive: [
      {
        title: 'Dependency mediation and dependencyManagement',
        body: 'Maven builds the full transitive graph and, for each groupId:artifactId, keeps exactly one version. The rule is **nearest definition**: the shortest path from your project wins; on equal depth the first declaration in POM order wins. `<dependencyManagement>` (including imported BOMs) overrides mediation for transitive dependencies, and an explicit direct dependency always wins because it is at depth 1. Exclusions (`<exclusions>`) remove a transitive branch entirely. `mvn dependency:tree -Dverbose` shows omitted nodes and why they were omitted.',
        sources: [
          { label: 'Apache Maven: Introduction to the Dependency Mechanism', url: 'https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html' },
          { label: 'Apache Maven: Introduction to the Build Lifecycle', url: 'https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html' },
        ],
      },
      {
        title: 'Why implementation exists: ABI and compile avoidance',
        body: 'Gradle splits a library\'s dependencies into those that are part of its **ABI** (types in public signatures, declared with `api`) and implementation details (`implementation`). Consumers compile only against the ABI, so changing an implementation dependency does not change consumers\' compile classpath, and Gradle can skip recompiling them. Leaking everything with `api` (or the old `compile` configuration, removed in Gradle 7) defeats this and couples every consumer to your internals.',
        sources: [
          { label: 'Gradle User Manual: The Java Library Plugin', url: 'https://docs.gradle.org/current/userguide/java_library_plugin.html' },
        ],
      },
      {
        title: 'Version semantics: SemVer, Maven ordering and SNAPSHOTs',
        body: 'Semantic Versioning 2.0.0 defines MAJOR.MINOR.PATCH, where pre-release versions (`2.0.0-rc.1`) rank below the release. Maven\'s own ordering (ComparableVersion) is similar but not identical: it understands qualifiers such as alpha, beta, milestone, rc, SNAPSHOT and sp, compares numeric parts numerically, and treats `-SNAPSHOT` as earlier than the release. A SNAPSHOT is stored in a repository with a timestamp and build number (for example 1.4.0-20260115.093012-7), and builds re-check for newer snapshots, so the same coordinates can resolve to different bytes over time. Maven Central accepts only release versions, which are immutable once published.',
        sources: [
          { label: 'Semantic Versioning 2.0.0', url: 'https://semver.org/' },
          { label: 'Apache Maven: POM Reference (Version Order Specification)', url: 'https://maven.apache.org/pom.html' },
        ],
      },
      {
        title: 'Reproducible builds and wrapper verification',
        body: 'A build is reproducible when anyone can rebuild the same source and get bit-for-bit identical artifacts, which lets third parties verify that a published JAR really came from its source. Typical sources of difference are timestamps and file order inside archives, unpinned plugin versions, dynamic dependency versions and the build-tool version itself. Maven supports a fixed `project.build.outputTimestamp`; Gradle archive tasks can disable file timestamps and use a reproducible file order. The Gradle wrapper can verify the downloaded distribution against `distributionSha256Sum`, closing a supply-chain gap.',
        sources: [
          { label: 'Reproducible Builds project', url: 'https://reproducible-builds.org/' },
          { label: 'Apache Maven: Configuring for Reproducible Builds', url: 'https://maven.apache.org/guides/mini/guide-reproducible-builds.html' },
          { label: 'Gradle User Manual: The Gradle Wrapper', url: 'https://docs.gradle.org/current/userguide/gradle_wrapper.html' },
        ],
      },
    ],
  },
};
