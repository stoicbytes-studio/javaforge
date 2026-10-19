import type { CurriculumModule } from '@/types/curriculum';

export const fundamentalsModule: CurriculumModule = {
  id: 'fundamentals',
  order: 1,
  title: 'Java Fundamentals and the Execution Lifecycle',
  shortTitle: 'Fundamentals',
  summary:
    'How a Java program goes from source code to a running process, and the core language: types, operators, control flow, methods and arrays.',
  level: 'core',
  prerequisites: [],
  bossChallengeId: 'boss-grade-report',
  lessons: [
    // -----------------------------------------------------------------------
    {
      id: 'f-first-program',
      moduleId: 'fundamentals',
      title: 'Your first program and the execution lifecycle',
      summary: 'Write, compile and run a Java program, and understand what javac and the JVM each do.',
      estimatedMinutes: 20,
      difficulty: 'beginner',
      prerequisites: [],
      versionNotes: [
        { feature: 'Run a single source file directly: java Main.java', since: 11, note: 'JEP 330' },
        { feature: 'Launch programs made of multiple source files', since: 22, note: 'JEP 458' },
        { feature: 'Instance main methods (void main())', since: 25, note: 'Preview in 21–24; final in 25 (JEP 512)' },
      ],
      objectives: [
        'Describe the source → bytecode → JVM pipeline.',
        'Write a class with a valid main method and run it.',
        'Predict how string concatenation is evaluated left to right.',
        'Recognise a class-file version mismatch.',
      ],
      plainEnglish: `Java code is not run directly by your computer's processor. You write **source code** in a \`.java\` file, the compiler (\`javac\`) translates it into **bytecode** stored in \`.class\` files, and the **Java Virtual Machine** (JVM) runs that bytecode.

Because every operating system has its own JVM, the same \`.class\` file runs on Windows, Linux and macOS. That is what "write once, run anywhere" means.

Every program needs an entry point: a method called \`main\` that the launcher calls first.`,
      technical: `\`javac Main.java\` parses and type-checks the source and emits \`Main.class\`, which contains platform-neutral bytecode, a constant pool and metadata. \`java Main\` starts a JVM process, which:

1. Loads \`Main.class\` through the application class loader.
2. Links it (verifies the bytecode, prepares static fields, resolves symbolic references lazily).
3. Initialises the class (runs static initialisers).
4. Invokes \`public static void main(String[])\` on the **main thread**.

The JVM first interprets bytecode, then the JIT compiler turns frequently executed methods into native machine code. The process exits when all non-daemon threads finish or \`System.exit\` is called.

Since Java 11 the launcher can also run a single source file directly (\`java Main.java\`): it compiles the file in memory and runs it without writing a \`.class\` file — convenient for scripts and experiments, but real projects still use a build tool such as Maven or Gradle.`,
      whyItExists: `Compiling to bytecode instead of native code gives Java portability (one artifact for every platform), safety (the JVM verifies bytecode before running it) and performance that improves at runtime (the JIT optimises using real execution profiles).`,
      whenToUse: [
        'Use a main method as the entry point of command-line tools, services and exercises.',
        'Use `java Main.java` for quick single-file experiments (Java 11+).',
        'Use a build tool (Maven/Gradle) for anything with dependencies, tests or multiple files.',
      ],
      whenNotToUse: [
        'Do not ship single-file source launching as a production deployment model.',
        'Do not rely on the default package (no package statement) beyond small exercises.',
      ],
      examples: [
        {
          id: 'hello',
          title: 'Main.java',
          runnable: true,
          code: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, JavaForge!");
        System.out.println("Arguments received: " + args.length);
    }
}`,
          expectedOutput: `Hello, JavaForge!
Arguments received: 0`,
          explanation: '`args` holds command-line arguments. Running `java Main` with no arguments gives an empty array, not null.',
        },
        {
          id: 'concat-order',
          title: 'Evaluation order of +',
          runnable: true,
          code: `public class Main {
    public static void main(String[] args) {
        System.out.print("Compile");
        System.out.print(" -> ");
        System.out.println("Run");
        System.out.println(1 + 2 + "3" + 4 + 5);
    }
}`,
          expectedOutput: `Compile -> Run
3345`,
          explanation:
            '`+` is evaluated left to right. `1 + 2` is integer addition (3); once a String is involved every following `+` is concatenation: "3" + "3" → "33", then "334", then "3345".',
        },
      ],
      walkthrough: {
        exampleId: 'hello',
        steps: [
          { lines: [1, 1], text: 'Declares a public class. A public class must live in a file with the same name: Main.java.' },
          { lines: [2, 2], text: 'The launcher looks for exactly this signature: public, static (no object needed), void, one String[] parameter.' },
          { lines: [3, 3], text: '`System.out` is a static PrintStream connected to standard output; `println` writes text plus a line separator.' },
          { lines: [4, 4], text: '`args.length` is 0 because no command-line arguments were passed. The int is converted to text by concatenation.' },
          { lines: [5, 6], text: 'When main returns and no other non-daemon threads are running, the JVM exits with status 0.' },
        ],
      },
      realWorld: {
        title: 'The "works on my machine" deployment failure',
        scenario: `A team compiles a service with JDK 21 on developer laptops, but the production container still runs Java 17. On startup the service crashes with \`java.lang.UnsupportedClassVersionError: Main has been compiled by a more recent version of the Java Runtime (class file version 65.0), this version of the Java Runtime only recognizes class file versions up to 61.0\`.

Every class file records the bytecode version it targets (52 = Java 8, 55 = 11, 61 = 17, 65 = 21). A JVM refuses newer versions. The fix is to compile for the oldest runtime you deploy to — \`javac --release 17\` or \`<maven.compiler.release>17</maven.compiler.release>\` — or to upgrade the runtime. Pinning the JDK version in the build and the container image prevents the mismatch.`,
      },
      commonMistakes: [
        {
          mistake: 'Naming the file differently from its public class.',
          why: 'A public top-level class must be declared in a file with the same name, so `public class Main` in `App.java` does not compile.',
          fix: 'Rename the file or the class so they match exactly, including case.',
        },
        {
          mistake: 'Running `java Main.class`.',
          why: 'The launcher expects a class name (or a source file), not a class file path, and reports that it could not find or load the main class.',
          fix: 'Run `java Main` from the directory containing Main.class (or set the classpath with `-cp`).',
        },
        {
          mistake: 'Writing `public void main(String[] args)` on Java 21 or older.',
          why: 'Without `static`, older launchers cannot call main without an instance. Instance main methods were a preview in 21–24 and became final only in Java 25.',
          fix: 'Use `public static void main(String[] args)` unless you target Java 25+.',
        },
      ],
      checks: [
        {
          id: 'f1-c1',
          kind: 'mcq',
          dimension: 'runtime',
          prompt: 'What does `javac Main.java` produce?',
          options: [
            { id: 'a', text: 'A native executable for the current operating system' },
            { id: 'b', text: 'Main.class containing platform-independent bytecode' },
            { id: 'c', text: 'A running JVM process' },
            { id: 'd', text: 'Main.jar with all dependencies' },
          ],
          correctOptionId: 'b',
          explanation: 'javac compiles source into bytecode in .class files. The JVM (`java`) runs it; packaging into a jar is a separate step.',
          hints: ['javac is a compiler, not a launcher.', 'Bytecode is what makes the output portable.'],
        },
        {
          id: 'f1-c2',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this program print?',
          code: `public class Main {
    public static void main(String[] args) {
        System.out.println("Sum: " + 1 + 2);
        System.out.println(1 + 2 + " is the sum");
    }
}`,
          options: [
            { id: 'a', text: 'Sum: 3\n3 is the sum' },
            { id: 'b', text: 'Sum: 12\n3 is the sum' },
            { id: 'c', text: 'Sum: 12\n12 is the sum' },
            { id: 'd', text: 'Sum: 3\n12 is the sum' },
          ],
          correctOptionId: 'b',
          explanation:
            'Evaluation is left to right. "Sum: " + 1 is already a String, so + 2 appends "2". In the second line 1 + 2 is integer addition before any String appears.',
          hints: ['Evaluate each + from left to right.', 'Ask at each step: is either operand a String yet?'],
        },
        {
          id: 'f1-c3',
          kind: 'multi-select',
          dimension: 'conceptual',
          prompt: 'On Java 21 without preview features, which declarations can the launcher use as the program entry point? Select all that apply.',
          options: [
            { id: 'a', text: 'public static void main(String[] args)' },
            { id: 'b', text: 'public static void main(String... args)' },
            { id: 'c', text: 'static public void main(String[] input)' },
            { id: 'd', text: 'public void main(String[] args)' },
            { id: 'e', text: 'public static int main(String[] args)' },
          ],
          correctOptionIds: ['a', 'b', 'c'],
          explanation:
            'Modifier order and parameter name do not matter, and varargs is the same as an array. The method must be static and return void on Java 21; instance main methods are final only from Java 25.',
        },
        {
          id: 'f1-c4',
          kind: 'mcq',
          dimension: 'runtime',
          prompt: 'A service compiled with JDK 21 fails on a Java 17 server with UnsupportedClassVersionError. What is the best fix?',
          options: [
            { id: 'a', text: 'Catch the error in main and continue' },
            { id: 'b', text: 'Compile with --release 17 (or upgrade the server runtime to 21)' },
            { id: 'c', text: 'Rename the class files' },
            { id: 'd', text: 'Increase the heap size' },
          ],
          correctOptionId: 'b',
          explanation:
            'The class file version is newer than the runtime supports. Target the older release at compile time or upgrade the runtime; nothing at runtime can load newer bytecode.',
        },
        {
          id: 'f1-c5',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'What happens when you run `java Main.java` on Java 11 or later?',
          options: [
            { id: 'a', text: 'It fails: java only accepts class names' },
            { id: 'b', text: 'It compiles the file in memory and runs it, without writing Main.class' },
            { id: 'c', text: 'It writes Main.class next to the source and then runs it' },
            { id: 'd', text: 'It interprets the Java source line by line without compiling' },
          ],
          correctOptionId: 'b',
          explanation: 'Source-file mode (JEP 330) compiles in memory, then runs the first top-level class with a main method.',
        },
      ],
      challengeIds: ['ch-greeting'],
      masteryCriteria: [
        'Explain what javac and the JVM each do, in your own words.',
        'Predict the output of mixed numeric/String concatenation.',
        'Diagnose UnsupportedClassVersionError and name two fixes.',
      ],
      relatedLessonIds: ['p-jdk-jre-jvm', 'p-bytecode'],
      revision: [
        {
          id: 'r1',
          question: 'Describe the three steps between writing Main.java and seeing its output.',
          answer: 'javac compiles source to bytecode (Main.class); the java launcher starts a JVM that loads, links and initialises the class; the JVM invokes main on the main thread (interpreting, then JIT-compiling hot code).',
        },
        {
          id: 'r2',
          question: 'What does 1 + 2 + "3" + 4 + 5 evaluate to, and why?',
          answer: '"3345". + is left-associative: 1 + 2 = 3 (int), then every + after a String is concatenation.',
        },
        {
          id: 'r3',
          question: 'What causes UnsupportedClassVersionError?',
          answer: 'Running bytecode compiled for a newer Java release on an older JVM. Fix with javac --release <older> or by upgrading the runtime.',
        },
      ],
    },

    // -----------------------------------------------------------------------
    {
      id: 'f-types-operators',
      moduleId: 'fundamentals',
      title: 'Variables, primitive types and operators',
      summary: 'The eight primitive types, integer arithmetic, overflow, floating point and casting rules.',
      estimatedMinutes: 30,
      difficulty: 'beginner',
      prerequisites: ['f-first-program'],
      versionNotes: [{ feature: 'Local variable type inference with var', since: 10 }],
      objectives: [
        'Choose the right primitive type for a value.',
        'Predict integer division, remainder and overflow.',
        'Explain why 0.1 + 0.2 is not exactly 0.3.',
        'Apply widening, narrowing and compound-assignment casting rules.',
      ],
      plainEnglish: `A **variable** is a named box that holds a value. In Java every variable has a fixed **type** decided at compile time, and the type decides what values fit and what operations are allowed.

Java has eight **primitive** types that hold raw values directly: \`byte\`, \`short\`, \`int\`, \`long\` (whole numbers of increasing size), \`float\`, \`double\` (decimals), \`char\` (a single UTF-16 code unit) and \`boolean\` (true/false). Everything else — \`String\`, arrays, your own classes — is a **reference** type.

Whole-number arithmetic throws away remainders (\`7 / 2\` is \`3\`) and silently wraps around when a value gets too big.`,
      technical: `### Sizes and defaults
- \`byte\` 8-bit, \`short\` 16-bit, \`int\` 32-bit, \`long\` 64-bit — all signed two's complement.
- \`float\` 32-bit and \`double\` 64-bit IEEE 754 binary floating point.
- \`char\` is an unsigned 16-bit UTF-16 code unit; \`boolean\` is true/false (its storage size is JVM-specific).
- Integer literals are \`int\` unless suffixed with \`L\`; decimal literals are \`double\` unless suffixed with \`f\`.

### Arithmetic rules
- Binary numeric promotion: operands smaller than \`int\` are promoted to \`int\` before arithmetic, so \`byte + byte\` is an \`int\`.
- Integer \`/\` truncates toward zero and \`%\` takes the sign of the dividend. Integer division by zero throws \`ArithmeticException\`; floating-point division by zero gives \`Infinity\` or \`NaN\`.
- Overflow wraps silently. Use \`Math.addExact\`/\`multiplyExact\` when overflow must be detected.
- The type of an expression is decided **before** it is assigned: \`long ms = days * 86_400_000;\` multiplies two \`int\`s and can overflow before widening to \`long\`.

### Conversions
- Widening (\`int\` → \`long\` → \`float\` → \`double\`) is implicit; \`long\` → \`float\`/\`double\` may lose precision.
- Narrowing requires a cast and keeps only the low-order bits for integers; casting \`double\` → \`int\` truncates toward zero.
- Compound assignment (\`+=\`, \`*=\`) includes an implicit cast: \`b += 1\` compiles for a \`byte\`, \`b = b + 1\` does not.`,
      whyItExists: `Primitives exist for performance: they are stored directly in local variables, fields and arrays without object overhead. Fixed-size types also make arithmetic behave identically on every platform, which is part of Java's portability guarantee.`,
      whenToUse: [
        'Use `int` for counts and indexes, `long` for timestamps, IDs and anything that can exceed ~2.1 billion.',
        'Use `double` for measurements and scientific values where tiny rounding errors are acceptable.',
        'Use `BigDecimal` (or `long` minor units such as cents) for money.',
        'Use `var` for local variables when the type is obvious from the right-hand side.',
      ],
      whenNotToUse: [
        'Do not use `float`/`double` for currency or exact decimal values.',
        'Do not use `byte`/`short` to "save memory" in ordinary local variables; they are promoted to int anyway.',
        'Do not use `var` when it hides an important type (e.g. `var result = service.process();`).',
      ],
      examples: [
        {
          id: 'int-arith',
          title: 'Integer arithmetic, overflow and char',
          runnable: true,
          code: `public class Main {
    public static void main(String[] args) {
        int a = 7, b = 2;
        System.out.println(a / b);
        System.out.println(a % b);
        System.out.println(a / 2.0);
        System.out.println((double) a / b);

        int max = Integer.MAX_VALUE;
        System.out.println(max + 1);
        long big = max + 1L;
        System.out.println(big);

        char c = 'A';
        System.out.println(c + 1);
        System.out.println((char) (c + 1));
    }
}`,
          expectedOutput: `3
1
3.5
3.5
-2147483648
2147483648
66
B`,
        },
        {
          id: 'float-cast',
          title: 'Floating point and casting',
          runnable: true,
          code: `public class Main {
    public static void main(String[] args) {
        System.out.println(0.1 + 0.2);
        System.out.println((int) 3.99);
        System.out.println((int) -3.99);
        System.out.println(Math.round(2.5));
        System.out.println(Math.round(-2.5));

        byte small = (byte) 200;
        System.out.println(small);

        short s = 10;
        s += 5;          // compiles: compound assignment casts back to short
        System.out.println(s);

        System.out.println(10 / 3 * 3);
        System.out.println(1 / 0.0);
    }
}`,
          expectedOutput: `0.30000000000000004
3
-3
3
-2
-56
15
9
Infinity`,
        },
        {
          id: 'overflow-bug',
          title: 'A real overflow bug',
          runnable: true,
          code: `public class Main {
    public static void main(String[] args) {
        int days = 30;
        long wrong = days * 24 * 60 * 60 * 1000;   // int arithmetic, then widened
        long right = days * 24L * 60 * 60 * 1000;  // long arithmetic from the start
        System.out.println(wrong);
        System.out.println(right);
    }
}`,
          expectedOutput: `-1702967296
2592000000`,
          explanation: 'The right-hand side is computed entirely in int and overflows before being widened. Making one operand long forces long arithmetic.',
        },
      ],
      walkthrough: {
        exampleId: 'overflow-bug',
        steps: [
          { lines: [3, 3], text: '`days` is an int holding 30.' },
          { lines: [4, 4], text: 'All operands are int, so 30 × 24 × 60 × 60 × 1000 = 2,592,000,000 is computed as int. That exceeds Integer.MAX_VALUE (2,147,483,647) and wraps to −1,702,967,296. Only then is it widened to long.' },
          { lines: [5, 5], text: '`24L` is a long literal. Binary numeric promotion makes every subsequent multiplication long, so no overflow occurs.' },
          { lines: [6, 7], text: 'The wrong value is negative — a classic symptom of int overflow in time calculations.' },
        ],
      },
      realWorld: {
        title: 'Cache entries that never expire',
        scenario: `A cache computed its time-to-live as \`long ttl = days * 24 * 60 * 60 * 1000\` from a configuration value. With 7 days everything worked; when someone configured 30 days, the int multiplication overflowed to a negative number, every entry looked already expired, and the database was hammered by cache misses.

The fix was a single \`L\` — and, better, using \`java.time.Duration.ofDays(days).toMillis()\`, which does the arithmetic in long and throws on overflow.`,
      },
      commonMistakes: [
        {
          mistake: 'Expecting `5 / 2` to be 2.5.',
          why: 'Both operands are int, so integer division truncates.',
          fix: 'Make one operand a double: `5 / 2.0` or `(double) a / b`. Note `(double) (a / b)` casts too late.',
        },
        {
          mistake: 'Using double for money.',
          why: 'Binary floating point cannot represent most decimal fractions exactly, so totals drift (0.1 + 0.2 = 0.30000000000000004).',
          fix: 'Use BigDecimal with an explicit RoundingMode, or store integer minor units (cents) in a long.',
        },
        {
          mistake: 'Assigning an overflowing int expression to a long and assuming it is safe.',
          why: 'The expression type is decided by its operands, not by the variable it is assigned to.',
          fix: 'Make the first operand long (24L), or use Math.multiplyExact to fail loudly.',
          code: 'long ms = Math.multiplyExact((long) days, 86_400_000L);',
        },
      ],
      checks: [
        {
          id: 'f2-c1',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this print?',
          code: `public class Main {
    public static void main(String[] args) {
        int x = 5;
        x = x++ + ++x;
        System.out.println(x);
    }
}`,
          options: [
            { id: 'a', text: '11' },
            { id: 'b', text: '12' },
            { id: 'c', text: '13' },
            { id: 'd', text: '10' },
          ],
          correctOptionId: 'b',
          explanation:
            'Operands are evaluated left to right. `x++` yields 5 and sets x to 6; `++x` sets x to 7 and yields 7. 5 + 7 = 12 is then assigned to x. (Code like this is a readability smell — never write it in production.)',
          hints: ['Post-increment returns the old value; pre-increment returns the new value.', 'Track x after each operand.'],
        },
        {
          id: 'f2-c2',
          kind: 'predict-output',
          dimension: 'conceptual',
          prompt: 'What happens when you compile this?',
          code: `public class Main {
    public static void main(String[] args) {
        byte b = 10;
        b = b + 1;
        System.out.println(b);
    }
}`,
          options: [
            { id: 'a', text: '11' },
            { id: 'b', text: 'Compile error: possible lossy conversion from int to byte' },
            { id: 'c', text: '10' },
            { id: 'd', text: 'Runtime ArithmeticException' },
          ],
          correctOptionId: 'b',
          expectCompileError: true,
          explanation:
            '`b + 1` is promoted to int, and assigning an int to a byte requires an explicit cast. `b += 1` would compile because compound assignment includes the cast.',
        },
        {
          id: 'f2-c3',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'Which statement about `float f = 3.14;` is correct?',
          options: [
            { id: 'a', text: 'It compiles; 3.14 is a float literal' },
            { id: 'b', text: 'It does not compile; 3.14 is a double literal and needs 3.14f or a cast' },
            { id: 'c', text: 'It compiles but loses precision at runtime with a warning' },
            { id: 'd', text: 'It throws a NumberFormatException' },
          ],
          correctOptionId: 'b',
          explanation: 'Decimal literals are double by default. Narrowing double → float requires the f suffix or an explicit cast.',
        },
        {
          id: 'f2-c4',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this print?',
          code: `public class Main {
    public static void main(String[] args) {
        System.out.println(-7 / 2);
        System.out.println(-7 % 2);
        System.out.println(7 % -2);
    }
}`,
          options: [
            { id: 'a', text: '-4\n1\n-1' },
            { id: 'b', text: '-3\n-1\n1' },
            { id: 'c', text: '-3\n1\n-1' },
            { id: 'd', text: '-4\n-1\n1' },
          ],
          correctOptionId: 'b',
          explanation: 'Integer division truncates toward zero (−3.5 → −3). The remainder takes the sign of the dividend: −7 % 2 = −1 and 7 % −2 = 1.',
          hints: ['Java does not round down (floor); it truncates toward zero.'],
        },
        {
          id: 'f2-c5',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'An e-commerce team stores prices as double and sees invoices off by a cent. What should they use instead?',
          options: [
            { id: 'a', text: 'float, because it is smaller' },
            { id: 'b', text: 'BigDecimal with an explicit rounding mode, or long cents' },
            { id: 'c', text: 'double with Math.round after every operation' },
            { id: 'd', text: 'String, parsed when needed' },
          ],
          correctOptionId: 'b',
          explanation: 'BigDecimal represents decimal values exactly; long minor units are also exact. Rounding doubles repeatedly only hides the error.',
        },
      ],
      challengeIds: ['ch-ttl-millis'],
      masteryCriteria: [
        'Predict integer division, remainder and overflow results without running code.',
        'Explain why an int expression can overflow even when assigned to a long.',
        'Choose BigDecimal or minor units for money and justify it.',
      ],
      relatedLessonIds: ['f-type-conversion', 't-wrappers', 'f-control-flow'],
      revision: [
        { id: 'r1', question: 'Why does `long ms = days * 24 * 60 * 60 * 1000;` overflow for 30 days?', answer: 'All operands are int, so the multiplication happens in 32-bit arithmetic and wraps before the result is widened to long. Use 24L (or Duration) to force long arithmetic.' },
        { id: 'r2', question: 'What do -7 / 2 and -7 % 2 evaluate to?', answer: '-3 and -1: integer division truncates toward zero and the remainder has the sign of the dividend.' },
        { id: 'r3', question: 'Why does `b += 1` compile for a byte but `b = b + 1` does not?', answer: 'b + 1 is promoted to int and needs a cast to fit in a byte; compound assignment includes an implicit narrowing cast.' },
      ],
    },

    // -----------------------------------------------------------------------
    {
      id: 'f-type-conversion',
      moduleId: 'fundamentals',
      title: 'Type conversion and casting',
      summary: 'Widening and narrowing conversions, hidden promotions in expressions, casts that overflow or truncate, char ↔ int, and turning Strings into numbers and back.',
      estimatedMinutes: 30,
      difficulty: 'beginner',
      prerequisites: ['f-types-operators'],
      objectives: [
        'Tell a widening conversion (automatic, safe range) from a narrowing one (needs a cast, may lose data).',
        'Predict the type of an expression after numeric promotion, including byte + byte and int / int.',
        'Predict what a cast does to out-of-range and fractional values.',
        'Convert between char and int, and between String and numbers, with the right API.',
        'Spot the hidden cast inside compound assignment (+=, *=).',
      ],
      plainEnglish: `Every value in Java has a type, and sometimes you need it as a different type: an \`int\` count used in a \`double\` average, a \`double\` price shown as whole euros, the text \`"42"\` typed by a user turned into the number 42.

Java splits these moves into two groups:

- **Widening** — moving to a "bigger" type (\`int\` → \`long\` → \`double\`). Every value fits, so Java does it **automatically**.
- **Narrowing** — moving to a "smaller" type (\`double\` → \`int\`, \`int\` → \`byte\`). The value might not fit, so Java makes you write a **cast** such as \`(int) price\` to show you accept the risk. A cast never rounds: it chops off the fraction, and for whole numbers it keeps only the bits that fit.

Text is not a number. \`"42" + 1\` is \`"421"\`; you must **parse** the text first with \`Integer.parseInt("42")\`. Going the other way, \`String.valueOf(42)\` turns a number into text.`,
      technical: `JLS chapter 5 defines a small set of **conversions** and the **contexts** where each is allowed (assignment, method invocation, casting, string concatenation and numeric promotion).

- **Widening primitive** (JLS 5.1.2): \`byte → short → int → long → float → double\`, and \`char → int\`. Never throws, but \`int\`/\`long\` → \`float\` and \`long\` → \`double\` can lose low-order digits.
- **Narrowing primitive** (JLS 5.1.3): needs a cast, except that an \`int\` **constant** that fits may be assigned to \`byte\`, \`short\` or \`char\` (\`byte b = 100;\`). Integer narrowing keeps the low-order bits, so the sign can flip. Floating → integer rounds toward zero; \`NaN\` becomes 0 and out-of-range values clamp to the target's MIN/MAX.
- **Numeric promotion** (JLS 5.6): before arithmetic, \`byte\`, \`short\` and \`char\` operands become \`int\`; if either operand is \`long\`, \`float\` or \`double\`, the other is widened to match. So \`byte + byte\` is an \`int\`, and \`int / int\` is integer division.
- **Compound assignment** (JLS 15.26.2): \`s += x\` means \`s = (T) (s + x)\` — a narrowing cast you never wrote.
- **Boxing/unboxing** (JLS 5.1.7–5.1.8) convert between \`int\` and \`Integer\`; unboxing \`null\` throws \`NullPointerException\`.
- **String conversion** (JLS 5.1.11): when one operand of \`+\` is a String, the other is converted with \`String.valueOf\`. Parsing the other way is a library call, not a conversion: \`Integer.parseInt\` returns \`int\`, \`Integer.valueOf\` returns \`Integer\`, and both throw \`NumberFormatException\` for bad text.`,
      whyItExists: `Java is statically typed so that mistakes surface at compile time. Allowing only safe conversions implicitly — and demanding an explicit cast for lossy ones — means data loss is always visible in the source code, while everyday arithmetic still reads naturally.`,
      whenToUse: [
        'Let widening happen implicitly, e.g. passing an int to a method that takes a long or double.',
        'Cast explicitly when you really want truncation, e.g. `(int) seconds` to drop the fraction.',
        'Use `Math.round`, `Math.floor` or `Math.ceil` when you mean rounding rather than truncation.',
        'Use `Math.toIntExact(longValue)` when a narrowing must fail loudly instead of wrapping.',
        'Use `Integer.parseInt` / `Double.parseDouble` for user input and configuration text.',
      ],
      whenNotToUse: [
        'Do not cast to silence a compiler error without checking the value fits — the cast hides the bug instead of fixing it.',
        'Do not cast a double to int when you mean "round" — `(int) 2.99` is 2.',
        'Do not use `(int) someChar - 48` style tricks for digits when `Character.getNumericValue` or `c - \'0\'` with validation states the intent.',
        'Do not parse without handling `NumberFormatException` when the text comes from users or files.',
      ],
      examples: [
        {
          id: 'conv-widen-narrow',
          title: 'Widening is automatic, narrowing needs a cast',
          runnable: true,
          code: `public class Main {
    public static void main(String[] args) {
        int count = 100;
        long total = count;          // widening: automatic
        double average = total;      // widening: automatic
        System.out.println(total + " " + average);

        int big = 1_234_567_890;
        float approx = big;          // widening, but float keeps ~7 digits
        System.out.println((int) approx);

        double price = 9.99;
        int whole = (int) price;     // narrowing: cast required, truncates
        System.out.println(whole);

        int tooBig = 300;
        byte b = (byte) tooBig;      // keeps only the low 8 bits
        System.out.println(b);

        long huge = 3_000_000_000L;
        System.out.println((int) huge);
        System.out.println((int) 1e20);
        System.out.println((int) Double.NaN);
    }
}`,
          expectedOutput: `100 100.0
1234567936
9
44
-1294967296
2147483647
0`,
          explanation:
            'Widening never needs a cast, yet int → float silently loses the last digits. Integer narrowing wraps (300 → 44, 3 billion → negative); double → int truncates, clamps huge values to Integer.MAX_VALUE and turns NaN into 0.',
        },
        {
          id: 'conv-promotion-parsing',
          title: 'Hidden promotions, char arithmetic and parsing text',
          runnable: true,
          code: `public class Main {
    public static void main(String[] args) {
        byte a = 10, b = 20;
        int sum = a + b;             // byte + byte is an int
        System.out.println(sum);

        char c = 'A';
        System.out.println(c + 2);
        System.out.println((char) (c + 2));
        System.out.println((int) 'a');
        System.out.println('7' - '0');

        System.out.println(7 / 2);
        System.out.println(7 / 2.0);
        System.out.println(1 / 3 * 3.0);
        System.out.println(0.1f == 0.1);

        String text = "42";
        int n = Integer.parseInt(text);
        Integer boxed = Integer.valueOf(text);
        System.out.println(n + 1);
        System.out.println(text + 1);
        System.out.println(String.valueOf(n) + boxed);
        System.out.println(Double.parseDouble("2.5") * 2);

        short s = 1;
        s += 70000;                  // hidden cast back to short
        System.out.println(s);
    }
}`,
          expectedOutput: `30
67
C
97
7
3
3.5
0.0
false
43
421
4242
5.0
4465`,
          explanation:
            '`1 / 3 * 3.0` is 0.0 because `1 / 3` is int division (0) before the double appears. `0.1f` and `0.1` are different binary approximations, so widening the float does not make them equal. `s += 70000` compiles but wraps: (short) 70001 is 4465.',
        },
        {
          id: 'conv-safe',
          title: 'Converting safely: parse with a fallback, narrow with a check',
          runnable: true,
          code: `public class Main {
    static int parseOrDefault(String s, int fallback) {
        try {
            return Integer.parseInt(s.trim());
        } catch (NumberFormatException e) {
            return fallback;
        }
    }

    public static void main(String[] args) {
        System.out.println(parseOrDefault(" 17 ", -1));
        System.out.println(parseOrDefault("17.5", -1));
        System.out.println(parseOrDefault("abc", -1));

        System.out.println(Math.round(2.6) + " " + (int) 2.6);
        System.out.println(Math.toIntExact(42L));
        try {
            Math.toIntExact(3_000_000_000L);
        } catch (ArithmeticException e) {
            System.out.println("refused: " + e.getMessage());
        }
    }
}`,
          expectedOutput: `17
-1
-1
3 2
42
refused: integer overflow`,
          explanation:
            '`parseInt` rejects surrounding spaces and decimal points, so trim first and handle NumberFormatException. `Math.round` rounds; a cast truncates. `Math.toIntExact` throws instead of silently wrapping.',
        },
      ],
      walkthrough: {
        exampleId: 'conv-widen-narrow',
        steps: [
          { lines: [3, 6], text: 'int → long → double are widening conversions: every int value fits, so no cast is written. Printing a double always shows a decimal point: 100.0.' },
          { lines: [8, 10], text: 'int → float is also widening, but a float has only 24 bits of precision. 1,234,567,890 becomes the nearest float, 1,234,567,936.' },
          { lines: [12, 14], text: 'double → int is narrowing, so the cast is mandatory. It truncates toward zero: 9.99 becomes 9, not 10.' },
          { lines: [16, 18], text: '300 needs 9 bits. (byte) keeps the low 8 bits, which are 44 (300 − 256).' },
          { lines: [20, 21], text: 'long → int keeps the low 32 bits: 3,000,000,000 − 4,294,967,296 = −1,294,967,296. The sign flipped without any error.' },
          { lines: [22, 23], text: 'Floating → int is different: too-large values clamp to Integer.MAX_VALUE and NaN becomes 0.' },
        ],
      },
      realWorld: {
        title: 'A percentage that was always zero',
        scenario: `A dashboard showed "0% complete" for every upload until the very end, when it jumped to 100%. The code was \`int percent = done / total * 100;\` with \`done\` and \`total\` both ints: \`done / total\` is integer division, which is 0 until done equals total.

Reordering to \`done * 100 / total\` fixed the display — until uploads above 21 MB made \`done * 100\` overflow int. The final fix was \`(int) (done * 100L / total)\`: widen to long before multiplying, divide, then narrow deliberately once the value is known to fit.`,
      },
      commonMistakes: [
        {
          mistake: 'Casting too late: `(double) (a / b)`.',
          why: 'The division already happened in int arithmetic; the cast only widens the truncated result.',
          fix: 'Cast an operand before dividing: `(double) a / b`.',
          code: 'double ratio = (double) done / total;  // not (double) (done / total)',
        },
        {
          mistake: 'Expecting `(int) 2.7` to be 3.',
          why: 'Casting a floating-point value to an integer type truncates toward zero.',
          fix: 'Use `Math.round` (returns long for double) or `Math.floor` / `Math.ceil` for the rounding you mean.',
        },
        {
          mistake: 'Writing `"Total: " + a + b` and getting "Total: 12" instead of 3.',
          why: 'Once the left operand is a String, every following + is concatenation, converting each number to text.',
          fix: 'Parenthesise the arithmetic: `"Total: " + (a + b)`.',
        },
        {
          mistake: 'Calling `Integer.parseInt("3.5")` or `Integer.parseInt(" 7")`.',
          why: 'parseInt accepts only an optional sign and digits; decimals and spaces throw NumberFormatException.',
          fix: 'Trim input, use Double.parseDouble for decimals, and catch NumberFormatException for user input.',
        },
        {
          mistake: 'Assuming `+=` is exactly the same as `x = x + y`.',
          why: 'Compound assignment casts the result back to the variable type, so `byte b += 200;` compiles and wraps silently.',
          fix: 'Use a wider variable type when values can grow, or check ranges before narrowing.',
        },
      ],
      checks: [
        {
          id: 'f6-c1',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this print?',
          code: `public class Main {
    public static void main(String[] args) {
        int total = 7;
        double half = total / 2;
        System.out.println(half);
    }
}`,
          options: [
            { id: 'a', text: '3.5' },
            { id: 'b', text: '3.0' },
            { id: 'c', text: '3' },
            { id: 'd', text: '4.0' },
          ],
          correctOptionId: 'b',
          explanation:
            '`total / 2` is int / int, so it is integer division: 3. Only then is the int 3 widened to double for the assignment, giving 3.0. Write `total / 2.0` to get 3.5.',
          hints: ['Work out the type of the right-hand side before looking at the variable.', 'What is 7 / 2 in integer arithmetic?'],
        },
        {
          id: 'f6-c2',
          kind: 'predict-output',
          dimension: 'conceptual',
          prompt: 'What happens when you compile this?',
          code: `public class Main {
    public static void main(String[] args) {
        long total = 10;
        int count = total;
        System.out.println(count);
    }
}`,
          options: [
            { id: 'a', text: '10' },
            { id: 'b', text: 'Compile error: possible lossy conversion from long to int' },
            { id: 'c', text: 'Runtime ArithmeticException' },
            { id: 'd', text: '10L' },
          ],
          correctOptionId: 'b',
          expectCompileError: true,
          explanation:
            'long → int is a narrowing conversion. The compiler does not track that `total` happens to hold 10; it only sees the types, so an explicit `(int)` cast (or `Math.toIntExact`) is required.',
        },
        {
          id: 'f6-c3',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this print?',
          code: `public class Main {
    public static void main(String[] args) {
        System.out.println((byte) 130);
        System.out.println((int) -2.7);
        System.out.println((char) ('a' + 1));
    }
}`,
          options: [
            { id: 'a', text: '-126\n-2\nb' },
            { id: 'b', text: '127\n-3\nb' },
            { id: 'c', text: '-126\n-3\n98' },
            { id: 'd', text: '130\n-2\nb' },
          ],
          correctOptionId: 'a',
          explanation:
            '130 does not fit in a byte (max 127); keeping the low 8 bits gives 130 − 256 = −126. Casting −2.7 truncates toward zero: −2. `\'a\' + 1` is the int 98, and casting back to char gives \'b\'.',
          hints: ['A byte holds −128 to 127.', 'Casts truncate toward zero; they do not round down.'],
        },
        {
          id: 'f6-c4',
          kind: 'multi-select',
          dimension: 'conceptual',
          prompt: 'Which declarations compile WITHOUT a cast? Select all that apply.',
          options: [
            { id: 'a', text: 'long l = 42;' },
            { id: 'b', text: 'float f = 1.5;' },
            { id: 'c', text: 'byte b = 100;' },
            { id: 'd', text: 'int i = 3.0;' },
            { id: 'e', text: 'double d = \'A\';' },
            { id: 'f', text: 'int i = 5L;' },
          ],
          correctOptionIds: ['a', 'c', 'e'],
          explanation:
            'int → long and char → double are widening. `byte b = 100;` is allowed because 100 is a constant that fits in a byte. 1.5 is a double literal (needs 1.5f), and 3.0 and 5L would be narrowing to int.',
        },
        {
          id: 'f6-c5',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this print?',
          code: `public class Main {
    public static void main(String[] args) {
        String s = "5";
        System.out.println(s + 2 + 3);
        System.out.println(Integer.parseInt(s) + 2 + 3);
    }
}`,
          options: [
            { id: 'a', text: '10\n10' },
            { id: 'b', text: '523\n10' },
            { id: 'c', text: '55\n10' },
            { id: 'd', text: '523\n523' },
          ],
          correctOptionId: 'b',
          explanation:
            'In the first line the left operand is a String, so 2 and 3 are converted to text and appended. In the second line parseInt produces the int 5, so + is ordinary addition.',
        },
        {
          id: 'f6-c6',
          kind: 'mcq',
          dimension: 'runtime',
          prompt: 'A form field contains "12.50" and the code calls `Integer.parseInt(field)`. What happens?',
          options: [
            { id: 'a', text: 'It returns 12' },
            { id: 'b', text: 'It returns 13' },
            { id: 'c', text: 'It throws NumberFormatException' },
            { id: 'd', text: 'It does not compile' },
          ],
          correctOptionId: 'c',
          explanation:
            'parseInt accepts only an optional sign followed by digits. A decimal point is invalid input, reported at runtime with NumberFormatException. Use Double.parseDouble or new BigDecimal(field) for decimals.',
        },
        {
          id: 'f6-c7',
          kind: 'mcq',
          dimension: 'interview',
          prompt: 'Which conversions does the compiler apply for `Object o = 42;`?',
          options: [
            { id: 'a', text: 'Widening primitive conversion from int to Object' },
            { id: 'b', text: 'Boxing int to Integer, then widening reference conversion Integer to Object' },
            { id: 'c', text: 'String conversion of 42' },
            { id: 'd', text: 'None — it does not compile' },
          ],
          correctOptionId: 'b',
          explanation:
            'A primitive cannot become a reference by widening. Assignment context allows boxing (int → Integer) followed by a widening reference conversion (Integer → Object, a supertype).',
        },
      ],
      challengeIds: [],
      masteryCriteria: [
        'Classify a conversion as widening or narrowing and say whether a cast is needed.',
        'Predict the result of casts that truncate, wrap or clamp.',
        'Explain why `double avg = sum / count;` can be wrong and fix it.',
        'Parse numeric text safely and explain parseInt vs valueOf.',
      ],
      relatedLessonIds: ['f-types-operators', 't-wrappers', 't-strings'],
      revision: [
        { id: 'r1', question: 'What is the difference between widening and narrowing conversion?', answer: 'Widening goes to a type that can represent the whole range (int → long → double) and is automatic. Narrowing may lose information (double → int, int → byte) and needs an explicit cast, except for int constants that fit in byte/short/char.' },
        { id: 'r2', question: 'What does (int) 3.99 evaluate to, and (byte) 200?', answer: '3 (casts truncate toward zero) and −56 (only the low 8 bits are kept: 200 − 256).' },
        { id: 'r3', question: 'Why is byte + byte an int?', answer: 'Binary numeric promotion widens byte, short and char operands to int before any arithmetic, so the result is int and needs a cast to go back to byte.' },
        { id: 'r4', question: 'Integer.parseInt vs Integer.valueOf?', answer: 'parseInt returns a primitive int; valueOf returns an Integer (using the cache for −128..127). Both throw NumberFormatException for invalid text.' },
      ],
    },

    // -----------------------------------------------------------------------
    {
      id: 'f-control-flow',
      moduleId: 'fundamentals',
      title: 'Control flow: conditions, loops and switch',
      summary: 'if/else, loops, break/continue, classic switch fall-through and modern switch expressions.',
      estimatedMinutes: 30,
      difficulty: 'beginner',
      prerequisites: ['f-types-operators'],
      versionNotes: [
        { feature: 'switch on String', since: 7 },
        { feature: 'switch expressions and arrow labels', since: 17, note: 'Final in Java 14' },
        { feature: 'Pattern matching in switch', since: 21, note: 'Final in Java 21 (JEP 441)' },
      ],
      objectives: [
        'Use if/else, for, while and do-while correctly.',
        'Explain switch fall-through and avoid it with arrow labels.',
        'Use short-circuit operators to guard conditions.',
        'Exit nested loops with a labeled break.',
      ],
      plainEnglish: `Programs make decisions with \`if\`/\`else\`, repeat work with loops, and choose between many options with \`switch\`.

- \`for\` loops are best when you know how many times to repeat.
- \`while\` loops repeat as long as a condition stays true — possibly zero times.
- \`do-while\` loops always run at least once.
- \`break\` leaves a loop; \`continue\` skips to the next iteration.

Modern Java (14+) adds **switch expressions** with \`->\` arrows: they return a value and never "fall through" to the next case.`,
      technical: `### Conditions
\`&&\` and \`||\` **short-circuit**: the right side is evaluated only if needed, which makes guards like \`s != null && s.isEmpty()\` safe. \`&\` and \`|\` on booleans evaluate both sides.

### Classic switch
Case labels are entry points. Without \`break\`, execution falls through into the following cases. Classic switch works on \`int\`-compatible primitives and their wrappers, \`String\` and enums.

### Switch expressions (Java 14+)
\`case A, B -> value\` labels do not fall through, the switch produces a value, and the compiler checks **exhaustiveness** for enums and sealed types (otherwise a \`default\` is required). Use \`yield\` to return a value from a block.

### Reachability
The compiler rejects unreachable statements: code after \`return\`, or the body of \`while (false)\`. \`if (false)\` is deliberately allowed to support conditional compilation of debug code.

### Labeled break
A label on an outer loop (\`outer:\`) lets \`break outer\` exit both loops at once — clearer than flag variables, though extracting a method that returns is often better still.`,
      whyItExists: `Control flow is how programs react to data. Switch expressions were added because the classic switch's fall-through behaviour caused bugs for decades, and because returning a value directly is clearer than assigning to a variable in every case.`,
      whenToUse: [
        'Use switch expressions for mapping a value to a result across many discrete cases.',
        'Use enhanced for loops (`for (T x : items)`) when you do not need the index.',
        'Use early returns and guard clauses to reduce nesting.',
      ],
      whenNotToUse: [
        'Do not rely on classic switch fall-through unless it is intentional and commented.',
        'Do not use labeled breaks where extracting a method would make the logic clearer.',
        'Do not use `&` or `|` on booleans when you mean short-circuit `&&` or `||`.',
      ],
      examples: [
        {
          id: 'switches',
          title: 'Switch expression vs. classic switch',
          runnable: true,
          code: `public class Main {
    static String classify(int day) {
        return switch (day) {
            case 1, 7 -> "weekend";
            case 2, 3, 4, 5, 6 -> "weekday";
            default -> "invalid";
        };
    }

    public static void main(String[] args) {
        System.out.println(classify(1));
        System.out.println(classify(4));
        System.out.println(classify(9));

        int code = 2;
        switch (code) {
            case 1:
                System.out.println("one");
            case 2:
                System.out.println("two");
            case 3:
                System.out.println("three");
                break;
            default:
                System.out.println("other");
        }
    }
}`,
          expectedOutput: `weekend
weekday
invalid
two
three`,
        },
        {
          id: 'loops',
          title: 'Loops, continue and labeled break',
          runnable: true,
          code: `public class Main {
    public static void main(String[] args) {
        int total = 0;
        for (int i = 1; i <= 10; i++) {
            if (i % 2 == 0) continue;
            total += i;
        }
        System.out.println("Sum of odd numbers: " + total);

        outer:
        for (int row = 1; row <= 3; row++) {
            for (int col = 1; col <= 3; col++) {
                if (row * col == 4) {
                    System.out.println("Found 4 at " + row + "," + col);
                    break outer;
                }
            }
        }

        int n = 0;
        do {
            n++;
        } while (n < 0);
        System.out.println("do-while ran " + n + " time(s)");
    }
}`,
          expectedOutput: `Sum of odd numbers: 25
Found 4 at 2,2
do-while ran 1 time(s)`,
        },
      ],
      walkthrough: {
        exampleId: 'switches',
        steps: [
          { lines: [2, 8], text: 'A switch expression: each arrow label maps to a value, there is no fall-through, and `default` makes it exhaustive for int.' },
          { lines: [11, 13], text: 'Day 1 matches `case 1, 7`, day 4 matches the weekday list, day 9 falls to default.' },
          { lines: [15, 17], text: 'A classic switch with code = 2 jumps straight to the `case 2:` label.' },
          { lines: [20, 21], text: 'Prints "two". There is no break, so execution falls through into case 3.' },
          { lines: [22, 24], text: 'Prints "three", then break exits the switch. "one" and "other" are never printed.' },
        ],
      },
      realWorld: {
        title: 'A missing break that charged customers twice',
        scenario: `A billing job used a classic switch over subscription plans. A developer added a new \`case ANNUAL:\` that applied a discount but forgot the \`break\`, so annual customers also fell into the \`MONTHLY\` branch and were charged a second time.

Rewriting the switch as an exhaustive switch expression over the \`Plan\` enum made fall-through impossible, and the compiler now flags any new enum constant that is not handled.`,
      },
      commonMistakes: [
        {
          mistake: 'Forgetting break in a classic switch.',
          why: 'Case labels are entry points; execution continues into the next case.',
          fix: 'Use arrow labels (`case X ->`) or a switch expression.',
        },
        {
          mistake: 'Off-by-one loop bounds such as `i <= array.length`.',
          why: 'Valid indexes are 0 to length − 1, so the last iteration throws ArrayIndexOutOfBoundsException.',
          fix: 'Use `i < array.length` or an enhanced for loop.',
        },
        {
          mistake: 'Using `=` instead of `==` in a condition.',
          why: 'For booleans, `if (done = true)` assigns and is always true. (For ints it does not compile, which is a safety net.)',
          fix: 'Write `if (done)` for booleans and `==` for comparisons.',
        },
      ],
      checks: [
        {
          id: 'f3-c1',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this print?',
          code: `public class Main {
    public static void main(String[] args) {
        String s = null;
        if (s != null && s.length() > 3) {
            System.out.println("long");
        } else {
            System.out.println("safe");
        }
        int calls = 0;
        boolean result = (calls++ > 0) & (calls++ > 0);
        System.out.println(result + " " + calls);
    }
}`,
          options: [
            { id: 'a', text: 'safe\nfalse 1' },
            { id: 'b', text: 'safe\nfalse 2' },
            { id: 'c', text: 'NullPointerException' },
            { id: 'd', text: 'safe\ntrue 2' },
          ],
          correctOptionId: 'b',
          explanation:
            '`&&` short-circuits, so s.length() is never called. The non-short-circuit `&` evaluates both sides: (0 > 0) is false, then (1 > 0) is true, calls ends at 2, and false & true is false.',
        },
        {
          id: 'f3-c2',
          kind: 'predict-output',
          dimension: 'conceptual',
          prompt: 'What happens when you compile this?',
          code: `public class Main {
    public static void main(String[] args) {
        int x = 0;
        while (false) {
            x++;
        }
        System.out.println(x);
    }
}`,
          options: [
            { id: 'a', text: '0' },
            { id: 'b', text: 'Compile error: unreachable statement' },
            { id: 'c', text: 'Infinite loop' },
            { id: 'd', text: '1' },
          ],
          correctOptionId: 'b',
          expectCompileError: true,
          explanation: 'The body of `while (false)` can never execute, and Java rejects unreachable statements. `if (false)` is allowed deliberately.',
        },
        {
          id: 'f3-c3',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this print?',
          code: `public class Main {
    public static void main(String[] args) {
        for (int i = 0; i < 10; i += 3) {
            if (i == 6) break;
            System.out.print(i + " ");
        }
        System.out.println();
    }
}`,
          options: [
            { id: 'a', text: '0 3 6' },
            { id: 'b', text: '0 3' },
            { id: 'c', text: '0 3 6 9' },
            { id: 'd', text: '3 6' },
          ],
          correctOptionId: 'b',
          explanation: 'i takes 0, 3, 6. At 6 the loop breaks before printing.',
        },
        {
          id: 'f3-c4',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'Why are arrow-label switch expressions safer than classic switch statements?',
          options: [
            { id: 'a', text: 'They run faster' },
            { id: 'b', text: 'They cannot fall through and must be exhaustive, so missing cases are compile errors' },
            { id: 'c', text: 'They can switch on any object' },
            { id: 'd', text: 'They catch exceptions automatically' },
          ],
          correctOptionId: 'b',
          explanation: 'Arrow labels never fall through, and switch expressions must cover every possible value (enums, sealed types) or have a default.',
        },
        {
          id: 'f3-c5',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this print?',
          code: `public class Main {
    public static void main(String[] args) {
        String level = "WARN";
        int priority = switch (level) {
            case "ERROR" -> 3;
            case "WARN" -> {
                int base = 1;
                yield base + 1;
            }
            default -> 0;
        };
        System.out.println(priority);
    }
}`,
          options: [
            { id: 'a', text: '1' },
            { id: 'b', text: '2' },
            { id: 'c', text: '3' },
            { id: 'd', text: 'Compile error: yield is not a keyword' },
          ],
          correctOptionId: 'b',
          explanation: 'A block on the right of an arrow returns its value with `yield`. "WARN" yields 1 + 1 = 2.',
        },
      ],
      challengeIds: ['ch-fizzbuzz', 'ch-sum-evens'],
      masteryCriteria: [
        'Trace loops with break/continue and predict their output.',
        'Explain fall-through and rewrite a classic switch as a switch expression.',
        'Use short-circuit evaluation to write null-safe conditions.',
      ],
      relatedLessonIds: ['f-methods', 't-wrappers'],
      revision: [
        { id: 'r1', question: 'What is switch fall-through and how do you avoid it?', answer: 'In a classic switch, case labels are entry points and execution continues into later cases without break. Arrow labels/switch expressions never fall through.' },
        { id: 'r2', question: 'Why is `s != null && s.isEmpty()` safe but `s != null & s.isEmpty()` not?', answer: '&& short-circuits and skips the right side when the left is false; & evaluates both sides, so s.isEmpty() throws NullPointerException when s is null.' },
        { id: 'r3', question: 'How do you return a value from a block inside a switch expression?', answer: 'Use `yield value;` inside the block.' },
      ],
    },

    // -----------------------------------------------------------------------
    {
      id: 'f-methods',
      moduleId: 'fundamentals',
      title: 'Methods, overloading and pass-by-value',
      summary: 'Declaring methods, how arguments are passed, overload resolution and recursion.',
      estimatedMinutes: 35,
      difficulty: 'beginner',
      prerequisites: ['f-control-flow'],
      objectives: [
        'Explain why Java is always pass-by-value, including for references.',
        'Predict which overload the compiler chooses.',
        'Write and trace a recursive method with a correct base case.',
      ],
      plainEnglish: `A **method** is a named, reusable block of code. It can take **parameters** and **return** a value.

When you call a method, Java gives it a **copy** of each argument. For a primitive, that is a copy of the number. For an object, it is a copy of the **reference** (the address of the object) — so the method can change the object the reference points to, but it cannot make your variable point somewhere else.

**Overloading** means several methods share a name but take different parameter lists; the compiler picks one at compile time.`,
      technical: `### Pass-by-value
Each call creates a **stack frame** with its own local variables; parameters are locals initialised with copies of the argument values. Reassigning a parameter changes only the frame's copy. Mutating the object a reference points to is visible to the caller because both copies refer to the same heap object.

### Overload resolution (JLS 15.12.2)
The compiler picks the most specific applicable method in three phases, stopping at the first phase that finds a candidate:
1. Without boxing/unboxing or varargs (only widening primitive and reference conversions).
2. Allowing boxing and unboxing.
3. Allowing varargs.

This is why \`show(byte)\` prefers \`show(int)\` over \`show(Integer)\`, and varargs is the last resort. The return type is not part of the signature, so two methods differing only by return type do not compile.

### Static vs instance
\`static\` methods belong to the class and cannot use \`this\`. Instance methods are dispatched on the runtime object (covered in OOP).

### Recursion
Every recursive call pushes a new frame. Without a reachable base case the stack eventually overflows with \`StackOverflowError\`. Java does not perform tail-call elimination.`,
      whyItExists: `Methods let you name an idea, reuse it and test it in isolation. Pass-by-value keeps calls predictable: a method can never rebind a caller's variable, which makes reasoning about code local.`,
      whenToUse: [
        'Extract a method when a block does one nameable thing or is repeated.',
        'Use overloading for the same operation on different input types (e.g. `print(int)`, `print(String)`).',
        'Use recursion for naturally recursive structures (trees, divide and conquer) with bounded depth.',
      ],
      whenNotToUse: [
        'Do not overload methods with the same arity and closely related types (int/Integer/long) — callers will be surprised.',
        'Do not recurse over unbounded input (e.g. a million-element list); use iteration.',
        'Do not use output parameters (mutating arguments) when returning a value is clearer.',
      ],
      examples: [
        {
          id: 'pass-by-value',
          title: 'Pass-by-value with primitives and references',
          runnable: true,
          code: `public class Main {
    static void increment(int x) {
        x++;
    }

    static void reassign(int[] arr) {
        arr = new int[] {99};
    }

    static void mutate(int[] arr) {
        arr[0] = 42;
    }

    public static void main(String[] args) {
        int value = 1;
        increment(value);
        System.out.println(value);

        int[] data = {1};
        reassign(data);
        System.out.println(data[0]);

        mutate(data);
        System.out.println(data[0]);
    }
}`,
          expectedOutput: `1
1
42`,
        },
        {
          id: 'overloads',
          title: 'Overload resolution phases',
          runnable: true,
          code: `public class Main {
    static void show(int x) { System.out.println("int"); }
    static void show(long x) { System.out.println("long"); }
    static void show(Integer x) { System.out.println("Integer"); }
    static void show(Object x) { System.out.println("Object"); }
    static void show(int... x) { System.out.println("varargs"); }

    public static void main(String[] args) {
        byte b = 5;
        show(b);
        show(5L);
        show(Integer.valueOf(5));
        show("hi");
        show(5.0);
        show();
    }
}`,
          expectedOutput: `int
long
Integer
Object
Object
varargs`,
          explanation:
            'byte widens to int in phase 1. 5.0 cannot widen to int or long, so phase 2 boxes it to Double, which matches Object. A call with no arguments only matches varargs.',
        },
        {
          id: 'recursion',
          title: 'Recursion with a base case',
          runnable: true,
          code: `public class Main {
    static long factorial(int n) {
        if (n < 0) throw new IllegalArgumentException("n must be >= 0");
        if (n <= 1) return 1;          // base case
        return n * factorial(n - 1);   // recursive case
    }

    public static void main(String[] args) {
        System.out.println(factorial(5));
        System.out.println(factorial(20));
    }
}`,
          expectedOutput: `120
2432902008176640000`,
        },
      ],
      walkthrough: {
        exampleId: 'pass-by-value',
        steps: [
          { lines: [15, 17], text: '`increment` receives a copy of 1 in its own frame. Its x++ changes the copy only, so value is still 1.' },
          { lines: [19, 21], text: '`reassign` receives a copy of the reference to the array. Pointing that copy at a new array does not affect `data`.' },
          { lines: [23, 24], text: '`mutate` uses its copy of the reference to modify the shared array object, so the caller sees 42.' },
          { lines: [6, 8], text: 'Key idea: the reference is passed by value. Methods can change the object, never the caller\'s variable.' },
        ],
      },
      realWorld: {
        title: 'A "helper" that silently mutated a shared list',
        scenario: `A reporting service passed its list of orders to a helper method that sorted the list to find the top 10. Callers later iterated the "original" list expecting insertion order, but the helper had sorted the shared object in place. Customer statements came out in the wrong order.

The helper received a copy of the reference, not a copy of the list. The fix: copy before mutating (\`new ArrayList<>(orders)\`) or use a non-mutating operation (\`orders.stream().sorted(...).limit(10).toList()\`), and expose read-only views where possible.`,
      },
      commonMistakes: [
        {
          mistake: 'Believing objects are passed by reference.',
          why: 'Java copies the reference value. Reassigning the parameter never affects the caller.',
          fix: 'Return the new value instead of trying to reassign a parameter.',
        },
        {
          mistake: 'Recursion without a reachable base case.',
          why: 'Each call adds a stack frame; the thread\'s stack overflows with StackOverflowError.',
          fix: 'Handle the smallest input first and make sure every call moves toward it.',
        },
        {
          mistake: 'Overloading on int and Integer and expecting null or boxing to choose a specific one.',
          why: 'Overload selection happens at compile time based on static types, with phases that surprise readers.',
          fix: 'Give the methods different names when behaviour differs.',
        },
      ],
      checks: [
        {
          id: 'f4-c1',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this print?',
          code: `public class Main {
    static void shout(String s) {
        s = s + "!";
    }

    static void append(StringBuilder sb) {
        sb.append("!");
    }

    public static void main(String[] args) {
        String text = "hi";
        shout(text);
        StringBuilder builder = new StringBuilder("hi");
        append(builder);
        System.out.println(text + " " + builder);
    }
}`,
          options: [
            { id: 'a', text: 'hi! hi!' },
            { id: 'b', text: 'hi hi!' },
            { id: 'c', text: 'hi! hi' },
            { id: 'd', text: 'hi hi' },
          ],
          correctOptionId: 'b',
          explanation:
            'Strings are immutable: `s + "!"` creates a new String and rebinds the local copy only. StringBuilder is mutable, and append changes the shared object.',
        },
        {
          id: 'f4-c2',
          kind: 'predict-output',
          dimension: 'conceptual',
          prompt: 'What happens when you compile this?',
          code: `public class Main {
    static int parse(String s) { return Integer.parseInt(s); }
    static long parse(String s) { return Long.parseLong(s); }

    public static void main(String[] args) {
        System.out.println(parse("1"));
    }
}`,
          options: [
            { id: 'a', text: '1' },
            { id: 'b', text: 'Compile error: method parse(String) is already defined' },
            { id: 'c', text: 'The long version is chosen' },
            { id: 'd', text: 'Runtime ambiguity error' },
          ],
          correctOptionId: 'b',
          expectCompileError: true,
          explanation: 'The method signature is the name plus parameter types. The return type is not part of it, so these two methods clash.',
        },
        {
          id: 'f4-c3',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'Which overload runs?',
          code: `public class Main {
    static void call(long x) { System.out.println("long"); }
    static void call(Integer x) { System.out.println("Integer"); }

    public static void main(String[] args) {
        call(7);
    }
}`,
          options: [
            { id: 'a', text: 'long' },
            { id: 'b', text: 'Integer' },
            { id: 'c', text: 'Compile error: ambiguous' },
          ],
          correctOptionId: 'a',
          explanation: 'Phase 1 (no boxing) already finds call(long) via widening int → long, so boxing to Integer is never considered.',
          hints: ['Overload resolution tries widening before boxing.'],
        },
        {
          id: 'f4-c4',
          kind: 'mcq',
          dimension: 'runtime',
          prompt: 'A recursive method has no base case for negative input and is called with -1. What happens?',
          options: [
            { id: 'a', text: 'The JIT detects the loop and stops it' },
            { id: 'b', text: 'StackOverflowError after the thread stack fills with frames' },
            { id: 'c', text: 'OutOfMemoryError: Java heap space' },
            { id: 'd', text: 'It returns 0' },
          ],
          correctOptionId: 'b',
          explanation: 'Each call pushes a frame on the thread stack (not the heap). Java has no tail-call elimination, so unbounded recursion overflows the stack.',
        },
      ],
      challengeIds: ['ch-digit-sum'],
      masteryCriteria: [
        'Explain pass-by-value for references with a diagram or example.',
        'Predict overload resolution across widening, boxing and varargs.',
        'Write a recursive method with a correct base case and explain its stack usage.',
      ],
      relatedLessonIds: ['o-classes-objects', 'r-memory-areas'],
      revision: [
        { id: 'r1', question: 'Is Java pass-by-reference for objects?', answer: 'No. Java is always pass-by-value; for objects the value copied is the reference. The method can mutate the object but cannot rebind the caller\'s variable.' },
        { id: 'r2', question: 'List the three phases of overload resolution.', answer: '1) widening only, no boxing or varargs; 2) boxing/unboxing allowed; 3) varargs allowed. The first phase with an applicable method wins.' },
        { id: 'r3', question: 'Where do recursive calls consume memory, and what error results from unbounded recursion?', answer: 'Each call adds a frame to the thread stack; unbounded recursion causes StackOverflowError.' },
      ],
    },

    // -----------------------------------------------------------------------
    {
      id: 'f-arrays-input',
      moduleId: 'fundamentals',
      title: 'Arrays and reading input',
      summary: 'Array creation, default values, aliasing, multidimensional arrays and reading standard input.',
      estimatedMinutes: 30,
      difficulty: 'beginner',
      prerequisites: ['f-methods'],
      objectives: [
        'Create, copy and compare arrays correctly.',
        'Know the default values of array elements.',
        'Read structured input from standard input efficiently.',
      ],
      plainEnglish: `An **array** is a fixed-size row of values of one type, numbered from **0**. Once created, its length never changes.

Arrays are objects: an array variable holds a **reference**, so \`int[] b = a;\` does not copy anything — both names point to the same array.

To build programs that react to data, you read **standard input**. \`Scanner\` is easy to use; \`BufferedReader\` is faster for large inputs.`,
      technical: `### Creation and defaults
\`new int[n]\` allocates n elements on the heap and zero-initialises them: \`0\` for numbers, \`false\` for boolean, \`'\\u0000'\` for char, \`null\` for references. Every access is bounds-checked; an invalid index throws \`ArrayIndexOutOfBoundsException\`.

### Identity vs content
Arrays inherit \`equals\` from Object, which compares identity. Use \`Arrays.equals\` (or \`Arrays.deepEquals\` for nested arrays) to compare contents, and \`Arrays.toString\`/\`deepToString\` to print them.

### Copies
\`Arrays.copyOf\`, \`array.clone()\` and \`System.arraycopy\` create **shallow** copies: for arrays of objects, the elements (references) are copied, not the objects.

### Multidimensional arrays
\`int[][]\` is an array of arrays; rows can have different lengths ("jagged").

### Input
\`Scanner\` tokenises with regular expressions — convenient but slow for millions of tokens. \`BufferedReader.readLine()\` plus \`String.split\` or \`StringTokenizer\` is much faster and is what competitive and production parsers prefer. Both should be closed (or wrap \`System.in\`, which you normally leave open).`,
      whyItExists: `Arrays are the lowest-level contiguous collection on the JVM: constant-time indexed access and excellent cache locality. ArrayList, HashMap and most collections are built on arrays internally.`,
      whenToUse: [
        'Use arrays for fixed-size data, primitives in performance-critical code, and matrices.',
        'Use `Arrays.sort`, `Arrays.fill`, `Arrays.copyOf` and `Arrays.asList` helpers instead of hand-written loops.',
        'Use BufferedReader for large inputs.',
      ],
      whenNotToUse: [
        'Do not use arrays when the size changes — use ArrayList.',
        'Do not expose internal arrays from a class; return a copy or an unmodifiable list.',
        'Do not compare arrays with == or equals when you mean content.',
      ],
      examples: [
        {
          id: 'arrays-basics',
          title: 'Defaults, aliasing and comparison',
          runnable: true,
          code: `import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] nums = new int[3];
        String[] names = new String[2];
        boolean[] flags = new boolean[2];
        System.out.println(Arrays.toString(nums) + " " + Arrays.toString(names) + " " + Arrays.toString(flags));

        int[] alias = nums;
        alias[0] = 7;
        System.out.println(nums[0]);

        int[] copy = Arrays.copyOf(nums, nums.length);
        copy[1] = 9;
        System.out.println(Arrays.toString(nums) + " " + Arrays.toString(copy));

        int[] a = {1, 2};
        int[] b = {1, 2};
        System.out.println((a == b) + " " + a.equals(b) + " " + Arrays.equals(a, b));

        int[][] grid = {{1, 2, 3}, {4, 5}, {6}};
        System.out.println(grid.length + " rows; last row length " + grid[2].length);
        System.out.println(Arrays.deepToString(grid));
    }
}`,
          expectedOutput: `[0, 0, 0] [null, null] [false, false]
7
[7, 0, 0] [7, 9, 0]
false false true
3 rows; last row length 1
[[1, 2, 3], [4, 5], [6]]`,
        },
        {
          id: 'read-input',
          title: 'Reading input with BufferedReader',
          runnable: true,
          stdin: `5
3 9 -2 7 4
`,
          code: `import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.StringTokenizer;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(in.readLine().trim());
        int[] values = new int[n];
        StringTokenizer tokens = new StringTokenizer(in.readLine());
        for (int i = 0; i < n; i++) {
            values[i] = Integer.parseInt(tokens.nextToken());
        }

        int max = values[0];
        for (int v : values) {
            if (v > max) max = v;
        }
        System.out.println("Read " + n + " values, max = " + max);
    }
}`,
          expectedOutput: `Read 5 values, max = 9`,
          explanation: 'The first line gives the count; the second line holds the values. This is the input format used by most playground challenges.',
        },
      ],
      walkthrough: {
        exampleId: 'arrays-basics',
        steps: [
          { lines: [5, 8], text: 'New arrays are zero-initialised: 0, null and false. No element is ever "garbage".' },
          { lines: [10, 12], text: '`alias` copies the reference, not the array. Writing through alias changes nums.' },
          { lines: [14, 16], text: 'Arrays.copyOf creates a new array object; changing copy does not affect nums.' },
          { lines: [18, 20], text: '== and equals compare identity for arrays (false, false); Arrays.equals compares content (true).' },
          { lines: [22, 24], text: 'A 2D array is an array of arrays, so rows can have different lengths.' },
        ],
      },
      realWorld: {
        title: 'A leaked internal array',
        scenario: `A configuration class returned its internal \`String[] allowedHosts\` directly from a getter. A caller "temporarily" replaced an element to test something and accidentally widened the allow-list for the whole process.

Returning \`allowedHosts.clone()\` — or storing an immutable \`List.copyOf(...)\` and returning that — prevents callers from mutating internal state. This is the "defensive copy" pattern.`,
      },
      commonMistakes: [
        {
          mistake: 'Comparing arrays with equals().',
          why: 'Arrays do not override equals, so it checks identity.',
          fix: 'Use Arrays.equals or Arrays.deepEquals.',
        },
        {
          mistake: 'Printing an array directly and getting `[I@6d06d69c`.',
          why: 'Arrays inherit Object.toString, which prints the type and an identity hash.',
          fix: 'Use Arrays.toString or Arrays.deepToString.',
        },
        {
          mistake: 'Using Scanner.nextInt() then nextLine() and getting an empty line.',
          why: 'nextInt does not consume the line break, so the following nextLine returns the rest of the current line (empty).',
          fix: 'Read whole lines and parse them, or call nextLine() once to consume the line break.',
        },
      ],
      checks: [
        {
          id: 'f5-c1',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this print?',
          code: `public class Main {
    public static void main(String[] args) {
        char[] letters = new char[2];
        double[] values = new double[2];
        Object[] things = new Object[2];
        System.out.println((int) letters[0] + " " + values[1] + " " + things[0]);
    }
}`,
          options: [
            { id: 'a', text: '0 0.0 null' },
            { id: 'b', text: '0 0 null' },
            { id: 'c', text: 'Compile error: uninitialised array' },
            { id: 'd', text: '  0.0 null' },
          ],
          correctOptionId: 'a',
          explanation: 'Array elements always start with defaults: char \\u0000 (code point 0), double 0.0, references null.',
        },
        {
          id: 'f5-c2',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'How do you get the size of an array, a String and an ArrayList respectively?',
          options: [
            { id: 'a', text: 'arr.length, str.length(), list.size()' },
            { id: 'b', text: 'arr.length(), str.length, list.length()' },
            { id: 'c', text: 'arr.size(), str.size(), list.size()' },
            { id: 'd', text: 'arr.length, str.length(), list.length' },
          ],
          correctOptionId: 'a',
          explanation: 'Array length is a final field; String exposes a length() method; collections use size().',
        },
        {
          id: 'f5-c3',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this print?',
          code: `import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[][] original = {{1, 2}, {3, 4}};
        int[][] copy = original.clone();
        copy[0][0] = 99;
        copy[1] = new int[] {7, 7};
        System.out.println(Arrays.deepToString(original));
    }
}`,
          options: [
            { id: 'a', text: '[[1, 2], [3, 4]]' },
            { id: 'b', text: '[[99, 2], [3, 4]]' },
            { id: 'c', text: '[[99, 2], [7, 7]]' },
            { id: 'd', text: '[[1, 2], [7, 7]]' },
          ],
          correctOptionId: 'b',
          explanation:
            'clone() is shallow: the outer array is new, but its elements are references to the same row arrays. Mutating copy[0][0] changes the shared row; replacing copy[1] only changes the copy\'s slot.',
          hints: ['A 2D array is an array of references to row arrays.'],
        },
        {
          id: 'f5-c4',
          kind: 'mcq',
          dimension: 'runtime',
          prompt: 'You need to parse 2 million integers from standard input within a time limit. What is the best choice?',
          options: [
            { id: 'a', text: 'Scanner.nextInt() in a loop' },
            { id: 'b', text: 'BufferedReader with StringTokenizer (or a custom byte parser)' },
            { id: 'c', text: 'System.console().readLine()' },
            { id: 'd', text: 'Read one character at a time with System.in.read() unbuffered' },
          ],
          correctOptionId: 'b',
          explanation: 'Scanner uses regex tokenising and is slow for large inputs. Buffered line reading with a lightweight tokenizer is typically several times faster.',
        },
      ],
      challengeIds: ['ch-reverse-array'],
      masteryCriteria: [
        'State default values for every array element type.',
        'Explain shallow copies of arrays of references.',
        'Read and parse multi-line input correctly.',
      ],
      relatedLessonIds: ['c-collections-overview', 'f-methods'],
      revision: [
        { id: 'r1', question: 'What does Arrays.equals do that a.equals(b) does not?', answer: 'Arrays.equals compares element contents; array.equals is Object.equals, which compares identity.' },
        { id: 'r2', question: 'Is array.clone() deep or shallow?', answer: 'Shallow: a new array is created, but object elements (including inner arrays) are shared references.' },
        { id: 'r3', question: 'Why prefer BufferedReader over Scanner for large inputs?', answer: 'Scanner parses tokens with regular expressions and is slow; BufferedReader reads large buffers and you split cheaply.' },
      ],
    },
  ],
};
