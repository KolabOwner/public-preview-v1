// app/dashboard/resumes/[resumeId]/preview/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from "@/lib/features/auth/firebase-config";
import { useAuth } from '@/contexts/auth-context';
import { ResumeDataProvider } from '@/contexts/resume-data-context';
import { SimpleJobProvider } from '@/contexts/simple-job-context';
import SimplifiedResumePreview from '@/components/resume/panels/simplified-resume-preview';

interface ResumeData {
  id: string;
  title: string;
  userId: string;
  parsedData?: any;
  createdAt: string;
  updatedAt: string;
}

export default function ResumePreviewPage() {
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const params = useParams();
  const resumeId = params.resumeId as string;
  const { user } = useAuth();

  useEffect(() => {
    const fetchResume = async () => {
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
        console.log('Fetching resume with ID:', resumeId);
        const resumeRef = doc(db, 'resumes', resumeId);
        const resumeSnap = await getDoc(resumeRef);

        if (!resumeSnap.exists()) {
          setError('Resume not found');
          return;
        }

        const resumeData = resumeSnap.data() as ResumeData;
        console.log('Fetched resume data:', resumeData);

        // Ensure user owns this resume
        if (resumeData.userId !== user.uid) {
          setError('You do not have permission to view this resume');
          return;
        }

        setResume({
          ...resumeData,
          id: resumeSnap.id
        });
      } catch (err) {
        console.error('Error fetching resume:', err);
        setError('Failed to load resume');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResume();
  }, [resumeId, user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg">
        <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Resume Not Found</h3>
        <p>The resume you're looking for could not be found.</p>
      </div>
    );
  }

  // Process the resume data - check for rmsRawData
  const processedResumeData = resume.parsedData || processRMSData(resume.rmsRawData) || resume;
  
  // Log what we're passing to the preview
  console.log('Passing to ResumePreview:', processedResumeData);

  return (
    <SimpleJobProvider>
      <div>
        <SimplifiedResumePreview
          resumeData={processedResumeData}
          resumeId={resume.id}
          showJobPanels={true}
        />
      </div>
    </SimpleJobProvider>
  );
}

// Helper function to process RMS data into a format the preview can use
function processRMSData(rmsData: any) {
  if (!rmsData) return null;
  
  const getRmsField = (field: string) => {
    return rmsData[field] || '';
  };
  
  const processed: any = {
    // Contact information
    contact: {
      firstName: getRmsField('Rms_contact_firstName'),
      lastName: getRmsField('Rms_contact_lastName'),
      fullName: getRmsField('Rms_contact_fullName') || `${getRmsField('Rms_contact_firstName')} ${getRmsField('Rms_contact_lastName')}`.trim(),
      email: getRmsField('Rms_contact_email'),
      phone: getRmsField('Rms_contact_phone'),
      city: getRmsField('Rms_contact_city'),
      state: getRmsField('Rms_contact_state'),
      country: getRmsField('Rms_contact_country'),
      linkedin: getRmsField('Rms_contact_linkedin'),
    },
    
    // Summary
    summary: getRmsField('Rms_summary'),
    
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
  const expCount = parseInt(getRmsField('Rms_experience_count') || '0');
  for (let i = 0; i < expCount; i++) {
    const exp = {
      company: getRmsField(`Rms_experience_${i}_company`),
      position: getRmsField(`Rms_experience_${i}_position`) || getRmsField(`Rms_experience_${i}_title`) || getRmsField(`Rms_experience_${i}_role`),
      title: getRmsField(`Rms_experience_${i}_title`) || getRmsField(`Rms_experience_${i}_position`),
      location: getRmsField(`Rms_experience_${i}_location`),
      dateBegin: getRmsField(`Rms_experience_${i}_dateBegin`) || getRmsField(`Rms_experience_${i}_startDate`),
      dateEnd: getRmsField(`Rms_experience_${i}_dateEnd`) || getRmsField(`Rms_experience_${i}_endDate`),
      description: getRmsField(`Rms_experience_${i}_description`),
      isCurrent: getRmsField(`Rms_experience_${i}_isCurrent`) === 'true',
    };
    
    // Debug logging to see what fields are available
    if (i === 0) {
      console.log('[RMS Debug] First experience item fields:', {
        position: getRmsField(`Rms_experience_${i}_position`),
        title: getRmsField(`Rms_experience_${i}_title`),
        role: getRmsField(`Rms_experience_${i}_role`),
        company: exp.company,
      });
    }
    
    if (exp.company || exp.position || exp.description) {
      processed.experience.push(exp);
    }
  }
  
  // Process education
  const eduCount = parseInt(getRmsField('Rms_education_count') || '0');
  for (let i = 0; i < eduCount; i++) {
    const edu = {
      institution: getRmsField(`Rms_education_${i}_institution`),
      qualification: getRmsField(`Rms_education_${i}_qualification`),
      fieldOfStudy: getRmsField(`Rms_education_${i}_fieldOfStudy`),
      date: getRmsField(`Rms_education_${i}_date`),
      location: getRmsField(`Rms_education_${i}_location`),
      gpa: getRmsField(`Rms_education_${i}_gpa`),
    };
    if (edu.institution || edu.qualification) {
      processed.education.push(edu);
    }
  }
  
  // Process skills
  const skillCount = parseInt(getRmsField('Rms_skill_count') || '0');
  for (let i = 0; i < skillCount; i++) {
    const skill = {
      category: getRmsField(`Rms_skill_${i}_category`),
      keywords: getRmsField(`Rms_skill_${i}_keywords`),
    };
    if (skill.category || skill.keywords) {
      processed.skills.push(skill);
    }
  }
  
  // Process projects
  const projCount = parseInt(getRmsField('Rms_project_count') || '0');
  for (let i = 0; i < projCount; i++) {
    const proj = {
      name: getRmsField(`Rms_project_${i}_name`) || getRmsField(`Rms_project_${i}_title`),
      title: getRmsField(`Rms_project_${i}_title`) || getRmsField(`Rms_project_${i}_name`),
      organization: getRmsField(`Rms_project_${i}_organization`),
      description: getRmsField(`Rms_project_${i}_description`),
      dateBegin: getRmsField(`Rms_project_${i}_dateBegin`),
      dateEnd: getRmsField(`Rms_project_${i}_dateEnd`),
      url: getRmsField(`Rms_project_${i}_url`),
      repository: getRmsField(`Rms_project_${i}_repository`),
      role: getRmsField(`Rms_project_${i}_role`),
    };
    if (proj.name || proj.description) {
      processed.projects.push(proj);
    }
  }
  
  // Process certifications
  const certCount = parseInt(getRmsField('Rms_certification_count') || '0');
  processed.certifications = [];
  for (let i = 0; i < certCount; i++) {
    const cert = {
      name: getRmsField(`Rms_certification_${i}_name`),
      date: getRmsField(`Rms_certification_${i}_date`),
      issuer: getRmsField(`Rms_certification_${i}_issuer`) || getRmsField(`Rms_certification_${i}_department`),
      description: getRmsField(`Rms_certification_${i}_description`),
      credentialId: getRmsField(`Rms_certification_${i}_credentialId`),
      url: getRmsField(`Rms_certification_${i}_url`),
    };
    if (cert.name || cert.issuer) {
      processed.certifications.push(cert);
    }
  }
  
  // Process involvement/activities
  const invCount = parseInt(getRmsField('Rms_involvement_count') || '0');
  processed.involvement = [];
  for (let i = 0; i < invCount; i++) {
    const inv = {
      organization: getRmsField(`Rms_involvement_${i}_organization`),
      role: getRmsField(`Rms_involvement_${i}_role`),
      location: getRmsField(`Rms_involvement_${i}_location`),
      dateBegin: getRmsField(`Rms_involvement_${i}_dateBegin`) || getRmsField(`Rms_involvement_${i}_dates`),
      dateEnd: getRmsField(`Rms_involvement_${i}_dateEnd`),
      description: getRmsField(`Rms_involvement_${i}_description`),
    };
    if (inv.organization || inv.role) {
      processed.involvement.push(inv);
    }
  }
  
  // Process coursework
  const courseCount = parseInt(getRmsField('Rms_coursework_count') || '0');
  processed.coursework = [];
  for (let i = 0; i < courseCount; i++) {
    const course = {
      name: getRmsField(`Rms_coursework_${i}_name`),
      department: getRmsField(`Rms_coursework_${i}_department`),
      code: getRmsField(`Rms_coursework_${i}_code`),
      grade: getRmsField(`Rms_coursework_${i}_grade`),
      description: getRmsField(`Rms_coursework_${i}_description`),
    };
    if (course.name || course.department) {
      processed.coursework.push(course);
    }
  }
  
  // Process awards/honors
  const awardCount = parseInt(getRmsField('Rms_award_count') || '0');
  processed.awards = [];
  for (let i = 0; i < awardCount; i++) {
    const award = {
      title: getRmsField(`Rms_award_${i}_title`) || getRmsField(`Rms_award_${i}_name`),
      name: getRmsField(`Rms_award_${i}_name`) || getRmsField(`Rms_award_${i}_title`),
      issuer: getRmsField(`Rms_award_${i}_issuer`) || getRmsField(`Rms_award_${i}_organization`),
      organization: getRmsField(`Rms_award_${i}_organization`) || getRmsField(`Rms_award_${i}_issuer`),
      date: getRmsField(`Rms_award_${i}_date`),
      description: getRmsField(`Rms_award_${i}_description`),
    };
    if (award.title || award.name) {
      processed.awards.push(award);
    }
  }
  
  // Process publications
  const pubCount = parseInt(getRmsField('Rms_publication_count') || '0');
  processed.publications = [];
  for (let i = 0; i < pubCount; i++) {
    const pub = {
      title: getRmsField(`Rms_publication_${i}_title`),
      authors: getRmsField(`Rms_publication_${i}_authors`),
      journal: getRmsField(`Rms_publication_${i}_journal`),
      date: getRmsField(`Rms_publication_${i}_date`),
      url: getRmsField(`Rms_publication_${i}_url`),
      doi: getRmsField(`Rms_publication_${i}_doi`),
      description: getRmsField(`Rms_publication_${i}_description`),
    };
    if (pub.title || pub.journal) {
      processed.publications.push(pub);
    }
  }
  
  // Process languages
  const langCount = parseInt(getRmsField('Rms_language_count') || '0');
  processed.languages = [];
  for (let i = 0; i < langCount; i++) {
    const lang = {
      name: getRmsField(`Rms_language_${i}_name`),
      proficiency: getRmsField(`Rms_language_${i}_proficiency`),
      nativeLanguage: getRmsField(`Rms_language_${i}_nativeLanguage`) === 'true',
    };
    if (lang.name) {
      processed.languages.push(lang);
    }
  }
  
  // Process volunteer work
  const volCount = parseInt(getRmsField('Rms_volunteer_count') || '0');
  processed.volunteer = [];
  for (let i = 0; i < volCount; i++) {
    const vol = {
      organization: getRmsField(`Rms_volunteer_${i}_organization`),
      role: getRmsField(`Rms_volunteer_${i}_role`) || getRmsField(`Rms_volunteer_${i}_title`),
      title: getRmsField(`Rms_volunteer_${i}_title`) || getRmsField(`Rms_volunteer_${i}_role`),
      location: getRmsField(`Rms_volunteer_${i}_location`),
      startDate: getRmsField(`Rms_volunteer_${i}_startDate`) || getRmsField(`Rms_volunteer_${i}_dateBegin`),
      endDate: getRmsField(`Rms_volunteer_${i}_endDate`) || getRmsField(`Rms_volunteer_${i}_dateEnd`),
      current: getRmsField(`Rms_volunteer_${i}_current`) === 'true',
      description: getRmsField(`Rms_volunteer_${i}_description`),
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