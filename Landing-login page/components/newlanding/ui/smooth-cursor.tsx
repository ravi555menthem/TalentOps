'use client'

import React, { useEffect } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

interface SpringConfig {
    damping: number
    stiffness: number
    mass: number
    restDelta: number
}

const defaultSpringConfig: SpringConfig = {
    damping: 45,
    stiffness: 400,
    mass: 1,
    restDelta: 0.001,
}

export const SmoothCursor = () => {
    const cursorX = useMotionValue(-100)
    const cursorY = useMotionValue(-100)

    const springConfig = defaultSpringConfig
    const x = useSpring(cursorX, springConfig)
    const y = useSpring(cursorY, springConfig)

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            cursorX.set(e.clientX)
            cursorY.set(e.clientY)
        }

        window.addEventListener('mousemove', moveCursor)
        return () => {
            window.removeEventListener('mousemove', moveCursor)
        }
    }, [cursorX, cursorY])

    return (
        <motion.div
            className="fixed top-0 left-0 pointer-events-none z-[9999]"
            style={{
                x,
                y,
                translateX: 0,
                translateY: 0,
            }}
        >
            <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-sm"
            >
                <path
                    d="M5.5 2L12.5 24.5L16.5 16.5L24.5 12.5L5.5 2Z"
                    fill="black"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                />
            </svg>
        </motion.div>
    )
}
