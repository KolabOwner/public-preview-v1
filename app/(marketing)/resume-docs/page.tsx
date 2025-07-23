import React from 'react';
import Link from 'next/link';
import { Book, Users, Settings, FileText, CreditCard, Shield, Star, Award, Target, Zap } from 'lucide-react';
import MainNavbar from '@/components/features/dashboard/main-navbar';

export default function ResumeDocsPage() {
  const featuredGuides = [
    {
      title: 'Kolab Score',
      description: 'Your Kolab Score holds valuable insights into the quality of your resume.',
      image: 'score',
      href: '/resume-docs/kolab-score-explained',
      color: 'from-blue-50 to-blue-100'
    },
    {
      title: 'AI Credits',
      description: 'AI Credits are consumed when you generate results with AI Writer features.',
      image: 'credits',
      href: '/resume-docs/ai-credits-explained',
      color: 'from-purple-50 to-purple-100'
    },
    {
      title: 'Subscription Plans',
      description: 'For more functionality, Kolab does have additional subscriptions available.',
      image: 'plans',
      href: '/resume-docs/subscription-plans-explained',
      color: 'from-green-50 to-green-100'
    }
  ];

  const guideCategories = [
    {
      title: 'Plans & Billing',
      description: 'Get help upgrading or cancelling a Kolab plan and fixing billing errors.',
      icon: CreditCard,
      guides: [
        { title: 'Subscription Plans', href: '/resume-docs/subscription-plans-explained' },
        { title: 'Cancel Subscription', href: '/resume-docs/how-to-cancel-subscription' },
        { title: 'AI Credits', href: '/resume-docs/ai-credits-explained' }
      ]
    },
    {
      title: 'Cover Letter',
      description: 'Learn the ins and outs of crafting the perfect cover letter.',
      icon: FileText,
      guides: [
        { title: 'AI Cover Letter Generator', href: '/resume-docs/ai-cover-letter-generator-explained' }
      ]
    },
    {
      title: 'Resignation Letter',
      description: 'Quitting is never easy — learn how to write a delicate resignation letter.',
      icon: Shield,
      guides: [
        { title: 'Create Resignation Letter', href: '/resume-docs/ai-resignation-letter-explained' }
      ]
    },
    {
      title: 'Features',
      description: 'Discover Kolab\'s supercharged features that harness the power of AI.',
      icon: Star,
      guides: [
        { title: 'Resume Review', href: '/resume-docs/expert-review-explained' },
        { title: 'Import LinkedIn Profile', href: '/resume-docs/importing-linkedin-profile' },
        { title: 'Resume Examples', href: '/resume-docs/using-sample-resume' },
        { title: 'AI Keyword Targeting', href: '/resume-docs/ai-keyword-targeting-explained' },
        { title: 'AI Resume Summary Writer', href: '/resume-docs/ai-resume-summary-writer-explained' },
        { title: 'Blockchain Verification', href: '/resume-docs/blockchain-verification-explained' },
        { title: 'Real-Time Analysis', href: '/resume-docs/real-time-content-analysis-explained' },
        { title: 'Kolab Score', href: '/resume-docs/kolab-score-explained' },
        { title: 'Download', href: '/resume-docs/download-resume' },
        { title: 'AI Bullet Points', href: '/resume-docs/ai-bullet-points' }
      ]
    },
    {
      title: 'Resume',
      description: 'Learn how to take full advantage of Kolab when building your resume.',
      icon: Award,
      guides: [
        { title: 'Photo', href: '/resume-docs/how-to-add-resume-photo' },
        { title: 'Icons', href: '/resume-docs/how-to-adjust-resume-icons' },
        { title: 'Font Size', href: '/resume-docs/how-to-adjust-resume-font-size' },
        { title: 'Line Spacing', href: '/resume-docs/how-to-adjust-resume-line-spacing' },
        { title: 'Delete Resume', href: '/resume-docs/how-to-delete-resume' },
        { title: 'Duplicate Resume', href: '/resume-docs/how-to-duplicate-resume' },
        { title: 'Rename Sections', href: '/resume-docs/how-to-rename-resume-sections' },
        { title: 'Reorder Sections', href: '/resume-docs/how-to-reorder-resume-sections' },
        { title: 'Create Resume', href: '/resume-docs/create-resume' },
        { title: 'File Name', href: '/resume-docs/how-to-edit-resume-name' },
        { title: 'Resume Field & Domain', href: '/resume-docs/resume-field-and-domain' },
        { title: 'Experience Level', href: '/resume-docs/how-to-set-resume-experience-level' },
        { title: 'Contact', href: '/resume-docs/resume-contact-section-best-practices' },
        { title: 'Experience', href: '/resume-docs/resume-experience-section-best-practices' },
        { title: 'Project', href: '/resume-docs/resume-project-section-best-practices' },
        { title: 'Education', href: '/resume-docs/resume-education-section-best-practices' },
        { title: 'Certifications', href: '/resume-docs/resume-certification-section-best-practices' },
        { title: 'Coursework', href: '/resume-docs/resume-coursework-section-best-practices' },
        { title: 'Involvement & Volunteering', href: '/resume-docs/resume-involvement-section-best-practices' },
        { title: 'Skills', href: '/resume-docs/skills' },
        { title: 'Summary', href: '/resume-docs/resume-summary-best-practices' },
        { title: 'Finish Up', href: '/resume-docs/finish-up-tab' },
        { title: 'Templates', href: '/resume-docs/templates' }
      ]
    },
    {
      title: 'Account',
      description: 'Get help changing your password or email and creating your Kolab account.',
      icon: Settings,
      guides: [
        { title: 'Kolab Enterprise – User Guide', href: '/resume-docs/kolab-enterprise' },
        { title: 'Create Account', href: '/resume-docs/how-to-create-account' },
        { title: 'Language Settings', href: '/resume-docs/how-to-change-account-language' },
        { title: 'Change Password', href: '/resume-docs/how-to-change-password' },
        { title: 'Update Email', href: '/resume-docs/how-to-change-email' },
        { title: 'Delete Account', href: '/resume-docs/how-to-delete-account' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <MainNavbar />
      
      {/* Header/Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                User Documentation
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Kolab
              <span className="text-blue-600 block">User Guides</span>
            </h1>
            <div className="max-w-4xl mx-auto">
              <p className="text-xl text-gray-600 mb-8">
                Welcome to Kolab User Guides! Whether you're creating your first resume, optimizing your current one, 
                or exploring advanced AI features, we've got you covered. Our comprehensive guides will help you navigate 
                Kolab's tools effortlessly—from understanding your Kolab Score to maximizing your AI Credits. 
                Unlock the full potential of our platform and create professional, ATS-optimized resumes with ease. 
                Dive into the guides below to get started!
              </p>
            </div>

            {/* Trust indicators */}
            <div className="text-center">
              <p className="text-gray-500 mb-6">Comprehensive documentation for all Kolab features</p>
              <div className="flex justify-center items-center space-x-8 opacity-60">
                <div className="text-lg font-bold text-gray-400">50+ Guides</div>
                <div className="text-lg font-bold text-gray-400">Step-by-Step</div>
                <div className="text-lg font-bold text-gray-400">Always Updated</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Guides Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Start with The Most Popular Kolab Guides</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {featuredGuides.map((guide, index) => (
              <Link key={index} href={guide.href} className="group block">
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-blue-300 transition-all duration-300">
                  <div className={`h-48 bg-gradient-to-br ${guide.color} flex items-center justify-center`}>
                    <div className="text-center">
                      <div className="w-20 h-24 mx-auto mb-4 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center justify-center">
                        {guide.image === 'score' && <Target className="w-8 h-8 text-gray-400" />}
                        {guide.image === 'credits' && <Zap className="w-8 h-8 text-gray-400" />}
                        {guide.image === 'plans' && <Star className="w-8 h-8 text-gray-400" />}
                      </div>
                      <div className="text-sm text-gray-500">Guide</div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {guide.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {guide.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Guide Categories Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Some Additional Guides</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {guideCategories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <div key={index} className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                      <IconComponent className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">{category.title}</h3>
                  </div>
                  
                  <p className="text-gray-600 mb-6 text-sm">
                    {category.description}
                  </p>
                  
                  <div className="space-y-3">
                    {category.guides.map((guide, guideIndex) => (
                      <Link 
                        key={guideIndex} 
                        href={guide.href}
                        className="block text-blue-600 hover:text-blue-700 transition-colors text-sm font-medium"
                      >
                        {guide.title}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Search Help Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Book className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Can't Find What You're Looking For?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Our support team is here to help you make the most of Kolab AI's features.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Contact Support
              </Link>
              <Link href="/blog" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold border border-blue-600 hover:bg-blue-50 transition-colors">
                Visit Our Blog
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Build Your Professional Resume?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Put your knowledge to work and create a resume that gets results with Kolab AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/ai-resume-builder" className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
              Start Building Now
            </Link>
            <Link href="/resume-examples" className="bg-transparent text-white px-8 py-4 rounded-lg font-semibold text-lg border border-white hover:bg-white hover:text-blue-600 transition-colors">
              Browse Examples
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}