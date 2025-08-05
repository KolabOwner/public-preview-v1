'use client';

import React, { useState, useEffect, useRef, memo, useCallback, useMemo } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/firebase-auth-context';
import { useTheme } from "@/components/shared/theme-provider";
import { collection, getDocs, query, where, orderBy, doc, getDoc, DocumentData } from 'firebase/firestore';
import { db } from "@/config/firebase-config";

// ==================== TYPES ====================
interface Resume {
  id: string;
  title: string;
  isTargeted: boolean;
}

interface TabConfig {
  key: string;
  label: string;
  href: string;
  category: 'editor' | 'action';
  alwaysVisible?: boolean;
}

interface TabVisibility {
  [key: string]: boolean;
}

interface ResumeData extends DocumentData {
  // Unified format
  contactInfo?: {
    fullName?: string;
    email?: string;
    phone?: string;
  };
  experiences?: any[];
  education?: any[];
  skills?: any[];
  skillCategories?: any[];
  projects?: any[];
  involvements?: any[];
  coursework?: any[];
  certifications?: any[];
  summary?: string;

  // RMS format fields
  Rms_contact_fullName?: string;
  rms_contact_fullName?: string;
  Rms_contact_email?: string;
  rms_contact_email?: string;
  Rms_experience_count?: number;
  rms_experience_count?: number;
  Rms_education_count?: number;
  rms_education_count?: number;
  Rms_skill_count?: number;
  rms_skill_count?: number;
  Rms_project_count?: number;
  rms_project_count?: number;
  Rms_involvement_count?: number;
  rms_involvement_count?: number;
  Rms_coursework_count?: number;
  rms_coursework_count?: number;
  Rms_certification_count?: number;
  rms_certification_count?: number;
  Rms_summary?: string;
  rms_summary?: string;
}

// ==================== CONSTANTS ====================
const SECTIONS = {
  CONTACT: 'contact',
  EXPERIENCE: 'experience',
  EDUCATION: 'education',
  SKILLS: 'skills',
  PROJECTS: 'projects',
  INVOLVEMENT: 'involvement',
  COURSEWORK: 'coursework',
  CERTIFICATIONS: 'certifications',
  SUMMARY: 'summary',
  PREVIEW: 'preview',
  COVER_LETTER: 'cover-letter',
} as const;

const ALWAYS_VISIBLE_SECTIONS = [SECTIONS.CONTACT, SECTIONS.PREVIEW, SECTIONS.COVER_LETTER];

const DEFAULT_VISIBILITY: TabVisibility = {
  contact: true,
  experience: false,
  education: false,
  skills: false,
  projects: false,
  involvement: false,
  coursework: false,
  certifications: false,
  summary: false,
  'cover-letter': true,
  preview: true,
};

// ==================== CUSTOM HOOKS ====================
const useClickOutside = (refs: React.RefObject<HTMLElement>[], callback: () => void) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isOutside = refs.every(ref => ref.current && !ref.current.contains(event.target as Node));
      if (isOutside) callback();
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [refs, callback]);
};

const useResumeData = (resumeId: string | undefined) => {
  const { user } = useAuth();
  const [resume, setResume] = useState<Resume | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!resumeId || !user) {
      setLoading(false);
      return;
    }

    const fetchResume = async () => {
      try {
        setLoading(true);
        setError(null);

        const resumeDoc = await getDoc(doc(db, 'resumes', resumeId));
        if (!resumeDoc.exists()) {
          throw new Error('Resume not found');
        }

        const data = resumeDoc.data();

        // Extract resume metadata
        setResume({
          id: resumeDoc.id,
          title: data.title || 'Untitled Resume',
          isTargeted: data.isTargeted || false,
        });

        // Extract resume data from various possible sources
        const extractedData = data.parsedData || data.data || data.rmsRawData || {};
        setResumeData(extractedData);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching resume:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResume();
  }, [resumeId, user]);

  return { resume, resumeData, loading, error };
};

