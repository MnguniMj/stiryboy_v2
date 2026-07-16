"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { heroSlides } from "@/lib/data";

export function HeroCarousel() {
  const [active, setActive] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const slide = heroSlides[active];
  const previousSlide = previous === null ? null : heroSlides[previous];

  function transitionTo(getNext: (current: number) => number) {
    setActive((current) => {
      const next = (getNext(current) + heroSlides.length) % heroSlides.length;

      if (next !== current) {
        setPrevious(current);
      }

      return next;
    });
  }

  useEffect(() => {
    const timer = window.setInterval(() => {
      transitionTo((value) => value + 1);
    }, 5500);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (previous === null) {
      return;
    }

    const clearPrevious = window.setTimeout(() => {
      setPrevious(null);
    }, 650);

    return () => window.clearTimeout(clearPrevious);
  }, [active, previous]);

  function move(direction: number) {
    transitionTo((value) => value + direction);
  }

  return (
    <section className="relative isolate min-h-[520px] overflow-hidden bg-slate-950 text-white">
      {previousSlide && previous !== active ? (
        <div className="absolute inset-0 z-0">
          <Image
            src={previousSlide.image}
            alt={previousSlide.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-amazon-navy via-amazon-navy/70 to-transparent" />
          <div className="hero-bottom-fade absolute inset-x-0 bottom-0" />
        </div>
      ) : null}

      <motion.div
        key={slide.title}
        initial={previousSlide ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 z-10"
      >
        <Image src={slide.image} alt={slide.title} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-amazon-navy via-amazon-navy/70 to-transparent" />
        <div className="hero-bottom-fade absolute inset-x-0 bottom-0" />
      </motion.div>

      <div className="relative z-20 mx-auto flex min-h-[520px] max-w-7xl flex-col justify-center px-5 py-12">
        <motion.div
          key={`${slide.title}-content`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="max-w-2xl"
        >
          <p className="mb-4 inline-flex rounded-sm bg-amazon-gold px-3 py-1 text-sm font-black uppercase text-slate-950">
            {slide.eyebrow}
          </p>
          <h1 className="text-4xl font-black tracking-normal sm:text-5xl lg:text-6xl">{slide.title}</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-100 sm:text-lg">{slide.description}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/search"
              className="inline-flex h-11 items-center rounded-md bg-amazon-gold px-4 text-sm font-bold text-slate-950 shadow-sm hover:bg-[#f5a742]"
            >
              {slide.cta}
            </Link>
            <Link
              href="/search?sort=discount"
              className="inline-flex h-11 items-center rounded-md border border-white/30 px-4 text-sm font-bold hover:bg-white/10"
            >
              View lightning deals
            </Link>
          </div>
        </motion.div>

        <div className="absolute bottom-16 right-5 flex gap-2">
          <button
            type="button"
            onClick={() => move(-1)}
            className="rounded-full bg-white/90 p-2 text-slate-950 shadow-md hover:bg-white"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            className="rounded-full bg-white/90 p-2 text-slate-950 shadow-md hover:bg-white"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
