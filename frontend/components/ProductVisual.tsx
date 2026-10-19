import type { Product } from "@/data/products";

export function ProductVisual({ product, large = false }: { product: Product; large?: boolean }) {
  return (
    <div
      className={`product-visual product-visual--${product.shape}${large ? " product-visual--large" : ""}`}
      style={{
        "--product-accent": product.accent,
        "--product-soft": product.accentSoft,
      } as React.CSSProperties}
      aria-hidden="true"
    >
      <span className="product-visual__sun" />
      <span className="product-visual__object" />
      <span className="product-visual__shadow" />
      <span className="product-visual__index">{product.id.slice(-3)}</span>
    </div>
  );
}

