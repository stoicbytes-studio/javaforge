import type { Lesson } from '@/types/curriculum';

/** Extra lessons for module 10 (Files, NIO and Networking): serialization and NIO/sockets. */
export const serializationNioLessons: Lesson[] = [
  {
    id: 'io-serialization',
    moduleId: 'io',
    title: 'Serialization: Java serialization, JSON and safe data formats',
    summary:
      'Turning objects into bytes and back: Serializable, serialVersionUID, transient, why deserializing untrusted data is dangerous, ObjectInputFilter, records, JSON with Jackson and schema-based binary formats.',
    estimatedMinutes: 40,
    difficulty: 'advanced',
    prerequisites: ['io-files'],
    versionNotes: [
      { feature: 'java.io.Serializable, ObjectOutputStream, ObjectInputStream', since: 1, note: 'Added in JDK 1.1' },
      { feature: 'ObjectInputFilter (JEP 290)', since: 9, note: 'Also backported to 8u121, 7u131 and 6u141' },
      { feature: 'Records serialize through their canonical constructor', since: 16 },
      { feature: 'JDK-wide deserialization filter factory (JEP 415)', since: 17 },
    ],
    objectives: [
      'Explain what serialization is and round-trip an object with ObjectOutputStream and ObjectInputStream.',
      'Use serialVersionUID and transient deliberately, and predict what a deserialized object contains.',
      'Explain why deserializing untrusted bytes with ObjectInputStream is dangerous and restrict it with ObjectInputFilter.',
      'Validate invariants during deserialization (readObject, readResolve, records).',
      'Choose between Java serialization, JSON and schema-based binary formats such as Protocol Buffers and Avro.',
    ],
    plainEnglish: `Objects live in memory. As soon as you want to **save** one to disk, **send** it to another service or **cache** it in Redis, you have to turn it into bytes — that is **serialization**. Turning the bytes back into an object is **deserialization**.

Java has a built-in way to do this: mark a class \`implements Serializable\` and hand the object to an \`ObjectOutputStream\`. It is convenient, but it has two big problems:

- the bytes are a Java-only format that is tightly coupled to your class's private fields, so changing the class can break old data;
- **reading** those bytes can run code inside classes on your classpath, so deserializing data from an untrusted source has led to some of the worst remote-code-execution bugs in Java history.

That is why most modern systems exchange **JSON** (human-readable, every language understands it) or a **schema-based binary format** such as Protocol Buffers or Avro (compact, fast, designed to evolve), and keep Java serialization for legacy code — always with a filter.`,
    technical: `### Java serialization
- A class opts in with the marker interface \`java.io.Serializable\`. \`ObjectOutputStream.writeObject\` writes the object **graph**: class descriptors, every non-\`static\`, non-\`transient\` field, and every object reachable from them (shared references and cycles are preserved). Every object in the graph must be serializable, or \`NotSerializableException\` is thrown.
- \`ObjectInputStream.readObject\` rebuilds the graph **without calling the class's constructor**. It allocates the object and fills its fields from the stream. Only the no-arg constructor of the first **non-serializable** superclass runs. Field initialisers of the serializable class do not run either, so \`transient\` fields come back as \`0\`, \`false\` or \`null\`.
- \`serialVersionUID\` is the version stamp written into the stream. If you do not declare one, it is computed from the class's structure, so adding a method or field changes it and old data fails with \`InvalidClassException\`. Declare \`private static final long serialVersionUID = 1L;\` and change it only for incompatible changes. Compatible changes (adding a field) then work: missing fields get default values.

### Controlling the format
- \`transient\` excludes a field (caches, passwords, connections).
- \`private void writeObject(ObjectOutputStream)\` / \`private void readObject(ObjectInputStream)\` customise the format; call \`defaultWriteObject\`/\`defaultReadObject\` and **re-validate invariants** in \`readObject\`, because the constructor's checks were bypassed.
- \`writeReplace\` / \`readResolve\` substitute another object: the **serialization proxy pattern** writes a simple proxy and rebuilds the real object through its constructor; \`readResolve\` keeps singletons unique.
- \`Externalizable\` gives full manual control (\`writeExternal\`/\`readExternal\`) and requires a public no-arg constructor.
- **Records** (Java 16) serialize only their components and are deserialized by calling the **canonical constructor**, so the record's validation always runs. That makes records the safest shape for Java-serialized data.

### Why deserializing untrusted data is dangerous
\`readObject\` decides **which classes to instantiate from the bytes themselves**. Any serializable class on the classpath whose \`readObject\`, \`readResolve\`, \`hashCode\` or \`compareTo\` does something interesting can be chained into a **gadget chain** that ends in reflection or command execution — without any bug in your own code. The 2015 Apache Commons Collections exploit hit WebLogic, WebSphere, JBoss and Jenkins this way. Defences:
- never deserialize untrusted bytes with \`ObjectInputStream\`; prefer data-only formats;
- if you must, install an **\`ObjectInputFilter\`** (Java 9, JEP 290) with an **allow-list** plus limits (\`maxdepth\`, \`maxrefs\`, \`maxbytes\`, \`maxarray\`): per stream with \`setObjectInputFilter\`, or JVM-wide with \`-Djdk.serialFilter=...\`;
- Java 17 (JEP 415) adds a **filter factory** (\`jdk.serialFilterFactory\`) that picks a filter per deserialization context across the whole JDK.

### JSON and schema-based formats
- **JSON** with Jackson (\`ObjectMapper\`), Gson or JSON-B: text, readable, language-neutral; Jackson maps **records** directly through their canonical constructor (2.12+). Configure unknown-property handling deliberately and never enable polymorphic "default typing" on untrusted input — it reintroduces gadget chains.
- **Protocol Buffers**: a \`.proto\` schema, generated classes, compact binary, numbered fields that make evolution safe (never reuse a field number). Used by gRPC.
- **Avro**: schema-based binary popular with Kafka and Hadoop; readers resolve the writer's schema against their own.
- **Schema evolution** rules for every format: add optional fields with defaults, never change the meaning or type of an existing field, never reuse a removed field's tag or name, and keep old readers working while writers roll out.`,
    whyItExists: `Programs need to persist and transmit state. Java serialization (JDK 1.1, 1997) made that a one-line operation and powered RMI, HTTP sessions, EJB and caches. Its design — arbitrary object graphs, reflective field access, constructors skipped, class names chosen by the data — turned out to be a major security and maintenance liability; Brian Goetz has called it a "horrible mistake". JEP 290 and JEP 415 added filtering, records gave it a safe shape, and the industry moved most data exchange to JSON and schema-based binary formats that carry data, not behaviour.`,
    whenToUse: [
      'Use JSON (Jackson) for public APIs, configuration and data other languages or humans must read.',
      'Use Protocol Buffers or Avro for high-volume service-to-service messages and event streams that must evolve over years.',
      'Use Java serialization only for trusted, short-lived, Java-to-Java data (or legacy APIs that require it), with serialVersionUID declared and an ObjectInputFilter installed.',
      'Use records for data that is serialized in any format: fields are explicit and the canonical constructor validates them.',
    ],
    whenNotToUse: [
      'Do not call ObjectInputStream.readObject on bytes from a network, cookie, file upload or message queue you do not fully control.',
      'Do not use Java serialization as a long-term storage format: class changes break old data.',
      'Do not enable Jackson polymorphic default typing on untrusted JSON.',
      'Do not serialize secrets, connections, threads or caches: mark them transient or keep them out of the data object.',
    ],
    examples: [
      {
        id: 'io-serialization-roundtrip',
        title: 'Round-tripping objects and records in memory',
        runnable: true,
        code: `import java.io.*;
import java.util.*;

public class Main {
    static class Account implements Serializable {
        private static final long serialVersionUID = 1L;
        final String owner;
        final List<String> tags;
        transient String sessionToken;          // never written to the stream

        Account(String owner, List<String> tags, String sessionToken) {
            this.owner = owner;
            this.tags = tags;
            this.sessionToken = sessionToken;
        }
    }

    record Point(int x, int y) implements Serializable {
        Point {
            if (x < 0 || y < 0) throw new IllegalArgumentException("negative");
        }
    }

    static byte[] serialize(Object o) throws IOException {
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        try (ObjectOutputStream out = new ObjectOutputStream(bytes)) {
            out.writeObject(o);
        }
        return bytes.toByteArray();
    }

    static Object deserialize(byte[] data) throws IOException, ClassNotFoundException {
        try (ObjectInputStream in = new ObjectInputStream(new ByteArrayInputStream(data))) {
            return in.readObject();
        }
    }

    public static void main(String[] args) throws Exception {
        Account original = new Account("ada", new ArrayList<>(List.of("admin", "beta")), "s3cr3t");
        byte[] data = serialize(original);
        Account copy = (Account) deserialize(data);

        System.out.println("magic: " + String.format("%02X%02X", data[0], data[1]));
        System.out.println("owner: " + copy.owner);
        System.out.println("tags: " + copy.tags);
        System.out.println("token: " + copy.sessionToken);
        System.out.println("same object? " + (copy == original));

        Point p = (Point) deserialize(serialize(new Point(3, 4)));
        System.out.println("record: " + p + ", equal? " + p.equals(new Point(3, 4)));
    }
}`,
        expectedOutput: `magic: ACED
owner: ada
tags: [admin, beta]
token: null
same object? false
record: Point[x=3, y=4], equal? true`,
        explanation:
          'Every Java serialization stream starts with the magic bytes AC ED, which is how security scanners spot it in traffic. The transient token is not written, so it comes back null. Deserialization creates a new, equal-looking object, never the original instance. The record is rebuilt through its canonical constructor, so its validation runs on the way in.',
      },
      {
        id: 'io-serialization-filter',
        title: 'Restricting deserialization with an ObjectInputFilter allow-list',
        runnable: true,
        code: `import java.io.*;
import java.util.*;

public class Main {
    record Customer(String name) implements Serializable {}
    record Order(String sku, int qty, Customer customer) implements Serializable {}

    static byte[] serialize(Object o) throws IOException {
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        try (ObjectOutputStream out = new ObjectOutputStream(bytes)) {
            out.writeObject(o);
        }
        return bytes.toByteArray();
    }

    static Object readFiltered(byte[] data, ObjectInputFilter filter) throws IOException, ClassNotFoundException {
        try (ObjectInputStream in = new ObjectInputStream(new ByteArrayInputStream(data))) {
            in.setObjectInputFilter(filter);   // must be set before the first readObject
            return in.readObject();
        }
    }

    public static void main(String[] args) throws Exception {
        // Allow exactly our two record classes; reject everything else
        ObjectInputFilter allowList = ObjectInputFilter.Config.createFilter(
            "maxdepth=5;maxbytes=10000;Main$Order;Main$Customer;!*");

        Object ok = readFiltered(serialize(new Order("A-1", 2, new Customer("Ada"))), allowList);
        System.out.println("accepted: " + ok);

        byte[] unexpected = serialize(new HashMap<>(Map.of("k", "v")));
        try {
            readFiltered(unexpected, allowList);
        } catch (InvalidClassException e) {
            System.out.println("rejected: " + e.getClass().getSimpleName());
        }

        // The filter is also asked about every nested class, array and depth
        ObjectInputFilter logging = info -> {
            if (info.serialClass() != null) {
                System.out.println("  check " + info.serialClass().getSimpleName() + " depth=" + info.depth());
            }
            return ObjectInputFilter.Status.UNDECIDED;
        };
        readFiltered(serialize(new Order("B-2", 1, new Customer("Linus"))), logging);
    }
}`,
        expectedOutput: `accepted: Order[sku=A-1, qty=2, customer=Customer[name=Ada]]
rejected: InvalidClassException
  check Order depth=1
  check Customer depth=2`,
        explanation:
          'The pattern "Main$Order;Main$Customer;!*" allows the two records and rejects every other class, so a HashMap (or a gadget-chain class) is refused before it is instantiated. Strings are not passed to the class check. A filter returning UNDECIDED defers to the next decision; with no JVM-wide filter configured, undecided classes are allowed, which is why production filters end with "!*".',
      },
      {
        id: 'io-serialization-hooks',
        title: 'readObject validation and readResolve for singletons',
        runnable: true,
        code: `import java.io.*;

public class Main {
    static final class Range implements Serializable {
        private static final long serialVersionUID = 1L;
        int lo, hi;

        Range(int lo, int hi) {
            if (lo > hi) throw new IllegalArgumentException("lo > hi");
            this.lo = lo;
            this.hi = hi;
        }

        // Deserialization does NOT call the constructor, so re-check the invariant here
        private void readObject(ObjectInputStream in) throws IOException, ClassNotFoundException {
            in.defaultReadObject();
            if (lo > hi) throw new InvalidObjectException("corrupt range " + lo + ".." + hi);
        }
    }

    static final class Config implements Serializable {
        static final Config INSTANCE = new Config();
        private Config() {}
        private Object readResolve() { return INSTANCE; }   // keep the singleton unique
    }

    static Object roundTrip(Object o) throws IOException, ClassNotFoundException {
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        try (ObjectOutputStream out = new ObjectOutputStream(bytes)) { out.writeObject(o); }
        try (ObjectInputStream in = new ObjectInputStream(new ByteArrayInputStream(bytes.toByteArray()))) {
            return in.readObject();
        }
    }

    public static void main(String[] args) throws Exception {
        Range ok = (Range) roundTrip(new Range(1, 5));
        System.out.println("range: " + ok.lo + ".." + ok.hi);

        Range forged = new Range(1, 5);
        forged.hi = -7;                       // simulate a hand-crafted, malicious stream
        try {
            roundTrip(forged);
        } catch (InvalidObjectException e) {
            System.out.println("rejected: " + e.getMessage());
        }

        System.out.println("singleton kept: " + (roundTrip(Config.INSTANCE) == Config.INSTANCE));
    }
}`,
        expectedOutput: `range: 1..5
rejected: corrupt range 1..-7
singleton kept: true`,
        explanation:
          'An attacker controls every field value in the stream, so a class that relies on its constructor for invariants must re-check them in readObject. readResolve replaces the freshly deserialized Config with the canonical instance; without it, deserialization would create a second "singleton".',
      },
      {
        id: 'io-serialization-jackson',
        title: 'JSON with Jackson: records, unknown fields and evolution',
        runnable: false,
        code: `import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;

public class Main {
    // Version 2 of the message added "currency"; old JSON without it still parses (null)
    @JsonIgnoreProperties(ignoreUnknown = true)
    record Order(String id, List<String> skus, long totalCents, String currency) {
        Order {
            if (totalCents < 0) throw new IllegalArgumentException("negative total");
            currency = currency == null ? "EUR" : currency;   // default for old messages
        }
    }

    public static void main(String[] args) throws Exception {
        ObjectMapper mapper = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_NULL_FOR_PRIMITIVES, true);

        String json = mapper.writeValueAsString(new Order("o-1", List.of("A-1", "B-2"), 1999, "USD"));
        System.out.println(json);
        // {"id":"o-1","skus":["A-1","B-2"],"totalCents":1999,"currency":"USD"}

        Order old = mapper.readValue("{\\"id\\":\\"o-0\\",\\"skus\\":[],\\"totalCents\\":500,\\"note\\":\\"x\\"}", Order.class);
        System.out.println(old);
        // Order[id=o-0, skus=[], totalCents=500, currency=EUR]
    }
}`,
        explanation:
          'Not runnable here because Jackson (com.fasterxml.jackson.core:jackson-databind) is a third-party library. Since Jackson 2.12, records are read through their canonical constructor, so the compact constructor validates and fills defaults. ignoreUnknown lets newer producers add fields without breaking older consumers; JSON only ever creates the type you ask for, never a class named in the data (unless you enable default typing, which you should not do for untrusted input).',
      },
    ],
    walkthrough: {
      exampleId: 'io-serialization-roundtrip',
      steps: [
        { lines: [5, 9], text: 'Account opts in with Serializable and pins its version with serialVersionUID. The transient sessionToken is excluded from the byte stream.' },
        { lines: [18, 22], text: 'A serializable record. Its compact constructor validates the components, and deserialization of a record always goes through this constructor.' },
        { lines: [24, 30], text: 'ObjectOutputStream writes the whole object graph into an in-memory ByteArrayOutputStream, so the example needs no files.' },
        { lines: [32, 36], text: 'ObjectInputStream rebuilds the graph. For ordinary classes it does not call the constructor; it allocates the object and sets fields from the stream.' },
        { lines: [39, 41], text: 'Serialize, then deserialize into a brand-new Account. The List field is serialized too, because ArrayList is Serializable.' },
        { lines: [43, 47], text: 'The stream starts with the magic bytes AC ED. The transient field comes back null, and the copy is a different object from the original.' },
        { lines: [49, 50], text: 'The record round-trips to an equal value, and its constructor checks would reject invalid components coming from a forged stream.' },
      ],
    },
    realWorld: {
      title: 'The cache that could run commands',
      scenario: `A Java web application stored user sessions in a shared cache as Java-serialized blobs, and a "remember me" cookie carried a Base64-encoded serialized object so sessions survived restarts. A penetration tester noticed the cookie started with \`rO0AB\` — Base64 for the AC ED magic bytes — replaced it with a payload generated by the public ysoserial tool, and got a shell on the server. The gadget chain used classes from a commons library that was on the classpath for an unrelated feature; none of the team's own code was involved.

The fix came in layers: the cookie became a random opaque token looked up server-side; session data moved to JSON with explicit record types; the remaining Java-serialized cache entries were read only through a JVM-wide \`jdk.serialFilter\` allow-list ending in \`!*\`; and the commons library was upgraded. Later, inter-service events moved to Protocol Buffers so the schema, not Java class names, defined what could be decoded.`,
    },
    commonMistakes: [
      {
        mistake: 'Deserializing untrusted bytes with ObjectInputStream.',
        why: 'The stream chooses which classes are instantiated; gadget chains in libraries on your classpath can execute arbitrary code during readObject.',
        fix: 'Use a data-only format (JSON with explicit types, Protocol Buffers). If Java serialization is unavoidable, install an ObjectInputFilter allow-list with size and depth limits.',
        code: `ObjectInputStream in = new ObjectInputStream(socket.getInputStream());
in.setObjectInputFilter(ObjectInputFilter.Config.createFilter("com.example.dto.*;!*"));`,
      },
      {
        mistake: 'Not declaring serialVersionUID.',
        why: 'The computed default changes with almost any edit to the class, so data written by the previous build fails with InvalidClassException.',
        fix: 'Declare private static final long serialVersionUID = 1L and change it only for truly incompatible changes.',
      },
      {
        mistake: 'Relying on the constructor or field initialisers to set up a deserialized object.',
        why: 'Deserialization skips the constructors and initialisers of serializable classes; transient fields come back as default values and invariants are not checked.',
        fix: 'Re-validate in readObject, lazily rebuild transient state, or use records / the serialization proxy pattern so a constructor always runs.',
      },
      {
        mistake: 'Serializing a class with a non-serializable field.',
        why: 'writeObject throws NotSerializableException for the first non-serializable object it reaches in the graph — often a logger, connection or lambda.',
        fix: 'Mark such fields transient (and recreate them after reading), or serialize a separate data object instead of the service object.',
      },
    ],
    checks: [
      {
        id: 'io3-c1',
        kind: 'predict-output',
        dimension: 'runtime',
        prompt: 'Base is not Serializable; Item is. What does this program print?',
        code: `import java.io.*;

public class Main {
    static class Base {
        Base() { System.out.println("Base()"); }
    }

    static class Item extends Base implements Serializable {
        String name;
        transient int hits = 5;
        Item(String name) { this.name = name; System.out.println("Item()"); }
    }

    public static void main(String[] args) throws Exception {
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        try (ObjectOutputStream out = new ObjectOutputStream(bytes)) {
            out.writeObject(new Item("pen"));
        }
        try (ObjectInputStream in = new ObjectInputStream(new ByteArrayInputStream(bytes.toByteArray()))) {
            Item copy = (Item) in.readObject();
            System.out.println(copy.name + " " + copy.hits);
        }
    }
}`,
        options: [
          { id: 'a', text: 'Base()\nItem()\nBase()\npen 0' },
          { id: 'b', text: 'Base()\nItem()\nBase()\nItem()\npen 5' },
          { id: 'c', text: 'Base()\nItem()\npen 5' },
          { id: 'd', text: 'Base()\nItem()\npen 0' },
        ],
        correctOptionId: 'a',
        explanation:
          'Deserialization does not run Item\'s constructor or field initialisers, so the transient hits field stays 0. It does run the no-arg constructor of the first non-serializable superclass (Base), which is why "Base()" is printed a second time.',
        hints: ['Which constructors does ObjectInputStream call?', 'transient fields are not written, and initialisers are not re-run.'],
      },
      {
        id: 'io3-c2',
        kind: 'mcq',
        dimension: 'debugging',
        prompt:
          'A class implements Serializable but declares no serialVersionUID. After a developer adds a helper method and redeploys, reading cached objects written by the old build fails. Which exception, and why?',
        options: [
          { id: 'a', text: 'ClassNotFoundException, because the class was recompiled' },
          { id: 'b', text: 'InvalidClassException, because the computed serialVersionUID changed with the class structure' },
          { id: 'c', text: 'NotSerializableException, because methods cannot be serialized' },
          { id: 'd', text: 'No exception: adding a method never affects serialization' },
        ],
        correctOptionId: 'b',
        explanation:
          'Without an explicit serialVersionUID the JVM computes one from the class name, interfaces, fields and methods. Any such change produces a different value and the stream is rejected with InvalidClassException ("local class incompatible"). Declaring the UID makes compatible changes work.',
      },
      {
        id: 'io3-c3',
        kind: 'multi-select',
        dimension: 'interview',
        prompt: 'Which measures actually reduce the risk of Java deserialization attacks? Select all that apply.',
        options: [
          { id: 'a', text: 'Replace ObjectInputStream with a data-only format such as JSON mapped to explicit types or Protocol Buffers' },
          { id: 'b', text: 'Install an ObjectInputFilter allow-list ending in "!*", with maxdepth and maxbytes limits' },
          { id: 'c', text: 'Declare serialVersionUID on every class' },
          { id: 'd', text: 'Base64-encode the serialized bytes before sending them' },
          { id: 'e', text: 'Configure a JVM-wide filter with -Djdk.serialFilter (or a filter factory on Java 17+)' },
        ],
        correctOptionIds: ['a', 'b', 'e'],
        explanation:
          'Gadget chains need the stream to choose arbitrary classes. Data-only formats and allow-list filters (per stream, JVM-wide, or via the Java 17 filter factory) stop that. serialVersionUID is about versioning, and Base64 is just an encoding an attacker can produce too.',
      },
      {
        id: 'io3-c4',
        kind: 'predict-output',
        dimension: 'coding',
        prompt: 'Records are deserialized differently from ordinary classes. What does this print?',
        code: `import java.io.*;

public class Main {
    record Temp(int celsius) implements Serializable {
        Temp {
            System.out.println("check " + celsius);
            if (celsius < -273) throw new IllegalArgumentException("below absolute zero");
        }
    }

    public static void main(String[] args) throws Exception {
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        try (ObjectOutputStream out = new ObjectOutputStream(bytes)) {
            out.writeObject(new Temp(21));
        }
        try (ObjectInputStream in = new ObjectInputStream(new ByteArrayInputStream(bytes.toByteArray()))) {
            Object copy = in.readObject();
            System.out.println(copy);
        }
    }
}`,
        options: [
          { id: 'a', text: 'check 21\nTemp[celsius=21]' },
          { id: 'b', text: 'check 21\ncheck 21\nTemp[celsius=21]' },
          { id: 'c', text: 'Temp[celsius=21]' },
          { id: 'd', text: 'check 21\nTemp@1b6d3586' },
        ],
        correctOptionId: 'b',
        explanation:
          'A record is deserialized by reading its component values and calling the canonical constructor, so the compact constructor runs (and validates) a second time. Ordinary classes skip their constructor during deserialization.',
      },
      {
        id: 'io3-c5',
        kind: 'mcq',
        dimension: 'conceptual',
        prompt:
          'Services written in Java, Go and Python exchange millions of events per hour, and the event shape must evolve for years without breaking older consumers. Which format fits best?',
        options: [
          { id: 'a', text: 'Java serialization with a fixed serialVersionUID' },
          { id: 'b', text: 'A schema-based binary format such as Protocol Buffers or Avro, adding only optional fields and never reusing field numbers' },
          { id: 'c', text: 'Free-form JSON with no schema, renaming fields whenever the model changes' },
          { id: 'd', text: 'Externalizable with a hand-written binary layout' },
        ],
        correctOptionId: 'b',
        explanation:
          'Protocol Buffers and Avro are compact, language-neutral and designed for schema evolution. Java serialization and Externalizable are Java-only; schemaless JSON with renamed fields breaks consumers.',
      },
    ],
    challengeIds: [],
    masteryCriteria: [
      'Round-trip an object with ObjectOutputStream/ObjectInputStream and predict the state of transient fields and constructors.',
      'Declare serialVersionUID and explain which changes are compatible.',
      'Explain gadget chains and restrict deserialization with an ObjectInputFilter allow-list.',
      'Validate invariants on deserialization with readObject, readResolve or records.',
      'Pick JSON, Protocol Buffers/Avro or Java serialization for a scenario and justify the choice.',
    ],
    relatedLessonIds: ['io-files', 'io-http', 't-modern-types', 'o-object-contracts', 'sp-rest'],
    revision: [
      { id: 'r1', question: 'Which constructor runs when an ordinary Serializable object is deserialized?', answer: 'Only the no-arg constructor of the first non-serializable superclass (often Object). The serializable class\'s own constructors and field initialisers do not run.' },
      { id: 'r2', question: 'How are records deserialized?', answer: 'Their component values are read from the stream and passed to the canonical constructor, so validation in the record\'s constructor always runs.' },
      { id: 'r3', question: 'What is a gadget chain?', answer: 'A sequence of existing serializable classes whose readObject/hashCode/compareTo side effects, triggered during deserialization of attacker-chosen bytes, end in code execution.' },
      { id: 'r4', question: 'What do JEP 290 and JEP 415 provide?', answer: 'JEP 290 (Java 9): ObjectInputFilter, per stream or JVM-wide via jdk.serialFilter. JEP 415 (Java 17): a filter factory that selects a filter for each deserialization context.' },
      { id: 'r5', question: 'Name three safe schema-evolution rules.', answer: 'Add new fields as optional with defaults; never change the type or meaning of an existing field; never reuse a removed field number or name.' },
    ],
  },
  {
    id: 'io-nio-sockets',
    moduleId: 'io',
    title: 'NIO channels, buffers and sockets',
    summary:
      'Streams vs channels, ByteBuffer mechanics, FileChannel, Socket/ServerSocket over loopback, blocking vs non-blocking I/O, Selector event loops, and why virtual threads make blocking sockets scale again.',
    estimatedMinutes: 45,
    difficulty: 'advanced',
    prerequisites: ['io-files', 'cc-threads'],
    versionNotes: [
      { feature: 'java.nio: Buffer, Channel, Selector (JSR 51)', since: 4 },
      { feature: 'NIO.2: AsynchronousSocketChannel, AsynchronousFileChannel (JSR 203)', since: 7 },
      { feature: 'Socket/ServerSocket reimplemented on NIO (JEP 353)', since: 13 },
      { feature: 'Unix-domain socket channels (JEP 380)', since: 16 },
      { feature: 'Virtual threads (JEP 444)', since: 21, note: 'Preview in 19-20, final in 21' },
    ],
    objectives: [
      'Contrast stream-oriented java.io with buffer-oriented NIO channels.',
      'Track a ByteBuffer\'s position, limit and capacity through put, flip, get, compact and clear.',
      'Read and write files with FileChannel and describe memory-mapped files.',
      'Write a loopback TCP echo server and client with ServerSocket and Socket.',
      'Compare blocking, non-blocking, multiplexed (Selector) and asynchronous I/O, and explain how virtual threads change the trade-off.',
    ],
    plainEnglish: `Classic \`java.io\` treats data as a **stream**: you read one byte or one line after another, and each call **blocks** — the thread waits — until data is available.

NIO ("New I/O", Java 1.4) adds a second style. Data moves between **channels** (a file, a network connection) and **buffers** (a fixed block of memory with a read/write cursor). A network channel can be switched to **non-blocking** mode, and one thread can use a **Selector** to watch thousands of connections and only touch the ones that are ready. That is how servers such as Netty handled huge numbers of connections with a handful of threads.

Underneath every networked Java program sit **sockets**: a \`ServerSocket\` waits for connections on a port, and each connection is a \`Socket\` with an input stream and an output stream. Since Java 21, **virtual threads** make the simple style — one thread per connection, blocking reads — cheap enough to scale again, so you often get NIO-level scalability with plain, readable blocking code.`,
    technical: `### Streams vs channels
- \`InputStream\`/\`OutputStream\` are one-directional and always blocking; you read into a \`byte[]\` you manage yourself.
- A **channel** (\`FileChannel\`, \`SocketChannel\`, \`ServerSocketChannel\`, \`DatagramChannel\`) reads into and writes from a \`ByteBuffer\`, can be bidirectional, and network channels can be **non-blocking**. \`read\` returns the number of bytes read, \`0\` (non-blocking, nothing ready) or \`-1\` (end of stream). \`write\` may write **only part** of the buffer: always loop on \`hasRemaining()\`.

### ByteBuffer
- Three indexes: \`0 <= position <= limit <= capacity\`. **Capacity** is fixed; **limit** is the first index you may not touch; **position** is where the next get/put happens.
- \`put\` advances position. \`flip()\` sets limit = position, position = 0: "I finished writing, now read what I wrote". \`clear()\` sets position = 0, limit = capacity (the bytes are not erased). \`compact()\` copies the unread bytes to the start and positions after them, ready to append more. \`rewind()\` re-reads; \`mark()\`/\`reset()\` bookmark a position.
- **Heap** buffers (\`allocate\`) are backed by a \`byte[]\`. **Direct** buffers (\`allocateDirect\`) live outside the heap, so the OS can do I/O without an extra copy; they are expensive to allocate and should be pooled and reused. Their memory is limited by \`-XX:MaxDirectMemorySize\`.
- Byte order defaults to big-endian; call \`order(ByteOrder.LITTLE_ENDIAN)\` for little-endian protocols.

### FileChannel
\`FileChannel.open(path, options)\` supports positional reads/writes, \`force()\` (fsync), \`lock()\`, and zero-copy \`transferTo\`/\`transferFrom\` (sendfile on Linux). \`map()\` returns a \`MappedByteBuffer\`: the file is mapped into virtual memory and the OS pages it in on demand — fast for large random-access files, but the mapping is released only when the buffer is garbage-collected (Java 22's FFM API, JEP 454, adds explicit \`Arena\`-scoped mappings).

### Sockets
- \`new ServerSocket(port, backlog, bindAddress)\` listens; port \`0\` asks the OS for any free port (\`getLocalPort()\` tells you which). \`accept()\` blocks until a client connects and returns a \`Socket\`.
- \`new Socket(host, port)\` connects. Wrap \`getInputStream()\`/\`getOutputStream()\` with a charset-aware reader/writer and **define framing** (lines, length prefixes): TCP is a byte stream, not a message stream — one write can arrive as two reads and vice versa.
- Set timeouts: \`setSoTimeout\` for reads, \`connect(address, timeout)\` for connecting. Close sockets with try-with-resources; reading \`-1\` / \`null\` means the peer closed its side.
- Since Java 13 (JEP 353) the classic \`Socket\` API is implemented on top of NIO, which is what lets virtual threads park instead of blocking an OS thread.

### I/O models
- **Blocking, thread per connection**: simplest code; with platform threads (about 1 MB of stack each, OS-scheduled) it stops scaling at a few thousand connections.
- **Non-blocking + Selector (multiplexed)**: register channels with \`OP_ACCEPT\`/\`OP_READ\`/\`OP_WRITE\`; \`select()\` returns the ready ones; an **event loop** handles them. Scales to very many connections on few threads, but you must manage partial reads, per-connection state and back-pressure yourself — hence frameworks such as **Netty**, which wrap it in pipelines of handlers (used by gRPC, Vert.x, Spring WebFlux).
- **Asynchronous** (\`AsynchronousSocketChannel\`): start an operation and get a \`Future\` or a \`CompletionHandler\` callback.
- **Virtual threads (Java 21)**: blocking calls on a virtual thread unmount it from its carrier thread; the JDK parks it on an internal poller and resumes it when the socket is ready. Thread-per-connection code then scales to hundreds of thousands of connections. CPU-bound work does not get faster, and before Java 24 (JEP 491) blocking inside \`synchronized\` could pin the carrier.`,
    whyItExists: `java.io (1996) was designed for one thread per stream. When Java moved onto servers handling tens of thousands of connections, that model ran out of threads, so JSR 51 added buffers, channels and selectors in Java 1.4 (2002), mirroring the OS facilities (select, epoll, kqueue) that C servers used. NIO.2 (Java 7) added asynchronous channels. The resulting code was fast but hard to write, which is why Netty and similar frameworks became the norm. Virtual threads (Java 21) are the JDK's answer to that complexity: keep the scalability of the event loop underneath, but let application code block naturally again.`,
    whenToUse: [
      'Use ByteBuffer and channels when implementing binary protocols, zero-copy file transfer or memory-mapped access to large files.',
      'Use Socket/ServerSocket (on virtual threads) for simple custom TCP protocols, tests and tools.',
      'Use a framework such as Netty (or a server built on it) for production network servers that need TLS, codecs, back-pressure and very high connection counts.',
      'Use virtual threads with blocking I/O for request-per-thread servers and clients that mostly wait on the network.',
    ],
    whenNotToUse: [
      'Do not write a raw Selector event loop for an ordinary web application: use a framework or virtual threads.',
      'Do not assume one write equals one read on a TCP socket; always define framing.',
      'Do not allocate a direct ByteBuffer per request: allocate and reuse (or pool) them.',
      'Do not use raw sockets where HTTP (HttpClient), gRPC or a message broker already solves the problem.',
    ],
    examples: [
      {
        id: 'io-nio-bytebuffer',
        title: 'ByteBuffer position, limit and capacity, plus FileChannel',
        runnable: true,
        code: `import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.channels.FileChannel;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;

public class Main {
    static void show(String step, ByteBuffer b) {
        System.out.println(step + ": pos=" + b.position() + " lim=" + b.limit() + " cap=" + b.capacity());
    }

    public static void main(String[] args) throws IOException {
        ByteBuffer buf = ByteBuffer.allocate(8);
        show("new", buf);

        buf.put((byte) 'J').put((byte) 'a').put((byte) 'v');
        show("after 3 puts", buf);

        buf.flip();                             // switch from writing to reading
        show("after flip", buf);

        System.out.println("read: " + (char) buf.get());
        show("after 1 get", buf);

        buf.compact();                          // keep unread bytes, get ready to write again
        show("after compact", buf);

        buf.clear();                            // forget everything (bytes stay, indexes reset)
        show("after clear", buf);

        Path file = Files.createTempFile("jf-nio", ".bin");
        try (FileChannel ch = FileChannel.open(file, StandardOpenOption.WRITE)) {
            ByteBuffer out = ByteBuffer.wrap("hello, channel".getBytes(StandardCharsets.UTF_8));
            while (out.hasRemaining()) ch.write(out);   // write may be partial: loop
        }
        try (FileChannel ch = FileChannel.open(file, StandardOpenOption.READ)) {
            ByteBuffer in = ByteBuffer.allocate(64);
            ch.read(in);
            in.flip();
            System.out.println("file: " + StandardCharsets.UTF_8.decode(in) + " (" + ch.size() + " bytes)");
        }
        Files.delete(file);
        System.out.println("heap buffer direct? " + buf.isDirect());
        System.out.println("allocateDirect direct? " + ByteBuffer.allocateDirect(16).isDirect());
    }
}`,
        expectedOutput: `new: pos=0 lim=8 cap=8
after 3 puts: pos=3 lim=8 cap=8
after flip: pos=0 lim=3 cap=8
read: J
after 1 get: pos=1 lim=3 cap=8
after compact: pos=2 lim=8 cap=8
after clear: pos=0 lim=8 cap=8
file: hello, channel (14 bytes)
heap buffer direct? false
allocateDirect direct? true`,
        explanation:
          'flip() turns "what I wrote" into "what can be read" by moving limit to the old position. compact() moves the two unread bytes ("av") to the front and leaves position after them. The FileChannel part shows the channel pattern: wrap or fill a buffer, write it in a loop, then read into a buffer and flip it before decoding.',
      },
      {
        id: 'io-nio-echo',
        title: 'A loopback echo server with ServerSocket, Socket and a virtual thread',
        runnable: true,
        minJavaVersion: 21,
        code: `import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;

public class Main {
    public static void main(String[] args) throws Exception {
        try (ServerSocket server = new ServerSocket(0, 50, InetAddress.getLoopbackAddress())) {
            int port = server.getLocalPort();          // port 0 = "any free port"

            // Server: one virtual thread blocks in accept() and then in readLine()
            Thread serverThread = Thread.ofVirtual().start(() -> {
                try (Socket conn = server.accept();
                     BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8));
                     PrintWriter out = new PrintWriter(new OutputStreamWriter(conn.getOutputStream(), StandardCharsets.UTF_8), true)) {
                    String line;
                    while ((line = in.readLine()) != null && !line.equals("bye")) {
                        out.println("echo: " + line.toUpperCase());
                    }
                    out.println("closing");
                } catch (IOException e) {
                    System.out.println("server error: " + e.getMessage());
                }
            });

            // Client: connect over loopback, send lines, read each reply
            try (Socket client = new Socket(InetAddress.getLoopbackAddress(), port);
                 BufferedReader in = new BufferedReader(new InputStreamReader(client.getInputStream(), StandardCharsets.UTF_8));
                 PrintWriter out = new PrintWriter(new OutputStreamWriter(client.getOutputStream(), StandardCharsets.UTF_8), true)) {
                client.setSoTimeout(2_000);             // never wait forever for a reply
                for (String msg : new String[] {"hello", "sockets"}) {
                    out.println(msg);
                    System.out.println("sent " + msg + " -> got " + in.readLine());
                }
                out.println("bye");
                System.out.println("server said: " + in.readLine());
                System.out.println("end of stream: " + (in.readLine() == null));
            }
            serverThread.join();
            System.out.println("server thread done: " + !serverThread.isAlive());
        }
    }
}`,
        expectedOutput: `sent hello -> got echo: HELLO
sent sockets -> got echo: SOCKETS
server said: closing
end of stream: true
server thread done: true`,
        explanation:
          'Everything stays on the loopback interface, so no external network is needed, and port 0 avoids clashes with other programs. Lines are the framing: readLine() returns once a full line has arrived, however TCP split the bytes. After the server closes the connection, the client\'s readLine() returns null (end of stream). Only the client prints the conversation, which keeps the output order deterministic.',
      },
      {
        id: 'io-nio-selector',
        title: 'One thread, one Selector, three non-blocking connections',
        runnable: true,
        code: `import java.io.IOException;
import java.net.*;
import java.nio.ByteBuffer;
import java.nio.channels.*;
import java.nio.charset.StandardCharsets;
import java.util.Iterator;

public class Main {
    // One thread, one Selector, many connections: the event loop behind Netty-style servers
    static void eventLoop(Selector selector, ServerSocketChannel server, int clientsToServe) throws IOException {
        int closed = 0;
        while (closed < clientsToServe) {
            selector.select();                                   // block until some channel is ready
            Iterator<SelectionKey> keys = selector.selectedKeys().iterator();
            while (keys.hasNext()) {
                SelectionKey key = keys.next();
                keys.remove();                                   // we must remove handled keys ourselves
                if (key.isAcceptable()) {
                    SocketChannel ch = server.accept();          // never null here: the key said "ready"
                    ch.configureBlocking(false);
                    ch.register(selector, SelectionKey.OP_READ, ByteBuffer.allocate(64));
                } else if (key.isReadable()) {
                    SocketChannel ch = (SocketChannel) key.channel();
                    ByteBuffer buf = (ByteBuffer) key.attachment();
                    int n = ch.read(buf);
                    if (n == -1) {                               // client closed its side
                        ch.close();
                        closed++;
                        continue;
                    }
                    buf.flip();
                    while (buf.hasRemaining()) ch.write(buf);    // tiny messages: echo straight back
                    buf.clear();
                }
            }
        }
    }

    public static void main(String[] args) throws Exception {
        Selector selector = Selector.open();
        ServerSocketChannel server = ServerSocketChannel.open();
        server.bind(new InetSocketAddress(InetAddress.getLoopbackAddress(), 0));
        server.configureBlocking(false);
        server.register(selector, SelectionKey.OP_ACCEPT);
        int port = ((InetSocketAddress) server.getLocalAddress()).getPort();

        Thread loop = new Thread(() -> {
            try { eventLoop(selector, server, 3); } catch (IOException e) { System.out.println("loop error: " + e); }
        });
        loop.start();

        // Three blocking clients, all served by the single event-loop thread
        SocketChannel[] clients = new SocketChannel[3];
        for (int i = 0; i < 3; i++) {
            clients[i] = SocketChannel.open(new InetSocketAddress(InetAddress.getLoopbackAddress(), port));
        }
        for (int i = 2; i >= 0; i--) {                           // talk to them in reverse order
            byte[] msg = ("client-" + i).getBytes(StandardCharsets.UTF_8);
            clients[i].write(ByteBuffer.wrap(msg));
            ByteBuffer reply = ByteBuffer.allocate(msg.length);
            while (reply.hasRemaining()) clients[i].read(reply);
            reply.flip();
            System.out.println("echoed: " + StandardCharsets.UTF_8.decode(reply));
        }
        for (SocketChannel c : clients) c.close();
        loop.join();
        selector.close();
        server.close();
        System.out.println("event loop served 3 clients on 1 thread");
    }
}`,
        expectedOutput: `echoed: client-2
echoed: client-1
echoed: client-0
event loop served 3 clients on 1 thread`,
        explanation:
          'All three connections stay open at once, yet a single thread serves them: select() reports which channels are ready, and the loop handles only those. Each connection keeps its own buffer as the key\'s attachment - per-connection state that thread-per-connection code would keep in local variables. A real server would also handle partial writes with OP_WRITE and frame messages; frameworks such as Netty do this for you.',
      },
    ],
    walkthrough: {
      exampleId: 'io-nio-echo',
      steps: [
        { lines: [7, 8], text: 'The server binds to the loopback address on port 0, so the OS picks a free port; getLocalPort() reveals which one.' },
        { lines: [10, 11], text: 'The server runs on a virtual thread. Its accept() and readLine() calls block, but a blocked virtual thread releases its carrier OS thread.' },
        { lines: [12, 14], text: 'One accepted connection is a Socket with an input and an output stream. Readers and writers name UTF-8 explicitly; autoFlush=true sends each println immediately.' },
        { lines: [15, 19], text: 'The protocol is line-based: read a line, answer with an upper-cased echo, stop at "bye". Lines are the framing that turns a byte stream into messages.' },
        { lines: [25, 29], text: 'The client connects to the same loopback port and sets a read timeout so a broken server cannot hang it forever.' },
        { lines: [30, 33], text: 'Each request waits for its reply before sending the next, so the printed conversation is deterministic.' },
        { lines: [34, 36], text: 'After "bye" the server closes its socket; the client\'s next readLine() returns null, which means end of stream.' },
        { lines: [38, 39], text: 'join() waits for the server thread to finish before the ServerSocket is closed by try-with-resources.' },
      ],
    },
    realWorld: {
      title: 'From 200 threads to 50,000 connections',
      scenario: `A telemetry gateway accepted long-lived TCP connections from IoT devices that sent a small reading every few seconds. The first version used a fixed pool of 200 platform threads, one per connection, each blocked in \`readLine()\`. At 200 devices new connections queued in the accept backlog and timed out, although the CPU was 3% busy.

A rewrite on a hand-made Selector loop scaled, but a bug in partial-read handling corrupted messages that arrived split across two TCP segments, and it took weeks to find. The team finally moved to Java 21: the original thread-per-connection code, now started with \`Executors.newVirtualThreadPerTaskExecutor()\`, plus a length-prefixed frame decoder and \`setSoTimeout\` for dead devices. It handled 50,000 connections on a small VM with code a new team member could read in an afternoon. Their public-facing TLS endpoint stayed on Netty, where codecs, TLS and back-pressure were already solved.`,
    },
    commonMistakes: [
      {
        mistake: 'Forgetting flip() before reading (or writing out) a buffer you just filled.',
        why: 'After puts, position is at the end of the data and limit is capacity, so reads see the unused tail and channel writes send zero or garbage bytes.',
        fix: 'Call flip() between filling a buffer and draining it; call clear() or compact() before filling it again.',
        code: `buf.put(data);
buf.flip();                  // limit = end of data, position = 0
while (buf.hasRemaining()) channel.write(buf);
buf.clear();`,
      },
      {
        mistake: 'Assuming a single write() or read() moves the whole message.',
        why: 'Channel writes can be partial, and TCP may split or merge messages arbitrarily.',
        fix: 'Loop on hasRemaining() for writes, and frame messages (newline or length prefix) so the reader knows where each one ends.',
      },
      {
        mistake: 'Forgetting to remove keys from selectedKeys().',
        why: 'The Selector never clears the selected-key set itself, so stale keys are processed again on the next loop, for example calling accept() when nothing is pending.',
        fix: 'Iterate with an Iterator and call remove() for each key you handle.',
      },
      {
        mistake: 'Sockets without timeouts.',
        why: 'A peer that stops responding without closing the connection leaves read() blocked forever, leaking a thread.',
        fix: 'Set setSoTimeout for reads and use connect(address, timeoutMillis); close sockets with try-with-resources.',
      },
    ],
    checks: [
      {
        id: 'io4-c1',
        kind: 'predict-output',
        dimension: 'coding',
        prompt: 'Trace the buffer indexes. What does this program print?',
        code: `import java.nio.ByteBuffer;

public class Main {
    public static void main(String[] args) {
        ByteBuffer b = ByteBuffer.allocate(10);
        b.put(new byte[] {1, 2, 3, 4});
        b.flip();
        b.get();
        b.get();
        System.out.println(b.remaining() + " " + b.limit());
        b.compact();
        System.out.println(b.position() + " " + b.limit());
    }
}`,
        options: [
          { id: 'a', text: '2 4\n2 10' },
          { id: 'b', text: '8 10\n0 10' },
          { id: 'c', text: '2 4\n0 4' },
          { id: 'd', text: '2 10\n4 10' },
        ],
        correctOptionId: 'a',
        explanation:
          'After four puts, flip() sets limit=4 and position=0. Two gets leave position=2, so remaining()=2. compact() copies the two unread bytes to the start, sets position=2 (after them) and limit=capacity=10, ready for more puts.',
        hints: ['flip(): limit = position, position = 0.', 'compact() leaves the buffer in write mode.'],
      },
      {
        id: 'io4-c2',
        kind: 'mcq',
        dimension: 'debugging',
        prompt:
          'A client fills a ByteBuffer with a 12-byte request using put() and immediately calls channel.write(buf). The server receives nothing useful. What is the most likely bug?',
        options: [
          { id: 'a', text: 'The buffer must be direct to be written to a channel' },
          { id: 'b', text: 'flip() was not called, so write() sends the bytes between position (12) and limit (capacity) instead of the request' },
          { id: 'c', text: 'SocketChannel.write only accepts buffers created with wrap()' },
          { id: 'd', text: 'The channel must be in non-blocking mode' },
        ],
        correctOptionId: 'b',
        explanation:
          'write() sends the bytes from position to limit. Without flip(), position is after the request and limit is capacity, so the request itself is never sent. Heap buffers work fine with channels.',
      },
      {
        id: 'io4-c3',
        kind: 'multi-select',
        dimension: 'interview',
        prompt: 'Which statements about Java I/O models are true? Select all that apply.',
        options: [
          { id: 'a', text: 'A Selector lets one thread wait on many non-blocking channels and handle only those that are ready.' },
          { id: 'b', text: 'Virtual threads make CPU-bound work faster.' },
          { id: 'c', text: 'With virtual threads (Java 21), a blocking socket read parks the virtual thread and frees its carrier OS thread.' },
          { id: 'd', text: 'In non-blocking mode, SocketChannel.read can return 0 when no data is available.' },
          { id: 'e', text: 'TCP preserves message boundaries, so one write always arrives as one read.' },
        ],
        correctOptionIds: ['a', 'c', 'd'],
        explanation:
          'Selectors multiplex readiness; non-blocking reads return 0 when nothing is ready; virtual threads park on blocking I/O. Virtual threads do not add CPU, and TCP is a byte stream without message boundaries.',
      },
      {
        id: 'io4-c4',
        kind: 'mcq',
        dimension: 'conceptual',
        prompt: 'Why do tests and examples bind a ServerSocket to port 0 on the loopback address?',
        options: [
          { id: 'a', text: 'Port 0 is a special port that accepts connections from every interface' },
          { id: 'b', text: 'The OS assigns any free port, avoiding clashes; loopback keeps the server unreachable from other machines' },
          { id: 'c', text: 'Port 0 disables TCP buffering' },
          { id: 'd', text: 'Loopback connections do not need to be closed' },
        ],
        correctOptionId: 'b',
        explanation:
          'Binding to port 0 lets the OS pick an unused ephemeral port (read it with getLocalPort()), so parallel tests never collide. Binding to the loopback address means only processes on the same machine can connect.',
      },
      {
        id: 'io4-c5',
        kind: 'mcq',
        dimension: 'interview',
        prompt:
          'You are building a new internal service in Java 21 that holds 20,000 mostly idle TCP connections and does a little work per message. Which approach is the simplest that scales?',
        options: [
          { id: 'a', text: 'A fixed pool of 200 platform threads, one blocking connection each' },
          { id: 'b', text: 'Blocking Socket code with one virtual thread per connection, plus timeouts and message framing' },
          { id: 'c', text: 'A new platform thread per connection with a 1 MB stack' },
          { id: 'd', text: 'Polling every socket in a busy loop on one thread' },
        ],
        correctOptionId: 'b',
        explanation:
          'Virtual threads cost a few hundred bytes to kilobytes each and park during blocking I/O, so thread-per-connection code scales to tens of thousands of connections. A fixed pool caps connections at its size; 20,000 platform threads waste memory; busy polling burns CPU. For heavy protocol work (TLS, codecs, back-pressure) a framework like Netty is still a good choice.',
      },
    ],
    challengeIds: [],
    masteryCriteria: [
      'Trace position, limit and capacity through put, flip, get, compact and clear.',
      'Write to and read from a FileChannel, looping on partial writes.',
      'Build a loopback client/server with ServerSocket and Socket, with framing and timeouts.',
      'Explain blocking, non-blocking, multiplexed and asynchronous I/O and where a Selector event loop fits.',
      'Explain how virtual threads make blocking socket code scale and what they do not fix.',
    ],
    relatedLessonIds: ['io-files', 'io-http', 'cc-threads', 'io-serialization', 'perf-optimisation'],
    revision: [
      { id: 'r1', question: 'What does flip() do?', answer: 'Sets limit to the current position and position to 0, switching a buffer from being filled to being drained.' },
      { id: 'r2', question: 'Difference between clear() and compact()?', answer: 'clear() resets position to 0 and limit to capacity, discarding unread data logically. compact() keeps the unread bytes by moving them to the start and positions after them.' },
      { id: 'r3', question: 'What does read() returning -1 mean on a socket or channel?', answer: 'End of stream: the peer closed its side of the connection.' },
      { id: 'r4', question: 'Why must you remove keys from selectedKeys()?', answer: 'The Selector adds ready keys to the set but never removes them; unremoved keys are handled again on the next iteration.' },
      { id: 'r5', question: 'Why do virtual threads make blocking sockets scalable?', answer: 'A blocking call on a virtual thread unmounts it from its carrier OS thread; the JDK waits for readiness with an internal poller and remounts it later, so idle connections cost little memory and no OS thread.' },
    ],
  },
];
