/**
 * Java release history from Java 8 to the latest release.
 *
 * Feature claims that can be checked by compiling code carry a `probe`.
 * scripts/probe-java-versions.mjs compiles every probe on real JDKs
 * (8, 11, 17, 21, 22, 23, 24, 25, 26, 27), with and without --enable-preview,
 * and writes probes.generated.ts. A content test then checks every `since`
 * and status claim against those results.
 */

export type FeatureCategory = 'language' | 'api' | 'jvm' | 'tooling' | 'security' | 'removal';

/**
 * - final: standard from `since`
 * - preview: only usable with --enable-preview in `since` (and possibly later releases)
 * - incubator: in a jdk.incubator module
 * - removed: no longer available from `since`
 * - deprecated: deprecated (possibly for removal) from `since`
 */
export type FeatureStatus = 'final' | 'preview' | 'incubator' | 'removed' | 'deprecated';

export interface JavaFeatureProbe {
  /** Complete source file. Must compile when the feature is available. */
  code: string;
  /** Defaults to Main.java. */
  fileName?: string;
}

export interface JavaFeature {
  id: string;
  release: number;
  title: string;
  summary: string;
  category: FeatureCategory;
  status: FeatureStatus;
  jep?: number;
  /** Earlier releases where this was a preview or incubator feature. */
  previewedIn?: number[];
  example?: string;
  probe?: JavaFeatureProbe;
  /** Lesson ids that teach this feature. */
  lessonIds?: string[];
}

export interface JavaRelease {
  version: number;
  /** General availability, YYYY-MM. */
  ga: string;
  lts: boolean;
  headline: string;
}

const main = (body: string, imports = '') => `${imports}public class Main {
    public static void main(String[] args) throws Exception {
        ${body}
    }
}`;

export const JAVA_RELEASES: JavaRelease[] = [
  { version: 8, ga: '2014-03', lts: true, headline: 'Lambdas, streams and java.time — the functional turn.' },
  { version: 9, ga: '2017-09', lts: false, headline: 'The module system, JShell and collection factories.' },
  { version: 10, ga: '2018-03', lts: false, headline: 'Local variable type inference and the six-month cadence.' },
  { version: 11, ga: '2018-09', lts: true, headline: 'Standard HTTP client, String upgrades, Java EE modules removed.' },
  { version: 12, ga: '2019-03', lts: false, headline: 'Switch expressions preview and Shenandoah.' },
  { version: 13, ga: '2019-09', lts: false, headline: 'Text blocks preview.' },
  { version: 14, ga: '2020-03', lts: false, headline: 'Switch expressions final and helpful NullPointerExceptions.' },
  { version: 15, ga: '2020-09', lts: false, headline: 'Text blocks final, ZGC and Shenandoah production-ready.' },
  { version: 16, ga: '2021-03', lts: false, headline: 'Records and instanceof patterns final.' },
  { version: 17, ga: '2021-09', lts: true, headline: 'Sealed classes and strong encapsulation of JDK internals.' },
  { version: 18, ga: '2022-03', lts: false, headline: 'UTF-8 by default and a simple web server.' },
  { version: 19, ga: '2022-09', lts: false, headline: 'Virtual threads and record patterns previews.' },
  { version: 20, ga: '2023-03', lts: false, headline: 'Further previews of virtual threads, patterns and scoped values.' },
  { version: 21, ga: '2023-09', lts: true, headline: 'Virtual threads, pattern matching for switch, sequenced collections.' },
  { version: 22, ga: '2024-03', lts: false, headline: 'Unnamed variables, the Foreign Function & Memory API, multi-file launch.' },
  { version: 23, ga: '2024-09', lts: false, headline: 'Markdown doc comments; generational ZGC by default.' },
  { version: 24, ga: '2025-03', lts: false, headline: 'Stream gatherers, the Class-File API, virtual threads without pinning.' },
  { version: 25, ga: '2025-09', lts: true, headline: 'Compact source files, flexible constructors, scoped values, module imports.' },
  { version: 26, ga: '2026-03', lts: false, headline: 'HTTP/3 in the HTTP client, Applet API removed, new API conveniences.' },
  { version: 27, ga: '2026-09', lts: false, headline: 'Inverse hyperbolic functions, Set.ofLazy preview and smaller API additions.' },
];

