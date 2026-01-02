"use client"

import type React from "react"
import { useEffect, useRef, useCallback } from "react"
import { gsap } from "@/lib/gsap"

type ScrollAnimationVariant =
    | "fadeIn"
    | "slideUp"
    | "slideDown"
    | "slideLeft"
    | "slideRight"
    | "scaleUp"
    | "scaleDown"
    | "blurRise"
    | "rotateSkew"
    | "flipUp"
    | "zoomRotate"
    | "elasticBounce"
    | "parallaxFloat"
    | "glitchReveal"
    | "morphWave"
    | "spiralIn"
    | "splitReveal"
    | "liquidRise"
    | "magneticPull"

type AnimationDefinition = {
    from: gsap.TweenVars
    to: gsap.TweenVars
    before?: (element: HTMLElement) => void
    after?: (element: HTMLElement) => void
}

const animationPresets: Record<ScrollAnimationVariant, AnimationDefinition> = {
    fadeIn: {
        from: { autoAlpha: 0 },
        to: { autoAlpha: 1 },
    },
    slideUp: {
        from: { autoAlpha: 0, y: 60 },
        to: { autoAlpha: 1, y: 0 },
    },
    slideDown: {
        from: { autoAlpha: 0, y: -60 },
        to: { autoAlpha: 1, y: 0 },
    },
    slideLeft: {
        from: { autoAlpha: 0, x: 80 },
        to: { autoAlpha: 1, x: 0 },
    },
    slideRight: {
        from: { autoAlpha: 0, x: -80 },
        to: { autoAlpha: 1, x: 0 },
    },
    scaleUp: {
        from: { autoAlpha: 0, scale: 0.8 },
        to: { autoAlpha: 1, scale: 1 },
    },
    scaleDown: {
        from: { autoAlpha: 0, scale: 1.2 },
        to: { autoAlpha: 1, scale: 1 },
    },
    blurRise: {
        from: { autoAlpha: 0, y: 70, filter: "blur(16px)" },
        to: { autoAlpha: 1, y: 0, filter: "blur(0px)" },
    },
    rotateSkew: {
        from: { autoAlpha: 0, y: 60, rotate: -6, skewY: 6 },
        to: { autoAlpha: 1, y: 0, rotate: 0, skewY: 0 },
    },
    flipUp: {
        from: { autoAlpha: 0, rotationX: -70, y: 80, transformOrigin: "top center" },
        to: { autoAlpha: 1, rotationX: 0, y: 0 },
        before: (element) => {
            gsap.set(element, { transformPerspective: 1200 })
        },
    },
    zoomRotate: {
        from: { autoAlpha: 0, scale: 0.65, rotation: -12, y: 40 },
        to: { autoAlpha: 1, scale: 1, rotation: 0, y: 0 },
    },
    elasticBounce: {
        from: { autoAlpha: 0, scale: 0.3, y: 100 },
        to: { autoAlpha: 1, scale: 1, y: 0 },
    },
    parallaxFloat: {
        from: { autoAlpha: 0, y: 120 },
        to: { autoAlpha: 1, y: -30 },
    },
    glitchReveal: {
        from: { autoAlpha: 0, x: -20, skewX: 10, filter: "blur(8px)" },
        to: { autoAlpha: 1, x: 0, skewX: 0, filter: "blur(0px)" },
    },
    morphWave: {
        from: { autoAlpha: 0, scaleX: 0.6, scaleY: 1.3, rotation: -15 },
        to: { autoAlpha: 1, scaleX: 1, scaleY: 1, rotation: 0 },
    },
    spiralIn: {
        from: { autoAlpha: 0, scale: 0.4, rotation: -180, x: -100, y: 100 },
        to: { autoAlpha: 1, scale: 1, rotation: 0, x: 0, y: 0 },
    },
    splitReveal: {
        from: { autoAlpha: 0, clipPath: "inset(0 50% 0 50%)", scale: 1.1 },
        to: { autoAlpha: 1, clipPath: "inset(0 0% 0 0%)", scale: 1 },
    },
    liquidRise: {
        from: { autoAlpha: 0, y: 150, scaleY: 0.7, transformOrigin: "bottom center" },
        to: { autoAlpha: 1, y: 0, scaleY: 1 },
    },
    magneticPull: {
        from: { autoAlpha: 0, scale: 1.5, x: 100, y: -50, filter: "blur(20px)" },
        to: { autoAlpha: 1, scale: 1, x: 0, y: 0, filter: "blur(0px)" },
    },
}

const easePresets = {
    smooth: "power2.out",
    snappy: "power3.out",
    elastic: "elastic.out(1, 0.5)",
    bounce: "bounce.out",
    back: "back.out(1.7)",
    expo: "expo.out",
    circ: "circ.out",
    sine: "sine.inOut",
} as const

interface ScrollAnimationProps {
    children: React.ReactNode
    className?: string
    variant?: ScrollAnimationVariant
    customAnimation?: AnimationDefinition
    delay?: number
    duration?: number
    once?: boolean
    scrub?: boolean | number
    start?: string
    end?: string
    markers?: boolean
    ease?: string | keyof typeof easePresets
    stagger?: number | { amount: number; from?: "start" | "center" | "end" | "random" | "edges" }
    childSelector?: string
    perspective?: number | string
    pin?: boolean
    pinSpacing?: boolean
    snap?: boolean | number | number[]
    anticipatePin?: number
    refreshPriority?: number
    invalidateOnRefresh?: boolean
    fastScrollEnd?: boolean | number
    preventOverlaps?: boolean | string
    onEnter?: () => void
    onLeave?: () => void
    onEnterBack?: () => void
    onLeaveBack?: () => void
    onUpdate?: (progress: number) => void
    onToggle?: (self: ScrollTrigger) => void
    onRefresh?: (self: ScrollTrigger) => void
    onScrubComplete?: () => void
    disabled?: boolean
    viewport?: { margin?: string; amount?: number | "all" | "some" }
}

