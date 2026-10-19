import type { CodingChallenge } from '@/types/curriculum';

const PRICING_HARNESS = `
public class Main {
    public static void main(String[] args) {
        java.util.Scanner in = new java.util.Scanner(System.in);
        int n = in.nextInt();
        int passed = 0;
        for (int i = 0; i < n; i++) {
            int quantity = in.nextInt();
            int unitCents = in.nextInt();
            long expected = in.nextLong();
            String call = "totalCents(" + quantity + ", " + unitCents + ")";
            try {
                long actual = BulkPricing.totalCents(quantity, unitCents);
                if (actual == expected) {
                    passed++;
                    System.out.println("PASS " + call + " = " + actual);
                } else {
                    System.out.println("FAIL " + call + ": expected " + expected + " but was " + actual);
                }
            } catch (RuntimeException e) {
                System.out.println("ERROR " + call + ": " + e);
            }
        }
        System.out.println(passed + "/" + n + " passed");
    }
}`;

export const testingChallenges: CodingChallenge[] = [
  {
    id: 'ch-bulk-pricing-bug',
    title: 'Make the failing tests pass',
    moduleId: 'testing',
    lessonId: 'ts-junit',
    difficulty: 'intermediate',
    kind: 'debugging',
    dimension: 'debugging',
    concepts: ['boundary values', 'off-by-one', 'integer overflow', 'reading test failures'],
    description: `\`BulkPricing.totalCents\` implements this rule:

- 1 to 9 items: full price
- 10 to 49 items: 10% off
- 50 or more items: 20% off
- the discounted total is rounded **down** to the cent; totals can exceed the range of \`int\`

\`Main\` is a small test harness: it reads test cases \`quantity unitCents expectedCents\` from standard input, prints \`PASS\`/\`FAIL\` per case and a summary. The typical cases pass, but boundary and large-order cases fail.

Read the failure messages, find **every** bug in \`BulkPricing\` and fix it. Do not change \`Main\` — a fix that edits the test to match the bug is not a fix.`,
    starterCode: `class BulkPricing {
    /** 1-9 items: full price. 10-49: 10% off. 50+: 20% off. Rounds down to the cent. */
    static long totalCents(int quantity, int unitCents) {
        int subtotal = quantity * unitCents;
        int percentOff;
        if (quantity > 50) percentOff = 20;
        else if (quantity > 10) percentOff = 10;
        else percentOff = 0;
        return subtotal * (100 - percentOff) / 100;
    }
}
${PRICING_HARNESS}`,
    solution: `class BulkPricing {
    /** 1-9 items: full price. 10-49: 10% off. 50+: 20% off. Rounds down to the cent. */
    static long totalCents(int quantity, int unitCents) {
        long subtotal = (long) quantity * unitCents;
        int percentOff = quantity >= 50 ? 20 : quantity >= 10 ? 10 : 0;
        return subtotal * (100 - percentOff) / 100;
    }
}
${PRICING_HARNESS}`,
    solutionExplanation:
      'Two bugs. (1) Off-by-one: "10 or more" is quantity >= 10, not > 10, so exactly 10 and exactly 50 items got the wrong tier — only boundary tests reveal this. (2) Overflow: quantity * unitCents is computed in int before being widened, and subtotal * 100 overflows even sooner; casting one operand to long first makes the whole calculation 64-bit. Returning long from the method did not help because the damage happened earlier.',
    complexity: { time: 'O(1) per call', space: 'O(1)' },
    hints: [
      'Run the boundary test: which quantities fail, and by how much?',
      'Is "10 or more" written as > 10 or >= 10?',
      'In what type is quantity * unitCents computed? When is it widened to long?',
    ],
    staticChecks: [
      { id: 'long-math', description: 'Performs the multiplication in long arithmetic', pattern: '\\(long\\)|long\\s+subtotal', mustMatch: true },
    ],
    tests: [
      {
        id: 't1',
        name: 'Typical quantities',
        stdin: '3\n1 250 250\n20 100 1800\n60 1000 48000\n',
        expectedStdout: 'PASS totalCents(1, 250) = 250\nPASS totalCents(20, 100) = 1800\nPASS totalCents(60, 1000) = 48000\n3/3 passed',
      },
      {
        id: 't2',
        name: 'Tier boundaries',
        stdin: '4\n9 100 900\n10 100 900\n49 100 4410\n50 100 4000\n',
        expectedStdout: 'PASS totalCents(9, 100) = 900\nPASS totalCents(10, 100) = 900\nPASS totalCents(49, 100) = 4410\nPASS totalCents(50, 100) = 4000\n4/4 passed',
      },
      {
        id: 't3',
        name: 'Large orders',
        stdin: '2\n50000 100000 4000000000\n1 2000000000 2000000000\n',
        expectedStdout: 'PASS totalCents(50000, 100000) = 4000000000\nPASS totalCents(1, 2000000000) = 2000000000\n2/2 passed',
        hidden: true,
      },
    ],
  },
];
