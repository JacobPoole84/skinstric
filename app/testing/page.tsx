"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";

type PhaseOneData = {
  name: string;
  location: string;
};

const STORAGE_KEY = "skinstric-phase1";
const PHASE_ONE_ENDPOINT = "https://us-central1-api-skinstric-ai.cloudfunctions.net/skinstricPhaseOne";

const isValidTextField = (value: string) => {
  const trimmed = value.trim();
  if (trimmed.length < 2 || trimmed.length > 60) return false;
  return /^[A-Za-z]+(?:[A-Za-z\s'.-]*[A-Za-z])?$/.test(trimmed);
};

export default function TestingPage() {
  const router = useRouter();
  const rhombusesObjectRef = useRef<HTMLObjectElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const proceedButtonRef = useRef<HTMLButtonElement>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);
  const [formData, setFormData] = useState<PhaseOneData>({ name: "", location: "" });

  const questions = [
    { key: "name", placeholder: "Introduce Yourself" },
    { key: "location", placeholder: "your city name" },
  ] as const;

  const currentQuestion = questions[stepIndex];

  const persistData = (nextData: PhaseOneData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
  };

  const handleIntroSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedAnswer = answer.trim();
    if (!isValidTextField(trimmedAnswer)) {
      setErrorMessage("Please enter letters only (no numbers or invalid symbols).");
      setAnswer("");
      inputRef.current?.focus();
      return;
    }

    setErrorMessage("");

    const nextData = {
      ...formData,
      [currentQuestion.key]: trimmedAnswer,
    } as PhaseOneData;

    setFormData(nextData);
    persistData(nextData);

    if (stepIndex < questions.length - 1) {
      setStepIndex((previous) => previous + 1);
      setAnswer("");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(PHASE_ONE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: nextData.name,
          location: nextData.location,
        }),
      });

      const payload = (await response.json()) as { SUCCUSS?: string; SUCCESS?: string; message?: string };
      if (!response.ok) {
        throw new Error(payload?.message || "Failed to submit customer data.");
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsSubmitSuccess(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to submit customer data.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const objectEl = rhombusesObjectRef.current;
    if (!objectEl) return;

    const tweens: gsap.core.Tween[] = [];

    const initRhombusAnimation = () => {
      const doc = objectEl.contentDocument;
      if (!doc) return;

      const paths = doc.querySelectorAll("path");
      if (paths.length < 3) return;

      tweens.push(
        gsap.to(paths[0], { rotation: "+=360", duration: 50, ease: "none", repeat: -1, svgOrigin: "382 382" }),
        gsap.to(paths[1], { rotation: "+=360", duration: 70, ease: "none", repeat: -1, svgOrigin: "382 382" }),
        gsap.to(paths[2], { rotation: "+=360", duration: 85, ease: "none", repeat: -1, svgOrigin: "382 382" })
      );
    };

    objectEl.addEventListener("load", initRhombusAnimation);
    initRhombusAnimation();

    return () => {
      objectEl.removeEventListener("load", initRhombusAnimation);
      tweens.forEach((tween) => tween.kill());
    };
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, [stepIndex]);

  useEffect(() => {
    if (!isSubmitSuccess || !proceedButtonRef.current) return;

    const tween = gsap.fromTo(
      proceedButtonRef.current,
      { autoAlpha: 0, y: 22, scale: 0.92 },
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        ease: "power3.out",
        clearProps: "opacity,visibility,transform",
      }
    );

    return () => {
      tween.kill();
    };
  }, [isSubmitSuccess]);

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

      {!isSubmitSuccess && !isSubmitting ? (
        <form
          onSubmit={handleIntroSubmit}
          className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center"
        >
          <p className="mb-4 text-center text-sm tracking-wide text-[#1A1B1C]">CLICK TO TYPE</p>
          {errorMessage ? (
            <p className="mb-3 text-center text-xs font-medium tracking-wide text-[#B42318]">{errorMessage}</p>
          ) : null}
          <div className="flex items-end gap-4">
            <input
              ref={inputRef}
              type="text"
              name={currentQuestion.key}
              placeholder={currentQuestion.placeholder}
              autoFocus
              value={answer}
              onChange={(event) => {
                setAnswer(event.target.value);
                if (errorMessage) setErrorMessage("");
              }}
              className="pointer-events-auto w-[18ch] max-w-[90vw] border-b border-black bg-transparent px-0 pb-2 text-center text-5xl leading-tight text-black outline-none placeholder:text-[#8C9198]"
            />
            <button type="submit" className="sr-only" disabled={isSubmitting}>
              Submit
            </button>
          </div>
        </form>
      ) : null}

      {isSubmitting ? (
        <section className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center text-center">
          <h2 className="text-3xl font-semibold tracking-wide text-[#1A1B1C]">Processing Submission</h2>
          <div className="mt-4 flex items-center justify-center gap-2" aria-label="Loading">
            <span className="h-2 w-2 animate-bounce rounded-full bg-black [animation-delay:-0.3s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-black [animation-delay:-0.15s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-black" />
          </div>
        </section>
      ) : null}

      {isSubmitSuccess ? (
        <section className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center text-center">
          <h2 className="text-4xl font-semibold tracking-wide text-[#1A1B1C]">Thank You!</h2>
          <p className="mt-2 text-base tracking-wide text-[#1A1B1C]">Proceed to the next step.</p>
        </section>
      ) : null}

      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[min(762px,90vmin)] w-[min(762px,90vmin)] -translate-x-1/2 -translate-y-1/2 opacity-100">
        <object
          ref={rhombusesObjectRef}
          type="image/svg+xml"
          data="/rombuses.svg"
          aria-label="Rombuses"
          className="h-full w-full"
        />
      </div>

      {isSubmitSuccess ? (
        <div className="absolute inset-x-0 bottom-8 z-30 mx-auto w-full max-w-6xl">
          <div className="flex justify-end pr-4">
            <button
              ref={proceedButtonRef}
              type="button"
              onClick={() => router.push("/result")}
              className="cursor-pointer transition-transform duration-200 ease-out hover:scale-110"
              aria-label="Proceed to the next step"
            >
              <Image
                src="/proceed-button-icon-text.svg"
                alt="Proceed to the next step"
                width={220}
                height={42}
                className="h-auto w-auto"
                priority
              />
            </button>
          </div>
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 bottom-8 z-30 mx-auto w-full max-w-6xl">
        <button
          type="button"
          onClick={() => router.replace("/")}
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
