"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/src/components/ui/carousel";
import { Card, CardContent } from "@/src/components/ui/card";

export default function ShilajitPage() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-body selection:bg-amber-500 selection:text-black">
      {/* Hero Section */}
      <section className="relative h-[90vh] w-full overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/products/shirajit/shilajit_main.jpeg"
            alt="Pure Himalayan Shilajit"
            fill
            className="object-cover opacity-60 scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>

        <motion.div
          className="relative z-10 container px-4 text-center"
          initial="initial"
          animate="animate"
          variants={stagger}
        >
          <motion.h2
            variants={fadeIn}
            className="text-amber-500 tracking-widest uppercase text-sm md:text-base mb-4 font-semibold"
          >
            Nature's Ultimate Revitalizer
          </motion.h2>
          <motion.h1
            variants={fadeIn}
            className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold mb-6 text-white leading-tight"
          >
            Himalayan <br />
            <span className="text-amber-500">Shilajit</span> Resin
          </motion.h1>
          <motion.p
            variants={fadeIn}
            className="text-gray-300 max-w-2xl mx-auto text-lg md:text-xl mb-8 font-light"
          >
            Sourced from the pristine peaks of the Himalayas at 16,000ft.
            100% pure, verified, and potent. Unlock your peak performance.
          </motion.p>
          <motion.div variants={fadeIn}>
            <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white rounded-full px-8 py-6 text-lg" asChild>
              <Link href="/products">
                Shop Now <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Introduction / Story */}
      <section className="py-24 bg-neutral-900 border-t border-neutral-800">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative aspect-square rounded-2xl overflow-hidden border border-amber-900/30 shadow-2xl shadow-amber-900/10"
            >
              <Image
                src="/images/products/shirajit/shilajit1.jpeg"
                alt="Raw Shilajit Extraction"
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <h3 className="text-amber-500 font-semibold tracking-wider uppercase">The Destroyer of Weakness</h3>
              <h2 className="font-heading text-4xl md:text-5xl font-bold">Ancient Wisdom, Modern Power</h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                For centuries, Shilajit has been treasured in Ayurveda as a rejuvenator (Rasayana).
                Formed over millions of years from the decomposition of plant matter trapped in the Himalayan rocks,
                this potent resin oozes out during the summer heat.
              </p>
              <p className="text-gray-400 text-lg leading-relaxed">
                Packed with over 85 essential minerals and Fulvic Acid, our Shilajit drives nutrients deep into your cells,
                supercharging your mitochondria for sustained clean energy.
              </p>

              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-900/20 rounded-lg text-amber-500">
                     <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Lab Tested</h4>
                    <p className="text-sm text-gray-500">For purity & safety</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-900/20 rounded-lg text-amber-500">
                     <Zap className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">High Potency</h4>
                    <p className="text-sm text-gray-500">Rich in Fulvic Acid</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-black relative">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-900/50 to-transparent"></div>

        <div className="container px-4 mx-auto text-center mb-16">
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">Unlock Your Potential</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">Experience the multitude of benefits that pure Himalayan Shilajit brings to your daily life.</p>
        </div>

        <div className="container px-4 mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Enhanced Energy",
              desc: "Combats fatigue by improving mitochondrial function and ATP production.",
              color: "border-amber-500/30"
            },
            {
              title: "Cognitive Clarity",
              desc: "Supports brain health, memory, and focus with enhanced nutrient absorption.",
              color: "border-amber-500/30"
            },
            {
              title: "Hormonal Balance",
              desc: "Naturally supports testosterone levels and overall vitality in men and women.",
              color: "border-amber-500/30"
            }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Card className="bg-neutral-900 border-neutral-800 hover:border-amber-500/50 transition-colors duration-300 h-full">
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-amber-900/20 flex items-center justify-center text-amber-500 mb-4">
                    <Check className="h-8 w-8" />
                  </div>
                  <h3 className="font-heading text-2xl font-semibold text-white">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Gallery Carousel */}
      <section className="py-24 bg-neutral-900 overflow-hidden">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
             <div>
                <h3 className="text-amber-500 font-semibold tracking-wider uppercase mb-2">Visual Purity</h3>
                <h2 className="font-heading text-4xl md:text-5xl font-bold">See the Difference</h2>
             </div>
             <p className="text-gray-400 max-w-md text-right md:text-left">
                Our premium packaging ensures that the resin stays fresh and potent, delivered directly to you.
             </p>
          </div>

          <Carousel className="w-full max-w-5xl mx-auto" opts={{ loop: true }}>
            <CarouselContent>
              {[
                "/images/products/shirajit/shilajit2.jpeg",
                "/images/products/shirajit/shilajit3.jpeg",
                "/images/products/shirajit/shilajit4.jpeg",
                "/images/products/shirajit/shilajit1.jpeg"
              ].map((img, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3 pl-6">
                  <div className="relative aspect-[4/5] rounded-xl overflow-hidden group">
                    <Image
                      src={img}
                      alt={`Shilajit Gallery ${index + 1}`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-end gap-2 mt-8 pr-6">
               <CarouselPrevious className="bg-amber-900/20 border-amber-900/50 hover:bg-amber-500 hover:text-black text-amber-500 static translate-y-0" />
               <CarouselNext className="bg-amber-900/20 border-amber-900/50 hover:bg-amber-500 hover:text-black text-amber-500 static translate-y-0" />
            </div>
          </Carousel>
        </div>
      </section>

      {/* FAQ / Final CTA */}
      <section className="py-24 bg-black border-t border-amber-900/20">
        <div className="container px-4 mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto bg-neutral-900/50 border border-neutral-800 p-12 rounded-3xl backdrop-blur-sm"
          >
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6">Experience the Power Within</h2>
            <p className="text-gray-300 text-xl mb-8">
              Don't settle for mediocre supplements. Elevate your health with the purest form of Shilajit available.
            </p>
            <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white rounded-full px-10 py-8 text-xl shadow-lg shadow-amber-900/20" asChild>
              <Link href="/products">
                Buy Now - Limited Stock
              </Link>
            </Button>
            <p className="mt-4 text-sm text-gray-500">Free shipping on all orders over $50</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
