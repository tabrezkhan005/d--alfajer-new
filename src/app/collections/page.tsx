"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Leaf, Sparkles, Heart, Star, Grid3x3 } from "lucide-react";
import { Newsletter } from "@/src/components/newsletter/Newsletter";
import { useI18n } from "@/src/components/providers/i18n-provider";
import { LanguageSelector } from "@/src/components/announcement-bar/LanguageSelector";
import { CurrencySelector } from "@/src/components/announcement-bar/CurrencySelector";
import { getCategories } from "@/src/lib/supabase/products";
import { createClient } from "@/src/lib/supabase/client";

export default function CollectionsPage() {
  const { language, setLanguage, currency, setCurrency, t } = useI18n();
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await getCategories();

        // Fetch products to check which categories have products and get images
        const supabase = createClient();
        const { data: products } = await supabase
          .from("products")
          .select("category_id, images")
          .eq("is_active", true);

        // Get unique category IDs that have products
        const categoryIdsWithProducts = new Set(
          (products || []).map((p: any) => p.category_id).filter(Boolean)
        );

        // Helper to find an image for a category
        const getCategoryImage = (categoryId: string) => {
           const product = products?.find((p: any) => p.category_id === categoryId && p.images && p.images.length > 0);
           // Handle images array which might be JSON or string array
           if (product?.images) {
              const img = Array.isArray(product.images) ? product.images[0] : product.images[0];
              // Note: If Supabase returns string array, index 0 works. If JSON, validation needed.
              // Assuming standard text[] or JSON array.
              // Also check if public Url is needed? My schemas usually store paths.
              // But CollectionsPage renders <Image src>. Which handles paths if configured or external URLs.
              // If path is "products/...", Next/Image might need full URL or Supabase Loader.
              // However, hardcoded ones are "/images/...".
              // Products use Storage paths.
              // I should ideally resolve standard public URL. "https://PROJECT.supabase.co/storage/v1/object/public/product-images/..."
              // But 'ProductListing' logic resolves it.
              // For now, let's assume if it starts with 'http' use it, else try to use it (maybe setup loader later).
              // Actually, simply returning the path is risky if <Image> doesn't know the domain.
              // I'll stick to hardcoded ones primarily, and only use this as fallback.
              if (typeof img === 'string') {
                 if (img.startsWith('http')) return img;
                 // Construct Supabase Public URL?
                 // I don't have project URL easily here without another call.
                 // But I can guess standard pattern if env is public?
                 return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${img}`;
              }
           }
           return "/images/placeholder.jpg";
        };

        // Filter categories to only show those with products
        const categoriesWithProducts = categories.filter(cat =>
          categoryIdsWithProducts.has(cat.id)
        );

        const categoryImages: Record<string, string> = {
          "Saffron": "/images/products/saffron/saffron_main.png",
          "Shilajit": "/images/products/shirajit/shilajit_main.jpeg",
          "Spices": "/images/products/chillipowder/chillipowder_main.jpeg",
          "Honey & Spreads": "/images/products/honey/honey_main.jpeg",
          "Tea & Beverages": "/images/products/kashmirtea/kashmir_main.jpeg",
          "Dry Fruits": "/images/placeholder.jpg",
          "Nuts": "/images/placeholder.jpg",
          "Seeds": "/images/placeholder.jpg",
          "Gift Packs": "/images/placeholder.jpg",
          "Organic": "/images/placeholder.jpg",
        };

        const colors = [
          "from-orange-500/20 to-red-500/20",
          "from-amber-500/20 to-yellow-500/20",
          "from-yellow-500/20 to-orange-500/20",
          "from-[#009744]/20 to-green-500/20",
          "from-purple-500/20 to-pink-500/20",
        ];
        const accents = [
          "text-orange-600",
          "text-amber-600",
          "text-yellow-600",
          "text-[#009744]",
          "text-purple-600",
        ];

        const mappedCollections = categoriesWithProducts.map((cat, index) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          titleKey: cat.name,
          descriptionKey: `collections.${cat.name.toLowerCase().replace(/[&\s]+/g, '_')}_desc`,
          image: (categoryImages[cat.name] && categoryImages[cat.name] !== "/images/placeholder.jpg") ? categoryImages[cat.name] : getCategoryImage(cat.id),
          color: colors[index % colors.length],
          accent: accents[index % accents.length],
        }));

        setCollections(mappedCollections);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCollections([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="w-full bg-white overflow-x-hidden">
      {/* ... (Header parts unchanged) ... */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 md:px-7 lg:px-8 py-2 xs:py-2.5 sm:py-3 flex justify-end gap-2 xs:gap-2.5 sm:gap-3">
          <LanguageSelector language={language} onLanguageChange={setLanguage} />
          <CurrencySelector currency={currency} onCurrencyChange={setCurrency} />
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 md:px-7 lg:px-8 py-2 xs:py-2.5 sm:py-3">
          <div className="flex items-center gap-2 text-xs xs:text-xs sm:text-sm text-gray-600">
            <Link href="/" className="hover:text-[#009744] transition-colors font-medium">{t("common.home")}</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-semibold">{t("page.collections")}</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-r from-[#009744] to-[#00803a] text-white py-12 md:py-16 pt-16 sm:pt-20 lg:pt-24">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t("collections.title")}</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              {t("collections.description")}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Collections Grid */}
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 md:px-7 lg:px-8 py-4 xs:py-6 sm:py-8 md:py-10 lg:py-12">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009744]"></div>
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">{t("collections.noCollections") || "No collections available at the moment."}</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {collections.map((collection) => (
              <motion.div
                key={collection.id}
                variants={itemVariants}
                className="group h-full"
              >
                <Link href={`/collections/${collection.slug}`} className="block h-full">
                  <div className="relative h-full bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group-hover:-translate-y-1">
                    <div className={`absolute inset-0 bg-gradient-to-br ${collection.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-50 p-6 flex items-center justify-center">
                       <Image
                         src={collection.image}
                         alt={collection.name}
                         fill
                         className="object-contain transition-transform duration-700 group-hover:scale-110"
                       />
                    </div>

                    <div className="p-6 text-center">
                      <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#009744] transition-colors font-heading">
                        {t(collection.titleKey)}
                      </h2>
                      <p className="text-sm text-gray-500 line-clamp-2">{t(collection.descriptionKey)}</p>

                      <div className="mt-4 inline-flex items-center text-sm font-semibold text-[#009744] opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                         View Collection
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Featured Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-6 xs:mt-8 sm:mt-10 md:mt-12 lg:mt-14 bg-gradient-to-r from-[#009744] via-[#00a852] to-[#006b2f] rounded-2xl p-5 xs:p-6 sm:p-8 md:p-10 lg:p-12 text-white relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute bottom-0 right-0 w-48 xs:w-56 sm:w-64 h-48 xs:h-56 sm:h-64 bg-white rounded-full blur-3xl"></div>
          </div>
          <div className="relative">
            <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold mb-6 xs:mb-7 sm:mb-8 md:mb-9 lg:mb-10">{t("collections.whyBrowse")}</h2>
            <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-3 gap-4 xs:gap-5 sm:gap-6 lg:gap-8">
              {[
                {
                  titleKey: "collections.benefit1_title",
                  descriptionKey: "collections.benefit1_desc",
                },
                {
                  titleKey: "collections.benefit2_title",
                  descriptionKey: "collections.benefit2_desc",
                },
                {
                  titleKey: "collections.benefit3_title",
                  descriptionKey: "collections.benefit3_desc",
                },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 xs:p-5 sm:p-6 rounded-xl hover:bg-white/15 transition-all"
                >
                  <h3 className="font-bold text-white mb-2 xs:mb-2.5 sm:mb-3 text-sm xs:text-base sm:text-lg">{t(item.titleKey)}</h3>
                  <p className="text-white/90 text-xs xs:text-sm sm:text-base leading-relaxed">{t(item.descriptionKey)}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Newsletter */}
      <Newsletter />
    </div>
  );
}
