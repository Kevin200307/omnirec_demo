"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";

export function Header() {
  const { count } = useCart();

  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="Aster and Grain home">
        <span className="brand__mark">A/G</span>
        <span>Aster &amp; Grain</span>
      </Link>
      <nav aria-label="Main navigation">
        <Link href="/#collection">Collection</Link>
        <Link href="/events" className="events-link"><span className="status-dot" /> Stored events</Link>
        <a href="/#cart" className="cart-link">Cart <span>{count}</span></a>
      </nav>
    </header>
  );
}

