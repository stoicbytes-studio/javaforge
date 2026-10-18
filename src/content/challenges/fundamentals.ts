import type { CodingChallenge } from '@/types/curriculum';

export const fundamentalsChallenges: CodingChallenge[] = [
  {
    id: 'ch-greeting',
    title: 'Greeting card',
    moduleId: 'fundamentals',
    lessonId: 'f-first-program',
    difficulty: 'beginner',
    kind: 'coding',
    dimension: 'coding',
    concepts: ['main method', 'standard output', 'string concatenation'],
    description: `Read a **name** (line 1) and an **age** (line 2) from standard input and print exactly two lines:

\`\`\`
Hello, <name>!
Next year you will be <age + 1>.
\`\`\`

The input-reading code is already written for you. Focus on producing the output.`,
    starterCode: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        String name = in.nextLine().trim();
        int age = Integer.parseInt(in.nextLine().trim());

        // TODO: print the two lines described in the task
        System.out.println("TODO");
    }
}`,
    solution: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        String name = in.nextLine().trim();
        int age = Integer.parseInt(in.nextLine().trim());

        System.out.println("Hello, " + name + "!");
        System.out.println("Next year you will be " + (age + 1) + ".");
    }
}`,
    solutionExplanation:
      'The parentheses around `age + 1` matter: without them, "... be " + age + 1 would concatenate "1" after the age instead of adding.',
    complexity: { time: 'O(1)', space: 'O(1)' },
    hints: [
      'Use System.out.println twice.',
      'Remember that + after a String concatenates. How do you force numeric addition first?',
      'Wrap the arithmetic in parentheses: (age + 1).',
    ],
    tests: [
      { id: 't1', name: 'Typical input', stdin: 'Ada\n36\n', expectedStdout: 'Hello, Ada!\nNext year you will be 37.' },
      { id: 't2', name: 'Name with spaces', stdin: 'Grace Hopper\n85\n', expectedStdout: 'Hello, Grace Hopper!\nNext year you will be 86.' },
      { id: 't3', name: 'Age zero', stdin: 'Baby\n0\n', expectedStdout: 'Hello, Baby!\nNext year you will be 1.', hidden: true },
    ],
  },
  {
    id: 'ch-ttl-millis',
    title: 'Fix the cache TTL overflow',
    moduleId: 'fundamentals',
    lessonId: 'f-types-operators',
    difficulty: 'beginner',
    kind: 'debugging',
    dimension: 'debugging',
    concepts: ['integer overflow', 'long arithmetic', 'numeric promotion'],
    description: `This program converts a number of **days** into milliseconds for a cache time-to-live. It works for small values but production reports negative TTLs for long retention periods.

Find and fix the bug. Input: one integer (days, 0–10000). Output: the number of milliseconds.`,
    starterCode: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int days = in.nextInt();
        long millis = days * 24 * 60 * 60 * 1000;
        System.out.println(millis);
    }
}`,
    solution: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int days = in.nextInt();
        long millis = days * 24L * 60 * 60 * 1000;
        System.out.println(millis);
    }
}`,
    solutionExplanation:
      'The multiplication was done in int and overflowed before being widened to long. Making one early operand a long literal (24L) forces long arithmetic for the whole expression. `java.time.Duration.ofDays(days).toMillis()` is an even clearer production fix.',
    complexity: { time: 'O(1)', space: 'O(1)' },
    hints: [
      'Try 30 days by hand: what is 30 × 86,400,000, and what is Integer.MAX_VALUE?',
      'The type of the right-hand side is decided by its operands, not by the long variable.',
      'Make one of the first operands a long.',
    ],
    tests: [
      { id: 't1', name: 'One day', stdin: '1\n', expectedStdout: '86400000' },
      { id: 't2', name: 'One week', stdin: '7\n', expectedStdout: '604800000' },
      { id: 't3', name: 'Thirty days', stdin: '30\n', expectedStdout: '2592000000' },
      { id: 't4', name: 'One year', stdin: '365\n', expectedStdout: '31536000000', hidden: true },
    ],
  },
  {
    id: 'ch-fizzbuzz',
    title: 'FizzBuzz',
    moduleId: 'fundamentals',
    lessonId: 'f-control-flow',
    difficulty: 'beginner',
    kind: 'coding',
    dimension: 'coding',
    concepts: ['loops', 'modulo', 'condition ordering'],
    description: `Read an integer **n** and print the numbers from 1 to n, one per line, except:

- multiples of 3 print \`Fizz\`
- multiples of 5 print \`Buzz\`
- multiples of both print \`FizzBuzz\``,
    starterCode: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        int n = new Scanner(System.in).nextInt();
        for (int i = 1; i <= n; i++) {
            // TODO
            System.out.println(i);
        }
    }
}`,
    solution: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        int n = new Scanner(System.in).nextInt();
        StringBuilder out = new StringBuilder();
        for (int i = 1; i <= n; i++) {
            if (i % 15 == 0) out.append("FizzBuzz");
            else if (i % 3 == 0) out.append("Fizz");
            else if (i % 5 == 0) out.append("Buzz");
            else out.append(i);
            out.append('\\n');
        }
        System.out.print(out);
    }
}`,
    solutionExplanation:
      'Check the most specific condition (divisible by 15) first; otherwise multiples of 15 would print "Fizz". Collecting output in a StringBuilder avoids thousands of separate println calls for large n.',
    complexity: { time: 'O(n)', space: 'O(n) for the buffered output' },
    hints: ['Which condition must be checked first?', 'A number divisible by both 3 and 5 is divisible by 15.'],
    tests: [
      { id: 't1', name: 'n = 5', stdin: '5\n', expectedStdout: '1\n2\nFizz\n4\nBuzz' },
      { id: 't2', name: 'n = 15', stdin: '15\n', expectedStdout: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz' },
      { id: 't3', name: 'n = 1', stdin: '1\n', expectedStdout: '1', hidden: true },
    ],
  },
  {
    id: 'ch-sum-evens',
    title: 'Even sum, odd count',
    moduleId: 'fundamentals',
    lessonId: 'f-control-flow',
    difficulty: 'beginner',
    kind: 'coding',
    dimension: 'coding',
    concepts: ['loops', 'remainder with negatives', 'accumulators'],
    description: `Input: an integer **n**, then **n** integers on the next line (they may be negative).

Print two lines:

\`\`\`
even sum: <sum of the even numbers>
odd count: <how many numbers are odd>
\`\`\`

Watch out for negative numbers.`,
    starterCode: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt();
        long evenSum = 0;
        int oddCount = 0;
        for (int i = 0; i < n; i++) {
            int value = in.nextInt();
            if (value % 2 == 0) evenSum += value;
            if (value % 2 == 1) oddCount++;
        }
        System.out.println("even sum: " + evenSum);
        System.out.println("odd count: " + oddCount);
    }
}`,
    solution: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt();
        long evenSum = 0;
        int oddCount = 0;
        for (int i = 0; i < n; i++) {
            int value = in.nextInt();
            if (value % 2 == 0) evenSum += value;
            else oddCount++;
        }
        System.out.println("even sum: " + evenSum);
        System.out.println("odd count: " + oddCount);
    }
}`,
    solutionExplanation:
      'In Java the remainder takes the sign of the dividend, so -3 % 2 is -1, not 1. Testing `% 2 != 0` (or using else) classifies negative odd numbers correctly. The sum uses long so large inputs cannot overflow.',
    complexity: { time: 'O(n)', space: 'O(1)' },
    hints: ['What is -3 % 2 in Java?', 'A number is odd when it is not even — you do not need a second remainder test.'],
    tests: [
      { id: 't1', name: 'Positive numbers', stdin: '5\n1 2 3 4 5\n', expectedStdout: 'even sum: 6\nodd count: 3' },
      { id: 't2', name: 'Negative numbers', stdin: '4\n-3 -4 -5 10\n', expectedStdout: 'even sum: 6\nodd count: 2' },
      { id: 't3', name: 'All odd', stdin: '3\n-1 -7 9\n', expectedStdout: 'even sum: 0\nodd count: 3', hidden: true },
    ],
  },
  {
    id: 'ch-digit-sum',
    title: 'Recursive digit sum',
    moduleId: 'fundamentals',
    lessonId: 'f-methods',
    difficulty: 'intermediate',
    kind: 'coding',
    dimension: 'coding',
    concepts: ['recursion', 'base case', 'Long.MIN_VALUE edge case'],
    description: `Implement \`static int digitSum(long n)\` **recursively**. It returns the sum of the decimal digits of n, ignoring the sign (digitSum(-123) is 6).

Input: a count **t**, then t numbers, one per line. The provided main prints one result per line.

Edge case: your method must work for every long, including \`Long.MIN_VALUE\`.`,
    starterCode: `import java.util.Scanner;

public class Main {
    static int digitSum(long n) {
        // TODO: implement recursively
        return 0;
    }

    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int t = in.nextInt();
        for (int i = 0; i < t; i++) {
            System.out.println(digitSum(in.nextLong()));
        }
    }
}`,
    solution: `import java.util.Scanner;

public class Main {
    static int digitSum(long n) {
        if (n == 0) return 0;
        // n % 10 keeps the sign of n, so take its absolute value per digit.
        // Math.abs(n) would overflow for Long.MIN_VALUE.
        return (int) Math.abs(n % 10) + digitSum(n / 10);
    }

    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int t = in.nextInt();
        for (int i = 0; i < t; i++) {
            System.out.println(digitSum(in.nextLong()));
        }
    }
}`,
    solutionExplanation:
      'Each call strips the last digit with n / 10 until n reaches 0 (the base case). Taking Math.abs of each remainder, rather than of n, avoids the trap that Math.abs(Long.MIN_VALUE) is still negative because +9223372036854775808 does not fit in a long. Recursion depth is at most 19.',
    complexity: { time: 'O(d) where d is the number of digits (≤ 19)', space: 'O(d) stack frames' },
    hints: [
      'Base case: what is the digit sum of 0?',
      'n % 10 gives the last digit and n / 10 removes it.',
      'Math.abs(Long.MIN_VALUE) == Long.MIN_VALUE. Can you avoid negating n itself?',
    ],
    staticChecks: [
      { id: 'recursive', description: 'digitSum calls itself', pattern: 'digitSum\\s*\\([^)]*\\)[\\s\\S]*digitSum\\s*\\(', mustMatch: true },
    ],
    tests: [
      { id: 't1', name: 'Simple numbers', stdin: '3\n123\n9\n0\n', expectedStdout: '6\n9\n0' },
      { id: 't2', name: 'Negative number', stdin: '1\n-4071\n', expectedStdout: '12' },
      { id: 't3', name: 'Long extremes', stdin: '2\n9223372036854775807\n-9223372036854775808\n', expectedStdout: '88\n89', hidden: true },
    ],
  },
  {
    id: 'ch-reverse-array',
    title: 'Reverse an array in place',
    moduleId: 'fundamentals',
    lessonId: 'f-arrays-input',
    difficulty: 'beginner',
    kind: 'coding',
    dimension: 'coding',
    concepts: ['arrays', 'two pointers', 'in-place algorithms'],
    description: `Input: **n**, then n integers. Reverse the array **in place** (swap elements; do not allocate a second array) and print it space-separated on one line.`,
    starterCode: `import java.io.*;
import java.util.*;

public class Main {
    static void reverse(int[] a) {
        // TODO: swap elements from both ends towards the middle
    }

    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(in.readLine().trim());
        int[] a = new int[n];
        StringTokenizer st = new StringTokenizer(n == 0 ? "" : in.readLine());
        for (int i = 0; i < n; i++) a[i] = Integer.parseInt(st.nextToken());
        reverse(a);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) sb.append(i == 0 ? "" : " ").append(a[i]);
        System.out.println(sb);
    }
}`,
    solution: `import java.io.*;
import java.util.*;

public class Main {
    static void reverse(int[] a) {
        for (int left = 0, right = a.length - 1; left < right; left++, right--) {
            int tmp = a[left];
            a[left] = a[right];
            a[right] = tmp;
        }
    }

    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(in.readLine().trim());
        int[] a = new int[n];
        StringTokenizer st = new StringTokenizer(n == 0 ? "" : in.readLine());
        for (int i = 0; i < n; i++) a[i] = Integer.parseInt(st.nextToken());
        reverse(a);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) sb.append(i == 0 ? "" : " ").append(a[i]);
        System.out.println(sb);
    }
}`,
    solutionExplanation:
      'Two pointers start at both ends and move inward, swapping as they go. The loop stops when they meet, so the middle element of an odd-length array is untouched and each pair is swapped exactly once.',
    complexity: { time: 'O(n)', space: 'O(1) extra' },
    hints: ['Use two indexes: one from the start, one from the end.', 'Stop when left >= right, otherwise you swap everything back.'],
    staticChecks: [
      { id: 'no-collections', description: 'Does not use Collections.reverse', pattern: 'Collections\\.reverse', mustMatch: false },
    ],
    tests: [
      { id: 't1', name: 'Odd length', stdin: '5\n1 2 3 4 5\n', expectedStdout: '5 4 3 2 1' },
      { id: 't2', name: 'Even length', stdin: '4\n10 -1 7 3\n', expectedStdout: '3 7 -1 10' },
      { id: 't3', name: 'Single element', stdin: '1\n42\n', expectedStdout: '42', hidden: true },
    ],
  },
  {
    id: 'boss-grade-report',
    title: 'Boss: grade report',
    moduleId: 'fundamentals',
    difficulty: 'intermediate',
    kind: 'boss',
    dimension: 'coding',
    concepts: ['input parsing', 'arrays', 'switch', 'formatting', 'edge cases'],
    description: `Module 1 capstone. Input: **n** (1 ≤ n ≤ 1000), then n lines of \`name score\` where score is an integer 0–100.

Print exactly:

\`\`\`
Average: <mean with 2 decimals>
Highest: <name> (<score>)
Lowest: <name> (<score>)
A:<count> B:<count> C:<count> D:<count> F:<count>
\`\`\`

Grades: 90+ A, 80–89 B, 70–79 C, 60–69 D, below 60 F. On ties, report the **first** student in input order. Format the average with \`String.format(Locale.ROOT, "%.2f", avg)\` so the decimal separator is always a dot.`,
    starterCode: `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(in.readLine().trim());
        String[] names = new String[n];
        int[] scores = new int[n];
        for (int i = 0; i < n; i++) {
            String[] parts = in.readLine().trim().split("\\\\s+");
            names[i] = parts[0];
            scores[i] = Integer.parseInt(parts[1]);
        }
        // TODO: compute and print the report
    }
}`,
    solution: `import java.io.*;
import java.util.*;

public class Main {
    static char grade(int score) {
        return switch (score / 10) {
            case 10, 9 -> 'A';
            case 8 -> 'B';
            case 7 -> 'C';
            case 6 -> 'D';
            default -> 'F';
        };
    }

    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(in.readLine().trim());
        String[] names = new String[n];
        int[] scores = new int[n];
        for (int i = 0; i < n; i++) {
            String[] parts = in.readLine().trim().split("\\\\s+");
            names[i] = parts[0];
            scores[i] = Integer.parseInt(parts[1]);
        }

        long total = 0;
        int hi = 0, lo = 0;
        int[] counts = new int[5];
        String letters = "ABCDF";
        for (int i = 0; i < n; i++) {
            total += scores[i];
            if (scores[i] > scores[hi]) hi = i;
            if (scores[i] < scores[lo]) lo = i;
            counts[letters.indexOf(grade(scores[i]))]++;
        }

        System.out.println("Average: " + String.format(Locale.ROOT, "%.2f", (double) total / n));
        System.out.println("Highest: " + names[hi] + " (" + scores[hi] + ")");
        System.out.println("Lowest: " + names[lo] + " (" + scores[lo] + ")");
        StringBuilder sb = new StringBuilder();
        for (int g = 0; g < 5; g++) {
            if (g > 0) sb.append(' ');
            sb.append(letters.charAt(g)).append(':').append(counts[g]);
        }
        System.out.println(sb);
    }
}`,
    solutionExplanation:
      'Strict comparisons (> and <) keep the first student on ties. Dividing by 10 maps scores onto switch cases, with 100 handled by `case 10, 9`. The average is computed in double from a long total, and Locale.ROOT guarantees a dot decimal separator regardless of the server locale.',
    complexity: { time: 'O(n)', space: 'O(n)' },
    hints: [
      'Use strict > and < so the first student wins ties.',
      'score / 10 turns 0–100 into 0–10 — a good fit for a switch expression.',
      'Cast before dividing: (double) total / n.',
    ],
    tests: [
      {
        id: 't1',
        name: 'Mixed grades',
        stdin: '5\nAlice 95\nBob 52\nCara 81\nDev 70\nEli 64\n',
        expectedStdout: 'Average: 72.40\nHighest: Alice (95)\nLowest: Bob (52)\nA:1 B:1 C:1 D:1 F:1',
      },
      {
        id: 't2',
        name: 'Ties keep first',
        stdin: '4\nZoe 88\nAmy 88\nLiu 40\nMo 40\n',
        expectedStdout: 'Average: 64.00\nHighest: Zoe (88)\nLowest: Liu (40)\nA:0 B:2 C:0 D:0 F:2',
      },
      { id: 't3', name: 'Single perfect score', stdin: '1\nSam 100\n', expectedStdout: 'Average: 100.00\nHighest: Sam (100)\nLowest: Sam (100)\nA:1 B:0 C:0 D:0 F:0', hidden: true },
      {
        id: 't4',
        name: 'Rounding',
        stdin: '3\nA 90\nB 89\nC 89\n',
        expectedStdout: 'Average: 89.33\nHighest: A (90)\nLowest: B (89)\nA:1 B:2 C:0 D:0 F:0',
        hidden: true,
      },
    ],
  },
];
