import type { Lesson } from '@/types/curriculum';

/** Extra lessons for module "types": numeric precision and java.time. */
export const numbersTimeLessons: Lesson[] = [
  // -------------------------------------------------------------------------
  {
    id: 't-numbers-math',
    moduleId: 'types',
    title: 'Numbers, precision and the Math API',
    summary: 'Why 0.1 + 0.2 is not 0.3, BigDecimal for money, overflow-safe arithmetic, floorMod, formatting and choosing a random generator.',
    estimatedMinutes: 35,
    difficulty: 'intermediate',
    prerequisites: ['f-type-conversion', 't-wrappers'],
    versionNotes: [
      { feature: 'ThreadLocalRandom', since: 7 },
      { feature: 'Math.addExact / multiplyExact / toIntExact / floorDiv / floorMod', since: 8 },
      { feature: 'Math.absExact', since: 15 },
      { feature: 'RandomGenerator interface and LXM generators (JEP 356)', since: 17 },
      { feature: 'Always-strict floating point; strictfp is redundant (JEP 306)', since: 17 },
      { feature: 'Math.clamp', since: 21 },
    ],
    objectives: [
      'Explain why binary floating point cannot store 0.1 exactly and what that means for comparisons.',
      'Do money arithmetic with BigDecimal: String constructor, scale, RoundingMode, compareTo.',
      'Detect integer overflow with the Math.*Exact methods and use BigInteger when 64 bits are not enough.',
      'Use floorDiv/floorMod correctly and explain why Math.abs(Integer.MIN_VALUE) is negative.',
      'Format numbers with an explicit Locale and pick the right random generator for the job.',
    ],
    plainEnglish: `Computers store \`double\` and \`float\` in **binary**. Just as 1/3 cannot be written exactly in decimal (0.3333…), 1/10 cannot be written exactly in binary. So \`0.1\` is really a number *very close* to 0.1, and \`0.1 + 0.2\` prints \`0.30000000000000004\`.

That is fine for physics, graphics and statistics, where tiny errors do not matter. It is **not** fine for money: a shop that loses a fraction of a cent on every sale ends up with totals that do not add up. For money, use \`BigDecimal\` (exact decimal digits) or count whole cents in a \`long\`.

Whole numbers have a different problem: \`int\` and \`long\` have a fixed size, and when a result is too big it silently **wraps around** to a negative number. The \`Math\` class has "exact" versions (\`Math.addExact\`, \`Math.multiplyExact\`) that throw an exception instead, and \`BigInteger\` can grow as large as memory allows.

Finally, how a number *looks* depends on the country: 1,234.50 in the US is 1.234,50 in Germany. Always tell the formatter which \`Locale\` you mean.`,
    technical: `### Floating point (IEEE 754)
A \`double\` has a sign bit, an 11-bit exponent and a 52-bit fraction (53 significant bits). Only fractions whose denominator is a power of two (0.5, 0.25, 0.375…) are exact. Every arithmetic result is rounded to the nearest representable value, so errors appear and accumulate. Compare with a tolerance (\`Math.abs(a - b) < 1e-9\`), never with \`==\`. Special values: \`1.0 / 0\` is \`Infinity\`, \`0.0 / 0\` is \`NaN\`, and \`NaN != NaN\`. Since Java 17 (JEP 306) all floating-point arithmetic is strict, so \`strictfp\` no longer changes anything.

### BigDecimal
A \`BigDecimal\` is an arbitrary-precision **unscaled integer** plus a **scale**: \`19.99\` is 1999 with scale 2.
- \`new BigDecimal(0.1)\` captures the double's binary error exactly (0.1000000000000000055…). Use \`new BigDecimal("0.1")\` or \`BigDecimal.valueOf(0.1)\` (which goes through \`Double.toString\`).
- \`setScale(2, RoundingMode.HALF_EVEN)\` fixes the number of decimal places; \`divide\` without a scale or \`MathContext\` throws \`ArithmeticException\` when the result does not terminate (1/3).
- \`equals\` compares value **and** scale (\`2.0\` ≠ \`2.00\`); \`compareTo\` compares value only. This matters in \`HashSet\` vs \`TreeSet\`.
- It is immutable: \`a.add(b)\` returns a new object.

### Integers: overflow and BigInteger
\`int\`/\`long\` arithmetic wraps silently (JLS §15.18.2). \`Math.addExact\`, \`subtractExact\`, \`multiplyExact\`, \`incrementExact\`, \`negateExact\`, \`toIntExact\` and \`absExact\` (15) throw \`ArithmeticException\` instead. \`BigInteger\` has no upper limit and offers \`pow\`, \`mod\`, \`gcd\`, \`modPow\` and \`isProbablePrime\`.

### Division, remainder and abs
- \`/\` truncates toward zero; \`Math.floorDiv\` rounds toward negative infinity. (\`Math.ceilDiv\` exists since Java 18.)
- \`%\` takes the sign of the dividend (\`-7 % 3 == -1\`); \`Math.floorMod\` takes the sign of the divisor (\`floorMod(-7, 3) == 2\`), which is what you want for bucket indexes and clock arithmetic.
- \`Math.abs(Integer.MIN_VALUE)\` is still \`Integer.MIN_VALUE\` because +2,147,483,648 does not fit in an \`int\`.
- \`StrictMath\` gives bit-for-bit identical results on every platform; \`Math\` may use faster CPU intrinsics within the documented error bounds.

### Formatting
\`String.format(Locale.US, "%,.2f", x)\` and \`NumberFormat.getCurrencyInstance(locale)\` produce locale-specific output. Without a \`Locale\` argument the JVM default is used, so the same code prints \`1,234.50\` on one server and \`1.234,50\` on another — and parsing can fail the same way. \`NumberFormat\` is **not** thread-safe.

### Random numbers
- \`Random\`: a 48-bit linear congruential generator; seeded instances are reproducible, which is great for tests and simulations and terrible for security.
- \`ThreadLocalRandom.current()\`: one generator per thread, no contention — the default choice in concurrent code.
- \`SecureRandom\`: cryptographically strong; use it for tokens, passwords, keys and session ids.
- \`RandomGenerator\` (Java 17, JEP 356): a common interface implemented by all of the above plus new LXM algorithms, e.g. \`RandomGenerator.of("L64X128MixRandom")\`.`,
    whyItExists: `Hardware does binary floating point very fast, so \`double\` is the right default for measurements. But business software deals in decimal quantities that must add up to the cent, and in counters that must never silently wrap. Java therefore pairs fast primitives with exact library types (\`BigDecimal\`, \`BigInteger\`) and with overflow-checking \`Math\` methods, and lets you choose between fast, reproducible and secure random generators.`,
    whenToUse: [
      'Use `BigDecimal` (from a String) or a `long` count of minor units for money and other exact decimal values.',
      'Use `double` for measurements, statistics, geometry and anything where a relative error of 1e-15 is harmless.',
      'Use `Math.addExact`/`multiplyExact`/`toIntExact` where overflow would corrupt data (sizes, balances, ids).',
      'Use `Math.floorMod` for bucket indexes, ring buffers and wrap-around arithmetic on possibly negative values.',
      'Use `SecureRandom` for anything an attacker must not guess; `ThreadLocalRandom` for everything else in concurrent code.',
    ],
    whenNotToUse: [
      'Do not use `double` or `float` for currency.',
      'Do not compare doubles with `==`, or BigDecimals with `equals` when you mean numeric equality.',
      'Do not use `new BigDecimal(double)` unless you really want the exact binary value.',
      'Do not use `Math.abs(hash) % n` for an index — it can be negative.',
      'Do not use `Random` or `Math.random()` for security tokens.',
    ],
    examples: [
      {
        id: 't-numbers-math-money',
        title: 'Floating-point error vs BigDecimal money',
        runnable: true,
        code: `import java.math.BigDecimal;
import java.math.RoundingMode;

public class Main {
    public static void main(String[] args) {
        System.out.println(0.1 + 0.2);
        System.out.println(0.1 + 0.2 == 0.3);
        System.out.println(new BigDecimal(0.1));
        System.out.println(new BigDecimal("0.1"));

        BigDecimal price = new BigDecimal("19.99");
        BigDecimal subtotal = price.multiply(BigDecimal.valueOf(3));
        BigDecimal tax = subtotal.multiply(new BigDecimal("0.0825"))
                                 .setScale(2, RoundingMode.HALF_EVEN);
        System.out.println(subtotal + " + " + tax + " = " + subtotal.add(tax));

        BigDecimal a = new BigDecimal("2.0");
        BigDecimal b = new BigDecimal("2.00");
        System.out.println(a.equals(b) + " " + (a.compareTo(b) == 0));
        System.out.println(a.scale() + " " + b.scale() + " " + b.stripTrailingZeros());

        BigDecimal third = BigDecimal.ONE.divide(new BigDecimal("3"), 4, RoundingMode.HALF_UP);
        System.out.println(third);
        try {
            BigDecimal.ONE.divide(new BigDecimal("3"));
        } catch (ArithmeticException e) {
            System.out.println("ArithmeticException: " + e.getMessage());
        }
    }
}`,
        expectedOutput: `0.30000000000000004
false
0.1000000000000000055511151231257827021181583404541015625
0.1
59.97 + 4.95 = 64.92
false true
1 2 2
0.3333
ArithmeticException: Non-terminating decimal expansion; no exact representable decimal result.`,
        explanation:
          'The double constructor exposes the binary approximation of 0.1; the String constructor stores exactly 0.1. Tax 59.97 × 0.0825 = 4.947525 is rounded once, deliberately, to 2 places. `equals` sees different scales; `compareTo` sees equal values.',
      },
      {
        id: 't-numbers-math-overflow',
        title: 'Overflow, exact arithmetic, floorMod and BigInteger',
        runnable: true,
        code: `import java.math.BigInteger;

public class Main {
    public static void main(String[] args) {
        int max = Integer.MAX_VALUE;
        System.out.println(max + 1);
        try {
            Math.addExact(max, 1);
        } catch (ArithmeticException e) {
            System.out.println("addExact: " + e.getMessage());
        }

        long big = 3_000_000_000L;
        System.out.println((int) big);
        try {
            Math.toIntExact(big);
        } catch (ArithmeticException e) {
            System.out.println("toIntExact: " + e.getMessage());
        }

        System.out.println(Math.abs(Integer.MIN_VALUE));
        System.out.println(-7 / 2 + " " + Math.floorDiv(-7, 2));
        System.out.println(-7 % 3 + " " + Math.floorMod(-7, 3));

        BigInteger factorial = BigInteger.ONE;
        for (int i = 2; i <= 25; i++) {
            factorial = factorial.multiply(BigInteger.valueOf(i));
        }
        System.out.println("25! = " + factorial);
        System.out.println(factorial.bitLength() + " bits");
    }
}`,
        expectedOutput: `-2147483648
addExact: integer overflow
-1294967296
toIntExact: integer overflow
-2147483648
-3 -4
-1 2
25! = 15511210043330985984000000
84 bits`,
        explanation:
          'Plain `+` and the `(int)` cast wrap silently; the exact methods throw. `/` truncates toward zero (−3) while floorDiv rounds down (−4). 25! needs 84 bits — more than a long holds — so BigInteger is the only primitive-free way to compute it exactly.',
      },
      {
        id: 't-numbers-math-format-random',
        title: 'Locale-aware formatting and random generators',
        runnable: true,
        code: `import java.text.NumberFormat;
import java.util.Locale;
import java.util.Random;
import java.util.concurrent.ThreadLocalRandom;
import java.util.random.RandomGenerator;
import java.util.random.RandomGeneratorFactory;

public class Main {
    public static void main(String[] args) {
        double amount = 1234567.891;
        System.out.println(String.format(Locale.US, "%,.2f", amount));
        System.out.println(String.format(Locale.GERMANY, "%,.2f", amount));
        System.out.println(String.format(Locale.US, "%08.3f|%-6d|%+d", Math.PI, 42, 7));

        NumberFormat usd = NumberFormat.getCurrencyInstance(Locale.US);
        System.out.println(usd.format(1234.5));
        NumberFormat pct = NumberFormat.getPercentInstance(Locale.US);
        System.out.println(pct.format(0.256));

        Random seeded = new Random(42);
        System.out.println(seeded.nextInt(100) + " " + seeded.nextInt(100));
        Random again = new Random(42);
        System.out.println(again.nextInt(100) + " " + again.nextInt(100));

        RandomGenerator lxm = RandomGeneratorFactory.of("L64X128MixRandom").create(42);
        int roll = lxm.nextInt(1, 7);
        System.out.println("die in range: " + (roll >= 1 && roll <= 6));

        int tl = ThreadLocalRandom.current().nextInt(1, 7);
        System.out.println("thread-local in range: " + (tl >= 1 && tl <= 6));
    }
}`,
        expectedOutput: `1,234,567.89
1.234.567,89
0003.142|42    |+7
$1,234.50
26%
30 63
30 63
die in range: true
thread-local in range: true`,
        minJavaVersion: 17,
        explanation:
          'Grouping and decimal separators swap between US and German locales. `%08.3f` pads with zeros to width 8, `%-6d` left-aligns in 6 columns, `%+d` always shows the sign. Two `Random`s with the same seed produce the same sequence — reproducible, and therefore predictable. `nextInt(origin, bound)` comes from the Java 17 `RandomGenerator` interface.',
      },
      {
        id: 't-numbers-math-secure',
        title: 'Generating a security token',
        runnable: false,
        code: `import java.security.SecureRandom;
import java.util.Base64;

public final class Tokens {
    private static final SecureRandom RNG = new SecureRandom();   // thread-safe, reuse it

    /** 256 bits of unpredictable data, URL-safe. */
    public static String newResetToken() {
        byte[] bytes = new byte[32];
        RNG.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}`,
        explanation:
          'Output is random by design, so this example is not runnable here. Reuse one `SecureRandom` instance; never derive tokens from `Random`, `Math.random()`, timestamps or ids.',
      },
    ],
    walkthrough: {
      exampleId: 't-numbers-math-money',
      steps: [
        { lines: [6, 7], text: '0.1 and 0.2 are each rounded to the nearest binary fraction; their sum rounds to a double just above 0.3, so `==` against the literal 0.3 is false.' },
        { lines: [8, 9], text: '`new BigDecimal(0.1)` faithfully copies the double\'s binary approximation. The String constructor stores the decimal digits you wrote: unscaled value 1, scale 1.' },
        { lines: [11, 12], text: 'Prices are built from Strings. `BigDecimal.valueOf(3)` is the idiomatic way to turn an integer into a BigDecimal. 19.99 × 3 = 59.97 exactly.' },
        { lines: [13, 15], text: 'The tax rate produces 4.947525; `setScale(2, HALF_EVEN)` rounds it once, explicitly, to 4.95. Every BigDecimal operation returns a new object.' },
        { lines: [17, 20], text: '`equals` compares value and scale, so 2.0 and 2.00 differ; `compareTo` compares numeric value only. `stripTrailingZeros` normalises 2.00 to 2.' },
        { lines: [22, 28], text: '1/3 has no finite decimal expansion. With a scale and RoundingMode, divide returns 0.3333; without them it throws ArithmeticException instead of guessing.' },
      ],
    },
    realWorld: {
      title: 'The invoice that was off by one cent',
      scenario: `An invoicing service computed line totals as \`double\`, summed them and rounded at the end with \`Math.round(total * 100) / 100.0\`. Customers occasionally received invoices whose lines did not add up to the total, and the accounting export failed reconciliation by a cent on a few thousand invoices a month.

The team switched to \`BigDecimal\` built from the database's DECIMAL columns, rounded **each line** with \`setScale(2, RoundingMode.HALF_EVEN)\` as the tax rules require, and compared amounts with \`compareTo\`. A unit test with 0.1 + 0.2 style values and a property test summing random lines now guard the rule. Another team in the same company chose the alternative — storing amounts as \`long\` cents — which is faster and equally correct as long as every division is handled explicitly.`,
    },
    commonMistakes: [
      {
        mistake: 'Using `double` for money.',
        why: 'Most decimal fractions are not representable in binary, so sums drift by tiny amounts that show up after rounding.',
        fix: 'Use `BigDecimal` from Strings (or `long` cents) and round explicitly with a RoundingMode.',
        code: `double total = 0;
for (int i = 0; i < 10; i++) total += 0.1;
System.out.println(total);   // 0.9999999999999999`,
      },
      {
        mistake: 'Writing `new BigDecimal(0.1)`.',
        why: 'The double constructor captures the binary approximation, so the BigDecimal is 0.1000000000000000055…',
        fix: 'Use `new BigDecimal("0.1")` or `BigDecimal.valueOf(0.1)`.',
      },
      {
        mistake: 'Comparing BigDecimals with `equals`, or using them as HashMap keys without normalising.',
        why: '`equals` and `hashCode` include the scale: 1.10 and 1.1 are different keys.',
        fix: 'Use `compareTo(...) == 0`, or normalise with `stripTrailingZeros()` / a fixed `setScale` before using them as keys.',
      },
      {
        mistake: '`int index = Math.abs(key.hashCode()) % buckets;`',
        why: '`Math.abs(Integer.MIN_VALUE)` is negative, so a rare hash produces a negative index and an ArrayIndexOutOfBoundsException.',
        fix: 'Use `Math.floorMod(key.hashCode(), buckets)`.',
      },
      {
        mistake: 'Formatting or parsing numbers without a Locale.',
        why: 'The JVM default locale differs between laptops, CI and servers, so "1,234.50" may be printed as "1.234,50" or fail to parse.',
        fix: 'Pass `Locale.ROOT` for machine-readable text and the user\'s locale for display.',
      },
    ],
    checks: [
      {
        id: 't5-c1',
        kind: 'predict-output',
        dimension: 'runtime',
        prompt: 'What does this print?',
        code: `import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;

public class Main {
    public static void main(String[] args) {
        BigDecimal a = new BigDecimal("1.10");
        BigDecimal b = new BigDecimal("1.1");
        Set<BigDecimal> hash = new HashSet<>(List.of(a, b));
        Set<BigDecimal> tree = new TreeSet<>(List.of(a, b));
        System.out.println(a.equals(b) + " " + hash.size() + " " + tree.size());
    }
}`,
        options: [
          { id: 'a', text: 'true 1 1' },
          { id: 'b', text: 'false 2 2' },
          { id: 'c', text: 'false 2 1' },
          { id: 'd', text: 'false 1 2' },
        ],
        correctOptionId: 'c',
        explanation: '`equals` (and `hashCode`) include the scale, so HashSet keeps both. TreeSet uses `compareTo`, which sees 1.10 and 1.1 as equal, so it keeps one.',
        hints: ['Which method does each set use to decide whether two elements are the same?'],
      },
      {
        id: 't5-c2',
        kind: 'predict-output',
        dimension: 'runtime',
        prompt: 'What does this print?',
        code: `public class Main {
    public static void main(String[] args) {
        System.out.println(-7 % 3 + " " + Math.floorMod(-7, 3) + " " + Math.abs(Integer.MIN_VALUE));
    }
}`,
        options: [
          { id: 'a', text: '-1 2 -2147483648' },
          { id: 'b', text: '1 2 2147483648' },
          { id: 'c', text: '-1 -1 2147483647' },
          { id: 'd', text: '2 2 -2147483648' },
        ],
        correctOptionId: 'a',
        explanation: '`%` keeps the sign of the dividend (−1); floorMod keeps the sign of the divisor (2). +2,147,483,648 does not fit in an int, so abs(MIN_VALUE) overflows back to MIN_VALUE.',
      },
      {
        id: 't5-c3',
        kind: 'predict-output',
        dimension: 'runtime',
        prompt: 'What does this print?',
        code: `import java.math.BigDecimal;
import java.math.RoundingMode;

public class Main {
    public static void main(String[] args) {
        BigDecimal x = new BigDecimal("2.5");
        BigDecimal y = new BigDecimal("3.5");
        System.out.println(x.setScale(0, RoundingMode.HALF_UP) + " "
                + y.setScale(0, RoundingMode.HALF_UP) + " "
                + x.setScale(0, RoundingMode.HALF_EVEN) + " "
                + y.setScale(0, RoundingMode.HALF_EVEN));
    }
}`,
        options: [
          { id: 'a', text: '3 4 3 4' },
          { id: 'b', text: '3 4 2 4' },
          { id: 'c', text: '2 3 2 4' },
          { id: 'd', text: '3 4 2 3' },
        ],
        correctOptionId: 'b',
        explanation: 'HALF_UP rounds ties away from zero (3, 4). HALF_EVEN ("banker\'s rounding") rounds ties to the even neighbour: 2.5 → 2, 3.5 → 4, which avoids a systematic upward bias over many values.',
      },
      {
        id: 't5-c4',
        kind: 'multi-select',
        dimension: 'runtime',
        prompt: 'Which of these throw an ArithmeticException? Select all that apply.',
        options: [
          { id: 'a', text: '`Math.addExact(Integer.MAX_VALUE, 1)`' },
          { id: 'b', text: '`Integer.MAX_VALUE + 1`' },
          { id: 'c', text: '`BigDecimal.ONE.divide(new BigDecimal("3"))`' },
          { id: 'd', text: '`1.0 / 0`' },
          { id: 'e', text: '`1 / 0` (both int)' },
        ],
        correctOptionIds: ['a', 'c', 'e'],
        explanation: 'addExact throws on overflow; plain `+` wraps to −2,147,483,648. BigDecimal division with a non-terminating result throws unless you give a scale or MathContext. Floating-point division by zero yields Infinity; integer division by zero throws.',
      },
      {
        id: 't5-c5',
        kind: 'mcq',
        dimension: 'conceptual',
        prompt: 'You need to generate password-reset tokens in a multi-threaded web service. Which generator should you use?',
        options: [
          { id: 'a', text: '`new Random(System.currentTimeMillis())`' },
          { id: 'b', text: '`ThreadLocalRandom.current()`' },
          { id: 'c', text: 'A shared `SecureRandom` instance' },
          { id: 'd', text: '`Math.random()`' },
        ],
        correctOptionId: 'c',
        explanation: 'Tokens must be unpredictable. Random, ThreadLocalRandom and Math.random are fast statistical generators whose output can be predicted from a few observed values. SecureRandom is cryptographically strong and thread-safe.',
      },
      {
        id: 't5-c6',
        kind: 'mcq',
        dimension: 'interview',
        prompt: 'Why is `new BigDecimal(0.1)` discouraged?',
        options: [
          { id: 'a', text: 'It throws NumberFormatException' },
          { id: 'b', text: 'It stores the exact value of the double nearest to 0.1, which is not 0.1' },
          { id: 'c', text: 'It rounds 0.1 to 0' },
          { id: 'd', text: 'It is deprecated for removal' },
        ],
        correctOptionId: 'b',
        explanation: 'The literal 0.1 is already a binary approximation by the time the constructor sees it; BigDecimal records it exactly as 0.1000000000000000055511151231257827021181583404541015625. Use the String constructor or BigDecimal.valueOf(double).',
      },
    ],
    challengeIds: [],
    masteryCriteria: [
      'Explain the 0.1 + 0.2 result in terms of binary representation.',
      'Write money arithmetic with BigDecimal, explicit scale and RoundingMode, and compare with compareTo.',
      'Choose between int, long, double, BigDecimal and BigInteger for a given requirement.',
      'Use the exact and floor methods of Math to avoid silent overflow and negative remainders.',
      'Pick Random, ThreadLocalRandom or SecureRandom correctly and format numbers with an explicit Locale.',
    ],
    relatedLessonIds: ['f-types-operators', 'f-type-conversion', 't-wrappers', 'c-hashmap', 't-date-time'],
    revision: [
      { id: 'r1', question: 'Why is 0.1 + 0.2 not equal to 0.3 in Java?', answer: '0.1, 0.2 and 0.3 are not exactly representable in binary floating point; each is rounded, and the rounded sum (0.30000000000000004) is a different double from the rounded 0.3.' },
      { id: 'r2', question: 'What is the difference between BigDecimal.equals and compareTo?', answer: 'equals compares value and scale (2.0 ≠ 2.00); compareTo compares numeric value only (returns 0 for 2.0 and 2.00).' },
      { id: 'r3', question: 'What is Math.floorMod(-7, 3) and why prefer it for indexes?', answer: '2. It returns a result with the sign of the divisor, so it is never negative for a positive divisor, unlike % which gives −1.' },
      { id: 'r4', question: 'Which random generator for security tokens, and which for a parallel simulation?', answer: 'SecureRandom for tokens; ThreadLocalRandom (or a seeded/splittable RandomGenerator for reproducibility) for simulations.' },
    ],
  },

  // -------------------------------------------------------------------------
  {
    id: 't-date-time',
    moduleId: 'types',
    title: 'Dates and times with java.time',
    summary: 'Instant vs LocalDateTime vs ZonedDateTime, time zones and DST, Duration vs Period, formatting, and testable code with Clock.',
    estimatedMinutes: 35,
    difficulty: 'intermediate',
    prerequisites: ['t-wrappers'],
    versionNotes: [
      { feature: 'java.time (JSR 310)', since: 8, note: 'replaces java.util.Date, Calendar and SimpleDateFormat for new code' },
      { feature: 'Instant/ZonedDateTime conversions on legacy Date and Calendar (Date.from, toInstant)', since: 8 },
      { feature: 'LocalDate.datesUntil, Duration.toDaysPart and friends', since: 9 },
    ],
    objectives: [
      'Explain why java.util.Date and Calendar were replaced by java.time.',
      'Choose between Instant, LocalDate, LocalTime, LocalDateTime, ZonedDateTime and OffsetDateTime.',
      'Predict how ZonedDateTime resolves daylight-saving gaps and overlaps.',
      'Use Duration for time-based amounts and Period for date-based amounts.',
      'Format and parse with DateTimeFormatter and inject a Clock to make time-dependent code testable.',
    ],
    plainEnglish: `There are two kinds of "time" in software:

- **Machine time** — *the exact moment something happened*, the same everywhere on Earth. In Java that is an \`Instant\`, for example \`2024-06-01T12:00:00Z\` (the Z means UTC).
- **Human time** — *what the calendar and the wall clock say* in some place: "4 July 2024, 2:05 pm". In Java that is \`LocalDate\`, \`LocalTime\` or \`LocalDateTime\`. On its own, a local date-time is not a moment: 9:00 in London and 9:00 in Tokyo are hours apart.

A \`ZonedDateTime\` joins the two: a local date-time **plus** a time zone such as \`Europe/Paris\`, which knows the daylight-saving rules for that place, so it pins down exactly one moment.

The rule of thumb: **store the Instant, show the zone.** Save timestamps in UTC; convert to the user's zone only when you display them.

Every java.time class is **immutable**: \`date.plusDays(1)\` returns a *new* date and leaves the original alone, so always use the returned value.`,
    technical: `### Why java.time (JSR 310, Java 8)
\`java.util.Date\` is mutable, counts years from 1900 and months from 0, and its \`toString\` silently uses the JVM default zone. \`Calendar\` is mutable and verbose, and \`SimpleDateFormat\` is not thread-safe. java.time, designed by the author of Joda-Time, provides immutable, thread-safe value types with clear separation of concepts.

### The types
- \`Instant\` — nanoseconds since 1970-01-01T00:00Z. For timestamps, logs, ordering events.
- \`LocalDate\` / \`LocalTime\` / \`LocalDateTime\` — no zone, no offset. Birthdays, opening hours, "every day at 09:00".
- \`ZonedDateTime\` — local date-time + \`ZoneId\` (region rules, DST-aware). For future appointments in a place and for display.
- \`OffsetDateTime\` — local date-time + fixed \`ZoneOffset\` such as +02:00. Good for wire formats (ISO-8601 / RFC 3339) and SQL \`TIMESTAMP WITH TIME ZONE\`.
- \`Duration\` — seconds + nanos (\`PT8H30M\`). \`Period\` — years, months, days (\`P1Y2M3D\`).
- Also: \`Year\`, \`YearMonth\`, \`MonthDay\`, \`DayOfWeek\`, \`TemporalAdjusters\` (e.g. "next Friday").

### Time zones and DST
\`ZoneId.of("America/New_York")\` refers to the IANA tz database shipped with the JDK. When you build a ZonedDateTime from a local date-time:
- **Gap** (spring forward, 02:30 does not exist): the time is moved forward by the length of the gap → 03:30.
- **Overlap** (fall back, 01:30 happens twice): the earlier offset is chosen; \`withLaterOffsetAtOverlap()\` picks the other.
Adding a \`Period\` of 1 day keeps the wall-clock time; adding a \`Duration\` of 24 hours adds exactly 86,400 seconds, which crosses a DST change to a different local hour.

### Formatting and parsing
\`DateTimeFormatter\` is immutable and thread-safe — keep it in a \`static final\` field. Predefined ISO formatters are used by every \`toString\`/\`parse\`. With \`ofPattern\` always pass a \`Locale\` for month and day names. Pattern letters are case-sensitive: \`MM\` month vs \`mm\` minute, \`HH\` 0–23 vs \`hh\` 1–12, \`yyyy\` year-of-era vs \`YYYY\` **week-based year**, \`uuuu\` proleptic year.

### Clock and testing
\`now()\` reads the system clock, which makes tests time-dependent. Inject a \`java.time.Clock\` and call \`Instant.now(clock)\` / \`LocalDate.now(clock)\`; in tests use \`Clock.fixed(...)\` or \`Clock.offset(...)\`.

### Legacy interop
\`Date.from(instant)\`, \`date.toInstant()\`, \`GregorianCalendar.from(zdt)\`, \`java.sql.Timestamp.valueOf(ldt)\`. JDBC 4.2 drivers accept \`LocalDate\`, \`LocalDateTime\` and \`OffsetDateTime\` directly via \`setObject\`/\`getObject\`.`,
    whyItExists: `Date and time bugs are everywhere because human time is messy: zones, daylight saving, leap years, months of different lengths, and formats that vary by country. The original \`Date\`/\`Calendar\` API made it easy to confuse a moment with a calendar reading and was mutable and thread-unsafe. java.time encodes each concept as its own immutable type, so the compiler stops you mixing "a moment" with "a date on a wall calendar".`,
    whenToUse: [
      'Use `Instant` (stored as UTC) for created-at/updated-at timestamps, logs and event ordering.',
      'Use `LocalDate` for dates with no time of day: birthdays, due dates, holidays.',
      'Use `ZonedDateTime` with a region `ZoneId` for future events tied to a place, and for display.',
      'Use `OffsetDateTime` for API payloads and database columns that carry an offset.',
      'Inject a `Clock` into any class that asks "what time is it now?".',
    ],
    whenNotToUse: [
      'Do not use `java.util.Date`, `Calendar` or `SimpleDateFormat` in new code.',
      'Do not store `LocalDateTime` for moments in time — it loses the zone and becomes ambiguous.',
      'Do not hard-code offsets like +01:00 for a region; offsets change with DST and with law.',
      'Do not call `now()` directly inside business logic you want to test.',
      'Do not use `YYYY` in a pattern unless you really want the week-based year.',
    ],
    examples: [
      {
        id: 't-date-time-local',
        title: 'Local dates, Period, Duration and formatting',
        runnable: true,
        code: `import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.Locale;

public class Main {
    public static void main(String[] args) {
        LocalDate start = LocalDate.of(2024, 1, 31);
        System.out.println(start.plusMonths(1));
        System.out.println(start.isLeapYear() + " " + start.getDayOfWeek());
        System.out.println(start.with(TemporalAdjusters.next(DayOfWeek.FRIDAY)));

        LocalDate birthday = LocalDate.of(1990, 5, 20);
        LocalDate today = LocalDate.of(2024, 3, 15);
        Period age = Period.between(birthday, today);
        System.out.println(age + " -> " + age.getYears() + " years");
        System.out.println(ChronoUnit.DAYS.between(birthday, today) + " days");

        LocalTime open = LocalTime.of(9, 0);
        LocalTime close = LocalTime.of(17, 30);
        Duration shift = Duration.between(open, close);
        System.out.println(shift + " = " + shift.toMinutes() + " minutes");

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd MMM uuuu HH:mm", Locale.US);
        LocalDateTime meeting = LocalDateTime.of(2024, 7, 4, 14, 5);
        System.out.println(meeting.format(fmt));
        System.out.println(LocalDateTime.parse("04 Jul 2024 14:05", fmt).equals(meeting));
        System.out.println(LocalDate.parse("2024-02-29"));
    }
}`,
        expectedOutput: `2024-02-29
true WEDNESDAY
2024-02-02
P33Y9M24D -> 33 years
12353 days
PT8H30M = 510 minutes
04 Jul 2024 14:05
true
2024-02-29`,
        explanation:
          'Adding a month to 31 January clamps to the last valid day (29 February in a leap year). Period is calendar-based (years, months, days); ChronoUnit.DAYS.between gives the total. Duration is time-based and prints in ISO-8601 form. The formatter has an explicit Locale so "Jul" is the same on every machine.',
      },
      {
        id: 't-date-time-zones',
        title: 'Instants, zones, offsets and daylight saving',
        runnable: true,
        code: `import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.Period;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;

public class Main {
    public static void main(String[] args) {
        Instant stored = Instant.parse("2024-06-01T12:00:00Z");
        System.out.println(stored.atZone(ZoneId.of("America/New_York")));
        System.out.println(stored.atZone(ZoneId.of("Asia/Kolkata")));
        System.out.println(stored.atOffset(ZoneOffset.ofHours(2)));

        ZoneId ny = ZoneId.of("America/New_York");
        LocalDateTime inGap = LocalDateTime.of(2024, 3, 10, 2, 30);
        System.out.println(ZonedDateTime.of(inGap, ny));

        LocalDateTime inOverlap = LocalDateTime.of(2024, 11, 3, 1, 30);
        ZonedDateTime first = ZonedDateTime.of(inOverlap, ny);
        System.out.println(first + " / " + first.withLaterOffsetAtOverlap().getOffset());

        ZonedDateTime beforeDst = ZonedDateTime.of(2024, 3, 9, 12, 0, 0, 0, ny);
        System.out.println(beforeDst.plus(Period.ofDays(1)));
        System.out.println(beforeDst.plus(Duration.ofHours(24)));

        OffsetDateTime odt = OffsetDateTime.parse("2024-06-01T14:00:00+02:00");
        System.out.println(odt.toInstant().equals(stored));
    }
}`,
        expectedOutput: `2024-06-01T08:00-04:00[America/New_York]
2024-06-01T17:30+05:30[Asia/Kolkata]
2024-06-01T14:00+02:00
2024-03-10T03:30-04:00[America/New_York]
2024-11-03T01:30-04:00[America/New_York] / -05:00
2024-03-10T12:00-04:00[America/New_York]
2024-03-10T13:00-04:00[America/New_York]
true`,
        explanation:
          'One stored Instant is displayed in three places. 02:30 on 10 March 2024 does not exist in New York, so it is shifted to 03:30. 01:30 on 3 November happens twice; the earlier offset (−04:00) wins unless you ask for the later one. Period keeps the wall-clock time; Duration adds exactly 24 hours, which is 13:00 after the clocks jumped forward.',
      },
      {
        id: 't-date-time-clock',
        title: 'Testable code with an injected Clock',
        runnable: true,
        code: `import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;

public class Main {
    record Coupon(String code, Instant expiresAt) {}

    static class CouponService {
        private final Clock clock;
        CouponService(Clock clock) { this.clock = clock; }

        boolean isValid(Coupon c) {
            return Instant.now(clock).isBefore(c.expiresAt());
        }

        LocalDate todayFor(ZoneId zone) {
            return LocalDate.now(clock.withZone(zone));
        }
    }

    public static void main(String[] args) {
        Clock fixed = Clock.fixed(Instant.parse("2024-12-31T23:30:00Z"), ZoneId.of("UTC"));
        CouponService service = new CouponService(fixed);
        Coupon coupon = new Coupon("NY24", Instant.parse("2025-01-01T00:00:00Z"));
        System.out.println(service.isValid(coupon));

        CouponService later = new CouponService(Clock.offset(fixed, Duration.ofHours(1)));
        System.out.println(later.isValid(coupon));

        System.out.println(service.todayFor(ZoneId.of("UTC")));
        System.out.println(service.todayFor(ZoneId.of("Asia/Tokyo")));
        System.out.println(service.todayFor(ZoneId.of("America/Los_Angeles")));

        Date legacy = Date.from(coupon.expiresAt());
        System.out.println(legacy.getTime() + " " + legacy.toInstant());
    }
}`,
        expectedOutput: `true
false
2024-12-31
2025-01-01
2024-12-31
1735689600000 2025-01-01T00:00:00Z`,
        minJavaVersion: 16,
        explanation:
          'Production code would pass `Clock.systemUTC()`; the test passes `Clock.fixed`, so the result never depends on when the test runs. `Clock.offset` moves time forward without sleeping. The same instant is a different calendar date in Tokyo. `Date.from`/`toInstant` bridge to legacy APIs without going through strings.',
      },
    ],
    walkthrough: {
      exampleId: 't-date-time-zones',
      steps: [
        { lines: [12, 15], text: 'The stored value is an Instant — one moment in UTC. `atZone` and `atOffset` only change how it is presented: 08:00 in New York, 17:30 in Kolkata, 14:00 at +02:00. All three are the same instant.' },
        { lines: [17, 19], text: 'On 10 March 2024 New York clocks jump from 02:00 to 03:00. 02:30 never happens, so ZonedDateTime.of shifts it forward by the gap length, to 03:30 with the new offset −04:00.' },
        { lines: [21, 23], text: 'On 3 November clocks go back from 02:00 to 01:00, so 01:30 occurs twice. The earlier offset (−04:00, daylight time) is chosen; withLaterOffsetAtOverlap gives the second occurrence (−05:00).' },
        { lines: [25, 27], text: 'From noon the day before the change, Period.ofDays(1) means "same wall-clock time tomorrow" (12:00), while Duration.ofHours(24) means exactly 86,400 seconds, which lands at 13:00 because one hour was skipped.' },
        { lines: [29, 30], text: 'An OffsetDateTime parsed from an API payload converts to the same Instant: 14:00 at +02:00 is 12:00 UTC.' },
      ],
    },
    realWorld: {
      title: 'The nightly job that ran twice — and then not at all',
      scenario: `A billing service scheduled its nightly run at 01:30 local time using \`LocalDateTime\` and the server's default zone. On the autumn DST change the job ran twice (01:30 happened twice) and customers were charged twice; in spring a job scheduled at 02:30 did not run at all because that time did not exist.

The fix had three parts: store run timestamps as \`Instant\` in UTC; schedule business jobs in an explicit \`ZoneId\` and make them idempotent (a run key per *billing date*, a \`LocalDate\`, not per wall-clock time); and inject a \`Clock\` so the DST transitions became ordinary unit tests using \`Clock.fixed\` at 2024-03-10 and 2024-11-03 in America/New_York.`,
    },
    commonMistakes: [
      {
        mistake: 'Ignoring the return value: `date.plusDays(1);`',
        why: 'java.time types are immutable; the call returns a new object and the original is unchanged.',
        fix: 'Reassign: `date = date.plusDays(1);`',
      },
      {
        mistake: 'Storing `LocalDateTime` for event timestamps.',
        why: 'Without a zone the value is ambiguous: servers in different zones (or the same server after a DST change) read it as different moments.',
        fix: 'Store an `Instant` (UTC) or an `OffsetDateTime`; convert to a `ZonedDateTime` only for display.',
      },
      {
        mistake: 'Using `YYYY` instead of `yyyy`/`uuuu` in a pattern.',
        why: '`Y` is the week-based year: 30 December 2024 formats as 2025-12-30 with `YYYY-MM-dd`.',
        fix: 'Use `uuuu` (or `yyyy`) for the calendar year; prefer the predefined ISO formatters for machine formats.',
        code: `DateTimeFormatter.ofPattern("YYYY-MM-dd", Locale.US).format(LocalDate.of(2024, 12, 30));  // "2025-12-30"`,
      },
      {
        mistake: 'Calling `LocalDate.now()` inside business logic.',
        why: 'It uses the system clock and default zone, so tests become flaky around midnight and month ends and cannot reproduce edge cases.',
        fix: 'Inject a `Clock` and call `LocalDate.now(clock)`; use `Clock.fixed` in tests.',
      },
      {
        mistake: 'Using `Duration` for "one month later" or "same time tomorrow".',
        why: 'Duration is exact seconds; a day across a DST change is 23 or 25 hours, and months vary in length.',
        fix: 'Use `Period` (or `plusDays`/`plusMonths`) for calendar arithmetic and `Duration` for elapsed time.',
      },
    ],
    checks: [
      {
        id: 't6-c1',
        kind: 'predict-output',
        dimension: 'runtime',
        prompt: 'What does this print?',
        code: `import java.time.LocalDate;

public class Main {
    public static void main(String[] args) {
        LocalDate jan31 = LocalDate.of(2024, 1, 31);
        jan31.plusDays(1);
        System.out.println(jan31 + " " + jan31.plusMonths(1).plusMonths(1) + " " + jan31.plusMonths(2));
    }
}`,
        options: [
          { id: 'a', text: '2024-02-01 2024-03-31 2024-03-31' },
          { id: 'b', text: '2024-01-31 2024-03-29 2024-03-31' },
          { id: 'c', text: '2024-01-31 2024-03-31 2024-03-31' },
          { id: 'd', text: '2024-01-31 2024-03-02 2024-03-31' },
        ],
        correctOptionId: 'b',
        explanation: 'plusDays returns a new date that is discarded, so jan31 is unchanged. 31 Jan + 1 month clamps to 29 Feb, and 29 Feb + 1 month is 29 Mar. Adding 2 months in one step gives 31 Mar. Month arithmetic is not associative.',
        hints: ['Are java.time objects mutable?', 'What happens when the target month is shorter?'],
      },
      {
        id: 't6-c2',
        kind: 'predict-output',
        dimension: 'runtime',
        prompt: 'In Paris, clocks jump from 02:00 to 03:00 on 31 March 2024. What does this print?',
        code: `import java.time.Duration;
import java.time.Period;
import java.time.ZoneId;
import java.time.ZonedDateTime;

public class Main {
    public static void main(String[] args) {
        ZoneId paris = ZoneId.of("Europe/Paris");
        ZonedDateTime sat = ZonedDateTime.of(2024, 3, 30, 9, 0, 0, 0, paris);
        System.out.println(sat.plus(Period.ofDays(1)).getHour() + " "
                + sat.plus(Duration.ofDays(1)).getHour());
    }
}`,
        options: [
          { id: 'a', text: '9 9' },
          { id: 'b', text: '9 10' },
          { id: 'c', text: '9 8' },
          { id: 'd', text: '10 10' },
        ],
        correctOptionId: 'b',
        explanation: 'Period.ofDays(1) is a calendar day: same local time tomorrow (09:00). Duration.ofDays(1) is exactly 24 hours; because Sunday has only 23 hours in Paris, 24 hours later is 10:00.',
      },
      {
        id: 't6-c3',
        kind: 'predict-output',
        dimension: 'debugging',
        prompt: 'A report header shows the wrong year. What does this print?',
        code: `import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

public class Main {
    public static void main(String[] args) {
        LocalDate d = LocalDate.of(2024, 12, 30);
        System.out.println(DateTimeFormatter.ofPattern("yyyy-MM-dd", Locale.US).format(d) + " "
                + DateTimeFormatter.ofPattern("YYYY-MM-dd", Locale.US).format(d));
    }
}`,
        options: [
          { id: 'a', text: '2024-12-30 2024-12-30' },
          { id: 'b', text: '2024-12-30 2025-12-30' },
          { id: 'c', text: '2024-12-30 2025-01-30' },
          { id: 'd', text: 'Compile error' },
        ],
        correctOptionId: 'b',
        explanation: '`Y` is the week-based year. In the US week definition the week containing 1 January 2025 starts on Sunday 29 December 2024, so 30 December belongs to week-year 2025. Use `yyyy` or `uuuu`.',
      },
      {
        id: 't6-c4',
        kind: 'mcq',
        dimension: 'conceptual',
        prompt: 'Which type should a `createdAt` column in an orders table map to in Java?',
        options: [
          { id: 'a', text: '`LocalDateTime` in the server\'s default zone' },
          { id: 'b', text: '`Instant` (or `OffsetDateTime` in UTC)' },
          { id: 'c', text: '`LocalDate`' },
          { id: 'd', text: '`String` in the format dd/MM/yyyy HH:mm' },
        ],
        correctOptionId: 'b',
        explanation: 'createdAt records a moment. An Instant (UTC) is unambiguous whichever zone the server, database or user is in; the UI converts it to the viewer\'s zone.',
      },
      {
        id: 't6-c5',
        kind: 'multi-select',
        dimension: 'interview',
        prompt: 'Which statements are true? Select all that apply.',
        options: [
          { id: 'a', text: '`DateTimeFormatter` is immutable and safe to share between threads.' },
          { id: 'b', text: '`SimpleDateFormat` is safe to share in a static field across threads.' },
          { id: 'c', text: 'A `LocalDateTime` identifies a single moment on the timeline.' },
          { id: 'd', text: 'For a time inside a DST gap, `ZonedDateTime.of` shifts it forward by the length of the gap.' },
          { id: 'e', text: '`Clock.fixed` makes code that calls `Instant.now(clock)` deterministic in tests.' },
        ],
        correctOptionIds: ['a', 'd', 'e'],
        explanation: 'SimpleDateFormat keeps mutable parsing state and corrupts results under concurrent use. A LocalDateTime has no zone or offset, so it can mean many moments. The gap rule and Clock.fixed behave as stated.',
      },
      {
        id: 't6-c6',
        kind: 'mcq',
        dimension: 'conceptual',
        prompt: 'You schedule a dentist appointment for 10:00 on 15 July next year in Berlin. What should you store?',
        options: [
          { id: 'a', text: 'The Instant computed today from the current Berlin offset' },
          { id: 'b', text: 'The LocalDateTime 10:00 on 15 July plus the ZoneId "Europe/Berlin"' },
          { id: 'c', text: 'An OffsetDateTime with +01:00' },
          { id: 'd', text: 'Milliseconds since the epoch in the server\'s zone' },
        ],
        correctOptionId: 'b',
        explanation: 'For future events defined by the local wall clock, store the local date-time and the region zone. If DST rules change before the appointment, the instant is recomputed correctly; a precomputed Instant or fixed offset would drift. (+01:00 is also simply wrong for Berlin in July, which uses +02:00.)',
      },
    ],
    challengeIds: [],
    masteryCriteria: [
      'Pick the correct java.time type for timestamps, birthdays, opening hours, future appointments and API payloads.',
      'Predict DST gap and overlap resolution and the difference between Period and Duration across a transition.',
      'Format and parse with a Locale-aware DateTimeFormatter and avoid the YYYY trap.',
      'Write time-dependent logic that takes a Clock and test it with Clock.fixed.',
      'Convert between java.time and legacy Date at the boundary only.',
    ],
    relatedLessonIds: ['t-wrappers', 'o-object-contracts', 't-numbers-math', 'j-jdbc', 'ts-junit'],
    revision: [
      { id: 'r1', question: 'What is the difference between Instant and LocalDateTime?', answer: 'Instant is a single point on the UTC timeline. LocalDateTime is a calendar date and wall-clock time with no zone, so it does not identify a moment until you add a zone or offset.' },
      { id: 'r2', question: 'Duration vs Period?', answer: 'Duration is an exact amount of time in seconds and nanoseconds (PT24H). Period is a calendar amount in years, months and days (P1D) and respects DST and month lengths.' },
      { id: 'r3', question: 'What does ZonedDateTime do with 02:30 on a spring-forward day?', answer: 'It moves the time forward by the length of the gap, typically to 03:30, using the new offset.' },
      { id: 'r4', question: 'How do you make "is this coupon expired?" testable?', answer: 'Inject a java.time.Clock, call Instant.now(clock), and pass Clock.fixed (or Clock.offset) in tests.' },
    ],
  },
];
