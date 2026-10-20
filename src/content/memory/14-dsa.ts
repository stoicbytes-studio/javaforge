import type { MemoryAid } from '@/types/curriculum';

/** "Make it stick" memory aids for the data structures and algorithms module, keyed by lesson id. */
export const dsaMemory: Record<string, MemoryAid> = {
  'a-complexity': {
    oneLiner: 'Big-O tells you how the work grows when the input gets bigger, not how many seconds it takes.',
    story:
      'Imagine a party. Greeting each guest once means 10 guests take 10 hellos and 100 guests take 100 hellos. That is O(n), or linear: the work grows in step with the guests. Now everyone shakes hands with everyone. 10 guests need about 50 handshakes, but 100 guests need about 5,000. That is O(n^2), or quadratic. Finding one name in a sorted guest list by opening it in the middle and halving each time takes only a few looks, even for a huge list. That is O(log n). In Java, n is the size of your input, and Big-O describes how your method\'s work grows with it.',
    keyPoints: [
      'Big-O ignores constant factors and small terms; it only describes how cost scales as n grows.',
      'Common orders from best to worst: O(1), O(log n), O(n), O(n log n), O(n^2), O(2^n).',
      '`ArrayList.add` is amortised O(1): usually instant, with a rare O(n) copy when the array grows.',
    ],
    types: [
      {
        title: 'Common complexity classes',
        items: [
          { name: 'O(1), constant', simple: 'Same effort however big the input, like opening a locker when you already know its number.' },
          { name: 'O(log n), logarithmic', simple: 'Halve the problem each step, like finding a name by opening a phone book in the middle.' },
          { name: 'O(n), linear', simple: 'Look at every item once, like knocking on every door in one street.' },
          { name: 'O(n log n), linearithmic', simple: 'The cost of a good sort: a bit more than one pass, like sorting a deck by merging small piles.' },
          { name: 'O(n^2), quadratic', simple: 'Every item meets every other, like every guest at a party shaking hands with everyone else.' },
          { name: 'O(2^n), exponential', simple: 'Trying every combination, like testing every possible pizza topping mix. Hopeless past a few dozen items.' },
        ],
      },
      {
        title: 'Kinds of analysis',
        items: [
          { name: 'Worst case', simple: 'The slowest it can ever be, like planning your commute for the worst traffic jam.' },
          { name: 'Average case', simple: 'What usually happens over typical inputs, like your normal journey time to work.' },
          { name: 'Amortised', simple: 'The cost spread over many operations, like an annual bus pass averaged over every trip you take.' },
        ],
      },
    ],
    confusion: {
      mixedUpWith: 'actual running speed',
      difference: 'Big-O predicts how cost grows, not real time. An O(n) loop can be slower than an O(n log n) one for small inputs, so you still measure.',
    },
    tryIt: 'Write two methods that check a list for duplicates: one with two nested loops, one with a `HashSet`. Time both with 1,000 and then 10,000 random numbers and see which one slows down much faster.',
    recall: [
      { question: 'What is the complexity of everyone at a party shaking hands with everyone?', answer: 'O(n^2), quadratic, because the handshakes grow with the square of the guests.' },
      { question: 'Why is binary search O(log n)?', answer: 'Each look halves the part of the sorted list that is still left to search.' },
      { question: 'What does amortised O(1) mean for `ArrayList.add`?', answer: 'Averaged over many adds, each add is constant time, even though a resize sometimes costs O(n).' },
    ],
    picture: {
      title: 'How party work grows',
      caption: 'Looking up a name in a sorted list stays cheap, greeting everyone grows steadily, and everyone shaking hands explodes as the party grows.',
      items: [
        { icon: 'book', label: 'O(log n) lookup', x: 17, y: 22, tone: 'success' },
        { icon: 'person', label: 'O(n) greet all', x: 50, y: 22, tone: 'warning' },
        { icon: 'people', label: 'O(n^2) handshakes', x: 83, y: 22, tone: 'danger' },
      ],
    },
  },
  'a-data-structures': {
    oneLiner: 'A data structure is a way of storing things so the jobs you do most often are fast.',
    story:
      'Think of how a home stores things. A numbered shelf lets you grab item 5 at once; that is an array, `ArrayList` in Java. Labelled drawers let you find socks by the label without searching every drawer; that is a hash table, `HashMap`. A family tree keeps names in order; that is `TreeMap`, a sorted tree. A stack of plates gives you the top plate first, and a line at the shop serves the first person first; in Java, `ArrayDeque` handles both the stack and the queue. Each choice makes one job cheap and another job slower.',
    keyPoints: [
      'Pick the structure by the operation you do most: by position, by key, in order, or from the ends.',
      'Java defaults: `ArrayList`, `HashMap`, `TreeMap`, `ArrayDeque` for stacks and queues, and `PriorityQueue` for "smallest first".',
      'Every structure trades costs: a `HashMap` finds keys fast but keeps no order, a `TreeMap` keeps order at O(log n).',
    ],
    types: [
      {
        title: 'Linear vs non-linear structures',
        items: [
          { name: 'Array', simple: 'An egg carton with numbered slots: jump straight to slot 7, but squeezing one in the middle means shifting.' },
          { name: 'Linked list', simple: 'A treasure hunt where each clue points to the next one; easy to insert, slow to reach clue 50.' },
          { name: 'Stack', simple: 'A pile of plates: you add and take from the top only. Last in, first out.' },
          { name: 'Queue', simple: 'The line at a bakery: first to arrive is first served.' },
          { name: 'Tree', simple: 'A family tree or folder hierarchy: one root, each item with its own children.' },
          { name: 'Heap', simple: 'A hospital waiting list where the most urgent patient is always seen next.' },
          { name: 'Hash table', simple: 'A coat check: hand over your ticket number and get your coat straight away.' },
          { name: 'Graph', simple: 'A map of cities joined by roads, where any city can link to any other.' },
        ],
      },
      {
        title: 'Types of trees',
        items: [
          { name: 'Binary search tree', simple: 'A guessing game: smaller goes left, bigger goes right, so each question halves the search.' },
          { name: 'Balanced tree (red-black)', simple: 'A BST that tidies itself so it never gets lopsided; `TreeMap` uses one.' },
          { name: 'Trie (prefix tree)', simple: 'A word tree one letter per step, like the autocomplete on your phone keyboard.' },
        ],
      },
    ],
    confusion: {
      mixedUpWith: '`HashMap` and `TreeMap`',
      difference: 'A `HashMap` gives expected O(1) lookups in no particular order. A `TreeMap` keeps keys sorted, with O(log n) lookups.',
    },
    tryIt: 'Put the same five words into a `HashMap` and a `TreeMap` as keys, then print both maps. Notice that only the `TreeMap` prints them in alphabetical order.',
    recall: [
      { question: 'Which Java class should you use for both a stack and a queue?', answer: '`ArrayDeque`, which works as both.' },
      { question: 'Which structure gives you the smallest item first?', answer: 'A heap, which is `PriorityQueue` in Java.' },
      { question: 'Why is getting element 5 from an `ArrayList` fast?', answer: 'It is backed by an array, so it can jump straight to a position in O(1).' },
    ],
    picture: {
      title: 'Every home has its storage',
      caption: 'Shelves by position, labelled drawers by key, a family tree in order, plates from the top and a shop line from the front.',
      items: [
        { icon: 'shelf', label: 'ArrayList', x: 17, y: 12, size: 0.8, tone: 'primary' },
        { icon: 'drawer', label: 'HashMap', x: 50, y: 12, size: 0.8, tone: 'accent' },
        { icon: 'family', label: 'TreeMap', x: 83, y: 12, size: 0.8, tone: 'success' },
        { icon: 'plates', label: 'Stack (Deque)', x: 30, y: 42, size: 0.8, tone: 'neutral' },
        { icon: 'queue', label: 'Queue (Deque)', x: 70, y: 42, size: 0.8, tone: 'neutral' },
      ],
    },
  },
  'a-sorting-searching': {
    oneLiner: 'Sorting puts things in order once, so that searching can then halve the problem at every step.',
    story:
      'In a library with books dumped in a messy pile, finding one book means checking every book. That is linear search, O(n). Once a librarian sorts the books onto a shelf by title, you can open the middle, see if your title comes before or after, and throw away half the shelf each time. That is binary search, O(log n). If two books have the same title, a careful librarian keeps them in the order they arrived; that is a stable sort. In Java, `Arrays.sort` and `Collections.sort` are the librarian, and `Collections.binarySearch` is the halving trick.',
    keyPoints: [
      'Binary search only works on sorted data that you can jump into by position, like an array.',
      'Good comparison sorts take O(n log n); simple ones like insertion sort take O(n^2) in the worst case.',
      'Java sorts objects with TimSort, which is stable, and primitive arrays with dual-pivot quicksort.',
    ],
    types: [
      {
        title: 'Sorting algorithms',
        items: [
          { name: 'Insertion sort', simple: 'Sorting a hand of cards by sliding each new card into its place. Great when almost sorted.' },
          { name: 'Merge sort', simple: 'Two teachers each sort half the exam papers, then merge their piles. Always O(n log n) and stable.' },
          { name: 'Quick sort', simple: 'Pick a pivot, put smaller items left and bigger right, repeat on each side. Fast but not stable.' },
          { name: 'Heap sort', simple: 'Keep lifting the biggest parcel off a pyramid pile; steady speed, no extra space.' },
          { name: 'Counting sort', simple: 'Tally marks in pigeonholes for each value, like counting votes; no comparisons at all.' },
          { name: 'TimSort', simple: 'Java\'s object sort: spots already-sorted stretches and merges them, so tidy data sorts very fast.' },
        ],
      },
      {
        title: 'Search algorithms',
        items: [
          { name: 'Linear search', simple: 'Checking every drawer until you find your keys. Works on anything, but slow for big piles.' },
          { name: 'Binary search', simple: 'Opening a sorted dictionary in the middle and throwing away the wrong half each time.' },
          { name: 'Hash lookup', simple: 'Going straight to the right pigeonhole by name, with no searching at all.' },
        ],
      },
      {
        title: 'Ways to classify sorting algorithms',
        items: [
          { name: 'Stable vs unstable', simple: 'A stable sort keeps people with the same score in their original queue order.' },
          { name: 'In-place vs extra space', simple: 'Sorting books on the shelf itself, versus needing a second empty shelf to help.' },
          { name: 'Comparison vs non-comparison', simple: 'Comparing two items at a time, versus dropping each item straight into a labelled bucket by its value.' },
        ],
      },
    ],
    confusion: {
      mixedUpWith: 'stable and unstable sorting',
      difference: 'A stable sort keeps items with equal keys in their original order. An unstable sort may swap them around.',
    },
    tryIt: 'Sort a `List<String>` of names with `Collections.sort`, then call `Collections.binarySearch` for a name that exists and one that does not. Notice the negative result for the missing name.',
    recall: [
      { question: 'What must be true before you can use binary search?', answer: 'The data must be sorted, and you must be able to jump to any position quickly.' },
      { question: 'What does a stable sort promise?', answer: 'Items with equal keys stay in the same order they had before sorting.' },
      { question: 'Which algorithm does Java use to sort a list of objects?', answer: 'TimSort, a stable and adaptive merge sort.' },
    ],
    picture: {
      title: 'Sort the pile, then halve it',
      caption: 'A messy pile needs a full scan. Sorting it onto a shelf lets you search by halving, which is binary search.',
      items: [
        { icon: 'boxes', label: 'Messy pile', x: 13, y: 22, tone: 'danger' },
        { icon: 'shelf', label: 'Shelf', x: 50, y: 22, tone: 'success' },
        { icon: 'magnifier', label: 'Halve it', x: 87, y: 22, tone: 'accent' },
      ],
      arrows: [
        { from: 0, to: 1, label: 'sort' },
        { from: 1, to: 2, label: 'search' },
      ],
    },
  },
  'a-patterns': {
    oneLiner: 'Read the shape of a problem, spot the clue, and pick the matching pattern instead of starting from scratch.',
    story:
      'A good plumber does not test every tool on a leak. They look at the job and the clue tells them the tool: a loose nut means a wrench. Coding problems work the same way. If you need to know "have I seen this before?", the tool is a hash set. If the data is sorted, two pointers squeeze in from both ends. If the question is about a run of items in a row, slide a window along. If it asks for the shortest path, use breadth-first search (BFS). In Java, the clues are the problem\'s wording and its size limits, and the tools are these patterns.',
    keyPoints: [
      'Start with a simple brute force, state its cost, then find the repeated work to remove.',
      'Clues pick the pattern: seen before means hash, sorted means two pointers, top k means heap.',
      'Size limits are clues too: with about 100,000 items, an O(n^2) solution is too slow.',
    ],
    types: [
      {
        title: 'Core problem-solving patterns',
        items: [
          { name: 'Hashing', simple: 'Remember what you have seen in a notebook so you never search again, like a guest list at the door.' },
          { name: 'Two pointers', simple: 'Two fingers moving through a sorted list from both ends until they meet.' },
          { name: 'Sliding window', simple: 'A caterpillar crawling along: the head moves forward, the tail catches up when needed.' },
          { name: 'Prefix sums', simple: 'Running totals on a receipt, so any range total is one subtraction.' },
          { name: 'BFS', simple: 'Ripples in a pond: explore everything one step away, then two steps, so you find the shortest route.' },
          { name: 'DFS and backtracking', simple: 'Walking a maze: follow one path to the end, then step back and try the next turn.' },
          { name: 'Heap / top-k', simple: 'Keep a small podium of the best k so far and kick off the weakest when someone better arrives.' },
          { name: 'Greedy', simple: 'Always grab the best-looking option right now, like paying with the biggest coin first; works only when provably safe.' },
        ],
      },
      {
        title: 'Two-pointer variants',
        items: [
          { name: 'Opposite ends', simple: 'Two people walking toward each other from both ends of a sorted line.' },
          { name: 'Slow and fast', simple: 'A tortoise and a hare on the same track; if there is a loop, the hare catches the tortoise.' },
          { name: 'Two sequences', simple: 'One finger on each of two sorted lists, merging them like shuffling two sorted card piles.' },
        ],
      },
    ],
    confusion: {
      mixedUpWith: 'memorising solutions',
      difference: 'Memorising answers only helps for the exact same problem. Learning patterns helps you recognise new problems that share the same shape.',
    },
    tryIt: 'Solve "two numbers in an array that add up to a target" twice: first with two nested loops, then with one loop and a `HashMap` of numbers already seen. Count how many steps each takes for 10 numbers.',
    recall: [
      { question: 'Which pattern fits "find a pair in a sorted array"?', answer: 'Two pointers, one at each end, moving toward each other.' },
      { question: 'Which pattern fits "shortest path in an unweighted grid"?', answer: 'Breadth-first search (BFS).' },
      { question: 'What is the first step before choosing a pattern?', answer: 'Clarify the problem and state a brute-force solution with its cost.' },
    ],
    picture: {
      title: 'Read the job, pick the tool',
      caption: 'The problem gives a clue (is it sorted?), and the clue points to the pattern, here two pointers.',
      items: [
        { icon: 'question', label: 'Problem', x: 13, y: 22, tone: 'warning' },
        { icon: 'magnifier', label: 'Clue: sorted?', x: 50, y: 22, tone: 'neutral' },
        { icon: 'wrench', label: 'Two pointers', x: 87, y: 22, tone: 'success' },
      ],
      arrows: [
        { from: 0, to: 1, label: 'read' },
        { from: 1, to: 2 },
      ],
    },
  },
  'a-recursion-dp': {
    oneLiner: 'Recursion solves a big problem through smaller copies of itself; dynamic programming remembers each small answer so it is solved once.',
    story:
      'You want to know how many ways there are to climb 10 stairs, taking 1 or 2 steps at a time. You ask: the ways to reach step 10 are the ways to reach step 9 plus the ways to reach step 8. Each of those asks the same question about smaller steps, until you reach the bottom, where the answer is obvious. That bottom is the base case. But step 5 gets asked about again and again. So you write each answer on a sticky note the first time and just read the note later. In Java, the method calling itself is recursion, and the sticky notes are a memo, often a `HashMap` or an array.',
    keyPoints: [
      'Every recursive method needs a base case that answers directly, or it ends with `StackOverflowError`.',
      'Dynamic programming fits when the same smaller problems repeat and their best answers build the big answer.',
      'Top-down DP is recursion plus a memo; bottom-up DP fills a table from the base cases upward.',
    ],
    types: [
      {
        title: 'Types of recursion',
        items: [
          { name: 'Direct recursion', simple: 'A method calls itself, like a Russian doll that contains a smaller copy of itself.' },
          { name: 'Indirect (mutual) recursion', simple: 'Two methods call each other in turn, like two friends passing a message back and forth.' },
          { name: 'Tail recursion', simple: 'The call to itself is the very last thing done; Java still uses a stack frame for it.' },
          { name: 'Tree recursion', simple: 'Each call makes several calls, like a family tree branching out; it can explode in size.' },
        ],
      },
      {
        title: 'Dynamic programming approaches',
        items: [
          { name: 'Top-down (memoisation)', simple: 'Solve recursively but write each answer on a sticky note so you never work it out twice.' },
          { name: 'Bottom-up (tabulation)', simple: 'Fill in a table from the smallest cases upward, like building a staircase one step at a time.' },
          { name: 'Space-optimised', simple: 'Keep only the last couple of answers you need, like remembering just the previous two steps.' },
        ],
      },
    ],
    confusion: {
      mixedUpWith: 'plain recursion',
      difference: 'Plain recursion may solve the same small problem many times. Dynamic programming stores each answer so every small problem is solved only once.',
    },
    tryIt: 'Write a recursive `fib(int n)` and time `fib(40)`. Then add a `long[]` memo that stores each answer the first time, run it again, and compare the time.',
    recall: [
      { question: 'What is a base case?', answer: 'The smallest version of the problem, which the method answers directly without calling itself.' },
      { question: 'What two signs tell you dynamic programming will help?', answer: 'Overlapping subproblems that repeat, and optimal substructure, where best small answers build the best big answer.' },
      { question: 'Does Java remove the extra stack frames of tail calls?', answer: 'No. Java does no tail-call elimination, so very deep recursion can overflow the stack.' },
    ],
    picture: {
      title: 'Smaller stairs, saved answers',
      caption: 'The big climb asks a smaller climb, down to the base case. Each answer is saved on a note (the memo) so it is never worked out twice.',
      items: [
        { icon: 'ladder', label: 'n stairs', x: 13, y: 18, tone: 'primary' },
        { icon: 'ladder', label: 'n-1 stairs', x: 50, y: 18, size: 0.8, tone: 'primary' },
        { icon: 'flag', label: 'Base case', x: 87, y: 18, tone: 'success' },
        { icon: 'note', label: 'Memo', x: 50, y: 50, size: 0.7, tone: 'accent' },
      ],
      arrows: [
        { from: 0, to: 1, label: 'ask' },
        { from: 1, to: 2 },
        { from: 1, to: 3, label: 'save', dashed: true },
      ],
    },
  },
};
