import type { MemoryAid } from '@/types/curriculum';

/** "Make it stick" memory aids for the immutability and build tools lessons, keyed by lesson id. */
export const immutabilityBuildMemory: Record<string, MemoryAid> = {
  'o-immutability': {
    oneLiner: 'An immutable object can never change after it is built, so anyone can share it safely.',
    story:
      'A bus company prints its timetable in a booklet. Once printed, nobody can change it, so a hundred people can read copies at the same time without any arguments. To change a time, the company prints a new edition. When a driver hands in a draft list of stops, the office photocopies it first, so later scribbles on the draft do not sneak into the booklet. In Java, the booklet is an immutable object, the printed ink is `private final` fields with no setters, a new edition is a new object, and the photocopy is a defensive copy.',
    keyPoints: [
      'Make the class `final`, the fields `private final`, and add no setter methods.',
      'Copy mutable inputs coming in and mutable data going out, such as lists.',
      'Immutable objects are safe to share between threads and to use as map keys.',
    ],
    types: [
      {
        title: 'Degrees of immutability',
        items: [
          { name: 'Deeply immutable', simple: 'Nothing inside can ever change, like a printed book: `String` and `LocalDate` work this way.' },
          { name: 'Shallowly immutable', simple: 'The labels are glued on, but the boxes they point to can still be refilled, like a record holding a list.' },
          { name: 'Effectively immutable', simple: 'Could be changed, but nobody ever does after sharing it, like a signed form put in a drawer.' },
          { name: 'Unmodifiable view', simple: 'A locked shop window: you cannot touch the items, but the owner can still rearrange them.' },
        ],
      },
      {
        title: 'Ways to copy an object',
        items: [
          { name: 'Shallow copy', simple: 'A new folder holding the same papers: change a paper and both folders see it.' },
          { name: 'Deep copy', simple: 'A new folder with photocopies of every paper, so the two never affect each other.' },
          { name: 'Copy constructor', simple: 'A constructor that builds a new object from an existing one, choosing how deep to copy each field.' },
          { name: 'Static copy factory', simple: 'A named method such as `List.copyOf(...)` that makes the copy for you.' },
          { name: '`clone()`', simple: 'An old built-in copier with tricky rules; fine for arrays, avoid it for your own classes.' },
        ],
      },
    ],
    confusion: {
      mixedUpWith: 'a `final` variable',
      difference: '`final` only stops the variable pointing somewhere else. A `final List` can still have items added unless the list itself is immutable.',
    },
    tryIt: 'Write `final List<String> names = new ArrayList<>();` and call `names.add("Lee")`; it works. Now use `List.of("Lee")` and try `add` again to see `UnsupportedOperationException`.',
    recall: [
      { question: 'How do you "change" an immutable object?', answer: 'You create a new object with the new value and leave the old one untouched.' },
      { question: 'Why copy a list passed into a constructor?', answer: 'So the caller cannot change your object later by changing their own list.' },
      { question: 'Does `final` on a field make the object it points to immutable?', answer: 'No. It only stops the field being reassigned.' },
    ],
    picture: {
      title: 'A printed timetable everyone shares',
      caption: 'The printed booklet (immutable object) is shared by many readers. Inputs are photocopied (defensive copy), and changes mean a new edition.',
      items: [
        { icon: 'copy', label: 'defensive copy', x: 15, y: 22, tone: 'warning' },
        { icon: 'book', label: 'immutable', x: 50, y: 22, tone: 'accent' },
        { icon: 'people', label: 'many readers', x: 85, y: 22, tone: 'success' },
        { icon: 'lock', label: 'private final', x: 50, y: 48, size: 0.7, tone: 'neutral' },
      ],
      arrows: [
        { from: 0, to: 1 },
        { from: 1, to: 2 },
      ],
    },
  },
  'p-build-tools': {
    oneLiner: 'A build tool reads one project file, downloads the libraries you need, then compiles, tests and packages your app.',
    story:
      'A building firm gets a blueprint that lists every part needed. The firm orders those parts from a big warehouse, and each part arrives with any smaller parts it needs too. Then the crew always works in the same order: build, inspect, then wrap it up for delivery. In Java, the blueprint is `pom.xml` (Maven) or `build.gradle` (Gradle). The warehouse is a repository such as Maven Central. Parts that bring their own parts are transitive dependencies. The fixed steps are compile, test and package, which ends with a `.jar` file.',
    keyPoints: [
      'Each library is named by coordinates: `groupId:artifactId:version`.',
      'Dependencies bring their own dependencies, called transitive dependencies.',
      'Running `mvn package` first runs the earlier phases, including compile and test.',
    ],
    types: [
      {
        title: 'Maven lifecycle phases',
        items: [
          { name: '`validate`', simple: 'Checks the project description is complete, like reading a recipe before you start.' },
          { name: '`compile`', simple: 'Turns your Java source code into class files the JVM can run.' },
          { name: '`test`', simple: 'Runs your unit tests; if one fails, the build stops, like a taste test before serving.' },
          { name: '`package`', simple: 'Packs the compiled code into one JAR or WAR file, like boxing up a finished cake.' },
          { name: '`verify`', simple: 'Runs bigger integration tests and quality checks on the packed file.' },
          { name: '`install`', simple: 'Puts the JAR in your computer\'s local store so your other projects can use it.' },
          { name: '`deploy`', simple: 'Uploads the JAR to a shared remote store so your whole team can use it.' },
        ],
      },
      {
        title: 'Maven scopes and Gradle configurations',
        items: [
          { name: '`compile` / `implementation`', simple: 'Needed to build and to run your program, like flour for bread.' },
          { name: '`provided` / `compileOnly`', simple: 'Needed to build, but the server already supplies it when running, like plates at a restaurant.' },
          { name: '`runtime` / `runtimeOnly`', simple: 'Not needed to build, only to run, such as a database driver.' },
          { name: '`test` / `testImplementation`', simple: 'Only used for tests and never shipped, like scaffolding taken down after building.' },
        ],
      },
      {
        title: 'Maven vs Gradle',
        items: [
          { name: 'Maven', simple: 'Fixed, step-by-step recipe written in XML; every project builds the same predictable way.' },
          { name: 'Gradle', simple: 'A flexible script of tasks in Kotlin or Groovy, with caching that skips work already done.' },
        ],
      },
    ],
    confusion: {
      mixedUpWith: 'Maven versus Gradle',
      difference: 'Maven uses XML and fixed lifecycle phases, and picks the nearest version in a conflict. Gradle uses a code-like script and a task graph, and picks the highest version.',
    },
    tryIt: 'In a Maven project, run `mvn dependency:tree` and find one library you never added yourself. In Gradle, run `gradle dependencies` instead.',
    recall: [
      { question: 'What three parts name a Maven library?', answer: '`groupId`, `artifactId` and `version`.' },
      { question: 'What is a transitive dependency?', answer: 'A library you get because a library you asked for needs it.' },
      { question: 'Which earlier steps run when you call `mvn package`?', answer: 'The earlier lifecycle phases, including compile and test.' },
    ],
    picture: {
      title: 'Blueprint, warehouse, finished product',
      caption: 'The blueprint (build file) lists parts. The warehouse (repository) sends them. The crew compiles, tests and packages a jar.',
      items: [
        { icon: 'blueprint', label: 'pom.xml', x: 13, y: 12, size: 0.85, tone: 'primary' },
        { icon: 'cloud', label: 'Maven Central', x: 50, y: 12, size: 0.85, tone: 'neutral' },
        { icon: 'boxes', label: 'libraries', x: 87, y: 12, size: 0.85, tone: 'accent' },
        { icon: 'hammer', label: 'compile', x: 87, y: 43, size: 0.85, tone: 'primary' },
        { icon: 'check', label: 'test', x: 50, y: 43, size: 0.85, tone: 'success' },
        { icon: 'box', label: 'app.jar', x: 13, y: 43, size: 0.85, tone: 'accent' },
      ],
      arrows: [
        { from: 0, to: 1 },
        { from: 1, to: 2 },
        { from: 2, to: 3 },
        { from: 3, to: 4 },
        { from: 4, to: 5 },
      ],
    },
  },
};
