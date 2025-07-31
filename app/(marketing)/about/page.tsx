import React from 'react';
import MainNavbar from '@/components/features/dashboard/main-navbar';
import { Code, Brain, Target, Zap } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white text-slate-600 py-12 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-8">
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900">AI Resume</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/ai-resume-builder" className="hover:text-slate-900 transition-colors">AI Resume Builder</a></li>
              <li><a href="/ai-resume-summary-generator" className="hover:text-slate-900 transition-colors">Resume Summary Generator</a></li>
              <li><a href="/keyword-scanner" className="hover:text-slate-900 transition-colors">AI Keyword Scanner</a></li>
              <li><a href="/resume-checker" className="hover:text-slate-900 transition-colors">ATS Resume Checker</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900">Resume Guides</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="https://www.rezi.ai/posts/how-to-write-a-resume" className="hover:text-slate-900 transition-colors">How to Write a Resume</a></li>
              <li><a href="https://www.rezi.ai/posts/resume-format" className="hover:text-slate-900 transition-colors">Guide to Resume Formatting</a></li>
              <li><a href="https://www.rezi.ai/posts/resume-summary-examples" className="hover:text-slate-900 transition-colors">Guide to Resume Summary</a></li>
              <li><a href="https://www.rezi.ai/posts/ats-resume-keywords" className="hover:text-slate-900 transition-colors">Guide to Resume Keywords</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900">Examples & Templates</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/resume-templates" className="hover:text-slate-900 transition-colors">Resume Formats/Templates</a></li>
              <li><a href="/resume-templates/simple-resume-templates" className="hover:text-slate-900 transition-colors">Standard Resume Template</a></li>
              <li><a href="/resume-templates/compact-resume-templates" className="hover:text-slate-900 transition-colors">Compact Resume Templates</a></li>
              <li><a href="/resume-examples" className="hover:text-slate-900 transition-colors">Resume Examples</a></li>
              <li><a href="/cover-letter-templates" className="hover:text-slate-900 transition-colors">Cover Letter Examples</a></li>
              <li><a href="/resignation-letter-templates" className="hover:text-slate-900 transition-colors">Resignation Letter Examples</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900">AI Career Tools</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/ai-cover-letter-builder" className="hover:text-slate-900 transition-colors">Cover Letter Writer</a></li>
              <li><a href="/ai-interview" className="hover:text-slate-900 transition-colors">Interactive Interview Practice</a></li>
              <li><a href="/ai-resignation-letter-builder" className="hover:text-slate-900 transition-colors">Resignation Letter Writer</a></li>
              <li><a href="/job-search" className="hover:text-slate-900 transition-colors">Job Search</a></li>
              <li><a href="https://app.rezi.ai/signup" className="hover:text-slate-900 transition-colors">Human Resume Review</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/pricing" className="hover:text-slate-900 transition-colors">Pricing</a></li>
              <li><a href="/enterprise" className="hover:text-slate-900 transition-colors">Rezum Enterprise</a></li>
              <li><a href="/linkedin-resume-builder" className="hover:text-slate-900 transition-colors">Linkedin Extension</a></li>
              <li><a href="/rezi-reviews" className="hover:text-slate-900 transition-colors">User Reviews</a></li>
              <li><a href="/rezi-docs" className="hover:text-slate-900 transition-colors">User Guides</a></li>
              <li><a href="/blog" className="hover:text-slate-900 transition-colors">Career Blog</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/about" className="hover:text-slate-900 transition-colors">About Us</a></li>
              <li><a href="/authors" className="hover:text-slate-900 transition-colors">Authors</a></li>
              <li><a href="/editorial-process" className="hover:text-slate-900 transition-colors">Editorial Process</a></li>
              <li><a id="book_demo" href="#" className="hover:text-slate-900 transition-colors">Contact Support</a></li>
              <li><a href="/contact-sales" className="hover:text-slate-900 transition-colors">Contact Sales</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-4">
            <a href="/" aria-current="page">
              
            </a>
            <div className="text-sm text-slate-500">
              Join over 3,365,312 job seekers helped since September 2019
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <div className="text-sm text-slate-500">© 2025 Rezum</div>
            <a href="/legal" className="text-sm hover:text-slate-900 transition-colors">Terms & Privacy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default function AboutPage() {
  const values = [
    {
      icon: Code,
      title: 'Technical Excellence',
      description: 'Every line of code is crafted with precision, ensuring optimal performance and user experience.'
    },
    {
      icon: Brain,
      title: 'AI Innovation',
      description: 'Leveraging cutting-edge AI to solve real career challenges and democratize professional success.'
    },
    {
      icon: Target,
      title: 'User-Centric Design',
      description: 'Every feature is designed with the job seeker in mind, prioritizing simplicity and effectiveness.'
    },
    {
      icon: Zap,
      title: 'Continuous Evolution',
      description: 'Constantly iterating and improving based on user feedback and emerging technologies.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <MainNavbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <div className="mb-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                Rezum AI started as a passion project in 2024
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8">
              I&apos;m solving the career
              <span className="text-blue-600 block">advancement problem.</span>
            </h1>
            <div className="space-y-6 text-lg text-gray-600 mb-8">
              <p>
                I set out to solve a problem I experienced firsthand and witnessed countless others struggle with. 
                I watched as talented professionals struggled to showcase their abilities effectively, while others 
                landed opportunities despite being less qualified. The difference? They knew how to present themselves 
                strategically.
              </p>
              <p>
                As a developer and entrepreneur, I realized that most job seekers aren&apos;t equipped with the right tools 
                to create compelling, ATS-optimized resumes. The traditional approach was broken—generic templates, 
                outdated advice, and no understanding of how modern hiring systems actually work.
              </p>
            </div>
            
            {/* Location Info */}
            <div className="flex items-center gap-4 mb-8">
              <div>
                <div className="text-sm font-semibold text-blue-600">Location</div>
                <div className="text-gray-900 font-medium">Working remotely, building globally</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                My Journey
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  My background spans software development, AI research, and entrepreneurship. After years of 
                  building products and hiring talent, I gained unique insights into what actually gets 
                  attention in the hiring process.
                </p>
                <p>
                  I started studying Applicant Tracking Systems (ATS) in depth—not just how they work, but 
                  how they evaluate resumes, what triggers their algorithms, and what causes them to filter 
                  out qualified candidates.
                </p>
                <p>
                  This research became the foundation for Rezum AI. I didn&apos;t just want to create another 
                  resume builder—I wanted to build an intelligent system that understands modern hiring 
                  practices and gives every job seeker a fighting chance.
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">The Problem I&apos;m Solving</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>90% of large companies use ATS systems, but most job seekers don&apos;t understand how they work</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Generic resume templates fail to highlight individual strengths and achievements</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Career advice is often outdated and doesn&apos;t reflect current hiring practices</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Job seekers lack access to personalized, intelligent career guidance</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Drives Me
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              As a solo founder and developer, every decision I make is guided by these core principles 
              that shape how I build and evolve Rezum AI.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <IconComponent className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              My Mission
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              To democratize career success through intelligent technology that understands both human 
              potential and modern hiring systems.
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-8 md:p-12">
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold">The Vision</h3>
              <p className="text-lg text-blue-100">
                I envision a world where career advancement is based on merit and potential, not on 
                who has access to the best career advisors or most expensive services. Every professional 
                deserves intelligent, personalized guidance that helps them present their best self to 
                the world.
              </p>
              <p className="text-lg text-blue-100">
                Through Rezum AI, I&apos;m building that future—one where artificial intelligence serves as 
                a career coach, resume optimizer, and strategic advisor for everyone, regardless of their 
                background or budget.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Personal Touch Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Building in the Open
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Why I Work Alone</h3>
              <p className="text-gray-600 mb-4">
                As a solo founder, I can move quickly, make decisions based purely on user benefit, 
                and maintain complete creative control over the product vision.
              </p>
              <p className="text-gray-600">
                This allows me to pivot rapidly based on user feedback, implement cutting-edge AI 
                technologies without committee approval, and ensure every feature serves a real purpose.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Continuous Learning</h3>
              <p className="text-gray-600 mb-4">
                I&apos;m constantly studying hiring trends, AI advancements, and user behavior to ensure 
                Rezum AI stays at the forefront of career technology.
              </p>
              <p className="text-gray-600">
                Every user interaction, every piece of feedback, and every success story teaches me 
                something new about how to better serve job seekers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Join Me on This Journey
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Every user who finds success with Rezum AI validates this mission. Your career advancement 
            is not just a business metric—it&apos;s the reason I built this platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors">
              Try Rezum AI Free
            </button>
            <button className="bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-800 transition-colors border border-blue-500">
              Share Your Story
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}