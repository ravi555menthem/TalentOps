import type { Metadata } from 'next'
import { Playfair_Display, Cormorant_Garamond, Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
    subsets: ['latin'],
    variable: '--font-playfair',
    weight: ['400', '500', '600', '700', '800', '900'],
    style: ['normal', 'italic'],
})

const cormorant = Cormorant_Garamond({
    subsets: ['latin'],
    variable: '--font-cormorant',
    weight: ['300', '400', '500', '600', '700'],
    style: ['normal', 'italic'],
})

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    weight: ['300', '400', '500', '600', '700'],
})

const spaceGrotesk = Space_Grotesk({
    subsets: ['latin'],
    variable: '--font-space',
    weight: ['300', '400', '500', '600', '700'],
})

import ClickSpark from '@/components/ClickSpark'

export const metadata: Metadata = {
    title: 'Talent Ops Platform | The Architecture of Talent',
    description: 'A typography-first experience exploring the art of human-centric operations',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="scroll-smooth">
            <body className={`${playfair.variable} ${cormorant.variable} ${inter.variable} ${spaceGrotesk.variable} font-body bg-paper`}>
                <ClickSpark
                    sparkColor="#D4AF37"
                    sparkSize={12}
                    sparkRadius={20}
                    sparkCount={12}
                    duration={500}
                >
                    {children}
                </ClickSpark>
            </body>
        </html>
    )
}
