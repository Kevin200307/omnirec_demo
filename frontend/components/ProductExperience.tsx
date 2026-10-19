"use client";

import Link from "next/link";
import { useState } from "react";
import { TrackProduct, useTrack } from "@omnirec/commerce-next";
import { useCart } from "@/components/CartProvider";
import { ProductVisual } from "@/components/ProductVisual";
import { formatPrice, type Product } from "@/data/products";

export function ProductExperience({ product }: { product: Product }) {
  const track = useTrack();
  const { add } = useCart();
  const [wishlisted, setWishlisted] = useState(false);

  const productContext = {
    id: product.id,
    name: product.name,
    price: product.price,
    currency: "USD",
    category: { id: product.category, name: product.categoryName },
  };

  return (
    <TrackProduct product={productContext}>
      <main className="product-page section-shell">
        <Link href="/#collection" className="back-link">← Back to collection</Link>
        <div className="product-detail">
          <ProductVisual product={product} large />
          <div className="product-detail__copy">
            <div className="product-detail__meta">
              <span>{product.categoryName}</span>
              <span className="product-id">Product ID · {product.id}</span>
            </div>
            <h1>{product.name}</h1>
            <p className="product-detail__price">{formatPrice(product.price)}</p>
            <p className="product-detail__lead">{product.detail}</p>
            <dl className="product-specs">
              <div><dt>Material</dt><dd>{product.material}</dd></div>
              <div><dt>Finish</dt><dd>{product.color}</dd></div>
              <div><dt>Event context</dt><dd>{product.id}</dd></div>
            </dl>
            <div className="product-actions">
              <button type="button" className="button button--accent" onClick={() => add(product)}>
                Add to demo cart
              </button>
              <button
                type="button"
                className={`button button--outline${wishlisted ? " is-active" : ""}`}
                aria-pressed={wishlisted}
                onClick={() => {
                  if (!wishlisted) track("product_wishlisted");
                  setWishlisted((current) => !current);
                }}
              >
                {wishlisted ? "Wishlisted ✓" : "Add to wishlist ♡"}
              </button>
            </div>
            <div className="tracking-callout">
              <span className="tracking-callout__icon">◎</span>
              <div>
                <strong>This page is tracked by <code>&lt;TrackProduct&gt;</code></strong>
                <p>Opening it records <code>product_viewed</code>. Leaving records visible time with <code>product_page_exited</code>.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </TrackProduct>
  );
}

