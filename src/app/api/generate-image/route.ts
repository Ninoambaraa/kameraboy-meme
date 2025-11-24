import { NextResponse } from "next/server";
import OpenAI from "openai";
import { promises as fs } from "fs";
import path from "path";

const DEFAULT_IMAGE_PATH = path.join(process.cwd(), "public", "kameraboy.png");

const apiKey = process.env.OPENROUTER_API_KEY;

const defaultHeaders: Record<string, string> = {};
if (process.env.OPENROUTER_REFERER) {
  defaultHeaders["HTTP-Referer"] = process.env.OPENROUTER_REFERER;
}
if (process.env.OPENROUTER_TITLE) {
  defaultHeaders["X-Title"] = process.env.OPENROUTER_TITLE;
}

const openai = apiKey
  ? new OpenAI({
      apiKey,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders,
    })
  : null;

export async function POST(request: Request) {
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Missing OPENROUTER_API_KEY. Add your OpenRouter key to the environment.",
      },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be JSON." },
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
      { error: "Field 'prompt' is required." },
      { status: 400 }
    );
  }

  const { prompt } = body as { prompt: string };
  const safetyInstruction =
    "Preserve the subject's facial identity and proportions; do not alter face shape, skin tone, or key features.";
  const userPrompt = prompt.trim();
  const finalPrompt = userPrompt
    ? `${userPrompt}\n\n${safetyInstruction}`
    : `Create a bold, playful variation of this photo. ${safetyInstruction}`;

  let effectiveBase64: string | null = null;
  let effectiveMimeType: string | null = null;

  if (!effectiveBase64 || !effectiveMimeType) {
    try {
      const buffer = await fs.readFile(DEFAULT_IMAGE_PATH);
      effectiveBase64 = buffer.toString("base64");
      effectiveMimeType = "image/png";
    } catch {
      return NextResponse.json(
        { error: "Failed to read default image on server." },
        { status: 500 }
      );
    }
  }

  if (!effectiveBase64 || !effectiveMimeType) {
    return NextResponse.json(
      { error: "Default image was not available on the server." },
      { status: 500 }
    );
  }

  try {
    const completion = await openai!.chat.completions.create({
      model: "google/gemini-2.5-flash-image",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: finalPrompt,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${effectiveMimeType};base64,${effectiveBase64}`,
              },
            },
          ],
        },
      ],
    });

    const choiceMessage = completion.choices?.[0]?.message as any;
    const content = choiceMessage?.content;
    let imageUrl: string | null = null;

    // Prefer images array when present (OpenRouter often returns this)
    const images = choiceMessage?.images;
    if (Array.isArray(images) && images.length > 0) {
      const img = images.find(
        (item: any) => item?.type === "image_url" && item.image_url?.url
      );
      if (img?.image_url?.url) {
        imageUrl = img.image_url.url as string;
      }
    }

    // Fallback: parse data URL from content (string or array)
    const dataUrlPattern = /data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/;
    if (!imageUrl) {
      if (typeof content === "string") {
        const match = dataUrlPattern.exec(content);
        imageUrl = match ? match[0] : null;
      } else if (Array.isArray(content)) {
        for (const part of content as any[]) {
          if (part?.type === "image_url" && part.image_url?.url) {
            imageUrl = part.image_url.url as string;
            break;
          }
          if (typeof part === "string") {
            const match = dataUrlPattern.exec(part);
            imageUrl = match ? match[0] : null;
            if (imageUrl) break;
          }
        }
      }
    }

    if (!imageUrl || !imageUrl.startsWith("data:")) {
      return NextResponse.json(
        { error: "OpenRouter did not return an inline image URL." },
        { status: 500 }
      );
    }

    const commaIndex = imageUrl.indexOf(",");
    if (commaIndex === -1) {
      return NextResponse.json(
        { error: "Invalid data URL returned by OpenRouter." },
        { status: 500 }
      );
    }

    const meta = imageUrl.slice(5, commaIndex); // after "data:"
    const base64 = imageUrl.slice(commaIndex + 1);
    const mimeFromMeta = meta.split(";")[0] || "image/png";

    return NextResponse.json({
      imageBase64: base64,
      mimeType: mimeFromMeta,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error.";
    return NextResponse.json(
      { error: `Failed to process image with OpenRouter: ${message}` },
      { status: 500 }
    );
  }
}
