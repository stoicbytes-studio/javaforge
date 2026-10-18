package dev.javaforge.executor.service;

/**
 * Output comparison shared with the app and the content verifier: trailing
 * whitespace on each line and trailing blank lines are ignored; everything
 * else must match exactly.
 */
public final class OutputComparator {

    private OutputComparator() {
    }

    public static String normalize(String s) {
        String[] lines = s.replace("\r\n", "\n").split("\n", -1);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < lines.length; i++) {
            if (i > 0) sb.append('\n');
            sb.append(lines[i].stripTrailing());
        }
        int end = sb.length();
        while (end > 0 && sb.charAt(end - 1) == '\n') end--;
        return sb.substring(0, end);
    }

    public static boolean matches(String actual, String expected) {
        return normalize(actual).equals(normalize(expected));
    }
}