export function ScrollAnimation({
    children,
    className,
    variant = "fadeIn",
    customAnimation,
    delay = 0,
    duration = 0.7,
    once = true,
    scrub = false,
    start,
    end,
    markers = false,
    ease = "power3.out",
    stagger = 0,
    childSelector,
    perspective,
    pin = false,
    pinSpacing = true,
    snap,
    anticipatePin,
    refreshPriority,
    invalidateOnRefresh = false,
    fastScrollEnd,
    preventOverlaps,
    onEnter,
    onLeave,
    onEnterBack,
    onLeaveBack,
    onUpdate,
    onToggle,
    onRefresh,
    onScrubComplete,
    disabled = false,
    viewport,
}: ScrollAnimationProps) {
    const ref = useRef<HTMLDivElement | null>(null)
    const scrollTriggerRef = useRef<ScrollTrigger | null>(null)

    const resolvedEase = typeof ease === "string" && ease in easePresets 
        ? easePresets[ease as keyof typeof easePresets] 
        : ease

    const handleUpdate = useCallback((self: ScrollTrigger) => {
        onUpdate?.(self.progress)
    }, [onUpdate])

    useEffect(() => {
        if (disabled) return

        const element = ref.current
        if (!element) return

        const preset = customAnimation ?? animationPresets[variant] ?? animationPresets.fadeIn

        const targets = childSelector
            ? Array.from(element.querySelectorAll<HTMLElement>(childSelector))
            : typeof stagger === "object" || (typeof stagger === "number" && stagger > 0 && element.children.length > 0)
                ? Array.from(element.children) as HTMLElement[]
                : [element]

        if (targets.length === 0) return

        const ctx = gsap.context(() => {
            preset.before?.(element)

            if (perspective) {
                const value = typeof perspective === "number" ? `${perspective}px` : perspective
                gsap.set(element, { transformPerspective: value })
            }

           

            const triggerStart = start ?? (viewport?.margin ? `top ${viewport.margin}` : "top 80%")
            const triggerEnd = end ?? (scrub ? "bottom top" : undefined)

            // Optimize animation duration for mobile/touch devices


            const scrollTriggerConfig: ScrollTrigger.Vars = {
                trigger: element,
                start: triggerStart,
                end: triggerEnd,
                scrub,
                markers,
                once,
                pin,
                pinSpacing,
                anticipatePin,
                refreshPriority,
                invalidateOnRefresh,
                fastScrollEnd,
                preventOverlaps,
                toggleActions: scrub ? undefined : once ? "play none none none" : "play none none reverse",
                onEnter: () => {
                    onEnter?.()
                },
                onLeave: () => {
                    onLeave?.()
                },
                onEnterBack: () => {
                    onEnterBack?.()
                },
                onLeaveBack: () => {
                    onLeaveBack?.()
                },
                onUpdate: onUpdate ? handleUpdate : undefined,
                onToggle,
                onRefresh,
                onScrubComplete,
            }

            const timeline = gsap.timeline({
                scrollTrigger: scrollTriggerConfig,
                onComplete: () => preset.after?.(element),
            })


            scrollTriggerRef.current = timeline.scrollTrigger as ScrollTrigger
        }, element)

        return () => {
            scrollTriggerRef.current = null
            ctx.revert()
        }
    }, [
        variant,
        customAnimation,
        delay,
        duration,
        once,
        scrub,
        start,
        end,
        markers,
        resolvedEase,
        stagger,
        childSelector,
        perspective,
        pin,
        pinSpacing,
        snap,
        anticipatePin,
        refreshPriority,
        invalidateOnRefresh,
        fastScrollEnd,
        preventOverlaps,
        onEnter,
        onLeave,
        onEnterBack,
        onLeaveBack,
        handleUpdate,
        onToggle,
        onRefresh,
        onScrubComplete,
        disabled,
        viewport,
    ])

    return (
        <div ref={ref} className={className} data-animation-variant={variant}>
            {children}
        </div>
    )
}

// Utility hook for programmatic control
export function useScrollAnimation(ref: React.RefObject<HTMLElement>) {
    const scrollTriggerRef = useRef<ScrollTrigger | null>(null)

    useEffect(() => {
        if (!ref.current) return

        const triggers = ScrollTrigger.getAll()
        scrollTriggerRef.current = triggers.find(
            (trigger) => trigger.trigger === ref.current
        ) || null
    }, [ref])

    const refresh = useCallback(() => {
        scrollTriggerRef.current?.refresh()
    }, [])

    const kill = useCallback(() => {
        scrollTriggerRef.current?.kill()
    }, [])

    const enable = useCallback(() => {
        scrollTriggerRef.current?.enable()
    }, [])

    const disable = useCallback(() => {
        scrollTriggerRef.current?.disable()
    }, [])

    const getProgress = useCallback((value?: number) => {
        const trigger = scrollTriggerRef.current
        if (!trigger) return 0
        
        if (value !== undefined) {
            ;(trigger as unknown as { progress(value?: number): number }).progress(value)
        }
        return trigger.progress
    }, [])

    return { refresh, kill, enable, disable, progress: getProgress, trigger: scrollTriggerRef.current }
}