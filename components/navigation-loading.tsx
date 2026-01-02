"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { gsap } from "@/lib/gsap"
import { LoadingAnimation } from "@/components/ui/loading-animation"

interface NavigationLoadingProps {
  isLoading: boolean
}

export function NavigationLoading({ isLoading }: NavigationLoadingProps) {
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const textRef = useRef<HTMLParagraphElement | null>(null)
  const [shouldRender, setShouldRender] = useState(isLoading)

  useEffect(() => {
    if (isLoading) {
      setShouldRender(true)
    } else if (shouldRender) {
      const timeout = setTimeout(() => setShouldRender(false), 220)
      return () => clearTimeout(timeout)
    }
    return undefined
  }, [isLoading, shouldRender])

  useEffect(() => {
    const overlay = overlayRef.current
    const panel = panelRef.current
    const text = textRef.current
    if (!overlay || !panel || !text) return

    const ctx = gsap.context(() => {
      if (isLoading) {
        gsap.fromTo(
          overlay,
          { opacity: 0 },
          { opacity: 1, duration: 0.2, ease: "power1.out" }
        )
        gsap.fromTo(
          panel,
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 0.2, ease: "power1.out" }
        )
        gsap.fromTo(
          text,
          { opacity: 0, y: 6 },
          { opacity: 1, y: 0, duration: 0.3, ease: "power1.out", delay: 0.1 }
        )
      } else {
        gsap.to(overlay, { opacity: 0, duration: 0.2, ease: "power1.in" })
        gsap.to(panel, { opacity: 0, scale: 0.92, duration: 0.2, ease: "power1.in" })
      }
    })

    return () => ctx.revert()
  }, [isLoading])

  const dotAnimation = useMemo(
    () =>
      [0, 1, 2].map((index) => (
        <span
          key={index}
          style={{ animationDelay: `${index * 0.1}s` }}
          className="h-1.5 w-1.5 animate-loading-dot rounded-full bg-pink-400 dark:bg-pink-300"
        />
      )),
    []
  )

  if (!shouldRender) {
    return null
  }

  return (
    <>
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[9998] cursor-wait bg-background/80 backdrop-blur-sm"
      />

      <div ref={panelRef} className="fixed top-1/3 z-[9999] w-full cursor-wait max-h-screen">
        <div className="flex flex-col items-center justify-center gap-4">
          <LoadingAnimation size={140} />

          <p
            ref={textRef}
            className="text-sm font-medium text-pink-600 dark:text-pink-400"
          >
            Chargement...
          </p>

          <div className="flex space-x-1.5">{dotAnimation}</div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes loading-dot {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(-8px); opacity: 1; }
        }

        .animate-loading-dot {
          animation: loading-dot 0.6s ease-in-out infinite;
        }
      `}</style>
    </>
  )
}
