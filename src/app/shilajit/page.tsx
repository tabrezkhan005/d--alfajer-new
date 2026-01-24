"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, ShieldCheck, Zap, Mountain, Star } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/src/components/ui/carousel";
import { Card, CardContent } from "@/src/components/ui/card";

export default function ShilajitPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8 }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans selection:bg-amber-100 selection:text-amber-900 overflow-hidden">

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Soft Ambient Background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-50 via-white to-white" />

        <div className="container relative z-10 px-4 mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="text-left space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-100 text-amber-800 text-xs font-bold tracking-widest uppercase shadow-sm">
              <Mountain className="h-3 w-3" /> Himalayan Gold
            </div>

            <h1 className="font-heading text-6xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tight text-neutral-900">
              Pure <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-800">Shilajit</span>
              <span className="text-4xl md:text-5xl lg:text-6xl block mt-2 font-serif italic font-normal text-neutral-400">Resin</span>
            </h1>

            <p className="text-lg md:text-xl text-neutral-600 font-light leading-relaxed max-w-xl">
              Harvested at 16,000 ft from the pristine peaks of the Himalayas.
              The ultimate natural revitalizer for energy, focus, and vitality.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Button size="lg" className="bg-neutral-900 hover:bg-neutral-800 text-white rounded-full px-10 h-14 text-lg shadow-xl shadow-neutral-900/10 transition-all hover:scale-105" asChild>
                <Link href="/products/shilajit">
                  Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-neutral-200 hover:border-amber-200 hover:bg-amber-50 text-neutral-900 rounded-full px-8 h-14 text-lg" asChild>
                <Link href="#benefits">
                  Learn Benefits
                </Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="relative h-[500px] lg:h-[700px] w-full"
          >
             {/* Main Product Image with refined shadow */}
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-[300px] h-[300px] md:w-[500px] md:h-[500px]">
                  <Image
                    src="/images/products/shirajit/shilajit_main.jpeg"
                    alt="Premium Shilajit Jar"
                    fill
                    className="object-contain drop-shadow-2xl z-10"
                    priority
                  />
                  {/* Decorative Circle */}
                  <div className="absolute inset-0 border border-amber-100 rounded-full scale-110 opacity-50" />
                  <div className="absolute inset-0 border border-amber-50 rounded-full scale-[1.3] opacity-30" />
                </div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* Narrative Section - Clean Typography */}
      <section className="py-32 bg-white relative">
        <div className="container px-4 mx-auto max-w-4xl text-center">
          <motion.div {...fadeInUp} className="space-y-8">
            <h3 className="text-amber-600 font-bold tracking-widest uppercase text-sm">The Origin Story</h3>
            <h2 className="font-heading text-4xl md:text-5xl font-bold leading-tight">
              Formed over centuries. <br/>
              <span className="font-serif italic font-normal text-neutral-500">Perfected by nature.</span>
            </h2>
            <div className="w-24 h-1 bg-amber-100 mx-auto rounded-full" />
            <p className="text-xl text-neutral-600 leading-relaxed font-light">
              In the high altitudes of the Himalayas, plant matter trapped in rocks decomposes over centuries, transforming into a nutrient-dense resin rich in fulvic acid and trace minerals. Known in Ayurveda as the "Destroyer of Weakness", it is one of earth's most potent adaptogens.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Value Props - Grid with Iconography */}
      <section id="benefits" className="py-24 bg-neutral-50">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                icon: Zap,
                title: "Limitless Energy",
                desc: "Bio-active Fulvic Acid drives nutrients directly into cells, enhancing mitochondrial ATP production for sustained stamina."
              },
              {
                icon: ShieldCheck,
                title: "Immune Defense",
                desc: "Packed with 85+ minerals and antioxidants that fortify your body's natural defense mechanisms against stress."
              },
              {
                icon: Mountain,
                title: "Mental Clarity",
                desc: "Clears brain fog and sharpens focus. Experience heighted cognitive function and balanced mood throughout the day."
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="bg-white p-10 rounded-2xl shadow-sm border border-neutral-100 hover:shadow-xl hover:border-amber-100 transition-all duration-300 group"
              >
                <div className="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 mb-6 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <item.icon className="h-7 w-7" />
                </div>
                <h3 className="font-heading text-2xl font-bold mb-3 text-neutral-900">{item.title}</h3>
                <p className="text-neutral-600 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Visual Showcase - Parallax Feel */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-neutral-900 -z-10">
           <Image
             src="/images/products/shirajit/shilajit1.jpeg" // Abstract texture
             alt="Shilajit Texture"
             fill
             className="object-cover opacity-20 mix-blend-overlay"
           />
        </div>
        <div className="container px-4 mx-auto text-center text-white">
           <motion.div
             initial={{ scale: 0.9, opacity: 0 }}
             whileInView={{ scale: 1, opacity: 1 }}
             transition={{ duration: 0.8 }}
           >
             <h2 className="font-heading text-5xl md:text-7xl font-bold mb-6">100% Verified Purity</h2>
             <p className="text-xl md:text-2xl text-neutral-300 font-light max-w-2xl mx-auto mb-12">
               Lab tested for heavy metals and authenticity. Pure resin, no fillers.
             </p>
             <div className="flex justify-center gap-8 text-neutral-400">
                <div className="flex flex-col items-center gap-2">
                   <ShieldCheck className="h-10 w-10 text-amber-500" />
                   <span className="text-sm font-medium tracking-wide">FDA REGISTERED FACILITY</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                   <Check className="h-10 w-10 text-amber-500" />
                   <span className="text-sm font-medium tracking-wide">GMP CERTIFIED</span>
                </div>
             </div>
           </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="container px-4 mx-auto max-w-5xl">
          <Card className="rounded-[2.5rem] bg-neutral-50 border-none shadow-xl overflow-hidden p-8 md:p-12 lg:p-16">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                   <h3 className="font-heading text-3xl md:text-4xl font-bold">Start Your Journey To Peak Performance</h3>
                   <div className="flex items-center gap-2 text-amber-500">
                      <Star className="h-5 w-5 fill-current" />
                      <Star className="h-5 w-5 fill-current" />
                      <Star className="h-5 w-5 fill-current" />
                      <Star className="h-5 w-5 fill-current" />
                      <Star className="h-5 w-5 fill-current" />
                      <span className="text-neutral-500 ml-2 font-medium">5.0 (500+ Reviews)</span>
                   </div>
                   <p className="text-neutral-600">
                      Join thousands of satisfied customers who have transformed their health with Alfajer Shilajit.
                   </p>
                   <ul className="space-y-2 text-neutral-700">
                      <li className="flex items-center gap-3"><Check className="h-5 w-5 text-green-500" /> Free Shipping above min. order value</li>
                      <li className="flex items-center gap-3"><Check className="h-5 w-5 text-green-500" /> Farmer Direct (Freshly Sourced from Farmers)</li>
                   </ul>
                   <div className="pt-4">
                      <Button size="lg" className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white rounded-full h-14 px-12 text-lg" asChild>
                         <Link href="/products/shilajit">Buy Now - $49</Link>
                      </Button>
                   </div>
                </div>
                <div className="relative aspect-square md:aspect-auto md:h-full">
                   <div className="absolute inset-0 bg-amber-100 rounded-2xl rotate-3" />
                   <Image
                     src="/images/products/shirajit/shilajit_main.jpeg"
                     alt="Shilajit Package"
                     fill
                     className="object-cover rounded-2xl -rotate-3 transition-transform hover:rotate-0 duration-500 shadow-lg"
                   />
                </div>
             </div>
          </Card>
        </div>
      </section>

    </div>
  );
}
