import type { LessonConcepts } from '@/types/curriculum';

/** Concept pages for the extra module-4 lessons: regular expressions, annotations and reflection. */
export const regexReflectionConcepts: Record<string, LessonConcepts> = {
  't-regex': {
    textbook: {
      definition:
        'A **regular expression** is a string that specifies a set of character sequences in a formal pattern syntax built from literals, character classes, quantifiers, groups, anchors and alternation. In Java, the package `java.util.regex` provides `Pattern`, a **compiled representation** of a regular expression, and `Matcher`, an engine that performs **match operations** on a `CharSequence` by interpreting a pattern. `Pattern` instances are immutable and safe for use by multiple concurrent threads; `Matcher` instances hold match state and are not. The implementation is a **backtracking** matcher, which also supports back-references and look-around assertions.',
      terms: [
        { term: 'Pattern', meaning: 'An immutable, thread-safe compiled form of a regular expression, created with `Pattern.compile` and used to create matchers.' },
        { term: 'Matcher', meaning: 'A stateful object that applies one pattern to one input sequence and reports matches, group boundaries and captured text.' },
        { term: 'Capturing group', meaning: 'A parenthesised subexpression whose matched text is remembered and can be retrieved by number or by name with `group()`.' },
        { term: 'Quantifier', meaning: 'A construct such as `*`, `+`, `?` or `{n,m}` that states how often the preceding element may repeat; it can be greedy, reluctant or possessive.' },
        { term: 'Backtracking', meaning: 'A matching strategy that tries alternatives in order and, on failure, returns to the most recent choice point to try the next alternative.' },
      ],
      source: 'Javadoc for java.util.regex.Pattern and java.util.regex.Matcher',
    },
    interviewDefinition:
      'A **regular expression** is a declarative pattern for text. In Java, `Pattern.compile` parses it once into an immutable, thread-safe `Pattern`; each input gets its own stateful `Matcher`, which answers `matches()` (whole input), `lookingAt()` (prefix) or `find()` (next occurrence) and exposes capturing groups. `java.util.regex` is a **backtracking** engine, so it supports back-references and look-arounds, but ambiguous patterns can take exponential or high-polynomial time on near-miss input (ReDoS).',
    interviewFollowUps: [
      {
        question: 'Why should a Pattern be a `static final` field?',
        answer: 'Compiling parses the regex into a matcher tree, which costs far more than a typical match. `Pattern` is immutable and thread-safe, so one instance can serve every thread; `String.matches`, `replaceAll` and most `split` calls recompile on every call.',
      },
      {
        question: 'What is the difference between greedy, reluctant and possessive quantifiers?',
        answer: 'Greedy (`.*`) consumes as much as possible and backs off one character at a time; reluctant (`.*?`) consumes as little as possible and extends; possessive (`.*+`) consumes as much as possible and never backs off, which can make a match fail but also removes backtracking.',
      },
      {
        question: 'How would you protect a service from ReDoS?',
        answer: 'Bound input length, write unambiguous patterns (each repeated part should not be able to match what follows it, e.g. `[^,]*,` instead of `.*?,`), use possessive quantifiers or atomic groups, never accept patterns from users unchecked, and consider a linear-time engine such as RE2/J for untrusted patterns.',
      },
    ],
    mnemonic: {
      device: '"Greedy grabs it all, Lazy keeps it small, Possessive won\'t give back at all"',
      expansion: [
        { key: 'Greedy grabs it all', meaning: '`*`, `+`, `{n,m}` — take the maximum, then backtrack one character at a time until the rest matches' },
        { key: 'Lazy keeps it small', meaning: '`*?`, `+?` (reluctant) — take the minimum, then extend one character at a time' },
        { key: 'Possessive won\'t give back at all', meaning: '`*+`, `++` — take the maximum and never backtrack; fast, but may fail where greedy succeeds' },
      ],
      visual: 'Three children at a sweet jar: one scoops the whole jar and hands back sweets until the parent is happy, one takes a single sweet and asks for more, and one scoops the whole jar and runs off.',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'Pattern is the stencil, Matcher is the hand',
        body: 'Cutting a stencil is slow and careful work, but once cut it can be shared by everyone in the room. Each person still needs their own hand to slide it across their own sheet of paper and remember where they are. `Pattern` is the stencil (compile once, share freely); `Matcher` is the hand (one per input, never shared between threads).',
      },
      {
        kind: 'insight',
        title: 'Four String methods are regex in disguise',
        body: '`split`, `matches`, `replaceAll` and `replaceFirst` all take a regex, while `replace(CharSequence, CharSequence)` and `contains` are literal. That single fact explains most text bugs: `split(".")` returns an empty array, `split("|")` splits between every character, and `replaceAll("$", "")` does nothing visible because `$` matches the end of input, not a dollar sign.',
      },
      {
        kind: 'real-world',
        title: 'Named groups turn logs into data',
        body: 'Log shippers such as Logstash parse lines with patterns made of named captures, and the same idea works in plain Java: `(?<ts>\\S+) (?<level>[A-Z]+) (?<msg>.*)` turns each line into fields you can count, filter and alert on. Precompile it, keep it anchored, and benchmark it on your largest real lines.',
      },
      {
        kind: 'angle',
        title: 'Knowing when to stop',
        body: 'Regex describes **regular** languages plus some extensions; it cannot count arbitrarily nested brackets, so it can never correctly parse HTML, JSON or source code. A good rule: if you need more than one screen of regex, or a comment longer than the pattern, switch to `split`, a `Scanner`, a hand-written loop or a real parser.',
      },
    ],
    diagrams: [
      {
        id: 't-regex-quantifiers',
        kind: 'concept',
        title: 'Three quantifiers, one input',
        caption: 'The same input and almost the same pattern produce three different results. Greedy overshoots to the last >, reluctant stops at the first, and possessive eats the final > and refuses to return it.',
        explanation: [
          'All three patterns are applied to the same **Input text**: `<b>bold</b> and <i>it</i>`. Each pattern means a <, then one or more characters, then a >.',
          '**Greedy <.+>** first grabs everything to the end, then backs off one character at a time until a > can match. It stops at the last >, so the result is the **Whole string**.',
          '**Reluctant <.+?>** takes as little as possible and extends one character at a time until the next > matches. It stops at the first > and returns **<b>**.',
          '**Possessive <.++>** grabs everything to the end like greedy, but refuses to give anything back. No character is left for the final >, so the result is **No match**.',
          'Takeaway: the quantifier flavour decides how far a match reaches. To stop at the first delimiter use a reluctant quantifier, or better, a negated class such as `[^>]+`.',
        ],
        cols: 3,
        rows: 3,
        nodes: [
          { id: 'in', label: 'Input text', detail: '<b>bold</b> and <i>it</i>', col: 0, row: 0, span: 3, shape: 'note' },
          { id: 'g', label: 'Greedy <.+>', detail: 'grab all, back off', col: 0, row: 1, tone: 'primary' },
          { id: 'r', label: 'Reluctant <.+?>', detail: 'take one, extend', col: 1, row: 1, tone: 'accent' },
          { id: 'p', label: 'Possessive <.++>', detail: 'grab all, never return', col: 2, row: 1, tone: 'warning' },
          { id: 'gr', label: 'Whole string', detail: 'up to the LAST >', col: 0, row: 2, shape: 'pill', tone: 'neutral' },
          { id: 'rr', label: '<b>', detail: 'stops at the FIRST >', col: 1, row: 2, shape: 'pill', tone: 'success' },
          { id: 'pr', label: 'No match', detail: 'nothing left for >', col: 2, row: 2, shape: 'pill', tone: 'danger' },
        ],
        edges: [
          { from: 'in', to: 'g' },
          { from: 'in', to: 'r' },
          { from: 'in', to: 'p' },
          { from: 'g', to: 'gr', label: 'backtracks to >' },
          { from: 'r', to: 'rr', label: 'extends to >' },
          { from: 'p', to: 'pr', label: 'cannot backtrack' },
        ],
      },
      {
        id: 't-regex-lifecycle',
        kind: 'flow',
        title: 'From regex string to matches',
        caption: 'Compilation is the expensive step, so it happens once; Matchers are cheap and created per input. The String convenience methods silently repeat the compile step on every call.',
        explanation: [
          'In the **Once per program** group, a **Regex string** from your source is passed to **Pattern.compile**, which parses it into a matcher tree. This is the expensive step.',
          'The result is a **Pattern**, immutable and thread-safe; the static final label means it should be stored once in a constant and shared everywhere.',
          'In the **Once per input** group, `pattern.matcher(input)` creates a cheap, stateful **Matcher** for each input, which then calls **find() / matches()** to walk the text.',
          'When find() returns true, read the match with **group(), start()** and call find() again. When it returns false, the dashed arrow leads to **No more matches**.',
          'The dashed every call arrow from **String.matches/split** shows the hidden cost: these convenience methods compile the pattern again on each call. Takeaway: compile once, match many times.',
        ],
        cols: 5,
        rows: 2,
        nodes: [
          { id: 'src', label: 'Regex string', detail: 'text in your source', col: 0, row: 0, shape: 'note' },
          { id: 'compile', label: 'Pattern.compile', detail: 'parse once (costly)', col: 1, row: 0, tone: 'primary' },
          { id: 'pattern', label: 'Pattern', detail: 'immutable, thread-safe', col: 2, row: 0, shape: 'cylinder', tone: 'accent' },
          { id: 'matcher', label: 'Matcher', detail: 'per input, stateful', col: 3, row: 0, tone: 'primary' },
          { id: 'find', label: 'find() / matches()', detail: 'walk the input', col: 4, row: 0, tone: 'primary' },
          { id: 'string', label: 'String.matches/split', detail: 'recompiles each call', col: 1, row: 1, tone: 'warning' },
          { id: 'done', label: 'No more matches', detail: 'find() returned false', col: 3, row: 1, shape: 'pill', tone: 'neutral' },
          { id: 'groups', label: 'group(), start()', detail: 'read, then find() again', col: 4, row: 1, shape: 'pill', tone: 'success' },
        ],
        edges: [
          { from: 'src', to: 'compile' },
          { from: 'compile', to: 'pattern', label: 'static final' },
          { from: 'pattern', to: 'matcher', label: 'matcher(input)' },
          { from: 'matcher', to: 'find' },
          { from: 'find', to: 'groups', label: 'true' },
          { from: 'find', to: 'done', label: 'false', dashed: true },
          { from: 'string', to: 'compile', label: 'every call', dashed: true },
        ],
        groups: [
          { label: 'Once per program', fromCol: 0, toCol: 2, fromRow: 0, toRow: 0, tone: 'neutral' },
          { label: 'Once per input', fromCol: 3, toCol: 4, fromRow: 0, toRow: 1, tone: 'primary' },
        ],
      },
      {
        id: 't-regex-redos',
        kind: 'flow',
        title: 'Why one pattern hangs and the other does not',
        caption: 'Both patterns accept the same lines. When a line almost matches, the top pattern retries every way of sharing commas between the 11 groups; the bottom one has exactly one way and fails after a single pass.',
        explanation: [
          'The top row starts with the pattern **^(.*?,){11}P**. Because `.*?` can also match commas, a field may swallow a comma that really belongs to the next field.',
          'That gives **Many splits**: a huge number of ways to share the commas among the 11 groups. On a **Near-miss line**, which almost matches but lacks the final P, the backtracking engine tries them all.',
          'The number of attempts grows roughly like n to the 11th power, so the result is **CPU pegged**: seconds for short lines, hours for longer ones.',
          'The bottom row uses **^([^,]*,){11}P**. A field cannot contain a comma, so there is exactly **One split**, and the no ambiguity arrow means there is nothing to retry.',
          'The same near-miss line now fails after a single pass, in **Linear time** measured in microseconds. Takeaway: make each repeated part unable to match what follows it, and backtracking cannot explode.',
        ],
        cols: 4,
        rows: 2,
        nodes: [
          { id: 'e1', label: '^(.*?,){11}P', detail: 'a field may contain ,', col: 0, row: 0, shape: 'note', tone: 'danger' },
          { id: 'm1', label: 'Many splits', detail: 'any group may take a ,', col: 1, row: 0, tone: 'warning' },
          { id: 'o1', label: 'Near-miss line', detail: 'retries ~n^11 splits', col: 2, row: 0, tone: 'danger' },
          { id: 'r1', label: 'CPU pegged', detail: 'seconds, then hours', col: 3, row: 0, shape: 'pill', tone: 'danger' },
          { id: 'e2', label: '^([^,]*,){11}P', detail: 'a field cannot hold ,', col: 0, row: 1, shape: 'note', tone: 'success' },
          { id: 'm2', label: 'One split', detail: 'each , ends a field', col: 1, row: 1, tone: 'primary' },
          { id: 'o2', label: 'Near-miss line', detail: 'fails after one pass', col: 2, row: 1, tone: 'success' },
          { id: 'r2', label: 'Linear time', detail: 'microseconds', col: 3, row: 1, shape: 'pill', tone: 'success' },
        ],
        edges: [
          { from: 'e1', to: 'm1' },
          { from: 'm1', to: 'o1', label: 'backtracking' },
          { from: 'o1', to: 'r1' },
          { from: 'e2', to: 'm2' },
          { from: 'm2', to: 'o2', label: 'no ambiguity' },
          { from: 'o2', to: 'r2' },
        ],
      },
    ],
    variants: [
      {
        title: 'Quantifier kinds',
        intro: 'Every quantifier (`*`, `+`, `?`, `{n,m}`) comes in three flavours. Append `?` for reluctant, `+` for possessive.',
        items: [
          {
            name: 'Greedy',
            summary: 'Matches as much as possible, then gives characters back one at a time until the rest of the pattern matches. The default.',
            support: 'supported',
            code: '"<b>x</b>".replaceAll("<.*>", "_")   // "_"',
          },
          {
            name: 'Reluctant (lazy)',
            summary: 'Matches as little as possible, then takes one more character at a time. Right for "up to the first delimiter", though a negated class such as `[^>]*` is usually faster and safer.',
            support: 'supported',
            code: '"<b>x</b>".replaceAll("<.*?>", "_")  // "_x_"',
          },
          {
            name: 'Possessive',
            summary: 'Matches as much as possible and never backtracks into what it took. Prevents catastrophic backtracking, but can fail where greedy succeeds.',
            support: 'supported',
            note: 'Supported by Java (and PCRE), but not by JavaScript or Python\'s re before 3.11.',
            code: 'Pattern.compile("\\\\d++\\\\.")   // digits, then a dot',
          },
          {
            name: 'Atomic group (?>...)',
            summary: 'The group version of possessive: once the group has matched, the engine will not backtrack into it to try alternatives.',
            support: 'supported',
            code: 'Pattern.compile("(?>a|ab)c")  // never matches "abc"',
          },
        ],
      },
      {
        title: 'Matching methods',
        intro: 'Same Pattern, different questions. Choosing the wrong one is the most common validation bug.',
        items: [
          {
            name: 'matches()',
            summary: 'The entire input (region) must match. Use it for validation.',
            support: 'supported',
            code: 'ID.matcher("ABC-1234").matches()',
          },
          {
            name: 'lookingAt()',
            summary: 'The match must start at the beginning but may stop before the end. Useful for tokenisers that consume a prefix.',
            support: 'supported',
          },
          {
            name: 'find()',
            summary: 'Finds the next match anywhere after the previous one; loop on it to visit all matches.',
            support: 'supported',
            code: 'while (m.find()) System.out.println(m.group());',
          },
          {
            name: 'results() and replaceAll(Function)',
            summary: 'Java 9 additions: a `Stream<MatchResult>` of every match, and replacement computed per match by a lambda.',
            support: 'supported',
            code: 'm.replaceAll(r -> r.group().toUpperCase())',
          },
          {
            name: 'asPredicate() / asMatchPredicate()',
            summary: '`asPredicate` (Java 8) behaves like find; `asMatchPredicate` (Java 11) behaves like matches. Handy in stream filters — pick the one you mean.',
            support: 'supported',
          },
        ],
      },
      {
        title: 'Kinds of regex constructs',
        intro: 'The building blocks every pattern is made of, as listed in the Pattern Javadoc. In Java source code each backslash must be written twice.',
        items: [
          { name: 'Character classes', summary: 'Match one character from a set: `[abc]`, ranges such as `[a-z]`, negation `[^0-9]`, and predefined classes `\\d`, `\\w`, `\\s` and `.`.', support: 'supported', code: 'Pattern.compile("[A-Z]{3}-\\\\d{4}")' },
          { name: 'Quantifiers', summary: 'Repeat the preceding element: `*` (zero or more), `+` (one or more), `?` (optional) and `{n,m}`; each comes in greedy, reluctant and possessive forms.', support: 'supported', code: '"a{2,4}"' },
          { name: 'Anchors and boundaries', summary: '`^` and `$` match the start and end of input (or of each line with MULTILINE) and `\\b` a word boundary; they match a position, not a character.', support: 'supported', code: 'Pattern.compile("^\\\\w+$")' },
          { name: 'Groups', summary: 'Capturing `( )`, named `(?<name> )` and non-capturing `(?: )` groups bundle parts for quantifiers and alternation; capturing groups also remember the matched text.', support: 'supported', code: 'Pattern.compile("(?<year>\\\\d{4})-(?<month>\\\\d{2})")' },
          { name: 'Alternation', summary: '`|` matches either the left or the right alternative; alternatives are tried from left to right.', support: 'supported', code: '"cat|dog"' },
          { name: 'Look-around assertions', summary: 'Look-ahead `(?= )` / `(?! )` and look-behind `(?<= )` / `(?<! )` test what precedes or follows a position without consuming characters.', support: 'supported', note: 'Look-behind needs a bounded maximum length.', code: '"\\\\d+(?=px)"  // digits followed by px' },
          { name: 'Back-references', summary: '`\\1` or `\\k<name>` match the exact text an earlier group captured; they go beyond regular languages and rely on backtracking.', support: 'supported', code: '"(\\\\w)\\\\1"  // a doubled character' },
          { name: 'Flags', summary: 'Options such as CASE_INSENSITIVE, MULTILINE, DOTALL and UNICODE_CHARACTER_CLASS, passed to compile or embedded as `(?i)`, `(?m)`, `(?s)` and `(?U)`.', support: 'supported', code: 'Pattern.compile("hello", Pattern.CASE_INSENSITIVE)' },
        ],
      },
    ],
    deepDive: [
      {
        title: 'Backtracking engines vs automata — and what Java does today',
        body: 'Classic regular expressions can be matched in linear time with a finite automaton (Thompson\'s construction), which is what RE2 and Go use. Perl, PCRE and `java.util.regex` instead use recursive backtracking so they can offer back-references and look-arounds, at the price of worst-case exponential time. Modern JDKs remember positions where some greedy group loops already failed, so textbook cases such as `^(a+)+$` now fail fast — but that is an implementation optimisation, not a guarantee: reluctant loops and overlapping bounded repeats like `^(.*?,){11}P` still blow up. For untrusted patterns, use a linear-time engine such as RE2/J.',
        sources: [
          { label: 'Russ Cox: Regular Expression Matching Can Be Simple And Fast', url: 'https://swtch.com/~rsc/regexp/regexp1.html' },
          { label: 'OWASP: Regular expression Denial of Service (ReDoS)', url: 'https://owasp.org/www-community/attacks/Regular_expression_Denial_of_Service_-_ReDoS' },
          { label: 'Cloudflare: Details of the Cloudflare outage on July 2, 2019', url: 'https://blog.cloudflare.com/details-of-the-cloudflare-outage-on-july-2-2019/' },
        ],
      },
      {
        title: 'The split fast path and its surprising rules',
        body: '`String.split` avoids the regex engine when the separator is a single character that is not a metacharacter (or a backslash-escaped one), so `split(",")` is cheap while `split(", ")` compiles a Pattern every call. Its result rules are worth memorising: trailing empty strings are removed with limit 0, kept with a negative limit; since Java 8 a zero-width match at index 0 never produces a leading empty string; and an input with no match returns an array containing the original string.',
        sources: [
          { label: 'String.split(String, int) Javadoc (Java 21)', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/String.html#split(java.lang.String,int)' },
        ],
      },
      {
        title: 'Unicode is opt-in',
        body: 'By default `\\w`, `\\d` and `\\b` are ASCII-only and `CASE_INSENSITIVE` folds only US-ASCII letters. "café".matches("\\\\w+") is false. Add `UNICODE_CASE` for Unicode case folding and `UNICODE_CHARACTER_CLASS` (`(?U)`) to make the predefined classes follow Unicode properties, or use explicit properties such as `\\p{L}` (any letter) and `\\p{IsAlphabetic}`. Also beware that `.` excludes line terminators unless `DOTALL` is on.',
        sources: [
          { label: 'java.util.regex.Pattern Javadoc (Java 21)', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/regex/Pattern.html' },
        ],
      },
      {
        title: 'Deep recursion: StackOverflowError on long inputs',
        body: 'Besides being slow, the backtracking engine is recursive for many constructs. An alternation inside a repeat, such as `(a|b)*`, applied to a very long input can throw `StackOverflowError` because each repetition adds stack frames. Rewriting the alternation as a character class (`[ab]*`) or making the repeat possessive (`(?:a|b)*+`) avoids the recursion, which is another reason to keep patterns simple and inputs bounded.',
        sources: [{ label: 'java.util.regex.Pattern Javadoc (Java 21)', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/regex/Pattern.html' }],
      },
    ],
  },

  't-annotations-reflection': {
    textbook: {
      definition:
        'An **annotation** is a modifier, consisting of the name of an annotation interface and zero or more element-value pairs, that associates **metadata** with a program element such as a declaration or a use of a type; it has no direct effect on the operation of the code it annotates. Annotation interfaces are declared with `@interface`, and the meta-annotations `@Retention` and `@Target` determine how long annotations are retained and where they may appear. **Reflection** is the capability, provided by `java.lang.Class` and the package `java.lang.reflect`, for a running program to inspect classes, fields, methods and annotations and to access or invoke them dynamically, subject to access control.',
      terms: [
        { term: 'Annotation interface', meaning: 'A specialised interface declared with `@interface`, whose methods define the elements that an annotation of that type may supply.' },
        { term: 'Retention policy', meaning: 'The `RetentionPolicy` value, SOURCE, CLASS or RUNTIME, that decides whether an annotation is discarded by the compiler, recorded in the class file, or also readable by reflection.' },
        { term: 'Meta-annotation', meaning: 'An annotation applied to an annotation interface declaration, such as `@Retention`, `@Target`, `@Documented`, `@Inherited` or `@Repeatable`.' },
        { term: 'Annotation processor', meaning: 'A compiler plug-in, run by `javac` through the `javax.annotation.processing` API, that reads annotations at compile time and may generate new source files.' },
        { term: 'Reflection', meaning: 'Run-time inspection and use of program structure through objects such as `Class`, `Method`, `Field` and `Constructor`.' },
      ],
      source: 'JLS §9.6 and §9.7; Javadoc for java.lang.annotation and java.lang.reflect',
    },
    interviewDefinition:
      'An **annotation** is typed metadata attached to a declaration or type use; it has no behaviour of its own and matters only to whatever reads it — the compiler, an **annotation processor** at compile time, or a framework at run time via **reflection**. `@Retention` decides how long it lives (`SOURCE`, `CLASS` by default, or `RUNTIME`) and `@Target` decides where it may appear. Reflection treats classes as data — `Class`, `Method`, `Field` — trading compile-time safety and speed for generality, and since Java 16/17 it cannot break into strongly encapsulated JDK internals.',
    interviewFollowUps: [
      {
        question: 'Why does `@Transactional` not work when a Spring bean calls its own method?',
        answer: 'Spring applies it by wrapping the bean in a proxy that reads the annotation and starts a transaction. A call through `this` goes directly to the target object and bypasses the proxy, so no transaction is started. Call through another bean or restructure the code.',
      },
      {
        question: 'Is reflection slow?',
        answer: 'A reflective call costs access checks, argument boxing into an `Object[]` and exception wrapping, and is harder for the JIT to inline. Since Java 18 (JEP 416) `Method.invoke` is built on method handles; a `MethodHandle` stored in a `static final` field can be inlined almost like a direct call. Frameworks cache `Method` objects and handles rather than looking them up per call.',
      },
      {
        question: 'getMethods() or getDeclaredMethods()?',
        answer: '`getMethods()` returns public methods including inherited ones; `getDeclaredMethods()` returns every method declared in that class only, of any access level, excluding inherited ones. Neither guarantees an order.',
      },
      {
        question: 'What does `--add-opens` do?',
        answer: 'It opens a module\'s package for deep reflection to another module (or ALL-UNNAMED), so `setAccessible(true)` on its non-public members succeeds. In your own modules, the equivalent is an `opens` directive in module-info.java.',
      },
    ],
    mnemonic: {
      device: '"No reader, no effect: Sticky note, Stamp, Sign"',
      expansion: [
        { key: 'No reader, no effect', meaning: 'An annotation does nothing by itself; the compiler, a processor or a framework must read it' },
        { key: 'Sticky note = SOURCE', meaning: 'Peeled off before printing: javac uses it (e.g. @Override) and discards it' },
        { key: 'Stamp = CLASS', meaning: 'Printed in the fine print of the class file, but reflection does not read it (the default)' },
        { key: 'Sign = RUNTIME', meaning: 'Hung on the door at run time: getAnnotation can see it (@Test, @Component, @JsonProperty)' },
      ],
      visual: 'A manuscript with a sticky note that the editor removes, a publisher\'s stamp on the copyright page that readers skip, and a sign on the bookshop door that every visitor reads.',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'Luggage tags and scanners',
        body: 'A "FRAGILE" tag does not protect a suitcase; the handlers who read it do. Annotations are tags, and retention decides whether the tag survives the journey: some are torn off at check-in (SOURCE), some stay on the bag but nobody at the destination looks (CLASS), and some are scanned on arrival (RUNTIME). Reflection is the scanner.',
      },
      {
        kind: 'insight',
        title: 'An annotation is an interface, and getAnnotation returns a proxy',
        body: '`@interface Check` compiles to an interface extending `java.lang.annotation.Annotation`. When you call `getAnnotation`, the JVM parses the stored element values and returns a dynamic proxy that implements your interface — which is why element values must be compile-time constants, and why `equals` and `hashCode` on annotations compare element values as the `Annotation` contract specifies.',
      },
      {
        kind: 'real-world',
        title: 'Spring Boot start-up is mostly reading annotations',
        body: 'At start-up Spring scans packages for `@Component`, `@Service` and `@Configuration`, reads `@Autowired`, `@Value` and `@Transactional` reflectively, and creates proxies for cross-cutting behaviour. That is why large apps spend seconds starting, and why Spring AOT, Micronaut, Quarkus and Dagger move as much of this work as possible to build time.',
      },
      {
        kind: 'angle',
        title: 'Compile time beats run time when it can',
        body: 'Anything an annotation processor can do at compile time is checked before the program runs and costs nothing at run time: MapStruct writes plain mapping code, Dagger writes the dependency graph, and records (Java 16) give you constructors, accessors, `equals` and `hashCode` with no tool at all. GraalVM native images reward this, because reflection there must be declared in advance.',
      },
    ],
    diagrams: [
      {
        id: 't-annotations-retention',
        kind: 'concept',
        title: 'How far each retention policy survives',
        caption: 'Each bar shows where an annotation still exists. Only RUNTIME annotations reach the running JVM, so only they can drive frameworks through reflection.',
        explanation: [
          'The top row shows the three stages of a program: the **.java source** that the compiler reads, the **.class file** on disk produced by javac, and the **Running JVM** after class loading.',
          'Each bar below shows how far an annotation survives. **SOURCE** annotations such as @Override cover only the source column: javac uses them and then throws them away.',
          '**CLASS (the default)** reaches the class file, so bytecode tools can see it, but it stops before the running JVM: getAnnotation returns null for it.',
          '**RUNTIME** stretches across all three stages. Annotations such as @Test, @Component and @JsonProperty are therefore visible to reflection while the program runs.',
          'Takeaway: a custom annotation that a framework must read at run time needs `@Retention(RetentionPolicy.RUNTIME)`, because the default stops one stage short.',
        ],
        cols: 3,
        rows: 4,
        nodes: [
          { id: 'src', label: '.java source', detail: 'compiler sees all', col: 0, row: 0, shape: 'note', tone: 'neutral' },
          { id: 'cls', label: '.class file', detail: 'bytecode on disk', col: 1, row: 0, shape: 'note', tone: 'neutral' },
          { id: 'jvm', label: 'Running JVM', detail: 'reflection API', col: 2, row: 0, shape: 'note', tone: 'neutral' },
          { id: 'source', label: 'SOURCE', detail: '@Override, Lombok', col: 0, row: 1, tone: 'warning' },
          { id: 'class', label: 'CLASS (the default)', detail: 'kept for bytecode tools; invisible to getAnnotation', col: 0, row: 2, span: 2, tone: 'accent' },
          { id: 'runtime', label: 'RUNTIME', detail: '@Test, @Component, @JsonProperty, @Deprecated: visible to reflection', col: 0, row: 3, span: 3, tone: 'success' },
        ],
        edges: [
          { from: 'src', to: 'cls', label: 'javac' },
          { from: 'cls', to: 'jvm', label: 'class loading' },
        ],
      },
      {
        id: 't-annotations-runner-flow',
        kind: 'flow',
        title: 'How a test framework finds and runs @Test',
        caption: 'This is the loop JUnit (and the lesson\'s mini runner) performs. Notice the two places it can go wrong at run time: a missing RUNTIME retention, and exceptions arriving wrapped.',
        explanation: [
          'The runner starts with **Scan class path** to find candidate test classes and loads each one, which gives it a **Class<?> object** to inspect.',
          'It calls **getDeclaredMethods** to list the methods. Their order is not guaranteed, so a good runner sorts them first, then examines them one at a time, as the for each arrow shows.',
          'For each method it calls **getAnnotation(Test)**. If the result is null, because the method is not annotated or the annotation lacks RUNTIME retention, the dashed arrow leads to **Skip method**.',
          'If the annotation is present, the runner creates a fresh instance and calls **Method.invoke**. A test method that returns normally is a **PASS**.',
          'If the test throws, reflection wraps the exception in InvocationTargetException, so the runner reports **FAIL** and reads getCause() to show the real assertion error.',
        ],
        cols: 4,
        rows: 3,
        nodes: [
          { id: 'scan', label: 'Scan class path', detail: 'find candidate classes', col: 0, row: 0, tone: 'primary' },
          { id: 'cls', label: 'Class<?> object', detail: 'loaded by a class loader', col: 1, row: 0, tone: 'primary' },
          { id: 'methods', label: 'getDeclaredMethods', detail: 'unordered: sort first', col: 2, row: 0, tone: 'primary' },
          { id: 'ann', label: 'getAnnotation(Test)', detail: 'null unless RUNTIME', col: 3, row: 0, tone: 'accent' },
          { id: 'skip', label: 'Skip method', detail: 'no visible annotation', col: 2, row: 1, shape: 'pill', tone: 'neutral' },
          { id: 'invoke', label: 'Method.invoke', detail: 'on a fresh instance', col: 3, row: 1, tone: 'primary' },
          { id: 'fail', label: 'FAIL', detail: 'InvocationTargetException, read getCause()', col: 2, row: 2, shape: 'pill', tone: 'danger' },
          { id: 'pass', label: 'PASS', detail: 'method returned', col: 3, row: 2, shape: 'pill', tone: 'success' },
        ],
        edges: [
          { from: 'scan', to: 'cls' },
          { from: 'cls', to: 'methods' },
          { from: 'methods', to: 'ann', label: 'for each' },
          { from: 'ann', to: 'skip', label: 'null', dashed: true },
          { from: 'ann', to: 'invoke', label: 'present' },
          { from: 'invoke', to: 'pass', label: 'returns' },
          { from: 'invoke', to: 'fail', label: 'throws' },
        ],
      },
      {
        id: 't-annotations-architecture',
        kind: 'architecture',
        title: 'Compile-time processing vs run-time reflection',
        caption: 'Processors run inside javac and can generate more source; frameworks read RUNTIME annotations later through reflection. Strong encapsulation stops reflection at the JDK\'s module boundary unless a package is opened.',
        explanation: [
          'In the **Compile time** group, **Annotated source** goes into **javac**, which runs each **Annotation processor**, such as MapStruct or Dagger, to read the annotations.',
          'A processor can write **Generated sources**, such as OrderMapperImpl. The next round arrow shows javac compiling them too, repeating until no new files appear.',
          'javac then emits **.class files** that keep CLASS and RUNTIME annotations. Class loading turns them into **Your loaded classes** inside the **Run time (JVM)** group.',
          'A **Framework** such as JUnit, Spring or Jackson scans those classes through the **Reflection API**, reading RUNTIME annotations and invoking methods; on hot paths it switches to **MethodHandles**, which are checked once and can be inlined.',
          'The dashed blocked arrow shows the limit: since Java 16, reflection cannot reach into **JDK internals** unless a package is explicitly opened. Takeaway: prefer compile-time processing and use reflection with care.',
        ],
        cols: 4,
        rows: 3,
        nodes: [
          { id: 'src', label: 'Annotated source', detail: '@Mapper, @Entity, @Test', col: 0, row: 0, shape: 'note' },
          { id: 'proc', label: 'Annotation processor', detail: 'MapStruct, Dagger', col: 1, row: 0, tone: 'accent' },
          { id: 'javac', label: 'javac', detail: 'compiles in rounds', col: 0, row: 1, tone: 'primary' },
          { id: 'gen', label: 'Generated sources', detail: 'e.g. OrderMapperImpl', col: 1, row: 1, shape: 'note', tone: 'accent' },
          { id: 'classes', label: '.class files', detail: 'CLASS + RUNTIME kept', col: 0, row: 2, shape: 'note' },
          { id: 'fw', label: 'Framework', detail: 'JUnit, Spring, Jackson', col: 2, row: 0, tone: 'primary' },
          { id: 'mh', label: 'MethodHandles', detail: 'checked once, inlinable', col: 3, row: 0, tone: 'success' },
          { id: 'refl', label: 'Reflection API', detail: 'Class, Method, Field', col: 2, row: 1, tone: 'primary' },
          { id: 'jdk', label: 'JDK internals', detail: 'not opened: access denied', col: 3, row: 1, tone: 'danger' },
          { id: 'app', label: 'Your loaded classes', detail: 'RUNTIME annotations', col: 2, row: 2, shape: 'cylinder', tone: 'neutral' },
        ],
        edges: [
          { from: 'src', to: 'javac' },
          { from: 'javac', to: 'proc', label: 'runs' },
          { from: 'proc', to: 'gen', label: 'generates' },
          { from: 'gen', to: 'javac', label: 'next round' },
          { from: 'javac', to: 'classes', label: 'emits' },
          { from: 'classes', to: 'app', label: 'class loading' },
          { from: 'fw', to: 'refl', label: 'scans' },
          { from: 'fw', to: 'mh', label: 'hot paths' },
          { from: 'refl', to: 'app', label: 'reads, invokes' },
          { from: 'refl', to: 'jdk', label: 'blocked (16+)', dashed: true },
        ],
        groups: [
          { label: 'Compile time', fromCol: 0, toCol: 1, fromRow: 0, toRow: 1, tone: 'neutral' },
          { label: 'Run time (JVM)', fromCol: 2, toCol: 3, fromRow: 0, toRow: 2, tone: 'primary' },
        ],
      },
    ],
    variants: [
      {
        title: 'Retention policies',
        intro: 'Set with `@Retention(RetentionPolicy.X)` on the annotation type. Omitting it means CLASS.',
        items: [
          {
            name: 'SOURCE',
            summary: 'Visible to javac and annotation processors only; not written to the class file.',
            support: 'supported',
            note: 'Examples: @Override, @SuppressWarnings, Lombok\'s @Getter.',
          },
          {
            name: 'CLASS (default)',
            summary: 'Written to the class file but not exposed by the reflection API. Useful for bytecode tools, static analysers and some null-checkers.',
            support: 'supported',
            note: 'The classic trap: a custom annotation with no @Retention is invisible to getAnnotation.',
          },
          {
            name: 'RUNTIME',
            summary: 'Written to the class file and returned by getAnnotation and friends. Required for anything a framework reads while the program runs.',
            support: 'supported',
            code: '@Retention(RetentionPolicy.RUNTIME)\n@interface Check { String value() default ""; }',
          },
        ],
      },
      {
        title: 'Annotation targets',
        intro: '`@Target(ElementType...)` limits where an annotation may appear. Without it, it may appear on any declaration (but not on type uses).',
        items: [
          { name: 'TYPE', summary: 'Classes, interfaces (including annotation types), enums and records.', support: 'supported', code: '@Service class OrderService {}' },
          { name: 'METHOD / CONSTRUCTOR', summary: 'Methods and constructors — @Test, @Override, @Autowired on a constructor.', support: 'supported' },
          { name: 'FIELD / PARAMETER / LOCAL_VARIABLE', summary: 'Fields (including enum constants), method parameters and local variables. LOCAL_VARIABLE annotations are never retained in class files.', support: 'supported' },
          { name: 'TYPE_USE / TYPE_PARAMETER', summary: 'Since Java 8 (JSR 308): any use of a type, e.g. `List<@NonNull String>`, and generic type parameters. Basis of checker tools.', support: 'supported', code: 'List<@NonNull String> names;' },
          { name: 'RECORD_COMPONENT', summary: 'Since Java 16: record components. The annotation also propagates to the field, accessor or constructor parameter if its targets allow.', support: 'supported', code: 'record User(@JsonProperty("user_name") String name) {}' },
          { name: 'ANNOTATION_TYPE / PACKAGE / MODULE', summary: 'Meta-annotations, package-info.java and module-info.java declarations.', support: 'supported' },
        ],
      },
      {
        title: 'Built-in annotations in java.lang',
        items: [
          { name: '@Override', summary: 'Compile error if the method does not override or implement a supertype method. Catches typos and signature drift.', support: 'supported' },
          { name: '@Deprecated', summary: 'Marks an API as discouraged. Since Java 9 it has `since` and `forRemoval`; forRemoval = true triggers a stronger removal warning.', support: 'supported', code: '@Deprecated(since = "3.2", forRemoval = true)' },
          { name: '@SuppressWarnings', summary: 'Silences named javac warnings such as "unchecked", "deprecation" or "removal". Put it on the narrowest declaration.', support: 'supported' },
          { name: '@FunctionalInterface', summary: 'Compile error unless the interface has exactly one abstract method. Optional: any such interface is a lambda target.', support: 'supported' },
          { name: '@SafeVarargs', summary: 'Promises a generic varargs method does not pollute the heap, suppressing call-site warnings. Only on constructors and static, final or (Java 9+) private methods.', support: 'partial', note: 'Not allowed on overridable instance methods, because an override could break the promise.' },
        ],
      },
      {
        title: 'Ways to call code dynamically',
        items: [
          { name: 'Core reflection (Method.invoke)', summary: 'Most flexible; access checked per call, arguments boxed into Object[], exceptions wrapped.', support: 'supported' },
          { name: 'MethodHandle', summary: 'Typed handle, access checked when created; inlinable by the JIT when held in a static final field.', support: 'supported', code: 'MethodHandles.lookup().findVirtual(A.class, "m", MethodType.methodType(void.class))' },
          { name: 'LambdaMetafactory', summary: 'Turns a handle into an implementation of a functional interface — how lambdas are linked; used by fast frameworks for getters and setters.', support: 'supported' },
          { name: 'Generated code', summary: 'An annotation processor or build plugin writes ordinary Java; fastest and checked by the compiler.', support: 'supported' },
        ],
      },
      {
        title: 'Kinds of annotations',
        intro: 'The classic textbook classification by how many elements an annotation supplies, plus two special roles.',
        items: [
          { name: 'Marker annotation', summary: 'Has no elements; its presence alone carries the meaning.', support: 'supported', code: '@Override\n@FunctionalInterface' },
          { name: 'Single-element annotation', summary: 'Has one element named `value`, so the name can be left out when the annotation is used.', support: 'supported', code: '@SuppressWarnings("unchecked")' },
          { name: 'Normal (multi-element) annotation', summary: 'Supplies several elements as name = value pairs; elements that declare a default may be omitted.', support: 'supported', code: '@Deprecated(since = "9", forRemoval = true)' },
          { name: 'Repeatable annotation (Java 8)', summary: 'Declared with `@Repeatable(Container.class)` so it may appear several times on one element; the compiler stores the copies inside the container annotation.', support: 'supported', code: '@Schedule(day = "Mon") @Schedule(day = "Fri")\nvoid report() {}' },
          { name: 'Meta-annotation', summary: 'An annotation applied to an annotation interface: `@Retention`, `@Target`, `@Documented`, `@Inherited` and `@Repeatable`.', support: 'supported', code: '@Retention(RetentionPolicy.RUNTIME)\n@Target(ElementType.METHOD)\n@interface Test {}' },
        ],
      },
    ],
    deepDive: [
      {
        title: 'Strong encapsulation: from warnings to errors',
        body: 'The module system (Java 9, JEP 261) let modules hide packages, but kept deep reflection into the JDK working with an "illegal reflective access" warning. JEP 396 (Java 16) denied it by default and JEP 403 (Java 17) removed the `--illegal-access` switch. Exported packages still allow reflection on **public** members; `setAccessible(true)` on non-public members requires the package to be **opened** (`opens` in module-info, `--add-opens`, or `Add-Opens` in an executable JAR manifest). Code on the class path lives in the unnamed module, which opens everything to itself — which is why the lesson\'s own private fields were still accessible.',
        sources: [
          { label: 'JEP 261: Module System', url: 'https://openjdk.org/jeps/261' },
          { label: 'JEP 396: Strongly Encapsulate JDK Internals by Default', url: 'https://openjdk.org/jeps/396' },
          { label: 'JEP 403: Strongly Encapsulate JDK Internals', url: 'https://openjdk.org/jeps/403' },
        ],
      },
      {
        title: 'Reflection is now built on method handles',
        body: 'Before Java 18, `Method.invoke` started with a native accessor and, after about 15 calls ("inflation"), generated a bytecode accessor class. JEP 416 (Java 18) reimplemented `Method`, `Constructor` and `Field` access on top of `java.lang.invoke` method handles, removing that dual implementation. Performance is best when the `Method` or `Field` object is cached in a `static final` field, because the JIT can then treat the underlying handle as a constant and inline the call.',
        sources: [{ label: 'JEP 416: Reimplement Core Reflection with Method Handles', url: 'https://openjdk.org/jeps/416' }],
      },
      {
        title: 'What the JLS says an annotation is',
        body: 'Annotation types are a special kind of interface (JLS §9.6). Their elements may only be primitives, String, Class, enums, annotations or one-dimensional arrays of these, and every value must be a constant expression, a class literal, an enum constant or a nested annotation (§9.7). That restriction is what lets the values be stored in the class file\'s `RuntimeVisibleAnnotations` attribute and rebuilt later. A **repeatable** annotation is stored inside its container annotation, which is why `getAnnotation(Schedule.class)` returns null when there are two of them.',
        sources: [
          { label: 'JLS §9.6: Annotation Interfaces', url: 'https://docs.oracle.com/javase/specs/jls/se21/html/jls-9.html#jls-9.6' },
          { label: 'JLS §9.7: Annotations', url: 'https://docs.oracle.com/javase/specs/jls/se21/html/jls-9.html#jls-9.7' },
          { label: 'JVM Specification §4.7.16: The RuntimeVisibleAnnotations Attribute', url: 'https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-4.html#jvms-4.7.16' },
        ],
      },
      {
        title: 'Costs and risks to weigh before reaching for reflection',
        body: 'Reflection moves errors from compile time to run time (a renamed method becomes a `NoSuchMethodException` in production), defeats IDE refactoring and "find usages", bypasses invariants that constructors and `private` were protecting, and complicates ahead-of-time compilation: GraalVM native images need reflective access declared in configuration. *Effective Java* (Item 65) advises preferring interfaces to reflection: use reflection only to create instances, then call them through an interface or superclass known at compile time.',
        sources: [
          { label: 'Effective Java, 3rd edition — Item 65: Prefer interfaces to reflection (Joshua Bloch)' },
          { label: 'java.lang.reflect package summary (Java 21)', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/reflect/package-summary.html' },
        ],
      },
    ],
  },
};
