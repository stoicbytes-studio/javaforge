import type { LessonConcepts } from '@/types/curriculum';

/** Concept pages for module 4 (Strings, Wrappers, Generics and the Type System), keyed by lesson id. */
export const typesConcepts: Record<string, LessonConcepts> = {
  // -------------------------------------------------------------------------
  't-strings': {
    textbook: {
      definition:
        'In Java, a **string** is an instance of the final class `java.lang.String`. It represents an **immutable** sequence of characters, encoded as **UTF-16 code units**. A string literal is a reference to a `String` instance. Literals and constant expressions with equal content are **interned**, so they refer to the same instance in a shared pool. A string\'s value cannot change after it is created. So operations that seem to change it return new instances. For mutable character sequences, Java provides `StringBuilder` and `StringBuffer`. Like `String`, they implement the **CharSequence** interface.',
      terms: [
        { term: 'Immutable object', meaning: 'An object whose visible state cannot change after its constructor finishes. Every change that seems to happen creates a new object instead.' },
        { term: 'UTF-16 code unit', meaning: 'A 16-bit value of type `char`. Characters outside the Basic Multilingual Plane, such as most emoji, need a surrogate pair of two code units.' },
        { term: 'Interning (string pool)', meaning: 'Keeping only one `String` instance for each distinct content, in a pool shared by the whole JVM. `intern()` returns the pooled instance equal to the string it is called on. If there is none yet, it adds this string first.' },
        { term: 'CharSequence', meaning: 'The read-only interface for sequences of `char` values, implemented by `String`, `StringBuilder`, `StringBuffer` and `CharBuffer`.' },
      ],
      source: 'JLS §3.10.5 and §4.3.3; Javadoc for java.lang.String',
    },
    interviewDefinition:
      'A Java `String` is a `final`, **immutable** sequence of UTF-16 code units. Since Java 9 it is stored as compact Latin-1 bytes when possible. Because it never changes, literals are **interned** in a shared string pool and the hash code is cached. Strings can also be shared freely across threads and used safely as map keys. Compare content with `equals` and order with `compareTo`. Build text step by step with `StringBuilder`.',
    interviewFollowUps: [
      {
        question: 'How many objects does `new String("java")` create?',
        answer: 'One new `String` object every time it runs. It also creates the pooled literal `"java"` if that literal has not been resolved yet. In modern JDKs the copy shares the literal\'s backing byte array. So the extra cost is mainly the object itself, which is why the constructor is almost never useful.',
      },
      {
        question: 'Why is `String` immutable and `final`?',
        answer: 'Security: class names, file paths and URLs cannot change after they are checked. It also gives thread safety without locks, safe hash caching for HashMap keys, and pooling of literals. `final` stops a subclass from adding mutable state and breaking those guarantees.',
      },
      {
        question: '`StringBuilder` vs `StringBuffer`?',
        answer: 'Same API, and both are mutable. `StringBuffer` (Java 1.0) synchronizes every method. `StringBuilder` (Java 5) does not, and it is the default choice, because builders are almost always used by only one thread.',
      },
      {
        question: 'Is `a + b + c` slow?',
        answer: 'Not in a single expression. Since Java 9 (JEP 280), it compiles to one `invokedynamic` call that sizes the result once. It is slow inside a loop (`s += x`). Each pass creates a new String and copies everything so far, so the total work is quadratic.',
      },
    ],
    mnemonic: {
      device: 'Strings are carved in STONE',
      expansion: [
        { key: 'S', meaning: 'Shared — identical literals point to one pooled object' },
        { key: 'T', meaning: 'Thread-safe — nothing can change, so no locking is needed' },
        { key: 'O', meaning: 'Original never changes — toUpperCase(), trim() return new strings' },
        { key: 'N', meaning: 'Never compare text with == (it compares objects)' },
        { key: 'E', meaning: 'Equals for content; compareTo for order; StringBuilder to edit' },
      ],
      visual: 'A sentence carved into a stone tablet: anyone can read it at the same time, nobody can edit it, and if you want different words you carve a new tablet — or draft on a whiteboard (StringBuilder) first.',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'The library and its one copy',
        body: 'The string pool is a library that keeps exactly one copy of every popular book (literal). `==` asks "are we holding the same physical copy?"; `equals` asks "do these contain the same words?". `new String("java")` is a photocopy: same words, different copy — so `==` says no.',
      },
      {
        kind: 'insight',
        title: 'Immutability is what makes Strings good map keys',
        body: 'A HashMap files each key in a bucket chosen by its hash code. If a key could change after insertion, its hash would change and the entry would become unreachable. Because a String cannot change, its hash is computed once, cached in the object, and stays valid forever.',
      },
      {
        kind: 'real-world',
        title: 'Why password APIs return char[]',
        body: 'Swing\'s `JPasswordField.getPassword()` and `Console.readPassword()` return `char[]`, not String. A String cannot be wiped: it stays in memory until garbage collected and may be pooled or appear in a heap dump. A `char[]` can be overwritten with `Arrays.fill(pw, \'\\0\')` as soon as it has been checked.',
      },
      {
        kind: 'angle',
        title: 'length() is not "number of characters a user sees"',
        body: '`length()` counts UTF-16 code units. An emoji such as 😀 is one code point but two code units; a family emoji is several code points joined into one visible symbol (a grapheme cluster). Truncating user text with `substring` can cut a surrogate pair in half and produce garbage. Use `codePoints()` or `java.text.BreakIterator` for user-visible text.',
      },
    ],
    diagrams: [
      {
        id: 't-strings-pool',
        kind: 'concept',
        title: 'Literals share; new String copies',
        caption: 'a and b hold references to the same pooled object, so a == b is true. c refers to a separate object with the same characters, so a == c is false while a.equals(c) is true. c.intern() hands back the pooled copy.',
        explanation: [
          'Read the **Local variables** group on the left first. **a = "java"** and **b = "java"** use the same string literal. **c = new String(...)** explicitly asks for a new object.',
          'The literal refers to one **"java"** instance in the **String pool (in the heap)**. Both a and b store a reference to that same object. That is why `a == b` is true.',
          '**c = new String(...)** always creates a separate **"java"** object in the ordinary **Heap**. It has the same characters but a different identity. So `a == c` is false, while `a.equals(c)` is true.',
          'The dashed arrow labelled `c.intern()` is the way back. intern looks for equal content in the pool and returns the pooled instance. So `c.intern() == a` is true.',
          'Takeaway: `==` asks whether two references point at the same object, while `equals` asks whether the text is the same. Always compare string content with `equals`.',
        ],
        cols: 3,
        rows: 3,
        nodes: [
          { id: 'ts-a', label: 'a = "java"', detail: 'string literal', col: 0, row: 0, tone: 'primary' },
          { id: 'ts-b', label: 'b = "java"', detail: 'same literal again', col: 0, row: 1, tone: 'primary' },
          { id: 'ts-c', label: 'c = new String(...)', detail: 'always a new object', col: 0, row: 2, tone: 'warning' },
          { id: 'ts-pooled', label: '"java"', detail: 'one pooled instance', col: 2, row: 0, shape: 'cylinder', tone: 'success' },
          { id: 'ts-copy', label: '"java"', detail: 'separate String object', col: 2, row: 2, shape: 'cylinder', tone: 'neutral' },
        ],
        edges: [
          { from: 'ts-a', to: 'ts-pooled', label: 'refers to' },
          { from: 'ts-b', to: 'ts-pooled', label: 'same object' },
          { from: 'ts-c', to: 'ts-copy', label: 'refers to' },
          { from: 'ts-copy', to: 'ts-pooled', label: 'c.intern()', dashed: true },
        ],
        groups: [
          { label: 'Local variables', fromCol: 0, toCol: 0, fromRow: 0, toRow: 2, tone: 'neutral' },
          { label: 'String pool (in the heap)', fromCol: 2, toCol: 2, fromRow: 0, toRow: 0, tone: 'success' },
          { label: 'Heap', fromCol: 2, toCol: 2, fromRow: 2, toRow: 2, tone: 'accent' },
        ],
      },
      {
        id: 't-strings-builder-choice',
        kind: 'flow',
        title: 'Choosing how to build text',
        caption: 'Plain + is fine inside one expression. Loops need a mutable builder; StringBuffer is only for the rare builder shared between threads.',
        explanation: [
          'Start at **Need to build text**, then ask **One expression?** Is every part joined in a single statement with no loop? If so, follow yes to **+ or formatted()**. The compiler already turns that into one efficient concatenation.',
          'If not, ask **Joining a list?** For a collection of parts with a delimiter (separator), follow yes to **String.join** (or `Collectors.joining`). It sizes and joins the result for you.',
          'Otherwise you are appending inside a loop, so ask **Shared by threads?** In almost all code the answer is no. That leads to **StringBuilder**, a mutable buffer without any locking.',
          'Follow yes to **StringBuffer** only when several threads really write to one builder. Its methods are all synchronized, so they are slower.',
          'Takeaway: plain + is fine within one expression. But `s += x` in a loop copies the whole string on every pass, so use a builder there.',
        ],
        cols: 3,
        rows: 3,
        nodes: [
          { id: 'tsb-start', label: 'Need to build text', col: 0, row: 0, shape: 'pill', tone: 'neutral' },
          { id: 'tsb-one', label: 'One expression?', detail: 'no loop involved', col: 1, row: 0, tone: 'warning' },
          { id: 'tsb-plus', label: '+ or formatted()', detail: 'compiler optimises it', col: 2, row: 0, tone: 'success' },
          { id: 'tsb-join', label: 'Joining a list?', detail: 'with a delimiter', col: 1, row: 1, tone: 'warning' },
          { id: 'tsb-joined', label: 'String.join', detail: 'or Collectors.joining', col: 2, row: 1, tone: 'success' },
          { id: 'tsb-shared', label: 'Shared by threads?', col: 1, row: 2, tone: 'warning' },
          { id: 'tsb-builder', label: 'StringBuilder', detail: 'the default choice', col: 2, row: 2, tone: 'success' },
          { id: 'tsb-buffer', label: 'StringBuffer', detail: 'synchronized, rare', col: 0, row: 2, tone: 'neutral' },
        ],
        edges: [
          { from: 'tsb-start', to: 'tsb-one' },
          { from: 'tsb-one', to: 'tsb-plus', label: 'yes' },
          { from: 'tsb-one', to: 'tsb-join', label: 'no' },
          { from: 'tsb-join', to: 'tsb-joined', label: 'yes' },
          { from: 'tsb-join', to: 'tsb-shared', label: 'no (loop)' },
          { from: 'tsb-shared', to: 'tsb-builder', label: 'no' },
          { from: 'tsb-shared', to: 'tsb-buffer', label: 'yes' },
        ],
      },
      {
        id: 't-strings-layout',
        kind: 'architecture',
        title: 'Inside a String object (Java 9+)',
        caption: 'Since compact strings, a String holds a byte array plus a coder flag. It uses one byte per character when all characters fit Latin-1, and two otherwise. The hash is computed only when first needed, then cached.',
        explanation: [
          'The top box is the **String object** itself. It is an instance of a final class whose fields are private and final. So nothing can change them after construction.',
          'The arrow to **byte[] value** shows where the characters live. Since Java 9 they are stored as bytes, not as a `char[]`. This saves memory for plain text.',
          '**byte coder** records how those bytes are encoded. LATIN1 uses one byte per character and UTF16 uses two. Methods check the coder and pick the matching implementation.',
          '**int hash** starts at zero. It is filled in the first time `hashCode()` is called. The content never changes, so the cached value stays correct forever.',
          'Takeaway: immutability makes compact storage and hash caching safe. It is also why strings work so well as map keys.',
        ],
        cols: 3,
        rows: 2,
        nodes: [
          { id: 'tsl-str', label: 'String object', detail: 'final class, private final fields', col: 0, row: 0, span: 3, tone: 'primary' },
          { id: 'tsl-value', label: 'byte[] value', detail: 'the encoded characters', col: 0, row: 1, shape: 'cylinder', tone: 'accent' },
          { id: 'tsl-coder', label: 'byte coder', detail: 'LATIN1 (1 byte/char) or UTF16 (2)', col: 1, row: 1, tone: 'neutral' },
          { id: 'tsl-hash', label: 'int hash', detail: 'cached on first hashCode()', col: 2, row: 1, tone: 'neutral' },
        ],
        edges: [
          { from: 'tsl-str', to: 'tsl-value' },
          { from: 'tsl-str', to: 'tsl-coder' },
          { from: 'tsl-str', to: 'tsl-hash' },
        ],
      },
    ],
    variants: [
      {
        title: 'Ways to create a String',
        intro: 'Only literals and compile-time constant expressions are pooled automatically; everything built at run time is a new object.',
        items: [
          { name: 'String literal', summary: 'Pooled: every occurrence of the same literal is the same object.', code: 'String s = "java";' },
          { name: 'new String(...)', summary: 'Always allocates a new object, even for a literal argument. Rarely useful.', code: 'String s = new String("java"); // s != "java"' },
          { name: 'Compile-time constant expression', summary: 'Literals and final constants joined with + are folded by javac and pooled.', code: 'final String a = "ja";\nString s = a + "va"; // pooled: s == "java"' },
          { name: 'Run-time concatenation or conversion', summary: 'Built while the program runs: a new, unpooled object.', code: 'String s = prefix + "va";\nString n = String.valueOf(42);' },
          { name: 'Text block (Java 15)', summary: 'A multi-line literal; also pooled.', code: 'String json = """\n    {"id": 1}\n    """;' },
          { name: 'From a builder or char[]', summary: 'StringBuilder.toString(), new String(char[]) and String.copyValueOf create new objects.', code: 'String s = new StringBuilder("ja").append("va").toString();' },
        ],
      },
      {
        title: 'Ways to compare strings',
        items: [
          { name: '==', summary: 'Compares references (same object?). Correct only for identity checks; a bug for text.', support: 'partial', note: 'Appears to work for literals because they are pooled.', code: 'a == b' },
          { name: 'equals', summary: 'Exact, case-sensitive character comparison.', support: 'supported', code: '"admin".equals(input) // null-safe order' },
          { name: 'equalsIgnoreCase', summary: 'Character comparison ignoring case (simple per-character case folding).', support: 'supported', code: '"Admin".equalsIgnoreCase("ADMIN") // true' },
          { name: 'compareTo', summary: 'Lexicographic order by UTF-16 code unit: negative, zero or positive. Uppercase sorts before lowercase.', support: 'supported', code: '"apple".compareTo("banana") < 0' },
          { name: 'compareToIgnoreCase / CASE_INSENSITIVE_ORDER', summary: 'Ordering that ignores case; the Comparator form plugs into sort.', support: 'supported', code: 'names.sort(String.CASE_INSENSITIVE_ORDER);' },
          { name: 'Objects.equals', summary: 'Null-safe equality for two variables that may both be null.', support: 'supported', code: 'Objects.equals(a, b)' },
          { name: 'Collator', summary: 'Locale-aware human sorting (accents, language rules).', support: 'supported', code: 'Collator.getInstance(Locale.FRENCH).compare(a, b)' },
        ],
      },
      {
        title: 'String vs StringBuilder vs StringBuffer',
        items: [
          { name: 'String', summary: 'Immutable; every "change" creates a new object. Thread-safe because nothing can change.', note: 'Use for values, keys and anything shared.' },
          { name: 'StringBuilder (Java 5)', summary: 'Mutable, resizable buffer with no synchronization. The default for building text in loops.', note: 'Methods return this, so calls chain.', code: 'new StringBuilder().append(x).append(\',\')' },
          { name: 'StringBuffer (Java 1.0)', summary: 'Same API as StringBuilder but every method is synchronized.', note: 'Legacy; only for a builder genuinely shared between threads.' },
        ],
      },
    ],
    deepDive: [
      {
        title: 'Compact strings halve memory for most text',
        body: 'Before Java 9 every String stored a `char[]` — two bytes per character even for plain ASCII. JEP 254 switched to a `byte[]` plus a `coder` field: Latin-1 text uses one byte per character, and only strings containing other characters use UTF-16. Because Strings are often the largest share of a heap, this commonly reduces heap usage noticeably with no code changes. Methods check the coder and dispatch to Latin-1 or UTF-16 implementations.',
        sources: [{ label: 'JEP 254: Compact Strings', url: 'https://openjdk.org/jeps/254' }],
      },
      {
        title: 'How + is compiled, and why loops are still quadratic',
        body: 'Since Java 9 (JEP 280), `a + b + c` compiles to a single `invokedynamic` call bootstrapped by `StringConcatFactory`, which computes the final size and copies each part once. But that optimisation is per expression: `s += x` in a loop is a new expression every iteration, each one copying the entire accumulated string. For n appends that is O(n²) character copies — the reason `StringBuilder` still matters.',
        sources: [
          { label: 'JEP 280: Indify String Concatenation', url: 'https://openjdk.org/jeps/280' },
          { label: 'JLS §15.18.1: String Concatenation Operator +', url: 'https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.18.1' },
        ],
      },
      {
        title: 'Pooling, interning and deduplication are different things',
        body: 'The JLS requires string literals and constant expressions to be interned (§3.10.5). Since Java 7 the pool lives in the ordinary heap, so interned strings can be garbage collected. `intern()` adds a run-time string to the pool but costs a hash-table lookup on every call. G1 string deduplication (JEP 192, `-XX:+UseStringDeduplication`) works differently: it makes equal String objects share one backing array during GC, leaving the objects themselves distinct — so it never changes `==` results.',
        sources: [
          { label: 'JLS §3.10.5: String Literals', url: 'https://docs.oracle.com/javase/specs/jls/se21/html/jls-3.html#jls-3.10.5' },
          { label: 'JEP 192: String Deduplication in G1', url: 'https://openjdk.org/jeps/192' },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  't-wrappers': {
    textbook: {
      definition:
        'A **wrapper class** is one of the eight final classes in `java.lang`: `Byte`, `Short`, `Integer`, `Long`, `Float`, `Double`, `Character` and `Boolean`. Each instance is an **immutable** object that holds a single value of the matching primitive type. The language converts between the two forms without you writing the conversion. **Boxing conversion** turns a primitive value into a wrapper instance. **Unboxing conversion** turns a wrapper into its primitive value, and throws `NullPointerException` for a null reference. The six numeric wrappers extend the abstract class `java.lang.Number`.',
      terms: [
        { term: 'Boxing conversion', meaning: 'Turning a primitive value into a reference to a wrapper object of the matching type. It compiles to a call such as `Integer.valueOf`.' },
        { term: 'Unboxing conversion', meaning: 'Turning a wrapper reference into its primitive value. It compiles to a call such as `intValue()`, and throws `NullPointerException` if the reference is null.' },
        { term: 'Boxing cache', meaning: 'The values for which boxing must return identical objects: `true`, `false`, every `byte`, `char` from 0 to 127, and `short` or `int` from -128 to 127.' },
        { term: 'Value-based class', meaning: 'A class whose instances are immutable and whose identity has no meaning. So programs must not rely on `==`, identity hash codes or synchronization on them.' },
      ],
      source: 'JLS §5.1.7 and §5.1.8; Javadoc for java.lang.Number',
    },
    interviewDefinition:
      'Wrapper classes (`Byte`, `Short`, `Integer`, `Long`, `Float`, `Double`, `Character`, `Boolean`) are immutable objects that box the eight primitives. This lets them live in collections, generics and nullable fields. **Autoboxing** compiles to `valueOf` and **unboxing** to `xxxValue()`. The classic traps: `==` compares references, and only cached values happen to match (−128 to 127 for `Integer`). Unboxing `null` throws `NullPointerException`. And `equals` is false across different wrapper types.',
    interviewFollowUps: [
      {
        question: 'Why is `Integer a = 127, b = 127; a == b` true but false for 128?',
        answer: 'Autoboxing calls `Integer.valueOf`. It returns shared cached instances for −128 to 127, and the JLS requires this range. 128 is outside the default cache, so each boxing creates a new object. HotSpot can raise the upper bound with `-XX:AutoBoxCacheMax`. That is exactly why code must never depend on it.',
      },
      {
        question: 'When does Java unbox implicitly?',
        answer: 'Java unboxes in arithmetic, in comparisons with a primitive (`wrapper == 5`, `<`, `>`), and when assigning to a primitive. It also unboxes when passing to a primitive parameter, in `if (booleanWrapper)`, and in a `switch` on a wrapper. A conditional `?:` that mixes a wrapper and a primitive unboxes too. Each of these throws NPE if the wrapper is null.',
      },
      {
        question: 'What does boxing cost?',
        answer: 'An `Integer` is a full object (typically 16 bytes) reached through a reference. An `int` takes 4 bytes inline. A `List<Integer>` of a million values uses several times the memory of an `int[]`. It also scatters the values across the heap. The JIT\'s escape analysis can remove some short-lived boxes. But hot numeric code (code that runs very often) should use primitives, primitive arrays or `IntStream`.',
      },
    ],
    mnemonic: {
      device: 'Boxes play "No Cheap Tricks" (N-C-T)',
      expansion: [
        { key: 'N', meaning: 'Null — a wrapper can be null, and unboxing null throws NPE' },
        { key: 'C', meaning: 'Cache — only −128..127 (Integer) are shared, so == lies beyond it' },
        { key: 'T', meaning: 'Type — equals needs the same wrapper type: Long(1) never equals Integer(1)' },
      ],
      visual: 'A shelf of pre-made gift boxes numbered −128 to 127 (the cache). Ask for 128 and the shop wraps a brand-new box each time. Some boxes on the counter are empty (null) — open one expecting a number and it explodes. And a box labelled "Long" is never the same gift as one labelled "Integer", whatever is inside.',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'A coin in your hand vs a coin in an envelope',
        body: 'A primitive `int` is a coin in your hand: you just have the value. An `Integer` is the coin sealed in an envelope with a label. Envelopes can go into filing cabinets (collections), can be empty (null), and two envelopes with the same coin are still two envelopes (`==` is false) unless the post office reused a pre-printed one (the cache).',
      },
      {
        kind: 'insight',
        title: 'Overloads and the conditional operator pick types before values exist',
        body: '`List<Integer>.remove(1)` chooses `remove(int index)` because exact primitive matches win over boxing during overload resolution. `flag ? nullableInteger : 0` has type `int` because one operand is a primitive, so whenever the wrapper branch is chosen it is unboxed — and throws if it is null, even when the result is assigned to an `Integer`. Both are compile-time decisions that surprise people at run time.',
      },
      {
        kind: 'real-world',
        title: 'Nullable IDs in persistence code',
        body: 'JPA entities usually declare `private Long id;` rather than `long id`. `null` means "not saved yet", which a primitive cannot express (0 could be a real id). The same reasoning applies to optional database columns and optional JSON fields: a wrapper (or `Optional` in method results) models "absent", a primitive models "always present".',
      },
      {
        kind: 'angle',
        title: 'Wrappers are value-based classes',
        body: 'The JDK documents wrappers as **value-based**: their identity is meaningless and may change in future. Since Java 16 (JEP 390) the constructors are deprecated for removal, and `javac` warns when you `synchronized` on a wrapper instance. Project Valhalla is working towards value objects without identity, but that work is not part of standard Java as of Java 25.',
      },
    ],
    diagrams: [
      {
        id: 't-wrappers-cache',
        kind: 'concept',
        title: 'The Integer cache',
        caption: 'Boxing 127 twice returns the same cached object, so == is true. Boxing 128 allocates two separate objects, so == is false even though equals is true.',
        explanation: [
          '**Integer a = 127** and **Integer b = 127** both compile to `Integer.valueOf(127)`. 127 lies in the **IntegerCache (-128..127)** group. So valueOf returns an existing object instead of creating a new one.',
          'So both arrows end at the same **Integer 127** box, one shared instance. That is why the edge is labelled a == b: the two references are identical.',
          '**Integer c = 128** and **Integer d = 128** also call valueOf. But 128 is outside the cache, so each call creates its own **Integer 128** object in the **Fresh heap allocations** group.',
          'The two arrows end at two different boxes, so c != d. Yet `c.equals(d)` is true, because both objects hold the value 128.',
          'Takeaway: `==` on wrappers only seems to work for small cached values. Compare wrapper values with `equals` or `Objects.equals`, or unbox them first.',
        ],
        cols: 3,
        rows: 4,
        nodes: [
          { id: 'twc-a', label: 'Integer a = 127', detail: 'Integer.valueOf(127)', col: 0, row: 0, tone: 'primary' },
          { id: 'twc-b', label: 'Integer b = 127', detail: 'Integer.valueOf(127)', col: 0, row: 1, tone: 'primary' },
          { id: 'twc-cached', label: 'Integer 127', detail: 'one shared instance', col: 2, row: 0, shape: 'cylinder', tone: 'success' },
          { id: 'twc-c', label: 'Integer c = 128', detail: 'Integer.valueOf(128)', col: 0, row: 2, tone: 'primary' },
          { id: 'twc-d', label: 'Integer d = 128', detail: 'Integer.valueOf(128)', col: 0, row: 3, tone: 'primary' },
          { id: 'twc-o1', label: 'Integer 128', detail: 'new object #1', col: 2, row: 2, shape: 'cylinder', tone: 'warning' },
          { id: 'twc-o2', label: 'Integer 128', detail: 'new object #2', col: 2, row: 3, shape: 'cylinder', tone: 'warning' },
        ],
        edges: [
          { from: 'twc-a', to: 'twc-cached' },
          { from: 'twc-b', to: 'twc-cached', label: 'a == b' },
          { from: 'twc-c', to: 'twc-o1' },
          { from: 'twc-d', to: 'twc-o2', label: 'c != d' },
        ],
        groups: [
          { label: 'IntegerCache (-128..127)', fromCol: 2, toCol: 2, fromRow: 0, toRow: 1, tone: 'success' },
          { label: 'Fresh heap allocations', fromCol: 2, toCol: 2, fromRow: 2, toRow: 3, tone: 'warning' },
        ],
      },
      {
        id: 't-wrappers-unboxing-flow',
        kind: 'flow',
        title: 'What `int total = map.get(key)` really does',
        caption: 'The compiler silently inserts intValue(). If the map has no entry, get returns null and the hidden call throws. This happens on a line that looks purely numeric.',
        explanation: [
          'Begin with **map.get(key)**. It returns an `Integer` reference, or null when the key is missing. Nothing on the source line shows that a conversion is about to happen.',
          'The hidden question is **Is it null?** Nobody checks. The compiler simply inserts a call to **intValue()** so the wrapper can be assigned to an `int` variable.',
          'When the reference is not null, intValue() returns the number. **int total** then gets a plain primitive value. Every test with existing keys takes this path.',
          'When the reference is null, calling intValue() on it throws a **NullPointerException**. The line looks purely numeric, so the bug is hard to spot.',
          'The dashed fix arrow leads to **getOrDefault(k, 0)**. Supply a default, use `merge`, or check for null before unboxing. Then a missing key never reaches intValue().',
        ],
        cols: 3,
        rows: 2,
        nodes: [
          { id: 'twu-get', label: 'map.get(key)', detail: 'returns Integer or null', col: 0, row: 0, tone: 'primary' },
          { id: 'twu-null', label: 'Is it null?', detail: 'nobody checks', col: 1, row: 0, tone: 'warning' },
          { id: 'twu-unbox', label: 'intValue()', detail: 'inserted by the compiler', col: 2, row: 0, tone: 'accent' },
          { id: 'twu-int', label: 'int total', detail: 'a plain number', col: 2, row: 1, shape: 'pill', tone: 'success' },
          { id: 'twu-npe', label: 'NullPointerException', detail: 'thrown while unboxing', col: 1, row: 1, shape: 'pill', tone: 'danger' },
          { id: 'twu-fix', label: 'getOrDefault(k, 0)', detail: 'or merge / null check', col: 0, row: 1, tone: 'success' },
        ],
        edges: [
          { from: 'twu-get', to: 'twu-null' },
          { from: 'twu-null', to: 'twu-unbox', label: 'no' },
          { from: 'twu-unbox', to: 'twu-int' },
          { from: 'twu-null', to: 'twu-npe', label: 'yes' },
          { from: 'twu-npe', to: 'twu-fix', label: 'fix', dashed: true },
        ],
      },
      {
        id: 't-wrappers-family',
        kind: 'architecture',
        title: 'The eight wrapper classes',
        caption: 'Six numeric wrappers extend the abstract class Number, which provides intValue(), doubleValue() and similar methods. Character and Boolean extend Object directly. All eight are final and immutable. Float and Double have no cache.',
        explanation: [
          'At the top is **Object**, the root of every class. Three arrows labelled extends point up to it. They come from **Number (abstract)**, **Character** and **Boolean**.',
          '**Number (abstract)** defines conversion methods such as `intValue()`, `longValue()` and `doubleValue()`. So you can read any numeric wrapper as any primitive numeric type.',
          'The **All extend Number** group holds the six numeric wrappers: **Byte**, **Short**, **Integer** and **Long** for whole numbers, and **Float** and **Double** for floating point.',
          'The detail lines show the caches. Byte caches every value. Short, Integer and Long cache -128 to 127. Float and Double cache nothing. Character caches 0 to 127, and Boolean has just two constants.',
          'Takeaway: all eight wrappers are final and immutable. But only the six numeric ones share the Number methods. This makes `Number` a handy parameter type for numeric code.',
        ],
        cols: 4,
        rows: 4,
        nodes: [
          { id: 'twf-object', label: 'Object', col: 1, row: 0, span: 2, tone: 'neutral' },
          { id: 'twf-number', label: 'Number (abstract)', detail: 'intValue(), longValue(), doubleValue()...', col: 0, row: 1, span: 2, tone: 'primary' },
          { id: 'twf-char', label: 'Character', detail: 'char · caches 0..127', col: 2, row: 1, tone: 'accent' },
          { id: 'twf-bool', label: 'Boolean', detail: 'TRUE / FALSE constants', col: 3, row: 1, tone: 'accent' },
          { id: 'twf-byte', label: 'Byte', detail: 'byte · all values cached', col: 0, row: 2, tone: 'accent' },
          { id: 'twf-short', label: 'Short', detail: 'short · -128..127 cached', col: 1, row: 2, tone: 'accent' },
          { id: 'twf-int', label: 'Integer', detail: 'int · -128..127, tunable', col: 2, row: 2, tone: 'accent' },
          { id: 'twf-long', label: 'Long', detail: 'long · -128..127 cached', col: 3, row: 2, tone: 'accent' },
          { id: 'twf-float', label: 'Float', detail: 'float · no cache', col: 0, row: 3, tone: 'accent' },
          { id: 'twf-double', label: 'Double', detail: 'double · no cache', col: 1, row: 3, tone: 'accent' },
        ],
        edges: [
          { from: 'twf-number', to: 'twf-object', label: 'extends' },
          { from: 'twf-char', to: 'twf-object', label: 'extends' },
          { from: 'twf-bool', to: 'twf-object', label: 'extends' },
        ],
        groups: [{ label: 'All extend Number', fromCol: 0, toCol: 3, fromRow: 2, toRow: 3, tone: 'primary' }],
      },
    ],
    variants: [
      {
        title: 'The eight primitive / wrapper pairs',
        intro: 'Caching is what autoboxing and valueOf use. The JLS guarantees the boolean, byte, char 0..127 and short/int −128..127 ranges; the JDK also caches Long −128..127.',
        items: [
          { name: 'byte → Byte', summary: '8-bit signed integer.', note: 'Cache: all 256 values.' },
          { name: 'short → Short', summary: '16-bit signed integer.', note: 'Cache: −128..127.' },
          { name: 'int → Integer', summary: '32-bit signed integer; the irregular name to remember.', note: 'Cache: −128..127 by default; upper bound tunable with -XX:AutoBoxCacheMax.' },
          { name: 'long → Long', summary: '64-bit signed integer.', note: 'Cache: −128..127.' },
          { name: 'float → Float', summary: '32-bit IEEE 754 floating point.', note: 'No cache: every boxing may allocate.' },
          { name: 'double → Double', summary: '64-bit IEEE 754 floating point.', note: 'No cache. Note Double.valueOf(Double.NaN).equals(Double.NaN) is true while Double.NaN == Double.NaN is false.' },
          { name: 'char → Character', summary: 'A UTF-16 code unit; the other irregular name.', note: 'Cache: 0..127 (ASCII).' },
          { name: 'boolean → Boolean', summary: 'true / false.', note: 'Always the two constants Boolean.TRUE and Boolean.FALSE.' },
        ],
      },
      {
        title: 'Ways to convert between primitives, wrappers and text',
        items: [
          { name: 'Autoboxing / unboxing', summary: 'Implicit; compiles to valueOf / xxxValue().', support: 'supported', code: 'Integer boxed = 5;\nint back = boxed;' },
          { name: 'valueOf', summary: 'Explicit boxing from a primitive or text; may return a cached instance.', support: 'supported', code: 'Integer.valueOf("42")' },
          { name: 'parseXxx', summary: 'Text to primitive; throws NumberFormatException on bad input.', support: 'supported', code: 'int n = Integer.parseInt("42");' },
          { name: 'xxxValue()', summary: 'Explicit unboxing, including cross-type via Number.', support: 'supported', code: 'double d = someInteger.doubleValue();' },
          { name: 'new Integer(...) constructors', summary: 'Always allocate and bypass the cache.', support: 'partial', note: 'Deprecated since 9, for removal since 16 (JEP 390). Do not use.', code: 'new Integer(5) // deprecated' },
        ],
      },
      {
        title: 'Ways to compare wrapper values',
        items: [
          { name: 'wrapper == wrapper', summary: 'Reference comparison; only cached values appear equal.', support: 'not-supported', note: 'A bug for value comparison.' },
          { name: 'wrapper == primitive', summary: 'Unboxes and compares numerically; NPE if the wrapper is null.', support: 'partial' },
          { name: 'equals / Objects.equals', summary: 'Value equality of the same wrapper type; Objects.equals is null-safe.', support: 'supported', code: 'Objects.equals(left.get(k), right.get(k))' },
          { name: 'Integer.compare / compareTo', summary: 'Ordering without overflow; use in Comparators instead of subtraction.', support: 'supported', code: 'Integer.compare(a, b)' },
        ],
      },
    ],
    deepDive: [
      {
        title: 'The cache range is a JLS guarantee — with an escape hatch',
        body: 'JLS §5.1.7 requires that boxing `true`, `false`, any `byte`, a `char` in \\u0000–\\u007f, or an `int`/`short` in −128..127 always yields the identical object. Anything outside those ranges is implementation-defined. HotSpot lets you widen the `Integer` cache with `-XX:AutoBoxCacheMax=<n>` (which sets the `java.lang.Integer.IntegerCache.high` property), so a test that "passes" because two 1000s compare equal with `==` can silently depend on JVM flags.',
        sources: [{ label: 'JLS §5.1.7: Boxing Conversion', url: 'https://docs.oracle.com/javase/specs/jls/se21/html/jls-5.html#jls-5.1.7' }],
      },
      {
        title: 'The conditional operator unboxes by its typing rules',
        body: 'JLS §15.25 classifies `cond ? a : b` as a numeric conditional when one operand is a primitive and the other its wrapper; the result type is then the primitive, so the wrapper operand is unboxed. `Integer x = flag ? map.get(k) : 0;` therefore throws NPE when the map has no entry, even though the target is an `Integer`. Writing `flag ? map.get(k) : Integer.valueOf(0)` makes both operands references and avoids the unboxing.',
        sources: [{ label: 'JLS §15.25: Conditional Operator ? :', url: 'https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.25' }],
      },
      {
        title: 'Value-based classes and the end of wrapper identity',
        body: 'JEP 390 (Java 16) marked the wrapper constructors `@Deprecated(forRemoval = true)` and added warnings for synchronizing on instances of value-based classes, preparing for a future in which such objects may have no identity at all. *Effective Java* (Item 61, "Prefer primitive types to boxed primitives") summarises the practical advice: boxed primitives have identity, can be null and are slower, so use them only where a reference type is required.',
        sources: [
          { label: 'JEP 390: Warnings for Value-Based Classes', url: 'https://openjdk.org/jeps/390' },
          { label: 'Effective Java, 3rd edition — Item 61' },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  't-generics': {
    textbook: {
      definition:
        '**Generics** are a feature of the Java type system. With them, classes, interfaces, methods and constructors declare **type parameters**. At each use, **type arguments** replace them, giving **parameterized types** such as `List<String>`. The compiler uses the type arguments to check the types of values stored and read, and it inserts the needed casts. Parameterized types are **invariant**. **Wildcards** with upper or lower bounds allow limited covariance or contravariance. **Type erasure** removes generic type arguments, so they are not available at run time.',
      terms: [
        { term: 'Type parameter', meaning: 'A placeholder name, such as `T`, declared by a generic class, interface, method or constructor. One or more bounds can optionally restrict it.' },
        { term: 'Parameterized type', meaning: 'A generic type applied to actual type arguments, such as `Map<String, Integer>`. Different parameterizations of one generic type are not related by subtyping.' },
        { term: 'Wildcard', meaning: 'A type argument written `?`. It can optionally be bounded with `extends` or `super`, and it stands for some unknown type within that bound.' },
        { term: 'Type erasure', meaning: 'The compile-time mapping that replaces each type variable by its leftmost bound, and each parameterized type by its raw type. So bytecode carries no type arguments.' },
        { term: 'Invariance', meaning: 'The rule that `G<A>` is not a subtype of `G<B>`, even when `A` is a subtype of `B`.' },
      ],
      source: 'JLS §4.4, §4.5, §4.6 and §8.1.2',
    },
    interviewDefinition:
      'Generics add **compile-time type parameters** to classes, interfaces and methods. So one implementation works for many types without casts. Parameterised types are **invariant**: `List<Integer>` is not a `List<Number>`. Flexibility comes from bounded wildcards. Use `? extends T` for producers you read from, and `? super T` for consumers you write to (PECS). Generics are implemented by **type erasure**. The compiler checks types, inserts casts and erases parameters to their bounds, so objects carry no type arguments at run time.',
    interviewFollowUps: [
      {
        question: 'Why can you not write `new T()` or `new T[n]`?',
        answer: 'After erasure, the running code does not know what T is. So it cannot pick a constructor or an array component type. Instead, pass a `Supplier<T>`, a `Class<T>` or an `IntFunction<T[]>`, as `Collection.toArray(IntFunction)` does.',
      },
      {
        question: '`List<?>` vs `List<Object>` vs raw `List`?',
        answer: '`List<Object>` holds any object and accepts any add, but only a `List<Object>` can be passed to it. `List<?>` accepts a list of any element type, but you cannot add to it (except null). Raw `List` turns off generic checking entirely. It exists only for pre-Java-5 compatibility.',
      },
      {
        question: 'What is a bridge method?',
        answer: 'Take `class Name implements Comparable<Name>`, which defines `compareTo(Name)`. Erasure leaves the interface method as `compareTo(Object)`. So the compiler generates a synthetic (compiler-made) bridge `compareTo(Object)` that casts and calls `compareTo(Name)`. This way, overriding still works after erasure.',
      },
      {
        question: 'What does `<T extends Comparable<? super T>>` mean?',
        answer: 'T must be comparable to T or to one of its supertypes. This lets `max` work for a type that inherits `compareTo` from a parent. An example is a subclass of a class that implements `Comparable<Parent>`.',
      },
    ],
    mnemonic: {
      device: 'PECS: Producer Extends, Consumer Super',
      expansion: [
        { key: 'Producer → extends', meaning: 'You only READ Ts out of it: use ? extends T (e.g. the source list)' },
        { key: 'Consumer → super', meaning: 'You only WRITE Ts into it: use ? super T (e.g. the destination list)' },
        { key: 'Both → exact T', meaning: 'You read and write: no wildcard at all' },
      ],
      visual: 'A vending machine is a producer: you can take snacks out but cannot put any in (extends). A donation bin is a consumer: you can drop things in but cannot know what you will get out (super). A shelf you both stock and take from needs an exact label (T).',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'Labels checked at the loading dock, removed before shipping',
        body: 'Generic types are like labels on crates: "Strings only". The compiler is the inspector at the loading dock who refuses anything that does not match. Once the crates are on the truck, the labels are peeled off (erasure) — the truck (JVM) only sees plain crates, trusting the inspection already happened.',
      },
      {
        kind: 'insight',
        title: 'Why arrays and generics disagree',
        body: 'Arrays are **covariant** and **reified**: `String[]` is an `Object[]`, and the array remembers its component type so a bad store fails at run time (`ArrayStoreException`). Generics are **invariant** and **erased**: `List<String>` is not a `List<Object>`, so the bad store is a compile error instead. That mismatch is why you cannot create a generic array like `new List<String>[10]`.',
      },
      {
        kind: 'real-world',
        title: 'Super type tokens in Jackson and Spring',
        body: 'Erasure means `List<Order>.class` does not exist. Jackson\'s `new TypeReference<List<Order>>() {}` and Spring\'s `ParameterizedTypeReference` create an anonymous subclass; the class file of that subclass records its generic superclass, which the library reads with reflection to recover `List<Order>` at run time.',
      },
      {
        kind: 'angle',
        title: 'Inference does more work than you think',
        body: '`List.of()`, `Collections.emptyList()` and the diamond `new ArrayList<>()` work because the compiler infers type arguments from the target. Java 8 greatly improved this (target typing through method arguments), and Java 9 allowed the diamond on anonymous classes. When inference picks something odd (`Object`), add an explicit witness: `List.<String>of()`.',
      },
    ],
    diagrams: [
      {
        id: 't-generics-pecs',
        kind: 'concept',
        title: 'PECS in one method',
        caption: 'The source only produces Numbers (read with get), so it is ? extends Number. The destination only consumes Numbers (written with add), so it is ? super Number. The notes show which concrete lists each parameter accepts.',
        explanation: [
          'Read the method in the middle first. **copy(dest, src)** reads elements from one list and writes them into another. So each parameter has exactly one job.',
          'On the left, **src** is declared `List<? extends Number>`. The arrow labelled get(): producer shows that the method only takes Numbers out of it. That is exactly what extends allows.',
          'The dashed note above it, **Accepts List of** Integer, Double or Number, lists what callers may pass. That is any list whose elements are some subtype of Number.',
          'On the right, **dest** is `List<? super Number>`. The arrow add(): consumer shows that the method only puts Numbers in, which super allows. Its note accepts lists of Number or Object.',
          'Takeaway, PECS: a producer you read from uses extends. A consumer you write to uses super. A list you both read and write needs the exact type.',
        ],
        cols: 3,
        rows: 2,
        nodes: [
          { id: 'tgp-srcok', label: 'Accepts List of', detail: 'Integer, Double, Number', col: 0, row: 0, shape: 'note', tone: 'neutral' },
          { id: 'tgp-src', label: 'src', detail: 'List<? extends Number>', col: 0, row: 1, tone: 'primary' },
          { id: 'tgp-method', label: 'copy(dest, src)', detail: 'reads src, writes dest', col: 1, row: 1, tone: 'accent' },
          { id: 'tgp-dest', label: 'dest', detail: 'List<? super Number>', col: 2, row: 1, tone: 'success' },
          { id: 'tgp-destok', label: 'Accepts List of', detail: 'Number, Object', col: 2, row: 0, shape: 'note', tone: 'neutral' },
        ],
        edges: [
          { from: 'tgp-srcok', to: 'tgp-src', dashed: true },
          { from: 'tgp-src', to: 'tgp-method', label: 'get(): producer' },
          { from: 'tgp-method', to: 'tgp-dest', label: 'add(): consumer' },
          { from: 'tgp-destok', to: 'tgp-dest', dashed: true },
        ],
      },
      {
        id: 't-generics-erasure',
        kind: 'flow',
        title: 'What happens to type arguments',
        caption: 'All checking happens in javac. The bytecode holds the erased type plus a cast that the compiler inserted. So at run time an ArrayList<String> is just an ArrayList.',
        explanation: [
          'The source note **List<String> names** declares a typed list. It reads `String s = names.get(0)` with no cast. Everything in the **Compile time** group happens inside javac.',
          '**javac type-checks** every use of the list. A call such as `names.add(42)` takes the dashed wrong type path to a **Compile error**. So the mistake never reaches a running program.',
          'If the code is ok, the compiler does **Erase + insert cast**. It removes the type argument and adds a `(String)` cast wherever a value is read.',
          'The resulting **Bytecode** mentions only the raw `List` and `Object get(int)`. No trace of String remains in the instructions.',
          'In the **Run time** group, the **JVM at run time** loads and runs that bytecode, and it sees a plain ArrayList. The compiler guaranteed type safety earlier, not the JVM.',
        ],
        cols: 4,
        rows: 2,
        nodes: [
          { id: 'tge-src', label: 'List<String> names', detail: 'String s = names.get(0)', col: 0, row: 0, shape: 'note', tone: 'neutral' },
          { id: 'tge-check', label: 'javac type-checks', detail: 'rejects names.add(42)', col: 1, row: 0, tone: 'primary' },
          { id: 'tge-erase', label: 'Erase + insert cast', detail: '(String) names.get(0)', col: 2, row: 0, tone: 'accent' },
          { id: 'tge-bytecode', label: 'Bytecode', detail: 'List, Object get(int)', col: 3, row: 0, shape: 'note', tone: 'accent' },
          { id: 'tge-err', label: 'Compile error', detail: 'caught before running', col: 1, row: 1, shape: 'pill', tone: 'danger' },
          { id: 'tge-jvm', label: 'JVM at run time', detail: 'sees a plain ArrayList', col: 3, row: 1, tone: 'primary' },
        ],
        edges: [
          { from: 'tge-src', to: 'tge-check' },
          { from: 'tge-check', to: 'tge-err', label: 'wrong type', dashed: true },
          { from: 'tge-check', to: 'tge-erase', label: 'ok' },
          { from: 'tge-erase', to: 'tge-bytecode' },
          { from: 'tge-bytecode', to: 'tge-jvm', label: 'load + run' },
        ],
        groups: [
          { label: 'Compile time', fromCol: 0, toCol: 3, fromRow: 0, toRow: 0, tone: 'neutral' },
          { label: 'Run time', fromCol: 3, toCol: 3, fromRow: 1, toRow: 1, tone: 'primary' },
        ],
      },
      {
        id: 't-generics-subtyping',
        kind: 'concept',
        title: 'Invariance and the wildcard family tree',
        caption: 'List<Integer>, List<Number> and List<Double> are not related to each other. But all three are subtypes of List<? extends Number>, which in turn is a List<?>.',
        explanation: [
          'Start at the bottom row: **List<Integer>**, **List<Number>** and **List<Double>** are three concrete parameterized types.',
          'The dashed arrow marked NOT a subtype is the key lesson. Integer is a Number, but **List<Integer>** is not a **List<Number>**. Generics are invariant, because otherwise you could add a Double to a list of Integers.',
          'All three concrete lists do point up to **List<? extends Number>**. That wildcard type means a list of some unknown subtype of Number. You may read from it as Number, but not add to it.',
          '**List<? extends Number>** is in turn a **List<?>**. That is a list of completely unknown element type, and the most general type in the tree.',
          'Takeaway: wildcards build the family tree that plain parameterized types lack. So write methods against wildcard types when they should accept several kinds of list.',
        ],
        cols: 3,
        rows: 3,
        nodes: [
          { id: 'tgs-any', label: 'List<?>', detail: 'any element type', col: 1, row: 0, tone: 'neutral' },
          { id: 'tgs-ext', label: 'List<? extends Number>', detail: 'read as Number', col: 1, row: 1, tone: 'primary' },
          { id: 'tgs-int', label: 'List<Integer>', col: 0, row: 2, tone: 'accent' },
          { id: 'tgs-num', label: 'List<Number>', col: 1, row: 2, tone: 'accent' },
          { id: 'tgs-dbl', label: 'List<Double>', col: 2, row: 2, tone: 'accent' },
        ],
        edges: [
          { from: 'tgs-ext', to: 'tgs-any', label: 'is a' },
          { from: 'tgs-int', to: 'tgs-ext' },
          { from: 'tgs-num', to: 'tgs-ext', label: 'is a' },
          { from: 'tgs-dbl', to: 'tgs-ext' },
          { from: 'tgs-int', to: 'tgs-num', label: 'NOT a subtype', dashed: true },
        ],
      },
    ],
    variants: [
      {
        title: 'Generic forms',
        items: [
          { name: 'Generic class / interface', summary: 'Type parameters after the type name; used as Box<String>.', support: 'supported', code: 'class Box<T> { T value; }' },
          { name: 'Generic record', summary: 'Records take type parameters like classes.', support: 'supported', code: 'record Pair<K, V>(K key, V value) {}' },
          { name: 'Generic method', summary: 'Type parameters declared before the return type; usually inferred at the call.', support: 'supported', code: 'static <T> T first(List<T> list)' },
          { name: 'Generic constructor', summary: 'A constructor can declare its own type parameters (rare).', support: 'supported', code: '<S> Box(S seed, Function<S, T> f)' },
          { name: 'Bounded type parameter', summary: 'Restricts T to subtypes of a bound, unlocking the bound\'s methods.', support: 'supported', code: '<T extends Number> double sum(List<T> xs)' },
          { name: 'Multiple bounds', summary: 'One class bound (first) plus any number of interfaces, joined with &.', support: 'supported', code: '<T extends Number & Comparable<T>>' },
          { name: 'Recursive bound', summary: 'T is defined in terms of itself — the standard way to say "comparable to itself".', support: 'supported', code: '<T extends Comparable<? super T>>' },
          { name: 'Primitive type arguments', summary: 'List<int> is not allowed; use wrappers or primitive specialisations (IntStream).', support: 'not-supported', note: 'A long-term goal of Project Valhalla; not in standard Java as of Java 25.' },
        ],
      },
      {
        title: 'Wildcards',
        items: [
          { name: 'Unbounded: ?', summary: 'Some unknown type. Read as Object; cannot add anything but null.', support: 'supported', code: 'void printAll(List<?> items)' },
          { name: 'Upper-bounded: ? extends T', summary: 'T or any subtype. Safe to read as T; cannot add (producer).', support: 'supported', code: 'double sum(List<? extends Number> xs)' },
          { name: 'Lower-bounded: ? super T', summary: 'T or any supertype. Safe to add Ts; reads give Object (consumer).', support: 'supported', code: 'void fill(List<? super Integer> sink)' },
          { name: 'Lower-bounded type parameter <T super X>', summary: 'Not part of the language: only wildcards can have a super bound.', support: 'not-supported' },
        ],
      },
      {
        title: 'What erasure rules out',
        items: [
          { name: 'new T() / new T[n]', summary: 'The type is unknown at run time.', support: 'not-supported', note: 'Pass a Supplier<T> or IntFunction<T[]>.' },
          { name: 'Unsafe instanceof with type arguments', summary: 'obj instanceof List<String> is an error when the run time cannot check it.', support: 'partial', note: 'instanceof List<?> always works; since Java 16 a parameterised type is allowed when the static type makes the check safe.' },
          { name: 'Overloads differing only in type arguments', summary: 'm(List<String>) and m(List<Integer>) erase to the same signature.', support: 'not-supported' },
          { name: 'Static field of type T', summary: 'Static members belong to the class, shared by every parameterisation.', support: 'not-supported' },
          { name: 'Generic exception classes', summary: 'A generic class cannot extend Throwable: catch clauses need a run-time type.', support: 'not-supported' },
        ],
      },
    ],
    deepDive: [
      {
        title: 'Erasure, bridge methods and why the design was chosen',
        body: 'JLS §4.6 defines erasure: a type variable erases to its leftmost bound (Object if unbounded) and parameterised types erase to their raw type. Because overriding is checked on erased signatures in the JVM, `javac` emits synthetic **bridge methods** when a subclass specialises a generic method. Erasure was chosen in Java 5 for **migration compatibility**: generic and pre-generic class files interoperate, and existing libraries could be generified without breaking their clients.',
        sources: [
          { label: 'JLS §4.6: Type Erasure', url: 'https://docs.oracle.com/javase/specs/jls/se21/html/jls-4.html#jls-4.6' },
          { label: 'The Java Tutorials: Effects of Type Erasure and Bridge Methods', url: 'https://docs.oracle.com/javase/tutorial/java/generics/bridgeMethods.html' },
        ],
      },
      {
        title: 'Generic signatures survive in class files',
        body: 'Erasure removes type arguments from objects and from the instructions, but declarations keep them in the class file\'s `Signature` attribute. That is how reflection (`Field.getGenericType()`, `Class.getGenericSuperclass()`) can report `Map<String, List<Order>>` for a field, and how serialisation frameworks and dependency injection containers resolve generic types. What you can never recover is the type argument of a particular `new ArrayList<>()` object.',
        sources: [{ label: 'JVM Specification §4.7.9: The Signature Attribute', url: 'https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-4.html#jvms-4.7.9' }],
      },
      {
        title: 'Heap pollution and generic varargs',
        body: 'A varargs parameter `T... items` is really a `T[]`, a generic array the language otherwise forbids. If such a method stores into or exposes that array, a `List<String>` variable can end up referring to a list of Integers — **heap pollution** — and the `ClassCastException` appears far away. `@SafeVarargs` is the method author\'s promise that the array is only read; `List.of(E...)` and `Arrays.asList` carry it. *Effective Java* Items 31 (bounded wildcards), 28 (prefer lists to arrays) and 32 (generics and varargs) are the standard references.',
        sources: [
          { label: 'JLS §4.12.2: Variables of Reference Type (heap pollution)', url: 'https://docs.oracle.com/javase/specs/jls/se21/html/jls-4.html#jls-4.12.2' },
          { label: 'Effective Java, 3rd edition — Items 28, 31 and 32' },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  't-modern-types': {
    textbook: {
      definition:
        'Modern Java\'s type features consist of **local-variable type inference** and **pattern matching**. With `var`, the compiler infers a local variable\'s type from its initializer, and the type then stays fixed. A **pattern** tests whether a value has a certain shape. If it does, it extracts parts of the value into **pattern variables**. A type pattern tests the run-time type. A **record pattern** takes a record apart into its components. Patterns appear in `instanceof` expressions and `switch` labels. A pattern `switch` must be **exhaustive**.',
      terms: [
        { term: 'Local-variable type inference', meaning: 'The compiler infers a local variable\'s static type from its initializer, at compile time. This happens when the variable is declared with the reserved type name `var`.' },
        { term: 'Type pattern', meaning: 'A pattern made of a type and a variable name, such as `String s`. It matches when the value is an instance of that type.' },
        { term: 'Record pattern', meaning: 'A pattern that names a record class and lists one nested pattern for each record component. It matches the record and takes it apart.' },
        { term: 'Pattern variable', meaning: 'A variable declared by a pattern. It is definitely assigned and in scope only where flow analysis (the compiler\'s check of possible paths) proves the match succeeded.' },
        { term: 'Exhaustiveness', meaning: 'The compile-time rule that a pattern switch must cover every possible value of its selector type. For example, it must cover every permitted subtype of a sealed interface.' },
      ],
      source: 'JLS §14.30 and §14.11.1; JEP 286, JEP 394, JEP 440 and JEP 441',
    },
    interviewDefinition:
      'Modern Java keeps static typing but needs less boilerplate code. `var` (Java 10) infers a local variable\'s type from its initialiser at compile time. **Pattern matching** combines a type test, a cast and a variable binding. It includes `instanceof` patterns (Java 16), plus type patterns in `switch`, `when` guards and nestable **record patterns** (Java 21). Pattern switches must be exhaustive. They must also reject dominated cases (cases an earlier case already covers). They accept `null` only through an explicit `case null`.',
    interviewFollowUps: [
      {
        question: 'Is `var` a keyword?',
        answer: 'No, it is a reserved type name. You can still name a variable or method `var`, but not a class or interface. The inferred type is fixed at compile time; `var` adds no dynamic typing.',
      },
      {
        question: 'How do sealed types and switch give exhaustiveness without `default`?',
        answer: 'The compiler knows every permitted subtype, so it can prove that a switch covers them all. Adding a new permitted subtype makes every such switch fail to compile. A class file may change later without the switch being recompiled. Then a fallback that the compiler generated throws `MatchException` at run time.',
      },
      {
        question: 'What is flow scoping of pattern variables?',
        answer: 'A binding is in scope only where the match is definitely true. `if (!(o instanceof String s)) return;` makes `s` usable after the if. But in `a instanceof String s || s.isEmpty()` the second `s` is a compile error, because the match may have failed.',
      },
      {
        question: 'Can patterns match primitives like `case int i`?',
        answer: 'Not in standard Java 25. Primitive types in patterns, instanceof and switch are a **preview** feature (not yet final). It is the third preview in Java 25, JEP 507, and it requires `--enable-preview`. Today, type patterns work on reference types, and switches on primitives use constant labels.',
      },
    ],
    mnemonic: {
      device: 'The four Cs of pattern matching',
      expansion: [
        { key: 'Check', meaning: 'Test the type (and optional when guard)' },
        { key: 'Cast', meaning: 'The compiler casts for you — no separate, drift-prone cast' },
        { key: 'Capture', meaning: 'Bind the value (or record components) to new variables' },
        { key: 'Cover', meaning: 'A pattern switch must cover every case: sealed types, default or case null' },
      ],
      visual: 'An airport scanner that checks a bag, opens exactly that bag, unpacks its compartments onto labelled trays, and refuses to let the line move until every bag has been through.',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'Opening the bag you just scanned',
        body: 'The old style was: scan a bag (`instanceof`), then walk to the belt and grab a bag to open (`(Dog) animal`) — and occasionally grab the wrong one after a copy-paste. A pattern opens exactly the bag that passed the scan. A record pattern goes further and unpacks its compartments straight onto labelled trays (`Point(int x, int y)`).',
      },
      {
        kind: 'insight',
        title: 'var can hold types you cannot write',
        body: 'Inference can produce **non-denotable** types: `var counter = new Object() { int hits; };` gives `counter` an anonymous class type, so `counter.hits++` compiles. `var` also captures intersection types from generic methods. It is a curiosity, but it shows that `var` is inference of a real static type, not a shortcut for `Object`.',
      },
      {
        kind: 'real-world',
        title: 'Modelling API results as data',
        body: 'A payment client returns `sealed interface PaymentResult permits Approved, Declined, Failed` with records. Callers write one exhaustive `switch` with record patterns: `case Declined(var reason) when reason.isRetryable() -> retry();`. When the provider adds a `Pending` outcome, the build breaks in exactly the places that must handle it instead of a `default` branch silently swallowing it.',
      },
      {
        kind: 'angle',
        title: 'Pattern matching vs polymorphism is the expression problem',
        body: 'Virtual methods make it easy to add a new **type** (one new class) but every new **operation** touches every class. Sealed types plus pattern switches flip that: adding an operation is one new switch, while adding a type breaks every switch. Choose by which axis changes more often in your domain.',
      },
    ],
    diagrams: [
      {
        id: 't-modern-types-before-after',
        kind: 'concept',
        title: 'Test-then-cast vs a type pattern',
        caption: 'The classic version repeats the type and keeps the cast separate from the test. The pattern does the test, cast and binding in one step. And s exists only where the test succeeded.',
        explanation: [
          'The left column, **Before Java 16**, starts with **o instanceof String**. This only tests the type and gives a boolean.',
          'If the test is true, a separate line **String s = (String) o** casts and names the value. The type is written twice. After a copy-paste, the cast can drift away from the test.',
          'Only then can the code call **s.length()**. Three separate statements were needed to express one idea.',
          'The right column, **Java 16+**, does all of it in **o instanceof String s**. The type test, the cast and the binding of s happen in a single step.',
          'Here s exists only where the test succeeded. So the second s.length() can never run on a value of the wrong type. Takeaway: patterns remove the duplicated cast, which is easy to get wrong.',
        ],
        cols: 2,
        rows: 3,
        nodes: [
          { id: 'tmb-old-test', label: 'o instanceof String', detail: 'test', col: 0, row: 0, tone: 'neutral' },
          { id: 'tmb-old-cast', label: 'String s = (String) o', detail: 'separate cast, can drift', col: 0, row: 1, tone: 'warning' },
          { id: 'tmb-old-use', label: 's.length()', col: 0, row: 2, tone: 'neutral' },
          { id: 'tmb-new-test', label: 'o instanceof String s', detail: 'test + cast + bind', col: 1, row: 0, tone: 'success' },
          { id: 'tmb-new-use', label: 's.length()', detail: 's in scope only if true', col: 1, row: 1, tone: 'success' },
        ],
        edges: [
          { from: 'tmb-old-test', to: 'tmb-old-cast', label: 'if true' },
          { from: 'tmb-old-cast', to: 'tmb-old-use' },
          { from: 'tmb-new-test', to: 'tmb-new-use', label: 'if true' },
        ],
        groups: [
          { label: 'Before Java 16', fromCol: 0, toCol: 0, fromRow: 0, toRow: 2, tone: 'neutral' },
          { label: 'Java 16+', fromCol: 1, toCol: 1, fromRow: 0, toRow: 1, tone: 'success' },
        ],
      },
      {
        id: 't-modern-types-switch-flow',
        kind: 'flow',
        title: 'How a pattern switch picks a branch',
        caption: 'null is handled before any pattern. Then the cases are tried from top to bottom. If a type matches but its guard is false, control falls through to the next case. The first full match wins, which is why specific cases must come first.',
        explanation: [
          'Execution enters at **switch (value)** and first asks **value == null?** Null is handled before any pattern is tried.',
          'If the value is null, only an explicit **case null** label can take it. Without one, the switch throws NullPointerException, just as older switches did.',
          'Otherwise the cases are tried from top to bottom: **Next case: type matches?** If the type does not match, control goes to **Move to next case**. default is considered last.',
          'When the type matches, the guard is checked: **when guard true?** A false guard also sends control to the next case. So a guarded case is only a partial match.',
          'When both the type and the guard succeed, **Run this branch** runs with the pattern variables in scope. The first full match wins, so specific cases must come before general ones.',
        ],
        cols: 3,
        rows: 4,
        nodes: [
          { id: 'tms-in', label: 'switch (value)', col: 0, row: 0, shape: 'pill', tone: 'neutral' },
          { id: 'tms-null', label: 'value == null?', col: 1, row: 0, tone: 'warning' },
          { id: 'tms-casenull', label: 'case null', detail: 'else NullPointerException', col: 2, row: 0, tone: 'danger' },
          { id: 'tms-try', label: 'Next case: type matches?', detail: 'top to bottom', col: 1, row: 1, tone: 'primary' },
          { id: 'tms-skip', label: 'Move to next case', detail: 'default is tried last', col: 0, row: 1, tone: 'neutral' },
          { id: 'tms-guard', label: 'when guard true?', detail: 'or no guard', col: 1, row: 2, tone: 'warning' },
          { id: 'tms-run', label: 'Run this branch', detail: 'bindings are in scope', col: 1, row: 3, shape: 'pill', tone: 'success' },
        ],
        edges: [
          { from: 'tms-in', to: 'tms-null' },
          { from: 'tms-null', to: 'tms-casenull', label: 'yes' },
          { from: 'tms-null', to: 'tms-try', label: 'no' },
          { from: 'tms-try', to: 'tms-skip', label: 'no' },
          { from: 'tms-try', to: 'tms-guard', label: 'yes' },
          { from: 'tms-guard', to: 'tms-skip', label: 'false' },
          { from: 'tms-guard', to: 'tms-run', label: 'true' },
        ],
      },
      {
        id: 't-modern-types-anatomy',
        kind: 'architecture',
        title: 'Anatomy of a nested record pattern',
        caption: 'A record pattern contains one sub-pattern for each record component. Sub-patterns can be record patterns, type patterns or var. Each leaf binds a variable.',
        explanation: [
          'The top box, **case Line(Point(var x1, var y1), Point end)**, is a single record pattern for a Line record that has two components.',
          'The arrow component from leads to **Point(var x1, var y1)**, a nested record pattern. It matches the first Point and takes it apart right away.',
          'Inside it, **var x1** and **var y1** are leaf patterns. var infers each component\'s type, here int, and binds the values to new variables.',
          'The arrow component to leads to **Point end**, a type pattern. It does not deconstruct the second Point; it binds the whole object to the variable **end**.',
          'Takeaway: record patterns nest to any depth, and each sub-pattern matches one component. Every leaf adds a variable that is in scope only inside that case.',
        ],
        cols: 3,
        rows: 3,
        nodes: [
          { id: 'tma-case', label: 'case Line(Point(var x1, var y1), Point end)', detail: 'record pattern for Line', col: 0, row: 0, span: 3, tone: 'primary' },
          { id: 'tma-from', label: 'Point(var x1, var y1)', detail: 'nested record pattern', col: 0, row: 1, span: 2, tone: 'accent' },
          { id: 'tma-to', label: 'Point end', detail: 'type pattern', col: 2, row: 1, tone: 'accent' },
          { id: 'tma-x', label: 'var x1', detail: 'binds int x', col: 0, row: 2, tone: 'success' },
          { id: 'tma-y', label: 'var y1', detail: 'binds int y', col: 1, row: 2, tone: 'success' },
          { id: 'tma-end', label: 'end', detail: 'binds the whole Point', col: 2, row: 2, tone: 'success' },
        ],
        edges: [
          { from: 'tma-case', to: 'tma-from', label: 'component from' },
          { from: 'tma-case', to: 'tma-to', label: 'component to' },
          { from: 'tma-from', to: 'tma-x' },
          { from: 'tma-from', to: 'tma-y' },
          { from: 'tma-to', to: 'tma-end' },
        ],
      },
    ],
    variants: [
      {
        title: 'Kinds of casts and conversions',
        items: [
          { name: 'Widening primitive', summary: 'Smaller to larger numeric type; implicit and safe (int/long → float and long → double can lose precision, never magnitude).', support: 'supported', code: 'long l = 42;  double d = l;' },
          { name: 'Narrowing primitive', summary: 'Larger to smaller; needs an explicit cast and silently truncates or wraps.', support: 'supported', code: 'int i = (int) 3.99;   // 3\nbyte b = (byte) 200;  // -56' },
          { name: 'Boxing / unboxing', summary: 'Primitive to wrapper and back; implicit.', support: 'supported', code: 'Integer x = 5; int y = x;' },
          { name: 'Upcast (widening reference)', summary: 'Subtype to supertype; implicit and always safe.', support: 'supported', code: 'Animal a = new Dog();' },
          { name: 'Downcast (narrowing reference)', summary: 'Supertype to subtype; explicit and checked at run time (ClassCastException).', support: 'supported', note: 'Prefer an instanceof or switch pattern.', code: 'Dog d = (Dog) animal;' },
          { name: 'Intersection cast', summary: 'Cast to several types at once, mainly to make a lambda also Serializable.', support: 'supported', code: '(Runnable & Serializable) () -> run()' },
          { name: 'Unchecked cast to a generic type', summary: 'Compiles with a warning; the type argument is not checked at run time.', support: 'partial', code: '(List<String>) obj  // unchecked' },
        ],
      },
      {
        title: 'Pattern matching forms',
        items: [
          { name: 'Type pattern with instanceof (Java 16)', summary: 'Test, cast and bind in a condition.', support: 'supported', code: 'if (o instanceof String s && !s.isBlank())' },
          { name: 'Type pattern in switch (Java 21)', summary: 'Branch on the run-time type; exhaustive.', support: 'supported', code: 'case Integer i -> i * 2;' },
          { name: 'Guarded case (Java 21)', summary: 'A when clause refines a pattern; must precede the unguarded case.', support: 'supported', code: 'case Integer i when i > 100 -> "big";' },
          { name: 'Record pattern (Java 21)', summary: 'Deconstructs a record into its components; nests.', support: 'supported', code: 'case Point(int x, int y) -> x + y;' },
          { name: 'case null / case null, default (Java 21)', summary: 'Explicit null handling in a switch.', support: 'supported', code: 'case null, default -> "other";' },
          { name: 'Unnamed pattern _ (Java 22)', summary: 'Ignore components you do not need (JEP 456).', support: 'supported', code: 'case Point(int x, _) -> x;' },
          { name: 'Primitive type patterns', summary: 'case int i, instanceof byte b and similar.', support: 'partial', note: 'Preview only (JEP 507 in Java 25); requires --enable-preview.' },
        ],
      },
      {
        title: 'Where var is allowed',
        items: [
          { name: 'Local variable with initialiser', summary: 'The main use.', support: 'supported', code: 'var orders = new ArrayList<Order>();' },
          { name: 'for and enhanced-for variables', summary: 'Including try-with-resources variables.', support: 'supported', code: 'for (var e : map.entrySet())' },
          { name: 'Lambda parameters (Java 11)', summary: 'Useful to attach annotations; all-or-none.', support: 'supported', code: '(@NonNull var a, var b) -> a + b' },
          { name: 'Fields, method parameters, return types', summary: 'Not allowed: these are API, and must be explicit.', support: 'not-supported' },
          { name: 'Without an initialiser, null or array literal', summary: 'var x; var y = null; var z = {1, 2}; do not compile.', support: 'not-supported' },
        ],
      },
    ],
    deepDive: [
      {
        title: 'Exhaustiveness, remainders and MatchException',
        body: 'JEP 441 requires a pattern switch to be exhaustive. The compiler accepts a sealed hierarchy without `default` when every permitted subtype is covered, but it also tracks a **remainder** — values the switch does not handle that are considered impossible at compile time, such as an instance of a subclass added later by separate compilation. For those, the compiler inserts a fallback that throws `MatchException` (Java 21). That is a deliberate fail-fast, unlike an old `default` branch that would silently do something.',
        sources: [
          { label: 'JEP 441: Pattern Matching for switch', url: 'https://openjdk.org/jeps/441' },
          { label: 'JEP 440: Record Patterns', url: 'https://openjdk.org/jeps/440' },
        ],
      },
      {
        title: 'Dominance and the ordering rules',
        body: 'A case label is **dominated** if an earlier label matches everything it would match; the compiler rejects it (JLS §14.11.1). An unguarded `case Integer i` dominates `case Integer i when i > 0`, but a guarded case never dominates an unguarded one because the compiler cannot evaluate guards. Constant labels must also come before type patterns of the same type. These rules make the first-match semantics safe: unreachable branches are compile errors rather than dead code.',
        sources: [{ label: 'JLS §14.11.1: Switch Blocks', url: 'https://docs.oracle.com/javase/specs/jls/se21/html/jls-14.html#jls-14.11.1' }],
      },
      {
        title: 'var was designed for readability, not brevity',
        body: 'JEP 286 limited `var` to local variables precisely because locals have small scopes where the initialiser is nearby. Fields and signatures are part of an API and must stay explicit. The OpenJDK style guidance for `var` recommends choosing names that carry the type information, keeping scopes small, and avoiding `var` with the diamond or generic methods when inference would produce `Object`.',
        sources: [
          { label: 'JEP 286: Local-Variable Type Inference', url: 'https://openjdk.org/jeps/286' },
          { label: 'OpenJDK: Local Variable Type Inference Style Guidelines', url: 'https://openjdk.org/projects/amber/guides/lvti-style-guide' },
        ],
      },
    ],
  },
};
