import type { JvmClassEntry, JvmFrame, JvmHeapObject, JvmScenario, JvmThread, JvmValue } from '@/types/practice';

/*
 * Conceptual JVM simulations. Each step is a complete snapshot so the player
 * can step backwards exactly. Values are illustrative: real JVMs choose
 * addresses, layouts and GC timing themselves.
 */

type V = [name: string, value: string, ref?: string];
const vals = (list: V[]): JvmValue[] => list.map(([name, value, ref]) => (ref ? { name, value, ref } : { name, value }));
const frame = (method: string, line: number | undefined, locals: V[] = [], operandStack?: string[]): JvmFrame => ({
  method,
  line,
  locals: vals(locals),
  operandStack,
});
const thread = (frames: JvmFrame[], state: JvmThread['state'] = 'RUNNABLE', name = 'main', extra: Partial<JvmThread> = {}): JvmThread => ({
  name,
  state,
  frames,
  ...extra,
});
const obj = (id: string, type: string, fields: V[] = [], extra: Partial<JvmHeapObject> = {}): JvmHeapObject => ({
  id,
  type,
  fields: vals(fields),
  ...extra,
});
const cls = (name: string, status: JvmClassEntry['status'], statics: V[] = [], loader: JvmClassEntry['loader'] = 'application'): JvmClassEntry => ({
  name,
  status,
  loader,
  staticFields: statics.length ? vals(statics) : undefined,
});
const ARGS = obj('a1', 'String[]', [['length', '0']]);
const CORE = [cls('java.lang.Object', 'initialized', [], 'bootstrap'), cls('java.lang.String', 'initialized', [], 'bootstrap'), cls('java.lang.System', 'initialized', [], 'bootstrap')];

// ---------------------------------------------------------------------------
const lifecycleSource = `public class Main {
    static int base = 10;

    public static void main(String[] args) {
        int result = square(base) + 1;
        System.out.println(result);
    }

    static int square(int n) {
        return n * n;
    }
}`;

