"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function CapturePage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch {
        if (!cancelled) setError("Unable to access camera.");
      }
    })();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, []);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/png");
    setCapturedImage(dataUrl);
    stopStream();
  };

  const handleProceed = async () => {
    if (!capturedImage || submitting) return;
    setSubmitting(true);
    const base64 = capturedImage.split(",")[1] ?? "";
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
      if (data?.data && typeof window !== "undefined") {
        localStorage.setItem("demographics", JSON.stringify(data.data));
      }
    } catch {
      /* ignore network errors — still proceed */
    } finally {
      router.push("/select");
    }
  };

  return (
    <main className="relative h-screen overflow-hidden bg-black">
      {/* Live webcam fills the screen (hidden once a photo is captured) */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 h-full w-full object-cover ${
          capturedImage ? "hidden" : ""
        }`}
      />

      {/* Captured still — fills the screen identically */}
      {capturedImage && (
        <img
          src={capturedImage}
          alt="Captured"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-sm text-white">
          {error}
        </div>
      )}

      {/* Top navbar */}
      <nav className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5 md:px-10">
        <div className="flex items-center gap-4 text-[16px] leading-[24px] font-semibold tracking-wide text-white">
          <Link href="/" className="transition-opacity hover:opacity-70">
            SKINSTRIC
          </Link>
          <span className="text-white/60">[ INTRO ]</span>
        </div>

        <button
          type="button"
          className="my-0 mx-4 bg-white px-4 py-2 text-[10px] font-semibold tracking-wide text-black transition-opacity hover:opacity-85"
        >
          ENTER CODE
        </button>
      </nav>

      {/* "GREAT SHOT!" headline shown after capture, just under the navbar */}
      {capturedImage && (
        <div className="pointer-events-none absolute inset-x-0 top-20 z-10 flex justify-center">
          <p className="text-2xl font-semibold tracking-wide text-white drop-shadow-md md:text-3xl">
            GREAT SHOT!
          </p>
        </div>
      )}

      {/* Take picture button - right center (only while live) */}
      {!capturedImage && (
        <button
          type="button"
          onClick={handleCapture}
          aria-label="Take picture"
          className="absolute right-8 top-1/2 z-10 -translate-y-1/2 cursor-pointer transition-transform duration-200 ease-out hover:scale-110"
        >
          <Image
            src="/take-pic.svg"
            alt="Take picture"
            width={120}
            height={120}
            priority
            className="h-auto w-auto"
          />
        </button>
      )}

      {/* Proceed button - bottom right (only after capture) */}
      {capturedImage && (
        <button
          type="button"
          onClick={handleProceed}
          disabled={submitting}
          aria-label="Proceed"
          className="absolute bottom-8 right-8 z-10 cursor-pointer transition-transform duration-200 ease-out hover:scale-110 disabled:opacity-60"
        >
          <Image
            src="/button-proceed.svg"
            alt="Proceed"
            width={140}
            height={42}
            className="h-auto w-auto"
          />
        </button>
      )}

      {/* Analyzing image loading modal */}
      {submitting && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          role="status"
          aria-live="polite"
          aria-label="Analyzing image"
        >
          <div className="flex flex-col items-center gap-4 bg-[#1A1B1C] px-10 py-8 text-white">
            <p className="text-sm font-semibold tracking-[0.2em]">
              ANALYZING IMAGE
            </p>
            <div className="flex items-center justify-center gap-2" aria-hidden="true">
              <span className="h-2 w-2 animate-bounce rounded-full bg-white [animation-delay:-0.3s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-white [animation-delay:-0.15s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-white" />
            </div>
          </div>
        </div>
      )}

      {/* Back button - bottom left */}
      <button
        type="button"
        onClick={() => router.replace("/result")}
        aria-label="Go back"
        className="absolute bottom-8 left-8 z-10 cursor-pointer transition-transform duration-200 ease-out hover:scale-110"
      >
        <Image
          src="/button-icon-text-shrunk%20(2).svg"
          alt="Back"
          width={124}
          height={26}
          className="h-auto w-auto"
        />
      </button>
    </main>
  );
}
