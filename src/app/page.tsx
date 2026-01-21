import { Suspense } from "react";
import { HeroSection } from "@/src/components/hero/HeroSection";
import { ExquisiteCollection } from "@/src/components/exquisite-collection";
import { ProductListing } from "@/src/components/products";
import { WhyChooseUs } from "@/src/components/why-choose-us/WhyChooseUs";
import { Newsletter } from "@/src/components/newsletter/Newsletter";

export default function Home() {
  return (
    <div className="w-full overflow-x-hidden">
      <HeroSection />
      <ExquisiteCollection />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading products...</div>}>
        <ProductListing />
      </Suspense>
      <WhyChooseUs />
      <Newsletter />
    </div>
  );
}
