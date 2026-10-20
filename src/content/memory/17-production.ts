import type { MemoryAid } from '@/types/curriculum';

/** "Make it stick" memory aids for the production module, keyed by lesson id. */
export const productionMemory: Record<string, MemoryAid> = {
  'prod-observability': {
    oneLiner: 'Metrics, logs and traces, joined by one trace id, let you explain what your running system is doing.',
    story:
      'Think of a patient in a hospital. A heart-rate monitor shows numbers over time, so nurses spot trouble at a glance: those are metrics. Nurses also write notes about what happened and when: those are logs. A map shows every department the patient visited and how long each visit took: that is a trace. All three carry the same wristband number, so you can jump from a scary number to the right notes and the right visit. In your app, the wristband number is the trace id. Health checks are the nurse asking "are you alive?" and "are you ready for visitors?".',
    keyPoints: [
      'Metrics are cheap numbers for dashboards and alerts; logs are detailed events; traces follow one request.',
      'A shared trace id links all three, even across many services.',
      'An SLO is a reliability target; alert on users being hurt, not on every blip.',
    ],
    types: [
      {
        title: 'The three pillars of observability',
        items: [
          { name: 'Metrics', simple: 'The car dashboard: speed and warning lights that tell you THAT something is wrong.' },
          { name: 'Traces', simple: 'The GPS history of one journey, showing WHERE each minute of the trip was spent.' },
          { name: 'Logs', simple: 'The mechanic\'s notes explaining WHY one part failed at one moment.' },
        ],
      },
      {
        title: 'Health probe types',
        items: [
          { name: 'Liveness', simple: 'Is the patient breathing? If not, restart them. Never ask about other people here.' },
          { name: 'Readiness', simple: 'The "open" sign on a shop door: flip it off to stop customers without closing the shop.' },
          { name: 'Startup', simple: 'Wait until the oven is hot before checking whether the bakery works.' },
        ],
      },
      {
        title: 'Micrometer meter types',
        items: [
          { name: 'Counter', simple: 'A clicker at a stadium gate that only ever counts up.' },
          { name: 'Gauge', simple: 'A fuel gauge showing the current level, which can go up or down.' },
          { name: 'Timer', simple: 'A stopwatch that records how long each operation took and how many there were.' },
        ],
      },
    ],
    confusion: {
      mixedUpWith: 'liveness and readiness probes',
      difference: 'A failing liveness probe makes the platform restart the instance. A failing readiness probe only stops new traffic until it is ready again.',
    },
    tryIt: 'Add Spring Boot Actuator, start the app and open `/actuator/health`. Then open `/actuator/metrics/jvm.memory.used` and read the current value.',
    recall: [
      { question: 'What are the three signals of observability?', answer: 'Metrics, logs and traces.' },
      { question: 'What joins a log line to the trace of the same request?', answer: 'The shared trace id carried in both.' },
      { question: 'What happens when a readiness probe fails?', answer: 'The platform stops sending new traffic to that instance, but does not restart it.' },
    ],
    picture: {
      title: 'One wristband, three records',
      caption: 'The monitor (metrics), the notes (logs) and the route map (traces) all carry the same wristband number: the trace id.',
      items: [
        { icon: 'heart', label: 'Metrics', x: 15, y: 12, size: 0.9, tone: 'success' },
        { icon: 'note', label: 'Logs', x: 50, y: 12, size: 0.9, tone: 'neutral' },
        { icon: 'map', label: 'Traces', x: 85, y: 12, size: 0.9, tone: 'primary' },
        { icon: 'person', label: 'Request', x: 15, y: 45, size: 0.9, tone: 'primary' },
        { icon: 'tag', label: 'Trace id', x: 50, y: 45, size: 0.9, tone: 'accent' },
      ],
      arrows: [
        { from: 3, to: 4 },
        { from: 4, to: 0, dashed: true },
        { from: 4, to: 1, dashed: true },
        { from: 4, to: 2, dashed: true },
      ],
    },
  },

  'prod-resilience': {
    oneLiner: 'Expect other services to fail sometimes, and make sure one failure does not drag your whole app down.',
    story:
      'Imagine you phone a shop to check if a part is in stock. You do not stay on hold forever; you hang up after a minute (timeout). If the line was busy, you call back after 1, then 2, then 4 minutes, plus a few random seconds so everyone does not call at once (retry with backoff and jitter). Asking a question twice is safe, but paying twice is not, so you only repeat safe calls, or quote an order number (idempotency key). If the shop failed many times, you stop calling for a while and later try one test call (circuit breaker). Meanwhile you use yesterday\'s price list (fallback).',
    keyPoints: [
      'Every remote call needs a timeout; waiting forever ties up your threads.',
      'Retry only safe, repeatable calls, with growing random delays and a limit.',
      'A circuit breaker fails fast while a service is sick, then tests it with a few calls.',
    ],
    types: [
      {
        title: 'Resilience patterns',
        items: [
          { name: 'Timeout', simple: 'Hang up if nobody answers the phone within a minute, instead of waiting forever.' },
          { name: 'Retry with backoff', simple: 'Call again later, waiting a bit longer and a bit randomly each time.' },
          { name: 'Circuit breaker', simple: 'The fuse box trips so one faulty kettle cannot burn the house; reset it later and test.' },
          { name: 'Bulkhead', simple: 'Sealed compartments in a ship, so one flooded section cannot sink the whole boat.' },
          { name: 'Rate limiter', simple: 'A nightclub letting in only so many people per minute.' },
          { name: 'Fallback', simple: 'The kitchen is out of fish, so you get the set menu instead of nothing.' },
        ],
      },
      {
        title: 'Backoff strategies',
        items: [
          { name: 'Fixed delay', simple: 'Everyone retries every 2 seconds, so they all knock on the door at once.' },
          { name: 'Exponential', simple: 'Wait 1, 2, 4, 8 seconds: back off quickly, but crowds still arrive together.' },
          { name: 'Exponential with full jitter', simple: 'Same growing waits, but each person picks a random time, so the crowd spreads out.' },
        ],
      },
    ],
    confusion: {
      mixedUpWith: 'retries and circuit breakers',
      difference: 'A retry tries the same call again, hoping a short glitch passed. A circuit breaker stops calling at all while the service keeps failing.',
    },
    tryIt: 'Use `HttpClient` to call a URL that answers slowly, with `HttpRequest.newBuilder(uri).timeout(Duration.ofSeconds(2))`. Run it and catch the `HttpTimeoutException` after two seconds instead of waiting.',
    recall: [
      { question: 'Why add random jitter to retry delays?', answer: 'So many clients do not retry at the same moment and flood the recovering service.' },
      { question: 'What does a circuit breaker do in the half-open state?', answer: 'It lets a few trial calls through to check whether the service has recovered.' },
      { question: 'How can you safely retry a payment request?', answer: 'Send an idempotency key, so the server can spot and ignore a repeated request.' },
    ],
    picture: {
      title: 'Phoning a busy shop',
      caption: 'Your app waits only so long (timeout), stops calling a failing shop (breaker), and uses a fallback meanwhile.',
      items: [
        { icon: 'phone', label: 'Your app', x: 12, y: 20, size: 0.9, tone: 'primary' },
        { icon: 'hourglass', label: 'Timeout', x: 37, y: 20, size: 0.9, tone: 'warning' },
        { icon: 'traffic-light', label: 'Breaker', x: 63, y: 20, size: 0.9, tone: 'accent' },
        { icon: 'shop', label: 'Service', x: 88, y: 20, size: 0.9, tone: 'danger' },
        { icon: 'note', label: 'Fallback', x: 63, y: 48, size: 0.7, tone: 'success' },
      ],
      arrows: [
        { from: 0, to: 1 },
        { from: 1, to: 2 },
        { from: 2, to: 3 },
        { from: 2, to: 4, dashed: true },
      ],
    },
  },

  'prod-microservices': {
    oneLiner: 'Microservices split one app into small services that each own their data and deploy on their own.',
    story:
      'Compare one big department store with a street of small shops. In the street, each shop has its own stockroom (its own database) and can repaint or change its hours without closing the others (independent deploy). But now customers walk between shops and deliveries cross the road, which is slow and can fail (network calls). One shop may be closed while the rest are open (partial failure). A purchase across three shops cannot use one till, so each shop takes its step and knows how to undo it (a saga). A department store with clear, separate departments is the modular monolith.',
    keyPoints: [
      'Each service owns one business area and its own data; no shared database.',
      'Services talk over the network with APIs or events, so calls can be slow or fail.',
      'Start with a modular monolith; split out a service when there is a real reason.',
    ],
    types: [
      {
        title: 'Architecture styles',
        items: [
          { name: 'Monolith', simple: 'One restaurant kitchen: one team, one fridge, easy to coordinate a whole meal.' },
          { name: 'Modular monolith', simple: 'One kitchen with clearly marked stations, each owning its own shelves.' },
          { name: 'Microservices', simple: 'A food court of independent stalls, each with its own fridge and opening hours.' },
          { name: 'Serverless', simple: 'A pop-up chef who appears only when an order arrives, and you pay per dish.' },
        ],
      },
      {
        title: 'Saga coordination styles',
        items: [
          { name: 'Orchestration', simple: 'A wedding planner tells each supplier what to do next, and undoes bookings if plans fail.' },
          { name: 'Choreography', simple: 'Dancers react to each other\'s moves with no conductor in charge.' },
        ],
      },
      {
        title: 'Communication styles',
        items: [
          { name: 'Synchronous request/response', simple: 'A phone call: you wait on the line until you get an answer.' },
          { name: 'Asynchronous messaging', simple: 'Leaving a voicemail: you carry on and the reply comes later.' },
        ],
      },
    ],
    confusion: {
      mixedUpWith: 'a modular monolith',
      difference: 'A modular monolith has clear modules but ships as one app in one process. Microservices are separate apps that deploy and fail independently.',
    },
    tryIt: 'Take an app you know, like a web shop. Write each business area on a card with the data it owns. If two cards keep needing each other\'s data, they probably belong together.',
    recall: [
      { question: 'Why should each microservice own its own data?', answer: 'So it can change and deploy without breaking others that would otherwise share its tables.' },
      { question: 'What replaces one ACID transaction across services?', answer: 'A saga: a series of local steps, each with an undo step if a later one fails.' },
      { question: 'What is the main benefit of microservices?', answer: 'Mostly organisational: teams can release and scale their service independently.' },
    ],
    picture: {
      title: 'A street of small shops',
      caption: 'Each shop (service) has its own stockroom (database) and talks to the others across the road (network).',
      items: [
        { icon: 'shop', label: 'Orders', x: 15, y: 12, size: 0.9, tone: 'primary' },
        { icon: 'shop', label: 'Payments', x: 50, y: 12, size: 0.9, tone: 'primary' },
        { icon: 'shop', label: 'Shipping', x: 85, y: 12, size: 0.9, tone: 'primary' },
        { icon: 'database', label: 'Orders DB', x: 15, y: 44, size: 0.8, tone: 'accent' },
        { icon: 'database', label: 'Payments DB', x: 50, y: 44, size: 0.8, tone: 'accent' },
        { icon: 'database', label: 'Shipping DB', x: 85, y: 44, size: 0.8, tone: 'accent' },
      ],
      arrows: [
        { from: 0, to: 1, label: 'API' },
        { from: 1, to: 2, label: 'event' },
        { from: 0, to: 3 },
        { from: 1, to: 4 },
        { from: 2, to: 5 },
      ],
    },
  },
};
