import type { InterviewQuestion, RubricPoint } from '@/types/practice';

/*
 * Interview question bank. Written answers are scored by rubric matchers
 * (case-insensitive regular expressions); keep them generous so different
 * correct phrasings are recognised, and add misconception patterns only for
 * claims that are clearly wrong.
 */

const point = (id: string, label: string, matchers: string[], tip: string, weight = 1): RubricPoint => ({ id, label, weight, matchers, tip });

export const INTERVIEW_QUESTION_LIST: InterviewQuestion[] = [
  // ------------------------------------------------------------ fundamentals
  {
    id: 'iq-jvm-pipeline',
    moduleId: 'fundamentals',
    lessonIds: ['f-first-program', 'p-jdk-jre-jvm'],
    kind: 'conceptual',
    difficulty: 'beginner',
    prompt: 'Walk me through what happens between writing `Main.java` and seeing its output.',
    rubric: [
      point('javac', 'javac compiles source code to bytecode in .class files', ['javac', 'compil\\w* .*byte ?code', 'byte ?code'], 'Start with javac turning source into bytecode (.class files).', 2),
      point('jvm', 'The JVM loads and runs the bytecode', ['\\bjvm\\b', 'virtual machine'], 'Name the JVM as the component that executes bytecode.', 2),
      point('classload', 'Class loading/linking/initialisation before main runs', ['class ?load', 'link', 'initiali[sz]', 'verif'], 'Mention that the class is loaded, verified/linked and initialised first.'),
      point('main', 'Execution starts in public static void main on the main thread', ['main\\s*(method|\\()', 'static void main', 'entry point'], 'Say where execution begins: the static main method.'),
      point('jit', 'Interpretation plus JIT compilation of hot code', ['\\bjit\\b', 'just[- ]in[- ]time', 'interpret'], 'Add that the JVM interprets first and JIT-compiles hot code to native.'),
      point('portable', 'Bytecode is platform independent', ['platform[- ]independ', 'portable', 'write once', 'any (os|platform)'], 'Explain why: the same bytecode runs on any platform with a JVM.'),
    ],
    misconceptions: [
      { id: 'jvm-compiles-source', pattern: 'jvm (compiles|converts) (the )?(java )?source', correction: 'javac compiles source; the JVM works on bytecode (its JIT compiles bytecode, not source).' },
      { id: 'javac-native', pattern: 'javac (produces|generates|creates) (native|machine) code', correction: 'javac produces platform-neutral bytecode, not native machine code.' },
    ],
    modelAnswer:
      '`javac` compiles `Main.java` into `Main.class`, which contains platform-independent bytecode. `java Main` starts a JVM; the application class loader loads Main, the JVM verifies and links it, runs static initialisers, and calls `public static void main` on the main thread. The JVM interprets bytecode at first and JIT-compiles hot methods to native code. Because only the JVM is platform-specific, the same class file runs anywhere.',
    followUps: ['What is the difference between the JDK, JRE and JVM?', 'What causes UnsupportedClassVersionError?', 'What does the JIT do differently from the interpreter?'],
  },
  {
    id: 'iq-pass-by-value',
    moduleId: 'fundamentals',
    lessonIds: ['f-methods'],
    kind: 'conceptual',
    difficulty: 'beginner',
    prompt: 'Is Java pass-by-value or pass-by-reference? Explain with objects.',
    rubric: [
      point('value', 'Java is always pass-by-value', ['always pass[- ]by[- ]value', 'pass[- ]by[- ]value', 'passed by value', 'copy of the (value|reference)'], 'State clearly that Java is always pass-by-value.', 2),
      point('reference-copied', 'For objects, the reference is copied', ['cop(y|ies) (of )?the reference', 'reference is (copied|passed by value)', 'value of the reference', 'reference (value|itself) is copied', 'copied is the reference', 'cop\\w*.{0,20}\\breferences?\\b'], 'Explain that for objects the value copied is the reference.', 2),
      point('mutate', 'Methods can mutate the object the reference points to', ['mutat', 'modify the object', 'change (the )?(object|state|field)', 'same object'], 'Show that changing the object is visible to the caller.'),
      point('reassign', "Reassigning the parameter doesn't affect the caller", ['reassign', 'new object', 'point (it )?(to|at) (a )?(new|another|different)', "doesn'?t (affect|change) the caller"], 'Contrast with reassignment, which only changes the local copy.'),
    ],
    misconceptions: [
      { id: 'pbr-objects', pattern: 'objects are passed by reference', correction: 'Object references are passed by value; Java has no pass-by-reference.' },
    ],
    modelAnswer:
      'Java is always pass-by-value. For primitives the value is copied; for objects the value that is copied is the reference. So a method can mutate the object (both copies point to the same heap object), but if it reassigns its parameter to a new object, the caller\'s variable is unaffected.',
    followUps: ['How would you return two values from a method then?', 'What happens if you pass an immutable String and "change" it?'],
  },
  {
    id: 'iq-out-concat',
    moduleId: 'fundamentals',
    lessonIds: ['f-first-program'],
    kind: 'output',
    difficulty: 'beginner',
    prompt: 'What does this program print?',
    code: `public class Main {
    public static void main(String[] args) {
        System.out.println(1 + 2 + "3" + 4 * 5);
    }
}`,
    options: [
      { id: 'a', text: '3320' },
      { id: 'b', text: '12345' },
      { id: 'c', text: '33' },
      { id: 'd', text: '1234 5' },
    ],
    correctOptionId: 'a',
    explanation: '* binds tighter than +, so 4 * 5 = 20 first. Then left to right: 1 + 2 = 3, 3 + "3" = "33", "33" + 20 = "3320".',
    modelAnswer: 'Operator precedence first (4 * 5 = 20), then left-to-right evaluation: numeric addition until a String appears, concatenation afterwards: "3320".',
    followUps: ['How would you make it print 30?'],
  },
  {
    id: 'iq-overflow',
    moduleId: 'fundamentals',
    lessonIds: ['f-types-operators'],
    kind: 'debugging',
    difficulty: 'intermediate',
    prompt: '`long timeoutMs = days * 24 * 60 * 60 * 1000;` returns a negative number for days = 30. Why, and how do you fix it?',
    options: [
      { id: 'a', text: 'long cannot hold such large values' },
      { id: 'b', text: 'The right-hand side is computed in int and overflows before being widened; use 24L or Duration.ofDays(days).toMillis()' },
      { id: 'c', text: 'Multiplication is not associative in Java' },
      { id: 'd', text: 'The JIT optimised the expression incorrectly' },
    ],
    correctOptionId: 'b',
    explanation: 'Expression types come from operands, not from the target variable. 30 × 86,400,000 exceeds Integer.MAX_VALUE and wraps.',
    modelAnswer: 'All operands are int, so the multiplication overflows in 32-bit arithmetic and the wrapped value is then widened to long. Making one operand long (24L) forces long arithmetic; Duration.ofDays(days).toMillis() is clearer and detects overflow.',
    followUps: ['How would you detect overflow instead of silently wrapping?'],
  },

  // ------------------------------------------------------------ platform
  {
    id: 'iq-jdk-jre-jvm',
    moduleId: 'jvm-platform',
    lessonIds: ['p-jdk-jre-jvm'],
    kind: 'conceptual',
    difficulty: 'beginner',
    prompt: 'What is the difference between the JDK, the JRE and the JVM?',
    rubric: [
      point('jvm', 'JVM executes bytecode', ['jvm.*(run|execut|interpret)', '(run|execut)\\w* byte ?code'], 'Define the JVM as the bytecode execution engine.', 2),
      point('jre', 'JRE = JVM + class libraries needed to run programs', ['jre.*(librar|class(es)? lib|jvm \\+|jvm and)', 'runtime environment'], 'Define the JRE as JVM plus standard libraries.', 2),
      point('jdk', 'JDK = JRE + development tools (javac, jar, ...)', ['jdk.*(javac|tools|compiler|develop)', 'development kit'], 'Define the JDK as the runtime plus development tools such as javac.', 2),
      point('modern', 'Modern packaging: no separate Oracle JRE since 11; jlink runtimes', ['jlink', 'since (java )?11', 'no (separate|standalone) jre', 'custom runtime'], 'Bonus: mention jlink and that Java 11+ no longer ships a separate Oracle JRE.'),
    ],
    misconceptions: [{ id: 'jre-has-javac', pattern: 'jre (contains|includes|has) (the )?javac', correction: 'javac is part of the JDK, not of a runtime-only JRE.' }],
    modelAnswer:
      'The JVM is the engine that loads, verifies and executes bytecode. The JRE is the JVM plus the standard class libraries — enough to run Java programs. The JDK adds developer tools such as javac, jar, jshell and diagnostic tools. Since Java 11 you typically install a JDK for development and build a slim runtime (or use a runtime image built with jlink) for production.',
    followUps: ['What does jlink do?', 'Name a few JVM implementations.'],
  },
  {
    id: 'iq-classloading',
    moduleId: 'jvm-platform',
    lessonIds: ['p-packages-classpath'],
    kind: 'internals',
    difficulty: 'intermediate',
    prompt: 'How does class loading work, and what is the difference between ClassNotFoundException and NoClassDefFoundError?',
    rubric: [
      point('loaders', 'Bootstrap, platform and application class loaders', ['bootstrap', 'platform (class ?)?loader', 'application (class ?)?loader', 'system class ?loader'], 'Name the built-in loaders.'),
      point('delegation', 'Parent-first delegation', ['delegat', 'parent[- ]first', 'asks (its )?parent'], 'Explain parent delegation.', 2),
      point('lazy', 'Classes are loaded lazily on first use', ['lazil', 'on (first )?(use|demand)', 'when (first )?(needed|used|referenced)'], 'Mention lazy loading.'),
      point('cnfe', 'ClassNotFoundException: dynamic lookup by name failed (checked)', ['classnotfound.*(forname|by name|dynamic|reflect|loadclass)', 'forname'], 'Tie ClassNotFoundException to Class.forName/loadClass lookups.', 2),
      point('ncdfe', 'NoClassDefFoundError: class present at compile time missing at runtime or failed init', ['noclassdef.*(compile|runtime|classpath|static init|initiali)', 'present at compile', 'missing at runtime', 'exceptionininitializererror'], 'Tie NoClassDefFoundError to classes available at compile time but missing (or failed) at runtime.', 2),
    ],
    misconceptions: [{ id: 'same-thing', pattern: '(they are|both are) the same', correction: 'They have different causes: a failed dynamic lookup vs. a linked class missing or failed at runtime.' }],
    modelAnswer:
      'Since Java 9 there are three built-in loaders: bootstrap (java.base), platform (other Java SE modules) and application (classpath/module path). Loaders delegate to their parent first, which protects core classes, and classes load lazily on first active use. ClassNotFoundException is a checked exception from a dynamic lookup by name (Class.forName, loadClass) that fails. NoClassDefFoundError means a class that existed at compile time cannot be defined at runtime — its jar is missing, or its static initialiser failed earlier with ExceptionInInitializerError.',
    followUps: ['Why does parent-first delegation matter for security?', 'How do application servers isolate web applications?'],
  },
  {
    id: 'iq-preview-features',
    moduleId: 'jvm-platform',
    lessonIds: ['p-java-releases'],
    kind: 'scenario',
    difficulty: 'intermediate',
    prompt: 'Your team wants to use a feature that is still a preview in the current JDK in a production service. What do you advise?',
    rubric: [
      point('flag', 'Preview needs --enable-preview at compile and run time', ['enable-preview', 'preview flag'], 'Explain the flag requirement.', 1),
      point('pinned', 'Class files only run on that exact JDK release', ['(exact|same|specific) (jdk|release|version)', 'tied to', 'only run on'], 'Mention that preview class files are pinned to one release.', 2),
      point('change', 'The feature can change or be removed (e.g. string templates)', ['chang', 'removed', 'withdrawn', 'string templates'], 'Point out that previews can change or disappear — string templates are the classic example.', 2),
      point('advice', 'Use in experiments only; wait for final; use LTS', ['experiment', 'prototype', 'wait', 'final', '\\blts\\b'], 'Give clear advice: experiment, but ship only final features on an LTS.', 2),
    ],
    misconceptions: [{ id: 'preview-stable', pattern: 'preview features? (are|is) (stable|guaranteed)', correction: 'Preview features have no compatibility guarantee; they may change or be removed.' }],
    modelAnswer:
      'Not in production. Preview features need --enable-preview at compile and run time, the class files only run on that exact JDK, and the design can still change or be removed — string templates were previewed in 21 and 22 and then withdrawn in 23. Prototype with it, give feedback, and adopt it once it is final, ideally on an LTS release.',
    followUps: ['Which LTS release are you on, and what would you gain by upgrading?', 'How do incubator modules differ from previews?'],
  },

  // ------------------------------------------------------------ OOP
  {
    id: 'iq-equals-hashcode',
    moduleId: 'oop',
    lessonIds: ['o-object-contracts'],
    kind: 'internals',
    difficulty: 'intermediate',
    prompt: 'Why must you override hashCode when you override equals?',
    rubric: [
      point('contract', 'Equal objects must have equal hash codes', ['equal objects (must )?(have|return) (the )?(same|equal) hash', 'same hash ?code'], 'State the contract precisely.', 2),
      point('buckets', 'Hash collections pick the bucket by hashCode, then use equals', ['bucket', 'hash (table|map|set)', 'hashmap', 'hashset'], 'Explain the mechanism in hash-based collections.', 2),
      point('symptom', 'Otherwise duplicates appear and lookups fail', ['duplicate', 'can(not|\'t) find', 'lookups? fail', 'returns? null', 'contains (returns )?false'], 'Describe the concrete failure.'),
      point('collision', 'Unequal objects may share a hash code (collisions are allowed)', ['collision', 'unequal objects (may|can)', 'not (necessarily )?unique'], 'Mention that the reverse is not required.'),
      point('record', 'Records or IDE/Objects.hash generate consistent implementations', ['record', 'objects\\.hash', 'generate'], 'Mention how to get it right easily (records, Objects.hash).'),
    ],
    misconceptions: [
      { id: 'equal-hash-equal', pattern: 'same hash ?code (means|implies) (they are )?equal', correction: 'Equal hash codes do not imply equality; collisions are allowed.' },
      { id: 'hash-address', pattern: 'hash ?code (is|returns) the (memory )?address', correction: 'Identity hash codes are not specified to be memory addresses (and objects move during GC).' },
    ],
    modelAnswer:
      'The contract says equal objects must have equal hash codes. HashMap and HashSet locate the bucket with hashCode and only then compare with equals; if two equal objects hash differently they land in different buckets, so equals is never consulted — you get duplicates in sets and failed lookups in maps. Unequal objects may collide. Using a record, or Objects.hash over the same fields as equals, keeps them consistent.',
    followUps: ['What happens if a key is mutated after being put in a HashMap?', 'Should equals use getClass() or instanceof?'],
  },
  {
    id: 'iq-abstract-vs-interface',
    moduleId: 'oop',
    lessonIds: ['o-interfaces'],
    kind: 'conceptual',
    difficulty: 'intermediate',
    prompt: 'When would you choose an abstract class over an interface in modern Java?',
    rubric: [
      point('state', 'Abstract classes can hold instance state and constructors', ['state', 'field', 'constructor'], 'Mention state and constructors.', 2),
      point('multiple', 'A class can implement many interfaces but extend one class', ['multiple', 'many interfaces', 'implement (many|several|multiple|any number)', 'only (extend )?one', 'single inheritance'], 'Mention multiple inheritance of type.', 2),
      point('defaults', 'Interfaces have default/static/private methods since 8/9', ['default method', 'static method', 'private method'], 'Acknowledge modern interface features.'),
      point('template', 'Abstract class fits a shared algorithm skeleton (template method)', ['template', 'skeleton', 'share (code|implementation)'], 'Give the template-method use case.'),
      point('sealed', 'Sealed interfaces model closed hierarchies', ['sealed'], 'Bonus: mention sealed interfaces for closed sets of variants.'),
    ],
    misconceptions: [{ id: 'no-impl', pattern: 'interfaces? (cannot|can\'t) (have|contain) (any )?(method )?(implementation|code)', correction: 'Since Java 8 interfaces can have default and static methods (and private ones since 9).' }],
    modelAnswer:
      'Interfaces define capabilities; a class can implement many of them, and since Java 8/9 they can carry default, static and private methods — but no instance state. I choose an abstract class when subclasses share state, constructor logic or a fixed algorithm skeleton (template method). For a closed set of variants I use a sealed interface with records.',
    followUps: ['How are default-method conflicts resolved?', 'Why might you prefer composition to either?'],
  },
  {
    id: 'iq-out-dispatch',
    moduleId: 'oop',
    lessonIds: ['o-inheritance'],
    kind: 'output',
    difficulty: 'intermediate',
    prompt: 'What does this print?',
    code: `class A {
    String name = "A";
    String who() { return "A"; }
}

class B extends A {
    String name = "B";
    @Override String who() { return "B"; }
}

public class Main {
    public static void main(String[] args) {
        A a = new B();
        System.out.println(a.who() + a.name + ((B) a).name);
    }
}`,
    options: [
      { id: 'a', text: 'BBB' },
      { id: 'b', text: 'BAB' },
      { id: 'c', text: 'AAB' },
      { id: 'd', text: 'BAA' },
    ],
    correctOptionId: 'b',
    explanation: 'Methods dispatch on the runtime type (B); fields are resolved from the declared type (A), so a.name is "A" and the cast exposes B\'s field.',
    modelAnswer: 'Instance methods are polymorphic, fields are not: who() → "B", a.name → "A" (declared type), ((B) a).name → "B".',
    followUps: ['What about static methods with the same signature?'],
  },
  {
    id: 'iq-solid-dip',
    moduleId: 'oop',
    lessonIds: ['o-solid'],
    kind: 'scenario',
    difficulty: 'intermediate',
    prompt: 'A service creates `new SmtpMailer()` inside its methods and cannot be unit-tested without a mail server. How would you redesign it?',
    rubric: [
      point('interface', 'Introduce an abstraction (interface) for sending notifications', ['interface', 'abstraction'], 'Introduce an interface the service depends on.', 2),
      point('inject', 'Inject it through the constructor', ['inject', 'constructor', 'pass (it )?in'], 'Use constructor injection.', 2),
      point('fake', 'Use a fake/mock in tests', ['fake', 'mock', 'stub', 'test double'], 'Explain how tests become possible.', 2),
      point('dip', 'Name the Dependency Inversion principle', ['dependency inversion', '\\bdip\\b', 'solid'], 'Name the principle.'),
      point('framework', 'A container (e.g. Spring) wires the real implementation', ['spring', 'container', 'wir'], 'Mention how production wiring happens.'),
    ],
    modelAnswer:
      'Apply dependency inversion: define a `Notifier` interface owned by the service, implement it with `SmtpNotifier`, and inject a Notifier through the service\'s constructor. Tests pass an in-memory fake (or a Mockito mock) and assert on recorded messages; production wiring (e.g. Spring) supplies the SMTP implementation.',
    followUps: ['Constructor vs field injection — which and why?', 'When is an interface unnecessary?'],
  },

  // ------------------------------------------------------------ types
  {
    id: 'iq-string-immutable',
    moduleId: 'types',
    lessonIds: ['t-strings'],
    kind: 'conceptual',
    difficulty: 'beginner',
    prompt: 'Why is String immutable in Java, and what are the consequences?',
    rubric: [
      point('pool', 'Enables the string pool / safe sharing of literals', ['pool', 'intern', 'shar'], 'Mention the string pool.', 2),
      point('thread', 'Thread-safe without synchronization', ['thread[- ]safe', 'concurren', 'synchroni'], 'Mention thread safety.'),
      point('hash', 'Hash code can be cached; safe as map keys', ['hash ?code', 'cach', 'key'], 'Mention cached hash codes and map keys.', 2),
      point('security', 'Security: values like file paths and class names cannot be changed after checks', ['secur', 'class ?load', 'path'], 'Mention security-sensitive uses.'),
      point('builder', 'Use StringBuilder for repeated concatenation', ['stringbuilder', 'builder'], 'Mention the cost: use StringBuilder in loops.'),
    ],
    misconceptions: [{ id: 'final-means', pattern: 'immutable because (the class is |it is )?final', correction: 'final prevents subclassing; immutability comes from private final state and no mutators.' }],
    modelAnswer:
      'Immutability lets the JVM pool and share string literals, makes Strings inherently thread-safe, allows the hash code to be cached (ideal for HashMap keys), and protects security-sensitive values such as class names and file paths from being changed after validation. The cost is that each modification creates a new object, so repeated concatenation in loops should use StringBuilder.',
    followUps: ['What does intern() do?', 'Why can == sometimes appear to work for strings?'],
  },
  {
    id: 'iq-out-integer-cache',
    moduleId: 'types',
    lessonIds: ['t-wrappers'],
    kind: 'output',
    difficulty: 'intermediate',
    prompt: 'What does this print?',
    code: `public class Main {
    public static void main(String[] args) {
        Integer a = 127, b = 127, c = 128, d = 128;
        System.out.println((a == b) + " " + (c == d) + " " + c.equals(d));
    }
}`,
    options: [
      { id: 'a', text: 'true true true' },
      { id: 'b', text: 'true false true' },
      { id: 'c', text: 'false false true' },
      { id: 'd', text: 'true false false' },
    ],
    correctOptionId: 'b',
    explanation: 'Autoboxing uses Integer.valueOf, which caches −128…127. 128 creates distinct objects, so == compares different references; equals compares values.',
    modelAnswer: 'true false true — the Integer cache covers −128 to 127; outside it == compares distinct objects. Always use equals for wrappers.',
    followUps: ['Can the cache size be changed?', 'Where else can unboxing surprise you?'],
  },
  {
    id: 'iq-generics-erasure',
    moduleId: 'types',
    lessonIds: ['t-generics'],
    kind: 'internals',
    difficulty: 'advanced',
    prompt: 'Explain type erasure and two consequences of it.',
    rubric: [
      point('compile', 'Generics are checked at compile time and erased in bytecode', ['compile[- ]time', 'erase', 'removed (at|in) (runtime|bytecode)'], 'Define erasure precisely.', 2),
      point('bound', 'Type parameters become their bound (Object by default) and casts are inserted', ['bound', 'object', 'cast'], 'Mention bounds and inserted casts.'),
      point('consequence', 'Consequences: no new T(), no T[], no instanceof List<String>, overload clashes', ['new t', 't\\[\\]', 'instanceof', 'overload', 'generic array', 'same class at runtime'], 'Give concrete consequences.', 2),
      point('why', 'Chosen for backward compatibility with pre-generics code', ['compatib', 'legacy', 'java 5', 'pre-?generics'], 'Explain why Java chose erasure.'),
      point('raw', 'Raw types bypass checks and allow heap pollution', ['raw type', 'heap pollution', 'unchecked'], 'Mention raw types and unchecked warnings.'),
    ],
    misconceptions: [{ id: 'runtime-types', pattern: 'generic types? (are|is) (available|kept|known) at runtime', correction: 'Type arguments of objects are erased; only declarations keep generic signatures for reflection.' }],
    modelAnswer:
      'Generics are a compile-time feature: the compiler checks types, inserts casts and erases type parameters to their bounds (usually Object). It was chosen for binary compatibility with pre-Java-5 code. Consequences: you cannot write new T() or new T[], cannot test instanceof List<String>, and cannot overload methods that differ only by type arguments; raw types disable the checks and can cause heap pollution that fails later with ClassCastException.',
    followUps: ['What is PECS?', 'How do frameworks still read generic types (e.g. Jackson TypeReference)?'],
  },
  {
    id: 'iq-pecs',
    moduleId: 'types',
    lessonIds: ['t-generics'],
    kind: 'conceptual',
    difficulty: 'intermediate',
    prompt: 'What does PECS mean? Give an example.',
    rubric: [
      point('expand', 'Producer Extends, Consumer Super', ['producer extends', 'consumer super'], 'Expand the acronym.', 2),
      point('extends', '? extends T for sources you read from', ['\\? extends', 'read (from|only)', 'get'], 'Explain the extends side.', 2),
      point('super', '? super T for sinks you add to', ['\\? super', 'add', 'write', 'put'], 'Explain the super side.', 2),
      point('example', 'Concrete example (Collections.copy, addAll, sum of numbers)', ['collections\\.copy', 'copy\\(', 'addall', 'number', 'comparator'], 'Give a concrete example.'),
    ],
    modelAnswer:
      'Producer Extends, Consumer Super. If a parameter produces values you read, use `? extends T` (e.g. `double sum(List<? extends Number>)`); if it consumes values you add, use `? super T` (e.g. `addDefaults(List<? super Integer>)`). `Collections.copy(List<? super T> dest, List<? extends T> src)` uses both.',
    followUps: ['Why can\'t you add to a List<? extends Number>?'],
  },

  // ------------------------------------------------------------ exceptions
  {
    id: 'iq-checked-unchecked',
    moduleId: 'exceptions',
    lessonIds: ['e-basics', 'e-design'],
    kind: 'conceptual',
    difficulty: 'beginner',
    prompt: 'Checked vs unchecked exceptions: what is the difference, and which do you prefer for application errors?',
    rubric: [
      point('checked', 'Checked must be caught or declared (compiler enforced)', ['must be (caught|declared|handled)', 'throws clause', 'compiler (forces|enforces|checks)'], 'Define checked exceptions.', 2),
      point('unchecked', 'Unchecked = RuntimeException (and Error) subclasses', ['runtimeexception', 'unchecked'], 'Define unchecked exceptions.', 2),
      point('recoverable', 'Checked for recoverable conditions the caller can handle', ['recover', 'caller can (handle|react)'], 'Say when checked makes sense.'),
      point('modern', 'Most modern code/frameworks use unchecked; checked does not compose with lambdas', ['lambda', 'stream', 'spring', 'framework', 'boilerplate'], 'Mention practical trade-offs.'),
    ],
    misconceptions: [{ id: 'error-checked', pattern: 'errors? (are|is) checked', correction: 'Error and its subclasses are unchecked.' }],
    modelAnswer:
      'Checked exceptions (Exception but not RuntimeException) must be caught or declared, so the compiler forces callers to consider them; unchecked exceptions (RuntimeException subclasses, and Errors) need not be. Checked fits recoverable conditions the immediate caller can handle, like a user-chosen file missing. For most application errors I prefer unchecked exceptions translated at layer boundaries — they compose with lambdas and streams and are what Spring and JPA use.',
    followUps: ['What is exception translation?', 'Where should an exception be logged?'],
  },
  {
    id: 'iq-out-finally',
    moduleId: 'exceptions',
    lessonIds: ['e-basics'],
    kind: 'output',
    difficulty: 'intermediate',
    prompt: 'What does this print?',
    code: `public class Main {
    static int f() {
        int x = 10;
        try {
            return x;
        } finally {
            x = 20;
            System.out.print("finally ");
        }
    }

    public static void main(String[] args) {
        System.out.println(f());
    }
}`,
    options: [
      { id: 'a', text: 'finally 20' },
      { id: 'b', text: 'finally 10' },
      { id: 'c', text: '10' },
      { id: 'd', text: '10 finally' },
    ],
    correctOptionId: 'b',
    explanation: 'The return value 10 is saved, finally runs (printing and changing the local), then 10 is returned.',
    modelAnswer: '"finally 10": the return expression is evaluated before finally runs; reassigning the local in finally does not change the saved value.',
    followUps: ['What if finally contained its own return statement?'],
  },
  {
    id: 'iq-twr',
    moduleId: 'exceptions',
    lessonIds: ['e-resources'],
    kind: 'internals',
    difficulty: 'intermediate',
    prompt: 'How does try-with-resources work, and what are suppressed exceptions?',
    rubric: [
      point('autocloseable', 'Works with AutoCloseable resources', ['autocloseable', 'closeable'], 'Name AutoCloseable.', 2),
      point('always', 'close() is called on every path, including exceptions', ['always', 'every path', 'even (if|when) (an )?exception', 'automatic'], 'Explain the guarantee.', 2),
      point('order', 'Resources close in reverse order', ['reverse'], 'Mention close order.'),
      point('suppressed', 'Close failures are attached as suppressed to the primary exception', ['suppress', 'getsuppressed', 'attached'], 'Explain suppressed exceptions.', 2),
      point('finally-problem', 'Contrast with finally losing the original exception', ['finally', 'lost', 'swallow', 'mask'], 'Contrast with the old pattern.'),
    ],
    modelAnswer:
      'Any AutoCloseable declared in the try header is closed automatically when the block exits, normally or by exception, in reverse order of declaration. If the body throws and close() also throws, the close exception is attached to the primary one as a suppressed exception (getSuppressed()) instead of replacing it — the old close-in-finally pattern lost the original failure in that case.',
    followUps: ['How would you find a connection leak in production?'],
  },

  // ------------------------------------------------------------ collections
  {
    id: 'iq-hashmap-internals',
    moduleId: 'collections',
    lessonIds: ['c-hashmap'],
    kind: 'internals',
    difficulty: 'intermediate',
    prompt: 'How does HashMap work internally? Cover put, get, collisions and resizing.',
    rubric: [
      point('array', 'Backed by an array of buckets', ['array', 'bucket', 'table'], 'Start with the bucket array.', 1),
      point('index', 'Index from hashCode (spread) and (n-1) & hash', ['hash ?code', 'index', '& ?\\(?n ?- ?1', 'modulo', 'spread'], 'Explain how the bucket index is computed.', 2),
      point('equals', 'equals compares keys within a bucket', ['equals'], 'Mention equals for key comparison.', 2),
      point('collision', 'Collisions: linked list, treeified (red-black tree) at 8 entries since Java 8', ['collision', 'linked list', 'tree', 'red[- ]black', 'treeif'], 'Describe collision handling and treeification.', 2),
      point('resize', 'Resize (double) when size exceeds capacity × load factor 0.75', ['resiz', 'load factor', '0\\.75', 'rehash', 'double'], 'Describe resizing.', 2),
      point('complexity', 'O(1) average, degraded with bad hashes', ['o\\(1\\)', 'constant time', 'o\\(log ?n\\)'], 'State the complexity.'),
    ],
    misconceptions: [
      { id: 'sorted', pattern: 'hashmap (is |keeps (keys )?)?(sorted|ordered)', correction: 'HashMap has no defined order; use LinkedHashMap or TreeMap.' },
      { id: 'threadsafe', pattern: 'hashmap is thread[- ]safe', correction: 'HashMap is not thread-safe; use ConcurrentHashMap.' },
    ],
    modelAnswer:
      'HashMap is an array of buckets. put computes key.hashCode(), spreads the high bits (h ^ h>>>16) and takes `hash & (capacity − 1)` as the index. Within a bucket, entries are compared by hash and then equals; colliding entries form a linked list, which since Java 8 becomes a red-black tree once a bucket reaches 8 entries (if the table has ≥ 64 buckets). When size exceeds capacity × load factor (0.75 by default) the table doubles and entries are redistributed. get follows the same path, so operations are O(1) on average, O(log n) worst case with tree bins. It allows one null key and is not thread-safe.',
    followUps: ['What happens if a key\'s hashCode changes after insertion?', 'How does ConcurrentHashMap differ?', 'How would you build an LRU cache?'],
  },
  {
    id: 'iq-arraylist-linkedlist',
    moduleId: 'collections',
    lessonIds: ['c-collections-overview'],
    kind: 'conceptual',
    difficulty: 'beginner',
    prompt: 'ArrayList or LinkedList — when would you use each?',
    rubric: [
      point('array', 'ArrayList is array-backed: O(1) random access', ['array', 'o\\(1\\).*(get|access|index)', 'random access'], 'Explain ArrayList\'s structure and access cost.', 2),
      point('insert', 'Inserting/removing in the middle of an ArrayList is O(n)', ['shift', 'o\\(n\\)', 'middle'], 'Mention insertion cost.'),
      point('linked', 'LinkedList: O(1) at ends but O(n) to find a position; extra node objects', ['node', 'o\\(n\\).*(get|access|find)', 'pointer', 'ends'], 'Explain LinkedList costs honestly.', 2),
      point('cache', 'ArrayList is usually faster in practice (cache locality)', ['cache', 'locality', 'in practice', 'almost always', 'default'], 'Make the practical recommendation.', 2),
      point('deque', 'Use ArrayDeque for queue/stack', ['arraydeque', 'deque'], 'Suggest ArrayDeque for queue/stack use.'),
    ],
    misconceptions: [{ id: 'linked-fast-insert', pattern: 'linkedlist (is )?(always )?faster (for|at) insert', correction: 'Only at a known position; finding the position is O(n), and node overhead often makes it slower.' }],
    modelAnswer:
      'Default to ArrayList: it is array-backed with O(1) random access and amortised O(1) appends, and its cache locality makes it faster in practice even for many insertions. LinkedList only wins when you insert/remove at an iterator position you already hold, and it costs an extra object per element. For queues and stacks I use ArrayDeque.',
    followUps: ['What is the amortised cost of ArrayList.add and why?'],
  },
  {
    id: 'iq-cme',
    moduleId: 'collections',
    lessonIds: ['c-iteration'],
    kind: 'debugging',
    difficulty: 'intermediate',
    prompt: 'A loop `for (User u : users) if (u.isInactive()) users.remove(u);` throws ConcurrentModificationException. What is the best fix?',
    options: [
      { id: 'a', text: 'Wrap the loop in synchronized(users)' },
      { id: 'b', text: 'users.removeIf(User::isInactive)' },
      { id: 'c', text: 'Catch ConcurrentModificationException and continue' },
      { id: 'd', text: 'Switch to a LinkedList' },
    ],
    correctOptionId: 'b',
    explanation: 'The fail-fast iterator detects the structural change through modCount. removeIf (or Iterator.remove) removes safely; synchronization does not help because there is only one thread.',
    modelAnswer: 'The for-each iterator is fail-fast: removing through the list changes modCount and the next next() throws. Use removeIf, an explicit Iterator with it.remove(), or build a filtered copy. It is not a threading problem.',
    followUps: ['Why does removing the second-to-last element sometimes not throw?'],
  },
  {
    id: 'iq-out-treeset',
    moduleId: 'collections',
    lessonIds: ['c-sorted'],
    kind: 'output',
    difficulty: 'advanced',
    prompt: 'What does this print?',
    code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Set<String> s = new TreeSet<>(Comparator.comparing(String::length));
        s.addAll(List.of("java", "go", "rust", "kotlin", "c"));
        System.out.println(s);
    }
}`,
    options: [
      { id: 'a', text: '[c, go, java, rust, kotlin]' },
      { id: 'b', text: '[c, go, java, kotlin]' },
      { id: 'c', text: '[java, go, rust, kotlin, c]' },
      { id: 'd', text: '[c, go, rust, java, kotlin]' },
    ],
    correctOptionId: 'b',
    explanation: 'TreeSet treats compare == 0 as a duplicate. "rust" has the same length as "java", so it is silently dropped.',
    modelAnswer: 'A TreeSet uses its comparator for equality. Comparing only by length makes "rust" a duplicate of "java". Add a tie-breaker: comparing(String::length).thenComparing(Comparator.naturalOrder()).',
    followUps: ['What does "consistent with equals" mean for a comparator?'],
  },
  {
    id: 'iq-coding-lru',
    moduleId: 'collections',
    lessonIds: ['c-hashmap'],
    kind: 'coding',
    difficulty: 'intermediate',
    prompt: 'Implement an LRU cache with O(1) get and put.',
    challengeId: 'ch-lru',
    modelAnswer:
      'Combine a hash map (O(1) lookup) with a doubly linked list ordered by recency (O(1) move-to-front and eviction). In Java, LinkedHashMap with accessOrder=true plus removeEldestEntry gives exactly that. Discuss thread safety (synchronise or use a concurrent cache such as Caffeine) and what counts as "use" (gets and puts).',
    followUps: ['How would you make it thread-safe?', 'How would you add a time-to-live?'],
  },

  // ------------------------------------------------------------ functional
  {
    id: 'iq-stream-laziness',
    moduleId: 'functional',
    lessonIds: ['fn-streams'],
    kind: 'internals',
    difficulty: 'intermediate',
    prompt: 'Explain how stream pipelines are evaluated. What does "lazy" mean here?',
    rubric: [
      point('ops', 'Source, intermediate and terminal operations', ['intermediate', 'terminal'], 'Name the three parts of a pipeline.', 2),
      point('lazy', 'Nothing runs until a terminal operation', ['nothing (runs|happens|executes)', 'until (a |the )?terminal', 'lazy'], 'Explain laziness.', 2),
      point('vertical', 'Elements flow one at a time through all stages', ['one (element )?at a time', 'element by element', 'vertical', 'each element'], 'Describe element-by-element processing.', 2),
      point('short', 'Short-circuiting (findFirst, anyMatch, limit) can stop early', ['short[- ]circuit', 'findfirst', 'anymatch', 'limit'], 'Mention short-circuiting.'),
      point('stateful', 'Stateful ops like sorted/distinct need all elements', ['sorted', 'distinct', 'stateful'], 'Mention stateful operations.'),
      point('once', 'Streams are single-use', ['single[- ]use', 'once', 'reuse'], 'Mention single use.'),
    ],
    misconceptions: [{ id: 'stage-by-stage', pattern: '(each|every) (stage|operation) (processes|runs on) (the )?(whole|entire|all)', correction: 'Stateless stages are fused; elements move through the pipeline one at a time (stateful operations excepted).' }],
    modelAnswer:
      'A pipeline is a source, intermediate operations (filter, map, sorted) and one terminal operation (collect, count, findFirst). Intermediate operations are lazy: nothing executes until the terminal operation pulls elements, and then each element travels through all stateless stages before the next one starts. Short-circuiting operations stop early, stateful ones such as sorted must buffer everything, and a stream can be consumed only once.',
    followUps: ['When are parallel streams a bad idea?', 'What do stream gatherers (Java 24) add?'],
  },
  {
    id: 'iq-out-orelse',
    moduleId: 'functional',
    lessonIds: ['fn-optional-modern'],
    kind: 'output',
    difficulty: 'intermediate',
    prompt: 'What does this print?',
    code: `import java.util.Optional;

