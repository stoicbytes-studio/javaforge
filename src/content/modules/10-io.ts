import type { CurriculumModule } from '@/types/curriculum';

export const ioModule: CurriculumModule = {
  id: 'io',
  order: 10,
  title: 'Files, NIO and Networking',
  shortTitle: 'I/O & NIO',
  summary: 'Reading and writing files safely with java.nio.file, explicit character encodings, and calling HTTP services with java.net.http.HttpClient.',
  level: 'advanced',
  prerequisites: ['exceptions'],
  lessons: [
    {
      id: 'io-files',
      moduleId: 'io',
      title: 'Files, paths and character encodings',
      summary: 'Path and Files, buffered reading, closing streams with try-with-resources, explicit UTF-8, and walking directory trees.',
      estimatedMinutes: 35,
      difficulty: 'intermediate',
      prerequisites: ['e-resources', 'fn-streams'],
      versionNotes: [
        { feature: 'java.nio.file (Path, Files, NIO.2)', since: 7 },
        { feature: 'Files.lines, Files.walk, Files.newBufferedReader without charset', since: 8 },
        { feature: 'Path.of, Files.readString, Files.writeString', since: 11 },
        { feature: 'UTF-8 by default (JEP 400)', since: 18, note: 'Before 18 the default charset depended on the OS locale' },
      ],
      objectives: [
        'Build, resolve, normalise and relativise paths with Path.',
        'Read and write text with Files and BufferedReader, choosing the right method for the file size.',
        'Close files and file streams (Files.lines, Files.walk) with try-with-resources.',
        'Specify charsets explicitly and explain what JEP 400 changed.',
      ],
      plainEnglish: `Programs constantly read and write files: configuration, logs, CSV exports, uploads. Modern Java does this through two types in \`java.nio.file\`:

- a **Path** is an address of a file or directory, like \`/var/log/app.log\` — it does not open anything;
- **Files** is a toolbox of static methods that actually touch the disk: create, read, write, copy, move, delete, list.

Two rules prevent most bugs. **Always close what you open** (try-with-resources does it for you, even when an exception happens). **Always say which character encoding you mean** — text on disk is just bytes, and reading them with the wrong encoding turns "naive" with an accent into garbage.`,
      technical: `### Paths
- \`Path.of("data", "in.csv")\` (Java 11; \`Paths.get\` before) builds a path using the platform separator.
- \`resolve(other)\` appends a relative path — but if \`other\` is absolute, the result is just \`other\`.
- \`normalize()\` removes \`.\` and \`name/..\` segments; \`relativize\` computes the path from one to another; \`toAbsolutePath()\`, \`getParent()\`, \`getFileName()\`.
- \`Path.startsWith(Path)\` compares **whole name elements**, so \`/srv/app-secrets\` does not start with \`/srv/app\` — unlike \`String.startsWith\`. Normalise before checking whether a user-supplied path stays inside a base directory.

### Reading and writing text
- Small files: \`Files.readString(path)\`, \`Files.readAllLines(path)\`, \`Files.writeString(path, text)\`, \`Files.write(path, lines)\`. These load everything into memory.
- Large files: \`Files.newBufferedReader(path, UTF_8)\` with \`readLine()\`, or \`Files.lines(path, UTF_8)\` as a lazy \`Stream<String>\`. Memory use stays constant regardless of file size.
- \`Files.lines\`, \`Files.list\`, \`Files.walk\` and \`Files.newDirectoryStream\` keep an OS handle open until the stream is **closed**. A terminal operation does not close them. Leaking them eventually causes "Too many open files" and, on Windows, files that cannot be deleted.
- Write options: \`StandardOpenOption.APPEND\`, \`CREATE_NEW\` (fail if it exists), \`TRUNCATE_EXISTING\` (the default for write). For crash-safe replacement, write to a temp file in the same directory and \`Files.move(tmp, target, ATOMIC_MOVE)\`.

### Character encodings
A \`String\` is UTF-16 inside the JVM; files and sockets are bytes. Converting between them always uses a **charset**. Since **Java 18 (JEP 400)** the default charset is UTF-8 on every platform; before that it came from the OS locale (often windows-1252 on Windows), so the same program could read the same file differently on two machines. \`Files\` methods without a charset parameter have always used UTF-8, but \`FileReader\`, \`InputStreamReader\` and \`String.getBytes()\` without arguments use the default. Pass \`StandardCharsets.UTF_8\` explicitly anyway: it documents intent and protects code that may run on an older JVM. Reading UTF-8 bytes as ISO-8859-1 never fails — it silently produces mojibake — while \`Files.readString\` with the wrong charset throws \`MalformedInputException\`.

### Directories
\`Files.createDirectories\` creates missing parents. \`Files.list(dir)\` lists one level; \`Files.walk(dir)\` visits the whole tree depth-first (both streams, both must be closed); \`Files.walkFileTree\` gives a visitor with pre/post hooks. Deleting a tree means deleting children before parents — sort the walked paths in reverse order. Temporary files: \`Files.createTempFile\` / \`createTempDirectory\`.

### Exceptions
NIO methods throw specific \`IOException\` subclasses: \`NoSuchFileException\`, \`FileAlreadyExistsException\`, \`AccessDeniedException\`, \`DirectoryNotEmptyException\`. Catch the specific ones you can handle and let the rest propagate.`,
      whyItExists: `The original java.io.File API returned booleans instead of explaining failures, had no proper support for symbolic links, attributes or file-system providers, and hid encoding choices behind platform defaults. NIO.2 (Java 7) replaced it with Path and Files: clear exceptions, streams for large directories and files, and pluggable file systems (zip files can be opened as a FileSystem). JEP 400 removed the last big source of "works on my machine" text bugs by making UTF-8 the default.`,
      whenToUse: [
        'Use Path and Files for all new file code instead of java.io.File.',
        'Use readString/readAllLines only for files you know are small; stream large files line by line.',
        'Wrap Files.lines, Files.walk, Files.list and every reader or writer in try-with-resources.',
        'Pass StandardCharsets.UTF_8 explicitly whenever bytes become text or text becomes bytes.',
      ],
      whenNotToUse: [
        'Do not read multi-gigabyte files with readAllLines or readString.',
        'Do not build file paths by concatenating strings with "/".',
        'Do not use String.startsWith to check that a path stays inside a directory.',
        'Do not rely on the platform default charset when exchanging files with other systems.',
      ],
      examples: [
        {
          id: 'nio-files',
          title: 'Writing, reading, streaming and walking files',
          runnable: true,
          code: `import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;
import java.util.stream.*;

public class Main {
    public static void main(String[] args) throws IOException {
        Path dir = Files.createTempDirectory("jf-demo");
        Path log = dir.resolve("logs").resolve("app.log");
        Files.createDirectories(log.getParent());

        Files.write(log, List.of("INFO started", "WARN disk 91%", "INFO ready", "ERROR timeout"), StandardCharsets.UTF_8);
        Files.writeString(dir.resolve("notes.txt"), "caf\\u00e9", StandardCharsets.UTF_8);

        int notInfo = 0;
        try (BufferedReader reader = Files.newBufferedReader(log, StandardCharsets.UTF_8)) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (!line.startsWith("INFO")) notInfo++;
            }
        }
        System.out.println("non-INFO lines: " + notInfo);

        try (Stream<String> lines = Files.lines(log, StandardCharsets.UTF_8)) {
            System.out.println("errors: " + lines.filter(l -> l.startsWith("ERROR")).count());
        }

        Path notes = dir.resolve("notes.txt");
        System.out.println("notes bytes: " + Files.size(notes));
        System.out.println("notes chars: " + Files.readString(notes, StandardCharsets.UTF_8).length());

        try (Stream<Path> paths = Files.walk(dir)) {
            paths.filter(Files::isRegularFile)
                 .map(p -> dir.relativize(p).toString())
                 .sorted()
                 .forEach(p -> System.out.println("file: " + p));
        }

        try (Stream<Path> paths = Files.walk(dir)) {
            for (Path p : paths.sorted(Comparator.reverseOrder()).toList()) Files.delete(p);
        }
        System.out.println("cleaned up: " + Files.notExists(dir));
    }
}`,
          expectedOutput: `non-INFO lines: 2
errors: 1
notes bytes: 5
notes chars: 4
file: logs/app.log
file: notes.txt
cleaned up: true`,
          explanation: 'The note contains "cafe" with an accented e: 4 characters but 5 bytes in UTF-8, because the accented letter needs two bytes. Paths are printed with "/" because this runs on Linux; on Windows relativize would produce "logs\\app.log".',
        },
        {
          id: 'charsets',
          title: 'Bytes, characters and the wrong charset',
          runnable: true,
          code: `import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;

public class Main {
    public static void main(String[] args) {
        String word = "na\\u00efve";   // "naive" with a diaeresis on the i
        byte[] utf8 = word.getBytes(StandardCharsets.UTF_8);
        byte[] latin1 = word.getBytes(StandardCharsets.ISO_8859_1);
        System.out.println("chars: " + word.length());
        System.out.println("UTF-8 bytes: " + utf8.length);
        System.out.println("ISO-8859-1 bytes: " + latin1.length);

        String garbled = new String(utf8, StandardCharsets.ISO_8859_1);   // decoded with the wrong charset
        System.out.println("mis-decoded length: " + garbled.length());
        System.out.println("round trip ok: " + word.equals(new String(utf8, StandardCharsets.UTF_8)));
        System.out.println("default charset: " + Charset.defaultCharset());
    }
}`,
          expectedOutput: `chars: 5
UTF-8 bytes: 6
ISO-8859-1 bytes: 5
mis-decoded length: 6
round trip ok: true
default charset: UTF-8`,
          explanation: 'Decoding UTF-8 bytes as ISO-8859-1 does not throw; it turns the two-byte character into two wrong characters (mojibake). The last line prints UTF-8 on Java 18+ unless the JVM is started with -Dfile.encoding=COMPAT.',
        },
      ],
      walkthrough: {
        exampleId: 'nio-files',
        steps: [
          { lines: [9, 11], text: 'A Path is only an address. resolve() appends segments; createDirectories() creates the missing logs directory.' },
          { lines: [13, 14], text: 'Small writes in one call, with an explicit charset. Files.write truncates an existing file by default.' },
          { lines: [16, 23], text: 'The classic streaming loop: a BufferedReader reads one line at a time, so memory use is independent of file size. try-with-resources closes the file even if an exception is thrown.' },
          { lines: [25, 27], text: 'Files.lines is lazy and holds the file open. count() does not close it - the try-with-resources does.' },
          { lines: [29, 31], text: 'Files.size counts bytes, String.length counts UTF-16 chars: they differ as soon as the text is not plain ASCII.' },
          { lines: [33, 38], text: 'Files.walk visits the whole tree. Relativising and sorting makes the output independent of the temp directory name and of directory listing order.' },
          { lines: [40, 43], text: 'To delete a tree, delete deepest paths first: reverse order puts children before their parents.' },
        ],
      },
      realWorld: {
        title: 'The export that broke on the Windows server',
        scenario: `A reporting service wrote CSV exports with \`new FileWriter(file)\` and a partner system read them as UTF-8. Developers on Linux laptops never saw a problem. On the Windows production server, running Java 11, the default charset was windows-1252, so customer names such as "Zoe" with an accented e arrived as garbage, and Polish names lost characters entirely.

The team switched to \`Files.newBufferedWriter(path, StandardCharsets.UTF_8)\`, added a test that round-trips non-ASCII names, and later upgraded to Java 21 where UTF-8 is the default anyway. During the same review they found a nightly job calling \`Files.lines(path).count()\` in a loop over thousands of files without closing the streams; it had been failing with "Too many open files" every few weeks. Wrapping the stream in try-with-resources fixed it.`,
      },
      commonMistakes: [
        {
          mistake: 'Not closing Files.lines / Files.walk / Files.list.',
          why: 'They hold an OS file or directory handle until closed; terminal operations such as count() do not close them.',
          fix: 'Always use try-with-resources around these streams.',
          code: `long n = Files.lines(path).count();                 // leaks a file handle
try (Stream<String> s = Files.lines(path)) { n = s.count(); }   // closed`,
        },
        {
          mistake: 'Relying on the default charset (FileReader, FileWriter, getBytes()).',
          why: 'Before Java 18 the default depended on the OS locale, so the same code produced different bytes on different machines.',
          fix: 'Pass StandardCharsets.UTF_8 explicitly, or use Files methods that default to UTF-8.',
        },
        {
          mistake: 'Reading a huge file with readAllLines or readString.',
          why: 'The whole file is loaded into the heap and can cause OutOfMemoryError.',
          fix: 'Stream it with BufferedReader.readLine() or Files.lines.',
        },
        {
          mistake: 'Checking user-supplied paths with string operations.',
          why: '"uploads/../../etc/passwd" starts with "uploads" as a string; "/srv/app-secrets" starts with "/srv/app".',
          fix: 'base.resolve(input).normalize() and then Path.startsWith(base) on normalised paths.',
        },
      ],
      checks: [
        {
          id: 'io1-c1',
          kind: 'predict-output',
          dimension: 'coding',
          prompt: 'What does this program print (on Linux)?',
          code: `import java.nio.file.*;

public class Main {
    public static void main(String[] args) {
        Path base = Path.of("/srv/app");
        System.out.println(base.resolve("data/../config/app.yml").normalize());
        System.out.println(base.resolve("/etc/passwd"));
        System.out.println(base.relativize(Path.of("/srv/app/logs/a.log")));
    }
}`,
          options: [
            { id: 'a', text: '/srv/app/config/app.yml\n/etc/passwd\nlogs/a.log' },
            { id: 'b', text: '/srv/app/data/../config/app.yml\n/srv/app/etc/passwd\nlogs/a.log' },
            { id: 'c', text: '/srv/app/config/app.yml\n/srv/app/etc/passwd\n/srv/app/logs/a.log' },
            { id: 'd', text: '/srv/config/app.yml\n/etc/passwd\nlogs/a.log' },
          ],
          correctOptionId: 'a',
          explanation: 'normalize() removes "data/..". resolve() with an absolute argument returns the argument unchanged - a classic path traversal trap. relativize() gives the path from base to the target.',
        },
        {
          id: 'io1-c2',
          kind: 'mcq',
          dimension: 'debugging',
          prompt: 'A job runs `long n = Files.lines(path).count();` for each of 50,000 files and eventually fails with "Too many open files". Why?',
          options: [
            { id: 'a', text: 'count() reads files in parallel' },
            { id: 'b', text: 'The stream returned by Files.lines keeps the file open until it is closed, and count() does not close it' },
            { id: 'c', text: 'Files.lines loads the whole file into memory' },
            { id: 'd', text: 'The garbage collector closes files only on System.gc()' },
          ],
          correctOptionId: 'b',
          explanation: 'Files.lines is backed by an open file. Wrap it in try-with-resources so close() runs deterministically.',
        },
        {
          id: 'io1-c3',
          kind: 'multi-select',
          dimension: 'interview',
          prompt: 'Which statements about charsets in Java are true? Select all that apply.',
          options: [
            { id: 'a', text: 'Since Java 18 the default charset is UTF-8 on all platforms (JEP 400).' },
            { id: 'b', text: 'Before Java 18, FileReader without a charset used the OS locale\'s encoding.' },
            { id: 'c', text: 'Decoding UTF-8 bytes as ISO-8859-1 always throws an exception.' },
            { id: 'd', text: 'String.length() counts UTF-16 chars, not bytes on disk.' },
            { id: 'e', text: 'Files.readString without a charset argument uses UTF-8.' },
          ],
          correctOptionIds: ['a', 'b', 'd', 'e'],
          explanation: 'ISO-8859-1 maps every byte to a character, so decoding never fails - it silently produces mojibake. The other statements are true.',
        },
        {
          id: 'io1-c4',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'You must count ERROR lines in a 30 GB log file on a server with a 2 GB heap. Which approach is right?',
          options: [
            { id: 'a', text: 'Files.readAllLines(path) and loop over the list' },
            { id: 'b', text: 'Files.readString(path).split("\\n")' },
            { id: 'c', text: 'Stream the file with Files.newBufferedReader (or Files.lines in try-with-resources) and count matching lines' },
            { id: 'd', text: 'Increase -Xmx to 40 GB' },
          ],
          correctOptionId: 'c',
          explanation: 'Streaming keeps only one line (plus a buffer) in memory at a time; the other options load the whole file.',
        },
      ],
      challengeIds: ['ch-csv-totals', 'ch-path-traversal'],
      masteryCriteria: [
        'Read and write text files with Files and BufferedReader, with explicit charsets.',
        'Close every file stream with try-with-resources, including Files.lines and Files.walk.',
        'Resolve and normalise paths and check containment with Path.startsWith.',
        'Explain JEP 400 and diagnose mojibake.',
      ],
      relatedLessonIds: ['e-resources', 'fn-streams', 't-strings', 'io-http'],
      revision: [
        { id: 'r1', question: 'Which Files methods return streams that must be closed?', answer: 'Files.lines, Files.list, Files.walk and Files.find (and newDirectoryStream). They hold an OS handle until closed.' },
        { id: 'r2', question: 'What did JEP 400 change?', answer: 'Since Java 18 the default charset is UTF-8 everywhere instead of depending on the OS locale.' },
        { id: 'r3', question: 'What does base.resolve("/etc/passwd") return?', answer: '/etc/passwd - resolving an absolute path returns it unchanged, so always normalise and check startsWith(base) for user input.' },
        { id: 'r4', question: 'When is Files.readAllLines appropriate?', answer: 'Only for files known to be small; it loads the whole file into memory. Stream large files instead.' },
      ],
    },
    {
      id: 'io-http',
      moduleId: 'io',
      title: 'Calling HTTP services with HttpClient',
      summary: 'java.net.http.HttpClient: building requests, synchronous and asynchronous calls, timeouts and status handling.',
      estimatedMinutes: 30,
      difficulty: 'advanced',
      prerequisites: ['io-files', 'cc-threads'],
      versionNotes: [
        { feature: 'java.net.http.HttpClient (JEP 321)', since: 11, note: 'Incubator module in 9-10, standard in 11' },
        { feature: 'HttpClient implements AutoCloseable (close, shutdown)', since: 21 },
      ],
      objectives: [
        'Build an HttpClient and HttpRequest with connect and request timeouts.',
        'Send requests synchronously with send() and asynchronously with sendAsync().',
        'Handle status codes explicitly and distinguish them from transport failures.',
        'Decide which failures are safe to retry.',
      ],
      plainEnglish: `Most backends talk to other services over HTTP. Since Java 11 the JDK ships a modern HTTP client: you build a **request** (URL, method, headers, body), hand it to a **client**, and get back a **response** with a status code, headers and a body.

You can wait for the answer (\`send\`) or get a \`CompletableFuture\` and carry on (\`sendAsync\`). Two things trip people up: an HTTP error such as 404 or 500 is a perfectly normal response, not an exception — you must check the status yourself — and **by default there is no timeout**, so a stuck server can hang your thread forever.`,
      technical: `### Building blocks
- \`HttpClient\` is immutable and thread-safe; build **one** and reuse it — it owns a connection pool and, for HTTP/2, multiplexes requests over one connection. \`HttpClient.newBuilder()\` sets \`connectTimeout\`, \`version\` (HTTP_2 by default, falling back to HTTP/1.1), \`followRedirects\` (NEVER by default), \`executor\`, \`proxy\` and \`authenticator\`.
- \`HttpRequest.newBuilder(uri)\` sets the method (\`GET()\` default, \`POST(BodyPublishers.ofString(json))\`), \`header(...)\` and the per-request \`timeout(Duration)\`.
- \`HttpResponse.BodyHandlers\` decide how the body is consumed: \`ofString()\` (charset from the Content-Type header, UTF-8 if absent), \`ofByteArray()\`, \`ofFile(path)\`, \`ofLines()\`, \`ofInputStream()\`, \`discarding()\`.

### Sync and async
- \`client.send(request, handler)\` blocks and returns \`HttpResponse<T>\`; it throws \`IOException\` (connection refused, reset, \`HttpTimeoutException\`) or \`InterruptedException\`. With virtual threads, blocking \`send\` calls are cheap and keep code simple.
- \`client.sendAsync(request, handler)\` returns \`CompletableFuture<HttpResponse<T>>\`. Start several calls, then \`join\` them; failures arrive as \`CompletionException\` wrapping the \`IOException\`.

### Status handling
A 4xx or 5xx status is **not** an exception. Check \`statusCode()\` and map it deliberately: 2xx success; 404 often means "absent" (\`Optional.empty()\`); 401/403 are configuration or permission problems; 429 and 503 may be retried after the \`Retry-After\` delay; other 5xx might be retried if the request is idempotent.

### Timeouts and retries
- \`connectTimeout\` bounds establishing the connection; \`HttpRequest.timeout\` bounds waiting for the response headers. Neither has a default: without them a call can wait indefinitely.
- Retry only **idempotent** requests (GET, PUT, DELETE, or POST with an idempotency key), with a limited number of attempts, exponential backoff and jitter. Retrying a non-idempotent payment POST after a timeout can charge a customer twice — the first request may have succeeded.

### Lifecycle
Since Java 21 \`HttpClient\` is \`AutoCloseable\` (\`close()\` waits for in-flight requests; \`shutdownNow()\` aborts them). Typically one client lives as long as the application. For lower-level networking the JDK still has \`Socket\`/\`ServerSocket\` and NIO \`SocketChannel\`; the JDK also includes a minimal \`com.sun.net.httpserver.HttpServer\`, which is handy for tests and demos.`,
      whyItExists: `The legacy HttpURLConnection (Java 1.1) was awkward, blocking-only, HTTP/1.1-only and full of surprising behaviour, so most projects pulled in Apache HttpClient or OkHttp. JEP 321 added a modern client to the JDK with a fluent, immutable API, HTTP/2, WebSocket support and both blocking and CompletableFuture-based asynchronous calls.`,
      whenToUse: [
        'Use HttpClient for outbound HTTP calls when no framework client (Spring RestClient/WebClient) is already in place.',
        'Create one shared client per application (or per downstream service configuration).',
        'Set a connect timeout on the client and a timeout on every request.',
        'Use sendAsync to run independent calls concurrently, or plain send on virtual threads.',
      ],
      whenNotToUse: [
        'Do not create a new HttpClient per request: you lose connection reuse.',
        'Do not treat "no exception" as success - check the status code.',
        'Do not retry non-idempotent requests blindly after a timeout.',
        'Do not use com.sun.net.httpserver.HttpServer as a production web server; use a real framework or server.',
      ],
      examples: [
        {
          id: 'local-http',
          title: 'Sync, async, status codes and timeouts against a local server',
          runnable: true,
          code: `import com.sun.net.httpserver.HttpServer;
import java.net.*;
import java.net.http.*;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) throws Exception {
        // A tiny local server on a free port, so the example needs no internet access
        HttpServer server = HttpServer.create(new InetSocketAddress(InetAddress.getLoopbackAddress(), 0), 0);
        server.createContext("/greet", exchange -> {
            String name = exchange.getRequestURI().getQuery().substring("name=".length());
            byte[] body = ("Hello, " + name).getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "text/plain; charset=utf-8");
            exchange.sendResponseHeaders(200, body.length);
            try (var out = exchange.getResponseBody()) { out.write(body); }
        });
        server.createContext("/slow", exchange -> {
            try { Thread.sleep(2_000); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
            exchange.sendResponseHeaders(204, -1);
            exchange.close();
        });
        server.setExecutor(Executors.newVirtualThreadPerTaskExecutor());
        server.start();
        String base = "http://127.0.0.1:" + server.getAddress().getPort();

        HttpClient client = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_1_1)
            .connectTimeout(Duration.ofSeconds(2))
            .build();

        // 1. Synchronous GET
        HttpRequest hello = HttpRequest.newBuilder(URI.create(base + "/greet?name=Ada"))
            .timeout(Duration.ofSeconds(2))
            .build();
        HttpResponse<String> response = client.send(hello, HttpResponse.BodyHandlers.ofString());
        System.out.println(response.statusCode() + " " + response.body());

        // 2. A 404 is a normal response, not an exception
        HttpResponse<String> missing = client.send(
            HttpRequest.newBuilder(URI.create(base + "/nope")).timeout(Duration.ofSeconds(2)).build(),
            HttpResponse.BodyHandlers.ofString());
        System.out.println("status " + missing.statusCode() + ", success? " + (missing.statusCode() / 100 == 2));

        // 3. Asynchronous calls in parallel; results read in request order
        List<CompletableFuture<String>> calls = new ArrayList<>();
        for (String name : List.of("Grace", "Linus", "Barbara")) {
            HttpRequest r = HttpRequest.newBuilder(URI.create(base + "/greet?name=" + name))
                .timeout(Duration.ofSeconds(2)).build();
            calls.add(client.sendAsync(r, HttpResponse.BodyHandlers.ofString()).thenApply(HttpResponse::body));
        }
        for (CompletableFuture<String> call : calls) System.out.println(call.join());

        // 4. A per-request timeout turns a hanging call into an exception
        try {
            client.send(HttpRequest.newBuilder(URI.create(base + "/slow")).timeout(Duration.ofMillis(200)).build(),
                HttpResponse.BodyHandlers.discarding());
        } catch (HttpTimeoutException e) {
            System.out.println("timed out: " + e.getClass().getSimpleName());
        }
        server.stop(0);
    }
}`,
          expectedOutput: `200 Hello, Ada
status 404, success? false
Hello, Grace
Hello, Linus
Hello, Barbara
timed out: HttpTimeoutException`,
          explanation: 'Port 0 asks the OS for any free port, and the loopback address keeps the server private to this machine. The client is pinned to HTTP/1.1 because the built-in demo server does not speak HTTP/2; against real HTTPS services the default HTTP_2 is fine. The server has no context for /nope, so it answers 404 itself.',
        },
        {
          id: 'retry-post',
          title: 'A JSON POST with status mapping and safe retries',
          runnable: false,
          code: `import java.io.IOException;
import java.net.URI;
import java.net.http.*;
import java.time.Duration;
import java.util.UUID;

public class Main {
    static final HttpClient CLIENT = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(2))
        .build();

    static String createOrder(String json) throws IOException, InterruptedException {
        String idempotencyKey = UUID.randomUUID().toString();   // same key on every retry
        HttpRequest request = HttpRequest.newBuilder(URI.create("https://api.example.com/orders"))
            .timeout(Duration.ofSeconds(5))
            .header("Content-Type", "application/json")
            .header("Idempotency-Key", idempotencyKey)
            .POST(HttpRequest.BodyPublishers.ofString(json))
            .build();

        for (int attempt = 1; ; attempt++) {
            try {
                HttpResponse<String> r = CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
                int status = r.statusCode();
                if (status == 201) return r.body();
                if ((status == 429 || status == 503) && attempt < 3) {
                    Thread.sleep(200L * (1 << attempt));                 // exponential backoff
                    continue;
                }
                throw new IOException("order API returned " + status + ": " + r.body());
            } catch (HttpTimeoutException e) {
                if (attempt >= 3) throw e;                                // safe to retry: the server deduplicates by key
            }
        }
    }

    public static void main(String[] args) throws Exception {
        System.out.println(createOrder("{\\"sku\\":\\"A-1\\",\\"qty\\":2}"));
    }
}`,
          explanation: 'Not runnable here because it needs network access. The idempotency key lets the server recognise a retried POST, which makes retrying after a timeout safe. Production code would add jitter, honour Retry-After, and usually use a resilience library.',
        },
      ],
      walkthrough: {
        exampleId: 'local-http',
        steps: [
          { lines: [12, 19], text: 'The demo server binds to the loopback address on port 0 (any free port). The /greet handler writes a UTF-8 body with an exact Content-Length.' },
          { lines: [20, 24], text: 'The /slow handler sleeps longer than the client is willing to wait, to demonstrate a request timeout.' },
          { lines: [29, 32], text: 'One client for the whole program, with a connect timeout. HttpClient is immutable and thread-safe.' },
          { lines: [34, 39], text: 'A synchronous GET: send() blocks until the response headers and body have arrived, bounded by the request timeout.' },
          { lines: [41, 45], text: 'A missing resource produces a normal HttpResponse with status 404. Only transport problems throw.' },
          { lines: [47, 54], text: 'sendAsync starts all three calls at once. Joining the futures in list order makes the output deterministic even though the calls run concurrently.' },
          { lines: [56, 62], text: 'With timeout(200 ms) the client gives up and throws HttpTimeoutException instead of waiting two seconds - or forever, which is the default without a timeout.' },
        ],
      },
      realWorld: {
        title: 'One slow dependency took down checkout',
        scenario: `A checkout service called a recommendations API with an HttpClient created without any timeouts. One evening the recommendations service stopped responding without closing connections. Every checkout request thread blocked in \`send()\`; within minutes all 200 Tomcat threads were stuck and checkout - which did not even need recommendations - was down.

The fix: a 1-second connect timeout and a 500 ms request timeout for recommendations, a fallback to "no recommendations" on \`HttpTimeoutException\` or any 5xx, and explicit status handling so a 404 no longer flowed into the JSON parser. Calls to the payment provider got a separate, longer timeout and retries only with an idempotency key. A shared client per downstream service replaced the code path that had created a new HttpClient on every request.`,
      },
      commonMistakes: [
        {
          mistake: 'No timeouts.',
          why: 'Neither connectTimeout nor the request timeout has a default; a stuck server can block the calling thread indefinitely.',
          fix: 'Set connectTimeout on the client and timeout(...) on every request.',
        },
        {
          mistake: 'Assuming a 404 or 500 throws an exception.',
          why: 'HttpClient returns every HTTP status as a normal response. Unchecked responses flow into parsers as if they were successful.',
          fix: 'Check statusCode() and map each class of status explicitly.',
          code: `HttpResponse<String> r = client.send(req, BodyHandlers.ofString());
if (r.statusCode() != 200) throw new IOException("unexpected status " + r.statusCode());`,
        },
        {
          mistake: 'Creating a new HttpClient for every request.',
          why: 'Each client has its own connection pool and threads; you lose keep-alive and HTTP/2 multiplexing and may exhaust resources.',
          fix: 'Create one client and reuse it; it is thread-safe.',
        },
        {
          mistake: 'Retrying every failed request.',
          why: 'A timed-out POST may already have been processed; retrying can duplicate orders or payments, and aggressive retries amplify outages.',
          fix: 'Retry only idempotent requests (or use idempotency keys), with a small attempt limit and exponential backoff with jitter.',
        },
      ],
      checks: [
        {
          id: 'io2-c1',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'The server answers 404. What does the client print?',
          code: `import com.sun.net.httpserver.HttpServer;
import java.net.*;
import java.net.http.*;

public class Main {
    public static void main(String[] args) throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress(InetAddress.getLoopbackAddress(), 0), 0);
        server.createContext("/users", exchange -> {
            exchange.sendResponseHeaders(404, -1);
            exchange.close();
        });
        server.start();
        try {
            HttpClient client = HttpClient.newBuilder().version(HttpClient.Version.HTTP_1_1).build();
            URI uri = URI.create("http://127.0.0.1:" + server.getAddress().getPort() + "/users/42");
            HttpResponse<String> r = client.send(HttpRequest.newBuilder(uri).build(), HttpResponse.BodyHandlers.ofString());
            System.out.println("status=" + r.statusCode() + " body=[" + r.body() + "]");
        } catch (Exception e) {
            System.out.println("exception: " + e.getClass().getSimpleName());
        } finally {
            server.stop(0);
        }
    }
}`,
          options: [
            { id: 'a', text: 'status=404 body=[]' },
            { id: 'b', text: 'exception: FileNotFoundException' },
            { id: 'c', text: 'exception: IOException' },
            { id: 'd', text: 'status=404 body=[null]' },
          ],
          correctOptionId: 'a',
          explanation: 'HttpClient never throws for HTTP status codes; a 404 is a normal response. (The legacy HttpURLConnection threw FileNotFoundException from getInputStream for 404, which is where this misconception comes from.) The empty body is an empty string, not null.',
        },
        {
          id: 'io2-c2',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'What timeout applies to `client.send(request, ...)` if neither the client nor the request configured one?',
          options: [
            { id: 'a', text: '30 seconds' },
            { id: 'b', text: 'None: the call can wait indefinitely' },
            { id: 'c', text: 'The JVM-wide socket timeout of 60 seconds' },
            { id: 'd', text: 'It depends on the HTTP version' },
          ],
          correctOptionId: 'b',
          explanation: 'Both connectTimeout and the per-request timeout are unset by default. Always set them for calls to other services.',
        },
        {
          id: 'io2-c3',
          kind: 'multi-select',
          dimension: 'coding',
          prompt: 'Which practices are correct for java.net.http.HttpClient? Select all that apply.',
          options: [
            { id: 'a', text: 'Share one HttpClient instance across threads and requests' },
            { id: 'b', text: 'Check statusCode() before parsing the body' },
            { id: 'c', text: 'Set a timeout on every HttpRequest' },
            { id: 'd', text: 'Build a new HttpClient inside every request method to keep things isolated' },
            { id: 'e', text: 'Use sendAsync and join the futures to run independent calls concurrently' },
          ],
          correctOptionIds: ['a', 'b', 'c', 'e'],
          explanation: 'HttpClient is thread-safe and pools connections, so creating one per request wastes resources. Status checks and timeouts are essential; sendAsync (or send on virtual threads) runs calls concurrently.',
        },
        {
          id: 'io2-c4',
          kind: 'mcq',
          dimension: 'interview',
          prompt: 'A POST /payments call times out after 5 seconds. Which response is safest?',
          options: [
            { id: 'a', text: 'Immediately retry the same POST up to 10 times' },
            { id: 'b', text: 'Retry only if the request carries an idempotency key the server uses to deduplicate; otherwise check the payment status before trying again' },
            { id: 'c', text: 'Assume the payment failed and tell the customer to pay again' },
            { id: 'd', text: 'Increase the timeout to 10 minutes' },
          ],
          correctOptionId: 'b',
          explanation: 'A timeout means "unknown outcome": the server may have processed the payment. Retries are safe only for idempotent operations, which idempotency keys provide for POST.',
        },
      ],
      challengeIds: [],
      masteryCriteria: [
        'Build and reuse an HttpClient with connect and request timeouts.',
        'Use send and sendAsync, and keep concurrent results in a deterministic order.',
        'Handle status codes explicitly and distinguish them from transport exceptions.',
        'Explain when retries are safe and how idempotency keys help.',
      ],
      relatedLessonIds: ['io-files', 'cc-threads', 'e-design'],
      revision: [
        { id: 'r1', question: 'Does HttpClient throw for a 500 response?', answer: 'No. Every HTTP status is returned as a normal HttpResponse; only transport problems (connect failure, timeout, reset) throw IOException.' },
        { id: 'r2', question: 'Which two timeouts should you set?', answer: 'connectTimeout on the HttpClient builder and timeout(...) on each HttpRequest. Neither has a default.' },
        { id: 'r3', question: 'What does sendAsync return?', answer: 'A CompletableFuture<HttpResponse<T>>; failures surface as CompletionException wrapping the IOException.' },
        { id: 'r4', question: 'When is it safe to retry a request?', answer: 'When it is idempotent (GET, PUT, DELETE, or POST with an idempotency key), with limited attempts and backoff.' },
      ],
    },
  ],
};
