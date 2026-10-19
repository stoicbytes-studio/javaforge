import type { CurriculumModule } from '@/types/curriculum';

export const dsaModule: CurriculumModule = {
  id: 'dsa',
  order: 14,
  title: 'Data Structures, Algorithms and Problem Solving',
  shortTitle: 'DSA',
  summary: 'Reasoning about complexity, the core data structures and the JDK classes behind them, sorting and searching, the problem-solving patterns used in interviews and production, and recursion with dynamic programming.',
  level: 'advanced',
  prerequisites: ['collections'],
  bossChallengeId: 'boss-route-planner',
  lessons: [
    // -----------------------------------------------------------------------
    {
      id: 'a-complexity',
      moduleId: 'dsa',
      title: 'Complexity analysis: Big-O, time and space',
      summary: 'How to reason about growth rates, amortised costs, the real costs of Java collection operations, and when to measure instead.',
      estimatedMinutes: 35,
      difficulty: 'intermediate',
      prerequisites: ['c-collections-overview', 'f-methods'],
      objectives: [
        'Describe the running time and extra space of an algorithm in Big-O notation.',
        'Explain amortised analysis using ArrayList growth.',
        'State the complexity of core operations on ArrayList, LinkedList, ArrayDeque, HashMap, TreeMap and PriorityQueue.',
        'Spot hidden O(n^2) work, such as List.contains or String concatenation inside a loop.',
        'Decide when to reason on paper and when to measure with a profiler or JMH.',
      ],
      plainEnglish: `Big-O answers one question: **when the input gets bigger, how much more work does this code do?**

- **O(1)** — the same amount of work no matter how big the input is (reading \`array[i]\`, \`map.get(key)\`).
- **O(log n)** — the work grows by one step each time the input doubles (binary search, \`TreeMap.get\`).
- **O(n)** — double the input, double the work (one loop over the data).
- **O(n log n)** — a good sort.
- **O(n^2)** — double the input, four times the work (comparing every element with every other).

For 1,000 items, O(n^2) is a million steps — fine. For 1,000,000 items it is a trillion — a service that never responds. That is why engineers care about the *shape* of growth more than about the exact number of milliseconds.

**Space** complexity uses the same notation for extra memory: a HashSet of all n items is O(n) extra space; two index variables are O(1).`,
      technical: `### What Big-O means
f(n) is O(g(n)) if, beyond some input size, f(n) ≤ c·g(n) for a constant c. We drop constants and lower-order terms: 3n^2 + 10n + 7 is O(n^2). Big-O is an upper bound; in everyday use we mean the tightest one, and we usually talk about the **worst case** (sometimes the expected case for hashing).

### Rules of thumb
- Sequential blocks add: O(n) + O(n log n) = O(n log n).
- Nested loops multiply: a loop over n inside a loop over m is O(n·m).
- A loop whose counter doubles or halves runs O(log n) times.
- A recursive function that calls itself twice on n-1 is O(2^n); one that halves the input and does O(n) work per level (merge sort) is O(n log n).
- Library calls are not free: \`list.contains(x)\`, \`list.remove(0)\`, \`String.indexOf\` and \`s1 + s2\` are all O(n).

### Amortised analysis
\`ArrayList.add\` is usually O(1), but when the backing array is full it allocates a new array about 1.5 times larger and copies every element: O(n) for that one call. Because capacity grows *geometrically*, the copies over n appends sum to less than a small constant times n, so the **amortised** cost per add is O(1). Growing by a fixed amount (say +10) instead would make n appends cost O(n^2).

### Core Java collection costs
- \`ArrayList\`: get/set O(1); add at end amortised O(1); add/remove at index i O(n - i); contains/indexOf O(n).
- \`LinkedList\`: add/remove at either end O(1); get(i) O(n) — it must walk the nodes.
- \`ArrayDeque\`: push/pop/offer/poll at either end amortised O(1).
- \`HashMap\`/\`HashSet\`: get/put/contains/remove expected O(1); worst case O(log n) per bucket since Java 8 tree bins, but only with heavily colliding Comparable keys.
- \`TreeMap\`/\`TreeSet\`: get/put/remove/floor/ceiling O(log n); iteration in sorted order O(n).
- \`PriorityQueue\`: offer/poll O(log n); peek O(1); contains/remove(Object) O(n).
- \`Collections.sort\`/\`List.sort\`: O(n log n) (TimSort, stable); \`Arrays.sort(int[])\`: dual-pivot quicksort, O(n log n) expected.

### Reasoning vs measuring
Big-O predicts how cost **scales**; it says nothing about constants, caches, allocation or the JIT. An O(n) scan over a contiguous \`int[]\` can beat an O(log n) tree lookup for small n. Reason first to rule out bad growth, then **measure** real workloads: a profiler (JFR, async-profiler) for where time goes in production, and JMH for micro-benchmarks — never \`System.nanoTime\` around a cold loop.`,
      whyItExists: `Hardware gets faster by constant factors; input sizes grow by orders of magnitude. Complexity analysis lets you predict, before writing or running code, whether a design will survive 10x or 1000x more data, and gives engineers a shared vocabulary in design reviews and interviews.`,
      whenToUse: [
        'Before choosing a data structure or algorithm for data that can grow.',
        'When reviewing loops that call library methods (contains, remove, indexOf) on collections.',
        'When explaining a solution in an interview: always state time and space.',
        'To decide whether a slow endpoint needs a better algorithm or just a profiler.',
      ],
      whenNotToUse: [
        'Do not micro-optimise code paths that handle tiny, bounded inputs — clarity wins.',
        'Do not treat Big-O as a performance measurement; constants and memory layout matter in practice.',
        'Do not compare two O(n) solutions by Big-O alone — measure them.',
      ],
      examples: [
        {
          id: 'growth',
          title: 'Counting steps: log n vs n vs n^2',
          runnable: true,
          code: `public class Main {
    static long logarithmic(int n) {
        long steps = 0;
        for (int i = n; i > 1; i /= 2) steps++;   // halves each time
        return steps;
    }

    static long linear(int n) {
        long steps = 0;
        for (int i = 0; i < n; i++) steps++;
        return steps;
    }

    static long quadratic(int n) {
        long steps = 0;
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) steps++;   // every pair once
        }
        return steps;
    }

    public static void main(String[] args) {
        for (int n : new int[] {10, 100, 1_000, 10_000}) {
            System.out.println("n=" + n + "  log=" + logarithmic(n)
                + "  linear=" + linear(n) + "  pairs=" + quadratic(n));
        }
    }
}`,
          expectedOutput: `n=10  log=3  linear=10  pairs=45
n=100  log=6  linear=100  pairs=4950
n=1000  log=9  linear=1000  pairs=499500
n=10000  log=13  linear=10000  pairs=49995000`,
          explanation: 'Each tenfold increase in n adds about 3 steps to the logarithmic loop, multiplies the linear loop by 10 and the pairwise loop by about 100. The pairwise loop does n(n-1)/2 steps — still O(n^2), because constants are dropped.',
        },
        {
          id: 'amortised-growth',
          title: 'Why ArrayList.add is amortised O(1)',
          runnable: true,
          code: `import java.util.Locale;

public class Main {
    public static void main(String[] args) {
        int n = 1_000_000;
        int capacity = 10;               // ArrayList's first real capacity
        long copies = 0;
        int resizes = 0;
        for (int size = 0; size < n; size++) {
            if (size == capacity) {      // full: allocate a bigger array and copy
                copies += size;
                capacity = capacity + (capacity >> 1);   // grow by 50%
                resizes++;
            }
        }
        System.out.println("appends: " + n);
        System.out.println("resizes: " + resizes);
        System.out.println("elements copied: " + copies);
        System.out.println(String.format(Locale.ROOT, "copies per append: %.2f", (double) copies / n));
    }
}`,
          expectedOutput: `appends: 1000000
resizes: 29
elements copied: 2430972
copies per append: 2.43`,
          explanation: 'This simulates the copying ArrayList does as it grows. Although a few appends copy hundreds of thousands of elements, the total is only about 2.4 copies per append — bounded by a constant (at most 3 with 1.5x growth) no matter how large n gets — so the average (amortised) cost of add is O(1). Pre-sizing with new ArrayList<>(n) avoids the copies entirely.',
        },
        {
          id: 'hidden-quadratic',
          title: 'Hidden O(n^2): List.contains inside a loop',
          runnable: true,
          code: `import java.util.*;

public class Main {
    static long equalsCalls = 0;

    record Id(int value) {
        @Override
        public boolean equals(Object o) {
            equalsCalls++;
            return o instanceof Id other && other.value == value;
        }

        @Override
        public int hashCode() {
            return Integer.hashCode(value);
        }
    }

    static List<Id> dedupeSlow(List<Id> input) {
        List<Id> out = new ArrayList<>();
        for (Id id : input) {
            if (!out.contains(id)) out.add(id);   // contains scans the whole list
        }
        return out;
    }

    static List<Id> dedupeFast(List<Id> input) {
        return new ArrayList<>(new LinkedHashSet<>(input));   // hash lookups, keeps order
    }

    public static void main(String[] args) {
        List<Id> ids = new ArrayList<>();
        for (int i = 0; i < 2_000; i++) ids.add(new Id(i));

        equalsCalls = 0;
        System.out.println("slow: " + dedupeSlow(ids).size() + " ids, " + equalsCalls + " equals calls");

        equalsCalls = 0;
        System.out.println("fast: " + dedupeFast(ids).size() + " ids, " + equalsCalls + " equals calls");
    }
}`,
          expectedOutput: `slow: 2000 ids, 1999000 equals calls
fast: 2000 ids, 0 equals calls`,
          explanation: 'Both methods return the same result, but the slow one compares each new id with every id kept so far: 0 + 1 + ... + 1999 comparisons. The hash-based version compares hash codes first and calls equals only when two keys share a hash, which never happens here.',
        },
      ],
      walkthrough: {
        exampleId: 'hidden-quadratic',
        steps: [
          { lines: [6, 17], text: 'A record whose equals counts how often it is called, so we can count comparisons instead of timing them. hashCode stays consistent with equals.' },
          { lines: [19, 25], text: 'The loop runs n times and List.contains is a linear scan of the output so far. Nested O(n) inside O(n) gives O(n^2), even though only one loop is visible.' },
          { lines: [27, 29], text: 'LinkedHashSet uses hashing: each insertion is expected O(1), so the whole method is O(n) time and O(n) extra space, and it preserves the original order.' },
          { lines: [31, 33], text: 'Two thousand distinct ids are created. With a million ids the slow version would need about 500 billion comparisons.' },
          { lines: [35, 39], text: 'The counts make the difference concrete: n(n-1)/2 = 1,999,000 comparisons versus none. Same output, completely different scaling.' },
        ],
      },
      realWorld: {
        title: 'A nightly import that went from 4 minutes to 9 hours',
        scenario: `A product import checked each incoming SKU with \`existingSkus.contains(sku)\`, where \`existingSkus\` was an \`ArrayList\` loaded from the database. With 20,000 products the job took a few minutes, so nobody noticed. After a merger the catalogue grew to 600,000 products: 30 times more data, about 900 times more comparisons, and the job ran into business hours.

The fix was one line — load the SKUs into a \`HashSet\` — and the job dropped to under a minute. The review checklist gained a rule: any \`contains\`, \`indexOf\` or \`remove(Object)\` on a List inside a loop needs a justification.`,
      },
      commonMistakes: [
        {
          mistake: 'Calling List.contains, indexOf or remove(Object) inside a loop over a large collection.',
          why: 'Each call is O(n), so the loop becomes O(n^2).',
          fix: 'Build a HashSet or HashMap once (O(n)) and use O(1) expected lookups.',
          code: `Set<String> blocked = new HashSet<>(blockedList);
for (String email : emails) {
    if (blocked.contains(email)) reject(email);
}`,
        },
        {
          mistake: 'Building a String with += inside a loop.',
          why: 'Each concatenation copies the whole string so far, giving O(n^2) characters copied.',
          fix: 'Use a StringBuilder (or String.join / Collectors.joining).',
        },
        {
          mistake: 'Using LinkedList and get(i) in an indexed for loop.',
          why: 'get(i) walks from the nearest end every time, so the loop is O(n^2).',
          fix: 'Iterate with for-each (an iterator), or use ArrayList.',
        },
        {
          mistake: 'Judging performance from one System.nanoTime() measurement of a cold loop.',
          why: 'The JIT has not compiled the code yet and dead-code elimination may remove the work entirely.',
          fix: 'Reason about growth first; measure with JMH or a profiler on realistic data.',
        },
      ],
      checks: [
        {
          id: 'a1-c1',
          kind: 'predict-output',
          dimension: 'conceptual',
          prompt: 'How many times does the loop body run?',
          code: `public class Main {
    public static void main(String[] args) {
        int n = 1000;
        int steps = 0;
        for (int i = 1; i < n; i *= 2) steps++;
        System.out.println(steps);
    }
}`,
          options: [
            { id: 'a', text: '10' },
            { id: 'b', text: '9' },
            { id: 'c', text: '500' },
            { id: 'd', text: '1000' },
          ],
          correctOptionId: 'a',
          explanation: 'i takes the values 1, 2, 4, ..., 512 — ten values below 1000. A doubling counter gives O(log n) iterations: log2(1000) is just under 10.',
        },
        {
          id: 'a1-c2',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'What is the time complexity of this method?',
          code: `static int countPairs(int[] a, int target) {
    int count = 0;
    for (int i = 0; i < a.length; i++)
        for (int j = i + 1; j < a.length; j++)
            if (a[i] + a[j] == target) count++;
    return count;
}`,
          options: [
            { id: 'a', text: 'O(n), because the inner loop gets shorter each time' },
            { id: 'b', text: 'O(n log n)' },
            { id: 'c', text: 'O(n^2)' },
            { id: 'd', text: 'O(2^n)' },
          ],
          correctOptionId: 'c',
          explanation: 'The inner loop runs n-1, n-2, ..., 0 times: n(n-1)/2 iterations in total. Dropping the constant 1/2 and lower-order terms gives O(n^2).',
        },
        {
          id: 'a1-c3',
          kind: 'multi-select',
          dimension: 'interview',
          prompt: 'Which operations are O(1) (expected or amortised) for a collection holding n elements? Select all that apply.',
          options: [
            { id: 'a', text: 'HashMap.get(key)' },
            { id: 'b', text: 'ArrayList.get(i)' },
            { id: 'c', text: 'ArrayList.add(x) at the end' },
            { id: 'd', text: 'LinkedList.get(n / 2)' },
            { id: 'e', text: 'TreeMap.put(key, value)' },
            { id: 'f', text: 'ArrayList.remove(0)' },
            { id: 'g', text: 'ArrayDeque.pollFirst()' },
          ],
          correctOptionIds: ['a', 'b', 'c', 'g'],
          explanation: 'LinkedList.get walks nodes (O(n)); TreeMap.put is O(log n); ArrayList.remove(0) shifts every remaining element (O(n)). HashMap.get is expected O(1), ArrayList.add is amortised O(1), and ArrayDeque operations at the ends are O(1).',
        },
        {
          id: 'a1-c4',
          kind: 'mcq',
          dimension: 'debugging',
          prompt: '`emails` has n entries and `blocked` is an ArrayList with m entries. A profile shows this loop dominating request time. What is its complexity, and what is the best fix?',
          code: `for (String email : emails) {
    if (blocked.contains(email)) {
        rejected.add(email);
    }
}`,
          options: [
            { id: 'a', text: 'O(n); it is already optimal' },
            { id: 'b', text: 'O(n * m); copy blocked into a HashSet once, making the loop O(n + m)' },
            { id: 'c', text: 'O(n log m); sort blocked first' },
            { id: 'd', text: 'O(n * m); switch blocked to a LinkedList' },
          ],
          correctOptionId: 'b',
          explanation: 'ArrayList.contains is a linear scan, so the loop costs n * m comparisons. Building a HashSet costs O(m) once, then each lookup is expected O(1). Sorting plus binary search would give O((n + m) log m) — better, but not best. LinkedList.contains is also O(m).',
        },
        {
          id: 'a1-c5',
          kind: 'mcq',
          dimension: 'interview',
          prompt: 'An interviewer asks why ArrayList.add is "amortised O(1)" when some calls copy the entire array. Which answer is correct?',
          options: [
            { id: 'a', text: 'The JIT compiler removes the copying' },
            { id: 'b', text: 'Capacity grows geometrically (about 1.5x), so the total copying over n adds is proportional to n; averaged over all adds, each costs O(1)' },
            { id: 'c', text: 'ArrayList is really a linked list, so it never copies' },
            { id: 'd', text: 'The copy happens on a background thread' },
          ],
          correctOptionId: 'b',
          explanation: 'Amortised analysis averages the cost over a sequence of operations. Because each resize multiplies capacity, the expensive resizes become exponentially rarer, and the sum of all copies is a geometric series bounded by a constant times n.',
        },
        {
          id: 'a1-c6',
          kind: 'predict-output',
          dimension: 'conceptual',
          prompt: 'What does this print?',
          code: `public class Main {
    public static void main(String[] args) {
        int n = 5;
        int count = 0;
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < i; j++) {
                count++;
            }
        }
        System.out.println(count);
    }
}`,
          options: [
            { id: 'a', text: '25' },
            { id: 'b', text: '10' },
            { id: 'c', text: '15' },
            { id: 'd', text: '5' },
          ],
          correctOptionId: 'b',
          explanation: 'The inner loop runs 0 + 1 + 2 + 3 + 4 = 10 times, which is n(n-1)/2 — the triangular pattern behind most O(n^2) algorithms.',
        },
      ],
      challengeIds: [],
      masteryCriteria: [
        'State time and space complexity for any loop-based method, including library calls inside loops.',
        'Explain amortised O(1) for ArrayList.add and why geometric growth matters.',
        'Recall the complexity of core operations for the main Java collections.',
        'Explain when Big-O reasoning is enough and when to measure with JMH or a profiler.',
      ],
      relatedLessonIds: ['c-collections-overview', 'c-hashmap', 'a-data-structures', 'a-sorting-searching', 'a-patterns', 'r-memory-areas'],
      revision: [
        { id: 'r1', question: 'What does O(n^2) tell you about doubling the input?', answer: 'The work roughly quadruples. Constants and lower-order terms are ignored; only the growth rate matters.' },
        { id: 'r2', question: 'Why is ArrayList.add amortised O(1)?', answer: 'Capacity grows by about 50% when full, so the total cost of all copies over n adds is O(n); averaged per add, that is O(1).' },
        { id: 'r3', question: 'Name three library calls that are O(n) and dangerous inside loops.', answer: 'List.contains / indexOf, ArrayList.remove(0) or add(0, x), and String concatenation with + (each copies the whole string).' },
        { id: 'r4', question: 'When should you measure instead of reason?', answer: 'When comparing options with the same growth rate, when constants, caching or allocation matter, or to find where real production time goes — using a profiler or JMH, not a single cold timing.' },
      ],
    },
    // -----------------------------------------------------------------------
    {
      id: 'a-data-structures',
      moduleId: 'dsa',
      title: 'Core data structures: arrays, linked lists, stacks, queues, trees, heaps, hash tables and graphs',
      summary: 'What each core structure is, the cost of its operations, which Java class implements it, and how to represent trees and graphs yourself.',
      estimatedMinutes: 50,
      difficulty: 'intermediate',
      prerequisites: ['a-complexity', 'c-collections-overview'],
      objectives: [
        'Describe arrays, linked lists, stacks, queues, trees, heaps, hash tables and graphs and the cost of their core operations.',
        'Name the JDK class that implements each structure: ArrayList, LinkedList, ArrayDeque, PriorityQueue, TreeMap/TreeSet and HashMap/HashSet.',
        'Implement a singly linked list and a binary search tree with insert, search and in-order traversal.',
        'Distinguish binary trees, binary search trees, balanced BSTs, heaps and tries.',
        'Choose between an adjacency list and an adjacency matrix for a graph.',
      ],
      plainEnglish: `A **data structure** is a way of arranging data in memory so that the operations you need are cheap. There is no best structure — each one makes some operations fast by making others slow.

- **Array**: a row of numbered boxes side by side. Jump to box i instantly; inserting in the middle means shifting everything after it.
- **Linked list**: a chain of nodes, each pointing to the next. Adding at the front is instant; finding item 500 means walking 500 links.
- **Stack**: a pile of plates — last in, first out (undo history, the call stack).
- **Queue**: a line at a counter — first in, first out (jobs waiting to be processed).
- **Tree**: nodes with children, like folders inside folders. A **binary search tree** keeps smaller keys to the left and larger to the right, so each step discards half of what is left.
- **Heap**: a tree that always keeps the smallest (or largest) item on top — perfect for "what is next?".
- **Hash table**: turns a key into an array index, so lookups by key are (almost) instant.
- **Graph**: dots connected by lines — cities and roads, people and friendships, services and the calls between them.

Java already provides excellent implementations of most of these. Writing a couple by hand once teaches you what the library is doing for you.`,
      technical: `### Linear structures
- **Array** — contiguous memory, fixed size. Index O(1); insert/delete in the middle O(n); search O(n) unsorted, O(log n) sorted. Java: \`int[]\`, \`String[]\`; \`ArrayList\` is a resizable array (amortised O(1) append).
- **Linked list** — nodes holding a value and a reference to the next (and, if doubly linked, previous) node. Insert/remove at a known node O(1); access by index O(n); poor cache locality and about 24–32 extra bytes per node. Java: \`LinkedList\` (doubly linked, implements \`List\` and \`Deque\`).
- **Stack (LIFO)** — push, pop, peek O(1). Java: \`ArrayDeque\` via \`push\`/\`pop\`/\`peek\`. The legacy \`Stack\` class extends \`Vector\` (synchronized, exposes index access) and should not be used in new code.
- **Queue (FIFO)** / **deque** (both ends) — offer/poll at the ends O(1). Java: \`ArrayDeque\` (a circular array, faster than \`LinkedList\` and rejects null). Concurrent code uses \`BlockingQueue\` implementations.

### Non-linear structures
- **Binary tree** — each node has at most two children. Traversals: pre-order (node, left, right), **in-order** (left, node, right), post-order (left, right, node), and level-order (BFS with a queue).
- **Binary search tree (BST)** — for every node, keys in the left subtree are smaller and keys in the right are larger, so an in-order traversal yields sorted keys. Search/insert/delete are O(h), where h is the height: O(log n) if balanced, **O(n) if keys arrive in sorted order** (the tree degenerates into a list).
- **Balanced BST** — red-black or AVL trees re-balance on insert/delete to keep h = O(log n). Java: \`TreeMap\`/\`TreeSet\` are **red-black trees**, giving O(log n) get/put/remove plus ordered queries (\`floorKey\`, \`ceilingKey\`, \`headMap\`, \`subMap\`).
- **Binary heap** — a complete binary tree stored in an array (children of i at 2i+1 and 2i+2) where every parent is ≤ its children (min-heap). peek O(1), offer/poll O(log n), building from n items O(n). Java: \`PriorityQueue\` (min-heap by default; pass a comparator for max).
- **Trie (prefix tree)** — each edge is a character; lookups cost O(length of key), independent of how many keys are stored. Great for autocomplete and prefix matching. No JDK class — usually a node with a \`Map<Character, Node>\` or a 26-element array.
- **Hash table** — an array of buckets; \`hash(key)\` picks the bucket. get/put/remove expected O(1), worst case O(n) (or O(log n) in Java 8+ tree bins). No ordering. Java: \`HashMap\`/\`HashSet\` (separate chaining, resize at load factor 0.75), \`LinkedHashMap\` (insertion or access order).
- **Graph** — vertices V and edges E; directed or undirected, weighted or unweighted, cyclic or acyclic (a DAG). Two representations:
  - **Adjacency list** (\`List<List<Integer>>\` or \`Map<V, List<V>>\`): O(V + E) memory, iterate neighbours in O(degree). The default for sparse, real-world graphs.
  - **Adjacency matrix** (\`boolean[V][V]\` or \`int[V][V]\` of weights): O(V^2) memory, edge check O(1). Good for small or dense graphs.
  The JDK has no general graph type; build one from collections.

### Picking a structure
Start from the operations: "lookup by key" → HashMap; "sorted keys or nearest key" → TreeMap; "always the smallest next" → PriorityQueue; "both ends" → ArrayDeque; "by index, mostly appends" → ArrayList. Choose \`LinkedList\` only when you really insert or remove through an iterator in the middle of long lists — \`ArrayList\` and \`ArrayDeque\` win almost everywhere else because contiguous memory is cache-friendly.`,
      whyItExists: `Every algorithm runs on top of a data structure, and the structure usually decides the complexity: the same "find duplicates" code is O(n^2) on a list and O(n) with a hash set. Knowing the core structures — and which JDK class implements each — lets you pick the right tool in seconds, read library and framework code, and answer the most common interview questions.`,
      whenToUse: [
        'Use ArrayList for indexed, mostly-append data; ArrayDeque for stacks and queues.',
        'Use HashMap/HashSet for fast lookup by key when order does not matter.',
        'Use TreeMap/TreeSet when you need sorted iteration or floor/ceiling/range queries.',
        'Use PriorityQueue when you repeatedly need the smallest or largest remaining item.',
        'Model relationships (routes, dependencies, social links) as a graph with adjacency lists.',
        'Use a trie for prefix search over many strings.',
      ],
      whenNotToUse: [
        'Do not hand-write linked lists, trees or hash tables in production when a JDK collection fits — use them to learn.',
        'Do not use the legacy Stack or Vector classes in new code; use ArrayDeque or ArrayList.',
        'Do not use LinkedList for random access by index.',
        'Do not use an adjacency matrix for large sparse graphs: a million vertices would need a trillion cells.',
      ],
      examples: [
        {
          id: 'a4-linked-list',
          title: 'A hand-written singly linked list',
          runnable: true,
          code: `public class Main {
    // A minimal singly linked list of ints: each node points to the next one.
    static class Node {
        int value;
        Node next;
        Node(int value, Node next) { this.value = value; this.next = next; }
    }

    static class IntList {
        private Node head;
        private Node tail;
        private int size;

        void addFirst(int v) {                 // O(1): new node points at the old head
            head = new Node(v, head);
            if (tail == null) tail = head;
            size++;
        }

        void addLast(int v) {                  // O(1) because we keep a tail pointer
            Node n = new Node(v, null);
            if (tail == null) head = tail = n;
            else { tail.next = n; tail = n; }
            size++;
        }

        boolean remove(int v) {                // O(n): must find the node before it
            Node prev = null;
            for (Node cur = head; cur != null; prev = cur, cur = cur.next) {
                if (cur.value == v) {
                    if (prev == null) head = cur.next; else prev.next = cur.next;
                    if (cur == tail) tail = prev;
                    size--;
                    return true;
                }
            }
            return false;
        }

        void reverse() {                       // O(n) time, O(1) extra space
            Node prev = null, cur = head;
            tail = head;
            while (cur != null) {
                Node next = cur.next;
                cur.next = prev;
                prev = cur;
                cur = next;
            }
            head = prev;
        }

        @Override
        public String toString() {
            StringBuilder sb = new StringBuilder("[");
            for (Node cur = head; cur != null; cur = cur.next) {
                sb.append(cur.value);
                if (cur.next != null) sb.append(" -> ");
            }
            return sb.append("] size=").append(size).toString();
        }
    }

    public static void main(String[] args) {
        IntList list = new IntList();
        list.addLast(2);
        list.addLast(3);
        list.addFirst(1);
        list.addLast(4);
        System.out.println(list);
        System.out.println("remove 3: " + list.remove(3) + " " + list);
        System.out.println("remove 9: " + list.remove(9));
        list.reverse();
        System.out.println("reversed: " + list);
        list.addLast(0);
        System.out.println("addLast 0: " + list);
    }
}`,
          expectedOutput: `[1 -> 2 -> 3 -> 4] size=4
remove 3: true [1 -> 2 -> 4] size=3
remove 9: false
reversed: [4 -> 2 -> 1] size=3
addLast 0: [4 -> 2 -> 1 -> 0] size=4`,
          explanation: 'Keeping both head and tail references makes addFirst and addLast O(1). remove must walk to the node before the target, so it is O(n). reverse re-points every next reference in a single pass — a classic interview exercise. Note that tail becomes the old head after reversing.',
        },
        {
          id: 'a4-bst',
          title: 'Binary search tree: insert, search, in-order traversal',
          runnable: true,
          code: `import java.util.*;

public class Main {
    static class Node {
        final int key;
        Node left, right;
        Node(int key) { this.key = key; }
    }

    // Recursive insert: smaller keys go left, larger go right, duplicates ignored.
    static Node insert(Node root, int key) {
        if (root == null) return new Node(key);
        if (key < root.key) root.left = insert(root.left, key);
        else if (key > root.key) root.right = insert(root.right, key);
        return root;
    }

    static boolean contains(Node root, int key) {
        Node cur = root;
        while (cur != null) {
            if (key == cur.key) return true;
            cur = key < cur.key ? cur.left : cur.right;   // discard half the tree
        }
        return false;
    }

    // In-order: left subtree, node, right subtree => keys in sorted order.
    static void inOrder(Node node, List<Integer> out) {
        if (node == null) return;
        inOrder(node.left, out);
        out.add(node.key);
        inOrder(node.right, out);
    }

    static int height(Node node) {
        return node == null ? 0 : 1 + Math.max(height(node.left), height(node.right));
    }

    public static void main(String[] args) {
        Node root = null;
        for (int k : new int[] {50, 30, 70, 20, 40, 60, 80, 30}) root = insert(root, k);
        List<Integer> sorted = new ArrayList<>();
        inOrder(root, sorted);
        System.out.println("in-order: " + sorted);
        System.out.println("height: " + height(root));
        System.out.println("contains 60: " + contains(root, 60) + ", contains 65: " + contains(root, 65));

        Node skewed = null;
        for (int k = 1; k <= 7; k++) skewed = insert(skewed, k);   // sorted input
        System.out.println("skewed height: " + height(skewed));
    }
}`,
          expectedOutput: `in-order: [20, 30, 40, 50, 60, 70, 80]
height: 3
contains 60: true, contains 65: false
skewed height: 7`,
          explanation: 'Seven keys in a well-shaped tree need only 3 levels, so a search makes at most 3 comparisons. Inserting the same keys in sorted order builds a chain 7 levels tall: every search becomes a linear walk. This is exactly the problem red-black trees (TreeMap) solve by re-balancing.',
        },
        {
          id: 'a4-jdk-structures',
          title: 'The JDK implementations in action',
          runnable: true,
          code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        // Stack (LIFO) and queue (FIFO) with ArrayDeque
        Deque<String> stack = new ArrayDeque<>();
        stack.push("a"); stack.push("b"); stack.push("c");
        Deque<String> queue = new ArrayDeque<>();
        queue.offer("a"); queue.offer("b"); queue.offer("c");
        System.out.println("stack pop: " + stack.pop() + ", queue poll: " + queue.poll());

        // Binary heap: poll always returns the smallest
        PriorityQueue<Integer> heap = new PriorityQueue<>(List.of(42, 7, 19, 3, 25));
        StringBuilder order = new StringBuilder();
        while (!heap.isEmpty()) order.append(heap.poll()).append(' ');
        System.out.println("heap order: " + order.toString().trim());

        // Red-black tree: sorted keys and nearest-key queries in O(log n)
        TreeMap<Integer, String> tiers = new TreeMap<>(Map.of(0, "free", 100, "silver", 1000, "gold"));
        System.out.println("tier for 250: " + tiers.floorEntry(250).getValue()
            + ", next threshold: " + tiers.higherKey(250));

        // Hash table: expected O(1) counting
        Map<String, Integer> counts = new HashMap<>();
        for (String w : "to be or not to be".split(" ")) counts.merge(w, 1, Integer::sum);
        System.out.println("count of 'be': " + counts.get("be"));

        // Graph: adjacency list vs adjacency matrix for edges 0-1, 0-2, 2-3
        int n = 4;
        int[][] edges = {{0, 1}, {0, 2}, {2, 3}};
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        boolean[][] matrix = new boolean[n][n];
        for (int[] e : edges) {
            adj.get(e[0]).add(e[1]); adj.get(e[1]).add(e[0]);
            matrix[e[0]][e[1]] = matrix[e[1]][e[0]] = true;
        }
        System.out.println("neighbours of 0 (list): " + adj.get(0));
        System.out.println("edge 1-3? (matrix): " + matrix[1][3]);
    }
}`,
          expectedOutput: `stack pop: c, queue poll: a
heap order: 3 7 19 25 42
tier for 250: silver, next threshold: 1000
count of 'be': 2
neighbours of 0 (list): [1, 2]
edge 1-3? (matrix): false`,
          explanation: 'One ArrayDeque serves as both a stack (push/pop at the head) and a queue (offer at the tail, poll at the head). PriorityQueue returns elements in priority order only through poll. TreeMap answers "which tier does 250 fall into?" with floorEntry in O(log n). The adjacency list stores only real edges; the matrix answers "is there an edge?" in O(1) but uses n x n cells.',
        },
      ],
      walkthrough: {
        exampleId: 'a4-bst',
        steps: [
          { lines: [4, 8], text: 'A node holds a key and references to two children. A null reference means "no subtree here".' },
          { lines: [10, 16], text: 'Insert follows the BST rule recursively: go left for smaller keys, right for larger, and create a node when it reaches an empty spot. Equal keys are ignored, so the tree behaves like a set.' },
          { lines: [18, 25], text: 'Search is a loop, not recursion: at each node compare once and continue into one subtree only. The cost is the height of the tree, O(log n) when balanced.' },
          { lines: [27, 33], text: 'In-order traversal visits the left subtree, then the node, then the right subtree. Because of the BST rule, this produces keys in ascending order.' },
          { lines: [35, 37], text: 'Height is 1 plus the taller child subtree; an empty tree has height 0.' },
          { lines: [39, 46], text: 'Inserting 50, 30, 70, 20, 40, 60, 80 builds a perfectly balanced tree of height 3; the duplicate 30 is skipped. 65 is not found after following 50 → 70 → 60 → empty right child.' },
          { lines: [48, 50], text: 'Sorted input always goes right, producing a degenerate tree of height 7 — effectively a linked list with O(n) operations.' },
        ],
      },
      realWorld: {
        title: 'Choosing structures for a ride-hailing dispatcher',
        scenario: `A dispatch service matched riders to drivers. Driver profiles lived in a \`HashMap<DriverId, Driver>\` for O(1) lookup by id. Waiting ride requests were a \`PriorityQueue\` ordered by request time and rider tier, so the next request to serve was always one \`poll\` away. Surge-pricing bands were a \`TreeMap<Integer, Multiplier>\` keyed by demand level, queried with \`floorEntry\`. The road network was a weighted graph stored as adjacency lists, because each intersection connects to only a handful of roads — a matrix for 2 million intersections would have needed 4 trillion cells.

The first prototype had kept waiting requests in an \`ArrayList\` and scanned it for the best one on every dispatch: O(n) per match. Switching to the heap made each match O(log n), and dispatch latency stopped growing with the evening rush.`,
      },
      commonMistakes: [
        {
          mistake: 'Using java.util.Stack or LinkedList as the default stack or queue.',
          why: 'Stack is a synchronized Vector subclass with index access; LinkedList allocates a node per element and has poor cache locality.',
          fix: 'Use ArrayDeque: push/pop for a stack, offer/poll for a queue.',
          code: `Deque<Integer> stack = new ArrayDeque<>();
stack.push(1);
int top = stack.pop();`,
        },
        {
          mistake: 'Assuming a plain binary search tree is always O(log n).',
          why: 'Its height depends on insertion order; sorted input produces a chain with O(n) operations.',
          fix: 'Use a self-balancing tree (TreeMap/TreeSet), or shuffle input when building a simple BST.',
        },
        {
          mistake: 'Expecting PriorityQueue iteration or toString to be sorted.',
          why: 'A heap only guarantees that the root is the minimum; the array behind it is only partially ordered.',
          fix: 'Call poll repeatedly to get elements in order, or copy into a list and sort it.',
        },
        {
          mistake: 'Losing the rest of a linked list when inserting or reversing.',
          why: 'Overwriting node.next before saving the old reference cuts the chain, and the remaining nodes become unreachable.',
          fix: 'Save next in a local variable first, then re-point references.',
        },
        {
          mistake: 'Building an adjacency matrix for a big sparse graph.',
          why: 'Memory is O(V^2) regardless of how few edges exist.',
          fix: 'Use adjacency lists: memory O(V + E), neighbour iteration O(degree).',
        },
      ],
      checks: [
        {
          id: 'a4-c1',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'ArrayDeque used from both ends. What does this print?',
          code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Deque<Integer> d = new ArrayDeque<>();
        d.push(1);
        d.push(2);
        d.offerLast(3);
        System.out.println(d.pop() + " " + d.pollLast() + " " + d.peek());
    }
}`,
          options: [
            { id: 'a', text: '2 3 1' },
            { id: 'b', text: '1 3 2' },
            { id: 'c', text: '2 1 3' },
            { id: 'd', text: '3 2 1' },
          ],
          correctOptionId: 'a',
          explanation: 'push adds at the head, so after two pushes the deque is [2, 1]; offerLast appends 3 at the tail: [2, 1, 3]. pop removes the head (2), pollLast removes the tail (3), and peek shows the remaining head (1).',
        },
        {
          id: 'a4-c2',
          kind: 'mcq',
          dimension: 'interview',
          prompt: 'Which statement about TreeMap is correct?',
          options: [
            { id: 'a', text: 'It is a hash table that sorts keys when you iterate' },
            { id: 'b', text: 'It is a red-black tree: get/put/remove are O(log n) and keys are kept in sorted order' },
            { id: 'c', text: 'It is a binary heap, so only the smallest key is quick to reach' },
            { id: 'd', text: 'It is a plain BST, so sorted insertions make it O(n)' },
          ],
          correctOptionId: 'b',
          explanation: 'TreeMap is a self-balancing red-black tree. Re-balancing keeps the height O(log n) whatever the insertion order, and in-order iteration returns sorted keys.',
        },
        {
          id: 'a4-c3',
          kind: 'predict-output',
          dimension: 'coding',
          prompt: 'What does this print?',
          code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        TreeMap<Integer, String> m = new TreeMap<>();
        m.put(10, "a");
        m.put(30, "b");
        m.put(20, "c");
        System.out.println(m.firstKey() + " " + m.floorKey(25) + " " + m.ceilingKey(31) + " " + m.keySet());
    }
}`,
          options: [
            { id: 'a', text: '10 20 null [10, 20, 30]' },
            { id: 'b', text: '10 30 30 [10, 30, 20]' },
            { id: 'c', text: '10 20 30 [10, 20, 30]' },
            { id: 'd', text: '10 25 null [10, 30, 20]' },
          ],
          correctOptionId: 'a',
          explanation: 'Keys are kept sorted regardless of insertion order. floorKey(25) is the greatest key ≤ 25 (20); ceilingKey(31) is the least key ≥ 31, and there is none, so it returns null.',
        },
        {
          id: 'a4-c4',
          kind: 'multi-select',
          dimension: 'conceptual',
          prompt: 'Which statements are true? Select all that apply.',
          options: [
            { id: 'a', text: 'In-order traversal of a binary search tree visits keys in ascending order' },
            { id: 'b', text: 'A binary heap keeps all elements fully sorted in its backing array' },
            { id: 'c', text: 'Looking up a word in a trie costs time proportional to the word length, not the number of words stored' },
            { id: 'd', text: 'LinkedList.get(i) is O(1) because it is a List' },
            { id: 'e', text: 'PriorityQueue.peek is O(1) and poll is O(log n)' },
          ],
          correctOptionIds: ['a', 'c', 'e'],
          explanation: 'A heap only guarantees the parent-child ordering, not a sorted array. LinkedList.get(i) walks nodes from the nearer end, O(n).',
        },
        {
          id: 'a4-c5',
          kind: 'mcq',
          dimension: 'interview',
          prompt: 'A road network has 1,000,000 intersections and about 3,000,000 road segments. How should you store it for route finding?',
          options: [
            { id: 'a', text: 'Adjacency matrix: O(1) edge checks are worth it' },
            { id: 'b', text: 'Adjacency lists: about V + E entries, and BFS/Dijkstra only iterate neighbours' },
            { id: 'c', text: 'A single sorted array of intersection names' },
            { id: 'd', text: 'A TreeMap from intersection to every other intersection' },
          ],
          correctOptionId: 'b',
          explanation: 'The graph is sparse: each node has a few neighbours. A matrix would need 10^12 cells; adjacency lists need memory proportional to V + E, and traversal algorithms run in O(V + E).',
        },
        {
          id: 'a4-c6',
          kind: 'mcq',
          dimension: 'debugging',
          prompt: 'A team built a plain (unbalanced) BST of user ids, inserting ids as they were assigned: 1, 2, 3, ... Lookups got slower as users grew. Why?',
          options: [
            { id: 'a', text: 'BSTs are always O(n)' },
            { id: 'b', text: 'Sorted insertions make every new node a right child, so the tree is a chain of height n and lookups are O(n)' },
            { id: 'c', text: 'Integer keys hash badly' },
            { id: 'd', text: 'The garbage collector moves tree nodes' },
          ],
          correctOptionId: 'b',
          explanation: 'An unbalanced BST is only as good as its shape. Ascending keys degenerate it into a linked list. A red-black tree (TreeMap) or a HashMap fixes it.',
        },
      ],
      challengeIds: [],
      masteryCriteria: [
        'State the cost of the core operations of every structure in the lesson and the JDK class that implements it.',
        'Implement a singly linked list (add, remove, reverse) and a BST (insert, search, in-order) from memory.',
        'Explain why a plain BST can degrade to O(n) and how red-black trees prevent it.',
        'Choose between adjacency list and matrix for a given graph and justify it.',
      ],
      relatedLessonIds: ['a-complexity', 'a-sorting-searching', 'c-collections-overview', 'c-hashmap', 'c-sorted', 'a-patterns'],
      revision: [
        { id: 'r1', question: 'Which JDK class should you use for a stack, and for a queue?', answer: 'ArrayDeque for both: push/pop/peek for a stack, offer/poll/peek for a queue. Avoid the legacy Stack class.' },
        { id: 'r2', question: 'What property defines a binary search tree, and what does in-order traversal produce?', answer: 'Every key in a node\'s left subtree is smaller and every key in its right subtree is larger. In-order traversal (left, node, right) yields the keys in sorted order.' },
        { id: 'r3', question: 'What data structure is TreeMap, and PriorityQueue?', answer: 'TreeMap is a red-black (self-balancing binary search) tree with O(log n) operations; PriorityQueue is an array-based binary min-heap with O(log n) offer/poll and O(1) peek.' },
        { id: 'r4', question: 'Adjacency list or adjacency matrix?', answer: 'List for sparse graphs (O(V + E) memory, fast neighbour iteration); matrix for small or dense graphs or when O(1) edge checks matter (O(V^2) memory).' },
        { id: 'r5', question: 'When is a trie better than a HashSet of strings?', answer: 'When you need prefix queries (autocomplete, "all words starting with ab"): a trie walks the prefix in O(prefix length), while a hash set must scan every key.' },
      ],
    },
    // -----------------------------------------------------------------------
    {
      id: 'a-sorting-searching',
      moduleId: 'dsa',
      title: 'Sorting and searching algorithms',
      summary: 'Linear and binary search; bubble, selection and insertion sort for intuition; merge, quick, heap and counting sort; stability, in-place sorting, and what Java\'s own sort methods use.',
      estimatedMinutes: 50,
      difficulty: 'intermediate',
      prerequisites: ['a-complexity', 'a-data-structures'],
      versionNotes: [
        { feature: 'Dual-pivot quicksort for primitive arrays in Arrays.sort', since: 7 },
        { feature: 'TimSort for object arrays and Collections.sort', since: 7 },
        { feature: 'List.sort as a default method', since: 8 },
      ],
      objectives: [
        'Implement linear search and binary search and state their complexity.',
        'Explain how bubble, selection, insertion, merge, quick, heap and counting sort work.',
        'Compare sorting algorithms by best, average and worst case, extra space, and stability.',
        'Explain what Arrays.sort and List.sort use in Java and why objects need a stable sort.',
        'Use Arrays.binarySearch correctly, including its negative insertion-point result.',
      ],
      plainEnglish: `**Searching** means finding an item. If the data is unsorted you must look at every item (linear search). If it is sorted you can open the middle, see which half the item must be in, and throw the other half away — **binary search** finds one item among a million in about 20 steps.

**Sorting** puts items in order, and it is worth learning a few algorithms because they teach the main ideas of algorithm design:

- **Bubble, selection and insertion sort** compare neighbours or pick the minimum again and again. Simple, but O(n^2) — fine for 20 items, hopeless for a million. Insertion sort is still useful for tiny or nearly-sorted inputs.
- **Merge sort** splits the list in half, sorts each half and merges them — always O(n log n).
- **Quick sort** picks a pivot and partitions smaller items to its left and larger to its right — usually the fastest in practice.
- **Heap sort** uses a heap to pull out the largest item repeatedly.
- **Counting sort** does not compare at all: it counts how many times each small integer appears.

A sort is **stable** if items with equal keys keep their original order — important when you sort by one field after another. In real Java code you almost never write a sort: you call \`Arrays.sort\` or \`list.sort\`, but knowing what they do helps you use them well.`,
      technical: `### Searching
- **Linear search** — O(n), works on anything, including unsorted and linked data.
- **Binary search** — O(log n) on sorted random-access data. Keep the invariant explicit: closed range [lo, hi] with \`while (lo <= hi)\`, or half-open [lo, hi) with \`while (lo < hi)\`. Compute \`mid = lo + (hi - lo) / 2\` to avoid int overflow. \`Arrays.binarySearch\` / \`Collections.binarySearch\` return the index if found, otherwise \`-(insertionPoint) - 1\`; with duplicates the index returned is unspecified.
- On a \`TreeMap\`/\`TreeSet\`, \`floor\`/\`ceiling\` give binary-search-like queries on dynamic data.

### Elementary sorts (for intuition)
- **Bubble sort** — repeatedly swap adjacent out-of-order pairs. O(n^2) average/worst; O(n) best with an early-exit flag. Stable, in place.
- **Selection sort** — repeatedly select the minimum of the unsorted part and swap it to the front. Always O(n^2) comparisons but only O(n) swaps. In place, **not stable**.
- **Insertion sort** — grow a sorted prefix by inserting the next element into place. O(n^2) worst, **O(n) on nearly-sorted input**. Stable, in place. Real libraries use it for small sub-arrays.

### Efficient comparison sorts
- **Merge sort** — divide in half, sort recursively, merge. O(n log n) in every case, **stable**, needs O(n) extra space. Good for linked lists and external (on-disk) sorting.
- **Quick sort** — partition around a pivot, recurse on both sides. O(n log n) expected, O(n^2) worst (e.g. sorted input with a first/last-element pivot), O(log n) stack space. In place, **not stable**. Random or median-of-three pivots make the worst case unlikely.
- **Heap sort** — build a max-heap in O(n), then swap the root to the end and sift down, n times. O(n log n) worst case, O(1) extra space, not stable, and cache-unfriendly, so usually slower than quicksort in practice.
- **Lower bound**: any comparison sort needs Ω(n log n) comparisons in the worst case, because it must distinguish n! possible orderings and each comparison yields one bit.

### Non-comparison sorts
- **Counting sort** — for integers in a small range [0, k): count occurrences, then emit. O(n + k) time and space; can be made stable with prefix sums. **Radix sort** applies a stable counting sort digit by digit (O(d·(n + k))).

### What Java uses
- \`Arrays.sort(int[])\` and other **primitive** arrays: **dual-pivot quicksort** (Yaroslavskiy, Bentley and Bloch; JDK 7+), with insertion sort for tiny ranges and, since JDK 14, a heap-sort fallback that guarantees O(n log n). Stability does not matter for primitives — equal ints are indistinguishable.
- \`Arrays.sort(Object[])\`, \`Collections.sort\`, \`List.sort\`: **TimSort**, a stable, adaptive merge sort derived from Python. O(n log n) worst case and close to O(n) on already-sorted or partially sorted data.
- \`Arrays.parallelSort\` splits large arrays across the common ForkJoinPool.
Comparators must be consistent (a total order); TimSort may throw \`IllegalArgumentException: Comparison method violates its general contract!\` when they are not.`,
      whyItExists: `Sorting and searching are the most common operations in computing: indexes, leaderboards, reports, deduplication, merging data from two systems. The algorithms behind them also teach the core design techniques — brute force, divide and conquer, partitioning, using a data structure (heap), and exploiting a limited key range — that appear in every other algorithm.`,
      whenToUse: [
        'Use binary search whenever data is sorted and supports random access.',
        'Call Arrays.sort or List.sort in real code; supply a Comparator built with Comparator.comparing and thenComparing.',
        'Rely on stability to sort by several keys: sort by the secondary key first, then by the primary key (or use thenComparing).',
        'Consider counting or radix sort for large arrays of small integers.',
        'Use insertion sort only for tiny or nearly-sorted arrays.',
      ],
      whenNotToUse: [
        'Do not hand-write sorts in production code; the JDK sorts are tuned and tested.',
        'Do not binary-search unsorted data or a LinkedList — results are wrong or O(n) anyway.',
        'Do not sort just to find a minimum, maximum or top-k element; a single pass or a heap is cheaper.',
        'Do not use subtraction-based comparators that can overflow.',
      ],
      examples: [
        {
          id: 'a5-sorts',
          title: 'Merge, quick, heap and counting sort',
          runnable: true,
          code: `import java.util.*;

public class Main {
    // Merge sort: split in half, sort each half, merge. O(n log n) always, stable, O(n) extra space.
    static void mergeSort(int[] a, int[] tmp, int lo, int hi) {   // sorts a[lo..hi)
        if (hi - lo < 2) return;
        int mid = (lo + hi) >>> 1;
        mergeSort(a, tmp, lo, mid);
        mergeSort(a, tmp, mid, hi);
        int i = lo, j = mid, k = lo;
        while (i < mid && j < hi) tmp[k++] = a[i] <= a[j] ? a[i++] : a[j++];   // <= keeps it stable
        while (i < mid) tmp[k++] = a[i++];
        while (j < hi) tmp[k++] = a[j++];
        System.arraycopy(tmp, lo, a, lo, hi - lo);
    }

    // Quick sort (Lomuto partition): in place, O(n log n) expected, O(n^2) worst case.
    static void quickSort(int[] a, int lo, int hi) {              // sorts a[lo..hi]
        if (lo >= hi) return;
        int pivot = a[hi], p = lo;
        for (int i = lo; i < hi; i++) {
            if (a[i] < pivot) swap(a, i, p++);
        }
        swap(a, p, hi);                    // pivot lands in its final position
        quickSort(a, lo, p - 1);
        quickSort(a, p + 1, hi);
    }

    // Heap sort: build a max-heap, then move the max to the end n times. O(n log n), in place, unstable.
    static void heapSort(int[] a) {
        for (int i = a.length / 2 - 1; i >= 0; i--) siftDown(a, i, a.length);
        for (int end = a.length - 1; end > 0; end--) {
            swap(a, 0, end);
            siftDown(a, 0, end);
        }
    }

    static void siftDown(int[] a, int i, int size) {
        while (2 * i + 1 < size) {
            int child = 2 * i + 1;
            if (child + 1 < size && a[child + 1] > a[child]) child++;
            if (a[i] >= a[child]) return;
            swap(a, i, child);
            i = child;
        }
    }

    // Counting sort: no comparisons at all. O(n + k) for values in [0, k).
    static int[] countingSort(int[] a, int k) {
        int[] count = new int[k];
        for (int x : a) count[x]++;
        int[] out = new int[a.length];
        int idx = 0;
        for (int v = 0; v < k; v++) {
            while (count[v]-- > 0) out[idx++] = v;
        }
        return out;
    }

    static void swap(int[] a, int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; }

    public static void main(String[] args) {
        int[] data = {5, 2, 9, 1, 5, 6, 3, 8};

        int[] m = data.clone();
        mergeSort(m, new int[m.length], 0, m.length);
        System.out.println("merge:    " + Arrays.toString(m));

        int[] q = data.clone();
        quickSort(q, 0, q.length - 1);
        System.out.println("quick:    " + Arrays.toString(q));

        int[] h = data.clone();
        heapSort(h);
        System.out.println("heap:     " + Arrays.toString(h));

        System.out.println("counting: " + Arrays.toString(countingSort(data, 10)));

        int[] jdk = data.clone();
        Arrays.sort(jdk);                  // dual-pivot quicksort for primitives
        System.out.println("JDK:      " + Arrays.toString(jdk));
    }
}`,
          expectedOutput: `merge:    [1, 2, 3, 5, 5, 6, 8, 9]
quick:    [1, 2, 3, 5, 5, 6, 8, 9]
heap:     [1, 2, 3, 5, 5, 6, 8, 9]
counting: [1, 2, 3, 5, 5, 6, 8, 9]
JDK:      [1, 2, 3, 5, 5, 6, 8, 9]`,
          explanation: 'Four very different strategies produce the same result. Merge sort divides and merges (stable, extra array); quick sort partitions in place around a pivot; heap sort turns the array into a max-heap and repeatedly moves the largest element to the end; counting sort never compares elements at all.',
        },
        {
          id: 'a5-stability',
          title: 'Stability and adaptivity: insertion vs selection sort vs List.sort',
          runnable: true,
          code: `import java.util.*;

public class Main {
    record Order(String customer, int priority) {}

    static long comparisons = 0;

    // Insertion sort: stable, in place, O(n^2) worst, O(n) on already-sorted input.
    static void insertionSort(Order[] a) {
        for (int i = 1; i < a.length; i++) {
            Order key = a[i];
            int j = i - 1;
            while (j >= 0 && greater(a[j], key)) {   // strictly greater: equal keys keep their order
                a[j + 1] = a[j];
                j--;
            }
            a[j + 1] = key;
        }
    }

    // Selection sort: in place, always O(n^2), and NOT stable (the long-distance swap reorders equals).
    static void selectionSort(Order[] a) {
        for (int i = 0; i < a.length - 1; i++) {
            int min = i;
            for (int j = i + 1; j < a.length; j++) {
                if (greater(a[min], a[j])) min = j;
            }
            Order t = a[i]; a[i] = a[min]; a[min] = t;
        }
    }

    static boolean greater(Order x, Order y) {
        comparisons++;
        return x.priority() > y.priority();
    }

    static String names(Order[] a) {
        StringBuilder sb = new StringBuilder();
        for (Order o : a) sb.append(o.customer()).append(o.priority()).append(' ');
        return sb.toString().trim();
    }

    public static void main(String[] args) {
        Order[] input = {
            new Order("Ann", 2), new Order("Bob", 1), new Order("Cat", 2),
            new Order("Dan", 1), new Order("Eve", 3)
        };

        Order[] ins = input.clone();
        insertionSort(ins);
        System.out.println("insertion: " + names(ins));

        Order[] sel = input.clone();
        selectionSort(sel);
        System.out.println("selection: " + names(sel));

        List<Order> list = new ArrayList<>(Arrays.asList(input));
        list.sort(Comparator.comparingInt(Order::priority));   // TimSort: stable
        System.out.println("List.sort: " + names(list.toArray(new Order[0])));

        Order[] sorted = ins.clone();
        comparisons = 0;
        insertionSort(sorted);
        System.out.println("insertion on sorted input: " + comparisons + " comparisons");
        comparisons = 0;
        selectionSort(sorted);
        System.out.println("selection on sorted input: " + comparisons + " comparisons");
    }
}`,
          expectedOutput: `insertion: Bob1 Dan1 Ann2 Cat2 Eve3
selection: Bob1 Dan1 Cat2 Ann2 Eve3
List.sort: Bob1 Dan1 Ann2 Cat2 Eve3
insertion on sorted input: 4 comparisons
selection on sorted input: 10 comparisons`,
          explanation: 'Ann and Cat both have priority 2 and Ann came first. Insertion sort and List.sort (TimSort) keep Ann before Cat — they are stable. Selection sort swaps Ann far down the array and reverses them. On already-sorted input insertion sort needs only n - 1 comparisons, while selection sort always makes n(n - 1)/2.',
        },
        {
          id: 'a5-search',
          title: 'Linear vs binary search on a million sorted numbers',
          runnable: true,
          code: `import java.util.*;

public class Main {
    static int steps;

    static int linearSearch(int[] a, int target) {
        steps = 0;
        for (int i = 0; i < a.length; i++) {
            steps++;
            if (a[i] == target) return i;
        }
        return -1;
    }

    static int binarySearch(int[] sorted, int target) {
        steps = 0;
        int lo = 0, hi = sorted.length - 1;          // closed range [lo, hi]
        while (lo <= hi) {
            steps++;
            int mid = lo + (hi - lo) / 2;
            if (sorted[mid] == target) return mid;
            if (sorted[mid] < target) lo = mid + 1;
            else hi = mid - 1;
        }
        return -(lo + 1);                             // same convention as Arrays.binarySearch
    }

    public static void main(String[] args) {
        int[] a = new int[1_000_000];
        for (int i = 0; i < a.length; i++) a[i] = i * 2;   // sorted even numbers

        int idx = linearSearch(a, 1_999_998);
        System.out.println("linear: index " + idx + " in " + steps + " steps");
        idx = binarySearch(a, 1_999_998);
        System.out.println("binary: index " + idx + " in " + steps + " steps");

        idx = binarySearch(a, 7);
        System.out.println("binary for 7: " + idx + " -> insert at " + (-idx - 1));
        System.out.println("Arrays.binarySearch for 7: " + Arrays.binarySearch(a, 7));
    }
}`,
          expectedOutput: `linear: index 999999 in 1000000 steps
binary: index 999999 in 20 steps
binary for 7: -5 -> insert at 4
Arrays.binarySearch for 7: -5`,
          explanation: 'Linear search checks every element up to the target; binary search halves the range each step, so log2(1,000,000) ≈ 20 steps is the most it ever needs. When the target is missing it returns -(insertionPoint) - 1, matching Arrays.binarySearch: 7 would go at index 4, between 6 and 8.',
        },
      ],
      walkthrough: {
        exampleId: 'a5-sorts',
        steps: [
          { lines: [4, 9], text: 'Merge sort works on the half-open range [lo, hi). Ranges of size 0 or 1 are already sorted. Otherwise it splits at the midpoint (>>> 1 avoids overflow) and sorts both halves recursively.' },
          { lines: [10, 14], text: 'Merging takes the smaller head of the two sorted halves each step. Using <= takes from the left half on ties, which is what makes merge sort stable. The merged run is copied back from the temporary array: O(n) extra space.' },
          { lines: [17, 27], text: 'Quick sort uses the last element as pivot. Everything smaller is swapped into the prefix before index p; finally the pivot is swapped into position p, where it stays forever. Both sides are then sorted recursively. With an already-sorted array and this pivot choice, every partition is maximally lopsided: O(n^2).' },
          { lines: [29, 36], text: 'Heap sort first builds a max-heap bottom-up in O(n). Then it repeatedly swaps the maximum (index 0) with the last unsorted slot and restores the heap on the shrunken range.' },
          { lines: [38, 46], text: 'siftDown pushes an element down to the larger child until both children are smaller — O(log n) per call. The children of i live at 2i + 1 and 2i + 2: the heap is stored in the array itself.' },
          { lines: [48, 58], text: 'Counting sort tallies how many times each value occurs, then writes values out in order. No comparisons, O(n + k) — but only for small integer ranges.' },
        ],
      },
      realWorld: {
        title: 'A leaderboard that kept re-ordering ties',
        scenario: `A gaming leaderboard sorted players by score and showed ties in the order they reached that score. A developer "optimised" the code by copying scores into a custom in-place quicksort over an array of player objects. Overnight, players with equal scores started jumping around between page refreshes, and support tickets arrived: quicksort is not stable, so the earlier ordering by achievement time was lost.

The fix was to delete the custom sort and use \`players.sort(Comparator.comparingInt(Player::score).reversed().thenComparing(Player::achievedAt))\` — TimSort is stable, and the explicit tie-breaker made the intent obvious. The same team later replaced a full re-sort on every score update with a \`TreeSet\` keyed by (score, time), turning each update into O(log n).`,
      },
      commonMistakes: [
        {
          mistake: 'Binary searching data that is not sorted (or sorted with a different comparator).',
          why: 'Binary search relies on the order to discard half the range; on unsorted data it returns arbitrary results without any error.',
          fix: 'Sort with the same comparator first, or use a HashSet/HashMap for membership tests.',
        },
        {
          mistake: 'Treating any negative result of Arrays.binarySearch as -1.',
          why: 'A miss returns -(insertionPoint) - 1, which carries useful information and is rarely -1.',
          fix: 'Check result < 0 for "not found", and compute the insertion point as -result - 1.',
        },
        {
          mistake: 'Writing comparators as (a, b) -> a.score - b.score.',
          why: 'Subtraction overflows for large or negative values and silently breaks the ordering; TimSort may even throw "Comparison method violates its general contract".',
          fix: 'Use Integer.compare or Comparator.comparingInt.',
          code: `players.sort(Comparator.comparingInt(Player::score).reversed()
                       .thenComparing(Player::name));`,
        },
        {
          mistake: 'Assuming quicksort is always O(n log n).',
          why: 'With a poor pivot rule (first or last element) on sorted or all-equal input, every partition is lopsided and the sort becomes O(n^2).',
          fix: 'Use random or median-of-three pivots and three-way partitioning — or just call Arrays.sort.',
        },
        {
          mistake: 'Sorting a whole list to find the k largest items.',
          why: 'Sorting is O(n log n) and needs the whole list in memory.',
          fix: 'Use a size-k min-heap (O(n log k)), or a single pass for k = 1.',
        },
      ],
      checks: [
        {
          id: 'a5-c1',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'List.sort is stable. What does this print?',
          code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<String> words = new ArrayList<>(List.of("pear", "fig", "kiwi", "apple", "date"));
        words.sort(Comparator.comparingInt(String::length));
        System.out.println(words);
    }
}`,
          options: [
            { id: 'a', text: '[fig, pear, kiwi, date, apple]' },
            { id: 'b', text: '[fig, date, kiwi, pear, apple]' },
            { id: 'c', text: '[fig, kiwi, pear, date, apple]' },
            { id: 'd', text: '[apple, date, fig, kiwi, pear]' },
          ],
          correctOptionId: 'a',
          explanation: 'Words are ordered by length only. pear, kiwi and date all have length 4, and a stable sort keeps them in their original relative order. Alphabetical order would need thenComparing(Comparator.naturalOrder()).',
        },
        {
          id: 'a5-c2',
          kind: 'predict-output',
          dimension: 'coding',
          prompt: 'What does this print?',
          code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        int[] a = {10, 20, 30, 40};
        System.out.println(Arrays.binarySearch(a, 40) + " " + Arrays.binarySearch(a, 25));
    }
}`,
          options: [
            { id: 'a', text: '3 -1' },
            { id: 'b', text: '3 -3' },
            { id: 'c', text: '4 -2' },
            { id: 'd', text: '3 2' },
          ],
          correctOptionId: 'b',
          explanation: '40 is at index 3. 25 is missing; it would be inserted at index 2 (before 30), so the result is -(2) - 1 = -3.',
        },
        {
          id: 'a5-c3',
          kind: 'mcq',
          dimension: 'interview',
          prompt: 'What do Arrays.sort(int[]) and List.sort use, and why are they different?',
          options: [
            { id: 'a', text: 'Both use bubble sort for simplicity' },
            { id: 'b', text: 'Primitives use dual-pivot quicksort (stability is irrelevant for equal primitives); objects use TimSort, a stable merge sort, because equal objects can still be distinguishable' },
            { id: 'c', text: 'Primitives use heap sort; objects use counting sort' },
            { id: 'd', text: 'Both use TimSort' },
          ],
          correctOptionId: 'b',
          explanation: 'Two equal ints are indistinguishable, so an unstable but very fast in-place quicksort is fine. Two objects with equal sort keys can differ in other fields, so object sorts must be stable.',
        },
        {
          id: 'a5-c4',
          kind: 'multi-select',
          dimension: 'conceptual',
          prompt: 'Which statements are correct? Select all that apply.',
          options: [
            { id: 'a', text: 'Merge sort is O(n log n) in the worst case and stable' },
            { id: 'b', text: 'Quick sort is O(n log n) in the worst case' },
            { id: 'c', text: 'Heap sort is O(n log n) in the worst case and needs only O(1) extra space' },
            { id: 'd', text: 'Insertion sort runs in O(n) on already-sorted input' },
            { id: 'e', text: 'Selection sort is stable' },
            { id: 'f', text: 'Counting sort can beat O(n log n) because it does not compare elements' },
          ],
          correctOptionIds: ['a', 'c', 'd', 'f'],
          explanation: 'Quick sort is O(n log n) expected but O(n^2) in the worst case. Selection sort swaps elements over long distances, which can reorder equal keys, so it is not stable.',
        },
        {
          id: 'a5-c5',
          kind: 'mcq',
          dimension: 'debugging',
          prompt: 'A hand-written quicksort always picks the last element as the pivot. It is fast on random data but takes minutes on a large array that is already sorted. Why?',
          options: [
            { id: 'a', text: 'Sorted arrays cause cache misses' },
            { id: 'b', text: 'Each partition puts every element on one side, so recursion depth is n and the total work is O(n^2)' },
            { id: 'c', text: 'The JIT cannot compile recursive methods' },
            { id: 'd', text: 'Quicksort must sort descending first' },
          ],
          correctOptionId: 'b',
          explanation: 'The last element of a sorted range is its maximum, so the partition is n-1 vs 0 every time: n + (n-1) + ... = O(n^2) comparisons and O(n) stack depth (StackOverflowError is possible). Random or median-of-three pivots fix it.',
        },
        {
          id: 'a5-c6',
          kind: 'mcq',
          dimension: 'interview',
          prompt: 'Why can no comparison-based sort beat O(n log n) in the worst case?',
          options: [
            { id: 'a', text: 'Because CPUs can only compare two numbers per cycle' },
            { id: 'b', text: 'Because there are n! possible orderings and each comparison only halves the remaining possibilities, so about log2(n!) ≈ n log n comparisons are needed' },
            { id: 'c', text: 'Because recursion always costs log n' },
            { id: 'd', text: 'It can; TimSort is O(n) in the worst case' },
          ],
          correctOptionId: 'b',
          explanation: 'This is the decision-tree lower bound. TimSort is O(n) only in the best case (already sorted runs). Non-comparison sorts such as counting and radix sort escape the bound by exploiting the structure of the keys.',
        },
      ],
      challengeIds: [],
      masteryCriteria: [
        'Write binary search (closed or half-open form) without off-by-one or overflow bugs.',
        'Implement merge sort and quick sort from memory and state best, average and worst case, space and stability.',
        'Explain what Arrays.sort and List.sort use and why object sorts must be stable.',
        'Pick a suitable sorting or selection approach for a given input (nearly sorted, small integers, top-k).',
      ],
      relatedLessonIds: ['a-complexity', 'a-data-structures', 'a-patterns', 'a-recursion-dp', 'c-sorted'],
      revision: [
        { id: 'r1', question: 'What does "stable sort" mean and when does it matter?', answer: 'Elements with equal keys keep their original relative order. It matters when sorting objects by one key after another, or when the existing order (e.g. by time) must be preserved for ties.' },
        { id: 'r2', question: 'Best, average and worst case of quick sort and merge sort?', answer: 'Quick sort: O(n log n), O(n log n), O(n^2); in place, not stable. Merge sort: O(n log n) in all cases; O(n) extra space, stable.' },
        { id: 'r3', question: 'What does Arrays.binarySearch return for a missing key?', answer: '-(insertionPoint) - 1, where insertionPoint is the index at which the key would be inserted to keep the array sorted.' },
        { id: 'r4', question: 'Which algorithms does the JDK use for sorting?', answer: 'Dual-pivot quicksort for primitive arrays (with insertion sort for small ranges and a heap-sort fallback since JDK 14); TimSort, a stable adaptive merge sort, for objects (Arrays.sort(Object[]), Collections.sort, List.sort).' },
        { id: 'r5', question: 'Why is insertion sort still used inside library sorts?', answer: 'It is stable, in place, has tiny constant factors and runs in O(n) on nearly-sorted data, so it beats O(n log n) algorithms on small sub-arrays.' },
      ],
    },
    // -----------------------------------------------------------------------
    {
      id: 'a-patterns',
      moduleId: 'dsa',
      title: 'Problem-solving patterns',
      summary: 'Two pointers, sliding windows, hashing, prefix sums, binary search, BFS/DFS, heaps, and a repeatable way to approach interview problems.',
      estimatedMinutes: 50,
      difficulty: 'advanced',
      prerequisites: ['a-complexity', 'c-hashmap'],
      objectives: [
        'Recognise which pattern fits a problem from its constraints and wording.',
        'Implement two pointers, sliding window, prefix sums and hash lookups in Java.',
        'Write an overflow-safe binary search, including the lower-bound variant.',
        'Traverse graphs and grids with BFS and DFS, and know which one finds shortest paths.',
        'Use PriorityQueue for top-k and "next smallest" problems.',
        'Follow a structured approach: clarify, brute force, optimise, test edge cases.',
      ],
      plainEnglish: `Most algorithm problems — in interviews and in real code — are variations of a small number of ideas. Learning to recognise them is more useful than memorising solutions:

- **Hashing**: "have I seen this before?" in O(1) — use a HashMap or HashSet.
- **Two pointers**: walk a sorted array from both ends, or with a slow and a fast index.
- **Sliding window**: keep a range [left, right] that grows and shrinks to track a best substring or subarray.
- **Prefix sums**: precompute running totals so any range sum is one subtraction.
- **Binary search**: halve a sorted search space each step.
- **BFS / DFS**: explore a graph or grid level by level (BFS) or path by path (DFS).
- **Heaps**: always know the smallest (or largest) item quickly with a PriorityQueue.

The usual journey is: write the simple brute-force idea, find the repeated work, and pick the pattern that removes it.`,
      technical: `### Hashing for lookups
Replace an inner search loop with a HashMap: two-sum becomes "for each x, is target - x already in the map?" — O(n) time, O(n) space instead of O(n^2) time.

### Two pointers
On a **sorted** array, put \`left\` at the start and \`right\` at the end: if the sum is too small, move left; too big, move right. O(n), O(1) space. Variants: slow/fast pointers for removing duplicates in place, or detecting a cycle in a linked list.

### Sliding window
Maintain a window [left, right]. Extend \`right\` each step; while the window breaks a rule, advance \`left\`. Each index enters and leaves once, so it is O(n). Typical uses: longest substring without repeats, smallest subarray with sum at least k (positive numbers only).

### Prefix sums
\`prefix[i]\` = sum of the first i values, so sum(a[l..r]) = prefix[r + 1] - prefix[l] in O(1) after O(n) set-up. Combined with a HashMap of prefix counts, "how many subarrays sum to k" works even with negative numbers, where sliding windows fail.

### Binary search
Works on any **monotonic** condition, not only "find x in a sorted array". Use the half-open lower-bound form to avoid off-by-one errors:

\`\`\`java
int lo = 0, hi = a.length;          // answer is in [lo, hi]
while (lo < hi) {
    int mid = lo + (hi - lo) / 2;   // or (lo + hi) >>> 1
    if (a[mid] < x) lo = mid + 1; else hi = mid;
}
return lo;                          // first index with a[i] >= x, or a.length
\`\`\`

\`(lo + hi) / 2\` overflows when lo + hi exceeds Integer.MAX_VALUE — a real bug that lived in the JDK's own binary search for years. The JDK provides \`Arrays.binarySearch\` and \`Collections.binarySearch\`, but they return an arbitrary index among duplicates, so write lower bound yourself when position matters.

### Graphs: BFS and DFS
Represent graphs as adjacency lists (\`List<List<Integer>>\`); grids are implicit graphs with 4 neighbours.
- **BFS** with an \`ArrayDeque\` visits nodes in order of distance, so it finds the **shortest path in an unweighted graph**. Mark nodes visited when you enqueue them, not when you dequeue them.
- **DFS** (recursion or an explicit stack) explores one path fully: connected components, cycle detection, topological order. Deep recursion risks StackOverflowError, so prefer an explicit stack for large inputs.
- Weighted edges (non-negative) need **Dijkstra**: BFS with a PriorityQueue ordered by distance.
Both are O(V + E).

### Heaps
\`PriorityQueue\` is a binary min-heap: offer/poll O(log n), peek O(1). For the k largest of n items keep a **min-heap of size k** and evict the smallest when it grows past k: O(n log k) time, O(k) space. Pass \`Comparator.reverseOrder()\` for a max-heap. Its iteration order and toString are **not** sorted.

### Approaching an interview problem
1. **Clarify**: input size, value ranges (negatives? overflow?), duplicates, empty input, expected output on ties.
2. **Brute force**: state it and its complexity — it is a correct baseline.
3. **Optimise**: find repeated work; match the constraints to a pattern (n up to 10^5 usually means O(n log n) or better).
4. **Code** cleanly with good names, talking as you go.
5. **Test**: walk through a normal case, then edge cases — empty, one element, all equal, extremes — and state final time and space complexity.`,
      whyItExists: `Patterns compress experience. Recognising that "longest substring with a constraint" is a sliding window, or that "fewest moves on a grid" is BFS, turns an unfamiliar problem into a known one. The same ideas power production code: rate limiters use sliding windows, schedulers use heaps, dependency resolvers use graph traversal.`,
      whenToUse: [
        'Hashing whenever a nested loop is searching for a matching element.',
        'Two pointers or binary search when the data is sorted (or can be sorted cheaply).',
        'Sliding window for contiguous subarrays or substrings with a constraint.',
        'Prefix sums for repeated range-sum queries, or subarray sums with negatives.',
        'BFS for shortest paths in unweighted graphs and grids; Dijkstra when edges have non-negative weights.',
        'A size-k heap for top-k problems or merging sorted streams.',
      ],
      whenNotToUse: [
        'Do not apply a sliding window to sums when values can be negative — the window property breaks; use prefix sums with a map.',
        'Do not use DFS to find shortest paths in unweighted graphs.',
        'Do not sort just to use two pointers if a HashMap answers the question in O(n) and the original order or indices matter.',
        'Do not hand-roll a heap or a search in production when the JDK already provides a correct one, unless you need behaviour it lacks.',
      ],
      examples: [
        {
          id: 'binary-search',
          title: 'Overflow-safe lower bound',
          runnable: true,
          code: `public class Main {
    // First index i with a[i] >= x, or a.length if every element is smaller.
    static int lowerBound(int[] a, int x) {
        int lo = 0, hi = a.length;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (a[mid] < x) lo = mid + 1;
            else hi = mid;
        }
        return lo;
    }

    static int countInRange(int[] sorted, int from, int to) {
        return lowerBound(sorted, to + 1) - lowerBound(sorted, from);
    }

    public static void main(String[] args) {
        int[] a = {1, 3, 3, 3, 7, 9};
        System.out.println("lowerBound(3) = " + lowerBound(a, 3));
        System.out.println("lowerBound(4) = " + lowerBound(a, 4));
        System.out.println("lowerBound(10) = " + lowerBound(a, 10));
        System.out.println("values in [3, 8]: " + countInRange(a, 3, 8));

        int lo = 1_500_000_000, hi = 2_000_000_000;
        System.out.println("(lo + hi) / 2      = " + (lo + hi) / 2);
        System.out.println("lo + (hi - lo) / 2 = " + (lo + (hi - lo) / 2));
    }
}`,
          expectedOutput: `lowerBound(3) = 1
lowerBound(4) = 4
lowerBound(10) = 6
values in [3, 8]: 4
(lo + hi) / 2      = -397483648
lo + (hi - lo) / 2 = 1750000000`,
          explanation: 'The half-open form [lo, hi) with hi = a.length can return "past the end", which callers need for insertion points and counting. (to + 1 would overflow for to = Integer.MAX_VALUE; real code would widen to long.)',
        },
        {
          id: 'window-and-prefix',
          title: 'Two pointers, sliding window and prefix sums',
          runnable: true,
          code: `import java.util.*;

public class Main {
    // Two pointers on a sorted array: does any pair sum to target?
    static boolean pairWithSum(int[] sorted, int target) {
        int left = 0, right = sorted.length - 1;
        while (left < right) {
            int sum = sorted[left] + sorted[right];
            if (sum == target) return true;
            if (sum < target) left++; else right--;
        }
        return false;
    }

    // Sliding window: length of the longest substring without repeated characters.
    static int longestUnique(String s) {
        Map<Character, Integer> lastSeen = new HashMap<>();
        int best = 0;
        for (int left = 0, right = 0; right < s.length(); right++) {
            Integer prev = lastSeen.put(s.charAt(right), right);
            if (prev != null && prev >= left) left = prev + 1;   // shrink past the duplicate
            best = Math.max(best, right - left + 1);
        }
        return best;
    }

    // Prefix sums + hashing: number of subarrays summing to k (negatives allowed).
    static int subarraysWithSum(int[] a, int k) {
        Map<Long, Integer> seen = new HashMap<>();
        seen.put(0L, 1);
        long prefix = 0;
        int count = 0;
        for (int x : a) {
            prefix += x;
            count += seen.getOrDefault(prefix - k, 0);
            seen.merge(prefix, 1, Integer::sum);
        }
        return count;
    }

    public static void main(String[] args) {
        System.out.println(pairWithSum(new int[] {1, 2, 4, 7, 11}, 15));
        System.out.println(pairWithSum(new int[] {1, 2, 4, 7, 11}, 10));
        System.out.println(longestUnique("abcabcbb") + " " + longestUnique("abba") + " " + longestUnique(""));
        System.out.println(subarraysWithSum(new int[] {1, -1, 2, 1, -2, 3}, 3));
    }
}`,
          expectedOutput: `true
false
3 2 0
4`,
          explanation: 'Each technique replaces an O(n^2) "try every pair or every range" loop with a single O(n) pass. In subarraysWithSum, a subarray ending here sums to k exactly when an earlier prefix equals prefix - k.',
        },
        {
          id: 'bfs-and-heap',
          title: 'BFS shortest hops and top-k with a heap',
          runnable: true,
          code: `import java.util.*;

public class Main {
    static int[] bfs(List<List<Integer>> graph, int start) {
        int[] dist = new int[graph.size()];
        Arrays.fill(dist, -1);
        Deque<Integer> queue = new ArrayDeque<>();
        dist[start] = 0;                       // mark when enqueued
        queue.add(start);
        while (!queue.isEmpty()) {
            int node = queue.poll();
            for (int next : graph.get(node)) {
                if (dist[next] == -1) {
                    dist[next] = dist[node] + 1;
                    queue.add(next);
                }
            }
        }
        return dist;
    }

    static List<Integer> topK(int[] values, int k) {
        PriorityQueue<Integer> heap = new PriorityQueue<>();   // min-heap of the best k
        for (int v : values) {
            heap.offer(v);
            if (heap.size() > k) heap.poll();                  // drop the smallest
        }
        List<Integer> result = new ArrayList<>(heap);
        result.sort(Comparator.reverseOrder());
        return result;
    }

    public static void main(String[] args) {
        int[][] edges = {{0, 1}, {0, 2}, {1, 3}, {2, 3}, {3, 4}};
        List<List<Integer>> graph = new ArrayList<>();
        for (int i = 0; i < 6; i++) graph.add(new ArrayList<>());
        for (int[] e : edges) {
            graph.get(e[0]).add(e[1]);
            graph.get(e[1]).add(e[0]);
        }
        System.out.println("hops from 0: " + Arrays.toString(bfs(graph, 0)));
        System.out.println("top 3: " + topK(new int[] {5, 1, 9, 3, 7, 9, 2}, 3));
    }
}`,
          expectedOutput: `hops from 0: [0, 1, 1, 2, 3, -1]
top 3: [9, 9, 7]`,
          explanation: 'Node 5 has no edges, so it stays at -1 (unreachable). The heap never holds more than k values, so top-k costs O(n log k) time and O(k) space.',
        },
      ],
      walkthrough: {
        exampleId: 'binary-search',
        steps: [
          { lines: [2, 4], text: 'The search space is the half-open range [lo, hi). Starting hi at a.length lets the method return "after the last element" when x is larger than everything.' },
          { lines: [5, 6], text: 'Loop while the range is non-empty. lo + (hi - lo) / 2 never exceeds hi, so it cannot overflow the way (lo + hi) / 2 can.' },
          { lines: [7, 8], text: 'If a[mid] is too small, the answer is strictly to the right; otherwise mid itself might be the answer, so keep it with hi = mid. Every iteration shrinks the range, so the loop always ends after O(log n) steps.' },
          { lines: [13, 15], text: 'Two lower bounds answer a range-count query in O(log n): everything before lowerBound(to + 1) minus everything before lowerBound(from).' },
          { lines: [18, 22], text: 'With duplicates, lower bound returns the first 3 (index 1). Searching for 4 or 10 returns the insertion point.' },
          { lines: [24, 26], text: 'lo + hi is 3.5 billion, which wraps around to a negative int. The subtraction form stays in range.' },
        ],
      },
      realWorld: {
        title: 'Patterns behind production features',
        scenario: `A payments team needed "at most 100 requests per client in any 60-second window". The first version stored every timestamp in a list and counted matching entries on each request — O(n) per request, growing with traffic. Rewriting it as a sliding window (an \`ArrayDeque\` of timestamps per client: append on the right, evict expired entries from the left) made each check amortised O(1).

The same team used other patterns from this lesson without calling them that: BFS over a "which service calls which" graph to find everything affected by an outage, a PriorityQueue to pick the next retry due, and binary search over sorted rate tiers to price a transaction.`,
      },
      commonMistakes: [
        {
          mistake: 'Computing mid as (lo + hi) / 2.',
          why: 'For large indices or value ranges, lo + hi overflows int and mid becomes negative.',
          fix: 'Use lo + (hi - lo) / 2 or (lo + hi) >>> 1.',
        },
        {
          mistake: 'Marking BFS nodes as visited when they are dequeued.',
          why: 'The same node can be enqueued many times by different neighbours, wasting time and memory (and giving wrong counts).',
          fix: 'Mark (or set the distance) at the moment you enqueue.',
        },
        {
          mistake: 'Using a sliding window for "subarray sum equals k" with negative numbers.',
          why: 'Shrinking the window no longer always decreases the sum, so the window logic misses answers.',
          fix: 'Use prefix sums with a HashMap counting earlier prefixes.',
        },
        {
          mistake: 'Sorting with a subtraction comparator such as (a, b) -> a[0] - b[0].',
          why: 'The subtraction overflows for large or negative values and silently breaks ordering.',
          fix: 'Use Integer.compare(a[0], b[0]) or Comparator.comparingInt(x -> x[0]).',
        },
        {
          mistake: 'Jumping straight to an optimised solution in an interview.',
          why: 'Unclear requirements and missing edge cases cause more failed interviews than slow algorithms.',
          fix: 'Clarify, state the brute force and its cost, then optimise and test edge cases out loud.',
        },
      ],
      checks: [
        {
          id: 'a2-c1',
          kind: 'predict-output',
          dimension: 'debugging',
          prompt: 'What does this print?',
          code: `public class Main {
    public static void main(String[] args) {
        int lo = 1_500_000_000;
        int hi = 2_000_000_000;
        System.out.println((lo + hi) / 2);
        System.out.println(lo + (hi - lo) / 2);
    }
}`,
          options: [
            { id: 'a', text: '1750000000\n1750000000' },
            { id: 'b', text: '-397483648\n1750000000' },
            { id: 'c', text: 'An ArithmeticException is thrown' },
            { id: 'd', text: '-1750000000\n1750000000' },
          ],
          correctOptionId: 'b',
          explanation: 'int addition wraps silently: 3,500,000,000 - 2^32 = -794,967,296, halved is -397,483,648. Java never throws on int overflow. The subtraction form stays within range.',
        },
        {
          id: 'a2-c2',
          kind: 'mcq',
          dimension: 'interview',
          prompt: 'Count the subarrays whose sum equals k. Values can be negative and n is up to 200,000. Which approach fits?',
          options: [
            { id: 'a', text: 'Sliding window that shrinks when the sum exceeds k' },
            { id: 'b', text: 'Prefix sums with a HashMap counting how often each prefix sum has occurred' },
            { id: 'c', text: 'Check every pair (start, end) — O(n^2) is fine' },
            { id: 'd', text: 'Sort the array, then two pointers' },
          ],
          correctOptionId: 'b',
          explanation: 'sum(i..j) = prefix[j+1] - prefix[i], so for each position count earlier prefixes equal to prefix - k: O(n). Negatives break the sliding window, O(n^2) is about 2 * 10^10 operations, and sorting destroys contiguity.',
        },
        {
          id: 'a2-c3',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'You need the fewest moves for a robot on a grid where every move costs the same. Which algorithm guarantees the shortest path?',
          options: [
            { id: 'a', text: 'Depth-first search, stopping at the first path found' },
            { id: 'b', text: 'Breadth-first search from the start cell' },
            { id: 'c', text: 'Binary search on the grid' },
            { id: 'd', text: 'Greedy: always move in the direction of the target' },
          ],
          correctOptionId: 'b',
          explanation: 'BFS explores cells in increasing distance, so the first time it reaches the target is via a shortest path. DFS finds a path, not necessarily the shortest; greedy moves get stuck behind walls.',
        },
        {
          id: 'a2-c4',
          kind: 'mcq',
          dimension: 'interview',
          prompt: 'You stream n = 10 million numbers and need the 100 largest. Using a PriorityQueue min-heap capped at k = 100 elements, what are the time and extra space costs?',
          options: [
            { id: 'a', text: 'O(n log n) time, O(n) space' },
            { id: 'b', text: 'O(n log k) time, O(k) space' },
            { id: 'c', text: 'O(k log n) time, O(1) space' },
            { id: 'd', text: 'O(n) time, O(n) space' },
          ],
          correctOptionId: 'b',
          explanation: 'Each of the n values costs at most one offer and one poll on a heap of size k: O(log k). Only k values are ever stored.',
        },
        {
          id: 'a2-c5',
          kind: 'multi-select',
          dimension: 'interview',
          prompt: 'Which steps belong in a strong approach to an unfamiliar coding interview problem? Select all that apply.',
          options: [
            { id: 'a', text: 'Ask about input size, value ranges, duplicates and empty input' },
            { id: 'b', text: 'State a brute-force solution and its complexity' },
            { id: 'c', text: 'Stay silent until the optimal solution is fully coded' },
            { id: 'd', text: 'Use the constraints to guess the target complexity' },
            { id: 'e', text: 'Trace an example and edge cases through the finished code' },
            { id: 'f', text: 'Skip complexity analysis if the code passes the sample' },
          ],
          correctOptionIds: ['a', 'b', 'd', 'e'],
          explanation: 'Interviewers assess communication and correctness as much as cleverness: clarify, give a baseline, optimise using the constraints, then test and state complexity.',
        },
        {
          id: 'a2-c6',
          kind: 'predict-output',
          dimension: 'conceptual',
          prompt: 'What does this print?',
          code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        PriorityQueue<Integer> pq = new PriorityQueue<>();
        pq.add(5);
        pq.add(1);
        pq.add(4);
        System.out.print(pq.poll() + " ");
        pq.add(0);
        System.out.print(pq.poll() + " ");
        System.out.println(pq.poll());
    }
}`,
          options: [
            { id: 'a', text: '5 4 1' },
            { id: 'b', text: '1 0 4' },
            { id: 'c', text: '1 4 0' },
            { id: 'd', text: '5 1 4' },
          ],
          correctOptionId: 'b',
          explanation: 'PriorityQueue is a min-heap: poll always removes the current smallest. After 1 is removed and 0 added, the smallest is 0, then 4.',
        },
      ],
      challengeIds: ['ch-two-sum', 'ch-longest-unique', 'ch-merge-intervals', 'ch-grid-bfs', 'ch-range-count'],
      masteryCriteria: [
        'Map a problem statement to a pattern and justify the choice from its constraints.',
        'Write an overflow-safe lower-bound binary search without off-by-one errors.',
        'Implement BFS on a grid or adjacency list and explain why it yields shortest paths.',
        'Solve top-k with a bounded heap and state O(n log k).',
        'Talk through clarify, brute force, optimise and test for a new problem.',
      ],
      relatedLessonIds: ['a-complexity', 'a-data-structures', 'a-sorting-searching', 'a-recursion-dp', 'c-hashmap', 'c-sorted'],
      revision: [
        { id: 'r1', question: 'When does a sliding window work, and when does it not?', answer: 'For contiguous ranges where extending or shrinking the window moves the measured quantity in a predictable direction (e.g. distinct characters, sums of non-negative numbers). With negative numbers, use prefix sums plus a map.' },
        { id: 'r2', question: 'Write the safe midpoint formula.', answer: 'mid = lo + (hi - lo) / 2, or (lo + hi) >>> 1.' },
        { id: 'r3', question: 'Why does BFS find shortest paths in unweighted graphs?', answer: 'It processes nodes in order of distance from the start, so the first time a node is reached is via a path with the fewest edges.' },
        { id: 'r4', question: 'How do you get the k largest of n items efficiently?', answer: 'Keep a min-heap of size k; push each item and poll when the size exceeds k. O(n log k) time, O(k) space.' },
        { id: 'r5', question: 'What are the four steps for an interview problem?', answer: 'Clarify requirements and edge cases, state a brute force with its cost, optimise using a pattern that removes repeated work, then test edge cases and state time and space.' },
      ],
    },
    // -----------------------------------------------------------------------
    {
      id: 'a-recursion-dp',
      moduleId: 'dsa',
      title: 'Recursion, memoisation and dynamic programming',
      summary: 'Thinking recursively, avoiding exponential blow-up with memoisation, and turning recursion into bottom-up tables.',
      estimatedMinutes: 40,
      difficulty: 'advanced',
      prerequisites: ['a-complexity', 'f-methods'],
      objectives: [
        'Write a recursive method with a correct base case and a smaller subproblem.',
        'Explain why naive recursive Fibonacci is exponential and memoised Fibonacci is linear.',
        'Recognise overlapping subproblems and optimal substructure.',
        'Convert a memoised recursion into a bottom-up dynamic programming table.',
        'Explain when greedy choices fail and DP is needed.',
      ],
      plainEnglish: `**Recursion** solves a problem by solving a smaller version of the same problem: the number of ways to climb n stairs is the ways to climb n-1 plus the ways to climb n-2. Every recursive method needs a **base case** that stops it.

Sometimes recursion solves the same small problem again and again. **Memoisation** remembers each answer the first time, so it is computed only once. **Dynamic programming (DP)** is the same idea built from the bottom up: fill a table from the smallest subproblems to the one you want.`,
      technical: `### Recursion
A recursive method needs (1) a base case, (2) a recursive case that moves toward it. Each call pushes a stack frame, so recursion depth is limited by the thread stack (\`-Xss\`, typically about 10,000 to 50,000 frames for simple methods). Java has no tail-call elimination, so deep linear recursion should become a loop.

### Why naive recursion explodes
\`fib(n) = fib(n-1) + fib(n-2)\` makes two calls per level; the call tree has about 1.6^n nodes. fib(50) would take billions of calls, but there are only 51 distinct subproblems.

### Dynamic programming
DP applies when a problem has:
- **optimal substructure** — the best answer is built from best answers to subproblems, and
- **overlapping subproblems** — the same subproblems recur.

Two styles:
- **Top-down (memoisation)**: keep the recursion, cache results in an array or HashMap. Easy to write; still uses stack depth.
- **Bottom-up (tabulation)**: iterate from the base cases upward, filling \`dp[i]\` from earlier entries. No recursion; often lets you keep only the last few entries (O(1) space for Fibonacci).

Complexity = (number of states) x (work per state). Coin change with amount A and c coin types: A states x c choices = O(A * c) time, O(A) space.

### A DP recipe
1. Define the state in words: "dp[a] = fewest coins that make amount a".
2. Write the transition: dp[a] = 1 + min over coins c of dp[a - c].
3. Base cases: dp[0] = 0; unreachable amounts stay at "infinity".
4. Order: compute smaller amounts first.
5. Answer: dp[A], or -1 if still infinite.

### Greedy vs DP
Greedy takes the locally best choice and never reconsiders. It is correct only when you can prove it (e.g. coin systems like 1, 5, 10, 25, interval scheduling by earliest end). For coins {1, 3, 4} and amount 6, greedy takes 4 + 1 + 1 (3 coins) but 3 + 3 (2 coins) is optimal.`,
      whyItExists: `Many real problems — pricing bundles, text diffing (longest common subsequence), spell checking (edit distance), route and resource planning — have exponentially many candidate solutions but only polynomially many distinct subproblems. DP exploits that to turn impossible searches into fast table fills.`,
      whenToUse: [
        'Recursion for naturally recursive structures: trees, nested data, divide-and-conquer.',
        'Memoisation when a recursive solution recomputes the same arguments.',
        'Bottom-up DP when recursion depth could be large or you want to reduce memory.',
        'DP for "count the ways", "minimum cost" or "is it possible" questions over sequences, amounts or grids.',
      ],
      whenNotToUse: [
        'Do not use deep recursion (thousands of levels) on unbounded input in Java — use a loop or an explicit stack.',
        'Do not reach for DP when a proven greedy rule or a simple formula exists.',
        'Do not memoise with a HashMap keyed by mutable objects.',
      ],
      examples: [
        {
          id: 'fib-three-ways',
          title: 'Fibonacci: naive, memoised, bottom-up',
          runnable: true,
          code: `import java.util.*;

public class Main {
    static long calls = 0;

    static long naive(int n) {
        calls++;
        if (n < 2) return n;
        return naive(n - 1) + naive(n - 2);
    }

    static long memo(int n, long[] cache) {
        calls++;
        if (n < 2) return n;
        if (cache[n] != 0) return cache[n];
        return cache[n] = memo(n - 1, cache) + memo(n - 2, cache);
    }

    static long bottomUp(int n) {
        long prev = 0, curr = 1;            // fib(0), fib(1)
        for (int i = 0; i < n; i++) {
            long next = prev + curr;
            prev = curr;
            curr = next;
        }
        return prev;                        // O(1) space
    }

    public static void main(String[] args) {
        int n = 30;
        calls = 0;
        System.out.println("naive:     " + naive(n) + " in " + calls + " calls");
        calls = 0;
        System.out.println("memoised:  " + memo(n, new long[n + 1]) + " in " + calls + " calls");
        System.out.println("bottom-up: " + bottomUp(n) + " in " + n + " loop steps");
        System.out.println("fib(90) =  " + bottomUp(90));
    }
}`,
          expectedOutput: `naive:     832040 in 2692537 calls
memoised:  832040 in 59 calls
bottom-up: 832040 in 30 loop steps
fib(90) =  2880067194370816120`,
          explanation: 'The naive version makes 2.7 million calls for n = 30 and would take years for n = 90. Memoisation computes each value once; the bottom-up version needs no recursion and only two variables.',
        },
        {
          id: 'coin-change',
          title: 'Coin change: greedy fails, DP succeeds',
          runnable: true,
          code: `import java.util.*;

public class Main {
    static int greedy(int[] coinsDescending, int amount) {
        int count = 0;
        for (int coin : coinsDescending) {
            count += amount / coin;
            amount %= coin;
        }
        return amount == 0 ? count : -1;
    }

    static int minCoins(int[] coins, int amount) {
        int[] dp = new int[amount + 1];          // dp[a] = fewest coins for amount a
        Arrays.fill(dp, Integer.MAX_VALUE);
        dp[0] = 0;
        for (int a = 1; a <= amount; a++) {
            for (int coin : coins) {
                if (coin <= a && dp[a - coin] != Integer.MAX_VALUE) {
                    dp[a] = Math.min(dp[a], dp[a - coin] + 1);
                }
            }
        }
        return dp[amount] == Integer.MAX_VALUE ? -1 : dp[amount];
    }

    public static void main(String[] args) {
        int[] coins = {4, 3, 1};
        System.out.println("amount 6: greedy=" + greedy(coins, 6) + " dp=" + minCoins(coins, 6));
        System.out.println("amount 10: greedy=" + greedy(coins, 10) + " dp=" + minCoins(coins, 10));
        System.out.println("coins {5, 3}, amount 7: dp=" + minCoins(new int[] {5, 3}, 7));
    }
}`,
          expectedOutput: `amount 6: greedy=3 dp=2
amount 10: greedy=4 dp=3
coins {5, 3}, amount 7: dp=-1`,
          explanation: 'Greedy commits to the 4 coin and cannot undo it. DP considers every last coin for every amount, so it finds 3 + 3. Amount 7 cannot be made from 5s and 3s, so the table entry stays "infinite" and the answer is -1.',
        },
      ],
      walkthrough: {
        exampleId: 'coin-change',
        steps: [
          { lines: [4, 11], text: 'Greedy takes as many of the largest coin as possible, then moves on. It never reconsiders a choice, which is why it can miss the optimum.' },
          { lines: [13, 16], text: 'The DP state: dp[a] is the fewest coins that make amount a. Integer.MAX_VALUE stands for "not reachable yet"; dp[0] = 0 is the base case.' },
          { lines: [17, 23], text: 'Amounts are filled in increasing order, so dp[a - coin] is always ready. For each amount, try every coin as the last coin used and keep the best. The guard avoids adding 1 to MAX_VALUE, which would overflow.' },
          { lines: [24, 25], text: 'The answer is the last entry, or -1 if no combination reached it. Time O(amount x coins), space O(amount).' },
          { lines: [27, 32], text: 'For amount 6 greedy uses 4 + 1 + 1 while DP finds 3 + 3. For 10 greedy uses 4 + 4 + 1 + 1 (four coins) while DP finds 4 + 3 + 3. With coins 5 and 3, 7 is unreachable and DP reports -1.' },
        ],
      },
      realWorld: {
        title: 'Recursion depth in a document renderer',
        scenario: `A CMS rendered nested content blocks with a recursive \`render(block)\` method. It worked for years until an import tool produced a document nested 20,000 levels deep, and every render failed with StackOverflowError — crashing the request thread pool under retries.

The team replaced the recursion with an explicit \`ArrayDeque\` stack and added a maximum depth check at import. Separately, a "price the cheapest bundle" feature that recursively tried every combination was rewritten as bottom-up DP over the basket total, turning a timeout into a 2 ms computation.`,
      },
      commonMistakes: [
        {
          mistake: 'Forgetting or misplacing the base case.',
          why: 'The recursion never stops and ends in StackOverflowError.',
          fix: 'Write the base case first and check that every recursive call moves toward it.',
        },
        {
          mistake: 'Memoising with a cache value that is also a valid answer (e.g. 0) as the "not computed" marker.',
          why: 'Subproblems whose answer is 0 are recomputed every time, silently losing the speed-up.',
          fix: 'Fill the cache with a sentinel such as -1, or use a boxed Long and null.',
        },
        {
          mistake: 'Adding 1 to Integer.MAX_VALUE used as "infinity".',
          why: 'It overflows to Integer.MIN_VALUE, which then wins every min comparison.',
          fix: 'Check for the sentinel before adding, or use a safe large value such as amount + 1.',
        },
        {
          mistake: 'Assuming a greedy choice is optimal without proof.',
          why: 'Greedy works for some inputs (standard coins) and fails for others.',
          fix: 'Look for a counter-example; if one exists, use DP.',
        },
      ],
      checks: [
        {
          id: 'a3-c1',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'How many calls does naive fib(5) make (including the first)?',
          code: `public class Main {
    static int calls = 0;

    static int fib(int n) {
        calls++;
        if (n < 2) return n;
        return fib(n - 1) + fib(n - 2);
    }

    public static void main(String[] args) {
        System.out.println(fib(5) + " " + calls);
    }
}`,
          options: [
            { id: 'a', text: '5 5' },
            { id: 'b', text: '5 15' },
            { id: 'c', text: '8 15' },
            { id: 'd', text: '5 9' },
          ],
          correctOptionId: 'b',
          explanation: 'calls(n) = 1 + calls(n-1) + calls(n-2) with calls(0) = calls(1) = 1, giving 1, 1, 3, 5, 9, 15. The count grows exponentially even though fib(5) is only 5. (The string concatenation evaluates fib(5) before reading calls.)',
        },
        {
          id: 'a3-c2',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'Which two properties make a problem a good fit for dynamic programming?',
          options: [
            { id: 'a', text: 'Sorted input and unique values' },
            { id: 'b', text: 'Optimal substructure and overlapping subproblems' },
            { id: 'c', text: 'A greedy choice property and no recursion' },
            { id: 'd', text: 'Small input and a fast CPU' },
          ],
          correctOptionId: 'b',
          explanation: 'Optimal substructure lets you build the answer from subproblem answers; overlap means caching those answers saves work.',
        },
        {
          id: 'a3-c3',
          kind: 'predict-output',
          dimension: 'interview',
          prompt: 'With coins {4, 3, 1}, what does this print?',
          code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        int[] coins = {4, 3, 1};
        int amount = 6;

        int greedy = 0, left = amount;
        for (int c : coins) { greedy += left / c; left %= c; }

        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1);
        dp[0] = 0;
        for (int a = 1; a <= amount; a++)
            for (int c : coins)
                if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);

        System.out.println("greedy=" + greedy + " dp=" + dp[amount]);
    }
}`,
          options: [
            { id: 'a', text: 'greedy=2 dp=2' },
            { id: 'b', text: 'greedy=3 dp=3' },
            { id: 'c', text: 'greedy=3 dp=2' },
            { id: 'd', text: 'greedy=2 dp=3' },
          ],
          correctOptionId: 'c',
          explanation: 'Greedy picks 4, then 1 and 1 (three coins). DP finds 3 + 3. Using amount + 1 as "infinity" avoids the MAX_VALUE overflow trap.',
        },
        {
          id: 'a3-c4',
          kind: 'mcq',
          dimension: 'runtime',
          prompt: 'A recursive method sums a linked list of 1,000,000 nodes: `sum(node) = node.value + sum(node.next)`. What happens on a default JVM, and what is the fix?',
          options: [
            { id: 'a', text: 'It works; the JIT turns it into a loop via tail-call elimination' },
            { id: 'b', text: 'It likely throws StackOverflowError; rewrite it as a loop' },
            { id: 'c', text: 'It throws OutOfMemoryError: Java heap space' },
            { id: 'd', text: 'It runs but is O(n^2)' },
          ],
          correctOptionId: 'b',
          explanation: 'Each call needs a stack frame and HotSpot does not eliminate tail calls, so a million frames exceed the default stack. A loop uses O(1) stack.',
        },
        {
          id: 'a3-c5',
          kind: 'multi-select',
          dimension: 'conceptual',
          prompt: 'Which statements about memoisation and bottom-up DP are true? Select all that apply.',
          options: [
            { id: 'a', text: 'Memoised Fibonacci runs in O(n) time' },
            { id: 'b', text: 'Bottom-up DP avoids recursion depth limits' },
            { id: 'c', text: 'Memoisation changes the result of the algorithm' },
            { id: 'd', text: 'DP complexity is roughly the number of states times the work per state' },
            { id: 'e', text: 'Bottom-up Fibonacci needs an array of size n' },
          ],
          correctOptionIds: ['a', 'b', 'd'],
          explanation: 'Memoisation only avoids recomputation; results are identical. Bottom-up Fibonacci only needs the previous two values, so O(1) space is enough.',
        },
      ],
      challengeIds: [],
      masteryCriteria: [
        'Write recursive methods with correct base cases and explain their stack usage.',
        'Turn an exponential recursion into a memoised one and state the new complexity.',
        'Define a DP state, transition and base case for a new problem and fill it bottom-up.',
        'Produce a counter-example showing when greedy fails.',
      ],
      relatedLessonIds: ['a-complexity', 'a-patterns', 'f-methods', 'r-memory-areas'],
      revision: [
        { id: 'r1', question: 'What two parts must every recursive method have?', answer: 'A base case that returns without recursing, and a recursive case that makes progress toward the base case.' },
        { id: 'r2', question: 'What is the difference between memoisation and tabulation?', answer: 'Memoisation is top-down: recursion plus a cache. Tabulation is bottom-up: iterate from base cases and fill a table, with no recursion.' },
        { id: 'r3', question: 'How do you estimate DP complexity?', answer: 'Number of distinct states times the work to compute each state (e.g. amount x coins for coin change).' },
        { id: 'r4', question: 'Why is deep recursion risky in Java?', answer: 'Each call uses a stack frame, the stack is limited (-Xss), and HotSpot does not perform tail-call elimination, so very deep recursion throws StackOverflowError.' },
      ],
    },
  ],
};
