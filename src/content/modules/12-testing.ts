import type { CurriculumModule } from '@/types/curriculum';

export const testingModule: CurriculumModule = {
  id: 'testing',
  order: 12,
  title: 'Unit Testing, Debugging and Code Quality',
  shortTitle: 'Testing',
  summary: 'JUnit 5, test design, test doubles and Mockito, designing code for testability, and where integration tests fit.',
  level: 'advanced',
  prerequisites: ['oop'],
  plannedTopics: ['Debugging technique: breakpoints, logging and bisecting', 'Static analysis and code quality tools'],
  lessons: [
    {
      id: 'ts-junit',
      moduleId: 'testing',
      title: 'JUnit 5 and test design',
      summary: 'Structure of a JUnit Jupiter test, assertions, parameterised tests, Arrange-Act-Assert and what makes a unit test valuable.',
      estimatedMinutes: 40,
      difficulty: 'intermediate',
      prerequisites: ['o-classes-objects', 'e-basics'],
      versionNotes: [
        { feature: 'JUnit 5 (Jupiter) requires Java 8+', since: 8, note: 'JUnit 5 is a library, not a Java feature; JUnit 6 (2025) requires Java 17' },
      ],
      objectives: [
        'Write JUnit 5 tests with @Test, @BeforeEach, assertEquals, assertThrows and assertAll.',
        'Use @ParameterizedTest with @CsvSource or @ValueSource to cover boundaries.',
        'Structure tests with Arrange-Act-Assert and give them behaviour-describing names.',
        'Explain the test pyramid and the properties of a good unit test.',
      ],
      plainEnglish: `A **unit test** is a small program that calls your code with known input and checks the result automatically. Run hundreds of them in seconds after every change and you find out immediately when something breaks.

**JUnit** is the standard Java test framework. You write ordinary methods annotated with \`@Test\`; inside, you call the code under test and use **assertions** like \`assertEquals(expected, actual)\`. If an assertion fails it throws an \`AssertionError\`, JUnit marks the test as failed and moves on to the next one.

A good test reads like a short story: **arrange** the inputs, **act** by calling one method, **assert** the outcome.`,
      technical: `### JUnit 5 architecture
JUnit 5 = **Platform** (launches tests, used by Maven Surefire, Gradle and IDEs) + **Jupiter** (the programming model in \`org.junit.jupiter.api\`) + **Vintage** (runs old JUnit 4 tests). Add \`org.junit.jupiter:junit-jupiter\` as a test dependency.

### Differences from JUnit 4
- \`@Before/@After\` became \`@BeforeEach/@AfterEach\`; \`@BeforeClass/@AfterClass\` became \`@BeforeAll/@AfterAll\` (static by default).
- \`@Test(expected = ...)\` is gone; use \`assertThrows\`, which returns the exception so you can check its message.
- \`@Ignore\` became \`@Disabled\`; \`@RunWith\` became \`@ExtendWith\` (e.g. \`MockitoExtension\`).
- Test classes and methods no longer need to be \`public\`; package-private is idiomatic (they must not be private).
- Assertion messages are the **last** parameter (in JUnit 4 they were first) and can be a \`Supplier<String>\` for lazy evaluation.

### Lifecycle
JUnit creates a **new instance of the test class for every test method** by default, so fields set in \`@BeforeEach\` are fresh each time and tests cannot leak state through instance fields. Static state still leaks — avoid it.

### Assertions worth knowing
\`assertEquals(expected, actual)\` (order matters for the failure message), \`assertEquals(0.3, x, 1e-9)\` for doubles, \`assertTrue/False\`, \`assertNull\`, \`assertThrows\`, \`assertAll\` (reports every failing assertion in the group, not only the first), \`assertTimeout\`, \`assertIterableEquals\`. Many teams use AssertJ for fluent, more readable assertions: \`assertThat(list).containsExactly("a", "b")\`.

### Parameterised tests
\`@ParameterizedTest\` (artifact \`junit-jupiter-params\`, included in \`junit-jupiter\`) runs one method with many inputs from \`@ValueSource\`, \`@CsvSource\`, \`@EnumSource\` or \`@MethodSource\`. Ideal for boundary values: 0, 1, the limit, limit + 1, negative, empty.

### Designing good tests
- Test **behaviour through the public API**, not private methods or internal fields.
- One reason to fail per test; name it after the behaviour: \`rejectsNonPositiveWeight\` or \`costCents_roundsUpStartedKilograms\`.
- **FIRST**: Fast, Independent (any order), Repeatable (no clock, network or randomness without control), Self-validating (pass/fail, no reading logs), Timely.
- Cover boundaries and error paths, not just the happy path. Code coverage shows what is *not* tested; it does not prove what is.

### The test pyramid
Many fast **unit** tests at the base, fewer **integration** tests (real database, HTTP, Spring context) in the middle, and a handful of slow **end-to-end** tests at the top. Inverting it (mostly UI tests) gives a slow, flaky suite.`,
      whyItExists: `Manual testing does not scale and is not repeated after every change. Automated tests act as a safety net for refactoring, document intended behaviour with executable examples, and push code towards small, decoupled units — code that is hard to test is usually hard to change.`,
      whenToUse: [
        'Write unit tests for business rules, calculations, parsing and validation.',
        'Write a failing test that reproduces a bug before fixing it, so it never comes back.',
        'Use parameterised tests when the same rule must hold for many inputs.',
      ],
      whenNotToUse: [
        'Do not unit-test trivial getters, setters or framework wiring.',
        'Do not assert on private state via reflection; test what callers can observe.',
        'Do not replace integration tests with unit tests that mock the database for SQL-heavy code.',
      ],
      examples: [
        {
          id: 'tiny-test-harness',
          title: 'The mechanics of a test framework, hand-rolled',
          runnable: true,
          code: `import java.util.ArrayList;
import java.util.List;

record Quote(long cents, int billedKilograms) {}

class ShippingCalculator {
    private final long baseCents;
    private final long perKgCents;

    ShippingCalculator(long baseCents, long perKgCents) {
        this.baseCents = baseCents;
        this.perKgCents = perKgCents;
    }

    Quote quote(int grams) {
        if (grams <= 0) throw new IllegalArgumentException("grams must be positive: " + grams);
        int kg = (grams + 999) / 1000;                       // started kilograms
        return new Quote(baseCents + kg * perKgCents, kg);
    }

    long costCents(int grams) { return quote(grams).cents(); }
}

public class Main {
    interface TestBody { void run() throws Exception; }
    record TestCase(String name, TestBody body) {}

    static void assertEquals(Object expected, Object actual) {
        if (!expected.equals(actual)) {
            throw new AssertionError("expected <" + expected + "> but was <" + actual + ">");
        }
    }

    static <T extends Throwable> T assertThrows(Class<T> type, TestBody body) {
        try {
            body.run();
        } catch (Throwable t) {
            if (type.isInstance(t)) return type.cast(t);
            throw new AssertionError("expected " + type.getSimpleName() + " but got " + t);
        }
        throw new AssertionError("expected " + type.getSimpleName() + " but nothing was thrown");
    }

    public static void main(String[] args) {
        ShippingCalculator calc = new ShippingCalculator(499, 50);
        List<TestCase> tests = new ArrayList<>();
        tests.add(new TestCase("one kilogram", () -> assertEquals(549L, calc.costCents(1_000))));
        tests.add(new TestCase("started kilogram rounds up", () -> assertEquals(599L, calc.costCents(1_001))));
        tests.add(new TestCase("rejects zero", () -> {
            IllegalArgumentException e = assertThrows(IllegalArgumentException.class, () -> calc.costCents(0));
            assertEquals("grams must be positive: 0", e.getMessage());
        }));
        tests.add(new TestCase("deliberately wrong expectation", () -> assertEquals(500L, calc.costCents(1))));

        int passed = 0;
        for (TestCase t : tests) {
            try {
                t.body().run();
                passed++;
                System.out.println("PASS " + t.name());
            } catch (AssertionError e) {
                System.out.println("FAIL " + t.name() + ": " + e.getMessage());
            } catch (Exception e) {
                System.out.println("ERROR " + t.name() + ": " + e);
            }
        }
        System.out.println(passed + "/" + tests.size() + " passed");
    }
}`,
          expectedOutput: `PASS one kilogram
PASS started kilogram rounds up
PASS rejects zero
FAIL deliberately wrong expectation: expected <500> but was <549>
3/4 passed`,
          explanation: 'JUnit does the same thing with more polish: it discovers @Test methods by reflection, runs each in isolation, turns AssertionError into a failure and any other exception into an error, and reports the totals.',
        },
        {
          id: 'junit5-test-class',
          title: 'The same tests in JUnit 5',
          runnable: false,
          code: `import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.junit.jupiter.api.Assertions.*;

class ShippingCalculatorTest {
    private ShippingCalculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new ShippingCalculator(499, 50);   // fresh instance for every test
    }

    @Test
    void chargesOneKilogramRateForParcelsUpToOneKilogram() {
        // Arrange
        int grams = 1_000;
        // Act
        long cents = calculator.costCents(grams);
        // Assert
        assertEquals(549, cents);
    }

    @ParameterizedTest(name = "{0} g -> {1} cents")
    @CsvSource({
        "1,    549",
        "1000, 549",
        "1001, 599",
        "5000, 749"
    })
    void addsFiftyCentsPerStartedKilogram(int grams, long expectedCents) {
        assertEquals(expectedCents, calculator.costCents(grams));
    }

    @Test
    @DisplayName("rejects zero and negative weights")
    void rejectsNonPositiveWeight() {
        IllegalArgumentException e =
            assertThrows(IllegalArgumentException.class, () -> calculator.costCents(0));
        assertEquals("grams must be positive: 0", e.getMessage());
    }

    @Test
    void quoteReportsBilledKilograms() {
        Quote q = calculator.quote(2_500);
        assertAll(
            () -> assertEquals(649, q.cents()),
            () -> assertEquals(3, q.billedKilograms()));
    }
}`,
          explanation: 'Needs junit-jupiter on the test classpath (Maven: src/test/java, run with mvn test). ShippingCalculator and Quote are the classes from the runnable example.',
        },
      ],
      walkthrough: {
        exampleId: 'junit5-test-class',
        steps: [
          { lines: [1, 7], text: 'Jupiter annotations live in org.junit.jupiter.api; the static import brings in assertEquals, assertThrows and assertAll.' },
          { lines: [9, 15], text: 'The class and methods are package-private. JUnit creates a new ShippingCalculatorTest instance per test, and @BeforeEach builds a fresh calculator before each one.' },
          { lines: [17, 25], text: 'Arrange-Act-Assert: set up the input, call exactly one method, check one behaviour. The name states the rule being tested.' },
          { lines: [27, 36], text: 'One parameterised test covers the boundaries 1, 1000 and 1001 grams. Each CSV row becomes a separately reported test case named by the name pattern.' },
          { lines: [38, 44], text: 'assertThrows fails if nothing (or the wrong type) is thrown, and returns the exception so the message can be checked too.' },
          { lines: [46, 52], text: 'assertAll runs every assertion and reports all failures together, useful when checking several fields of one result.' },
        ],
      },
      realWorld: {
        title: 'The off-by-one that a boundary test would have caught',
        scenario: `A logistics company charged per started kilogram. A refactor replaced \`(grams + 999) / 1000\` with \`grams / 1000 + 1\`, which looks equivalent — and was, for every test the team had (500 g, 1,500 g, 2,200 g). Exactly-1,000 g parcels, a very common packaging size, were suddenly billed as 2 kg. Customers noticed before the team did.

The post-mortem added a \`@ParameterizedTest\` with the boundary values 1, 999, 1000, 1001 and 2000 and a team rule: every pricing rule gets explicit boundary cases. They also ran mutation testing (PIT) on the pricing package, which reports tests that still pass when the code is subtly changed — a better measure of test strength than line coverage.`,
      },
      commonMistakes: [
        {
          mistake: 'Swapping expected and actual in assertEquals.',
          why: 'The test still passes or fails correctly, but the failure message says "expected <wrong value>" and misleads whoever debugs it.',
          fix: 'JUnit order is assertEquals(expected, actual). AssertJ\'s assertThat(actual).isEqualTo(expected) avoids the confusion.',
        },
        {
          mistake: 'Tests that depend on each other or on execution order.',
          why: 'JUnit does not guarantee method order; shared static state makes tests pass alone and fail together (or the reverse).',
          fix: 'Set up everything a test needs in the test or @BeforeEach; never share mutable static state.',
        },
        {
          mistake: 'Comparing doubles with assertEquals(expected, actual) and no delta.',
          why: 'Floating-point results like 0.1 + 0.2 are not exactly 0.3.',
          fix: 'Use assertEquals(expected, actual, delta), or BigDecimal/long cents for money.',
        },
        {
          mistake: 'Testing private methods via reflection or making them public "for tests".',
          why: 'Tests become coupled to implementation details and break on every refactor.',
          fix: 'Test through the public behaviour. If a private method is complex enough to need its own tests, extract it into its own class.',
        },
      ],
      checks: [
        {
          id: 'ts1-c1',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'You are migrating a JUnit 4 test. What replaces `@Before` and `@Test(expected = IllegalArgumentException.class)`?',
          options: [
            { id: 'a', text: '@BeforeAll and @Test(throws = IllegalArgumentException.class)' },
            { id: 'b', text: '@BeforeEach and assertThrows(IllegalArgumentException.class, () -> ...)' },
            { id: 'c', text: '@Setup and @ExpectException' },
            { id: 'd', text: 'Nothing changes; JUnit 5 accepts JUnit 4 annotations natively' },
          ],
          correctOptionId: 'b',
          explanation: '@BeforeEach runs before every test (like @Before). assertThrows pinpoints which call must throw and returns the exception for further checks. JUnit 4 tests can run unchanged only via the Vintage engine.',
        },
        {
          id: 'ts1-c2',
          kind: 'predict-output',
          dimension: 'debugging',
          prompt: 'A hand-rolled check helper runs three checks. What is printed?',
          code: `public class Main {
    static int passed = 0, failed = 0;

    static void check(boolean condition, String name) {
        if (condition) passed++;
        else {
            failed++;
            System.out.println("FAIL " + name);
        }
    }

    public static void main(String[] args) {
        check(0.1 + 0.2 == 0.3, "double sum");
        check(Math.abs((0.1 + 0.2) - 0.3) < 1e-9, "double sum with tolerance");
        check("abc".equals("ab" + "c"), "string equals");
        System.out.println(passed + " passed, " + failed + " failed");
    }
}`,
          options: [
            { id: 'a', text: '3 passed, 0 failed' },
            { id: 'b', text: 'FAIL double sum\n2 passed, 1 failed' },
            { id: 'c', text: 'FAIL double sum\nFAIL string equals\n1 passed, 2 failed' },
            { id: 'd', text: 'FAIL double sum with tolerance\n2 passed, 1 failed' },
          ],
          correctOptionId: 'b',
          explanation: '0.1 + 0.2 is 0.30000000000000004 in binary floating point, so exact comparison fails. That is why JUnit has assertEquals(double expected, double actual, double delta). equals compares string content, so the third check passes.',
        },
        {
          id: 'ts1-c3',
          kind: 'multi-select',
          dimension: 'conceptual',
          prompt: 'Which properties make a unit test valuable? Select all that apply.',
          options: [
            { id: 'a', text: 'It runs in milliseconds' },
            { id: 'b', text: 'It gives the same result every run, in any order' },
            { id: 'c', text: 'It checks private fields via reflection to be thorough' },
            { id: 'd', text: 'It fails for one clear reason that its name describes' },
            { id: 'e', text: 'It relies on a previous test to create its data' },
          ],
          correctOptionIds: ['a', 'b', 'd'],
          explanation: 'Fast, independent, repeatable and focused (FIRST). Reflection into internals and inter-test dependencies make tests brittle.',
        },
        {
          id: 'ts1-c4',
          kind: 'mcq',
          dimension: 'coding',
          prompt: 'A discount applies from 10 items. Which `@ValueSource(ints = {...})` set best tests the boundary of "no discount below 10"?',
          options: [
            { id: 'a', text: '{1, 5}' },
            { id: 'b', text: '{9, 10}' },
            { id: 'c', text: '{100, 1000}' },
            { id: 'd', text: '{5, 50}' },
          ],
          correctOptionId: 'b',
          explanation: 'Off-by-one bugs (> vs >=) live at the boundary. Test the last value without the discount and the first with it.',
        },
        {
          id: 'ts1-c5',
          kind: 'mcq',
          dimension: 'interview',
          prompt: 'According to the test pyramid, how should a backend team distribute its automated tests?',
          options: [
            { id: 'a', text: 'Mostly end-to-end UI tests because they test what users do' },
            { id: 'b', text: 'Many fast unit tests, fewer integration tests, very few end-to-end tests' },
            { id: 'c', text: 'Equal numbers of each kind' },
            { id: 'd', text: 'Only integration tests, since unit tests use fakes' },
          ],
          correctOptionId: 'b',
          explanation: 'Unit tests are fast and precise about what broke; integration tests catch wiring and SQL problems; end-to-end tests are slow and flaky, so keep them for critical journeys.',
        },
        {
          id: 'ts1-c6',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'In JUnit 5, which test method declaration is NOT run as a test?',
          options: [
            { id: 'a', text: '@Test void addsItem() { ... }' },
            { id: 'b', text: '@Test public void addsItem() { ... }' },
            { id: 'c', text: '@Test private void addsItem() { ... }' },
            { id: 'd', text: '@Test protected void addsItem() { ... }' },
          ],
          correctOptionId: 'c',
          explanation: 'Jupiter test methods must not be private (and must return void). Package-private is the idiomatic choice; public was required only in JUnit 4.',
        },
      ],
      challengeIds: ['ch-bulk-pricing-bug'],
      masteryCriteria: [
        'Write a JUnit 5 test class with lifecycle methods, assertThrows and a parameterised boundary test.',
        'Name the JUnit 4 to 5 changes that matter when migrating.',
        'Judge a test against the FIRST properties and the test pyramid.',
      ],
      relatedLessonIds: ['ts-mocking', 'e-basics', 'o-solid'],
      revision: [
        { id: 'r1', question: 'What does Arrange-Act-Assert mean?', answer: 'Set up inputs and collaborators, call the behaviour under test once, then assert the observable outcome.' },
        { id: 'r2', question: 'Why does assertThrows beat @Test(expected = ...)?', answer: 'It pins the exception to one specific call and returns it so the message and fields can be asserted; the JUnit 4 form passes if any line throws.' },
        { id: 'r3', question: 'How often does JUnit 5 instantiate the test class by default?', answer: 'Once per test method (Lifecycle.PER_METHOD), so instance fields are fresh for every test.' },
        { id: 'r4', question: 'What are the three layers of the test pyramid?', answer: 'Many unit tests at the bottom, fewer integration tests in the middle, few end-to-end tests at the top.' },
      ],
    },
    {
      id: 'ts-mocking',
      moduleId: 'testing',
      title: 'Test doubles, Mockito and testable design',
      summary: 'Stubs, fakes, mocks and spies; Mockito basics; injecting dependencies such as clocks; avoiding over-mocking; Testcontainers for integration tests.',
      estimatedMinutes: 40,
      difficulty: 'advanced',
      prerequisites: ['ts-junit', 'o-interfaces'],
      versionNotes: [
        { feature: 'java.time.Clock for injectable time', since: 8 },
      ],
      objectives: [
        'Distinguish stubs, fakes, mocks and spies and pick the right one.',
        'Use Mockito when/thenReturn, verify, never() and ArgumentCaptor.',
        'Design classes for testability with constructor injection and an injectable Clock.',
        'Recognise over-mocking and know when an integration test with Testcontainers is the better tool.',
      ],
      plainEnglish: `Real code talks to databases, payment providers, email servers and the system clock. In a unit test you don't want any of those: they are slow, cost money, or give different answers each run.

A **test double** is a stand-in you pass to the code under test instead of the real collaborator — like a stunt double in a film. It can be a tiny hand-written class or one generated by a library such as **Mockito**.

For this to work, the class under test must **receive** its collaborators (usually through its constructor) instead of creating them itself. That is dependency injection, and it is the main reason "testable code" tends to be better-designed code.`,
      technical: `### Kinds of test double (Gerard Meszaros' vocabulary)
- **Dummy**: passed but never used (fills a parameter).
- **Stub**: returns canned answers ("the gateway always approves"). You then assert on the *result* — state verification.
- **Fake**: a working but simplified implementation, e.g. an in-memory repository backed by a HashMap. Great for repositories and caches.
- **Mock**: pre-programmed with expectations and used to **verify interactions** ("charge was called once with 2500").
- **Spy**: wraps or records calls to a real object so you can inspect them afterwards.

Prefer state verification (stubs, fakes) where possible; verify interactions only when the interaction *is* the behaviour (an email must be sent, a payment must not be charged twice).

### Mockito essentials
- \`@ExtendWith(MockitoExtension.class)\` with \`@Mock\` fields and \`@InjectMocks\` for the class under test (constructor injection preferred), or \`mock(Foo.class)\` directly.
- Stubbing: \`when(repo.findById("o-1")).thenReturn(Optional.empty())\`, \`thenThrow(...)\`, \`thenAnswer(inv -> ...)\`. Unstubbed methods return defaults: null, 0, false, empty collections and empty Optionals.
- Verification: \`verify(gateway).charge("ada", 2_500)\`, \`verify(gateway, never()).charge(anyString(), anyLong())\`, \`times(2)\`, \`verifyNoMoreInteractions(...)\` (use sparingly).
- Argument matchers: \`any()\`, \`eq(...)\`, \`argThat(...)\` — if one argument uses a matcher, all must.
- \`ArgumentCaptor<Order>\` captures the argument passed to a mocked call so you can assert on it.
- \`spy(realObject)\` calls real methods unless stubbed (use \`doReturn(...).when(spy).method()\` for spies).
- Strict stubs (the default with MockitoExtension) fail a test that stubs something it never uses — a hint the test is out of date.
- Since **Mockito 5** the inline mock maker is the default, so final classes and methods can be mocked and \`mockStatic\` works without extra configuration. Being able to mock something does not mean you should.

### Designing for testability
- Inject collaborators through the constructor; avoid \`new\` for services and avoid static singletons inside business logic.
- Inject **time**: take a \`java.time.Clock\` and call \`Instant.now(clock)\`; tests pass \`Clock.fixed(...)\`.
- Inject randomness (\`RandomGenerator\`) and ID generation the same way.
- Keep side-effect-free logic (calculations, decisions) in plain methods that need no doubles at all.

### Over-mocking
Signs: mocking value objects and records, mocking types you don't own (JDBC \`ResultSet\`, HTTP clients), verifying every call including getters, tests that mirror the implementation line by line and break on every refactor while bugs slip through. Mock at the boundaries of your system (ports such as \`PaymentGateway\`), not between every pair of classes.

### Integration tests and Testcontainers
SQL, transactions, serialisation and framework configuration are where many bugs live — mocks cannot find them. **Testcontainers** starts real dependencies (PostgreSQL, Kafka, Redis) in Docker from a JUnit test, e.g. \`@Container static PostgreSQLContainer<?> db = new PostgreSQLContainer<>("postgres:16")\`. Prefer it to an in-memory H2 database, whose SQL dialect and locking differ from production.`,
      whyItExists: `Unit tests must be fast and deterministic, but real collaborators are slow, shared or non-deterministic. Test doubles isolate the unit; dependency injection makes isolation possible; integration tests then check the real wiring that doubles deliberately skip.`,
      whenToUse: [
        'Use a fake for repositories and other stateful collaborators used by many tests.',
        'Use a stub to force rare paths: a declined payment, a timeout, an empty result.',
        'Use a mock with verify when the side effect is the requirement (send exactly one email, never charge twice).',
        'Use Testcontainers for DAO, SQL and messaging code.',
      ],
      whenNotToUse: [
        'Do not mock value objects, records, collections or simple pure functions — use real ones.',
        'Do not mock JDBC or HTTP client classes to test SQL or HTTP code; test against a real container or a local server stub.',
        'Do not verify every interaction; assert on outcomes unless the interaction is the point.',
      ],
      examples: [
        {
          id: 'hand-written-fake',
          title: 'A fake repository and a recording stub, written by hand',
          runnable: true,
          code: `import java.util.*;

record Order(String id, String customer, long cents) {}

interface OrderRepository {
    void save(Order order);
    Optional<Order> findById(String id);
}

interface PaymentGateway {
    boolean charge(String customer, long cents);
}

class CheckoutService {
    private final OrderRepository orders;
    private final PaymentGateway payments;

    CheckoutService(OrderRepository orders, PaymentGateway payments) {
        this.orders = orders;
        this.payments = payments;
    }

    String checkout(String orderId, String customer, long cents) {
        if (orders.findById(orderId).isPresent()) return "duplicate";
        if (!payments.charge(customer, cents)) return "declined";
        orders.save(new Order(orderId, customer, cents));
        return "ok";
    }
}

// Fake: a real, working implementation with a shortcut (memory instead of a database)
class InMemoryOrderRepository implements OrderRepository {
    private final Map<String, Order> rows = new LinkedHashMap<>();
    public void save(Order order) { rows.put(order.id(), order); }
    public Optional<Order> findById(String id) { return Optional.ofNullable(rows.get(id)); }
    int count() { return rows.size(); }
}

// Stub + spy: a canned answer, and a record of how it was called
class RecordingGateway implements PaymentGateway {
    private final boolean answer;
    final List<String> calls = new ArrayList<>();
    RecordingGateway(boolean answer) { this.answer = answer; }
    public boolean charge(String customer, long cents) {
        calls.add(customer + ":" + cents);
        return answer;
    }
}

public class Main {
    public static void main(String[] args) {
        InMemoryOrderRepository repo = new InMemoryOrderRepository();
        RecordingGateway approving = new RecordingGateway(true);
        CheckoutService service = new CheckoutService(repo, approving);

        System.out.println(service.checkout("o-1", "ada", 2_500));
        System.out.println(service.checkout("o-1", "ada", 2_500));
        System.out.println("saved orders: " + repo.count() + ", charges: " + approving.calls);

        InMemoryOrderRepository emptyRepo = new InMemoryOrderRepository();
        CheckoutService declining = new CheckoutService(emptyRepo, new RecordingGateway(false));
        System.out.println(declining.checkout("o-2", "bob", 900));
        System.out.println("saved after decline: " + emptyRepo.count());
    }
}`,
          expectedOutput: `ok
duplicate
saved orders: 1, charges: [ada:2500]
declined
saved after decline: 0`,
          explanation: 'Because CheckoutService receives its collaborators, no database or payment provider is needed. The recorded calls prove the duplicate order was not charged a second time.',
        },
        {
          id: 'mockito-checkout-test',
          title: 'The same tests with Mockito',
          runnable: false,
          code: `import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CheckoutServiceTest {
    @Mock OrderRepository orders;
    @Mock PaymentGateway payments;
    @InjectMocks CheckoutService service;

    @Test
    void savesOrderWhenPaymentIsApproved() {
        when(orders.findById("o-1")).thenReturn(Optional.empty());
        when(payments.charge("ada", 2_500)).thenReturn(true);

        String result = service.checkout("o-1", "ada", 2_500);

        assertEquals("ok", result);
        ArgumentCaptor<Order> saved = ArgumentCaptor.forClass(Order.class);
        verify(orders).save(saved.capture());
        assertEquals(new Order("o-1", "ada", 2_500), saved.getValue());
    }

    @Test
    void doesNotChargeDuplicateOrders() {
        when(orders.findById("o-1")).thenReturn(Optional.of(new Order("o-1", "ada", 2_500)));

        assertEquals("duplicate", service.checkout("o-1", "ada", 2_500));

        verify(payments, never()).charge(anyString(), anyLong());
        verify(orders, never()).save(any());
    }
}`,
          explanation: 'Needs junit-jupiter and mockito-junit-jupiter. @InjectMocks calls the CheckoutService constructor with the two mocks.',
        },
        {
          id: 'injectable-clock',
          title: 'Injecting time with java.time.Clock',
          runnable: true,
          code: `import java.time.*;

class TrialPolicy {
    private final Clock clock;

    TrialPolicy(Clock clock) { this.clock = clock; }

    boolean isExpired(Instant trialStart) {
        return Instant.now(clock).isAfter(trialStart.plus(Duration.ofDays(14)));
    }
}

public class Main {
    public static void main(String[] args) {
        Instant start = Instant.parse("2024-03-01T09:00:00Z");
        Clock day10 = Clock.fixed(Instant.parse("2024-03-11T09:00:00Z"), ZoneOffset.UTC);
        Clock day15 = Clock.offset(day10, Duration.ofDays(5));

        System.out.println("day 10 expired? " + new TrialPolicy(day10).isExpired(start));
        System.out.println("day 15 expired? " + new TrialPolicy(day15).isExpired(start));
        System.out.println("production clock zone: " + Clock.systemUTC().getZone());
    }
}`,
          expectedOutput: `day 10 expired? false
day 15 expired? true
production clock zone: Z`,
          explanation: 'No mocking library is needed: Clock is an abstract class designed to be swapped. Production code passes Clock.systemUTC().',
        },
      ],
      walkthrough: {
        exampleId: 'mockito-checkout-test',
        steps: [
          { lines: [14, 18], text: 'MockitoExtension creates a mock for each @Mock field and builds CheckoutService with them via @InjectMocks.' },
          { lines: [20, 23], text: 'Stubbing: findById returns empty (not a duplicate) and charge approves. Without stubs, mocks return defaults — charge would return false.' },
          { lines: [25, 27], text: 'Act and assert on the result first: state verification is the primary check.' },
          { lines: [28, 30], text: 'ArgumentCaptor grabs the Order passed to save so its contents can be asserted. Records give a useful equals for free.' },
          { lines: [33, 41], text: 'never() verifies that no charge and no save happened for a duplicate. Here the absence of an interaction is the requirement, so verify is justified.' },
        ],
      },
      realWorld: {
        title: 'Two hundred green tests and a broken release',
        scenario: `A team's OrderService had 200 Mockito tests that mocked the repository, the mapper, the validator and even the \`Order\` entity. Coverage was 95%. A release still failed in staging: a column rename in a Flyway migration broke the repository's native query, and none of the tests ran any SQL.

Worse, a harmless refactor (merging two validator calls into one) broke 40 tests because they verified exact call sequences. The team replaced most repository mocks with an in-memory fake for service tests, stopped mocking entities and value objects, and added a handful of repository tests running against PostgreSQL in Testcontainers. Test count dropped to 120; escaped defects and refactoring pain both went down.`,
      },
      commonMistakes: [
        {
          mistake: 'Creating dependencies with new inside the class under test.',
          why: 'The test has no seam to substitute a double, so it ends up calling the real service, database or clock.',
          fix: 'Accept collaborators (including Clock) through the constructor.',
          code: `// Hard to test
class Billing { private final StripeClient client = new StripeClient(); }
// Testable
class Billing { private final PaymentGateway gateway; Billing(PaymentGateway g) { gateway = g; } }`,
        },
        {
          mistake: 'Verifying every interaction, including queries and getters.',
          why: 'Tests mirror the implementation and break on refactors that do not change behaviour.',
          fix: 'Assert on results; verify only side effects that are themselves requirements.',
        },
        {
          mistake: 'Mixing raw values and matchers in one call: verify(gw).charge("ada", anyLong()).',
          why: 'Mockito requires all arguments to be matchers if any is; it throws InvalidUseOfMatchersException.',
          fix: 'Use eq("ada") together with anyLong().',
        },
        {
          mistake: 'Testing SQL with a mocked ResultSet or an H2 database in "compatibility mode".',
          why: 'The real dialect, constraints and locking behaviour are never exercised.',
          fix: 'Run repository tests against the real database engine with Testcontainers.',
        },
      ],
      checks: [
        {
          id: 'ts2-c1',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'An `InMemoryOrderRepository` that stores orders in a HashMap and implements `OrderRepository` is which kind of test double?',
          options: [
            { id: 'a', text: 'Dummy' },
            { id: 'b', text: 'Mock' },
            { id: 'c', text: 'Fake' },
            { id: 'd', text: 'Spy' },
          ],
          correctOptionId: 'c',
          explanation: 'A fake has a real, working implementation that takes a shortcut (memory instead of a database). It behaves consistently across many calls, unlike a stub with canned answers.',
        },
        {
          id: 'ts2-c2',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'What is the key difference between a stub and a mock?',
          options: [
            { id: 'a', text: 'Stubs are generated by libraries; mocks are hand-written' },
            { id: 'b', text: 'A stub supplies canned answers so you can check the result; a mock is used to verify which interactions happened' },
            { id: 'c', text: 'Mocks can only be used for interfaces' },
            { id: 'd', text: 'There is no difference' },
          ],
          correctOptionId: 'b',
          explanation: 'Stubs support state verification; mocks support behaviour (interaction) verification. Mockito objects can play either role depending on how you use them.',
        },
        {
          id: 'ts2-c3',
          kind: 'multi-select',
          dimension: 'debugging',
          prompt: 'Which are signs of over-mocking? Select all that apply.',
          options: [
            { id: 'a', text: 'Mocking a record such as Money or Order' },
            { id: 'b', text: 'Tests break after a refactor that did not change behaviour' },
            { id: 'c', text: 'Mocking JDBC ResultSet to test a DAO' },
            { id: 'd', text: 'Using an in-memory fake repository in service tests' },
            { id: 'e', text: 'verify() calls on getters and pure queries' },
          ],
          correctOptionIds: ['a', 'b', 'c', 'e'],
          explanation: 'Value objects should be real; types you do not own should be tested through integration tests; verifying queries couples tests to implementation. Fakes are a healthy alternative.',
        },
        {
          id: 'ts2-c4',
          kind: 'predict-output',
          dimension: 'coding',
          prompt: 'A lambda is used as a recording spy for a one-method interface. What is printed?',
          code: `import java.util.*;

interface Mailer {
    void send(String to);
}

public class Main {
    public static void main(String[] args) {
        List<String> sent = new ArrayList<>();
        Mailer spy = sent::add;
        for (String user : List.of("ada", "bob", "ada")) {
            if (!user.equals("bob")) spy.send(user);
        }
        System.out.println(sent.size() + " " + sent);
    }
}`,
          options: [
            { id: 'a', text: '3 [ada, bob, ada]' },
            { id: 'b', text: '2 [ada, ada]' },
            { id: 'c', text: '1 [ada]' },
            { id: 'd', text: 'Compile error: add returns boolean' },
          ],
          correctOptionId: 'b',
          explanation: 'A method reference to a value-returning method fits a void functional interface (the result is discarded). For single-method collaborators a lambda is often all the "mocking library" you need.',
        },
        {
          id: 'ts2-c5',
          kind: 'mcq',
          dimension: 'runtime',
          prompt: 'With Mockito 5 and no extra configuration, can you mock a `final` class?',
          options: [
            { id: 'a', text: 'No, Mockito can only mock interfaces' },
            { id: 'b', text: 'No, final classes can never be mocked in Java' },
            { id: 'c', text: 'Yes, Mockito 5 uses the inline mock maker by default, which can mock final classes and methods' },
            { id: 'd', text: 'Only if the class is also sealed' },
          ],
          correctOptionId: 'c',
          explanation: 'Mockito 5 switched the default to the inline mock maker (bytecode instrumentation via a Java agent). Before that you needed mockito-inline. Prefer introducing an interface at real boundaries anyway.',
        },
        {
          id: 'ts2-c6',
          kind: 'mcq',
          dimension: 'interview',
          prompt: 'Why do many teams prefer Testcontainers over an in-memory H2 database for repository tests?',
          options: [
            { id: 'a', text: 'Testcontainers tests run faster than H2' },
            { id: 'b', text: 'They run the same database engine as production, so dialect-specific SQL, constraints and locking are really tested' },
            { id: 'c', text: 'H2 cannot run SELECT statements' },
            { id: 'd', text: 'Testcontainers removes the need for unit tests' },
          ],
          correctOptionId: 'b',
          explanation: 'H2 is faster but differs from PostgreSQL/MySQL in syntax, types and concurrency behaviour, so tests can pass while production fails. Containers are slower to start, so reuse one per test class or suite.',
        },
      ],
      challengeIds: [],
      masteryCriteria: [
        'Choose between a stub, fake, mock and spy for a given collaborator and justify it.',
        'Write a Mockito test with stubbing, verify(never()) and an ArgumentCaptor.',
        'Refactor a class to receive its collaborators and a Clock through the constructor.',
        'Explain what mocks cannot catch and when to add an integration test.',
      ],
      relatedLessonIds: ['ts-junit', 'o-solid', 'o-interfaces', 'd-solid', 'j-jdbc'],
      revision: [
        { id: 'r1', question: 'Define stub, fake, mock and spy in one line each.', answer: 'Stub: canned answers. Fake: simplified working implementation. Mock: verifies expected interactions. Spy: records calls on a real or partial object.' },
        { id: 'r2', question: 'How do you make code that uses the current time testable?', answer: 'Inject a java.time.Clock and call Instant.now(clock); tests pass Clock.fixed(...) or Clock.offset(...).' },
        { id: 'r3', question: 'What does ArgumentCaptor do?', answer: 'Captures the argument passed to a mocked method during verify so the test can assert on its contents.' },
        { id: 'r4', question: 'Where should you mock, and where not?', answer: 'Mock at system boundaries you own as interfaces (payment, email, messaging); use real value objects and test SQL/HTTP code against real dependencies.' },
      ],
    },
  ],
};
