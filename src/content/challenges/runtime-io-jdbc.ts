import type { CodingChallenge } from '@/types/curriculum';

/**
 * Practice for the JVM runtime, I/O and JDBC modules. Everything is plain Java
 * driven by stdin: the JVM challenges simulate the runtime's own algorithms and
 * the JDBC challenges model a database with in-memory tables.
 */
export const runtimeIoJdbcChallenges: CodingChallenge[] = [
  {
    id: 'ch-leaky-cache',
    title: 'Plug the leaky cache',
    moduleId: 'jvm-runtime',
    lessonId: 'r-gc',
    difficulty: 'intermediate',
    kind: 'debugging',
    dimension: 'debugging',
    concepts: ['memory leaks via reachable references', 'GC roots', 'LinkedHashMap access order', 'removeEldestEntry', 'bounded caches'],
    description: `A product service memoises lookups in a \`static\` \`HashMap\`. Nothing is ever removed, so every key the service has ever seen stays **strongly reachable** from a GC root (the static field). The garbage collector can only reclaim unreachable objects, so the old generation fills up until the JVM throws \`OutOfMemoryError: Java heap space\`. This is the classic Java memory leak: not forgotten \`free()\` calls, but references you keep and never use again.

Fix the leak by turning the cache into a **bounded LRU cache** holding at most \`capacity\` entries:

- \`get k\` prints \`k=<value>\` on a hit or \`k miss\` on a miss. A hit makes \`k\` the most recently used entry; a miss changes nothing.
- \`put k v\` stores or replaces the value and makes \`k\` the most recently used entry. If the cache now holds more than \`capacity\` entries, remove the least recently used one and print \`evict <key>\`. Replacing an existing key never evicts.

Input: \`capacity\` (at least 1), then n, then n operations.

Output: the lines above as they happen, then \`hits=<h> misses=<m>\`, \`size=<entries>\` and \`order: <keys from least to most recently used>\` (or \`order: (empty)\`).`,
    starterCode: `import java.io.*;
import java.util.*;

public class Main {
    // Every key ever looked up stays strongly reachable from this static field,
    // so the garbage collector can never reclaim the entries.
    static final Map<String, String> CACHE = new HashMap<>();

    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int capacity = Integer.parseInt(in.readLine().trim());
        int n = Integer.parseInt(in.readLine().trim());
        int hits = 0, misses = 0;
        for (int i = 0; i < n; i++) {
            String[] p = in.readLine().trim().split(" ");
            if (p[0].equals("put")) {
                CACHE.put(p[1], p[2]);
            } else {
                String value = CACHE.get(p[1]);
                if (value == null) {
                    misses++;
                    System.out.println(p[1] + " miss");
                } else {
                    hits++;
                    System.out.println(p[1] + "=" + value);
                }
            }
        }
        System.out.println("hits=" + hits + " misses=" + misses);
        System.out.println("size=" + CACHE.size());
        System.out.println("order: " + (CACHE.isEmpty() ? "(empty)" : String.join(" ", CACHE.keySet())));
    }
}`,
    solution: `import java.io.*;
import java.util.*;

public class Main {
    /** Bounded, access-ordered cache: the least recently used entry is dropped on overflow. */
    static final class LruCache<K, V> extends LinkedHashMap<K, V> {
        private final int capacity;

        LruCache(int capacity) {
            super(16, 0.75f, true);   // true = access order, not insertion order
            this.capacity = capacity;
        }

        @Override
        protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
            if (size() > capacity) {
                System.out.println("evict " + eldest.getKey());
                return true;
            }
            return false;
        }
    }

    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int capacity = Integer.parseInt(in.readLine().trim());
        int n = Integer.parseInt(in.readLine().trim());
        Map<String, String> cache = new LruCache<>(capacity);
        int hits = 0, misses = 0;
        for (int i = 0; i < n; i++) {
            String[] p = in.readLine().trim().split(" ");
            if (p[0].equals("put")) {
                cache.put(p[1], p[2]);
            } else {
                String value = cache.get(p[1]);
                if (value == null) {
                    misses++;
                    System.out.println(p[1] + " miss");
                } else {
                    hits++;
                    System.out.println(p[1] + "=" + value);
                }
            }
        }
        System.out.println("hits=" + hits + " misses=" + misses);
        System.out.println("size=" + cache.size());
        System.out.println("order: " + (cache.isEmpty() ? "(empty)" : String.join(" ", cache.keySet())));
    }
}`,
    solutionExplanation:
      'The leak is not a GC bug: the collector only reclaims unreachable objects, and a static map keeps every entry reachable from a GC root forever. Bounding the cache fixes it. LinkedHashMap with accessOrder = true keeps entries ordered from least to most recently used, and both get and put of an existing key move that key to the end. After every insertion it calls removeEldestEntry, so returning true when size() > capacity drops the least recently used entry, which then becomes unreachable and collectable. Replacing an existing key does not grow the map, so it never evicts. All operations stay O(1).',
    complexity: { time: 'O(1) per operation', space: 'O(capacity), no longer O(distinct keys ever seen)' },
    hints: [
      'Ask what keeps the old entries alive: the static field is a GC root, so everything in the map is reachable.',
      'new LinkedHashMap<>(16, 0.75f, true) orders entries by access instead of insertion.',
      'Override removeEldestEntry to return true (and print the eviction) when size() exceeds the capacity.',
      'A get that misses must not change the order or the size.',
    ],
    tests: [
      { id: 't1', name: 'Hit refreshes recency', stdin: '2\n7\nput a 1\nput b 2\nget a\nput c 3\nget b\nget c\nget a\n', expectedStdout: 'a=1\nevict b\nb miss\nc=3\na=1\nhits=3 misses=1\nsize=2\norder: c a' },
      { id: 't2', name: 'Capacity 1 and replacing a key', stdin: '1\n5\nput x 1\nput x 2\nget x\nput y 3\nget x\n', expectedStdout: 'x=2\nevict x\nx miss\nhits=1 misses=1\nsize=1\norder: y' },
      { id: 't3', name: 'Re-put moves key to most recent', stdin: '3\n8\nget nope\nput a 1\nput b 2\nput c 3\nput a 9\nput d 4\nget a\nget b\n', expectedStdout: 'nope miss\nevict b\na=9\nb miss\nhits=1 misses=2\nsize=3\norder: c d a', hidden: true },
      { id: 't4', name: 'Only misses', stdin: '2\n2\nget a\nget b\n', expectedStdout: 'a miss\nb miss\nhits=0 misses=2\nsize=0\norder: (empty)', hidden: true },
      { id: 't5', name: 'Gets protect hot keys', stdin: '3\n6\nput k1 v1\nput k2 v2\nput k3 v3\nget k1\nget k2\nput k4 v4\n', expectedStdout: 'k1=v1\nk2=v2\nevict k3\nhits=2 misses=0\nsize=3\norder: k1 k2 k4', hidden: true },
    ],
    staticChecks: [
      { id: 's1', description: 'Keep entries in recency order (LinkedHashMap or a deque)', pattern: 'LinkedHashMap|Deque|LinkedList', mustMatch: true },
    ],
  },
  {
    id: 'ch-class-init-order',
    title: 'Class initialisation order',
    moduleId: 'jvm-runtime',
    lessonId: 'r-class-loading',
    difficulty: 'intermediate',
    kind: 'coding',
    dimension: 'coding',
    concepts: ['class initialisation triggers', 'superclass first', 'compile-time constants', 'recursive initialisation', 'Class.forName'],
    description: `Simulate when the JVM **initialises** classes (runs their static initialisers) in a single thread, following JLS 12.4.

Input: n, then n class declarations \`<Name> <Superclass or -> [<Used>...]\`. The optional names after the superclass are classes that the static initialiser of \`<Name>\` touches in a way that triggers their initialisation, in order. Then m, then m actions \`<action> <Name>\`.

Actions that **trigger** initialisation of the class: \`new\` (create an instance), \`call\` (invoke a static method), \`get\` (read a static field that is not a constant), \`set\` (assign a static field) and \`forName\` (\`Class.forName(name)\`, which initialises by default).

Actions that **do not**: \`const\` (read a \`static final\` compile-time constant, which is inlined by javac), \`array\` (create an array \`Name[]\`) and \`literal\` (evaluate \`Name.class\`).

Initialising a class C that is not yet initialised:
1. Mark C as in progress.
2. Initialise its superclass first (recursively).
3. C's static initialiser starts: C counts as initialised **now**.
4. Initialise each class C's initialiser uses, in order.

A request to initialise a class that is already initialised, **or currently in progress** on this thread (a cycle), does nothing: the JVM lets the recursive request return immediately, which is why cyclic static initialisers can observe default values.

Output: for each action, \`<action> <Name>: <classes initialised by it, in order, comma separated>\` or \`<action> <Name>: -\`. Then \`not initialised: <names in declaration order>\` or \`not initialised: (none)\`.`,
    starterCode: `import java.io.*;
import java.util.*;

public class Main {
    record Decl(String superName, List<String> uses) {}

    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(in.readLine().trim());
        Map<String, Decl> classes = new LinkedHashMap<>();
        for (int i = 0; i < n; i++) {
            String[] p = in.readLine().trim().split("\\\\s+");
            classes.put(p[0], new Decl(p[1], List.of(Arrays.copyOfRange(p, 2, p.length))));
        }
        int m = Integer.parseInt(in.readLine().trim());
        for (int i = 0; i < m; i++) {
            String[] e = in.readLine().trim().split("\\\\s+");
            List<String> initialised = new ArrayList<>();
            // TODO: decide whether this action triggers initialisation and,
            //       if so, initialise the class (superclass first, then its static uses).
            System.out.println(e[0] + " " + e[1] + ": " + (initialised.isEmpty() ? "-" : String.join(", ", initialised)));
        }
        System.out.println("not initialised: (none)");
    }
}`,
    solution: `import java.io.*;
import java.util.*;

public class Main {
    record Decl(String superName, List<String> uses) {}

    enum State { NONE, IN_PROGRESS, DONE }

    static final Map<String, Decl> classes = new LinkedHashMap<>();
    static final Map<String, State> state = new HashMap<>();
    static final Set<String> TRIGGERS = Set.of("new", "call", "get", "set", "forName");

    /** JLS 12.4.2, single thread: mark in progress, initialise the superclass, then run the static initialiser. */
    static void initialise(String name, List<String> out) {
        if (state.get(name) != State.NONE) return;   // done, or in progress on this thread: recursive request
        state.put(name, State.IN_PROGRESS);
        Decl d = classes.get(name);
        if (!d.superName().equals("-")) initialise(d.superName(), out);
        out.add(name);                                // the static initialiser starts running now
        for (String used : d.uses()) initialise(used, out);
        state.put(name, State.DONE);
    }

    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(in.readLine().trim());
        for (int i = 0; i < n; i++) {
            String[] p = in.readLine().trim().split("\\\\s+");
            classes.put(p[0], new Decl(p[1], List.of(Arrays.copyOfRange(p, 2, p.length))));
            state.put(p[0], State.NONE);
        }
        int m = Integer.parseInt(in.readLine().trim());
        for (int i = 0; i < m; i++) {
            String[] e = in.readLine().trim().split("\\\\s+");
            List<String> initialised = new ArrayList<>();
            if (TRIGGERS.contains(e[0])) initialise(e[1], initialised);
            System.out.println(e[0] + " " + e[1] + ": " + (initialised.isEmpty() ? "-" : String.join(", ", initialised)));
        }
        List<String> untouched = new ArrayList<>();
        for (String name : classes.keySet()) if (state.get(name) == State.NONE) untouched.add(name);
        System.out.println("not initialised: " + (untouched.isEmpty() ? "(none)" : String.join(" ", untouched)));
    }
}`,
    solutionExplanation:
      'Initialisation is lazy: only active uses (new, static method calls, non-constant static field reads and writes, reflection such as Class.forName) trigger it. A compile-time constant is inlined into the caller by javac, so the declaring class is never touched, and creating an array or evaluating Name.class does not run static initialisers either. The recursive initialise method follows JLS 12.4.2 for a single thread: it marks the class in progress before initialising the superclass, records the class when its own static initialiser starts, and then initialises whatever that initialiser uses. Because the in-progress mark is set first, a cycle (A uses B, B uses A, or a superclass that touches its subclass) returns immediately instead of recursing forever, which is exactly how the JVM lets a cyclic initialiser see default values.',
    complexity: { time: 'O(n + total uses + m): each class is initialised at most once', space: 'O(n) for state plus recursion depth' },
    hints: [
      'Keep a three-valued state per class: not initialised, in progress, done.',
      'Set "in progress" before touching the superclass, otherwise a cycle recurses forever.',
      'The class counts as initialised after its superclass, but before the classes its initialiser uses.',
      'const, array and literal never trigger anything.',
    ],
    tests: [
      { id: 't1', name: 'Superclass and static dependencies', stdin: '4\nA - C\nB A\nC -\nD B\n5\nget B\nconst D\nnew D\narray C\ncall C\n', expectedStdout: 'get B: A, C, B\nconst D: -\nnew D: D\narray C: -\ncall C: -\nnot initialised: (none)' },
      { id: 't2', name: 'Cyclic static initialisers', stdin: '3\nApp - Config\nConfig - Registry\nRegistry - Config\n2\ncall App\nget Registry\n', expectedStdout: 'call App: App, Config, Registry\nget Registry: -\nnot initialised: (none)' },
      { id: 't3', name: 'Superclass touches its subclass', stdin: '2\nBase - Child\nChild Base\n2\nnew Child\nnew Base\n', expectedStdout: 'new Child: Base, Child\nnew Base: -\nnot initialised: (none)', hidden: true },
      { id: 't4', name: 'Passive uses then forName', stdin: '3\nX -\nY X\nZ -\n4\nliteral Y\narray Z\nconst X\nforName Y\n', expectedStdout: 'literal Y: -\narray Z: -\nconst X: -\nforName Y: X, Y\nnot initialised: Z', hidden: true },
      { id: 't5', name: 'Initialises only once', stdin: '2\nP -\nQ -\n3\nset Q\nset Q\nconst P\n', expectedStdout: 'set Q: Q\nset Q: -\nconst P: -\nnot initialised: P', hidden: true },
    ],
  },
  {
    id: 'boss-retained-heap',
    title: 'Boss: heap dump retained sizes',
    moduleId: 'jvm-runtime',
    lessonId: 'r-gc',
    difficulty: 'advanced',
    kind: 'boss',
    dimension: 'coding',
    concepts: ['reachability from GC roots', 'mark phase', 'unreachable cycles', 'dominators', 'retained vs shallow size'],
    description: `Module capstone: the core of a heap-dump analyser such as Eclipse MAT.

The heap is a directed graph of objects. Input: n, then n lines \`<id> <shallowSize> [<referencedId>...]\` (every referenced id is declared; references may repeat, point to the object itself or form cycles). The last line is \`roots: <id>...\` listing the GC roots (it may list no ids, and an id may repeat).

1. **Mark**: an object is live if it is reachable from any root. Everything else is garbage, including unreachable cycles: a tracing collector does not count references.
2. **Dominators**: object D dominates object X when every path from the roots to X passes through D (every object dominates itself). Equivalently, X becomes unreachable if D is removed. The **retained size** of D is the total shallow size of all live objects D dominates, i.e. the memory freed if D alone became garbage.
3. The **immediate dominator** of X is its closest strict dominator (the one that every other strict dominator of X also dominates). If no single object dominates X (it is a root, or is reachable from two independent paths), print \`ROOT\`.

Output:
- \`live=<count> objects, <bytes> bytes\`
- one line per live object, \`<id> shallow=<s> retained=<r> idom=<id or ROOT>\`, sorted by retained size (largest first), ties by id in ascending String order
- \`garbage: <ids in input order> (<bytes> bytes)\` or \`garbage: (none)\`

At most 200 objects, so an O(n * (n + edges)) approach is fine.`,
    starterCode: `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(in.readLine().trim());
        List<String> ids = new ArrayList<>();
        Map<String, Long> size = new HashMap<>();
        Map<String, List<String>> refs = new HashMap<>();
        for (int i = 0; i < n; i++) {
            String[] p = in.readLine().trim().split("\\\\s+");
            ids.add(p[0]);
            size.put(p[0], Long.parseLong(p[1]));
            refs.put(p[0], List.of(Arrays.copyOfRange(p, 2, p.length)));
        }
        String[] rootLine = in.readLine().trim().split("\\\\s+");
        List<String> roots = List.of(Arrays.copyOfRange(rootLine, 1, rootLine.length));

        // TODO: mark the live objects, compute each one's retained size and
        //       immediate dominator, and report the garbage.
        System.out.println("live=0 objects, 0 bytes");
        System.out.println("garbage: (none)");
    }
}`,
    solution: `import java.io.*;
import java.util.*;

public class Main {
    static List<String> ids = new ArrayList<>();
    static Map<String, Long> size = new HashMap<>();
    static Map<String, List<String>> refs = new HashMap<>();
    static List<String> roots;

    /** Objects reachable from the roots when {@code removed} is treated as already gone. */
    static Set<String> mark(String removed) {
        Set<String> seen = new HashSet<>();
        Deque<String> stack = new ArrayDeque<>();
        for (String r : roots) if (!r.equals(removed) && seen.add(r)) stack.push(r);
        while (!stack.isEmpty()) {
            for (String next : refs.get(stack.pop())) {
                if (!next.equals(removed) && seen.add(next)) stack.push(next);
            }
        }
        return seen;
    }

    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(in.readLine().trim());
        for (int i = 0; i < n; i++) {
            String[] p = in.readLine().trim().split("\\\\s+");
            ids.add(p[0]);
            size.put(p[0], Long.parseLong(p[1]));
            refs.put(p[0], List.of(Arrays.copyOfRange(p, 2, p.length)));
        }
        String[] rootLine = in.readLine().trim().split("\\\\s+");
        roots = List.of(Arrays.copyOfRange(rootLine, 1, rootLine.length));

        Set<String> live = mark(null);

        // dominated.get(x) = every live object that becomes unreachable without x (x included)
        Map<String, Set<String>> dominated = new HashMap<>();
        for (String x : ids) {
            if (!live.contains(x)) continue;
            Set<String> without = mark(x);
            Set<String> lost = new HashSet<>();
            for (String y : ids) if (live.contains(y) && !without.contains(y)) lost.add(y);
            dominated.put(x, lost);
        }

        List<String[]> rows = new ArrayList<>();
        long liveBytes = 0;
        for (String x : ids) {
            if (!live.contains(x)) continue;
            liveBytes += size.get(x);
            long retained = 0;
            for (String y : dominated.get(x)) retained += size.get(y);
            // immediate dominator: the closest strict dominator, i.e. the one dominating the fewest objects
            String idom = "ROOT";
            int best = Integer.MAX_VALUE;
            for (String d : ids) {
                if (d.equals(x) || !live.contains(d) || !dominated.get(d).contains(x)) continue;
                if (dominated.get(d).size() < best) {
                    best = dominated.get(d).size();
                    idom = d;
                }
            }
            rows.add(new String[] { x, String.valueOf(size.get(x)), String.valueOf(retained), idom });
        }
        rows.sort(Comparator.<String[]>comparingLong(r -> -Long.parseLong(r[2])).thenComparing(r -> r[0]));

        System.out.println("live=" + live.size() + " objects, " + liveBytes + " bytes");
        for (String[] r : rows) System.out.println(r[0] + " shallow=" + r[1] + " retained=" + r[2] + " idom=" + r[3]);
        List<String> garbage = new ArrayList<>();
        long garbageBytes = 0;
        for (String x : ids) {
            if (live.contains(x)) continue;
            garbage.add(x);
            garbageBytes += size.get(x);
        }
        System.out.println("garbage: " + (garbage.isEmpty() ? "(none)" : String.join(" ", garbage) + " (" + garbageBytes + " bytes)"));
    }
}`,
    solutionExplanation:
      'The mark phase is a plain graph traversal from the roots with an explicit stack and a visited set, so cycles and self references terminate and unreachable cycles are reported as garbage (a tracing collector, unlike reference counting, handles them for free). For dominators the solution uses the definition directly: D dominates X exactly when X is live but unreachable once D is removed, so one extra mark per live object yields the set each object dominates, and summing those shallow sizes is the retained size. The immediate dominator is the closest strict dominator; since dominators of X form a chain, it is the one that dominates the fewest objects. With n <= 200 the O(n * (n + e)) cost is negligible; real analysers use the Lengauer-Tarjan algorithm to do the same in near-linear time.',
    complexity: { time: 'O(n * (n + e)) for n objects and e references', space: 'O(n^2) for the dominated sets' },
    hints: [
      'Write mark(removed): a DFS from all roots that never enters the removed object (null removes nothing).',
      'Live objects that are unreachable when D is removed are exactly the objects D dominates, D included.',
      'Retained size of D = sum of shallow sizes of the objects D dominates. It is not everything reachable from D: shared objects are retained by nobody below the common dominator.',
      'The strict dominators of X form a chain; the immediate one dominates the fewest objects.',
      'Roots may repeat and a root reachable only as a root has idom ROOT.',
    ],
    tests: [
      { id: 't1', name: 'Diamond under one root', stdin: '5\nA 10 B C\nB 20 D\nC 30 D\nD 40\nE 50 A\nroots: A\n', expectedStdout: 'live=4 objects, 100 bytes\nA shallow=10 retained=100 idom=ROOT\nD shallow=40 retained=40 idom=A\nC shallow=30 retained=30 idom=A\nB shallow=20 retained=20 idom=A\ngarbage: E (50 bytes)' },
      { id: 't2', name: 'Live cycle and a garbage cycle', stdin: '6\nR 8 X\nX 16 Y\nY 32 X Z\nZ 64\nG1 100 G2\nG2 200 G1 Z\nroots: R\n', expectedStdout: 'live=4 objects, 120 bytes\nR shallow=8 retained=120 idom=ROOT\nX shallow=16 retained=112 idom=R\nY shallow=32 retained=96 idom=X\nZ shallow=64 retained=64 idom=Y\ngarbage: G1 G2 (300 bytes)' },
      { id: 't3', name: 'Object shared by two roots', stdin: '4\nS1 5 M\nS2 5 M\nM 100 N\nN 7\nroots: S1 S2\n', expectedStdout: 'live=4 objects, 117 bytes\nM shallow=100 retained=107 idom=ROOT\nN shallow=7 retained=7 idom=M\nS1 shallow=5 retained=5 idom=ROOT\nS2 shallow=5 retained=5 idom=ROOT\ngarbage: (none)', hidden: true },
      { id: 't4', name: 'No roots at all', stdin: '2\nA 1 B\nB 2 A\nroots:\n', expectedStdout: 'live=0 objects, 0 bytes\ngarbage: A B (3 bytes)', hidden: true },
      { id: 't5', name: 'Self references and repeated roots', stdin: '3\nA 4 A B\nB 6 B B\nC 9\nroots: A A C\n', expectedStdout: 'live=3 objects, 19 bytes\nA shallow=4 retained=10 idom=ROOT\nC shallow=9 retained=9 idom=ROOT\nB shallow=6 retained=6 idom=A\ngarbage: (none)', hidden: true },
    ],
  },
  {
    id: 'boss-log-triage',
    title: 'Boss: log triage with error recovery',
    moduleId: 'io',
    lessonId: 'io-files',
    difficulty: 'advanced',
    kind: 'boss',
    dimension: 'coding',
    concepts: ['BufferedReader line streaming', 'explicit UTF-8', 'multi-line records', 'error recovery and resynchronisation', 'LocalDateTime parsing'],
    description: `Module capstone: an incident triage tool that reads a raw application log from standard input (as UTF-8, line by line, until end of input) and summarises it, surviving whatever garbage is in the file.

Each line is one of:
- **blank** (only whitespace): ignored.
- **frame**: starts with a space or a tab. It belongs to the current record (a stack trace line). If there is no current record it is an orphan and is **malformed**.
- **header**: \`<timestamp> <LEVEL> [<component>] <message>\`, fields separated by single spaces (the message is the rest of the line and may contain spaces). It is valid only if the timestamp parses with \`LocalDateTime.parse\` (for example \`2024-03-01T09:15:00\`), the level is one of \`ERROR WARN INFO DEBUG TRACE\`, the component is non-empty and wrapped in square brackets, and the message (stripped) is not empty. A valid header starts a new record, which becomes the current record.
- anything else, including an invalid header, is **malformed**. It also ends the current record, so frames after it are orphans until the next valid header (error recovery: resynchronise on the next good record).

Output:
\`\`\`
records=<n> malformed=<m>
malformed lines: <1-based line numbers, comma+space separated, or none>
ERROR=<n> WARN=<n> INFO=<n> DEBUG=<n> TRACE=<n>
top components: <up to 3 as name(count), most records first, ties by name; or none>
first error: <timestamp> [<component>] <message>    (or: first error: none)
deepest trace: frames=<k>, <timestamp> [<component>] <message>    (record with the most frames, earliest on ties; none if no record has frames)
out of order: <records whose timestamp is earlier than some earlier record's timestamp>
\`\`\`
Timestamps are printed exactly as they appear in the input; the message is printed stripped.`,
    starterCode: `import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;

public class Main {
    record Entry(int line, String timestamp, String level, String component, String message) {}

    public static void main(String[] args) throws IOException {
        List<Entry> records = new ArrayList<>();
        List<Integer> malformed = new ArrayList<>();
        try (BufferedReader in = new BufferedReader(new InputStreamReader(System.in, StandardCharsets.UTF_8))) {
            String line;
            int lineNo = 0;
            while ((line = in.readLine()) != null) {
                lineNo++;
                // TODO: classify the line (blank, continuation, valid header, malformed),
                //       attach frames to the current record and recover after bad lines.
                String[] p = line.split(" ", 4);
                records.add(new Entry(lineNo, p[0], p[1], p[2], p[3]));
            }
        }
        System.out.println("records=" + records.size() + " malformed=" + malformed.size());
    }
}`,
    solution: `import java.io.*;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.*;

public class Main {
    static final List<String> LEVELS = List.of("ERROR", "WARN", "INFO", "DEBUG", "TRACE");

    static final class Entry {
        final String timestamp, level, component, message;
        final LocalDateTime time;
        int frames;

        Entry(String timestamp, LocalDateTime time, String level, String component, String message) {
            this.timestamp = timestamp;
            this.time = time;
            this.level = level;
            this.component = component;
            this.message = message;
        }

        String describe() {
            return timestamp + " [" + component + "] " + message;
        }
    }

    /** Returns the parsed header, or null if the line is not a valid record header. */
    static Entry parseHeader(String line) {
        String[] p = line.split(" ", 4);
        if (p.length < 4 || !LEVELS.contains(p[1])) return null;
        if (p[2].length() < 3 || !p[2].startsWith("[") || !p[2].endsWith("]")) return null;
        String message = p[3].strip();
        if (message.isEmpty()) return null;
        try {
            LocalDateTime time = LocalDateTime.parse(p[0]);
            return new Entry(p[0], time, p[1], p[2].substring(1, p[2].length() - 1), message);
        } catch (DateTimeParseException e) {
            return null;
        }
    }

    public static void main(String[] args) throws IOException {
        List<Entry> records = new ArrayList<>();
        List<Integer> malformed = new ArrayList<>();
        try (BufferedReader in = new BufferedReader(new InputStreamReader(System.in, StandardCharsets.UTF_8))) {
            Entry current = null;
            String line;
            int lineNo = 0;
            while ((line = in.readLine()) != null) {
                lineNo++;
                if (line.isBlank()) continue;
                if (line.startsWith(" ") || line.startsWith("\\t")) {
                    if (current == null) malformed.add(lineNo);   // orphan frame
                    else current.frames++;
                    continue;
                }
                Entry e = parseHeader(line);
                if (e == null) {
                    malformed.add(lineNo);
                    current = null;          // resynchronise on the next valid header
                } else {
                    records.add(e);
                    current = e;
                }
            }
        }

        System.out.println("records=" + records.size() + " malformed=" + malformed.size());
        List<String> lines = new ArrayList<>();
        for (int n : malformed) lines.add(String.valueOf(n));
        System.out.println("malformed lines: " + (lines.isEmpty() ? "none" : String.join(", ", lines)));

        Map<String, Integer> levels = new HashMap<>();
        Map<String, Integer> components = new TreeMap<>();
        for (Entry e : records) {
            levels.merge(e.level, 1, Integer::sum);
            components.merge(e.component, 1, Integer::sum);
        }
        StringJoiner levelLine = new StringJoiner(" ");
        for (String level : LEVELS) levelLine.add(level + "=" + levels.getOrDefault(level, 0));
        System.out.println(levelLine);

        List<Map.Entry<String, Integer>> ranked = new ArrayList<>(components.entrySet());
        ranked.sort(Map.Entry.<String, Integer>comparingByValue().reversed().thenComparing(Map.Entry.comparingByKey()));
        StringJoiner top = new StringJoiner(" ");
        for (int i = 0; i < Math.min(3, ranked.size()); i++) top.add(ranked.get(i).getKey() + "(" + ranked.get(i).getValue() + ")");
        System.out.println("top components: " + (ranked.isEmpty() ? "none" : top.toString()));

        Entry firstError = null, deepest = null;
        int outOfOrder = 0;
        LocalDateTime latest = null;
        for (Entry e : records) {
            if (firstError == null && e.level.equals("ERROR")) firstError = e;
            if (e.frames > 0 && (deepest == null || e.frames > deepest.frames)) deepest = e;
            if (latest != null && e.time.isBefore(latest)) outOfOrder++;
            if (latest == null || e.time.isAfter(latest)) latest = e.time;
        }
        System.out.println("first error: " + (firstError == null ? "none" : firstError.describe()));
        System.out.println("deepest trace: " + (deepest == null ? "none" : "frames=" + deepest.frames + ", " + deepest.describe()));
        System.out.println("out of order: " + outOfOrder);
    }
}`,
    solutionExplanation:
      'The reader streams the input once, line by line, through a BufferedReader with an explicit UTF-8 charset, so memory depends on the number of records, not the size of the file. A small state machine with one variable, the current record, handles multi-line records: frames attach to it, a valid header replaces it and a malformed line clears it, so that frames after a broken header are reported as orphans rather than glued to the wrong record. Header validation is done in one place (parseHeader) and returns null instead of throwing, and the only exception (DateTimeParseException) is caught per line, so one bad line can never abort the whole report. Summaries are computed afterwards: a fixed level order, a TreeMap plus a comparator for the top components, and a running maximum timestamp for out-of-order detection.',
    complexity: { time: 'O(L + c log c) for L lines and c components', space: 'O(r) for r records' },
    hints: [
      'Keep a single "current record" reference: frames attach to it, malformed lines set it to null.',
      'split(" ", 4) gives timestamp, level, [component] and the rest of the line as the message.',
      'Catch DateTimeParseException around LocalDateTime.parse for that one line only.',
      'Count line numbers for every line read, including blank ones.',
      'Out of order means earlier than the latest timestamp seen so far, not just the previous record.',
    ],
    tests: [
      { id: 't1', name: 'Clean log with a stack trace', stdin: '2024-03-01T09:00:00 INFO [web] server started\n2024-03-01T09:00:05 ERROR [db] connection refused\n    at Pool.open(Pool.java:42)\n    at Repo.find(Repo.java:7)\n2024-03-01T09:00:06 WARN [web] slow request\n', expectedStdout: 'records=3 malformed=0\nmalformed lines: none\nERROR=1 WARN=1 INFO=1 DEBUG=0 TRACE=0\ntop components: web(2) db(1)\nfirst error: 2024-03-01T09:00:05 [db] connection refused\ndeepest trace: frames=2, 2024-03-01T09:00:05 [db] connection refused\nout of order: 0' },
      { id: 't2', name: 'Garbage, orphans and bad headers', stdin: '    at Orphan.frame(Orphan.java:1)\n2024-03-01T10:00:00 INFO [auth] login ok\n\nthis line is garbage\n\tat Lost.frame(Lost.java:3)\n2024-13-01T10:00:00 INFO [auth] bad month\n2024-03-01T10:00:01 FATAL [auth] unknown level\n2024-03-01T10:00:02 ERROR auth no brackets\n2024-03-01T10:00:03 ERROR [auth]\n2024-03-01T10:00:04 ERROR [auth] token expired\n\tat Jwt.verify(Jwt.java:88)\n', expectedStdout: 'records=2 malformed=7\nmalformed lines: 1, 4, 5, 6, 7, 8, 9\nERROR=1 WARN=0 INFO=1 DEBUG=0 TRACE=0\ntop components: auth(2)\nfirst error: 2024-03-01T10:00:04 [auth] token expired\ndeepest trace: frames=1, 2024-03-01T10:00:04 [auth] token expired\nout of order: 0' },
      { id: 't3', name: 'Out-of-order timestamps and trace ties', stdin: '2024-03-01T12:00:00 DEBUG [cache] warm\n2024-03-01T11:59:00 INFO [cache] late arrival\n2024-03-01T12:00:00 INFO [api] same second\n2024-03-01T11:00:00 ERROR [api] very late\n  at A.a(A.java:1)\n  at B.b(B.java:2)\n2024-03-01T12:30:00 ERROR [cache] evicted\n  at C.c(C.java:3)\n  at D.d(D.java:4)\n2024-03-01T12:31:00 TRACE [zeta] tick\n', expectedStdout: 'records=6 malformed=0\nmalformed lines: none\nERROR=2 WARN=0 INFO=2 DEBUG=1 TRACE=1\ntop components: cache(3) api(2) zeta(1)\nfirst error: 2024-03-01T11:00:00 [api] very late\ndeepest trace: frames=2, 2024-03-01T11:00:00 [api] very late\nout of order: 2', hidden: true },
      { id: 't4', name: 'Only blank lines', stdin: '\n\n   \n', expectedStdout: 'records=0 malformed=0\nmalformed lines: none\nERROR=0 WARN=0 INFO=0 DEBUG=0 TRACE=0\ntop components: none\nfirst error: none\ndeepest trace: none\nout of order: 0', hidden: true },
      { id: 't5', name: 'Top three of four components', stdin: '2024-03-01T08:00:00 INFO [b] one\n2024-03-01T08:00:01 INFO [a] two\n2024-03-01T08:00:02 INFO [c] three\n2024-03-01T08:00:03 INFO [d] four\n2024-03-01T08:00:04 WARN [d] five  with  spaces\n', expectedStdout: 'records=5 malformed=0\nmalformed lines: none\nERROR=0 WARN=1 INFO=4 DEBUG=0 TRACE=0\ntop components: d(2) a(1) b(1)\nfirst error: none\ndeepest trace: none\nout of order: 0', hidden: true },
    ],
    staticChecks: [
      { id: 's1', description: 'Stream the input with a BufferedReader', pattern: 'BufferedReader', mustMatch: true },
      { id: 's2', description: 'Use an explicit UTF-8 charset', pattern: 'StandardCharsets\\.UTF_8', mustMatch: true },
    ],
  },
  {
    id: 'ch-safe-query',
    title: 'Bind, do not concatenate',
    moduleId: 'jdbc',
    lessonId: 'j-jdbc',
    difficulty: 'intermediate',
    kind: 'debugging',
    dimension: 'debugging',
    concepts: ['SQL injection', 'PreparedStatement placeholders', 'parameter binding', 'parse before bind', 'operator precedence'],
    description: `A search endpoint builds its SQL like \`"WHERE name = '" + name + "'"\`. Paste in \`x' OR role = 'user\` and the "value" becomes part of the query: that is **SQL injection**. JDBC's fix is \`PreparedStatement\`: the statement text with \`?\` placeholders is parsed first, and values bound with \`setString\` are only ever treated as data.

The program below models this with an in-memory table and a tiny WHERE language. It pastes the parameters into the text and then parses the result, so it is injectable (and breaks in other ways too). Rewrite \`execute\` so it **prepares** the template first and **binds** parameters positionally, never parsing a value.

Input:
- the column names, separated by spaces (the first column is the id)
- r, then r rows with values separated by \`|\`
- q, then q queries of two lines each: the template \`<col> = ? ((AND|OR) <col> = ?)*\` (tokens separated by single spaces), and the parameters separated by \`|\` (an empty line means no parameters). Parameters are arbitrary text except \`|\`, and may contain quotes, \`?\` and keywords.

Semantics: \`AND\` binds tighter than \`OR\` (as in SQL), and comparisons are exact, case-sensitive string equality.

Output per query:
- \`error: unknown column <name>\` for the first unknown column in the template (checked first, like a prepare-time failure), else
- \`error: parameter count mismatch: expected <placeholders>, got <params>\`, else
- \`ids: <matching ids in table order, comma+space separated>\` or \`ids: (none)\`.`,
    starterCode: `import java.io.*;
import java.util.*;

public class Main {
    static List<String> columns;
    static List<String[]> rows = new ArrayList<>();

    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        columns = List.of(in.readLine().trim().split("\\\\s+"));
        int r = Integer.parseInt(in.readLine().trim());
        for (int i = 0; i < r; i++) rows.add(in.readLine().split("\\\\|", -1));
        int q = Integer.parseInt(in.readLine().trim());
        for (int i = 0; i < q; i++) {
            String template = in.readLine().trim();
            String paramLine = in.readLine();
            String[] params = paramLine.isEmpty() ? new String[0] : paramLine.split("\\\\|", -1);
            System.out.println(execute(template, params));
        }
    }

    // Like Statement.executeQuery("... WHERE " + userInput): values are pasted into the SQL text.
    static String execute(String template, String[] params) {
        String sql = template;
        for (String p : params) {
            int at = sql.indexOf('?');
            if (at < 0) break;
            sql = sql.substring(0, at) + "'" + p + "'" + sql.substring(at + 1);
        }
        List<String> ids = new ArrayList<>();
        for (String[] row : rows) {
            boolean any = false;
            for (String group : sql.split(" OR ")) {
                boolean all = true;
                for (String cond : group.split(" AND ")) {
                    int eq = cond.indexOf(" = ");
                    String col = cond.substring(0, eq).trim();
                    String value = cond.substring(eq + 3).trim();
                    value = value.substring(1, value.length() - 1);   // strip the quotes
                    int c = columns.indexOf(col);
                    if (c < 0 || !row[c].equals(value)) all = false;
                }
                if (all) any = true;
            }
            if (any) ids.add(row[0]);
        }
        return "ids: " + (ids.isEmpty() ? "(none)" : String.join(", ", ids));
    }
}`,
    solution: `import java.io.*;
import java.util.*;

public class Main {
    static List<String> columns;
    static List<String[]> rows = new ArrayList<>();

    /** One "column = ?" condition; param is the 0-based placeholder position. */
    record Cond(int column, int param) {}

    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        columns = List.of(in.readLine().trim().split("\\\\s+"));
        int r = Integer.parseInt(in.readLine().trim());
        for (int i = 0; i < r; i++) rows.add(in.readLine().split("\\\\|", -1));
        int q = Integer.parseInt(in.readLine().trim());
        for (int i = 0; i < q; i++) {
            String template = in.readLine().trim();
            String paramLine = in.readLine();
            String[] params = paramLine.isEmpty() ? new String[0] : paramLine.split("\\\\|", -1);
            System.out.println(execute(template, params));
        }
    }

    // Like a PreparedStatement: the template is parsed ("prepared") on its own, before any
    // value is seen, and the values are bound to the placeholders as data, never as SQL.
    static String execute(String template, String[] params) {
        List<List<Cond>> groups = new ArrayList<>();   // OR of AND-groups
        List<Cond> group = new ArrayList<>();
        String[] tokens = template.split("\\\\s+");
        int placeholders = 0;
        for (int t = 0; t < tokens.length; t += 4) {
            int column = columns.indexOf(tokens[t]);
            if (column < 0) return "error: unknown column " + tokens[t];
            group.add(new Cond(column, placeholders++));
            if (t + 3 < tokens.length && tokens[t + 3].equals("OR")) {
                groups.add(group);
                group = new ArrayList<>();
            }
        }
        groups.add(group);
        if (params.length != placeholders) {
            return "error: parameter count mismatch: expected " + placeholders + ", got " + params.length;
        }

        List<String> ids = new ArrayList<>();
        for (String[] row : rows) {
            boolean match = false;
            for (List<Cond> g : groups) {
                boolean all = true;
                for (Cond c : g) all &= row[c.column()].equals(params[c.param()]);
                match |= all;
            }
            if (match) ids.add(row[0]);
        }
        return "ids: " + (ids.isEmpty() ? "(none)" : String.join(", ", ids));
    }
}`,
    solutionExplanation:
      'The fix mirrors what a PreparedStatement does. The template is tokenised and turned into an OR of AND-groups before any parameter is looked at, so a parameter can never add a condition, close a quote or introduce a new placeholder: it is bound positionally and compared as plain data. That removes the injection and also fixes the side bugs of the string-building version (a ? inside a value being treated as a placeholder, and quotes inside values). Validation happens at prepare time (unknown columns) and at execute time (parameter count), like a driver throwing SQLException. AND binds tighter than OR because each OR starts a new group and a row matches when any group matches entirely.',
    complexity: { time: 'O(t + r * t) per query for t template tokens and r rows', space: 'O(t)' },
    hints: [
      'Never build a new SQL string from the parameters. Parse the template alone first.',
      'Tokens come in fours: column, =, ?, then AND/OR (or the end).',
      'Represent the WHERE clause as a list of AND-groups; OR starts a new group.',
      'Give each condition the index of its placeholder and compare row values to params[index] with equals.',
    ],
    tests: [
      { id: 't1', name: 'Ordinary queries', stdin: 'id name role\n4\n1|alice|admin\n2|bob|user\n3|O\'Brien|user\n4|carol|user\n3\nname = ? AND role = ?\nalice|admin\nrole = ?\nuser\nname = ?\nO\'Brien\n', expectedStdout: 'ids: 1\nids: 2, 3, 4\nids: 3' },
      { id: 't2', name: 'Injection attempts', stdin: 'id name role\n4\n1|alice|admin\n2|bob|user\n3|O\'Brien|user\n4|carol|user\n2\nname = ?\nx\' OR role = \'user\nname = ? AND role = ?\nnobody\' OR name = \'alice|admin\n', expectedStdout: 'ids: (none)\nids: (none)' },
      { id: 't3', name: 'Precedence, ? in a value, too many params', stdin: 'id name role\n4\n1|alice|admin\n2|bob|user\n3|O\'Brien|user\n4|carol|user\n3\nname = ? OR name = ? AND role = ?\nbob|carol|admin\nname = ? OR name = ?\nwho?|alice\nname = ?\nalice|extra\n', expectedStdout: 'ids: 2\nids: 1\nerror: parameter count mismatch: expected 1, got 2', hidden: true },
      { id: 't4', name: 'Unknown column and too few params', stdin: 'id name role\n4\n1|alice|admin\n2|bob|user\n3|O\'Brien|user\n4|carol|user\n3\npassword = ?\nhunter2\nrole = ? AND name = ?\nuser\nrole = ? OR role = ?\nadmin|user\n', expectedStdout: 'error: unknown column password\nerror: parameter count mismatch: expected 2, got 1\nids: 1, 2, 3, 4', hidden: true },
    ],
    staticChecks: [
      { id: 's1', description: 'Do not glue quoted values into the query text', pattern: '"\'"\\s*\\+|\\+\\s*"\'"', mustMatch: false },
    ],
  },
  {
    id: 'ch-tx-savepoints',
    title: 'Transactions with savepoints',
    moduleId: 'jdbc',
    lessonId: 'j-transactions',
    difficulty: 'intermediate',
    kind: 'coding',
    dimension: 'coding',
    concepts: ['auto-commit', 'commit and rollback', 'savepoints', 'undo log', 'statement-level failure'],
    description: `Model JDBC transaction control (\`setAutoCommit(false)\`, \`commit()\`, \`rollback()\`, \`setSavepoint\`, \`rollback(savepoint)\`, \`releaseSavepoint\`) on an in-memory \`accounts\` table.

Input: the first line lists the accounts as \`name=balance\` pairs. Every following line is a command (blank lines are ignored):

- \`BEGIN\`: start a transaction. Without one, each \`UPDATE\` is applied and committed immediately (auto-commit).
- \`UPDATE <account> <delta>\`: add a signed whole number (such as \`+30\` or \`-20\`) to the balance. A failing statement is not applied but does **not** end the transaction.
- \`SAVEPOINT <name>\`: mark the current point. Reusing a name moves it (the old savepoint with that name is removed).
- \`ROLLBACK TO <name>\`: undo every change made after the savepoint. The savepoint itself survives; savepoints created after it are destroyed.
- \`RELEASE <name>\`: remove the savepoint and all savepoints created after it, keeping the changes.
- \`COMMIT\` / \`ROLLBACK\`: make the changes permanent / undo them all, and end the transaction.
- \`SHOW\`: print the balances the current connection sees (its own uncommitted changes included) as \`name=balance\` pairs in name order, separated by spaces.

Print errors as \`error: <message>\` and carry on:
- \`no account <name>\`, \`insufficient funds in <name>\` (a balance may never go below 0; the unknown-account check comes first)
- \`transaction already active\` (BEGIN inside a transaction)
- \`no active transaction\` (COMMIT, ROLLBACK, SAVEPOINT, ROLLBACK TO or RELEASE outside a transaction)
- \`no savepoint <name>\`

If a transaction is still open at end of input, roll it back (like closing a connection) and print \`rolled back open transaction\`. Finally print \`committed: <balances>\` in the SHOW format.`,
    starterCode: `import java.io.*;
import java.util.*;

public class Main {
    static final Map<String, Long> table = new TreeMap<>();
    static boolean inTx = false;

    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        for (String pair : in.readLine().trim().split("\\\\s+")) {
            String[] kv = pair.split("=");
            table.put(kv[0], Long.parseLong(kv[1]));
        }
        String line;
        while ((line = in.readLine()) != null) {
            line = line.trim();
            if (line.isEmpty()) continue;
            String[] c = line.split("\\\\s+");
            switch (c[0]) {
                case "BEGIN" -> inTx = true;
                case "UPDATE" -> table.merge(c[1], Long.parseLong(c[2]), Long::sum);
                case "COMMIT" -> inTx = false;
                case "SHOW" -> System.out.println(render());
                // TODO: ROLLBACK, SAVEPOINT, ROLLBACK TO, RELEASE and every error case
                default -> { }
            }
        }
        System.out.println("committed: " + render());
    }

    static String render() {
        StringJoiner sj = new StringJoiner(" ");
        table.forEach((k, v) -> sj.add(k + "=" + v));
        return sj.toString();
    }
}`,
    solution: `import java.io.*;
import java.util.*;

public class Main {
    record Undo(String account, long oldBalance) {}
    record Savepoint(String name, int logSize) {}

    static final Map<String, Long> table = new TreeMap<>();
    static final List<Undo> undoLog = new ArrayList<>();
    static final List<Savepoint> savepoints = new ArrayList<>();
    static boolean inTx = false;

    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        for (String pair : in.readLine().trim().split("\\\\s+")) {
            String[] kv = pair.split("=");
            table.put(kv[0], Long.parseLong(kv[1]));
        }
        String line;
        while ((line = in.readLine()) != null) {
            line = line.trim();
            if (line.isEmpty()) continue;
            String error = apply(line.split("\\\\s+"));
            if (error != null) System.out.println("error: " + error);
        }
        if (inTx) {
            rollbackTo(0);
            System.out.println("rolled back open transaction");
        }
        System.out.println("committed: " + render());
    }

    /** Returns an error message, or null on success. */
    static String apply(String[] c) {
        String op = c[0].equals("ROLLBACK") && c.length == 3 ? "ROLLBACK TO" : c[0];
        if (op.equals("UPDATE")) return update(c[1], Long.parseLong(c[2]));
        if (op.equals("SHOW")) {
            System.out.println(render());
            return null;
        }
        if (op.equals("BEGIN")) {
            if (inTx) return "transaction already active";
            inTx = true;
            return null;
        }
        if (!inTx) return "no active transaction";
        switch (op) {
            case "COMMIT" -> end();
            case "ROLLBACK" -> {
                rollbackTo(0);
                end();
            }
            case "SAVEPOINT" -> {
                savepoints.removeIf(s -> s.name().equals(c[1]));
                savepoints.add(new Savepoint(c[1], undoLog.size()));
            }
            case "ROLLBACK TO", "RELEASE" -> {
                String name = op.equals("RELEASE") ? c[1] : c[2];
                int idx = indexOf(name);
                if (idx < 0) return "no savepoint " + name;
                if (op.equals("RELEASE")) {
                    savepoints.subList(idx, savepoints.size()).clear();
                } else {
                    rollbackTo(savepoints.get(idx).logSize());
                    savepoints.subList(idx + 1, savepoints.size()).clear();   // the savepoint itself survives
                }
            }
            default -> {
                return "unknown command " + c[0];
            }
        }
        return null;
    }

    static String update(String account, long delta) {
        Long balance = table.get(account);
        if (balance == null) return "no account " + account;
        if (balance + delta < 0) return "insufficient funds in " + account;
        if (inTx) undoLog.add(new Undo(account, balance));   // autocommit needs no undo
        table.put(account, balance + delta);
        return null;
    }

    /** Undo the log back to {@code size} entries, newest first. */
    static void rollbackTo(int size) {
        while (undoLog.size() > size) {
            Undo u = undoLog.remove(undoLog.size() - 1);
            table.put(u.account(), u.oldBalance());
        }
    }

    static void end() {
        undoLog.clear();
        savepoints.clear();
        inTx = false;
    }

    static int indexOf(String name) {
        for (int i = 0; i < savepoints.size(); i++) if (savepoints.get(i).name().equals(name)) return i;
        return -1;
    }

    static String render() {
        StringJoiner sj = new StringJoiner(" ");
        table.forEach((k, v) -> sj.add(k + "=" + v));
        return sj.toString();
    }
}`,
    solutionExplanation:
      'Every change made inside a transaction appends the old value of the row to an undo log, and a savepoint is just a position in that log. Rolling back to a position pops entries newest first and restores the old values, which correctly undoes several updates to the same account. ROLLBACK is rollback to position 0, COMMIT simply forgets the log, and auto-commit mode writes without logging because nothing can undo it. Savepoints are kept in creation order so ROLLBACK TO can destroy the later ones while keeping its own, and RELEASE can drop it with everything after it. A failing statement returns an error before touching the table or the log, so the transaction continues, and an open transaction at end of input is rolled back like a closed connection.',
    complexity: { time: 'O(1) per UPDATE; rollback is O(changes undone)', space: 'O(changes in the transaction + savepoints)' },
    hints: [
      'Log (account, old balance) before every UPDATE inside a transaction.',
      'A savepoint only needs to remember the size of the undo log when it was created.',
      'Undo newest first, so an account updated twice ends up with its oldest value.',
      'ROLLBACK TO keeps the savepoint itself; RELEASE removes it.',
      'Check "no active transaction" before looking up savepoints.',
    ],
    tests: [
      { id: 't1', name: 'Rollback to a savepoint', stdin: 'alice=100 bob=50\nBEGIN\nUPDATE alice -30\nSAVEPOINT s1\nUPDATE bob 30\nSHOW\nROLLBACK TO s1\nSHOW\nCOMMIT\n', expectedStdout: 'alice=70 bob=80\nalice=70 bob=50\ncommitted: alice=70 bob=50' },
      { id: 't2', name: 'Auto-commit and failing statements', stdin: 'alice=100 bob=50\nUPDATE bob +10\nBEGIN\nUPDATE alice -100\nUPDATE bob -61\nUPDATE carol 5\nROLLBACK\nSHOW\nCOMMIT\n', expectedStdout: 'error: insufficient funds in bob\nerror: no account carol\nalice=100 bob=60\nerror: no active transaction\ncommitted: alice=100 bob=60' },
      { id: 't3', name: 'Nested savepoints destroyed by rollback', stdin: 'a=10\nBEGIN\nUPDATE a 1\nSAVEPOINT p\nUPDATE a 2\nSAVEPOINT q\nUPDATE a 4\nROLLBACK TO p\nSHOW\nROLLBACK TO q\nUPDATE a 8\nROLLBACK TO p\nSHOW\nRELEASE p\nROLLBACK TO p\nCOMMIT\n', expectedStdout: 'a=11\nerror: no savepoint q\na=11\nerror: no savepoint p\ncommitted: a=11', hidden: true },
      { id: 't4', name: 'Reused savepoint name and implicit rollback', stdin: 'a=5 b=5\nSAVEPOINT x\nROLLBACK\nBEGIN\nBEGIN\nUPDATE a 5\nSAVEPOINT s\nUPDATE a 5\nSAVEPOINT s\nUPDATE b 1\nROLLBACK TO s\nSHOW\n', expectedStdout: 'error: no active transaction\nerror: no active transaction\nerror: transaction already active\na=15 b=5\nrolled back open transaction\ncommitted: a=5 b=5', hidden: true },
      { id: 't5', name: 'Release keeps changes', stdin: 'a=0\nBEGIN\nUPDATE a 3\nSAVEPOINT one\nUPDATE a 3\nRELEASE one\nROLLBACK TO one\nCOMMIT\nCOMMIT\nSHOW\n', expectedStdout: 'error: no savepoint one\nerror: no active transaction\na=6\ncommitted: a=6', hidden: true },
    ],
  },
  {
    id: 'boss-optimistic-ledger',
    title: 'Boss: optimistic locking ledger',
    moduleId: 'jdbc',
    lessonId: 'j-transactions',
    difficulty: 'advanced',
    kind: 'boss',
    dimension: 'coding',
    concepts: ['lost update anomaly', 'optimistic locking', 'version columns', 'compare-and-set UPDATE', 'all-or-nothing commit'],
    description: `Module capstone: stop **lost updates** with optimistic locking, the way JPA's \`@Version\` does.

Every row of the \`accounts\` table has a balance and a version, starting at 1. Several sessions interleave their commands. The current code is "last writer wins": two sessions read 100, one subtracts 30 and the other 50, both commit, and the final balance is 50 instead of 20. Make every commit behave like
\`UPDATE accounts SET balance = ?, version = version + 1 WHERE id = ? AND version = ?\`
and treat "0 rows updated" as a conflict.

Input: the first line lists accounts as \`id=balance\`. Then one command per line (blank lines ignored), each prefixed with a session name:

- \`<S> READ <id>\`: on the session's first read of the row, snapshot its committed balance and version. Later reads in the same session return the snapshot (repeatable read). Prints \`<S> read <id>=<snapshot + session's pending delta> v<version read>\`. The first successful READ makes the session active.
- \`<S> ADD <id> <delta>\`: add a signed amount to the session's pending change for that row. The session must have read the row first.
- \`<S> COMMIT\`: the session ends whatever the outcome.
  - No pending changes: \`<S> commit ok (read-only)\` (counts as a commit; nothing is validated).
  - Otherwise, checking written rows in ascending id order: if any row's current version differs from the version the session read, print \`<S> conflict on <id>: read v<read>, now v<current>\` for the first one and write **nothing**. Else, if any new balance (snapshot + delta) would be negative, print \`<S> rejected: <id> would be <value>\` for the first one and write nothing. Else write every row (new balance, version + 1) and print \`<S> commit ok: <id>=<balance> v<version>, ...\` in id order.
- \`<S> ABORT\`: discard the session and print \`<S> aborted\`.

Errors (the command is ignored): \`<S> error: no account <id>\` for an unknown row (checked first), \`<S> error: read <id> first\` for ADD before READ, \`<S> error: no active session\` for COMMIT or ABORT without an active session.

At end of input: if sessions are still active, print \`discarded: <names in ascending String order>\`. Then each row as \`<id> balance=<b> version=<v>\` in id order, then \`commits=<n> conflicts=<n> rejected=<n>\`.`,
    starterCode: `import java.io.*;
import java.util.*;

public class Main {
    static final class Row {
        long balance;
        int version = 1;
        Row(long balance) { this.balance = balance; }
    }

    /** What one session read and what it wants to write. */
    static final class Session {
        final Map<String, Long> readBalance = new TreeMap<>();
        final Map<String, Integer> readVersion = new TreeMap<>();
        final Map<String, Long> delta = new TreeMap<>();
    }

    static final Map<String, Row> table = new TreeMap<>();
    static final Map<String, Session> sessions = new TreeMap<>();
    static int commits = 0, conflicts = 0, rejected = 0;

    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        for (String pair : in.readLine().trim().split("\\\\s+")) {
            String[] kv = pair.split("=");
            table.put(kv[0], new Row(Long.parseLong(kv[1])));
        }
        String line;
        while ((line = in.readLine()) != null) {
            line = line.trim();
            if (line.isEmpty()) continue;
            String[] c = line.split("\\\\s+");
            String name = c[0];
            switch (c[1]) {
                case "READ" -> {
                    Session s = sessions.computeIfAbsent(name, k -> new Session());
                    Row row = table.get(c[2]);
                    s.readBalance.putIfAbsent(c[2], row.balance);
                    s.readVersion.putIfAbsent(c[2], row.version);
                    long view = s.readBalance.get(c[2]) + s.delta.getOrDefault(c[2], 0L);
                    System.out.println(name + " read " + c[2] + "=" + view + " v" + s.readVersion.get(c[2]));
                }
                case "ADD" -> sessions.get(name).delta.merge(c[2], Long.parseLong(c[3]), Long::sum);
                case "COMMIT" -> {
                    // BUG: last writer wins. Nothing checks whether someone else
                    //      committed a newer version since this session read the row.
                    Session s = sessions.remove(name);
                    StringJoiner written = new StringJoiner(", ");
                    for (var e : s.delta.entrySet()) {
                        Row row = table.get(e.getKey());
                        row.balance = s.readBalance.get(e.getKey()) + e.getValue();
                        row.version++;
                        written.add(e.getKey() + "=" + row.balance + " v" + row.version);
                    }
                    commits++;
                    System.out.println(name + " commit ok: " + written);
                }
                default -> { }
            }
        }
        table.forEach((id, row) -> System.out.println(id + " balance=" + row.balance + " version=" + row.version));
        System.out.println("commits=" + commits + " conflicts=" + conflicts + " rejected=" + rejected);
    }
}`,
    solution: `import java.io.*;
import java.util.*;

public class Main {
    static final class Row {
        long balance;
        int version = 1;
        Row(long balance) { this.balance = balance; }
    }

    /** What one session read and what it wants to write. */
    static final class Session {
        final Map<String, Long> readBalance = new TreeMap<>();
        final Map<String, Integer> readVersion = new TreeMap<>();
        final Map<String, Long> delta = new TreeMap<>();
    }

    static final Map<String, Row> table = new TreeMap<>();
    static final Map<String, Session> sessions = new TreeMap<>();
    static int commits = 0, conflicts = 0, rejected = 0;

    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        for (String pair : in.readLine().trim().split("\\\\s+")) {
            String[] kv = pair.split("=");
            table.put(kv[0], new Row(Long.parseLong(kv[1])));
        }
        String line;
        while ((line = in.readLine()) != null) {
            line = line.trim();
            if (!line.isEmpty()) handle(line.split("\\\\s+"));
        }
        if (!sessions.isEmpty()) System.out.println("discarded: " + String.join(" ", sessions.keySet()));
        table.forEach((id, row) -> System.out.println(id + " balance=" + row.balance + " version=" + row.version));
        System.out.println("commits=" + commits + " conflicts=" + conflicts + " rejected=" + rejected);
    }

    static void handle(String[] c) {
        String name = c[0];
        switch (c[1]) {
            case "READ" -> {
                if (!table.containsKey(c[2])) {
                    System.out.println(name + " error: no account " + c[2]);
                    return;
                }
                Session s = sessions.computeIfAbsent(name, k -> new Session());
                Row row = table.get(c[2]);
                s.readBalance.putIfAbsent(c[2], row.balance);   // repeatable read: keep the first snapshot
                s.readVersion.putIfAbsent(c[2], row.version);
                long view = s.readBalance.get(c[2]) + s.delta.getOrDefault(c[2], 0L);
                System.out.println(name + " read " + c[2] + "=" + view + " v" + s.readVersion.get(c[2]));
            }
            case "ADD" -> {
                if (!table.containsKey(c[2])) {
                    System.out.println(name + " error: no account " + c[2]);
                    return;
                }
                Session s = sessions.get(name);
                if (s == null || !s.readVersion.containsKey(c[2])) {
                    System.out.println(name + " error: read " + c[2] + " first");
                    return;
                }
                s.delta.merge(c[2], Long.parseLong(c[3]), Long::sum);
            }
            case "ABORT" -> {
                if (sessions.remove(name) == null) System.out.println(name + " error: no active session");
                else System.out.println(name + " aborted");
            }
            case "COMMIT" -> commit(name);
            default -> System.out.println(name + " error: unknown command " + c[1]);
        }
    }

    static void commit(String name) {
        Session s = sessions.remove(name);   // the session ends whatever happens next
        if (s == null) {
            System.out.println(name + " error: no active session");
            return;
        }
        if (s.delta.isEmpty()) {
            System.out.println(name + " commit ok (read-only)");
            commits++;
            return;
        }
        // UPDATE account SET balance = ?, version = version + 1 WHERE id = ? AND version = ?
        // affects 0 rows when another session committed first: validate every row before writing any.
        for (String id : s.delta.keySet()) {
            int now = table.get(id).version, read = s.readVersion.get(id);
            if (now != read) {
                System.out.println(name + " conflict on " + id + ": read v" + read + ", now v" + now);
                conflicts++;
                return;
            }
        }
        for (var e : s.delta.entrySet()) {
            long next = s.readBalance.get(e.getKey()) + e.getValue();
            if (next < 0) {
                System.out.println(name + " rejected: " + e.getKey() + " would be " + next);
                rejected++;
                return;
            }
        }
        StringJoiner written = new StringJoiner(", ");
        for (var e : s.delta.entrySet()) {
            Row row = table.get(e.getKey());
            row.balance = s.readBalance.get(e.getKey()) + e.getValue();
            row.version++;
            written.add(e.getKey() + "=" + row.balance + " v" + row.version);
        }
        commits++;
        System.out.println(name + " commit ok: " + written);
    }
}`,
    solutionExplanation:
      'Each session remembers the version it read for every row, and a commit is allowed only if those versions are still current, which is what UPDATE ... WHERE id = ? AND version = ? enforces in a real database (0 rows updated means someone committed first). Validation of all written rows happens before any write, so a commit touching two accounts is all-or-nothing, and the negative-balance rule is checked in the same pre-write pass. The new balance is computed from the snapshot the session saw; that is safe only because the version check proves nobody changed the row since. Read-only commits skip validation, as JPA does unless a lock mode is requested. Sessions live in a TreeMap so the discarded list is deterministic, and the version counter turns the silent lost update of the starter into a reported conflict that the caller could retry.',
    complexity: { time: 'O(w log w) per commit for w written rows; O(log s) per other command', space: 'O(sessions * rows read)' },
    hints: [
      'A conflict is detected at commit, not at read time: compare the version read with the row\'s current version.',
      'Validate every written row first, then write. Never apply half a commit.',
      'Check conflicts for all rows before checking negative balances.',
      'Remove the session from the map at the start of COMMIT so it ends whatever happens.',
      'A second READ of the same row must not refresh the snapshot.',
    ],
    tests: [
      { id: 't1', name: 'Classic lost update', stdin: 'acct=100\nT1 READ acct\nT2 READ acct\nT1 ADD acct -30\nT2 ADD acct -50\nT1 COMMIT\nT2 COMMIT\nT2 READ acct\nT2 ADD acct -50\nT2 COMMIT\n', expectedStdout: 'T1 read acct=100 v1\nT2 read acct=100 v1\nT1 commit ok: acct=70 v2\nT2 conflict on acct: read v1, now v2\nT2 read acct=70 v2\nT2 commit ok: acct=20 v3\nacct balance=20 version=3\ncommits=2 conflicts=1 rejected=0' },
      { id: 't2', name: 'Multi-row commit is all-or-nothing', stdin: 'a=100 b=0\nT1 READ a\nT1 READ b\nT1 ADD a -40\nT1 ADD b 40\nT2 READ b\nT2 ADD b 5\nT2 COMMIT\nT1 COMMIT\nT1 READ a\nT1 COMMIT\n', expectedStdout: 'T1 read a=100 v1\nT1 read b=0 v1\nT2 read b=0 v1\nT2 commit ok: b=5 v2\nT1 conflict on b: read v1, now v2\nT1 read a=100 v1\nT1 commit ok (read-only)\na balance=100 version=1\nb balance=5 version=2\ncommits=2 conflicts=1 rejected=0' },
      { id: 't3', name: 'Errors, rejection and abort', stdin: 'a=10\nT1 ADD a 5\nT1 READ zz\nT1 READ a\nT1 ADD a -15\nT1 READ a\nT1 COMMIT\nT1 COMMIT\nT2 ABORT\nT3 READ a\nT3 ABORT\n', expectedStdout: 'T1 error: read a first\nT1 error: no account zz\nT1 read a=10 v1\nT1 read a=-5 v1\nT1 rejected: a would be -5\nT1 error: no active session\nT2 error: no active session\nT3 read a=10 v1\nT3 aborted\na balance=10 version=1\ncommits=0 conflicts=0 rejected=1', hidden: true },
      { id: 't4', name: 'Independent rows and discarded sessions', stdin: 'x=50 y=50\nA READ x\nB READ y\nC READ x\nA ADD x 10\nB ADD y 10\nA COMMIT\nB COMMIT\nC ADD x 1\nC READ x\nC COMMIT\nD READ y\nE READ x\nD ADD y -5\n', expectedStdout: 'A read x=50 v1\nB read y=50 v1\nC read x=50 v1\nA commit ok: x=60 v2\nB commit ok: y=60 v2\nC read x=51 v1\nC conflict on x: read v1, now v2\nD read y=60 v2\nE read x=60 v2\ndiscarded: D E\nx balance=60 version=2\ny balance=60 version=2\ncommits=2 conflicts=1 rejected=0', hidden: true },
      { id: 't5', name: 'Repeatable read and read-only commit', stdin: 'm=1\nS READ m\nS ADD m 1\nS ADD m 1\nS READ m\nS COMMIT\nS READ m\nS COMMIT\n', expectedStdout: 'S read m=1 v1\nS read m=3 v1\nS commit ok: m=3 v2\nS read m=3 v2\nS commit ok (read-only)\nm balance=3 version=2\ncommits=2 conflicts=0 rejected=0', hidden: true },
    ],
  },
];
