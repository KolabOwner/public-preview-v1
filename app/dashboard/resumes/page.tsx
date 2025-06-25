'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/components/ui/theme-provider';
import { useUserUsage } from '@/hooks/use-user-usage';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from "@/lib/features/auth/firebase-config";
import ResumeGridCard from '@/components/resume/resume-grid-card';
import ResumeListView from '@/components/resume/resume-list-view';
import NotificationsSidebar from '@/components/ui/notifications-sidebar';
import dynamic from 'next/dynamic';

// Dynamic import with no SSR to fix serialization error
const CreateResumeModal = dynamic(
  () => import('@/components/resume/modals/create-resume-modal'),
  { ssr: false }
);

const UpgradeModal = dynamic(
  () => import('@/components/resume/modals/upgrade-modal'),
  { ssr: false }
);

interface Resume {
  id: string;
  title: string;
  lastUpdated: string;
  createdAt: string;
  isTargeted?: boolean;
}

export default function ResumesPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'created' | 'updated'>('created');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { usage, loading: usageLoading, canDownloadPdf } = useUserUsage();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setShowThemeMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
          lastUpdated: data.updatedAt,
          createdAt: data.createdAt,
          isTargeted: data.isTargeted || false,
        });
      });

      setResumes(resumeData);
    } catch (error) {
      console.error('Error fetching resumes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, [user]);

  const toggleViewMode = () => {
    setViewMode(viewMode === 'grid' ? 'list' : 'grid');
  };

  const toggleSortBy = () => {
    setSortBy(sortBy === 'created' ? 'updated' : 'created');
  };

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

  // Create resume card component
  const CreateResumeCard = () => {
    const isLocked = !canDownloadPdf();
    
    return (
      <div className="">
        <div
          className={`flex w-[calc(50vw_-_25px)] items-center justify-center rounded-xl border-2 border-dashed xs:h-48 sm:h-[290px] md:w-60 border-slate-300 dark:border-navy-600 bg-white/50 dark:bg-navy-800/30 backdrop-blur-sm p-4 transition-colors ${
            isLocked 
              ? 'cursor-not-allowed opacity-50' 
              : 'cursor-pointer hover:border-blue-400 dark:hover:border-blue-500'
          }`}
          onClick={() => !isLocked && setShowCreateModal(true)}
        >
          <div className="relative flex w-[calc(50vw_-_25px)] items-center justify-center xs:h-48 sm:h-[290px] md:w-60 flex-col gap-2">
            {isLocked ? (
              <>
                <i className="fad fa-lock text-2xl text-slate-600 dark:text-slate-300" aria-hidden="true"></i>
                <div className="line-clamp-3 text-center text-base font-semibold text-slate-600 dark:text-slate-300">Limit Reached</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 text-center px-4">
                  {usage.pdfGenerations}/{usage.maxPdfGenerations} resumes used
                </div>
              </>
            ) : (
              <>
                <i className="fad fa-plus text-2xl text-slate-600 dark:text-slate-300" aria-hidden="true"></i>
                <div className="line-clamp-3 text-center text-base font-semibold text-slate-600 dark:text-slate-300">Create new resume</div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading || usageLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5b7cfd]"></div>
          <div className="absolute inset-0 rounded-full bg-[#5b7cfd]/20 blur-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center px-0 pt-16 lg:pt-0 lg:px-16 min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-navy-950 dark:via-navy-900 dark:to-slate-900">
      <div className="relative w-full max-w-full gap-4 flex min-h-[calc(100dvh_-_64px)] w-full flex-col justify-start gap-4 px-4 md:px-6 lg:min-h-[calc(100dvh_-_16px)] lg:max-w-[824px] lg:px-6 xl1:max-w-[968px] xl:max-w-[1248px] xl:px-8" id="layout_full_screen">
        <main className="sm:h-full lg:h-auto">
          {/* Tab navigation */}
          <div className="hidden w-full flex-row items-center justify-between self-stretch sm:flex">
            <div className="relative inline-flex items-center whitespace-nowrap rounded-lg border border-slate-200 dark:border-navy-700 w-fit h-fit bg-white/80 dark:bg-navy-800/90 backdrop-blur-sm px-1 py-1 gap-1 my-6 shadow-lg shadow-slate-200/50 dark:shadow-navy-900/50">
              <div
                className="rounded-md inline-flex items-center gap-1 disabled:bg-input-bg-disabled group relative text-xs leading-4 h-6 px-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white cursor-pointer shadow-md shadow-blue-500/30"
                role="tab"
              >
                <div className="w-full overflow-hidden">
                  <p className="font-semibold uppercase truncate">Resumes</p>
                </div>
              </div>
              <div
                className="rounded-md inline-flex items-center gap-1 disabled:bg-input-bg-disabled group relative text-xs leading-4 h-6 px-2 text-gray-700 dark:text-gray-300 focus:bg-slate-100 dark:focus:bg-navy-700 hover:text-gray-900 dark:hover:text-gray-100 cursor-pointer"
                role="tab"
              >
                <div className="w-full overflow-hidden">
                  <p className="font-semibold uppercase truncate">Cover Letters</p>
                </div>
              </div>
              <div
                className="rounded-md inline-flex items-center gap-1 disabled:bg-input-bg-disabled group relative text-xs leading-4 h-6 px-2 text-gray-700 dark:text-gray-300 focus:bg-slate-100 dark:focus:bg-navy-700 hover:text-gray-900 dark:hover:text-gray-100 cursor-pointer"
                role="tab"
              >
                <div className="w-full overflow-hidden">
                  <p className="font-semibold uppercase truncate">Resignation Letters</p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="hidden flex-row items-center justify-between gap-4 lg:flex">
              {/* Notification bell */}
              <div 
                className="relative flex cursor-pointer items-center justify-center text-center font-extrabold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                onClick={() => setShowNotifications(true)}
              >
                <i className="fad fa-bell fa-lg" aria-hidden="true"></i>
                <div className="absolute -right-3 -top-4 flex h-4 w-4 select-none items-center justify-center rounded-full border-2 border-white dark:border-navy-800 bg-red-600 p-2 text-xs font-normal leading-4 text-white">1</div>
              </div>

              {/* User Menu */}
              {user && (
                <div className="hidden lg:!block relative p-3 lg:p-0" ref={userMenuRef}>
                  <div className="flex cursor-pointer flex-row items-center justify-end gap-1 px-0">
                    <button
                      type="button"
                      className="relative flex items-center justify-center font-bold uppercase focus:ring-0 focus:outline-none lg-h-8 flex h-6 !min-h-6 w-6 items-center justify-center !text-xs !font-semibold leading-4 lg:!min-h-8 lg:w-8 lg:!text-base lg:!leading-6 disabled:bg-input-bg-disabled disabled:text-input-disabled disabled:cursor-not-allowed border-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-2 py-1 min-h-8 leading-4 rounded-md text-xs !rounded-full shadow-md shadow-blue-500/30"
                      onClick={() => setShowUserMenu(!showUserMenu)}
                    >
                      <span className="px-1">{user.displayName?.[0] || user.email?.[0] || 'K'}</span>
                    </button>
                    <div className="hidden h-5 w-5 items-center justify-center lg:flex">
                      <i className="fas fa-caret-down text-base" aria-hidden="true"></i>
                    </div>
                  </div>

                  {showUserMenu && (
                    <div className="bg-white dark:bg-navy-800 rounded-lg border border-slate-200 dark:border-navy-700 absolute flex-col items-start py-2 shadow-2xl shadow-slate-400/20 dark:shadow-navy-900/50 backdrop-blur-sm z-50 min-w-28 max-w-72 left-0" style={{ width: 'fit-content', top: '34px' }}>
                      <div className="relative pointer-events-none flex flex-col justify-between self-stretch px-4 py-1.5 sm:py-1 cursor-default">
                        <div className="flex flex-row items-start gap-2 self-stretch justify-between p-0 w-full">
                          <div className="flex flex-row items-start gap-2">
                            <div></div>
                            <div className="flex flex-col">
                             <div className="select-none !text-gray-500 dark:!text-gray-400 w-full select-none overflow-hidden text-ellipsis whitespace-nowrap text-base leading-6 text-gray-900 dark:text-gray-100" title={user.email ?? undefined}>
                              {user.email ?? ''}
                            </div>
                            </div>
                          </div>
                          <div></div>
                        </div>
                      </div>
                      <div className="w-full border-t border-surface-2-stroke mt-2 mb-2"></div>

                      <div className="relative flex flex-col justify-between self-stretch px-4 py-1.5 sm:py-1 cursor-pointer sm:hover:bg-menu-item-hover">
                        <div className="flex flex-row items-start gap-2 self-stretch justify-between p-0 w-full">
                          <div className="flex flex-row items-start gap-2">
                            <div>
                              <div className="flex h-6 min-w-6 items-center justify-center">
                                <i className="fad fa-user text-left text-base text-gray-900 dark:text-gray-100" aria-hidden="true"></i>
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <div className="w-full select-none overflow-hidden text-ellipsis whitespace-nowrap text-base leading-6 text-gray-900 dark:text-gray-100" title="Account">Account</div>
                            </div>
                          </div>
                          <div></div>
                        </div>
                      </div>


                      <div className="relative flex flex-col justify-between self-stretch px-4 py-1.5 sm:py-1 cursor-pointer sm:hover:bg-menu-item-hover">
                        <div className="flex flex-row items-start gap-2 self-stretch justify-between p-0 w-full">
                          <div className="flex flex-row items-start gap-2">
                            <div>
                              <div className="flex h-6 min-w-6 items-center justify-center">
                                <i className="fad fa-file-lines text-left text-base text-gray-900 dark:text-gray-100" aria-hidden="true"></i>
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <div className="w-full select-none overflow-hidden text-ellipsis whitespace-nowrap text-base leading-6 text-gray-900 dark:text-gray-100" title="User Guides">User Guides</div>
                            </div>
                          </div>
                          <div></div>
                        </div>
                      </div>

                      <div className="relative flex flex-col justify-between self-stretch px-4 py-1.5 sm:py-1 cursor-pointer sm:hover:bg-menu-item-hover" ref={themeMenuRef}>
                        <div className="flex flex-row items-start gap-2 self-stretch justify-between p-0 w-full" onClick={() => setShowThemeMenu(!showThemeMenu)}>
                          <div className="flex flex-row items-start gap-2">
                            <div>
                              <div className="flex h-6 min-w-6 items-center justify-center">
                                <i className="fad fa-palette text-left text-base text-gray-900 dark:text-gray-100" aria-hidden="true"></i>
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <div className="w-full select-none overflow-hidden text-ellipsis whitespace-nowrap text-base leading-6 text-gray-900 dark:text-gray-100" title="Theme">Theme</div>

                              {showThemeMenu && (
                                <div className="bg-white dark:bg-navy-800 rounded-lg border border-slate-200 dark:border-navy-700 absolute flex-col items-start py-2 shadow-2xl shadow-slate-400/20 dark:shadow-navy-900/50 backdrop-blur-sm z-50 min-w-[160px] max-w-72 -left-40 top-0" style={{ width: 'fit-content' }}>
                                  <div className={`relative flex flex-col justify-between self-stretch px-4 py-1.5 sm:py-1 ${theme === 'light' ? '!bg-rezi-blue-600 dark:!bg-rezi-blue-700 hover:none' : 'cursor-pointer sm:hover:bg-menu-item-hover'}`} onClick={() => { setTheme('light'); setShowThemeMenu(false); }}>
                                    <div className="flex flex-row items-start gap-2 self-stretch justify-between p-0 w-full">
                                      <div className="flex flex-row items-start gap-2">
                                        <div>
                                          <div className="flex h-6 min-w-6 items-center justify-center">
                                            <i className={`fad fa-sun text-left text-base ${theme === 'light' ? '!text-white' : 'text-gray-900 dark:text-gray-100'}`} aria-hidden="true"></i>
                                          </div>
                                        </div>
                                        <div className="flex flex-col">
                                          <div className={`w-full select-none overflow-hidden text-ellipsis whitespace-nowrap text-base leading-6 ${theme === 'light' ? '!text-white' : 'text-gray-900 dark:text-gray-100'}`} title="Light">Light</div>
                                        </div>
                                      </div>
                                      <div></div>
                                    </div>
                                  </div>
                                  <div className={`relative flex flex-col justify-between self-stretch px-4 py-1.5 sm:py-1 ${theme === 'dark' ? '!bg-rezi-blue-600 dark:!bg-rezi-blue-700 hover:none' : 'cursor-pointer sm:hover:bg-menu-item-hover'}`} onClick={() => { setTheme('dark'); setShowThemeMenu(false); }}>
                                    <div className="flex flex-row items-start gap-2 self-stretch justify-between p-0 w-full">
                                      <div className="flex flex-row items-start gap-2">
                                        <div>
                                          <div className="flex h-6 min-w-6 items-center justify-center">
                                            <i className={`fad fa-moon-stars text-left text-base ${theme === 'dark' ? '!text-white' : 'text-gray-900 dark:text-gray-100'}`} aria-hidden="true"></i>
                                          </div>
                                        </div>
                                        <div className="flex flex-col">
                                          <div className={`w-full select-none overflow-hidden text-ellipsis whitespace-nowrap text-base leading-6 ${theme === 'dark' ? '!text-white' : 'text-gray-900 dark:text-gray-100'}`} title="Dark">Dark</div>
                                        </div>
                                      </div>
                                      <div></div>
                                    </div>
                                  </div>
                                  <div className={`relative flex flex-col justify-between self-stretch px-4 py-1.5 sm:py-1 ${theme === 'system' ? '!bg-rezi-blue-600 dark:!bg-rezi-blue-700 hover:none' : 'cursor-pointer sm:hover:bg-menu-item-hover'}`} onClick={() => { setTheme('system'); setShowThemeMenu(false); }}>
                                    <div className="flex flex-row items-start gap-2 self-stretch justify-between p-0 w-full">
                                      <div className="flex flex-row items-start gap-2">
                                        <div>
                                          <div className="flex h-6 min-w-6 items-center justify-center">
                                            <i className={`fad fa-moon-over-sun text-left text-base ${theme === 'system' ? '!text-white' : 'text-gray-900 dark:text-gray-100'}`} aria-hidden="true"></i>
                                          </div>
                                        </div>
                                        <div className="flex flex-col">
                                          <div className={`w-full select-none overflow-hidden text-ellipsis whitespace-nowrap text-base leading-6 ${theme === 'system' ? '!text-white' : 'text-gray-900 dark:text-gray-100'}`} title="System">System</div>
                                        </div>
                                      </div>
                                      <div></div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="flex h-6 min-w-6 items-center justify-center">
                              <i className="fas fa-angle-right text-base text-gray-900 dark:text-gray-100" aria-hidden="true"></i>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="w-full border-t border-surface-2-stroke mt-2 mb-2"></div>

                      <div className="relative flex flex-col justify-between self-stretch px-4 py-1.5 sm:py-1 cursor-pointer sm:hover:bg-menu-item-hover" onClick={handleLogout}>
                        <div className="flex flex-row items-start gap-2 self-stretch justify-between p-0 w-full">
                          <div className="flex flex-row items-start gap-2">
                            <div>
                              <div className="flex h-6 min-w-6 items-center justify-center">
                                <i className="fad fa-right-from-bracket text-left text-base text-gray-900 dark:text-gray-100" aria-hidden="true"></i>
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <div className="w-full select-none overflow-hidden text-ellipsis whitespace-nowrap text-base leading-6 text-gray-900 dark:text-gray-100" title="Log out">Log out</div>
                            </div>
                          </div>
                          <div></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile tab navigation */}
          <div className="flex overflow-scroll py-4 xs:flex sm:hidden">
            <div className="relative inline-flex items-center whitespace-nowrap rounded-lg border border-slate-200 dark:border-navy-700 w-fit h-fit bg-white/80 dark:bg-navy-800/90 backdrop-blur-sm px-1 py-1 gap-1 shadow-lg shadow-slate-200/50 dark:shadow-navy-900/50">
              <div className="rounded-md inline-flex items-center gap-1 disabled:bg-input-bg-disabled group relative text-xs leading-4 h-6 px-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white cursor-pointer shadow-md shadow-blue-500/30" role="tab">
                <div className="w-full overflow-hidden">
                  <p className="font-semibold uppercase truncate">Resumes</p>
                </div>
              </div>
              <div className="rounded-md inline-flex items-center gap-1 disabled:bg-input-bg-disabled group relative text-xs leading-4 h-6 px-2 text-gray-700 dark:text-gray-300 focus:bg-slate-100 dark:focus:bg-navy-700 hover:text-gray-900 dark:hover:text-gray-100 cursor-pointer" role="tab">
                <div className="w-full overflow-hidden">
                  <p className="font-semibold uppercase truncate">Cover Letters</p>
                </div>
              </div>
              <div className="rounded-md inline-flex items-center gap-1 disabled:bg-input-bg-disabled group relative text-xs leading-4 h-6 px-2 text-gray-700 dark:text-gray-300 focus:bg-slate-100 dark:focus:bg-navy-700 hover:text-gray-900 dark:hover:text-gray-100 cursor-pointer" role="tab">
                <div className="w-full overflow-hidden">
                  <p className="font-semibold uppercase truncate">Resignation Letters</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-start flex self-stretch">
            <div className="w-full">
              <div className="py-4 flex items-center justify-end gap-4">
                {/* Sort dropdown */}
                <div className="relative flex flex-row items-center justify-start">
                  <button
                    type="button"
                    className="relative flex items-center justify-center font-bold uppercase focus:ring-0 focus:outline-none transition transition-200 latin border-none !px-2 text-xs font-bold uppercase leading-4 text-gray-900 dark:text-gray-100 focus:bg-button-text-focus dark:focus:bg-gray-700 active:bg-button-text-active dark:active:bg-gray-600 hover:bg-button-text-hover dark:hover:bg-gray-700 bg-transparent border-solid border border-button-secondary-stroke dark:border-gray-600 focus:bg-button-secondary-hover dark:focus:bg-gray-700 active:bg-button-secondary-active dark:active:bg-gray-600 hover:bg-button-secondary-hover dark:hover:bg-gray-700 px-2 py-1 min-h-8 leading-4 rounded-md text-xs"
                    onClick={toggleSortBy}
                  >
                    <span className="px-1">{sortBy === 'created' ? 'Created' : 'Updated'}</span>
                    <i className="fad fa-angle-down !flex items-center justify-center !leading-[0] flex-none text-sm w-[18px] h-[18px] mr-1" aria-hidden="true"></i>
                  </button>
                </div>

                {/* View mode toggles */}
                <div className="group relative flex h-6 w-6 items-center justify-center">
                  <div
                    className="h-6 w-6 cursor-pointer group relative flex items-center justify-center relative"
                    onClick={() => setViewMode('grid')}
                  >
                    <i className={`!flex items-center justify-center fad fa-grid-2 text-xl w-6 h-6 ${viewMode === 'grid' ? 'text-rezi-blue-700 dark:text-rezi-blue-400' : 'text-gray-900 dark:text-gray-100'}`} aria-hidden="true"></i>
                  </div>
                </div>
                <div className="group relative flex h-6 w-6 items-center justify-center">
                  <div
                    className="h-6 w-6 cursor-pointer group relative flex items-center justify-center relative"
                    onClick={() => setViewMode('list')}
                  >
                    <i className={`!flex items-center justify-center fad fa-list text-xl w-6 h-6 ${viewMode === 'list' ? 'text-rezi-blue-700 dark:text-rezi-blue-400' : 'text-gray-900 dark:text-gray-100'}`} aria-hidden="true"></i>
                  </div>
                </div>
              </div>

              {/* Resume Grid/List View */}
              <div className="flex flex-col gap-4">
                {resumes.length > 0 ? (
                  viewMode === 'grid' ? (
                    <div>
                      <div className="mb-4 flex flex-row flex-wrap gap-4 md:gap-6">
                        <CreateResumeCard />

                        {resumes.map((resume, index) => (
                          <ResumeGridCard 
                            key={resume.id} 
                            resume={resume} 
                            isLocked={usage.maxPdfGenerations !== -1 && usage.pdfGenerations >= usage.maxPdfGenerations && (index === 1 || index === 2)} 
                            usage={usage}
                            onRefresh={() => {
                              setIsLoading(true);
                              fetchResumes();
                            }} 
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <ResumeListView 
                      resumes={resumes} 
                      folders={[]} 
                      usage={usage}
                      onRefresh={() => {
                        setIsLoading(true);
                        fetchResumes();
                      }}
                      onCreateNew={() => setShowCreateModal(true)}
                    />
                  )
                ) : (
                  <div className="bg-white/80 dark:bg-navy-800/90 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-navy-700 p-8 text-center shadow-2xl shadow-slate-300/30 dark:shadow-navy-900/50">
                    <h4 className="font-medium text-xl mb-3 text-gray-900 dark:text-gray-100">No resumes yet</h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Create your first resume to start your job application journey.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                      <button
                        onClick={() => !canDownloadPdf() ? setShowUpgradeModal(true) : setShowCreateModal(true)}
                        className={`font-bold py-3 px-6 rounded-lg shadow-lg ${
                          canDownloadPdf() 
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/30' 
                            : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {canDownloadPdf() ? 'Create Resume' : 'Limit Reached'}
                      </button>
                      <a
                        href="/resumes/upload"
                        className={`border-2 border-slate-300 dark:border-navy-600 bg-white/70 dark:bg-navy-700/50 text-slate-700 dark:text-slate-300 font-bold py-3 px-6 rounded-lg shadow-md ${
                          !canDownloadPdf() ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
                        }`}
                      >
                        Upload Existing Resume
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <CreateResumeModal
            isOpen={showCreateModal}
            onOpenChange={setShowCreateModal}
          />
          
          <UpgradeModal
            isOpen={showUpgradeModal}
            onClose={() => setShowUpgradeModal(false)}
            feature="resumes"
            currentCount={usage.pdfGenerations}
            maxCount={usage.maxPdfGenerations}
          />
          
          <NotificationsSidebar 
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
          />
        </main>
      </div>
    </div>
  );
}