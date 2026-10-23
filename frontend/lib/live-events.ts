import type { CommerceEvent } from "@omnirec/commerce-web";

export type LiveDemoEvent = {
  eventId: string;
  event: string;
  productId?: string;
  capturedAt: string;
};

const MAX_EVENTS = 12;
const EMPTY_SERVER_EVENTS: LiveDemoEvent[] = [];
let events: LiveDemoEvent[] = [];
const listeners = new Set<() => void>();

export function recordLiveEvent(event: CommerceEvent) {
  const data = event.data as { product?: { id?: string } } | undefined;
  const item: LiveDemoEvent = {
    eventId: event.eventId,
    event: event.event,
    productId: data?.product?.id,
    capturedAt: event.timestamp,
  };

  events = [item, ...events.filter((existing) => existing.eventId !== item.eventId)].slice(0, MAX_EVENTS);
  listeners.forEach((listener) => listener());
}

export function subscribeToLiveEvents(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getLiveEvents() {
  return events;
}

export function getServerLiveEvents(): LiveDemoEvent[] {
  return EMPTY_SERVER_EVENTS;
}

