'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import '@/components/UiverseButton.css'
import '@/components/UiverseCard.css'

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger)
}

export default function PeopleSection() {
    const sectionRef = useRef<HTMLElement>(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Set initial states
            gsap.set('.people-center', { scale: 0.8, opacity: 0 })
            gsap.set('.people-card', { y: 60, opacity: 0 })

            gsap.to('.people-center', {
                scrollTrigger: {
                    trigger: '.people-hero',
                    start: 'top 75%',
                    toggleActions: 'play none none reverse',
                },
                scale: 1,
                opacity: 1,
                duration: 1,
                ease: 'power3.out',
            })

            gsap.to('.people-card', {
                scrollTrigger: {
                    trigger: '.people-grid',
                    start: 'top 85%',
                    toggleActions: 'play none none reverse',
                },
                y: 0,
                opacity: 1,
                stagger: 0.15,
                duration: 0.8,
                ease: 'power3.out',
            })
        }, sectionRef)

        return () => ctx.revert()
    }, [])

    const cards = [
        {
            title: 'INTELLIGENCE',
            text: 'Human-centric analytics that understand the whole person, not just the performance review.',
            color: '#7C3AED',
            gradientStart: '#7C3AED',
            gradientEnd: '#3700ff',
            shadowColor: 'rgba(124, 58, 237, 0.3)',
        },
        {
            title: 'ENGAGEMENT',
            text: "Creating environments where belonging isn't a policy—it's a lived experience.",
            color: '#F97066',
            gradientStart: '#F97066',
            gradientEnd: '#FCD34D',
            shadowColor: 'rgba(249, 112, 102, 0.3)',
        },
        {
            title: 'WELLBEING',
            text: 'The foundation of sustainable performance. When people thrive, organizations flourish.',
            color: '#D4AF37',
            gradientStart: '#D4AF37',
            gradientEnd: '#22D3EE',
            shadowColor: 'rgba(212, 175, 55, 0.3)',
        },
    ]

    return (
        <section
            ref={sectionRef}
            id="people"
            className="people-hero min-h-screen bg-paper flex flex-col items-center justify-center p-8 md:p-16 relative overflow-hidden"
            style={{
                background: 'linear-gradient(180deg, #FAF8F5 0%, #F8F7F4 100%)',
            }}
        >
            <div className="max-w-7xl mx-auto w-full">
                <span className="font-accent text-xs font-medium tracking-[0.2em] uppercase text-accent-coral mb-16 inline-block">
                    04 — Heart
                </span>

                <div className="people-hero flex justify-center mb-32">
                    <div className="relative w-[400px] h-[400px]">
                        <svg viewBox="0 0 400 400" className="w-full h-full animate-[spin_30s_linear_infinite]">
                            <defs>
                                <path id="circlePath" d="M200,200 m-150,0 a150,150 0 1,1 300,0 a150,150 0 1,1 -300,0" />
                            </defs>
                            <text className="font-accent text-xl font-semibold tracking-[0.3em] uppercase fill-accent-coral">
                                <textPath href="#circlePath">PEOPLE · PEOPLE · PEOPLE · PEOPLE · PEOPLE · PEOPLE ·PEOPLE ·</textPath>
                            </text>
                        </svg>
                        <div className="people-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                            <span className="font-display text-[clamp(1.5rem,3vw,2rem)] font-bold leading-[1.2] text-ink">
                                Architecture
                                <br />
                                Never Breaks
                            </span>
                        </div>
                    </div>
                </div>

                <div className="people-grid grid md:grid-cols-3 gap-16 mb-32">
                    {cards.map((card, i) => (
                        <div
                            key={i}
                            className="people-card uiverse-card group"
                            style={{
                                '--gradient-start': card.gradientStart,
                                '--gradient-end': card.gradientEnd,
                                '--shadow-color': card.shadowColor,
                                '--card-bg': '#ffffff'
                            } as React.CSSProperties}
                        >
                            <div className="uiverse-card2 flex flex-col justify-between">
                                <h4 className="mb-8">
                                    <button
                                        className="uiverse-button"
                                        data-text={card.title}
                                        style={{ '--animation-color': card.color } as React.CSSProperties}
                                    >
                                        <span className="actual-text">&nbsp;{card.title}&nbsp;</span>
                                        <span aria-hidden="true" className="hover-text">
                                            &nbsp;{card.title}&nbsp;
                                        </span>
                                    </button>
                                </h4>
                                <p className="font-elegant text-[clamp(1.125rem,1.5vw,1.375rem)] leading-[1.7] text-graphite">
                                    {card.text}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center py-32">
                    <p className="font-display text-[clamp(2.5rem,5vw,4.5rem)] font-semibold italic text-ink">
                        Technology serves humanity. Never the reverse.
                    </p>
                </div>
            </div>
        </section>
    )
}
