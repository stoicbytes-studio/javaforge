package dev.javaforge.executor.api;

import java.time.Clock;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Fixed-window rate limiter per client key (IP address). In-memory, so it
 * applies per instance; put a gateway limiter in front of multi-instance
 * deployments.
 */
public class RateLimiter {

    private record Window(long startMillis, int count) {
    }

    private final int limitPerMinute;
    private final Clock clock;
    private final Map<String, Window> windows = new ConcurrentHashMap<>();

    public RateLimiter(int limitPerMinute, Clock clock) {
        this.limitPerMinute = limitPerMinute;
        this.clock = clock;
    }

    public boolean tryAcquire(String key) {
        long now = clock.millis();
        Window w = windows.compute(key, (k, current) -> {
            if (current == null || now - current.startMillis() >= 60_000) return new Window(now, 1);
            return new Window(current.startMillis(), current.count() + 1);
        });
        if (windows.size() > 10_000) {
            windows.entrySet().removeIf(e -> now - e.getValue().startMillis() >= 60_000);
        }
        return w.count() <= limitPerMinute;
    }
}
