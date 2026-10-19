import { notFound } from "next/navigation";
import { ProductExperience } from "@/components/ProductExperience";
import { PRODUCTS, findProduct } from "@/data/products";

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ slug: product.slug }));
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = findProduct(params.slug);
  if (!product) notFound();

  return <ProductExperience product={product} />;
}

