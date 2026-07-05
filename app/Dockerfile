# Use Eclipse Temurin JDK (same base as the reference project)
FROM eclipse-temurin:21-jdk

# Set working directory
WORKDIR /app

# Copy the JAR file into the container — this assumes `mvn package`
# has already run (see Jenkinsfile: Package stage runs before this).
COPY target/portfolio-0.0.1-SNAPSHOT.jar app.jar

# App port + actuator/management port
EXPOSE 8080
EXPOSE 9090

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
