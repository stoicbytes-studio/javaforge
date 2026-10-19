import type { CurriculumModule } from '@/types/curriculum';

export const productionModule: CurriculumModule = {
  id: 'production',
  order: 17,
  title: 'Backend Engineering: Observability, Resilience and Microservices',
  shortTitle: 'Production',
  summary: 'Structured logs, metrics, traces and SLOs; timeouts, retries, circuit breakers and idempotency; and an honest look at service boundaries. The microservices lesson is optional.',
  level: 'optional',
  prerequisites: ['spring'],
  lessons: [
    {
      id: 'prod-observability',
      moduleId: 'production',
      title: 'Observability: logs, metrics, traces, health checks and SLOs',
      summary: 'Structured logging with correlation ids, RED/USE metrics with Micrometer, distributed tracing with OpenTelemetry, liveness vs readiness, and SLOs with error budgets.',
      estimatedMinutes: 40,
      difficulty: 'advanced',
      prerequisites: ['perf-diagnostics', 'e-design'],
      versionNotes: [
        { feature: 'System.Logger platform logging API', since: 9 },
        { feature: 'JFR event streaming for in-process monitoring', since: 14 },
        { feature: 'Virtual threads (ThreadLocal-based MDC still works, but each virtual thread has its own copy)', since: 21 },
        { feature: 'ScopedValue for passing request context without ThreadLocal', since: 25, note: 'Preview in 21-24, final in 25' },
      ],
      objectives: [
        'Write structured log lines that carry a correlation id via MDC and never contain secrets or personal data.',
        'Choose metrics using the RED and USE methods and keep tag cardinality bounded.',
        'Explain trace ids, span ids and context propagation across services.',
        'Distinguish liveness from readiness probes and define an SLO with an error budget.',
      ],
      plainEnglish: `When a service misbehaves at 3 a.m., you cannot attach a debugger. You only have what the service already tells you. **Observability** means building the service so that its outputs let you answer new questions about it:

- **Logs** describe individual events ("payment 812 declined"). Make them structured (key=value or JSON) and tag each with a **correlation id** so you can find every line for one request.
- **Metrics** are cheap numbers over time: request rate, error rate, latency percentiles, pool usage. They drive dashboards and alerts.
- **Traces** follow one request across many services and show where its time went.
- **Health checks** tell the platform whether to restart the instance (liveness) or stop sending it traffic for a while (readiness).
- **SLOs** turn all of this into a promise: "99.9% of checkouts succeed in under 300 ms over 30 days."`,
      technical: `### Structured logging
- Use **SLF4J** as the API with Logback or Log4j 2 behind it, and parameterised messages: \`log.info("Order {} placed", id)\` (no string building when the level is off).
- Emit JSON or key=value in production so log platforms can index fields. SLF4J 2.x adds a fluent API: \`log.atInfo().addKeyValue("orderId", id).log("order placed")\`.
- **MDC** (Mapped Diagnostic Context) is a per-thread map whose entries the appender adds to every line: put \`traceId\`/\`requestId\` in a filter at the start of the request and **remove it in finally** (pooled threads are reused). Context does not follow work to other threads automatically: executors, \`CompletableFuture\` and reactive code need explicit propagation (\`MDC.getCopyOfContextMap\`, Micrometer context-propagation, or the OpenTelemetry agent).
- **Levels**: ERROR = someone must act; WARN = unexpected but handled; INFO = business-significant events; DEBUG/TRACE = diagnostics, off in production by default. Log an exception once, with its stack trace, where it is handled.
- **Never log secrets or personal data**: passwords, tokens, API keys, full card numbers, session cookies, and personal data that regulations (e.g. GDPR) protect. Mask at the source, and add a redaction layer as a safety net.

### Metrics
- **RED** for request-driven services: **R**ate, **E**rrors, **D**uration. **USE** for resources: **U**tilisation, **S**aturation, **E**rrors (CPU, pools, queues, disks).
- **Micrometer** is the vendor-neutral facade (used by Spring Boot): \`Counter\` (monotonic counts), \`Gauge\` (current value, e.g. queue size), \`Timer\` (count, total time and optional percentile **histograms**), \`DistributionSummary\` (sizes). Export to Prometheus, Datadog, OTLP and others.
- Publish **histograms** (\`publishPercentileHistogram()\`) so percentiles can be aggregated across instances; client-side computed percentiles cannot be merged.
- **Cardinality**: every unique combination of tag values is a separate time series. Tags must have small bounded value sets (route template, method, status class, outcome). Never tag with user ids, order ids, raw URLs or exception messages — that explodes storage and cost.

### Distributed tracing
- A **trace** is the whole journey of one request; it consists of **spans** (one per operation: HTTP call, DB query), each with a span id, parent span id, timing and attributes. In OpenTelemetry/W3C Trace Context, the trace id is 16 bytes (32 hex chars) and the span id 8 bytes (16 hex chars).
- **Context propagation**: the caller sends the \`traceparent\` header (\`00-<traceId>-<spanId>-<flags>\`) on every outgoing request or message; the callee continues the same trace. Put the trace id in the MDC so logs and traces link up.
- **OpenTelemetry** is the vendor-neutral standard: the Java agent auto-instruments common libraries (HTTP clients and servers, JDBC, Kafka); Spring Boot 3 uses Micrometer Tracing with an OpenTelemetry bridge. Sample traces (e.g. 10%, or tail-based: keep slow and failed ones).

### Health checks
- **Liveness**: "is this process broken beyond recovery?" (deadlocked, corrupted state). Failure means **restart**. Do not check dependencies here, or a database outage restarts every instance at once.
- **Readiness**: "can this instance serve traffic right now?" (warming up, dependency unavailable, draining). Failure means **stop routing traffic** until it recovers. Spring Boot Actuator exposes \`/actuator/health/liveness\` and \`/actuator/health/readiness\`.
- A **startup** probe protects slow-starting apps from being killed during start-up.

### SLIs, SLOs and error budgets
An **SLI** is a measured ratio (good requests / valid requests, e.g. responses under 300 ms with non-5xx status). An **SLO** is the target for it over a window (99.9% over 30 days). The **error budget** is what remains: 0.1% of 10 million requests = 10,000 bad requests per month. Alert on **burn rate** (budget consumed too fast), not on every spike; when the budget is gone, prioritise reliability work over features.`,
      whyItExists: `Distributed systems fail in partial, surprising ways that nobody can reproduce on a laptop. Logs, metrics and traces that share ids let engineers move from "users say it is slow" to "the p99 of the inventory call in eu-west rose after deploy 4.2" in minutes instead of days, and SLOs give teams an objective way to balance reliability against feature work.`,
      whenToUse: [
        'Every production service: structured logs with correlation ids, RED metrics, health endpoints and traces.',
        'Use USE metrics for every bounded resource: connection pools, thread pools, queues, disks.',
        'Define SLOs for user-facing journeys and alert on error-budget burn rate.',
      ],
      whenNotToUse: [
        'Do not log every request body or response at INFO — cost, noise and data-protection risk.',
        'Do not use high-cardinality values (user id, order id, full URL) as metric tags; put them in logs or trace attributes.',
        'Do not make liveness probes depend on databases or downstream services.',
        'Do not alert on causes (CPU 80%) when you can alert on symptoms users feel (SLO burn).',
      ],
      examples: [
        {
          id: 'pd-mdc-logging',
          title: 'Correlation ids and redaction in structured logs',
          runnable: true,
          code: `import java.util.Map;
import java.util.TreeMap;
import java.util.regex.Pattern;

public class Main {
    // A tiny stand-in for SLF4J's MDC: per-thread context added to every log line
    static final ThreadLocal<Map<String, String>> MDC = ThreadLocal.withInitial(TreeMap::new);
    static final Pattern CARD = Pattern.compile("([0-9]{4})[0-9]{8}([0-9]{4})");

    static void log(String level, String event, String... keyValues) {
        StringBuilder line = new StringBuilder("level=" + level + " event=" + event);
        MDC.get().forEach((k, v) -> line.append(' ').append(k).append('=').append(v));
        for (int i = 0; i < keyValues.length; i += 2) {
            line.append(' ').append(keyValues[i]).append('=').append(redact(keyValues[i + 1]));
        }
        System.out.println(line);
    }

    static String redact(String value) {
        return CARD.matcher(value).replaceAll("$1********$2");   // safety net, not a licence to log secrets
    }

    static void handlePayment(String traceId, String userId, String cardNumber) {
        MDC.get().put("traceId", traceId);
        MDC.get().put("userId", userId);
        try {
            log("INFO", "payment.started", "amountCents", "1999");
            log("WARN", "payment.declined", "card", cardNumber, "reason", "insufficient_funds");
        } finally {
            MDC.remove();   // worker threads are pooled: always clear the context
        }
    }

    public static void main(String[] args) {
        handlePayment("4bf92f3577b34da6a3ce929d0e0e4736", "u-42", "4111111111111111");
        log("INFO", "worker.idle");
    }
}`,
          expectedOutput: `level=INFO event=payment.started traceId=4bf92f3577b34da6a3ce929d0e0e4736 userId=u-42 amountCents=1999
level=WARN event=payment.declined traceId=4bf92f3577b34da6a3ce929d0e0e4736 userId=u-42 card=4111********1111 reason=insufficient_funds
level=INFO event=worker.idle`,
          explanation: 'Real code uses org.slf4j.MDC and a JSON encoder instead of this hand-rolled logger, but the mechanics are the same: context in a ThreadLocal map, added to each line by the appender, cleared in finally. The last line has no traceId because the context was removed.',
        },
        {
          id: 'pd-red-cardinality',
          title: 'RED metrics and the cost of a high-cardinality tag',
          runnable: true,
          code: `import java.util.*;

public class Main {
    record Request(String route, int status, long millis, String userId) {}

    public static void main(String[] args) {
        List<Request> lastMinute = new ArrayList<>();
        String[] routes = {"GET /orders/{id}", "POST /orders"};
        for (int i = 0; i < 600; i++) {
            int status = i % 50 == 0 ? 503 : 200;
            long millis = i % 100 == 0 ? 900 : 20 + i % 30;
            lastMinute.add(new Request(routes[i % 2], status, millis, "user-" + i % 240));
        }

        // RED per route: Rate, Errors, Duration (p99 by nearest rank)
        Map<String, List<Request>> byRoute = new TreeMap<>();
        for (Request r : lastMinute) byRoute.computeIfAbsent(r.route(), k -> new ArrayList<>()).add(r);
        byRoute.forEach((route, reqs) -> {
            long errors = reqs.stream().filter(r -> r.status() >= 500).count();
            long[] sorted = reqs.stream().mapToLong(Request::millis).sorted().toArray();
            long p99 = sorted[(99 * sorted.length + 99) / 100 - 1];
            System.out.printf("%-16s rate=%d/min errors=%d p99=%dms%n", route, reqs.size(), errors, p99);
        });

        // Every distinct combination of tag values becomes its own time series
        Set<String> bounded = new HashSet<>();
        Set<String> unbounded = new HashSet<>();
        for (Request r : lastMinute) {
            bounded.add(r.route() + "|" + r.status());
            unbounded.add(r.route() + "|" + r.status() + "|" + r.userId());
        }
        System.out.println("series tagged route+status:        " + bounded.size());
        System.out.println("series tagged route+status+userId: " + unbounded.size());
    }
}`,
          expectedOutput: `GET /orders/{id} rate=300/min errors=12 p99=900ms
POST /orders     rate=300/min errors=0 p99=49ms
series tagged route+status:        3
series tagged route+status+userId: 252`,
          explanation: 'Note the route template (/orders/{id}) rather than the raw path — raw paths are unbounded too. With 1 million users the userId tag would create millions of series per metric; that information belongs in logs or trace attributes.',
        },
        {
          id: 'pd-libraries',
          title: 'The same ideas with SLF4J, Micrometer and OpenTelemetry',
          runnable: false,
          code: `import io.micrometer.core.instrument.*;
import io.opentelemetry.api.trace.*;
import org.slf4j.*;

public class CheckoutHandler {
    private static final Logger log = LoggerFactory.getLogger(CheckoutHandler.class);
    private final Timer checkoutTimer;
    private final Counter declined;
    private final Tracer tracer;

    CheckoutHandler(MeterRegistry registry, Tracer tracer) {
        this.checkoutTimer = Timer.builder("checkout.duration")
            .tag("channel", "web")                 // bounded values only
            .publishPercentileHistogram()          // aggregatable percentiles
            .register(registry);
        this.declined = registry.counter("checkout.declined", "reason", "insufficient_funds");
        this.tracer = tracer;
    }

    Receipt checkout(Cart cart) {
        Span span = tracer.spanBuilder("checkout").startSpan();
        try (var scope = span.makeCurrent()) {
            MDC.put("traceId", span.getSpanContext().getTraceId());
            span.setAttribute("cart.items", cart.size());   // detail goes on the span, not a metric tag
            return checkoutTimer.recordCallable(() -> {
                log.atInfo().addKeyValue("cartId", cart.id()).log("checkout started");
                return payments.charge(cart);
            });
        } catch (PaymentDeclinedException e) {
            declined.increment();
            log.warn("checkout declined for cart {}", cart.id());   // no card data
            throw e;
        } finally {
            MDC.remove("traceId");
            span.end();
        }
    }
}`,
          explanation: 'In Spring Boot most of this is automatic: Actuator registers HTTP server metrics with route-template tags, and Micrometer Tracing or the OpenTelemetry Java agent creates spans and puts trace ids into the MDC.',
        },
      ],
      walkthrough: {
        exampleId: 'pd-mdc-logging',
        steps: [
          { lines: [6, 8], text: 'The MDC is a ThreadLocal map, so every thread has its own context. A TreeMap keeps keys in a stable order for the demo.' },
          { lines: [10, 17], text: 'Each line is key=value: the event name, then every MDC entry, then the event-specific fields. Log platforms can filter on traceId=... directly.' },
          { lines: [19, 21], text: 'A redaction pass masks anything that looks like a card number. It is a safety net; the primary rule is not to pass secrets to the logger at all.' },
          { lines: [23, 32], text: 'At the start of a request the trace and user ids go into the MDC; finally removes them so the next request on this pooled thread does not inherit stale ids.' },
          { lines: [34, 37], text: 'The log line after the request has no traceId, which proves the context was cleared.' },
        ],
      },
      realWorld: {
        title: 'The metrics bill that exploded overnight',
        scenario: `A team added a \`customerId\` tag to their \`http.server.requests\` timer to debug one customer's complaint. Each timer with a percentile histogram exports dozens of bucket series; multiplied by 400,000 customers, the metrics backend ingested 30 million new series within a day, dashboards timed out and the monthly observability bill tripled.

They removed the tag, added \`customerId\` as a trace attribute and as a structured log field instead, and used the trace id in the MDC to jump from a slow trace to its log lines. The customer's issue turned out to be a retry storm visible in the trace: three nested services each retried three times, turning one slow dependency call into 27.`,
      },
      commonMistakes: [
        {
          mistake: 'Putting request context into the MDC without removing it.',
          why: 'Pooled threads keep the previous request\'s ids, so logs are attributed to the wrong request.',
          fix: 'Set in a filter, clear in finally; propagate explicitly to executor tasks.',
        },
        {
          mistake: 'Logging tokens, passwords, full card numbers or whole request bodies.',
          why: 'Logs are copied to many systems with broad access; this is a security and compliance breach.',
          fix: 'Log identifiers and outcomes, mask sensitive fields at the source, add redaction filters as a backstop.',
        },
        {
          mistake: 'Using user ids, order ids or raw URLs as metric tags.',
          why: 'Unbounded cardinality: millions of time series, huge cost, slow queries.',
          fix: 'Tag with bounded values (route template, status class, outcome); put ids in logs and traces.',
        },
        {
          mistake: 'Checking the database in the liveness probe.',
          why: 'A database outage makes every instance fail liveness and restart in a loop, adding load at the worst time.',
          fix: 'Liveness checks only the process; dependency checks belong in readiness (if anywhere).',
        },
      ],
      checks: [
        {
          id: 'pd1-c1',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'What is the main purpose of putting a trace id into the MDC?',
          options: [
            { id: 'a', text: 'To make logging faster' },
            { id: 'b', text: 'So that every log line written while handling a request carries the same id, linking logs to each other and to the distributed trace' },
            { id: 'c', text: 'To encrypt log lines' },
            { id: 'd', text: 'To reduce the number of log lines' },
          ],
          correctOptionId: 'b',
          explanation: 'Correlation ids let you filter one request\'s logs across threads and services and jump between logs and traces.',
        },
        {
          id: 'pd1-c2',
          kind: 'multi-select',
          dimension: 'interview',
          prompt: 'Which of these are acceptable Micrometer tag values for an HTTP request timer? Select all that apply.',
          options: [
            { id: 'a', text: 'uri="/orders/{id}" (route template)' },
            { id: 'b', text: 'status="503"' },
            { id: 'c', text: 'userId="u-81723"' },
            { id: 'd', text: 'method="POST"' },
            { id: 'e', text: 'uri="/orders/81723?expand=items" (raw URL)' },
          ],
          correctOptionIds: ['a', 'b', 'd'],
          explanation: 'Route templates, status codes and methods have small bounded value sets. User ids and raw URLs are unbounded and explode cardinality.',
        },
        {
          id: 'pd1-c3',
          kind: 'mcq',
          dimension: 'runtime',
          prompt: 'An instance is up but its connection pool to the database is exhausted for 30 seconds. Which probe should report the problem, if any?',
          options: [
            { id: 'a', text: 'Liveness, so Kubernetes restarts it' },
            { id: 'b', text: 'Readiness, so traffic is routed elsewhere until it recovers' },
            { id: 'c', text: 'Both' },
            { id: 'd', text: 'Startup probe' },
          ],
          correctOptionId: 'b',
          explanation: 'Restarting does not fix a temporary dependency problem and multiplies load. Readiness removes the instance from rotation without killing it.',
        },
        {
          id: 'pd1-c4',
          kind: 'mcq',
          dimension: 'interview',
          prompt: 'An SLO says 99.9% of requests succeed over 30 days. The service handles 50 million requests a month. What is the error budget?',
          options: [
            { id: 'a', text: '500 failed requests' },
            { id: 'b', text: '5,000 failed requests' },
            { id: 'c', text: '50,000 failed requests' },
            { id: 'd', text: '0.1 failed requests per second regardless of traffic' },
          ],
          correctOptionId: 'c',
          explanation: '0.1% of 50,000,000 = 50,000. Alert when that budget is being consumed much faster than the window allows (burn rate).',
        },
        {
          id: 'pd1-c5',
          kind: 'predict-output',
          dimension: 'debugging',
          prompt: 'A pooled worker thread handles two requests. The first handler forgets to clear the MDC. What does this print?',
          code: `import java.util.HashMap;
import java.util.Map;

public class Main {
    static final ThreadLocal<Map<String, String>> MDC = ThreadLocal.withInitial(HashMap::new);

    static void handle(String requestId, boolean setId) {
        if (setId) MDC.get().put("requestId", requestId);
        System.out.println("handling " + requestId + " logged as " + MDC.get().get("requestId"));
    }

    public static void main(String[] args) {
        handle("r-1", true);    // no MDC.remove() afterwards
        handle("r-2", false);   // a code path that does not set the id
    }
}`,
          options: [
            { id: 'a', text: 'handling r-1 logged as r-1\nhandling r-2 logged as null' },
            { id: 'b', text: 'handling r-1 logged as r-1\nhandling r-2 logged as r-1' },
            { id: 'c', text: 'handling r-1 logged as r-1\nhandling r-2 logged as r-2' },
            { id: 'd', text: 'handling r-1 logged as null\nhandling r-2 logged as null' },
          ],
          correctOptionId: 'b',
          explanation: 'Both calls run on the same thread, so the stale requestId survives. In a server this misattributes logs to the wrong user — always clear the MDC in finally.',
        },
      ],
      challengeIds: [],
      masteryCriteria: [
        'Produce structured logs with MDC correlation ids that are cleared reliably and contain no secrets.',
        'Instrument a service with RED metrics using bounded tags and percentile histograms.',
        'Explain trace context propagation and how logs and traces are linked.',
        'Design liveness and readiness probes and compute an error budget from an SLO.',
      ],
      relatedLessonIds: ['perf-diagnostics', 'prod-resilience', 'e-design', 'r-gc'],
      revision: [
        { id: 'r1', question: 'What are the three pillars of observability and what is each best for?', answer: 'Logs: details of individual events. Metrics: cheap aggregated numbers for dashboards and alerts. Traces: the path and timing of one request across services.' },
        { id: 'r2', question: 'What do RED and USE stand for?', answer: 'RED: Rate, Errors, Duration (for request-driven services). USE: Utilisation, Saturation, Errors (for resources such as pools, CPU and disks).' },
        { id: 'r3', question: 'Why is a user id a bad metric tag?', answer: 'Each distinct tag combination is a separate time series; unbounded values explode cardinality, cost and query time. Put such ids in logs and traces.' },
        { id: 'r4', question: 'Liveness vs readiness?', answer: 'Liveness failing means restart the process (it is broken). Readiness failing means stop sending it traffic for now (warming up, draining, dependency unavailable).' },
      ],
    },
    {
      id: 'prod-resilience',
      moduleId: 'production',
      title: 'Resilience: timeouts, retries, circuit breakers and idempotency',
      summary: 'Keep failures local: timeouts on every remote call, retries with exponential backoff and jitter for idempotent operations, circuit breakers, bulkheads, rate limits and graceful degradation.',
      estimatedMinutes: 45,
      difficulty: 'advanced',
      prerequisites: ['prod-observability', 'e-design'],
      versionNotes: [
        { feature: 'CompletableFuture.orTimeout and completeOnTimeout', since: 9 },
        { feature: 'java.net.http.HttpClient with connectTimeout and per-request timeout', since: 11 },
        { feature: 'Virtual threads: bulkheads become semaphores rather than dedicated thread pools', since: 21 },
      ],
      objectives: [
        'Put explicit timeouts on every remote call and explain what happens without them.',
        'Implement retries with capped exponential backoff and jitter, only for retryable, idempotent operations.',
        'Explain the CLOSED, OPEN and HALF_OPEN states of a circuit breaker.',
        'Use bulkheads, rate limiting, fallbacks and idempotency keys to contain failures.',
      ],
      plainEnglish: `In a system of many services, something is always failing a little: a slow database, a restarting pod, a network blip. Resilience is about making sure a small failure stays small instead of spreading until everything is down.

- **Timeouts**: never wait forever. A call that hangs holds a thread, a connection and the user.
- **Retries**: many failures are momentary, so try again — but wait a little longer each time, add randomness so clients do not retry in lock-step, and only retry operations that are safe to repeat.
- **Circuit breaker**: if a dependency keeps failing, stop calling it for a while and fail fast, then test it carefully before trusting it again.
- **Bulkheads and rate limits**: give each dependency or client its own limited share so one problem cannot consume everything.
- **Graceful degradation**: when a non-essential feature fails, show something simpler (cached prices, no recommendations) instead of an error page.`,
      technical: `### Timeouts everywhere
Every network call needs a **connect timeout** and a **request/read timeout**: HTTP clients (\`HttpClient.newBuilder().connectTimeout(...)\`, \`HttpRequest.newBuilder().timeout(...)\`), JDBC (\`setQueryTimeout\`, pool \`connectionTimeout\`), message producers, DNS. Without them a slow dependency fills your thread and connection pools — the failure becomes yours (see the pool-exhaustion incident). Derive timeouts from the dependency's measured p99 plus margin, and propagate a **deadline**: if the caller has 2 s in total, do not give an inner call 5 s.

### Retries
- Retry only **transient** failures (connection reset, 503, 429 with Retry-After, timeouts on idempotent reads), never validation errors (4xx).
- Retry only **idempotent** operations: GET, PUT of a full resource, DELETE — or make the operation idempotent with an **idempotency key**: the client sends a unique key (e.g. \`Idempotency-Key\` header); the server stores the result per key and returns the stored result for duplicates. Payment APIs work this way.
- **Exponential backoff with jitter**: delay = random(0, min(cap, base x 2^attempt)) ("full jitter") spreads retries out and prevents synchronised retry storms against a recovering service.
- Limit attempts (3-5) and the total time; use a **retry budget** (e.g. retries at most 10% of requests). Retry at **one layer** only: three layers each retrying 3 times turn 1 call into 27.

### Circuit breaker
States: **CLOSED** (calls flow; failures counted over a window), **OPEN** (calls fail immediately with a fallback; no load reaches the dependency), **HALF_OPEN** (after a cool-down, a limited number of trial calls; success closes the breaker, failure reopens it). Breakers protect both sides: the dependency gets time to recover, and callers stop wasting threads on calls that will fail. Resilience4j is the common library (\`CircuitBreaker\`, \`Retry\`, \`Bulkhead\`, \`RateLimiter\`, \`TimeLimiter\`), integrated with Spring Boot.

### Bulkheads and rate limiting
- **Bulkhead**: cap concurrent calls per dependency (a semaphore or a dedicated bounded pool) so a slow dependency can exhaust only its own share. With virtual threads, threads are cheap, so the limit must be a semaphore or pool size, not the thread count.
- **Rate limiting** protects a service from overload or enforces quotas per client — commonly a **token bucket** (tokens refill at a fixed rate up to a capacity; each request spends one; allows bursts up to the capacity). Return 429 with Retry-After.
- **Load shedding**: reject early when queues are full instead of letting latency grow without bound.

### Graceful degradation
Decide per dependency what the user sees when it fails: cached or default data, a reduced feature, a queued request ("we will email you"). Critical paths (payment) fail clearly; optional ones (recommendations) degrade silently but are measured.`,
      whyItExists: `Without explicit limits, distributed systems fail by cascading: a slow dependency causes waiting threads, waiting threads cause timeouts upstream, upstream retries multiply the load, and a 1% problem becomes a full outage. These patterns cap how much any one failure can consume.`,
      whenToUse: [
        'Timeouts on every remote call, always.',
        'Retries with backoff and jitter for transient failures of idempotent operations.',
        'Circuit breakers and bulkheads around each remote dependency in a service that has several.',
        'Idempotency keys on any create or payment operation a client might retry.',
      ],
      whenNotToUse: [
        'Do not retry non-idempotent operations (charge card, send email) without an idempotency key.',
        'Do not retry 4xx client errors such as 400 or 404.',
        'Do not retry at every layer of a call chain.',
        'Do not wrap in-process method calls in circuit breakers — they guard remote dependencies.',
      ],
      examples: [
        {
          id: 'pd-retry-backoff',
          title: 'Retry with capped exponential backoff and full jitter',
          runnable: true,
          code: `import java.util.Random;
import java.util.function.Supplier;

public class Main {
    // Fake clock: "sleeping" only advances time, so the demo is instant and deterministic
    static long nowMs = 0;
    static void sleep(long ms) { nowMs += ms; }

    static class TransientException extends RuntimeException {
        TransientException(String message) { super(message); }
    }

    static <T> T retry(Supplier<T> call, int maxAttempts, int baseMs, int capMs, Random random) {
        for (int attempt = 1; ; attempt++) {
            try {
                T result = call.get();
                System.out.println("t=" + nowMs + " attempt " + attempt + ": success");
                return result;
            } catch (TransientException e) {
                if (attempt == maxAttempts) {
                    System.out.println("t=" + nowMs + " attempt " + attempt + ": " + e.getMessage() + ", giving up");
                    throw e;
                }
                int ceiling = Math.min(capMs, baseMs << (attempt - 1));   // 100, 200, 400, 800, cap
                int delay = random.nextInt(ceiling + 1);                   // full jitter: 0..ceiling
                System.out.println("t=" + nowMs + " attempt " + attempt + ": " + e.getMessage()
                    + ", retry in " + delay + "ms (max " + ceiling + ")");
                sleep(delay);
            }
        }
    }

    public static void main(String[] args) {
        Random random = new Random(7);   // seeded only so the demo prints the same numbers each run
        int[] calls = {0};
        Supplier<String> inventory = () -> {
            if (++calls[0] <= 3) throw new TransientException("503");
            return "reserved";
        };
        System.out.println("result=" + retry(inventory, 5, 100, 1000, random));

        nowMs = 0;
        try {
            retry(() -> { throw new TransientException("timeout"); }, 3, 100, 1000, random);
        } catch (TransientException e) {
            System.out.println("fallback: show cached stock levels");
        }
    }
}`,
          expectedOutput: `t=0 attempt 1: 503, retry in 57ms (max 100)
t=57 attempt 2: 503, retry in 29ms (max 200)
t=86 attempt 3: 503, retry in 242ms (max 400)
t=328 attempt 4: success
result=reserved
t=0 attempt 1: timeout, retry in 11ms (max 100)
t=11 attempt 2: timeout, retry in 40ms (max 200)
t=51 attempt 3: timeout, giving up
fallback: show cached stock levels`,
          explanation: 'Reserving inventory is retried here because the real API takes an idempotency key (a reservation id), so a duplicate request cannot reserve twice. Injecting the clock and the random source is also how you unit-test retry logic without real sleeps.',
        },
        {
          id: 'pd-circuit-breaker',
          title: 'A minimal circuit breaker state machine',
          runnable: true,
          code: `public class Main {
    enum State { CLOSED, OPEN, HALF_OPEN }

    static class CircuitBreaker {
        private final int failureThreshold;
        private final long openMs;
        private State state = State.CLOSED;
        private int consecutiveFailures = 0;
        private long openedAt = 0;

        CircuitBreaker(int failureThreshold, long openMs) {
            this.failureThreshold = failureThreshold;
            this.openMs = openMs;
        }

        boolean allowRequest(long now) {
            if (state == State.OPEN && now - openedAt >= openMs) state = State.HALF_OPEN;
            return state != State.OPEN;          // HALF_OPEN lets a trial call through
        }

        void onSuccess() {
            state = State.CLOSED;
            consecutiveFailures = 0;
        }

        void onFailure(long now) {
            consecutiveFailures++;
            if (state == State.HALF_OPEN || consecutiveFailures >= failureThreshold) {
                state = State.OPEN;
                openedAt = now;
            }
        }

        State state() { return state; }
    }

    public static void main(String[] args) {
        CircuitBreaker breaker = new CircuitBreaker(3, 5000);
        long[] times =         {0,    100,   200,   300,   1000, 5400,  5500, 11000};
        boolean[] dependencyUp = {true, false, false, false, true, false, true, true};

        for (int i = 0; i < times.length; i++) {
            long now = times[i];
            String outcome;
            if (!breaker.allowRequest(now)) outcome = "rejected, fallback";
            else if (dependencyUp[i]) { breaker.onSuccess(); outcome = "ok"; }
            else { breaker.onFailure(now); outcome = "failed"; }
            System.out.printf("t=%5d %-18s -> %s%n", now, outcome, breaker.state());
        }
    }
}`,
          expectedOutput: `t=    0 ok                 -> CLOSED
t=  100 failed             -> CLOSED
t=  200 failed             -> CLOSED
t=  300 failed             -> OPEN
t= 1000 rejected, fallback -> OPEN
t= 5400 failed             -> OPEN
t= 5500 rejected, fallback -> OPEN
t=11000 ok                 -> CLOSED`,
          explanation: 'At t=1000 the dependency has actually recovered, but the breaker does not know yet and fails fast. At t=5400 the first trial fails, so the breaker reopens for another 5 s; the trial at t=11000 succeeds and closes it. Production breakers (Resilience4j) use failure-rate windows, slow-call thresholds and thread-safe state, and allow a configurable number of trial calls.',
        },
        {
          id: 'pd-resilience4j',
          title: 'Timeouts, Resilience4j and idempotency keys in practice',
          runnable: false,
          code: `HttpClient client = HttpClient.newBuilder()
    .connectTimeout(Duration.ofMillis(500))
    .build();

HttpRequest request = HttpRequest.newBuilder(URI.create("https://payments.internal/charges"))
    .timeout(Duration.ofSeconds(2))                       // per-request timeout
    .header("Idempotency-Key", orderId + ":charge")       // safe to retry: duplicates return the first result
    .POST(HttpRequest.BodyPublishers.ofString(json))
    .build();

CircuitBreaker breaker = CircuitBreaker.of("payments", CircuitBreakerConfig.custom()
    .failureRateThreshold(50)                             // open when 50% of the window fails...
    .slowCallDurationThreshold(Duration.ofSeconds(1))     // ...or is slower than 1 s
    .slidingWindowSize(20)
    .waitDurationInOpenState(Duration.ofSeconds(10))
    .permittedNumberOfCallsInHalfOpenState(3)
    .build());

Retry retry = Retry.of("payments", RetryConfig.custom()
    .maxAttempts(3)
    .intervalFunction(IntervalFunction.ofExponentialRandomBackoff(Duration.ofMillis(100), 2.0))
    .retryOnException(e -> e instanceof IOException)      // transient only
    .build());

Bulkhead bulkhead = Bulkhead.of("payments", BulkheadConfig.custom().maxConcurrentCalls(20).build());

Supplier<HttpResponse<String>> call = () -> send(client, request);
Supplier<HttpResponse<String>> guarded = Decorators.ofSupplier(call)
    .withBulkhead(bulkhead)
    .withCircuitBreaker(breaker)
    .withRetry(retry)
    .decorate();`,
          explanation: 'Order matters: here each retry attempt passes through the circuit breaker and bulkhead, so an open breaker stops retries immediately. Every limit (timeouts, attempts, window sizes) should come from measured latency and error data and be visible in metrics.',
        },
      ],
      walkthrough: {
        exampleId: 'pd-retry-backoff',
        steps: [
          { lines: [5, 7], text: 'Time is injected. Production code would pass a Clock and a sleeper; tests replace them with fakes like this one.' },
          { lines: [13, 18], text: 'Each attempt calls the operation; a success returns immediately.' },
          { lines: [19, 23], text: 'Only TransientException is caught — anything else (a validation error, a 400) propagates at once. After maxAttempts the last error is rethrown so the caller can degrade.' },
          { lines: [24, 28], text: 'The ceiling doubles each attempt (100, 200, 400 ...) up to the cap; the actual delay is random between 0 and the ceiling, so many clients do not retry at the same instant.' },
          { lines: [36, 40], text: 'The fake inventory service fails three times, then succeeds on the fourth attempt.' },
          { lines: [42, 47], text: 'A dependency that keeps timing out exhausts the attempts; the caller catches the final failure and serves a fallback instead of an error page.' },
        ],
      },
      realWorld: {
        title: 'The retry storm that kept an outage going',
        scenario: `A pricing service had a 30-second database failover. Its 40 callers each retried immediately up to 5 times with no backoff, and the API gateway in front retried as well. When the database came back, it received roughly 25 times the normal load in the first second, its connection pool saturated, latency went to 20 s, and the failover turned into a 45-minute outage.

The fix combined several patterns: timeouts derived from p99 (300 ms instead of the client default of none), retries only in the gateway with full-jitter backoff and a 10% retry budget, a circuit breaker in each caller with cached prices as the fallback, and a token-bucket rate limiter in the pricing service that returned 429 with Retry-After instead of queueing. The next failover was invisible to users.`,
      },
      commonMistakes: [
        {
          mistake: 'Calling remote services with no timeout (or a default of infinity).',
          why: 'Hung calls pin threads and connections until pools are exhausted.',
          fix: 'Set connect and request timeouts on every client, derived from measured latency, within the caller\'s deadline.',
        },
        {
          mistake: 'Retrying immediately in a tight loop, without jitter.',
          why: 'All clients hammer the recovering dependency at the same moments, keeping it down.',
          fix: 'Capped exponential backoff with full jitter, a small attempt limit and a retry budget.',
        },
        {
          mistake: 'Retrying a POST that charges a card.',
          why: 'If the first request succeeded but the response was lost, the customer is charged twice.',
          fix: 'Send an idempotency key the server deduplicates on, or do not retry.',
        },
        {
          mistake: 'Retrying at every layer of the call chain.',
          why: 'Retries multiply: 3 layers x 3 attempts = 27 calls for one user request.',
          fix: 'Retry at one layer (usually closest to the failing dependency) and fail fast elsewhere.',
        },
      ],
      checks: [
        {
          id: 'pd2-c1',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'Why is jitter added to exponential backoff?',
          options: [
            { id: 'a', text: 'To make retries faster' },
            { id: 'b', text: 'To spread retries from many clients over time so they do not hit the recovering service in synchronised waves' },
            { id: 'c', text: 'To make the operation idempotent' },
            { id: 'd', text: 'To avoid needing a timeout' },
          ],
          correctOptionId: 'b',
          explanation: 'Without jitter, clients that failed together retry together. Randomised delays smooth the load.',
        },
        {
          id: 'pd2-c2',
          kind: 'multi-select',
          dimension: 'interview',
          prompt: 'Which requests are safe to retry automatically after a timeout? Select all that apply.',
          options: [
            { id: 'a', text: 'GET /orders/42' },
            { id: 'b', text: 'PUT /users/7/address with the full new address' },
            { id: 'c', text: 'POST /payments without an idempotency key' },
            { id: 'd', text: 'POST /payments with an Idempotency-Key the server deduplicates on' },
            { id: 'e', text: 'POST /emails/send (sends a newsletter)' },
          ],
          correctOptionIds: ['a', 'b', 'd'],
          explanation: 'GET and a full-resource PUT are idempotent; a POST becomes safe only when the server deduplicates by key. Otherwise a lost response leads to a duplicate charge or email.',
        },
        {
          id: 'pd2-c3',
          kind: 'mcq',
          dimension: 'runtime',
          prompt: 'A circuit breaker is OPEN and its wait duration has elapsed. What happens to the next call?',
          options: [
            { id: 'a', text: 'It is rejected forever until an operator resets the breaker' },
            { id: 'b', text: 'The breaker moves to HALF_OPEN and lets a limited number of trial calls through; success closes it, failure reopens it' },
            { id: 'c', text: 'The breaker closes and all queued calls are sent at once' },
            { id: 'd', text: 'The call is retried 3 times' },
          ],
          correctOptionId: 'b',
          explanation: 'HALF_OPEN probes recovery carefully instead of releasing full traffic onto a dependency that may still be fragile.',
        },
        {
          id: 'pd2-c4',
          kind: 'predict-output',
          dimension: 'interview',
          prompt: 'Three service layers each make up to 3 attempts per incoming call, and the bottom dependency is down. How many calls does it receive for one user request?',
          code: `public class Main {
    static int calls = 0;

    static void layer(int depth) {
        for (int attempt = 1; attempt <= 3; attempt++) {
            try {
                if (depth == 3) { calls++; throw new IllegalStateException("down"); }
                layer(depth + 1);
                return;
            } catch (IllegalStateException e) {
                // retry
            }
        }
        throw new IllegalStateException("gave up at layer " + depth);
    }

    public static void main(String[] args) {
        try {
            layer(1);
        } catch (IllegalStateException e) {
            System.out.println(e.getMessage() + ", dependency calls = " + calls);
        }
    }
}`,
          options: [
            { id: 'a', text: 'gave up at layer 1, dependency calls = 3' },
            { id: 'b', text: 'gave up at layer 1, dependency calls = 9' },
            { id: 'c', text: 'gave up at layer 1, dependency calls = 27' },
            { id: 'd', text: 'gave up at layer 3, dependency calls = 27' },
          ],
          correctOptionId: 'c',
          explanation: 'Every layer re-runs the whole chain below it: 3 x 3 x 3 = 27 calls hit a dependency that is already down. Retry at one layer only.',
        },
        {
          id: 'pd2-c5',
          kind: 'mcq',
          dimension: 'debugging',
          prompt: 'During a slowdown of the recommendations service, the checkout endpoint also times out, although checkout does not need recommendations to succeed. Both share one 200-thread pool. Which pattern addresses this most directly?',
          options: [
            { id: 'a', text: 'A bulkhead: cap concurrent recommendation calls (and add a timeout and fallback) so they cannot consume the threads checkout needs' },
            { id: 'b', text: 'More retries for the recommendation calls' },
            { id: 'c', text: 'A larger heap' },
            { id: 'd', text: 'Logging at DEBUG level' },
          ],
          correctOptionId: 'a',
          explanation: 'Isolation keeps a slow optional dependency from starving critical work. Retries would make it worse.',
        },
      ],
      challengeIds: ['ch-token-bucket', 'ch-circuit-breaker-log'],
      masteryCriteria: [
        'Configure connect and request timeouts that fit within an end-to-end deadline.',
        'Implement capped exponential backoff with jitter and justify which errors and operations are retried.',
        'Trace a circuit breaker through CLOSED, OPEN and HALF_OPEN for a sequence of calls.',
        'Explain bulkheads, token-bucket rate limiting and idempotency keys with an example each.',
      ],
      relatedLessonIds: ['prod-observability', 'prod-microservices', 'e-design', 'e-resources', 'io-http', 'perf-diagnostics'],
      revision: [
        { id: 'r1', question: 'Which operations may be retried automatically?', answer: 'Idempotent ones (GET, full PUT, DELETE) or operations made idempotent with an idempotency key, and only for transient errors such as timeouts, connection resets, 503 and 429.' },
        { id: 'r2', question: 'Describe full-jitter exponential backoff.', answer: 'For attempt n wait a random time between 0 and min(cap, base x 2^n); limit attempts and total time.' },
        { id: 'r3', question: 'What are the three circuit breaker states?', answer: 'CLOSED: calls flow and failures are counted. OPEN: calls fail fast. HALF_OPEN: after a wait, limited trial calls decide whether to close or reopen.' },
        { id: 'r4', question: 'How does a token bucket rate limiter work?', answer: 'Tokens refill at a fixed rate up to a capacity; each request takes one; requests with no token available are rejected (429). Capacity allows short bursts.' },
      ],
    },
    {
      id: 'prod-microservices',
      moduleId: 'production',
      title: 'Service boundaries: monoliths, modular monoliths and microservices',
      summary: 'Optional: the real trade-offs of microservices, data ownership, sagas and the transactional outbox, API versioning — and when not to split a system.',
      estimatedMinutes: 35,
      difficulty: 'advanced',
      prerequisites: ['prod-resilience'],
      versionNotes: [
        { feature: 'Java Platform Module System for enforcing module boundaries inside one deployable', since: 9 },
        { feature: 'Records for immutable event and DTO types', since: 16 },
        { feature: 'Sealed interfaces for closed sets of event or command types', since: 17 },
      ],
      objectives: [
        'Compare a monolith, a modular monolith and microservices on cost, coupling and team autonomy.',
        'Explain why each service owns its data and what that means for consistency.',
        'Describe sagas with compensations and the transactional outbox with idempotent consumers.',
        'Version APIs compatibly and recognise when microservices are the wrong choice.',
      ],
      plainEnglish: `A **monolith** is one application deployed as one unit. **Microservices** split the system into many small applications that talk over the network, each owned by one team and deployed independently.

Microservices are not "better architecture" by default. They trade code complexity for **distributed-system complexity**: network failures, eventual consistency, many deployments, harder debugging. They pay off when many teams need to ship independently or parts of the system need very different scaling — not because the codebase feels big.

A good middle ground for most teams is a **modular monolith**: one deployable, but strict internal modules with clear interfaces and separate data, so it can be split later if a real need appears.`,
      technical: `### The spectrum
- **Monolith**: simplest to build, test, deploy and debug; one database transaction covers everything. Risk: without discipline it becomes a "big ball of mud" where every change touches everything.
- **Modular monolith**: modules by business capability (orders, billing, catalog) with enforced boundaries (packages plus ArchUnit tests, JPMS modules, or Spring Modulith), each owning its tables, communicating through interfaces or in-process events.
- **Microservices**: independent deployment and scaling, team autonomy, technology freedom, fault isolation — at the price of network calls (latency, partial failure), eventual consistency, operational overhead (CI/CD, observability, service discovery, security per service) and harder end-to-end testing.
- A **distributed monolith** — services that must be deployed together, share a database or call each other synchronously in long chains — has the costs of both and the benefits of neither.

### Data ownership
Each service owns its data; others access it only through its API or events — no shared tables. Consequences: no cross-service joins (replicate read models via events), no distributed ACID transactions (two-phase commit is avoided for availability reasons), and consistency becomes **eventual**.

### Sagas
A business transaction spanning services is a **saga**: a sequence of local transactions, each with a **compensating action** that semantically undoes it (refund a payment, release reserved stock). **Orchestration**: a coordinator tells each service what to do (easier to follow). **Choreography**: services react to each other's events (looser coupling, harder to see the whole flow). Compensations must be idempotent and retryable; some actions (sending an email) cannot be undone, so order steps accordingly.

### Transactional outbox and idempotent consumers
Writing to the database and publishing a message are two systems: if the service crashes between them, data and events disagree (the **dual-write problem**). The **outbox** pattern writes the business row and an event row in the same local transaction; a relay (polling or change data capture such as Debezium) publishes outbox rows to the broker. Delivery is then **at least once**, so consumers must be **idempotent** — record processed event ids (in the same transaction as their own changes) and ignore duplicates.

### API versioning and compatibility
Prefer backwards-compatible evolution: add optional fields, never remove or rename fields in place, tolerate unknown fields (tolerant reader). For breaking changes, version explicitly (\`/v2/orders\`, a media-type version or a header), run both versions in parallel, and track consumers before retiring the old one. Consumer-driven contract tests (e.g. Pact, Spring Cloud Contract) catch breaking changes before deployment. For events, use a schema registry with compatibility rules.

### When not to use microservices
Small team (fewer than ~3 teams), unclear domain boundaries, a new product still finding its shape, no mature CI/CD and observability, or a strong need for transactional consistency across the data. Start with a modular monolith; extract a service when a specific, measured need (independent scaling, release cadence, team ownership, fault isolation) justifies it.`,
      whyItExists: `Organisations with many teams need to change and deploy parts of a system independently, and some components have very different scaling or reliability needs. Service boundaries make that possible, while patterns such as sagas, outboxes and idempotent consumers exist because giving up a single database means giving up its transactions.`,
      whenToUse: [
        'Several teams blocked by each other\'s releases in one codebase with clear business boundaries.',
        'Components with very different scaling, availability or technology needs.',
        'Use sagas and the outbox whenever a business process spans services that own separate data.',
      ],
      whenNotToUse: [
        'A small team or an early-stage product with unclear boundaries — use a modular monolith.',
        'When the services would share one database or always deploy together.',
        'When the organisation lacks automated deployment, observability and on-call ownership per service.',
      ],
      examples: [
        {
          id: 'pd-outbox',
          title: 'Transactional outbox with an idempotent consumer',
          runnable: true,
          code: `import java.util.*;

public class Main {
    record Event(String id, String type, String payload) {}

    // Order service database: the orders table and the outbox table
    static final Map<String, String> orders = new LinkedHashMap<>();
    static final List<Event> outbox = new ArrayList<>();
    static int nextEventId = 1;

    static void placeOrder(String orderId, String item) {
        // BEGIN TRANSACTION -- both rows commit together or not at all
        orders.put(orderId, item);
        outbox.add(new Event("evt-" + nextEventId++, "OrderPlaced", orderId + ":" + item));
        // COMMIT
    }

    // Relay: publishes outbox rows, then marks them sent. A crash in between means re-publishing.
    static List<Event> relay(boolean crashBeforeMarkingSent) {
        List<Event> published = new ArrayList<>(outbox);
        if (!crashBeforeMarkingSent) outbox.clear();
        return published;
    }

    // Shipping service: an idempotent consumer that remembers processed event ids
    static final Set<String> processedEventIds = new HashSet<>();
    static int shipments = 0;

    static void onEvent(Event e) {
        if (!processedEventIds.add(e.id())) {
            System.out.println("duplicate " + e.id() + " ignored");
            return;
        }
        shipments++;
        System.out.println("shipping " + e.payload() + " (" + e.id() + ")");
    }

    public static void main(String[] args) {
        placeOrder("o-1", "book");
        placeOrder("o-2", "lamp");
        for (Event e : relay(true)) onEvent(e);    // relay crashes after publishing
        for (Event e : relay(false)) onEvent(e);   // restarted relay publishes the same rows again
        System.out.println("orders=" + orders.size() + " shipments=" + shipments + " pending=" + outbox.size());
    }
}`,
          expectedOutput: `shipping o-1:book (evt-1)
shipping o-2:lamp (evt-2)
duplicate evt-1 ignored
duplicate evt-2 ignored
orders=2 shipments=2 pending=0`,
          explanation: 'Delivery is at least once, so duplicates are normal, not a bug. In a real consumer the processed-id insert and the shipment row must be written in the same local transaction; otherwise a crash between them reintroduces the dual-write problem on the consumer side.',
        },
        {
          id: 'pd-saga',
          title: 'An orchestrated saga with compensations',
          runnable: true,
          code: `import java.util.*;

public class Main {
    record Step(String name, Runnable action, Runnable compensation) {}

    static boolean runSaga(List<Step> steps) {
        Deque<Step> completed = new ArrayDeque<>();
        for (Step step : steps) {
            try {
                step.action().run();
                completed.push(step);
                System.out.println("done:        " + step.name());
            } catch (RuntimeException e) {
                System.out.println("failed:      " + step.name() + " (" + e.getMessage() + ")");
                while (!completed.isEmpty()) {          // undo in reverse order
                    Step done = completed.pop();
                    done.compensation().run();
                    System.out.println("compensated: " + done.name());
                }
                return false;
            }
        }
        return true;
    }

    public static void main(String[] args) {
        int[] stock = {5};
        long[] balanceCents = {10_000};
        List<Step> checkout = List.of(
            new Step("reserve 2 items", () -> stock[0] -= 2, () -> stock[0] += 2),
            new Step("charge 4500 cents", () -> balanceCents[0] -= 4500, () -> balanceCents[0] += 4500),
            new Step("book courier", () -> { throw new IllegalStateException("no courier available"); }, () -> { })
        );
        boolean ok = runSaga(checkout);
        System.out.println("success=" + ok + " stock=" + stock[0] + " balance=" + balanceCents[0]);
    }
}`,
          expectedOutput: `done:        reserve 2 items
done:        charge 4500 cents
failed:      book courier (no courier available)
compensated: charge 4500 cents
compensated: reserve 2 items
success=false stock=5 balance=10000`,
          explanation: 'In a real system each step is a call to another service and the orchestrator persists the saga state, so it can resume compensations after a crash. Compensations are new business actions (a refund is visible on the statement), not a database rollback.',
        },
      ],
      walkthrough: {
        exampleId: 'pd-outbox',
        steps: [
          { lines: [6, 9], text: 'The order service owns two tables: orders and an outbox of events still to be published.' },
          { lines: [11, 16], text: 'The order row and its event row are written in one local transaction, so there is never an order without an event or an event without an order.' },
          { lines: [18, 23], text: 'The relay publishes pending rows and then marks them sent. If it crashes in between, the rows are published again on restart: at-least-once delivery.' },
          { lines: [25, 36], text: 'The consumer records each event id it has processed; Set.add returns false for a duplicate, which is skipped. This makes redelivery harmless.' },
          { lines: [38, 44], text: 'Two orders, a crash, a re-publish: both events arrive twice, yet exactly two shipments are created and the outbox is drained.' },
        ],
      },
      realWorld: {
        title: 'Twelve services, one release train',
        scenario: `A five-developer team split a young booking product into twelve microservices sharing one PostgreSQL database. Every feature touched four services, which had to be deployed in a fixed order; a booking made eight synchronous HTTP calls, so a slow pricing service froze checkout; and debugging needed traces across six repositories. It was a distributed monolith.

They merged the services back into a **modular monolith** with packages per business capability (booking, pricing, payments, notifications), ArchUnit tests that forbid cross-module access to internals, and in-process events between modules. Lead time for changes fell from two weeks to two days. Two years later, when the payments module needed PCI isolation and a separate team, it was extracted cleanly — with its own database, an outbox for its events and a versioned API — because the boundary already existed.`,
      },
      commonMistakes: [
        {
          mistake: 'Splitting into microservices that share one database.',
          why: 'Schema changes couple every service; you pay for distribution but keep the coupling.',
          fix: 'Each service owns its tables; others use its API or events.',
        },
        {
          mistake: 'Saving to the database and then publishing a message as two separate steps.',
          why: 'A crash between them loses the event (or publishes one for data that was rolled back).',
          fix: 'Use the transactional outbox (or change data capture) and idempotent consumers.',
        },
        {
          mistake: 'Long chains of synchronous calls between services.',
          why: 'Latencies add up and availability multiplies down (0.99^8 is about 92%).',
          fix: 'Fewer, coarser calls; asynchronous events; local read models; timeouts and breakers.',
        },
        {
          mistake: 'Removing or renaming a field in a public API or event in place.',
          why: 'Consumers you do not control break at deployment time.',
          fix: 'Add fields compatibly, deprecate, version for breaking changes and use contract tests.',
        },
      ],
      checks: [
        {
          id: 'pd3-c1',
          kind: 'mcq',
          dimension: 'interview',
          prompt: 'A team of four developers is starting a new product with uncertain requirements. Which architecture is usually the best starting point?',
          options: [
            { id: 'a', text: 'Microservices from day one, one per entity' },
            { id: 'b', text: 'A modular monolith with clear internal boundaries, extracting services later only for a concrete need' },
            { id: 'c', text: 'Serverless functions for every method' },
            { id: 'd', text: 'Several services sharing one database' },
          ],
          correctOptionId: 'b',
          explanation: 'Microservices pay off with many teams and stable boundaries; early on they add distributed-system cost without the benefits.',
        },
        {
          id: 'pd3-c2',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'What problem does the transactional outbox pattern solve?',
          options: [
            { id: 'a', text: 'Slow SQL queries' },
            { id: 'b', text: 'The dual write: keeping a database change and the published event consistent without a distributed transaction' },
            { id: 'c', text: 'Message ordering across partitions' },
            { id: 'd', text: 'Authentication between services' },
          ],
          correctOptionId: 'b',
          explanation: 'The event is stored in the same local transaction as the data and published afterwards by a relay; delivery becomes at least once.',
        },
        {
          id: 'pd3-c3',
          kind: 'predict-output',
          dimension: 'coding',
          prompt: 'The broker redelivers some events. What does this idempotent consumer print?',
          code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Set<String> processed = new HashSet<>();
        long balance = 0;
        String[] deliveries = {"e1:100", "e2:50", "e1:100", "e3:25", "e2:50"};
        for (String d : deliveries) {
            String[] parts = d.split(":");
            if (processed.add(parts[0])) balance += Long.parseLong(parts[1]);
        }
        System.out.println(processed.size() + " " + balance);
    }
}`,
          options: [
            { id: 'a', text: '5 325' },
            { id: 'b', text: '3 175' },
            { id: 'c', text: '3 325' },
            { id: 'd', text: '5 175' },
          ],
          correctOptionId: 'b',
          explanation: 'Set.add returns false for e1 and e2 the second time, so each event is applied once: 100 + 50 + 25 = 175.',
        },
        {
          id: 'pd3-c4',
          kind: 'multi-select',
          dimension: 'conceptual',
          prompt: 'Which are signs of a distributed monolith? Select all that apply.',
          options: [
            { id: 'a', text: 'Services must be deployed together in a fixed order' },
            { id: 'b', text: 'Several services read and write the same database tables' },
            { id: 'c', text: 'One user request triggers a long chain of synchronous calls across many services' },
            { id: 'd', text: 'Each service owns its data and publishes events' },
            { id: 'e', text: 'Teams can release their service independently' },
          ],
          correctOptionIds: ['a', 'b', 'c'],
          explanation: 'Lock-step deployment, shared tables and synchronous chains keep tight coupling while adding network failure modes.',
        },
        {
          id: 'pd3-c5',
          kind: 'mcq',
          dimension: 'interview',
          prompt: 'In a saga, payment succeeded but shipping booking failed. What should happen?',
          options: [
            { id: 'a', text: 'Roll back the payment service\'s database transaction from the orchestrator' },
            { id: 'b', text: 'Run the compensating action for completed steps (e.g. refund the payment, release stock), in reverse order' },
            { id: 'c', text: 'Ignore the failure because the payment succeeded' },
            { id: 'd', text: 'Use two-phase commit across all services' },
          ],
          correctOptionId: 'b',
          explanation: 'The payment transaction already committed in another service. A saga undoes it semantically with a compensating business action.',
        },
      ],
      challengeIds: [],
      masteryCriteria: [
        'Argue for or against microservices for a given team size, domain and operational maturity.',
        'Explain data ownership and why it leads to eventual consistency.',
        'Design a saga with compensations and an outbox with idempotent consumers.',
        'Evolve an API or event schema without breaking existing consumers.',
      ],
      relatedLessonIds: ['prod-resilience', 'prod-observability', 'j-transactions', 'o-solid', 'p-packages-classpath'],
      revision: [
        { id: 'r1', question: 'What is a modular monolith?', answer: 'One deployable application split into strictly bounded business modules with their own data and explicit interfaces, so it keeps monolith simplicity but can be split later.' },
        { id: 'r2', question: 'What is a saga?', answer: 'A business transaction across services implemented as a sequence of local transactions, each with a compensating action that is run (in reverse) if a later step fails.' },
        { id: 'r3', question: 'Why must outbox consumers be idempotent?', answer: 'The relay can publish an event more than once (at-least-once delivery), so consumers must detect and ignore duplicates, e.g. by recording processed event ids.' },
        { id: 'r4', question: 'Name three reasons not to use microservices.', answer: 'Small team, unclear domain boundaries, immature CI/CD and observability, or a need for strong transactional consistency across the data.' },
      ],
    },
  ],
};