public class Main {
    static String load() {
        System.out.print("load ");
        return "db";
    }

    public static void main(String[] args) {
        String a = Optional.of("cache").orElse(load());
        String b = Optional.of("cache").orElseGet(Main::load);
        System.out.println(a + " " + b);
    }
}`,
    options: [
      { id: 'a', text: 'cache cache' },
      { id: 'b', text: 'load cache cache' },
      { id: 'c', text: 'load load cache cache' },
      { id: 'd', text: 'load db cache' },
    ],
    correctOptionId: 'b',
    explanation: 'orElse evaluates its argument eagerly; orElseGet only calls the supplier when empty.',
    modelAnswer: '"load cache cache": orElse(load()) calls load even though a value is present; orElseGet(Main::load) does not.',
    followUps: ['Where should Optional not be used?'],
  },
  {
    id: 'iq-virtual-threads',
    moduleId: 'functional',
    lessonIds: ['fn-optional-modern'],
    kind: 'conceptual',
    difficulty: 'advanced',
    prompt: 'What are virtual threads (Java 21) and when would you use them?',
    rubric: [
      point('lightweight', 'Lightweight threads managed by the JVM, mounted on carrier platform threads', ['lightweight', 'carrier', 'jvm[- ]managed', 'not (os|platform) threads', 'mount'], 'Explain what they are.', 2),
      point('blocking', 'Blocking unmounts the virtual thread, so blocking I/O code scales', ['block', 'unmount', 'park'], 'Explain why blocking is cheap.', 2),
      point('io', 'Best for I/O-bound, high-concurrency workloads (thread-per-request)', ['i/?o[- ]bound', 'thread[- ]per[- ]request', 'many concurrent', 'requests'], 'Say where they help.', 2),
      point('cpu', 'Not faster for CPU-bound work; do not pool them', ['cpu[- ]bound', 'not faster', "don'?t pool", 'do not pool', 'no pooling'], 'Say where they do not help.'),
      point('limits', 'Still limit concurrency to downstream resources (semaphores); pinning caveats before 24', ['semaphore', 'limit', 'pinn', 'synchronized'], 'Mention limits and pinning.'),
    ],
    misconceptions: [{ id: 'faster-cpu', pattern: 'virtual threads (make|are) (cpu|computation)[- ]?(bound )?(work )?faster', correction: 'Virtual threads improve scalability of blocking workloads, not raw CPU throughput.' }],
    modelAnswer:
      'Virtual threads are lightweight threads scheduled by the JVM onto a small pool of carrier platform threads. When a virtual thread blocks on I/O it unmounts, freeing the carrier, so you can write simple blocking thread-per-request code that scales to very high concurrency. They help I/O-bound servers, not CPU-bound work, and should not be pooled — create one per task (Executors.newVirtualThreadPerTaskExecutor). You still need to bound access to scarce downstream resources, e.g. with a Semaphore. Before Java 24, blocking inside synchronized pinned the carrier.',
    followUps: ['What is pinning?', 'How do scoped values relate to virtual threads?'],
  },
  {
    id: 'iq-coding-grouping',
    moduleId: 'functional',
    lessonIds: ['fn-streams'],
    kind: 'coding',
    difficulty: 'intermediate',
    prompt: 'Using streams, produce per-region totals, the best-selling product and the list of large orders from a sales log.',
    challengeId: 'ch-stream-report',
    modelAnswer:
      'Use groupingBy with a TreeMap factory and summarizingLong for per-region sum and count; a second groupingBy+summingLong for products followed by max with a comparator that breaks ties deliberately; and filter+map+joining for the large orders. Explain why a loop might be clearer if requirements grew more complex.',
    followUps: ['How would you avoid two passes over the data?'],
  },
];
