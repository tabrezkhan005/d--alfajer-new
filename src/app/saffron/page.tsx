"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star, Flower, Droplet, ChefHat } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";

export default function SaffronPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8 }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-body selection:bg-red-700 selection:text-white overflow-hidden">

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-[50%] h-full bg-red-50 rounded-bl-[100px] -z-10" />
        <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-red-50/50 rounded-tr-[100px] -z-10" />

        <div className="container px-4 mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6 z-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100/50 border border-red-200 text-red-800 text-sm font-medium">
              <Star className="h-4 w-4 fill-red-800" /> Premium Grade A++
            </div>

            <h1 className="font-heading text-6xl md:text-8xl font-bold leading-none text-neutral-900">
              Kashmiri <br/>
              <span className="text-red-700">Saffron</span>
            </h1>

            <p className="text-xl md:text-2xl text-neutral-600 font-light max-w-lg leading-relaxed">
              Hand-harvested from the purple crocus flowers of Pampore.
              The world's most precious spice, renowned for its exotic aroma and vibrant color.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Button size="lg" className="bg-red-700 hover:bg-red-800 text-white rounded-full px-8 h-14 text-lg" asChild>
                <Link href="/products">
                  Purchase Now <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-red-200 text-red-900 hover:bg-red-50 rounded-full px-8 h-14 text-lg">
                <Link href="#story">Our Story</Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative h-[600px] w-full flex items-center justify-center p-8"
          >
             <div className="relative w-full h-full">
                <Image
                  src="/images/products/saffron/saffron_main.png"
                  alt="Premium Saffron Threads"
                  fill
                  className="object-contain drop-shadow-2xl z-10"
                  priority
                />

                {/* Floating Elements Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent rounded-full blur-3xl scale-75" />
             </div>
          </motion.div>
        </div>
      </section>

      {/* The Story / Origin */}
      <section id="story" className="py-24 bg-neutral-950 text-white relative">
         <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-900 to-transparent" />

         <div className="container px-4 mx-auto text-center max-w-4xl">
           <motion.div {...fadeInUp}>
             <h3 className="text-red-500 font-semibold tracking-[0.2em] uppercase mb-4 text-sm">The Origin</h3>
             <h2 className="font-heading text-4xl md:text-6xl font-bold mb-8">Crimson Threads of Luxury</h2>
             <p className="text-neutral-400 text-lg md:text-xl leading-relaxed font-light">
               Each discrete crimson thread is hand-picked from the delicate <span className="text-white italic font-medium">Crocus sativus</span> flower.
               It takes over 150,000 flowers to produce just one kilogram of our saffron.
               This labor of love results in a spice that is unmatched in potency, aroma, and flavor.
             </p>
           </motion.div>
         </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 bg-white relative">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
             <motion.div
               {...fadeInUp}
               className="space-y-4 p-6 rounded-2xl bg-red-50/30 hover:bg-red-50 transition-colors duration-300"
             >
                <div className="inline-flex p-3 rounded-full bg-red-100 text-red-700 mb-2">
                   <Flower className="h-8 w-8" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-neutral-900">100% Pure Mongra</h3>
                <p className="text-neutral-600 leading-relaxed">
                  We offer only the finest 'Mongra' grade saffron - the deep red stigma portions rich in Crocin (color) and Safranal (aroma). No yellow styles, no waste.
                </p>
             </motion.div>

             <motion.div
               {...fadeInUp}
               transition={{ delay: 0.2 }}
               className="space-y-4 p-6 rounded-2xl bg-red-50/30 hover:bg-red-50 transition-colors duration-300"
             >
                <div className="inline-flex p-3 rounded-full bg-red-100 text-red-700 mb-2">
                   <ChefHat className="h-8 w-8" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-neutral-900">Culinary Delight</h3>
                <p className="text-neutral-600 leading-relaxed">
                  Elevate your Biryani, Paella, or Tea. Just a few strands transform any dish into a royal delicacy with a golden hue and floral scent.
                </p>
             </motion.div>

             <motion.div
               {...fadeInUp}
               transition={{ delay: 0.4 }}
               className="space-y-4 p-6 rounded-2xl bg-red-50/30 hover:bg-red-50 transition-colors duration-300"
             >
                <div className="inline-flex p-3 rounded-full bg-red-100 text-red-700 mb-2">
                   <Droplet className="h-8 w-8" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-neutral-900">Wellness Benefits</h3>
                <p className="text-neutral-600 leading-relaxed">
                  A potent antioxidant known to boost mood, improve skin radiance, and support overall vitality. Nature's true mood enhancer.
                </p>
             </motion.div>
          </div>
        </div>
      </section>

      {/* Parallax / Visual Break */}
      <section className="relative h-[60vh] flex items-center justify-center bg-red-900 overflow-hidden">
         <div className="absolute inset-0 opacity-40">
            {/* Pattern or noise could go here */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30 mix-blend-overlay"></div>
         </div>
         <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60"></div>

         <div className="relative z-10 text-center text-white px-4">
            <h2 className="font-heading text-5xl md:text-7xl font-bold mb-6 italic">"A Touch of Gold"</h2>
            <p className="text-xl md:text-2xl font-light opacity-90">Experience the luxury in every strand</p>
         </div>
      </section>

      {/* Buying Option */}
      <section className="py-24 bg-neutral-50">
        <div className="container px-4 mx-auto max-w-4xl">
           <Card className="overflow-hidden border-none shadow-2xl rounded-3xl">
              <div className="grid grid-cols-1 md:grid-cols-2">
                 <div className="relative h-64 md:h-auto bg-red-100 p-8 flex items-center justify-center">
                    <Image
                      src="/images/products/saffron/saffron_main.png"
                      alt="Saffron Product"
                      width={300}
                      height={300}
                      className="object-contain drop-shadow-lg transform hover:scale-105 transition-transform duration-500"
                    />
                 </div>
                 <div className="p-10 md:p-12 bg-white flex flex-col justify-center">
                    <h3 className="font-heading text-3xl font-bold mb-2">Premium Kesar Box</h3>
                    <div className="flex items-center gap-2 mb-4">
                       <div className="flex text-yellow-500">
                          {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-current" />)}
                       </div>
                       <span className="text-sm text-gray-500">(128 Reviews)</span>
                    </div>
                    <p className="text-gray-600 mb-6">
                       1g of 100% Pure Kashmiri Mongra Saffron. Vacuum sealed to retain freshness.
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                       <span className="text-3xl font-bold text-red-700">$29.99</span>
                       <Button size="lg" className="bg-neutral-900 hover:bg-neutral-800 text-white rounded-full px-8" asChild>
                          <Link href="/products">Add to Cart</Link>
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
