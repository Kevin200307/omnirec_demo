import type { Product } from "@/data/products";

export function ProductVisual({ product, large = false }: { product: Product; large?: boolean }) {
  return (
    <div
      className={`product-visual${large ? " product-visual--large" : ""}`}
      style={{
        "--product-accent": product.accent,
        "--product-soft": product.accentSoft,
      } as React.CSSProperties}
    >
      <img src={product.image} alt={product.name} loading={large ? "eager" : "lazy"} />
      <span className="product-visual__index">{product.id.slice(-3)}</span>
    </div>
  );
}

