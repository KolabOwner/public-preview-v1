import { useState, useRef, useEffect } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { FileText, MoreVertical, Eye, Download, Copy, Trash2, ChevronRight, ChevronDown, Plus, FolderPlus } from 'lucide-react';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/features/auth/firebase-config';
import { useToast } from '@/components/hooks/use-toast';

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

interface ResumeListViewProps {
  resumes: Resume[];
  folders?: Folder[];
  onRefresh: () => void;
  onCreateNew: () => void;
}

export default function ResumeListView({ resumes, folders = [], onRefresh, onCreateNew }: ResumeListViewProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const formatDate = (date: string) => {
    try {
      // Handle Firebase Timestamp or string date
      let d: Date;
      if (typeof date === 'string') {
        d = new Date(date);
      } else if (date && typeof date === 'object' && 'seconds' in date) {
        // Firebase Timestamp
        d = new Date(date.seconds * 1000);
      } else {
        d = new Date(date);
      }

      // Check if date is valid
      if (isNaN(d.getTime())) {
        return 'Unknown date';
      }

      const now = new Date();
      const diffInDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffInDays < 30) {
        return formatDistanceToNow(d, { addSuffix: true });
      } else if (diffInDays < 365) {
        return formatDistanceToNow(d, { addSuffix: true }).replace("about ", "");
      } else {
        return format(d, "MMM d, yyyy");
      }
    } catch (error) {
      console.error('Error formatting date:', error, date);
      return 'Unknown date';
    }
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
    toast({
      title: "Duplicate functionality coming soon",
    });
  };

  const ResumeItem = ({ resume }: { resume: Resume }) => {
    const isDropdownOpen = activeDropdown === resume.id;

    return (
      <div 
        className="bg-white/80 dark:bg-navy-800/90 backdrop-blur-sm rounded-lg border border-slate-200 dark:border-navy-700 hover:bg-slate-50 dark:hover:bg-navy-800 cursor-pointer px-4 py-3 mt-2 transition-all duration-200 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-navy-900/50"
        onClick={() => router.push(`/resume-builder/${resume.id}`)}
      >
        <div className="relative flex w-full flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex w-full flex-row flex-wrap items-center gap-4 sm:flex-nowrap">
            <div className="relative flex h-6 w-5 items-center">
              <div className="h-6 w-5 rounded-sm border border-slate-200 dark:border-navy-700 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-navy-700 dark:to-navy-800 flex items-center justify-center">
                <FileText className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </div>
            </div>
            <div className="relative flex w-[calc(100%-76px)] sm:w-[calc(100%-292px)] gap-4 sm:flex-row">
              <div className="flex w-full items-center gap-4">
                <p className="overflow-hidden text-ellipsis whitespace-nowrap font-semibold leading-6 text-gray-900 dark:text-gray-100">
                  {resume.title}
                </p>
                {resume.isTargeted && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full">
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
                {(() => {
                  try {
                    const d = new Date(resume.createdAt);
                    return isNaN(d.getTime()) ? 'Unknown date' : format(d, "MMM d, yyyy h:mm a");
                  } catch {
                    return 'Unknown date';
                  }
                })()}
              </div>
            </div>
            <div className="group relative flex w-[100px] flex-col">
              <p className="flex text-sm leading-5 text-gray-500 dark:text-gray-400 sm:hidden">Edited</p>
              <p className="overflow-hidden overflow-ellipsis whitespace-nowrap text-gray-700 dark:text-gray-300">
                {formatDate(resume.lastUpdated)}
              </p>
              <div className="normal-case pointer-events-none h-fit z-50 bg-slate-900 dark:bg-navy-700 px-2 py-1 text-sm font-normal leading-5 text-white transition-opacity rounded opacity-0 group-hover:opacity-100 absolute top-full mt-1 whitespace-nowrap">
                {(() => {
                  try {
                    const d = new Date(resume.lastUpdated);
                    return isNaN(d.getTime()) ? 'Unknown date' : format(d, "MMM d, yyyy h:mm a");
                  } catch {
                    return 'Unknown date';
                  }
                })()}
              </div>
            </div>
          </div>
          <div className="absolute right-0 top-0 flex w-6 items-center sm:relative">
            <div 
              className="h-6 w-6 relative flex cursor-pointer items-center justify-center text-xl hover:text-blue-600 dark:hover:text-blue-400"
              onClick={(e) => {
                e.stopPropagation();
                setActiveDropdown(isDropdownOpen ? null : resume.id);
              }}
            >
              <MoreVertical className="h-5 w-5 text-gray-900 dark:text-gray-100" />
            </div>
            {isDropdownOpen && (
              <div 
                ref={dropdownRef}
                className="absolute right-0 top-8 z-50 min-w-[200px] bg-white dark:bg-navy-800 rounded-lg border border-slate-200 dark:border-navy-700 shadow-2xl shadow-slate-400/20 dark:shadow-navy-900/50 py-2"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-navy-700 transition-colors"
                  onClick={() => router.push(`/resume-builder/${resume.id}`)}
                >
                  <Eye className="h-4 w-4" />
                  Edit
                </button>
                <button
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-navy-700 transition-colors"
                  onClick={() => router.push(`/resume/${resume.id}`)}
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </button>
                <button
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-navy-700 transition-colors"
                  onClick={() => window.open(`/api/resume-endpoints/download?id=${resume.id}`, '_blank')}
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </button>
                <button
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-navy-700 transition-colors"
                  onClick={() => handleDuplicate(resume.id)}
                >
                  <Copy className="h-4 w-4" />
                  Duplicate
                </button>
                <div className="border-t border-slate-200 dark:border-navy-700 my-1"></div>
                <button
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  onClick={() => handleDelete(resume.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
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
        <div className="relative hidden w-full items-center justify-between gap-4 px-4 text-base leading-6 text-gray-500 dark:text-gray-400 sm:flex">
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
            className="flex w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-400 dark:border-navy-600 px-4 py-3 hover:border-slate-500 dark:hover:border-navy-500 hover:bg-slate-50/50 dark:hover:bg-navy-800/50 transition-all duration-200"
            onClick={onCreateNew}
          >
            <div className="truncate text-center text-base font-semibold leading-6 text-gray-600 dark:text-gray-400">
              Create new resume
            </div>
          </div>
        </div>

        {/* Resume List */}
        {resumes.filter(r => !r.folderId).map((resume) => (
          <ResumeItem key={resume.id} resume={resume} />
        ))}

        {/* Folders */}
        {folders.map((folder) => (
          <div key={folder.id} className="mt-4">
            <div className="relative">
              <div className="relative flex h-8 flex-row items-center gap-4 py-4">
                <div 
                  className="group flex max-w-[calc(100%_-_50px)] flex-row items-center gap-1 cursor-pointer"
                  onClick={() => toggleFolder(folder.id)}
                >
                  <button className="relative flex items-center justify-center font-bold uppercase text-gray-900 dark:text-gray-100 hover:bg-slate-100 dark:hover:bg-navy-700 bg-transparent px-2 py-1 min-h-8 leading-4 rounded-md text-xs transition-colors">
                    {expandedFolders.has(folder.id) ? (
                      <ChevronDown className="h-4 w-4 mr-1" />
                    ) : (
                      <ChevronRight className="h-4 w-4 mr-1" />
                    )}
                    <span className="truncate px-1 text-left max-w-full">{folder.name}</span>
                  </button>
                  <div className="invisible flex flex-row items-center gap-1 group-hover:visible">
                    <Plus className="h-5 w-5 text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer" />
                    <MoreVertical className="h-5 w-5 text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer" />
                  </div>
                </div>
              </div>
              {expandedFolders.has(folder.id) && (
                <div className="w-full pb-4">
                  {/* List Headers for Folder */}
                  <div className="relative hidden w-full items-center justify-between gap-4 px-4 text-base leading-6 text-gray-500 dark:text-gray-400 sm:flex">
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
                  {folder.resumes.map((resume) => (
                    <ResumeItem key={resume.id} resume={resume} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Add Section Button */}
        <div className="flex flex-row items-center justify-start py-4">
          <button className="relative flex items-center justify-center font-bold uppercase text-gray-900 dark:text-gray-100 hover:bg-slate-100 dark:hover:bg-navy-700 bg-transparent px-2 py-1 min-h-8 leading-4 rounded-md text-xs transition-colors">
            <FolderPlus className="h-4 w-4 mr-1" />
            <span className="px-1">Add section</span>
          </button>
        </div>
      </div>
    </div>
  );
}