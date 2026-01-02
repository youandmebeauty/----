"use client"

import type { ReactNode } from "react"
import { useEffect, useRef, useState } from "react"
import { gsap } from "@/lib/gsap"
import { cn } from "@/lib/utils"

interface CollapseProps {
  isOpen: boolean
  children: ReactNode
  className?: string
}

export function Collapse({ isOpen, children, className }: CollapseProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [shouldRender, setShouldRender] = useState(isOpen)

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
    }
  }, [isOpen])

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    const ctx = gsap.context(() => {
      if (isOpen) {
        gsap.fromTo(
          element,
          { height: 0, autoAlpha: 0 },
          {
            height: "auto",
            autoAlpha: 1,
            duration: 0.2,
            ease: "power1.out",
            onComplete: () => {
              element.style.height = "auto"
            },
          }
        )
      } else {
        gsap.to(element, {
          height: 0,
          autoAlpha: 0,
          duration: 0.2,
          ease: "power1.in",
          onComplete: () => setShouldRender(false),
        })
      }
    })

    return () => ctx.revert()
  }, [isOpen])

  if (!shouldRender) {
    return null
  }

  return (
    <div ref={containerRef} className={cn("overflow-hidden", className)}>
      {children}
    </div>
  )
}