const lifecycle: JvmScenario = {
  id: 'lifecycle',
  title: 'From source code to a running program',
  summary: 'Follow javac, class loading, linking, initialisation and the first method calls of a tiny program.',
  concepts: ['javac', 'class loading', 'linking', 'static initialisation', 'stack frames'],
  relatedLessonIds: ['f-first-program', 'p-bytecode', 'p-packages-classpath'],
  source: lifecycleSource,
  steps: [
    {
      phase: 'compile',
      title: 'javac compiles Main.java to bytecode',
      explanation:
        'javac checks types and emits **Main.class**: a constant pool, field and method tables, and bytecode for each method. Nothing runs yet — this happens before the JVM even starts.',
      threads: [],
      heap: [],
      classes: [],
      bytecode: [
        { text: 'static {};' },
        { text: '   0: bipush 10' },
        { text: '   2: putstatic Main.base:I' },
        { text: 'public static void main(java.lang.String[]);' },
        { text: '   0: getstatic Main.base:I' },
        { text: '   3: invokestatic Main.square:(I)I' },
        { text: '   6: iconst_1' },
        { text: '   7: iadd' },
        { text: '   8: istore_1' },
        { text: '   9: getstatic java/lang/System.out' },
        { text: '  12: iload_1' },
        { text: '  13: invokevirtual java/io/PrintStream.println:(I)V' },
        { text: 'static int square(int);' },
        { text: '   0: iload_0' },
        { text: '   1: iload_0' },
        { text: '   2: imul' },
        { text: '   3: ireturn' },
      ],
    },
    {
      phase: 'load',
      title: 'The JVM starts and loads Main',
      explanation:
        '`java Main` starts the JVM. Core classes from java.base are already defined by the bootstrap loader. The **application class loader** delegates to its parents first, then finds Main.class on the classpath and creates the class in the method area (Metaspace).',
      threads: [thread([], 'NEW')],
      heap: [],
      classes: [...CORE, cls('Main', 'loaded')],
    },
    {
      phase: 'link',
      title: 'Linking: verify and prepare',
      explanation:
        '**Verification** checks the bytecode is type-safe. **Preparation** allocates static fields with default values — `base` is 0, not 10 yet. Symbolic references (like `square`) are resolved lazily, on first use.',
      threads: [thread([], 'NEW')],
      heap: [],
      classes: [...CORE, cls('Main', 'linked', [['base', '0']])],
    },
    {
      phase: 'initialize',
      title: 'Initialisation runs the static initialiser',
      explanation:
        'Before main can run, Main is **initialised**: its `<clinit>` method executes static field initialisers in source order, so `base` becomes 10. Initialisation happens once per class, on first active use.',
      line: 2,
      threads: [thread([frame('Main.<clinit>', 2, [], ['10'])])],
      heap: [],
      classes: [...CORE, cls('Main', 'initialized', [['base', '10']])],
      bytecode: [
        { text: 'static {};' },
        { text: '   0: bipush 10', active: true },
        { text: '   2: putstatic Main.base:I', active: true },
      ],
    },
    {
      phase: 'execute',
      title: 'main gets a stack frame',
      explanation:
        'The launcher creates the `args` array on the heap (empty here) and invokes main on the **main thread**. A **stack frame** holds main\'s local variables: slot 0 is `args`, slot 1 will be `result`.',
      line: 4,
      threads: [thread([frame('Main.main', 4, [['args', 'String[]', 'a1'], ['result', '(unset)']])])],
      heap: [ARGS],
      classes: [...CORE, cls('Main', 'initialized', [['base', '10']])],
    },
    {
      phase: 'execute',
      title: 'Calling square(base) pushes a new frame',
      explanation:
        '`getstatic` pushes base (10) onto main\'s operand stack, then `invokestatic` creates a new frame for square with parameter n = 10 — a **copy** of the value. The new frame is now on top of the stack.',
      line: 10,
      threads: [
        thread([
          frame('Main.main', 5, [['args', 'String[]', 'a1'], ['result', '(unset)']]),
          frame('Main.square', 10, [['n', '10']], ['10', '10']),
        ]),
      ],
      heap: [ARGS],
      classes: [...CORE, cls('Main', 'initialized', [['base', '10']])],
      bytecode: [
        { text: 'static int square(int);' },
        { text: '   0: iload_0', active: true },
        { text: '   1: iload_0', active: true },
        { text: '   2: imul' },
        { text: '   3: ireturn' },
      ],
    },
    {
      phase: 'execute',
      title: 'square returns; its frame is discarded',
      explanation:
        '`imul` multiplies the two 10s, `ireturn` pushes 100 onto the caller\'s operand stack and pops square\'s frame. main adds 1 and stores 101 in `result`.',
      line: 5,
      threads: [thread([frame('Main.main', 5, [['args', 'String[]', 'a1'], ['result', '101']])])],
      heap: [ARGS],
      classes: [...CORE, cls('Main', 'initialized', [['base', '10']])],
    },
    {
      phase: 'execute',
      title: 'println writes to standard output',
      explanation:
        '`System.out` is a static field holding a PrintStream object. invokevirtual dispatches println(int) on it, which converts 101 to text and writes it.',
      line: 6,
      threads: [thread([frame('Main.main', 6, [['args', 'String[]', 'a1'], ['result', '101']])])],
      heap: [ARGS, obj('ps', 'PrintStream', [['(System.out)', 'stdout']])],
      classes: [...CORE, cls('Main', 'initialized', [['base', '10']])],
      output: '101',
    },
    {
      phase: 'execute',
      title: 'main returns and the JVM exits',
      explanation:
        'main\'s frame is popped. With no other non-daemon threads alive, the JVM runs shutdown hooks and exits with status 0. All heap memory is released with the process.',
      threads: [thread([], 'TERMINATED')],
      heap: [],
      classes: [...CORE, cls('Main', 'initialized', [['base', '10']])],
      output: '101',
    },
  ],
};

// ---------------------------------------------------------------------------
const recursionSource = `public class Main {
    static int factorial(int n) {
        if (n <= 1) return 1;
        return n * factorial(n - 1);
    }

    public static void main(String[] args) {
        int answer = factorial(3);
        System.out.println(answer);
    }
}`;

