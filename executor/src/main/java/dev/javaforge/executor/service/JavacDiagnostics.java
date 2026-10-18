package dev.javaforge.executor.service;

import dev.javaforge.executor.api.ExecutionDtos.Diagnostic;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Parses javac's human-readable output into structured diagnostics:
 * <pre>
 * Main.java:4: error: ';' expected
 *         int x = 5
 *                  ^
 *   symbol:   variable y        (optional detail lines)
 * </pre>
 */
public final class JavacDiagnostics {

    private static final Pattern HEADER = Pattern.compile("^(?:.*/)?([^/:]+\\.java):(\\d+): (error|warning): (.*)$");
    private static final Pattern SUMMARY = Pattern.compile("^\\d+ (error|warning)s?$");

    private JavacDiagnostics() {
    }

    public static List<Diagnostic> parse(String output) {
        List<Diagnostic> result = new ArrayList<>();
        String[] lines = output.replace("\r\n", "\n").split("\n");
        int i = 0;
        while (i < lines.length) {
            Matcher m = HEADER.matcher(lines[i]);
            if (!m.matches()) {
                i++;
                continue;
            }
            String file = m.group(1);
            int line = Integer.parseInt(m.group(2));
            String severity = m.group(3);
            StringBuilder message = new StringBuilder(m.group(4));
            Integer column = null;
            i++;
            // Source line, then a caret line marking the column.
            if (i + 1 < lines.length && lines[i + 1].strip().equals("^")) {
                column = lines[i + 1].indexOf('^') + 1;
                i += 2;
            }
            while (i < lines.length && !HEADER.matcher(lines[i]).matches() && !SUMMARY.matcher(lines[i].strip()).matches()) {
                String detail = lines[i].strip();
                if (!detail.isEmpty()) message.append("; ").append(detail);
                i++;
            }
            result.add(new Diagnostic(file, line, column, severity, message.toString()));
        }
        if (result.isEmpty() && !output.isBlank()) {
            result.add(new Diagnostic(null, null, null, "error", output.strip()));
        }
        return result;
    }
}
