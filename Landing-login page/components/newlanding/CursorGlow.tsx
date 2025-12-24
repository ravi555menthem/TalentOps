'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function CursorGlow() {
    const glowRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (glowRef.current) {
                gsap.to(glowRef.current, {
                    x: e.clientX,
                    y: e.clientY,
                    duration: 0.5,
                    ease: 'power2.out',
                })
            }
        }

        document.addEventListener('mousemove', handleMouseMove)
        return () => document.removeEventListener('mousemove', handleMouseMove)
    }, [])

    return (
        <div
            ref={glowRef}
            className="fixed w-[400px] h-[400px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 z-[9999] opacity-0 hover:opacity-100 transition-opacity duration-300"
            style={{
                background: 'radial-gradient(circle, rgba(124, 58, 237, 0.08) 0%, transparent 70%)',
            }}
        />
    )
}
