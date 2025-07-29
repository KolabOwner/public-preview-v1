'use client';

import React, { useState } from 'react';

// Resume Card Component
const ResumeCard = ({ title, isDarkMode }: { title: string; isDarkMode: boolean }) => (
  <div className={`relative h-48 w-40 overflow-hidden rounded-lg border ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'} transition-colors duration-300`}>
    <div className={`absolute w-full p-2 font-[Merriweather] ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
      <div className="text-[5px] font-semibold text-center">Alex Chen</div>
      <div className="flex w-full justify-center pb-1 text-[3px]">New York, NY • alex.chen@email.com • (555) 123-4567</div>
      <div className="w-full border-b border-slate-200"></div>
      <div className={`uppercase text-[3.5px] font-semibold mt-0.5 mb-0.5 w-full border-b ${isDarkMode ? 'border-gray-400' : 'border-gray-600'} text-left leading-[4px] transition-colors duration-300`}>Summary</div>
      <div className="text-[3px] leading-[3.5px] text-left w-full pb-0.5">Creative Marketing Director with 10+ years of experience leading brand strategy and digital marketing initiatives.</div>
      <div className="w-full border-b border-slate-200"></div>
      <div className={`uppercase text-[3.5px] font-semibold mt-0.5 mb-0.5 w-full border-b ${isDarkMode ? 'border-gray-400' : 'border-gray-600'} text-left leading-[4px] transition-colors duration-300`}>Experience</div>
      <div>
        <div className="text-left text-[3px] font-semibold">Marketing Director | TechNova Solutions | NY | 2021-Present</div>
        <ul className="text-[2.5px] leading-[2.5px] text-left w-full pb-0.5 list-inside">
          <li className="-pl-1 flex flex-row pb-[0.5px]"><span className="px-0.5">•</span><span>Lead comprehensive marketing strategy for $50M B2B SaaS company, managing team of 12 and $5M annual budget</span></li>
          <li className="-pl-1 flex flex-row pb-[0.5px]"><span className="px-0.5">•</span><span>Increased qualified leads by 250% through implementation of account-based marketing strategy and advanced targeting</span></li>
          <li className="-pl-1 flex flex-row pb-[0.5px]"><span className="px-0.5">•</span><span>Launched new product line that generated $8M in first-year revenue through strategic go-to-market planning</span></li>
          <li className="-pl-1 flex flex-row pb-[0.5px]"><span className="px-0.5">•</span><span>Developed and executed content marketing strategy resulting in 400% increase in organic traffic and brand awareness</span></li>
        </ul>
      </div>
      <div>
        <div className="text-left text-[3px] font-semibold">Senior Marketing Manager | Digital Dynamics Inc | NY | 2018-2020</div>
        <ul className="text-[2.5px] leading-[2.5px] text-left w-full pb-0.5 list-inside">
          <li className="-pl-1 flex flex-row pb-[0.5px]"><span className="px-0.5">•</span><span>Managed integrated marketing campaigns across digital channels for portfolio of enterprise clients worth $25M annually</span></li>
          <li className="-pl-1 flex flex-row pb-[0.5px]"><span className="px-0.5">•</span><span>Achieved 185% ROI on paid media campaigns through advanced targeting, optimization, and performance analysis</span></li>
          <li className="-pl-1 flex flex-row pb-[0.5px]"><span className="px-0.5">•</span><span>Built marketing automation workflows that improved lead conversion by 60% and shortened sales cycle by 25%</span></li>
          <li className="-pl-1 flex flex-row pb-[0.5px]"><span className="px-0.5">•</span><span>Collaborated with sales team to develop enablement materials and processes that increased close rate by 30%</span></li>
        </ul>
      </div>
      <div>
        <div className="text-left text-[3px] font-semibold">Marketing Manager | Creative Agency Partners | Boston | 2015-2018</div>
        <ul className="text-[2.5px] leading-[2.5px] text-left w-full pb-0.5 list-inside">
          <li className="-pl-1 flex flex-row pb-[0.5px]"><span className="px-0.5">•</span><span>Executed multi-channel marketing campaigns for diverse client portfolio including Fortune 500 companies and startups</span></li>
          <li className="-pl-1 flex flex-row pb-[0.5px]"><span className="px-0.5">•</span><span>Managed social media strategy resulting in 500% follower growth and 200% engagement increase across platforms</span></li>
          <li className="-pl-1 flex flex-row pb-[0.5px]"><span className="px-0.5">•</span><span>Developed brand guidelines and messaging frameworks for 20+ client brands in technology and healthcare sectors</span></li>
          <li className="-pl-1 flex flex-row pb-[0.5px]"><span className="px-0.5">•</span><span>Led rebranding initiative that increased brand awareness by 150% and improved customer perception scores significantly</span></li>
        </ul>
      </div>
      <div className="w-full border-b border-slate-200 mt-0.5"></div>
      <div className={`uppercase text-[3.5px] font-semibold mt-0.5 mb-0.5 w-full border-b ${isDarkMode ? 'border-gray-400' : 'border-gray-600'} text-left leading-[4px] transition-colors duration-300`}>Skills</div>
      <div className="overflow-hidden">
        <div className="text-[2.5px] leading-[3px] text-left w-full">
          <div><span className="font-semibold">Marketing Strategy:</span> Brand Development, Go-to-Market Strategy, Product Marketing, Positioning</div>
          <div><span className="font-semibold">Digital Marketing:</span> SEO/SEM, Content Marketing, Email Marketing, Marketing Automation</div>
          <div><span className="font-semibold">Analytics & Tools:</span> Google Analytics, Salesforce, HubSpot, Tableau, Adobe Creative Suite</div>
          <div><span className="font-semibold">Leadership:</span> Team Building, Strategic Planning, Budget Management, Stakeholder Relations</div>
        </div>
      </div>
    </div>
    <div className="absolute bottom-0 left-0 z-10 w-full">
      <div className={`relative flex min-h-[2.5rem] flex-row items-center justify-between rounded-lg rounded-t-none ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} py-0 transition-colors duration-300`}>
        <div className="flex max-w-[calc(100%-2rem)] flex-row items-center pl-3">
          <div className={`overflow-hidden overflow-ellipsis whitespace-nowrap text-xs font-semibold leading-4 ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>{title}</div>
        </div>
        <div className={`flex h-8 min-w-8 items-center justify-center text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
          <i className="fas fa-ellipsis-vertical" aria-hidden="true"></i>
        </div>
      </div>
    </div>
  </div>
);

// Main Component
const DashboardMockup = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('updated');

  const resumeTitles = [
    'Junior QA Engineer',
    'Mechanical Engineer Student', 
    'Kolab Resume',
    'AI CTO',
    'Director of Content Marketing'
  ];

  return (
    <section className="pt-4 pb-0 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-64 h-64 bg-corporate-gold-500/8 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-56 h-56 bg-corporate-amber-400/6 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-corporate-gold-600/4 rounded-full blur-2xl animate-bounce"></div>
        <div className="absolute inset-0 bg-grid-white opacity-[0.02]"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative mb-0">
        <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-lg shadow-xl max-w-5xl mx-auto flex overflow-hidden min-h-[400px] transition-colors duration-300 transform scale-90`}>
          
          {/* Sidebar */}
          <aside className={`w-[240px] min-h-full ${isDarkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-r border-gray-700' : 'bg-gradient-to-br from-gray-50 to-gray-100 border-r border-gray-200'} flex flex-col transition-colors duration-300`}>
            {/* Logo Section */}
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-corporate-gold-500 to-corporate-amber-500 rounded-2xl blur-xl opacity-60"></div>
                  <div className="relative bg-gradient-to-br from-corporate-gold-500 to-corporate-amber-500 p-2.5 rounded-2xl shadow-xl shadow-corporate-gold-500/20">
                    <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
                      <span className="text-corporate-gold-600 font-bold text-sm">K</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-baseline">
                  <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-corporate-navy-900'} transition-colors duration-300 tracking-tight`}>Kolab</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-corporate-gold-500 to-corporate-amber-500 text-transparent bg-clip-text ml-0.5">AI</span>
                </div>
              </div>
            </div>

            {/* Create Button */}
            <div className="px-6 mb-6">
              <button className="w-full bg-gradient-to-r from-corporate-gold-500 to-corporate-amber-500 text-white font-medium py-2 px-3 rounded-lg shadow-md shadow-corporate-gold-500/20">
                <span className="flex items-center justify-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-sm">Create New Resume</span>
                </span>
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-6 space-y-1">
              <div className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl ${isDarkMode ? 'bg-corporate-amber-900/50 text-corporate-amber-300 border border-corporate-amber-600/30' : 'bg-corporate-amber-50/50 text-corporate-navy-900 border border-corporate-amber-200/30'} transition-colors duration-300`}>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-corporate-gold-500 to-corporate-amber-500 rounded-r-full"></div>
                <svg className={`w-5 h-5 ${isDarkMode ? 'text-corporate-amber-400' : 'text-corporate-amber-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="font-medium text-sm">Dashboard</span>
              </div>
              
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${isDarkMode ? 'text-slate-400' : 'text-corporate-navy-600'} transition-colors duration-300`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-medium text-sm">Sample Library</span>
              </div>
              
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${isDarkMode ? 'text-slate-400' : 'text-corporate-navy-600'} transition-colors duration-300`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="font-medium text-sm">Resume Review</span>
              </div>
            </nav>
          </aside>

          {/* Main Dashboard Content */}
          <main className="flex-1 p-8">
            <div className="flex justify-between">
              {/* Tab Navigation */}
              <div className="my-6 flex flex-row gap-x-2">
                <div className="rounded-md flex items-center h-6 px-2 text-xs font-semibold leading-4 uppercase tracking-[.12px] bg-gradient-to-r from-corporate-gold-500 to-corporate-amber-500 text-white">
                  Resumes
                </div>
                <div className={`rounded-md flex items-center h-6 px-2 text-xs font-semibold leading-4 uppercase tracking-[.12px] transition-colors duration-300 ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  Cover Letters
                </div>
              </div>

              {/* Right Side Controls */}
              <div className="my-5 flex flex-row items-center gap-4">
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'} hover:opacity-80 transition-all duration-300`}
                >
                  {isDarkMode ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                </button>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-corporate-gold-600 font-semibold text-white">A</div>
                <i className={`fas fa-caret-down ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`} aria-hidden="true"></i>
              </div>
            </div>

            <div className="pt-4">
              {/* Controls Section */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={`${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-700'} border rounded-lg px-3 py-2 text-sm font-medium cursor-pointer transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500`}
                  >
                    <option value="updated">UPDATED</option>
                    <option value="created">CREATED</option>
                    <option value="name">NAME</option>
                  </select>
                </div>

                {/* View Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg ${viewMode === 'grid' ? (isDarkMode ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-700') : (isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600')} transition-all duration-300 hover:opacity-80`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg ${viewMode === 'list' ? (isDarkMode ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-700') : (isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600')} transition-all duration-300 hover:opacity-80`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Resume Cards Rows */}
              <div className="flex flex-row gap-4">
                {resumeTitles.slice(0, 3).map((title, index) => (
                  <ResumeCard key={index} title={title} isDarkMode={isDarkMode} />
                ))}
              </div>

              <div className="flex flex-row gap-4 mt-4">
                {resumeTitles.slice(3, 5).map((title, index) => (
                  <ResumeCard key={index + 3} title={title} isDarkMode={isDarkMode} />
                ))}
              </div>

              {/* Add Section Button */}
              <div className="py-4 text-left text-xs font-bold uppercase">
                <button className={`flex items-center ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} transition-colors duration-300`}>
                  <i className={`fad fa-plus-circle pr-2.5 text-xs font-bold uppercase ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} transition-colors duration-300`} aria-hidden="true"></i>
                  <span>Add section</span>
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </section>
  );
};

export default DashboardMockup;