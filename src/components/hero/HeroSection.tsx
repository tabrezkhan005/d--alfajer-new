"use client";

import { useState, useEffect } from "react";
import Link from "next/link"; // Added import

/* ---------------------------------------------
   HERO SLIDES CONFIG
---------------------------------------------- */
const heroSlides = [
  {
    type: "image",
    src: "/banners/1920x1080/dryfruits.jpg",
    title: "Premium Quality",
    link: "/products?category=Dry%20Fruits",
  },
  {
    type: "image",
    src: "/banners/1920x1080/kahwa.jpg",
    title: "Royal Blend",
    link: "/products?category=Tea%20%26%20Beverages",
  },
  {
    type: "image",
    src: "/banners/1920x1080/saffron.jpg",
    title: "Authentic Saffron",
    link: "/products?category=Saffron",
  },
  {
    type: "image",
    src: "/banners/1920x1080/shilajit.jpg",
    title: "Pure Kraft",
    link: "/products?category=Shilajit",
  },
];


export function HeroSection() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full bg-black mt-[70px] sm:mt-[85px]">
      {/* 16:9 Aspect Ratio Main Container */}
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              index === current ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {/* Standard HTML img tag for guaranteed rendering */}
            <Link href={slide.link || "#"} className="block w-full h-full">
              <img
                src={slide.src}
                alt={slide.title || "Banner"}
                className="w-full h-full object-cover"
              />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
