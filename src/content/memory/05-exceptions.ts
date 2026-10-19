import type { MemoryAid } from '@/types/curriculum';

/** "Make it stick" memory aids for module 5 (exception handling and defensive programming), keyed by lesson id. */
export const exceptionsMemory: Record<string, MemoryAid> = {
  'e-basics': {
    oneLiner: 'An exception is a problem report that travels back up the chain of callers until someone catches it.',
    story:
      'Picture a factory. A worker on the line finds a broken part and cannot fix it, so they stop and send a problem report to their boss. If the boss cannot handle it either, the report goes up to the manager. The first person who knows what to do deals with it. Whatever happens, whoever leaves the line last locks the door. In Java, each person is a method on the call stack, the report is an exception object, sending it is `throw`, dealing with it is `catch`, and locking the door is `finally`. If nobody catches the report, the thread stops and the error is printed.',
    keyPoints: [
      '`throw` sends an exception; Java leaves each method until a matching `catch` handles it.',
      'Checked exceptions must be caught or declared with `throws`; `RuntimeException` types need not be.',
      'A `finally` block runs whether the `try` ends normally or with an exception.',
    ],
    confusion: {
      mixedUpWith: '`throw` and `throws`',
      difference: '`throw` actually throws an exception right now, while `throws` in a method signature only warns callers which checked exceptions might come out.',
    },
    tryIt: 'Write a `main` that calls `Integer.parseInt("abc")` inside `try`, catches `NumberFormatException`, prints its message, and has a `finally` that prints "done". Then remove the `catch` and run it again.',
    recall: [
      { question: 'What happens to an exception that nobody catches?', answer: 'It travels to the top of the thread\'s stack, the stack trace is printed, and that thread ends.' },
      { question: 'When does a `finally` block run?', answer: 'Every time the `try` block is left, whether normally, by `return` or by an exception.' },
      { question: 'Which kind of exception does the compiler force you to handle?', answer: 'Checked exceptions, such as `IOException`. You must catch them or declare them with `throws`.' },
    ],
    picture: {
      title: 'The report goes up the line',
      caption: 'The worker method throws, the boss method passes it on, and the manager method catches it. The door is locked in `finally` either way.',
      items: [
        { icon: 'person', label: 'worker()', x: 11, y: 44, tone: 'danger' },
        { icon: 'person', label: 'boss()', x: 50, y: 44, tone: 'warning' },
        { icon: 'teacher', label: 'manager()', x: 88, y: 44, tone: 'success' },
        { icon: 'lock', label: 'finally', x: 88, y: 12, size: 0.9, tone: 'neutral' },
      ],
      arrows: [
        { from: 0, to: 1, label: 'throw' },
        { from: 1, to: 2, label: 'catch' },
        { from: 2, to: 3, dashed: true },
      ],
    },
  },

  'e-resources': {
    oneLiner: 'try-with-resources closes everything you opened in the `try` header, every time, even when something fails.',
    story:
      'Think of a library reading room with a helpful librarian at the door. As you walk in, you tell the librarian which books you are taking. When you leave, for any reason, even if you trip on the way out, the librarian takes the books back for you. The last book you took is the first one returned. If a book also falls while being returned, the librarian notes it on your report instead of forgetting why you tripped. In Java, the books are resources like files, the librarian is try-with-resources, returning a book is `close()`, and the side note is a suppressed exception.',
    keyPoints: [
      'Declare resources in `try (...)`; they must implement `AutoCloseable`.',
      'They close automatically in reverse order, before any `catch` or `finally` of that statement runs.',
      'If `close()` also throws, that error is added as suppressed, so the first error is not lost.',
    ],
    confusion: {
      mixedUpWith: 'closing in `finally` by hand',
      difference: 'A hand-written `finally` close is long and can hide the first error, while try-with-resources closes in order and keeps both errors.',
    },
    tryIt: 'Write a class `Book implements AutoCloseable` whose `close()` prints its name. Open two books in one `try (Book a = ...; Book b = ...)` and run it to see that `b` closes before `a`.',
    recall: [
      { question: 'What interface must a resource implement to be used in try-with-resources?', answer: '`AutoCloseable` (or `Closeable`, which extends it).' },
      { question: 'In what order are two resources closed?', answer: 'In reverse order: the one declared last is closed first.' },
      { question: 'What happens to an exception thrown by `close()` when the body already failed?', answer: 'It is attached to the first exception as a suppressed exception, so neither is lost.' },
    ],
    picture: {
      title: 'The librarian takes the books back',
      caption: 'You borrow resources in the `try` header. Whenever you leave, `close()` returns them, last one first.',
      items: [
        { icon: 'library', label: 'try (...)', x: 13, y: 28, tone: 'primary' },
        { icon: 'book', label: 'resource', x: 50, y: 28, tone: 'accent' },
        { icon: 'recycle', label: 'close()', x: 85, y: 12, size: 0.9, tone: 'success' },
        { icon: 'note', label: 'suppressed', x: 85, y: 44, size: 0.9, tone: 'warning' },
      ],
      arrows: [
        { from: 0, to: 1, label: 'open' },
        { from: 1, to: 2 },
        { from: 1, to: 3, dashed: true },
      ],
    },
  },

  'e-design': {
    oneLiner: 'Check inputs early, and turn deep technical errors into clear ones for the caller, keeping the original cause.',
    story:
      'Think of a bank. The clerk at the front desk checks your form before taking it: no name, no transfer. That is failing fast. If the form is fine but something breaks deep in the vault, the clerk does not shout "vault lock 7 jammed" at you. They say "your transfer failed", and staple the vault report behind it for the staff. In Java, the desk check is `Objects.requireNonNull` or an `IllegalArgumentException`, the vault report is a low-level exception like `SQLException`, and the stapled message is a new exception created with the original as its cause.',
    keyPoints: [
      'Validate arguments at the start of a method and throw a standard exception if they are wrong.',
      'At a layer boundary, wrap low-level exceptions in meaningful ones and pass the original as the cause.',
      'Make a custom exception only when callers must react to it differently, and log each error once.',
    ],
    confusion: {
      mixedUpWith: '`IllegalArgumentException` and `IllegalStateException`',
      difference: '`IllegalArgumentException` means the caller passed a bad value, while `IllegalStateException` means the object is not ready for this call right now.',
    },
    tryIt: 'Write `withdraw(int amount)` that throws `IllegalArgumentException` when the amount is negative. Call it with `-5`, catch the error and wrap it in `new RuntimeException("withdraw failed", e)`, then print the stack trace and find "Caused by".',
    recall: [
      { question: 'Why should you pass the original exception as the cause when you wrap it?', answer: 'So the stack trace still shows the real low-level reason, under "Caused by".' },
      { question: 'What does "fail fast" mean?', answer: 'Check inputs at the start and throw right away, before bad data spreads.' },
    ],
    picture: {
      title: 'Check at the desk, explain the vault',
      caption: 'The desk rejects a bad form at once (fail fast). A vault error becomes a clear "transfer failed" with the original stapled on as the cause.',
      items: [
        { icon: 'id-card', label: 'bad form', x: 13, y: 12, size: 0.9, tone: 'danger' },
        { icon: 'shield', label: 'validate', x: 60, y: 12, size: 0.9, tone: 'success' },
        { icon: 'bank', label: 'SQLException', x: 13, y: 44, size: 0.9, tone: 'warning' },
        { icon: 'envelope', label: 'TransferFailed', x: 80, y: 44, size: 0.9, tone: 'accent' },
      ],
      arrows: [
        { from: 0, to: 1, label: 'stop' },
        { from: 2, to: 3, label: 'cause' },
      ],
    },
  },
};
