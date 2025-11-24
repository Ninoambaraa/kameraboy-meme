"use client";

import { FormEvent, useState, ChangeEvent } from "react";

const DEFAULT_IMAGE_URL =
  "https://ai.google.dev/static/gemini-api/docs/images/cat.png";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar (jpg, png, dll).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        setError("Gagal membaca file gambar.");
        return;
      }

      const [header, base64] = result.split(",");
      if (!base64) {
        setError("Format gambar tidak valid.");
        return;
      }

      setPreviewSrc(result);
      setImageBase64(base64);
      setMimeType(file.type);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

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
        body: JSON.stringify({
          prompt,
          imageBase64,
          mimeType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Gagal memanggil API Gemini.");
        return;
      }

      if (!data.imageBase64) {
        setError("Respons dari server tidak berisi gambar.");
        return;
      }

      const resultSrc = `data:${data.mimeType ?? "image/png"};base64,${
        data.imageBase64
      }`;
      setResultImage(resultSrc);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Terjadi kesalahan tak terduga.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const effectivePreview = previewSrc ?? DEFAULT_IMAGE_URL;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex flex-col">
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-10 md:py-16">
        <header className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
            Gemini Banana Image Playground
          </h1>
          <p className="text-sm md:text-base text-slate-300 max-w-2xl">
            Upload satu foto (atau gunakan foto default di sebelah kiri), lalu
            tulis prompt bebas tentang perubahan yang kamu inginkan. Gemini
            akan mengubah gambar berdasarkan foto + prompt kamu.
          </p>
        </header>

        <div className="grid gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)] items-start">
          <section className="space-y-4">
            <h2 className="text-sm font-medium text-slate-200 uppercase tracking-[0.15em]">
              1. Foto sumber
            </h2>

            <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 shadow-xl shadow-slate-950/60 overflow-hidden">
              <div className="aspect-[4/3] w-full bg-slate-900 flex items-center justify-center">
                <img
                  src={effectivePreview}
                  alt="Foto yang akan diproses"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-4 border-t border-slate-800/70 flex flex-col gap-3">
                <label className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium cursor-pointer hover:border-slate-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  Pilih foto sendiri
                </label>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Jika tidak memilih gambar, sistem akan memakai foto kucing
                  default dari dokumentasi Gemini.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-medium text-slate-200 uppercase tracking-[0.15em]">
              2. Prompt &amp; hasil
            </h2>

            <form
              onSubmit={handleSubmit}
              className="space-y-4 rounded-2xl border border-slate-800/70 bg-slate-900/60 shadow-xl shadow-slate-950/60 p-4 md:p-5"
            >
              <div className="space-y-2">
                <label
                  htmlFor="prompt"
                  className="text-xs font-medium text-slate-200"
                >
                  Prompt untuk mengubah gambar
                </label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Contoh: ubah jadi ilustrasi anime dengan gaya pastel, tambahkan latar kota futuristik di belakangnya."
                  className="w-full min-h-[120px] rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-400 transition"
                />
                <p className="text-[11px] text-slate-400">
                  Bahasa boleh bebas (Indonesia / Inggris). Model akan
                  menggabungkan foto + prompt ini untuk menghasilkan gambar
                  baru.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center rounded-full bg-sky-500 hover:bg-sky-400 disabled:bg-sky-800 disabled:cursor-not-allowed px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-700/40 transition-colors"
              >
                {isLoading ? "Menghasilkan gambar..." : "Generate dengan Gemini"}
              </button>

              {error && (
                <p className="text-xs text-red-400 bg-red-950/40 border border-red-900/60 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
            </form>

            <div className="space-y-2">
              <h3 className="text-xs font-medium text-slate-200 uppercase tracking-[0.15em]">
                Hasil
              </h3>
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 min-h-[220px] flex items-center justify-center overflow-hidden">
                {resultImage ? (
                  <img
                    src={resultImage}
                    alt="Hasil generasi Gemini"
                    className="w-full h-full object-contain bg-slate-900"
                  />
                ) : (
                  <p className="text-xs text-slate-400 px-6 text-center leading-relaxed">
                    Hasil gambar dari Gemini akan muncul di sini setelah kamu
                    menekan tombol{" "}
                    <span className="font-semibold">Generate dengan Gemini</span>
                    .
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="w-full border-t border-slate-800/70 py-4 text-center text-[11px] text-slate-500">
        Dibangun dengan Next.js + Gemini 2.5 Flash Image. Jaga konten yang
        kamu buat agar tetap aman dan sesuai kebijakan.
      </footer>
    </div>
  );
}
