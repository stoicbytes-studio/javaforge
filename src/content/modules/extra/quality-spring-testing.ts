import type { Lesson } from '@/types/curriculum';

/** New lessons: code quality tooling (module 12) and testing Spring Boot applications (module 15). */
export const qualitySpringTestingLessons: Lesson[] = [
  {
    id: 'ts-code-quality',
    moduleId: 'testing',
    title: 'Code quality: static analysis, reviews and coverage',
    summary: 'What javac -Xlint, SpotBugs, PMD, Checkstyle, Error Prone and SonarQube catch; formatters; code review; JaCoCo line and branch coverage; mutation testing with PIT; complexity, code smells, refactoring and CI quality gates.',
    estimatedMinutes: 45,
    difficulty: 'intermediate',
    prerequisites: ['ts-junit'],
    versionNotes: [
      { feature: 'javac -Xlint:this-escape (warns when a constructor leaks `this`)', since: 21 },
      { feature: 'Text blocks, used in the complexity example', since: 15 },
    ],
    objectives: [
      'Name the main Java static-analysis tools and the kind of problem each one is good at finding.',
      'Recognise classic bugs that analysers flag: ignored return values, equals across unrelated types, integer division, == on Strings.',
      'Explain line versus branch coverage in JaCoCo and why 100% coverage is not the goal.',
      'Use mutation testing (PIT) to judge whether tests actually check behaviour.',
      'Measure cyclomatic complexity, spot common code smells and apply refactorings such as Extract Method and Replace Conditional with Polymorphism.',
      'Design a CI quality gate that blocks new problems without freezing a legacy codebase.',
    ],
    plainEnglish: `Tests tell you whether the code does what you checked. **Code quality tools** look for problems nobody wrote a test for.

- A **formatter** makes every file look the same, so reviews are about logic, not spaces.
- The **compiler's warnings** (\`javac -Xlint\`) point out risky constructs such as unchecked casts or a missing \`break\` in a switch.
- **Static analysers** (SpotBugs, PMD, Error Prone, Checkstyle, SonarQube) read your code without running it and recognise known bug patterns — like calling \`name.replace("-", "")\` and forgetting that Strings never change, so the result is thrown away.
- **Coverage** tools (JaCoCo) show which lines and branches your tests executed. Unexecuted code is definitely untested; executed code is not necessarily *checked*.
- **Mutation testing** (PIT) deliberately plants small bugs and asks: did any test notice?
- **Code review** is a human reading the change — still the best tool for design, naming and "is this the right thing to build?".

Together they form a safety net with many layers. No single layer catches everything; each is cheap compared with a bug in production.`,
    technical: `### Compiler warnings
\`javac -Xlint:all\` enables every lint category (\`unchecked\`, \`rawtypes\`, \`deprecation\`, \`removal\`, \`fallthrough\`, \`divzero\`, \`cast\`, \`serial\`, \`this-escape\` since 21…). \`-Werror\` turns warnings into errors, which stops them piling up. javac lints are deliberately conservative: none of the four bugs in the first example produces a warning.

### Static analysis tools
- **Error Prone** (Google): a javac plugin (\`-Xplugin:ErrorProne\`), so it reports at compile time with the compiler's full type information. Checks such as \`ReturnValueIgnored\`, \`EqualsIncompatibleType\`, \`StringEquality\` fail the build.
- **SpotBugs** (successor of FindBugs): analyses **bytecode**. Patterns such as \`RV_RETURN_VALUE_IGNORED\`, \`EC_UNRELATED_TYPES\`, \`ICAST_IDIV_CAST_TO_DOUBLE\`, \`ES_COMPARING_STRINGS_WITH_EQ\`, plus null-dereference and resource-leak detectors. FindSecBugs adds security rules.
- **PMD**: rules over the source AST (unused variables, empty catch blocks, overly complex methods) and **CPD**, its copy-paste detector.
- **Checkstyle**: conventions — naming, import order, Javadoc, line length. Style, not bugs.
- **SonarQube / SonarCloud**: a platform that runs its own analysers, imports coverage, tracks issues over time and enforces **quality gates**.
- IDE inspections (IntelliJ) run many of the same checks as you type.

### Formatters
**google-java-format** and Palantir Java Format rewrite code into one canonical layout. **Spotless** (Gradle/Maven plugin) wires a formatter into the build: \`spotlessApply\` fixes files, \`spotlessCheck\` fails CI on unformatted code. Format in a separate commit so diffs stay readable.

### Coverage with JaCoCo
JaCoCo instruments classes through a Java agent and reports counters: instructions, **lines**, **branches**, methods, classes and complexity. A line is fully covered when all its instructions ran; a **branch** is one outcome of an \`if\`, \`switch\`, \`&&\`, \`||\` or \`?:\`. \`return a && b;\` is one line with four branch outcomes — a single test gives 100% line coverage of it while half the branches stay untested. Coverage measures *execution*, not *verification*: a test with no assertions still raises it. Use it to find untested areas, not as a score to maximise; teams commonly set a floor (for example 70–80%) and focus on new code.

### Mutation testing with PIT
PIT (pitest) changes the bytecode in small ways — \`>=\` becomes \`>\` (conditionals boundary), \`==\` becomes \`!=\` (negate conditionals), \`return x\` becomes \`return 0\` or \`return true\`, a void call is removed — and reruns the tests covering that line. A **killed** mutant means some test failed; a **survived** mutant means the tests ran the code but did not check that behaviour. The **mutation score** (killed ÷ total) is a far better measure of test strength than coverage. It is slower, so run it on changed code or nightly.

### Complexity, smells and refactoring
**Cyclomatic complexity** (McCabe, 1976) = decision points + 1 (each \`if\`, loop, \`case\`, \`catch\`, \`&&\`, \`||\`, \`?:\`). It is the minimum number of tests needed to cover every independent path; methods above roughly 10 are hard to test and review. SonarSource's **cognitive complexity** additionally penalises nesting.

Common **code smells** (Fowler, *Refactoring*): Long Method, Large Class, Long Parameter List, Duplicated Code, Feature Envy, Primitive Obsession, Data Clumps, Shotgun Surgery, Repeated Switches. Matching refactorings: **Extract Method**, Extract Class, Introduce Parameter Object, Move Method, **Replace Conditional with Polymorphism** (one subclass or enum constant per branch). Refactor in small steps under green tests.

### Code review
Small changes (a few hundred lines at most), a clear description, automated checks green **before** a human looks, and reviewers focusing on design, correctness, naming, tests and security — not on formatting the tools already enforce. Comment on the code, not the author.

### CI quality gates
A pipeline step that fails the build when thresholds are broken: compile with \`-Werror\`, \`spotlessCheck\`, tests, JaCoCo minimum coverage, SpotBugs/PMD with zero high-priority findings, SonarQube gate. On legacy code apply the gate to **new code** only ("clean as you code"), so quality ratchets upward without a big-bang clean-up.`,
    whyItExists: `Humans are bad at spotting the same mistake for the thousandth time, and tests only check what someone thought to test. Tools encode decades of known bug patterns and apply them to every line on every commit for free, coverage shows where tests are missing, mutation testing shows where tests are weak, and gates stop quality from eroding one "just this once" merge at a time — leaving human reviewers free to think about design.`,
    whenToUse: [
      'Add a formatter and Error Prone or SpotBugs from the first commit of a new project; adding them later means fixing thousands of findings at once.',
      'Use JaCoCo reports to find untested packages and risky untested branches.',
      'Run PIT on core domain logic (pricing, permissions, money) where weak tests are expensive.',
      'Use a quality gate on new code to improve a legacy codebase gradually.',
      'Check complexity and duplication reports when choosing what to refactor next.',
    ],
    whenNotToUse: [
      'Do not chase 100% coverage; tests written for the number test getters and miss behaviour.',
      'Do not turn on every rule of every tool at once; noisy findings get ignored or suppressed wholesale.',
      'Do not argue about formatting in code review; let the formatter decide.',
      'Do not refactor without tests covering the behaviour you are about to move.',
    ],
    examples: [
      {
        id: 'ts-code-quality-bug-patterns',
        title: 'Four bugs static analysis flags (and javac does not)',
        runnable: true,
        code: `public class Main {
    public static void main(String[] args) {
        // 1. equals() across unrelated wrapper types
        Long orderId = 42L;
        Integer requestedId = 42;
        System.out.println("buggy equals: " + orderId.equals(requestedId));
        System.out.println("fixed equals: " + (orderId == requestedId.longValue()));

        // 2. Ignored return value: Strings are immutable
        String sku = "ab-12-x";
        sku.replace("-", "");
        System.out.println("buggy replace: " + sku);
        sku = sku.replace("-", "");
        System.out.println("fixed replace: " + sku);

        // 3. Integer division, then widening to double
        int passed = 7;
        int total = 8;
        double buggyRate = passed / total;
        double fixedRate = (double) passed / total;
        System.out.println("buggy rate: " + buggyRate);
        System.out.println("fixed rate: " + fixedRate);

        // 4. Comparing String contents with ==
        String expected = "ok";
        String actual = new String("ok");
        System.out.println("buggy ==: " + (expected == actual));
        System.out.println("fixed equals: " + expected.equals(actual));
    }
}`,
        expectedOutput: `buggy equals: false
fixed equals: true
buggy replace: ab-12-x
fixed replace: ab12x
buggy rate: 0.0
fixed rate: 0.875
buggy ==: false
fixed equals: true`,
        explanation: 'All four bugs compile cleanly, even with javac -Xlint:all. Error Prone (EqualsIncompatibleType, ReturnValueIgnored, StringEquality) and SpotBugs (EC_UNRELATED_TYPES, RV_RETURN_VALUE_IGNORED, ICAST_IDIV_CAST_TO_DOUBLE, ES_COMPARING_STRINGS_WITH_EQ) report every one of them.',
      },
      {
        id: 'ts-code-quality-mutation',
        title: 'Coverage is 100%, yet a bug survives: mutation testing by hand',
        runnable: true,
        code: `import java.util.List;
import java.util.function.IntPredicate;

public class Main {
    // Production rule: customers aged 18 or over may buy.
    static boolean canBuy(int age) {
        return age >= 18;
    }

    record Mutant(String name, IntPredicate rule) {}

    static boolean suitePasses(IntPredicate rule, int[] ages, boolean[] expected) {
        for (int i = 0; i < ages.length; i++) {
            if (rule.test(ages[i]) != expected[i]) return false;
        }
        return true;
    }

    static void report(String title, List<Mutant> mutants, int[] ages, boolean[] expected) {
        System.out.println(title);
        int killed = 0;
        for (Mutant m : mutants) {
            boolean survived = suitePasses(m.rule(), ages, expected);
            if (!survived) killed++;
            System.out.println("  " + m.name() + " -> " + (survived ? "SURVIVED" : "KILLED"));
        }
        System.out.println("  mutation score: " + killed + "/" + mutants.size());
    }

    public static void main(String[] args) {
        List<Mutant> mutants = List.of(
                new Mutant("boundary: age > 18", age -> age > 18),
                new Mutant("negated: age < 18", age -> age < 18),
                new Mutant("true return", age -> true));

        int[] weakAges = {30, 5};
        boolean[] weakExpected = {true, false};
        int[] strongAges = {30, 5, 18, 17};
        boolean[] strongExpected = {true, false, true, false};

        System.out.println("original passes weak suite: " + suitePasses(Main::canBuy, weakAges, weakExpected));
        report("weak suite {30, 5} - 100% line and branch coverage", mutants, weakAges, weakExpected);
        report("strong suite {30, 5, 18, 17}", mutants, strongAges, strongExpected);
    }
}`,
        expectedOutput: `original passes weak suite: true
weak suite {30, 5} - 100% line and branch coverage
  boundary: age > 18 -> SURVIVED
  negated: age < 18 -> KILLED
  true return -> KILLED
  mutation score: 2/3
strong suite {30, 5, 18, 17}
  boundary: age > 18 -> KILLED
  negated: age < 18 -> KILLED
  true return -> KILLED
  mutation score: 3/3`,
        explanation: 'The three mutants mirror PIT\'s default CONDITIONALS_BOUNDARY, NEGATE_CONDITIONALS and TRUE_RETURNS mutators. Tests at 30 and 5 execute both outcomes of age >= 18, so JaCoCo reports full coverage, but nothing checks the boundary: the off-by-one mutant survives until tests at 18 and 17 are added.',
      },
      {
        id: 'ts-code-quality-complexity',
        title: 'A tiny cyclomatic-complexity counter and quality gate',
        runnable: true,
        code: String.raw`import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Main {
    // McCabe: one path through the method, plus one per decision point.
    private static final Pattern DECISION =
            Pattern.compile("\\b(if|for|while|case|catch)\\b|&&|\\|\\||\\?");

    static int complexity(String methodSource) {
        Matcher m = DECISION.matcher(methodSource);
        int decisions = 0;
        while (m.find()) decisions++;
        return decisions + 1;
    }

    static void gate(String name, String source, int limit) {
        int c = complexity(source);
        System.out.println(name + ": complexity " + c + (c <= limit ? " PASS" : " FAIL") + " (limit " + limit + ")");
    }

    public static void main(String[] args) {
        String before = """
            double shipping(String zone, double kg, boolean express) {
                if (zone.equals("home")) {
                    if (kg < 1) return express ? 9 : 4;
                    else return express ? 14 : 7;
                } else if (zone.equals("eu")) {
                    if (kg < 1 && !express) return 8;
                    return express ? 30 : 15;
                } else if (zone.equals("world")) {
                    return express ? 60 : 25;
                }
                throw new IllegalArgumentException(zone);
            }
            """;
        String after = """
            double shipping(Zone zone, double kg, boolean express) {
                double base = zone.baseRate(kg);
                return express ? base * 2 : base;
            }
            """;
        String simplest = """
            int add(int a, int b) { return a + b; }
            """;
        gate("add", simplest, 10);
        gate("shipping (nested ifs)", before, 10);
        gate("shipping (polymorphic Zone)", after, 10);
    }
}`,
        expectedOutput: `add: complexity 1 PASS (limit 10)
shipping (nested ifs): complexity 11 FAIL (limit 10)
shipping (polymorphic Zone): complexity 2 PASS (limit 10)`,
        explanation: 'Real tools count on the syntax tree or bytecode rather than with a regex, but the rule is the same: decisions + 1. Moving the per-zone branches into an enum Zone with a baseRate method per constant (Replace Conditional with Polymorphism) leaves the caller with one decision; each constant\'s method is small and testable on its own.',
      },
      {
        id: 'ts-code-quality-gradle',
        title: 'Wiring the tools into a Gradle build (Kotlin DSL)',
        runnable: false,
        code: `plugins {
    java
    jacoco
    id("com.diffplug.spotless") version "7.0.2"
    id("com.github.spotbugs") version "6.1.7"
    id("net.ltgt.errorprone") version "4.1.0"
    id("info.solidsoft.pitest") version "1.15.0"
}

dependencies {
    errorprone("com.google.errorprone:error_prone_core:2.36.0")
}

tasks.withType<JavaCompile>().configureEach {
    options.compilerArgs.addAll(listOf("-Xlint:all", "-Werror"))
}

spotless {
    java { googleJavaFormat() }
}

tasks.jacocoTestReport {
    dependsOn(tasks.test)
    reports { xml.required = true }  // SonarQube imports the XML report
}

tasks.jacocoTestCoverageVerification {
    violationRules {
        rule {
            limit { counter = "BRANCH"; minimum = "0.70".toBigDecimal() }
        }
    }
}

pitest {
    targetClasses = setOf("com.example.pricing.*")
    junit5PluginVersion = "1.2.1"
    mutationThreshold = 75
}

tasks.check {
    dependsOn(tasks.spotlessCheck, tasks.jacocoTestCoverageVerification)
}`,
        explanation: 'Plugin versions are illustrative — check each project\'s releases. ./gradlew check now fails on formatting, compiler warnings, Error Prone errors, SpotBugs findings and branch coverage below 70%. PIT runs separately (./gradlew pitest) because it is slower. Maven has equivalent plugins (spotless-maven-plugin, spotbugs-maven-plugin, jacoco-maven-plugin, pitest-maven).',
      },
    ],
    walkthrough: {
      exampleId: 'ts-code-quality-bug-patterns',
      steps: [
        { lines: [3, 7], text: '`Long.equals(Object)` accepts anything, so comparing a Long with an Integer compiles — and is always false, because equals first checks the class. Error Prone\'s EqualsIncompatibleType and SpotBugs\' EC_UNRELATED_TYPES flag it. The fix compares the primitive values.' },
        { lines: [9, 14], text: 'Strings are immutable: `replace` returns a new String. Calling it as a statement throws the result away. Analysers know which JDK methods are pure and flag the ignored return value; the fix assigns the result.' },
        { lines: [16, 22], text: '`passed / total` is evaluated in int arithmetic (7 / 8 = 0) and only then widened to 0.0. SpotBugs reports ICAST_IDIV_CAST_TO_DOUBLE. Casting one operand first makes the division happen in double.' },
        { lines: [24, 28], text: '`new String("ok")` is a distinct object, so `==` (identity) is false even though the contents match. Use `equals` for content. Every one of these lines compiles without a single javac warning — that gap is why static analysers exist.' },
      ],
    },
    realWorld: {
      title: 'Ninety-four percent coverage and a refund bug',
      scenario: `A payments team proudly kept JaCoCo coverage above 94%. A bug still shipped: refunds of exactly the original amount were rejected because a check used \`>\` where \`>=\` was intended. The tests ran that line with amounts well below and well above the limit — full branch coverage, no boundary.

Running PIT on the refunds package showed a mutation score of 58%: dozens of surviving boundary and return-value mutants, plus several tests with no assertions at all that existed only to raise coverage. The team added boundary tests, deleted the assertion-free tests, and changed their CI gate from "overall coverage ≥ 90%" to "branch coverage ≥ 80% **on new code**, no new SpotBugs high-priority findings, and PIT ≥ 75% on the pricing and refunds packages". Overall coverage dropped slightly; escaped defects dropped a lot.`,
    },
    commonMistakes: [
      {
        mistake: 'Treating a coverage percentage as proof that the code is tested.',
        why: 'Coverage records which code ran, not whether any assertion checked its result. Assertion-free tests and missing boundary cases both look like "covered".',
        fix: 'Read coverage reports for gaps; measure test strength with mutation testing on important packages.',
      },
      {
        mistake: 'Ignoring the return value of methods on immutable types.',
        why: '`s.trim()`, `s.replace(...)`, `bigDecimal.add(...)`, `localDate.plusDays(1)` return new objects; the original never changes.',
        fix: 'Assign the result, and enable Error Prone or SpotBugs so the build fails on ignored return values.',
        code: `LocalDate due = start;
due.plusDays(30);        // bug: result discarded
due = due.plusDays(30);  // fix`,
      },
      {
        mistake: 'Turning on every rule of every analyser at once on a large legacy codebase.',
        why: 'Thousands of findings appear; the team suppresses them wholesale or disables the tool, and the real bugs drown in noise.',
        fix: 'Start with high-confidence bug rules, fail the build only on new findings (a baseline), and widen the rule set gradually.',
      },
      {
        mistake: 'Mixing formatting changes into a feature pull request.',
        why: 'Reviewers cannot see the real change among hundreds of whitespace edits, so bugs slip through review.',
        fix: 'Apply the formatter in its own commit or PR, then enforce it with spotlessCheck in CI.',
      },
      {
        mistake: 'Refactoring a complex method without tests first.',
        why: 'Extract Method and Replace Conditional with Polymorphism are behaviour-preserving only if you can prove the behaviour is preserved.',
        fix: 'Write characterisation tests that pin the current outputs, then refactor in small steps with the tests green after each one.',
      },
    ],
    checks: [
      {
        id: 'ts4-c1',
        kind: 'mcq',
        dimension: 'conceptual',
        prompt: 'Which tool finds bug patterns by analysing compiled `.class` files (bytecode) rather than source code?',
        options: [
          { id: 'a', text: 'Checkstyle' },
          { id: 'b', text: 'SpotBugs' },
          { id: 'c', text: 'google-java-format' },
          { id: 'd', text: 'JaCoCo' },
        ],
        correctOptionId: 'b',
        explanation: 'SpotBugs (the successor of FindBugs) analyses bytecode. Checkstyle checks source conventions, google-java-format rewrites layout, and JaCoCo measures coverage while tests run.',
      },
      {
        id: 'ts4-c2',
        kind: 'predict-output',
        dimension: 'debugging',
        prompt: 'Both bugs here compile without warnings. What is printed?',
        code: `public class Main {
    public static void main(String[] args) {
        String tag = "v1.0-beta";
        tag.replace("-beta", "");
        Long count = 3L;
        System.out.println(tag + " " + count.equals(3));
    }
}`,
        options: [
          { id: 'a', text: 'v1.0 true' },
          { id: 'b', text: 'v1.0-beta true' },
          { id: 'c', text: 'v1.0-beta false' },
          { id: 'd', text: 'v1.0 false' },
        ],
        correctOptionId: 'c',
        explanation: 'The result of replace is discarded, so tag is unchanged. The literal 3 is boxed to Integer, and Long.equals returns false for any non-Long argument. Error Prone flags both (ReturnValueIgnored, EqualsIncompatibleType).',
      },
      {
        id: 'ts4-c3',
        kind: 'predict-output',
        dimension: 'coding',
        prompt: 'A pass-rate calculation, written two ways. What is printed?',
        code: `public class Main {
    public static void main(String[] args) {
        int passed = 7;
        int total = 8;
        System.out.println(passed / total * 100 + "% vs " + passed * 100 / total + "%");
    }
}`,
        options: [
          { id: 'a', text: '87% vs 87%' },
          { id: 'b', text: '0% vs 87%' },
          { id: 'c', text: '87.5% vs 87.5%' },
          { id: 'd', text: '0% vs 0%' },
        ],
        correctOptionId: 'b',
        explanation: 'Integer division truncates: 7 / 8 is 0, and 0 * 100 is 0. Multiplying first gives 700 / 8 = 87 (still truncated). Analysers flag integer division whose result is later used as a ratio or percentage.',
      },
      {
        id: 'ts4-c4',
        kind: 'mcq',
        dimension: 'conceptual',
        prompt: 'What is the cyclomatic complexity of this method?',
        code: `String grade(int score, boolean late) {
    if (score < 0 || score > 100) throw new IllegalArgumentException();
    if (late) score -= 10;
    return score >= 50 ? "pass" : "fail";
}`,
        options: [
          { id: 'a', text: '3' },
          { id: 'b', text: '4' },
          { id: 'c', text: '5' },
          { id: 'd', text: '6' },
        ],
        correctOptionId: 'c',
        explanation: 'Decision points: the first if, the ||, the second if and the ?: operator — four decisions, plus one for the single path through a straight-line method, gives 5.',
      },
      {
        id: 'ts4-c5',
        kind: 'multi-select',
        dimension: 'interview',
        prompt: 'JaCoCo reports 100% **line** coverage for a class. Which of these can still be true? Select all that apply.',
        options: [
          { id: 'a', text: 'A boundary value such as exactly 18 is never tested' },
          { id: 'b', text: 'Some tests contain no assertions' },
          { id: 'c', text: 'One outcome of `return a && b;` was never exercised' },
          { id: 'd', text: 'A line in the class was never executed' },
        ],
        correctOptionIds: ['a', 'b', 'c'],
        explanation: 'Line coverage only records execution. Boundaries and assertions are about verification, and a single line can contain several branches. Only (d) contradicts 100% line coverage.',
      },
      {
        id: 'ts4-c6',
        kind: 'mcq',
        dimension: 'interview',
        prompt: 'In PIT, a mutant that changes `>=` to `>` **survives**. What does that tell you?',
        options: [
          { id: 'a', text: 'The mutated line is not covered by any test' },
          { id: 'b', text: 'The tests ran the line but none of them checks the boundary value' },
          { id: 'c', text: 'The production code has a bug' },
          { id: 'd', text: 'PIT could not compile the mutant' },
        ],
        correctOptionId: 'b',
        explanation: 'PIT reports uncovered mutants separately as NO_COVERAGE. A survivor was executed by tests that still passed, so nothing distinguishes >= from > — add a test at the boundary.',
      },
      {
        id: 'ts4-c7',
        kind: 'mcq',
        dimension: 'conceptual',
        prompt: 'A legacy service has 35% coverage and 2,000 static-analysis findings. Which CI quality gate is most likely to improve it?',
        options: [
          { id: 'a', text: 'Fail every build until overall coverage reaches 90% and findings reach zero' },
          { id: 'b', text: 'No gate; quality tools only slow teams down' },
          { id: 'c', text: 'Apply thresholds to new and changed code (e.g. 80% branch coverage, no new high-priority findings) so quality ratchets upward' },
          { id: 'd', text: 'Exclude the legacy packages from analysis permanently' },
        ],
        correctOptionId: 'c',
        explanation: 'A new-code gate ("clean as you code") is achievable on every pull request, and the code people touch most gets better first. A big-bang target blocks all work and usually ends with the gate being switched off.',
      },
    ],
    challengeIds: [],
    masteryCriteria: [
      'Match a finding (ignored return value, unrelated equals, style violation, duplicated block) to the tool category most likely to catch it.',
      'Explain the difference between line and branch coverage with a one-line example.',
      'Interpret a PIT report and write the test that kills a surviving boundary mutant.',
      'Compute the cyclomatic complexity of a short method and propose a refactoring to reduce it.',
      'Propose a CI quality gate for both a new project and a legacy codebase.',
    ],
    relatedLessonIds: ['ts-junit', 'ts-mocking', 'ts-debugging', 'd-solid', 'd-patterns', 'o-polymorphism-types', 't-strings', 'sp-testing'],
    revision: [
      { id: 'r1', question: 'Name five static-analysis tools for Java and what each focuses on.', answer: 'Error Prone (javac plugin, bug patterns at compile time), SpotBugs (bytecode bug patterns), PMD (source rules and CPD duplicate detection), Checkstyle (style and conventions), SonarQube (platform: issues, coverage, quality gates over time).' },
      { id: 'r2', question: 'Why is 100% coverage not the goal?', answer: 'Coverage measures execution, not verification. Tests written to raise the number check little, and the last few percent are usually trivial code. Use coverage to find gaps and mutation testing to judge test strength.' },
      { id: 'r3', question: 'What is a surviving mutant?', answer: 'A deliberately injected change (e.g. >= to >) that no test detected: the tests executed the code but did not check that behaviour.' },
      { id: 'r4', question: 'How do you compute cyclomatic complexity?', answer: 'Count decision points — if, loops, case, catch, &&, ||, ?: — and add 1. It equals the number of independent paths, a lower bound on the tests needed to cover them.' },
      { id: 'r5', question: 'What does Replace Conditional with Polymorphism do?', answer: 'Moves each branch of a type-based if/switch into its own subclass or enum-constant method, so callers make one polymorphic call and new cases are added without editing the conditional.' },
    ],
  },
  {
    id: 'sp-testing',
    moduleId: 'spring',
    title: 'Testing Spring Boot applications',
    summary: 'Plain unit tests through constructor injection, @SpringBootTest, test slices (@WebMvcTest, @DataJpaTest, @JsonTest, @RestClientTest), MockMvc, @MockitoBean, Testcontainers with @ServiceConnection, profiles, and context caching.',
    estimatedMinutes: 50,
    difficulty: 'advanced',
    prerequisites: ['sp-rest', 'ts-mocking'],
    versionNotes: [
      { feature: '@ServiceConnection for Testcontainers', since: 17, note: 'Spring Boot 3.1+' },
      { feature: '@MockitoBean and @MockitoSpyBean in spring-test, replacing Boot\'s @MockBean/@SpyBean', since: 17, note: 'Spring Framework 6.2 (Boot 3.4); @MockBean deprecated in Boot 3.4 and removed in Boot 4' },
      { feature: 'MockMvcTester (AssertJ-style MockMvc)', since: 17, note: 'Spring Framework 6.2' },
    ],
    objectives: [
      'Test service logic as plain Java by passing fakes through the constructor, with no Spring context.',
      'Choose between @SpringBootTest and a test slice (@WebMvcTest, @DataJpaTest, @JsonTest, @RestClientTest) for a given test.',
      'Write MockMvc tests for status codes, JSON bodies and validation errors, replacing collaborators with @MockitoBean.',
      'Run repository and end-to-end tests against a real database with Testcontainers and @ServiceConnection.',
      'Explain the test context cache, what makes it miss, and why @DirtiesContext and scattered @MockitoBean slow suites down.',
    ],
    plainEnglish: `A Spring Boot app is ordinary Java classes wired together by Spring. That gives you three kinds of test:

- **Plain unit tests** — call \`new OrderService(fakeRepo, fakeMailer)\` yourself. No Spring, runs in milliseconds. Because Spring beans use **constructor injection**, nothing special is needed: Spring calls the same constructor in production.
- **Slice tests** — start only one layer of Spring. \`@WebMvcTest\` starts the web layer so you can send fake HTTP requests to your controller with **MockMvc**; \`@DataJpaTest\` starts JPA and a database so you can test repository queries.
- **Full integration tests** — \`@SpringBootTest\` starts the whole application, often with a real PostgreSQL in Docker via **Testcontainers**.

Starting Spring takes seconds, so Spring's test framework **caches** each started application and reuses it for every test class with the same configuration. Keeping configurations identical keeps the suite fast.`,
    technical: `### Unit tests first
Business rules belong in services that receive their collaborators through the constructor. Test them with \`new\`, fakes, or Mockito's \`@Mock\` — no \`@SpringBootTest\`. Field injection (\`@Autowired private Repo repo\`) is what forces people to start Spring just to set a field.

### @SpringBootTest
Finds the \`@SpringBootConfiguration\` (your \`@SpringBootApplication\` class) and starts the full context. \`webEnvironment = MOCK\` (default) gives a mock servlet environment for MockMvc (add \`@AutoConfigureMockMvc\`); \`RANDOM_PORT\` starts a real server for HTTP clients such as \`TestRestTemplate\`, \`WebTestClient\` or, in Spring Framework 7, \`RestTestClient\`. With a real server, a test-level \`@Transactional\` does **not** roll back what the server thread did.

### Test slices
Each slice auto-configures only one layer and limits component scanning:
- \`@WebMvcTest(BookController.class)\`: controllers, \`@ControllerAdvice\`, Jackson, converters, filters, \`WebMvcConfigurer\`, plus \`MockMvc\`. **No** \`@Service\`/\`@Repository\` beans — supply them with \`@MockitoBean\`. \`@WebFluxTest\` is the reactive equivalent.
- \`@DataJpaTest\`: entities, repositories, \`EntityManager\`/\`TestEntityManager\`, Flyway/Liquibase. Each test runs in a transaction rolled back at the end. By default it replaces the DataSource with an embedded database; keep a real one with \`@AutoConfigureTestDatabase(replace = Replace.NONE)\`. Also \`@JdbcTest\`, \`@DataJdbcTest\`, \`@DataMongoTest\`…
- \`@JsonTest\`: Jackson configuration and \`JacksonTester\` for exact JSON (de)serialisation.
- \`@RestClientTest\`: \`RestClient.Builder\`/\`RestTemplateBuilder\` with \`MockRestServiceServer\` for code that calls other services.

Spring Boot 4 moved the slice annotations into per-technology test modules, so their package names differ from Boot 3; the behaviour is the same.

### MockMvc
Drives the real \`DispatcherServlet\` — request mapping, validation, message conversion, exception handlers — without a network: \`mvc.perform(get("/api/books/42")).andExpect(status().isOk()).andExpect(jsonPath("$.title").value("Effective Java"))\`. Since Spring Framework 6.2, \`MockMvcTester\` offers the same with AssertJ assertions.

### Replacing beans: @MockitoBean
\`@MockitoBean BookService books;\` (package \`org.springframework.test.context.bean.override.mockito\`, Spring Framework 6.2+) replaces or adds a Mockito mock in the context; \`@MockitoSpyBean\` wraps the real bean. They supersede Spring Boot's \`@MockBean\`/\`@SpyBean\`, deprecated in Boot 3.4 and removed in Boot 4. Mocks are reset after each test.

### Testcontainers and @ServiceConnection
Testcontainers starts real PostgreSQL, Kafka or Redis in Docker. Since Boot 3.1, annotating the container with \`@ServiceConnection\` makes Boot read its host, port and credentials automatically — no \`@DynamicPropertySource\` boilerplate. Declare containers as \`static\` fields or as \`@Bean\` methods in a shared \`@TestConfiguration\` so every test class sees the same configuration.

### Test configuration and profiles
\`@ActiveProfiles("test")\` activates \`application-test.yml\`; \`@TestPropertySource\` or \`@SpringBootTest(properties = ...)\` set individual properties; \`@DynamicPropertySource\` supplies values known only at run time. A nested \`static @TestConfiguration\` class adds beans to the test's context; a top-level one is applied with \`@Import\`.

### Context caching
The TestContext framework caches each application context keyed by its **merged configuration**: configuration classes, active profiles, property sources, context customizers (which include \`@MockitoBean\` definitions and \`@DynamicPropertySource\`) and more. Same key ⇒ reused context; any difference ⇒ a new context, costing seconds and memory (default cache size 32, least recently used evicted). \`@DirtiesContext\` closes the context after the class or method, so the next test pays for a fresh start. Fast suites standardise on a few shared configurations, often via an abstract base test class.`,
    whyItExists: `Spring applications fail in two different places: in plain logic, and in the wiring — mappings, validation, JSON shape, SQL, transactions, configuration. Plain unit tests are the cheapest way to check logic; Spring's test support (slices, MockMvc, bean overriding, Testcontainers integration and context caching) exists so the wiring can be checked too, with only as much of the application started as each test needs.`,
    whenToUse: [
      'Plain unit tests for service and domain rules — the majority of tests.',
      '@WebMvcTest for request mapping, validation, status codes, error bodies and security rules of controllers.',
      '@DataJpaTest with Testcontainers for custom queries, mappings, constraints and migrations.',
      '@JsonTest when the exact JSON contract matters (dates, nulls, naming).',
      '@SpringBootTest for a handful of end-to-end paths that prove the whole application starts and the layers work together.',
    ],
    whenNotToUse: [
      'Do not use @SpringBootTest to test a calculation in a service; construct the service directly.',
      'Do not add @DirtiesContext "just in case"; clean up data instead (transactions, truncation) and keep the cached context.',
      'Do not declare a different set of @MockitoBean fields in every test class; each combination is a new context.',
      'Do not test repositories against H2 when production runs PostgreSQL; dialect and constraint behaviour differ.',
    ],
    examples: [
      {
        id: 'sp-testing-plain-unit',
        title: 'Unit-testing a Spring service with hand-written fakes (no Spring needed)',
        runnable: true,
        code: `import java.time.*;
import java.util.*;

record User(String email, Instant registeredAt) {}

interface UserRepository {
    boolean existsByEmail(String email);
    void save(User user);
}

interface WelcomeMailer {
    void sendWelcome(String email);
}

// In the real app this is a @Service; Spring calls the same constructor.
class RegistrationService {
    private final UserRepository users;
    private final WelcomeMailer mailer;
    private final Clock clock;

    RegistrationService(UserRepository users, WelcomeMailer mailer, Clock clock) {
        this.users = users;
        this.mailer = mailer;
        this.clock = clock;
    }

    User register(String rawEmail) {
        String email = rawEmail.trim().toLowerCase(Locale.ROOT);
        if (users.existsByEmail(email)) throw new IllegalStateException("email taken: " + email);
        User user = new User(email, Instant.now(clock));
        users.save(user);
        mailer.sendWelcome(email);
        return user;
    }
}

class InMemoryUsers implements UserRepository {
    final Map<String, User> rows = new LinkedHashMap<>();
    public boolean existsByEmail(String email) { return rows.containsKey(email); }
    public void save(User user) { rows.put(user.email(), user); }
}

public class Main {
    static final Clock FIXED = Clock.fixed(Instant.parse("2025-01-15T10:00:00Z"), ZoneOffset.UTC);
    static int passed, failed;

    static void check(String name, boolean ok) {
        System.out.println((ok ? "PASS " : "FAIL ") + name);
        if (ok) passed++; else failed++;
    }

    public static void main(String[] args) {
        // Test 1: normalises the email and stamps the injected time
        InMemoryUsers users = new InMemoryUsers();
        List<String> sent = new ArrayList<>();
        RegistrationService service = new RegistrationService(users, sent::add, FIXED);
        User ada = service.register("  Ada@Example.com ");
        check("normalises email", ada.email().equals("ada@example.com"));
        check("uses injected clock", ada.registeredAt().toString().equals("2025-01-15T10:00:00Z"));
        check("sends one welcome mail", sent.equals(List.of("ada@example.com")));

        // Test 2: duplicate registration is rejected and sends nothing
        try {
            service.register("ADA@example.com");
            check("rejects duplicate", false);
        } catch (IllegalStateException e) {
            check("rejects duplicate", e.getMessage().equals("email taken: ada@example.com"));
        }
        check("no second mail", sent.size() == 1 && users.rows.size() == 1);

        System.out.println(passed + " passed, " + failed + " failed");
    }
}`,
        expectedOutput: `PASS normalises email
PASS uses injected clock
PASS sends one welcome mail
PASS rejects duplicate
PASS no second mail
5 passed, 0 failed`,
        explanation: 'A tiny hand-rolled runner stands in for JUnit. The point is the shape: a fake repository, a lambda as a recording mailer and a fixed Clock go in through the constructor, so the service\'s rules are tested in microseconds with no Spring context, database or SMTP server.',
      },
      {
        id: 'sp-testing-webmvc',
        title: '@WebMvcTest with MockMvc and @MockitoBean',
        runnable: false,
        code: `import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(BookController.class)
class BookControllerTest {

    @Autowired MockMvc mvc;

    @MockitoBean BookService books;

    @Test
    void returnsBookAsJson() throws Exception {
        given(books.find(42L)).willReturn(Optional.of(new BookDto(42L, "Effective Java")));

        mvc.perform(get("/api/books/42"))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.title").value("Effective Java"));
    }

    @Test
    void unknownBookIs404() throws Exception {
        given(books.find(7L)).willReturn(Optional.empty());

        mvc.perform(get("/api/books/7"))
           .andExpect(status().isNotFound());
    }

    @Test
    void blankTitleIs400() throws Exception {
        mvc.perform(post("/api/books")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"title": ""}
                    """))
           .andExpect(status().isBadRequest());
    }
}`,
        explanation: 'Needs spring-boot-starter-test. Imports are for Spring Boot 3.4/3.5; Boot 4 moved @WebMvcTest into a web-MVC test module with a new package, so let your IDE resolve it. Only the web layer starts; BookService is a Mockito mock registered as a bean, so the test checks mapping, JSON, 404 handling and @Valid without touching the database.',
      },
      {
        id: 'sp-testing-datajpa',
        title: '@DataJpaTest against real PostgreSQL with @ServiceConnection',
        runnable: false,
        code: `import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
class BookRepositoryTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired BookRepository repository;

    @Test
    void findsBooksByAuthorIgnoringCase() {
        repository.save(new Book("Effective Java", "Joshua Bloch"));
        repository.save(new Book("Java Concurrency in Practice", "Brian Goetz"));

        assertThat(repository.findByAuthorIgnoreCase("joshua bloch"))
            .extracting(Book::getTitle)
            .containsExactly("Effective Java");
    }
}`,
        explanation: 'Needs spring-boot-testcontainers, the Testcontainers JUnit and PostgreSQL modules, and Docker. @ServiceConnection replaces manual spring.datasource.* properties; Replace.NONE tells the slice not to swap in an embedded database. Every test method runs in a transaction that is rolled back, so tests do not see each other\'s rows. (Testcontainers 2.x moved PostgreSQLContainer to the org.testcontainers.postgresql package.)',
      },
      {
        id: 'sp-testing-full',
        title: 'A shared full-application integration test',
        runnable: false,
        code: `import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.testcontainers.containers.PostgreSQLContainer;

@TestConfiguration(proxyBeanMethods = false)
class TestcontainersConfig {
    @Bean
    @ServiceConnection
    PostgreSQLContainer<?> postgres() {
        return new PostgreSQLContainer<>("postgres:16-alpine");
    }
}

// Every integration test extends this, so they all share ONE cached context.
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@Import(TestcontainersConfig.class)
abstract class IntegrationTest {
    @MockitoBean protected PaymentGateway payments;  // external system, mocked everywhere
}

class CheckoutFlowIT extends IntegrationTest {
    @Autowired TestRestTemplate rest;

    @Test
    void checkoutCreatesPaidOrder() {
        given(payments.charge(anyString(), anyLong())).willReturn(true);

        var response = rest.postForEntity("/api/orders",
                new CreateOrder("ada", "book-42", 1), OrderDto.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody().status()).isEqualTo("PAID");
    }
}`,
        explanation: 'Boot 3.4/3.5 imports (in Boot 4, TestRestTemplate needs @AutoConfigureTestRestTemplate, or use RestTestClient). The real app starts on a random port against PostgreSQL in Docker; only the external payment provider is mocked. Putting the @MockitoBean, profile and container in one base class keeps the context cache key identical for every integration test.',
      },
      {
        id: 'sp-testing-context-cache',
        title: 'How the test context cache decides to reuse or restart',
        runnable: true,
        code: `import java.util.*;

public class Main {
    // Simplified MergedContextConfiguration: what Spring uses as the cache key.
    record ContextKey(String config, Set<String> profiles, Set<String> mockBeans, Map<String, String> props) {}

    static final Map<ContextKey, Integer> cache = new LinkedHashMap<>();
    static int contextsStarted = 0;

    static void runTestClass(String name, ContextKey key, boolean dirtiesContext) {
        Integer id = cache.get(key);
        String how = "reused context #" + id;
        if (id == null) {
            id = ++contextsStarted;
            cache.put(key, id);
            how = "STARTED context #" + id;
        }
        System.out.println(name + ": " + how);
        if (dirtiesContext) {
            cache.remove(key);
            System.out.println("  @DirtiesContext -> context #" + id + " closed");
        }
    }

    public static void main(String[] args) {
        ContextKey shared = new ContextKey("App", Set.of("test"), Set.of(), Map.of());
        runTestClass("OrderApiIT", shared, false);
        runTestClass("CustomerApiIT", shared, false);
        runTestClass("PaymentApiIT", new ContextKey("App", Set.of("test"), Set.of("PaymentGateway"), Map.of()), false);
        runTestClass("FeatureFlagIT", new ContextKey("App", Set.of("test"), Set.of(), Map.of("flags.beta", "true")), false);
        runTestClass("CacheResetIT", shared, true);
        runTestClass("ReportApiIT", shared, false);
        System.out.println("test classes: 6, contexts started: " + contextsStarted);
    }
}`,
        expectedOutput: `OrderApiIT: STARTED context #1
CustomerApiIT: reused context #1
PaymentApiIT: STARTED context #2
FeatureFlagIT: STARTED context #3
CacheResetIT: reused context #1
  @DirtiesContext -> context #1 closed
ReportApiIT: STARTED context #4
test classes: 6, contexts started: 4`,
        explanation: 'A model of the TestContext cache: the key is a value (a record with equals/hashCode), so identical configuration means a cache hit. One extra @MockitoBean or one extra property creates a new key and a new multi-second start-up, and @DirtiesContext throws away a context that later classes then rebuild.',
      },
    ],
    walkthrough: {
      exampleId: 'sp-testing-plain-unit',
      steps: [
        { lines: [6, 13], text: 'The service depends on two interfaces it owns — the seams. In production Spring supplies a JPA repository and an SMTP mailer; in the test we supply our own.' },
        { lines: [16, 25], text: 'Constructor injection: all collaborators, including the Clock, arrive through the constructor and are final. This is exactly what Spring calls at start-up, and exactly what a test can call with `new`.' },
        { lines: [27, 34], text: 'The behaviour under test: normalise, reject duplicates, save, send a welcome mail. No annotations are involved, so nothing needs Spring to run.' },
        { lines: [37, 41], text: 'A fake repository: a working in-memory implementation. It keeps real state, so "save then exists" behaves like the database would.' },
        { lines: [53, 60], text: 'Arrange and act: the mailer is a method reference that records addresses (a spy), and the fixed Clock makes the timestamp deterministic. Three state-based checks follow.' },
        { lines: [62, 69], text: 'The failure path: the duplicate is detected after normalisation, the exception message is checked, and the fakes prove no second mail or row was produced.' },
      ],
    },
    realWorld: {
      title: 'From 19 minutes to 4',
      scenario: `A team's Spring Boot service had 600 tests, almost all annotated \`@SpringBootTest\`, and CI took 19 minutes. The logs showed 41 application contexts being started: test classes each declared a different mix of \`@MockBean\` fields, a few set a one-off property with \`@TestPropertySource\`, and 12 classes used \`@DirtiesContext\` to "be safe".

They moved pure business-rule tests to plain unit tests constructed with \`new\` (about 350 tests, now running in under three seconds total), turned controller tests into \`@WebMvcTest\` slices, and put every remaining integration test behind one abstract base class with a single \`@MockitoBean\` set, one profile and a shared PostgreSQL Testcontainer via \`@ServiceConnection\`. \`@DirtiesContext\` was replaced by truncating tables in \`@AfterEach\`. Contexts started dropped from 41 to 5 and the suite ran in four minutes — and the H2-to-PostgreSQL switch found two native queries that had never worked in production-like SQL.`,
    },
    commonMistakes: [
      {
        mistake: 'Starting the whole application to test a service method.',
        why: '@SpringBootTest costs seconds per new context and couples a logic test to configuration, databases and every other bean.',
        fix: 'Construct the service with new and pass fakes or Mockito mocks; keep @SpringBootTest for a few end-to-end paths.',
      },
      {
        mistake: 'Expecting @WebMvcTest to load @Service beans.',
        why: 'The slice only scans web components, so the context fails with NoSuchBeanDefinitionException for the controller\'s dependencies.',
        fix: 'Declare the controller\'s collaborators with @MockitoBean (or import a test configuration that provides them).',
        code: `@WebMvcTest(BookController.class)
class BookControllerTest {
    @Autowired MockMvc mvc;
    @MockitoBean BookService books;  // required: services are not in the slice
}`,
      },
      {
        mistake: 'Still using @MockBean in new code.',
        why: 'Spring Boot deprecated @MockBean and @SpyBean in 3.4 in favour of spring-test\'s @MockitoBean and @MockitoSpyBean (Spring Framework 6.2), and Boot 4 removed them.',
        fix: 'Use org.springframework.test.context.bean.override.mockito.MockitoBean / MockitoSpyBean.',
      },
      {
        mistake: 'Sprinkling @DirtiesContext and per-class @MockitoBean combinations across the suite.',
        why: 'Each distinct configuration is a separate cached context, and @DirtiesContext forces a rebuild; suites slow down linearly with the number of variations.',
        fix: 'Standardise on a shared base class, reset state by cleaning data, and reserve @DirtiesContext for tests that genuinely corrupt the context.',
      },
      {
        mistake: 'Relying on @Transactional rollback in a RANDOM_PORT test.',
        why: 'The HTTP request is handled on a server thread with its own transaction, which commits; the test\'s transaction cannot roll it back.',
        fix: 'Clean up explicitly (delete or truncate in @AfterEach), or use MockMvc in the MOCK environment where the request runs on the test thread.',
      },
    ],
    checks: [
      {
        id: 'sp5-c1',
        kind: 'mcq',
        dimension: 'conceptual',
        prompt: 'Which beans does `@WebMvcTest(BookController.class)` put in the application context?',
        options: [
          { id: 'a', text: 'Every bean in the application, like @SpringBootTest' },
          { id: 'b', text: 'BookController and web infrastructure (Jackson, @ControllerAdvice, filters, MockMvc) — but not @Service or @Repository beans' },
          { id: 'c', text: 'Only JPA repositories and an embedded database' },
          { id: 'd', text: 'Nothing: MockMvc calls the controller method directly by reflection' },
        ],
        correctOptionId: 'b',
        explanation: 'A slice limits component scanning to its layer. The controller\'s collaborators must be supplied, typically with @MockitoBean. MockMvc then sends requests through the real DispatcherServlet.',
      },
      {
        id: 'sp5-c2',
        kind: 'mcq',
        dimension: 'runtime',
        prompt: 'On Spring Boot 3.4+ (Spring Framework 6.2+), what should replace `@MockBean` to put a Mockito mock into the test context?',
        options: [
          { id: 'a', text: '@Mock from Mockito' },
          { id: 'b', text: '@InjectMocks' },
          { id: 'c', text: '@MockitoBean from org.springframework.test.context.bean.override.mockito' },
          { id: 'd', text: '@TestBean from JUnit' },
        ],
        correctOptionId: 'c',
        explanation: '@MockitoBean (and @MockitoSpyBean) are spring-test\'s bean-override annotations. @Mock alone creates a mock but does not register it in the Spring context. @MockBean is deprecated in Boot 3.4 and removed in Boot 4.',
      },
      {
        id: 'sp5-c3',
        kind: 'multi-select',
        dimension: 'runtime',
        prompt: 'Two @SpringBootTest classes use the same application class. Which differences make Spring start a **separate** context for the second one? Select all that apply.',
        options: [
          { id: 'a', text: 'A different @ActiveProfiles value' },
          { id: 'b', text: 'An extra @MockitoBean field' },
          { id: 'c', text: 'A different @TestPropertySource property' },
          { id: 'd', text: 'Different test method names' },
          { id: 'e', text: 'A different @DisplayName on the class' },
        ],
        correctOptionIds: ['a', 'b', 'c'],
        explanation: 'Profiles, property sources and context customizers (which include bean overrides) are part of the cache key. Method names and JUnit display names are not, so those classes share one context.',
      },
      {
        id: 'sp5-c4',
        kind: 'predict-output',
        dimension: 'runtime',
        prompt: 'This loop models the context cache: each string is a test class\'s configuration key. What is printed?',
        code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Set<String> cache = new HashSet<>();
        int started = 0;
        String[] testClasses = {
            "profile=test",
            "profile=test",
            "profile=test,mock=Mailer",
            "profile=dev",
            "profile=test"
        };
        for (String key : testClasses) {
            if (cache.add(key)) started++;
        }
        System.out.println(started + " contexts for " + testClasses.length + " classes");
    }
}`,
        options: [
          { id: 'a', text: '1 contexts for 5 classes' },
          { id: 'b', text: '5 contexts for 5 classes' },
          { id: 'c', text: '3 contexts for 5 classes' },
          { id: 'd', text: '2 contexts for 5 classes' },
        ],
        correctOptionId: 'c',
        explanation: 'Set.add returns false for a key already present, modelling a cache hit. Three distinct keys mean three context start-ups; the repeated "profile=test" classes reuse the first one.',
      },
      {
        id: 'sp5-c5',
        kind: 'predict-output',
        dimension: 'coding',
        prompt: 'A service gets its collaborator through the constructor; the test passes a lambda as a fake. What is printed?',
        code: `import java.util.*;

interface Inventory {
    int stock(String sku);
}

class OrderService {
    private final Inventory inventory;
    OrderService(Inventory inventory) { this.inventory = inventory; }

    String place(String sku, int qty) {
        return inventory.stock(sku) >= qty ? "ACCEPTED" : "BACKORDER";
    }
}

public class Main {
    public static void main(String[] args) {
        Map<String, Integer> stock = Map.of("pen", 5);
        OrderService service = new OrderService(sku -> stock.getOrDefault(sku, 0));
        System.out.println(service.place("pen", 5) + " " + service.place("pen", 6) + " " + service.place("ink", 1));
    }
}`,
        options: [
          { id: 'a', text: 'ACCEPTED BACKORDER BACKORDER' },
          { id: 'b', text: 'ACCEPTED ACCEPTED BACKORDER' },
          { id: 'c', text: 'BACKORDER BACKORDER BACKORDER' },
          { id: 'd', text: 'A NullPointerException for "ink"' },
        ],
        correctOptionId: 'a',
        explanation: '5 >= 5 is accepted, 5 >= 6 is not, and getOrDefault returns 0 for the unknown "ink". No Spring context was needed to test the rule, only the constructor.',
      },
      {
        id: 'sp5-c6',
        kind: 'mcq',
        dimension: 'conceptual',
        prompt: 'By default, what happens to rows a `@DataJpaTest` test method inserts?',
        options: [
          { id: 'a', text: 'They are committed and visible to the next test' },
          { id: 'b', text: 'Each test runs in a transaction that is rolled back when it finishes' },
          { id: 'c', text: 'The database is dropped and recreated after every test' },
          { id: 'd', text: 'Inserts are ignored because repositories are mocked' },
        ],
        correctOptionId: 'b',
        explanation: '@DataJpaTest is meta-annotated with @Transactional, and test-managed transactions roll back by default. Remember to flush (or query) inside the test so SQL actually executes before the rollback.',
      },
      {
        id: 'sp5-c7',
        kind: 'mcq',
        dimension: 'interview',
        prompt: 'What does `@ServiceConnection` on a Testcontainers `PostgreSQLContainer` do in Spring Boot 3.1+?',
        options: [
          { id: 'a', text: 'Starts PostgreSQL without Docker' },
          { id: 'b', text: 'Makes Boot derive the DataSource connection details (URL, user, password) from the running container, replacing manual property wiring' },
          { id: 'c', text: 'Replaces the container with H2 when Docker is unavailable' },
          { id: 'd', text: 'Shares the container across different machines in CI' },
        ],
        correctOptionId: 'b',
        explanation: 'Boot creates ConnectionDetails beans from the container, which take precedence over spring.datasource.* properties. Before 3.1 the usual pattern was @DynamicPropertySource with registry.add("spring.datasource.url", postgres::getJdbcUrl).',
      },
    ],
    challengeIds: [],
    masteryCriteria: [
      'Unit-test a Spring service with fakes through its constructor, without starting Spring.',
      'Pick the right slice (or none) for a controller, a repository, a JSON contract and an HTTP client.',
      'Write a MockMvc test that asserts status, JSON fields and a validation error, with @MockitoBean collaborators.',
      'Configure a repository test against PostgreSQL with Testcontainers and @ServiceConnection.',
      'Diagnose a slow suite by counting contexts and explain how to reduce them.',
    ],
    relatedLessonIds: ['sp-ioc-boot', 'sp-rest', 'sp-data-tx', 'sp-security', 'ts-junit', 'ts-mocking', 'ts-code-quality'],
    revision: [
      { id: 'r1', question: 'Why does constructor injection make Spring services easy to unit test?', answer: 'The constructor lists every collaborator, so a test can call new with fakes or mocks — the same call Spring makes — with no context, reflection or field hacks.' },
      { id: 'r2', question: 'Name four test slices and what each loads.', answer: '@WebMvcTest: MVC controllers and web infrastructure with MockMvc. @DataJpaTest: JPA, repositories and a database, transactional. @JsonTest: Jackson and JacksonTester. @RestClientTest: REST client builders with MockRestServiceServer.' },
      { id: 'r3', question: 'What replaced @MockBean?', answer: '@MockitoBean and @MockitoSpyBean from spring-test (Spring Framework 6.2); @MockBean was deprecated in Boot 3.4 and removed in Boot 4.' },
      { id: 'r4', question: 'What does @ServiceConnection do?', answer: 'Since Boot 3.1 it turns a Testcontainers container (field or @Bean) into connection details, so Boot connects to it without manual properties.' },
      { id: 'r5', question: 'Why do @DirtiesContext and varied @MockitoBean sets slow test suites?', answer: 'Contexts are cached by merged configuration. Each variation is a new key and a new start-up; @DirtiesContext closes a context so the next class must rebuild it.' },
    ],
  },
];
