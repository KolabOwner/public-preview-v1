'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/components/ui/theme-provider';

interface DashboardNavProps {
  activeTab: 'resumes' | 'cover-letters';
  showNotifications?: boolean;
  onNotificationClick?: () => void;
}

export default function DashboardNav({ activeTab, showNotifications, onNotificationClick }: DashboardNavProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
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

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden w-full flex-row items-center justify-between self-stretch sm:flex">
        <div className="relative inline-flex items-center whitespace-nowrap rounded-lg border border-slate-200 dark:border-navy-700 w-fit h-fit bg-white/80 dark:bg-navy-800/90 backdrop-blur-sm px-1 py-1 gap-1 my-6 shadow-lg shadow-slate-200/50 dark:shadow-navy-900/50">
          <Link
            href="/dashboard/resumes"
            className={`rounded-md inline-flex items-center gap-1 disabled:bg-input-bg-disabled group relative text-xs leading-4 h-6 px-2 cursor-pointer ${
              activeTab === 'resumes'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30'
                : 'text-gray-700 dark:text-gray-300 focus:bg-slate-100 dark:focus:bg-navy-700 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
            role="tab"
          >
            <div className="w-full overflow-hidden">
              <p className="font-semibold uppercase truncate">Resumes</p>
            </div>
          </Link>
          <Link
            href="/dashboard/cover-letters"
            className={`rounded-md inline-flex items-center gap-1 disabled:bg-input-bg-disabled group relative text-xs leading-4 h-6 px-2 cursor-pointer ${
              activeTab === 'cover-letters'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30'
                : 'text-gray-700 dark:text-gray-300 focus:bg-slate-100 dark:focus:bg-navy-700 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
            role="tab"
          >
            <div className="w-full overflow-hidden">
              <p className="font-semibold uppercase truncate">Cover Letters</p>
            </div>
          </Link>
        </div>

        {/* Right side actions */}
        <div className="hidden flex-row items-center justify-between gap-4 lg:flex">
          {showNotifications && (
            <div 
              className="relative flex cursor-pointer items-center justify-center text-center font-extrabold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              onClick={onNotificationClick}
            >
              <i className="fad fa-bell fa-lg" aria-hidden="true"></i>
              <div className="absolute -right-3 -top-4 flex h-4 w-4 select-none items-center justify-center rounded-full border-2 border-white dark:border-navy-800 bg-red-600 p-2 text-xs font-normal leading-4 text-white">1</div>
            </div>
          )}
          
          {/* User menu */}
          <div className="hidden lg:!block relative p-3 lg:p-0" ref={userMenuRef}>
            <div className="flex cursor-pointer flex-row items-center justify-end gap-1 px-0">
              <button
                type="button"
                className="relative flex items-center justify-center font-bold uppercase focus:ring-0 focus:outline-none lg-h-8 flex h-6 !min-h-6 w-6 items-center justify-center !text-xs !font-semibold leading-4 lg:!min-h-8 lg:w-8 lg:!text-base lg:!leading-6 disabled:bg-input-bg-disabled disabled:text-input-disabled disabled:cursor-not-allowed border-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-2 py-1 min-h-8 leading-4 rounded-md text-xs !rounded-full shadow-md shadow-blue-500/30"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <span className="px-1">{user?.displayName?.[0] || user?.email?.[0] || 'U'}</span>
              </button>
              <div className="hidden h-5 w-5 items-center justify-center lg:flex">
                <i className={`fas fa-caret-${showUserMenu ? 'up' : 'down'} text-base`} aria-hidden="true"></i>
              </div>
            </div>

            {/* User dropdown menu */}
            {showUserMenu && (
              <div className="bg-white dark:bg-navy-800 rounded-lg border border-slate-200 dark:border-navy-700 absolute flex-col items-start py-2 shadow-2xl shadow-slate-400/20 dark:shadow-navy-900/50 backdrop-blur-sm z-50 min-w-28 max-w-72 left-0" style={{ width: 'fit-content', top: '34px' }}>
                <div className="relative pointer-events-none flex flex-col justify-between self-stretch px-4 py-1.5 sm:py-1 cursor-default">
                  <div className="flex flex-row items-start gap-2 self-stretch justify-between p-0 w-full">
                    <div className="flex flex-row items-start gap-2">
                      <div></div>
                      <div className="flex flex-col">
                       <div className="select-none !text-gray-500 dark:!text-gray-400 w-full select-none overflow-hidden text-ellipsis whitespace-nowrap text-base leading-6 text-gray-900 dark:text-gray-100" title={user?.email ?? undefined}>
                        {user?.email ?? ''}
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
                            <div className={`relative flex flex-col justify-between self-stretch px-4 py-1.5 sm:py-1 ${theme === 'light' ? '!bg-resume-blue-600 dark:!bg-resume-blue-700 hover:none' : 'cursor-pointer sm:hover:bg-menu-item-hover'}`} onClick={() => { setTheme('light'); setShowThemeMenu(false); }}>
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
                            <div className={`relative flex flex-col justify-between self-stretch px-4 py-1.5 sm:py-1 ${theme === 'dark' ? '!bg-resume-blue-600 dark:!bg-resume-blue-700 hover:none' : 'cursor-pointer sm:hover:bg-menu-item-hover'}`} onClick={() => { setTheme('dark'); setShowThemeMenu(false); }}>
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
                            <div className={`relative flex flex-col justify-between self-stretch px-4 py-1.5 sm:py-1 ${theme === 'system' ? '!bg-resume-blue-600 dark:!bg-resume-blue-700 hover:none' : 'cursor-pointer sm:hover:bg-menu-item-hover'}`} onClick={() => { setTheme('system'); setShowThemeMenu(false); }}>
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
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="flex overflow-scroll py-4 xs:flex sm:hidden">
        <div className="relative inline-flex items-center whitespace-nowrap rounded-lg border border-slate-200 dark:border-navy-700 w-fit h-fit bg-white/80 dark:bg-navy-800/90 backdrop-blur-sm px-1 py-1 gap-1 shadow-lg shadow-slate-200/50 dark:shadow-navy-900/50">
          <Link
            href="/dashboard/resumes"
            className={`rounded-md inline-flex items-center gap-1 disabled:bg-input-bg-disabled group relative text-xs leading-4 h-6 px-2 cursor-pointer ${
              activeTab === 'resumes'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30'
                : 'text-gray-700 dark:text-gray-300 focus:bg-slate-100 dark:focus:bg-navy-700 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
            role="tab"
          >
            <div className="w-full overflow-hidden">
              <p className="font-semibold uppercase truncate">Resumes</p>
            </div>
          </Link>
          <Link
            href="/dashboard/cover-letters"
            className={`rounded-md inline-flex items-center gap-1 disabled:bg-input-bg-disabled group relative text-xs leading-4 h-6 px-2 cursor-pointer ${
              activeTab === 'cover-letters'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30'
                : 'text-gray-700 dark:text-gray-300 focus:bg-slate-100 dark:focus:bg-navy-700 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
            role="tab"
          >
            <div className="w-full overflow-hidden">
              <p className="font-semibold uppercase truncate">Cover Letters</p>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}