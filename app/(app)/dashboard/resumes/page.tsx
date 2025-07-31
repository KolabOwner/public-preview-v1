// Updated ResumesPage component with JobInfoProvider integration

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/firebase-auth-context';
import { useUserUsage } from '@/lib/client/hooks/auth/use-user-usage';
import { JobInfoProvider } from '@/contexts/job-info-context';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from "@/config/firebase-config";
import ResumeGridView from '@/components/features/resume/resume-grid-view';
import ResumeListView from '@/components/features/resume/resume-list-view';
import NotificationsSidebar from '@/components/shared/notifications-sidebar';
import DashboardNav from '@/components/shared/dashboard-nav';
import ViewControls from '@/components/shared/view-controls';
import dynamic from 'next/dynamic';

// Dynamic imports with no SSR to fix serialization error
const CreateResumeModal = dynamic(
  () => import('@/components/features/resume/modals/create-resume-modal'),
  { ssr: false }
);

const UpgradeModal = dynamic(
  () => import('@/components/features/resume/modals/upgrade-modal'),
  { ssr: false }
);

interface Resume {
  id: string;
  title: string;
  lastUpdated: string;
  createdAt: string;
  isTargeted?: boolean;
}

// Inner component wrapped by JobInfoProvider
function ResumesPageContent() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'created' | 'updated'>('created');
  const [showNotifications, setShowNotifications] = useState(false);
  const { user } = useAuth();
  const { usage, loading: usageLoading, canDownloadPdf } = useUserUsage();

  const fetchResumes = async () => {
    if (!user) return;

    try {
      // Always use updatedAt for ordering since it's guaranteed to exist
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
          createdAt: data.createdAt || data.updatedAt, // fallback to updatedAt if createdAt doesn't exist
          isTargeted: data.isTargeted || false,
        });
      });

      // Sort client-side based on the selected sort option
      const sortedResumes = resumeData.sort((a, b) => {
        const dateA = sortBy === 'created' ? a.createdAt : a.lastUpdated;
        const dateB = sortBy === 'created' ? b.createdAt : b.lastUpdated;
        
        // Handle case where dates might be Timestamp objects or strings
        const timeA = (dateA as any)?.toDate ? (dateA as any).toDate().getTime() : new Date(dateA as string).getTime();
        const timeB = (dateB as any)?.toDate ? (dateB as any).toDate().getTime() : new Date(dateB as string).getTime();
        
        return timeB - timeA; // desc order
      });

      setResumes(sortedResumes);
    } catch (error) {
      console.error('Error fetching resumes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, [user, sortBy]);

  const handleStateChange = useCallback(({ sortBy: newSortBy, viewMode: newViewMode }: { sortBy: 'created' | 'updated'; viewMode: 'grid' | 'list' }) => {
    setSortBy(newSortBy);
    setViewMode(newViewMode);
  }, []);

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
    <div className="flex justify-center px-0 pt-16 lg:pt-0 lg:px-16">
      <div className="relative w-full max-w-full flex flex-col justify-start gap-4 px-4 md:px-6 lg:max-w-[824px] lg:px-6 xl1:max-w-[968px] xl:max-w-[1248px] xl:px-8" id="layout_full_screen">
        <main>
          <DashboardNav
            activeTab="resumes"
            showNotifications={true}
            onNotificationClick={() => setShowNotifications(true)}
          />

          {/* Main content */}
          <div className="flex-start flex self-stretch">
            <div className="w-full">
              <ViewControls
                initialSortBy={sortBy}
                initialViewMode={viewMode}
                onStateChange={handleStateChange}
              />

              {/* Resume Grid/List View */}
              <div className="flex flex-col gap-4">
                {resumes.length > 0 ? (
                  viewMode === 'grid' ? (
                    <div>
                      <div className="mb-4 flex flex-row flex-wrap gap-4 md:gap-6">
                        <CreateResumeCard />

                        {resumes.map((resume, index) => (
                          <ResumeGridView
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
                      <button
                        onClick={() => canDownloadPdf() ? setShowCreateModal(true) : setShowUpgradeModal(true)}
                        className={`border-2 border-slate-300 dark:border-navy-600 bg-white/70 dark:bg-navy-700/50 text-slate-700 dark:text-slate-300 font-bold py-3 px-6 rounded-lg shadow-md ${
                          !canDownloadPdf() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white dark:hover:bg-navy-700 transition-colors'
                        }`}
                        disabled={!canDownloadPdf()}
                      >
                        Upload Existing Resume
                      </button>
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

// Main component with JobInfoProvider wrapper
export default function ResumesPage() {
  return (
    <JobInfoProvider>
      <ResumesPageContent />
    </JobInfoProvider>
  );
}
