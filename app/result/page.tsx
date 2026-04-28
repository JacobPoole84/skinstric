"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";

export default function ResultPage() {
  const router = useRouter();
  const cameraObjectRef = useRef<HTMLObjectElement>(null);
  const galleryObjectRef = useRef<HTMLObjectElement>(null);
  // File input ref for gallery upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  // State for API response
  const [demographics, setDemographics] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  // Gallery click handler: open file picker
  const handleGalleryClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file selection and upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    // Convert to base64
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = (event.target?.result as string)?.split(",")[1];
      if (!base64) return setUploading(false);
      // POST to API
      try {
        const res = await fetch(
          "https://us-central1-api-skinstric-ai.cloudfunctions.net/skinstricPhaseTwo",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: base64 }),
          },
        );
        const data = await res.json();
        setDemographics(data.data || null);
      } catch (err) {
        setDemographics(null);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };
  // Store GSAP tweens for inner graphics
  const cameraTweenRef = useRef<gsap.core.Tween | null>(null);
  const galleryTweenRef = useRef<gsap.core.Tween | null>(null);
  const CAMERA_CENTER = "242 242";
  const GALLERY_CENTER = "247 242";
  // Helper to select inner graphic elements in camera.svg
  const getCameraInnerElements = (doc: Document | null) => {
    if (!doc) return [];
    // Two center circles and all white fill paths (the camera's inner graphic)
    const circles = Array.from(
      doc.querySelectorAll('circle[cx="242"][cy="242"]'),
    );
    // All white fill paths (center and donut)
    const whitePaths = Array.from(doc.querySelectorAll('path[fill="#FCFCFC"]'));
    return [...circles, ...whitePaths];
  };
  // Helper to select inner graphic elements in gallery.svg
  const getGalleryInnerElements = (doc: Document | null) => {
    if (!doc) return [];
    // We'll use the two center circles and the filled center path
    const circles = Array.from(
      doc.querySelectorAll('circle[cx="247"][cy="242"]'),
    );
    const centerPath = doc.querySelector('path[d^="M257.321 242"]');
    const donutPath = doc.querySelector(
      'path[fill-rule="evenodd"][clip-rule="evenodd"]',
    );
    return [
      ...circles,
      ...(centerPath ? [centerPath] : []),
      ...(donutPath ? [donutPath] : []),
    ];
  };
  // Camera hover handlers (triggered by overlay hit area)
  const handleCameraMouseEnter = useCallback(() => {
    const objectEl = cameraObjectRef.current;
    if (!objectEl) return;
    const doc = objectEl.contentDocument;
    const elements = getCameraInnerElements(doc);
    if (elements.length === 0) return;
    cameraTweenRef.current?.kill();
    cameraTweenRef.current = gsap.to(elements, {
      scale: 1.18,
      svgOrigin: CAMERA_CENTER,
      duration: 0.28,
      ease: "power2.out",
    });
  }, []);

  const handleCameraMouseLeave = useCallback(() => {
    const objectEl = cameraObjectRef.current;
    if (!objectEl) return;
    const doc = objectEl.contentDocument;
    const elements = getCameraInnerElements(doc);
    if (elements.length === 0) return;
    cameraTweenRef.current?.kill();
    cameraTweenRef.current = gsap.to(elements, {
      scale: 1,
      svgOrigin: CAMERA_CENTER,
      duration: 0.22,
      ease: "power2.inOut",
    });
  }, []);

  // Gallery hover handlers (triggered by overlay hit area)
  const handleGalleryMouseEnter = useCallback(() => {
    const objectEl = galleryObjectRef.current;
    if (!objectEl) return;
    const doc = objectEl.contentDocument;
    const elements = getGalleryInnerElements(doc);
    if (elements.length === 0) return;
    galleryTweenRef.current?.kill();
    galleryTweenRef.current = gsap.to(elements, {
      scale: 1.18,
      svgOrigin: GALLERY_CENTER,
      duration: 0.28,
      ease: "power2.out",
    });
  }, []);

  const handleGalleryMouseLeave = useCallback(() => {
    const objectEl = galleryObjectRef.current;
    if (!objectEl) return;
    const doc = objectEl.contentDocument;
    const elements = getGalleryInnerElements(doc);
    if (elements.length === 0) return;
    galleryTweenRef.current?.kill();
    galleryTweenRef.current = gsap.to(elements, {
      scale: 1,
      svgOrigin: GALLERY_CENTER,
      duration: 0.22,
      ease: "power2.inOut",
    });
  }, []);

  useEffect(() => {
    const targets = [
      { ref: cameraObjectRef, svgOrigin: "242 242" },
      { ref: galleryObjectRef, svgOrigin: "247 242" },
    ] as const;
    const cleanupFns: Array<() => void> = [];

    targets.forEach(({ ref, svgOrigin }) => {
      const objectEl = ref.current;
      if (!objectEl) return;

      const tweens: gsap.core.Tween[] = [];

      const initRhombusAnimation = () => {
        const doc = objectEl.contentDocument;
        if (!doc) return;

        const paths = doc.querySelectorAll(
          'path[stroke="#A0A4AB"][stroke-dasharray="0.1 8"]',
        );
        if (paths.length < 3) return;

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

      cleanupFns.push(() => {
        objectEl.removeEventListener("load", initRhombusAnimation);
        tweens.forEach((tween) => tween.kill());
      });
    });

    return () => {
      cleanupFns.forEach((cleanup) => cleanup());
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
        <Image
          src="/To%20start%20analysis.svg"
          alt="To start analysis"
          width={320}
          height={80}
          priority
          className="h-auto w-auto"
        />
      </div>

      <div className="absolute right-6 top-16 md:right-32 flex flex-col items-start gap-2">
        <p className="text-sm font-medium tracking-wide text-[#1A1B1C]">
          Preview
        </p>
        <div className="h-32 w-32 border-2 border-gray-300 bg-white" />
      </div>

      <div className="pointer-events-none absolute inset-0 flex">
        <div className="relative w-1/2 flex items-center justify-center pointer-events-none">
          <object
            ref={cameraObjectRef}
            type="image/svg+xml"
            data="/camera.svg"
            aria-label="Camera"
            className="h-auto w-auto"
            tabIndex={-1}
            style={{ pointerEvents: "none" }}
          />
          {/* Overlay invisible SVG hit area for camera inner graphic */}
          <svg
            width={116}
            height={116}
            viewBox="0 0 116 116"
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              pointerEvents: "auto",
              zIndex: 10,
              cursor: "pointer",
            }}
            onMouseEnter={handleCameraMouseEnter}
            onMouseLeave={handleCameraMouseLeave}
            aria-label="Camera Inner Graphic Hover Area"
          >
            {/* Circles match the inner graphic's center (242,242) and radii (58, 51) in the SVG, so overlay is centered */}
            <circle cx="58" cy="58" r="58" fill="transparent" />
            <circle cx="58" cy="58" r="51" fill="transparent" />
          </svg>
        </div>
        <div className="relative w-1/2 flex items-center justify-center pointer-events-none">
          <object
            ref={galleryObjectRef}
            type="image/svg+xml"
            data="/gallery.svg"
            aria-label="Gallery"
            className="h-auto w-auto"
            tabIndex={-1}
            style={{ pointerEvents: "none" }}
          />
          {/* Overlay invisible SVG hit area for inner graphic */}
          <svg
            width={116}
            height={116}
            viewBox="0 0 116 116"
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              pointerEvents: "auto",
              zIndex: 10,
              cursor: uploading ? "progress" : "pointer",
            }}
            onMouseEnter={handleGalleryMouseEnter}
            onMouseLeave={handleGalleryMouseLeave}
            onClick={uploading ? undefined : handleGalleryClick}
            aria-label="Gallery Inner Graphic Hover Area"
          >
            <circle cx="58" cy="58" r="58" fill="transparent" />
            <circle cx="58" cy="58" r="50" fill="transparent" />
          </svg>
          {/* Hidden file input for gallery upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-8 z-30 mx-auto w-full max-w-6xl">
        <button
          type="button"
          onClick={() => router.back()}
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
