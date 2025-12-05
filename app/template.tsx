"use client"

import { motion, useReducedMotion } from "framer-motion"
import { usePathname } from "next/navigation"

export default function Template({ children }: { children: React.ReactNode }) {
    const prefersReducedMotion = useReducedMotion()
    const pathname = usePathname()

    // More sophisticated transition variants
    const variants = {
        initial: {
            opacity: 0,
            y: 20,
            scale: 0.98,
            filter: "blur(4px)",
        },
        animate: {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
        },
        exit: {
            opacity: 0,
            y: -20,
            scale: 0.98,
            filter: "blur(4px)",
        },
    }

    // Simpler variants for users who prefer reduced motion
    const reducedMotionVariants = {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
    }

    return (
        <motion.div
            key={pathname}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={prefersReducedMotion ? reducedMotionVariants : variants}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                mass: 0.8,
                opacity: { duration: 0.3 },
                filter: { duration: 0.3 },
            }}
            style={{
                willChange: "transform, opacity, filter",
            }}
        >
            {children}
        </motion.div>
    )
}