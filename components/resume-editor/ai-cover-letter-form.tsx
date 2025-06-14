'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/auth';
import { useAuth } from '@/contexts/auth-context';

interface CoverLetterFormProps {
  resumeId?: string;
  initialData?: {
    jobTitle?: string;
    company?: string;
    jobDescription?: string;
    coverLetter?: string;
  };
}

export default function AICoverLetterForm({ 
  resumeId, 
  initialData = {}
}: CoverLetterFormProps) {
  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>(resumeId || '');
  const [resumeData, setResumeData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  
  const [coverLetter, setCoverLetter] = useState(initialData.coverLetter || '');
  const [jobDetails, setJobDetails] = useState({
    title: initialData.jobTitle || '',
    company: initialData.company || '',
    description: initialData.jobDescription || '',
  });
  
  const { user } = useAuth();

  // Load user's resumes on component mount
  useEffect(() => {
    const loadUserResumes = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const resumesSnapshot = await fetch('/api/resumes');
        const resumesData = await resumesSnapshot.json();
        
        setResumes(resumesData);
        
        if (resumesData.length > 0 && !selectedResumeId) {
          setSelectedResumeId(resumesData[0].id);
        }
      } catch (error) {
        console.error('Error loading resumes:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserResumes();
  }, [user]);

  // Load resume data when a resume is selected
  useEffect(() => {
    const loadResumeData = async () => {
      if (!selectedResumeId) {
        setResumeData(null);
        return;
      }
      
      try {
        const resumeRef = doc(db, 'resumes', selectedResumeId);
        const resumeSnapshot = await getDoc(resumeRef);
        
        if (resumeSnapshot.exists()) {
          setResumeData(resumeSnapshot.data());
        }
      } catch (error) {
        console.error('Error loading resume data:', error);
      }
    };
    
    loadResumeData();
  }, [selectedResumeId]);

  const generateCoverLetter = async () => {
    if (!resumeData || !selectedResumeId) {
      alert('Please select a resume first');
      return;
    }
    
    if (!jobDetails.title || !jobDetails.company) {
      alert('Please enter the job title and company');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Simulate an API call to generate the cover letter
      // In a real implementation, this would call a backend API that uses AI
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a simple cover letter template based on resume data
      const { parsedData } = resumeData;
      const contactInfo = parsedData?.contactInfo || {};
      const summary = parsedData?.summary || '';
      
      const generatedLetter = `
${new Date().toLocaleDateString()}

${contactInfo.fullName || 'Your Name'}
${contactInfo.email || 'your.email@example.com'}
${contactInfo.phone || '(123) 456-7890'}
${contactInfo.location || 'City, State'}

${jobDetails.company}
Hiring Manager
Re: ${jobDetails.title} Position

Dear Hiring Manager,

I am writing to express my interest in the ${jobDetails.title} position at ${jobDetails.company}. With my background and experience, I believe I am well-qualified for this role.

${summary}

${jobDetails.description ? `The job description mentions: "${jobDetails.description}". Based on this, I would like to highlight some relevant experience:` : ''}

${parsedData?.experiences && parsedData.experiences.length > 0 ? 
  `During my time at ${parsedData.experiences[0].company}, I gained valuable experience in the ${parsedData.experiences[0].title} role, where I ${parsedData.experiences[0].description?.substring(0, 100) || 'developed relevant skills'}...` 
  : 'I have experience working in similar roles that required strong problem-solving abilities and technical skills.'}

${parsedData?.skillCategories && parsedData.skillCategories.length > 0 && parsedData.skillCategories[0].skills.length > 0 ?
  `I am proficient in ${parsedData.skillCategories[0].skills.slice(0, 3).map((s: any) => s.name).join(', ')}, which I understand are important for this position.`
  : 'I have a strong skill set that aligns well with the requirements of this position.'}

I am excited about the opportunity to bring my skills and experience to ${jobDetails.company} and would welcome the chance to discuss how I can contribute to your team. Thank you for considering my application.

Sincerely,

${contactInfo.fullName || 'Your Name'}
      `;
      
      setCoverLetter(generatedLetter);
      
      // Automatically save the generated cover letter
      saveCoverLetter(generatedLetter);
    } catch (error) {
      console.error('Error generating cover letter:', error);
      alert('Failed to generate cover letter. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveCoverLetter = async (letterContent: string = coverLetter) => {
    if (!user || !selectedResumeId) return;
    
    setIsSaving(true);
    setSaveStatus('saving');
    
    try {
      // Create a new cover letter document in Firestore
      await addDoc(collection(db, 'coverLetters'), {
        userId: user.uid,
        resumeId: selectedResumeId,
        jobTitle: jobDetails.title,
        company: jobDetails.company,
        jobDescription: jobDetails.description,
        content: letterContent,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      setSaveStatus('saved');
    } catch (error) {
      console.error('Error saving cover letter:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadCoverLetter = () => {
    if (!coverLetter) return;
    
    // Create a Blob with the cover letter text
    const blob = new Blob([coverLetter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Create a download link and trigger the download
    const link = document.createElement('a');
    link.href = url;
    link.download = `Cover_Letter_${jobDetails.company || 'Company'}_${jobDetails.title || 'Position'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold mb-4">Generate Cover Letter</h2>
          
          <div>
            <label htmlFor="resumeSelect" className="block text-sm font-medium text-gray-700 mb-1">
              Select Resume
            </label>
            <select
              id="resumeSelect"
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading || isGenerating}
            >
              <option value="" disabled>Select a resume</option>
              {resumes.map((resume) => (
                <option key={resume.id} value={resume.id}>
                  {resume.title}
                </option>
              ))}
            </select>
            {resumes.length === 0 && (
              <p className="text-sm text-red-600 mt-1">
                You don't have any resumes. <a href="/dashboard/resumes" className="underline">Create one</a> first.
              </p>
            )}
          </div>
          
          <div>
            <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-1">
              Job Title *
            </label>
            <input
              id="jobTitle"
              type="text"
              value={jobDetails.title}
              onChange={(e) => setJobDetails({ ...jobDetails, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Software Engineer"
              disabled={isGenerating}
            />
          </div>
          
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
              Company Name *
            </label>
            <input
              id="company"
              type="text"
              value={jobDetails.company}
              onChange={(e) => setJobDetails({ ...jobDetails, company: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Acme Inc."
              disabled={isGenerating}
            />
          </div>
          
          <div>
            <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Job Description (Optional)
            </label>
            <textarea
              id="jobDescription"
              rows={4}
              value={jobDetails.description}
              onChange={(e) => setJobDetails({ ...jobDetails, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Paste key requirements or responsibilities from the job posting..."
              disabled={isGenerating}
            />
          </div>
          
          <div className="pt-4">
            <button
              onClick={generateCoverLetter}
              disabled={isGenerating || !selectedResumeId || !jobDetails.title || !jobDetails.company}
              className="w-full btn-primary"
            >
              {isGenerating ? 'Generating...' : 'Generate Cover Letter'}
            </button>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mt-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Tips</h4>
            <ul className="text-sm text-blue-700 list-disc pl-5 space-y-1">
              <li>Customize your cover letter for each job application</li>
              <li>Include specific details from the job description</li>
              <li>Highlight your most relevant skills and experiences</li>
            </ul>
          </div>
        </div>
        
        {/* Preview Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold">Cover Letter Preview</h2>
            <div className="text-sm text-gray-500">
              {saveStatus === 'saving' && 'Saving...'}
              {saveStatus === 'saved' && 'Saved'}
              {saveStatus === 'error' && 'Error saving'}
            </div>
          </div>
          
          <div className="bg-white border border-gray-300 rounded-lg p-6 min-h-[600px] max-h-[600px] overflow-y-auto font-serif">
            {coverLetter ? (
              <pre className="whitespace-pre-wrap">{coverLetter}</pre>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                {isGenerating ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    <p>Generating your cover letter...</p>
                  </div>
                ) : (
                  <p>Your cover letter will appear here</p>
                )}
              </div>
            )}
          </div>
          
          {coverLetter && (
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => saveCoverLetter()}
                disabled={isSaving}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleDownloadCoverLetter}
                className="btn-primary"
              >
                Download as Text
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}