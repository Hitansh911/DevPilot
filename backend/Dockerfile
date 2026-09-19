# Use Maven with Java 22 to build the application
FROM maven:3.9.7-eclipse-temurin-22 AS build
WORKDIR /app

# Copy the pom.xml and download dependencies
COPY pom.xml .
# Download all dependencies for offline use
RUN mvn dependency:go-offline -B

# Copy the source code and build the application
COPY src ./src
RUN mvn clean package -DskipTests

# Use the runtime JDK image
FROM eclipse-temurin:22-jdk
WORKDIR /app

# Copy the built jar from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose the port the app runs on
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
