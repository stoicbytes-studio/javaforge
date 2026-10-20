import type { MemoryAid } from '@/types/curriculum';

/** "Make it stick" memory aids for the Collections module, keyed by lesson id. */
export const collectionsMemory: Record<string, MemoryAid> = {
  'c-collections-overview': {
    oneLiner: 'Pick a collection by what you need: a numbered list, no repeats, lookup by key, or a waiting line.',
    story:
      'Imagine moving into a new home and sorting your things. Books go on a numbered shelf, where slot 3 is always slot 3 and two copies of a book are fine. The party guest list has each name once. The key hooks by the door hold one key per label, so you find a key by its label. Letters wait in a tray and get opened in order. In Java, the shelf is a `List`, the guest list is a `Set`, the labelled hooks are a `Map` and the letter tray is a `Queue`.',
    keyPoints: [
      '`List` keeps order and allows duplicates; `Set` keeps each element at most once.',
      '`Map` stores key-value pairs and finds a value by its key; it is not a `Collection`.',
      'Start with the defaults `ArrayList`, `HashSet`, `HashMap` and `ArrayDeque`, and change only for a reason.',
    ],
    types: [
      {
        title: 'List implementations',
        items: [
          { name: '`ArrayList`', simple: 'The default list: a numbered shelf that grows when full, quick to read any slot by number.' },
          { name: '`LinkedList`', simple: 'A chain of linked items; sounds clever but is usually slower and uses more memory.' },
          { name: '`CopyOnWriteArrayList`', simple: 'Makes a fresh copy on every change, so many threads can read it safely; good for rarely changed lists.' },
        ],
      },
      {
        title: 'Set implementations',
        items: [
          { name: '`HashSet`', simple: 'The default set: each item at most once, very fast checks, no particular order.' },
          { name: '`LinkedHashSet`', simple: 'No repeats, and remembers the order items first arrived, like a guest book.' },
          { name: '`TreeSet`', simple: 'No repeats, and always kept sorted, like names in a phone book.' },
          { name: '`EnumSet`', simple: 'A tiny, super-fast set of enum constants, like ticking boxes for days of the week.' },
        ],
      },
      {
        title: 'Map implementations',
        items: [
          { name: '`HashMap`', simple: 'The everyday choice: very fast lookup, but keys come out in no particular order.' },
          { name: '`LinkedHashMap`', simple: 'Like `HashMap`, but remembers the order you added keys, like a numbered queue of tickets.' },
          { name: '`TreeMap`', simple: 'Keeps keys sorted, like a dictionary, and can find the nearest key below or above a value.' },
          { name: '`EnumMap`', simple: 'A tiny, fast map when the keys are the constants of one enum, like days of the week.' },
          { name: '`ConcurrentHashMap`', simple: 'A map many threads can use at once safely, like a shared notice board with a careful clerk.' },
        ],
      },
    ],
    confusion: {
      mixedUpWith: 'the interface and the implementation',
      difference: '`List` is the interface that says what you can do; `ArrayList` is one class that does it. Declare variables with the interface type.',
    },
    tryIt: 'Add "tea", "milk" and "tea" to an `ArrayList` and to a `HashSet`. Print both and their `size()`, and see that the set keeps "tea" only once.',
    recall: [
      { question: 'Which collection type keeps each element only once?', answer: 'A `Set`, for example `HashSet`.' },
      { question: 'Why is `Map` not a `Collection`?', answer: 'A map stores key-value pairs, so a single `add(element)` method makes no sense for it.' },
      { question: 'What is the usual default `List` implementation?', answer: '`ArrayList`, a resizable array.' },
    ],
    picture: {
      title: 'Four ways to store things at home',
      caption: 'The shelf is a List, the guest list is a Set, the key hooks are a Map and the letter tray is a Queue. You pick the one that fits the job.',
      items: [
        { icon: 'house', label: 'Your data', x: 50, y: 28, size: 0.9, tone: 'neutral' },
        { icon: 'shelf', label: 'List', x: 15, y: 10, size: 0.8, tone: 'primary' },
        { icon: 'id-card', label: 'Set', x: 85, y: 10, size: 0.8, tone: 'accent' },
        { icon: 'key', label: 'Map', x: 15, y: 46, size: 0.8, tone: 'success' },
        { icon: 'envelope', label: 'Queue', x: 85, y: 46, size: 0.8, tone: 'warning' },
      ],
      arrows: [
        { from: 0, to: 1 },
        { from: 0, to: 2 },
        { from: 0, to: 3 },
        { from: 0, to: 4 },
      ],
    },
  },
  'c-hashmap': {
    oneLiner: 'A `HashMap` uses the key\'s `hashCode` to jump to one box, then uses `equals` to find the exact key.',
    story:
      'Picture a post office wall with 16 numbered mail boxes. When a letter for "Ana" arrives, the clerk does a quick sum on the name to get a box number, say 5, and drops it in box 5. Later, to find Ana\'s letter, the clerk does the same sum, goes straight to box 5 and checks each letter\'s name carefully. In Java, the sum is `hashCode`, the boxes are buckets, the careful name check is `equals`, and when the wall gets too full the post office builds a bigger wall and re-sorts every letter (resizing).',
    keyPoints: [
      '`hashCode` picks the bucket; `equals` finds the exact key inside that bucket.',
      'Get and put are usually very fast, but only if keys spread well across buckets.',
      'A `HashMap` has no order and is not safe for many threads at once.',
    ],
    types: [
      {
        title: 'Hash-based maps in the JDK',
        items: [
          { name: '`HashMap`', simple: 'The general-purpose map: fast, no order, one `null` key allowed, for one thread at a time.' },
          { name: '`LinkedHashMap` (insertion order)', simple: 'Hands keys back in the order you first added them, like names on a sign-up sheet.' },
          { name: '`LinkedHashMap` (access order)', simple: 'Moves each used key to the end, so the least used is first: the basis of an LRU cache.' },
          { name: '`ConcurrentHashMap`', simple: 'Safe for many threads at once and never allows `null`; the right choice for shared caches.' },
          { name: '`IdentityHashMap`', simple: 'Treats two keys as the same only if they are the very same object, not just equal twins.' },
          { name: '`WeakHashMap`', simple: 'An entry quietly disappears once nothing else uses its key, like a note that fades away.' },
        ],
      },
      {
        title: 'Ways to handle collisions',
        items: [
          { name: 'Separate chaining', simple: 'Two keys landing in the same box are kept in a little list inside that box. `HashMap` does this.' },
          { name: 'Tree bins (Java 8)', simple: 'A box that gets very crowded is reorganised into a sorted tree so searching stays quick.' },
          { name: 'Open addressing', simple: 'If a box is taken, try the next empty box, like parking in the next free space.' },
        ],
      },
    ],
    confusion: {
      mixedUpWith: 'overriding `equals` but not `hashCode`',
      difference: 'Equal keys must have the same `hashCode`. If they do not, the map looks in the wrong bucket and `get` returns `null`.',
    },
    tryIt: 'Write a class `Point` with `x` and `y` that overrides only `equals`. Put a `new Point(1, 2)` in a `HashMap`, then call `get(new Point(1, 2))`. Add `hashCode` and try again.',
    recall: [
      { question: 'Which method decides the bucket for a key?', answer: 'The key\'s `hashCode`.' },
      { question: 'What happens when a `HashMap` gets too full?', answer: 'It makes a bigger table, about twice the size, and moves every entry into its new bucket.' },
      { question: 'Does a `HashMap` remember insertion order?', answer: 'No. Use `LinkedHashMap` if you need insertion order.' },
    ],
    picture: {
      title: 'The post office wall of boxes',
      caption: 'A quick sum on the name (hashCode) picks the box (bucket). A careful name check (equals) finds the right letter.',
      items: [
        { icon: 'envelope', label: 'key "Ana"', x: 12, y: 22, tone: 'primary' },
        { icon: 'calculator', label: 'hashCode', x: 50, y: 22, tone: 'accent' },
        { icon: 'mailbox', label: 'bucket 5', x: 88, y: 22, tone: 'neutral' },
        { icon: 'magnifier', label: 'equals check', x: 88, y: 47, size: 0.8, tone: 'success' },
      ],
      arrows: [
        { from: 0, to: 1, label: 'sum' },
        { from: 1, to: 2, label: 'box' },
        { from: 2, to: 3 },
      ],
    },
  },
  'c-sorted': {
    oneLiner: '`Comparable` is a type\'s own natural order; a `Comparator` is any extra order you choose from outside.',
    story:
      'In a library, books have a natural order: by title, A to Z. That rule belongs to the books themselves. But a librarian can also hand you a rule card that says "sort by year, then by author". In Java, the natural order is `Comparable.compareTo`, written inside the class. The rule card is a `Comparator`, written outside, and you can have as many cards as you like. A shelf that always stays in order as new books arrive is a `TreeSet` or `TreeMap`.',
    keyPoints: [
      '`compare` returns a negative number, zero or a positive number: before, same, or after.',
      'Build comparators with `Comparator.comparing(...)`, then add tie-breakers with `thenComparing` and flip with `reversed()`.',
      '`TreeSet` and `TreeMap` treat a compare result of zero as the same element.',
    ],
    types: [
      {
        title: 'Ways to sort',
        items: [
          { name: '`list.sort(comparator)`', simple: 'Sorts the list in place, keeping equal items in their old order, like re-shelving one shelf.' },
          { name: '`Arrays.sort(array)`', simple: 'Sorts an array in place; works for numbers and for objects.' },
          { name: '`stream.sorted()`', simple: 'Produces a new sorted sequence in a stream and leaves the original list untouched.' },
          { name: '`TreeSet` / `TreeMap`', simple: 'Keep items sorted all the time, like a dictionary that files each new word in its place.' },
          { name: '`PriorityQueue`', simple: 'Only promises the smallest item is at the front, like a triage nurse picking the next patient.' },
        ],
      },
      {
        title: 'Comparator building blocks',
        items: [
          { name: '`comparing(key)`', simple: 'Sort by one property, such as a person\'s age or a word\'s length.' },
          { name: '`thenComparing(key)`', simple: 'A tie-breaker used only when the first rule says two items are equal, like sorting by surname, then first name.' },
          { name: '`reversed()`', simple: 'Flips the whole order upside down: largest first instead of smallest first.' },
          { name: '`nullsFirst` / `nullsLast`', simple: 'Decides where empty (`null`) values go instead of crashing, like putting blank forms at the end.' },
        ],
      },
    ],
    confusion: {
      mixedUpWith: '`Comparable` versus `Comparator`',
      difference: '`Comparable` lives inside the class and gives one natural order. A `Comparator` is a separate object, so you can have many orders.',
    },
    tryIt: 'Make a list of three words of different lengths. Sort it with `list.sort(null)` and print it, then sort with `Comparator.comparing(String::length)` and print again.',
    recall: [
      { question: 'What does a compare result of zero mean?', answer: 'The two elements count as equal in that order.' },
      { question: 'How do you add a second sort rule for ties?', answer: 'Chain `thenComparing(...)` after the first comparator.' },
      { question: 'Which collections keep elements sorted all the time?', answer: '`TreeSet` and `TreeMap`.' },
    ],
    picture: {
      title: 'The book\'s order and the librarian\'s card',
      caption: 'Books know their own A to Z order (Comparable). The librarian\'s rule card is a Comparator. The shelf stays sorted like a TreeSet.',
      items: [
        { icon: 'book', label: 'Comparable', x: 14, y: 12, size: 0.85, tone: 'primary' },
        { icon: 'note', label: 'Comparator', x: 14, y: 44, size: 0.85, tone: 'accent' },
        { icon: 'shelf', label: 'TreeSet', x: 82, y: 28, tone: 'success' },
      ],
      arrows: [
        { from: 0, to: 2, label: 'A to Z' },
        { from: 1, to: 2, label: 'by year' },
      ],
    },
  },
  'c-iteration': {
    oneLiner: 'Do not add or remove items while a for-each loop walks a collection; use `removeIf` or the iterator.',
    story:
      'A teacher is counting children as they get on a school bus, one by one. If a child jumps off in the middle of the count, the teacher notices the numbers no longer add up, stops, and shouts. In Java, the teacher is an `Iterator` (a for-each loop uses one behind the scenes), the children are the elements, and the shout is a `ConcurrentModificationException`. The safe way is to tell the teacher, "this child is leaving", which is `iterator.remove()`, or to ask the bus driver to remove everyone who fits a rule: `removeIf`.',
    keyPoints: [
      'A for-each loop over a collection uses an `Iterator` behind the scenes.',
      'Changing the collection during the loop usually throws `ConcurrentModificationException`.',
      'Remove safely with `iterator.remove()` or `list.removeIf(...)`.',
    ],
    types: [
      {
        title: 'Iteration styles',
        items: [
          { name: 'For-each loop', simple: 'The easiest way to visit every item, one by one, but you cannot remove items with it.' },
          { name: 'Explicit `Iterator`', simple: 'Walk the items yourself and call `remove()` to safely take out the current one.' },
          { name: 'Indexed `for` loop', simple: 'Visit items by position number; fine for an `ArrayList`, slow for a `LinkedList`.' },
          { name: '`forEach(...)` with a lambda', simple: 'Hand the collection a small job and let it run the job on every item for you.' },
          { name: '`removeIf(...)`', simple: 'Remove every item that matches a rule in one safe step, like clearing out all expired milk.' },
        ],
      },
      {
        title: 'Read-only collection kinds',
        items: [
          { name: '`Collections.unmodifiableList`', simple: 'A locked window: you cannot change it, but you still see changes the owner makes.' },
          { name: '`List.of` / `List.copyOf`', simple: 'A photograph: frozen forever, nobody can change it, and `null` is not allowed.' },
          { name: '`stream.toList()`', simple: 'A read-only list made at the end of a stream; unlike `List.of` it may hold `null`.' },
          { name: '`Arrays.asList`', simple: 'A fixed-size list over an array: you can replace items but not add or remove them.' },
        ],
      },
    ],
    confusion: {
      mixedUpWith: 'an unmodifiable view versus an immutable list',
      difference: '`Collections.unmodifiableList` is a read-only window, so the original list can still change behind it. `List.of` and `List.copyOf` can never change.',
    },
    tryIt: 'Fill an `ArrayList` with 1 to 5. In a for-each loop, call `list.remove(Integer.valueOf(2))` and read the exception. Then use `list.removeIf(n -> n == 2)` instead.',
    recall: [
      { question: 'What exception do you usually get when you change a list inside a for-each loop?', answer: 'A `ConcurrentModificationException`.' },
      { question: 'Name one safe way to remove items while iterating?', answer: '`iterator.remove()` or `removeIf` with a condition.' },
    ],
    picture: {
      title: 'Counting children onto the bus',
      caption: 'The teacher (Iterator) counts the children (elements). If one jumps off mid-count, the teacher stops with an error. removeIf is the safe way.',
      items: [
        { icon: 'teacher', label: 'Iterator', x: 13, y: 18, tone: 'accent' },
        { icon: 'people', label: 'the list', x: 50, y: 18, tone: 'primary' },
        { icon: 'warning', label: 'CME!', x: 87, y: 18, tone: 'danger' },
        { icon: 'person', label: 'removes one', x: 50, y: 46, size: 0.8, tone: 'warning' },
        { icon: 'check', label: 'removeIf', x: 13, y: 46, size: 0.8, tone: 'success' },
      ],
      arrows: [
        { from: 0, to: 1, label: 'count' },
        { from: 1, to: 2, label: 'stop' },
        { from: 3, to: 1, dashed: true },
        { from: 4, to: 1 },
      ],
    },
  },
  'c-queues-stacks': {
    oneLiner: 'A stack takes the newest item first, a queue takes the oldest first, and `ArrayDeque` can do both.',
    story:
      'In a busy cafe, clean plates are piled up: the last plate put on top is the first one taken. Customers stand in a line at the counter: the first to arrive is served first. A stack of plates is LIFO (last in, first out). The line is FIFO (first in, first out). In Java, one tool handles both: `ArrayDeque`, a double-ended queue you can add to and take from at either end. If the cafe serves VIP orders first, that is a `PriorityQueue`, which always hands out the smallest or most urgent item next.',
    keyPoints: [
      'Stack: `push` and `pop` work on the same end, so the newest item leaves first.',
      'Queue: `offer` adds at the back and `poll` takes from the front.',
      '`offer`, `poll` and `peek` return `false` or `null` instead of throwing like `add`, `remove` and `element`.',
    ],
    types: [
      {
        title: 'Queue and Deque implementations',
        items: [
          { name: '`ArrayDeque`', simple: 'The everyday choice for both stacks and queues: fast at both ends, like a line with two doors.' },
          { name: '`PriorityQueue`', simple: 'Always hands out the smallest or most urgent item next, like an emergency room.' },
          { name: '`LinkedList`', simple: 'Also works as a queue, but uses more memory and is usually slower than `ArrayDeque`.' },
          { name: '`ArrayBlockingQueue`', simple: 'A fixed-size, thread-safe line: adders wait when it is full, takers wait when it is empty.' },
          { name: '`Stack`', simple: 'An old class kept only for old code; use `ArrayDeque` with `push` and `pop` instead.' },
        ],
      },
      {
        title: 'Four method families',
        items: [
          { name: 'Throws: `add`, `remove`, `element`', simple: 'Complains loudly with an exception if the queue is full or empty.' },
          { name: 'Special value: `offer`, `poll`, `peek`', simple: 'Just shrugs and gives back `false` or `null` when it cannot do the job.' },
          { name: 'Blocks: `put`, `take`', simple: 'Waits patiently until there is room or an item; only blocking queues have these.' },
          { name: 'Times out: `offer`/`poll` with time', simple: 'Waits, but only up to a time limit, like waiting ten minutes for a bus.' },
        ],
      },
    ],
    confusion: {
      mixedUpWith: 'the old `Stack` class',
      difference: '`Stack` is an old synchronised class kept for compatibility. Use `ArrayDeque` with `push` and `pop` in new code.',
    },
    tryIt: 'Create an `ArrayDeque<String>`. Call `push("a")`, `push("b")`, `push("c")`, then `pop()` three times and print each. Repeat with `offer` and `poll` and compare the order.',
    recall: [
      { question: 'Which comes out first from a stack: the oldest or the newest item?', answer: 'The newest. A stack is last in, first out.' },
      { question: 'What does `poll` return on an empty queue?', answer: 'It returns `null`.' },
      { question: 'Which class is the usual choice for both stacks and queues?', answer: '`ArrayDeque`, a double-ended queue.' },
    ],
    picture: {
      title: 'Plates and a line at the cafe',
      caption: 'The plate pile is a stack (newest first). The line is a queue (oldest first). ArrayDeque can play both roles.',
      items: [
        { icon: 'plates', label: 'Stack: LIFO', x: 14, y: 14, tone: 'primary' },
        { icon: 'queue', label: 'Queue: FIFO', x: 86, y: 14, tone: 'success' },
        { icon: 'boxes', label: 'ArrayDeque', x: 50, y: 42, tone: 'accent' },
      ],
      arrows: [
        { from: 2, to: 0, label: 'push' },
        { from: 2, to: 1, label: 'offer' },
      ],
    },
  },
};
