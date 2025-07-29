'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ChevronDown, 
  Menu, 
  X, 
  Zap, 
  CheckCircle, 
  Target, 
  FileText, 
  Mail, 
  Search, 
  Grid3X3,
  ArrowRight,
  Sparkles,
  Users,
  BookOpen,
  Star,
  TrendingUp
} from 'lucide-react';
import ResumeTargetingFlowchart from "@/components/shared/resume-targeting-flowchart";

const MainNavbar = () => {
  const pathname = usePathname();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown) {
        const dropdownEl = dropdownRefs.current[activeDropdown];
        if (dropdownEl && !dropdownEl.contains(event.target as Node)) {
          setActiveDropdown(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown]);

  const handleDropdownToggle = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <nav className="relative bg-white z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo Section */}
            <Link href="/" className="flex items-center group">
              <span className="text-3xl font-bold text-gray-900 tracking-tight">Kolab</span>
            </Link>

            {/* Desktop Navigation - Completely New Layout */}
            <div className="hidden lg:flex items-center">
              {/* Navigation Pills Container */}
              <div className="flex items-center bg-gray-50 backdrop-blur-sm rounded-lg p-1 mx-6 border border-gray-200">
                
                {/* AI Resume Builder - Featured */}
                <Link
                  href="/ai-resume-builder"
                  className={`group relative px-2 py-1.5 rounded-md text-sm font-medium transition-all duration-300 ${
                    isActive('/ai-resume-builder')
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg shadow-yellow-500/30'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-amber-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Builder</span>
                  </div>
                  {isActive('/ai-resume-builder') && (
                    <div className="absolute inset-0 bg-white/20 rounded-xl animate-pulse" />
                  )}
                </Link>

                {/* AI Tools Dropdown - Redesigned */}
                <div 
                  className="relative"
                  ref={(el) => { dropdownRefs.current['ai-tools'] = el; }}
                >
                  <button
                    className="group flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-amber-50 transition-all duration-300"
                    onClick={() => handleDropdownToggle('ai-tools')}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>AI Tools</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${
                      activeDropdown === 'ai-tools' ? 'rotate-180' : ''
                    }`} />
                  </button>

                  {/* AI Tools Mega Dropdown - Completely Redesigned */}
                  {activeDropdown === 'ai-tools' && (
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 w-[750px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden backdrop-blur-xl z-50">
                      
                      {/* Header Section */}
                      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">AI-Powered Career Tools</h3>
                            <p className="text-xs text-gray-600 mt-1">Everything you need to land your dream job</p>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 rounded-full">
                            <Star className="w-4 h-4 text-amber-600" />
                            <span className="text-xs font-semibold text-amber-700">Premium Quality</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-6 p-6">
                        {/* Resume Tools */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 bg-corporate-amber-500 rounded-full"></div>
                            <h4 className="text-sm font-bold text-amber-600 uppercase tracking-wide">Resume Tools</h4>
                          </div>
                          
                          <Link href="/ai-resume-builder" className="group flex items-start p-2.5 rounded-lg hover:bg-amber-50 transition-all duration-300 border border-transparent hover:border-corporate-amber-200 hover:border-corporate-amber-600/30">
                            <div className="w-8 h-8 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-lg flex items-center justify-center mr-2.5 group-hover:scale-110 transition-transform duration-300">
                              <Zap className="w-4 h-4 text-amber-600" />
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 group-hover:text-amber-600 transition-colors">AI Resume Builder</div>
                              <div className="text-sm text-gray-600 mt-1">Create professional resumes in minutes</div>
                              <div className="flex items-center gap-1 mt-2">
                                <span className="text-xs text-amber-600 font-medium">Most Popular</span>
                                <TrendingUp className="w-3 h-3 text-amber-600" />
                              </div>
                            </div>
                          </Link>

                          <Link href="/ai-resume-editor" className="group flex items-start p-4 rounded-2xl hover:bg-amber-50 transition-all duration-300 border border-transparent hover:border-corporate-amber-200 hover:border-corporate-amber-600/30">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-green-100 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                              <CheckCircle className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 group-hover:text-amber-600 transition-colors">Resume Checker</div>
                              <div className="text-sm text-gray-600 mt-1">Get instant AI-powered feedback</div>
                            </div>
                          </Link>

                          <Link href="/keyword-scanner" className="group flex items-start p-4 rounded-2xl hover:bg-amber-50 transition-all duration-300 border border-transparent hover:border-corporate-amber-200 hover:border-corporate-amber-600/30">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-violet-100 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                              <Target className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 group-hover:text-amber-600 transition-colors">Keyword Scanner</div>
                              <div className="text-sm text-gray-600 mt-1">Optimize for job requirements</div>
                            </div>
                          </Link>

                          <Link href="/resume-bullet-point-generator" className="group flex items-start p-4 rounded-2xl hover:bg-amber-50 transition-all duration-300 border border-transparent hover:border-corporate-amber-200 hover:border-corporate-amber-600/30">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                              <FileText className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 group-hover:text-amber-600 transition-colors">Bullet Point Writer</div>
                              <div className="text-sm text-gray-600 mt-1">Craft impactful achievements</div>
                            </div>
                          </Link>
                        </div>

                        {/* Career Tools */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 bg-corporate-amber-500 rounded-full"></div>
                            <h4 className="text-sm font-bold text-amber-600 uppercase tracking-wide">Career Tools</h4>
                          </div>

                          <Link href="/ai-cover-letter-builder" className="group flex items-start p-4 rounded-2xl hover:bg-amber-50 transition-all duration-300 border border-transparent hover:border-corporate-amber-200 hover:border-corporate-amber-600/30">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                              <Mail className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 group-hover:text-amber-600 transition-colors">Cover Letter Generator</div>
                              <div className="text-sm text-gray-600 mt-1">Personalized cover letters</div>
                            </div>
                          </Link>

                          <Link href="/job-search" className="group flex items-start p-4 rounded-2xl hover:bg-amber-50 transition-all duration-300 border border-transparent hover:border-corporate-amber-200 hover:border-corporate-amber-600/30">
                            <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                              <Search className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <div className="font-bold text-gray-900 group-hover:text-amber-600 transition-colors">Job Search</div>
                                <span className="px-2 py-0.5 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 text-xs font-bold rounded-full">New!</span>
                              </div>
                              <div className="text-sm text-gray-600 mt-1">Discover opportunities</div>
                            </div>
                          </Link>

                          <Link href="/dashboard" className="group flex items-start p-4 rounded-2xl hover:bg-amber-50 transition-all duration-300 border border-transparent hover:border-corporate-amber-200 hover:border-corporate-amber-600/30">
                            <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-gray-100 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                              <Grid3X3 className="w-6 h-6 text-slate-600" />
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 group-hover:text-amber-600 transition-colors">All Tools Dashboard</div>
                              <div className="text-sm text-gray-600 mt-1">Access your workspace</div>
                            </div>
                          </Link>
                        </div>

                        {/* Learning Resources */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 bg-corporate-amber-500 rounded-full"></div>
                            <h4 className="text-sm font-bold text-amber-600 uppercase tracking-wide">Learn & Grow</h4>
                          </div>

                          <Link href="/docs/ai-keyword-targeting" className="group block p-4 rounded-2xl hover:bg-amber-50 transition-all duration-300 border border-transparent hover:border-corporate-amber-200 hover:border-corporate-amber-600/30">
                            <div className="aspect-video bg-gradient-to-br from-corporate-amber-50 to-yellow-100 from-corporate-navy-800 to-corporate-navy-700 rounded-xl mb-3 overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                              <ResumeTargetingFlowchart width={120} height={80} className="w-full h-full opacity-80" />
                            </div>
                            <div className="font-bold text-gray-900 text-sm group-hover:text-amber-600 transition-colors">Resume Targeting Guide</div>
                            <div className="text-xs text-gray-600 mt-1">Learn keyword optimization</div>
                          </Link>

                          <Link href="/resume-docs" className="inline-flex items-center gap-2 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors group">
                            <BookOpen className="w-4 h-4" />
                            <span>All Guides</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Templates Dropdown - Redesigned */}
                <div 
                  className="relative"
                  ref={(el) => { dropdownRefs.current['templates'] = el; }}
                >
                  <button
                    className="group flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-amber-50 transition-all duration-300"
                    onClick={() => handleDropdownToggle('templates')}
                  >
                    <Grid3X3 className="w-3.5 h-3.5" />
                    <span>Templates</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${
                      activeDropdown === 'templates' ? 'rotate-180' : ''
                    }`} />
                  </button>

                  {activeDropdown === 'templates' && (
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 w-[600px] bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden backdrop-blur-xl z-50">
                      
                      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900">Professional Templates</h3>
                        <p className="text-sm text-gray-600">Choose from our professional resume formats</p>
                      </div>

                      <div className="grid grid-cols-2 gap-6 p-6">
                        <div className="space-y-3">
                          <h4 className="text-sm font-bold text-amber-600 uppercase tracking-wide flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Resume Examples
                          </h4>
                          
                          <Link href="/resume-templates" className="group flex items-start p-4 rounded-2xl hover:bg-amber-50 transition-all duration-300">
                            <div className="w-10 h-10 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                              <FileText className="w-5 h-5 text-teal-600" />
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 group-hover:text-amber-600 transition-colors">Resume Formats</div>
                              <div className="text-sm text-gray-600">Professional layouts</div>
                            </div>
                          </Link>

                          <Link href="/resume-examples" className="group flex items-start p-4 rounded-2xl hover:bg-amber-50 transition-all duration-300">
                            <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                              <Users className="w-5 h-5 text-pink-600" />
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 group-hover:text-amber-600 transition-colors">Resume Examples</div>
                              <div className="text-sm text-gray-600">Industry-specific samples</div>
                            </div>
                          </Link>
                        </div>

                        <div className="space-y-3">
                          <h4 className="text-sm font-bold text-amber-600 uppercase tracking-wide flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Cover Letters
                          </h4>
                          
                          <Link href="/cover-letter-templates" className="group flex items-start p-4 rounded-2xl hover:bg-amber-50 transition-all duration-300">
                            <div className="w-10 h-10 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                              <Mail className="w-5 h-5 text-cyan-600" />
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 group-hover:text-amber-600 transition-colors">Cover Letter Templates</div>
                              <div className="text-sm text-gray-600">Winning examples</div>
                            </div>
                          </Link>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-12 h-8 bg-gradient-to-br from-emerald-100 to-green-100 rounded-lg mr-3 flex items-center justify-center">
                              <Star className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 text-sm">Featured: Best Resume Format</div>
                              <div className="text-xs text-gray-600">Learn the winning format</div>
                            </div>
                          </div>
                          <Link href="/blog" className="text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors flex items-center gap-1">
                            <span>Read Blog</span>
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pricing */}
                <Link
                  href="/pricing"
                  className="group flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-amber-50 transition-all duration-300"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Pricing</span>
                </Link>
              </div>
            </div>

            {/* Right Action Buttons - Redesigned */}
            <div className="hidden lg:flex items-center gap-4">
              <Link
                href="/sign-in"
                className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Sign In
              </Link>
              
              <Link
                href="/sign-up"
                className="group relative overflow-hidden bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-corporate-amber-400 hover:to-yellow-400 text-white font-semibold px-4 py-2 rounded-lg shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 transform hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Create Free Resume</span>
                </span>
              </Link>
            </div>

            {/* Mobile menu button - Enhanced */}
            <button
              className="lg:hidden p-3 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-amber-50 transition-all duration-300"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Enhanced Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 bg-white/95 backdrop-blur-xl">
              <div className="px-4 pt-4 pb-6 space-y-3">
                <Link 
                  href="/ai-resume-builder" 
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-gray-900 bg-gradient-to-r from-corporate-amber-50 to-yellow-50 from-corporate-amber-900/20 to-yellow-900/20 border border-corporate-amber-200 border-corporate-amber-600/30"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Sparkles className="w-5 h-5 text-amber-600" />
                  <span>AI Resume Builder</span>
                </Link>
                
                <Link 
                  href="/resume-templates" 
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-amber-50 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Grid3X3 className="w-5 h-5" />
                  <span>Templates</span>
                </Link>
                
                <Link 
                  href="/pricing" 
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-amber-50 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <TrendingUp className="w-5 h-5" />
                  <span>Pricing</span>
                </Link>
                
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <Link 
                    href="/sign-in" 
                    className="block px-4 py-3 rounded-xl text-gray-700 hover:bg-amber-50 transition-colors font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  
                  <Link 
                    href="/sign-up" 
                    className="flex items-center justify-center gap-2 mt-3 px-4 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl font-bold shadow-lg shadow-yellow-500/30"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Create Free Resume</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default MainNavbar;