import { ProductDetail } from "@/src/components/products";
import { notFound } from "next/navigation";
import { mockProductsWithVariants } from "@/src/lib/products";

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { id } = await params;
  const product = mockProductsWithVariants.find((p) => p.id === id);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The product you're looking for doesn't exist.",
    };
  }

  return {
    title: product.name,
    description: product.metaDescription || product.shortDescription,
    keywords: [product.name, product.category, ...product.certifications],
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: [{ url: product.image }],
    },
  };
}

export function generateStaticParams() {
  return mockProductsWithVariants.map((product) => ({
    id: product.id,
  }));
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = mockProductsWithVariants.find((p) => p.id === id);

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white">
      <ProductDetail productId={id} />
    </main>
  );
}

