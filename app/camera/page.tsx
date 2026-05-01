"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";

export default function CameraPage() {
  const router = useRouter();
  const allowingObjectRef = useRef<HTMLObjectElement>(null);

  // Request camera access then route to /camera/capture once the stream is ready.
  useEffect(() => {
    let cancelled = false;
    const startedAt = Date.now();
    const MIN_DWELL_MS = 1200;

    const go = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });
        // Permission granted; stop the probe stream. /capture will re-acquire instantly.
        stream.getTracks().forEach((t) => t.stop());
      } catch {
        // Permission denied / unsupported — still navigate; capture page will show its own error if needed.
      }
      if (cancelled) return;
      const elapsed = Date.now() - startedAt;
      const wait = Math.max(0, MIN_DWELL_MS - elapsed);
      window.setTimeout(() => {
        if (!cancelled) router.replace("/camera/capture");
      }, wait);
    };

    go();
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    const objectEl = allowingObjectRef.current;
    if (!objectEl) return;

    const tweens: gsap.core.Tween[] = [];
    const svgOrigin = "370 370";

    const initRhombusAnimation = () => {
      const doc = objectEl.contentDocument;
      if (!doc) return;

      const paths = doc.querySelectorAll(
        'path[stroke="#1A1B1C"][stroke-dasharray="0.1 8"]',
      );
      if (paths.length < 3) return;

      const innerCircle = doc.querySelector('circle[r="57"]');
      if (innerCircle) {
        tweens.push(
          gsap.to(innerCircle, {
            scale: 1.15,
            opacity: 0.5,
            transformOrigin: "center center",
            svgOrigin,
            duration: 1.2,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          }),
        );
      }

      tweens.push(
        gsap.to(paths[0], {
          rotation: "+=360",
          duration: 50,
          ease: "none",
          repeat: -1,
          svgOrigin,
        }),
        gsap.to(paths[1], {
          rotation: "+=360",
          duration: 70,
          ease: "none",
          repeat: -1,
          svgOrigin,
        }),
        gsap.to(paths[2], {
          rotation: "+=360",
          duration: 85,
          ease: "none",
          repeat: -1,
          svgOrigin,
        }),
      );
    };

    objectEl.addEventListener("load", initRhombusAnimation);
    initRhombusAnimation();

    return () => {
      objectEl.removeEventListener("load", initRhombusAnimation);
      tweens.forEach((tween) => tween.kill());
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

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-[480px] w-[480px]">
          <object
            ref={allowingObjectRef}
            type="image/svg+xml"
            data="/allowing-camera.svg"
            aria-label="Allowing camera"
            tabIndex={-1}
            className="pointer-events-none h-full w-full"
          />
          <Image
            src="/Setting%20up%20camera%20....svg"
            alt="Setting up camera ..."
            width={168}
            height={12}
            priority
            className="absolute left-1/2 -translate-x-1/2 animate-pulse"
            style={{ top: "calc(50% + 56px)" }}
          />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center">
        <Image
          src="/Group%2039763.svg"
          alt="Group 39763"
          width={492}
          height={64}
          className="h-auto w-auto"
        />
      </div>
    </main>
  );
}
