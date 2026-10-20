import type { LessonConcepts } from '@/types/curriculum';

/** Concept pages for module 2 (JDK, JRE, JVM and the Java platform), keyed by lesson id. */
export const platformConcepts: Record<string, LessonConcepts> = {
  'p-jdk-jre-jvm': {
    textbook: {
      definition:
        'The **Java Virtual Machine (JVM)** is an abstract computing machine, defined by the JVM Specification, that loads, verifies and executes class files and manages memory automatically. The **Java Runtime Environment (JRE)** is an implementation of the JVM together with the Java SE class libraries: the minimum needed to run Java applications. The **Java Development Kit (JDK)** is a superset of the runtime that adds development tools such as the compiler `javac`, the archiver `jar`, the documentation generator `javadoc` and the linker `jlink`. **OpenJDK** is the open-source reference implementation of the Java SE Platform from which most JDKs are built.',
      terms: [
        { term: 'Java SE Platform', meaning: 'The standard edition of the Java platform, defined by the Java Language Specification, the JVM Specification and the Java SE API specification.' },
        { term: 'Class library', meaning: 'The standard packages and modules, such as `java.lang` and `java.util` in the `java.base` module, available to every Java program.' },
        { term: 'HotSpot', meaning: 'The JVM implementation in OpenJDK, combining a bytecode interpreter, the tiered just-in-time compilers C1 and C2, and several garbage collectors.' },
        { term: 'Runtime image', meaning: 'A directory containing a JVM and a set of modules; since Java 9, `jlink` can build a custom one that holds only the modules an application needs.' },
        { term: 'TCK', meaning: 'The Technology Compatibility Kit, the test suite an implementation must pass to be certified as compatible with the Java SE specifications.' },
      ],
      source: 'JVMS §1.2 and chapter 2; JEP 220; JEP 282',
    },
    interviewDefinition:
      'The **JVM** is the specification-defined engine that loads, verifies and executes bytecode; the **JRE** is a JVM plus the Java SE class library — enough to run programs; the **JDK** adds development tools such as `javac`, `jar`, `jlink`, `jshell` and diagnostics. All are defined by specifications (JLS, JVMS, Java SE API). **OpenJDK** is the reference implementation with the HotSpot JVM, and vendors such as Eclipse Temurin, Amazon Corretto or Azul Zulu ship certified builds of it. Oracle has not shipped a separate JRE since Java 11; `jlink` builds custom runtimes instead.',
    interviewFollowUps: [
      {
        question: 'Is OpenJDK the same as Oracle JDK?',
        answer: 'Since Java 11 they are built from essentially the same OpenJDK source and are functionally interchangeable. The differences are the licence, the support offering and the update schedule, not the language or APIs.',
      },
      {
        question: 'Why is HotSpot called HotSpot?',
        answer: 'It profiles running code to find the "hot spots" — the frequently executed methods and loops — and spends JIT-compilation effort only there, using tiered compilation: interpreter, then the fast C1 compiler, then the optimising C2 compiler.',
      },
      {
        question: 'What does it mean that a build is "Java SE compatible"?',
        answer: 'It passed the Java SE Technology Compatibility Kit (TCK, also called the JCK), a large test suite that checks conformance to the specifications. That is what lets the same bytecode behave the same on Temurin, Corretto or Oracle JDK.',
      },
    ],
    mnemonic: {
      device: 'Kit ⊃ Runtime ⊃ Machine — "tools, libraries, engine"',
      expansion: [
        { key: 'Kit (JDK)', meaning: 'everything below plus tools: javac, jar, javadoc, jshell, jlink, jdeps, jcmd, jfr' },
        { key: 'Runtime (JRE)', meaning: 'the Machine plus the class library: java.base (java.lang, java.util…) and the other Java SE modules' },
        { key: 'Machine (JVM)', meaning: 'the engine: class loader, bytecode verifier, interpreter + JIT, garbage collector' },
      ],
      visual: 'Three Russian nesting dolls: the smallest is an engine (JVM), the middle doll is a whole car around it (JRE), and the largest doll is the car inside a workshop full of tools (JDK).',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'Engine, car, workshop',
        body: 'The JVM is an engine: powerful, but you cannot drive an engine. The JRE is the car — engine plus wheels, seats and controls (the class library) — enough to drive (run programs). The JDK is the car plus the workshop where cars are built (javac, jar, jlink) and diagnosed (jcmd, jfr). Customers need the car; mechanics need the workshop.',
      },
      {
        kind: 'insight',
        title: '"Java" is a specification, not a product',
        body: 'The language, the bytecode format and the APIs are written down in the JLS, the JVMS and the Java SE API specification. Many implementations compete underneath: HotSpot, Eclipse OpenJ9 and GraalVM, packaged by many vendors. Choosing a distribution is a decision about support, patches, licence and tuning — not about which Java your code is written in.',
      },
      {
        kind: 'real-world',
        title: 'The great vendor migration of 2019',
        body: 'Oracle stopped providing free public updates of Oracle Java SE 8 for commercial use in January 2019. Many companies that had simply "installed Java" discovered they needed a support contract or a different vendor, and moved to builds such as AdoptOpenJDK (now Eclipse Temurin) and Amazon Corretto. Their code did not change at all — only the distribution did.',
      },
      {
        kind: 'angle',
        title: 'The JVM sizes itself from what it can see',
        body: 'Without flags, HotSpot picks a garbage collector, heap size and thread counts from the CPUs and memory it detects ("ergonomics"); by default the maximum heap is a quarter of available memory. Since Java 10 the JVM reads container limits, so a container capped at 1 GB gets about a 256 MB heap by default. Set `-XX:MaxRAMPercentage` instead of guessing `-Xmx` per environment.',
      },
    ],
    diagrams: [
      {
        id: 'p1-nesting',
        kind: 'concept',
        title: 'JDK ⊃ JRE ⊃ JVM',
        caption: 'Each layer contains the one below. Production needs only the runtime layers; the top row of tools is for building and diagnosing.',
        explanation: [
          'Read from the bottom up. The **JVM** row is the engine: the **Class loader** loads and verifies classes, the **Execution engine** interprets and JIT-compiles them, and the **Garbage collector** frees unused memory.',
          'The middle row adds the class library: **java.base** with `java.lang`, `java.util` and `java.io`, the **Other SE modules** such as `java.sql`, and the **java launcher** that starts the JVM.',
          'Together those two rows form the **JRE (runtime)**: everything needed to run a program, but nothing for compiling it. The arrow shows the launcher creating the JVM.',
          'The top row adds developer tools: **javac, jar, javadoc** for building, **jlink, jdeps** for packaging and analysis, and **jshell, jcmd, jfr** for experimenting and diagnosing.',
          'All three rows together are the **JDK (development kit)**. Takeaway: each layer contains the one below it, and production machines need only the runtime layers.',
        ],
        cols: 3,
        rows: 3,
        nodes: [
          { id: 'javac', label: 'javac, jar, javadoc', detail: 'build tools', col: 0, row: 0, tone: 'neutral' },
          { id: 'jlink', label: 'jlink, jdeps', detail: 'packaging and analysis', col: 1, row: 0, tone: 'neutral' },
          { id: 'diag', label: 'jshell, jcmd, jfr', detail: 'REPL and diagnostics', col: 2, row: 0, tone: 'neutral' },
          { id: 'base', label: 'java.base', detail: 'java.lang, java.util, java.io', col: 0, row: 1, tone: 'accent' },
          { id: 'mods', label: 'Other SE modules', detail: 'java.sql, java.net.http…', col: 1, row: 1, tone: 'accent' },
          { id: 'launcher', label: 'java launcher', detail: 'starts the JVM', col: 2, row: 1, tone: 'accent' },
          { id: 'cl', label: 'Class loader', detail: 'load, verify, link', col: 0, row: 2, tone: 'primary' },
          { id: 'engine', label: 'Execution engine', detail: 'interpreter + JIT', col: 1, row: 2, tone: 'primary' },
          { id: 'gc', label: 'Garbage collector', detail: 'G1 by default', col: 2, row: 2, tone: 'primary' },
        ],
        edges: [
          { from: 'launcher', to: 'gc', label: 'creates the JVM' },
          { from: 'cl', to: 'engine' },
        ],
        groups: [
          { label: 'JDK (development kit)', fromCol: 0, toCol: 2, fromRow: 0, toRow: 2, tone: 'neutral' },
          { label: 'JRE (runtime)', fromCol: 0, toCol: 2, fromRow: 1, toRow: 2, tone: 'accent' },
          { label: 'JVM', fromCol: 0, toCol: 2, fromRow: 2, toRow: 2, tone: 'primary' },
        ],
      },
      {
        id: 'p1-build-to-run',
        kind: 'flow',
        title: 'From JDK on the build machine to a slim runtime in production',
        caption: 'The full JDK stays on the build machine. jdeps finds the modules the jar needs, jlink assembles a trimmed runtime, and only that runtime plus the jar ships.',
        explanation: [
          'The top row is the **Build (full JDK)** stage. **App sources** are compiled and packaged by **javac + jar** on the CI machine, producing **app.jar** full of bytecode.',
          '**jdeps** then analyses app.jar and lists exactly which JDK modules it uses, such as `java.base` and `java.sql`.',
          'That list is passed with `--add-modules` to **jlink**, which assembles a **Custom runtime** containing the JVM plus only the needed modules, often just a few dozen megabytes.',
          'The bottom row is **Production (runtime only)**. The runtime goes into a **Container image**, and the dashed arrow shows app.jar being copied in beside it.',
          'The container finally runs **java -jar app.jar**. Takeaway: the compiler and other tools stay on the build machine, so production ships a smaller, safer image.',
        ],
        cols: 4,
        rows: 2,
        nodes: [
          { id: 'src', label: 'App sources', detail: '.java files', col: 0, row: 0, shape: 'note' },
          { id: 'javac', label: 'javac + jar', detail: 'JDK on CI', col: 1, row: 0, tone: 'primary' },
          { id: 'jar', label: 'app.jar', detail: 'bytecode', col: 2, row: 0, shape: 'note', tone: 'accent' },
          { id: 'jdeps', label: 'jdeps', detail: 'lists required modules', col: 3, row: 0, tone: 'primary' },
          { id: 'jlink', label: 'jlink', detail: 'builds a trimmed runtime', col: 3, row: 1, tone: 'primary' },
          { id: 'rt', label: 'Custom runtime', detail: 'JVM + needed modules', col: 2, row: 1, shape: 'cylinder', tone: 'accent' },
          { id: 'img', label: 'Container image', detail: 'runtime + app.jar', col: 1, row: 1, tone: 'neutral' },
          { id: 'run', label: 'java -jar app.jar', detail: 'no compiler on board', col: 0, row: 1, shape: 'pill', tone: 'success' },
        ],
        edges: [
          { from: 'src', to: 'javac' },
          { from: 'javac', to: 'jar' },
          { from: 'jar', to: 'jdeps' },
          { from: 'jdeps', to: 'jlink', label: '--add-modules' },
          { from: 'jlink', to: 'rt' },
          { from: 'rt', to: 'img' },
          { from: 'jar', to: 'img', label: 'copied in', dashed: true },
          { from: 'img', to: 'run' },
        ],
        groups: [
          { label: 'Build (full JDK)', fromCol: 0, toCol: 3, fromRow: 0, toRow: 0, tone: 'neutral' },
          { label: 'Production (runtime only)', fromCol: 0, toCol: 2, fromRow: 1, toRow: 1, tone: 'success' },
        ],
      },
      {
        id: 'p1-spec-impl',
        kind: 'architecture',
        title: 'Specifications, implementations and vendor builds',
        caption: 'Specifications define Java; OpenJDK implements them; vendors build and support binaries from it. Alternative JVMs reuse the OpenJDK class library. Every build sold as Java SE must pass the TCK.',
        explanation: [
          'At the top, the **Java SE specifications** (the JLS, the JVMS and the API specification) define what Java is. The arrow tested by leads to the **TCK (JCK)**, the compatibility test suite.',
          'The arrow implemented by leads to **OpenJDK**, the open-source reference implementation that contains the HotSpot JVM.',
          'Alternative JVMs such as **Eclipse OpenJ9** reuse the OpenJDK class library, as the class library arrow shows. **GraalVM** is also based on OpenJDK and adds the Graal JIT and Native Image.',
          'The bottom row shows vendor builds made from OpenJDK source: **Eclipse Temurin**, **Amazon Corretto**, **Azul Zulu** and **Oracle JDK**. They differ in licence, support and platforms.',
          'Takeaway: the specifications define Java and the TCK enforces them, so bytecode behaves the same whichever certified build you choose.',
        ],
        cols: 4,
        rows: 3,
        nodes: [
          { id: 'spec', label: 'Java SE specifications', detail: 'JLS, JVMS, Java SE API', col: 0, row: 0, span: 2, tone: 'primary' },
          { id: 'tck', label: 'TCK (JCK)', detail: 'compatibility tests', col: 2, row: 0, tone: 'warning' },
          { id: 'openjdk', label: 'OpenJDK', detail: 'reference implementation · HotSpot JVM', col: 0, row: 1, span: 2, tone: 'accent' },
          { id: 'j9', label: 'Eclipse OpenJ9', detail: 'alternative JVM', col: 2, row: 1, tone: 'neutral' },
          { id: 'graal', label: 'GraalVM', detail: 'Graal JIT + Native Image', col: 3, row: 1, tone: 'neutral' },
          { id: 'temurin', label: 'Eclipse Temurin', col: 0, row: 2, shape: 'pill', tone: 'success' },
          { id: 'corretto', label: 'Amazon Corretto', col: 1, row: 2, shape: 'pill', tone: 'success' },
          { id: 'zulu', label: 'Azul Zulu', col: 2, row: 2, shape: 'pill', tone: 'success' },
          { id: 'oracle', label: 'Oracle JDK', col: 3, row: 2, shape: 'pill', tone: 'success' },
        ],
        edges: [
          { from: 'spec', to: 'tck', label: 'tested by' },
          { from: 'spec', to: 'openjdk', label: 'implemented by' },
          { from: 'openjdk', to: 'j9', label: 'class library' },
          { from: 'openjdk', to: 'temurin' },
          { from: 'openjdk', to: 'corretto' },
          { from: 'openjdk', to: 'zulu' },
          { from: 'openjdk', to: 'oracle' },
        ],
      },
    ],
    variants: [
      {
        title: 'JDK distributions (builds of OpenJDK)',
        intro: 'All of these are built from OpenJDK source and run the same bytecode; they differ in licence, support length, platforms and extras.',
        items: [
          { name: 'Eclipse Temurin', summary: 'Free, community-built by the Eclipse Adoptium project (formerly AdoptOpenJDK); a common default for containers and CI.' },
          { name: 'Amazon Corretto', summary: 'Free, built and patched by Amazon, used across AWS; long-term updates for LTS releases.' },
          { name: 'Azul Zulu', summary: 'Free builds with paid support from Azul, available for many platforms including older releases.' },
          { name: 'Oracle JDK', summary: 'Oracle\'s commercial build. Recent LTS releases are free to use under Oracle\'s no-fee terms for a limited period; check the current licence before production use.' },
          { name: 'Oracle OpenJDK builds (jdk.java.net)', summary: 'GPL builds of the latest feature release only, updated for about six months — not intended for long-term production.' },
          { name: 'Microsoft, Red Hat, BellSoft Liberica, SapMachine', summary: 'Further supported OpenJDK builds, often bundled with the vendor\'s cloud, OS or platform.' },
        ],
      },
      {
        title: 'JVM implementations',
        items: [
          { name: 'HotSpot', summary: 'The OpenJDK JVM used by almost every distribution: tiered C1/C2 JIT, G1 (default), ZGC, Shenandoah, Parallel and Serial GCs.', support: 'supported' },
          { name: 'Eclipse OpenJ9', summary: 'An alternative JVM (shipped by IBM as Semeru) tuned for low memory footprint and fast start-up, combined with the OpenJDK class library.', support: 'supported' },
          { name: 'GraalVM', summary: 'An OpenJDK-based JDK with the Graal JIT compiler and Native Image, which compiles applications ahead of time into native executables under a closed-world assumption.', support: 'supported', note: 'Native Image restricts dynamic features such as unregistered reflection.' },
          { name: 'Azul Platform Prime', summary: 'A commercial HotSpot-derived JVM with the Falcon JIT and the pauseless C4 collector.', support: 'supported' },
          { name: 'Android Runtime (ART)', summary: 'Runs Java/Kotlin code compiled to DEX bytecode, not class files, with its own library; it is not a Java SE JVM.', support: 'partial' },
        ],
      },
    ],
    deepDive: [
      {
        title: 'Tiered compilation inside HotSpot',
        body: 'HotSpot starts every method in the interpreter while counting invocations and loop iterations. Warm methods are compiled by **C1** (fast compile, light optimisation, with profiling); hot ones are recompiled by **C2** using the collected profile — inlining, escape analysis, loop unrolling, speculative devirtualisation. If a speculation turns out wrong (a new subclass is loaded, say), the code is **deoptimised** back to the interpreter and recompiled later. This is why benchmarks need warm-up and why JMH exists.',
        sources: [
          { label: 'JMH: Java Microbenchmark Harness (OpenJDK Code Tools)', url: 'https://openjdk.org/projects/code-tools/jmh/' },
        ],
      },
      {
        title: 'Why the JRE directory disappeared',
        body: 'Java 9 modularised the JDK itself (JEP 200) and changed the runtime image layout (JEP 220): `rt.jar` and `tools.jar` vanished, classes moved into the `lib/modules` jimage file, and the nested `jre/` directory was removed. With `jlink` (JEP 282) any set of modules can become a runtime, so "the JRE" is now simply whichever runtime image you build — often only a few dozen megabytes.',
        sources: [
          { label: 'JEP 220: Modular Run-Time Images', url: 'https://openjdk.org/jeps/220' },
          { label: 'JEP 282: jlink: The Java Linker', url: 'https://openjdk.org/jeps/282' },
        ],
      },
      {
        title: 'Same spec, different defaults',
        body: 'Two "Java 21" runtimes can behave differently in production without either being wrong: the spec does not mandate a garbage collector, heap sizing or JIT strategy. Vendors may also ship different default options or extra features (Corretto\'s and Zulu\'s backports, OpenJ9\'s shared class cache, GraalVM\'s compiler). Pin the vendor and the exact update version in CI and in container images, and read the release notes when changing either.',
        sources: [{ label: 'Java SE 21 Platform specification (JSR 396)', url: 'https://docs.oracle.com/javase/specs/' }],
      },
    ],
  },
  'p-bytecode': {
    interviewDefinition:
      '**Bytecode** is the JVM\'s instruction set: compact one-byte opcodes for a **stack machine**, stored per method in the `Code` attribute of a `.class` file. A class file starts with the magic number `0xCAFEBABE` and a version (major − 44 = Java release), followed by a **constant pool** of literals and symbolic references, access flags, this/super class, interfaces, fields, methods and attributes. Because bytecode refers to everything by symbolic name rather than address and is **verified** before it runs, the same file executes safely on any compliant JVM.',
    interviewFollowUps: [
      {
        question: 'Why is the JVM stack-based rather than register-based?',
        answer: 'Stack code is compact, simple for compilers to emit, and makes no assumptions about how many registers the real CPU has. The JIT maps the operand stack onto real registers anyway. (Android\'s Dalvik/ART chose a register-based DEX format for different trade-offs.)',
      },
      {
        question: 'Name the invoke instructions and when each is used.',
        answer: '`invokestatic` for static methods, `invokevirtual` for class instance methods, `invokeinterface` for interface methods, `invokespecial` for constructors, private methods and `super` calls, and `invokedynamic` for call sites linked at run time (lambdas, string concatenation, records\' methods, pattern switches).',
      },
      {
        question: 'How is a lambda compiled?',
        answer: 'Its body becomes a private synthetic method (e.g. `lambda$main$0`). The lambda expression itself is an `invokedynamic` call site bootstrapped by `LambdaMetafactory`, which creates an implementation of the functional interface on first execution — no anonymous `.class` file on disk.',
      },
    ],
    mnemonic: {
      device: '"My Very Cute Aunt Takes Super Interesting Fruit Meals Always"',
      expansion: [
        { key: 'My', meaning: 'Magic — 0xCAFEBABE' },
        { key: 'Very', meaning: 'Version — minor and major (65 = Java 21, 69 = Java 25)' },
        { key: 'Cute', meaning: 'Constant pool — literals and symbolic references' },
        { key: 'Aunt', meaning: 'Access flags — public, final, interface, abstract…' },
        { key: 'Takes', meaning: 'This class — index of the class\'s own name' },
        { key: 'Super', meaning: 'Super class — index of the parent\'s name' },
        { key: 'Interesting', meaning: 'Interfaces implemented' },
        { key: 'Fruit', meaning: 'Fields' },
        { key: 'Meals', meaning: 'Methods — each with a Code attribute holding bytecode' },
        { key: 'Always', meaning: 'Attributes — SourceFile, InnerClasses, NestMembers, Record…' },
      ],
      visual: 'An aunt in a café (the class file) whose order is read top to bottom in exactly this sequence — the same order the JVM specification lists the fields of the ClassFile structure.',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'Bytecode is sheet music',
        body: 'A score is written once and played by any orchestra; each musician (a JVM on a particular CPU) turns the same notes into sound. Passages the orchestra plays over and over get memorised and played faster — that is the JIT compiling hot methods to native code.',
      },
      {
        kind: 'insight',
        title: 'Calls are by name, resolved late',
        body: 'Bytecode never contains addresses. `println` appears as a constant-pool entry like `Methodref java/io/PrintStream.println:(Ljava/lang/String;)V` and is resolved the first time it runs. That is what makes separate compilation work — and why removing or changing a library method breaks callers only at run time with `NoSuchMethodError` (JLS chapter 13, binary compatibility).',
      },
      {
        kind: 'real-world',
        title: 'Frameworks rewrite bytecode every day',
        body: 'Mockito creates mocks with Byte Buddy, Hibernate generates lazy-loading proxies, Spring creates CGLIB-style subclasses for configuration and AOP, and JaCoCo inserts coverage probes through a Java agent. Understanding bytecode is how you debug "why is my class not the class I wrote?".',
      },
      {
        kind: 'angle',
        title: 'Descriptors are a tiny language of their own',
        body: '`(Ljava/lang/String;I)V` means "takes a String and an int, returns void". `[I` is `int[]`, `J` is `long`, `Z` is `boolean`. Generic types are erased in descriptors (`Ljava/util/List;`), but a `Signature` attribute keeps them for reflection — which is how frameworks can still see `List<String>` on a field.',
      },
    ],
    diagrams: [
      {
        id: 'p2-classfile-layout',
        kind: 'concept',
        title: 'Inside a .class file (JVMS §4.1)',
        caption: 'The structure is read top to bottom. Most other parts point into the constant pool by index rather than repeating names and literals.',
        cols: 2,
        rows: 6,
        nodes: [
          { id: 'magic', label: 'Magic', detail: '0xCAFEBABE', col: 0, row: 0, tone: 'neutral' },
          { id: 'ver', label: 'Version', detail: 'minor, major (65 = Java 21)', col: 1, row: 0, tone: 'neutral' },
          { id: 'cp', label: 'Constant pool', detail: 'literals + symbolic references to classes, fields and methods', col: 0, row: 1, span: 2, shape: 'cylinder', tone: 'accent' },
          { id: 'flags', label: 'Access flags', detail: 'public, final, interface…', col: 0, row: 2, tone: 'primary' },
          { id: 'this', label: 'this / super class', detail: 'indexes into the pool', col: 1, row: 2, tone: 'primary' },
          { id: 'ifaces', label: 'Interfaces', detail: 'pool indexes', col: 0, row: 3, tone: 'primary' },
          { id: 'fields', label: 'Fields', detail: 'name, descriptor, flags', col: 1, row: 3, tone: 'primary' },
          { id: 'methods', label: 'Methods', detail: 'Code attribute: bytecode, max_stack, max_locals, exception table', col: 0, row: 4, span: 2, tone: 'success' },
          { id: 'attrs', label: 'Attributes', detail: 'SourceFile, LineNumberTable, StackMapTable, NestMembers…', col: 0, row: 5, span: 2, shape: 'note', tone: 'neutral' },
        ],
        edges: [{ from: 'this', to: 'cp', label: '#index' }],
      },
      {
        id: 'p2-operand-stack',
        kind: 'flow',
        title: 'return a + b on the operand stack (a = 2, b = 3)',
        caption: 'Top row: the instructions javap -c shows. Bottom row: the operand stack after each one. Values are pushed, the instruction pops its inputs and pushes its result.',
        cols: 4,
        rows: 2,
        nodes: [
          { id: 'i1', label: 'iload_0', detail: 'push local 0 (a)', col: 0, row: 0, tone: 'primary' },
          { id: 'i2', label: 'iload_1', detail: 'push local 1 (b)', col: 1, row: 0, tone: 'primary' },
          { id: 'i3', label: 'iadd', detail: 'pop two ints, push sum', col: 2, row: 0, tone: 'primary' },
          { id: 'i4', label: 'ireturn', detail: 'pop and return to caller', col: 3, row: 0, tone: 'primary' },
          { id: 's1', label: '[ 2 ]', col: 0, row: 1, shape: 'cylinder', tone: 'accent' },
          { id: 's2', label: '[ 2, 3 ]', col: 1, row: 1, shape: 'cylinder', tone: 'accent' },
          { id: 's3', label: '[ 5 ]', col: 2, row: 1, shape: 'cylinder', tone: 'accent' },
          { id: 's4', label: '[ ]', detail: 'caller receives 5', col: 3, row: 1, shape: 'pill', tone: 'success' },
        ],
        edges: [
          { from: 'i1', to: 'i2' },
          { from: 'i2', to: 'i3' },
          { from: 'i3', to: 'i4' },
          { from: 'i1', to: 's1' },
          { from: 'i2', to: 's2' },
          { from: 'i3', to: 's3' },
          { from: 'i4', to: 's4' },
        ],
      },
      {
        id: 'p2-bytecode-pipeline',
        kind: 'architecture',
        title: 'What the JVM does with bytecode',
        caption: 'Bytecode is parsed, verified and linked lazily, then interpreted while being profiled. Hot methods move up to C1 and C2 compiled code, which lives in the code cache.',
        cols: 4,
        rows: 2,
        nodes: [
          { id: 'cls', label: 'Main.class', detail: 'bytecode', col: 0, row: 0, shape: 'note', tone: 'accent' },
          { id: 'load', label: 'Class loader', detail: 'parse the class file', col: 1, row: 0, tone: 'primary' },
          { id: 'verify', label: 'Verifier', detail: 'type-checks with StackMapTable', col: 2, row: 0, tone: 'warning' },
          { id: 'link', label: 'Linker', detail: 'resolves pool entries lazily', col: 3, row: 0, tone: 'primary' },
          { id: 'interp', label: 'Interpreter', detail: 'runs and profiles', col: 3, row: 1, tone: 'neutral' },
          { id: 'c1', label: 'C1 JIT', detail: 'quick compile + profiling', col: 2, row: 1, tone: 'accent' },
          { id: 'c2', label: 'C2 JIT', detail: 'optimised native code', col: 1, row: 1, tone: 'accent' },
          { id: 'cache', label: 'Code cache', detail: 'native code reused', col: 0, row: 1, shape: 'cylinder', tone: 'success' },
        ],
        edges: [
          { from: 'cls', to: 'load' },
          { from: 'load', to: 'verify' },
          { from: 'verify', to: 'link' },
          { from: 'link', to: 'interp' },
          { from: 'interp', to: 'c1', label: 'warm method' },
          { from: 'c1', to: 'c2', label: 'still hot' },
          { from: 'c2', to: 'cache' },
        ],
        groups: [
          { label: 'Load and link', fromCol: 1, toCol: 3, fromRow: 0, toRow: 0, tone: 'primary' },
          { label: 'Execute', fromCol: 0, toCol: 3, fromRow: 1, toRow: 1, tone: 'accent' },
        ],
      },
    ],
    variants: [
      {
        title: 'Class file components (JVMS §4.1, in order)',
        items: [
          { name: 'magic', summary: 'Four bytes, 0xCAFEBABE, identifying a class file.' },
          { name: 'minor_version, major_version', summary: 'The class file format version. Major − 44 gives the Java release (52 = 8, 61 = 17, 65 = 21, 69 = 25); minor 65535 marks preview features.' },
          { name: 'constant_pool', summary: 'A table of strings, numbers, class/field/method references, name-and-type pairs, method handles and dynamic call-site entries. Indexed from 1.' },
          { name: 'access_flags', summary: 'Bit flags such as ACC_PUBLIC, ACC_FINAL, ACC_INTERFACE, ACC_ABSTRACT, ACC_ENUM.' },
          { name: 'this_class, super_class', summary: 'Pool indexes naming the class and its superclass (only java.lang.Object has none).' },
          { name: 'interfaces', summary: 'Pool indexes of the directly implemented interfaces.' },
          { name: 'fields', summary: 'Each with flags, a name, a type descriptor and attributes such as ConstantValue.' },
          { name: 'methods', summary: 'Each with flags, a name, a descriptor and attributes; concrete methods carry a Code attribute (bytecode, max_stack, max_locals, exception table).' },
          { name: 'attributes', summary: 'Class-level metadata: SourceFile, InnerClasses, NestHost/NestMembers, Record, PermittedSubclasses, BootstrapMethods and more.' },
        ],
      },
      {
        title: 'Method invocation instructions',
        items: [
          { name: 'invokestatic', summary: 'Calls a static method; no receiver object.', code: 'Math.max(a, b)' },
          { name: 'invokevirtual', summary: 'Calls an instance method on a class type, dispatched on the runtime class.', code: 'sb.append("x")' },
          { name: 'invokeinterface', summary: 'Calls a method through an interface type.', code: 'list.size()' },
          { name: 'invokespecial', summary: 'Calls constructors, private methods (pre-nestmate code) and super methods without dynamic dispatch.', code: 'super.toString()' },
          { name: 'invokedynamic', summary: 'A call site linked at first execution by a bootstrap method (Java 7+). Used for lambdas, string concatenation (Java 9), records\' toString/equals/hashCode and pattern switches.', code: 'Runnable r = () -> {};' },
        ],
      },
      {
        title: 'Ways to read and generate bytecode',
        items: [
          { name: 'javap', summary: 'JDK tool: `-c` disassembles code, `-v` adds the constant pool, flags and attributes.', support: 'supported', code: 'javap -c -v Main.class' },
          { name: 'Class-File API (java.lang.classfile)', summary: 'Standard API to parse, generate and transform class files; final in Java 24 (JEP 484).', support: 'supported' },
          { name: 'ASM, Byte Buddy', summary: 'Widely used third-party libraries behind most frameworks\' bytecode generation.', support: 'supported' },
          { name: 'Java agents (java.lang.instrument)', summary: 'Transform classes as they load, e.g. for coverage, profiling or tracing.', support: 'supported', code: 'java -javaagent:agent.jar -jar app.jar' },
        ],
      },
    ],
    deepDive: [
      {
        title: 'StackMapTable: why verification became fast',
        body: 'The original verifier inferred the type of every stack slot and local by data-flow analysis — slow for big methods. Class files since version 50 (Java 6) can carry a `StackMapTable` attribute recording the types at each branch target, and for version 51 (Java 7) and later it is mandatory: the JVM uses the faster **type-checking** verifier, which only checks the compiler\'s claims in a single pass. This is why bytecode-generating tools must compute stack map frames.',
        sources: [{ label: 'JVM Specification §4.10.1: Verification by Type Checking', url: 'https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-4.html#jvms-4.10.1' }],
      },
      {
        title: 'Nestmates removed a generation of synthetic methods',
        body: 'Before Java 11, an inner class reading its outer class\'s private field compiled to calls through synthetic package-private `access$000` methods, because the JVM treated them as unrelated classes. JEP 181 added `NestHost`/`NestMembers` attributes so the JVM itself grants private access within a nest — fewer methods, accurate reflection, and no accidental widening of access.',
        sources: [{ label: 'JEP 181: Nest-Based Access Control', url: 'https://openjdk.org/jeps/181' }],
      },
      {
        title: 'invokedynamic moved code generation from javac to the runtime',
        body: 'Since Java 9 (JEP 280), `"a" + b + c` compiles to one `invokedynamic` whose bootstrap, `StringConcatFactory`, chooses the concatenation strategy at run time. Lambdas use `LambdaMetafactory`, records use `ObjectMethods`, and pattern switches use `SwitchBootstraps`. The benefit: JDK upgrades improve the performance of code compiled years earlier, without recompiling it.',
        sources: [
          { label: 'JEP 280: Indify String Concatenation', url: 'https://openjdk.org/jeps/280' },
          { label: 'JEP 484: Class-File API', url: 'https://openjdk.org/jeps/484' },
        ],
      },
    ],
  },
  'p-packages-classpath': {
    interviewDefinition:
      'A **package** is a namespace (`com.shop.billing`) that also forms an access boundary for package-private members; `import` is only a compile-time shorthand and loads nothing. At run time **class loaders** find classes lazily, on first use, delegating parent-first (bootstrap → platform → application) before searching the **classpath** of directories and JARs. The **module system** (Java 9) adds `module-info.java` with `requires` and `exports`, giving reliable configuration — missing modules fail at startup — and strong encapsulation of packages that are not exported.',
    interviewFollowUps: [
      {
        question: 'Does `import java.util.*;` import `java.util.function.Function`?',
        answer: 'No. Packages are not hierarchical: `java.util.function` is a completely separate package that merely shares a name prefix. Wildcard imports cover the types of one package only, and package-private access does not extend to "subpackages" either.',
      },
      {
        question: 'What happens when two JARs on the classpath contain the same class?',
        answer: 'The first one in classpath order wins and the other is silently ignored ("JAR hell"); mixing versions can produce `NoSuchMethodError` at run time. On the module path, two modules containing the same package is an error at startup.',
      },
      {
        question: 'What is an automatic module?',
        answer: 'A plain JAR placed on the module path. It gets a name from its `Automatic-Module-Name` manifest entry or its file name, exports all its packages and reads every other module, so modular code can `requires` it during migration.',
      },
    ],
    mnemonic: {
      device: '"Name, Nickname, Map, Librarian"',
      expansion: [
        { key: 'Name — package', meaning: 'the full, globally unique name: com.shop.billing.Invoice' },
        { key: 'Nickname — import', meaning: 'lets this one source file say Invoice; gone after compilation' },
        { key: 'Map — classpath / module path', meaning: 'the list of directories and JARs to search at run time' },
        { key: 'Librarian — class loader', meaning: 'fetches a class the first time someone needs it, asking its parent first' },
      ],
      visual: 'A library: every book has a full catalogue name, readers use nicknames among friends, the map lists the shelves, and the librarian always checks the central archive (the parent) before your local shelf.',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'Postal addresses',
        body: 'A package is a full postal address: there are many "Main Street 1"s, but only one with this city and country. `import` is like saying "Bob next door" — it works only in your own conversation (source file). The classpath is the list of towns the post office searches, in order, and it stops at the first match.',
      },
      {
        kind: 'insight',
        title: 'Imports do not exist at run time',
        body: 'javac replaces every simple name with its fully qualified name, so bytecode always says `java/util/ArrayList`. A wildcard import costs nothing at run time and an unused import loads nothing. What matters at run time is only whether the class can be found on the classpath or module path.',
      },
      {
        kind: 'real-world',
        title: 'javax to jakarta: a package rename that moved an ecosystem',
        body: 'When Java EE moved to the Eclipse Foundation, the `javax.*` enterprise packages could not be evolved under that name, so Jakarta EE 9 (2020) renamed them to `jakarta.*`. Spring Boot 3, Hibernate 6 and Tomcat 10 followed, and every application had to rewrite imports. Because a package name is part of every class\'s identity, `javax.servlet.Filter` and `jakarta.servlet.Filter` are simply different types.',
      },
      {
        kind: 'angle',
        title: 'From warnings to walls: encapsulating the JDK',
        body: 'Java 9 encapsulated JDK internals but still permitted illegal reflective access with a warning. Java 16 denied it by default (JEP 396) and Java 17 removed the switch to relax it (JEP 403); only `--add-opens` remains. `sun.misc.Unsafe` lives on in the `jdk.unsupported` module, but its memory-access methods are deprecated for removal (Java 23) and warn by default since Java 24.',
      },
    ],
    diagrams: [
      {
        id: 'p3-delegation',
        kind: 'flow',
        title: 'Parent-first delegation for com.shop.Invoice',
        caption: 'The application loader asks the platform loader, which asks the bootstrap loader. Only when both parents fail does the application loader search the classpath. That is why nobody can replace java.lang.String with a class on the classpath.',
        cols: 3,
        rows: 3,
        nodes: [
          { id: 'boot', label: 'Bootstrap loader', detail: 'java.base (shown as null)', col: 0, row: 0, tone: 'primary' },
          { id: 'plat', label: 'Platform loader', detail: 'java.sql, java.xml…', col: 0, row: 1, tone: 'primary' },
          { id: 'app', label: 'Application loader', detail: 'classpath / module path', col: 0, row: 2, tone: 'primary' },
          { id: 'nf1', label: 'Not found', detail: 'not in java.base', col: 1, row: 0, shape: 'pill', tone: 'neutral' },
          { id: 'nf2', label: 'Not found', detail: 'not a platform module', col: 1, row: 1, shape: 'pill', tone: 'neutral' },
          { id: 'cp', label: 'Classpath', detail: 'classes/, app.jar, lib/*.jar', col: 1, row: 2, shape: 'cylinder', tone: 'accent' },
          { id: 'ok', label: 'Invoice defined', detail: 'by the app loader', col: 2, row: 2, shape: 'pill', tone: 'success' },
        ],
        edges: [
          { from: 'app', to: 'plat', label: '1. ask parent' },
          { from: 'plat', to: 'boot', label: '2. ask parent' },
          { from: 'boot', to: 'nf1', label: 'search' },
          { from: 'plat', to: 'nf2', label: 'search' },
          { from: 'app', to: 'cp', label: '3. search' },
          { from: 'cp', to: 'ok', label: 'found' },
        ],
      },
      {
        id: 'p3-package-paths',
        kind: 'concept',
        title: 'One name, three places',
        caption: 'The package name must match the source folder, becomes the folder inside the JAR, and is the only name bytecode ever uses. The import in OrderService is resolved by javac and then disappears.',
        cols: 3,
        rows: 2,
        nodes: [
          { id: 'src', label: 'Invoice.java', detail: 'in src/com/shop/billing/', col: 0, row: 0, shape: 'note' },
          { id: 'javac', label: 'javac', detail: 'checks package = folder', col: 1, row: 0, tone: 'primary' },
          { id: 'cls', label: 'Invoice.class', detail: 'com/shop/billing/ in app.jar', col: 2, row: 0, shape: 'note', tone: 'accent' },
          { id: 'user', label: 'OrderService.java', detail: 'imports the class to write Invoice', col: 0, row: 1, shape: 'note' },
          { id: 'bc', label: 'Its bytecode', detail: 'com/shop/billing/Invoice', col: 1, row: 1, tone: 'neutral' },
          { id: 'loader', label: 'Class loader', detail: 'turns the name into a path', col: 2, row: 1, tone: 'primary' },
        ],
        edges: [
          { from: 'src', to: 'javac' },
          { from: 'javac', to: 'cls', label: 'same folder layout' },
          { from: 'user', to: 'javac', label: 'compiled too' },
          { from: 'bc', to: 'loader', label: 'full name only' },
          { from: 'loader', to: 'cls', label: 'finds' },
        ],
      },
      {
        id: 'p3-module-kinds',
        kind: 'architecture',
        title: 'Named, automatic and unnamed modules',
        caption: 'Named modules read only what they require; automatic modules bridge plain JARs onto the module path; everything on the classpath lands in the unnamed module, which named modules cannot require.',
        cols: 3,
        rows: 3,
        nodes: [
          { id: 'named', label: 'Named module', detail: 'has module-info.java', col: 0, row: 0, tone: 'primary' },
          { id: 'auto', label: 'Automatic module', detail: 'plain JAR on module path', col: 1, row: 0, tone: 'accent' },
          { id: 'unnamed', label: 'Unnamed module', detail: 'everything on the classpath', col: 2, row: 0, tone: 'neutral' },
          { id: 'nr', label: 'Reads its requires', detail: 'exports only listed packages', col: 0, row: 1, tone: 'primary' },
          { id: 'ar', label: 'Reads all modules', detail: 'exports every package', col: 1, row: 1, tone: 'accent' },
          { id: 'ur', label: 'Reads all modules', detail: 'cannot be required by name', col: 2, row: 1, tone: 'neutral' },
          { id: 'jdk', label: 'java.base and other JDK modules', detail: 'every module reads java.base', col: 0, row: 2, span: 3, shape: 'cylinder', tone: 'success' },
        ],
        edges: [
          { from: 'named', to: 'nr' },
          { from: 'auto', to: 'ar' },
          { from: 'unnamed', to: 'ur' },
          { from: 'named', to: 'auto', label: 'requires by name' },
          { from: 'auto', to: 'unnamed', label: 'can read' },
          { from: 'ar', to: 'jdk' },
        ],
        groups: [
          { label: 'Module path', fromCol: 0, toCol: 1, fromRow: 0, toRow: 1, tone: 'primary' },
          { label: 'Classpath', fromCol: 2, toCol: 2, fromRow: 0, toRow: 1, tone: 'neutral' },
        ],
      },
    ],
    variants: [
      {
        title: 'Kinds of import declarations',
        intro: '`java.lang` is always imported implicitly. All imports are resolved at compile time.',
        items: [
          { name: 'Single-type import', summary: 'Imports one type. Clearest, and wins over on-demand imports when names clash.', support: 'supported', code: 'import java.util.List;' },
          { name: 'Type-import-on-demand', summary: 'Imports all public types of one package (not subpackages). Ambiguous names must then be imported explicitly.', support: 'supported', code: 'import java.util.*;' },
          { name: 'Single static import', summary: 'Imports one static member so it can be used unqualified.', support: 'supported', code: 'import static java.lang.Math.max;' },
          { name: 'Static-import-on-demand', summary: 'Imports all static members of a type — popular for test assertions.', support: 'supported', code: 'import static org.junit.jupiter.api.Assertions.*;' },
          { name: 'Module import', summary: 'Java 25 (JEP 511): imports every public type in the packages a module exports. Compact source files import java.base this way implicitly.', support: 'supported', code: 'import module java.base;' },
          { name: 'Importing subpackages with *', summary: '`import java.util.*;` does not reach java.util.function; packages are not nested.', support: 'not-supported' },
        ],
      },
      {
        title: 'Kinds of modules',
        items: [
          { name: 'Named (explicit) module', summary: 'A JAR or directory with module-info.class on the module path; declares requires, exports, opens, uses and provides.', support: 'supported', code: 'module shop.billing { requires java.sql; exports com.shop.billing; }' },
          { name: 'Open module', summary: 'A named module whose packages are all open to deep reflection at run time (frameworks), while exports still govern compile-time access.', support: 'supported', code: 'open module shop.app { requires spring.core; }' },
          { name: 'Automatic module', summary: 'A plain JAR on the module path; named from Automatic-Module-Name or the file name; exports everything, reads everything.', support: 'supported' },
          { name: 'Unnamed module', summary: 'Holds everything loaded from the classpath; reads all modules, but named modules cannot declare a dependency on it.', support: 'supported' },
        ],
      },
      {
        title: 'Built-in class loaders (Java 9+)',
        items: [
          { name: 'Bootstrap', summary: 'Part of the JVM; loads java.base and other core modules. Reported as null from getClassLoader().' },
          { name: 'Platform', summary: 'Loads the remaining Java SE and JDK modules (java.sql, java.xml…). Replaced the old extension loader.' },
          { name: 'Application (system)', summary: 'Loads your classes from the classpath and module path; ClassLoader.getSystemClassLoader().' },
          { name: 'Custom loaders', summary: 'Subclasses such as URLClassLoader, used by plugin systems, application servers and hot-reload tools to load and isolate code.' },
        ],
      },
    ],
    deepDive: [
      {
        title: 'Reliable configuration: what the module system checks at startup',
        body: 'With modules, the JVM resolves the whole dependency graph **before** running `main`: a missing `requires` fails immediately, cycles between modules are rejected, and two modules may not export the same package to one reader — no split packages among named modules. The classpath has none of these checks, which is how "JAR hell" (duplicate or conflicting classes) survives until a particular code path runs in production.',
        sources: [{ label: 'JEP 261: Module System', url: 'https://openjdk.org/jeps/261' }],
      },
      {
        title: 'Strong encapsulation timeline',
        body: 'Java 9 encapsulated internals but defaulted to `--illegal-access=permit` with warnings. Java 16 switched the default to deny (JEP 396) and Java 17 removed the option entirely (JEP 403), so libraries that reflect into JDK internals now fail with `InaccessibleObjectException` unless the launcher grants `--add-opens`. The lesson for library authors: use supported APIs such as VarHandle, MethodHandles and the Foreign Function & Memory API.',
        sources: [
          { label: 'JEP 396: Strongly Encapsulate JDK Internals by Default', url: 'https://openjdk.org/jeps/396' },
          { label: 'JEP 403: Strongly Encapsulate JDK Internals', url: 'https://openjdk.org/jeps/403' },
        ],
      },
      {
        title: 'JAR tricks: Main-Class, -jar and multi-release JARs',
        body: 'With `java -jar app.jar`, the launcher takes the classpath **only** from the JAR\'s manifest (`Class-Path`) and ignores `-cp` — a frequent source of "works with -cp, fails with -jar". Since Java 9, multi-release JARs (JEP 238) can carry version-specific classes under `META-INF/versions/N/`, so one artifact can use newer APIs on newer runtimes while still working on older ones.',
        sources: [
          { label: 'JEP 238: Multi-Release JAR Files', url: 'https://openjdk.org/jeps/238' },
          { label: 'JEP 511: Module Import Declarations', url: 'https://openjdk.org/jeps/511' },
        ],
      },
    ],
  },
  'p-java-releases': {
    interviewDefinition:
      'Since Java 10 the JDK ships a **feature release every six months**, in March and September, with time-based version numbers (JEP 322) and quarterly update releases for security fixes. Some releases are designated **long-term support** — 8, 11 and 17, then every two years: 21 and 25 — and vendors patch them for years. New features mature in stages: **incubator** APIs (JEP 11), **preview** features that need `--enable-preview` (JEP 12) and **experimental** VM features behind `-XX:+UnlockExperimentalVMOptions`, before becoming **final** and permanently covered by Java\'s compatibility promise.',
    interviewFollowUps: [
      {
        question: 'Why does a class compiled with preview features fail on the next JDK?',
        answer: 'javac marks it with minor version 65535 (0xFFFF). A JVM loads such a class only if its own release matches the major version exactly and it was started with `--enable-preview`, because the feature may change in the next release.',
      },
      {
        question: 'Incubator vs preview?',
        answer: 'An incubator is a non-final **API** shipped in a `jdk.incubator.*` module, used via `--add-modules` (e.g. the Vector API). A preview is a fully specified language, VM or Java SE API feature gated by `--enable-preview` (e.g. structured concurrency, still a preview in 25).',
      },
      {
        question: 'How would you plan an upgrade from Java 17 to 25?',
        answer: 'Upgrade build plugins and bytecode libraries (ASM, Byte Buddy, Mockito) first; run `jdeps --jdk-internals` and `jdeprscan`; build and test on 25 in CI while still compiling with `--release 17`; then switch the runtime, check GC/JVM-flag changes and removed APIs, and finally raise `--release` to start using new features.',
      },
    ],
    mnemonic: {
      device: '"Every Idea Proves itself First" — Experimental, Incubator, Preview, Final',
      expansion: [
        { key: 'Experimental', meaning: 'JVM features behind -XX:+UnlockExperimentalVMOptions (e.g. ZGC in Java 11)' },
        { key: 'Incubator', meaning: 'non-final APIs in jdk.incubator.* modules (e.g. the Vector API)' },
        { key: 'Preview', meaning: 'complete, specified features needing --enable-preview; may still change or be removed' },
        { key: 'First-class (Final)', meaning: 'standard and permanent, covered by the compatibility promise' },
      ],
      visual: 'A new aircraft: ground tests on the factory floor (experimental), test flights with engineers only (incubator), public beta flights with passengers who signed a waiver (preview), and finally scheduled service (final).',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'A train that leaves on time',
        body: 'The JDK is a train that departs every March and September whether or not a given feature is ready. A feature that is not done simply waits for the next train, so releases are never delayed by one big item. LTS releases are the trains the maintenance crews keep servicing for years.',
      },
      {
        kind: 'insight',
        title: 'Previews really do change — or disappear',
        body: 'String templates were previewed in Java 21 and 22 and then withdrawn in 23 for redesign; code that used them stopped compiling. Pattern matching for switch went through four previews (17–20) with syntax changes before becoming final in 21. A preview is a real feature you can try, not a promise.',
      },
      {
        kind: 'real-world',
        title: 'Why so many teams stayed on Java 8',
        body: 'Java 9 modularised the JDK and hid internal APIs, and Java 11 removed the Java EE and CORBA modules (JEP 320). Libraries that reached into internals, and applications relying on bundled JAXB or JAX-WS, broke. Many organisations stayed on Java 8 for years; most later jumped LTS to LTS (8 → 11 → 17 → 21), using `jdeps` to find internal-API use and adding the removed libraries as normal dependencies.',
      },
      {
        kind: 'angle',
        title: 'LTS is a vendor promise, not an OpenJDK feature',
        body: 'OpenJDK itself has no concept of LTS: the mainline moves on every six months. Oracle designates LTS releases, and long-term update projects (jdk17u, jdk21u…) are then maintained by the community and vendors. In 2021 Oracle shortened the LTS cadence from three years to two, which is why 21 (not 23) followed 17.',
      },
    ],
    diagrams: [
      {
        id: 'p4-lts-timeline',
        kind: 'concept',
        title: 'LTS releases and their headline features',
        caption: 'LTS releases came every three to four years until 17; since then every two years. The next LTS on this cadence would be Java 29 (expected September 2027).',
        cols: 5,
        rows: 2,
        nodes: [
          { id: 'j8', label: 'Java 8', detail: 'March 2014', col: 0, row: 0, shape: 'pill', tone: 'primary' },
          { id: 'j11', label: 'Java 11', detail: 'September 2018', col: 1, row: 0, shape: 'pill', tone: 'primary' },
          { id: 'j17', label: 'Java 17', detail: 'September 2021', col: 2, row: 0, shape: 'pill', tone: 'primary' },
          { id: 'j21', label: 'Java 21', detail: 'September 2023', col: 3, row: 0, shape: 'pill', tone: 'primary' },
          { id: 'j25', label: 'Java 25', detail: 'September 2025', col: 4, row: 0, shape: 'pill', tone: 'primary' },
          { id: 'f8', label: 'Lambdas, streams', detail: 'java.time, Optional', col: 0, row: 1, tone: 'neutral' },
          { id: 'f11', label: 'HttpClient', detail: 'java Main.java, var in lambdas', col: 1, row: 1, tone: 'neutral' },
          { id: 'f17', label: 'Records, sealed', detail: 'text blocks, switch exprs', col: 2, row: 1, tone: 'neutral' },
          { id: 'f21', label: 'Virtual threads', detail: 'pattern switch, sequenced', col: 3, row: 1, tone: 'neutral' },
          { id: 'f25', label: 'void main()', detail: 'scoped values, module imports', col: 4, row: 1, tone: 'neutral' },
        ],
        edges: [
          { from: 'j8', to: 'j11', label: '4 years' },
          { from: 'j11', to: 'j17', label: '3 years' },
          { from: 'j17', to: 'j21', label: '2 years' },
          { from: 'j21', to: 'j25', label: '2 years' },
        ],
      },
      {
        id: 'p4-feature-path',
        kind: 'flow',
        title: 'How a feature becomes final',
        caption: 'Language and VM features usually pass through one or more previews; some APIs incubate first (HttpClient incubated in 9–10, final in 11). Experimental VM features become product features. Previews can also be withdrawn.',
        cols: 4,
        rows: 2,
        nodes: [
          { id: 'jep', label: 'JEP', detail: 'draft → candidate → targeted', col: 0, row: 0, shape: 'note', tone: 'neutral' },
          { id: 'prev', label: 'Preview', detail: '--enable-preview; may change', col: 2, row: 0, tone: 'warning' },
          { id: 'final', label: 'Final', detail: 'permanent, compatible', col: 3, row: 0, shape: 'pill', tone: 'success' },
          { id: 'inc', label: 'Incubator', detail: 'API in jdk.incubator.*', col: 1, row: 1, tone: 'accent' },
          { id: 'gone', label: 'Withdrawn', detail: 'e.g. string templates', col: 2, row: 1, shape: 'pill', tone: 'danger' },
          { id: 'exp', label: 'Experimental', detail: 'VM flag, e.g. ZGC in 11', col: 3, row: 1, tone: 'accent' },
        ],
        edges: [
          { from: 'jep', to: 'prev', label: 'language / VM' },
          { from: 'jep', to: 'inc', label: 'new API' },
          { from: 'inc', to: 'final', label: 'API settled' },
          { from: 'prev', to: 'final', label: 'feedback done' },
          { from: 'prev', to: 'gone', label: 'redesign' },
          { from: 'exp', to: 'final', label: 'product (ZGC: 15)' },
        ],
      },
      {
        id: 'p4-version-string',
        kind: 'concept',
        title: 'Reading a version string: 21.0.5+11',
        caption: 'Time-based versioning (JEP 322): only the first number changes every six months; the update number climbs with each quarterly patch release.',
        cols: 4,
        rows: 2,
        nodes: [
          { id: 'feat', label: '21 · FEATURE', detail: 'bumped every six months', col: 0, row: 0, tone: 'primary' },
          { id: 'interim', label: '0 · INTERIM', detail: 'zero in practice', col: 1, row: 0, tone: 'neutral' },
          { id: 'upd', label: '5 · UPDATE', detail: 'quarterly security and bug fixes', col: 2, row: 0, tone: 'accent' },
          { id: 'build', label: '+11 · BUILD', detail: 'build number', col: 3, row: 0, tone: 'neutral' },
          { id: 'cmd', label: 'java -version → openjdk version "21.0.5"', detail: 'Runtime.version().feature() returns 21', col: 0, row: 1, span: 4, shape: 'note', tone: 'success' },
        ],
        edges: [
          { from: 'feat', to: 'interim' },
          { from: 'interim', to: 'upd' },
          { from: 'upd', to: 'build' },
        ],
      },
    ],
    variants: [
      {
        title: 'Release and feature types',
        items: [
          { name: 'LTS release', summary: 'A feature release that vendors support for years (8, 11, 17, 21, 25). The usual production choice.', support: 'supported' },
          { name: 'Feature (non-LTS) release', summary: 'Every six months; supported until the next release. Good for teams that upgrade continuously.', support: 'supported', note: 'e.g. 22–24, 26, 27' },
          { name: 'Update release', summary: 'Quarterly patch releases (21.0.1, 21.0.2…) with security and bug fixes; no new features.', support: 'supported' },
          { name: 'Preview feature', summary: 'A complete language, VM or API feature (JEP 12) requiring --enable-preview at compile and run time; class files only run on that exact release.', support: 'partial', code: 'javac --release 25 --enable-preview Main.java' },
          { name: 'Incubator module', summary: 'A non-final API in a jdk.incubator.* module (JEP 11), e.g. jdk.incubator.vector; needs --add-modules and prints a warning.', support: 'partial', code: 'java --add-modules jdk.incubator.vector App' },
          { name: 'Experimental VM feature', summary: 'A HotSpot feature that must be unlocked with -XX:+UnlockExperimentalVMOptions; not supported for production until promoted.', support: 'partial', code: 'java -XX:+UnlockExperimentalVMOptions -XX:+SomeFlag App' },
        ],
      },
      {
        title: 'LTS releases at a glance',
        items: [
          { name: 'Java 8 (2014)', summary: 'Lambdas, streams, default methods, java.time, Optional.' },
          { name: 'Java 11 (2018)', summary: 'Standard HttpClient, single-file source launch, String helpers (isBlank, strip, lines, repeat); Java EE and CORBA modules removed. Brings in var (10) and the module system (9).' },
          { name: 'Java 17 (2021)', summary: 'Records (16), sealed classes, text blocks (15), switch expressions (14), instanceof patterns (16), strong encapsulation of JDK internals.' },
          { name: 'Java 21 (2023)', summary: 'Virtual threads, pattern matching for switch, record patterns, sequenced collections, generational ZGC.' },
          { name: 'Java 25 (2025)', summary: 'Compact source files and instance main methods, flexible constructor bodies, module imports, scoped values, compact object headers; stream gatherers and the Class-File API (final in 24).' },
        ],
      },
    ],
    deepDive: [
      {
        title: 'The preview contract in detail',
        body: 'JEP 12 requires a preview feature to be fully specified and implemented, yet impermanent. javac refuses preview syntax unless given `--enable-preview` together with `--release N` (or `--source N`) for the current release, and warns that the class uses preview features. The class file\'s minor version is set to 65535; the JVM loads it only when its own feature release equals the major version and it, too, was started with `--enable-preview`. Previews can also cover APIs, marked as preview in the Javadoc.',
        sources: [{ label: 'JEP 12: Preview Features', url: 'https://openjdk.org/jeps/12' }],
      },
      {
        title: 'Experimental to product: the garbage collector story',
        body: 'ZGC arrived as an experimental collector in Java 11 (JEP 333) and became a product feature in 15 (JEP 377); Shenandoah followed the same path (experimental in 12, product in 15). Generational ZGC became the default ZGC mode in 23 and the non-generational mode was removed in 24. The experimental Graal JIT and AOT compiler, by contrast, were removed from the JDK in 17 (JEP 410). "Experimental" really means it can go either way.',
        sources: [
          { label: 'JEP 377: ZGC: A Scalable Low-Latency Garbage Collector (Production)', url: 'https://openjdk.org/jeps/377' },
          { label: 'JEP 410: Remove the Experimental AOT and JIT Compiler', url: 'https://openjdk.org/jeps/410' },
        ],
      },
      {
        title: 'Time-based versioning and --release',
        body: 'JEP 322 (Java 10) replaced feature-driven releases with fixed dates and the FEATURE.INTERIM.UPDATE.PATCH scheme, ending the "1.8" naming. Pair it with `javac --release N` (JEP 247, Java 9): it compiles against a recorded signature of release N\'s API, so code built on JDK 25 for `--release 17` cannot accidentally call an API added in 21 — something `-source`/`-target` alone does not prevent.',
        sources: [
          { label: 'JEP 322: Time-Based Release Versioning', url: 'https://openjdk.org/jeps/322' },
          { label: 'JEP 247: Compile for Older Platform Versions', url: 'https://openjdk.org/jeps/247' },
          { label: 'JEP 11: Incubator Modules', url: 'https://openjdk.org/jeps/11' },
        ],
      },
    ],
  },
};
