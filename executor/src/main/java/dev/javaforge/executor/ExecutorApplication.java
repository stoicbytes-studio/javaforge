package dev.javaforge.executor;

import dev.javaforge.executor.api.RateLimitInterceptor;
import dev.javaforge.executor.api.RateLimiter;
import dev.javaforge.executor.sandbox.DockerSandboxRunner;
import dev.javaforge.executor.sandbox.LocalProcessRunner;
import dev.javaforge.executor.sandbox.SandboxProperties;
import dev.javaforge.executor.sandbox.SandboxRunner;
import dev.javaforge.executor.service.ExecutionService;
import java.time.Clock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication
@EnableConfigurationProperties(SandboxProperties.class)
public class ExecutorApplication {

    private static final Logger log = LoggerFactory.getLogger(ExecutorApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(ExecutorApplication.class, args);
    }

    @Bean
    SandboxRunner sandboxRunner(SandboxProperties props) {
        if (props.isDocker()) return new DockerSandboxRunner(props);
        if ("local-unsafe".equalsIgnoreCase(props.mode())) {
            log.warn("""
                    *****************************************************************
                    executor.mode=local-unsafe: learner code runs as a plain child
                    process WITHOUT isolation. Use only for local development.
                    *****************************************************************""");
            return new LocalProcessRunner(props);
        }
        throw new IllegalStateException("Unknown executor.mode '" + props.mode() + "' (use docker or local-unsafe)");
    }

    @Bean
    ExecutionService executionService(SandboxRunner runner, SandboxProperties props) {
        return new ExecutionService(runner, props);
    }

    @Bean
    RateLimiter rateLimiter(SandboxProperties props) {
        return new RateLimiter(props.requestsPerMinutePerClient(), Clock.systemUTC());
    }

    @Bean
    WebMvcConfigurer webConfig(SandboxProperties props, RateLimiter rateLimiter) {
        return new WebMvcConfigurer() {
            @Override
            public void addInterceptors(InterceptorRegistry registry) {
                registry.addInterceptor(new RateLimitInterceptor(rateLimiter)).addPathPatterns("/api/v1/executions");
            }

            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins(props.allowedOrigins().toArray(String[]::new))
                        .allowedMethods("GET", "POST")
                        .maxAge(3600);
            }
        };
    }
}
