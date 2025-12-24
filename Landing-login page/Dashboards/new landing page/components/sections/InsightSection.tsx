'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger)
}

export default function InsightSection() {
    const sectionRef = useRef<HTMLElement>(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.set('.insight-headline', { opacity: 0, y: 30 })
            gsap.set('.insight-card', { opacity: 0, y: 50 })

            // Parallax animation for background words
            const bgWords = gsap.utils.toArray('.insight-bg-word')
            bgWords.forEach((word: any, index) => {
                gsap.to(word, {
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 1,
                    },
                    x: index % 2 === 0 ? '15%' : '-15%',
                    ease: 'none',
                })
            })

            ScrollTrigger.create({
                trigger: '.insight-headline',
                start: 'top 80%',
                once: true,
                onEnter: () => {
                    gsap.to('.insight-headline', {
                        opacity: 1,
                        y: 0,
                        duration: 1,
                        ease: 'power3.out',
                    })
                },
            })

            gsap.to('.insight-card', {
                scrollTrigger: {
                    trigger: '.insight-cards',
                    start: 'top 80%',
                    once: true,
                },
                opacity: 1,
                y: 0,
                stagger: 0.15,
                duration: 0.8,
                ease: 'power3.out',
            })
        }, sectionRef)

        return () => ctx.revert()
    }, [])

    const features = [
        {
            num: '01',
            title: 'Workforce Analytics',
            desc: 'Predictive intelligence that anticipates needs before they become problems.',
        },
        {
            num: '02',
            title: 'Leadership Enablement',
            desc: 'Tools and insights that transform managers into mentors.',
        },
        {
            num: '03',
            title: 'Culture Intelligence',
            desc: 'Real-time pulse on organizational health and team dynamics.',
        },
    ]

    return (
        <section
            ref={sectionRef}
            id="insight"
            className="min-h-screen bg-ink text-paper flex items-center px-8 md:px-16 py-32 relative overflow-hidden"
        >
            <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center pointer-events-none">
                <div className="insight-bg-word font-display text-[clamp(6rem,18vw,16rem)] font-black leading-[0.9] text-ink-soft opacity-30 whitespace-nowrap -translate-x-[10%]">
                    INSIGHT
                </div>
                <div className="insight-bg-word font-display text-[clamp(6rem,18vw,16rem)] font-black leading-[0.9] text-ink-soft opacity-30 whitespace-nowrap translate-x-[10%]">
                    CLARITY
                </div>
                <div className="insight-bg-word font-display text-[clamp(6rem,18vw,16rem)] font-black leading-[0.9] text-ink-soft opacity-30 whitespace-nowrap -translate-x-[10%]">
                    WISDOM
                </div>
            </div>

            <div className="max-w-7xl mx-auto w-full relative z-10">
                <span className="font-accent text-xs font-medium tracking-[0.2em] uppercase text-graphite-light mb-16 inline-block">
                    05 — Revelation
                </span>

                <h2 className="insight-headline font-display text-[clamp(2.5rem,5vw,4.5rem)] font-medium leading-[1.3] mb-32 max-w-4xl">
                    Where <span className="italic text-gradient-violet">data</span> becomes{' '}
                    <span className="italic text-gradient-violet">direction</span>
                </h2>

                <div className="insight-cards grid md:grid-cols-3 gap-16">
                    {features.map((feature, i) => (
                        <div
                            key={i}
                            className="insight-card p-16 border border-graphite rounded transition-all duration-300 hover:border-accent-violet hover:bg-accent-violet/5"
                        >
                            <span className="font-accent text-xs tracking-[0.2em] text-accent-violet block mb-8">
                                {feature.num}
                            </span>
                            <h4 className="font-elegant text-[clamp(1.75rem,3vw,2.5rem)] font-medium mb-4">
                                {feature.title}
                            </h4>
                            <p className="font-body text-base leading-[1.7] text-mist">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
