"use client";

import { useMemo, useState, type FormEvent } from "react";
import { TrackList, useTrack } from "@omnirec/commerce-next";
import { ProductCard } from "@/components/ProductCard";
import { PRODUCTS, type Product } from "@/data/products";

const categories = ["All", ...Array.from(new Set(PRODUCTS.map((product) => product.categoryName)))];

export function Storefront() {
  const track = useTrack();
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [category, setCategory] = useState("All");

  const products = useMemo(() => {
    const normalized = submittedQuery.trim().toLowerCase();
    return PRODUCTS.filter((product) => {
      const categoryMatches = category === "All" || product.categoryName === category;
      const searchMatches = !normalized || [product.name, product.description, product.id, product.categoryName]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
      return categoryMatches && searchMatches;
    });
  }, [category, submittedQuery]);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    const normalized = query.trim();
    setSubmittedQuery(normalized);
    track("search_performed", { search: { query: normalized || "all products", resultCount: products.length } });
  };

  return (
    <section className="collection section-shell" id="collection">
      <div className="section-heading">
        <div>
          <span className="eyebrow">The working collection</span>
          <h2>Objects for a quieter desk.</h2>
        </div>
        <p>Every view, search, and cart decision below becomes a structured customer event.</p>
      </div>

      <div className="catalog-controls">
        <form onSubmit={submitSearch} className="search-form">
          <label htmlFor="product-search" className="sr-only">Search products</label>
          <span aria-hidden="true">⌕</span>
          <input
            id="product-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, category, or product ID"
          />
          <button type="submit">Search</button>
        </form>
        <div className="filter-pills" aria-label="Filter products by category">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              className={category === item ? "is-active" : ""}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {products.length > 0 ? (
        <TrackList id="demo_collection" name="Demo collection" products={products} className="product-grid">
          {(product: Product) => <ProductCard product={product} />}
        </TrackList>
      ) : (
        <div className="empty-products">
          <strong>No objects found.</strong>
          <p>Try another phrase or reset the category filter.</p>
          <button type="button" className="text-button" onClick={() => { setQuery(""); setSubmittedQuery(""); setCategory("All"); }}>
            Show all products
          </button>
        </div>
      )}
    </section>
  );
}

