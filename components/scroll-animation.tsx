"use client"

import type React from "react"
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
    | "parallax"

type AnimationDefinition = {
    from: gsap.TweenVars
    to: gsap.TweenVars
    before?: (element: HTMLElement) => void
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
    parallax: {
        from: { autoAlpha: 0, yPercent: 30 },
        to: { autoAlpha: 1, yPercent: 0 },
    },
}

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
    ease?: string
    stagger?: number
    childSelector?: string
    perspective?: number | string
    onEnter?: () => void
    onLeave?: () => void
    onEnterBack?: () => void
    onLeaveBack?: () => void
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
    onEnter,
    onLeave,
    onEnterBack,
    onLeaveBack,
}: ScrollAnimationProps) {
    const ref = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const element = ref.current
        if (!element) return

        const preset = customAnimation ?? animationPresets[variant] ?? animationPresets.fadeIn

        const targets = childSelector
            ? Array.from(element.querySelectorAll<HTMLElement>(childSelector))
            : stagger > 0 && element.children.length > 0
                ? Array.from(element.children) as HTMLElement[]
                : [element]

        if (targets.length === 0) {
            return
        }

        const ctx = gsap.context(() => {
            preset.before?.(element)

            if (perspective) {
                const value = typeof perspective === "number" ? `${perspective}px` : perspective
                gsap.set(element, { transformPerspective: value })
            }

            const fromVars = { ...preset.from }
            const toVars: gsap.TweenVars = {
                ...preset.to,
                duration,
                ease,
                delay: scrub ? 0 : delay,
            }

            if (stagger && targets.length > 1) {
                toVars.stagger = stagger
            }

            gsap.set(targets, fromVars)

            const triggerStart = start ?? "top 80%"
            const triggerEnd = end ?? (scrub ? "bottom top" : undefined)

            const timeline = gsap.timeline({
                scrollTrigger: {
                    trigger: element,
                    start: triggerStart,
                    end: triggerEnd,
                    scrub,
                    markers,
                    once,
                    toggleActions: scrub ? undefined : once ? "play none none none" : "play none none reverse",
                    onEnter,
                    onLeave,
                    onEnterBack,
                    onLeaveBack,
                },
            })

            timeline.to(targets, toVars, 0)
        }, element)

        return () => ctx.revert()
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
        ease,
        stagger,
        childSelector,
        perspective,
        onEnter,
        onLeave,
        onEnterBack,
        onLeaveBack,
    ])

    return (
        <div ref={ref} className={className} data-animation-variant={variant}>
            {children}
        </div>
    )
}
