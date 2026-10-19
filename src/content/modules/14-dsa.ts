import type { CurriculumModule } from '@/types/curriculum';

export const dsaModule: CurriculumModule = {
  id: 'dsa',
  order: 14,
  title: 'Data Structures, Algorithms and Problem Solving',
  shortTitle: 'DSA',
  summary: 'Reasoning about complexity, the core problem-solving patterns used in interviews and production, and recursion with dynamic programming.',
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
      relatedLessonIds: ['c-collections-overview', 'c-hashmap', 'a-patterns', 'r-memory-areas'],
      revision: [
        { id: 'r1', question: 'What does O(n^2) tell you about doubling the input?', answer: 'The work roughly quadruples. Constants and lower-order terms are ignored; only the growth rate matters.' },
        { id: 'r2', question: 'Why is ArrayList.add amortised O(1)?', answer: 'Capacity grows by about 50% when full, so the total cost of all copies over n adds is O(n); averaged per add, that is O(1).' },
        { id: 'r3', question: 'Name three library calls that are O(n) and dangerous inside loops.', answer: 'List.contains / indexOf, ArrayList.remove(0) or add(0, x), and String concatenation with + (each copies the whole string).' },
        { id: 'r4', question: 'When should you measure instead of reason?', answer: 'When comparing options with the same growth rate, when constants, caching or allocation matter, or to find where real production time goes — using a profiler or JMH, not a single cold timing.' },
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
      relatedLessonIds: ['a-complexity', 'a-recursion-dp', 'c-hashmap', 'c-sorted'],
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
