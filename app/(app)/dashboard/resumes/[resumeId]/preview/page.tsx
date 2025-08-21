// app/dashboard/resumes/[resumeId]/preview/page.tsx

'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from "@/config/firebase-config";
import { useAuth } from '@/contexts/firebase-auth-context';
import { JobInfoProvider, useJobInfo } from '@/contexts/job-info-context';
import { useToast } from '@/lib/client/hooks/ui/use-toast';
import ResumePreview from "@/components/features/resume/panels/resume-preview";


interface ResumeData {
  id: string;
  title: string;
  userId: string;
  parsedData?: any;
  rmsRawData?: any;
  createdAt: string;
  updatedAt: string;
}

// Inner component that has access to JobInfoProvider
function ResumePreviewContent() {
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [processedResumeData, setProcessedResumeData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [typewriterBullet, setTypewriterBullet] = useState<{experienceIndex: number, bullet: string} | null>(null);

  const params = useParams();
  const searchParams = useSearchParams();
  const resumeId = params.resumeId as string;
  const { user } = useAuth();
  const { targetingComplete, isTargeting, jobInfo, hasJobInfo } = useJobInfo();
  const { toast } = useToast();
  const isPDFMode = searchParams.get('pdf') === 'true';
  
  // Only show editor panel if job info exists and has missing keywords to process
  const shouldShowEditorPanel = hasJobInfo && jobInfo?.missingKeywords && jobInfo.missingKeywords.length > 0;

  // Callback to trigger typewriter effect when bullets are added
  const handleBulletAdded = useCallback((experienceIndex: number, newBullet: string) => {
    // Start typewriter effect
    setTypewriterBullet({ experienceIndex, bullet: newBullet });
  }, []);

  // Callback when typewriter completes
  const handleTypewriterComplete = useCallback((experienceIndex: number, newBullet: string) => {
    // Update the actual resume data after typewriter completes
    setProcessedResumeData((prev: any) => {
      if (!prev) return prev;
      
      const currentDescription = prev[`rms_experience_${experienceIndex}_description`] || '';
      const bullets = currentDescription.split('\n').filter((b: string) => b.trim());
      const newBullets = [...bullets, `•${newBullet}`];
      const newDescription = newBullets.join('\n');
      
      return {
        ...prev,
        [`rms_experience_${experienceIndex}_description`]: newDescription
      };
    });
    
    // Clear typewriter state
    setTypewriterBullet(null);
  }, []);

  const fetchResume = useCallback(async () => {
    if (!resumeId || !user) {
      setIsLoading(false);
      return;
    }

    if (!db) {
      console.error('Firestore database is not initialized');
      setIsLoading(false);
      return;
    }

    try {
      const resumeRef = doc(db, 'resumes', resumeId);
      const resumeSnap = await getDoc(resumeRef);

      if (!resumeSnap.exists()) {
        setError('Resume not found');
        return;
      }

      const resumeData = resumeSnap.data() as ResumeData;

      // Ensure user owns this resume
      if (resumeData.userId !== user.uid) {
        setError('You do not have permission to view this resume');
        return;
      }

      const resumeWithId = {
        ...resumeData,
        id: resumeSnap.id
      };
      
      setResume(resumeWithId);
      
      // Process the resume data initially
      const processed = resumeData.parsedData || processRMSData(resumeData.rmsRawData) || resumeData;
      setProcessedResumeData(processed);
    } catch (err) {
      console.error('Error fetching resume:', err);
      setError('Failed to load resume');
    } finally {
      setIsLoading(false);
    }
  }, [resumeId, user]);

  useEffect(() => {
    fetchResume();
  }, [fetchResume]);

  // Refetch resume data when targeting is complete
  useEffect(() => {
    if (targetingComplete) {
      console.log('Resume targeting complete, refreshing data...');
      fetchResume();
      
      // Show success notification
      toast({
        title: 'Resume Optimized Successfully!',
        description: 'Your resume has been tailored with relevant keywords and improved content for this job.',
      });
    }
  }, [targetingComplete, fetchResume, toast]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  // Show targeting overlay
  if (isTargeting && processedResumeData) {
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md mx-4 border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="relative mb-6">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-500 mx-auto"></div>
                <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-xl animate-pulse"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                AI is Optimizing Your Resume
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Please wait while we tailor your resume content with relevant keywords and action verbs for this specific job position.
              </p>
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span>This usually takes 30-60 seconds</span>
              </div>
            </div>
          </div>
        </div>
        <ResumePreview
          resumeData={processedResumeData}
          resumeId={resume!.id}
          showJobPanels={!isPDFMode}
          showEditorPanel={shouldShowEditorPanel && !isPDFMode}
          onBulletAdded={handleBulletAdded}
          typewriterBullet={typewriterBullet}
          onTypewriterComplete={handleTypewriterComplete}
          className={isPDFMode ? 'pdf-mode opacity-50' : 'opacity-50'}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">Error</h3>
        <p className="text-red-700 dark:text-red-300">{error}</p>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Resume Not Found</h3>
        <p className="text-gray-700 dark:text-gray-300">The resume you&apos;re looking for could not be found.</p>
      </div>
    );
  }

  if (!processedResumeData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <ResumePreview
      resumeData={processedResumeData}
      resumeId={resume.id}
      showJobPanels={!isPDFMode} // Hide panels in PDF mode
      showEditorPanel={shouldShowEditorPanel && !isPDFMode}
      onBulletAdded={handleBulletAdded}
      typewriterBullet={typewriterBullet}
      onTypewriterComplete={handleTypewriterComplete}
      className={isPDFMode ? 'pdf-mode' : ''}
    />
  );
}

// Main component with JobInfoProvider wrapper
export default function ResumePreviewPage() {
  const params = useParams();
  const resumeId = params.resumeId as string;

  return (
    <JobInfoProvider initialResumeId={resumeId}>
      <ResumePreviewContent />
    </JobInfoProvider>
  );
}

// Helper function to process RMS data into a format the preview can use
function processRMSData(rmsData: any) {
  if (!rmsData) return null;
  
  const getRmsField = (field: string) => {
    // Try the field name as-is first
    if (rmsData[field] !== undefined) return rmsData[field] || '';
    
    // Try lowercase version (rms_ instead of Rms_)
    const lowerField = field.replace('Rms_', 'rms_');
    if (rmsData[lowerField] !== undefined) return rmsData[lowerField] || '';
    
    // Try uppercase version (Rms_ instead of rms_)
    const upperField = field.replace('rms_', 'Rms_');
    if (rmsData[upperField] !== undefined) return rmsData[upperField] || '';
    
    return '';
  };
  
  const processed: any = {
    // Contact information
    contact: {
      firstName: getRmsField('rms_contact_givennames') || getRmsField('Rms_contact_firstName'),
      lastName: getRmsField('rms_contact_lastname') || getRmsField('Rms_contact_lastName'),
      fullName: getRmsField('rms_contact_fullname') || getRmsField('Rms_contact_fullName') || `${getRmsField('rms_contact_givennames') || getRmsField('Rms_contact_firstName')} ${getRmsField('rms_contact_lastname') || getRmsField('Rms_contact_lastName')}`.trim(),
      email: getRmsField('rms_contact_email') || getRmsField('Rms_contact_email'),
      phone: getRmsField('rms_contact_phone') || getRmsField('Rms_contact_phone'),
      city: getRmsField('rms_contact_city') || getRmsField('Rms_contact_city'),
      state: getRmsField('rms_contact_state') || getRmsField('Rms_contact_state'),
      country: getRmsField('rms_contact_country') || getRmsField('rms_contact_countrycode') || getRmsField('Rms_contact_country'),
      linkedin: getRmsField('rms_contact_linkedin') || getRmsField('Rms_contact_linkedin'),
    },
    
    // Summary
    summary: getRmsField('rms_summary') || getRmsField('Rms_summary'),
    
    // Experience
    experience: [],
    
    // Education
    education: [],
    
    // Skills
    skills: [],
    
    // Projects
    projects: [],
  };
  
  // Process experience
  const expCount = parseInt(getRmsField('rms_experience_count') || getRmsField('Rms_experience_count') || '0');
  for (let i = 0; i < expCount; i++) {
    const exp = {
      company: getRmsField(`rms_experience_${i}_company`) || getRmsField(`Rms_experience_${i}_company`),
      position: getRmsField(`rms_experience_${i}_role`) || getRmsField(`rms_experience_${i}_position`) || getRmsField(`rms_experience_${i}_title`) || getRmsField(`Rms_experience_${i}_position`) || getRmsField(`Rms_experience_${i}_title`) || getRmsField(`Rms_experience_${i}_role`),
      title: getRmsField(`rms_experience_${i}_role`) || getRmsField(`rms_experience_${i}_title`) || getRmsField(`rms_experience_${i}_position`) || getRmsField(`Rms_experience_${i}_title`) || getRmsField(`Rms_experience_${i}_position`),
      location: getRmsField(`rms_experience_${i}_location`) || getRmsField(`Rms_experience_${i}_location`),
      dateBegin: getRmsField(`rms_experience_${i}_datebegin`) || getRmsField(`rms_experience_${i}_dateBegin`) || getRmsField(`rms_experience_${i}_startDate`) || getRmsField(`Rms_experience_${i}_dateBegin`) || getRmsField(`Rms_experience_${i}_startDate`),
      dateEnd: getRmsField(`rms_experience_${i}_dateend`) || getRmsField(`rms_experience_${i}_dateEnd`) || getRmsField(`rms_experience_${i}_endDate`) || getRmsField(`Rms_experience_${i}_dateEnd`) || getRmsField(`Rms_experience_${i}_endDate`),
      description: getRmsField(`rms_experience_${i}_description`) || getRmsField(`Rms_experience_${i}_description`),
      isCurrent: getRmsField(`rms_experience_${i}_iscurrent`) === true || getRmsField(`rms_experience_${i}_iscurrent`) === 'true' || getRmsField(`rms_experience_${i}_isCurrent`) === 'true' || getRmsField(`Rms_experience_${i}_isCurrent`) === 'true',
    };
    
    
    if (exp.company || exp.position || exp.description) {
      processed.experience.push(exp);
    }
  }
  
  // Process education
  const eduCount = parseInt(getRmsField('rms_education_count') || getRmsField('Rms_education_count') || '0');
  for (let i = 0; i < eduCount; i++) {
    const edu = {
      institution: getRmsField(`rms_education_${i}_institution`) || getRmsField(`Rms_education_${i}_institution`),
      qualification: getRmsField(`rms_education_${i}_qualification`) || getRmsField(`Rms_education_${i}_qualification`),
      fieldOfStudy: getRmsField(`rms_education_${i}_fieldOfStudy`) || getRmsField(`Rms_education_${i}_fieldOfStudy`),
      date: getRmsField(`rms_education_${i}_date`) || getRmsField(`Rms_education_${i}_date`),
      location: getRmsField(`rms_education_${i}_location`) || getRmsField(`Rms_education_${i}_location`),
      gpa: getRmsField(`rms_education_${i}_gpa`) || getRmsField(`Rms_education_${i}_gpa`),
      isGraduate: getRmsField(`rms_education_${i}_isgraduate`) || getRmsField(`rms_education_${i}_isGraduate`) || getRmsField(`Rms_education_${i}_isGraduate`),
    };
    if (edu.institution || edu.qualification) {
      processed.education.push(edu);
    }
  }
  
  // Process skills
  const skillCount = parseInt(getRmsField('rms_skill_count') || getRmsField('Rms_skill_count') || '0');
  for (let i = 0; i < skillCount; i++) {
    const skill = {
      category: getRmsField(`rms_skill_${i}_category`) || getRmsField(`Rms_skill_${i}_category`),
      keywords: getRmsField(`rms_skill_${i}_keywords`) || getRmsField(`Rms_skill_${i}_keywords`),
    };
    if (skill.category || skill.keywords) {
      processed.skills.push(skill);
    }
  }
  
  // Process projects
  const projCount = parseInt(getRmsField('rms_project_count') || getRmsField('Rms_project_count') || '0');
  for (let i = 0; i < projCount; i++) {
    const proj = {
      name: getRmsField(`rms_project_${i}_name`) || getRmsField(`rms_project_${i}_title`) || getRmsField(`Rms_project_${i}_name`) || getRmsField(`Rms_project_${i}_title`),
      title: getRmsField(`rms_project_${i}_title`) || getRmsField(`rms_project_${i}_name`) || getRmsField(`Rms_project_${i}_title`) || getRmsField(`Rms_project_${i}_name`),
      organization: getRmsField(`rms_project_${i}_organization`) || getRmsField(`Rms_project_${i}_organization`),
      description: getRmsField(`rms_project_${i}_description`) || getRmsField(`Rms_project_${i}_description`),
      dateBegin: getRmsField(`rms_project_${i}_dateBegin`) || getRmsField(`Rms_project_${i}_dateBegin`),
      dateEnd: getRmsField(`rms_project_${i}_dateEnd`) || getRmsField(`Rms_project_${i}_dateEnd`),
      url: getRmsField(`rms_project_${i}_url`) || getRmsField(`Rms_project_${i}_url`),
      repository: getRmsField(`rms_project_${i}_repository`) || getRmsField(`Rms_project_${i}_repository`),
      role: getRmsField(`rms_project_${i}_role`) || getRmsField(`Rms_project_${i}_role`),
    };
    if (proj.name || proj.description) {
      processed.projects.push(proj);
    }
  }
  
  // Process certifications
  const certCount = parseInt(getRmsField('rms_certification_count') || getRmsField('Rms_certification_count') || '0');
  processed.certifications = [];
  for (let i = 0; i < certCount; i++) {
    const cert = {
      name: getRmsField(`rms_certification_${i}_name`) || getRmsField(`Rms_certification_${i}_name`),
      date: getRmsField(`rms_certification_${i}_date`) || getRmsField(`Rms_certification_${i}_date`),
      issuer: getRmsField(`rms_certification_${i}_issuer`) || getRmsField(`rms_certification_${i}_department`) || getRmsField(`Rms_certification_${i}_issuer`) || getRmsField(`Rms_certification_${i}_department`),
      description: getRmsField(`rms_certification_${i}_description`) || getRmsField(`Rms_certification_${i}_description`),
      credentialId: getRmsField(`rms_certification_${i}_credentialId`) || getRmsField(`Rms_certification_${i}_credentialId`),
      url: getRmsField(`rms_certification_${i}_url`) || getRmsField(`Rms_certification_${i}_url`),
    };
    if (cert.name || cert.issuer) {
      processed.certifications.push(cert);
    }
  }
  
  // Process involvement/activities
  const invCount = parseInt(getRmsField('rms_involvement_count') || getRmsField('Rms_involvement_count') || '0');
  processed.involvement = [];
  for (let i = 0; i < invCount; i++) {
    const inv = {
      organization: getRmsField(`rms_involvement_${i}_organization`) || getRmsField(`Rms_involvement_${i}_organization`),
      role: getRmsField(`rms_involvement_${i}_role`) || getRmsField(`Rms_involvement_${i}_role`),
      location: getRmsField(`rms_involvement_${i}_location`) || getRmsField(`Rms_involvement_${i}_location`),
      dateBegin: getRmsField(`rms_involvement_${i}_datebegin`) || getRmsField(`rms_involvement_${i}_dateBegin`) || getRmsField(`rms_involvement_${i}_dates`) || getRmsField(`Rms_involvement_${i}_dateBegin`) || getRmsField(`Rms_involvement_${i}_dates`),
      dateEnd: getRmsField(`rms_involvement_${i}_dateend`) || getRmsField(`rms_involvement_${i}_dateEnd`) || getRmsField(`Rms_involvement_${i}_dateEnd`),
      description: getRmsField(`rms_involvement_${i}_description`) || getRmsField(`Rms_involvement_${i}_description`),
    };
    if (inv.organization || inv.role) {
      processed.involvement.push(inv);
    }
  }
  
  // Process coursework
  const courseCount = parseInt(getRmsField('rms_coursework_count') || getRmsField('Rms_coursework_count') || '0');
  processed.coursework = [];
  for (let i = 0; i < courseCount; i++) {
    const course = {
      name: getRmsField(`rms_coursework_${i}_name`) || getRmsField(`Rms_coursework_${i}_name`),
      department: getRmsField(`rms_coursework_${i}_department`) || getRmsField(`Rms_coursework_${i}_department`),
      code: getRmsField(`rms_coursework_${i}_code`) || getRmsField(`Rms_coursework_${i}_code`),
      grade: getRmsField(`rms_coursework_${i}_grade`) || getRmsField(`Rms_coursework_${i}_grade`),
      description: getRmsField(`rms_coursework_${i}_description`) || getRmsField(`Rms_coursework_${i}_description`),
    };
    if (course.name || course.department) {
      processed.coursework.push(course);
    }
  }
  
  // Process awards/honors
  const awardCount = parseInt(getRmsField('rms_award_count') || getRmsField('Rms_award_count') || '0');
  processed.awards = [];
  for (let i = 0; i < awardCount; i++) {
    const award = {
      title: getRmsField(`rms_award_${i}_title`) || getRmsField(`rms_award_${i}_name`) || getRmsField(`Rms_award_${i}_title`) || getRmsField(`Rms_award_${i}_name`),
      name: getRmsField(`rms_award_${i}_name`) || getRmsField(`rms_award_${i}_title`) || getRmsField(`Rms_award_${i}_name`) || getRmsField(`Rms_award_${i}_title`),
      issuer: getRmsField(`rms_award_${i}_issuer`) || getRmsField(`rms_award_${i}_organization`) || getRmsField(`Rms_award_${i}_issuer`) || getRmsField(`Rms_award_${i}_organization`),
      organization: getRmsField(`rms_award_${i}_organization`) || getRmsField(`rms_award_${i}_issuer`) || getRmsField(`Rms_award_${i}_organization`) || getRmsField(`Rms_award_${i}_issuer`),
      date: getRmsField(`rms_award_${i}_date`) || getRmsField(`Rms_award_${i}_date`),
      description: getRmsField(`rms_award_${i}_description`) || getRmsField(`Rms_award_${i}_description`),
    };
    if (award.title || award.name) {
      processed.awards.push(award);
    }
  }
  
  // Process publications
  const pubCount = parseInt(getRmsField('rms_publication_count') || getRmsField('Rms_publication_count') || '0');
  processed.publications = [];
  for (let i = 0; i < pubCount; i++) {
    const pub = {
      title: getRmsField(`rms_publication_${i}_title`) || getRmsField(`Rms_publication_${i}_title`),
      authors: getRmsField(`rms_publication_${i}_authors`) || getRmsField(`Rms_publication_${i}_authors`),
      journal: getRmsField(`rms_publication_${i}_journal`) || getRmsField(`Rms_publication_${i}_journal`),
      date: getRmsField(`rms_publication_${i}_date`) || getRmsField(`Rms_publication_${i}_date`),
      url: getRmsField(`rms_publication_${i}_url`) || getRmsField(`Rms_publication_${i}_url`),
      doi: getRmsField(`rms_publication_${i}_doi`) || getRmsField(`Rms_publication_${i}_doi`),
      description: getRmsField(`rms_publication_${i}_description`) || getRmsField(`Rms_publication_${i}_description`),
    };
    if (pub.title || pub.journal) {
      processed.publications.push(pub);
    }
  }
  
  // Process languages
  const langCount = parseInt(getRmsField('rms_language_count') || getRmsField('Rms_language_count') || '0');
  processed.languages = [];
  for (let i = 0; i < langCount; i++) {
    const lang = {
      name: getRmsField(`rms_language_${i}_name`) || getRmsField(`Rms_language_${i}_name`),
      proficiency: getRmsField(`rms_language_${i}_proficiency`) || getRmsField(`Rms_language_${i}_proficiency`),
      nativeLanguage: (getRmsField(`rms_language_${i}_nativeLanguage`) || getRmsField(`Rms_language_${i}_nativeLanguage`)) === 'true',
    };
    if (lang.name) {
      processed.languages.push(lang);
    }
  }
  
  // Process volunteer work
  const volCount = parseInt(getRmsField('rms_volunteer_count') || getRmsField('Rms_volunteer_count') || '0');
  processed.volunteer = [];
  for (let i = 0; i < volCount; i++) {
    const vol = {
      organization: getRmsField(`rms_volunteer_${i}_organization`) || getRmsField(`Rms_volunteer_${i}_organization`),
      role: getRmsField(`rms_volunteer_${i}_role`) || getRmsField(`rms_volunteer_${i}_title`) || getRmsField(`Rms_volunteer_${i}_role`) || getRmsField(`Rms_volunteer_${i}_title`),
      title: getRmsField(`rms_volunteer_${i}_title`) || getRmsField(`rms_volunteer_${i}_role`) || getRmsField(`Rms_volunteer_${i}_title`) || getRmsField(`Rms_volunteer_${i}_role`),
      location: getRmsField(`rms_volunteer_${i}_location`) || getRmsField(`Rms_volunteer_${i}_location`),
      startDate: getRmsField(`rms_volunteer_${i}_startDate`) || getRmsField(`rms_volunteer_${i}_dateBegin`) || getRmsField(`Rms_volunteer_${i}_startDate`) || getRmsField(`Rms_volunteer_${i}_dateBegin`),
      endDate: getRmsField(`rms_volunteer_${i}_endDate`) || getRmsField(`rms_volunteer_${i}_dateEnd`) || getRmsField(`Rms_volunteer_${i}_endDate`) || getRmsField(`Rms_volunteer_${i}_dateEnd`),
      current: (getRmsField(`rms_volunteer_${i}_current`) || getRmsField(`Rms_volunteer_${i}_current`)) === 'true',
      description: getRmsField(`rms_volunteer_${i}_description`) || getRmsField(`Rms_volunteer_${i}_description`),
    };
    if (vol.organization || vol.role) {
      processed.volunteer.push(vol);
    }
  }
  
  // Process references
  const refCount = parseInt(getRmsField('Rms_reference_count') || '0');
  processed.references = [];
  for (let i = 0; i < refCount; i++) {
    const ref = {
      name: getRmsField(`Rms_reference_${i}_name`),
      title: getRmsField(`Rms_reference_${i}_title`),
      company: getRmsField(`Rms_reference_${i}_company`),
      email: getRmsField(`Rms_reference_${i}_email`),
      phone: getRmsField(`Rms_reference_${i}_phone`),
      relationship: getRmsField(`Rms_reference_${i}_relationship`),
    };
    if (ref.name) {
      processed.references.push(ref);
    }
  }
  
  // Additional metadata
  processed.metadata = {
    createdAt: rmsData.createdAt,
    updatedAt: rmsData.updatedAt,
    version: getRmsField('Rms_version') || '2.0',
    template: getRmsField('Rms_template'),
    locale: getRmsField('Rms_locale'),
  };
  
  // Keep the raw data for reference
  processed.rmsRawData = rmsData;
  
  return processed;
}