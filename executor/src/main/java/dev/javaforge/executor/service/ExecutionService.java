package dev.javaforge.executor.service;

import dev.javaforge.executor.api.ExecutionDtos.CompileResult;
import dev.javaforge.executor.api.ExecutionDtos.Diagnostic;
import dev.javaforge.executor.api.ExecutionDtos.ExecutionRequest;
import dev.javaforge.executor.api.ExecutionDtos.ExecutionResponse;
import dev.javaforge.executor.api.ExecutionDtos.RunResult;
import dev.javaforge.executor.api.ExecutionDtos.SourceFile;
import dev.javaforge.executor.api.ExecutionDtos.TestCaseInput;
import dev.javaforge.executor.api.ExecutionDtos.TestResult;
import dev.javaforge.executor.sandbox.SandboxProperties;
import dev.javaforge.executor.sandbox.SandboxRunner;
import dev.javaforge.executor.sandbox.SandboxRunner.ProcessResult;
import dev.javaforge.executor.sandbox.SandboxRunner.SandboxException;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.attribute.PosixFilePermissions;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.concurrent.Semaphore;
import java.util.concurrent.TimeUnit;
import java.util.stream.Stream;

/** Orchestrates one execution: write sources, compile, run tests, clean up. */
public class ExecutionService {

    private final SandboxRunner runner;
    private final SandboxProperties props;
    private final Semaphore slots;

    public ExecutionService(SandboxRunner runner, SandboxProperties props) {
        this.runner = runner;
        this.props = props;
        this.slots = new Semaphore(props.maxConcurrentExecutions(), true);
    }

    /** Thrown when all sandbox slots are busy; mapped to HTTP 429. */
    public static class BusyException extends RuntimeException {
        public BusyException() {
            super("All execution slots are busy. Try again in a few seconds.");
        }
    }

    /** Request is well-formed JSON but semantically invalid; mapped to HTTP 400. */
    public static class InvalidRequestException extends RuntimeException {
        public InvalidRequestException(String message) {
            super(message);
        }
    }

    public ExecutionResponse execute(ExecutionRequest request) throws SandboxException {
        validate(request);
        boolean acquired;
        try {
            acquired = slots.tryAcquire(3, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new BusyException();
        }
        if (!acquired) throw new BusyException();
        Path dir = null;
        try {
            dir = writeSources(request.files());
            try (SandboxRunner.Session session = runner.open(dir)) {
                ProcessResult compiled = session.compile(props.compileTimeout());
                List<Diagnostic> diagnostics = compiled.timedOut()
                        ? List.of(new Diagnostic(null, null, null, "error", "Compilation timed out."))
                        : JavacDiagnostics.parse(compiled.stderr() + compiled.stdout());
                boolean success = !compiled.timedOut() && compiled.exitCode() != null && compiled.exitCode() == 0;
                CompileResult compile = new CompileResult(success, success ? List.of() : diagnostics, compiled.timeMs());
                if (!success) return new ExecutionResponse(compile, null, null);

                List<TestCaseInput> tests = request.testCases() == null ? List.of() : request.testCases();
                if (tests.isEmpty()) {
                    ProcessResult r = session.run(request.mainClass(), nullToEmpty(request.stdin()), props.runTimeout());
                    return new ExecutionResponse(compile, toRun(r), null);
                }
                List<TestResult> results = new ArrayList<>();
                for (TestCaseInput t : tests) {
                    ProcessResult r = session.run(request.mainClass(), nullToEmpty(t.stdin()), props.runTimeout());
                    boolean passed = !r.timedOut() && r.exitCode() != null && r.exitCode() == 0 && !r.outputTruncated()
                            && OutputComparator.matches(r.stdout(), nullToEmpty(t.expectedStdout()));
                    results.add(new TestResult(t.id(), passed, r.stdout(), r.stderr(), r.exitCode(), r.timeMs(), r.timedOut(), r.outputTruncated()));
                }
                return new ExecutionResponse(compile, null, results);
            }
        } catch (IOException e) {
            throw new SandboxException("Could not prepare the workspace", e);
        } finally {
            slots.release();
            deleteQuietly(dir);
        }
    }

    private void validate(ExecutionRequest request) {
        int total = 0;
        var names = new HashSet<String>();
        for (SourceFile f : request.files()) {
            if (!names.add(f.name())) throw new InvalidRequestException("Duplicate file name: " + f.name());
            total += f.content().length();
        }
        if (total > 4 * 64 * 1024) throw new InvalidRequestException("Total source size is too large.");
        if (!names.contains(request.mainClass() + ".java")
                && request.files().stream().noneMatch(f -> f.content().contains("class " + request.mainClass()))) {
            throw new InvalidRequestException("No class named " + request.mainClass() + " was found in the sources.");
        }
        if (request.testCases() != null) {
            var ids = new HashSet<String>();
            for (TestCaseInput t : request.testCases()) {
                if (!ids.add(t.id())) throw new InvalidRequestException("Duplicate test id: " + t.id());
            }
        }
    }

    private static Path writeSources(List<SourceFile> files) throws IOException {
        Path dir = Files.createTempDirectory("jf-exec-");
        for (SourceFile f : files) {
            Path target = dir.resolve(f.name()).normalize();
            if (!target.getParent().equals(dir)) throw new InvalidRequestException("Invalid file name: " + f.name());
            Files.writeString(target, f.content(), StandardCharsets.UTF_8);
            makeWorldReadable(target, "rw-r--r--");
        }
        // The sandbox user ("nobody") must be able to read the mounted sources.
        makeWorldReadable(dir, "rwxr-xr-x");
        return dir;
    }

    private static void makeWorldReadable(Path path, String perms) {
        try {
            Files.setPosixFilePermissions(path, PosixFilePermissions.fromString(perms));
        } catch (UnsupportedOperationException | IOException ignored) {
            // Non-POSIX filesystems (Windows dev machines) do not need this.
        }
    }

    private static RunResult toRun(ProcessResult r) {
        return new RunResult(r.stdout(), r.stderr(), r.exitCode(), r.timeMs(), r.timedOut(), r.outputTruncated());
    }

    private static String nullToEmpty(String s) {
        return s == null ? "" : s;
    }

    private static void deleteQuietly(Path dir) {
        if (dir == null) return;
        try (Stream<Path> walk = Files.walk(dir)) {
            walk.sorted(Comparator.reverseOrder()).forEach(p -> {
                try {
                    Files.deleteIfExists(p);
                } catch (IOException ignored) {
                    // best effort
                }
            });
        } catch (IOException ignored) {
            // best effort
        }
    }
}
