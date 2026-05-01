"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

type Category = "race" | "age" | "sex";

type Demographics = {
  race: Record<string, number>;
  age: Record<string, number>;
  gender: Record<string, number>;
};

const CATEGORY_LABEL: Record<Category, string> = {
  race: "RACE",
  age: "AGE",
  sex: "SEX",
};

const CATEGORIES: Category[] = ["race", "age", "sex"];

const titleCase = (s: string) =>
  s
    .split(" ")
    .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");

const formatPct = (v: number) => `${(v * 100).toFixed(2)} %`;

const topKey = (obj: Record<string, number> | undefined) => {
  if (!obj) return "";
  return (
    Object.entries(obj).sort((a, b) => b[1] - a[1])[0]?.[0] ?? ""
  );
};

export default function SummaryPage() {
  const router = useRouter();
  const [demographics, setDemographics] = useState<Demographics | null>(null);
  const [category, setCategory] = useState<Category>("race");
  const [selected, setSelected] = useState<Record<Category, string>>({
    race: "",
    age: "",
    sex: "",
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("demographics");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Demographics;
      setDemographics(parsed);

      const savedRaw = localStorage.getItem("selectedDemographics");
      if (savedRaw) {
        try {
          const saved = JSON.parse(savedRaw) as Record<Category, string>;
          setSelected({
            race: saved.race || topKey(parsed.race),
            age: saved.age || topKey(parsed.age),
            sex: saved.sex || topKey(parsed.gender),
          });
          return;
        } catch {
          /* fall through to defaults */
        }
      }

      setSelected({
        race: topKey(parsed.race),
        age: topKey(parsed.age),
        sex: topKey(parsed.gender),
      });
    } catch {
      /* ignore */
    }
  }, []);

  const getMap = (cat: Category): Record<string, number> => {
    if (!demographics) return {};
    return cat === "sex" ? demographics.gender : demographics[cat];
  };

  const sortedEntries = (cat: Category) =>
    Object.entries(getMap(cat)).sort((a, b) => b[1] - a[1]);

  const activeEntries = sortedEntries(category);
  const activeKey = selected[category] || activeEntries[0]?.[0] || "";
  const activeValue = getMap(category)[activeKey] ?? 0;

  const handleConfirm = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedDemographics", JSON.stringify(selected));
    }
    router.push("/select");
  };

  return (
    <main className="relative flex min-h-screen flex-col lg:overflow-hidden lg:h-screen bg-white px-4 py-4 sm:px-6 sm:py-5 md:px-10">
      <nav className="mx-auto flex w-full max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3 text-[14px] leading-[20px] font-semibold tracking-wide text-black sm:gap-4 sm:text-[16px] sm:leading-[24px]">
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

      <div className="mx-auto w-full max-w-6xl pt-4">
        <p className="text-sm font-bold tracking-wide text-black">
          A.I. ANALYSIS
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-3 sm:gap-4">
          <h1 className="text-3xl font-semibold tracking-wide text-black sm:text-4xl md:text-5xl">
            DEMOGRAPHICS
          </h1>
          <Image
            src="/nav-buttons.svg"
            alt="Nav buttons"
            width={120}
            height={32}
            className="h-auto w-[100px] sm:w-[120px]"
          />
        </div>
        <p className="mt-1 text-sm tracking-wide text-gray-500">
          PREDICTED RACE &amp; AGE
        </p>
      </div>

      <div className="mx-auto mt-6 flex w-full max-w-6xl flex-col gap-3 lg:flex-row lg:items-stretch lg:justify-between lg:gap-2">
        <div className="grid grid-cols-3 gap-2 lg:flex lg:flex-col">
          {CATEGORIES.map((cat) => {
            const isActive = category === cat;
            const value = selected[cat] || topKey(getMap(cat));
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`relative flex h-[104px] w-full flex-col justify-between p-3 text-left transition lg:w-[208px] lg:p-4 ${
                  isActive
                    ? "bg-[#1A1B1C] text-white"
                    : "bg-[#F3F3F4] text-black hover:bg-[#E1E1E2]"
                }`}
              >
                <span className="text-[16px] font-semibold tracking-wide uppercase">
                  {value ? titleCase(value) : "—"}
                </span>
                <span
                  className={`text-xs tracking-wide ${
                    isActive ? "text-white/60" : "text-black/60"
                  }`}
                >
                  {CATEGORY_LABEL[cat]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative flex min-w-0 flex-1 flex-col bg-[#F3F3F4] p-4 sm:p-6">
          <p className="text-sm tracking-wide text-black">
            {activeKey ? titleCase(activeKey) : ""}
          </p>
          <div className="flex flex-1 items-center justify-center py-6">
            <div className="relative flex h-[200px] w-[200px] items-center justify-center sm:h-64 sm:w-64 lg:h-72 lg:w-72">
              <svg
                className="absolute inset-0 h-full w-full -rotate-90"
                viewBox="0 0 100 100"
                aria-hidden="true"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="49"
                  fill="none"
                  stroke="#D4D4D5"
                  strokeWidth="1"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="49"
                  fill="none"
                  stroke="#1A1B1C"
                  strokeWidth="1"
                  strokeDasharray={2 * Math.PI * 49}
                  strokeDashoffset={
                    2 * Math.PI * 49 * (1 - Math.min(Math.max(activeValue, 0), 1))
                  }
                  strokeLinecap="butt"
                  className="transition-[stroke-dashoffset] duration-500 ease-out"
                />
              </svg>
              <span className="relative text-2xl font-light tracking-wide sm:text-3xl">
                {Math.round(activeValue * 100)}
                <sup className="text-base">%</sup>
              </span>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col bg-[#F3F3F4] lg:w-[448px]">
          <div className="flex items-center justify-between bg-[#1A1B1C] px-4 py-3 text-xs tracking-wider text-white">
            <span>{CATEGORY_LABEL[category]}</span>
            <span>A. I. CONFIDENCE</span>
          </div>
          <div className="flex flex-col">
            {activeEntries.map(([key, value]) => {
              const isSelected = key === activeKey;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    setSelected((prev) => ({ ...prev, [category]: key }))
                  }
                  className={`flex items-center justify-between px-4 py-3 text-left text-sm transition ${
                    isSelected
                      ? "bg-[#1A1B1C] text-white"
                      : "text-black hover:bg-[#E1E1E2]"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`block h-2 w-2 rotate-45 border ${
                        isSelected
                          ? "border-white bg-white"
                          : "border-black"
                      }`}
                    />
                    {titleCase(key)}
                  </span>
                  <span>{formatPct(value)}</span>
                </button>
              );
            })}
            {activeEntries.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-gray-500">
                No data available.
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-sm tracking-wide text-gray-400 sm:text-[16px]">
        If A.I. estimate is wrong, select the correct one.
      </p>

      <div className="mx-auto mt-auto flex w-full max-w-6xl items-center justify-between pb-6 pt-4 sm:pb-8">
        <button
          type="button"
          onClick={() => router.push("/select")}
          className="cursor-pointer transition-transform duration-200 ease-out hover:scale-110"
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
        <div className="flex gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="cursor-pointer transition-transform duration-200 ease-out hover:scale-110"
            aria-label="Reset"
          >
            <Image
              src="/reset-button.svg"
              alt="Reset"
              width={120}
              height={42}
              className="h-auto w-auto"
            />
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="cursor-pointer transition-transform duration-200 ease-out hover:scale-110"
            aria-label="Confirm"
          >
            <Image
              src="/confirm-button.svg"
              alt="Confirm"
              width={120}
              height={42}
              className="h-auto w-auto"
            />
          </button>
        </div>
      </div>
    </main>
  );
}
