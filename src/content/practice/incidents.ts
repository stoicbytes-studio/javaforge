import type { Incident } from '@/types/practice';

/*
 * Synthetic production incidents. Logs, metrics and dumps are invented for
 * training but modelled on real failure signatures (HikariCP, HotSpot thread
 * dumps, GC logs, Kubernetes events).
 */

export const INCIDENT_LIST: Incident[] = [
  {
    id: 'inc-pool-exhaustion',
    title: 'Checkout API latency jumps to 30 seconds',
    severity: 'SEV1',
    service: 'checkout-api (Spring Boot, HikariCP pool size 10)',
    difficulty: 'intermediate',
    alert: 'p99 latency > 30 s and 5xx rate 38% on POST /checkout for 10 minutes.',
    context: `Traffic is normal for a Monday morning. A release went out on Friday that added a **"download invoice PDF"** endpoint. The database team reports the primary is healthy: CPU 18%, no slow queries.

You have **45 minutes** of investigation budget before the incident commander escalates.`,
    timeBudgetMinutes: 45,
    initialEvidence: [
      {
        id: 'ev-errors',
        kind: 'log',
        title: 'Application errors (last 5 min)',
        content: `ERROR o.h.engine.jdbc.spi.SqlExceptionHelper - HikariPool-1 - Connection is not available, request timed out after 30000ms.
ERROR c.s.checkout.CheckoutController - Checkout failed for cart 88213
org.springframework.transaction.CannotCreateTransactionException: Could not open JPA EntityManager for transaction
Caused by: java.sql.SQLTransientConnectionException: HikariPool-1 - Connection is not available, request timed out after 30000ms (total=10, active=10, idle=0, waiting=187)`,
      },
      {
        id: 'ev-latency',
        kind: 'metric',
        title: 'POST /checkout p99 latency',
        series: { label: 'p99 latency', unit: 'ms', points: [180, 190, 175, 210, 4200, 18000, 30000, 30000, 30000, 30000], threshold: 1000 },
      },
    ],
    actions: [
      {
        id: 'a-pool-metrics',
        label: 'Inspect HikariCP pool metrics',
        costMinutes: 5,
        useful: true,
        feedback: 'All 10 connections are permanently active, even during a lull in traffic. Connections are being borrowed and never returned.',
        reveals: [
          {
            id: 'ev-pool',
            kind: 'metric',
            title: 'hikaricp_connections_active',
            series: { label: 'active connections', unit: 'connections', points: [3, 4, 3, 6, 9, 10, 10, 10, 10, 10], threshold: 10 },
          },
        ],
      },
      {
        id: 'a-thread-dump',
        label: 'Take a thread dump (jcmd <pid> Thread.print)',
        costMinutes: 5,
        useful: true,
        feedback: '187 request threads are waiting for a connection. None are inside a JDBC call — nobody is actually using the 10 borrowed connections.',
        reveals: [
          {
            id: 'ev-dump',
            kind: 'thread-dump',
            title: 'Thread dump excerpt',
            content: `"http-nio-8080-exec-142" #187 daemon prio=5 TIMED_WAITING (parking)
   at jdk.internal.misc.Unsafe.park(Native Method)
   at java.util.concurrent.SynchronousQueue.poll(SynchronousQueue.java:903)
   at com.zaxxer.hikari.util.ConcurrentBag.borrow(ConcurrentBag.java:151)
   at com.zaxxer.hikari.pool.HikariPool.getConnection(HikariPool.java:181)
   ...
   at com.shop.checkout.CheckoutService.placeOrder(CheckoutService.java:58)

(186 more threads with the same stack)`,
          },
        ],
      },
      {
        id: 'a-leak-detection',
        label: 'Enable Hikari leakDetectionThreshold=10s on one pod',
        costMinutes: 10,
        useful: true,
        feedback: 'Within a minute Hikari logs "Connection leak detection triggered" with the stack trace of the code that borrowed the connection: InvoiceService.renderPdf.',
        reveals: [
          {
            id: 'ev-leak',
            kind: 'log',
            title: 'Leak detection warning',
            content: `WARN  com.zaxxer.hikari.pool.ProxyLeakTask - Connection leak detection triggered for conn0wxy on thread http-nio-8080-exec-17, stack trace follows
java.lang.Exception: Apparent connection leak detected
    at com.zaxxer.hikari.HikariDataSource.getConnection(HikariDataSource.java:127)
    at com.shop.invoice.InvoiceService.renderPdf(InvoiceService.java:41)
    at com.shop.invoice.InvoiceController.download(InvoiceController.java:22)`,
          },
        ],
      },
      {
        id: 'a-code',
        label: 'Read the code added in Friday\'s release',
        costMinutes: 8,
        useful: true,
        feedback: 'The new invoice code borrows a connection manually and only closes it on the happy path.',
        reveals: [
          {
            id: 'ev-code',
            kind: 'code',
            title: 'InvoiceService.renderPdf (Friday\'s release)',
            content: `byte[] renderPdf(long orderId) throws Exception {
    Connection c = dataSource.getConnection();
    PreparedStatement ps = c.prepareStatement("SELECT * FROM invoice_lines WHERE order_id = ?");
    ps.setLong(1, orderId);
    ResultSet rs = ps.executeQuery();
    byte[] pdf = pdfRenderer.render(rs);   // throws for orders with discount lines
    c.close();
    return pdf;
}`,
          },
        ],
      },
      {
        id: 'a-db-cpu',
        label: 'Check database CPU and slow query log',
        costMinutes: 10,
        useful: false,
        feedback: 'Database CPU is 18% and there are no slow queries. The database is not the bottleneck — the application is waiting before it ever reaches the database.',
        reveals: [
          {
            id: 'ev-db',
            kind: 'metric',
            title: 'Database CPU',
            series: { label: 'db cpu', unit: '%', points: [22, 20, 21, 19, 18, 17, 18, 18, 17, 18], threshold: 80 },
          },
        ],
      },
      {
        id: 'a-scale',
        label: 'Scale checkout-api from 4 to 12 pods',
        costMinutes: 15,
        useful: false,
        feedback: 'Latency improves briefly, then degrades again within 20 minutes as the new pods leak their connections too. Scaling also triples the load on the database\'s connection limit.',
        reveals: [],
      },
    ],
    hypotheses: [
      { id: 'h-db', text: 'The database is overloaded and queries are slow' },
      { id: 'h-traffic', text: 'Traffic exceeds the pool capacity; the pool is simply too small' },
      { id: 'h-leak', text: 'The new invoice endpoint leaks connections when PDF rendering throws, gradually draining the pool' },
      { id: 'h-gc', text: 'Long garbage-collection pauses are stalling request threads' },
    ],
    correctHypothesisId: 'h-leak',
    rootCause:
      'InvoiceService.renderPdf borrowed a connection and closed it only on the happy path. PDF rendering threw for orders with discount lines, so each such download leaked one connection. After ten leaks the pool was empty and every request waited 30 s for a connection — including checkout, which shares the pool. The database was idle the whole time.',
    fixes: [
      { id: 'f-pool', text: 'Increase the pool size to 100', correct: false, feedback: 'This only delays exhaustion (100 leaks instead of 10) and can overload the database\'s connection limit.' },
      {
        id: 'f-twr',
        text: 'Use try-with-resources for Connection, PreparedStatement and ResultSet (or a JdbcTemplate), and restart pods to reclaim leaked connections',
        correct: true,
        feedback: 'Correct. Resources are released on every path. Restarting is needed once to recover the leaked connections, but the code fix prevents recurrence.',
      },
      { id: 'f-timeout', text: 'Reduce connectionTimeout to 1 s so requests fail fast', correct: false, feedback: 'Failing faster improves the symptom but checkout still fails; the leak continues.' },
      { id: 'f-restart', text: 'Schedule a pod restart every hour', correct: false, feedback: 'A workaround that hides the bug and causes periodic errors.' },
    ],
    prevention: [
      'Use try-with-resources or framework templates for all JDBC resources.',
      'Enable leakDetectionThreshold in non-production environments and alert on pool "pending" metrics in production.',
      'Isolate risky endpoints with a separate pool (bulkhead) so one feature cannot exhaust checkout.',
      'Add tests for failure paths of code that manages resources.',
    ],
    relatedModuleIds: ['jdbc', 'exceptions'],
  },
  {
    id: 'inc-memory-leak',
    title: 'Pods OOMKilled every six hours',
    severity: 'SEV2',
    service: 'pricing-service (Java 21, -Xmx2g, G1)',
    difficulty: 'intermediate',
    alert: 'Kubernetes reports OOMKilled restarts for pricing-service roughly every 6 hours since Tuesday\'s deploy.',
    context: `Each restart causes ~40 seconds of failed price lookups. Tuesday\'s deploy added **per-request quote caching** to reduce calls to the tariff database. Traffic is steady at ~400 requests/second.

Investigation budget: **60 minutes**.`,
    timeBudgetMinutes: 60,
    initialEvidence: [
      {
        id: 'ev-events',
        kind: 'log',
        title: 'Kubernetes events',
        content: `Warning  OOMKilled  pod/pricing-7c9f-xk2lp  Container pricing exceeded memory limit (2560Mi)
Warning  BackOff    pod/pricing-7c9f-xk2lp  Back-off restarting failed container
java.lang.OutOfMemoryError: Java heap space (logged 12 s before the kill)`,
      },
    ],
    actions: [
      {
        id: 'a-heap-after-gc',
        label: 'Plot heap usage after each GC',
        costMinutes: 5,
        useful: true,
        feedback: 'Heap after collection climbs steadily from 300 MB to 2 GB between restarts. Something is retaining objects permanently — a leak, not a traffic spike.',
        reveals: [
          {
            id: 'ev-heap',
            kind: 'metric',
            title: 'Old generation used after GC',
            series: { label: 'heap after GC', unit: 'MB', points: [310, 520, 760, 990, 1220, 1450, 1690, 1910, 2010, 2040], threshold: 2048 },
          },
        ],
      },
      {
        id: 'a-histogram',
        label: 'Take a live heap histogram (jcmd <pid> GC.class_histogram)',
        costMinutes: 5,
        useful: true,
        feedback: 'Millions of Quote objects and HashMap nodes dominate the heap.',
        reveals: [
          {
            id: 'ev-histo',
            kind: 'text',
            title: 'Top of the class histogram',
            content: `- 1. \`java.util.HashMap$Node\` — 8,612,004 instances, 275 MB
- 2. \`com.shop.pricing.Quote\` — 8,610,880 instances, 551 MB
- 3. \`java.lang.String\` — 8,700,112 instances, 418 MB
- 4. \`byte[]\` — 9,102,440 instances, 610 MB`,
          },
        ],
      },
      {
        id: 'a-heap-dump',
        label: 'Capture a heap dump and inspect the dominator tree',
        costMinutes: 15,
        useful: true,
        feedback: 'One object retains 1.7 GB: the static HashMap in QuoteCache, keyed by request id.',
        reveals: [
          {
            id: 'ev-dominator',
            kind: 'text',
            title: 'Dominator tree (Eclipse MAT)',
            content: `**class QuoteCache @ 0x6c0011a8** — retained heap **1.71 GB (84%)**
- \`static CACHE\` → \`java.util.HashMap\` (8.6 M entries)
  - keys: \`String\` request ids such as "req-9f2c1e…" (all unique)
  - values: \`Quote\``,
          },
        ],
      },
      {
        id: 'a-code',
        label: 'Read the caching code from Tuesday\'s deploy',
        costMinutes: 8,
        useful: true,
        feedback: 'The cache key is the request id, which is unique per request, so entries are never reused or removed.',
        reveals: [
          {
            id: 'ev-cache-code',
            kind: 'code',
            title: 'QuoteCache',
            content: `class QuoteCache {
    private static final Map<String, Quote> CACHE = new HashMap<>();

    Quote get(PriceRequest request) {
        return CACHE.computeIfAbsent(request.requestId(), id -> tariffs.quote(request));
    }
}`,
          },
        ],
      },
      {
        id: 'a-raise-heap',
        label: 'Raise -Xmx to 4 GB and the pod limit to 5 GB',
        costMinutes: 15,
        useful: false,
        feedback: 'Restarts now happen every 12 hours instead of 6. The leak is unchanged.',
        reveals: [],
      },
      {
        id: 'a-gc-tuning',
        label: 'Switch from G1 to ZGC',
        costMinutes: 20,
        useful: false,
        feedback: 'GC pauses get shorter, but ZGC cannot free memory that is still reachable. OOMs continue.',
        reveals: [],
      },
    ],
    hypotheses: [
      { id: 'h-traffic', text: 'Traffic growth needs more memory' },
      { id: 'h-gc', text: 'G1 is misconfigured and not collecting the old generation' },
      { id: 'h-leak', text: 'The new static cache is keyed by unique request ids, so it grows without bound and retains every Quote' },
      { id: 'h-native', text: 'A native memory leak in the JDBC driver' },
    ],
    correctHypothesisId: 'h-leak',
    rootCause:
      'QuoteCache used a static HashMap keyed by request id. Every request inserted a new entry and none were ever removed, so ~400 entries per second accumulated as reachable objects. GC cannot collect reachable data; heap after GC grew linearly until OutOfMemoryError, and the container exceeded its limit.',
    fixes: [
      { id: 'f-heap', text: 'Give the service 8 GB of heap', correct: false, feedback: 'More memory only extends the time to failure.' },
      {
        id: 'f-bounded',
        text: 'Key the cache by the actual pricing inputs (product, region, tariff version) and use a bounded cache with size limit and TTL (e.g. Caffeine)',
        correct: true,
        feedback: 'Correct. A meaningful key makes entries reusable, and bounds plus expiry guarantee memory stays flat.',
      },
      { id: 'f-gc', text: 'Call System.gc() every minute', correct: false, feedback: 'GC cannot free reachable objects; this only burns CPU.' },
      { id: 'f-weak', text: 'Change HashMap to WeakHashMap keyed by request id', correct: false, feedback: 'Entries would vanish unpredictably and the cache would still be useless because request ids never repeat.' },
    ],
    prevention: [
      'Never use unbounded static maps as caches; use a cache library with size and TTL limits.',
      'Review cache keys: a key that is unique per request means a 0% hit rate.',
      'Alert on heap-after-GC growth, and run soak tests longer than the restart interval.',
      'Capture heap dumps automatically on OOM (-XX:+HeapDumpOnOutOfMemoryError).',
    ],
    relatedModuleIds: ['jvm-runtime', 'collections'],
  },
  {
    id: 'inc-deadlock',
    title: 'Payments stop processing, CPU near zero',
    severity: 'SEV1',
    service: 'ledger-service (batch transfer workers, 16 threads)',
    difficulty: 'advanced',
    alert: 'Transfer queue depth growing; zero transfers completed in 8 minutes. Liveness probes are still passing.',
    context: `Transfers between merchant and customer accounts are processed by 16 worker threads. Load is high because of a marketplace sale: many refunds (merchant → customer) are running at the same time as purchases (customer → merchant).

Investigation budget: **30 minutes**.`,
    timeBudgetMinutes: 30,
    initialEvidence: [
      {
        id: 'ev-queue',
        kind: 'metric',
        title: 'Transfers completed per minute',
        series: { label: 'completed', unit: 'per min', points: [1200, 1350, 1410, 1380, 960, 210, 0, 0, 0, 0] },
      },
      {
        id: 'ev-cpu',
        kind: 'metric',
        title: 'Process CPU',
        series: { label: 'cpu', unit: '%', points: [64, 70, 72, 71, 40, 9, 1, 1, 1, 1] },
      },
    ],
    actions: [
      {
        id: 'a-dump',
        label: 'Take a thread dump',
        costMinutes: 3,
        useful: true,
        feedback: 'The JVM\'s deadlock detector reports a cycle between two transfer workers, and the other 14 workers are BLOCKED behind them.',
        reveals: [
          {
            id: 'ev-dump',
            kind: 'thread-dump',
            title: 'jcmd <pid> Thread.print',
            content: `Found one Java-level deadlock:
=============================
"transfer-worker-3":
  waiting to lock monitor 0x00007f1c8c003f08 (object 0x00000000c2a1b6e0, a com.ledger.Account),
  which is held by "transfer-worker-9"

"transfer-worker-9":
  waiting to lock monitor 0x00007f1c8c004a18 (object 0x00000000c2a1b730, a com.ledger.Account),
  which is held by "transfer-worker-3"

Java stack information for the threads listed above:
"transfer-worker-3":
	at com.ledger.TransferService.transfer(TransferService.java:31)
	- waiting to lock <0x00000000c2a1b6e0> (a com.ledger.Account)    // merchant M-17
	- locked <0x00000000c2a1b730> (a com.ledger.Account)             // customer C-88213
"transfer-worker-9":
	at com.ledger.TransferService.transfer(TransferService.java:31)
	- waiting to lock <0x00000000c2a1b730> (a com.ledger.Account)    // customer C-88213
	- locked <0x00000000c2a1b6e0> (a com.ledger.Account)             // merchant M-17`,
          },
        ],
      },
      {
        id: 'a-code',
        label: 'Read TransferService.transfer',
        costMinutes: 5,
        useful: true,
        feedback: 'Locks are acquired in parameter order: from, then to.',
        reveals: [
          {
            id: 'ev-code',
            kind: 'code',
            title: 'TransferService.transfer',
            content: `void transfer(Account from, Account to, long cents) {
    synchronized (from) {
        synchronized (to) {
            from.debit(cents);
            to.credit(cents);
        }
    }
}`,
          },
        ],
      },
      {
        id: 'a-db',
        label: 'Check database locks (pg_locks)',
        costMinutes: 8,
        useful: false,
        feedback: 'No blocked database sessions. The threads are stuck before they reach the database.',
        reveals: [],
      },
      {
        id: 'a-more-workers',
        label: 'Increase workers from 16 to 64',
        costMinutes: 10,
        useful: false,
        feedback: 'The new workers soon block on the same two accounts. More threads cannot break a lock cycle.',
        reveals: [],
      },
    ],
    hypotheses: [
      { id: 'h-db', text: 'Database row locks are blocking the workers' },
      { id: 'h-deadlock', text: 'Two workers transfer between the same accounts in opposite directions and lock them in opposite order — a deadlock' },
      { id: 'h-starvation', text: 'The worker pool is too small for sale traffic' },
      { id: 'h-gc', text: 'A stop-the-world GC pause' },
    ],
    correctHypothesisId: 'h-deadlock',
    rootCause:
      'transfer() locked accounts in argument order. A purchase (customer → merchant) and a refund (merchant → customer) for the same pair ran concurrently: each worker held one account\'s monitor and waited forever for the other. Every later transfer touching either account blocked behind them. CPU dropped to zero because blocked threads do no work; the liveness probe did not check queue progress, so nothing restarted.',
    fixes: [
      { id: 'f-restart', text: 'Restart the service', correct: false, feedback: 'Clears the deadlock now, but it recurs under the same load.' },
      {
        id: 'f-order',
        text: 'Acquire account locks in a global order (by account id), and add a liveness check on transfer throughput',
        correct: true,
        feedback: 'Correct. Consistent lock ordering makes a cycle impossible; the progress-based probe makes any future stall self-healing and visible.',
      },
      { id: 'f-global', text: 'Replace both locks with one global lock', correct: false, feedback: 'Deadlock-free but serialises the entire ledger; throughput collapses under sale load.' },
      { id: 'f-volatile', text: 'Make Account.balance volatile', correct: false, feedback: 'Visibility is not the problem; the threads are waiting on monitors.' },
    ],
    prevention: [
      'Define and document a lock ordering whenever multiple locks are held.',
      'Prefer tryLock with timeouts, or single-writer designs, for multi-resource updates.',
      'Make liveness probes reflect real progress (queue drain rate), not just "the HTTP port answers".',
      'Load-test concurrent opposite-direction operations.',
    ],
    relatedModuleIds: ['concurrency'],
  },
  {
    id: 'inc-timezone-report',
    title: 'Daily revenue report disagrees with finance',
    severity: 'SEV3',
    service: 'reporting-job (nightly, servers in UTC)',
    difficulty: 'beginner',
    alert: 'Finance reports that yesterday\'s revenue in the dashboard is 9% lower than in the payment provider\'s settlement for the US store.',
    context: `The US store operates in **America/New_York**. The reporting job runs at 01:00 UTC and sums orders whose \`orderDate\` equals "yesterday".

Investigation budget: **30 minutes**.`,
    timeBudgetMinutes: 30,
    initialEvidence: [
      {
        id: 'ev-diff',
        kind: 'text',
        title: 'Finance reconciliation',
        content: `- Dashboard (2026-10-14): **$184,220**
- Provider settlement (2026-10-14, New York day): **$202,410**
- Missing: **$18,190** — roughly evening sales`,
      },
    ],
    actions: [
      {
        id: 'a-orders',
        label: 'List orders near midnight with their stored dates',
        costMinutes: 5,
        useful: true,
        feedback: 'Orders placed after 20:00 New York time are stored with the next day\'s date.',
        reveals: [
          {
            id: 'ev-orders',
            kind: 'log',
            title: 'orders (placed_at shown in New York time)',
            content: `id      placed_at (America/New_York)   order_date
A-9912  2026-10-14 19:58:12 -04:00     2026-10-14
A-9913  2026-10-14 20:03:40 -04:00     2026-10-15   <--
A-9914  2026-10-14 23:41:02 -04:00     2026-10-15   <--`,
          },
        ],
      },
      {
        id: 'a-code',
        label: 'Read how order_date is assigned',
        costMinutes: 5,
        useful: true,
        feedback: 'order_date comes from LocalDate.now(), which uses the JVM default zone — UTC on these servers.',
        reveals: [
          {
            id: 'ev-code',
            kind: 'code',
            title: 'OrderFactory.create',
            content: `Order create(Cart cart) {
    return new Order(cart.id(), LocalDate.now(), cart.totalCents());
}`,
          },
        ],
      },
      {
        id: 'a-job-logs',
        label: 'Check whether the reporting job failed',
        costMinutes: 5,
        useful: false,
        feedback: 'The job completed successfully in 41 seconds. It summed exactly what was stored.',
        reveals: [],
      },
      {
        id: 'a-provider',
        label: 'Open a ticket with the payment provider',
        costMinutes: 15,
        useful: false,
        feedback: 'The provider confirms their numbers. The discrepancy is on our side.',
        reveals: [],
      },
    ],
    hypotheses: [
      { id: 'h-provider', text: 'The payment provider double-counts transactions' },
      { id: 'h-job', text: 'The reporting job crashed half-way' },
      { id: 'h-zone', text: 'Order dates are derived in UTC instead of the store\'s business time zone, shifting evening orders to the next day' },
      { id: 'h-rounding', text: 'Currency rounding errors in the sum' },
    ],
    correctHypothesisId: 'h-zone',
    rootCause:
      'Order dates were computed with LocalDate.now() on UTC servers. During daylight saving time New York is UTC−4, so every order after 20:00 local time got the next calendar date and was reported on the wrong day. The report for any given day was missing its evening and contained the previous evening instead.',
    fixes: [
      { id: 'f-server-zone', text: 'Set the servers\' time zone to America/New_York', correct: false, feedback: 'Fixes the US store but breaks every other region, and hides the dependency on server configuration.' },
      { id: 'f-offset', text: 'Subtract 4 hours when computing the date', correct: false, feedback: 'Wrong for half the year (EST is UTC−5) and for every other region.' },
      {
        id: 'f-instant',
        text: 'Store the order instant (timestamptz) and compute the business date with the store\'s ZoneId at reporting time; backfill affected order dates',
        correct: true,
        feedback: 'Correct. Instants are unambiguous, and an explicit zone makes the business rule visible and testable. Backfilling fixes historical reports.',
      },
    ],
    prevention: [
      'Store instants; derive dates with an explicit ZoneId per business unit.',
      'Inject a java.time.Clock and test around midnight and DST changes.',
      'Ban zone-less now() calls in business code with static analysis.',
    ],
    relatedModuleIds: ['functional'],
  },
];
