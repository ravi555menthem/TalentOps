'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger)
}

export default function PerformanceSection() {
    const sectionRef = useRef<HTMLElement>(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Set initial state for characters
            gsap.set('.perf-char', { opacity: 0, y: 50 })

            const chars = gsap.utils.toArray('.perf-char')
            gsap.to(chars, {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 60%',
                    toggleActions: 'play none none reverse',
                },
                opacity: 1,
                y: 0,
                stagger: 0.05,
                duration: 0.8,
                ease: 'power3.out',
            })

            // Parallax animation for background METRICS text
            gsap.to('.perf-bg-text', {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1,
                },
                x: '10%',
                ease: 'none',
            })

            gsap.from('.perf-narrative p', {
                scrollTrigger: {
                    trigger: '.perf-narrative',
                    start: 'top 80%',
                    toggleActions: 'play none none reverse',
                },
                y: 30,
                opacity: 0,
                stagger: 0.2,
                duration: 0.8,
                ease: 'power3.out',
            })
        }, sectionRef)

        return () => ctx.revert()
    }, [])

    const performanceText = 'PERFORMANCE'

    return (
        <section
            ref={sectionRef}
            id="performance"
            className="min-h-screen bg-ink text-paper flex items-center px-8 md:px-16 py-32 relative overflow-hidden"
        >
            <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-16 items-center">
                <div className="relative">
                    <span className="font-accent text-xs font-medium tracking-[0.2em] uppercase text-mist mb-16 inline-block">
                        02 — Pulse
                    </span>
                    <h2 className="font-display text-[clamp(2.5rem,6vw,5rem)] font-extrabold leading-none tracking-tight flex flex-nowrap">
                        {performanceText.split('').map((char, i) => (
                            <span
                                key={i}
                                className="perf-char inline-block transition-all duration-300 hover:text-accent-coral hover:-translate-y-2 hover:scale-110"
                            >
                                {char}
                            </span>
                        ))}
                    </h2>
                </div>

                <div className="flex flex-col gap-16">


                    <div className="perf-narrative flex flex-col gap-8">
                        <p className="font-elegant text-[clamp(1.125rem,1.5vw,1.375rem)] leading-[1.8] text-mist">
                            Data without context is noise.{' '}
                            <span className="text-accent-violet font-medium">Performance intelligence</span>{' '}
                            transforms metrics into meaning—revealing the human stories behind every number.
                        </p>
                        <p className="font-elegant text-[clamp(1.125rem,1.5vw,1.375rem)] leading-[1.8] text-mist">
                            We don't just measure. We{' '}
                            <span className="text-accent-coral font-semibold relative group">
                                illuminate
                                <span className="absolute bottom-[-2px] left-0 w-full h-[2px] bg-accent-coral scale-x-0 origin-right transition-transform duration-300 group-hover:scale-x-100 group-hover:origin-left" />
                            </span>
                            .
                        </p>
                    </div>
                </div>
            </div>

            <div className="perf-bg-text absolute bottom-[-5%] right-[-5%] font-display text-[clamp(8rem,25vw,20rem)] font-black leading-none text-graphite opacity-50 pointer-events-none select-none">
                METRICS
            </div>
        </section>
    )
}
