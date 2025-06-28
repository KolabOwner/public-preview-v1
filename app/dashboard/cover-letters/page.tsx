'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from "@/lib/features/auth/firebase-config";
import DashboardNav from '@/components/ui/dashboard-nav';
import ViewControls from '@/components/ui/view-controls';
import CoverLetterGrid from '@/components/cover-letter/cover-letter-grid';
import CoverLetterList from '@/components/cover-letter/cover-letter-list';

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

export default function CoverLettersPage() {
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'created' | 'updated'>('created');
  const { user } = useAuth();
  const router = useRouter();


  // Fetch user's saved cover letters
  const fetchCoverLetters = async () => {
    if (!user) return;

    try {
      // Query all resumes for the user
      const resumesQuery = query(
        collection(db, 'resumes'),
        where('userId', '==', user.uid),
        orderBy('updatedAt', 'desc')
      );

      const querySnapshot = await getDocs(resumesQuery);
      const coverLettersList: CoverLetter[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.coverLetter) {
          coverLettersList.push({
            id: doc.id,
            title: data.coverLetter.jobTitle || 'Untitled Cover Letter',
            company: data.coverLetter.company || 'Unknown Company',
            jobTitle: data.coverLetter.jobTitle || 'Unknown Position',
            content: data.coverLetter.content || '',
            createdAt: data.coverLetter.lastUpdated || data.createdAt,
            updatedAt: data.coverLetter.lastUpdated || data.updatedAt,
            contactInfo: data.parsedData?.contact || data.parsedData?.contactInfo
          });
        }
      });

      // Sort by created/updated date
      coverLettersList.sort((a, b) => {
        const dateA = sortBy === 'created' ? a.createdAt : a.updatedAt;
        const dateB = sortBy === 'created' ? b.createdAt : b.updatedAt;
        
        // Handle different date formats
        const getTime = (date: any) => {
          if (!date) return 0;
          if (date.toDate) return date.toDate().getTime(); // Firestore timestamp
          if (date.seconds) return date.seconds * 1000; // Timestamp with seconds
          if (date instanceof Date) return date.getTime(); // Already a Date object
          return new Date(date).getTime(); // Try to parse as string
        };
        
        return getTime(dateB) - getTime(dateA);
      });

      setCoverLetters(coverLettersList);
    } catch (error) {
      console.error('Error fetching cover letters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoverLetters();
  }, [user, sortBy]);

  const toggleSortBy = () => {
    setSortBy(sortBy === 'created' ? 'updated' : 'created');
  };


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex justify-center px-0 pt-16 lg:pt-0 lg:px-16 min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-navy-950 dark:via-navy-900 dark:to-slate-900">
      <div className="relative w-full max-w-full gap-4 flex min-h-[calc(100dvh_-_64px)] w-full flex-col justify-start gap-4 px-4 md:px-6 lg:min-h-[calc(100dvh_-_16px)] lg:max-w-[824px] lg:px-6 xl1:max-w-[968px] xl:max-w-[1248px] xl:px-8" id="layout_full_screen">
        <main className="sm:h-full lg:h-auto">
          <DashboardNav activeTab="cover-letters" />

          {/* Main content */}
          <div className="flex-start flex self-stretch">
            <div className="w-full">
              <ViewControls 
                sortBy={sortBy}
                viewMode={viewMode}
                onSortToggle={toggleSortBy}
                onViewModeChange={(mode) => setViewMode(mode)}
              />

              {/* Cover Letters Grid/List */}
              {viewMode === 'grid' ? (
                <CoverLetterGrid coverLetters={coverLetters} onRefresh={fetchCoverLetters} />
              ) : (
                <CoverLetterList coverLetters={coverLetters} onRefresh={fetchCoverLetters} />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}