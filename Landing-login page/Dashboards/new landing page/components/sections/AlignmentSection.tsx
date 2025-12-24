'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger)
}

export default function AlignmentSection() {
    const sectionRef = useRef<HTMLElement>(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Set initial states
            gsap.set('.alignment-intro-text', { y: 50, opacity: 0 })
            gsap.set('.alignment-word', { x: -100, opacity: 0 })
            gsap.set('.alignment-manifesto', { x: -50, opacity: 0 })

            gsap.to('.alignment-intro-text', {
                scrollTrigger: {
                    trigger: '.alignment-intro',
                    start: 'top 80%',
                    toggleActions: 'play none none reverse',
                },
                y: 0,
                opacity: 1,
                duration: 1,
                ease: 'power3.out',
            })

            const words = gsap.utils.toArray('.alignment-word')
            words.forEach((word: any, index) => {
                gsap.to(word, {
                    scrollTrigger: {
                        trigger: word,
                        start: 'top 85%',
                        toggleActions: 'play none none reverse',
                    },
                    x: 0,
                    opacity: 1,
                    duration: 1.2,
                    delay: index * 0.15,
                    ease: 'power4.out',
                })
            })

            gsap.to('.alignment-manifesto', {
                scrollTrigger: {
                    trigger: '.alignment-manifesto',
                    start: 'top 85%',
                    toggleActions: 'play none none reverse',
                },
                x: 0,
                opacity: 1,
                duration: 1,
                ease: 'power3.out',
            })
        }, sectionRef)

        return () => ctx.revert()
    }, [])

    return (
        <section
            ref={sectionRef}
            id="alignment"
            className="min-h-screen bg-paper-warm flex items-center px-8 md:px-16 py-32"
        >
            <div className="max-w-7xl mx-auto w-full">
                <div className="alignment-intro max-w-2xl mb-32">
                    <span className="font-accent text-xs font-medium tracking-[0.2em] uppercase text-graphite-light mb-16 inline-block">
                        01 — Foundation
                    </span>
                    <p className="alignment-intro-text font-elegant text-[clamp(1.75rem,3vw,2.5rem)] font-normal leading-[1.4] text-graphite">
                        Where organizational harmony begins. The invisible architecture that transforms scattered
                        intentions into unified momentum.
                    </p>
                </div>

                <div className="flex flex-col gap-8 mb-32">
                    <div className="overflow-hidden">
                        <h2 className="alignment-word font-display text-[clamp(4rem,10vw,9rem)] font-bold leading-none tracking-tight cursor-default transition-all duration-300 hover:translate-x-5 hover:tracking-normal">
                            <span className="inline-block text-gradient-violet bg-[length:200%_200%] animate-[gradientShift_8s_ease_infinite]">
                                ALIGNMENT
                            </span>
                        </h2>
                    </div>
                    <div className="overflow-hidden">
                        <h2 className="alignment-word font-display text-[clamp(4rem,10vw,9rem)] font-bold leading-none tracking-tight cursor-default transition-all duration-300 hover:translate-x-5 hover:tracking-normal">
                            <span className="inline-block text-gradient-warm bg-[length:200%_200%] animate-[gradientShift_8s_ease_infinite]">
                                CULTURE
                            </span>
                        </h2>
                    </div>
                    <div className="overflow-hidden">
                        <h2 className="alignment-word font-display text-[clamp(4rem,10vw,9rem)] font-bold leading-none tracking-tight cursor-default transition-all duration-300 hover:translate-x-5 hover:tracking-normal">
                            <span
                                className="inline-block bg-[length:200%_200%] animate-[gradientShift_8s_ease_infinite]"
                                style={{
                                    background: 'linear-gradient(135deg, #0A0A0B 0%, #7C3AED 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                }}
                            >
                                VISION
                            </span>
                        </h2>
                    </div>
                </div>

                <div className="alignment-manifesto max-w-3xl pl-16 border-l-2 border-accent-violet">
                    <p className="font-elegant text-[clamp(1.125rem,1.5vw,1.375rem)] font-normal leading-[1.8] text-graphite">
                        Every organization speaks a language. We help you find yours—
                        <em className="italic text-accent-violet">articulated with precision</em>, felt with
                        purpose.
                    </p>
                </div>
            </div>
        </section>
    )
}
