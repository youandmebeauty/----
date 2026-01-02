"use client"

import type { HTMLAttributes, ReactNode } from "react"
import { useEffect, useRef } from "react"
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

interface ScrollAnimationProps extends Omit<HTMLAttributes<HTMLDivElement>, "onToggle"> {
    children: ReactNode
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
    disabled?: boolean
    viewport?: { margin?: string }
    onEnter?: () => void
    onLeave?: () => void
    onEnterBack?: () => void
    onLeaveBack?: () => void
    onUpdate?: (progress: number) => void
    onToggle?: (self: ScrollTrigger) => void
    onRefresh?: (self: ScrollTrigger) => void
    onScrubComplete?: () => void
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
    disabled = false,
    viewport,
    onEnter,
    onLeave,
    onEnterBack,
    onLeaveBack,
    onUpdate,
    onToggle,
    onRefresh,
    onScrubComplete,
    ...props
}: ScrollAnimationProps) {
    const ref = useRef<HTMLDivElement>(null)
    const resolvedEase = typeof ease === "string" && ease in easePresets
        ? easePresets[ease as keyof typeof easePresets]
        : ease

    useEffect(() => {
        if (disabled || !ref.current) return

        const element = ref.current
        const preset = customAnimation || animationPresets[variant] || animationPresets.fadeIn
        const perspectiveValue = typeof perspective === "number" ? `${perspective}px` : perspective

        const ctx = gsap.context(() => {
            if (preset.before) preset.before(element)
            if (perspectiveValue) {
                gsap.set(element, { transformPerspective: perspectiveValue })
            }

            // Resolve the collection of elements to animate based on the provided options.
            const targets = childSelector
                ? Array.from(element.querySelectorAll<HTMLElement>(childSelector))
                : typeof stagger === "object" || (typeof stagger === "number" && stagger > 0 && element.children.length > 0)
                    ? Array.from(element.children) as HTMLElement[]
                    : [element]

            if (!targets.length) return

            gsap.fromTo(targets, preset.from, {
                ...preset.to,
                duration,
                delay,
                ease: resolvedEase,
                stagger,
                scrollTrigger: {
                    trigger: element,
                    start: start || (viewport?.margin ? `top ${viewport.margin}` : "top 80%"),
                    end: end || (scrub ? "bottom top" : undefined),
                    scrub,
                    markers,
                    once,
                    toggleActions: scrub ? undefined : once ? "play none none none" : "play none none reverse",
                    onEnter,
                    onLeave,
                    onEnterBack,
                    onLeaveBack,
                    onUpdate: onUpdate ? (self) => onUpdate(self.progress) : undefined,
                    onToggle,
                    onRefresh,
                    onScrubComplete,
                },
                onComplete: () => preset.after?.(element),
            })
        }, element)

        return () => ctx.revert()
    }, [
        variant, customAnimation, delay, duration, once, scrub, start, end, markers, 
        resolvedEase, stagger, childSelector, perspective, disabled, viewport,
        onEnter, onLeave, onEnterBack, onLeaveBack, onUpdate, onToggle, onRefresh, onScrubComplete
    ])

    return (
        <div ref={ref} className={className} data-animation-variant={variant} {...props}>
            {children}
        </div>
    )
}

