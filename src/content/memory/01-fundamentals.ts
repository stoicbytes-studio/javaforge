import type { MemoryAid } from '@/types/curriculum';

/** "Make it stick" memory aids for the Java fundamentals module, keyed by lesson id. */
export const fundamentalsMemory: Record<string, MemoryAid> = {
  'f-first-program': {
    oneLiner: 'You write Java once, `javac` turns it into bytecode, and a JVM on any computer runs that bytecode.',
    story:
      'Think of a chef who writes a recipe in their own notebook. Before sharing it, they copy it onto a standard recipe card that every kitchen in the world can read. Now any kitchen, in any country, can cook the dish without the chef being there. In Java, your notebook is `Main.java`, the copying step is `javac`, the recipe card is `Main.class` (bytecode), and each kitchen is a JVM installed on Windows, Mac or Linux. You copy the recipe once; every kitchen cooks it.',
    keyPoints: [
      '`javac Main.java` checks your code and creates `Main.class`, which is bytecode, not machine code.',
      '`java Main` starts a JVM, which loads that bytecode and runs it on this computer.',
      'Execution starts at `main`, and a public class must live in a file with the same name.',
    ],
    types: [
      {
        title: 'Ways to run a Java program',
        items: [
          { name: '`javac` then `java`', simple: 'Copy the recipe onto a card first, then cook from the card. The normal way for real projects.' },
          { name: '`java Main.java`', simple: 'Hand the notebook straight to the kitchen; it copies and cooks in one go. Handy for small programs.' },
          { name: 'Executable JAR', simple: 'A sealed box of recipe cards with a note saying which one to start with. How apps are shipped.' },
          { name: 'JShell', simple: 'Tasting as you cook: type one line of Java and see the result straight away.' },
          { name: 'Native image', simple: 'A ready-made meal: compiled ahead of time for one kind of computer, so it starts instantly without a JVM.' },
        ],
      },
    ],
    confusion: {
      mixedUpWith: 'the JDK and the JRE',
      difference: 'The JDK is the full toolbox for developers and includes `javac`. A runtime only runs bytecode. Since Java 11 you simply install a JDK, which contains everything.',
    },
    tryIt: 'Create `Hello.java` with a `main` method that prints your name. Run `java Hello.java` from the terminal, then rename the class without renaming the file and read the error.',
    recall: [
      { question: 'What file does `javac` produce from `Main.java`?', answer: '`Main.class`, which contains bytecode that any JVM can run.' },
      { question: 'Why can the same `.class` file run on Windows and Linux?', answer: 'Because each operating system has its own JVM, and every JVM understands the same bytecode.' },
      { question: 'Where does a Java program start running?', answer: 'In the `main` method of the class you launch.' },
    ],
    picture: {
      title: 'One recipe card, every kitchen',
      caption: 'The chef copies the recipe once (compile). Any kitchen in any country can cook from the card (run on any JVM).',
      items: [
        { icon: 'chef', label: 'Your code', x: 13, y: 18, tone: 'primary' },
        { icon: 'recipe', label: 'javac', x: 50, y: 18, tone: 'neutral' },
        { icon: 'note', label: 'Main.class', x: 50, y: 45, tone: 'accent' },
        { icon: 'kitchen', label: 'Windows JVM', x: 82, y: 9, size: 0.8, tone: 'success' },
        { icon: 'kitchen', label: 'Mac JVM', x: 82, y: 31, size: 0.8, tone: 'success' },
        { icon: 'kitchen', label: 'Linux JVM', x: 82, y: 50, size: 0.7, tone: 'success' },
      ],
      arrows: [
        { from: 0, to: 1, label: 'compile' },
        { from: 1, to: 2 },
        { from: 2, to: 3 },
        { from: 2, to: 4, label: 'run' },
        { from: 2, to: 5 },
      ],
    },
  },
  'f-types-operators': {
    oneLiner: 'Java has eight primitive types, each a box of fixed size, and numbers that outgrow their box wrap around.',
    story:
      'Picture a moving company with storage boxes in fixed sizes: tiny, small, medium and large. Each box only holds so much, and the sizes are the same in every city. In Java, the boxes are the eight primitive types, such as `byte` (8 bits), `int` (32 bits) and `long` (64 bits). The box stores the value itself. Now picture the mileage counter in an old car. When it passes its top number it rolls back to the start. An `int` does the same: one past its maximum, it quietly jumps to a big negative number. That is called overflow.',
    keyPoints: [
      'The eight primitives are `byte`, `short`, `int`, `long`, `float`, `double`, `char` and `boolean`, with the same size everywhere.',
      'Whole-number types wrap silently on overflow: `Integer.MAX_VALUE + 1` becomes `Integer.MIN_VALUE`.',
      'Dividing two `int` values drops the remainder, so `7 / 2` is `3`, while `7 / 2.0` is `3.5`.',
    ],
    confusion: {
      mixedUpWith: '`=` and `==`',
      difference: 'A single `=` stores a value in a variable. A double `==` asks whether two values are equal and gives `true` or `false`.',
    },
    tryIt: 'Open `jshell` and type `Integer.MAX_VALUE + 1`, then `7 / 2`, then `7 / 2.0`. Predict each answer before you press Enter.',
    recall: [
      { question: 'What happens when an `int` goes past its largest value?', answer: 'It wraps around to the most negative `int`, with no error or warning.' },
      { question: 'What is `7 / 2` in Java?', answer: '`3`, because dividing two whole numbers throws away the remainder.' },
      { question: 'Which primitive type holds `true` or `false`?', answer: 'The `boolean` type.' },
    ],
    picture: {
      title: 'Fixed boxes, rolling counter',
      caption: 'Each primitive type is a box of a fixed size. Push too much into an `int` box and the counter rolls over, like an old mileage counter.',
      items: [
        { icon: 'box', label: 'byte: 8 bits', x: 15, y: 12, size: 0.7, tone: 'neutral' },
        { icon: 'box', label: 'int: 32 bits', x: 50, y: 12, size: 0.9, tone: 'primary' },
        { icon: 'box', label: 'long: 64 bits', x: 85, y: 12, size: 1.1, tone: 'accent' },
        { icon: 'calculator', label: '7 / 2 is 3', x: 22, y: 46, size: 0.8, tone: 'neutral' },
        { icon: 'warning', label: 'MAX + 1 wraps', x: 75, y: 46, size: 0.8, tone: 'danger' },
      ],
      arrows: [
        { from: 0, to: 1 },
        { from: 1, to: 2 },
        { from: 1, to: 4, label: 'too big', dashed: true },
      ],
    },
  },
  'f-type-conversion': {
    oneLiner: 'Small into big is automatic and safe; big into small needs a cast and can lose part of the value.',
    story:
      'Think of pouring water. Pouring a small cup into a big bucket is always safe, so nobody has to ask. Pouring a big bucket into a small cup is risky, so you must say "I know what I am doing" first, and some water may spill. In Java, the cup is a small type like `int`, the bucket is a big type like `double`, and saying "I know" is a cast, written `(int)`. The spill is lost data: `(int) 3.9` keeps only `3`. A label that says "42" on a jar is not water at all. Text must be read, or parsed, into a number.',
    keyPoints: [
      'Widening, such as `int` to `long` or `double`, happens automatically because the value always fits.',
      'Narrowing needs a cast and can change the value: `(int) 3.9` is `3` and `(byte) 200` is `-56`.',
      'Text is not converted by a cast; use `Integer.parseInt("42")` to turn a `String` into an `int`.',
    ],
    confusion: {
      mixedUpWith: 'casting and parsing',
      difference: 'A cast changes one number type into another. Parsing reads the digits inside a `String`. `(int) "42"` does not even compile.',
    },
    tryIt: 'In `jshell`, type `(int) 3.99`, then `(byte) 200`, then `Integer.parseInt("42") + 1`. Before each one, guess the answer and see if you were right.',
    recall: [
      { question: 'Which direction needs a cast: `int` to `double`, or `double` to `int`?', answer: '`double` to `int`, because the decimal part may be lost.' },
      { question: 'What does `(int) 3.9` give?', answer: '`3`. The cast cuts off the decimals; it does not round.' },
      { question: 'How do you turn the text "42" into an `int`?', answer: 'Call `Integer.parseInt("42")`.' },
    ],
    picture: {
      title: 'Cups, buckets and spills',
      caption: 'A small cup pours safely into a big bucket (widening). Pouring back into a cup needs a cast and spills the decimals (narrowing). Text must be parsed first.',
      items: [
        { icon: 'bucket', label: 'small int', x: 12, y: 11, size: 0.8, tone: 'primary' },
        { icon: 'bucket', label: 'big double', x: 50, y: 11, size: 1, tone: 'accent' },
        { icon: 'bucket', label: 'cast to int', x: 88, y: 11, size: 0.8, tone: 'warning' },
        { icon: 'warning', label: 'decimals lost', x: 85, y: 47, size: 0.8, tone: 'danger' },
        { icon: 'tag', label: '"42" is text', x: 12, y: 47, size: 0.8, tone: 'neutral' },
      ],
      arrows: [
        { from: 0, to: 1, label: 'auto' },
        { from: 1, to: 2, label: 'cast' },
        { from: 2, to: 3, dashed: true },
        { from: 4, to: 0, label: 'parse' },
      ],
    },
  },
  'f-control-flow': {
    oneLiner: 'Control flow decides which lines run: `if` picks a road, loops go around again, `switch` picks by value.',
    story:
      'Imagine driving through a town. At a signpost you choose one road based on a yes or no question, such as "Is the bridge open?" That is `if` and `else`. At a roundabout you can keep going around while something is true, and leave when it becomes false. That is a loop: `for`, `while` or `do-while`. At a big junction with many signs, the sign for your exact destination sends you down one lane. That is `switch`. Taking the exit early is `break`, and skipping to the next lap is `continue`.',
    keyPoints: [
      '`if` and `else` run one branch, chosen by a `boolean` condition that is either `true` or `false`.',
      'Use `for` when you know the count, `while` to wait for a condition, `do-while` to run at least once.',
      'Arrow labels `case X ->` never fall through; old `case X:` labels need `break` to stop.',
    ],
    confusion: {
      mixedUpWith: '`while` and `do-while`',
      difference: 'A `while` loop checks its condition first and may run zero times. A `do-while` runs its body once before checking.',
    },
    tryIt: 'Write `for (int i = 1; i <= 5; i++) System.out.println(i);` and run it. Then change `<=` to `<` and predict what disappears before you run it again.',
    recall: [
      { question: 'Which loop always runs its body at least once?', answer: '`do-while`, because it checks the condition after the body.' },
      { question: 'What happens in a classic `switch` if you forget `break`?', answer: 'Execution falls through into the next case and runs its code too.' },
      { question: 'What does `continue` do inside a loop?', answer: 'It skips the rest of this round and starts the next one.' },
    ],
    picture: {
      title: 'Signposts and roundabouts',
      caption: 'The program reaches a signpost (`if`) and takes one road, or circles a roundabout (a loop) until the condition is false. Both roads lead on to the next line.',
      items: [
        { icon: 'road', label: 'your program', x: 13, y: 29, size: 0.9, tone: 'neutral' },
        { icon: 'signpost', label: 'if: pick a road', x: 50, y: 12, size: 0.8, tone: 'primary' },
        { icon: 'recycle', label: 'loop: go again', x: 50, y: 46, size: 0.8, tone: 'accent' },
        { icon: 'flag', label: 'next line', x: 87, y: 29, size: 0.9, tone: 'success' },
      ],
      arrows: [
        { from: 0, to: 1 },
        { from: 0, to: 2 },
        { from: 1, to: 3 },
        { from: 2, to: 3 },
      ],
    },
  },
  'f-methods': {
    oneLiner: 'A method is a named job; you hand it copies of your values and it can hand back one result.',
    story:
      'Think of a print shop counter. You give the clerk a photocopy of your note, not the original. The clerk does the job and hands you back one finished item. Whatever the clerk scribbles on the photocopy, your original note stays the same. In Java, the counter is a method, the photocopy is a parameter, and the finished item is the return value. If your note holds a home address, the clerk can still visit that house and paint the door. In Java, that note is a reference: the method can change the object it points to, but never your own variable.',
    keyPoints: [
      'A method has a name, parameters and a return type; `void` means it hands nothing back.',
      'The signature is the name plus the parameter types; overloads differ in parameter types, not return type.',
      'Java always passes copies of values; for objects the copy is a reference to the same object.',
    ],
    confusion: {
      mixedUpWith: 'pass-by-reference',
      difference: 'Java never hands a method your variable itself. It hands over a copy of the value, even when that value is a reference.',
    },
    tryIt: 'Write `static void addOne(int x) { x++; }`. In `main`, set `int n = 5;`, call `addOne(n)`, then print `n`. Predict the number first, then run it.',
    recall: [
      { question: 'What two things make up a method signature?', answer: 'The method name and its parameter types.' },
      { question: 'Can a method change the caller\'s `int` variable by changing its parameter?', answer: 'No. The parameter is a copy, so the caller\'s variable keeps its value.' },
      { question: 'What does `void` mean on a method?', answer: 'The method returns no value.' },
    ],
    picture: {
      title: 'The print shop counter',
      caption: 'The caller hands over copies of its values, the method does its job, and one result comes back. The caller\'s originals never change.',
      items: [
        { icon: 'person', label: 'caller', x: 13, y: 29, size: 0.9, tone: 'primary' },
        { icon: 'copy', label: 'copied values', x: 50, y: 12, size: 0.8, tone: 'neutral' },
        { icon: 'shop', label: 'method', x: 87, y: 29, size: 0.9, tone: 'accent' },
        { icon: 'envelope', label: 'return value', x: 50, y: 46, size: 0.8, tone: 'success' },
      ],
      arrows: [
        { from: 0, to: 1 },
        { from: 1, to: 2 },
        { from: 2, to: 3 },
        { from: 3, to: 0 },
      ],
    },
  },
  'f-arrays-input': {
    oneLiner: 'An array is a fixed row of numbered slots starting at 0; `Scanner` reads what the user types.',
    story:
      'Picture a row of gym lockers built into a wall. The number of lockers is fixed when the wall is built, and the first one is number 0. Every locker starts empty. Ask for a locker number that does not exist, and the guard stops you. In Java, the wall is an array, each locker is an element, the empty start is the default value (`0`, `false` or `null`), and the guard is the bounds check that throws `ArrayIndexOutOfBoundsException`. Messages from the keyboard arrive at a mail slot, `System.in`, and a clerk called `Scanner` reads them for you.',
    keyPoints: [
      'An array has a fixed length chosen at creation, and every slot starts at `0`, `false` or `null`.',
      'Indexes run from 0 to `length - 1`; anything outside throws `ArrayIndexOutOfBoundsException`.',
      'Read keyboard input with `new Scanner(System.in)` and methods such as `nextInt()` and `nextLine()`.',
    ],
    confusion: {
      mixedUpWith: '`arr.length` and `text.length()`',
      difference: 'An array\'s `length` is a field written without brackets. A `String` uses the method `length()`, with brackets.',
    },
    tryIt: 'Write `int[] scores = new int[3];` and print `scores[0]`. Then print `scores[3]` and read the exception message. Which index was the last valid one?',
    recall: [
      { question: 'What is the index of the last element in an array of length 5?', answer: '4, because indexes start at 0.' },
      { question: 'What value does each slot of a new `int[]` start with?', answer: 'Every slot starts at `0`.' },
      { question: 'Which class is commonly used to read numbers typed on the keyboard?', answer: '`Scanner`, created with `new Scanner(System.in)`.' },
    ],
    picture: {
      title: 'A wall of numbered lockers',
      caption: 'Lockers 0, 1 and 2 exist; locker 3 does not, so the guard stops you. Keyboard input arrives through `System.in` and `Scanner` reads it.',
      items: [
        { icon: 'drawer', label: '[0]', x: 12, y: 12, size: 0.8, tone: 'primary' },
        { icon: 'drawer', label: '[1]', x: 30, y: 12, size: 0.8, tone: 'primary' },
        { icon: 'drawer', label: '[2]', x: 48, y: 12, size: 0.8, tone: 'primary' },
        { icon: 'cross', label: '[3] blocked', x: 82, y: 12, size: 0.8, tone: 'danger' },
        { icon: 'mailbox', label: 'System.in', x: 20, y: 46, size: 0.8, tone: 'neutral' },
        { icon: 'person', label: 'Scanner reads', x: 70, y: 46, size: 0.8, tone: 'accent' },
      ],
      arrows: [
        { from: 2, to: 3, label: 'out', dashed: true },
        { from: 4, to: 5, label: 'nextInt' },
      ],
    },
  },
};
