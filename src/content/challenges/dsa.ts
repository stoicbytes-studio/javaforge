import type { CodingChallenge } from '@/types/curriculum';

export const dsaChallenges: CodingChallenge[] = [
  {
    id: 'ch-two-sum',
    title: 'Two sum: first matching pair',
    moduleId: 'dsa',
    lessonId: 'a-patterns',
    difficulty: 'intermediate',
    kind: 'coding',
    dimension: 'coding',
    concepts: ['hashing for lookups', 'complement search', 'long arithmetic'],
    description: `Read n and a target on the first line, then n integers (each fits in an \`int\`, may be negative or repeated).

Find indices \`i < j\` with \`a[i] + a[j] == target\`. If several pairs exist, choose the one with the **smallest j**, and for that j the **smallest i**. Print \`i j\` (0-based), or \`none\` if no pair exists. An element cannot be paired with itself.

Aim for O(n) time: the brute-force double loop is O(n^2).`,
    starterCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt();
        long target = in.nextLong();
        int[] a = new int[n];
        for (int i = 0; i < n; i++) a[i] = in.nextInt();
        // TODO: for each j, look up whether target - a[j] was seen earlier
        System.out.println("none");
    }
}`,
    solution: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt();
        long target = in.nextLong();
        int[] a = new int[n];
        for (int i = 0; i < n; i++) a[i] = in.nextInt();

        Map<Long, Integer> firstIndex = new HashMap<>();
        for (int j = 0; j < n; j++) {
            Integer i = firstIndex.get(target - a[j]);
            if (i != null) {
                System.out.println(i + " " + j);
                return;
            }
            firstIndex.putIfAbsent((long) a[j], j);
        }
        System.out.println("none");
    }
}`,
    solutionExplanation:
      'Scanning j from left to right and returning at the first hit gives the smallest j. Looking up before inserting a[j] prevents pairing an element with itself, and putIfAbsent keeps the earliest index of each value, which gives the smallest i. The complement is computed in long so values near the int limits cannot overflow.',
    complexity: { time: 'O(n) expected', space: 'O(n)', notes: 'Sorting plus two pointers would be O(n log n) and loses the original indices.' },
    hints: [
      'For each a[j], which value would complete the pair?',
      'A HashMap from value to the first index where it appeared answers "have I seen it?" in O(1).',
      'Look up before you insert the current element.',
      'Can target - a[j] overflow an int?',
    ],
    tests: [
      { id: 't1', name: 'Classic', stdin: '4 9\n2 7 11 15\n', expectedStdout: '0 1' },
      { id: 't2', name: 'Smallest j wins', stdin: '4 8\n1 5 3 7\n', expectedStdout: '1 2' },
      { id: 't3', name: 'Negatives and duplicates', stdin: '5 -4\n-1 6 -3 -1 -3\n', expectedStdout: '0 2' },
      { id: 't4', name: 'No pair, no self-pairing', stdin: '2 6\n3 4\n', expectedStdout: 'none' },
      { id: 't5', name: 'Empty input', stdin: '0 5\n', expectedStdout: 'none', hidden: true },
      { id: 't6', name: 'Large values', stdin: '3 4000000000\n2000000000 1 2000000000\n', expectedStdout: '0 2', hidden: true },
    ],
    staticChecks: [
      { id: 'uses-map', description: 'Uses a hash map for O(1) complement lookups', pattern: 'Map<', mustMatch: true },
    ],
  },
  {
    id: 'ch-longest-unique',
    title: 'Longest substring without repeats',
    moduleId: 'dsa',
    lessonId: 'a-patterns',
    difficulty: 'intermediate',
    kind: 'coding',
    dimension: 'coding',
    concepts: ['sliding window', 'last-seen index', 'HashMap'],
    description: `Input: t, then t lines (a line may be empty and may contain spaces or punctuation; every character counts, including spaces).

For each line print the length of the longest **contiguous** substring in which no character repeats.

Example: \`abcabcbb\` → 3 (\`abc\`), \`pwwkew\` → 3 (\`wke\`), empty line → 0.`,
    starterCode: `import java.io.*;
import java.util.*;

public class Main {
    static int longest(String s) {
        // TODO: sliding window [left, right] with the last index of each character
        return 0;
    }

    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int t = Integer.parseInt(in.readLine().trim());
        for (int i = 0; i < t; i++) {
            String line = in.readLine();
            System.out.println(longest(line == null ? "" : line));
        }
    }
}`,
    solution: `import java.io.*;
import java.util.*;

public class Main {
    static int longest(String s) {
        Map<Character, Integer> lastSeen = new HashMap<>();
        int best = 0;
        int left = 0;
        for (int right = 0; right < s.length(); right++) {
            Integer prev = lastSeen.put(s.charAt(right), right);
            if (prev != null && prev >= left) left = prev + 1;
            best = Math.max(best, right - left + 1);
        }
        return best;
    }

    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int t = Integer.parseInt(in.readLine().trim());
        for (int i = 0; i < t; i++) {
            String line = in.readLine();
            System.out.println(longest(line == null ? "" : line));
        }
    }
}`,
    solutionExplanation:
      'The window [left, right] never contains a repeat. When s[right] was last seen inside the window, left jumps just past that occurrence; occurrences before left are ignored (the "abba" case). Each index is visited once, so the scan is O(n).',
    complexity: { time: 'O(n) per line', space: 'O(k) for k distinct characters' },
    hints: [
      'The brute force checks every substring: O(n^3) or O(n^2). What work repeats?',
      'Keep a window that never contains a duplicate, and remember where each character was last seen.',
      'In "abba", the second a was last seen before the window starts. Should left move backwards?',
    ],
    tests: [
      { id: 't1', name: 'Examples', stdin: '3\nabcabcbb\nbbbbb\npwwkew\n', expectedStdout: '3\n1\n3' },
      { id: 't2', name: 'Empty line and stale duplicate', stdin: '3\n\nabba\ndvdf\n', expectedStdout: '0\n2\n3' },
      { id: 't3', name: 'Spaces count', stdin: '2\na b c a\nThe quick brown fox\n', expectedStdout: '3\n11', hidden: true },
      { id: 't4', name: 'All distinct', stdin: '1\nabcdefghij0123456789\n', expectedStdout: '20', hidden: true },
    ],
  },
  {
    id: 'ch-merge-intervals',
    title: 'Merge meeting intervals',
    moduleId: 'dsa',
    lessonId: 'a-patterns',
    difficulty: 'intermediate',
    kind: 'coding',
    dimension: 'coding',
    concepts: ['sorting with comparators', 'sweep', 'overflow-safe comparison'],
    description: `Input: n, then n lines \`start end\` (integers, \`start <= end\`, any order, values may be negative).

Merge every pair of intervals that overlap **or touch** (\`[1, 3]\` and \`[3, 5]\` become \`[1, 5]\`). Print the merged intervals sorted by start, one per line as \`start end\`. If n is 0, print \`none\`.`,
    starterCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt();
        List<int[]> intervals = new ArrayList<>();
        for (int i = 0; i < n; i++) intervals.add(new int[] {in.nextInt(), in.nextInt()});
        // TODO: sort by start, then merge overlapping neighbours
        for (int[] iv : intervals) System.out.println(iv[0] + " " + iv[1]);
    }
}`,
    solution: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt();
        List<int[]> intervals = new ArrayList<>();
        for (int i = 0; i < n; i++) intervals.add(new int[] {in.nextInt(), in.nextInt()});
        if (intervals.isEmpty()) {
            System.out.println("none");
            return;
        }

        intervals.sort((x, y) -> Integer.compare(x[0], y[0]));
        List<int[]> merged = new ArrayList<>();
        int[] current = intervals.get(0).clone();
        for (int[] next : intervals) {
            if (next[0] <= current[1]) {
                current[1] = Math.max(current[1], next[1]);   // overlap or touch: extend
            } else {
                merged.add(current);
                current = next.clone();
            }
        }
        merged.add(current);
        for (int[] iv : merged) System.out.println(iv[0] + " " + iv[1]);
    }
}`,
    solutionExplanation:
      'After sorting by start, any interval that overlaps the current merged block must come next, so one left-to-right sweep suffices. Math.max handles intervals fully contained in the current block. Integer.compare avoids the overflow bug of a subtraction comparator.',
    complexity: { time: 'O(n log n)', space: 'O(n)', notes: 'Sorting dominates; the sweep is O(n).' },
    hints: [
      'If the intervals were sorted by start, which ones could overlap the current one?',
      'Keep a "current" interval and either extend it or emit it.',
      'What if the next interval lies completely inside the current one?',
      'Touching counts as overlapping: compare with <=.',
    ],
    tests: [
      { id: 't1', name: 'Classic', stdin: '4\n1 3\n2 6\n8 10\n15 18\n', expectedStdout: '1 6\n8 10\n15 18' },
      { id: 't2', name: 'Unsorted and touching', stdin: '3\n5 7\n1 2\n2 4\n', expectedStdout: '1 4\n5 7' },
      { id: 't3', name: 'Contained intervals', stdin: '3\n1 10\n2 3\n4 5\n', expectedStdout: '1 10' },
      { id: 't4', name: 'No intervals', stdin: '0\n', expectedStdout: 'none', hidden: true },
      { id: 't5', name: 'Negative and extreme values', stdin: '3\n-2000000000 -5\n-5 0\n2000000000 2000000000\n', expectedStdout: '-2000000000 0\n2000000000 2000000000', hidden: true },
    ],
  },
  {
    id: 'ch-grid-bfs',
    title: 'Shortest path in a grid',
    moduleId: 'dsa',
    lessonId: 'a-patterns',
    difficulty: 'advanced',
    kind: 'coding',
    dimension: 'coding',
    concepts: ['BFS', 'ArrayDeque queue', 'grid as implicit graph', 'visited on enqueue'],
    description: `Input: rows and columns r c, then r lines of exactly c characters: \`.\` open cell, \`#\` wall, \`S\` start, \`E\` exit (exactly one of each).

You may move up, down, left or right into any non-wall cell inside the grid. Print the minimum number of moves from S to E, or \`-1\` if E cannot be reached.

The starter prints the Manhattan distance, which ignores walls. Replace it with a real search.`,
    starterCode: `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer st = new StringTokenizer(in.readLine());
        int r = Integer.parseInt(st.nextToken());
        int c = Integer.parseInt(st.nextToken());
        char[][] grid = new char[r][];
        int sr = 0, sc = 0, er = 0, ec = 0;
        for (int i = 0; i < r; i++) {
            grid[i] = in.readLine().toCharArray();
            for (int j = 0; j < c; j++) {
                if (grid[i][j] == 'S') { sr = i; sc = j; }
                if (grid[i][j] == 'E') { er = i; ec = j; }
            }
        }
        // TODO: walls matter. Use BFS instead of the straight-line distance.
        System.out.println(Math.abs(sr - er) + Math.abs(sc - ec));
    }
}`,
    solution: `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer st = new StringTokenizer(in.readLine());
        int r = Integer.parseInt(st.nextToken());
        int c = Integer.parseInt(st.nextToken());
        char[][] grid = new char[r][];
        int sr = 0, sc = 0, er = 0, ec = 0;
        for (int i = 0; i < r; i++) {
            grid[i] = in.readLine().toCharArray();
            for (int j = 0; j < c; j++) {
                if (grid[i][j] == 'S') { sr = i; sc = j; }
                if (grid[i][j] == 'E') { er = i; ec = j; }
            }
        }

        int[][] dist = new int[r][c];
        for (int[] row : dist) Arrays.fill(row, -1);
        int[] dr = {-1, 1, 0, 0};
        int[] dc = {0, 0, -1, 1};
        Deque<int[]> queue = new ArrayDeque<>();
        dist[sr][sc] = 0;
        queue.add(new int[] {sr, sc});
        while (!queue.isEmpty()) {
            int[] cell = queue.poll();
            if (cell[0] == er && cell[1] == ec) break;
            for (int d = 0; d < 4; d++) {
                int nr = cell[0] + dr[d];
                int nc = cell[1] + dc[d];
                if (nr < 0 || nr >= r || nc < 0 || nc >= c) continue;
                if (grid[nr][nc] == '#' || dist[nr][nc] != -1) continue;
                dist[nr][nc] = dist[cell[0]][cell[1]] + 1;   // mark when enqueued
                queue.add(new int[] {nr, nc});
            }
        }
        System.out.println(dist[er][ec]);
    }
}`,
    solutionExplanation:
      'Each cell is a node with up to four neighbours. BFS dequeues cells in order of distance, so the first time E is reached its distance is minimal. Setting dist when a cell is enqueued doubles as the visited mark and prevents duplicates in the queue. Unreached cells keep -1, which is exactly the required output when E is unreachable.',
    complexity: { time: 'O(r * c)', space: 'O(r * c)' },
    hints: [
      'Think of every open cell as a graph node connected to its open neighbours.',
      'Which traversal visits nodes in order of distance from the start?',
      'Store distances in an int[r][c] initialised to -1; it doubles as the visited set.',
      'Check bounds before reading grid[nr][nc].',
    ],
    tests: [
      { id: 't1', name: 'Open path', stdin: '3 4\nS..#\n.#..\n...E\n', expectedStdout: '5' },
      { id: 't2', name: 'Walled in', stdin: '3 3\nS#.\n##.\n..E\n', expectedStdout: '-1' },
      { id: 't3', name: 'Detour required', stdin: '5 5\nS.#..\n.#...\n.#.#.\n...#.\n##.#E\n', expectedStdout: '12' },
      { id: 't4', name: 'Adjacent', stdin: '1 2\nSE\n', expectedStdout: '1', hidden: true },
      { id: 't5', name: 'Wall between neighbours', stdin: '3 3\nS#E\n.#.\n...\n', expectedStdout: '6', hidden: true },
    ],
    staticChecks: [
      { id: 'uses-queue', description: 'Uses a queue (ArrayDeque or Queue) for breadth-first search', pattern: 'ArrayDeque|Queue<', mustMatch: true },
    ],
  },
  {
    id: 'ch-range-count',
    title: 'Debug: counting values in a range',
    moduleId: 'dsa',
    lessonId: 'a-patterns',
    difficulty: 'intermediate',
    kind: 'debugging',
    dimension: 'debugging',
    concepts: ['binary search', 'lower bound', 'off-by-one errors', 'half-open ranges'],
    description: `This program answers range queries on a sorted array but gives wrong answers. Find and fix the bugs in \`lowerBound\`.

Input: n, then n integers in non-decreasing order, then q, then q lines \`lo hi\`. For each query print how many values v satisfy \`lo <= v <= hi\`.

\`lowerBound(a, x)\` must return the first index whose value is \`>= x\`, or \`a.length\` if there is none. Each query must stay O(log n).`,
    starterCode: `import java.util.*;

public class Main {
    static int lowerBound(int[] a, long x) {
        int lo = 0, hi = a.length - 1;
        while (lo < hi) {
            int mid = (lo + hi) / 2;
            if (a[mid] <= x) lo = mid + 1;
            else hi = mid;
        }
        return lo;
    }

    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt();
        int[] a = new int[n];
        for (int i = 0; i < n; i++) a[i] = in.nextInt();
        int q = in.nextInt();
        for (int i = 0; i < q; i++) {
            long lo = in.nextLong(), hi = in.nextLong();
            System.out.println(lowerBound(a, hi + 1) - lowerBound(a, lo));
        }
    }
}`,
    solution: `import java.util.*;

public class Main {
    static int lowerBound(int[] a, long x) {
        int lo = 0, hi = a.length;              // half-open: the answer can be a.length
        while (lo < hi) {
            int mid = (lo + hi) >>> 1;          // overflow-safe midpoint
            if (a[mid] < x) lo = mid + 1;       // strictly less: equal values stay on the right
            else hi = mid;
        }
        return lo;
    }

    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt();
        int[] a = new int[n];
        for (int i = 0; i < n; i++) a[i] = in.nextInt();
        int q = in.nextInt();
        for (int i = 0; i < q; i++) {
            long lo = in.nextLong(), hi = in.nextLong();
            System.out.println(lowerBound(a, hi + 1) - lowerBound(a, lo));
        }
    }
}`,
    solutionExplanation:
      'Bug 1: hi started at a.length - 1, so lowerBound could never return a.length and queries above the largest value were off by one. Bug 2: the comparison a[mid] <= x computes the first index greater than x (an upper bound), so values equal to lo were excluded and values equal to hi + 1 were counted. The midpoint is also made overflow-safe; it cannot overflow for array indices in practice, but the habit matters when the same template searches a numeric answer space. Passing x as long keeps hi + 1 from overflowing when hi is Integer.MAX_VALUE.',
    complexity: { time: 'O(log n) per query after reading input', space: 'O(n)' },
    hints: [
      'Trace lowerBound({1, 3, 3, 5, 8}, 3) by hand. Which index should it return?',
      'Can the buggy version ever return a.length? What should lowerBound(a, 100) return?',
      'Write the invariant: everything before lo is < x, everything from hi on is >= x.',
    ],
    tests: [
      { id: 't1', name: 'Duplicates on the boundary', stdin: '5\n1 3 3 5 8\n3\n3 5\n4 4\n1 1\n', expectedStdout: '3\n0\n1' },
      { id: 't2', name: 'Queries beyond the ends', stdin: '5\n1 3 3 5 8\n3\n0 100\n9 20\n8 8\n', expectedStdout: '5\n0\n1' },
      { id: 't3', name: 'Empty array', stdin: '0\n\n1\n-5 5\n', expectedStdout: '0', hidden: true },
      { id: 't4', name: 'Full int range', stdin: '4\n-2147483648 -1 0 2147483647\n2\n-2147483648 2147483647\n0 2147483647\n', expectedStdout: '4\n2', hidden: true },
    ],
    staticChecks: [
      { id: 'no-overflowing-mid', description: 'Does not compute the midpoint as (lo + hi) / 2', pattern: '\\(lo \\+ hi\\) / 2', mustMatch: false },
    ],
  },
  {
    id: 'boss-route-planner',
    title: 'Boss: delivery route planner',
    moduleId: 'dsa',
    difficulty: 'advanced',
    kind: 'boss',
    dimension: 'coding',
    concepts: ['Dijkstra with PriorityQueue', 'BFS', 'adjacency lists', 'caching results', 'long distances', 'comparator chains'],
    description: `Module 14 capstone: the routing core of a delivery service.

Input: n m (nodes are \`0\` to \`n-1\`), then m lines \`u v w\` describing an **undirected** road of length w (\`0 <= w <= 10^9\`; parallel roads may exist). Then q, then q commands:

- \`DIST a b\` → the length of the shortest route from a to b, or \`UNREACHABLE\`.
- \`HOPS a b\` → the fewest roads on any route from a to b, ignoring lengths, or \`UNREACHABLE\`.
- \`NEAREST a k\` → up to k other nodes reachable from a, closest first (ties by smaller node id), printed on one line as \`node:distance\` separated by single spaces, or \`NONE\` if no other node is reachable.

Total distances can exceed the int range. Queries often repeat the same source, so avoid recomputing shortest paths from a source you have already processed.`,
    starterCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt(), m = in.nextInt();
        List<List<long[]>> graph = new ArrayList<>();
        for (int i = 0; i < n; i++) graph.add(new ArrayList<>());
        for (int i = 0; i < m; i++) {
            int u = in.nextInt(), v = in.nextInt();
            long w = in.nextLong();
            graph.get(u).add(new long[] {v, w});
            graph.get(v).add(new long[] {u, w});
        }
        int q = in.nextInt();
        for (int i = 0; i < q; i++) {
            String cmd = in.next();
            int a = in.nextInt(), b = in.nextInt();
            // TODO: DIST (Dijkstra), HOPS (BFS), NEAREST (sort reachable nodes)
        }
    }
}`,
    solution: `import java.util.*;

