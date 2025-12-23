"use client";

import dynamic from "next/dynamic";
import { LoadingAnimation } from "@/components/ui/loading-animation";

const SkinAnalyzerFeature = dynamic(
  () => import("@/components/skin-analyzer/skin-analyzer-feature"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingAnimation size={100} className="text-primary" />
      </div>
    ),
  }
);

export function SkinAnalyzerClientWrapper() {
  return <SkinAnalyzerFeature />;
}
