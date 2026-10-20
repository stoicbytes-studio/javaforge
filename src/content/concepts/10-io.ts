import type { LessonConcepts } from '@/types/curriculum';

/** Concept pages for module 10 (Files, NIO and Networking), keyed by lesson id. */
export const ioConcepts: Record<string, LessonConcepts> = {
  'io-files': {
    quick: {
      definition: 'File I/O means reading data from files and writing data to files. In modern Java you describe a file location with a `Path` and work on it with the `Files` class.',
      points: [
        'A `Path` is just the address of a file or folder. Making one does not touch the disk.',
        'Use `Files.readString(path)` to read a whole text file, and `Files.writeString(path, text)` to write one.',
        'Use `Files.readAllLines(path)` to get the lines of a file as a `List`.',
        'File methods can throw `IOException`, so catch it or declare it.',
        'Close streams and readers with try-with-resources so the file is always released.',
      ],
      example: {
        title: 'Working with a Path',
        code: 'import java.nio.file.Path;\n\npublic class Main {\n  public static void main(String[] args) {\n    Path file = Path.of("data", "notes.txt");\n    System.out.println(file.getFileName());\n    System.out.println(file.getParent());\n    System.out.println(file.getNameCount());\n    System.out.println(file.toString().endsWith(".txt"));\n  }\n}',
        output: 'notes.txt\ndata\n2\ntrue',
        runnable: true,
        explain: '`Path.of("data", "notes.txt")` joins the parts into one path. The program then asks for the file name, the parent folder and the number of name parts. No file is opened, so this works even if `data` does not exist.',
      },
      tip: 'Prefer `Path` and `Files` over the older `java.io.File` class in new code.',
    },
    textbook: {
      definition:
        'File I/O in Java is the transfer of data between a program and a **file system**, using the APIs of `java.io` and `java.nio.file`. A **`Path`** is an immutable (unchangeable), system-dependent object that locates a file without accessing it. The utility class **`Files`** performs operations on that file, and reports failure by throwing an `IOException`. Data is read and written as **byte streams**. **Character streams** decode and encode those bytes using a **charset**. Every open stream or channel holds an operating-system resource. It must be closed after use, usually with a try-with-resources statement.',
      terms: [
        { term: 'Path', meaning: 'An immutable object, tied to one file system. It holds a sequence of names, from parent to child, that locates a file. Creating it does no I/O.' },
        { term: 'Files', meaning: 'A final class of static methods in `java.nio.file` that read, write, copy, move, delete and inspect files located by a `Path`.' },
        { term: 'Byte stream', meaning: 'An ordered sequence of 8-bit bytes. You read it through an `InputStream` or write it through an `OutputStream`. Nothing tries to interpret what the bytes mean.' },
        { term: 'Character stream', meaning: 'A `Reader` or `Writer` that reads or writes 16-bit `char` values. It uses a charset to convert them to and from bytes.' },
        { term: 'Charset', meaning: 'A named mapping between sequences of bytes and sequences of Unicode characters, such as UTF-8 or ISO-8859-1.' },
      ],
      source: 'Javadoc for java.nio.file.Path, java.nio.file.Files and java.io; JLS §14.20.3',
    },
    interviewDefinition:
      'Modern Java file I/O is built on `java.nio.file`. A `Path` is an immutable locator that opens nothing. `Files` performs the operations. On failure, it throws specific `IOException` subclasses instead of returning booleans. Underneath, all I/O moves **bytes**. **Character** streams decode them with a **charset**, and buffering groups many small reads or writes into fewer system calls. Correct file code closes every handle with try-with-resources. It names the charset explicitly. It also streams large files line by line instead of loading them whole.',
    interviewFollowUps: [
      {
        question: 'What is the difference between an InputStream and a Reader?',
        answer: '`InputStream` reads raw bytes. `Reader` reads `char`s, so something must decode the bytes using a charset. `InputStreamReader` is the bridge between the two. `Files.newBufferedReader(path, UTF_8)` builds the whole stack in one call.',
      },
      {
        question: 'When would you use `Files.lines` instead of `Files.readAllLines`?',
        answer: '`readAllLines` loads every line into a `List`, which is fine for small files. `Files.lines` is a lazy `Stream<String>` (it reads lines only as needed) with constant memory. But it holds an open file handle, so it must be closed with try-with-resources.',
      },
      {
        question: 'Is `java.io.File` deprecated?',
        answer: 'No, but it is legacy (the old API). Methods like `delete()` and `mkdir()` return `false` without saying why. It also has weak support for links and attributes. New code uses `Path` and `Files`. `file.toPath()` and `path.toFile()` convert between the old and new APIs.',
      },
      {
        question: 'What did JEP 400 change?',
        answer: 'Since Java 18, the default charset is UTF-8 on every platform. Before that, it came from the OS locale (its language and region settings). So `new FileReader(f)` or `getBytes()` with no charset could behave differently on Windows and Linux.',
      },
    ],
    mnemonic: {
      device: 'The letter rule: Address, Open, Translate, Close',
      expansion: [
        { key: 'Address', meaning: 'A Path is only the address on the envelope; building it touches nothing on disk' },
        { key: 'Open', meaning: 'Files opens or reads, and failures arrive as precise exceptions such as NoSuchFileException' },
        { key: 'Translate', meaning: 'A charset turns bytes into characters (and back); always say which one' },
        { key: 'Close', meaning: 'try-with-resources returns the OS handle, even when an exception is thrown' },
      ],
      visual: 'Picture opening a letter from abroad: read the address, open the envelope, translate the language, then put it back in the drawer and shut it.',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'Path is an address, Files is the postal service',
        body: 'Writing an address on an envelope does not check whether the house exists. In the same way `Path.of("data/in.csv")` succeeds for files that do not exist. Only when the postal service (`Files`) tries to deliver do you find out — and it tells you why: no such file, access denied, already exists.',
      },
      {
        kind: 'insight',
        title: 'Text is an illusion over bytes',
        body: 'Inside the JVM a `String` is a sequence of UTF-16 code units; on disk and on the network there are only bytes. Every time text crosses that boundary a charset is used, whether you name it or not. The classic "works on my machine" bug is two machines silently choosing different charsets.',
      },
      {
        kind: 'real-world',
        title: '"Too many open files" at 3 a.m.',
        body: 'A scheduled job called `Files.list(dir).count()` every minute without closing the stream. Each call leaked one directory handle; after a few days the process hit the OS limit (often 1,024 by default) and every new file, socket and database connection failed. Wrapping the stream in try-with-resources fixed it.',
      },
      {
        kind: 'angle',
        title: 'A Path does not have to be on disk',
        body: 'A `Path` belongs to a `FileSystem`, and providers are pluggable. `FileSystems.newFileSystem(zipPath)` lets you read and write entries inside a ZIP or JAR with the ordinary `Files` methods, and in-memory file systems (such as Google\'s Jimfs library) make file code testable without touching the real disk.',
      },
    ],
    diagrams: [
      {
        id: 'io1-stream-stack',
        kind: 'concept',
        title: 'The decorator stack behind reading a text file',
        caption: 'Each layer wraps the one below and adds one job. First come bytes from disk, then decoding with a charset, then buffering so readLine() is cheap. Files.newBufferedReader builds the same stack in one call.',
        explanation: [
          'Start at **File on disk**: it holds only bytes, with no idea of letters or lines. Reading text means turning those bytes into characters.',
          'An **InputStream** delivers those raw bytes one chunk at a time, as the arrow label bytes shows. In practice, it comes from `Files.newInputStream`.',
          'The **InputStreamReader** wraps the stream and decodes bytes into chars using a charset such as UTF-8. The shaded group marks this step, where bytes become characters. So a wrong charset here garbles the text.',
          '**BufferedReader** wraps the reader and fills an 8 KB buffer with a few large reads. So each `readLine()` is cheap, and it hands **Your code** one String per line.',
          'Each layer is a decorator: it wraps the one below and adds exactly one job. **Files.newBufferedReader(path, UTF_8)** builds this whole stack in one call. Modern code should use it.',
        ],
        cols: 5,
        rows: 2,
        nodes: [
          { id: 'disk', label: 'File on disk', detail: 'just bytes', col: 0, row: 0, shape: 'cylinder', tone: 'neutral' },
          { id: 'fis', label: 'InputStream', detail: 'byte stream', col: 1, row: 0, tone: 'primary' },
          { id: 'isr', label: 'InputStreamReader', detail: 'decodes with a charset', col: 2, row: 0, tone: 'accent' },
          { id: 'br', label: 'BufferedReader', detail: '8 KB buffer, readLine()', col: 3, row: 0, tone: 'primary' },
          { id: 'code', label: 'Your code', detail: 'String per line', col: 4, row: 0, shape: 'pill', tone: 'success' },
          { id: 'one', label: 'Files.newBufferedReader(path, UTF_8)', detail: 'builds the whole stack in one call', col: 1, row: 1, span: 3, shape: 'note', tone: 'neutral' },
        ],
        edges: [
          { from: 'disk', to: 'fis', label: 'bytes' },
          { from: 'fis', to: 'isr', label: 'bytes' },
          { from: 'isr', to: 'br', label: 'chars' },
          { from: 'br', to: 'code', label: 'lines' },
        ],
        groups: [{ label: 'Bytes become characters here', fromCol: 2, toCol: 2, fromRow: 0, toRow: 0, tone: 'accent' }],
      },
      {
        id: 'io1-choose-read',
        kind: 'flow',
        title: 'Choosing how to read a file',
        caption: 'Two questions decide: "is it text?" and "could it be large?". Every method on the right-hand path keeps a file handle open, so it needs try-with-resources.',
        explanation: [
          'Start at **Read a file** and ask whether the content is text at all. If not, follow the "not text" arrow to **Binary data** and use `readAllBytes` or `newInputStream`.',
          'If it is text that fits in memory, go to **Small text**: `Files.readString` or `readAllLines` loads everything in one call and closes the file for you.',
          'For megabytes to gigabytes, go to **Large text**. Memory use must stay flat, however big the file grows. So you process one line at a time.',
          'Then ask **Pipeline or loop?** A filter-and-map job suits **Files.lines**, a lazy `Stream<String>`. A loop that keeps state across lines suits **newBufferedReader** with a `readLine()` loop.',
          'The "Must be closed" group marks these right-hand choices. Each keeps a file handle open until it is closed, so always wrap it in try-with-resources.',
        ],
        cols: 3,
        rows: 4,
        nodes: [
          { id: 'start', label: 'Read a file', col: 1, row: 0, shape: 'pill', tone: 'primary' },
          { id: 'bin', label: 'Binary data', detail: 'readAllBytes or newInputStream', col: 0, row: 1, tone: 'neutral' },
          { id: 'small', label: 'Small text', detail: 'readString / readAllLines', col: 1, row: 1, tone: 'success' },
          { id: 'large', label: 'Large text', detail: 'memory must stay flat', col: 2, row: 1, tone: 'warning' },
          { id: 'lines', label: 'Files.lines', detail: 'lazy Stream<String>', col: 1, row: 3, tone: 'accent' },
          { id: 'reader', label: 'newBufferedReader', detail: 'readLine() loop', col: 2, row: 3, tone: 'accent' },
          { id: 'q', label: 'Pipeline or loop?', detail: 'filter/map vs stateful', col: 2, row: 2, tone: 'neutral' },
        ],
        edges: [
          { from: 'start', to: 'bin', label: 'not text' },
          { from: 'start', to: 'small', label: 'fits in memory' },
          { from: 'start', to: 'large', label: 'MBs to GBs' },
          { from: 'large', to: 'q' },
          { from: 'q', to: 'lines', label: 'stream pipeline' },
          { from: 'q', to: 'reader', label: 'loop with state' },
        ],
        groups: [{ label: 'Must be closed', fromCol: 1, toCol: 2, fromRow: 3, toRow: 3, tone: 'danger' }],
      },
      {
        id: 'io1-nio-arch',
        kind: 'architecture',
        title: 'How java.nio.file is layered',
        caption: 'Your code only talks to Path and Files. The FileSystemProvider behind them decides whether the bytes live on the OS disk, inside a ZIP file or in memory.',
        explanation: [
          '**Your code** calls only static methods on **Files**, such as `readString` or `copy`, and never talks to the operating system directly.',
          'Every **Files** operation works on a **Path**, an immutable locator. Creating a Path opens nothing; it only describes where a file is.',
          'Each **Path** belongs to a **FileSystem**. The FileSystem knows the name separator and the root directories, and it creates paths for that system.',
          'A FileSystemProvider supplies each FileSystem. The **Default provider** maps to the OS file system. The dashed arrows show alternatives. A **ZIP provider** treats entries in a .zip or .jar as files. A **Custom provider** can be, for example, an in-memory one for tests.',
          'Takeaway: the same Path and Files code works unchanged whether the bytes live on disk, inside an archive or in memory.',
        ],
        cols: 3,
        rows: 3,
        nodes: [
          { id: 'app', label: 'Your code', col: 0, row: 0, span: 3, tone: 'primary' },
          { id: 'files', label: 'Files', detail: 'static operations', col: 0, row: 1, tone: 'accent' },
          { id: 'path', label: 'Path', detail: 'immutable locator', col: 1, row: 1, tone: 'accent' },
          { id: 'fs', label: 'FileSystem', detail: 'separator, roots', col: 2, row: 1, tone: 'accent' },
          { id: 'os', label: 'Default provider', detail: 'OS file system', col: 0, row: 2, shape: 'cylinder', tone: 'neutral' },
          { id: 'zip', label: 'ZIP provider', detail: 'entries in a .zip/.jar', col: 1, row: 2, shape: 'cylinder', tone: 'neutral' },
          { id: 'mem', label: 'Custom provider', detail: 'e.g. in-memory for tests', col: 2, row: 2, shape: 'cylinder', tone: 'neutral' },
        ],
        edges: [
          { from: 'app', to: 'files', label: 'calls' },
          { from: 'files', to: 'path', label: 'operates on' },
          { from: 'path', to: 'fs', label: 'belongs to' },
          { from: 'fs', to: 'os', label: 'provided by' },
          { from: 'fs', to: 'zip', dashed: true },
          { from: 'fs', to: 'mem', dashed: true },
        ],
        groups: [{ label: 'FileSystemProviders', fromCol: 0, toCol: 2, fromRow: 2, toRow: 2, tone: 'neutral' }],
      },
    ],
    variants: [
      {
        title: 'Stream families in java.io',
        intro: 'Every java.io class belongs to one of two families, and the rest are decorators that add one capability by wrapping another stream.',
        items: [
          { name: 'Byte streams', summary: '`InputStream` / `OutputStream`: raw bytes for images, archives, network protocols and anything that is not text.', support: 'supported', code: 'try (InputStream in = Files.newInputStream(path)) { byte[] all = in.readAllBytes(); }' },
          { name: 'Character streams', summary: '`Reader` / `Writer`: chars decoded from bytes with a charset. `InputStreamReader` and `OutputStreamWriter` bridge from byte streams.', support: 'supported', code: 'new InputStreamReader(in, StandardCharsets.UTF_8)' },
          { name: 'Buffered streams', summary: '`BufferedInputStream`, `BufferedReader`, `BufferedWriter`: batch many small reads or writes into few system calls; `BufferedReader` adds `readLine()`.', support: 'supported', note: 'Forgetting to flush or close a BufferedWriter loses the last buffer of output.' },
          { name: 'Data streams', summary: '`DataInputStream` / `DataOutputStream`: read and write Java primitives (`writeInt`, `writeUTF`) in a fixed big-endian binary format.', support: 'supported' },
          { name: 'Object streams', summary: '`ObjectInputStream` / `ObjectOutputStream`: Java serialization of whole object graphs.', support: 'partial', note: 'Still supported but discouraged: deserializing untrusted data can execute attacker-chosen code paths. Use JSON or another explicit format, or at least a serialization filter (JEP 290).' },
        ],
      },
      {
        title: 'java.io vs java.nio APIs',
        items: [
          { name: 'java.io.File (Java 1.0)', summary: 'Legacy path-and-operations class. Methods return `false` on failure without a reason; weak support for symbolic links and attributes.', support: 'partial', note: 'Not deprecated; convert with toPath() at the boundary.' },
          { name: 'Path + Files (NIO.2, Java 7)', summary: 'The modern API: descriptive exceptions, attributes, symbolic links, directory streams, walking, watching and pluggable file systems.', support: 'supported', code: 'Path p = Path.of("data", "in.csv"); String text = Files.readString(p);' },
          { name: 'Channels and buffers (NIO, Java 1.4)', summary: '`FileChannel` and `ByteBuffer`: random access, memory-mapped files, file locks and zero-copy `transferTo`. Lower level, used by high-performance code.', support: 'supported' },
        ],
      },
      {
        title: 'Ways to read a text file',
        items: [
          { name: 'Files.readString (Java 11)', summary: 'The whole file as one String. Simplest for small files.', support: 'supported', code: 'String json = Files.readString(path);' },
          { name: 'Files.readAllLines (Java 7)', summary: 'A List of every line. Simple, but memory grows with the file.', support: 'supported', code: 'List<String> lines = Files.readAllLines(path, UTF_8);' },
          { name: 'Files.lines (Java 8)', summary: 'A lazy Stream<String>; constant memory, but must be closed.', support: 'supported', code: 'try (Stream<String> s = Files.lines(path, UTF_8)) { long n = s.filter(l -> l.contains("ERROR")).count(); }' },
          { name: 'Files.newBufferedReader (Java 7)', summary: 'A classic readLine() loop; best when per-line logic carries state (headers, multi-line records).', support: 'supported', code: 'try (BufferedReader r = Files.newBufferedReader(path, UTF_8)) { String line; while ((line = r.readLine()) != null) { /* ... */ } }' },
          { name: 'Scanner', summary: 'Tokenises input with regular expressions. Convenient for exercises, slow for big files.', support: 'supported' },
        ],
      },
    ],
    deepDive: [
      {
        title: 'Files.lines is lazy, closeable and parallel-friendly',
        body: 'The stream returned by `Files.lines` reads the file on demand, and its `close()` (registered via `onClose`) releases the file handle — a terminal operation does **not** close it. The JDK implementation notes that it supports good parallel performance for UTF-8, US-ASCII and ISO-8859-1: because line breaks can be found in those encodings without decoding, the file can be split into ranges and processed by several threads.',
        sources: [{ label: 'Files.lines — Java SE 21 API', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/nio/file/Files.html' }],
      },
      {
        title: 'Atomic is not the same as durable',
        body: 'Writing to a temp file and calling `Files.move(tmp, target, ATOMIC_MOVE)` guarantees readers see either the old or the new file, never half of one (on POSIX it is a `rename`). It does not guarantee the bytes survived a power failure: they may still be in the OS page cache. Code that must be crash-safe (databases, write-ahead logs) also calls `FileChannel.force(true)` before the rename.',
        sources: [{ label: 'FileChannel.force — Java SE 21 API', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/nio/channels/FileChannel.html' }],
      },
      {
        title: 'UTF-8 by default, and how to find the old default',
        body: 'JEP 400 (Java 18) made UTF-8 the default charset everywhere, so `new FileReader(file)` now behaves the same on every OS. The previous, locale-derived value is still available as the `native.encoding` system property (added in Java 17), and `-Dfile.encoding=COMPAT` restores the old behaviour for legacy applications during migration. Passing a charset explicitly sidesteps the question entirely.',
        sources: [{ label: 'JEP 400: UTF-8 by Default', url: 'https://openjdk.org/jeps/400' }],
      },
      {
        title: 'Why ObjectInputStream is a security topic',
        body: 'Deserialization calls `readObject` methods on whatever classes the byte stream names, before your code sees the result. Chains of harmless-looking library classes ("gadgets") have led to remote code execution in many products. Java 9 added serialization filters (JEP 290) and Java 17 added context-specific filter factories (JEP 415); the safest choice is not to deserialize untrusted Java serialization data at all.',
        sources: [
          { label: 'JEP 290: Filter Incoming Serialization Data', url: 'https://openjdk.org/jeps/290' },
          { label: 'JEP 415: Context-Specific Deserialization Filters', url: 'https://openjdk.org/jeps/415' },
          { label: 'Effective Java, 3rd edition — Item 85: Prefer alternatives to Java serialization' },
        ],
      },
    ],
  },
  'io-http': {
    quick: {
      definition: 'The Java HTTP Client lets your program call web servers. You build an `HttpRequest`, send it with an `HttpClient`, and read the `HttpResponse` that comes back.',
      points: [
        'Create one `HttpClient` and reuse it for many requests.',
        'Build a request with `HttpRequest.newBuilder(URI.create(url))`. Call `.GET()` or `.POST(...)`, then `.build()`.',
        'Use `client.send(request, handler)` to wait for the answer. Use `sendAsync` to carry on while you wait.',
        'The handler, such as `BodyHandlers.ofString()`, says how to read the body.',
        'Use `response.statusCode()` for the status, for example 200 for OK.',
      ],
      example: {
        title: 'Send a GET request',
        code: 'import java.net.URI;\nimport java.net.http.HttpClient;\nimport java.net.http.HttpRequest;\nimport java.net.http.HttpResponse;\n\npublic class Main {\n  public static void main(String[] args) throws Exception {\n    HttpClient client = HttpClient.newHttpClient();\n    HttpRequest request = HttpRequest\n        .newBuilder(URI.create("https://example.com/api/hello"))\n        .GET()\n        .build();\n    HttpResponse<String> response =\n        client.send(request, HttpResponse.BodyHandlers.ofString());\n    System.out.println(response.statusCode());\n    System.out.println(response.body());\n  }\n}',
        runnable: false,
        explain: 'This sketch needs a real web server, so it cannot run on its own. The client sends a GET request to the address and waits. It then prints the status code and the text the server returned.',
      },
      tip: 'A 404 or 500 status is not an exception. Always check `statusCode()` yourself.',
    },
    textbook: {
      definition:
        'The Java HTTP Client is the standard API in the **`java.net.http`** module. It sends requests and receives responses over **HTTP/1.1** and **HTTP/2**. An **`HttpClient`** is an immutable, thread-safe object that holds configuration and connection state. Many threads may share it. An **`HttpRequest`** is an immutable description of a method, URI, headers and body. Each exchange runs synchronously (the caller waits) with `send`, or asynchronously with `sendAsync`, which returns a `CompletableFuture`. A **`BodyHandler`** decides how the response body is converted. HTTP error **status codes** come back as ordinary responses. Only transport failures throw an `IOException`.',
      terms: [
        { term: 'HttpClient', meaning: 'An immutable, reusable object that holds client configuration (version, redirect policy, timeouts, executor) and pooled connections. You use it to send any number of requests.' },
        { term: 'HttpRequest', meaning: 'An immutable value describing one request: the URI, the method, the headers, an optional timeout and a `BodyPublisher` that supplies the request body.' },
        { term: 'BodyHandler', meaning: 'A function that is called when the response status and headers arrive. It chooses how the body is consumed, for example as a `String`, a file or a stream.' },
        { term: 'Status code', meaning: 'A three-digit number in an HTTP response. Its first digit gives its class: informational, success, redirection, client error or server error.' },
      ],
      source: 'JEP 321; Javadoc for java.net.http; RFC 9110 (HTTP Semantics)',
    },
    interviewDefinition:
      '`java.net.http.HttpClient` (standard since Java 11, JEP 321) is the JDK\'s immutable, thread-safe HTTP/1.1 and HTTP/2 client. You build an immutable `HttpRequest`. You choose a `BodyHandler`, which decides how the response body is consumed. Then you call `send` (blocking) or `sendAsync` (a `CompletableFuture`). Status codes such as 404 or 503 are **normal responses**, not exceptions. Only transport failures throw. Production calls need a connect timeout and a request timeout. They also need explicit status mapping, and retries limited to idempotent requests (ones where repeating has the same effect as sending once).',
    interviewFollowUps: [
      {
        question: 'Which HTTP methods are safe to retry automatically?',
        answer: 'Idempotent ones: GET, HEAD, OPTIONS, PUT and DELETE. Repeating them has the same effect as sending them once. POST and PATCH are not idempotent unless the API supports an idempotency key. So a retry after a timeout may perform the action twice.',
      },
      {
        question: 'send or sendAsync?',
        answer: '`send` blocks the calling thread and is the simplest code. On virtual threads (final in Java 21), blocking is cheap, so it scales well. `sendAsync` returns a `CompletableFuture`. Use it to combine several concurrent calls, or to work with async code.',
      },
      {
        question: 'Why should one HttpClient be shared?',
        answer: 'The client owns a connection pool, TLS sessions and, for HTTP/2, multiplexed connections (many requests sharing one connection). Creating one per request throws all of that away. It also repeats the TCP and TLS handshakes every time.',
      },
    ],
    mnemonic: {
      device: '"2 you got it, 3 go elsewhere, 4 you blew it, 5 we blew it"',
      expansion: [
        { key: '2xx', meaning: 'Success: the request worked (200 OK, 201 Created, 204 No Content)' },
        { key: '3xx', meaning: 'Redirection: the resource is elsewhere (301, 302, 304 Not Modified)' },
        { key: '4xx', meaning: 'Client error: fix the request, do not blindly retry (400, 401, 403, 404, 409); 429 means slow down' },
        { key: '5xx', meaning: 'Server error: maybe retry with backoff, if the request is idempotent (500, 502, 503, 504)' },
      ],
      visual: 'Picture a waiter: "here you go" (2), "it is at the other table" (3), "you ordered something not on the menu" (4), "the kitchen is on fire" (5).',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'An order ticket and a waiter',
        body: 'An `HttpRequest` is a printed order ticket: once printed it cannot change, so it can be handed to any waiter, any number of times. The `HttpClient` is the waiter who keeps a few tables (connections) open. "We are out of that dish" (404) is a normal answer from the kitchen; the waiter tripping on the stairs (`IOException`) is a different kind of failure.',
      },
      {
        kind: 'insight',
        title: 'No timeout means "wait forever"',
        body: 'Neither `connectTimeout` nor the per-request `timeout` has a default. A downstream service that accepts the connection but never answers will hold your thread indefinitely, and under load every request thread ends up stuck the same way. Always set both.',
      },
      {
        kind: 'real-world',
        title: 'The retry that charged twice',
        body: 'A checkout service retried a payment POST after a 5-second timeout. The provider had actually processed the first request; it was the response that was slow. Customers were charged twice. Payment APIs therefore accept an idempotency key header: the client sends the same key on every retry, and the server returns the first result instead of charging again.',
      },
      {
        kind: 'angle',
        title: 'HTTP/2 changes the cost model',
        body: 'With HTTP/1.1 each in-flight request needs its own connection. With HTTP/2 one connection carries many concurrent streams, so `HttpClient` can fire dozens of `sendAsync` calls to the same host over a single TCP+TLS connection. The client negotiates HTTP/2 by default and falls back to HTTP/1.1 if the server does not support it.',
      },
    ],
    diagrams: [
      {
        id: 'io2-status-classes',
        kind: 'concept',
        title: 'Status code classes and what to do about them',
        caption: 'Only the first digit decides the category. In HttpClient, none of these are exceptions. Your code must check statusCode() and decide.',
        explanation: [
          'Read each row from left to right: the status class on the left, and the action your code should take on the right. Only the first digit decides the class.',
          '**1xx Informational** codes such as 100 Continue are interim (in-between) messages. They are **Handled for you** by the client and never reach your code as the final response.',
          '**2xx Success** means the request worked, so **Parse the body**. **3xx Redirection** points somewhere else. You decide **Follow or not** with the client redirect policy, which defaults to NEVER.',
          '**4xx Client error** means the request itself was wrong, so **Map to domain** errors such as "not found". Retrying will not help, except 429 Too Many Requests after a delay.',
          '**5xx Server error** means the server failed, so use **Backoff + retry**, but only for idempotent requests. None of these classes throw, so always check `statusCode()`.',
        ],
        cols: 5,
        rows: 2,
        nodes: [
          { id: 's1', label: '1xx Informational', detail: '100 Continue', col: 0, row: 0, tone: 'neutral' },
          { id: 's2', label: '2xx Success', detail: '200, 201, 204', col: 1, row: 0, tone: 'success' },
          { id: 's3', label: '3xx Redirection', detail: '301, 302, 304', col: 2, row: 0, tone: 'accent' },
          { id: 's4', label: '4xx Client error', detail: '400, 401, 403, 404, 429', col: 3, row: 0, tone: 'warning' },
          { id: 's5', label: '5xx Server error', detail: '500, 502, 503, 504', col: 4, row: 0, tone: 'danger' },
          { id: 'a1', label: 'Handled for you', detail: 'by the client', col: 0, row: 1, shape: 'pill', tone: 'neutral' },
          { id: 'a2', label: 'Parse the body', col: 1, row: 1, shape: 'pill', tone: 'success' },
          { id: 'a3', label: 'Follow or not', detail: 'followRedirects: NEVER', col: 2, row: 1, shape: 'pill', tone: 'accent' },
          { id: 'a4', label: 'Map to domain', detail: 'retry only 429', col: 3, row: 1, shape: 'pill', tone: 'warning' },
          { id: 'a5', label: 'Backoff + retry', detail: 'if idempotent', col: 4, row: 1, shape: 'pill', tone: 'danger' },
        ],
        edges: [
          { from: 's1', to: 'a1' },
          { from: 's2', to: 'a2' },
          { from: 's3', to: 'a3' },
          { from: 's4', to: 'a4' },
          { from: 's5', to: 'a5' },
        ],
      },
      {
        id: 'io2-call-flow',
        kind: 'flow',
        title: 'One robust outbound call',
        caption: 'There are two different failure paths. A transport failure throws, while an HTTP error returns normally with a status code. Both lead into the same "may I retry?" decision.',
        explanation: [
          '**Build request** with a URI, a method and a request timeout, then pass it to **send / sendAsync** on one shared HttpClient.',
          'If a response arrives, go to **Check statusCode()**. The happy path, labelled 2xx, leads to **2xx: parse body**.',
          'The dashed "throws" arrow is the other failure path. A connection reset, refusal or timeout throws an **IOException**, and no response exists at all.',
          'Any other status is **4xx / 5xx**, a normal response rather than an exception. Codes 400, 404 and 409 will not change on retry, so **Fail fast** with a domain exception.',
          'An IOException, or a 429 or 503 response, flows into **Idempotent?**. Retry with backoff and jitter (a random extra delay) only if repeating the request is safe, as with GET or PUT.',
          'Takeaway: both failure paths meet at the same retry decision, which is why a robust client handles exceptions and status codes together.',
        ],
        cols: 4,
        rows: 3,
        nodes: [
          { id: 'build', label: 'Build request', detail: 'URI, method, timeout', col: 0, row: 0, tone: 'primary' },
          { id: 'send', label: 'send / sendAsync', detail: 'shared HttpClient', col: 1, row: 0, tone: 'primary' },
          { id: 'status', label: 'Check statusCode()', col: 2, row: 0, tone: 'accent' },
          { id: 'ok', label: '2xx: parse body', col: 3, row: 0, shape: 'pill', tone: 'success' },
          { id: 'ioe', label: 'IOException', detail: 'reset, refused, timeout', col: 1, row: 1, tone: 'danger' },
          { id: 'err', label: '4xx / 5xx', detail: 'a normal response', col: 2, row: 1, tone: 'warning' },
          { id: 'retry', label: 'Idempotent?', detail: 'then backoff + jitter', col: 1, row: 2, tone: 'neutral' },
          { id: 'fail', label: 'Fail fast', detail: 'domain exception', col: 3, row: 2, shape: 'pill', tone: 'danger' },
        ],
        edges: [
          { from: 'build', to: 'send' },
          { from: 'send', to: 'status', label: 'response' },
          { from: 'status', to: 'ok', label: '2xx' },
          { from: 'send', to: 'ioe', label: 'throws', dashed: true },
          { from: 'status', to: 'err', label: 'other' },
          { from: 'ioe', to: 'retry' },
          { from: 'err', to: 'retry', label: '429, 503' },
          { from: 'err', to: 'fail', label: '400, 404, 409' },
        ],
      },
      {
        id: 'io2-client-arch',
        kind: 'architecture',
        title: 'What a shared HttpClient owns',
        caption: 'Many threads share one immutable client. It keeps connections open. With HTTP/2, it also multiplexes concurrent requests, sending them over one connection per host.',
        explanation: [
          'Many **Request threads**, or virtual threads, call `send` on one shared **HttpClient**. Because the client is immutable and thread-safe, no locking is needed.',
          'For `sendAsync`, the client completes the returned future. It runs dependent callbacks on its **Executor**, so the calling thread does not wait.',
          'The "Owned by the client" group shows what it manages. The **Connection pool** keeps HTTP/1.1 connections alive, so calls to **Service A** reuse an open TCP + TLS connection.',
          'With HTTP/2, the client opens one **HTTP/2 connection** per host, as with **Service B**. It multiplexes many concurrent requests over it, each as a separate stream.',
          'Takeaway: create one client and reuse it. Building a new client per request throws away pooled connections and repeats every handshake.',
        ],
        cols: 4,
        rows: 3,
        nodes: [
          { id: 't', label: 'Request threads', detail: 'or virtual threads', col: 0, row: 0, tone: 'neutral' },
          { id: 'client', label: 'HttpClient', detail: 'immutable, thread-safe', col: 1, row: 0, span: 2, tone: 'primary' },
          { id: 'exec', label: 'Executor', detail: 'async callbacks', col: 3, row: 0, tone: 'neutral' },
          { id: 'pool', label: 'Connection pool', detail: 'HTTP/1.1 keep-alive', col: 1, row: 1, tone: 'accent' },
          { id: 'h2', label: 'HTTP/2 connection', detail: 'many streams, one TCP', col: 2, row: 1, tone: 'accent' },
          { id: 'svcA', label: 'Service A', col: 1, row: 2, shape: 'cylinder', tone: 'neutral' },
          { id: 'svcB', label: 'Service B', col: 2, row: 2, shape: 'cylinder', tone: 'neutral' },
        ],
        edges: [
          { from: 't', to: 'client', label: 'send' },
          { from: 'client', to: 'exec', label: 'sendAsync' },
          { from: 'client', to: 'pool' },
          { from: 'client', to: 'h2' },
          { from: 'pool', to: 'svcA', label: 'TCP + TLS' },
          { from: 'h2', to: 'svcB', label: 'multiplexed' },
        ],
        groups: [{ label: 'Owned by the client', fromCol: 1, toCol: 2, fromRow: 1, toRow: 1, tone: 'primary' }],
      },
    ],
    variants: [
      {
        title: 'HTTP methods',
        intro: '"Safe" means read-only; "idempotent" means sending it twice has the same effect as once (RFC 9110). That property, not the error, decides whether a retry is allowed.',
        items: [
          { name: 'GET', summary: 'Read a resource. Safe and idempotent; cacheable.', support: 'supported', code: 'HttpRequest.newBuilder(uri).GET().build()' },
          { name: 'POST', summary: 'Create or trigger processing. Neither safe nor idempotent: retries need an idempotency key.', support: 'supported', code: '.POST(BodyPublishers.ofString(json))' },
          { name: 'PUT', summary: 'Replace a resource with the given representation. Idempotent.', support: 'supported', code: '.PUT(BodyPublishers.ofString(json))' },
          { name: 'PATCH', summary: 'Partially modify a resource. Not idempotent in general.', support: 'partial', note: 'No dedicated builder method; use method("PATCH", publisher).', code: '.method("PATCH", BodyPublishers.ofString(patch))' },
          { name: 'DELETE', summary: 'Remove a resource. Idempotent: deleting twice leaves it deleted.', support: 'supported', code: '.DELETE()' },
          { name: 'HEAD / OPTIONS', summary: 'HEAD returns headers only; OPTIONS asks what is allowed (used by CORS preflight). Both safe.', support: 'supported', note: 'HttpRequest.Builder.HEAD() was added in Java 18; OPTIONS uses method("OPTIONS", noBody()).' },
        ],
      },
      {
        title: 'Status code classes',
        items: [
          { name: '1xx Informational', summary: 'Interim responses such as 100 Continue; the client handles them.' },
          { name: '2xx Success', summary: '200 OK, 201 Created (often with a Location header), 204 No Content.' },
          { name: '3xx Redirection', summary: '301/308 moved permanently, 302/307 temporarily, 304 Not Modified for conditional GETs. HttpClient does not follow redirects unless configured.' },
          { name: '4xx Client error', summary: '400 bad input, 401 not authenticated, 403 not allowed, 404 not found, 409 conflict, 429 too many requests. Retrying the same request will not help, except 429 after Retry-After.' },
          { name: '5xx Server error', summary: '500 bug, 502/504 gateway problems, 503 overloaded or down. Retry idempotent requests with exponential backoff and jitter.' },
        ],
      },
      {
        title: 'send vs sendAsync',
        items: [
          { name: 'send', summary: 'Blocks until the response headers (and, for most handlers, the body) arrive. Throws IOException or InterruptedException.', support: 'supported', code: 'HttpResponse<String> r = client.send(req, BodyHandlers.ofString());' },
          { name: 'sendAsync', summary: 'Returns CompletableFuture<HttpResponse<T>> immediately; failures complete it exceptionally (CompletionException wrapping IOException on join).', support: 'supported', code: 'CompletableFuture<HttpResponse<String>> f = client.sendAsync(req, BodyHandlers.ofString());' },
          { name: 'send on virtual threads', summary: 'Blocking code with async-level scalability: each call parks a cheap virtual thread instead of an OS thread (Java 21).', support: 'supported', code: 'try (var ex = Executors.newVirtualThreadPerTaskExecutor()) { ex.submit(() -> client.send(req, handler)); }' },
        ],
      },
    ],
    deepDive: [
      {
        title: 'Idempotency is a property of the API, not of the client',
        body: 'RFC 9110 defines GET, HEAD, OPTIONS, PUT and DELETE as idempotent. Retrying them after an ambiguous failure (timeout, connection reset) is safe only if the server honours those semantics. For POST, robust APIs accept a client-generated idempotency key and store the first outcome for that key. Retries also need a budget: exponential backoff with jitter and a maximum number of attempts, otherwise retries from many clients amplify an outage.',
        sources: [{ label: 'RFC 9110: HTTP Semantics, section 9.2 (Common Method Properties)', url: 'https://www.rfc-editor.org/rfc/rfc9110' }],
      },
      {
        title: 'What the timeouts actually bound',
        body: '`connectTimeout` covers establishing the TCP connection (and with it the TLS handshake). `HttpRequest.timeout` makes the call fail with `HttpTimeoutException` if the response is not received in time. A server that sends headers quickly and then trickles a large body is a separate risk; when you need an overall deadline, apply one around the whole operation, for example `sendAsync(...).orTimeout(...)`.',
        sources: [{ label: 'HttpClient and HttpRequest — Java SE 21 API', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.net.http/java/net/http/HttpClient.html' }],
      },
      {
        title: 'Why the JDK grew a new HTTP client',
        body: '`HttpURLConnection` dates from Java 1.1: blocking only, HTTP/1.1 only, mutable, with surprising global behaviour. JEP 110 introduced a new client as an incubator module in Java 9; JEP 321 standardised it as `java.net.http` in Java 11 with HTTP/2, WebSocket support and `CompletableFuture` integration. Java 21 made it `AutoCloseable`, and virtual threads (JEP 444) made its blocking `send` a scalable default.',
        sources: [
          { label: 'JEP 321: HTTP Client', url: 'https://openjdk.org/jeps/321' },
          { label: 'JEP 444: Virtual Threads', url: 'https://openjdk.org/jeps/444' },
        ],
      },
    ],
  },
};
