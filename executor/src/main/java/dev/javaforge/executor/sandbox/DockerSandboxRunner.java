package dev.javaforge.executor.sandbox;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Production sandbox: one short-lived container per request.
 *
 * <ul>
 *   <li>no network ({@code --network none})</li>
 *   <li>read-only root filesystem; sources mounted read-only at /src</li>
 *   <li>compiled classes and temp files only in size-limited tmpfs mounts</li>
 *   <li>memory, CPU and process-count limits; all capabilities dropped;
 *       no privilege escalation; runs as the unprivileged "nobody" user</li>
 *   <li>per-step timeouts enforced inside the container ({@code timeout -s KILL})
 *       and a hard container lifetime so nothing outlives a crashed server</li>
 * </ul>
 *
 * For stronger isolation, run the containers under gVisor (--runtime=runsc)
 * or on dedicated worker hosts; see docs/execution-api.md.
 */
public class DockerSandboxRunner implements SandboxRunner {

    private static final Logger log = LoggerFactory.getLogger(DockerSandboxRunner.class);
    private static final Pattern VERSION = Pattern.compile("version \"([^\"]+)\"");
    /** GNU timeout exits 124 on timeout (some builds report 128+SIGKILL=137 with -s KILL). */
    private static boolean isTimeoutExit(Integer code) {
        return code != null && (code == 124 || code == 137);
    }

    private final SandboxProperties props;
    private volatile String javaVersion;

    public DockerSandboxRunner(SandboxProperties props) {
        this.props = props;
    }

    @Override
    public String name() {
        return "docker";
    }

    @Override
    public String javaVersion() {
        String v = javaVersion;
        if (v != null) return v;
        try {
            var result = BoundedProcess.run(
                    List.of(props.dockerBinary(), "run", "--rm", "--network", "none", props.image(), "java", "-version"),
                    null, hostEnv(), "", Duration.ofSeconds(60), 4096);
            Matcher m = VERSION.matcher(result.stderr());
            if (result.exitCode() != null && result.exitCode() == 0 && m.find()) {
                javaVersion = m.group(1);
            }
        } catch (IOException e) {
            log.warn("Could not query Java version from sandbox image {}: {}", props.image(), e.getMessage());
        }
        return javaVersion;
    }

    @Override
    public Session open(Path sourceDir) throws SandboxException {
        String container = "jf-" + UUID.randomUUID();
        long lifetimeSeconds = props.compileTimeout().toSeconds()
                + props.runTimeout().toSeconds() * 25 + 30;
        List<String> cmd = new ArrayList<>(List.of(
                props.dockerBinary(), "run", "-d", "--rm",
                "--name", container,
                "--network", "none",
                "--memory", props.containerMemoryMb() + "m",
                "--memory-swap", props.containerMemoryMb() + "m",
                "--cpus", String.valueOf(props.cpus()),
                "--pids-limit", String.valueOf(props.pidsLimit()),
                "--read-only",
                "--tmpfs", "/tmp:rw,nosuid,nodev,size=64m,mode=1777",
                "--tmpfs", "/out:rw,nosuid,nodev,size=32m,mode=1777",
                "--cap-drop", "ALL",
                "--security-opt", "no-new-privileges",
                "--user", "65534:65534",
                "--env", "JAVA_TOOL_OPTIONS=",
                "--volume", sourceDir.toAbsolutePath() + ":/src:ro",
                props.image(),
                "sleep", String.valueOf(lifetimeSeconds)));
        try {
            var started = BoundedProcess.run(cmd, null, hostEnv(), "", Duration.ofSeconds(60), 8192);
            if (started.exitCode() == null || started.exitCode() != 0) {
                throw new SandboxException("Could not start sandbox container: " + started.stderr().strip());
            }
        } catch (IOException e) {
            throw new SandboxException("Could not start sandbox container", e);
        }
        return new DockerSession(container, sourceDir);
    }

    private Map<String, String> hostEnv() {
        String path = System.getenv().getOrDefault("PATH", "/usr/local/bin:/usr/bin:/bin");
        String home = System.getenv().getOrDefault("HOME", "/tmp");
        return Map.of("PATH", path, "HOME", home);
    }

    private final class DockerSession implements Session {
        private final String container;
        private final Path sourceDir;

        DockerSession(String container, Path sourceDir) {
            this.container = container;
            this.sourceDir = sourceDir;
        }

        @Override
        public ProcessResult compile(Duration timeout) throws SandboxException {
            List<String> cmd = new ArrayList<>(List.of(props.dockerBinary(), "exec", container,
                    "timeout", "-s", "KILL", String.valueOf(timeout.toSeconds()),
                    "javac", "-proc:none", "-encoding", "UTF-8", "-Xlint:none", "-d", "/out"));
            try (Stream<Path> files = Files.list(sourceDir)) {
                files.filter(p -> p.toString().endsWith(".java"))
                        .sorted()
                        .forEach(p -> cmd.add("/src/" + p.getFileName()));
            } catch (IOException e) {
                throw new SandboxException("Could not list sources", e);
            }
            return exec(cmd, "", timeout);
        }

        @Override
        public ProcessResult run(String mainClass, String stdin, Duration timeout) throws SandboxException {
            List<String> cmd = new ArrayList<>(List.of(props.dockerBinary(), "exec", "-i", container,
                    "timeout", "-s", "KILL", String.valueOf(Math.max(1, timeout.toSeconds())), "java"));
            cmd.addAll(SandboxRunner.javaRunFlags(props.heapMb()));
            cmd.addAll(List.of("-cp", "/out", mainClass));
            return exec(cmd, stdin, timeout);
        }

        private ProcessResult exec(List<String> cmd, String stdin, Duration timeout) throws SandboxException {
            try {
                // Host-side guard in case the docker CLI itself hangs.
                ProcessResult r = BoundedProcess.run(cmd, null, hostEnv(), stdin, timeout.plusSeconds(10), props.maxOutputBytes());
                boolean killedByTimeout = isTimeoutExit(r.exitCode()) && r.timeMs() >= timeout.toMillis() - 250;
                return new ProcessResult(r.stdout(), r.stderr().replace("/src/", ""), killedByTimeout ? null : r.exitCode(),
                        r.timeMs(), r.timedOut() || killedByTimeout, r.outputTruncated());
            } catch (IOException e) {
                throw new SandboxException("Sandbox execution failed", e);
            }
        }

        @Override
        public void close() {
            try {
                BoundedProcess.run(List.of(props.dockerBinary(), "rm", "-f", container), null, hostEnv(), "",
                        Duration.ofSeconds(30), 4096);
            } catch (IOException e) {
                log.warn("Failed to remove sandbox container {}: {}", container, e.getMessage());
            }
        }
    }
}
