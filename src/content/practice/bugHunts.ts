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

export const BUG_HUNT_LIST: BugHunt[] = [
  hunt({
    id: 'bh-npe-discount',
    title: 'Checkout crashes for some products',
    moduleId: 'types',
    difficulty: 'beginner',
    category: 'NullPointerException',
    symptom: 'Checkout fails with HTTP 500 for a few products, while most work. The log shows a NullPointerException in `Pricing.finalPrice`.',
    evidence: `java.lang.NullPointerException: Cannot invoke "java.lang.Integer.intValue()" because the return value of "java.util.Map.get(Object)" is null
    at Pricing.finalPrice(Main.java:13)
    at Main.main(Main.java:20)`,
    code: `import java.util.HashMap;
import java.util.Map;

class Pricing {
    private final Map<String, Integer> discountPercent = new HashMap<>();

    Pricing() {
        discountPercent.put("SKU-1", 10);
        discountPercent.put("SKU-2", 25);
    }

    long finalPrice(String sku, long cents) {
        int percent = discountPercent.get(sku);
        return cents - cents * percent / 100;
    }
}

public class Main {
    public static void main(String[] args) {
        System.out.println(new Pricing().finalPrice("SKU-9", 1000));
    }
}`,
    bugMarkers: ['int percent = discountPercent.get(sku);'],
    rootCauseOptions: [
      { id: 'a', text: 'The map is not thread-safe' },
      { id: 'b', text: 'Products without a discount return null from get(), and unboxing null into an int throws' },
      { id: 'c', text: 'Integer division truncates the discount' },
      { id: 'd', text: 'The SKU string has trailing whitespace' },
    ],
    correctRootCauseId: 'b',
    fixOptions: [
      { id: 'a', text: 'Wrap the call in try/catch and return 0' },
      { id: 'b', text: 'Use getOrDefault so missing SKUs mean 0% discount', code: 'int percent = discountPercent.getOrDefault(sku, 0);' },
      { id: 'c', text: 'Change the map to Map<String, String>' },
      { id: 'd', text: 'Add every SKU in the catalogue to the map at startup' },
    ],
    correctFixId: 'b',
    explanation:
      '`get` returns null for keys that are absent. Assigning the result to an `int` auto-unboxes it with `intValue()`, which throws. Java 15+ helpful NPE messages name the exact expression. `getOrDefault` encodes the business rule ("no entry means no discount") explicitly. Catching the exception would hide other bugs, and pre-populating every SKU is fragile.',
    prevention: [
      'Treat `Map.get` results as nullable; prefer getOrDefault, Optional or explicit checks.',
      'Use primitives only when a value can never be absent.',
      'Add a test for the "not configured" case of every lookup table.',
    ],
    hints: ['Read the helpful NPE message carefully: which call returned null?', 'Which products have entries in the map?'],
  }),
  hunt({
    id: 'bh-duplicate-customers',
    title: 'Duplicate customers in the marketing export',
    moduleId: 'oop',
    difficulty: 'intermediate',
    category: 'equals/hashCode',
    symptom: 'The weekly export deduplicates customers with a HashSet, but the file still contains the same customer several times.',
    evidence: `export.csv
ada@example.com,Ada
ada@example.com,Ada
linus@example.com,Linus
ada@example.com,Ada`,
    code: `import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

class Customer {
    final String email;
    final String name;

    Customer(String email, String name) {
        this.email = email;
        this.name = name;
    }

    @Override
    public boolean equals(Object o) {
        return o instanceof Customer c && email.equalsIgnoreCase(c.email);
    }
}

public class Main {
    public static void main(String[] args) {
        Set<Customer> unique = new HashSet<>();
        for (Customer c : List.of(new Customer("ada@example.com", "Ada"), new Customer("ADA@example.com", "Ada"))) {
            unique.add(c);
        }
        System.out.println(unique.size());
    }
}`,
    bugMarkers: ['public boolean equals(Object o) {'],
    rootCauseOptions: [
      { id: 'a', text: 'HashSet does not use equals' },
      { id: 'b', text: 'equals is overridden but hashCode is not, so equal customers land in different buckets' },
      { id: 'c', text: 'The email field is not final' },
      { id: 'd', text: 'List.of creates copies of the customers' },
    ],
    correctRootCauseId: 'b',
    fixOptions: [
      { id: 'a', text: 'Override hashCode consistently with equals (same normalisation of the email)', code: `@Override
public int hashCode() {
    return email.toLowerCase(java.util.Locale.ROOT).hashCode();
}` },
      { id: 'b', text: 'Use a TreeSet without a comparator' },
      { id: 'c', text: 'Override hashCode to return email.hashCode()' },
      { id: 'd', text: 'Call unique.contains(c) before add' },
    ],
    correctFixId: 'a',
    explanation:
      'HashSet first uses hashCode to find a bucket, then equals inside it. Without a matching hashCode, equal customers usually hash differently and equals is never consulted. The hashCode must use the **same** normalisation as equals: `email.hashCode()` would still give different hashes for "ada@" and "ADA@", which equals treats as equal.',
    prevention: [
      'Always override equals and hashCode together, using the same fields and normalisation.',
      'Prefer records for value types, normalising in the compact constructor.',
      'Unit-test: equal objects must have equal hash codes.',
    ],
    hints: ['What does HashSet do before it calls equals?', 'The emails differ in case — what must hashCode do about that?'],
  }),
  hunt({
    id: 'bh-immutable-config',
    title: 'Feature flags cannot be added at runtime',
    moduleId: 'collections',
    difficulty: 'beginner',
    category: 'Collection misuse',
    symptom: 'The admin endpoint that enables a feature flag fails with HTTP 500 on its first use.',
    evidence: `java.lang.UnsupportedOperationException
    at java.base/java.util.ImmutableCollections.uoe(ImmutableCollections.java:142)
    at java.base/java.util.ImmutableCollections$AbstractImmutableCollection.add(ImmutableCollections.java:147)
    at FeatureFlags.enable(Main.java:12)
    at Main.main(Main.java:24)`,
    code: `import java.util.List;

class FeatureFlags {
    private final List<String> enabled;

    FeatureFlags() {
        this.enabled = List.of("search-v2", "dark-mode");
    }

    void enable(String flag) {
        if (!enabled.contains(flag)) {
            enabled.add(flag);
        }
    }

    boolean isEnabled(String flag) {
        return enabled.contains(flag);
    }
}

public class Main {
    public static void main(String[] args) {
        FeatureFlags flags = new FeatureFlags();
        flags.enable("beta-checkout");
        System.out.println(flags.isEnabled("beta-checkout"));
    }
}`,
    bugMarkers: ['this.enabled = List.of('],
    rootCauseOptions: [
      { id: 'a', text: 'contains is not supported on lists' },
      { id: 'b', text: 'List.of returns an unmodifiable list, so add throws UnsupportedOperationException' },
      { id: 'c', text: 'The field is final, so the list cannot change' },
      { id: 'd', text: 'Strings cannot be added to a List<String> created with List.of' },
    ],
    correctRootCauseId: 'b',
    fixOptions: [
      { id: 'a', text: 'Remove the final modifier' },
      { id: 'b', text: 'Copy into a mutable set: new LinkedHashSet<>(List.of(...)) — order kept, no duplicates', code: 'this.enabled = new java.util.LinkedHashSet<>(List.of("search-v2", "dark-mode"));' },
      { id: 'c', text: 'Catch UnsupportedOperationException and ignore it' },
      { id: 'd', text: 'Use Arrays.asList instead of List.of' },
    ],
    correctFixId: 'b',
    explanation:
      '`final` only means the field always refers to the same object; it says nothing about whether that object can change. List.of creates an immutable list. Arrays.asList would also fail on add (fixed-size). A mutable LinkedHashSet fits the domain better: it keeps order and makes "enable" idempotent (the field type changes to Set<String>).',
    prevention: [
      'Know which factory methods return immutable (List.of, toList()) or fixed-size (Arrays.asList) collections.',
      'Choose the collection type from the operations you need (here: unique, mutable, ordered).',
    ],
    hints: ['Look at where the list is created, not where it fails.', 'Does `final` make an object immutable?'],
  }),
  hunt({
    id: 'bh-file-leak',
    title: '"Too many open files" after a few days',
    moduleId: 'exceptions',
    difficulty: 'intermediate',
    category: 'Resource leak',
    symptom: 'An import service starts failing with `java.io.FileNotFoundException: ... (Too many open files)` after running for a few days. Restarting fixes it temporarily. Malformed files are common.',
    evidence: `$ ls /proc/4211/fd | wc -l
4093
$ ulimit -n
4096`,
    code: `import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;

class Importer {
    int countRecords(String path) throws IOException {
        BufferedReader reader = new BufferedReader(new FileReader(path));
        int count = 0;
        String line;
        while ((line = reader.readLine()) != null) {
            if (line.isBlank()) continue;
            if (!line.contains(",")) throw new IllegalArgumentException("malformed line: " + line);
            count++;
        }
        reader.close();
        return count;
    }
}`,
    bugMarkers: ['BufferedReader reader = new BufferedReader(new FileReader(path));', 'reader.close();'],
    rootCauseOptions: [
      { id: 'a', text: 'BufferedReader buffers too much data' },
      { id: 'b', text: 'When a malformed line throws, close() is never reached, so a file descriptor leaks per bad file' },
      { id: 'c', text: 'The garbage collector is too slow' },
      { id: 'd', text: 'readLine reads the whole file into memory' },
    ],
    correctRootCauseId: 'b',
    fixOptions: [
      { id: 'a', text: 'Call System.gc() after each import' },
      { id: 'b', text: 'Raise the OS file descriptor limit' },
      { id: 'c', text: 'Open the reader with try-with-resources', code: `try (BufferedReader reader = new BufferedReader(new FileReader(path))) {
    // ... same loop ...
}` },
      { id: 'd', text: 'Catch IllegalArgumentException and continue' },
    ],
    correctFixId: 'c',
    explanation:
      'The exception path skips `close()`. Each malformed file leaves one descriptor open until the process hits its limit. Garbage collection does not promptly close OS resources (finalization is deprecated). try-with-resources closes on every path; raising limits only delays the failure.',
    prevention: [
      'Use try-with-resources for every Closeable.',
      'Alert on open file descriptor counts (process_open_fds metric).',
      'Static analysis rules (e.g. "resource not closed") catch most of these.',
    ],
    hints: ['Trace what happens when line 12 throws.', 'Which statement is skipped on the exception path?'],
  }),
  hunt({
    id: 'bh-swallowed',
    title: 'The report says revenue was zero',
    moduleId: 'exceptions',
    difficulty: 'beginner',
    category: 'Exception handling',
    symptom: 'After a supplier switched decimal format from "12.50" to "12,50", the nightly revenue report shows 0.00 for every store. No errors appear in the logs.',
    code: `import java.math.BigDecimal;
import java.util.List;

class RevenueReport {
    BigDecimal total(List<String> amounts) {
        BigDecimal sum = BigDecimal.ZERO;
        for (String a : amounts) {
            try {
                sum = sum.add(new BigDecimal(a));
            } catch (Exception e) {
            }
        }
        return sum;
    }
}`,
    bugMarkers: ['} catch (Exception e) {'],
    rootCauseOptions: [
      { id: 'a', text: 'BigDecimal cannot represent money' },
      { id: 'b', text: 'Parse failures are caught by an empty catch, silently skipped, and the total looks valid' },
      { id: 'c', text: 'The loop never runs' },
      { id: 'd', text: 'BigDecimal.add does not modify sum' },
    ],
    correctRootCauseId: 'b',
    fixOptions: [
      { id: 'a', text: 'Log the exception at DEBUG level and continue' },
      { id: 'b', text: 'Catch NumberFormatException specifically, record the bad value with context, and fail the report (or exceed an error threshold) instead of reporting a wrong total', code: `} catch (NumberFormatException e) {
    throw new IllegalStateException("Unparseable amount '" + a + "'", e);
}` },
      { id: 'c', text: 'Replace BigDecimal with double' },
      { id: 'd', text: 'Wrap the whole method in another try/catch' },
    ],
    correctFixId: 'b',
    explanation:
      'An empty catch of `Exception` turns every parse failure into "this amount does not exist". The output still looks like a valid number, so nobody notices. Failing loudly — or at least counting failures and alerting — is better than a confidently wrong report. Note that `sum = sum.add(...)` is correct: BigDecimal is immutable, so the assignment is required.',
    prevention: [
      'Never write empty catch blocks; catch the narrowest exception type.',
      'Make data-quality failures visible: counts, thresholds and alerts.',
      'Validate input formats at the boundary (supplier file parser).',
    ],
    hints: ['What happens to "12,50"?', 'Why are there no errors in the logs?'],
  }),
  hunt({
    id: 'bh-race',
    title: 'Page-view counter loses updates',
    moduleId: 'concurrency',
    difficulty: 'intermediate',
    category: 'Race condition',
    symptom: 'A load test sends exactly 100,000 page views. The counter reports between 61,000 and 97,000 — different every run.',
    code: `import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

class PageViews {
    private int views = 0;

    void record() {
        views++;
    }

    int total() {
        return views;
    }
}

public class Main {
    public static void main(String[] args) throws InterruptedException {
        PageViews counter = new PageViews();
        ExecutorService pool = Executors.newFixedThreadPool(8);
        for (int i = 0; i < 100_000; i++) pool.submit(counter::record);
        pool.shutdown();
        pool.awaitTermination(1, TimeUnit.MINUTES);
        System.out.println(counter.total());
    }
}`,
    bugMarkers: ['views++;'],
    rootCauseOptions: [
      { id: 'a', text: 'The thread pool drops tasks under load' },
      { id: 'b', text: 'views++ is a read-modify-write sequence; concurrent threads overwrite each other\'s increments' },
      { id: 'c', text: 'int overflows' },
      { id: 'd', text: 'awaitTermination returns too early' },
    ],
    correctRootCauseId: 'b',
    fixOptions: [
      { id: 'a', text: 'Mark views as volatile' },
      { id: 'b', text: 'Use an AtomicInteger (or LongAdder for high contention)', code: `private final java.util.concurrent.atomic.LongAdder views = new java.util.concurrent.atomic.LongAdder();

void record() { views.increment(); }
int total() { return views.intValue(); }` },
      { id: 'c', text: 'Use a single-threaded executor' },
      { id: 'd', text: 'Add Thread.sleep(1) in record()' },
    ],
    correctFixId: 'b',
    explanation:
      '`views++` reads, adds and writes back. Two threads can read the same value and both write value + 1, losing one increment. `volatile` fixes visibility but not atomicity. Atomic classes perform the update with a compare-and-set loop; LongAdder spreads contention across cells and is faster for frequently updated counters. A single-threaded executor "works" but throws away the parallelism.',
    prevention: [
      'Treat any shared mutable state as a concurrency design decision.',
      'Use java.util.concurrent atomics and concurrent collections.',
      'Load tests with assertions on exact counts catch lost updates.',
    ],
    hints: ['How many bytecode operations is views++?', 'Does volatile make ++ atomic?'],
  }),
  hunt({
    id: 'bh-deadlock',
    title: 'Transfers hang forever',
    moduleId: 'concurrency',
    difficulty: 'advanced',
    category: 'Deadlock',
    symptom: 'Under concurrent load, some money transfers never complete. CPU is idle and the transfer threads are stuck.',
    evidence: `Found one Java-level deadlock:
=============================
"transfer-2":
  waiting to lock monitor 0x00007f3a (object 0x000000071a2b, a Account),
  which is held by "transfer-1"
"transfer-1":
  waiting to lock monitor 0x00007f3b (object 0x000000071a3c, a Account),
  which is held by "transfer-2"`,
    code: `class Account {
    final long id;
    long balance;

    Account(long id, long balance) {
        this.id = id;
        this.balance = balance;
    }
}

class Bank {
    void transfer(Account from, Account to, long amount) {
        synchronized (from) {
            synchronized (to) {
                if (from.balance < amount) throw new IllegalStateException("insufficient funds");
                from.balance -= amount;
                to.balance += amount;
            }
        }
    }
}`,
    bugMarkers: ['synchronized (from) {', 'synchronized (to) {'],
    rootCauseOptions: [
      { id: 'a', text: 'synchronized is too slow' },
      { id: 'b', text: 'Locks are taken in argument order; A→B and B→A transfers each hold one lock and wait for the other' },
      { id: 'c', text: 'balance is not volatile' },
      { id: 'd', text: 'The thread pool is too small' },
    ],
    correctRootCauseId: 'b',
    fixOptions: [
      { id: 'a', text: 'Always lock the two accounts in a global order (e.g. by id)', code: `Account first = from.id < to.id ? from : to;
Account second = first == from ? to : from;
synchronized (first) {
    synchronized (second) {
        // ... same body ...
    }
}` },
      { id: 'b', text: 'Make transfer a static synchronized method' },
      { id: 'c', text: 'Add a timeout to the HTTP request' },
      { id: 'd', text: 'Restart the service when it hangs' },
    ],
    correctFixId: 'a',
    explanation:
      'A deadlock needs a cycle of threads each holding a lock the next one wants. Transferring A→B locks A then B; B→A locks B then A. Consistent lock ordering breaks the cycle. A single global lock (static synchronized) also avoids deadlock but serialises every transfer in the bank. ReentrantLock.tryLock with a timeout is another option that lets threads back off.',
    prevention: [
      'Define a global lock order whenever code holds more than one lock.',
      'Take thread dumps (jstack, jcmd Thread.print) when a service hangs; the JVM detects monitor deadlocks.',
      'Prefer higher-level concurrency (database row locks, actors, single-writer queues) for money movement.',
    ],
    hints: ['Simulate two transfers in opposite directions at the same time.', 'The thread dump names which thread holds which lock.'],
  }),
  hunt({
    id: 'bh-listener-leak',
    title: 'Heap grows until OutOfMemoryError',
    moduleId: 'jvm-runtime',
    difficulty: 'intermediate',
    category: 'Memory growth',
    symptom: 'Each websocket session registers a price listener. Heap usage after full GC grows steadily; the service dies with `OutOfMemoryError: Java heap space` every few days.',
    evidence: `Heap histogram (jmap -histo:live) — top entries
 num     #instances         #bytes  class name
   1:     1843201      176947296  [B
   2:      921600       44236800  Session
   3:      921600       29491200  PriceTicker$$Lambda
   4:           1        8388624  [Ljava.lang.Object;  (ArrayList in PriceTicker.listeners)`,
    code: `import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;

class PriceTicker {
    private static final List<Consumer<Double>> listeners = new ArrayList<>();

    static void subscribe(Consumer<Double> listener) {
        listeners.add(listener);
    }

    static void publish(double price) {
        listeners.forEach(l -> l.accept(price));
    }
}

class Session {
    private final byte[] buffer = new byte[64 * 1024];

    void open() {
        PriceTicker.subscribe(price -> send(price));
    }

    void close() {
        // releases the socket
    }

    void send(double price) {
        buffer[0] = (byte) price;
    }
}`,
    bugMarkers: ['listeners.add(listener);', 'void close() {'],
    rootCauseOptions: [
      { id: 'a', text: 'The 64 KB buffers are too large' },
      { id: 'b', text: 'Listeners are never unsubscribed; the static list keeps every closed Session (and its buffer) reachable' },
      { id: 'c', text: 'The garbage collector cannot collect lambdas' },
      { id: 'd', text: 'publish is not synchronized' },
    ],
    correctRootCauseId: 'b',
    fixOptions: [
      { id: 'a', text: 'Increase -Xmx to 8 GB' },
      { id: 'b', text: 'Return a Subscription handle from subscribe and remove the listener in close()', code: `// in PriceTicker
static Runnable subscribe(Consumer<Double> listener) {
    listeners.add(listener);
    return () -> listeners.remove(listener);
}
// in Session
private Runnable unsubscribe;
void open() { unsubscribe = PriceTicker.subscribe(this::send); }
void close() { unsubscribe.run(); }` },
      { id: 'c', text: 'Call System.gc() when sessions close' },
      { id: 'd', text: 'Make the buffer static' },
    ],
    correctFixId: 'b',
    explanation:
      'The lambda `price -> send(price)` captures `this` (the Session). A static list is a GC root, so every registered lambda — and the Session and buffer it references — stays reachable forever. This is the classic Java memory leak: memory that is reachable but no longer needed. More heap only delays the crash. (Weak references are another option, but explicit unsubscription is clearer.) In real code, also make the listener list thread-safe (CopyOnWriteArrayList).',
    prevention: [
      'Every subscribe needs a matching unsubscribe tied to the lifecycle.',
      'Watch "heap after GC" trends, not raw heap usage.',
      'Analyse heap dumps with a dominator tree (Eclipse MAT, VisualVM) to find what retains memory.',
    ],
    hints: ['What does the lambda capture?', 'Static fields are GC roots.'],
  }),
  hunt({
    id: 'bh-n-plus-one',
    title: 'The order history page takes 9 seconds',
    moduleId: 'jdbc',
    difficulty: 'intermediate',
    category: 'Slow database access',
    symptom: 'Customers with many orders wait up to 9 seconds for their order history. Each individual query is fast (under 3 ms). The database shows thousands of queries per page view.',
    evidence: `SQL log for one request (customer 42, 1,500 orders):
SELECT id, created_at FROM orders WHERE customer_id = ?        -- 1 query
SELECT sku, qty FROM order_lines WHERE order_id = ?            -- executed 1,500 times`,
    code: `import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

class OrderHistory {
    List<String> load(Connection c, long customerId) throws SQLException {
        List<String> result = new ArrayList<>();
        try (PreparedStatement orders = c.prepareStatement("SELECT id FROM orders WHERE customer_id = ?")) {
            orders.setLong(1, customerId);
            try (ResultSet rs = orders.executeQuery()) {
                while (rs.next()) {
                    long orderId = rs.getLong(1);
                    try (PreparedStatement lines = c.prepareStatement("SELECT sku FROM order_lines WHERE order_id = ?")) {
                        lines.setLong(1, orderId);
                        try (ResultSet l = lines.executeQuery()) {
                            while (l.next()) result.add(orderId + ":" + l.getString(1));
                        }
                    }
                }
            }
        }
        return result;
    }
}`,
    bugMarkers: ['try (PreparedStatement lines = c.prepareStatement("SELECT sku FROM order_lines WHERE order_id = ?")) {', 'lines.setLong(1, orderId);'],
    rootCauseOptions: [
      { id: 'a', text: 'PreparedStatement is slower than Statement' },
      { id: 'b', text: 'The N+1 query pattern: one query for orders plus one query per order, each paying a network round trip' },
      { id: 'c', text: 'The connection is not closed' },
      { id: 'd', text: 'The orders table has too many rows' },
    ],
    correctRootCauseId: 'b',
    fixOptions: [
      { id: 'a', text: 'Use a single JOIN query (with an index on order_lines.order_id), optionally paginated', code: `SELECT o.id, l.sku
FROM orders o
JOIN order_lines l ON l.order_id = o.id
WHERE o.customer_id = ?
ORDER BY o.id` },
      { id: 'b', text: 'Cache all order lines in memory at startup' },
      { id: 'c', text: 'Run the per-order queries in parallel threads' },
      { id: 'd', text: 'Increase the connection pool size' },
    ],
    correctFixId: 'a',
    explanation:
      'Each query is fast, but 1,501 round trips add up (1,500 × ~6 ms ≈ 9 s). One JOIN returns the same data in a single round trip. ORMs produce the same pattern through lazy loading (JPA: use fetch joins, entity graphs or batch fetching). Parallelising the queries just moves the load to the database and the pool.',
    prevention: [
      'Log or count queries per request in tests; assert an upper bound.',
      'Know your ORM\'s fetching strategy; prefer explicit fetch plans for list pages.',
      'Paginate history pages.',
    ],
    hints: ['Count the queries for a customer with 1,500 orders.', 'Where does the time go if each query is fast?'],
  }),
  hunt({
    id: 'bh-no-transaction',
    title: 'Money disappears during failed transfers',
    moduleId: 'jdbc',
    difficulty: 'intermediate',
    category: 'Transactions',
    symptom: 'When the database briefly fails during peak load, some customers are debited but the recipient is never credited.',
    code: `import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

class TransferService {
    void transfer(Connection c, long from, long to, long cents) throws SQLException {
        try (PreparedStatement debit = c.prepareStatement("UPDATE accounts SET balance = balance - ? WHERE id = ?");
             PreparedStatement credit = c.prepareStatement("UPDATE accounts SET balance = balance + ? WHERE id = ?")) {
            debit.setLong(1, cents);
            debit.setLong(2, from);
            debit.executeUpdate();

            credit.setLong(1, cents);
            credit.setLong(2, to);
            credit.executeUpdate();
        }
    }
}`,
    bugMarkers: ['debit.executeUpdate();', 'credit.executeUpdate();'],
    rootCauseOptions: [
      { id: 'a', text: 'The UPDATE statements are written incorrectly' },
      { id: 'b', text: 'JDBC connections auto-commit by default, so each UPDATE commits on its own; a failure between them leaves a half-done transfer' },
      { id: 'c', text: 'PreparedStatements must be closed before the next one runs' },
      { id: 'd', text: 'long cannot hold money' },
    ],
    correctRootCauseId: 'b',
    fixOptions: [
      { id: 'a', text: 'Disable auto-commit, commit after both updates, and roll back on failure', code: `c.setAutoCommit(false);
try {
    // ... both updates ...
    c.commit();
} catch (SQLException e) {
    c.rollback();
    throw e;
}` },
      { id: 'b', text: 'Retry the credit update three times' },
      { id: 'c', text: 'Run the credit before the debit' },
      { id: 'd', text: 'Use Statement instead of PreparedStatement' },
    ],
    correctFixId: 'a',
    explanation:
      'With auto-commit on, the debit is durable as soon as it executes. If the credit fails, nothing undoes the debit. Wrapping both updates in one transaction makes them atomic: both commit or neither does. In Spring this is `@Transactional`. Retries can still fail; reordering only changes who loses money. Also check affected-row counts and guard against overdrafts with a condition like `AND balance >= ?`.',
    prevention: [
      'Group related writes in a single transaction with explicit commit/rollback.',
      'Test failure paths by injecting errors between steps.',
      'Use database constraints (CHECK balance >= 0) as a last line of defence.',
    ],
    hints: ['What is the default auto-commit mode of a JDBC connection?', 'What state is left if the credit update throws?'],
  }),
  hunt({
    id: 'bh-thread-per-request',
    title: 'unable to create native thread',
    moduleId: 'concurrency',
    difficulty: 'intermediate',
    category: 'Excessive thread creation',
    symptom: 'During a traffic spike the notification service crashed with `java.lang.OutOfMemoryError: unable to create native thread`. Heap usage was only 40%.',
    evidence: `jvm_threads_live: 180 → 4,096 in 3 minutes
OutOfMemoryError: unable to create native thread: possibly out of memory or process/resource limits reached`,
    code: `class NotificationService {
    void onOrderPlaced(String orderId) {
        new Thread(() -> sendEmail(orderId)).start();
        new Thread(() -> sendSms(orderId)).start();
    }

    private void sendEmail(String orderId) {
        // blocking SMTP call, 200 ms - 30 s
    }

    private void sendSms(String orderId) {
        // blocking HTTP call
    }
}`,
    bugMarkers: ['new Thread(() -> sendEmail(orderId)).start();', 'new Thread(() -> sendSms(orderId)).start();'],
    rootCauseOptions: [
      { id: 'a', text: 'The heap is too small' },
      { id: 'b', text: 'Two new platform threads per order, unbounded; slow downstream calls make them pile up until the OS thread limit is hit' },
      { id: 'c', text: 'Lambdas leak memory' },
      { id: 'd', text: 'Email sending is not thread-safe' },
    ],
    correctRootCauseId: 'b',
    fixOptions: [
      { id: 'a', text: 'Increase -Xmx' },
      { id: 'b', text: 'Submit work to a bounded executor (or virtual threads plus a Semaphore limiting concurrent downstream calls), with timeouts on the calls', code: `private final ExecutorService pool = new ThreadPoolExecutor(
    16, 16, 0, TimeUnit.SECONDS,
    new ArrayBlockingQueue<>(10_000),
    new ThreadPoolExecutor.CallerRunsPolicy());

void onOrderPlaced(String orderId) {
    pool.submit(() -> sendEmail(orderId));
    pool.submit(() -> sendSms(orderId));
}` },
      { id: 'c', text: 'Use Executors.newCachedThreadPool()' },
      { id: 'd', text: 'Reduce the thread stack size with -Xss' },
    ],
    correctFixId: 'b',
    explanation:
      'Platform threads are OS threads with their own native stacks. Creating them per event with no limit turns a slow dependency into resource exhaustion. A bounded pool with a bounded queue applies back-pressure; newCachedThreadPool is also unbounded and fails the same way. Java 21 virtual threads make blocking cheap, but you still need to limit concurrency towards a slow downstream system (e.g. a Semaphore) and set timeouts.',
    prevention: [
      'Never create unbounded platform threads per request or event.',
      'Monitor live thread counts; alert on sustained growth.',
      'Put timeouts on every remote call.',
    ],
    hints: ['How many threads exist when the SMTP server responds slowly?', 'Is a cached thread pool bounded?'],
  }),
  hunt({
    id: 'bh-timezone',
    title: 'Evening orders get tomorrow\'s date',
    moduleId: 'functional',
    difficulty: 'intermediate',
    category: 'Time-zone handling',
    symptom: 'A US retailer\'s servers run in UTC. Orders placed after 8 pm New York time appear on the next day\'s sales report, and "same-day shipping" promises are wrong in the evening.',
    code: `import java.time.LocalDate;

record Order(String id, LocalDate orderDate, long cents) {}

class OrderFactory {
    Order create(String id, long cents) {
        return new Order(id, LocalDate.now(), cents);
    }
}`,
    bugMarkers: ['return new Order(id, LocalDate.now(), cents);'],
    rootCauseOptions: [
      { id: 'a', text: 'LocalDate cannot represent dates before 1970' },
      { id: 'b', text: 'LocalDate.now() uses the JVM default time zone (UTC on the servers), not the business time zone' },
      { id: 'c', text: 'Records cannot hold dates' },
      { id: 'd', text: 'The server clock is wrong' },
    ],
    correctRootCauseId: 'b',
    fixOptions: [
      { id: 'a', text: 'Set the server time zone to America/New_York' },
      { id: 'b', text: 'Store the instant the order happened, and derive the business date with an explicit zone (ideally from an injected Clock)', code: `record Order(String id, Instant placedAt, long cents) {
    LocalDate businessDate(ZoneId zone) {
        return placedAt.atZone(zone).toLocalDate();
    }
}
// creation: new Order(id, Instant.now(clock), cents)
// reporting: order.businessDate(ZoneId.of("America/New_York"))` },
      { id: 'c', text: 'Subtract 5 hours from LocalDate.now()' },
      { id: 'd', text: 'Use java.util.Date instead' },
    ],
    correctFixId: 'b',
    explanation:
      'A LocalDate has no time zone; `now()` silently uses the JVM default. At 21:00 in New York it is already 01:00 the next day in UTC. Store instants (moments on the timeline) and convert with an explicit ZoneId at the edges. Hard-coded offsets break with daylight saving time; changing the server zone just moves the bug to other regions. Injecting a Clock also makes the behaviour testable.',
    prevention: [
      'Never call now() without an explicit zone or clock in business code.',
      'Persist Instant/OffsetDateTime (timestamptz in Postgres); convert for display and business dates.',
      'Test around midnight and DST transitions with a fixed Clock.',
    ],
    hints: ['What time is it in UTC when it is 9 pm in New York?', 'Which zone does LocalDate.now() use?'],
  }),
  hunt({
    id: 'bh-version-mismatch',
    title: 'NoSuchMethodError on the production servers',
    moduleId: 'jvm-platform',
    difficulty: 'advanced',
    category: 'Java version incompatibility',
    symptom: 'The build machine uses JDK 21 and compiles with `-source 17 -target 17` because production runs Java 17. Tests pass, but in production the first report request fails.',
    evidence: `java.lang.NoSuchMethodError: 'java.lang.Object java.util.List.getFirst()'
    at ReportService.latest(ReportService.java:6)`,
    code: `import java.util.List;

class ReportService {
    String latest(List<String> reports) {
        if (reports.isEmpty()) return "none";
        return reports.getFirst();
    }
}`,
    bugMarkers: ['return reports.getFirst();'],
    rootCauseOptions: [
      { id: 'a', text: 'The list is empty' },
      { id: 'b', text: '-source/-target only control language level and bytecode version; the code was still compiled against the JDK 21 API, where List.getFirst exists (added in Java 21)' },
      { id: 'c', text: 'Production is missing a library jar' },
      { id: 'd', text: 'getFirst is a private method' },
    ],
    correctRootCauseId: 'b',
    fixOptions: [
      { id: 'a', text: 'Compile with --release 17 (maven.compiler.release=17), which also checks API usage, and replace getFirst with get(0)', code: `<properties>
  <maven.compiler.release>17</maven.compiler.release>
</properties>

return reports.get(0);` },
      { id: 'b', text: 'Catch NoSuchMethodError and fall back to get(0)' },
      { id: 'c', text: 'Add the JDK 21 rt.jar to the production classpath' },
      { id: 'd', text: 'Use reflection to call getFirst' },
    ],
    correctFixId: 'a',
    explanation:
      'Bytecode version 61 (Java 17) was produced, so the class loads on Java 17, but it references a method that only exists in the Java 21 class library. `--release N` compiles against the API signatures of release N and would have rejected getFirst at build time. Running tests on the production Java version is the other safety net.',
    prevention: [
      'Use --release (maven.compiler.release / Gradle toolchains) instead of -source/-target.',
      'Run CI on the same Java version as production.',
      'Pin the JDK version in build images.',
    ],
    hints: ['When was List.getFirst() added?', 'What is the difference between -target and --release?'],
  }),
];
