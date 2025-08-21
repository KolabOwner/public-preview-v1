'use client';

import React from 'react';
import Image from 'next/image';

// Main Component
const DashboardMockup = () => {
  return (
    <section className="pt-12 pb-12 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-16 left-16 w-48 h-48 bg-corporate-gold-500/8 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-16 right-16 w-40 h-40 bg-corporate-amber-400/6 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-corporate-navy-500/4 rounded-full blur-2xl animate-bounce"></div>
        <div className="absolute inset-0 bg-grid-black/5 opacity-[0.02]"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="rounded-2xl shadow-2xl overflow-hidden">
          <Image
            src="/images/dashboard-mockup/dashboard-mockup.png"
            alt="Dashboard mockup showing resume management interface"
            width={1200}
            height={800}
            className="w-full h-auto object-contain"
            priority
            quality={95}
          />
        </div>
      </div>
    </section>
  );
};

export default DashboardMockup;