const MAINF = (answer = '(unset)') => frame('Main.main', 8, [['args', 'String[]', 'a1'], ['answer', answer]]);
const recursion: JvmScenario = {
  id: 'recursion-frames',
  title: 'Stack frames during recursion',
  summary: 'Watch the call stack grow and unwind as factorial(3) recurses, and see why unbounded recursion overflows.',
  concepts: ['call stack', 'stack frames', 'recursion', 'StackOverflowError'],
  relatedLessonIds: ['f-methods'],
  source: recursionSource,
  steps: [
    {
      phase: 'execute',
      title: 'main calls factorial(3)',
      explanation: 'Each method call gets its own frame on the thread\'s stack with its own copy of `n`.',
      line: 8,
      threads: [thread([MAINF(), frame('factorial', 3, [['n', '3']])])],
      heap: [ARGS],
      classes: [cls('Main', 'initialized')],
    },
    {
      phase: 'execute',
      title: 'factorial(3) calls factorial(2)',
      explanation: 'n is 3, not ≤ 1, so it must compute `3 * factorial(2)`. The multiplication waits: 3 stays on this frame\'s operand stack while a new frame is pushed.',
      line: 4,
      threads: [thread([MAINF(), frame('factorial', 4, [['n', '3']], ['3']), frame('factorial', 3, [['n', '2']])])],
      heap: [ARGS],
      classes: [cls('Main', 'initialized')],
    },
    {
      phase: 'execute',
      title: 'factorial(2) calls factorial(1)',
      explanation: 'A third factorial frame. Three frames hold three different values of n at the same time.',
      line: 4,
      threads: [
        thread([MAINF(), frame('factorial', 4, [['n', '3']], ['3']), frame('factorial', 4, [['n', '2']], ['2']), frame('factorial', 3, [['n', '1']])]),
      ],
      heap: [ARGS],
      classes: [cls('Main', 'initialized')],
    },
    {
      phase: 'execute',
      title: 'Base case: factorial(1) returns 1',
      explanation: 'n ≤ 1, so the deepest call returns immediately. This base case is what stops the recursion; without it the stack keeps growing until **StackOverflowError**.',
      line: 3,
      threads: [thread([MAINF(), frame('factorial', 4, [['n', '3']], ['3']), frame('factorial', 4, [['n', '2']], ['2', '1'])])],
      heap: [ARGS],
      classes: [cls('Main', 'initialized')],
    },
    {
      phase: 'execute',
      title: 'Unwinding: 2 * 1 = 2',
      explanation: 'The frame for n = 2 resumes with the returned 1 on its operand stack, multiplies, and returns 2. Its frame is popped.',
      line: 4,
      threads: [thread([MAINF(), frame('factorial', 4, [['n', '3']], ['3', '2'])])],
      heap: [ARGS],
      classes: [cls('Main', 'initialized')],
    },
    {
      phase: 'execute',
      title: 'Unwinding: 3 * 2 = 6',
      explanation: 'The outermost factorial frame computes 6 and returns it to main.',
      line: 8,
      threads: [thread([MAINF('6')])],
      heap: [ARGS],
      classes: [cls('Main', 'initialized')],
    },
    {
      phase: 'execute',
      title: 'main prints 6',
      explanation: 'The stack is back to one frame. Recursion depth was 3, so 3 extra frames were needed at the peak. Java does not eliminate tail calls, so depth equals memory.',
      line: 9,
      threads: [thread([MAINF('6')])],
      heap: [ARGS],
      classes: [cls('Main', 'initialized')],
      output: '6',
    },
  ],
};

// ---------------------------------------------------------------------------
const referencesSource = `class Account {
    int balance;
    Account(int balance) { this.balance = balance; }
}

public class Main {
    static void deposit(Account acc, int amount) {
        acc.balance += amount;
        acc = new Account(0);
    }

    public static void main(String[] args) {
        Account a = new Account(50);
        Account b = a;
        deposit(a, 25);
        System.out.println(a.balance + " " + b.balance);
    }
}`;

