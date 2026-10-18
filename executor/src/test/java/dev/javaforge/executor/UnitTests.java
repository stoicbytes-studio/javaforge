package dev.javaforge.executor;

import static org.assertj.core.api.Assertions.assertThat;

import dev.javaforge.executor.api.ExecutionDtos.Diagnostic;
import dev.javaforge.executor.api.RateLimiter;
import dev.javaforge.executor.service.JavacDiagnostics;
import dev.javaforge.executor.service.OutputComparator;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import org.junit.jupiter.api.Test;

class UnitTests {

    @Test
    void parsesJavacErrorsWithColumnsAndDetails() {
        String out = """
                /src/Main.java:4: error: ';' expected
                        int x = 5
                                 ^
                /src/Main.java:7: error: cannot find symbol
                        foo();
                        ^
                  symbol:   method foo()
                  location: class Main
                2 errors
                """;
        List<Diagnostic> d = JavacDiagnostics.parse(out);
        assertThat(d).hasSize(2);
        assertThat(d.get(0)).isEqualTo(new Diagnostic("Main.java", 4, 18, "error", "';' expected"));
        assertThat(d.get(1).line()).isEqualTo(7);
        assertThat(d.get(1).message()).isEqualTo("cannot find symbol; symbol:   method foo(); location: class Main");
    }

    @Test
    void unparseableOutputBecomesSingleDiagnostic() {
        assertThat(JavacDiagnostics.parse("error: file not found: X.java")).singleElement()
                .extracting(Diagnostic::message).isEqualTo("error: file not found: X.java");
        assertThat(JavacDiagnostics.parse("")).isEmpty();
    }

    @Test
    void comparesOutputIgnoringTrailingWhitespace() {
        assertThat(OutputComparator.matches("a  \r\nb\n\n", "a\nb")).isTrue();
        assertThat(OutputComparator.matches(" a", "a")).isFalse();
        assertThat(OutputComparator.matches("a\n\nb", "a\nb")).isFalse();
    }

    @Test
    void rateLimiterAllowsBurstThenBlocksUntilWindowResets() {
        MutableClock clock = new MutableClock();
        RateLimiter limiter = new RateLimiter(2, clock);
        assertThat(limiter.tryAcquire("ip")).isTrue();
        assertThat(limiter.tryAcquire("ip")).isTrue();
        assertThat(limiter.tryAcquire("ip")).isFalse();
        assertThat(limiter.tryAcquire("other")).isTrue();
        clock.advance(60_000);
        assertThat(limiter.tryAcquire("ip")).isTrue();
    }

    static final class MutableClock extends Clock {
        private long millis = 1_000_000;

        void advance(long ms) {
            millis += ms;
        }

        @Override
        public ZoneOffset getZone() {
            return ZoneOffset.UTC;
        }

        @Override
        public Clock withZone(java.time.ZoneId zone) {
            return this;
        }

        @Override
        public Instant instant() {
            return Instant.ofEpochMilli(millis);
        }
    }
}
