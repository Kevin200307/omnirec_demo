import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Header } from "@/components/Header";
import { LiveActivityPanel } from "@/components/LiveActivityPanel";
import { Providers } from "@/app/providers";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Aster & Grain — OmniRec SDK Demo",
  description: "A static storefront demonstrating customer interaction capture with OmniRec.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="site-frame">
            <Header />
            {children}
            <footer className="site-footer">
              <div><span className="brand__mark">A/G</span><strong>A fictional store built to demonstrate OmniRec.</strong></div>
              <p>No real checkout. No recommendations. Just structured customer interactions, securely stored.</p>
            </footer>
          </div>
          <LiveActivityPanel />
        </Providers>
      </body>
    </html>
  );
}