const references: JvmScenario = {
  id: 'references',
  title: 'References, aliasing and pass-by-value',
  summary: 'See how variables hold references to heap objects, how aliases share an object, and why reassigning a parameter changes nothing for the caller.',
  concepts: ['heap', 'references', 'aliasing', 'pass-by-value'],
  relatedLessonIds: ['f-methods', 'o-classes-objects'],
  source: referencesSource,
  steps: [
    {
      phase: 'execute',
      title: 'new Account(50) allocates on the heap',
      explanation: '`new` allocates an Account object on the heap and runs the constructor. The local `a` holds a **reference** (#acc1) — not the object itself.',
      line: 13,
      threads: [thread([frame('Main.main', 13, [['args', 'String[]', 'a1'], ['a', 'Account', 'acc1']])])],
      heap: [ARGS, obj('acc1', 'Account', [['balance', '50']])],
      classes: [cls('Account', 'initialized'), cls('Main', 'initialized')],
    },
    {
      phase: 'execute',
      title: 'b = a copies the reference',
      explanation: 'Assignment copies the reference value. Now `a` and `b` point to the **same** object — they are aliases. Hover or tap a reference to highlight its object.',
      line: 14,
      threads: [thread([frame('Main.main', 14, [['args', 'String[]', 'a1'], ['a', 'Account', 'acc1'], ['b', 'Account', 'acc1']])])],
      heap: [ARGS, obj('acc1', 'Account', [['balance', '50']])],
      classes: [cls('Account', 'initialized'), cls('Main', 'initialized')],
    },
    {
      phase: 'execute',
      title: 'deposit(a, 25) receives copies',
      explanation: 'The deposit frame gets a copy of the reference (`acc` → #acc1) and a copy of 25. Java is always pass-by-value; for objects, the value passed is the reference.',
      line: 8,
      threads: [
        thread([
          frame('Main.main', 15, [['args', 'String[]', 'a1'], ['a', 'Account', 'acc1'], ['b', 'Account', 'acc1']]),
          frame('Main.deposit', 8, [['acc', 'Account', 'acc1'], ['amount', '25']]),
        ]),
      ],
      heap: [ARGS, obj('acc1', 'Account', [['balance', '50']])],
      classes: [cls('Account', 'initialized'), cls('Main', 'initialized')],
    },
    {
      phase: 'execute',
      title: 'Mutating through the reference',
      explanation: '`acc.balance += 25` follows the reference to the shared object and changes it. a, b and acc all see balance 75.',
      line: 8,
      threads: [
        thread([
          frame('Main.main', 15, [['args', 'String[]', 'a1'], ['a', 'Account', 'acc1'], ['b', 'Account', 'acc1']]),
          frame('Main.deposit', 8, [['acc', 'Account', 'acc1'], ['amount', '25']]),
        ]),
      ],
      heap: [ARGS, obj('acc1', 'Account', [['balance', '75']])],
      classes: [cls('Account', 'initialized'), cls('Main', 'initialized')],
    },
    {
      phase: 'execute',
      title: 'Reassigning the parameter',
      explanation: '`acc = new Account(0)` creates a second object and points the **local copy** `acc` at it. The caller\'s variables still point to #acc1.',
      line: 9,
      threads: [
        thread([
          frame('Main.main', 15, [['args', 'String[]', 'a1'], ['a', 'Account', 'acc1'], ['b', 'Account', 'acc1']]),
          frame('Main.deposit', 9, [['acc', 'Account', 'acc2'], ['amount', '25']]),
        ]),
      ],
      heap: [ARGS, obj('acc1', 'Account', [['balance', '75']]), obj('acc2', 'Account', [['balance', '0']])],
      classes: [cls('Account', 'initialized'), cls('Main', 'initialized')],
    },
    {
      phase: 'execute',
      title: 'deposit returns; #acc2 becomes unreachable',
      explanation: 'The deposit frame is popped, so nothing references #acc2 any more. It is now garbage, eligible for collection. main prints 75 75.',
      line: 16,
      threads: [thread([frame('Main.main', 16, [['args', 'String[]', 'a1'], ['a', 'Account', 'acc1'], ['b', 'Account', 'acc1']])])],
      heap: [ARGS, obj('acc1', 'Account', [['balance', '75']], { reachable: true }), obj('acc2', 'Account', [['balance', '0']], { reachable: false })],
      classes: [cls('Account', 'initialized'), cls('Main', 'initialized')],
      output: '75 75',
    },
  ],
};

