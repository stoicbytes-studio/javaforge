import type { CurriculumModule } from '@/types/curriculum';

export const collectionsModule: CurriculumModule = {
  id: 'collections',
  order: 6,
  title: 'Collections Framework and Internal Implementations',
  shortTitle: 'Collections',
  summary: 'Lists, sets, maps and queues: how they work inside, their costs, and how to choose and use them safely.',
  level: 'core',
  prerequisites: ['types'],
  bossChallengeId: 'boss-order-book',
  lessons: [
    // -----------------------------------------------------------------------
    {
      id: 'c-collections-overview',
      moduleId: 'collections',
      title: 'Choosing the right collection',
      summary: 'The interface hierarchy, the main implementations and their complexity, and how to pick one.',
      estimatedMinutes: 35,
      difficulty: 'intermediate',
      prerequisites: ['t-generics'],
      versionNotes: [{ feature: 'Sequenced collections (getFirst, getLast, reversed)', since: 21 }],
      objectives: [
        'Navigate the Collection and Map interface hierarchies.',
        'State the complexity of common operations for the main implementations.',
        'Choose a collection from requirements: order, uniqueness, lookup and access pattern.',
      ],
      plainEnglish: `The Collections Framework gives you ready-made data structures:

- **List** — ordered, allows duplicates, access by position (\`ArrayList\`).
- **Set** — no duplicates (\`HashSet\`, \`LinkedHashSet\` keeps insertion order, \`TreeSet\` keeps sorted order).
- **Map** — key → value lookups (\`HashMap\`, \`LinkedHashMap\`, \`TreeMap\`).
- **Queue/Deque** — process items in order: first-in-first-out queues, stacks, or by priority (\`ArrayDeque\`, \`PriorityQueue\`).

Choosing well is mostly about asking: do I need order? uniqueness? fast lookup by key? fast access by position?`,
      technical: `### Hierarchy
\`Iterable → Collection → List | Set | Queue\` (\`Deque\` extends Queue; \`SortedSet\`/\`NavigableSet\` extend Set). \`Map\` is separate (\`SortedMap\`/\`NavigableMap\`). Java 21 adds \`SequencedCollection\`/\`SequencedMap\` with \`getFirst()\`, \`getLast()\`, \`reversed()\` for ordered types.

### Costs (n elements)
- **ArrayList**: get O(1); add at end amortised O(1) (grows by ~50%); insert/remove in the middle O(n); contains O(n). Excellent cache locality.
- **LinkedList**: get O(n); add/remove at ends O(1); middle O(n) to *find* the position. Each node is an extra object — usually slower than ArrayList in practice.
- **ArrayDeque**: O(1) push/pop at both ends; the preferred stack and queue (do not use the legacy \`Stack\` class).
- **PriorityQueue**: binary heap; offer/poll O(log n), peek O(1); iteration order is **not** sorted.
- **HashSet/HashMap**: add/get/contains expected O(1).
- **LinkedHashSet/LinkedHashMap**: hash performance plus predictable insertion (or access) order.
- **TreeSet/TreeMap**: red-black tree; O(log n) operations; sorted; range queries.

### Practical rules
- Default to \`ArrayList\`, \`HashMap\`, \`HashSet\`, \`ArrayDeque\`.
- Need insertion order? Linked variants. Sorted or range queries? Tree variants.
- Program to interfaces: \`List<Order> orders = new ArrayList<>();\`.
- Pre-size when the size is known (\`new ArrayList<>(n)\`, \`HashMap.newHashMap(n)\` in Java 19+).`,
      whyItExists: `Standard, well-tested data structures with shared interfaces let code be written against capabilities (a List, a Map) and switch implementations when requirements change.`,
      whenToUse: [
        'Use ArrayList for most sequences, ArrayDeque for stacks/queues, PriorityQueue for "next most important".',
        'Use HashMap/HashSet for fast lookup and deduplication; LinkedHash* when order matters; Tree* for sorting and ranges.',
        'Declare variables with interface types.',
      ],
      whenNotToUse: [
        'Do not use LinkedList "for fast inserts" without measuring.',
        'Do not use legacy Vector, Hashtable or Stack in new code.',
        'Do not rely on HashMap/HashSet iteration order.',
      ],
      examples: [
        {
          id: 'choose',
          title: 'Same data, different collections',
          runnable: true,
          code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<String> visits = List.of("home", "cart", "home", "checkout", "cart");

        System.out.println(new ArrayList<>(visits));        // order + duplicates
        System.out.println(new LinkedHashSet<>(visits));    // unique, first-seen order
        System.out.println(new TreeSet<>(visits));          // unique, sorted

        Deque<String> history = new ArrayDeque<>();         // stack: last in, first out
        for (String page : visits) history.push(page);
        System.out.println("back to: " + history.pop() + ", then " + history.pop());

        Queue<Integer> tasks = new PriorityQueue<>(List.of(5, 1, 4, 2));
        StringBuilder order = new StringBuilder();
        while (!tasks.isEmpty()) order.append(tasks.poll()).append(' ');
        System.out.println("by priority: " + order.toString().trim());

        List<String> sequenced = new ArrayList<>(visits);
        System.out.println(sequenced.getFirst() + " .. " + sequenced.getLast() + " " + sequenced.reversed());
    }
}`,
          expectedOutput: `[home, cart, home, checkout, cart]
[home, cart, checkout]
[cart, checkout, home]
back to: cart, then checkout
by priority: 1 2 4 5
home .. cart [cart, checkout, home, cart, home]`,
          minJavaVersion: 21,
        },
      ],
      walkthrough: {
        exampleId: 'choose',
        steps: [
          { lines: [5, 5], text: 'List.of creates an immutable list; we copy it into other collections.' },
          { lines: [7, 9], text: 'ArrayList keeps everything; LinkedHashSet removes duplicates but keeps first-seen order; TreeSet removes duplicates and sorts.' },
          { lines: [11, 13], text: 'ArrayDeque as a stack: push adds to the front, pop removes from the front.' },
          { lines: [15, 18], text: 'PriorityQueue always polls the smallest element (a min-heap) regardless of insertion order.' },
          { lines: [20, 21], text: 'Java 21 sequenced collections: getFirst, getLast and a reversed view.' },
        ],
      },
      realWorld: {
        title: 'A 40-second endpoint caused by list.contains',
        scenario: `An import deduplicated 200,000 customer IDs with \`if (!seen.contains(id)) seen.add(id)\` where \`seen\` was an ArrayList. Each contains scanned the whole list: about 2×10¹⁰ comparisons, and the endpoint took 40 seconds.

Switching \`seen\` to a HashSet (or simply \`new LinkedHashSet<>(ids)\` to keep order) made the whole import run in under 100 ms. The data structure, not the language, was the bottleneck.`,
      },
      commonMistakes: [
        {
          mistake: 'Using `contains` on a List inside a loop.',
          why: 'Each call is O(n), so the loop becomes O(n²).',
          fix: 'Use a HashSet for membership tests.',
        },
        {
          mistake: 'Iterating a PriorityQueue expecting sorted order.',
          why: 'The heap is only partially ordered; only poll() returns elements in priority order.',
          fix: 'Poll repeatedly, or sort a copy.',
        },
        {
          mistake: 'Using java.util.Stack.',
          why: 'It extends Vector (synchronised) and exposes list operations that break stack semantics.',
          fix: 'Use ArrayDeque via the Deque interface.',
        },
      ],
      checks: [
        {
          id: 'c1-c1',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'You need unique tags in the order users first entered them. Which collection fits?',
          options: [
            { id: 'a', text: 'ArrayList' },
            { id: 'b', text: 'HashSet' },
            { id: 'c', text: 'LinkedHashSet' },
            { id: 'd', text: 'TreeSet' },
          ],
          correctOptionId: 'c',
          explanation: 'LinkedHashSet gives O(1) uniqueness checks and iterates in insertion order. TreeSet sorts; HashSet has no defined order.',
        },
        {
          id: 'c1-c2',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this print?',
          code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Deque<Integer> d = new ArrayDeque<>();
        d.push(1);
        d.push(2);
        d.offerLast(3);
        d.offerFirst(4);
        System.out.println(d.pollFirst() + " " + d.pollLast() + " " + d);
    }
}`,
          options: [
            { id: 'a', text: '4 3 [2, 1]' },
            { id: 'b', text: '1 4 [2, 3]' },
            { id: 'c', text: '4 1 [2, 3]' },
            { id: 'd', text: '2 3 [4, 1]' },
          ],
          correctOptionId: 'a',
          explanation: 'push adds to the front: [2, 1]; offerLast → [2, 1, 3]; offerFirst → [4, 2, 1, 3]. pollFirst removes 4, pollLast removes 3, leaving [2, 1].',
          hints: ['push is the same as addFirst.'],
        },
        {
          id: 'c1-c3',
          kind: 'mcq',
          dimension: 'runtime',
          prompt: 'What is the cost of `ArrayList.add(0, x)` on a list with n elements?',
          options: [
            { id: 'a', text: 'O(1)' },
            { id: 'b', text: 'O(log n)' },
            { id: 'c', text: 'O(n), because every element shifts one position' },
            { id: 'd', text: 'O(n²)' },
          ],
          correctOptionId: 'c',
          explanation: 'ArrayList is backed by an array; inserting at index 0 copies all existing elements one slot to the right.',
        },
        {
          id: 'c1-c4',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'A scheduler must repeatedly take the job with the earliest deadline from a changing set. What fits best?',
          options: [
            { id: 'a', text: 'ArrayList sorted after every insertion' },
            { id: 'b', text: 'PriorityQueue ordered by deadline' },
            { id: 'c', text: 'HashMap from deadline to job' },
            { id: 'd', text: 'LinkedList' },
          ],
          correctOptionId: 'b',
          explanation: 'A heap gives O(log n) insertion and removal of the minimum, exactly the access pattern needed.',
        },
      ],
      challengeIds: ['ch-brackets'],
      masteryCriteria: [
        'Choose a collection from stated requirements and justify it with complexity.',
        'Use ArrayDeque as both stack and queue.',
        'Explain why LinkedList is rarely the right choice.',
      ],
      relatedLessonIds: ['c-hashmap', 'c-sorted', 'c-queues-stacks', 'a-complexity'],
      revision: [
        { id: 'r1', question: 'Which class should you use for a stack in modern Java?', answer: 'ArrayDeque, through the Deque interface (push/pop/peek).' },
        { id: 'r2', question: 'What order does iterating a PriorityQueue give?', answer: 'An unspecified heap order; only successive poll() calls return elements in priority order.' },
        { id: 'r3', question: 'When would you choose a TreeMap over a HashMap?', answer: 'When you need keys sorted or range/nearest-key queries (floorKey, ceilingKey, subMap), accepting O(log n) operations.' },
      ],
    },

    // -----------------------------------------------------------------------
    {
      id: 'c-hashmap',
      moduleId: 'collections',
      title: 'HashMap internals and LinkedHashMap',
      summary: 'Hashing, buckets, resizing and treeification — and what that means for correctness and performance.',
      estimatedMinutes: 40,
      difficulty: 'advanced',
      prerequisites: ['c-collections-overview', 'o-object-contracts'],
      versionNotes: [
        { feature: 'Tree bins for heavily collided buckets', since: 8 },
        { feature: 'HashMap.newHashMap(expectedSize)', since: 19 },
      ],
      objectives: [
        'Explain how HashMap finds a bucket and resolves collisions.',
        'Describe resizing and treeification thresholds.',
        'Use merge, computeIfAbsent and getOrDefault idiomatically.',
        'Build an LRU cache with LinkedHashMap.',
      ],
      plainEnglish: `A HashMap is an array of "buckets". To store a key, it computes a number from the key (the **hash code**), uses it to pick a bucket, and puts the entry there. To look the key up later it computes the same number and goes straight to that bucket — no need to search everything.

Two different keys can land in the same bucket (a **collision**). Then the map compares keys with \`equals\` inside that bucket. When the map gets too full it doubles its array and redistributes entries.`,
      technical: `### Finding the bucket
1. \`h = key.hashCode()\`, then spread the high bits: \`hash = h ^ (h >>> 16)\`.
2. Index = \`hash & (capacity - 1)\` — capacity is always a power of two, so this is a fast modulo.
3. A null key is allowed and always hashes to bucket 0.

### Collisions
Each bucket holds a linked list of nodes. Lookups compare the stored hash first, then \`equals\`. Since Java 8, a bucket with **8 or more** entries is converted to a red-black tree **if the table has at least 64 buckets** (otherwise the table is resized instead), bounding worst-case lookups at O(log n). Trees shrink back to lists at 6.

### Resizing
Default capacity 16, load factor 0.75 → resize when size exceeds 12. Resizing doubles the table and splits each bucket into "stays at index i" or "moves to i + oldCapacity" based on one bit of the hash. Resizing is O(n), so pre-size maps you know will be large.

### Consequences
- Poor \`hashCode\` implementations (e.g. returning a constant) degrade performance towards O(n) or O(log n).
- Iteration order depends on hashes and capacity and can change after resizing.
- HashMap is not thread-safe; concurrent writers can lose updates or corrupt it. Use \`ConcurrentHashMap\` (which rejects null keys and values).

### Idioms
- \`counts.merge(word, 1, Integer::sum)\`
- \`groups.computeIfAbsent(key, k -> new ArrayList<>()).add(item)\`
- \`map.getOrDefault(key, 0)\`

### LinkedHashMap
Adds a doubly linked list through the entries: insertion order by default, or **access order** (\`new LinkedHashMap<>(16, 0.75f, true)\`). Overriding \`removeEldestEntry\` turns it into an LRU cache.`,
      whyItExists: `Hashing gives expected constant-time lookups independent of size, which is why maps underpin caches, indexes, deduplication and counting throughout real systems.`,
      whenToUse: [
        'Use HashMap for key lookups where order does not matter.',
        'Use LinkedHashMap for predictable iteration or simple LRU caches.',
        'Use merge/computeIfAbsent for counting and grouping.',
      ],
      whenNotToUse: [
        'Do not share a HashMap between threads without synchronization — use ConcurrentHashMap.',
        'Do not use mutable objects as keys.',
        'Do not build production caches with LinkedHashMap when you need TTLs, size by weight or concurrency — use a cache library such as Caffeine.',
      ],
      examples: [
        {
          id: 'buckets',
          title: 'Computing bucket indexes',
          runnable: true,
          code: `public class Main {
    static int bucket(Object key, int capacity) {
        int h = key.hashCode();
        int spread = h ^ (h >>> 16);
        return spread & (capacity - 1);
    }

    public static void main(String[] args) {
        for (String key : new String[] {"Aa", "BB", "apple", "java"}) {
            System.out.println(key + " hash=" + key.hashCode() + " bucket(16)=" + bucket(key, 16));
        }
        System.out.println("null key bucket: 0 (special-cased)");
    }
}`,
          expectedOutput: `Aa hash=2112 bucket(16)=0
BB hash=2112 bucket(16)=0
apple hash=93029210 bucket(16)=1
java hash=3254818 bucket(16)=3
null key bucket: 0 (special-cased)`,
          explanation: '"Aa" and "BB" have identical hash codes, so they always collide and are told apart with equals.',
        },
        {
          id: 'idioms-lru',
          title: 'merge, computeIfAbsent and an LRU cache',
          runnable: true,
          code: `import java.util.*;

public class Main {
    static class LruCache<K, V> extends LinkedHashMap<K, V> {
        private final int capacity;

        LruCache(int capacity) {
            super(16, 0.75f, true);           // accessOrder = true
            this.capacity = capacity;
        }

        @Override
        protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
            return size() > capacity;
        }
    }

    public static void main(String[] args) {
        String text = "the quick fox and the lazy dog and the cat";
        Map<String, Integer> counts = new TreeMap<>();
        Map<Integer, List<String>> byLength = new TreeMap<>();
        for (String w : text.split(" ")) {
            counts.merge(w, 1, Integer::sum);
            byLength.computeIfAbsent(w.length(), k -> new ArrayList<>()).add(w);
        }
        System.out.println(counts);
        System.out.println(byLength);

        LruCache<String, String> cache = new LruCache<>(2);
        cache.put("a", "A");
        cache.put("b", "B");
        cache.get("a");                        // a is now most recently used
        cache.put("c", "C");                   // evicts b
        System.out.println(cache.keySet());
    }
}`,
          expectedOutput: `{and=2, cat=1, dog=1, fox=1, lazy=1, quick=1, the=3}
{3=[the, fox, and, the, dog, and, the, cat], 4=[lazy], 5=[quick]}
[a, c]`,
        },
      ],
      walkthrough: {
        exampleId: 'buckets',
        steps: [
          { lines: [3, 3], text: 'String.hashCode is s[0]*31^(n-1) + ... + s[n-1]. For "Aa": 65*31 + 97 = 2112; for "BB": 66*31 + 66 = 2112.' },
          { lines: [4, 4], text: 'XOR with the upper 16 bits mixes high-order bits into the low bits that the index uses.' },
          { lines: [5, 5], text: 'With capacity 16, `& 15` keeps the lowest 4 bits — a fast modulo for powers of two.' },
          { lines: [9, 11], text: '"Aa" and "BB" collide in bucket 0; HashMap stores both in that bucket and distinguishes them with equals.' },
        ],
      },
      realWorld: {
        title: 'Hash flooding and a constant hashCode',
        scenario: `A team's \`CacheKey.hashCode()\` returned \`1\` "temporarily" during a refactor. Every entry landed in the same bucket. With Java 8 tree bins the worst case was O(log n) rather than O(n) — but only because the key also implemented Comparable; otherwise lookups degraded badly and CPU spiked under load.

The same mechanism is exploited by hash-flooding attacks: an attacker sends many keys that collide (e.g. "Aa"/"BB" combinations in form fields). Treeification and limits on request parameter counts in servlet containers are the defences; a proper hashCode is yours.`,
      },
      commonMistakes: [
        {
          mistake: 'Using containsKey + get + put for counting.',
          why: 'Three lookups and verbose code; easy to get null handling wrong.',
          fix: 'Use merge(key, 1, Integer::sum).',
        },
        {
          mistake: 'Assuming HashMap keeps insertion order.',
          why: 'It may for tiny maps by coincidence, then change after a resize.',
          fix: 'Use LinkedHashMap when order matters.',
        },
        {
          mistake: 'Updating a HashMap from multiple threads.',
          why: 'Concurrent puts can lose entries or corrupt internal structure.',
          fix: 'Use ConcurrentHashMap and its atomic methods (merge, compute).',
        },
      ],
      checks: [
        {
          id: 'c2-c1',
          kind: 'mcq',
          dimension: 'runtime',
          prompt: 'With default settings, when does a HashMap first resize its table?',
          options: [
            { id: 'a', text: 'When the 16th entry is added' },
            { id: 'b', text: 'When the size exceeds 12 (16 × 0.75)' },
            { id: 'c', text: 'When any bucket has 8 entries' },
            { id: 'd', text: 'Never; it grows each bucket instead' },
          ],
          correctOptionId: 'b',
          explanation: 'Threshold = capacity × load factor = 16 × 0.75 = 12. Adding the 13th entry triggers a resize to 32 buckets.',
        },
        {
          id: 'c2-c2',
          kind: 'mcq',
          dimension: 'runtime',
          prompt: 'In Java 8+, what happens when a bucket reaches 8 entries in a table of 16 buckets?',
          options: [
            { id: 'a', text: 'The bucket becomes a red-black tree' },
            { id: 'b', text: 'The table is resized instead, because treeification needs at least 64 buckets' },
            { id: 'c', text: 'An exception is thrown' },
            { id: 'd', text: 'New entries are rejected' },
          ],
          correctOptionId: 'b',
          explanation: 'TREEIFY_THRESHOLD is 8, but MIN_TREEIFY_CAPACITY is 64. Small tables resize, which usually spreads the entries out.',
        },
        {
          id: 'c2-c3',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this print?',
          code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Map<String, Integer> m = new HashMap<>();
        m.put(null, 1);
        m.put("a", null);
        System.out.println(m.get(null) + " " + m.get("a") + " " + m.containsKey("a") + " " + m.get("zzz"));
    }
}`,
          options: [
            { id: 'a', text: 'NullPointerException' },
            { id: 'b', text: '1 null true null' },
            { id: 'c', text: '1 null false null' },
            { id: 'd', text: 'null null true null' },
          ],
          correctOptionId: 'b',
          explanation: 'HashMap allows one null key and null values. get returns null both for "mapped to null" and "absent" — containsKey tells them apart. ConcurrentHashMap rejects nulls to avoid exactly this ambiguity.',
        },
        {
          id: 'c2-c4',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this print?',
          code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Map<String, Integer> lru = new LinkedHashMap<>(16, 0.75f, true) {
            @Override
            protected boolean removeEldestEntry(Map.Entry<String, Integer> e) {
                return size() > 3;
            }
        };
        lru.put("a", 1);
        lru.put("b", 2);
        lru.put("c", 3);
        lru.get("a");
        lru.put("d", 4);
        lru.get("c");
        lru.put("e", 5);
        System.out.println(lru.keySet());
    }
}`,
          options: [
            { id: 'a', text: '[c, d, e]' },
            { id: 'b', text: '[a, c, e]' },
            { id: 'c', text: '[d, c, e]' },
            { id: 'd', text: '[a, d, e]' },
          ],
          correctOptionId: 'c',
          explanation:
            'Access order moves read entries to the end. After get(a): b,c,a. put(d) evicts b → c,a,d. get(c) → a,d,c. put(e) evicts a → d,c,e.',
          hints: ['Track the order after every operation; the eldest (first) entry is evicted.'],
        },
        {
          id: 'c2-c5',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'What is the most idiomatic way to group orders by customer into `Map<String, List<Order>>`?',
          options: [
            { id: 'a', text: 'if (!map.containsKey(c)) map.put(c, new ArrayList<>()); map.get(c).add(o);' },
            { id: 'b', text: 'map.computeIfAbsent(c, k -> new ArrayList<>()).add(o);' },
            { id: 'c', text: 'map.put(c, List.of(o));' },
            { id: 'd', text: 'map.merge(c, o, (a, b) -> a);' },
          ],
          correctOptionId: 'b',
          explanation: 'computeIfAbsent creates the list only when missing and returns the existing or new list in one lookup. Option c replaces the list each time.',
        },
      ],
      challengeIds: ['ch-word-frequency', 'ch-lru'],
      masteryCriteria: [
        'Explain hash → index → bucket → equals, including collision handling.',
        'State the resize and treeify thresholds and why they exist.',
        'Implement counting, grouping and an LRU cache idiomatically.',
      ],
      relatedLessonIds: ['o-object-contracts', 'cc-synchronization'],
      revision: [
        { id: 'r1', question: 'How does HashMap compute a bucket index?', answer: 'hash = h ^ (h >>> 16) where h = key.hashCode(); index = hash & (capacity − 1). Null keys go to bucket 0.' },
        { id: 'r2', question: 'When are buckets treeified?', answer: 'When a bucket reaches 8 entries and the table has at least 64 buckets; otherwise the table resizes. Trees revert to lists at 6.' },
        { id: 'r3', question: 'How do you turn LinkedHashMap into an LRU cache?', answer: 'Construct it with accessOrder = true and override removeEldestEntry to return true when size() exceeds the capacity.' },
      ],
    },

    // -----------------------------------------------------------------------
    {
      id: 'c-sorted',
      moduleId: 'collections',
      title: 'Sorting, Comparable, Comparator and navigable collections',
      summary: 'Natural vs custom ordering, comparator composition, and TreeMap/TreeSet range queries.',
      estimatedMinutes: 30,
      difficulty: 'intermediate',
      prerequisites: ['c-collections-overview'],
      objectives: [
        'Implement Comparable and build Comparators with comparing/thenComparing.',
        'Explain why comparators must be consistent with equals in sorted sets.',
        'Use NavigableMap/NavigableSet methods for range and nearest-key queries.',
      ],
      plainEnglish: `To sort objects Java needs to know how to compare two of them.

- A class can define its **natural order** by implementing \`Comparable\` (like numbers or alphabetical strings).
- A **Comparator** is a separate rule you pass in: "sort employees by department, then by salary, highest first".

Sorted collections (\`TreeSet\`, \`TreeMap\`) keep elements in order all the time and can answer questions like "what is the largest key below 100?".`,
      technical: `### Comparable
\`compareTo\` returns negative, zero or positive. It should be consistent with equals (zero exactly when equals is true). Implement it for types with one obvious order (dates, money in one currency).

### Comparator composition
\`\`\`java
Comparator.comparing(Employee::department)
          .thenComparing(Employee::salary, Comparator.reverseOrder())
          .thenComparing(Employee::name);
\`\`\`
Use \`comparingInt\`/\`comparingLong\` to avoid boxing, \`nullsFirst\`/\`nullsLast\` for nullable keys, and \`reversed()\` carefully (it reverses the whole chain so far).

**Never** write \`return a.value - b.value;\` — subtraction overflows for large or negative values. Use \`Integer.compare\`.

### Sorting
\`List.sort\`/\`Collections.sort\` and \`Arrays.sort\` for objects use TimSort: stable (equal elements keep their order), O(n log n). Primitive arrays use dual-pivot quicksort (not stable, which does not matter for primitives).

### Tree collections use the comparator for equality
A TreeSet treats elements as duplicates when \`compare\` returns 0 — even if \`equals\` says they differ. A comparator that compares only part of the object silently drops elements.

### Navigable queries (O(log n))
\`floorKey(k)\` (≤ k), \`ceilingKey(k)\` (≥ k), \`lowerKey\`/\`higherKey\` (strict), \`headMap\`/\`tailMap\`/\`subMap\` views, \`firstEntry\`/\`lastEntry\`, \`pollFirst\`. Perfect for price tiers, time windows and leaderboards.`,
      whyItExists: `Ordering logic varies by use case, so Java separates a type's natural order from any number of situational orders. Tree-based collections keep data sorted incrementally, avoiding repeated full sorts.`,
      whenToUse: [
        'Use Comparator chains for multi-field sorting.',
        'Use TreeMap for tiered lookups ("which band does this value fall into?").',
        'Use stable sorting to sort by secondary key first, then primary.',
      ],
      whenNotToUse: [
        'Do not compute comparisons with subtraction.',
        'Do not use a TreeSet with a comparator that ignores fields that make elements distinct.',
        'Do not keep a list sorted by re-sorting after every insertion — use a tree or heap.',
      ],
      examples: [
        {
          id: 'comparators',
          title: 'Comparator chains and navigable maps',
          runnable: true,
          code: `import java.util.*;

public class Main {
    record Employee(String name, String dept, int salary) {}

    public static void main(String[] args) {
        List<Employee> staff = new ArrayList<>(List.of(
            new Employee("Mia", "eng", 120), new Employee("Sam", "ops", 90),
            new Employee("Ana", "eng", 150), new Employee("Leo", "eng", 120)));

        staff.sort(Comparator.comparing(Employee::dept)
            .thenComparing(Employee::salary, Comparator.reverseOrder())
            .thenComparing(Employee::name));
        staff.forEach(e -> System.out.println(e.dept() + " " + e.salary() + " " + e.name()));

        NavigableMap<Integer, String> shippingBands = new TreeMap<>(Map.of(
            0, "small", 2_000, "medium", 10_000, "large", 30_000, "freight"));
        for (int grams : new int[] {500, 2_000, 9_999, 45_000}) {
            System.out.println(grams + "g -> " + shippingBands.floorEntry(grams).getValue());
        }
        System.out.println(shippingBands.headMap(10_000, false).keySet());
    }
}`,
          expectedOutput: `eng 150 Ana
eng 120 Leo
eng 120 Mia
ops 90 Sam
500g -> small
2000g -> medium
9999g -> medium
45000g -> freight
[0, 2000]`,
        },
        {
          id: 'inconsistent',
          title: 'A comparator that loses data',
          runnable: true,
          code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Set<String> byLength = new TreeSet<>(Comparator.comparingInt(String::length));
        byLength.addAll(List.of("pear", "plum", "fig", "kiwi", "apple"));
        System.out.println(byLength);

        Set<String> fixed = new TreeSet<>(Comparator.comparingInt(String::length).thenComparing(Comparator.naturalOrder()));
        fixed.addAll(List.of("pear", "plum", "fig", "kiwi", "apple"));
        System.out.println(fixed);

        System.out.println(Integer.MIN_VALUE - 1 > 0);            // why subtraction comparators break
        System.out.println(Integer.compare(Integer.MIN_VALUE, 1));
    }
}`,
          expectedOutput: `[fig, pear, apple]
[fig, kiwi, pear, plum, apple]
true
-1`,
        },
      ],
      walkthrough: {
        exampleId: 'inconsistent',
        steps: [
          { lines: [5, 6], text: 'This TreeSet considers two strings equal when they have the same length.' },
          { lines: [7, 7], text: '"plum" and "kiwi" have length 4 like "pear", which was added first, so they are treated as duplicates and discarded.' },
          { lines: [9, 11], text: 'Adding a tie-breaker (natural order) makes the comparator consistent with equals, so nothing is lost.' },
          { lines: [13, 14], text: 'Integer.MIN_VALUE − 1 overflows to Integer.MAX_VALUE, a positive number — a subtraction comparator would say MIN_VALUE is greater than 1.' },
        ],
      },
      realWorld: {
        title: 'Leaderboard entries that vanished',
        scenario: `A game kept its leaderboard in \`TreeSet<Player>\` ordered by score. Whenever two players had the same score, the second one disappeared from the board — TreeSet treated them as the same element. Support tickets piled up from players "deleted" from rankings.

The comparator became \`comparingInt(Player::score).reversed().thenComparing(Player::id)\`, making ties distinct while keeping the order. A property-based test now inserts random players and asserts that the set size equals the number of distinct players.`,
      },
      commonMistakes: [
        {
          mistake: '`(a, b) -> a.price - b.price` as a comparator.',
          why: 'Subtraction can overflow and produce the wrong sign.',
          fix: 'Use Comparator.comparingInt(Item::price) or Integer.compare.',
        },
        {
          mistake: 'Calling reversed() at the end of a chain expecting only the last key reversed.',
          why: 'reversed() reverses the entire comparator built so far.',
          fix: 'Pass Comparator.reverseOrder() as the second argument to the specific thenComparing.',
        },
        {
          mistake: 'Using a partial comparator with TreeSet/TreeMap.',
          why: 'compare == 0 means "same element" for tree collections.',
          fix: 'Add tie-breakers so compare is 0 only for truly equal elements.',
        },
      ],
      checks: [
        {
          id: 'c3-c1',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this print?',
          code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        TreeMap<Integer, String> grades = new TreeMap<>(Map.of(90, "A", 80, "B", 70, "C", 0, "F"));
        System.out.println(grades.floorEntry(85).getValue() + grades.ceilingEntry(85).getValue()
            + grades.floorEntry(70).getValue() + grades.higherKey(90));
    }
}`,
          options: [
            { id: 'a', text: 'BACnull' },
            { id: 'b', text: 'BAC90' },
            { id: 'c', text: 'ABCnull' },
            { id: 'd', text: 'BACF' },
          ],
          correctOptionId: 'a',
          explanation: 'floor(85) = 80 → B; ceiling(85) = 90 → A; floor(70) = 70 → C; higherKey(90) has no key strictly greater, so null.',
        },
        {
          id: 'c3-c2',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this print?',
          code: `import java.util.*;

