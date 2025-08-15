import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { formatDistanceToNow, format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { FileText, MoreVertical, Eye, Download, Copy, Trash2, ChevronRight, ChevronDown, Plus, FolderPlus, Lock, Settings, FolderOpen } from 'lucide-react';
import { deleteDoc, doc, getDoc, addDoc, collection, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase-config';
import { useToast } from '@/lib/client/hooks/ui/use-toast';
import { useAuth } from '@/contexts/firebase-auth-context';
import UpgradeModal from './modals/upgrade-modal';
import EditSectionModal from './modals/edit-section-modal';
import dynamic from 'next/dynamic';

const CreateResumeModal = dynamic(
  () => import('./modals/create-resume-modal'),
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

interface Folder {
  id: string;
  name: string;
  resumes: Resume[];
}

interface UserUsage {
  aiGenerations: number;
  monthlyAiGenerations: number;
  resumeCount: number;
  maxAiGenerations: number;
  pdfGenerations: number;
  maxPdfGenerations: number;
}

interface ResumeListViewProps {
  resumes: Resume[];
  folders?: Folder[];
  usage?: UserUsage;
  onRefresh: () => void;
  onCreateNew: () => void;
  onAddSection?: () => void;
  onUpdateSection?: (folderId: string, newName: string) => Promise<void>;
  onDeleteSection?: (folderId: string) => Promise<void>;
  onMoveResume?: (resumeId: string, folderId: string | null) => Promise<void>;
}

export default function ResumeListView({ resumes, folders = [], usage, onRefresh, onCreateNew, onAddSection, onUpdateSection, onDeleteSection, onMoveResume }: ResumeListViewProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showEditSectionModal, setShowEditSectionModal] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionName, setEditingSectionName] = useState<string>('');
  const [showCreateResumeModal, setShowCreateResumeModal] = useState(false);
  const [createResumeFolderId, setCreateResumeFolderId] = useState<string | null>(null);
  const [activeSectionDropdown, setActiveSectionDropdown] = useState<string | null>(null);
  const [sectionDropdownPosition, setSectionDropdownPosition] = useState({ top: 0, left: 0 });
  const activeSectionDropdownRef = useRef<HTMLDivElement>(null);
  const [showMoveSubmenu, setShowMoveSubmenu] = useState<string | null>(null);
  const [moveSubmenuPosition, setMoveSubmenuPosition] = useState({ top: 0, left: 0 });
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const activeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdownRef.current && !activeDropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
        setShowMoveSubmenu(null);
      }
      if (activeSectionDropdownRef.current && !activeSectionDropdownRef.current.contains(event.target as Node)) {
        setActiveSectionDropdown(null);
      }
    };

    if (activeDropdown || activeSectionDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [activeDropdown, activeSectionDropdown]);

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const parseDate = (date: any): Date | null => {
    try {
      let d: Date;
      if (typeof date === 'string') {
        d = new Date(date);
      } else if (date && typeof date === 'object' && 'seconds' in date) {
        // Firebase Timestamp
        d = new Date(date.seconds * 1000);
      } else {
        d = new Date(date);
      }

      return isNaN(d.getTime()) ? null : d;
    } catch (error) {
      console.error('Error parsing date:', error, date);
      return null;
    }
  };

  const formatDate = (date: any) => {
    const d = parseDate(date);
    if (!d) return 'Unknown date';

    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 30) {
      return formatDistanceToNow(d, { addSuffix: true });
    } else if (diffInDays < 365) {
      return formatDistanceToNow(d, { addSuffix: true }).replace("about ", "");
    } else {
      return format(d, "MMM d, yyyy");
    }
  };

  const formatTooltipDate = (date: any) => {
    const d = parseDate(date);
    return d ? format(d, "MMM d, yyyy h:mm a") : 'Unknown date';
  };

  const handleDelete = async (resumeId: string) => {
    if (confirm('Are you sure you want to delete this resume?')) {
      try {
        await deleteDoc(doc(db, 'resumes', resumeId));
        toast({
          title: "Resume deleted successfully",
        });
        onRefresh();
      } catch (error) {
        console.error('Error deleting resume:', error);
        toast({
          title: "Failed to delete resume",
          variant: "destructive",
        });
      }
    }
  };

  const handleDuplicate = async (resumeId: string) => {
    if (!user) return;

    try {
      // Get the original resume data
      const originalDoc = await getDoc(doc(db, 'resumes', resumeId));
      if (!originalDoc.exists()) {
        toast({
          title: "Resume not found",
          variant: "destructive",
        });
        return;
      }

      const originalData = originalDoc.data();
      
      // Create new resume data with updated title and timestamps
      const { id, ...dataWithoutId } = originalData;
      const duplicatedData = {
        ...dataWithoutId,
        title: `${originalData.title} (Copy)`,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Add the duplicated resume to Firestore
      const newDocRef = await addDoc(collection(db, 'resumes'), duplicatedData);
      
      toast({
        title: "Resume duplicated successfully",
      });
      
      // Refresh the page to show the new resume
      onRefresh();
      
      // Close dropdown
      setActiveDropdown(null);
      
    } catch (error) {
      console.error('Error duplicating resume:', error);
      toast({
        title: "Failed to duplicate resume",
        variant: "destructive",
      });
    }
  };

  const handleDropdownToggle = (resumeId: string, event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    
    if (activeDropdown === resumeId) {
      setActiveDropdown(null);
    } else {
      const rect = event.currentTarget.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right + window.scrollX - 200 // Align right edge
      });
      setActiveDropdown(resumeId);
    }
  };

  const handleSectionDropdownToggle = (folderId: string, event: React.MouseEvent<Element>) => {
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

  const handleDeleteSection = async (folderId: string) => {
    if (confirm('Are you sure you want to delete this section? All resumes in this section will be moved to the main area.')) {
      try {
        if (onDeleteSection) {
          await onDeleteSection(folderId);
        }
        setActiveSectionDropdown(null);
      } catch (error) {
        console.error('Error deleting section:', error);
        toast({
          title: "Failed to delete section",
          variant: "destructive",
        });
      }
    }
  };

  const handleCreateResumeInSection = (folderId: string) => {
    setCreateResumeFolderId(folderId);
    setShowCreateResumeModal(true);
  };

  const handleUpdateSection = async (newName: string) => {
    if (!editingSectionId || !onUpdateSection) return;
    
    try {
      await onUpdateSection(editingSectionId, newName);
      toast({
        title: "Section updated successfully",
      });
    } catch (error) {
      console.error('Error updating section:', error);
      throw error;
    }
  };

  const handleMoveResume = async (resumeId: string, folderId: string | null) => {
    try {
      if (onMoveResume) {
        await onMoveResume(resumeId, folderId);
      }
      setActiveDropdown(null);
      setShowMoveSubmenu(null);
      toast({
        title: "Resume moved successfully",
      });
    } catch (error) {
      console.error('Error moving resume:', error);
      toast({
        title: "Failed to move resume",
        variant: "destructive",
      });
    }
  };

  const handleShowMoveSubmenu = (resumeId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    setMoveSubmenuPosition({
      top: rect.top + window.scrollY,
      left: rect.right + window.scrollX + 5
    });
    setShowMoveSubmenu(resumeId);
  };

  const ResumeItem = ({ resume, isLocked = false }: { resume: Resume; isLocked?: boolean }) => {
    const isDropdownOpen = activeDropdown === resume.id;

    return (
      <div 
        className="bg-white/90 dark:bg-corporate-navy-800/90 backdrop-blur-sm rounded-lg border-2 border-corporate-navy-200 dark:border-corporate-navy-700 hover:border-corporate-amber-300 dark:hover:border-corporate-amber-600/50 hover:bg-corporate-amber-50/30 dark:hover:bg-corporate-navy-800 cursor-pointer px-4 py-3 mt-2 transition-all duration-200 hover:shadow-lg hover:shadow-corporate-gold-500/10 dark:hover:shadow-corporate-navy-900/50"
        onClick={() => {
          if (isLocked) {
            setShowUpgradeModal(true);
          } else {
            router.push(`/dashboard/resumes/${resume.id}/contact`);
          }
        }}
      >
        <div className="relative flex w-full flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex w-full flex-row flex-wrap items-center gap-4 sm:flex-nowrap">
            <div className="relative flex h-6 w-5 items-center">
              <div className="h-6 w-5 rounded-sm border border-corporate-navy-200 dark:border-corporate-navy-700 bg-gradient-to-br from-corporate-gold-50 to-corporate-amber-50 dark:from-corporate-navy-700 dark:to-corporate-navy-800 flex items-center justify-center">
                <FileText className="h-4 w-4 text-corporate-amber-600 dark:text-corporate-amber-400" />
              </div>
            </div>
            <div className="relative flex w-[calc(100%-76px)] sm:w-[calc(100%-292px)] gap-4 sm:flex-row">
              <div className="flex w-full items-center gap-4">
                <p className="overflow-hidden text-ellipsis whitespace-nowrap font-semibold leading-6 text-corporate-navy-900 dark:text-gray-100">
                  {resume.title}
                </p>
                {resume.isTargeted && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-corporate-amber-100 dark:bg-corporate-amber-900/30 text-corporate-amber-700 dark:text-corporate-amber-400 text-xs font-medium rounded-full">
                    <i className="fas fa-lock text-xs"></i>
                    Targeted
                  </span>
                )}
              </div>
            </div>
            <div className="group relative flex w-[100px] flex-col">
              <p className="flex text-sm leading-5 text-gray-500 dark:text-gray-400 sm:hidden">Created</p>
              <p className="overflow-hidden overflow-ellipsis whitespace-nowrap text-gray-700 dark:text-gray-300">
                {formatDate(resume.createdAt)}
              </p>
              <div className="normal-case pointer-events-none h-fit z-50 bg-slate-900 dark:bg-navy-700 px-2 py-1 text-sm font-normal leading-5 text-white transition-opacity rounded opacity-0 group-hover:opacity-100 absolute top-full mt-1 whitespace-nowrap">
                {formatTooltipDate(resume.createdAt)}
              </div>
            </div>
            <div className="group relative flex w-[100px] flex-col">
              <p className="flex text-sm leading-5 text-gray-500 dark:text-gray-400 sm:hidden">Edited</p>
              <p className="overflow-hidden overflow-ellipsis whitespace-nowrap text-gray-700 dark:text-gray-300">
                {formatDate(resume.lastUpdated)}
              </p>
              <div className="normal-case pointer-events-none h-fit z-50 bg-slate-900 dark:bg-navy-700 px-2 py-1 text-sm font-normal leading-5 text-white transition-opacity rounded opacity-0 group-hover:opacity-100 absolute top-full mt-1 whitespace-nowrap">
                {formatTooltipDate(resume.lastUpdated)}
              </div>
            </div>
          </div>
          <div className="absolute right-0 top-0 flex w-6 items-center sm:relative">
            {isLocked ? (
              <div 
                className="h-6 w-6 relative flex cursor-pointer items-center justify-center text-xl group"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUpgradeModal(true);
                }}
              >
                <div className="w-5 h-5 rounded bg-gradient-to-br from-corporate-navy-100 to-corporate-navy-200 dark:from-corporate-navy-700 dark:to-corporate-navy-800 flex items-center justify-center shadow-sm border border-corporate-navy-200 dark:border-corporate-navy-600 group-hover:shadow-md transition-all duration-200">
                  <Lock className="h-3 w-3 text-corporate-navy-500 dark:text-corporate-navy-400" />
                </div>
              </div>
            ) : (
              <div 
                className="h-6 w-6 relative flex cursor-pointer items-center justify-center text-xl hover:text-corporate-amber-600 dark:hover:text-corporate-amber-400"
                onClick={(e) => handleDropdownToggle(resume.id, e)}
              >
                <MoreVertical className="h-5 w-5 text-gray-900 dark:text-gray-100" />
              </div>
            )}
            {isDropdownOpen && !isLocked && createPortal(
              <div 
                ref={activeDropdownRef}
                className="fixed z-[9999] min-w-[200px] bg-white dark:bg-corporate-navy-800 rounded-lg border border-corporate-navy-200 dark:border-corporate-navy-700 shadow-2xl shadow-corporate-gold-500/20 dark:shadow-corporate-navy-900/50 py-2"
                style={{
                  top: dropdownPosition.top,
                  left: dropdownPosition.left,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-corporate-navy-700 dark:text-gray-300 hover:bg-corporate-amber-50 dark:hover:bg-corporate-navy-700 transition-colors"
                  onClick={() => router.push(`/dashboard/resumes/${resume.id}/contact`)}
                >
                  <Eye className="h-4 w-4" />
                  Edit
                </button>
                <button
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-corporate-navy-700 dark:text-gray-300 hover:bg-corporate-amber-50 dark:hover:bg-corporate-navy-700 transition-colors"
                  onClick={() => router.push(`/resume/${resume.id}`)}
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </button>
                <button
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-corporate-navy-700 dark:text-gray-300 hover:bg-corporate-amber-50 dark:hover:bg-corporate-navy-700 transition-colors"
                  onClick={() => window.open(`/api/resumes/${resume.id}/download`, '_blank')}
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </button>
                <button
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-corporate-navy-700 dark:text-gray-300 hover:bg-corporate-amber-50 dark:hover:bg-corporate-navy-700 transition-colors"
                  onClick={() => handleDuplicate(resume.id)}
                >
                  <Copy className="h-4 w-4" />
                  Duplicate
                </button>
                <div className="border-t border-corporate-navy-200 dark:border-corporate-navy-700 my-1"></div>
                <div className="relative">
                  <button
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-corporate-navy-700 dark:text-gray-300 hover:bg-corporate-amber-50 dark:hover:bg-corporate-navy-700 transition-colors"
                    onClick={(e) => handleShowMoveSubmenu(resume.id, e)}
                  >
                    <FolderOpen className="h-4 w-4" />
                    Move to Section
                    <ChevronRight className="h-3 w-3 ml-auto" />
                  </button>
                  {showMoveSubmenu === resume.id && createPortal(
                    <div 
                      className="bg-surface-2 rounded-lg border border-surface-2-stroke absolute flex-col items-start bg-surface-2 py-2 shadow-lg z-50 min-w-28 max-w-72 opacity-1 flex flex-col items-start"
                      style={{
                        width: '170px',
                        top: moveSubmenuPosition.top,
                        left: moveSubmenuPosition.left
                      }}
                    >
                      {/* My Dashboard (main area) */}
                      <div 
                        className="relative flex flex-col justify-between self-stretch px-4 py-1.5 sm:py-1 cursor-pointer sm:hover:bg-menu-item-hover bg-rezi-blue hover:none"
                        onClick={() => handleMoveResume(resume.id, null)}
                      >
                        <div className="flex flex-row items-start gap-2 self-stretch justify-between p-0 w-full">
                          <div className="flex flex-row items-start gap-2 flex-1 min-w-0">
                            <div>
                              <div className="flex h-6 min-w-6 items-center justify-center">
                                <i className="fad fa-file text-left text-base !text-white" aria-hidden="true"></i>
                              </div>
                            </div>
                            <div className="flex flex-col flex-1 min-w-0">
                              <div className="w-fit max-w-full select-none overflow-hidden text-ellipsis whitespace-nowrap text-base leading-6 !text-white" title="My Dashboard">
                                My Dashboard
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {folders.length > 0 && (
                        <>
                          <div className="w-full border-t border-surface-2-stroke mt-2 mb-2"></div>
                          {folders.map((folder) => (
                            <div 
                              key={folder.id}
                              className="relative flex flex-col justify-between self-stretch px-4 py-1.5 sm:py-1 cursor-pointer sm:hover:bg-menu-item-hover"
                              onClick={() => handleMoveResume(resume.id, folder.id)}
                            >
                              <div className="flex flex-row items-start gap-2 self-stretch justify-between p-0 w-full">
                                <div className="flex flex-row items-start gap-2 flex-1 min-w-0">
                                  <div>
                                    <div className="flex h-6 min-w-6 items-center justify-center">
                                      <i className="fad fa-folder text-left text-base text-gray-900" aria-hidden="true"></i>
                                    </div>
                                  </div>
                                  <div className="flex flex-col flex-1 min-w-0">
                                    <div className="w-fit max-w-full select-none overflow-hidden text-ellipsis whitespace-nowrap text-base leading-6 text-gray-900" title={folder.name}>
                                      {folder.name}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                      
                      <div className="w-full border-t border-surface-2-stroke mt-2 mb-2"></div>
                      <div 
                        className="relative flex flex-col justify-between self-stretch px-4 py-1.5 sm:py-1 cursor-pointer sm:hover:bg-menu-item-hover"
                        onClick={() => {
                          setShowMoveSubmenu(null);
                          setActiveDropdown(null);
                          if (onAddSection) onAddSection();
                        }}
                      >
                        <div className="flex flex-row items-start gap-2 self-stretch justify-between p-0 w-full">
                          <div className="flex flex-row items-start gap-2 flex-1 min-w-0">
                            <div>
                              <div className="flex h-6 min-w-6 items-center justify-center">
                                <i className="fad fa-folder-plus text-left text-base text-gray-900" aria-hidden="true"></i>
                              </div>
                            </div>
                            <div className="flex flex-col flex-1 min-w-0">
                              <div className="w-fit max-w-full select-none overflow-hidden text-ellipsis whitespace-nowrap text-base leading-6 text-gray-900" title="Add Section...">
                                Add Section...
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>,
                    document.body
                  )}
                </div>
                <div className="border-t border-corporate-navy-200 dark:border-corporate-navy-700 my-1"></div>
                <button
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  onClick={() => handleDelete(resume.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>,
              document.body
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        {/* List Headers */}
        <div className="relative hidden w-full items-center justify-between gap-4 px-4 text-base leading-6 text-corporate-navy-500 dark:text-gray-400 sm:flex">
          <div className="flex w-full flex-row gap-4">
            <div className="w-5"></div>
            <div className="flex w-[calc(100%-292px)] gap-4 self-stretch">
              <div>Name</div>
            </div>
            <div className="w-[100px]">Created</div>
            <div className="w-[100px]">Edited</div>
          </div>
          <div className="h-6 w-6"></div>
        </div>

        {/* Create New Resume */}
        <div className="mt-2">
          <div 
            className="flex w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-corporate-amber-400 dark:border-corporate-navy-600 px-4 py-3 hover:border-corporate-amber-500 dark:hover:border-corporate-amber-500 hover:bg-corporate-amber-50/50 dark:hover:bg-corporate-navy-800/50 transition-all duration-200"
            onClick={onCreateNew}
          >
            <div className="truncate text-center text-base font-semibold leading-6 text-corporate-amber-600 dark:text-corporate-amber-400">
              Create new resume
            </div>
          </div>
        </div>

        {/* Resume List */}
        {resumes.filter(r => !r.folderId).map((resume, index) => (
          <ResumeItem 
            key={resume.id} 
            resume={resume} 
            isLocked={usage && usage.maxPdfGenerations !== -1 && usage.pdfGenerations >= usage.maxPdfGenerations && (index === 1 || index === 2)}
          />
        ))}

        {/* Folders */}
        {folders.map((folder) => (
          <div key={folder.id} className="mt-4">
            <div className="relative">
              <div className="relative flex h-8 flex-row items-center gap-4 py-4">
                <div className="group flex max-w-[calc(100%_-_50px)] flex-row items-center gap-1">
                  <button 
                    className="relative flex items-center justify-center font-bold uppercase text-corporate-navy-900 dark:text-gray-100 hover:bg-corporate-amber-50 dark:hover:bg-corporate-navy-700 bg-transparent px-2 py-1 min-h-8 leading-4 rounded-md text-xs transition-colors cursor-pointer"
                    onClick={() => toggleFolder(folder.id)}
                  >
                    {expandedFolders.has(folder.id) ? (
                      <ChevronDown className="h-4 w-4 mr-1" />
                    ) : (
                      <ChevronRight className="h-4 w-4 mr-1" />
                    )}
                    <span className="truncate px-1 text-left max-w-full">{folder.name}</span>
                  </button>
                  <div className="invisible flex flex-row items-center gap-1 group-hover:visible">
                    <Plus 
                      className="h-5 w-5 text-corporate-amber-600 dark:text-corporate-amber-400 hover:text-corporate-amber-700 dark:hover:text-corporate-amber-300 cursor-pointer transition-colors" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCreateResumeInSection(folder.id);
                      }}
                    />
                    <MoreVertical 
                      className="h-5 w-5 text-corporate-navy-900 dark:text-gray-100 hover:text-corporate-amber-600 dark:hover:text-corporate-amber-400 cursor-pointer transition-colors" 
                      onClick={(e) => handleSectionDropdownToggle(folder.id, e)}
                    />
                  </div>
                  {activeSectionDropdown === folder.id && createPortal(
                    <div 
                      ref={activeSectionDropdownRef}
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
                        <Settings className="h-4 w-4" />
                        Settings
                      </button>
                      <div className="border-t border-corporate-navy-200 dark:border-corporate-navy-700 my-1"></div>
                      <button
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        onClick={() => handleDeleteSection(folder.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>,
                    document.body
                  )}
                </div>
              </div>
              {expandedFolders.has(folder.id) && (
                <div className="w-full pb-4">
                  {/* List Headers for Folder */}
                  <div className="relative hidden w-full items-center justify-between gap-4 px-4 text-base leading-6 text-corporate-navy-500 dark:text-gray-400 sm:flex">
                    <div className="flex w-full flex-row gap-4">
                      <div className="w-5"></div>
                      <div className="flex w-[calc(100%-292px)] gap-4 self-stretch">
                        <div>Name</div>
                      </div>
                      <div className="w-[100px]">Created</div>
                      <div className="w-[100px]">Edited</div>
                    </div>
                    <div className="h-6 w-6"></div>
                  </div>
                  {folder.resumes.map((resume, index) => (
                    <ResumeItem 
                      key={resume.id} 
                      resume={resume} 
                      isLocked={usage && usage.maxPdfGenerations !== -1 && usage.pdfGenerations >= usage.maxPdfGenerations && (index === 1 || index === 2)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Add Section Button */}
        <div className="flex flex-row items-center justify-start py-4">
          <button 
            onClick={onAddSection}
            className="group relative flex items-center justify-center font-bold uppercase text-xs leading-4 text-corporate-navy-700 dark:text-gray-300 hover:text-corporate-navy-900 dark:hover:text-white bg-transparent hover:bg-corporate-amber-50/50 dark:hover:bg-corporate-navy-700/50 px-3 py-2 rounded-md transition-all duration-200 border-none focus:outline-none focus:ring-2 focus:ring-corporate-amber-500/20"
          >
            <FolderPlus className="w-4 h-4 mr-1.5 text-corporate-amber-600 dark:text-corporate-amber-400 group-hover:text-corporate-amber-700 dark:group-hover:text-corporate-amber-300 transition-colors" />
            <span className="px-1">Add section</span>
          </button>
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
      />
      
      {/* Edit Section Modal */}
      <EditSectionModal 
        isOpen={showEditSectionModal}
        onOpenChange={setShowEditSectionModal}
        currentName={editingSectionName}
        onSectionUpdate={handleUpdateSection}
      />
      
      {/* Create Resume Modal */}
      <CreateResumeModal 
        isOpen={showCreateResumeModal}
        onOpenChange={(open) => {
          setShowCreateResumeModal(open);
          if (!open) {
            setCreateResumeFolderId(null);
          }
        }}
        // Additional prop to specify folder ID when creating in section
        folderId={createResumeFolderId}
      />
    </div>
  );
}