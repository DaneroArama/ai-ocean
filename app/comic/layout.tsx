import type { Metadata } from "next";
import SkipButton from "@/components/comic/SkipButton";

export const metadata: Metadata = {
  title: "Into the AI Ocean | Interactive Comic",
  description:
    "An interactive scroll-driven comic experience exploring the AI wave and how we ride it together.",
};

export default function ComicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="comic-layout min-h-screen bg-ocean-foam">
      <SkipButton />
      {children}
    </div>
  );
}
