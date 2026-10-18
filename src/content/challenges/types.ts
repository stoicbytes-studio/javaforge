import type { CodingChallenge } from '@/types/curriculum';

export const typesChallenges: CodingChallenge[] = [
  {
    id: 'ch-palindrome',
    title: 'Sentence palindromes',
    moduleId: 'types',
    lessonId: 't-strings',
    difficulty: 'beginner',
    kind: 'coding',
    dimension: 'coding',
    concepts: ['two pointers', 'Character methods', 'normalisation'],
    description: `For each input line, print \`YES\` if it is a palindrome when you ignore case and every character that is not a letter or digit, otherwise \`NO\`. An empty result (no letters or digits) counts as a palindrome.

Input: t, then t lines. Solve it **without** building a reversed copy of the string.`,
    starterCode: `import java.io.*;

public class Main {
    static boolean isPalindrome(String s) {
        // TODO: two pointers, skipping non-alphanumeric characters
        return false;
    }

    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int t = Integer.parseInt(in.readLine().trim());
        for (int i = 0; i < t; i++) System.out.println(isPalindrome(in.readLine()) ? "YES" : "NO");
    }
}`,
    solution: `import java.io.*;

public class Main {
    static boolean isPalindrome(String s) {
        int left = 0, right = s.length() - 1;
        while (left < right) {
            char a = s.charAt(left), b = s.charAt(right);
            if (!Character.isLetterOrDigit(a)) { left++; continue; }
            if (!Character.isLetterOrDigit(b)) { right--; continue; }
            if (Character.toLowerCase(a) != Character.toLowerCase(b)) return false;
            left++;
            right--;
        }
        return true;
    }

    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int t = Integer.parseInt(in.readLine().trim());
        for (int i = 0; i < t; i++) System.out.println(isPalindrome(in.readLine()) ? "YES" : "NO");
    }
}`,
    solutionExplanation:
      'Two indexes move towards each other, skipping characters that do not count. Comparing lower-cased characters in place uses O(1) extra memory instead of building cleaned and reversed copies.',
    complexity: { time: 'O(n)', space: 'O(1)' },
    hints: ['Use one index from each end.', 'Character.isLetterOrDigit and Character.toLowerCase do the classification.'],
    staticChecks: [{ id: 'no-reverse', description: 'Does not use StringBuilder.reverse()', pattern: '\\.reverse\\s*\\(', mustMatch: false }],
    tests: [
      { id: 't1', name: 'Classic phrases', stdin: '3\nA man, a plan, a canal: Panama\nrace a car\nWas it a car or a cat I saw?\n', expectedStdout: 'YES\nNO\nYES' },
      { id: 't2', name: 'Digits and punctuation only', stdin: '2\n12 3 21\n!!!\n', expectedStdout: 'YES\nYES' },
      { id: 't3', name: 'Near misses', stdin: '2\nab\nNo lemon, no melons\n', expectedStdout: 'NO\nNO', hidden: true },
    ],
  },
  {
    id: 'ch-rle',
    title: 'Run-length compression',
    moduleId: 'types',
    lessonId: 't-strings',
    difficulty: 'beginner',
    kind: 'coding',
    dimension: 'coding',
    concepts: ['StringBuilder', 'counting runs', 'edge cases'],
    description: `Compress each line with run-length encoding: \`aaabccdddd\` → \`a3b1c2d4\`. If the compressed form is **not strictly shorter** than the original, print the original instead.

Input: t, then t lines (letters only, possibly empty).`,
    starterCode: `import java.io.*;

public class Main {
    static String compress(String s) {
        // TODO
        return s;
    }

    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int t = Integer.parseInt(in.readLine().trim());
        for (int i = 0; i < t; i++) {
            String line = in.readLine();
            System.out.println(compress(line == null ? "" : line));
        }
    }
}`,
    solution: `import java.io.*;

public class Main {
    static String compress(String s) {
        StringBuilder out = new StringBuilder();
        int i = 0;
        while (i < s.length()) {
            char c = s.charAt(i);
            int run = 0;
            while (i < s.length() && s.charAt(i) == c) {
                run++;
                i++;
            }
            out.append(c).append(run);
            if (out.length() >= s.length()) return s;   // cannot become shorter
        }
        return out.length() < s.length() ? out.toString() : s;
    }

    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int t = Integer.parseInt(in.readLine().trim());
        for (int i = 0; i < t; i++) {
            String line = in.readLine();
            System.out.println(compress(line == null ? "" : line));
        }
    }
}`,
    solutionExplanation:
      'An inner loop measures each run, and a StringBuilder accumulates "char + count" in amortised O(1) per append. Stopping early once the output is not shorter avoids wasted work on incompressible input.',
    complexity: { time: 'O(n)', space: 'O(n)' },
    hints: ['Count how many times the current character repeats.', 'Append to a StringBuilder, not a String.', 'Compare lengths at the end: strictly shorter only.'],
    tests: [
      { id: 't1', name: 'Compressible', stdin: '2\naaabccdddd\nzzzzzzzzzz\n', expectedStdout: 'a3b1c2d4\nz10' },
      { id: 't2', name: 'Not shorter', stdin: '2\nabc\naabb\n', expectedStdout: 'abc\naabb' },
      { id: 't3', name: 'Case-sensitive runs', stdin: '1\naaAAAAaa\n', expectedStdout: 'a2A4a2' , hidden: true },
    ],
  },
  {
    id: 'ch-integer-compare',
    title: 'Fix the stock reconciliation',
    moduleId: 'types',
    lessonId: 't-wrappers',
    difficulty: 'intermediate',
    kind: 'debugging',
    dimension: 'debugging',
    concepts: ['Integer cache', 'wrapper equality', 'null handling'],
    description: `A reconciliation job compares stock counts from the warehouse and the web shop. It reports false mismatches for large stock levels, and crashes when an item is missing from one system.

Input: n warehouse lines \`sku count\`, then m shop lines \`sku count\` (each section starts with its size). For every SKU in the warehouse (input order) print \`<sku> OK\`, \`<sku> MISMATCH\` or \`<sku> MISSING\` (not in the shop). Fix the bugs.`,
    starterCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        Map<String, Integer> warehouse = new LinkedHashMap<>();
        int n = in.nextInt();
        for (int i = 0; i < n; i++) warehouse.put(in.next(), in.nextInt());
        Map<String, Integer> shop = new HashMap<>();
        int m = in.nextInt();
        for (int i = 0; i < m; i++) shop.put(in.next(), in.nextInt());

        for (String sku : warehouse.keySet()) {
            Integer expected = warehouse.get(sku);
            Integer actual = shop.get(sku);
            if (expected == actual) System.out.println(sku + " OK");
            else if (actual.intValue() >= 0) System.out.println(sku + " MISMATCH");
        }
    }
}`,
    solution: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        Map<String, Integer> warehouse = new LinkedHashMap<>();
        int n = in.nextInt();
        for (int i = 0; i < n; i++) warehouse.put(in.next(), in.nextInt());
        Map<String, Integer> shop = new HashMap<>();
        int m = in.nextInt();
        for (int i = 0; i < m; i++) shop.put(in.next(), in.nextInt());

        for (Map.Entry<String, Integer> e : warehouse.entrySet()) {
            Integer actual = shop.get(e.getKey());
            String status;
            if (actual == null) status = "MISSING";
            else if (e.getValue().equals(actual)) status = "OK";
            else status = "MISMATCH";
            System.out.println(e.getKey() + " " + status);
        }
    }
}`,
    solutionExplanation:
      '`expected == actual` compares Integer references, which only coincide for cached values −128…127, so equal counts of 500 were reported as mismatches. A missing SKU returned null, and calling intValue() on it threw NullPointerException. Check for null first, then compare values with equals.',
    complexity: { time: 'O(n + m)', space: 'O(n + m)' },
    hints: ['Try equal counts of 50 and of 500. Why do they behave differently?', 'What does Map.get return for a missing key?'],
    staticChecks: [{ id: 'no-ref-eq', description: 'Does not compare Integer objects with ==', pattern: 'expected\\s*==\\s*actual', mustMatch: false }],
    tests: [
      { id: 't1', name: 'Small counts', stdin: '2\nA 5\nB 7\n2\nA 5\nB 8\n', expectedStdout: 'A OK\nB MISMATCH' },
      { id: 't2', name: 'Large equal counts', stdin: '2\nC 500\nD 1000\n2\nD 1000\nC 500\n', expectedStdout: 'C OK\nD OK' },
      { id: 't3', name: 'Missing SKU', stdin: '3\nE 1\nF 300\nG 2\n2\nE 1\nG 3\n', expectedStdout: 'E OK\nF MISSING\nG MISMATCH', hidden: true },
    ],
  },
  {
    id: 'ch-generic-stats',
    title: 'Generic statistics helpers',
    moduleId: 'types',
    lessonId: 't-generics',
    difficulty: 'intermediate',
    kind: 'coding',
    dimension: 'coding',
    concepts: ['bounded type parameters', 'wildcards', 'Comparable'],
    description: `Implement two generic helpers:

- \`static <T extends Comparable<? super T>> T[] minMax(List<? extends T> items, T[] out)\` — writes the minimum to \`out[0]\` and maximum to \`out[1]\` and returns \`out\`.
- \`static double average(Collection<? extends Number> numbers)\`

The provided main reads integers then words and prints min/max/average for the numbers and min/max for the words (lexicographic). Inputs are non-empty.`,
    starterCode: `import java.util.*;

public class Main {
    static <T extends Comparable<? super T>> T[] minMax(List<? extends T> items, T[] out) {
        // TODO
        return out;
    }

    static double average(Collection<? extends Number> numbers) {
        // TODO
        return 0;
    }

    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt();
        List<Integer> nums = new ArrayList<>();
        for (int i = 0; i < n; i++) nums.add(in.nextInt());
        int w = in.nextInt();
        List<String> words = new ArrayList<>();
        for (int i = 0; i < w; i++) words.add(in.next());

        Integer[] nm = minMax(nums, new Integer[2]);
        String[] wm = minMax(words, new String[2]);
        System.out.println("numbers min=" + nm[0] + " max=" + nm[1] + " avg=" + String.format(Locale.ROOT, "%.2f", average(nums)));
        System.out.println("words min=" + wm[0] + " max=" + wm[1]);
    }
}`,
    solution: `import java.util.*;

public class Main {
    static <T extends Comparable<? super T>> T[] minMax(List<? extends T> items, T[] out) {
        T min = items.get(0), max = items.get(0);
        for (T item : items) {
            if (item.compareTo(min) < 0) min = item;
            if (item.compareTo(max) > 0) max = item;
        }
        out[0] = min;
        out[1] = max;
        return out;
    }

    static double average(Collection<? extends Number> numbers) {
        double sum = 0;
        for (Number n : numbers) sum += n.doubleValue();
        return sum / numbers.size();
    }

    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt();
        List<Integer> nums = new ArrayList<>();
        for (int i = 0; i < n; i++) nums.add(in.nextInt());
        int w = in.nextInt();
        List<String> words = new ArrayList<>();
        for (int i = 0; i < w; i++) words.add(in.next());

        Integer[] nm = minMax(nums, new Integer[2]);
        String[] wm = minMax(words, new String[2]);
        System.out.println("numbers min=" + nm[0] + " max=" + nm[1] + " avg=" + String.format(Locale.ROOT, "%.2f", average(nums)));
        System.out.println("words min=" + wm[0] + " max=" + wm[1]);
    }
}`,
    solutionExplanation:
      'The bound `Comparable<? super T>` lets compareTo come from T or a supertype. The caller passes the output array because, with erasure, the method cannot create a `T[]` itself. `? extends Number` lets average accept lists of any numeric wrapper.',
    complexity: { time: 'O(n)', space: 'O(1)' },
    hints: ['Initialise min and max with the first element.', 'Number.doubleValue() works for every numeric wrapper.'],
    tests: [
      { id: 't1', name: 'Mixed values', stdin: '5\n4 -2 9 0 3\n3\npear apple fig\n', expectedStdout: 'numbers min=-2 max=9 avg=2.80\nwords min=apple max=pear' },
      { id: 't2', name: 'Single values', stdin: '1\n7\n1\nsolo\n', expectedStdout: 'numbers min=7 max=7 avg=7.00\nwords min=solo max=solo' },
      { id: 't3', name: 'Case ordering', stdin: '2\n1 2\n3\nbanana Apple cherry\n', expectedStdout: 'numbers min=1 max=2 avg=1.50\nwords min=Apple max=cherry', hidden: true },
    ],
  },
  {
    id: 'boss-event-log',
    title: 'Boss: typed event log',
    moduleId: 'types',
    difficulty: 'advanced',
    kind: 'boss',
    dimension: 'coding',
    concepts: ['sealed interfaces', 'records', 'pattern matching', 'string parsing', 'validation'],
    description: `Module 4 capstone. Parse a log of events into a **sealed** hierarchy of records and produce a report.

Each line is one of:
- \`LOGIN <user>\`
- \`PURCHASE <user> <amountCents>\`
- \`LOGOUT <user>\`
Anything else (unknown type, wrong number of fields, non-numeric or negative amount) is **invalid**.

Rules: a purchase only counts if the user is currently logged in; otherwise it is \`rejected\`. Print:

\`\`\`
valid=<n> invalid=<n> rejected=<n>
<user> <totalCents>      (one line per user with accepted purchases, sorted by user name)
\`\`\`

Model events as \`sealed interface Event permits Login, Purchase, Logout\` and process them with a pattern-matching switch.`,
    starterCode: `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(in.readLine().trim());
        for (int i = 0; i < n; i++) {
            String line = in.readLine();
            // TODO
        }
        System.out.println("valid=0 invalid=0 rejected=0");
    }
}`,
    solution: `import java.io.*;
import java.util.*;

sealed interface Event permits Login, Purchase, Logout {}
record Login(String user) implements Event {}
record Purchase(String user, long cents) implements Event {}
record Logout(String user) implements Event {}

public class Main {
    static Optional<Event> parse(String line) {
        String[] p = line.trim().split("\\\\s+");
        try {
            return switch (p[0]) {
                case "LOGIN" -> p.length == 2 ? Optional.of(new Login(p[1])) : Optional.empty();
                case "LOGOUT" -> p.length == 2 ? Optional.of(new Logout(p[1])) : Optional.empty();
                case "PURCHASE" -> {
                    if (p.length != 3) yield Optional.empty();
                    long cents = Long.parseLong(p[2]);
                    yield cents < 0 ? Optional.empty() : Optional.of(new Purchase(p[1], cents));
                }
                default -> Optional.empty();
            };
        } catch (NumberFormatException e) {
            return Optional.empty();
        }
    }

    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(in.readLine().trim());
        int valid = 0, invalid = 0, rejected = 0;
        Set<String> online = new HashSet<>();
        Map<String, Long> totals = new TreeMap<>();

        for (int i = 0; i < n; i++) {
            Optional<Event> parsed = parse(in.readLine());
            if (parsed.isEmpty()) {
                invalid++;
                continue;
            }
            valid++;
            switch (parsed.get()) {
                case Login(String user) -> online.add(user);
                case Logout(String user) -> online.remove(user);
                case Purchase(String user, long cents) -> {
                    if (online.contains(user)) totals.merge(user, cents, Long::sum);
                    else rejected++;
                }
            }
        }

        System.out.println("valid=" + valid + " invalid=" + invalid + " rejected=" + rejected);
        totals.forEach((user, cents) -> System.out.println(user + " " + cents));
    }
}`,
    solutionExplanation:
      'Parsing and processing are separated: parse returns Optional.empty() for anything malformed, so the processing switch only ever sees well-formed events. Because Event is sealed, the switch over it is exhaustive without a default — adding a new event type will not compile until it is handled. A TreeMap keeps users sorted, and merge accumulates totals.',
    complexity: { time: 'O(n log u) for u users', space: 'O(u)' },
    hints: [
      'Validate field counts before reading fields.',
      'Long.parseLong throws NumberFormatException for non-numeric amounts.',
      'A rejected purchase is still a valid event.',
    ],
    tests: [
      {
        id: 't1',
        name: 'Typical session',
        stdin: '6\nLOGIN ann\nPURCHASE ann 1200\nPURCHASE bob 500\nLOGIN bob\nPURCHASE bob 300\nLOGOUT ann\n',
        expectedStdout: 'valid=6 invalid=0 rejected=1\nann 1200\nbob 300',
      },
      {
        id: 't2',
        name: 'Invalid lines',
        stdin: '6\nLOGIN\nPURCHASE ann ten\nREFUND ann 5\nPURCHASE ann -1\nLOGIN ann\nPURCHASE ann 1 2\n',
        expectedStdout: 'valid=1 invalid=5 rejected=0',
      },
      {
        id: 't3',
        name: 'Logout stops purchases',
        stdin: '7\nLOGIN zed\nPURCHASE zed 100\nLOGOUT zed\nPURCHASE zed 100\nLOGIN amy\nPURCHASE amy 50\nPURCHASE amy 50\n',
        expectedStdout: 'valid=7 invalid=0 rejected=1\namy 100\nzed 100',
        hidden: true,
      },
    ],
  },
];
