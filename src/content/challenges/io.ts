import type { CodingChallenge } from '@/types/curriculum';

export const ioChallenges: CodingChallenge[] = [
  {
    id: 'ch-csv-totals',
    title: 'CSV totals per region',
    moduleId: 'io',
    lessonId: 'io-files',
    difficulty: 'intermediate',
    kind: 'coding',
    dimension: 'coding',
    concepts: ['BufferedReader', 'explicit UTF-8', 'try-with-resources', 'defensive parsing'],
    description: `Read a CSV export from standard input and total the amounts per region.

- The first line is a header (\`region,amount\`) and is skipped.
- Lines that are empty (after trimming) or start with \`#\` are ignored.
- Every other line must have exactly two comma-separated fields: a non-blank region and a whole-number amount (surrounding spaces are allowed and trimmed). Anything else is **malformed** and is counted, not totalled.

Read the input as UTF-8 with a \`BufferedReader\` in try-with-resources, one line at a time.

Output: \`<region> <total>\` for each region in alphabetical order, then \`malformed=<count>\`.`,
    starterCode: `import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        Map<String, Long> totals = new TreeMap<>();
        int malformed = 0;
        try (BufferedReader in = new BufferedReader(new InputStreamReader(System.in, StandardCharsets.UTF_8))) {
            in.readLine();   // skip the header
            String line;
            while ((line = in.readLine()) != null) {
                // TODO: skip blank and comment lines, validate, and add to totals
            }
        }
        totals.forEach((region, total) -> System.out.println(region + " " + total));
        System.out.println("malformed=" + malformed);
    }
}`,
    solution: `import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        Map<String, Long> totals = new TreeMap<>();
        int malformed = 0;
        try (BufferedReader in = new BufferedReader(new InputStreamReader(System.in, StandardCharsets.UTF_8))) {
            in.readLine();   // skip the header
            String line;
            while ((line = in.readLine()) != null) {
                line = line.strip();
                if (line.isEmpty() || line.startsWith("#")) continue;
                String[] fields = line.split(",", -1);
                if (fields.length != 2 || fields[0].isBlank()) {
                    malformed++;
                    continue;
                }
                try {
                    long amount = Long.parseLong(fields[1].strip());
                    totals.merge(fields[0].strip(), amount, Long::sum);
                } catch (NumberFormatException e) {
                    malformed++;
                }
            }
        }
        totals.forEach((region, total) -> System.out.println(region + " " + total));
        System.out.println("malformed=" + malformed);
    }
}`,
    solutionExplanation:
      'Reading line by line keeps memory constant however large the export is, and the explicit UTF-8 InputStreamReader makes the result independent of the platform default charset. split(",", -1) keeps trailing empty fields so "east," is detected as malformed instead of silently becoming one field. Each line is validated before it touches the totals, and a bad number is caught per line so one broken row does not abort the whole import. A TreeMap gives alphabetical output, and merge adds to the running total in one call.',
    complexity: { time: 'O(n log r) for n lines and r regions', space: 'O(r)' },
    hints: [
      'strip() first, then check for empty and comment lines.',
      'split(",", -1) keeps trailing empty strings; plain split(",") drops them.',
      'Catch NumberFormatException around Long.parseLong for a single line, not around the whole loop.',
    ],
    tests: [
      { id: 't1', name: 'Simple export', stdin: 'region,amount\nnorth,100\nsouth,250\nnorth,50\n', expectedStdout: 'north 150\nsouth 250\nmalformed=0' },
      {
        id: 't2',
        name: 'Comments, blanks and bad rows',
        stdin: 'region,amount\n# exported 2026-10-01\neast, 10\n\nwest,abc\neast,5,extra\n,7\n west ,20\neast,\n',
        expectedStdout: 'east 10\nwest 20\nmalformed=4',
      },
      { id: 't3', name: 'Header only', stdin: 'region,amount\n', expectedStdout: 'malformed=0', hidden: true },
      { id: 't4', name: 'Negative amounts', stdin: 'region,amount\nnorth,-30\nzeta,1\nnorth,30\nalpha,2\n', expectedStdout: 'alpha 2\nnorth 0\nzeta 1\nmalformed=0', hidden: true },
    ],
    staticChecks: [
      { id: 's1', description: 'Read line by line with a BufferedReader', pattern: 'BufferedReader', mustMatch: true },
      { id: 's2', description: 'Use an explicit UTF-8 charset', pattern: 'StandardCharsets\\.UTF_8', mustMatch: true },
    ],
  },
  {
    id: 'ch-path-traversal',
    title: 'Fix the path traversal check',
    moduleId: 'io',
    lessonId: 'io-files',
    difficulty: 'intermediate',
    kind: 'debugging',
    dimension: 'debugging',
    concepts: ['Path.resolve', 'normalize', 'Path.startsWith vs String.startsWith', 'path traversal'],
    description: `A static file server maps requested paths into a base directory and must never serve anything outside it. A security review found that it serves files it should reject. Fix the check.

Rules: resolve each request against the base directory exactly as \`Path.resolve\` does (an absolute request replaces the base), normalise the result, and accept it only if it is the base directory itself or inside it.

Input: the absolute base directory, then n, then n requested paths (one per line).

Output per request: \`OK <normalised path>\` or \`REJECTED <request as given>\`.`,
    starterCode: `import java.nio.file.*;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        String base = in.nextLine().trim();
        int n = Integer.parseInt(in.nextLine().trim());
        for (int i = 0; i < n; i++) {
            String request = in.nextLine().trim();
            String resolved = Path.of(base, request).normalize().toString();
            if (resolved.startsWith(base)) {
                System.out.println("OK " + resolved);
            } else {
                System.out.println("REJECTED " + request);
            }
        }
    }
}`,
    solution: `import java.nio.file.*;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        Path base = Path.of(in.nextLine().trim()).normalize();
        int n = Integer.parseInt(in.nextLine().trim());
        for (int i = 0; i < n; i++) {
            String request = in.nextLine().trim();
            Path resolved = base.resolve(request).normalize();
            if (resolved.startsWith(base)) {
                System.out.println("OK " + resolved);
            } else {
                System.out.println("REJECTED " + request);
            }
        }
    }
}`,
    solutionExplanation:
      'There were two bugs. First, String.startsWith compares characters, so "/srv/app-secrets/key.pem" passes a check against "/srv/app"; Path.startsWith compares whole name elements and rejects it. Second, Path.of(base, request) always joins the strings, so an absolute request such as "/etc/shadow" was quietly turned into "/srv/app/etc/shadow" instead of being recognised; base.resolve(request) follows the required semantics and the containment check then rejects it. Normalising before the check is essential, because "docs/../../x" only reveals where it points after the ".." segments are removed. Real servers should also resolve symbolic links (toRealPath) before checking.',
    complexity: { time: 'O(L) per request for a path of length L', space: 'O(L)' },
    hints: [
      'Try the request "../app-secrets/key.pem" against the base "/srv/app".',
      'What is the difference between String.startsWith and Path.startsWith?',
      'What does Path.of("/srv/app", "/etc/shadow") return, compared with Path.of("/srv/app").resolve("/etc/shadow")?',
    ],
    tests: [
      {
        id: 't1',
        name: 'Normal requests and a simple escape',
        stdin: '/srv/app\n3\ndocs/readme.txt\n./img/../img/logo.png\n../../etc/passwd\n',
        expectedStdout: 'OK /srv/app/docs/readme.txt\nOK /srv/app/img/logo.png\nREJECTED ../../etc/passwd',
      },
      {
        id: 't2',
        name: 'Sibling directory with a shared prefix',
        stdin: '/srv/app\n2\n../app-secrets/key.pem\ndocs/../../app/docs/a.txt\n',
        expectedStdout: 'REJECTED ../app-secrets/key.pem\nOK /srv/app/docs/a.txt',
      },
      {
        id: 't3',
        name: 'Absolute requests and the base itself',
        stdin: '/srv/app\n3\n/etc/shadow\n/srv/app/public/index.html\n.\n',
        expectedStdout: 'REJECTED /etc/shadow\nOK /srv/app/public/index.html\nOK /srv/app',
        hidden: true,
      },
    ],
    staticChecks: [
      { id: 's1', description: 'Normalise before checking', pattern: '\\.normalize\\(\\)', mustMatch: true },
      { id: 's2', description: 'Do not compare paths as strings', pattern: 'toString\\(\\)\\s*\\.startsWith', mustMatch: false },
    ],
  },
];
