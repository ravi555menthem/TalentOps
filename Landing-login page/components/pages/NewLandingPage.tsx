import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../newlanding/Navigation';
import CursorGlow from '../newlanding/CursorGlow';
import HeroSection from '../newlanding/sections/HeroSection';
import AlignmentSection from '../newlanding/sections/AlignmentSection';
import PerformanceSection from '../newlanding/sections/PerformanceSection';
import GrowthSection from '../newlanding/sections/GrowthSection';
import PeopleSection from '../newlanding/sections/PeopleSection';
import InsightSection from '../newlanding/sections/InsightSection';
import CTASection from '../newlanding/sections/CTASection';
import Footer from '../newlanding/Footer';
import ClickSpark from '../newlanding/ClickSpark';
import Particles from '../newlanding/Particles';

export const NewLandingPage = () => {
    return (
        <main className="relative">
            <ClickSpark
                sparkColor='#7C3AED'
                sparkSize={10}
                sparkRadius={15}
                sparkCount={8}
                duration={400}
            >
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
            </ClickSpark>
        </main>
    );
};
