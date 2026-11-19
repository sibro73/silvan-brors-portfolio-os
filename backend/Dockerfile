# syntax=docker/dockerfile:1

# --- Build -------------------------------------------------------------------
FROM eclipse-temurin:21-jdk-noble AS build
WORKDIR /workspace

# Dependencies first, so they stay cached while only the code changes.
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -B -q dependency:go-offline

COPY src/ src/
RUN ./mvnw -B -q package -DskipTests \
 && cp target/portfolio-*.jar app.jar

# --- Run ---------------------------------------------------------------------
FROM eclipse-temurin:21-jre-noble

# curl only for the healthcheck
RUN apt-get update \
 && apt-get install -y --no-install-recommends curl \
 && apt-get clean \
 && useradd --system --uid 10001 --home-dir /app app

WORKDIR /app
COPY --from=build --chown=app:app /workspace/app.jar app.jar
USER app

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD curl -fsS http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "/app/app.jar"]