// ---------------------------------------------------------------------------
const stringsSource = `public class Main {
    public static void main(String[] args) {
        String a = "java";
        String b = "java";
        String c = new String("java");
        String d = c.intern();
        String e = a + "!";
        System.out.println((a == b) + " " + (a == c) + " " + (a == d));
    }
}`;

const POOL_JAVA = obj('s1', 'String', [['value', '"java"']], { inStringPool: true, note: 'interned literal' });
const MAIN_STR = (locals: V[]) => frame('Main.main', undefined, [['args', 'String[]', 'a1'], ...locals]);
const strings: JvmScenario = {
  id: 'string-pool',
  title: 'The string pool and string identity',
  summary: 'See which strings share an object, what new String creates, what intern returns, and why == misleads.',
  concepts: ['string pool', 'interning', 'immutability', '== vs equals'],
  relatedLessonIds: ['t-strings'],
  source: stringsSource,
  steps: [
    {
      phase: 'execute',
      title: 'A literal resolves to a pooled String',
      explanation: 'The first time the literal "java" is used, the JVM resolves it to a String in the **string pool** (part of the heap since Java 7). `a` refers to it.',
      line: 3,
      threads: [thread([{ ...MAIN_STR([['a', 'String', 's1']]), line: 3 }])],
      heap: [ARGS, POOL_JAVA],
      classes: [cls('Main', 'initialized')],
    },
    {
      phase: 'execute',
      title: 'The same literal gives the same object',
      explanation: '`b = "java"` resolves to the pooled object too, so `a == b` is true. This is safe only because Strings are immutable.',
      line: 4,
      threads: [thread([{ ...MAIN_STR([['a', 'String', 's1'], ['b', 'String', 's1']]), line: 4 }])],
      heap: [ARGS, POOL_JAVA],
      classes: [cls('Main', 'initialized')],
    },
    {
      phase: 'execute',
      title: 'new String creates a separate object',
      explanation: '`new` always allocates. #s2 has the same characters (it can even share the internal byte array) but is a different object, so `a == c` is false while `a.equals(c)` is true.',
      line: 5,
      threads: [thread([{ ...MAIN_STR([['a', 'String', 's1'], ['b', 'String', 's1'], ['c', 'String', 's2']]), line: 5 }])],
      heap: [ARGS, POOL_JAVA, obj('s2', 'String', [['value', '"java"']], { note: 'not pooled' })],
      classes: [cls('Main', 'initialized')],
    },
    {
      phase: 'execute',
      title: 'intern() returns the pooled instance',
      explanation: '`c.intern()` looks up "java" in the pool and returns the existing #s1, so `a == d` is true.',
      line: 6,
      threads: [thread([{ ...MAIN_STR([['a', 'String', 's1'], ['b', 'String', 's1'], ['c', 'String', 's2'], ['d', 'String', 's1']]), line: 6 }])],
      heap: [ARGS, POOL_JAVA, obj('s2', 'String', [['value', '"java"']], { note: 'not pooled' })],
      classes: [cls('Main', 'initialized')],
    },
    {
      phase: 'execute',
      title: 'Concatenation at runtime builds a new String',
      explanation: '`a + "!"` is not a compile-time constant (a is not final), so a new String #s3 is built at runtime. It is not pooled unless you intern it.',
      line: 7,
      threads: [
        thread([{ ...MAIN_STR([['a', 'String', 's1'], ['b', 'String', 's1'], ['c', 'String', 's2'], ['d', 'String', 's1'], ['e', 'String', 's3']]), line: 7 }]),
      ],
      heap: [ARGS, POOL_JAVA, obj('s2', 'String', [['value', '"java"']], { note: 'not pooled' }), obj('s3', 'String', [['value', '"java!"']])],
      classes: [cls('Main', 'initialized')],
    },
    {
      phase: 'execute',
      title: 'Comparing identities',
      explanation: '== compares references: true (same pooled object), false (different objects), true (intern returned the pooled one). Use equals for text.',
      line: 8,
      threads: [
        thread([{ ...MAIN_STR([['a', 'String', 's1'], ['b', 'String', 's1'], ['c', 'String', 's2'], ['d', 'String', 's1'], ['e', 'String', 's3']]), line: 8 }]),
      ],
      heap: [ARGS, POOL_JAVA, obj('s2', 'String', [['value', '"java"']], { note: 'not pooled' }), obj('s3', 'String', [['value', '"java!"']])],
      classes: [cls('Main', 'initialized')],
      output: 'true false true',
    },
  ],
};

