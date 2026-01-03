"use client"

import { PropsWithChildren, useEffect } from "react"
import { usePathname } from "next/navigation"
import { ReactLenis } from "lenis/react"

export function SmoothScrollProvider({ children }: PropsWithChildren) {
  const pathname = usePathname()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        overscroll: true,
        smoothWheel: true,
        touchMultiplier: 1.2,
      }}
    >
      {children}
    </ReactLenis>
  )
}
