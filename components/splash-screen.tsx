"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"

interface SplashScreenProps {
  onComplete?: () => void
  duration?: number
}

export function SplashScreen({ onComplete, duration = 2500 }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => {
        onComplete?.()
      }, 500) // Wait for exit animation
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onComplete])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-secondary via-background to-secondary"
        >
          <div className="relative">
            {/* Logo Container */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.8,
                ease: [0.43, 0.13, 0.23, 0.96],
              }}
              className="relative"
            >
              {/* Animated Logo */}
              <motion.svg
                    viewBox="0 0 1080 1080"
                    className="w-full h-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <defs>
                        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <motion.stop
                                offset="0%"
                                stopColor="#e5a4cb"
                                animate={{ stopColor: ["#e5a4cb", "#f0b8d9", "#e5a4cb"] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            />
                            <motion.stop
                                offset="100%"
                                stopColor="#d890bb"
                                animate={{ stopColor: ["#d890bb", "#e5a4cb", "#d890bb"] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            />
                        </linearGradient>
                        
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                            <feMerge>
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Main logo paths with staggered animation */}
                    <motion.path
                        d="M1038.3,504.4c-22.4-32.5-20.7-47.2-20.7-91.4,0-103.5-67.5-193.2-164.3-226-33.2-11.2-68.4-17.9-103-20-28.9-1.8-57.4,1.7-84.3,9.7-41.4,12.4-79.1,35.5-109.2,66.7-.3.3-.7.7-1,1-17.7,18.5-32.7,39.8-44.3,63.4-1.4,2.6-.6,7.8,1.1,10.6.9,1.6,1.8,3.2,2.7,4.7,1.6,2.8,3.1,5.5,4.6,8.3.6,1.1,1.2,2.2,1.8,3.3.9,1.8,1.9,3.5,2.8,5.3,38.2,73,57.6,148.8,62.5,225.4,8.2,126.4-23,255.1-74.2,377.1,8,5.6,19.8,1.8,24.2.3,113.4-53.5,114-137.6,129.8-239.5,1.4-9.4,2.2-30.9,16-85,.3-1,.5-2.1.8-3.1,2.3-9.3,5.3-18.3,8.8-26.9,0-.2.1-.3.2-.5,17.8-43.5,49.6-80,82.4-115.5,12.7-13.8,25.7-27.5,38-41.4,46.8-52.8,85.1-108.8,73.4-187.8,12.5,1.9,28.7,11.5,44.9,25.6,41.9,36.6,64.8,90,64.8,145.6,0,40.8,5.6,80.1,36.4,116.8,18.9,24.1,29.8,29.3,28.3,38.8-.8,4.8-3.7,13.1-22.4,19-20.6,11.6-30.6,20.2-31.1,27.6-.7,12.4,15.6,24.7,10.4,31.1-17.3,8.7-17.9,19.6-44.9,19,13.8,9.3,38.6-.9,39.7,13.8.6,9.6-11.1,12.5-19,25.9-.7,1.2-7.9,13.9-6.2,29.2,4.7,19.5,9.3,42.9-17,46.6-91.5-9-188.6-31.5-263.6-87.3,2.7,31.5,24.5,45.9,47.7,59.4-66.8,18.4-84.8,108.1-58.6,156.2-5.9-64.7,31.7-137.2,108.1-132.9,49.5-.4,206.2,73.1,211.1-14.3-15.5-57.3,15.9-44.4,23.4-77.5-.7-9.6-9.5-10.9-8.6-20.7.9-10.7,11.8-12.4,12.1-22.4.3-10.9-15.3-14.1-13.8-22.4,1.7-9.9,17.8-9.2,34.5-24.2,38.1-31.9,6.6-45.7-24.2-91.4ZM720.9,432c-37.5,53.2-80.7,103.1-110.2,161.4,16.4-87.4,88.6-146.6,125.4-224.6,23.2-47.7,42.7-99,38.2-153.1.8,0,1.7-.1,2.5-.2,13.9,78.5-9.5,153.5-56,216.5Z"
                        fill="url(#logoGradient)"
                        filter="url(#glow)"
                        strokeWidth="0"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                    />

                    <motion.path
                        d="M956.8,418.9c-43.7-11.8-69.4.6-69.4.6-18.1,8.7-28.8,22.2-34.1,30.5,9-6.3,28.2-17.9,55.2-20.7,21.3-2.2,38.4,2,48.3,5.2.8-.5,2-1.3,3.1-2.5,2.1-2.5,3.6-6.7,2.1-9.6-1.1-2.2-3.7-3-5.2-3.5Z"
                        fill="url(#logoGradient)"
                        filter="url(#glow)"
                        strokeWidth="0"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1.5, delay: 0.2, ease: "easeInOut" }}
                    />

                    <motion.path
                        d="M27,168c14.2,32.8,23.8,66.4,19.7,102.4-3.7,32.9-9.5,65.6-14,98.4-5.3,37.9-8,75.9.7,113.7,10.6,46.1,32.3,85.5,70.7,114.3,29.7,22.2,64.2,33.3,100,40.4,18.8,3.7,38,5.8,58.6,8.8-4.1,1.2-6.9,2-9.7,2.9-55.4,17-94,54.4-122.6,103.1-19.8,33.6-31.3,70.2-35.2,109.2-3.6,35.7-3.4,70.9,8.9,105.2,11.3,31.4,29.4,56.9,61.4,70.1,15.4,6.4,31.2,7,46.8,1.1,2.9-1.1,7-4.6,6.9-6.9-.1-4-2.3-8.6-5-11.7-1.9-2.3-6-3-9.2-3.9-22.1-6.1-34.6-20.7-36.9-43.2-1.9-19,1-37.6,9.4-55.1,18.3-38.4,48-67.3,80.4-92.9,49.7-39.2,104.6-69,169.2-75,16-1.5,32.7,0,48.5,3,5.8,1.1,10.2,3.6,13.3,7.1,6.2,7.1,5.2,17.5,4.4,23.2-8.8,62.4-28.6,100.4-28.6,100.4,0,0-18.1,34.7-46.1,71.1,29.4,5.1,56.5,1.4,77.6-3.9,19.4-48.3,32.6-91.7,47.7-141.2,16.3-53.3,25.5-91.1,28.9-136,2.4-31.7,2.3-63.8.2-95.5-2.1-30.4-6-61-13.2-90.5-22-89.6-61.4-171.2-119.2-243.6-50.1-62.8-110-113.6-182.2-149.2-57-28.1-116.4-48.5-180-54.4-14.4-1.4-29.5-.8-43.6,2.2C4.8,47.7-4.6,75.4,2,102.7c5.5,22.5,15.8,43.9,25,65.3ZM124.9,375.9c5.7-18.9,20.9-28.2,40.3-24.5,44.9,8.4,87.1,24.1,127.9,44.6,61.6,30.8,103.4,80.3,135.1,139.8,4.9,9.3,10.1,18.4,14.3,26.1-20.4-13.5-41.3-28.9-63.6-41.7-49.6-28.4-103.1-47.1-159-58.9-25.3-5.4-50.7-11-72.7-26-19.7-13.4-28.8-37.7-22.3-59.3ZM133,239.5c3.6-12.9,15.3-18.1,30.9-14.1,70.7,18.2,130.5,53.5,174.6,112.9,14.4,19.4,22.1,41.9,29.6,64.4,2.2,6.7,4.5,13.3,7.1,21-37.9-32-78.1-58-123.7-75.1-25.6-9.6-51.5-18.5-76.7-29.1-23.1-9.7-39.4-26.7-43.6-52.3-1.5-9-.6-19,1.9-27.8ZM147.8,894.2c1.6-18.3,2.4-35.5,4.8-52.6,5.3-37,17.1-71.5,39.8-101.8,29.4-39.3,68.8-62.7,117-69.7,67.8-9.9,128.8,7.5,182.8,49.6,1.6,1.2,2.9,2.7,5.4,4.9-150.3-12.7-260.3,54.5-349.7,169.6ZM396.8,632.6c-45.3-14.4-91.7-25.6-137.5-38.6-30.2-8.6-60.6-17-86.3-36.3-11.3-8.5-21.1-18.7-25.8-32.6-7.6-22.4,7-44,30.5-42.9,39.3,1.7,77.5,10.2,114.8,22.4,54.6,17.9,105.2,44,147.9,83,34.1,31.1,61.2,67.5,72.7,115.9-32.2-37.1-72.8-57-116.2-70.9ZM367.3,279.5c8.3-5.3,15.5,3.5,21.5,8.7,32.1,27.5,55.3,61.8,75.2,98.6,29.5,54.3,46.9,112.8,59.1,173,6.7,33,9.2,66.3,7.2,100.1-10.2-26.7-27.5-48.9-43.2-72.1-45.6-67.2-77.2-140.7-101.7-217.6-7.1-22.2-14.6-44.3-21.2-66.7-2.4-8.1-4.8-18.9,3.1-24ZM130.5,115.2c73.4,16,138.8,48.6,196.9,95.9,12.6,10.3,24.5,21.4,36.8,32.2-19.7-3.2-26,4.6-28.8,25.8-.9,7-.1,14.2-.1,21.3-10.3-9.2-20.8-18.8-31.6-28-34.9-29.5-76.1-46.9-118.8-61.5-18-6.2-36.3-11.9-53.6-19.6-15.1-6.8-25.6-18.8-29.7-35.7-4.8-19.8,9.1-34.6,28.9-30.3Z"
                        fill="url(#logoGradient)"
                        filter="url(#glow)"
                        strokeWidth="0"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1.5, delay: 0.4, ease: "easeInOut" }}
                    />

                    <motion.path
                        d="M931.3,502.1c-2.8,1-5.1,1.4-7,1.5-17,1.4-34.8-5.4-34.8-5.4-4.3-1.7-10.4-4.3-17.3-8.6,20.4,35.5,81.2,40.7,94.4,24.9-8.5.1-12.4-2.3-14.3-4.8-3-3.9-1.5-8.5-2.5-16.7-.8-7.2-3.1-13.1-5.2-17.3.4,1.4,2.5,11-3.5,19-3.4,4.6-8,6.6-10,7.3Z"
                        fill="url(#logoGradient)"
                        filter="url(#glow)"
                        strokeWidth="0"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1.5, delay: 0.6, ease: "easeInOut" }}
                    />
                </motion.svg>

              {/* Pulsing glow effect */}
              <motion.div
                className="absolute inset-0 rounded-full bg-pink-300/30 blur-3xl dark:bg-pink-500/20"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>

            {/* Brand Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="mt-8 text-center"
            >
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-pink-400 bg-clip-text text-transparent dark:from-pink-400 dark:to-pink-200">
                You & Me Beauty
              </h1>
              <p className="mt-2 text-sm text-pink-600/70 dark:text-pink-300/70">
                The beauty for you and me.
              </p>
            </motion.div>

            {/* Loading indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.4 }}
              className="mt-8 flex justify-center"
            >
              <div className="flex space-x-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="h-2 w-2 rounded-full bg-primary "
                    animate={{
                      y: [0, -10, 0],
                      opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
