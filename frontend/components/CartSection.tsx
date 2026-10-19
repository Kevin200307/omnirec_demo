"use client";

import Link from "next/link";
import { useState } from "react";
import { useOmnirec } from "@omnirec/commerce-next";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/data/products";

export function CartSection() {
  const omnirec = useOmnirec();
  const { lines, total, remove, updateQuantity, startCheckout } = useCart();
  const [checkoutStarted, setCheckoutStarted] = useState(false);

  const handleCheckout = async () => {
    startCheckout();
    setCheckoutStarted(true);
    await omnirec?.flush();
  };

  return (
    <section className="cart-section section-shell" id="cart">
      <div className="cart-section__intro">
        <span className="eyebrow eyebrow--light">A stateful event</span>
        <h2>Your demo cart</h2>
        <p>Quantity changes and removals carry both the stable cart ID and the visible product ID.</p>
        <code>cart · demo_cart_001</code>
      </div>

      <div className="cart-card">
        {lines.length === 0 ? (
          <div className="cart-empty">
            <span>0</span>
            <div>
              <strong>The cart is waiting.</strong>
              <p>Add an object above to create a <code>product_added_to_cart</code> event.</p>
            </div>
          </div>
        ) : (
          <>
            <ul className="cart-lines">
              {lines.map(({ product, quantity }) => (
                <li key={product.id}>
                  <div>
                    <span className="cart-lines__swatch" style={{ background: product.accent }} />
                    <div>
                      <strong>{product.name}</strong>
                      <span className="product-id">{product.id}</span>
                    </div>
                  </div>
                  <div className="quantity-control" aria-label={`Quantity for ${product.name}`}>
                    <button type="button" onClick={() => updateQuantity(product.id, quantity - 1)} aria-label="Decrease quantity">−</button>
                    <span>{quantity}</span>
                    <button type="button" onClick={() => updateQuantity(product.id, quantity + 1)} aria-label="Increase quantity">+</button>
                  </div>
                  <strong>{formatPrice(product.price * quantity)}</strong>
                  <button className="remove-button" type="button" onClick={() => remove(product.id)}>Remove</button>
                </li>
              ))}
            </ul>
            <div className="cart-total">
              <span>Demo total</span>
              <strong>{formatPrice(total)}</strong>
            </div>
            <button type="button" className="button button--accent button--full" onClick={handleCheckout}>
              Start simulated checkout
            </button>
            {checkoutStarted && (
              <div className="checkout-note">
                <span>✓</span>
                <p><strong>Checkout event captured.</strong> No payment or purchase is created in this demo.</p>
              </div>
            )}
          </>
        )}
        <Link href="/events" className="cart-card__events-link">Inspect stored event JSON <span>→</span></Link>
      </div>
    </section>
  );
}