public class Main {
    static final long INF = Long.MAX_VALUE;
    static List<List<long[]>> graph = new ArrayList<>();
    static Map<Integer, long[]> dijkstraCache = new HashMap<>();

    static long[] shortest(int source) {
        return dijkstraCache.computeIfAbsent(source, s -> {
            long[] dist = new long[graph.size()];
            Arrays.fill(dist, INF);
            dist[s] = 0;
            PriorityQueue<long[]> pq = new PriorityQueue<>(Comparator.comparingLong((long[] e) -> e[0]));
            pq.add(new long[] {0, s});
            while (!pq.isEmpty()) {
                long[] top = pq.poll();
                int node = (int) top[1];
                if (top[0] > dist[node]) continue;          // stale entry
                for (long[] edge : graph.get(node)) {
                    int next = (int) edge[0];
                    long candidate = dist[node] + edge[1];
                    if (candidate < dist[next]) {
                        dist[next] = candidate;
                        pq.add(new long[] {candidate, next});
                    }
                }
            }
            return dist;
        });
    }

    static int hops(int from, int to) {
        int[] seen = new int[graph.size()];
        Arrays.fill(seen, -1);
        Deque<Integer> queue = new ArrayDeque<>();
        seen[from] = 0;
        queue.add(from);
        while (!queue.isEmpty()) {
            int node = queue.poll();
            if (node == to) return seen[node];
            for (long[] edge : graph.get(node)) {
                int next = (int) edge[0];
                if (seen[next] == -1) {
                    seen[next] = seen[node] + 1;
                    queue.add(next);
                }
            }
        }
        return -1;
    }

