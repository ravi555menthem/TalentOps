'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger)
}

export default function GrowthSection() {
    const sectionRef = useRef<HTMLElement>(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Set initial states
            gsap.set('.growth-letter', { opacity: 0, x: -30 })
            gsap.set('.cascade-word', { opacity: 0, x: -50 })

            const letters = gsap.utils.toArray('.growth-letter')
            gsap.to(letters, {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 70%',
                    toggleActions: 'play none none reverse',
                },
                opacity: 1,
                x: 0,
                stagger: 0.1,
                duration: 0.8,
                ease: 'power3.out',
            })

            const cascadeWords = gsap.utils.toArray('.cascade-word')
            cascadeWords.forEach((word: any, index) => {
                gsap.to(word, {
                    scrollTrigger: {
                        trigger: '.growth-cascade',
                        start: 'top 75%',
                        toggleActions: 'play none none reverse',
                    },
                    opacity: 1,
                    x: 0,
                    duration: 1,
                    delay: 0.3 + index * 0.2,
                    ease: 'power4.out',
                })
            })
        }, sectionRef)

        return () => ctx.revert()
    }, [])

    const growthText = 'GROWTH'

    return (
        <section
            ref={sectionRef}
            id="growth"
            className="min-h-screen bg-paper grid md:grid-cols-[200px_1fr] relative"
        >
            <div className="flex md:flex-col flex-row justify-center items-center p-8 md:p-16 bg-ink">
                {growthText.split('').map((letter, i) => (
                    <span
                        key={i}
                        className="growth-letter font-display text-[clamp(3rem,6vw,5rem)] font-extrabold leading-none text-gradient-warm transition-transform duration-300 hover:scale-125"
                    >
                        {letter}
                    </span>
                ))}
            </div>

            <div className="flex flex-col justify-center px-8 md:px-16 py-32">
                <span className="font-accent text-xs font-medium tracking-[0.2em] uppercase text-graphite-light mb-16 inline-block">
                    03 — Ascent
                </span>

                <div className="growth-cascade flex flex-col gap-4 mb-32">
                    <h3 className="cascade-word font-elegant text-[clamp(2.5rem,5vw,4.5rem)] font-semibold leading-[1.2] text-accent-violet">
                        DEVELOPMENT
                    </h3>
                    <h3 className="cascade-word font-elegant text-[clamp(2.5rem,5vw,4.5rem)] font-semibold leading-[1.2] text-accent-coral md:pl-16">
                        ENABLEMENT
                    </h3>
                    <h3 className="cascade-word font-elegant text-[clamp(2.5rem,5vw,4.5rem)] font-semibold leading-[1.2] text-accent-gold md:pl-32">
                        POTENTIAL
                    </h3>
                </div>

                <div className="max-w-2xl">
                    <p className="font-elegant text-[clamp(1.125rem,1.5vw,1.375rem)] leading-[2] text-graphite mb-16">
                        The trajectory of empowerment is not linear—it spirals upward, each revolution building
                        upon the last. Growth is both{' '}
                        <em className="italic text-accent-violet">destination and journey</em>, measured not in
                        milestones but in the continuous unfolding of human capacity.
                    </p>

                    <blockquote className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-medium italic leading-[1.4] text-ink pl-8 border-l-[3px] border-accent-gold">
                        "We don't develop employees. We cultivate leaders."
                    </blockquote>
                </div>
            </div>

            <div
                className="absolute top-0 right-0 w-[40%] h-full pointer-events-none"
                style={{
                    background: 'linear-gradient(270deg, rgba(124, 58, 237, 0.05) 0%, transparent 100%)',
                }}
            />
        </section>
    )
}
