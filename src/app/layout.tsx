import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://generator.kameraboy.xyz";
const previewImage = `${siteUrl}/kameraboy.png`;

export const metadata: Metadata = {
  title: "$KAMERABOY Meme Coin Playground",
  description:
    "Remix the Kameraboy mascot with AI prompts. Default lore-locked image, easy generate, quick download.",
  openGraph: {
    title: "$KAMERABOY Meme Coin Playground",
    description:
      "Remix the Kameraboy mascot with AI prompts. Default lore-locked image, easy generate, quick download.",
    url: siteUrl,
    siteName: "$KAMERABOY",
    images: [
      {
        url: previewImage,
        width: 1200,
        height: 630,
        alt: "Kameraboy meme coin playground preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "$KAMERABOY Meme Coin Playground",
    description:
      "Remix the Kameraboy mascot with AI prompts. Default lore-locked image, easy generate, quick download.",
    images: [previewImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
