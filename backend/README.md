# OmniRec Demo History API

This Spring Boot application is the server-side boundary for the demo's stored-event viewer. It reads one fixed fictional customer's stored history from the existing OmniRec Event API and never connects directly to Neon.

## Configuration

Set these environment variables before starting the application:

| Variable | Default | Purpose |
| --- | --- | --- |
| `OMNIREC_EVENT_API_URL` | `http://localhost:8081` | Existing OmniRec Event API base URL |
| `OMNIREC_HISTORY_SECRET` | none | Server-only tenant history key |
| `SERVER_PORT` | `8082` | Demo backend port |

The customer is intentionally fixed as `demo_customer_123`. The browser cannot select another customer and never receives the history secret.

## Run

```powershell
$env:OMNIREC_HISTORY_SECRET = "your-server-only-history-key"
mvn spring-boot:run
```

Then request:

```text
GET http://localhost:8082/api/events
GET http://localhost:8082/api/events?cursor=<nextCursor>
```

## Test

```powershell
mvn test
```

