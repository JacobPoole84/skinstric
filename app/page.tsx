"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const skincareRef = useRef<HTMLSpanElement>(null);
  const leftContainerRef = useRef<HTMLDivElement>(null);
  const rightContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(
      headingRef.current,
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 1.8, ease: "power2.out" }
    );
  }, []);

  // Hover "Discover A.I." → heading slides right, skincare moves a bit further right, right rect fades
  const handleDiscoverEnter = () => {
    gsap.to(headingRef.current, { x: "18vw", duration: 1.2, ease: "power2.out" });
    gsap.to(skincareRef.current, { x: 110, duration: 1.2, ease: "power2.out" });
    gsap.to(rightContainerRef.current, { opacity: 0, duration: 0.6, ease: "power2.out" });
  };
  const handleDiscoverLeave = () => {
    gsap.to(headingRef.current, { x: 0, duration: 1.2, ease: "power2.out" });
    gsap.to(skincareRef.current, { x: 0, duration: 1.2, ease: "power2.out" });
    gsap.to(rightContainerRef.current, { opacity: 1, duration: 0.6, ease: "power2.out" });
  };

  // Hover "Take Test Now" → heading slides left, skincare moves a bit further left, left rect fades
  const handleTakeTestEnter = () => {
    gsap.to(headingRef.current, { x: "-18vw", duration: 1.2, ease: "power2.out" });
    gsap.to(skincareRef.current, { x: -110, duration: 1.2, ease: "power2.out" });
    gsap.to(leftContainerRef.current, { opacity: 0, duration: 0.6, ease: "power2.out" });
  };
  const handleTakeTestLeave = () => {
    gsap.to(headingRef.current, { x: 0, duration: 1.2, ease: "power2.out" });
    gsap.to(skincareRef.current, { x: 0, duration: 1.2, ease: "power2.out" });
    gsap.to(leftContainerRef.current, { opacity: 1, duration: 0.6, ease: "power2.out" });
  };

  return (
    <main className="relative flex min-h-screen flex-col overflow-x-hidden bg-white px-4 py-4 sm:px-6 sm:py-5 md:px-10">
      <div
        ref={leftContainerRef}
        className="absolute top-1/2 left-0 hidden h-[604px] w-[302px] -translate-y-1/2 lg:block"
      >
        <Image
          src="/Rectangle 2779.svg"
          alt=""
          fill
          className="pointer-events-none object-contain"
        />
        <Image
          src="/button-icon-text-shrunk.svg"
          alt="Discover A.I."
          width={150}
          height={44}
          onMouseEnter={handleDiscoverEnter}
          onMouseLeave={handleDiscoverLeave}
          className="pointer-events-auto absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-200 ease-out hover:scale-105"
        />
      </div>

      <div
        ref={rightContainerRef}
        className="absolute top-1/2 right-0 hidden h-[604px] w-[302px] -translate-y-1/2 lg:block"
      >
        <Image
          src="/Rectangle 2778.svg"
          alt=""
          fill
          className="pointer-events-none object-contain"
        />
        <Link
          href="/testing"
          onMouseEnter={handleTakeTestEnter}
          onMouseLeave={handleTakeTestLeave}
          className="pointer-events-auto absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <Image
            src="/button-icon-text-shrunk (1).svg"
            alt="Take Test Now"
            width={150}
            height={44}
            className="cursor-pointer transition-transform duration-200 ease-out hover:scale-105"
          />
        </Link>
      </div>

      <nav className="mx-auto flex w-full max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3 text-[13px] font-semibold tracking-wide text-black sm:gap-4 sm:text-[14px]">
          <Link href="/" className="transition-opacity hover:opacity-70">
            SKINSTRIC
          </Link>
          <span className="text-gray-500">[ INTRO ]</span>
        </div>

        <button
          type="button"
          className="self-start bg-black px-4 py-2 text-[10px] font-semibold tracking-wide text-white transition-opacity hover:opacity-85 sm:self-auto"
        >
          ENTER CODE
        </button>
      </nav>

      <h1
        ref={headingRef}
        className="pointer-events-none absolute inset-0 hidden flex-col items-center justify-center text-center text-[100px] font-light leading-[100px] text-black lg:flex"
      >
        <span>Sophisticated</span>
        <span ref={skincareRef}>skincare</span>
      </h1>

      <section className="flex flex-1 flex-col justify-center py-10 lg:hidden">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
          <h1 className="text-[clamp(3rem,11vw,5.5rem)] font-light leading-[0.95] text-black">
            <span className="block">Sophisticated</span>
            <span className="block">skincare</span>
          </h1>

          <div className="mt-10 flex w-full justify-center">
            <Link href="/testing" className="self-center">
              <Image
                src="/button-icon-text-shrunk (1).svg"
                alt="Take Test Now"
                width={150}
                height={44}
                className="h-auto w-full max-w-[210px] cursor-pointer transition-transform duration-200 ease-out hover:scale-105"
              />
            </Link>
          </div>

          <div className="mt-10 w-full max-w-[316px]">
            <Image
              src="/Skinstric developed an A.I. that creates a highly-personalised routine tailored to what your skin needs..svg"
              alt="Skinstric developed an A.I. that creates a highly-personalised routine tailored to what your skin needs."
              width={316}
              height={72}
              className="h-auto w-full"
            />
          </div>
        </div>
      </section>

      <div className="pointer-events-none absolute inset-x-0 bottom-8 z-10 mx-auto hidden w-full max-w-6xl lg:block">
        <Image
          src="/Skinstric developed an A.I. that creates a highly-personalised routine tailored to what your skin needs..svg"
          alt="Skinstric developed an A.I. that creates a highly-personalised routine tailored to what your skin needs."
          width={316}
          height={72}
          className="rotate-0 opacity-100"
        />
      </div>
    </main>
  );
}
