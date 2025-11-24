import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const DEFAULT_IMAGE_URL =
  "https://ai.google.dev/static/gemini-api/docs/images/cat.png";

const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;

export async function POST(request: Request) {
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Server belum dikonfigurasi GEMINI_API_KEY / GOOGLE_API_KEY. Tambahkan API key ke environment terlebih dahulu.",
      },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Body request harus berupa JSON." },
      { status: 400 }
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("prompt" in body) ||
    typeof (body as any).prompt !== "string"
  ) {
    return NextResponse.json(
      { error: "Field 'prompt' wajib diisi." },
      { status: 400 }
    );
  }

  const { prompt, imageBase64, mimeType } = body as {
    prompt: string;
    imageBase64?: string | null;
    mimeType?: string | null;
  };

  const ai = new GoogleGenAI({ apiKey });

  let effectiveBase64 = imageBase64 ?? null;
  let effectiveMimeType = mimeType ?? null;

  if (!effectiveBase64 || !effectiveMimeType) {
    const imageResponse = await fetch(DEFAULT_IMAGE_URL);
    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: "Gagal mengambil gambar default dari server." },
        { status: 500 }
      );
    }
    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    effectiveBase64 = buffer.toString("base64");
    effectiveMimeType =
      imageResponse.headers.get("content-type") ?? "image/png";
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [
        {
          text:
            prompt.trim() ||
            "Buat variasi kreatif yang menarik dari foto ini.",
        },
        {
          inlineData: {
            mimeType: effectiveMimeType,
            data: effectiveBase64,
          },
        },
      ],
      config: {
        responseModalities: ["Image"],
      },
    });

    const candidate = response.candidates?.[0];
    const parts = candidate?.content?.parts ?? [];

    let generatedBase64: string | null = null;

    for (const part of parts as any[]) {
      if (part.inlineData?.data) {
        generatedBase64 = part.inlineData.data as string;
        break;
      }
    }

    if (!generatedBase64) {
      return NextResponse.json(
        { error: "Tidak ada gambar yang dihasilkan dari Gemini." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      imageBase64: generatedBase64,
      mimeType: "image/png",
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan tak terduga.";
    return NextResponse.json(
      { error: `Gagal memproses gambar dengan Gemini: ${message}` },
      { status: 500 }
    );
  }
}