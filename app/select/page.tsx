"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useRef, useEffect } from "react";
import gsap from "gsap";

export default function SelectPage() {
  const router = useRouter();
  const groupObjectRef = useRef<HTMLObjectElement>(null);
  const rombusesObjectRef = useRef<HTMLObjectElement>(null);

  useEffect(() => {
    const objectEl = groupObjectRef.current;
    const rombusesEl = rombusesObjectRef.current;
    if (!objectEl) return;

    const cleanupFns: Array<() => void> = [];

    type RhombusSize = "small" | "medium" | "large";
    const rhombusConfig: Record<RhombusSize, { selector: string; targetOpacity: number }> = {
      small: { selector: 'path[d^="M382 81L683 382"]', targetOpacity: 1 },
      medium: { selector: 'path[d^="M382 41L723 382"]', targetOpacity: 1 },
      large: { selector: 'path[d^="M382 1L763 382"]', targetOpacity: 1 },
    };

    const getRhombus = (size: RhombusSize): SVGElement | null => {
      const doc = rombusesEl?.contentDocument;
      if (!doc) return null;
      return doc.querySelector(rhombusConfig[size].selector) as SVGElement | null;
    };

    const RHOMBUS_ORIGIN = "382 382";

    const initRhombuses = () => {
      const doc = rombusesEl?.contentDocument;
      if (!doc) return;
      (Object.keys(rhombusConfig) as RhombusSize[]).forEach((size) => {
        const el = getRhombus(size);
        if (!el) return;
        // Remove the baked-in SVG opacity attribute so gsap's opacity wins.
        el.removeAttribute("opacity");
        // Darken the large rhombus stroke for better visibility.
        if (size === "large") el.setAttribute("stroke", "#5A5F66");
        gsap.set(el, { opacity: 0, scale: 0.6, svgOrigin: RHOMBUS_ORIGIN });
      });
      // Reveal the object only after paths are zeroed, to avoid a flash.
      if (rombusesEl) rombusesEl.style.visibility = "visible";
    };

    const revealRhombus = (size: RhombusSize) => {
      const el = getRhombus(size);
      if (!el) return;
      gsap.to(el, {
        opacity: rhombusConfig[size].targetOpacity,
        scale: 1,
        svgOrigin: RHOMBUS_ORIGIN,
        duration: 0.4,
        ease: "power2.out",
        overwrite: true,
      });
    };

    const hideRhombus = (size: RhombusSize) => {
      const el = getRhombus(size);
      if (!el) return;
      gsap.to(el, {
        opacity: 0,
        scale: 0.6,
        svgOrigin: RHOMBUS_ORIGIN,
        duration: 0.3,
        ease: "power2.inOut",
        overwrite: true,
      });
    };

    if (rombusesEl) {
      rombusesEl.addEventListener("load", initRhombuses);
      setTimeout(initRhombuses, 200);
      cleanupFns.push(() => rombusesEl.removeEventListener("load", initRhombuses));
    }

    const setupHover = () => {
      const doc = objectEl.contentDocument;
      if (!doc) return;

      // Expand viewBox so scaled rhombus points don't clip
      const svg = doc.querySelector("svg");
      if (svg) {
        const padding = 30;
        svg.setAttribute("viewBox", `${-padding} ${-padding} ${444 + padding * 2} ${444 + padding * 2}`);
        svg.setAttribute("width", `${444 + padding * 2}`);
        svg.setAttribute("height", `${444 + padding * 2}`);
        svg.setAttribute("overflow", "visible");
      }

      const sections: Array<{
        rectSelector: string;
        pathSelector: string;
        isTop: boolean;
        svgOrigin: string;
        rhombus: RhombusSize;
      }> = [
        { rectSelector: 'rect[x="221.801"]', pathSelector: 'path[d^="M165.298 114.972"]', isTop: true, svgOrigin: "221.8 108.8", rhombus: "small" },
        { rectSelector: 'rect[x="108.809"]', pathSelector: 'path[d^="M76.4873 216.09"]', isTop: false, svgOrigin: "108.8 221.8", rhombus: "medium" },
        { rectSelector: 'rect[x="333.6"]', pathSelector: 'path[d^="M300.488 216.128"]', isTop: false, svgOrigin: "333.6 221.8", rhombus: "medium" },
        { rectSelector: 'rect[x="221.795"]', pathSelector: 'path[d^="M190.797 341"]', isTop: false, svgOrigin: "221.8 334.8", rhombus: "large" },
      ];

      sections.forEach(({ rectSelector, pathSelector, isTop, svgOrigin, rhombus }) => {
        const rect = doc.querySelector(rectSelector);
        const path = doc.querySelector(pathSelector);
        if (!rect || !path) return;

        const originalFill = rect.getAttribute("fill") || "";
        const cursor = isTop ? "pointer" : "not-allowed";
        (rect as SVGElement).style.cursor = cursor;
        (path as SVGElement).style.cursor = cursor;

        // Track whether the cursor is over rect, path, or both, so moving
        // between them (within the same section) doesn't trigger a hide.
        let activeCount = 0;

        const onEnter = () => {
          activeCount += 1;
          if (activeCount > 1) return;
          gsap.to(rect, { fill: "#A0A4AB", duration: 0.2, ease: "power2.out" });
          gsap.to([rect, path], {
            scale: 1.05,
            svgOrigin,
            duration: 0.2,
            ease: "power2.out",
          });
          revealRhombus(rhombus);
        };
        const onLeave = (e: Event) => {
          const ev = e as MouseEvent;
          // If moving to the sibling element of the same section, ignore.
          if (ev.relatedTarget === rect || ev.relatedTarget === path) {
            activeCount = Math.max(0, activeCount - 1);
            return;
          }
          activeCount = Math.max(0, activeCount - 1);
          if (activeCount > 0) return;
          gsap.to(rect, { fill: originalFill, duration: 0.2, ease: "power2.inOut" });
          gsap.to([rect, path], {
            scale: 1,
            svgOrigin,
            duration: 0.2,
            ease: "power2.inOut",
          });
          hideRhombus(rhombus);
        };

        rect.addEventListener("mouseenter", onEnter);
        rect.addEventListener("mouseleave", onLeave);
        path.addEventListener("mouseenter", onEnter);
        path.addEventListener("mouseleave", onLeave);

        const onClick = isTop ? () => router.push("/summary") : null;
        if (onClick) {
          rect.addEventListener("click", onClick);
          path.addEventListener("click", onClick);
        }

        cleanupFns.push(() => {
          rect.removeEventListener("mouseenter", onEnter);
          rect.removeEventListener("mouseleave", onLeave);
          path.removeEventListener("mouseenter", onEnter);
          path.removeEventListener("mouseleave", onLeave);
          if (onClick) {
            rect.removeEventListener("click", onClick);
            path.removeEventListener("click", onClick);
          }
        });
      });
    };

    objectEl.addEventListener("load", setupHover);
    const timeoutId = setTimeout(setupHover, 200);

    return () => {
      objectEl.removeEventListener("load", setupHover);
      clearTimeout(timeoutId);
      cleanupFns.forEach((fn) => fn());
    };
  }, []);

  return (
    <main className="relative h-screen overflow-hidden bg-white px-6 py-5 md:px-10">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <div className="flex items-center gap-4 text-[16px] leading-[24px] font-semibold tracking-wide text-black">
          <Link href="/" className="transition-opacity hover:opacity-70">
            SKINSTRIC
          </Link>
          <span className="text-gray-500">[ INTRO ]</span>
        </div>

        <button
          type="button"
          className="my-0 mx-4 bg-black px-4 py-2 text-[10px] font-semibold tracking-wide text-white transition-opacity hover:opacity-85"
        >
          ENTER CODE
        </button>
      </nav>

      <div className="mx-auto w-full max-w-6xl pt-4">
        <p className="text-sm font-semibold tracking-wide text-black">
          A.I. ANALYSIS
        </p>
        <p className="text-sm tracking-wide text-black">
          A.I. has estimated the following.
        </p>
        <p className="text-sm tracking-wide text-black">
          Fix estimated information if needed.
        </p>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <object
          ref={rombusesObjectRef}
          type="image/svg+xml"
          data="/rombuses-select.svg"
          aria-label="Rombuses"
          className="h-auto w-auto"
          tabIndex={-1}
          style={{ pointerEvents: "none", visibility: "hidden" }}
        />
        <object
          ref={groupObjectRef}
          type="image/svg+xml"
          data="/Group 39959.svg"
          aria-label="Group 39959"
          className="h-auto w-auto absolute overflow-visible"
          tabIndex={-1}
        />
      </div>

      <div className="absolute inset-x-0 bottom-8 z-30 mx-auto w-full max-w-6xl">
        <div className="flex justify-end pr-4">
          <button
            type="button"
            onClick={() => router.push("/summary")}
            className="cursor-pointer transition-transform duration-200 ease-out hover:scale-110"
            aria-label="Get summary"
          >
            <Image
              src="/button-get-summary.svg"
              alt="Get summary"
              width={220}
              height={42}
              className="h-auto w-auto"
              priority
            />
          </button>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-8 z-30 mx-auto w-full max-w-6xl">
        <button
          type="button"
          onClick={() => router.push("/result")}
          className="pointer-events-auto cursor-pointer transition-transform duration-200 ease-out hover:scale-110"
          aria-label="Go back"
        >
          <Image
            src="/button-icon-text-shrunk%20(2).svg"
            alt="Back"
            width={124}
            height={26}
            className="h-auto w-auto"
          />
        </button>
      </div>
    </main>
  );
}
