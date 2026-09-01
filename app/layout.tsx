import type { Metadata } from "next";
import { Syncopate, Quicksand, Syne, DynaPuff } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/lib/convex/ConvexClientProvider";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { I18nProvider } from "@/lib/i18n/provider";
import enDict from "@/dictionaries/en.json";
import { LenisProvider } from "@/components/providers/LenisProvider";

// Syncopate for headings - bold, impactful comic-style font
const syncopate = Syncopate({
  weight: ["400", "700"],
  variable: "--font-syncopate",
  subsets: ["latin"],
  display: "swap",
});

// Quicksand for body text - clean, friendly, readable
const quicksand = Quicksand({
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-quicksand",
  subsets: ["latin"],
  display: "swap",
});

// Syne for alternative headings/display text
const syne = Syne({
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
  subsets: ["latin"],
  display: "swap",
});

// DynaPuff for playful display text
const dynapuff = DynaPuff({
  weight: ["400", "500", "600", "700"],
  variable: "--font-dynapuff",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AI OCEAN — Personality Buildathon",
    template: "%s | AI OCEAN",
  },
  description:
    "Discover your role in the team through AI-powered personality assessment. Join the Buildathon and find where you truly belong — PM, Designer, Engineer, or Researcher.",
  keywords: [
    "personality test",
    "team roles",
    "buildathon",
    "AI assessment",
    "ocean personality",
    "product manager",
    "frontend developer",
    "UX researcher",
    "team building",
    "Myanmar tech",
  ],
  authors: [{ name: "AI OCEAN" }],
  creator: "AI OCEAN",
  metadataBase: new URL("https://ai-ocean.dev"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ai-ocean.dev",
    siteName: "AI OCEAN",
    title: "AI OCEAN — Personality Buildathon",
    description:
      "Discover your role in the team through AI-powered personality assessment. Join the Buildathon and find where you truly belong.",
    images: [
      {
        url: "/assets/img.png",
        width: 1200,
        height: 630,
        alt: "AI OCEAN — Personality Buildathon",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI OCEAN — Personality Buildathon",
    description:
      "Discover your role in the team through AI-powered personality assessment.",
    images: ["/assets/img.png"],
  },
  icons: {
    icon: [
      { url: "/favicons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicons/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/favicons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "icon",
        type: "image/png",
        sizes: "192x192",
        url: "/favicons/android-chrome-192x192.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "512x512",
        url: "/favicons/android-chrome-512x512.png",
      },
    ],
  },
  manifest: "/favicons/manifest.json",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

// Disable static optimization for this layout since it uses client-side auth
export const dynamic = "force-dynamic";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${syncopate.variable} ${quicksand.variable} ${syne.variable} ${dynapuff.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-quicksand">
        <ConvexAuthNextjsServerProvider>
          <I18nProvider initialLocale="en" initialDictionary={enDict}>
            <ConvexClientProvider>
              <LenisProvider>{children}</LenisProvider>
            </ConvexClientProvider>
          </I18nProvider>
        </ConvexAuthNextjsServerProvider>
      </body>
    </html>
  );
}
