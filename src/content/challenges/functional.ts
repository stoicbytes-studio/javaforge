import type { CodingChallenge } from '@/types/curriculum';

export const functionalChallenges: CodingChallenge[] = [
  {
    id: 'ch-text-pipeline',
    title: 'Composable text pipeline',
    moduleId: 'functional',
    lessonId: 'fn-lambdas',
    difficulty: 'intermediate',
    kind: 'coding',
    dimension: 'coding',
    concepts: ['Function composition', 'method references', 'Map of behaviours'],
    description: `Build a text-processing pipeline from named steps and apply it to each input line.

Line 1 lists steps separated by spaces, applied left to right. Supported steps:
- \`trim\` — strip leading/trailing whitespace
- \`upper\` / \`lower\` — change case (use \`Locale.ROOT\`)
- \`squeeze\` — collapse runs of whitespace into one space
- \`reverse\` — reverse the characters

Unknown step names should make the program print \`unknown step: <name>\` and stop. Then come t and t lines; print each transformed line wrapped in brackets: \`[result]\`.

Compose a single \`Function<String, String>\` with \`andThen\` instead of looping over step names for every line.`,
    starterCode: `import java.io.*;
import java.util.*;
import java.util.function.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        String[] steps = in.readLine().trim().split("\\\\s+");
        Function<String, String> pipeline = Function.identity();
        // TODO: build the pipeline from the steps

        int t = Integer.parseInt(in.readLine().trim());
        for (int i = 0; i < t; i++) {
            System.out.println("[" + pipeline.apply(in.readLine()) + "]");
        }
    }
}`,
    solution: `import java.io.*;
import java.util.*;
import java.util.function.*;

public class Main {
    static final Map<String, UnaryOperator<String>> STEPS = Map.of(
        "trim", String::strip,
        "upper", s -> s.toUpperCase(Locale.ROOT),
        "lower", s -> s.toLowerCase(Locale.ROOT),
        "squeeze", s -> s.replaceAll("\\\\s+", " "),
        "reverse", s -> new StringBuilder(s).reverse().toString());

    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        String[] steps = in.readLine().trim().split("\\\\s+");
        Function<String, String> pipeline = Function.identity();
        for (String name : steps) {
            UnaryOperator<String> step = STEPS.get(name);
            if (step == null) {
                System.out.println("unknown step: " + name);
                return;
            }
            pipeline = pipeline.andThen(step);
        }

        int t = Integer.parseInt(in.readLine().trim());
        for (int i = 0; i < t; i++) {
            System.out.println("[" + pipeline.apply(in.readLine()) + "]");
        }
    }
}`,
    solutionExplanation:
      'Each step is a UnaryOperator stored in an immutable map — behaviour as data. The pipeline is composed once with andThen, so applying it to every line is a single function call. Adding a new step means adding one map entry (Open/Closed).',
    complexity: { time: 'O(s + total characters × s)', space: 'O(s) for s steps' },
    hints: ['Start from Function.identity().', 'A Map<String, UnaryOperator<String>> maps names to behaviour.', 'pipeline = pipeline.andThen(step)'],
    tests: [
      { id: 't1', name: 'Trim, squeeze, upper', stdin: 'trim squeeze upper\n2\n  hello    world \nJava   streams\n', expectedStdout: '[HELLO WORLD]\n[JAVA STREAMS]' },
      { id: 't2', name: 'Order matters', stdin: 'reverse trim\n1\n  ab c\n', expectedStdout: '[c ba]' },
      { id: 't3', name: 'Unknown step', stdin: 'trim shout\n1\nx\n', expectedStdout: 'unknown step: shout', hidden: true },
    ],
  },
  {
    id: 'ch-stream-report',
    title: 'Sales report with streams',
    moduleId: 'functional',
    lessonId: 'fn-streams',
    difficulty: 'intermediate',
    kind: 'coding',
    dimension: 'coding',
    concepts: ['groupingBy', 'summingLong', 'max with comparator', 'joining'],
    description: `Input: n, then n lines \`region product cents\`. Using streams and collectors, print:

1. One line per region, sorted by region name: \`<region> total=<sum> orders=<count>\`
2. \`best product: <product> (<total cents across all regions>)\` — highest total; ties broken alphabetically
3. \`large orders: <ids>\` — the 1-based line numbers of orders of at least 10000 cents, comma-separated, or \`none\``,
    starterCode: `import java.io.*;
import java.util.*;
import java.util.stream.*;

public class Main {
    record Sale(int line, String region, String product, long cents) {}

    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(in.readLine().trim());
        List<Sale> sales = new ArrayList<>();
        for (int i = 1; i <= n; i++) {
            String[] p = in.readLine().trim().split("\\\\s+");
            sales.add(new Sale(i, p[0], p[1], Long.parseLong(p[2])));
        }
        // TODO: produce the report with streams
    }
}`,
    solution: `import java.io.*;
import java.util.*;
import java.util.stream.*;

public class Main {
    record Sale(int line, String region, String product, long cents) {}

    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(in.readLine().trim());
        List<Sale> sales = new ArrayList<>();
        for (int i = 1; i <= n; i++) {
            String[] p = in.readLine().trim().split("\\\\s+");
            sales.add(new Sale(i, p[0], p[1], Long.parseLong(p[2])));
        }

        Map<String, LongSummaryStatistics> byRegion = sales.stream()
            .collect(Collectors.groupingBy(Sale::region, TreeMap::new, Collectors.summarizingLong(Sale::cents)));
        byRegion.forEach((region, s) -> System.out.println(region + " total=" + s.getSum() + " orders=" + s.getCount()));

        sales.stream()
            .collect(Collectors.groupingBy(Sale::product, Collectors.summingLong(Sale::cents)))
            .entrySet().stream()
            .max(Map.Entry.<String, Long>comparingByValue()
                .thenComparing(Map.Entry.comparingByKey(Comparator.reverseOrder())))
            .ifPresent(e -> System.out.println("best product: " + e.getKey() + " (" + e.getValue() + ")"));

        String large = sales.stream()
            .filter(s -> s.cents() >= 10_000)
            .map(s -> String.valueOf(s.line()))
            .collect(Collectors.joining(","));
        System.out.println("large orders: " + (large.isEmpty() ? "none" : large));
    }
}`,
    solutionExplanation:
      'summarizingLong gives sum and count in one pass per group, and the TreeMap factory sorts regions. For the best product, max uses value first; to break ties alphabetically with max, the key comparator is reversed (max of reversed order = smallest name). joining builds the id list without manual comma handling.',
    complexity: { time: 'O(n log r) for r regions', space: 'O(r + p)' },
    hints: [
      'Collectors.summarizingLong returns sum and count together.',
      'groupingBy(classifier, TreeMap::new, downstream) sorts the keys.',
      'Think carefully about tie-breaking when using max.',
    ],
    staticChecks: [
      { id: 'streams', description: 'Uses streams', pattern: '\\.stream\\(\\)', mustMatch: true },
      { id: 'grouping', description: 'Uses Collectors.groupingBy', pattern: 'groupingBy', mustMatch: true },
    ],
    tests: [
      {
        id: 't1',
        name: 'Typical day',
        stdin: '5\nEU laptop 120000\nUS mouse 2500\nEU mouse 2500\nAPAC laptop 99000\nUS cable 900\n',
        expectedStdout: 'APAC total=99000 orders=1\nEU total=122500 orders=2\nUS total=3400 orders=2\nbest product: laptop (219000)\nlarge orders: 1,4',
      },
      {
        id: 't2',
        name: 'Tie and no large orders',
        stdin: '3\nEU pen 300\nEU cap 200\nUS cap 100\n',
        expectedStdout: 'EU total=500 orders=2\nUS total=100 orders=1\nbest product: cap (300)\nlarge orders: none',
      },
      { id: 't3', name: 'Single sale', stdin: '1\nLATAM book 10000\n', expectedStdout: 'LATAM total=10000 orders=1\nbest product: book (10000)\nlarge orders: 1', hidden: true },
    ],
  },
  {
    id: 'ch-optional-lookup',
    title: 'Fix the NPE-prone lookup',
    moduleId: 'functional',
    lessonId: 'fn-optional-modern',
    difficulty: 'intermediate',
    kind: 'debugging',
    dimension: 'debugging',
    concepts: ['Optional', 'null safety', 'orElse vs orElseGet'],
    description: `A support tool prints the shipping city for each order id, but it crashes with NullPointerException for orders without a customer, customers without an address, and unknown order ids. It also logs "fetching default region" far too often.

Expected output per query: the city, or \`unknown\` if any link is missing. After all queries print \`default lookups: <n>\` — the default region should only be fetched for queries that actually needed it.

Fix \`cityFor\` (and keep the default lookup lazy).`,
    starterCode: `import java.util.*;

public class Main {
    record Address(String city) {}
    record Customer(String name, Address address) {}
    record Order(String id, Customer customer) {}

    static int defaultLookups = 0;
    static final Map<String, Order> ORDERS = new HashMap<>();

    static String defaultRegion() {
        defaultLookups++;
        return "unknown";
    }

    static String cityFor(String orderId) {
        Optional<Order> order = Optional.ofNullable(ORDERS.get(orderId));
        return Optional.of(order.get().customer().address().city()).orElse(defaultRegion());
    }

    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = Integer.parseInt(in.nextLine().trim());
        for (int i = 0; i < n; i++) {
            String[] p = in.nextLine().trim().split(" ");
            Customer c = p[1].equals("-") ? null : new Customer(p[1], p[2].equals("-") ? null : new Address(p[2]));
            ORDERS.put(p[0], new Order(p[0], c));
        }
        int q = Integer.parseInt(in.nextLine().trim());
        for (int i = 0; i < q; i++) System.out.println(cityFor(in.nextLine().trim()));
        System.out.println("default lookups: " + defaultLookups);
    }
}`,
    solution: `import java.util.*;

public class Main {
    record Address(String city) {}
    record Customer(String name, Address address) {}
    record Order(String id, Customer customer) {}

    static int defaultLookups = 0;
    static final Map<String, Order> ORDERS = new HashMap<>();

    static String defaultRegion() {
        defaultLookups++;
        return "unknown";
    }

    static String cityFor(String orderId) {
        return Optional.ofNullable(ORDERS.get(orderId))
            .map(Order::customer)
            .map(Customer::address)
            .map(Address::city)
            .orElseGet(Main::defaultRegion);
    }

    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = Integer.parseInt(in.nextLine().trim());
        for (int i = 0; i < n; i++) {
            String[] p = in.nextLine().trim().split(" ");
            Customer c = p[1].equals("-") ? null : new Customer(p[1], p[2].equals("-") ? null : new Address(p[2]));
            ORDERS.put(p[0], new Order(p[0], c));
        }
        int q = Integer.parseInt(in.nextLine().trim());
        for (int i = 0; i < q; i++) System.out.println(cityFor(in.nextLine().trim()));
        System.out.println("default lookups: " + defaultLookups);
    }
}`,
    solutionExplanation:
      'order.get() throws for unknown ids, the chained calls throw when customer or address is null, and Optional.of throws for a null city. Each map step turns a null into an empty Optional, so the chain short-circuits safely. orElse evaluated defaultRegion() eagerly on every call; orElseGet only calls it when the Optional is empty.',
    complexity: { time: 'O(1) per query', space: 'O(1)' },
    hints: ['Optional.map returns empty when the mapping function returns null.', 'Which of orElse / orElseGet evaluates its argument lazily?'],
    staticChecks: [{ id: 'no-get', description: 'Does not call Optional.get()', pattern: '\\.get\\(\\)\\.', mustMatch: false }],
    tests: [
      {
        id: 't1',
        name: 'Every kind of missing link',
        stdin: '3\no1 ann Paris\no2 bob -\no3 - -\n4\no1\no2\no3\no9\n',
        expectedStdout: 'Paris\nunknown\nunknown\nunknown\ndefault lookups: 3',
      },
      { id: 't2', name: 'All present', stdin: '2\na x Rome\nb y Oslo\n2\na\nb\n', expectedStdout: 'Rome\nOslo\ndefault lookups: 0' },
      { id: 't3', name: 'Only unknown ids', stdin: '1\na x Rome\n2\nz\ny\n', expectedStdout: 'unknown\nunknown\ndefault lookups: 2', hidden: true },
    ],
  },
  {
    id: 'boss-sales-analytics',
    title: 'Boss: subscription analytics',
    moduleId: 'functional',
    difficulty: 'advanced',
    kind: 'boss',
    dimension: 'coding',
    concepts: ['records', 'streams', 'collectors', 'Optional', 'comparators', 'parsing'],
    description: `Module 7 capstone. Analyse subscription events with records, streams and Optional.

Input lines: \`<day> <customer> <event> [plan] [cents]\` where event is:
- \`SUBSCRIBE <plan> <cents>\` — starts or changes a subscription to a plan with a monthly price
- \`CANCEL\` — ends the customer's subscription

Lines may be malformed (wrong field count, unknown event, bad number); skip and count them. Events arrive in day order.

Print:
1. \`skipped=<n>\`
2. \`active=<count of customers subscribed at the end>\`
3. \`mrr=<sum of monthly price of active subscriptions>\`
4. \`plans: <plan>=<active count>,...\` sorted by count descending then plan name, or \`plans: -\`
5. \`churned: <customers who cancelled and are not active at the end, sorted>\` or \`churned: -\`
6. \`top=<customer with the highest active price>\` (ties: alphabetical), or \`top=-\``,
    starterCode: `import java.io.*;
import java.util.*;
import java.util.stream.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(in.readLine().trim());
        for (int i = 0; i < n; i++) {
            String line = in.readLine();
            // TODO
        }
        System.out.println("skipped=0");
    }
}`,
    solution: `import java.io.*;
import java.util.*;
import java.util.stream.*;

public class Main {
    record Subscription(String customer, String plan, long cents) {}

    sealed interface Event permits Subscribe, Cancel {}
    record Subscribe(int day, String customer, String plan, long cents) implements Event {}
    record Cancel(int day, String customer) implements Event {}

    static Optional<Event> parse(String line) {
        String[] p = line.trim().split("\\\\s+");
        try {
            if (p.length == 5 && p[2].equals("SUBSCRIBE")) {
                long cents = Long.parseLong(p[4]);
                if (cents < 0) return Optional.empty();
                return Optional.of(new Subscribe(Integer.parseInt(p[0]), p[1], p[3], cents));
            }
            if (p.length == 3 && p[2].equals("CANCEL")) {
                return Optional.of(new Cancel(Integer.parseInt(p[0]), p[1]));
            }
        } catch (NumberFormatException e) {
            // fall through to empty
        }
        return Optional.empty();
    }

    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(in.readLine().trim());
        List<String> lines = new ArrayList<>();
        for (int i = 0; i < n; i++) lines.add(in.readLine());

        List<Event> events = lines.stream().map(Main::parse).flatMap(Optional::stream).toList();
        long skipped = lines.size() - events.size();

        Map<String, Subscription> active = new HashMap<>();
        Set<String> cancelled = new TreeSet<>();
        for (Event e : events) {
            switch (e) {
                case Subscribe s -> active.put(s.customer(), new Subscription(s.customer(), s.plan(), s.cents()));
                case Cancel c -> {
                    if (active.remove(c.customer()) != null) cancelled.add(c.customer());
                }
            }
        }

        long mrr = active.values().stream().mapToLong(Subscription::cents).sum();
        String plans = active.values().stream()
            .collect(Collectors.groupingBy(Subscription::plan, Collectors.counting()))
            .entrySet().stream()
            .sorted(Map.Entry.<String, Long>comparingByValue().reversed().thenComparing(Map.Entry.comparingByKey()))
            .map(en -> en.getKey() + "=" + en.getValue())
            .collect(Collectors.joining(","));
        String churned = cancelled.stream().filter(c -> !active.containsKey(c)).collect(Collectors.joining(","));
        String top = active.values().stream()
            .min(Comparator.comparingLong(Subscription::cents).reversed().thenComparing(Subscription::customer))
            .map(Subscription::customer)
            .orElse("-");

        System.out.println("skipped=" + skipped);
        System.out.println("active=" + active.size());
        System.out.println("mrr=" + mrr);
        System.out.println("plans: " + (plans.isEmpty() ? "-" : plans));
        System.out.println("churned: " + (churned.isEmpty() ? "-" : churned));
        System.out.println("top=" + top);
    }
}`,
    solutionExplanation:
      'Parsing returns Optional<Event>; flatMap(Optional::stream) keeps only valid events, and the difference in size is the skipped count. State is replayed with an exhaustive switch over the sealed Event type. Aggregations are separate, readable stream pipelines: sum for MRR, groupingBy+counting for plans, filter for churn, and a min over a "price descending, name ascending" comparator for the top customer.',
    complexity: { time: 'O(n + a log a) for a active customers', space: 'O(n)' },
    hints: [
      'Optional::stream (Java 9) turns Optional into a 0- or 1-element stream.',
      'A customer who cancels and resubscribes is not churned.',
      'Sorting by count descending needs reversed() on the value comparator only.',
    ],
    tests: [
      {
        id: 't1',
        name: 'Typical month',
        stdin: '7\n1 ann SUBSCRIBE pro 2000\n2 bob SUBSCRIBE basic 900\n3 cid SUBSCRIBE pro 2000\n4 bob CANCEL\n5 dee SUBSCRIBE basic 900\n6 ann SUBSCRIBE team 5000\n7 eve CANCEL\n',
        expectedStdout: 'skipped=0\nactive=3\nmrr=7900\nplans: basic=1,pro=1,team=1\nchurned: bob\ntop=ann',
      },
      {
        id: 't2',
        name: 'Malformed lines and resubscribe',
        stdin: '6\n1 ann SUBSCRIBE pro x\n2 ann SUBSCRIBE pro 2000\nhello\n3 ann CANCEL\n4 ann SUBSCRIBE pro 2000\n5 bob UPGRADE pro 1\n',
        expectedStdout: 'skipped=3\nactive=1\nmrr=2000\nplans: pro=1\nchurned: -\ntop=ann',
      },
      {
        id: 't3',
        name: 'Everyone leaves',
        stdin: '4\n1 a SUBSCRIBE p 10\n2 b SUBSCRIBE p 10\n3 b CANCEL\n4 a CANCEL\n',
        expectedStdout: 'skipped=0\nactive=0\nmrr=0\nplans: -\nchurned: a,b\ntop=-',
        hidden: true,
      },
      {
        id: 't4',
        name: 'Price tie',
        stdin: '3\n1 zed SUBSCRIBE gold 3000\n2 amy SUBSCRIBE gold 3000\n3 kim SUBSCRIBE silver 1000\n',
        expectedStdout: 'skipped=0\nactive=3\nmrr=7000\nplans: gold=2,silver=1\nchurned: -\ntop=amy',
        hidden: true,
      },
    ],
  },
];
