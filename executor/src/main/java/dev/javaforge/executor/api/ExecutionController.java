package dev.javaforge.executor.api;

import dev.javaforge.executor.api.ExecutionDtos.ErrorResponse;
import dev.javaforge.executor.api.ExecutionDtos.ExecutionRequest;
import dev.javaforge.executor.api.ExecutionDtos.ExecutionResponse;
import dev.javaforge.executor.api.ExecutionDtos.HealthResponse;
import dev.javaforge.executor.sandbox.SandboxRunner;
import dev.javaforge.executor.sandbox.SandboxRunner.SandboxException;
import dev.javaforge.executor.service.ExecutionService;
import dev.javaforge.executor.service.ExecutionService.BusyException;
import dev.javaforge.executor.service.ExecutionService.InvalidRequestException;
import jakarta.validation.Valid;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class ExecutionController {

    private static final Logger log = LoggerFactory.getLogger(ExecutionController.class);

    private final ExecutionService service;
    private final SandboxRunner runner;
    public ExecutionController(ExecutionService service, SandboxRunner runner) {
        this.service = service;
        this.runner = runner;
    }

    @GetMapping("/health")
    public ResponseEntity<HealthResponse> health() {
        String version = runner.javaVersion();
        HealthResponse body = new HealthResponse(version == null ? "DOWN" : "UP", version, runner.name());
        return ResponseEntity.status(version == null ? HttpStatus.SERVICE_UNAVAILABLE : HttpStatus.OK).body(body);
    }

    @PostMapping("/executions")
    public ResponseEntity<ExecutionResponse> execute(@Valid @RequestBody ExecutionRequest request) throws SandboxException {
        // Rate limiting happens earlier, in RateLimitInterceptor, so invalid requests count too.
        ExecutionResponse response = service.execute(request);
        return ResponseEntity.ok(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ErrorResponse> invalid(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(f -> f.getField() + " " + f.getDefaultMessage())
                .collect(Collectors.joining("; "));
        return ResponseEntity.badRequest().body(new ErrorResponse("invalid_request", message));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    ResponseEntity<ErrorResponse> unreadable(HttpMessageNotReadableException e) {
        return ResponseEntity.badRequest().body(new ErrorResponse("invalid_request", "Malformed JSON request body."));
    }

    @ExceptionHandler(InvalidRequestException.class)
    ResponseEntity<ErrorResponse> semantic(InvalidRequestException e) {
        return ResponseEntity.badRequest().body(new ErrorResponse("invalid_request", e.getMessage()));
    }

    @ExceptionHandler(BusyException.class)
    ResponseEntity<ErrorResponse> busy(BusyException e) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(new ErrorResponse("busy", e.getMessage()));
    }

    @ExceptionHandler(SandboxException.class)
    ResponseEntity<ErrorResponse> sandbox(SandboxException e) {
        log.error("Sandbox failure", e);
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(new ErrorResponse("sandbox_unavailable", "The code sandbox is temporarily unavailable."));
    }
}
