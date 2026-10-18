package dev.javaforge.executor;

import static org.assertj.core.api.Assertions.assertThat;

import dev.javaforge.executor.api.ExecutionDtos.ExecutionRequest;
import dev.javaforge.executor.api.ExecutionDtos.ExecutionResponse;
import dev.javaforge.executor.api.ExecutionDtos.SourceFile;
import dev.javaforge.executor.api.ExecutionDtos.TestCaseInput;
import dev.javaforge.executor.service.ExecutionService;
import java.util.List;
import org.junit.jupiter.api.Test;

/** Behaviour every sandbox implementation must satisfy. */
abstract class SandboxContract {

    abstract ExecutionService service();

    static ExecutionRequest program(String body, String stdin) {
        return new ExecutionRequest(List.of(new SourceFile("Main.java", body)), "Main", stdin, null);
    }

    static String main(String statements) {
        return "import java.util.*;\npublic class Main {\n  public static void main(String[] args) throws Exception {\n" + statements + "\n  }\n}\n";
    }

    @Test
    void runsAProgramWithStdin() throws Exception {
        ExecutionResponse r = service().execute(program(main("System.out.println(\"sum=\" + (new Scanner(System.in).nextInt() + 1));"), "41\n"));
        assertThat(r.compile().success()).isTrue();
        assertThat(r.run().stdout()).isEqualTo("sum=42\n");
        assertThat(r.run().exitCode()).isZero();
        assertThat(r.run().timedOut()).isFalse();
    }

    @Test
    void reportsCompileErrorsWithLineNumbers() throws Exception {
        ExecutionResponse r = service().execute(program("public class Main {\n  public static void main(String[] a) {\n    int x = 5\n  }\n}\n", ""));
        assertThat(r.compile().success()).isFalse();
        assertThat(r.compile().diagnostics()).anySatisfy(d -> {
            assertThat(d.line()).isEqualTo(3);
            assertThat(d.message()).contains("';' expected");
            assertThat(d.file()).isEqualTo("Main.java");
        });
        assertThat(r.run()).isNull();
    }

    @Test
    void gradesTestCasesIncludingRuntimeFailures() throws Exception {
        String code = main("int n = new Scanner(System.in).nextInt(); if (n < 0) throw new IllegalStateException(\"neg\"); System.out.println(n * 2);");
        var request = new ExecutionRequest(List.of(new SourceFile("Main.java", code)), "Main", null, List.of(
                new TestCaseInput("ok", "2\n", "4"),
                new TestCaseInput("wrong", "3\n", "7"),
                new TestCaseInput("throws", "-1\n", "")));
        ExecutionResponse r = service().execute(request);
        assertThat(r.tests()).extracting(t -> t.id() + ":" + t.passed()).containsExactly("ok:true", "wrong:false", "throws:false");
        assertThat(r.tests().get(2).stderr()).contains("IllegalStateException: neg");
        assertThat(r.tests().get(2).exitCode()).isEqualTo(1);
    }

    @Test
    void killsInfiniteLoops() throws Exception {
        ExecutionResponse r = service().execute(program(main("while (true) { }"), ""));
        assertThat(r.run().timedOut()).isTrue();
        assertThat(r.run().exitCode()).isNull();
    }

    @Test
    void truncatesRunawayOutput() throws Exception {
        ExecutionResponse r = service().execute(program(main("for (int i = 0; i < 200_000; i++) System.out.println(\"spam spam spam spam\");"), ""));
        assertThat(r.run().outputTruncated()).isTrue();
        assertThat(r.run().stdout().length()).isLessThanOrEqualTo(65536);
    }

    @Test
    void enforcesTheHeapLimit() throws Exception {
        ExecutionResponse r = service().execute(program(main("List<long[]> hog = new ArrayList<>(); while (true) hog.add(new long[1_000_000]);"), ""));
        assertThat(r.run().stderr()).contains("OutOfMemoryError");
        assertThat(r.run().exitCode()).isNotZero();
    }
}
