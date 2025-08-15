'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import UpgradeModal from '../resume/modals/upgrade-modal';
import { useUserUsage } from '@/lib/client/hooks/auth/use-user-usage';
import { useAuth } from '@/contexts/firebase-auth-context';
import { STRIPE_PRICE_IDS } from '@/lib/stripe';
import dynamic from 'next/dynamic';

// Dynamic import with no SSR to fix serialization error
const CreateResumeModal = dynamic(
  () => import('../resume/modals/create-resume-modal'),
  { ssr: false }
);

const AppSidebarNav = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { usage, displayUsage, loading } = useUserUsage();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  // Check if we're in a resume editor route that should show collapsed sidebar
  const isResumeEditorRoute = pathname.includes('/dashboard/resumes/') &&
    (pathname.includes('/summary') || pathname.includes('/contact') ||
     pathname.includes('/experience') || pathname.includes('/education') ||
     pathname.includes('/skills') || pathname.includes('/projects') ||
     pathname.includes('/involvement') || pathname.includes('/coursework') ||
     pathname.includes('/certifications') || pathname.includes('/preview') ||
     pathname.includes('/cover-letter'));
  
  const isJobSearchRoute = pathname.includes('/dashboard/job-search');
  
  const shouldCollapseSidebar = isResumeEditorRoute || isJobSearchRoute;
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
      href: '/dashboard/job-search',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
        </svg>
      ),
      label: 'Job Search',
      description: 'Find your next opportunity'
    },
  ];
  const gridPatternUrl = "data:image/svg+xml,%3csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3e%3cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='rgba(255,255,255,0.03)' stroke-width='1'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='100%25' height='100%25' fill='url(%23grid)'/%3e%3c/svg%3e";
  const handleUpgrade = async (planId: string) => {


    if (!user) {
      console.error('User not authenticated');
      return;
    }
    try {
      // Use monthly price ID (only plan supported)
      const priceId = STRIPE_PRICE_IDS.monthly;
      // Create checkout session
      const response = await fetch('/api/payments/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: priceId,
          userId: user.uid,
          email: user.email,
          interval: planId,
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const { sessionId } = await response.json();
      if (sessionId) {
        // Redirect to Stripe checkout
        const stripe = await import('@stripe/stripe-js').then(m => m.loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!));
        if (stripe) {
          await stripe.redirectToCheckout({ sessionId });
        }
      }
    } catch (error) {
      console.error('Upgrade failed:', error);
    }
  };
  return (
    <>
      <aside
        className={`app-sidebar ${shouldCollapseSidebar ? 'w-[72px]' : 'w-[280px]'} h-screen min-h-screen bg-gradient-to-br from-amber-50/90 via-white to-amber-50/50 dark:bg-navy-900/95 backdrop-blur-sm relative overflow-hidden flex flex-col transition-all duration-300 ease-in-out border-r border-amber-200/50 dark:border-navy-700`}
        data-route={pathname}
      >
        {/* Enhanced gradient background with corporate theme */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-100/40 via-amber-50/20 to-white dark:from-corporate-navy-900 dark:via-corporate-navy-800 dark:to-corporate-navy-900" />
          {/* Corporate animated gradients */}
          <div className="absolute inset-0" style={{ '--size': '400px' } as React.CSSProperties}>
            {/* Gold gradient */}
            <div
              style={{
                animationDuration: '40s',
                background: 'radial-gradient(circle, rgba(251, 191, 36, 0.15) 0px, rgba(251, 191, 36, 0) 50%) no-repeat',
                filter: 'blur(64px)'
              }}
              className="absolute left-[calc(50%-var(--size)/2)] top-[calc(50%-var(--size)/2)] h-[var(--size)] w-full animate-first opacity-70 mix-blend-normal !blur-3xl origin-[center_center]"
            />
            {/* Amber gradient */}
            <div
              style={{
                animationDuration: '30s',
                background: 'radial-gradient(circle, rgba(245, 158, 11, 0.1) 0px, rgba(245, 158, 11, 0) 50%) no-repeat',
                filter: 'blur(64px)'
              }}
              className="absolute left-[calc(50%-var(--size)/2)] top-[calc(50%-var(--size)/2)] h-[var(--size)] w-full animate-second opacity-60 mix-blend-normal !blur-3xl origin-[calc(26%)]"
            />
            {/* Navy gradient - hidden in light mode */}
            <div
              style={{
                animationDuration: '60s',
                background: 'radial-gradient(circle, rgba(30, 58, 138, 0.2) 0px, rgba(30, 58, 138, 0) 50%) no-repeat',
                filter: 'blur(64px)'
              }}
              className="absolute left-[calc(50%-var(--size)/2)] top-[calc(50%-var(--size)/2)] h-[var(--size)] w-full animate-third opacity-0 dark:opacity-100 mix-blend-normal !blur-3xl origin-[calc(100%)]"
            />
            {/* Warm gold accent */}
            <div
              style={{
                animationDuration: '60s',
                background: 'radial-gradient(circle, rgba(217, 119, 6, 0.08) 0px, rgba(217, 119, 6, 0) 50%) no-repeat',
                filter: 'blur(64px)'
              }}
              className="absolute left-[calc(50%-var(--size)/2)] top-[calc(50%-var(--size)/2)] h-[var(--size)] w-full animate-fourth opacity-50 mix-blend-normal !blur-3xl origin-[calc(10%-200px)]"
            />
            {/* Deep corporate navy - hidden in light mode */}
            <div
              style={{
                animationDuration: '30s',
                background: 'radial-gradient(circle, rgba(15, 23, 42, 0.15) 0px, rgba(15, 23, 42, 0) 50%) no-repeat',
                filter: 'blur(64px)'
              }}
              className="absolute left-[calc(50%-var(--size)/2)] top-[calc(50%-var(--size)/2)] h-[var(--size)] w-full animate-fifth opacity-0 dark:opacity-100 mix-blend-normal !blur-3xl origin-[calc(30%)_calc(30%)]"
            />
          </div>
          {/* Subtle radial pattern overlay with amber accent */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(245,158,11,0.08),transparent_40%)] dark:bg-[radial-gradient(circle_at_70%_80%,rgba(251,191,36,0.02),transparent_50%)]" />
          {/* Additional subtle pattern for depth */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(251,191,36,0.04),transparent_50%)] dark:hidden" />
        </div>
        {/* Content */}
        <div className={`relative z-10 sidebar-content flex flex-col h-full min-h-full ${shouldCollapseSidebar ? 'p-2' : 'p-6'} overflow-y-auto`}>
          {/* Logo */}
          <div className={`${shouldCollapseSidebar ? 'mb-4' : 'mb-8'}`}>
            <div className={`flex items-center gap-3 ${shouldCollapseSidebar ? 'justify-center' : ''}`}>
              {/* Modern Logo Mark with corporate theme */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-corporate-gold-500 to-corporate-amber-500 rounded-2xl blur-xl opacity-60 group-hover:opacity-80 transition-all duration-300" />
                <div className="relative bg-gradient-to-br from-corporate-gold-500 to-corporate-amber-500 p-2.5 rounded-2xl shadow-xl shadow-corporate-gold-500/20">
                  {/* Simple R Logo */}
                  <div className={`${shouldCollapseSidebar ? 'w-5 h-5' : 'w-7 h-7'} bg-white rounded-lg flex items-center justify-center text-corporate-gold-600 font-bold ${shouldCollapseSidebar ? 'text-sm' : 'text-lg'}`}>
                    R
                  </div>
                </div>
              </div>
              {/* Company Name - Hidden in collapsed state */}
              {!shouldCollapseSidebar && (
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-corporate-navy-900 dark:text-white tracking-tight">Rezum</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-corporate-gold-500 to-corporate-amber-500 text-transparent bg-clip-text ml-0.5">AI</span>
                </div>
              )}
            </div>
          </div>
          {/* Create Resume Button with corporate theme */}
          {!shouldCollapseSidebar && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="group relative overflow-hidden bg-gradient-to-r from-corporate-gold-500 to-corporate-amber-500 hover:from-corporate-gold-400 hover:to-corporate-amber-400 text-white font-semibold py-3 px-4 rounded-xl mb-6 w-full shadow-lg shadow-corporate-gold-500/30 transform hover:-translate-y-0.5 transition-all duration-200"
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
                    className={`group flex items-center gap-3 ${shouldCollapseSidebar ? 'px-2 py-2 justify-center' : 'px-3 py-2.5'} rounded-xl relative overflow-hidden transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-100/70 to-amber-50/50 dark:bg-corporate-navy-800/50 text-amber-900 dark:text-white backdrop-blur-sm border border-amber-300/40 dark:border-corporate-amber-600/30 shadow-sm shadow-amber-200/30'
                        : 'text-amber-700 dark:text-slate-400 hover:text-amber-900 dark:hover:text-white hover:bg-amber-50/50 dark:hover:bg-corporate-navy-800/30'
                    }`}
                    onMouseEnter={() => setHoveredItem(item.href)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    {/* Active indicator */}
                    {isActive && !shouldCollapseSidebar && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-amber-500 to-amber-600 rounded-r-full shadow-md shadow-amber-400/40" />
                    )}
                    {/* Icon */}
                    <span className={`sidebar-icon relative ${
                      isActive ? 'text-amber-600 dark:text-corporate-amber-400' : ''
                    } ${shouldCollapseSidebar ? 'text-lg' : ''}`}>
                      {item.icon}
                    </span>
                    {/* Label - Hidden in collapsed state */}
                    {!shouldCollapseSidebar && (
                      <div className="flex-1 relative">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{item.label}</span>
                          {(item as any).badge && (
                            <span className={`${(item as any).badgeColor} text-white text-xs font-semibold px-2 py-0.5 rounded-full`}>
                              {(item as any).badge}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </Link>
                  {/* Tooltip for collapsed state */}
                  {shouldCollapseSidebar && hoveredItem === item.href && (
                    <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50">
                      <div className="bg-white dark:bg-navy-800 text-slate-900 dark:text-white px-3 py-2 rounded-lg shadow-2xl shadow-slate-300/30 dark:shadow-navy-900/50 border border-slate-200 dark:border-navy-700">
                        <p className="font-medium text-sm whitespace-nowrap">{item.label}</p>
                        {(item as any).badge && (
                          <span className={`${(item as any).badgeColor} text-white text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block`}>
                            {(item as any).badge}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
          {/* Bottom section - Hidden in collapsed state and for Pro/Enterprise users */}
          {!shouldCollapseSidebar && usage.maxPdfGenerations !== -1 && (
            <div className="mx-1 flex flex-col items-start gap-y-4 self-stretch rounded-xl p-4 bg-white/20 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10" data-test-id="free-usage-counter">
              <div className="flex w-full flex-col gap-y-2">
                <div className="flex w-full flex-row items-center justify-between gap-x-2 opacity-70">
                  <div className="flex flex-row items-center gap-x-2">
                    <div className="h-5 w-5 cursor-pointer group relative flex items-center justify-center">
                      <i className="!flex items-center justify-center fad fa-file text-base w-5 h-5 text-slate-600 dark:text-slate-300 h-[14px] w-[14px]" aria-hidden="true"></i>
                    </div>
                    <span className="text-sm font-bold leading-5 text-slate-600 dark:text-slate-300">RESUMES</span>
                  </div>
                  <span className="text-sm font-bold leading-5 text-slate-600 dark:text-slate-300">
                    {loading ? '...' : `${usage.pdfGenerations} / ${usage.maxPdfGenerations === -1 ? '∞' : usage.maxPdfGenerations}`}
                  </span>
                </div>
                <div className="h-[1px] w-full bg-white/30 dark:bg-white/20"></div>
                <div className="flex w-full flex-row items-center justify-between gap-x-2">
                  <div className="flex flex-row items-center gap-x-2">
                    <div className="h-5 w-5 cursor-pointer group relative flex items-center justify-center">
                      <i className="!flex items-center justify-center fad fa-sparkles text-base w-5 h-5 text-slate-600 dark:text-slate-300 h-[14px] w-[14px]" aria-hidden="true"></i>
                    </div>
                    <span className="text-sm font-bold leading-5 text-slate-600 dark:text-slate-300">AI GENERATIONS</span>
                  </div>
                  <span className="text-sm font-bold leading-5 text-slate-600 dark:text-slate-300">
                    {loading ? '...' : `${usage.monthlyAiGenerations} / ${usage.maxAiGenerations}`}
                  </span>
                </div>
              </div>
              <div className="w-full">
                <button
                  type="button"
                  data-busy="false"
                  onClick={() => setShowUpgradeModal(true)}
                  className="relative flex items-center justify-center font-bold uppercase focus:ring-0 focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-full border-0 bg-gradient-to-r from-corporate-gold-600 to-corporate-amber-600 hover:from-corporate-gold-700 hover:to-corporate-amber-700 active:from-corporate-gold-800 active:to-corporate-amber-800 text-white px-2 py-1 min-h-8 leading-4 rounded-md text-xs shadow-lg shadow-corporate-gold-500/30"
                >
                  <i className="fad fa-circle-arrow-up !flex items-center justify-center !leading-[0] flex-none text-sm w-[18px] h-[18px] mr-1" aria-hidden="true"></i>
                  <span className="px-1">UPGRADE</span>
                </button>
              </div>
            </div>
          )}
          {/* Upgrade Button for collapsed state */}
          {shouldCollapseSidebar && (
            <div className="mt-auto mb-2">
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="p-2 rounded-lg bg-gradient-to-r from-corporate-gold-600/20 to-corporate-amber-600/20 group relative"
                aria-label="Upgrade to Pro"
              >
                <svg className="w-5 h-5 text-corporate-gold-600 dark:text-corporate-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                {/* Tooltip */}
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-50">
                  <div className="bg-white dark:bg-navy-800 text-slate-900 dark:text-white px-3 py-2 rounded-lg shadow-2xl shadow-slate-300/30 dark:shadow-navy-900/50 border border-slate-200 dark:border-navy-700 whitespace-nowrap">
                    <p className="font-medium text-sm">Upgrade to Pro</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Unlock premium features</p>
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
      {/* Create Resume Modal */}
      <CreateResumeModal
        isOpen={showCreateModal}
        onOpenChange={setShowCreateModal}
      />
    </>
  );
};
export default AppSidebarNav;
