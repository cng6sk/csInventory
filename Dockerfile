# ======= Build stage =======
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app
COPY pom.xml .
# 复制自定义 maven settings（镜像源/超时）
COPY maven/settings.xml /root/.m2/settings.xml
RUN mvn -q -e -DskipTests dependency:go-offline -s /root/.m2/settings.xml
COPY src ./src
RUN mvn -q -DskipTests package -s /root/.m2/settings.xml

# ======= Run stage =======
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
ENV JAVA_OPTS=""
EXPOSE 9090
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"] 