# OmniRec SDK demo

A small Next.js storefront that demonstrates the real OmniRec v2 SDK integration, a Spring Boot server-only history proxy, and event persistence in Neon PostgreSQL through the existing OmniRec collector.

This repository consumes the SDK and collector from the sibling `../omniRec` repository. It does not copy or modify OmniRec source code.

## What the demo shows

- Automatic page, product, list-impression, and scroll tracking through `OmnirecNextProvider`.
- Typed search, wishlist, cart, quantity, removal, and checkout-start events.
- A fixed fictional customer (`demo_customer_123`) linked to the SDK-owned anonymous identity.
- Browser event batches sent through the same-origin `/omnirec` rewrite.
- Stored customer history fetched through a Spring Boot proxy that keeps the history secret out of the browser.
- Exact stored API data displayed as formatted JSON on `/events`.

No real checkout, payment, order, inventory, recommendation model, or analytics dashboard is included.

## Prerequisites

- Node.js 20 or newer and npm.
- Java 17 or newer and Maven 3.9+.
- Docker Desktop with Docker Compose.
- A Neon PostgreSQL database and its direct connection string with `sslmode=require`.
- The `omniRec` repository beside this repository:

```text
omnirec_demo/
├── omniRec/       # read-only SDK and collector source
└── omnirec_demo/  # this demo
```

## 1. Build the existing SDK

Run these commands from `../omniRec`. They build the actual local v2 packages consumed by the demo:

```powershell
npm install
npm run build -w @omnirec/commerce-web
npm run build -w @omnirec/commerce-react
npm run build -w @omnirec/commerce-node
npm run build -w @omnirec/commerce-next
```

## 2. Install and configure the demo frontend

```powershell
Set-Location ../omnirec_demo/frontend
npm install
Copy-Item .env.local.example .env.local
```

The example contains only a publishable write key and local server URLs. Do not put the Neon URL or history secret in `frontend/.env.local`, and never create a `NEXT_PUBLIC_*` variable for either secret.

## 3. Start OmniRec with Neon storage

Choose a strong local history secret and use the same value for the collector and demo backend. In a new PowerShell terminal, from `../omniRec`:

```powershell
$env:OMNIREC_STORAGE_ENABLED = "true"
$env:OMNIREC_DATABASE_URL = "postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
$env:DEMO_STORE_API_KEY = "pk_test_demo_store"
$env:DEMO_STORE_SECRET_KEY = "replace-with-a-strong-server-only-history-key"
docker compose -f deploy/standard/docker-compose.yml up -d --build
```

This starts the existing Event API on port `8081` with RabbitMQ and Redis. OmniRec runs its storage migrations against Neon automatically. Check readiness with:

```powershell
Invoke-RestMethod http://localhost:8081/actuator/health
```

## 4. Start the history proxy

In a new terminal, from this repository:

```powershell
Set-Location backend
$env:OMNIREC_EVENT_API_URL = "http://localhost:8081"
$env:OMNIREC_HISTORY_SECRET = "replace-with-the-same-server-only-history-key"
mvn spring-boot:run
```

The proxy listens on port `8082`, always requests history for the fixed demo customer, validates cursors, and never connects directly to Neon.

## 5. Start the storefront

In another terminal:

```powershell
Set-Location frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The store remains browsable if the collector is unavailable; tracking and stored-history errors are shown separately.

## Three-minute presenter flow

1. Point out the identity card and the single provider integration in `frontend/app/providers.tsx`.
2. Search for a product, open its detail page, wishlist it, and add it to the cart.
3. Change the quantity or remove an item, then click **Start simulated checkout**.
4. Open **Stored events** and click **Flush & refresh**. Storage is asynchronous, so the first event can take a moment to appear.
5. Show that the JSON comes from `GET /v1/customers/demo_customer_123/events` through the backend proxy.
6. Point out that the browser contains only `pk_test_demo_store`; the history secret and Neon URL remain server-side.

The demo intentionally never emits `purchase_completed`; purchase completion is an authoritative server-side event.

## Verify persistence in Neon

Use the Neon SQL editor after interacting with the store:

```sql
select
  event_type,
  anonymous_id,
  user_id,
  session_id,
  product_id,
  occurred_at,
  stored_at
from omnirec.commerce_events
where tenant_id = 'demo-store'
order by occurred_at desc
limit 50;
```

Verify anonymous-to-customer linking separately:

```sql
select tenant_id, user_id, anonymous_id, linked_at
from omnirec.identity_links
where tenant_id = 'demo-store'
order by linked_at desc;
```

## Verification commands

```powershell
Set-Location frontend
npm run typecheck
npm run build

Set-Location ../backend
mvn test
```

The frontend uses webpack during local development and production builds because npm links the sibling OmniRec packages with Windows junctions. This keeps package resolution in the consumer application without changing the SDK repository.

## Troubleshooting

- **SDK package cannot be resolved:** build all four OmniRec packages in dependency order, then rerun `npm install` in `frontend`.
- **Store works but no requests arrive:** confirm the Event API is healthy on port `8081` and inspect requests to `/omnirec/v1/events/batch`.
- **Stored events page returns 503:** set `OMNIREC_HISTORY_SECRET` for the backend and make it identical to `DEMO_STORE_SECRET_KEY` used by the collector.
- **Events were accepted but history is empty:** wait briefly for RabbitMQ and Neon processing, then use **Flush & refresh** again.
- **Neon connection fails:** use the direct Neon endpoint, retain `sslmode=require`, and ensure the URL is set only on the collector.
- **Port conflict:** override `OMNIREC_PORT`, `SERVER_PORT`, or the frontend port and update the corresponding rewrite target.

## Stop services

Stop the frontend and backend with `Ctrl+C`. From `../omniRec`, stop the collector stack without deleting its volumes:

```powershell
docker compose -f deploy/standard/docker-compose.yml down
```

Real `.env` files are ignored. Only placeholder example files belong in Git.
