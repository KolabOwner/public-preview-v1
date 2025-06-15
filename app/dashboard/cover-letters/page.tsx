'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from "@/lib/core/auth/firebase-config";
import AICoverLetterForm from '@/components/resume-editor/ai-cover-letter-form';

export default function CoverLettersPage() {
  const [coverLetters, setCoverLetters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useAuth();
  const router = useRouter();

  // Fetch user's saved cover letters
  useEffect(() => {
    const fetchCoverLetters = async () => {
      if (!user) return;

      try {
        const coverLettersQuery = query(
          collection(db, 'coverLetters'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(coverLettersQuery);

        const coverLettersList: any[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          coverLettersList.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || new Date(),
          });
        });

        setCoverLetters(coverLettersList);
      } catch (error) {
        console.error('Error fetching cover letters:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoverLetters();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold mb-4">AI Cover Letter Generator</h1>
        <p className="text-gray-600 mb-6">
          Create a customized cover letter based on your resume and the job details.
        </p>

        <AICoverLetterForm />
      </div>

      {coverLetters.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold mb-4">Your Cover Letters</h2>
          <div className="space-y-4">
            {coverLetters.map((letter) => (
              <div key={letter.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium">{letter.jobTitle} at {letter.company}</h3>
                    <p className="text-sm text-gray-500">
                      Created on {letter.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      className="px-3 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                      onClick={() => {
                        // Create a Blob with the cover letter text
                        const blob = new Blob([letter.content], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);

                        // Create a download link and trigger the download
                        const linkElement = document.createElement('a');
                        linkElement.href = url;
                        linkElement.download = `Cover_Letter_${letter.company}_${letter.jobTitle}.txt`;
                        document.body.appendChild(linkElement);
                        linkElement.click();
                        document.body.removeChild(linkElement);
                        URL.revokeObjectURL(url);
                      }}
                    >
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Cover Letter Tips</h4>
        <ul className="text-sm text-blue-700 list-disc pl-5 space-y-1">
          <li>Customize your cover letter for each job application</li>
          <li>Address specific job requirements in your letter</li>
          <li>Keep it concise - one page is usually sufficient</li>
          <li>Highlight relevant achievements from your resume</li>
          <li>Proofread carefully before sending</li>
        </ul>
      </div>
    </div>
  );
}