export const JAVA_FEATURES: JavaFeature[] = [
  // ---------------------------------------------------------------- Java 8
  {
    id: 'lambdas',
    release: 8,
    title: 'Lambda expressions and method references',
    summary: 'Pass behaviour as values; the foundation for streams and modern APIs.',
    category: 'language',
    status: 'final',
    jep: 126,
    example: 'names.forEach(n -> System.out.println(n));',
    probe: { code: main('Runnable r = () -> System.out.println("hi"); r.run(); java.util.function.Function<String, Integer> f = String::length;') },
    lessonIds: ['fn-lambdas'],
  },
  {
    id: 'streams',
    release: 8,
    title: 'Streams API',
    summary: 'Declarative, lazy pipelines over collections with collectors.',
    category: 'api',
    status: 'final',
    jep: 107,
    probe: { code: main('long n = java.util.Arrays.asList(1, 2, 3).stream().filter(x -> x > 1).count();') },
    lessonIds: ['fn-streams'],
  },
  {
    id: 'java-time',
    release: 8,
    title: 'java.time (Date and Time API)',
    summary: 'Immutable, zone-aware types (Instant, LocalDate, ZonedDateTime, Duration) replacing Date and Calendar.',
    category: 'api',
    status: 'final',
    jep: 150,
    probe: { code: main('java.time.Instant now = java.time.Instant.now(); java.time.LocalDate d = java.time.LocalDate.of(2024, 2, 29);') },
  },
  {
    id: 'default-methods',
    release: 8,
    title: 'Default and static interface methods',
    summary: 'Interfaces can evolve by adding methods with implementations.',
    category: 'language',
    status: 'final',
    probe: { code: 'interface Greeter { default String greet() { return "hi"; } static Greeter create() { return new Greeter() {}; } }\npublic class Main { public static void main(String[] a) { System.out.println(Greeter.create().greet()); } }' },
    lessonIds: ['o-interfaces'],
  },
  {
    id: 'optional',
    release: 8,
    title: 'Optional',
    summary: 'An explicit return type for values that may be absent.',
    category: 'api',
    status: 'final',
    probe: { code: main('String s = java.util.Optional.ofNullable(System.getenv("X")).orElse("none");') },
    lessonIds: ['fn-optional-modern'],
  },
  {
    id: 'completable-future',
    release: 8,
    title: 'CompletableFuture',
    summary: 'Composable asynchronous computations.',
    category: 'api',
    status: 'final',
    probe: { code: main('int v = java.util.concurrent.CompletableFuture.supplyAsync(() -> 21).thenApply(x -> x * 2).join();') },
  },

  // ---------------------------------------------------------------- Java 9
  {
    id: 'modules',
    release: 9,
    title: 'Java Platform Module System',
    summary: 'module-info.java declares dependencies (requires) and API (exports); the JDK itself is modularised.',
    category: 'language',
    status: 'final',
    jep: 261,
    lessonIds: ['p-packages-classpath'],
  },
  {
    id: 'jshell',
    release: 9,
    title: 'JShell',
    summary: 'An interactive read-eval-print loop for trying Java snippets.',
    category: 'tooling',
    status: 'final',
    jep: 222,
  },
  {
    id: 'collection-factories',
    release: 9,
    title: 'List.of, Set.of, Map.of',
    summary: 'Concise immutable collections that reject nulls.',
    category: 'api',
    status: 'final',
    jep: 269,
    probe: { code: main('java.util.List<String> l = java.util.List.of("a", "b"); java.util.Map<String, Integer> m = java.util.Map.of("a", 1);') },
    lessonIds: ['c-iteration'],
  },
  {
    id: 'private-interface-methods',
    release: 9,
    title: 'Private interface methods',
    summary: 'Share code between default methods without exposing it.',
    category: 'language',
    status: 'final',
    probe: { code: 'interface Report { default String title() { return clean("x"); } private String clean(String s) { return s.trim(); } }\npublic class Main { public static void main(String[] a) { } }' },
  },
  {
    id: 'compact-strings',
    release: 9,
    title: 'Compact strings',
    summary: 'Latin-1 strings use one byte per character internally, roughly halving String memory for many applications.',
    category: 'jvm',
    status: 'final',
    jep: 254,
  },
  {
    id: 'g1-default',
    release: 9,
    title: 'G1 becomes the default garbage collector',
    summary: 'The region-based, mostly concurrent G1 collector replaces Parallel GC as the default on server-class machines.',
    category: 'jvm',
    status: 'final',
    jep: 248,
  },

  // ---------------------------------------------------------------- Java 10
  {
    id: 'var',
    release: 10,
    title: 'Local variable type inference (var)',
    summary: 'The compiler infers local variable types from initialisers; Java stays statically typed.',
    category: 'language',
    status: 'final',
    jep: 286,
    probe: { code: main('var list = new java.util.ArrayList<String>(); list.add("x");') },
    lessonIds: ['t-modern-types'],
  },
  {
    id: 'copy-of',
    release: 10,
    title: 'List.copyOf and Collectors.toUnmodifiableList',
    summary: 'Immutable snapshots of existing collections.',
    category: 'api',
    status: 'final',
    probe: { code: main('java.util.List<Integer> c = java.util.List.copyOf(new java.util.ArrayList<Integer>());') },
  },

  // ---------------------------------------------------------------- Java 11
  {
    id: 'http-client',
    release: 11,
    title: 'Standard HTTP client (java.net.http)',
    summary: 'HTTP/1.1 and HTTP/2 client with synchronous and asynchronous APIs.',
    category: 'api',
    status: 'final',
    jep: 321,
    previewedIn: [9, 10],
    probe: { code: main('java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();') },
  },
  {
    id: 'string-11',
    release: 11,
    title: 'String.isBlank, strip, lines, repeat',
    summary: 'Unicode-aware whitespace handling and common helpers.',
    category: 'api',
    status: 'final',
    probe: { code: main('boolean b = " x ".strip().isBlank(); long n = "a\\nb".lines().count(); String r = "ab".repeat(3);') },
    lessonIds: ['t-strings'],
  },
  {
    id: 'files-readstring',
    release: 11,
    title: 'Files.readString and Files.writeString',
    summary: 'Read or write a whole text file in one call.',
    category: 'api',
    status: 'final',
    probe: { code: main('java.nio.file.Path p = java.nio.file.Files.writeString(java.nio.file.Files.createTempFile("x", ".txt"), "hi"); String s = java.nio.file.Files.readString(p);') },
  },
  {
    id: 'single-file-launch',
    release: 11,
    title: 'Launch single-file source programs (java Main.java)',
    summary: 'Run a source file directly without a separate javac step.',
    category: 'tooling',
    status: 'final',
    jep: 330,
    lessonIds: ['f-first-program'],
  },
  {
    id: 'remove-java-ee',
    release: 11,
    title: 'Java EE and CORBA modules removed',
    summary: 'javax.xml.bind (JAXB), JAX-WS and friends must now come from Maven dependencies (Jakarta EE).',
    category: 'removal',
    status: 'removed',
    jep: 320,
  },

  // ---------------------------------------------------------------- 12-16
  {
    id: 'switch-expressions',
    release: 14,
    title: 'Switch expressions and arrow labels',
    summary: 'switch produces a value, arrow labels never fall through, yield returns from blocks.',
    category: 'language',
    status: 'final',
    jep: 361,
    previewedIn: [12, 13],
    probe: { code: main('int day = 3; String kind = switch (day) { case 1, 7 -> "weekend"; default -> { yield "weekday"; } };') },
    lessonIds: ['f-control-flow'],
  },
  {
    id: 'helpful-npe',
    release: 14,
    title: 'Helpful NullPointerException messages',
    summary: 'NPE messages name the exact null expression; enabled by default since Java 15.',
    category: 'jvm',
    status: 'final',
    jep: 358,
    lessonIds: ['e-basics'],
  },
  {
    id: 'text-blocks',
    release: 15,
    title: 'Text blocks',
    summary: 'Multi-line string literals with """ and automatic indentation stripping.',
    category: 'language',
    status: 'final',
    jep: 378,
    previewedIn: [13, 14],
    probe: { code: main('String json = """\n            {"a": 1}\n            """;') },
    lessonIds: ['t-strings'],
  },
  {
    id: 'zgc-production',
    release: 15,
    title: 'ZGC and Shenandoah ready for production',
    summary: 'Low-pause concurrent collectors become product features.',
    category: 'jvm',
    status: 'final',
    jep: 377,
  },
  {
    id: 'remove-nashorn',
    release: 15,
    title: 'Nashorn JavaScript engine removed',
    summary: 'Use GraalJS or another engine for embedded JavaScript.',
    category: 'removal',
    status: 'removed',
    jep: 372,
  },
  {
    id: 'records',
    release: 16,
    title: 'Records',
    summary: 'Concise immutable data carriers with generated constructor, accessors, equals, hashCode and toString.',
    category: 'language',
    status: 'final',
    jep: 395,
    previewedIn: [14, 15],
    probe: { code: 'record Point(int x, int y) {}\npublic class Main { public static void main(String[] a) { System.out.println(new Point(1, 2)); } }' },
    lessonIds: ['o-object-contracts'],
  },
  {
    id: 'instanceof-patterns',
    release: 16,
    title: 'Pattern matching for instanceof',
    summary: 'Test and bind a typed variable in one step: if (o instanceof String s).',
    category: 'language',
    status: 'final',
    jep: 394,
    previewedIn: [14, 15],
    probe: { code: main('Object o = "x"; if (o instanceof String s && !s.isEmpty()) System.out.println(s.length());') },
    lessonIds: ['t-modern-types'],
  },
  {
    id: 'stream-tolist',
    release: 16,
    title: 'Stream.toList()',
    summary: 'Collect a stream into an unmodifiable list.',
    category: 'api',
    status: 'final',
    probe: { code: main('java.util.List<Integer> l = java.util.stream.Stream.of(1, 2).toList();') },
    lessonIds: ['fn-streams'],
  },

  // ---------------------------------------------------------------- Java 17
  {
    id: 'sealed',
    release: 17,
    title: 'Sealed classes and interfaces',
    summary: 'Restrict which classes may extend a type, enabling exhaustive pattern matching.',
    category: 'language',
    status: 'final',
    jep: 409,
    previewedIn: [15, 16],
    probe: { code: 'sealed interface Shape permits Circle, Square {}\nfinal class Circle implements Shape {}\nfinal class Square implements Shape {}\npublic class Main { public static void main(String[] a) { } }' },
    lessonIds: ['o-interfaces'],
  },
  {
    id: 'strong-encapsulation',
    release: 17,
    title: 'JDK internals strongly encapsulated',
    summary: 'Deep reflection into JDK internals fails unless --add-opens is given; --illegal-access is gone.',
    category: 'jvm',
    status: 'final',
    jep: 403,
    lessonIds: ['p-packages-classpath'],
  },
  {
    id: 'security-manager-deprecated',
    release: 17,
    title: 'Security Manager deprecated for removal',
    summary: 'The Security Manager is deprecated (Java 17) and permanently disabled from Java 24.',
    category: 'security',
    status: 'deprecated',
    jep: 411,
  },

  // ---------------------------------------------------------------- 18-20
  {
    id: 'utf8-default',
    release: 18,
    title: 'UTF-8 by default',
    summary: 'The default charset for file APIs is UTF-8 on every platform (console output still follows the terminal).',
    category: 'api',
    status: 'final',
    jep: 400,
  },
  {
    id: 'jwebserver',
    release: 18,
    title: 'Simple web server (jwebserver)',
    summary: 'A minimal static file server for prototyping and testing.',
    category: 'tooling',
    status: 'final',
    jep: 408,
  },
  {
    id: 'finalization-deprecated',
    release: 18,
    title: 'Finalization deprecated for removal',
    summary: 'finalize() is unreliable; use try-with-resources and Cleaner instead.',
    category: 'removal',
    status: 'deprecated',
    jep: 421,
  },

  // ---------------------------------------------------------------- Java 21
  {
    id: 'virtual-threads',
    release: 21,
    title: 'Virtual threads',
    summary: 'Lightweight threads managed by the JVM make blocking code scale to millions of concurrent tasks.',
    category: 'api',
    status: 'final',
    jep: 444,
    previewedIn: [19, 20],
    probe: { code: main('Thread t = Thread.ofVirtual().start(() -> {}); t.join(); try (var ex = java.util.concurrent.Executors.newVirtualThreadPerTaskExecutor()) { ex.submit(() -> 1); }') },
  },
  {
    id: 'switch-patterns',
    release: 21,
    title: 'Pattern matching for switch',
    summary: 'Switch on types with guards, case null and exhaustiveness checks.',
    category: 'language',
    status: 'final',
    jep: 441,
    previewedIn: [17, 18, 19, 20],
    // No guard in the probe: Java 17's preview used `&&` guards instead of `when`.
    probe: { code: main('Object o = 5; String d = switch (o) { case null -> "null"; case Integer i -> "int"; default -> "other"; };') },
    lessonIds: ['t-modern-types'],
  },
  {
    id: 'record-patterns',
    release: 21,
    title: 'Record patterns',
    summary: 'Deconstruct records (including nested ones) directly in patterns.',
    category: 'language',
    status: 'final',
    jep: 440,
    previewedIn: [19, 20],
    probe: { code: 'record P(int x, int y) {}\npublic class Main { public static void main(String[] a) { Object o = new P(1, 2); if (o instanceof P(int x, int y)) System.out.println(x + y); } }' },
    lessonIds: ['t-modern-types'],
  },
  {
    id: 'sequenced-collections',
    release: 21,
    title: 'Sequenced collections',
    summary: 'getFirst, getLast, addFirst, reversed() on ordered collections and maps.',
    category: 'api',
    status: 'final',
    jep: 431,
    probe: { code: main('var l = new java.util.ArrayList<>(java.util.List.of(1, 2, 3)); int last = l.getLast(); var r = l.reversed();') },
    lessonIds: ['c-collections-overview'],
  },
  {
    id: 'generational-zgc',
    release: 21,
    title: 'Generational ZGC',
    summary: 'ZGC gains young and old generations (opt-in in 21, the default ZGC mode from 23).',
    category: 'jvm',
    status: 'final',
    jep: 439,
  },
  {
    id: 'string-templates',
    release: 21,
    title: 'String templates (withdrawn)',
    summary: 'STR."Hello \\{name}" was previewed in 21 and 22, then removed in 23 for redesign. Do not use it.',
    category: 'language',
    status: 'preview',
    jep: 430,
    probe: { code: main('String name = "x"; String s = STR."Hello \\{name}";') },
  },

  // ---------------------------------------------------------------- Java 22
  {
    id: 'unnamed-variables',
    release: 22,
    title: 'Unnamed variables and patterns (_)',
    summary: 'Use _ for variables and pattern components you do not need.',
    category: 'language',
    status: 'final',
    jep: 456,
    previewedIn: [21],
    probe: { code: main('int count = 0; for (String _ : java.util.List.of("a", "b")) count++; try { Integer.parseInt("x"); } catch (NumberFormatException _) { }') },
  },
  {
    id: 'ffm-api',
    release: 22,
    title: 'Foreign Function & Memory API',
    summary: 'Call native code and manage off-heap memory safely, replacing most JNI and Unsafe uses.',
    category: 'api',
    status: 'final',
    jep: 454,
    previewedIn: [19, 20, 21],
    probe: { code: main('try (java.lang.foreign.Arena arena = java.lang.foreign.Arena.ofConfined()) { java.lang.foreign.MemorySegment s = arena.allocate(16); }') },
  },
  {
    id: 'multi-file-launch',
    release: 22,
    title: 'Launch multi-file source programs',
    summary: 'java Main.java can now compile and run programs spread across several source files.',
    category: 'tooling',
    status: 'final',
    jep: 458,
  },

  // ---------------------------------------------------------------- Java 23
  {
    id: 'markdown-javadoc',
    release: 23,
    title: 'Markdown documentation comments',
    summary: 'Write Javadoc in Markdown using /// comments.',
    category: 'tooling',
    status: 'final',
    jep: 467,
  },
  {
    id: 'zgc-generational-default',
    release: 23,
    title: 'ZGC generational mode by default',
    summary: 'Using ZGC now means generational ZGC; the non-generational mode is deprecated.',
    category: 'jvm',
    status: 'final',
    jep: 474,
  },

  // ---------------------------------------------------------------- Java 24
  {
    id: 'stream-gatherers',
    release: 24,
    title: 'Stream gatherers',
    summary: 'Custom intermediate operations such as windowing and scanning via Stream.gather.',
    category: 'api',
    status: 'final',
    jep: 485,
    previewedIn: [22, 23],
    probe: { code: main('var w = java.util.stream.Stream.of(1, 2, 3, 4).gather(java.util.stream.Gatherers.windowFixed(2)).toList();') },
    lessonIds: ['fn-streams'],
  },
  {
    id: 'classfile-api',
    release: 24,
    title: 'Class-File API',
    summary: 'A standard API for parsing, generating and transforming class files.',
    category: 'api',
    status: 'final',
    jep: 484,
    previewedIn: [22, 23],
    probe: { code: main('java.lang.classfile.ClassFile cf = java.lang.classfile.ClassFile.of();') },
    lessonIds: ['p-bytecode'],
  },
  {
    id: 'virtual-threads-no-pinning',
    release: 24,
    title: 'Virtual threads no longer pin on synchronized',
    summary: 'Blocking inside synchronized blocks releases the carrier thread, removing the main reason to rewrite synchronized code for virtual threads.',
    category: 'jvm',
    status: 'final',
    jep: 491,
  },
  {
    id: 'security-manager-disabled',
    release: 24,
    title: 'Security Manager permanently disabled',
    summary: 'It can no longer be enabled; sandboxing must happen at the process or container level (as JavaForge\'s execution service does).',
    category: 'security',
    status: 'removed',
    jep: 486,
  },
  {
    id: 'post-quantum',
    release: 24,
    title: 'Quantum-resistant ML-KEM and ML-DSA',
    summary: 'Post-quantum key encapsulation and digital signature algorithms in the standard security providers.',
    category: 'security',
    status: 'final',
    jep: 496,
  },

  // ---------------------------------------------------------------- Java 25
  {
    id: 'compact-source-files',
    release: 25,
    title: 'Compact source files and instance main methods',
    summary: 'A source file can contain just `void main() { ... }`; java.lang.IO offers simple console I/O.',
    category: 'language',
    status: 'final',
    jep: 512,
    previewedIn: [21, 22, 23, 24],
    example: 'void main() {\n    IO.println("Hello, Java 25");\n}',
    // System.out keeps the probe valid for the 21-24 previews; java.lang.IO arrived later.
    probe: { fileName: 'Hello.java', code: 'void main() {\n    System.out.println("Hello");\n}\n' },
    lessonIds: ['f-first-program'],
  },
  {
    id: 'flexible-constructors',
    release: 25,
    title: 'Flexible constructor bodies',
    summary: 'Statements such as argument validation may appear before super(...) or this(...).',
    category: 'language',
    status: 'final',
    jep: 513,
    previewedIn: [22, 23, 24],
    probe: { code: 'class Base { Base(int v) { } }\nclass Child extends Base {\n    Child(int v) {\n        if (v < 0) throw new IllegalArgumentException("negative");\n        super(v);\n    }\n}\npublic class Main { public static void main(String[] a) { new Child(1); } }' },
    lessonIds: ['o-classes-objects'],
  },
  {
    id: 'module-imports',
    release: 25,
    title: 'Module import declarations',
    summary: '`import module java.base;` imports every package a module exports.',
    category: 'language',
    status: 'final',
    jep: 511,
    previewedIn: [23, 24],
    probe: { code: 'import module java.base;\npublic class Main { public static void main(String[] a) { List<String> l = List.of(); } }' },
  },
  {
    id: 'scoped-values',
    release: 25,
    title: 'Scoped values',
    summary: 'Immutable, inheritable per-scope context — a safer, cheaper alternative to ThreadLocal, especially with virtual threads.',
    category: 'api',
    status: 'final',
    jep: 506,
    previewedIn: [21, 22, 23, 24],
    probe: { code: main('ScopedValue<String> USER = ScopedValue.newInstance(); ScopedValue.where(USER, "ada").run(() -> System.out.println(USER.get()));') },
  },
  {
    id: 'kdf-api',
    release: 25,
    title: 'Key Derivation Function API',
    summary: 'Standard API for KDFs such as HKDF.',
    category: 'security',
    status: 'final',
    jep: 510,
    probe: { code: main('javax.crypto.KDF kdf = javax.crypto.KDF.getInstance("HKDF-SHA256");') },
  },
  {
    id: 'compact-object-headers',
    release: 25,
    title: 'Compact object headers',
    summary: 'A product option (-XX:+UseCompactObjectHeaders) that shrinks object headers to 8 bytes, saving heap.',
    category: 'jvm',
    status: 'final',
    jep: 519,
  },
  {
    id: 'structured-concurrency',
    release: 25,
    title: 'Structured concurrency (preview)',
    summary: 'Treat a group of concurrent subtasks as one unit with StructuredTaskScope. Still a preview API.',
    category: 'api',
    status: 'preview',
    probe: { code: main('try (var scope = java.util.concurrent.StructuredTaskScope.open()) { var t = scope.fork(() -> 1); scope.join(); }') },
  },

  // ---------------------------------------------------------------- Java 26
  {
    id: 'http3',
    release: 26,
    title: 'HTTP/3 support in the HTTP client',
    summary: 'HttpClient can negotiate HTTP/3 (HttpClient.Version.HTTP_3) with discovery options in HttpOption.',
    category: 'api',
    status: 'final',
    probe: { code: main('java.net.http.HttpClient.Version v = java.net.http.HttpClient.Version.HTTP_3;') },
  },
  {
    id: 'applet-removed',
    release: 26,
    title: 'Applet API removed',
    summary: 'java.applet and javax.swing.JApplet, deprecated since Java 9, are gone.',
    category: 'removal',
    status: 'removed',
    probe: { code: '@SuppressWarnings("removal")\npublic class Main { java.applet.Applet a; public static void main(String[] x) { } }' },
  },
  {
    id: 'api-26-conveniences',
    release: 26,
    title: 'API conveniences',
    summary: 'UUID.ofEpochMillis, Comparator.min/max, Duration.MIN/MAX, Instant.plusSaturating, String.compareToFoldCase, BigInteger.rootn and SQL JSON/DECFLOAT types.',
    category: 'api',
    status: 'final',
    probe: { code: main('java.util.UUID u = java.util.UUID.ofEpochMillis(0L); String m = java.util.Comparator.<String>naturalOrder().max("a", "b"); java.time.Duration d = java.time.Duration.MAX; int c = "a".compareToFoldCase("A");') },
  },
  {
    id: 'lazy-constants',
    release: 26,
    title: 'Lazy constants (preview)',
    summary: 'LazyConstant (previewed as StableValue in 25) and List.ofLazy/Map.ofLazy: values computed at most once and then treated as constants by the JIT. The API is still changing between releases.',
    category: 'api',
    status: 'preview',
    probe: { code: main('LazyConstant<String> c = LazyConstant.of(() -> "x"); String s = c.get();') },
  },

  // ---------------------------------------------------------------- Java 27
  {
    id: 'inverse-hyperbolic',
    release: 27,
    title: 'Math.asinh, acosh and atanh',
    summary: 'Inverse hyperbolic functions in Math and StrictMath.',
    category: 'api',
    status: 'final',
    probe: { code: main('double v = Math.asinh(1.0) + Math.acosh(2.0) + Math.atanh(0.5);') },
  },
  {
    id: 'api-27-conveniences',
    release: 27,
    title: 'API additions',
    summary: 'String.encodedLength(Charset), BigDecimal.rootn and KeyStore.getCreationInstant.',
    category: 'api',
    status: 'final',
    probe: { code: main('int n = "abc".encodedLength(java.nio.charset.StandardCharsets.UTF_8); java.math.BigDecimal r = java.math.BigDecimal.valueOf(27).rootn(3, java.math.MathContext.DECIMAL64);') },
  },
  {
    id: 'set-of-lazy',
    release: 27,
    title: 'Set.ofLazy (preview)',
    summary: 'Lazy constant sets join List.ofLazy and Map.ofLazy in the lazy constants preview.',
    category: 'api',
    status: 'preview',
    probe: { code: main('java.util.Set<String> s = java.util.Set.ofLazy(java.util.Set.of("a"), k -> true);') },
  },
];

