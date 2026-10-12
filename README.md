# Auctiva

A Kenya-first trusted commerce platform for buying, selling, auctioning, and trading in
smartphones — the MVP slice of a broader marketplace + auction + trade-in/refurbishment
vision (see `docs/`).

This repo follows the **modular monolith** strategy from the project spec: one deployable
backend with strict internal module boundaries, rather than microservices from day one.

## Layout

```
Auctiva/
├── backend/   Spring Boot modular monolith (Java) — the API + domain logic
├── web/       Next.js + TypeScript web app
├── mobile/    Flutter app (iOS/Android)
├── infra/     docker-compose for local Postgres/Redis/Kafka/OpenSearch, env templates
└── docs/      Architecture notes, MVP scope, roadmap (source of truth for decisions)
```

## Local prerequisites (macOS)

```bash
brew install openjdk@21 node flutter docker
```

You'll also want VS Code extensions: **Extension Pack for Java**, **Spring Boot Extension
Pack**, **Flutter**, and **ESLint/Prettier**.

## Quickstart

```bash
# 1. Start local infra (Postgres, Redis, Kafka, OpenSearch)
cd infra && cp .env.example .env && docker compose up -d

# 2. Run the backend
cd ../backend && ./mvnw spring-boot:run   # (run `mvn wrapper:wrapper` once first — see backend/README.md)

# 3. Run the web app
cd ../web && npm install && npm run dev

# 4. Run the mobile app
cd ../mobile && flutter pub get && flutter run
```

Open the whole thing in VS Code with:

```bash
code /path/to/Auctiva
```

## Status

This is Phase 1 scaffolding only — module boundaries and placeholder health endpoints,
no business logic yet. See `docs/ROADMAP.md` for what comes next and in what order, and
`docs/MVP_SCOPE.md` for what is explicitly *in* vs *out* of the first build.
# Auctiva
