import Link from "next/link";
import { CartSection } from "@/components/CartSection";
import { DemoIdentityCard } from "@/components/DemoIdentity";
import { Storefront } from "@/components/Storefront";

export default function HomePage() {
  return (
    <main>
      <section className="shop-banner" aria-label="New workspace collection">
        <img src="/images/hero-collection.png" alt="A warm workspace styled with the Aster and Grain collection" />
        <div className="shop-banner__shade" />
        <div className="shop-banner__content section-shell">
          <span className="shop-banner__kicker">The workspace edit · New season</span>
          <h1>Make room for<br />better work.</h1>
          <p>Considered lighting, useful objects, and tactile stationery for calmer desks.</p>
          <a className="button button--light" href="#collection">Shop the collection <span>→</span></a>
        </div>
      </section>

      <section className="hero section-shell">
        <div className="hero__copy">
          <span className="eyebrow">Aster &amp; Grain · OmniRec demo store</span>
          <h1>Small objects.<br /><em>Clear signals.</em></h1>
          <p>A working storefront that turns ordinary customer actions into structured, securely persisted events—with one provider and typed tracking.</p>
          <div className="hero__actions">
            <a className="button button--accent" href="#collection">Browse the collection</a>
            <Link className="button button--outline" href="/events">View stored JSON</Link>
          </div>
        </div>
        <div className="hero__proof">
          <div className="integration-card">
            <div className="integration-card__bar"><span /><span /><span /><strong>app/providers.tsx</strong></div>
            <pre><code><span className="code-muted">// The global integration</span>{"\n"}<span className="code-pink">&lt;OmnirecNextProvider</span>{"\n"}  endpoint=<span className="code-green">&quot;/omnirec&quot;</span>{"\n"}  apiKey={`{publishableKey}`}<span className="code-pink">&gt;</span>{"\n"}  {`{children}`}{"\n"}<span className="code-pink">&lt;/OmnirecNextProvider&gt;</span></code></pre>
            <div className="integration-card__foot"><span className="status-dot" /> Page routes, sessions, batching, and identity are active.</div>
          </div>
          <DemoIdentityCard />
        </div>
      </section>

      <section className="proof-strip" aria-label="OmniRec event path">
        <div><span>01</span><strong>Customer acts</strong><small>Browse · search · cart</small></div>
        <i>→</i>
        <div><span>02</span><strong>SDK captures</strong><small>Typed v2 events</small></div>
        <i>→</i>
        <div><span>03</span><strong>OmniRec stores</strong><small>Spring · RabbitMQ · Neon</small></div>
        <i>→</i>
        <div><span>04</span><strong>You inspect</strong><small>Real stored JSON</small></div>
      </section>

      <Storefront />
      <CartSection />

      <section className="closing-section section-shell">
        <span className="eyebrow">The proof is in the payload</span>
        <h2>Follow one product ID from shelf to storage.</h2>
        <p>Product IDs are visible on every card, attached to each relevant event, and returned unchanged from Neon-backed customer history.</p>
        <Link href="/events" className="button button--dark">Open stored events <span>↗</span></Link>
      </section>
    </main>
  );
}

