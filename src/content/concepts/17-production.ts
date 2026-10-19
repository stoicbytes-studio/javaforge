import type { LessonConcepts } from '@/types/curriculum';

/** Concept pages for module 17 (Production), keyed by lesson id. */
export const productionConcepts: Record<string, LessonConcepts> = {
  // -------------------------------------------------------------------------
  'prod-observability': {
    interviewDefinition:
      '**Observability** is the ability to explain a system\'s internal state from its outputs — well enough to answer questions you did not anticipate. It rests on three correlated signals: **metrics** (cheap aggregated numbers for dashboards and alerts, chosen with RED and USE), **logs** (structured events with context) and **traces** (span trees that follow one request across services), joined by a shared trace id. Health probes tell the platform how to treat an instance, and **SLOs** with error budgets turn the signals into reliability targets and symptom-based alerts.',
    interviewFollowUps: [
      {
        question: 'What is the difference between monitoring and observability?',
        answer: 'Monitoring checks known failure modes with predefined dashboards and alerts ("is CPU above 90%?"). Observability is the property that lets you investigate unknown ones — slicing high-context telemetry by any dimension to find out *why* a subset of requests is slow. Monitoring is something you do; observability is something the system has.',
      },
      {
        question: 'Liveness vs readiness?',
        answer: 'Liveness asks "is this process broken beyond recovery?" — failure restarts the container, so it must not depend on databases or other services. Readiness asks "should this instance receive traffic now?" — failure only removes it from load balancing until it recovers (warm-up, overload, draining).',
      },
      {
        question: 'Head-based vs tail-based trace sampling?',
        answer: 'Head-based sampling decides at the start of a trace (e.g. keep 10%) — cheap, but it drops most rare errors. Tail-based sampling buffers spans and decides after the trace completes, so it can keep every slow or failed trace; it needs a collector tier with memory for buffering.',
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
        caption: 'The signals are only powerful together: the trace id links a metric spike to a trace, and the trace to the log lines written while it ran.',
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
        caption: 'Services propagate trace context to each other and send telemetry (usually OTLP) to a collector, which batches and routes each signal to its own store; dashboards and SLO alerts read from all three.',
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
        caption: 'Liveness and readiness only start once the startup probe passes. A failed liveness probe restarts the container; a failed readiness probe just stops traffic until the instance recovers.',
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
    interviewDefinition:
      'Resilience is designing so that partial failure stays partial. Every remote call gets a **timeout** (ideally derived from a propagated deadline); transient failures of **idempotent** operations are **retried** with capped exponential backoff and jitter under a retry budget; a **circuit breaker** fails fast while a dependency is unhealthy and probes it in a half-open state; **bulkheads** and **rate limiters** bound the capacity any one dependency or client can consume; and **fallbacks** degrade gracefully. Idempotency keys make retrying non-idempotent operations safe.',
    interviewFollowUps: [
      {
        question: 'Why add jitter to exponential backoff?',
        answer: 'Without it, every client that failed at the same moment retries at the same moments (1 s, 2 s, 4 s...), producing synchronised waves that knock the recovering service over again. Randomising the delay ("full jitter": random between 0 and the capped backoff) spreads retries out and reduces total work.',
      },
      {
        question: 'Retry and circuit breaker together: which wraps which?',
        answer: 'Usually retry outside, breaker inside — Resilience4j\'s Spring Boot aspect order is Retry(CircuitBreaker(RateLimiter(TimeLimiter(Bulkhead(call))))). Each attempt is then recorded by the breaker, and once it opens, retries fail fast with `CallNotPermittedException` instead of hammering the dependency.',
      },
      {
        question: 'What is a retry storm?',
        answer: 'Retries multiply load exactly when a dependency is weakest: three layers each retrying three times turn one user request into 27 calls at the bottom. Retry at one layer, cap attempts, use a retry budget (e.g. at most 10% extra traffic) and honour `Retry-After`.',
      },
      {
        question: 'Should a timeout be the dependency\'s average latency?',
        answer: 'No — base it on the dependency\'s measured p99 (or p99.9) plus margin, and never longer than the caller\'s remaining deadline. An average-based timeout fails a large share of normal requests.',
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
        caption: 'CLOSED counts outcomes; too many failures trip it OPEN, where calls fail fast to a fallback. After a wait it goes HALF_OPEN and lets a few trial calls through: success closes it, a failing trial reopens it.',
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
        caption: 'Resilience4j\'s default Spring Boot aspect order: retry is outermost, so every attempt is seen by the circuit breaker, rate limiter, time limiter and bulkhead before reaching the remote service.',
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
        caption: 'Each dependency gets its own bounded share of concurrency and a timeout. When Service B slows down, only B\'s bulkhead fills; calls to C keep their capacity.',
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
    interviewDefinition:
      'Microservices is an architectural style in which a system is built from **independently deployable services**, each owning one business capability and its own data, communicating over the network through APIs or events. Its benefits — team autonomy, independent release and scaling, fault isolation — are mainly organisational. Its costs are distributed-system costs: partial failure, eventual consistency, sagas instead of ACID transactions, and heavy investment in automation and observability. A **modular monolith** gives most of the design benefit without the network.',
    interviewFollowUps: [
      {
        question: 'How do you decide service boundaries?',
        answer: 'Along business capabilities and DDD bounded contexts — places where the language and data change meaning — and aligned with team ownership (Conway\'s law). A good boundary lets most changes stay inside one service; if every feature touches three services, the boundary is wrong.',
      },
      {
        question: 'Why not just use a distributed transaction (two-phase commit)?',
        answer: '2PC is a blocking protocol: participants hold locks while waiting for the coordinator, and a coordinator failure can leave them stuck. It couples the availability of every service to all others, and most message brokers and cloud databases do not participate in it. Sagas trade atomicity for availability and explicit compensation.',
      },
      {
        question: 'What is the dual-write problem?',
        answer: 'Updating your database and publishing a message are two separate systems; a crash between them leaves them inconsistent. The transactional outbox writes the event into the same database transaction and publishes it afterwards, giving at-least-once delivery.',
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
        caption: 'Moving right buys independent deployment and scaling, and pays with network calls, eventual consistency and operational overhead. Most teams should start in the in-process half.',
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
        caption: 'The order row and its event are written in one local transaction, so they cannot disagree. A relay publishes events at least once, and the consumer de-duplicates by event id in its own transaction.',
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
        caption: 'Each step is a local transaction in its own service. When payment is declined, the orchestrator runs compensations in reverse order instead of rolling back a global transaction.',
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
