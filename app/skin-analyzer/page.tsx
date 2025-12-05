"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const SkinAnalyzerFeature = dynamic(
  () => import("@/components/skin-analyzer/skin-analyzer-feature"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    ),
  }
);

export default function SkinAnalyzerPage() {
  return <SkinAnalyzerFeature />;
}