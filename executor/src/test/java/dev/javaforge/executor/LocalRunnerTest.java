package dev.javaforge.executor;

import dev.javaforge.executor.sandbox.LocalProcessRunner;
import dev.javaforge.executor.sandbox.SandboxProperties;
import dev.javaforge.executor.service.ExecutionService;
import java.time.Duration;
import java.util.List;

class LocalRunnerTest extends SandboxContract {

    static SandboxProperties props(String mode) {
        return new SandboxProperties(mode, "eclipse-temurin:21-jdk", "docker", Duration.ofSeconds(30), Duration.ofSeconds(3),
                512, 64, 1.0, 128, 65536, 2, 30, List.of("*"));
    }

    private final ExecutionService service = new ExecutionService(new LocalProcessRunner(props("local-unsafe")), props("local-unsafe"));

    @Override
    ExecutionService service() {
        return service;
    }
}
