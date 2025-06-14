'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/components/ui/theme-provider';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import ResumeGridCard from '@/components/resume/resume-grid-card';
import CreateResumeModal from '@/components/resume/create-resume-modal';

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'created' | 'updated'>('created');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
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

  // Create resume card component with enhanced styling
  const CreateResumeCard = () => (
    <div className="relative group">
      <div className="relative w-[calc(50vw_-_25px)] xs:h-48 sm:h-[290px] md:w-60">
        {/* Subtle glow effect on hover */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#5b7cfd] to-[#4a6bec] rounded-lg opacity-0 group-hover:opacity-30 blur transition-all duration-300"></div>

        <div
          className="relative bg-gradient-to-br from-[#1e2936] to-[#1a2332] rounded-lg border border-dashed border-[#374151]/50 w-[calc(50vw_-_25px)] xs:h-48 sm:h-[290px] md:w-60 cursor-pointer hover:border-[#5b7cfd]/50 transition-all duration-300 group overflow-hidden"
          onClick={() => setShowCreateModal(true)}
        >
          {/* Background gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#5b7cfd]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <div className="relative h-[calc(100%-60px)] flex items-center justify-center overflow-hidden">
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#5b7cfd]/20 to-[#4a6bec]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-[#5b7cfd]/10">
                <i className="fad fa-plus text-2xl text-[#5b7cfd]"></i>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Create New Resume</h3>
              <p className="text-sm text-gray-400">Start from scratch or upload an existing resume</p>
            </div>
          </div>

          {/* Card Footer with gradient */}
          <div className="relative flex h-[60px] flex-row items-center justify-between rounded-b-lg bg-gradient-to-r from-[#1a2332] to-[#1e2936] py-2 border-t border-[#374151]/30">
            <div className="flex max-w-[calc(100%-3rem)] flex-row items-center pl-4">
              <div className="w-full">
                <p className="overflow-hidden overflow-ellipsis whitespace-nowrap pr-2 text-base font-semibold leading-6 text-white">
                  Create New Resume
                </p>
                <div className="group relative inline-block">
                  <p className="text-400 overflow-hidden overflow-ellipsis whitespace-nowrap text-sm leading-5 text-gray-400">
                    Start a new project
                  </p>
                </div>
              </div>
            </div>

            {/* Icon with glow */}
            <div className="h-12 min-w-12 flex items-center justify-center text-xl">
              <div className="h-6 w-6 flex items-center justify-center">
                <i className="!flex items-center justify-center fad fa-file-plus text-[#5b7cfd] text-xl w-6 h-6 drop-shadow-[0_0_8px_rgba(91,124,253,0.3)]"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
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
    <main className="sm:h-full lg:h-auto px-6 py-4 bg-gradient-to-br from-[#1a2332] via-[#1e2936] to-[#1a2332] min-h-screen">
      {/* Tab navigation with enhanced styling */}
      <div className="hidden w-full flex-row items-center justify-between self-stretch sm:flex">
        <div className="relative inline-flex items-center whitespace-nowrap rounded-lg bg-gradient-to-r from-[#1e2936] to-[#2a3f5f] p-1 gap-1 my-6 shadow-lg shadow-black/20 border border-[#374151]/30">
          <div
            className="relative rounded-md inline-flex items-center gap-1 group text-xs leading-4 h-8 px-4 bg-gradient-to-r from-[#5b7cfd] to-[#4a6bec] text-white cursor-pointer shadow-md transition-all duration-200 font-semibold"
            role="tab"
          >
            <div className="absolute inset-0 bg-white/20 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            <div className="w-full overflow-hidden relative z-10">
              <p className="font-semibold uppercase truncate">Resumes</p>
            </div>
          </div>
          <div
            className="rounded-md inline-flex items-center gap-1 group relative text-xs leading-4 h-8 px-4 text-gray-400 hover:text-white hover:bg-white/10 cursor-pointer transition-all duration-200 font-semibold"
            role="tab"
          >
            <div className="w-full overflow-hidden">
              <p className="font-semibold uppercase truncate">Cover Letters</p>
            </div>
          </div>
        </div>

        {/* Action buttons with enhanced styling */}
        <div className="hidden flex-row items-center justify-end gap-4 lg:flex">
          {/* Sort dropdown */}
          <div className="relative flex flex-row items-center justify-start">
            <button
              type="button"
              className="relative flex items-center justify-center font-bold uppercase transition-all duration-200 bg-gradient-to-r from-[#2a3f5f] to-[#324966] text-white hover:from-[#324966] hover:to-[#3a5576] px-4 py-2 rounded-lg text-xs shadow-md border border-[#374151]/30"
              onClick={toggleSortBy}
            >
              <span className="px-1">{sortBy === 'created' ? 'Created' : 'Updated'}</span>
              <i className="fad fa-angle-down text-sm ml-2"></i>
            </button>
          </div>

          {/* View toggle buttons with blue accents */}
          <div className="flex gap-2 bg-[#1e2936] p-1 rounded-lg border border-[#374151]/30">
            <button
              className={`p-2 rounded-md transition-all duration-200 ${
                viewMode === 'grid' 
                  ? 'bg-gradient-to-r from-[#5b7cfd] to-[#4a6bec] text-white shadow-md' 
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
              onClick={() => setViewMode('grid')}
            >
              <i className="fad fa-grid-2 text-lg w-5 h-5"></i>
            </button>
            <button
              className={`p-2 rounded-md transition-all duration-200 ${
                viewMode === 'list' 
                  ? 'bg-gradient-to-r from-[#5b7cfd] to-[#4a6bec] text-white shadow-md' 
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
              onClick={() => setViewMode('list')}
            >
              <i className="fad fa-list text-lg w-5 h-5"></i>
            </button>
          </div>

          {/* User Menu with gradient */}
          {user && (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                className="relative flex items-center justify-center h-10 w-10 bg-gradient-to-r from-[#5b7cfd] to-[#4a6bec] hover:from-[#4a6bec] hover:to-[#3a5bdc] text-white rounded-full transition-all duration-200 shadow-lg shadow-[#5b7cfd]/20 font-bold"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <span>{user.displayName?.[0] || user.email?.[0] || 'U'}</span>
              </button>

              {showUserMenu && (
                <div className="absolute top-12 right-0 bg-gradient-to-br from-[#2a3f5f] to-[#1e2936] rounded-lg shadow-xl border border-[#374151]/30 min-w-[200px] py-2 z-50 backdrop-blur-sm">
                  <div className="px-4 py-2 border-b border-[#374151]/30">
                    <p className="text-sm text-gray-400">{user.email}</p>
                  </div>

                  <button className="w-full px-4 py-2 text-left hover:bg-[#5b7cfd]/10 transition-colors flex items-center gap-3 text-white">
                    <i className="fad fa-user w-4"></i>
                    <span>Account</span>
                  </button>

                  <button
                    className="w-full px-4 py-2 text-left hover:bg-[#5b7cfd]/10 transition-colors flex items-center gap-3 text-white"
                    onClick={toggleTheme}
                  >
                    <i className="fad fa-palette w-4"></i>
                    <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                  </button>

                  <div className="border-t border-[#374151]/30 mt-2 pt-2">
                    <button
                      className="w-full px-4 py-2 text-left hover:bg-red-500/10 transition-colors flex items-center gap-3 text-red-400"
                      onClick={handleLogout}
                    >
                      <i className="fad fa-right-from-bracket w-4"></i>
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile tab navigation */}
      <div className="flex overflow-scroll py-4 xs:flex sm:hidden">
        <div className="relative inline-flex items-center whitespace-nowrap rounded-lg bg-gradient-to-r from-[#1e2936] to-[#2a3f5f] p-1 gap-1 shadow-lg shadow-black/20 border border-[#374151]/30">
          <div className="rounded-md inline-flex items-center gap-1 text-xs leading-4 h-8 px-4 bg-gradient-to-r from-[#5b7cfd] to-[#4a6bec] text-white cursor-pointer shadow-md font-semibold">
            <p className="font-semibold uppercase truncate">Resumes</p>
          </div>
          <div className="rounded-md inline-flex items-center gap-1 text-xs leading-4 h-8 px-4 text-gray-400 hover:text-white hover:bg-white/10 cursor-pointer font-semibold">
            <p className="font-semibold uppercase truncate">Cover Letters</p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-start flex self-stretch">
        <div className="w-full px-1">
          {/* Resume Grid */}
          <div className="flex flex-col gap-4">
            {resumes.length > 0 ? (
              <div>
                <div className="mb-4 flex flex-row flex-wrap gap-6 md:gap-8 justify-center sm:justify-start">
                  <CreateResumeCard />

                  {resumes.map((resume) => (
                    <ResumeGridCard key={resume.id} resume={resume} onRefresh={() => {
                      setIsLoading(true);
                      fetchResumes();
                    }} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-[#2a3f5f] to-[#1e2936] rounded-lg border border-[#374151]/30 p-8 text-center shadow-xl">
                <h4 className="font-medium text-xl mb-3 text-white">No resumes yet</h4>
                <p className="text-gray-300 mb-6">
                  Create your first resume to start your job application journey.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-gradient-to-r from-[#5b7cfd] to-[#4a6bec] hover:from-[#4a6bec] hover:to-[#3a5bdc] text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg shadow-[#5b7cfd]/20"
                  >
                    Create Resume
                  </button>
                  <a
                    href="/resumes/upload"
                    className="border border-[#374151]/50 hover:border-[#5b7cfd]/50 bg-[#1a2332] hover:bg-[#1e2936] text-gray-200 hover:text-white font-bold py-3 px-6 rounded-lg transition-all duration-200"
                  >
                    Upload Existing Resume
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Resume Modal */}
      {showCreateModal && (
        <CreateResumeModal
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </main>
  );
}