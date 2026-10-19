import { notFound } from "next/navigation";
import { ProductExperience } from "@/components/ProductExperience";
import { PRODUCTS, findProduct } from "@/data/products";

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ slug: product.slug }));
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = findProduct(slug);
  if (!product) notFound();

  return <ProductExperience product={product} />;
}

