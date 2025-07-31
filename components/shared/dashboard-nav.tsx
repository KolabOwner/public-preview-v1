'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/firebase-auth-context';
import { useTheme } from '@/components/shared/theme-provider';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase-config';
import UpgradeModal from '@/components/features/resume/modals/upgrade-modal';
import { Sun, Moon, Laptop, LogOut, Settings, LifeBuoy, Bell } from 'lucide-react';

interface DashboardNavProps {
  activeTab: 'resumes' | 'cover-letters';
  showNotifications?: boolean;
  onNotificationClick?: () => void;
}

export default function DashboardNav({ activeTab, showNotifications, onNotificationClick }: DashboardNavProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userPlan, setUserPlan] = useState<'free' | 'pro' | 'enterprise'>('free');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const checkUserSubscription = async () => {
      if (!user?.uid) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserPlan(userDoc.data().subscription?.plan || 'free');
        }
      } catch (error) {
        console.error('Failed to check user subscription:', error);
      }
    };
    checkUserSubscription();
  }, [user?.uid]);

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleCoverLettersClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (userPlan === 'free') {
      e.preventDefault();
      setShowUpgradeModal(true);
    }
  };

  const NavLink = ({ href, tabName, currentTab, onClick }: { href: string; tabName: string; currentTab: string; onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void; }) => {
    const isActive = tabName.toLowerCase().replace('-', '') === currentTab.toLowerCase().replace('-', '');
    return (
      <Link
        href={href}
        onClick={onClick}
        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
          isActive
            ? 'bg-gradient-to-r from-corporate-gold-500 to-corporate-amber-500 text-corporate-navy-900 shadow-md'
            : 'text-corporate-navy-600 dark:text-corporate-navy-300 hover:bg-corporate-navy-50 dark:hover:bg-corporate-navy-800'
        }`}
      >
        {tabName}
      </Link>
    );
  };

  return (
    <>
      <header className="py-6">
        <div className="flex items-center justify-between">
          {/* Logo and Navigation */}
          <div className="flex items-center gap-8">
            <nav className="hidden md:flex items-center gap-2 bg-white dark:bg-corporate-navy-900 border border-corporate-navy-100 dark:border-corporate-navy-800 rounded-xl p-1 shadow-sm">
              <NavLink href="/dashboard/resumes" tabName="Resumes" currentTab={activeTab} />
              <NavLink href="/dashboard/cover-letters" tabName="Cover Letters" currentTab={activeTab} onClick={handleCoverLettersClick} />
            </nav>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            {showNotifications && (
              <button
                className="relative text-corporate-navy-500 dark:text-corporate-navy-400 hover:text-corporate-gold-600 dark:hover:text-corporate-gold-500 transition-colors"
                onClick={onNotificationClick}
                aria-label="Toggle notifications"
              >
                <Bell className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              </button>
            )}

            <div className="relative" ref={userMenuRef}>
              <button onClick={() => setShowUserMenu(!showUserMenu)} className="focus:outline-none">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-corporate-gold-400 to-corporate-amber-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                  {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-corporate-navy-800 rounded-xl shadow-2xl border border-corporate-navy-100 dark:border-corporate-navy-700 py-2 z-50">
                  <div className="px-4 py-2 border-b border-corporate-navy-100 dark:border-corporate-navy-700">
                    <p className="text-sm font-semibold text-corporate-navy-900 dark:text-white truncate">{user?.displayName || 'User'}</p>
                    <p className="text-xs text-corporate-navy-500 dark:text-corporate-navy-400 truncate">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <Link href="/dashboard/account" className="flex items-center gap-3 px-4 py-2 text-sm text-corporate-navy-700 dark:text-corporate-navy-300 hover:bg-corporate-navy-50 dark:hover:bg-corporate-navy-700">
                      <Settings className="w-4 h-4" /> Account
                    </Link>
                    <Link href="/help" className="flex items-center gap-3 px-4 py-2 text-sm text-corporate-navy-700 dark:text-corporate-navy-300 hover:bg-corporate-navy-50 dark:hover:bg-corporate-navy-700">
                      <LifeBuoy className="w-4 h-4" /> Help Center
                    </Link>
                  </div>
                  <div className="px-4 py-2 border-t border-corporate-navy-100 dark:border-corporate-navy-700">
                    <p className="text-xs text-corporate-navy-500 dark:text-corporate-navy-400 mb-2">Theme</p>
                    <div className="flex justify-around bg-corporate-navy-50 dark:bg-corporate-navy-900 rounded-lg p-1">
                      <button onClick={() => setTheme('light')} className={`p-1 rounded-md ${theme === 'light' ? 'bg-white dark:bg-corporate-navy-700' : ''}`}><Sun className="w-4 h-4" /></button>
                      <button onClick={() => setTheme('dark')} className={`p-1 rounded-md ${theme === 'dark' ? 'bg-white dark:bg-corporate-navy-700' : ''}`}><Moon className="w-4 h-4" /></button>
                      <button onClick={() => setTheme('system')} className={`p-1 rounded-md ${theme === 'system' ? 'bg-white dark:bg-corporate-navy-700' : ''}`}><Laptop className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="border-t border-corporate-navy-100 dark:border-corporate-navy-700 mt-1 py-1">
                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full">
                      <LogOut className="w-4 h-4" /> Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Mobile Navigation */}
        <nav className="md:hidden flex items-center justify-center gap-2 bg-white dark:bg-corporate-navy-900 border border-corporate-navy-100 dark:border-corporate-navy-800 rounded-xl p-1 shadow-sm mt-4">
          <NavLink href="/dashboard/resumes" tabName="Resumes" currentTab={activeTab} />
          <NavLink href="/dashboard/cover-letters" tabName="Cover Letters" currentTab={activeTab} onClick={handleCoverLettersClick} />
        </nav>
      </header>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </>
  );
}
