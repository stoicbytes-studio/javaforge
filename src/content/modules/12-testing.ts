import type { CurriculumModule } from '@/types/curriculum';

export const testingModule: CurriculumModule = {
  id: 'testing',
  order: 12,
  title: 'Unit Testing, Debugging and Code Quality',
  shortTitle: 'Testing',
  summary: 'JUnit 5, test design, test doubles and Mockito, designing code for testability, where integration tests fit, and systematic debugging.',
  level: 'advanced',
  prerequisites: ['oop'],
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
    {
      id: 'ts-debugging',
      moduleId: 'testing',
      title: 'Debugging and reading stack traces like a professional',
      summary: 'Reading stack traces and "Caused by" chains, minimal reproductions, breakpoints and stepping, logging versus debugging, git bisect, hypothesis-driven debugging and the bug categories that cause most incidents.',
      estimatedMinutes: 40,
      difficulty: 'intermediate',
      prerequisites: ['e-basics', 'ts-junit'],
      versionNotes: [
        { feature: 'Helpful NullPointerException messages (JEP 358)', since: 14, note: 'Opt-in with -XX:+ShowCodeDetailsInExceptionMessages in 14, on by default since 15' },
        { feature: 'Index out of bounds messages "Index 3 out of bounds for length 3"', since: 11 },
      ],
      objectives: [
        'Read a stack trace: find the exception type and message, the throwing frame, the first frame in your own code and the root cause at the end of the "Caused by" chain.',
        'Turn a bug report into a minimal, repeatable reproduction, ideally a failing test.',
        'Use breakpoints, conditional breakpoints, watch expressions and step over/into/out in any IDE debugger.',
        'Choose between logging and an interactive debugger, and use git bisect to find the commit that introduced a regression.',
        'Recognise the classic bug categories: off-by-one, null, equality, mutation through shared references and concurrency.',
      ],
      plainEnglish: `Debugging is detective work. Something behaves differently from what you expected, and your job is to find **where** reality and your expectation part ways — then fix the cause, not the symptom.

Professionals follow the same loop every time:

1. **Reproduce** the bug reliably, and make the reproduction as small as possible.
2. **Read the evidence**: the exception message and the stack trace tell you what failed and the exact line.
3. **Form a hypothesis** ("the port string has a space in it") and **test** it with one experiment — a breakpoint, a log line or a tiny program.
4. **Fix** it, then keep the reproduction as an automated test so the bug can never return quietly.

A **stack trace** is the JVM's record of the method calls that were in progress when an exception was thrown. The top line says what went wrong; the \`at ...\` lines say where, newest call first. If the trace contains **Caused by:**, the real origin is usually in the last one.`,
      technical: `### Anatomy of a stack trace
\`\`\`
java.lang.IllegalStateException: config line 2 is invalid      <- type + message
    at ConfigLoader.loadPort(Main.java:11)                      <- where it was thrown
    at Main.main(Main.java:49)                                  <- who called that
Caused by: java.lang.NumberFormatException: For input string: " 8080"
    at java.base/java.lang.Integer.parseInt(Integer.java:...)
    at ConfigLoader.parsePort(Main.java:19)                     <- first frame in YOUR code
    ... 1 more                                                  <- frames shared with the trace above
\`\`\`
- Each \`at\` line is a **stack frame**: class, method, file and line. The **top** frame is where the exception was created; reading **downwards** walks back through the callers to \`main\` or \`Thread.run\`.
- **Top-down** tells you *what* broke; **bottom-up** tells you *how you got there* (which request, job or test triggered it).
- **Caused by:** appears when code wrapped one exception in another (\`new IllegalStateException(msg, e)\`). Read the **last** "Caused by" first — that is the root cause — then read upwards for the context each layer added. \`... n more\` means the remaining frames are identical to the enclosing trace and were omitted.
- Skip framework and JDK frames (\`java.base/\`, \`org.springframework\`, proxies with \`$$\`) and look for the **first frame in your own package**: that is usually where to put the first breakpoint.
- **Suppressed:** entries come from try-with-resources: \`close()\` also failed while the body was already throwing.
- Line numbers come from the class file's debug info. Since Java 14 (JEP 358, on by default from 15) NullPointerExceptions name the null expression, e.g. *Cannot invoke "String.split(String)" because the return value of "java.util.Map.get(Object)" is null*.

### Reproduce, then minimise
A bug you cannot reproduce cannot be verified as fixed. Capture inputs, configuration, versions and timing; then shrink: remove code, data and steps until removing anything else makes the bug disappear. The minimal reproduction frequently *is* the diagnosis, and it becomes the regression test (see the ts-junit lesson).

### Using a debugger (every major IDE has the same tools)
- **Breakpoint**: pause when execution reaches a line. **Conditional breakpoint**: pause only when an expression is true (\`orderId.equals("o-981")\`, \`i == 999\`) — essential in loops and hot paths.
- **Exception breakpoint**: pause where an exception type is *thrown*, even if something later catches and swallows it.
- **Logpoint / tracepoint**: print an expression without pausing and without editing code.
- **Watch expressions** and **evaluate expression** inspect or compute values in the paused frame. The **Variables** and **Frames** views let you walk up the call stack and see each caller's locals.
- **Stepping**: *step over* runs the current line; *step into* enters the called method; *step out* finishes the current method and returns to the caller; *resume* runs to the next breakpoint. *Drop frame* (where supported) restarts the current method.
- Remote debugging attaches to a running JVM started with \`-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005\` — never expose that port in production.

### Logging versus debugging
A debugger is the fastest tool for a **local, reproducible** bug. Logging (and metrics/traces) wins when the bug happens **only in production**, is **intermittent**, involves **many threads** (pausing one thread changes the timing and can hide a race) or needs a **history** of events. Log at boundaries with context (ids, sizes, durations) using parameterised messages: \`log.debug("loaded {} rows for {}", count, customerId)\`.

### Searching instead of guessing
- **Hypothesis-driven debugging**: write down what you expect, predict what an experiment will show, run it. Change **one thing at a time**. If the result surprises you, your mental model was wrong — that is progress.
- **Binary search** the space: comment out half the pipeline, check the data halfway through, or let **git bisect** find the first bad commit: mark a known good and a known bad commit and Git checks out the midpoint each time. 1,000 commits take about 10 steps; \`git bisect run ./test.sh\` automates it.
- **Rubber-duck debugging**: explain the code line by line, out loud, to someone (or something). Saying "and here x is always positive" is often when you realise it is not.

### Bug categories that cause most incidents
- **Off-by-one**: \`<=\` instead of \`<\`, 1-based vs 0-based, inclusive vs exclusive ranges. Test boundaries.
- **Null**: a missing map entry or optional field travels far from its source before it explodes. Validate at boundaries; use \`Optional\` for return values that may be absent.
- **Equality**: \`==\` on objects compares references. \`Integer\` caches -128..127, so \`==\` "works" for small numbers and fails for large ones. Use \`equals\`, and override \`equals\`/\`hashCode\` together.
- **Mutation through shared references**: two variables point to one mutable object; changing it "here" changes it "there". Make defensive copies (\`List.copyOf\`) or use immutable types.
- **Concurrency**: races, lost updates (\`count++\` is read-modify-write), deadlocks, visibility. They are timing-dependent, so they vanish under the debugger. Take a **thread dump** (\`jcmd <pid> Thread.print\` or \`jstack\`) for hangs.`,
      whyItExists: `Most of a developer's time goes into understanding why code does not do what it should. Guessing and changing things at random is slow and introduces new bugs. A systematic method — reproduce, read the evidence, hypothesise, test, fix, add a regression test — turns debugging from luck into a repeatable skill, and it is exactly what interviewers probe with "walk me through how you would debug this".`,
      whenToUse: [
        'Read the full stack trace, including every "Caused by", before touching any code.',
        'Write a failing test or a tiny main method that reproduces the bug before you fix it.',
        'Use a conditional or exception breakpoint when the failure happens on one iteration among thousands or the exception is swallowed.',
        'Use logging, metrics and thread dumps for production-only, intermittent or multi-threaded problems.',
        'Use git bisect when something worked in an earlier version and you do not know which change broke it.',
      ],
      whenNotToUse: [
        'Do not change several things at once "to see if it helps"; you will not know which change mattered.',
        'Do not catch and swallow an exception to make a stack trace go away; that hides the bug.',
        'Do not leave temporary System.out.println debugging in committed code; use a logger at the right level.',
        'Do not attach a debugger to a production JVM serving traffic: a breakpoint pauses real requests.',
      ],
      examples: [
        {
          id: 'debug-stack-trace-chain',
          title: 'Reading a wrapped exception and its "Caused by" chain',
          runnable: true,
          code: `import java.util.List;

class ConfigLoader {
    int loadPort(List<String> lines) {
        for (int i = 0; i < lines.size(); i++) {
            String line = lines.get(i);
            if (line.startsWith("port=")) {
                try {
                    return parsePort(line.substring(5));
                } catch (NumberFormatException e) {
                    throw new IllegalStateException("config line " + (i + 1) + " is invalid", e);
                }
            }
        }
        throw new IllegalStateException("no port configured");
    }

    private int parsePort(String text) {
        return Integer.parseInt(text);              // bug: " 8080" has a leading space
    }
}

public class Main {
    // Prints a trace the way the JVM does, but hides JDK frames (their line numbers vary by version).
    static void printTrace(Throwable t) {
        StackTraceElement[] enclosing = new StackTraceElement[0];
        String prefix = "";
        while (t != null) {
            StackTraceElement[] frames = t.getStackTrace();
            int m = frames.length - 1, n = enclosing.length - 1;
            while (m >= 0 && n >= 0 && frames[m].equals(enclosing[n])) { m--; n--; }
            System.out.println(prefix + t);
            for (int i = 0; i <= m; i++) {
                StackTraceElement f = frames[i];
                if (f.getClassName().startsWith("java.")) continue;
                System.out.println("    at " + f.getClassName() + "." + f.getMethodName()
                        + "(" + f.getFileName() + ":" + f.getLineNumber() + ")");
            }
            if (m < frames.length - 1) System.out.println("    ... " + (frames.length - 1 - m) + " more");
            enclosing = frames;
            t = t.getCause();
            prefix = "Caused by: ";
        }
    }

    public static void main(String[] args) {
        List<String> config = List.of("name=shop", "port= 8080");
        try {
            new ConfigLoader().loadPort(config);
        } catch (IllegalStateException e) {
            printTrace(e);
        }
        // Minimal reproduction of the root cause, then the fix
        try {
            Integer.parseInt(" 8080");
        } catch (NumberFormatException e) {
            System.out.println("reproduced: " + e.getMessage());
        }
        System.out.println("fixed: " + Integer.parseInt(" 8080".strip()));
    }
}`,
          expectedOutput: `java.lang.IllegalStateException: config line 2 is invalid
    at ConfigLoader.loadPort(Main.java:11)
    at Main.main(Main.java:49)
Caused by: java.lang.NumberFormatException: For input string: " 8080"
    at ConfigLoader.parsePort(Main.java:19)
    at ConfigLoader.loadPort(Main.java:9)
    ... 1 more
reproduced: For input string: " 8080"
fixed: 8080`,
          explanation: 'The outer exception says which config line failed; the "Caused by" says why (a leading space). The first frame in our own code under the root cause, parsePort at line 19, is where the fix belongs. The real JVM output would also show the Integer.parseInt frames from java.base above it.',
        },
        {
          id: 'debug-common-bugs',
          title: 'Five classic bug categories, each with its fix',
          runnable: true,
          code: `import java.util.*;

public class Main {
    record Team(String name, List<String> members) {}

    record SafeTeam(String name, List<String> members) {
        SafeTeam { members = List.copyOf(members); }      // defensive copy
    }

    static final Map<String, String> EMAILS = Map.of("ada", "ada@example.com");

    static String domain(String user) {
        return EMAILS.get(user).split("@")[1];              // null when user is unknown
    }

    static String domainSafe(String user) {
        String email = EMAILS.get(user);
        return email == null ? "unknown" : email.split("@")[1];
    }

    public static void main(String[] args) {
        // 1. Off-by-one: <= walks one element past the end
        int[] prices = {10, 20, 30};
        int sum = 0;
        try {
            for (int i = 0; i <= prices.length; i++) sum += prices[i];
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("off-by-one: " + e.getMessage());
        }
        sum = 0;
        for (int i = 0; i < prices.length; i++) sum += prices[i];
        System.out.println("fixed sum: " + sum);

        // 2. Null: a missing map entry flows into a method call
        try {
            domain("bob");
        } catch (NullPointerException e) {
            System.out.println("null: " + e.getMessage());
        }
        System.out.println("fixed: " + domainSafe("bob") + ", " + domainSafe("ada"));

        // 3. Equality: == compares references, equals compares values
        Integer small1 = 100, small2 = 100, big1 = 1000, big2 = 1000;
        System.out.println("== : " + (small1 == small2) + " " + (big1 == big2));
        System.out.println("equals: " + big1.equals(big2));

        // 4. Mutation through a shared reference
        List<String> names = new ArrayList<>(List.of("ada"));
        Team team = new Team("core", names);
        SafeTeam safe = new SafeTeam("core", names);
        names.add("mallory");                                // caller reuses its list
        System.out.println("shared: " + team.members() + " copied: " + safe.members());

        // 5. Modifying a collection while iterating over it
        List<Integer> stock = new ArrayList<>(List.of(5, 0, 3, 0));
        try {
            for (Integer qty : stock) if (qty == 0) stock.remove(qty);
        } catch (ConcurrentModificationException e) {
            System.out.println("iteration: " + e.getClass().getSimpleName());
        }
        stock.removeIf(qty -> qty == 0);
        System.out.println("fixed stock: " + stock);
    }
}`,
          expectedOutput: `off-by-one: Index 3 out of bounds for length 3
fixed sum: 60
null: Cannot invoke "String.split(String)" because the return value of "java.util.Map.get(Object)" is null
fixed: unknown, example.com
== : true false
equals: true
shared: [ada, mallory] copied: [ada]
iteration: ConcurrentModificationException
fixed stock: [5, 3]`,
          explanation: 'Every bug here is caught and printed so the program exits normally. Notice how much the JDK messages tell you: the index and length, and exactly which expression was null. Integer == happens to be true for 100 because of the Integer cache (-128 to 127) and false for 1000, which is why such bugs survive small test values. ConcurrentModificationException is the single-threaded cousin of a data race: the collection changed under an active iterator.',
        },
        {
          id: 'debug-bisect-search',
          title: 'Binary search for the first bad commit (what git bisect does)',
          runnable: true,
          code: `public class Main {
    // Pretend commit 37 introduced the bug. isBad = "check out the commit, build it, run the failing test".
    static final int FIRST_BAD = 37;
    static int builds = 0;

    static boolean isBad(int commit) {
        builds++;
        return commit >= FIRST_BAD;
    }

    public static void main(String[] args) {
        int good = 0;      // last release: known good
        int bad = 100;     // today: known bad
        while (bad - good > 1) {
            int mid = good + (bad - good) / 2;
            boolean broken = isBad(mid);
            System.out.println("commit " + mid + " is " + (broken ? "bad" : "good"));
            if (broken) bad = mid;
            else good = mid;
        }
        System.out.println("first bad commit: " + bad);
        System.out.println("builds: " + builds + " (instead of up to 100)");
    }
}`,
          expectedOutput: `commit 50 is bad
commit 25 is good
commit 37 is bad
commit 31 is good
commit 34 is good
commit 35 is good
commit 36 is good
first bad commit: 37
builds: 7 (instead of up to 100)`,
          explanation: 'Each test halves the range that can contain the culprit, so 100 commits need at most 7 builds and 1,000 need about 10. git bisect keeps exactly this good/bad pair for you; the same idea works on data (which half of the input file triggers the bug?) and on code (which half of the pipeline corrupts the value?).',
        },
        {
          id: 'debug-git-bisect-session',
          title: 'A git bisect session, manual and automated (shell)',
          runnable: false,
          code: `# Manual: Git checks out the midpoint; you test it and answer good or bad
git bisect start
git bisect bad                 # the current commit is broken
git bisect good v2.3.0         # the last release worked
# ... build and run the reproduction, then:
git bisect good                # or: git bisect bad
# ... repeat until Git prints "<sha> is the first bad commit"
git bisect reset               # return to where you started

# Automated: a script that exits 0 for good, 1-127 (except 125) for bad, 125 to skip
git bisect start HEAD v2.3.0
git bisect run ./mvnw -q test -Dtest=PriceCalculatorTest#roundsStartedKilograms
git bisect reset`,
          explanation: 'These are shell commands, not Java. The automated form needs a reproduction that runs non-interactively and returns an exit code, which is one more reason to turn every bug into a test first.',
        },
        {
          id: 'debug-race-condition',
          title: 'A race condition that disappears under the debugger',
          runnable: false,
          code: `import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    static int unsafeCount = 0;                         // shared, unsynchronised
    static final AtomicInteger safeCount = new AtomicInteger();

    public static void main(String[] args) throws Exception {
        try (ExecutorService pool = Executors.newFixedThreadPool(4)) {
            for (int t = 0; t < 4; t++) {
                pool.submit(() -> {
                    for (int i = 0; i < 100_000; i++) {
                        unsafeCount++;                  // read, add, write: updates get lost
                        safeCount.incrementAndGet();    // one atomic operation
                    }
                });
            }
        }                                               // close() waits for the tasks (Java 19+)
        System.out.println("unsafe: " + unsafeCount);   // varies, usually below 400000
        System.out.println("safe:   " + safeCount.get()); // always 400000
    }
}`,
          explanation: 'Not run automatically because the unsafe result changes from run to run, which is the point. Put a breakpoint inside the loop and the threads take turns, so the bug often vanishes: a "Heisenbug". Diagnose races by reasoning about shared mutable state, with stress tests, and with tools such as thread dumps rather than by stepping.',
        },
      ],
      walkthrough: {
        exampleId: 'debug-stack-trace-chain',
        steps: [
          { lines: [4, 16], text: 'loadPort finds the "port=" line and delegates parsing. It catches the low-level NumberFormatException and wraps it in an IllegalStateException that adds context: which line of the file was bad. Passing e as the cause keeps the original trace.' },
          { lines: [18, 20], text: 'The real bug: Integer.parseInt does not trim whitespace, so " 8080" fails. In the printed trace this is the first frame in our own code under the root cause.' },
          { lines: [25, 32], text: 'printTrace mimics Throwable.printStackTrace: print the exception (type + message), then its frames. Frames that are identical to the end of the enclosing trace are counted instead of repeated, which is what "... 1 more" means.' },
          { lines: [33, 43], text: 'JDK frames are hidden only to keep this output stable across Java versions; in a real trace they appear above parsePort. Then the loop moves to getCause() and prints it with the "Caused by: " prefix, exactly like the JVM.' },
          { lines: [46, 52], text: 'Reading the output: the top line gives the symptom and context (config line 2), the last "Caused by" gives the root cause (the input string " 8080").' },
          { lines: [53, 59], text: 'A minimal reproduction in one line confirms the hypothesis without the loader, the file or the loop. The fix is to strip the value before parsing; in a real project this line becomes a regression test.' },
        ],
      },
      realWorld: {
        title: 'The invoice job that failed only on the first of the month',
        scenario: `A nightly invoicing job crashed once a month with \`IllegalStateException: billing run failed\`. The on-call engineer restarted it, it passed, and the ticket was closed — three months in a row. Nobody had scrolled down to the last "Caused by": \`DateTimeException: Invalid date 'FEBRUARY 30'\`, thrown from a helper that computed "same day next month" with \`withDayOfMonth(day)\` instead of \`plusMonths(1)\`.

Once someone read the full trace, the fix took ten minutes: reproduce with a fixed \`Clock\` set to 30 January in a unit test, watch it fail, switch to \`plusMonths\`, add boundary cases for the 29th, 30th and 31st and for leap years. The post-mortem added two team habits: always paste the **entire** trace into the ticket, and never close a bug without a failing test that now passes. A \`git bisect run\` with that test later showed the bug had been introduced by a "simplification" eight months earlier.`,
      },
      commonMistakes: [
        {
          mistake: 'Reading only the first line of a stack trace.',
          why: 'Wrapping exceptions put the useful information at the bottom, in the last "Caused by". The top line is often a generic "request failed".',
          fix: 'Scroll to the last "Caused by", read its message, then find the first frame in your own package below it.',
        },
        {
          mistake: 'Wrapping an exception without passing the cause.',
          why: 'throw new IllegalStateException("failed: " + e.getMessage()) keeps the message but throws away the original type and stack trace, so the root cause can no longer be found.',
          fix: 'Always pass the original exception as the cause.',
          code: `catch (SQLException e) {
    throw new IllegalStateException("could not load order " + id, e);   // keep e
}`,
        },
        {
          mistake: 'Fixing the symptom: adding a null check where the NullPointerException surfaced.',
          why: 'The null was created somewhere else (a missing row, an unset field). Guarding the crash site hides the bug and moves the failure further away.',
          fix: 'Ask where the null came from and fix it at the source, or validate at the boundary with Objects.requireNonNull.',
        },
        {
          mistake: 'Debugging a race condition by stepping through it.',
          why: 'Breakpoints serialise the threads, so the problematic interleaving rarely happens while you watch.',
          fix: 'Reason about shared mutable state, add logging with thread names, stress-test, and take thread dumps for hangs.',
        },
        {
          mistake: 'Calling it fixed when the bug "stopped happening".',
          why: 'Without a reliable reproduction you cannot tell a fix from luck, and the bug can return unnoticed.',
          fix: 'Reproduce first, see the test fail, apply the fix, see it pass, and keep the test.',
        },
      ],
      checks: [
        {
          id: 'ts3-c1',
          kind: 'mcq',
          dimension: 'debugging',
          prompt: 'Where should you start investigating this stack trace?',
          code: `org.example.api.ApiException: request failed
    at org.example.api.OrderController.create(OrderController.java:41)
    ...
Caused by: org.example.orders.OrderException: could not price order o-981
    at org.example.orders.OrderService.price(OrderService.java:77)
    ...
Caused by: java.lang.ArithmeticException: / by zero
    at org.example.orders.Discounts.perItem(Discounts.java:23)
    at org.example.orders.OrderService.price(OrderService.java:72)
    ... 12 more`,
          options: [
            { id: 'a', text: 'OrderController.java line 41, because it is the first line of the trace' },
            { id: 'b', text: 'Discounts.java line 23, the first frame of the last "Caused by" (the root cause)' },
            { id: 'c', text: 'The 12 omitted frames, because the bug is probably in the framework' },
            { id: 'd', text: 'OrderService.java line 77, because it appears in the middle' },
          ],
          correctOptionId: 'b',
          explanation: 'Each layer wrapped the previous exception and added context. The last "Caused by" is the root cause: a division by zero in Discounts.perItem at line 23. The outer layers tell you which request and order triggered it (o-981), which is useful for reproducing it.',
        },
        {
          id: 'ts3-c2',
          kind: 'predict-output',
          dimension: 'debugging',
          prompt: 'This loop is meant to print every day. What does it actually print?',
          code: `public class Main {
    public static void main(String[] args) {
        String[] days = {"Mon", "Tue", "Wed"};
        StringBuilder out = new StringBuilder();
        try {
            for (int i = 1; i <= days.length; i++) out.append(days[i]).append(' ');
        } catch (ArrayIndexOutOfBoundsException e) {
            out.append("| ").append(e.getMessage());
        }
        System.out.println(out);
    }
}`,
          options: [
            { id: 'a', text: 'Mon Tue Wed' },
            { id: 'b', text: 'Tue Wed | Index 3 out of bounds for length 3' },
            { id: 'c', text: 'Mon Tue Wed | Index 3 out of bounds for length 3' },
            { id: 'd', text: 'Tue Wed' },
          ],
          correctOptionId: 'b',
          explanation: 'Two off-by-one errors in one loop: starting at 1 skips "Mon", and <= reaches index 3, which does not exist. Arrays are 0-based, so the idiomatic loop is for (int i = 0; i < days.length; i++), or simply an enhanced for loop.',
        },
        {
          id: 'ts3-c3',
          kind: 'predict-output',
          dimension: 'debugging',
          prompt: 'Two callers each ask for the default options. What is printed?',
          code: `import java.util.*;

public class Main {
    private static final List<String> DEFAULTS = new ArrayList<>(List.of("gzip"));

    static List<String> options() { return DEFAULTS; }

    public static void main(String[] args) {
        List<String> mine = options();
        mine.add("debug");
        List<String> yours = options();
        System.out.println(yours + " " + (mine == yours));
    }
}`,
          options: [
            { id: 'a', text: '[gzip] false' },
            { id: 'b', text: '[gzip, debug] true' },
            { id: 'c', text: '[gzip] true' },
            { id: 'd', text: 'Compile error: DEFAULTS is final' },
          ],
          correctOptionId: 'b',
          explanation: 'final only stops the variable from pointing to another list; the list itself is mutable. Both callers receive a reference to the same object, so one caller\'s change leaks to every other caller. Return List.copyOf(DEFAULTS) or store an unmodifiable List.of(...).',
        },
        {
          id: 'ts3-c4',
          kind: 'multi-select',
          dimension: 'debugging',
          prompt: 'In which situations is logging (or metrics and thread dumps) usually a better tool than pausing at breakpoints? Select all that apply.',
          options: [
            { id: 'a', text: 'A failure that happens only in production, a few times a day' },
            { id: 'b', text: 'A suspected race between two threads updating the same map' },
            { id: 'c', text: 'A unit test that fails every time on your machine' },
            { id: 'd', text: 'You need the sequence of events that led up to a failure an hour ago' },
            { id: 'e', text: 'Inspecting the local variables of one method for one specific input you can run locally' },
          ],
          correctOptionIds: ['a', 'b', 'd'],
          explanation: 'Breakpoints shine for local, reproducible bugs (c, e). Production-only and intermittent problems need evidence collected while they happen, and pausing threads changes the timing that causes races. Logs also give you history, which a debugger cannot show after the fact.',
        },
        {
          id: 'ts3-c5',
          kind: 'mcq',
          dimension: 'interview',
          prompt: 'A regression appeared somewhere in the last 1,000 commits and you have an automated test that detects it. Roughly how many builds does `git bisect run` need to find the first bad commit?',
          options: [
            { id: 'a', text: 'About 10' },
            { id: 'b', text: 'About 100' },
            { id: 'c', text: 'About 500 on average' },
            { id: 'd', text: '1,000' },
          ],
          correctOptionId: 'a',
          explanation: 'Each build halves the range: log2(1000) is just under 10. This only works if good and bad are well defined, which is why a deterministic reproduction comes first.',
        },
        {
          id: 'ts3-c6',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'A user reports "the total is sometimes wrong". What is the most effective first step?',
          options: [
            { id: 'a', text: 'Add null checks and try/catch blocks around the total calculation' },
            { id: 'b', text: 'Rewrite the calculation in a cleaner way and hope the bug goes away' },
            { id: 'c', text: 'Collect the exact inputs from a failing case and reproduce the wrong total, ideally as a failing test' },
            { id: 'd', text: 'Attach a debugger to the production server and wait for it to happen' },
          ],
          correctOptionId: 'c',
          explanation: 'Without a reproduction you cannot test hypotheses or confirm a fix. Defensive code and rewrites treat symptoms at random, and breakpoints on a production server pause real users\' requests.',
        },
      ],
      challengeIds: [],
      masteryCriteria: [
        'Given a multi-level stack trace, identify the root cause and the first frame in application code within a minute.',
        'Reduce a failing scenario to a minimal reproduction and keep it as a regression test.',
        'Explain when to use a conditional breakpoint, an exception breakpoint, logging, a thread dump and git bisect.',
        'Recognise off-by-one, null, equality, shared-mutation and concurrency bugs from their symptoms.',
      ],
      relatedLessonIds: ['ts-junit', 'e-basics', 'e-design', 'cc-synchronization', 'perf-diagnostics', 'prod-observability'],
      revision: [
        { id: 'r1', question: 'In a trace with several "Caused by" sections, which one shows the root cause?', answer: 'The last one. Read its message and the first frame in your own code below it, then read upwards for context.' },
        { id: 'r2', question: 'What does "... 5 more" mean in a stack trace?', answer: 'The remaining 5 frames are identical to the end of the enclosing exception\'s trace and were omitted to avoid repetition.' },
        { id: 'r3', question: 'What is the difference between step over, step into and step out?', answer: 'Step over runs the current line, including any calls, and stops at the next line; step into enters the method being called; step out runs to the end of the current method and stops in the caller.' },
        { id: 'r4', question: 'Why do race conditions often disappear when you debug them?', answer: 'Breakpoints and stepping change the timing and effectively serialise the threads, so the problematic interleaving no longer happens.' },
        { id: 'r5', question: 'Why is Integer == Integer true for 100 but false for 1000?', answer: 'Autoboxing uses Integer.valueOf, which returns cached objects for -128 to 127; larger values are distinct objects, and == compares references. Use equals.' },
      ],
    },
  ],
};
