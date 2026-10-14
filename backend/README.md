# Auctiva Backend Guide

The backend is a Java 21 / Spring Boot 3 modular monolith. It is one deployable
application, organized into business modules under `com.auctiva.backend`.

## What is implemented

- `identity`: registration, login, password hashing, and JWT authentication.
- `catalog`: phone brands and device models.
- `listings`: public listing browse/detail endpoints and authenticated seller create,
	update, and delete operations.
- `common`: API status, error responses, and shared JWT/security configuration.

Packages such as `auctions`, `orders`, `payments`, `escrow`, `ledger`, `search`, and
`tradeins` currently define module boundaries only; they are not implemented features.
The architecture and roadmap are documented in [`../docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md)
and [`../docs/ROADMAP.md`](../docs/ROADMAP.md).

## Run locally

Prerequisites: Java 21 and Docker Compose. From the repository root, start PostgreSQL:

```bash
docker compose -f infra/docker-compose.yml up -d postgres
```

The compose service creates database `auctiva` with local credentials `auctiva` / `auctiva`.
Flyway applies the SQL migrations at application startup. If the Maven wrapper has not
been generated in this checkout, install Maven and generate it once:

```bash
brew install maven
cd backend
mvn -N wrapper:wrapper
```

Then start the API from `backend/`:

```bash
./mvnw spring-boot:run
```

The API listens on `http://localhost:8080`. Check `GET /api/status` for the application
status. Run the automated tests with `./mvnw test` from `backend/`.

Redis, Kafka, and OpenSearch services are available in the compose file for future
modules. The currently implemented endpoints use PostgreSQL; those other services are
not yet backing implemented business workflows.

## Configuration

Defaults are in `src/main/resources/application.yml`. Override these with Spring
environment variables for a different local or deployment environment:

| Setting | Environment variable | Local default |
| --- | --- | --- |
| Database URL | `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/auctiva` |
| Database user | `SPRING_DATASOURCE_USERNAME` | `auctiva` |
| Database password | `SPRING_DATASOURCE_PASSWORD` | `auctiva` |
| JWT signing secret | `AUCTIVA_JWT_SECRET` | Development-only value in config |

Always set a strong, private `AUCTIVA_JWT_SECRET` outside local development. Do not
commit secrets or production credentials.

## API overview

All application routes use the `/api` prefix. Protected routes expect
`Authorization: Bearer <token>`.

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/status` | Public | Basic application status |
| `POST` | `/api/auth/register` | Public | Register a buyer and receive a JWT |
| `POST` | `/api/auth/login` | Public | Authenticate and receive a JWT |
| `GET` | `/api/catalog/brands` | Public | List phone brands |
| `POST` | `/api/catalog/brands` | Admin | Create a brand |
| `GET` | `/api/catalog/device-models` | Public | List models; optional `brandId` filter |
| `POST` | `/api/catalog/device-models` | Admin | Create a device model |
| `GET` | `/api/listings` | Public | Browse active listings; optional model and price filters |
| `GET` | `/api/listings/{id}` | Public | Get a listing |
| `POST` | `/api/listings` | Authenticated | Create a listing for the signed-in user |
| `PATCH` | `/api/listings/{id}` | Owner or admin | Update a listing |
| `DELETE` | `/api/listings/{id}` | Owner or admin | Remove a listing |

New registrations receive the `BUYER` role. Catalog writes require an account with the
`ADMIN` role. See `SecurityConfig` for the authoritative route rules.

### Example requests

Register (the response includes the JWT token):

```bash
curl -X POST http://localhost:8080/api/auth/register \
	-H 'Content-Type: application/json' \
	-d '{"email":"seller@example.com","password":"a-strong-password","fullName":"A Seller"}'
```

Browse public listings, optionally filtering by model and price:

```bash
curl 'http://localhost:8080/api/listings?minPrice=10000&maxPrice=50000'
```

For protected routes, send the returned token as a bearer token:

```bash
curl http://localhost:8080/api/listings \
	-H 'Authorization: Bearer <token>'
```

## Code map and conventions

```text
src/main/java/com/auctiva/backend/
	common/       shared security, API errors, and health/status endpoint
	identity/     users, authentication, JWT response DTOs
	catalog/      brands and device models
	listings/     listing entity, service, repository, controller, and DTOs
	<module>/     package boundary for planned capabilities
src/main/resources/db/migration/  ordered Flyway SQL migrations
src/test/java/                    Spring Boot tests
```

For implemented modules, the request flow is controller -> service -> repository ->
entity/database. Keep domain behavior in the owning module; do not reach into another
module's tables or repositories. Read that module's `package-info.java` before adding
cross-module dependencies. Follow the event/outbox direction in the architecture guide
when other modules need to react to a change.

Flyway migrations are append-only and named `V<number>__description.sql`. Current
migrations create the initial schema, users, catalog tables, and listings.

## Errors and validation

Request records use Jakarta Validation constraints. Invalid request bodies return
`400` with field errors; authentication failures return `401`; permission failures
return `403`; missing resources return `404`. Domain `IllegalArgumentException`
responses currently map to `409`. Error response format is defined in
`common/config/ApiExceptionHandler.java`.
