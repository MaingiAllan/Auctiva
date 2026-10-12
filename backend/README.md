# Auctiva Backend

Spring Boot 3 / Java 21 modular monolith.

## First-time setup

```bash
# generate the Maven wrapper (requires Maven installed once, locally)
brew install maven
mvn -N wrapper:wrapper

# create the local database (or let infra/docker-compose.yml do it)
createdb auctiva
```

## Run

```bash
./mvnw spring-boot:run
```

Then check `GET http://localhost:8080/api/status`.

## Module boundaries

See `/docs/ARCHITECTURE.md` at the repo root. Every top-level package under
`com.auctiva.backend` is a module with a `package-info.java` describing its
responsibility — read those before adding code to a module you didn't create.
