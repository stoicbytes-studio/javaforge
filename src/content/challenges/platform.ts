import type { CodingChallenge } from '@/types/curriculum';

export const platformChallenges: CodingChallenge[] = [
  {
    id: 'boss-classfile-inspector',
    title: 'Boss: class file inspector',
    moduleId: 'jvm-platform',
    lessonId: 'p-bytecode',
    difficulty: 'intermediate',
    kind: 'boss',
    dimension: 'coding',
    concepts: ['class file format', 'hex parsing', 'bit manipulation', 'input validation'],
    description: `Build the first step of a bytecode tool. Each input line is the **hex dump** of the first bytes of a file (letters may be upper or lower case, no spaces). For each line print one result:

- Fewer than 8 bytes (16 hex digits): \`Truncated header\`
- Any character that is not a hex digit: \`Invalid hex\`
- First 4 bytes are not \`CAFEBABE\`: \`Not a class file\`
- Otherwise: \`Java <major-44> (major <major>, minor <minor>)\`, and if minor is \`65535\` append \`, preview features\`

Bytes 5–6 are the minor version and bytes 7–8 the major version, both unsigned big-endian. Input: a count **t**, then t lines.`,
    starterCode: `import java.io.*;

public class Main {
    static String inspect(String hex) {
        // TODO
        return "Not implemented";
    }

    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int t = Integer.parseInt(in.readLine().trim());
        for (int i = 0; i < t; i++) {
            System.out.println(inspect(in.readLine().trim()));
        }
    }
}`,
    solution: `import java.io.*;

public class Main {
    static String inspect(String hex) {
        for (int i = 0; i < hex.length(); i++) {
            if (Character.digit(hex.charAt(i), 16) < 0) return "Invalid hex";
        }
        if (hex.length() < 16) return "Truncated header";
        long magic = Long.parseLong(hex.substring(0, 8), 16);
        if (magic != 0xCAFEBABEL) return "Not a class file";
        int minor = Integer.parseInt(hex.substring(8, 12), 16);
        int major = Integer.parseInt(hex.substring(12, 16), 16);
        String result = "Java " + (major - 44) + " (major " + major + ", minor " + minor;
        if (minor == 0xFFFF) result += ", preview features";
        return result + ")";
    }

    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int t = Integer.parseInt(in.readLine().trim());
        for (int i = 0; i < t; i++) {
            System.out.println(inspect(in.readLine().trim()));
        }
    }
}`,
    solutionExplanation:
      'Validate characters first so malformed input never reaches parsing, then check length. `0xCAFEBABE` does not fit in a positive int (it is negative as an int), so the magic number is parsed into a long and compared with the long literal 0xCAFEBABEL. Minor and major are each two bytes, i.e. four hex digits, read as unsigned values.',
    complexity: { time: 'O(n) per line', space: 'O(1)' },
    hints: [
      'Character.digit(c, 16) returns -1 for non-hex characters.',
      'Two hex digits make one byte, so 8 bytes are 16 characters.',
      'Integer.parseInt("CAFEBABE", 16) overflows — why? Use a long.',
    ],
    tests: [
      { id: 't1', name: 'Java 21 and Java 8', stdin: '2\nCAFEBABE00000041\ncafebabe00000034\n', expectedStdout: 'Java 21 (major 65, minor 0)\nJava 8 (major 52, minor 0)' },
      { id: 't2', name: 'Not a class file', stdin: '1\n504B030414000000\n', expectedStdout: 'Not a class file' },
      { id: 't3', name: 'Preview features and longer dumps', stdin: '1\nCAFEBABEFFFF0045000A0B\n', expectedStdout: 'Java 25 (major 69, minor 65535, preview features)', hidden: true },
      { id: 't4', name: 'Malformed input', stdin: '2\nCAFEBA\nCAFEBABE0000004Z\n', expectedStdout: 'Truncated header\nInvalid hex', hidden: true },
    ],
  },
];
