"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useOmnirec } from "@omnirec/commerce-next";

type StoredEvent = {
  eventId?: string;
  event?: string;
  eventType?: string;
  productId?: string;
  occurredAt?: string;
  data?: { product?: { id?: string } };
};

type HistoryResponse = {
  customerId?: string;
  events?: StoredEvent[];
  nextCursor?: string;
};

type ViewerState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: HistoryResponse; refreshedAt: Date };

const wait = (milliseconds: number) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

export function EventJsonViewer() {
  const omnirec = useOmnirec();
  const [state, setState] = useState<ViewerState>({ status: "loading" });
  const [syncing, setSyncing] = useState(false);

  const loadEvents = useCallback(async (cursor?: string) => {
    setState((current) => current.status === "success" ? current : { status: "loading" });
    try {
      const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
      const response = await fetch(`/demo-api/events${query}`, { cache: "no-store" });
      const body = await response.json().catch(() => null) as HistoryResponse | { message?: string } | null;
      if (!response.ok) {
        throw new Error(body && "message" in body && body.message
          ? body.message
          : "Stored events could not be loaded.");
      }
      setState({ status: "success", data: body as HistoryResponse, refreshedAt: new Date() });
    } catch (error) {
      setState({
        status: "error",
        message: error instanceof Error ? error.message : "Stored events could not be loaded.",
      });
    }
  }, []);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  const syncAndRefresh = async () => {
    setSyncing(true);
    try {
      await omnirec?.flush();
      await wait(900);
      await loadEvents();
    } finally {
      setSyncing(false);
    }
  };

  const events = state.status === "success" ? state.data.events ?? [] : [];
  const productIds = useMemo(
    () => Array.from(new Set(events.map((event) => event.productId ?? event.data?.product?.id).filter(Boolean))) as string[],
    [events],
  );

  return (
    <section className="event-viewer">
      <div className="event-viewer__toolbar">
        <div>
          <span className="eyebrow">Neon-backed customer history</span>
          <h1>Stored event JSON</h1>
          <p>Only events returned by OmniRec’s server-to-server history API appear here.</p>
        </div>
        <button className="button button--accent" type="button" onClick={syncAndRefresh} disabled={syncing}>
          {syncing ? "Syncing pipeline…" : "Flush & refresh"}
        </button>
      </div>

      <div className="pipeline-steps" aria-label="Event pipeline">
        <div className="pipeline-step is-complete"><span>1</span><div><strong>Capture</strong><small>Next.js SDK</small></div></div>
        <i>→</i>
        <div className="pipeline-step is-complete"><span>2</span><div><strong>Accept</strong><small>Spring Event API</small></div></div>
        <i>→</i>
        <div className={`pipeline-step${state.status === "success" ? " is-complete" : ""}`}><span>3</span><div><strong>Store</strong><small>Neon PostgreSQL</small></div></div>
      </div>

      {state.status === "loading" && (
        <div className="viewer-state"><span className="spinner" /><strong>Reading stored history…</strong></div>
      )}

      {state.status === "error" && (
        <div className="viewer-state viewer-state--error">
          <span>!</span>
          <div><strong>History is not available yet.</strong><p>{state.message}</p></div>
          <button type="button" className="text-button" onClick={() => void loadEvents()}>Try again</button>
        </div>
      )}

      {state.status === "success" && (
        <>
          <div className="event-summary">
            <div><span>Stored events</span><strong>{events.length}</strong></div>
            <div><span>Customer</span><strong>{state.data.customerId ?? "demo_customer_123"}</strong></div>
            <div><span>Product IDs observed</span><strong>{productIds.length}</strong></div>
            <div><span>Last read</span><strong>{state.refreshedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</strong></div>
          </div>

          {productIds.length > 0 && (
            <div className="observed-products">
              <span>Product IDs in stored events</span>
              <div>{productIds.map((id) => <code key={id}>{id}</code>)}</div>
            </div>
          )}

          {events.length === 0 ? (
            <div className="viewer-state">
              <span>0</span>
              <div>
                <strong>No stored events for this demo customer yet.</strong>
                <p>Return to the store, interact with a product, then use Flush &amp; refresh.</p>
              </div>
            </div>
          ) : (
            <div className="json-window">
              <div className="json-window__bar">
                <span><i /><i /><i /></span>
                <strong>GET /v1/customers/demo_customer_123/events</strong>
                <span className="json-window__badge">STORED</span>
              </div>
              <pre><code>{JSON.stringify(state.data, null, 2)}</code></pre>
            </div>
          )}

          {state.data.nextCursor && (
            <button type="button" className="button button--outline load-older" onClick={() => void loadEvents(state.data.nextCursor)}>
              Load older events
            </button>
          )}
        </>
      )}
    </section>
  );
}

