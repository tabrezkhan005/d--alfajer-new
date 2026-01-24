"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star, Flower, Droplet, ChefHat, Check } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";

export default function SaffronPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.8 }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans selection:bg-red-100 selection:text-red-900 overflow-hidden">

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 pb-0 lg:pt-0">
        <div className="absolute inset-0 z-0">
           {/* Subtle texture or ultra-light gradient */}
           <div className="absolute inset-0 bg-gradient-to-b from-red-50/30 to-white" />
           <div className="absolute top-0 right-0 w-[60%] h-[80%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-50/50 via-transparent to-transparent opacity-60 blur-3xl" />
        </div>

        <div className="container relative z-10 px-4 mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-3 px-4 py-2 border border-red-100 bg-white rounded-full shadow-sm"
            >
               <span className="flex h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>
               <span className="text-sm font-semibold tracking-wide text-neutral-600 uppercase">Harvest 2026 Ready</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-heading text-5xl sm:text-7xl lg:text-8xl font-medium tracking-tight text-neutral-900 leading-[1.1]"
            >
              The Red <br />
              <span className="font-serif italic text-red-700">Gold</span> of Spices
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-neutral-500 font-light leading-relaxed max-w-lg"
            >
              Exquisite Kashmiri Mongra Saffron. Hand-picked strands of pure luxury for the culinary connoisseur.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-wrap gap-4 pt-4"
            >
              <Button size="lg" className="bg-red-700 hover:bg-red-800 text-white rounded-full px-10 h-16 text-lg shadow-lg shadow-red-900/10 transition-transform hover:scale-105" asChild>
                <Link href="/products/saffron">
                  Purchase Now <ArrowRight className="ml-3 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="ghost" className="text-neutral-900 hover:bg-red-50 rounded-full px-8 h-16 text-lg transition-colors" asChild>
                <Link href="#origin">Explore Origin</Link>
              </Button>
            </motion.div>
          </div>

          <motion.div
            className="lg:col-span-6 relative h-[500px] lg:h-[800px] w-full flex items-center justify-center lg:justify-end"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2 }}
          >
             {/* Product Showcase */}
             <div className="relative w-full max-w-[600px] aspect-square">
                <Image
                  src="/images/products/saffron/saffron_main.png"
                  alt="Premium Kashmiri Saffron"
                  fill
                  className="object-contain drop-shadow-2xl z-20"
                  priority
                />
                {/* Background Blobs for depth */}
                <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-red-100 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob" />
                <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-amber-50 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-2000" />
             </div>
          </motion.div>
        </div>
      </section>

      {/* Origin Story - Minimalist Grid */}
      <section id="origin" className="py-32 bg-neutral-950 text-white relative overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
         <div className="container px-4 mx-auto max-w-6xl relative z-10">
            <div className="text-center mb-20 space-y-4">
               <span className="text-red-500 font-semibold tracking-[0.3em] uppercase text-xs">Pampore, Kashmir</span>
               <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-medium">Cultivated with Patience</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-neutral-800 border border-neutral-800">
               <div className="bg-neutral-950 p-12 flex flex-col items-center text-center space-y-6 group hover:bg-neutral-900 transition-colors duration-500">
                  <div className="w-16 h-16 rounded-full bg-red-900/20 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                     <span className="font-serif italic text-2xl">1</span>
                  </div>
                  <h3 className="text-2xl font-medium">Harvest</h3>
                  <p className="text-neutral-400 leading-relaxed font-light">
                     Every Autumn, thousands of purple Crocus flowers bloom. They must be picked at dawn before the sun wilt the delicate stigmas.
                  </p>
               </div>
               <div className="bg-neutral-950 p-12 flex flex-col items-center text-center space-y-6 group hover:bg-neutral-900 transition-colors duration-500">
                  <div className="w-16 h-16 rounded-full bg-red-900/20 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                     <span className="font-serif italic text-2xl">2</span>
                  </div>
                  <h3 className="text-2xl font-medium">Separation</h3>
                  <p className="text-neutral-400 leading-relaxed font-light">
                     The crimson stigmas are painstakingly separated from the yellow styles by hand. No machines, only skilled artisans.
                  </p>
               </div>
               <div className="bg-neutral-950 p-12 flex flex-col items-center text-center space-y-6 group hover:bg-neutral-900 transition-colors duration-500">
                  <div className="w-16 h-16 rounded-full bg-red-900/20 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                     <span className="font-serif italic text-2xl">3</span>
                  </div>
                  <h3 className="text-2xl font-medium">Drying</h3>
                  <p className="text-neutral-400 leading-relaxed font-light">
                     Dried naturally to preserve the volatile oils (Safranal) responsible for its captivating aroma and potent health benefits.
                  </p>
               </div>
            </div>
         </div>
      </section>

      {/* Culinary & Health - Split View */}
      <section className="py-0">
         <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
            <div className="relative bg-red-50 flex items-center justify-center p-12 lg:p-24 overflow-hidden">
               <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-0" />
               <motion.div {...fadeInUp} className="relative z-10 max-w-lg space-y-8">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-red-600 shadow-sm">
                     <ChefHat className="h-7 w-7" />
                  </div>
                  <h2 className="font-heading text-4xl md:text-5xl font-medium text-neutral-900">A Culinary Jewel</h2>
                  <p className="text-lg text-neutral-600 leading-relaxed">
                     Saffron is the secret to the world's most aromatic dishes. From French Bouillabaisse to Indian Biryani and Persian Rice,
                     a pinch of our saffron imparts a golden hue and an earthy, floral sweetness that cannot be replicated.
                  </p>
                  <ul className="space-y-4">
                     <li className="flex items-center gap-3 text-neutral-700">
                        <Check className="h-5 w-5 text-red-500" /> Intense Aroma
                     </li>
                     <li className="flex items-center gap-3 text-neutral-700">
                        <Check className="h-5 w-5 text-red-500" /> Vivid Golden Color
                     </li>
                     <li className="flex items-center gap-3 text-neutral-700">
                        <Check className="h-5 w-5 text-red-500" /> Rich Flavor Profile
                     </li>
                  </ul>
               </motion.div>
            </div>
            <div className="relative bg-white flex items-center justify-center p-12 lg:p-24 border-l border-neutral-100">
               <motion.div {...fadeInUp} transition={{ delay: 0.2 }} className="relative z-10 max-w-lg space-y-8">
                  <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 shadow-sm">
                     <Droplet className="h-7 w-7" />
                  </div>
                  <h2 className="font-heading text-4xl md:text-5xl font-medium text-neutral-900">Potent Elixir</h2>
                  <p className="text-lg text-neutral-600 leading-relaxed">
                     Beyond flavor, Saffron is a powerhouse of antioxidants. Crocin, Crocetin, and Safranal protect your cells against oxidative stress,
                     brighten your mood, and promote radiant skin from within.
                  </p>
                  <Button variant="link" className="text-red-700 p-0 text-lg font-medium hover:text-red-800" asChild>
                     <Link href="/blogs/benefits-of-saffron">Read the Research <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
               </motion.div>
            </div>
         </div>
      </section>

      {/* Product Card / CTA */}
      <section className="py-32 bg-neutral-50 border-t border-neutral-200">
         <div className="container px-4 mx-auto max-w-5xl">
            <h2 className="text-center font-heading text-4xl md:text-5xl font-medium mb-16">The Collection</h2>
            <Card className="bg-white border-0 shadow-xl rounded-[2rem] overflow-hidden hover:shadow-2xl transition-shadow duration-500">
               <div className="grid grid-cols-1 md:grid-cols-12">
                  <div className="md:col-span-5 bg-neutral-100 relative h-96 md:h-auto min-h-[400px]">
                     <Image
                        src="/images/products/saffron/saffron_main.png"
                        alt="Royal Saffron Box"
                        fill
                        className="object-cover p-8 hover:scale-105 transition-transform duration-700"
                     />
                  </div>
                  <div className="md:col-span-7 p-10 md:p-16 flex flex-col justify-center space-y-8">
                     <div>
                        <div className="text-red-600 font-bold tracking-widest text-xs uppercase mb-2">Best Seller</div>
                        <h3 className="font-heading text-3xl md:text-4xl font-semibold mb-2">Royal Mongra Saffron</h3>
                        <div className="flex gap-1 text-yellow-400">
                           <Star className="h-4 w-4 fill-current" />
                           <Star className="h-4 w-4 fill-current" />
                           <Star className="h-4 w-4 fill-current" />
                           <Star className="h-4 w-4 fill-current" />
                           <Star className="h-4 w-4 fill-current" />
                        </div>
                     </div>
                     <p className="text-neutral-600 text-lg leading-relaxed">
                        The highest grade of Saffron available. Only the deep red tips of the stigma are used.
                        Perfect for gifting or personal indulgence. Comes in a vacuum-sealed jar to ensure longevity.
                     </p>
                     <div className="flex items-center gap-6 pt-4">
                        <div className="text-3xl font-bold font-serif">$29.99</div>
                        <Button size="lg" className="flex-1 bg-neutral-900 text-white hover:bg-neutral-800 h-14 rounded-xl text-lg" asChild>
                           <Link href="/products/saffron">Add to Cart</Link>
                        </Button>
                     </div>
                  </div>
               </div>
            </Card>
         </div>
      </section>

    </div>
  );
}