    static String nearest(int source, int k) {
        long[] dist = shortest(source);
        List<Integer> nodes = new ArrayList<>();
        for (int v = 0; v < dist.length; v++) {
            if (v != source && dist[v] != INF) nodes.add(v);
        }
        if (nodes.isEmpty()) return "NONE";
        nodes.sort(Comparator.<Integer>comparingLong(v -> dist[v]).thenComparingInt(v -> v));
        StringJoiner out = new StringJoiner(" ");
        for (int i = 0; i < Math.min(k, nodes.size()); i++) {
            out.add(nodes.get(i) + ":" + dist[nodes.get(i)]);
        }
        return out.toString();
    }

    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt(), m = in.nextInt();
        for (int i = 0; i < n; i++) graph.add(new ArrayList<>());
        for (int i = 0; i < m; i++) {
            int u = in.nextInt(), v = in.nextInt();
            long w = in.nextLong();
            graph.get(u).add(new long[] {v, w});
            graph.get(v).add(new long[] {u, w});
        }
        int q = in.nextInt();
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < q; i++) {
            String cmd = in.next();
            int a = in.nextInt(), b = in.nextInt();
            String answer = switch (cmd) {
                case "DIST" -> {
                    long d = shortest(a)[b];
                    yield d == INF ? "UNREACHABLE" : Long.toString(d);
                }
                case "HOPS" -> {
                    int h = hops(a, b);
                    yield h < 0 ? "UNREACHABLE" : Integer.toString(h);
                }
                case "NEAREST" -> nearest(a, b);
                default -> "UNKNOWN COMMAND";
            };
            out.append(answer).append(System.lineSeparator());
        }
        System.out.print(out);
    }
}`,
    solutionExplanation:
      'DIST uses Dijkstra: a PriorityQueue ordered by tentative distance always expands the closest unsettled node; stale queue entries are skipped instead of decreasing keys, which PriorityQueue does not support. Distances are long because a path of several 10^9 roads overflows int. Results are cached per source with computeIfAbsent, so repeated queries from the same depot cost O(1) lookups plus output. HOPS ignores weights and uses BFS, which is shortest in edge count. NEAREST reuses the cached distances and sorts reachable nodes with a comparator chain (distance, then id); for very large graphs a bounded max-heap of size k would cut that to O(n log k).',
    complexity: {
      time: 'O((n + m) log n) per distinct DIST/NEAREST source, O(n + m) per HOPS query',
      space: 'O(n + m) for the graph plus O(n) per cached source',
      notes: 'Caching trades memory for speed; bound the cache (e.g. LRU) if sources are unbounded.',
    },
    hints: [
      'Build an adjacency list: for each node, a list of {neighbour, weight}. Add each road in both directions.',
      'BFS answers HOPS. For DIST you need a PriorityQueue ordered by distance (Dijkstra).',
      'Java\'s PriorityQueue has no decrease-key: push a new entry and skip outdated ones when polled.',
      'Use long for distances and a sentinel such as Long.MAX_VALUE for "unreachable".',
      'Cache the distance array per source in a HashMap.',
    ],
    tests: [
      {
        id: 't1',
        name: 'Mixed queries',
        stdin: '6 7\n0 1 4\n0 2 1\n2 1 2\n1 3 5\n2 3 8\n3 4 3\n4 0 20\n7\nDIST 0 4\nHOPS 0 4\nDIST 0 5\nHOPS 5 5\nNEAREST 0 3\nNEAREST 5 2\nDIST 3 2\n',
        expectedStdout: '11\n1\nUNREACHABLE\n0\n2:1 1:3 3:8\nNONE\n7',
      },
      {
        id: 't2',
        name: 'Ties and zero-length roads',
        stdin: '4 4\n0 3 2\n0 1 2\n1 2 0\n0 2 5\n4\nNEAREST 0 5\nDIST 2 3\nHOPS 2 3\nDIST 0 0\n',
        expectedStdout: '1:2 2:2 3:2\n4\n2\n0',
      },
      {
        id: 't3',
        name: 'Distances beyond int',
        stdin: '4 3\n0 1 1000000000\n1 2 1000000000\n2 3 1000000000\n3\nDIST 0 3\nHOPS 3 0\nNEAREST 3 1\n',
        expectedStdout: '3000000000\n3\n2:1000000000',
        hidden: true,
      },
      {
        id: 't4',
        name: 'Parallel roads and repeated sources',
        stdin: '3 3\n0 1 10\n0 1 3\n1 2 4\n4\nDIST 0 2\nDIST 0 1\nHOPS 0 2\nNEAREST 1 1\n',
        expectedStdout: '7\n3\n2\n0:3',
        hidden: true,
      },
    ],
  },
];