// ---------------------------------------------------------------------------
const gcSource = `import java.util.ArrayList;
import java.util.List;

public class Main {
    static List<byte[]> cache = new ArrayList<>();

    public static void main(String[] args) {
        byte[] temp = new byte[1024];
        cache.add(new byte[2048]);
        temp = null;
        for (int i = 0; i < 3; i++) {
            byte[] scratch = new byte[512];
        }
        System.gc();
    }
}`;

const GC_CLASSES = [cls('Main', 'initialized', [['cache', 'ArrayList', 'list']])];
const LIST = (reachable?: boolean, gen: 'young' | 'old' = 'young') => obj('list', 'ArrayList', [['elementData[0]', 'byte[2048]', 'b2']], { reachable, generation: gen });
const gc: JvmScenario = {
  id: 'garbage-collection',
  title: 'Reachability and garbage collection',
  summary: 'GC roots, the mark phase, collecting unreachable objects and promotion to the old generation.',
  concepts: ['GC roots', 'reachability', 'mark and sweep', 'generations', 'memory leaks'],
  relatedLessonIds: ['f-methods', 'c-collections-overview'],
  source: gcSource,
  steps: [
    {
      phase: 'execute',
      title: 'Objects are allocated in the young generation',
      explanation:
        'New objects are allocated in the **young generation** (Eden), typically in a thread-local allocation buffer — very fast pointer-bump allocation. The static `cache` list was created during class initialisation.',
      line: 8,
      threads: [thread([frame('Main.main', 8, [['args', 'String[]', 'a1'], ['temp', 'byte[]', 'b1']])])],
      heap: [ARGS, LIST(), obj('b1', 'byte[1024]', [], { generation: 'young' })],
      classes: GC_CLASSES,
    },
    {
      phase: 'execute',
      title: 'A static collection holds a reference',
      explanation: '`cache.add(...)` stores a reference to a new 2 KB array inside the list. Anything reachable from a static field stays alive as long as the class is loaded.',
      line: 9,
      threads: [thread([frame('Main.main', 9, [['args', 'String[]', 'a1'], ['temp', 'byte[]', 'b1']])])],
      heap: [ARGS, LIST(), obj('b1', 'byte[1024]', [], { generation: 'young' }), obj('b2', 'byte[2048]', [], { generation: 'young' })],
      classes: GC_CLASSES,
    },
    {
      phase: 'execute',
      title: 'Dropping the last reference',
      explanation: 'Setting `temp = null` removes the only reference to #b1. The object still occupies memory, but nothing can ever reach it again.',
      line: 10,
      threads: [thread([frame('Main.main', 10, [['args', 'String[]', 'a1'], ['temp', 'null']])])],
      heap: [ARGS, LIST(), obj('b1', 'byte[1024]', [], { generation: 'young' }), obj('b2', 'byte[2048]', [], { generation: 'young' })],
      classes: GC_CLASSES,
    },
    {
      phase: 'execute',
      title: 'Short-lived temporaries',
      explanation: 'Each loop iteration allocates a scratch array that becomes unreachable at the end of the iteration. Most objects die young — the observation generational collectors are built on.',
      line: 12,
      threads: [thread([frame('Main.main', 12, [['args', 'String[]', 'a1'], ['temp', 'null'], ['i', '2'], ['scratch', 'byte[]', 'b5']])])],
      heap: [
        ARGS,
        LIST(),
        obj('b1', 'byte[1024]', [], { generation: 'young' }),
        obj('b2', 'byte[2048]', [], { generation: 'young' }),
        obj('b3', 'byte[512]', [], { generation: 'young' }),
        obj('b4', 'byte[512]', [], { generation: 'young' }),
        obj('b5', 'byte[512]', [], { generation: 'young' }),
      ],
      classes: GC_CLASSES,
    },
    {
      phase: 'gc',
      title: 'Mark: trace from the GC roots',
      explanation:
        'A collection starts from **GC roots**: local variables in live stack frames, static fields, JNI references and others. The collector follows references and marks everything it can reach: args, the cache list and #b2. #b1, #b3, #b4 and #b5 are unreachable.',
      line: 14,
      threads: [thread([frame('Main.main', 14, [['args', 'String[]', 'a1'], ['temp', 'null']])])],
      heap: [
        { ...ARGS, reachable: true },
        LIST(true),
        obj('b1', 'byte[1024]', [], { generation: 'young', reachable: false }),
        obj('b2', 'byte[2048]', [], { generation: 'young', reachable: true }),
        obj('b3', 'byte[512]', [], { generation: 'young', reachable: false }),
        obj('b4', 'byte[512]', [], { generation: 'young', reachable: false }),
        obj('b5', 'byte[512]', [], { generation: 'young', reachable: false }),
      ],
      classes: GC_CLASSES,
    },
    {
      phase: 'gc',
      title: 'Collect: unreachable objects are reclaimed',
      explanation:
        'A young-generation collection copies live objects to a survivor space and reclaims Eden wholesale, so the cost depends on **live** objects, not garbage. `System.gc()` is only a hint; production code should not call it.',
      line: 14,
      threads: [thread([frame('Main.main', 14, [['args', 'String[]', 'a1'], ['temp', 'null']])])],
      heap: [
        { ...ARGS, reachable: true },
        LIST(true),
        obj('b1', 'byte[1024]', [], { generation: 'young', collected: true }),
        obj('b2', 'byte[2048]', [], { generation: 'young', reachable: true }),
        obj('b3', 'byte[512]', [], { generation: 'young', collected: true }),
        obj('b4', 'byte[512]', [], { generation: 'young', collected: true }),
        obj('b5', 'byte[512]', [], { generation: 'young', collected: true }),
      ],
      classes: GC_CLASSES,
    },
    {
      phase: 'gc',
      title: 'Survivors are eventually promoted',
      explanation:
        'Objects that survive several young collections are **promoted** to the old generation. A static cache that only grows keeps promoting objects — the classic Java "memory leak": memory that is reachable but no longer useful.',
      threads: [thread([frame('Main.main', 14, [['args', 'String[]', 'a1'], ['temp', 'null']])])],
      heap: [{ ...ARGS, reachable: true }, LIST(true, 'old'), obj('b2', 'byte[2048]', [], { generation: 'old', reachable: true })],
      classes: GC_CLASSES,
    },
  ],
};

