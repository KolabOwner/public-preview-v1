'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { formatDistanceToNow } from 'date-fns';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from "@/lib/features/auth/firebase-config";

interface CoverLetter {
  id: string;
  title: string;
  company: string;
  jobTitle: string;
  content: string;
  createdAt: any;
  updatedAt: any;
  contactInfo?: any;
}

interface CoverLetterGridProps {
  coverLetters: CoverLetter[];
  onRefresh: () => void;
}

export default function CoverLetterGrid({ coverLetters, onRefresh }: CoverLetterGridProps) {
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownButtonRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownButtonRef.current && !dropdownButtonRef.current.contains(event.target as Node)) {
        const target = event.target as Element;
        if (!target.closest('[data-dropdown-portal]')) {
          setShowDropdown(null);
        }
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  const handleMenuToggle = (letterId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (showDropdown !== letterId && e.currentTarget instanceof HTMLElement) {
      const rect = e.currentTarget.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right + window.scrollX - 160
      });
    }
    
    setShowDropdown(showDropdown === letterId ? null : letterId);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this cover letter?')) {
      try {
        // Update the resume document to remove the cover letter
        const resumeRef = doc(db, 'resumes', id);
        await updateDoc(resumeRef, { coverLetter: null });
        onRefresh();
      } catch (error) {
        console.error('Error deleting cover letter:', error);
      }
    }
  };

  // Create cover letter card
  const CreateCoverLetterCard = () => (
    <div className="flex w-[calc(50vw_-_25px)] cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-slate-300 dark:border-navy-600 bg-white/50 dark:bg-navy-800/30 backdrop-blur-sm p-4 xs:h-48 sm:h-[290px] md:w-60 hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
         onClick={() => router.push('/dashboard/resumes')}>
      <div className="relative flex w-[calc(50vw_-_25px)] items-center justify-center xs:h-48 sm:h-[290px] md:w-60 flex-col gap-2">
        <i className="fad fa-plus text-2xl text-slate-600 dark:text-slate-300" aria-hidden="true"></i>
        <div className="line-clamp-3 text-center text-base font-semibold text-slate-600 dark:text-slate-300">Create new Cover Letter</div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-row flex-wrap gap-4 md:gap-6">
      <CreateCoverLetterCard />
      
      {coverLetters.map((letter) => (
        <div key={letter.id} className="relative">
          <div className="relative w-[calc(50vw_-_25px)] xs:h-48 sm:h-[290px] md:w-60">
            <div className="bg-white/80 dark:bg-navy-800/90 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-navy-700 relative w-[calc(50vw_-_25px)] xs:h-48 sm:h-[290px] md:w-60 shadow-lg shadow-slate-200/30 dark:shadow-navy-900/50">
              <div className="relative h-[calc(100%-3.5rem)] overflow-hidden">
                <Link
                  className="relative"
                  href={`/dashboard/resumes/${letter.id}/cover-letter`}
                >
                  <div className="h-full w-full overflow-hidden rounded-lg rounded-b-none border-b-0 p-0">
                    <div>
                      <div data-size="small" data-cropped="true" data-editable="false" className="relative bg-white dark:bg-slate-800 !text-gray-900 dark:!text-gray-100">
                        <div className="p-4">
                          <div className="text-sm font-medium truncate">{letter.company}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{letter.jobTitle}</div>
                          <div className="mt-2 text-xs text-gray-600 dark:text-gray-300 line-clamp-4">
                            {letter.content.substring(0, 150)}...
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
              
              <div className="relative flex min-h-[3.5rem] flex-row items-center justify-between rounded-lg rounded-t-none bg-gradient-to-r from-slate-100 to-gray-100 dark:from-navy-800 dark:to-navy-700 py-0 border-t border-slate-200 dark:border-navy-600">
                <div className="flex max-w-[calc(100%-3rem)] flex-row items-center pl-4">
                  <div className="w-full">
                    <p className="overflow-hidden overflow-ellipsis whitespace-nowrap pr-2 text-base font-semibold leading-6 text-gray-900 dark:text-gray-100">
                      {letter.title}
                    </p>
                  </div>
                </div>
                <div className="h-12 min-w-12 relative flex cursor-pointer items-center justify-center text-xl hover:text-blue-500">
                  <div
                    ref={dropdownButtonRef}
                    className="h-6 w-6 cursor-pointer group relative flex items-center justify-center"
                    onClick={(e) => handleMenuToggle(letter.id, e)}
                  >
                    <i className="!flex items-center justify-center fas fa-ellipsis-vertical text-gray-900 dark:text-gray-100 text-xl w-6 h-6 hover:text-blue-500" aria-hidden="true"></i>
                  </div>
                  
                  {showDropdown === letter.id && createPortal(
                    <div 
                      data-dropdown-portal="true"
                      className="fixed bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-lg shadow-2xl shadow-slate-300/30 dark:shadow-navy-900/50 z-[9999] min-w-[160px]"
                      style={{
                        top: dropdownPosition.top,
                        left: dropdownPosition.left,
                      }}
                    >
                      <Link
                        href={`/dashboard/resumes/${letter.id}/cover-letter`}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-navy-700"
                      >
                        <i className="far fa-edit mr-2"></i>
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(letter.id)}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <i className="far fa-trash mr-2"></i>
                        Delete
                      </button>
                    </div>,
                    document.body
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}