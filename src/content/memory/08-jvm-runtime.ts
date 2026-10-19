import type { MemoryAid } from '@/types/curriculum';

/** "Make it stick" memory aids for module 8 (JVM Runtime), keyed by lesson id. */
export const jvmRuntimeMemory: Record<string, MemoryAid> = {
  'r-memory-areas': {
    oneLiner: 'Each thread keeps its own small stack of notes, while all objects live together in one shared heap.',
    story:
      'Picture a busy office. Every worker has a private notepad on their desk with the job they are doing right now, and a bookmark showing which step they are on. Nobody else writes on that notepad. The real things, like files and parcels, sit in one big shared storeroom that every worker can reach. On a shelf by the door sit the rule books that describe each kind of thing. In Java, each worker is a thread, the notepad is its stack (one frame per method call, holding local variables), the bookmark is the program counter, the storeroom is the heap where every `new` object goes, and the rule-book shelf is Metaspace, where class information lives.',
    keyPoints: [
      'Per thread: a program counter and a stack of frames holding local variables and partial results.',
      'Shared by all threads: the heap for objects and arrays, cleaned by the garbage collector.',
      'Class information such as method bytecode lives in Metaspace, which is native memory outside the heap.',
    ],
    confusion: {
      mixedUpWith: 'where a local variable and its object live',
      difference: 'A local variable like `list` sits in the stack frame, but it only holds a reference; the `ArrayList` object itself is on the heap.',
    },
    tryIt: 'Write a method that calls itself forever and run it to see `StackOverflowError`. Then add objects to a `List` in an endless loop with `-Xmx16m` and watch for `OutOfMemoryError: Java heap space`.',
    recall: [
      { question: 'Which memory area is private to each thread?', answer: 'The stack (with its frames and local variables) and the program counter.' },
      { question: 'Where does an object created with `new` normally live?', answer: 'On the shared heap, where the garbage collector can reclaim it later.' },
      { question: 'What does Metaspace hold?', answer: 'Class metadata, such as method bytecode and constant pools, not the objects themselves.' },
    ],
    picture: {
      title: 'Private notepads, shared storeroom',
      caption: 'Each worker (thread) has a private notepad (stack). They all put real things (objects) in one shared storeroom (heap), and the rule books (class data) sit on their own shelf (Metaspace).',
      items: [
        { icon: 'note', label: 'Thread 1 stack', x: 16, y: 12, size: 0.8, tone: 'primary' },
        { icon: 'note', label: 'Thread 2 stack', x: 16, y: 44, size: 0.8, tone: 'primary' },
        { icon: 'boxes', label: 'Heap (shared)', x: 70, y: 12, size: 0.8, tone: 'success' },
        { icon: 'shelf', label: 'Metaspace', x: 70, y: 44, size: 0.8, tone: 'accent' },
      ],
      arrows: [
        { from: 0, to: 2, label: 'new' },
        { from: 1, to: 2 },
        { from: 2, to: 3, dashed: true },
      ],
    },
  },
  'r-class-loading': {
    oneLiner: 'A class loader asks its parent first, then the JVM loads, links and finally initialises the class once.',
    story:
      'Imagine asking a library front desk for a book called `Cart`. The junior librarian does not search right away. First they ask the senior librarian, who asks the head librarian, keeper of the core books like `String`. Only when the bosses say "not ours" does the junior fetch it from your own shelf. Next the book is checked for damage and space is made for its notes, with blank values. The first time someone really uses it, its setup page is read, exactly once. In Java, the librarians are class loaders (application, platform, bootstrap), asking upward is parent delegation, the damage check and blank notes are linking (verify, prepare static fields), and the setup page is the static initialiser.',
    keyPoints: [
      'Three steps: loading finds the bytes, linking verifies and prepares, initialising runs static code once.',
      'Parent delegation: a loader asks its parent first, so core classes always come from the bootstrap loader.',
      'A class is identified by its name plus the loader that defined it.',
    ],
    confusion: {
      mixedUpWith: 'loading and initialising',
      difference: 'Loading only reads the class bytes into the JVM. Static fields and `static {}` blocks run later, at initialisation, on first active use.',
    },
    tryIt: 'Add a `static {}` block that prints "init" to a class with a static method. Mention the class only in `Foo.class` and run; then call the static method and see when "init" prints.',
    recall: [
      { question: 'What are the three phases of getting a class ready?', answer: 'Loading, linking (verify, prepare, resolve) and initialisation.' },
      { question: 'Which loader does a request go to first under parent delegation?', answer: 'The parent loader, up to the bootstrap loader, before the child searches itself.' },
      { question: 'When does a static initialiser run?', answer: 'Once, on the first active use of the class, such as calling a static method or creating an instance.' },
    ],
    picture: {
      title: 'Ask the head librarian first',
      caption: 'The front desk (application loader) passes the request up to the senior (platform) and head (bootstrap) librarians. Only if they do not have it is your own class loaded, then linked and initialised.',
      items: [
        { icon: 'crown', label: 'Bootstrap', x: 13, y: 12, size: 0.8, tone: 'accent' },
        { icon: 'person', label: 'Platform', x: 50, y: 12, size: 0.8, tone: 'neutral' },
        { icon: 'person', label: 'App loader', x: 87, y: 12, size: 0.8, tone: 'primary' },
        { icon: 'check', label: 'Link + init', x: 50, y: 44, size: 0.8, tone: 'success' },
        { icon: 'book', label: 'Cart.class', x: 87, y: 44, size: 0.8, tone: 'primary' },
      ],
      arrows: [
        { from: 2, to: 1, label: 'ask' },
        { from: 1, to: 0, label: 'ask' },
        { from: 2, to: 4 },
        { from: 4, to: 3 },
      ],
    },
  },
  'r-gc': {
    oneLiner: 'The garbage collector keeps every object it can reach from the roots and frees the rest.',
    story:
      'Think of a cleaner in a huge shared storeroom. The cleaner does not guess what is rubbish. They start from a short list of things that are clearly in use, like the boxes on workers\' desks. They follow every label that says "this box points to that box" and put a sticker on each box they reach. Everything without a sticker is thrown away. New boxes are checked often, because most are short-lived; boxes that survive move to a long-term area. In Java, the cleaner is the garbage collector (GC), the starting list is the GC roots (live local variables, static fields), the labels are references, and the sticker step is marking.',
    keyPoints: [
      'An object is kept while it is reachable from a GC root, and freed once it is not.',
      'Most objects die young, so the young area is collected often and survivors are promoted.',
      'G1 is the default collector; ZGC and Shenandoah aim for very short pauses.',
    ],
    confusion: {
      mixedUpWith: 'a memory leak in Java',
      difference: 'A Java leak is an object you no longer need but still reference, for example in a static `Map`, so the GC must keep it.',
    },
    tryIt: 'Run a small program that creates many short-lived objects with `-Xlog:gc` and read the log lines that show young collections and pause times.',
    recall: [
      { question: 'What decides whether the GC can free an object?', answer: 'Whether it is still reachable by following references from a GC root.' },
      { question: 'Why are young objects collected separately?', answer: 'Most objects die young, so cleaning the young area often is cheap and frees a lot.' },
      { question: 'Does `System.gc()` force a collection?', answer: 'No, it is only a hint that the JVM may ignore.' },
    ],
    picture: {
      title: 'Follow the labels, bin the rest',
      caption: 'Starting from the roots, the cleaner follows references and marks what it reaches. The unreachable box goes in the bin (reclaimed memory).',
      items: [
        { icon: 'person', label: 'GC roots', x: 13, y: 12, size: 0.8, tone: 'accent' },
        { icon: 'box', label: 'Reachable', x: 50, y: 12, size: 0.8, tone: 'success' },
        { icon: 'box', label: 'Also kept', x: 87, y: 12, size: 0.8, tone: 'success' },
        { icon: 'box', label: 'Unreachable', x: 50, y: 44, size: 0.8, tone: 'danger' },
        { icon: 'trash', label: 'Freed', x: 87, y: 44, size: 0.8, tone: 'neutral' },
      ],
      arrows: [
        { from: 0, to: 1, label: 'ref' },
        { from: 1, to: 2, label: 'ref' },
        { from: 3, to: 4, label: 'GC' },
      ],
    },
  },
};
