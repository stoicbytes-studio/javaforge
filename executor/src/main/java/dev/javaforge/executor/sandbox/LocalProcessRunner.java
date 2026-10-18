package dev.javaforge.executor.sandbox;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

/**
 * DEVELOPMENT ONLY. Runs javac/java as child processes of the server with
 * timeouts, a heap limit and bounded output, but WITHOUT filesystem, network
 * or process isolation. Never expose this mode to untrusted users; it exists
 * so contributors can run the service without Docker.
 */
public class LocalProcessRunner implements SandboxRunner {

    private final SandboxProperties props;
    private final Path javaHome = Path.of(System.getProperty("java.home"));

    public LocalProcessRunner(SandboxProperties props) {
        this.props = props;
    }

    @Override
    public String name() {
        return "local-unsafe";
    }

    @Override
    public String javaVersion() {
        return Runtime.version().toString();
    }

    @Override
    public Session open(Path sourceDir) throws SandboxException {
        Path out = sourceDir.resolve("out");
        try {
            Files.createDirectories(out);
        } catch (IOException e) {
            throw new SandboxException("Could not create output directory", e);
        }
        return new Session() {
            @Override
            public ProcessResult compile(Duration timeout) throws SandboxException {
                List<String> cmd = new ArrayList<>(List.of(tool("javac"), "-proc:none", "-encoding", "UTF-8", "-Xlint:none", "-d", "out"));
                try (Stream<Path> files = Files.list(sourceDir)) {
                    files.filter(p -> p.toString().endsWith(".java")).sorted().forEach(p -> cmd.add(p.getFileName().toString()));
                } catch (IOException e) {
                    throw new SandboxException("Could not list sources", e);
                }
                return exec(cmd, "", timeout);
            }

            @Override
            public ProcessResult run(String mainClass, String stdin, Duration timeout) throws SandboxException {
                List<String> cmd = new ArrayList<>(List.of(tool("java")));
                cmd.addAll(SandboxRunner.javaRunFlags(props.heapMb()));
                cmd.addAll(List.of("-cp", "out", mainClass));
                return exec(cmd, stdin, timeout);
            }

            private ProcessResult exec(List<String> cmd, String stdin, Duration timeout) throws SandboxException {
                try {
                    return BoundedProcess.run(cmd, sourceDir, Map.of("PATH", "/usr/bin:/bin"), stdin, timeout, props.maxOutputBytes());
                } catch (IOException e) {
                    throw new SandboxException("Process execution failed", e);
                }
            }

            @Override
            public void close() {
                // The service deletes the working directory.
            }
        };
    }

    private String tool(String name) {
        return javaHome.resolve("bin").resolve(name).toString();
    }
}
