"use client";

import dynamic from "next/dynamic";
import { LoadingAnimation } from "@/components/ui/loading-animation";
// Remove Loader2 import or keep if used elsewhere (it's not used elsewhere in this file)

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

export default function SkinAnalyzerPage() {
  return <SkinAnalyzerFeature />;
}