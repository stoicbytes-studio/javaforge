import type { LessonConcepts } from '@/types/curriculum';

/** Concept pages for module 6 (Collections), keyed by lesson id. */
export const collectionsConcepts: Record<string, LessonConcepts> = {
  // -------------------------------------------------------------------------
  'c-collections-overview': {
    textbook: {
      definition:
        'The **Java Collections Framework** is a single, unified design in `java.util` for storing and working with groups of objects. It has three parts. **Collection interfaces** are abstract data types: `Collection` with its sub-interfaces `List`, `Set`, `Queue` and `Deque`, plus the separate `Map` hierarchy. **Implementations** are concrete, reusable data structures that implement those interfaces. **Algorithms** are polymorphic methods, such as sorting and searching, in the `Collections` utility class. Client code depends only on the interfaces. So you can swap in an implementation with different performance without changing the client.',
      terms: [
        { term: 'Collection', meaning: 'The root interface of the collection hierarchy. It is a group of objects, called elements, and supports size, membership checks, adding, removing and iteration.' },
        { term: 'Map', meaning: 'An object that maps keys to values, with at most one value per key. It is part of the framework but is not a subtype of `Collection`.' },
        { term: 'Implementation', meaning: 'A concrete class, such as `ArrayList` or `HashMap`, that implements a collection interface. It uses a specific data structure and documents the cost of each operation.' },
        { term: 'Encounter order', meaning: 'The order in which a collection gives you its elements during iteration. It is defined for lists and sequenced collections. It is not specified for hash-based sets and maps.' },
        { term: 'View', meaning: 'A collection backed by another collection or map, such as `keySet()` or `reversed()`. Changes to one can be seen through the other.' },
      ],
      source: 'Javadoc for java.util.Collection and java.util.Map; Collections Framework Overview (Oracle); JEP 431',
    },
    interviewDefinition:
      'The Java Collections Framework is a set of **interfaces** plus interchangeable **implementations** with documented costs. The interfaces are `Collection` with its sub-types `List`, `Set` and `Queue`/`Deque`, plus the separate `Map`. You choose first by meaning (order, uniqueness, key lookup, access by index, priority), then by cost. `ArrayList`, `HashMap`, `HashSet` and `ArrayDeque` are the defaults. *Linked* variants add insertion order. *Tree* variants keep sorted order in O(log n). Java 21 added **sequenced** interfaces for collections with a defined encounter order.',
    interviewFollowUps: [
      {
        question: 'ArrayList or LinkedList?',
        answer: 'Almost always `ArrayList`. It gives O(1) indexed access, compact memory and excellent cache locality. `LinkedList` only wins in theory (asymptotically), for inserts/removes at a position you already hold an iterator to. In practice, following pointers makes it slower. For queue use, `ArrayDeque` also beats `LinkedList`.',
      },
      {
        question: 'Why is `Map` not a `Collection`?',
        answer: 'A map stores key-value **pairs** and looks them up by key. `Collection.add(E)` has no sensible meaning for it. Instead, a map gives three collection **views**: `keySet()`, `values()` and `entrySet()`.',
      },
      {
        question: 'What did sequenced collections (Java 21) change?',
        answer: 'JEP 431 added `SequencedCollection`, `SequencedSet` and `SequencedMap`. They give every ordered collection the same `getFirst`, `getLast`, `addFirst`, `addLast`, `removeFirst`, `removeLast` and a `reversed()` view. Before, getting the last element was `list.get(size - 1)`, `deque.getLast()` or `sortedSet.last()`. For `LinkedHashSet` it was impossible.',
      },
      {
        question: 'Why declare `List<Order> orders = new ArrayList<>()` instead of `ArrayList<Order>`?',
        answer: 'Programming to the interface means callers depend only on the features they use. So the implementation can change (to `CopyOnWriteArrayList`, an immutable list, etc.) without touching them.',
      },
    ],
    mnemonic: {
      device: '"AH-HA!" defaults, then Linked = Line, Tree = sorTed',
      expansion: [
        { key: 'A', meaning: 'ArrayList — the default List' },
        { key: 'H', meaning: 'HashMap — the default Map' },
        { key: 'H', meaning: 'HashSet — the default Set' },
        { key: 'A', meaning: 'ArrayDeque — the default stack and queue' },
        { key: 'Linked…', meaning: 'Same hashing, but remembers the line (insertion order)' },
        { key: 'Tree…', meaning: 'Keeps keys sorted, with O(log n) operations and range queries' },
      ],
      visual: 'Picture a developer shouting "AH-HA!" as they reach for the four defaults, then swapping in a Linked or Tree variant only when someone asks "in what order?".',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'A kitchen with four kinds of storage',
        body: 'A **List** is a numbered spice rack: slot 3 is always slot 3 and you can have two jars of salt. A **Set** is a guest list: each name at most once. A **Map** is a coat check: hand over a ticket (key), get your coat (value). A **Queue** is the order rail above the stove: tickets are taken in a fixed order — oldest first, newest first, or most urgent first.',
      },
      {
        kind: 'insight',
        title: 'Big-O is not the whole story',
        body: 'On paper `LinkedList.add(i, x)` beats `ArrayList`, but finding position i is O(n) and every node is a separate heap object, so the CPU stalls on cache misses. `ArrayList` shifts elements with a single `System.arraycopy` over contiguous memory, which is very fast. Measure before picking a structure for its theoretical complexity.',
      },
      {
        kind: 'real-world',
        title: 'One e-commerce page, five collections',
        body: 'The cart is a `List<CartLine>` (order matters, duplicates allowed). "Recently viewed" is a `LinkedHashSet<Sku>` (unique, most recent order). The catalogue cache is a `HashMap<Sku, Product>` (fast lookup). Shipping price bands are a `TreeMap<Integer, Rate>` (`floorEntry(weight)`). Order fulfilment pulls from a queue so that the oldest order ships first.',
      },
      {
        kind: 'angle',
        title: 'Ask the questions in the right order',
        body: 'Key → value? Use a Map. Otherwise: must elements be unique? Use a Set. Otherwise: consumed from the ends or by priority? Use a Deque or PriorityQueue. Otherwise: a List. Only then refine: which order (none, insertion, sorted)? Shared between threads? Read-only?',
      },
    ],
    diagrams: [
      {
        id: 'c-collections-overview-hierarchy',
        kind: 'architecture',
        title: 'The interface hierarchy and its main implementations',
        caption: 'Collection branches into List, Set and Queue; Deque extends Queue. Map stands apart, with its own sorted sub-interface. The pills are the concrete classes you create.',
        explanation: [
          'At the top sits **Iterable**, the interface that lets any collection be used in a for-each loop. **Collection** extends it and adds the basic operations: add, remove, size and contains.',
          '**Collection** branches into three sub-interfaces: **List** (indexed, duplicates allowed), **Set** (unique elements) and **Queue** (elements taken from the head). The arrow labelled extends shows that **Deque** is a Queue that also works at both ends.',
          'The pills on the bottom row are the classes you actually create: **ArrayList** for lists, **HashSet** (or LinkedHashSet, TreeSet) for sets, **PriorityQueue** for priority order and **ArrayDeque** for stacks and FIFO queues.',
          'On the right, the **Map family (not a Collection)** group holds **Map**, which stores key-value pairs. **NavigableMap** extends it with sorted keys and range queries.',
          '**HashMap** is the default map implementation. **TreeMap**, a red-black tree, implements NavigableMap for when keys must stay sorted.',
          'Takeaway: declare variables with the interface type (List, Set, Map) and choose the implementation pill for its cost and ordering.',
        ],
        cols: 5,
        rows: 4,
        nodes: [
          { id: 'iter', label: 'Iterable', detail: 'for-each support', col: 1, row: 0, tone: 'neutral' },
          { id: 'coll', label: 'Collection', detail: 'add, remove, size', col: 1, row: 1, tone: 'primary' },
          { id: 'list', label: 'List', detail: 'indexed, duplicates', col: 0, row: 2, tone: 'primary' },
          { id: 'set', label: 'Set', detail: 'unique elements', col: 1, row: 2, tone: 'primary' },
          { id: 'queue', label: 'Queue', detail: 'take from the head', col: 2, row: 2, tone: 'primary' },
          { id: 'deque', label: 'Deque', detail: 'both ends: stack/queue', col: 3, row: 2, tone: 'primary' },
          { id: 'listImpl', label: 'ArrayList', detail: 'LinkedList', col: 0, row: 3, shape: 'pill', tone: 'success' },
          { id: 'setImpl', label: 'HashSet', detail: 'LinkedHashSet, TreeSet', col: 1, row: 3, shape: 'pill', tone: 'success' },
          { id: 'queueImpl', label: 'PriorityQueue', detail: 'binary heap', col: 2, row: 3, shape: 'pill', tone: 'success' },
          { id: 'dequeImpl', label: 'ArrayDeque', detail: 'LinkedList', col: 3, row: 3, shape: 'pill', tone: 'success' },
          { id: 'map', label: 'Map', detail: 'key → value', col: 3, row: 0, tone: 'accent' },
          { id: 'smap', label: 'NavigableMap', detail: 'sorted keys, ranges', col: 4, row: 0, tone: 'accent' },
          { id: 'mapImpl', label: 'HashMap', detail: 'LinkedHashMap, EnumMap', col: 3, row: 1, shape: 'pill', tone: 'success' },
          { id: 'treeImpl', label: 'TreeMap', detail: 'red-black tree', col: 4, row: 1, shape: 'pill', tone: 'success' },
        ],
        edges: [
          { from: 'iter', to: 'coll' },
          { from: 'coll', to: 'list' },
          { from: 'coll', to: 'set' },
          { from: 'coll', to: 'queue' },
          { from: 'queue', to: 'deque', label: 'extends' },
          { from: 'list', to: 'listImpl' },
          { from: 'set', to: 'setImpl' },
          { from: 'queue', to: 'queueImpl' },
          { from: 'deque', to: 'dequeImpl' },
          { from: 'map', to: 'smap', label: 'extends' },
          { from: 'map', to: 'mapImpl' },
          { from: 'smap', to: 'treeImpl' },
        ],
        groups: [
          { label: 'Collection sub-types', fromCol: 0, toCol: 3, fromRow: 2, toRow: 3, tone: 'primary' },
          { label: 'Map family (not a Collection)', fromCol: 3, toCol: 4, fromRow: 0, toRow: 1, tone: 'accent' },
        ],
      },
      {
        id: 'c-collections-overview-same-data',
        kind: 'concept',
        title: 'Same data, four different shapes',
        caption: 'The same page visits give different results in different collections. A List keeps everything. Sets drop duplicates (in first-seen or sorted order). A Map sums up the data by key.',
        explanation: [
          'The note at the top, **home, cart, home**, is the raw input: three page visits in arrival order, with home appearing twice.',
          'Following the arrow labelled keeps all, an **ArrayList** stores every visit in order, duplicates included: [home, cart, home].',
          'A **LinkedHashSet** drops the second home but remembers first-seen order, giving [home, cart]. A **TreeSet** also drops duplicates but sorts the elements, giving [cart, home].',
          'The **HashMap counts** box uses `merge(k, 1, sum)` to turn the visits into a summary keyed by page: home=2, cart=1. The order is not guaranteed.',
          'Takeaway: the same data takes a different shape depending on whether you need duplicates, order, sorting or a summary by key.',
        ],
        cols: 4,
        rows: 2,
        nodes: [
          { id: 'src', label: 'home, cart, home', detail: 'page visits in arrival order', col: 1, row: 0, span: 2, shape: 'note', tone: 'neutral' },
          { id: 'al', label: 'ArrayList', detail: '[home, cart, home]', col: 0, row: 1, tone: 'primary' },
          { id: 'lhs', label: 'LinkedHashSet', detail: '[home, cart]', col: 1, row: 1, tone: 'primary' },
          { id: 'ts', label: 'TreeSet', detail: '[cart, home]', col: 2, row: 1, tone: 'primary' },
          { id: 'hm', label: 'HashMap counts', detail: '{home=2, cart=1} (any order)', col: 3, row: 1, tone: 'accent' },
        ],
        edges: [
          { from: 'src', to: 'al', label: 'keeps all' },
          { from: 'src', to: 'lhs', label: 'unique, first seen' },
          { from: 'src', to: 'ts', label: 'unique, sorted' },
          { from: 'src', to: 'hm', label: 'merge(k, 1, sum)' },
        ],
      },
      {
        id: 'c-collections-overview-choose',
        kind: 'flow',
        title: 'Choosing a collection',
        caption: 'Ask about the shape of the data first, then about order. Each path ends at a sensible default. Linked and Tree variants are refinements, not starting points.',
        explanation: [
          'Start with **Key → value?** If you look things up by a key, the yes arrow leads to **HashMap**. Switch to a Linked or Tree map only if you need an order.',
          'If not, ask **Unique elements?** A yes leads to **HashSet**, again refined to LinkedHashSet or TreeSet when order matters.',
          'If duplicates are fine, ask **Take from ends or by priority?** Taking from the ends leads to **ArrayDeque**, used as a FIFO queue or LIFO stack. The dashed arrow labelled by priority leads to **PriorityQueue**. It always hands out the most urgent element.',
          'If the answer is neither, you have a plain indexed sequence, so use **ArrayList**.',
          'The dashed arrow to **Shared by threads?** is a final check. Collections used by several threads need concurrent types, such as ConcurrentHashMap or a BlockingQueue.',
          'Takeaway: decide the shape of the data first and the ordering second; every path ends at a sensible default.',
        ],
        cols: 4,
        rows: 4,
        nodes: [
          { id: 'q1', label: 'Key → value?', col: 0, row: 0, tone: 'warning' },
          { id: 'q2', label: 'Unique elements?', col: 0, row: 1, tone: 'warning' },
          { id: 'q3', label: 'Take from ends or by priority?', col: 0, row: 2, tone: 'warning' },
          { id: 'list', label: 'ArrayList', detail: 'indexed sequence', col: 0, row: 3, shape: 'pill', tone: 'success' },
          { id: 'map', label: 'HashMap', detail: 'order? Linked / Tree', col: 1, row: 0, shape: 'pill', tone: 'success' },
          { id: 'set', label: 'HashSet', detail: 'order? Linked / Tree', col: 1, row: 1, shape: 'pill', tone: 'success' },
          { id: 'dq', label: 'ArrayDeque', detail: 'FIFO or LIFO', col: 1, row: 2, shape: 'pill', tone: 'success' },
          { id: 'pq', label: 'PriorityQueue', detail: 'most urgent first', col: 2, row: 2, shape: 'pill', tone: 'success' },
          { id: 'threads', label: 'Shared by threads?', detail: 'ConcurrentHashMap, BlockingQueue', col: 2, row: 0, span: 2, tone: 'danger' },
        ],
        edges: [
          { from: 'q1', to: 'map', label: 'yes' },
          { from: 'q1', to: 'q2', label: 'no' },
          { from: 'q2', to: 'set', label: 'yes' },
          { from: 'q2', to: 'q3', label: 'no' },
          { from: 'q3', to: 'dq', label: 'ends' },
          { from: 'q3', to: 'list', label: 'neither' },
          { from: 'dq', to: 'pq', label: 'by priority', dashed: true },
          { from: 'map', to: 'threads', dashed: true },
        ],
      },
    ],
    variants: [
      {
        title: 'List implementations',
        items: [
          { name: 'ArrayList', summary: 'Resizable array. get/set O(1); add at end amortised O(1) (grows ~1.5×); insert/remove in the middle O(n); contains O(n).', note: 'The default List.' },
          { name: 'LinkedList', summary: 'Doubly linked nodes. O(1) at both ends; get(i) O(n); also implements Deque.', note: 'Rarely faster than ArrayList or ArrayDeque in practice.' },
          { name: 'CopyOnWriteArrayList', summary: 'Copies the array on every write; iteration works on a snapshot and never throws ConcurrentModificationException.', note: 'For read-mostly lists shared between threads (listeners).' },
          { name: 'Vector / Stack', summary: 'Java 1.0 synchronised classes.', support: 'partial', note: 'Still present for compatibility; do not use in new code.' },
        ],
      },
      {
        title: 'Set implementations',
        items: [
          { name: 'HashSet', summary: 'Backed by a HashMap. add/contains/remove expected O(1). No defined iteration order.', code: 'Set<String> seen = new HashSet<>();' },
          { name: 'LinkedHashSet', summary: 'Hash performance plus insertion-order iteration. A SequencedSet since Java 21.', code: 'Set<String> tags = new LinkedHashSet<>(input);' },
          { name: 'TreeSet', summary: 'Red-black tree (backed by a TreeMap). O(log n); sorted; floor/ceiling/subSet range queries.', note: 'Uses compare, not equals, to detect duplicates.' },
          { name: 'EnumSet', summary: 'Bit vector over an enum\'s constants: tiny and extremely fast; iterates in declaration order.', code: 'EnumSet<Day> weekend = EnumSet.of(Day.SAT, Day.SUN);' },
        ],
      },
      {
        title: 'Queue and Deque implementations',
        items: [
          { name: 'ArrayDeque', summary: 'Circular array. Amortised O(1) at both ends. The default stack and FIFO queue; rejects null.' },
          { name: 'PriorityQueue', summary: 'Binary min-heap. offer/poll O(log n), peek O(1). Iteration is heap order, not sorted.' },
          { name: 'LinkedList', summary: 'Implements Deque; O(1) at the ends but allocates a node per element and allows null.', note: 'Prefer ArrayDeque.' },
          { name: 'BlockingQueue family', summary: 'ArrayBlockingQueue, LinkedBlockingQueue, PriorityBlockingQueue: thread-safe, with put/take that wait.', note: 'java.util.concurrent; for producer-consumer designs.' },
        ],
      },
      {
        title: 'Map implementations',
        items: [
          { name: 'HashMap', summary: 'Hash table with tree bins. get/put expected O(1); one null key allowed; no order.' },
          { name: 'LinkedHashMap', summary: 'HashMap plus a linked list through entries: insertion order, or access order for LRU caches.' },
          { name: 'TreeMap', summary: 'Red-black tree. O(log n); sorted keys; floorKey, ceilingKey, subMap, headMap, tailMap.' },
          { name: 'EnumMap', summary: 'Array indexed by enum ordinal: O(1), compact, iterates in declaration order; no null keys.' },
          { name: 'ConcurrentHashMap', summary: 'Thread-safe hash map with atomic compute/merge; weakly consistent iterators; rejects null keys and values.' },
        ],
      },
      {
        title: 'Sequenced collections (Java 21)',
        intro: 'JEP 431 retrofitted three interfaces onto the existing ordered collections.',
        items: [
          { name: 'SequencedCollection', summary: 'getFirst, getLast, addFirst, addLast, removeFirst, removeLast, reversed(). Implemented by List and Deque.', support: 'supported', code: 'list.getLast(); list.reversed();' },
          { name: 'SequencedSet', summary: 'A SequencedCollection without duplicates: LinkedHashSet, and SortedSet/NavigableSet (TreeSet).', support: 'supported', note: 'TreeSet.addFirst/addLast throw UnsupportedOperationException — the order is decided by the comparator.' },
          { name: 'SequencedMap', summary: 'firstEntry, lastEntry, pollFirstEntry, putFirst, putLast, sequencedKeySet(), reversed(). Implemented by LinkedHashMap and SortedMap.', support: 'supported', code: 'linkedMap.putFirst("pinned", value);' },
        ],
      },
    ],
    deepDive: [
      {
        title: 'Why LinkedList almost never wins',
        body: 'Each `LinkedList` element costs a separate node object holding three references (item, next, prev) plus an object header — typically 24 bytes per node with compressed references, on top of the element itself, versus about 4 bytes per slot in an `ArrayList`. Walking it chases pointers scattered across the heap, defeating CPU caches and prefetching. `ArrayList` middle inserts use one `System.arraycopy`, which modern CPUs execute as a fast bulk memory move. The javadoc of `ArrayDeque` itself says it is likely faster than `LinkedList` when used as a queue.',
        sources: [
          { label: 'ArrayDeque API documentation (Java 21)', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/ArrayDeque.html' },
          { label: 'Effective Java, 3rd edition — Item 64: Refer to objects by their interfaces' },
        ],
      },
      {
        title: 'ArrayList growth and pre-sizing',
        body: 'An `ArrayList` created with `new ArrayList<>()` starts with a shared empty array and allocates 10 slots on the first add; after that each growth is about 1.5× (`oldCapacity + (oldCapacity >> 1)`), copying the whole array. Total copying stays O(n) — hence amortised O(1) appends — but for large known sizes `new ArrayList<>(n)` avoids the intermediate garbage. For maps, `new HashMap<>(n)` is a trap: `n` is the **capacity**, not the expected size, so it may still resize at 75% load. Java 19 added `HashMap.newHashMap(expectedSize)` (and the same for `HashSet`, `LinkedHashMap`) to compute the right capacity for you.',
        sources: [
          { label: 'ArrayList API documentation (Java 21)', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/ArrayList.html' },
          { label: 'HashMap.newHashMap — HashMap API documentation (Java 21)', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/HashMap.html' },
        ],
      },
      {
        title: 'Sequenced collections: a 25-year-old gap',
        body: 'Before Java 21 the framework had no type meaning "has a first and last element". `List`, `Deque`, `SortedSet` and `LinkedHashSet` each exposed order differently, and `LinkedHashMap` offered no way to get its last entry without iterating. JEP 431 inserted `SequencedCollection`, `SequencedSet` and `SequencedMap` into the hierarchy, with `reversed()` returning a **view** rather than a copy. Adding default methods to such widely implemented interfaces was a deliberate compatibility risk: third-party classes that already had a `getFirst()` or `reversed()` with a different return type could stop compiling.',
        sources: [{ label: 'JEP 431: Sequenced Collections', url: 'https://openjdk.org/jeps/431' }],
      },
    ],
  },

  // -------------------------------------------------------------------------
  'c-hashmap': {
    textbook: {
      definition:
        '`HashMap` is an implementation of the `Map` interface based on a **hash table**. It stores key-value **mappings** in an array of **buckets**. The key\'s `hashCode()` decides its bucket. Inside a bucket, `equals` tells keys apart. If the hash function spreads keys well, `get` and `put` run in expected constant time. The map allows one `null` key and `null` values. It does not guarantee any iteration order, and it is not synchronised. It automatically **rehashes** into a larger table when the number of entries is more than its **capacity** times its **load factor**.',
      terms: [
        { term: 'Hash table', meaning: 'A data structure that stores entries in an array. It works out each entry\'s array index from a hash of its key, which gives expected O(1) lookup.' },
        { term: 'Bucket', meaning: 'One slot of the hash table. It holds every entry whose key maps to that index, as a linked list or, when crowded, as a red-black tree.' },
        { term: 'Collision', meaning: 'When two different keys map to the same bucket. The map handles it by comparing the stored hashes and then calling `equals`.' },
        { term: 'Capacity', meaning: 'The number of buckets in the table. In `HashMap` it is always a power of two, and 16 by default.' },
        { term: 'Load factor', meaning: 'The highest ratio of entries to capacity allowed. Past it, the table doubles and every entry is rehashed. It is 0.75 by default.' },
        { term: 'hashCode/equals contract', meaning: 'The rule from `java.lang.Object`: if `equals` says two objects are equal, they must return the same `hashCode`.' },
      ],
      source: 'Javadoc for java.util.HashMap and java.lang.Object.hashCode; JEP 180',
    },
    interviewDefinition:
      '`HashMap` is an array of **buckets**. To pick a bucket, it spreads a key\'s `hashCode()` (`h ^ (h >>> 16)`) and masks it with `capacity - 1`. Inside the bucket, it compares entries by hash and then by `equals`. Colliding entries form a linked list. The list becomes a red-black tree at 8 entries, once the table has at least 64 buckets. The table doubles when size exceeds capacity × load factor (0.75). Lookups are expected O(1) only if `hashCode` and `equals` are consistent and well spread. The map is unordered and not thread-safe.',
    interviewFollowUps: [
      {
        question: 'What happens if you mutate a key after putting it in a HashMap?',
        answer: 'If the change affects `hashCode`, the entry stays in the bucket for the old hash. `get` with the same object looks in the new bucket and returns null. The entry is in effect lost (a memory leak) until the key is changed back. Use immutable keys such as `String`, records or enums.',
      },
      {
        question: 'Why is the capacity always a power of two?',
        answer: 'So the bucket index can be found with a cheap bit mask, `hash & (n - 1)`, instead of a division. The downside is that only the low bits pick the bucket. That is why `HashMap` first XORs the high 16 bits into the low ones.',
      },
      {
        question: 'Why does ConcurrentHashMap reject null keys and values?',
        answer: 'In a concurrent map, `get(k) == null` could mean "absent" or "mapped to null". You cannot follow it with `containsKey` atomically, because another thread may change the map in between. Banning null removes this doubt.',
      },
      {
        question: 'HashMap vs Hashtable?',
        answer: '`Hashtable` (Java 1.0) synchronises every method, rejects nulls and has no tree bins. `HashMap` is unsynchronised and faster. For concurrency, use `ConcurrentHashMap`. It scales far better than a fully locked table.',
      },
    ],
    mnemonic: {
      device: 'Hash, Hop, Hunt — and Grow at ¾',
      expansion: [
        { key: 'Hash', meaning: 'Call key.hashCode() and spread the high bits into the low bits' },
        { key: 'Hop', meaning: 'Jump straight to bucket hash & (capacity − 1)' },
        { key: 'Hunt', meaning: 'Inside the bucket, compare stored hash, then equals (list or tree)' },
        { key: 'Grow at ¾', meaning: 'When size passes 75% of capacity, double the table and redistribute' },
      ],
      visual: 'A postman hashes the address into a street number, hops to that house, then hunts through the letterbox comparing names — and when the street is three-quarters full, the council builds a street twice as long.',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'A cloakroom with numbered hooks',
        body: 'The attendant turns your name into a hook number (hashing) and walks straight to that hook. Sometimes two guests get the same hook (a collision), so coats on a hook carry name tags and the attendant checks them (equals). When most hooks are taken, the cloakroom doubles its hooks and re-hangs every coat.',
      },
      {
        kind: 'insight',
        title: 'equals and hashCode are a single contract',
        body: 'Equal objects **must** have equal hash codes, or `get` hops to the wrong bucket and never even calls `equals`. Unequal objects *may* share a hash code — that only costs performance. A class that overrides `equals` but not `hashCode` breaks every hash-based collection silently.',
      },
      {
        kind: 'real-world',
        title: 'Counting and grouping in a log pipeline',
        body: 'Counting error codes from millions of log lines is `counts.merge(code, 1, Integer::sum)`; grouping requests per user is `byUser.computeIfAbsent(user, k -> new ArrayList<>()).add(req)`. Each is a single hash lookup per line. Pre-sizing with `HashMap.newHashMap(expected)` avoids repeated resizing during the load.',
      },
      {
        kind: 'angle',
        title: 'Iteration costs capacity, not size',
        body: 'Iterating a `HashMap` visits every bucket, so it is O(capacity + size). A map that once held a million entries and now holds ten still walks the large table (HashMap never shrinks). `LinkedHashMap` iterates its linked list instead: O(size) and in a predictable order.',
      },
    ],
    diagrams: [
      {
        id: 'c-hashmap-buckets',
        kind: 'concept',
        title: 'Buckets, collisions and a tree bin',
        caption: '"Aa" and "BB" share hash 2112, so they chain in bucket 0, and equals tells them apart. A bucket that grows to 8 entries, in a table of 64+ buckets, becomes a red-black tree.',
        explanation: [
          'The left column, grouped as **table (capacity 2^n)**, is the bucket array. Each key\'s hash, masked by capacity minus one, picks exactly one of **bucket 0**, **bucket 1**, **bucket 2** or **bucket 3**.',
          '**bucket 0** holds **"Aa" → 1**. The key **"BB" → 2** has the same hash, 2112, so it collides. It is chained after the first entry through the next link. A lookup for "BB" walks the chain and uses equals to find the right entry.',
          '**bucket 1** holds a single entry, **"apple" → 3**. This is the ideal case: one hop and one comparison. **bucket 2** is empty, which is normal. At a 0.75 load factor many buckets stay unused.',
          '**bucket 3** got crowded, so its chain was turned into a **Tree bin**, a red-black tree. Smaller keys go to the **left subtree** and larger ones to the **right subtree**. So a search costs O(log n) instead of O(n).',
          'Takeaway: good hash codes keep chains short. Tree bins are only a safety net for bad hashes or deliberate collision attacks.',
        ],
        cols: 4,
        rows: 4,
        nodes: [
          { id: 'b0', label: 'bucket 0', col: 0, row: 0, shape: 'cylinder', tone: 'primary' },
          { id: 'aa', label: '"Aa" → 1', detail: 'hash 2112', col: 1, row: 0, tone: 'neutral' },
          { id: 'bb', label: '"BB" → 2', detail: 'hash 2112: collision', col: 2, row: 0, tone: 'warning' },
          { id: 'b1', label: 'bucket 1', col: 0, row: 1, shape: 'cylinder', tone: 'primary' },
          { id: 'apple', label: '"apple" → 3', col: 1, row: 1, tone: 'neutral' },
          { id: 'b2', label: 'bucket 2', detail: 'empty', col: 0, row: 2, shape: 'cylinder', tone: 'neutral' },
          { id: 'b3', label: 'bucket 3', col: 0, row: 3, shape: 'cylinder', tone: 'primary' },
          { id: 'tree', label: 'Tree bin', detail: '≥ 8 entries: O(log n)', col: 1, row: 3, tone: 'accent' },
          { id: 'l', label: 'left subtree', col: 2, row: 2, shape: 'pill', tone: 'neutral' },
          { id: 'r', label: 'right subtree', col: 3, row: 3, shape: 'pill', tone: 'neutral' },
        ],
        edges: [
          { from: 'b0', to: 'aa' },
          { from: 'aa', to: 'bb', label: 'next' },
          { from: 'b1', to: 'apple' },
          { from: 'b3', to: 'tree' },
          { from: 'tree', to: 'l', label: 'smaller' },
          { from: 'tree', to: 'r', label: 'larger' },
        ],
        groups: [{ label: 'table (capacity 2^n)', fromCol: 0, toCol: 0, fromRow: 0, toRow: 3, tone: 'primary' }],
      },
      {
        id: 'c-hashmap-put',
        kind: 'flow',
        title: 'What put(key, value) does',
        caption: 'One hash, one hop, one hunt. Replacing an existing key does not change the size. Only a new entry can trigger a resize.',
        explanation: [
          '**hash(key)** calls the key\'s hashCode and XORs the high 16 bits into the low 16 bits. So the low bits used for indexing depend on the whole hash. A null key always hashes to 0.',
          '**index** masks the spread hash with capacity minus one. This picks a bucket in a single cheap step. Then **Bucket empty?** decides the path.',
          'If the bucket is empty, the yes arrow leads to **Store new node**. Otherwise, **Hunt in bucket** compares each entry\'s stored hash, and then uses equals, with the key.',
          'If the key is found, **Replace value** overwrites it and returns the old value. The size does not change. If it is not found, **Append to bin** adds a node. It turns the bin into a tree at 8 entries when the table has at least 64 buckets.',
          'Only new entries reach **size > threshold?** (the dashed arrow from a new node goes there too). If size now exceeds capacity times 0.75, **Resize ×2** doubles the table. It splits every bin into a low list and a high list.',
          'Takeaway: put costs one hash, one hop and one short hunt. Sometimes it also resizes, but that cost is spread (amortised) over many inserts.',
        ],
        cols: 4,
        rows: 4,
        nodes: [
          { id: 'hash', label: 'hash(key)', detail: 'h ^ (h >>> 16); null → 0', col: 0, row: 0, tone: 'primary' },
          { id: 'idx', label: 'index', detail: 'hash & (capacity − 1)', col: 1, row: 0, tone: 'primary' },
          { id: 'empty', label: 'Bucket empty?', col: 2, row: 0, tone: 'warning' },
          { id: 'newnode', label: 'Store new node', col: 3, row: 0, tone: 'success' },
          { id: 'hunt', label: 'Hunt in bucket', detail: 'same hash && equals?', col: 2, row: 1, tone: 'warning' },
          { id: 'replace', label: 'Replace value', detail: 'return old value', col: 3, row: 1, shape: 'pill', tone: 'success' },
          { id: 'append', label: 'Append to bin', detail: 'treeify at 8 if table ≥ 64', col: 2, row: 2, tone: 'accent' },
          { id: 'size', label: 'size > threshold?', detail: 'threshold = cap × 0.75', col: 3, row: 2, tone: 'warning' },
          { id: 'resize', label: 'Resize ×2', detail: 'each bin splits lo / hi', col: 3, row: 3, shape: 'pill', tone: 'danger' },
        ],
        edges: [
          { from: 'hash', to: 'idx' },
          { from: 'idx', to: 'empty' },
          { from: 'empty', to: 'newnode', label: 'yes' },
          { from: 'empty', to: 'hunt', label: 'no' },
          { from: 'hunt', to: 'replace', label: 'found' },
          { from: 'hunt', to: 'append', label: 'not found' },
          { from: 'append', to: 'size' },
          { from: 'newnode', to: 'size', dashed: true },
          { from: 'size', to: 'resize', label: 'yes' },
        ],
      },
      {
        id: 'c-hashmap-linked',
        kind: 'architecture',
        title: 'LinkedHashMap: a hash table threaded by a list',
        caption: 'Entries live in hash buckets for O(1) lookup. They are also linked from head to tail. With accessOrder = true, every get moves the entry to the tail. So the head is always the least recently used entry, the one removeEldestEntry evicts.',
        explanation: [
          'The **Bucket array** at the centre is an ordinary HashMap table. The dashed arrow labelled lookup shows that get still finds an entry such as **b → B** in O(1) by hashing.',
          'The top row, the **Doubly linked entry list**, links the same entries in order. It goes from **head (eldest)** through **b → B** and **c → C** to **a → A (tail)**. The double-headed arrows mean each entry links to both neighbours.',
          'With access order switched on, **get("a")** moves the entry for a to the tail, marking it as the most recently used.',
          'When **put("d")** adds a new entry, `removeEldestEntry` can return true. The map then drops the entry at the head, here b, the least recently used.',
          'Takeaway: hashing gives fast lookup, the linked list gives a predictable order, and together they make a simple LRU cache.',
        ],
        cols: 4,
        rows: 3,
        nodes: [
          { id: 'head', label: 'head (eldest)', detail: 'evicted first', col: 0, row: 0, shape: 'pill', tone: 'danger' },
          { id: 'e1', label: 'b → B', col: 1, row: 0, tone: 'neutral' },
          { id: 'e2', label: 'c → C', col: 2, row: 0, tone: 'neutral' },
          { id: 'tail', label: 'a → A (tail)', detail: 'most recently used', col: 3, row: 0, tone: 'success' },
          { id: 'table', label: 'Bucket array', detail: 'same hashing as HashMap', col: 1, row: 1, span: 2, shape: 'cylinder', tone: 'primary' },
          { id: 'get', label: 'get("a")', detail: 'moves a to the tail', col: 3, row: 2, shape: 'pill', tone: 'accent' },
          { id: 'put', label: 'put("d")', detail: 'removeEldestEntry → drop b', col: 0, row: 2, span: 2, shape: 'pill', tone: 'warning' },
        ],
        edges: [
          { from: 'head', to: 'e1', both: true },
          { from: 'e1', to: 'e2', both: true },
          { from: 'e2', to: 'tail', both: true },
          { from: 'table', to: 'e1', dashed: true, label: 'lookup' },
          { from: 'get', to: 'tail' },
          { from: 'put', to: 'head' },
        ],
        groups: [{ label: 'Doubly linked entry list', fromCol: 0, toCol: 3, fromRow: 0, toRow: 0, tone: 'accent' }],
      },
    ],
    variants: [
      {
        title: 'Hash-based maps in the JDK',
        items: [
          { name: 'HashMap', summary: 'General-purpose, unordered, one null key, not thread-safe.' },
          { name: 'LinkedHashMap (insertion order)', summary: 'Iterates in the order keys were first inserted; re-putting a key keeps its position.', code: 'new LinkedHashMap<>()' },
          { name: 'LinkedHashMap (access order)', summary: 'Each get/put moves the entry to the end; with removeEldestEntry it is an LRU cache.', code: 'new LinkedHashMap<>(16, 0.75f, true)' },
          { name: 'ConcurrentHashMap', summary: 'Lock-free reads, CAS for empty bins and a per-bin lock for writes (Java 8+); atomic compute/merge; no nulls.' },
          { name: 'IdentityHashMap', summary: 'Compares keys with == and System.identityHashCode, not equals. For graph traversal and serialisation.', note: 'Deliberately violates the Map contract.' },
          { name: 'WeakHashMap', summary: 'Keys are weakly referenced; an entry disappears once its key is otherwise unreachable.', note: 'Values that refer to their key keep it alive.' },
          { name: 'Hashtable', summary: 'Legacy synchronised map from Java 1.0; no nulls.', support: 'partial', note: 'Kept for compatibility only.' },
        ],
      },
      {
        title: 'Collision-resolution strategies',
        items: [
          { name: 'Separate chaining', summary: 'Each bucket holds a linked list of entries. HashMap, LinkedHashMap, ConcurrentHashMap.', support: 'supported' },
          { name: 'Tree bins (Java 8)', summary: 'A crowded chain becomes a red-black tree, bounding lookups at O(log n) — best when keys are Comparable.', support: 'supported' },
          { name: 'Open addressing (linear probing)', summary: 'Entries stored directly in the array; a collision probes the next slot.', support: 'partial', note: 'Used by IdentityHashMap and ThreadLocal\'s internal map, not by HashMap.' },
          { name: 'Cuckoo / Robin Hood hashing', summary: 'Alternative schemes with bounded probe lengths.', support: 'not-supported', note: 'Not in the JDK; available in third-party libraries.' },
        ],
      },
    ],
    deepDive: [
      {
        title: 'Tree bins, Comparable keys and hash flooding (JEP 180)',
        body: 'Java 8 added tree bins so that a bucket full of colliding keys costs O(log n) instead of O(n). The tree is ordered by hash first; for equal hashes it uses `compareTo` if the keys are mutually `Comparable`, otherwise it falls back to a tie-break (class name, identity hash) that cannot guide a lookup — so a search may have to explore both subtrees. That is why a constant `hashCode` on a non-Comparable key still performs badly. The motivation was denial-of-service attacks that post thousands of form fields with colliding names such as combinations of "Aa" and "BB".',
        sources: [
          { label: 'JEP 180: Handle Frequent HashMap Collisions with Balanced Trees', url: 'https://openjdk.org/jeps/180' },
          { label: 'HashMap API documentation (Java 21)', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/HashMap.html' },
        ],
      },
      {
        title: 'The resize split trick — and the old infinite loop',
        body: 'When the table doubles from n to 2n, an entry\'s new index depends on one extra bit of its hash: it either stays at index i or moves to i + n. Java 8 splits each chain into a "lo" and a "hi" list in one pass, preserving their order. Java 7 instead re-inserted entries at the head of each new chain, reversing them; two threads resizing concurrently could create a cycle, after which `get` spun forever at 100% CPU — a classic production incident. Java 8 removed that failure mode, but concurrent writes can still lose entries: the fix is `ConcurrentHashMap`, not luck.',
        sources: [{ label: 'Java Concurrency in Practice (Goetz et al.) — chapter 5, Building Blocks: concurrent collections' }],
      },
      {
        title: 'Why the default load factor is 0.75',
        body: 'The load factor trades memory for chain length. At 0.75 and with well-distributed hashes, the number of entries per bucket follows roughly a Poisson distribution with mean about 0.5, so a bucket with 8 entries is vanishingly rare (the source comments put it below one in ten million). That is why the treeify threshold of 8 essentially only fires for bad hash functions or attacks. Raising the load factor saves memory but lengthens chains; lowering it wastes memory and makes iteration slower.',
        sources: [{ label: 'HashMap API documentation — "Implementation notes" and load factor', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/HashMap.html' }],
      },
    ],
  },

  // -------------------------------------------------------------------------
  'c-sorted': {
    textbook: {
      definition:
        'An **ordering** in Java is a rule that puts objects of a type into a **total order**. The class itself defines its **natural ordering** by implementing `Comparable<T>` and its `compareTo` method. Any number of other orderings are defined outside the class by `Comparator<T>` objects. Both return a negative integer, zero or a positive integer when the first argument is less than, equal to or greater than the second. Both must be antisymmetric and transitive. **Sorted collections** such as `TreeSet` and `TreeMap` keep their elements in this order. They use the comparison result, not `equals`, to decide whether two elements are the same.',
      terms: [
        { term: 'Total order', meaning: 'An ordering where every pair of elements can be compared, and the relation is antisymmetric and transitive. So every element has one clear position.' },
        { term: 'Natural ordering', meaning: 'The one ordering a class defines for its own instances by implementing `Comparable.compareTo`. `String`, `Integer` and `LocalDate` do this.' },
        { term: 'Comparator', meaning: 'A functional interface whose `compare(a, b)` method defines an ordering outside the compared class. You can combine and reverse comparators.' },
        { term: 'Consistent with equals', meaning: 'A property of an ordering: `compare(a, b) == 0` is true exactly when `a.equals(b)` is true. Sorted sets and maps need it to obey the `Set` and `Map` contracts.' },
        { term: 'Stable sort', meaning: 'A sort that keeps elements that compare as equal in their original order. Java guarantees this for sorts of objects.' },
      ],
      source: 'Javadoc for java.lang.Comparable, java.util.Comparator and java.util.TreeMap',
    },
    interviewDefinition:
      'Java keeps a type\'s **natural ordering** apart from its external orderings. The natural ordering is `Comparable.compareTo`, implemented by the class itself. External orderings are any number of `Comparator` objects. They combine with `comparing`, `thenComparing`, `reversed` and `nullsFirst`. Object sorts (`List.sort`, `Arrays.sort` on objects) use TimSort, which is stable and O(n log n). `TreeSet` and `TreeMap` keep elements sorted in a red-black tree. They treat `compare == 0` as **equality**, so comparators must be consistent with equals. Their `Navigable` API answers floor, ceiling and range queries in O(log n).',
    interviewFollowUps: [
      {
        question: 'Comparable or Comparator?',
        answer: 'Implement `Comparable` when the type has one obvious order (dates, version numbers, money in one currency). Use `Comparator`s for orders that depend on the situation (by price, by name, by department then salary). Also use them for types you do not own.',
      },
      {
        question: 'Why did my TreeSet lose elements?',
        answer: 'Its comparator returned 0 for different elements, for example by comparing only by score. A tree set treats `compare == 0` as a duplicate and ignores the add. Add tie-breakers until 0 means "truly equal".',
      },
      {
        question: 'Is sorting stable in Java?',
        answer: 'Object sorts are guaranteed stable: `List.sort`, `Collections.sort`, `Arrays.sort(Object[])`, and `Stream.sorted` on ordered streams. Primitive `Arrays.sort` uses dual-pivot quicksort and is not stable. That does not matter, because equal primitives cannot be told apart.',
      },
      {
        question: 'What does "Comparison method violates its general contract!" mean?',
        answer: 'TimSort found that your comparator is not a valid total order, and threw `IllegalArgumentException`. Usually the comparator is not transitive, gives different answers between calls, or breaks from subtraction overflow. Fix the comparator; do not catch the exception.',
      },
    ],
    mnemonic: {
      device: 'Minus moves left, Zero is the same, Plus pushes right',
      expansion: [
        { key: 'Minus', meaning: 'compare(a, b) < 0: a goes before b' },
        { key: 'Zero', meaning: 'compare(a, b) == 0: same position — and a duplicate in TreeSet/TreeMap' },
        { key: 'Plus', meaning: 'compare(a, b) > 0: a goes after b' },
        { key: 'Built-in vs plug-in', meaning: 'Comparable is built into the class (one natural order); Comparator is plugged in (many orders)' },
      ],
      visual: 'Picture a number line: a negative result slides a to the left of b, a positive one pushes it to the right, and zero stacks them on the same spot — where a tree set keeps only one.',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'The alphabet vs the librarian\'s choice',
        body: 'Books have a natural order printed on them — the title, alphabetically (Comparable). But a librarian can arrange the same shelf by author, by year, or by colour for a display (Comparators). The books do not change; only the rule held by the librarian does.',
      },
      {
        kind: 'insight',
        title: 'Stability enables multi-pass sorting',
        body: 'Because object sorting is stable, sorting by the secondary key first and then by the primary key yields "primary, then secondary" order. Comparator chains are usually clearer, but stability also explains why sorting a table by clicking column headers in sequence behaves intuitively.',
      },
      {
        kind: 'real-world',
        title: 'Tiered pricing with floorEntry',
        body: 'Shipping bands, tax brackets, loyalty tiers and SLA levels are all "which band does this value fall into?". A `TreeMap<Integer, Rate>` keyed by each band\'s lower bound answers it with `floorEntry(value)` in O(log n), and adding a band is one `put` — no chain of if/else to edit.',
      },
      {
        kind: 'angle',
        title: 'Comparators are just composed functions',
        body: '`Comparator.comparing(Employee::dept)` takes a key-extractor `Function` and returns a new function `(a, b) -> ...`. `thenComparing` wraps it again. This is the functional style of module 7 applied to ordering: small pieces composed into a precise rule.',
      },
    ],
    diagrams: [
      {
        id: 'c-sorted-navigable',
        kind: 'concept',
        title: 'Navigable queries on a sorted key line',
        caption: 'For a lookup value of 9,999 grams, floor finds the greatest key ≤ it (2,000 → medium). Ceiling finds the least key ≥ it (10,000 → large). headMap(10_000, false) is a live view of everything to the left.',
        explanation: [
          'The top row, **TreeMap keys (ascending)**, shows four shipping bands keyed by their lower bound: **0 → small**, **2000 → medium**, **10000 → large** and **30000 → freight**.',
          'The pill **lookup 9999** is a parcel weight that falls between two keys. So a plain get would find nothing.',
          'The arrow labelled floorEntry returns the greatest key not above 9999. That is **2000 → medium**, the correct band. The arrow labelled ceilingEntry returns the least key not below it, **10000 → large**.',
          '**headMap(10000, false)** is a live view of every key strictly below 10000, while **tailMap(10000, true)** is a view of every key from 10000 upwards. Changes to the map show up in these views.',
          'Takeaway: a sorted map answers "which range does this value fall into?" in O(log n) without any if/else chain.',
        ],
        cols: 4,
        rows: 3,
        nodes: [
          { id: 'k0', label: '0 → small', col: 0, row: 0, tone: 'neutral' },
          { id: 'k1', label: '2000 → medium', col: 1, row: 0, tone: 'success' },
          { id: 'k2', label: '10000 → large', col: 2, row: 0, tone: 'accent' },
          { id: 'k3', label: '30000 → freight', col: 3, row: 0, tone: 'neutral' },
          { id: 'q', label: 'lookup 9999', detail: 'between two keys', col: 1, row: 1, span: 2, shape: 'pill', tone: 'warning' },
          { id: 'head', label: 'headMap(10000, false)', detail: '{0, 2000} — a live view', col: 0, row: 2, span: 2, tone: 'primary' },
          { id: 'tail', label: 'tailMap(10000, true)', detail: '{10000, 30000}', col: 2, row: 2, span: 2, tone: 'primary' },
        ],
        edges: [
          { from: 'k0', to: 'k1' },
          { from: 'k1', to: 'k2' },
          { from: 'k2', to: 'k3' },
          { from: 'q', to: 'k1', label: 'floorEntry' },
          { from: 'q', to: 'k2', label: 'ceilingEntry' },
        ],
        groups: [{ label: 'TreeMap keys (ascending)', fromCol: 0, toCol: 3, fromRow: 0, toRow: 0, tone: 'accent' }],
      },
      {
        id: 'c-sorted-chain',
        kind: 'flow',
        title: 'How a comparator chain decides',
        caption: 'Each thenComparing is used only when everything before it returned 0. Passing reverseOrder() to one step reverses only that key. Calling reversed() at the end would reverse the whole chain.',
        explanation: [
          'Every comparison starts at **compare(a, b)** and goes first to **dept ascending**, the comparator built with `comparing(dept)`.',
          'If the departments differ (the arrow labelled ≠ 0), the first **return result** pill returns that result at once. The later keys are never checked.',
          'Only on a tie (the arrow labelled 0 (tie)) does **salary descending** run. It was given `reverseOrder()`, so a higher salary sorts first, and a non-zero answer is returned.',
          'On a second tie, **name ascending** decides. The chain can only return 0 if the names are equal too. That is exactly what a TreeSet needs so it does not drop different employees.',
          'Takeaway: each `thenComparing` is a tie-breaker. It is used only when everything before it returned 0.',
        ],
        cols: 4,
        rows: 3,
        nodes: [
          { id: 'start', label: 'compare(a, b)', col: 0, row: 0, shape: 'pill', tone: 'primary' },
          { id: 'dept', label: 'dept ascending', detail: 'comparing(dept)', col: 1, row: 0, tone: 'warning' },
          { id: 'sal', label: 'salary descending', detail: 'thenComparing(…, reverseOrder())', col: 2, row: 0, tone: 'warning' },
          { id: 'name', label: 'name ascending', detail: 'thenComparing(name)', col: 3, row: 0, tone: 'warning' },
          { id: 'r1', label: 'return result', detail: 'departments differ', col: 1, row: 1, shape: 'pill', tone: 'success' },
          { id: 'r2', label: 'return result', detail: 'salaries differ', col: 2, row: 1, shape: 'pill', tone: 'success' },
          { id: 'r3', label: 'return result', detail: '0 only if names equal too', col: 3, row: 1, shape: 'pill', tone: 'success' },
        ],
        edges: [
          { from: 'start', to: 'dept' },
          { from: 'dept', to: 'sal', label: '0 (tie)' },
          { from: 'sal', to: 'name', label: '0 (tie)' },
          { from: 'dept', to: 'r1', label: '≠ 0' },
          { from: 'sal', to: 'r2', label: '≠ 0' },
          { from: 'name', to: 'r3' },
        ],
      },
      {
        id: 'c-sorted-tree',
        kind: 'architecture',
        title: 'Inside TreeSet and TreeMap',
        caption: 'A TreeSet is a TreeMap whose values are a dummy object. Both store entries in a self-balancing red-black tree (every root-to-leaf path has the same number of black nodes). They route every insert and lookup with compare. equals is never called.',
        explanation: [
          'A **TreeSet<E>** has no tree of its own. The arrow labelled delegates shows that it stores each element as a key in a **TreeMap<E, PRESENT>**, with a dummy value.',
          'The map asks the **Comparator**, or the natural order if none was given, to compare keys. The compare() arrow shows this is the only equality test it uses.',
          'Entries form a red-black tree under **root: 50**. Keys less than 50 go left to **20**, and keys greater go right to **80**. Below 20 sit **10** and **30**.',
          'The red nodes 10 and 30 and the black ones follow colour rules. These rules give every root-to-leaf path the same number of black nodes, so the tree stays balanced.',
          'Takeaway: balance keeps the height at O(log n). So every insert, lookup and range query costs O(log n) comparisons.',
        ],
        cols: 3,
        rows: 4,
        nodes: [
          { id: 'set', label: 'TreeSet<E>', detail: 'NavigableSet', col: 0, row: 0, tone: 'primary' },
          { id: 'map', label: 'TreeMap<E, PRESENT>', detail: 'NavigableMap', col: 1, row: 0, tone: 'primary' },
          { id: 'cmp', label: 'Comparator', detail: 'or natural order', col: 2, row: 0, shape: 'note', tone: 'accent' },
          { id: 'root', label: 'root: 50', detail: 'black', col: 1, row: 1, tone: 'neutral' },
          { id: 'l', label: '20', detail: 'black', col: 0, row: 2, tone: 'neutral' },
          { id: 'r', label: '80', detail: 'black', col: 2, row: 2, tone: 'neutral' },
          { id: 'll', label: '10', detail: 'red', col: 0, row: 3, tone: 'danger' },
          { id: 'lr', label: '30', detail: 'red', col: 1, row: 3, tone: 'danger' },
        ],
        edges: [
          { from: 'set', to: 'map', label: 'delegates' },
          { from: 'map', to: 'cmp', label: 'compare()' },
          { from: 'map', to: 'root' },
          { from: 'root', to: 'l', label: '< 50' },
          { from: 'root', to: 'r', label: '> 50' },
          { from: 'l', to: 'll' },
          { from: 'l', to: 'lr' },
        ],
      },
    ],
    variants: [
      {
        title: 'Ways to sort',
        items: [
          { name: 'List.sort(comparator)', summary: 'In-place, stable TimSort. Collections.sort(list) delegates to it.', code: 'orders.sort(Comparator.comparing(Order::total));' },
          { name: 'Arrays.sort(Object[])', summary: 'Stable TimSort for object arrays.', code: 'Arrays.sort(names, String.CASE_INSENSITIVE_ORDER);' },
          { name: 'Arrays.sort(int[])', summary: 'Dual-pivot quicksort for primitive arrays; not stable (it does not need to be).' },
          { name: 'Arrays.parallelSort', summary: 'Splits large arrays across the common ForkJoinPool; worth it only for big arrays.' },
          { name: 'stream.sorted()', summary: 'Stateful intermediate operation: buffers all elements, then emits them sorted (stable for ordered streams).', code: 'list.stream().sorted(cmp).toList()' },
          { name: 'TreeSet / TreeMap', summary: 'Keep data sorted continuously; O(log n) per insert instead of re-sorting.' },
          { name: 'PriorityQueue', summary: 'Partial order only: guarantees just the smallest element at the head.', support: 'partial', note: 'Poll repeatedly to get sorted output.' },
        ],
      },
      {
        title: 'Comparator building blocks',
        items: [
          { name: 'comparing / comparingInt / comparingLong / comparingDouble', summary: 'Build a comparator from a key extractor; the primitive forms avoid boxing.', code: 'Comparator.comparingInt(String::length)' },
          { name: 'thenComparing', summary: 'Tie-breaker consulted only when the previous comparator returns 0; accepts a key comparator.', code: '.thenComparing(Emp::salary, Comparator.reverseOrder())' },
          { name: 'reversed()', summary: 'Reverses the entire comparator built so far.' },
          { name: 'naturalOrder / reverseOrder', summary: 'Comparable order and its reverse, as Comparator objects.' },
          { name: 'nullsFirst / nullsLast', summary: 'Wrap a comparator so null elements sort to one end instead of throwing NullPointerException.', code: 'Comparator.nullsLast(Comparator.naturalOrder())' },
        ],
      },
      {
        title: 'Navigable query methods',
        items: [
          { name: 'floor / ceiling', summary: 'Greatest element ≤ x / least element ≥ x (floorKey, ceilingEntry, …).' },
          { name: 'lower / higher', summary: 'Strictly less than / strictly greater than x.' },
          { name: 'headMap / tailMap / subMap', summary: 'Live range views with inclusive/exclusive bounds; writes outside the range throw.' },
          { name: 'first / last / pollFirst / pollLast', summary: 'Ends of the order; poll variants also remove.' },
          { name: 'descendingMap / descendingSet', summary: 'A reverse-ordered view (Java 21 also offers reversed()).' },
        ],
      },
    ],
    deepDive: [
      {
        title: 'TimSort and the "general contract" exception',
        body: 'Since Java 7, object sorting uses TimSort, a hybrid merge sort that finds existing ordered runs and merges them — O(n) for already sorted input, O(n log n) worst case, always stable. Because it relies on comparator transitivity, an invalid comparator (subtraction overflow, random results, inconsistent handling of null or NaN) can make it throw `IllegalArgumentException: Comparison method violates its general contract!` — only for certain inputs, which makes the bug look random. The legacy merge sort can be restored with `-Djava.util.Arrays.useLegacyMergeSort=true`, which only hides the broken comparator.',
        sources: [
          { label: 'Arrays.sort API documentation (Java 21)', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Arrays.html' },
          { label: 'Comparator API documentation — the general contract', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Comparator.html' },
        ],
      },
      {
        title: 'Consistent with equals: the BigDecimal trap',
        body: '`new BigDecimal("1.0").equals(new BigDecimal("1.00"))` is **false** (different scale) but `compareTo` returns **0**. Add both to a `HashSet` and you get 2 elements; add both to a `TreeSet` and you get 1. The `Comparable` javadoc calls such orderings "inconsistent with equals" and warns that sorted sets and maps then violate the general `Set`/`Map` contracts, which are defined in terms of equals. Normalise with `stripTrailingZeros()` or choose one collection deliberately.',
        sources: [
          { label: 'Comparable API documentation (Java 21)', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Comparable.html' },
          { label: 'Effective Java, 3rd edition — Item 14: Consider implementing Comparable' },
        ],
      },
      {
        title: 'Why a red-black tree',
        body: '`TreeMap` is a red-black tree — the javadoc notes its algorithms are adapted from Cormen, Leiserson and Rivest\'s *Introduction to Algorithms*. Colour rules keep the longest root-to-leaf path at most twice the shortest, so height stays O(log n) and `get`, `put` and `remove` are guaranteed O(log n) even for adversarial insertion orders. Compared with a hash map, every lookup does about log₂(n) comparisons (20 for a million keys) and touches scattered nodes, so a TreeMap is only worth it when you use its ordering.',
        sources: [{ label: 'TreeMap API documentation (Java 21)', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/TreeMap.html' }],
      },
    ],
  },

  // -------------------------------------------------------------------------
  'c-iteration': {
    textbook: {
      definition:
        '**Iteration** means visiting the elements of a collection one after another. Java models it with the `Iterator<E>` interface. Its `hasNext`, `next` and optional `remove` methods let a client visit each element exactly once, without knowing how the collection is built inside. Any type that implements `Iterable<T>` can be used in the **enhanced for statement**. The compiler turns that statement into an iterator loop. Iterators of the general-purpose `java.util` collections are **fail-fast**. On a best-effort basis, they throw `ConcurrentModificationException` if the collection is structurally changed other than through the iterator itself.',
      terms: [
        { term: 'Iterator', meaning: 'An object that gives you the elements of a collection one at a time through `hasNext()` and `next()`. It may support `remove()` of the last element returned.' },
        { term: 'Iterable', meaning: 'An interface with a single method, `iterator()`. A type that implements it can be used in an enhanced for statement.' },
        { term: 'Structural modification', meaning: 'Any operation that adds or removes elements, or otherwise changes a collection\'s size or shape. Just setting an element\'s value is not structural.' },
        { term: 'Fail-fast iterator', meaning: 'An iterator that detects concurrent structural changes by comparing a modification counter. It throws `ConcurrentModificationException` instead of risking undefined behaviour.' },
        { term: 'View', meaning: 'A collection with no storage of its own. It reads from a backing collection or map, and may also write to it.' },
      ],
      source: 'JLS §14.14.2; Javadoc for java.util.Iterator and java.util.ConcurrentModificationException',
    },
    interviewDefinition:
      'Every `Collection` is iterated through an `Iterator`; the enhanced for loop is compiled to one. Iterators of the standard non-concurrent collections are **fail-fast**. In `next()`, they compare the collection\'s `modCount` with a saved copy. On a structural change they throw `ConcurrentModificationException`, on a best-effort basis. Remove safely with `Iterator.remove` or `removeIf`. Know the difference between three things. **Views** (`subList`, `keySet`, `unmodifiableList`) are live. **Unmodifiable wrappers** are read-only views. **Immutable** collections (`List.of`, `List.copyOf`) are frozen and reject nulls.',
    interviewFollowUps: [
      {
        question: 'Does ConcurrentModificationException mean there is a threading problem?',
        answer: 'Usually not. Most often, a single thread changes a collection inside its own for-each loop. Detection is best-effort and not guaranteed. So never rely on it for correctness. It is not a thread-safety mechanism.',
      },
      {
        question: 'unmodifiableList vs List.copyOf?',
        answer: '`Collections.unmodifiableList(list)` is a read-only **view**. Callers cannot change it, but changes to the backing list show through. `List.copyOf(list)` is an independent immutable **snapshot**. (It returns the same instance if the argument is already an immutable list.) Both throw `UnsupportedOperationException` on any change.',
      },
      {
        question: 'How do concurrent collections iterate?',
        answer: '`ConcurrentHashMap` and `ConcurrentLinkedQueue` iterators are **weakly consistent**. They never throw CME, and they may or may not show concurrent updates. `CopyOnWriteArrayList` iterators work on a **snapshot** of the array, taken when the iterator was created.',
      },
    ],
    mnemonic: {
      device: 'Live, Locked, Frozen',
      expansion: [
        { key: 'Live', meaning: 'A view (subList, keySet, Arrays.asList): changes flow both ways' },
        { key: 'Locked', meaning: 'An unmodifiable wrapper: you cannot change it, but you still see the owner\'s changes' },
        { key: 'Frozen', meaning: 'An immutable copy (List.of, List.copyOf, Stream.toList): nobody can change it, ever' },
      ],
      visual: 'An open window onto a room (live), the same window behind locked glass (locked), and a photograph of the room (frozen).',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'Counting people while they move',
        body: 'Counting people in a queue while others join and leave gives a wrong number. A fail-fast iterator is a supervisor who shouts "stop, the line changed!" (ConcurrentModificationException) instead of letting you report a silently wrong count. `Iterator.remove` is the supervisor\'s own approved way to take someone out of the line.',
      },
      {
        kind: 'insight',
        title: 'The second-to-last quirk',
        body: 'The check happens in `next()`, not `hasNext()`. Remove the second-to-last element inside a for-each loop and the size shrinks to equal the cursor, so `hasNext()` returns false and the loop ends quietly — no exception, and the last element is never visited. That is why such bugs pass small tests and crash in production.',
      },
      {
        kind: 'real-world',
        title: 'Getters that leak internal state',
        body: 'Returning an internal `ArrayList` from a getter lets any caller add or clear items behind the object\'s back. Returning `List.copyOf(items)` gives a safe snapshot; `Collections.unmodifiableList(items)` gives a cheap live view when callers should see later changes. Records and value objects typically copy in the constructor and return the immutable list directly.',
      },
      {
        kind: 'angle',
        title: 'Internal vs external iteration',
        body: 'With a for-each loop or `Iterator`, *your* code drives the loop (external iteration). With `forEach`, `removeIf` or streams, the *collection* drives it (internal iteration) and can optimise: `ArrayList.removeIf` compacts the array in one pass instead of shifting elements on every removal.',
      },
    ],
    diagrams: [
      {
        id: 'c-iteration-foreach',
        kind: 'flow',
        title: 'What a for-each loop really does',
        caption: 'The compiler turns for (T x : coll) into an Iterator loop. The modCount check is in next(). That is why removing the second-to-last element ends the loop silently instead of throwing.',
        explanation: [
          'The loop starts by calling **coll.iterator()**. This saves the collection\'s current modCount as the iterator\'s expected value.',
          'Each round asks **hasNext()?**, which only checks whether the cursor has reached the size. If it returns false, the loop takes the false arrow and **loop ends** normally.',
          'If true, **next()** first checks whether modCount has changed. If not, the element goes to the **loop body** as x.',
          'The dashed arrow to **list.remove(x) in body** is the classic bug. Removing through the list, not the iterator, increases modCount behind the iterator\'s back.',
          'On the next call, next() sees the changed count and throws **ConcurrentModification Exception**. The check is in next(), not hasNext(). So removing the second-to-last element can end the loop silently instead.',
          'Takeaway: modify a collection during iteration only through `Iterator.remove` or use `removeIf`.',
        ],
        cols: 4,
        rows: 3,
        nodes: [
          { id: 'it', label: 'coll.iterator()', detail: 'expectedModCount = modCount', col: 0, row: 0, tone: 'primary' },
          { id: 'has', label: 'hasNext()?', detail: 'cursor != size', col: 1, row: 0, tone: 'warning' },
          { id: 'next', label: 'next()', detail: 'modCount changed?', col: 2, row: 0, tone: 'warning' },
          { id: 'body', label: 'loop body', detail: 'x = element', col: 3, row: 0, tone: 'primary' },
          { id: 'done', label: 'loop ends', col: 1, row: 1, shape: 'pill', tone: 'success' },
          { id: 'cme', label: 'ConcurrentModification Exception', col: 2, row: 1, shape: 'pill', tone: 'danger' },
          { id: 'mod', label: 'list.remove(x) in body', detail: 'modCount++ (the bug)', col: 3, row: 1, tone: 'danger' },
        ],
        edges: [
          { from: 'it', to: 'has' },
          { from: 'has', to: 'next', label: 'true' },
          { from: 'has', to: 'done', label: 'false' },
          { from: 'next', to: 'body', label: 'unchanged' },
          { from: 'next', to: 'cme', label: 'changed' },
          { from: 'body', to: 'mod', dashed: true },
        ],
      },
      {
        id: 'c-iteration-views',
        kind: 'concept',
        title: 'View, unmodifiable wrapper, immutable copy',
        caption: 'After backing.add("c"), the view and the unmodifiable wrapper both show c, because they read the same list. The copy was frozen when it was made.',
        explanation: [
          'At the top is the **backing ArrayList**. It starts as [a, b], and then c is added. The three boxes below are made from it in different ways.',
          '**subList(0, 2)** is a live view. The two-way arrow labelled shared means writes through it change the backing list. If the parent list itself is structurally changed, using the sublist afterwards throws ConcurrentModificationException. The note **Parent add → sublist CME** warns about this.',
          '**unmodifiableList** reads through to the same list, so it shows [a, b, c] after the add. Its note, **add() throws UOE**, means callers cannot change it. But they still see the owner\'s changes.',
          '**List.copyOf** was copied once, as the dashed arrow says, so it stays a frozen [a, b]. It also rejects adds with UnsupportedOperationException, and it rejects nulls.',
          'Takeaway: a view is a live window, an unmodifiable wrapper is a locked window, and an immutable copy is a photograph.',
        ],
        cols: 3,
        rows: 3,
        nodes: [
          { id: 'backing', label: 'backing ArrayList', detail: '[a, b] then add("c")', col: 1, row: 0, shape: 'cylinder', tone: 'primary' },
          { id: 'sub', label: 'subList(0, 2)', detail: 'live view; writes through', col: 0, row: 1, tone: 'accent' },
          { id: 'unmod', label: 'unmodifiableList', detail: 'live, read-only: [a, b, c]', col: 1, row: 1, tone: 'warning' },
          { id: 'copy', label: 'List.copyOf', detail: 'frozen snapshot: [a, b]', col: 2, row: 1, tone: 'success' },
          { id: 'subNote', label: 'Parent add → sublist CME', col: 0, row: 2, shape: 'note', tone: 'danger' },
          { id: 'unmodNote', label: 'add() throws UOE', detail: 'reads see changes', col: 1, row: 2, shape: 'note', tone: 'neutral' },
          { id: 'copyNote', label: 'add() throws UOE', detail: 'nulls rejected', col: 2, row: 2, shape: 'note', tone: 'neutral' },
        ],
        edges: [
          { from: 'backing', to: 'sub', both: true, label: 'shared' },
          { from: 'backing', to: 'unmod', label: 'read through' },
          { from: 'backing', to: 'copy', dashed: true, label: 'copied once' },
          { from: 'sub', to: 'subNote', dashed: true },
          { from: 'unmod', to: 'unmodNote', dashed: true },
          { from: 'copy', to: 'copyNote', dashed: true },
        ],
      },
      {
        id: 'c-iteration-map-views',
        kind: 'architecture',
        title: 'A Map\'s three collection views',
        caption: 'keySet, values and entrySet are views backed by the map, not copies. Removing through them removes the mapping, and entry.setValue writes into the map. None of them supports add.',
        explanation: [
          'The **Map<K, V>** at the top is the only real storage. The three boxes below hold no data of their own.',
          '**keySet()** presents the keys as a Set. Removing a key from it, for example with removeIf, removes the whole mapping from the map.',
          '**values()** shows the values as a Collection, which may contain duplicates. `removeIf(v -> …)` on it also removes the matching mappings.',
          '**entrySet()** shows each key-value pair as an entry. Iterating it is the efficient way to read both. `entry.setValue` writes straight into the map.',
          'The two-way arrows show that changes flow in both directions. Takeaway: views are cheap windows onto the map, and none of them supports add.',
        ],
        cols: 3,
        rows: 2,
        nodes: [
          { id: 'map', label: 'Map<K, V>', detail: 'the only real storage', col: 1, row: 0, shape: 'cylinder', tone: 'primary' },
          { id: 'keys', label: 'keySet()', detail: 'removeIf drops mappings', col: 0, row: 1, tone: 'accent' },
          { id: 'vals', label: 'values()', detail: 'removeIf(v -> …) works', col: 1, row: 1, tone: 'accent' },
          { id: 'entries', label: 'entrySet()', detail: 'entry.setValue writes', col: 2, row: 1, tone: 'accent' },
        ],
        edges: [
          { from: 'map', to: 'keys', both: true },
          { from: 'map', to: 'vals', both: true },
          { from: 'map', to: 'entries', both: true },
        ],
      },
    ],
    variants: [
      {
        title: 'Iteration styles',
        items: [
          { name: 'Enhanced for (for-each)', summary: 'Reads best; compiled to an Iterator for collections and an index loop for arrays. Cannot remove or see the index.', code: 'for (String s : names) { … }' },
          { name: 'Explicit Iterator', summary: 'Needed to remove while iterating (it.remove()).', code: 'for (var it = list.iterator(); it.hasNext();) if (bad(it.next())) it.remove();' },
          { name: 'ListIterator', summary: 'Bidirectional for lists: previous(), nextIndex(), set() and add() during iteration.', code: 'var li = list.listIterator(); while (li.hasNext()) li.set(li.next().trim());' },
          { name: 'Indexed for loop', summary: 'Fine for ArrayList (O(1) get); O(n²) on LinkedList.' },
          { name: 'Iterable.forEach / Map.forEach', summary: 'Internal iteration with a lambda; no break, and checked exceptions are awkward.', code: 'map.forEach((k, v) -> System.out.println(k + "=" + v));' },
          { name: 'removeIf / replaceAll', summary: 'Bulk in-place modification without iterator boilerplate.', code: 'users.removeIf(User::isInactive);' },
          { name: 'Streams', summary: 'Declarative transformation into a new result; never modify the source inside the pipeline.' },
          { name: 'Enumeration', summary: 'Pre-Java-2 iteration for Vector and Hashtable.', support: 'partial', note: 'Legacy; Enumeration.asIterator() exists since Java 9.' },
        ],
      },
      {
        title: 'Read-only collection kinds',
        items: [
          { name: 'Collections.unmodifiableList/Set/Map', summary: 'Read-only view over a mutable collection; sees later changes; allows nulls if the backing collection does.' },
          { name: 'List.of / Set.of / Map.of (Java 9)', summary: 'Immutable, null-hostile; Set.of/Map.of reject duplicates and randomise iteration order per JVM run.' },
          { name: 'List.copyOf / Set.copyOf / Map.copyOf (Java 10)', summary: 'Immutable snapshot of an existing collection; null-hostile.' },
          { name: 'Stream.toList() (Java 16)', summary: 'Unmodifiable list that, unlike List.of, allows null elements.' },
          { name: 'Collectors.toUnmodifiableList/Set/Map (Java 10)', summary: 'Immutable results from collect; null-hostile.' },
          { name: 'Arrays.asList', summary: 'Fixed-size view of an array: set works and writes through, add/remove throw.', support: 'partial' },
        ],
      },
      {
        title: 'Iterator consistency guarantees',
        items: [
          { name: 'Fail-fast', summary: 'ArrayList, HashMap, TreeMap…: throw ConcurrentModificationException on detected structural change (best effort).' },
          { name: 'Weakly consistent', summary: 'ConcurrentHashMap, ConcurrentLinkedQueue: never throw; may reflect some concurrent updates; each element at most once.' },
          { name: 'Snapshot', summary: 'CopyOnWriteArrayList/Set: iterate the array as it was when the iterator was created; iterator.remove is unsupported.' },
        ],
      },
    ],
    deepDive: [
      {
        title: 'The enhanced for statement is defined by translation',
        body: 'JLS §14.14.2 specifies `for (T x : expr)` as an explicit translation: for an `Iterable` it calls `iterator()` once and loops on `hasNext()`/`next()`; for an array it uses a hidden index variable and the array\'s length. That is why for-each over an array never throws CME, why a `null` collection throws `NullPointerException` at the loop header, and why you can make your own types loopable simply by implementing `Iterable<T>`.',
        sources: [{ label: 'JLS §14.14.2: The enhanced for statement', url: 'https://docs.oracle.com/javase/specs/jls/se21/html/jls-14.html#jls-14.14.2' }],
      },
      {
        title: 'Immutable collections are deliberately strict',
        body: 'The Java 9 factories (JEP 269) return compact, specialised classes — a dedicated class for one or two elements and an array-backed class otherwise — so they use less memory than a wrapped `ArrayList`. They reject `null` so that `contains(null)` and `get` never need an ambiguous answer, reject duplicate set elements and map keys at creation time, and `Set.of`/`Map.of` use a per-JVM random salt for iteration order so that code cannot accidentally depend on it. They are value-based: do not synchronise on them or rely on identity.',
        sources: [
          { label: 'JEP 269: Convenience Factory Methods for Collections', url: 'https://openjdk.org/jeps/269' },
          { label: 'List API documentation — Unmodifiable Lists (Java 21)', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/List.html' },
        ],
      },
      {
        title: 'The cost of copy-on-write',
        body: '`CopyOnWriteArrayList` makes iteration completely safe under concurrency by copying the entire array on every `add`, `set` or `remove`. Iteration is lock-free and never throws, but each write is O(n) and allocates a new array. It is ideal for listener lists (rare writes, frequent iteration) and terrible for a list that is written in a loop. The same trade-off — readers see a consistent snapshot, writers pay — appears in persistent data structures and in database MVCC.',
        sources: [
          { label: 'CopyOnWriteArrayList API documentation (Java 21)', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/CopyOnWriteArrayList.html' },
          { label: 'Java Concurrency in Practice — §5.2.3 CopyOnWriteArrayList' },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  'c-queues-stacks': {
    textbook: {
      definition:
        'A **queue** is a linear collection that holds elements before they are processed. Elements are removed from its **head**. A **FIFO** queue removes them in the order they were added at the **tail**. A **stack** is a linear collection that follows **LIFO** order: you add and remove at the same end. Java models these with `Queue<E>` and `Deque<E>`. The deque is a double-ended queue: you can add and remove at both ends, so it works as either one. Java also has `PriorityQueue<E>`, an unbounded priority queue based on a binary **heap**. Its head is the least element according to its ordering.',
      terms: [
        { term: 'FIFO', meaning: 'First-in, first-out. The element that has waited longest is removed next, as in a waiting line.' },
        { term: 'LIFO', meaning: 'Last-in, first-out. The element added most recently is removed next, as in a pile of plates.' },
        { term: 'Deque', meaning: 'A double-ended queue. It is a linear collection that lets you add and remove elements at both the head and the tail.' },
        { term: 'Priority queue', meaning: 'A queue whose head is always the smallest element, by natural order or comparator. The order in which elements were added does not matter.' },
        { term: 'Binary heap', meaning: 'A complete binary tree, stored in an array. Every parent is less than or equal to its children.' },
        { term: 'Blocking queue', meaning: 'A thread-safe queue whose operations can wait for space to become free or for an element to arrive.' },
      ],
      source: 'Javadoc for java.util.Queue, java.util.Deque, java.util.PriorityQueue and java.util.concurrent.BlockingQueue',
    },
    interviewDefinition:
      'A **stack** is LIFO and a **queue** is FIFO. A `Deque` supports both, because you can add and remove at either end. `ArrayDeque` is a circular array with amortised O(1) operations at both ends. It is the standard choice for both, and it replaces the old synchronised `Stack`. `Queue` methods come in pairs. `add`/`remove`/`element` throw. `offer`/`poll`/`peek` return `false` or `null`. `PriorityQueue` is a binary heap: O(log n) `offer`/`poll` and O(1) `peek`. Its iteration order is not sorted. `BlockingQueue` adds methods that wait.',
    interviewFollowUps: [
      {
        question: 'Why should you not use java.util.Stack?',
        answer: '`Stack` extends `Vector`, so every call takes a lock. It also inherits index operations such as `add(0, x)` and `remove(int)` that break LIFO order. The `Deque` javadoc clearly recommends using a Deque instead of Stack.',
      },
      {
        question: 'How would you find the k largest of n numbers?',
        answer: 'Keep a **min**-heap of size k. Offer each number, and when the size goes above k, poll the smallest. In the end the heap holds the k largest. That takes O(n log k) time and O(k) memory. When k is small, this beats sorting everything (O(n log n)).',
      },
      {
        question: 'How do you make a max-heap?',
        answer: 'Pass a reversed comparator: `new PriorityQueue<>(Comparator.reverseOrder())`, or `Comparator.comparingInt(Task::priority).reversed()` for objects.',
      },
      {
        question: 'Why do queues reject null?',
        answer: '`poll` and `peek` use `null` to mean "empty". If null elements were allowed, a null result could mean two things. ArrayDeque, PriorityQueue and every BlockingQueue throw `NullPointerException` on null elements. Only the old `LinkedList` allows them.',
      },
    ],
    mnemonic: {
      device: 'ARE loud, OPP quiet',
      expansion: [
        { key: 'A', meaning: 'add(e) — throws IllegalStateException if a bounded queue is full' },
        { key: 'R', meaning: 'remove() — throws NoSuchElementException if empty' },
        { key: 'E', meaning: 'element() — throws NoSuchElementException if empty' },
        { key: 'O', meaning: 'offer(e) — quietly returns false if full' },
        { key: 'P', meaning: 'poll() — quietly returns null if empty' },
        { key: 'P', meaning: 'peek() — quietly returns null if empty' },
      ],
      visual: 'Two queue attendants: the ARE attendant shouts (throws) when something is wrong; the OPP attendant just shrugs and hands you null or false.',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'Plates, a coffee line and an emergency room',
        body: 'A **stack** is a pile of plates: you take the top one, the last put down. A **queue** is the line at a coffee shop: first come, first served. A **priority queue** is an emergency room: the most urgent patient goes next regardless of arrival time. A **deque** is a line where staff may also serve or seat people at the back.',
      },
      {
        kind: 'insight',
        title: 'A circular array never shifts',
        body: '`ArrayDeque` keeps `head` and `tail` indexes into an array that wraps around at the end. Adding at the front just moves `head` back one slot (modulo the length) — no elements move. That is how it gets O(1) at both ends without the per-node allocation of a linked list.',
      },
      {
        kind: 'real-world',
        title: 'Where these show up',
        body: 'Stacks: undo/redo in editors, the browser Back button, expression parsing, bracket matching, depth-first search. Queues: breadth-first search, rate-limited job processing, message hand-off. Priority queues: schedulers ("next deadline"), Dijkstra\'s shortest path, merging k sorted files, top-k leaderboards. Blocking queues: thread pools (`ThreadPoolExecutor` takes one) and producer-consumer pipelines.',
      },
      {
        kind: 'angle',
        title: 'The heap only promises the top',
        body: 'A heap maintains one rule: every parent is ≤ its children. That is enough to find the minimum in O(1) and repair the heap in O(log n), and it is much cheaper than keeping everything sorted. The price is that the rest of the array is only partially ordered — which is exactly why printing a `PriorityQueue` looks "random".',
      },
    ],
    diagrams: [
      {
        id: 'c-queues-stacks-lifo-fifo',
        kind: 'concept',
        title: 'LIFO stack vs FIFO queue on one ArrayDeque',
        caption: 'As a stack, push and pop both use the head, so the newest element leaves first. As a queue, offer adds at the tail and poll removes at the head, so the oldest leaves first.',
        explanation: [
          'The top row is the **Stack (LIFO)** use of an ArrayDeque. **push / pop** both work at the head, as the two-way arrow shows.',
          'Pages were pushed in the order **home**, **cart**, **checkout**. So **checkout** is now at the head and is the first to be popped. The newest element leaves first.',
          'The bottom row is the **Queue (FIFO)** use of the same class. **offer(e)** adds a new element at the tail, joining behind **job-3**.',
          '**poll()** removes from the head, so **job-1**, the oldest, leaves first, followed by **job-2** and then job-3.',
          'Takeaway: one ArrayDeque gives you a stack or a queue depending only on which ends you use.',
        ],
        cols: 5,
        rows: 3,
        nodes: [
          { id: 'push', label: 'push / pop', detail: 'stack: same end', col: 0, row: 0, shape: 'pill', tone: 'accent' },
          { id: 's3', label: 'checkout', detail: 'head = top', col: 1, row: 0, tone: 'accent' },
          { id: 's2', label: 'cart', col: 2, row: 0, tone: 'neutral' },
          { id: 's1', label: 'home', detail: 'pushed first', col: 3, row: 0, tone: 'neutral' },
          { id: 'poll', label: 'poll()', detail: 'removes oldest', col: 0, row: 2, shape: 'pill', tone: 'success' },
          { id: 'q1', label: 'job-1', detail: 'head', col: 1, row: 2, tone: 'success' },
          { id: 'q2', label: 'job-2', col: 2, row: 2, tone: 'neutral' },
          { id: 'q3', label: 'job-3', detail: 'tail', col: 3, row: 2, tone: 'neutral' },
          { id: 'offer', label: 'offer(e)', detail: 'adds at tail', col: 4, row: 2, shape: 'pill', tone: 'primary' },
        ],
        edges: [
          { from: 'push', to: 's3', both: true },
          { from: 's3', to: 's2' },
          { from: 's2', to: 's1' },
          { from: 'q1', to: 'poll', label: 'leaves' },
          { from: 'q1', to: 'q2' },
          { from: 'q2', to: 'q3' },
          { from: 'offer', to: 'q3', label: 'joins' },
        ],
        groups: [
          { label: 'Stack (LIFO)', fromCol: 0, toCol: 4, fromRow: 0, toRow: 0, tone: 'accent' },
          { label: 'Queue (FIFO)', fromCol: 0, toCol: 4, fromRow: 2, toRow: 2, tone: 'success' },
        ],
      },
      {
        id: 'c-queues-stacks-heap',
        kind: 'concept',
        title: 'A PriorityQueue is a tree stored in an array',
        caption: 'The array [1, 2, 4, 5, 3] is the heap. Index i has children 2i+1 and 2i+2, and every parent is ≤ its children. Only the root is sure to be the smallest, so toString() is not sorted.',
        explanation: [
          'The note **array [1, 2, 4, 5, 3]** is what the PriorityQueue really stores. It is also what iteration and toString show. The dashed arrow labelled same data means the tree below is just another way of reading that array.',
          'Index 0 holds the root, **1**. Its children are at indexes 1 and 2, holding **2** and **4**. The children of index i are always at 2i+1 and 2i+2, so no pointers are needed.',
          'Below **2** sit **5** and **3**. Every parent is less than or equal to its children. That is the only rule a heap keeps.',
          '**peek() / poll()** always read the root. So the smallest element comes out in O(1) for peek and O(log n) for poll.',
          'Takeaway: the heap is only partly ordered. 5 before 3 in the array is allowed. That is why printing a PriorityQueue does not look sorted.',
        ],
        cols: 4,
        rows: 4,
        nodes: [
          { id: 'arr', label: 'array [1, 2, 4, 5, 3]', detail: 'what iteration and toString show', col: 0, row: 0, span: 2, shape: 'note', tone: 'neutral' },
          { id: 'peek', label: 'peek() / poll()', detail: 'always the root', col: 3, row: 0, shape: 'pill', tone: 'success' },
          { id: 'n0', label: '1', detail: 'index 0 (root)', col: 1, row: 1, tone: 'success' },
          { id: 'n1', label: '2', detail: 'index 1', col: 0, row: 2, tone: 'primary' },
          { id: 'n2', label: '4', detail: 'index 2', col: 2, row: 2, tone: 'primary' },
          { id: 'n3', label: '5', detail: 'index 3', col: 0, row: 3, tone: 'neutral' },
          { id: 'n4', label: '3', detail: 'index 4', col: 1, row: 3, tone: 'neutral' },
        ],
        edges: [
          { from: 'arr', to: 'n0', dashed: true, label: 'same data' },
          { from: 'n0', to: 'peek' },
          { from: 'n0', to: 'n1' },
          { from: 'n0', to: 'n2' },
          { from: 'n1', to: 'n3' },
          { from: 'n1', to: 'n4' },
        ],
      },
      {
        id: 'c-queues-stacks-poll-flow',
        kind: 'flow',
        title: 'How poll() repairs the heap in O(log n)',
        caption: 'Removing the root leaves a hole. The last element fills it and sinks down, swapping with its smaller child, until the heap rule holds again. offer() works the opposite way: append, then sift up.',
        explanation: [
          '**Take root**: the smallest element sits at index 0, so poll() removes it and will return it as its result.',
          '**Move last to root**: to keep the tree complete, the last element of the array fills the hole at the root. The array shrinks by one.',
          '**Larger than a child?** compares the moved element with its children using the comparator. If yes, **Swap with smaller child** moves it one level down. The dashed arrow labelled repeat sends it back to the comparison.',
          'When the element is no longer larger than any child, the no arrow leads to **Heap restored**. There is at most one swap per level, so at most log₂(n) swaps.',
          'Takeaway: poll sifts down and offer sifts up, so both cost O(log n) while peek stays O(1).',
        ],
        cols: 4,
        rows: 2,
        nodes: [
          { id: 'take', label: 'Take root', detail: 'the result of poll()', col: 0, row: 0, tone: 'success' },
          { id: 'move', label: 'Move last to root', detail: 'array shrinks by one', col: 1, row: 0, tone: 'primary' },
          { id: 'cmp', label: 'Larger than a child?', detail: 'compare with comparator', col: 2, row: 0, tone: 'warning' },
          { id: 'swap', label: 'Swap with smaller child', detail: 'one level down', col: 2, row: 1, tone: 'accent' },
          { id: 'done', label: 'Heap restored', detail: '≤ log₂(n) swaps', col: 3, row: 0, shape: 'pill', tone: 'success' },
        ],
        edges: [
          { from: 'take', to: 'move' },
          { from: 'move', to: 'cmp' },
          { from: 'cmp', to: 'swap', label: 'yes' },
          { from: 'swap', to: 'cmp', dashed: true, label: 'repeat' },
          { from: 'cmp', to: 'done', label: 'no' },
        ],
      },
      {
        id: 'c-queues-stacks-blocking',
        kind: 'architecture',
        title: 'Producer-consumer with a bounded BlockingQueue',
        caption: 'The queue is the only shared object. put blocks producers when it is full (back-pressure). take blocks consumers when it is empty. So no thread busy-waits, and memory stays bounded.',
        explanation: [
          'On the left, each **Producer thread** creates tasks. One uses `put(task)`, which waits if the queue is full. The other uses `offer(task, timeout)`, which gives up after a time limit.',
          'In the middle, the **ArrayBlockingQueue** with capacity 100 is the only object the threads share. It handles all locking inside.',
          'On the right, each **Consumer thread** takes work. `take()` waits if the queue is empty, and `poll(timeout)` waits only up to a limit.',
          'The arrow labels waits if full and waits if empty show back-pressure. Fast producers are slowed down instead of filling memory. Idle consumers sleep instead of spinning.',
          'Takeaway: a bounded blocking queue is the simplest safe way to hand work between threads.',
        ],
        cols: 3,
        rows: 2,
        nodes: [
          { id: 'p1', label: 'Producer thread', detail: 'put(task)', col: 0, row: 0, tone: 'primary' },
          { id: 'p2', label: 'Producer thread', detail: 'offer(task, timeout)', col: 0, row: 1, tone: 'primary' },
          { id: 'q', label: 'ArrayBlockingQueue', detail: 'capacity 100, thread-safe', col: 1, row: 0, shape: 'cylinder', tone: 'accent' },
          { id: 'c1', label: 'Consumer thread', detail: 'take()', col: 2, row: 0, tone: 'success' },
          { id: 'c2', label: 'Consumer thread', detail: 'poll(timeout)', col: 2, row: 1, tone: 'success' },
        ],
        edges: [
          { from: 'p1', to: 'q', label: 'waits if full' },
          { from: 'p2', to: 'q' },
          { from: 'q', to: 'c1', label: 'waits if empty' },
          { from: 'q', to: 'c2' },
        ],
      },
    ],
    variants: [
      {
        title: 'Queue and Deque implementations',
        items: [
          { name: 'ArrayDeque', summary: 'Circular array; amortised O(1) at both ends; no nulls; not thread-safe. The default stack and FIFO queue.', code: 'Deque<Integer> stack = new ArrayDeque<>();' },
          { name: 'PriorityQueue', summary: 'Unbounded binary heap; O(log n) offer/poll, O(1) peek, O(n) remove(Object); not thread-safe.', code: 'new PriorityQueue<>(Comparator.comparing(Job::deadline))' },
          { name: 'LinkedList', summary: 'Doubly linked Deque; allows null; extra allocation per element.', note: 'Prefer ArrayDeque.' },
          { name: 'ArrayBlockingQueue', summary: 'Bounded, array-backed BlockingQueue with one lock; optional fairness.' },
          { name: 'LinkedBlockingQueue / LinkedBlockingDeque', summary: 'Optionally bounded (default Integer.MAX_VALUE); separate put and take locks for throughput.', note: 'Unbounded by default — set a capacity.' },
          { name: 'PriorityBlockingQueue / DelayQueue', summary: 'Thread-safe heap; DelayQueue releases elements only after their delay expires.' },
          { name: 'SynchronousQueue', summary: 'Zero capacity: each put waits for a matching take (a direct hand-off).' },
          { name: 'ConcurrentLinkedQueue / ConcurrentLinkedDeque', summary: 'Lock-free, unbounded, non-blocking concurrent queues.' },
          { name: 'Stack', summary: 'Legacy LIFO class extending Vector (synchronised).', support: 'partial', note: 'Kept for compatibility; use ArrayDeque.' },
        ],
      },
      {
        title: 'Four method families (from the BlockingQueue contract)',
        items: [
          { name: 'Throws exception', summary: 'add(e), remove(), element() — failure is a bug.', code: 'queue.remove(); // NoSuchElementException if empty' },
          { name: 'Special value', summary: 'offer(e) → false, poll() → null, peek() → null — failure is normal.', code: 'String next = queue.poll(); if (next == null) …' },
          { name: 'Blocks', summary: 'put(e) waits for space, take() waits for an element. BlockingQueue only.' },
          { name: 'Times out', summary: 'offer(e, time, unit) and poll(time, unit) wait up to a limit. BlockingQueue only.' },
        ],
      },
      {
        title: 'Deque used as a stack vs as a queue',
        items: [
          { name: 'Stack (LIFO)', summary: 'push = addFirst, pop = removeFirst, peek = peekFirst — all at the head.', code: 'stack.push(x); stack.pop();' },
          { name: 'Queue (FIFO)', summary: 'offer = offerLast at the tail, poll = pollFirst at the head.', code: 'queue.offer(x); queue.poll();' },
          { name: 'Sliding window / both ends', summary: 'offerLast, pollFirst and pollLast together — e.g. monotonic deque for window maximums.', code: 'while (!dq.isEmpty() && dq.peekLast() < x) dq.pollLast();' },
        ],
      },
    ],
    deepDive: [
      {
        title: 'Binary heap index arithmetic and O(n) heapify',
        body: '`PriorityQueue` stores a complete binary tree in an array: the children of index i are 2i+1 and 2i+2, and its parent is (i−1)/2, so no node objects or pointers are needed. `offer` appends and sifts up; `poll` moves the last element to the root and sifts down — each at most the tree height, ⌊log₂ n⌋ swaps. Building a heap from an existing collection (`new PriorityQueue<>(collection)`) uses bottom-up heapify, which is O(n) rather than n separate O(log n) inserts. `remove(Object)` and `contains` must scan the array: O(n).',
        sources: [
          { label: 'PriorityQueue API documentation (Java 21)', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/PriorityQueue.html' },
          { label: 'Introduction to Algorithms (Cormen, Leiserson, Rivest, Stein) — chapter on heapsort' },
        ],
      },
      {
        title: 'Deque officially replaces Stack',
        body: '`Stack` dates from Java 1.0 and extends `Vector`, an early design choice that made a stack *be a* list (inheritance where composition was needed — the textbook example in *Effective Java*). Java 6 introduced `Deque` and `ArrayDeque`, and the `Deque` javadoc states that deques "can also be used as LIFO (Last-In-First-Out) stacks" and that the interface "should be used in preference to the legacy Stack class". Watch the observable difference: a `Stack` iterates bottom-to-top, a Deque used with `push` iterates top-to-bottom.',
        sources: [
          { label: 'Deque API documentation (Java 21)', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Deque.html' },
          { label: 'Effective Java, 3rd edition — Item 18: Favor composition over inheritance' },
        ],
      },
      {
        title: 'Unbounded queues hide overload',
        body: 'An unbounded queue between a fast producer and a slow consumer grows until the heap is exhausted — the failure shows up as an `OutOfMemoryError` far from the cause. `Executors.newFixedThreadPool` uses an unbounded `LinkedBlockingQueue`, which is why production code often builds a `ThreadPoolExecutor` with a bounded queue and a rejection policy. Bounded queues turn overload into back-pressure (producers wait in `put`) or an explicit decision (`offer` returns false), which you can measure and alert on.',
        sources: [
          { label: 'BlockingQueue API documentation (Java 21)', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/BlockingQueue.html' },
          { label: 'Java Concurrency in Practice — chapter 8, Applying Thread Pools (bounded queues and saturation policies)' },
        ],
      },
    ],
  },
};
