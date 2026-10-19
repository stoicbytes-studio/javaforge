import type { CodingChallenge } from '@/types/curriculum';

export const designChallenges: CodingChallenge[] = [
  {
    id: 'ch-shipping-strategy',
    title: 'Pluggable shipping strategies',
    moduleId: 'design',
    lessonId: 'd-solid',
    difficulty: 'intermediate',
    kind: 'coding',
    dimension: 'coding',
    concepts: ['Strategy pattern', 'Open/Closed principle', 'lambdas', 'registry map'],
    description: `Price shipments using interchangeable strategies. Prices are in cents:

- \`standard\`: 499 + 50 for every **started** kilogram (1 g to 1000 g is 1 kg, 1001 g is 2 kg)
- \`express\`: twice the standard price + 10 per km
- \`pickup\`: 0

Input: n, then n lines \`<method> <grams> <km>\` (grams >= 1, km >= 0). For each line print \`<method> <price>\` with the price as euros and cents (\`5.99\`, \`0.00\`). For an unknown method print \`line <i>: unknown method <method>\` (1-based) and skip it. Finally print \`total <sum>\` in the same format.

Design requirement: register the strategies in the provided \`Map<String, ShippingStrategy>\`, so adding a new method means adding one entry — no if/else or switch on the method name.`,
    starterCode: `import java.io.*;
import java.util.*;

interface ShippingStrategy {
    long costCents(int grams, int km);
}

public class Main {
    static final Map<String, ShippingStrategy> STRATEGIES = new HashMap<>();
    static {
        // TODO: register "standard", "express" and "pickup"
    }

    static String money(long cents) {
        return cents / 100 + "." + String.format("%02d", cents % 100);
    }

    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(in.readLine().trim());
        long total = 0;
        for (int i = 1; i <= n; i++) {
            String[] p = in.readLine().trim().split(" +");
            // TODO: look up the strategy for p[0]; report unknown methods
        }
        System.out.println("total " + money(total));
    }
}`,
    solution: `import java.io.*;
import java.util.*;

interface ShippingStrategy {
    long costCents(int grams, int km);
}

public class Main {
    static final Map<String, ShippingStrategy> STRATEGIES = new HashMap<>();
    static {
        ShippingStrategy standard = (grams, km) -> 499 + 50L * ((grams + 999) / 1000);
        STRATEGIES.put("standard", standard);
        STRATEGIES.put("express", (grams, km) -> 2 * standard.costCents(grams, km) + 10L * km);
        STRATEGIES.put("pickup", (grams, km) -> 0);
    }

    static String money(long cents) {
        return cents / 100 + "." + String.format("%02d", cents % 100);
    }

    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(in.readLine().trim());
        long total = 0;
        for (int i = 1; i <= n; i++) {
            String[] p = in.readLine().trim().split(" +");
            ShippingStrategy strategy = STRATEGIES.get(p[0]);
            if (strategy == null) {
                System.out.println("line " + i + ": unknown method " + p[0]);
                continue;
            }
            long cost = strategy.costCents(Integer.parseInt(p[1]), Integer.parseInt(p[2]));
            total += cost;
            System.out.println(p[0] + " " + money(cost));
        }
        System.out.println("total " + money(total));
    }
}`,
    solutionExplanation:
      'Each strategy is a lambda implementing the one-method ShippingStrategy interface. express reuses standard by composition instead of duplicating the formula. The main loop never mentions a method name: a missing map entry is the "unknown" case, and a new method (say "drone") is one more put — the loop is closed for modification and open for extension. (grams + 999) / 1000 is integer ceiling division for positive grams.',
    complexity: { time: 'O(n)', space: 'O(1) besides the fixed registry' },
    hints: [
      'A ShippingStrategy has one method, so a lambda (grams, km) -> ... implements it.',
      'Started kilograms: (grams + 999) / 1000.',
      'express can call the standard strategy instead of repeating its formula.',
      'Map.get returns null for an unknown method.',
    ],
    staticChecks: [
      { id: 'no-switch', description: 'Does not switch on the method name', pattern: 'switch\\s*\\(\\s*p\\[0\\]', mustMatch: false },
    ],
    tests: [
      {
        id: 't1',
        name: 'All three methods',
        stdin: '3\nstandard 1200 5\nexpress 500 30\npickup 8000 0\n',
        expectedStdout: 'standard 5.99\nexpress 13.98\npickup 0.00\ntotal 19.97',
      },
      {
        id: 't2',
        name: 'Unknown method and exact kilogram',
        stdin: '2\ndrone 100 1\nstandard 1000 0\n',
        expectedStdout: 'line 1: unknown method drone\nstandard 5.49\ntotal 5.49',
      },
      {
        id: 't3',
        name: 'Heavy express and one gram',
        stdin: '2\nexpress 25000 120\nexpress 1 0\n',
        expectedStdout: 'express 46.98\nexpress 10.98\ntotal 57.96',
        hidden: true,
      },
    ],
  },
  {
    id: 'ch-event-bus',
    title: 'Topic event bus',
    moduleId: 'design',
    lessonId: 'd-patterns',
    difficulty: 'intermediate',
    kind: 'coding',
    dimension: 'coding',
    concepts: ['Observer pattern', 'listener registration', 'LinkedHashMap ordering', 'wildcard subscriptions'],
    description: `Implement a publish/subscribe event bus (the Observer pattern). Input: n, then n commands:

- \`subscribe <listener> <topic>\` — subscribing the same listener to the same topic twice has no effect
- \`unsubscribe <listener> <topic>\` — no effect if not subscribed
- \`publish <topic> <message>\` — the message is the rest of the line and may contain spaces

On publish, every subscriber of the topic prints \`<listener> <- <topic>: <message>\`, in the order they subscribed (re-subscribing after an unsubscribe moves a listener to the end). Listeners subscribed to the topic \`*\` receive **every** message, after the topic's own subscribers; a listener subscribed both ways receives it only once. If nobody receives a message print \`dropped <topic>: <message>\`.

Finally print \`delivered <d> dropped <x>\`, where d counts deliveries (one per receiving listener) and x counts dropped messages.

Keep the bus independent of printing: listeners are objects implementing \`Listener\`, and the bus only calls \`onMessage\`.`,
    starterCode: `import java.io.*;
import java.util.*;

interface Listener {
    void onMessage(String topic, String message);
}

class EventBus {
    void subscribe(String topic, String name, Listener listener) {
        // TODO
    }

    void unsubscribe(String topic, String name) {
        // TODO
    }

    /** Notifies subscribers and returns how many listeners received the message. */
    int publish(String topic, String message) {
        return 0; // TODO
    }
}

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(in.readLine().trim());
        EventBus bus = new EventBus();
        int delivered = 0, dropped = 0;
        for (int i = 0; i < n; i++) {
            String[] p = in.readLine().trim().split(" ", 3);
            // TODO: handle subscribe, unsubscribe and publish
        }
        System.out.println("delivered " + delivered + " dropped " + dropped);
    }
}`,
    solution: `import java.io.*;
import java.util.*;

interface Listener {
    void onMessage(String topic, String message);
}

class EventBus {
    private final Map<String, Map<String, Listener>> byTopic = new HashMap<>();

    void subscribe(String topic, String name, Listener listener) {
        byTopic.computeIfAbsent(topic, t -> new LinkedHashMap<>()).putIfAbsent(name, listener);
    }

    void unsubscribe(String topic, String name) {
        Map<String, Listener> listeners = byTopic.get(topic);
        if (listeners != null) listeners.remove(name);
    }

    /** Notifies subscribers and returns how many listeners received the message. */
    int publish(String topic, String message) {
        Map<String, Listener> targets = new LinkedHashMap<>(byTopic.getOrDefault(topic, Map.of()));
        byTopic.getOrDefault("*", Map.of()).forEach(targets::putIfAbsent);
        targets.values().forEach(l -> l.onMessage(topic, message));
        return targets.size();
    }
}

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(in.readLine().trim());
        EventBus bus = new EventBus();
        int delivered = 0, dropped = 0;
        for (int i = 0; i < n; i++) {
            String[] p = in.readLine().trim().split(" ", 3);
            switch (p[0]) {
                case "subscribe" -> {
                    String name = p[1];
                    bus.subscribe(p[2], name, (topic, msg) -> System.out.println(name + " <- " + topic + ": " + msg));
                }
                case "unsubscribe" -> bus.unsubscribe(p[2], p[1]);
                case "publish" -> {
                    int count = bus.publish(p[1], p[2]);
                    if (count == 0) {
                        System.out.println("dropped " + p[1] + ": " + p[2]);
                        dropped++;
                    } else {
                        delivered += count;
                    }
                }
                default -> System.out.println("unknown command " + p[0]);
            }
        }
        System.out.println("delivered " + delivered + " dropped " + dropped);
    }
}`,
    solutionExplanation:
      'Each topic maps to a LinkedHashMap from listener name to Listener: insertion order gives subscription order, putIfAbsent ignores duplicates, and remove followed by a new put moves a listener to the end. On publish the topic\'s listeners are copied into a fresh LinkedHashMap and the wildcard listeners are merged with putIfAbsent, which both orders them after the topic subscribers and de-duplicates by name. Copying before notifying also means a listener could safely subscribe or unsubscribe during delivery. The bus never prints — that is the listeners\' job.',
    complexity: { time: 'O(s) per publish for s matching subscribers; O(1) average per subscribe/unsubscribe', space: 'O(total subscriptions)' },
    hints: [
      'Which Map keeps insertion order and makes duplicates easy to ignore?',
      'split(" ", 3) keeps the message with its spaces in p[2].',
      'Merge wildcard subscribers into a copy of the topic\'s subscribers with putIfAbsent.',
    ],
    tests: [
      {
        id: 't1',
        name: 'Subscribe, unsubscribe and drop',
        stdin: '6\nsubscribe email orders\nsubscribe audit orders\npublish orders o-1 placed\nunsubscribe email orders\npublish orders o-2 placed\npublish refunds r-1\n',
        expectedStdout: 'email <- orders: o-1 placed\naudit <- orders: o-1 placed\naudit <- orders: o-2 placed\ndropped refunds: r-1\ndelivered 3 dropped 1',
      },
      {
        id: 't2',
        name: 'Wildcard and duplicates',
        stdin: '6\nsubscribe log *\nsubscribe email orders\nsubscribe email orders\nsubscribe log orders\npublish orders hello world\npublish users signup\n',
        expectedStdout: 'email <- orders: hello world\nlog <- orders: hello world\nlog <- users: signup\ndelivered 3 dropped 0',
      },
      {
        id: 't3',
        name: 'Re-subscribe order',
        stdin: '7\nsubscribe a news\nsubscribe b news\nunsubscribe a news\nsubscribe a news\nunsubscribe zed news\npublish news x\npublish other y\n',
        expectedStdout: 'b <- news: x\na <- news: x\ndropped other: y\ndelivered 2 dropped 1',
        hidden: true,
      },
    ],
  },
  {
    id: 'boss-text-pipeline',
    title: 'Boss: configurable text pipeline',
    moduleId: 'design',
    difficulty: 'advanced',
    kind: 'boss',
    dimension: 'coding',
    concepts: ['Factory', 'Decorator / function composition', 'Strategy', 'validation', 'Open/Closed principle'],
    description: `Module 13 capstone. Build a text-processing pipeline from a configuration line, then run input lines through it.

The first line lists stages separated by spaces, applied **left to right**:

- \`trim\`, \`upper\`, \`lower\`, \`reverse\` (no argument; use \`Locale.ROOT\` for case changes)
- \`mask:N\` (N >= 0): replace every character except the last N with \`*\`; strings of length <= N are unchanged
- \`limit:N\` (N >= 1): if longer than N, keep the first N characters and append \`...\`
- \`prefix:TEXT\` (TEXT non-empty): put TEXT in front

A token is invalid if the name is unknown, a required argument is missing or not a valid number in range, or an argument is given to a stage that takes none (e.g. \`upper:1\`). If any token is invalid, print \`invalid stage: <token>\` for each invalid token in order and stop.

Otherwise read n and then n lines (keep leading and trailing spaces) and print each result as \`[<result>]\`. Finally print \`stages=<k> lines=<n> changed=<c>\` where c counts lines whose result differs from the input.

Design: a **factory** turns each token into a stage (a \`UnaryOperator<String>\` or your own interface); the pipeline is the composition of the stages. Adding a new stage should only touch the factory.`,
    starterCode: `import java.io.*;
import java.util.*;
import java.util.function.UnaryOperator;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        String[] tokens = in.readLine().trim().split(" +");
        // TODO: build stages with a factory; report invalid tokens
        int n = Integer.parseInt(in.readLine().trim());
        for (int i = 0; i < n; i++) {
            String line = in.readLine();
            System.out.println("[" + line + "]");
        }
        System.out.println("stages=" + tokens.length + " lines=" + n + " changed=0");
    }
}`,
    solution: `import java.io.*;
import java.util.*;
import java.util.function.UnaryOperator;

final class StageFactory {
    private StageFactory() {}

    static Optional<UnaryOperator<String>> create(String token) {
        int colon = token.indexOf(':');
        String name = colon < 0 ? token : token.substring(0, colon);
        String arg = colon < 0 ? null : token.substring(colon + 1);
        return switch (name) {
            case "trim" -> noArg(arg, String::trim);
            case "upper" -> noArg(arg, s -> s.toUpperCase(Locale.ROOT));
            case "lower" -> noArg(arg, s -> s.toLowerCase(Locale.ROOT));
            case "reverse" -> noArg(arg, s -> new StringBuilder(s).reverse().toString());
            case "mask" -> intArg(arg, 0).map(StageFactory::mask);
            case "limit" -> intArg(arg, 1).map(StageFactory::limit);
            case "prefix" -> arg == null || arg.isEmpty() ? Optional.empty() : Optional.of(s -> arg + s);
            default -> Optional.empty();
        };
    }

    private static UnaryOperator<String> mask(int keep) {
        return s -> s.length() <= keep ? s : "*".repeat(s.length() - keep) + s.substring(s.length() - keep);
    }

    private static UnaryOperator<String> limit(int max) {
        return s -> s.length() <= max ? s : s.substring(0, max) + "...";
    }

    private static Optional<UnaryOperator<String>> noArg(String arg, UnaryOperator<String> op) {
        return arg == null ? Optional.of(op) : Optional.empty();
    }

    private static Optional<Integer> intArg(String arg, int min) {
        if (arg == null) return Optional.empty();
        try {
            int n = Integer.parseInt(arg);
            return n >= min ? Optional.of(n) : Optional.empty();
        } catch (NumberFormatException e) {
            return Optional.empty();
        }
    }
}

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        String[] tokens = in.readLine().trim().split(" +");
        List<UnaryOperator<String>> stages = new ArrayList<>();
        List<String> invalid = new ArrayList<>();
        for (String token : tokens) {
            StageFactory.create(token).ifPresentOrElse(stages::add, () -> invalid.add(token));
        }
        if (!invalid.isEmpty()) {
            invalid.forEach(t -> System.out.println("invalid stage: " + t));
            return;
        }

        UnaryOperator<String> pipeline = s -> {
            for (UnaryOperator<String> stage : stages) s = stage.apply(s);
            return s;
        };

        int n = Integer.parseInt(in.readLine().trim());
        int changed = 0;
        for (int i = 0; i < n; i++) {
            String line = in.readLine();
            String out = pipeline.apply(line);
            if (!out.equals(line)) changed++;
            System.out.println("[" + out + "]");
        }
        System.out.println("stages=" + stages.size() + " lines=" + n + " changed=" + changed);
    }
}`,
    solutionExplanation:
      'StageFactory is the only place that knows stage names: it parses a token into a name and optional argument and returns an Optional stage, so invalid configuration is reported without exceptions leaking into the main flow. Each stage is a UnaryOperator<String>, and the pipeline applies them in order — functionally the same as nesting decorators, but built from data. The parameterised stages are small factory methods returning closures over their argument. All tokens are validated before any input is processed (fail fast on configuration), and adding a stage such as "replace:a=b" would be one new case in the factory.',
    complexity: { time: 'O(k x L) per line for k stages and line length L', space: 'O(k + L)' },
    hints: [
      'Split each token at the first colon into name and argument.',
      'Return Optional.empty() from the factory for anything invalid and collect those tokens.',
      'mask:N keeps the last N characters: "*".repeat(len - N) + the tail.',
      'Store the stages in a list and apply them left to right.',
    ],
    tests: [
      {
        id: 't1',
        name: 'Trim, upper, prefix',
        stdin: 'trim upper prefix:>\n2\n  hello world \nOK\n',
        expectedStdout: '[>HELLO WORLD]\n[>OK]\nstages=3 lines=2 changed=2',
      },
      {
        id: 't2',
        name: 'Masking',
        stdin: 'mask:4\n2\n4111111111111111\n123\n',
        expectedStdout: '[************1111]\n[123]\nstages=1 lines=2 changed=1',
      },
      {
        id: 't3',
        name: 'Invalid configuration',
        stdin: 'trim shout mask:x limit:0 upper:1 prefix:\n1\nignored\n',
        expectedStdout: 'invalid stage: shout\ninvalid stage: mask:x\ninvalid stage: limit:0\ninvalid stage: upper:1\ninvalid stage: prefix:',
      },
      {
        id: 't4',
        name: 'Order of stages matters',
        stdin: 'reverse limit:5 lower\n2\nAbcdefgh\nHi\n',
        expectedStdout: '[hgfed...]\n[ih]\nstages=3 lines=2 changed=2',
        hidden: true,
      },
      {
        id: 't5',
        name: 'Unchanged lines',
        stdin: 'trim\n2\nsame\n\n',
        expectedStdout: '[same]\n[]\nstages=1 lines=2 changed=0',
        hidden: true,
      },
    ],
  },
];
