# OmniRec SDK Demo — Implementation Plan

## 1. Goal

Build a small static ecommerce application that demonstrates how an existing Next.js project can add the already-built OmniRec SDK with only a few integration lines, track meaningful customer interactions, persist those events in Neon PostgreSQL through the existing OmniRec collector, and display the stored events as formatted JSON.

This repository is a consumer of OmniRec. It must not copy or reimplement the SDK or the OmniRec event collector.

The demonstration story is:

1. A visitor opens and uses a small static store.
2. `@omnirec/commerce-next` automatically tracks routes and declared HTML interactions.
3. A few typed `track()` calls record interactions that require application state, such as search and cart changes.
4. The existing OmniRec Spring Boot Event API validates and accepts the events.
5. OmniRec asynchronously stores the events in Neon PostgreSQL.
6. A small Spring Boot demo API reads the fixed demo customer's history with a server-only key.
7. The Next.js events page displays the exact stored history response as readable JSON.

## 2. Scope

### Included

- A polished but small static ecommerce store built with Next.js App Router and TypeScript.
- Static product data; no product database or product administration.
- Home/catalog page, product-detail route, local cart interaction, and stored-events route.
- Existing local OmniRec packages linked from `../omniRec` during development.
- Automatic page, home-page, scroll-depth, product-view, product-exit, and impression tracking where the SDK supports it.
- Explicit typed events for search, wishlist, cart, and checkout interactions.
- A fixed fictional demo customer so stored history can be queried safely and consistently.
- Existing OmniRec Event API, RabbitMQ pipeline, and Neon event storage.
- A small Spring Boot demo backend that acts only as a secure history proxy.
- A JSON viewer with refresh, loading, empty, processing, and error states.
- Setup documentation and a short presenter script.

### Excluded

- Recommendations, recommendation UI, recommendation providers, or recommendation events.
- Search/recommendation serving APIs.
- A new tracker SDK or a copy of OmniRec source inside this repository.
- Real authentication, payments, orders, inventory, shipping, CMS, or customer accounts.
- A custom analytics dashboard, charts, funnels, or tenant-wide reporting.
- Direct browser access to Neon or the OmniRec history API.
- Capturing passwords, addresses, card data, arbitrary form values, or unnecessary personal information.

## 3. Repositories and ownership

```text
D:/omnirec_demo/
├── omniRec/                    # Existing SDK + Spring Boot collector; treated as read-only
└── omnirec_demo/               # Demo repository; all new implementation goes here
    ├── frontend/               # Next.js static store and JSON viewer
    ├── backend/                # Spring Boot server-only history proxy
    ├── docker-compose.yml      # Demo orchestration, if useful
    ├── .env.example            # Placeholder values only
    ├── README.md               # Setup and presenter instructions
    └── IMPLEMENTATION_PLAN.md
```

No SDK source will be placed under `omnirec_demo`. The demo must import the actual package name:

```tsx
import { OmnirecNextProvider } from "@omnirec/commerce-next";
```

During local development, build the existing SDK in `../omniRec` and link its packages into the demo. The demo should directly link the matching `2.0.0` local packages needed by `commerce-next` so npm does not accidentally download a different version. The final README must document the exact build/link commands. If the packages are later published, only the dependency declarations should change; application integration code should remain the same.

## 4. Architecture

```text
Next.js store (browser, :3000)
  |  publishable write key
  |  POST /omnirec/v1/events/batch
  v
Next.js same-origin rewrite
  v
Existing OmniRec Event API (Spring Boot, :8081)
  |  validate, normalize, deduplicate, resolve identity
  v
RabbitMQ
  v
OmniRec event-storage worker
  v
Neon PostgreSQL

Next.js /events page
  |  GET /demo-api/events (no secret in browser)
  v
Demo Spring Boot API (:8082)
  |  Authorization: Bearer <server-only history secret>
  v
OmniRec GET /v1/customers/demo_customer_123/events
```

The demo backend does not connect to Neon. It uses OmniRec's supported customer-history API, proving that storage and retrieval work through the platform boundary.

## 5. Minimal SDK integration to highlight

The README and the UI should visibly show that the global Next.js integration is essentially one provider:

```tsx
<OmnirecNextProvider
  endpoint="/omnirec"
  apiKey={process.env.NEXT_PUBLIC_OMNIREC_API_KEY}
>
  {children}
</OmnirecNextProvider>
```