// ---------------------------------------------------------------------------
const threadsSource = `public class Main {
    static int counter = 0;
    static final Object lock = new Object();

    static void increment() {
        synchronized (lock) {
            counter++;
        }
    }

    public static void main(String[] args) throws InterruptedException {
        Thread t1 = new Thread(Main::increment, "worker-1");
        Thread t2 = new Thread(Main::increment, "worker-2");
        t1.start();
        t2.start();
        t1.join();
        t2.join();
        System.out.println(counter);
    }
}`;

const T_CLASSES = (counter: string) => [cls('Main', 'initialized', [['counter', counter], ['lock', 'Object', 'lock']])];
const LOCK = obj('lock', 'Object', [['monitor', 'free']]);
const LOCKED = (owner: string) => obj('lock', 'Object', [['monitor', `owned by ${owner}`]]);
const MAIN_T = (line: number) => frame('Main.main', line, [['args', 'String[]', 'a1'], ['t1', 'Thread', 'th1'], ['t2', 'Thread', 'th2']]);
const THREAD_OBJS = [obj('th1', 'Thread', [['name', '"worker-1"']]), obj('th2', 'Thread', [['name', '"worker-2"']])];
const threads: JvmScenario = {
  id: 'threads-monitors',
  title: 'Threads, stacks and monitors',
  summary: 'Each thread has its own stack; they share the heap. See a monitor serialise two increments and why join makes the result visible.',
  concepts: ['threads', 'synchronized', 'monitors', 'BLOCKED state', 'happens-before'],
  relatedLessonIds: ['fn-lambdas', 'c-iteration'],
  source: threadsSource,
  steps: [
    {
      phase: 'threads',
      title: 'Two Thread objects are created',
      explanation: 'Creating a Thread object does not start an OS thread. Both are in state **NEW**. The method reference Main::increment is their Runnable.',
      line: 13,
      threads: [thread([MAIN_T(13)]), thread([], 'NEW', 'worker-1'), thread([], 'NEW', 'worker-2')],
      heap: [ARGS, LOCK, ...THREAD_OBJS],
      classes: T_CLASSES('0'),
    },
    {
      phase: 'threads',
      title: 'start() creates new call stacks',
      explanation: 'start() asks the JVM for real threads. Each gets its **own stack** with its own frames, while all threads share the **heap** and static fields — which is exactly why shared state needs coordination.',
      line: 15,
      threads: [thread([MAIN_T(15)]), thread([frame('Main.increment', 6)], 'RUNNABLE', 'worker-1'), thread([frame('Main.increment', 6)], 'RUNNABLE', 'worker-2')],
      heap: [ARGS, LOCK, ...THREAD_OBJS],
      classes: T_CLASSES('0'),
    },
    {
      phase: 'threads',
      title: 'worker-1 acquires the monitor',
      explanation: '`synchronized (lock)` makes worker-1 the owner of lock\'s **monitor**. Only one thread can own a monitor at a time.',
      line: 7,
      threads: [
        thread([MAIN_T(16)], 'WAITING', 'main', { waitingFor: 'worker-1 to finish (join)' }),
        thread([frame('Main.increment', 7)], 'RUNNABLE', 'worker-1', { holdsLock: 'lock' }),
        thread([frame('Main.increment', 6)], 'BLOCKED', 'worker-2', { waitingFor: 'lock' }),
      ],
      heap: [ARGS, LOCKED('worker-1'), ...THREAD_OBJS],
      classes: T_CLASSES('0'),
    },
    {
      phase: 'threads',
      title: 'worker-2 is BLOCKED',
      explanation:
        'worker-2 reached the synchronized block but cannot enter: its state is **BLOCKED** until the monitor is released. Without the lock, both could read 0 and both write 1 — a lost update, because counter++ is read-modify-write, not atomic.',
      line: 7,
      threads: [
        thread([MAIN_T(16)], 'WAITING', 'main', { waitingFor: 'worker-1 to finish (join)' }),
        thread([frame('Main.increment', 7)], 'RUNNABLE', 'worker-1', { holdsLock: 'lock' }),
        thread([frame('Main.increment', 6)], 'BLOCKED', 'worker-2', { waitingFor: 'lock' }),
      ],
      heap: [ARGS, LOCKED('worker-1'), ...THREAD_OBJS],
      classes: T_CLASSES('1'),
    },
    {
      phase: 'threads',
      title: 'Release, then worker-2 enters',
      explanation:
        'Leaving the block releases the monitor. The release **happens-before** the next acquisition of the same monitor, so worker-2 is guaranteed to see counter = 1 and writes 2. worker-1 terminates.',
      line: 7,
      threads: [
        thread([MAIN_T(17)], 'WAITING', 'main', { waitingFor: 'worker-2 to finish (join)' }),
        thread([], 'TERMINATED', 'worker-1'),
        thread([frame('Main.increment', 7)], 'RUNNABLE', 'worker-2', { holdsLock: 'lock' }),
      ],
      heap: [ARGS, LOCKED('worker-2'), ...THREAD_OBJS],
      classes: T_CLASSES('2'),
    },
    {
      phase: 'threads',
      title: 'join makes the result visible to main',
      explanation: 'Both workers have terminated. A thread\'s termination happens-before another thread returns from join() on it, so main is guaranteed to see 2.',
      line: 18,
      threads: [thread([MAIN_T(18)]), thread([], 'TERMINATED', 'worker-1'), thread([], 'TERMINATED', 'worker-2')],
      heap: [ARGS, LOCK, ...THREAD_OBJS],
      classes: T_CLASSES('2'),
      output: '2',
    },
  ],
};

export const JVM_SCENARIO_LIST: JvmScenario[] = [lifecycle, recursion, references, strings, gc, threads];
