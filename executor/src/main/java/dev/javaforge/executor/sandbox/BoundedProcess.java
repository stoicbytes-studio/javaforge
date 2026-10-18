package dev.javaforge.executor.sandbox;

import dev.javaforge.executor.sandbox.SandboxRunner.ProcessResult;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Starts a process with a wall-clock timeout and bounded output capture.
 * Output beyond the limit is drained and discarded so the child never blocks
 * on a full pipe.
 */
public final class BoundedProcess {

    private BoundedProcess() {
    }

    public static ProcessResult run(List<String> command, Path workDir, Map<String, String> env, String stdin,
                                    Duration timeout, int maxOutputBytes) throws IOException {
        ProcessBuilder pb = new ProcessBuilder(command);
        if (workDir != null) pb.directory(workDir.toFile());
        pb.environment().clear();
        pb.environment().putAll(env);

        long started = System.nanoTime();
        Process process = pb.start();
        AtomicBoolean truncated = new AtomicBoolean(false);
        Capture out = new Capture(process.getInputStream(), maxOutputBytes, truncated);
        Capture err = new Capture(process.getErrorStream(), maxOutputBytes, truncated);
        Thread outThread = Thread.ofVirtual().start(out);
        Thread errThread = Thread.ofVirtual().start(err);
        Thread inThread = Thread.ofVirtual().start(() -> writeStdin(process.getOutputStream(), stdin));

        boolean finished;
        try {
            finished = process.waitFor(timeout.toMillis(), TimeUnit.MILLISECONDS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            finished = false;
        }
        if (!finished) {
            process.descendants().forEach(ProcessHandle::destroyForcibly);
            process.destroyForcibly();
        }
        try {
            process.waitFor(5, TimeUnit.SECONDS);
            outThread.join(Duration.ofSeconds(5));
            errThread.join(Duration.ofSeconds(5));
            inThread.join(Duration.ofSeconds(1));
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        long timeMs = (System.nanoTime() - started) / 1_000_000;
        Integer exit = finished ? process.exitValue() : null;
        return new ProcessResult(out.text(), err.text(), exit, timeMs, !finished, truncated.get());
    }

    private static void writeStdin(OutputStream stdin, String input) {
        try (stdin) {
            if (input != null && !input.isEmpty()) stdin.write(input.getBytes(StandardCharsets.UTF_8));
        } catch (IOException ignored) {
            // The program may exit without reading its input.
        }
    }

    private static final class Capture implements Runnable {
        private final InputStream in;
        private final int limit;
        private final AtomicBoolean truncated;
        private final ByteArrayOutputStream buffer = new ByteArrayOutputStream();

        Capture(InputStream in, int limit, AtomicBoolean truncated) {
            this.in = in;
            this.limit = limit;
            this.truncated = truncated;
        }

        @Override
        public void run() {
            byte[] chunk = new byte[8192];
            try (in) {
                int n;
                while ((n = in.read(chunk)) != -1) {
                    int room = limit - buffer.size();
                    if (room > 0) buffer.write(chunk, 0, Math.min(room, n));
                    if (n > room) truncated.set(true);
                }
            } catch (IOException ignored) {
                // Stream closed because the process was killed.
            }
        }

        synchronized String text() {
            return buffer.toString(StandardCharsets.UTF_8);
        }
    }
}
