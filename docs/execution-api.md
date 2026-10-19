# Java execution API

The app never runs Java itself. Coding challenges, the playground and Bug Hunter
send source code to a separately deployed Spring Boot service in `executor/`.
That service never runs learner code in its own process either: in production
it starts one locked-down, throwaway container per request.

If no executor is configured (or it is unreachable), the app switches to
**simulation mode**: it says so on screen, runs only static checks, and records
self-assessed results as *unverified* so they never count as demonstrated coding
mastery.

## Endpoints

### `GET /api/v1/health`

```json
{ "status": "UP", "javaVersion": "21.0.8", "sandbox": "docker" }
```

Returns `503` when the sandbox cannot start a JVM (for example the Docker
daemon is unavailable).

### `POST /api/v1/executions`

Request:

```json
{
  "files": [{ "name": "Main.java", "content": "public class Main { ... }" }],
  "mainClass": "Main",
  "stdin": "optional input for a single run",
  "testCases": [{ "id": "t1", "stdin": "3\n", "expectedStdout": "6\n" }]
}
```

- `files`: 1–8 files with simple names (`[A-Za-z_][A-Za-z0-9_]*.java`), each up to 64 KiB.
- `mainClass`: a simple class name in the default package.
- Either a single run (`stdin`) or up to 20 `testCases`. With test cases, each
  case runs in the same sandbox in sequence and is compared after normalising
  line endings and trailing whitespace.

Response for a single run (`tests` is `null`):

```json
{
  "compile": { "success": true, "diagnostics": [], "timeMs": 812 },
  "run": { "stdout": "...", "stderr": "", "exitCode": 0, "timeMs": 95, "timedOut": false, "outputTruncated": false },
  "tests": null
}
```

With `testCases`, `run` is `null` and `tests` holds one result per case. A case
passes only if the program exits with 0, does not time out or truncate output,
and its stdout matches:

```json
{ "id": "t1", "passed": true, "stdout": "6\n", "stderr": "", "exitCode": 0, "timeMs": 80, "timedOut": false, "outputTruncated": false }
```

`diagnostics` are parsed from `javac` output: `{ file, line, column, severity, message }`.
When compilation fails, both `run` and `tests` are `null`.

Errors use `{ "error": "...", "message": "..." }`:

- `400 invalid_request` — validation failed or malformed JSON
- `429 rate_limited` / `429 busy` — per-client rate limit or all sandbox slots in use
- `503 sandbox_unavailable` — the sandbox could not be started

## Sandbox (docker mode)

Each request gets a new container from `EXECUTOR_IMAGE` (default
`eclipse-temurin:21-jdk`) with:

- `--network none` — no network access at all
- `--read-only` root filesystem; sources mounted read-only; size-limited
  `tmpfs` for `/tmp` and compiled classes
- `--memory 512m --memory-swap 512m`, `--cpus 1`, `--pids-limit 128` (stops fork bombs)
- `--cap-drop ALL`, `--security-opt no-new-privileges`, unprivileged user `65534`
- compile timeout 20 s, run timeout 5 s per run (killed with `SIGKILL`),
  JVM heap capped at 128 MB, output capped at 64 KiB per stream
- the container is removed after the request, whatever the outcome

The service limits concurrency (`EXECUTOR_MAX_CONCURRENT`, default 4) and
requests per client per minute (`EXECUTOR_RATE_LIMIT`, default 30), and
restricts CORS to `EXECUTOR_ALLOWED_ORIGINS` (set this to your app's origin
in production).

### Deployment notes

- The API needs a Docker daemon. Do **not** mount the host's Docker socket
  into an internet-facing container on a shared host: anyone who compromises
  the API process controls the daemon. Prefer a dedicated VM or worker host
  whose only job is running sandboxes, or a rootless Docker daemon, or a
  hardened runtime such as gVisor (`--runtime runsc`) for stronger isolation.
- Put the API behind TLS and a reverse proxy; keep the rate limits on.
- `EXECUTOR_MODE=local-unsafe` runs code as a plain child process with only
  timeouts and output limits. It exists for local development and tests and
  must never be exposed publicly.

## Running locally

```bash
cd executor
mvn spring-boot:run                          # docker mode: needs a Docker daemon
EXECUTOR_MODE=local-unsafe mvn spring-boot:run   # no Docker; trusted code only
mvn test                                     # Docker tests are skipped when no daemon is available
```

Point the app at it with `EXPO_PUBLIC_EXECUTOR_URL=http://localhost:8080` (or
in Settings → Code execution). To check the service grades content exactly like
a local JDK: `npm run verify:java -- --executor http://localhost:8080`.
