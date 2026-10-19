import type { MemoryAid } from '@/types/curriculum';

/** "Make it stick" memory aids for the Java platform module, keyed by lesson id. */
export const platformMemory: Record<string, MemoryAid> = {
  'p-jdk-jre-jvm': {
    oneLiner: 'The JVM runs bytecode, the JRE adds the standard library, and the JDK adds the developer tools.',
    story:
      'Think of a robot helper. Deep inside is its motor and brain, which follow instructions one at a time. That is the JVM, the engine that runs bytecode. On its own, the motor cannot do much. A robot sold for homes comes with the motor plus a shelf of ready-made skills, like counting and sorting. That is the JRE: the JVM plus the class library, such as `java.lang` and `java.util`. A robot workshop has all of that plus tools to write, test and pack new instructions. That is the JDK, with tools like `javac`, `jar` and `jshell`.',
    keyPoints: [
      'The JVM loads, checks and runs bytecode, and cleans up unused memory with the garbage collector.',
      'The JRE is the JVM plus the standard class library: enough to run programs, but not compile them.',
      'The JDK adds tools such as `javac`, `jar`, `jshell` and `jlink`; developers install a JDK.',
    ],
    confusion: {
      mixedUpWith: 'OpenJDK and the many JDK downloads',
      difference: 'OpenJDK is the shared open-source code. Builds such as Eclipse Temurin, Amazon Corretto and Oracle JDK are made from it and run the same bytecode.',
    },
    tryIt: 'Open a terminal and run `java -version`, then `javac -version`. If only the first one works, you have a runtime but no compiler. Note which vendor name appears in the output.',
    recall: [
      { question: 'Which one contains `javac`: the JVM, the JRE or the JDK?', answer: 'Only the JDK. The JRE and JVM can run programs but cannot compile them.' },
      { question: 'What does the JRE add on top of the JVM?', answer: 'The standard class library, such as `java.lang` and `java.util`.' },
      { question: 'Does code written for Temurin also run on Corretto?', answer: 'Yes. Both are builds of OpenJDK that pass the same compatibility tests.' },
    ],
    picture: {
      title: 'Motor, robot, workshop',
      caption: 'The motor (JVM) plus a shelf of skills (class library) makes a working robot (JRE). Add the building tools and you have the workshop (JDK).',
      items: [
        { icon: 'gear', label: 'JVM: engine', x: 13, y: 12, size: 0.8, tone: 'accent' },
        { icon: 'shelf', label: 'class library', x: 14, y: 46, size: 0.8, tone: 'neutral' },
        { icon: 'robot', label: 'JRE: runs apps', x: 50, y: 29, size: 0.9, tone: 'success' },
        { icon: 'wrench', label: 'javac, jar', x: 86, y: 12, size: 0.8, tone: 'warning' },
        { icon: 'factory', label: 'JDK: workshop', x: 86, y: 46, size: 0.8, tone: 'primary' },
      ],
      arrows: [
        { from: 0, to: 2 },
        { from: 1, to: 2 },
        { from: 2, to: 4 },
        { from: 3, to: 4 },
      ],
    },
  },
  'p-bytecode': {
    oneLiner: 'Bytecode is a booklet of tiny steps in a `.class` file that every JVM checks and then follows.',
    story:
      'Think of flat-pack furniture. It comes with a picture booklet of tiny numbered steps: pick up part A, pick up part B, join them. Anyone in any country can follow it, and it names parts by name, not by where they sit in your house. Before building, a careful helper checks that the steps make sense. In Java, the booklet is the `.class` file, each tiny step is a bytecode instruction like `iload` or `iadd`, and the parts are piled on a work table called the operand stack. The careful helper is the verifier inside the JVM.',
    keyPoints: [
      'Bytecode is the instruction set of the JVM, stored per method inside a `.class` file.',
      'It works like a stack: `iload` pushes a value, `iadd` pops two values and pushes their sum.',
      'The JVM verifies bytecode before running it, and everything is referred to by name, not memory address.',
    ],
    confusion: {
      mixedUpWith: 'machine code',
      difference: 'Machine code is for one kind of processor. Bytecode is for the JVM, which turns it into machine code on each computer.',
    },
    tryIt: 'Compile a class with `int add(int a, int b) { return a + b; }`, then run `javap -c` on it. Find `iload_1`, `iload_2`, `iadd` and `ireturn` in the output.',
    recall: [
      { question: 'What four bytes start every `.class` file?', answer: 'The magic number `0xCAFEBABE`.' },
      { question: 'What does the `iadd` instruction do?', answer: 'It pops two `int` values off the operand stack and pushes their sum.' },
      { question: 'Why can the same `.class` file run on any JVM?', answer: 'Bytecode is not tied to one processor, uses names instead of addresses, and every JVM checks and runs it the same way.' },
    ],
    picture: {
      title: 'One booklet, any builder',
      caption: 'The step booklet (`.class` bytecode) is checked first (verifier), then the builder piles parts on the work table (operand stack) to produce the result.',
      items: [
        { icon: 'blueprint', label: 'step booklet', x: 15, y: 12, size: 0.8, tone: 'accent' },
        { icon: 'magnifier', label: 'verifier', x: 50, y: 12, size: 0.8, tone: 'warning' },
        { icon: 'plates', label: 'operand stack', x: 87, y: 12, size: 0.8, tone: 'neutral' },
        { icon: 'check', label: 'push 2, 3, add: 5', x: 50, y: 46, size: 0.8, tone: 'success' },
      ],
      arrows: [
        { from: 0, to: 1 },
        { from: 1, to: 2, label: 'run' },
        { from: 2, to: 3 },
      ],
    },
  },
  'p-packages-classpath': {
    oneLiner: 'A package gives each class a full name; the classpath tells the JVM where to find class files.',
    story:
      'Picture a big library. Every book has a full shelf address, like "Science, Biology, Frogs". In Java, that address is the package, and the full name of a class is `com.shop.Invoice`. When you write a report, you may call the book just "Frogs" because you said which section you meant. That nickname is `import`: it only saves typing and fetches nothing. When someone asks for a book, the librarian checks the main shelves first, then the list of extra rooms. The librarian is the class loader, the main shelves are the JDK, and the list of rooms is the classpath.',
    keyPoints: [
      'A package groups classes and gives each a full name, like `com.shop.Invoice`, matching its folder path.',
      '`import` only lets you write the short name at compile time; it loads nothing at run time.',
      'At run time, class loaders find each class on first use, searching the JDK first, then the classpath.',
    ],
    confusion: {
      mixedUpWith: '`import` and the classpath',
      difference: '`import` is a typing shortcut for the compiler. The classpath is the list of folders and JARs the JVM searches for class files.',
    },
    tryIt: 'Put `package demo;` at the top of `Hello.java` inside a folder `demo`. From the parent folder run `javac demo/Hello.java` and `java demo.Hello`. Then try the same `java` command from inside `demo` and read the error.',
    recall: [
      { question: 'Does `import java.util.List;` load any class at run time?', answer: 'No. It only lets you write `List` instead of the full name in your source code.' },
      { question: 'What does the classpath tell the JVM?', answer: 'Which folders and JAR files to search for class files.' },
      { question: 'Where must the class `com.shop.Invoice` live on disk?', answer: 'In `com/shop/Invoice.class`, under a folder or JAR that is on the classpath.' },
    ],
    picture: {
      title: 'The librarian finds the book',
      caption: 'The librarian (class loader) checks the main shelves (the JDK) first, then the extra rooms (the classpath), and hands over the book with the full name.',
      items: [
        { icon: 'person', label: 'class loader', x: 15, y: 47, size: 0.8, tone: 'primary' },
        { icon: 'library', label: 'JDK shelves', x: 50, y: 47, size: 0.8, tone: 'accent' },
        { icon: 'shelf', label: 'classpath JARs', x: 85, y: 47, size: 0.8, tone: 'neutral' },
        { icon: 'book', label: 'com.shop.Invoice', x: 85, y: 11, size: 0.8, tone: 'success' },
        { icon: 'note', label: 'import: nickname', x: 18, y: 11, size: 0.8, tone: 'neutral' },
      ],
      arrows: [
        { from: 0, to: 1 },
        { from: 1, to: 2 },
        { from: 2, to: 3, label: 'found' },
      ],
    },
  },
  'p-java-releases': {
    oneLiner: 'A new Java release ships every six months, and some releases get long-term support for years.',
    story:
      'Imagine a magazine that prints a new issue every March and September, always on time. An article that is not ready simply waits for the next issue. A few issues are collector editions that shops keep fixing and reprinting for years. In Java, each issue is a feature release, and the collector editions are long-term support (LTS) releases: 8, 11, 17, 21 and 25. New ideas often first appear in a "try it" corner called preview. Readers must opt in with `--enable-preview`, and the idea may still change or be dropped before it becomes final.',
    keyPoints: [
      'Since Java 10, a feature release ships every six months, in March and September.',
      'LTS releases, such as 17, 21 and 25, get security updates from vendors for years.',
      'Preview features need `--enable-preview` and may change or vanish; final features stay.',
    ],
    confusion: {
      mixedUpWith: 'the latest release and an LTS release',
      difference: 'The latest release has the newest features but is replaced after six months. An LTS release keeps getting fixes for years.',
    },
    tryIt: 'Run `java -version` and read the first number. Is it an LTS release (8, 11, 17, 21 or 25)? Then look up which release comes out next March or September.',
    recall: [
      { question: 'How often does a new Java feature release come out?', answer: 'Every six months, in March and September.' },
      { question: 'Which flag do you need to use a preview feature?', answer: '`--enable-preview`, when compiling and when running.' },
      { question: 'Can you name two LTS releases of Java?', answer: 'For example 17 and 21. Others are 8, 11 and 25.' },
    ],
    picture: {
      title: 'A magazine that is never late',
      caption: 'A new issue (release) comes out every six months. Collector editions (LTS) are kept for years, and preview ideas must earn their place before they become final.',
      items: [
        { icon: 'calendar', label: 'March + Sept', x: 13, y: 12, size: 0.8, tone: 'neutral' },
        { icon: 'book', label: 'new release', x: 50, y: 12, size: 0.8, tone: 'primary' },
        { icon: 'medal', label: 'LTS: 21, 25', x: 86, y: 12, size: 0.8, tone: 'success' },
        { icon: 'question', label: 'preview: opt in', x: 25, y: 46, size: 0.8, tone: 'warning' },
        { icon: 'check', label: 'final: stays', x: 75, y: 46, size: 0.8, tone: 'success' },
      ],
      arrows: [
        { from: 0, to: 1 },
        { from: 1, to: 2 },
        { from: 1, to: 3, dashed: true },
        { from: 3, to: 4, label: 'later' },
      ],
    },
  },
};
