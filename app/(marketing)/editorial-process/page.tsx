import React from 'react';
import MainNavbar from '@/components/features/dashboard/main-navbar';
import { BookOpen, Users, Target, CheckCircle, Eye, FileText, RefreshCw } from 'lucide-react';

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

export default function EditorialProcessPage() {
  const processSteps = [
    {
      icon: BookOpen,
      title: 'Research',
      description: 'I identify relevant topics through industry analysis, user feedback, and market trends to ensure my content addresses real job seeker needs.'
    },
    {
      icon: FileText,
      title: 'Draft',
      description: 'I create comprehensive, actionable content that combines industry best practices with my direct experience and practical insights.'
    },
    {
      icon: Users,
      title: 'Review',
      description: 'I thoroughly review content for accuracy, relevance, and alignment with professional standards before publication.'
    },
    {
      icon: CheckCircle,
      title: 'Quality Assurance',
      description: 'I perform final quality checks to ensure coherence, proper formatting, and optimal user experience.'
    },
    {
      icon: Eye,
      title: 'Preview',
      description: 'I conduct complete assessment of content flow, visual presentation, and reader experience optimization.'
    },
    {
      icon: Target,
      title: 'Publication',
      description: 'I publish content with continuous monitoring for potential improvements and updates.'
    },
    {
      icon: RefreshCw,
      title: 'Updates',
      description: 'I regularly update content to reflect latest trends, address user feedback, and maintain accuracy.'
    }
  ];

  const principles = [
    {
      title: 'Evidence-Based Approach',
      description: 'Every piece of advice is backed by concrete data, research, and verifiable sources. We prioritize factual accuracy over speculation.'
    },
    {
      title: 'Practical Implementation',
      description: 'Our content focuses on actionable strategies that job seekers can immediately apply to their career advancement efforts.'
    },
    {
      title: 'Real-World Experience',
      description: 'Our insights come from genuine industry experience, including hiring perspectives and successful job search strategies.'
    },
    {
      title: 'Clear Communication',
      description: 'Complex career concepts are presented in straightforward, easy-to-understand language that respects your time.'
    },
    {
      title: 'Empathetic Guidance',
      description: 'We understand the challenges of job searching and provide supportive, honest guidance throughout your journey.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <MainNavbar />
      
      {/* Header Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                Editorial Standards
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              My Editorial
              <span className="text-blue-600 block">Process</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Discover how I maintain the highest standards of quality and accuracy 
              in my career guidance and AI-powered resume building platform.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* My Mission */}
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
              My Mission
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
              <p className="text-lg">
                I believe every professional deserves access to cutting-edge career advancement tools 
                and insights. My mission is to democratize career success through intelligent technology and 
                evidence-based guidance.
              </p>
              <p>
                As a solo founder, I&apos;m committed to providing unbiased, practical career resources 
                that help job seekers navigate today&apos;s competitive market. My AI-powered platform combines 
                advanced technology with my direct experience to deliver personalized career solutions.
              </p>
              <p>
                I don&apos;t just build tools—I create pathways to professional success. Every feature, every piece 
                of content, and every recommendation is designed to give you a competitive edge in your career journey.
              </p>
            </div>
          </div>

          {/* Editorial Principles */}
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
              My Editorial Principles
            </h2>
            <p className="text-lg text-gray-600 mb-8 text-center max-w-3xl mx-auto">
              Everything I create is built on these core values that ensure quality, accuracy, and genuine value for users.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8">
              {principles.map((principle, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{principle.title}</h3>
                  <p className="text-gray-600">{principle.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Publishing Process */}
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
              My Publishing Process
            </h2>
            <p className="text-lg text-gray-600 mb-12 text-center max-w-3xl mx-auto">
              Every piece of content and feature goes through my rigorous seven-step process to ensure 
              maximum value and accuracy.
            </p>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {processSteps.map((step, index) => {
                const IconComponent = step.icon;
                return (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* My Approach */}
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
              My Approach
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
              <p>
                As a solo founder, I operate with complete editorial freedom. I&apos;m not 
                influenced by corporate partnerships or advertising revenue—my sole focus is providing you 
                with the most effective career advancement tools and strategies.
              </p>
              <p>
                My content creation process begins with identifying genuine user needs through data analysis, 
                feedback collection, and market research. I don&apos;t guess what job seekers want—I listen, 
                analyze, and respond with precision.
              </p>
              <p>
                When developing AI features or writing guidance, I draw from my experience as both a developer 
                and someone who has navigated the hiring process. This dual perspective ensures my recommendations 
                reflect real-world hiring practices and technical realities.
              </p>
            </div>
          </div>

          {/* Quality Assurance */}
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
              My Quality Assurance
            </h2>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
              <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                <p className="font-medium">
                  My commitment to accuracy extends beyond initial publication. I maintain a continuous 
                  improvement cycle that includes:
                </p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>Regular content audits to ensure information remains current and relevant</li>
                  <li>User feedback integration to address real-world application challenges</li>
                  <li>Market trend analysis to anticipate evolving hiring practices</li>
                  <li>Performance monitoring to optimize user experience and outcomes</li>
                  <li>Personal testing of all features and recommendations before release</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Trust and Independence */}
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
              Independence & Trust
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
              <p>
                My independence is my strength. As a solo founder, I make decisions based 
                solely on user benefit and technological advancement. This freedom allows me to:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Provide honest, unbiased career advice without external influence</li>
                <li>Invest in cutting-edge AI technology that truly serves job seekers</li>
                <li>Maintain transparent pricing and service offerings</li>
                <li>Prioritize user privacy and data security above all else</li>
                <li>Continuously innovate without compromise</li>
              </ul>
              <p>
                I believe trust is earned through consistent delivery of value. Every interaction you have 
                with my platform is designed to move you closer to your career goals.
              </p>
            </div>
          </div>

          {/* Community and Feedback */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
              Community & Continuous Improvement
            </h2>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-8">
              <div className="text-center">
                <h3 className="text-2xl font-semibold mb-4">Your Voice Matters</h3>
                <p className="text-lg mb-6">
                  My editorial process is strengthened by your feedback. I actively listen to user 
                  experiences, analyze success stories, and incorporate insights into my continuous 
                  improvement cycle.
                </p>
                <p className="text-blue-100">
                  Whether you&apos;re sharing a success story, suggesting new features, or providing feedback 
                  on my content, your input directly influences how I serve the job seeker community.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}