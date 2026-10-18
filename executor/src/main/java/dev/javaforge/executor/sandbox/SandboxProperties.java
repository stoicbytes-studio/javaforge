package dev.javaforge.executor.sandbox;

import java.time.Duration;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/** Configuration under the {@code executor.*} prefix (see application.yml). */
@ConfigurationProperties("executor")
public record SandboxProperties(
        @DefaultValue("docker") String mode,
        @DefaultValue("eclipse-temurin:21-jdk") String image,
        @DefaultValue("docker") String dockerBinary,
        @DefaultValue("20s") Duration compileTimeout,
        @DefaultValue("5s") Duration runTimeout,
        @DefaultValue("512") int containerMemoryMb,
        @DefaultValue("128") int heapMb,
        @DefaultValue("1.0") double cpus,
        @DefaultValue("128") int pidsLimit,
        @DefaultValue("65536") int maxOutputBytes,
        @DefaultValue("4") int maxConcurrentExecutions,
        @DefaultValue("30") int requestsPerMinutePerClient,
        @DefaultValue("*") List<String> allowedOrigins) {

    public boolean isDocker() {
        return "docker".equalsIgnoreCase(mode);
    }
}
