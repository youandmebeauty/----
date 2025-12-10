"use client"

import { motion, AnimatePresence } from "framer-motion"
import { LoadingAnimation } from "@/components/ui/loading-animation"

interface NavigationLoadingProps {
  isLoading: boolean
}

export function NavigationLoading({ isLoading }: NavigationLoadingProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <>
          {/* Backdrop blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed cursor-wait inset-0 z-[9998] bg-background/80 backdrop-blur-sm "
          />

          {/* Loading spinner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="fixed top-1/3 cursor-wait max-h-screen w-full z-[9999]"
          >
            <div className="flex flex-col items-center  justify-center gap-4">
              {/* Use your existing LoadingAnimation component */}
              <LoadingAnimation size={140} />

              {/* Loading text */}
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-sm font-medium text-pink-600 dark:text-pink-400"
              >
                Chargement...
              </motion.p>

              {/* Animated dots */}
              <div className="flex space-x-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-pink-400 dark:bg-pink-300"
                    animate={{
                      y: [0, -8, 0],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.1,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
