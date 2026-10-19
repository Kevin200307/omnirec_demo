"use client";

import { useSyncExternalStore } from "react";
import { getLiveEvents, getServerLiveEvents, subscribeToLiveEvents } from "@/lib/live-events";

export function LiveActivityPanel() {
  const events = useSyncExternalStore(subscribeToLiveEvents, getLiveEvents, getServerLiveEvents);

  return (
    <aside className="live-panel" aria-live="polite">
      <div className="live-panel__heading">
        <div>
          <span className="status-dot" />
          <strong>OmniRec live</strong>
        </div>
        <span>{events.length} captured</span>
      </div>
      {events.length === 0 ? (
        <p className="live-panel__empty">Browse, search, or add a product to see SDK events here.</p>
      ) : (
        <ol className="live-panel__list">
          {events.slice(0, 5).map((event) => (
            <li key={event.eventId}>
              <span className="live-panel__pulse" />
              <div>
                <strong>{event.event}</strong>
                <span>{event.productId ? `Product ${event.productId}` : "Customer interaction"}</span>
              </div>
              <time>{new Date(event.capturedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</time>
            </li>
          ))}
        </ol>
      )}
      <p className="live-panel__foot">Local capture preview. Use Stored events to verify Neon persistence.</p>
    </aside>
  );
}

