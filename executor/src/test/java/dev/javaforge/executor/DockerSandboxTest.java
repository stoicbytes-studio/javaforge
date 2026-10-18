package dev.javaforge.executor;

import static org.assertj.core.api.Assertions.assertThat;

import dev.javaforge.executor.api.ExecutionDtos.ExecutionResponse;
import dev.javaforge.executor.sandbox.DockerSandboxRunner;
import dev.javaforge.executor.service.ExecutionService;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;

/**
 * Runs the sandbox contract plus isolation checks against real containers.
 * Skipped automatically when no Docker daemon is reachable.
 */
@EnabledIf("dockerAvailable")
class DockerSandboxTest extends SandboxContract {

    static boolean dockerAvailable() {
        try {
            Process p = new ProcessBuilder("docker", "info").redirectErrorStream(true).start();
            p.getInputStream().readAllBytes();
            return p.waitFor(20, TimeUnit.SECONDS) && p.exitValue() == 0;
        } catch (Exception e) {
            return false;
        }
    }

    private final ExecutionService service = new ExecutionService(
            new DockerSandboxRunner(LocalRunnerTest.props("docker")), LocalRunnerTest.props("docker"));

    @Override
    ExecutionService service() {
        return service;
    }

    @Test
    void hasNoNetwork() throws Exception {
        ExecutionResponse r = service.execute(program(main("""
                try (var s = new java.net.Socket()) {
                  s.connect(new java.net.InetSocketAddress("1.1.1.1", 443), 2000);
                  System.out.println("CONNECTED");
                } catch (Exception e) { System.out.println("blocked: " + e.getClass().getSimpleName()); }"""), ""));
        assertThat(r.run().stdout()).startsWith("blocked").doesNotContain("CONNECTED");
    }

    @Test
    void cannotWriteSourcesOrRootFilesystem() throws Exception {
        ExecutionResponse r = service.execute(program(main("""
                for (String path : new String[] {"/src/evil.txt", "/etc/evil", "/home/evil"}) {
                  try { java.nio.file.Files.writeString(java.nio.file.Path.of(path), "x"); System.out.println("WROTE " + path); }
                  catch (Exception e) { System.out.println("denied " + path); }
                }"""), ""));
        assertThat(r.run().stdout()).doesNotContain("WROTE").contains("denied /src/evil.txt", "denied /etc/evil");
    }

    @Test
    void runsAsUnprivilegedUser() throws Exception {
        ExecutionResponse r = service.execute(program(main("System.out.println(System.getProperty(\"user.name\") + \" \" + new com.sun.security.auth.module.UnixSystem().getUid());"), ""));
        assertThat(r.run().stdout()).contains("65534");
    }

    @Test
    void limitsThreadExplosions() throws Exception {
        ExecutionResponse r = service.execute(program(main("""
                int started = 0;
                try {
                  for (int i = 0; i < 5000; i++) { Thread t = new Thread(() -> { try { Thread.sleep(10_000); } catch (InterruptedException e) {} }); t.setDaemon(true); t.start(); started++; }
                  System.out.println("started all " + started);
                } catch (Throwable t) { System.out.println("stopped at " + started + ": " + t.getClass().getSimpleName()); }"""), ""));
        assertThat(r.run().stdout()).startsWith("stopped at");
        assertThat(r.run().stderr()).contains("pthread_create failed");
    }
}
