import Link from "next/link";
import { DemoIdentityCard } from "@/components/DemoIdentity";
import { EventJsonViewer } from "@/components/EventJsonViewer";

export default function EventsPage() {
  return (
    <main className="events-page section-shell">
      <div className="events-page__topline">
        <Link href="/" className="back-link">← Return to store</Link>
        <DemoIdentityCard compact />
      </div>
      <EventJsonViewer />
      <aside className="security-note">
        <span>Server boundary</span>
        <p>The browser uses a publishable write key. The Spring Boot demo backend keeps the history secret server-side, and only OmniRec connects to Neon.</p>
      </aside>
    </main>
  );
}

