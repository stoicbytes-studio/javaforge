import type { CurriculumModule } from '@/types/curriculum';

export const exceptionsModule: CurriculumModule = {
  id: 'exceptions',
  order: 5,
  title: 'Exception Handling and Defensive Programming',
  shortTitle: 'Exceptions',
  summary: 'The exception hierarchy, checked vs unchecked, try-with-resources, and designing failure handling that helps rather than hides.',
  level: 'core',
  prerequisites: ['oop'],
  bossChallengeId: 'boss-config-loader',
  lessons: [
    // -----------------------------------------------------------------------
    {
      id: 'e-basics',
      moduleId: 'exceptions',
      title: 'The exception hierarchy, try/catch/finally and stack traces',
      summary: 'What exceptions are, checked vs unchecked, how control flows through try/catch/finally, and how to read a stack trace.',
      estimatedMinutes: 30,
      difficulty: 'beginner',
      prerequisites: ['o-inheritance'],
      versionNotes: [
        { feature: 'Multi-catch (catch (A | B e))', since: 8, note: 'Available since Java 7' },
        { feature: 'Helpful NullPointerException messages', since: 17, note: 'JEP 358, on by default since Java 15' },
      ],
      objectives: [
        'Classify exceptions as checked, unchecked or errors.',
        'Trace control flow through try/catch/finally.',
        'Order catch blocks correctly and use multi-catch.',
        'Read a stack trace including "Caused by" sections.',
      ],
      plainEnglish: `An **exception** is Java's way of saying "something went wrong and I cannot continue normally". When one is **thrown**, Java stops the current code and jumps to the nearest matching \`catch\` block up the call stack. If nobody catches it, the thread ends and the stack trace is printed.

A \`finally\` block always runs — whether the \`try\` finished normally, returned early or threw — which makes it the place for clean-up.`,
      technical: `### The hierarchy
\`\`\`
Throwable
├── Error                (serious JVM problems: OutOfMemoryError, StackOverflowError)
└── Exception
    ├── RuntimeException (unchecked: NullPointerException, IllegalArgumentException, ...)
    └── everything else  (checked: IOException, SQLException, ...)
\`\`\`
**Checked** exceptions must be caught or declared with \`throws\` — the compiler enforces it. **Unchecked** exceptions (RuntimeException and subclasses) and Errors need not be declared. Do not catch Errors in normal code; the JVM may be in an unusable state.

### Control flow
- The first \`catch\` whose type matches (including subtypes) handles the exception; later catches are skipped.
- A catch for a superclass before its subclass makes the subclass catch unreachable — a compile error.
- Multi-catch \`catch (IOException | SQLException e)\` handles unrelated types the same way; \`e\` is implicitly final.
- \`finally\` runs after try/catch on every path, including \`return\`. It does not run if the JVM halts (\`System.exit\`, power loss).
- A \`return\` value is evaluated before \`finally\` runs; changing a returned local variable in finally does not change the returned primitive.

### Stack traces
The first line is the exception type and message; each \`at\` line is a frame, innermost first. \`Caused by:\` sections show wrapped exceptions; the **last** "Caused by" is usually the root cause. Since Java 15, NullPointerException messages say exactly which reference was null ("Cannot invoke \\"String.length()\\" because \\"name\\" is null").

### Cost
Creating an exception captures the stack trace, which is relatively expensive. Exceptions are for exceptional situations, not ordinary control flow.`,
      whyItExists: `Exceptions separate the happy path from error handling and force failures to be dealt with somewhere instead of being silently ignored like error return codes. Checked exceptions document recoverable failures in method signatures.`,
      whenToUse: [
        'Throw an exception when a method cannot fulfil its contract.',
        'Catch an exception where you can actually handle it: retry, fall back, or translate it for the caller.',
        'Use finally (or better, try-with-resources) for clean-up.',
      ],
      whenNotToUse: [
        'Do not catch Exception or Throwable broadly just to make code compile.',
        'Do not use exceptions for normal control flow such as loop termination.',
        'Do not catch Errors like OutOfMemoryError in application code.',
      ],
      examples: [
        {
          id: 'flow',
          title: 'try, catch, finally and return',
          runnable: true,
          code: `public class Main {
    static int parsePort(String text) {
        try {
            int port = Integer.parseInt(text);
            if (port < 1 || port > 65_535) {
                throw new IllegalArgumentException("port out of range: " + port);
            }
            return port;
        } catch (NumberFormatException e) {
            System.out.println("  not a number: " + text);
            return -1;
        } finally {
            System.out.println("  checked " + text);
        }
    }

    public static void main(String[] args) {
        System.out.println("-> " + parsePort("8080"));
        System.out.println("-> " + parsePort("http"));
        try {
            parsePort("70000");
        } catch (IllegalArgumentException e) {
            System.out.println("caller handled: " + e.getMessage());
        }
    }
}`,
          expectedOutput: `  checked 8080
-> 8080
  not a number: http
  checked http
-> -1
  checked 70000
caller handled: port out of range: 70000`,
        },
        {
          id: 'helpful-npe',
          title: 'Helpful NullPointerException messages',
          runnable: true,
          code: `public class Main {
    record Customer(String name, Address address) {}
    record Address(String city) {}

    public static void main(String[] args) {
        Customer c = new Customer("Ada", null);
        try {
            System.out.println(c.address().city().toUpperCase());
        } catch (NullPointerException e) {
            System.out.println(e.getMessage());
        }
    }
}`,
          expectedOutput: `Cannot invoke "Main$Address.city()" because the return value of "Main$Customer.address()" is null`,
          explanation: 'Since Java 15 the JVM describes exactly which expression was null, which makes chained calls much easier to debug.',
        },
      ],
      walkthrough: {
        exampleId: 'flow',
        steps: [
          { lines: [18, 18], text: '"8080" parses and is in range, so `return port` is reached — but finally runs before the method actually returns, printing "checked 8080" first.' },
          { lines: [9, 11], text: '"http" makes parseInt throw NumberFormatException; this catch handles it and returns -1.' },
          { lines: [12, 14], text: 'finally runs on that path too, after the catch block.' },
          { lines: [5, 7], text: '"70000" parses but is out of range, so we throw IllegalArgumentException. No catch in parsePort matches it.' },
          { lines: [20, 24], text: 'finally still runs, then the exception propagates to main, which catches it.' },
        ],
      },
      realWorld: {
        title: 'The job that "succeeded" while losing data',
        scenario: `A nightly import wrapped its loop body in \`try { ... } catch (Exception e) { }\`. When a supplier changed their date format, every row threw a parse exception that was silently swallowed. The job reported success with zero rows imported for a week.

The fix: catch only the expected exception (\`DateTimeParseException\`), record the failing row number and reason, and fail the job if more than a threshold of rows fail. Monitoring now alerts on the error count instead of trusting a green status.`,
      },
      commonMistakes: [
        {
          mistake: 'Empty catch blocks.',
          why: 'The failure disappears; the program continues in a broken state and nobody knows why.',
          fix: 'Handle it, rethrow it (wrapped if needed), or at minimum log it with context.',
        },
        {
          mistake: 'Catching Exception when you meant a specific type.',
          why: 'It also catches programming errors such as NullPointerException that should surface.',
          fix: 'Catch the narrowest type you can actually handle.',
        },
        {
          mistake: 'Losing the original exception when rethrowing.',
          why: '`throw new ServiceException("failed")` discards the root cause and its stack trace.',
          fix: 'Pass the cause: `throw new ServiceException("failed", e)`.',
        },
      ],
      checks: [
        {
          id: 'e1-c1',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this print?',
          code: `public class Main {
    static String run() {
        try {
            System.out.println("try");
            return "returned";
        } finally {
            System.out.println("finally");
        }
    }

    public static void main(String[] args) {
        System.out.println(run());
    }
}`,
          options: [
            { id: 'a', text: 'try\nreturned' },
            { id: 'b', text: 'try\nfinally\nreturned' },
            { id: 'c', text: 'try\nreturned\nfinally' },
            { id: 'd', text: 'finally\ntry\nreturned' },
          ],
          correctOptionId: 'b',
          explanation: 'The return value is computed, finally runs, and only then does the method return to main, which prints it.',
        },
        {
          id: 'e1-c2',
          kind: 'predict-output',
          dimension: 'conceptual',
          prompt: 'What happens when you compile this?',
          code: `import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;

public class Main {
    public static void main(String[] args) {
        try {
            new FileReader("missing.txt").close();
        } catch (IOException e) {
            System.out.println("io");
        } catch (FileNotFoundException e) {
            System.out.println("not found");
        }
    }
}`,
          options: [
            { id: 'a', text: 'not found' },
            { id: 'b', text: 'io' },
            { id: 'c', text: 'Compile error: exception FileNotFoundException has already been caught' },
          ],
          correctOptionId: 'c',
          expectCompileError: true,
          explanation: 'FileNotFoundException is a subclass of IOException, so the second catch is unreachable. Put the more specific catch first.',
        },
        {
          id: 'e1-c3',
          kind: 'multi-select',
          dimension: 'conceptual',
          prompt: 'Which of these are checked exceptions? Select all that apply.',
          options: [
            { id: 'a', text: 'java.io.IOException' },
            { id: 'b', text: 'java.lang.IllegalArgumentException' },
            { id: 'c', text: 'java.sql.SQLException' },
            { id: 'd', text: 'java.lang.NullPointerException' },
            { id: 'e', text: 'java.lang.OutOfMemoryError' },
            { id: 'f', text: 'java.lang.InterruptedException' },
          ],
          correctOptionIds: ['a', 'c', 'f'],
          explanation: 'IllegalArgumentException and NullPointerException extend RuntimeException (unchecked). OutOfMemoryError is an Error, also unchecked.',
        },
        {
          id: 'e1-c4',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this print?',
          code: `public class Main {
    static int counter() {
        int x = 1;
        try {
            return x;
        } finally {
            x = 99;
        }
    }

    public static void main(String[] args) {
        System.out.println(counter());
    }
}`,
          options: [
            { id: 'a', text: '1' },
            { id: 'b', text: '99' },
            { id: 'c', text: 'Compile error' },
          ],
          correctOptionId: 'a',
          explanation: 'The return value (1) is saved before finally runs. Assigning to the local x afterwards does not change the saved value.',
          hints: ['When exactly is the return expression evaluated?'],
        },
        {
          id: 'e1-c5',
          kind: 'mcq',
          dimension: 'debugging',
          prompt: 'A stack trace shows `ServiceException`, then `Caused by: RepositoryException`, then `Caused by: java.net.SocketTimeoutException`. Where should you start investigating?',
          options: [
            { id: 'a', text: 'ServiceException, because it is printed first' },
            { id: 'b', text: 'The last Caused by — SocketTimeoutException is the root cause' },
            { id: 'c', text: 'The middle exception' },
            { id: 'd', text: 'The thread name' },
          ],
          correctOptionId: 'b',
          explanation: 'Each layer wraps the one below. The innermost cause (printed last) is what actually failed: a network timeout.',
        },
      ],
      challengeIds: ['ch-safe-parse'],
      masteryCriteria: [
        'Classify any exception type as checked, unchecked or error.',
        'Predict output of try/catch/finally with returns.',
        'Find the root cause in a multi-level stack trace.',
      ],
      relatedLessonIds: ['e-resources', 'e-design'],
      revision: [
        { id: 'r1', question: 'Checked vs unchecked exceptions?', answer: 'Checked (Exception but not RuntimeException) must be caught or declared; unchecked (RuntimeException subclasses and Errors) need not be.' },
        { id: 'r2', question: 'When does finally not run?', answer: 'Only when the JVM stops: System.exit, a crash or the process being killed. It runs on normal completion, return, break/continue and exceptions.' },
        { id: 'r3', question: 'Which "Caused by" in a stack trace is usually the root cause?', answer: 'The last (innermost) one.' },
      ],
    },

    // -----------------------------------------------------------------------
    {
      id: 'e-resources',
      moduleId: 'exceptions',
      title: 'try-with-resources, suppressed exceptions and finally pitfalls',
      summary: 'Closing resources reliably, the order resources close in, and how exceptions can be lost.',
      estimatedMinutes: 25,
      difficulty: 'intermediate',
      prerequisites: ['e-basics'],
      versionNotes: [
        { feature: 'try-with-resources', since: 8, note: 'Available since Java 7' },
        { feature: 'Effectively final variables as resources', since: 9 },
      ],
      objectives: [
        'Use try-with-resources for anything AutoCloseable.',
        'Predict resource close order and suppressed exceptions.',
        'Avoid finally blocks that swallow exceptions.',
      ],
      plainEnglish: `Files, database connections and network sockets must be **closed** when you are done, or the program slowly runs out of them. Writing \`close()\` in a \`finally\` block is easy to get wrong.

**try-with-resources** does it for you: declare the resource in parentheses after \`try\`, and Java closes it automatically, even if an exception is thrown.`,
      technical: `### Mechanics
\`try (A a = ...; B b = ...) { body }\` works with any \`AutoCloseable\` (\`Closeable\` is the I/O subtype whose close throws IOException). Resources are closed in **reverse** order of declaration, after the body and before any catch/finally of the same statement. Since Java 9 you can list an existing effectively final variable: \`try (connection) { ... }\`.

### Suppressed exceptions
If the body throws and then \`close()\` also throws, the close exception is **suppressed**: attached to the primary exception (\`getSuppressed()\`) rather than replacing it. The pre-Java-7 pattern of closing in finally lost the original exception in exactly this situation.

### Finally pitfalls
- A \`return\` (or \`throw\`) inside \`finally\` discards any exception from the try block — the failure vanishes.
- An exception thrown from \`finally\` replaces the original.
- Null checks are needed when closing manually; try-with-resources skips closing resources that were null.

### Resource leaks
Unclosed resources hold OS file descriptors, sockets or pooled connections. Symptoms appear later and elsewhere: "Too many open files", or a connection pool timing out because every connection is checked out.`,
      whyItExists: `Manual close-in-finally code was verbose, easy to get wrong and lost exceptions. try-with-resources makes the correct pattern the shortest one.`,
      whenToUse: [
        'Use try-with-resources for streams, readers, JDBC connections/statements/result sets, sockets and locks wrapped as AutoCloseable.',
        'Implement AutoCloseable on your own classes that hold resources.',
      ],
      whenNotToUse: [
        'Do not wrap resources whose lifecycle is managed elsewhere (e.g. System.out, a pooled resource owned by a framework).',
        'Do not return or throw from finally.',
      ],
      examples: [
        {
          id: 'twr',
          title: 'Close order and suppressed exceptions',
          runnable: true,
          code: `class Resource implements AutoCloseable {
    private final String name;
    private final boolean failOnClose;

    Resource(String name, boolean failOnClose) {
        this.name = name;
        this.failOnClose = failOnClose;
        System.out.println("open " + name);
    }

    @Override
    public void close() {
        System.out.println("close " + name);
        if (failOnClose) throw new IllegalStateException("close failed: " + name);
    }
}

public class Main {
    public static void main(String[] args) {
        try (Resource a = new Resource("A", false);
             Resource b = new Resource("B", true)) {
            System.out.println("using A and B");
            throw new RuntimeException("work failed");
        } catch (RuntimeException e) {
            System.out.println("caught: " + e.getMessage());
            for (Throwable s : e.getSuppressed()) {
                System.out.println("suppressed: " + s.getMessage());
            }
        }
    }
}`,
          expectedOutput: `open A
open B
using A and B
close B
close A
caught: work failed
suppressed: close failed: B`,
        },
        {
          id: 'swallow',
          title: 'return in finally swallows exceptions',
          runnable: true,
          code: `public class Main {
    @SuppressWarnings("finally")
    static int risky() {
        try {
            throw new IllegalStateException("this failure is lost");
        } finally {
            return 42;
        }
    }

    public static void main(String[] args) {
        System.out.println(risky());
    }
}`,
          expectedOutput: `42`,
          explanation: 'The exception never reaches the caller. javac -Xlint warns "finally clause cannot complete normally" — treat that warning as an error.',
        },
      ],
      walkthrough: {
        exampleId: 'twr',
        steps: [
          { lines: [20, 21], text: 'Resources are opened in declaration order: A, then B.' },
          { lines: [22, 23], text: 'The body throws RuntimeException("work failed") — this is the primary exception.' },
          { lines: [11, 15], text: 'Before the catch runs, resources close in reverse order. B.close() throws.' },
          { lines: [11, 13], text: 'A is still closed even though B\'s close failed.' },
          { lines: [24, 28], text: 'The catch receives the primary exception; B\'s close failure is attached as a suppressed exception instead of replacing it.' },
        ],
      },
      realWorld: {
        title: 'Connection pool exhaustion every Monday',
        scenario: `A reporting endpoint opened a JDBC \`Connection\` and closed it at the end of the method — but not when a query threw. Most of the week this went unnoticed; on Monday mornings a slow upstream table caused timeouts, each leaking a connection. After ten failures the pool (size 10) was empty and every endpoint in the service hung waiting for a connection.

Converting to \`try (Connection c = ds.getConnection(); PreparedStatement ps = ...; ResultSet rs = ...)\` closed everything on every path. Enabling the pool's leak detection (e.g. HikariCP \`leakDetectionThreshold\`) now reports any connection held too long, with the stack trace of where it was borrowed.`,
      },
      commonMistakes: [
        {
          mistake: 'Closing resources only on the happy path.',
          why: 'Any exception before close() leaks the resource.',
          fix: 'Use try-with-resources.',
        },
        {
          mistake: 'Returning from finally.',
          why: 'It silently discards exceptions thrown in try or catch.',
          fix: 'Return from try; keep finally for clean-up only.',
        },
        {
          mistake: 'Ignoring suppressed exceptions in logs.',
          why: 'They often explain secondary failures (e.g. a broken connection during rollback).',
          fix: 'Log the full exception; standard stack trace printing includes "Suppressed:" entries.',
        },
      ],
      checks: [
        {
          id: 'e2-c1',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this print?',
          code: `class R implements AutoCloseable {
    private final String id;
    R(String id) { this.id = id; }
    public void close() { System.out.print(id); }
}

public class Main {
    public static void main(String[] args) {
        try (R one = new R("1"); R two = new R("2"); R three = new R("3")) {
            System.out.print("body ");
        } finally {
            System.out.println(" done");
        }
    }
}`,
          options: [
            { id: 'a', text: 'body 123 done' },
            { id: 'b', text: 'body 321 done' },
            { id: 'c', text: '321body  done' },
            { id: 'd', text: 'body  done321' },
          ],
          correctOptionId: 'b',
          explanation: 'Resources close in reverse declaration order, and they close before the finally block of the same try statement runs.',
        },
        {
          id: 'e2-c2',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this print?',
          code: `public class Main {
    static void work() throws Exception {
        try {
            throw new Exception("primary");
        } finally {
            throw new Exception("from finally");
        }
    }

    public static void main(String[] args) {
        try {
            work();
        } catch (Exception e) {
            System.out.println(e.getMessage() + " / suppressed=" + e.getSuppressed().length);
        }
    }
}`,
          options: [
            { id: 'a', text: 'primary / suppressed=1' },
            { id: 'b', text: 'from finally / suppressed=0' },
            { id: 'c', text: 'primary / suppressed=0' },
            { id: 'd', text: 'from finally / suppressed=1' },
          ],
          correctOptionId: 'b',
          explanation: 'An exception thrown from a plain finally block replaces the original, which is lost entirely. Only try-with-resources records suppressed exceptions automatically.',
        },
        {
          id: 'e2-c3',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'What does a type need to be usable in try-with-resources?',
          options: [
            { id: 'a', text: 'It must extend java.io.InputStream' },
            { id: 'b', text: 'It must implement AutoCloseable (Closeable extends it)' },
            { id: 'c', text: 'It must be Serializable' },
            { id: 'd', text: 'It must have a finalize() method' },
          ],
          correctOptionId: 'b',
          explanation: 'Any AutoCloseable works, including your own classes and java.util.concurrent locks wrapped in a small adapter.',
        },
        {
          id: 'e2-c4',
          kind: 'mcq',
          dimension: 'debugging',
          prompt: 'A service logs "Too many open files" after running for a few days. What is the most likely cause?',
          options: [
            { id: 'a', text: 'The heap is too small' },
            { id: 'b', text: 'Streams or sockets that are not closed on some code path' },
            { id: 'c', text: 'Too many threads' },
            { id: 'd', text: 'A slow garbage collector' },
          ],
          correctOptionId: 'b',
          explanation: 'Each open file or socket uses an OS file descriptor. Leaked descriptors accumulate until the process limit is reached. Garbage collection does not reliably close them.',
        },
      ],
      challengeIds: ['ch-resource-leak'],
      masteryCriteria: [
        'Rewrite manual close-in-finally code with try-with-resources.',
        'Predict close order and suppressed exceptions.',
        'Explain how finally can lose exceptions.',
      ],
      relatedLessonIds: ['e-basics', 'io-files', 'j-jdbc'],
      revision: [
        { id: 'r1', question: 'In what order does try-with-resources close resources?', answer: 'Reverse order of declaration, before the catch/finally of the same try statement.' },
        { id: 'r2', question: 'What is a suppressed exception?', answer: 'An exception thrown by close() while another exception is already propagating; it is attached to the primary exception via getSuppressed() instead of replacing it.' },
        { id: 'r3', question: 'Why must you never return from finally?', answer: 'It discards any exception thrown in the try or catch block, hiding failures.' },
      ],
    },

    // -----------------------------------------------------------------------
    {
      id: 'e-design',
      moduleId: 'exceptions',
      title: 'Designing exceptions and defensive programming',
      summary: 'Custom exceptions, translation and chaining across layers, fail-fast validation, and when to use checked exceptions.',
      estimatedMinutes: 30,
      difficulty: 'intermediate',
      prerequisites: ['e-resources'],
      objectives: [
        'Design custom exceptions that carry useful context.',
        'Translate low-level exceptions at layer boundaries without losing the cause.',
        'Validate inputs early with clear messages.',
        'Decide between checked and unchecked exceptions.',
      ],
      plainEnglish: `Good error handling answers three questions for whoever reads the error later: **what** failed, **why**, and **what was being attempted**.

- Check inputs at the start of a method and fail immediately with a clear message ("fail fast").
- When a low-level problem (a database error) crosses into business code, wrap it in an exception that makes sense at that level, keeping the original as the **cause**.
- Handle an exception once: either deal with it, or pass it on — not log-and-rethrow at every layer.`,
      technical: `### Fail fast
\`Objects.requireNonNull(order, "order")\`, \`IllegalArgumentException\` for invalid arguments, \`IllegalStateException\` for calls at the wrong time. Validation at the boundary keeps corrupted data from travelling deep into the system where failures are harder to diagnose.

### Custom exceptions
Create them when callers need to react differently (\`InsufficientFundsException\`) or when they carry structured context (order id, limit). Extend \`RuntimeException\` for most application errors; keep the hierarchy small. Always provide a constructor taking a \`cause\`.

### Translation and chaining
A repository should not leak \`SQLException\` to the web layer. Catch it at the boundary and throw a domain exception **with the cause**: \`throw new RepositoryException("loading order " + id, e)\`. The stack trace then shows both levels.

### Checked or unchecked?
Checked exceptions suit **recoverable** conditions the caller is expected to handle at the call site (a file the user chose does not exist). Most modern frameworks (Spring, JPA) use unchecked exceptions because most failures cannot be handled locally and checked exceptions don't compose with lambdas/streams. Whatever you choose, be consistent within a layer.

### Logging
Log an exception once, at the point where it is handled (or at the top-level boundary), with context. Logging and rethrowing at every layer produces duplicate stack traces that bury the signal.

### Absence is not an exception
"Customer not found" in a search is an expected outcome — return \`Optional\` or an empty result. "Order id from our own database not found" is exceptional.`,
      whyItExists: `Error handling is part of an API's design. Clear, layered exceptions make failures diagnosable from logs alone, which is what you have during a production incident.`,
      whenToUse: [
        'Validate public method arguments at the start of the method.',
        'Translate exceptions at module or layer boundaries.',
        'Use custom exceptions when callers must distinguish failure kinds.',
      ],
      whenNotToUse: [
        'Do not create one exception class per method.',
        'Do not use exceptions for expected outcomes like "no search results".',
        'Do not catch-log-rethrow at every layer.',
      ],
      examples: [
        {
          id: 'translation',
          title: 'Exception translation with chaining',
          runnable: true,
          code: `import java.sql.SQLException;
import java.util.Objects;

class OrderNotFoundException extends RuntimeException {
    OrderNotFoundException(String orderId) {
        super("Order not found: " + orderId);
    }
}

class RepositoryException extends RuntimeException {
    RepositoryException(String message, Throwable cause) {
        super(message, cause);
    }
}

class OrderRepository {
    String findStatus(String orderId) {
        Objects.requireNonNull(orderId, "orderId");
        try {
            return query(orderId);
        } catch (SQLException e) {
            throw new RepositoryException("Failed to load order " + orderId, e);
        }
    }

    private String query(String orderId) throws SQLException {
        if (orderId.equals("timeout")) throw new SQLException("Connection timed out", "08S01");
        if (orderId.equals("A-1")) return "SHIPPED";
        throw new OrderNotFoundException(orderId);
    }
}

public class Main {
    public static void main(String[] args) {
        OrderRepository repo = new OrderRepository();
        System.out.println(repo.findStatus("A-1"));
        for (String id : new String[] {"B-9", "timeout", null}) {
            try {
                repo.findStatus(id);
            } catch (OrderNotFoundException e) {
                System.out.println("404: " + e.getMessage());
            } catch (RepositoryException e) {
                SQLException cause = (SQLException) e.getCause();
                System.out.println("503: " + e.getMessage() + " (cause: " + cause.getMessage() + ", SQLState " + cause.getSQLState() + ")");
            } catch (NullPointerException e) {
                System.out.println("400: " + e.getMessage());
            }
        }
    }
}`,
          expectedOutput: `SHIPPED
404: Order not found: B-9
503: Failed to load order timeout (cause: Connection timed out, SQLState 08S01)
400: orderId`,
        },
      ],
      walkthrough: {
        exampleId: 'translation',
        steps: [
          { lines: [17, 18], text: 'Fail fast: a null id is rejected immediately with a message naming the parameter.' },
          { lines: [19, 23], text: 'The checked SQLException from the data layer is caught at the repository boundary and translated, keeping it as the cause.' },
          { lines: [26, 30], text: '"Not found" is a domain condition with its own exception type that callers can map to a 404.' },
          { lines: [38, 47], text: 'The caller maps each failure kind to a different response. The original SQLException and its SQLState are still available through getCause().' },
        ],
      },
      realWorld: {
        title: 'An outage diagnosed from one log line',
        scenario: `During an incident, an API returned 500s with the log message \`ServiceException: Failed to price basket 8812\` followed by \`Caused by: RepositoryException: Failed to load tariff EU-STD\` and \`Caused by: SQLTransientConnectionException: HikariPool-1 - Connection is not available, request timed out after 30000ms\`.

Because each layer translated the exception **with its cause and context**, the on-call engineer saw immediately that the database pool was exhausted, not the pricing logic — and went straight to the pool metrics. Contrast this with a team whose logs only said "Error occurred".`,
      },
      commonMistakes: [
        {
          mistake: 'Wrapping without the cause: `throw new MyException(e.getMessage())`.',
          why: 'The original stack trace and type are lost.',
          fix: 'Pass the exception itself as the cause.',
        },
        {
          mistake: 'Logging and rethrowing at every layer.',
          why: 'The same failure appears many times in logs, hiding the real signal.',
          fix: 'Log once where it is handled or at the request boundary.',
        },
        {
          mistake: 'Vague messages such as "Invalid input".',
          why: 'They do not say which input or why.',
          fix: 'Include the value and the rule: "quantity must be 1–100 but was 0".',
        },
      ],
      checks: [
        {
          id: 'e3-c1',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'A DAO catches SQLException. What should it usually do?',
          options: [
            { id: 'a', text: 'Swallow it and return null' },
            { id: 'b', text: 'Throw a data-access exception that keeps the SQLException as its cause' },
            { id: 'c', text: 'Print the stack trace and continue' },
            { id: 'd', text: 'Call System.exit(1)' },
          ],
          correctOptionId: 'b',
          explanation: 'Translation hides the JDBC detail from callers while preserving the diagnostic information.',
        },
        {
          id: 'e3-c2',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'What does this print?',
          code: `public class Main {
    public static void main(String[] args) {
        Exception root = new IllegalStateException("disk full");
        Exception mid = new RuntimeException("save failed", root);
        Exception top = new RuntimeException("request failed", mid);

        Throwable t = top;
        while (t.getCause() != null) t = t.getCause();
        System.out.println(t.getClass().getSimpleName() + ": " + t.getMessage());
    }
}`,
          options: [
            { id: 'a', text: 'RuntimeException: request failed' },
            { id: 'b', text: 'RuntimeException: save failed' },
            { id: 'c', text: 'IllegalStateException: disk full' },
            { id: 'd', text: 'NullPointerException' },
          ],
          correctOptionId: 'c',
          explanation: 'Following getCause() until it is null reaches the root cause.',
        },
        {
          id: 'e3-c3',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'A user search for a customer by email finds nothing. How should `findByEmail` signal that?',
          options: [
            { id: 'a', text: 'Throw CustomerNotFoundException' },
            { id: 'b', text: 'Return Optional.empty()' },
            { id: 'c', text: 'Return null and document it' },
            { id: 'd', text: 'Throw RuntimeException("no customer")' },
          ],
          correctOptionId: 'b',
          explanation: 'Absence is an expected outcome of a search. Optional makes it explicit in the signature and forces callers to handle it.',
        },
        {
          id: 'e3-c4',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'Which validation message is most useful in a production log?',
          options: [
            { id: 'a', text: '"Error"' },
            { id: 'b', text: '"Invalid argument"' },
            { id: 'c', text: '"quantity must be between 1 and 100 but was 0 (orderId=8812)"' },
            { id: 'd', text: '"Something went wrong, please try again"' },
          ],
          correctOptionId: 'c',
          explanation: 'It states the rule, the actual value and the context, so the problem can be understood without reproducing it.',
        },
      ],
      challengeIds: [],
      masteryCriteria: [
        'Design a small exception hierarchy for a service.',
        'Translate exceptions at a boundary while preserving the cause.',
        'Argue checked vs unchecked for a given failure.',
      ],
      relatedLessonIds: ['e-basics', 'fn-optional-modern', 'j-jdbc'],
      revision: [
        { id: 'r1', question: 'What is exception translation?', answer: 'Catching a low-level exception at a layer boundary and throwing one meaningful to the caller\'s layer, with the original as the cause.' },
        { id: 'r2', question: 'When are checked exceptions appropriate?', answer: 'For recoverable conditions the immediate caller is expected to handle. Most application failures that cannot be handled locally are better as unchecked exceptions.' },
        { id: 'r3', question: 'Why log an exception only once?', answer: 'Logging at every layer duplicates stack traces and buries the useful signal. Log where it is handled or at the top-level boundary.' },
      ],
    },
  ],
};
