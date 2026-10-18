package dev.javaforge.executor.sandbox;

import java.nio.file.Path;
import java.time.Duration;
import java.util.List;

/**
 * Runs untrusted learner code. Implementations must enforce, at minimum:
 * a wall-clock timeout, a memory limit, bounded output, and no network
 * access. Untrusted code must never run inside the API server's own JVM.
 */
public interface SandboxRunner {

    /** Short name reported by the health endpoint, e.g. "docker". */
    String name();

    /** Java version available inside the sandbox, e.g. "21.0.4". */
    String javaVersion();

    /**
     * Opens a session for one request. Sources are copied in read-only; compiled
     * classes and temporary files live in size-limited scratch space.
     */
    Session open(Path sourceDir) throws SandboxException;

    interface Session extends AutoCloseable {

        /** Compiles every .java file of the session with javac. */
        ProcessResult compile(Duration timeout) throws SandboxException;

        /** Runs the compiled main class with the given standard input. */
        ProcessResult run(String mainClass, String stdin, Duration timeout) throws SandboxException;

        @Override
        void close();
    }

    record ProcessResult(String stdout, String stderr, Integer exitCode, long timeMs, boolean timedOut, boolean outputTruncated) {
    }

    /** Infrastructure failure (not a learner error), mapped to HTTP 503. */
    class SandboxException extends Exception {
        public SandboxException(String message, Throwable cause) {
            super(message, cause);
        }

        public SandboxException(String message) {
            super(message);
        }
    }

    /** Shared JVM flags for running learner programs. */
    static List<String> javaRunFlags(int heapMb) {
        return List.of(
                "-Xmx" + heapMb + "m",
                "-Xss8m",
                "-XX:+UseSerialGC",
                "-XX:TieredStopAtLevel=1",
                "-XX:ActiveProcessorCount=1",
                // JVM warnings default to stdout; keep learner stdout clean for grading.
                "-Xlog:disable",
                "-Xlog:all=warning:stderr",
                "-Dfile.encoding=UTF-8",
                "-Dstdout.encoding=UTF-8",
                "-Dstderr.encoding=UTF-8");
    }
}