public class Main {
    record P(String name, int age) {}

    public static void main(String[] args) {
        List<P> people = new ArrayList<>(List.of(new P("b", 30), new P("a", 30), new P("c", 25)));
        people.sort(Comparator.comparing(P::name));
        people.sort(Comparator.comparingInt(P::age));
        System.out.println(people.stream().map(P::name).toList());
    }
}`,
          options: [
            { id: 'a', text: '[c, b, a]' },
            { id: 'b', text: '[c, a, b]' },
            { id: 'c', text: '[a, b, c]' },
            { id: 'd', text: '[b, a, c]' },
          ],
          correctOptionId: 'b',
          explanation: 'List.sort is stable. After sorting by name (a, b, c), sorting by age keeps a before b among the 30-year-olds: [c, a, b].',
        },
        {
          id: 'c3-c3',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'You need "orders by customer ascending, then by total descending". Which comparator is correct?',
          options: [
            { id: 'a', text: 'comparing(Order::customer).thenComparing(Order::total).reversed()' },
            { id: 'b', text: 'comparing(Order::customer).thenComparing(Order::total, Comparator.reverseOrder())' },
            { id: 'c', text: 'comparing(Order::total).reversed().thenComparing(Order::customer)' },
            { id: 'd', text: '(a, b) -> b.total() - a.total()' },
          ],
          correctOptionId: 'b',
          explanation: 'Option a reverses both keys, c sorts by total first, d ignores customer and can overflow.',
        },
      ],
      challengeIds: [],
      masteryCriteria: [
        'Build multi-key comparators with correct directions.',
        'Explain the TreeSet duplicate-dropping pitfall and its fix.',
        'Use floor/ceiling/headMap for tiered lookups.',
      ],
      relatedLessonIds: ['c-collections-overview', 'fn-streams'],
      revision: [
        { id: 'r1', question: 'Why must comparators used by TreeSet be consistent with equals?', answer: 'TreeSet uses compare == 0 to decide two elements are the same, so a partial comparator silently drops distinct elements.' },
        { id: 'r2', question: 'Why not compare ints by subtraction?', answer: 'The subtraction can overflow and flip the sign; use Integer.compare or comparingInt.' },
        { id: 'r3', question: 'Is List.sort stable?', answer: 'Yes (TimSort for objects): equal elements keep their relative order, enabling multi-pass sorting.' },
      ],
    },

    // -----------------------------------------------------------------------
    {
      id: 'c-iteration',
      moduleId: 'collections',
      title: 'Iteration, fail-fast behaviour and immutable collections',
      summary: 'ConcurrentModificationException, safe removal, views vs copies, and unmodifiable vs immutable.',
      estimatedMinutes: 30,
      difficulty: 'intermediate',
      prerequisites: ['c-collections-overview'],
      versionNotes: [
        { feature: 'removeIf', since: 8 },
        { feature: 'List.of, Set.of, Map.of', since: 9 },
        { feature: 'List.copyOf, Set.copyOf, Map.copyOf', since: 10 },
        { feature: 'Stream.toList()', since: 16 },
      ],
      objectives: [
        'Remove elements while iterating without errors.',
        'Explain fail-fast iterators and modCount.',
        'Distinguish views, unmodifiable wrappers and immutable copies.',
      ],
      plainEnglish: `If you change a list while looping over it with a for-each loop, Java usually stops you with a \`ConcurrentModificationException\` — "the thing you are walking through changed under your feet". Use \`removeIf\` or the iterator's own \`remove\`.

Some collections cannot be changed at all (**immutable**), like those from \`List.of\`. Others are read-only **views** of another collection: you cannot change them, but they still show changes made to the original.`,
      technical: `### Fail-fast iterators
ArrayList, HashMap and friends keep a \`modCount\` incremented on every structural change. Iterators remember the value they started with and throw \`ConcurrentModificationException\` on \`next()\` if it changed — a best-effort bug detector, not a thread-safety mechanism. The check happens in \`next()\`, so removing the **second-to-last** element in a for-each loop makes \`hasNext()\` return false and the loop ends silently without an exception (and without visiting the last element).

### Safe removal
- \`collection.removeIf(predicate)\` — clearest, and O(n) for ArrayList.
- \`Iterator.remove()\` — removes the last element returned by next().
- Build a new collection with streams/filter.
- Concurrent collections (\`CopyOnWriteArrayList\`, \`ConcurrentHashMap\`) have weakly consistent iterators that never throw CME.

### Views
- \`Arrays.asList(array)\` — fixed-size list backed by the array: \`set\` writes through, \`add\`/\`remove\` throw UnsupportedOperationException.
- \`list.subList(a, b)\` — a view; structural changes to the parent invalidate it.
- \`map.keySet()\`, \`values()\`, \`entrySet()\` — views; removing from them removes from the map.
- \`Collections.unmodifiableList(list)\` — read-only **view**: changes to the backing list are visible.

### Immutable collections
\`List.of\`, \`Set.of\`, \`Map.of\` (Java 9) and \`List.copyOf\` (Java 10) are truly unmodifiable and **reject nulls**. \`Set.of\`/\`Map.of\` reject duplicate elements/keys and have deliberately randomised iteration order between JVM runs. \`Stream.toList()\` (16) returns an unmodifiable list that allows nulls, whereas \`Collectors.toList()\` makes no guarantee (currently a mutable ArrayList).`,
      whyItExists: `Fail-fast iteration surfaces logic bugs immediately instead of producing silently wrong results. Immutable collections make it safe to share data between components and threads and to expose internal state without defensive copies at every call.`,
      whenToUse: [
        'Use removeIf for conditional removal.',
        'Return List.copyOf(internal) (or an immutable collection) from getters.',
        'Use List.of/Map.of for constants and test data.',
      ],
      whenNotToUse: [
        'Do not modify a collection inside a for-each loop over it.',
        'Do not treat unmodifiableList as a snapshot — it is a live view.',
        'Do not put nulls into List.of/Set.of/Map.of.',
      ],
      examples: [
        {
          id: 'cme',
          title: 'Removing while iterating',
          runnable: true,
          code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<String> users = new ArrayList<>(List.of("ann", "bob", "cid", "dee"));
        try {
            for (String u : users) {
                if (u.startsWith("b")) users.remove(u);
            }
        } catch (ConcurrentModificationException e) {
            System.out.println("CME!");
        }

        List<String> sneaky = new ArrayList<>(List.of("ann", "bob", "cid"));
        for (String u : sneaky) {
            if (u.equals("bob")) sneaky.remove(u);     // second-to-last: no exception
        }
        System.out.println("sneaky: " + sneaky);

        users = new ArrayList<>(List.of("ann", "bob", "cid", "dee"));
        users.removeIf(u -> u.startsWith("b") || u.startsWith("d"));
        System.out.println("removeIf: " + users);

        Iterator<String> it = new ArrayList<>(List.of("x", "y")).iterator();
        it.next();
        it.remove();
        System.out.println("iterator.remove ok: " + it.hasNext());
    }
}`,
          expectedOutput: `CME!
