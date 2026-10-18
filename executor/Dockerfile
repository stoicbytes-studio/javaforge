# Build
FROM eclipse-temurin:21-jdk AS build
WORKDIR /build
COPY pom.xml .
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 \
    apt-get update && apt-get install -y --no-install-recommends maven && \
    mvn -B -q -DskipTests package

# Runtime: the API itself never runs learner code. In docker mode it starts
# one locked-down sandbox container per request through the Docker CLI, so
# it needs the docker client and access to a Docker daemon (see README).
FROM eclipse-temurin:21-jre
RUN apt-get update && apt-get install -y --no-install-recommends docker.io && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /build/target/javaforge-executor-*.jar app.jar
ENV EXECUTOR_MODE=docker
EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "/app/app.jar"]
