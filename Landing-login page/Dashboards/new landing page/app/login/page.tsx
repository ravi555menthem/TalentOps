'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Handle login logic
        console.log('Login:', { username, password })
    }

    return (
        <main className="min-h-screen w-full flex items-center justify-center p-8 bg-paper relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-30">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-accent-violet/20 to-transparent rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-tr from-accent-coral/20 to-transparent rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-sm z-10"
            >
                <div className="mb-12 text-center">
                    <Link href="/" className="inline-block mb-12 hover:scale-110 transition-transform duration-500">
                        <span className="font-display text-5xl font-bold text-gradient-violet block">T</span>
                    </Link>
                    <h1 className="font-display text-4xl font-bold text-ink mb-3">Welcome Back</h1>
                    <p className="font-body text-ink/70 text-sm tracking-wide">Enter your credentials to access the workspace.</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                    <div className="group relative">
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full bg-transparent border-b border-ink/40 py-3 font-body text-ink focus:outline-none focus:border-accent-violet transition-colors placeholder-transparent peer"
                            placeholder="Username"
                        />
                        <label
                            htmlFor="username"
                            className="absolute left-0 top-3 font-accent text-xs font-semibold uppercase tracking-[0.1em] text-ink/60 transition-all duration-300 peer-focus:-translate-y-7 peer-focus:text-[10px] peer-focus:text-accent-violet peer-not-placeholder-shown:-translate-y-7 peer-not-placeholder-shown:text-[10px] pointer-events-none"
                        >
                            Username
                        </label>
                    </div>

                    <div className="group relative">
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-transparent border-b border-graphite/20 py-3 font-body text-ink focus:outline-none focus:border-accent-violet transition-colors placeholder-transparent peer"
                            placeholder="Password"
                        />
                        <label
                            htmlFor="password"
                            className="absolute left-0 top-3 font-accent text-xs font-semibold uppercase tracking-[0.1em] text-mist transition-all duration-300 peer-focus:-translate-y-7 peer-focus:text-[10px] peer-focus:text-accent-violet peer-not-placeholder-shown:-translate-y-7 peer-not-placeholder-shown:text-[10px] pointer-events-none"
                        >
                            Password
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="mt-8 w-full bg-ink text-paper font-accent text-xs font-bold uppercase tracking-[0.2em] py-5 hover:bg-accent-violet transition-colors duration-500"
                    >
                        Log In
                    </button>
                </form>
            </motion.div>
        </main>
    )
}
