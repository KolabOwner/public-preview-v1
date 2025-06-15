'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/components/ui/theme-provider';
import { collection, getDocs, query, where, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from "@/lib/core/auth/firebase-config";

interface Resume {
  id: string;
  title: string;
  isTargeted?: boolean;
}

export default function ResumeEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const resumeId = params.resumeId as string;
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showResumeDropdown, setShowResumeDropdown] = useState(false);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [currentResume, setCurrentResume] = useState<Resume | null>(null);
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const resumeDropdownRef = useRef<HTMLDivElement>(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const [resumeData, setResumeData] = useState<any>(null);
  const [tabVisibility, setTabVisibility] = useState<Record<string, boolean>>(() => {
    // Load saved preferences from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('resumeTabVisibility');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Error parsing saved tab visibility:', e);
        }
      }
    }
    
    // Default visibility
    return {
      contact: true,
      experience: true,
      education: true,
      skills: true,
      projects: true,
      involvement: true,
      coursework: true,
      certifications: true,
      summary: true,
      'cover-letter': true,
      preview: true,
    };
  });

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (resumeDropdownRef.current && !resumeDropdownRef.current.contains(event.target as Node)) {
        setShowResumeDropdown(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch resumes for dropdown
  useEffect(() => {
    const fetchResumes = async () => {
      if (!user) return;

      try {
        const resumesQuery = query(
          collection(db, 'resumes'),
          where('userId', '==', user.uid),
          orderBy('updatedAt', 'desc')
        );

        const querySnapshot = await getDocs(resumesQuery);
        const resumeData: Resume[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          resumeData.push({
            id: doc.id,
            title: data.title || 'Untitled Resume',
            isTargeted: data.isTargeted || false,
          });
        });

        setResumes(resumeData);
      } catch (error) {
        console.error('Error fetching resumes:', error);
      }
    };

    fetchResumes();
  }, [user]);

  // Fetch current resume details
  useEffect(() => {
    const fetchCurrentResume = async () => {
      if (!resumeId || !user) return;

      try {
        const resumeDoc = await getDoc(doc(db, 'resumes', resumeId));
        if (resumeDoc.exists()) {
          const data = resumeDoc.data();
          setCurrentResume({
            id: resumeDoc.id,
            title: data.title || 'Untitled Resume',
            isTargeted: data.isTargeted || false,
          });
          
          // Set resume data for content detection
          setResumeData(data.parsedData || {});
        }
      } catch (error) {
        console.error('Error fetching current resume:', error);
      }
    };

    fetchCurrentResume();
  }, [resumeId, user]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleResumeSwitch = (newResumeId: string) => {
    // Get the current section from the pathname
    const section = pathname.split('/').pop() || 'contact';
    // Navigate to the same section in the new resume
    router.push(`/dashboard/resumes/${newResumeId}/${section}`);
    setShowResumeDropdown(false);
  };

  // Function to check if a section has content
  const sectionHasContent = (section: string): boolean => {
    if (!resumeData) return false;
    
    switch (section) {
      case 'contact':
        return resumeData.contactInfo && (
          resumeData.contactInfo.fullName ||
          resumeData.contactInfo.email ||
          resumeData.contactInfo.phone
        );
      case 'experience':
        return resumeData.experiences && resumeData.experiences.length > 0;
      case 'education':
        return resumeData.education && resumeData.education.length > 0;
      case 'skills':
        return resumeData.skillCategories && resumeData.skillCategories.length > 0;
      case 'projects':
        return resumeData.projects && resumeData.projects.length > 0;
      case 'involvement':
        return resumeData.involvements && resumeData.involvements.length > 0;
      case 'coursework':
        return resumeData.coursework && resumeData.coursework.length > 0;
      case 'certifications':
        return resumeData.certifications && resumeData.certifications.length > 0;
      case 'summary':
        return resumeData.summary && resumeData.summary.length > 0;
      case 'preview':
        return true; // Always show preview
      case 'cover-letter':
        return true; // Always show cover letter option
      default:
        return false;
    }
  };

  // Toggle tab visibility
  const toggleTabVisibility = (tab: string) => {
    setTabVisibility(prev => {
      const newVisibility = {
        ...prev,
        [tab]: !prev[tab]
      };
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('resumeTabVisibility', JSON.stringify(newVisibility));
      }
      
      return newVisibility;
    });
  };

  // Resume editor tabs
  const allEditorTabs = [
    { label: 'Contact', href: `/dashboard/resumes/${resumeId}/contact`, key: 'contact' },
    { label: 'Experience', href: `/dashboard/resumes/${resumeId}/experience`, key: 'experience' },
    { label: 'Education', href: `/dashboard/resumes/${resumeId}/education`, key: 'education' },
    { label: 'Projects', href: `/dashboard/resumes/${resumeId}/projects`, key: 'projects' },
    { label: 'Involvement', href: `/dashboard/resumes/${resumeId}/involvement`, key: 'involvement' },
    { label: 'Skills', href: `/dashboard/resumes/${resumeId}/skills`, key: 'skills' },
    { label: 'Coursework', href: `/dashboard/resumes/${resumeId}/coursework`, key: 'coursework' },
    { label: 'Certifications', href: `/dashboard/resumes/${resumeId}/certifications`, key: 'certifications' },
    { label: 'Summary', href: `/dashboard/resumes/${resumeId}/summary`, key: 'summary' },
    { label: 'Cover Letter', href: `/dashboard/resumes/${resumeId}/cover-letter`, key: 'cover-letter' },
    { label: 'Preview', href: `/dashboard/resumes/${resumeId}/preview`, key: 'preview' },
  ];

  // Filter tabs based on content and visibility
  const editorTabs = allEditorTabs.filter(tab => !['preview', 'cover-letter'].includes(tab.key));
  const actionTabs = allEditorTabs.filter(tab => ['preview', 'cover-letter'].includes(tab.key));
  
  const visibleTabs = editorTabs.filter(tab => {
    // Always show contact
    if (tab.key === 'contact') return true;
    
    // Show tab if it's enabled AND has content
    return tabVisibility[tab.key] && sectionHasContent(tab.key);
  });

  const hiddenTabs = editorTabs.filter(tab => {
    // Never hide contact
    if (tab.key === 'contact') return false;
    
    // Tab is hidden if disabled OR has no content
    return !tabVisibility[tab.key] || !sectionHasContent(tab.key);
  });

  // Find if we're on the main resume page
  const isMainPage = pathname === `/dashboard/resumes/${resumeId}`;

  return (
    <main className="sm:h-full lg:h-auto px-6 lg:px-8 xl:px-10 pt-2 pb-4 lg:pb-6">
      {/* Desktop Navigation */}
      <div className="hidden sm:block">

        {/* Centered Tab Navigation */}
        <div className="flex justify-center mb-6">
          <div className="flex flex-row flex-wrap gap-1 justify-center">
            {/* Resume Selector Group */}
            <div className="relative inline-flex items-center whitespace-nowrap rounded-lg border border-slate-200 dark:border-navy-700 w-fit h-fit bg-white/80 dark:bg-navy-800/90 backdrop-blur-sm px-1 py-1 shadow-lg shadow-slate-200/50 dark:shadow-navy-900/50">
              <div className="relative" ref={resumeDropdownRef}>
                <button
                  onClick={() => setShowResumeDropdown(!showResumeDropdown)}
                  className="rounded inline-flex items-center gap-1.5 group relative text-[11px] lg:text-xs leading-3 lg:leading-4 h-6 lg:h-7 px-2 lg:px-3 transition-all text-gray-300 hover:text-gray-100 hover:bg-surface-2/80"
                >
                <span className="font-semibold uppercase tracking-wide truncate max-w-[150px] text-[10px] lg:text-[11px]">
                  {currentResume ? (
                    <>
                      {currentResume.isTargeted && '[TARGETED] '}
                      {currentResume.title}
                    </>
                  ) : (
                    'Loading...'
                  )}
                </span>
                <i className={`fas fa-chevron-${showResumeDropdown ? 'up' : 'down'} text-[10px] transition-transform`}></i>
              </button>

              {/* Resume Dropdown Menu */}
              {showResumeDropdown && (
                <div className="absolute top-full left-0 mt-2 min-w-[280px] max-w-sm bg-white dark:bg-navy-800 rounded-lg border border-slate-200 dark:border-navy-700 shadow-2xl shadow-slate-400/20 dark:shadow-navy-900/50 backdrop-blur-sm z-50">
                  <div className="py-2 max-h-96 overflow-y-auto">
                    {resumes.map((resume) => (
                      <button
                        key={resume.id}
                        onClick={() => handleResumeSwitch(resume.id)}
                        className={`w-full text-left px-4 py-2.5 hover:bg-surface-3/50 transition-colors flex items-center gap-2 ${
                          resume.id === resumeId ? 'bg-surface-3/30' : ''
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-200 truncate">
                            {resume.isTargeted && (
                              <span className="text-xs uppercase text-rezi-blue-400 mr-1">[TARGETED]</span>
                            )}
                            {resume.title}
                          </div>
                        </div>
                        {resume.id === resumeId && (
                          <i className="fas fa-check text-rezi-blue-500 text-sm"></i>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-surface-2-stroke py-2">
                    <Link
                      href="/dashboard/resumes"
                      className="w-full text-left px-4 py-2.5 hover:bg-surface-3/50 transition-colors flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200"
                    >
                      <i className="fas fa-arrow-left text-xs"></i>
                      <span>Back to All Resumes</span>
                    </Link>
                  </div>
                </div>
              )}
              </div>
            </div>

            {/* Editor Tabs Group */}
            <div className="relative inline-flex items-center whitespace-nowrap rounded-lg border border-slate-200 dark:border-navy-700 w-fit h-fit bg-white/80 dark:bg-navy-800/90 backdrop-blur-sm px-1 py-1 gap-1 shadow-lg shadow-slate-200/50 dark:shadow-navy-900/50">
            {visibleTabs.map((tab) => {
              const isActive = pathname === tab.href || (isMainPage && tab.label === 'Contact');
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`rounded-md inline-flex items-center gap-1 disabled:bg-input-bg-disabled group relative text-xs leading-4 h-6 px-2 ${
                    isActive 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30' 
                      : 'focus:bg-slate-100 dark:focus:bg-navy-700'
                  } cursor-pointer`}
                >
                  <div className="w-full overflow-hidden">
                    <p className="font-semibold uppercase truncate">{tab.label}</p>
                  </div>
                </Link>
              );
            })}

            {/* More Menu for Hidden Tabs */}
            {hiddenTabs.length > 0 && (
              <div className="relative" ref={moreMenuRef}>
                <button
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className="rounded-md inline-flex items-center gap-1 disabled:bg-input-bg-disabled group relative text-xs leading-4 h-6 px-2 focus:bg-tab-focus hover:bg-tab-hover dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 cursor-pointer"
                  title="More sections"
                >
                  <i className="fas fa-ellipsis-h"></i>
                </button>

                {/* More Menu Dropdown */}
                {showMoreMenu && (
                  <div className="absolute top-full right-0 mt-2 min-w-[280px] bg-white dark:bg-navy-800 rounded-lg border border-slate-200 dark:border-navy-700 shadow-2xl shadow-slate-400/20 dark:shadow-navy-900/50 backdrop-blur-sm z-50">
                    <div className="p-3 border-b border-surface-2-stroke">
                      <h3 className="text-sm font-semibold text-gray-300">Additional Sections</h3>
                      <p className="text-xs text-gray-500 mt-1">Click to navigate or toggle visibility</p>
                    </div>
                    
                    <div className="py-2 max-h-96 overflow-y-auto">
                      {allEditorTabs.filter(tab => !['contact', 'preview', 'cover-letter'].includes(tab.key)).map((tab) => {
                        const hasContent = sectionHasContent(tab.key);
                        const isEnabled = tabVisibility[tab.key];
                        const isHidden = hiddenTabs.find(t => t.key === tab.key);
                        
                        return (
                          <div
                            key={tab.key}
                            className="flex items-center justify-between px-4 py-2.5 hover:bg-surface-3/50 transition-colors"
                          >
                            <Link
                              href={tab.href}
                              className="flex-1 flex items-center gap-2"
                              onClick={() => setShowMoreMenu(false)}
                            >
                              <span className={`text-sm font-medium ${hasContent ? 'text-gray-200' : 'text-gray-500'}`}>
                                {tab.label}
                              </span>
                              {hasContent && (
                                <span className="text-xs text-green-500">
                                  <i className="fas fa-check-circle"></i>
                                </span>
                              )}
                            </Link>
                            
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isEnabled}
                                onChange={() => toggleTabVisibility(tab.key)}
                                className="w-4 h-4 text-rezi-blue-600 bg-surface-1 border-gray-600 rounded focus:ring-rezi-blue-500 focus:ring-2"
                              />
                              <span className="ml-2 text-xs text-gray-400">Show</span>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
            </div>

            {/* Preview/Action Tabs Group */}
            <div className="relative inline-flex items-center whitespace-nowrap rounded-lg border border-slate-200 dark:border-navy-700 w-fit h-fit bg-white/80 dark:bg-navy-800/90 backdrop-blur-sm px-1 py-1 gap-1 shadow-lg shadow-slate-200/50 dark:shadow-navy-900/50">
              {actionTabs.map((tab) => {
                const isActive = pathname === tab.href;
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={`rounded-md inline-flex items-center gap-1 disabled:bg-input-bg-disabled group relative text-xs leading-4 h-6 px-2 transition-all ${
                      isActive 
                        ? 'bg-rezi-blue-600 text-neutral-0' 
                        : 'focus:bg-tab-focus hover:bg-tab-hover dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                    } cursor-pointer`}
                  >
                    <div className="w-full overflow-hidden">
                      <p className="font-semibold uppercase truncate">
                        {tab.label === 'Preview' ? 'Finish up & Preview' : tab.label}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="sm:hidden">
        {/* Mobile Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold text-white truncate max-w-[60%]">
            {currentResume?.title || 'Resume Editor'}
          </h1>

          {/* Mobile User Button */}
          {user && (
            <button
              type="button"
              className="relative flex items-center justify-center font-bold uppercase focus:ring-0 focus:outline-none h-8 w-8 !text-xs !font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-md shadow-blue-500/30"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <span>{user.displayName?.[0] || user.email?.[0] || 'U'}</span>
            </button>
          )}
        </div>

        {/* Mobile Tab Navigation - Horizontally Scrollable */}
        <div className="overflow-x-auto pb-4 mb-4 -mx-6 px-6">
          <div className="flex flex-row gap-1 w-max">
            {/* Mobile Resume Selector Group */}
            <div className="relative inline-flex items-center whitespace-nowrap rounded-lg border border-slate-200 dark:border-navy-700 w-fit h-fit bg-white/80 dark:bg-navy-800/90 backdrop-blur-sm px-0.5 py-0.5 shadow-lg shadow-slate-200/50 dark:shadow-navy-900/50">
              <button
                onClick={() => setShowResumeDropdown(!showResumeDropdown)}
                className="rounded inline-flex items-center gap-1 whitespace-nowrap group relative text-[10px] leading-3 h-5 px-2 transition-all text-gray-300 hover:text-gray-100"
              >
              <span className="font-semibold uppercase text-[9px] truncate max-w-[100px]">
                {currentResume ? (
                  <>
                    {currentResume.isTargeted && '[T] '}
                    {currentResume.title}
                  </>
                ) : (
                  'Loading...'
                )}
              </span>
              <i className={`fas fa-chevron-${showResumeDropdown ? 'up' : 'down'} text-[8px]`}></i>
              </button>
            </div>

            {/* Mobile Editor Tabs Group */}
            <div className="relative inline-flex items-center whitespace-nowrap rounded-lg border border-slate-200 dark:border-navy-700 w-fit h-fit bg-white/80 dark:bg-navy-800/90 backdrop-blur-sm px-0.5 py-0.5 gap-0.5 shadow-lg shadow-slate-200/50 dark:shadow-navy-900/50">
            {visibleTabs.map((tab) => {
              const isActive = pathname === tab.href || (isMainPage && tab.label === 'Contact');
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`rounded-md inline-flex items-center gap-1 whitespace-nowrap group relative text-xs leading-4 h-6 px-2 transition-all ${
                    isActive 
                      ? 'bg-rezi-blue-600 text-neutral-0' 
                      : 'focus:bg-tab-focus hover:bg-tab-hover dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                  } cursor-pointer`}
                >
                  <div className="w-full overflow-hidden">
                    <p className="font-semibold uppercase truncate">{tab.label}</p>
                  </div>
                </Link>
              );
            })}
            
            {/* Mobile More Button */}
            {hiddenTabs.length > 0 && (
              <button
                onClick={() => setShowMoreMenu(true)}
                className="rounded-md inline-flex items-center gap-1 whitespace-nowrap group relative text-xs leading-4 h-6 px-2 focus:bg-tab-focus hover:bg-tab-hover dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 cursor-pointer"
              >
                <i className="fas fa-ellipsis-h text-[11px]"></i>
              </button>
            )}
            </div>

            {/* Mobile Action Tabs Group */}
            <div className="relative inline-flex items-center whitespace-nowrap rounded-lg border border-slate-200 dark:border-navy-700 w-fit h-fit bg-white/80 dark:bg-navy-800/90 backdrop-blur-sm px-0.5 py-0.5 gap-0.5 shadow-lg shadow-slate-200/50 dark:shadow-navy-900/50">
              {actionTabs.map((tab) => {
                const isActive = pathname === tab.href;
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={`rounded-md inline-flex items-center gap-1 whitespace-nowrap group relative text-xs leading-4 h-6 px-2 transition-all ${
                      isActive 
                        ? 'bg-rezi-blue-600 text-neutral-0' 
                        : 'focus:bg-tab-focus hover:bg-tab-hover dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                    } cursor-pointer`}
                  >
                    <div className="w-full overflow-hidden">
                      <p className="font-semibold uppercase truncate">
                        {tab.label === 'Preview' ? 'Preview' : tab.label}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Resume Dropdown */}
        {showResumeDropdown && (
          <div className="fixed inset-0 bg-black/50 z-50 sm:hidden" onClick={() => setShowResumeDropdown(false)}>
            <div className="absolute bottom-0 left-0 right-0 bg-surface-2 rounded-t-2xl border-t border-surface-2-stroke p-4 max-h-[70vh]" onClick={(e) => e.stopPropagation()}>
              <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-4"></div>

              <h3 className="text-sm font-semibold text-gray-300 mb-3">Switch Resume</h3>

              <div className="space-y-1 overflow-y-auto max-h-[50vh]">
                {resumes.map((resume) => (
                  <button
                    key={resume.id}
                    onClick={() => handleResumeSwitch(resume.id)}
                    className={`w-full text-left px-3 py-3 rounded-lg hover:bg-surface-3/50 transition-colors flex items-center gap-2 ${
                      resume.id === resumeId ? 'bg-surface-3/30' : ''
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-200">
                        {resume.isTargeted && (
                          <span className="text-xs uppercase text-rezi-blue-400 mr-1">[TARGETED]</span>
                        )}
                        {resume.title}
                      </div>
                    </div>
                    {resume.id === resumeId && (
                      <i className="fas fa-check text-rezi-blue-500 text-sm"></i>
                    )}
                  </button>
                ))}
              </div>

              <div className="border-t border-surface-2-stroke mt-3 pt-3">
                <Link
                  href="/dashboard/resumes"
                  className="w-full text-left px-3 py-3 rounded-lg hover:bg-surface-3/50 transition-colors flex items-center gap-2 text-sm text-gray-400"
                >
                  <i className="fas fa-arrow-left text-xs"></i>
                  <span>Back to All Resumes</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Mobile User Menu Modal */}
        {showUserMenu && (
          <div className="fixed inset-0 bg-black/50 z-50 sm:hidden" onClick={() => setShowUserMenu(false)}>
            <div className="absolute bottom-0 left-0 right-0 bg-surface-2 rounded-t-2xl border-t border-surface-2-stroke p-4" onClick={(e) => e.stopPropagation()}>
              <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-4"></div>

              <div className="space-y-2">
                <div className="text-sm text-gray-500 px-2 pb-2 border-b border-surface-2-stroke">
                  {user?.email}
                </div>

                <button
                  className="w-full text-left px-2 py-3 rounded-lg hover:bg-surface-3/50 flex items-center gap-3"
                  onClick={() => {
                    toggleTheme();
                    setShowUserMenu(false);
                  }}
                >
                  <i className="fad fa-palette w-5"></i>
                  <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>

                <button
                  className="w-full text-left px-2 py-3 rounded-lg hover:bg-surface-3/50 flex items-center gap-3 text-red-500"
                  onClick={handleLogout}
                >
                  <i className="fad fa-right-from-bracket w-5"></i>
                  <span>Log out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile More Menu Modal */}
        {showMoreMenu && (
          <div className="fixed inset-0 bg-black/50 z-50 sm:hidden" onClick={() => setShowMoreMenu(false)}>
            <div className="absolute bottom-0 left-0 right-0 bg-surface-2 rounded-t-2xl border-t border-surface-2-stroke p-4 max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
              <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-4"></div>

              <h3 className="text-sm font-semibold text-gray-300 mb-3">Additional Sections</h3>
              <p className="text-xs text-gray-500 mb-4">Tap to navigate or toggle visibility</p>

              <div className="space-y-2 overflow-y-auto max-h-[60vh]">
                {allEditorTabs.filter(tab => !['contact', 'preview', 'cover-letter'].includes(tab.key)).map((tab) => {
                  const hasContent = sectionHasContent(tab.key);
                  const isEnabled = tabVisibility[tab.key];
                  
                  return (
                    <div
                      key={tab.key}
                      className="flex items-center justify-between p-3 rounded-lg bg-surface-3/30"
                    >
                      <Link
                        href={tab.href}
                        className="flex-1 flex items-center gap-2"
                        onClick={() => setShowMoreMenu(false)}
                      >
                        <span className={`text-sm font-medium ${hasContent ? 'text-gray-200' : 'text-gray-500'}`}>
                          {tab.label}
                        </span>
                        {hasContent && (
                          <span className="text-xs text-green-500">
                            <i className="fas fa-check-circle"></i>
                          </span>
                        )}
                      </Link>
                      
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={() => toggleTabVisibility(tab.key)}
                          className="w-4 h-4 text-rezi-blue-600 bg-surface-1 border-gray-600 rounded focus:ring-rezi-blue-500"
                        />
                        <span className="ml-2 text-xs text-gray-400">Show</span>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main content area with responsive max width for optimal readability */}
      <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto">
        {children}
      </div>
    </main>
  );
}