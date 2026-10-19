import type { InterviewQuestion, RubricPoint } from '@/types/practice';

/*
 * Advanced interview questions (set B): design, DSA, Spring, performance and
 * production, plus questions for the newer core lessons (inheritance types,
 * polymorphism, access modifiers, immutability, numbers, date-time and
 * annotations/reflection). Written answers are scored by rubric matchers
 * (case-insensitive regular expressions).
 */

const point = (id: string, label: string, matchers: string[], tip: string, weight = 1): RubricPoint => ({ id, label, weight, matchers, tip });

export const ADVANCED_QUESTIONS_B: InterviewQuestion[] = [
  // ------------------------------------------------------------ design
  {
    id: 'iq-b-composition-over-inheritance',
    moduleId: 'design',
    lessonIds: ['d-solid', 'o-solid'],
    kind: 'conceptual',
    difficulty: 'intermediate',
    prompt: 'Why do people say "favour composition over inheritance"? Relate your answer to SOLID and give an example where inheritance is still the right tool.',
    rubric: [
      point('coupling', 'Inheritance couples the subclass to the parent\'s implementation (fragile base class)', ['fragile base', 'tight(ly)? coupl', 'coupl\\w* to (the )?(parent|super|base)', 'break encapsulation', 'implementation details? of the (parent|super|base)'], 'Explain the cost: subclasses depend on the parent\'s internals, so parent changes can break them (fragile base class).', 2),
      point('composition', 'Composition: hold a collaborator behind an interface and delegate to it', ['delegat', 'has[- ]a', 'holds? (a|an) (reference|field|collaborator)', 'wrap'], 'Describe composition: the class holds a collaborator (usually an interface) and delegates to it.', 2),
      point('runtime', 'Composition allows swapping behaviour at runtime and mixing behaviours', ['runtime', 'swap', 'plug', 'combin\\w* (several|multiple) behaviou?rs?', 'inject'], 'Mention flexibility: collaborators can be swapped or combined at runtime / injected.'),
      point('lsp', 'Liskov: inheritance only for true is-a substitutability', ['liskov', '\\blsp\\b', 'substitut', 'is[- ]a'], 'Tie it to Liskov substitution: extend only when the subtype honours every parent contract.', 2),
      point('ocp', 'Open/closed or dependency inversion via interfaces', ['open[/ -]?closed', '\\bocp\\b', 'dependency inversion', '\\bdip\\b', 'depend on (an )?abstraction'], 'Link composition to open/closed or dependency inversion: new behaviour as a new implementation of an interface.'),
      point('example', 'A legitimate inheritance example (template method, sealed hierarchy, framework base class)', ['template method', 'sealed', 'abstract (base )?class', 'framework', 'exception hierarch', 'extends? (runtimeexception|exception)'], 'Give a fair counter-example where inheritance fits (template method, sealed hierarchy, custom exceptions).'),
    ],
    misconceptions: [
      { id: 'never-inherit', pattern: 'never (use|ever use) inheritance', correction: 'Inheritance is fine for genuine is-a relationships and designed-for-extension classes; the advice is to prefer composition, not to ban inheritance.' },
    ],
    modelAnswer:
      'Inheritance tightly couples a subclass to the implementation details of its parent: a change in the base class can silently break subclasses (the fragile base class problem), and the subclass inherits every public method whether it makes sense or not (Stack extends Vector). With composition the class holds a collaborator behind an interface and delegates to it, so behaviour can be swapped at runtime or injected, and several behaviours can be combined. This supports open/closed and dependency inversion: you add a new implementation of an abstraction instead of editing a hierarchy. Use inheritance only for a true is-a relationship that satisfies Liskov substitution, for example an abstract base class implementing the template method pattern, a sealed hierarchy of domain types, or custom exceptions extending RuntimeException.',
    followUps: ['Why is Stack extends Vector considered a design mistake?', 'How does the decorator pattern use composition?'],
  },
  {
    id: 'iq-b-pattern-tradeoffs',
    moduleId: 'design',
    lessonIds: ['d-patterns'],
    kind: 'scenario',
    difficulty: 'advanced',
    prompt: 'Compare strategy, factory, builder and singleton. For each, say what problem it solves and what it costs or how it is misused.',
    rubric: [
      point('strategy', 'Strategy: interchangeable algorithms behind an interface (often a lambda)', ['strategy.{0,80}(algorithm|interchangeab|swap|interface|lambda|behaviou?r)'], 'Define strategy: a family of interchangeable algorithms behind one interface; in modern Java often a lambda.', 2),
      point('factory', 'Factory: centralises/hides which concrete class is created', ['factory.{0,80}(creat|construct|which (concrete )?(class|implementation)|decid|hide|instantiat)'], 'Define factory: callers ask for an object and the factory decides which concrete type to create.', 2),
      point('builder', 'Builder: readable construction of objects with many optional parameters, often immutable', ['builder.{0,80}(optional|many (parameters|fields|arguments)|telescop|readab|immutable|step)'], 'Define builder: avoids telescoping constructors for many optional fields and can build immutable objects.', 2),
      point('singleton', 'Singleton costs: global state, hidden dependencies, hard to test', ['singleton.{0,120}(global|hidden|test|mock|coupl)', 'global (mutable )?state'], 'Name singleton\'s costs: global state, hidden dependencies, hard to mock in tests.', 2),
      point('di', 'Prefer DI-managed single instances / enum singleton when one is needed', ['dependency injection', '\\bdi\\b', 'container', 'enum singleton', 'enum'], 'Say what to use instead: let a DI container manage one instance, or use an enum singleton.'),
      point('overuse', 'Over-engineering: patterns add indirection; apply only when the variation exists', ['over[- ]?engineer', 'indirection', 'yagni', 'unnecessary (abstraction|complexity)', 'only when'], 'Mention the general cost: patterns add indirection, so introduce them when the variation is real.'),
    ],
    misconceptions: [
      { id: 'singleton-threadsafe-free', pattern: 'singletons? (is|are) (always|automatically) thread[- ]safe', correction: 'A singleton shared across threads must be made thread-safe; one instance means shared state, not safety.' },
    ],
    modelAnswer:
      'Strategy encapsulates a family of interchangeable algorithms behind one interface (for example a PricingRule), so behaviour can be swapped without if/else chains; in modern Java a strategy is often just a lambda. A factory centralises creation and hides which concrete class is instantiated, so callers depend on the interface and new types are added in one place. A builder gives readable construction for objects with many optional parameters, avoiding telescoping constructors, and fits immutable objects because build() can validate and then create the final object. Singleton guarantees one instance, but it is global state: it creates hidden dependencies and is hard to mock in tests, and a shared mutable singleton must be thread-safe. Usually it is better to let a dependency injection container manage a single instance, or use an enum singleton when you truly need one. All patterns add indirection, so I introduce them only when the variation actually exists rather than over-engineering up front.',
    followUps: ['How does a Map<String, Supplier<T>> act as a simple factory?', 'Why is an enum singleton safe against reflection and serialization attacks?'],
  },
  {
    id: 'iq-b-singleton-race',
    moduleId: 'design',
    lessonIds: ['d-patterns', 'cc-synchronization'],
    kind: 'debugging',
    difficulty: 'intermediate',
    prompt: 'Under load, logs show `ConfigCache` being initialised twice and two threads holding different instances. What is wrong and what is the simplest correct fix?',
    code: `public class ConfigCache {
    private static ConfigCache instance;
    private final Map<String, String> values;

    private ConfigCache() { values = loadFromDisk(); }

    public static ConfigCache getInstance() {
        if (instance == null) {
            instance = new ConfigCache();
        }
        return instance;
    }
}`,
    options: [
      { id: 'a', text: 'The constructor must be public so the JVM can cache the instance' },
      { id: 'b', text: 'Check-then-act race: two threads can both see null and both construct; use the holder idiom (static nested class) or an enum, which rely on thread-safe class initialisation' },
      { id: 'c', text: 'static fields are stored per thread, so each thread sees its own instance' },
      { id: 'd', text: 'Mark the field final and keep the null check' },
    ],
    correctOptionId: 'b',
    explanation:
      'The null check and the assignment are not atomic and there is no happens-before edge, so two threads can both create instances (and a thread could even see a partially published object). A static nested Holder class with `static final ConfigCache INSTANCE = new ConfigCache();` is lazy and thread-safe because the JVM initialises a class exactly once under a lock. Double-checked locking also works, but only with a volatile field.',
    modelAnswer: 'Lazy initialisation without synchronisation is a check-then-act race. Use the initialisation-on-demand holder idiom or an enum singleton; both rely on the JVM\'s guarantee that class initialisation happens once and is safely published.',
    followUps: ['Why does double-checked locking need volatile?', 'Would you rather inject this cache than make it a singleton?'],
  },

  // ------------------------------------------------------------ dsa
  {
    id: 'iq-b-collection-complexity',
    moduleId: 'dsa',
    lessonIds: ['a-complexity', 'a-data-structures'],
    kind: 'internals',
    difficulty: 'intermediate',
    prompt: 'Give the time complexity of the common operations on ArrayList, LinkedList, HashMap and TreeMap, and explain how you choose between them.',
    rubric: [
      point('arraylist', 'ArrayList: O(1) get by index, amortised O(1) append, O(n) insert/remove in the middle', ['arraylist.{0,120}(o\\(1\\)|constant)', 'amorti[sz]ed'], 'Cover ArrayList: O(1) index access and amortised O(1) append, O(n) middle insert/remove (shifting).', 2),
      point('linkedlist', 'LinkedList: O(n) index access; O(1) only at the ends or via an iterator', ['linkedlist.{0,120}(o\\(n\\)|linear|travers|walk)'], 'Cover LinkedList: get(i) is O(n); O(1) only at the ends or at an iterator position.', 2),
      point('hashmap', 'HashMap: O(1) average get/put, degrades with collisions (treeified bins O(log n))', ['hashmap.{0,120}(o\\(1\\)|constant)', 'average (case )?o\\(1\\)'], 'Cover HashMap: O(1) average, worse with bad hashCode; Java 8+ treeifies long bins to O(log n).', 2),
      point('treemap', 'TreeMap: O(log n) operations, keeps keys sorted (red-black tree)', ['treemap.{0,120}(o\\(log ?n\\)|log)', 'red[- ]black'], 'Cover TreeMap: O(log n) get/put with sorted keys and range queries.', 2),
      point('contains', 'List.contains is O(n); use a HashSet for membership', ['contains.{0,60}(o\\(n\\)|linear)', 'hashset.{0,60}(membership|contains|lookup)'], 'Point out that list.contains is a linear scan; a HashSet gives O(1) membership.'),
      point('choose', 'Choose by access pattern: index, key lookup, ordering, ends', ['access pattern', 'depend\\w* on (the )?(operations|access|what)', 'sorted|order(ed|ing)', 'cache locality|cache[- ]friendly|memory overhead'], 'Explain the choice: match the structure to the dominant operations (index, lookup, ordering) and mention memory/cache effects.'),
    ],
    misconceptions: [
      { id: 'linkedlist-get-o1', pattern: 'linkedlist (get|access)\\w*.{0,20}(is )?o\\(1\\)', correction: 'LinkedList.get(i) walks the nodes: O(n).' },
      { id: 'hashmap-worst-o1', pattern: 'hashmap.{0,30}always o\\(1\\)', correction: 'HashMap is O(1) on average; collisions degrade it (to O(log n) per treeified bin since Java 8).' },
    ],
    modelAnswer:
      'ArrayList is backed by an array: get(i) and set are O(1), add at the end is amortised O(1) because the array grows by about 1.5x, and insert or remove in the middle is O(n) because elements shift. LinkedList get(i) is O(n) because it must traverse nodes; adding or removing is O(1) only at the ends or at an iterator position, and its per-node memory overhead and poor cache locality usually make ArrayList or ArrayDeque faster. HashMap get and put are average O(1) with a good hashCode; heavy collisions degrade it, and since Java 8 long bins are treeified so the worst case per bin is O(log n). TreeMap is a red-black tree: get, put and remove are O(log n) and keys stay sorted, which enables range queries like floorKey and subMap. list.contains is a linear O(n) scan, so for membership tests I use a HashSet. I choose by access pattern: index access means ArrayList, key lookup means HashMap, sorted order or ranges means TreeMap, and queue or stack operations at the ends mean ArrayDeque.',
    followUps: ['Why is ArrayList append only amortised O(1)?', 'When would a LinkedHashMap be the right choice?'],
  },
  {
    id: 'iq-b-stable-sort',
    moduleId: 'dsa',
    lessonIds: ['a-sorting-searching'],
    kind: 'output',
    difficulty: 'intermediate',
    prompt: 'What does this program print?',
    code: `import java.util.*;

public class Main {
    record Player(String name, int score) {}

    public static void main(String[] args) {
        List<Player> players = new ArrayList<>(List.of(
            new Player("Ann", 80), new Player("Bob", 95),
            new Player("Cid", 80), new Player("Dee", 95)));
        players.sort(Comparator.comparing(Player::name).reversed());
        players.sort(Comparator.comparingInt(Player::score));
        StringBuilder sb = new StringBuilder();
        for (Player p : players) sb.append(p.name()).append(' ');
        System.out.println(sb.toString().trim());
    }
}`,
    options: [
      { id: 'a', text: 'Cid Ann Dee Bob' },
      { id: 'b', text: 'Ann Cid Bob Dee' },
      { id: 'c', text: 'Ann Bob Cid Dee' },
      { id: 'd', text: 'The order of equal scores is unspecified' },
    ],
    correctOptionId: 'a',
    explanation:
      'The first sort orders by name descending: Dee, Cid, Bob, Ann. List.sort on objects is a stable merge sort (TimSort), so the second sort by score keeps that relative order for equal scores: 80s are Cid, Ann and 95s are Dee, Bob.',
    modelAnswer: 'List.sort is guaranteed stable, so sorting by a secondary key first and then by the primary key yields "Cid Ann Dee Bob". In real code, a single comparator with thenComparing is clearer.',
    followUps: ['Is Arrays.sort(int[]) stable, and does it matter for primitives?', 'Rewrite this as a single Comparator chain.'],
  },
  {
    id: 'iq-b-recursion-dp',
    moduleId: 'dsa',
    lessonIds: ['a-recursion-dp'],
    kind: 'conceptual',
    difficulty: 'intermediate',
    prompt: 'A recursive solution to "count the ways to climb n stairs taking 1 or 2 steps" times out for n = 50. Why, and how would you fix it?',
    rubric: [
      point('overlap', 'Naive recursion recomputes overlapping subproblems', ['overlapping subproblem', 'recomput', 'same (subproblems?|values?|calls?) (are |is )?(computed|calculated|solved) (again|repeatedly|many times)', 'repeated (work|calls)'], 'Identify the cause: the same subproblems are recomputed again and again.', 2),
      point('exponential', 'Exponential time (about O(2^n) / O(phi^n))', ['exponential', 'o\\(2\\^n\\)', '2\\^n', 'phi\\^n'], 'Quantify it: the call tree grows exponentially, about O(2^n).', 2),
      point('memo', 'Memoization (top-down cache) gives O(n)', ['memoi[sz]', 'cache', 'top[- ]down'], 'Fix 1: memoize results in an array or map (top-down DP).', 2),
      point('tab', 'Tabulation (bottom-up), possibly O(1) space with two variables', ['tabulat', 'bottom[- ]up', 'iterativ', 'two variables', 'o\\(1\\) (extra )?space'], 'Fix 2: build the answer bottom-up; only the last two values are needed, so O(1) space.', 2),
      point('stack', 'Deep recursion risks StackOverflowError; values overflow long', ['stackoverflow', 'stack overflow', 'stack depth', 'call stack', 'overflow (a |the )?long', 'biginteger'], 'Mention stack depth (StackOverflowError for deep recursion) or numeric overflow for large n.'),
    ],
    misconceptions: [
      { id: 'jvm-tco', pattern: 'java (does|performs|has) tail[- ]call optimi[sz]ation', correction: 'The JVM does not perform tail-call optimisation; deep recursion consumes stack frames.' },
    ],
    modelAnswer:
      'ways(n) = ways(n-1) + ways(n-2), so the naive recursion recomputes overlapping subproblems: ways(48) is computed twice, ways(47) three times and so on, giving exponential time, roughly O(2^n). Memoization (top-down: cache each result in an array or map) makes it O(n) time and O(n) space. Tabulation builds the answer bottom-up in a loop; since each step only needs the previous two values, two variables give O(n) time and O(1) space and avoid recursion entirely. Very deep recursion can also throw StackOverflowError because Java has no tail-call optimisation, and for large n the count overflows long, so use BigInteger if needed.',
    followUps: ['How do you recognise that a problem has optimal substructure?', 'What would change if you could also take 3 steps?'],
  },

  // ------------------------------------------------------------ spring
  {
    id: 'iq-b-ioc-bean-scopes',
    moduleId: 'spring',
    lessonIds: ['sp-ioc-boot'],
    kind: 'internals',
    difficulty: 'intermediate',
    prompt: 'Explain inversion of control and dependency injection in Spring, the main bean scopes, and what happens when you inject a prototype-scoped bean into a singleton.',
    rubric: [
      point('ioc', 'IoC: the container creates and wires objects instead of the class doing it', ['inversion of control', '\\bioc\\b', 'container (creates|instantiates|manages|wires)', 'applicationcontext'], 'Define IoC: the container creates objects and wires their dependencies, not the class itself.', 2),
      point('ctor', 'Constructor injection preferred (final fields, testable, no hidden deps)', ['constructor injection', 'inject\\w* (via|through) (the )?constructor', 'final fields?'], 'Recommend constructor injection: final fields, explicit dependencies, easy to test without Spring.', 2),
      point('singleton', 'Default scope is singleton: one instance per container, so it must be stateless/thread-safe', ['singleton.{0,80}(default|one (instance|per)|shared)', 'default (scope )?(is )?singleton'], 'State the default: singleton, one shared instance per container, so keep it stateless or thread-safe.', 2),
      point('others', 'Prototype, request, session scopes', ['prototype', 'request scope', 'session scope', '\\brequest\\b.{0,40}\\bsession\\b'], 'List the other scopes: prototype (new per lookup), request, session.'),
      point('proto-in-singleton', 'A prototype injected into a singleton is created once; use ObjectProvider/lookup/scoped proxy', ['objectprovider', 'objectfactory', '@lookup', 'lookup method', 'scoped proxy', 'proxymode', 'only once', 'injected once', 'same (prototype )?instance'], 'Explain the trap: injection happens once, so the singleton keeps one prototype; use ObjectProvider, @Lookup or a scoped proxy.', 2),
    ],
    misconceptions: [
      { id: 'singleton-per-jvm', pattern: 'singleton (scope )?(means|is) one (instance )?per (jvm|classloader)', correction: 'Spring singleton means one instance per bean definition per container, not per JVM.' },
      { id: 'proto-fresh-each-call', pattern: 'prototype.{0,40}new instance (on|for) every (method )?call', correction: 'A prototype is created per lookup or injection, not per method call on an already injected reference.' },
    ],
    modelAnswer:
      'With inversion of control the ApplicationContext (the container) creates objects and wires their dependencies, instead of each class constructing what it needs. Dependency injection is how it supplies them; constructor injection is preferred because fields can be final, dependencies are explicit and the class can be unit tested with plain new. The default scope is singleton: one shared instance per bean definition per container, so singleton beans must be stateless or thread-safe. Other scopes are prototype (a new instance for each lookup or injection point), request and session in web apps. If a prototype bean is injected into a singleton, injection happens only once when the singleton is created, so the singleton keeps the same instance forever. To get a fresh one each time, inject ObjectProvider<T> and call getObject(), use an @Lookup method, or use a scoped proxy.',
    followUps: ['Why does field injection make testing harder?', 'How does Spring resolve a circular dependency, and why are they a smell?'],
  },
  {
    id: 'iq-b-transactional-self-invocation',
    moduleId: 'spring',
    lessonIds: ['sp-data-tx'],
    kind: 'debugging',
    difficulty: 'advanced',
    prompt: 'The audit row should be saved even when the transfer fails, but after a failure neither the transfer nor the audit row is in the database. Why?',
    code: `@Service
public class TransferService {
    @Transactional
    public void transfer(long from, long to, BigDecimal amount) {
        writeAudit(from, to, amount);          // must survive a rollback
        accounts.debit(from, amount);
        accounts.credit(to, amount);           // throws IllegalStateException
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void writeAudit(long from, long to, BigDecimal amount) {
        auditRepository.save(new AuditEntry(from, to, amount));
    }
}`,
    options: [
      { id: 'a', text: 'REQUIRES_NEW is only honoured on private methods' },
      { id: 'b', text: 'IllegalStateException is unchecked, so Spring commits by default' },
      { id: 'c', text: 'writeAudit is called on this, not through the Spring proxy, so its @Transactional is ignored and it joins the outer transaction, which rolls back; move it to another bean (AuditService) and call it through the injected proxy' },
      { id: 'd', text: 'Two @Transactional methods in one class cause a deadlock that Spring resolves by rolling back both' },
    ],
    correctOptionId: 'c',
    explanation:
      'Spring applies @Transactional with a proxy. A self-invocation (this.writeAudit) bypasses the proxy, so no new transaction is started and the audit insert is part of the outer transaction. The outer transaction rolls back because by default Spring rolls back on RuntimeException and Error; checked exceptions commit unless rollbackFor is set. Moving writeAudit to a separate bean makes REQUIRES_NEW take effect.',
    modelAnswer: 'Self-invocation bypasses the transactional proxy, so REQUIRES_NEW never applies and the audit write is rolled back with the outer transaction (rolled back because IllegalStateException is unchecked). Put the audit method in another bean, or use TransactionTemplate.',
    followUps: ['Which exceptions trigger rollback by default, and how do you change that?', 'What happens if you catch the exception inside transfer() and do not rethrow?'],
  },
  {
    id: 'iq-b-authn-authz',
    moduleId: 'spring',
    lessonIds: ['sp-security', 'sp-rest'],
    kind: 'conceptual',
    difficulty: 'intermediate',
    prompt: 'What is the difference between authentication and authorization, how does Spring Security implement each, and which HTTP status codes correspond to failures of each?',
    rubric: [
      point('authn', 'Authentication verifies who the caller is', ['authentication.{0,80}(who|identity|verif|prove)'], 'Define authentication: establishing who the caller is (credentials, token).', 2),
      point('authz', 'Authorization decides what an authenticated caller may do', ['authori[sz]ation.{0,80}(what|allowed|permi|access|may|can)'], 'Define authorization: deciding whether this identity may perform this action on this resource.', 2),
      point('filter', 'Filter chain / SecurityContext / AuthenticationManager', ['filter ?chain', 'securitycontext', 'authenticationmanager', 'authenticationprovider', 'securityfilterchain'], 'Describe the mechanism: the security filter chain authenticates and stores the result in the SecurityContext.'),
      point('rules', 'Authorization rules: requestMatchers/hasRole, @PreAuthorize', ['hasrole', 'hasauthority', 'preauthori[sz]e', 'requestmatchers', 'authorizehttprequests', 'roles?|authorit(y|ies)'], 'Mention how authorization is expressed: URL rules (hasRole/hasAuthority) and method security (@PreAuthorize).'),
      point('401', '401 Unauthorized = not authenticated', ['401'], 'Map unauthenticated requests to 401 (despite the name "Unauthorized").', 2),
      point('403', '403 Forbidden = authenticated but not permitted', ['403'], 'Map authenticated-but-not-allowed to 403 Forbidden.', 2),
    ],
    misconceptions: [
      { id: '401-forbidden', pattern: '401 (means|is) (forbidden|not (allowed|permitted))', correction: '401 means the caller is not authenticated; 403 means authenticated but not permitted.' },
      { id: 'same-thing', pattern: '(they are|both are|authentication and authori[sz]ation are) the same', correction: 'They are different steps: identity first, then permission.' },
    ],
    modelAnswer:
      'Authentication verifies who the caller is, for example by checking a password, a session cookie or a JWT. Authorization decides what that identity is allowed to do on a given resource. In Spring Security a SecurityFilterChain of servlet filters authenticates the request (via an AuthenticationManager and its providers or a bearer-token filter) and stores the result in the SecurityContext. Authorization is then checked against roles or authorities, with URL rules such as authorizeHttpRequests().requestMatchers("/admin/**").hasRole("ADMIN") and method security such as @PreAuthorize. A request with missing or invalid credentials gets 401 Unauthorized (really "unauthenticated"), while an authenticated user who lacks permission gets 403 Forbidden. Some APIs return 404 instead of 403 to avoid revealing that a resource exists.',
    followUps: ['Why is CSRF protection usually disabled for stateless token APIs but not for cookie sessions?', 'Where would you check that a user may only read their own orders?'],
  },

  // ------------------------------------------------------------ performance
  {
    id: 'iq-b-profile-slow-service',
    moduleId: 'performance',
    lessonIds: ['perf-diagnostics', 'perf-optimisation'],
    kind: 'scenario',
    difficulty: 'advanced',
    prompt: 'After a release, p99 latency of /checkout went from 120 ms to 900 ms. Walk me through how you would find the cause.',
    rubric: [
      point('baseline', 'Measure first: define the metric and compare with a baseline', ['baseline', 'measure (first|before)', 'reproduc', 'compare (with|against|to)'], 'Start by measuring: confirm the regression with metrics and a baseline you can re-check.', 2),
      point('changes', 'Look at what changed (release diff, config, traffic, dependencies)', ['what changed', 'diff', 'release notes', 'deploy', 'roll ?back'], 'Correlate with what changed: the release diff, configuration, traffic or dependencies.'),
      point('cpu-wait', 'Separate CPU time from waiting (DB, downstream, locks)', ['cpu', 'wait(ing)? (on|for)', 'downstream', 'database|\\bdb\\b|slow quer', 'lock contention|contention'], 'Split the time: is it CPU work, or waiting on the database, downstream calls or locks?', 2),
      point('tools', 'Profilers and dumps: JFR, async-profiler/flame graphs, thread dumps', ['\\bjfr\\b', 'flight recorder', 'async[- ]profiler', 'flame ?graph', 'thread dump', 'jstack', 'profil'], 'Name the tools: JFR or async-profiler flame graphs, thread dumps.', 2),
      point('gc', 'Check GC logs / allocation and pauses', ['\\bgc\\b', 'garbage collect', 'allocation', 'heap'], 'Check GC pauses and allocation rate in GC logs or JFR.'),
      point('traces', 'Distributed traces to see where time is spent across services', ['trac(e|es|ing)', 'span'], 'Use distributed traces to see which span grew.'),
      point('verify', 'Fix the biggest contributor and verify with the same measurement', ['verify', 're-?measure', 'confirm the fix', 'biggest contributor', 'amdahl'], 'Close the loop: fix the biggest contributor and re-measure the same percentile.'),
    ],
    misconceptions: [
      { id: 'guess-optimise', pattern: 'just (add|increase) (more )?(heap|memory|threads|servers)', correction: 'Scaling or tuning without a diagnosis often hides the problem or makes it worse; measure first.' },
    ],
    modelAnswer:
      'First I confirm and quantify the regression against a baseline: p50, p95 and p99 from metrics before and after the deploy, and whether it is all instances and all requests or a subset. Then I look at what changed: the release diff, configuration, dependency versions and traffic. Next I split the time into CPU work versus waiting on the database, downstream calls or lock contention: distributed traces show which span grew, slow query logs show database time, and repeated thread dumps (jstack) show threads blocked or waiting. For CPU or allocation problems I record JFR or async-profiler and read the flame graph, and I check GC logs for longer pauses or a higher allocation rate. I form a hypothesis, fix the biggest contributor (Amdahl\'s law), and verify by re-measuring the same p99 under comparable load; if users are hurting meanwhile, I roll back first.',
    followUps: ['p99 is bad but p50 is unchanged. What kinds of causes does that suggest?', 'How do you profile safely in production?'],
  },
  {
    id: 'iq-b-jmh-dead-code',
    moduleId: 'performance',
    lessonIds: ['perf-jmh'],
    kind: 'debugging',
    difficulty: 'advanced',
    prompt: 'This JMH benchmark reports about 0.3 ns/op for parsing a 20-digit string, which is impossibly fast. What is the most likely problem?',
    code: `@State(Scope.Thread)
public class ParseBench {
    String input = "12345678901234567890";

    @Benchmark
    public void parse() {
        new java.math.BigInteger(input);
    }
}`,
    options: [
      { id: 'a', text: 'JMH measures in microseconds, so 0.3 ns is a display bug' },
      { id: 'b', text: 'The result is never used, so the JIT can eliminate the work as dead code; return the value from the method or consume it with a Blackhole' },
      { id: 'c', text: 'BigInteger caches parsed values, so only the first call does work' },
      { id: 'd', text: 'Scope.Thread runs the benchmark on a single CPU core, which is faster' },
    ],
    correctOptionId: 'b',
    explanation:
      'Dead-code elimination is the classic JMH pitfall: if the result has no observable effect, the JIT may remove the computation. Returning the result from a @Benchmark method (JMH feeds it to an implicit Blackhole) or calling blackhole.consume(x) prevents that. Related pitfalls are constant folding of final inputs (keep inputs in non-final @State fields) and not using enough warmup and forks.',
    modelAnswer: 'The JIT can remove a computation whose result is unused. Return the result or sink it into a Blackhole, keep inputs in non-final @State fields to avoid constant folding, and rely on JMH warmup iterations and forks.',
    followUps: ['Why does JMH run each benchmark in a forked JVM?', 'What is constant folding and how do @State fields avoid it?'],
  },
  {
    id: 'iq-b-latency-percentiles',
    moduleId: 'performance',
    lessonIds: ['perf-diagnostics'],
    kind: 'conceptual',
    difficulty: 'intermediate',
    prompt: 'Why do we report latency as percentiles instead of the average, and what mistakes do people make with percentiles?',
    rubric: [
      point('skew', 'Latency is skewed; the mean hides the slow tail', ['skew', 'tail', 'outlier', 'average (hides|lies)', 'mean (hides|is (dragged|distorted))'], 'Explain that latency distributions are skewed and the average hides the slow tail.', 2),
      point('pcts', 'Report p50, p95, p99 (and max)', ['p50', 'p95', 'p99', 'median', '99th'], 'Name the percentiles you would report (p50, p95, p99, max).', 2),
      point('fanout', 'Fan-out: a request touching many services hits the tail often', ['fan[- ]?out', '0\\.99\\^', 'many (backend|downstream) calls', 'multiple (backend|downstream) calls'], 'Explain fan-out: with many backend calls per page, most users hit some backend\'s p99.', 2),
      point('no-avg', 'Percentiles cannot be averaged across instances; merge histograms', ['(cannot|can\'?t|don\'?t|not) (be )?averag', 'histogram'], 'Warn that percentiles from different instances cannot be averaged; aggregate histograms instead.', 2),
      point('co', 'Coordinated omission in load tests', ['coordinated omission'], 'Mention coordinated omission: closed-loop load generators under-report the tail.'),
    ],
    misconceptions: [
      { id: 'avg-p99', pattern: 'average (the|of) (the )?p99', correction: 'Averaging per-instance p99 values does not give the global p99; merge the histograms.' },
    ],
    modelAnswer:
      'Latency is skewed: most requests are fast and a few are very slow, so the average is pulled up by outliers yet still hides how bad the tail is. I report p50 (median), p95, p99 and max. The tail matters more than it seems because of fan-out: if a page makes 20 backend calls, about 1 - 0.99^20, roughly 18%, of page loads hit at least one backend p99. Common mistakes: averaging p99 values from different instances or time windows (percentiles cannot be averaged; you must merge histograms such as HdrHistogram or Prometheus buckets), and coordinated omission in load tests, where a generator that waits for slow responses before sending the next request under-reports the tail.',
    followUps: ['How would you set an SLO for a checkout endpoint?', 'What is the difference between latency and throughput, and how do they interact under load?'],
  },

  // ------------------------------------------------------------ production
  {
    id: 'iq-b-observability-signal',
    moduleId: 'production',
    lessonIds: ['prod-observability'],
    kind: 'debugging',
    difficulty: 'intermediate',
    prompt: 'A dashboard shows p99 of the order API rose from 200 ms to 2 s. Each request calls five downstream services. Logs from each service look normal. What gives you the fastest answer to "where is the time going for the slow requests"?',
    options: [
      { id: 'a', text: 'Add more INFO logs in every service and redeploy' },
      { id: 'b', text: 'A CPU usage graph of the order API host' },
      { id: 'c', text: 'Distributed traces: open a slow trace and see which span (service call, query) takes the time; follow its trace id into that service\'s logs' },
      { id: 'd', text: 'Average latency per service over the last day' },
    ],
    correctOptionId: 'c',
    explanation:
      'Metrics tell you that something is wrong (p99 rose), traces tell you where in a request the time is spent across services, and logs tell you why for a specific event. Propagating trace context (W3C traceparent) and putting the trace id in every log line lets you jump from the slow span to the relevant log lines. Averages hide the tail, and more logs without correlation ids do not connect the services.',
    modelAnswer: 'Use traces: metrics detect the regression, a slow trace shows which span grew, and the trace id correlates the span with that service\'s logs.',
    followUps: ['How do you avoid high-cardinality labels in metrics?', 'What sampling strategy keeps the slow traces you care about?'],
  },
  {
    id: 'iq-b-retries-circuit-breaker',
    moduleId: 'production',
    lessonIds: ['prod-resilience'],
    kind: 'scenario',
    difficulty: 'advanced',
    prompt: 'Your service calls a payment provider that occasionally times out. How do you add retries safely, and where does a circuit breaker fit?',
    rubric: [
      point('timeout', 'Every call needs a timeout', ['timeouts?'], 'Start with timeouts: without them, retries and breakers cannot work.', 1),
      point('backoff', 'Exponential backoff with jitter and a capped number of attempts', ['exponential', 'backoff', 'back[- ]off'], 'Use exponential backoff with a cap on attempts.', 2),
      point('jitter', 'Jitter to avoid synchronised retry storms', ['jitter', 'randomi[sz]', 'thundering herd', 'retry storm'], 'Add jitter so clients do not retry in lockstep (retry storms).'),
      point('transient', 'Retry only transient errors, not 4xx/validation errors', ['transient', 'only retry', '(503|5xx|timeouts?).{0,40}(not|but not).{0,20}(4xx|400|validation)', 'not (retry|for) (4xx|400|client errors|validation)'], 'Retry only transient failures (timeouts, 503), never client errors like 400.'),
      point('idempotency', 'Retried writes must be idempotent: idempotency key / dedup', ['idempoten'], 'Make retried operations idempotent, e.g. an idempotency key the provider uses to deduplicate.', 2),
      point('breaker', 'Circuit breaker: open after a failure threshold, fail fast, half-open probes', ['circuit breaker.{0,160}(open|fail fast|threshold|half[- ]open)', 'half[- ]open', 'fail(s|ing)? fast'], 'Explain the breaker: after a failure-rate threshold it opens and fails fast, then half-open probes test recovery.', 2),
    ],
    misconceptions: [
      { id: 'retry-forever', pattern: 'retry (forever|indefinitely|until it succeeds)', correction: 'Unbounded retries amplify load on a struggling dependency; cap attempts and use a retry budget.' },
      { id: 'post-idempotent', pattern: 'post (is|requests are) idempotent', correction: 'POST is not idempotent by definition; GET, PUT and DELETE are. Make POST safe to retry with an idempotency key.' },
    ],
    modelAnswer:
      'First, every call gets a timeout shorter than my own deadline. Retries use exponential backoff with jitter (for example 100 ms, 200 ms, 400 ms plus randomness) and a capped number of attempts, so many clients do not retry in lockstep and cause a retry storm. I only retry transient errors such as timeouts, connection resets or 503, not 400 validation errors. Because a timed-out payment may actually have succeeded, the operation must be idempotent: I send an idempotency key per payment so the provider deduplicates, and I store the key on my side too. GET, PUT and DELETE are idempotent by HTTP semantics, but POST is not, which is why the key matters. A circuit breaker wraps the call: when the failure rate over a window passes a threshold it opens and fails fast (or uses a fallback such as "payment pending"), protecting threads and the provider; after a cool-down it goes half-open and lets a few probe requests through to decide whether to close again. Retries go inside the breaker so an open circuit stops them.',
    followUps: ['How does a bulkhead differ from a circuit breaker?', 'How would you test this behaviour without the real provider?'],
  },
  {
    id: 'iq-b-monolith-vs-microservices',
    moduleId: 'production',
    lessonIds: ['prod-microservices'],
    kind: 'scenario',
    difficulty: 'advanced',
    prompt: 'A startup with eight engineers wants to split its Spring Boot monolith into microservices. What would you advise?',
    rubric: [
      point('benefits', 'Microservices benefits: independent deployment and scaling, team autonomy', ['independent(ly)? (deploy|scal|release)', 'team autonomy', 'autonomous teams', 'scale (them )?independently', 'fault isolation'], 'Acknowledge the benefits: independent deploys and scaling, team autonomy, fault isolation.', 2),
      point('costs', 'Costs: network calls, distributed failures, operational overhead, observability', ['network', 'latency', 'operational (overhead|complexity|cost)', 'distributed (system|failure|debugging)', 'partial failure'], 'Name the costs: network latency and partial failures, more infrastructure and operations.', 2),
      point('data', 'Data consistency: no cross-service transactions; sagas/eventual consistency', ['saga', 'eventual(ly)? consisten', 'distributed transaction', 'database per service', 'own (its|their) data'], 'Mention data: each service owns its data, so cross-service consistency needs sagas/eventual consistency.', 2),
      point('modular', 'Start with a modular monolith and clear boundaries', ['modular monolith', 'module boundar', 'bounded context', 'well[- ]defined (modules|boundaries)'], 'Suggest a modular monolith with clear module boundaries (bounded contexts) first.', 2),
      point('extract', 'Extract a service only for a concrete driver (scaling, team, release cadence)', ['extract', 'strangler', 'concrete (reason|driver|need)', 'when (a|the) (team|module|part) (needs|has)'], 'Extract services one at a time when there is a concrete reason (strangler fig pattern).'),
    ],
    misconceptions: [
      { id: 'micro-always-scale', pattern: 'microservices (are )?always (scale|perform|faster)', correction: 'Microservices add network hops; they help scale teams and parts independently, not raw performance by default.' },
      { id: 'shared-db', pattern: 'services should share (one|the same|a single) database', correction: 'A shared database couples services through the schema; each service should own its data.' },
    ],
    modelAnswer:
      'With eight engineers I would usually not split yet. Microservices bring independent deployment and scaling, team autonomy and fault isolation, but they cost a lot: every call becomes a network call with latency and partial failure, you need service discovery, CI/CD per service, distributed tracing and on-call for many systems, and each service owns its data, so you lose cross-service transactions and need sagas and eventual consistency. Those costs pay off mainly when many teams step on each other. I would first make it a modular monolith: clear module boundaries along bounded contexts, no reaching into other modules\' tables, and enforced dependencies (for example with ArchUnit or Spring Modulith). Then extract a service one at a time, strangler-fig style, only when a module has a concrete driver: very different scaling needs, a separate team, or a different release cadence.',
    followUps: ['What is a distributed monolith and how do you end up with one?', 'How would you migrate data ownership when extracting a service?'],
  },

  // ------------------------------------------------------------ newer core lessons
  {
    id: 'iq-b-diamond-problem',
    moduleId: 'oop',
    lessonIds: ['o-inheritance-types', 'o-interfaces'],
    kind: 'conceptual',
    difficulty: 'intermediate',
    prompt: 'Why does Java not allow a class to extend two classes, and how does it handle the same problem for interfaces with default methods?',
    rubric: [
      point('diamond', 'The diamond problem: ambiguity when two parents provide the same member', ['diamond', 'ambigu'], 'Name the diamond problem: two parents provide the same method or field, so which one wins is ambiguous.', 2),
      point('state', 'Multiple inheritance of state (fields, constructors) is the hard part', ['state', 'fields?', 'constructor', 'initiali[sz]ation order'], 'Explain that inheriting state (fields and constructor chains) from two classes is what Java avoids.', 2),
      point('interfaces', 'A class can implement multiple interfaces (type and behaviour, no instance state)', ['(implement|multiple) interfaces', 'interfaces?.{0,60}(no|without) (instance )?(state|fields)'], 'Say that multiple inheritance of type is allowed through interfaces, which have no instance state.', 2),
      point('override', 'Conflicting defaults must be overridden; choose with X.super.m()', ['\\.super\\.', 'must override', 'compile(r|-time)? error', 'does not compile', 'won\'?t compile'], 'Describe the rule: conflicting default methods are a compile error until the class overrides and picks one with X.super.m().', 2),
      point('class-wins', 'Class methods win over interface defaults; more specific interface wins', ['class (method )?wins', 'superclass (method )?wins', 'more specific', 'class (always )?takes precedence'], 'Add the resolution rules: a class/superclass method wins, then the most specific interface.'),
    ],
    misconceptions: [
      { id: 'no-multiple-at-all', pattern: 'java (has|supports) no (form of )?multiple inheritance', correction: 'Java has multiple inheritance of type (and of behaviour via default methods) through interfaces; only classes are limited to one superclass.' },
    ],
    modelAnswer:
      'If a class could extend two classes that both define the same method or field, it would be ambiguous which one is inherited: the diamond problem. The hard part is multiple inheritance of state: two sets of fields, two constructor chains and an unclear initialization order, as in C++ virtual inheritance. Java avoids it by allowing one superclass but letting a class implement multiple interfaces, which have no instance fields. With default methods (Java 8+) a behaviour diamond can still occur, so the rules are: a method from the class or superclass wins over any default; otherwise the more specific interface wins; and if two unrelated interfaces provide the same default, it is a compile error until the class overrides the method, optionally choosing one with A.super.greet().',
    followUps: ['How do sealed interfaces change hierarchy design?', 'Can an interface default method override a method of Object such as equals?'],
  },
  {
    id: 'iq-b-overload-override-output',
    moduleId: 'oop',
    lessonIds: ['o-polymorphism-types'],
    kind: 'output',
    difficulty: 'intermediate',
    prompt: 'What does this program print?',
    code: `public class Main {
    static class Animal {
        String sound() { return "..."; }
        static String kind() { return "animal"; }
    }

    static class Dog extends Animal {
        @Override String sound() { return "Woof"; }
        static String kind() { return "dog"; }
    }

    static String describe(Animal a) { return "describe(Animal)"; }
    static String describe(Dog d) { return "describe(Dog)"; }

    public static void main(String[] args) {
        Animal a = new Dog();
        System.out.println(describe(a));
        System.out.println(a.sound());
        System.out.println(a.kind());
    }
}`,
    options: [
      { id: 'a', text: 'describe(Animal)\nWoof\nanimal' },
      { id: 'b', text: 'describe(Dog)\nWoof\ndog' },
      { id: 'c', text: 'describe(Animal)\nWoof\ndog' },
      { id: 'd', text: 'describe(Dog)\n...\nanimal' },
    ],
    correctOptionId: 'a',
    explanation:
      'Overload resolution happens at compile time using the static type of the argument (Animal), so describe(Animal) is chosen. sound() is an overridden instance method, dispatched at runtime on the actual object (Dog): "Woof". Static methods are not overridden but hidden; a.kind() is bound at compile time to the static type Animal, so it prints "animal".',
    modelAnswer: 'Overloading and static methods use static (compile-time) binding on the declared type; overridden instance methods use dynamic binding on the runtime type. Output: describe(Animal), Woof, animal.',
    followUps: ['How would you make describe pick the Dog behaviour without instanceof?', 'Why do IDEs warn about calling a static method through an instance?'],
  },
  {
    id: 'iq-b-protected-access',
    moduleId: 'oop',
    lessonIds: ['o-access-modifiers'],
    kind: 'debugging',
    difficulty: 'advanced',
    prompt: '`Counter` is in package `app.child`, `Base` in package `app.core`. Which line fails to compile, and why?',
    code: `// file app/core/Base.java
package app.core;
public class Base {
    protected int count;
    int version;               // no modifier
}

// file app/child/Counter.java
package app.child;
import app.core.Base;
public class Counter extends Base {
    void merge(Counter c, Base b) {
        this.count += 1;       // line A
        this.count += c.count; // line B
        this.count += b.count; // line C
    }
}`,
    options: [
      { id: 'a', text: 'Line A: protected members are visible only inside the same package' },
      { id: 'b', text: 'Line B: a subclass may only access protected members of this' },
      { id: 'c', text: 'Line C: outside the package, a subclass may access a protected member only through a reference of its own type (or a subtype), not through a Base reference' },
      { id: 'd', text: 'None: protected means visible to all subclasses through any reference' },
    ],
    correctOptionId: 'c',
    explanation:
      'protected grants access to the same package and to subclasses, but from a different package the access must go through an expression whose type is the subclass (Counter) or one of its subclasses (JLS 6.6.2.1). b could be some unrelated subclass of Base, so b.count is rejected. version is package-private, so it would not be accessible from app.child at all, even via this.',
    modelAnswer: 'Line C fails: across packages, protected access is allowed only through references of the accessing subclass type. Package-private (no modifier) members such as version are not visible to subclasses in other packages at all.',
    followUps: ['Order private, package-private, protected and public from most to least restrictive.', 'Why is protected often considered part of a class\'s public API?'],
  },
  {
    id: 'iq-b-immutable-class',
    moduleId: 'oop',
    lessonIds: ['o-immutability'],
    kind: 'conceptual',
    difficulty: 'intermediate',
    prompt: 'How do you write a truly immutable class in Java, and why is it worth the effort? Are records automatically immutable?',
    rubric: [
      point('final-fields', 'private final fields, no setters', ['private final', 'final fields?', 'no setters?'], 'List the basics: private final fields and no setters/mutators.', 2),
      point('final-class', 'Prevent subclassing (final class or private constructor)', ['final class', 'class final', 'cannot be (sub)?classed', 'prevent (sub)?classing', 'private constructor', 'sealed'], 'Prevent subclasses from adding mutable state: make the class final.'),
      point('defensive', 'Defensive copies of mutable inputs and outputs (List.copyOf)', ['defensive(ly)? cop', 'list\\.copyof', 'copyof', 'unmodifiable', 'copy (the )?(input|list|array|collection)'], 'Copy mutable inputs in the constructor and do not hand out mutable internals (List.copyOf).', 2),
      point('records', 'Records are shallowly immutable: final fields but mutable components stay mutable', ['shallow', 'components?.{0,60}(mutable|still be (changed|modified))', 'not deeply'], 'Point out that records are only shallowly immutable: a List component can still be mutated unless copied.', 2),
      point('benefits', 'Benefits: thread safety without locks, safe sharing, safe map keys/caching', ['thread[- ]safe', 'no (locks|synchroni[sz]ation)', 'share (freely|safely)', 'hash ?(map )?keys?', 'cach'], 'Give the benefits: thread-safe sharing without locks, safe hash keys, easy reasoning and caching.', 2),
      point('with', 'Changes return new instances ("withers")', ['new instance', 'with[A-Z]?\\w*\\(', 'return(s)? a (new|modified) copy'], 'Explain how to "change" an immutable object: methods return a new instance.'),
    ],
    misconceptions: [
      { id: 'final-means-immutable', pattern: 'final (reference|variable|field) (makes|means) (the )?object (is )?immutable', correction: 'final only prevents reassigning the reference; the object it points to can still be mutated.' },
      { id: 'records-deep', pattern: 'records are (deeply|fully|completely) immutable', correction: 'Records are shallowly immutable: mutable components such as a List can still change unless defensively copied.' },
    ],
    modelAnswer:
      'Make the class final so subclasses cannot add mutable state, make all fields private final, provide no setters, and set everything in the constructor. For mutable inputs such as lists, arrays or Dates, make defensive copies in the constructor (List.copyOf) and never return the mutable internals, or return unmodifiable views or copies. "Changes" become methods that return a new instance, for example withPrice(newPrice). The benefits: immutable objects are thread-safe without locks and can be shared freely, they make safe HashMap keys because their hashCode never changes, they can be cached, and they are easy to reason about. Records give private final fields and no setters, but they are only shallowly immutable: a List component can still be mutated unless the compact constructor copies it with List.copyOf.',
    followUps: ['Why does final on a field matter for safe publication in the Java Memory Model?', 'How is String made immutable, and why does it matter for the string pool?'],
  },
  {
    id: 'iq-b-bigdecimal-money',
    moduleId: 'types',
    lessonIds: ['t-numbers-math'],
    kind: 'output',
    difficulty: 'intermediate',
    prompt: 'What does this program print?',
    code: `import java.math.BigDecimal;

public class Main {
    public static void main(String[] args) {
        System.out.println(0.1 + 0.2);
        System.out.println(BigDecimal.valueOf(0.1).add(BigDecimal.valueOf(0.2)));
        BigDecimal a = new BigDecimal("1.10");
        BigDecimal b = new BigDecimal("1.1");
        System.out.println(a.equals(b));
        System.out.println(a.compareTo(b));
    }
}`,
    options: [
      { id: 'a', text: '0.30000000000000004\n0.3\nfalse\n0' },
      { id: 'b', text: '0.3\n0.3\ntrue\n0' },
      { id: 'c', text: '0.30000000000000004\n0.30000000000000004\ntrue\n0' },
      { id: 'd', text: '0.30000000000000004\n0.3\ntrue\n1' },
    ],
    correctOptionId: 'a',
    explanation:
      'double is binary floating point, so 0.1 and 0.2 cannot be represented exactly and the sum prints 0.30000000000000004. BigDecimal.valueOf(double) uses the double\'s shortest decimal string ("0.1"), so the BigDecimal sum is exactly 0.3. BigDecimal.equals compares value and scale (1.10 has scale 2, 1.1 has scale 1), so it is false; compareTo ignores scale and returns 0. For money, use BigDecimal built from strings (or long cents), compare with compareTo and round explicitly with setScale and a RoundingMode.',
    modelAnswer: 'double sums show binary rounding error; BigDecimal from decimal strings is exact; equals includes scale while compareTo does not. Output: 0.30000000000000004, 0.3, false, 0.',
    followUps: ['What does new BigDecimal(0.1) print, and why?', 'Why can a HashSet<BigDecimal> contain both 1.10 and 1.1?'],
  },
  {
    id: 'iq-b-date-time-types',
    moduleId: 'types',
    lessonIds: ['t-date-time'],
    kind: 'conceptual',
    difficulty: 'intermediate',
    prompt: 'When would you use Instant, LocalDateTime and ZonedDateTime? A meeting is booked for 09:00 in New York every Monday: how do you store it?',
    rubric: [
      point('instant', 'Instant: a point on the UTC timeline (timestamps, logs, events)', ['instant.{0,80}(utc|timeline|point in time|moment|epoch|timestamp)'], 'Define Instant: an exact moment on the UTC timeline, ideal for timestamps and events.', 2),
      point('local', 'LocalDateTime: no zone or offset, not a moment by itself', ['localdatetime.{0,100}(no (time ?zone|zone|offset)|without (a )?(time ?zone|zone|offset)|not (a|an exact) (moment|instant|point))'], 'Define LocalDateTime: a date and wall-clock time with no zone, so it is not a moment on its own.', 2),
      point('zoned', 'ZonedDateTime: wall time + region zone rules (DST)', ['zoneddatetime.{0,100}(zone ?id|region|dst|daylight|rules|america/)'], 'Define ZonedDateTime: local date-time plus a ZoneId with its DST rules.', 2),
      point('future-local', 'Future recurring local events: store local time + zone id, compute instants later', ['(store|keep|save).{0,60}(local ?time|localdatetime|localtime|wall[- ]clock).{0,60}(zone|zoneid)', 'zone ?id.{0,40}(separately|alongside|with)', 'rules (may|can|might) change'], 'For a future local-time event store the local time plus the ZoneId and compute the instant when needed (rules can change).', 2),
      point('dst', 'DST gaps/overlaps and fixed offsets vs regions', ['dst', 'daylight saving', 'gap', 'overlap', 'offsetdatetime'], 'Mention DST transitions (gaps/overlaps) and the difference between a fixed offset and a region.'),
      point('clock', 'Store UTC/Instant for past events, convert at the edges; inject Clock for tests', ['convert (only )?at the (edges|boundar|ui)', 'store.{0,30}(utc|instant)', '\\bclock\\b'], 'Add the rule of thumb: store UTC instants for events, convert for display, inject a Clock for tests.'),
    ],
    misconceptions: [
      { id: 'local-is-utc', pattern: 'localdatetime (is|stores|represents) (in )?utc', correction: 'LocalDateTime has no zone at all; it is not UTC.' },
      { id: 'instant-has-zone', pattern: 'instant (has|stores|contains) (a )?(time ?zone|zone)', correction: 'Instant has no zone; it is a count of seconds and nanoseconds since the epoch on the UTC timeline.' },
    ],
    modelAnswer:
      'Instant is an exact point on the UTC timeline (seconds and nanos since the epoch); I use it for timestamps of things that happened: logs, events, created_at columns. LocalDateTime is a date and wall-clock time with no zone or offset, so it is not a moment by itself: 09:00 means different instants in Tokyo and New York. ZonedDateTime combines a local date-time with a ZoneId such as America/New_York and applies that region\'s rules, including DST; OffsetDateTime has only a fixed offset. For past events I store UTC instants and convert at the edges for display. For the recurring 09:00 New York meeting I store the LocalTime (or LocalDateTime) plus the zone id America/New_York, and compute each occurrence\'s instant with atZone when needed, because DST shifts the UTC offset between summer and winter and governments can change the rules. I also handle DST gaps and overlaps explicitly and inject a Clock so tests are deterministic.',
    followUps: ['What does ZonedDateTime do with 02:30 on a spring-forward day?', 'Why should you not use java.util.Date or SimpleDateFormat in new code?'],
  },
  {
    id: 'iq-b-annotation-retention',
    moduleId: 'types',
    lessonIds: ['t-annotations-reflection'],
    kind: 'output',
    difficulty: 'intermediate',
    prompt: 'A custom framework scans classes for `@Audit`, but it never finds any. What does this program print?',
    code: `import java.lang.annotation.*;

public class Main {
    @interface Audit {}

    @Retention(RetentionPolicy.RUNTIME)
    @interface Tracked {}

    @Audit @Tracked
    static class OrderService {}

    public static void main(String[] args) {
        Class<?> c = OrderService.class;
        System.out.println(c.isAnnotationPresent(Audit.class) + " " + c.isAnnotationPresent(Tracked.class));
    }
}`,
    options: [
      { id: 'a', text: 'true true' },
      { id: 'b', text: 'false true' },
      { id: 'c', text: 'false false' },
      { id: 'd', text: 'It does not compile: @Audit has no @Target' },
    ],
    correctOptionId: 'b',
    explanation:
      'Without @Retention, an annotation defaults to RetentionPolicy.CLASS: it is recorded in the class file but not available through reflection at runtime. Only RUNTIME-retained annotations are visible to isAnnotationPresent and getAnnotation. Omitting @Target is allowed; the annotation is then applicable in most declaration contexts.',
    modelAnswer: 'The default retention is CLASS, so @Audit is invisible to reflection; @Tracked is RUNTIME-retained. Output: false true. Fix: annotate Audit with @Retention(RetentionPolicy.RUNTIME).',
    followUps: ['When is SOURCE retention useful?', 'What does @Inherited change, and does it work for interfaces?'],
  },
];
