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
      <nav className="relative bg-white dark:bg-corporate-navy-900 border-b border-corporate-navy-200/50 dark:border-corporate-navy-700/50 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Enhanced Logo Section */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative">
                {/* Animated background glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-corporate-gold-400 to-corporate-amber-500 rounded-xl blur-lg opacity-60 group-hover:opacity-80 transition-all duration-300 animate-pulse" />
                
                {/* Logo container */}
                <div className="relative bg-gradient-to-br from-corporate-gold-500 via-corporate-amber-500 to-corporate-gold-600 p-2 rounded-xl shadow-lg shadow-corporate-gold-500/25 group-hover:shadow-corporate-gold-500/40 transition-all duration-300">
                  {/* Premium K Logo */}
                  <svg className="w-6 h-6" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="k-premium" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="50%" stopColor="#f8fafc" />
                        <stop offset="100%" stopColor="#f1f5f9" />
                      </linearGradient>
                      <filter id="k-shadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.15)"/>
                      </filter>
                    </defs>
                    
                    {/* Main K structure */}
                    <g filter="url(#k-shadow)">
                      {/* Left pillar */}
                      <path
                        d="M8 8 Q8 6 10 6 L14 6 Q16 6 16 8 L16 32 Q16 34 14 34 L10 34 Q8 34 8 32 Z"
                        fill="url(#k-premium)"
                      />
                      {/* Upper diagonal */}
                      <path
                        d="M16 18 L26 8 Q27 7 28 7 L30 7 Q32 7 32 9 L32 11 Q32 12 31 13 L22 22 Q21 22 20 21 L17 19 Q16 18 16 18 Z"
                        fill="url(#k-premium)"
                      />
                      {/* Lower diagonal */}
                      <path
                        d="M16 22 L20 19 Q21 18 22 18 L31 27 Q32 28 32 29 L32 31 Q32 33 30 33 L28 33 Q27 33 26 32 L16 22 Z"
                        fill="url(#k-premium)"
                      />
                    </g>
                  </svg>
                </div>
              </div>
              
              <div className="flex items-baseline">
                <span className="text-2xl font-bold text-corporate-navy-900 dark:text-white tracking-tight">Kolab</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-corporate-gold-500 to-corporate-amber-500 text-transparent bg-clip-text ml-1">AI</span>
              </div>
            </Link>

            {/* Desktop Navigation - Completely New Layout */}
            <div className="hidden lg:flex items-center">
              {/* Navigation Pills Container */}
              <div className="flex items-center bg-corporate-navy-50/80 dark:bg-corporate-navy-800/80 backdrop-blur-sm rounded-xl p-1.5 mx-6 border border-corporate-navy-200/50 dark:border-corporate-navy-700/50">
                
                {/* AI Resume Builder - Featured */}
                <Link
                  href="/ai-resume-builder"
                  className={`group relative px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    isActive('/ai-resume-builder')
                      ? 'bg-gradient-to-r from-corporate-amber-500 to-corporate-gold-500 text-white shadow-lg shadow-corporate-gold-500/30'
                      : 'text-corporate-navy-700 dark:text-gray-300 hover:text-corporate-navy-900 dark:hover:text-white hover:bg-corporate-amber-50/50 dark:hover:bg-corporate-navy-700/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
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
                    className="group flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-corporate-navy-700 dark:text-gray-300 hover:text-corporate-navy-900 dark:hover:text-white hover:bg-corporate-amber-50/50 dark:hover:bg-corporate-navy-700/50 transition-all duration-300"
                    onClick={() => handleDropdownToggle('ai-tools')}
                  >
                    <Zap className="w-4 h-4" />
                    <span>AI Tools</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${
                      activeDropdown === 'ai-tools' ? 'rotate-180' : ''
                    }`} />
                  </button>

                  {/* AI Tools Mega Dropdown - Completely Redesigned */}
                  {activeDropdown === 'ai-tools' && (
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 w-[750px] bg-white dark:bg-corporate-navy-900 rounded-2xl shadow-2xl border border-corporate-navy-200 dark:border-corporate-navy-700 overflow-hidden backdrop-blur-xl z-50">
                      
                      {/* Header Section */}
                      <div className="bg-gradient-to-r from-corporate-gold-50 to-corporate-amber-50 dark:from-corporate-navy-800 dark:to-corporate-navy-700 px-6 py-4 border-b border-corporate-navy-200 dark:border-corporate-navy-600">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-corporate-navy-900 dark:text-white">AI-Powered Career Tools</h3>
                            <p className="text-xs text-corporate-navy-600 dark:text-gray-300 mt-1">Everything you need to land your dream job</p>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-corporate-amber-100 dark:bg-corporate-amber-900/30 rounded-full">
                            <Star className="w-4 h-4 text-corporate-amber-600 dark:text-corporate-amber-400" />
                            <span className="text-xs font-semibold text-corporate-amber-700 dark:text-corporate-amber-300">Premium Quality</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-6 p-6">
                        {/* Resume Tools */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 bg-corporate-amber-500 rounded-full"></div>
                            <h4 className="text-sm font-bold text-corporate-amber-600 dark:text-corporate-amber-400 uppercase tracking-wide">Resume Tools</h4>
                          </div>
                          
                          <Link href="/ai-resume-builder" className="group flex items-start p-2.5 rounded-lg hover:bg-corporate-amber-50/50 dark:hover:bg-corporate-navy-800/50 transition-all duration-300 border border-transparent hover:border-corporate-amber-200 dark:hover:border-corporate-amber-600/30">
                            <div className="w-8 h-8 bg-gradient-to-br from-corporate-amber-100 to-corporate-gold-100 dark:from-corporate-amber-900/30 dark:to-corporate-gold-900/30 rounded-lg flex items-center justify-center mr-2.5 group-hover:scale-110 transition-transform duration-300">
                              <Zap className="w-4 h-4 text-corporate-amber-600 dark:text-corporate-amber-400" />
                            </div>
                            <div>
                              <div className="font-bold text-corporate-navy-900 dark:text-white group-hover:text-corporate-amber-600 dark:group-hover:text-corporate-amber-400 transition-colors">AI Resume Builder</div>
                              <div className="text-sm text-corporate-navy-600 dark:text-gray-400 mt-1">Create professional resumes in minutes</div>
                              <div className="flex items-center gap-1 mt-2">
                                <span className="text-xs text-corporate-amber-600 dark:text-corporate-amber-400 font-medium">Most Popular</span>
                                <TrendingUp className="w-3 h-3 text-corporate-amber-600 dark:text-corporate-amber-400" />
                              </div>
                            </div>
                          </Link>

                          <Link href="/ai-resume-editor" className="group flex items-start p-4 rounded-2xl hover:bg-corporate-amber-50/50 dark:hover:bg-corporate-navy-800/50 transition-all duration-300 border border-transparent hover:border-corporate-amber-200 dark:hover:border-corporate-amber-600/30">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                              <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                              <div className="font-bold text-corporate-navy-900 dark:text-white group-hover:text-corporate-amber-600 dark:group-hover:text-corporate-amber-400 transition-colors">Resume Checker</div>
                              <div className="text-sm text-corporate-navy-600 dark:text-gray-400 mt-1">Get instant AI-powered feedback</div>
                            </div>
                          </Link>

                          <Link href="/keyword-scanner" className="group flex items-start p-4 rounded-2xl hover:bg-corporate-amber-50/50 dark:hover:bg-corporate-navy-800/50 transition-all duration-300 border border-transparent hover:border-corporate-amber-200 dark:hover:border-corporate-amber-600/30">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                              <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <div className="font-bold text-corporate-navy-900 dark:text-white group-hover:text-corporate-amber-600 dark:group-hover:text-corporate-amber-400 transition-colors">Keyword Scanner</div>
                              <div className="text-sm text-corporate-navy-600 dark:text-gray-400 mt-1">Optimize for job requirements</div>
                            </div>
                          </Link>

                          <Link href="/resume-bullet-point-generator" className="group flex items-start p-4 rounded-2xl hover:bg-corporate-amber-50/50 dark:hover:bg-corporate-navy-800/50 transition-all duration-300 border border-transparent hover:border-corporate-amber-200 dark:hover:border-corporate-amber-600/30">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                              <FileText className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                              <div className="font-bold text-corporate-navy-900 dark:text-white group-hover:text-corporate-amber-600 dark:group-hover:text-corporate-amber-400 transition-colors">Bullet Point Writer</div>
                              <div className="text-sm text-corporate-navy-600 dark:text-gray-400 mt-1">Craft impactful achievements</div>
                            </div>
                          </Link>
                        </div>

                        {/* Career Tools */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 bg-corporate-amber-500 rounded-full"></div>
                            <h4 className="text-sm font-bold text-corporate-amber-600 dark:text-corporate-amber-400 uppercase tracking-wide">Career Tools</h4>
                          </div>

                          <Link href="/ai-cover-letter-builder" className="group flex items-start p-4 rounded-2xl hover:bg-corporate-amber-50/50 dark:hover:bg-corporate-navy-800/50 transition-all duration-300 border border-transparent hover:border-corporate-amber-200 dark:hover:border-corporate-amber-600/30">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                              <Mail className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                              <div className="font-bold text-corporate-navy-900 dark:text-white group-hover:text-corporate-amber-600 dark:group-hover:text-corporate-amber-400 transition-colors">Cover Letter Generator</div>
                              <div className="text-sm text-corporate-navy-600 dark:text-gray-400 mt-1">Personalized cover letters</div>
                            </div>
                          </Link>

                          <Link href="/job-search" className="group flex items-start p-4 rounded-2xl hover:bg-corporate-amber-50/50 dark:hover:bg-corporate-navy-800/50 transition-all duration-300 border border-transparent hover:border-corporate-amber-200 dark:hover:border-corporate-amber-600/30">
                            <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                              <Search className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <div className="font-bold text-corporate-navy-900 dark:text-white group-hover:text-corporate-amber-600 dark:group-hover:text-corporate-amber-400 transition-colors">Job Search</div>
                                <span className="px-2 py-0.5 bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-full">New!</span>
                              </div>
                              <div className="text-sm text-corporate-navy-600 dark:text-gray-400 mt-1">Discover opportunities</div>
                            </div>
                          </Link>

                          <Link href="/dashboard" className="group flex items-start p-4 rounded-2xl hover:bg-corporate-amber-50/50 dark:hover:bg-corporate-navy-800/50 transition-all duration-300 border border-transparent hover:border-corporate-amber-200 dark:hover:border-corporate-amber-600/30">
                            <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-gray-100 dark:from-slate-900/30 dark:to-gray-900/30 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                              <Grid3X3 className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                            </div>
                            <div>
                              <div className="font-bold text-corporate-navy-900 dark:text-white group-hover:text-corporate-amber-600 dark:group-hover:text-corporate-amber-400 transition-colors">All Tools Dashboard</div>
                              <div className="text-sm text-corporate-navy-600 dark:text-gray-400 mt-1">Access your workspace</div>
                            </div>
                          </Link>
                        </div>

                        {/* Learning Resources */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 bg-corporate-amber-500 rounded-full"></div>
                            <h4 className="text-sm font-bold text-corporate-amber-600 dark:text-corporate-amber-400 uppercase tracking-wide">Learn & Grow</h4>
                          </div>

                          <Link href="/docs/ai-keyword-targeting" className="group block p-4 rounded-2xl hover:bg-corporate-amber-50/50 dark:hover:bg-corporate-navy-800/50 transition-all duration-300 border border-transparent hover:border-corporate-amber-200 dark:hover:border-corporate-amber-600/30">
                            <div className="aspect-video bg-gradient-to-br from-corporate-amber-50 to-corporate-gold-100 dark:from-corporate-navy-800 dark:to-corporate-navy-700 rounded-xl mb-3 overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                              <ResumeTargetingFlowchart width={120} height={80} className="w-full h-full opacity-80" />
                            </div>
                            <div className="font-bold text-corporate-navy-900 dark:text-white text-sm group-hover:text-corporate-amber-600 dark:group-hover:text-corporate-amber-400 transition-colors">Resume Targeting Guide</div>
                            <div className="text-xs text-corporate-navy-600 dark:text-gray-400 mt-1">Learn keyword optimization</div>
                          </Link>

                          <Link href="/resume-docs" className="inline-flex items-center gap-2 text-sm font-semibold text-corporate-amber-600 dark:text-corporate-amber-400 hover:text-corporate-amber-700 dark:hover:text-corporate-amber-300 transition-colors group">
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
                    className="group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-corporate-navy-700 dark:text-gray-300 hover:text-corporate-navy-900 dark:hover:text-white hover:bg-corporate-amber-50/50 dark:hover:bg-corporate-navy-700/50 transition-all duration-300"
                    onClick={() => handleDropdownToggle('templates')}
                  >
                    <Grid3X3 className="w-4 h-4" />
                    <span>Templates</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${
                      activeDropdown === 'templates' ? 'rotate-180' : ''
                    }`} />
                  </button>

                  {activeDropdown === 'templates' && (
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 w-[600px] bg-white dark:bg-corporate-navy-900 rounded-3xl shadow-2xl border border-corporate-navy-200 dark:border-corporate-navy-700 overflow-hidden backdrop-blur-xl z-50">
                      
                      <div className="bg-gradient-to-r from-corporate-gold-50 to-corporate-amber-50 dark:from-corporate-navy-800 dark:to-corporate-navy-700 px-6 py-4 border-b border-corporate-navy-200 dark:border-corporate-navy-600">
                        <h3 className="text-lg font-bold text-corporate-navy-900 dark:text-white">Professional Templates</h3>
                        <p className="text-sm text-corporate-navy-600 dark:text-gray-300">Choose from our professional resume formats</p>
                      </div>

                      <div className="grid grid-cols-2 gap-6 p-6">
                        <div className="space-y-3">
                          <h4 className="text-sm font-bold text-corporate-amber-600 dark:text-corporate-amber-400 uppercase tracking-wide flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Resume Examples
                          </h4>
                          
                          <Link href="/resume-templates" className="group flex items-start p-4 rounded-2xl hover:bg-corporate-amber-50/50 dark:hover:bg-corporate-navy-800/50 transition-all duration-300">
                            <div className="w-10 h-10 bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                              <FileText className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                            </div>
                            <div>
                              <div className="font-bold text-corporate-navy-900 dark:text-white group-hover:text-corporate-amber-600 dark:group-hover:text-corporate-amber-400 transition-colors">Resume Formats</div>
                              <div className="text-sm text-corporate-navy-600 dark:text-gray-400">Professional layouts</div>
                            </div>
                          </Link>

                          <Link href="/resume-examples" className="group flex items-start p-4 rounded-2xl hover:bg-corporate-amber-50/50 dark:hover:bg-corporate-navy-800/50 transition-all duration-300">
                            <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                              <Users className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                            </div>
                            <div>
                              <div className="font-bold text-corporate-navy-900 dark:text-white group-hover:text-corporate-amber-600 dark:group-hover:text-corporate-amber-400 transition-colors">Resume Examples</div>
                              <div className="text-sm text-corporate-navy-600 dark:text-gray-400">Industry-specific samples</div>
                            </div>
                          </Link>
                        </div>

                        <div className="space-y-3">
                          <h4 className="text-sm font-bold text-corporate-amber-600 dark:text-corporate-amber-400 uppercase tracking-wide flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Cover Letters
                          </h4>
                          
                          <Link href="/cover-letter-templates" className="group flex items-start p-4 rounded-2xl hover:bg-corporate-amber-50/50 dark:hover:bg-corporate-navy-800/50 transition-all duration-300">
                            <div className="w-10 h-10 bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                              <Mail className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                            </div>
                            <div>
                              <div className="font-bold text-corporate-navy-900 dark:text-white group-hover:text-corporate-amber-600 dark:group-hover:text-corporate-amber-400 transition-colors">Cover Letter Templates</div>
                              <div className="text-sm text-corporate-navy-600 dark:text-gray-400">Winning examples</div>
                            </div>
                          </Link>
                        </div>
                      </div>

                      <div className="bg-corporate-navy-50/50 dark:bg-corporate-navy-800/50 p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-12 h-8 bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 rounded-lg mr-3 flex items-center justify-center">
                              <Star className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                              <div className="font-bold text-corporate-navy-900 dark:text-white text-sm">Featured: Best Resume Format</div>
                              <div className="text-xs text-corporate-navy-600 dark:text-gray-400">Learn the winning format</div>
                            </div>
                          </div>
                          <Link href="/blog" className="text-sm font-semibold text-corporate-amber-600 dark:text-corporate-amber-400 hover:text-corporate-amber-700 dark:hover:text-corporate-amber-300 transition-colors flex items-center gap-1">
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
                  className="group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-corporate-navy-700 dark:text-gray-300 hover:text-corporate-navy-900 dark:hover:text-white hover:bg-corporate-amber-50/50 dark:hover:bg-corporate-navy-700/50 transition-all duration-300"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Pricing</span>
                </Link>
              </div>
            </div>

            {/* Right Action Buttons - Redesigned */}
            <div className="hidden lg:flex items-center gap-4">
              <Link
                href="/sign-in"
                className="px-4 py-2 text-sm font-semibold text-corporate-navy-700 dark:text-gray-300 hover:text-corporate-navy-900 dark:hover:text-white transition-colors"
              >
                Sign In
              </Link>
              
              <Link
                href="/ai-resume-builder"
                className="group relative overflow-hidden bg-gradient-to-r from-corporate-amber-500 to-corporate-gold-500 hover:from-corporate-amber-400 hover:to-corporate-gold-400 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-corporate-gold-500/30 hover:shadow-corporate-gold-500/50 transform hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Create Free Resume</span>
                </span>
              </Link>
            </div>

            {/* Mobile menu button - Enhanced */}
            <button
              className="lg:hidden p-3 rounded-xl text-corporate-navy-700 dark:text-gray-300 hover:text-corporate-navy-900 dark:hover:text-white hover:bg-corporate-amber-50/50 dark:hover:bg-corporate-navy-700/50 transition-all duration-300"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Enhanced Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-corporate-navy-200 dark:border-corporate-navy-700 bg-white/95 dark:bg-corporate-navy-900/95 backdrop-blur-xl">
              <div className="px-4 pt-4 pb-6 space-y-3">
                <Link 
                  href="/ai-resume-builder" 
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-corporate-navy-900 dark:text-white bg-gradient-to-r from-corporate-amber-50 to-corporate-gold-50 dark:from-corporate-amber-900/20 dark:to-corporate-gold-900/20 border border-corporate-amber-200 dark:border-corporate-amber-600/30"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Sparkles className="w-5 h-5 text-corporate-amber-600 dark:text-corporate-amber-400" />
                  <span>AI Resume Builder</span>
                </Link>
                
                <Link 
                  href="/resume-templates" 
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-corporate-navy-700 dark:text-gray-300 hover:bg-corporate-amber-50/50 dark:hover:bg-corporate-navy-800/50 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Grid3X3 className="w-5 h-5" />
                  <span>Templates</span>
                </Link>
                
                <Link 
                  href="/pricing" 
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-corporate-navy-700 dark:text-gray-300 hover:bg-corporate-amber-50/50 dark:hover:bg-corporate-navy-800/50 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <TrendingUp className="w-5 h-5" />
                  <span>Pricing</span>
                </Link>
                
                <div className="border-t border-corporate-navy-200 dark:border-corporate-navy-700 pt-3 mt-3">
                  <Link 
                    href="/sign-in" 
                    className="block px-4 py-3 rounded-xl text-corporate-navy-700 dark:text-gray-300 hover:bg-corporate-amber-50/50 dark:hover:bg-corporate-navy-800/50 transition-colors font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  
                  <Link 
                    href="/ai-resume-builder" 
                    className="flex items-center justify-center gap-2 mt-3 px-4 py-3 bg-gradient-to-r from-corporate-amber-500 to-corporate-gold-500 text-white rounded-xl font-bold shadow-lg shadow-corporate-gold-500/30"
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