'use client';

import { X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/components/utils';

interface NotificationsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsSidebar({ isOpen, onClose }: NotificationsSidebarProps) {
  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 z-[99] transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={cn(
        "fixed top-0 z-[100] flex h-full w-full flex-col items-center overscroll-none rounded-none border-l border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-800 shadow-xl transition-all duration-500 ease-in-out sm:w-96",
        isOpen ? "right-0" : "-right-full"
      )}>
        {/* Header */}
        <div className="flex h-16 w-full flex-row items-center justify-between gap-4 border-b border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-900 px-6 py-4">
          <div className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-100">
            Notifications
          </div>
          <div className="flex flex-row items-center justify-end gap-4">
            <div className="text-base font-normal leading-6 text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200">
              Mark all as read
            </div>
            <div 
              className="h-6 w-6 cursor-pointer group relative flex items-center justify-center"
              onClick={onClose}
            >
              <X className="h-5 w-5 text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" />
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex h-full w-full flex-col overflow-auto">
          {/* Single Notification */}
          <div className="transition-200 flex w-full flex-col items-start self-stretch border-b border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-800 px-6 py-4 transition hover:bg-slate-50 dark:hover:bg-navy-700">
            <div className="relative flex w-full flex-row items-start justify-start">
              <div className="flex flex-col items-start justify-center gap-2">
                <div className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-100">
                  Follow Rezi on LinkedIn for 40% off Rezi Pro
                </div>
                <div className="text-base font-normal leading-5 text-gray-700 dark:text-gray-300">
                  Connect with Rezi founder, Jacob, to stay up to date with Rezi news, updates, and more.
                </div>
                <div className="flex flex-row items-start justify-center gap-2">
                  <button 
                    type="button" 
                    className="relative flex items-center justify-center font-bold uppercase focus:ring-0 focus:outline-none transition transition-200 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed border-0 bg-gradient-to-r from-blue-600 to-indigo-600 active:from-blue-700 active:to-indigo-700 focus:from-blue-500 focus:to-indigo-500 text-white hover:from-blue-500 hover:to-indigo-500 px-2 py-1 min-h-6 rounded-md text-[11px] shadow-md shadow-blue-500/30"
                  >
                    <span className="px-1">Go to LinkedIn</span>
                  </button>
                </div>
                <div className="text-sm font-normal leading-5 text-gray-500 dark:text-gray-400">
                  {format(new Date(), 'MMMM d, yyyy h:mm a')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}