const useResumesList = () => {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchResumes = async () => {
      try {
        const resumesQuery = query(
          collection(db, 'resumes'),
          where('userId', '==', user.uid),
          orderBy('updatedAt', 'desc')
        );

        const querySnapshot = await getDocs(resumesQuery);
        const resumesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          title: doc.data().title || 'Untitled Resume',
          isTargeted: doc.data().isTargeted || false,
        }));

        setResumes(resumesData);
      } catch (error) {
        console.error('Error fetching resumes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResumes();
  }, [user]);

  return { resumes, loading };
};

const useTabVisibility = (resumeId: string | undefined, resumeData: ResumeData | null) => {
  const storageKey = resumeId ? `resumeTabVisibility_${resumeId}` : null;

  const [visibility, setVisibility] = useState<TabVisibility>(() => {
    if (!storageKey || typeof window === 'undefined') return DEFAULT_VISIBILITY;

    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_VISIBILITY;
      }
    }

    return DEFAULT_VISIBILITY;
  });

  const sectionHasContent = useCallback((section: string): boolean => {
    if (!resumeData) return false;

    switch (section) {
      case SECTIONS.CONTACT:
        return !!(
          (resumeData.contactInfo?.fullName || resumeData.contactInfo?.email || resumeData.contactInfo?.phone) ||
          (resumeData.Rms_contact_fullName || resumeData.rms_contact_fullName ||
           resumeData.Rms_contact_email || resumeData.rms_contact_email)
        );

      case SECTIONS.EXPERIENCE:
        return !!(
          (resumeData.experiences && resumeData.experiences.length > 0) ||
          (resumeData.Rms_experience_count && resumeData.Rms_experience_count > 0) ||
          (resumeData.rms_experience_count && resumeData.rms_experience_count > 0)
        );

      case SECTIONS.EDUCATION:
        return !!(
          (resumeData.education && resumeData.education.length > 0) ||
          (resumeData.Rms_education_count && resumeData.Rms_education_count > 0) ||
          (resumeData.rms_education_count && resumeData.rms_education_count > 0)
        );

      case SECTIONS.SKILLS:
        return !!(
          (resumeData.skillCategories && resumeData.skillCategories.length > 0) ||
          (resumeData.skills && resumeData.skills.length > 0) ||
          (resumeData.Rms_skill_count && resumeData.Rms_skill_count > 0) ||
          (resumeData.rms_skill_count && resumeData.rms_skill_count > 0)
        );

      case SECTIONS.PROJECTS:
        return !!(
          (resumeData.projects && resumeData.projects.length > 0) ||
          (resumeData.Rms_project_count && resumeData.Rms_project_count > 0) ||
          (resumeData.rms_project_count && resumeData.rms_project_count > 0)
        );

      case SECTIONS.INVOLVEMENT:
        return !!(
          (resumeData.involvements && resumeData.involvements.length > 0) ||
          (resumeData.Rms_involvement_count && resumeData.Rms_involvement_count > 0) ||
          (resumeData.rms_involvement_count && resumeData.rms_involvement_count > 0)
        );

      case SECTIONS.COURSEWORK:
        return !!(
          (resumeData.coursework && resumeData.coursework.length > 0) ||
          (resumeData.Rms_coursework_count && resumeData.Rms_coursework_count > 0) ||
          (resumeData.rms_coursework_count && resumeData.rms_coursework_count > 0)
        );

      case SECTIONS.CERTIFICATIONS:
        return !!(
          (resumeData.certifications && resumeData.certifications.length > 0) ||
          (resumeData.Rms_certification_count && resumeData.Rms_certification_count > 0) ||
          (resumeData.rms_certification_count && resumeData.rms_certification_count > 0)
        );

      case SECTIONS.SUMMARY:
        return !!(
          (resumeData.summary?.trim()) ||
          (resumeData.rms_summary?.trim()) ||
          (resumeData.Rms_summary?.trim())
        );

      case SECTIONS.PREVIEW:
      case SECTIONS.COVER_LETTER:
        return true;

      default:
        return false;
    }
  }, [resumeData]);

  // Auto-detect content on data load
  useEffect(() => {
    if (!resumeData || !storageKey) return;

    const saved = localStorage.getItem(storageKey);
    if (!saved || saved === '{}') {
      const autoDetected = Object.keys(DEFAULT_VISIBILITY).reduce((acc, key) => ({
        ...acc,
        [key]: ALWAYS_VISIBLE_SECTIONS.includes(key as any) || sectionHasContent(key)
      }), {} as TabVisibility);

      setVisibility(autoDetected);
    }
  }, [resumeData, storageKey, sectionHasContent]);

  const toggleVisibility = useCallback((tab: string) => {
    setVisibility(prev => {
      const updated = { ...prev, [tab]: !prev[tab] };
      if (storageKey) {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      }
      return updated;
    });
  }, [storageKey]);

  const resetVisibility = useCallback(() => {
    const autoDetected = Object.keys(DEFAULT_VISIBILITY).reduce((acc, key) => ({
      ...acc,
      [key]: ALWAYS_VISIBLE_SECTIONS.includes(key as any) || sectionHasContent(key)
    }), {} as TabVisibility);

    setVisibility(autoDetected);
    if (storageKey) {
      localStorage.removeItem(storageKey);
    }
  }, [storageKey, sectionHasContent]);

  return { visibility, toggleVisibility, resetVisibility, sectionHasContent };
};

