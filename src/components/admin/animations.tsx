"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export const useFadeIn = (delay = 0) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(
        ref.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay,
          ease: "power3.out",
        }
      );
    }
  }, [delay]);

  return ref;
};

export const useSlideIn = (direction: "left" | "right" | "up" | "down" = "left", delay = 0) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const directions = {
        left: { x: -50, y: 0 },
        right: { x: 50, y: 0 },
        up: { x: 0, y: -50 },
        down: { x: 0, y: 50 },
      };

      gsap.fromTo(
        ref.current,
        { opacity: 0, ...directions[direction] },
        {
          opacity: 1,
          x: 0,
          y: 0,
          duration: 0.6,
          delay,
          ease: "power3.out",
        }
      );
    }
  }, [direction, delay]);

  return ref;
};

export const useStagger = (delay = 0, staggerDelay = 0.1) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const children = ref.current.children;
      gsap.fromTo(
        Array.from(children),
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          delay,
          stagger: staggerDelay,
          ease: "power2.out",
        }
      );
    }
  }, [delay, staggerDelay]);

  return ref;
};

export const useScaleIn = (delay = 0) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(
        ref.current,
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          delay,
          ease: "back.out(1.7)",
        }
      );
    }
  }, [delay]);

  return ref;
};

export const useHoverAnimation = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const element = ref.current;

      const handleMouseEnter = () => {
        gsap.to(element, {
          scale: 1.02,
          duration: 0.3,
          ease: "power2.out",
        });
      };

      const handleMouseLeave = () => {
        gsap.to(element, {
          scale: 1,
          duration: 0.3,
          ease: "power2.out",
        });
      };

      element.addEventListener("mouseenter", handleMouseEnter);
      element.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        element.removeEventListener("mouseenter", handleMouseEnter);
        element.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, []);

  return ref;
};
