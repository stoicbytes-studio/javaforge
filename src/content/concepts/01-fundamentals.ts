import type { LessonConcepts } from '@/types/curriculum';

/** Concept pages for module 1 (Fundamentals), keyed by lesson id. */
export const fundamentalsConcepts: Record<string, LessonConcepts> = {
  'f-first-program': {
    interviewDefinition:
      'A Java program is compiled ahead of time by `javac` into platform-neutral **bytecode** (`.class` files), then executed by a **Java Virtual Machine**, which loads, verifies and runs that bytecode — first by interpreting it, then by JIT-compiling hot code to native machine code. That split between compile time and run time is what gives Java "write once, run anywhere" plus near-native speed.',
    interviewFollowUps: [
      {
        question: 'Is Java compiled or interpreted?',
        answer: 'Both. `javac` compiles source to bytecode ahead of time; the JVM then interprets that bytecode and JIT-compiles frequently executed methods to native code at run time.',
      },
      {
        question: 'Why must `main` be `public static void main(String[] args)`?',
        answer: 'The launcher calls it from outside the class (public) before any object exists (static), ignores any return value (void) and passes command-line arguments as a String array. Since Java 25 (JEP 512), simpler instance `void main()` entry points are also allowed.',
      },
      {
        question: 'What happens if the class name does not match the file name?',
        answer: 'A **public** top-level class must live in a file with the same name, or `javac` reports an error. Non-public classes may live in any file name.',
      },
    ],
    mnemonic: {
      device: 'S-C-B-J-O: "Some Coders Build Java Often"',
      expansion: [
        { key: 'S', meaning: 'Source — you write Main.java' },
        { key: 'C', meaning: 'Compile — javac checks types and emits bytecode' },
        { key: 'B', meaning: 'Bytecode — Main.class, the same on every OS' },
        { key: 'J', meaning: 'JVM — loads, verifies, interprets and JIT-compiles' },
        { key: 'O', meaning: 'Output — the program runs on the real machine' },
      ],
      visual: 'Picture a recipe (source) translated once into a universal recipe card (bytecode) that any kitchen (JVM) in any country (OS) can cook from.',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'Bytecode is a universal power adapter',
        body: 'Your laptop charger (bytecode) never changes when you travel. Each country (Windows, Linux, macOS) has a different socket, so you carry an adapter (the JVM for that OS). Java ships one adapter per platform instead of asking you to rebuild your laptop.',
      },
      {
        kind: 'insight',
        title: 'Two compilers, two jobs',
        body: '`javac` is a strict but simple translator: it checks types and emits bytecode with few optimisations. The heavy optimisation happens later in the JIT, which can see the real workload (which branches are hot, which classes are actually used) — information no ahead-of-time compiler has.',
      },
      {
        kind: 'real-world',
        title: 'Why servers "warm up"',
        body: 'A freshly started Java service is slower for its first few thousand requests because code is still interpreted. Teams send warm-up traffic or use CDS/AOT caches (Java 24+, JEP 483) before putting an instance into a load balancer.',
      },
      {
        kind: 'angle',
        title: 'Single-file programs skip the visible compile step',
        body: 'Since Java 11 (JEP 330) you can run `java Main.java` directly: the launcher compiles in memory and runs. Java 22 (JEP 458) extended this to programs made of several source files. The lifecycle is the same — the compile step just happens for you.',
      },
    ],
    diagrams: [
      {
        id: 'f1-lifecycle',
        kind: 'flow',
        title: 'From source to running program',
        caption: 'Compilation happens once on the developer machine; loading, verification and execution happen every time the program starts.',
        cols: 5,
        rows: 2,
        nodes: [
          { id: 'src', label: 'Main.java', detail: 'source code', col: 0, row: 0, shape: 'note' },
          { id: 'javac', label: 'javac', detail: 'type-check + compile', col: 1, row: 0, tone: 'primary' },
          { id: 'cls', label: 'Main.class', detail: 'bytecode', col: 2, row: 0, shape: 'note', tone: 'accent' },
          { id: 'load', label: 'Class loader', detail: 'load + verify', col: 3, row: 0, tone: 'primary' },
          { id: 'exec', label: 'Execution engine', detail: 'interpreter, then JIT', col: 4, row: 0, tone: 'primary' },
          { id: 'out', label: 'Output', detail: 'native instructions on the CPU', col: 4, row: 1, shape: 'pill', tone: 'success' },
          { id: 'err', label: 'Compile error', detail: 'nothing is produced', col: 1, row: 1, shape: 'pill', tone: 'danger' },
        ],
        edges: [
          { from: 'src', to: 'javac' },
          { from: 'javac', to: 'cls', label: 'success' },
          { from: 'javac', to: 'err', label: 'type error', dashed: true },
          { from: 'cls', to: 'load', label: 'java Main' },
          { from: 'load', to: 'exec' },
          { from: 'exec', to: 'out' },
        ],
        groups: [
          { label: 'Compile time (once)', fromCol: 0, toCol: 2, fromRow: 0, toRow: 1, tone: 'neutral' },
          { label: 'Run time (every start)', fromCol: 3, toCol: 4, fromRow: 0, toRow: 1, tone: 'primary' },
        ],
      },
      {
        id: 'f1-wora',
        kind: 'concept',
        title: 'Write once, run anywhere',
        caption: 'One .class file runs unchanged on every operating system, because each OS has its own JVM that understands the same bytecode.',
        cols: 3,
        rows: 3,
        nodes: [
          { id: 'cls', label: 'Main.class', detail: 'the same bytes everywhere', col: 1, row: 0, shape: 'note', tone: 'accent' },
          { id: 'jw', label: 'JVM for Windows', col: 0, row: 1, tone: 'primary' },
          { id: 'jl', label: 'JVM for Linux', col: 1, row: 1, tone: 'primary' },
          { id: 'jm', label: 'JVM for macOS', col: 2, row: 1, tone: 'primary' },
          { id: 'ow', label: 'x86-64 machine code', col: 0, row: 2, shape: 'pill', tone: 'neutral' },
          { id: 'ol', label: 'x86-64 / ARM code', col: 1, row: 2, shape: 'pill', tone: 'neutral' },
          { id: 'om', label: 'ARM64 machine code', col: 2, row: 2, shape: 'pill', tone: 'neutral' },
        ],
        edges: [
          { from: 'cls', to: 'jw' },
          { from: 'cls', to: 'jl' },
          { from: 'cls', to: 'jm' },
          { from: 'jw', to: 'ow', label: 'JIT' },
          { from: 'jl', to: 'ol', label: 'JIT' },
          { from: 'jm', to: 'om', label: 'JIT' },
        ],
      },
      {
        id: 'f1-jvm-arch',
        kind: 'architecture',
        title: 'Inside the JVM process',
        caption: 'The class loader feeds class metadata into memory; the execution engine runs bytecode against the stacks and heap and calls into the OS through native code.',
        cols: 3,
        rows: 3,
        nodes: [
          { id: 'cl', label: 'Class loader subsystem', detail: 'load, link, initialise', col: 0, row: 0, span: 3, tone: 'primary' },
          { id: 'meta', label: 'Metaspace', detail: 'class metadata', col: 0, row: 1, shape: 'cylinder', tone: 'accent' },
          { id: 'heap', label: 'Heap', detail: 'objects (GC managed)', col: 1, row: 1, shape: 'cylinder', tone: 'accent' },
          { id: 'stack', label: 'Thread stacks', detail: 'frames + locals', col: 2, row: 1, shape: 'cylinder', tone: 'accent' },
          { id: 'engine', label: 'Execution engine', detail: 'interpreter, JIT, GC', col: 0, row: 2, span: 2, tone: 'primary' },
          { id: 'native', label: 'Native interface', detail: 'OS and libraries', col: 2, row: 2, tone: 'neutral' },
        ],
        edges: [
          { from: 'cl', to: 'meta' },
          { from: 'engine', to: 'heap', both: true },
          { from: 'engine', to: 'native' },
        ],
        groups: [{ label: 'Runtime data areas', fromCol: 0, toCol: 2, fromRow: 1, toRow: 1, tone: 'accent' }],
      },
    ],
    deepDive: [
      {
        title: 'Linking happens lazily — and that explains surprising errors',
        body: 'Class loading has three phases: **loading** (find the bytes), **linking** (verify, prepare static fields, optionally resolve symbolic references) and **initialisation** (run static initialisers). HotSpot resolves references lazily, the first time an instruction uses them. That is why a missing dependency often shows up as `NoClassDefFoundError` deep inside a running program instead of at start-up: the class was only needed when that code path first ran.',
        sources: [
          { label: 'JVM Specification, chapter 5: Loading, Linking, and Initializing', url: 'https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-5.html' },
        ],
      },
      {
        title: 'The verifier is a security boundary, not a formality',
        body: 'Bytecode does not have to come from `javac`. Before running a class the JVM verifies it: stack depths match, types are used consistently, jumps land on instruction boundaries. Because of verification, bytecode cannot forge pointers or corrupt the heap even if it was hand-crafted — a guarantee native code does not have.',
        sources: [{ label: 'JVM Specification §4.10: Verification of class Files', url: 'https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-4.html#jvms-4.10' }],
      },
      {
        title: 'Start-up time is now a first-class concern',
        body: 'Class Data Sharing (default CDS archive since Java 12) memory-maps pre-parsed JDK classes. Java 24 added ahead-of-time class loading and linking caches (JEP 483), and Java 25 added AOT method profiling (JEP 515), so the JIT starts with profiles from a training run. For containers and serverless functions, these flags often cut start-up time more than any code change.',
        sources: [
          { label: 'JEP 483: Ahead-of-Time Class Loading & Linking', url: 'https://openjdk.org/jeps/483' },
          { label: 'JEP 515: Ahead-of-Time Method Profiling', url: 'https://openjdk.org/jeps/515' },
        ],
      },
    ],
  },
};
