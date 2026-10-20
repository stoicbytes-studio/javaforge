import type { MemoryAid } from '@/types/curriculum';

/** "Make it stick" memory aids for module 4 (strings, wrappers, generics and modern types), keyed by lesson id. */
export const typesMemory: Record<string, MemoryAid> = {
  't-strings': {
    oneLiner: 'A `String` is a printed sign: it never changes, so every edit gives you a brand new sign.',
    story:
      'Picture a shop that orders printed signs. Once a sign is printed, nobody can change a letter on it. If the owner wants "Open late" instead of "Open", the printer makes a new sign, and the old one is still the same. Because signs never change, the shop keeps one copy of each common sign on a shared shelf and lends it to everyone. In Java, each sign is a `String`, the shared shelf is the string pool, and changing text with `+` or `toUpperCase()` returns a new `String`. When you need to build a long sign letter by letter, you use a whiteboard first: that is `StringBuilder`.',
    keyPoints: [
      'A `String` is immutable: methods like `trim()` or `replace()` return a new string and leave the old one alone.',
      'Compare text with `equals`, not `==`, because `==` only asks if both are the same object.',
      'Use `StringBuilder` to build text in a loop, then call `toString()` once at the end.',
    ],
    types: [
      {
        title: 'Ways to compare strings',
        items: [
          { name: '`==`', simple: 'Asks "is this the very same sign?", not "does it say the same words?". Wrong for comparing text.' },
          { name: '`equals`', simple: 'Reads both signs letter by letter: same words and same capitals means equal. The normal way to compare text.' },
          { name: '`equalsIgnoreCase`', simple: 'Same words count as equal even if the capitals differ, so "HELLO" equals "hello".' },
          { name: '`compareTo`', simple: 'Says which word comes first in dictionary-like order; capital letters sort before small letters.' },
          { name: '`Objects.equals`', simple: 'Like equals, but it does not crash when one or both values are missing (null).' },
        ],
      },
      {
        title: 'String vs StringBuilder vs StringBuffer',
        items: [
          { name: '`String`', simple: 'A printed sign: it never changes, and every edit prints a brand new sign.' },
          { name: '`StringBuilder`', simple: 'A whiteboard: write, erase and add as much as you like, then print the final sign once.' },
          { name: '`StringBuffer`', simple: 'A whiteboard with a lock, so only one person writes at a time. Slower and rarely needed.' },
        ],
      },
      {
        title: 'Ways to create a String',
        items: [
          { name: 'String literal', simple: 'Writing "java" in quotes. Every identical literal shares one sign from the shop window, the string pool.' },
          { name: '`new String(...)`', simple: 'Forces a brand new copy of the sign even when an identical one exists. Almost never useful.' },
          { name: 'Text block (Java 15)', simple: 'A sign with several lines, written between triple quotes. Handy for JSON or SQL.' },
          { name: 'Built at run time', simple: 'Joining pieces while the program runs makes a fresh sign that is not in the pool.' },
        ],
      },
    ],
    confusion: {
      mixedUpWith: '`==` and `equals`',
      difference: '`==` checks whether two variables point to the very same object, while `equals` checks whether the characters inside are the same.',
    },
    tryIt: 'Write `String s = "java"; s.toUpperCase(); System.out.println(s);` and run it. It still prints `java`. Now change it to `s = s.toUpperCase();` and run it again.',
    recall: [
      { question: 'What happens to the original string when you call `replace` on it?', answer: 'Nothing. It stays the same, and `replace` returns a new `String` with the change.' },
      { question: 'Which method should you use to compare the text of two strings?', answer: '`equals`, because `==` only compares whether they are the same object.' },
      { question: 'What should you use to build a long string inside a loop?', answer: 'A `StringBuilder`, which can be changed in place, then `toString()` at the end.' },
    ],
    picture: {
      title: 'Signs are never repainted',
      caption: 'Changing a `String` prints a new sign and leaves the old one as it was. A `StringBuilder` is the whiteboard you can edit before printing.',
      items: [
        { icon: 'note', label: '"Open"', x: 13, y: 16, tone: 'accent' },
        { icon: 'note', label: '"Open late"', x: 80, y: 16, tone: 'accent' },
        { icon: 'puzzle', label: 'StringBuilder', x: 16, y: 45, size: 0.9, tone: 'warning' },
        { icon: 'check', label: 'toString()', x: 80, y: 45, size: 0.9, tone: 'success' },
      ],
      arrows: [
        { from: 0, to: 1, label: 'new sign' },
        { from: 2, to: 3, label: 'print once' },
      ],
    },
  },

  't-wrappers': {
    oneLiner: 'A wrapper like `Integer` is a gift box around a primitive value, so it can go where only objects fit.',
    story:
      'Think of a post office that only ships boxes, never loose coins. To send a coin, you put it in a small gift box first. The person who receives it opens the box to get the coin out. In Java, the coin is a primitive like `int`, and the gift box is a wrapper object like `Integer`. Collections such as `List<Integer>` are the post office: they only take boxes. Java boxes and unboxes for you automatically. But be careful: two boxes can hold the same coin and still be two different boxes, and if someone sends an empty box (`null`), trying to take the coin out fails.',
    keyPoints: [
      'Each primitive has a wrapper class, for example `int` and `Integer`, or `boolean` and `Boolean`.',
      'Autoboxing turns `int` into `Integer` for you, and unboxing turns it back.',
      'Unboxing `null` throws `NullPointerException`, and `==` on wrappers compares boxes, not values.',
    ],
    types: [
      {
        title: 'The primitive / wrapper pairs',
        items: [
          { name: '`int` → `Integer`', simple: 'The everyday whole number in a box. Note the full name: Integer, not Int.' },
          { name: '`long` → `Long`', simple: 'A box for very big whole numbers, like a timestamp or a database id.' },
          { name: '`double` → `Double`', simple: 'A box for numbers with decimals, like a weight of 2.5 kg.' },
          { name: '`boolean` → `Boolean`', simple: 'A box holding yes or no. Only two boxes exist, TRUE and FALSE, reused everywhere.' },
          { name: '`char` → `Character`', simple: 'A box holding one letter or symbol. The other irregular name to remember.' },
          { name: '`byte`, `short`, `float` → wrappers', simple: 'Boxes for small whole numbers and less precise decimals: Byte, Short and Float. Used less often.' },
        ],
      },
      {
        title: 'Ways to compare wrapper values',
        items: [
          { name: '`==` between two wrappers', simple: 'Asks "same box?", not "same coin inside?". Only small cached numbers seem to work, so it is a bug.' },
          { name: '`==` with a primitive', simple: 'Opens the box and compares the coins. Fine, unless the box is empty (null): then it crashes.' },
          { name: '`equals` / `Objects.equals`', simple: 'Compares the coins inside two boxes of the same kind; Objects.equals also copes with empty boxes.' },
          { name: '`Integer.compare`', simple: 'Says which number is smaller, safely, without the overflow that subtracting can cause.' },
        ],
      },
    ],
    confusion: {
      mixedUpWith: '`int` and `Integer`',
      difference: '`int` is a plain value that can never be null, while `Integer` is an object that can be null and can go into collections.',
    },
    tryIt: 'Run `Integer a = 1000, b = 1000; System.out.println(a == b); System.out.println(a.equals(b));`. Then try `Integer n = null; int x = n;` and read the error.',
    recall: [
      { question: 'Why can you not write `List<int>`?', answer: 'Generics only work with objects, so you use the wrapper type and write `List<Integer>`.' },
      { question: 'What happens when Java unboxes a `null` `Integer`?', answer: 'It throws a `NullPointerException`, because there is no value inside the box.' },
      { question: 'How should you compare two `Integer` objects?', answer: 'With `equals`, because `==` checks whether they are the same object.' },
    ],
    picture: {
      title: 'Coins travel in boxes',
      caption: 'The coin is an `int`. Boxing puts it in an `Integer` so a collection can carry it. An empty box (`null`) breaks when you try to unbox it.',
      items: [
        { icon: 'coin', label: 'int 5', x: 13, y: 16, tone: 'primary' },
        { icon: 'gift', label: 'Integer', x: 50, y: 16, tone: 'accent' },
        { icon: 'truck', label: 'List<Integer>', x: 85, y: 16, tone: 'success' },
        { icon: 'box', label: 'null box', x: 50, y: 45, size: 0.9, tone: 'warning' },
        { icon: 'warning', label: 'NPE', x: 85, y: 45, size: 0.9, tone: 'danger' },
      ],
      arrows: [
        { from: 0, to: 1, label: 'box' },
        { from: 1, to: 2 },
        { from: 3, to: 4, label: 'unbox' },
      ],
    },
  },

  't-generics': {
    oneLiner: 'Generics put a type label on a container, so the compiler stops the wrong things going in.',
    story:
      'Imagine a library with storage crates. Each crate has a label: "Books only". A guard at the door reads the label and refuses anything that is not a book, so later nobody has to check what they pull out. Once everything is checked and stored, the labels are peeled off to save space. In Java, the crate is a class like `List`, the label is the type argument in `List<String>`, and the guard is the compiler. Peeling off the labels is called type erasure: the checking happens when you compile, and at run time the list does not remember it was a `List<String>`.',
    keyPoints: [
      'Write the type in angle brackets, like `List<String>`, and you need no casts when reading.',
      'The compiler checks the types; at run time they are erased, so the JVM does not see them.',
      '`List<Integer>` is not a `List<Number>`; use `? extends` to read and `? super` to write.',
    ],
    types: [
      {
        title: 'Wildcards',
        items: [
          { name: '`?` (unbounded)', simple: 'A crate labelled "something". You can look inside, but you cannot add anything because you do not know what fits.' },
          { name: '`? extends T`', simple: 'A vending machine of Ts or their subtypes: you can take Ts out, but you cannot put anything in.' },
          { name: '`? super T`', simple: 'A donation bin for Ts: you can drop Ts in, but what comes out is just "some object".' },
        ],
      },
      {
        title: 'Generic forms',
        items: [
          { name: 'Generic class', simple: 'A box with a label slot: `Box<String>` holds only Strings, `Box<Integer>` only Integers.' },
          { name: 'Generic method', simple: 'A tool that adapts to whatever you hand it, like `first(list)` working for any kind of list.' },
          { name: 'Bounded type parameter', simple: 'A label saying "numbers only": with `T extends Number` you may call number methods on T.' },
          { name: 'Generic record', simple: 'A record with label slots, like `Pair<K, V>` holding any two kinds of value.' },
          { name: 'No primitive type arguments', simple: '`List<int>` is not allowed. Use `List<Integer>`, putting the coins in boxes first.' },
        ],
      },
    ],
    confusion: {
      mixedUpWith: 'a `List<Object>` that holds anything',
      difference: 'A `List<Object>` accepts any object, so you must cast when reading, while a `List<String>` lets the compiler check every value for you.',
    },
    tryIt: 'Write `List<String> names = new ArrayList<>(); names.add(42);` and compile it. Read the error, then change `42` to `"Ada"` and print `names.get(0).length()` with no cast.',
    recall: [
      { question: 'When are generic types checked?', answer: 'At compile time. At run time the type arguments are erased.' },
      { question: 'Is a `List<Integer>` a `List<Number>`?', answer: 'No. Generic types are invariant, so you would use `List<? extends Number>` to accept both.' },
    ],
    picture: {
      title: 'Labelled crates, checked at the door',
      caption: 'The label is the type argument. The guard is the compiler: it lets strings in and stops the number before the program ever runs.',
      items: [
        { icon: 'note', label: '"Ada"', x: 13, y: 12, size: 0.9, tone: 'success' },
        { icon: 'calculator', label: '42', x: 13, y: 44, size: 0.9, tone: 'danger' },
        { icon: 'shield', label: 'compiler', x: 50, y: 28, tone: 'accent' },
        { icon: 'box', label: 'List<String>', x: 85, y: 28, tone: 'primary' },
      ],
      arrows: [
        { from: 0, to: 2, label: 'ok' },
        { from: 1, to: 2, label: 'rejected', dashed: true },
        { from: 2, to: 3 },
      ],
    },
  },

  't-modern-types': {
    oneLiner: 'Modern Java lets you check a type, cast it and name it in one step with pattern matching.',
    story:
      'Picture a sorting desk at a post office. An old-style clerk looks at an item, says "this is a parcel", then opens a form to treat it as a parcel, then writes its name down: three steps. A modern clerk does it in one move: "if this is a parcel, call it `p` and use it". That one move is pattern matching. The clerk\'s sorting table, where every kind of item has its own slot and none may be forgotten, is a `switch` with patterns. And the clerk who writes "same as the thing in my hands" instead of spelling out the item type is using `var`.',
    keyPoints: [
      '`var` (Java 10) lets the compiler infer a local variable\'s type; it is still fully typed.',
      '`if (obj instanceof String s)` (Java 16) tests, casts and names the value in one step.',
      '`switch` with type and record patterns (Java 21) must cover every possible case.',
    ],
    types: [
      {
        title: 'Pattern matching forms',
        items: [
          { name: '`instanceof` type pattern', simple: 'Check that it is a String and name it s in one move: `o instanceof String s`.' },
          { name: 'Type pattern in `switch`', simple: 'Sort values into branches by their kind, like a mail desk with one slot per parcel type.' },
          { name: 'Guarded case (`when`)', simple: 'A branch with an extra condition, such as only big numbers: `case Integer i when i > 100`.' },
          { name: 'Record pattern', simple: 'Opens a record and unpacks its parts onto labelled trays: `Point(int x, int y)`.' },
          { name: '`case null`', simple: 'An explicit slot for "nothing arrived", so a null value does not crash the switch.' },
          { name: 'Unnamed pattern `_` (Java 22)', simple: 'Says "I do not care about this part", like ignoring the return address on a parcel.' },
        ],
      },
      {
        title: 'Where var is allowed',
        items: [
          { name: 'Local variable with a value', simple: '`var list = new ArrayList<String>()`: the compiler reads the type from the right-hand side.' },
          { name: 'Loop variables', simple: 'In `for (var e : map.entrySet())` the compiler works out the element type for you.' },
          { name: 'Lambda parameters (Java 11)', simple: '`(var a, var b) -> a + b`, mainly so you can put annotations on the parameters.' },
          { name: 'Fields and method signatures', simple: 'Not allowed: they are the public shape of a class, so their types must be written out.' },
        ],
      },
    ],
    confusion: {
      mixedUpWith: '`var` as a dynamic type',
      difference: '`var` does not make a variable untyped: the compiler picks the exact type once, and it can never change afterwards.',
    },
    tryIt: 'Write `Object o = "hello";` then `if (o instanceof String s) System.out.println(s.length());`. Now change `o` to `42` and add an `else if (o instanceof Integer i)` branch that prints `i + 1`.',
    recall: [
      { question: 'What three things does `obj instanceof String s` do?', answer: 'It tests the type, casts the value and binds it to the new variable `s`.' },
      { question: 'Can a `var` variable later hold a value of a different type?', answer: 'No. Its type is fixed at compile time from the initial value.' },
    ],
    picture: {
      title: 'One look, one slot',
      caption: 'The clerk checks each item and names it in one move (`instanceof` pattern). Each kind gets its own slot, like the cases of a pattern `switch`.',
      items: [
        { icon: 'mailbox', label: 'Object o', x: 13, y: 28, tone: 'neutral' },
        { icon: 'magnifier', label: 'pattern', x: 47, y: 28, tone: 'accent' },
        { icon: 'envelope', label: 'String s', x: 85, y: 12, size: 0.9, tone: 'success' },
        { icon: 'box', label: 'Integer i', x: 85, y: 44, size: 0.9, tone: 'success' },
      ],
      arrows: [
        { from: 0, to: 1, label: 'check' },
        { from: 1, to: 2 },
        { from: 1, to: 3 },
      ],
    },
  },
};
