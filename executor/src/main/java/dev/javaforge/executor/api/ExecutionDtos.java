package dev.javaforge.executor.api;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;

/**
 * Wire format of the execution API. Mirrors src/services/execution/types.ts
 * in the app; see docs/execution-api.md.
 */
public final class ExecutionDtos {

    private ExecutionDtos() {
    }

    public static final int MAX_FILES = 8;
    public static final int MAX_SOURCE_CHARS = 64 * 1024;
    public static final int MAX_STDIN_CHARS = 64 * 1024;
    public static final int MAX_TEST_CASES = 20;

    public record SourceFile(
            @NotBlank @Pattern(regexp = "[A-Za-z_][A-Za-z0-9_]{0,63}\\.java", message = "must be a simple Java file name") String name,
            @NotBlank @Size(max = MAX_SOURCE_CHARS) String content) {
    }

    public record TestCaseInput(
            @NotBlank @Size(max = 64) String id,
            @Size(max = MAX_STDIN_CHARS) String stdin,
            @Size(max = MAX_STDIN_CHARS) String expectedStdout) {
    }

    public record ExecutionRequest(
            @NotEmpty @Size(max = MAX_FILES) List<@Valid SourceFile> files,
            @NotBlank @Pattern(regexp = "[A-Za-z_][A-Za-z0-9_]{0,63}", message = "must be a simple class name") String mainClass,
            @Size(max = MAX_STDIN_CHARS) String stdin,
            @Size(max = MAX_TEST_CASES) List<@Valid TestCaseInput> testCases) {
    }

    public record Diagnostic(String file, Integer line, Integer column, String severity, String message) {
    }

    public record CompileResult(boolean success, List<Diagnostic> diagnostics, long timeMs) {
    }

    public record RunResult(String stdout, String stderr, Integer exitCode, long timeMs, boolean timedOut, boolean outputTruncated) {
    }

    public record TestResult(String id, boolean passed, String stdout, String stderr, Integer exitCode, long timeMs,
                             boolean timedOut, boolean outputTruncated) {
    }

    public record ExecutionResponse(CompileResult compile, RunResult run, List<TestResult> tests) {
    }

    public record HealthResponse(String status, String javaVersion, String sandbox) {
    }

    public record ErrorResponse(String error, String message) {
    }
}