The provider already enables App Router page tracking, HTML attributes, impressions, and autocapture. Product markup can declare context without custom tracking handlers:

```tsx
<main
  data-omnirec-page="product"
  data-omnirec-product={product.id}
  data-omnirec-price={product.price}
  data-omnirec-currency="USD"
>
```

Application-state interactions use the typed SDK API only when necessary:

```tsx
const track = useTrack();
track("search_performed", { search: { query, resultCount } });
```

The demo must not create wrapper tracking functions that make the integration appear smaller than it really is.

## 6. Demo experience

### Routes

| Route | Purpose | Main events |
| --- | --- | --- |
| `/` | Brand hero, search/filter, static product grid, local cart summary | `page_viewed`, `home_page_viewed`, `product_list_viewed`, `product_clicked`, `search_performed`, `product_added_to_cart` |
| `/products/[slug]` | Product details and interaction buttons | `page_viewed`, `product_viewed`, `product_page_exited`, `product_wishlisted`, `product_added_to_cart` |
| `/events` | Stored customer events rendered as JSON | The route itself can be excluded from business tracking; reads stored history only |

### Store content

- Six static products in one typed data module.
- Local product images or simple local placeholders; no remote image dependency.
- Product name, category, price, short description, and stable product ID.
- Search/filter that operates entirely in the browser.
- Small cart state stored in React context and `localStorage` with a stable demo cart ID.
- Simulated checkout-start action only; no payment form and no fake purchase-completed event.
- Responsive layout and visible keyboard focus states.

### Identity behavior

Use a fixed fictional ID such as `demo_customer_123` for this public demo. A small client initializer calls `identify("demo_customer_123")` once after the provider is available. This creates the identity link required by the customer-history API and allows earlier anonymous activity from the same browser to appear in the stored journey.

Display shortened `anonymousId`, `sessionId`, and the fixed `userId` in a compact identity card. Do not invent a second identity/session system.

## 7. Tracking plan

| Interaction | OmniRec event | Implementation |
| --- | --- | --- |
| Open or navigate a page | `page_viewed` | `OmnirecNextProvider` route tracking |
| Open home | `home_page_viewed` | Provider `homePath` behavior |
| Scroll storefront | `scroll_depth_reached` | Default autocapture |
| Product grid becomes visible | `product_list_viewed` | OmniRec list/impression attributes or `TrackList` |
| Click a product card | `product_clicked` | Inherited HTML attributes or `TrackList` |
| Open product detail | `product_viewed` | Product-page attributes or `TrackProduct` |
| Leave product detail | `product_page_exited` | SDK product view lifecycle |
| Submit search | `search_performed` | One typed `track()` call on submit; never per keystroke |
| Click wishlist | `product_wishlisted` | `data-omnirec="wishlist"` under product context |
| Add product to cart | `product_added_to_cart` | HTML attribute or typed call with product quantity and cart ID |
| Remove cart item | `product_removed_from_cart` | Typed call with product and cart context |
| Change quantity | `cart_quantity_updated` | Typed call with previous/new quantity |
| Start simulated checkout | `checkout_started` | Typed call with stable cart ID |
| Attach demo identity | `identify` | One initializer call for the fixed fictional customer |

Rules:

- Use the v2 API (`OmnirecNextProvider`, `useTrack`, HTML attributes); do not use deprecated `CommerceProvider` helpers.
- Do not track the same action with both an attribute and a manual call.
- Let OmniRec generate `eventId`, `anonymousId`, `sessionId`, timestamp, URL, device, and campaign context.
- Keep `maxWaitMs` low enough for a responsive demo, or call `flush()` before refreshing stored events.
- Clearly label ingestion as asynchronous: an accepted browser event may need a short delay before it appears in Neon/history.
- Never emit `purchase_completed` from the demo browser; the SDK documentation correctly treats purchases as server-owned facts.

## 8. Stored-event JSON viewer

The `/events` page is deliberately simple. It demonstrates persistence, not a separate analytics product.

Required behavior:

- A **Refresh stored events** button first requests an SDK flush, then queries the demo backend after a short bounded delay.
- Optional polling every two seconds for a short period after refresh, then stop.
- Display the complete safe history response using formatted JSON (`JSON.stringify(value, null, 2)`).
- Show event count, last refreshed time, and whether the response came from stored history.
- Provide clear states: loading, no stored events yet, collector/history unavailable, and success.
- Preserve `nextCursor` and optionally offer **Load older events** without altering the raw response shape.
- Do not merge locally captured events into the stored JSON. The page must only label events as stored after the history API returns them.
- Do not expose authorization headers, the history secret, database URL, or Neon credentials.

## 9. Demo Spring Boot backend

Create a minimal Spring Boot application on port `8082`. Its single responsibility is protecting the history read credential.

### Endpoint

```text
GET /api/events?cursor=<optional>
```

Behavior:

- Always query the fixed customer `demo_customer_123`; do not accept a customer ID from the browser.
- Call `{OMNIREC_EVENT_API_URL}/v1/customers/demo_customer_123/events?limit=100`.
- Forward only a validated opaque cursor when present.
- Send `Authorization: Bearer ${OMNIREC_HISTORY_SECRET}` server-to-server.
- Apply a bounded connect/read timeout.
- Pass through the safe JSON response and a useful status code.
- Return generic `503`/`502` messages when configuration or the collector is unavailable; never echo secrets or raw connection details.
- Use the Next.js rewrite `/demo-api/:path* -> http://localhost:8082/api/:path*` to keep browser calls same-origin.

Use Java 21 and a current Spring Boot 3 release compatible with the workspace's installed JDK. Prefer Spring's built-in HTTP client and Jackson; avoid adding database dependencies because this backend must not query Neon directly.

## 10. Neon and existing OmniRec collector configuration

The existing collector in `../omniRec` already supports Neon through its PostgreSQL storage provider. No Neon-specific application code is required.

Required server-side configuration:

```dotenv
OMNIREC_STORAGE_ENABLED=true
OMNIREC_STORAGE_PROVIDER=postgres
OMNIREC_DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
DEMO_STORE_API_KEY=pk_test_demo_store
DEMO_STORE_SECRET_KEY=<strong-server-only-history-key>
```

The browser receives only:

```dotenv
NEXT_PUBLIC_OMNIREC_API_KEY=pk_test_demo_store
```

The demo Spring Boot backend receives:

```dotenv
OMNIREC_EVENT_API_URL=http://localhost:8081
OMNIREC_HISTORY_SECRET=<same-server-only-history-key>
```

Rules:

- Use a Neon direct endpoint and keep `sslmode=require`.
- Never use `NEXT_PUBLIC_` for the history secret or Neon URL.
- Commit only placeholder `.env.example` files.
- Keep real `.env` files ignored.
- Start RabbitMQ because OmniRec storage is asynchronous through its event-storage queue.
- Flyway migrations in OmniRec create the storage schema automatically.

Optional presenter verification in the Neon SQL editor:

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

## 11. Suggested files

```text
omnirec_demo/
├── frontend/
│   ├── app/
│   │   ├── events/page.tsx
│   │   ├── products/[slug]/page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── providers.tsx
│   ├── components/
│   │   ├── CartProvider.tsx
│   │   ├── DemoIdentity.tsx
│   │   ├── EventJsonViewer.tsx
│   │   ├── Header.tsx
│   │   ├── ProductCard.tsx
│   │   └── ProductGrid.tsx
│   ├── data/products.ts
│   ├── lib/demo.ts
│   ├── public/products/
│   ├── .env.local.example
│   ├── next.config.mjs
│   ├── package.json
│   └── tsconfig.json
├── backend/
│   ├── pom.xml
│   └── src/
│       ├── main/java/.../DemoApplication.java
│       ├── main/java/.../events/EventHistoryClient.java
│       ├── main/java/.../events/EventHistoryController.java
│       ├── main/java/.../events/EventHistoryProperties.java
│       ├── main/resources/application.yml
│       └── test/java/.../events/EventHistoryControllerTest.java
├── .env.example
├── .gitignore
├── docker-compose.yml
├── IMPLEMENTATION_PLAN.md
└── README.md
```

## 12. Implementation phases

### Phase 1 — Project foundation

- Create the Next.js and Spring Boot projects inside this demo repository.
- Configure local OmniRec package linking without editing the SDK repository.
- Add same-origin rewrites for `/omnirec` and `/demo-api`.
- Add environment examples and secret-safe ignore rules.

Exit check: both demo applications start, the SDK package resolves, and no secret is present in the browser bundle.

