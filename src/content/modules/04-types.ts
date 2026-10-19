import type { CurriculumModule } from '@/types/curriculum';

export const typesModule: CurriculumModule = {
  id: 'types',
  order: 4,
  title: 'Strings, Wrappers, Generics and the Type System',
  shortTitle: 'Strings & Types',
  summary: 'String immutability and the pool, boxing pitfalls, generics with wildcards and erasure, and modern pattern matching.',
  level: 'core',
  prerequisites: ['oop'],
  bossChallengeId: 'boss-event-log',
  lessons: [
    // -----------------------------------------------------------------------
    {
      id: 't-strings',
      moduleId: 'types',
      title: 'Strings: immutability, the pool and text processing',
      summary: 'Why Strings are immutable, when == lies, efficient building, and the APIs that trip people up.',
      estimatedMinutes: 35,
      difficulty: 'beginner',
      prerequisites: ['f-arrays-input'],
      versionNotes: [
        { feature: 'strip(), isBlank(), repeat(), lines()', since: 11 },
        { feature: 'Text blocks (""")', since: 15 },
        { feature: 'Compact strings (Latin-1 storage)', since: 9 },
      ],
      objectives: [
        'Explain String immutability and the string pool.',
        'Compare strings correctly and build them efficiently.',
        'Avoid split, trim and length pitfalls with real-world text.',
      ],
      plainEnglish: `A \`String\` is a sequence of characters that **can never change** once created. Methods like \`toUpperCase()\` return a *new* String; the original stays the same.

Because Strings are so common, Java keeps one shared copy of each string **literal** in a pool. That is why \`==\` sometimes appears to work for strings — and why you must never rely on it. Use \`equals\` to compare text.

When you build a string piece by piece in a loop, use a \`StringBuilder\`, which *is* mutable.

**Cheat sheet for comparing text:**
- \`a.equals(b)\` — same characters, exactly (case matters).
- \`a.equalsIgnoreCase(b)\` — same characters, ignoring upper/lower case.
- \`a.compareTo(b)\` — for **sorting**: a negative number means a comes first, 0 means equal, a positive number means a comes after. Only the sign matters.
- \`a == b\` — "are these the *same object*?" Almost never what you want for text.
- \`"literal".equals(input)\` or \`Objects.equals(a, b)\` — null-safe versions.`,
      technical: `### Immutability
A String's state is final and private (since Java 9 a \`byte[]\` plus a coder flag: Latin-1 or UTF-16, "compact strings"). Immutability makes Strings safe to share between threads, safe as HashMap keys (the hash is cached), and safe for security-sensitive values such as class names and file paths.

### The string pool
Literals and compile-time constant expressions are interned: every occurrence of \`"java"\` refers to the same pooled object (the pool lives in the heap since Java 7). \`new String("java")\` always creates a new object. \`intern()\` returns the pooled instance.

### Comparison
- \`equals\` compares characters; \`equalsIgnoreCase\` ignores case.
- \`compareTo\` orders lexicographically by UTF-16 code units (not locale-aware — use \`Collator\` for human sorting).
- \`==\` compares references and is almost always a bug for text.

### Building strings
\`a + b\` in a single expression is compiled efficiently (invokedynamic since Java 9). In a **loop**, \`s += x\` creates a new String each iteration → O(n²) copying. Use \`StringBuilder\` (not synchronized) rather than the legacy \`StringBuffer\` (synchronized). \`String.join\` and \`Collectors.joining\` are clearer for delimiters.

### Pitfalls
- \`split\` takes a **regular expression**: \`split(".")\` splits on every character and returns an empty array. Use \`split("\\\\.")\` or \`Pattern.quote\`. Trailing empty strings are removed unless you pass a negative limit.
- \`trim()\` only removes characters ≤ U+0020; \`strip()\` (Java 11) removes all Unicode whitespace.
- \`length()\` counts UTF-16 code units: an emoji outside the Basic Multilingual Plane has length 2 but one code point (\`codePointCount\`).
- \`toUpperCase()\`/\`toLowerCase()\` without a Locale use the default locale; in Turkish, \`"i".toUpperCase()\` is "İ". Use \`Locale.ROOT\` for identifiers.`,
      whyItExists: `Strings are used everywhere — keys, identifiers, class names, network messages. Making them immutable lets the JVM share, cache and pool them safely, and removes a whole category of aliasing bugs.`,
      whenToUse: [
        'Use `equals` (or `Objects.equals` for nullable values) to compare text.',
        'Use `StringBuilder` when appending in loops.',
        'Use text blocks for multi-line SQL, JSON and templates (Java 15+).',
        'Use `Locale.ROOT` for case conversion of identifiers and protocol values.',
      ],
      whenNotToUse: [
        'Do not compare strings with ==.',
        'Do not call `intern()` to save memory without measuring; the JVM can deduplicate strings itself (G1 string deduplication).',
        'Do not use `split` with user-provided separators without quoting them.',
      ],
      examples: [
        {
          id: 'pool',
          title: 'Immutability and the pool',
          runnable: true,
          code: `public class Main {
    public static void main(String[] args) {
        String a = "java";
        String b = "java";
        String c = new String("java");
        String d = c.intern();

        System.out.println(a == b);       // same pooled literal
        System.out.println(a == c);       // new object
        System.out.println(a.equals(c));  // same characters
        System.out.println(a == d);       // intern returns the pooled one

        String upper = a.toUpperCase();
        System.out.println(a + " " + upper);
    }
}`,
          expectedOutput: `true
false
true
true
java JAVA`,
        },
        {
          id: 'pitfalls',
          title: 'split, strip and length pitfalls',
          runnable: true,
          code: `import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        String version = "21.0.4";
        System.out.println(version.split(".").length);
        System.out.println(Arrays.toString(version.split("\\\\.")));

        String csv = "a,b,,c,,";
        System.out.println(csv.split(",").length);
        System.out.println(csv.split(",", -1).length);

        String padded = "\\u2003 hello \\u2003";          // em spaces around the text
        System.out.println(padded.trim().length() + " " + padded.strip().length());

        String smile = "\\uD83D\\uDE00";                     // one emoji
        System.out.println(smile.length() + " " + smile.codePointCount(0, smile.length()));

        StringBuilder sb = new StringBuilder();
        for (int i = 1; i <= 5; i++) sb.append(i).append(i < 5 ? "-" : "");
        System.out.println(sb.reverse());
    }
}`,
          expectedOutput: `0
[21, 0, 4]
4
6
9 5
2 1
5-4-3-2-1`,
        },
        {
          id: 'text-block',
          title: 'Text blocks',
          runnable: true,
          minJavaVersion: 15,
          code: `public class Main {
    public static void main(String[] args) {
        String json = """
            {
              "name": "JavaForge",
              "level": %d
            }
            """.formatted(3);
        System.out.print(json);
        System.out.println(json.lines().count() + " lines");
    }
}`,
          expectedOutput: `{
  "name": "JavaForge",
  "level": 3
}
4 lines`,
          explanation: 'Indentation common to all lines (relative to the closing delimiter) is stripped. `formatted` is the instance form of String.format.',
        },
        {
          id: 't-strings-compare',
          title: 'equals, equalsIgnoreCase, compareTo and StringBuilder',
          runnable: true,
          code: `import java.util.Objects;

public class Main {
    public static void main(String[] args) {
        String typed = "Admin";
        String stored = "admin";
        System.out.println(typed.equals(stored));            // case matters
        System.out.println(typed.equalsIgnoreCase(stored));  // case ignored

        System.out.println("apple".compareTo("banana"));     // negative: apple sorts first
        System.out.println("banana".compareTo("apple"));     // positive: banana sorts after
        System.out.println("Zebra".compareTo("apple"));      // uppercase sorts before lowercase
        System.out.println("app".compareTo("apple"));        // a prefix sorts first

        String missing = null;
        System.out.println("admin".equals(missing));         // null-safe: literal first
        System.out.println(Objects.equals(missing, null));   // null-safe for two variables

        StringBuilder sb = new StringBuilder("Java");
        sb.append(21).insert(0, "Hello ").append('!');       // mutates the same builder
        System.out.println(sb + " (length " + sb.length() + ")");
    }
}`,
          expectedOutput: `false
true
-1
1
-7
-2
false
true
Hello Java21! (length 13)`,
          explanation:
            '`compareTo` subtracts the first differing characters (`\'a\' - \'b\'` is -1, `\'Z\' - \'a\'` is 90 - 97 = -7) or, when one string is a prefix of the other, the lengths (3 - 5 = -2). Rely only on the sign, never on the exact number. `StringBuilder` methods change the builder itself and return it, so calls can be chained.',
        },
      ],
      walkthrough: {
        exampleId: 'pitfalls',
        steps: [
          { lines: [5, 6], text: '"." is a regex matching any character, so every character is a delimiter; all resulting empty strings are trailing and removed, leaving an empty array.' },
          { lines: [7, 7], text: 'Escaping the dot (\\\\. in Java source, \\. in the regex) splits on literal dots.' },
          { lines: [9, 11], text: 'Trailing empty strings are dropped by default ([a, b, "", c] → 4). A negative limit keeps them (6).' },
          { lines: [13, 14], text: 'trim() only strips characters ≤ U+0020, so the em spaces (U+2003) stay: length 9. strip() removes them: length 5.' },
          { lines: [16, 17], text: 'The emoji is a surrogate pair: two UTF-16 code units but a single code point.' },
          { lines: [19, 21], text: 'StringBuilder appends in place and can reverse the whole sequence.' },
        ],
      },
      realWorld: {
        title: 'A login that failed only in Turkey',
        scenario: `A service normalised usernames with \`username.toLowerCase()\` and compared them with stored lowercase names. Turkish users whose names contained "I" could not log in: under the Turkish locale, "I".toLowerCase() is the dotless "ı", not "i".

The fix was \`toLowerCase(Locale.ROOT)\` for all identifiers and protocol values, plus a static analysis rule that flags locale-sensitive calls without an explicit Locale.`,
      },
      commonMistakes: [
        {
          mistake: 'Comparing user input with == because it "worked in tests".',
          why: 'Tests used literals (pooled); real input is created at runtime and is a different object.',
          fix: 'Use equals, or `"expected".equals(input)` to be null-safe.',
        },
        {
          mistake: 'Building large strings with += in a loop.',
          why: 'Each iteration copies the whole string so far — quadratic time.',
          fix: 'Use StringBuilder, String.join or Collectors.joining.',
        },
        {
          mistake: 'Calling a String method and ignoring the result.',
          why: '`s.trim();` does nothing to s; Strings are immutable.',
          fix: 'Assign the result: `s = s.trim();`.',
        },
      ],
      checks: [
        {
          id: 't1-c1',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this print?',
          code: `public class Main {
    public static void main(String[] args) {
        String s = "  Hello  ";
        s.trim();
        s.toUpperCase();
        System.out.println("[" + s + "]");
    }
}`,
          options: [
            { id: 'a', text: '[HELLO]' },
            { id: 'b', text: '[  Hello  ]' },
            { id: 'c', text: '[Hello]' },
            { id: 'd', text: '[  HELLO  ]' },
          ],
          correctOptionId: 'b',
          explanation: 'Both calls return new Strings that are thrown away. `s` still refers to the original.',
        },
        {
          id: 't1-c2',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this print?',
          code: `public class Main {
    public static void main(String[] args) {
        String part = "Fo";
        String a = "Forge";
        String b = part + "rge";
        String c = "Fo" + "rge";
        System.out.println((a == b) + " " + (a == c) + " " + a.equals(b));
    }
}`,
          options: [
            { id: 'a', text: 'true true true' },
            { id: 'b', text: 'false true true' },
            { id: 'c', text: 'false false true' },
            { id: 'd', text: 'true false true' },
          ],
          correctOptionId: 'b',
          explanation: '`"Fo" + "rge"` is a compile-time constant and is pooled. `part + "rge"` is computed at runtime because `part` is not final.',
        },
        {
          id: 't1-c3',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this print?',
          code: `public class Main {
    public static void main(String[] args) {
        String[] parts = "2026|10|18".split("|");
        System.out.println(parts.length);
    }
}`,
          options: [
            { id: 'a', text: '3' },
            { id: 'b', text: '10' },
            { id: 'c', text: '1' },
            { id: 'd', text: '0' },
          ],
          correctOptionId: 'b',
          explanation:
            '`|` is regex alternation of two empty patterns, which matches between every character, so the string is split into its 10 characters. Use `split("\\\\|")` or `Pattern.quote("|")`.',
          hints: ['split takes a regular expression.', 'What does | mean in a regex?'],
        },
        {
          id: 't1-c4',
          kind: 'multi-select',
          dimension: 'conceptual',
          prompt: 'Which are genuine benefits of String immutability? Select all that apply.',
          options: [
            { id: 'a', text: 'Strings can be shared between threads without synchronization' },
            { id: 'b', text: 'The hash code can be cached, making Strings efficient HashMap keys' },
            { id: 'c', text: 'Literals can be pooled and shared safely' },
            { id: 'd', text: 'Appending in a loop is fast' },
          ],
          correctOptionIds: ['a', 'b', 'c'],
          explanation: 'Immutability makes repeated appends slow (each creates a new String) — which is why StringBuilder exists.',
        },
        {
          id: 't1-c5',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'Which class should you use to build a string inside a single-threaded loop?',
          options: [
            { id: 'a', text: 'StringBuffer, because it is thread-safe' },
            { id: 'b', text: 'StringBuilder' },
            { id: 'c', text: 'String with +=' },
            { id: 'd', text: 'char[] always' },
          ],
          correctOptionId: 'b',
          explanation: 'StringBuilder has the same API as StringBuffer without synchronization overhead. Builders are rarely shared between threads anyway.',
        },
      ],
      challengeIds: ['ch-palindrome', 'ch-rle'],
      masteryCriteria: [
        'Explain the pool and predict == results for literals vs runtime strings.',
        'Use split, strip and code points correctly on real-world text.',
        'Choose StringBuilder or joining APIs appropriately.',
      ],
      relatedLessonIds: ['p-bytecode', 't-wrappers'],
      revision: [
        { id: 'r1', question: 'Why can == appear to work for strings?', answer: 'Literals and constant expressions are interned, so identical literals share one object. Runtime-created strings are separate objects; always use equals.' },
        { id: 'r2', question: 'What does "a.b.c".split(".") return and why?', answer: 'An empty array: "." is a regex matching any character, and trailing empty strings are removed. Use split("\\\\.").' },
        { id: 'r3', question: 'trim() vs strip()?', answer: 'trim removes characters ≤ U+0020; strip (Java 11) removes all Unicode whitespace.' },
      ],
    },

    // -----------------------------------------------------------------------
    {
      id: 't-wrappers',
      moduleId: 'types',
      title: 'Wrapper classes, autoboxing and their traps',
      summary: 'Integer caching, null unboxing, equality across wrapper types and overload surprises.',
      estimatedMinutes: 25,
      difficulty: 'intermediate',
      prerequisites: ['t-strings'],
      objectives: [
        'Explain autoboxing and unboxing and when they happen.',
        'Predict == on wrappers, including the Integer cache.',
        'Avoid NullPointerException from unboxing.',
      ],
      plainEnglish: `Collections and generics only hold objects, so each primitive has a **wrapper** class: \`int\` → \`Integer\`, \`double\` → \`Double\`, \`boolean\` → \`Boolean\`, and so on.

Java converts automatically between them: **autoboxing** turns \`5\` into an \`Integer\`; **unboxing** turns an \`Integer\` back into an \`int\`. It is convenient but hides two traps: an \`Integer\` can be \`null\` (unboxing it crashes), and \`==\` on two \`Integer\`s compares objects, not numbers.

**The eight pairs** (note the two irregular names):
- \`byte\` → \`Byte\`, \`short\` → \`Short\`, \`int\` → **\`Integer\`**, \`long\` → \`Long\`
- \`float\` → \`Float\`, \`double\` → \`Double\`
- \`char\` → **\`Character\`**, \`boolean\` → \`Boolean\`

Wrappers are also where the handy helpers live: \`Integer.parseInt("42")\` turns text into a number, \`Integer.MAX_VALUE\` is the largest int, and \`Character.isDigit('7')\` checks a character.`,
      technical: `### Boxing mechanics
Autoboxing compiles to \`Integer.valueOf(i)\`; unboxing to \`i.intValue()\`. Unboxing a null reference throws \`NullPointerException\` at that point — often in a line that looks purely numeric, such as \`int total = map.get(key);\`.

### The Integer cache
\`Integer.valueOf\` returns cached instances for −128…127 (the upper bound is configurable with \`-XX:AutoBoxCacheMax\`). So \`Integer a = 127, b = 127; a == b\` is true but with 128 it is false. \`Short\`, \`Byte\`, \`Character\` (0–127), \`Long\` and \`Boolean\` cache too; \`Float\`/\`Double\` do not. The wrapper constructors (\`new Integer(5)\`) are deprecated for removal.

### Equality
- \`==\` between two wrapper objects compares references.
- \`==\` between a wrapper and a primitive unboxes the wrapper and compares values (and may throw NPE).
- \`equals\` requires the same wrapper type: \`Long.valueOf(1).equals(1)\` is false because \`1\` boxes to Integer.

### Surprises
- **Ternary unboxing**: \`flag ? nullableInteger : 0\` has type \`int\`, so a null is unboxed → NPE.
- **List.remove**: \`List<Integer>.remove(1)\` calls \`remove(int index)\`; \`remove(Integer.valueOf(1))\` removes the value.
- **Performance**: boxing in hot loops allocates objects; use primitive arrays or \`IntStream\` where it matters.`,
      whyItExists: `Generics work only with reference types, so wrappers let primitives live in collections. Autoboxing (Java 5) removed the noise of manual conversion, at the cost of hiding object semantics behind numeric-looking code.`,
      whenToUse: [
        'Use wrappers in collections, generics and nullable database columns.',
        'Use primitives for local arithmetic, counters and fields that can never be absent.',
        'Use `equals` or unbox explicitly when comparing wrapper values.',
      ],
      whenNotToUse: [
        'Do not use `==` to compare two wrapper objects.',
        'Do not use a nullable wrapper where a primitive with a sensible default would do.',
        'Do not box inside performance-critical loops.',
      ],
      examples: [
        {
          id: 'cache',
          title: 'Caching, equality and null unboxing',
          runnable: true,
          code: `import java.util.HashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        Integer a = 127, b = 127;
        Integer c = 128, d = 128;
        System.out.println((a == b) + " " + (c == d) + " " + c.equals(d));

        Long big = 10L;
        System.out.println(big.equals(10) + " " + big.equals(10L) + " " + (big == 10));

        Map<String, Integer> stock = new HashMap<>();
        try {
            int pens = stock.get("pen");              // unboxing null
            System.out.println(pens);
        } catch (NullPointerException e) {
            System.out.println("NPE while unboxing");
        }
        int safe = stock.getOrDefault("pen", 0);
        System.out.println(safe);
    }
}`,
          expectedOutput: `true false true
false true true
NPE while unboxing
0`,
        },
        {
          id: 'remove',
          title: 'remove(int) vs remove(Object)',
          runnable: true,
          code: `import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<Integer> ids = new ArrayList<>(List.of(10, 20, 30, 1));
        ids.remove(1);                     // removes the element at index 1 (20)
        System.out.println(ids);
        ids.remove(Integer.valueOf(1));    // removes the value 1
        System.out.println(ids);
    }
}`,
          expectedOutput: `[10, 30, 1]
[10, 30]`,
        },
        {
          id: 't-wrappers-helpers',
          title: 'Parsing text and the static helpers on wrappers',
          runnable: true,
          code: `public class Main {
    public static void main(String[] args) {
        int port = Integer.parseInt("8080");          // String -> int
        Integer boxed = Integer.valueOf("8080");      // String -> Integer
        double price = Double.parseDouble("19.99");
        boolean on = Boolean.parseBoolean("TRUE");    // ignores case
        System.out.println(port + 1);
        System.out.println(boxed.equals(port));       // port is boxed to Integer
        System.out.println(price * 2);
        System.out.println(on);

        System.out.println(Integer.MAX_VALUE + " " + Integer.MIN_VALUE);
        System.out.println(Integer.compare(3, 7) + " " + Integer.toBinaryString(10));
        System.out.println(Character.isDigit('7') + " " + Character.toUpperCase('q'));
        System.out.println(Byte.MAX_VALUE + " " + Short.MAX_VALUE + " " + Long.SIZE);
    }
}`,
          expectedOutput: `8081
true
39.98
true
2147483647 -2147483648
-1 1010
true Q
127 32767 64`,
          explanation:
            '`parseXxx` returns a primitive; `valueOf` returns a wrapper (possibly a cached one). Both throw NumberFormatException for text that is not a number — except `Boolean.parseBoolean`, which returns false for anything other than "true" (any case). `Integer.compare` is the overflow-safe way to compare ints in a Comparator.',
        },
      ],
      walkthrough: {
        exampleId: 'cache',
        steps: [
          { lines: [6, 8], text: 'Autoboxing calls Integer.valueOf. 127 comes from the cache (same object, == is true); 128 creates two objects (== is false). equals compares values.' },
          { lines: [10, 11], text: '`big.equals(10)` boxes 10 to an Integer; a Long never equals an Integer. `big == 10` unboxes big and compares numerically.' },
          { lines: [13, 19], text: 'get returns null for a missing key; assigning it to an int unboxes null and throws NullPointerException.' },
          { lines: [20, 21], text: 'getOrDefault avoids the null entirely.' },
        ],
      },
      realWorld: {
        title: 'Duplicate detection that broke at 128',
        scenario: `A reconciliation job compared counts from two systems using \`Map<String, Integer>\` and \`if (left.get(k) == right.get(k))\`. In testing, counts were small and the check passed. In production, any count above 127 was reported as a mismatch, flooding the operations team with false alarms.

The comparison was comparing Integer objects, and only cached values (−128…127) shared identity. Replacing it with \`Objects.equals(left.get(k), right.get(k))\` fixed it; an IDE inspection for "number objects compared with ==" now fails the build.`,
      },
      commonMistakes: [
        {
          mistake: 'Comparing Integer objects with ==.',
          why: 'It compares references; only cached values happen to be identical.',
          fix: 'Use equals / Objects.equals, or unbox to int first.',
        },
        {
          mistake: '`int count = map.get(key);` for a key that may be missing.',
          why: 'get returns null and unboxing null throws NPE.',
          fix: 'Use getOrDefault, merge, or keep the Integer and check for null.',
        },
        {
          mistake: 'Calling `list.remove(someInt)` on a List<Integer> meaning the value.',
          why: 'The int overload removes by index.',
          fix: 'Use `remove(Integer.valueOf(x))`.',
        },
      ],
      checks: [
        {
          id: 't2-c1',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this print?',
          code: `public class Main {
    public static void main(String[] args) {
        Integer x = 100, y = 100;
        Integer p = 1000, q = 1000;
        System.out.println((x == y) + " " + (p == q) + " " + (p == 1000));
    }
}`,
          options: [
            { id: 'a', text: 'true true true' },
            { id: 'b', text: 'true false true' },
            { id: 'c', text: 'true false false' },
            { id: 'd', text: 'false false true' },
          ],
          correctOptionId: 'b',
          explanation: '100 is cached; 1000 is not, so p and q are distinct objects. `p == 1000` compares a wrapper with a primitive, which unboxes p.',
        },
        {
          id: 't2-c2',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this print?',
          code: `public class Main {
    public static void main(String[] args) {
        Integer discount = null;
        boolean member = true;
        try {
            int applied = member ? discount : 0;
            System.out.println(applied);
        } catch (NullPointerException e) {
            System.out.println("NPE");
        }
    }
}`,
          options: [
            { id: 'a', text: '0' },
            { id: 'b', text: 'null' },
            { id: 'c', text: 'NPE' },
            { id: 'd', text: 'Compile error' },
          ],
          correctOptionId: 'c',
          explanation: 'The ternary mixes Integer and int, so its type is int and `discount` is unboxed — null → NullPointerException.',
        },
        {
          id: 't2-c3',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this print?',
          code: `import java.util.HashSet;
import java.util.Set;

public class Main {
    public static void main(String[] args) {
        Set<Long> ids = new HashSet<>();
        ids.add(42L);
        int lookup = 42;
        System.out.println(ids.contains(lookup) + " " + ids.contains((long) lookup));
    }
}`,
          options: [
            { id: 'a', text: 'true true' },
            { id: 'b', text: 'false true' },
            { id: 'c', text: 'false false' },
            { id: 'd', text: 'Compile error' },
          ],
          correctOptionId: 'b',
          explanation: 'contains(Object) boxes the int to an Integer, and Integer(42) is never equal to Long(42). Casting to long boxes to Long.',
          hints: ['contains takes Object. Which wrapper type does an int box to?'],
        },
        {
          id: 't2-c4',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'Why is `new Integer(5)` discouraged?',
          options: [
            { id: 'a', text: 'It is slower to type' },
            { id: 'b', text: 'It always allocates and bypasses the cache; the constructors are deprecated for removal' },
            { id: 'c', text: 'It returns an int' },
            { id: 'd', text: 'It is not thread-safe' },
          ],
          correctOptionId: 'b',
          explanation: 'Integer.valueOf (and autoboxing) can reuse cached instances. The constructors were deprecated in Java 9 and marked for removal in Java 16.',
        },
      ],
      challengeIds: ['ch-integer-compare'],
      masteryCriteria: [
        'Predict == and equals results across wrapper types and the cache range.',
        'Spot null-unboxing NPEs, including in ternaries.',
        'Choose primitives vs wrappers deliberately.',
      ],
      relatedLessonIds: ['f-types-operators', 'c-collections-overview'],
      revision: [
        { id: 'r1', question: 'What range does the Integer cache cover by default?', answer: '−128 to 127.' },
        { id: 'r2', question: 'Why does `Long.valueOf(1).equals(1)` return false?', answer: 'The int 1 is boxed to an Integer, and Long.equals only returns true for another Long with the same value.' },
        { id: 'r3', question: 'How can `int x = cond ? wrapper : 0;` throw an NPE?', answer: 'The conditional has type int, so the wrapper is unboxed; if it is null, unboxing throws NullPointerException.' },
      ],
    },

    // -----------------------------------------------------------------------
    {
      id: 't-generics',
      moduleId: 'types',
      title: 'Generics, wildcards and type erasure',
      summary: 'Type-safe containers and methods, bounded types, PECS and what erasure means at runtime.',
      estimatedMinutes: 40,
      difficulty: 'intermediate',
      prerequisites: ['o-interfaces'],
      objectives: [
        'Write generic classes and methods with bounds.',
        'Choose between ? extends and ? super using PECS.',
        'Explain type erasure and its consequences.',
        'Contrast invariant generics with covariant arrays.',
      ],
      plainEnglish: `**Generics** let you write a class or method once and use it with many types while the compiler still checks types: a \`List<String>\` will refuse to accept an \`Integer\`, and you never need to cast when reading from it.

The type in angle brackets is a **type parameter**. You can restrict it — \`<T extends Comparable<T>>\` means "any T that can be compared" — and you can use **wildcards** (\`?\`) when a method can accept several related types.

**Where the angle brackets go** (the part beginners mix up):
- Generic **class**: after the class name — \`class Box<T> { T value; }\`, used as \`Box<String>\`.
- Generic **method**: *before* the return type — \`static <T> T first(List<T> list)\`. The \`<T>\` declares T; the return type then uses it.
- Type parameter names are single capital letters by convention: \`T\` type, \`E\` element, \`K\`/\`V\` key/value, \`R\` result.
- Type arguments must be reference types: \`List<int>\` does not compile; use \`List<Integer>\`.`,
      technical: `### Invariance
\`List<String>\` is **not** a subtype of \`List<Object>\`, even though String is a subtype of Object. If it were, you could add an Integer to a list of Strings through the Object view. Arrays, by contrast, are **covariant** (\`String[]\` is an \`Object[]\`), which is why storing the wrong type fails at runtime with \`ArrayStoreException\`.

### Wildcards and PECS
- \`List<? extends Number>\`: you can **read** Numbers from it but cannot add (except null) — a **producer**.
- \`List<? super Integer>\`: you can **add** Integers to it, but reads only give Object — a **consumer**.
- **PECS**: "Producer Extends, Consumer Super". \`Collections.copy(List<? super T> dest, List<? extends T> src)\` is the canonical example.
- \`List<?>\`: unknown type — read as Object, add nothing.

### Bounded type parameters
\`<T extends Comparable<? super T>> T max(Collection<? extends T> items)\` accepts types whose comparison is inherited from a supertype (e.g. \`java.sql.Timestamp\`).

### Type erasure
Generics are a compile-time feature. The compiler checks types, inserts casts and then **erases** type parameters to their bounds (usually Object). Consequences:
- \`new ArrayList<String>().getClass() == new ArrayList<Integer>().getClass()\`.
- You cannot write \`new T()\`, \`new T[n]\`, \`instanceof List<String>\`, or overload \`m(List<String>)\` with \`m(List<Integer>)\`.
- **Raw types** (\`List\` without parameters) disable checks and allow heap pollution: the ClassCastException appears later, far from the bug.
- Generic type information survives in class metadata (signatures), which frameworks read via reflection, but not on individual objects.`,
      whyItExists: `Before Java 5, collections held Object and every read required a cast that could fail at runtime. Generics move those failures to compile time. Erasure was chosen so generic code would stay binary-compatible with the huge amount of pre-generics code.`,
      whenToUse: [
        'Use generics for containers, result types and reusable algorithms.',
        'Use bounded wildcards in method parameters to make APIs flexible (PECS).',
        'Use `List<?>` when you only need Object-level operations.',
      ],
      whenNotToUse: [
        'Do not use raw types in new code.',
        'Do not put wildcards in return types; callers then have to deal with them.',
        'Do not over-generify simple code — a method used with one type does not need a type parameter.',
      ],
      examples: [
        {
          id: 'bounded',
          title: 'Bounded generic method and PECS',
          runnable: true,
          code: `import java.util.ArrayList;
import java.util.List;

public class Main {
    static <T extends Comparable<? super T>> T max(List<? extends T> items) {
        T best = items.get(0);
        for (T item : items) {
            if (item.compareTo(best) > 0) best = item;
        }
        return best;
    }

    static double sum(List<? extends Number> numbers) {     // producer: extends
        double total = 0;
        for (Number n : numbers) total += n.doubleValue();
        return total;
    }

    static void addDefaults(List<? super Integer> sink) {    // consumer: super
        sink.add(1);
        sink.add(2);
    }

    public static void main(String[] args) {
        System.out.println(max(List.of(3, 9, 4)));
        System.out.println(max(List.of("pear", "apple", "zucchini")));
        System.out.println(sum(List.of(1, 2.5, 3L)));

        List<Number> numbers = new ArrayList<>();
        addDefaults(numbers);
        List<Object> objects = new ArrayList<>();
        addDefaults(objects);
        System.out.println(numbers + " " + objects);
    }
}`,
          expectedOutput: `9
zucchini
6.5
[1, 2] [1, 2]`,
        },
        {
          id: 'erasure',
          title: 'Erasure, raw types and covariant arrays',
          runnable: true,
          code: `import java.util.ArrayList;
import java.util.List;

public class Main {
    @SuppressWarnings({"rawtypes", "unchecked"})
    public static void main(String[] args) {
        System.out.println(new ArrayList<String>().getClass() == new ArrayList<Integer>().getClass());

        List<String> names = new ArrayList<>();
        List raw = names;            // raw type: no checks
        raw.add(42);                 // heap pollution, no error here
        try {
            String first = names.get(0);   // compiler-inserted cast fails here
            System.out.println(first);
        } catch (ClassCastException e) {
            System.out.println("ClassCastException when reading");
        }

        Object[] array = new String[1];    // arrays are covariant
        try {
            array[0] = 42;
        } catch (ArrayStoreException e) {
            System.out.println("ArrayStoreException: " + e.getMessage());
        }
    }
}`,
          expectedOutput: `true
ClassCastException when reading
ArrayStoreException: java.lang.Integer`,
        },
        {
          id: 't-generics-class',
          title: 'Writing your own generic class, record and method',
          runnable: true,
          code: `import java.util.List;
import java.util.function.Function;

class Box<T> {                                    // T is declared after the class name
    private final T value;
    Box(T value) { this.value = value; }
    T get() { return value; }
    <R> Box<R> map(Function<? super T, ? extends R> f) {   // a generic method inside
        return new Box<>(f.apply(value));
    }
}

record Pair<K, V>(K key, V value) {}              // records can be generic too

public class Main {
    static <T> T firstOrDefault(List<T> items, T fallback) {   // <T> before the return type
        return items.isEmpty() ? fallback : items.get(0);
    }

    public static void main(String[] args) {
        Box<String> name = new Box<>("forge");
        String s = name.get();                    // no cast needed
        Box<Integer> length = name.map(String::length);
        System.out.println(s + " " + length.get());

        Pair<String, Integer> score = new Pair<>("Ada", 95);
        System.out.println(score.key() + "=" + score.value());

        System.out.println(firstOrDefault(List.of("x", "y"), "none"));
        System.out.println(firstOrDefault(List.of(), "none"));
        System.out.println(Main.<Integer>firstOrDefault(List.of(), -1));
    }
}`,
          expectedOutput: `forge 5
Ada=95
x
none
-1`,
          explanation:
            'The diamond `new Box<>(...)` lets the compiler infer the type argument from the declaration. Type arguments for generic methods are normally inferred from the arguments; `Main.<Integer>firstOrDefault(...)` shows the rarely needed explicit form.',
        },
      ],
      walkthrough: {
        exampleId: 'bounded',
        steps: [
          { lines: [5, 11], text: 'T must be comparable to itself or a supertype. `? extends T` lets callers pass a list of any subtype.' },
          { lines: [13, 17], text: 'A producer: we only read Numbers out of the list, so `? extends Number` accepts List<Integer>, List<Double> or a mixed List<Number>.' },
          { lines: [19, 22], text: 'A consumer: we only put Integers in, so `? super Integer` accepts List<Integer>, List<Number> or List<Object>.' },
          { lines: [25, 27], text: 'Type inference picks T = Integer, then T = String, without any explicit type arguments.' },
          { lines: [29, 33], text: 'The same consumer method fills both a List<Number> and a List<Object>.' },
        ],
      },
      realWorld: {
        title: 'A ClassCastException reported far from its cause',
        scenario: `A legacy module returned a raw \`List\` that a newer module assigned to \`List<OrderId>\`. Months later, a change added plain \`String\` IDs to that raw list. The failure surfaced as a ClassCastException inside a reporting job that merely iterated the list — hours after and modules away from the bad write.

Enabling \`-Xlint:unchecked\` with \`-Werror\` exposed the raw-type boundary at compile time, and replacing the raw list with \`List<OrderId>\` made the bad write a compile error.`,
      },
      commonMistakes: [
        {
          mistake: 'Expecting `List<Integer>` to be assignable to `List<Number>`.',
          why: 'Generics are invariant; it would allow adding a Double to a list of Integers.',
          fix: 'Accept `List<? extends Number>` when you only read.',
        },
        {
          mistake: 'Ignoring unchecked warnings.',
          why: 'They mark places where type safety is no longer guaranteed.',
          fix: 'Fix them or document with a narrowly scoped @SuppressWarnings and a reason.',
        },
        {
          mistake: 'Trying `new T[size]`.',
          why: 'Erasure means the runtime does not know T.',
          fix: 'Use a List<T>, or pass an IntFunction<T[]> / Class<T> into the method.',
        },
      ],
      checks: [
        {
          id: 't3-c1',
          kind: 'predict-output',
          dimension: 'conceptual',
          prompt: 'What happens when you compile this?',
          code: `import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<String> strings = new ArrayList<>();
        List<Object> objects = strings;
        objects.add(1);
        System.out.println(strings.size());
    }
}`,
          options: [
            { id: 'a', text: '1' },
            { id: 'b', text: 'Compile error: incompatible types' },
            { id: 'c', text: 'Runtime ClassCastException' },
            { id: 'd', text: '0' },
          ],
          correctOptionId: 'b',
          expectCompileError: true,
          explanation: 'Generics are invariant: List<String> is not a List<Object>. This is exactly the hole invariance prevents.',
        },
        {
          id: 't3-c2',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'A method copies elements from `src` into `dest`. What signature follows PECS?',
          options: [
            { id: 'a', text: '<T> void copy(List<T> dest, List<T> src)' },
            { id: 'b', text: '<T> void copy(List<? super T> dest, List<? extends T> src)' },
            { id: 'c', text: '<T> void copy(List<? extends T> dest, List<? super T> src)' },
            { id: 'd', text: 'void copy(List<?> dest, List<?> src)' },
          ],
          correctOptionId: 'b',
          explanation: 'src produces Ts (extends), dest consumes Ts (super). Option d cannot add anything to dest.',
        },
        {
          id: 't3-c3',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this print?',
          code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<String> a = new ArrayList<>();
        List<Integer> b = new ArrayList<>();
        Map<String, List<Double>> c = new HashMap<>();
        System.out.println((a.getClass() == b.getClass()) + " " + c.getClass().getSimpleName());
    }
}`,
          options: [
            { id: 'a', text: 'false HashMap<String, List<Double>>' },
            { id: 'b', text: 'true HashMap' },
            { id: 'c', text: 'false HashMap' },
            { id: 'd', text: 'true HashMap<String, List<Double>>' },
          ],
          correctOptionId: 'b',
          explanation: 'Type arguments are erased; at runtime both lists are plain ArrayList and the map is a plain HashMap.',
        },
        {
          id: 't3-c4',
          kind: 'mcq',
          dimension: 'runtime',
          prompt: '`Object[] arr = new String[2]; arr[0] = 1;` — what happens?',
          options: [
            { id: 'a', text: 'Compile error' },
            { id: 'b', text: 'It works; arr[0] holds 1' },
            { id: 'c', text: 'ArrayStoreException at runtime' },
            { id: 'd', text: 'ClassCastException at runtime' },
          ],
          correctOptionId: 'c',
          explanation: 'Arrays are covariant and remember their component type, so the store is checked at runtime. Generics move such errors to compile time instead.',
        },
      ],
      challengeIds: ['ch-generic-stats'],
      masteryCriteria: [
        'Write a bounded generic method and explain each bound.',
        'Apply PECS to an API signature.',
        'Explain what erasure prevents you from writing and why.',
      ],
      relatedLessonIds: ['c-collections-overview', 'fn-lambdas'],
      revision: [
        { id: 'r1', question: 'What does PECS stand for?', answer: 'Producer Extends, Consumer Super: use ? extends T for sources you read from and ? super T for sinks you write to.' },
        { id: 'r2', question: 'Why is List<String> not a List<Object>?', answer: 'Generics are invariant; otherwise you could add a non-String through the List<Object> view and corrupt the list.' },
        { id: 'r3', question: 'Name two things type erasure prevents.', answer: 'new T(), new T[n], instanceof List<String>, overloading methods that differ only in type arguments, and getting T at runtime from an instance.' },
      ],
    },

    // -----------------------------------------------------------------------
    {
      id: 't-modern-types',
      moduleId: 'types',
      title: 'var, casting and pattern matching',
      summary: 'Local type inference, safe casting with instanceof patterns, and switch/record patterns in Java 21.',
      estimatedMinutes: 35,
      difficulty: 'intermediate',
      prerequisites: ['t-generics', 'o-interfaces'],
      versionNotes: [
        { feature: 'var for local variables', since: 10 },
        { feature: 'Pattern matching for instanceof', since: 16 },
        { feature: 'Pattern matching for switch, record patterns', since: 21 },
      ],
      objectives: [
        'Use var where it improves readability and know its limits.',
        'Replace cast chains with instanceof and switch patterns.',
        'Deconstruct records with record patterns.',
        'Handle null explicitly in pattern switches.',
      ],
      plainEnglish: `Modern Java removes a lot of ceremony:

- \`var\` lets the compiler infer a local variable's type from its initialiser: \`var orders = new ArrayList<Order>();\`. The type is still fixed at compile time — Java does not become dynamically typed.
- **Pattern matching** combines "check the type" and "cast it" into one step: \`if (obj instanceof String s)\` gives you \`s\` already typed.
- **Switch patterns** (Java 21) let one switch branch on types and even on the contents of records.

**Two different kinds of cast** — beginners often mix them up:
- **Primitive casts** convert a value. Widening (\`int\` → \`long\` → \`double\`) is automatic and safe; narrowing (\`(int) 3.99\`) must be written explicitly and can lose information — it truncates to 3, it does not round.
- **Reference casts** do not change the object at all; they change how the compiler lets you *view* it. An upcast (\`Object o = "text"\`) is automatic; a downcast (\`(String) o\`) is checked when the program runs and throws \`ClassCastException\` if the object is not really that type. Pattern matching replaces most downcasts.`,
      technical: `### var
Only for local variables with an initialiser (and loop variables, lambda parameters since 11). Not for fields, method parameters or return types. \`var x = null;\` and \`var arr = {1, 2};\` do not compile. \`var list = new ArrayList<>();\` infers \`ArrayList<Object>\` — usually not what you want.

### Casting
A downcast (\`(Dog) animal\`) is checked at runtime and throws \`ClassCastException\` if wrong. Upcasts are implicit. Classic code tested with instanceof then cast; patterns do both:
\`\`\`java
if (shape instanceof Circle c && c.radius() > 10) { ... }
\`\`\`
The binding \`c\` is in scope only where the match is definitely true (flow scoping).

### Pattern matching for switch (Java 21)
- Type patterns: \`case Integer i ->\`
- Guards: \`case Integer i when i > 100 ->\`
- Record patterns: \`case Point(int x, int y) ->\`, which can nest.
- \`case null\` handles null explicitly; without it, a switch on null throws NullPointerException (as switch always has).
- Dominance: a more general pattern before a more specific one is a compile error.
- Exhaustiveness: required for pattern switches; sealed hierarchies make it checkable without default.`,
      whyItExists: `instanceof-then-cast chains were repetitive and error-prone (casting to the wrong type after a copy-paste). Pattern matching lets the compiler connect the test and the cast, and, with sealed types and records, enables data-oriented programming with exhaustive checks.`,
      whenToUse: [
        'Use var when the type is obvious from the right-hand side (constructors, literals, factory methods with clear names).',
        'Use instanceof patterns instead of test-then-cast.',
        'Use switch patterns over sealed hierarchies and records for data-oriented logic.',
      ],
      whenNotToUse: [
        'Do not use var when it hides an important type: `var result = process(input);`.',
        'Do not use type switches as a substitute for polymorphism inside your own class hierarchy when behaviour belongs on the types.',
        'Do not add `default` to a switch over a sealed type — it hides missing cases.',
      ],
      examples: [
        {
          id: 'switch-patterns',
          title: 'Switch patterns with guards, records and null',
          runnable: true,
          minJavaVersion: 21,
          code: `record Point(int x, int y) {}
record Line(Point from, Point to) {}

public class Main {
    static String describe(Object value) {
        return switch (value) {
            case null -> "nothing";
            case Integer i when i > 100 -> "large int " + i;
            case Integer i -> "int " + i;
            case String s when s.isBlank() -> "blank text";
            case String s -> "text of length " + s.length();
            case Point(int x, int y) when x == y -> "diagonal point at " + x;
            case Point(var x, var y) -> "point " + x + "," + y;
            case Line(Point(var x1, var y1), Point(var x2, var y2)) ->
                "line of dx=" + (x2 - x1) + " dy=" + (y2 - y1);
            default -> "unknown " + value.getClass().getSimpleName();
        };
    }

    public static void main(String[] args) {
        Object[] values = { 7, 250, "  ", "Java", new Point(3, 3), new Point(1, 2),
                            new Line(new Point(0, 0), new Point(4, 3)), 2.5, null };
        for (Object v : values) System.out.println(describe(v));
    }
}`,
          expectedOutput: `int 7
large int 250
blank text
text of length 4
diagonal point at 3
point 1,2
line of dx=4 dy=3
unknown Double
nothing`,
        },
        {
          id: 'var-cast',
          title: 'var inference and casting',
          runnable: true,
          code: `import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        var names = new ArrayList<String>();     // ArrayList<String>
        names.add("Ada");
        var count = 3;                           // int
        var ratio = count / 2.0;                 // double
        System.out.println(names + " " + count + " " + ratio);

        Object o = names;
        if (o instanceof List<?> list && !list.isEmpty()) {
            System.out.println("list starting with " + list.get(0));
        }

        Object n = 42;
        try {
            String s = (String) n;
            System.out.println(s);
        } catch (ClassCastException e) {
            System.out.println("ClassCastException: Integer is not a String");
        }
    }
}`,
          expectedOutput: `[Ada] 3 1.5
list starting with Ada
ClassCastException: Integer is not a String`,
        },
        {
          id: 't-modern-types-primitive-casts',
          title: 'Widening, narrowing and reference casts',
          runnable: true,
          code: `public class Main {
    public static void main(String[] args) {
        int whole = 7;
        double widened = whole;          // widening: implicit and safe
        long big = whole;                // widening int -> long
        System.out.println(widened + " " + big);

        double price = 3.99;
        int truncated = (int) price;     // narrowing: explicit, drops the fraction
        System.out.println(truncated);
        System.out.println(Math.round(price));

        int large = 200;
        byte b = (byte) large;           // keeps only the low 8 bits
        System.out.println(b);

        char letter = 'A';
        int code = letter;               // char widens to int
        char next = (char) (letter + 2); // int arithmetic, cast back to char
        System.out.println(code + " " + next);

        Object o = "text";               // upcast: implicit
        String back = (String) o;        // downcast: checked at run time
        System.out.println(back.length());
    }
}`,
          expectedOutput: `7.0 7
3
4
-56
65 C
4`,
          explanation:
            'A narrowing cast never throws: it silently truncates (3.99 → 3) or wraps around (200 does not fit in a byte, whose range is -128..127, so it becomes 200 - 256 = -56). Use `Math.round` to round, and `Math.toIntExact` when you want an exception instead of silent overflow. Reference downcasts, in contrast, are checked and can throw ClassCastException.',
        },
      ],
      walkthrough: {
        exampleId: 'switch-patterns',
        steps: [
          { lines: [7, 7], text: '`case null` handles null explicitly; without it, switching on null throws NullPointerException.' },
          { lines: [8, 9], text: 'Guards refine a type pattern. The guarded case must come first, otherwise `case Integer i` would dominate it (compile error).' },
          { lines: [12, 13], text: 'Record patterns deconstruct a Point into its components; `var` infers each component type.' },
          { lines: [14, 15], text: 'Patterns nest: a Line is deconstructed into two Points, each deconstructed into coordinates.' },
          { lines: [16, 16], text: 'Object is not sealed, so a default is required for exhaustiveness.' },
        ],
      },
      realWorld: {
        title: 'Replacing a 200-line visitor with a switch',
        scenario: `A pricing engine evaluated an expression tree (\`Constant\`, \`Variable\`, \`Add\`, \`Multiply\`, \`Max\`) using the visitor pattern: an interface with five methods, five accept() methods and a visitor class per operation.

After upgrading to Java 21, the team declared \`sealed interface Expr permits Constant, Variable, Add, Multiply, Max\` with records and wrote each operation as one exhaustive switch with record patterns. Adding a \`Min\` node now produces compile errors in exactly the switches that need updating — the safety the visitor pattern provided, with far less code.`,
      },
      commonMistakes: [
        {
          mistake: '`var list = new ArrayList<>();` expecting a list of strings.',
          why: 'With the diamond and no target type, inference falls back to ArrayList<Object>.',
          fix: 'Write `new ArrayList<String>()` or declare the type explicitly.',
        },
        {
          mistake: 'Putting a general pattern before a specific one.',
          why: '`case CharSequence cs` before `case String s` dominates it — a compile error.',
          fix: 'Order cases from most specific to most general.',
        },
        {
          mistake: 'Forgetting that a switch on a null reference throws NPE.',
          why: 'Pattern switches keep this behaviour unless `case null` is present.',
          fix: 'Add `case null` (or `case null, default`) when null is possible.',
        },
      ],
      checks: [
        {
          id: 't4-c1',
          kind: 'predict-output',
          dimension: 'conceptual',
          prompt: 'What happens when you compile this?',
          code: `public class Main {
    public static void main(String[] args) {
        var total = 10;
        total = 2_500_000_000L;
        System.out.println(total);
    }
}`,
          options: [
            { id: 'a', text: '2500000000' },
            { id: 'b', text: 'Compile error: possible lossy conversion from long to int' },
            { id: 'c', text: 'Runtime overflow: -1794967296' },
          ],
          correctOptionId: 'b',
          expectCompileError: true,
          explanation: '`var total = 10` infers int at compile time. Java stays statically typed; var is not dynamic typing.',
        },
        {
          id: 't4-c2',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this print?',
          code: `public class Main {
    static String classify(Object o) {
        return switch (o) {
            case Integer i when i < 0 -> "negative";
            case Integer i -> "number";
            case String s -> "text";
            default -> "other";
        };
    }

    public static void main(String[] args) {
        System.out.println(classify(-5) + " " + classify(0) + " " + classify('x'));
    }
}`,
          options: [
            { id: 'a', text: 'negative number text' },
            { id: 'b', text: 'negative number other' },
            { id: 'c', text: 'number number other' },
            { id: 'd', text: 'negative negative text' },
          ],
          correctOptionId: 'b',
          explanation: "'x' is a char, boxed to Character, which is neither Integer nor String, so it falls to default.",
        },
        {
          id: 't4-c3',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this print?',
          code: `public class Main {
    static String kind(String s) {
        return switch (s) {
            case "a" -> "letter a";
            default -> "something else";
        };
    }

    public static void main(String[] args) {
        try {
            System.out.println(kind(null));
        } catch (NullPointerException e) {
            System.out.println("NPE");
        }
    }
}`,
          options: [
            { id: 'a', text: 'something else' },
            { id: 'b', text: 'NPE' },
            { id: 'c', text: 'letter a' },
            { id: 'd', text: 'null' },
          ],
          correctOptionId: 'b',
          explanation: 'default does not match null. Without `case null`, switching on a null reference throws NullPointerException.',
        },
        {
          id: 't4-c4',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'Which use of var is most likely to hurt readability?',
          options: [
            { id: 'a', text: 'var customers = new HashMap<String, Customer>();' },
            { id: 'b', text: 'var reader = Files.newBufferedReader(path);' },
            { id: 'c', text: 'var x = service.process(data);' },
            { id: 'd', text: 'for (var entry : map.entrySet())' },
          ],
          correctOptionId: 'c',
          explanation: 'Nothing on the right-hand side reveals what process returns, so readers must look it up. Good variable names matter more with var.',
        },
      ],
      challengeIds: [],
      masteryCriteria: [
        'Explain what var infers and where it is not allowed.',
        'Write a guarded, ordered pattern switch including null handling.',
        'Deconstruct nested records with record patterns.',
      ],
      relatedLessonIds: ['o-interfaces', 'fn-optional-modern'],
      revision: [
        { id: 'r1', question: 'Does var make Java dynamically typed?', answer: 'No. The compiler infers a fixed static type from the initialiser; assigning an incompatible value later is a compile error.' },
        { id: 'r2', question: 'What happens when a switch receives null?', answer: 'It throws NullPointerException unless there is an explicit `case null` (Java 21).' },
        { id: 'r3', question: 'What is pattern dominance?', answer: 'A case that matches everything a later case would match makes the later case unreachable; the compiler rejects it. Order specific before general.' },
      ],
    },
  ],
};
