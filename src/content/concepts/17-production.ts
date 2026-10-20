import type { LessonConcepts } from '@/types/curriculum';

/** Concept pages for module 17 (Production), keyed by lesson id. */
export const productionConcepts: Record<string, LessonConcepts> = {
  // -------------------------------------------------------------------------
  'prod-observability': {
    quick: {
      definition: '**Observability** means you can understand what a running app is doing from the data it sends out. The three main kinds of data are logs, metrics and traces.',
      points: [
        '**Logs** are text records of events, such as an error with its message.',
        '**Metrics** are numbers over time, such as requests per second or memory used.',
        '**Traces** follow one request as it travels through many services.',
        'In Spring Boot, Actuator adds ready-made endpoints and Micrometer collects the metrics.',
        'Health probes tell the platform if your app is alive and ready for traffic.',
      ],
      example: {
        title: 'Turn on Actuator health probes',
        code: '# application.yml\nmanagement:\n  endpoints:\n    web:\n      exposure:\n        include: health,metrics\n  endpoint:\n    health:\n      probes:\n        enabled: true\n\n# Then ask the running app:\n#   GET /actuator/health/liveness\n#   GET /actuator/health/readiness\n#   GET /actuator/metrics/jvm.memory.used',
        runnable: false,
        explain: 'The config exposes the `health` and `metrics` endpoints and turns on the liveness and readiness probes. Liveness says the app is running. Readiness says it can accept requests. This needs a running Spring Boot app with Actuator.',
      },
      tip: 'Never put secrets in logs or expose every Actuator endpoint to the internet.',
    },
    textbook: {
      definition:
        '**Observability** is the property of a system that lets you work out its internal states from its external outputs. The term comes from control theory. In software operations, it means being able to answer any question about a running system from the **telemetry** it emits. Telemetry is mainly **metrics**, **logs** and **traces**, linked by shared context such as a trace identifier. Observability differs from **monitoring**, which checks predefined conditions. Observability data supports **health checks**, which report an instance\'s state to the platform. It also supports **service level objectives** (SLOs), which state target levels of reliability.',
      terms: [
        { term: 'Telemetry', meaning: 'Data that a running system emits about its own behaviour. It is collected and sent away for analysis.' },
        { term: 'Metric', meaning: 'A numeric measurement aggregated over time and stored as a time series. A name and a bounded set of tags identify it.' },
        { term: 'Trace', meaning: 'A tree of spans that describes the path of one request through a distributed system. Each span is a timed operation with a parent.' },
        { term: 'Service level indicator (SLI)', meaning: 'A numeric measure of some part of the service level provided, such as the proportion of successful requests.' },
        { term: 'Service level objective (SLO)', meaning: 'A target value or range for an SLI over a time window. The shortfall it allows is the error budget.' },
      ],
      source: 'Google, Site Reliability Engineering (2016), chapter 4; OpenTelemetry specification; W3C Trace Context',
    },
    interviewDefinition:
      '**Observability** is the ability to explain a system\'s internal state from its outputs, well enough to answer questions you did not expect. It rests on three linked signals. **Metrics** are cheap aggregated numbers for dashboards and alerts, chosen with RED and USE. **Logs** are structured events with context. **Traces** are span trees that follow one request across services. A shared trace id joins them. Health probes tell the platform how to treat an instance. **SLOs** with error budgets turn the signals into reliability targets and symptom-based alerts.',
    interviewFollowUps: [
      {
        question: 'What is the difference between monitoring and observability?',
        answer: 'Monitoring checks known failure modes with predefined dashboards and alerts ("is CPU above 90%?"). Observability is the property that lets you investigate unknown ones. You slice telemetry with rich context by any dimension to find out *why* some requests are slow. Monitoring is something you do; observability is something the system has.',
      },
      {
        question: 'Liveness vs readiness?',
        answer: 'Liveness asks "is this process broken beyond recovery?". A failure restarts the container, so the check must not depend on databases or other services. Readiness asks "should this instance receive traffic now?". A failure only removes it from load balancing until it recovers (warm-up, overload, draining).',
      },
      {
        question: 'Head-based vs tail-based trace sampling?',
        answer: 'Head-based sampling decides at the start of a trace (e.g. keep 10%). It is cheap, but it drops most rare errors. Tail-based sampling buffers spans and decides after the trace completes. So it can keep every slow or failed trace. It needs a collector tier with memory for buffering.',
      },
    ],
    mnemonic: {
      device: '"Metrics tell you THAT, traces tell you WHERE, logs tell you WHY"',
      expansion: [
        { key: 'THAT (metrics)', meaning: 'Something is wrong: the error rate or p99 crossed a threshold. Cheap, aggregated, ideal for alerts.' },
        { key: 'WHERE (traces)', meaning: 'Which service, call or query in the request\'s path took the time or failed.' },
        { key: 'WHY (logs)', meaning: 'The detailed events and error messages at that exact place, found by the trace id.' },
      ],
      visual: 'Picture a smoke alarm (metric) going off, a floor plan with the smoky room highlighted (trace), and the note on the stove saying "left the pan on" (log).',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'Dashboard, GPS history, mechanic\'s notes',
        body: 'Your car\'s dashboard shows speed and warning lights (metrics). The GPS history replays one journey turn by turn with timings (a trace). The mechanic\'s notes describe exactly what happened to one part at one moment (logs). You glance at the dashboard constantly, replay the journey when something felt wrong, and read the notes once you know where to look.',
      },
      {
        kind: 'insight',
        title: 'Cardinality is multiplication',
        body: 'Each unique tag combination is a separate time series. 20 routes × 5 status classes × 50 instances = 5,000 series per metric — fine. Add a `userId` tag with a million values and it becomes 5 billion, which no metrics backend will store affordably. High-cardinality detail belongs in logs and trace attributes; metrics stay bounded.',
      },
      {
        kind: 'real-world',
        title: 'The liveness probe that restarted the fleet',
        body: 'A team made the liveness probe call the database. During a 40-second database failover every instance failed liveness, Kubernetes restarted them all, and the cold restarts (JIT warm-up, cache reloading) turned a 40-second blip into a 10-minute outage. The fix: liveness checks only the process; the database belongs in readiness, if anywhere.',
      },
      {
        kind: 'angle',
        title: 'Exemplars connect a spike to a single request',
        body: 'An exemplar is a trace id attached to a sample in a metric histogram bucket. On a latency graph you click the dot in the p99 spike and land directly in the trace of a request that was that slow. Micrometer, Prometheus (OpenMetrics) and OpenTelemetry support exemplars, closing the loop from "that" to "where" in one click.',
      },
    ],
    diagrams: [
      {
        id: 'prod-observability-pillars',
        kind: 'concept',
        title: 'Three signals, one id',
        caption: 'The signals are only powerful together. The trace id links a metric spike to a trace, and the trace to the log lines written while it ran.',
        explanation: [
          '**Metrics** tell you THAT something is wrong: request rate, errors and p99 latency crossed a threshold. They are cheap and aggregated.',
          '**Traces** tell you WHERE: a span for each hop shows which service or query took the time or failed.',
          '**Logs** tell you WHY: structured events record the exact error and context at that place.',
          'All three arrows point to the **Trace id**, carried in the `traceparent` header and the logging MDC. Metrics link to it through exemplars, logs through an MDC field.',
          'Takeaway: the shared id lets you jump from a metric spike to one slow trace and then to the log lines it wrote.',
        ],
        cols: 3,
        rows: 2,
        nodes: [
          { id: 'metrics', label: 'Metrics', detail: 'THAT: rate, errors, p99', col: 0, row: 0, tone: 'primary' },
          { id: 'traces', label: 'Traces', detail: 'WHERE: spans per hop', col: 1, row: 0, tone: 'accent' },
          { id: 'logs', label: 'Logs', detail: 'WHY: structured events', col: 2, row: 0, tone: 'success' },
          { id: 'id', label: 'Trace id', detail: '32 hex chars, carried in traceparent and the MDC', col: 0, row: 1, span: 3, shape: 'pill', tone: 'warning' },
        ],
        edges: [
          { from: 'metrics', to: 'id', label: 'exemplars' },
          { from: 'traces', to: 'id', label: 'trace id' },
          { from: 'logs', to: 'id', label: 'MDC field' },
        ],
      },
      {
        id: 'prod-observability-pipeline',
        kind: 'architecture',
        title: 'A typical telemetry pipeline',
        caption: 'Services pass trace context to each other. They send telemetry (usually OTLP) to a collector, which batches it and routes each signal to its own store. Dashboards and SLO alerts read from all three.',
        explanation: [
          '**Service A**, instrumented with Micrometer and OpenTelemetry, calls **Service B** and passes the `traceparent` header, so B continues the same trace.',
          'Both services send their telemetry over OTLP to the **OTel Collector**. It receives, batches and exports it, so services do not talk to storage directly.',
          'The collector routes each signal to its own backend. These are the **Metrics store** (Prometheus-compatible), the **Trace store** (such as Jaeger or Tempo) and the **Log store** (such as Loki or Elasticsearch).',
          '**Dashboards + alerts** read from all three stores, for example to alert on SLO burn rate.',
          'Takeaway: the collector separates applications from backends, so you can change storage without touching service code.',
        ],
        cols: 4,
        rows: 3,
        nodes: [
          { id: 'a', label: 'Service A', detail: 'Micrometer + OTel', col: 0, row: 0, tone: 'primary' },
          { id: 'b', label: 'Service B', detail: 'continues the trace', col: 0, row: 1, tone: 'primary' },
          { id: 'col', label: 'OTel Collector', detail: 'receive, batch, export', col: 1, row: 1, tone: 'accent' },
          { id: 'm', label: 'Metrics store', detail: 'Prometheus-compatible', col: 2, row: 0, shape: 'cylinder', tone: 'neutral' },
          { id: 't', label: 'Trace store', detail: 'e.g. Jaeger, Tempo', col: 2, row: 1, shape: 'cylinder', tone: 'neutral' },
          { id: 'l', label: 'Log store', detail: 'e.g. Loki, Elasticsearch', col: 2, row: 2, shape: 'cylinder', tone: 'neutral' },
          { id: 'dash', label: 'Dashboards + alerts', detail: 'SLO burn rate', col: 3, row: 1, shape: 'pill', tone: 'success' },
        ],
        edges: [
          { from: 'a', to: 'b', label: 'traceparent header' },
          { from: 'a', to: 'col', label: 'OTLP' },
          { from: 'b', to: 'col', label: 'OTLP' },
          { from: 'col', to: 'm' },
          { from: 'col', to: 't' },
          { from: 'col', to: 'l' },
          { from: 'm', to: 'dash' },
          { from: 't', to: 'dash' },
          { from: 'l', to: 'dash' },
        ],
      },
      {
        id: 'prod-observability-probes',
        kind: 'flow',
        title: 'What the platform does with each probe',
        caption: 'Liveness and readiness only start once the startup probe passes. A failed liveness probe restarts the container. A failed readiness probe just stops traffic until the instance recovers.',
        explanation: [
          '**Container starts**: the JVM boots and warms up, which can take a while.',
          'The **Startup probe** repeats until it passes. It holds off the other probes, so a slow start is not mistaken for a crash.',
          'Once it has passed, the **Liveness probe** asks whether the process is OK. If it fails, the platform will **Restart container**, because the process is considered broken.',
          'The **Readiness probe** asks whether the instance can serve traffic now. If it fails, the platform will **Remove from endpoints**. No traffic arrives until it is ready again, and nothing is restarted.',
          'Takeaway: liveness failures restart, but readiness failures only pause traffic. So external dependencies belong in readiness, never in liveness.',
        ],
        cols: 3,
        rows: 3,
        nodes: [
          { id: 'start', label: 'Container starts', detail: 'JVM boot, warm-up', col: 0, row: 0, shape: 'pill', tone: 'neutral' },
          { id: 'startup', label: 'Startup probe', detail: 'repeats until it passes', col: 1, row: 0, tone: 'primary' },
          { id: 'live', label: 'Liveness probe', detail: 'is the process OK?', col: 1, row: 1, tone: 'primary' },
          { id: 'ready', label: 'Readiness probe', detail: 'can it serve traffic?', col: 2, row: 1, tone: 'primary' },
          { id: 'restart', label: 'Restart container', detail: 'process is broken', col: 1, row: 2, shape: 'pill', tone: 'danger' },
          { id: 'remove', label: 'Remove from endpoints', detail: 'no traffic until ready', col: 2, row: 2, shape: 'pill', tone: 'warning' },
        ],
        edges: [
          { from: 'start', to: 'startup' },
          { from: 'startup', to: 'live', label: 'passed' },
          { from: 'startup', to: 'ready', label: 'passed' },
          { from: 'live', to: 'restart', label: 'fails' },
          { from: 'ready', to: 'remove', label: 'fails' },
        ],
      },
    ],
    variants: [
      {
        title: 'The three pillars of observability',
        intro: 'OpenTelemetry also defines baggage and is developing continuous profiling as an additional signal, but these three are the core.',
        items: [
          { name: 'Metrics', summary: 'Numeric time series aggregated per interval: counters, gauges, histograms. Cheap to store and query; the basis of alerts and SLOs.', note: 'Keep tag cardinality bounded.' },
          { name: 'Logs', summary: 'Timestamped, structured event records with context (trace id, user-safe identifiers, outcome).', note: 'Most detailed and most expensive; never contain secrets or personal data.' },
          { name: 'Traces', summary: 'A tree of spans for one request across processes, with timings, parent links and attributes.', note: 'Usually sampled; propagated with the W3C `traceparent` header.' },
        ],
      },
      {
        title: 'Micrometer meter types',
        items: [
          { name: 'Counter', summary: 'Monotonically increasing count — requests, errors, retries.', code: 'registry.counter("orders.placed").increment();' },
          { name: 'Gauge', summary: 'Current value sampled on read — queue size, pool usage.', code: 'registry.gauge("queue.size", queue, Queue::size);' },
          { name: 'Timer', summary: 'Count, total time and max of short operations, optionally with a percentile histogram.', code: 'Timer.builder("checkout").publishPercentileHistogram().register(registry);' },
          { name: 'DistributionSummary', summary: 'Distribution of non-time values — payload sizes, batch sizes.' },
          { name: 'LongTaskTimer', summary: 'Tracks in-flight long operations (active count and how long they have run) — e.g. a nightly job.' },
        ],
      },
      {
        title: 'Health probe types',
        items: [
          { name: 'Liveness', summary: 'Is the process alive and not wedged? Failure → restart.', note: 'Never check external dependencies here.' },
          { name: 'Readiness', summary: 'Should traffic be routed here now? Failure → removed from the load balancer, not restarted.' },
          { name: 'Startup', summary: 'Has the application finished starting? Holds off the other probes so slow starts are not killed.' },
        ],
      },
    ],
    deepDive: [
      {
        title: 'Why you publish histograms, not percentiles',
        body: 'A percentile computed inside each instance cannot be combined: the mean of ten p99s is not the p99 of the fleet. A histogram — counts per latency bucket — can be summed across instances and time windows, then the percentile is estimated from the merged buckets (`histogram_quantile` in PromQL). The price is approximation error bounded by bucket width, which is why Micrometer\'s default buckets for timers are tuned to typical latency ranges and can be narrowed with service-level objective boundaries.',
        sources: [{ label: 'Micrometer documentation: Timers and histograms', url: 'https://docs.micrometer.io/micrometer/reference/' }],
      },
      {
        title: 'Context propagation across threads',
        body: 'MDC and OpenTelemetry\'s current context are thread-bound (ThreadLocal) by default, so work handed to an executor, `CompletableFuture` or reactive pipeline loses the trace id unless something copies it — Micrometer\'s context-propagation library, the OpenTelemetry Java agent, or wrapping executors. Virtual threads (final in Java 21) still have their own ThreadLocals, so the same rules apply. `ScopedValue` (final in Java 25, JEP 506) offers an immutable, bounded alternative for request context, and Java 25 has structured concurrency only as a preview, so production code should not rely on it yet.',
        sources: [
          { label: 'W3C Trace Context', url: 'https://www.w3.org/TR/trace-context/' },
          { label: 'JEP 506: Scoped Values', url: 'https://openjdk.org/jeps/506' },
        ],
      },
      {
        title: 'Alert on burn rate, not on blips',
        body: 'With a 99.9% SLO over 30 days, a burn rate of 1 consumes the budget exactly in 30 days. The Site Reliability Workbook recommends multi-window, multi-burn-rate alerts: for example page when the burn rate is ≥ 14.4 over the last hour (2% of the monthly budget gone in one hour) *and* still high over the last 5 minutes, and open a ticket for slower burns over 6 hours or 3 days. This catches real incidents quickly without paging on every short spike.',
        sources: [
          { label: 'Google, The Site Reliability Workbook: Alerting on SLOs', url: 'https://sre.google/workbook/alerting-on-slos/' },
          { label: 'Kubernetes: Configure Liveness, Readiness and Startup Probes', url: 'https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/' },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  'prod-resilience': {
    quick: {
      definition: '**Resilience** means your service keeps working, or fails gracefully, when something it depends on is slow or broken. A **circuit breaker** stops calling a failing service for a while.',
      points: [
        'A circuit breaker has three states: closed (normal), open (calls blocked) and half-open (testing).',
        'When too many calls fail, the breaker opens. Calls then fail fast, or use a fallback answer.',
        'A **timeout** stops you from waiting forever for a slow service.',
        'A **retry** tries again after a failure. Only retry calls that are safe to repeat, and limit the attempts.',
        'A **bulkhead** limits how many calls run at once, so one slow service cannot use up all your threads.',
        'Libraries such as Resilience4j give you these tools.',
      ],
      example: {
        title: 'A tiny circuit breaker',
        code: 'public class Main {\n  static int failures = 0;\n\n  static String callService(boolean serviceUp) {\n    if (failures >= 2) {\n      return "circuit OPEN: fallback answer";\n    }\n    if (!serviceUp) {\n      failures++;\n      return "call failed";\n    }\n    return "real answer";\n  }\n\n  public static void main(String[] args) {\n    for (int i = 1; i <= 4; i++) {\n      System.out.println("Request " + i + ": " + callService(false));\n    }\n  }\n}',
        output: 'Request 1: call failed\nRequest 2: call failed\nRequest 3: circuit OPEN: fallback answer\nRequest 4: circuit OPEN: fallback answer',
        runnable: true,
        explain: 'The service is down, so the first two calls fail and are counted. After two failures the circuit opens. Requests 3 and 4 return a fallback at once and never touch the broken service.',
      },
      tip: 'A real breaker also tries again after a wait (half-open). Use a library instead of writing your own.',
    },
    textbook: {
      definition:
        '**Resilience** is the ability of a system to keep giving acceptable service when faults happen. It does this by detecting, containing and recovering from faults, not just by preventing them. In distributed systems, it comes from **stability patterns** applied at the boundaries between components. **Timeouts** limit waiting. **Retries** with backoff hide transient faults. **Circuit breakers** stop calls to failing dependencies. **Bulkheads** isolate resources, so a fault in one part cannot use up the resources of another. **Fallbacks** give reduced but useful responses. Their aim is to stop a partial failure from becoming a **cascading failure**.',
      terms: [
        { term: 'Transient fault', meaning: 'A temporary failure, such as a dropped connection or brief overload. The operation is likely to succeed if it is repeated later.' },
        { term: 'Cascading failure', meaning: 'A failure that spreads from one component to others. For example, callers use up all their threads or connections waiting on a slow dependency.' },
        { term: 'Circuit breaker', meaning: 'A proxy that keeps state and watches call outcomes. When failures pass a threshold, it rejects calls at once for a period, then tests whether the dependency has recovered.' },
        { term: 'Bulkhead', meaning: 'An isolation boundary that limits the resources, such as threads or permits, that any one dependency or workload may use.' },
        { term: 'Exponential backoff', meaning: 'A retry policy where the delay between attempts grows geometrically up to a cap. Random jitter is usually added.' },
      ],
      source: 'Michael Nygard, Release It! (2nd edition), stability patterns; Resilience4j documentation',
    },
    interviewDefinition:
      'Resilience is designing so that partial failure stays partial. Every remote call gets a **timeout**, ideally derived from a propagated deadline. Transient failures of **idempotent** operations (repeating them has the same effect as doing them once) are **retried**. Retries use capped exponential backoff and jitter, under a retry budget. A **circuit breaker** fails fast while a dependency is unhealthy and probes it in a half-open state. **Bulkheads** and **rate limiters** limit the capacity any one dependency or client can use. **Fallbacks** degrade gracefully. Idempotency keys make it safe to retry non-idempotent operations.',
    interviewFollowUps: [
      {
        question: 'Why add jitter to exponential backoff?',
        answer: 'Without it, every client that failed at the same moment retries at the same moments (1 s, 2 s, 4 s...). This creates synchronised waves that knock the recovering service over again. Randomising the delay ("full jitter": random between 0 and the capped backoff) spreads retries out and reduces total work.',
      },
      {
        question: 'Retry and circuit breaker together: which wraps which?',
        answer: 'Usually retry goes outside and the breaker inside. Resilience4j\'s Spring Boot aspect order is Retry(CircuitBreaker(RateLimiter(TimeLimiter(Bulkhead(call))))). So the breaker records each attempt. Once it opens, retries fail fast with `CallNotPermittedException` instead of hammering the dependency.',
      },
      {
        question: 'What is a retry storm?',
        answer: 'Retries multiply load exactly when a dependency is weakest. Three layers each retrying three times turn one user request into 27 calls at the bottom. Retry at one layer and cap attempts. Use a retry budget (e.g. at most 10% extra traffic) and honour `Retry-After`.',
      },
      {
        question: 'Should a timeout be the dependency\'s average latency?',
        answer: 'No. Base it on the dependency\'s measured p99 (or p99.9) plus a margin. Never make it longer than the caller\'s remaining deadline. An average-based timeout fails a large share of normal requests.',
      },
    ],
    mnemonic: {
      device: 'Ship in a storm: "Timer, Retry, Trip, Seal, Lifeboat"',
      expansion: [
        { key: 'Timer', meaning: 'Timeout: the captain\'s watch — never wait for a reply forever.' },
        { key: 'Retry', meaning: 'Throw the rope again, but wait longer each time and at random intervals (backoff + jitter), and only if catching it twice is harmless (idempotent).' },
        { key: 'Trip', meaning: 'Circuit breaker: the engine-room breaker trips so a failing system stops drawing power, then is tested before being trusted again.' },
        { key: 'Seal', meaning: 'Bulkhead: sealed compartments — the term comes from ship hulls — so one flooded section cannot sink the whole ship.' },
        { key: 'Lifeboat', meaning: 'Fallback: a reduced but safe way to keep serving (cached data, defaults, "we will email you").' },
      ],
      visual: 'Picture a ship taking water in one compartment: the door is sealed, the breaker trips, the crew retries the radio at calm intervals, and the lifeboat is ready.',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'The breaker in your fuse box',
        body: 'When a faulty kettle shorts, the breaker trips so the wiring does not catch fire, and the rest of the house keeps its lights. You reset it later and see whether it holds. A software circuit breaker does the same: it cuts calls to a failing dependency so your threads and its remaining capacity are protected, then lets a few trial calls through.',
      },
      {
        kind: 'insight',
        title: 'Slow is worse than down',
        body: 'A dependency that refuses connections fails fast and costs you little. One that accepts connections and then takes 30 seconds holds a thread, a pooled connection and a user for 30 seconds each. Most cascading outages start with slowness, which is why timeouts come first in every resilience checklist.',
      },
      {
        kind: 'real-world',
        title: 'Recommendations off, checkout on',
        body: 'During a recommendation-service outage, a shop whose product page called it without a timeout went down entirely. After the post-mortem, the call got a 200 ms timeout, a circuit breaker and a fallback to a static "bestsellers" list. In the next outage the product pages stayed up and only the recommendation panel looked different.',
      },
      {
        kind: 'angle',
        title: 'Virtual threads move the bottleneck',
        body: 'With virtual threads, blocking is cheap, so "we ran out of threads" stops being the failure signal — but database connections, downstream rate limits and memory are still finite. A slow dependency now produces thousands of waiting virtual threads instead of a full pool. Bulkheads must become explicit semaphores or connection limits, and timeouts matter even more.',
      },
    ],
    diagrams: [
      {
        id: 'prod-resilience-breaker-states',
        kind: 'concept',
        title: 'Circuit breaker states',
        caption: 'CLOSED counts outcomes. Too many failures trip it OPEN, where calls fail fast to a fallback. After a wait it goes HALF_OPEN and lets a few trial calls through. Success closes it, and a failing trial reopens it.',
        explanation: [
          'In **CLOSED**, the normal state, calls flow to the dependency and the breaker counts their outcomes in a sliding window.',
          'When the failure rate gets too high, it trips to **OPEN**. Calls are now rejected at once and fail fast to a **Fallback**, a cached or default answer. This protects both your threads and the struggling dependency.',
          'After a wait, the two-way arrow moves it to **HALF_OPEN**, where only a few trial calls are let through to test recovery.',
          'If the trials succeed, the breaker returns to CLOSED. If a trial fails, it goes back to OPEN and waits again.',
          'Takeaway: the breaker stops hammering a failing service and lets it recover before trusting it again.',
        ],
        cols: 3,
        rows: 2,
        nodes: [
          { id: 'closed', label: 'CLOSED', detail: 'calls flow, outcomes counted', col: 0, row: 0, tone: 'success' },
          { id: 'open', label: 'OPEN', detail: 'calls rejected at once', col: 2, row: 0, tone: 'danger' },
          { id: 'half', label: 'HALF_OPEN', detail: 'a few trial calls', col: 1, row: 1, tone: 'warning' },
          { id: 'fb', label: 'Fallback', detail: 'cached or default answer', col: 2, row: 1, shape: 'pill', tone: 'neutral' },
        ],
        edges: [
          { from: 'closed', to: 'open', label: 'failure rate too high' },
          { from: 'open', to: 'half', label: 'wait / trial fails', both: true },
          { from: 'half', to: 'closed', label: 'trials succeed' },
          { from: 'open', to: 'fb', label: 'fail fast' },
        ],
      },
      {
        id: 'prod-resilience-decorators',
        kind: 'flow',
        title: 'Layering the patterns around one call',
        caption: 'This is Resilience4j\'s default Spring Boot aspect order. Retry is outermost. So the circuit breaker, rate limiter, time limiter and bulkhead see every attempt before it reaches the remote service.',
        explanation: [
          'The **Caller**, ideally with a deadline, calls through **Retry**, the outermost layer. It repeats failed attempts with backoff and jitter.',
          'Each attempt passes the **CircuitBreaker**, which fails fast when open, then the **RateLimiter**, which caps calls per period.',
          'The **TimeLimiter** puts a timeout on each attempt, and the **Bulkhead** caps how many calls run concurrently.',
          'Only then does the attempt reach the **Remote service** over HTTP or gRPC.',
          'If retries run out, the dashed arrow leads to the **Fallback**. Takeaway: retry wraps the breaker, so every attempt is counted. An open breaker makes retries fail fast instead of piling on.',
        ],
        cols: 4,
        rows: 2,
        nodes: [
          { id: 'caller', label: 'Caller', detail: 'with a deadline', col: 0, row: 0, shape: 'pill', tone: 'neutral' },
          { id: 'retry', label: 'Retry', detail: 'backoff + jitter', col: 1, row: 0, tone: 'primary' },
          { id: 'cb', label: 'CircuitBreaker', detail: 'fail fast when open', col: 2, row: 0, tone: 'primary' },
          { id: 'rl', label: 'RateLimiter', detail: 'calls per period', col: 3, row: 0, tone: 'primary' },
          { id: 'tl', label: 'TimeLimiter', detail: 'timeout per attempt', col: 3, row: 1, tone: 'primary' },
          { id: 'bh', label: 'Bulkhead', detail: 'max concurrent calls', col: 2, row: 1, tone: 'primary' },
          { id: 'remote', label: 'Remote service', detail: 'HTTP or gRPC', col: 1, row: 1, shape: 'cylinder', tone: 'accent' },
          { id: 'fb', label: 'Fallback', detail: 'if all else fails', col: 0, row: 1, shape: 'pill', tone: 'warning' },
        ],
        edges: [
          { from: 'caller', to: 'retry' },
          { from: 'retry', to: 'cb' },
          { from: 'cb', to: 'rl' },
          { from: 'rl', to: 'tl' },
          { from: 'tl', to: 'bh' },
          { from: 'bh', to: 'remote' },
          { from: 'retry', to: 'fb', label: 'exhausted', dashed: true },
        ],
      },
      {
        id: 'prod-resilience-bulkheads',
        kind: 'architecture',
        title: 'Bulkheads contain a slow dependency',
        caption: 'Each dependency gets its own limited share of concurrency and a timeout. When Service B slows down, only B\'s bulkhead fills. Calls to C keep their capacity.',
        explanation: [
          '**Clients** send requests to the **Request handler** inside **Your service**, which needs to call both B and C.',
          'Calls to B go through **Bulkhead B**, which allows at most 10 at a time with a 2-second timeout. **Service B** has become slow and takes 30 seconds to reply, so this bulkhead is full.',
          'When it is full, the dashed arrow shows new calls being **Rejected fast**, with a fallback for B only. They do not wait or hold threads.',
          'Calls to **Service C**, which is healthy, go through **Bulkhead C**, which still has free capacity.',
          'Takeaway: like sealed compartments in a ship, separate limits per dependency stop one slow service from sinking everything.',
        ],
        cols: 4,
        rows: 2,
        nodes: [
          { id: 'clients', label: 'Clients', detail: 'incoming requests', col: 0, row: 0, shape: 'pill', tone: 'neutral' },
          { id: 'handler', label: 'Request handler', detail: 'calls B and C', col: 1, row: 0, tone: 'primary' },
          { id: 'bhb', label: 'Bulkhead B', detail: 'max 10, full', col: 2, row: 0, tone: 'warning' },
          { id: 'svcb', label: 'Service B', detail: 'slow: 30 s replies', col: 3, row: 0, tone: 'danger' },
          { id: 'bhc', label: 'Bulkhead C', detail: 'max 10, free', col: 2, row: 1, tone: 'success' },
          { id: 'svcc', label: 'Service C', detail: 'healthy', col: 3, row: 1, tone: 'success' },
          { id: 'reject', label: 'Rejected fast', detail: 'fallback for B only', col: 1, row: 1, shape: 'pill', tone: 'warning' },
        ],
        edges: [
          { from: 'clients', to: 'handler' },
          { from: 'handler', to: 'bhb' },
          { from: 'bhb', to: 'svcb', label: 'timeout 2 s' },
          { from: 'handler', to: 'bhc' },
          { from: 'bhc', to: 'svcc' },
          { from: 'bhb', to: 'reject', label: 'when full', dashed: true },
        ],
        groups: [{ label: 'Your service', fromCol: 1, toCol: 2, fromRow: 0, toRow: 1, tone: 'primary' }],
      },
    ],
    variants: [
      {
        title: 'Resilience patterns',
        items: [
          { name: 'Timeout / deadline', summary: 'Bound how long any remote call may take; propagate the remaining budget downstream.', support: 'supported', note: 'Built into the JDK HttpClient and CompletableFuture.orTimeout (Java 9+).', code: 'HttpRequest.newBuilder(uri).timeout(Duration.ofMillis(800))' },
          { name: 'Retry with backoff', summary: 'Repeat transient failures of idempotent operations with growing, jittered delays and a cap.', support: 'partial', note: 'No JDK API; use Resilience4j, Spring Retry or a small loop.' },
          { name: 'Circuit breaker', summary: 'Stop calling a failing dependency for a while; probe before resuming.', support: 'partial', note: 'Library pattern (Resilience4j CircuitBreaker).' },
          { name: 'Bulkhead', summary: 'Cap concurrent calls per dependency so one cannot exhaust shared capacity.', support: 'supported', note: 'A `java.util.concurrent.Semaphore` or a bounded pool is enough.', code: 'Semaphore permits = new Semaphore(10);' },
          { name: 'Rate limiter', summary: 'Limit calls per time window, often a token bucket; answer 429 with Retry-After.', support: 'partial', note: 'Library pattern (Resilience4j RateLimiter, gateways).' },
          { name: 'Fallback / graceful degradation', summary: 'Return cached, default or reduced results when a non-critical dependency fails.', support: 'supported' },
          { name: 'Load shedding', summary: 'Reject excess work early (bounded queues) instead of letting latency grow without limit.', support: 'supported', code: 'new ThreadPoolExecutor(..., new ArrayBlockingQueue<>(100), new AbortPolicy())' },
          { name: 'Idempotency key', summary: 'Store the result per client-supplied key so a retried create or payment runs once.', support: 'supported' },
        ],
      },
      {
        title: 'Backoff strategies',
        items: [
          { name: 'Fixed delay', summary: 'Wait the same time between attempts. Simple, but synchronised clients retry in waves.' },
          { name: 'Exponential', summary: 'Delay = base × 2^attempt, capped. Backs off quickly, but still synchronised without jitter.' },
          { name: 'Exponential with full jitter', summary: 'Delay = random(0, min(cap, base × 2^attempt)). Spreads retries out; a good default.' },
          { name: 'Decorrelated jitter', summary: 'Each delay is random between the base and three times the previous delay, capped — similar spread, with growth based on the last wait.' },
        ],
      },
    ],
    deepDive: [
      {
        title: 'Why full jitter wins',
        body: 'AWS\'s analysis of competing clients showed that pure exponential backoff still produces clusters of simultaneous retries, while "full jitter" (a uniformly random delay up to the exponential cap) both finishes sooner and does far less total work, because clients rarely collide. The same logic applies to scheduled jobs and reconnect loops: any time many clients react to one event, add randomness.',
        sources: [{ label: 'AWS Architecture Blog: Exponential Backoff and Jitter', url: 'https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/' }],
      },
      {
        title: 'Metastable failures: when the system cannot recover by itself',
        body: 'Some outages persist after the trigger is gone. A brief slowdown causes timeouts, clients retry, the extra load keeps latency high, which causes more timeouts — a self-sustaining loop. Researchers call these **metastable failures**. Breaking the loop needs mechanisms that reduce load when things go wrong: retry budgets, circuit breakers, load shedding and admission control — not more capacity alone.',
        sources: [{ label: 'Bronson et al., "Metastable Failures in Distributed Systems", HotOS 2021' }],
      },
      {
        title: 'What the breaker actually counts',
        body: 'Resilience4j\'s breaker evaluates a sliding window (count-based or time-based) and opens when the failure rate *or* the slow-call rate exceeds a threshold, but only after a minimum number of calls — so a single failure at 3 a.m. does not trip it. Decide which exceptions count as failures: a 404 or a validation error says nothing about the dependency\'s health and should usually be ignored, while timeouts and 5xx responses should count.',
        sources: [
          { label: 'Resilience4j documentation: CircuitBreaker', url: 'https://resilience4j.readme.io/docs/circuitbreaker' },
          { label: 'Martin Fowler: CircuitBreaker', url: 'https://martinfowler.com/bliki/CircuitBreaker.html' },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  'prod-microservices': {
    quick: {
      definition: '**Microservices** split one big application into small services. Each service does one job, owns its own data and talks to the others over the network.',
      points: [
        'Each service can be built, deployed and scaled on its own.',
        'A service should not read another service\'s database. It asks that service through an API or a message.',
        'A network call can fail or be slow, so every call needs a plan for failure.',
        'There is usually no single database transaction across services. A **saga** uses a chain of steps, each with an undo step.',
        'Start with a simple design. Many apps do not need microservices.',
      ],
      example: {
        title: 'Undo a step when another one fails',
        code: 'public class Main {\n  static boolean stockReserved = false;\n\n  static void reserveStock() {\n    stockReserved = true;\n    System.out.println("Stock service: reserved");\n  }\n\n  static void releaseStock() {\n    stockReserved = false;\n    System.out.println("Stock service: released (undo)");\n  }\n\n  static boolean chargeCard() {\n    System.out.println("Payment service: card declined");\n    return false;\n  }\n\n  public static void main(String[] args) {\n    reserveStock();\n    if (!chargeCard()) {\n      releaseStock();\n    }\n    System.out.println("Stock still reserved? " + stockReserved);\n  }\n}',
        output: 'Stock service: reserved\nPayment service: card declined\nStock service: released (undo)\nStock still reserved? false',
        runnable: true,
        explain: 'An order needs two services: stock and payment. Stock is reserved first. The payment fails, so the code runs the undo step. This undo step is how a saga repairs the data without one big transaction.',
      },
      tip: 'Plan an undo step for each step that changes data, before you build the saga.',
    },
    textbook: {
      definition:
        'The **microservice architecture** is an architectural style. It structures an application as a set of small, **independently deployable services**. Each service runs in its own process and is built around a **business capability**. Services communicate through lightweight mechanisms, such as HTTP APIs or asynchronous messaging. Each service owns its data (**database per service**) and is run by a single team. Because state is distributed, services stay consistent through **eventual consistency** mechanisms such as **sagas**, not distributed ACID transactions. It contrasts with the **monolithic architecture**, where the application is built and deployed as a single unit.',
      terms: [
        { term: 'Business capability', meaning: 'Something a business does to create value, such as order management or billing. It is used as the unit for service boundaries.' },
        { term: 'Bounded context', meaning: 'A domain-driven design term. It is the boundary inside which a particular domain model and its language apply consistently.' },
        { term: 'Saga', meaning: 'A sequence of local transactions across services. Each step has a compensating transaction that undoes it if a later step fails.' },
        { term: 'Eventual consistency', meaning: 'A consistency model in which, if no new updates happen, all replicas or services eventually reach the same state.' },
        { term: 'Transactional outbox', meaning: 'A pattern that stores outgoing messages in the same local transaction as the business change. It publishes them afterwards.' },
      ],
      source: 'James Lewis and Martin Fowler, Microservices (2014); Chris Richardson, Microservices Patterns (2018)',
    },
    interviewDefinition:
      'Microservices is an architectural style that builds a system from **independently deployable services**. Each one owns one business capability and its own data. Services communicate over the network through APIs or events. The benefits are mainly organisational: team autonomy, independent release and scaling, and fault isolation. The costs are distributed-system costs. They include partial failure, eventual consistency, sagas instead of ACID transactions, and heavy investment in automation and observability. A **modular monolith** gives most of the design benefit without the network.',
    interviewFollowUps: [
      {
        question: 'How do you decide service boundaries?',
        answer: 'Follow business capabilities and DDD bounded contexts. Draw boundaries where the language and data change meaning. Also align them with team ownership (Conway\'s law). A good boundary lets most changes stay inside one service. If every feature touches three services, the boundary is wrong.',
      },
      {
        question: 'Why not just use a distributed transaction (two-phase commit)?',
        answer: '2PC is a blocking protocol. Participants hold locks while waiting for the coordinator, and a coordinator failure can leave them stuck. It ties the availability of every service to all the others. Most message brokers and cloud databases do not take part in it. Sagas give up atomicity to gain availability, and use explicit compensation.',
      },
      {
        question: 'What is the dual-write problem?',
        answer: 'Updating your database and publishing a message involve two separate systems. A crash between them leaves them inconsistent. The transactional outbox writes the event in the same database transaction and publishes it afterwards. This gives at-least-once delivery.',
      },
    ],
    mnemonic: {
      device: 'Split only for the four T\'s: Teams, Tempo, Traffic, Tolerance',
      expansion: [
        { key: 'Teams', meaning: 'Several teams are blocking each other in one codebase and need clear ownership.' },
        { key: 'Tempo', meaning: 'A part of the system must release at a very different cadence from the rest.' },
        { key: 'Traffic', meaning: 'A component has very different scaling or resource needs (e.g. image processing vs admin screens).' },
        { key: 'Tolerance', meaning: 'Fault isolation: a failure in one part must not take down the others.' },
      ],
      visual: 'Picture four T-shaped keys: unless you are holding at least one, the door to microservices should stay locked and the modular monolith is the better room.',
    },
    breakdown: [
      {
        kind: 'analogy',
        title: 'One kitchen or a food court',
        body: 'A restaurant kitchen (monolith) shares one fridge and one head chef — easy to coordinate a whole meal. A food court (microservices) has independent stalls, each with its own fridge (data) and opening hours (deployments). Stalls can change menus freely, but a meal that needs three stalls requires orders, receipts and a plan for when one stall runs out — that coordination is the saga.',
      },
      {
        kind: 'insight',
        title: 'Conway\'s law works in both directions',
        body: 'Systems mirror the communication structure of the organisations that build them. Twelve services owned by one team become a distributed monolith; one codebase shared by eight teams becomes a merge-conflict battlefield. Teams increasingly design the org chart and the architecture together — the "inverse Conway manoeuvre".',
      },
      {
        kind: 'real-world',
        title: 'Moving back to a monolith',
        body: 'In 2023 the Amazon Prime Video team described moving an audio/video quality-monitoring tool from distributed serverless components to a single process, reporting an infrastructure cost reduction of over 90%, mostly from no longer passing data between components. Architecture is a set of trade-offs to revisit, not a one-way ladder.',
      },
      {
        kind: 'angle',
        title: 'Spot a distributed monolith by its deploys',
        body: 'If services must be released together, share database tables, or a single user request synchronously chains through five services, you have the network costs of microservices and the coupling of a monolith. Measure it: how often does one change require coordinated deployments of several services?',
      },
    ],
    diagrams: [
      {
        id: 'prod-microservices-spectrum',
        kind: 'concept',
        title: 'The architecture spectrum',
        caption: 'Moving right buys independent deployment and scaling. You pay with network calls, eventual consistency and operational overhead. Most teams should start in the in-process half.',
        explanation: [
          'Read the top row from left to right. A **Monolith** is one deployable with one database. Adding boundaries turns it into a **Modular monolith** with enforced modules.',
          'Both sit in the **One process** group, whose shared trait is **In-process calls, ACID transactions**: simple to test, debug and deploy.',
          'Extracting modules when there is a real need gives **Microservices**, one service per business capability. Going finer and event-driven leads to **Serverless** functions on managed infrastructure.',
          'Both sit in the **Distributed** group, which pays with **Network calls, data per service**: sagas, outboxes, tracing and many pipelines.',
          'Takeaway: each step right buys independent deployment and scaling at the cost of complexity, so most teams should start on the left.',
        ],
        cols: 4,
        rows: 2,
        nodes: [
          { id: 'mono', label: 'Monolith', detail: 'one deployable, one DB', col: 0, row: 0, tone: 'neutral' },
          { id: 'modmono', label: 'Modular monolith', detail: 'enforced modules', col: 1, row: 0, tone: 'success' },
          { id: 'micro', label: 'Microservices', detail: 'service per capability', col: 2, row: 0, tone: 'primary' },
          { id: 'faas', label: 'Serverless', detail: 'functions, managed infra', col: 3, row: 0, tone: 'accent' },
          { id: 'inproc', label: 'In-process calls, ACID transactions', detail: 'simple to test, debug and deploy', col: 0, row: 1, span: 2, tone: 'success' },
          { id: 'dist', label: 'Network calls, data per service', detail: 'sagas, outbox, tracing, many pipelines', col: 2, row: 1, span: 2, tone: 'warning' },
        ],
        edges: [
          { from: 'mono', to: 'modmono', label: 'add boundaries' },
          { from: 'modmono', to: 'micro', label: 'extract on need' },
          { from: 'micro', to: 'faas', label: 'finer, event-driven' },
        ],
        groups: [
          { label: 'One process', fromCol: 0, toCol: 1, fromRow: 0, toRow: 1, tone: 'success' },
          { label: 'Distributed', fromCol: 2, toCol: 3, fromRow: 0, toRow: 1, tone: 'warning' },
        ],
      },
      {
        id: 'prod-microservices-outbox',
        kind: 'architecture',
        title: 'Transactional outbox with an idempotent consumer',
        caption: 'The order row and its event are written in one local transaction, so they cannot disagree. A relay publishes events at least once. The consumer removes duplicates by event id in its own transaction.',
        explanation: [
          'The **Order service** runs `placeOrder()`. It inserts the business row into **orders** and the event row into **outbox**. Both inserts are in **One local transaction**, so they cannot disagree.',
          'A separate **Relay** reads new outbox rows, by polling or change data capture. It publishes them to the **Broker**, such as Kafka or RabbitMQ.',
          'Because the relay may resend after a crash, the broker delivers to the **Billing consumer** at least once, so duplicates are possible.',
          'The consumer records each event id in **processed_events**, in the same transaction as its billing change. It skips ids it has already seen.',
          'Takeaway: the outbox removes the dual-write problem. The idempotent consumer turns at-least-once delivery into an exactly-once effect.',
        ],
        cols: 4,
        rows: 3,
        nodes: [
          { id: 'svc', label: 'Order service', detail: 'placeOrder()', col: 0, row: 0, tone: 'primary' },
          { id: 'orders', label: 'orders', detail: 'business rows', col: 0, row: 1, shape: 'cylinder', tone: 'accent' },
          { id: 'outbox', label: 'outbox', detail: 'event rows', col: 1, row: 1, shape: 'cylinder', tone: 'accent' },
          { id: 'relay', label: 'Relay', detail: 'polling or CDC', col: 2, row: 1, tone: 'primary' },
          { id: 'broker', label: 'Broker', detail: 'e.g. Kafka, RabbitMQ', col: 3, row: 1, shape: 'cylinder', tone: 'neutral' },
          { id: 'cons', label: 'Billing consumer', detail: 'skip seen event ids', col: 3, row: 2, tone: 'primary' },
          { id: 'seen', label: 'processed_events', detail: 'same tx as billing', col: 2, row: 2, shape: 'cylinder', tone: 'accent' },
        ],
        edges: [
          { from: 'svc', to: 'orders', label: 'INSERT' },
          { from: 'svc', to: 'outbox', label: 'INSERT event' },
          { from: 'outbox', to: 'relay', label: 'read' },
          { from: 'relay', to: 'broker', label: 'publish' },
          { from: 'broker', to: 'cons', label: 'at least once' },
          { from: 'cons', to: 'seen', label: 'record id' },
        ],
        groups: [{ label: 'One local transaction', fromCol: 0, toCol: 1, fromRow: 1, toRow: 1, tone: 'success' }],
      },
      {
        id: 'prod-microservices-saga',
        kind: 'flow',
        title: 'An orchestrated saga with compensation',
        caption: 'Each step is a local transaction in its own service. When payment is declined, the orchestrator runs compensations in reverse order. It does not roll back a global transaction.',
        explanation: [
          'The saga starts with **Order PENDING** in the order service. Then it asks the inventory service to **Reserve stock**. Each step is a local transaction in its own service.',
          'Next the payment service is asked to **Charge payment**, and the orchestrator checks **Approved?**.',
          'If yes, the order becomes **Order CONFIRMED** and the saga is complete.',
          'If the payment is declined, the orchestrator runs compensations in reverse order. **Release stock** undoes the reservation, then the order becomes **Order CANCELLED**.',
          'Takeaway: with no global rollback across services, each completed step needs an explicit compensating action.',
        ],
        cols: 3,
        rows: 3,
        nodes: [
          { id: 'pending', label: 'Order PENDING', detail: 'order service', col: 0, row: 0, tone: 'neutral' },
          { id: 'reserve', label: 'Reserve stock', detail: 'inventory service', col: 1, row: 0, tone: 'primary' },
          { id: 'charge', label: 'Charge payment', detail: 'payment service', col: 2, row: 0, tone: 'primary' },
          { id: 'ok', label: 'Approved?', detail: 'payment result', col: 2, row: 1, tone: 'warning' },
          { id: 'confirm', label: 'Order CONFIRMED', detail: 'saga complete', col: 2, row: 2, shape: 'pill', tone: 'success' },
          { id: 'release', label: 'Release stock', detail: 'compensation', col: 1, row: 1, tone: 'danger' },
          { id: 'cancel', label: 'Order CANCELLED', detail: 'compensation', col: 0, row: 1, shape: 'pill', tone: 'danger' },
        ],
        edges: [
          { from: 'pending', to: 'reserve' },
          { from: 'reserve', to: 'charge' },
          { from: 'charge', to: 'ok' },
          { from: 'ok', to: 'confirm', label: 'yes' },
          { from: 'ok', to: 'release', label: 'declined' },
          { from: 'release', to: 'cancel' },
        ],
      },
    ],
    variants: [
      {
        title: 'Architecture styles',
        items: [
          { name: 'Monolith', summary: 'One codebase, one deployable, usually one database. Simplest to build, test, run and debug; ACID transactions everywhere.', note: 'Risk: a "big ball of mud" without internal boundaries.' },
          { name: 'Modular monolith', summary: 'One deployable split into business modules with enforced boundaries and module-owned data; modules talk through interfaces or in-process events.', note: 'Enforce with ArchUnit tests, JPMS modules or Spring Modulith; the usual best starting point.' },
          { name: 'Microservices', summary: 'Independently deployable services per business capability, each owning its data, communicating over HTTP/gRPC or messaging.', note: 'Pays off with several teams and mature CI/CD, observability and on-call ownership.' },
          { name: 'Serverless (FaaS)', summary: 'Functions triggered by events, with the provider running and scaling the infrastructure, often to zero.', note: 'Great for spiky, event-driven work; watch cold starts (CRaC or GraalVM native images help on the JVM), execution limits and vendor lock-in.' },
        ],
      },
      {
        title: 'Saga coordination styles',
        items: [
          { name: 'Orchestration', summary: 'A coordinator tells each service what to do next and triggers compensations.', note: 'Flow is explicit and easy to monitor; the orchestrator must not become a god service.' },
          { name: 'Choreography', summary: 'Each service reacts to events from the others; no central coordinator.', note: 'Loosest coupling; the end-to-end flow is harder to see and to change.' },
        ],
      },
      {
        title: 'Communication styles',
        items: [
          { name: 'Synchronous request/response', summary: 'REST or gRPC calls; the caller waits for the answer.', note: 'Simple, but availability multiplies along the chain: five 99.9% services in series give about 99.5%.' },
          { name: 'Asynchronous messaging', summary: 'Commands or events through a broker; the sender does not wait.', note: 'Decouples availability and absorbs bursts; requires idempotent consumers and handling eventual consistency.' },
        ],
      },
      {
        title: 'Data management patterns',
        intro: 'Pattern names as catalogued by Chris Richardson (microservices.io). Owning data per service is what makes independent deployment possible, and these patterns deal with the consequences.',
        items: [
          { name: 'Database per service', summary: 'Each service has private tables or its own database that others reach only through its API or events.', note: 'The default; prevents hidden coupling through shared tables.' },
          { name: 'Shared database', summary: 'Several services read and write the same schema.', note: 'An anti-pattern for microservices: schema changes need coordinated releases.' },
          { name: 'API composition', summary: 'A composer calls several services and joins their results in memory to answer a query.', note: 'Simple, but latency and availability depend on every service called.' },
          { name: 'CQRS', summary: 'Command Query Responsibility Segregation: a separate read model, kept up to date from events, serves queries that span services.', note: 'Fast queries at the cost of eventual consistency.' },
          { name: 'Event sourcing', summary: 'State is stored as an append-only sequence of events, and current state is rebuilt by replaying them.', note: 'Gives a full audit trail and natural event publishing; harder to query and evolve.' },
        ],
      },
    ],
    deepDive: [
      {
        title: '"Exactly once" is at-least-once plus idempotency',
        body: 'Networks lose acknowledgements, so a reliable sender must resend, and a receiver will sometimes see duplicates. End-to-end exactly-once *delivery* is not achievable across independent systems; what you build is exactly-once *effect*: at-least-once delivery (outbox, broker retries) plus consumers that record processed message ids in the same transaction as their state change. Kafka\'s transactional "exactly-once semantics" applies to read-process-write flows inside Kafka, not to side effects in your database or a payment provider.',
        sources: [
          { label: 'microservices.io: Transactional outbox pattern', url: 'https://microservices.io/patterns/data/transactional-outbox.html' },
          { label: 'Martin Kleppmann, Designing Data-Intensive Applications (book)' },
        ],
      },
      {
        title: 'Monolith first, extract on evidence',
        body: 'Boundaries drawn before the domain is understood are usually wrong, and moving a boundary between services (data migration, API changes, two deployments) costs far more than moving it between modules. That is the argument behind "monolith first": build a well-modularised monolith, observe where change and load actually concentrate, then extract services along proven seams — using patterns such as the strangler fig to migrate traffic gradually.',
        sources: [
          { label: 'Martin Fowler: MonolithFirst', url: 'https://martinfowler.com/bliki/MonolithFirst.html' },
          { label: 'James Lewis and Martin Fowler: Microservices', url: 'https://martinfowler.com/articles/microservices.html' },
        ],
      },
      {
        title: 'Evolving APIs without lockstep releases',
        body: 'Independent deployment only exists if a provider can change without breaking consumers that have not upgraded. The rules are Postel-like: providers only add optional fields and never change meaning in place; consumers ignore unknown fields (tolerant reader). Consumer-driven contract tests (Pact, Spring Cloud Contract) run each consumer\'s expectations in the provider\'s build, catching a breaking change before it ships. For events, a schema registry with backward-compatibility checks plays the same role.',
        sources: [{ label: 'Sam Newman, Building Microservices, 2nd edition (book)' }],
      },
    ],
  },
};
