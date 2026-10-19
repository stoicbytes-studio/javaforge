import type { Lesson } from '@/types/curriculum';

/** Extra lessons for module 4 (Strings & Types): regular expressions, annotations and reflection. */
export const regexReflectionLessons: Lesson[] = [
  // -------------------------------------------------------------------------
  {
    id: 't-regex',
    moduleId: 'types',
    title: 'Regular expressions and text processing',
    summary: 'Pattern and Matcher, quantifiers and groups, split and replace pitfalls, and how to keep a regex from taking down a server.',
    estimatedMinutes: 40,
    difficulty: 'intermediate',
    prerequisites: ['t-strings'],
    versionNotes: [
      { feature: 'Named capturing groups (?<name>...)', since: 7 },
      { feature: 'Matcher.results(), Pattern.asMatchPredicate()', since: 9, note: 'asMatchPredicate arrived in 11' },
      { feature: 'replaceAll(Function<MatchResult, String>)', since: 9 },
      { feature: 'Matcher.namedGroups(), MatchResult.namedGroups()', since: 20 },
    ],
    objectives: [
      'Compile a Pattern once and use a Matcher with matches, find and lookingAt correctly.',
      'Read and write character classes, quantifiers (greedy, reluctant, possessive), anchors and groups.',
      'Use capturing groups, named groups and back-references in searches and replacements.',
      'Avoid split and replacement pitfalls with Pattern.quote and Matcher.quoteReplacement.',
      'Recognise catastrophic backtracking and rewrite a pattern so it runs in linear time.',
    ],
    plainEnglish: `A **regular expression** (regex) is a tiny pattern language for describing text: "four digits, a dash, two digits" is \`\\d{4}-\\d{2}\`. Java gives you two classes in \`java.util.regex\`:

- \`Pattern\` — the compiled pattern. Compiling is the expensive part, so do it **once** and keep it in a \`static final\` field.
- \`Matcher\` — a cursor that walks one piece of text with that pattern. You create a new one for each input.

A Matcher can answer three different questions:
- \`matches()\` — does the **whole** text fit the pattern?
- \`lookingAt()\` — does the text **start** with the pattern?
- \`find()\` — is there a match **anywhere**? Call it again to get the next one.

Parentheses make **groups**: after a match, \`group(1)\` gives you the text the first pair of parentheses matched. You can name them — \`(?<year>\\d{4})\` — and refer to them in replacements as \`\${year}\`.

Many \`String\` methods quietly take a regex too: \`split\`, \`replaceAll\`, \`replaceFirst\` and \`matches\`. That is why \`"1.2.3".split(".")\` returns an empty array — a dot means "any character".

**Remember the double backslash.** In a regex, \`\\d\` means "a digit". In Java source, a backslash inside a string literal must itself be escaped, so you type \`"\\\\d"\`.`,
    technical: `### Pattern and Matcher
\`Pattern.compile(regex, flags)\` parses the regex into a tree of matching nodes. A \`Pattern\` is **immutable and thread-safe**; a \`Matcher\` holds mutable state (position, groups) and is **not** thread-safe. Convenience methods such as \`String.matches\`, \`String.split\` and \`String.replaceAll\` compile a new Pattern on every call (\`split\` has a fast path for a single literal character that is not a metacharacter).

### Matching methods
- \`matches()\` — the entire region must match (as if wrapped in \`^...$\`).
- \`lookingAt()\` — the match must start at the beginning of the region but need not reach the end.
- \`find()\` — scans for the next match after the previous one; loop on it, or use \`results()\` (Java 9) to get a \`Stream<MatchResult>\`.
- \`start()\`, \`end()\`, \`group(n)\`, \`group("name")\` describe the last successful match; calling them after a failed match throws \`IllegalStateException\`.

### Syntax essentials
- Character classes: \`[abc]\`, \`[^0-9]\`, \`[a-z&&[^aeiou]]\`; predefined \`\\d \\w \\s\` and their negations \`\\D \\W \\S\`; \`.\` matches any character except line terminators unless \`DOTALL\` is set.
- Quantifiers: \`* + ? {n} {n,} {n,m}\`. Each comes in three kinds — **greedy** (\`.*\`, take as much as possible then back off), **reluctant** (\`.*?\`, take as little as possible then extend) and **possessive** (\`.*+\`, take as much as possible and *never* give it back).
- Anchors and boundaries: \`^\`, \`$\` (line-based with \`MULTILINE\`), \`\\A\`, \`\\z\`, \`\\b\` (word boundary).
- Groups: \`(...)\` capturing, \`(?:...)\` non-capturing, \`(?<name>...)\` named, \`(?>...)\` atomic; look-arounds \`(?=...)\`, \`(?!...)\`, \`(?<=...)\`, \`(?<!...)\`.
- Back-references: \`\\1\` or \`\\k<name>\` in the pattern; \`$1\` or \`\${name}\` in a replacement string.

### Flags
\`CASE_INSENSITIVE\` (\`(?i)\`), \`MULTILINE\` (\`(?m)\`), \`DOTALL\` (\`(?s)\`), \`COMMENTS\` (\`(?x)\`, whitespace and \`#\` comments ignored), \`UNICODE_CASE\` and \`UNICODE_CHARACTER_CLASS\` (make \`\\w\` and case-folding Unicode-aware), \`LITERAL\`.

### Quoting
- \`Pattern.quote(s)\` turns arbitrary text into a regex that matches it literally (wraps it in \`\\Q...\\E\`).
- \`Matcher.quoteReplacement(s)\` escapes \`$\` and \`\\\` so that user text can be used as a replacement.

### split rules
\`split(regex)\` removes **trailing** empty strings; \`split(regex, -1)\` keeps them; a positive limit caps the number of pieces. Since Java 8, a zero-width match at the very start does not produce a leading empty string.

### Backtracking engine
\`java.util.regex\` is a backtracking engine: it supports back-references and look-arounds, but some patterns take exponential or high-polynomial time on inputs that almost match. This is **ReDoS** (regular-expression denial of service).`,
    whyItExists: `Validating, searching, extracting and rewriting text are everyday jobs: log parsing, input validation, data cleaning, routing rules. A regular expression expresses those rules declaratively in one line instead of dozens of lines of index arithmetic, and the same syntax works in editors, grep, databases and most languages.`,
    whenToUse: [
      'Validating the shape of an input (postcodes, ISO dates, identifiers) with a precompiled Pattern and matches().',
      'Extracting fields from semi-structured text such as log lines with named groups.',
      'Search-and-replace that depends on what was matched (reordering with $1 or ${name}).',
      'Splitting on a flexible separator such as "one or more whitespace characters" (\\s+).',
    ],
    whenNotToUse: [
      'Parsing nested or recursive formats (HTML, JSON, XML, source code): use a real parser.',
      'Fixed-text operations: contains, startsWith, indexOf and replace(CharSequence, CharSequence) are clearer and faster.',
      'Validating email addresses or URLs completely: use a library or the java.net.URI parser and send a confirmation.',
      'Untrusted patterns or untrusted long inputs with nested or overlapping quantifiers, unless you have bounded the input and checked the pattern for backtracking.',
    ],
    examples: [
      {
        id: 't-regex-matcher',
        title: 'Pattern, Matcher, groups and replacement',
        runnable: true,
        code: `import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Main {
    // Compile once, reuse everywhere: Pattern is immutable and thread-safe.
    private static final Pattern DATE =
            Pattern.compile("(?<year>\\\\d{4})-(?<month>\\\\d{2})-(?<day>\\\\d{2})");

    public static void main(String[] args) {
        String text = "Released 2024-03-19, patched 2024-04-16.";
        Matcher m = DATE.matcher(text);          // Matcher: per-use, NOT thread-safe
        System.out.println(m.matches());         // whole input must match
        System.out.println(m.lookingAt());       // match must start at index 0
        m.reset();
        while (m.find()) {                       // next match anywhere
            System.out.println(m.group() + " at " + m.start() + ", month " + m.group("month"));
        }
        System.out.println(DATE.matcher("2024-03-19").matches());

        String us = DATE.matcher(text).replaceAll("\${month}/\${day}/\${year}");
        System.out.println(us);
        System.out.println("hello hello world".replaceAll("\\\\b(\\\\w+) \\\\1\\\\b", "$1"));
    }
}`,
        expectedOutput: `false
false
2024-03-19 at 9, month 03
2024-04-16 at 29, month 04
true
Released 03/19/2024, patched 04/16/2024.
hello world`,
        explanation:
          'The same compiled Pattern is reused for three different Matchers. `matches()` and `lookingAt()` fail because the text starts with "Released"; `find()` locates both dates. In the replacement, `${month}` refers to a named group, and in the last line `\\1` is a back-reference that matches a repeated word.',
      },
      {
        id: 't-regex-quantifiers-split',
        title: 'Greedy vs reluctant vs possessive, split and quoting',
        runnable: true,
        code: `import java.util.Arrays;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Main {
    static String first(String regex, String input) {
        Matcher m = Pattern.compile(regex).matcher(input);
        return m.find() ? m.group() : "(no match)";
    }

    public static void main(String[] args) {
        String html = "<b>bold</b> and <i>it</i>";
        System.out.println(first("<.+>", html));    // greedy: as much as possible
        System.out.println(first("<.+?>", html));   // reluctant: as little as possible
        System.out.println(first("<.++>", html));   // possessive: never gives back

        System.out.println(Arrays.toString("1+2+3".split(Pattern.quote("+"))));
        System.out.println(Arrays.toString("a|b".split("|")));
        System.out.println(Arrays.toString("x,,y,,".split(",")));
        System.out.println(Arrays.toString("x,,y,,".split(",", -1)));

        Pattern level = Pattern.compile("^error: (\\\\w+)$",
                Pattern.CASE_INSENSITIVE | Pattern.MULTILINE);
        Matcher m = level.matcher("ok\\nERROR: disk\\ninfo\\nError: network");
        while (m.find()) System.out.println(m.group(1));

        System.out.println("cost".replaceAll("cost", Matcher.quoteReplacement("$9")));
    }
}`,
        expectedOutput: `<b>bold</b> and <i>it</i>
<b>
(no match)
[1, 2, 3]
[a, |, b]
[x, , y]
[x, , y, , ]
disk
network
$9`,
        explanation:
          'Greedy `.+` runs to the end of the text and backs off only to the last `>`. Reluctant `.+?` stops at the first `>`. Possessive `.++` swallows the final `>` too and refuses to give it back, so the match fails. `split("|")` splits on the empty alternation (between every character), while `Pattern.quote` makes `+` literal. `MULTILINE` lets `^` and `$` match at each line, and `quoteReplacement` stops `$9` being read as "group 9".',
      },
      {
        id: 't-regex-redos',
        title: 'Catastrophic backtracking and the linear-time fix',
        runnable: true,
        code: `import java.util.regex.Pattern;

public class Main {
    // Goal: "is the 12th comma-separated field a P?"
    // DANGEROUS: .*? can also swallow commas, so on a line that does NOT match
    // the engine retries every way of distributing the commas among 11 groups.
    static final Pattern EVIL = Pattern.compile("^(.*?,){11}P");

    // SAFE: a field can never contain a comma, so there is only one way to split.
    static final Pattern SAFE = Pattern.compile("^([^,]*,){11}P");
    // ALSO SAFE: possessive quantifier - never gives characters back.
    static final Pattern POSSESSIVE = Pattern.compile("^([^,]*+,){11}P");

    static boolean check(Pattern p, String line) {
        if (line.length() > 10_000) return false;          // cap untrusted input
        return p.matcher(line).find();
    }

    public static void main(String[] args) {
        String good = "x,".repeat(11) + "P";
        String bad = "x,".repeat(40) + "!";                 // 40 fields, no P anywhere
        System.out.println(check(SAFE, good) + " " + check(POSSESSIVE, good));
        System.out.println(check(SAFE, bad) + " " + check(POSSESSIVE, bad));
        // check(EVIL, bad) also returns false - after billions of backtracking steps.
        // Without commas the split approach is simpler still:
        String[] fields = good.split(",", -1);
        System.out.println(fields.length > 11 && fields[11].startsWith("P"));
    }
}`,
        expectedOutput: `true true
false false
true`,
        explanation:
          'Both safe patterns make each field unable to contain a comma, so there is exactly one way to divide the line into fields and a failing line is rejected in linear time. The commented-out EVIL pattern accepts the same lines, but on a 40-field line without a match it explores an astronomical number of ways to distribute commas among the 11 groups. Capping input length is a second line of defence.',
      },
    ],
    walkthrough: {
      exampleId: 't-regex-matcher',
      steps: [
        { lines: [5, 7], text: 'The Pattern is compiled once into a static final field. Named groups label the year, month and day. In source the regex digit class is written "\\\\d" because the backslash must be escaped in a Java string literal.' },
        { lines: [10, 11], text: 'A Matcher is created per input. It holds the current position and the last match, so it must not be shared between threads.' },
        { lines: [12, 13], text: 'matches() needs the whole text to be a date; lookingAt() needs the text to start with one. "Released" fails both.' },
        { lines: [14, 17], text: 'reset() rewinds the matcher, then each find() continues after the previous match. start() gives the index and group("month") the text of the named group.' },
        { lines: [18, 18], text: 'A text that is exactly a date satisfies matches().' },
        { lines: [20, 21], text: 'replaceAll rewrites every match; ${name} in the replacement inserts a named group, here reordering ISO dates into US format.' },
        { lines: [22, 22], text: '\\1 is a back-reference: it matches the same text that group 1 captured, so "(\\w+) \\1" finds a doubled word and $1 keeps one copy.' },
      ],
    },
    realWorld: {
      title: 'One regex, a whole region offline',
      scenario: `In July 2019 Cloudflare deployed a new web-application-firewall rule containing a pattern with \`.*(?:.*=.*)\`. On ordinary HTTP traffic the backtracking engine explored so many paths that CPUs across its network hit 100% and sites behind it returned errors for about half an hour. In 2016 a single post with tens of thousands of whitespace characters took Stack Overflow down the same way: a regex meant to trim trailing whitespace backtracked quadratically.

The fixes that teams adopt after incidents like these are the same ones this lesson teaches: avoid nested or overlapping quantifiers, make each repeated piece unable to match what follows it (\`[^,]*,\` instead of \`.*?,\`), use possessive quantifiers or atomic groups where backtracking is pointless, cap input sizes, and test patterns against long near-miss inputs before deployment.`,
    },
    commonMistakes: [
      {
        mistake: 'Calling String.matches or String.replaceAll with the same regex inside a hot loop.',
        why: 'Each call compiles a new Pattern, which is far more expensive than the match itself.',
        fix: 'Compile once into a `private static final Pattern` and call `PATTERN.matcher(input)` per input.',
      },
      {
        mistake: 'Using find() when the whole input must be valid.',
        why: '`find()` succeeds if the pattern occurs anywhere, so "abc123xyz" passes a digits-only check written as `\\d+`.',
        fix: 'Use `matches()` (or anchor with `^...$` / `\\A...\\z`) for validation.',
        code: `Pattern DIGITS = Pattern.compile("\\\\d+");
DIGITS.matcher("abc123xyz").find();    // true  - wrong check
DIGITS.matcher("abc123xyz").matches(); // false - correct`,
      },
      {
        mistake: 'Splitting on "." or "|" or "+" as if they were plain characters.',
        why: 'split takes a regex: "." is any character, "|" is an empty alternation, "+" is a quantifier (and alone is a syntax error).',
        fix: 'Escape the character (`"\\\\."`) or use `Pattern.quote(separator)` for separators that come from data or users.',
      },
      {
        mistake: 'Putting user text into a replacement string.',
        why: '`$` and `\\` are special in replacements, so "$9" throws IndexOutOfBoundsException ("No group 9") and "$1" silently inserts a group.',
        fix: 'Wrap it with `Matcher.quoteReplacement(text)`, or use the non-regex `String.replace(CharSequence, CharSequence)`.',
      },
      {
        mistake: 'Writing `(.*?,){n}` or `(a+)+`-style patterns for untrusted input.',
        why: 'Overlapping or nested quantifiers give the backtracking engine many ways to match the same text; on a near-miss it tries them all.',
        fix: 'Make repeated parts mutually exclusive (`[^,]*,`), use possessive quantifiers or atomic groups, limit input length, and prefer split or a parser.',
      },
    ],
    checks: [
      {
        id: 't7-c1',
        kind: 'predict-output',
        dimension: 'runtime',
        prompt: 'What does this print?',
        code: `public class Main {
    public static void main(String[] args) {
        String s = "aXbXc";
        String greedy = s.replaceAll("a.*X", "_");
        String reluctant = s.replaceAll("a.*?X", "_");
        System.out.println(greedy + " " + reluctant);
    }
}`,
        options: [
          { id: 'a', text: '_bXc _c' },
          { id: 'b', text: '_c _bXc' },
          { id: 'c', text: '_c _c' },
          { id: 'd', text: '_bXc _bXc' },
        ],
        correctOptionId: 'b',
        explanation: 'Greedy `.*` grabs as much as it can, so `a.*X` matches up to the LAST X ("aXbX"). Reluctant `.*?` expands one character at a time, so `a.*?X` stops at the FIRST X ("aX").',
        hints: ['Which X does each quantifier stop at?'],
      },
      {
        id: 't7-c2',
        kind: 'mcq',
        dimension: 'conceptual',
        prompt: 'You validate order ids with `Pattern ID = Pattern.compile("[A-Z]{3}-\\\\d{4}");`. Which call correctly rejects "XABC-1234Y"?',
        options: [
          { id: 'a', text: 'ID.matcher(s).find()' },
          { id: 'b', text: 'ID.matcher(s).lookingAt()' },
          { id: 'c', text: 'ID.matcher(s).matches()' },
          { id: 'd', text: 's.contains(ID.pattern())' },
        ],
        correctOptionId: 'c',
        explanation: '`matches()` requires the entire input to fit the pattern. `find()` succeeds because "ABC-1234" occurs inside the string. `lookingAt()` fails here because the text starts with "XA", but it would wrongly accept "ABC-1234Y", which has trailing junk. `contains` compares literal text, not the pattern.',
      },
      {
        id: 't7-c3',
        kind: 'predict-output',
        dimension: 'debugging',
        prompt: 'What does this print?',
        code: `public class Main {
    public static void main(String[] args) {
        String date = "2024.10.19.";
        String[] parts = date.split(".");
        String[] fixed = date.split("\\\\.");
        System.out.println(parts.length + " " + fixed.length);
    }
}`,
        options: [
          { id: 'a', text: '4 3' },
          { id: 'b', text: '4 4' },
          { id: 'c', text: '0 3' },
          { id: 'd', text: '0 4' },
        ],
        correctOptionId: 'c',
        explanation: '"." is a regex that matches every character, so every piece is empty, and trailing empty strings are removed: length 0. Escaping the dot splits on literal dots: "2024", "10", "19" and a trailing empty string that is removed: length 3.',
      },
      {
        id: 't7-c4',
        kind: 'multi-select',
        dimension: 'interview',
        prompt: 'A login form validates usernames with a pattern that hangs on certain long inputs. Which changes reduce the risk of catastrophic backtracking? (Select all that apply.)',
        options: [
          { id: 'a', text: 'Reject inputs longer than a sensible maximum before matching.' },
          { id: 'b', text: 'Rewrite `(\\w+\\s?)*` so repeated parts cannot match the same characters in more than one way.' },
          { id: 'c', text: 'Use possessive quantifiers or atomic groups where giving characters back can never lead to a match.' },
          { id: 'd', text: 'Compile the Pattern on every request so state is fresh.' },
          { id: 'e', text: 'Switch from matches() to find().' },
        ],
        correctOptionIds: ['a', 'b', 'c'],
        explanation: 'Backtracking blows up when the engine has many ways to split the same text. Bounding the input, removing ambiguity and forbidding pointless backtracking all attack that. Recompiling only adds cost, and find() may try even more start positions.',
      },
      {
        id: 't7-c5',
        kind: 'mcq',
        dimension: 'coding',
        prompt: 'Which statement about Pattern and Matcher is correct?',
        options: [
          { id: 'a', text: 'Both are thread-safe, so a single Matcher can be shared by all request threads.' },
          { id: 'b', text: 'Pattern is immutable and thread-safe; create a new Matcher per input or per thread.' },
          { id: 'c', text: 'Matcher is thread-safe but Pattern is not, so compile per call.' },
          { id: 'd', text: 'String.matches caches its compiled Pattern, so precompiling gains nothing.' },
        ],
        correctOptionId: 'b',
        explanation: 'The Pattern Javadoc states that instances are immutable and safe for concurrent use, while Matcher instances are not. String.matches compiles a fresh Pattern every call.',
      },
    ],
    challengeIds: [],
    masteryCriteria: [
      'Choose between matches, lookingAt and find and explain the difference.',
      'Predict greedy, reluctant and possessive matches on a short string.',
      'Extract data with named groups and rewrite text with $1 / ${name} replacements.',
      'Split and replace safely using Pattern.quote, negative split limits and Matcher.quoteReplacement.',
      'Spot a pattern vulnerable to catastrophic backtracking and rewrite it.',
    ],
    relatedLessonIds: ['t-strings', 'fn-streams', 'perf-optimisation', 'io-files'],
    revision: [
      { id: 'r1', question: 'What is the difference between matches(), lookingAt() and find()?', answer: 'matches() needs the whole input to match; lookingAt() needs a match starting at index 0; find() looks for the next match anywhere and can be called repeatedly.' },
      { id: 'r2', question: 'Greedy, reluctant and possessive: how does each behave?', answer: 'Greedy takes as much as possible and backs off; reluctant takes as little as possible and extends; possessive takes as much as possible and never backs off (so it can fail where greedy would succeed).' },
      { id: 'r3', question: 'Why does "a|b".split("|") not split on the pipe?', answer: '| is the alternation operator; alone it matches the empty string between every character. Use split("\\\\|") or split(Pattern.quote("|")).' },
      { id: 'r4', question: 'What causes ReDoS and how do you prevent it?', answer: 'A backtracking engine trying exponentially or polynomially many ways to match a near-miss input, usually due to nested or overlapping quantifiers. Prevent it with unambiguous patterns ([^,]* instead of .*?), possessive quantifiers or atomic groups, input length limits, and by not using regex for structured formats.' },
    ],
  },

  // -------------------------------------------------------------------------
  {
    id: 't-annotations-reflection',
    moduleId: 'types',
    title: 'Annotations and reflection',
    summary: 'What annotations really are, how retention and targets work, how frameworks read them with reflection, and what reflection costs since strong encapsulation.',
    estimatedMinutes: 45,
    difficulty: 'intermediate',
    prerequisites: ['o-interfaces', 't-generics'],
    versionNotes: [
      { feature: 'Annotations and the reflection API for them', since: 5 },
      { feature: 'Pluggable annotation processing (javax.annotation.processing)', since: 6 },
      { feature: 'MethodHandles (java.lang.invoke)', since: 7 },
      { feature: '@Repeatable, type annotations (TYPE_USE), @FunctionalInterface', since: 8 },
      { feature: '@Deprecated(forRemoval, since)', since: 9 },
      { feature: 'JDK internals strongly encapsulated by default', since: 16, note: 'JEP 396 in 16; --illegal-access removed by JEP 403 in 17' },
      { feature: 'Core reflection reimplemented on method handles', since: 18, note: 'JEP 416' },
    ],
    objectives: [
      'Use the built-in annotations correctly and explain what the compiler does with each.',
      'Declare a custom annotation with the right @Retention and @Target, and read it at run time.',
      'Use Class, Method, Field and MethodHandle to inspect and invoke code reflectively.',
      'Explain how JUnit, Spring and Jackson combine annotations with reflection, and how annotation processors differ.',
      'Weigh the costs and risks of reflection, including strong encapsulation since Java 16/17.',
    ],
    plainEnglish: `An **annotation** is a label you stick on code: \`@Override\`, \`@Deprecated\`, \`@Test\`. On its own a label does nothing at all. It matters only because *some tool reads it*:

- the **compiler** (\`@Override\` makes javac check that you really override something),
- an **annotation processor** at compile time (Lombok, MapStruct, Dagger generate or check code),
- or a **framework at run time** (JUnit finds \`@Test\` methods, Spring finds \`@Component\` classes, Jackson reads \`@JsonProperty\`).

To be read at run time, an annotation must be kept in the compiled class with \`@Retention(RetentionPolicy.RUNTIME)\`. Frameworks then use **reflection**: code that looks at classes as data. \`MyClass.class\` is a \`Class\` object, and it can list its methods and fields, read their annotations, and even call methods or change private fields.

Reflection is powerful but has a price: mistakes show up at run time instead of compile time, it is slower than a direct call, and since Java 16/17 the JDK no longer lets you break into its own private internals.`,
    technical: `### What an annotation is
An annotation type is declared with \`@interface\`; it is a special interface whose methods are **elements**. Element types are limited to primitives, \`String\`, \`Class\`, enums, other annotations and one-dimensional arrays of these; values must be compile-time constants. A single element named \`value\` can be set without its name: \`@Check("adds")\`.

### Built-in annotations (java.lang)
- \`@Override\` — compile error if the method does not override or implement a supertype method.
- \`@Deprecated(since = "9", forRemoval = true)\` — warning at use sites; \`forRemoval\` produces a stronger, on-by-default "removal" warning.
- \`@SuppressWarnings("unchecked")\` — silences named javac warnings on the narrowest possible declaration.
- \`@FunctionalInterface\` — compile error unless the interface has exactly one abstract method.
- \`@SafeVarargs\` — promises a generic varargs method does not pollute the heap; allowed on static, final and (since Java 9) private methods and constructors.

### Meta-annotations (java.lang.annotation)
- \`@Retention\`: \`SOURCE\` (discarded by javac), \`CLASS\` (the default: stored in the class file but not visible to reflection), \`RUNTIME\` (visible to reflection).
- \`@Target\`: where the annotation may appear — \`TYPE\`, \`FIELD\`, \`METHOD\`, \`PARAMETER\`, \`CONSTRUCTOR\`, \`LOCAL_VARIABLE\`, \`ANNOTATION_TYPE\`, \`PACKAGE\`, \`TYPE_PARAMETER\`, \`TYPE_USE\`, \`MODULE\`, \`RECORD_COMPONENT\`. Without \`@Target\`, it is allowed on all declaration contexts.
- \`@Inherited\`: a class annotation is also reported for subclasses — only for classes, never from interfaces or methods.
- \`@Repeatable(Container.class)\`: allows the annotation more than once; the compiler wraps the copies in the container annotation.
- \`@Documented\`: the annotation appears in generated Javadoc.

### Reflection API
- Get a \`Class<?>\` with \`Foo.class\`, \`obj.getClass()\` or \`Class.forName("pkg.Foo")\`.
- \`getMethods()\`/\`getFields()\` return **public** members including inherited ones; \`getDeclaredMethods()\`/\`getDeclaredFields()\` return **all** members declared by that class only. Their order is **unspecified** — sort before relying on it.
- \`Method.invoke(target, args...)\` wraps any exception thrown by the method in \`InvocationTargetException\`; \`Constructor.newInstance\` creates objects.
- \`setAccessible(true)\` suppresses Java access checks. Since JDK 16 (JEP 396) and 17 (JEP 403), it throws \`InaccessibleObjectException\` for non-public members of JDK packages and of any module package that is not **opened** to the caller (\`opens\` in module-info or \`--add-opens\`). \`trySetAccessible()\` returns false instead of throwing.
- \`getAnnotation\`, \`isAnnotationPresent\`, \`getAnnotationsByType\` (sees repeated annotations through their container).

### MethodHandles
\`MethodHandles.lookup().findVirtual(...)\` returns a typed, directly executable reference to a method. Access is checked **once**, when the handle is created, against the lookup's class. A handle held in a \`static final\` field can be inlined by the JIT, which is how lambdas, string concatenation and (since Java 18, JEP 416) core reflection itself are implemented.

### Compile-time alternative: annotation processors
A processor (\`javax.annotation.processing.Processor\`) runs inside javac, sees annotated elements, and can report errors or **generate new source files** — MapStruct generates mappers, Dagger generates dependency graphs, AutoValue generates value classes. Lombok also runs as a processor but modifies the compiler's internal syntax tree, which the processor API does not officially support. Records (Java 16) remove much of the boilerplate Lombok was used for.`,
    whyItExists: `Before Java 5, frameworks relied on naming conventions (methods starting with "test") and XML files to learn about your code. Annotations put that metadata next to the code it describes, type-checked by the compiler, and reflection lets general-purpose libraries — test runners, dependency injection, serialisers, ORMs — work with classes they have never seen.`,
    whenToUse: [
      'Always use @Override on overriding methods and @FunctionalInterface on interfaces meant for lambdas.',
      'Declare RUNTIME annotations when a library or framework must discover classes, methods or fields at run time.',
      'Use reflection in framework, tooling and test infrastructure code that must work with arbitrary classes.',
      'Use an annotation processor when the metadata can be fully handled at compile time (generated mappers, builders, compile-time checks).',
      'Use MethodHandles for repeated dynamic calls on hot paths.',
    ],
    whenNotToUse: [
      'Do not use reflection in ordinary business code when an interface, lambda or switch would do; you lose compile-time checking and refactoring support.',
      'Do not use setAccessible to reach into JDK or third-party internals; it breaks on upgrades and is blocked by strong encapsulation.',
      'Do not rely on the order of getDeclaredMethods() or getDeclaredFields().',
      'Do not make an annotation RUNTIME "just in case"; SOURCE or CLASS keeps the class file and reflection results smaller.',
    ],
    examples: [
      {
        id: 't-annotations-mini-junit',
        title: 'A tiny test runner: custom annotation + reflection',
        runnable: true,
        code: `import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.Comparator;

public class Main {
    @Retention(RetentionPolicy.RUNTIME)   // kept in the class file AND visible to reflection
    @Target(ElementType.METHOD)           // only allowed on methods
    @interface Check {
        String value() default "";
        boolean enabled() default true;
    }

    @Retention(RetentionPolicy.SOURCE)    // discarded by javac
    @interface Todo {}

    static class CalculatorChecks {
        @Check("adds two numbers")
        public void addition() { verify(2 + 2 == 4); }

        @Check(value = "divides by zero", enabled = false)
        public void division() { verify(1 / 0 == 0); }

        @Check
        public void subtraction() { verify(5 - 3 == 1); }

        @Todo
        public void multiplication() { }

        static void verify(boolean ok) { if (!ok) throw new AssertionError("expected true"); }
    }

    public static void main(String[] args) throws Exception {
        Method[] methods = CalculatorChecks.class.getDeclaredMethods();
        Arrays.sort(methods, Comparator.comparing(Method::getName)); // order is unspecified
        CalculatorChecks target = new CalculatorChecks();
        int passed = 0;
        for (Method m : methods) {
            Check c = m.getAnnotation(Check.class);
            if (c == null) {
                System.out.println("skip     " + m.getName());
            } else if (!c.enabled()) {
                System.out.println("disabled " + m.getName());
            } else {
                String name = c.value().isEmpty() ? m.getName() : c.value();
                try {
                    m.invoke(target);
                    passed++;
                    System.out.println("PASS     " + name);
                } catch (InvocationTargetException e) {
                    System.out.println("FAIL     " + name + ": " + e.getCause().getMessage());
                }
            }
        }
        System.out.println(passed + " passed");
    }
}`,
        expectedOutput: `PASS     adds two numbers
disabled division
skip     multiplication
FAIL     subtraction: expected true
skip     verify
1 passed`,
        explanation:
          'This is how JUnit works in miniature. `@Check` is RUNTIME, so reflection can see it; `@Todo` is SOURCE, so it has vanished from the class file and `multiplication` is skipped like an unannotated method. The disabled test is never invoked, so its division by zero never runs. The failure inside `subtraction` arrives wrapped in `InvocationTargetException`.',
      },
      {
        id: 't-annotations-reflect-api',
        title: 'Fields, methods, MethodHandles and strong encapsulation',
        runnable: true,
        minJavaVersion: 17,
        code: `import java.lang.invoke.MethodHandle;
import java.lang.invoke.MethodHandles;
import java.lang.invoke.MethodType;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;

public class Main {
    static class Account {
        private final String owner;
        private long balance;
        Account(String owner, long balance) { this.owner = owner; this.balance = balance; }
        private String describe(String prefix) { return prefix + owner + "=" + balance; }
    }

    public static void main(String[] args) throws Throwable {
        Account acc = new Account("ada", 100);
        Class<?> type = acc.getClass();
        System.out.println(type.getSimpleName() + " " + (type == Account.class));

        Field balance = type.getDeclaredField("balance");
        System.out.println(Modifier.toString(balance.getModifiers()) + " " + balance.getType());
        balance.setAccessible(true);            // our own code: allowed
        balance.setLong(acc, 250);              // bypasses the private modifier

        Method describe = type.getDeclaredMethod("describe", String.class);
        describe.setAccessible(true);
        System.out.println(describe.invoke(acc, "reflect: "));

        MethodHandle handle = MethodHandles.lookup().findVirtual(
                Account.class, "describe", MethodType.methodType(String.class, String.class));
        System.out.println((String) handle.invoke(acc, "handle: "));

        Field value = String.class.getDeclaredField("value");
        System.out.println("open? " + value.trySetAccessible());
        try {
            value.setAccessible(true);          // JDK internals are strongly encapsulated
        } catch (RuntimeException e) {
            System.out.println(e.getClass().getSimpleName());
        }
    }
}`,
        expectedOutput: `Account true
private long
reflect: ada=250
handle: ada=250
open? false
InaccessibleObjectException`,
        explanation:
          'Inside your own code (here the unnamed module) `setAccessible(true)` still works, so a private field can be written and a private method invoked. A MethodHandle looked up from `Main` may access its nestmate\'s private method (nestmates, Java 11). The JDK\'s own `java.lang` package is not opened to us, so `trySetAccessible` returns false and `setAccessible` throws `InaccessibleObjectException` (Java 16+).',
      },
      {
        id: 't-annotations-meta',
        title: '@Inherited, @Repeatable and @FunctionalInterface',
        runnable: true,
        code: `import java.lang.annotation.Inherited;
import java.lang.annotation.Repeatable;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

public class Main {
    @Retention(RetentionPolicy.RUNTIME) @Inherited @interface Audited {}
    @Retention(RetentionPolicy.RUNTIME) @interface Owner { String value(); }

    @Retention(RetentionPolicy.RUNTIME) @Repeatable(Schedules.class)
    @interface Schedule { String cron(); }
    @Retention(RetentionPolicy.RUNTIME) @interface Schedules { Schedule[] value(); }

    @Audited
    @Owner("payments")
    @Schedule(cron = "0 0 * * *")
    @Schedule(cron = "0 12 * * *")
    static class BaseJob {}

    static class NightlyJob extends BaseJob {}

    @FunctionalInterface
    interface Task { void run(); }

    public static void main(String[] args) {
        System.out.println(NightlyJob.class.isAnnotationPresent(Audited.class)); // @Inherited
        System.out.println(NightlyJob.class.isAnnotationPresent(Owner.class));   // not inherited

        System.out.println(BaseJob.class.getAnnotation(Schedule.class));       // wrapped in container
        for (Schedule s : BaseJob.class.getAnnotationsByType(Schedule.class)) {
            System.out.println(s.cron());
        }
        System.out.println(BaseJob.class.getAnnotation(Schedules.class).value().length);

        Task t = () -> System.out.println("task ran");
        t.run();
    }
}`,
        expectedOutput: `true
false
null
0 0 * * *
0 12 * * *
2
task ran`,
        explanation:
          '`@Audited` is `@Inherited`, so the subclass reports it; `@Owner` is not. Two `@Schedule` annotations are stored inside one `@Schedules` container, so `getAnnotation(Schedule.class)` returns null while `getAnnotationsByType` looks through the container.',
      },
      {
        id: 't-annotations-frameworks',
        title: 'How frameworks use annotations (not runnable: needs libraries)',
        runnable: false,
        code: `// JUnit 5: the engine scans for @Test methods reflectively and invokes them.
class PriceTest {
    @Test
    @DisplayName("applies 10% discount")
    void discount() { assertEquals(90, Price.of(100).discounted(10)); }
}

// Spring: component scanning finds @Service, constructor injection wires it,
// and @Transactional makes Spring wrap the bean in a proxy.
@Service
class OrderService {
    private final OrderRepository repo;
    OrderService(OrderRepository repo) { this.repo = repo; }

    @Transactional
    public void place(Order o) { repo.save(o); }
}

// Jackson: reads annotations on record components to map JSON names.
record UserDto(@JsonProperty("user_name") String name,
               @JsonIgnore String password) {}

// MapStruct: an annotation PROCESSOR generates OrderMapperImpl at compile time,
// so no reflection is needed at run time.
@Mapper
interface OrderMapper {
    OrderDto toDto(Order order);
}`,
        explanation:
          'The first three are read at run time through reflection (all are RUNTIME annotations). MapStruct\'s `@Mapper` is consumed by an annotation processor inside javac, which writes plain Java code — the run-time cost of reflection disappears.',
      },
    ],
    walkthrough: {
      exampleId: 't-annotations-mini-junit',
      steps: [
        { lines: [11, 16], text: 'A custom annotation type. RUNTIME retention keeps it visible to reflection; @Target(METHOD) makes javac reject it on classes or fields. Elements look like methods and may have defaults.' },
        { lines: [18, 19], text: 'SOURCE retention: javac uses and then discards it, so reflection will never see @Todo.' },
        { lines: [22, 29], text: 'Using the annotation: a single "value" element needs no name; other elements are named; @Check alone takes all defaults.' },
        { lines: [38, 39], text: 'getDeclaredMethods returns every method declared in the class (including private and static ones such as verify), in no guaranteed order — so we sort by name for deterministic output.' },
        { lines: [43, 47], text: 'getAnnotation returns the annotation instance or null. Reading c.enabled() calls the element like an ordinary method.' },
        { lines: [49, 56], text: 'Method.invoke calls the method on the target object. An exception thrown inside the method is wrapped in InvocationTargetException; getCause() unwraps the AssertionError.' },
        { lines: [59, 59], text: 'Only addition passed: division was skipped as disabled, subtraction failed, and multiplication and verify carry no runtime @Check.' },
      ],
    },
    realWorld: {
      title: 'The upgrade that broke on reflection',
      scenario: `A team upgrading a service from Java 11 to Java 17 found it failed at start-up with \`InaccessibleObjectException: Unable to make field private final byte[] java.lang.String.value accessible\`. An old serialisation library used \`setAccessible(true)\` to read JDK internals. On Java 9–15 this had only printed an "illegal reflective access" warning that everyone had ignored; JEP 396 (Java 16) denied it by default and JEP 403 (Java 17) removed the \`--illegal-access\` switch.

The short-term fix was \`--add-opens java.base/java.lang=ALL-UNNAMED\` on the command line. The real fix was upgrading the library to a version that used public APIs and records. The team also added a CI job that runs tests on the next JDK release, so such breakage shows up months before an upgrade instead of on the day.`,
    },
    commonMistakes: [
      {
        mistake: 'Declaring a custom annotation without @Retention(RUNTIME) and wondering why getAnnotation returns null.',
        why: 'The default retention is CLASS: the annotation is written to the class file but the JVM does not expose it to reflection.',
        fix: 'Add `@Retention(RetentionPolicy.RUNTIME)` to annotations a framework must read at run time.',
      },
      {
        mistake: 'Expecting @Inherited to work on interfaces or methods.',
        why: '@Inherited only makes a class-level annotation visible on subclasses. Annotations on implemented interfaces and on overridden methods are never inherited by reflection.',
        fix: 'Walk the interfaces/super methods yourself, or use a framework helper such as Spring\'s `AnnotatedElementUtils`.',
      },
      {
        mistake: 'Printing or processing getDeclaredMethods() in the order returned.',
        why: 'The Javadoc says the elements "are not sorted and are not in any particular order"; it can differ between JVMs and versions.',
        fix: 'Sort by name (and parameter types) before relying on order.',
        code: `Method[] ms = type.getDeclaredMethods();
Arrays.sort(ms, Comparator.comparing(Method::getName));`,
      },
      {
        mistake: 'Catching the exception thrown by a reflectively invoked method directly.',
        why: 'Method.invoke wraps it in InvocationTargetException, so `catch (IllegalStateException e)` never fires.',
        fix: 'Catch InvocationTargetException and inspect `getCause()`.',
      },
      {
        mistake: 'Calling setAccessible(true) on JDK internals and adding --add-opens flags until it works.',
        why: 'Internals change without notice between releases; each --add-opens weakens the module system\'s integrity guarantees.',
        fix: 'Use public APIs, open only your own packages to the frameworks that need them (`opens com.example.model to com.fasterxml.jackson.databind;`), and upgrade libraries that rely on internals.',
      },
    ],
    checks: [
      {
        id: 't8-c1',
        kind: 'predict-output',
        dimension: 'runtime',
        prompt: 'What does this print? Note that `Plain` has no @Retention.',
        code: `import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

public class Main {
    @interface Plain {}

    @Retention(RetentionPolicy.RUNTIME)
    @interface Live {}

    @Plain
    @Live
    static class Service {}

    public static void main(String[] args) {
        int visible = Service.class.getAnnotations().length;
        boolean plain = Service.class.isAnnotationPresent(Plain.class);
        System.out.println(visible + " " + plain);
    }
}`,
        options: [
          { id: 'a', text: '2 true' },
          { id: 'b', text: '1 false' },
          { id: 'c', text: '1 true' },
          { id: 'd', text: '0 false' },
        ],
        correctOptionId: 'b',
        explanation: 'Without @Retention the policy is CLASS: `@Plain` is recorded in the class file but not exposed to reflection. Only the RUNTIME annotation `@Live` is visible.',
      },
      {
        id: 't8-c2',
        kind: 'mcq',
        dimension: 'conceptual',
        prompt: 'Which retention policy must `@Test`, `@Component` or `@JsonProperty` have for JUnit, Spring and Jackson to find them while the application runs?',
        options: [
          { id: 'a', text: 'SOURCE' },
          { id: 'b', text: 'CLASS' },
          { id: 'c', text: 'RUNTIME' },
          { id: 'd', text: 'Any: the JVM always keeps annotations' },
        ],
        correctOptionId: 'c',
        explanation: 'Only RUNTIME annotations are returned by the reflection API. SOURCE is for compiler and processor use (like @Override); CLASS is kept in bytecode for bytecode tools but is invisible to reflection.',
      },
      {
        id: 't8-c3',
        kind: 'multi-select',
        dimension: 'interview',
        prompt: 'Which statements about built-in annotations are true? (Select all that apply.)',
        options: [
          { id: 'a', text: '@Override makes javac report an error if the method does not actually override or implement a supertype method.' },
          { id: 'b', text: '@FunctionalInterface is required for an interface to be used as a lambda target.' },
          { id: 'c', text: '@Deprecated(forRemoval = true) produces a removal warning at use sites that is on by default.' },
          { id: 'd', text: '@SafeVarargs can be placed on any instance method that can be overridden.' },
          { id: 'e', text: '@SuppressWarnings should be placed on the smallest declaration that needs it.' },
        ],
        correctOptionIds: ['a', 'c', 'e'],
        explanation: 'Any interface with a single abstract method is a lambda target; @FunctionalInterface only asks the compiler to enforce that. @SafeVarargs is restricted to methods that cannot be overridden — static, final and (since Java 9) private methods — and constructors.',
      },
      {
        id: 't8-c4',
        kind: 'predict-output',
        dimension: 'debugging',
        prompt: '`@Secured` is RUNTIME and @Inherited. What does this print?',
        code: `import java.lang.annotation.Inherited;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

public class Main {
    @Retention(RetentionPolicy.RUNTIME)
    @Inherited
    @interface Secured {}

    @Secured interface Api {}
    static class ApiImpl implements Api {}

    @Secured static class Base {}
    static class Child extends Base {}

    public static void main(String[] args) {
        System.out.println(ApiImpl.class.isAnnotationPresent(Secured.class)
                + " " + Child.class.isAnnotationPresent(Secured.class));
    }
}`,
        options: [
          { id: 'a', text: 'true true' },
          { id: 'b', text: 'false true' },
          { id: 'c', text: 'true false' },
          { id: 'd', text: 'false false' },
        ],
        correctOptionId: 'b',
        explanation: '@Inherited only propagates class annotations from a superclass to subclasses. An annotation on an implemented interface is never inherited, even with @Inherited.',
      },
      {
        id: 't8-c5',
        kind: 'mcq',
        dimension: 'runtime',
        prompt: 'On Java 17, a library calls `String.class.getDeclaredField("value").setAccessible(true)` from the class path. What happens?',
        options: [
          { id: 'a', text: 'It works and prints an "illegal reflective access" warning.' },
          { id: 'b', text: 'It throws InaccessibleObjectException unless java.lang is opened, e.g. with --add-opens java.base/java.lang=ALL-UNNAMED.' },
          { id: 'c', text: 'It throws NoSuchFieldException because the field was removed.' },
          { id: 'd', text: 'It throws SecurityException because a SecurityManager is always installed.' },
        ],
        correctOptionId: 'b',
        explanation: 'JDK internals are strongly encapsulated by default since Java 16 (JEP 396), and Java 17 (JEP 403) removed the --illegal-access escape hatch. Only an explicit --add-opens (or Add-Opens in an executable JAR manifest) restores deep reflection on that package.',
      },
    ],
    challengeIds: [],
    masteryCriteria: [
      'Choose the right retention and target for a new annotation and explain the default.',
      'Write a small reflective runner that finds annotated methods and invokes them, handling InvocationTargetException.',
      'Explain how JUnit, Spring and Jackson use annotations and reflection, and how an annotation processor differs.',
      'Explain strong encapsulation, --add-opens and why setAccessible on JDK internals fails since Java 16/17.',
      'Compare reflection with MethodHandles and with generated code in terms of speed and safety.',
    ],
    relatedLessonIds: ['o-interfaces', 't-generics', 'r-class-loading', 'ts-junit', 'sp-ioc-boot', 'p-packages-classpath'],
    revision: [
      { id: 'r1', question: 'What are the three retention policies and which is the default?', answer: 'SOURCE (discarded by javac), CLASS (in the class file but invisible to reflection — the default) and RUNTIME (visible to reflection).' },
      { id: 'r2', question: 'getMethods() vs getDeclaredMethods()?', answer: 'getMethods returns public methods including inherited ones; getDeclaredMethods returns all methods (any access) declared by that class only. Neither has a guaranteed order.' },
      { id: 'r3', question: 'What changed for reflection in Java 16 and 17?', answer: 'JEP 396 made strong encapsulation of JDK internals the default in 16, and JEP 403 removed --illegal-access in 17, so setAccessible on non-opened JDK internals throws InaccessibleObjectException unless --add-opens is used.' },
      { id: 'r4', question: 'How does an annotation processor differ from runtime reflection?', answer: 'A processor runs inside javac, sees annotated source elements and can generate code or report errors before the program runs; reflection reads RUNTIME annotations while the program runs, with run-time cost and run-time failures.' },
    ],
  },
];