### Phase 2 — Static store

- Add product data, local images, responsive layout, product grid, product route, search/filter, and local cart state.
- Keep the store usable without the collector so UI work and tracking failures are clearly separated.

Exit check: all three routes work, product navigation and cart actions behave correctly, and no recommendation functionality exists.

### Phase 3 — OmniRec instrumentation

- Add the single root `OmnirecNextProvider`.
- Add product/list HTML context and the minimum typed tracking calls.
- Add fixed demo identification and the identity display.
- Confirm no action is double tracked under React Strict Mode.

Exit check: browser network requests go through `/omnirec/v1/events/batch`, use only the publishable key, and contain the expected v2 events once.

### Phase 4 — Neon persistence

- Configure the existing OmniRec Event API with RabbitMQ, Neon storage, write key, and separate history secret.
- Start the existing collector and allow its Flyway migrations to run.
- Track an event and verify it in `omnirec.commerce_events`.
- Confirm the `identify` event creates/updates `omnirec.identity_links`.

Exit check: a stored event and identity link are visible in Neon.

### Phase 5 — Stored JSON viewer

- Implement the Spring Boot history proxy and its tests.
- Implement `/events` with flush, refresh/polling, errors, raw formatted JSON, and pagination support.
- Clearly distinguish queued/processing from stored events.

Exit check: an interaction performed in the store appears on `/events` only after it is returned from OmniRec's history API.

### Phase 6 — Verification and presentation hardening

- Add frontend tests for important interactions and the JSON viewer states.
- Add a browser smoke test covering browse, product view, wishlist, cart, identify, flush, and stored-history display.
- Test reload identity persistence, delayed Neon wake-up, collector failure, empty history, mobile layout, keyboard navigation, and duplicate prevention.
- Write a clean-start README and a three-minute presenter script.

Exit check: a new developer can follow the README and complete the demonstration without reading OmniRec source code.

## 13. Test matrix

| Area | Assertions |
| --- | --- |
| SDK integration | Uses real `@omnirec/commerce-next` v2 package; provider initializes once; local packages match version `2.0.0` |
| Tracking | Correct event names and required fields; one user action produces one business event |
| Automatic capture | Route, home, product lifecycle, impression, and scroll events are produced by the SDK |
| Identity | Anonymous/session IDs persist as designed; fixed demo customer is linked; earlier anonymous events appear in history |
| Transport | Requests use `/v1/events/batch`; flush works; retry does not break the store UI |
| Storage | Accepted events reach Neon asynchronously; duplicate event IDs store once |
| JSON viewer | Displays only history API results; loading/empty/error/pagination states work |
| Security | Browser has only publishable key; history/Neon secrets remain server-side; backend permits only fixed demo customer |
| Privacy | No form contents, payment data, addresses, credentials, or sensitive query values are collected/displayed |
| UX | Responsive, keyboard usable, readable formatted JSON, clear delayed-processing message |

## 14. Presenter script (about 3 minutes)

1. Show the provider and explain that it is the global integration.
2. Open the store and point out the SDK-owned anonymous/session identity plus the fictional demo customer.
3. Search, open a product, wishlist it, add it to the cart, and start checkout.
4. Briefly show that the SDK batches events to `/omnirec/v1/events/batch` rather than sending provider/database credentials.
5. Open **Stored events**, click refresh, and explain the short asynchronous storage delay if needed.
6. Expand/read the formatted JSON and point out event type, product data, identity, context, occurrence time, and receive time.
7. Optionally run the Neon verification query to prove the same interactions are persisted.
8. Finish by showing that recommendations and analytics are not part of this demo: it proves simple, secure interaction collection and storage.

## 15. Definition of done

- Next.js static store and Spring Boot history proxy exist only in `omnirec_demo`.
- The demo consumes the existing SDK from `../omniRec`; no tracker code is duplicated.
- The root provider and concise markup/manual calls demonstrate the real integration surface.
- The planned customer interactions are captured once with v2 event payloads.
- Existing OmniRec Event API persists those events to Neon through RabbitMQ.
- The fixed demo customer history is retrieved server-to-server and shown as formatted JSON.
- No recommendation code or recommendation claims remain.
- No Neon URL, history key, or other secret is exposed to client code or committed files.
- Tests and documented clean-start steps pass.
- No commit or push is performed by the implementation agent unless the user explicitly requests it later.