// ==================== COMPONENTS ====================
interface NavigationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

const NavigationDropdown = memo<NavigationDropdownProps>(({ isOpen, onClose, children, className = '' }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0" style={{ zIndex: 999998 }} onClick={onClose} />
      <div
        className={`absolute top-full mt-2 bg-white dark:bg-corporate-navy-800 rounded-lg border border-corporate-navy-200 dark:border-corporate-navy-700 shadow-2xl ${className}`}
        style={{ zIndex: 999999 }}
      >
        {children}
      </div>
    </>
  );
});

NavigationDropdown.displayName = 'NavigationDropdown';

interface TabButtonProps {
  tab: TabConfig;
  isActive: boolean;
  onClick?: () => void;
}

const TabButton = memo<TabButtonProps>(({ tab, isActive, onClick }) => {
  const className = `rounded-md inline-flex items-center gap-1 group relative text-xs leading-4 h-6 px-2 transition-all ${
    isActive 
      ? tab.category === 'editor' 
        ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md shadow-orange-500/30' 
        : 'bg-orange-600 text-white'
      : 'text-gray-700 dark:text-gray-300 hover:bg-corporate-amber-50 dark:hover:bg-corporate-navy-700 hover:text-corporate-amber-700 dark:hover:text-corporate-amber-400'
  } cursor-pointer`;

  const content = (
    <div className="w-full overflow-hidden">
      <p className="font-semibold uppercase truncate">
        {tab.key === SECTIONS.PREVIEW ? 'Finish up & Preview' : tab.label}
      </p>
    </div>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className={className}>
        {content}
      </button>
    );
  }

  return (
    <Link href={tab.href} className={className}>
      {content}
    </Link>
  );
});

TabButton.displayName = 'TabButton';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const MobileMenu = memo<MobileMenuProps>(({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 sm:hidden" onClick={onClose}>
      <div
        className="absolute bottom-0 left-0 right-0 bg-white dark:bg-corporate-navy-800 rounded-t-2xl border-t border-corporate-navy-200 dark:border-corporate-navy-700 p-4 max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1 bg-corporate-navy-300 dark:bg-gray-600 rounded-full mx-auto mb-4" />
        <h3 className="text-sm font-semibold text-corporate-navy-700 dark:text-gray-300 mb-3">{title}</h3>
        {children}
      </div>
    </div>
  );
});

MobileMenu.displayName = 'MobileMenu';

