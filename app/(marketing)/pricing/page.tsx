import React from 'react';
import { CheckCircle, FileText, Zap, Users, Target, X, HelpCircle, Minus } from 'lucide-react';
import MainNavbar from '@/components/features/dashboard/main-navbar';
import CtaSection from '@/components/marketing/CtaSection';
import DashboardMockup from '@/components/marketing/DashboardMockup';
import Footer from '@/components/marketing/Footer';

export default function PricingPage() {
  const pricingPlans = [
    {
      name: 'Free',
      price: '$0',
      period: '/mo',
      description: 'Perfect for getting started with basic resume building',
      buttonText: 'Get Started',
      buttonStyle: 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50',
      popular: false,
      features: [
        { name: 'Real Usage', included: true, limit: '1 Resume Limit' },
        { name: 'Real Resume Builder', included: true, limit: 'Unlimited' },
        { name: 'Real Cover Letter Builder', included: true, limit: 'Unlimited' },
        { name: 'Real Resignation Letter Builder', included: true, limit: 'Unlimited' },
        { name: 'Real Score', included: false, limit: 'Limited' },
        { name: 'AI Keyword Targeting', included: false, limit: 'Limited' },
        { name: 'Real Time Content Analysis', included: false, limit: 'Limited' },
        { name: 'AI Resume Writer', included: false },
        { name: 'AI Resume Editor', included: false },
        { name: 'AI Resume Summary Writer', included: false },
        { name: 'AI Cover Letter Writer', included: false },
        { name: 'AI Resignation Letter Writer', included: false },
        { name: 'AI Interview', included: true, limit: '1 Interview Limit' },
        { name: 'Real Resume Review', included: true, limit: 'From $5' },
        { name: 'PDF File', included: true, limit: '3 Download Limit' },
        { name: 'Microsoft Word .DOCX File', included: true, limit: 'Unlimited' },
        { name: 'Google Drive Export', included: true, limit: 'Unlimited' },
        { name: 'Real Standard Format', included: false },
        { name: 'Real Compact Format', included: false },
        { name: 'Real Alternative Format', included: false },
        { name: 'Real Bold Format', included: false },
        { name: 'Real Modern Format', included: false }
      ]
    },
    {
      name: 'Lifetime',
      price: '$149',
      period: '',
      description: 'One-time payment for lifetime access to all features',
      buttonText: 'Get Started',
      buttonStyle: 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50',
      popular: false,
      features: [
        { name: 'Real Usage', included: true, limit: 'Unlimited' },
        { name: 'Real Resume Builder', included: true, limit: 'Unlimited' },
        { name: 'Real Cover Letter Builder', included: true, limit: 'Unlimited' },
        { name: 'Real Resignation Letter Builder', included: true, limit: 'Unlimited' },
        { name: 'Real Score', included: true, limit: 'Full' },
        { name: 'AI Keyword Targeting', included: true, limit: 'Full' },
        { name: 'Real Time Content Analysis', included: true, limit: 'Full' },
        { name: 'AI Resume Writer', included: true },
        { name: 'AI Resume Editor', included: true },
        { name: 'AI Resume Summary Writer', included: true },
        { name: 'AI Cover Letter Writer', included: true },
        { name: 'AI Resignation Letter Writer', included: true },
        { name: 'AI Interview', included: true, limit: 'Unlimited' },
        { name: 'Real Resume Review', included: true, limit: 'From $5' },
        { name: 'PDF File', included: true, limit: 'Unlimited' },
        { name: 'Microsoft Word .DOCX File', included: true, limit: 'Unlimited' },
        { name: 'Google Drive Export', included: true, limit: 'Unlimited' },
        { name: 'Real Standard Format', included: true },
        { name: 'Real Compact Format', included: true },
        { name: 'Real Alternative Format', included: true },
        { name: 'Real Bold Format', included: true },
        { name: 'Real Modern Format', included: true }
      ]
    },
    {
      name: 'Pro',
      price: '$29',
      period: '/mo',
      description: 'Everything you need for professional job applications',
      buttonText: 'Get Started',
      buttonStyle: 'bg-blue-600 text-white hover:bg-blue-700',
      popular: true,
      features: [
        { name: 'Real Usage', included: true, limit: 'Unlimited' },
        { name: 'Real Resume Builder', included: true, limit: 'Unlimited' },
        { name: 'Real Cover Letter Builder', included: true, limit: 'Unlimited' },
        { name: 'Real Resignation Letter Builder', included: true, limit: 'Unlimited' },
        { name: 'Real Score', included: true, limit: 'Full' },
        { name: 'AI Keyword Targeting', included: true, limit: 'Full' },
        { name: 'Real Time Content Analysis', included: true, limit: 'Full' },
        { name: 'AI Resume Writer', included: true },
        { name: 'AI Resume Editor', included: true },
        { name: 'AI Resume Summary Writer', included: true },
        { name: 'AI Cover Letter Writer', included: true },
        { name: 'AI Resignation Letter Writer', included: true },
        { name: 'AI Interview', included: true, limit: 'Unlimited' },
        { name: 'Real Resume Review', included: true, limit: '1 Free per month' },
        { name: 'PDF File', included: true, limit: 'Unlimited' },
        { name: 'Microsoft Word .DOCX File', included: true, limit: 'Unlimited' },
        { name: 'Google Drive Export', included: true, limit: 'Unlimited' },
        { name: 'Real Standard Format', included: true },
        { name: 'Real Compact Format', included: true },
        { name: 'Real Alternative Format', included: true },
        { name: 'Real Bold Format', included: true },
        { name: 'Real Modern Format', included: true }
      ]
    }
  ];

  const features = [
    {
      icon: FileText,
      title: 'Complete Suite',
      description: 'Resume builder, cover letters, and resignation letters in one platform'
    },
    {
      icon: Zap,
      title: 'AI-Powered',
      description: 'Advanced AI tools to write, edit, and optimize your documents'
    },
    {
      icon: Users,
      title: 'Expert Reviews',
      description: 'Get professional feedback from hiring managers and recruiters'
    },
    {
      icon: Target,
      title: 'ATS Optimized',
      description: 'All templates and content optimized for Applicant Tracking Systems'
    }
  ];

  const faqs = [
    {
      question: 'What are the main differences between Kolab\'s Free, Pro, and Lifetime plans?',
      answer: 'Free: 1 resume, limited AI tools, unlimited cover/resignation letters, 1 PDF download. Pro: Unlimited resumes, AI-powered optimization, featuring free resume review, 1 lifetime ($149 one-time). All Pro features except monthly review, or upgrade to Pro for additional features.'
    },
    {
      question: 'What is Kolab Lifetime, and is it worth it?',
      answer: 'Lifetime gives you unlimited access to premium features without recurring fees, but AI tools like writers and interviews for 1 flat purchase. Also includes advanced integration with our massive job boards and salary info database.'
    },
    {
      question: 'Is Kolab Lifetime the same as Kolab Pro?',
      answer: 'Similar, but Lifetime includes all available resume building/downloads. Otherwise, it includes 1 free monthly expert review letters from AI. Lifetime changes from ~$8 per month. Both have all key review guarantee.'
    },
    {
      question: 'What features are included in the Free plan?',
      answer: 'Free includes 1 resume limit, basic resume builder, unlimited cover letters, AI resignation writer, limited AI optimization without ATS/Google Drive exports, 1 PDF download, 1 interview, and basic templates.'
    },
    {
      question: 'What is the Enterprise plan, and how does it differ?',
      answer: 'Enterprise with teams with custom integrations, collaboration, bulk processing, and dedicated support. Includes all Pro features plus advanced contact for Enterprise. Multiple user bulk discounts.'
    },
    {
      question: 'What is your refund policy?',
      answer: '100% refund promise—no questions asked on all paid plans. For Pro, refund request emails is unavailable. Exact requirements published on our dashboard.'
    },
    {
      question: 'How does billing work for Kolab plans?',
      answer: 'Free: No billing. Pro: $29/month (no credit card required anytime). Lifetime: $149 one-time. Share is no Middle Eastern access. Use billing for more details.'
    },
    {
      question: 'Can I switch or upgrade plans later?',
      answer: 'Yes! You can upgrade or downgrade at any time through the account billing. Premium credits apply for switching between immediate.'
    },
    {
      question: 'Are there any discounts or promotions available?',
      answer: 'We periodically offer special promotions and discounts. Check our website or subscribe to our newsletter for the latest offers.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <MainNavbar />

      {/* Hero & Pricing Cards Combined Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20 pt-32 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Content */}
          <div className="text-center mb-16">
            <div className="mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                Pricing Plans
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Choose Your Perfect
              <span className="text-blue-600 block">Career Plan</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              From free resume building to unlimited AI-powered career tools.
              Find the plan that fits your job search needs.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid lg:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`relative bg-white rounded-xl border-2 p-8 ${plan.popular ? 'border-blue-500 shadow-xl' : 'border-gray-200'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  <button className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${plan.buttonStyle}`}>
                    {plan.buttonText}
                  </button>
                </div>

                <div className="space-y-4">
                  {plan.features.slice(0, 8).map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      {feature.included ? (
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <span className={`text-sm ${feature.included ? 'text-gray-900' : 'text-gray-500'}`}>
                          {feature.name}
                        </span>
                        {feature.limit && (
                          <span className="text-xs text-gray-500 ml-2">({feature.limit})</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Feature Comparison Table */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Detailed Feature Comparison
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See exactly what&apos;s included in each plan
            </p>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
              {/* Table Header */}
              <div className="grid grid-cols-4 bg-gray-50 rounded-t-xl">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-700">Features</h3>
                </div>
                <div className="p-6 text-center border-l border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900">Free</h3>
                  <div className="text-3xl font-bold text-gray-900 mt-2">$0<span className="text-base font-normal text-gray-600">/mo</span></div>
                  <button className="mt-4 px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                    Get Started
                  </button>
                </div>
                <div className="p-6 text-center border-l border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900">Lifetime</h3>
                  <div className="text-3xl font-bold text-gray-900 mt-2">$149</div>
                  <button className="mt-4 px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                    Get Started
                  </button>
                </div>
                <div className="p-6 text-center border-l border-gray-200 bg-amber-50 rounded-tr-xl">
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-500 text-white mb-2">
                    Most Popular
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Pro</h3>
                  <div className="text-3xl font-bold text-gray-900 mt-2">$29<span className="text-base font-normal text-gray-600">/mo</span></div>
                  <button className="mt-4 px-6 py-2 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition-colors">
                    Get Started
                  </button>
                </div>
              </div>

              {/* Kolab Usage Section */}
              <div className="border-t border-gray-200">
                <div className="grid grid-cols-4">
                  <div className="p-4 bg-blue-50">
                    <h4 className="font-semibold text-blue-700">Kolab Usage</h4>
                  </div>
                  <div className="p-4 border-l border-gray-200" />
                  <div className="p-4 border-l border-gray-200" />
                  <div className="p-4 border-l border-gray-200 bg-blue-50/50" />
                </div>
              </div>

              {/* Resume Builder Row */}
              <div className="grid grid-cols-4 border-t border-gray-200">
                <div className="p-4 flex items-center gap-2">
                  <span className="font-medium text-gray-900">Kolab Resume Builder</span>
                </div>
                <div className="p-4 text-center border-l border-gray-200">
                  <span className="text-gray-600">1 Resume Limit</span>
                </div>
                <div className="p-4 text-center border-l border-gray-200">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-gray-900">Unlimited</span>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                </div>
                <div className="p-4 text-center border-l border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-gray-900">Unlimited</span>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                </div>
              </div>

              {/* AI Features Section */}
              <div className="border-t border-gray-200">
                <div className="grid grid-cols-4">
                  <div className="p-4 bg-green-50">
                    <h4 className="font-semibold text-green-700">AI Features</h4>
                  </div>
                  <div className="p-4 border-l border-gray-200" />
                  <div className="p-4 border-l border-gray-200" />
                  <div className="p-4 border-l border-gray-200 bg-green-50/50" />
                </div>
              </div>


              {/* AI Resume Writer Row */}
              <div className="grid grid-cols-4 border-t border-gray-200 bg-gray-50">
                <div className="p-4 flex items-center gap-2">
                  <span className="font-medium text-gray-900">AI Resume Writer</span>
                  <div className="group relative">
                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      Let AI perfectly write your bullet points, trained on best practices.
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
                <div className="p-4 text-center border-l border-gray-200">
                  <Minus className="w-5 h-5 text-gray-400 mx-auto" />
                </div>
                <div className="p-4 text-center border-l border-gray-200">
                  <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                </div>
                <div className="p-4 text-center border-l border-gray-200">
                  <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                </div>
              </div>

              {/* Cover Letter Builder Row */}
              <div className="grid grid-cols-4 border-t border-gray-200">
                <div className="p-4 flex items-center gap-2">
                  <span className="font-medium text-gray-900">Cover Letter Builder</span>
                </div>
                <div className="p-4 text-center border-l border-gray-200">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-gray-900">Unlimited</span>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                </div>
                <div className="p-4 text-center border-l border-gray-200">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-gray-900">Unlimited</span>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                </div>
                <div className="p-4 text-center border-l border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-gray-900">Unlimited</span>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                </div>
              </div>

              {/* AI Keyword Targeting Row */}
              <div className="grid grid-cols-4 border-t border-gray-200 bg-gray-50">
                <div className="p-4 flex items-center gap-2">
                  <span className="font-medium text-gray-900">AI Keyword Targeting</span>
                  <div className="group relative">
                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      Automatically optimize your resume with job-specific keywords for ATS systems.
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
                <div className="p-4 text-center border-l border-gray-200">
                  <span className="text-gray-600">Limited</span>
                </div>
                <div className="p-4 text-center border-l border-gray-200">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-gray-900">Full</span>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                </div>
                <div className="p-4 text-center border-l border-gray-200">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-gray-900">Full</span>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                </div>
              </div>

              {/* Real Time Content Analysis Row */}
              <div className="grid grid-cols-4 border-t border-gray-200">
                <div className="p-4 flex items-center gap-2">
                  <span className="font-medium text-gray-900">Real Time Content Analysis</span>
                  <div className="group relative">
                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      Get instant feedback on grammar, tone, and content quality as you type.
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
                <div className="p-4 text-center border-l border-gray-200">
                  <span className="text-gray-600">Limited</span>
                </div>
                <div className="p-4 text-center border-l border-gray-200">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-gray-900">Full</span>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                </div>
                <div className="p-4 text-center border-l border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-gray-900">Full</span>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                </div>
              </div>

              {/* Expert Resume Review Row */}
              <div className="grid grid-cols-4 border-t border-gray-200 bg-gray-50">
                <div className="p-4 flex items-center gap-2">
                  <span className="font-medium text-gray-900">Expert Resume Review</span>
                </div>
                <div className="p-4 text-center border-l border-gray-200">
                  <span className="text-gray-600">From $5</span>
                </div>
                <div className="p-4 text-center border-l border-gray-200">
                  <span className="text-gray-600">From $5</span>
                </div>
                <div className="p-4 text-center border-l border-gray-200">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-gray-900">1 Free per month</span>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                </div>
              </div>

              {/* ATS Score Row */}
              <div className="grid grid-cols-4 border-t border-gray-200">
                <div className="p-4 flex items-center gap-2">
                  <span className="font-medium text-gray-900">ATS Score</span>
                  <div className="group relative">
                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      Kolab evaluates the strength of your resume with 23 key metrics.
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
                <div className="p-4 text-center border-l border-gray-200">
                  <span className="text-gray-600">Limited</span>
                </div>
                <div className="p-4 text-center border-l border-gray-200">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-gray-900">Full</span>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                </div>
                <div className="p-4 text-center border-l border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-gray-900">Full</span>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                </div>
              </div>

              {/* Downloads & Export Section */}
              <div className="border-t border-gray-200">
                <div className="grid grid-cols-4">
                  <div className="p-4 bg-purple-50">
                    <h4 className="font-semibold text-purple-700">Downloads & Export</h4>
                  </div>
                  <div className="p-4 border-l border-gray-200" />
                  <div className="p-4 border-l border-gray-200" />
                  <div className="p-4 border-l border-gray-200 bg-purple-50/50" />
                </div>
              </div>

              {/* PDF Downloads Row */}
              <div className="grid grid-cols-4 border-t border-gray-200 bg-gray-50">
                <div className="p-4 flex items-center gap-2">
                  <span className="font-medium text-gray-900">PDF Downloads</span>
                </div>
                <div className="p-4 text-center border-l border-gray-200">
                  <span className="text-gray-600">3 Download Limit</span>
                </div>
                <div className="p-4 text-center border-l border-gray-200">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-gray-900">Unlimited</span>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                </div>
                <div className="p-4 text-center border-l border-gray-200">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-gray-900">Unlimited</span>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                </div>
              </div>

              {/* Microsoft Word Export Row */}
              <div className="grid grid-cols-4 border-t border-gray-200">
                <div className="p-4 flex items-center gap-2">
                  <span className="font-medium text-gray-900">Microsoft Word .DOCX Export</span>
                </div>
                <div className="p-4 text-center border-l border-gray-200">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-gray-900">Unlimited</span>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                </div>
                <div className="p-4 text-center border-l border-gray-200">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-gray-900">Unlimited</span>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                </div>
                <div className="p-4 text-center border-l border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-gray-900">Unlimited</span>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                </div>
              </div>

              {/* Support & Interview Section */}
              <div className="border-t border-gray-200">
                <div className="grid grid-cols-4">
                  <div className="p-4 bg-orange-50">
                    <h4 className="font-semibold text-orange-700">Support & Interview</h4>
                  </div>
                  <div className="p-4 border-l border-gray-200" />
                  <div className="p-4 border-l border-gray-200" />
                  <div className="p-4 border-l border-gray-200 bg-orange-50/50" />
                </div>
              </div>

              {/* AI Interview Row */}
              <div className="grid grid-cols-4 border-t border-gray-200">
                <div className="p-4 flex items-center gap-2">
                  <span className="font-medium text-gray-900">AI Interview Practice</span>
                </div>
                <div className="p-4 text-center border-l border-gray-200">
                  <span className="text-gray-600">1 Interview Limit</span>
                </div>
                <div className="p-4 text-center border-l border-gray-200">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-gray-900">Unlimited</span>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                </div>
                <div className="p-4 text-center border-l border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-gray-900">Unlimited</span>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                </div>
              </div>

              {/* Templates Section */}
              <div className="border-t border-gray-200">
                <div className="grid grid-cols-4">
                  <div className="p-4 bg-indigo-50">
                    <h4 className="font-semibold text-indigo-700">Resume Templates</h4>
                  </div>
                  <div className="p-4 border-l border-gray-200" />
                  <div className="p-4 border-l border-gray-200" />
                  <div className="p-4 border-l border-gray-200 bg-indigo-50/50" />
                </div>
              </div>

              {/* Standard Template Row */}
              <div className="grid grid-cols-4 border-t border-gray-200">
                <div className="p-4 flex items-center gap-2">
                  <span className="font-medium text-gray-900">Standard Resume Template</span>
                </div>
                <div className="p-4 text-center border-l border-gray-200">
                  <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                </div>
                <div className="p-4 text-center border-l border-gray-200">
                  <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                </div>
                <div className="p-4 text-center border-l border-gray-200 bg-gray-50">
                  <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                </div>
              </div>

              {/* Premium Templates Row */}
              <div className="grid grid-cols-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                <div className="p-4 flex items-center gap-2">
                  <span className="font-medium text-gray-900">Premium Resume Templates</span>
                </div>
                <div className="p-4 text-center border-l border-gray-200">
                  <Minus className="w-5 h-5 text-gray-400 mx-auto" />
                </div>
                <div className="p-4 text-center border-l border-gray-200">
                  <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                </div>
                <div className="p-4 text-center border-l border-gray-200 rounded-br-xl">
                  <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile View */}
          <div className="lg:hidden">
            <p className="text-center text-gray-600 mb-8">Please view on desktop for full feature comparison</p>
            <div className="space-y-4">
              {['Free', 'Lifetime', 'Pro'].map((plan, index) => (
                <div key={index} className="bg-white rounded-lg border-2 border-gray-200 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan}</h3>
                  <p className="text-gray-600">View on desktop to see all features</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions (FAQs)
            </h2>
            <p className="text-xl text-gray-600">
              Get answers to common questions about our pricing and features
            </p>
          </div>

          <div className="space-y-8">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CtaSection />

      {/* Dashboard Mockup */}
      <DashboardMockup />

      {/* Footer */}
      <Footer />
    </div>
  );
}