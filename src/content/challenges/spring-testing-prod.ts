import type { CodingChallenge } from '@/types/curriculum';

/** Class under test for the testing boss; shared by its starter code and solution. */
const CALCULATOR_HARNESS = `
/** The class under test. Do not change it: the runner must report its bugs, not hide them. */
class Calculator {
    private static long memory;   // shared by every instance

    long add(long a, long b) {
        return a + b;
    }

    long divide(long a, long b) {
        return a / b;
    }

    double average(long... values) {
        long sum = 0;
        for (long v : values) sum += v;
        return sum / values.length;
    }

    double sqrt(double x) {
        return Math.sqrt(x);
    }

    long factorial(int n) {
        if (n < 0) throw new IllegalArgumentException("n must be >= 0: " + n);
        long result = 1;
        for (int i = 2; i <= n; i++) result = Math.multiplyExact(result, i);
        return result;
    }

    void memoryAdd(long value) {
        memory += value;
    }

    long memoryRecall() {
        return memory;
    }
}

/** Calls one Calculator operation by name. Returns null for void operations. */
final class Operations {
    static Object call(Calculator c, String op, java.util.List<String> args) {
        return switch (op) {
            case "add" -> c.add(Long.parseLong(args.get(0)), Long.parseLong(args.get(1)));
            case "divide" -> c.divide(Long.parseLong(args.get(0)), Long.parseLong(args.get(1)));
            case "average" -> c.average(args.stream().mapToLong(Long::parseLong).toArray());
            case "sqrt" -> c.sqrt(Double.parseDouble(args.get(0)));
            case "factorial" -> c.factorial(Integer.parseInt(args.get(0)));
            case "memoryAdd" -> {
                c.memoryAdd(Long.parseLong(args.get(0)));
                yield null;
            }
            case "memoryRecall" -> c.memoryRecall();
            default -> throw new IllegalArgumentException("unknown operation " + op);
        };
    }
}`;

