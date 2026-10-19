import type { CurriculumModule } from '@/types/curriculum';

export const springModule: CurriculumModule = {
  id: 'spring',
  order: 15,
  title: 'Spring Framework, Spring Boot, REST, JPA and Security',
  shortTitle: 'Spring Boot',
  summary: 'Dependency injection and Boot auto-configuration, production-quality REST APIs, persistence with JPA and transactions, and securing endpoints with Spring Security.',
  level: 'advanced',
  prerequisites: ['jdbc', 'testing'],
  lessons: [
    // -----------------------------------------------------------------------
    {
      id: 'sp-ioc-boot',
      moduleId: 'spring',
      title: 'Inversion of control, dependency injection and Spring Boot',
      summary: 'What a DI container does, constructor injection, bean scopes, auto-configuration, starters, profiles and externalised configuration.',
      estimatedMinutes: 40,
      difficulty: 'intermediate',
      prerequisites: ['o-solid', 'o-interfaces'],
      versionNotes: [
        { feature: 'Spring Boot 3.x / Spring Framework 6: Java 17 baseline, jakarta.* namespace (Jakarta EE 9+)', since: 17 },
        { feature: 'Spring Boot 4.0 / Spring Framework 7 (released November 2025)', since: 17, note: 'Keeps the Java 17 baseline; moves to Jakarta EE 11' },
        { feature: 'Virtual threads for request handling (spring.threads.virtual.enabled=true)', since: 21, note: 'Spring Boot 3.2+' },
      ],
      objectives: [
        'Explain inversion of control and why constructor injection is the default choice.',
        'Describe beans, the application context and the singleton and prototype scopes.',
        'Explain how auto-configuration and starters assemble an application, and how to override them.',
        'Use profiles and externalised configuration, including property precedence.',
      ],
      plainEnglish: `Normally an object creates the things it needs: \`new SmtpMailer()\` inside \`OrderService\`. **Inversion of control** flips that: the object just *declares* what it needs — usually as constructor parameters — and something else creates and hands those things in. That something is a **container**, and handing in dependencies is **dependency injection (DI)**.

Spring's container is the **application context**. Objects it manages are **beans**. You mark classes with \`@Service\`, \`@Repository\` or \`@Component\`, and Spring finds them, works out the order to create them in, and wires them together.

**Spring Boot** adds sensible defaults on top: add the web starter and you get an embedded web server, JSON conversion and error handling without writing configuration. You override only what you need, usually in \`application.yml\`.`,
      technical: `### The container
At start-up Spring scans for components (\`@Component\` and its specialisations \`@Service\`, \`@Repository\`, \`@Controller\`), reads \`@Configuration\` classes with \`@Bean\` methods, builds a graph of **bean definitions**, and instantiates beans in dependency order. A class with a single constructor needs no \`@Autowired\`: Spring injects its parameters. When several beans match a type, choose with \`@Primary\` or \`@Qualifier\`.

### Prefer constructor injection
- Dependencies can be \`final\`; the object is complete and immutable after construction.
- Required dependencies are explicit; a unit test simply calls the constructor with fakes — no container needed.
- A constructor with many parameters is a visible sign the class does too much.
Field injection (\`@Autowired\` on a private field) hides dependencies and requires reflection or a container to test. Circular dependencies fail at start-up with constructor injection (they are prohibited by default since Boot 2.6) — a design smell to fix, not to work around.

### Scopes
- **singleton** (default): one instance per context, shared by all threads, so it must be stateless or thread-safe.
- **prototype**: a new instance each time it is requested. Injected into a singleton, it is requested **once**; use \`ObjectProvider<T>\` to get a fresh one per use.
- Web scopes: **request**, **session**, **application** (injected through scoped proxies).

### Spring Boot
- \`@SpringBootApplication\` = \`@SpringBootConfiguration\` (a \`@Configuration\`) + \`@EnableAutoConfiguration\` + \`@ComponentScan\` of its package and sub-packages.
- **Starters** (\`spring-boot-starter-web\`, \`-data-jpa\`, \`-security\`, \`-actuator\`, \`-validation\`) are curated dependency sets with versions managed by Boot.
- **Auto-configuration** classes (listed in \`META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports\`) are guarded by conditions such as \`@ConditionalOnClass\`, \`@ConditionalOnProperty\` and \`@ConditionalOnMissingBean\`. Define your own bean of the same type and the default **backs off**. Run with \`--debug\` (or the actuator \`conditions\` endpoint) to see which conditions matched.

### Externalised configuration and profiles
Properties come from many sources; higher ones win. The most important order, from highest: command-line arguments (\`--server.port=7070\`), Java system properties, OS environment variables (\`SERVER_PORT\`, via relaxed binding), profile-specific files (\`application-prod.yml\`), then \`application.yml\`. Activate profiles with \`spring.profiles.active=prod\`; \`@Profile("prod")\` limits a bean to a profile.

Bind groups of settings to a typed, validated object with \`@ConfigurationProperties\` (records work via constructor binding) instead of scattering \`@Value\` strings. Keep secrets out of the repository: inject them through environment variables or a secret store.

### Versions
Spring Boot 3.x (Spring Framework 6) requires Java 17+ and uses the \`jakarta.*\` packages (\`jakarta.persistence\`, \`jakarta.validation\`, \`jakarta.servlet\`) instead of \`javax.*\`. Spring Boot 4.0 (November 2025) is built on Spring Framework 7 and keeps the Java 17 baseline.`,
      whyItExists: `Wiring objects by hand works for ten classes but not for hundreds, with transactions, security, metrics and configuration that cut across them. A container centralises object creation, makes components replaceable (a fake in tests, a different implementation per environment) and lets the framework wrap beans with cross-cutting behaviour through proxies. Boot removes most of the remaining set-up by choosing proven defaults.`,
      whenToUse: [
        'Use constructor injection for every required dependency.',
        'Use @ConfigurationProperties records for groups of related settings.',
        'Use profiles for environment differences (local, test, prod) and environment variables for secrets.',
        'Define your own bean to override an auto-configured default.',
      ],
      whenNotToUse: [
        'Do not use field injection in production code.',
        'Do not keep mutable per-request state in singleton beans.',
        'Do not put secrets in application.yml committed to the repository.',
        'Do not create beans with new inside other beans — the container will not manage, proxy or inject them.',
      ],
      examples: [
        {
          id: 'tiny-container',
          title: 'A tiny DI container in plain Java',
          runnable: true,
          code: `import java.lang.reflect.Constructor;
import java.util.*;

public class Main {
    interface Clock { String now(); }
    interface Notifier { void send(String to, String message); }

    static class FixedClock implements Clock {
        public String now() { return "2025-01-01T09:00"; }
    }

    static class ConsoleNotifier implements Notifier {
        public void send(String to, String message) { System.out.println("to " + to + ": " + message); }
    }

    static class OrderService {
        private final Notifier notifier;
        private final Clock clock;

        OrderService(Notifier notifier, Clock clock) {       // dependencies declared, not created
            this.notifier = notifier;
            this.clock = clock;
        }

        void placeOrder(String customer) {
            notifier.send(customer, "order placed at " + clock.now());
        }
    }

    static class Container {
        private final Map<Class<?>, Class<?>> bindings = new HashMap<>();
        private final Map<Class<?>, Object> singletons = new HashMap<>();

        <T> void bind(Class<T> type, Class<? extends T> implementation) {
            bindings.put(type, implementation);
        }

        <T> T get(Class<T> type) {
            Object existing = singletons.get(type);
            if (existing != null) return type.cast(existing);              // singleton scope
            Class<?> impl = bindings.getOrDefault(type, type);
            Constructor<?> ctor = impl.getDeclaredConstructors()[0];
            Object[] args = new Object[ctor.getParameterCount()];
            for (int i = 0; i < args.length; i++) {
                args[i] = get(ctor.getParameterTypes()[i]);               // resolve recursively
            }
            try {
                ctor.setAccessible(true);
                Object instance = ctor.newInstance(args);
                System.out.println("created " + impl.getSimpleName());
                singletons.put(type, instance);
                return type.cast(instance);
            } catch (ReflectiveOperationException e) {
                throw new IllegalStateException("cannot create " + impl.getName(), e);
            }
        }
    }

    public static void main(String[] args) {
        Container container = new Container();
        container.bind(Notifier.class, ConsoleNotifier.class);
        container.bind(Clock.class, FixedClock.class);

        OrderService service = container.get(OrderService.class);
        service.placeOrder("ana@example.com");
        System.out.println("same instance: " + (service == container.get(OrderService.class)));
    }
}`,
          expectedOutput: `created ConsoleNotifier
created FixedClock
created OrderService
to ana@example.com: order placed at 2025-01-01T09:00
same instance: true`,
          explanation: 'This is the core idea of Spring\'s container in about 30 lines: map interfaces to implementations, read constructor parameter types, build dependencies first, and cache singletons. Spring adds component scanning, qualifiers, scopes, lifecycle callbacks, cycle detection and proxies on top.',
        },
        {
          id: 'scopes',
          title: 'Singleton vs prototype: the "injected once" trap',
          runnable: true,
          code: `import java.util.function.Supplier;

public class Main {
    static int created = 0;

    static class ShoppingCart {
        final int id = ++created;
    }

    static class CheckoutService {                       // a singleton bean
        private final ShoppingCart cart;                 // prototype injected once
        private final Supplier<ShoppingCart> carts;      // like ObjectProvider<ShoppingCart>

        CheckoutService(ShoppingCart cart, Supplier<ShoppingCart> carts) {
            this.cart = cart;
            this.carts = carts;
        }

        int injectedCartId() { return cart.id; }
        int freshCartId() { return carts.get().id; }
    }

    public static void main(String[] args) {
        Supplier<ShoppingCart> prototype = ShoppingCart::new;     // new instance per lookup
        CheckoutService singleton = new CheckoutService(prototype.get(), prototype);

        for (int request = 1; request <= 3; request++) {
            System.out.println("request " + request + ": injected cart " + singleton.injectedCartId()
                + ", fresh cart " + singleton.freshCartId());
        }
    }
}`,
          expectedOutput: `request 1: injected cart 1, fresh cart 2
request 2: injected cart 1, fresh cart 3
request 3: injected cart 1, fresh cart 4`,
          explanation: 'A singleton is constructed once, so a prototype passed to its constructor is also created once and shared by every request. Looking the bean up through a provider at the moment of use returns a new instance each time.',
        },
        {
          id: 'boot-app',
          title: 'The same wiring in Spring Boot (not runnable here)',
          runnable: false,
          code: `// src/main/java/com/example/shop/ShopApplication.java
package com.example.shop;

import java.time.Clock;
import java.time.Duration;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@SpringBootApplication              // @Configuration + @EnableAutoConfiguration + @ComponentScan
@ConfigurationPropertiesScan
public class ShopApplication {
    public static void main(String[] args) {
        SpringApplication.run(ShopApplication.class, args);
    }
}

// Typed, validated configuration bound from "shop.*" properties
@ConfigurationProperties(prefix = "shop")
record ShopProperties(String supportEmail, Duration paymentTimeout) {}

interface Notifier { void send(String to, String message); }

@Service
class OrderService {
    private final Notifier notifier;
    private final Clock clock;
    private final ShopProperties props;

    OrderService(Notifier notifier, Clock clock, ShopProperties props) {   // single constructor: no @Autowired needed
        this.notifier = notifier;
        this.clock = clock;
        this.props = props;
    }
}

@Configuration
class InfrastructureConfig {
    @Bean
    Clock clock() { return Clock.systemUTC(); }

    @Bean
    @Profile("local")
    Notifier consoleNotifier() { return (to, msg) -> System.out.println(to + ": " + msg); }

    @Bean
    @Profile("!local")
    Notifier smtpNotifier(ShopProperties props) { return new SmtpNotifier(props.supportEmail()); }
}

/* src/main/resources/application.yml
shop:
  support-email: support@example.com
  payment-timeout: 5s
spring:
  profiles:
    active: local
---
Override at deploy time without rebuilding:
  SHOP_SUPPORTEMAIL=help@example.com java -jar shop.jar --spring.profiles.active=prod
*/`,
          explanation: 'SmtpNotifier stands for your own implementation. Relaxed binding maps support-email in YAML, SHOP_SUPPORTEMAIL in the environment and supportEmail in the record to the same property. Exactly one Notifier bean exists per profile, so OrderService gets an unambiguous dependency.',
        },
      ],
      walkthrough: {
        exampleId: 'tiny-container',
        steps: [
          { lines: [5, 14], text: 'Two interfaces and their implementations. Nothing here knows about the container.' },
          { lines: [16, 28], text: 'OrderService declares its dependencies as constructor parameters and stores them in final fields. It never calls new on a collaborator — that is inversion of control.' },
          { lines: [30, 36], text: 'The container keeps two maps: which implementation to use for each type (like @Service on a class implementing an interface) and the singletons already built.' },
          { lines: [38, 46], text: 'get returns a cached singleton if one exists; otherwise it picks the implementation, reads its constructor\'s parameter types and resolves each one recursively, so dependencies are built first.' },
          { lines: [47, 55], text: 'Reflection invokes the constructor with the resolved arguments, and the result is cached. A real container also detects cycles here instead of recursing forever.' },
          { lines: [59, 66], text: 'Bindings play the role of configuration. Asking for OrderService builds the whole graph, and asking again returns the same instance — singleton scope.' },
        ],
      },
      realWorld: {
        title: 'One build, three environments',
        scenario: `A team built separate JARs for test and production because the database URL and mail server were hard-coded in a \`Config\` class. A wrong build reached production and sent test e-mails to customers.

They moved every environment difference into \`@ConfigurationProperties\` records with \`@Validated\` constraints, used a \`local\` profile with an in-memory notifier for development, and supplied production secrets as environment variables from the platform's secret store. One immutable artifact was promoted through test, staging and production, and the application refused to start if a required property was missing — failing at deploy time instead of at 3 a.m.`,
      },
      commonMistakes: [
        {
          mistake: 'Using @Autowired on private fields.',
          why: 'Dependencies are hidden, fields cannot be final, and tests need reflection or a full Spring context.',
          fix: 'Use a constructor (Lombok\'s @RequiredArgsConstructor or a record-style constructor is fine).',
          code: `@Service
class ReportService {
    private final ReportRepository reports;
    ReportService(ReportRepository reports) { this.reports = reports; }
}`,
        },
        {
          mistake: 'Storing per-request data in a field of a singleton bean.',
          why: 'Every concurrent request shares the same instance, so one user can see another user\'s data.',
          fix: 'Keep state in local variables or method parameters, or use a request-scoped bean.',
        },
        {
          mistake: 'Importing javax.persistence or javax.validation in a Spring Boot 3 or 4 project.',
          why: 'Boot 3+ uses Jakarta EE, whose packages are jakarta.*; the javax classes are not on the classpath or are ignored.',
          fix: 'Use jakarta.persistence.*, jakarta.validation.* and jakarta.servlet.*.',
        },
        {
          mistake: 'Fighting auto-configuration with exclusions and hacks.',
          why: 'Most defaults back off automatically when you define your own bean of the same type.',
          fix: 'Declare your bean, or set the documented property; use --debug to read the conditions report.',
        },
      ],
      checks: [
        {
          id: 'sp1-c1',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'Why is constructor injection preferred over field injection?',
          options: [
            { id: 'a', text: 'It makes beans start faster' },
            { id: 'b', text: 'Dependencies are explicit and final, the object is complete after construction, and tests can call the constructor without a container' },
            { id: 'c', text: 'It is the only way Spring can inject interfaces' },
            { id: 'd', text: 'It allows circular dependencies' },
          ],
          correctOptionId: 'b',
          explanation: 'Constructor injection gives immutable, fully initialised objects with visible requirements. Spring can inject interfaces into fields too, and circular constructor dependencies are rejected at start-up.',
        },
        {
          id: 'sp1-c2',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'This models a singleton that receives a prototype-scoped Cart in its constructor, compared with looking Carts up through a provider. What does it print?',
          code: `import java.util.function.Supplier;

public class Main {
    static int created = 0;

    record Cart(int id) {}

    static Cart newCart() { return new Cart(++created); }

    static class Service {
        final Cart cart = newCart();
        Cart current() { return cart; }
    }

    public static void main(String[] args) {
        Service s = new Service();
        Supplier<Cart> provider = Main::newCart;
        System.out.println(s.current().id() + " " + s.current().id() + " "
            + provider.get().id() + " " + provider.get().id());
    }
}`,
          options: [
            { id: 'a', text: '1 2 3 4' },
            { id: 'b', text: '1 1 2 3' },
            { id: 'c', text: '1 1 1 1' },
            { id: 'd', text: '0 0 1 2' },
          ],
          correctOptionId: 'b',
          explanation: 'The Service (singleton) captures one Cart when it is constructed, so it always returns cart 1. Each provider.get() creates a new Cart. This is why Spring offers ObjectProvider for prototype beans used inside singletons.',
        },
        {
          id: 'sp1-c3',
          kind: 'multi-select',
          dimension: 'conceptual',
          prompt: 'Which annotations does @SpringBootApplication combine? Select all that apply.',
          options: [
            { id: 'a', text: '@SpringBootConfiguration (a specialised @Configuration)' },
            { id: 'b', text: '@EnableAutoConfiguration' },
            { id: 'c', text: '@ComponentScan' },
            { id: 'd', text: '@EnableWebMvc' },
            { id: 'e', text: '@Transactional' },
          ],
          correctOptionIds: ['a', 'b', 'c'],
          explanation: '@EnableWebMvc is not included — adding it switches off Boot\'s MVC auto-configuration, a common surprise. @Transactional is a method/class annotation for transaction boundaries.',
        },
        {
          id: 'sp1-c4',
          kind: 'mcq',
          dimension: 'debugging',
          prompt: 'application.yml sets server.port: 8080. The app is started with the environment variable SERVER_PORT=9090 and the argument --server.port=7070. Which port does it listen on?',
          options: [
            { id: 'a', text: '8080, because the file is packaged with the app' },
            { id: 'b', text: '9090, because environment variables always win' },
            { id: 'c', text: '7070, because command-line arguments have higher precedence than environment variables and config files' },
            { id: 'd', text: 'Start-up fails because of conflicting values' },
          ],
          correctOptionId: 'c',
          explanation: 'Boot merges property sources by precedence: command-line arguments, then system properties, then environment variables, then profile-specific and default config files.',
        },
        {
          id: 'sp1-c5',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'Spring Boot auto-configures a DataSource. You define your own @Bean DataSource. What happens?',
          options: [
            { id: 'a', text: 'Start-up fails with two DataSource beans' },
            { id: 'b', text: 'The auto-configured DataSource backs off because it is guarded by @ConditionalOnMissingBean' },
            { id: 'c', text: 'Both are created and Spring picks one at random' },
            { id: 'd', text: 'Your bean is ignored' },
          ],
          correctOptionId: 'b',
          explanation: 'Auto-configuration is designed to yield: its beans are conditional on you not having defined one. The --debug conditions report shows the decision.',
        },
        {
          id: 'sp1-c6',
          kind: 'mcq',
          dimension: 'debugging',
          prompt: 'After upgrading from Spring Boot 2.7 to 3.x, entities fail to compile with "package javax.persistence does not exist". What is the cause?',
          options: [
            { id: 'a', text: 'JPA was removed from Spring Boot 3' },
            { id: 'b', text: 'Boot 3 is built on Jakarta EE 9+, which renamed the packages from javax.* to jakarta.*' },
            { id: 'c', text: 'The project must be compiled with Java 8' },
            { id: 'd', text: 'Hibernate no longer supports annotations' },
          ],
          correctOptionId: 'b',
          explanation: 'Replace javax.persistence, javax.validation and javax.servlet imports with their jakarta equivalents. Boot 3 and Boot 4 both require Java 17 or newer.',
        },
      ],
      challengeIds: [],
      masteryCriteria: [
        'Explain IoC and DI and wire a small object graph by hand.',
        'Justify constructor injection and spot singleton state bugs.',
        'Explain auto-configuration conditions, starters and how to override a default.',
        'Configure an application per environment with profiles, typed properties and environment variables.',
      ],
      relatedLessonIds: ['o-solid', 'o-interfaces', 'sp-rest', 'sp-data-tx'],
      revision: [
        { id: 'r1', question: 'What is inversion of control?', answer: 'Objects declare their dependencies and an external container creates and supplies them, instead of each object constructing its own collaborators.' },
        { id: 'r2', question: 'What is the default bean scope and what does it imply?', answer: 'Singleton: one shared instance per application context, so the bean must be stateless or thread-safe.' },
        { id: 'r3', question: 'How does auto-configuration avoid clashing with your beans?', answer: 'Auto-configuration classes are conditional (@ConditionalOnClass, @ConditionalOnProperty, @ConditionalOnMissingBean), so they back off when you define your own bean.' },
        { id: 'r4', question: 'Which Java version and namespace do Spring Boot 3 and 4 require?', answer: 'Java 17 or newer, and the jakarta.* namespace from Jakarta EE.' },
      ],
    },
    // -----------------------------------------------------------------------
    {
      id: 'sp-rest',
      moduleId: 'spring',
      title: 'REST APIs: controllers, validation and errors',
      summary: 'Request mapping, DTOs, Bean Validation, status codes with ResponseEntity, ProblemDetail error responses, pagination and idempotency.',
      estimatedMinutes: 45,
      difficulty: 'intermediate',
      prerequisites: ['sp-ioc-boot', 'e-design'],
      versionNotes: [
        { feature: 'ProblemDetail and ErrorResponse (RFC 7807, now RFC 9457) in Spring Framework 6', since: 17, note: 'Spring Boot 3+' },
        { feature: 'Records as request and response DTOs', since: 16 },
      ],
      objectives: [
        'Map HTTP requests to controller methods with path variables, query parameters and JSON bodies.',
        'Validate input with jakarta.validation constraints and @Valid.',
        'Return correct status codes and headers with ResponseEntity.',
        'Produce consistent RFC 9457 error responses with @RestControllerAdvice and ProblemDetail.',
        'Design paginated and idempotent endpoints.',
      ],
      plainEnglish: `A REST API exposes **resources** (books, orders) at URLs and uses HTTP methods to act on them: GET reads, POST creates, PUT replaces, PATCH updates part, DELETE removes. The **status code** tells the client what happened: 200 OK, 201 Created, 204 No Content, 400 Bad Request, 404 Not Found, 409 Conflict.

In Spring, a \`@RestController\` class has methods mapped to URLs. Spring turns incoming JSON into Java objects, calls your method, and turns the return value back into JSON. Your job is to validate input, return the right status, and make errors predictable for the client.`,
      technical: `### Mapping
- \`@RestController\` = \`@Controller\` + \`@ResponseBody\`: return values are serialised (JSON via Jackson).
- \`@RequestMapping("/api/books")\` on the class; \`@GetMapping("/{id}")\`, \`@PostMapping\`, \`@PutMapping\`, \`@PatchMapping\`, \`@DeleteMapping\` on methods.
- \`@PathVariable\` for identifiers, \`@RequestParam\` for filters and options, \`@RequestBody\` for the JSON body, \`@RequestHeader\` for headers such as \`Idempotency-Key\`.
- Use dedicated request/response **DTOs** (records are ideal) rather than exposing JPA entities: entities leak internal fields, invite over-posting (clients setting fields they should not), and trigger lazy-loading surprises during serialisation.

### Validation
Add \`spring-boot-starter-validation\` and annotate DTO components with \`jakarta.validation.constraints\` (\`@NotBlank\`, \`@Size\`, \`@Email\`, \`@Positive\`, \`@Min\`, \`@Pattern\`). \`@Valid @RequestBody\` triggers validation; failures raise \`MethodArgumentNotValidException\`, which Spring maps to **400**. Validate business rules (e.g. "stock available") in the service layer and report them as 409 or 422.

### Status codes with ResponseEntity
- Create: **201 Created** with a \`Location\` header: \`ResponseEntity.created(uri).body(dto)\`.
- Delete or update with no body: **204** via \`ResponseEntity.noContent().build()\`.
- Missing resource: **404**; invalid input: **400**; state conflict (duplicate, version mismatch): **409**; unauthenticated: **401**; not allowed: **403**.
- Never return 200 with an \`"error"\` field in the body — clients, proxies and monitoring rely on the status.

### Errors with ProblemDetail (RFC 9457)
RFC 9457 (which obsoletes RFC 7807) defines \`application/problem+json\` with \`type\`, \`title\`, \`status\`, \`detail\` and \`instance\`, plus custom extension members. Spring Framework 6 models it as \`ProblemDetail\`. Centralise mapping in a \`@RestControllerAdvice\` with \`@ExceptionHandler\` methods so every endpoint fails the same way, and set \`spring.mvc.problemdetails.enabled=true\` so Spring's own exceptions (validation, unsupported media type) use the same format. Never return stack traces or SQL errors to clients; log them server-side with a correlation id.

### Pagination
Never return unbounded lists. Accept \`page\`, \`size\` and \`sort\` (Spring Data's \`Pageable\` parameter binds \`?page=0&size=20&sort=title,asc\`), cap the maximum size, and return a stable response shape (items plus page metadata) instead of serialising Spring's internal \`PageImpl\`. For very large or fast-changing tables, prefer **keyset (cursor) pagination** (\`WHERE id > :lastSeen ORDER BY id LIMIT :size\`), because deep offsets get slower and can skip or repeat rows when data changes.

### Idempotency
GET, PUT, DELETE (and HEAD, OPTIONS) are idempotent by definition: repeating them has the same effect as doing them once. POST is not. Networks time out, and clients retry; a retried "create payment" must not charge twice. The common pattern is an **Idempotency-Key** header: the server stores the key with the request fingerprint and the response, and returns the stored response for a retry with the same key. Store keys durably (a table with a unique constraint) with an expiry.`,
      whyItExists: `An API is a contract with clients you do not control. Consistent status codes, validated input and machine-readable errors let clients handle failures without guessing, and pagination and idempotency keep the system safe under real-world load and unreliable networks.`,
      whenToUse: [
        'Use records as request and response DTOs with jakarta.validation annotations.',
        'Return ResponseEntity when you need a specific status or headers; return the DTO directly for plain 200 responses.',
        'Map exceptions to ProblemDetail in one @RestControllerAdvice.',
        'Paginate every collection endpoint and require an Idempotency-Key for non-idempotent operations with side effects such as payments.',
      ],
      whenNotToUse: [
        'Do not expose JPA entities directly as request or response bodies.',
        'Do not catch exceptions in every controller method to build error responses by hand.',
        'Do not use GET for operations that change state.',
        'Do not leak exception messages from the database or stack traces in responses.',
      ],
      examples: [
        {
          id: 'idempotency',
          title: 'Idempotency keys make retries safe',
          runnable: true,
          code: `import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class Main {
    record PaymentRequest(String account, long amountCents) {}
    record Response(int status, String body) {}

    static final AtomicInteger nextId = new AtomicInteger(1000);
    static final AtomicLong charged = new AtomicLong();
    static final Map<String, PaymentRequest> requestsByKey = new ConcurrentHashMap<>();
    static final Map<String, Response> responsesByKey = new ConcurrentHashMap<>();

    // POST /payments with an Idempotency-Key header
    static Response createPayment(String idempotencyKey, PaymentRequest request) {
        if (idempotencyKey == null) return new Response(400, "Idempotency-Key header required");
        PaymentRequest previous = requestsByKey.putIfAbsent(idempotencyKey, request);
        if (previous != null && !previous.equals(request)) {
            return new Response(422, "key reused with a different payload");
        }
        return responsesByKey.computeIfAbsent(idempotencyKey, key -> {
            charged.addAndGet(request.amountCents());              // the side effect runs once per key
            return new Response(201, "payment " + nextId.getAndIncrement());
        });
    }

    public static void main(String[] args) {
        PaymentRequest pay = new PaymentRequest("acc-1", 2_500);
        System.out.println(createPayment("k-1", pay));
        System.out.println(createPayment("k-1", pay));                  // retry after a timeout
        System.out.println(createPayment("k-1", new PaymentRequest("acc-1", 9_900)));
        System.out.println(createPayment("k-2", pay));                  // a genuinely new payment
        System.out.println(createPayment(null, pay));
        System.out.println("total charged: " + charged.get());
    }
}`,
          expectedOutput: `Response[status=201, body=payment 1000]
Response[status=201, body=payment 1000]
Response[status=422, body=key reused with a different payload]
Response[status=201, body=payment 1001]
Response[status=400, body=Idempotency-Key header required]
total charged: 5000`,
          explanation: 'In production the two maps are a database table with a unique constraint on the key, so concurrent retries on different instances cannot both charge, and entries expire after a retention period.',
        },
        {
          id: 'validation-problem',
          title: 'Validation errors as a problem response',
          runnable: true,
          code: `import java.util.*;

public class Main {
    record CreateBookRequest(String title, String isbn, int pages) {}

    static List<String> validate(CreateBookRequest r) {
        List<String> errors = new ArrayList<>();
        if (r.title() == null || r.title().isBlank()) errors.add("title: must not be blank");
        if (r.isbn() == null || r.isbn().length() != 13 || !r.isbn().chars().allMatch(Character::isDigit)) {
            errors.add("isbn: must be 13 digits");
        }
        if (r.pages() <= 0) errors.add("pages: must be greater than 0");
        return errors;
    }

    static void handle(CreateBookRequest r) {
        List<String> errors = validate(r);
        if (errors.isEmpty()) {
            System.out.println("201 Created, Location: /api/books/" + r.isbn());
            return;
        }
        System.out.println("400 Bad Request, Content-Type: application/problem+json");
        System.out.println("  title:  Bad Request");
        System.out.println("  status: 400");
        System.out.println("  detail: " + errors.size() + " invalid field(s)");
        errors.forEach(e -> System.out.println("  error:  " + e));
    }

    public static void main(String[] args) {
        handle(new CreateBookRequest("Effective Java", "9780134685991", 412));
        handle(new CreateBookRequest(" ", "978-0134685991", 0));
    }
}`,
          expectedOutput: `201 Created, Location: /api/books/9780134685991
400 Bad Request, Content-Type: application/problem+json
  title:  Bad Request
  status: 400
  detail: 3 invalid field(s)
  error:  title: must not be blank
  error:  isbn: must be 13 digits
  error:  pages: must be greater than 0`,
          explanation: 'Bean Validation does this declaratively, but the contract is the same: report every invalid field at once, with a 400 status and a machine-readable body, so the client can fix all problems in one round trip.',
        },
        {
          id: 'book-controller',
          title: 'A Spring REST controller with validation and ProblemDetail (not runnable here)',
          runnable: false,
          code: `package com.example.catalog;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.net.URI;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

record CreateBookRequest(@NotBlank @Size(max = 200) String title,
                         @NotBlank @Size(min = 13, max = 13) String isbn,
                         @Positive int pages) {}

record BookResponse(long id, String title, String isbn, int pages) {}

record PageResponse<T>(List<T> items, int page, int size, long totalItems) {
    static <T> PageResponse<T> of(Page<T> page) {
        return new PageResponse<>(page.getContent(), page.getNumber(), page.getSize(), page.getTotalElements());
    }
}

@RestController
@RequestMapping("/api/books")
class BookController {
    private final BookService books;

    BookController(BookService books) { this.books = books; }

    @GetMapping("/{id}")
    BookResponse get(@PathVariable long id) {
        return books.find(id);                       // throws BookNotFoundException
    }

    @GetMapping                                      // GET /api/books?author=bloch&page=0&size=20&sort=title,asc
    PageResponse<BookResponse> list(@RequestParam(required = false) String author, Pageable pageable) {
        return PageResponse.of(books.search(author, pageable));
    }

    @PostMapping
    ResponseEntity<BookResponse> create(@Valid @RequestBody CreateBookRequest request) {
        BookResponse created = books.create(request);
        return ResponseEntity.created(URI.create("/api/books/" + created.id())).body(created);
    }

    @DeleteMapping("/{id}")
    ResponseEntity<Void> delete(@PathVariable long id) {
        books.delete(id);
        return ResponseEntity.noContent().build();
    }
}

@RestControllerAdvice
class ApiErrorHandler {
    @ExceptionHandler(BookNotFoundException.class)
    ProblemDetail notFound(BookNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Book not found");
        problem.setType(URI.create("https://api.example.com/problems/book-not-found"));
        return problem;
    }

    @ExceptionHandler(DuplicateIsbnException.class)
    ProblemDetail conflict(DuplicateIsbnException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, ex.getMessage());
        problem.setProperty("isbn", ex.isbn());      // extension member
        return problem;
    }
}`,
          explanation: 'BookService, BookNotFoundException and DuplicateIsbnException are application classes. Invalid bodies never reach create: @Valid fails first and Spring answers 400. With spring.mvc.problemdetails.enabled=true, that 400 uses the same problem+json format as the custom handlers.',
        },
      ],
      walkthrough: {
        exampleId: 'idempotency',
        steps: [
          { lines: [7, 8], text: 'Records model the request body and the HTTP response (status plus body).' },
          { lines: [10, 13], text: 'Thread-safe stores: one remembers which request each key was first used with, the other the response that was returned. Atomic counters stand in for the database sequence and the payment provider.' },
          { lines: [16, 17], text: 'A missing key is a client error (400): the server cannot make a retry safe without it.' },
          { lines: [18, 21], text: 'putIfAbsent records the first payload for the key. Reusing a key with a different payload is a client bug, so it is rejected instead of silently returning the old result.' },
          { lines: [22, 25], text: 'computeIfAbsent runs the side effect at most once per key, atomically. A retry gets the stored response — the same 201 and the same payment id.' },
          { lines: [28, 35], text: 'The retry returns payment 1000 again, the conflicting reuse gets 422, and a new key creates payment 1001. Only two charges of 2,500 happen in total.' },
        ],
      },
      realWorld: {
        title: 'The double-charge incident',
        scenario: `A mobile app's checkout called \`POST /payments\`. During a mobile network blip, the server processed a payment but the response was lost; the app's HTTP client retried automatically and the customer was charged twice. Support tickets spiked on every bad-network day.

The team made the app generate a UUID per checkout attempt and send it as \`Idempotency-Key\`. The API stored the key, a hash of the body and the response in a table with a unique constraint, inside the same transaction as the payment record. Retries now return the original 201. They also standardised every error as ProblemDetail with a \`type\` URI, so the app could tell "card declined" (show a message) from "validation failed" (fix the form) from 503 (retry later) without parsing English text.`,
      },
      commonMistakes: [
        {
          mistake: 'Returning JPA entities from controllers.',
          why: 'Internal fields leak, lazy associations trigger extra queries or LazyInitializationException during serialisation, and clients can over-post fields they should not set.',
          fix: 'Map to response DTOs (records) and accept dedicated request DTOs.',
        },
        {
          mistake: 'Forgetting @Valid on the @RequestBody parameter.',
          why: 'The constraint annotations on the DTO are never checked, so invalid data reaches the service.',
          fix: 'Annotate the parameter with @Valid (and add spring-boot-starter-validation).',
        },
        {
          mistake: 'Returning 200 OK with an error message in the body.',
          why: 'Clients, caches and monitoring treat it as success; retries and alerts do not fire.',
          fix: 'Use the correct 4xx/5xx status and a ProblemDetail body.',
        },
        {
          mistake: 'Unbounded list endpoints such as GET /orders returning every row.',
          why: 'Works in development, then exhausts memory and times out as data grows.',
          fix: 'Paginate with a capped page size; consider keyset pagination for large tables.',
        },
      ],
      checks: [
        {
          id: 'sp2-c1',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'A POST /api/books request successfully creates a book. What is the most appropriate response?',
          options: [
            { id: 'a', text: '200 OK with an empty body' },
            { id: 'b', text: '201 Created with a Location header pointing to the new book, and the created representation' },
            { id: 'c', text: '204 No Content' },
            { id: 'd', text: '302 Found redirecting to the list page' },
          ],
          correctOptionId: 'b',
          explanation: 'ResponseEntity.created(uri).body(dto) sets 201 and Location in one call.',
        },
        {
          id: 'sp2-c2',
          kind: 'mcq',
          dimension: 'debugging',
          prompt: 'A client sends a body where a @NotBlank field is empty, to a method declared as `create(@Valid @RequestBody CreateBookRequest req)`. What happens by default?',
          options: [
            { id: 'a', text: 'The method runs and req.title() is ""' },
            { id: 'b', text: 'MethodArgumentNotValidException is thrown before the method runs and the client receives 400 Bad Request' },
            { id: 'c', text: 'The client receives 500 Internal Server Error' },
            { id: 'd', text: 'The client receives 422 with no body' },
          ],
          correctOptionId: 'b',
          explanation: 'Validation happens during argument resolution. Spring maps the exception to 400; with problem details enabled the body is application/problem+json.',
        },
        {
          id: 'sp2-c3',
          kind: 'multi-select',
          dimension: 'interview',
          prompt: 'Which HTTP methods are idempotent by definition? Select all that apply.',
          options: [
            { id: 'a', text: 'GET' },
            { id: 'b', text: 'POST' },
            { id: 'c', text: 'PUT' },
            { id: 'd', text: 'DELETE' },
            { id: 'e', text: 'PATCH' },
          ],
          correctOptionIds: ['a', 'c', 'd'],
          explanation: 'Repeating GET, PUT (replace with the same representation) or DELETE leaves the server in the same state. POST and PATCH are not guaranteed to be idempotent, so retries need an idempotency key or careful design.',
        },
        {
          id: 'sp2-c4',
          kind: 'predict-output',
          dimension: 'conceptual',
          prompt: 'This is the core of an idempotency store. What does it print?',
          code: `import java.util.*;

public class Main {
    static int sideEffects = 0;

    public static void main(String[] args) {
        Map<String, String> byKey = new HashMap<>();
        for (String key : List.of("a", "a", "b", "a")) {
            String result = byKey.computeIfAbsent(key, k -> "order-" + (++sideEffects));
            System.out.print(result + " ");
        }
        System.out.println(sideEffects);
    }
}`,
          options: [
            { id: 'a', text: 'order-1 order-2 order-3 order-4 4' },
            { id: 'b', text: 'order-1 order-1 order-2 order-1 2' },
            { id: 'c', text: 'order-1 order-1 order-2 order-2 2' },
            { id: 'd', text: 'order-1 order-1 order-2 order-1 4' },
          ],
          correctOptionId: 'b',
          explanation: 'computeIfAbsent runs the function only when the key is absent, so repeated keys reuse the stored result and the side effect happens once per distinct key.',
        },
        {
          id: 'sp2-c5',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'What does RFC 9457 (Problem Details for HTTP APIs) standardise, and how does Spring support it?',
          options: [
            { id: 'a', text: 'A JSON error format (application/problem+json) with type, title, status, detail and instance; Spring models it as ProblemDetail' },
            { id: 'b', text: 'A way to compress error responses; Spring enables it with @EnableCompression' },
            { id: 'c', text: 'A list of mandatory HTTP status codes; Spring enforces it with @ResponseStatus' },
            { id: 'd', text: 'An XML schema for SOAP faults' },
          ],
          correctOptionId: 'a',
          explanation: 'RFC 9457 obsoletes RFC 7807. Return ProblemDetail from @ExceptionHandler methods in a @RestControllerAdvice to apply it consistently.',
        },
        {
          id: 'sp2-c6',
          kind: 'mcq',
          dimension: 'interview',
          prompt: 'Clients page through an events table with millions of rows using ?page=50000&size=50, and those requests are slow while new rows are inserted constantly. What is the best improvement?',
          options: [
            { id: 'a', text: 'Increase the page size to 10,000' },
            { id: 'b', text: 'Switch to keyset (cursor) pagination: return a cursor such as the last id and query WHERE id > :cursor ORDER BY id LIMIT :size' },
            { id: 'c', text: 'Cache every page in memory' },
            { id: 'd', text: 'Remove ORDER BY so the database can return rows faster' },
          ],
          correctOptionId: 'b',
          explanation: 'OFFSET makes the database walk and discard all earlier rows, and concurrent inserts shift pages so rows are skipped or repeated. A keyset query uses the index to start directly after the last row seen.',
        },
      ],
      challengeIds: [],
      masteryCriteria: [
        'Design endpoints with correct methods, URLs, status codes and headers.',
        'Validate request DTOs with jakarta.validation and explain where business validation belongs.',
        'Centralise error handling with @RestControllerAdvice and ProblemDetail.',
        'Explain pagination trade-offs and implement idempotency keys for unsafe operations.',
      ],
      relatedLessonIds: ['sp-ioc-boot', 'sp-data-tx', 'sp-security', 'e-design'],
      revision: [
        { id: 'r1', question: 'Which status and header should a successful create return?', answer: '201 Created with a Location header for the new resource (ResponseEntity.created(uri)).' },
        { id: 'r2', question: 'How is request validation triggered in Spring MVC?', answer: 'Annotate the DTO with jakarta.validation constraints and the @RequestBody parameter with @Valid; failures raise MethodArgumentNotValidException, answered with 400.' },
        { id: 'r3', question: 'What is ProblemDetail?', answer: 'Spring\'s model of RFC 9457 problem details: a standard application/problem+json error body with type, title, status, detail, instance and extension members.' },
        { id: 'r4', question: 'How do you make POST /payments safe to retry?', answer: 'Require an Idempotency-Key; store the key, a request fingerprint and the response durably (unique constraint); return the stored response on retries and reject key reuse with a different payload.' },
      ],
    },
    // -----------------------------------------------------------------------
    {
      id: 'sp-data-tx',
      moduleId: 'spring',
      title: 'Spring Data JPA and transactions',
      summary: 'Entities and repositories, how @Transactional really works through proxies, rollback rules, lazy loading, the N+1 problem and DTO projections.',
      estimatedMinutes: 50,
      difficulty: 'advanced',
      prerequisites: ['sp-ioc-boot', 'e-resources'],
      versionNotes: [
        { feature: 'jakarta.persistence namespace (Hibernate 6+)', since: 17, note: 'Spring Boot 3+' },
      ],
      objectives: [
        'Map entities and write Spring Data repositories with derived and custom queries.',
        'Explain how @Transactional is applied by a proxy and why self-invocation bypasses it.',
        'State the default rollback rules and propagation behaviour.',
        'Recognise and fix N+1 queries and LazyInitializationException.',
        'Use DTO projections for read-heavy endpoints.',
      ],
      plainEnglish: `**JPA** (implemented by Hibernate) maps Java classes — **entities** — to database tables, so you work with objects instead of writing SQL for every operation. **Spring Data JPA** goes further: you write an interface like \`interface OrderRepository extends JpaRepository<Order, Long>\` and Spring generates the implementation, including queries derived from method names like \`findByStatus\`.

A **transaction** groups database changes so they all succeed or all fail. You mark a service method with \`@Transactional\`, and Spring starts a transaction before it runs and commits (or rolls back) after.

The traps are in the details: when the annotation silently does nothing, which exceptions roll back, and how innocent-looking code can fire hundreds of queries.`,
      technical: `### Entities and repositories
An entity is a class with \`@Entity\` and an \`@Id\`, plus a no-argument constructor (protected is fine). Associations: \`@ManyToOne\` (default fetch **EAGER** — set \`LAZY\` explicitly), \`@OneToMany(mappedBy = ...)\` (default LAZY). \`@Version\` enables optimistic locking.

\`JpaRepository<T, ID>\` provides save, findById, findAll (with paging and sorting), delete and more. Query methods are derived from names (\`findByCustomerEmailAndStatus\`), or written with \`@Query\` in JPQL. Inside a transaction, loaded entities are **managed**: changes are detected (dirty checking) and flushed as UPDATEs at commit, without calling save.

### How @Transactional works
Spring wraps the bean in a **proxy** (a CGLIB subclass by default in Boot, or a JDK dynamic proxy for interfaces). Callers hold the proxy; the proxy begins a transaction, calls the real object, then commits or rolls back. Consequences:
- **Self-invocation bypasses it**: \`this.otherMethod()\` inside the bean calls the target directly, so annotations on otherMethod (transactions, \`@Async\`, \`@Cacheable\`, method security) are ignored. Move the method to another bean or put the boundary on the outer method.
- Annotate public methods (Spring 6 also supports protected and package-private methods on class-based proxies); private methods are never intercepted.
- Only beans created by Spring are proxied — objects created with new are not.

### Rollback and propagation
- By default the transaction rolls back on **unchecked exceptions** (RuntimeException and Error) and **commits on checked exceptions**. Use \`rollbackFor = Exception.class\` when a checked exception should roll back.
- Catching an exception inside the transactional method and not rethrowing means the proxy sees success and commits.
- Propagation \`REQUIRED\` (default) joins an existing transaction; \`REQUIRES_NEW\` suspends it and starts an independent one (use sparingly, e.g. audit logs that must survive a rollback).
- \`@Transactional(readOnly = true)\` lets Hibernate skip dirty checking and may route to replicas.
- Keep transactions short: never call slow remote services while holding a transaction and a pooled connection.

### Lazy loading and N+1
A LAZY association is loaded on first access, which needs an open persistence context. Accessing it after the transaction ends throws \`LazyInitializationException\`. Accessing it inside a loop over N parents issues one query per parent: **1 + N queries**. Fixes:
- \`JOIN FETCH\` in JPQL, or \`@EntityGraph(attributePaths = ...)\` on the repository method;
- batch fetching (\`hibernate.default_batch_fetch_size\`) to load children with IN queries;
- **DTO projections** that select exactly the columns the use case needs.
Detect it by logging SQL in tests or counting statements, not by waiting for production latency. Spring Boot enables open-session-in-view by default (with a start-up warning), which hides lazy loading in controllers; set \`spring.jpa.open-in-view=false\` and load what you need in the service.

### Projections
For read-only views, select into records: \`select new com.example.OrderSummary(o.id, c.name, o.total) from PurchaseOrder o join o.customer c\`, or use interface-based projections. They avoid loading whole entity graphs and never trigger lazy loading.`,
      whyItExists: `Transactions keep data consistent when several changes must succeed together, and ORM removes repetitive mapping code. Declarative @Transactional keeps business code free of begin/commit/rollback plumbing — at the price of having to understand the proxy that applies it.`,
      whenToUse: [
        'Put @Transactional on service methods that form one business operation.',
        'Use readOnly = true for query-only service methods.',
        'Use @EntityGraph or JOIN FETCH when a use case needs an association for many parents.',
        'Use record projections for list screens and reports.',
      ],
      whenNotToUse: [
        'Do not put @Transactional on private methods or rely on calling it via this.',
        'Do not hold a transaction open across remote HTTP calls or user think-time.',
        'Do not make every association EAGER to avoid LazyInitializationException.',
        'Do not use JPA for bulk data loads of millions of rows; use JDBC batch operations instead.',
      ],
      examples: [
        {
          id: 'tx-proxy',
          title: 'How a transactional proxy works (and how self-invocation escapes it)',
          runnable: true,
          code: `import java.lang.annotation.*;
import java.lang.reflect.*;

public class Main {
    @Retention(RetentionPolicy.RUNTIME)
    @Target(ElementType.METHOD)
    @interface Transactional {}

    interface AccountService {
        void transfer(String from, String to, long cents);
        void transferToSavings(long cents);
        void audit(String note) throws Exception;
    }

    static class AccountServiceImpl implements AccountService {
        @Transactional
        public void transfer(String from, String to, long cents) {
            System.out.println("  debit " + from + ", credit " + to);
            if (cents > 1_000) throw new IllegalStateException("limit exceeded");
        }

        public void transferToSavings(long cents) {      // not annotated
            transfer("checking", "savings", cents);      // self-invocation: no proxy involved
        }

        @Transactional
        public void audit(String note) throws Exception {
            throw new Exception("audit store unavailable");   // a checked exception
        }
    }

    static AccountService transactionalProxy(AccountService target) {
        InvocationHandler handler = (proxy, method, args) -> {
            Method impl = target.getClass().getMethod(method.getName(), method.getParameterTypes());
            if (!impl.isAnnotationPresent(Transactional.class)) return method.invoke(target, args);
            System.out.println("BEGIN " + method.getName());
            try {
                Object result = method.invoke(target, args);
                System.out.println("COMMIT");
                return result;
            } catch (InvocationTargetException e) {
                Throwable cause = e.getCause();
                boolean rollback = cause instanceof RuntimeException || cause instanceof Error;
                System.out.println((rollback ? "ROLLBACK" : "COMMIT") + " after " + cause.getClass().getSimpleName());
                throw cause;
            }
        };
        return (AccountService) Proxy.newProxyInstance(
            AccountService.class.getClassLoader(), new Class<?>[] {AccountService.class}, handler);
    }

    public static void main(String[] args) {
        AccountService service = transactionalProxy(new AccountServiceImpl());
        service.transfer("alice", "bob", 500);
        try {
            service.transfer("alice", "bob", 5_000);
        } catch (IllegalStateException e) {
            System.out.println("caller saw: " + e.getMessage());
        }
        try {
            service.audit("login");
        } catch (Exception e) {
            System.out.println("caller saw: " + e.getMessage());
        }
        System.out.println("transferToSavings:");
        service.transferToSavings(500);
    }
}`,
          expectedOutput: `BEGIN transfer
  debit alice, credit bob
COMMIT
BEGIN transfer
  debit alice, credit bob
ROLLBACK after IllegalStateException
caller saw: limit exceeded
BEGIN audit
COMMIT after Exception
caller saw: audit store unavailable
transferToSavings:
  debit checking, credit savings`,
          explanation: 'Spring\'s transaction interceptor follows the same rules: wrap the call, roll back on RuntimeException or Error, commit on checked exceptions unless rollbackFor says otherwise. The last call shows that an internal this.transfer(...) never reaches the proxy, so it runs with no transaction at all.',
        },
        {
          id: 'n-plus-one',
          title: 'Counting queries: N+1 vs one batched query',
          runnable: true,
          code: `import java.util.*;
import java.util.stream.*;

public class Main {
    static int queries = 0;

    record Order(long id, String customer) {}
    record Line(long orderId, String product) {}

    static final List<Order> ORDERS = LongStream.rangeClosed(1, 50)
        .mapToObj(i -> new Order(i, "customer-" + i)).toList();
    static final List<Line> LINES = ORDERS.stream()
        .flatMap(o -> Stream.of(new Line(o.id(), "book"), new Line(o.id(), "pen"))).toList();

    // SELECT * FROM orders
    static List<Order> findAllOrders() {
        queries++;
        return ORDERS;
    }

    // SELECT * FROM order_lines WHERE order_id = ?   (what lazy loading does per order)
    static List<Line> findLinesByOrderId(long orderId) {
        queries++;
        return LINES.stream().filter(l -> l.orderId() == orderId).toList();
    }

    // SELECT * FROM order_lines WHERE order_id IN (...)   (fetch join / batch fetching)
    static Map<Long, List<Line>> findLinesForOrders(Collection<Long> orderIds) {
        queries++;
        Set<Long> wanted = new HashSet<>(orderIds);
        return LINES.stream().filter(l -> wanted.contains(l.orderId()))
            .collect(Collectors.groupingBy(Line::orderId));
    }

    public static void main(String[] args) {
        queries = 0;
        int lines = 0;
        for (Order o : findAllOrders()) {
            lines += findLinesByOrderId(o.id()).size();
        }
        System.out.println("N+1:     " + lines + " lines in " + queries + " queries");

        queries = 0;
        List<Order> orders = findAllOrders();
        Map<Long, List<Line>> byOrder = findLinesForOrders(orders.stream().map(Order::id).toList());
        int total = orders.stream().mapToInt(o -> byOrder.getOrDefault(o.id(), List.of()).size()).sum();
        System.out.println("batched: " + total + " lines in " + queries + " queries");
    }
}`,
          expectedOutput: `N+1:     100 lines in 51 queries
batched: 100 lines in 2 queries`,
          explanation: 'Each "query" stands for a database round trip. With 50 orders the lazy version costs 51 round trips; with 5,000 orders it would cost 5,001, while the batched version stays at 2 (or 1 with a JOIN FETCH).',
        },
        {
          id: 'jpa-repository',
          title: 'Entities, repositories and transactions in Spring Data JPA (not runnable here)',
          runnable: false,
          code: `package com.example.shop;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Entity
@Table(name = "purchase_orders")
class PurchaseOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)     // ManyToOne is EAGER unless you say otherwise
    private Customer customer;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderLine> lines = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    private Status status = Status.OPEN;

    @Version
    private long version;                                    // optimistic locking

    protected PurchaseOrder() {}                             // required by JPA

    void cancel() {
        if (status == Status.SHIPPED) throw new IllegalStateException("already shipped");
        status = Status.CANCELLED;
    }
}

record OrderSummary(Long id, String customerName, Status status) {}

interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    List<PurchaseOrder> findByStatus(Status status);                     // derived query

    @EntityGraph(attributePaths = {"customer", "lines"})
    Optional<PurchaseOrder> findWithLinesById(Long id);                  // one query, no N+1

    @Query("""
        select new com.example.shop.OrderSummary(o.id, c.name, o.status)
        from PurchaseOrder o join o.customer c
        where o.status = :status""")
    Page<OrderSummary> findSummaries(@Param("status") Status status, Pageable pageable);
}

@Service
class OrderService {
    private final PurchaseOrderRepository orders;

    OrderService(PurchaseOrderRepository orders) { this.orders = orders; }

    @Transactional
    public void cancel(long orderId) {
        PurchaseOrder order = orders.findById(orderId)
            .orElseThrow(() -> new OrderNotFoundException(orderId));     // unchecked: rolls back
        order.cancel();                    // dirty checking issues the UPDATE at commit; no save() needed
    }

    @Transactional(readOnly = true)
    public Page<OrderSummary> openOrders(Pageable page) {
        return orders.findSummaries(Status.OPEN, page);
    }
}`,
          explanation: 'Customer, OrderLine, Status and OrderNotFoundException are application classes. The projection query reads only three columns and returns records, so it can never trigger lazy loading. Calling cancel from another bean goes through the proxy; calling it from inside OrderService would not.',
        },
      ],
      walkthrough: {
        exampleId: 'tx-proxy',
        steps: [
          { lines: [5, 13], text: 'A runtime-visible @Transactional annotation and a service interface. JDK dynamic proxies implement interfaces; Spring Boot normally uses CGLIB subclasses, but the behaviour is the same.' },
          { lines: [15, 30], text: 'The real service. transfer is annotated, transferToSavings is not and calls transfer through this, and audit throws a checked exception.' },
          { lines: [32, 35], text: 'The proxy\'s handler sees every call made through the interface. Methods without the annotation pass straight through.' },
          { lines: [36, 46], text: 'For annotated methods: BEGIN, invoke the target, COMMIT on success. On failure, roll back only for RuntimeException or Error — Spring\'s default rule — and rethrow so the caller still sees the exception.' },
          { lines: [52, 64], text: 'The first transfer commits; the second exceeds the limit and rolls back; audit throws a checked exception, so the transaction commits even though the call failed.' },
          { lines: [65, 66], text: 'transferToSavings has no annotation, and its internal call to transfer goes through this rather than the proxy, so no BEGIN is printed: the transfer runs without a transaction.' },
        ],
      },
      realWorld: {
        title: 'The order page that issued 1,200 queries',
        scenario: `An admin "recent orders" page loaded 200 orders and, for each, displayed the customer name and line count. It was fine in development with 5 orders. In production the page took 6 seconds; SQL logging showed 1 query for orders, 200 for customers and 200 for lines — and the template accessed lines again for totals, triggering more. Open-session-in-view had hidden the lazy loading in the view layer.

The fix was a dedicated projection query returning \`OrderSummary(id, customerName, lineCount, total)\` with joins and GROUP BY: one query, 40 ms. The team disabled open-in-view, added a test that fails if a request issues more than a fixed number of statements, and documented a second bug found on the way: a \`@Transactional\` method was called from another method in the same class, so a "rollback" they relied on had never existed.`,
      },
      commonMistakes: [
        {
          mistake: 'Calling a @Transactional method from another method of the same bean.',
          why: 'The call does not pass through the proxy, so no transaction (or a different one than expected) applies.',
          fix: 'Put the transactional method on another bean, or annotate the public entry point that external callers use.',
        },
        {
          mistake: 'Expecting a checked exception to roll back the transaction.',
          why: 'By default only RuntimeException and Error trigger rollback.',
          fix: 'Use @Transactional(rollbackFor = Exception.class) or throw an unchecked exception.',
          code: `@Transactional(rollbackFor = Exception.class)
public void importFile(Path file) throws IOException { ... }`,
        },
        {
          mistake: 'Catching and logging an exception inside the transactional method.',
          why: 'The proxy sees a normal return and commits partial work.',
          fix: 'Let the exception propagate, or mark rollback explicitly when you must handle it.',
        },
        {
          mistake: 'Making associations EAGER to get rid of LazyInitializationException.',
          why: 'Every query now loads the associations, often with extra queries, even when they are not needed.',
          fix: 'Fetch what each use case needs with JOIN FETCH, @EntityGraph or a projection inside the transaction.',
        },
      ],
      checks: [
        {
          id: 'sp3-c1',
          kind: 'predict-output',
          dimension: 'runtime',
          prompt: 'TxProxy stands in for the subclass proxy Spring generates around a bean. What does this print?',
          code: `public class Main {
    static class Service {
        void outer() {
            System.out.print("outer ");
            inner();
        }

        void inner() {
            System.out.print("inner ");
        }
    }

    static class TxProxy extends Service {
        private final Service target;

        TxProxy(Service target) { this.target = target; }

        @Override
        void outer() {
            System.out.print("[tx] ");
            target.outer();
        }

        @Override
        void inner() {
            System.out.print("[tx] ");
            target.inner();
        }
    }

    public static void main(String[] args) {
        Service s = new TxProxy(new Service());
        s.outer();
        System.out.println();
    }
}`,
          options: [
            { id: 'a', text: '[tx] outer [tx] inner' },
            { id: 'b', text: '[tx] outer inner' },
            { id: 'c', text: 'outer inner' },
            { id: 'd', text: '[tx] outer [tx] inner [tx]' },
          ],
          correctOptionId: 'b',
          explanation: 'The proxy delegates to a separate target object. Inside target.outer(), the call inner() means this.inner() on the target, not on the proxy, so the interception for inner never happens — exactly the self-invocation pitfall.',
        },
        {
          id: 'sp3-c2',
          kind: 'mcq',
          dimension: 'debugging',
          prompt: 'A @Transactional method saves an invoice and then throws java.io.IOException (a checked exception) while writing a PDF. With default settings, what happens to the invoice row?',
          options: [
            { id: 'a', text: 'It is rolled back because the method failed' },
            { id: 'b', text: 'It is committed, because by default only unchecked exceptions and errors trigger rollback' },
            { id: 'c', text: 'The transaction stays open until the next request' },
            { id: 'd', text: 'Spring retries the method' },
          ],
          correctOptionId: 'b',
          explanation: 'Use rollbackFor = Exception.class (or IOException.class) if checked exceptions should roll back.',
        },
        {
          id: 'sp3-c3',
          kind: 'multi-select',
          dimension: 'debugging',
          prompt: 'In which situations does a @Transactional annotation NOT give the expected transactional behaviour? Select all that apply.',
          options: [
            { id: 'a', text: 'The annotated method is private' },
            { id: 'b', text: 'The method is called via this from another method of the same bean' },
            { id: 'c', text: 'The object was created with new instead of being a Spring bean' },
            { id: 'd', text: 'The method catches the exception and returns normally' },
            { id: 'e', text: 'A public method on a Spring bean is called from a different bean' },
          ],
          correctOptionIds: ['a', 'b', 'c', 'd'],
          explanation: 'Only calls through the proxy on interceptable methods are transactional, and the proxy decides commit or rollback from whether an exception escapes. A public method called from another bean is the normal, working case.',
        },
        {
          id: 'sp3-c4',
          kind: 'mcq',
          dimension: 'interview',
          prompt: 'A page loads 100 posts and shows each post\'s author name; SQL logs show 101 queries. What is this, and which fix is most appropriate?',
          options: [
            { id: 'a', text: 'A connection leak; increase the pool size' },
            { id: 'b', text: 'The N+1 problem from lazy loading; fetch authors with JOIN FETCH, @EntityGraph or a DTO projection' },
            { id: 'c', text: 'Normal JPA behaviour; add a cache in front of the page' },
            { id: 'd', text: 'A missing index; add an index on posts.id' },
          ],
          correctOptionId: 'b',
          explanation: 'One query loads the posts and each lazy author access issues another. Fetching the association with the parents, or selecting just the needed columns, reduces it to one query.',
        },
        {
          id: 'sp3-c5',
          kind: 'mcq',
          dimension: 'runtime',
          prompt: 'A controller calls orderService.find(id), which is @Transactional and returns the entity. The controller then calls order.getLines().size() with open-in-view disabled. What happens?',
          options: [
            { id: 'a', text: 'The lines load normally' },
            { id: 'b', text: 'LazyInitializationException, because the persistence context closed when the transaction ended' },
            { id: 'c', text: 'An empty list is returned' },
            { id: 'd', text: 'A NullPointerException, because lines is null' },
          ],
          correctOptionId: 'b',
          explanation: 'Lazy collections need an open persistence context to load. Load what the caller needs inside the service (fetch join, entity graph) and return a DTO.',
        },
      ],
      challengeIds: [],
      masteryCriteria: [
        'Map entities with sensible fetch types and write derived, @Query and projection repository methods.',
        'Explain proxy-based transactions, the self-invocation pitfall and default rollback rules.',
        'Diagnose N+1 and LazyInitializationException and choose an appropriate fix.',
        'Design transaction boundaries in the service layer and keep them short.',
      ],
      relatedLessonIds: ['sp-ioc-boot', 'sp-rest', 'e-resources', 'a-complexity'],
      revision: [
        { id: 'r1', question: 'Why does calling a @Transactional method via this not start a transaction?', answer: 'Transactions are applied by a proxy around the bean; an internal call goes directly to the target object and never passes through the proxy.' },
        { id: 'r2', question: 'Which exceptions roll back a Spring transaction by default?', answer: 'Unchecked exceptions (RuntimeException and subclasses) and Errors. Checked exceptions commit unless rollbackFor is set.' },
        { id: 'r3', question: 'What is the N+1 problem?', answer: 'One query loads N parents, then accessing a lazy association on each parent issues N more queries. Fix with JOIN FETCH, @EntityGraph, batch fetching or a projection.' },
        { id: 'r4', question: 'Why use DTO projections for read endpoints?', answer: 'They select only the needed columns, avoid loading and dirty-checking whole entity graphs, never trigger lazy loading, and decouple the API from the schema.' },
      ],
    },
    // -----------------------------------------------------------------------
    {
      id: 'sp-security',
      moduleId: 'spring',
      title: 'Spring Security essentials',
      summary: 'The security filter chain, authentication vs authorization, password hashing, sessions vs JWT, CSRF, method security and handling secrets.',
      estimatedMinutes: 45,
      difficulty: 'advanced',
      prerequisites: ['sp-rest'],
      versionNotes: [
        { feature: 'SecurityFilterChain beans and the lambda DSL replace WebSecurityConfigurerAdapter', since: 17, note: 'Spring Security 6 / Spring Boot 3' },
        { feature: '@EnableMethodSecurity replaces @EnableGlobalMethodSecurity', since: 17, note: 'Spring Security 6' },
      ],
      objectives: [
        'Explain how requests pass through the Spring Security filter chain.',
        'Distinguish authentication from authorization and 401 from 403.',
        'Store passwords with an adaptive, salted hash such as BCrypt.',
        'Compare session cookies with stateless JWT bearer tokens and know when CSRF protection is required.',
        'Apply method security and keep secrets out of code and logs.',
      ],
      plainEnglish: `Security answers two separate questions:

- **Authentication** — *who are you?* (a password, a session cookie, a token). Failure means **401 Unauthorized**.
- **Authorization** — *are you allowed to do this?* (roles, ownership). Failure means **403 Forbidden**.

Spring Security puts a chain of **filters** in front of your controllers. Each filter does one job — read a token, check a session, enforce rules — before the request ever reaches your code. Add the starter and every endpoint requires login by default; you then open up what should be public.

Passwords are never stored as text: they are run through a deliberately slow hashing function such as **BCrypt**, so a stolen database does not reveal them.`,
      technical: `### The filter chain
A servlet filter (\`DelegatingFilterProxy\` → \`FilterChainProxy\`) routes each request to the first matching \`SecurityFilterChain\` bean. Its filters run in a fixed order: CSRF checks, authentication filters (form login, HTTP Basic, bearer token), exception translation, then the \`AuthorizationFilter\`. A successful authentication is stored in the \`SecurityContextHolder\` (thread-bound) for the rest of the request.

Configuration since Spring Security 6 is a bean using the lambda DSL:
- \`authorizeHttpRequests(auth -> auth.requestMatchers("/public/**").permitAll().anyRequest().authenticated())\` — rules are checked in order, so specific matchers come first.
- \`hasRole("ADMIN")\` checks the authority \`ROLE_ADMIN\`; \`hasAuthority("SCOPE_orders.read")\` checks a raw authority.
\`WebSecurityConfigurerAdapter\` was removed in Spring Security 6.

### Passwords
Use a \`PasswordEncoder\`: \`PasswordEncoderFactories.createDelegatingPasswordEncoder()\` stores hashes like \`{bcrypt}$2a$10$...\`, so the algorithm can be upgraded later. BCrypt (or Argon2, scrypt, PBKDF2) is **salted** (equal passwords get different hashes, defeating precomputed tables) and **slow by design** with a tunable cost (defeating brute force). Plain SHA-256, MD5 or reversible encryption are not acceptable for passwords. Compare secrets with constant-time functions.

### Sessions vs stateless tokens
- **Server sessions** (cookie \`JSESSIONID\`): simple, instantly revocable (invalidate the session), but need shared session storage when scaled out, and cookies need CSRF protection.
- **JWT bearer tokens**: signed, self-contained claims verified without a database lookup — good for APIs and service-to-service calls. Trade-offs: hard to revoke before expiry (keep access tokens short-lived, use refresh tokens), larger requests, and the token must not be stored where scripts can steal it in browser apps. Configure a resource server with \`oauth2ResourceServer(o -> o.jwt(...))\` and an issuer such as Keycloak, Okta or Auth0 — do not invent your own token format. By default JWT scopes become \`SCOPE_...\` authorities; mapping roles needs a \`JwtAuthenticationConverter\`.

### CSRF
Cross-site request forgery abuses the browser's habit of automatically attaching cookies. Spring Security enables CSRF protection by default for state-changing methods. It is needed whenever authentication rides on cookies (sessions, cookie-stored tokens). A pure API authenticated only with an \`Authorization: Bearer\` header sent explicitly by the client is not exposed to CSRF in the same way, and often disables it together with \`SessionCreationPolicy.STATELESS\`.

### Method security
\`@EnableMethodSecurity\` enables \`@PreAuthorize("hasRole('ADMIN') or #customerId == authentication.name")\` on service methods — defence in depth beyond URL rules, and the right place for ownership checks. Like transactions, it is proxy-based, so self-invocation bypasses it.

### Secrets and logging
- Never log passwords, tokens, Authorization headers, session ids, API keys or full card numbers; mask them in request logging filters and exception messages.
- Keep secrets in environment variables or a secret manager, not in the repository; rotate them if they leak.
- Return generic messages for failed logins ("invalid username or password") so attackers cannot enumerate accounts.
- Keep dependencies patched; most real-world breaches use known vulnerabilities.`,
      whyItExists: `Security is easy to get almost right and catastrophic to get wrong. A well-reviewed framework centralises the subtle parts — filter ordering, session fixation protection, CSRF tokens, password hashing, token validation — so application code only declares who may do what.`,
      whenToUse: [
        'Use a SecurityFilterChain bean with explicit, ordered authorization rules and deny-by-default.',
        'Use BCrypt or Argon2 through a DelegatingPasswordEncoder for stored passwords.',
        'Use sessions with CSRF protection for server-rendered browser apps; short-lived JWTs from an identity provider for APIs.',
        'Use @PreAuthorize for ownership and business-level permission checks in services.',
      ],
      whenNotToUse: [
        'Do not write your own password hashing or token signing scheme.',
        'Do not disable CSRF protection on an app that authenticates with cookies.',
        'Do not rely on hiding URLs or on front-end checks for authorization.',
        'Do not put sensitive data in JWT claims: they are signed, not encrypted, and anyone holding the token can read them.',
      ],
      examples: [
        {
          id: 'filter-chain',
          title: 'A security filter chain in plain Java',
          runnable: true,
          code: `import java.util.*;

public class Main {
    record Request(String path, String authorization) {}
    record User(String name, Set<String> roles) {}

    interface Chain { String proceed(Request req, Map<String, Object> ctx); }
    interface Filter { String apply(Request req, Map<String, Object> ctx, Chain next); }

    static final Map<String, User> TOKENS = Map.of(
        "token-ana", new User("ana", Set.of("USER")),
        "token-root", new User("root", Set.of("USER", "ADMIN")));

    static final Filter AUTHENTICATION = (req, ctx, next) -> {
        String header = req.authorization();
        if (header != null && header.startsWith("Bearer ")) {
            User user = TOKENS.get(header.substring("Bearer ".length()));
            if (user == null) return "401 Unauthorized (invalid token)";
            ctx.put("user", user);                        // like SecurityContextHolder
        }
        return next.proceed(req, ctx);
    };

    static final Filter AUTHORIZATION = (req, ctx, next) -> {
        User user = (User) ctx.get("user");
        if (req.path().startsWith("/public/")) return next.proceed(req, ctx);
        if (user == null) return "401 Unauthorized";
        if (req.path().startsWith("/admin/") && !user.roles().contains("ADMIN")) return "403 Forbidden";
        return next.proceed(req, ctx);
    };

    static String controller(Request req, Map<String, Object> ctx) {
        User user = (User) ctx.get("user");
        return "200 OK " + req.path() + (user == null ? "" : " as " + user.name());
    }

    static String dispatch(Request req, List<Filter> filters) {
        Chain chain = Main::controller;
        for (int i = filters.size() - 1; i >= 0; i--) {   // wrap from the inside out
            Filter filter = filters.get(i);
            Chain next = chain;
            chain = (r, ctx) -> filter.apply(r, ctx, next);
        }
        return chain.proceed(req, new HashMap<>());
    }

    public static void main(String[] args) {
        List<Filter> filters = List.of(AUTHENTICATION, AUTHORIZATION);
        System.out.println(dispatch(new Request("/public/health", null), filters));
        System.out.println(dispatch(new Request("/orders", null), filters));
        System.out.println(dispatch(new Request("/orders", "Bearer token-ana"), filters));
        System.out.println(dispatch(new Request("/admin/users", "Bearer token-ana"), filters));
        System.out.println(dispatch(new Request("/admin/users", "Bearer token-root"), filters));
        System.out.println(dispatch(new Request("/orders", "Bearer forged"), filters));
    }
}`,
          expectedOutput: `200 OK /public/health
401 Unauthorized
200 OK /orders as ana
403 Forbidden
200 OK /admin/users as root
401 Unauthorized (invalid token)`,
          explanation: 'Spring Security\'s FilterChainProxy works the same way: each filter can stop the request or pass it on, authentication runs before authorization, and the controller only sees requests that passed every filter.',
        },
        {
          id: 'password-hashing',
          title: 'Salted, slow password hashing with the JDK',
          runnable: true,
          code: `import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;

public class Main {
    static final int ITERATIONS = 100_000;     // tune so one hash takes tens of milliseconds

    static byte[] derive(char[] password, byte[] salt, int iterations) throws Exception {
        PBEKeySpec spec = new PBEKeySpec(password, salt, iterations, 256);
        return SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(spec).getEncoded();
    }

    static String hash(char[] password) throws Exception {
        byte[] salt = new byte[16];
        new SecureRandom().nextBytes(salt);    // a fresh random salt per password
        byte[] key = derive(password, salt, ITERATIONS);
        Base64.Encoder b64 = Base64.getEncoder();
        return ITERATIONS + ":" + b64.encodeToString(salt) + ":" + b64.encodeToString(key);
    }

    static boolean verify(char[] password, String stored) throws Exception {
        String[] parts = stored.split(":");
        byte[] salt = Base64.getDecoder().decode(parts[1]);
        byte[] expected = Base64.getDecoder().decode(parts[2]);
        byte[] actual = derive(password, salt, Integer.parseInt(parts[0]));
        return MessageDigest.isEqual(expected, actual);   // constant-time comparison
    }

    public static void main(String[] args) throws Exception {
        String first = hash("correct horse".toCharArray());
        String second = hash("correct horse".toCharArray());
        System.out.println("same password, different hashes: " + !first.equals(second));
        System.out.println("verify correct password: " + verify("correct horse".toCharArray(), first));
        System.out.println("verify wrong password:   " + verify("correct h0rse".toCharArray(), first));
        System.out.println("stored parts: " + first.split(":").length + " (iterations, salt, hash)");
    }
}`,
          expectedOutput: `same password, different hashes: true
verify correct password: true
verify wrong password:   false
stored parts: 3 (iterations, salt, hash)`,
          explanation: 'This uses PBKDF2 because it ships with the JDK; in Spring you would simply inject a PasswordEncoder (BCrypt by default) and call encode and matches. The stored string carries its own salt and cost, which is why the cost can be raised later without breaking existing hashes.',
        },
        {
          id: 'security-config',
          title: 'Spring Security configuration for a stateless API (not runnable here)',
          runnable: false,
          code: `package com.example.shop.security;

import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.stereotype.Service;

@Configuration
@EnableMethodSecurity
class SecurityConfig {

    @Bean
    SecurityFilterChain api(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/health", "/api/public/**").permitAll()
                .requestMatchers(HttpMethod.DELETE, "/api/**").hasRole("ADMIN")
                .anyRequest().authenticated())                       // deny by default
            .oauth2ResourceServer(oauth -> oauth.jwt(Customizer.withDefaults()))
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .csrf(csrf -> csrf.disable());   // acceptable only because no cookie authenticates requests
        return http.build();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();   // {bcrypt} by default
    }
}

@Service
class InvoiceService {
    @PreAuthorize("hasRole('ADMIN') or #customerId == authentication.name")
    public List<Invoice> invoicesFor(String customerId) {
        return List.of();   // load invoices for the customer
    }
}

/* application.yml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: https://login.example.com/realms/shop
*/`,
          explanation: 'Invoice is an application class. The resource server downloads the issuer\'s public keys and validates each token\'s signature, expiry and issuer. For a server-rendered app with form login and sessions, keep CSRF protection enabled instead.',
        },
      ],
      walkthrough: {
        exampleId: 'filter-chain',
        steps: [
          { lines: [4, 8], text: 'A request with an optional Authorization header, a user with roles, and two small interfaces: a Filter gets the request and the rest of the chain.' },
          { lines: [10, 12], text: 'A stand-in for token validation. Spring would verify a JWT signature or look up a session instead of a map.' },
          { lines: [14, 22], text: 'Authentication: if a bearer token is present, resolve it to a user and store it in the request context (Spring\'s SecurityContextHolder). An invalid token is rejected with 401. No token is not an error yet — the endpoint might be public.' },
          { lines: [24, 30], text: 'Authorization: public paths pass; otherwise an anonymous caller gets 401 (not authenticated) and an authenticated user without the ADMIN role gets 403 (authenticated but not allowed).' },
          { lines: [37, 45], text: 'The chain is built from the inside out so the first filter in the list runs first, and each filter decides whether to call next.' },
          { lines: [47, 55], text: 'Six requests exercise every branch: public, anonymous, allowed user, forbidden user, admin and a forged token.' },
        ],
      },
      realWorld: {
        title: 'Tokens in the logs',
        scenario: `A team added a request-logging filter that printed every header to help debug a partner integration. Months later, an engineer with log access but no production permissions noticed full \`Authorization: Bearer ...\` values in the log search tool — valid for an hour each, and the logs were retained for 30 days and shipped to a third-party vendor.

They rotated the signing keys, which invalidated every token, masked sensitive headers and fields (Authorization, Cookie, Set-Cookie, password, token) in the logging filter, and added a test that fails if a known secret appears in captured log output. The same review found user passwords hashed with unsalted SHA-256 in an old admin table; they were migrated by re-hashing with BCrypt at each user's next login via the DelegatingPasswordEncoder.`,
      },
      commonMistakes: [
        {
          mistake: 'Storing passwords with MD5, SHA-1 or a single round of SHA-256.',
          why: 'Fast, unsalted hashes are cracked at billions of guesses per second with GPUs or precomputed tables.',
          fix: 'Use a PasswordEncoder backed by BCrypt or Argon2.',
        },
        {
          mistake: 'Putting a broad permitAll() rule before a specific restricted rule.',
          why: 'Rules are evaluated in order and the first match wins, so the restriction never applies.',
          fix: 'Order matchers from most specific to most general and end with anyRequest().authenticated().',
        },
        {
          mistake: 'Disabling CSRF because "it breaks my POST requests" in a cookie-based app.',
          why: 'Any website the user visits can then submit authenticated requests on their behalf.',
          fix: 'Send the CSRF token with requests (Spring provides it), or move to header-based bearer tokens for pure APIs.',
        },
        {
          mistake: 'Logging tokens, passwords or Authorization headers.',
          why: 'Logs are widely accessible and long-lived; leaked tokens grant access.',
          fix: 'Mask sensitive fields in logging filters and never include secrets in exception messages.',
        },
        {
          mistake: 'Using long-lived JWTs with no revocation strategy.',
          why: 'A stolen token stays valid until it expires, and logging out does not invalidate it.',
          fix: 'Keep access tokens short-lived, use refresh tokens with rotation, and keep a deny-list for emergencies.',
        },
      ],
      checks: [
        {
          id: 'sp4-c1',
          kind: 'mcq',
          dimension: 'conceptual',
          prompt: 'A logged-in user with role USER calls DELETE /api/products/7, which requires ADMIN. Which status should they get?',
          options: [
            { id: 'a', text: '401 Unauthorized' },
            { id: 'b', text: '403 Forbidden' },
            { id: 'c', text: '404 Not Found' },
            { id: 'd', text: '400 Bad Request' },
          ],
          correctOptionId: 'b',
          explanation: 'The user is authenticated (identity known) but not authorized for this action: 403. 401 means "not authenticated — provide valid credentials".',
        },
        {
          id: 'sp4-c2',
          kind: 'mcq',
          dimension: 'interview',
          prompt: 'Why is BCrypt preferred over SHA-256 for storing passwords?',
          options: [
            { id: 'a', text: 'BCrypt output is shorter' },
            { id: 'b', text: 'BCrypt is reversible, so passwords can be recovered for users' },
            { id: 'c', text: 'BCrypt is salted and deliberately slow with a tunable cost, which makes brute-force and precomputed-table attacks impractical' },
            { id: 'd', text: 'SHA-256 is not available in Java' },
          ],
          correctOptionId: 'c',
          explanation: 'General-purpose hashes are designed to be fast, which helps attackers. Password hashes must be slow and salted; the cost can be raised as hardware improves.',
        },
        {
          id: 'sp4-c3',
          kind: 'multi-select',
          dimension: 'conceptual',
          prompt: 'In which setups is CSRF protection needed? Select all that apply.',
          options: [
            { id: 'a', text: 'A server-rendered web app using a session cookie' },
            { id: 'b', text: 'A single-page app whose auth token is stored in a cookie the browser sends automatically' },
            { id: 'c', text: 'A machine-to-machine API that only accepts an Authorization: Bearer header added explicitly by the client' },
            { id: 'd', text: 'Form login with remember-me cookies' },
          ],
          correctOptionIds: ['a', 'b', 'd'],
          explanation: 'CSRF exploits credentials the browser attaches automatically, i.e. cookies. A header the client must add explicitly cannot be forged by another site\'s form.',
        },
        {
          id: 'sp4-c4',
          kind: 'predict-output',
          dimension: 'debugging',
          prompt: 'These filters were registered in the wrong order. The request carries a valid token for ana. What does it print?',
          code: `import java.util.*;
import java.util.function.*;

public class Main {
    public static void main(String[] args) {
        Map<String, String> context = new HashMap<>();
        List<String> responses = new ArrayList<>();

        Consumer<String> authorize = path -> {
            if (!context.containsKey("user")) responses.add("401 " + path);
        };
        Consumer<String> authenticate = path -> context.put("user", "ana");

        List<Consumer<String>> filters = List.of(authorize, authenticate);
        for (Consumer<String> filter : filters) filter.accept("/orders");

        System.out.println(responses.isEmpty() ? "200 /orders as " + context.get("user") : responses.get(0));
    }
}`,
          options: [
            { id: 'a', text: '200 /orders as ana' },
            { id: 'b', text: '401 /orders' },
            { id: 'c', text: '200 /orders as null' },
            { id: 'd', text: '403 /orders' },
          ],
          correctOptionId: 'b',
          explanation: 'Authorization ran before authentication had populated the context, so a valid user was rejected. Spring Security fixes the order of its built-in filters; custom filters must be added at the right position (addFilterBefore/addFilterAfter).',
        },
        {
          id: 'sp4-c5',
          kind: 'mcq',
          dimension: 'interview',
          prompt: 'What is the main drawback of stateless JWT access tokens compared with server-side sessions?',
          options: [
            { id: 'a', text: 'They cannot carry user roles' },
            { id: 'b', text: 'They are hard to revoke before they expire, so they must be short-lived' },
            { id: 'c', text: 'They require sticky sessions on the load balancer' },
            { id: 'd', text: 'They can only be used with Spring' },
          ],
          correctOptionId: 'b',
          explanation: 'The server validates a JWT from its signature alone, so there is nothing to delete on logout. Short expiry, refresh-token rotation and deny-lists mitigate this; sessions can be invalidated instantly but need shared storage.',
        },
        {
          id: 'sp4-c6',
          kind: 'mcq',
          dimension: 'debugging',
          prompt: '`@PreAuthorize("hasRole(\'ADMIN\')")` is on `deleteAll()` in a service, but a non-admin can still trigger it. `deleteAll()` is called from `cleanup()` in the same class, which the controller calls. What is the most likely cause?',
          options: [
            { id: 'a', text: 'hasRole needs the ROLE_ prefix written out' },
            { id: 'b', text: 'Method security is proxy-based: the internal call from cleanup() bypasses the proxy (or @EnableMethodSecurity is missing)' },
            { id: 'c', text: 'PreAuthorize only works on controllers' },
            { id: 'd', text: 'The JWT has expired' },
          ],
          correctOptionId: 'b',
          explanation: 'Like @Transactional, method security is applied by a proxy, so self-invocation skips the check. Annotate the entry point that external callers use, and make sure @EnableMethodSecurity is present.',
        },
      ],
      challengeIds: [],
      masteryCriteria: [
        'Explain the filter chain and configure ordered, deny-by-default authorization rules.',
        'Distinguish authentication from authorization and use 401 and 403 correctly.',
        'Store and verify passwords with an adaptive, salted hash.',
        'Choose between sessions and JWTs, and decide when CSRF protection is required.',
        'Apply method security and keep secrets out of code, responses and logs.',
      ],
      relatedLessonIds: ['sp-rest', 'sp-ioc-boot', 'sp-data-tx'],
      revision: [
        { id: 'r1', question: 'Authentication vs authorization?', answer: 'Authentication establishes who the caller is (failure: 401); authorization decides whether that caller may perform the action (failure: 403).' },
        { id: 'r2', question: 'How should passwords be stored?', answer: 'As salted, slow, adaptive hashes (BCrypt, Argon2, scrypt or PBKDF2) via a PasswordEncoder — never plain text, reversible encryption or fast hashes.' },
        { id: 'r3', question: 'When is CSRF protection required?', answer: 'Whenever the browser sends credentials automatically, i.e. cookie-based sessions or tokens in cookies. Pure bearer-header APIs are not vulnerable in the same way.' },
        { id: 'r4', question: 'Name three things that must never appear in logs.', answer: 'Passwords, tokens or Authorization/Cookie headers, API keys and secrets (also session ids and full card numbers).' },
      ],
    },
  ],
};
