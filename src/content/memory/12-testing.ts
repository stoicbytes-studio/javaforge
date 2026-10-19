import type { MemoryAid } from '@/types/curriculum';

/** "Make it stick" memory aids for module 12 (Testing and debugging), keyed by lesson id. */
export const testingMemory: Record<string, MemoryAid> = {
  'ts-junit': {
    oneLiner: 'A unit test is a small automatic check of one behaviour, and JUnit runs every check for you.',
    story:
      'Think of a toy factory. At the end of the belt, an inspector takes one toy and runs one check from a checklist: does the wheel turn? For the next check she takes a fresh toy, so one test cannot spoil another. A tick means pass. A cross means the toy was wrong. If the toy explodes before she can check it, that is a different kind of problem. In Java, each check is a method marked `@Test`, the fresh toy is the new test-class instance JUnit makes for every test, a cross is a failed assertion, and the explosion is an unexpected exception, reported as an error.',
    keyPoints: [
      'Each `@Test` method checks one behaviour through the public API, and must be fast and repeatable.',
      'Use `assertEquals`, `assertThrows` and friends. A failed assertion is a failure; any other exception is an error.',
      'Pick inputs on and around limits, like 0, 1 and the maximum, because bugs gather there.',
    ],
    confusion: {
      mixedUpWith: 'high code coverage meaning good tests',
      difference: 'Coverage only shows which lines ran. A test with no assertions can cover everything and still check nothing.',
    },
    tryIt: 'Write a `@Test` that calls `Math.max(2, 5)` and uses `assertEquals(5, ...)`. Run it, then change the expected value to 2 and read the failure message.',
    recall: [
      { question: 'Does JUnit 5 reuse one test-class object for all tests by default?', answer: 'No. It creates a new instance for each test method.' },
      { question: 'What is the difference between a test failure and a test error?', answer: 'A failure is a broken assertion. An error is any other unexpected exception.' },
    ],
    picture: {
      title: 'One toy, one check',
      caption: 'Each toy on the belt (a fresh test instance) gets one check from the inspector (@Test). Tick means pass, cross means fail.',
      items: [
        { icon: 'conveyor', label: 'fresh instance', x: 15, y: 30, tone: 'neutral' },
        { icon: 'magnifier', label: '@Test', x: 50, y: 30, tone: 'accent' },
        { icon: 'check', label: 'pass', x: 87, y: 12, size: 0.8, tone: 'success' },
        { icon: 'cross', label: 'fail', x: 87, y: 44, size: 0.8, tone: 'danger' },
      ],
      arrows: [
        { from: 0, to: 1 },
        { from: 1, to: 2 },
        { from: 1, to: 3 },
      ],
    },
  },
  'ts-mocking': {
    oneLiner: 'A test double stands in for a real helper, so you can test your code quickly and without surprises.',
    story:
      'Think of filming a movie. For a dangerous car jump, the star does not do it. A stunt double takes the place, and the camera only cares that someone did the jump. Sometimes a cardboard cutout is enough, because it just has to stand there and look right. Sometimes the director also checks the notes: did the double jump exactly once? In Java, the star is the real collaborator, like a payment service. A stub is the cutout that gives fixed answers with `when(...).thenReturn(...)`. A mock is the double whose actions you check afterwards with `verify(...)`.',
    keyPoints: [
      'Stubs give canned answers so you can check the result. Mocks let you check which calls happened.',
      'Your code needs a seam, like an interface passed into the constructor, to swap in a double.',
      'Use doubles at the edges, like networks, databases and clocks, not between every pair of classes.',
    ],
    confusion: {
      mixedUpWith: 'a stub and a mock',
      difference: 'With a stub you check the answer your code produced. With a mock you check that your code made the right calls.',
    },
    tryIt: 'Mock a `List<String>` with `mock(List.class)`, stub `get(0)` to return "hi", call it, then `verify(list).get(0)`. Change it to `get(1)` and watch the verify fail.',
    recall: [
      { question: 'Which Mockito method checks that a call happened?', answer: '`verify(...)`, for example `verify(mailer).send(any())`.' },
      { question: 'Why add an interface in the constructor of the class under test?', answer: 'It gives a seam, so a test can pass in a double instead of the real helper.' },
    ],
    picture: {
      title: 'The stunt double',
      caption: 'The camera (your test) films a stunt double (test double) instead of the star (real service), then checks the notes (verify).',
      items: [
        { icon: 'camera', label: 'your test', x: 11, y: 30, tone: 'primary' },
        { icon: 'person', label: 'test double', x: 50, y: 30, tone: 'accent' },
        { icon: 'note', label: 'verify', x: 89, y: 30, tone: 'success' },
        { icon: 'star', label: 'real service', x: 50, y: 7.5, size: 0.6, tone: 'neutral' },
      ],
      arrows: [
        { from: 0, to: 1, label: 'calls' },
        { from: 1, to: 2, label: 'check' },
      ],
    },
  },
  'ts-debugging': {
    oneLiner: 'Debugging is detective work: make the bug happen again, collect clues, test one idea at a time, fix the cause.',
    story:
      'Think of a car mechanic and a strange noise. First she drives the car until she can hear the noise every time. Then she gathers clues: when does it happen, how fast, which wheel? She guesses one cause, changes one thing, and listens again. When the noise is gone, she fixes the worn part, not just turns up the radio. In Java, the noise is the bug, hearing it every time is a reliable reproduction, the clues are the stack trace and logs, one change at a time is testing a hypothesis, and the final test drive is a regression test that stays in your project.',
    keyPoints: [
      'First make the bug happen reliably, ideally as a small failing test.',
      'In a stack trace, the top line is where it was thrown. The last `Caused by` is usually the real cause.',
      'Change one thing at a time, fix the cause not the symptom, and keep the test.',
    ],
    confusion: {
      mixedUpWith: 'the top line and the root cause of a stack trace',
      difference: 'The top frame shows where the exception was thrown. The last `Caused by` section usually shows why it really happened.',
    },
    tryIt: 'Wrap a `NumberFormatException` from `Integer.parseInt("abc")` in a `RuntimeException` and let it crash. Read the stack trace from the top, then find the `Caused by` line.',
    recall: [
      { question: 'What is the first step in debugging?', answer: 'Reproduce the bug reliably, ideally with a small failing test.' },
      { question: 'Where in a stack trace is the root cause usually shown?', answer: 'In the last `Caused by` section.' },
      { question: 'Why keep the reproduction test after the fix?', answer: 'It becomes a regression test that catches the bug if it ever comes back.' },
    ],
    picture: {
      title: 'Find the noise, fix the part',
      caption: 'The mechanic hears the noise (bug), looks for clues (stack trace, logs), then fixes the real part (cause) and test drives (regression test).',
      items: [
        { icon: 'bug', label: 'reproduce', x: 12, y: 22, tone: 'danger' },
        { icon: 'magnifier', label: 'clues', x: 38, y: 22, tone: 'accent' },
        { icon: 'wrench', label: 'fix cause', x: 63, y: 22, tone: 'primary' },
        { icon: 'check', label: 'keep test', x: 88, y: 22, tone: 'success' },
      ],
      arrows: [
        { from: 0, to: 1 },
        { from: 1, to: 2 },
        { from: 2, to: 3 },
      ],
    },
  },
};