export const springTestingProdChallenges: CodingChallenge[] = [
  {
    id: 'ch-mini-di-container',
    title: 'A tiny constructor-injection container',
    moduleId: 'spring',
    lessonId: 'sp-ioc-boot',
    difficulty: 'intermediate',
    kind: 'coding',
    dimension: 'coding',
    concepts: ['inversion of control', 'constructor injection', 'singleton scope', 'dependency graph (DFS)', 'circular reference detection'],
    description: `Spring's \`ApplicationContext\` reads bean definitions, works out the order in which constructors must run, and fails fast at startup when the graph is broken. Build a miniature version.

Input: the first line is n. Each of the next n lines defines a singleton bean: \`<name> <dep1> <dep2> ...\` — the dependencies are its constructor parameters, in order (a bean may have none).

Rules:
- **Registration.** If a name is defined twice, print \`FAILED: duplicate bean definition '<name>'\` (for the first repeat) and create nothing. (Spring Boot disables bean-definition overriding by default.)
- **Refresh.** Visit the beans in definition order and create each one. Creating a bean first creates its dependencies, left to right, then prints \`create <name>(<deps joined by ", ">)\`. Each bean is created **once**; later requests reuse the singleton.
- A dependency that is not defined: \`FAILED: no bean named '<dep>' (required by '<bean>')\`.
- A bean requested while it is still being created is a cycle: \`FAILED: circular reference a -> b -> c -> a\` — the path runs from the first occurrence of the repeated bean to the repeat.
- Stop at the first failure (beans created before it stay printed). On success print \`context started with <k> beans\`.

Example: \`a b\` / \`b\` prints \`create b()\`, \`create a(b)\`, \`context started with 2 beans\`.`,
    starterCode: `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(in.readLine().trim());
        Map<String, List<String>> definitions = new LinkedHashMap<>();
        for (int i = 0; i < n; i++) {
            String[] parts = in.readLine().trim().split("\\\\s+");
            definitions.put(parts[0], Arrays.asList(parts).subList(1, parts.length));
        }
        // TODO: create dependencies before the beans that need them,
        // detect duplicates, missing beans and cycles.
        for (Map.Entry<String, List<String>> e : definitions.entrySet()) {
            System.out.println("create " + e.getKey() + "(" + String.join(", ", e.getValue()) + ")");
        }
        System.out.println("context started with " + definitions.size() + " beans");
    }
}`,
    solution: `import java.io.*;
import java.util.*;

class ContainerException extends RuntimeException {
    ContainerException(String message) {
        super(message);
    }
}

final class Container {
    private final Map<String, List<String>> definitions = new LinkedHashMap<>();
    private final Set<String> singletons = new HashSet<>();
    private final Deque<String> inCreation = new ArrayDeque<>();
    private final List<String> log = new ArrayList<>();

    void register(String name, List<String> dependencies) {
        if (definitions.containsKey(name)) {
            throw new ContainerException("duplicate bean definition '" + name + "'");
        }
        definitions.put(name, dependencies);
    }

    void refresh() {
        for (String name : definitions.keySet()) getBean(name);
    }

    private void getBean(String name) {
        if (singletons.contains(name)) return;
        if (inCreation.contains(name)) {
            List<String> path = new ArrayList<>();
            Iterator<String> it = inCreation.descendingIterator();   // oldest first
            boolean inCycle = false;
            while (it.hasNext()) {
                String bean = it.next();
                if (bean.equals(name)) inCycle = true;
                if (inCycle) path.add(bean);
            }
            path.add(name);
            throw new ContainerException("circular reference " + String.join(" -> ", path));
        }
        inCreation.push(name);
        List<String> deps = definitions.get(name);
        for (String dep : deps) {
            if (!definitions.containsKey(dep)) {
                throw new ContainerException("no bean named '" + dep + "' (required by '" + name + "')");
            }
            getBean(dep);
        }
        inCreation.pop();
        singletons.add(name);
        log.add("create " + name + "(" + String.join(", ", deps) + ")");
    }

    List<String> log() {
        return log;
    }

    int size() {
        return singletons.size();
    }
}

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(in.readLine().trim());
        Container container = new Container();
        String error = null;
        for (int i = 0; i < n; i++) {
            String[] parts = in.readLine().trim().split("\\\\s+");
            List<String> deps = Arrays.asList(parts).subList(1, parts.length);
            if (error != null) continue;
            try {
                container.register(parts[0], deps);
            } catch (ContainerException e) {
                error = e.getMessage();
            }
        }
        if (error == null) {
            try {
                container.refresh();
            } catch (ContainerException e) {
                error = e.getMessage();
            }
        }
        for (String line : container.log()) System.out.println(line);
        System.out.println(error == null
            ? "context started with " + container.size() + " beans"
            : "FAILED: " + error);
    }
}`,
    solutionExplanation:
      'Bean creation is a depth-first walk of the dependency graph: a bean can only be constructed once every constructor argument exists, so dependencies are created first (a post-order traversal). Two pieces of state make it correct. The singleton set means a shared dependency (the diamond in the tests) is built once and then reused. The in-creation stack plays the role of Spring\'s "currently in creation" set: meeting a bean that is still on it means we followed a cycle, and the stack itself holds the path to report. Constructor injection cannot be resolved by creating a half-built object first, which is why Spring also fails with BeanCurrentlyInCreationException for constructor cycles and why cycles should be fixed by redesign rather than by switching to field injection.',
    complexity: { time: 'O(V + E) for V beans and E dependencies', space: 'O(V + E)' },
    hints: [
      'Store definitions in a LinkedHashMap so "definition order" is easy, and check for duplicates while reading.',
      'getBean(name): if already created, return; otherwise create every dependency first, then print the bean.',
      'Keep the beans currently being created on a stack. Requesting one that is on the stack means a cycle — and the stack is the path.',
    ],
    tests: [
      {
        id: 't1',
        name: 'Dependencies are created first',
        stdin: '5\norderController orderService\norderService orderRepository clock\norderRepository dataSource\nclock\ndataSource\n',
        expectedStdout: 'create dataSource()\ncreate orderRepository(dataSource)\ncreate clock()\ncreate orderService(orderRepository, clock)\ncreate orderController(orderService)\ncontext started with 5 beans',
      },
      {
        id: 't2',
        name: 'Cycle is reported with its path',
        stdin: '4\nweb a\na b\nb c\nc a\n',
        expectedStdout: 'FAILED: circular reference a -> b -> c -> a',
      },
      {
        id: 't3',
        name: 'Missing dependency',
        stdin: '3\nmailer smtpClient\napp mailer templates\ntemplates\n',
        expectedStdout: 'FAILED: no bean named \'smtpClient\' (required by \'mailer\')',
      },
      {
        id: 't4',
        name: 'Duplicate definition fails before anything is created',
        stdin: '3\ncache\nrepo cache\ncache\n',
        expectedStdout: 'FAILED: duplicate bean definition \'cache\'',
        hidden: true,
      },
      {
        id: 't5',
        name: 'Cycle found after some beans were created',
        stdin: '5\nconfig\napi service\nservice repo\nrepo config service\nz\n',
        expectedStdout: 'create config()\nFAILED: circular reference service -> repo -> service',
        hidden: true,
      },
      {
        id: 't6',
        name: 'Diamond: a shared dependency is created once',
        stdin: '5\napp left right\nleft base\nright base\nbase\nself\n',
        expectedStdout: 'create base()\ncreate left(base)\ncreate right(base)\ncreate app(left, right)\ncreate self()\ncontext started with 5 beans',
      },
      {
        id: 't7',
        name: 'Self-dependency',
        stdin: '2\nx y\ny y\n',
        expectedStdout: 'FAILED: circular reference y -> y',
        hidden: true,
      },
    ],
  },
  {
    id: 'ch-problem-details-api',
    title: 'Status codes and problem details',
    moduleId: 'spring',
    lessonId: 'sp-rest',
    difficulty: 'advanced',
    kind: 'coding',
    dimension: 'coding',
    concepts: ['HTTP status codes', 'RFC 9457 problem details', 'request pipeline order', 'Bean Validation messages', 'centralised exception handling'],
    description: `Model what a Spring MVC controller plus a \`@RestControllerAdvice\` returns for a small users API. Every failure must become an **RFC 9457 problem detail** with the right status code.

Input: n, then n requests \`METHOD PATH CONTENT_TYPE [key=value ...]\`. CONTENT_TYPE is \`-\` when the request has none. Values contain no spaces and may be empty (\`name=\`). Users live in memory; ids start at 1 and are never reused.

Endpoints: \`GET /users\`, \`POST /users\`, \`GET /users/{id}\`, \`DELETE /users/{id}\` ({id} is exactly one non-empty path segment).

The pipeline, in this order — the first failure wins:
1. No endpoint for the path → **404**, detail \`No endpoint <METHOD> <PATH>.\`
2. Path matches but the method does not → **405**, detail \`Method '<METHOD>' is not supported.\`
3. \`{id}\` that is not 1-9 digits → **400**, detail \`Failed to convert 'id' with value: '<raw>'\`
4. POST: the content type must be \`application/json\` (a missing one counts as \`application/octet-stream\`) → else **415**, detail \`Content-Type '<type>' is not supported.\`
5. POST: an \`age\` that is not an integer means the body cannot be deserialized → **400**, detail \`Failed to read request\`
6. POST: validation, collecting **every** violation → **400**, detail \`Invalid request content.\` plus an \`errors\` array sorted by field name:
   - \`name\`: missing or blank → \`must not be blank\`
   - \`email\`: missing or blank → \`must not be blank\`; otherwise it must be \`x@y\` with exactly one \`@\` and text on both sides → \`must be a well-formed email address\`
   - \`age\`: missing → \`must not be null\`; below 18 → \`must be greater than or equal to 18\`; above 130 → \`must be less than or equal to 130\`
7. POST: email already used by an existing user → **409**, detail \`Email <email> is already registered\`
8. Unknown body fields are ignored. Unknown user id → **404**, detail \`User <id> not found\`

Success lines: \`201 Created Location: /users/<id>\`, \`200 OK {"count":<n>}\`, \`200 OK {"id":1,"name":"ada","email":"ada@x.io","age":36}\`, \`204 No Content\`.

Problem lines are \`<status> \` followed by JSON with members in this order: \`type\` (always \`about:blank\`), \`title\` (the reason phrase: Bad Request, Not Found, Method Not Allowed, Conflict, Unsupported Media Type), \`status\`, \`detail\`, \`instance\` (the request path) and, for validation only, \`errors\`:

\`400 {"type":"about:blank","title":"Bad Request","status":400,"detail":"Invalid request content.","instance":"/users","errors":[{"field":"age","message":"must not be null"}]}\`

The starter already renders problem lines; you write the pipeline.`,
    starterCode: `import java.io.*;
import java.util.*;

record User(long id, String name, String email, int age) {}

final class UserApi {
    private static final Map<Integer, String> TITLES = Map.of(
        400, "Bad Request", 404, "Not Found", 405, "Method Not Allowed",
        409, "Conflict", 415, "Unsupported Media Type");

    private final Map<Long, User> users = new LinkedHashMap<>();
    private long nextId = 1;

    String handle(String method, String path, String contentType, Map<String, String> body) {
        // TODO: route, validate in the documented order, and turn every failure into a problem line
        if (method.equals("POST") && path.equals("/users")) {
            User user = new User(nextId++, body.get("name"), body.get("email"), Integer.parseInt(body.get("age")));
            users.put(user.id(), user);
            return "201 Created Location: /users/" + user.id();
        }
        return problem(404, "No endpoint " + method + " " + path + ".", Map.of(), path);
    }

    /** Renders an RFC 9457 problem line. fieldErrors are written in the map's iteration order. */
    static String problem(int status, String detail, Map<String, String> fieldErrors, String instance) {
        StringBuilder json = new StringBuilder();
        json.append(status).append(" {\\"type\\":\\"about:blank\\",\\"title\\":\\"").append(TITLES.get(status))
            .append("\\",\\"status\\":").append(status)
            .append(",\\"detail\\":\\"").append(detail)
            .append("\\",\\"instance\\":\\"").append(instance).append('"');
        if (!fieldErrors.isEmpty()) {
            StringJoiner list = new StringJoiner(",", ",\\"errors\\":[", "]");
            fieldErrors.forEach((field, message) ->
                list.add("{\\"field\\":\\"" + field + "\\",\\"message\\":\\"" + message + "\\"}"));
            json.append(list);
        }
        return json.append('}').toString();
    }
}

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(in.readLine().trim());
        UserApi api = new UserApi();
        for (int i = 0; i < n; i++) {
            String[] parts = in.readLine().trim().split("\\\\s+");
            Map<String, String> body = new HashMap<>();
            for (int k = 3; k < parts.length; k++) {
                int eq = parts[k].indexOf('=');
                body.put(parts[k].substring(0, eq), parts[k].substring(eq + 1));
            }
            System.out.println(api.handle(parts[0], parts[1], parts[2], body));
        }
    }
}`,
    solution: `import java.io.*;
import java.util.*;

/** Thrown anywhere in the pipeline; rendered once, by the "controller advice" in handle(). */
class ProblemException extends RuntimeException {
    final int status;
    final String detail;
    final Map<String, String> fieldErrors;

    ProblemException(int status, String detail) {
        this(status, detail, Map.of());
    }

    ProblemException(int status, String detail, Map<String, String> fieldErrors) {
        super(detail);
        this.status = status;
        this.detail = detail;
        this.fieldErrors = fieldErrors;
    }
}

record User(long id, String name, String email, int age) {}

final class UserApi {
    private static final Map<Integer, String> TITLES = Map.of(
        400, "Bad Request", 404, "Not Found", 405, "Method Not Allowed",
        409, "Conflict", 415, "Unsupported Media Type");

    private final Map<Long, User> users = new LinkedHashMap<>();
    private long nextId = 1;

    String handle(String method, String path, String contentType, Map<String, String> body) {
        try {
            return route(method, path, contentType, body);
        } catch (ProblemException e) {
            return problem(e, path);
        }
    }

    private String route(String method, String path, String contentType, Map<String, String> body) {
        String[] segments = path.split("/", -1);
        if (path.equals("/users")) {
            if (method.equals("GET")) return "200 OK {\\"count\\":" + users.size() + "}";
            if (method.equals("POST")) return create(contentType, body);
            throw new ProblemException(405, "Method '" + method + "' is not supported.");
        }
        if (segments.length == 3 && segments[1].equals("users") && !segments[2].isEmpty()) {
            if (!method.equals("GET") && !method.equals("DELETE")) {
                throw new ProblemException(405, "Method '" + method + "' is not supported.");
            }
            long id = parseId(segments[2]);
            User user = users.get(id);
            if (user == null) throw new ProblemException(404, "User " + id + " not found");
            if (method.equals("DELETE")) {
                users.remove(id);
                return "204 No Content";
            }
            return "200 OK {\\"id\\":" + user.id() + ",\\"name\\":\\"" + user.name() + "\\",\\"email\\":\\""
                + user.email() + "\\",\\"age\\":" + user.age() + "}";
        }
        throw new ProblemException(404, "No endpoint " + method + " " + path + ".");
    }

    private static long parseId(String raw) {
        if (raw.matches("[0-9]{1,9}")) return Long.parseLong(raw);
        throw new ProblemException(400, "Failed to convert 'id' with value: '" + raw + "'");
    }

    private String create(String contentType, Map<String, String> body) {
        String effective = contentType.equals("-") ? "application/octet-stream" : contentType;
        if (!effective.equals("application/json")) {
            throw new ProblemException(415, "Content-Type '" + effective + "' is not supported.");
        }
        // 1. Deserialize: a value of the wrong type means the body cannot be read at all.
        Integer age = null;
        if (body.containsKey("age")) {
            try {
                age = Integer.parseInt(body.get("age"));
            } catch (NumberFormatException e) {
                throw new ProblemException(400, "Failed to read request");
            }
        }
        // 2. Bean Validation: collect every violation, keyed (and so sorted) by field.
        Map<String, String> errors = new TreeMap<>();
        String name = body.getOrDefault("name", "");
        String email = body.getOrDefault("email", "");
        if (name.isBlank()) errors.put("name", "must not be blank");
        if (email.isBlank()) errors.put("email", "must not be blank");
        else if (!email.matches("[^@]+@[^@]+")) errors.put("email", "must be a well-formed email address");
        if (age == null) errors.put("age", "must not be null");
        else if (age < 18) errors.put("age", "must be greater than or equal to 18");
        else if (age > 130) errors.put("age", "must be less than or equal to 130");
        if (!errors.isEmpty()) throw new ProblemException(400, "Invalid request content.", errors);
        // 3. Business rule in the service layer.
        for (User u : users.values()) {
            if (u.email().equals(email)) throw new ProblemException(409, "Email " + email + " is already registered");
        }
        User user = new User(nextId++, name, email, age);
        users.put(user.id(), user);
        return "201 Created Location: /users/" + user.id();
    }

    private static String problem(ProblemException e, String instance) {
        StringBuilder json = new StringBuilder();
        json.append(e.status).append(" {\\"type\\":\\"about:blank\\",\\"title\\":\\"").append(TITLES.get(e.status))
            .append("\\",\\"status\\":").append(e.status)
            .append(",\\"detail\\":\\"").append(e.detail)
            .append("\\",\\"instance\\":\\"").append(instance).append('"');
        if (!e.fieldErrors.isEmpty()) {
            StringJoiner list = new StringJoiner(",", ",\\"errors\\":[", "]");
            e.fieldErrors.forEach((field, message) ->
                list.add("{\\"field\\":\\"" + field + "\\",\\"message\\":\\"" + message + "\\"}"));
            json.append(list);
        }
        return json.append('}').toString();
    }
}

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(in.readLine().trim());
        UserApi api = new UserApi();
        for (int i = 0; i < n; i++) {
            String[] parts = in.readLine().trim().split("\\\\s+");
            Map<String, String> body = new HashMap<>();
            for (int k = 3; k < parts.length; k++) {
                int eq = parts[k].indexOf('=');
                body.put(parts[k].substring(0, eq), parts[k].substring(eq + 1));
            }
            System.out.println(api.handle(parts[0], parts[1], parts[2], body));
        }
    }
}`,
    solutionExplanation:
      'The solution mirrors how Spring layers a request. Routing decides 404 versus 405 before anything else looks at the request; argument resolution then converts the path variable (400 on a type mismatch) and checks the Content-Type (415, with a missing header treated as application/octet-stream just as Spring does) before the body is read. Deserialization failure (400 "Failed to read request") is different from validation failure: the first means no object could be built, the second that an object exists but breaks its constraints, so all violations are collected and reported together. Business rules such as the unique email run last, in the service layer, and map to 409. Every failure is a ProblemException caught in exactly one place, the equivalent of a @RestControllerAdvice extending ResponseEntityExceptionHandler, so the response format cannot drift between endpoints.',
    complexity: { time: 'O(u) per request for the email check, O(1) otherwise', space: 'O(u) for u stored users' },
    hints: [
      'Throw one exception type that carries status, detail and field errors from anywhere in the pipeline, and render it in a single catch.',
      'Check the order: 404 then 405 then path conversion; for POST, media type before reading the body, reading before validating, validating before the duplicate check.',
      'A TreeMap of field -> message gives you the sorted errors array for free.',
      'Is GET /users/0 a conversion error? No — 0 is a valid number; it is simply not found.',
    ],
    tests: [
      {
        id: 't1',
        name: 'Create, read, delete',
        stdin: '6\nPOST /users application/json name=ada email=ada@lovelace.dev age=36\nGET /users/1 -\nGET /users -\nDELETE /users/1 -\nGET /users/1 -\nGET /users -\n',
        expectedStdout: '201 Created Location: /users/1\n200 OK {"id":1,"name":"ada","email":"ada@lovelace.dev","age":36}\n200 OK {"count":1}\n204 No Content\n404 {"type":"about:blank","title":"Not Found","status":404,"detail":"User 1 not found","instance":"/users/1"}\n200 OK {"count":0}',
      },
      {
        id: 't2',
        name: 'Validation and unreadable bodies',
        stdin: '4\nPOST /users application/json name= email=not-an-email age=12\nPOST /users application/json email=x@y\nPOST /users application/json name=bob email=bob@x.io age=forty\nPOST /users application/json name=bob email=a@b@c age=200\n',
        expectedStdout: '400 {"type":"about:blank","title":"Bad Request","status":400,"detail":"Invalid request content.","instance":"/users","errors":[{"field":"age","message":"must be greater than or equal to 18"},{"field":"email","message":"must be a well-formed email address"},{"field":"name","message":"must not be blank"}]}\n400 {"type":"about:blank","title":"Bad Request","status":400,"detail":"Invalid request content.","instance":"/users","errors":[{"field":"age","message":"must not be null"},{"field":"name","message":"must not be blank"}]}\n400 {"type":"about:blank","title":"Bad Request","status":400,"detail":"Failed to read request","instance":"/users"}\n400 {"type":"about:blank","title":"Bad Request","status":400,"detail":"Invalid request content.","instance":"/users","errors":[{"field":"age","message":"must be less than or equal to 130"},{"field":"email","message":"must be a well-formed email address"}]}',
      },
      {
        id: 't3',
        name: 'Routing, methods and media types',
        stdin: '6\nGET /orders -\nPUT /users/3 application/json name=x\nDELETE /users -\nPOST /users text/plain name=x\nPOST /users - name=x\nGET /users/abc -\n',
        expectedStdout: '404 {"type":"about:blank","title":"Not Found","status":404,"detail":"No endpoint GET /orders.","instance":"/orders"}\n405 {"type":"about:blank","title":"Method Not Allowed","status":405,"detail":"Method \'PUT\' is not supported.","instance":"/users/3"}\n405 {"type":"about:blank","title":"Method Not Allowed","status":405,"detail":"Method \'DELETE\' is not supported.","instance":"/users"}\n415 {"type":"about:blank","title":"Unsupported Media Type","status":415,"detail":"Content-Type \'text/plain\' is not supported.","instance":"/users"}\n415 {"type":"about:blank","title":"Unsupported Media Type","status":415,"detail":"Content-Type \'application/octet-stream\' is not supported.","instance":"/users"}\n400 {"type":"about:blank","title":"Bad Request","status":400,"detail":"Failed to convert \'id\' with value: \'abc\'","instance":"/users/abc"}',
      },
      {
        id: 't4',
        name: 'Pipeline order, conflicts and boundaries',
        stdin: '9\nPOST /users application/json name=ann email=ann@x.io age=30\nPOST /users application/json name=ann2 email=ann@x.io age=31\nPOST /users text/plain age=oops\nPOST /users application/json name=cy email=cy@x.io age=18 role=admin\nGET /users/0 -\nGET /users/ -\nPATCH /users/abc -\nPOST /users application/json name=dee email=dee@x.io age=130\nGET /users/3 -\n',
        expectedStdout: '201 Created Location: /users/1\n409 {"type":"about:blank","title":"Conflict","status":409,"detail":"Email ann@x.io is already registered","instance":"/users"}\n415 {"type":"about:blank","title":"Unsupported Media Type","status":415,"detail":"Content-Type \'text/plain\' is not supported.","instance":"/users"}\n201 Created Location: /users/2\n404 {"type":"about:blank","title":"Not Found","status":404,"detail":"User 0 not found","instance":"/users/0"}\n404 {"type":"about:blank","title":"Not Found","status":404,"detail":"No endpoint GET /users/.","instance":"/users/"}\n405 {"type":"about:blank","title":"Method Not Allowed","status":405,"detail":"Method \'PATCH\' is not supported.","instance":"/users/abc"}\n201 Created Location: /users/3\n200 OK {"id":3,"name":"dee","email":"dee@x.io","age":130}',
        hidden: true,
      },
    ],
  },
  {
    id: 'ch-transactional-rules',
    title: '@Transactional rollback-rule simulator',
    moduleId: 'spring',
    lessonId: 'sp-data-tx',
    difficulty: 'advanced',
    kind: 'coding',
    dimension: 'coding',
    concepts: ['@Transactional propagation', 'rollback rules (checked vs unchecked)', 'REQUIRES_NEW suspension', 'rollback-only and UnexpectedRollbackException', 'proxy self-invocation'],
    description: `Simulate how Spring's transaction proxy treats \`@Transactional\` methods. The parsing and the method bodies are written for you; implement the proxy in \`viaProxy\`.

Input: m method lines \`<name> <PROPAGATION> [rollbackFor=Ex1,Ex2] | step | step ...\`, then k lines naming the methods to run, one after another. PROPAGATION is \`REQUIRED\`, \`REQUIRES_NEW\` or \`NONE\` (no annotation). Steps:
- \`write <x>\` — inside a transaction it is buffered in that transaction; outside it auto-commits.
- \`call <m>\` — calls another bean's method **through the proxy**.
- \`try <m>\` — like \`call\`, but catches any exception and prints \`caught <Ex> from <m>\`.
- \`self <m>\` — \`this.m()\`: self-invocation **bypasses the proxy**, so m's annotation is ignored and its body simply runs in the caller's context.
- \`throw checked <Ex>\` / \`throw unchecked <Ex>\` — throws; the rest of the body is skipped.

Proxy rules:
- \`NONE\`: just run the body.
- \`REQUIRED\`: with no current transaction, **begin** one (print \`begin tx<id> <method>\`; ids count up from 1 across the whole run). Otherwise **join** the current one.
- \`REQUIRES_NEW\`: suspend the current transaction (if any), begin a new one, and resume the old one afterwards, whatever happens.
- A method **rolls back on** an exception if it is unchecked or its name is in that method's \`rollbackFor\`. Checked exceptions otherwise **commit**.
- When the method that began a transaction ends: on an exception it rolls back (\`rollback tx<id> [writes]\`) if it rolls back on that exception, else commits; then the exception propagates. On normal return it commits (\`commit tx<id> [writes]\`, and the writes reach the database).
- When a method that **joined** throws an exception it rolls back on, it marks the transaction: \`mark tx<id> rollback-only (<method> threw <Ex>)\`, and the exception propagates.
- Committing a rollback-only transaction rolls it back instead and throws an unchecked \`UnexpectedRollbackException\` (which replaces any exception already in flight).

Each run prints \`> run <m>\`, its events, then \`< <m> ok\` or \`< <m> threw <Ex>\`. Finally print \`db=[...]\`, the committed writes in commit order. Write lists print like \`List.toString()\`.`,
    starterCode: `import java.io.*;
import java.util.*;

/** A simulated application exception: its name, and whether Java would treat it as checked. */
class SimException extends RuntimeException {
    final String name;
    final boolean checked;

    SimException(String name, boolean checked) {
        super(name, null, false, false);
        this.name = name;
        this.checked = checked;
    }
}

record MethodDef(String name, String propagation, Set<String> rollbackFor, List<String> steps) {}

final class Tx {
    final int id;
    final List<String> writes = new ArrayList<>();
    boolean rollbackOnly;

    Tx(int id) {
        this.id = id;
    }
}

final class TxSimulator {
    private final Map<String, MethodDef> methods;
    private final List<String> database = new ArrayList<>();
    private final List<String> out = new ArrayList<>();
    private Tx current;
    private int nextTxId = 1;

    TxSimulator(Map<String, MethodDef> methods) {
        this.methods = methods;
    }

    void run(String name) {
        out.add("> run " + name);
        try {
            viaProxy(name);
            out.add("< " + name + " ok");
        } catch (SimException e) {
            out.add("< " + name + " threw " + e.name);
        }
        current = null;
    }

    List<String> output() {
        List<String> all = new ArrayList<>(out);
        all.add("db=" + database);
        return all;
    }

    /** A call that goes through the Spring proxy: the annotation should be honoured. */
    private void viaProxy(String name) {
        MethodDef m = methods.get(name);
        // TODO: begin / join / suspend transactions according to m.propagation(),
        // and commit, roll back or mark rollback-only when the body finishes.
        body(m);
    }

    /** The method's own code. Note that "self" calls never reach the proxy. */
    private void body(MethodDef m) {
        for (String step : m.steps()) {
            String[] p = step.split(" ");
            switch (p[0]) {
                case "write" -> {
                    if (current == null) {
                        database.add(p[1]);
                        out.add("write " + p[1] + " (autocommit)");
                    } else {
                        current.writes.add(p[1]);
                        out.add("write " + p[1] + " -> tx" + current.id);
                    }
                }
                case "call" -> viaProxy(p[1]);
                case "self" -> body(methods.get(p[1]));
                case "try" -> {
                    try {
                        viaProxy(p[1]);
                    } catch (SimException e) {
                        out.add("caught " + e.name + " from " + p[1]);
                    }
                }
                case "throw" -> throw new SimException(p[2], p[1].equals("checked"));
                default -> throw new IllegalArgumentException(step);
            }
        }
    }
}

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int m = Integer.parseInt(in.readLine().trim());
        Map<String, MethodDef> methods = new HashMap<>();
        for (int i = 0; i < m; i++) {
            String[] parts = in.readLine().split("\\\\|");
            String[] head = parts[0].trim().split("\\\\s+");
            Set<String> rollbackFor = new HashSet<>();
            if (head.length > 2) rollbackFor.addAll(Arrays.asList(head[2].substring("rollbackFor=".length()).split(",")));
            List<String> steps = new ArrayList<>();
            for (int k = 1; k < parts.length; k++) steps.add(parts[k].trim());
            methods.put(head[0], new MethodDef(head[0], head[1], rollbackFor, steps));
        }
        TxSimulator sim = new TxSimulator(methods);
        int k = Integer.parseInt(in.readLine().trim());
        for (int i = 0; i < k; i++) sim.run(in.readLine().trim());
        sim.output().forEach(System.out::println);
    }
}`,
    solution: `import java.io.*;
import java.util.*;

/** A simulated application exception: its name, and whether Java would treat it as checked. */
class SimException extends RuntimeException {
    final String name;
    final boolean checked;

    SimException(String name, boolean checked) {
        super(name, null, false, false);
        this.name = name;
        this.checked = checked;
    }
}

record MethodDef(String name, String propagation, Set<String> rollbackFor, List<String> steps) {}

final class Tx {
    final int id;
    final List<String> writes = new ArrayList<>();
    boolean rollbackOnly;

    Tx(int id) {
        this.id = id;
    }
}

final class TxSimulator {
    private final Map<String, MethodDef> methods;
    private final List<String> database = new ArrayList<>();
    private final List<String> out = new ArrayList<>();
    private Tx current;
    private int nextTxId = 1;

    TxSimulator(Map<String, MethodDef> methods) {
        this.methods = methods;
    }

    void run(String name) {
        out.add("> run " + name);
        try {
            viaProxy(name);
            out.add("< " + name + " ok");
        } catch (SimException e) {
            out.add("< " + name + " threw " + e.name);
        }
        current = null;
    }

    List<String> output() {
        List<String> all = new ArrayList<>(out);
        all.add("db=" + database);
        return all;
    }

    /** A call that goes through the Spring proxy: the annotation is honoured. */
    private void viaProxy(String name) {
        MethodDef m = methods.get(name);
        switch (m.propagation()) {
            case "NONE" -> body(m);
            case "REQUIRED" -> {
                if (current == null) {
                    runInNewTransaction(m);
                } else {
                    participate(m);
                }
            }
            case "REQUIRES_NEW" -> {
                Tx suspended = current;
                try {
                    runInNewTransaction(m);
                } finally {
                    current = suspended;
                }
            }
            default -> throw new IllegalArgumentException(m.propagation());
        }
    }

    private void participate(MethodDef m) {
        Tx tx = current;
        try {
            body(m);
        } catch (SimException e) {
            if (rollsBackOn(m, e)) {
                tx.rollbackOnly = true;
                out.add("mark tx" + tx.id + " rollback-only (" + m.name() + " threw " + e.name + ")");
            }
            throw e;
        }
    }

    private void runInNewTransaction(MethodDef m) {
        Tx tx = new Tx(nextTxId++);
        current = tx;
        out.add("begin tx" + tx.id + " " + m.name());
        try {
            body(m);
        } catch (SimException e) {
            current = null;
            if (rollsBackOn(m, e)) {
                rollback(tx);
            } else {
                commit(tx);          // may itself throw UnexpectedRollbackException, which wins
            }
            throw e;
        }
        current = null;
        commit(tx);
    }

    private void commit(Tx tx) {
        if (tx.rollbackOnly) {
            rollback(tx);
            throw new SimException("UnexpectedRollbackException", false);
        }
        database.addAll(tx.writes);
        out.add("commit tx" + tx.id + " " + tx.writes);
    }

    private void rollback(Tx tx) {
        out.add("rollback tx" + tx.id + " " + tx.writes);
    }

    private static boolean rollsBackOn(MethodDef m, SimException e) {
        return !e.checked || m.rollbackFor().contains(e.name);
    }

    /** The method's own code. Note that "self" calls never reach the proxy. */
    private void body(MethodDef m) {
        for (String step : m.steps()) {
            String[] p = step.split(" ");
            switch (p[0]) {
                case "write" -> {
                    if (current == null) {
                        database.add(p[1]);
                        out.add("write " + p[1] + " (autocommit)");
                    } else {
                        current.writes.add(p[1]);
                        out.add("write " + p[1] + " -> tx" + current.id);
                    }
                }
                case "call" -> viaProxy(p[1]);
                case "self" -> body(methods.get(p[1]));
                case "try" -> {
                    try {
                        viaProxy(p[1]);
                    } catch (SimException e) {
                        out.add("caught " + e.name + " from " + p[1]);
                    }
                }
                case "throw" -> throw new SimException(p[2], p[1].equals("checked"));
                default -> throw new IllegalArgumentException(step);
            }
        }
    }
}

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int m = Integer.parseInt(in.readLine().trim());
        Map<String, MethodDef> methods = new HashMap<>();
        for (int i = 0; i < m; i++) {
            String[] parts = in.readLine().split("\\\\|");
            String[] head = parts[0].trim().split("\\\\s+");
            Set<String> rollbackFor = new HashSet<>();
            if (head.length > 2) rollbackFor.addAll(Arrays.asList(head[2].substring("rollbackFor=".length()).split(",")));
            List<String> steps = new ArrayList<>();
            for (int k = 1; k < parts.length; k++) steps.add(parts[k].trim());
            methods.put(head[0], new MethodDef(head[0], head[1], rollbackFor, steps));
        }
        TxSimulator sim = new TxSimulator(methods);
        int k = Integer.parseInt(in.readLine().trim());
        for (int i = 0; i < k; i++) sim.run(in.readLine().trim());
        sim.output().forEach(System.out::println);
    }
}`,
    solutionExplanation:
      'The proxy is a small state machine around the current transaction. REQUIRED begins a transaction only when none is active and otherwise joins it, so only the method that began it decides commit or rollback; a joining method can merely vote, by marking the shared transaction rollback-only. That is why catching the exception in the caller (try validate) does not save the transaction: the commit discovers the mark, rolls back anyway and throws UnexpectedRollbackException. REQUIRES_NEW suspends the caller\'s transaction and owns an independent one, so the audit entry commits even though the checkout rolls back, and an inner failure can be caught without poisoning the outer transaction. The default rollback rule (roll back on RuntimeException and Error, commit on checked exceptions unless rollbackFor says otherwise) surprises people with checked IOExceptions. Finally, self calls never pass through the proxy, so annotations on the called method are silently ignored: the writes in "batch" auto-commit and logAttempt joins signup\'s transaction instead of starting its own.',
    complexity: { time: 'O(total steps executed)', space: 'O(call depth + writes)' },
    hints: [
      'Track the current transaction in a field. REQUIRES_NEW saves it in a local, sets a new one, and restores it in a finally block.',
      'Write two paths: runInNewTransaction (owner: begin, run, then commit or roll back) and participate (joiner: run, and on a rolling-back exception mark rollback-only before rethrowing).',
      'commit() must check the rollback-only flag first: roll back and throw UnexpectedRollbackException instead of committing.',
      'rollsBackOn(m, e) = !e.checked || m.rollbackFor().contains(e.name) — and it uses the rules of the method whose proxy saw the exception.',
    ],
    tests: [
      {
        id: 't1',
        name: 'Unchecked rolls back, checked commits',
        stdin: '3\nplaceOrder REQUIRED | write order | throw unchecked IllegalStateException\nimportFile REQUIRED | write row1 | throw checked IOException\nimportStrict REQUIRED rollbackFor=IOException | write row2 | throw checked IOException\n3\nplaceOrder\nimportFile\nimportStrict\n',
        expectedStdout: '> run placeOrder\nbegin tx1 placeOrder\nwrite order -> tx1\nrollback tx1 [order]\n< placeOrder threw IllegalStateException\n> run importFile\nbegin tx2 importFile\nwrite row1 -> tx2\ncommit tx2 [row1]\n< importFile threw IOException\n> run importStrict\nbegin tx3 importStrict\nwrite row2 -> tx3\nrollback tx3 [row2]\n< importStrict threw IOException\ndb=[row1]',
      },
      {
        id: 't2',
        name: 'REQUIRES_NEW survives the outer rollback',
        stdin: '3\ncheckout REQUIRED | write order | call audit | call charge\naudit REQUIRES_NEW | write audit-entry\ncharge REQUIRED | write payment | throw unchecked PaymentDeclinedException\n1\ncheckout\n',
        expectedStdout: '> run checkout\nbegin tx1 checkout\nwrite order -> tx1\nbegin tx2 audit\nwrite audit-entry -> tx2\ncommit tx2 [audit-entry]\nwrite payment -> tx1\nmark tx1 rollback-only (charge threw PaymentDeclinedException)\nrollback tx1 [order, payment]\n< checkout threw PaymentDeclinedException\ndb=[audit-entry]',
      },
      {
        id: 't3',
        name: 'Self-invocation bypasses the proxy',
        stdin: '5\nbatch NONE | self saveAll\nsaveAll REQUIRED | write a | write b | throw unchecked IllegalStateException\nbatchProxied NONE | call saveAll\nsignup REQUIRED | write account | self logAttempt | throw unchecked IllegalStateException\nlogAttempt REQUIRES_NEW | write attempt\n3\nbatch\nbatchProxied\nsignup\n',
        expectedStdout: '> run batch\nwrite a (autocommit)\nwrite b (autocommit)\n< batch threw IllegalStateException\n> run batchProxied\nbegin tx1 saveAll\nwrite a -> tx1\nwrite b -> tx1\nrollback tx1 [a, b]\n< batchProxied threw IllegalStateException\n> run signup\nbegin tx2 signup\nwrite account -> tx2\nwrite attempt -> tx2\nrollback tx2 [account, attempt]\n< signup threw IllegalStateException\ndb=[a, b]',
      },
      {
        id: 't4',
        name: 'Catching does not undo rollback-only',
        stdin: '6\ntransfer REQUIRED | write debit | try validate | write credit\nvalidate REQUIRED | throw unchecked IllegalArgumentException\ntransferSafe REQUIRED | write debit2 | try validateNew | write credit2\nvalidateNew REQUIRES_NEW | throw unchecked IllegalArgumentException\nreserve REQUIRED | write hold | try checkStock\ncheckStock REQUIRED | throw checked OutOfStockException\n3\ntransfer\ntransferSafe\nreserve\n',
        expectedStdout: '> run transfer\nbegin tx1 transfer\nwrite debit -> tx1\nmark tx1 rollback-only (validate threw IllegalArgumentException)\ncaught IllegalArgumentException from validate\nwrite credit -> tx1\nrollback tx1 [debit, credit]\n< transfer threw UnexpectedRollbackException\n> run transferSafe\nbegin tx2 transferSafe\nwrite debit2 -> tx2\nbegin tx3 validateNew\nrollback tx3 []\ncaught IllegalArgumentException from validateNew\nwrite credit2 -> tx2\ncommit tx2 [debit2, credit2]\n< transferSafe ok\n> run reserve\nbegin tx4 reserve\nwrite hold -> tx4\ncaught OutOfStockException from checkStock\ncommit tx4 [hold]\n< reserve ok\ndb=[debit2, credit2, hold]',
        hidden: true,
      },
      {
        id: 't5',
        name: 'UnexpectedRollbackException from an inner REQUIRES_NEW',
        stdin: '4\nouter REQUIRED | write o | try inner | write o2\ninner REQUIRES_NEW | write i | try leaf | write i2\nleaf REQUIRED rollbackFor=QuotaException | throw checked QuotaException\nplain NONE | write log | call outer | write log2\n1\nplain\n',
        expectedStdout: '> run plain\nwrite log (autocommit)\nbegin tx1 outer\nwrite o -> tx1\nbegin tx2 inner\nwrite i -> tx2\nmark tx2 rollback-only (leaf threw QuotaException)\ncaught QuotaException from leaf\nwrite i2 -> tx2\nrollback tx2 [i, i2]\ncaught UnexpectedRollbackException from inner\nwrite o2 -> tx1\ncommit tx1 [o, o2]\nwrite log2 (autocommit)\n< plain ok\ndb=[log, o, o2, log2]',
        hidden: true,
      },
    ],
  },
  {
    id: 'boss-security-filter-chain',
    title: 'Boss: security filter chain',
    moduleId: 'spring',
    lessonId: 'sp-security',
    difficulty: 'advanced',
    kind: 'boss',
    dimension: 'coding',
    concepts: ['authentication vs authorization', '401 vs 403', 'first-match request rules', 'Ant-style path patterns', 'role hierarchy', 'JWT scopes as authorities'],
    description: `Spring module capstone. Model the decisions a Spring Security filter chain makes for a resource server that accepts bearer JWTs, and print the HTTP status for each request.

Input, in sections:
- \`now <epochSeconds>\`
- \`hierarchy <A>B>C | ->\` — e.g. \`ADMIN>STAFF>USER\`: each role implies every role to its right. \`-\` means none.
- \`rules <n>\`, then n lines \`<METHOD|*> <pattern> <access>\`. Access is \`permitAll\`, \`denyAll\`, \`authenticated\`, \`hasRole:R\`, \`hasAnyRole:R1,R2\` or \`hasAuthority:A\`.
- \`tokens <m>\`, then m lines \`<tokenId> sub=<user> exp=<epochSeconds> roles=<R1,R2|-> scope=<s1,s2|->\`. Roles become authorities \`ROLE_<r>\`, scopes become \`SCOPE_<s>\`.
- \`requests <k>\`, then k lines \`<METHOD> <path> <auth>\` where auth is \`-\` (anonymous) or \`bearer:<tokenId>\`.

Patterns are Ant-style and matched segment by segment: \`*\` matches any characters within **one** segment (so \`*.css\` works), \`**\` matches zero or more **whole** segments (so \`/api/**\` matches \`/api\` and \`/api/a/b\`, but \`/public/**\` does not match \`/publicity\`).

Decide each request in filter order:
1. **Authentication.** A bearer token that is unknown → \`401 <METHOD> <path> invalid_token: unknown\`; one with \`now >= exp\` → \`401 ... invalid_token: expired\`. This happens before any rule, so it applies even to permitAll paths.
2. **Authorization.** The **first** rule whose method (or \`*\`) and pattern match decides. If none matches, access is denied. \`hasRole\`/\`hasAnyRole\` check \`ROLE_\` authorities (expanded through the hierarchy); \`hasAuthority\` checks the exact authority. A role never implies a scope.
3. **Outcome.** Granted → \`200 <METHOD> <path> <user|anonymous> (rule <i>)\`. Denied for an anonymous request → \`401 <METHOD> <path> authentication required (rule <i>)\`. Denied for an authenticated user → \`403 <METHOD> <path> <user> access denied (rule <i>)\`. Use \`(no rule)\` when nothing matched. Rules are numbered from 1.

Finish with \`summary 200=<a> 401=<b> 403=<c>\`.`,
    starterCode: `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        long now = Long.parseLong(in.readLine().trim().split("\\\\s+")[1]);
        String hierarchy = in.readLine().trim().split("\\\\s+")[1];

        int ruleCount = Integer.parseInt(in.readLine().trim().split("\\\\s+")[1]);
        List<String[]> rules = new ArrayList<>();
        for (int i = 0; i < ruleCount; i++) rules.add(in.readLine().trim().split("\\\\s+"));

        int tokenCount = Integer.parseInt(in.readLine().trim().split("\\\\s+")[1]);
        List<String[]> tokens = new ArrayList<>();
        for (int i = 0; i < tokenCount; i++) tokens.add(in.readLine().trim().split("\\\\s+"));

        int requestCount = Integer.parseInt(in.readLine().trim().split("\\\\s+")[1]);
        for (int i = 0; i < requestCount; i++) {
            String[] request = in.readLine().trim().split("\\\\s+");
            // TODO: authenticate the token, find the first matching rule, decide 200/401/403
            System.out.println("200 " + request[0] + " " + request[1] + " anonymous (no rule)");
        }
        System.out.println("summary 200=" + requestCount + " 401=0 403=0");
    }
}`,
    solution: `import java.io.*;
import java.util.*;

record Rule(int number, String method, String pattern, String access, Set<String> required) {
    boolean matches(String requestMethod, String path) {
        return (method.equals("*") || method.equals(requestMethod)) && PathPattern.matches(pattern, path);
    }
}

record Token(String subject, long expiresAt, Set<String> authorities) {}

/** Ant-style matching: "*" matches within one segment, "**" matches zero or more whole segments. */
final class PathPattern {
    static boolean matches(String pattern, String path) {
        return match(split(pattern), 0, split(path), 0);
    }

    private static List<String> split(String s) {
        List<String> parts = new ArrayList<>();
        for (String p : s.split("/")) if (!p.isEmpty()) parts.add(p);
        return parts;
    }

    private static boolean match(List<String> pat, int i, List<String> path, int j) {
        if (i == pat.size()) return j == path.size();
        if (pat.get(i).equals("**")) {
            for (int k = j; k <= path.size(); k++) {
                if (match(pat, i + 1, path, k)) return true;
            }
            return false;
        }
        return j < path.size() && segment(pat.get(i), path.get(j)) && match(pat, i + 1, path, j + 1);
    }

    private static boolean segment(String pat, String s) {
        String regex = Arrays.stream(pat.split("\\\\*", -1))
            .map(part -> part.isEmpty() ? "" : java.util.regex.Pattern.quote(part))
            .reduce((a, b) -> a + "[^/]*" + b).orElse("");
        return s.matches(regex);
    }
}

final class SecurityFilterChain {
    private final long now;
    private final Map<String, List<String>> impliedRoles;
    private final List<Rule> rules;
    private final Map<String, Token> tokens;

    SecurityFilterChain(long now, Map<String, List<String>> impliedRoles, List<Rule> rules, Map<String, Token> tokens) {
        this.now = now;
        this.impliedRoles = impliedRoles;
        this.rules = rules;
        this.tokens = tokens;
    }

    String decide(String method, String path, String auth) {
        String request = method + " " + path;
        // 1. Authentication filter: a bad token is rejected before any authorization rule runs.
        Token token = null;
        if (auth.startsWith("bearer:")) {
            token = tokens.get(auth.substring("bearer:".length()));
            if (token == null) return "401 " + request + " invalid_token: unknown";
            if (now >= token.expiresAt()) return "401 " + request + " invalid_token: expired";
        }
        String who = token == null ? "anonymous" : token.subject();
        // 2. Authorization filter: the first matching rule decides.
        Rule rule = rules.stream().filter(r -> r.matches(method, path)).findFirst().orElse(null);
        String where = rule == null ? "(no rule)" : "(rule " + rule.number() + ")";
        boolean granted = rule != null && switch (rule.access()) {
            case "permitAll" -> true;
            case "denyAll" -> false;
            case "authenticated" -> token != null;
            default -> token != null && hasAny(token, rule.required());
        };
        if (granted) return "200 " + request + " " + who + " " + where;
        // 3. Exception translation: anonymous users are asked to log in, known users are forbidden.
        if (token == null) return "401 " + request + " authentication required " + where;
        return "403 " + request + " " + who + " access denied " + where;
    }

    private boolean hasAny(Token token, Set<String> required) {
        Set<String> effective = new HashSet<>();
        for (String authority : token.authorities()) {
            effective.add(authority);
            if (authority.startsWith("ROLE_")) {
                for (String implied : impliedRoles.getOrDefault(authority.substring(5), List.of())) {
                    effective.add("ROLE_" + implied);
                }
            }
        }
        return required.stream().anyMatch(effective::contains);
    }
}

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        long now = Long.parseLong(in.readLine().trim().split("\\\\s+")[1]);

        String hierarchy = in.readLine().trim().split("\\\\s+")[1];
        Map<String, List<String>> implied = new HashMap<>();
        if (!hierarchy.equals("-")) {
            String[] chain = hierarchy.split(">");
            for (int i = 0; i < chain.length; i++) {
                implied.put(chain[i], Arrays.asList(chain).subList(i + 1, chain.length));
            }
        }

        int ruleCount = Integer.parseInt(in.readLine().trim().split("\\\\s+")[1]);
        List<Rule> rules = new ArrayList<>();
        for (int i = 1; i <= ruleCount; i++) {
            String[] p = in.readLine().trim().split("\\\\s+");
            String[] access = p[2].split(":", 2);
            Set<String> required = new HashSet<>();
            if (access.length == 2) {
                for (String value : access[1].split(",")) {
                    required.add(access[0].equals("hasAuthority") ? value : "ROLE_" + value);
                }
            }
            rules.add(new Rule(i, p[0], p[1], access[0], required));
        }

        int tokenCount = Integer.parseInt(in.readLine().trim().split("\\\\s+")[1]);
        Map<String, Token> tokens = new HashMap<>();
        for (int i = 0; i < tokenCount; i++) {
            String[] p = in.readLine().trim().split("\\\\s+");
            Map<String, String> claims = new HashMap<>();
            for (int k = 1; k < p.length; k++) {
                String[] kv = p[k].split("=", 2);
                claims.put(kv[0], kv[1]);
            }
            Set<String> authorities = new HashSet<>();
            for (String role : claims.getOrDefault("roles", "-").split(",")) {
                if (!role.equals("-")) authorities.add("ROLE_" + role);
            }
            for (String scope : claims.getOrDefault("scope", "-").split(",")) {
                if (!scope.equals("-")) authorities.add("SCOPE_" + scope);
            }
            tokens.put(p[0], new Token(claims.get("sub"), Long.parseLong(claims.get("exp")), authorities));
        }

        SecurityFilterChain chain = new SecurityFilterChain(now, implied, rules, tokens);
        int requestCount = Integer.parseInt(in.readLine().trim().split("\\\\s+")[1]);
        Map<String, Integer> counts = new TreeMap<>(Map.of("200", 0, "401", 0, "403", 0));
        for (int i = 0; i < requestCount; i++) {
            String[] p = in.readLine().trim().split("\\\\s+");
            String line = chain.decide(p[0], p[1], p[2]);
            counts.merge(line.substring(0, 3), 1, Integer::sum);
            System.out.println(line);
        }
        System.out.println("summary 200=" + counts.get("200") + " 401=" + counts.get("401") + " 403=" + counts.get("403"));
    }
}`,
    solutionExplanation:
      'The decision follows the real filter order. The bearer-token filter authenticates first, so an expired or unknown token is a 401 even on a permitAll path: the request never reaches authorization. Authorization is a first-match list, exactly like authorizeHttpRequests, which is why rule order matters: DELETE /api/orders/7/items is not covered by "/api/orders/*" (one segment only) and falls through to the broad "/api/**" authenticated rule — a classic misconfiguration the tests expose. Requests no rule matches are denied, as Spring Security 6 does. A denial becomes 401 when the caller is anonymous (ExceptionTranslationFilter starts authentication) and 403 when the caller is known but lacks the authority. Roles expand through the hierarchy before the check, while JWT scopes stay separate SCOPE_ authorities, so an ADMIN without the orders.read scope is still forbidden from a scope-protected endpoint.',
    complexity: { time: 'O(k * r * p) for k requests, r rules and path length p', space: 'O(r + m)' },
    hints: [
      'Do authentication completely before looking at any rule; a bad token ends the request with 401 straight away.',
      'Match patterns on lists of segments. "**" tries every possible number of segments (recursion), "*" inside a segment becomes the regex [^/]*.',
      'Build the effective authorities of a token once per request: its own authorities plus every role implied by the hierarchy.',
      'The only difference between 401 and 403 for a denied request is whether there is an authenticated user.',
    ],
    tests: [
      {
        id: 't1',
        name: 'Roles, scopes and anonymous users',
        stdin: 'now 1000\nhierarchy ADMIN>STAFF>USER\nrules 8\n* /public/** permitAll\nGET /assets/*.css permitAll\nGET /api/orders/** hasAuthority:SCOPE_orders.read\nPOST /api/orders hasAnyRole:STAFF,USER\nDELETE /api/orders/* hasRole:ADMIN\n* /admin/** hasRole:ADMIN\n* /internal/** denyAll\n* /api/** authenticated\ntokens 4\nt-alice sub=alice exp=5000 roles=ADMIN scope=-\nt-bob sub=bob exp=5000 roles=USER scope=orders.read\nt-old sub=carol exp=900 roles=ADMIN scope=orders.read\nt-svc sub=reporting exp=5000 roles=- scope=orders.read,orders.export\nrequests 8\nGET /public/index.html -\nGET /api/orders bearer:t-bob\nGET /api/orders -\nDELETE /api/orders/7 bearer:t-bob\nDELETE /api/orders/7 bearer:t-alice\nGET /api/orders/7 bearer:t-alice\nGET /admin/users bearer:t-bob\nPOST /api/orders bearer:t-svc\n',
        expectedStdout: '200 GET /public/index.html anonymous (rule 1)\n200 GET /api/orders bob (rule 3)\n401 GET /api/orders authentication required (rule 3)\n403 DELETE /api/orders/7 bob access denied (rule 5)\n200 DELETE /api/orders/7 alice (rule 5)\n403 GET /api/orders/7 alice access denied (rule 3)\n403 GET /admin/users bob access denied (rule 6)\n403 POST /api/orders reporting access denied (rule 4)\nsummary 200=3 401=1 403=4',
      },
      {
        id: 't2',
        name: 'Bad tokens, denyAll and unmatched paths',
        stdin: 'now 1000\nhierarchy ADMIN>STAFF>USER\nrules 8\n* /public/** permitAll\nGET /assets/*.css permitAll\nGET /api/orders/** hasAuthority:SCOPE_orders.read\nPOST /api/orders hasAnyRole:STAFF,USER\nDELETE /api/orders/* hasRole:ADMIN\n* /admin/** hasRole:ADMIN\n* /internal/** denyAll\n* /api/** authenticated\ntokens 4\nt-alice sub=alice exp=5000 roles=ADMIN scope=-\nt-bob sub=bob exp=5000 roles=USER scope=orders.read\nt-old sub=carol exp=900 roles=ADMIN scope=orders.read\nt-svc sub=reporting exp=5000 roles=- scope=orders.read,orders.export\nrequests 7\nGET /public/x bearer:t-old\nGET /public/x bearer:nope\nGET /internal/metrics bearer:t-alice\nGET /internal/metrics -\nGET /other -\nGET /other bearer:t-bob\nPATCH /api/profile bearer:t-svc\n',
        expectedStdout: '401 GET /public/x invalid_token: expired\n401 GET /public/x invalid_token: unknown\n403 GET /internal/metrics alice access denied (rule 7)\n401 GET /internal/metrics authentication required (rule 7)\n401 GET /other authentication required (no rule)\n403 GET /other bob access denied (no rule)\n200 PATCH /api/profile reporting (rule 8)\nsummary 200=1 401=4 403=2',
      },
      {
        id: 't3',
        name: 'Role hierarchy and pattern edges',
        stdin: 'now 1000\nhierarchy ADMIN>STAFF>USER\nrules 8\n* /public/** permitAll\nGET /assets/*.css permitAll\nGET /api/orders/** hasAuthority:SCOPE_orders.read\nPOST /api/orders hasAnyRole:STAFF,USER\nDELETE /api/orders/* hasRole:ADMIN\n* /admin/** hasRole:ADMIN\n* /internal/** denyAll\n* /api/** authenticated\ntokens 4\nt-alice sub=alice exp=5000 roles=ADMIN scope=-\nt-bob sub=bob exp=5000 roles=USER scope=orders.read\nt-old sub=carol exp=900 roles=ADMIN scope=orders.read\nt-svc sub=reporting exp=5000 roles=- scope=orders.read,orders.export\nrequests 8\nPOST /api/orders bearer:t-alice\nDELETE /api/orders/7/items bearer:t-bob\nDELETE /api/orders bearer:t-bob\nGET /publicity -\nGET /public -\nGET /assets/site.css -\nGET /assets/site.js -\nGET /assets/css/site.css -\n',
        expectedStdout: '200 POST /api/orders alice (rule 4)\n200 DELETE /api/orders/7/items bob (rule 8)\n200 DELETE /api/orders bob (rule 8)\n401 GET /publicity authentication required (no rule)\n200 GET /public anonymous (rule 1)\n200 GET /assets/site.css anonymous (rule 2)\n401 GET /assets/site.js authentication required (no rule)\n401 GET /assets/css/site.css authentication required (no rule)\nsummary 200=5 401=3 403=0',
      },
      {
        id: 't4',
        name: 'No hierarchy and expiry boundary',
        stdin: 'now 1000\nhierarchy -\nrules 8\n* /public/** permitAll\nGET /assets/*.css permitAll\nGET /api/orders/** hasAuthority:SCOPE_orders.read\nPOST /api/orders hasAnyRole:STAFF,USER\nDELETE /api/orders/* hasRole:ADMIN\n* /admin/** hasRole:ADMIN\n* /internal/** denyAll\n* /api/** authenticated\ntokens 6\nt-alice sub=alice exp=5000 roles=ADMIN scope=-\nt-bob sub=bob exp=5000 roles=USER scope=orders.read\nt-old sub=carol exp=900 roles=ADMIN scope=orders.read\nt-svc sub=reporting exp=5000 roles=- scope=orders.read,orders.export\nt-staff sub=sam exp=1001 roles=STAFF scope=-\nt-edge sub=eve exp=1000 roles=ADMIN scope=orders.read\nrequests 5\nPOST /api/orders bearer:t-alice\nGET /admin/x bearer:t-staff\nPOST /api/orders bearer:t-staff\nGET /api/orders/1 bearer:t-edge\nGET /api/orders/1 bearer:t-svc\n',
        expectedStdout: '403 POST /api/orders alice access denied (rule 4)\n403 GET /admin/x sam access denied (rule 6)\n200 POST /api/orders sam (rule 4)\n401 GET /api/orders/1 invalid_token: expired\n200 GET /api/orders/1 reporting (rule 3)\nsummary 200=2 401=1 403=2',
        hidden: true,
      },
    ],
  },
  {
    id: 'boss-mini-test-runner',
    title: 'Boss: build a tiny JUnit-style runner',
    moduleId: 'testing',
    lessonId: 'ts-junit',
    difficulty: 'advanced',
    kind: 'boss',
    dimension: 'coding',
    concepts: ['test lifecycle (fresh instance per test)', 'failures vs errors', 'assertEquals with delta', 'assertThrows and subclasses', 'test isolation and shared static state', 'Surefire-style reports'],
    description: `Testing module capstone. Write the runner, not the tests: discover test cases from a plain-text description, run them against the provided \`Calculator\`, and print a Maven Surefire-style report. \`Calculator\` and \`Operations\` (which calls an operation by name) are given — **do not change them**; their bugs are what your report must reveal.

Input: n, then n lines:
- \`test <name>\` starts a test; following step lines belong to it.
- \`disabled <name> [reason ...]\` starts a disabled test; its steps are never run. The reason defaults to \`disabled\`.
- \`<op> <args...>\` — call the operation.
- \`<op> <args...> => <expected>\` — assertEquals. If the result is a \`Double\`, compare it with \`Double.parseDouble(expected)\` exactly; otherwise compare it with \`Long.parseLong(expected)\`.
- \`<op> <args...> => <expected> within <delta>\` — assertEquals for doubles with a tolerance: passes when \`|expected - actual| <= delta\`.
- \`<op> <args...> throws <Name>\` — assertThrows for \`java.lang.<Name>\`; a **subclass** also passes.

Each test runs against a **new** \`Calculator\` and stops at its first failing step. Print \`Running CalculatorTest\`, then one line per test, in input order:
- \`[PASS] <name>\`
- \`[FAIL] <name>: <message>\` for assertion failures, with JUnit 5's messages:
  - \`expected: <E> but was: <A>\` (E printed as the parsed Long/Double, e.g. \`<2.5>\`, \`<3.0>\`)
  - \`Expected java.lang.X to be thrown, but nothing was thrown.\`
  - \`Unexpected exception type thrown, expected: <java.lang.X> but was: <java.lang.Y>\`
- \`[ERROR] <name>: <exception.toString()>\` when a step throws where no exception was expected
- \`[SKIP] <name>: <reason>\`

Then \`Tests run: <all>, Failures: <f>, Errors: <e>, Skipped: <s>\` (skipped tests count as run, as in Surefire) and \`BUILD SUCCESS\` if there are no failures or errors, otherwise \`BUILD FAILURE\`.`,
    starterCode: `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(in.readLine().trim());
        List<String> lines = new ArrayList<>();
        for (int i = 0; i < n; i++) lines.add(in.readLine().trim());
        // TODO: group the lines into tests, run each against a fresh Calculator
        // (use Operations.call), classify PASS / FAIL / ERROR / SKIP and print the report.
        System.out.println("Running CalculatorTest");
        System.out.println("Tests run: 0, Failures: 0, Errors: 0, Skipped: 0");
        System.out.println("BUILD SUCCESS");
    }
}
${CALCULATOR_HARNESS}`,
    solution: `import java.io.*;
import java.util.*;

/** An assertion that did not hold: reported as a failure, not an error. */
class AssertionFailed extends RuntimeException {
    AssertionFailed(String message) {
        super(message);
    }
}

record TestCase(String name, String disabledReason, List<String> steps) {}

final class TinyRunner {
    private int run, failures, errors, skipped;
    private final List<String> report = new ArrayList<>();

    void runAll(List<TestCase> tests) {
        report.add("Running CalculatorTest");
        for (TestCase test : tests) {
            run++;
            if (test.disabledReason() != null) {
                skipped++;
                report.add("[SKIP] " + test.name() + ": " + test.disabledReason());
                continue;
            }
            Calculator fresh = new Calculator();   // per-method lifecycle: a new instance per test
            try {
                for (String step : test.steps()) execute(fresh, step);
                report.add("[PASS] " + test.name());
            } catch (AssertionFailed e) {
                failures++;
                report.add("[FAIL] " + test.name() + ": " + e.getMessage());
            } catch (RuntimeException e) {
                errors++;
                report.add("[ERROR] " + test.name() + ": " + e);
            }
        }
        report.add("Tests run: " + run + ", Failures: " + failures + ", Errors: " + errors + ", Skipped: " + skipped);
        report.add(failures + errors == 0 ? "BUILD SUCCESS" : "BUILD FAILURE");
    }

    List<String> report() {
        return report;
    }

    private static void execute(Calculator calc, String step) {
        List<String> words = new ArrayList<>(Arrays.asList(step.split("\\\\s+")));
        int arrow = words.indexOf("=>");
        int throwsAt = words.indexOf("throws");
        if (throwsAt >= 0) {
            assertThrows(words.get(throwsAt + 1), () -> call(calc, words.subList(0, throwsAt)));
        } else if (arrow >= 0) {
            Object actual = call(calc, words.subList(0, arrow));
            List<String> expectation = words.subList(arrow + 1, words.size());
            assertEquals(expectation.get(0), expectation.size() == 3 ? Double.parseDouble(expectation.get(2)) : null, actual);
        } else {
            call(calc, words);
        }
    }

    private static Object call(Calculator calc, List<String> words) {
        return Operations.call(calc, words.get(0), words.subList(1, words.size()));
    }

    private static void assertEquals(String expectedText, Double delta, Object actual) {
        Object expected;
        boolean equal;
        if (actual instanceof Double a) {
            double e = Double.parseDouble(expectedText);
            expected = e;
            equal = delta == null ? Double.doubleToLongBits(e) == Double.doubleToLongBits(a) : Math.abs(e - a) <= delta;
        } else {
            expected = Long.parseLong(expectedText);
            equal = expected.equals(actual);
        }
        if (!equal) throw new AssertionFailed("expected: <" + expected + "> but was: <" + actual + ">");
    }

    private static void assertThrows(String simpleName, Runnable action) {
        Class<?> expected;
        try {
            expected = Class.forName("java.lang." + simpleName);
        } catch (ClassNotFoundException e) {
            throw new IllegalArgumentException("unknown exception " + simpleName);
        }
        try {
            action.run();
        } catch (RuntimeException e) {
            if (expected.isInstance(e)) return;
            throw new AssertionFailed("Unexpected exception type thrown, expected: <" + expected.getName()
                + "> but was: <" + e.getClass().getName() + ">");
        }
        throw new AssertionFailed("Expected " + expected.getName() + " to be thrown, but nothing was thrown.");
    }
}

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(in.readLine().trim());
        List<TestCase> tests = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            String line = in.readLine().trim();
            String[] head = line.split("\\\\s+", 3);
            if (head[0].equals("test")) {
                tests.add(new TestCase(head[1], null, new ArrayList<>()));
            } else if (head[0].equals("disabled")) {
                tests.add(new TestCase(head[1], head.length > 2 ? head[2] : "disabled", new ArrayList<>()));
            } else {
                tests.get(tests.size() - 1).steps().add(line);
            }
        }
        TinyRunner runner = new TinyRunner();
        runner.runAll(tests);
        runner.report().forEach(System.out::println);
    }
}
${CALCULATOR_HARNESS}`,
    solutionExplanation:
      'The runner separates three outcomes the way JUnit and Surefire do. An assertion failure is a dedicated exception type thrown by the assert helpers; any other exception escaping a step is an error, meaning the test crashed rather than disproved something. assertThrows resolves the class by name and uses isInstance, so expecting RuntimeException accepts an ArithmeticException, exactly like JUnit. A fresh Calculator per test is the PER_METHOD lifecycle — and the memory tests show why it is not enough: Calculator keeps its memory in a static field, so state leaks from one test into the next and memoryIsolated fails only because of the test that ran before it. That order dependence is the hallmark of a polluted test suite. The other reported bugs are real ones a good suite catches: average uses integer division, and sqrt of a negative number silently returns NaN instead of throwing.',
    complexity: { time: 'O(total steps)', space: 'O(n) for the parsed tests' },
    hints: [
      'First group the lines into tests (name, disabled reason, steps). Only then run them.',
      'Throw your own AssertionFailed exception from the assert helpers; catch it separately from RuntimeException to tell failures from errors.',
      'For throws: Class.forName("java.lang." + name) gives the expected class; expected.isInstance(e) accepts subclasses.',
      'Double.toString(3.0) is "3.0", Long.toString(5) is "5" — format the parsed expected value, not the raw text.',
    ],
    staticChecks: [
      { id: 'calculator-unchanged', description: 'Calculator still divides with integer arithmetic (do not fix the class under test)', pattern: 'return sum / values\\.length;', mustMatch: true },
      { id: 'static-memory-kept', description: 'Calculator still keeps its memory in a static field', pattern: 'private static long memory;', mustMatch: true },
      { id: 'fresh-instance', description: 'Creates a new Calculator for each test', pattern: 'new Calculator\\(\\)', mustMatch: true },
    ],
    tests: [
      {
        id: 't1',
        name: 'All green',
        stdin: '8\ntest addsNumbers\nadd 2 3 => 5\ntest dividesWholeNumbers\ndivide 7 2 => 3\ntest divideByZero\ndivide 1 0 throws ArithmeticException\ntest factorialOfFive\nfactorial 5 => 120\n',
        expectedStdout: 'Running CalculatorTest\n[PASS] addsNumbers\n[PASS] dividesWholeNumbers\n[PASS] divideByZero\n[PASS] factorialOfFive\nTests run: 4, Failures: 0, Errors: 0, Skipped: 0\nBUILD SUCCESS',
      },
      {
        id: 't2',
        name: 'Failures, errors and skips',
        stdin: '13\ntest averageOfTwo\naverage 2 3 => 2.5\ntest sqrtOfNegative\nsqrt -4 throws IllegalArgumentException\ntest negativeFactorial\nfactorial -1 throws IllegalStateException\ntest dividesThenAdds\ndivide 10 0 => 0\nadd 1 1 => 2\ntest sqrtWithTolerance\nsqrt 2 => 1.4142 within 0.0001\ndisabled slowTest waiting for JDK-1234 fix\nfactorial 20 => 2432902008176640000\n',
        expectedStdout: 'Running CalculatorTest\n[FAIL] averageOfTwo: expected: <2.5> but was: <2.0>\n[FAIL] sqrtOfNegative: Expected java.lang.IllegalArgumentException to be thrown, but nothing was thrown.\n[FAIL] negativeFactorial: Unexpected exception type thrown, expected: <java.lang.IllegalStateException> but was: <java.lang.IllegalArgumentException>\n[ERROR] dividesThenAdds: java.lang.ArithmeticException: / by zero\n[PASS] sqrtWithTolerance\n[SKIP] slowTest: waiting for JDK-1234 fix\nTests run: 6, Failures: 3, Errors: 1, Skipped: 1\nBUILD FAILURE',
      },
      {
        id: 't3',
        name: 'Shared static state leaks between tests',
        stdin: '13\ntest memoryStartsEmpty\nmemoryRecall => 0\ntest memoryAccumulates\nmemoryAdd 5\nmemoryAdd 7\nmemoryRecall => 12\ntest memoryIsolated\nmemoryAdd 1\nmemoryRecall => 1\ntest overflowIsDetected\nfactorial 21 throws RuntimeException\ntest sqrtExact\nsqrt 9 => 3\n',
        expectedStdout: 'Running CalculatorTest\n[PASS] memoryStartsEmpty\n[PASS] memoryAccumulates\n[FAIL] memoryIsolated: expected: <1> but was: <13>\n[PASS] overflowIsDetected\n[PASS] sqrtExact\nTests run: 5, Failures: 1, Errors: 0, Skipped: 0\nBUILD FAILURE',
        hidden: true,
      },
      {
        id: 't4',
        name: 'A test stops at its first failure',
        stdin: '8\ntest empty\ndisabled later\nadd 1 1 => 3\ntest stopsAtFirstFailure\nadd 1 1 => 3\ndivide 1 0\ntest averageWithinTolerance\naverage 1 2 => 1.5 within 0.6\n',
        expectedStdout: 'Running CalculatorTest\n[PASS] empty\n[SKIP] later: disabled\n[FAIL] stopsAtFirstFailure: expected: <3> but was: <2>\n[PASS] averageWithinTolerance\nTests run: 4, Failures: 1, Errors: 0, Skipped: 1\nBUILD FAILURE',
        hidden: true,
      },
    ],
  },
  {
    id: 'boss-error-budget-alerts',
    title: 'Boss: SLO error budget and burn-rate alerts',
    moduleId: 'production',
    lessonId: 'prod-observability',
    difficulty: 'advanced',
    kind: 'boss',
    dimension: 'coding',
    concepts: ['SLOs and error budgets', 'burn rate', 'multi-window alerting', 'sliding windows over time series', 'error budget policy', 'Locale-independent formatting'],
    description: `Production module capstone. Turn per-minute request counts into the alerts and budget report an SRE team runs on.

Input: the first line is \`<target> <a> <r>\` — the availability SLO in percent (e.g. \`99.9\`), the number of alerts and the number of records. Then a alert lines \`<name> <longWindow> <shortWindow> <threshold>\` (windows in minutes, threshold a burn rate such as \`14.4\`). Then r records \`<minute> <good> <bad>\`, minutes strictly increasing (gaps mean no traffic).

Definitions:
- **Error budget fraction** = 1 - target/100 (0.001 for 99.9%).
- **Burn rate** over a window of W minutes ending at minute t = (bad / total over the records with minute in (t - W, t]) / budget fraction. A window with no requests has burn rate 0. A burn rate of 1 spends the budget exactly over the SLO period.
- An alert **breaches** at t when **both** its long and short window burn rates are >= threshold (the long window proves it is significant, the short one that it is still happening).

After each record, check the alerts in input order and print only state changes:
- \`[t=<minute>] FIRING <name> long=<x>x short=<y>x\` (one decimal place)
- \`[t=<minute>] RESOLVED <name>\`

Then the report, over all records:
- \`requests=<total> errors=<bad> availability=<p>%\` (three decimals; 100.000 when there was no traffic)
- \`budget allowed=<total x fraction> consumed=<bad / allowed x 100>% remaining=<100 - consumed>%\` (one decimal each; consumed is 0 when allowed is 0)
- \`still firing: <names in input order joined by ", " | none>\`
- \`policy: FREEZE\` if consumed >= 100, else \`policy: OK\`

Format numbers with \`Locale.ROOT\` so the decimal separator is always a dot.`,
    starterCode: `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        String[] first = in.readLine().trim().split("\\\\s+");
        String target = first[0];
        int alertCount = Integer.parseInt(first[1]);
        int recordCount = Integer.parseInt(first[2]);
        List<String[]> alerts = new ArrayList<>();
        for (int i = 0; i < alertCount; i++) alerts.add(in.readLine().trim().split("\\\\s+"));
        long total = 0;
        long bad = 0;
        for (int i = 0; i < recordCount; i++) {
            String[] p = in.readLine().trim().split("\\\\s+");
            total += Long.parseLong(p[1]) + Long.parseLong(p[2]);
            bad += Long.parseLong(p[2]);
            // TODO: evaluate every alert's long and short window after each minute
        }
        // TODO: availability, error budget and policy lines
        System.out.println("requests=" + total + " errors=" + bad);
    }
}`,
    solution: `import java.io.*;
import java.math.BigDecimal;
import java.util.*;

record Minute(long minute, long good, long bad) {
    long total() {
        return good + bad;
    }
}

record BurnAlert(String name, int longWindow, int shortWindow, double threshold) {}

final class ErrorBudget {
    private final double budgetFraction;          // 1 - SLO target, e.g. 0.001 for 99.9%
    private final List<BurnAlert> alerts;
    private final List<Minute> history = new ArrayList<>();
    private final Set<String> firing = new LinkedHashSet<>();
    private final List<String> events = new ArrayList<>();

    ErrorBudget(String target, List<BurnAlert> alerts) {
        this.budgetFraction = new BigDecimal("100").subtract(new BigDecimal(target))
            .divide(new BigDecimal("100")).doubleValue();
        this.alerts = alerts;
    }

    void record(Minute m) {
        history.add(m);
        for (BurnAlert alert : alerts) {
            double longBurn = burnRate(m.minute(), alert.longWindow());
            double shortBurn = burnRate(m.minute(), alert.shortWindow());
            boolean breach = longBurn >= alert.threshold() && shortBurn >= alert.threshold();
            if (breach && firing.add(alert.name())) {
                events.add(String.format(Locale.ROOT, "[t=%d] FIRING %s long=%.1fx short=%.1fx",
                    m.minute(), alert.name(), longBurn, shortBurn));
            } else if (!breach && firing.remove(alert.name())) {
                events.add("[t=" + m.minute() + "] RESOLVED " + alert.name());
            }
        }
    }

    /** Burn rate over the minutes (now - window, now]: observed error ratio / allowed error ratio. */
    private double burnRate(long now, int window) {
        long total = 0;
        long bad = 0;
        for (int i = history.size() - 1; i >= 0 && history.get(i).minute() > now - window; i--) {
            total += history.get(i).total();
            bad += history.get(i).bad();
        }
        return total == 0 ? 0 : ((double) bad / total) / budgetFraction;
    }

    List<String> report() {
        long total = history.stream().mapToLong(Minute::total).sum();
        long bad = history.stream().mapToLong(Minute::bad).sum();
        double availability = total == 0 ? 100 : 100.0 * (total - bad) / total;
        double allowed = total * budgetFraction;
        double consumed = allowed == 0 ? 0 : 100.0 * bad / allowed;
        List<String> lines = new ArrayList<>(events);
        lines.add(String.format(Locale.ROOT, "requests=%d errors=%d availability=%.3f%%", total, bad, availability));
        lines.add(String.format(Locale.ROOT, "budget allowed=%.1f consumed=%.1f%% remaining=%.1f%%",
            allowed, consumed, 100 - consumed));
        lines.add("still firing: " + (firing.isEmpty() ? "none" : String.join(", ", firing)));
        lines.add("policy: " + (consumed >= 100 ? "FREEZE" : "OK"));
        return lines;
    }
}

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        String[] first = in.readLine().trim().split("\\\\s+");
        int alertCount = Integer.parseInt(first[1]);
        int recordCount = Integer.parseInt(first[2]);
        List<BurnAlert> alerts = new ArrayList<>();
        for (int i = 0; i < alertCount; i++) {
            String[] p = in.readLine().trim().split("\\\\s+");
            alerts.add(new BurnAlert(p[0], Integer.parseInt(p[1]), Integer.parseInt(p[2]), Double.parseDouble(p[3])));
        }
        ErrorBudget budget = new ErrorBudget(first[0], alerts);
        for (int i = 0; i < recordCount; i++) {
            String[] p = in.readLine().trim().split("\\\\s+");
            budget.record(new Minute(Long.parseLong(p[0]), Long.parseLong(p[1]), Long.parseLong(p[2])));
        }
        budget.report().forEach(System.out::println);
    }
}`,
    solutionExplanation:
      'An error budget turns an SLO into a quantity you can spend: at 99.9% you may fail 0.1% of requests. Burn rate normalises the current error ratio by that allowance, so the same threshold works for any SLO. Multi-window alerts (the approach in Google\'s SRE workbook) require both a long window, so a brief blip does not page anyone, and a short window, so the alert resolves soon after the problem stops instead of lingering until the long window drains. The fast-burn page in the first test fires during the spike and resolves two minutes later; the slow-burn ticket in the second never pages but still catches a sustained leak. Windows are computed over minute ranges rather than record counts, so gaps in traffic shrink the data instead of stretching the window. The final policy line is the error-budget policy: once the budget is spent, feature deploys freeze until reliability work brings it back.',
    complexity: { time: 'O(r * a * w) where w is the number of records inside a window', space: 'O(r)', notes: 'Prefix sums over the records or a deque per window make each evaluation O(log r) or amortised O(1).' },
    hints: [
      'Keep every record; to evaluate a window ending at t, walk back while minute > t - W and sum good and bad.',
      'Keep the set of firing alerts (LinkedHashSet keeps input order for the "still firing" line). Print only when membership changes.',
      'Compute the budget fraction from the target text with BigDecimal (100 - target) / 100 to avoid 1 - 0.999 = 0.0010000000000000009.',
      'String.format(Locale.ROOT, "%.1f", value) — and remember %% prints a literal percent sign.',
    ],
    staticChecks: [
      { id: 'locale-root', description: 'Formats numbers with Locale.ROOT', pattern: 'Locale\\.ROOT', mustMatch: true },
    ],
    tests: [
      {
        id: 't1',
        name: 'Spike fires and resolves the page',
        stdin: '99 2 10\npage 6 2 10\nticket 12 4 2\n0 1000 0\n1 1000 0\n2 995 5\n3 700 300\n4 500 500\n5 1000 0\n6 1000 0\n7 1000 0\n8 1000 0\n9 990 10\n',
        expectedStdout: '[t=3] FIRING ticket long=7.6x short=7.6x\n[t=4] FIRING page long=16.1x short=40.0x\n[t=6] RESOLVED page\n[t=8] RESOLVED ticket\nrequests=10000 errors=815 availability=91.850%\nbudget allowed=100.0 consumed=815.0% remaining=-715.0%\nstill firing: none\npolicy: FREEZE',
      },
      {
        id: 't2',
        name: 'Slow burn: only the ticket fires',
        stdin: '99.9 2 8\npage 10 2 14.4\nticket 30 5 3\n0 10000 0\n5 10000 0\n10 10000 100\n15 10000 0\n20 10000 100\n25 10000 100\n26 10000 0\n40 10000 0\n',
        expectedStdout: '[t=10] FIRING ticket long=3.3x short=9.9x\n[t=15] RESOLVED ticket\n[t=20] FIRING ticket long=4.0x short=9.9x\n[t=40] RESOLVED ticket\nrequests=80300 errors=300 availability=99.626%\nbudget allowed=80.3 consumed=373.6% remaining=-273.6%\nstill firing: none\npolicy: FREEZE',
      },
      {
        id: 't3',
        name: 'Budget exhausted: freeze',
        stdin: '99.5 1 5\npage 3 1 5\n0 400 0\n1 300 100\n2 0 0\n3 500 0\n4 150 50\n',
        expectedStdout: '[t=1] FIRING page long=25.0x short=50.0x\n[t=2] RESOLVED page\n[t=4] FIRING page long=14.3x short=50.0x\nrequests=1500 errors=150 availability=90.000%\nbudget allowed=7.5 consumed=2000.0% remaining=-1900.0%\nstill firing: page\npolicy: FREEZE',
        hidden: true,
      },
      {
        id: 't4',
        name: 'No traffic at all',
        stdin: '99.9 1 0\npage 60 5 14.4\n',
        expectedStdout: 'requests=0 errors=0 availability=100.000%\nbudget allowed=0.0 consumed=0.0% remaining=100.0%\nstill firing: none\npolicy: OK',
        hidden: true,
      },
      {
        id: 't5',
        name: 'Healthy service stays within budget',
        stdin: '99.9 1 3\npage 5 1 14.4\n0 9997 3\n1 9998 2\n2 9996 4\n',
        expectedStdout: 'requests=30000 errors=9 availability=99.970%\nbudget allowed=30.0 consumed=30.0% remaining=70.0%\nstill firing: none\npolicy: OK',
        hidden: true,
      },
    ],
  },
];
