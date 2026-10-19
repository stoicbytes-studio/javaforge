import type { Lesson } from '@/types/curriculum';

/** Extra lesson for module 8 (JVM Runtime): JIT compiler internals. */
export const jitLessons: Lesson[] = [
  // -------------------------------------------------------------------------
  {
    id: 'r-jit-compiler',
    moduleId: 'jvm-runtime',
    title: 'Inside the JIT: tiered compilation, inlining and deoptimisation',
    summary: 'How HotSpot decides what to compile and when, why inlining unlocks almost every other optimisation, how call-site profiles drive speculation, and what happens when a guess turns out wrong.',
    estimatedMinutes: 45,
    difficulty: 'advanced',
    prerequisites: ['r-memory-areas'],
    versionNotes: [
      { feature: 'Tiered compilation on by default (server VM)', since: 8 },
      { feature: 'Segmented code cache (JEP 197)', since: 9 },
      { feature: 'JVM Compiler Interface, JVMCI (JEP 243)', since: 9, note: 'Lets a compiler written in Java, such as Graal, plug into HotSpot' },
      { feature: 'Graal as an experimental JIT (JEP 317)', since: 10, note: 'The experimental Graal JIT and jaotc AOT compiler were removed from the JDK in 17 (JEP 410)' },
      { feature: 'Ahead-of-time class loading and linking cache (JEP 483)', since: 24, note: 'First Project Leyden feature' },
      { feature: 'Ahead-of-time method profiling (JEP 515)', since: 25, note: 'The JIT starts with profiles recorded in a training run' },
    ],
    objectives: [
      'Describe the interpreter, C1 and C2 and the five compilation tiers (0-4), including the common tier transitions.',
      'Explain invocation and back-edge counters, background compilation and on-stack replacement (OSR).',
      'Explain why inlining is the gateway optimisation and how bytecode size limits (MaxInlineSize, FreqInlineSize) affect it.',
      'Describe escape analysis, scalar replacement, lock elision and coarsening, loop optimisations and intrinsics.',
      'Classify call sites as monomorphic, bimorphic or megamorphic and explain class hierarchy analysis, speculation and deoptimisation.',
      'Choose the right diagnostic tool (PrintCompilation, -Xlog, LogCompilation with JITWatch, JMH) and place Graal and AOT caches in context.',
    ],
    plainEnglish: `When a Java program starts, the JVM does not translate everything to machine code up front. It **interprets** bytecode one instruction at a time and quietly **counts** how often each method runs and each loop goes round. Code that turns out to be "hot" is handed to a **JIT (just-in-time) compiler** that turns it into fast native machine code — while your program keeps running.

HotSpot has two JIT compilers:

- **C1** (the "client" compiler) compiles quickly and does simple optimisations. Its code also keeps recording **profiles**: which branches are taken, which classes actually show up at each call.
- **C2** (the "server" compiler) compiles slowly but produces very fast code, using those profiles to make educated **guesses** — for example "this \`shape.area()\` call has only ever seen \`Square\`, so I'll paste \`Square.area()\` right here".

Pasting a called method's body into its caller is called **inlining**, and it is the most important trick: once code is inlined, the compiler can see across method boundaries and remove allocations, locks, checks and whole calculations.

Guesses can turn out wrong — a \`Circle\` shows up after a million \`Square\`s. The JVM then **deoptimises**: it throws the compiled code away, continues in the interpreter **with exactly the same results**, and later recompiles with the new knowledge. The JIT is allowed to change *how fast* your code runs, never *what* it computes.`,
    technical: `### The tiers (HotSpot, tiered compilation)
- **Tier 0** — interpreter. Collects invocation and back-edge counts and (for hot code) profiles.
- **Tier 1** — C1, full optimisation, **no profiling**. Used for trivial methods (getters, constant returns) where C2 could not do better.
- **Tier 2** — C1 with invocation and back-edge counters only. Used when the C2 queue is long, to get some speed while waiting.
- **Tier 3** — C1 with **full profiling** (branch counts, receiver types at call sites, type checks). The normal stepping stone.
- **Tier 4** — C2, fully optimised using the tier-3 profile.

The common path is **0 → 3 → 4**. Trivial methods go **0 → 1** and stay there. Under C2 back-pressure: **0 → 2 → 3 → 4**. Deoptimisation drops back to tier 0. \`-XX:TieredStopAtLevel=1\` (C1 only) trades peak speed for faster warm-up; \`-Xint\` disables the JIT entirely.

### Counters, the compile queue and OSR
Each method has an **invocation counter**; each loop's backward jump increments a **back-edge counter**. When a counter crosses a tier threshold (defaults such as \`Tier3InvocationThreshold\` and \`Tier4InvocationThreshold\`), the method is put on a **compile queue** and compiled by **background compiler threads** — the application keeps running the old version until the new code is installed in the **code cache**.

A method that is called once but loops for a long time (typically \`main\`) never gets a second invocation. The back-edge counter catches it: the JIT compiles a special **on-stack replacement (OSR)** version with an entry point at the loop header and transfers the live frame into it mid-loop. \`-XX:+PrintCompilation\` marks OSR compilations with \`%\`.

### Inlining: the gateway optimisation
Inlining replaces a call with the callee's body. It saves the call itself, but the real value is that the combined code can be optimised as one unit. HotSpot decides mainly by **bytecode size** and **call frequency**:
- \`MaxInlineSize\` (35 bytes of bytecode) — methods at most this size are inlined even at cold call sites.
- \`FreqInlineSize\` (325 bytes on common 64-bit platforms) — the limit for **hot** call sites.
- \`MaxInlineLevel\` limits nesting depth; very large methods (over 8000 bytes, \`HugeMethodLimit\`) are not JIT-compiled at all by default.

Consequence: small, focused methods are **cheap** — usually free — once hot. Giant methods are the ones that hurt.

### Optimisations unlocked by inlining
- **Escape analysis**: if an object never escapes the compiled region (not stored in a field, not returned, not passed to un-inlined code), C2 can **scalar-replace** it — its fields become local values in registers and no heap allocation happens.
- **Lock elision**: \`synchronized\` on an object that does not escape is removed. **Lock coarsening** merges adjacent lock/unlock pairs on the same object into one region.
- **Loop optimisations**: loop unrolling, **range-check elimination** (one bounds check before the loop instead of one per iteration), loop-invariant code motion, loop unswitching and **auto-vectorisation** (SIMD instructions for simple array loops).
- **Constant folding, dead-code elimination** and null-check elimination across what used to be method boundaries.
- **Intrinsics**: for some JDK methods (e.g. \`System.arraycopy\`, \`Math.sqrt\`, \`Integer.bitCount\`, \`String.equals\`, \`Arrays.equals\`, CRC32 and AES helpers) the JIT ignores the Java body and emits a hand-tuned instruction sequence. Inside the JDK such methods carry the internal \`@IntrinsicCandidate\` annotation.

### Speculation: call-site shapes and class hierarchy analysis
For every virtual or interface call the profile records which receiver classes it has seen (up to two, \`TypeProfileWidth\`):
- **Monomorphic** — one class seen. C2 adds a cheap type guard and inlines that one method.
- **Bimorphic** — two classes. C2 inlines both behind an if/else on the type.
- **Megamorphic** — three or more. Usually no inlining; the call goes through the vtable/itable. (If one type dominates, roughly 90% of calls, C2 may still inline it with a guard.)

**Class hierarchy analysis (CHA)** goes further: if only one loaded class implements a non-final method, the call is devirtualised with no guard at all, and the compiled code records a **dependency** on that fact.

### Deoptimisation
When a guard fails, an untaken branch suddenly runs ("uncommon trap"), or class loading breaks a CHA dependency, the JVM **deoptimises**: it rebuilds interpreter frames from the compiled frame and continues in tier 0. The compiled method is marked **"made not entrant"** (visible in PrintCompilation) and is recompiled later with a fresh profile. Semantics never change; only speed does. A method that deoptimises again and again is eventually left uncompiled for that reason — one source of mysterious slowness.

### The code cache
Compiled code lives in the **code cache** (native memory, \`-XX:ReservedCodeCacheSize\`, segmented since Java 9 into non-method, profiled and non-profiled heaps). If it fills up, the JVM logs "CodeCache is full. Compiler has been disabled." and new hot code stays interpreted. Inspect it with \`jcmd <pid> Compiler.codecache\`.

### Looking inside
- \`-XX:+PrintCompilation\` — one line per compilation: tier, \`%\` for OSR, \`made not entrant\` for deoptimised code.
- \`-Xlog:jit*\` (unified logging, e.g. \`-Xlog:jit+compilation=debug\`) — compilation events through the standard logging framework.
- \`-XX:+UnlockDiagnosticVMOptions -XX:+PrintInlining\` — inlining decisions and reasons ("too big", "hot method too big").
- \`-XX:+UnlockDiagnosticVMOptions -XX:+LogCompilation\` — a detailed XML log that **JITWatch** visualises (inlining trees, OSR, deopts, even assembly with hsdis).

### Graal and ahead-of-time compilation (context)
- **Graal** is an optimising compiler written in Java that plugs into HotSpot through **JVMCI** (JEP 243, Java 9). It is the JIT in GraalVM and was briefly an experimental option in the OpenJDK builds (JEP 317), removed again in Java 17 (JEP 410).
- **GraalVM Native Image** compiles a whole application ahead of time into a native executable under a **closed-world** assumption: very fast start-up and small footprint, but no runtime profile-guided recompilation and reflection must be declared.
- **Project Leyden** keeps the normal JVM but shifts work to a training run: **JEP 483** (Java 24) caches loaded and linked classes, and **JEP 515** (Java 25) stores method profiles so the JIT can compile hot code sooner after start-up.

### Why micro-benchmarks need JMH
Because the code you time changes underneath you — interpreter, then C1, then C2, OSR versions, dead-code elimination of unused results, constant folding, profile pollution — a hand-written \`nanoTime\` loop rarely measures what you think. JMH controls warm-up, forks fresh JVMs and consumes results with a \`Blackhole\` (see the JMH lesson).`,
    whyItExists: `Ahead-of-time compilers must optimise for every possible input. A JIT compiles after watching the **real** program on the **real** CPU, so it can make bets an AOT compiler cannot — devirtualise interface calls, drop never-taken branches, specialise for the classes actually loaded — and pay for wrong bets with deoptimisation instead of wrong answers. Tiering exists because there is a trade-off: compiling early with C1 gives fast warm-up, compiling late with C2 gives fast peak performance, and tiering gets most of both.`,
    whenToUse: [
      'Explain warm-up, latency spikes after deployment and "it gets faster after a minute" behaviour.',
      'Write small, focused methods and keep hot call sites monomorphic where the design naturally allows it.',
      'Investigate a performance regression with PrintCompilation, PrintInlining or JITWatch after a profiler points at hot code.',
      'Decide between JIT warm-up, Leyden AOT caches (JDK 24+) and GraalVM Native Image for start-up-sensitive services.',
      'Benchmark small pieces of code only with JMH, never with hand-written timing loops.',
    ],
    whenNotToUse: [
      'Do not manually inline methods, avoid interfaces or merge classes "for the JIT" without a profile proving a problem.',
      'Do not tune JIT flags (thresholds, inlining limits) in production as a first resort — they are global and version-specific.',
      'Do not rely on PrintCompilation output or timings in tests: they vary between runs, machines and JDK versions.',
      'Do not reach for -Xcomp or -Xint to "fix" performance; they remove the profile-guided machinery that makes Java fast.',
    ],
    examples: [
      {
        id: 'r-jit-call-site-shapes',
        title: 'Monomorphic, bimorphic and megamorphic call sites',
        runnable: true,
        code: `import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

public class Main {
    interface Shape { double area(); }
    record Square(double side) implements Shape { public double area() { return side * side; } }
    record Rect(double w, double h) implements Shape { public double area() { return w * h; } }
    record Triangle(double b, double h) implements Shape { public double area() { return b * h / 2; } }

    // A tiny stand-in for the type profile HotSpot keeps at each call site
    static String shape(Set<Class<?>> seen) {
        return switch (seen.size()) {
            case 1 -> "monomorphic";
            case 2 -> "bimorphic";
            default -> "megamorphic";
        };
    }

    static void site(String name, List<Shape> shapes) {
        Set<Class<?>> seen = new LinkedHashSet<>();
        double total = 0;
        for (int i = 0; i < 100_000; i++) {
            Shape s = shapes.get(i % shapes.size());
            seen.add(s.getClass());
            total += s.area();          // the virtual call site
        }
        System.out.println(name + ": " + seen.size() + " receiver type(s) -> "
                + shape(seen) + ", total = " + (long) total);
    }

    public static void main(String[] args) {
        site("site A", List.of(new Square(2)));
        site("site B", List.of(new Square(2), new Rect(1, 3)));
        site("site C", List.of(new Square(2), new Rect(1, 3), new Triangle(2, 3)));
    }
}`,
        expectedOutput: `site A: 1 receiver type(s) -> monomorphic, total = 400000
site B: 2 receiver type(s) -> bimorphic, total = 350000
site C: 3 receiver type(s) -> megamorphic, total = 333334`,
        explanation: 'The program records which receiver classes reach the `s.area()` call, just as HotSpot\'s tier-3 profile does. In a real JVM, site A would be inlined behind one type guard, site B behind two, and site C would usually fall back to an interface (itable) dispatch. Note that each `site(...)` invocation runs the **same** bytecode call site, so in the real JVM its profile accumulates across all three calls and ends up megamorphic — a small example of profile pollution. The totals are identical however the call is compiled.',
      },
      {
        id: 'r-jit-deopt-same-answer',
        title: 'Speculate, deoptimise, same answer',
        runnable: true,
        code: `public class Main {
    interface Discount { long apply(long cents); }

    static final class NoDiscount implements Discount {
        public long apply(long cents) { return cents; }
    }

    static final class TenPercent implements Discount {
        public long apply(long cents) { return cents - cents / 10; }
    }

    static long checkout(Discount d, long cents) {
        return d.apply(cents);             // profiled call site
    }

    public static void main(String[] args) {
        Discount none = new NoDiscount();
        long total = 0;
        for (int i = 0; i < 200_000; i++) {
            total += checkout(none, 1_000);    // only NoDiscount seen: JIT may inline it
        }
        System.out.println("phase 1 total: " + total);

        Discount sale = new TenPercent();      // a new receiver type appears
        total = 0;
        for (int i = 0; i < 200_000; i++) {
            total += checkout(i % 2 == 0 ? none : sale, 1_000);
        }
        System.out.println("phase 2 total: " + total);
        System.out.println("same answer as the interpreter: " + (total == 100_000L * 1_000 + 100_000L * 900));
    }
}`,
        expectedOutput: `phase 1 total: 200000000
phase 2 total: 190000000
same answer as the interpreter: true`,
        explanation: 'In phase 1 `checkout` becomes hot while only `NoDiscount` has been seen (and `TenPercent` has not even been loaded), so C2 can inline `NoDiscount.apply` — effectively `return cents` — behind a type guard. In phase 2 the guard fails, the compiled code hits an uncommon trap, is marked "made not entrant", and execution continues in the interpreter until a bimorphic version is compiled. Run it with `-XX:+PrintCompilation` to watch this happen; the printed totals never change.',
      },
      {
        id: 'r-jit-escape-analysis',
        title: 'Allocations that escape analysis can remove',
        runnable: true,
        code: `public class Main {
    record Point(int x, int y) {
        Point plus(Point o) { return new Point(x + o.x, y + o.y); }
        int lengthSquared() { return x * x + y * y; }
    }

    // Each call allocates two Points that never leave the method:
    // after inlining, escape analysis can replace them with plain ints.
    static int distanceSquared(int x1, int y1, int dx, int dy) {
        Point p = new Point(x1, y1);
        Point q = p.plus(new Point(dx, dy));
        return q.lengthSquared();
    }

    public static void main(String[] args) {
        for (int round = 1; round <= 3; round++) {
            long sum = 0;
            for (int i = 0; i < 1_000_000; i++) {
                sum += distanceSquared(i % 10, i % 7, 1, 2);
            }
            System.out.println("round " + round + ": " + sum);
        }
    }
}`,
        expectedOutput: `round 1: 67499975
round 2: 67499975
round 3: 67499975`,
        explanation: 'Round 1 starts in the interpreter and is likely finished by OSR-compiled code; later rounds run C2 code in which `plus` and `lengthSquared` are inlined and the three `Point` objects per call are scalar-replaced, so the loop allocates nothing. The output proves the important part: every round computes the same sum. To observe the allocation difference, compare `-prof gc` in JMH with `-XX:+DoEscapeAnalysis` (the default) and `-XX:-DoEscapeAnalysis`.',
      },
      {
        id: 'r-jit-diagnostic-flags',
        title: 'Diagnostic flags for watching the JIT',
        runnable: false,
        code: `# One line per compilation: timestamp, id, flags (% = OSR, ! = has handlers), tier, method
java -XX:+PrintCompilation Main

# The same events through unified logging (JDK 9+)
java -Xlog:jit+compilation=debug Main

# Why was (or was not) a call inlined?
java -XX:+UnlockDiagnosticVMOptions -XX:+PrintInlining Main

# Full XML compilation log for JITWatch
java -XX:+UnlockDiagnosticVMOptions -XX:+LogCompilation -XX:LogFile=jit.log Main

# Compare: C1 only (fast warm-up) and no JIT at all
java -XX:TieredStopAtLevel=1 Main
java -Xint Main

# Inspect a running JVM
jcmd <pid> Compiler.codecache
jcmd <pid> Compiler.queue`,
        explanation: 'These are command lines, not Java. Their output differs from run to run (timing, compile IDs, thread scheduling), which is exactly why lessons and tests should never assert on it. Diagnostic flags are for investigation, not for permanent production use.',
      },
    ],
    walkthrough: {
      exampleId: 'r-jit-deopt-same-answer',
      steps: [
        { lines: [2, 10], text: 'An interface with two implementations. Both are `final` classes, but the call through the interface is still a virtual (invokeinterface) call that the JVM must dispatch at run time.' },
        { lines: [12, 14], text: '`checkout` contains one call site, `d.apply(cents)`. Its tier-3 profile records which receiver classes arrive there.' },
        { lines: [17, 21], text: 'Phase 1: 200,000 calls with only `NoDiscount`. The invocation counter of `checkout` and the back-edge counter of the loop cross their thresholds; C1 then C2 compile the code (the loop in `main` via OSR). With a monomorphic profile, C2 inlines `NoDiscount.apply` behind a cheap class check.' },
        { lines: [22, 22], text: 'The result is printed. Compiled or not, the total is 200,000 × 1,000.' },
        { lines: [24, 28], text: 'Phase 2: `TenPercent` is loaded and starts arriving at the same call site. The type guard fails, the compiled code hits an **uncommon trap** and is deoptimised: the frame is rebuilt for the interpreter and execution continues there. Later the method is recompiled with a bimorphic profile.' },
        { lines: [29, 30], text: 'Half the calls charge 1,000 and half 900, so the total is 190,000,000. The final line checks it against the arithmetic answer: the JIT changed speed, never semantics.' },
      ],
    },
    realWorld: {
      title: 'The latency spike after every deployment',
      scenario: `A payment API on Kubernetes showed p99 latency of 900 ms for the first two minutes after each rollout, then settled at 40 ms. Logs showed nothing wrong. Running one pod with \`-XX:+PrintCompilation\` revealed thousands of tier-3 and tier-4 compilations in those two minutes: requests were served by the interpreter and C1 code while C2 caught up, and the few compiler threads in a 1-CPU container were saturated.

The team (1) raised the container CPU request so compiler threads were not starved, (2) added a readiness probe that waits for a scripted warm-up of the main endpoints before the pod receives traffic, and (3) on JDK 25 trialled an AOT cache from a training run (JEP 483 / JEP 515) to start with loaded classes and existing profiles. A separate investigation with JITWatch found a hot validation method of 1,200 bytes of bytecode that was "too big" to inline; splitting off its rarely used error-reporting branch let C2 inline the fast path. Nothing in the business logic changed.`,
    },
    commonMistakes: [
      {
        mistake: 'Timing code with System.nanoTime in a loop and drawing conclusions from the number.',
        why: 'The loop mixes interpreted, C1 and C2 (often OSR) code, and C2 may remove work whose result is unused or fold constant inputs.',
        fix: 'Use JMH with warm-up, forks and a Blackhole, and treat the result as a hypothesis to confirm in the real application.',
      },
      {
        mistake: 'Avoiding small methods, getters or interfaces because "method calls are slow".',
        why: 'Hot small methods are inlined, so the call disappears. Monomorphic interface calls are devirtualised behind a guard.',
        fix: 'Write clear, small methods. Optimise only where a profiler and PrintInlining show a real problem, such as a megamorphic hot call site or a method that is too big to inline.',
      },
      {
        mistake: 'Writing one giant method for "performance".',
        why: 'Large methods exceed inlining limits (FreqInlineSize) or, above 8000 bytes of bytecode, are not compiled at all by default, and they give the optimiser more to analyse.',
        fix: 'Move rarely executed paths (error handling, logging) into separate methods so the hot path stays small enough to inline.',
      },
      {
        mistake: 'Believing the JIT can change program results.',
        why: 'Optimisations must preserve Java semantics as defined by the JLS and the memory model. What looks like a JIT bug is almost always a data race or reliance on unspecified behaviour that compiled code exposes.',
        fix: 'Fix the race (proper synchronisation or volatile) instead of disabling the JIT. Genuine JIT bugs exist but are rare and are reproduced with -Xint for comparison.',
      },
    ],
    checks: [
      {
        id: 'r4-c1',
        kind: 'mcq',
        dimension: 'runtime',
        prompt: 'With default tiered compilation, which path does a typical hot, non-trivial method follow?',
        options: [
          { id: 'a', text: 'Tier 0 (interpreter) → tier 3 (C1 with full profiling) → tier 4 (C2)' },
          { id: 'b', text: 'Tier 0 → tier 1 (C1 without profiling) → tier 4 (C2)' },
          { id: 'c', text: 'Straight to tier 4: C2 compiles every method when the class loads' },
          { id: 'd', text: 'Tier 4 first, then tier 0 if the method turns out to be cold' },
        ],
        correctOptionId: 'a',
        explanation: 'The interpreter counts calls; C1 at tier 3 compiles quickly and records a full profile; C2 at tier 4 uses that profile. Tier 1 is a dead end for trivial methods, because C2 could not improve them and no profile is collected there.',
      },
      {
        id: 'r4-c2',
        kind: 'mcq',
        dimension: 'runtime',
        prompt: '`main` runs a single loop of 50 million iterations and is called only once. How can its loop still run as compiled code?',
        options: [
          { id: 'a', text: 'It cannot; a method called once is always interpreted' },
          { id: 'b', text: 'The back-edge counter triggers on-stack replacement (OSR): a compiled version with an entry at the loop header takes over the running frame' },
          { id: 'c', text: 'The JVM restarts main from the beginning in compiled code' },
          { id: 'd', text: 'javac compiles long loops to native code ahead of time' },
        ],
        correctOptionId: 'b',
        explanation: 'Loops increment back-edge counters. When they cross the threshold, the JIT produces an OSR compilation (marked % in PrintCompilation) and migrates the live interpreter frame into it mid-loop.',
      },
      {
        id: 'r4-c3',
        kind: 'multi-select',
        dimension: 'conceptual',
        prompt: 'Which optimisations typically depend on inlining having happened first? Select all that apply.',
        options: [
          { id: 'a', text: 'Scalar replacement of an object created in a caller and passed to a small callee' },
          { id: 'b', text: 'Eliding a lock on an object that turns out never to escape' },
          { id: 'c', text: 'Constant-folding a value computed by a tiny helper method' },
          { id: 'd', text: 'Garbage collection of unreachable objects' },
          { id: 'e', text: 'Parsing the .class file' },
        ],
        correctOptionIds: ['a', 'b', 'c'],
        explanation: 'Escape analysis, lock elision and constant folding all need to see the callee\'s body: if an object is passed to a call that is not inlined, the compiler must assume it escapes. GC and class parsing are unrelated to the JIT\'s inlining decisions.',
        hints: ['Ask: does the optimiser need to see inside the called method to prove this is safe?'],
      },
      {
        id: 'r4-c4',
        kind: 'predict-output',
        dimension: 'runtime',
        prompt: 'The loop makes `count` hot with only `Dog` ever seen, so C2 may inline `Dog.sound()` behind a type guard. What does the program print?',
        code: `public class Main {
    static abstract class Animal { abstract String sound(); }
    static class Dog extends Animal { String sound() { return "woof"; } }
    static class Cat extends Animal { String sound() { return "meow"; } }

    static int count(Animal a) { return a.sound().length(); }

    public static void main(String[] args) {
        Animal dog = new Dog();
        int total = 0;
        for (int i = 0; i < 100_000; i++) total += count(dog);
        total += count(new Cat());
        System.out.println(total + " " + new Cat().sound());
    }
}`,
        options: [
          { id: 'a', text: '400004 meow' },
          { id: 'b', text: '400004 woof' },
          { id: 'c', text: '400000 meow' },
          { id: 'd', text: 'A ClassCastException, because the compiled code assumed Dog' },
        ],
        correctOptionId: 'a',
        explanation: '100,000 × 4 plus 4 for "meow" is 400004, and a Cat says "meow". When the Cat arrives, the type guard fails and the JVM deoptimises (or the compiled code takes its slow path). Speculation can never change results.',
      },
      {
        id: 'r4-c5',
        kind: 'mcq',
        dimension: 'interview',
        prompt: 'A hot `list.forEach(handler)` call site receives five different handler classes evenly. What does C2 usually do with the `handler.accept(...)` call inside?',
        options: [
          { id: 'a', text: 'Inlines all five implementations behind type checks' },
          { id: 'b', text: 'Treats it as megamorphic: no inlining, dispatch through the interface table' },
          { id: 'c', text: 'Refuses to compile the method' },
          { id: 'd', text: 'Converts the calls to static calls at class-load time' },
        ],
        correctOptionId: 'b',
        explanation: 'HotSpot profiles at most two receiver types per call site. With more types and none dominating, the call is megamorphic and goes through itable/vtable dispatch, which also blocks optimisations that need the callee\'s body. Shared library code such as forEach is often megamorphic because every caller pollutes its profile.',
      },
      {
        id: 'r4-c6',
        kind: 'mcq',
        dimension: 'debugging',
        prompt: 'A hand-written benchmark reports that a loop computing a sum takes 0.3 ns per iteration, even for expensive work. The sum is never printed. What is the most likely explanation?',
        options: [
          { id: 'a', text: 'The CPU executes several billion iterations per second' },
          { id: 'b', text: 'C2 removed the computation as dead code because its result is unused' },
          { id: 'c', text: 'The garbage collector cached the result' },
          { id: 'd', text: 'System.nanoTime is broken on this machine' },
        ],
        correctOptionId: 'b',
        explanation: 'Dead-code elimination deletes work with no observable effect. JMH prevents this by returning results from @Benchmark methods or sinking them into a Blackhole.',
      },
    ],
    challengeIds: [],
    masteryCriteria: [
      'Name the five tiers and the normal, trivial and back-pressure paths between them.',
      'Explain invocation and back-edge counters, background compilation and OSR.',
      'Explain why inlining enables escape analysis, lock elision and constant folding, and what limits it.',
      'Classify a call site as monomorphic, bimorphic or megamorphic and predict what C2 does with it.',
      'Explain deoptimisation and why it never changes program results.',
      'Pick a suitable diagnostic (PrintCompilation, PrintInlining, JITWatch, JMH) for a given JIT question.',
    ],
    relatedLessonIds: ['r-memory-areas', 'r-class-loading', 'r-gc', 'p-bytecode', 'perf-jmh', 'perf-optimisation', 'cc-synchronization'],
    revision: [
      { id: 'r1', question: 'What are tiers 0 to 4?', answer: '0 interpreter; 1 C1 without profiling (trivial methods); 2 C1 with counters only (when C2 is backed up); 3 C1 with full profiling; 4 C2 using the profile.' },
      { id: 'r2', question: 'What is on-stack replacement?', answer: 'Compiling a long-running loop and switching the currently executing interpreter frame into the compiled code at the loop header, triggered by the back-edge counter.' },
      { id: 'r3', question: 'Why is inlining called the gateway optimisation?', answer: 'Once the callee\'s body is in the caller, the compiler can apply escape analysis, lock elision, constant folding, dead-code and range-check elimination across the former call boundary.' },
      { id: 'r4', question: 'What are monomorphic, bimorphic and megamorphic call sites?', answer: 'Call sites that have seen one, two, or three or more receiver classes. C2 inlines the first two behind type guards; megamorphic sites usually use vtable/itable dispatch.' },
      { id: 'r5', question: 'What triggers deoptimisation?', answer: 'A failed speculative guard (new receiver type, untaken branch, null), or class loading that invalidates a class hierarchy analysis dependency. The JVM rebuilds interpreter frames and continues with the same semantics.' },
    ],
  },
];
