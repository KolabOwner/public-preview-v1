'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, X, Zap } from 'lucide-react';

const MainNavbar = () => {
  const pathname = usePathname();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDropdownToggle = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const handleMouseEnter = (dropdown: string) => {
    setActiveDropdown(dropdown);
  };

  const handleMouseLeave = () => {
    setActiveDropdown(null);
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm' : 'bg-white'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur-md opacity-50" />
                <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
                  <Zap className="w-5 h-5 text-white" />
                </div>
              </div>
              <span className="text-2xl font-bold text-gray-900">Hireable<span className="bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">AI</span></span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {/* AI Resume Builder Direct Link */}
            <Link
              href="/ai-resume-builder"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/ai-resume-builder')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              AI Resume Builder
            </Link>

            {/* AI Tools Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => handleMouseEnter('ai-tools')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                onClick={() => handleDropdownToggle('ai-tools')}
              >
                AI Tools
                <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${
                  activeDropdown === 'ai-tools' ? 'rotate-180' : ''
                }`} />
              </button>

              {/* AI Tools Dropdown Content */}
              {activeDropdown === 'ai-tools' && (
                <div className="absolute top-full left-0 mt-1 w-[800px] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                  <div className="grid grid-cols-3 gap-6 p-6">
                    {/* Resume Tools Column */}
                    <div>
                      <h4 className="text-sm font-semibold text-blue-600 mb-4">Resume Tools</h4>
                      <div className="space-y-3">
                        <Link href="/ai-resume-builder" className="group flex items-start p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <img src="https://cdn.prod.website-files.com/62f0854c1cef28185535ab61/683d8af5719b24f69d1dfb56_ai%20resume%20builder.svg" alt="" className="w-8 h-8 mt-0.5 mr-3" />
                          <div>
                            <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">AI Resume Builder</div>
                            <div className="text-sm text-gray-600">Smart resume creation</div>
                          </div>
                        </Link>
                        
                        <Link href="/ai-resume-editor" className="group flex items-start p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <img src="https://cdn.prod.website-files.com/62f0854c1cef28185535ab61/683d8b51a7d418802f5eb0c0_Resume%20Checker.svg" alt="" className="w-8 h-8 mt-0.5 mr-3" />
                          <div>
                            <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Resume Checker</div>
                            <div className="text-sm text-gray-600">Get instant feedback</div>
                          </div>
                        </Link>
                        
                        <Link href="/keyword-scanner" className="group flex items-start p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <img src="https://cdn.prod.website-files.com/62f0854c1cef28185535ab61/683d8b7d9b729cdd058174b3_keyword%20scanner.svg" alt="" className="w-8 h-8 mt-0.5 mr-3" />
                          <div>
                            <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Resume Keyword Scanner</div>
                            <div className="text-sm text-gray-600">Target your application</div>
                          </div>
                        </Link>
                        
                        <Link href="/ai-resume-builder" className="group flex items-start p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <img src="https://cdn.prod.website-files.com/62f0854c1cef28185535ab61/683d8c1fc7e51ecb91f61102_Bullet%20Point%20Writer.svg" alt="" className="w-8 h-8 mt-0.5 mr-3" />
                          <div>
                            <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Resume Bullet Point Writer</div>
                            <div className="text-sm text-gray-600">Stronger resume content</div>
                          </div>
                        </Link>
                      </div>
                    </div>

                    {/* Other Tools Column */}
                    <div>
                      <h4 className="text-sm font-semibold text-blue-600 mb-4">Other Tools</h4>
                      <div className="space-y-3">
                        <Link href="/ai-cover-letter-builder" className="group flex items-start p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <img src="https://cdn.prod.website-files.com/62f0854c1cef28185535ab61/683d8d1cdbc8e982e51c979a_ai%20cover%20letter%20builder.svg" alt="" className="w-8 h-8 mt-0.5 mr-3" />
                          <div>
                            <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Cover Letter Generator</div>
                            <div className="text-sm text-gray-600">Personalized cover letters</div>
                          </div>
                        </Link>
                        
                        <Link href="/ai-resignation-letter-builder" className="group flex items-start p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <img src="https://cdn.prod.website-files.com/62f0854c1cef28185535ab61/683d8e6c60668fb29a22f776_resignation%20letter%20builder.svg" alt="" className="w-8 h-8 mt-0.5 mr-3" />
                          <div>
                            <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Resignation Letter Generator</div>
                            <div className="text-sm text-gray-600">Leave on good terms</div>
                          </div>
                        </Link>
                        
                        <Link href="/job-search" className="group flex items-start p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <img src="https://cdn.prod.website-files.com/62f0854c1cef28185535ab61/683d8f35ab5b0266deed888b_job%20search.svg" alt="" className="w-8 h-8 mt-0.5 mr-3" />
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Job Search</div>
                              <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">New!</span>
                            </div>
                            <div className="text-sm text-gray-600">Discover new opportunities</div>
                          </div>
                        </Link>
                        
                        <Link href="/dashboard" className="group flex items-start p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <img src="https://cdn.prod.website-files.com/62f0854c1cef28185535ab61/683d8f60719b24f69d216272_viewmore.svg" alt="" className="w-8 h-8 mt-0.5 mr-3" />
                          <div>
                            <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">View All Tools</div>
                            <div className="text-sm text-gray-600">Discover more tools</div>
                          </div>
                        </Link>
                      </div>
                    </div>

                    {/* User Guides Column */}
                    <div>
                      <h4 className="text-sm font-semibold text-blue-600 mb-4">User Guides</h4>
                      <div className="space-y-4">
                        <a href="https://www.resume.ai/resume-docs/ai-keyword-targeting-explained" className="block group">
                          <div className="aspect-video bg-gray-100 rounded-lg mb-2 overflow-hidden">
                            <img 
                              src="https://cdn.prod.website-files.com/62f0854c1cef28185535ab61/684d5d73e6b11bd987ec13e4_Screenshot%202025-06-14%20at%208.30.39%E2%80%AFPM.png" 
                              alt="" 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">How to Tailor a Resume to a Job Posting</div>
                          <div className="text-xs text-gray-600 mt-1">Tailor your resume by adding keywords from the job ad</div>
                        </a>
                        
                        <Link href="/resume-docs" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                          All user guides
                          <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Examples & Templates Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => handleMouseEnter('templates')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                onClick={() => handleDropdownToggle('templates')}
              >
                Examples & Templates
                <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${
                  activeDropdown === 'templates' ? 'rotate-180' : ''
                }`} />
              </button>

              {/* Templates Dropdown Content */}
              {activeDropdown === 'templates' && (
                <div className="absolute top-full left-0 mt-1 w-[600px] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                  <div className="grid grid-cols-2 gap-6 p-6">
                    {/* Resume Examples Column */}
                    <div>
                      <h4 className="text-sm font-semibold text-blue-600 mb-4">Resume Examples</h4>
                      <div className="space-y-3">
                        <Link href="/resume-templates" className="group flex items-start p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <img src="https://cdn.prod.website-files.com/62f0854c1cef28185535ab61/683d9bc8ef3c5f4eaed6985b_resume%20examples.svg" alt="" className="w-8 h-8 mt-0.5 mr-3" />
                          <div>
                            <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Resume Templates/Formats</div>
                            <div className="text-sm text-gray-600">Explore Hireable's loved resume formats</div>
                          </div>
                        </Link>
                        
                        <Link href="/resume-examples" className="group flex items-start p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <img src="https://cdn.prod.website-files.com/62f0854c1cef28185535ab61/683d9c846ad5e5aba5060413_Icons%2044.svg" alt="" className="w-8 h-8 mt-0.5 mr-3" />
                          <div>
                            <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Resume Examples</div>
                            <div className="text-sm text-gray-600">Get inspired by excellent resumes</div>
                          </div>
                        </Link>
                      </div>
                    </div>

                    {/* Other Examples Column */}
                    <div>
                      <h4 className="text-sm font-semibold text-blue-600 mb-4">Other Examples</h4>
                      <div className="space-y-3">
                        <Link href="/cover-letter-templates" className="group flex items-start p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <img src="https://cdn.prod.website-files.com/62f0854c1cef28185535ab61/683d9c919526e03458c673fa_cover%20letter.svg" alt="" className="w-8 h-8 mt-0.5 mr-3" />
                          <div>
                            <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Cover Letter Examples</div>
                            <div className="text-sm text-gray-600">Effective cover letter samples</div>
                          </div>
                        </Link>
                        
                        <Link href="/resignation-letter-templates" className="group flex items-start p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <img src="https://cdn.prod.website-files.com/62f0854c1cef28185535ab61/683d9c9e52d4f5e34d65fb8e_reignstaiotn%20.svg" alt="" className="w-8 h-8 mt-0.5 mr-3" />
                          <div>
                            <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Resignation Letter Examples</div>
                            <div className="text-sm text-gray-600">Effective resignation letter samples</div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bottom section with featured content */}
                  <div className="bg-gray-50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <img 
                          src="https://cdn.prod.website-files.com/62f0854c1cef28185535ab61/684d646e9a0f5b6bc56d52d6_660fb808d7ebf9db26478630_ResumeFormat.webp" 
                          alt="" 
                          className="w-12 h-8 object-cover rounded mr-3"
                        />
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">The Best Resume Format</div>
                          <div className="text-xs text-gray-600">How to format a resume the right way!</div>
                        </div>
                      </div>
                      <Link href="/blog" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                        All blog posts →
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pricing Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => handleMouseEnter('pricing')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                onClick={() => handleDropdownToggle('pricing')}
              >
                Pricing
                <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${
                  activeDropdown === 'pricing' ? 'rotate-180' : ''
                }`} />
              </button>

              {/* Pricing Dropdown Content */}
              {activeDropdown === 'pricing' && (
                <div className="absolute top-full left-0 mt-1 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                  <div className="p-4 space-y-3">
                    <Link href="/pricing" className="group flex items-start p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div>
                        <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Job Seekers</div>
                        <div className="text-sm text-gray-600">Free to get started, no card required.</div>
                      </div>
                    </Link>
                    
                    <Link href="/enterprise" className="group flex items-start p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">For Organizations & Consultants</div>
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">New</span>
                        </div>
                        <div className="text-sm text-gray-600">Help your job seekers with Hireable Enterprise</div>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right side buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            <Link 
              href="/auth/sign-in" 
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              Log in
            </Link>
            <Link 
              href="/ai-resume-builder" 
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Free Resume
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link href="/ai-resume-builder" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                AI Resume Builder
              </Link>
              <Link href="/resume-templates" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                Templates
              </Link>
              <Link href="/pricing" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                Pricing
              </Link>
              <Link href="/auth/sign-in" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                Log in
              </Link>
              <Link href="/ai-resume-builder" className="block px-3 py-2 bg-blue-600 text-white rounded-md text-base font-medium text-center">
                Create Free Resume
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default MainNavbar;