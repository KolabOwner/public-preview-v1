// Updated ResumesPage component with JobInfoProvider integration

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/firebase-auth-context';
import { useUserUsage } from '@/lib/client/hooks/auth/use-user-usage';
import { JobInfoProvider } from '@/contexts/job-info-context';
import { collection, getDocs, query, where, orderBy, addDoc, serverTimestamp, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from "@/config/firebase-config";
import ResumeGridView from '@/components/features/resume/resume-grid-view';
import ResumeListView from '@/components/features/resume/resume-list-view';
import NotificationsSidebar from '@/components/shared/notifications-sidebar';
import DashboardNav from '@/components/shared/dashboard-nav';
import ViewControls from '@/components/shared/view-controls';
import dynamic from 'next/dynamic';
import { createPortal } from 'react-dom';

// Dynamic imports with no SSR to fix serialization error
const CreateResumeModal = dynamic(
  () => import('@/components/features/resume/modals/create-resume-modal'),
  { ssr: false }
);

const UpgradeModal = dynamic(
  () => import('@/components/features/resume/modals/upgrade-modal'),
  { ssr: false }
);

const AddSectionModal = dynamic(
  () => import('@/components/features/resume/modals/add-section-modal'),
  { ssr: false }
);

const EditSectionModal = dynamic(
  () => import('@/components/features/resume/modals/edit-section-modal'),
  { ssr: false }
);

interface Resume {
  id: string;
  title: string;
  lastUpdated: string;
  createdAt: string;
  isTargeted?: boolean;
  folderId?: string;
}

interface ResumeFolder {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  resumeCount?: number;
}

// Inner component wrapped by JobInfoProvider
function ResumesPageContent() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [folders, setFolders] = useState<ResumeFolder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'created' | 'updated'>('created');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [showEditSectionModal, setShowEditSectionModal] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionName, setEditingSectionName] = useState<string>('');
  const [showCreateResumeModal, setShowCreateResumeModal] = useState(false);
  const [createResumeFolderId, setCreateResumeFolderId] = useState<string | null>(null);
  const [activeSectionDropdown, setActiveSectionDropdown] = useState<string | null>(null);
  const [sectionDropdownPosition, setSectionDropdownPosition] = useState({ top: 0, left: 0 });
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const { usage, loading: usageLoading, canDownloadPdf } = useUserUsage();

  // Handle click outside to close section dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-section-dropdown]')) {
        setActiveSectionDropdown(null);
      }
    };

    if (activeSectionDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [activeSectionDropdown]);

  const fetchFolders = async () => {
    if (!user) return;

    try {
      const foldersQuery = query(
        collection(db, 'resume_folders'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'asc')
      );

      const querySnapshot = await getDocs(foldersQuery);
      const folderData: ResumeFolder[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        folderData.push({
          id: doc.id,
          name: data.name,
          userId: data.userId,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          resumeCount: 0 // Will be calculated from resumes
        });
      });

      setFolders(folderData);
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

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
          folderId: data.folderId || undefined,
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
    fetchFolders();
  }, [user, sortBy]);

  const handleCreateSection = async (sectionName: string) => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    try {
      const newFolder = {
        name: sectionName,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'resume_folders'), newFolder);
      
      // Refresh folders after creation
      await fetchFolders();
      
      console.log('Section created successfully:', sectionName);
    } catch (error) {
      console.error('Error creating section:', error);
      throw new Error('Failed to create section');
    }
  };

  const handleUpdateSection = async (folderId: string, newName: string) => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    try {
      const folderRef = doc(db, 'resume_folders', folderId);
      await updateDoc(folderRef, {
        name: newName,
        updatedAt: serverTimestamp()
      });
      
      // Refresh folders after update
      await fetchFolders();
      
      console.log('Section updated successfully:', newName);
    } catch (error) {
      console.error('Error updating section:', error);
      throw new Error('Failed to update section');
    }
  };

  const handleDeleteSection = async (folderId: string) => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    try {
      // First, update all resumes in this folder to remove folderId
      const resumesInFolder = resumes.filter(r => r.folderId === folderId);
      const updatePromises = resumesInFolder.map(resume => {
        const resumeRef = doc(db, 'resumes', resume.id);
        return updateDoc(resumeRef, {
          folderId: null,
          updatedAt: serverTimestamp()
        });
      });
      
      await Promise.all(updatePromises);
      
      // Then delete the folder
      await deleteDoc(doc(db, 'resume_folders', folderId));
      
      // Refresh both folders and resumes
      await Promise.all([fetchFolders(), fetchResumes()]);
      
      console.log('Section deleted successfully');
    } catch (error) {
      console.error('Error deleting section:', error);
      throw new Error('Failed to delete section');
    }
  };

  const handleMoveResume = async (resumeId: string, folderId: string | null) => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    try {
      const resumeRef = doc(db, 'resumes', resumeId);
      await updateDoc(resumeRef, {
        folderId: folderId,
        updatedAt: serverTimestamp()
      });
      
      // Refresh both resumes and folders after move
      await Promise.all([fetchResumes(), fetchFolders()]);
      
      console.log('Resume moved successfully');
    } catch (error) {
      console.error('Error moving resume:', error);
      throw new Error('Failed to move resume');
    }
  };

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleSectionDropdownToggle = (folderId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (activeSectionDropdown === folderId) {
      setActiveSectionDropdown(null);
    } else {
      const rect = event.currentTarget.getBoundingClientRect();
      setSectionDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right + window.scrollX - 200
      });
      setActiveSectionDropdown(folderId);
    }
  };

  const handleEditSection = (folderId: string, currentName: string) => {
    setEditingSectionId(folderId);
    setEditingSectionName(currentName);
    setShowEditSectionModal(true);
    setActiveSectionDropdown(null);
  };

  const handleDeleteSectionFromGrid = async (folderId: string) => {
    if (confirm('Are you sure you want to delete this section? All resumes in this section will be moved to the main area.')) {
      try {
        await handleDeleteSection(folderId);
        setActiveSectionDropdown(null);
      } catch (error) {
        console.error('Error deleting section:', error);
      }
    }
  };

  const handleCreateResumeInSection = (folderId: string) => {
    setCreateResumeFolderId(folderId);
    setShowCreateResumeModal(true);
  };

  const handleUpdateSectionFromGrid = async (newName: string) => {
    if (!editingSectionId) return;
    
    try {
      await handleUpdateSection(editingSectionId, newName);
    } catch (error) {
      console.error('Error updating section:', error);
      throw error;
    }
  };

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
                      {/* Main resumes (not in any folder) */}
                      <div className="mb-4 flex flex-row flex-wrap gap-4 md:gap-6">
                        <CreateResumeCard />

                        {resumes.filter(r => !r.folderId).map((resume, index) => (
                          <ResumeGridView
                            key={resume.id}
                            resume={resume}
                            isLocked={usage.maxPdfGenerations !== -1 && usage.pdfGenerations >= usage.maxPdfGenerations && (index === 1 || index === 2)}
                            usage={usage}
                            folders={folders.map(folder => ({
                              id: folder.id,
                              name: folder.name,
                              resumes: resumes.filter(r => r.folderId === folder.id)
                            }))}
                            onRefresh={() => {
                              setIsLoading(true);
                              fetchResumes();
                            }}
                            onMoveResume={handleMoveResume}
                            onAddSection={() => setShowAddSectionModal(true)}
                          />
                        ))}
                      </div>
                      
                      {/* Folder sections */}
                      {folders.map((folder) => {
                        const folderResumes = resumes.filter(r => r.folderId === folder.id);
                        
                        return (
                          <div key={folder.id} className="mb-8">
                            <div className="relative">
                              <div className="relative flex h-8 flex-row items-center gap-4 py-4 mb-4">
                                <div className="group flex max-w-[calc(100%_-_50px)] flex-row items-center gap-1">
                                  <button 
                                    className="relative flex items-center justify-center font-bold uppercase text-corporate-navy-900 dark:text-gray-100 hover:bg-corporate-amber-50 dark:hover:bg-corporate-navy-700 bg-transparent px-2 py-1 min-h-8 leading-4 rounded-md text-xs transition-colors cursor-pointer"
                                    onClick={() => toggleFolder(folder.id)}
                                  >
                                    {expandedFolders.has(folder.id) ? (
                                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                      </svg>
                                    ) : (
                                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                      </svg>
                                    )}
                                    <span className="truncate px-1 text-left max-w-full">{folder.name}</span>
                                  </button>
                                  <div className="invisible flex flex-row items-center gap-1 group-hover:visible">
                                    <svg 
                                      className="h-5 w-5 text-corporate-amber-600 dark:text-corporate-amber-400 hover:text-corporate-amber-700 dark:hover:text-corporate-amber-300 cursor-pointer transition-colors"
                                      fill="none" 
                                      stroke="currentColor" 
                                      viewBox="0 0 24 24"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCreateResumeInSection(folder.id);
                                      }}
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    <svg 
                                      className="h-5 w-5 text-corporate-navy-900 dark:text-gray-100 hover:text-corporate-amber-600 dark:hover:text-corporate-amber-400 cursor-pointer transition-colors"
                                      fill="none" 
                                      stroke="currentColor" 
                                      viewBox="0 0 24 24"
                                      onClick={(e) => handleSectionDropdownToggle(folder.id, e)}
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                    </svg>
                                  </div>
                                  {activeSectionDropdown === folder.id && createPortal(
                                    <div 
                                      data-section-dropdown="true"
                                      className="fixed z-[9999] min-w-[200px] bg-white dark:bg-corporate-navy-800 rounded-lg border border-corporate-navy-200 dark:border-corporate-navy-700 shadow-2xl shadow-corporate-gold-500/20 dark:shadow-corporate-navy-900/50 py-2"
                                      style={{
                                        top: sectionDropdownPosition.top,
                                        left: sectionDropdownPosition.left,
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <button
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-corporate-navy-700 dark:text-gray-300 hover:bg-corporate-amber-50 dark:hover:bg-corporate-navy-700 transition-colors"
                                        onClick={() => handleEditSection(folder.id, folder.name)}
                                      >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        Settings
                                      </button>
                                      <div className="border-t border-corporate-navy-200 dark:border-corporate-navy-700 my-1"></div>
                                      <button
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        onClick={() => handleDeleteSectionFromGrid(folder.id)}
                                      >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Delete
                                      </button>
                                    </div>,
                                    document.body
                                  )}
                                </div>
                              </div>
                              {expandedFolders.has(folder.id) && (
                                <div className="flex flex-row flex-wrap gap-4 md:gap-6">
                                  {folderResumes.map((resume, index) => (
                                    <ResumeGridView
                                      key={resume.id}
                                      resume={resume}
                                      isLocked={usage.maxPdfGenerations !== -1 && usage.pdfGenerations >= usage.maxPdfGenerations && (index === 1 || index === 2)}
                                      usage={usage}
                                      folders={folders.map(f => ({
                                        id: f.id,
                                        name: f.name,
                                        resumes: resumes.filter(r => r.folderId === f.id)
                                      }))}
                                      onRefresh={() => {
                                        setIsLoading(true);
                                        fetchResumes();
                                      }}
                                      onMoveResume={handleMoveResume}
                                      onAddSection={() => setShowAddSectionModal(true)}
                                    />
                                  ))}
                                  {folderResumes.length === 0 && (
                                    <div className="text-gray-500 dark:text-gray-400 text-sm italic py-4">
                                      No resumes in this section yet. Use the + button to create one.
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Add Section Button for Grid View */}
                      <div className="flex flex-row items-center justify-start py-4">
                        <button 
                          onClick={() => setShowAddSectionModal(true)}
                          className="group relative flex items-center justify-center font-bold uppercase text-xs leading-4 text-corporate-navy-700 dark:text-gray-300 hover:text-corporate-navy-900 dark:hover:text-white bg-transparent hover:bg-corporate-amber-50/50 dark:hover:bg-corporate-navy-700/50 px-3 py-2 rounded-md transition-all duration-200 border-none focus:outline-none focus:ring-2 focus:ring-corporate-amber-500/20"
                        >
                          <svg 
                            className="w-4 h-4 mr-1.5 text-corporate-amber-600 dark:text-corporate-amber-400 group-hover:text-corporate-amber-700 dark:group-hover:text-corporate-amber-300 transition-colors"
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                          </svg>
                          <span className="px-1">Add section</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <ResumeListView
                      resumes={resumes}
                      folders={folders.map(folder => ({
                        id: folder.id,
                        name: folder.name,
                        resumes: resumes.filter(r => r.folderId === folder.id)
                      }))}
                      usage={usage}
                      onRefresh={() => {
                        setIsLoading(true);
                        fetchResumes();
                      }}
                      onCreateNew={() => setShowCreateModal(true)}
                      onAddSection={() => setShowAddSectionModal(true)}
                      onUpdateSection={handleUpdateSection}
                      onDeleteSection={handleDeleteSection}
                      onMoveResume={handleMoveResume}
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

          <AddSectionModal
            isOpen={showAddSectionModal}
            onOpenChange={setShowAddSectionModal}
            onSectionCreate={handleCreateSection}
          />

          <EditSectionModal 
            isOpen={showEditSectionModal}
            onOpenChange={setShowEditSectionModal}
            currentName={editingSectionName}
            onSectionUpdate={handleUpdateSectionFromGrid}
          />
          
          <CreateResumeModal 
            isOpen={showCreateResumeModal}
            onOpenChange={(open) => {
              setShowCreateResumeModal(open);
              if (!open) {
                setCreateResumeFolderId(null);
              }
            }}
            folderId={createResumeFolderId}
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
