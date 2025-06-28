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

interface CoverLetterListProps {
  coverLetters: CoverLetter[];
  onRefresh: () => void;
}

export default function CoverLetterList({ coverLetters, onRefresh }: CoverLetterListProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const activeDropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdownRef.current && !activeDropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    if (activeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [activeDropdown]);

  const handleDropdownToggle = (letterId: string, event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    
    if (activeDropdown === letterId) {
      setActiveDropdown(null);
    } else {
      const rect = event.currentTarget.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right + window.scrollX - 200
      });
      setActiveDropdown(letterId);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this cover letter?')) {
      try {
        const resumeRef = doc(db, 'resumes', id);
        await updateDoc(resumeRef, { coverLetter: null });
        onRefresh();
      } catch (error) {
        console.error('Error deleting cover letter:', error);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* List Headers */}
      <div className="relative hidden w-full items-center justify-between gap-4 px-4 text-base leading-6 text-gray-500 dark:text-gray-400 sm:flex">
        <div className="flex w-full flex-row gap-4">
          <div className="w-5"></div>
          <div className="flex w-[calc(100%-292px)] gap-4 self-stretch">
            <div>Title</div>
          </div>
          <div className="w-[150px]">Company</div>
          <div className="w-[100px]">Created</div>
        </div>
        <div className="h-6 w-6"></div>
      </div>

      {/* Create New Cover Letter */}
      <div 
        className="flex w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-400 dark:border-navy-600 px-4 py-3 hover:border-slate-500 dark:hover:border-navy-500 hover:bg-slate-50/50 dark:hover:bg-navy-800/50 transition-all duration-200"
        onClick={() => router.push('/dashboard/resumes')}
      >
        <div className="truncate text-center text-base font-semibold leading-6 text-gray-600 dark:text-gray-400">
          Create new cover letter
        </div>
      </div>

      {/* Cover Letter Items */}
      {coverLetters.map((letter) => (
        <div 
          key={letter.id}
          className="bg-white/80 dark:bg-navy-800/90 backdrop-blur-sm rounded-lg border border-slate-200 dark:border-navy-700 hover:bg-slate-50 dark:hover:bg-navy-800 cursor-pointer px-4 py-3 transition-all duration-200 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-navy-900/50"
          onClick={() => router.push(`/dashboard/resumes/${letter.id}/cover-letter`)}
        >
          <div className="relative flex w-full flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex w-full flex-row flex-wrap items-center gap-4 sm:flex-nowrap">
              <div className="relative flex h-6 w-5 items-center">
                <div className="h-6 w-5 rounded-sm border border-slate-200 dark:border-navy-700 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-navy-700 dark:to-navy-800 flex items-center justify-center">
                  <i className="far fa-file-alt text-xs text-slate-600 dark:text-slate-400"></i>
                </div>
              </div>
              <div className="relative flex w-[calc(100%-76px)] sm:w-[calc(100%-292px)] gap-4 sm:flex-row">
                <div className="flex w-full items-center gap-4">
                  <p className="overflow-hidden text-ellipsis whitespace-nowrap font-semibold leading-6 text-gray-900 dark:text-gray-100">
                    {letter.title}
                  </p>
                </div>
              </div>
              <div className="group relative flex w-[150px] flex-col">
                <p className="flex text-sm leading-5 text-gray-500 dark:text-gray-400 sm:hidden">Company</p>
                <p className="overflow-hidden overflow-ellipsis whitespace-nowrap text-gray-700 dark:text-gray-300">
                  {letter.company}
                </p>
              </div>
              <div className="group relative flex w-[100px] flex-col">
                <p className="flex text-sm leading-5 text-gray-500 dark:text-gray-400 sm:hidden">Created</p>
                <p className="overflow-hidden overflow-ellipsis whitespace-nowrap text-gray-700 dark:text-gray-300">
                  {formatDistanceToNow(
                    letter.createdAt.toDate ? letter.createdAt.toDate() : new Date(letter.createdAt), 
                    { addSuffix: true }
                  )}
                </p>
              </div>
            </div>
            <div className="absolute right-0 top-0 flex w-6 items-center sm:relative">
              <div 
                className="h-6 w-6 relative flex cursor-pointer items-center justify-center text-xl hover:text-blue-600 dark:hover:text-blue-400"
                onClick={(e) => handleDropdownToggle(letter.id, e)}
              >
                <i className="fas fa-ellipsis-vertical text-base text-gray-900 dark:text-gray-100"></i>
              </div>
              {activeDropdown === letter.id && createPortal(
                <div 
                  ref={activeDropdownRef}
                  className="fixed z-[9999] min-w-[200px] bg-white dark:bg-navy-800 rounded-lg border border-slate-200 dark:border-navy-700 shadow-2xl shadow-slate-400/20 dark:shadow-navy-900/50 py-2"
                  style={{
                    top: dropdownPosition.top,
                    left: dropdownPosition.left,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Link
                    href={`/dashboard/resumes/${letter.id}/cover-letter`}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-navy-700 transition-colors"
                  >
                    <i className="far fa-edit"></i>
                    Edit
                  </Link>
                  <button
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    onClick={() => handleDelete(letter.id)}
                  >
                    <i className="far fa-trash"></i>
                    Delete
                  </button>
                </div>,
                document.body
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}