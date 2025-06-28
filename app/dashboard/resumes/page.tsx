'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useUserUsage } from '@/hooks/use-user-usage';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from "@/lib/features/auth/firebase-config";
import ResumeGridCard from '@/components/resume/resume-grid-card';
import ResumeListView from '@/components/resume/resume-list-view';
import NotificationsSidebar from '@/components/ui/notifications-sidebar';
import DashboardNav from '@/components/ui/dashboard-nav';
import ViewControls from '@/components/ui/view-controls';
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
  const [showNotifications, setShowNotifications] = useState(false);
  const { user } = useAuth();
  const { usage, loading: usageLoading, canDownloadPdf } = useUserUsage();


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

  const toggleSortBy = () => {
    setSortBy(sortBy === 'created' ? 'updated' : 'created');
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
          <DashboardNav 
            activeTab="resumes" 
            showNotifications={true}
            onNotificationClick={() => setShowNotifications(true)}
          />

          {/* Main content */}
          <div className="flex-start flex self-stretch">
            <div className="w-full">
              <ViewControls 
                sortBy={sortBy}
                viewMode={viewMode}
                onSortToggle={toggleSortBy}
                onViewModeChange={(mode) => setViewMode(mode)}
              />

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