import type { MemoryAid } from '@/types/curriculum';

/** "Make it stick" memory aids for the Spring Boot module, keyed by lesson id. */
export const springMemory: Record<string, MemoryAid> = {
  'sp-ioc-boot': {
    oneLiner: 'Your class lists what it needs in its constructor, and Spring creates those objects and hands them over.',
    story:
      'Think of actors in a theatre. An actor does not go shopping for a sword or a lamp. Their script lists the props they need, and the stage manager collects every prop and puts each one in the right hands before the show. In Spring, the actor is your class, the script is its constructor, the props are other objects called beans, and the stage manager is the `ApplicationContext`. Spring Boot is a theatre that arrives with a standard set already built (auto-configuration), and it steps aside when you bring your own.',
    keyPoints: [
      'A bean is an object that Spring creates and manages, found through `@Component` classes or `@Bean` methods.',
      'Prefer constructor injection: fields can be `final` and tests can simply call `new` with fakes.',
      'Boot auto-configuration adds sensible default beans and backs off when you define your own.',
    ],
    confusion: {
      mixedUpWith: 'creating collaborators yourself with `new`',
      difference: 'With `new` inside a class, that class is welded to one implementation. With injection, the class only declares what it needs and Spring, or a test, decides what to pass in.',
    },
    tryIt: 'Write a `@Service` whose constructor takes a `@Repository` class. Start the app, then remove the `@Repository` annotation and restart. Read the error that says a bean of that type could not be found.',
    recall: [
      { question: 'What does "inversion of control" mean in one sentence?', answer: 'An object no longer creates its collaborators; it declares them and the container supplies them.' },
      { question: 'Why is constructor injection preferred over field injection?', answer: 'Dependencies are visible and can be `final`, and a unit test can build the object with `new` and fakes.' },
      { question: 'What happens to an auto-configured bean when you define your own of the same type?', answer: 'The auto-configuration usually backs off and your bean is used instead.' },
    ],
    picture: {
      title: 'The stage manager hands out props',
      caption: 'Spring collects the beans (props) and gives each class (actor) exactly what its constructor (script) asks for.',
      items: [
        { icon: 'boxes', label: 'Beans', x: 13, y: 22, tone: 'neutral' },
        { icon: 'robot', label: 'Spring', x: 50, y: 22, tone: 'accent' },
        { icon: 'person', label: 'Your class', x: 87, y: 22, tone: 'success' },
        { icon: 'note', label: 'Constructor', x: 87, y: 47, size: 0.8, tone: 'primary' },
      ],
      arrows: [
        { from: 0, to: 1, label: 'collect' },
        { from: 1, to: 2, label: 'inject' },
        { from: 3, to: 2, dashed: true },
      ],
    },
  },

  'sp-rest': {
    oneLiner: 'A REST API is a set of addresses for things, and HTTP verbs say what you want done with each one.',
    story:
      'Picture a big post office. Every parcel shelf has an address, like `/orders/42`. You hand in a slip at the counter that says what you want: look at a parcel (GET), send in a new one (POST), swap one for a new version (PUT), or throw one away (DELETE). A sorter reads the address and passes your slip to the right clerk. The clerk does the job and stamps the reply: 200 for done, 201 for created, 404 for no such shelf. In Spring, the sorter is the `DispatcherServlet`, the clerk is a `@RestController` method, and the slips are JSON.',
    keyPoints: [
      'A URI names a resource; the HTTP method says what to do with it.',
      'Status codes report the outcome: 2xx success, 4xx client mistake, 5xx server failure.',
      'Jackson turns JSON into Java objects and back; `@Valid` checks the input first.',
    ],
    confusion: {
      mixedUpWith: 'PUT and POST',
      difference: 'PUT replaces the resource at a known address, so sending it twice gives the same result. POST usually creates something new, so sending it twice can create two.',
    },
    tryIt: 'Write `@GetMapping("/hello/{name}")` returning a record with a greeting. Start the app and open `/hello/Ana` in a browser. Then open `/nope` and look at the 404 response.',
    recall: [
      { question: 'Which Spring class routes each HTTP request to the right controller method?', answer: 'The `DispatcherServlet`.' },
      { question: 'Which status code means a new resource was created?', answer: '201 Created, usually with a `Location` header pointing to the new resource.' },
      { question: 'What does idempotent mean for an HTTP method?', answer: 'Sending the same request many times leaves the server in the same state as sending it once.' },
    ],
    picture: {
      title: 'The post office counter',
      caption: 'A request slip arrives, the sorter (`DispatcherServlet`) passes it to the right clerk (controller), and the reply carries a status stamp.',
      items: [
        { icon: 'envelope', label: 'GET /orders', x: 11, y: 22, tone: 'primary' },
        { icon: 'mailbox', label: 'Dispatcher', x: 50, y: 22, tone: 'accent' },
        { icon: 'person', label: 'Controller', x: 87, y: 22, tone: 'success' },
        { icon: 'stamp', label: '200 + JSON', x: 87, y: 47, size: 0.8, tone: 'success' },
      ],
      arrows: [
        { from: 0, to: 1, label: 'send' },
        { from: 1, to: 2 },
        { from: 2, to: 3 },
      ],
    },
  },

  'sp-data-tx': {
    oneLiner: 'A transaction makes a group of database changes all happen or none happen, and Spring starts it at a proxy.',
    story:
      'Imagine moving money at a bank. Taking 50 from Ana and adding 50 to Ben must both happen, or neither. A guard stands at the office door. When you walk in through that door, the guard opens the ledger. A clerk notes every change on a notepad while you work. When you leave normally, the guard writes the notepad into the ledger (commit). If something breaks, the guard tears up the notepad (rollback). In Spring, the guard is the proxy made by `@Transactional`, the notepad is the persistence context, and the ledger is the database. If you sneak in through a side door (a call from inside the same class), no guard opens anything.',
    keyPoints: [
      'Spring Data JPA writes repository code for you from an interface like `OrderRepository`.',
      'Changes to loaded entities are saved at commit by dirty checking, even without calling `save`.',
      'By default, rollback happens only for unchecked exceptions, not for checked ones.',
    ],
    confusion: {
      mixedUpWith: 'calling a `@Transactional` method from the same class',
      difference: 'A call from inside the same object skips the proxy, so the annotation on the called method starts no transaction.',
    },
    tryIt: 'Turn on `spring.jpa.show-sql=true`. In a `@Transactional` method, load an entity, change one field and do not call `save`. Run it and spot the `update` statement in the log at commit.',
    recall: [
      { question: 'What does a transaction promise about a group of changes?', answer: 'They all succeed together, or they are all rolled back.' },
      { question: 'Why can `@Transactional` do nothing on a call inside the same class?', answer: 'The call does not pass through the Spring proxy, which is what starts the transaction.' },
      { question: 'Does a checked exception roll back a transaction by default?', answer: 'No. Only unchecked exceptions and errors do, unless you set `rollbackFor`.' },
    ],
    picture: {
      title: 'The guard at the bank door',
      caption: 'Calls through the door (proxy) get a transaction: the ledger is updated only when the whole job finishes.',
      items: [
        { icon: 'person', label: 'Caller', x: 13, y: 22, tone: 'primary' },
        { icon: 'shield', label: 'Proxy', x: 50, y: 22, tone: 'accent' },
        { icon: 'bank', label: 'Service', x: 87, y: 22, tone: 'neutral' },
        { icon: 'database', label: 'Database', x: 87, y: 47, size: 0.8, tone: 'success' },
      ],
      arrows: [
        { from: 0, to: 1, label: 'call' },
        { from: 1, to: 2, label: 'begin' },
        { from: 2, to: 3 },
      ],
    },
  },

  'sp-security': {
    oneLiner: 'Security filters first check who you are, then check what you may do, before any controller runs.',
    story:
      'Think of a concert hall with a row of checkpoints before the doors. At the first desk a guard checks your ticket or ID card: who are you? That is authentication. Your name then goes on a list the staff carry around. At the next gate, staff check whether your wristband lets you into this area: the main floor or the backstage room. That is authorization. No ticket at all means you are turned away with 401. A valid ticket but no backstage band means 403. In Spring, the checkpoints are the security filter chain, the list is the `SecurityContext`, and the hall is your controllers.',
    keyPoints: [
      'Filters run before the `DispatcherServlet`, so a blocked request never reaches your controller.',
      'Authentication asks who you are; authorization asks what you are allowed to do.',
      'It denies by default, hashes passwords with an encoder, and turns on CSRF protection.',
    ],
    confusion: {
      mixedUpWith: '401 and 403',
      difference: '401 means the server does not know who you are yet. 403 means it knows who you are but you are not allowed.',
    },
    tryIt: 'Add the Spring Security starter and start the app. Call an endpoint with `curl` and get 401. Copy the generated password from the log and call again with `-u user:<password>` to get 200.',
    recall: [
      { question: 'What is the difference between authentication and authorization?', answer: 'Authentication proves who you are. Authorization decides what you may do.' },
      { question: 'Where does Spring Security keep the logged-in user for a request?', answer: 'In the `SecurityContext`, as an `Authentication` object.' },
      { question: 'Which status means "known user, but not allowed"?', answer: '403 Forbidden.' },
    ],
    picture: {
      title: 'Checkpoints before the hall',
      caption: 'The first desk checks who you are, the gate checks your wristband, and only then do you reach the hall (controller).',
      items: [
        { icon: 'person', label: 'Request', x: 10, y: 20, size: 0.9, tone: 'primary' },
        { icon: 'id-card', label: 'Who are you?', x: 38, y: 20, size: 0.9, tone: 'accent' },
        { icon: 'lock', label: 'Allowed?', x: 64, y: 20, size: 0.9, tone: 'warning' },
        { icon: 'door', label: 'Controller', x: 90, y: 20, size: 0.9, tone: 'success' },
        { icon: 'cross', label: '401', x: 38, y: 47, size: 0.7, tone: 'danger' },
        { icon: 'cross', label: '403', x: 64, y: 47, size: 0.7, tone: 'danger' },
      ],
      arrows: [
        { from: 0, to: 1 },
        { from: 1, to: 2 },
        { from: 2, to: 3 },
        { from: 1, to: 4, dashed: true },
        { from: 2, to: 5, dashed: true },
      ],
    },
  },
};
