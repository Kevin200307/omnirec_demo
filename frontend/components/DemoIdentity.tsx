"use client";

import { useEffect, useState } from "react";
import { useOmnirec } from "@omnirec/commerce-next";
import { DEMO_CUSTOMER_ID } from "@/lib/demo";

type Identity = {
  anonymousId: string;
  sessionId: string;
  userId: string | null;
};

export function DemoIdentityInitializer() {
  const omnirec = useOmnirec();

  useEffect(() => {
    if (!omnirec) return;
    omnirec.identify(DEMO_CUSTOMER_ID);
  }, [omnirec]);

  return null;
}

const shorten = (value: string) => (value.length > 20 ? `${value.slice(0, 12)}…${value.slice(-5)}` : value);

export function DemoIdentityCard({ compact = false }: { compact?: boolean }) {
  const omnirec = useOmnirec();
  const [identity, setIdentity] = useState<Identity | null>(null);

  useEffect(() => {
    if (!omnirec) return;
    setIdentity(omnirec.getIdentity());
  }, [omnirec]);

  if (!identity) {
    return <div className="identity-card identity-card--loading">Preparing visitor identity…</div>;
  }

  return (
    <div className={`identity-card${compact ? " identity-card--compact" : ""}`}>
      <div className="identity-card__eyebrow"><span className="status-dot" /> Active demo identity</div>
      <dl>
        <div>
          <dt>Customer</dt>
          <dd title={identity.userId ?? DEMO_CUSTOMER_ID}>{identity.userId ?? DEMO_CUSTOMER_ID}</dd>
        </div>
        <div>
          <dt>Anonymous ID</dt>
          <dd title={identity.anonymousId}>{shorten(identity.anonymousId)}</dd>
        </div>
        {!compact && (
          <div>
            <dt>Session ID</dt>
            <dd title={identity.sessionId}>{shorten(identity.sessionId)}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}

