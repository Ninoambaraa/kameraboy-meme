"use client";

import { FormEvent, useState } from "react";

const DEFAULT_IMAGE_URL = "/kameraboy.png";
const CONTRACT_ADDRESS = "Hzb5ibFneEvDBcv4voCkvMHEkKzhF4xCqQExZQ7Ppump";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setResultImage(null);

    try {
      setIsLoading(true);

      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Failed calling Gemini API.");
        return;
      }

      if (!data.imageBase64) {
        setError("Response from server did not include an image.");
        return;
      }

      const resultSrc = `data:${data.mimeType ?? "image/png"};base64,${
        data.imageBase64
      }`;
      setResultImage(resultSrc);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const effectivePreview = DEFAULT_IMAGE_URL;

  const copyContract = async () => {
    try {
      await navigator.clipboard.writeText(CONTRACT_ADDRESS);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("Failed to copy contract address.");
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 -top-32 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute right-[-60px] top-24 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute left-1/2 bottom-[-120px] h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-500/8 blur-3xl" />
      </div>

      <main className="relative flex-1 w-full max-w-6xl mx-auto px-4 py-10 md:py-16">
        <header className="mb-10 text-center md:text-left">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 border border-slate-800 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-300 shadow-lg shadow-slate-950/30">
            Meme Lab
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/20 px-2 py-[2px] text-[11px] text-sky-200 border border-sky-500/40">
              Kameraboy Chain
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3 mt-3">
            $KAMERABOY Meme Coin Playground
          </h1>
          <p className="text-sm md:text-base text-slate-300 max-w-2xl">
            The HQ for silly Kameraboy meme coin art. Use the default mascot,
            drop a prompt, and let Gemini remix the chaos.
          </p>
          <section className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-800/70 bg-slate-900/70 px-4 py-3 shadow-xl shadow-slate-950/40">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 uppercase tracking-[0.2em]">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400/90 shadow-[0_0_0_6px_rgba(52,211,153,0.12)]" />
                Contract
              </span>
              <span className="rounded-full bg-slate-800/80 px-2 py-[2px] text-[10px] text-slate-300 border border-slate-700">
                Audited? DYOR.
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <code className="text-sm text-slate-100 bg-slate-950/50 px-3 py-1.5 rounded-lg border border-slate-800 whitespace-nowrap overflow-x-auto">
                {CONTRACT_ADDRESS}
              </code>
              <button
                type="button"
                onClick={copyContract}
                className="text-xs font-semibold px-3 py-1.5 rounded-full bg-sky-500 hover:bg-sky-400 text-slate-950 transition-colors shadow-lg shadow-sky-900/40"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </section>
        </header>

        <div className="grid gap-8 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1.25fr)] items-start">
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-medium text-slate-200 uppercase tracking-[0.15em]">
                1. Source photo
              </h2>
              <span className="text-[11px] text-slate-400 rounded-full border border-slate-700 px-2 py-[2px] bg-slate-900/70">
                Lore locked
              </span>
            </div>

            <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 shadow-xl shadow-slate-950/60 overflow-hidden">
              <div className="aspect-[4/3] w-full bg-slate-900 flex items-center justify-center">
                <img
                  src={effectivePreview}
                  alt="Kameraboy default mascot"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-4 border-t border-slate-800/70 flex flex-col gap-3">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Custom uploads are disabled to keep lore consistent. You&apos;re
                  rocking the default <code>kameraboy.png</code>.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-medium text-slate-200 uppercase tracking-[0.15em]">
              2. Prompt &amp; results
            </h2>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 rounded-2xl border border-slate-800/70 bg-slate-900/70 shadow-xl shadow-slate-950/60 p-4 md:p-5"
            >
              <div className="space-y-3">
                <label
                  htmlFor="prompt"
                  className="text-xs font-semibold text-slate-200 uppercase tracking-[0.12em]"
                >
                  Prompt to transform the image
                </label>
                <div className="flex flex-wrap gap-2 text-[11px] text-slate-300">
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 px-2 py-[4px] bg-slate-800/60">
                    Keep face identity
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 px-2 py-[4px] bg-slate-800/60">
                    Meme-friendly
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 px-2 py-[4px] bg-slate-800/60">
                    Vibrant colors
                  </span>
                </div>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Example: turn into a retro anime poster with neon city background and cheeky Kameraboy coin logo."
                  className="w-full min-h-[120px] rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-400 transition"
                />
                <p className="text-[11px] text-slate-400">
                  English is fine; chaos is better. The model will mix your photo
                  and prompt to make fresh Kameraboy meme art.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-emerald-400 hover:from-sky-400 hover:to-emerald-300 disabled:from-slate-800 disabled:to-slate-700 disabled:cursor-not-allowed px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-700/40 transition-colors"
              >
                {isLoading ? "Summoning meme magic..." : "Generate with Gemini"}
              </button>

              {error && (
                <p className="text-xs text-red-400 bg-red-950/40 border border-red-900/60 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
            </form>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-medium text-slate-200 uppercase tracking-[0.15em]">
                  Results
                </h3>
                {resultImage && (
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400/90 shadow-[0_0_0_6px_rgba(52,211,153,0.12)]" />
                    Freshly generated
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 shadow-2xl shadow-slate-950/60 overflow-hidden backdrop-blur">
                <div className="bg-slate-900/70 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-300">
                    Preview (auto-fit, click to open full size)
                  </span>
                  {resultImage && (
                    <div className="flex items-center gap-2">
                      <a
                        href={resultImage}
                        download="kameraboy-result.png"
                        className="inline-flex items-center gap-1 rounded-full bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-semibold px-3 py-1.5 transition-colors shadow-lg shadow-sky-900/30"
                      >
                        Download
                      </a>
                      <a
                        href={resultImage}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-full border border-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 hover:border-slate-500 transition-colors"
                      >
                        Open
                      </a>
                    </div>
                  )}
                </div>
                <div className="min-h-[260px] bg-slate-950 flex items-center justify-center p-4">
                  {resultImage ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <div className="absolute inset-4 rounded-3xl bg-slate-900/60 blur-3xl" />
                      <img
                        src={resultImage}
                        alt="Gemini generated result"
                        className="relative w-full h-full object-contain rounded-2xl border border-slate-800 shadow-xl shadow-slate-950/50"
                      />
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 px-6 text-center leading-relaxed">
                      Your Kameraboy meme masterpiece will appear here after you hit{" "}
                      <span className="font-semibold">Generate with Gemini</span>.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="w-full border-t border-slate-800/70 py-4 text-center text-[11px] text-slate-500">
        Built with Next.js + Gemini 2.5 Flash Image. Keep it funny, keep it kind,
        and keep the Kameraboy meme coin spirit alive.
      </footer>
    </div>
  );
}
