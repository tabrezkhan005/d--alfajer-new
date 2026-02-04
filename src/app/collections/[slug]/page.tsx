import { getCategoryBySlug, getProducts } from "@/src/lib/supabase/products-server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { ProductCardComponent } from "./product-card";

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export default async function CollectionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    // Fallback: try to find by name matching slug (e.g. "dry-fruits" -> "Dry Fruits")?
    // For now, 404.
    notFound();
  }

  const products = await getProducts({ categorySlug: slug });

  return (
    <div className="min-h-screen bg-white">
       {/* Hero */}
       <div className="relative bg-neutral-900 text-white py-24 px-4 overflow-hidden">
          <div className="absolute inset-0 opacity-40">
             {/* Use category image if available, else standard pattern */}
             <div className="absolute inset-0 bg-gradient-to-r from-neutral-900 to-transparent z-10" />
             {/* We don't have category image in DB schema row type explicitly shown, assuming generic background */}
          </div>
          <div className="container mx-auto relative z-20">
             <div className="text-sm text-gray-400 mb-4 uppercase tracking-widest font-semibold">Collection</div>
             <h1 className="text-5xl md:text-7xl font-bold mb-6 font-heading">{category.name}</h1>
             <p className="text-xl text-gray-300 max-w-2xl font-light">
               {category.description || `Explore our premium range of ${category.name}.`}
             </p>
          </div>
       </div>

       {/* Breadcrumb */}
       <div className="border-b border-gray-100">
          <div className="container mx-auto px-4 py-4 text-sm text-gray-500">
             <Link href="/" className="hover:text-amber-600">Home</Link> <span className="mx-2">/</span>
             <Link href="/collections" className="hover:text-amber-600">Collections</Link> <span className="mx-2">/</span>
             <span className="text-gray-900 font-medium">{category.name}</span>
          </div>
       </div>

       {/* Products */}
       <div className="container mx-auto px-4 py-16">
          <div className="flex justify-between items-center mb-10">
             <div className="text-gray-500">Showing {products.length} results</div>
             {/* Sort Options could go here */}
          </div>

          {products.length > 0 ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {products.map((product) => (
                   <ProductCardComponent key={product.id} product={product} />
                ))}
             </div>
          ) : (
             <div className="text-center py-24 bg-neutral-50 rounded-lg">
                <h3 className="text-xl font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500">This collection is currently empty.</p>
                <Link href="/collections">
                   <Button className="mt-6">Browse other collections</Button>
                </Link>
             </div>
          )}
       </div>
    </div>
  );
}
