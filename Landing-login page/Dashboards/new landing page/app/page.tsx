import Navigation from '@/components/Navigation'
import CursorGlow from '@/components/CursorGlow'
import HeroSection from '@/components/sections/HeroSection'
import AlignmentSection from '@/components/sections/AlignmentSection'
import PerformanceSection from '@/components/sections/PerformanceSection'
import GrowthSection from '@/components/sections/GrowthSection'
import PeopleSection from '@/components/sections/PeopleSection'
import InsightSection from '@/components/sections/InsightSection'
import CTASection from '@/components/sections/CTASection'
import Footer from '@/components/Footer'

export default function Home() {
    return (
        <main>
            <CursorGlow />
            <Navigation />
            <HeroSection />
            <AlignmentSection />
            <PerformanceSection />
            <GrowthSection />
            <PeopleSection />
            <InsightSection />
            <CTASection />
            <Footer />
        </main>
    )
}