sneaky: [ann, cid]
removeIf: [ann, cid]
iterator.remove ok: true`,
        },
        {
          id: 'views',
          title: 'Views vs copies vs immutable',
          runnable: true,
          code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<String> backing = new ArrayList<>(List.of("a", "b"));
        List<String> view = Collections.unmodifiableList(backing);
        List<String> copy = List.copyOf(backing);
        backing.add("c");
        System.out.println(view + " " + copy);

        String[] array = {"x", "y"};
        List<String> asList = Arrays.asList(array);
        asList.set(0, "X");
        System.out.println(array[0]);
        try {
            asList.add("z");
        } catch (UnsupportedOperationException e) {
            System.out.println("asList is fixed-size");
        }

        try {
            List.of("ok", null);
        } catch (NullPointerException e) {
            System.out.println("List.of rejects null");
        }
    }
}`,
          expectedOutput: `[a, b, c] [a, b]
X
asList is fixed-size
List.of rejects null`,
        },
      ],
      walkthrough: {
        exampleId: 'cme',
        steps: [
          { lines: [6, 9], text: 'Removing "bob" changes modCount; the next call to next() notices and throws ConcurrentModificationException.' },
          { lines: [14, 17], text: 'Here "bob" is second-to-last. After removal the size is 2 and the cursor is 2, so hasNext() is false: the loop ends quietly — no exception, and "cid" is never visited.' },
          { lines: [20, 22], text: 'removeIf handles iteration and removal internally and is the idiomatic solution.' },
          { lines: [24, 27], text: 'Iterator.remove removes the element last returned by next() without invalidating the iterator.' },
        ],
      },
      realWorld: {
        title: 'Clean-up code that "only sometimes" crashed',
        scenario: `A session reaper looped over active sessions and removed expired ones inside a for-each loop. In tests with two or three sessions it often worked (the second-to-last case), so the bug shipped. In production, with thousands of sessions, it threw ConcurrentModificationException every few minutes, leaving expired sessions in memory.

\`sessions.values().removeIf(Session::isExpired)\` fixed it in one line. Because the map was also accessed by request threads, it was changed to a ConcurrentHashMap at the same time.`,
      },
      commonMistakes: [
        {
          mistake: 'Calling list.remove inside a for-each loop over the list.',
          why: 'The iterator detects the structural change and throws — or silently skips elements.',
          fix: 'Use removeIf or an explicit Iterator.',
        },
        {
          mistake: 'Returning Collections.unmodifiableList(internal) and assuming callers see a snapshot.',
          why: 'It is a live view of the internal list.',
          fix: 'Return List.copyOf(internal) for a snapshot.',
        },
        {
          mistake: 'Calling add on Arrays.asList.',
          why: 'The list is fixed-size because it is backed by the array.',
          fix: 'Wrap it: new ArrayList<>(Arrays.asList(...)).',
        },
      ],
      checks: [
        {
          id: 'c4-c1',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this print?',
          code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<Integer> nums = new ArrayList<>(List.of(1, 2, 3, 4));
        for (Integer n : nums) {
            if (n == 3) nums.remove(n);
        }
        System.out.println(nums);
    }
}`,
          options: [
            { id: 'a', text: '[1, 2, 4]' },
            { id: 'b', text: 'ConcurrentModificationException' },
            { id: 'c', text: '[1, 2, 3, 4]' },
          ],
          correctOptionId: 'a',
          explanation:
            '3 is the second-to-last element. After removing it, size is 3 and the cursor is 3, so hasNext() is false and the loop exits without calling next() — no exception, and 4 is never checked. (remove(n) removes the object because n is an Integer.)',
          hints: ['When exactly does the fail-fast check happen?'],
        },
        {
          id: 'c4-c2',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this print?',
          code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<String> items = new ArrayList<>(List.of("a", "b", "c", "d"));
        List<String> middle = items.subList(1, 3);
        middle.set(0, "B");
        middle.clear();
        System.out.println(items);
    }
}`,
          options: [
            { id: 'a', text: '[a, b, c, d]' },
            { id: 'b', text: '[a, d]' },
            { id: 'c', text: '[a, B, c, d]' },
            { id: 'd', text: 'UnsupportedOperationException' },
          ],
          correctOptionId: 'b',
          explanation: 'subList is a view: set writes through, and clear removes that range from the parent list.',
        },
        {
          id: 'c4-c3',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'A class wants getters that callers cannot use to change its internal list, even later. What should `getItems()` return?',
          options: [
            { id: 'a', text: 'The internal list' },
            { id: 'b', text: 'Collections.unmodifiableList(items) — a live read-only view' },
            { id: 'c', text: 'List.copyOf(items) — an immutable snapshot' },
            { id: 'd', text: 'Either b or c, depending on whether callers should see later changes' },
          ],
          correctOptionId: 'd',
          explanation: 'Both prevent callers from modifying the list. A view reflects later internal changes; a copy does not. Choose deliberately.',
        },
        {
          id: 'c4-c4',
          kind: 'multi-select',
          dimension: 'conceptual',
          prompt: 'Which statements about List.of are true? Select all that apply.',
          options: [
            { id: 'a', text: 'It throws NullPointerException if an element is null' },
            { id: 'b', text: 'add() throws UnsupportedOperationException' },
            { id: 'c', text: 'It is a view of the arguments array' },
            { id: 'd', text: 'It is safe to share between threads' },
          ],
          correctOptionIds: ['a', 'b', 'd'],
          explanation: 'List.of copies its arguments into an immutable list, so it is not a view, and immutable objects are thread-safe to share.',
        },
      ],
      challengeIds: ['ch-cme-cleanup'],
      masteryCriteria: [
        'Remove elements safely and explain the second-to-last CME quirk.',
        'Distinguish views, unmodifiable wrappers and immutable copies.',
        'Choose an immutable return type for getters.',
      ],
      relatedLessonIds: ['c-collections-overview', 'cc-synchronization'],
      revision: [
        { id: 'r1', question: 'How do fail-fast iterators detect modification?', answer: 'They compare the collection\'s modCount with the value captured when the iterator was created, in next(); a mismatch throws ConcurrentModificationException.' },
        { id: 'r2', question: 'unmodifiableList vs List.copyOf?', answer: 'unmodifiableList is a read-only live view of the backing list; List.copyOf is an immutable snapshot that rejects nulls.' },
        { id: 'r3', question: 'What can you do and not do with Arrays.asList?', answer: 'You can set elements (writing through to the array) but cannot add or remove; it is fixed-size.' },
      ],
    },

    // -----------------------------------------------------------------------
    {
      id: 'c-queues-stacks',
      moduleId: 'collections',
      title: 'Stacks, queues, deques and priority queues',
      summary: 'LIFO vs FIFO, why ArrayDeque replaces Stack, throwing vs special-value methods, heap-ordered PriorityQueue and a first look at BlockingQueue.',
      estimatedMinutes: 30,
      difficulty: 'intermediate',
      prerequisites: ['c-collections-overview'],
      versionNotes: [
        { feature: 'Queue, PriorityQueue, BlockingQueue', since: 5 },
        { feature: 'Deque and ArrayDeque', since: 6 },
        { feature: 'Deque is a SequencedCollection (getFirst, getLast, reversed)', since: 21 },
      ],
      objectives: [
        'Explain LIFO (stack) and FIFO (queue) order and pick the right one for a problem.',
        'Use ArrayDeque through the Deque interface as both a stack and a queue, and explain why it replaces java.util.Stack.',
        'Choose between the throwing (add/remove/element) and special-value (offer/poll/peek) Queue methods.',
        'Use PriorityQueue with a Comparator and explain why iterating it is not sorted.',
        'Recognise when a BlockingQueue is needed instead.',
      ],
      plainEnglish: `Many programs need to hold work "for later" and then take it out in a particular order:

- A **stack** is like a pile of plates: the last plate you put on top is the first one you take off. This is **LIFO** — last in, first out. Undo history, the browser Back button and matching brackets all work this way.
- A **queue** is like a line at a coffee shop: the first person to join is the first served. This is **FIFO** — first in, first out. Print jobs, messages and breadth-first search work this way.
- A **deque** ("deck", double-ended queue) lets you add and remove at **both** ends, so one object can act as either a stack or a queue.
- A **priority queue** is like a hospital emergency room: whoever is most urgent goes next, no matter when they arrived.

In modern Java you use \`ArrayDeque\` for stacks and queues and \`PriorityQueue\` for "most important first".`,
      technical: `### The interfaces
- \`Queue<E>\` (Java 5): add at the tail, remove at the head.
- \`Deque<E>\` (Java 6) extends Queue: operations at both ends (\`addFirst\`/\`offerFirst\`, \`pollLast\`, …) plus stack methods \`push\` = \`addFirst\`, \`pop\` = \`removeFirst\`, \`peek\` = \`peekFirst\`. Since Java 21 a Deque is also a \`SequencedCollection\`.

### Two families of methods
Each Queue operation comes in two forms:
- **Throws** on failure: \`add(e)\` (IllegalStateException when a bounded queue is full), \`remove()\` and \`element()\` (NoSuchElementException when empty).
- **Returns a special value**: \`offer(e)\` returns \`false\` when full, \`poll()\` and \`peek()\` return \`null\` when empty.

Use \`offer\`/\`poll\`/\`peek\` when "empty" or "full" is a normal situation; use the throwing forms when it would be a bug. Because \`null\` means "empty", most queues (ArrayDeque, PriorityQueue, all BlockingQueues) **reject null elements**.

### ArrayDeque
A resizable circular array with head and tail indexes: amortised O(1) at both ends, no per-element node objects, good cache locality. It is faster than \`LinkedList\` for queue use and replaces the legacy \`Stack\` class, which extends \`Vector\` (every method synchronised) and exposes index operations like \`add(0, x)\` that break stack discipline. Note that a \`Stack\` prints bottom-to-top while an ArrayDeque used with push prints top-to-bottom.

### PriorityQueue
An unbounded **binary min-heap** stored in an array. \`offer\` and \`poll\` are O(log n), \`peek\` is O(1), \`remove(Object)\` and \`contains\` are O(n). Order comes from natural ordering or a \`Comparator\` (\`Comparator.reverseOrder()\` gives a max-heap). Only the head is guaranteed to be the smallest: **iteration and toString show heap order, not sorted order**, and ties have no guaranteed order — add a tie-breaker to the comparator when it matters. Do not change an element's priority fields while it sits in the queue; remove it and re-insert it.

### BlockingQueue (preview)
\`java.util.concurrent.BlockingQueue\` adds a third family: \`put\` waits while full, \`take\` waits while empty, and \`offer(e, timeout, unit)\`/\`poll(timeout, unit)\` wait for a limited time. Implementations such as \`ArrayBlockingQueue\` (bounded), \`LinkedBlockingQueue\` and \`PriorityBlockingQueue\` are the backbone of producer-consumer designs and thread pools; they are covered with concurrency.`,
      whyItExists: `Ordering work is one of the most common needs in software — undo stacks, job queues, schedulers, graph searches. Standard interfaces with clear method contracts let you express the order you need (LIFO, FIFO or by priority) and swap in a thread-safe or bounded implementation later without rewriting callers.`,
      whenToUse: [
        'Use Deque<T> stack = new ArrayDeque<>() for stacks: undo, backtracking, depth-first search, bracket matching.',
        'Use Queue<T> queue = new ArrayDeque<>() for FIFO work lists and breadth-first search.',
        'Use PriorityQueue for "always process the most urgent next": schedulers, Dijkstra, top-k, merging sorted streams.',
        'Use a BlockingQueue when producer and consumer threads hand work to each other.',
      ],
      whenNotToUse: [
        'Do not use java.util.Stack or Vector in new code.',
        'Do not iterate or print a PriorityQueue expecting sorted order — poll repeatedly or sort a copy.',
        'Do not store null in queues; null is the "empty" signal of poll and peek.',
        'Do not share an ArrayDeque or PriorityQueue between threads — use a concurrent or blocking queue.',
      ],
      examples: [
        {
          id: 'deque-basics',
          title: 'One ArrayDeque as a stack, one as a queue',
          runnable: true,
          code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Deque<String> stack = new ArrayDeque<>();       // LIFO: last in, first out
        stack.push("home");
        stack.push("cart");
        stack.push("checkout");
        System.out.println("stack " + stack + ", peek = " + stack.peek());
        System.out.println("pop: " + stack.pop() + ", then " + stack.pop());

        Queue<String> queue = new ArrayDeque<>();       // FIFO: first in, first out
        queue.offer("job-1");
        queue.offer("job-2");
        queue.offer("job-3");
        System.out.println("queue " + queue + ", peek = " + queue.peek());
        System.out.println("poll: " + queue.poll() + ", then " + queue.poll());

        Queue<String> empty = new ArrayDeque<>();
        System.out.println("poll on empty: " + empty.poll());
        System.out.println("peek on empty: " + empty.peek());
        try {
            empty.remove();
        } catch (NoSuchElementException e) {
            System.out.println("remove on empty: NoSuchElementException");
        }
        try {
            empty.offer(null);
        } catch (NullPointerException e) {
            System.out.println("ArrayDeque rejects null elements");
        }
    }
}`,
          expectedOutput: `stack [checkout, cart, home], peek = checkout
pop: checkout, then cart
queue [job-1, job-2, job-3], peek = job-1
poll: job-1, then job-2
poll on empty: null
peek on empty: null
remove on empty: NoSuchElementException
ArrayDeque rejects null elements`,
          explanation: 'push and pop work at the head, so the most recent page comes out first. offer adds at the tail and poll removes from the head, so jobs come out in arrival order.',
        },
        {
          id: 'priority-heap',
          title: 'PriorityQueue: heap order vs poll order, and custom comparators',
          runnable: true,
          code: `import java.util.*;

public class Main {
    record Task(String name, int priority) {}

    public static void main(String[] args) {
        PriorityQueue<Integer> minHeap = new PriorityQueue<>(List.of(5, 1, 4, 2, 3));
        System.out.println("iteration (heap order): " + minHeap);
        List<Integer> polled = new ArrayList<>();
        while (!minHeap.isEmpty()) polled.add(minHeap.poll());
        System.out.println("poll order: " + polled);

        PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Comparator.reverseOrder());
        maxHeap.addAll(List.of(5, 1, 4, 2, 3));
        System.out.println("max first: " + maxHeap.poll() + ", " + maxHeap.poll());

        PriorityQueue<Task> tasks = new PriorityQueue<>(
            Comparator.comparingInt(Task::priority).thenComparing(Task::name));
        tasks.offer(new Task("write report", 3));
        tasks.offer(new Task("fix outage", 1));
        tasks.offer(new Task("answer email", 3));
        tasks.offer(new Task("deploy hotfix", 2));
        while (!tasks.isEmpty()) {
            Task t = tasks.poll();
            System.out.println(t.priority() + " " + t.name());
        }
    }
}`,
          expectedOutput: `iteration (heap order): [1, 2, 4, 5, 3]
