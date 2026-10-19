import type { CodingChallenge } from '@/types/curriculum';

export const productionChallenges: CodingChallenge[] = [
  {
    id: 'ch-token-bucket',
    title: 'Token-bucket rate limiter',
    moduleId: 'production',
    lessonId: 'prod-resilience',
    difficulty: 'intermediate',
    kind: 'coding',
    dimension: 'coding',
    concepts: ['token bucket', 'rate limiting', 'integer arithmetic for fractional tokens', 'per-client state'],
    description: `Implement a per-client **token-bucket** rate limiter driven by request timestamps.

Input: the first line is \`capacity refillPerSecond n\`. Then n lines \`timestampMs clientId\`, with timestamps in non-decreasing order.

Rules:
- Each client has its own bucket, created **full** (capacity tokens) at the time of that client's first request.
- Before handling a request, refill the bucket: it gains \`refillPerSecond\` tokens per second of elapsed time since that client's previous request, **fractions included**, but never more than capacity.
- If the bucket holds at least 1 whole token, spend 1 and print \`ALLOW <clientId>\`.
- Otherwise print \`DENY <clientId> retry-after=<ms>\`, where ms is the smallest whole number of milliseconds after which the bucket would hold 1 token.
- After all requests print \`allowed=<a> denied=<d>\`.

Tip: avoid floating point by counting **milli-tokens** (1 token = 1000 milli-tokens): every elapsed millisecond adds refillPerSecond milli-tokens.`,
    starterCode: `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer first = new StringTokenizer(in.readLine());
        long capacity = Long.parseLong(first.nextToken());
        long refillPerSecond = Long.parseLong(first.nextToken());
        int n = Integer.parseInt(first.nextToken());
        int allowed = 0;
        for (int i = 0; i < n; i++) {
            StringTokenizer st = new StringTokenizer(in.readLine());
            long timestampMs = Long.parseLong(st.nextToken());
            String client = st.nextToken();
            // TODO: keep a bucket per client and refill it before deciding
            allowed++;
            System.out.println("ALLOW " + client);
        }
        System.out.println("allowed=" + allowed + " denied=0");
    }
}`,
    solution: `import java.io.*;
import java.util.*;

public class Main {
    static final class Bucket {
        long milliTokens;
        long lastMs;

        Bucket(long milliTokens, long lastMs) {
            this.milliTokens = milliTokens;
            this.lastMs = lastMs;
        }
    }

    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer first = new StringTokenizer(in.readLine());
        long capacity = Long.parseLong(first.nextToken());
        long refillPerSecond = Long.parseLong(first.nextToken());
        int n = Integer.parseInt(first.nextToken());
        long maxMilli = capacity * 1000;

        Map<String, Bucket> buckets = new HashMap<>();
        StringBuilder out = new StringBuilder();
        int allowed = 0;
        int denied = 0;
        for (int i = 0; i < n; i++) {
            StringTokenizer st = new StringTokenizer(in.readLine());
            long now = Long.parseLong(st.nextToken());
            String client = st.nextToken();

            Bucket b = buckets.computeIfAbsent(client, c -> new Bucket(maxMilli, now));
            b.milliTokens = Math.min(maxMilli, b.milliTokens + (now - b.lastMs) * refillPerSecond);
            b.lastMs = now;

            if (b.milliTokens >= 1000) {
                b.milliTokens -= 1000;
                allowed++;
                out.append("ALLOW ").append(client).append('\\n');
            } else {
                long missing = 1000 - b.milliTokens;
                long waitMs = (missing + refillPerSecond - 1) / refillPerSecond;   // ceiling division
                denied++;
                out.append("DENY ").append(client).append(" retry-after=").append(waitMs).append('\\n');
            }
        }
        out.append("allowed=").append(allowed).append(" denied=").append(denied);
        System.out.println(out);
    }
}`,
    solutionExplanation:
      'Each client gets a Bucket holding milli-tokens and the time it was last refilled. Refilling lazily on each request (elapsed ms x refill rate, capped at capacity) means no background timer is needed — the same approach Guava and Bucket4j use. Milli-tokens keep fractional refills exact with integer arithmetic; retry-after is the missing milli-tokens divided by the per-millisecond refill, rounded up. The capacity bounds bursts, the refill rate bounds the sustained rate.',
    complexity: { time: 'O(n) expected', space: 'O(c) for c distinct clients' },
    hints: [
      'Store per client: tokens available and the timestamp of the last refill.',
      'Refill = elapsedMs x refillPerSecond milli-tokens, capped at capacity x 1000.',
      'retry-after: how many milliseconds until the missing milli-tokens have been refilled? Round up.',
    ],
    tests: [
      {
        id: 't1',
        name: 'Burst then refill',
        stdin: '2 1 5\n0 a\n100 a\n200 a\n1200 a\n1200 b\n',
        expectedStdout: 'ALLOW a\nALLOW a\nDENY a retry-after=800\nALLOW a\nALLOW b\nallowed=4 denied=1',
      },
      {
        id: 't2',
        name: 'Fractional refill and rounding',
        stdin: '1 3 4\n0 x\n100 x\n333 x\n334 x\n',
        expectedStdout: 'ALLOW x\nDENY x retry-after=234\nDENY x retry-after=1\nALLOW x\nallowed=2 denied=2',
      },
      {
        id: 't3',
        name: 'Idle time never exceeds capacity',
        stdin: '3 10 6\n0 api\n60000 api\n60000 api\n60000 api\n60000 api\n60050 api\n',
        expectedStdout: 'ALLOW api\nALLOW api\nALLOW api\nALLOW api\nDENY api retry-after=100\nDENY api retry-after=50\nallowed=4 denied=2',
      },
      {
        id: 't4',
        name: 'Independent clients',
        stdin: '1 2 6\n0 a\n0 b\n10 a\n10 b\n510 a\n600 c\n',
        expectedStdout: 'ALLOW a\nALLOW b\nDENY a retry-after=490\nDENY b retry-after=490\nALLOW a\nALLOW c\nallowed=4 denied=2',
        hidden: true,
      },
    ],
  },
  {
    id: 'ch-circuit-breaker-log',
    title: 'Fix the circuit breaker',
    moduleId: 'production',
    lessonId: 'prod-resilience',
    difficulty: 'intermediate',
    kind: 'debugging',
    dimension: 'debugging',
    concepts: ['circuit breaker', 'state machine', 'half-open trial', 'off-by-one in time comparisons'],
    description: `The circuit breaker in the starter code replays a log of calls, but on-call engineers say it opens too eagerly and sometimes never recovers. Find and fix the bugs so it follows this specification.

Input: the first line is \`threshold openMs n\`, then n lines \`timestampMs SUCCESS|FAILURE\` (what the dependency would return if called), timestamps non-decreasing.

States and rules:
- **CLOSED**: the call goes through. FAILURE increments the consecutive-failure count; when it reaches threshold the breaker becomes OPEN at that timestamp. SUCCESS resets the count to 0.
- **OPEN**: if at least openMs have passed since it opened (\`now - openedAt >= openMs\`), it becomes HALF_OPEN and this call is a trial (next rule). Otherwise the call is rejected and its outcome ignored.
- **HALF_OPEN** trial: SUCCESS closes the breaker and resets the count; FAILURE reopens it at this timestamp.

For each call print \`<timestamp> <OK|FAIL|REJECTED> <stateAfter>\`. Finally print \`transitions=<k>\`, counting every change of state (including OPEN to HALF_OPEN).`,
    starterCode: `import java.io.*;
import java.util.*;

public class Main {
    enum State { CLOSED, OPEN, HALF_OPEN }

    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer first = new StringTokenizer(in.readLine());
        int threshold = Integer.parseInt(first.nextToken());
        long openMs = Long.parseLong(first.nextToken());
        int n = Integer.parseInt(first.nextToken());

        State state = State.CLOSED;
        int failures = 0;
        long openedAt = 0;
        int transitions = 0;
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < n; i++) {
            StringTokenizer st = new StringTokenizer(in.readLine());
            long now = Long.parseLong(st.nextToken());
            boolean success = st.nextToken().equals("SUCCESS");

            if (state == State.OPEN && now - openedAt > openMs) {
                state = State.HALF_OPEN;
                transitions++;
            }
            String result;
            if (state == State.OPEN) {
                result = "REJECTED";
            } else if (success) {
                result = "OK";
                if (state == State.HALF_OPEN) {
                    state = State.CLOSED;
                    transitions++;
                }
            } else {
                result = "FAIL";
                failures++;
                if (failures >= threshold) {
                    state = State.OPEN;
                    openedAt = now;
                    transitions++;
                }
            }
            out.append(now).append(' ').append(result).append(' ').append(state).append('\\n');
        }
        out.append("transitions=").append(transitions);
        System.out.println(out);
    }
}`,
    solution: `import java.io.*;
import java.util.*;

public class Main {
    enum State { CLOSED, OPEN, HALF_OPEN }

    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer first = new StringTokenizer(in.readLine());
        int threshold = Integer.parseInt(first.nextToken());
        long openMs = Long.parseLong(first.nextToken());
        int n = Integer.parseInt(first.nextToken());

        State state = State.CLOSED;
        int failures = 0;
        long openedAt = 0;
        int transitions = 0;
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < n; i++) {
            StringTokenizer st = new StringTokenizer(in.readLine());
            long now = Long.parseLong(st.nextToken());
            boolean success = st.nextToken().equals("SUCCESS");

            if (state == State.OPEN && now - openedAt >= openMs) {      // fix 1: >= not >
                state = State.HALF_OPEN;
                transitions++;
            }
            String result;
            if (state == State.OPEN) {
                result = "REJECTED";
            } else if (success) {
                result = "OK";
                failures = 0;                                           // fix 2: success resets the count
                if (state == State.HALF_OPEN) {
                    state = State.CLOSED;
                    transitions++;
                }
            } else {
                result = "FAIL";
                failures++;
                if (state == State.HALF_OPEN || failures >= threshold) { // fix 3: a failed trial reopens
                    state = State.OPEN;
                    openedAt = now;
                    transitions++;
                }
            }
            out.append(now).append(' ').append(result).append(' ').append(state).append('\\n');
        }
        out.append("transitions=").append(transitions);
        System.out.println(out);
    }
}`,
    solutionExplanation:
      'Three bugs: (1) the cool-down check used > instead of >=, so a call exactly openMs later was rejected; (2) SUCCESS never reset the consecutive-failure count, so scattered failures over hours eventually opened the breaker — it counted total failures, not consecutive ones; (3) a failed HALF_OPEN trial only reopened the breaker if the stale count happened to reach the threshold, which after fix 2 would leave it stuck in HALF_OPEN letting every call through to a broken dependency. A failed trial must reopen immediately and restart the cool-down.',
    complexity: { time: 'O(n)', space: 'O(1) besides the output' },
    hints: [
      'Read the spec for each state and compare it line by line with the code.',
      'What should a SUCCESS do to the failure count while CLOSED?',
      'Exactly openMs after opening, should the breaker allow a trial?',
      'In HALF_OPEN, one failure is enough to reopen.',
    ],
    tests: [
      {
        id: 't1',
        name: 'Open, reject, recover',
        stdin: '3 1000 7\n0 FAILURE\n10 FAILURE\n20 FAILURE\n500 SUCCESS\n1020 SUCCESS\n1030 FAILURE\n1040 SUCCESS\n',
        expectedStdout: '0 FAIL CLOSED\n10 FAIL CLOSED\n20 FAIL OPEN\n500 REJECTED OPEN\n1020 OK CLOSED\n1030 FAIL CLOSED\n1040 OK CLOSED\ntransitions=3',
      },
      {
        id: 't2',
        name: 'Scattered failures do not open it',
        stdin: '2 500 6\n0 FAILURE\n100 SUCCESS\n200 FAILURE\n300 SUCCESS\n400 FAILURE\n500 FAILURE\n',
        expectedStdout: '0 FAIL CLOSED\n100 OK CLOSED\n200 FAIL CLOSED\n300 OK CLOSED\n400 FAIL CLOSED\n500 FAIL OPEN\ntransitions=1',
      },
      {
        id: 't3',
        name: 'Failed trial reopens',
        stdin: '2 1000 7\n0 FAILURE\n1 FAILURE\n1001 FAILURE\n1500 SUCCESS\n2001 FAILURE\n3001 SUCCESS\n3002 FAILURE\n',
        expectedStdout: '0 FAIL CLOSED\n1 FAIL OPEN\n1001 FAIL OPEN\n1500 REJECTED OPEN\n2001 FAIL OPEN\n3001 OK CLOSED\n3002 FAIL CLOSED\ntransitions=7',
        hidden: true,
      },
    ],
  },
  {
    id: 'boss-latency-report',
    title: 'Boss: latency and SLO report',
    moduleId: 'performance',
    difficulty: 'advanced',
    kind: 'boss',
    dimension: 'coding',
    concepts: ['nearest-rank percentiles', 'grouping with TreeMap', 'error rates', 'SLO evaluation', 'formatting with Locale.ROOT'],
    description: `Module 16 capstone: turn a raw access log into the report an on-call engineer actually needs.

Input: the first line is \`n sloP99Ms\`. Then n lines \`<endpoint> <status> <latencyMs>\`, separated by single spaces (endpoints contain no spaces).

For each endpoint, in **alphabetical order**, print:

\`<endpoint> count=<c> errors=<e> (<rate>%) p50=<v> p95=<v> p99=<v> max=<v> <OK|BREACH>\`

- errors are responses with status >= 500; rate = 100 x errors / count with **one decimal** (use \`Locale.ROOT\`).
- Percentiles use the **nearest-rank** method over that endpoint's latencies (errors included): sort ascending, rank = ceil(p x c / 100), value = sorted[rank - 1].
- The endpoint is in **BREACH** if its p99 > sloP99Ms **or** its error rate is above 1% (errors x 100 > count); otherwise OK.

Then print \`overall count=<n> errors=<e> p99=<v>\` over all requests, and finally \`worst=<endpoint>\`: the endpoint with the highest p99 (ties: alphabetically first).`,
    starterCode: `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer first = new StringTokenizer(in.readLine());
        int n = Integer.parseInt(first.nextToken());
        long slo = Long.parseLong(first.nextToken());
        for (int i = 0; i < n; i++) {
            String[] parts = in.readLine().trim().split(" ");
            // TODO: group latencies and errors by endpoint
        }
        // TODO: print one line per endpoint, then the overall and worst lines
    }
}`,
    solution: `import java.io.*;
import java.util.*;

public class Main {
    static long percentile(long[] sorted, int p) {
        int rank = (int) ((p * (long) sorted.length + 99) / 100);   // ceil(p * c / 100)
        return sorted[Math.max(rank, 1) - 1];
    }

    static long[] sortedCopy(List<Long> values) {
        long[] a = new long[values.size()];
        for (int i = 0; i < a.length; i++) a[i] = values.get(i);
        Arrays.sort(a);
        return a;
    }

    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer first = new StringTokenizer(in.readLine());
        int n = Integer.parseInt(first.nextToken());
        long slo = Long.parseLong(first.nextToken());

        Map<String, List<Long>> latencies = new TreeMap<>();
        Map<String, Integer> errors = new HashMap<>();
        List<Long> all = new ArrayList<>(n);
        int totalErrors = 0;
        for (int i = 0; i < n; i++) {
            String[] parts = in.readLine().trim().split(" ");
            String endpoint = parts[0];
            int status = Integer.parseInt(parts[1]);
            long ms = Long.parseLong(parts[2]);
            latencies.computeIfAbsent(endpoint, k -> new ArrayList<>()).add(ms);
            all.add(ms);
            if (status >= 500) {
                errors.merge(endpoint, 1, Integer::sum);
                totalErrors++;
            }
        }

        StringBuilder out = new StringBuilder();
        String worst = null;
        long worstP99 = -1;
        for (Map.Entry<String, List<Long>> e : latencies.entrySet()) {
            long[] sorted = sortedCopy(e.getValue());
            int count = sorted.length;
            int err = errors.getOrDefault(e.getKey(), 0);
            long p99 = percentile(sorted, 99);
            boolean breach = p99 > slo || err * 100L > count;
            out.append(String.format(Locale.ROOT, "%s count=%d errors=%d (%.1f%%) p50=%d p95=%d p99=%d max=%d %s%n",
                e.getKey(), count, err, 100.0 * err / count,
                percentile(sorted, 50), percentile(sorted, 95), p99, sorted[count - 1],
                breach ? "BREACH" : "OK"));
            if (p99 > worstP99) {            // strict: ties keep the alphabetically first
                worstP99 = p99;
                worst = e.getKey();
            }
        }
        out.append("overall count=").append(n).append(" errors=").append(totalErrors)
            .append(" p99=").append(percentile(sortedCopy(all), 99)).append('\\n');
        out.append("worst=").append(worst);
        System.out.println(out);
    }
}`,
    solutionExplanation:
      'A TreeMap groups latencies by endpoint and iterates in alphabetical order for free. Nearest-rank percentiles need the values sorted, and the integer expression (p x c + 99) / 100 computes ceil(p x c / 100) without floating-point error. The overall p99 is computed from all raw samples — not by averaging the per-endpoint p99s, which would be meaningless. Because entries are visited alphabetically, updating the worst endpoint only on a strictly larger p99 resolves ties correctly. In production you would record into histograms (HdrHistogram, Micrometer) instead of keeping every sample.',
    complexity: { time: 'O(n log n)', space: 'O(n)' },
    hints: [
      'Group latencies per endpoint in a TreeMap<String, List<Long>> and count errors separately.',
      'Nearest rank: rank = (p * count + 99) / 100 with integer arithmetic; the value is sorted[rank - 1].',
      'Format the error rate with String.format(Locale.ROOT, "%.1f%%", ...).',
      'The overall p99 must come from all samples, not from the per-endpoint p99 values.',
    ],
    tests: [
      {
        id: 't1',
        name: 'Two endpoints',
        stdin: '6 200\n/orders 200 50\n/orders 200 70\n/orders 503 900\n/health 200 2\n/health 200 3\n/orders 200 60\n',
        expectedStdout: '/health count=2 errors=0 (0.0%) p50=2 p95=3 p99=3 max=3 OK\n/orders count=4 errors=1 (25.0%) p50=60 p95=900 p99=900 max=900 BREACH\noverall count=6 errors=1 p99=900\nworst=/orders',
      },
      {
        id: 't2',
        name: 'Tail hidden by a good median',
        stdin: '10 100\n/search 200 10\n/search 200 11\n/search 200 12\n/search 200 13\n/search 200 14\n/search 200 15\n/search 200 16\n/search 200 17\n/search 200 18\n/search 200 250\n',
        expectedStdout: '/search count=10 errors=0 (0.0%) p50=14 p95=250 p99=250 max=250 BREACH\noverall count=10 errors=0 p99=250\nworst=/search',
      },
      {
        id: 't3',
        name: 'Ties and error-rate threshold',
        stdin: '8 500\n/b 200 40\n/b 200 40\n/a 200 40\n/a 500 40\n/c 200 30\n/c 200 30\n/c 200 30\n/c 200 30\n',
        expectedStdout: '/a count=2 errors=1 (50.0%) p50=40 p95=40 p99=40 max=40 BREACH\n/b count=2 errors=0 (0.0%) p50=40 p95=40 p99=40 max=40 OK\n/c count=4 errors=0 (0.0%) p50=30 p95=30 p99=30 max=30 OK\noverall count=8 errors=1 p99=40\nworst=/a',
        hidden: true,
      },
    ],
  },
];
