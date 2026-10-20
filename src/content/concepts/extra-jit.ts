import type { LessonConcepts } from '@/types/curriculum';

/** Concept page for the extra module-8 lesson on JIT compiler internals. */
export const jitConcepts: Record<string, LessonConcepts> = {
  'r-jit-compiler': {
    textbook: {
      definition:
        'A **just-in-time (JIT) compiler** is a component of the Java Virtual Machine\'s execution engine that translates bytecode into native machine code while the program runs, rather than before execution. In HotSpot, methods begin in the interpreter; those whose invocation or loop counters exceed thresholds are compiled in the background by the C1 and C2 compilers under **tiered compilation**. The optimising compiler applies **profile-guided** optimisations such as inlining and **speculative optimisation**, protecting each assumption with a guard; when an assumption is invalidated, the compiled code is discarded through **deoptimisation**. Compilation affects only performance, never the semantics defined by the JLS.',
      terms: [
        { term: 'Tiered compilation', meaning: 'HotSpot\'s scheme of execution levels 0-4, from the interpreter through C1 variants to C2, through which a method moves as it becomes hotter.' },
        { term: 'Profile-guided optimisation', meaning: 'Optimisation driven by data collected at run time, such as branch frequencies and receiver types at each call site.' },
        { term: 'Inlining', meaning: 'Replacing a method call with a copy of the callee\'s body, which removes the call and lets the merged code be optimised as one unit.' },
        { term: 'Speculative optimisation', meaning: 'Optimisation based on an assumption that held so far, such as only one receiver class, guarded by a cheap run-time check.' },
        { term: 'Deoptimisation', meaning: 'Transferring execution from compiled code back to the interpreter, rebuilding interpreter frames, when a speculative assumption no longer holds.' },
        { term: 'On-stack replacement (OSR)', meaning: 'Switching a method that is currently running a long loop from interpreted to compiled code at a loop header.' },
      ],
      source: 'HotSpot Glossary of Terms (OpenJDK); Java Performance by Scott Oaks, chapter on the JIT compiler',
    },
    interviewDefinition:
      'HotSpot runs bytecode in an **interpreter** that counts method invocations and loop back-edges. Hot code is compiled in the background: **C1** compiles quickly and records profiles (tier 3), then **C2** (tier 4) uses those profiles to **inline** callees and **speculate** — devirtualising monomorphic and bimorphic call sites, pruning untaken branches, removing non-escaping allocations and locks. Each speculation is guarded; when a guard fails or class loading breaks an assumption, the JVM **deoptimises** back to the interpreter with identical semantics and recompiles later.',
    interviewFollowUps: [
      {
        question: 'Why are small methods effectively free in Java?',
        answer: 'Hot call sites to methods under `FreqInlineSize` (325 bytes of bytecode on common 64-bit platforms) are inlined, and tiny methods under `MaxInlineSize` (35 bytes) are inlined even at cold sites. The call disappears, and the merged code can be optimised as one unit. Giant methods are the problem: they miss inlining, and above 8000 bytes are not compiled at all by default.',
      },
      {
        question: 'What is the difference between a monomorphic, bimorphic and megamorphic call site?',
        answer: 'The type profile records the receiver classes seen at each virtual call. One class: C2 inlines it behind a single type guard. Two: it inlines both behind an if/else on the class. Three or more with no dominant type: it falls back to vtable/itable dispatch, which also blocks optimisations that need the callee\'s body.',
      },
      {
        question: 'What is on-stack replacement and when does it matter?',
        answer: 'When a method that is called rarely runs a long loop, the back-edge counter triggers an OSR compilation with an entry point at the loop header; the live interpreter frame is migrated into it. It matters mostly for `main`-style loops and naive benchmarks, because OSR code can be optimised differently from a normally compiled method.',
      },
      {
        question: 'Can the JIT change what a correct program prints?',
        answer: 'No. Optimisations must preserve the semantics defined by the JLS and the Java Memory Model. But a program with a **data race** may behave differently once compiled — for example a non-volatile `while (!stop)` flag read can be hoisted out of the loop. That is a bug in the program, not the JIT.',
      },
    ],
    mnemonic: {
      device: '"Measure, Tack, Tailor, Alter" — the JIT is a tailor',
      expansion: [
        { key: 'Measure', meaning: 'Tier 0: the interpreter counts calls and loop back-edges before any cutting starts' },
        { key: 'Tack', meaning: 'Tier 3: C1 quickly bastes the seams — usable code fast — and keeps measuring with a full profile' },
        { key: 'Tailor', meaning: 'Tier 4: C2 cuts to the measured shape — inlining, devirtualising the classes actually seen, removing allocations and locks' },
        { key: 'Alter', meaning: 'Deoptimise: when the customer changes shape (a new class, a new branch), unpick the suit and re-measure' },
        { key: 'Never the customer', meaning: 'A tailor changes the suit, never the person: the JIT changes speed, never results' },
      ],
      visual: 'A tailor with a tape measure (counters) pins a quick basted suit (C1), then sews a perfectly fitted one (C2). When the customer turns up wearing a backpack (a new receiver class), the tailor unpicks a seam (deoptimisation) instead of forcing the suit on.',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'The barista who starts your usual',
        body: 'A barista who has served you a flat white every morning starts making it as you walk in (speculation). It saves time — until the day you order tea. A good barista then sets the flat white aside and makes tea (deoptimisation); you still get exactly what you ordered. After a week of tea, the barista learns the new habit (recompilation with a fresh profile).',
      },
      {
        kind: 'insight',
        title: 'Inlining is the gateway, not the goal',
        body: 'Saving a call instruction is minor. What matters is that once `p.plus(q)` is pasted into its caller, escape analysis can see the new `Point` never leaves, scalar replacement turns it into two `int`s, and constant folding and range-check elimination work across the old boundary. Anything that blocks inlining — a huge method, a megamorphic call, a native or deeply nested call — blocks all of that too.',
      },
      {
        kind: 'real-world',
        title: 'Cold instances during a traffic spike',
        body: 'When autoscaling adds instances during a sale or an incident, the new JVMs join cold: interpreted and C1 code, compiler threads busy, p99 latency high exactly when load is highest. Teams answer with warm-up before readiness, enough CPU for compiler threads, CDS/AOT caches (JEP 483 and JEP 515 on JDK 24/25), or — for very short-lived processes — GraalVM Native Image, which trades peak performance for instant start-up.',
      },
      {
        kind: 'angle',
        title: 'Shared code is megamorphic code',
        body: 'Profiles belong to a **bytecode call site**, not to the caller. The `action.accept(t)` inside a library\'s `forEach` sees every lambda in your application, so it is usually megamorphic. That is why a stream benchmark can slow down simply because another test in the same JVM used a different lambda first (profile pollution), and why JMH runs each benchmark in a fresh fork.',
      },
      {
        kind: 'angle',
        title: 'The JIT exposes races, it does not cause them',
        body: 'A thread spinning on a plain `boolean stop` field may run forever once compiled: C2 may legally read the field once and hoist it out of the loop, since no synchronisation says another thread can change it. Under the interpreter it "worked". The fix is `volatile` (or proper synchronisation), not `-Xint`.',
      },
    ],
    diagrams: [
      {
        id: 'r-jit-call-site-map',
        kind: 'concept',
        title: 'Call-site shapes and what C2 does with them',
        caption: 'The same line of source compiles to very different machine code depending on how many receiver classes the profile saw there. Only monomorphic and bimorphic sites get inlined; a new class at an inlined site triggers deoptimisation.',
        explanation: [
          'Start at the **Call site** on the left, a virtual call such as shape.area() together with the type profile of receiver classes seen there.',
          'A **Monomorphic** site saw one class, so C2 emits **Guard + inline**: a cheap class check followed by Square.area() pasted directly into the caller.',
          'A **Bimorphic** site saw two classes, so C2 emits **if Square else Rect** with both bodies inlined. Both shapes sit in the **Inlined by C2** group.',
          'A **Megamorphic** site saw three or more classes with none dominant, so it compiles to an **itable / vtable call**, an indirect jump that cannot be inlined.',
          'Without inlining, **Optimisations lost** follows: escape analysis and constant folding cannot see across the call.',
          'The dashed Circle arrives arrow shows the risk of speculation: a new class fails the guard and the JVM must **Deoptimise** that code.',
          'Takeaway: the number of receiver classes actually seen at a line decides how fast that line runs.',
        ],
        cols: 4,
        rows: 3,
        nodes: [
          { id: 'site', label: 'Call site', detail: 'shape.area() + type profile', col: 0, row: 1, tone: 'primary' },
          { id: 'mono', label: 'Monomorphic', detail: '1 class seen', col: 1, row: 0, tone: 'success' },
          { id: 'bi', label: 'Bimorphic', detail: '2 classes seen', col: 1, row: 1, tone: 'accent' },
          { id: 'mega', label: 'Megamorphic', detail: '3+ classes, none dominant', col: 1, row: 2, tone: 'warning' },
          { id: 'monoCode', label: 'Guard + inline', detail: 'Square.area() pasted in', col: 2, row: 0, shape: 'note', tone: 'success' },
          { id: 'biCode', label: 'if Square else Rect', detail: 'both bodies inlined', col: 2, row: 1, shape: 'note', tone: 'accent' },
          { id: 'megaCode', label: 'itable / vtable call', detail: 'indirect jump, no inlining', col: 2, row: 2, shape: 'note', tone: 'warning' },
          { id: 'deopt', label: 'Deoptimise', detail: 'guard failed: new class', col: 3, row: 0, shape: 'pill', tone: 'danger' },
          { id: 'blocked', label: 'Optimisations lost', detail: 'no escape analysis across the call', col: 3, row: 2, shape: 'pill', tone: 'danger' },
        ],
        edges: [
          { from: 'site', to: 'mono' },
          { from: 'site', to: 'bi' },
          { from: 'site', to: 'mega' },
          { from: 'mono', to: 'monoCode' },
          { from: 'bi', to: 'biCode' },
          { from: 'mega', to: 'megaCode' },
          { from: 'monoCode', to: 'deopt', label: 'Circle arrives', dashed: true },
          { from: 'megaCode', to: 'blocked' },
        ],
        groups: [{ label: 'Inlined by C2', fromCol: 1, toCol: 2, fromRow: 0, toRow: 1, tone: 'success' }],
      },
      {
        id: 'r-jit-hot-method-life',
        kind: 'flow',
        title: 'The life of a hot method',
        caption: 'Counters decide when to compile; compilation happens on background threads while the program keeps running. Long loops switch to compiled code mid-flight through OSR, and a failed speculation sends execution back to the interpreter, which profiles again before recompiling.',
        explanation: [
          'The **Interpreter** runs every method first and counts calls and loop back-edges. When a count passes a limit, the **Threshold crossed** box fires.',
          'Normally the method is put on the **Compile queue**, so background compiler threads do the work while the program keeps running.',
          'If one call is stuck in a hot loop, the JIT builds an **OSR version** instead, entered at the loop header so the running loop switches to compiled code mid-flight.',
          'The method is first compiled by **C1, tier 3**, which is quick and gathers a full profile. If it stays hot, **C2, tier 4** recompiles it with inlining and speculation and installs it in the **Code cache**.',
          'The dashed new class seen arrow is a broken assumption: it hits an **Uncommon trap**, and the JVM must **Deoptimise**, marking the code not entrant and rebuilding interpreter frames.',
          'Execution continues with **Resume in tier 0**, giving the same results, and the dashed recompile later arrow shows the method climbing the tiers again with a fresh profile.',
        ],
        cols: 5,
        rows: 3,
        nodes: [
          { id: 'interp', label: 'Interpreter', detail: 'tier 0: counts calls, loops', col: 0, row: 0, tone: 'neutral' },
          { id: 'thr', label: 'Threshold crossed', detail: 'invocation or back-edge', col: 1, row: 0, tone: 'warning' },
          { id: 'queue', label: 'Compile queue', detail: 'background compiler threads', col: 2, row: 0, shape: 'cylinder', tone: 'neutral' },
          { id: 'c1', label: 'C1, tier 3', detail: 'quick code + full profile', col: 3, row: 0, tone: 'primary' },
          { id: 'c2', label: 'C2, tier 4', detail: 'inlined, speculative', col: 4, row: 0, tone: 'success' },
          { id: 'osr', label: 'OSR version', detail: 'entered at the loop header', col: 1, row: 1, tone: 'accent' },
          { id: 'trap', label: 'Uncommon trap', detail: 'guard or assumption fails', col: 3, row: 1, tone: 'danger' },
          { id: 'cache', label: 'Code cache', detail: 'installed machine code', col: 4, row: 1, shape: 'cylinder', tone: 'accent' },
          { id: 'back', label: 'Resume in tier 0', detail: 'same results, profile again', col: 0, row: 2, shape: 'pill', tone: 'neutral' },
          { id: 'deopt', label: 'Deoptimise', detail: 'made not entrant, frames rebuilt', col: 3, row: 2, tone: 'danger' },
        ],
        edges: [
          { from: 'interp', to: 'thr' },
          { from: 'thr', to: 'queue', label: 'enqueue' },
          { from: 'thr', to: 'osr', label: 'hot loop in one call' },
          { from: 'queue', to: 'c1' },
          { from: 'c1', to: 'c2', label: 'still hot' },
          { from: 'c2', to: 'cache', label: 'install' },
          { from: 'cache', to: 'trap', label: 'new class seen', dashed: true },
          { from: 'trap', to: 'deopt' },
          { from: 'deopt', to: 'back', label: 'resume' },
          { from: 'back', to: 'interp', label: 'recompile later', dashed: true },
        ],
      },
      {
        id: 'r-jit-inline-escape',
        kind: 'flow',
        title: 'Inlining unlocks escape analysis',
        caption: 'Top row: the callees are inlined, so the compiler can prove the Point objects never leave the method and replaces them with plain ints. Bottom row: if inlining fails, the object is passed to opaque code and must be allocated on the heap.',
        explanation: [
          'The source method **distanceSquared()** creates three Point objects per call. Once it is hot in C2, the compiler tries to **Inline callees** such as plus() and lengthSquared().',
          'With the callees inlined, **Escape analysis** can see every use of each Point and proves that none leaves the method.',
          'That allows **Scalar replacement**: each Point is broken into its int fields, held in registers, and no object is allocated at all.',
          'The dashed limit hit arrow is the failure path: a callee that is too big or megamorphic is **Not inlined**, so its body is invisible to the compiler.',
          'The compiler must then **Assume it escapes**, and every Point becomes a real **Heap allocation**, costing a TLAB bump now and garbage collection work later.',
          'Takeaway: inlining is what unlocks escape analysis, so small, monomorphic methods are what let the JIT remove allocations.',
        ],
        cols: 4,
        rows: 2,
        nodes: [
          { id: 'src', label: 'distanceSquared()', detail: '3 x new Point per call', col: 0, row: 0, shape: 'note' },
          { id: 'inline', label: 'Inline callees', detail: 'plus() and lengthSquared()', col: 1, row: 0, tone: 'primary' },
          { id: 'ea', label: 'Escape analysis', detail: 'no Point leaves the method', col: 2, row: 0, tone: 'accent' },
          { id: 'sr', label: 'Scalar replacement', detail: 'fields become ints in registers', col: 3, row: 0, shape: 'pill', tone: 'success' },
          { id: 'noinl', label: 'Not inlined', detail: 'too big or megamorphic', col: 1, row: 1, tone: 'warning' },
          { id: 'esc', label: 'Assume it escapes', detail: 'callee body is invisible', col: 2, row: 1, tone: 'warning' },
          { id: 'heap', label: 'Heap allocation', detail: 'TLAB bump + later GC work', col: 3, row: 1, shape: 'pill', tone: 'danger' },
        ],
        edges: [
          { from: 'src', to: 'inline', label: 'hot in C2' },
          { from: 'inline', to: 'ea' },
          { from: 'ea', to: 'sr', label: 'does not escape' },
          { from: 'inline', to: 'noinl', label: 'limit hit', dashed: true },
          { from: 'noinl', to: 'esc' },
          { from: 'esc', to: 'heap' },
        ],
      },
    ],
    variants: [
      {
        title: 'Compilation tiers in HotSpot',
        intro: 'Tiered compilation is the default in the server VM since Java 8. The usual path is 0 → 3 → 4; `-XX:TieredStopAtLevel=1` caps compilation at C1, and `-Xint` stays in tier 0.',
        items: [
          { name: 'Tier 0 — interpreter', summary: 'Executes bytecode directly, counts invocations and back-edges, and profiles hot code. Every method starts here and deoptimised code returns here.', support: 'supported' },
          { name: 'Tier 1 — C1, no profiling', summary: 'Fully optimised C1 code for trivial methods (getters, constant returns) where C2 could not do better. A terminal tier: no profile is collected.', support: 'supported' },
          { name: 'Tier 2 — C1, counters only', summary: 'C1 code with invocation and back-edge counters but no detailed profile. Used while the C2 queue is long, then the method moves to tier 3.', support: 'supported' },
          { name: 'Tier 3 — C1, full profiling', summary: 'Quickly compiled C1 code that records branch frequencies, receiver types and type-check outcomes for C2. Slower than tier 2 because of the profiling overhead.', support: 'supported' },
          { name: 'Tier 4 — C2', summary: 'The optimising compiler: inlining, escape analysis, loop optimisations, speculative devirtualisation, all guided by the tier-3 profile.', support: 'supported', note: 'Graal can replace C2 in GraalVM via JVMCI.' },
        ],
      },
      {
        title: 'Call-site shapes',
        intro: 'Determined per bytecode call site from the receiver types the profile has seen (HotSpot records up to two, `TypeProfileWidth`).',
        items: [
          { name: 'Monomorphic', summary: 'One receiver class. C2 inlines it behind a single cheap class check; if class hierarchy analysis proves only one implementation is loaded, even the guard can go.', code: 'List<Shape> squares = ...;\nfor (Shape s : squares) total += s.area();' },
          { name: 'Bimorphic', summary: 'Two receiver classes. C2 inlines both behind an if/else on the class; a third class arriving triggers deoptimisation.', code: 'Discount d = vip ? new TenPercent() : new NoDiscount();\nd.apply(cents);' },
          { name: 'Megamorphic', summary: 'Three or more classes. Dispatch goes through the vtable (classes) or itable (interfaces) and the callee is not inlined, unless one class dominates (about 90% of calls), in which case C2 may inline that one with a guard.', note: 'Common in shared framework and library code: one call site serves every caller.', code: 'for (Handler h : handlers) h.handle(event); // many Handler classes' },
          { name: 'Static, private, final and constructor calls', summary: 'Not virtual at all (invokestatic, invokespecial, or a final method): the target is known statically, so they inline whenever size and depth limits allow.' },
        ],
      },
      {
        title: 'Key JIT optimisations',
        items: [
          { name: 'Inlining', summary: 'Pastes the callee\'s body into the caller. Governed by bytecode size (MaxInlineSize 35, FreqInlineSize 325), call frequency and nesting depth (MaxInlineLevel). Enables almost everything else.', support: 'supported' },
          { name: 'Escape analysis and scalar replacement', summary: 'Objects that never escape the compiled region are broken into their fields, held in registers, and never allocated on the heap.', support: 'partial', note: 'C2 gives up on some patterns, e.g. when different objects merge at a control-flow join, or for large arrays.' },
          { name: 'Lock elision and lock coarsening', summary: 'Removes `synchronized` on objects that do not escape (e.g. a local StringBuffer) and merges adjacent lock regions on the same object into one.', support: 'supported' },
          { name: 'Loop optimisations', summary: 'Unrolling, range-check elimination, loop-invariant code motion, loop unswitching and auto-vectorisation (SIMD) of simple array loops.', support: 'supported', note: 'For explicit SIMD there is the Vector API, still an incubator module.' },
          { name: 'Intrinsics', summary: 'Hand-written machine code substituted for selected JDK methods such as System.arraycopy, Math.sqrt, Integer.bitCount, String.equals and Arrays.equals.', support: 'supported' },
          { name: 'Speculative devirtualisation and CHA', summary: 'Uses profiles and the loaded class hierarchy to turn virtual calls into direct, inlinable ones, with guards or recorded dependencies that trigger deoptimisation if invalidated.', support: 'supported' },
          { name: 'Constant folding, dead-code and null-check elimination', summary: 'Computes constant expressions at compile time, deletes code with no observable effect, and replaces explicit null checks with hardware traps on the rare path.', support: 'supported', note: 'The reason naive benchmarks that ignore their results look impossibly fast.' },
        ],
      },
      {
        title: 'Ahead-of-time options around the JIT',
        items: [
          { name: 'Class Data Sharing (CDS)', summary: 'A memory-mapped archive of parsed classes; a default JDK archive ships since Java 12, and AppCDS covers application classes.', support: 'supported' },
          { name: 'Leyden AOT cache', summary: 'A training run records loaded and linked classes (JEP 483, Java 24) and method profiles (JEP 515, Java 25) so the next start is faster and the JIT has profiles from the beginning. The normal JIT still runs.', support: 'supported', code: 'java -XX:AOTCacheOutput=app.aot -jar app.jar   # training run (JDK 25)\njava -XX:AOTCache=app.aot -jar app.jar         # production' },
          { name: 'GraalVM Native Image', summary: 'Whole-program AOT compilation to a native executable under a closed-world assumption: instant start-up and small memory, but no runtime recompilation and reflection must be configured.', support: 'partial', note: 'A GraalVM tool, not part of the OpenJDK JDK.' },
          { name: 'jaotc (JEP 295)', summary: 'The experimental AOT compiler added in Java 9.', support: 'not-supported', note: 'Removed together with the experimental Graal JIT in Java 17 (JEP 410).' },
        ],
      },
    ],
    deepDive: [
      {
        title: 'How deoptimisation rebuilds a frame that no longer exists',
        body: 'Compiled code keeps values in registers, has inlined frames merged into one, and may have removed objects entirely. To deoptimise, the JIT records **debug information** at every safepoint and uncommon trap: which bytecode index each inlined frame was at, where each local lives, and how to re-materialise scalar-replaced objects. On a trap the JVM reconstructs one interpreter frame per inlined method, allocates any eliminated objects for real, marks the nmethod **not entrant** so new calls avoid it, and continues interpreting. If the same method keeps trapping, HotSpot stops speculating on that point or eventually gives up compiling it — a hidden cause of "this method is mysteriously slow" that PrintCompilation and JITWatch reveal.',
        sources: [
          { label: 'HotSpot Glossary of Terms (OpenJDK)', url: 'https://openjdk.org/groups/hotspot/docs/HotSpotGlossary.html' },
          { label: 'Java Performance by Scott Oaks (O\'Reilly), chapter on the JIT compiler' },
        ],
      },
      {
        title: 'Inlining limits are about bytecode, not source lines',
        body: '`MaxInlineSize` and `FreqInlineSize` count **bytecode bytes**, so string concatenation, lambdas, assertions and boxing can make a short-looking method big. `-XX:+UnlockDiagnosticVMOptions -XX:+PrintInlining` prints each decision with a reason such as "inline (hot)", "too big", "hot method too big" or "already compiled into a big method". The JDK itself splits rare paths out of hot methods (for example throwing helpers) so the fast path stays under the limits — a technique worth copying in your own hot code, but only after a profile proves it matters.',
        sources: [
          { label: 'Java HotSpot VM options (java command reference, Java 21)', url: 'https://docs.oracle.com/en/java/javase/21/docs/specs/man/java.html' },
          { label: 'JITWatch (AdoptOpenJDK project) for visualising LogCompilation output' },
        ],
      },
      {
        title: 'Escape analysis has blind spots, and Graal handles some of them',
        body: 'C2\'s escape analysis looks at the whole compiled method: if an object escapes on **any** path — even a rare error path — it is treated as escaping everywhere, and objects that merge at a control-flow join often defeat scalar replacement. Graal implements **partial escape analysis**, which allocates the object only on the branch where it actually escapes and scalar-replaces it elsewhere. This is one reason Graal can beat C2 on allocation-heavy, abstraction-heavy code such as streams and Scala/Kotlin collections, while C2 often wins on tight numeric loops.',
        sources: [
          { label: 'Stadler, Würthinger, Mössenböck: Partial Escape Analysis and Scalar Replacement for Java (CGO 2014)' },
          { label: 'JEP 243: Java-Level JVM Compiler Interface', url: 'https://openjdk.org/jeps/243' },
          { label: 'JEP 317: Experimental Java-Based JIT Compiler', url: 'https://openjdk.org/jeps/317' },
        ],
      },
      {
        title: 'JIT, AOT and the Leyden middle way',
        body: 'A JIT pays at start-up (interpretation, compilation, profiling) to win at peak: it optimises for the classes and branches that actually occur. Closed-world AOT (GraalVM Native Image) inverts the trade: instant start-up, but no profile-guided recompilation and limits on dynamic features. OpenJDK\'s own experimental AOT compiler (jaotc, JEP 295) was removed in Java 17 (JEP 410) for lack of use. Project Leyden instead keeps the full JVM and moves work into a **training run**: JEP 483 (Java 24) caches loaded and linked classes, JEP 514 (Java 25) simplifies creating the cache with `-XX:AOTCacheOutput`, and JEP 515 (Java 25) stores method profiles so C2 can compile hot code sooner.',
        sources: [
          { label: 'JEP 410: Remove the Experimental AOT and JIT Compiler', url: 'https://openjdk.org/jeps/410' },
          { label: 'JEP 483: Ahead-of-Time Class Loading & Linking', url: 'https://openjdk.org/jeps/483' },
          { label: 'JEP 514: Ahead-of-Time Command-Line Ergonomics', url: 'https://openjdk.org/jeps/514' },
          { label: 'JEP 515: Ahead-of-Time Method Profiling', url: 'https://openjdk.org/jeps/515' },
        ],
      },
      {
        title: 'When the code cache fills up',
        body: 'Since Java 9 the code cache is split into three segments — non-method code (the interpreter, stubs), **profiled** code (tiers 2–3) and **non-profiled** code (tiers 1 and 4) — so short-lived C1 code does not fragment the space for long-lived C2 code (JEP 197). Large applications with many hot methods can still exhaust `ReservedCodeCacheSize`; the JVM then prints "CodeCache is full. Compiler has been disabled." and new hot code stays interpreted, which shows up as a gradual slowdown rather than an error. Watch it with `jcmd <pid> Compiler.codecache` or the CodeHeap memory pools in JMX.',
        sources: [{ label: 'JEP 197: Segmented Code Cache', url: 'https://openjdk.org/jeps/197' }],
      },
    ],
  },
};
