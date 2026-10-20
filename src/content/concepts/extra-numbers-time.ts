import type { LessonConcepts } from '@/types/curriculum';

/** Concept pages for the extra "types" lessons on numbers and java.time, keyed by lesson id. */
export const numbersTimeConcepts: Record<string, LessonConcepts> = {
  't-numbers-math': {
    quick: {
      definition: 'Java has number types for whole numbers and decimals. The `Math` class gives you ready-made tools like `max`, `pow` and `sqrt`.',
      points: [
        '`int` holds whole numbers. `double` holds decimals.',
        'Dividing two `int` values drops the decimal part, so `7 / 2` is `3`.',
        '`Math.round` rounds to the nearest whole number. `Math.abs` removes a minus sign.',
        'Decimals like `0.1` cannot be stored exactly in binary, so small errors can appear.',
        'Use `BigDecimal` when you need exact decimals, such as money.',
      ],
      example: {
        title: 'Math helpers',
        code: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println(Math.max(3, 9));\n    System.out.println(Math.pow(2, 10));\n    System.out.println(Math.sqrt(49));\n    System.out.println(Math.round(2.5));\n    System.out.println(Math.abs(-7));\n    System.out.println(7 / 2);\n    System.out.println(0.1 + 0.2);\n  }\n}',
        output: '9\n1024.0\n7.0\n3\n7\n3\n0.30000000000000004',
        runnable: true,
        explain: '`Math.pow` and `Math.sqrt` return a `double`, so you see `.0`. Dividing the `int` values `7 / 2` gives `3`. `Math.round(2.5)` gives `3` because `.5` rounds up. The last line shows the small error that `double` can have.',
      },
      tip: 'Avoid comparing decimals with `==`. Check whether they are close enough instead.',
    },
    textbook: {
      definition:
        'Java\'s **primitive numeric types** consist of the integral types and the floating-point types. The integral types are `byte`, `short`, `int`, `long` and `char`. Their signed arithmetic uses **two\'s-complement** representation and wraps silently on overflow. The floating-point types are `float` and `double`. Their values and operations follow the **IEEE 754** binary formats. The class `java.math.BigDecimal` represents immutable, **arbitrary-precision** (as many digits as needed) signed decimal numbers. It stores an unscaled integer and a scale, and a `RoundingMode` controls rounding. `java.math.BigInteger` represents integers of unbounded size. `java.lang.Math` supplies elementary functions, and exact-arithmetic methods that throw `ArithmeticException` on overflow.',
      terms: [
        { term: 'Two\'s complement', meaning: 'The binary representation of signed integers used by `int` and `long`. Arithmetic is done modulo 2^n, so overflow wraps around without any error.' },
        { term: 'IEEE 754 binary floating point', meaning: 'The standard format that stores a sign, an exponent and a binary significand (53 bits for `double`). So most decimal fractions can only be approximated.' },
        { term: 'Unscaled value and scale', meaning: 'The two parts of a `BigDecimal`: its numeric value equals the unscaled integer multiplied by 10 to the power of minus the scale.' },
        { term: 'Rounding mode', meaning: 'A rule, given by the enum `java.math.RoundingMode`, that decides how a result is rounded when it must be reduced to fewer digits.' },
      ],
      source: 'JLS §4.2; IEEE 754; Javadoc for java.math.BigDecimal and java.lang.Math',
    },
    interviewDefinition:
      '`float` and `double` are IEEE 754 **binary** floating point. They are fast and cover a wide range, but most decimal fractions are only approximated. So `0.1 + 0.2` is `0.30000000000000004`. For exact decimal values such as money, use **`BigDecimal`** built from a `String`. Give it an explicit scale and `RoundingMode`, and compare with `compareTo`. For integers beyond 64 bits, use `BigInteger`. Primitive integer arithmetic wraps silently. So use `Math.addExact`, `multiplyExact` or `toIntExact` when overflow must be an error. Use `Math.floorMod` when a remainder must not be negative.',
    interviewFollowUps: [
      {
        question: 'Why do `new BigDecimal("2.0").equals(new BigDecimal("2.00"))` and `compareTo` disagree?',
        answer: 'A BigDecimal is an unscaled integer plus a scale. `equals` (and `hashCode`) compare both. So 2.0 (20, scale 1) and 2.00 (200, scale 2) differ. `compareTo` compares the numeric value only. That is why a `HashSet` keeps both but a `TreeSet` keeps one.',
      },
      {
        question: 'Why is HALF_EVEN often used for financial rounding?',
        answer: 'HALF_UP always rounds ties (values exactly halfway) away from zero, which pushes totals upward over many values. HALF_EVEN ("banker\'s rounding") sends ties to the even neighbour. So ties round up and down about equally often. Use whichever mode the business or tax rule specifies, but always name it.',
      },
      {
        question: 'Random, ThreadLocalRandom or SecureRandom?',
        answer: '`Random` is a seeded 48-bit LCG (linear congruential generator). It is reproducible and predictable, and threads compete for it when they share it. `ThreadLocalRandom` gives each thread its own generator. It is the default for concurrent code that is not about security. `SecureRandom` is cryptographically strong and the only choice for tokens, keys and passwords. Since Java 17 all of them implement `RandomGenerator`.',
      },
      {
        question: 'Is it ever fine to store money as a primitive?',
        answer: 'Yes, as a `long` count of minor units (cents). It is exact and fast, and many payment APIs use it. You must still handle division and currency exponents explicitly (JPY has 0 decimals, BHD has 3). What is never fine is `double`.',
      },
    ],
    mnemonic: {
      device: '"Doubles drift. String in, Scale set, Round named, Compare out."',
      expansion: [
        { key: 'Doubles drift', meaning: 'binary floating point approximates decimals; errors accumulate, so never use == or double for money' },
        { key: 'String in', meaning: 'build BigDecimal from "19.99" or BigDecimal.valueOf, never new BigDecimal(double)' },
        { key: 'Scale set', meaning: 'decide the number of decimal places with setScale (2 for most currencies)' },
        { key: 'Round named', meaning: 'always pass a RoundingMode; divide without one throws for 1/3' },
        { key: 'Compare out', meaning: 'compareTo(...) == 0 for numeric equality; equals also compares scale' },
      ],
      visual: 'A rowing boat labelled "double" drifts slowly off a dock marked 0.3, while beside it a BigDecimal clerk reads digits from a paper slip ("String in"), stamps "2 places", names the rounding rule out loud, and holds two receipts side by side to compare them.',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'Writing 1/3 in decimal',
        body: 'Try writing 1/3 as a decimal on a receipt with eight boxes: 0.3333333 — you must stop and round. Binary has the same problem with 1/10: it is 0.000110011001100… forever, and a `double` has 53 binary digits of room. The error is tiny, but it is real, and it shows up the moment you test with `==` or print enough digits.',
      },
      {
        kind: 'insight',
        title: 'Overflow is silent by design',
        body: 'The JLS defines `int` and `long` arithmetic as two\'s-complement wrap-around with no error. That makes ordinary arithmetic fast, but it means `Integer.MAX_VALUE + 1` quietly becomes −2,147,483,648. The `Math.*Exact` methods turn that into an `ArithmeticException`, and HotSpot compiles them to the CPU\'s overflow-flag check, so the safety costs almost nothing.',
      },
      {
        kind: 'real-world',
        title: 'Payment APIs count cents',
        body: 'Many payment platforms accept amounts as integers in the smallest currency unit (1999 means 19.99 USD) precisely to avoid floating-point errors in transit. Inside a Java service the same rule holds: map DECIMAL columns to `BigDecimal`, or use `long` minor units, and convert to a display string only at the edge with a locale-aware `NumberFormat`.',
      },
      {
        kind: 'angle',
        title: 'The hash bucket that went negative',
        body: '`Math.abs(key.hashCode()) % n` looks like a safe bucket index — until a key hashes to `Integer.MIN_VALUE`, whose absolute value is still negative. The bug appears once in four billion keys, which means "never in tests, eventually in production". `Math.floorMod(hash, n)` is always in `[0, n)` for positive `n`.',
      },
      {
        kind: 'angle',
        title: 'Formatting depends on where the server lives',
        body: '`String.format("%.2f", 1.5)` prints `1,50` on a JVM whose default locale is German. CSV exports, log parsers and JSON built by hand have broken this way. Use `Locale.ROOT` for machine-readable output and the user\'s locale only for text a human will read.',
      },
    ],
    diagrams: [
      {
        id: 't-numbers-math-binary',
        kind: 'concept',
        title: 'Why 0.1 is not exact in a double',
        caption: 'The double path rounds an infinite binary fraction to 53 bits. So the stored value is only close to 0.1. The BigDecimal path stores the decimal digits themselves: unscaled value 1 with scale 1.',
        explanation: [
          'The top row is the **double (binary)** path. **Literal 0.1** is written in decimal in your source code, but the compiler must convert it to binary.',
          'In binary, one tenth is **0.000110011…**, a pattern that repeats forever. So it cannot be stored exactly in any fixed number of bits.',
          '**Round to 53 bits** cuts the infinite fraction to the precision of an IEEE 754 double. The stored value becomes **0.1000000000000000055…**. This is very close to 0.1, but not equal to it.',
          'The bottom row is the **BigDecimal (decimal)** path. **"0.1" as String** gives the decimal digits directly. **BigDecimal parse** reads them with no binary conversion at all.',
          'The result is stored as **unscaled 1, scale 1**. This means 1 times 10 to the power minus 1, which is **Exactly 0.1**. Takeaway: build BigDecimal from a String whenever decimals must add up exactly.',
        ],
        cols: 4,
        rows: 2,
        nodes: [
          { id: 'd-lit', label: 'Literal 0.1', detail: 'decimal in source', col: 0, row: 0, shape: 'note' },
          { id: 'd-bin', label: '0.000110011…', detail: 'binary repeats forever', col: 1, row: 0, tone: 'warning' },
          { id: 'd-round', label: 'Round to 53 bits', detail: 'IEEE 754 double', col: 2, row: 0, tone: 'primary' },
          { id: 'd-val', label: '0.1000000000000000055…', detail: 'close, not equal', col: 3, row: 0, shape: 'pill', tone: 'danger' },
          { id: 'b-lit', label: '"0.1" as String', detail: 'decimal digits', col: 0, row: 1, shape: 'note' },
          { id: 'b-parse', label: 'BigDecimal parse', detail: 'no binary step', col: 1, row: 1, tone: 'primary' },
          { id: 'b-repr', label: 'unscaled 1, scale 1', detail: 'value = 1 × 10^-1', col: 2, row: 1, tone: 'accent' },
          { id: 'b-val', label: 'Exactly 0.1', detail: 'sums add up', col: 3, row: 1, shape: 'pill', tone: 'success' },
        ],
        edges: [
          { from: 'd-lit', to: 'd-bin', label: 'convert' },
          { from: 'd-bin', to: 'd-round', label: 'cut off' },
          { from: 'd-round', to: 'd-val' },
          { from: 'b-lit', to: 'b-parse' },
          { from: 'b-parse', to: 'b-repr' },
          { from: 'b-repr', to: 'b-val' },
        ],
        groups: [
          { label: 'double (binary)', fromCol: 0, toCol: 3, fromRow: 0, toRow: 0, tone: 'warning' },
          { label: 'BigDecimal (decimal)', fromCol: 0, toCol: 3, fromRow: 1, toRow: 1, tone: 'success' },
        ],
      },
      {
        id: 't-numbers-math-choose',
        kind: 'flow',
        title: 'Choosing a numeric type',
        caption: 'Start from what the number means. A need for exactness pushes you to BigDecimal or BigInteger. Range pushes you from int to long to BigInteger. Only measurements belong in double.',
        explanation: [
          'Start at **What is the number?** Decide what it means before you think about speed. Is it a **Whole count**, or does it fall under **Has fractions**?',
          'For whole counts, begin with **int**, which holds about plus or minus 2.1 billion. If the value may exceed 2^31, move to **long**. It reaches about 9.2 times 10^18.',
          'If even long may overflow, as with large factorials or cryptography, use **BigInteger**, which has no fixed size limit.',
          'For values with fractions that must be exact, such as prices and tax, the must be exact arrow leads to **BigDecimal**.',
          'Choose **double** only when a tiny rounding error is acceptable, as the dashed arrow says. It suits measurements and science. Takeaway: meaning and range decide the type.',
        ],
        cols: 4,
        rows: 3,
        nodes: [
          { id: 'q', label: 'What is the number?', col: 0, row: 1, tone: 'neutral', shape: 'pill' },
          { id: 'whole', label: 'Whole count', detail: 'ids, sizes, counters', col: 1, row: 0, tone: 'primary' },
          { id: 'frac', label: 'Has fractions', detail: 'prices, measurements', col: 1, row: 2, tone: 'primary' },
          { id: 'int', label: 'int', detail: 'fits in ±2.1 billion', col: 2, row: 0, tone: 'success' },
          { id: 'long', label: 'long', detail: 'up to ±9.2 × 10^18', col: 3, row: 0, tone: 'success' },
          { id: 'bigint', label: 'BigInteger', detail: 'unbounded: crypto, 25!', col: 3, row: 1, tone: 'accent' },
          { id: 'bigdec', label: 'BigDecimal', detail: 'exact decimals: money', col: 2, row: 2, tone: 'accent' },
          { id: 'double', label: 'double', detail: 'measurements, science', col: 3, row: 2, tone: 'warning' },
        ],
        edges: [
          { from: 'q', to: 'whole' },
          { from: 'q', to: 'frac' },
          { from: 'whole', to: 'int', label: 'small range' },
          { from: 'int', to: 'long', label: 'may exceed 2^31' },
          { from: 'long', to: 'bigint', label: 'may exceed 2^63' },
          { from: 'frac', to: 'bigdec', label: 'must be exact' },
          { from: 'bigdec', to: 'double', label: 'tiny error is OK', dashed: true },
        ],
      },
      {
        id: 't-numbers-math-random',
        kind: 'architecture',
        title: 'The RandomGenerator family (Java 17)',
        caption: 'JEP 356 put one interface above every generator. So code can depend on RandomGenerator and choose the algorithm at the edge. Security still requires SecureRandom.',
        explanation: [
          'At the top is **RandomGenerator**, the common interface added in Java 17 by JEP 356. Code can depend on it and choose the actual algorithm elsewhere.',
          'Every box in the **Implementations** row points up to it. **Random** is the classic seedable 48-bit generator. It is reproducible, but predictable, and threads compete for it when they share it.',
          '**ThreadLocalRandom** gives each thread its own generator, so threads do not compete for one. It is the default choice for concurrent code that is not security related.',
          '**SecureRandom** is cryptographically strong and unpredictable. It is the only correct choice for tokens, salts, passwords and keys.',
          '**LXM / Splittable** generators, obtained with `RandomGenerator.of(name)`, are fast and statistically strong. They can split into independent streams for parallel work. Takeaway: pick by need, and use SecureRandom for security.',
        ],
        cols: 4,
        rows: 2,
        nodes: [
          { id: 'rg', label: 'RandomGenerator', detail: 'nextInt(origin, bound), …', col: 1, row: 0, span: 2, tone: 'primary' },
          { id: 'random', label: 'Random', detail: '48-bit LCG, seedable', col: 0, row: 1, tone: 'neutral' },
          { id: 'tlr', label: 'ThreadLocalRandom', detail: 'per thread, no contention', col: 1, row: 1, tone: 'success' },
          { id: 'secure', label: 'SecureRandom', detail: 'unpredictable: tokens', col: 2, row: 1, tone: 'danger' },
          { id: 'lxm', label: 'LXM / Splittable', detail: 'RandomGenerator.of(name)', col: 3, row: 1, tone: 'accent' },
        ],
        edges: [
          { from: 'random', to: 'rg', label: 'implements' },
          { from: 'tlr', to: 'rg' },
          { from: 'secure', to: 'rg' },
          { from: 'lxm', to: 'rg', label: 'implements' },
        ],
        groups: [{ label: 'Implementations', fromCol: 0, toCol: 3, fromRow: 1, toRow: 1, tone: 'neutral' }],
      },
    ],
    variants: [
      {
        title: 'Numeric types by use case',
        intro: 'Pick by meaning and range first, performance second.',
        items: [
          { name: 'int', summary: '32-bit signed whole numbers: loop counters, indexes, small quantities.', support: 'supported', note: 'Wraps silently past 2,147,483,647.', code: 'int qty = Math.addExact(a, b);' },
          { name: 'long', summary: '64-bit signed: epoch milliseconds, file sizes, database ids, money in cents.', support: 'supported', code: 'long cents = 1999L * 3;' },
          { name: 'double', summary: '64-bit IEEE 754: measurements, statistics, geometry, ML features.', support: 'supported', note: 'Compare with a tolerance; never for money.', code: 'Math.abs(a - b) < 1e-9' },
          { name: 'float', summary: '32-bit IEEE 754 with about 7 significant digits: large arrays of graphics or sensor data where memory matters.', support: 'supported', note: 'Rarely the right default; prefer double.' },
          { name: 'BigDecimal', summary: 'Arbitrary-precision decimal: money, tax, exchange rates, anything that must add up exactly.', support: 'supported', note: 'Immutable; slower and allocates.', code: 'new BigDecimal("19.99").setScale(2, RoundingMode.HALF_EVEN)' },
          { name: 'BigInteger', summary: 'Arbitrary-size integers: cryptography, combinatorics, ids wider than 64 bits.', support: 'supported', code: 'BigInteger.TWO.pow(100)' },
        ],
      },
      {
        title: 'Rounding modes (java.math.RoundingMode)',
        intro: 'Results shown for 2.5 and −2.5 rounded to 0 decimal places.',
        items: [
          { name: 'UP', summary: 'Away from zero: 3 and −3.', support: 'supported' },
          { name: 'DOWN', summary: 'Toward zero (truncate): 2 and −2.', support: 'supported', note: 'What an (int) cast does.' },
          { name: 'CEILING', summary: 'Toward positive infinity: 3 and −2.', support: 'supported' },
          { name: 'FLOOR', summary: 'Toward negative infinity: 2 and −3.', support: 'supported', note: 'Matches Math.floorDiv.' },
          { name: 'HALF_UP', summary: 'Nearest; ties away from zero: 3 and −3.', support: 'supported', note: 'The rule taught at school.' },
          { name: 'HALF_DOWN', summary: 'Nearest; ties toward zero: 2 and −2.', support: 'supported' },
          { name: 'HALF_EVEN', summary: 'Nearest; ties to the even neighbour: 2 and −2 (but 3.5 → 4).', support: 'supported', note: 'Banker\'s rounding; avoids cumulative bias. Default for Math.rint and IEEE 754 arithmetic.' },
          { name: 'UNNECESSARY', summary: 'Asserts no rounding is needed; throws ArithmeticException for 2.5.', support: 'supported', note: 'Useful to catch unexpected precision loss.' },
        ],
      },
      {
        title: 'Random number generators',
        items: [
          { name: 'Random', summary: 'Seedable linear congruential generator; reproducible sequences.', support: 'supported', note: 'Thread-safe but contended; predictable.', code: 'new Random(42).nextInt(100)' },
          { name: 'ThreadLocalRandom', summary: 'One generator per thread; the default in concurrent code.', support: 'supported', note: 'Cannot be seeded.', code: 'ThreadLocalRandom.current().nextInt(1, 7)' },
          { name: 'SecureRandom', summary: 'Cryptographically strong; backed by the OS entropy source.', support: 'supported', note: 'Use for tokens, salts, keys.' },
          { name: 'SplittableRandom / LXM', summary: 'Fast, statistically strong generators that split into independent streams for parallel work.', support: 'supported', note: 'LXM family added in Java 17 (JEP 356).', code: 'RandomGenerator.of("L64X128MixRandom")' },
        ],
      },
    ],
    deepDive: [
      {
        title: 'Strict floating point is back — and StrictMath still exists',
        body: 'Before Java 17, the JVM was allowed to use extended exponent ranges for intermediate results unless a method was `strictfp`, which on old x87 hardware could change results. JEP 306 made all floating-point operations strict again, so `strictfp` is now redundant and `javac` warns about it. Separately, `Math` methods such as `sin` and `pow` may be replaced by faster CPU intrinsics within the documented error (often 1 ulp), whereas `StrictMath` uses the fdlibm algorithms to give bit-identical results on every platform — matters for reproducible simulations and cross-platform tests.',
        sources: [
          { label: 'JEP 306: Restore Always-Strict Floating-Point Semantics', url: 'https://openjdk.org/jeps/306' },
          { label: 'JLS §4.2.3: Floating-Point Types, Formats, and Values', url: 'https://docs.oracle.com/javase/specs/jls/se21/html/jls-4.html#jls-4.2.3' },
          { label: 'java.lang.StrictMath API', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/StrictMath.html' },
        ],
      },
      {
        title: 'Inside BigDecimal: unscaled value, scale and cost',
        body: 'A `BigDecimal` is `unscaledValue × 10^-scale`. Small values are kept in a compact `long` field; larger ones in a `BigInteger`. Because scale is part of identity, `equals`/`hashCode` treat 1.1 and 1.10 as different, while `compareTo` does not — the class documentation explicitly calls its natural ordering "inconsistent with equals". Every operation allocates a new immutable object, so hot paths that process millions of amounts sometimes switch to `long` minor units; *Effective Java* (Item 60, "Avoid float and double if exact answers are required") recommends exactly that trade-off: BigDecimal for convenience and rounding control, int/long for speed.',
        sources: [
          { label: 'java.math.BigDecimal API', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/math/BigDecimal.html' },
          { label: 'Effective Java, 3rd edition — Item 60 (Joshua Bloch)' },
        ],
      },
      {
        title: 'Integer overflow is defined, not undefined',
        body: 'Unlike signed overflow in C, Java integer overflow is fully specified: the JLS says the result is the low-order bits of the mathematically exact result in two\'s complement, and "the sign of the result may not be the same as the sign of the mathematical sum". So the compiler cannot optimise it away, and code like `mid = (lo + hi) >>> 1` is a well-known, legal fix for the binary-search overflow bug. When overflow must be an error, the `Math.*Exact` methods (Java 8) are intrinsified by HotSpot to use the processor\'s overflow flag.',
        sources: [
          { label: 'JLS §15.18.2: Additive Operators for Numeric Types', url: 'https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.18.2' },
          { label: 'java.lang.Math API', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Math.html' },
        ],
      },
      {
        title: 'Why Java 17 redesigned random numbers',
        body: 'Before Java 17, `Random`, `ThreadLocalRandom`, `SplittableRandom` and `SecureRandom` had overlapping but unrelated APIs, and `Random`\'s 48-bit LCG has known statistical weaknesses. JEP 356 introduced the `RandomGenerator` interface hierarchy (including `SplittableGenerator` and `JumpableGenerator`), the `RandomGeneratorFactory` for choosing algorithms by name, and the LXM family, which combines an LCG with an xorshift-style generator for better quality. Existing classes were retrofitted to implement the interface, so old code keeps working.',
        sources: [
          { label: 'JEP 356: Enhanced Pseudo-Random Number Generators', url: 'https://openjdk.org/jeps/356' },
          { label: 'java.util.random package summary', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/random/package-summary.html' },
        ],
      },
    ],
  },

  't-date-time': {
    quick: {
      definition: 'The `java.time` package lets you work with dates and times. For example, `LocalDate` stores a date, and these objects never change once created.',
      points: [
        '`LocalDate.of(2025, 1, 30)` makes a date. The month is 1 to 12.',
        'Methods like `plusDays()` return a new date. The old one stays the same.',
        'Use `ChronoUnit.DAYS.between(a, b)` to count days between two dates.',
        'Use `LocalDateTime` for date plus time. Use `ZonedDateTime` when the time zone matters.',
        'Avoid the old `Date` and `Calendar` classes in new code.',
      ],
      example: {
        title: 'Dates with LocalDate',
        code: 'import java.time.LocalDate;\nimport java.time.temporal.ChronoUnit;\n\npublic class Main {\n  public static void main(String[] args) {\n    LocalDate start = LocalDate.of(2025, 1, 30);\n    LocalDate later = start.plusDays(10);\n    System.out.println(start);\n    System.out.println(later);\n    System.out.println(later.getDayOfWeek());\n    System.out.println(ChronoUnit.DAYS.between(start, later));\n    System.out.println(later.isAfter(start));\n  }\n}',
        output: '2025-01-30\n2025-02-09\nSUNDAY\n10\ntrue',
        runnable: true,
        explain: '`plusDays(10)` gives a new date, and `start` is not changed. Java handles the end of January for you. `ChronoUnit.DAYS.between` counts the days between the two dates.',
      },
      tip: 'A `LocalDate` has no time zone. Use `ZonedDateTime` or `Instant` for exact moments in time.',
    },
    textbook: {
      definition:
        'The **java.time** API is the standard Java library for dates, times, instants and durations. It is specified by JSR 310, was introduced in Java 8, and is based on the ISO-8601 calendar system. Its main classes are **immutable** and thread-safe. It separates **machine time** from **human time**. Machine time is a position on the time-line, represented by `Instant`. Human time is represented by local date-time types, which carry no time zone. It is also represented by `ZonedDateTime` and `OffsetDateTime`, which bind a local date-time to a **time zone** or an **offset** from UTC. `Duration` and `Period` model amounts of time.',
      terms: [
        { term: 'Instant', meaning: 'A single point on the time-line. It is measured in seconds and nanoseconds from the epoch 1970-01-01T00:00:00Z.' },
        { term: 'Local date-time', meaning: 'A date, time or date-time without any time zone or offset, such as `LocalDate`. It describes a calendar or wall-clock reading, not a moment.' },
        { term: 'ZoneOffset and ZoneId', meaning: 'A `ZoneOffset` is a fixed difference from UTC, such as +02:00. A region `ZoneId` names rules that decide the offset at each instant, including daylight saving time.' },
        { term: 'Duration and Period', meaning: 'A `Duration` is an exact amount of time in seconds and nanoseconds. A `Period` is a date-based amount in years, months and days.' },
      ],
      source: 'JSR 310; Javadoc for the java.time package; ISO 8601',
    },
    interviewDefinition:
      '`java.time` (JSR 310, Java 8) is an immutable, thread-safe date-time API. It separates **machine time** from **human time**. `Instant` is a point on the UTC timeline. `LocalDate`, `LocalTime` and `LocalDateTime` are calendar and wall-clock values with no zone. `ZonedDateTime` adds a region `ZoneId` with its daylight-saving rules. `OffsetDateTime` adds a fixed offset. `Duration` measures exact time, and `Period` measures calendar amounts. Store instants in UTC and convert to a zone only for display. Inject a `Clock` so code is testable.',
    interviewFollowUps: [
      {
        question: 'What was wrong with java.util.Date and Calendar?',
        answer: 'Both are mutable, so a Date passed to another object can be changed under you. Date counts years from 1900 and months from 0. Its `toString` silently applies the default time zone. One class mixes "moment" and "calendar reading". And `SimpleDateFormat` is not thread-safe. java.time fixes all of these with separate immutable types.',
      },
      {
        question: 'LocalDateTime or Instant for a database timestamp?',
        answer: 'For a moment (created-at, paid-at), store an `Instant` / UTC `TIMESTAMP`. Or store an `OffsetDateTime` in a `TIMESTAMP WITH TIME ZONE` column. `LocalDateTime` is only right for values that truly have no zone. An example is a future "10:00 local" appointment, stored together with its `ZoneId`.',
      },
      {
        question: 'What happens when you create a ZonedDateTime inside a DST gap or overlap?',
        answer: 'In a gap, the local time does not exist. So it is shifted later by the length of the gap (02:30 → 03:30). In an overlap, the earlier offset is kept by default. `withLaterOffsetAtOverlap()` and `withEarlierOffsetAtOverlap()` choose explicitly. `ZoneRules.getValidOffsets` tells you how many offsets are valid (0, 1 or 2).',
      },
      {
        question: 'Duration.ofDays(1) vs Period.ofDays(1)?',
        answer: 'Duration.ofDays(1) is exactly 86,400 seconds. Period.ofDays(1) is one calendar day. Add each to a ZonedDateTime on a DST change day. The Period keeps the same wall-clock time, while the Duration lands one hour off.',
      },
    ],
    mnemonic: {
      device: '"Store the Instant, show the Zone — Durations tick, Periods flip pages."',
      expansion: [
        { key: 'Store the Instant', meaning: 'persist and transmit moments as UTC Instants (or offset timestamps)' },
        { key: 'Show the Zone', meaning: 'convert to a ZonedDateTime in the viewer\'s ZoneId only for display' },
        { key: 'Durations tick', meaning: 'Duration counts exact seconds on a stopwatch, ignoring calendars and DST' },
        { key: 'Periods flip pages', meaning: 'Period counts calendar pages (days, months, years) and keeps wall-clock time' },
      ],
      visual: 'A vault labelled UTC holds a single glowing timestamp; a display window shows the same timestamp through three coloured panes (New York, Kolkata, Tokyo). On the counter, a stopwatch ticks next to a desk calendar whose pages flip.',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'A party invitation without a city',
        body: 'An invitation saying "Saturday 20:00" is a `LocalDateTime`: perfectly clear to people in one town, meaningless to a guest flying in from another continent. Add "Lisbon" and it becomes a `ZonedDateTime`. The exact moment the party starts, which a satellite could timestamp, is the `Instant` — the same for everyone, whichever clock they read it from.',
      },
      {
        kind: 'insight',
        title: 'Immutability turns a whole bug class into a compile-time habit',
        body: 'With `Date`, passing a date into a constructor and changing it later silently changed the object\'s state; defensive copies were mandatory. java.time values are immutable value-based classes, so they can be shared, cached, used as map keys and passed across threads freely. The cost is one new habit: always use the return value (`d = d.plusDays(1)`).',
      },
      {
        kind: 'real-world',
        title: 'The music player that froze on New Year\'s Eve',
        body: 'On 31 December 2008, many Microsoft Zune 30 GB players froze for a day: a hand-written loop converting "days since 1980" to a year never terminated on day 366 of a leap year. Hand-rolled calendar arithmetic is a classic source of such bugs; java.time encodes leap years, month lengths and DST so application code does not have to.',
      },
      {
        kind: 'angle',
        title: 'Time zone rules are politics, not physics',
        body: 'Countries change their DST rules and offsets, sometimes with weeks of notice. The JDK ships a copy of the IANA tz database and updates it in regular releases. That is why a future appointment should be stored as local date-time + `ZoneId` (rules applied when needed), while a past event is safely stored as an `Instant`.',
      },
      {
        kind: 'angle',
        title: 'Time is a dependency — inject it',
        body: 'Code that calls `now()` has a hidden input that changes every run. Treating `Clock` like any other dependency lets tests pin "now" to a DST change, a leap day or 23:59:59 on New Year\'s Eve with `Clock.fixed`, and lets you advance time instantly with `Clock.offset` instead of sleeping.',
      },
    ],
    diagrams: [
      {
        id: 't-date-time-one-instant',
        kind: 'concept',
        title: 'One instant, many wall clocks',
        caption: 'The stored Instant never changes. atZone only chooses how to display it. Notice that the local times and even the offsets differ, yet all three boxes are the same moment.',
        explanation: [
          'At the top, the stored **Instant** is 2024-06-01T12:00:00Z. It is one single moment on the UTC timeline, the same for everyone on Earth.',
          'The three atZone arrows create the **ZonedDateTime views (display)**. **New York** shows 08:00 at -04:00, **UTC** shows 12:00, and **Kolkata** shows 17:30 at +05:30. The wall-clock readings differ, but the moment is identical.',
          'The dashed arrow from New York calls toLocalDateTime() and produces **LocalDateTime 08:00**. The zone has been dropped. So nobody can tell which moment that 08:00 refers to.',
          'At the bottom right, **OffsetDateTime** 14:00 at +02:00 is joined to Kolkata by a two-way dashed same instant arrow. The clock shows different text, but it is the same moment.',
          'Takeaway: store and compare Instants, and choose a zone only when you display a time to a person.',
        ],
        cols: 3,
        rows: 3,
        nodes: [
          { id: 'inst', label: 'Instant', detail: '2024-06-01T12:00:00Z', col: 1, row: 0, shape: 'cylinder', tone: 'primary' },
          { id: 'ny', label: 'New York', detail: '08:00 −04:00 (EDT)', col: 0, row: 1, tone: 'accent' },
          { id: 'utc', label: 'UTC', detail: '12:00 +00:00', col: 1, row: 1, tone: 'accent' },
          { id: 'kol', label: 'Kolkata', detail: '17:30 +05:30 (IST)', col: 2, row: 1, tone: 'accent' },
          { id: 'ldt', label: 'LocalDateTime 08:00', detail: 'zone dropped: ambiguous', col: 0, row: 2, shape: 'pill', tone: 'danger' },
          { id: 'odt', label: 'OffsetDateTime', detail: '2024-06-01T14:00+02:00', col: 2, row: 2, shape: 'pill', tone: 'success' },
        ],
        edges: [
          { from: 'inst', to: 'ny', label: 'atZone(NY)' },
          { from: 'inst', to: 'utc', label: 'atZone(UTC)' },
          { from: 'inst', to: 'kol', label: 'atZone(Kolkata)' },
          { from: 'ny', to: 'ldt', label: 'toLocalDateTime()', dashed: true },
          { from: 'odt', to: 'kol', label: 'same instant', dashed: true, both: true },
        ],
        groups: [{ label: 'ZonedDateTime views (display)', fromCol: 0, toCol: 2, fromRow: 1, toRow: 1, tone: 'accent' }],
      },
      {
        id: 't-date-time-types',
        kind: 'architecture',
        title: 'The java.time type map',
        caption: 'Human-time types become a moment only when combined with a zone or offset. Conversions go through ZonedDateTime/OffsetDateTime to Instant. Duration and Period are amounts you add to them.',
        explanation: [
          'The **Human time** group at the top left holds **LocalDate**, a calendar date, and **LocalTime**, a wall-clock time. `atTime` combines a date and a time into a **LocalDateTime**. It still has no zone.',
          'Calling atZone(zone) turns a LocalDateTime into a **ZonedDateTime**. This knows its region and its daylight saving rules. Only now does the value identify a real moment.',
          'A ZonedDateTime converts to and from an **Instant** with toInstant(). The Instant is the form to store. An **OffsetDateTime** carries a fixed offset instead of a region. It converts to an Instant the same way.',
          'In the **Amounts and time source** group, **Period** is added to local values using calendar rules. **Duration** adds exact seconds. The dashed arrows show that these are amounts, not points in time.',
          '**Clock** supplies the current Instant through `Instant.now(clock)`. So injecting a Clock lets tests fix "now". Takeaway: human-time types need a zone or offset before they become a moment.',
        ],
        cols: 4,
        rows: 3,
        nodes: [
          { id: 'ld', label: 'LocalDate', detail: '2024-07-04', col: 0, row: 0, tone: 'neutral' },
          { id: 'lt', label: 'LocalTime', detail: '14:05', col: 1, row: 0, tone: 'neutral' },
          { id: 'ldt', label: 'LocalDateTime', detail: 'date + time, no zone', col: 0, row: 1, span: 2, tone: 'neutral' },
          { id: 'zdt', label: 'ZonedDateTime', detail: '+ ZoneId, DST-aware', col: 2, row: 1, tone: 'accent' },
          { id: 'odt', label: 'OffsetDateTime', detail: '+ fixed offset', col: 2, row: 0, tone: 'accent' },
          { id: 'inst', label: 'Instant', detail: 'UTC timeline (storage)', col: 3, row: 1, shape: 'cylinder', tone: 'primary' },
          { id: 'per', label: 'Period', detail: 'years, months, days', col: 0, row: 2, shape: 'pill', tone: 'success' },
          { id: 'dur', label: 'Duration', detail: 'seconds + nanos', col: 2, row: 2, shape: 'pill', tone: 'success' },
          { id: 'clock', label: 'Clock', detail: 'source of "now"', col: 3, row: 2, tone: 'warning' },
        ],
        edges: [
          { from: 'ld', to: 'ldt', label: 'atTime' },
          { from: 'ldt', to: 'zdt', label: 'atZone(zone)' },
          { from: 'zdt', to: 'inst', label: 'toInstant()', both: true },
          { from: 'odt', to: 'inst', label: 'toInstant()' },
          { from: 'per', to: 'ldt', label: 'plus (calendar)', dashed: true },
          { from: 'dur', to: 'zdt', label: 'plus (exact)', dashed: true },
          { from: 'clock', to: 'inst', label: 'Instant.now(clock)' },
        ],
        groups: [
          { label: 'Human time', fromCol: 0, toCol: 1, fromRow: 0, toRow: 1, tone: 'neutral' },
          { label: 'Amounts and time source', fromCol: 0, toCol: 3, fromRow: 2, toRow: 2, tone: 'success' },
        ],
      },
      {
        id: 't-date-time-dst',
        kind: 'flow',
        title: 'How ZonedDateTime resolves a local time',
        caption: 'The zone rules count how many offsets are valid for the local date-time. One is the normal case. Zero is a spring-forward gap. Two is an autumn overlap.',
        explanation: [
          'The input is a **LocalDateTime + ZoneId**, for example 02:30 in America/New_York. `ZonedDateTime.of` must work out which UTC offset applies to it.',
          'It asks the zone **ZoneRules** how many offsets are valid for that local date-time. On a normal day the answer is **1 offset**, and that offset is used.',
          'On the spring forward day the clocks skip an hour, giving **0 offsets: gap**. The local time does not exist. So java.time shifts it later by the length of the gap, to 03:30.',
          'On the fall back day an hour repeats, giving **2 offsets: overlap**. By default the earlier offset is kept. The optional dashed arrow shows **withLaterOffsetAtOverlap()** choosing the second occurrence instead.',
          'Takeaway: on daylight saving change days, a local time can be missing or ambiguous. java.time always resolves it by documented rules.',
        ],
        cols: 4,
        rows: 3,
        nodes: [
          { id: 'in', label: 'LocalDateTime + ZoneId', detail: 'e.g. 02:30, America/New_York', col: 0, row: 1, span: 2, shape: 'note' },
          { id: 'rules', label: 'ZoneRules', detail: 'getValidOffsets()', col: 2, row: 1, tone: 'primary' },
          { id: 'one', label: '1 offset', detail: 'normal day: use it', col: 3, row: 0, tone: 'success' },
          { id: 'gap', label: '0 offsets: gap', detail: 'shift later by gap: 03:30', col: 3, row: 1, tone: 'warning' },
          { id: 'overlap', label: '2 offsets: overlap', detail: 'earlier offset chosen', col: 3, row: 2, tone: 'warning' },
          { id: 'later', label: 'withLaterOffsetAtOverlap()', detail: 'pick the second 01:30', col: 1, row: 2, span: 2, shape: 'pill', tone: 'accent' },
        ],
        edges: [
          { from: 'in', to: 'rules', label: 'ZonedDateTime.of' },
          { from: 'rules', to: 'one' },
          { from: 'rules', to: 'gap', label: 'spring forward' },
          { from: 'rules', to: 'overlap', label: 'fall back' },
          { from: 'overlap', to: 'later', label: 'optional', dashed: true },
        ],
      },
    ],
    variants: [
      {
        title: 'The temporal types and when to use each',
        intro: 'All are immutable and thread-safe; all `toString` in ISO-8601.',
        items: [
          { name: 'Instant', summary: 'A point on the UTC timeline. Timestamps, logs, event ordering, storage.', support: 'supported', code: 'Instant.parse("2024-06-01T12:00:00Z")' },
          { name: 'LocalDate', summary: 'A calendar date with no time or zone. Birthdays, due dates, holidays, billing dates.', support: 'supported', code: 'LocalDate.of(2024, 2, 29)' },
          { name: 'LocalTime', summary: 'A wall-clock time with no date or zone. Opening hours, "daily at 09:00".', support: 'supported', code: 'LocalTime.of(9, 0)' },
          { name: 'LocalDateTime', summary: 'Date + time, no zone. Building block, or a future local event stored with its ZoneId.', support: 'supported', note: 'Not a moment on its own — avoid for timestamps.' },
          { name: 'ZonedDateTime', summary: 'Date-time + region ZoneId with DST rules. Display, scheduling in a place, calendar arithmetic across DST.', support: 'supported', code: 'ZonedDateTime.of(ldt, ZoneId.of("Europe/Paris"))' },
          { name: 'OffsetDateTime', summary: 'Date-time + fixed offset. API payloads (RFC 3339), SQL TIMESTAMP WITH TIME ZONE.', support: 'supported', note: 'Does not know DST rules.' },
          { name: 'Duration', summary: 'Exact elapsed time in seconds and nanoseconds. Timeouts, SLAs, measured latency.', support: 'supported', code: 'Duration.ofMinutes(90)' },
          { name: 'Period', summary: 'Calendar amount in years, months and days. Ages, subscriptions, "same time next month".', support: 'supported', code: 'Period.between(birth, today)' },
          { name: 'Year / YearMonth / MonthDay', summary: 'Partial dates: fiscal years, card expiry months, recurring anniversaries.', support: 'supported', code: 'YearMonth.of(2027, 8)' },
        ],
      },
      {
        title: 'Legacy classes and their replacements',
        intro: 'Still found in old APIs; convert at the boundary.',
        items: [
          { name: 'java.util.Date', summary: 'A mutable millisecond instant whose toString uses the default zone.', support: 'partial', note: 'Replace with Instant; bridge with Date.from / toInstant.' },
          { name: 'java.util.Calendar / GregorianCalendar', summary: 'Mutable calendar arithmetic with 0-based months.', support: 'partial', note: 'Replace with ZonedDateTime; bridge with GregorianCalendar.from(zdt).' },
          { name: 'java.text.SimpleDateFormat', summary: 'Pattern formatter with mutable state; not thread-safe.', support: 'partial', note: 'Replace with DateTimeFormatter.' },
          { name: 'java.sql.Date / Timestamp', summary: 'JDBC wrappers around Date.', support: 'partial', note: 'With JDBC 4.2 drivers use setObject/getObject with LocalDate, LocalDateTime or OffsetDateTime.' },
        ],
      },
    ],
    deepDive: [
      {
        title: 'From Joda-Time to JSR 310',
        body: 'java.time was specified by JSR 310, led by Stephen Colebourne (author of Joda-Time) with Oracle, and shipped in Java 8. It deliberately did not copy Joda-Time: it separates human and machine time more strictly, uses factory methods instead of public constructors, and makes every type an immutable value-based class (so identity-sensitive operations such as `==` or synchronising on them are discouraged). The ThreeTen-Backport project brought the same API to Java 6 and 7.',
        sources: [
          { label: 'JSR 310: Date and Time API', url: 'https://jcp.org/en/jsr/detail?id=310' },
          { label: 'java.time package summary', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/time/package-summary.html' },
        ],
      },
      {
        title: 'Gaps, overlaps and the resolution rules',
        body: 'The javadoc of `ZonedDateTime` specifies resolution precisely: in a gap the local date-time is adjusted later by the length of the gap; in an overlap the previous offset is retained if valid, otherwise the earlier one is used. `ZonedDateTime.ofStrict` instead throws when the local time is invalid for the zone, which is useful for validating user input. Arithmetic follows the same split: `plusDays`/`plus(Period)` operate on the local time-line, while `plusHours`/`plus(Duration)` operate on the instant time-line.',
        sources: [{ label: 'java.time.ZonedDateTime API', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/time/ZonedDateTime.html' }],
      },
      {
        title: 'Leap seconds and the Java time-scale',
        body: 'UTC occasionally inserts leap seconds, but `Instant` uses the "Java Time-Scale": every day has exactly 86,400 seconds, and near a leap second the extra second is smeared over the surrounding time, as the `Instant` javadoc describes. This keeps arithmetic simple — `Duration.ofDays(1)` is always 86,400 seconds — at the cost of not representing 23:59:60. Systems that need true leap-second accuracy (some scientific and financial-regulation contexts) need specialised libraries.',
        sources: [{ label: 'java.time.Instant API (Time-scale section)', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/time/Instant.html' }],
      },
      {
        title: 'Zone data travels with the JDK',
        body: 'The JDK includes its own copy of the IANA time zone database rather than reading the operating system\'s, so two JVMs on the same host can disagree if their JDK builds carry different tz versions. Keep JDKs patched, or use Oracle\'s TZUpdater tool when a government changes rules at short notice. For containers, remember that the container\'s own OS zone files do not affect `ZoneId` rules — only the JDK\'s data does.',
        sources: [
          { label: 'IANA Time Zone Database', url: 'https://www.iana.org/time-zones' },
          { label: 'java.time.zone.ZoneRulesProvider API', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/time/zone/ZoneRulesProvider.html' },
        ],
      },
    ],
  },
};
