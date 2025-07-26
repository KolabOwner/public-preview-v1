'use client';

import React, { useState } from 'react';

// Main Component
const DashboardMockup = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('updated');

  return (
    <section className="py-16 bg-white relative overflow-hidden">
      {/* Corporate Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-64 h-64 bg-corporate-gold-500/8 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-56 h-56 bg-corporate-amber-400/6 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-corporate-gold-600/4 rounded-full blur-2xl animate-bounce"></div>
        <div className="absolute inset-0 bg-grid-white opacity-[0.02]"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">

        <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-lg shadow-xl max-w-5xl mx-auto flex overflow-hidden min-h-[600px] transition-colors duration-300 transform scale-90`}>
          {/* Mockup Sidebar */}
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
          {/* Theme Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'} hover:opacity-80 transition-all duration-300`}
            aria-label="Toggle theme"
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

          {/* Profile Icon */}
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-corporate-gold-600 font-semibold text-white">
            A
          </div>
          <i className={`fas fa-caret-down ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`} aria-hidden="true"></i>
        </div>
      </div>

      <div className="pt-4">
        {/* Controls Section */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {/* Sort Dropdown */}
            <div className="relative">
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
          </div>

          {/* View Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? (isDarkMode ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-700') : (isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600')} transition-all duration-300 hover:opacity-80`}
              aria-label="Grid view"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? (isDarkMode ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-700') : (isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600')} transition-all duration-300 hover:opacity-80`}
              aria-label="List view"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Resume Cards Row */}
        <div className="flex flex-row gap-4">
          {/* Resume Card 1 */}
          <div className={`relative h-64 w-52 overflow-hidden rounded-lg border ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'} transition-colors duration-300`}>
            <div className={`absolute w-full p-4 font-[Merriweather] ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
              <div className="text-[7px] font-semibold">Charles Bloomberg</div>
              <div className="flex w-full justify-center pb-1.5 text-[4px]">New York City, United States • charlesbloomberg@wisc.edu • (621) 799-5548 • in/bloomberg</div>
              <div className="w-full border-b border-slate-200"></div>
              <div className={`uppercase text-[5px] font-semibold mt-1 mb-0.5 w-full border-b ${isDarkMode ? 'border-gray-400' : 'border-gray-600'} text-left leading-[7px] transition-colors duration-300`}>Summary</div>
              <div className="text-[4px] leading-[5px] text-left w-full pb-1 list-inside">The Bachelor of Digital Media student with experience in Surveying and Web Designing, skilled at social media and presentation with peak interest in creating digital products and services to address pain points.</div>
              <div className="w-full border-b border-slate-200"></div>
              <div className={`uppercase text-[5px] font-semibold mt-1 mb-0.5 w-full border-b ${isDarkMode ? 'border-gray-400' : 'border-gray-600'} text-left leading-[7px] transition-colors duration-300`}>Experience</div>
              <div>
                <div className="text-left text-[4px] font-semibold">Expeditor | Company A | New York, NY | June 2020 - Present</div>
                <ul className="text-[4px] leading-[5px] text-left w-full pb-1 list-inside">
                  <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Led the Pass team on shifts with up to 390 covers and trained staff new to the industry from different cultural backgrounds and skills.</span></li>
                  <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Applied Agile methodologies to gather feedback, iterate and improve systems and productivity.</span></li>
                  <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Managed multiple, conflicting priorities in a high-pressure, fast-paced environment.</span></li>
                </ul>
              </div>
              <div>
                <div className="text-left text-[4px] font-semibold">Intern (Creative) | Company B | New York, NY | June 2019 - June 2020</div>
                <ul className="text-[4px] leading-[5px] text-left w-full pb-1 list-inside">
                  <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Analyzed briefs across 4 client accounts and conducted in-depth customer, product, and client research to identify insights.</span></li>
                  <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Wrote copy for over 100 social media posts and co-created 3 client presentation decks.</span></li>
                  <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Created all copy for 2 client pitches, including scripts and storyboards for filmed advertising.</span></li>
                  <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Delivered results within tight deadlines while working both independently and as part of a team.</span></li>
                </ul>
              </div>
              <div>
                <div className="text-left text-[4px] font-semibold">Intern (Content) | Company C | New York, NY | June 2018 - June 2019</div>
                <ul className="text-[4px] leading-[5px] text-left w-full pb-1 list-inside">
                  <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Conducted over 15 interviews for Sydney Homeless Connect social media and marketing.</span></li>
                  <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Interviewed service clients, service providers, and organizers and delivered 4 written pieces for publication.</span></li>
                  <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Applied detailed editorial feedback to tailor the pieces for the intended audience.</span></li>
                </ul>
              </div>
              <div className={`uppercase text-[5px] font-semibold mt-1 mb-0.5 w-full border-b ${isDarkMode ? 'border-gray-400' : 'border-gray-600'} text-left leading-[7px] transition-colors duration-300`}>Projects</div>
              <div>
                <div className="text-left text-[6px] font-semibold">Expeditor | Company A | New York, NY | June 2020 - Present</div>
                <ul className="text-[4px] leading-[5px] text-left w-full pb-1 list-inside">
                  <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Designed a website to empower Australians to identify transferable skillsets and upskill for jobs of the future.</span></li>
                  <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Conducted 2 surveys and more than 10 interviews across the general public and industry.</span></li>
                  <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Undertook research into public sentiment before, during, and post-Covid lockdown, government initiatives, projected growth industries, and environmental considerations.</span></li>
                </ul>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 z-10 w-full">
              <div className={`relative flex min-h-[3.5rem] flex-row items-center justify-between rounded-lg rounded-t-none ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} py-0 transition-colors duration-300`}>
                <div className="flex max-w-[calc(100%-3rem)] flex-row items-center pl-4">
                  <div className={`overflow-hidden overflow-ellipsis whitespace-nowrap text-base font-semibold leading-6 ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>Junior QA Engineer</div>
                </div>
                <div className={`flex h-12 min-w-12 items-center justify-center text-xl ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                  <i className="fas fa-ellipsis-vertical" aria-hidden="true"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Resume Card 2 */}
          <div className={`relative h-64 w-52 overflow-hidden rounded-lg border ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'} transition-colors duration-300`}>
            <div className={`absolute w-full p-4 font-[Merriweather] ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
              <div className="text-[7px] font-semibold">Charles Bloomberg</div>
              <div className="flex w-full justify-center pb-1.5 text-[4px]">New York City, United States • charlesbloomberg@wisc.edu • (621) 799-5548 • in/bloomberg</div>
              <div className="w-full border-b border-slate-200"></div>
              <div className={`uppercase text-[5px] font-semibold mt-1 mb-0.5 w-full border-b ${isDarkMode ? 'border-gray-400' : 'border-gray-600'} text-left leading-[7px] transition-colors duration-300`}>Summary</div>
              <div className="text-[4px] leading-[5px] text-left w-full pb-1 list-inside">The Bachelor of Digital Media student with experience in Surveying and Web Designing, skilled at social media and presentation with peak interest in creating digital products and services to address pain points.</div>
              <div className="w-full border-b border-slate-200"></div>
              <div className={`uppercase text-[5px] font-semibold mt-1 mb-0.5 w-full border-b ${isDarkMode ? 'border-gray-400' : 'border-gray-600'} text-left leading-[7px] transition-colors duration-300`}>Experience</div>
              <div>
                <div className="text-left text-[4px] font-semibold">Expeditor | Company A | New York, NY | June 2020 - Present</div>
                <ul className="text-[4px] leading-[5px] text-left w-full pb-1 list-inside">
                  <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Led the Pass team on shifts with up to 390 covers and trained staff new to the industry from different cultural backgrounds and skills.</span></li>
                  <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Applied Agile methodologies to gather feedback, iterate and improve systems and productivity.</span></li>
                  <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Managed multiple, conflicting priorities in a high-pressure, fast-paced environment.</span></li>
                </ul>
              </div>
              <div>
                <div className="text-left text-[4px] font-semibold">Intern (Creative) | Company B | New York, NY | June 2019 - June 2020</div>
                <ul className="text-[4px] leading-[5px] text-left w-full pb-1 list-inside">
                  <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Analyzed briefs across 4 client accounts and conducted in-depth customer, product, and client research to identify insights.</span></li>
                  <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Wrote copy for over 100 social media posts and co-created 3 client presentation decks.</span></li>
                  <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Created all copy for 2 client pitches, including scripts and storyboards for filmed advertising.</span></li>
                  <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Delivered results within tight deadlines while working both independently and as part of a team.</span></li>
                </ul>
              </div>
              <div>
                <div className="text-left text-[4px] font-semibold">Intern (Content) | Company C | New York, NY | June 2018 - June 2019</div>
                <ul className="text-[4px] leading-[5px] text-left w-full pb-1 list-inside">
                  <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Conducted over 15 interviews for Sydney Homeless Connect social media and marketing.</span></li>
                  <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Interviewed service clients, service providers, and organizers and delivered 4 written pieces for publication.</span></li>
                  <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Applied detailed editorial feedback to tailor the pieces for the intended audience.</span></li>
                </ul>
              </div>
              <div className={`uppercase text-[5px] font-semibold mt-1 mb-0.5 w-full border-b ${isDarkMode ? 'border-gray-400' : 'border-gray-600'} text-left leading-[7px] transition-colors duration-300`}>Projects</div>
              <div>
                <div className="text-left text-[6px] font-semibold">Expeditor | Company A | New York, NY | June 2020 - Present</div>
                <ul className="text-[4px] leading-[5px] text-left w-full pb-1 list-inside">
                  <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Designed a website to empower Australians to identify transferable skillsets and upskill for jobs of the future.</span></li>
                  <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Conducted 2 surveys and more than 10 interviews across the general public and industry.</span></li>
                  <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Undertook research into public sentiment before, during, and post-Covid lockdown, government initiatives, projected growth industries, and environmental considerations.</span></li>
                </ul>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 z-10 w-full">
              <div className={`relative flex min-h-[3.5rem] flex-row items-center justify-between rounded-lg rounded-t-none ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} py-0 transition-colors duration-300`}>
                <div className="flex max-w-[calc(100%-3rem)] flex-row items-center pl-4">
                  <div className={`overflow-hidden overflow-ellipsis whitespace-nowrap text-base font-semibold leading-6 ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>Mechanical Engineer Student</div>
                </div>
                <div className={`flex h-12 min-w-12 items-center justify-center text-xl ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                  <i className="fas fa-ellipsis-vertical" aria-hidden="true"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Resume Card 3 */}
          <div className={`relative h-64 w-52 overflow-hidden rounded-lg border ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'} transition-colors duration-300`}>
            <div className={`absolute w-full p-4 font-[Merriweather] ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
              <div className="text-[7px] font-semibold">Charles Bloomberg</div>
              <div className="flex w-full justify-center pb-1.5 text-[4px]">New York City, United States • charlesbloomberg@wisc.edu • (621) 799-5548 • in/bloomberg</div>
              <div className="w-full border-b border-slate-200"></div>
              <div className={`uppercase text-[5px] font-semibold mt-1 mb-0.5 w-full border-b ${isDarkMode ? 'border-gray-400' : 'border-gray-600'} text-left leading-[7px] transition-colors duration-300`}>Summary</div>
              <div className="text-[4px] leading-[5px] text-left w-full pb-1 list-inside">The Bachelor of Digital Media student with experience in Surveying and Web Designing, skilled at social media and presentation with peak interest in creating digital products and services to address pain points.</div>
              <div className="w-full border-b border-slate-200"></div>
              <div className={`uppercase text-[5px] font-semibold mt-1 mb-0.5 w-full border-b ${isDarkMode ? 'border-gray-400' : 'border-gray-600'} text-left leading-[7px] transition-colors duration-300`}>Experience</div>
              <div>
                <div className="text-left text-[4px] font-semibold">Expeditor | Company A | New York, NY | June 2020 - Present</div>
                <ul className="text-[4px] leading-[5px] text-left w-full pb-1 list-inside">
                  <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Led the Pass team on shifts with up to 390 covers and trained staff new to the industry from different cultural backgrounds and skills.</span></li>
                  <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Applied Agile methodologies to gather feedback, iterate and improve systems and productivity.</span></li>
                  <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Managed multiple, conflicting priorities in a high-pressure, fast-paced environment.</span></li>
                </ul>
              </div>
              <div>
                <div className="text-left text-[4px] font-semibold">Intern (Creative) | Company B | New York, NY | June 2019 - June 2020</div>
                <ul className="text-[4px] leading-[5px] text-left w-full pb-1 list-inside">
                  <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Analyzed briefs across 4 client accounts and conducted in-depth customer, product, and client research to identify insights.</span></li>
                  <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Wrote copy for over 100 social media posts and co-created 3 client presentation decks.</span></li>
                  <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Created all copy for 2 client pitches, including scripts and storyboards for filmed advertising.</span></li>
                  <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Delivered results within tight deadlines while working both independently and as part of a team.</span></li>
                </ul>
              </div>
              <div>
                <div className="text-left text-[4px] font-semibold">Intern (Content) | Company C | New York, NY | June 2018 - June 2019</div>
                <ul className="text-[4px] leading-[5px] text-left w-full pb-1 list-inside">
                  <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Conducted over 15 interviews for Sydney Homeless Connect social media and marketing.</span></li>
                  <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Interviewed service clients, service providers, and organizers and delivered 4 written pieces for publication.</span></li>
                  <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Applied detailed editorial feedback to tailor the pieces for the intended audience.</span></li>
                </ul>
              </div>
              <div className={`uppercase text-[5px] font-semibold mt-1 mb-0.5 w-full border-b ${isDarkMode ? 'border-gray-400' : 'border-gray-600'} text-left leading-[7px] transition-colors duration-300`}>Projects</div>
              <div>
                <div className="text-left text-[6px] font-semibold">Expeditor | Company A | New York, NY | June 2020 - Present</div>
                <ul className="text-[4px] leading-[5px] text-left w-full pb-1 list-inside">
                  <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Designed a website to empower Australians to identify transferable skillsets and upskill for jobs of the future.</span></li>
                  <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Conducted 2 surveys and more than 10 interviews across the general public and industry.</span></li>
                  <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Undertook research into public sentiment before, during, and post-Covid lockdown, government initiatives, projected growth industries, and environmental considerations.</span></li>
                </ul>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 z-10 w-full">
              <div className={`relative flex min-h-[3.5rem] flex-row items-center justify-between rounded-lg rounded-t-none ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} py-0 transition-colors duration-300`}>
                <div className="flex max-w-[calc(100%-3rem)] flex-row items-center pl-4">
                  <div className={`overflow-hidden overflow-ellipsis whitespace-nowrap text-base font-semibold leading-6 ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>Kolab Resume</div>
                </div>
                <div className={`flex h-12 min-w-12 items-center justify-center text-xl ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                  <i className="fas fa-ellipsis-vertical" aria-hidden="true"></i>
                </div>
              </div>
            </div>
          </div>
        </div>


          <div className="flex flex-row gap-4 mt-8">
            {/* Keep Resume Card 1 */}
            <div className={`relative h-64 w-52 overflow-hidden rounded-lg border ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'} transition-colors duration-300`}>
              <div className={`absolute w-full p-4 font-[Merriweather] ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                <div className="text-[7px] font-semibold">Charles Bloomberg</div>
                <div className="flex w-full justify-center pb-1.5 text-[4px]">New York City, United States • charlesbloomberg@wisc.edu • (621) 799-5548 • in/bloomberg</div>
                <div className="w-full border-b border-slate-200"></div>
                <div className={`uppercase text-[5px] font-semibold mt-1 mb-0.5 w-full border-b ${isDarkMode ? 'border-gray-400' : 'border-gray-600'} text-left leading-[7px] transition-colors duration-300`}>Summary</div>
                <div className="text-[4px] leading-[5px] text-left w-full pb-1 list-inside">The Bachelor of Digital Media student with experience in Surveying and Web Designing, skilled at social media and presentation with peak interest in creating digital products and services to address pain points.</div>
                <div className="w-full border-b border-slate-200"></div>
                <div className={`uppercase text-[5px] font-semibold mt-1 mb-0.5 w-full border-b ${isDarkMode ? 'border-gray-400' : 'border-gray-600'} text-left leading-[7px] transition-colors duration-300`}>Experience</div>
                <div>
                  <div className="text-left text-[4px] font-semibold">Expeditor | Company A | New York, NY | June 2020 - Present</div>
                  <ul className="text-[4px] leading-[5px] text-left w-full pb-1 list-inside">
                    <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Led the Pass team on shifts with up to 390 covers and trained staff new to the industry from different cultural backgrounds and skills.</span></li>
                    <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Applied Agile methodologies to gather feedback, iterate and improve systems and productivity.</span></li>
                    <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Managed multiple, conflicting priorities in a high-pressure, fast-paced environment.</span></li>
                  </ul>
                </div>
                <div>
                  <div className="text-left text-[4px] font-semibold">Intern (Creative) | Company B | New York, NY | June 2019 - June 2020</div>
                  <ul className="text-[4px] leading-[5px] text-left w-full pb-1 list-inside">
                    <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Analyzed briefs across 4 client accounts and conducted in-depth customer, product, and client research to identify insights.</span></li>
                    <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Wrote copy for over 100 social media posts and co-created 3 client presentation decks.</span></li>
                    <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Created all copy for 2 client pitches, including scripts and storyboards for filmed advertising.</span></li>
                    <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Delivered results within tight deadlines while working both independently and as part of a team.</span></li>
                  </ul>
                </div>
                <div>
                  <div className="text-left text-[4px] font-semibold">Intern (Content) | Company C | New York, NY | June 2018 - June 2019</div>
                  <ul className="text-[4px] leading-[5px] text-left w-full pb-1 list-inside">
                    <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Conducted over 15 interviews for Sydney Homeless Connect social media and marketing.</span></li>
                    <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Interviewed service clients, service providers, and organizers and delivered 4 written pieces for publication.</span></li>
                    <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Applied detailed editorial feedback to tailor the pieces for the intended audience.</span></li>
                  </ul>
                </div>
                <div className={`uppercase text-[5px] font-semibold mt-1 mb-0.5 w-full border-b ${isDarkMode ? 'border-gray-400' : 'border-gray-600'} text-left leading-[7px] transition-colors duration-300`}>Projects</div>
                <div>
                  <div className="text-left text-[6px] font-semibold">Expeditor | Company A | New York, NY | June 2020 - Present</div>
                  <ul className="text-[4px] leading-[5px] text-left w-full pb-1 list-inside">
                    <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Designed a website to empower Australians to identify transferable skillsets and upskill for jobs of the future.</span></li>
                    <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Conducted 2 surveys and more than 10 interviews across the general public and industry.</span></li>
                    <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Undertook research into public sentiment before, during, and post-Covid lockdown, government initiatives, projected growth industries, and environmental considerations.</span></li>
                  </ul>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 z-10 w-full">
                <div className={`relative flex min-h-[3.5rem] flex-row items-center justify-between rounded-lg rounded-t-none ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} py-0 transition-colors duration-300`}>
                  <div className="flex max-w-[calc(100%-3rem)] flex-row items-center pl-4">
                    <div className={`overflow-hidden overflow-ellipsis whitespace-nowrap text-base font-semibold leading-6 ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>AI CTO</div>
                  </div>
                  <div className={`flex h-12 min-w-12 items-center justify-center text-xl ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                    <i className="fas fa-ellipsis-vertical" aria-hidden="true"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* Keep Resume Card 2 */}
            <div className={`relative h-64 w-52 overflow-hidden rounded-lg border ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'} transition-colors duration-300`}>
              <div className={`absolute w-full p-4 font-[Merriweather] ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                <div className="text-[7px] font-semibold">Charles Bloomberg</div>
                <div className="flex w-full justify-center pb-1.5 text-[4px]">New York City, United States • charlesbloomberg@wisc.edu • (621) 799-5548 • in/bloomberg</div>
                <div className="w-full border-b border-slate-200"></div>
                <div className={`uppercase text-[5px] font-semibold mt-1 mb-0.5 w-full border-b ${isDarkMode ? 'border-gray-400' : 'border-gray-600'} text-left leading-[7px] transition-colors duration-300`}>Summary</div>
                <div className="text-[4px] leading-[5px] text-left w-full pb-1 list-inside">The Bachelor of Digital Media student with experience in Surveying and Web Designing, skilled at social media and presentation with peak interest in creating digital products and services to address pain points.</div>
                <div className="w-full border-b border-slate-200"></div>
                <div className={`uppercase text-[5px] font-semibold mt-1 mb-0.5 w-full border-b ${isDarkMode ? 'border-gray-400' : 'border-gray-600'} text-left leading-[7px] transition-colors duration-300`}>Experience</div>
                <div>
                  <div className="text-left text-[4px] font-semibold">Expeditor | Company A | New York, NY | June 2020 - Present</div>
                  <ul className="text-[4px] leading-[5px] text-left w-full pb-1 list-inside">
                    <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Led the Pass team on shifts with up to 390 covers and trained staff new to the industry from different cultural backgrounds and skills.</span></li>
                    <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Applied Agile methodologies to gather feedback, iterate and improve systems and productivity.</span></li>
                    <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Managed multiple, conflicting priorities in a high-pressure, fast-paced environment.</span></li>
                  </ul>
                </div>
                <div>
                  <div className="text-left text-[4px] font-semibold">Intern (Creative) | Company B | New York, NY | June 2019 - June 2020</div>
                  <ul className="text-[4px] leading-[5px] text-left w-full pb-1 list-inside">
                    <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Analyzed briefs across 4 client accounts and conducted in-depth customer, product, and client research to identify insights.</span></li>
                    <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Wrote copy for over 100 social media posts and co-created 3 client presentation decks.</span></li>
                    <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Created all copy for 2 client pitches, including scripts and storyboards for filmed advertising.</span></li>
                    <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Delivered results within tight deadlines while working both independently and as part of a team.</span></li>
                  </ul>
                </div>
                <div>
                  <div className="text-left text-[4px] font-semibold">Intern (Content) | Company C | New York, NY | June 2018 - June 2019</div>
                  <ul className="text-[4px] leading-[5px] text-left w-full pb-1 list-inside">
                    <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Conducted over 15 interviews for Sydney Homeless Connect social media and marketing.</span></li>
                    <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Interviewed service clients, service providers, and organizers and delivered 4 written pieces for publication.</span></li>
                    <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Applied detailed editorial feedback to tailor the pieces for the intended audience.</span></li>
                  </ul>
                </div>
                <div className={`uppercase text-[5px] font-semibold mt-1 mb-0.5 w-full border-b ${isDarkMode ? 'border-gray-400' : 'border-gray-600'} text-left leading-[7px] transition-colors duration-300`}>Projects</div>
                <div>
                  <div className="text-left text-[6px] font-semibold">Expeditor | Company A | New York, NY | June 2020 - Present</div>
                  <ul className="text-[4px] leading-[5px] text-left w-full pb-1 list-inside">
                    <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Designed a website to empower Australians to identify transferable skillsets and upskill for jobs of the future.</span></li>
                    <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Conducted 2 surveys and more than 10 interviews across the general public and industry.</span></li>
                    <li className="-pl-2 flex flex-row pb-[1px]"><span className="px-1">•</span><span>Undertaken research into public sentiment before, during, and post-Covid lockdown, government initiatives, projected growth industries, and environmental conditions.</span></li>
                  </ul>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 z-10 w-full">
                <div className={`relative flex min-h-[3.5rem] flex-row items-center justify-between rounded-lg rounded-t-none ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} py-0 transition-colors duration-300`}>
                  <div className="flex max-w-[calc(100%-3rem)] flex-row items-center pl-4">
                    <div className={`overflow-hidden overflow-ellipsis whitespace-nowrap text-base font-semibold leading-6 ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>Director of Content Marketing</div>
                  </div>
                  <div className={`flex h-12 min-w-12 items-center justify-center text-xl ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                    <i className="fas fa-ellipsis-vertical" aria-hidden="true"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

        {/* Add Section Button */}
        <div className="py-7 text-left text-xs font-bold uppercase">
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
