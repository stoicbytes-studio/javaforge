import type { CurriculumModule } from '@/types/curriculum';

export const jvmRuntimeModule: CurriculumModule = {
  id: 'jvm-runtime',
  order: 8,
  title: 'JVM Runtime: Memory, Class Loading, JIT and GC',
  shortTitle: 'JVM Runtime',
  summary: 'Runtime data areas, how the JIT optimises, how garbage collectors work, and how to recognise and fix memory leaks.',
  level: 'advanced',
  prerequisites: ['oop', 'collections'],
  plannedTopics: ['JIT compiler internals'],
  lessons: [
    {
      id: 'r-memory-areas',
      moduleId: 'jvm-runtime',
      title: 'Runtime data areas and the JIT compiler',
      summary: 'Heap, stacks, Metaspace, code cache and how HotSpot turns hot bytecode into optimised machine code.',
      estimatedMinutes: 35,
      difficulty: 'advanced',
      prerequisites: ['p-bytecode', 'f-methods'],
      versionNotes: [
        { feature: 'Metaspace replaces PermGen', since: 8 },
        { feature: 'Compact object headers (-XX:+UseCompactObjectHeaders)', since: 25, note: 'Experimental in 24, product option in 25' },
      ],
      objectives: [
        'Name the JVM runtime data areas and what lives in each.',
        'Explain the difference between StackOverflowError and OutOfMemoryError.',
        'Describe tiered compilation and common JIT optimisations.',
      ],
      plainEnglish: `When a Java program runs, the JVM organises memory into areas with different jobs:

- the **heap** holds every object and array, shared by all threads;
- each thread has its own **stack** of frames for method calls (local variables and intermediate values);
- **Metaspace** holds class metadata such as method bytecode and the constant pool;
- the **code cache** holds machine code produced by the JIT compiler.

The JVM starts by interpreting bytecode, watches which methods run often, and compiles those "hot" methods into fast machine code.`,
      technical: `### Areas (JVMS §2.5, HotSpot terms)
- **Heap**: objects and arrays; managed by the garbage collector; sized with -Xms/-Xmx (or -XX:MaxRAMPercentage in containers). Exhaustion → \`OutOfMemoryError: Java heap space\`.
- **Thread stacks**: one per platform thread, sized with -Xss (default 1 MB on 64-bit Linux). Frames hold locals, an operand stack and a reference to the class's constant pool. Deep recursion → \`StackOverflowError\`. Virtual threads keep their stacks on the heap as chunks while unmounted.
- **Metaspace** (since Java 8, native memory): class metadata. Class-loader leaks (e.g. redeploying web apps) → \`OutOfMemoryError: Metaspace\`.
- **Code cache**: JIT-compiled code.
- **Program counter** per thread, and native method stacks.
- Direct buffers and thread stacks are native memory, so a process can exceed -Xmx; container limits must leave headroom.

### Object layout
A HotSpot object has a header (mark word for hashing/locking/GC age plus a class pointer; 12 bytes with compressed class pointers) followed by fields, padded to 8 bytes. Java 25's compact object headers shrink the header to 8 bytes.

### JIT compilation
HotSpot uses **tiered compilation**: the interpreter collects profiles; C1 compiles quickly with light optimisation; methods that stay hot are recompiled by **C2** with aggressive optimisations:
- **inlining** small and frequently called methods (the gateway to most others),
- **escape analysis**: objects that never escape a method may be scalar-replaced and never allocated on the heap,
- loop unrolling, bounds-check elimination, intrinsics (e.g. String and Math methods),
- **speculative optimisation** based on profiles (e.g. a call site that only ever saw one class is devirtualised); if the assumption breaks, the JVM **deoptimises** back to the interpreter.

That is why micro-benchmarks need warm-up (use JMH) and why "Java is slow" claims from cold-start measurements are misleading.`,
      whyItExists: `Separating per-thread stacks from a shared heap makes method calls cheap and memory management automatic. Profile-guided JIT compilation lets Java optimise for the real workload and real CPU, often beating ahead-of-time compilers on long-running servers.`,
      whenToUse: [
        'Use this model to diagnose OutOfMemoryError variants and StackOverflowError.',
        'Size heap and container memory together, leaving room for native memory.',
        'Benchmark only after warm-up, with JMH.',
      ],
      whenNotToUse: [
        'Do not hand-optimise code for the interpreter (manual inlining, avoiding small methods) — the JIT does it better.',
        'Do not set -Xmx equal to the container limit.',
      ],
      examples: [
        {
          id: 'stack-vs-heap',
          title: 'Stack overflow vs heap exhaustion',
          runnable: true,
          code: `public class Main {
    static int depth = 0;

    static void recurse() {
        depth++;
        recurse();
    }

    public static void main(String[] args) {
        try {
            recurse();
        } catch (StackOverflowError e) {
            System.out.println("StackOverflowError after a deep call chain: " + (depth > 1000));
        }

        long maxHeap = Runtime.getRuntime().maxMemory();
        int length = (int) Math.min(Integer.MAX_VALUE - 8, maxHeap / 8 + 1);
        try {
            long[] tooBig = new long[length];   // more bytes than the whole heap
            System.out.println("allocated " + tooBig.length);
        } catch (OutOfMemoryError e) {
            System.out.println("OutOfMemoryError: " + e.getMessage());
        }
    }
}`,
          expectedOutput: `StackOverflowError after a deep call chain: true
OutOfMemoryError: Java heap space`,
          explanation: 'Catching these errors is done here only to demonstrate them; production code should not try to recover from either. On a JVM with a heap above 16 GB the array would fit and the program prints "allocated" instead.',
        },
        {
          id: 'runtime-memory',
          title: 'Inspecting memory from inside the JVM',
          runnable: true,
          code: `import java.lang.management.ManagementFactory;
import java.lang.management.MemoryPoolMXBean;

public class Main {
    public static void main(String[] args) {
        Runtime rt = Runtime.getRuntime();
        System.out.println("max heap MB:   " + rt.maxMemory() / (1024 * 1024));
        System.out.println("total heap MB: " + rt.totalMemory() / (1024 * 1024));
        System.out.println("free heap MB:  " + rt.freeMemory() / (1024 * 1024));
        for (MemoryPoolMXBean pool : ManagementFactory.getMemoryPoolMXBeans()) {
            System.out.println(pool.getType() + " " + pool.getName());
        }
    }
}`,
          explanation: 'Pool names depend on the garbage collector in use (e.g. "G1 Eden Space", "Metaspace", "CodeHeap ..."). Output varies by machine.',
        },
      ],
      walkthrough: {
        exampleId: 'stack-vs-heap',
        steps: [
          { lines: [4, 7], text: 'Each recursive call pushes a frame on the thread stack. With no base case, the stack fills up.' },
          { lines: [10, 14], text: 'The JVM throws StackOverflowError when the stack has no room for another frame — the heap is not involved.' },
          { lines: [16, 17], text: 'maxMemory() reports the heap limit (-Xmx). The array length is chosen so the array needs more bytes than the entire heap.' },
          { lines: [18, 23], text: 'Arrays live on the heap. When the GC cannot find enough space even after collecting, the JVM throws OutOfMemoryError: Java heap space. In real services the usual cause is reachable data accumulating, not one huge array.' },
        ],
      },
      realWorld: {
        title: 'A container killed with plenty of heap left',
        scenario: `A service ran in a 1 GiB container with \`-Xmx1g\`. Kubernetes kept killing it (OOMKilled) although heap usage never exceeded 700 MB. The JVM also uses native memory: Metaspace, code cache, thread stacks (300 threads × 1 MB) and direct buffers from the HTTP client. Together they pushed the process beyond 1 GiB.

Switching to \`-XX:MaxRAMPercentage=75\` and enabling Native Memory Tracking (\`-XX:NativeMemoryTracking=summary\`, \`jcmd <pid> VM.native_memory\`) confirmed the budget. Moving the blocking HTTP calls to virtual threads cut thread stack usage further.`,
      },
      commonMistakes: [
        {
          mistake: 'Setting -Xmx equal to the container memory limit.',
          why: 'Non-heap memory (Metaspace, stacks, code cache, direct buffers) comes on top of the heap.',
          fix: 'Use MaxRAMPercentage around 70–75% and measure with Native Memory Tracking.',
        },
        {
          mistake: 'Measuring performance in the first seconds of a run.',
          why: 'Code is still interpreted or compiled by C1; C2 has not optimised it yet.',
          fix: 'Warm up and use JMH for micro-benchmarks.',
        },
        {
          mistake: 'Increasing -Xss to "fix" StackOverflowError.',
          why: 'It usually hides unbounded recursion.',
          fix: 'Fix the base case or convert deep recursion to iteration.',
        },
      ],
      checks: [
        {
          id: 'r1-c1',
          kind: 'mcq',
          dimension: 'runtime',
          prompt: 'Where are local primitive variables of a running method stored?',
          options: [
            { id: 'a', text: 'In the heap' },
            { id: 'b', text: 'In the current stack frame of the thread' },
            { id: 'c', text: 'In Metaspace' },
            { id: 'd', text: 'In the code cache' },
          ],
          correctOptionId: 'b',
          explanation: 'Locals live in the frame on the thread\'s stack; objects they reference live on the heap.',
        },
        {
          id: 'r1-c2',
          kind: 'mcq',
          dimension: 'runtime',
          prompt: 'A web server that is redeployed many times without restarting eventually fails with `OutOfMemoryError: Metaspace`. What is the likely cause?',
          options: [
            { id: 'a', text: 'Too many objects in the heap' },
            { id: 'b', text: 'A class loader leak: old application class loaders stay reachable, so their classes are never unloaded' },
            { id: 'c', text: 'Deep recursion' },
            { id: 'd', text: 'Too many JIT compilations' },
          ],
          correctOptionId: 'b',
          explanation: 'Classes are unloaded only when their class loader becomes unreachable. A static reference or a thread from the old deployment keeps it alive.',
        },
        {
          id: 'r1-c3',
          kind: 'mcq',
          dimension: 'runtime',
          prompt: 'What does escape analysis allow the C2 compiler to do?',
          options: [
            { id: 'a', text: 'Skip garbage collection entirely' },
            { id: 'b', text: 'Avoid heap allocation for objects that never escape a method (scalar replacement) and remove unnecessary locks' },
            { id: 'c', text: 'Run code in parallel automatically' },
            { id: 'd', text: 'Compile Java source directly' },
          ],
          correctOptionId: 'b',
          explanation: 'If an object provably does not escape, its fields can live in registers or the stack frame, and synchronization on it can be removed.',
        },
        {
          id: 'r1-c4',
          kind: 'multi-select',
          dimension: 'runtime',
          prompt: 'Which of these consume memory outside the Java heap? Select all that apply.',
          options: [
            { id: 'a', text: 'Metaspace' },
            { id: 'b', text: 'Platform thread stacks' },
            { id: 'c', text: 'Direct ByteBuffers' },
            { id: 'd', text: 'Arrays created with new' },
            { id: 'e', text: 'The JIT code cache' },
          ],
          correctOptionIds: ['a', 'b', 'c', 'e'],
          explanation: 'Arrays are heap objects. The rest is native memory, which is why process memory exceeds -Xmx.',
        },
      ],
      challengeIds: [],
      masteryCriteria: [
        'Map each OutOfMemoryError variant to the memory area involved.',
        'Explain tiered compilation, inlining, escape analysis and deoptimisation.',
        'Budget container memory for heap plus native areas.',
      ],
      relatedLessonIds: ['r-gc', 'r-class-loading', 'p-bytecode', 'f-methods'],
      revision: [
        { id: 'r1', question: 'Name the main JVM runtime memory areas.', answer: 'Heap (objects), per-thread stacks (frames), Metaspace (class metadata), code cache (JIT code), PC registers and native stacks.' },
        { id: 'r2', question: 'What is deoptimisation?', answer: 'When a speculative assumption made by the JIT (e.g. only one receiver class) becomes false, compiled code is discarded and execution falls back to the interpreter until recompiled.' },
        { id: 'r3', question: 'Why can a JVM process use more memory than -Xmx?', answer: 'Metaspace, thread stacks, code cache, GC structures and direct buffers are native memory outside the heap.' },
      ],
    },
    {
      id: 'r-class-loading',
      moduleId: 'jvm-runtime',
      title: 'Class loading and the class loader hierarchy',
      summary: 'How the JVM finds, links and initialises classes, the built-in loaders and parent delegation, and why the same class name can mean two different classes.',
      estimatedMinutes: 35,
      difficulty: 'advanced',
      prerequisites: ['r-memory-areas', 'p-packages-classpath'],
      versionNotes: [
        { feature: 'Metaspace replaces PermGen for class metadata', since: 8 },
        { feature: 'Platform class loader replaces the extension class loader; ClassLoader.getName()', since: 9, note: 'Introduced with the module system (JEP 261)' },
        { feature: 'Hidden classes (Lookup.defineHiddenClass)', since: 15, note: 'JEP 371' },
        { feature: 'Ahead-of-time class loading and linking cache', since: 24, note: 'JEP 483' },
      ],
      objectives: [
        'Describe the three phases of class loading: loading, linking (verify, prepare, resolve) and initialisation.',
        'Name the built-in class loaders and explain parent delegation.',
        'Predict exactly when a class is initialised and in which order static initialisers run.',
        'Distinguish ClassNotFoundException from NoClassDefFoundError and diagnose each.',
        'Explain why a class is identified by its name plus its defining loader, and how that causes ClassCastException and Metaspace leaks.',
      ],
      plainEnglish: `Your program is made of hundreds of classes, but the JVM does not read them all at start-up. It loads each class **the first time it is needed**, from wherever it lives — the JDK itself, a JAR on the classpath, or somewhere more exotic.

The job is done by **class loaders**, arranged like a chain of command. When your code needs a class, the request goes **up** the chain first: "Does the JDK already have \`java.lang.String\`?" Only if no one above can find it does the loader for your application look in your JARs. That is why you cannot accidentally replace \`String\` with your own.

Loading a class happens in three steps: **load** the bytes, **link** them (check they are safe, set up static fields with default values, connect references to other classes) and finally **initialise** the class by running its static initialisers — exactly once, on first real use.`,
      technical: `### Phases (JVMS chapter 5)
1. **Loading** — a class loader finds the binary representation (usually a \`.class\` file in a JAR or the runtime image) and the JVM creates a \`Class\` object. Failure: \`ClassNotFoundException\` from \`loadClass\`/\`Class.forName\`, or \`NoClassDefFoundError\` when the JVM itself needed the class.
2. **Linking**
   - **Verification**: the bytecode is type-safe and well formed (\`VerifyError\` otherwise).
   - **Preparation**: static fields are allocated and set to default values (0, false, null).
   - **Resolution**: symbolic references in the constant pool become direct references. HotSpot resolves lazily, on first execution of each instruction.
3. **Initialisation** — the class's \`<clinit>\` runs: static field initialisers and \`static { }\` blocks in **textual order**, after the superclass has been initialised. The JVM holds an initialisation lock, so this happens exactly once even with many threads.

### When is a class initialised? (JLS 12.4.1)
On its **first active use**: creating an instance, calling a static method, reading or writing a static field that is not a compile-time constant, \`Class.forName(name)\` (which initialises by default), or initialising a subclass. Not on: reading a \`static final\` compile-time constant (javac copies the value into the caller), creating an array of the type, or using a class literal \`Foo.class\`. Reading \`Sub.inheritedField\` initialises only the class that **declares** the field.

### The built-in loaders (Java 9+)
- **Bootstrap** loader — part of the JVM; loads core modules such as \`java.base\`. Represented as \`null\` — \`String.class.getClassLoader()\` returns \`null\`.
- **Platform** loader (\`ClassLoader.getPlatformClassLoader()\`) — other Java SE and JDK modules such as \`java.sql\`. It replaced the extension loader in Java 9.
- **Application** (system) loader (\`ClassLoader.getSystemClassLoader()\`) — your classpath and module path. Its \`getName()\` is \`"app"\`.

### Parent delegation
\`ClassLoader.loadClass(name)\` checks whether it already loaded the class, then asks its **parent**, and only if the parent fails calls its own \`findClass\`. Custom loaders normally override \`findClass\`, not \`loadClass\`. Delegation keeps core classes unique and trusted. Some containers (servlet containers, OSGi, plugin systems) deliberately load **child-first** for application classes so that each application can bring its own library versions.

### Class identity
At run time a class is identified by **its binary name plus its defining loader**. Two loaders that each define \`com.acme.User\` produce two unrelated classes: an object of one fails \`instanceof\` and casts against the other, with the famously confusing "User cannot be cast to User" \`ClassCastException\`.

### ClassNotFoundException vs NoClassDefFoundError
- \`ClassNotFoundException\` (checked exception): **you** asked for a class by name (\`Class.forName\`, \`loadClass\`) and no loader found it — a typo, a missing driver or plugin JAR.
- \`NoClassDefFoundError\` (error): the class was present when your code was **compiled**, but the JVM cannot provide it now — a JAR missing at run time, a version conflict, or a class whose static initialiser already failed ("Could not initialize class X"). The first failure of a static initialiser throws \`ExceptionInInitializerError\`; every later use throws \`NoClassDefFoundError\`.

### Metaspace and unloading
Class metadata lives in **Metaspace** (native memory). A class can be unloaded only when its **defining loader becomes unreachable** together with all its classes and their instances — classes loaded by the bootstrap, platform and application loaders are never unloaded. Application servers that redeploy apps create a new loader per deployment; if anything long-lived (a ThreadLocal on a pool thread, a JDBC driver registered in \`DriverManager\`, a static cache in a shared library, a running thread) still references one old object, the whole old loader and all its classes stay in Metaspace. Repeat a few redeploys and you get \`OutOfMemoryError: Metaspace\`.`,
      whyItExists: `Loading classes lazily keeps start-up fast and memory low — most programs use a fraction of the JDK. Pluggable loaders let Java load code from anywhere (JARs, networks, generated bytecode) and isolate applications from each other inside one JVM, which is how application servers, IDE plugins and frameworks that generate proxies work. Parent delegation protects the platform: no application can substitute its own \`java.lang.String\`.`,
      whenToUse: [
        'Use this model to diagnose ClassNotFoundException, NoClassDefFoundError, ExceptionInInitializerError and "X cannot be cast to X".',
        'Rely on lazy initialisation (the holder-class idiom) for thread-safe lazy singletons.',
        'Use a dedicated class loader (for example URLClassLoader) for plugins that must be loaded, isolated and later unloaded.',
        'Investigate Metaspace growth after redeploys as a class loader leak.',
      ],
      whenNotToUse: [
        'Do not write a custom class loader when ServiceLoader or ordinary dependency injection is enough.',
        'Do not put slow work, I/O or code that can fail in static initialisers — failures make the class unusable for the life of the loader.',
        'Do not assume static state is global: each class loader that defines a class has its own copy of its static fields.',
      ],
      examples: [
        {
          id: 'class-loader-names',
          title: 'Who loaded this class?',
          runnable: true,
          code: `public class Main {
    public static void main(String[] args) {
        ClassLoader app = Main.class.getClassLoader();
        ClassLoader platform = app.getParent();
        System.out.println("Main loaded by:     " + app.getName());
        System.out.println("its parent:         " + platform.getName());
        System.out.println("parent of platform: " + platform.getParent());
        System.out.println("String loaded by:   " + String.class.getClassLoader());
        System.out.println("java.sql.Date by:   " + java.sql.Date.class.getClassLoader().getName());
        System.out.println("int.class loader:   " + int.class.getClassLoader());
        try {
            Class.forName("com.example.Missing");
        } catch (ClassNotFoundException e) {
            System.out.println("ClassNotFoundException: " + e.getMessage());
        }
    }
}`,
          expectedOutput: `Main loaded by:     app
its parent:         platform
parent of platform: null
String loaded by:   null
java.sql.Date by:   platform
int.class loader:   null
ClassNotFoundException: com.example.Missing`,
          explanation: 'null stands for the bootstrap loader, which lives inside the JVM and has no Java object. Primitive types report null too. Running the file with the single-file source launcher (java Main.java) would load Main through an in-memory loader instead of "app".',
        },
        {
          id: 'init-order',
          title: 'Exactly when static initialisers run',
          runnable: true,
          code: `public class Main {
    static class Parent {
        static { System.out.println("init Parent"); }
    }

    static class Config extends Parent {
        static final int LIMIT = 42;                 // compile-time constant: copied into callers
        static int counter = next("static field counter");
        static { System.out.println("init Config: static block"); }

        static int next(String what) {
            System.out.println("init Config: " + what);
            return 7;
        }
    }

    public static void main(String[] args) {
        System.out.println("main starts");
        System.out.println("LIMIT = " + Config.LIMIT);        // no initialisation
        Config[] slots = new Config[3];                         // no initialisation
        Class<?> type = Config.class;                           // no initialisation
        System.out.println("array and class literal: " + slots.length + " " + type.getSimpleName());
        System.out.println("counter = " + Config.counter);      // first active use
        System.out.println("counter again = " + Config.counter); // already initialised
    }
}`,
          expectedOutput: `main starts
LIMIT = 42
array and class literal: 3 Config
init Parent
init Config: static field counter
init Config: static block
counter = 7
counter again = 7`,
        },
        {
          id: 'loader-identity',
          title: 'Same name, different loader, different class',
          runnable: true,
          code: `import java.io.IOException;
import java.io.InputStream;

public class Main {
    public static class Greeter {
        public String hello() { return "hi"; }
    }

    // Loads Main$Greeter itself instead of asking its parent first.
    static class IsolatingLoader extends ClassLoader {
        IsolatingLoader(ClassLoader parent) { super("isolating", parent); }

        @Override
        protected Class<?> loadClass(String name, boolean resolve) throws ClassNotFoundException {
            if (!name.equals("Main$Greeter")) return super.loadClass(name, resolve); // parent first
            synchronized (getClassLoadingLock(name)) {
                Class<?> c = findLoadedClass(name);
                if (c == null) {
                    try (InputStream in = getParent().getResourceAsStream("Main$Greeter.class")) {
                        byte[] bytes = in.readAllBytes();
                        c = defineClass(name, bytes, 0, bytes.length);
                    } catch (IOException e) {
                        throw new ClassNotFoundException(name, e);
                    }
                }
                return c;
            }
        }
    }

    public static void main(String[] args) throws Exception {
        Class<?> a = Greeter.class;
        Class<?> b = new IsolatingLoader(Main.class.getClassLoader()).loadClass("Main$Greeter");

        System.out.println("same name:  " + a.getName().equals(b.getName()));
        System.out.println("same class: " + (a == b));
        System.out.println("loaders:    " + a.getClassLoader().getName() + " vs " + b.getClassLoader().getName());

        Object other = b.getDeclaredConstructor().newInstance();
        System.out.println("instanceof Greeter: " + (other instanceof Greeter));
        try {
            Greeter g = (Greeter) other;
            System.out.println(g.hello());
        } catch (ClassCastException e) {
            System.out.println("cast failed: ClassCastException");
        }
    }
}`,
          expectedOutput: `same name:  true
same class: false
loaders:    app vs isolating
instanceof Greeter: false
cast failed: ClassCastException`,
          explanation: 'The isolating loader breaks parent delegation for one class, the way servlet containers load each web application child-first. The bytes are identical, but the JVM treats the two Greeter classes as unrelated types.',
        },
        {
          id: 'failed-init',
          title: 'ExceptionInInitializerError, then NoClassDefFoundError',
          runnable: true,
          code: `public class Main {
    static class Broken {
        static final int VALUE = Integer.parseInt("not a number");   // static initialiser fails
    }

    public static void main(String[] args) {
        for (int attempt = 1; attempt <= 2; attempt++) {
            try {
                System.out.println(Broken.VALUE);
            } catch (Throwable t) {
                System.out.println(attempt + ": " + t.getClass().getSimpleName() + " - " + t.getMessage());
            }
        }
    }
}`,
          expectedOutput: `1: ExceptionInInitializerError - null
2: NoClassDefFoundError - Could not initialize class Main$Broken`,
          explanation: 'VALUE is not a compile-time constant (it calls a method), so reading it initialises Broken. The first failure is reported as ExceptionInInitializerError (its getCause() is the NumberFormatException); the class is then marked erroneous and every later use throws NoClassDefFoundError. In production logs, always search for the first error.',
        },
      ],
      walkthrough: {
        exampleId: 'init-order',
        steps: [
          { lines: [2, 4], text: 'Parent has a static block that announces when the class is initialised.' },
          { lines: [6, 9], text: 'Config extends Parent. Its static initialisers run in textual order: first the counter field initialiser, then the static block. LIMIT is a compile-time constant, so it needs no initialisation at all.' },
          { lines: [18, 19], text: 'Reading Config.LIMIT prints 42 without initialising Config: javac copied the constant 42 into Main\'s bytecode.' },
          { lines: [20, 22], text: 'Creating an array of Config and taking the class literal Config.class load the class but are not active uses, so still nothing is initialised.' },
          { lines: [23, 23], text: 'Reading the non-constant static field counter is the first active use. The superclass Parent is initialised first, then Config\'s initialisers run top to bottom.' },
          { lines: [24, 24], text: 'Initialisation happens once per class (per loader). The second read prints the value without re-running anything.' },
        ],
      },
      realWorld: {
        title: 'Metaspace grows by 40 MB on every redeploy',
        scenario: `A team hot-redeployed a web application to a shared Tomcat several times a day. After roughly ten redeploys the server died with \`OutOfMemoryError: Metaspace\`, and Tomcat logged warnings such as "The web application appears to have started a thread ... but has failed to stop it" and "registered the JDBC driver but failed to unregister it".

A heap dump showed ten instances of \`WebappClassLoader\`, nine of them for stopped applications. Following the paths to GC roots found three culprits: a JDBC driver registered in the JVM-wide \`DriverManager\` (loaded by the system loader, so it outlived the app), a scheduler thread the app had started and never stopped, and a \`ThreadLocal\` value left on a pooled request thread. Each held one object whose class came from the old loader — and a class holds its loader, which holds every class it defined.

The fixes: deregister the driver and shut the scheduler down in a \`ServletContextListener.contextDestroyed\`, call \`ThreadLocal.remove()\` in a \`finally\` block, and move to rolling restarts of immutable containers instead of in-place redeploys.`,
      },
      commonMistakes: [
        {
          mistake: 'Treating NoClassDefFoundError as "the class is not on the classpath".',
          why: 'It is often thrown because the class\'s static initialiser failed earlier ("Could not initialize class ..."), or because of a version conflict between JARs.',
          fix: 'Look for the first ExceptionInInitializerError in the logs, and check which JAR provides the class at run time (java -verbose:class or -Xlog:class+load).',
        },
        {
          mistake: 'Assuming a static field is a JVM-wide singleton.',
          why: 'Static state belongs to a class, and a class is per loader. Two web apps, two plugins or a test framework with an isolated loader each get their own copy.',
          fix: 'Keep shared state in an explicitly shared component, not in statics of classes that may be loaded more than once.',
        },
        {
          mistake: 'Overriding loadClass instead of findClass in a custom loader.',
          why: 'Overriding loadClass bypasses parent delegation and the loaded-class cache, which can load core classes twice or cause LinkageError.',
          fix: 'Override findClass(name) and call defineClass there; override loadClass only when child-first loading is the deliberate goal.',
        },
        {
          mistake: 'Doing heavy or failure-prone work in a static initialiser.',
          why: 'If it throws, the class is permanently unusable in that loader, and every later use fails with NoClassDefFoundError.',
          fix: 'Initialise lazily in a method that can retry, or validate configuration explicitly at start-up.',
        },
      ],
      checks: [
        {
          id: 'r3-c1',
          kind: 'mcq',
          dimension: 'runtime',
          prompt: 'You put your own `java/lang/String.class` in a JAR on the classpath. What happens when your code uses `String`?',
          options: [
            { id: 'a', text: 'Your String replaces the JDK\'s, because the classpath is searched first' },
            { id: 'b', text: 'The application loader delegates to its parents first, so the bootstrap loader\'s java.lang.String is used' },
            { id: 'c', text: 'The JVM picks whichever class file is newer' },
            { id: 'd', text: 'Both classes are loaded and the first one used wins' },
          ],
          correctOptionId: 'b',
          explanation: 'Parent delegation sends the request up to the bootstrap loader, which already defines java.lang.String. As a second line of defence, ClassLoader.defineClass refuses any class in a java.* package unless the bootstrap or platform loader defines it (SecurityException: Prohibited package name).',
        },
        {
          id: 'r3-c2',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this program print?',
          code: `public class Main {
    static class Base {
        static String greeting = "hello";
        static { System.out.println("Base init"); }
    }

    static class Derived extends Base {
        static { System.out.println("Derived init"); }
    }

    public static void main(String[] args) {
        System.out.println(Derived.greeting);
    }
}`,
          options: [
            { id: 'a', text: 'Base init\nDerived init\nhello' },
            { id: 'b', text: 'Base init\nhello' },
            { id: 'c', text: 'hello' },
            { id: 'd', text: 'Derived init\nBase init\nhello' },
          ],
          correctOptionId: 'b',
          explanation: 'A reference to a static field initialises only the class that declares it (JLS 12.4.1). greeting is declared in Base, so Base is initialised and Derived is not, even though the code says Derived.greeting.',
        },
        {
          id: 'r3-c3',
          kind: 'mcq',
          dimension: 'debugging',
          prompt: 'An app compiles fine but fails in production with `java.lang.NoClassDefFoundError: com/fasterxml/jackson/databind/ObjectMapper` the first time a report is exported. What is the most likely cause?',
          options: [
            { id: 'a', text: 'A typo in a Class.forName call' },
            { id: 'b', text: 'The Jackson JAR was on the compile classpath but is missing (or a conflicting version) on the runtime classpath' },
            { id: 'c', text: 'The heap is full' },
            { id: 'd', text: 'ObjectMapper is a final class' },
          ],
          correctOptionId: 'b',
          explanation: 'NoClassDefFoundError means the class existed at compile time but the JVM cannot load it now. Because resolution is lazy, it only appears when that code path first runs. ClassNotFoundException is the checked exception for explicit lookups by name.',
        },
        {
          id: 'r3-c4',
          kind: 'multi-select',
          dimension: 'interview',
          prompt: 'Which of these trigger initialisation of class `Cfg` (run its static initialisers) if it has not been initialised yet? Select all that apply.',
          options: [
            { id: 'a', text: 'new Cfg()' },
            { id: 'b', text: 'Calling the static method Cfg.load()' },
            { id: 'c', text: 'Reading static final int MAX = 10; as Cfg.MAX' },
            { id: 'd', text: 'Class.forName("Cfg")' },
            { id: 'e', text: 'new Cfg[10]' },
            { id: 'f', text: 'Initialising a subclass of Cfg' },
          ],
          correctOptionIds: ['a', 'b', 'd', 'f'],
          explanation: 'Instance creation, static method calls, Class.forName (which initialises by default) and subclass initialisation are active uses. A compile-time constant is inlined by javac, and creating an array does not initialise the element type.',
        },
        {
          id: 'r3-c5',
          kind: 'mcq',
          dimension: 'debugging',
          prompt: 'A plugin system throws `ClassCastException: class com.acme.Event cannot be cast to class com.acme.Event`. What does this tell you?',
          options: [
            { id: 'a', text: 'The JVM has a bug' },
            { id: 'b', text: 'Two different class loaders each defined com.acme.Event, so the JVM sees two unrelated types with the same name' },
            { id: 'c', text: 'Event is an interface and cannot be cast' },
            { id: 'd', text: 'The object was serialised incorrectly' },
          ],
          correctOptionId: 'b',
          explanation: 'Runtime class identity is (binary name, defining loader). Share API types through a common parent loader so the host and the plugins see the same Class object.',
        },
        {
          id: 'r3-c6',
          kind: 'mcq',
          dimension: 'runtime',
          prompt: 'When can the JVM unload a class and reclaim its Metaspace?',
          options: [
            { id: 'a', text: 'As soon as no instances of the class exist' },
            { id: 'b', text: 'When its defining class loader, all classes it defined and all their instances are unreachable' },
            { id: 'c', text: 'Never; classes stay loaded until the JVM exits' },
            { id: 'd', text: 'When System.gc() is called' },
          ],
          correctOptionId: 'b',
          explanation: 'Classes are unloaded together with their loader. Classes from the bootstrap, platform and application loaders are never unloaded; custom loaders (web apps, plugins, generated proxies) make unloading possible.',
        },
      ],
      challengeIds: [],
      masteryCriteria: [
        'List the loading, linking and initialisation steps and the error each one can raise.',
        'Explain parent delegation and name the bootstrap, platform and application loaders.',
        'Predict initialisation order, including constants, arrays, class literals and inherited static fields.',
        'Diagnose ClassNotFoundException, NoClassDefFoundError and "X cannot be cast to X".',
        'Trace a Metaspace leak after redeploys back to the reference that keeps an old class loader alive.',
      ],
      relatedLessonIds: ['r-memory-areas', 'r-gc', 'p-packages-classpath', 'p-bytecode'],
      revision: [
        { id: 'r1', question: 'What are the phases of class loading?', answer: 'Loading (find bytes, create the Class), linking (verification, preparation of static fields with defaults, resolution of symbolic references) and initialisation (run static initialisers once, on first active use).' },
        { id: 'r2', question: 'What is parent delegation?', answer: 'A class loader first asks its parent to load a class and only searches itself if the parent cannot. It keeps core classes unique and protected.' },
        { id: 'r3', question: 'ClassNotFoundException vs NoClassDefFoundError?', answer: 'ClassNotFoundException: an explicit lookup by name (Class.forName, loadClass) found nothing. NoClassDefFoundError: a class that existed at compile time cannot be provided at run time, including after its static initialiser failed.' },
        { id: 'r4', question: 'What identifies a class at run time?', answer: 'Its binary name together with its defining class loader. The same name in two loaders gives two distinct classes.' },
      ],
    },
    {
      id: 'r-gc',
      moduleId: 'jvm-runtime',
      title: 'Garbage collection and memory leaks',
      summary: 'Reachability, generational collection, the main HotSpot collectors and how to find leaks.',
      estimatedMinutes: 40,
      difficulty: 'advanced',
      prerequisites: ['r-memory-areas'],
      versionNotes: [
        { feature: 'G1 default collector', since: 9 },
        { feature: 'ZGC production-ready', since: 15 },
        { feature: 'Generational ZGC', since: 21, note: 'Default ZGC mode from 23' },
        { feature: 'Generational Shenandoah', since: 25 },
      ],
      objectives: [
        'Explain reachability from GC roots and why Java can still leak memory.',
        'Describe generational collection and the trade-offs of G1, ZGC, Shenandoah, Parallel and Serial.',
        'Diagnose a leak with heap histograms, heap dumps and GC logs.',
      ],
      plainEnglish: `Java frees memory for you: the **garbage collector** finds objects that the program can no longer reach and reclaims them. You never call \`free\`.

But "can no longer reach" is the rule, not "no longer needed". If a long-lived collection keeps references to objects you will never use again, the collector must keep them — that is a Java **memory leak**.`,
      technical: `### Reachability
A collection starts from **GC roots** — live thread stacks (locals), static fields, JNI references, active monitors — and marks everything reachable. Unmarked objects are garbage. Cycles are not a problem: unreachable cycles are collected.

### Generational hypothesis
Most objects die young. Young collections copy the few live objects out of Eden (to survivor spaces or the old generation) and reclaim the rest wholesale, so their cost depends on live data, not on garbage. Objects surviving several collections are promoted to the old generation, which is collected less often.

### HotSpot collectors
- **G1** (default): region-based, mostly concurrent marking, pause-time goal (-XX:MaxGCPauseMillis=200 by default). A good general choice.
- **ZGC**: concurrent compaction with pauses typically below a millisecond regardless of heap size; generational since 21 (default mode from 23). Good for large heaps and latency-sensitive services.
- **Shenandoah**: concurrent compaction (generational mode product in 25).
- **Parallel**: maximises throughput with stop-the-world pauses; good for batch jobs.
- **Serial**: single-threaded; small heaps and small containers.

### Finding leaks
1. Watch **heap after GC** over time (from GC logs: \`-Xlog:gc*\`) — a rising floor means a leak.
2. \`jcmd <pid> GC.class_histogram\` for a quick view of what is growing.
3. \`jcmd <pid> GC.heap_dump file.hprof\` (or \`-XX:+HeapDumpOnOutOfMemoryError\`) and analyse the **dominator tree** in Eclipse MAT or VisualVM to see what retains memory.

Typical culprits: unbounded caches and static maps, listeners never unregistered, ThreadLocals in thread pools, class-loader leaks, and large collections held by long-lived objects.

### Reference types
\`WeakReference\` objects are cleared when only weakly reachable (WeakHashMap keys), \`SoftReference\` when memory is tight, \`PhantomReference\`/\`Cleaner\` for post-mortem clean-up. They are tools for specific caches, not a fix for missing life-cycle management.`,
      whyItExists: `Automatic memory management eliminates use-after-free and double-free bugs and makes most allocation extremely cheap. Different collectors exist because throughput, pause time and memory overhead cannot all be optimised at once.`,
      whenToUse: [
        'Keep the default G1 unless measurements show a need.',
        'Choose ZGC for large heaps or strict latency targets; Parallel for throughput-oriented batch jobs.',
        'Enable GC logging and heap dumps on OOM in every production service.',
      ],
      whenNotToUse: [
        'Do not call System.gc() in application code.',
        'Do not "fix" a leak by increasing -Xmx.',
        'Do not tune dozens of GC flags without a measured problem.',
      ],
      examples: [
        {
          id: 'leak',
          title: 'A leak and its fix',
          runnable: true,
          code: `import java.util.*;

public class Main {
    // Leaky: grows forever because keys are unique per request
    static final Map<String, byte[]> LEAKY = new HashMap<>();

    // Bounded: LinkedHashMap LRU that evicts beyond a fixed size
    static final Map<String, byte[]> BOUNDED = new LinkedHashMap<>(16, 0.75f, true) {
        @Override
        protected boolean removeEldestEntry(Map.Entry<String, byte[]> eldest) {
            return size() > 100;
        }
    };

    public static void main(String[] args) {
        for (int i = 0; i < 10_000; i++) {
            String requestId = "req-" + i;
            LEAKY.put(requestId, new byte[1024]);
            BOUNDED.put(requestId, new byte[1024]);
        }
        System.out.println("leaky entries:   " + LEAKY.size());
        System.out.println("bounded entries: " + BOUNDED.size());
    }
}`,
          expectedOutput: `leaky entries:   10000
bounded entries: 100`,
          explanation: 'In production, prefer a cache library with size limits and expiry (e.g. Caffeine) over hand-rolled maps.',
        },
        {
          id: 'weak',
          title: 'Weak references are cleared when unreachable',
          runnable: true,
          code: `import java.lang.ref.WeakReference;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        Object strong = new Object();
        WeakReference<Object> weak = new WeakReference<>(strong);
        System.out.println("before: " + (weak.get() != null));

        strong = null;                          // drop the only strong reference
        for (int i = 0; i < 10 && weak.get() != null; i++) {
            System.gc();                        // a hint; fine in a demo, not in real code
            Thread.sleep(50);
        }
        System.out.println("after: " + (weak.get() != null));
    }
}`,
          expectedOutput: `before: true
after: false`,
        },
      ],
      walkthrough: {
        exampleId: 'leak',
        steps: [
          { lines: [4, 5], text: 'A static map is reachable from a GC root for the lifetime of the class, so everything in it stays alive.' },
          { lines: [7, 13], text: 'The bounded map evicts the least recently used entry beyond 100 entries, so its memory stays flat.' },
          { lines: [16, 20], text: 'Request ids are unique, so the leaky map never reuses an entry: 10,000 requests → 10,000 retained arrays.' },
          { lines: [21, 22], text: 'The GC cannot help: the leaky entries are reachable. Only the program\'s design can bound them.' },
        ],
      },
      realWorld: {
        title: 'ThreadLocal leak in a thread pool',
        scenario: `A request filter stored a large user context in a \`ThreadLocal\` and forgot to call \`remove()\`. Tomcat reuses its worker threads, so each of the 200 threads kept the last user's context alive indefinitely — and after a hot redeploy the old web application's class loader stayed reachable through those ThreadLocal values, leaking Metaspace on every redeploy.

The fix was \`try { context.set(...); chain.doFilter(...); } finally { context.remove(); }\`. With Java 25, scoped values offer a structured alternative that cannot leak this way.`,
      },
      commonMistakes: [
        {
          mistake: 'Assuming Java cannot leak memory because it has a GC.',
          why: 'The GC frees unreachable objects; reachable-but-useless objects are leaks.',
          fix: 'Bound caches, unregister listeners, remove ThreadLocals.',
        },
        {
          mistake: 'Reading heap usage graphs without looking at the post-GC floor.',
          why: 'Heap usage naturally saw-tooths; only a rising floor indicates retention.',
          fix: 'Plot heap-after-GC from GC logs or JFR.',
        },
        {
          mistake: 'Switching collectors to fix OutOfMemoryError.',
          why: 'No collector can free reachable memory.',
          fix: 'Find what retains the memory with a heap dump.',
        },
      ],
      checks: [
        {
          id: 'r2-c1',
          kind: 'mcq',
          dimension: 'runtime',
          prompt: 'Two objects reference each other but nothing else references either of them. What happens?',
          options: [
            { id: 'a', text: 'They leak forever because of the cycle' },
            { id: 'b', text: 'They are unreachable from GC roots and can be collected' },
            { id: 'c', text: 'Only one is collected' },
            { id: 'd', text: 'The JVM throws an error' },
          ],
          correctOptionId: 'b',
          explanation: 'Tracing collectors start from roots; unreachable cycles are garbage. (Reference counting would leak them, but HotSpot does not use it.)',
        },
        {
          id: 'r2-c2',
          kind: 'mcq',
          dimension: 'runtime',
          prompt: 'Why are young-generation collections usually cheap?',
          options: [
            { id: 'a', text: 'They run in a separate process' },
            { id: 'b', text: 'Their cost depends on the live objects copied, and most young objects are already dead' },
            { id: 'c', text: 'They never pause the application' },
            { id: 'd', text: 'They only run at night' },
          ],
          correctOptionId: 'b',
          explanation: 'Copying collection touches only survivors; dead objects are reclaimed by resetting the space.',
        },
        {
          id: 'r2-c3',
          kind: 'mcq',
          dimension: 'runtime',
          prompt: 'A latency-sensitive service with a 64 GB heap sees 800 ms G1 pauses. Which change is most appropriate to evaluate?',
          options: [
            { id: 'a', text: 'Call System.gc() every minute' },
            { id: 'b', text: 'Switch to generational ZGC and measure pause times and throughput' },
            { id: 'c', text: 'Switch to the Serial collector' },
            { id: 'd', text: 'Reduce -Xss' },
          ],
          correctOptionId: 'b',
          explanation: 'ZGC compacts concurrently with very short pauses independent of heap size. Always validate with measurements.',
        },
        {
          id: 'r2-c4',
          kind: 'mcq',
          dimension: 'debugging',
          prompt: 'Which tool output best shows *what is keeping* memory alive?',
          options: [
            { id: 'a', text: 'CPU flame graph' },
            { id: 'b', text: 'Dominator tree from a heap dump' },
            { id: 'c', text: 'Thread dump' },
            { id: 'd', text: 'Network latency metrics' },
          ],
          correctOptionId: 'b',
          explanation: 'The dominator tree shows retained sizes: which object, if freed, would release which memory.',
        },
      ],
      challengeIds: [],
      masteryCriteria: [
        'Explain reachability, GC roots and why reachable data cannot be collected.',
        'Choose between G1, ZGC, Parallel and Serial for a scenario.',
        'Walk through a leak investigation with histograms, heap dumps and GC logs.',
      ],
      relatedLessonIds: ['r-memory-areas', 'r-class-loading', 'c-hashmap'],
      revision: [
        { id: 'r1', question: 'What is a memory leak in Java?', answer: 'Objects that are no longer needed but remain reachable from GC roots (e.g. via a static collection), so the GC cannot reclaim them.' },
        { id: 'r2', question: 'Name three GC roots.', answer: 'Local variables in live stack frames, static fields of loaded classes, JNI references (also active monitors and thread objects).' },
        { id: 'r3', question: 'When would you choose ZGC over G1?', answer: 'For large heaps or strict low-latency requirements, since ZGC keeps pauses very short regardless of heap size; validate by measuring.' },
      ],
    },
  ],
};
