import type { BugHunt } from '@/types/practice';

/** 1-based line numbers of every line containing one of the markers. */
function linesWith(code: string, markers: string[]): number[] {
  const lines = code.split('\n');
  const found = lines.flatMap((line, i) => (markers.some((m) => line.includes(m)) ? [i + 1] : []));
  if (found.length === 0) throw new Error(`bug hunt marker not found: ${markers.join(', ')}`);
  return found;
}

function hunt(def: Omit<BugHunt, 'buggyLines'> & { bugMarkers: string[] }): BugHunt {
  const { bugMarkers, ...rest } = def;
  return { ...rest, buggyLines: linesWith(def.code, bugMarkers) };
}

export const BUG_HUNT_EXTRA_LIST: BugHunt[] = [
  // -------------------------------------------------------------------------
  // fundamentals
  // -------------------------------------------------------------------------
  hunt({
    id: 'bug-x-conversion-zero',
    title: 'Dashboard shows 0% conversion every day',
    moduleId: 'fundamentals',
    difficulty: 'beginner',
    category: 'Integer arithmetic',
    symptom:
      'The marketing dashboard shows a 0.00% conversion rate for every normal day. The only day with a non-zero rate was an internal load test where every visit placed an order, and it showed exactly 100.00%.',
    evidence: `orders=37 visits=1200 rate=0.00%
orders=45 visits=1350 rate=0.00%
orders=1300 visits=1300 rate=100.00%`,
    code: `public class Main {
    static double conversionRate(int orders, int visits) {
        return orders / visits * 100.0;
    }

    public static void main(String[] args) {
        int[][] days = { {37, 1200}, {45, 1350}, {1300, 1300} };
        for (int[] d : days) {
            System.out.printf("orders=%d visits=%d rate=%.2f%%%n", d[0], d[1], conversionRate(d[0], d[1]));
        }
    }
}`,
    bugMarkers: ['return orders / visits * 100.0;'],
    rootCauseOptions: [
      { id: 'a', text: 'printf with %.2f rounds small values down to zero' },
      { id: 'b', text: 'orders / visits is evaluated first as int division, which truncates to 0 before the multiplication by 100.0 promotes anything to double' },
      { id: 'c', text: 'double cannot represent fractions like 37/1200 precisely enough' },
      { id: 'd', text: 'The int parameters overflow when multiplied by 100' },
    ],
    correctRootCauseId: 'b',
    fixOptions: [
      { id: 'a', text: 'Cast the quotient: (double) (orders / visits) * 100', code: 'return (double) (orders / visits) * 100;' },
      { id: 'b', text: 'Print with more decimals, e.g. %.6f' },
      { id: 'c', text: 'Make one operand a double before dividing (and multiply first for readability)', code: 'return orders * 100.0 / visits;' },
      { id: 'd', text: 'Change the return type to float' },
    ],
    correctFixId: 'c',
    explanation:
      '`*` and `/` have the same precedence and associate left to right, so `orders / visits` runs first. Both operands are `int`, so Java performs integer division and discards the remainder: 37 / 1200 is 0, and 0 * 100.0 is 0.0. Only when orders == visits does the quotient become 1. Casting the *result* of the division (option a) is too late: the fraction is already gone. Promoting an operand **before** the division (`orders * 100.0 / visits`) gives 3.08 and 3.33.',
    prevention: [
      'When a result should be fractional, promote an operand to double before dividing.',
      'Write unit tests with values that are not exact multiples (e.g. 37/1200), not just 0 and 100%.',
      'Be suspicious of any metric that only ever shows 0 or 100.',
    ],
    hints: ['Which operation runs first: the division or the multiplication?', 'What is 37 / 1200 when both are ints?'],
  }),
  hunt({
    id: 'bug-x-last-week-off-by-one',
    title: 'Weekly signup report crashes',
    moduleId: 'fundamentals',
    difficulty: 'beginner',
    category: 'Off-by-one',
    symptom:
      'The new "signups in the last 7 days" email job crashes every morning. The array always holds 30 days of data, so the failure is 100% reproducible.',
    evidence: `Exception in thread "main" java.lang.ArrayIndexOutOfBoundsException: Index 30 out of bounds for length 30
	at Main.lastWeekTotal(Main.java:5)
	at Main.main(Main.java:15)`,
    code: `public class Main {
    static int lastWeekTotal(int[] dailySignups) {
        int total = 0;
        for (int i = dailySignups.length - 7; i <= dailySignups.length; i++) {
            total += dailySignups[i];
        }
        return total;
    }

    public static void main(String[] args) {
        int[] signups = new int[30];
        for (int day = 0; day < signups.length; day++) {
            signups[day] = 10 + day;
        }
        System.out.println("Signups in the last 7 days: " + lastWeekTotal(signups));
    }
}`,
    bugMarkers: ['i <= dailySignups.length;'],
    rootCauseOptions: [
      { id: 'a', text: 'The start index length - 7 is negative' },
      { id: 'b', text: 'The loop condition uses <=, so it also reads index 30 in an array whose last valid index is 29' },
      { id: 'c', text: 'total overflows int after 7 additions' },
      { id: 'd', text: 'The array was never initialised, so its elements are null' },
    ],
    correctRootCauseId: 'b',
    fixOptions: [
      { id: 'a', text: 'Allocate the array with new int[31]' },
      { id: 'b', text: 'Catch ArrayIndexOutOfBoundsException and return the total so far' },
      { id: 'c', text: 'Start the loop at length - 8' },
      { id: 'd', text: 'Use a half-open range: start inclusive, end exclusive', code: 'for (int i = dailySignups.length - 7; i < dailySignups.length; i++) {' },
    ],
    correctFixId: 'd',
    explanation:
      'Valid indexes run from 0 to length - 1. The loop starts correctly at length - 7 (index 23) but `<=` makes it run 8 times and reach index 30, which the JVM bounds-check rejects. The message even tells you the index and the length. The idiomatic pattern is a half-open range `[start, length)`, which yields exactly 7 elements. Growing the array or catching the exception would hide the bug and still sum the wrong number of days.',
    prevention: [
      'Use half-open ranges (`i < length`) by default; count the iterations: end - start.',
      'Prefer enhanced for loops, streams or Arrays.stream(a, from, to) when you do not need the index.',
      'Test boundaries: arrays of exactly 7 and 8 elements.',
    ],
    hints: ['The exception says index 30 for length 30. What is the largest valid index?', 'How many times does the loop body run?'],
  }),

  // -------------------------------------------------------------------------
  // io
  // -------------------------------------------------------------------------
  hunt({
    id: 'bug-x-files-lines-leak',
    title: 'Log scanner dies with "Too many open files"',
    moduleId: 'io',
    difficulty: 'intermediate',
    category: 'Resource leak',
    symptom:
      'A monitoring endpoint scans the application log for ERROR lines on every request. After a few hours under load it fails with FileSystemException "Too many open files", and other parts of the service start failing to open sockets too. A restart fixes it for a while.',
    evidence: `Exception in thread "main" java.nio.file.FileSystemException: /tmp/app4203895369248405067.log: Too many open files
	at java.base/sun.nio.fs.UnixException.translateToIOException(UnixException.java:100)
	at java.base/sun.nio.fs.UnixException.rethrowAsIOException(UnixException.java:106)
	at java.base/sun.nio.fs.UnixException.rethrowAsIOException(UnixException.java:111)
	at java.base/sun.nio.fs.UnixFileSystemProvider.newFileChannel(UnixFileSystemProvider.java:224)
	at java.base/java.nio.channels.FileChannel.open(FileChannel.java:309)
	at java.base/java.nio.channels.FileChannel.open(FileChannel.java:369)
	at java.base/java.nio.file.Files.lines(Files.java:4125)
	at java.base/java.nio.file.Files.lines(Files.java:4220)
	at LogScanner.countErrors(Main.java:8)
	at Main.main(Main.java:20)`,
    code: `import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.stream.Stream;

class LogScanner {
    long countErrors(Path file) throws IOException {
        Stream<String> lines = Files.lines(file);
        return lines.filter(line -> line.contains("ERROR")).count();
    }
}

public class Main {
    public static void main(String[] args) throws IOException {
        Path file = Files.createTempFile("app", ".log");
        Files.writeString(file, "INFO started\\nERROR payment declined\\nINFO done\\n");
        LogScanner scanner = new LogScanner();
        long total = 0;
        for (int request = 0; request < 100_000; request++) {
            total += scanner.countErrors(file);
        }
        System.out.println("errors seen: " + total);
    }
}`,
    bugMarkers: ['Stream<String> lines = Files.lines(file);'],
    rootCauseOptions: [
      { id: 'a', text: 'count() is a terminal operation that reads the whole file into memory' },
      { id: 'b', text: 'Files.lines opens a file channel that stays open until the stream is closed; terminal operations like count() do not close it, so every call leaks a descriptor' },
      { id: 'c', text: 'The temp file is deleted while it is being read' },
      { id: 'd', text: 'Files.lines uses the platform default charset and fails on non-ASCII lines' },
    ],
    correctRootCauseId: 'b',
    fixOptions: [
      { id: 'a', text: 'Raise the process file descriptor limit (ulimit -n)' },
      { id: 'b', text: 'Call System.gc() every 1000 requests so the channels get cleaned up' },
      { id: 'c', text: 'Close the stream with try-with-resources', code: `try (Stream<String> lines = Files.lines(file)) {
    return lines.filter(line -> line.contains("ERROR")).count();
}` },
      { id: 'd', text: 'Add .parallel() so the file is processed faster' },
    ],
    correctFixId: 'c',
    explanation:
      'Unlike most streams, the stream returned by `Files.lines` (and `Files.list`, `Files.walk`, `Files.find`) is backed by an open OS resource. Its Javadoc says it must be used in a try-with-resources statement. A terminal operation consumes the elements but never calls `close()`, so each request leaves one file descriptor behind until the process limit is reached; then any open (files, sockets) fails. Note that Files.lines reads UTF-8, not the platform charset. Raising limits or hoping for GC only delays the failure.',
    prevention: [
      'Treat every stream from Files.lines/list/walk/find as a Closeable and open it in try-with-resources.',
      'Alert on open file descriptor count (e.g. process_open_fds) relative to the limit.',
      'Enable static analysis rules for unclosed resources; they flag Files.lines without try.',
    ],
    hints: ['What OS resource does Files.lines need while you read lines?', 'Which method call would release it, and does anything call it?'],
  }),

  // -------------------------------------------------------------------------
  // testing
  // -------------------------------------------------------------------------
  hunt({
    id: 'bug-x-test-swallows-assertion',
    title: 'Green test, but negative withdrawals increase the balance',
    moduleId: 'testing',
    difficulty: 'intermediate',
    category: 'Test that cannot fail',
    symptom:
      'A customer withdrew -5000 cents through the API and their balance went up by 50.00. The team is confused, because there is a test named withdrawRejectsNegativeAmount and CI has been green for months. The snippet below reproduces the test with a tiny fail() helper (JUnit\'s fail() also throws an AssertionError subclass).',
    evidence: `PASSED withdrawRejectsNegativeAmount
balance after withdraw(-5000): 15000`,
    code: `class Account {
    private long balanceCents;

    Account(long balanceCents) {
        this.balanceCents = balanceCents;
    }

    void withdraw(long amountCents) {
        if (amountCents > balanceCents) {
            throw new IllegalStateException("insufficient funds");
        }
        balanceCents -= amountCents;
    }

    long balanceCents() {
        return balanceCents;
    }
}

public class Main {
    static void fail(String message) {
        throw new AssertionError(message);
    }

    static void withdrawRejectsNegativeAmount() {
        Account account = new Account(10_000);
        try {
            account.withdraw(-5_000);
            fail("expected IllegalArgumentException");
        } catch (Throwable expected) {
            // the account rejected the amount, as it should
        }
    }

    public static void main(String[] args) {
        withdrawRejectsNegativeAmount();
        System.out.println("PASSED withdrawRejectsNegativeAmount");

        Account account = new Account(10_000);
        account.withdraw(-5_000);
        System.out.println("balance after withdraw(-5000): " + account.balanceCents());
    }
}`,
    bugMarkers: ['} catch (Throwable expected) {'],
    rootCauseOptions: [
      { id: 'a', text: 'The test never calls withdraw' },
      { id: 'b', text: 'withdraw throws IllegalStateException instead of IllegalArgumentException, so the test should fail but the runner ignores the type' },
      { id: 'c', text: 'catch (Throwable) also catches the AssertionError thrown by fail(), so the test passes whether or not withdraw validates its input' },
      { id: 'd', text: 'Assertions are disabled at runtime because the JVM was started without -ea' },
    ],
    correctRootCauseId: 'c',
    fixOptions: [
      { id: 'a', text: 'Assert the specific exception type with assertThrows (or catch only IllegalArgumentException), then fix withdraw so the now-red test passes', code: `IllegalArgumentException e = assertThrows(IllegalArgumentException.class,
        () -> account.withdraw(-5_000));
// and in Account.withdraw:
if (amountCents <= 0) throw new IllegalArgumentException("amount must be positive");` },
      { id: 'b', text: 'Catch Exception instead of Throwable', code: '} catch (Exception expected) {' },
      { id: 'c', text: 'Run the tests with -ea so fail() works' },
      { id: 'd', text: 'Add a log statement inside the catch block' },
    ],
    correctFixId: 'a',
    explanation:
      '`fail()` works by throwing an AssertionError. The broad `catch (Throwable)` catches that error too, so the test cannot fail: if withdraw throws, the catch passes; if it does not, fail() throws and the catch still passes. Meanwhile the real Account has no check for negative amounts. Catching `Exception` (option b) happens to let AssertionError through here, but still accepts the wrong exception type (e.g. a NullPointerException) as success. `assertThrows` with the precise type is the clear, robust form. -ea only affects the `assert` keyword, not explicitly thrown AssertionErrors.',
    prevention: [
      'Use assertThrows for expected exceptions instead of try/fail/catch.',
      'Never catch Throwable or Error in tests.',
      'Watch a new test fail before making it pass (red-green), or use mutation testing (e.g. PIT) to find tests that cannot fail.',
    ],
    hints: ['How does fail() signal a failure?', 'Which exception types does catch (Throwable) catch?'],
  }),

  // -------------------------------------------------------------------------
  // design
  // -------------------------------------------------------------------------
  hunt({
    id: 'bug-x-strategy-fallthrough',
    title: 'Express customers get standard shipping',
    moduleId: 'design',
    difficulty: 'beginner',
    category: 'Strategy selection',
    symptom:
      'Customers who paid for express shipping complain that their parcels arrive in 5 days, and finance notices express revenue dropped to zero after a refactoring that introduced a ShippingStrategy per method. No errors are logged.',
    evidence: `express -> standard 519
standard -> standard 519
pickup -> pickup 0`,
    code: `interface ShippingStrategy {
    String name();
    long priceCents(int weightGrams);
}

class StandardShipping implements ShippingStrategy {
    public String name() { return "standard"; }
    public long priceCents(int weightGrams) { return 499 + weightGrams / 100; }
}

class ExpressShipping implements ShippingStrategy {
    public String name() { return "express"; }
    public long priceCents(int weightGrams) { return 1499 + weightGrams / 50; }
}

class PickupShipping implements ShippingStrategy {
    public String name() { return "pickup"; }
    public long priceCents(int weightGrams) { return 0; }
}

class ShippingFactory {
    static ShippingStrategy forMethod(String method) {
        ShippingStrategy strategy;
        switch (method) {
            case "express":
                strategy = new ExpressShipping();
            case "standard":
                strategy = new StandardShipping();
                break;
            case "pickup":
                strategy = new PickupShipping();
                break;
            default:
                strategy = new StandardShipping();
        }
        return strategy;
    }
}

public class Main {
    public static void main(String[] args) {
        for (String method : new String[] {"express", "standard", "pickup"}) {
            ShippingStrategy s = ShippingFactory.forMethod(method);
            System.out.println(method + " -> " + s.name() + " " + s.priceCents(2000));
        }
    }
}`,
    bugMarkers: ['strategy = new ExpressShipping();'],
    rootCauseOptions: [
      { id: 'a', text: 'switch on String compares with ==, so "express" never matches' },
      { id: 'b', text: 'The "express" case has no break, so execution falls through into the "standard" case and overwrites the strategy' },
      { id: 'c', text: 'ExpressShipping does not override priceCents' },
      { id: 'd', text: 'The default branch is evaluated for every input' },
    ],
    correctRootCauseId: 'b',
    fixOptions: [
      { id: 'a', text: 'Move the "express" case to the end of the switch' },
      { id: 'b', text: 'Compare with method.equals("express") in an if before the switch' },
      { id: 'c', text: 'Use an enum and an exhaustive switch expression: arrow cases never fall through, and unknown input fails loudly instead of silently becoming standard', code: `enum ShippingMethod { EXPRESS, STANDARD, PICKUP }

static ShippingStrategy forMethod(ShippingMethod method) {
    return switch (method) {
        case EXPRESS -> new ExpressShipping();
        case STANDARD -> new StandardShipping();
        case PICKUP -> new PickupShipping();
    };
}` },
      { id: 'd', text: 'Make the strategy variable final' },
    ],
    correctFixId: 'c',
    explanation:
      'In a classic `case X:` switch, execution continues into the next case unless a `break` (or return) stops it. "express" matches correctly (String switches use equals via hashCode), assigns ExpressShipping, then falls into the "standard" case and replaces it. The `default` branch hides a second problem: a typo like "Express" silently becomes standard shipping. A switch expression over an enum has no fall-through, must be exhaustive (the compiler checks), and parsing the input with `ShippingMethod.valueOf` rejects unknown values. Note that `final` (option d) would actually turn the double assignment into a compile error, but it does not restore the intended behaviour by itself.',
    prevention: [
      'Prefer switch expressions with `->` cases; they cannot fall through.',
      'Model closed sets of choices as enums (or a Map<Method, Strategy>) instead of raw strings.',
      'Do not let `default` silently pick a business behaviour; throw for unknown values.',
      'Test every strategy selection path, not only the default one.',
    ],
    hints: ['Trace the switch for "express" line by line. Where does execution stop?', 'What does a missing break do in a colon-style case?'],
  }),

  // -------------------------------------------------------------------------
  // dsa
  // -------------------------------------------------------------------------
  hunt({
    id: 'bug-x-binary-search-hang',
    title: 'Price lookup pins a CPU core forever',
    moduleId: 'dsa',
    difficulty: 'intermediate',
    category: 'Binary search',
    symptom:
      'A pricing request never returns and one CPU core sits at 100%. Lookups for amounts below the first price break work; amounts between two breaks hang. A thread dump taken twice, seconds apart, shows the same frame both times.',
    evidence: `"main" #1 [2023] prio=5 os_prio=0 cpu=4207.41ms elapsed=4.40s tid=0x00007fa5c4019500 nid=2023 runnable  [0x00007fa5c9ffd000]
   java.lang.Thread.State: RUNNABLE
	at Main.firstAtLeast(Main.java:13)
	at Main.main(Main.java:20)`,
    code: `public class Main {
    /** Index of the first element >= target, or a.length if there is none. */
    static int firstAtLeast(int[] sorted, int target) {
        int lo = 0;
        int hi = sorted.length;
        while (lo < hi) {
            int mid = (lo + hi) / 2;
            if (sorted[mid] < target) {
                lo = mid;
            } else {
                hi = mid;
            }
        }
        return lo;
    }

    public static void main(String[] args) {
        int[] priceBreaks = {10, 20, 30, 40};
        System.out.println(firstAtLeast(priceBreaks, 5));
        System.out.println(firstAtLeast(priceBreaks, 25));
    }
}`,
    bugMarkers: ['lo = mid;'],
    rootCauseOptions: [
      { id: 'a', text: '(lo + hi) / 2 overflows int and produces a negative index' },
      { id: 'b', text: 'When sorted[mid] < target the code sets lo = mid; once hi = lo + 1, mid equals lo, so the range never shrinks and the loop never ends' },
      { id: 'c', text: 'The array is not sorted' },
      { id: 'd', text: 'hi should start at sorted.length - 1' },
    ],
    correctRootCauseId: 'b',
    fixOptions: [
      { id: 'a', text: 'Exclude mid, which is known to be too small: lo = mid + 1', code: `if (sorted[mid] < target) {
    lo = mid + 1;
} else {
    hi = mid;
}` },
      { id: 'b', text: 'Compute mid as lo + (hi - lo) / 2' },
      { id: 'c', text: 'Round mid up: (lo + hi + 1) / 2' },
      { id: 'd', text: 'Change the loop condition to lo <= hi' },
    ],
    correctFixId: 'a',
    explanation:
      'Every iteration must shrink [lo, hi). With target 25: lo=0, hi=4 -> mid=2 (30 >= 25) hi=2 -> mid=1 (20 < 25) lo=1 -> mid=1 again, forever. Since sorted[mid] < target, mid can never be the answer, so `lo = mid + 1` is both correct and guarantees progress. `lo + (hi - lo) / 2` fixes a different bug (overflow for arrays over about 1 billion elements). Rounding mid up makes `hi = mid` stall instead (lo=1, hi=2 -> mid=2 -> hi=2). `lo <= hi` with `hi = mid` never terminates once lo == hi.',
    prevention: [
      'State the loop invariant (here: answer is in [lo, hi]) and check that every branch strictly shrinks the range.',
      'Use Arrays.binarySearch or TreeMap.ceilingKey when they fit.',
      'Test with targets below, between, equal to and above every element, and with arrays of length 0, 1 and 2.',
    ],
    hints: ['Simulate target 25 by hand and write down lo, hi and mid each iteration.', 'If sorted[mid] < target, can mid be the answer?'],
  }),

  // -------------------------------------------------------------------------
  // spring (modelled in plain Java)
  // -------------------------------------------------------------------------
  hunt({
    id: 'bug-x-transactional-self-call',
    title: 'Bulk import fails: "No transaction in progress"',
    moduleId: 'spring',
    difficulty: 'advanced',
    category: 'Proxy / @Transactional',
    symptom:
      'Placing a single order through the API works. The new CSV bulk import, which loops over rows and calls the same @Transactional placeOrder method, fails on the first row. The snippet models Spring\'s behaviour with a JDK dynamic proxy that opens a transaction only for methods annotated with a custom @Transactional; the real Spring error is similar ("No EntityManager with actual transaction available for current thread").',
    evidence: `persisted book
Exception in thread "main" java.lang.IllegalStateException: No transaction in progress for current thread - cannot reliably process 'persist' call
	at OrderRepository.persist(Main.java:24)
	at OrderServiceImpl.placeOrder(Main.java:46)
	at OrderServiceImpl.importOrders(Main.java:40)
	at java.base/jdk.internal.reflect.DirectMethodHandleAccessor.invoke(DirectMethodHandleAccessor.java:103)
	at java.base/java.lang.reflect.Method.invoke(Method.java:580)
	at TxProxy.lambda$wrap$0(Main.java:61)
	at $Proxy0.importOrders(Unknown Source)
	at Main.main(Main.java:75)`,
    code: `import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.util.List;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@interface Transactional {}

final class Tx {
    private static final ThreadLocal<Boolean> ACTIVE = ThreadLocal.withInitial(() -> false);
    static boolean active() { return ACTIVE.get(); }
    static void begin() { ACTIVE.set(true); }
    static void end() { ACTIVE.set(false); }
}

class OrderRepository {
    void persist(String item) {
        if (!Tx.active()) {
            throw new IllegalStateException("No transaction in progress for current thread - cannot reliably process 'persist' call");
        }
        System.out.println("persisted " + item);
    }
}

interface OrderService {
    void importOrders(List<String> items);
    void placeOrder(String item);
}

class OrderServiceImpl implements OrderService {
    private final OrderRepository repository = new OrderRepository();

    public void importOrders(List<String> items) {
        for (String item : items) {
            this.placeOrder(item);
        }
    }

    @Transactional
    public void placeOrder(String item) {
        repository.persist(item);
    }
}

/** A tiny stand-in for Spring's transactional proxy. */
final class TxProxy {
    static OrderService wrap(OrderService target) {
        return (OrderService) Proxy.newProxyInstance(
            OrderService.class.getClassLoader(),
            new Class<?>[] {OrderService.class},
            (proxy, method, args) -> {
                Method impl = target.getClass().getMethod(method.getName(), method.getParameterTypes());
                boolean tx = impl.isAnnotationPresent(Transactional.class);
                if (tx) Tx.begin();
                try {
                    return method.invoke(target, args);
                } catch (InvocationTargetException e) {
                    throw e.getCause();
                } finally {
                    if (tx) Tx.end();
                }
            });
    }
}

public class Main {
    public static void main(String[] args) {
        OrderService service = TxProxy.wrap(new OrderServiceImpl());
        service.placeOrder("book");
        service.importOrders(List.of("lamp", "desk"));
    }
}`,
    bugMarkers: ['this.placeOrder(item);'],
    rootCauseOptions: [
      { id: 'a', text: 'ThreadLocal values are not visible inside a for loop' },
      { id: 'b', text: 'importOrders calls placeOrder on `this`, the raw target object, so the call never goes through the proxy and the @Transactional advice never runs' },
      { id: 'c', text: 'The @Transactional annotation is not retained at runtime' },
      { id: 'd', text: 'List.of creates an immutable list, which cannot be persisted' },
    ],
    correctRootCauseId: 'b',
    fixOptions: [
      { id: 'a', text: 'Make placeOrder private so only importOrders can call it' },
      { id: 'b', text: 'Mark importOrders synchronized' },
      { id: 'c', text: 'Put the transaction boundary on the method external callers invoke through the proxy (here: annotate importOrders, so the whole import is one transaction), or move placeOrder into a separate bean that importOrders calls', code: `@Transactional
public void importOrders(List<String> items) {
    for (String item : items) {
        placeOrder(item);
    }
}` },
      { id: 'd', text: 'Replace this.placeOrder(item) with placeOrder(item)' },
    ],
    correctFixId: 'c',
    explanation:
      'Spring implements @Transactional with a proxy that wraps the bean. Only calls that enter through the proxy are intercepted. Inside the bean, `this` is the target object itself, so a self-invocation bypasses the proxy: the stack trace shows `$Proxy0.importOrders` but then a direct `OrderServiceImpl.importOrders -> placeOrder` call with no proxy in between. Writing `placeOrder(item)` without `this` is the same call. Making the method private makes it worse (proxies cannot intercept private methods). Annotating the entry point or extracting the transactional method into another bean puts the proxy back on the call path; which one depends on whether the import should be all-or-nothing or per row.',
    prevention: [
      'Put @Transactional on public methods that are called from other beans, usually the service entry point.',
      'Remember that self-invocation bypasses proxy-based advice (@Transactional, @Async, @Cacheable).',
      'Write an integration test that asserts a rollback actually happens for the import path.',
    ],
    hints: ['Look at the stack trace: which frames are between $Proxy0 and placeOrder?', 'What object does `this` refer to inside OrderServiceImpl?'],
  }),

  // -------------------------------------------------------------------------
  // performance
  // -------------------------------------------------------------------------
  hunt({
    id: 'bug-x-regex-per-call',
    title: 'CSV import spends its time compiling regexes',
    moduleId: 'performance',
    difficulty: 'intermediate',
    category: 'Hot-path allocation',
    symptom:
      'The nightly import of 2 million product rows got 3x slower after SKU validation was added, and GC activity doubled. A JFR recording of the importer shows where the CPU goes.',
    evidence: `$ jfr view hot-methods import.jfr
Method                                                         Samples Percent
-------------------------------------------------------------- ------- -------
java.util.regex.Pattern$BmpCharProperty.match(Matcher, int, CharSequence) 117  17.13%
java.util.regex.Pattern.expr(Pattern$Node)                                  82  12.01%
java.util.regex.Pattern.clazz(boolean)                                      78  11.42%
java.util.regex.Pattern.compile()                                           33   4.83%
java.util.regex.Pattern.matcher(CharSequence)                               33   4.83%
java.util.regex.Pattern.sequence(Pattern$Node)                              32   4.69%
java.util.regex.Pattern.<init>(String, int)                                 15   2.20%
java.util.regex.Pattern$CharProperty.study(Pattern$TreeInfo)                13   1.90%`,
    code: `import java.util.ArrayList;
import java.util.List;

class CsvImporter {
    List<String> validSkus(List<String> rows) {
        List<String> valid = new ArrayList<>();
        for (String row : rows) {
            String sku = row.substring(0, row.indexOf(','));
            if (sku.matches("[A-Z]{3}-\\\\d{4}")) {
                valid.add(sku);
            }
        }
        return valid;
    }
}

public class Main {
    public static void main(String[] args) {
        List<String> rows = new ArrayList<>();
        for (int i = 0; i < 2_000_000; i++) {
            rows.add((i % 10 == 0 ? "bad-" : "ABC-") + String.format("%04d", i % 10_000) + ",19.99");
        }
        System.out.println(new CsvImporter().validSkus(rows).size());
    }
}`,
    bugMarkers: ['if (sku.matches('],
    rootCauseOptions: [
      { id: 'a', text: 'substring copies the row, which is the main cost' },
      { id: 'b', text: 'String.matches calls Pattern.compile on every invocation, so the regex is parsed and compiled 2 million times (expr, clazz, sequence, <init> in the profile)' },
      { id: 'c', text: 'The regex is catastrophically backtracking on long inputs' },
      { id: 'd', text: 'ArrayList resizing dominates the run time' },
    ],
    correctRootCauseId: 'b',
    fixOptions: [
      { id: 'a', text: 'Compile the pattern once into a static final constant and reuse it', code: `private static final Pattern SKU = Pattern.compile("[A-Z]{3}-\\\\d{4}");
// ...
if (SKU.matcher(sku).matches()) {` },
      { id: 'b', text: 'Cache the result of matches() per SKU in an unbounded HashMap' },
      { id: 'c', text: 'Process the rows with parallelStream() to use more cores' },
      { id: 'd', text: 'Increase the heap with -Xmx so the GC runs less often' },
    ],
    correctFixId: 'a',
    explanation:
      '`String.matches(regex)` is shorthand for `Pattern.matches(regex, this)`, which compiles a new Pattern each time (only a few single-character split patterns have a fast path, and matches has none). Compiling parses the regex into a node graph (`expr`, `clazz`, `sequence`, `study` in the profile) and allocates objects that the GC must then collect. A `Pattern` is immutable and thread-safe, so one static instance can serve all calls; only the Matcher is per use. Parallelism or more heap multiply or hide the waste, and an unbounded cache creates a memory leak.',
    prevention: [
      'Hoist Pattern.compile out of loops and hot methods into static final constants.',
      'Treat String.matches, replaceAll and split (with non-trivial regexes) as "compile every call" in hot paths.',
      'Profile with JFR (jfr view hot-methods / allocation-by-class) before and after a change.',
    ],
    hints: ['Which Pattern methods in the profile are about building a regex rather than running it?', 'What does String.matches do internally?'],
  }),

  // -------------------------------------------------------------------------
  // production
  // -------------------------------------------------------------------------
  hunt({
    id: 'bug-x-retry-storm',
    title: 'Retries turn a blip into an outage',
    moduleId: 'production',
    difficulty: 'intermediate',
    category: 'Retry storm',
    symptom:
      'The inventory service had a 30-second deploy hiccup and returned 503s. Instead of recovering, its request rate jumped from about 400/s to 38,000/s and it stayed down for 25 minutes, until the checkout service was scaled to zero. The checkout logs are flooded with retry warnings.',
    evidence: `WARN attempt 18341 failed: 503 Service Unavailable, retrying
WARN attempt 18342 failed: 503 Service Unavailable, retrying
WARN attempt 18343 failed: 503 Service Unavailable, retrying
WARN attempt 18344 failed: 503 Service Unavailable, retrying
... (2.1 million lines in 10 minutes across 60 checkout pods)`,
    code: `import java.util.function.Supplier;

class InventoryClient {
    private int calls;

    String fetchStock(String sku) {
        calls++;
        if (calls <= 5) {
            throw new IllegalStateException("503 Service Unavailable");
        }
        return sku + "=12";
    }
}

class Retry {
    static <T> T call(Supplier<T> action) {
        int attempt = 0;
        while (true) {
            attempt++;
            try {
                return action.get();
            } catch (RuntimeException e) {
                System.out.println("WARN attempt " + attempt + " failed: " + e.getMessage() + ", retrying");
            }
        }
    }
}

public class Main {
    public static void main(String[] args) {
        InventoryClient client = new InventoryClient();
        System.out.println(Retry.call(() -> client.fetchStock("SKU-42")));
    }
}`,
    bugMarkers: ['while (true) {', 'retrying");'],
    rootCauseOptions: [
      { id: 'a', text: 'The inventory service is under-provisioned and needs more instances' },
      { id: 'b', text: 'Retries are unbounded and immediate (no limit, no backoff, no jitter), so every caller hammers the struggling service in a tight loop and amplifies the load' },
      { id: 'c', text: 'Logging the warning on every attempt is what slows the service down' },
      { id: 'd', text: 'Supplier is not thread-safe' },
    ],
    correctRootCauseId: 'b',
    fixOptions: [
      { id: 'a', text: 'Remove the log line so retries are faster' },
      { id: 'b', text: 'Retry in parallel threads to get an answer sooner' },
      { id: 'c', text: 'Retry at most a few times with exponential backoff and jitter, only for retryable errors, then fail (ideally behind a circuit breaker)', code: `for (int attempt = 1; ; attempt++) {
    try {
        return action.get();
    } catch (RuntimeException e) {
        if (attempt >= 4 || !isRetryable(e)) throw e;
        long capMs = Math.min(2_000, 100L << attempt);
        Thread.sleep(ThreadLocalRandom.current().nextLong(capMs)); // full jitter
    }
}` },
      { id: 'd', text: 'Catch Exception instead of RuntimeException so more failures are retried' },
    ],
    correctFixId: 'c',
    explanation:
      'A retry loop with no limit and no delay turns each failing request into thousands of requests per second. Multiplied by every caller, a brief outage becomes a self-sustaining overload: the service cannot recover because the retries keep it saturated. Bounded attempts cap the amplification, exponential backoff gives the service room, jitter spreads synchronized clients apart, and a circuit breaker stops calling entirely while the dependency is down. Only retry errors that are plausibly transient (503, timeouts), never 4xx validation errors. (The fix snippet needs to declare or handle InterruptedException.)',
    prevention: [
      'Every retry policy needs a max attempt count (or deadline), backoff and jitter.',
      'Use a circuit breaker and retry budgets (e.g. retries at most 10% of requests).',
      'Alert on the ratio of retries to requests per dependency.',
      'Load-test failure modes: what happens to callers when a dependency returns 503 for a minute?',
    ],
    hints: ['How many times can this loop run, and how long does it wait between attempts?', 'Multiply one caller\'s behaviour by 60 pods and thousands of requests.'],
  }),
  hunt({
    id: 'bug-x-secret-in-logs',
    title: 'Passwords found in the log aggregator',
    moduleId: 'production',
    difficulty: 'beginner',
    category: 'Sensitive data exposure',
    symptom:
      'A security review found plaintext passwords and MFA codes in the centralized logs, which 200 engineers and a third-party vendor can read. The logging line was added during an incident to "see what clients send".',
    evidence: `INFO  AuthService - login attempt LoginRequest[username=ada, password=correct-horse-battery, mfaCode=492817]`,
    code: `record LoginRequest(String username, String password, String mfaCode) {}

class AuthService {
    boolean login(LoginRequest request) {
        System.out.println("INFO  AuthService - login attempt " + request);
        return request.password().length() >= 12;
    }
}

public class Main {
    public static void main(String[] args) {
        new AuthService().login(new LoginRequest("ada", "correct-horse-battery", "492817"));
    }
}`,
    bugMarkers: ['login attempt " + request'],
    rootCauseOptions: [
      { id: 'a', text: 'The log level is INFO instead of DEBUG' },
      { id: 'b', text: 'The whole request object is logged, and a record\'s generated toString includes every component, including the password and MFA code' },
      { id: 'c', text: 'Records are serialized to JSON automatically when logged' },
      { id: 'd', text: 'String concatenation with + exposes private fields' },
    ],
    correctRootCauseId: 'b',
    fixOptions: [
      { id: 'a', text: 'Change the statement to DEBUG level' },
      { id: 'b', text: 'Log only the non-sensitive fields you need, and override toString on the record so secrets are redacted even if someone logs the object later', code: `record LoginRequest(String username, String password, String mfaCode) {
    @Override
    public String toString() {
        return "LoginRequest[username=" + username + ", password=***, mfaCode=***]";
    }
}
// in login():
System.out.println("INFO  AuthService - login attempt for user=" + request.username());` },
      { id: 'c', text: 'Base64-encode the password before logging it' },
      { id: 'd', text: 'Delete the log files older than 7 days' },
    ],
    correctFixId: 'b',
    explanation:
      'The implicit `toString()` of a record prints every component by name, so concatenating the request into a log message writes the password and MFA code in plaintext. Changing the level only hides it until someone enables DEBUG during the next incident; Base64 is an encoding, not encryption. Log only the fields you need and make secret-carrying types safe by default with a redacting toString (or a wrapper type such as a Secret class). Already-written logs must be purged and the affected credentials rotated.',
    prevention: [
      'Never log whole request/DTO objects; log explicit, non-sensitive fields.',
      'Give types that hold secrets a redacting toString, or wrap secrets in a dedicated type.',
      'Add log scrubbing/masking in the logging pipeline and secret scanning on log storage.',
      'Treat leaked credentials as compromised: purge logs and force rotation.',
    ],
    hints: ['What does a record\'s toString print?', 'Would changing the log level remove the data or just hide it for now?'],
  }),
];
