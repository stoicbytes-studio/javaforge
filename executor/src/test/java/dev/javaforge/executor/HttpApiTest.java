package dev.javaforge.executor;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = {"executor.mode=local-unsafe", "executor.requests-per-minute-per-client=2"})
class HttpApiTest {

    @Value("${local.server.port}")
    int port;

    private final HttpClient http = HttpClient.newBuilder().proxy(HttpClient.Builder.NO_PROXY).build();

    private HttpResponse<String> post(String json) throws Exception {
        return http.send(HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/v1/executions"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json)).build(), HttpResponse.BodyHandlers.ofString());
    }

    @Test
    void healthReportsSandboxAndVersion() throws Exception {
        HttpResponse<String> r = http.send(HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/v1/health")).build(),
                HttpResponse.BodyHandlers.ofString());
        assertThat(r.statusCode()).isEqualTo(200);
        assertThat(r.body()).contains("\"status\":\"UP\"", "\"sandbox\":\"local-unsafe\"");
    }

    @Test
    void executesValidatesAndRateLimits() throws Exception {
        String ok = """
                {"files":[{"name":"Main.java","content":"public class Main { public static void main(String[] a) { System.out.println(\\"hi\\"); } }"}],
                 "mainClass":"Main","testCases":[{"id":"t1","stdin":"","expectedStdout":"hi"}]}""";
        HttpResponse<String> r = post(ok);
        assertThat(r.statusCode()).isEqualTo(200);
        assertThat(r.body()).contains("\"passed\":true");

        HttpResponse<String> badName = post("""
                {"files":[{"name":"../evil.java","content":"x"}],"mainClass":"Main"}""");
        assertThat(badName.statusCode()).isEqualTo(400);
        assertThat(badName.body()).contains("simple Java file name");

        HttpResponse<String> limited = post(ok);
        assertThat(limited.statusCode()).isEqualTo(429);
    }
}
