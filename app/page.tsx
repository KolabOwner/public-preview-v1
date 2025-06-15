'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
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
  ChevronDown,
  Star,
  Users,
  Target,
  BarChart3,
  Award,
  Clock,
  Globe,
  Layers,
  Menu,
  X
} from 'lucide-react';

// Professional Animated Gradient Background
const AnimatedGradientBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950" />
      
      {/* Animated gradient orbs */}
      <div className="absolute inset-0" style={{ '--size': '600px' } as React.CSSProperties}>
        {/* Blue gradient */}
        <div 
          style={{
            animationDuration: '40s',
            background: 'radial-gradient(circle, rgb(59, 130, 246) 0px, rgba(59, 130, 246, 0) 50%) no-repeat',
            filter: 'blur(96px)'
          }}
          className="absolute left-[calc(50%-var(--size)/2)] top-[calc(50%-var(--size)/2)] h-[var(--size)] w-full animate-first opacity-70 mix-blend-normal"
        />
        
        {/* Purple gradient */}
        <div 
          style={{
            animationDuration: '30s',
            background: 'radial-gradient(circle, rgb(147, 51, 234) 0px, rgba(147, 51, 234, 0) 50%) no-repeat',
            filter: 'blur(96px)'
          }}
          className="absolute left-[calc(50%-var(--size)/2)] top-[calc(50%-var(--size)/2)] h-[var(--size)] w-full animate-second opacity-70 mix-blend-normal"
        />
        
        {/* Pink gradient */}
        <div 
          style={{
            animationDuration: '60s',
            background: 'radial-gradient(circle, rgb(236, 72, 153) 0px, rgba(236, 72, 153, 0) 50%) no-repeat',
            filter: 'blur(96px)'
          }}
          className="absolute left-[calc(50%-var(--size)/2)] top-[calc(50%-var(--size)/2)] h-[var(--size)] w-full animate-third opacity-60 mix-blend-normal"
        />
        
        {/* Teal gradient */}
        <div 
          style={{
            animationDuration: '50s',
            background: 'radial-gradient(circle, rgb(20, 184, 166) 0px, rgba(20, 184, 166, 0) 50%) no-repeat',
            filter: 'blur(96px)'
          }}
          className="absolute left-[calc(50%-var(--size)/2)] top-[calc(50%-var(--size)/2)] h-[var(--size)] w-full animate-fourth opacity-50 mix-blend-normal"
        />
      </div>
      
      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-20 mix-blend-soft-light"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27noiseFilter%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.65%27 numOctaves=%273%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23noiseFilter)%27/%3E%3C/svg%3E")`
        }}
      />
    </div>
  );
};

// Enhanced Navigation
const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-slate-950/95 backdrop-blur-xl border-b border-white/10' : ''
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <motion.div 
            className="flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur-md opacity-50" />
                <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
                  <Zap className="w-5 h-5 text-white" />
                </div>
              </div>
              <span className="text-2xl font-bold text-white">Hirable<span className="bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">AI</span></span>
            </div>
          </motion.div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">How it Works</a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
            <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">Testimonials</a>
            <Link href="/auth/sign-in" className="text-gray-300 hover:text-white transition-colors">Login</Link>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/auth/sign-up" className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all">
                Get Started Free
              </Link>
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-slate-950/95 backdrop-blur-xl border-b border-white/10"
          >
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="block text-gray-300 hover:text-white transition-colors">How it Works</a>
              <a href="#pricing" className="block text-gray-300 hover:text-white transition-colors">Pricing</a>
              <a href="#testimonials" className="block text-gray-300 hover:text-white transition-colors">Testimonials</a>
              <Link href="/auth/sign-in" className="block text-gray-300 hover:text-white transition-colors">Login</Link>
              <Link href="/auth/sign-up" className="block bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg font-medium text-center">
                Get Started Free
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// Enhanced Hero Section
const HeroSection = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, 100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <AnimatedGradientBackground />

      <motion.div 
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20"
        style={{ y, opacity }}
      >
        <div className="text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full"
          >
            <Sparkles className="w-4 h-4 text-yellow-400 mr-2" />
            <span className="text-sm text-white">Powered by Advanced AI Technology</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              Build Resumes That
              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
                Get You Hired
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              Create ATS-optimized resumes in minutes with AI-powered content generation, 
              professional templates, and real-time scoring.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/auth/sign-up" className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all shadow-xl">
                Start Building for Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              Watch Demo
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-8 pt-8"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-white">500K+</div>
              <div className="text-sm text-gray-400">Active Users</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <div className="text-sm text-gray-400">4.9/5 Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">85%</div>
              <div className="text-sm text-gray-400">Interview Success</div>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="w-8 h-8 text-white/50" />
        </motion.div>
      </motion.div>
    </section>
  );
};

// Features Grid Section
const FeaturesGrid = () => {
  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Content",
      description: "Generate tailored content based on job descriptions and your unique experience",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "ATS Optimization",
      description: "Score 90%+ on ATS systems with keyword optimization and proper formatting",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: <Layers className="w-8 h-8" />,
      title: "Professional Templates",
      description: "Choose from 50+ recruiter-approved templates for any industry",
      gradient: "from-green-500 to-teal-500"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Real-time Analytics",
      description: "Track resume performance with detailed analytics and insights",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Privacy First",
      description: "Your data is encrypted and never shared with third parties",
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Save 10+ Hours",
      description: "Create professional resumes in minutes, not hours",
      gradient: "from-pink-500 to-rose-500"
    }
  ];

  return (
    <section id="features" className="py-20 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Everything You Need to
            <span className="block bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
              Land Your Dream Job
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Powerful features designed to help you create standout resumes that get noticed by recruiters
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300"
                style={{
                  backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
                  '--tw-gradient-from': feature.gradient.split(' ')[1],
                  '--tw-gradient-to': feature.gradient.split(' ')[3]
                } as React.CSSProperties}
              />
              <div className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 hover:border-slate-700 transition-colors">
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-xl mb-6`}>
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// How It Works Section
const HowItWorksSection = () => {
  const steps = [
    {
      number: "01",
      title: "Upload Your Info",
      description: "Import your existing resume or start from scratch with our guided form",
      icon: <Upload className="w-6 h-6" />
    },
    {
      number: "02",
      title: "AI Enhancement",
      description: "Our AI analyzes and enhances your content for maximum impact",
      icon: <Brain className="w-6 h-6" />
    },
    {
      number: "03",
      title: "Choose Template",
      description: "Select from professional templates optimized for your industry",
      icon: <Layers className="w-6 h-6" />
    },
    {
      number: "04",
      title: "Download & Apply",
      description: "Export in multiple formats and start applying with confidence",
      icon: <Download className="w-6 h-6" />
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Four simple steps to create a professional resume that gets results
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/4 left-full w-full h-0.5 bg-gradient-to-r from-slate-700 to-transparent" />
              )}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6">
                  <span className="text-2xl font-bold text-white">{step.number}</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Testimonials Section
const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Software Engineer at Google",
      content: "HirableAI helped me land my dream job! The AI suggestions were spot-on and saved me hours of work.",
      avatar: "https://randomuser.me/api/portraits/women/1.jpg"
    },
    {
      name: "Michael Chen",
      role: "Product Manager at Meta",
      content: "The ATS optimization feature is a game-changer. My resume now gets through automated systems every time.",
      avatar: "https://randomuser.me/api/portraits/men/2.jpg"
    },
    {
      name: "Emily Davis",
      role: "Marketing Director at Apple",
      content: "Professional templates and AI-powered content generation made creating my resume effortless.",
      avatar: "https://randomuser.me/api/portraits/women/3.jpg"
    }
  ];

  return (
    <section id="testimonials" className="py-20 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Loved by 500,000+ Job Seekers
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            See what our users have to say about their success stories
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-8"
            >
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-6">&ldquo;{testimonial.content}&rdquo;</p>
              <div className="flex items-center">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-sm text-gray-400">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Pricing Section
const PricingSection = () => {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      features: [
        "1 Resume",
        "Basic Templates",
        "PDF Export",
        "Basic AI Suggestions"
      ],
      cta: "Start Free",
      popular: false
    },
    {
      name: "Pro",
      price: "$19",
      period: "per month",
      features: [
        "Unlimited Resumes",
        "All Premium Templates",
        "ATS Score Checker",
        "Advanced AI Content",
        "Cover Letter Builder",
        "LinkedIn Optimization",
        "Priority Support"
      ],
      cta: "Start Pro Trial",
      popular: true
    },
    {
      name: "Teams",
      price: "$49",
      period: "per month",
      features: [
        "Everything in Pro",
        "5 Team Members",
        "Team Collaboration",
        "Custom Branding",
        "API Access",
        "Dedicated Support",
        "Training Session"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Choose the plan that works best for you. No hidden fees.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative ${plan.popular ? 'scale-105' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              <div className={`bg-slate-900/50 backdrop-blur-sm border ${
                plan.popular ? 'border-purple-500' : 'border-slate-800'
              } rounded-2xl p-8 h-full flex flex-col`}>
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold text-white mb-1">{plan.price}</div>
                  <div className="text-gray-400">{plan.period}</div>
                </div>
                <ul className="space-y-4 mb-8 flex-grow">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-300">
                      <CheckCircle2 className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
                      : 'bg-slate-800 text-white hover:bg-slate-700'
                  }`}
                >
                  {plan.cta}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// CTA Section
const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Ready to Land Your Dream Job?
          </h2>
          <p className="text-xl text-white/90">
            Join 500,000+ job seekers who've already built winning resumes with HirableAI
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/auth/sign-up" className="inline-flex items-center px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-all shadow-xl">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </motion.div>
          </div>
          <p className="text-sm text-white/70">
            No credit card required • 7-day Pro trial included
          </p>
        </motion.div>
      </div>
    </section>
  );
};

// Enhanced Footer
const Footer = () => {
  return (
    <footer className="bg-slate-950 text-gray-300 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">HirableAI</span>
            </div>
            <p className="text-sm">
              Build ATS-optimized resumes with the power of AI
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                  <path d="M12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4z"/>
                  <circle cx="18.406" cy="5.594" r="1.44"/>
                </svg>
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-white">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Templates</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-white">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-white">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">GDPR</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-slate-800 text-center text-sm">
          <p>&copy; 2024 HirableAI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

// Main Landing Page Component
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navigation />
      <HeroSection />
      <FeaturesGrid />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />

      <Footer />
    </div>
  );
}