import type { LessonConcepts } from '@/types/curriculum';

/** Concept pages for module 12 (Unit Testing, Debugging and Code Quality), keyed by lesson id. */
export const testingConcepts: Record<string, LessonConcepts> = {
  'ts-junit': {
    interviewDefinition:
      'A **unit test** is a fast, deterministic, automated check of one behaviour of a small unit, exercised through its public API. **JUnit 5** is three parts: the **Platform** (the launcher that Maven, Gradle and IDEs call), **Jupiter** (the `@Test`/`Assertions` programming model and extension API) and **Vintage** (runs JUnit 3/4 tests). Jupiter creates a new test-class instance per test method by default, reports a thrown `AssertionError` as a failure and any other exception as an error, and supports parameterised, nested, dynamic and tagged tests.',
    interviewFollowUps: [
      {
        question: 'What replaced JUnit 4 runners and rules?',
        answer: 'The Jupiter **extension model**: `@ExtendWith` registers extensions that hook into lifecycle callbacks, parameter resolution and exception handling. Unlike `@RunWith`, several extensions compose on one class (for example Mockito and Spring together).',
      },
      {
        question: 'Why is `@BeforeAll` static?',
        answer: 'With the default per-method lifecycle there is no single instance on which to call it — each test gets a new one. Annotating the class with `@TestInstance(Lifecycle.PER_CLASS)` uses one instance for all tests and allows non-static `@BeforeAll`, at the cost of shared instance state.',
      },
      {
        question: 'How do you choose test inputs systematically?',
        answer: 'Equivalence partitioning (one representative per class of inputs that behave alike) plus boundary value analysis (values on and either side of every limit). Bugs cluster at boundaries: `>` versus `>=`, empty versus one element, the maximum value.',
      },
      {
        question: 'Does 100% line coverage mean the code is well tested?',
        answer: 'No. Coverage shows which lines ran, not whether anything checked their result. Mutation testing (for example PIT) changes the code and reports surviving mutants — tests that still pass when the code is wrong.',
      },
    ],
    mnemonic: {
      device: 'Good unit tests are F.I.R.S.T.',
      expansion: [
        { key: 'Fast', meaning: 'Milliseconds each, so the whole suite runs on every change' },
        { key: 'Independent', meaning: 'No shared state; pass in any order, alone or together' },
        { key: 'Repeatable', meaning: 'Same result every run: no real clock, network or unseeded randomness' },
        { key: 'Self-validating', meaning: 'Pass or fail by assertion, never by a human reading output' },
        { key: 'Timely', meaning: 'Written with (or before) the code, when design is still cheap to change' },
      ],
      visual: 'Picture the test runner as a sprinter who comes FIRST because every test is light, alone in its own lane and finishes the same way every race.',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'A smoke detector for your code',
        body: 'A smoke detector is cheap, always on, and tells you about a fire minutes after it starts — not weeks later when a customer calls. Unit tests are the same: the value is not proving the code correct once, but noticing within seconds when a later change breaks it.',
      },
      {
        kind: 'insight',
        title: 'Hard-to-test code is telling you something',
        body: 'If a test needs ten lines of setup, a database and a fixed time zone to check one rule, the rule is entangled with too many dependencies. Painful tests are design feedback: extract the decision into a small class that takes plain values, and both the test and the production code get simpler.',
      },
      {
        kind: 'real-world',
        title: 'Flaky tests destroy trust',
        body: 'A suite with a few tests that fail randomly — because they depend on wall-clock time, test order or a shared database row — trains developers to press "re-run" and ignore red builds. Then a real failure is ignored too. Teams that keep suites healthy quarantine or fix flaky tests immediately and treat determinism as a requirement.',
      },
      {
        kind: 'angle',
        title: 'A test name is a specification',
        body: 'Read only the names of a well-written test class and you get the rules of the class under test: `rejectsNonPositiveWeight`, `roundsUpStartedKilograms`, `chargesBaseRateUpToOneKilogram`. When one fails, the report itself says which rule broke. `@DisplayName` and `@Nested` classes let you shape that specification further.',
      },
    ],
    diagrams: [
      {
        id: 'ts1-pyramid',
        kind: 'concept',
        title: 'The test pyramid',
        caption: 'The base is wide because unit tests are cheap, fast and precise. Each layer up is slower, more realistic and more brittle, so you need fewer of them.',
        cols: 5,
        rows: 4,
        nodes: [
          { id: 'e2e', label: 'End-to-end', detail: 'few: critical journeys', col: 2, row: 0, tone: 'danger' },
          { id: 'contract', label: 'Contract tests', detail: 'API agreements between services', col: 1, row: 1, span: 3, tone: 'warning' },
          { id: 'integ', label: 'Integration tests', detail: 'real DB, HTTP, framework wiring (Testcontainers)', col: 1, row: 2, span: 3, tone: 'accent' },
          { id: 'unit', label: 'Unit tests', detail: 'many: milliseconds each, no I/O, precise failures', col: 0, row: 3, span: 5, tone: 'success' },
        ],
        edges: [
          { from: 'unit', to: 'integ', label: 'slower, fewer' },
          { from: 'integ', to: 'contract' },
          { from: 'contract', to: 'e2e', label: 'most realistic' },
        ],
      },
      {
        id: 'ts1-platform',
        kind: 'architecture',
        title: 'How JUnit 5 is put together',
        caption: 'Build tools and IDEs only talk to the Platform launcher. Test engines plug in underneath, which is how JUnit 4 tests and other frameworks run in the same build.',
        cols: 3,
        rows: 4,
        nodes: [
          { id: 'mvn', label: 'Maven Surefire', col: 0, row: 0, tone: 'neutral' },
          { id: 'gradle', label: 'Gradle', col: 1, row: 0, tone: 'neutral' },
          { id: 'ide', label: 'IDE', col: 2, row: 0, tone: 'neutral' },
          { id: 'launcher', label: 'Platform Launcher', detail: 'discover, filter, execute, report', col: 0, row: 1, span: 3, tone: 'primary' },
          { id: 'jupiter', label: 'Jupiter engine', detail: '@Test, extensions', col: 0, row: 2, tone: 'accent' },
          { id: 'vintage', label: 'Vintage engine', detail: 'JUnit 3 and 4 tests', col: 1, row: 2, tone: 'accent' },
          { id: 'other', label: 'Other engines', detail: 'e.g. Cucumber, Spock', col: 2, row: 2, tone: 'accent' },
          { id: 'tests', label: 'Your test classes', detail: 'src/test/java', col: 0, row: 3, span: 3, shape: 'note', tone: 'success' },
        ],
        edges: [
          { from: 'mvn', to: 'launcher' },
          { from: 'gradle', to: 'launcher' },
          { from: 'ide', to: 'launcher' },
          { from: 'launcher', to: 'jupiter' },
          { from: 'launcher', to: 'vintage' },
          { from: 'launcher', to: 'other' },
          { from: 'jupiter', to: 'tests', label: 'runs' },
        ],
        groups: [{ label: 'TestEngines', fromCol: 0, toCol: 2, fromRow: 2, toRow: 2, tone: 'accent' }],
      },
      {
        id: 'ts1-lifecycle',
        kind: 'flow',
        title: 'Jupiter test lifecycle (default PER_METHOD)',
        caption: 'Everything inside the box repeats for every test method, including creating a brand-new instance of the test class. That is why instance fields cannot leak between tests.',
        cols: 5,
        rows: 2,
        nodes: [
          { id: 'ba', label: '@BeforeAll', detail: 'static, once', col: 0, row: 0, tone: 'neutral' },
          { id: 'new', label: 'new TestClass()', col: 1, row: 0, tone: 'primary' },
          { id: 'be', label: '@BeforeEach', detail: 'fresh fixtures', col: 2, row: 0, tone: 'primary' },
          { id: 'test', label: '@Test method', detail: 'arrange, act, assert', col: 3, row: 0, tone: 'accent' },
          { id: 'ae', label: '@AfterEach', detail: 'runs even on failure', col: 4, row: 0, tone: 'primary' },
          { id: 'next', label: 'Next test method', col: 2, row: 1, span: 2, shape: 'pill', tone: 'neutral' },
          { id: 'aa', label: '@AfterAll', detail: 'static, once', col: 0, row: 1, tone: 'neutral' },
        ],
        edges: [
          { from: 'ba', to: 'new' },
          { from: 'new', to: 'be' },
          { from: 'be', to: 'test' },
          { from: 'test', to: 'ae' },
          { from: 'ae', to: 'next' },
          { from: 'next', to: 'new', label: 'repeat', dashed: true },
          { from: 'next', to: 'aa', label: 'when done' },
        ],
        groups: [{ label: 'Per test method', fromCol: 1, toCol: 4, fromRow: 0, toRow: 0, tone: 'primary' }],
      },
    ],
    variants: [
      {
        title: 'Types of tests',
        intro: 'Teams draw the lines slightly differently; what matters is the trade-off between speed and realism at each level.',
        items: [
          { name: 'Unit', summary: 'One class or a small cluster, no I/O; collaborators replaced by real value objects or test doubles. Milliseconds each.' },
          { name: 'Integration', summary: 'Your code with a real dependency: database, message broker, HTTP server, framework context. Seconds each; Testcontainers is the usual tool.' },
          { name: 'Contract', summary: 'Checks that a provider and its consumers agree on an API (requests, responses, message formats) without running both together; e.g. consumer-driven contracts with Pact or Spring Cloud Contract.' },
          { name: 'End-to-end', summary: 'The deployed system driven like a user (UI or public API). Most realistic, slowest and most brittle: keep to critical journeys.' },
          { name: 'Others worth naming', summary: 'Acceptance (business-readable scenarios), performance/load, mutation, property-based and smoke tests.' },
        ],
      },
      {
        title: 'JUnit 5 annotation families',
        items: [
          { name: 'Test kinds', summary: '@Test, @ParameterizedTest, @RepeatedTest, @TestFactory (dynamic tests built at run time), @Nested (inner classes that group related tests).', support: 'supported', code: '@ParameterizedTest\n@ValueSource(ints = {9, 10})\nvoid boundary(int qty) { ... }' },
          { name: 'Lifecycle', summary: '@BeforeAll, @BeforeEach, @AfterEach, @AfterAll; @TestInstance(PER_CLASS) changes instance creation.', support: 'supported' },
          { name: 'Parameter sources', summary: '@ValueSource, @CsvSource, @CsvFileSource, @EnumSource, @MethodSource, @NullAndEmptySource.', support: 'supported', code: '@CsvSource({"1, 549", "1001, 599"})' },
          { name: 'Naming, filtering and control', summary: '@DisplayName, @Tag (select subsets in the build), @Disabled, @Timeout, @TestMethodOrder.', support: 'supported' },
          { name: 'Conditions', summary: '@EnabledOnOs, @EnabledOnJre, @EnabledIfSystemProperty, @EnabledIfEnvironmentVariable and their Disabled counterparts.', support: 'supported' },
          { name: 'Extensions and built-ins', summary: '@ExtendWith and @RegisterExtension plug in behaviour (Mockito, Spring); @TempDir injects a temporary directory that is deleted afterwards.', support: 'supported', code: '@Test void writes(@TempDir Path dir) { ... }' },
        ],
      },
    ],
    deepDive: [
      {
        title: 'Why JUnit 5 split into Platform and engines',
        body: 'JUnit 4 was a single JAR that IDEs and build tools reached into through internal APIs, so improving JUnit broke tools. JUnit 5 separates a stable launcher API (Platform) from programming models (engines). Tools integrate once with the Platform; any engine — Jupiter, Vintage, or third-party ones — is discovered through `ServiceLoader` and runs in the same build and report.',
        sources: [{ label: 'JUnit 5 User Guide', url: 'https://junit.org/junit5/docs/current/user-guide/' }],
      },
      {
        title: 'Parallel execution is opt-in for good reason',
        body: 'Jupiter can run tests concurrently (`junit.jupiter.execution.parallel.enabled=true`, with `@Execution(CONCURRENT)` or a default mode). Tests that share static state, files, system properties or a database then interfere. `@ResourceLock` declares shared resources so conflicting tests are serialised. Independence (the I in FIRST) is what makes parallelism safe.',
        sources: [{ label: 'JUnit 5 User Guide: Parallel Execution', url: 'https://junit.org/junit5/docs/current/user-guide/' }],
      },
      {
        title: 'Measuring test strength: coverage versus mutation testing',
        body: 'Line coverage counts what executed; a test with no assertions can reach 100%. Mutation testing tools such as PIT make small changes to the bytecode (flip `>` to `>=`, return 0, remove a call) and rerun the tests: a mutant that survives marks a behaviour nobody checks. It is slower, so teams run it on critical packages or in nightly builds.',
        sources: [
          { label: 'PIT mutation testing', url: 'https://pitest.org/' },
          { label: 'Martin Fowler: Test Pyramid', url: 'https://martinfowler.com/bliki/TestPyramid.html' },
          { label: 'Unit Testing Principles, Practices, and Patterns (Vladimir Khorikov)' },
        ],
      },
    ],
  },
  'ts-mocking': {
    interviewDefinition:
      'A **test double** replaces a real collaborator so a unit can be tested quickly and deterministically. Meszaros\'s taxonomy has five: **dummy**, **stub**, **spy**, **mock** and **fake**. Stubs and fakes support **state verification** (assert on the result); mocks support **behaviour verification** (assert which calls happened). Mockito generates doubles at run time — `when(...).thenReturn(...)` to stub, `verify(...)` to check interactions. Doubles need seams such as constructor-injected interfaces and a `Clock`, and belong at system boundaries, not between every pair of classes.',
    interviewFollowUps: [
      {
        question: 'Classicist or mockist testing?',
        answer: 'Classicists (the "Detroit" school) use real objects where practical and doubles only for awkward dependencies, verifying state. Mockists (the "London" school) mock every collaborator and verify interactions, driving the design outside-in. Classicist tests survive refactoring better; mockist tests pinpoint failures and drive interface design.',
      },
      {
        question: 'Why should you not mock types you do not own?',
        answer: 'A mock of `ResultSet` or an HTTP client encodes your assumptions about how that library behaves — if the assumption is wrong the test still passes. Wrap the library in your own small interface (a port), mock that in unit tests, and test the adapter against the real thing.',
      },
      {
        question: 'Why does `when(spy.get(0)).thenReturn(x)` misbehave?',
        answer: 'Stubbing a spy with `when(...)` actually calls the real method first, which can throw or have side effects. Use `doReturn(x).when(spy).get(0)` for spies.',
      },
    ],
    mnemonic: {
      device: 'A film set: "Don\'t Stop Shooting, More Film!"',
      expansion: [
        { key: 'Dummy', meaning: 'A mannequin in the background: passed in, never used' },
        { key: 'Stub', meaning: 'An extra with one scripted line: returns canned answers' },
        { key: 'Spy', meaning: 'An actor wearing a wire: works (or answers) and records every call' },
        { key: 'Mock', meaning: 'An actor with a checklist: expectations verified after the scene' },
        { key: 'Fake', meaning: 'The stunt double: really performs, with shortcuts (an in-memory database)' },
      ],
      visual: 'Picture the director shouting "Don\'t stop shooting, more film!" while the mannequin, the extra, the wired actor, the checklist actor and the stunt double each stand in for the real star.',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'A flight simulator is a fake',
        body: 'Pilots do not learn engine failures by breaking real engines. A simulator really flies — it is a working implementation — but with shortcuts that make it safe, fast and repeatable. A fake repository backed by a HashMap is the same idea: it behaves consistently across many calls, unlike a stub that only knows a few canned answers.',
      },
      {
        kind: 'insight',
        title: 'Every verify() couples the test to the implementation',
        body: 'Asserting on a result says "this is what the code must produce". Verifying a call says "this is how the code must do it". The second kind breaks when you refactor, even if behaviour is unchanged. Verify only when the interaction is itself the requirement: an email sent, a payment never charged twice.',
      },
      {
        kind: 'real-world',
        title: 'Payment providers ship their own doubles',
        body: 'Payment, email and SMS providers offer sandbox environments and test card numbers — fakes run by the vendor. Teams combine them: Mockito mocks of their own `PaymentGateway` interface for fast unit tests, a WireMock HTTP stub for adapter tests, and the vendor sandbox for a few end-to-end checks.',
      },
      {
        kind: 'angle',
        title: 'Being able to mock it is not a reason to',
        body: 'Since Mockito 5 the inline mock maker can mock final classes, static methods and constructors. That removes technical barriers, not design ones: needing `mockStatic` to test a class usually means a hidden dependency that would be better passed in through the constructor.',
      },
    ],
    diagrams: [
      {
        id: 'ts2-doubles',
        kind: 'concept',
        title: 'The five test doubles and what you assert with them',
        caption: 'From left to right each double does more. Stubs and fakes feed the unit so you can check its result; spies and mocks record calls so you can check the interaction itself.',
        cols: 5,
        rows: 2,
        nodes: [
          { id: 'dummy', label: 'Dummy', detail: 'fills a parameter', col: 0, row: 0, tone: 'neutral' },
          { id: 'stub', label: 'Stub', detail: 'canned answers', col: 1, row: 0, tone: 'success' },
          { id: 'fake', label: 'Fake', detail: 'working shortcut', col: 2, row: 0, tone: 'success' },
          { id: 'spy', label: 'Spy', detail: 'records real calls', col: 3, row: 0, tone: 'accent' },
          { id: 'mock', label: 'Mock', detail: 'expected interactions', col: 4, row: 0, tone: 'accent' },
          { id: 'none', label: 'Nothing to assert', col: 0, row: 1, shape: 'pill', tone: 'neutral' },
          { id: 'state', label: 'State verification', detail: 'assertEquals(expected, result)', col: 1, row: 1, span: 2, shape: 'pill', tone: 'success' },
          { id: 'behav', label: 'Behaviour verification', detail: 'verify(gateway).charge("ada", 2500)', col: 3, row: 1, span: 2, shape: 'pill', tone: 'accent' },
        ],
        edges: [
          { from: 'dummy', to: 'none' },
          { from: 'stub', to: 'state' },
          { from: 'fake', to: 'state' },
          { from: 'spy', to: 'behav' },
          { from: 'mock', to: 'behav' },
        ],
      },
      {
        id: 'ts2-ports',
        kind: 'architecture',
        title: 'Seams: where doubles plug in',
        caption: 'The service depends only on interfaces it owns. Production wires real adapters; tests wire doubles into the same constructor. Value objects and pure logic need no doubles at all.',
        cols: 5,
        rows: 3,
        nodes: [
          { id: 'svc', label: 'CheckoutService', detail: 'unit under test', col: 0, row: 1, tone: 'primary' },
          { id: 'pg', label: 'PaymentGateway', detail: 'interface (port)', col: 2, row: 0, tone: 'accent' },
          { id: 'repo', label: 'OrderRepository', detail: 'interface (port)', col: 2, row: 1, tone: 'accent' },
          { id: 'clock', label: 'Clock', detail: 'java.time', col: 2, row: 2, tone: 'accent' },
          { id: 'stripe', label: 'HTTP payment adapter', col: 3, row: 0, tone: 'neutral' },
          { id: 'jdbc', label: 'JDBC repository', col: 3, row: 1, tone: 'neutral' },
          { id: 'sys', label: 'Clock.systemUTC()', col: 3, row: 2, tone: 'neutral' },
          { id: 'mockpg', label: 'Mockito mock', detail: 'verify(never()).charge', col: 4, row: 0, tone: 'success' },
          { id: 'fakerepo', label: 'In-memory fake', detail: 'HashMap', col: 4, row: 1, tone: 'success' },
          { id: 'fixed', label: 'Clock.fixed(...)', col: 4, row: 2, tone: 'success' },
        ],
        edges: [
          { from: 'svc', to: 'pg', label: 'uses' },
          { from: 'svc', to: 'repo', label: 'uses' },
          { from: 'svc', to: 'clock', label: 'uses' },
          { from: 'stripe', to: 'pg', label: 'implements' },
          { from: 'jdbc', to: 'repo', label: 'implements' },
          { from: 'sys', to: 'clock' },
          { from: 'mockpg', to: 'stripe', label: 'replaces in tests', dashed: true },
          { from: 'fakerepo', to: 'jdbc', label: 'replaces in tests', dashed: true },
          { from: 'fixed', to: 'sys', label: 'replaces in tests', dashed: true },
        ],
        groups: [
          { label: 'Production', fromCol: 3, toCol: 3, fromRow: 0, toRow: 2, tone: 'neutral' },
          { label: 'Tests', fromCol: 4, toCol: 4, fromRow: 0, toRow: 2, tone: 'success' },
        ],
      },
      {
        id: 'ts2-mockito-flow',
        kind: 'flow',
        title: 'Anatomy of a Mockito test',
        caption: 'Stub only what this test needs (strict stubs fail on unused ones), assert on the result first, and verify interactions only when the side effect is the requirement.',
        cols: 5,
        rows: 2,
        nodes: [
          { id: 'create', label: 'Create doubles', detail: '@Mock, @InjectMocks', col: 0, row: 0, tone: 'neutral' },
          { id: 'stubbing', label: 'Stub', detail: 'when(...).thenReturn(...)', col: 1, row: 0, tone: 'primary' },
          { id: 'act', label: 'Act', detail: 'call the unit once', col: 2, row: 0, tone: 'primary' },
          { id: 'assert', label: 'Assert result', detail: 'state verification', col: 3, row: 0, tone: 'success' },
          { id: 'verify', label: 'Verify', detail: 'only required effects', col: 4, row: 0, tone: 'accent' },
          { id: 'strict', label: 'Unused stub', detail: 'UnnecessaryStubbingException', col: 1, row: 1, span: 2, shape: 'pill', tone: 'danger' },
          { id: 'captor', label: 'ArgumentCaptor', detail: 'inspect what was passed', col: 4, row: 1, shape: 'pill', tone: 'neutral' },
        ],
        edges: [
          { from: 'create', to: 'stubbing' },
          { from: 'stubbing', to: 'act' },
          { from: 'act', to: 'assert' },
          { from: 'assert', to: 'verify' },
          { from: 'stubbing', to: 'strict', label: 'never used', dashed: true },
          { from: 'verify', to: 'captor' },
        ],
      },
    ],
    variants: [
      {
        title: 'Types of test double (Meszaros)',
        items: [
          { name: 'Dummy', summary: 'Satisfies a parameter list and is never used. If it is called, the test is wrong.', code: 'new Invoice(customer, null /* dummy audit log, unused here */)' },
          { name: 'Stub', summary: 'Returns canned answers to force a path: approved, declined, timeout, empty result.', code: 'when(gateway.charge(anyString(), anyLong())).thenReturn(false);' },
          { name: 'Spy', summary: 'Records calls for later inspection; in Mockito, wraps a real object and calls real methods unless stubbed.', code: 'List<String> list = spy(new ArrayList<>());\ndoReturn(99).when(list).size();' },
          { name: 'Mock', summary: 'Pre-programmed with expectations; the test fails if the expected interactions did not happen.', code: 'verify(mailer, times(1)).send("ada@example.com");' },
          { name: 'Fake', summary: 'A working, simplified implementation: in-memory repository, local file store, fixed Clock.', code: 'class InMemoryOrders implements OrderRepository { Map<String, Order> rows = new HashMap<>(); ... }' },
        ],
      },
      {
        title: 'Ways to create a double in Java',
        items: [
          { name: 'Hand-written class', summary: 'Plain class implementing the interface. Readable, refactor-friendly, reusable across tests — ideal for fakes.', support: 'supported' },
          { name: 'Lambda or method reference', summary: 'For single-method (functional) interfaces, a lambda is a complete stub or spy.', support: 'supported', code: 'PaymentGateway alwaysApprove = (customer, cents) -> true;' },
          { name: 'Mockito mock()/spy()', summary: 'Generated at run time; stubbing, verification, captors. Mockito 5 mocks final classes and statics by default.', support: 'supported' },
          { name: 'Library-provided', summary: 'Clock.fixed, in-memory file systems, WireMock for HTTP, Testcontainers for real dependencies in tests.', support: 'supported' },
        ],
      },
      {
        title: 'Schools of unit testing',
        items: [
          { name: 'Classicist (Detroit)', summary: 'A "unit" is a behaviour, possibly spanning several classes. Real objects where practical, doubles for shared or slow dependencies, state verification.' },
          { name: 'Mockist (London)', summary: 'A "unit" is one class. Every collaborator is mocked, interactions are verified, and the design grows outside-in from the tests.' },
        ],
      },
    ],
    deepDive: [
      {
        title: 'How Mockito creates a mock',
        body: 'Older Mockito versions generated a **subclass** at run time (with ByteBuddy), which cannot override final classes, final methods or statics. Mockito 5 made the **inline mock maker** the default: it uses a Java agent to retransform the real class\'s bytecode so calls can be intercepted. On JDK 21+ a dynamically attached agent triggers a warning (JEP 451, which prepares to disallow dynamic agent loading by default); Mockito\'s documentation recommends adding it as `-javaagent` in the build configuration.',
        sources: [
          { label: 'JEP 451: Prepare to Disallow the Dynamic Loading of Agents', url: 'https://openjdk.org/jeps/451' },
          { label: 'Mockito documentation (javadoc of org.mockito.Mockito)', url: 'https://javadoc.io/doc/org.mockito/mockito-core/latest/org/mockito/Mockito.html' },
        ],
      },
      {
        title: 'Mocks aren\'t stubs',
        body: 'Martin Fowler\'s essay of that name popularised Meszaros\'s vocabulary and the distinction between state and behaviour verification, and contrasted classicist and mockist TDD. Its key trade-off still holds: mockist tests localise failures and shape interfaces, but couple tests to the collaboration pattern, which makes refactoring more expensive.',
        sources: [
          { label: 'Martin Fowler: Mocks Aren\'t Stubs', url: 'https://martinfowler.com/articles/mocksArentStubs.html' },
          { label: 'xUnit Test Patterns (Gerard Meszaros)' },
        ],
      },
      {
        title: '"Only mock types you own"',
        body: 'Growing Object-Oriented Software, Guided by Tests argues that mocks are a design tool for discovering the interfaces *your* objects need. Mocking a third-party API instead freezes your guess about its behaviour into tests that can never fail for the right reason. The pattern that follows: define a narrow port in your domain language, mock it in unit tests, and cover the adapter with integration tests against the real library or service.',
        sources: [{ label: 'Growing Object-Oriented Software, Guided by Tests (Steve Freeman, Nat Pryce)' }],
      },
    ],
  },
  'ts-debugging': {
    interviewDefinition:
      'Debugging is a systematic search for the cause of a gap between expected and actual behaviour: **reproduce** it reliably and minimally, **gather evidence** (stack trace, logs, state), **form a hypothesis and test it** with one change at a time, fix the **cause** rather than the symptom, and keep the reproduction as a regression test. In a Java stack trace the top frame is where the exception was thrown, frames below are its callers, and the last **Caused by** is usually the root cause.',
    interviewFollowUps: [
      {
        question: 'How do you debug a problem that only happens in production?',
        answer: 'Collect evidence without pausing the system: logs with correlation ids, metrics, distributed traces, heap or thread dumps, and the exact inputs and versions involved. Use them to build a local reproduction, ideally a failing test, then debug that.',
      },
      {
        question: 'The application hangs. What do you do?',
        answer: 'Take several thread dumps a few seconds apart (`jcmd <pid> Thread.print` or `jstack`). Threads stuck in the same frame show where; `BLOCKED` threads and the "Found one Java-level deadlock" section reveal lock cycles; many threads waiting on a pool or socket read point to exhausted resources or missing timeouts.',
      },
      {
        question: 'What is a Heisenbug?',
        answer: 'A bug that changes or disappears when you observe it, typically a race condition: breakpoints and even extra logging alter thread timing. Diagnose with reasoning about shared mutable state, stress tests and non-intrusive evidence.',
      },
      {
        question: 'How does git bisect work?',
        answer: 'You mark one known-good and one known-bad commit; Git checks out the midpoint, you (or a script via `git bisect run`) mark it good or bad, and it halves the range each time. About log2(n) steps find the first bad commit.',
      },
    ],
    mnemonic: {
      device: 'Every fix starts with a REPRO',
      expansion: [
        { key: 'Reproduce', meaning: 'Make the bug happen on demand, then shrink the reproduction until nothing more can be removed' },
        { key: 'Evidence', meaning: 'Read the whole stack trace (last Caused by first), logs and state before touching code' },
        { key: 'Predict', meaning: 'State a hypothesis and what an experiment should show if it is true' },
        { key: 'Reduce', meaning: 'Halve the search space: breakpoints mid-pipeline, git bisect over commits' },
        { key: 'Outlaw', meaning: 'Fix the cause and keep the reproduction as a regression test so the bug can never return' },
      ],
      visual: 'Picture a detective (REPRO stamped on the case file) who refuses to name a suspect before reconstructing the crime scene.',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'A doctor treats the cause, not the fever',
        body: 'A cold towel lowers a fever but does not cure the infection. Wrapping a NullPointerException in `if (x != null)` is the cold towel: the symptom disappears where it surfaced, while the missing value that caused it keeps travelling. Ask where the null was created, not where it exploded.',
      },
      {
        kind: 'insight',
        title: 'A stack trace reads in two directions',
        body: 'Top-down answers "what broke?": the exception type, its message and the line that threw. Bottom-up answers "how did we get here?": which request, job or test started the call chain. With wrapped exceptions, jump to the last "Caused by" first, then read upwards for the context each layer added.',
      },
      {
        kind: 'real-world',
        title: 'The trace was in the ticket all along',
        body: 'Many long-running incidents end with someone finally scrolling to the bottom of a trace that was pasted into the ticket on day one. Team habits that pay off: paste the entire trace (never just the first line), always pass the cause when wrapping exceptions, and log exceptions with the exception object, not just `e.getMessage()`.',
      },
      {
        kind: 'angle',
        title: 'Explaining is debugging',
        body: 'Rubber-duck debugging works because explaining forces you to state assumptions out loud — "and here the list is never empty" — and saying them is often when you notice they are false. Writing a precise bug report or a minimal reproduction has the same effect; many bugs are solved before the question is sent.',
      },
    ],
    diagrams: [
      {
        id: 'ts3-trace-anatomy',
        kind: 'concept',
        title: 'Anatomy of a wrapped stack trace',
        caption: 'The trace from the lesson\'s example. The top line gives the symptom and context; the last "Caused by" gives the root cause, and the first frame in your own code beneath it is where to look first.',
        cols: 3,
        rows: 5,
        nodes: [
          { id: 'ex', label: 'IllegalStateException', detail: 'config line 2 is invalid', col: 0, row: 0, span: 2, tone: 'warning' },
          { id: 'f1', label: 'at ConfigLoader.loadPort(Main.java:11)', detail: 'top frame: where it was thrown', col: 0, row: 1, span: 2, tone: 'neutral' },
          { id: 'f2', label: 'at Main.main(Main.java:49)', detail: 'the caller; further down = older calls', col: 0, row: 2, span: 2, tone: 'neutral' },
          { id: 'cause', label: 'Caused by: NumberFormatException', detail: 'For input string: " 8080"', col: 0, row: 3, span: 2, tone: 'danger' },
          { id: 'f3', label: 'at ConfigLoader.parsePort(Main.java:19)', detail: 'first frame in your code under the root cause', col: 0, row: 4, span: 2, tone: 'success' },
          { id: 'n0', label: 'Symptom + context', detail: 'which line of config', col: 2, row: 0, shape: 'note', tone: 'neutral' },
          { id: 'n1', label: 'Top-down', detail: 'what broke, and where', col: 2, row: 1, shape: 'note', tone: 'neutral' },
          { id: 'n2', label: 'Bottom-up', detail: 'how we got here', col: 2, row: 2, shape: 'note', tone: 'neutral' },
          { id: 'n3', label: 'Read this first', detail: 'the last Caused by', col: 2, row: 3, shape: 'note', tone: 'danger' },
          { id: 'n4', label: 'Breakpoint here', detail: 'then "... 1 more" frames', col: 2, row: 4, shape: 'note', tone: 'success' },
        ],
        edges: [
          { from: 'n0', to: 'ex' },
          { from: 'n1', to: 'f1' },
          { from: 'n2', to: 'f2' },
          { from: 'n3', to: 'cause' },
          { from: 'n4', to: 'f3' },
        ],
        groups: [{ label: 'Wrapped (root) exception', fromCol: 0, toCol: 1, fromRow: 3, toRow: 4, tone: 'danger' }],
      },
      {
        id: 'ts3-loop',
        kind: 'flow',
        title: 'The hypothesis loop',
        caption: 'A refuted hypothesis is progress: it removes a suspect. Change one thing per experiment, and do not stop at "it works now" — stop when a test proves it.',
        cols: 5,
        rows: 2,
        nodes: [
          { id: 'repro', label: 'Reproduce', detail: 'reliable and minimal', col: 0, row: 0, tone: 'primary' },
          { id: 'evidence', label: 'Read evidence', detail: 'trace, logs, state', col: 1, row: 0, tone: 'primary' },
          { id: 'hyp', label: 'Hypothesis', detail: 'predict the outcome', col: 2, row: 0, tone: 'accent' },
          { id: 'exp', label: 'Experiment', detail: 'one change at a time', col: 3, row: 0, tone: 'accent' },
          { id: 'fix', label: 'Fix the cause', detail: 'test fails, then passes', col: 4, row: 0, tone: 'success' },
          { id: 'refuted', label: 'Refuted', detail: 'model was wrong: learn', col: 2, row: 1, span: 2, shape: 'pill', tone: 'warning' },
          { id: 'reg', label: 'Keep regression test', col: 4, row: 1, shape: 'pill', tone: 'success' },
        ],
        edges: [
          { from: 'repro', to: 'evidence' },
          { from: 'evidence', to: 'hyp' },
          { from: 'hyp', to: 'exp' },
          { from: 'exp', to: 'fix', label: 'confirmed' },
          { from: 'exp', to: 'refuted', label: 'surprise' },
          { from: 'refuted', to: 'hyp', label: 'new hypothesis', dashed: true },
          { from: 'fix', to: 'reg' },
        ],
      },
      {
        id: 'ts3-tool-choice',
        kind: 'flow',
        title: 'Picking the right debugging tool',
        caption: 'The debugger is the fastest tool only for local, reproducible, mostly single-threaded bugs. Everything else needs evidence gathered while the program runs normally.',
        cols: 4,
        rows: 3,
        nodes: [
          { id: 'q', label: 'What kind of bug?', col: 0, row: 1, shape: 'pill', tone: 'primary' },
          { id: 'local', label: 'Reproducible locally', col: 1, row: 0, tone: 'neutral' },
          { id: 'prod', label: 'Production only', detail: 'or intermittent', col: 1, row: 1, tone: 'neutral' },
          { id: 'hang', label: 'Hang or slowness', col: 1, row: 2, tone: 'neutral' },
          { id: 'dbg', label: 'Debugger', detail: 'conditional and exception breakpoints', col: 2, row: 0, span: 2, tone: 'success' },
          { id: 'logs', label: 'Logs, metrics, traces', detail: 'then build a local repro', col: 2, row: 1, span: 2, tone: 'accent' },
          { id: 'dump', label: 'Thread dumps, profiler', detail: 'jcmd <pid> Thread.print, JFR', col: 2, row: 2, span: 2, tone: 'warning' },
        ],
        edges: [
          { from: 'q', to: 'local' },
          { from: 'q', to: 'prod' },
          { from: 'q', to: 'hang' },
          { from: 'local', to: 'dbg' },
          { from: 'prod', to: 'logs' },
          { from: 'hang', to: 'dump' },
        ],
      },
    ],
    variants: [
      {
        title: 'Common bug categories',
        items: [
          { name: 'Off-by-one', summary: '<= instead of <, 1-based versus 0-based indexes, inclusive versus exclusive ranges. Caught by boundary tests.', code: 'for (int i = 0; i <= a.length; i++)   // bug: one past the end' },
          { name: 'Null', summary: 'A missing value (absent map key, unset field, empty query result) travels until something dereferences it. Fix at the source; validate at boundaries.', code: 'map.get(user).split("@")   // NPE when user is unknown' },
          { name: 'Equality', summary: '== compares references for objects. Integer caches -128..127, so == passes small tests and fails in production. equals without hashCode breaks hash-based collections.', code: 'Integer a = 1000, b = 1000;\nboolean same = a == b;   // false' },
          { name: 'Mutation through shared references', summary: 'Two variables point at one mutable object; a change "here" appears "there". Use defensive copies or immutable types.', code: 'record Team(List<String> members) { Team { members = List.copyOf(members); } }' },
          { name: 'Concurrency', summary: 'Races and lost updates (count++ is read-modify-write), deadlocks, missing visibility. Timing-dependent, so they hide from debuggers.', code: 'AtomicInteger count = new AtomicInteger();\ncount.incrementAndGet();' },
          { name: 'Resource and state leaks', summary: 'Unclosed connections, files and streams; caches and static collections that only grow. Symptoms appear hours later under load.', code: 'try (var in = Files.newBufferedReader(path)) { ... }' },
        ],
      },
      {
        title: 'Breakpoint types (every major IDE)',
        items: [
          { name: 'Line breakpoint', summary: 'Pause when execution reaches a line.' },
          { name: 'Conditional breakpoint', summary: 'Pause only when an expression is true, e.g. orderId.equals("o-981") or i == 9999.' },
          { name: 'Exception breakpoint', summary: 'Pause where an exception type is thrown, even if it is caught and swallowed later.' },
          { name: 'Method breakpoint', summary: 'Pause on entry or exit of a method. Convenient but can slow the JVM noticeably.' },
          { name: 'Field watchpoint', summary: 'Pause when a field is read or written — the fastest way to find "who changed this?".' },
          { name: 'Logpoint / tracepoint', summary: 'Print an expression without pausing and without editing the code.' },
        ],
      },
      {
        title: 'Stepping actions',
        items: [
          { name: 'Step over', summary: 'Run the current line, including any methods it calls, and stop at the next line.' },
          { name: 'Step into', summary: 'Enter the method called on the current line.' },
          { name: 'Step out', summary: 'Run to the end of the current method and stop in the caller.' },
          { name: 'Run to cursor / resume', summary: 'Continue until the selected line or the next breakpoint.' },
          { name: 'Drop frame', summary: 'Discard the current frame and restart the method (side effects already made are not undone).', support: 'partial', note: 'Available in most Java IDEs through JDWP\'s PopFrames; not every frame can be dropped.' },
        ],
      },
      {
        title: 'Debugging strategies',
        items: [
          { name: 'Hypothesis-driven', summary: 'Predict, experiment, observe; change one variable at a time and write down what you ruled out.' },
          { name: 'Binary search / git bisect', summary: 'Halve the search space: inspect data midway through a pipeline, or bisect commits between a good and a bad version.' },
          { name: 'Minimisation (delta debugging)', summary: 'Repeatedly remove parts of a failing input or program while it still fails, until only the essential trigger is left.' },
          { name: 'Rubber duck', summary: 'Explain the code line by line, out loud, to expose the assumption that is false.' },
          { name: 'Logging and tracing', summary: 'Gather a timeline with ids and context when you cannot pause the system or the bug is intermittent.' },
        ],
      },
    ],
    deepDive: [
      {
        title: 'How a Java debugger actually works',
        body: 'IDEs debug through the Java Platform Debugger Architecture: **JVMTI** is the native interface inside the JVM, **JDWP** the wire protocol (what `-agentlib:jdwp=...` enables) and **JDI** the Java API the IDE uses. When you set a breakpoint in a JIT-compiled method, HotSpot deoptimizes it back to the interpreter, and a conditional breakpoint is evaluated by a round-trip to the debugger on every hit — which is why breakpoints in hot loops make a program crawl.',
        sources: [
          { label: 'Java Platform Debugger Architecture (JPDA), Java SE documentation' },
          { label: 'JVM Tool Interface specification, Java SE documentation' },
        ],
      },
      {
        title: 'Helpful NullPointerException messages',
        body: 'JEP 358 (Java 14, enabled by default from 15) makes the JVM describe the null expression, for example *Cannot invoke "String.split(String)" because the return value of "java.util.Map.get(Object)" is null*. Method return values, fields and array elements are named exactly; local variables are named only if the class was compiled with `-g` (otherwise they appear as `<local4>`). The message is computed lazily, only when `getMessage()` is called.',
        sources: [{ label: 'JEP 358: Helpful NullPointerExceptions', url: 'https://openjdk.org/jeps/358' }],
      },
      {
        title: 'When the stack trace is missing',
        body: 'HotSpot may replace an implicit exception (NullPointerException, ArithmeticException, ArrayIndexOutOfBoundsException, ClassCastException) that the same compiled code throws very often with a preallocated instance that has **no stack trace** — a performance optimisation. If logs show `java.lang.NullPointerException` with no frames, look for the first occurrence earlier in the log or run with `-XX:-OmitStackTraceInFastThrow`. Code can also opt out deliberately: the protected `Throwable` constructor with `writableStackTrace = false` (Java 7) skips capturing the trace.',
        sources: [{ label: 'Throwable — Java SE 21 API', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Throwable.html' }],
      },
      {
        title: 'git bisect, automated',
        body: '`git bisect run <cmd>` runs a command at every step: exit code 0 marks the commit good, 125 skips it (for example, it does not compile), and other codes from 1 to 127 mark it bad. Combined with a single focused test, a regression in thousands of commits is located unattended in a dozen builds. Andreas Zeller\'s delta debugging generalises the same halving idea to failing inputs and to the set of changes between versions.',
        sources: [
          { label: 'git-bisect documentation', url: 'https://git-scm.com/docs/git-bisect' },
          { label: 'Why Programs Fail: A Guide to Systematic Debugging (Andreas Zeller)' },
          { label: 'Debugging: The 9 Indispensable Rules (David J. Agans)' },
        ],
      },
    ],
  },
};
