import type { CodingChallenge } from '@/types/curriculum';

const LEAK_HARNESS = `
class FakeConnection implements AutoCloseable {
    static int open = 0;
    private boolean closed;

    FakeConnection() { open++; }

    int query(String sql) {
        if (sql.contains("FAIL")) throw new IllegalStateException("query failed: " + sql);
        return sql.length();
    }

    @Override
    public void close() {
        if (!closed) { closed = true; open--; }
    }
}
`;

const LEAK_MAIN = `
public class Main {
    public static void main(String[] args) {
        java.util.Scanner in = new java.util.Scanner(System.in);
        int n = Integer.parseInt(in.nextLine().trim());
        for (int i = 0; i < n; i++) {
            String sql = in.nextLine().trim();
            try {
                System.out.println("rows=" + Dao.run(sql));
            } catch (IllegalStateException e) {
                System.out.println("error: " + e.getMessage());
            }
        }
        System.out.println("open connections: " + FakeConnection.open);
    }
}`;

export const exceptionsChallenges: CodingChallenge[] = [
  {
    id: 'ch-safe-parse',
    title: 'Robust number parsing',
    moduleId: 'exceptions',
    lessonId: 'e-basics',
    difficulty: 'beginner',
    kind: 'coding',
    dimension: 'coding',
    concepts: ['try/catch', 'NumberFormatException', 'error reporting'],
    description: `Read n lines. Each should contain one integer between −1000 and 1000. For every bad line print an error with its **1-based line number**:

- \`line <k>: not a number (<text>)\`
- \`line <k>: out of range (<value>)\`

Finally print \`sum=<sum of valid values> valid=<count> errors=<count>\`. Leading/trailing spaces are allowed around numbers.`,
    starterCode: `import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(in.readLine().trim());
        long sum = 0;
        int valid = 0, errors = 0;
        for (int k = 1; k <= n; k++) {
            String line = in.readLine();
            int value = Integer.parseInt(line);   // TODO: this crashes on bad input
            sum += value;
            valid++;
        }
        System.out.println("sum=" + sum + " valid=" + valid + " errors=" + errors);
    }
}`,
    solution: `import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(in.readLine().trim());
        long sum = 0;
        int valid = 0, errors = 0;
        for (int k = 1; k <= n; k++) {
            String line = in.readLine().trim();
            try {
                int value = Integer.parseInt(line);
                if (value < -1000 || value > 1000) {
                    System.out.println("line " + k + ": out of range (" + value + ")");
                    errors++;
                    continue;
                }
                sum += value;
                valid++;
            } catch (NumberFormatException e) {
                System.out.println("line " + k + ": not a number (" + line + ")");
                errors++;
            }
        }
        System.out.println("sum=" + sum + " valid=" + valid + " errors=" + errors);
    }
}`,
    solutionExplanation:
      'Only NumberFormatException is caught — the one failure we expect and can handle. The range rule is a normal condition, so it is checked with if, not exceptions. Trimming first lets " 42 " parse. Values outside int range (e.g. 99999999999) also throw NumberFormatException and are reported as not a number.',
    complexity: { time: 'O(n)', space: 'O(1)' },
    hints: ['Catch NumberFormatException specifically.', 'Range checks are ordinary ifs.', 'Use `continue` to skip to the next line after reporting.'],
    tests: [
      { id: 't1', name: 'Mixed input', stdin: '5\n10\nabc\n 20 \n5000\n-7\n', expectedStdout: 'line 2: not a number (abc)\nline 4: out of range (5000)\nsum=23 valid=3 errors=2' },
      { id: 't2', name: 'All valid', stdin: '3\n1000\n-1000\n0\n', expectedStdout: 'sum=0 valid=3 errors=0' },
      { id: 't3', name: 'Overflow and empty', stdin: '3\n99999999999\n\n12\n', expectedStdout: 'line 1: not a number (99999999999)\nline 2: not a number ()\nsum=12 valid=1 errors=2', hidden: true },
    ],
  },
  {
    id: 'ch-resource-leak',
    title: 'Plug the connection leak',
    moduleId: 'exceptions',
    lessonId: 'e-resources',
    difficulty: 'intermediate',
    kind: 'debugging',
    dimension: 'debugging',
    concepts: ['try-with-resources', 'resource leaks', 'exception paths'],
    description: `\`Dao.run\` borrows a connection, runs a query and closes it — but the service eventually runs out of connections. The harness prints how many connections are still open at the end; it must be **0**.

Fix \`Dao.run\` without changing \`FakeConnection\` or \`Main\`.`,
    starterCode: `${LEAK_HARNESS}
class Dao {
    static int run(String sql) {
        FakeConnection c = new FakeConnection();
        int rows = c.query(sql);
        c.close();
        return rows;
    }
}
${LEAK_MAIN}`,
    solution: `${LEAK_HARNESS}
class Dao {
    static int run(String sql) {
        try (FakeConnection c = new FakeConnection()) {
            return c.query(sql);
        }
    }
}
${LEAK_MAIN}`,
    solutionExplanation:
      'When query throws, the original code never reaches close(), so every failed query leaks a connection. try-with-resources closes the connection on every path — normal return and exception alike — and the exception still propagates to the caller.',
    complexity: { time: 'O(1) per query', space: 'O(1)' },
    hints: ['What happens to the connection when query throws?', 'Which Java 7 feature closes AutoCloseable resources on every path?'],
    staticChecks: [{ id: 'twr', description: 'Uses try-with-resources', pattern: 'try\\s*\\(\\s*FakeConnection', mustMatch: true }],
    tests: [
      { id: 't1', name: 'Successful queries', stdin: '2\nSELECT 1\nSELECT * FROM t\n', expectedStdout: 'rows=8\nrows=15\nopen connections: 0' },
      { id: 't2', name: 'Failing query', stdin: '3\nSELECT 1\nFAIL NOW\nSELECT 2\n', expectedStdout: 'rows=8\nerror: query failed: FAIL NOW\nrows=8\nopen connections: 0' },
      { id: 't3', name: 'Many failures', stdin: '3\nFAIL a\nFAIL b\nFAIL c\n', expectedStdout: 'error: query failed: FAIL a\nerror: query failed: FAIL b\nerror: query failed: FAIL c\nopen connections: 0', hidden: true },
    ],
  },
  {
    id: 'boss-config-loader',
    title: 'Boss: validated config loader',
    moduleId: 'exceptions',
    difficulty: 'advanced',
    kind: 'boss',
    dimension: 'coding',
    concepts: ['custom exceptions', 'validation', 'error aggregation', 'fail-fast vs collect-all'],
    description: `Module 5 capstone. Load a service configuration of \`key=value\` lines and validate it, reporting **every** problem rather than stopping at the first.

Rules:
- Blank lines and lines starting with \`#\` are ignored.
- A line without \`=\` → \`line <k>: expected key=value\`
- Duplicate key → \`line <k>: duplicate key <key>\`
- Known keys: \`port\` (int 1–65535), \`host\` (non-empty), \`timeoutMs\` (int 100–60000), \`retries\` (int 0–10). Unknown key → \`line <k>: unknown key <key>\`
- Invalid value → \`line <k>: invalid <key> '<value>'\`
- After all lines, each missing required key (\`host\`, \`port\`) → \`missing required key <key>\` (in that order)

Keys and values are trimmed. If there are no errors print \`OK host=<h> port=<p> timeoutMs=<t> retries=<r>\` using defaults \`timeoutMs=5000\`, \`retries=3\`. Otherwise print each error line followed by \`<n> error(s)\`.

Use a custom \`ConfigException\` (carrying the line number) inside your validation and collect messages.`,
    starterCode: `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(in.readLine().trim());
        List<String> lines = new ArrayList<>();
        for (int i = 0; i < n; i++) lines.add(in.readLine());
        // TODO: validate and report
        System.out.println("TODO");
    }
}`,
    solution: `import java.io.*;
import java.util.*;

class ConfigException extends Exception {
    ConfigException(int line, String message) {
        super(line > 0 ? "line " + line + ": " + message : message);
    }
}

final class ConfigLoader {
    private static final Map<String, int[]> INT_RANGES = Map.of(
        "port", new int[] {1, 65_535},
        "timeoutMs", new int[] {100, 60_000},
        "retries", new int[] {0, 10});

    private final Map<String, String> values = new LinkedHashMap<>();
    private final List<String> errors = new ArrayList<>();

    void load(List<String> lines) {
        for (int i = 0; i < lines.size(); i++) {
            try {
                parseLine(i + 1, lines.get(i) == null ? "" : lines.get(i).trim());
            } catch (ConfigException e) {
                errors.add(e.getMessage());
            }
        }
        for (String required : List.of("host", "port")) {
            if (!values.containsKey(required)) errors.add("missing required key " + required);
        }
    }

    private void parseLine(int k, String line) throws ConfigException {
        if (line.isEmpty() || line.startsWith("#")) return;
        int eq = line.indexOf('=');
        if (eq < 0) throw new ConfigException(k, "expected key=value");
        String key = line.substring(0, eq).trim();
        String value = line.substring(eq + 1).trim();
        if (values.containsKey(key)) throw new ConfigException(k, "duplicate key " + key);
        if (!key.equals("host") && !INT_RANGES.containsKey(key)) throw new ConfigException(k, "unknown key " + key);
        validate(k, key, value);
        values.put(key, value);
    }

    private void validate(int k, String key, String value) throws ConfigException {
        if (key.equals("host")) {
            if (value.isEmpty()) throw new ConfigException(k, "invalid host '" + value + "'");
            return;
        }
        int[] range = INT_RANGES.get(key);
        try {
            int v = Integer.parseInt(value);
            if (v < range[0] || v > range[1]) throw new ConfigException(k, "invalid " + key + " '" + value + "'");
        } catch (NumberFormatException e) {
            throw new ConfigException(k, "invalid " + key + " '" + value + "'");
        }
    }

    String report() {
        if (!errors.isEmpty()) {
            return String.join("\\n", errors) + "\\n" + errors.size() + " error(s)";
        }
        return "OK host=" + values.get("host") + " port=" + values.get("port")
            + " timeoutMs=" + values.getOrDefault("timeoutMs", "5000")
            + " retries=" + values.getOrDefault("retries", "3");
    }
}

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(in.readLine().trim());
        List<String> lines = new ArrayList<>();
        for (int i = 0; i < n; i++) lines.add(in.readLine());
        ConfigLoader loader = new ConfigLoader();
        loader.load(lines);
        System.out.println(loader.report());
    }
}`,
    solutionExplanation:
      'Each line is validated independently and failures are thrown as a checked ConfigException that carries the line number. The loop catches them and collects messages, so one bad line does not hide the others ("collect-all" rather than fail-fast, which suits config files a human must fix). NumberFormatException is translated into the domain exception. Required keys are checked only after every line has been seen.',
    complexity: { time: 'O(n)', space: 'O(n)' },
    hints: [
      'Process each line in its own try/catch so errors are collected.',
      'Check duplicate before unknown key, as listed in the rules.',
      'Missing required keys can only be known at the end.',
    ],
    tests: [
      {
        id: 't1',
        name: 'Valid with defaults',
        stdin: '4\n# service config\nhost = api.local\n\nport=8080\n',
        expectedStdout: 'OK host=api.local port=8080 timeoutMs=5000 retries=3',
      },
      {
        id: 't2',
        name: 'Every kind of error',
        stdin: '7\nhost=db\nport=99999\nretries=x\ntimeout=10\nport=80\njust text\nhost=again\n',
        expectedStdout: "line 2: invalid port '99999'\nline 3: invalid retries 'x'\nline 4: unknown key timeout\nline 6: expected key=value\nline 7: duplicate key host\n5 error(s)",
      },
      {
        id: 't3',
        name: 'Empty file',
        stdin: '1\n# nothing\n',
        expectedStdout: 'missing required key host\nmissing required key port\n2 error(s)',
        hidden: true,
      },
      {
        id: 't4',
        name: 'All keys set',
        stdin: '4\nretries=0\ntimeoutMs=60000\nport=1\nhost=x\n',
        expectedStdout: 'OK host=x port=1 timeoutMs=60000 retries=0',
        hidden: true,
      },
    ],
  },
];
