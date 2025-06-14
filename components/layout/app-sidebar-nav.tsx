'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import UpgradeModal from '../resume/upgrade-modal';

const AppSidebarNav = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [aiGenerations, setAiGenerations] = useState(9);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Check if we're in a resume editor route that should show collapsed sidebar
  const isResumeEditorRoute = pathname.includes('/dashboard/resumes/') &&
    (pathname.includes('/summary') || pathname.includes('/contact') ||
     pathname.includes('/experience') || pathname.includes('/education') ||
     pathname.includes('/skills') || pathname.includes('/projects') ||
     pathname.includes('/involvement') || pathname.includes('/coursework') ||
     pathname.includes('/preview'));

  const navItems = [
    {
      href: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      label: 'Dashboard',
      description: 'Your personal command center'
    },
    {
      href: '/dashboard/job-search',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      label: 'Job Search',
      badge: 'New',
      badgeColor: 'bg-gradient-to-r from-[#5b7cfd] to-[#4a6bec]',
      description: 'Find your dream position'
    },
    {
      href: '/dashboard/samples',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      label: 'Sample Library',
      description: 'Professional templates'
    },
    {
      href: '/dashboard/review',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      label: 'Resume Review',
      description: 'AI-powered feedback'
    },
    {
      href: '/dashboard/ai-interview',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      label: 'AI Interview',
      description: 'Practice makes perfect'
    }
  ];

  const gridPatternUrl = "data:image/svg+xml,%3csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3e%3cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='rgba(255,255,255,0.03)' stroke-width='1'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='100%25' height='100%25' fill='url(%23grid)'/%3e%3c/svg%3e";

  const handleUpgrade = async (planId: string) => {
    console.log(`Processing upgrade to ${planId} plan`);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Upgrade successful!');
    } catch (error) {
      console.error('Upgrade failed:', error);
    }
  };

  return (
    <>
      <aside
        className={`app-sidebar ${isResumeEditorRoute ? 'w-[72px]' : 'w-[280px]'} h-screen min-h-screen bg-[#1a2332] relative overflow-hidden flex flex-col transition-all duration-300 ease-in-out border-r border-[#374151]/30`}
        data-route={pathname}
      >
        {/* Enhanced gradient background with blue accents */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a2332] via-[#1e2936] to-[#1a2332]" />

          {/* Animated blue gradient orbs */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#5b7cfd]/[0.08] rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#4a6bec]/[0.06] rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
            <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-[#5b7cfd]/[0.04] rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
          </div>

          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-50"
            style={{ backgroundImage: `url("${gridPatternUrl}")` }}
          />
        </div>

        {/* Content */}
        <div className={`relative z-10 sidebar-content flex flex-col h-full min-h-full ${isResumeEditorRoute ? 'p-2' : 'p-6'} overflow-y-auto`}>
          {/* Logo */}
          <div className={`${isResumeEditorRoute ? 'mb-4' : 'mb-8'}`}>
            <div className={`flex items-center gap-3 ${isResumeEditorRoute ? 'justify-center' : ''}`}>
              {/* Modern Logo Mark with blue gradient */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#5b7cfd] to-[#4a6bec] rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative bg-gradient-to-r from-[#5b7cfd] to-[#4a6bec] p-2.5 rounded-xl">
                  <svg className={`${isResumeEditorRoute ? 'w-5 h-5' : 'w-6 h-6'} text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>

              {/* Company Name - Hidden in collapsed state */}
              {!isResumeEditorRoute && (
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-white tracking-tight">Hirable</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-[#5b7cfd] to-[#4a6bec] text-transparent bg-clip-text ml-0.5">AI</span>
                </div>
              )}
            </div>
          </div>

          {/* Create Resume Button with blue gradient */}
          {!isResumeEditorRoute && (
            <button
              onClick={() => router.push('/dashboard/resumes/new')}
              className="group relative overflow-hidden bg-gradient-to-r from-[#5b7cfd] to-[#4a6bec] hover:from-[#4a6bec] hover:to-[#3a5bdc] text-white font-semibold py-3 px-4 rounded-xl mb-6 transition-all duration-300 w-full shadow-lg shadow-[#5b7cfd]/20"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Create New Resume</span>
              </span>
            </button>
          )}

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

              return (
                <div key={item.href} className="relative">
                  <Link
                    href={item.href}
                    className={`group flex items-center gap-3 ${isResumeEditorRoute ? 'px-2 py-2 justify-center' : 'px-3 py-2.5'} rounded-xl transition-all duration-200 relative overflow-hidden ${
                      isActive
                        ? 'bg-gradient-to-r from-[#5b7cfd]/20 to-[#4a6bec]/10 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                    onMouseEnter={() => setHoveredItem(item.href)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    {/* Active indicator */}
                    {isActive && !isResumeEditorRoute && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-[#5b7cfd] to-[#4a6bec] rounded-r-full shadow-lg shadow-[#5b7cfd]/30" />
                    )}

                    {/* Hover effect */}
                    <div className={`absolute inset-0 bg-gradient-to-r from-[#5b7cfd]/10 to-[#4a6bec]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />

                    {/* Icon with subtle animation */}
                    <span className={`sidebar-icon relative transition-all duration-200 ${
                      isActive ? 'text-[#5b7cfd]' : 'group-hover:text-[#5b7cfd]'
                    } ${hoveredItem === item.href ? 'scale-110' : ''} ${isResumeEditorRoute ? 'text-lg' : ''}`}>
                      {item.icon}
                    </span>

                    {/* Label and description - Hidden in collapsed state */}
                    {!isResumeEditorRoute && (
                      <div className="flex-1 relative">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{item.label}</span>
                          {item.badge && (
                            <span className={`${item.badgeColor} text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow-sm`}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                        {hoveredItem === item.href && !isActive && (
                          <p className="text-xs text-slate-500 mt-0.5 transition-all duration-200">
                            {item.description}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Arrow indicator on hover - Hidden in collapsed state */}
                    {!isResumeEditorRoute && hoveredItem === item.href && (
                      <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </Link>

                  {/* Tooltip for collapsed state */}
                  {isResumeEditorRoute && hoveredItem === item.href && (
                    <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50">
                      <div className="bg-[#2a3f5f] text-white px-3 py-2 rounded-lg shadow-xl border border-[#374151]/30">
                        <p className="font-medium text-sm whitespace-nowrap">{item.label}</p>
                        {item.badge && (
                          <span className={`${item.badgeColor} text-white text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* AI Generations - Updated with blue accents */}
            {!isResumeEditorRoute && (
              <div className="mt-6 p-3 bg-gradient-to-r from-[#5b7cfd]/10 to-[#4a6bec]/10 rounded-xl border border-[#5b7cfd]/20 backdrop-blur-sm">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#5b7cfd]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    <span className="text-sm font-medium">AI Generations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold bg-gradient-to-r from-[#5b7cfd] to-[#4a6bec] text-transparent bg-clip-text text-lg">{aiGenerations}</span>
                    <button
                      onClick={() => setAiGenerations(prev => prev + 1)}
                      className="text-xl hover:bg-[#5b7cfd]/20 rounded-lg p-1 transition-all duration-200 hover:scale-110"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </nav>

          {/* Bottom section - Hidden in collapsed state */}
          {!isResumeEditorRoute && (
            <div className="space-y-4 mt-4">
              {/* Upgrade Card with blue gradient */}
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#2a3f5f] to-[#324966] p-4 border border-[#374151]/30">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#5b7cfd]/20 rounded-full blur-2xl" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-[#5b7cfd]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <h3 className="font-bold text-white">Get Hired Faster</h3>
                  </div>
                  <p className="text-slate-400 text-xs mb-3">Unlock premium AI features</p>
                  <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="w-full bg-gradient-to-r from-[#5b7cfd] to-[#4a6bec] hover:from-[#4a6bec] hover:to-[#3a5bdc] text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-[#5b7cfd]/25"
                  >
                    Upgrade to Pro
                  </button>
                </div>
              </div>

              {/* Community Link */}
              <Link
                href="/dashboard/community"
                className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-all duration-200 p-2 rounded-lg hover:bg-white/5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>Join the Community</span>
              </Link>
            </div>
          )}

          {/* Upgrade Button for collapsed state */}
          {isResumeEditorRoute && (
            <div className="mt-auto mb-2">
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="p-2 rounded-lg bg-gradient-to-r from-[#5b7cfd]/20 to-[#4a6bec]/20 hover:from-[#5b7cfd]/30 hover:to-[#4a6bec]/30 transition-all duration-200 group relative"
                aria-label="Upgrade to Pro"
              >
                <svg className="w-5 h-5 text-[#5b7cfd]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>

                {/* Tooltip */}
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-50">
                  <div className="bg-[#2a3f5f] text-white px-3 py-2 rounded-lg shadow-xl border border-[#374151]/30 whitespace-nowrap">
                    <p className="font-medium text-sm">Upgrade to Pro</p>
                    <p className="text-xs text-slate-400 mt-1">Unlock premium features</p>
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={handleUpgrade}
      />
    </>
  );
};

export default AppSidebarNav;