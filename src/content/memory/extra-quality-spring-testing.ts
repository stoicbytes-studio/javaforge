import type { MemoryAid } from '@/types/curriculum';

/** "Make it stick" memory aids for the code quality and Spring testing module, keyed by lesson id. */
export const qualitySpringTestingMemory: Record<string, MemoryAid> = {
  'ts-code-quality': {
    oneLiner: 'Code quality tools are layers of nets, and each net catches a different kind of mistake.',
    story:
      'Think of a school essay on its way to being printed. A formatter tidies the layout so nobody argues about spacing. A grammar checker reads the text without anyone acting it out and flags known mistakes; that is static analysis, like SpotBugs or Error Prone. A teacher marks which pages they actually read; that is coverage, like JaCoCo. Then someone sneaks a wrong fact into the essay to see if the proof-reader notices; that is mutation testing, like PIT. Finally, the school rule says no essay is printed with new errors: that is the quality gate in CI, the build server that checks every change.',
    keyPoints: [
      'Static analysis finds known bug patterns without running the code.',
      'Coverage shows which code the tests ran; mutation testing shows whether they checked it.',
      'A quality gate in CI blocks changes that break the rules, ideally judged on new code.',
    ],
    types: [
      {
        title: 'Types of static-analysis tool',
        items: [
          { name: 'Compiler lints (`-Xlint`)', simple: 'The spell-checker built into your word processor: always there, and it only flags obvious slips.' },
          { name: 'Error Prone', simple: 'A strict editor reading over your shoulder while you type, stopping you at known mistakes.' },
          { name: 'SpotBugs', simple: 'An inspector who checks the finished building (compiled bytecode) for known danger spots.' },
          { name: 'PMD', simple: 'A checklist of bad habits, such as empty catch blocks or copy-pasted code, run over your source.' },
          { name: 'Checkstyle', simple: 'The house style guide: names, Javadoc and layout. Keeps code tidy but finds few real bugs.' },
          { name: 'SonarQube', simple: 'A school report card that collects all the results and tracks them over time.' },
        ],
      },
      {
        title: 'Coverage and test-strength metrics',
        items: [
          { name: 'Line coverage', simple: 'Which rooms the inspector walked through: a line ran during some test.' },
          { name: 'Branch coverage', simple: 'Whether every fork in the road was taken both ways, such as the yes and no side of an `if`.' },
          { name: 'Mutation score', simple: 'Flip a breaker on purpose and see if anyone notices: how many planted bugs the tests catch.' },
        ],
      },
    ],
    confusion: {
      mixedUpWith: 'high coverage and good tests',
      difference: 'Coverage only says a line ran during a test. A test with no assertions can reach 100% coverage and still catch nothing.',
    },
    tryIt: 'Write a method that returns `a + b` and a test that calls it but asserts nothing. Run it: it passes. Change `+` to `-` and run again. It still passes; that is a surviving mutant.',
    recall: [
      { question: 'What does mutation testing tell you that coverage cannot?', answer: 'Whether your tests actually fail when the code is changed, so they really check the results.' },
      { question: 'Why does `sku.replace("-", "")` on its own line compile without a warning?', answer: 'Ignoring a return value is legal Java. Bug-pattern tools like Error Prone flag it instead.' },
      { question: 'What is a quality gate?', answer: 'A CI check that blocks a change when it breaks agreed thresholds, such as new bugs or low coverage on new code.' },
    ],
    picture: {
      title: 'Nets for an essay',
      caption: 'Each layer catches a different slip: analysers read the code, coverage shows what ran, mutants test the tests, and the gate decides.',
      items: [
        { icon: 'note', label: 'Your code', x: 15, y: 14, size: 0.9, tone: 'primary' },
        { icon: 'filter', label: 'Analysers', x: 50, y: 14, size: 0.9, tone: 'accent' },
        { icon: 'magnifier', label: 'Coverage', x: 85, y: 14, size: 0.9, tone: 'neutral' },
        { icon: 'bug', label: 'Mutants', x: 85, y: 44, size: 0.9, tone: 'danger' },
        { icon: 'check', label: 'Gate', x: 50, y: 44, size: 0.9, tone: 'success' },
      ],
      arrows: [
        { from: 0, to: 1 },
        { from: 1, to: 2 },
        { from: 2, to: 3 },
        { from: 3, to: 4 },
      ],
    },
  },

  'sp-testing': {
    oneLiner: 'Test each Spring rule with the smallest setup that can catch the bug: unit, slice, or full app.',
    story:
      'Think of a car factory. To test the engine, you put it on a bench by itself: fast and simple. That is a plain unit test, where you build a service with `new` and give it fake helpers. To test only the brakes, you build the front of the car with stand-in parts for the rest. That is a test slice, like `@WebMvcTest`, with `@MockitoBean` stand-ins. Once in a while you drive the whole car on a real road. That is `@SpringBootTest`, ideally with a real database from Testcontainers. And if the next test needs the same car, the factory keeps it warm: Spring caches the context.',
    keyPoints: [
      'Business rules get plain unit tests: no Spring, just `new` and fakes.',
      'Slices like `@WebMvcTest` and `@DataJpaTest` start one layer, so they stay quick.',
      'Same test setup means the cached context is reused; every different setup builds a new one.',
    ],
    types: [
      {
        title: 'Testing levels in a Spring app',
        items: [
          { name: 'Plain unit test', simple: 'Tasting one crumb: test a single class with fakes and no Spring. Very fast.' },
          { name: 'Slice test', simple: 'Cutting one slice of bread: start just one layer, such as the web layer, with stand-ins for the rest.' },
          { name: '`@SpringBootTest`', simple: 'Serving the whole loaf: the complete app starts, usually with a real database in a container.' },
          { name: 'End-to-end / contract test', simple: 'A full dress rehearsal across services over the network. Slow, so keep only a few.' },
        ],
      },
      {
        title: 'Types of test double',
        items: [
          { name: 'Dummy', simple: 'An empty chair to fill a seat; nobody ever uses it.' },
          { name: 'Stub', simple: 'A shop dummy that always gives the same scripted answer when asked.' },
          { name: 'Spy', simple: 'A real helper who also writes down every call they get, so you can check later.' },
          { name: 'Mock', simple: 'A stand-in you check afterwards: "Was `send` called exactly once?"' },
          { name: 'Fake', simple: 'A toy kitchen that really works, but simpler, such as an in-memory database.' },
        ],
      },
    ],
    confusion: {
      mixedUpWith: '`@WebMvcTest` and `@SpringBootTest`',
      difference: '`@WebMvcTest` starts only the web layer, so services must be mocked. `@SpringBootTest` starts the whole application with all its beans.',
    },
    tryIt: 'Write a `@WebMvcTest` for a controller that needs a service. Run it without mocking the service and read the missing bean error. Then add a `@MockitoBean` field for the service and run it again.',
    recall: [
      { question: 'Why does constructor injection make unit tests easy?', answer: 'You can create the object with `new` and pass in fakes, with no Spring container.' },
      { question: 'What does a test slice start?', answer: 'Only the beans for one layer, such as the web layer or JPA.' },
      { question: 'What makes a Spring test suite slow to start?', answer: 'Many different test setups, because each one builds and caches its own context.' },
    ],
    picture: {
      title: 'Bench, part, road test',
      caption: 'Test the engine alone (unit), one part with stand-ins (slice), then the whole car on a real road (full app with a real database).',
      items: [
        { icon: 'gear', label: 'Unit test', x: 12, y: 22, size: 0.9, tone: 'success' },
        { icon: 'wrench', label: 'Slice test', x: 37, y: 22, size: 0.9, tone: 'primary' },
        { icon: 'truck', label: 'Full app', x: 63, y: 22, size: 0.9, tone: 'warning' },
        { icon: 'database', label: 'Real DB', x: 88, y: 22, size: 0.9, tone: 'accent' },
        { icon: 'robot', label: 'Mock beans', x: 37, y: 48, size: 0.7, tone: 'neutral' },
      ],
      arrows: [
        { from: 0, to: 1 },
        { from: 1, to: 2 },
        { from: 2, to: 3 },
        { from: 4, to: 1, dashed: true },
      ],
    },
  },
};
