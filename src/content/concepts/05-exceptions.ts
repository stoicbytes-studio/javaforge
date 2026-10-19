import type { LessonConcepts } from '@/types/curriculum';

/** Concept pages for module 5 (Exception Handling and Defensive Programming), keyed by lesson id. */
export const exceptionsConcepts: Record<string, LessonConcepts> = {
  // -------------------------------------------------------------------------
  'e-basics': {
    interviewDefinition:
      'An exception is an object of a `Throwable` subclass that is **thrown** to abandon normal flow; the JVM then **unwinds the call stack** until a matching `catch` handles it. `Error`s signal serious JVM-level failures. `Exception`s are either **checked** — the compiler requires them to be caught or declared with `throws` — or **unchecked** (`RuntimeException` subclasses), which usually indicate bugs. `finally` runs on every exit path, which makes it the classic place for clean-up.',
    interviewFollowUps: [
      {
        question: 'What is the difference between `throw` and `throws`?',
        answer: '`throw` is a statement that throws an exception object now: `throw new IllegalStateException("closed")`. `throws` is part of a method signature that declares which checked exceptions the method may let escape, so callers know to handle them.',
      },
      {
        question: 'What happens to an exception nobody catches?',
        answer: 'It unwinds to the top of the thread\'s stack, the thread\'s `UncaughtExceptionHandler` runs (the default prints the stack trace to System.err) and that thread ends. If it was the main thread and no other non-daemon threads are running, the JVM exits with a non-zero status.',
      },
      {
        question: 'Does the JVM enforce checked exceptions?',
        answer: 'No — only the Java compiler does. Bytecode can throw any Throwable without declaring it, which is why Kotlin and Scala have no checked exceptions and why reflection wraps target exceptions in `InvocationTargetException`.',
      },
      {
        question: 'Should you ever catch `Error` or `Throwable`?',
        answer: 'Only at a top-level boundary (a thread\'s run loop, a request dispatcher) to log and fail cleanly. Application code should not try to recover from `OutOfMemoryError` or `StackOverflowError`: the JVM may be in an inconsistent state.',
      },
    ],
    mnemonic: {
      device: '"Catch or Declare" — unless it is Runtime or an Error',
      expansion: [
        { key: 'Checked (Exception)', meaning: 'Must be caught, or declared with throws — the compiler insists' },
        { key: 'Runtime (RuntimeException)', meaning: 'Unchecked: usually a bug; handling is optional' },
        { key: 'Error', meaning: 'The JVM is in trouble: do not catch it in normal code' },
        { key: 'Finally', meaning: 'Runs on every way out of the try: normal, return or throw' },
      ],
      visual: 'Passport control: travellers with checked exceptions need papers (a catch or a throws clause) before they may pass. RuntimeExceptions walk through the crew lane unchecked, and Errors are the building alarm — everyone just leaves.',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'A fire alarm in an office tower',
        body: 'Someone pulls the alarm on floor 4 (`throw`). Work on that floor stops immediately and the alarm travels up through each floor (stack frames) until it reaches a fire warden trained for that kind of alarm (a matching `catch`). On every floor people still switch off the stove on their way out (`finally`). If no warden responds, the building is evacuated (the thread dies).',
      },
      {
        kind: 'insight',
        title: 'Exceptions are ordinary objects',
        body: 'An exception carries a message, an optional **cause** (another Throwable), a list of **suppressed** exceptions and a **stack trace**. The stack trace is captured when the object is *constructed* (in `fillInStackTrace`), not when it is thrown — so an exception created in one place and thrown elsewhere shows the creation site.',
      },
      {
        kind: 'real-world',
        title: 'Reading a production stack trace',
        body: 'Start at the first line for *what* (type and message), then scan the `at` frames for the first one in your own package — that is usually *where*. Then jump to the last `Caused by:` for the root cause. Lines like `... 42 more` mean the remaining frames are identical to the enclosing trace and were omitted to save space.',
      },
      {
        kind: 'angle',
        title: 'Checked exceptions are a compiler-only feature',
        body: 'Java is almost alone among mainstream languages in having checked exceptions, and the JVM itself knows nothing about them. That is why lambdas cannot throw checked exceptions through `Function`, and why APIs such as `Files.lines` wrap I/O failures in the unchecked `UncheckedIOException` when they must escape a stream.',
      },
    ],
    diagrams: [
      {
        id: 'e-basics-hierarchy',
        kind: 'architecture',
        title: 'The Throwable hierarchy',
        caption: 'Everything throwable extends Throwable. Errors and RuntimeExceptions are unchecked; every other Exception subclass is checked and must be caught or declared.',
        cols: 4,
        rows: 3,
        nodes: [
          { id: 'ebh-throwable', label: 'Throwable', detail: 'message, cause, stack trace', col: 1, row: 0, span: 2, tone: 'neutral' },
          { id: 'ebh-error', label: 'Error', detail: 'OutOfMemoryError, StackOverflowError', col: 0, row: 1, tone: 'danger' },
          { id: 'ebh-exception', label: 'Exception', detail: 'conditions an app may handle', col: 2, row: 1, span: 2, tone: 'primary' },
          { id: 'ebh-runtime', label: 'RuntimeException', detail: 'NPE, IllegalArgument...', col: 2, row: 2, tone: 'accent' },
          { id: 'ebh-checked', label: 'Other Exceptions', detail: 'IOException, SQLException', col: 3, row: 2, tone: 'warning' },
        ],
        edges: [
          { from: 'ebh-error', to: 'ebh-throwable', label: 'extends' },
          { from: 'ebh-exception', to: 'ebh-throwable', label: 'extends' },
          { from: 'ebh-runtime', to: 'ebh-exception' },
          { from: 'ebh-checked', to: 'ebh-exception' },
        ],
        groups: [
          { label: 'Unchecked', fromCol: 0, toCol: 0, fromRow: 1, toRow: 1, tone: 'danger' },
          { label: 'Unchecked', fromCol: 2, toCol: 2, fromRow: 2, toRow: 2, tone: 'accent' },
          { label: 'Checked', fromCol: 3, toCol: 3, fromRow: 2, toRow: 2, tone: 'warning' },
        ],
      },
      {
        id: 'e-basics-control-flow',
        kind: 'flow',
        title: 'Control flow through try / catch / finally',
        caption: 'finally runs on every path. After it, execution either continues after the statement (no exception, or one that was handled) or the exception keeps propagating to the caller.',
        cols: 3,
        rows: 4,
        nodes: [
          { id: 'ebf-try', label: 'try block runs', col: 1, row: 0, tone: 'primary' },
          { id: 'ebf-thrown', label: 'Exception thrown?', col: 1, row: 1, tone: 'warning' },
          { id: 'ebf-match', label: 'Matching catch?', detail: 'first type that fits', col: 2, row: 1, tone: 'warning' },
          { id: 'ebf-catch', label: 'catch block runs', col: 2, row: 2, tone: 'accent' },
          { id: 'ebf-finally', label: 'finally runs', detail: 'always', col: 1, row: 2, tone: 'primary' },
          { id: 'ebf-continue', label: 'Continue after try', col: 0, row: 3, shape: 'pill', tone: 'success' },
          { id: 'ebf-propagate', label: 'Propagate to caller', col: 2, row: 3, shape: 'pill', tone: 'danger' },
        ],
        edges: [
          { from: 'ebf-try', to: 'ebf-thrown' },
          { from: 'ebf-thrown', to: 'ebf-finally', label: 'no' },
          { from: 'ebf-thrown', to: 'ebf-match', label: 'yes' },
          { from: 'ebf-match', to: 'ebf-catch', label: 'yes' },
          { from: 'ebf-match', to: 'ebf-finally', label: 'no' },
          { from: 'ebf-catch', to: 'ebf-finally' },
          { from: 'ebf-finally', to: 'ebf-continue', label: 'handled' },
          { from: 'ebf-finally', to: 'ebf-propagate', label: 'still pending' },
        ],
      },
      {
        id: 'e-basics-unwinding',
        kind: 'concept',
        title: 'Stack unwinding',
        caption: 'parseInt throws; load and process have no matching catch, so their frames are popped one by one until main catches it. The stack trace lists the frames innermost first.',
        cols: 2,
        rows: 4,
        nodes: [
          { id: 'ebu-main', label: 'main()', detail: 'catch (NumberFormat...)', col: 0, row: 0, tone: 'success' },
          { id: 'ebu-process', label: 'process()', detail: 'no catch: frame popped', col: 0, row: 1, tone: 'neutral' },
          { id: 'ebu-load', label: 'load()', detail: 'no catch: frame popped', col: 0, row: 2, tone: 'neutral' },
          { id: 'ebu-parse', label: 'Integer.parseInt()', detail: 'throws NumberFormatException', col: 0, row: 3, tone: 'danger' },
          { id: 'ebu-trace', label: 'Stack trace', detail: 'parseInt, load, process, main', col: 1, row: 3, shape: 'note', tone: 'neutral' },
        ],
        edges: [
          { from: 'ebu-parse', to: 'ebu-load', label: 'unwinds' },
          { from: 'ebu-load', to: 'ebu-process', label: 'unwinds' },
          { from: 'ebu-process', to: 'ebu-main', label: 'caught here' },
          { from: 'ebu-parse', to: 'ebu-trace', label: 'recorded at new', dashed: true },
        ],
        groups: [{ label: 'Call stack (main thread)', fromCol: 0, toCol: 0, fromRow: 0, toRow: 3, tone: 'primary' }],
      },
    ],
    variants: [
      {
        title: 'Exception categories',
        intro: 'Whether a type is checked depends only on where it sits in the hierarchy.',
        items: [
          {
            name: 'Checked exceptions',
            summary: 'Exception subclasses outside RuntimeException: recoverable conditions outside the program\'s control. Must be caught or declared.',
            note: 'IOException, FileNotFoundException, SQLException, InterruptedException, ClassNotFoundException, java.text.ParseException, TimeoutException.',
            code: 'void load(Path p) throws IOException',
          },
          {
            name: 'Unchecked (runtime) exceptions',
            summary: 'RuntimeException and subclasses: programming errors or invalid input. No declaration required.',
            note: 'NullPointerException, IllegalArgumentException, IllegalStateException, ArithmeticException, ArrayIndexOutOfBoundsException, ClassCastException, NumberFormatException, UnsupportedOperationException, ConcurrentModificationException.',
            code: 'throw new IllegalArgumentException("age < 0");',
          },
          {
            name: 'Errors',
            summary: 'Error and subclasses: serious problems the application should not try to handle. Unchecked.',
            note: 'OutOfMemoryError, StackOverflowError, NoClassDefFoundError, ExceptionInInitializerError, AssertionError.',
          },
        ],
      },
      {
        title: 'Ways to handle an exception',
        items: [
          { name: 'try / catch', summary: 'Handle the failure where you can recover or respond.', support: 'supported', code: 'try { parse(s); }\ncatch (NumberFormatException e) { use(0); }' },
          { name: 'try / catch / finally', summary: 'Plus clean-up that runs on every path.', support: 'supported', code: 'try { ... } catch (IOException e) { ... }\nfinally { lock.unlock(); }' },
          { name: 'Multi-catch (Java 7)', summary: 'One handler for unrelated types; the variable is implicitly final.', support: 'supported', code: 'catch (IOException | SQLException e)' },
          { name: 'try-with-resources (Java 7)', summary: 'Automatic close of AutoCloseable resources.', support: 'supported', code: 'try (var in = Files.newInputStream(p)) { ... }' },
          { name: 'Declare with throws', summary: 'Let a checked exception propagate to a caller better placed to handle it.', support: 'supported', code: 'String read(Path p) throws IOException' },
          { name: 'Rethrow', summary: 'Do something (e.g. roll back), then rethrow the same exception.', support: 'supported', code: 'catch (Exception e) { tx.rollback(); throw e; }' },
          { name: 'Wrap (translate) and rethrow', summary: 'Throw a higher-level exception that keeps the original as its cause.', support: 'supported', code: 'catch (SQLException e) {\n  throw new RepositoryException("load " + id, e);\n}' },
        ],
      },
    ],
    deepDive: [
      {
        title: 'try/catch is free until something is thrown',
        body: 'A `try` block compiles to an **exception table** in the method\'s bytecode: ranges of instructions, a handler address and a catch type. Nothing executes when entering a try, so the happy path costs nothing. When an exception is thrown, the JVM searches the current method\'s table, then pops the frame and searches the caller\'s. `finally` has no special instruction: `javac` copies the finally code onto every exit path, plus a catch-any handler that runs it and rethrows.',
        sources: [
          { label: 'JVM Specification §3.12: Throwing and Handling Exceptions', url: 'https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-3.html#jvms-3.12' },
          { label: 'JVM Specification §3.13: Compiling finally', url: 'https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-3.html#jvms-3.13' },
        ],
      },
      {
        title: 'The NullPointerException with no stack trace',
        body: 'HotSpot\'s `OmitStackTraceInFastThrow` optimisation (on by default) notices when compiled code throws the same implicit exception — NPE, ArithmeticException, ArrayIndexOutOfBounds, ClassCastException — over and over, and starts throwing a preallocated instance **without a stack trace or message**. Production logs then show a bare `java.lang.NullPointerException`. Search the logs for the first occurrence (which has the full trace) or run with `-XX:-OmitStackTraceInFastThrow` while debugging.',
        sources: [{ label: 'Throwable API documentation (Java 21)', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Throwable.html' }],
      },
      {
        title: 'Compile-time checking and helpful NPE messages',
        body: 'JLS §11.2 defines the "catch or specify" rule, including the analysis that lets `javac` reject a catch of a checked exception the try block can never throw. On the run-time side, JEP 358 (Java 14, on by default from Java 15) made the JVM compute **helpful NullPointerException messages** from the bytecode, naming exactly which variable, field, array element or method return value was null.',
        sources: [
          { label: 'JLS §11.2: Compile-Time Checking of Exceptions', url: 'https://docs.oracle.com/javase/specs/jls/se21/html/jls-11.html#jls-11.2' },
          { label: 'JEP 358: Helpful NullPointerExceptions', url: 'https://openjdk.org/jeps/358' },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  'e-resources': {
    interviewDefinition:
      '**try-with-resources** (Java 7) declares `AutoCloseable` resources in the `try` header and guarantees their `close()` is called on every exit path, in **reverse declaration order**, before any `catch` or `finally` of the same statement runs. If both the body and `close()` throw, the close failure is attached to the primary exception as a **suppressed** exception instead of masking it — the bug hand-written close-in-finally code routinely had.',
    interviewFollowUps: [
      {
        question: '`AutoCloseable` vs `Closeable`?',
        answer: '`Closeable` (java.io) extends `AutoCloseable` since Java 7. Its `close()` throws only `IOException` and must be idempotent (calling it twice has no extra effect). `AutoCloseable.close()` may throw any `Exception` and is only encouraged to be idempotent.',
      },
      {
        question: 'What if creating the second resource throws?',
        answer: 'Resources that were already initialised are closed (in reverse order) and the exception propagates. The failed resource was never assigned, so there is nothing to close for it. A resource variable that is null is simply skipped.',
      },
      {
        question: 'Will the garbage collector close a leaked stream?',
        answer: 'Not reliably. Finalization is deprecated for removal (JEP 421, Java 18), and a `Cleaner` is only a last-resort safety net that runs at an unpredictable time — if ever. Long before GC runs, the process can run out of file descriptors or pooled connections.',
      },
      {
        question: 'Can I use a resource created earlier?',
        answer: 'Since Java 9, yes, if the variable is final or effectively final: `try (connection) { ... }`. It is closed at the end just like a declared resource.',
      },
    ],
    mnemonic: {
      device: 'Stack the plates, take them down from the top',
      expansion: [
        { key: 'Stack', meaning: 'Resources open in declaration order: A, then B' },
        { key: 'Take down', meaning: 'They close in reverse: B, then A (last opened, first closed)' },
        { key: 'Drop one?', meaning: 'If close() fails while another failure is in flight, it is recorded as suppressed — the first failure stays primary' },
        { key: 'Then tidy', meaning: 'Only after all closes do the catch and finally blocks run' },
      ],
      visual: 'A waiter stacks plates A then B on a tray and must unstack B before A. If B slips while the waiter is already tripping, the report says "tripped" with "dropped plate B" as a footnote.',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'A library that returns your books at the door',
        body: 'Manual closing is like promising to return every borrowed book before you leave — easy to forget when you leave in a hurry (an exception). try-with-resources is a library whose exit gate takes the books from your bag automatically, whichever door you use.',
      },
      {
        kind: 'insight',
        title: 'It is just compiler-generated code',
        body: 'JLS §14.20.3 specifies a translation: each resource becomes a nested try/finally that calls `close()`, catches a close failure and calls `primary.addSuppressed(closeFailure)` when a primary exception exists. Nothing happens at run time that you could not write by hand — the value is that you never have to.',
      },
      {
        kind: 'real-world',
        title: '`Files.lines` and other streams that hold files',
        body: '`Files.lines(path)` returns a `Stream<String>` that keeps the file open until the stream is closed. Using it in a chain without try-with-resources leaks a file descriptor per call; on a busy server that becomes "Too many open files". The fix is `try (Stream<String> lines = Files.lines(path)) { ... }` — Stream implements AutoCloseable precisely for this.',
      },
      {
        kind: 'angle',
        title: 'Wrapper constructors can leak the inner resource',
        body: 'In `try (var in = new GZIPInputStream(new FileInputStream(f)))`, only the outer object is a resource. If the GZIPInputStream constructor throws (it reads the header, so a corrupt file does that), the FileInputStream was opened but never closed. Declaring each layer separately — `try (var file = new FileInputStream(f); var gz = new GZIPInputStream(file))` — closes the file on every path.',
      },
    ],
    diagrams: [
      {
        id: 'e-resources-lifecycle',
        kind: 'flow',
        title: 'The lifecycle of try (A a = ...; B b = ...)',
        caption: 'Follow the arrows: open in order, run the body, close in reverse, and only then hand the (primary) exception to catch, followed by finally.',
        cols: 4,
        rows: 2,
        nodes: [
          { id: 'erl-a', label: 'Open A', col: 0, row: 0, tone: 'primary' },
          { id: 'erl-b', label: 'Open B', col: 1, row: 0, tone: 'primary' },
          { id: 'erl-body', label: 'Body runs', detail: 'may throw (primary)', col: 2, row: 0, tone: 'warning' },
          { id: 'erl-closeb', label: 'close B', detail: 'failure: suppressed', col: 3, row: 0, tone: 'accent' },
          { id: 'erl-closea', label: 'close A', detail: 'still runs', col: 3, row: 1, tone: 'accent' },
          { id: 'erl-catch', label: 'catch', detail: 'sees primary exception', col: 2, row: 1, tone: 'neutral' },
          { id: 'erl-finally', label: 'finally', col: 1, row: 1, tone: 'neutral' },
          { id: 'erl-done', label: 'Done', col: 0, row: 1, shape: 'pill', tone: 'success' },
        ],
        edges: [
          { from: 'erl-a', to: 'erl-b' },
          { from: 'erl-b', to: 'erl-body' },
          { from: 'erl-body', to: 'erl-closeb', label: 'any exit' },
          { from: 'erl-closeb', to: 'erl-closea', label: 'reverse order' },
          { from: 'erl-closea', to: 'erl-catch' },
          { from: 'erl-catch', to: 'erl-finally' },
          { from: 'erl-finally', to: 'erl-done' },
        ],
        groups: [
          { label: 'Header + body', fromCol: 0, toCol: 2, fromRow: 0, toRow: 0, tone: 'primary' },
          { label: 'Automatic close', fromCol: 3, toCol: 3, fromRow: 0, toRow: 1, tone: 'accent' },
        ],
      },
      {
        id: 'e-resources-suppressed',
        kind: 'concept',
        title: 'Suppressed vs lost exceptions',
        caption: 'With try-with-resources the body failure stays primary and the close failure is attached to it. With a hand-written finally, the close failure replaces the original, which is gone for good.',
        cols: 2,
        rows: 3,
        nodes: [
          { id: 'ers-twr-body', label: 'Body throws', detail: '"work failed"', col: 0, row: 0, tone: 'warning' },
          { id: 'ers-twr-close', label: 'close() throws', detail: '"close failed"', col: 0, row: 1, tone: 'warning' },
          { id: 'ers-twr-result', label: 'Caller gets', detail: '"work failed" + 1 suppressed', col: 0, row: 2, shape: 'pill', tone: 'success' },
          { id: 'ers-fin-body', label: 'Body throws', detail: '"work failed"', col: 1, row: 0, tone: 'warning' },
          { id: 'ers-fin-close', label: 'close() in finally', detail: 'throws "close failed"', col: 1, row: 1, tone: 'warning' },
          { id: 'ers-fin-result', label: 'Caller gets', detail: 'only "close failed"', col: 1, row: 2, shape: 'pill', tone: 'danger' },
        ],
        edges: [
          { from: 'ers-twr-body', to: 'ers-twr-close', label: 'then' },
          { from: 'ers-twr-close', to: 'ers-twr-result', label: 'addSuppressed' },
          { from: 'ers-fin-body', to: 'ers-fin-close', label: 'then' },
          { from: 'ers-fin-close', to: 'ers-fin-result', label: 'replaces original' },
        ],
        groups: [
          { label: 'try-with-resources', fromCol: 0, toCol: 0, fromRow: 0, toRow: 2, tone: 'success' },
          { label: 'Manual finally', fromCol: 1, toCol: 1, fromRow: 0, toRow: 2, tone: 'danger' },
        ],
      },
      {
        id: 'e-resources-types',
        kind: 'architecture',
        title: 'What can go in the parentheses',
        caption: 'Anything that implements AutoCloseable qualifies — JDK I/O, JDBC, streams, executors and your own classes.',
        cols: 3,
        rows: 3,
        nodes: [
          { id: 'ert-auto', label: 'AutoCloseable', detail: 'close() throws Exception', col: 1, row: 0, tone: 'primary' },
          { id: 'ert-closeable', label: 'Closeable', detail: 'close() throws IOException', col: 0, row: 1, tone: 'accent' },
          { id: 'ert-jdbc', label: 'JDBC types', detail: 'Connection, Statement, ResultSet', col: 1, row: 1, tone: 'accent' },
          { id: 'ert-stream', label: 'Stream, ExecutorService', detail: 'executor since Java 19', col: 2, row: 1, tone: 'accent' },
          { id: 'ert-io', label: 'I/O classes', detail: 'InputStream, Reader, Socket', col: 0, row: 2, tone: 'neutral' },
          { id: 'ert-own', label: 'Your own classes', detail: 'implement close()', col: 2, row: 2, tone: 'success' },
        ],
        edges: [
          { from: 'ert-closeable', to: 'ert-auto', label: 'extends' },
          { from: 'ert-jdbc', to: 'ert-auto' },
          { from: 'ert-stream', to: 'ert-auto' },
          { from: 'ert-io', to: 'ert-closeable', label: 'implements' },
          { from: 'ert-own', to: 'ert-stream', label: 'or directly', dashed: true },
        ],
      },
    ],
    variants: [
      {
        title: 'Ways to release resources',
        items: [
          { name: 'try / finally (manual)', summary: 'Close in finally with a null check. Verbose and loses exceptions when close also fails.', support: 'partial', note: 'Still the right tool for non-AutoCloseable pairs like lock() / unlock().', code: 'lock.lock();\ntry { ... } finally { lock.unlock(); }' },
          { name: 'try-with-resources (Java 7)', summary: 'Declares resources in the header; closes in reverse order; records suppressed exceptions.', support: 'supported', code: 'try (var in = Files.newBufferedReader(p)) { ... }' },
          { name: 'Existing variable as resource (Java 9)', summary: 'Use a final or effectively final variable declared earlier.', support: 'supported', code: 'Connection c = ds.getConnection();\ntry (c) { ... }' },
          { name: 'Cleaner (Java 9)', summary: 'Registers a clean-up action that runs after an object becomes unreachable; a safety net only.', support: 'partial', note: 'Timing is unpredictable; never the primary mechanism.' },
          { name: 'finalize()', summary: 'Called by GC before reclaiming an object, maybe never.', support: 'not-supported', note: 'Deprecated since Java 9 and for removal since Java 18 (JEP 421).' },
        ],
      },
      {
        title: 'Ways exceptions get lost',
        items: [
          { name: 'return in finally', summary: 'Discards any exception thrown in try or catch.', code: 'finally { return 42; }' },
          { name: 'throw in finally', summary: 'Replaces the original exception with the new one.', code: 'finally { throw new IllegalStateException(); }' },
          { name: 'close() failing in a manual finally', summary: 'The close exception escapes and the body exception vanishes.', code: 'finally { in.close(); }' },
          { name: 'Empty catch', summary: 'The failure disappears entirely.', code: 'catch (IOException e) { }' },
        ],
      },
    ],
    deepDive: [
      {
        title: 'The specified translation',
        body: 'JLS §14.20.3.1 defines a basic try-with-resources as a nested try statement: the resource is initialised, the body runs in an inner try, a catch-all records the primary throwable, and a finally closes the resource — calling `addSuppressed` if both failed, and skipping null resources. An extended try-with-resources (one with its own catch/finally) is defined as a basic one wrapped in an ordinary try, which is why resources are already closed when your catch block runs.',
        sources: [{ label: 'JLS §14.20.3: try-with-resources', url: 'https://docs.oracle.com/javase/specs/jls/se21/html/jls-14.html#jls-14.20.3' }],
      },
      {
        title: 'Why finalization is going away',
        body: 'Finalizers ran at an unpredictable time, on an unspecified thread, could resurrect objects, slowed allocation and GC, and frequently hid resource leaks until production load. JEP 421 (Java 18) deprecated finalization for removal and added `--finalization=disabled` to test applications without it. The guidance is explicit: use try-with-resources for deterministic release, and `java.lang.ref.Cleaner` only as a backstop.',
        sources: [
          { label: 'JEP 421: Deprecate Finalization for Removal', url: 'https://openjdk.org/jeps/421' },
          { label: 'Effective Java, 3rd edition — Item 8 (avoid finalizers and cleaners) and Item 9 (prefer try-with-resources)' },
        ],
      },
      {
        title: 'Designing your own AutoCloseable',
        body: 'Make `close()` idempotent (required for `Closeable`, strongly advised otherwise), narrow its `throws` clause to what it really throws so callers are not forced to catch `Exception`, and avoid throwing `InterruptedException` from it: if that exception is suppressed, the thread\'s interrupt status is effectively lost. Locks are a notable non-example — `ReentrantLock` is not AutoCloseable, so keep the `lock(); try { } finally { unlock(); }` idiom.',
        sources: [
          { label: 'AutoCloseable API documentation (Java 21)', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/AutoCloseable.html' },
          { label: 'Closeable API documentation (Java 21)', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/io/Closeable.html' },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  'e-design': {
    interviewDefinition:
      'Exception design treats failure as part of an API\'s contract. Validate inputs early and **fail fast** with standard exceptions (`IllegalArgumentException`, `IllegalStateException`, `Objects.requireNonNull`). At layer boundaries, **translate** low-level exceptions into ones meaningful to the caller while **chaining the cause**. Create custom exceptions only when callers must react differently or need structured context, prefer unchecked exceptions for failures that cannot be handled locally, and log each exception once.',
    interviewFollowUps: [
      {
        question: 'When should an exception be checked?',
        answer: 'When the condition is recoverable and the immediate caller can reasonably do something about it (choose another file, show "insufficient funds"). Programming errors and failures nobody nearby can fix should be unchecked. *Effective Java* Item 70 states this rule.',
      },
      {
        question: 'What should a good custom exception contain?',
        answer: 'A name that describes the problem, a message that states the rule and the actual values, constructors that accept a `cause`, and accessor methods for structured context (ids, limits) callers might act on. Throwable is Serializable, so declare a `serialVersionUID` and keep fields serializable.',
      },
      {
        question: 'How do you handle `InterruptedException`?',
        answer: 'Never swallow it. Either let it propagate, or restore the flag with `Thread.currentThread().interrupt()` before translating it or returning, so code higher up still sees that the thread was asked to stop.',
      },
      {
        question: 'What is failure atomicity?',
        answer: 'A failed method call should leave the object in the state it had before the call. The easiest way is to validate everything before mutating anything — as `withdraw` does by checking the balance before subtracting.',
      },
    ],
    mnemonic: {
      device: 'Throw early, catch late, wrap with cause, log once',
      expansion: [
        { key: 'Throw early', meaning: 'Validate at the entry point and fail fast with a precise message' },
        { key: 'Catch late', meaning: 'Catch only where you can act: retry, fall back, or answer the user' },
        { key: 'Wrap with cause', meaning: 'Translate at layer boundaries, always passing the original exception' },
        { key: 'Log once', meaning: 'Log where the exception is finally handled, not at every layer' },
      ],
      visual: 'A relay race: the first runner spots the problem immediately (throw early), each runner passes the baton with the original note taped to it (wrap with cause), and only the anchor at the finish line announces the result (catch late, log once).',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'A hospital referral letter',
        body: 'A nurse who escalates to a specialist does not just say "patient unwell" (a vague message), nor dump raw lab printouts without explanation (leaking SQLException). The referral summarises the problem in the specialist\'s terms (translation) and attaches the original lab results (the cause), so nothing is lost and nothing has to be repeated.',
      },
      {
        kind: 'insight',
        title: 'Check before you change',
        body: 'Validation at the top of a method is not only about clear messages: it makes the method **failure-atomic**. If `transfer` debits one account and then discovers the target account is closed, it has already corrupted state. Checking all preconditions first means an exception leaves everything exactly as it was.',
      },
      {
        kind: 'real-world',
        title: 'Spring\'s exception translation and Problem Details',
        body: 'Spring translates vendor-specific `SQLException`s (using SQLState and vendor error codes) into a portable unchecked `DataAccessException` hierarchy — `DuplicateKeyException`, `QueryTimeoutException` and so on — so services can react without knowing the database. At the web edge, `@ControllerAdvice` maps exceptions to HTTP responses, and Spring 6 supports the standard Problem Details JSON format (RFC 9457).',
      },
      {
        kind: 'angle',
        title: 'Checked exceptions and lambdas do not mix',
        body: '`Function.apply` declares no checked exceptions, so `paths.stream().map(Files::readString)` does not compile. The usual fixes are to wrap inside the lambda (`UncheckedIOException`, added in Java 8 exactly for this), to collect results and failures explicitly, or to define your own functional interface that declares `throws IOException`. This friction is a big reason modern libraries favour unchecked exceptions.',
      },
    ],
    diagrams: [
      {
        id: 'e-design-layers',
        kind: 'architecture',
        title: 'Translating exceptions across layers',
        caption: 'Each layer converts the failure into its own vocabulary while keeping the cause. Only the edge of the system logs it and turns it into a response.',
        cols: 4,
        rows: 2,
        nodes: [
          { id: 'edl-web', label: 'Controller advice', detail: 'maps to HTTP 503', col: 0, row: 0, tone: 'primary' },
          { id: 'edl-service', label: 'Service', detail: 'adds business context', col: 1, row: 0, tone: 'primary' },
          { id: 'edl-repo', label: 'Repository', detail: 'throws RepositoryException', col: 2, row: 0, tone: 'accent' },
          { id: 'edl-driver', label: 'JDBC driver', detail: 'throws SQLException', col: 3, row: 0, tone: 'warning' },
          { id: 'edl-client', label: 'Client response', detail: 'problem details JSON', col: 0, row: 1, shape: 'pill', tone: 'success' },
          { id: 'edl-log', label: 'Log: one entry', detail: 'full cause chain', col: 1, row: 1, shape: 'cylinder', tone: 'neutral' },
        ],
        edges: [
          { from: 'edl-driver', to: 'edl-repo', label: 'SQLException' },
          { from: 'edl-repo', to: 'edl-service', label: 'wrapped, cause kept' },
          { from: 'edl-service', to: 'edl-web', label: 'propagates' },
          { from: 'edl-web', to: 'edl-client' },
          { from: 'edl-web', to: 'edl-log' },
        ],
        groups: [
          { label: 'Your code', fromCol: 0, toCol: 2, fromRow: 0, toRow: 0, tone: 'primary' },
          { label: 'Infrastructure', fromCol: 3, toCol: 3, fromRow: 0, toRow: 0, tone: 'warning' },
        ],
      },
      {
        id: 'e-design-cause-chain',
        kind: 'concept',
        title: 'A useful cause chain',
        caption: 'Each link answers a different question. Following getCause() to the end reaches the root cause; the outer links explain what the system was trying to do.',
        cols: 3,
        rows: 2,
        nodes: [
          { id: 'edc-top', label: 'ServiceException', detail: '"pricing basket 8812"', col: 0, row: 0, tone: 'primary' },
          { id: 'edc-mid', label: 'RepositoryException', detail: '"loading tariff EU-STD"', col: 1, row: 0, tone: 'accent' },
          { id: 'edc-root', label: 'SocketTimeoutException', detail: 'the root cause', col: 2, row: 0, tone: 'danger' },
          { id: 'edc-q1', label: 'What was attempted?', col: 0, row: 1, shape: 'note', tone: 'neutral' },
          { id: 'edc-q2', label: 'Which layer failed?', col: 1, row: 1, shape: 'note', tone: 'neutral' },
          { id: 'edc-q3', label: 'What actually broke?', col: 2, row: 1, shape: 'note', tone: 'neutral' },
        ],
        edges: [
          { from: 'edc-top', to: 'edc-mid', label: 'getCause()' },
          { from: 'edc-mid', to: 'edc-root', label: 'getCause()' },
          { from: 'edc-top', to: 'edc-q1', dashed: true },
          { from: 'edc-mid', to: 'edc-q2', dashed: true },
          { from: 'edc-root', to: 'edc-q3', dashed: true },
        ],
      },
      {
        id: 'e-design-choose',
        kind: 'flow',
        title: 'Which failure signal should I use?',
        caption: 'Work down the questions. Reuse standard exceptions for caller mistakes and wrong-state calls; reserve custom exceptions for outcomes callers must distinguish.',
        cols: 2,
        rows: 5,
        nodes: [
          { id: 'edq-arg', label: 'Bad argument?', detail: 'caller passed invalid data', col: 0, row: 0, tone: 'warning' },
          { id: 'edq-arg-yes', label: 'IllegalArgument Exception', detail: 'or requireNonNull', col: 1, row: 0, tone: 'success' },
          { id: 'edq-state', label: 'Wrong state?', detail: 'e.g. already closed', col: 0, row: 1, tone: 'warning' },
          { id: 'edq-state-yes', label: 'IllegalState Exception', col: 1, row: 1, tone: 'success' },
          { id: 'edq-absent', label: 'Expected absence?', detail: 'e.g. search found nothing', col: 0, row: 2, tone: 'warning' },
          { id: 'edq-absent-yes', label: 'Return Optional', detail: 'or an empty result', col: 1, row: 2, tone: 'success' },
          { id: 'edq-recover', label: 'Caller can recover?', col: 0, row: 3, tone: 'warning' },
          { id: 'edq-checked', label: 'Checked custom exception', col: 1, row: 3, tone: 'accent' },
          { id: 'edq-unchecked', label: 'Unchecked exception', detail: 'custom or translated', col: 0, row: 4, tone: 'accent' },
        ],
        edges: [
          { from: 'edq-arg', to: 'edq-arg-yes', label: 'yes' },
          { from: 'edq-arg', to: 'edq-state', label: 'no' },
          { from: 'edq-state', to: 'edq-state-yes', label: 'yes' },
          { from: 'edq-state', to: 'edq-absent', label: 'no' },
          { from: 'edq-absent', to: 'edq-absent-yes', label: 'yes' },
          { from: 'edq-absent', to: 'edq-recover', label: 'no' },
          { from: 'edq-recover', to: 'edq-checked', label: 'yes, locally' },
          { from: 'edq-recover', to: 'edq-unchecked', label: 'no' },
        ],
      },
    ],
    variants: [
      {
        title: 'Custom exception design choices',
        items: [
          { name: 'Extend RuntimeException (unchecked)', summary: 'The default for application errors that callers usually cannot handle locally.', support: 'supported', code: 'class RepositoryException extends RuntimeException' },
          { name: 'Extend Exception (checked)', summary: 'For recoverable outcomes the direct caller is expected to handle.', support: 'supported', code: 'class InsufficientFundsException extends Exception' },
          { name: 'Carry structured context', summary: 'Fields and accessors (ids, limits, shortfall) instead of making callers parse messages.', support: 'supported', code: 'long shortfall() { return requested - balance; }' },
          { name: 'Always offer a cause constructor', summary: 'So translations never lose the original exception.', support: 'supported', code: 'MyException(String msg, Throwable cause) { super(msg, cause); }' },
          { name: 'Small hierarchy with a common base', summary: 'One base per module (e.g. PaymentException) with a few subclasses callers actually distinguish.', support: 'supported' },
          { name: 'Reuse standard exceptions instead', summary: 'IllegalArgumentException, IllegalStateException, UnsupportedOperationException, NoSuchElementException are familiar to every reader.', support: 'supported', note: 'Effective Java Item 72: favour standard exceptions.' },
          { name: 'Stackless exception', summary: 'Disable stack-trace capture for a very frequently thrown, expected exception.', support: 'partial', note: 'Uses the protected Throwable(msg, cause, enableSuppression, writableStackTrace) constructor; harder to debug, so use rarely.', code: 'super(msg, null, false, false);' },
        ],
      },
      {
        title: 'Ways to pass an exception on',
        items: [
          { name: 'Let it propagate', summary: 'Do nothing: no catch, declare throws if checked.', support: 'supported' },
          { name: 'Rethrow the same exception', summary: 'After a local action such as a rollback.', support: 'supported', code: 'catch (SQLException e) { tx.rollback(); throw e; }' },
          { name: 'Precise rethrow (Java 7)', summary: 'Catch Exception but rethrow it while declaring only the checked types the try can really throw.', support: 'supported', code: 'void m() throws IOException {\n  try { io(); } catch (Exception e) { log(e); throw e; }\n}' },
          { name: 'Translate (wrap) with cause', summary: 'Throw an exception of the right abstraction, chaining the original.', support: 'supported', code: 'throw new RepositoryException("load " + id, e);' },
          { name: 'Wrap as UncheckedIOException', summary: 'Carry an IOException through APIs that cannot throw checked exceptions, such as lambdas.', support: 'supported', code: 'catch (IOException e) { throw new UncheckedIOException(e); }' },
        ],
      },
    ],
    deepDive: [
      {
        title: 'The Effective Java exception rules',
        body: 'Chapter 10 of *Effective Java* (3rd edition) is the canonical checklist: use exceptions only for exceptional conditions (Item 69); checked for recoverable conditions, runtime for programming errors (70); avoid unnecessary checked exceptions (71); favour standard exceptions (72); throw exceptions appropriate to the abstraction, i.e. translate (73); document every exception (74); include failure-capture information in messages (75); strive for failure atomicity (76); and do not ignore exceptions (77).',
        sources: [{ label: 'Effective Java, 3rd edition — Chapter 10, Items 69-77' }],
      },
      {
        title: 'Precise rethrow and effectively final catch parameters',
        body: 'Since Java 7, if a catch parameter is effectively final and you rethrow it, the compiler treats the thrown type as the set of checked exceptions the try block can actually throw — not the declared catch type. So `catch (Exception e) { log(e); throw e; }` in a method declaring only `throws IOException` compiles. Assigning to `e` inside the catch turns this off. JLS §11.2.2 describes the analysis.',
        sources: [{ label: 'JLS §11.2.2: Exception Analysis of Statements', url: 'https://docs.oracle.com/javase/specs/jls/se21/html/jls-11.html#jls-11.2.2' }],
      },
      {
        title: 'Errors at the API edge: Problem Details',
        body: 'HTTP APIs need a stable, machine-readable error shape so clients do not parse messages. RFC 9457 (which obsoletes RFC 7807) defines `application/problem+json` with `type`, `title`, `status`, `detail` and `instance` fields plus extensions. Mapping each domain exception to one problem type at a single boundary keeps internal details (SQL, stack traces) out of responses — a security requirement as well as a usability one.',
        sources: [{ label: 'RFC 9457: Problem Details for HTTP APIs', url: 'https://www.rfc-editor.org/rfc/rfc9457' }],
      },
    ],
  },
};
