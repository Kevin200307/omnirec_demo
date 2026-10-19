"use client";

import type { ReactNode } from "react";
import type { CommerceEvent } from "@omnirec/commerce-web";
import { OmnirecNextProvider } from "@omnirec/commerce-next";
import { CartProvider } from "@/components/CartProvider";
import { DemoIdentityInitializer } from "@/components/DemoIdentity";
import { recordLiveEvent } from "@/lib/live-events";

const captureMiddleware = (event: CommerceEvent, next: (event: CommerceEvent) => void) => {
  recordLiveEvent(event);
  next(event);
};

export function Providers({ children }: { children: ReactNode }) {
  return (
    <OmnirecNextProvider
      endpoint="/omnirec"
      apiKey={process.env.NEXT_PUBLIC_OMNIREC_API_KEY ?? "pk_test_demo_store"}
      currency="USD"
      middleware={[captureMiddleware]}
      debug={process.env.NODE_ENV === "development"}
    >
      <DemoIdentityInitializer />
      <CartProvider>{children}</CartProvider>
    </OmnirecNextProvider>
  );
}