poll order: [1, 2, 3, 4, 5]
max first: 5, 4
1 fix outage
2 deploy hotfix
3 answer email
3 write report`,
          explanation: 'Printing the queue shows the internal heap array, where only the first element is guaranteed to be the smallest. The name tie-breaker makes the order of the two priority-3 tasks deterministic.',
        },
        {
          id: 'blocking-preview',
          title: 'A bounded BlockingQueue (single-threaded preview)',
          runnable: true,
          code: `import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        BlockingQueue<String> inbox = new ArrayBlockingQueue<>(2);   // bounded: capacity 2
        System.out.println(inbox.offer("a") + " " + inbox.offer("b") + " " + inbox.offer("c"));
        System.out.println("remaining capacity: " + inbox.remainingCapacity());
        try {
            inbox.add("c");
        } catch (IllegalStateException e) {
            System.out.println("add on full queue: " + e.getMessage());
        }
        boolean accepted = inbox.offer("c", 10, TimeUnit.MILLISECONDS);
        System.out.println("offer with timeout: " + accepted);
        System.out.println("take: " + inbox.take() + ", poll: " + inbox.poll() + ", poll: " + inbox.poll());
    }
}`,
          expectedOutput: `true true false
remaining capacity: 0
add on full queue: Queue full
offer with timeout: false
take: a, poll: b, poll: null`,
          explanation: 'With one thread nobody can make room, so offer returns false, add throws and the timed offer gives up after 10 ms. In a real producer-consumer program, put and take would wait for another thread instead.',
        },
      ],
      walkthrough: {
        exampleId: 'deque-basics',
        steps: [
          { lines: [5, 5], text: 'Declare the variable as Deque so the stack methods (push, pop, peek) are available, and choose ArrayDeque as the implementation.' },
          { lines: [6, 9], text: 'push adds to the head each time, so the deque reads [checkout, cart, home] from top to bottom; peek looks at the top without removing it.' },
          { lines: [10, 10], text: 'pop removes from the head: the most recently pushed page comes out first. That is LIFO.' },
          { lines: [12, 17], text: 'The same class used through the Queue interface: offer adds at the tail and poll removes from the head, so job-1 (the oldest) is served first. That is FIFO.' },
          { lines: [19, 21], text: 'On an empty queue the special-value methods return null instead of failing.' },
          { lines: [22, 26], text: 'remove() is the throwing twin of poll(): on an empty queue it throws NoSuchElementException.' },
          { lines: [27, 31], text: 'Because null means "empty" for poll and peek, ArrayDeque refuses to store null at all.' },
        ],
      },
      realWorld: {
        title: 'A job scheduler that ran jobs in the wrong order',
        scenario: `A reporting service kept pending jobs in a \`PriorityQueue<Job>\` ordered by deadline. An admin page listed "upcoming jobs" by iterating the queue, and the on-call engineer was confused: the page showed a job due next week above one due in five minutes. Nothing was wrong with the scheduler — \`poll()\` always returned the earliest deadline — but iteration walks the heap array, which is only partially ordered.

A second, real bug hid behind it: when a job was rescheduled, the code changed its \`deadline\` field while it was still inside the queue, so the heap was never re-ordered and the job ran at its old time. The fix was to \`remove\` the job, update it and \`offer\` it again (and to build the admin list from a sorted copy).`,
      },
      commonMistakes: [
        {
          mistake: 'Using java.util.Stack for a stack.',
          why: 'Stack extends Vector: every call is synchronised, it allows index-based inserts that break LIFO, and its iteration order is bottom-to-top.',
          fix: 'Use Deque<T> stack = new ArrayDeque<>() with push, pop and peek.',
          code: `Deque<Character> brackets = new ArrayDeque<>();
brackets.push('(');
char open = brackets.pop();`,
        },
        {
          mistake: 'Calling remove() or element() when an empty queue is a normal case.',
          why: 'They throw NoSuchElementException on an empty queue.',
          fix: 'Use poll() and peek(), which return null, and check the result (or check isEmpty() first).',
        },
        {
          mistake: 'Printing or iterating a PriorityQueue to show items in priority order.',
          why: 'The iterator walks the internal heap array, which is only partially ordered.',
          fix: 'Poll repeatedly, or copy into a list and sort it: new ArrayList<>(pq) then list.sort(comparator).',
        },
        {
          mistake: 'Changing the field a PriorityQueue orders by while the element is inside it.',
          why: 'The heap only re-orders on insert and removal, so the element keeps its stale position.',
          fix: 'Remove the element, change it, then offer it again — or use immutable elements.',
        },
      ],
      checks: [
        {
          id: 'c5-c1',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this print?',
          code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Stack<Integer> legacy = new Stack<>();
        Deque<Integer> modern = new ArrayDeque<>();
        for (int i = 1; i <= 3; i++) {
            legacy.push(i);
            modern.push(i);
        }
        System.out.println(legacy + " " + modern + " " + legacy.pop() + modern.pop());
    }
}`,
          options: [
            { id: 'a', text: '[1, 2, 3] [3, 2, 1] 33' },
            { id: 'b', text: '[3, 2, 1] [3, 2, 1] 33' },
            { id: 'c', text: '[1, 2, 3] [1, 2, 3] 33' },
            { id: 'd', text: '[1, 2, 3] [3, 2, 1] 31' },
          ],
          correctOptionId: 'a',
          explanation: 'Both pop 3 (the last pushed), but they print differently: Stack is a Vector that appends at the end, so it prints bottom-to-top; ArrayDeque.push adds at the head, so it prints top-to-bottom.',
          hints: ['Stack extends Vector. Where does Vector add new elements?'],
        },
        {
          id: 'c5-c2',
          kind: 'multi-select',
          dimension: 'conceptual',
          prompt: 'Which Queue methods return a special value (null or false) instead of throwing when the queue is empty or full? Select all that apply.',
          options: [
            { id: 'a', text: 'add(e)' },
            { id: 'b', text: 'offer(e)' },
            { id: 'c', text: 'remove()' },
            { id: 'd', text: 'poll()' },
            { id: 'e', text: 'element()' },
            { id: 'f', text: 'peek()' },
          ],
          correctOptionIds: ['b', 'd', 'f'],
          explanation: 'offer returns false when a bounded queue is full; poll and peek return null when empty. add, remove and element are the throwing twins.',
          hints: ['The methods pair up: add/offer, remove/poll, element/peek.'],
        },
        {
          id: 'c5-c3',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this print?',
          code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Deque<Integer> d = new ArrayDeque<>();
        d.offer(1);
        d.offer(2);
        d.push(3);
        d.offerLast(4);
        System.out.println(d.poll() + " " + d.pop() + " " + d.pollLast() + " " + d);
    }
}`,
          options: [
            { id: 'a', text: '1 2 4 [3]' },
            { id: 'b', text: '3 1 4 [2]' },
            { id: 'c', text: '3 4 2 [1]' },
            { id: 'd', text: '1 3 4 [2]' },
          ],
          correctOptionId: 'b',
          explanation: 'offer adds at the tail: [1, 2]. push adds at the head: [3, 1, 2]. offerLast: [3, 1, 2, 4]. poll and pop both remove from the head (3, then 1), pollLast removes 4, leaving [2].',
          hints: ['Write the deque out after every call; poll and pop both take from the head.'],
        },
        {
          id: 'c5-c4',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this print?',
          code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        PriorityQueue<String> pq = new PriorityQueue<>();
        pq.add("pear");
        pq.add("apple");
        pq.add("fig");
        pq.add("banana");
        System.out.println(pq.peek() + " " + pq.size());
        System.out.println(pq.poll() + " " + pq.poll());
    }
}`,
          options: [
            { id: 'a', text: 'pear 4\npear apple' },
            { id: 'b', text: 'apple 4\napple banana' },
            { id: 'c', text: 'apple 3\nbanana fig' },
            { id: 'd', text: 'banana 4\napple banana' },
          ],
          correctOptionId: 'b',
          explanation: 'With natural ordering the head is always the alphabetically smallest string. peek does not remove, so the size stays 4; each poll removes the current smallest.',
        },
        {
          id: 'c5-c5',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'A web crawler thread finds URLs and four worker threads download them. If downloads fall behind, the finder should wait rather than use unlimited memory. What fits best?',
          options: [
            { id: 'a', text: 'An ArrayDeque shared by all threads' },
            { id: 'b', text: 'A bounded ArrayBlockingQueue: the finder calls put, workers call take' },
            { id: 'c', text: 'A PriorityQueue with a comparator on URL length' },
            { id: 'd', text: 'java.util.Stack, because its methods are synchronised' },
          ],
          correctOptionId: 'b',
          explanation: 'A bounded BlockingQueue is thread-safe and applies back-pressure: put blocks when it is full and take blocks when it is empty. ArrayDeque and PriorityQueue are not thread-safe, and Stack is LIFO with no waiting.',
        },
      ],
      challengeIds: [],
      masteryCriteria: [
        'Choose stack, queue or priority queue from a problem description and justify it.',
        'Use ArrayDeque for both stack and queue, and explain why Stack is legacy.',
        'Pick the throwing or special-value Queue method deliberately.',
        'Explain why PriorityQueue iteration is not sorted, and write multi-key priority comparators.',
      ],
      relatedLessonIds: ['c-collections-overview', 'c-sorted', 'a-complexity', 'cc-synchronization'],
      revision: [
        { id: 'r1', question: 'What is the difference between LIFO and FIFO?', answer: 'LIFO (stack): the last element added is the first removed. FIFO (queue): the first element added is the first removed.' },
        { id: 'r2', question: 'Which Queue methods throw and which return special values?', answer: 'add/remove/element throw (IllegalStateException when full, NoSuchElementException when empty); offer/poll/peek return false or null instead.' },
        { id: 'r3', question: 'Why use ArrayDeque instead of Stack?', answer: 'Stack extends Vector: synchronised on every call, exposes index operations that break LIFO, and is legacy. ArrayDeque is a fast, unsynchronised circular array with O(1) operations at both ends.' },
        { id: 'r4', question: 'What are the costs of PriorityQueue operations, and what does iteration return?', answer: 'offer and poll O(log n), peek O(1), remove(Object)/contains O(n). Iteration returns heap order, which is not sorted.' },
        { id: 'r5', question: 'What does a BlockingQueue add?', answer: 'Methods that wait: put blocks while full, take blocks while empty, and timed offer/poll wait up to a limit. It is the standard tool for producer-consumer hand-off between threads.' },
      ],
    },
  ],
};
