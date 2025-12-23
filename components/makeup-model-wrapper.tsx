"use client"

import dynamic from "next/dynamic"

const MakeupModel3D = dynamic(
  () => import("@/components/makeup-model"),
  {
    ssr: false,
    loading: () => <div className="w-full h-full" />
  }
)

export function MakeupModelWrapper() {
  return <MakeupModel3D />
}