// ==================== MAIN COMPONENT ====================
const ResumeEditorLayout = memo(function ResumeEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const resumeId = params.resumeId as string | undefined;

  // Auth and theme
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  // UI state
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showResumeDropdown, setShowResumeDropdown] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Refs for click outside handling
  const userMenuRef = useRef<HTMLDivElement>(null);
  const resumeDropdownRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Data hooks
  const { resume: currentResume, resumeData, loading: resumeLoading } = useResumeData(resumeId);
  const { resumes } = useResumesList();
  const { visibility, toggleVisibility, resetVisibility, sectionHasContent } = useTabVisibility(resumeId, resumeData);

  // Close dropdowns on outside click
  useClickOutside(
    [userMenuRef, resumeDropdownRef, moreMenuRef],
    () => {
      setShowUserMenu(false);
      setShowResumeDropdown(false);
      setShowMoreMenu(false);
    }
  );

  // Tab configuration
  const allTabs = useMemo<TabConfig[]>(() => {
    if (!resumeId) return [];

    return [
      { key: SECTIONS.CONTACT, label: 'Contact', href: `/dashboard/resumes/${resumeId}/contact`, category: 'editor' },
      { key: SECTIONS.EXPERIENCE, label: 'Experience', href: `/dashboard/resumes/${resumeId}/experience`, category: 'editor' },
      { key: SECTIONS.EDUCATION, label: 'Education', href: `/dashboard/resumes/${resumeId}/education`, category: 'editor' },
      { key: SECTIONS.PROJECTS, label: 'Projects', href: `/dashboard/resumes/${resumeId}/projects`, category: 'editor' },
      { key: SECTIONS.INVOLVEMENT, label: 'Involvement', href: `/dashboard/resumes/${resumeId}/involvement`, category: 'editor' },
      { key: SECTIONS.SKILLS, label: 'Skills', href: `/dashboard/resumes/${resumeId}/skills`, category: 'editor' },
      { key: SECTIONS.COURSEWORK, label: 'Coursework', href: `/dashboard/resumes/${resumeId}/coursework`, category: 'editor' },
      { key: SECTIONS.CERTIFICATIONS, label: 'Certifications', href: `/dashboard/resumes/${resumeId}/certifications`, category: 'editor' },
      { key: SECTIONS.SUMMARY, label: 'Summary', href: `/dashboard/resumes/${resumeId}/summary`, category: 'editor' },
      { key: SECTIONS.PREVIEW, label: 'Preview', href: `/dashboard/resumes/${resumeId}/preview`, category: 'action' },
      { key: SECTIONS.COVER_LETTER, label: 'Cover Letter', href: `/dashboard/resumes/${resumeId}/cover-letter`, category: 'action' },
    ];
  }, [resumeId]);

  const { editorTabs, actionTabs, visibleTabs } = useMemo(() => {
    const editor = allTabs.filter(tab => tab.category === 'editor');
    const action = allTabs.filter(tab => tab.category === 'action');
    const visible = editor.filter(tab => tab.key === SECTIONS.CONTACT || visibility[tab.key]);

    return { editorTabs: editor, actionTabs: action, visibleTabs: visible };
  }, [allTabs, visibility]);

  // Handlers
  const handleResumeSwitch = useCallback((newResumeId: string) => {
    const section = pathname.split('/').pop() || 'contact';
    router.push(`/dashboard/resumes/${newResumeId}/${section}`);
    setShowResumeDropdown(false);
  }, [pathname, router]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }, [logout]);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  // Check if on main page
  const isMainPage = pathname === `/dashboard/resumes/${resumeId}`;

  if (!resumeId) {
    return <div>No resume ID provided</div>;
  }

  return (
    <main className="sm:h-full lg:h-auto px-6 lg:px-8 xl:px-10 pt-8 pb-4 lg:pb-6">
      {/* Desktop Navigation */}
      <div className="hidden sm:block">
        <div className="flex justify-center mb-8 mt-4 relative" style={{ zIndex: 10 }}>
          <div className="flex flex-row flex-wrap gap-3 justify-center items-center">

            {/* Resume Selector */}
            <div className="relative inline-flex items-center whitespace-nowrap rounded-lg border border-corporate-navy-200 dark:border-corporate-navy-700 w-fit h-fit bg-white/80 dark:bg-corporate-navy-800/90 backdrop-blur-sm px-1 py-1 shadow-lg">
              <div ref={resumeDropdownRef} className="relative">
                <button
                  onClick={() => setShowResumeDropdown(!showResumeDropdown)}
                  className="rounded inline-flex items-center gap-1.5 group relative text-xs h-7 px-3 transition-all text-gray-600 dark:text-gray-300 hover:bg-surface-2/80"
                  disabled={resumeLoading}
                >
                  <span className="font-semibold uppercase tracking-wide truncate max-w-[150px] text-[11px]">
                    {currentResume ? (
                      <>
                        {currentResume.isTargeted && '[TARGETED] '}
                        {currentResume.title}
                      </>
                    ) : resumeLoading ? (
                      'Loading...'
                    ) : (
                      'Resume Not Found'
                    )}
                  </span>
                  <i className={`fas fa-chevron-${showResumeDropdown ? 'up' : 'down'} text-[10px]`} />
                </button>

                <NavigationDropdown
                  isOpen={showResumeDropdown}
                  onClose={() => setShowResumeDropdown(false)}
                  className="min-w-[280px] max-w-sm"
                >
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
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                            {resume.isTargeted && (
                              <span className="text-xs uppercase text-orange-400 mr-1">[TARGETED]</span>
                            )}
                            {resume.title}
                          </div>
                        </div>
                        {resume.id === resumeId && (
                          <i className="fas fa-check text-corporate-amber-600 text-sm" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-surface-2-stroke py-2">
                    <Link
                      href="/dashboard/resumes"
                      className="w-full text-left px-4 py-2.5 hover:bg-surface-3/50 transition-colors flex items-center gap-2 text-sm"
                    >
                      <i className="fas fa-arrow-left text-xs" />
                      <span>Back to All Resumes</span>
                    </Link>
                  </div>
                </NavigationDropdown>
              </div>
            </div>

            {/* Editor Tabs */}
            <div className="relative inline-flex items-center whitespace-nowrap rounded-lg border border-corporate-navy-200 dark:border-corporate-navy-700 w-fit h-fit bg-white/80 dark:bg-corporate-navy-800/90 backdrop-blur-sm px-1 py-1 gap-1 shadow-lg">
              {visibleTabs.map((tab) => (
                <TabButton
                  key={tab.href}
                  tab={tab}
                  isActive={pathname === tab.href || (isMainPage && tab.key === SECTIONS.CONTACT)}
                />
              ))}

              {/* More Menu */}
              <div ref={moreMenuRef} className="relative">
                <button
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className="rounded-md inline-flex items-center gap-1 group relative text-xs leading-4 h-6 px-2 text-corporate-navy-700 dark:text-gray-300 hover:bg-corporate-amber-50 dark:hover:bg-corporate-navy-700"
                  title="More sections"
                >
                  <i className="fas fa-ellipsis-h" />
                </button>

                <NavigationDropdown
                  isOpen={showMoreMenu}
                  onClose={() => setShowMoreMenu(false)}
                  className="min-w-[280px]"
                >
                  <div className="p-3 border-b border-corporate-navy-200 dark:border-corporate-navy-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-corporate-navy-700 dark:text-gray-300">
                          Additional Sections
                        </h3>
                        <p className="text-xs text-corporate-navy-500 dark:text-gray-500 mt-1">
                          Click to navigate or toggle visibility
                        </p>
                      </div>
                      <button
                        onClick={resetVisibility}
                        className="text-xs text-corporate-amber-600 hover:text-corporate-amber-500 underline"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  <div className="py-2 max-h-96 overflow-y-auto">
                    {editorTabs
                      .filter(tab => !ALWAYS_VISIBLE_SECTIONS.includes(tab.key as any))
                      .map((tab) => {
                        const hasContent = sectionHasContent(tab.key);
                        const isEnabled = visibility[tab.key];

                        return (
                          <div
                            key={tab.key}
                            className="flex items-center justify-between px-4 py-2.5 hover:bg-corporate-amber-50 dark:hover:bg-corporate-navy-700 transition-colors"
                          >
                            <Link
                              href={tab.href}
                              className="flex-1 flex items-center gap-2"
                              onClick={() => setShowMoreMenu(false)}
                            >
                              <span className={`text-sm font-medium ${
                                hasContent 
                                  ? 'text-corporate-navy-700 dark:text-gray-200' 
                                  : 'text-corporate-navy-500 dark:text-gray-500'
                              }`}>
                                {tab.label}
                              </span>
                              {hasContent && (
                                <span className="text-xs text-corporate-amber-600 dark:text-corporate-amber-400">
                                  <i className="fas fa-check-circle" />
                                </span>
                              )}
                            </Link>

                            <label className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isEnabled}
                                onChange={() => toggleVisibility(tab.key)}
                                className="w-4 h-4 text-corporate-amber-600 rounded focus:ring-corporate-amber-500"
                              />
                              <span className="ml-2 text-xs text-corporate-navy-500 dark:text-gray-400">
                                Show
                              </span>
                            </label>
                          </div>
                        );
                      })}
                  </div>
                </NavigationDropdown>
              </div>
            </div>

            {/* Action Tabs */}
            <div className="relative inline-flex items-center whitespace-nowrap rounded-lg border border-corporate-navy-200 dark:border-corporate-navy-700 w-fit h-fit bg-white/80 dark:bg-corporate-navy-800/90 backdrop-blur-sm px-1 py-1 gap-1 shadow-lg">
              {actionTabs.map((tab) => (
                <TabButton
                  key={tab.href}
                  tab={tab}
                  isActive={pathname === tab.href}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold text-corporate-navy-900 dark:text-white truncate max-w-[60%]">
            {currentResume?.title || 'Resume Editor'}
          </h1>

          {user && (
            <button
              type="button"
              className="relative flex items-center justify-center font-bold uppercase h-8 w-8 bg-gradient-to-r from-corporate-amber-600 to-corporate-gold-600 text-white rounded-full shadow-md"
              onClick={() => setShowUserMenu(true)}
            >
              <span className="text-xs">
                {user.displayName?.[0] || user.email?.[0] || 'U'}
              </span>
            </button>
          )}
        </div>

        {/* Mobile tabs - horizontally scrollable */}
        <div className="overflow-x-auto pb-4 mb-4 -mx-6 px-6">
          <div className="flex flex-row gap-1 w-max">
            <div className="relative inline-flex items-center whitespace-nowrap rounded-lg border border-corporate-navy-200 dark:border-corporate-navy-700 bg-white/80 dark:bg-corporate-navy-800/90 px-0.5 py-0.5 shadow-lg">
              <button
                onClick={() => setShowResumeDropdown(true)}
                className="rounded inline-flex items-center gap-1 text-[10px] h-5 px-2"
              >
                <span className="font-semibold uppercase text-[9px] truncate max-w-[100px]">
                  {currentResume?.title || 'Loading...'}
                </span>
                <i className="fas fa-chevron-down text-[8px]" />
              </button>
            </div>

            {/* Visible tabs */}
            <div className="relative inline-flex items-center rounded-lg border border-corporate-navy-200 dark:border-corporate-navy-700 bg-white/80 dark:bg-corporate-navy-800/90 px-0.5 py-0.5 gap-0.5 shadow-lg">
              {visibleTabs.map((tab) => (
                <TabButton
                  key={tab.href}
                  tab={tab}
                  isActive={pathname === tab.href || (isMainPage && tab.key === SECTIONS.CONTACT)}
                />
              ))}

              <button
                onClick={() => setShowMoreMenu(true)}
                className="rounded-md inline-flex items-center text-xs h-6 px-2"
              >
                <i className="fas fa-ellipsis-h text-[11px]" />
              </button>
            </div>

            {/* Action tabs */}
            <div className="relative inline-flex items-center rounded-lg border border-corporate-navy-200 dark:border-corporate-navy-700 bg-white/80 dark:bg-corporate-navy-800/90 px-0.5 py-0.5 gap-0.5 shadow-lg">
              {actionTabs.map((tab) => (
                <TabButton
                  key={tab.href}
                  tab={{...tab, label: tab.key === SECTIONS.PREVIEW ? 'Preview' : tab.label}}
                  isActive={pathname === tab.href}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Menus */}
        <MobileMenu
          isOpen={showResumeDropdown}
          onClose={() => setShowResumeDropdown(false)}
          title="Switch Resume"
        >
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
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {resume.isTargeted && (
                      <span className="text-xs uppercase text-orange-400 mr-1">[TARGETED]</span>
                    )}
                    {resume.title}
                  </div>
                </div>
                {resume.id === resumeId && (
                  <i className="fas fa-check text-corporate-amber-600 text-sm" />
                )}
              </button>
            ))}
          </div>

          <div className="border-t border-surface-2-stroke mt-3 pt-3">
            <Link
              href="/dashboard/resumes"
              className="w-full text-left px-3 py-3 rounded-lg hover:bg-surface-3/50 flex items-center gap-2 text-sm"
            >
              <i className="fas fa-arrow-left text-xs" />
              <span>Back to All Resumes</span>
            </Link>
          </div>
        </MobileMenu>

        <MobileMenu
          isOpen={showUserMenu}
          onClose={() => setShowUserMenu(false)}
          title=""
        >
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
              <i className="fad fa-palette w-5" />
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            <button
              className="w-full text-left px-2 py-3 rounded-lg hover:bg-surface-3/50 flex items-center gap-3 text-red-500"
              onClick={handleLogout}
            >
              <i className="fad fa-right-from-bracket w-5" />
              <span>Log out</span>
            </button>
          </div>
        </MobileMenu>

        <MobileMenu
          isOpen={showMoreMenu}
          onClose={() => setShowMoreMenu(false)}
          title="Additional Sections"
        >
          <p className="text-xs text-corporate-navy-500 dark:text-gray-500 mb-4">
            Tap to navigate or toggle visibility
          </p>

          <div className="space-y-2 overflow-y-auto max-h-[60vh]">
            {editorTabs
              .filter(tab => !ALWAYS_VISIBLE_SECTIONS.includes(tab.key as any))
              .map((tab) => {
                const hasContent = sectionHasContent(tab.key);
                const isEnabled = visibility[tab.key];

                return (
                  <div
                    key={tab.key}
                    className="flex items-center justify-between p-3 rounded-lg bg-corporate-amber-50/30 dark:bg-corporate-navy-700/30"
                  >
                    <Link
                      href={tab.href}
                      className="flex-1 flex items-center gap-2"
                      onClick={() => setShowMoreMenu(false)}
                    >
                      <span className={`text-sm font-medium ${
                        hasContent 
                          ? 'text-corporate-navy-700 dark:text-gray-200' 
                          : 'text-corporate-navy-500 dark:text-gray-500'
                      }`}>
                        {tab.label}
                      </span>
                      {hasContent && (
                        <span className="text-xs text-corporate-amber-600">
                          <i className="fas fa-check-circle" />
                        </span>
                      )}
                    </Link>

                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={() => toggleVisibility(tab.key)}
                        className="w-4 h-4 text-corporate-amber-600 rounded"
                      />
                      <span className="ml-2 text-xs text-corporate-navy-500 dark:text-gray-400">
                        Show
                      </span>
                    </label>
                  </div>
                );
              })}
          </div>

          <button
            onClick={resetVisibility}
            className="w-full mt-4 text-xs text-corporate-amber-600 hover:text-corporate-amber-500 underline"
          >
            Reset to Default
          </button>
        </MobileMenu>
      </div>

      {/* Main content */}
      <div className="mx-auto px-4" style={{ maxWidth: '1400px' }}>
        {children}
      </div>
    </main>
  );
});

export default ResumeEditorLayout;