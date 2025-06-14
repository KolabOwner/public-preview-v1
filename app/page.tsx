'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  FileText,
  Zap,
  Shield,
  Brain,
  Upload,
  Download,
  ChevronDown
} from 'lucide-react';

import { AnimatedBeam } from '../components/landing/AnimatedBeam';
import { AnimatedText } from '../components/landing/AnimatedText';
import { FeatureCard } from '../components/landing/FeatureCard';
import { FloatingIcons } from '../components/landing/FloatingIcons';
import { GlowingButton } from '../components/landing/GlowingButton';
import { GradientText } from '../components/landing/GradientText';
import { ParallaxSection } from '../components/landing/ParallaxSection';
import { StatsCounter } from '../components/landing/StatsCounter';
import { AIDemo } from '../components/landing/AIDemo';
import {
  ATSScoreMeter,
  ResumeComparison,
  AIContentSuggestions,
  TemplateCarousel,
  LiveEditorPreview,
  JobMatchScore
} from '../components/landing/ReziFeatures';

const HeroSection = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AnimatedBeam />
      <FloatingIcons />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center px-4 py-2 bg-purple-500/10 backdrop-blur-sm border border-purple-500/20 rounded-full"
          >
            <Sparkles className="w-4 h-4 text-purple-400 mr-2" />
            <span className="text-sm text-purple-300">AI-Powered Resume Builder</span>
          </motion.div>

          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold">
              <AnimatedText text="Build Your Perfect Resume" className="text-white" />
              <GradientText className="block text-5xl md:text-7xl font-bold mt-2">
                With AI Magic
              </GradientText>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              Create ATS-optimized resumes in minutes, not hours. Let our AI do the heavy lifting
              while you focus on landing your dream job.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <GlowingButton href="/auth/sign-up" size="lg">
              Start Building for Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </GlowingButton>
            <GlowingButton variant="secondary" size="lg">
              Watch Demo
            </GlowingButton>
          </div>

          <div className="flex flex-wrap justify-center gap-8 pt-8">
            <StatsCounter end={500} suffix="K+" label="Users" />
            <StatsCounter end={4.9} suffix="/5" label="Rating" />
            <StatsCounter end={85} suffix="%" label="Success Rate" />
          </div>
        </motion.div>

        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="w-8 h-8 text-white/50" />
        </motion.div>
      </div>
    </section>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      icon: <Brain className="w-6 h-6 text-white" />,
      title: "AI-Powered Content",
      description: "Generate tailored content based on job descriptions and your experience"
    },
    {
      icon: <Zap className="w-6 h-6 text-white" />,
      title: "Instant ATS Scoring",
      description: "Get real-time feedback on ATS compatibility and optimization tips"
    },
    {
      icon: <FileText className="w-6 h-6 text-white" />,
      title: "Professional Templates",
      description: "Choose from dozens of recruiter-approved templates"
    },
    {
      icon: <Shield className="w-6 h-6 text-white" />,
      title: "Privacy First",
      description: "Your data is encrypted and never shared with third parties"
    }
  ];

  return (
    <ParallaxSection offset={30}>
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to
              <GradientText> Succeed</GradientText>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Powerful features designed to help you land interviews
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>
    </ParallaxSection>
  );
};

// AI Demo Section
const AIDemoSection = () => {
  return (
    <section className="py-20 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            See AI in Action
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Watch how our AI transforms your resume content
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <AIDemo />
          <LiveEditorPreview />
        </div>
      </div>
    </section>
  );
};

// Resume Features Section
const ResumeFeaturesSection = () => {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            <GradientText>Advanced Resume Tools</GradientText>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Professional features that give you the competitive edge
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <ATSScoreMeter />
          <ResumeComparison />
          <AIContentSuggestions />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <TemplateCarousel />
          <JobMatchScore />
        </div>
      </div>
    </section>
  );
};

// CTA Section with components
const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-purple-600 to-pink-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            <AnimatedText text="Ready to Land Your Dream Job?" delay={0.1} />
          </h2>
          <p className="text-xl text-white/90">
            Join 500,000+ job seekers who've already built winning resumes with AI
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <GlowingButton href="/auth/sign-up" size="lg">
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </GlowingButton>
          </div>
          <p className="text-sm text-white/70">
            No credit card required • 7-day Pro trial included
          </p>
        </motion.div>
      </div>
    </section>
  );
};

// Main Landing Page Component
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <GradientText className="text-2xl font-bold">
                ResumeAI
              </GradientText>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Features
              </a>
              <a href="#demo" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Demo
              </a>
              <a href="#tools" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Tools
              </a>
              <Link href="/auth/sign-in" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Login
              </Link>
              <GlowingButton href="/auth/sign-up" size="sm">
                Sign Up
              </GlowingButton>
            </div>
          </div>
        </div>
      </nav>

      {/* Sections */}
      <HeroSection />
      <FeaturesSection />
      <AIDemoSection />
      <ResumeFeaturesSection />
      <CTASection />

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">
                <GradientText>ResumeAI</GradientText>
              </h3>
              <p className="text-sm">
                Build ATS-optimized resumes with the power of AI
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Templates</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
            <p>&copy; 2024 ResumeAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}