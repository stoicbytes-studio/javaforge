import type { CurriculumModule } from '@/types/curriculum';

export const platformModule: CurriculumModule = {
  id: 'jvm-platform',
  order: 2,
  title: 'JDK, JRE, JVM, Bytecode and Platform Independence',
  shortTitle: 'Java Platform',
  summary: 'What each part of the platform does, what bytecode looks like, and how classes are packaged and found at runtime.',
  level: 'core',
  prerequisites: ['fundamentals'],
  bossChallengeId: 'boss-classfile-inspector',
  lessons: [
    // -----------------------------------------------------------------------
    {
      id: 'p-jdk-jre-jvm',
      moduleId: 'jvm-platform',
      title: 'JDK vs JRE vs JVM, distributions and releases',
      summary: 'Which piece does what, which Java version to choose, and how runtimes are shipped today.',
      estimatedMinutes: 20,
      difficulty: 'beginner',
      prerequisites: ['f-first-program'],
      versionNotes: [
        { feature: 'Six-month feature release cadence', since: 10 },
        { feature: 'No separate JRE download from Oracle; jlink custom runtimes', since: 11 },
        { feature: 'LTS releases', since: 8, note: '8, 11, 17, 21 and 25 are long-term support releases' },
      ],
      objectives: [
        'Explain the roles of the JDK, the JRE and the JVM.',
        'Distinguish the Java specification from implementations and vendor builds.',
        'Choose a Java version and runtime image for a project.',
      ],
      plainEnglish: `Think of three nested boxes:

- The **JVM** (Java Virtual Machine) is the engine that runs bytecode.
- The **JRE** (Java Runtime Environment) is the JVM plus the standard class library (\`java.lang\`, \`java.util\`, …) — everything needed to *run* Java programs.
- The **JDK** (Java Development Kit) is the JRE plus developer tools such as \`javac\`, \`jar\`, \`javadoc\`, \`jshell\` and diagnostic tools — everything needed to *build* Java programs.

As a developer you install a JDK. Servers only need a runtime.`,
      technical: `### Specification vs implementation
"Java" is defined by specifications: the Java Language Specification (JLS), the Java Virtual Machine Specification (JVMS) and the Java SE API. **OpenJDK** is the open-source reference implementation. HotSpot is its JVM; alternatives include Eclipse OpenJ9 and GraalVM. Vendors (Eclipse Temurin, Amazon Corretto, Azul Zulu, Oracle, Microsoft, Red Hat) ship builds of OpenJDK that pass the compatibility test kit.

### Releases
Since Java 10 a feature release ships every six months. Some releases are designated **LTS** and receive long-term updates: 8, 11, 17, 21 and 25. Non-LTS releases are supported only until the next release, so most production systems standardise on an LTS.

### The JRE today
Since Java 11, Oracle no longer ships a separate JRE; instead \`jlink\` assembles a custom runtime containing only the modules your application needs. Many vendors still publish "JRE" container images that are simply a trimmed JDK.

### JDK tools you will meet
- \`javac\` (compiler), \`java\` (launcher), \`jar\`, \`javadoc\`, \`jshell\` (REPL, Java 9+)
- \`jlink\`, \`jdeps\` (module/dependency analysis)
- Diagnostics: \`jcmd\`, \`jstack\`, \`jmap\`, \`jfr\` (Flight Recorder), \`jconsole\``,
      whyItExists: `Separating the specification from implementations lets many vendors compete on performance and support while every compliant runtime runs the same bytecode. Splitting tools from the runtime keeps production deployments smaller and reduces their attack surface.`,
      whenToUse: [
        'Install a JDK on development machines and CI agents.',
        'Use a runtime-only image (or a jlink-built runtime) in production containers.',
        'Standardise on an LTS release for production services.',
      ],
      whenNotToUse: [
        'Do not ship the full JDK in production containers unless you need its diagnostic tools there.',
        'Do not run production on a non-LTS release unless you can upgrade every six months.',
      ],
      examples: [
        {
          id: 'runtime-info',
          title: 'Which runtime am I on?',
          runnable: true,
          code: `public class Main {
    public static void main(String[] args) {
        Runtime.Version v = Runtime.version();
        System.out.println("Feature release: " + v.feature());
        System.out.println("Full version:    " + System.getProperty("java.version"));
        System.out.println("Vendor:          " + System.getProperty("java.vendor"));
        System.out.println("VM:              " + System.getProperty("java.vm.name"));
        System.out.println("OS:              " + System.getProperty("os.name") + " " + System.getProperty("os.arch"));
        System.out.println("CPUs visible:    " + Runtime.getRuntime().availableProcessors());
        System.out.println("Max heap (MB):   " + Runtime.getRuntime().maxMemory() / (1024 * 1024));
    }
}`,
          explanation: 'Output depends on the machine that runs it. In containers, availableProcessors and maxMemory reflect the container limits (Java 10+ is container-aware).',
        },
      ],
      walkthrough: {
        exampleId: 'runtime-info',
        steps: [
          { lines: [3, 4], text: '`Runtime.version()` (Java 9+) returns a structured version; `feature()` is the major release number such as 17 or 21.' },
          { lines: [5, 7], text: 'System properties describe the exact build, the vendor that produced it and the JVM implementation (e.g. "OpenJDK 64-Bit Server VM").' },
          { lines: [8, 8], text: 'The same bytecode runs on any OS/architecture with a JVM — that is platform independence.' },
          { lines: [9, 10], text: 'The JVM sizes its default heap and thread pools from the CPUs and memory it can see, including container limits.' },
        ],
      },
      realWorld: {
        title: 'Shrinking a service image from 450 MB to 90 MB',
        scenario: `A team built its Docker image \`FROM\` a full JDK image, so every deployment shipped compilers, documentation tools and debuggers. Image pulls slowed autoscaling and security scanners flagged tools that production never used.

They switched to a multi-stage build: compile with a JDK image, then copy the jar into a runtime-only base image (or a runtime produced by \`jlink --add-modules $(jdeps --print-module-deps app.jar)\`). Startup was unchanged, the image shrank by about 80%, and the attack surface fell with it.`,
      },
      commonMistakes: [
        {
          mistake: 'Saying "the JVM compiles Java source code".',
          why: 'javac compiles source to bytecode. The JVM loads bytecode and may JIT-compile it to machine code at runtime.',
          fix: 'Keep the two compilers distinct: javac (ahead of time, source → bytecode) and the JIT (runtime, bytecode → native).',
        },
        {
          mistake: 'Assuming every "Java 17" runtime behaves identically in production.',
          why: 'Builds share the specification but differ in default GC options, patch level and support policy.',
          fix: 'Pin vendor and patch version in your build and container images, and patch regularly.',
        },
        {
          mistake: 'Running production on the latest non-LTS release without an upgrade plan.',
          why: 'Non-LTS releases stop receiving security updates six months later.',
          fix: 'Use an LTS, or commit to upgrading every release.',
        },
      ],
      checks: [
        {
          id: 'p1-c1',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'A production container only needs to run an already-built jar. What is the minimal requirement?',
          options: [
            { id: 'a', text: 'A full JDK, because the JVM needs javac at runtime' },
            { id: 'b', text: 'A Java runtime (JVM + required class library modules)' },
            { id: 'c', text: 'Only the JVM binary, without any class library' },
            { id: 'd', text: 'The Java source code and javac' },
          ],
          correctOptionId: 'b',
          explanation: 'Running bytecode needs the JVM and the platform classes it uses (java.base at minimum). javac is a build-time tool.',
        },
        {
          id: 'p1-c2',
          kind: 'multi-select',
          dimension: 'conceptual',
          prompt: 'Which of these Java releases are long-term support (LTS) releases? Select all that apply.',
          options: [
            { id: 'a', text: 'Java 11' },
            { id: 'b', text: 'Java 14' },
            { id: 'c', text: 'Java 17' },
            { id: 'd', text: 'Java 21' },
            { id: 'e', text: 'Java 22' },
          ],
          correctOptionIds: ['a', 'c', 'd'],
          explanation: '8, 11, 17, 21 and 25 are LTS. Feature releases in between (12–16, 18–20, 22–24) are short-lived.',
        },
        {
          id: 'p1-c3',
          kind: 'multi-select',
          dimension: 'runtime',
          prompt: 'Which statements about how Java code runs are true? Select all that apply.',
          options: [
            { id: 'a', text: 'javac compiles source code to bytecode' },
            { id: 'b', text: 'The JVM can interpret bytecode' },
            { id: 'c', text: 'The JIT compiles hot bytecode to native machine code at runtime' },
            { id: 'd', text: 'javac produces native machine code for the current CPU' },
          ],
          correctOptionIds: ['a', 'b', 'c'],
          explanation: 'Java is both compiled (to bytecode) and, at runtime, interpreted and JIT-compiled. javac never emits native code.',
        },
        {
          id: 'p1-c4',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'What does `jlink` do?',
          options: [
            { id: 'a', text: 'Links object files into a native executable' },
            { id: 'b', text: 'Creates a custom runtime image containing only the modules an application needs' },
            { id: 'c', text: 'Resolves Maven dependencies' },
            { id: 'd', text: 'Profiles a running JVM' },
          ],
          correctOptionId: 'b',
          explanation: 'jlink (Java 9+) assembles a runtime from a chosen set of modules, producing a smaller, self-contained runtime.',
        },
      ],
      challengeIds: [],
      masteryCriteria: [
        'Explain JDK vs JRE vs JVM without mixing up compilers.',
        'Name the current LTS releases and why they matter.',
        'Describe how to build a minimal production runtime image.',
      ],
      relatedLessonIds: ['f-first-program', 'p-bytecode'],
      revision: [
        { id: 'r1', question: 'What is the difference between the JDK, the JRE and the JVM?', answer: 'JVM: executes bytecode. JRE: JVM + standard class library, enough to run programs. JDK: JRE + development tools (javac, jar, jshell, jlink, diagnostics).' },
        { id: 'r2', question: 'Which Java releases are LTS?', answer: '8, 11, 17, 21 and 25.' },
        { id: 'r3', question: 'How do you produce a minimal runtime for production?', answer: 'Use a runtime-only base image or jlink with the modules reported by jdeps.' },
      ],
    },

    // -----------------------------------------------------------------------
    {
      id: 'p-bytecode',
      moduleId: 'jvm-platform',
      title: 'Bytecode, class files and platform independence',
      summary: 'What is inside a .class file, how the stack-based instruction set works, and what javap shows.',
      estimatedMinutes: 30,
      difficulty: 'intermediate',
      prerequisites: ['p-jdk-jre-jvm'],
      versionNotes: [
        { feature: 'invokedynamic instruction', since: 8, note: 'Added in Java 7, used for lambdas since 8' },
        { feature: 'String concatenation via invokedynamic', since: 11, note: 'JEP 280, Java 9' },
      ],
      objectives: [
        'Describe the main parts of a class file.',
        'Read simple javap -c output and trace the operand stack.',
        'Map class file major versions to Java releases.',
        'Explain compile-time constant folding.',
      ],
      plainEnglish: `Bytecode is a compact list of simple instructions such as "load this variable", "add the top two numbers", "call this method". Each instruction takes one byte to identify — hence *byte*code.

The JVM is a **stack machine**: instructions push values onto an operand stack and pop them off. \`a + b\` becomes "push a, push b, add".

You can see the bytecode of any class with the JDK tool \`javap -c\`.`,
      technical: `### Class file layout (JVMS §4)
1. Magic number \`0xCAFEBABE\`.
2. Minor and major version — major 52 = Java 8, 55 = 11, 61 = 17, 65 = 21, 69 = 25 (major − 44 = release).
3. **Constant pool**: literals and symbolic references to classes, fields and methods.
4. Access flags, this/super class, interfaces.
5. Fields and methods; each method has a \`Code\` attribute with bytecode, max stack depth, local variable count and exception table.
6. Attributes such as line numbers (for stack traces) and source file name.

### A method in bytecode
\`\`\`java
static int add(int a, int b) { return a + b; }
\`\`\`
\`javap -c\` shows:
\`\`\`
0: iload_0      // push local 0 (a)
1: iload_1      // push local 1 (b)
2: iadd         // pop two ints, push their sum
3: ireturn      // return the int on top of the stack
\`\`\`
For instance methods, local slot 0 holds \`this\`.

### Method invocation instructions
- \`invokestatic\` — static methods
- \`invokevirtual\` — instance methods, dispatched on the runtime class
- \`invokeinterface\` — interface methods
- \`invokespecial\` — constructors, private methods and \`super\` calls
- \`invokedynamic\` — call sites linked at runtime by a bootstrap method; used for lambdas and, since Java 9, string concatenation

### Verification
Before running a class, the JVM's verifier checks that bytecode is type-safe: no stack underflow, no treating an int as a reference, no jumping into the middle of an instruction. This is a key part of Java's safety model.

### Constant folding
The compiler evaluates **compile-time constant expressions** (literals and \`final\` variables initialised with constants). \`"Ja" + "va"\` is stored as \`"Java"\` in the constant pool, which is why such strings are interned.`,
      whyItExists: `A portable, verifiable instruction set lets one compiled artifact run on every platform while the JVM still optimises for the actual CPU. A stack-based design keeps bytecode compact and easy for compilers to emit and for the JIT to analyse.`,
      whenToUse: [
        'Use `javap -c -v` to understand what the compiler generated: boxing, string concatenation, lambdas, synthetic methods.',
        'Check class file versions when diagnosing UnsupportedClassVersionError.',
        'Read bytecode when a library behaves unexpectedly and the source is unavailable.',
      ],
      whenNotToUse: [
        'Do not micro-optimise source code by counting bytecode instructions; the JIT rewrites hot code completely.',
        'Do not generate or modify bytecode by hand — use libraries such as ASM or ByteBuddy (or the Class-File API, final in Java 24) when you truly need it.',
      ],
      examples: [
        {
          id: 'read-classfile',
          title: 'Reading our own class file header',
          runnable: true,
          code: `import java.io.DataInputStream;
import java.io.IOException;
import java.io.InputStream;

public class Main {
    public static void main(String[] args) throws IOException {
        try (InputStream raw = Main.class.getResourceAsStream("Main.class");
             DataInputStream in = new DataInputStream(raw)) {
            int magic = in.readInt();
            int minor = in.readUnsignedShort();
            int major = in.readUnsignedShort();
            System.out.printf("Magic: %X%n", magic);
            System.out.println("Major version: " + major + " (Java " + (major - 44) + ")");
            System.out.println("Minor version: " + minor);
        }
    }
}`,
          expectedOutput: `Magic: CAFEBABE
Major version: 65 (Java 21)
Minor version: 0`,
          explanation: 'The verified output reflects compilation with JDK 21. A different compiler or --release flag changes the major version.',
        },
        {
          id: 'constant-folding',
          title: 'Compile-time constants are folded',
          runnable: true,
          code: `public class Main {
    static final String PREFIX = "Ja";

    public static void main(String[] args) {
        String folded = PREFIX + "va";        // constant expression: computed by javac
        String suffix = "va";
        String runtime = "Ja" + suffix;       // suffix is not final: computed at runtime
        System.out.println(folded == "Java");
        System.out.println(runtime == "Java");
        System.out.println(runtime.equals("Java"));
    }
}`,
          expectedOutput: `true
false
true`,
          explanation: 'Never rely on == for strings in real code; this example only shows what the compiler does.',
        },
      ],
      walkthrough: {
        exampleId: 'read-classfile',
        steps: [
          { lines: [7, 8], text: 'The class loader can return the raw bytes of a loaded class as a resource. try-with-resources closes both streams.' },
          { lines: [9, 9], text: 'Every class file starts with the 4-byte magic number 0xCAFEBABE.' },
          { lines: [10, 11], text: 'Next come the minor and major version as unsigned 16-bit numbers, big-endian (DataInputStream reads big-endian).' },
          { lines: [12, 14], text: 'Major 65 means the class targets Java 21. A Java 17 JVM (max 61) would refuse to load it.' },
        ],
      },
      realWorld: {
        title: 'A library that only failed in production',
        scenario: `A team upgraded a utility library and everything passed locally on JDK 21. In production (Java 17) the service crashed at startup with \`UnsupportedClassVersionError\` coming from inside the library jar.

\`javap -v\` on one of the library's classes showed \`major version: 65\`: the new library release had been compiled for Java 21. Checking class-file versions of dependencies — or running CI on the same Java version as production, or using tools like the Maven Enforcer plugin's bytecode version rule — catches this before deployment.`,
      },
      commonMistakes: [
        {
          mistake: 'Thinking bytecode is interpreted forever.',
          why: 'HotSpot profiles execution and JIT-compiles hot methods to optimised native code.',
          fix: 'Measure after warm-up when benchmarking (and use JMH).',
        },
        {
          mistake: 'Confusing `--release` with `-source`/`-target`.',
          why: '`-target 17` with a newer JDK can still link against APIs that do not exist in Java 17.',
          fix: 'Use `javac --release 17` (or maven.compiler.release), which also restricts the API to that release.',
        },
        {
          mistake: 'Assuming `final` locals and fields always fold.',
          why: 'Only variables initialised with constant expressions of primitive or String type are constants.',
          fix: '`final String s = compute();` is not a compile-time constant.',
        },
      ],
      checks: [
        {
          id: 'p2-c1',
          kind: 'mcq',
          dimension: 'runtime',
          prompt: 'Which bytecode sequence corresponds to `return a + b;` in a static method with int parameters a and b?',
          options: [
            { id: 'a', text: 'iadd, iload_0, iload_1, ireturn' },
            { id: 'b', text: 'iload_0, iload_1, iadd, ireturn' },
            { id: 'c', text: 'iload_1, iload_2, iadd, ireturn' },
            { id: 'd', text: 'add r0, r1; ret' },
          ],
          correctOptionId: 'b',
          explanation: 'Push both operands, add them, return. In a static method parameters start at slot 0; in an instance method slot 0 is `this`.',
          hints: ['The JVM is a stack machine: operands are pushed before the operation.'],
        },
        {
          id: 'p2-c2',
          kind: 'mcq',
          dimension: 'runtime',
          prompt: 'A class file has major version 61. Which is the oldest Java release that can load it?',
          options: [
            { id: 'a', text: 'Java 11' },
            { id: 'b', text: 'Java 16' },
            { id: 'c', text: 'Java 17' },
            { id: 'd', text: 'Java 21' },
          ],
          correctOptionId: 'c',
          explanation: 'Major version − 44 = Java release, so 61 is Java 17. Newer JVMs can load older class files; older JVMs cannot load newer ones.',
        },
        {
          id: 'p2-c3',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this print?',
          code: `public class Main {
    public static void main(String[] args) {
        final String a = "Hello, ";
        String b = "Hello, ";
        String x = a + "World";
        String y = b + "World";
        System.out.println((x == "Hello, World") + " " + (y == "Hello, World"));
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
            '`a` is a final local initialised with a constant, so `a + "World"` is a compile-time constant and refers to the interned literal. `b` is not final, so `y` is built at runtime as a new String.',
          hints: ['Which of the two expressions can javac evaluate before the program runs?'],
        },
        {
          id: 'p2-c4',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'What is invokedynamic primarily used for in Java code compiled by javac?',
          options: [
            { id: 'a', text: 'Calling native C code' },
            { id: 'b', text: 'Linking lambdas and (since Java 9) string concatenation at runtime' },
            { id: 'c', text: 'Calling static methods faster' },
            { id: 'd', text: 'Reflection' },
          ],
          correctOptionId: 'b',
          explanation: 'invokedynamic defers linkage to a bootstrap method. LambdaMetafactory creates lambda implementations; StringConcatFactory builds optimised concatenation.',
        },
        {
          id: 'p2-c5',
          kind: 'mcq',
          dimension: 'runtime',
          prompt: 'Why does the JVM verify bytecode before executing it?',
          options: [
            { id: 'a', text: 'To make the program run faster' },
            { id: 'b', text: 'To guarantee type safety and stack integrity even for bytecode not produced by javac' },
            { id: 'c', text: 'To check code style' },
            { id: 'd', text: 'To translate it into source code' },
          ],
          correctOptionId: 'b',
          explanation: 'Bytecode can come from any compiler or be tampered with. Verification prevents memory-unsafe operations such as using an int as a reference.',
        },
      ],
      challengeIds: ['boss-classfile-inspector'],
      masteryCriteria: [
        'Trace a short javap -c listing on the operand stack.',
        'Map class file versions to Java releases.',
        'Explain what constant folding does to string literals.',
      ],
      relatedLessonIds: ['p-jdk-jre-jvm', 'r-memory-areas', 't-strings'],
      revision: [
        { id: 'r1', question: 'Name the main sections of a class file.', answer: 'Magic (CAFEBABE), version, constant pool, access flags/this/super/interfaces, fields, methods (with Code attributes) and attributes.' },
        { id: 'r2', question: 'How do you convert a class file major version to a Java release?', answer: 'Subtract 44: 52 → 8, 55 → 11, 61 → 17, 65 → 21.' },
        { id: 'r3', question: 'Which invoke instruction handles constructors and private methods?', answer: 'invokespecial.' },
      ],
    },

    // -----------------------------------------------------------------------
    {
      id: 'p-packages-classpath',
      moduleId: 'jvm-platform',
      title: 'Packages, the classpath, JARs and modules',
      summary: 'How the JVM finds classes, what goes wrong when it cannot, and what the module system adds.',
      estimatedMinutes: 30,
      difficulty: 'intermediate',
      prerequisites: ['p-bytecode'],
      versionNotes: [
        { feature: 'Java Platform Module System (module-info.java)', since: 9 },
        { feature: 'Strong encapsulation of JDK internals by default', since: 17, note: 'JEP 403' },
      ],
      objectives: [
        'Organise code into packages and explain what import actually does.',
        'Explain how class loaders search the classpath.',
        'Distinguish ClassNotFoundException from NoClassDefFoundError.',
        'Describe what modules add over the classpath.',
      ],
      plainEnglish: `A **package** is a namespace that groups related classes, like a folder: \`com.shop.billing.Invoice\`. The full name prevents clashes between classes with the same simple name.

When your program needs a class, the JVM asks a **class loader** to find its \`.class\` file. Class loaders search the **classpath** — a list of folders and JAR files you give the JVM with \`-cp\`.

A **JAR** is a ZIP file of classes plus a manifest. Since Java 9 you can also define **modules**, which state explicitly what they need and what they expose.`,
      technical: `### Packages and imports
The package declaration must match the directory structure under a source root (\`com/shop/billing/Invoice.java\`). \`import\` is purely a compile-time convenience: it lets you write \`Invoice\` instead of \`com.shop.billing.Invoice\`. It does not load or include anything at runtime. \`java.lang\` is imported automatically.

### Class loaders (delegation model)
Java 9+ has three built-in loaders:
1. **Bootstrap** — core modules such as \`java.base\` (shown as \`null\` from Java code).
2. **Platform** — other Java SE modules such as \`java.sql\`.
3. **Application** (system) — your classpath or module path.

A loader first delegates to its parent and only searches its own locations if the parent cannot find the class. Classes are loaded lazily, on first active use.

### When classes go missing
- \`ClassNotFoundException\` (checked): code asked for a class **by name** at runtime (\`Class.forName\`, \`ClassLoader.loadClass\`) and it was not found.
- \`NoClassDefFoundError\` (error): a class that **was present at compile time** cannot be loaded now — the jar is missing at runtime, or its static initialiser failed earlier (\`ExceptionInInitializerError\` first, then NoClassDefFoundError on later uses).

### JARs
A JAR's \`META-INF/MANIFEST.MF\` can declare \`Main-Class\` (making \`java -jar app.jar\` work) and \`Class-Path\`. Build tools usually produce a single "fat" jar or a layered image.

### Modules (JPMS)
A \`module-info.java\` declares \`requires\` (dependencies) and \`exports\` (public API packages). Non-exported packages are inaccessible even to reflection unless \`opens\`. Since Java 17, JDK internals are strongly encapsulated: deep reflection into them throws \`InaccessibleObjectException\` unless the launcher is given \`--add-opens\`.`,
      whyItExists: `Packages prevent naming collisions in an ecosystem of millions of libraries. Lazy, delegating class loading keeps startup fast and lets containers such as application servers isolate applications. Modules add reliable configuration (missing dependencies fail at startup, not mid-request) and strong encapsulation of internals.`,
      whenToUse: [
        'Use reverse-domain package names (com.company.product.feature).',
        'Organise packages by feature rather than by technical layer for larger applications.',
        'Use modules for libraries or applications that benefit from strong encapsulation and jlink images.',
      ],
      whenNotToUse: [
        'Do not use the default (unnamed) package beyond small exercises; it cannot be imported.',
        'Do not depend on JDK internal classes (sun.*, jdk.internal.*); they change without notice and are encapsulated.',
      ],
      examples: [
        {
          id: 'class-loading',
          title: 'Loading classes by name',
          runnable: true,
          code: `public class Main {
    static void tryLoad(String name) {
        try {
            Class<?> c = Class.forName(name);
            System.out.println("Loaded: " + c.getName());
        } catch (ClassNotFoundException e) {
            System.out.println("Not found: " + e.getMessage());
        }
    }

    public static void main(String[] args) {
        tryLoad("java.util.ArrayList");
        tryLoad("com.example.Missing");
    }
}`,
          expectedOutput: `Loaded: java.util.ArrayList
Not found: com.example.Missing`,
        },
        {
          id: 'loaders',
          title: 'Which loader defined each class?',
          runnable: true,
          code: `public class Main {
    static String describe(ClassLoader loader) {
        return loader == null ? "bootstrap" : loader.getName();
    }

    public static void main(String[] args) {
        System.out.println("String:     " + describe(String.class.getClassLoader()));
        System.out.println("Connection: " + describe(java.sql.Connection.class.getClassLoader()));
        System.out.println("Main:       " + describe(Main.class.getClassLoader()));
        System.out.println("Parent of app: " + describe(Main.class.getClassLoader().getParent()));
    }
}`,
          expectedOutput: `String:     bootstrap
Connection: platform
Main:       app
Parent of app: platform`,
          explanation: 'java.base classes come from the bootstrap loader (reported as null), java.sql from the platform loader, and your code from the application loader.',
        },
      ],
      walkthrough: {
        exampleId: 'loaders',
        steps: [
          { lines: [2, 4], text: 'The bootstrap loader is implemented inside the JVM and is represented as null in Java code.' },
          { lines: [7, 7], text: '`String` lives in java.base, loaded by the bootstrap loader at JVM startup.' },
          { lines: [8, 8], text: '`java.sql` is a Java SE module outside java.base, so the platform loader defines it.' },
          { lines: [9, 10], text: 'Our class comes from the application loader, whose parent is the platform loader: requests are delegated upwards first.' },
        ],
      },
      realWorld: {
        title: 'NoClassDefFoundError after a "harmless" dependency cleanup',
        scenario: `A developer removed a dependency that "nothing imported anymore". The build passed because another library still compiled against it as \`provided\`, but in production the first request through that code path failed with \`java.lang.NoClassDefFoundError: com/fasterxml/jackson/databind/ObjectMapper\`.

The class existed at compile time but not on the runtime classpath. Running \`mvn dependency:tree\` (or \`jdeps\`) shows who needs what; an integration test that boots the packaged artifact catches missing runtime dependencies before release.`,
      },
      commonMistakes: [
        {
          mistake: 'Thinking `import java.util.*;` loads every class in java.util.',
          why: 'Imports only affect name resolution at compile time; classes load lazily when used.',
          fix: 'Prefer explicit imports for readability, but know there is no runtime cost either way.',
        },
        {
          mistake: 'Treating NoClassDefFoundError and ClassNotFoundException as the same problem.',
          why: 'One is a dynamic lookup that failed; the other is a statically linked class missing or failed to initialise.',
          fix: 'For NoClassDefFoundError, check the runtime classpath and look for an earlier ExceptionInInitializerError.',
        },
        {
          mistake: 'Using `;` as the classpath separator on Linux/macOS.',
          why: 'The separator is `:` on Unix-like systems and `;` on Windows.',
          fix: 'Use the platform separator, or let your build tool construct the classpath.',
        },
      ],
      checks: [
        {
          id: 'p3-c1',
          kind: 'mcq',
          dimension: 'runtime',
          prompt: 'A class compiled fine, but the first call to it in production throws NoClassDefFoundError. What is the most likely cause?',
          options: [
            { id: 'a', text: 'A typo in a Class.forName string' },
            { id: 'b', text: 'Its jar is missing from the runtime classpath, or its static initialiser previously failed' },
            { id: 'c', text: 'The heap is full' },
            { id: 'd', text: 'An import statement is missing' },
          ],
          correctOptionId: 'b',
          explanation: 'NoClassDefFoundError means a class known at compile time cannot be defined now. A failed static initialiser causes it on every use after the first ExceptionInInitializerError.',
        },
        {
          id: 'p3-c2',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'What does an import statement do at runtime?',
          options: [
            { id: 'a', text: 'Loads the imported classes eagerly' },
            { id: 'b', text: 'Nothing — it only lets the compiler resolve simple names' },
            { id: 'c', text: 'Copies the classes into your jar' },
            { id: 'd', text: 'Adds the package to the classpath' },
          ],
          correctOptionId: 'b',
          explanation: 'Bytecode always uses fully qualified names. Imports vanish after compilation.',
        },
        {
          id: 'p3-c3',
          kind: 'mcq',
          dimension: 'runtime',
          prompt: 'In what order does the application class loader look for a class?',
          options: [
            { id: 'a', text: 'Classpath first, then parent loaders' },
            { id: 'b', text: 'Delegates to the platform loader (which delegates to bootstrap) first, then searches the classpath' },
            { id: 'c', text: 'Random order for performance' },
            { id: 'd', text: 'Only the classpath' },
          ],
          correctOptionId: 'b',
          explanation: 'Parent-first delegation ensures core classes such as java.lang.String cannot be replaced by a class on the classpath.',
        },
        {
          id: 'p3-c4',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'On Java 17, a library uses reflection to call setAccessible(true) on a private field of a JDK internal class and fails. Why?',
          options: [
            { id: 'a', text: 'Reflection was removed in Java 17' },
            { id: 'b', text: 'JDK internals are strongly encapsulated; deep reflection needs --add-opens' },
            { id: 'c', text: 'Private fields cannot exist in JDK classes' },
            { id: 'd', text: 'The library must be compiled with -g' },
          ],
          correctOptionId: 'b',
          explanation: 'JEP 403 made strong encapsulation the default in Java 17. The proper fix is to upgrade the library; --add-opens is a temporary workaround.',
        },
      ],
      challengeIds: [],
      masteryCriteria: [
        'Explain the class loader delegation model and name the three built-in loaders.',
        'Diagnose ClassNotFoundException vs NoClassDefFoundError.',
        'Describe what module-info requires/exports provide.',
      ],
      relatedLessonIds: ['p-bytecode', 'r-memory-areas'],
      revision: [
        { id: 'r1', question: 'ClassNotFoundException vs NoClassDefFoundError?', answer: 'CNFE: a class requested by name at runtime was not found (checked exception). NCDFE: a class present at compile time cannot be loaded/defined at runtime — missing from the classpath or its static initialiser failed earlier.' },
        { id: 'r2', question: 'Name the three built-in class loaders since Java 9.', answer: 'Bootstrap (java.base, shown as null), platform (other Java SE modules), application/system (classpath and module path).' },
        { id: 'r3', question: 'What does `exports` in module-info.java control?', answer: 'Which packages of the module are accessible to other modules at compile time and run time; non-exported packages are encapsulated.' },
      ],
    },
  ],
};
