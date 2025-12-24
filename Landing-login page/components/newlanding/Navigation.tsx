'use client'

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Navigation.css'


export default function Navigation() {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false)
    const [isDark, setIsDark] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 100)

            const darkSections = ['insight', 'cta', 'performance']
            let isDarkSection = false
            const navHeight = 100 // Approximate nav height for trigger point

            for (const id of darkSections) {
                const el = document.getElementById(id)
                if (el) {
                    const rect = el.getBoundingClientRect()
                    // Check if section is overlapping with the navigation area
                    if (rect.top <= navHeight && rect.bottom >= navHeight / 2) {
                        isDarkSection = true
                        break
                    }
                }
            }
            setIsDark(isDarkSection)
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const handleLoginClick = () => {
        navigate('/login');
    };

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-[1000] flex items-center justify-between px-8 md:px-16 py-8 transition-all duration-300 ${scrolled ? 'bg-white/10 backdrop-blur-lg border-b border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.1)]' : 'bg-transparent backdrop-blur-sm'
                } ${isDark ? 'nav-dark' : ''}`}
        >
            <div className="flex items-center gap-2">
                <span className="font-display text-3xl font-bold text-gradient-violet">T</span>
                <span className={`font-accent text-xs font-medium tracking-[0.1em] uppercase transition-colors duration-300 ${isDark ? 'text-paper' : 'text-graphite'}`}>
                    Talent Ops
                </span>
            </div>

            <div className="hidden md:flex gap-4">
                {['Alignment', 'Performance', 'Growth', 'People'].map((item) => (
                    <a
                        key={item}
                        href={`#${item.toLowerCase()}`}
                        className="nav-link"
                    >
                        {item}
                    </a>
                ))}
            </div>

            <div className="flex items-center gap-8">
                <button
                    onClick={handleLoginClick}
                    className={`font-accent text-xs font-semibold tracking-[0.15em] uppercase transition-colors duration-300 px-4 py-2 ${isDark
                        ? 'text-paper hover:text-neutral-300'
                        : 'text-ink hover:text-accent-violet'
                        }`}
                >
                    Login
                </button>
                <a
                    href="#cta"
                    className={`font-accent text-xs font-semibold tracking-[0.15em] uppercase px-8 py-4 rounded-sm transition-all duration-300 hover:-translate-y-0.5 ${isDark
                        ? 'text-ink bg-paper hover:bg-neutral-200'
                        : 'text-paper bg-ink hover:bg-accent-violet'
                        }`}
                >
                    Begin
                </a>
            </div>
        </nav>
    )
}
