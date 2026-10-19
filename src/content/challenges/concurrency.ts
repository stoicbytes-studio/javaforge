import type { CodingChallenge } from '@/types/curriculum';

export const concurrencyChallenges: CodingChallenge[] = [
  {
    id: 'ch-parallel-sum',
    title: 'Parallel chunked sum',
    moduleId: 'concurrency',
    lessonId: 'cc-threads',
    difficulty: 'intermediate',
    kind: 'coding',
    dimension: 'coding',
    concepts: ['ExecutorService', 'Callable and Future', 'work splitting', 'deterministic result collection'],
    description: `Sum n integers by splitting them into k contiguous chunks and summing each chunk as a separate task on an \`ExecutorService\`.

Chunk sizes must be as even as possible: every chunk has \`n / k\` elements, and the first \`n % k\` chunks get one extra element.

Input: \`n k\` on the first line (1 <= k <= n), then n integers on the second line.

Output: one line \`chunk <i>: <sum>\` per chunk (i is 1-based, in chunk order), then \`total: <sum>\`. Sums can exceed the int range.`,
    starterCode: `import java.io.*;
import java.util.*;
import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer st = new StringTokenizer(in.readLine());
        int n = Integer.parseInt(st.nextToken()), k = Integer.parseInt(st.nextToken());
        long[] values = new long[n];
        st = new StringTokenizer(in.readLine());
        for (int i = 0; i < n; i++) values[i] = Long.parseLong(st.nextToken());

        // TODO: submit one task per chunk to an ExecutorService,
        //       then print each chunk's sum in order and the total.
        System.out.println("total: 0");
    }
}`,
    solution: `import java.io.*;
import java.util.*;
import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer st = new StringTokenizer(in.readLine());
        int n = Integer.parseInt(st.nextToken()), k = Integer.parseInt(st.nextToken());
        long[] values = new long[n];
        st = new StringTokenizer(in.readLine());
        for (int i = 0; i < n; i++) values[i] = Long.parseLong(st.nextToken());

        List<Future<Long>> parts = new ArrayList<>();
        try (ExecutorService pool = Executors.newFixedThreadPool(Math.min(k, 8))) {
            int start = 0;
            for (int c = 0; c < k; c++) {
                int size = n / k + (c < n % k ? 1 : 0);
                int from = start, to = start + size;
                parts.add(pool.submit(() -> {
                    long sum = 0;
                    for (int i = from; i < to; i++) sum += values[i];
                    return sum;
                }));
                start = to;
            }
        }

        long total = 0;
        for (int c = 0; c < k; c++) {
            long sum = parts.get(c).get();
            System.out.println("chunk " + (c + 1) + ": " + sum);
            total += sum;
        }
        System.out.println("total: " + total);
    }
}`,
    solutionExplanation:
      'Each task reads only its own slice of the array and returns its sum, so no shared mutable state exists and no locking is needed. The array is filled before the tasks are submitted, and submit() creates a happens-before edge, so every task sees the values. Results are read from the futures in chunk order, which keeps the output deterministic no matter which task finishes first. try-with-resources closes the pool. Sums are long to avoid int overflow.',
    complexity: { time: 'O(n) total work, about O(n / k) per task', space: 'O(n) for the input plus O(k) futures' },
    hints: [
      'Compute each chunk\'s [from, to) range on the main thread before submitting.',
      'Lambdas can capture only effectively final locals: copy loop variables into new final locals.',
      'Keep the Futures in a List and call get() on them in order after submitting all tasks.',
    ],
    tests: [
      { id: 't1', name: 'Uneven chunks', stdin: '7 3\n1 2 3 4 5 6 7\n', expectedStdout: 'chunk 1: 6\nchunk 2: 9\nchunk 3: 13\ntotal: 28' },
      { id: 't2', name: 'One element per chunk', stdin: '4 4\n10 -5 7 0\n', expectedStdout: 'chunk 1: 10\nchunk 2: -5\nchunk 3: 7\nchunk 4: 0\ntotal: 12' },
      { id: 't3', name: 'Beyond int range', stdin: '5 2\n1000000000 1000000000 1000000000 1000000000 1000000000\n', expectedStdout: 'chunk 1: 3000000000\nchunk 2: 2000000000\ntotal: 5000000000', hidden: true },
      { id: 't4', name: 'Single chunk', stdin: '1 1\n42\n', expectedStdout: 'chunk 1: 42\ntotal: 42', hidden: true },
    ],
    staticChecks: [
      { id: 's1', description: 'Use an ExecutorService from Executors', pattern: 'Executors\\.new', mustMatch: true },
      { id: 's2', description: 'Submit tasks to the executor', pattern: '\\.(submit|invokeAll)\\(', mustMatch: true },
    ],
  },
  {
    id: 'ch-job-runner',
    title: 'Fix the job runner',
    moduleId: 'concurrency',
    lessonId: 'cc-threads',
    difficulty: 'intermediate',
    kind: 'debugging',
    dimension: 'debugging',
    concepts: ['ExecutionException', 'getCause', 'executor shutdown', 'try-with-resources'],
    description: `A nightly job runner squares a number for each job on a thread pool. Two bugs were reported:

1. One bad job (a value that is not a number, or a missing value) crashes the whole report.
2. Even when every job succeeds, the program prints the report and then **never exits**.

Fix both. A failed job must be reported as \`<name>: FAILED (<ExceptionSimpleName>)\` using the exception the job itself threw.

Input: n, then n lines \`<name> <value>\` (the value may be missing or invalid).

Output: one line per job in input order (\`<name>: <value squared>\` or the FAILED line), then \`ok=<count> failed=<count>\`.`,
    starterCode: `import java.util.*;
import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) throws Exception {
        Scanner in = new Scanner(System.in);
        int n = Integer.parseInt(in.nextLine().trim());
        List<String> names = new ArrayList<>();
        List<Future<Long>> results = new ArrayList<>();
        ExecutorService pool = Executors.newFixedThreadPool(4);
        for (int i = 0; i < n; i++) {
            String[] parts = in.nextLine().trim().split(" ");
            names.add(parts[0]);
            results.add(pool.submit(() -> {
                long v = Long.parseLong(parts[1]);
                return v * v;
            }));
        }

        int ok = 0, failed = 0;
        for (int i = 0; i < n; i++) {
            System.out.println(names.get(i) + ": " + results.get(i).get());
            ok++;
        }
        System.out.println("ok=" + ok + " failed=" + failed);
    }
}`,
    solution: `import java.util.*;
import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) throws Exception {
        Scanner in = new Scanner(System.in);
        int n = Integer.parseInt(in.nextLine().trim());
        List<String> names = new ArrayList<>();
        List<Future<Long>> results = new ArrayList<>();
        try (ExecutorService pool = Executors.newFixedThreadPool(4)) {
            for (int i = 0; i < n; i++) {
                String[] parts = in.nextLine().trim().split(" ");
                names.add(parts[0]);
                results.add(pool.submit(() -> {
                    long v = Long.parseLong(parts[1]);
                    return v * v;
                }));
            }

            int ok = 0, failed = 0;
            for (int i = 0; i < n; i++) {
                try {
                    System.out.println(names.get(i) + ": " + results.get(i).get());
                    ok++;
                } catch (ExecutionException e) {
                    System.out.println(names.get(i) + ": FAILED (" + e.getCause().getClass().getSimpleName() + ")");
                    failed++;
                }
            }
            System.out.println("ok=" + ok + " failed=" + failed);
        }
    }
}`,
    solutionExplanation:
      'A task that throws does not crash its worker thread: the exception is stored in the Future, and get() rethrows it wrapped in an ExecutionException. Catching ExecutionException per job and reporting getCause() keeps the rest of the report going. The hang came from the pool: its worker threads are non-daemon and wait for new tasks forever, so the JVM could not exit. try-with-resources (Java 19+) calls close(), which shuts the pool down after the submitted tasks finish. On older versions use shutdown() in a finally block.',
    complexity: { time: 'O(n)', space: 'O(n)' },
    hints: [
      'What exception does Future.get() throw when the task itself threw?',
      'The original exception is available through getCause().',
      'Take a thread dump of the hanging program: what are the pool-1-thread-N threads doing?',
      'ExecutorService is AutoCloseable since Java 19.',
    ],
    tests: [
      { id: 't1', name: 'All jobs succeed', stdin: '3\na 2\nb 3\nc -4\n', expectedStdout: 'a: 4\nb: 9\nc: 16\nok=3 failed=0' },
      { id: 't2', name: 'One invalid value', stdin: '3\nimport 5\nparse abc\nexport 7\n', expectedStdout: 'import: 25\nparse: FAILED (NumberFormatException)\nexport: 49\nok=2 failed=1' },
      { id: 't3', name: 'Missing value', stdin: '2\nreport\nbackup 10\n', expectedStdout: 'report: FAILED (ArrayIndexOutOfBoundsException)\nbackup: 100\nok=1 failed=1', hidden: true },
    ],
    staticChecks: [
      { id: 's1', description: 'Handle ExecutionException', pattern: 'catch\\s*\\(\\s*ExecutionException', mustMatch: true },
      { id: 's2', description: 'Shut the executor down (try-with-resources or shutdown)', pattern: 'try\\s*\\(\\s*(ExecutorService|var)\\b|\\.shutdown(Now)?\\(|\\.close\\(', mustMatch: true },
    ],
  },
  {
    id: 'boss-concurrent-ledger',
    title: 'Boss: concurrent ledger',
    moduleId: 'concurrency',
    lessonId: 'cc-synchronization',
    difficulty: 'advanced',
    kind: 'boss',
    dimension: 'coding',
    concepts: ['per-object locks', 'lock ordering', 'deadlock avoidance', 'atomic counters', 'executors'],
    description: `Build a ledger that applies money transfers **concurrently** with w worker threads — without losing updates and without deadlocking.

Input:
- n, then n lines \`<accountId> <balance>\`
- \`w m\`, then m lines \`<from> <to> <amount> <count>\`: perform this transfer \`count\` times

Rules:
- An attempt is **rejected** if either account does not exist, \`from\` equals \`to\`, or the amount is not positive. Every rejected attempt counts (a line with count 3 that is invalid adds 3 rejections).
- Otherwise it is **applied**: subtract from \`from\`, add to \`to\`. Overdrafts are allowed, so the final state does not depend on the order of transfers.
- Worker j (0-based) processes the transfer lines with index i where \`i % w == j\`. Different workers run at the same time, so two workers may move money between the same accounts in opposite directions.

Output: every account as \`<id> <balance>\` sorted by id, then \`applied=<a> rejected=<r>\`, then \`total=<sum of balances>\` (which must equal the initial total).

A solution with one global lock would pass, but aim for one lock per account, acquired in a consistent order.`,
    starterCode: `import java.io.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.ReentrantLock;

public class Main {
    static final class Account {
        final String id;
        long balance;
        final ReentrantLock lock = new ReentrantLock();
        Account(String id, long balance) { this.id = id; this.balance = balance; }
    }

    record Transfer(String from, String to, long amount, int count) {}

    static final Map<String, Account> accounts = new TreeMap<>();
    static final AtomicInteger applied = new AtomicInteger();
    static final AtomicInteger rejected = new AtomicInteger();

    static void transfer(Transfer t) {
        // TODO: validate, then lock both accounts in a consistent order and move the money
    }

    public static void main(String[] args) throws Exception {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(in.readLine().trim());
        for (int i = 0; i < n; i++) {
            String[] p = in.readLine().trim().split(" ");
            accounts.put(p[0], new Account(p[0], Long.parseLong(p[1])));
        }
        String[] wm = in.readLine().trim().split(" ");
        int w = Integer.parseInt(wm[0]), m = Integer.parseInt(wm[1]);
        List<Transfer> transfers = new ArrayList<>();
        for (int i = 0; i < m; i++) {
            String[] p = in.readLine().trim().split(" ");
            transfers.add(new Transfer(p[0], p[1], Long.parseLong(p[2]), Integer.parseInt(p[3])));
        }

        // TODO: run w workers concurrently; worker j handles lines i with i % w == j

        long total = 0;
        for (Account a : accounts.values()) {
            System.out.println(a.id + " " + a.balance);
            total += a.balance;
        }
        System.out.println("applied=" + applied.get() + " rejected=" + rejected.get());
        System.out.println("total=" + total);
    }
}`,
    solution: `import java.io.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.ReentrantLock;

public class Main {
    static final class Account {
        final String id;
        long balance;
        final ReentrantLock lock = new ReentrantLock();
        Account(String id, long balance) { this.id = id; this.balance = balance; }
    }

    record Transfer(String from, String to, long amount, int count) {}

    static final Map<String, Account> accounts = new TreeMap<>();
    static final AtomicInteger applied = new AtomicInteger();
    static final AtomicInteger rejected = new AtomicInteger();

    static void transfer(Transfer t) {
        Account from = accounts.get(t.from()), to = accounts.get(t.to());
        if (from == null || to == null || from == to || t.amount() <= 0) {
            rejected.incrementAndGet();
            return;
        }
        // Global order by id: every thread locks the pair in the same order, so no cycle can form.
        Account first = from.id.compareTo(to.id) < 0 ? from : to;
        Account second = first == from ? to : from;
        first.lock.lock();
        try {
            second.lock.lock();
            try {
                from.balance -= t.amount();
                to.balance += t.amount();
            } finally {
                second.lock.unlock();
            }
        } finally {
            first.lock.unlock();
        }
        applied.incrementAndGet();
    }

    public static void main(String[] args) throws Exception {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(in.readLine().trim());
        for (int i = 0; i < n; i++) {
            String[] p = in.readLine().trim().split(" ");
            accounts.put(p[0], new Account(p[0], Long.parseLong(p[1])));
        }
        String[] wm = in.readLine().trim().split(" ");
        int w = Integer.parseInt(wm[0]), m = Integer.parseInt(wm[1]);
        List<Transfer> transfers = new ArrayList<>();
        for (int i = 0; i < m; i++) {
            String[] p = in.readLine().trim().split(" ");
            transfers.add(new Transfer(p[0], p[1], Long.parseLong(p[2]), Integer.parseInt(p[3])));
        }

        try (ExecutorService pool = Executors.newFixedThreadPool(w)) {
            for (int j = 0; j < w; j++) {
                int worker = j;
                pool.submit(() -> {
                    for (int i = worker; i < transfers.size(); i += w) {
                        Transfer t = transfers.get(i);
                        for (int r = 0; r < t.count(); r++) transfer(t);
                    }
                });
            }
        } // close() waits for every worker, and makes their writes visible here

        long total = 0;
        for (Account a : accounts.values()) {
            System.out.println(a.id + " " + a.balance);
            total += a.balance;
        }
        System.out.println("applied=" + applied.get() + " rejected=" + rejected.get());
        System.out.println("total=" + total);
    }
}`,
    solutionExplanation:
      'Each balance is guarded by its own account lock, and a transfer holds both locks while it changes both balances, so the invariant "money is conserved" holds at every unlock. Locking by direction (from, then to) would deadlock as soon as two workers move money between the same pair in opposite directions; ordering by account id makes every thread acquire the pair in the same order, so no wait cycle can exist. Counters shared by all workers are AtomicIntegers. The account map is filled before the workers start and only read afterwards, which is safe because submit() and close() create happens-before edges. Validation needs no lock because account existence never changes during processing.',
    complexity: { time: 'O(total attempts) work, spread across w threads', space: 'O(n + m)', notes: 'Contention on hot accounts limits real parallelism; per-account locks still let transfers between unrelated accounts proceed in parallel.' },
    hints: [
      'Which data is shared between workers, and which lock guards each piece?',
      'A transfer must hold both account locks while it changes both balances.',
      'If thread 1 locks A then B and thread 2 locks B then A, what can happen?',
      'Pick the lock order from something both threads agree on, such as the account id.',
      'The applied and rejected counters are also shared state.',
    ],
    tests: [
      {
        id: 't1',
        name: 'Basic transfers and an unknown account',
        stdin: '3\nalice 100\nbob 50\ncarol 0\n2 4\nalice bob 30 1\nbob carol 20 2\ncarol alice 5 1\nalice dave 10 1\n',
        expectedStdout: 'alice 75\nbob 40\ncarol 35\napplied=4 rejected=1\ntotal=150',
      },
      {
        id: 't2',
        name: 'Validation rules',
        stdin: '2\nx 10\ny 10\n1 4\nx x 5 1\nx y 0 3\ny x -2 1\ny x 4 2\n',
        expectedStdout: 'x 18\ny 2\napplied=2 rejected=5\ntotal=20',
      },
      {
        id: 't3',
        name: 'Opposite directions under contention',
        stdin: '3\na 1000\nb 1000\nc 1000\n8 6\na b 1 50000\nb a 1 50000\nb c 2 30000\nc b 2 30000\nc a 3 20000\na c 3 10000\n',
        expectedStdout: 'a 31000\nb 1000\nc -29000\napplied=190000 rejected=0\ntotal=3000',
        hidden: true,
      },
    ],
    staticChecks: [
      { id: 's1', description: 'Process transfers on multiple threads', pattern: 'Executors\\.new|new Thread\\(|Thread\\.of(Platform|Virtual)', mustMatch: true },
      { id: 's2', description: 'Guard balances with locks', pattern: 'ReentrantLock|synchronized', mustMatch: true },
    ],
  },
];