/** Recommended upgrade checklists between LTS releases. */
export const UPGRADE_PATHS: { from: number; to: number; checklist: string[] }[] = [
  {
    from: 8,
    to: 11,
    checklist: [
      'Add Jakarta EE dependencies for JAXB/JAX-WS (javax.xml.bind and friends were removed).',
      'Replace uses of internal APIs reported by `jdeps --jdk-internals`.',
      'Upgrade build plugins and libraries that use bytecode tools (ASM, Mockito, Lombok, Byte Buddy) to versions that understand the new class file versions.',
      'Review GC: G1 is now the default; remove obsolete flags such as -XX:+UseConcMarkSweepGC (CMS was removed in 14).',
    ],
  },
  {
    from: 11,
    to: 17,
    checklist: [
      'Fix illegal reflective access: --illegal-access no longer works; add --add-opens only as a temporary workaround.',
      'Replace Nashorn if you embedded JavaScript.',
      'Adopt records, text blocks, switch expressions and instanceof patterns gradually where they simplify code.',
      'Spring Boot 3 / Jakarta EE 9+ require Java 17 and the jakarta.* namespace.',
    ],
  },
  {
    from: 17,
    to: 21,
    checklist: [
      'Consider virtual threads for blocking I/O workloads (thread-per-request servers); measure first.',
      'Use pattern matching for switch with sealed types for domain modelling.',
      'Watch for warnings about dynamically loaded agents (JEP 451) in tools such as mocking libraries.',
      'Remember default charset is UTF-8 since 18: check code that relied on platform encodings.',
    ],
  },
  {
    from: 21,
    to: 25,
    checklist: [
      'Remove any Security Manager usage — it is permanently disabled since 24.',
      'Re-test virtual-thread code: pinning on synchronized was removed in 24, so earlier workarounds may be unnecessary.',
      'Replace sun.misc.Unsafe memory access with VarHandles or the FFM API (now warned about at runtime).',
      'Evaluate compact object headers (-XX:+UseCompactObjectHeaders) and AOT cache options for memory and startup gains.',
    ],
  },
];

/** JDK versions the probe script tests against. */
export const PROBED_JDKS = [8, 11, 17, 21, 22, 23, 24, 25, 26, 27] as const;
