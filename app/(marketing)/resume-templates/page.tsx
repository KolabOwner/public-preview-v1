'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import MainNavbar from '@/components/features/dashboard/main-navbar';
import Footer from '@/components/marketing/Footer';
import CtaSection from '@/components/marketing/CtaSection';
import DashboardMockup from '@/components/marketing/DashboardMockup';

export default function ResumeTemplatesPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };
  return (
    <div className="min-h-screen bg-white">
      <MainNavbar />
      
      {/* Hero Section */}
      <section className="bg-gray-50 py-20 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                Resume Templates
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Professional Resume
              <span className="text-amber-600 block">Templates Collection</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Choose from our collection of ATS-friendly resume templates. Modern, simple, creative, 
              and compact designs built for the modern job hunt.
            </p>
            
            {/* Tab Navigation */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <button className="px-6 py-3 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition-colors">
                Simple
              </button>
              <button className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                Modern
              </button>
              <button className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                Creative
              </button>
              <button className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                Compact
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/sign-up" 
                className="bg-amber-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-amber-600 transition-colors"
              >
                Browse Templates
              </Link>
              <Link 
                href="/sign-up" 
                className="bg-white text-amber-600 px-8 py-4 rounded-lg font-semibold text-lg border border-amber-600 hover:bg-amber-50 transition-colors"
              >
                Create Resume
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* New Resume Templates Section - Copying exact styling from keyword-scanner */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <div className="flex justify-between items-start mb-8">
              <div className="max-w-4xl">
                <div className="mb-2">
                  <span className="text-amber-600 font-semibold text-sm uppercase tracking-wide">Just Released</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                  New resume templates
                </h2>
              </div>
              <Link 
                href="/sign-up" 
                className="bg-navy-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-navy-800 transition-colors"
              >
                Create your resume now
              </Link>
            </div>
          </div>

          {/* Template Carousel - Exact copy from keyword-scanner */}
          <div className="relative">
            <div className="flex overflow-x-auto space-x-8 pb-4 scrollbar-hide">
              {/* Standard Template */}
              <div className="flex-shrink-0 w-80">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <Link href="/sign-up" className="block">
                    <div className="aspect-[3/4] overflow-hidden">
                      <Image
                        src="/images/templates/StandardTemplate.png"
                        alt="Standard Resume Template"
                        width={400}
                        height={533}
                        className="w-full h-full object-cover border border-gray-200"
                      />
                    </div>
                  </Link>
                  <div className="p-6">
                    <div className="mb-3">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Standard</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Ultimate readability and well-organized layout. Highlights what matters the most. A safe pick for all jobs across all industries.
                      </p>
                    </div>
                    <div className="flex items-center mb-4">
                      <span className="text-amber-600 font-semibold text-sm mr-2">Recommended:</span>
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-amber-600 fill-current" />
                        ))}
                      </div>
                    </div>
                    <Link 
                      href="/sign-up" 
                      className="w-full bg-navy-900 text-white py-2 px-4 rounded-lg font-semibold text-center block hover:bg-navy-800 transition-colors"
                    >
                      Use this template
                    </Link>
                  </div>
                </div>
              </div>

              {/* Modern Template */}
              <div className="flex-shrink-0 w-80">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <Link href="/sign-up" className="block">
                    <div className="aspect-[3/4] overflow-hidden">
                      <Image
                        src="/images/templates/ModernTemplate.png"
                        alt="Modern Resume Template"
                        width={400}
                        height={533}
                        className="w-full h-full object-cover border border-gray-200"
                      />
                    </div>
                  </Link>
                  <div className="p-6">
                    <div className="mb-3">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Modern</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Clean contemporary design with subtle styling elements. Perfect for tech roles and forward-thinking companies.
                      </p>
                    </div>
                    <div className="flex items-center mb-4">
                      <span className="text-amber-600 font-semibold text-sm mr-2">Recommended:</span>
                      <div className="flex space-x-1">
                        {[...Array(4)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-amber-600 fill-current" />
                        ))}
                        <Star className="w-4 h-4 text-gray-300" />
                      </div>
                    </div>
                    <Link 
                      href="/sign-up" 
                      className="w-full bg-navy-900 text-white py-2 px-4 rounded-lg font-semibold text-center block hover:bg-navy-800 transition-colors"
                    >
                      Use this template
                    </Link>
                  </div>
                </div>
              </div>

              {/* Compact Template */}
              <div className="flex-shrink-0 w-80">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <Link href="/sign-up" className="block">
                    <div className="aspect-[3/4] overflow-hidden">
                      <Image
                        src="/images/templates/CompactTemplate.png"
                        alt="Compact Resume Template"
                        width={400}
                        height={533}
                        className="w-full h-full object-cover border border-gray-200"
                      />
                    </div>
                  </Link>
                  <div className="p-6">
                    <div className="mb-3">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Compact</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Maximizes page space for dense information. Ideal for seasoned professionals with extensive experience to showcase.
                      </p>
                    </div>
                    <div className="flex items-center mb-4">
                      <span className="text-amber-600 font-semibold text-sm mr-2">Recommended:</span>
                      <div className="flex space-x-1">
                        {[...Array(4)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-amber-600 fill-current" />
                        ))}
                        <Star className="w-4 h-4 text-gray-300" />
                      </div>
                    </div>
                    <Link 
                      href="/sign-up" 
                      className="w-full bg-navy-900 text-white py-2 px-4 rounded-lg font-semibold text-center block hover:bg-navy-800 transition-colors"
                    >
                      Use this template
                    </Link>
                  </div>
                </div>
              </div>

              {/* Bold Template */}
              <div className="flex-shrink-0 w-80">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <Link href="/sign-up" className="block">
                    <div className="aspect-[3/4] overflow-hidden">
                      <Image
                        src="/images/templates/BoldTemplate.png"
                        alt="Bold Resume Template"
                        width={400}
                        height={533}
                        className="w-full h-full object-cover border border-gray-200"
                      />
                    </div>
                  </Link>
                  <div className="p-6">
                    <div className="mb-3">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Bold</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Stand out with strategic use of color and typography. Perfect for creative industries and design-focused roles.
                      </p>
                    </div>
                    <div className="flex items-center mb-4">
                      <span className="text-amber-600 font-semibold text-sm mr-2">Recommended:</span>
                      <div className="flex space-x-1">
                        {[...Array(3)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-amber-600 fill-current" />
                        ))}
                        {[...Array(2)].map((_, i) => (
                          <Star key={i + 3} className="w-4 h-4 text-gray-300" />
                        ))}
                      </div>
                    </div>
                    <Link 
                      href="/sign-up" 
                      className="w-full bg-navy-900 text-white py-2 px-4 rounded-lg font-semibold text-center block hover:bg-navy-800 transition-colors"
                    >
                      Use this template
                    </Link>
                  </div>
                </div>
              </div>

              {/* Alternative Template */}
              <div className="flex-shrink-0 w-80">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <Link href="/sign-up" className="block">
                    <div className="aspect-[3/4] overflow-hidden">
                      <Image
                        src="/images/templates/AlternativeTemplate.png"
                        alt="Alternative Resume Template"
                        width={400}
                        height={533}
                        className="w-full h-full object-cover border border-gray-200"
                      />
                    </div>
                  </Link>
                  <div className="p-6">
                    <div className="mb-3">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Alternative</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Unique layout with distinctive section organization. Ideal for professionals seeking a memorable first impression.
                      </p>
                    </div>
                    <div className="flex items-center mb-4">
                      <span className="text-amber-600 font-semibold text-sm mr-2">Recommended:</span>
                      <div className="flex space-x-1">
                        {[...Array(4)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-amber-600 fill-current" />
                        ))}
                        <Star className="w-4 h-4 text-gray-300" />
                      </div>
                    </div>
                    <Link 
                      href="/sign-up" 
                      className="w-full bg-navy-900 text-white py-2 px-4 rounded-lg font-semibold text-center block hover:bg-navy-800 transition-colors"
                    >
                      Use this template
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Templates Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <div className="flex justify-between items-start mb-8">
              <div className="max-w-4xl">
                <div className="mb-2">
                  <span className="text-amber-600 font-semibold text-sm uppercase tracking-wide">Popular Choice</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                  Simple resume templates
                </h2>
                <p className="text-lg text-gray-600 mt-4">
                  Clean, professional designs perfect for any industry. These templates focus on readability and ATS compatibility.
                </p>
              </div>
              <Link 
                href="/sign-up" 
                className="bg-navy-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-navy-800 transition-colors"
              >
                View all simple templates
              </Link>
            </div>
          </div>

          {/* Simple Templates Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((template) => (
              <div key={template} className="flex-shrink-0">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow">
                  <Link href="/sign-up" className="block">
                    <div className="aspect-[3/4] overflow-hidden">
                      <Image
                        src="/images/templates/StandardTemplate.png"
                        alt={`Simple Resume Template ${template}`}
                        width={400}
                        height={533}
                        className="w-full h-full object-cover border border-gray-200"
                      />
                    </div>
                  </Link>
                  <div className="p-6">
                    <div className="mb-3">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Simple {template}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Clean and professional design with excellent readability. Perfect for all industries and career levels.
                      </p>
                    </div>
                    <div className="flex items-center mb-4">
                      <span className="text-amber-600 font-semibold text-sm mr-2">Recommended:</span>
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-amber-600 fill-current" />
                        ))}
                      </div>
                    </div>
                    <Link 
                      href="/sign-up" 
                      className="w-full bg-navy-900 text-white py-2 px-4 rounded-lg font-semibold text-center block hover:bg-navy-800 transition-colors"
                    >
                      Use this template
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modern Templates Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <div className="flex justify-between items-start mb-8">
              <div className="max-w-4xl">
                <div className="mb-2">
                  <span className="text-amber-600 font-semibold text-sm uppercase tracking-wide">Tech Professionals</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                  Modern resume templates
                </h2>
                <p className="text-lg text-gray-600 mt-4">
                  Contemporary designs with subtle styling elements. Perfect for tech roles and forward-thinking companies.
                </p>
              </div>
              <Link 
                href="/sign-up" 
                className="bg-navy-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-navy-800 transition-colors"
              >
                View all modern templates
              </Link>
            </div>
          </div>

          {/* Modern Templates Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((template) => (
              <div key={template} className="flex-shrink-0">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow">
                  <Link href="/sign-up" className="block">
                    <div className="aspect-[3/4] overflow-hidden">
                      <Image
                        src="/images/templates/ModernTemplate.png"
                        alt={`Modern Resume Template ${template}`}
                        width={400}
                        height={533}
                        className="w-full h-full object-cover border border-gray-200"
                      />
                    </div>
                  </Link>
                  <div className="p-6">
                    <div className="mb-3">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Modern {template}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Contemporary design with modern styling elements. Great for tech and innovative industries.
                      </p>
                    </div>
                    <div className="flex items-center mb-4">
                      <span className="text-amber-600 font-semibold text-sm mr-2">Recommended:</span>
                      <div className="flex space-x-1">
                        {[...Array(4)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-amber-600 fill-current" />
                        ))}
                        <Star className="w-4 h-4 text-gray-300" />
                      </div>
                    </div>
                    <Link 
                      href="/sign-up" 
                      className="w-full bg-navy-900 text-white py-2 px-4 rounded-lg font-semibold text-center block hover:bg-navy-800 transition-colors"
                    >
                      Use this template
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compact Templates Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <div className="flex justify-between items-start mb-8">
              <div className="max-w-4xl">
                <div className="mb-2">
                  <span className="text-amber-600 font-semibold text-sm uppercase tracking-wide">Senior Professionals</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                  Compact resume templates
                </h2>
                <p className="text-lg text-gray-600 mt-4">
                  Space-efficient layouts that maximize content. Perfect for experienced professionals with extensive backgrounds.
                </p>
              </div>
              <Link 
                href="/sign-up" 
                className="bg-navy-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-navy-800 transition-colors"
              >
                View all compact templates
              </Link>
            </div>
          </div>

          {/* Compact Templates Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4].slice(0, 3).map((template) => (
              <div key={template} className="flex-shrink-0">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow">
                  <Link href="/sign-up" className="block">
                    <div className="aspect-[3/4] overflow-hidden">
                      <Image
                        src="/images/templates/CompactTemplate.png"
                        alt={`Compact Resume Template ${template}`}
                        width={400}
                        height={533}
                        className="w-full h-full object-cover border border-gray-200"
                      />
                    </div>
                  </Link>
                  <div className="p-6">
                    <div className="mb-3">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Compact {template}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Maximizes page space for dense information. Ideal for seasoned professionals with extensive experience.
                      </p>
                    </div>
                    <div className="flex items-center mb-4">
                      <span className="text-amber-600 font-semibold text-sm mr-2">Recommended:</span>
                      <div className="flex space-x-1">
                        {[...Array(4)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-amber-600 fill-current" />
                        ))}
                        <Star className="w-4 h-4 text-gray-300" />
                      </div>
                    </div>
                    <Link 
                      href="/sign-up" 
                      className="w-full bg-navy-900 text-white py-2 px-4 rounded-lg font-semibold text-center block hover:bg-navy-800 transition-colors"
                    >
                      Use this template
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Three Combined Sections */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section 1: It just works */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <div className="mb-4">
                <span className="text-amber-600 font-semibold text-sm">
                  It just works
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Resume templates that get the job done
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Not to point fingers, but there are tons of resume templates online that *only* look nice. The templates you see here are backed by 10+ years of our team&apos;s experience in resume writing. Pretty templates? Yeah. But more importantly—ruthlessly efficient ones.
              </p>
              <div>
                <Link 
                  href="/sign-up" 
                  className="bg-amber-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-amber-600 transition-colors inline-block"
                >
                  Create your resume now
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative">
                {/* Main Preview Image */}
                <div className="relative bg-white rounded-2xl shadow-2xl p-4 max-w-sm mx-auto">
                  <Image
                    src="/images/templates/preview.svg"
                    alt="Resume Preview"
                    width={300}
                    height={375}
                    className="w-full h-auto"
                  />
                </div>
                {/* Skeleton State Overlay */}
                <div className="absolute -top-4 -left-4 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-10">
                  <Image
                    src="/images/templates/skeleton-state.svg"
                    alt="Template Builder Interface"
                    width={200}
                    height={150}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: AI autofill beyond imagination */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <div className="mb-4">
                <span className="text-amber-600 font-semibold text-sm">
                  The first intelligent resume builder
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                AI autofill beyond imagination
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Rezum AI Bullet Point Writer and AI Resume Summary Generator have been trained to help you describe your achievements in the most impactful way. With these templates, you&apos;ll beat recruiters at their own game.
              </p>
              <div>
                <Link 
                  href="/sign-up" 
                  className="bg-amber-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-amber-600 transition-colors inline-block"
                >
                  Create your resume now
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative">
                {/* Main AI Keyword Tailoring Image */}
                <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 max-w-sm mx-auto">
                  <Image
                    src="/images/templates/ai-keyword-tailoring.svg"
                    alt="AI Keyword Tailoring"
                    width={300}
                    height={375}
                    className="w-full h-auto"
                  />
                </div>
                {/* Skeleton State Overlay */}
                <div className="absolute -top-4 -left-4 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-10">
                  <Image
                    src="/images/templates/skeleton-state.svg"
                    alt="Template Builder Interface"
                    width={200}
                    height={150}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Infinite customization */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="mb-4">
                <span className="text-amber-600 font-semibold text-sm">
                  You do you, a template won&apos;t get in the way
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Infinite customization with intact design
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Your resume should look and feel like <em>you</em>. That&apos;s why you can customize these resume templates as much as you please. Change fonts, colors, rearrange and rename sections, you name it. The design will always stay pitch-perfect.
              </p>
              <div>
                <Link 
                  href="/sign-up" 
                  className="bg-amber-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-amber-600 transition-colors inline-block"
                >
                  Create your resume now
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative">
                {/* Menu Image - Top Left */}
                <div className="absolute -top-4 -left-4 bg-white rounded-xl shadow-lg border border-gray-200 p-3 z-20">
                  <Image
                    src="/images/templates/menu.svg"
                    alt="Customization Menu"
                    width={150}
                    height={100}
                    className="w-full h-auto"
                  />
                </div>
                {/* Skeleton State - Main Background */}
                <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200 p-4 max-w-sm mx-auto">
                  <Image
                    src="/images/templates/skeleton-state.svg"
                    alt="Template Builder Interface"
                    width={300}
                    height={375}
                    className="w-full h-auto"
                  />
                </div>
                {/* Text Action Menu - Bottom Right */}
                <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-lg border border-gray-200 p-3 z-20">
                  <Image
                    src="/images/templates/text-action-menu.svg"
                    alt="Text Action Menu"
                    width={150}
                    height={100}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Blog Post Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12">
            
            {/* Left Content - Template Card */}
            <div className="lg:col-span-4">
              <div className="sticky top-8">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 transform scale-90 origin-top">
                  {/* Template Image */}
                  <div className="aspect-[3/4] overflow-hidden border-b border-gray-200">
                    <Image
                      src="/images/templates/smart-template.png"
                      alt="Smart Resume Template"
                      width={400}
                      height={533}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Template Content */}
                  <div className="p-6">
                    <div className="mb-3">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Just use this template</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Your application-ready resume will write itself in 5 minutes.
                      </p>
                    </div>
                    
                    <div className="flex items-center mb-4">
                      <span className="text-amber-600 font-semibold text-sm mr-2">Recommended:</span>
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-amber-600 fill-current" />
                        ))}
                      </div>
                    </div>
                    
                    <Link 
                      href="/sign-up" 
                      className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold text-center block hover:bg-gray-300 transition-colors"
                    >
                      Use this template
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Article */}
            <div className="lg:col-span-8">
              <article className="prose prose-lg max-w-none">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Resumes, AI, and You. Here&apos;s what you need to know
                </h2>
                
                <div className="text-gray-600 space-y-6">
                  <p>
                    You&apos;re probably familiar with how vast technology has evolved over the years.
                  </p>
                  
                  <p>
                    Virtual reality exists, machine learning has become a thing, and Tesla is already in the works of developing a humanoid robot.
                  </p>
                  
                  <p>
                    And thanks to artificial intelligence (AI), there are human tasks that can be automated.
                  </p>
                  
                  <p>
                    It&apos;s no different when it comes to resume writing.
                  </p>
                  
                  <p>
                    An AI resume is used to secure an interview and speed up the job application process while increasing the quality of your writing.
                  </p>
                  
                  <p className="font-semibold text-gray-900">
                    Now, you have the opportunity to create your resume faster and better.
                  </p>

                  {/* Video Placeholder */}
                  <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center my-8">
                    <div className="text-center text-white">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                      <p className="text-sm">Rezum AI Editor Demo</p>
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                    What is an AI Resume?
                  </h3>
                  
                  <p>
                    An AI resume refers to creating a job application that gets past the resume scanners. But, it also refers to using artificial intelligence to help you create a tailored resume.
                  </p>
                  
                  <p>
                    In our guide on how to beat the company&apos;s AI, the steps involved can be completed automatically if you&apos;re using an <Link href="/sign-up" className="text-amber-600 hover:underline">AI resume builder</Link>. Meaning, it saves hours of your time with minimal effort.
                  </p>
                  
                  <p>
                    To get a better understanding of how this works, let&apos;s go through how AI is used in employment.
                  </p>

                  <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                    How Artificial Intelligence (AI) Is Used in Employment
                  </h3>
                  
                  <p>
                    The advancement of technology is causing innovation across multiple industries, including human resources (HR). For instance, blockchain technology is already being utilized to confirm the ownership of each job application.
                  </p>
                  
                  <p>
                    When it comes to resume writing, it&apos;s had an impact on both job seekers and recruiters.
                  </p>

                  <h4 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    AI for Employers
                  </h4>
                  
                  <p>
                    According to a report by Jobscan, it was found that nearly 100% of Fortune 500 companies are using AI to filter candidates.
                  </p>
                  
                  <p>
                    Instead of having to read through every application received, the entire process is automated. This means the hiring manager can immediately identify whether or not you match their job description. So, if you haven&apos;t included certain resume skills and keywords to show you meet the basic criteria, it&apos;s easy to remove you from the list.
                  </p>

                  <p>
                    In other words, the volume of applications is narrowed down without them needing to review each resume individually.
                  </p>

                  <h4 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    AI for Job Seekers
                  </h4>
                  
                  <p>
                    It&apos;s common to go through writer&apos;s block or analysis paralysis during the writing process. Plus, you&apos;ll often have to do a lot of back and forth research to match the company&apos;s job description.
                  </p>
                  
                  <p>
                    But this obstacle is removed when you&apos;re using AI to help you create a resume.
                  </p>
                  
                  <p>
                    Therefore, you save hours of time so that you can apply to more companies without minimizing the quality of your writing. To put it another way, think of AI as a shortcut. It&apos;s used to speed up the resume writing process and to help you get past the applicant tracking system (ATS).
                  </p>

                  <p>
                    As a result, you&apos;re more likely to land more interviews and reduce how long it takes to make a resume.
                  </p>

                  <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                    How to Create an AI Resume
                  </h3>
                  
                  <p>
                    There are 9 simple steps you can follow to create an AI resume. By the time you get to the end, you&apos;ll be fully equipped with the resources you need to create an effective CV with less time and effort.
                  </p>

                  <h4 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    1. Create a Free Account on Rezum
                  </h4>
                  
                  <p>
                    The first step is to <Link href="/sign-up" className="text-amber-600 hover:underline">create a free account on Rezum</Link>. You won&apos;t be charged anything and you&apos;ll instantly get access to the AI resume features.
                  </p>

                  <h4 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    2. Create a New Resume
                  </h4>
                  
                  <p>
                    Click on the &quot;create new resume&quot; button located on the left side of the screen.
                  </p>

                  <h4 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    3. Complete the Form
                  </h4>
                  
                  <p>
                    Next, you&apos;ll be given a short form to complete. Fill in the spaces and include the following:
                  </p>
                  
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Full name</li>
                    <li>Industry</li>
                    <li>Experience level</li>
                  </ul>

                  <h4 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    4. Select the &quot;Target Your Resume&quot; Option
                  </h4>
                  
                  <p>
                    Once you&apos;ve filled in the first few details, there&apos;s a button where you have the option to create a tailored CV.
                  </p>

                  <h4 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    5. Copy and Paste the Job Description
                  </h4>
                  
                  <p>
                    Now, you&apos;ll need to enter the following information:
                  </p>
                  
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Job title</li>
                    <li>Company name</li>
                    <li>Job description</li>
                  </ul>
                  
                  <p>
                    After entering the required details, press the &quot;save&quot; button to proceed.
                  </p>

                  <h4 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    6. Fill in the Spaces for Each Tab
                  </h4>
                  
                  <p>
                    Each tab relates to a resume section. In order to use the AI writer feature to draw inspiration, you&apos;ll need to enter some basic information about your professional background.
                  </p>

                  <h4 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    7. Press the &quot;Generate Bullet&quot; Button
                  </h4>
                  
                  <p>
                    After including your background details, press the &quot;generate bullet&quot; button for the AI resume writer to generate content.
                  </p>
                  
                  <p>
                    If you&apos;re happy with what&apos;s been written, click on &quot;apply suggestion&quot;.
                  </p>

                  <h4 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    8. Repeat the Process for Other Resume Sections
                  </h4>
                  
                  <p>
                    Using the different tabs above, you can follow the same process to complete each of your resume sections.
                  </p>

                  <h4 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    9. Finalize Your Resume
                  </h4>
                  
                  <p>
                    Once you reach the &quot;finish up&quot; tab, you&apos;ll notice a few different things:
                  </p>
                  
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>The Rezum score</li>
                    <li>An expert review option</li>
                    <li>A list of resume keywords</li>
                  </ul>
                  
                  <p>
                    Since the AI feature uses the details from the job description you provided, it generates a full list of keywords you need to get past the company&apos;s applicant tracking system.
                  </p>

                  <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                    5 Tips to Creating an AI Resume
                  </h3>
                  
                  <p>
                    Before we wrap things up, we&apos;ll give you a few more tips to take into account when writing an AI job application. As you&apos;re editing your resume, keep each of the following in mind.
                  </p>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-3">
                        Personalize the AI Content Generated
                      </h4>
                      <p>
                        You can use the AI resume feature to create your entire resume.
                      </p>
                      <p>
                        But, it&apos;s good practice to use this as inspiration and to personalize what&apos;s been written by aligning it with your professional background. Instead of making the AI writer the creator, think of it as a guiding principle for you to customize.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-3">
                        Shift Your Approach
                      </h4>
                      <p>
                        Because of the great resignation, many employers have shifted their approach when it comes to recruiting new candidates. For instance, introducing remote work opportunities and using technology to automate the process of finding qualified applicants.
                      </p>
                      <p>
                        Aside from taking into account the job satisfaction rate, it&apos;s also good to think about how to make yourself stand out.
                      </p>
                      <p>
                        For example:
                      </p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Do you have any soft skills or competencies that show why you&apos;re the better candidate?</li>
                        <li>Are there any relevant achievements you could include to prove your professional value?</li>
                      </ul>
                      <p>
                        Another option is to send a cover letter alongside your resume. In a similar fashion to how recruiters automate the hiring process, this can also be automated with the use of AI.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-3">
                        Tailor Your Resume
                      </h4>
                      <p>
                        Not all job descriptions are the same, even if you&apos;re applying for the same job title.
                      </p>
                      <p>
                        That means you should tailor your resume for the specific company you&apos;re applying to and ensure you&apos;ve mentioned their values. This sets the impression that one, you&apos;re qualified for the role and two, you&apos;re a good fit for the company culture.
                      </p>
                      <p>
                        Since each organization has its own mission and workflow, they&apos;ll want their employees to be on the same page.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-3">
                        List the Resume Keywords
                      </h4>
                      <p>
                        Resume keywords are essential for getting past the first obstacle of the recruiting process.
                      </p>
                      <p>
                        As mentioned, one way employers are using AI is to see if the applicant matches the job description. To find this, they&apos;ll look for resume keywords for the resume scanner to identify in your application.
                      </p>
                      <p>
                        If there&apos;s not a variety or the main ones aren&apos;t used, it&apos;s a sign to the employer that you&apos;re not the best fit for the role.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-3">
                        Resume Formatting
                      </h4>
                      <p>
                        Using Google Docs or Microsoft Word to create your resume is one option.
                      </p>
                      <p>
                        The only problem is that they&apos;re not optimized for resume writing as the default settings aren&apos;t focused on:
                      </p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Resume fonts</li>
                        <li>Margins</li>
                        <li>ATS resume format</li>
                      </ul>
                      <p>
                        For instance, with a resume builder, the format is optimized in a way for you to fit in as much information as possible without compromising quality. Or alternatively, to make use of white space strategically since you may have limited experience.
                      </p>
                      <p>
                        With all that being said, why not try getting started for free by using a <Link href="/sign-up" className="text-amber-600 hover:underline">proven template for your job position here?</Link>
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6 mt-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      The Revolution of Job Applications
                    </h3>
                    <p className="mb-4">
                      To sum up the role of AI resumes, it increases efficiency and the list of quality candidates to fill a vacant job position.
                    </p>
                    <p className="mb-4">
                      Creating an impactful resume requires commitment. It takes rounds of editing and revision. While the process might seem decent at first glance, it&apos;s actually a lot more draining than it seems.
                    </p>
                    <p>
                      But with an AI resume, it gives you a strong headstart.
                    </p>
                    <p>
                      All you have to do is personalize it by taking inspiration from what&apos;s been generated for you and ensuring you&apos;ve met the requirements of the job description. Which is easy when you have the success criteria in front of you.
                    </p>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="mb-4">
              <span className="text-amber-600 font-semibold text-sm uppercase tracking-wide">Support</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to know about using Rezum&apos;s Templates and Resume Builder.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: "Is it free?",
                answer: "Yes, Rezum offers free access to basic resume templates and features. Advanced AI-powered tools and premium templates require a Pro subscription."
              },
              {
                question: "What Are AI Credits?",
                answer: "Rezum AI Writer is powered by advanced language models from OpenAI. AI Credits represent the computational cost of generating personalized resume content, allowing us to provide high-quality AI assistance at scale."
              },
              {
                question: "How Does Our AI Work?",
                answer: "Rezum has partnered with OpenAI to leverage cutting-edge language models. Our AI has been trained on expert resume writing practices and thousands of successful resumes, enabling us to deliver professional-quality content tailored to your specific industry and experience level."
              },
              {
                question: "How Do I Get AI Credits?",
                answer: "You can get AI credits in two ways: Subscribe to Rezum Pro and receive 100,000 AI Credits monthly for unlimited content generation, or purchase additional AI Credits directly without a subscription for flexible usage."
              },
              {
                question: "Where Do I Use Rezum AI Writer?",
                answer: (
                  <>
                    Start by creating a free Rezum account at <Link href="/sign-up" className="text-amber-600 hover:underline">our platform</Link>. The Rezum AI Writer is seamlessly integrated into key resume sections including Experience, Projects, Skills, and Summary areas to help you craft compelling content.
                  </>
                )
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200">
                <button 
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  onClick={() => toggleFAQ(index)}
                >
                  <span className="text-base font-semibold text-gray-900">{faq.question}</span>
                  <div className={`transition-transform duration-200 ${openFAQ === index ? 'rotate-45' : ''}`}>
                    <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M25.3333 15.667V16.3336C25.3333 16.7018 25.0349 17.0003 24.6667 17.0003H17V24.667C17 25.0351 16.7015 25.3336 16.3333 25.3336H15.6667C15.2985 25.3336 15 25.0351 15 24.667V17.0003H7.3333C6.96511 17.0003 6.66663 16.7018 6.66663 16.3336V15.667C6.66663 15.2988 6.96511 15.0003 7.3333 15.0003H15V7.33365C15 6.96546 15.2985 6.66699 15.6667 6.66699H16.3333C16.7015 6.66699 17 6.96546 17 7.33365V15.0003H24.6667C25.0349 15.0003 25.3333 15.2988 25.3333 15.667Z" fill="currentColor"/>
                    </svg>
                  </div>
                </button>
                {openFAQ === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaSection 
        title="Ready to Create Your Professional <span class='bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent'>Resume?</span>"
        subtitle="Join thousands of job seekers who have landed their dream jobs with Rezum templates."
        ctaText="Get Started Free"
        ctaUrl="/sign-up"
      />

      <DashboardMockup />

      <Footer />
    </div>
  );
}