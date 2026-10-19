"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { ProductVisual } from "@/components/ProductVisual";
import { formatPrice, type Product } from "@/data/products";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();

  return (
    <article className="product-card">
      <Link href={`/products/${product.slug}`} className="product-card__visual-link" aria-label={`View ${product.name}`}>
        <ProductVisual product={product} />
      </Link>
      <div className="product-card__meta">
        <span>{product.categoryName}</span>
        <span className="product-id">ID · {product.id}</span>
      </div>
      <div className="product-card__title-row">
        <h3><Link href={`/products/${product.slug}`}>{product.name}</Link></h3>
        <strong>{formatPrice(product.price)}</strong>
      </div>
      <p>{product.description}</p>
      <button className="button button--quiet button--full" type="button" onClick={() => add(product)}>
        Add to cart <span aria-hidden="true">+</span>
      </button>
    </article>
  );
}

