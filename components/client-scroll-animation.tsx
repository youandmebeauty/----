"use client"

import { motion, type Variants } from "framer-motion"
import type React from "react"
import { useEffect, useState } from "react"

interface ScrollAnimationProps {
    children: React.ReactNode
    className?: string
    variant?: "fadeIn" | "slideUp" | "slideDown" | "slideLeft" | "slideRight" | "scaleUp" | "scaleDown"
    delay?: number
    duration?: number
    once?: boolean
}

const variants: Record<string, Variants> = {
    fadeIn: {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    },
    slideUp: {
        hidden: { opacity: 0, y: 5 },
        visible: { opacity: 1, y: 0 },
    },
    slideDown: {
        hidden: { opacity: 0, y: -5 },
        visible: { opacity: 1, y: 0 },
    },
    slideLeft: {
        hidden: { opacity: 0, x: 50 },
        visible: { opacity: 1, x: 0 },
    },
    slideRight: {
        hidden: { opacity: 0, x: -50 },
        visible: { opacity: 1, x: 0 },
    },
    scaleUp: {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1 },
    },
    scaleDown: {
        hidden: { opacity: 0, scale: 1.2 },
        visible: { opacity: 1, scale: 1 },
    },
}

export function ClientScrollAnimation({
    children,
    className,
    variant = "fadeIn",
    delay = 0,
    duration = 0.5,
    once = true,
}: ScrollAnimationProps) {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    // Render children immediately for SSR/crawlers
    if (!isMounted) {
        return <div className={className}>{children}</div>
    }

    return (
        <motion.div
            className={className}
            initial="hidden"
            whileInView="visible"
            viewport={{ once, amount: 0.3 }}
            transition={{ duration, delay }}
            variants={variants[variant]}
        >
            {children}
        </motion.div>
    )
}
