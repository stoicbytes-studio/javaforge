import type { CodingChallenge } from '@/types/curriculum';

export const collectionsChallenges: CodingChallenge[] = [
  {
    id: 'ch-brackets',
    title: 'Balanced brackets',
    moduleId: 'collections',
    lessonId: 'c-collections-overview',
    difficulty: 'beginner',
    kind: 'coding',
    dimension: 'coding',
    concepts: ['stack', 'ArrayDeque', 'matching pairs'],
    description: `For each line, print \`OK\` if every \`()\`, \`[]\` and \`{}\` is balanced and correctly nested, otherwise print \`ERROR at <position>\` where position is the **1-based** index of the first character that makes it invalid (an unexpected closer), or \`ERROR at <length + 1>\` when the line ends with unclosed brackets. Other characters are ignored.

Input: t, then t lines.`,
    starterCode: `import java.io.*;
import java.util.*;

public class Main {
    static String check(String s) {
        // TODO: use an ArrayDeque<Character> as a stack
        return "OK";
    }

    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int t = Integer.parseInt(in.readLine().trim());
        for (int i = 0; i < t; i++) System.out.println(check(in.readLine()));
    }
}`,
    solution: `import java.io.*;
import java.util.*;

public class Main {
    static String check(String s) {
        Deque<Character> stack = new ArrayDeque<>();
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '(', '[', '{' -> stack.push(c);
                case ')', ']', '}' -> {
                    char expected = c == ')' ? '(' : c == ']' ? '[' : '{';
                    if (stack.isEmpty() || stack.pop() != expected) return "ERROR at " + (i + 1);
                }
                default -> { }
            }
        }
        return stack.isEmpty() ? "OK" : "ERROR at " + (s.length() + 1);
    }

    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int t = Integer.parseInt(in.readLine().trim());
        for (int i = 0; i < t; i++) System.out.println(check(in.readLine()));
    }
}`,
    solutionExplanation:
      'Openers are pushed; each closer must match the most recently opened bracket, which is exactly last-in-first-out — a stack. ArrayDeque is the recommended stack implementation (java.util.Stack is legacy and synchronised). Anything left on the stack at the end was never closed.',
    complexity: { time: 'O(n)', space: 'O(n)' },
    hints: ['Which bracket must a closer match?', 'Push openers; pop on closers.', 'What if the stack is not empty at the end?'],
    tests: [
      { id: 't1', name: 'Valid and invalid', stdin: '3\n{[()()]}\n([)]\nif (a[0] == b) { x(); }\n', expectedStdout: 'OK\nERROR at 3\nOK' },
      { id: 't2', name: 'Unclosed and extra closer', stdin: '2\n((\n())\n', expectedStdout: 'ERROR at 3\nERROR at 3' },
      { id: 't3', name: 'Empty line and noise', stdin: '2\n\nabc}\n', expectedStdout: 'OK\nERROR at 4', hidden: true },
    ],
  },
  {
    id: 'ch-word-frequency',
    title: 'Top-k word frequency',
    moduleId: 'collections',
    lessonId: 'c-hashmap',
    difficulty: 'intermediate',
    kind: 'coding',
    dimension: 'coding',
    concepts: ['HashMap merge', 'comparator chains', 'normalisation'],
    description: `Read k on the first line, then text until the end of input. Words are maximal runs of letters (a–z, A–Z) and apostrophes are not letters; compare words case-insensitively (lower-case them with \`Locale.ROOT\`).

Print the k most frequent words as \`word count\`, ordered by count descending, then word ascending. If there are fewer than k distinct words, print them all.`,
    starterCode: `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int k = Integer.parseInt(in.readLine().trim());
        StringBuilder text = new StringBuilder();
        String line;
        while ((line = in.readLine()) != null) text.append(line).append('\\n');
        // TODO
    }
}`,
    solution: `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int k = Integer.parseInt(in.readLine().trim());
        StringBuilder text = new StringBuilder();
        String line;
        while ((line = in.readLine()) != null) text.append(line).append('\\n');

        Map<String, Integer> counts = new HashMap<>();
        for (String word : text.toString().split("[^A-Za-z]+")) {
            if (!word.isEmpty()) counts.merge(word.toLowerCase(Locale.ROOT), 1, Integer::sum);
        }

        List<Map.Entry<String, Integer>> entries = new ArrayList<>(counts.entrySet());
        entries.sort(Map.Entry.<String, Integer>comparingByValue().reversed()
            .thenComparing(Map.Entry.comparingByKey()));
        for (int i = 0; i < Math.min(k, entries.size()); i++) {
            System.out.println(entries.get(i).getKey() + " " + entries.get(i).getValue());
        }
    }
}`,
    solutionExplanation:
      'Splitting on runs of non-letters yields the words (a leading empty token is skipped). merge counts in one lookup per word. The comparator orders by count descending, then alphabetically. For very large vocabularies a size-k PriorityQueue avoids sorting everything: O(n log k).',
    complexity: { time: 'O(n + u log u) for u distinct words', space: 'O(u)' },
    hints: ['split("[^A-Za-z]+") splits on anything that is not a letter.', 'Map.Entry.comparingByValue() needs explicit type witnesses to be reversed.'],
    tests: [
      { id: 't1', name: 'Simple text', stdin: '2\nthe cat and the hat\nThe end\n', expectedStdout: 'the 3\nand 1' },
      { id: 't2', name: 'Punctuation and ties', stdin: '3\nGo, go, GO! Stop; stop... wait?\n', expectedStdout: 'go 3\nstop 2\nwait 1' },
      { id: 't3', name: 'Fewer words than k', stdin: '5\nhello world\n', expectedStdout: 'hello 1\nworld 1', hidden: true },
    ],
  },
  {
    id: 'ch-lru',
    title: 'LRU cache',
    moduleId: 'collections',
    lessonId: 'c-hashmap',
    difficulty: 'intermediate',
    kind: 'coding',
    dimension: 'coding',
    concepts: ['LinkedHashMap access order', 'eviction', 'O(1) operations'],
    description: `Implement an LRU cache of capacity c with O(1) \`get\` and \`put\`.

Input: c and n, then n commands:
- \`put <key> <value>\` → prints \`evicted <key>\` if an entry had to be removed, otherwise nothing
- \`get <key>\` → prints the value or \`miss\`

Both \`get\` hits and \`put\` (including updates of existing keys) count as use. Finally print the keys from least to most recently used, space-separated.`,
    starterCode: `import java.util.*;

class LruCache {
    LruCache(int capacity) {
        // TODO
    }

    /** Returns the evicted key, or null. */
    String put(String key, String value) {
        return null;
    }

    String get(String key) {
        return null;
    }

    Collection<String> keysLeastRecentFirst() {
        return List.of();
    }
}

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        LruCache cache = new LruCache(in.nextInt());
        int n = in.nextInt();
        for (int i = 0; i < n; i++) {
            String op = in.next();
            if (op.equals("put")) {
                String evicted = cache.put(in.next(), in.next());
                if (evicted != null) System.out.println("evicted " + evicted);
            } else {
                String v = cache.get(in.next());
                System.out.println(v == null ? "miss" : v);
            }
        }
        System.out.println(String.join(" ", cache.keysLeastRecentFirst()));
    }
}`,
    solution: `import java.util.*;

class LruCache {
    private final int capacity;
    private final LinkedHashMap<String, String> map = new LinkedHashMap<>(16, 0.75f, true);

    LruCache(int capacity) {
        this.capacity = capacity;
    }

    /** Returns the evicted key, or null. */
    String put(String key, String value) {
        map.put(key, value);
        if (map.size() > capacity) {
            String eldest = map.keySet().iterator().next();
            map.remove(eldest);
            return eldest;
        }
        return null;
    }

    String get(String key) {
        return map.get(key);
    }

    Collection<String> keysLeastRecentFirst() {
        return map.keySet();
    }
}

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        LruCache cache = new LruCache(in.nextInt());
        int n = in.nextInt();
        for (int i = 0; i < n; i++) {
            String op = in.next();
            if (op.equals("put")) {
                String evicted = cache.put(in.next(), in.next());
                if (evicted != null) System.out.println("evicted " + evicted);
            } else {
                String v = cache.get(in.next());
                System.out.println(v == null ? "miss" : v);
            }
        }
        System.out.println(String.join(" ", cache.keysLeastRecentFirst()));
    }
}`,
    solutionExplanation:
      'A LinkedHashMap in access order moves an entry to the end on every get or put, so the first key is always the least recently used. Evicting it explicitly lets us report which key went. Under the hood this is the classic "hash map + doubly linked list" LRU design.',
    complexity: { time: 'O(1) per operation', space: 'O(capacity)' },
    hints: ['LinkedHashMap has a constructor with an accessOrder flag.', 'The first key in an access-ordered LinkedHashMap is the eldest.'],
    tests: [
      { id: 't1', name: 'Eviction order', stdin: '2 5\nput a 1\nput b 2\nget a\nput c 3\nget b\n', expectedStdout: '1\nevicted b\nmiss\na c' },
      { id: 't2', name: 'Updates count as use', stdin: '2 4\nput a 1\nput b 2\nput a 9\nput c 3\n', expectedStdout: 'evicted b\na c' },
      { id: 't3', name: 'Capacity one', stdin: '1 4\nput x 1\nget x\nput y 2\nget x\n', expectedStdout: '1\nevicted x\nmiss\ny', hidden: true },
    ],
  },
  {
    id: 'ch-cme-cleanup',
    title: 'Fix the session reaper',
    moduleId: 'collections',
    lessonId: 'c-iteration',
    difficulty: 'intermediate',
    kind: 'debugging',
    dimension: 'debugging',
    concepts: ['ConcurrentModificationException', 'removeIf', 'map views'],
    description: `The reaper removes expired sessions (\`lastSeen < now - ttl\`) but crashes with \`ConcurrentModificationException\` — and in some runs silently keeps expired sessions. Fix it.

Input: \`now ttl n\`, then n lines \`<sessionId> <lastSeen>\`. Output: \`removed=<count>\` followed by the remaining session ids in input order.`,
    starterCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        long now = in.nextLong(), ttl = in.nextLong();
        int n = in.nextInt();
        Map<String, Long> sessions = new LinkedHashMap<>();
        for (int i = 0; i < n; i++) sessions.put(in.next(), in.nextLong());

        int removed = 0;
        for (String id : sessions.keySet()) {
            if (sessions.get(id) < now - ttl) {
                sessions.remove(id);
                removed++;
            }
        }
        System.out.println("removed=" + removed);
        System.out.println(String.join(" ", sessions.keySet()));
    }
}`,
    solution: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        long now = in.nextLong(), ttl = in.nextLong();
        int n = in.nextInt();
        Map<String, Long> sessions = new LinkedHashMap<>();
        for (int i = 0; i < n; i++) sessions.put(in.next(), in.nextLong());

        int before = sessions.size();
        sessions.values().removeIf(lastSeen -> lastSeen < now - ttl);
        int removed = before - sessions.size();
        System.out.println("removed=" + removed);
        System.out.println(String.join(" ", sessions.keySet()));
    }
}`,
    solutionExplanation:
      'Removing from the map while iterating its keySet invalidates the iterator: usually ConcurrentModificationException, and when the removed entry is second-to-last the loop ends early and skips the last entry. values() is a live view, so values().removeIf removes the matching entries safely in one pass. An explicit entrySet().iterator() with it.remove() also works.',
    complexity: { time: 'O(n)', space: 'O(1) extra' },
    hints: ['What happens to an iterator when its collection changes structurally?', 'keySet(), values() and entrySet() are views — removing from them removes from the map.'],
    tests: [
      { id: 't1', name: 'Some expired', stdin: '100 30 4\na 90\nb 50\nc 75\nd 10\n', expectedStdout: 'removed=2\na c' },
      { id: 't2', name: 'Second-to-last expired', stdin: '100 30 3\na 90\nb 10\nc 5\n', expectedStdout: 'removed=2\na' },
      { id: 't3', name: 'None expired', stdin: '100 100 2\nx 1\ny 2\n', expectedStdout: 'removed=0\nx y', hidden: true },
    ],
  },
  {
    id: 'boss-order-book',
    title: 'Boss: limit order book',
    moduleId: 'collections',
    difficulty: 'advanced',
    kind: 'boss',
    dimension: 'coding',
    concepts: ['TreeMap', 'ArrayDeque FIFO', 'HashMap index', 'matching engine'],
    description: `Module 6 capstone: a tiny exchange matching engine.

Commands:
- \`BUY <id> <price> <qty>\` and \`SELL <id> <price> <qty>\`: match against the opposite side. A BUY matches the **lowest** ask with price ≤ its price; a SELL matches the **highest** bid with price ≥ its price. Within a price level, older orders fill first (FIFO). Each fill prints \`TRADE <buyId> <sellId> <price> <qty>\` at the **resting** order's price. Any remaining quantity rests in the book.
- \`CANCEL <id>\` → \`CANCELLED <id>\` (removes a resting order) or \`UNKNOWN <id>\`.
- \`BOOK\` → two lines: \`BIDS: <price>:<totalQty>,...\` (highest price first) and \`ASKS: <price>:<totalQty>,...\` (lowest first); an empty side prints \`-\`.

Order ids are unique. Input: n, then n commands.`,
    starterCode: `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(in.readLine().trim());
        for (int i = 0; i < n; i++) {
            String[] c = in.readLine().trim().split(" ");
            // TODO
        }
    }
}`,
    solution: `import java.io.*;
import java.util.*;

public class Main {
    static final class Order {
        final String id;
        final boolean buy;
        final int price;
        int qty;
        Order(String id, boolean buy, int price, int qty) { this.id = id; this.buy = buy; this.price = price; this.qty = qty; }
    }

    static final TreeMap<Integer, Deque<Order>> bids = new TreeMap<>(Comparator.reverseOrder());
    static final TreeMap<Integer, Deque<Order>> asks = new TreeMap<>();
    static final Map<String, Order> live = new HashMap<>();
    static final StringBuilder out = new StringBuilder();

    static void submit(Order incoming) {
        TreeMap<Integer, Deque<Order>> opposite = incoming.buy ? asks : bids;
        while (incoming.qty > 0 && !opposite.isEmpty()) {
            Map.Entry<Integer, Deque<Order>> best = opposite.firstEntry();
            int price = best.getKey();
            boolean crosses = incoming.buy ? price <= incoming.price : price >= incoming.price;
            if (!crosses) break;
            Deque<Order> level = best.getValue();
            Order resting = level.peekFirst();
            int fill = Math.min(incoming.qty, resting.qty);
            String buyId = incoming.buy ? incoming.id : resting.id;
            String sellId = incoming.buy ? resting.id : incoming.id;
            out.append("TRADE ").append(buyId).append(' ').append(sellId).append(' ')
               .append(price).append(' ').append(fill).append('\\n');
            incoming.qty -= fill;
            resting.qty -= fill;
            if (resting.qty == 0) {
                level.pollFirst();
                live.remove(resting.id);
                if (level.isEmpty()) opposite.pollFirstEntry();
            }
        }
        if (incoming.qty > 0) {
            (incoming.buy ? bids : asks).computeIfAbsent(incoming.price, p -> new ArrayDeque<>()).addLast(incoming);
            live.put(incoming.id, incoming);
        }
    }

    static void cancel(String id) {
        Order o = live.remove(id);
        if (o == null) {
            out.append("UNKNOWN ").append(id).append('\\n');
            return;
        }
        TreeMap<Integer, Deque<Order>> side = o.buy ? bids : asks;
        Deque<Order> level = side.get(o.price);
        level.remove(o);
        if (level.isEmpty()) side.remove(o.price);
        out.append("CANCELLED ").append(id).append('\\n');
    }

    static String describe(TreeMap<Integer, Deque<Order>> side) {
        if (side.isEmpty()) return "-";
        StringJoiner j = new StringJoiner(",");
        side.forEach((price, level) -> j.add(price + ":" + level.stream().mapToInt(o -> o.qty).sum()));
        return j.toString();
    }

    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(in.readLine().trim());
        for (int i = 0; i < n; i++) {
            String[] c = in.readLine().trim().split(" ");
            switch (c[0]) {
                case "BUY", "SELL" -> submit(new Order(c[1], c[0].equals("BUY"), Integer.parseInt(c[2]), Integer.parseInt(c[3])));
                case "CANCEL" -> cancel(c[1]);
                case "BOOK" -> out.append("BIDS: ").append(describe(bids)).append('\\n')
                                  .append("ASKS: ").append(describe(asks)).append('\\n');
                default -> throw new IllegalArgumentException(c[0]);
            }
        }
        System.out.print(out);
    }
}`,
    solutionExplanation:
      'Each side is a TreeMap from price to a FIFO queue of orders. Bids use a reverse comparator so firstEntry() is always the best price on both sides — O(log L) for L price levels. ArrayDeque gives FIFO priority within a level, and a HashMap from id to order makes cancel lookups O(1) (removing from its level is O(level size)). This "price-time priority" structure is how real exchange matching engines are organised, albeit with more optimised data structures.',
    complexity: { time: 'O(log L) per price-level change, O(1) per fill', space: 'O(resting orders)' },
    hints: [
      'TreeMap<Integer, Deque<Order>> per side; give bids a reversed comparator.',
      'Trades happen at the resting order\'s price.',
      'Remove empty price levels so firstEntry() stays correct.',
    ],
    tests: [
      {
        id: 't1',
        name: 'Partial fills and resting',
        stdin: '5\nSELL s1 101 5\nSELL s2 100 3\nBUY b1 101 6\nBOOK\nBUY b2 99 4\n',
        expectedStdout: 'TRADE b1 s2 100 3\nTRADE b1 s1 101 3\nBIDS: -\nASKS: 101:2',
      },
      {
        id: 't2',
        name: 'FIFO at one price and cancel',
        stdin: '7\nBUY b1 50 2\nBUY b2 50 2\nBUY b3 49 1\nSELL s1 49 3\nCANCEL b2\nCANCEL zz\nBOOK\n',
        expectedStdout: 'TRADE b1 s1 50 2\nTRADE b2 s1 50 1\nCANCELLED b2\nUNKNOWN zz\nBIDS: 49:1\nASKS: -',
      },
      {
        id: 't3',
        name: 'No cross',
        stdin: '4\nBUY b 10 1\nSELL s 11 1\nBOOK\nCANCEL s\n',
        expectedStdout: 'BIDS: 10:1\nASKS: 11:1\nCANCELLED s',
        hidden: true,
      },
    ],
  },
];
