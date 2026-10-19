import type { LessonConcepts } from '@/types/curriculum';

/** Concept pages for the extra I/O lessons: serialization, and NIO channels/buffers/sockets. */
export const serializationNioConcepts: Record<string, LessonConcepts> = {
  'io-serialization': {
    interviewDefinition:
      '**Serialization** converts an in-memory object graph into a byte (or text) representation that can be stored or sent, and **deserialization** rebuilds objects from it. Java\'s built-in mechanism (`Serializable`, `ObjectOutputStream`) writes non-`transient` fields reflectively and rebuilds objects **without running their constructors**, letting the byte stream choose which classes to instantiate. That makes deserializing untrusted data a remote-code-execution risk, so modern systems prefer explicit, data-only formats — JSON, Protocol Buffers, Avro — and guard any remaining Java serialization with an `ObjectInputFilter` allow-list.',
    interviewFollowUps: [
      {
        question: 'What is `serialVersionUID` and what happens if you omit it?',
        answer: 'It is the class\'s serialization version, written into the stream and compared on read. If omitted, the JVM computes it from the class structure, so harmless edits change it and old data fails with `InvalidClassException`. Declare it explicitly and change it only for incompatible changes.',
      },
      {
        question: 'Why is Java deserialization of untrusted data dangerous?',
        answer: 'The stream names the classes to create, and deserialization calls methods such as `readObject`, `readResolve`, `hashCode` or `compareTo` on them. Attackers chain existing library classes (**gadget chains**) so that these calls end in reflection or command execution — no bug in your own code is needed.',
      },
      {
        question: 'How do records change Java serialization?',
        answer: 'A record serializes only its components and is deserialized by calling its **canonical constructor**, so validation always runs and fields cannot be forged around it. Custom `readObject`/`writeObject` hooks are ignored for records.',
      },
      {
        question: 'Does `transient` work with JSON libraries such as Jackson?',
        answer: 'Not by default in the same way: Jackson works from getters, fields and constructor parameters, and uses its own annotations such as `@JsonIgnore`. Recent Jackson versions can also honour `transient` (`MapperFeature.PROPAGATE_TRANSIENT_MARKER`), but you should not rely on Java-serialization keywords to shape JSON.',
      },
    ],
    mnemonic: {
      device: 'FLAT and back: "Freeze, Label, And Trust carefully"',
      expansion: [
        { key: 'Freeze', meaning: 'Serialization flattens a live object graph into bytes (non-transient fields only)' },
        { key: 'Label', meaning: 'serialVersionUID labels the class version, so readers can tell whether the bytes still match' },
        { key: 'And', meaning: 'And on the way back, constructors are skipped (records excepted), so invariants must be re-checked' },
        { key: 'Trust carefully', meaning: 'Never deserialize untrusted bytes without an ObjectInputFilter allow-list, or better, use a data-only format' },
      ],
      visual: 'Picture flat-packed furniture: the factory flattens a wardrobe into a box with a version label. At home you rebuild it from the instructions in the box — so if a stranger mailed you the box, you would check what is inside before following its instructions.',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'A recipe versus a robot chef',
        body: 'JSON or Protocol Buffers are like a recipe: plain data that your own code (the cook) decides how to use. Java serialization is like accepting a robot chef in a box that unpacks and starts running itself: the bytes decide which classes come alive. That is convenient between trusted kitchens and dangerous when the box comes from a stranger.',
      },
      {
        kind: 'insight',
        title: 'Deserialization is a hidden constructor',
        body: 'Every check you wrote in a constructor is bypassed by `readObject` for an ordinary class: the object is allocated, fields are poured in from the stream, and only the no-arg constructor of the first non-serializable superclass runs. *Effective Java* calls `readObject` "another public constructor" — validate there, or use records or the serialization proxy pattern so a real constructor always runs.',
      },
      {
        kind: 'real-world',
        title: 'The Commons Collections wave of 2015',
        body: 'Researchers showed that `InvokerTransformer` from Apache Commons Collections, present on the classpath of WebLogic, WebSphere, JBoss and Jenkins, could be chained into command execution during `readObject`. Endpoints that accepted serialized Java objects (admin protocols, RMI, cookies) were exploitable remotely. The fallout led to JEP 290 filters and to most frameworks removing Java serialization from their wire protocols.',
      },
      {
        kind: 'angle',
        title: 'Schema is a contract between two different times',
        body: 'A serialized message is read by code that did not exist when it was written — or by code that has since changed. Formats such as Protocol Buffers make that explicit with numbered fields and rules (only add optional fields, never reuse numbers). Java serialization ties the format to private field names, so a harmless-looking refactor can make last week\'s data unreadable.',
      },
      {
        kind: 'insight',
        title: 'JSON is safe only while the type comes from you',
        body: '`mapper.readValue(json, Order.class)` is safe because your code chooses the type. Jackson\'s polymorphic "default typing" lets the JSON name the class to instantiate — which recreates the gadget-chain problem in JSON form and caused a long series of Jackson CVEs. Use explicit subtypes (`@JsonSubTypes`) or sealed hierarchies instead.',
      },
    ],
    diagrams: [
      {
        id: 'io-serialization-graph',
        kind: 'concept',
        title: 'An object graph flattened into bytes and rebuilt',
        caption: 'Serialization walks every reachable, non-transient field. The reader gets a brand-new, equal graph; transient fields come back as default values and the original objects are never shared.',
        cols: 5,
        rows: 3,
        nodes: [
          { id: 'acc', label: 'Account', detail: 'owner = "ada"', col: 0, row: 0, tone: 'primary' },
          { id: 'tags', label: 'ArrayList tags', detail: '["admin", "beta"]', col: 0, row: 1, tone: 'primary' },
          { id: 'tok', label: 'transient token', detail: '"s3cr3t" (skipped)', col: 0, row: 2, tone: 'warning' },
          { id: 'oos', label: 'ObjectOutputStream', detail: 'reflective field walk', col: 1, row: 1, tone: 'accent' },
          { id: 'bytes', label: 'AC ED 00 05 ...', detail: 'class descriptors + field values', col: 2, row: 1, shape: 'note', tone: 'neutral' },
          { id: 'ois', label: 'ObjectInputStream', detail: 'no constructor call', col: 3, row: 1, tone: 'accent' },
          { id: 'acc2', label: 'new Account', detail: 'owner = "ada"', col: 4, row: 0, tone: 'success' },
          { id: 'tags2', label: 'new ArrayList', detail: '["admin", "beta"]', col: 4, row: 1, tone: 'success' },
          { id: 'tok2', label: 'token = null', detail: 'default value', col: 4, row: 2, tone: 'warning' },
        ],
        edges: [
          { from: 'acc', to: 'tags', label: 'references' },
          { from: 'tags', to: 'oos' },
          { from: 'oos', to: 'bytes', label: 'writeObject' },
          { from: 'bytes', to: 'ois', label: 'readObject' },
          { from: 'ois', to: 'tags2' },
          { from: 'acc2', to: 'tags2', label: 'references' },
          { from: 'tok', to: 'oos', dashed: true, label: 'not written' },
          { from: 'ois', to: 'tok2', dashed: true },
        ],
        groups: [
          { label: 'Original graph', fromCol: 0, toCol: 0, fromRow: 0, toRow: 2, tone: 'primary' },
          { label: 'Rebuilt copy', fromCol: 4, toCol: 4, fromRow: 0, toRow: 2, tone: 'success' },
        ],
      },
      {
        id: 'io-serialization-read-flow',
        kind: 'flow',
        title: 'What readObject does with a filter installed',
        caption: 'The filter is consulted for every class, array and depth before anything is instantiated. Ordinary classes are allocated without a constructor; records go through the canonical constructor.',
        cols: 4,
        rows: 4,
        nodes: [
          { id: 'in', label: 'Incoming bytes', detail: 'file, socket, cache', col: 0, row: 0, shape: 'note', tone: 'neutral' },
          { id: 'desc', label: 'Read class descriptor', detail: 'name + serialVersionUID', col: 1, row: 0, tone: 'primary' },
          { id: 'filter', label: 'ObjectInputFilter', detail: 'allow-list + limits', col: 2, row: 0, tone: 'accent' },
          { id: 'reject', label: 'InvalidClassException', detail: 'nothing instantiated', col: 3, row: 0, shape: 'pill', tone: 'danger' },
          { id: 'kind', label: 'Record or class?', col: 2, row: 1, tone: 'neutral' },
          { id: 'ctor', label: 'Canonical constructor', detail: 'validation runs', col: 1, row: 2, tone: 'success' },
          { id: 'alloc', label: 'Allocate, set fields', detail: 'constructor skipped', col: 3, row: 2, tone: 'warning' },
          { id: 'hooks', label: 'readObject, readResolve', detail: 're-validate or replace', col: 3, row: 3, tone: 'primary' },
          { id: 'obj', label: 'Object returned', col: 1, row: 3, shape: 'pill', tone: 'success' },
        ],
        edges: [
          { from: 'in', to: 'desc' },
          { from: 'desc', to: 'filter' },
          { from: 'filter', to: 'reject', label: 'REJECTED' },
          { from: 'filter', to: 'kind', label: 'ALLOWED' },
          { from: 'kind', to: 'ctor', label: 'record' },
          { from: 'kind', to: 'alloc', label: 'ordinary class' },
          { from: 'alloc', to: 'hooks' },
          { from: 'hooks', to: 'obj' },
          { from: 'ctor', to: 'obj' },
        ],
      },
      {
        id: 'io-serialization-gadget',
        kind: 'architecture',
        title: 'How a gadget chain turns bytes into code execution',
        caption: 'The attacker writes no code into your app: the bytes only name classes that are already on your classpath. An allow-list filter breaks the chain at the first unexpected class.',
        cols: 4,
        rows: 3,
        nodes: [
          { id: 'att', label: 'Attacker payload', detail: 'crafted serialized bytes', col: 0, row: 0, shape: 'note', tone: 'danger' },
          { id: 'ep', label: 'Endpoint', detail: 'cookie, RMI, queue', col: 1, row: 0, tone: 'neutral' },
          { id: 'ois', label: 'readObject()', detail: 'stream picks classes', col: 2, row: 0, tone: 'warning' },
          { id: 'filter', label: 'Allow-list filter', detail: 'com.example.dto.*;!*', col: 2, row: 1, tone: 'success' },
          { id: 'g1', label: 'Gadget: map', detail: 'hashCode() on read', col: 3, row: 0, tone: 'danger' },
          { id: 'g2', label: 'Gadget: transformer', detail: 'reflective call', col: 3, row: 1, tone: 'danger' },
          { id: 'exec', label: 'Runtime.exec', detail: 'remote code execution', col: 3, row: 2, shape: 'pill', tone: 'danger' },
          { id: 'blocked', label: 'InvalidClassException', detail: 'chain never starts', col: 1, row: 2, shape: 'pill', tone: 'success' },
        ],
        edges: [
          { from: 'att', to: 'ep' },
          { from: 'ep', to: 'ois' },
          { from: 'ois', to: 'g1', label: 'no filter', dashed: true },
          { from: 'g1', to: 'g2' },
          { from: 'g2', to: 'exec' },
          { from: 'ois', to: 'filter', label: 'with filter' },
          { from: 'filter', to: 'blocked', label: 'unknown class' },
        ],
        groups: [{ label: 'Libraries on your classpath', fromCol: 3, toCol: 3, fromRow: 0, toRow: 2, tone: 'danger' }],
      },
    ],
    variants: [
      {
        title: 'Serialization formats',
        intro: 'Pick by who reads the data (Java only, many languages, humans), how long it lives, and whether it must evolve. "Support" describes what the JDK itself provides.',
        items: [
          { name: 'Java serialization', summary: 'Built into the JDK; serializes whole object graphs with no extra code. Java-only, verbose, coupled to private fields, and dangerous with untrusted input.', support: 'supported', note: 'Keep for trusted legacy uses only, with serialVersionUID and an ObjectInputFilter.', code: 'new ObjectOutputStream(out).writeObject(order);' },
          { name: 'JSON (Jackson, Gson, JSON-B)', summary: 'Human-readable text understood by every language; the default for REST APIs and configuration. Larger and slower than binary; no schema unless you add JSON Schema or OpenAPI.', support: 'partial', note: 'Not in Java SE: use Jackson or Gson, or Jakarta JSON-B/JSON-P.', code: 'Order o = mapper.readValue(json, Order.class);' },
          { name: 'Protocol Buffers', summary: 'Binary format defined by a .proto schema with numbered fields; generated classes; very compact and fast; used by gRPC. Evolves safely if you only add fields and never reuse numbers.', support: 'partial', note: 'Third-party (Google) library and protoc code generator.', code: 'message Order { string id = 1; int64 total_cents = 2; }' },
          { name: 'Apache Avro', summary: 'Schema-based binary format where the reader resolves the writer\'s schema against its own; popular with Kafka and a schema registry.', support: 'partial', note: 'Third-party library; schemas are JSON documents.' },
          { name: 'CBOR / MessagePack / Smile', summary: 'Schemaless binary encodings of the JSON data model: smaller and faster than JSON text, still self-describing.', support: 'partial', note: 'Available as Jackson data-format modules.' },
          { name: 'XML (JAXB)', summary: 'Verbose text with mature schema tooling (XSD); still common in enterprise and government integrations.', support: 'partial', note: 'JAXB was removed from the JDK in Java 11 (JEP 320); use the Jakarta XML Binding library. Disable external entities to avoid XXE.' },
        ],
      },
      {
        title: 'Ways to control Java serialization',
        intro: 'From lightest touch to full control. Records sit outside this list: they always use their components and canonical constructor.',
        items: [
          { name: 'transient', summary: 'Exclude a field from the stream; it comes back as 0, false or null.', support: 'supported', code: 'private transient Connection conn;' },
          { name: 'writeObject / readObject', summary: 'Private hooks that add data or validate after defaultReadObject(); readObject is where invariants must be re-checked.', support: 'supported', code: 'private void readObject(ObjectInputStream in) throws IOException, ClassNotFoundException {\n    in.defaultReadObject();\n    if (lo > hi) throw new InvalidObjectException("bad range");\n}' },
          { name: 'writeReplace / readResolve', summary: 'Substitute a different object on write or read: the serialization proxy pattern, and keeping singletons and canonical instances unique.', support: 'supported', code: 'private Object readResolve() { return INSTANCE; }' },
          { name: 'serialPersistentFields', summary: 'Declare the serial form explicitly as an array of ObjectStreamField, decoupling it from the actual fields.', support: 'supported', note: 'Rarely used; mostly seen inside the JDK.' },
          { name: 'Externalizable', summary: 'writeExternal/readExternal give complete manual control of the format; requires a public no-arg constructor, which runs on read.', support: 'supported', note: 'Fast but error-prone: you own versioning and field order.', code: 'public void writeExternal(ObjectOutput out) throws IOException { out.writeUTF(id); }' },
        ],
      },
    ],
    deepDive: [
      {
        title: 'Filters: per stream, JVM-wide, and the Java 17 filter factory',
        body: 'JEP 290 (Java 9, backported to 8u121) added `ObjectInputFilter`. A filter sees each class, array length, object-graph depth, reference count and stream size, and answers ALLOWED, REJECTED or UNDECIDED. Patterns such as `maxdepth=10;com.example.dto.*;!*` can be set per stream (`setObjectInputFilter`) or for the whole JVM (`-Djdk.serialFilter`). The weakness was that a JVM-wide filter had to suit every library. JEP 415 (Java 17) added a **filter factory** (`jdk.serialFilterFactory`, `ObjectInputFilter.Config.setSerialFilterFactory`) that is called for every new `ObjectInputStream` and can combine the JVM filter with a context-specific one, plus helpers such as `allowFilter`, `rejectFilter` and `merge`.',
        sources: [
          { label: 'JEP 290: Filter Incoming Serialization Data', url: 'https://openjdk.org/jeps/290' },
          { label: 'JEP 415: Context-Specific Deserialization Filters', url: 'https://openjdk.org/jeps/415' },
          { label: 'ObjectInputFilter API (Java 21)', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/io/ObjectInputFilter.html' },
        ],
      },
      {
        title: 'Record serialization is deliberately different',
        body: 'For records, the serialization specification fixes the serial form to the record components, ignores `writeObject`, `readObject`, `readObjectNoData`, `writeExternal`/`readExternal` and `serialPersistentFields`, and reconstructs the object by passing the stream values to the canonical constructor. Components are matched by **name**, so reordering components is compatible; missing components get default values. The `serialVersionUID` of a record defaults to `0L` and the matching requirement is waived. This "constructor always runs" rule is the direction the Java team wants serialization to move in generally.',
        sources: [
          { label: 'Java Object Serialization Specification, section 1.13 Serialization of Records', url: 'https://docs.oracle.com/en/java/javase/21/docs/specs/serialization/serial-arch.html' },
          { label: 'JEP 395: Records', url: 'https://openjdk.org/jeps/395' },
        ],
      },
      {
        title: 'The serialization proxy pattern',
        body: 'Instead of making a complex class serializable directly, give it a private static nested `SerializationProxy` holding just the logical data. `writeReplace` returns the proxy; the proxy\'s `readResolve` rebuilds the real object through its **public constructor or factory**, so every invariant check runs and the real class can keep `final` fields. The real class also defines `readObject` that always throws `InvalidObjectException`, so a forged stream cannot bypass the proxy. Records give you the same guarantee with no boilerplate, which is why they are the preferred serializable shape today.',
        sources: [
          { label: 'Effective Java, 3rd edition, Item 90: Consider serialization proxies instead of serialized instances' },
          { label: 'Effective Java, 3rd edition, Item 85: Prefer alternatives to Java serialization' },
        ],
      },
      {
        title: 'Why Protocol Buffers evolve safely',
        body: 'On the wire a protobuf message is a list of (field number, wire type, value) entries; field names are not sent. A reader skips numbers it does not know (and keeps them as unknown fields when re-serializing), and missing fields read as defaults. So you can add fields freely, but must never change a field\'s type incompatibly or reuse a deleted number — mark it `reserved` instead. The same discipline (additive changes, defaults, never repurpose) applies to JSON and Avro contracts.',
        sources: [
          { label: 'Protocol Buffers Language Guide (proto 3): Updating a Message Type', url: 'https://protobuf.dev/programming-guides/proto3/' },
          { label: 'Secure Coding Guidelines for Java SE, section 8: Serialization and Deserialization', url: 'https://www.oracle.com/java/technologies/javase/seccodeguide.html' },
        ],
      },
    ],
  },
  'io-nio-sockets': {
    interviewDefinition:
      'Java has two I/O styles. Classic `java.io` **streams** move bytes one direction and block the calling thread. NIO **channels** move data in and out of **buffers** — a `ByteBuffer` with `position`, `limit` and `capacity` switched between filling and draining by `flip()`, `clear()` and `compact()` — and network channels can run **non-blocking** with a `Selector` so one thread multiplexes many connections. Sockets (`ServerSocket.accept`, `Socket` streams) carry TCP byte streams under both styles. Since Java 21, **virtual threads** let simple blocking, thread-per-connection code scale like an event loop.',
    interviewFollowUps: [
      {
        question: 'What do `flip()`, `clear()` and `compact()` do?',
        answer: '`flip()` sets limit = position and position = 0 to read what was just written. `clear()` sets position = 0 and limit = capacity, ready to refill (data is not erased). `compact()` moves unread bytes to the start and sets position after them, so you can append without losing a partial message.',
      },
      {
        question: 'When would you use a direct ByteBuffer?',
        answer: 'For long-lived buffers used in channel I/O: the OS can read or write them without copying through a heap array. They are costly to allocate, are freed only when the buffer object is garbage-collected, and are capped by `-XX:MaxDirectMemorySize`, so pool and reuse them.',
      },
      {
        question: 'Do virtual threads make NIO selectors obsolete?',
        answer: 'For application code, mostly yes: blocking socket calls on virtual threads park instead of tying up an OS thread, and the JDK uses non-blocking sockets and a poller underneath. Frameworks such as Netty still use event loops for protocol pipelines, TLS and back-pressure, and CPU-bound work gains nothing from virtual threads.',
      },
      {
        question: 'Why can one `write` on a socket arrive as two `read`s?',
        answer: 'TCP is a byte stream with no message boundaries: the kernel may split or coalesce data into segments as it likes. Protocols add framing — delimiters such as newlines or length prefixes — so the receiver knows where messages start and end.',
      },
    ],
    mnemonic: {
      device: 'Pour, Flip, Drain, Compact (and Select)',
      expansion: [
        { key: 'Pour', meaning: 'put() or channel.read(buf) pours bytes in: position moves up toward limit' },
        { key: 'Flip', meaning: 'flip(): limit = position, position = 0 — turn the glass over to drink what you poured' },
        { key: 'Drain', meaning: 'get() or channel.write(buf) drains from position up to limit; loop while hasRemaining()' },
        { key: 'Compact', meaning: 'compact() slides leftovers to the front for the next pour; clear() empties the glass' },
        { key: 'Select', meaning: 'A Selector tells one waiter which of many glasses (channels) is ready to pour or drain' },
      ],
      visual: 'Picture a bartender with one measuring jug: fill it, flip it to pour, scrape the leftover to the bottom, fill again — while a single waiter watches a whole room of tables and only walks to the ones that raise a hand.',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'Phone calls versus a restaurant pager',
        body: 'Blocking I/O with platform threads is like hiring one assistant per phone line who sits silently waiting for the caller to speak. A Selector is a restaurant pager system: one host watches all the buzzers and only acts when one lights up. Virtual threads are like assistants who cost almost nothing while they wait, so you can hire one per line again.',
      },
      {
        kind: 'insight',
        title: 'A buffer is one array with two modes',
        body: 'ByteBuffer has no separate read and write pointers. The same `position` is the write cursor while filling and the read cursor while draining, and `limit` marks the end of valid data. Almost every NIO bug is a missing or extra `flip()` — sending zero bytes, or reading the empty tail of the buffer.',
      },
      {
        kind: 'real-world',
        title: 'Where you meet NIO without writing it',
        body: 'Tomcat\'s NIO connector, Netty (used by gRPC-Java, Vert.x, Spring WebFlux and many database drivers), Kafka\'s network layer and Elasticsearch transport all run Selector-based event loops. Kafka also uses `FileChannel.transferTo` to send log segments straight from the page cache to the socket without copying through the JVM heap.',
      },
      {
        kind: 'angle',
        title: 'The C10K problem came back around',
        body: 'In 1999 the "C10K problem" asked how to serve 10,000 concurrent connections; the answer was non-blocking I/O with epoll/kqueue and event loops, which NIO brought to Java in 2002. Virtual threads keep that machinery underneath — blocking socket calls on a virtual thread are implemented with non-blocking sockets and a poller — but hand the programmer back the straight-line code that thread-per-connection always had.',
      },
    ],
    diagrams: [
      {
        id: 'io-nio-buffer-states',
        kind: 'concept',
        title: 'One ByteBuffer through put, flip, get and compact',
        caption: 'Watch position (P) and limit (L) move in an 8-byte buffer. flip() switches from filling to draining; compact() keeps unread bytes and switches back to filling.',
        cols: 4,
        rows: 2,
        nodes: [
          { id: 'new', label: 'allocate(8)', detail: 'P=0 L=8 C=8 (empty)', col: 0, row: 0, tone: 'neutral' },
          { id: 'put', label: 'put J, a, v', detail: 'P=3 L=8 (filling)', col: 1, row: 0, tone: 'primary' },
          { id: 'flip', label: 'flip()', detail: 'P=0 L=3 (ready to read)', col: 2, row: 0, tone: 'accent' },
          { id: 'get', label: 'get() returns J', detail: 'P=1 L=3 (draining)', col: 3, row: 0, tone: 'accent' },
          { id: 'compact', label: 'compact()', detail: '"av" moved to front; P=2 L=8', col: 3, row: 1, tone: 'primary' },
          { id: 'clear', label: 'clear()', detail: 'P=0 L=8 (bytes not erased)', col: 1, row: 1, tone: 'neutral' },
        ],
        edges: [
          { from: 'new', to: 'put' },
          { from: 'put', to: 'flip' },
          { from: 'flip', to: 'get' },
          { from: 'get', to: 'compact', label: 'keep leftovers' },
          { from: 'compact', to: 'clear', label: 'or discard all' },
        ],
        groups: [
          { label: 'Write mode', fromCol: 0, toCol: 1, fromRow: 0, toRow: 0, tone: 'primary' },
          { label: 'Read mode', fromCol: 2, toCol: 3, fromRow: 0, toRow: 0, tone: 'accent' },
        ],
      },
      {
        id: 'io-nio-socket-flow',
        kind: 'flow',
        title: 'A TCP echo conversation over loopback',
        caption: 'The server blocks in accept() and readLine(); the client blocks in readLine() for each reply. Closing one side makes the other side read end of stream (null or -1).',
        cols: 3,
        rows: 5,
        nodes: [
          { id: 'bind', label: 'ServerSocket(0)', detail: 'bind loopback, OS picks port', col: 0, row: 0, tone: 'primary' },
          { id: 'accept', label: 'accept()', detail: 'blocks until a client', col: 0, row: 1, tone: 'primary' },
          { id: 'sread', label: 'readLine()', detail: 'then println("echo: ...")', col: 0, row: 2, tone: 'primary' },
          { id: 'sclose', label: 'close()', detail: 'after "bye"', col: 0, row: 4, tone: 'primary' },
          { id: 'connect', label: 'new Socket(lo, port)', detail: 'TCP handshake', col: 2, row: 1, tone: 'accent' },
          { id: 'cwrite', label: 'println("hello")', detail: 'line = message frame', col: 2, row: 2, tone: 'accent' },
          { id: 'cread', label: 'readLine()', detail: '"echo: HELLO"', col: 2, row: 3, tone: 'accent' },
          { id: 'eos', label: 'readLine() == null', detail: 'end of stream', col: 2, row: 4, shape: 'pill', tone: 'success' },
          { id: 'kernel', label: 'Loopback TCP', detail: 'byte stream, no boundaries', col: 1, row: 2, shape: 'cylinder', tone: 'neutral' },
        ],
        edges: [
          { from: 'bind', to: 'accept' },
          { from: 'connect', to: 'accept', label: 'connect' },
          { from: 'accept', to: 'sread' },
          { from: 'cwrite', to: 'kernel' },
          { from: 'kernel', to: 'sread' },
          { from: 'sread', to: 'cread', label: 'echo reply', dashed: true },
          { from: 'connect', to: 'cwrite' },
          { from: 'cwrite', to: 'cread' },
          { from: 'sread', to: 'sclose', label: 'on "bye"' },
          { from: 'sclose', to: 'eos', label: 'FIN' },
        ],
        groups: [
          { label: 'Server (virtual thread)', fromCol: 0, toCol: 0, fromRow: 0, toRow: 4, tone: 'primary' },
          { label: 'Client (main thread)', fromCol: 2, toCol: 2, fromRow: 1, toRow: 4, tone: 'accent' },
        ],
      },
      {
        id: 'io-nio-selector-arch',
        kind: 'architecture',
        title: 'Selector event loop versus virtual threads',
        caption: 'Left: one event-loop thread multiplexes many non-blocking channels and keeps per-connection state in key attachments. Right: each connection has its own cheap virtual thread running blocking code; the JDK poller does the multiplexing.',
        cols: 5,
        rows: 4,
        nodes: [
          { id: 'c1', label: 'Channel A', detail: 'non-blocking', col: 0, row: 0, tone: 'neutral' },
          { id: 'c2', label: 'Channel B', detail: 'non-blocking', col: 0, row: 1, tone: 'neutral' },
          { id: 'c3', label: 'Channel C', detail: 'non-blocking', col: 0, row: 2, tone: 'neutral' },
          { id: 'sel', label: 'Selector', detail: 'epoll / kqueue', col: 1, row: 1, tone: 'accent' },
          { id: 'loop', label: 'Event-loop thread', detail: 'select, handle ready keys', col: 1, row: 3, tone: 'primary' },
          { id: 'v1', label: 'Virtual thread A', detail: 'blocking readLine()', col: 3, row: 0, tone: 'success' },
          { id: 'v2', label: 'Virtual thread B', detail: 'parked while idle', col: 4, row: 0, tone: 'success' },
          { id: 'poller', label: 'JDK poller', detail: 'non-blocking sockets', col: 3, row: 1, span: 2, tone: 'accent' },
          { id: 'carrier', label: 'Carrier threads', detail: 'few OS threads (ForkJoinPool)', col: 3, row: 3, span: 2, tone: 'primary' },
        ],
        edges: [
          { from: 'c1', to: 'sel', label: 'OP_READ' },
          { from: 'c2', to: 'sel', label: 'OP_READ' },
          { from: 'c3', to: 'sel', label: 'OP_ACCEPT' },
          { from: 'sel', to: 'loop', label: 'ready keys' },
          { from: 'v1', to: 'poller', label: 'park' },
          { from: 'v2', to: 'poller', label: 'park' },
          { from: 'poller', to: 'carrier', label: 'unpark when ready' },
        ],
        groups: [
          { label: 'Hand-written NIO (Netty-style)', fromCol: 0, toCol: 1, fromRow: 0, toRow: 3, tone: 'neutral' },
          { label: 'Virtual threads (Java 21)', fromCol: 3, toCol: 4, fromRow: 0, toRow: 3, tone: 'success' },
        ],
      },
    ],
    variants: [
      {
        title: 'I/O models',
        intro: 'How a thread waits for data. All of them are available in Java; the trade-off is code simplicity versus threads and memory per connection.',
        items: [
          { name: 'Blocking (thread per connection)', summary: 'read() waits until data arrives. Simplest code; with platform threads, memory and scheduling cost limit it to a few thousand connections.', support: 'supported', code: 'String line = reader.readLine();   // waits' },
          { name: 'Non-blocking', summary: 'configureBlocking(false): read() returns 0 immediately when nothing is ready. Alone, it leads to busy polling.', support: 'supported', code: 'channel.configureBlocking(false);\nint n = channel.read(buf);   // may be 0' },
          { name: 'Multiplexed (Selector)', summary: 'One thread waits on many non-blocking channels and handles only the ready ones: the event-loop model of Netty, Tomcat NIO and Node.js.', support: 'supported', code: 'selector.select();\nfor (SelectionKey k : selector.selectedKeys()) { ... }' },
          { name: 'Asynchronous (NIO.2)', summary: 'AsynchronousSocketChannel / AsynchronousFileChannel start an operation and complete a Future or call a CompletionHandler.', support: 'supported', note: 'Since Java 7; less common than Netty or virtual threads in practice.', code: 'channel.read(buf, attachment, handler);' },
          { name: 'Blocking on virtual threads', summary: 'Blocking code, but a waiting virtual thread unmounts from its carrier; the JDK multiplexes underneath. Scales to very many connections.', support: 'supported', note: 'Final in Java 21 (JEP 444). File I/O still occupies a carrier briefly; the scheduler compensates.', code: 'try (var ex = Executors.newVirtualThreadPerTaskExecutor()) { ex.submit(() -> handle(socket)); }' },
          { name: 'io_uring-style completion I/O', summary: 'Linux\'s newer kernel interface where the OS completes operations from a submission queue.', support: 'not-supported', note: 'Not used by the JDK\'s socket implementation; available through third-party libraries such as Netty\'s io_uring transport.' },
        ],
      },
      {
        title: 'Buffer operations',
        intro: 'All of these only move indexes (except compact, which also copies bytes). Invariant: 0 <= mark <= position <= limit <= capacity.',
        items: [
          { name: 'put / get', summary: 'Relative versions write or read at position and advance it; absolute versions (put(index, b), get(index)) leave position alone.', support: 'supported' },
          { name: 'flip()', summary: 'limit = position, position = 0: switch from filling to draining.', support: 'supported', code: 'buf.flip();' },
          { name: 'clear()', summary: 'position = 0, limit = capacity: ready to fill again; old bytes stay but are treated as garbage.', support: 'supported' },
          { name: 'compact()', summary: 'Copies the bytes between position and limit to the start, then position = that count, limit = capacity. Use it to keep a partial message.', support: 'supported' },
          { name: 'rewind()', summary: 'position = 0, limit unchanged: read the same data again.', support: 'supported' },
          { name: 'mark() / reset()', summary: 'Remember a position and jump back to it, for example to retry parsing a header.', support: 'supported' },
          { name: 'slice() / duplicate()', summary: 'New buffer views sharing the same bytes with independent indexes; slice covers only the remaining region.', support: 'supported', note: 'Changes to bytes are visible through every view.' },
        ],
      },
    ],
    deepDive: [
      {
        title: 'How virtual threads make blocking sockets cheap',
        body: 'JEP 353 (Java 13) reimplemented `Socket`/`ServerSocket` on top of NIO, and JEP 373 (Java 15) did the same for `DatagramSocket`. On a virtual thread, a socket operation that would block puts the socket in non-blocking mode, registers it with a JDK-internal poller, and **unmounts** the virtual thread, freeing the carrier OS thread; when the poller sees readiness it schedules the virtual thread again. File I/O is different: most file systems have no readiness model, so the carrier blocks and the scheduler temporarily adds a carrier to compensate. Since Java 24 (JEP 491), blocking inside `synchronized` no longer pins the carrier.',
        sources: [
          { label: 'JEP 444: Virtual Threads', url: 'https://openjdk.org/jeps/444' },
          { label: 'JEP 353: Reimplement the Legacy Socket API', url: 'https://openjdk.org/jeps/353' },
          { label: 'JEP 491: Synchronize Virtual Threads without Pinning', url: 'https://openjdk.org/jeps/491' },
        ],
      },
      {
        title: 'Heap buffers are copied; direct buffers are not (but cost more)',
        body: 'The OS can only do I/O to memory that will not move, and the GC moves heap arrays. So when you write a heap `ByteBuffer` to a channel, the JDK first copies it into a temporary direct buffer (cached per thread). Direct buffers avoid that copy but are allocated outside the heap, are released only when their `ByteBuffer` object is collected (via a Cleaner), and count against `-XX:MaxDirectMemorySize`; leaking them shows up as `OutOfMemoryError: Direct buffer memory` while the heap looks healthy. Hence the advice: allocate direct buffers once and reuse them, as Netty\'s pooled allocator does.',
        sources: [
          { label: 'ByteBuffer API: Direct vs. non-direct buffers (Java 21)', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/nio/ByteBuffer.html' },
        ],
      },
      {
        title: 'Selectors are level-triggered and leave cleanup to you',
        body: 'On Linux the default `Selector` uses epoll, on macOS kqueue. Java selectors behave level-triggered: a channel with unread data stays ready on every `select()`. The selected-key set is only ever added to by the selector — your loop must remove handled keys — and interest in `OP_WRITE` should be registered only while you have pending output, otherwise the loop spins because a socket is almost always writable. A blocked `select()` can be woken from another thread with `wakeup()`.',
        sources: [
          { label: 'Selector API (Java 21)', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/nio/channels/Selector.html' },
          { label: 'The C10K problem, Dan Kegel (1999)' },
        ],
      },
      {
        title: 'Memory-mapped files and zero-copy transfer',
        body: '`FileChannel.map` maps a file region into virtual memory; reads become page faults served from the OS page cache, which is very fast for large random-access files (databases, indexes). A `MappedByteBuffer` is int-indexed (at most 2 GB per mapping) and is unmapped only when garbage-collected. Java 22\'s Foreign Function & Memory API (JEP 454) adds `FileChannel.map(mode, offset, size, arena)` returning a `MemorySegment` with 64-bit offsets that is unmapped deterministically when the `Arena` closes. `transferTo` uses `sendfile` on Linux to stream a file to a socket without copying through user space.',
        sources: [
          { label: 'JEP 454: Foreign Function & Memory API', url: 'https://openjdk.org/jeps/454' },
          { label: 'FileChannel API (Java 21)', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/nio/channels/FileChannel.html' },
        ],
      },
    ],
  },
};
