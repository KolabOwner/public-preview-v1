// components/resume/resume-editor-area.tsx
'use client';

import React, { useState } from 'react';
import { usePathname, useParams } from 'next/navigation';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from "@/lib/features/auth/firebase-config";
import { useToast } from '@/components/hooks/use-toast';
import ContactForm, { ContactFormData } from '../resume-editor/contact-form';
import ExperienceForm, { ExperienceEntry } from '../resume-editor/experience-form';
import EducationForm, { EducationEntry } from '../resume-editor/education-form';
import SkillsForm, { SkillEntry } from '../resume-editor/skills-form';
import ProjectsForm, { ProjectEntry } from '../resume-editor/projects-form';
import InvolvementForm, { InvolvementEntry } from '../resume-editor/involvement-form';
import CourseworkForm, { CourseworkEntry } from '../resume-editor/coursework-form';
import CertificationsForm, { CertificationEntry } from '../resume-editor/certifications-form';
import SummaryForm from '../resume-editor/summary-form';

// Unified Resume Data Structure
interface UnifiedResumeData {
  contactInfo: ContactFormData;
  summary: string;
  experiences: ExperienceEntry[];
  education: EducationEntry[];
  skills: SkillEntry[];
  projects: ProjectEntry[];
  involvements: InvolvementEntry[];
  coursework: CourseworkEntry[];
  certifications: CertificationEntry[];
  awards: AwardEntry[];
  languages: LanguageEntry[];
  publications: PublicationEntry[];
}

interface AwardEntry {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description?: string;
}

interface LanguageEntry {
  id: string;
  language: string;
  proficiency: string;
}

interface PublicationEntry {
  id: string;
  title: string;
  publisher: string;
  date: string;
  authors: string;
  url?: string;
  description?: string;
}

interface ResumeDocument {
  id: string;
  title: string;
  userId: string;
  data: UnifiedResumeData;
  createdAt: string;
  updatedAt: string;
}

interface ResumeEditorAreaProps {
  resume: ResumeDocument;
}

function ResumePreview(props: { resumeData: UnifiedResumeData, resumeId: string }) {
  return null;
}

// Default empty resume data structure
const createDefaultResumeData = (): UnifiedResumeData => ({
  contactInfo: {
    fullName: '',
    email: '',
    phone: '',
    linkedin: '',
    website: '',
    country: '',
    state: '',
    city: '',
    showEmail: true,
    showPhone: true,
    showLinkedin: true,
    showWebsite: true,
    showLocation: true
  },
  summary: '',
  experiences: [],
  education: [],
  skills: [],
  projects: [],
  involvements: [],
  coursework: [],
  certifications: [],
  awards: [],
  languages: [],
  publications: []
});

// Helper function to parse legacy/RMS format into unified format
const parseToUnifiedFormat = (legacyData: any): UnifiedResumeData => {
  if (!legacyData) return createDefaultResumeData();

  // If it's already in the unified format, return as is
  if (legacyData.contactInfo && !legacyData.parsedData) {
    return {
      ...createDefaultResumeData(),
      ...legacyData
    };
  }

  const unified = createDefaultResumeData();

  // Handle nested parsedData structure
  const data = legacyData.parsedData || legacyData;

  // Parse contact info
  if (data.contactInfo) {
    unified.contactInfo = {
      ...unified.contactInfo,
      ...data.contactInfo
    };
  } else if (data.rms_contact_fullname || data.Rms_contact_fullName || data.rms_contact_fullName) {
    // Handle RMS format - try both lowercase and capitalized field names
    unified.contactInfo = {
      fullName: data.rms_contact_fullname || data.Rms_contact_fullName || data.rms_contact_fullName || '',
      email: data.rms_contact_email || data.Rms_contact_email || '',
      phone: data.rms_contact_phone || data.Rms_contact_phone || '',
      linkedin: data.rms_contact_linkedin || data.Rms_contact_linkedin || '',
      website: data.rms_contact_website || data.Rms_contact_website || '',
      country: data.rms_contact_country || data.rms_contact_countrycode || data.Rms_contact_country || '',
      state: data.rms_contact_state || data.Rms_contact_state || '',
      city: data.rms_contact_city || data.Rms_contact_city || '',
      showEmail: true,
      showPhone: true,
      showLinkedin: true,
      showWebsite: true,
      showLocation: true
    };
  }

  // Parse summary
  unified.summary = data.summary || data.rms_summary || data.Rms_summary || '';

  // Parse experiences
  if (data.experiences && Array.isArray(data.experiences)) {
    unified.experiences = data.experiences;
  } else if (data.rms_experience_count || data.Rms_experience_count) {
    // Handle RMS format - try both lowercase and capitalized field names
    const expCount = data.rms_experience_count || data.Rms_experience_count;
    unified.experiences = [];
    for (let i = 0; i < expCount; i++) {
      const description = data[`rms_experience_${i}_description`] || data[`Rms_experience_${i}_description`] || '';
      // Convert description to bullet points if it contains line breaks or bullet markers
      const bulletPoints = description
        .split(/[\n•·▪]/g)
        .map((point: string) => point.trim())
        .filter((point: string) => point.length > 0)
        .map((point: string) => point.replace(/^[?-]\s*/, '')); // Remove leading markers

      unified.experiences.push({
        id: `exp_${i}`,
        title: data[`rms_experience_${i}_role`] || data[`Rms_experience_${i}_role`] || '',
        company: data[`rms_experience_${i}_company`] || data[`Rms_experience_${i}_company`] || '',
        location: data[`rms_experience_${i}_location`] || data[`Rms_experience_${i}_location`] || '',
        startDate: data[`rms_experience_${i}_dateBegin`] || data[`rms_experience_${i}_datebegin`] || data[`Rms_experience_${i}_dateBegin`] || '',
        endDate: data[`rms_experience_${i}_dateEnd`] || data[`rms_experience_${i}_dateend`] || data[`Rms_experience_${i}_dateEnd`] || '',
        current: data[`rms_experience_${i}_isCurrent`] || data[`rms_experience_${i}_iscurrent`] || data[`Rms_experience_${i}_isCurrent`] || false,
        description: description,
        bulletPoints: bulletPoints
      });
    }
  }

  // Parse education
  if (data.education && Array.isArray(data.education)) {
    unified.education = data.education.map((edu: any) => ({
      id: edu.id || `edu_${Date.now()}`,
      institution: edu.institution || edu.school || '',
      qualification: edu.qualification || edu.degree || '',
      location: edu.location || '',
      date: edu.date || edu.endDate || edu.formattedDate || '',
      dateFormat: edu.dateFormat || 'MMMM YYYY',
      minor: edu.minor || edu.fieldOfStudy || '',
      score: edu.score || edu.gpa || '',
      scoreType: edu.scoreType || edu.gpaScale || '',
      details: edu.details || edu.description || '',
      isGraduate: edu.isGraduate !== undefined ? edu.isGraduate : true
    }));
  } else if (data.rms_education_count || data.Rms_education_count) {
    // Handle RMS format - try both lowercase and capitalized field names
    const eduCount = data.rms_education_count || data.Rms_education_count;
    unified.education = [];
    for (let i = 0; i < eduCount; i++) {
      unified.education.push({
        id: `edu_${i}`,
        institution: data[`rms_education_${i}_institution`] || data[`Rms_education_${i}_institution`] || '',
        qualification: data[`rms_education_${i}_qualification`] || data[`Rms_education_${i}_qualification`] || '',
        location: data[`rms_education_${i}_location`] || data[`Rms_education_${i}_location`] || '',
        date: data[`rms_education_${i}_date`] || data[`Rms_education_${i}_date`] || '',
        dateFormat: 'MMMM YYYY',
        minor: '',
        score: (data[`rms_education_${i}_score`] || data[`Rms_education_${i}_score`])?.toString() || '',
        scoreType: data[`rms_education_${i}_scoreType`] || data[`Rms_education_${i}_scoreType`] || '',
        details: '',
        isGraduate: data[`rms_education_${i}_isGraduate`] || data[`rms_education_${i}_isgraduate`] || data[`Rms_education_${i}_isGraduate`] || true
      });
    }
  }

  // Parse skills
  if (data.skillCategories && Array.isArray(data.skillCategories)) {
    unified.skills = data.skillCategories.map((cat: any) => ({
      id: cat.id || `skill_${Date.now()}`,
      category: cat.name || cat.category || '',
      keywords: Array.isArray(cat.skills)
        ? cat.skills.map((s: any) => s.name || s).join(', ')
        : cat.keywords || ''
    }));
  } else if (data.rms_skill_count || data.Rms_skill_count) {
    // Handle RMS format - try both lowercase and capitalized field names
    const skillCount = data.rms_skill_count || data.Rms_skill_count;
    unified.skills = [];
    for (let i = 0; i < skillCount; i++) {
      unified.skills.push({
        id: `skill_${i}`,
        category: data[`rms_skill_${i}_category`] || data[`Rms_skill_${i}_category`] || '',
        keywords: data[`rms_skill_${i}_keywords`] || data[`Rms_skill_${i}_keywords`] || ''
      });
    }
  }

  // Parse projects
  if (data.projects && Array.isArray(data.projects)) {
    unified.projects = data.projects.map((proj: any) => ({
      id: proj.id || `proj_${Date.now()}`,
      title: proj.title || '',
      organization: proj.organization || '',
      startDate: proj.startDate || '',
      endDate: proj.endDate || '',
      url: proj.url || '',
      description: proj.description || '',
      technologies: Array.isArray(proj.technologies) ? proj.technologies : []
    }));
  } else if (data.rms_project_count || data.Rms_project_count) {
    // Handle RMS format - try both lowercase and capitalized field names
    const projectCount = data.rms_project_count || data.Rms_project_count;
    unified.projects = [];
    for (let i = 0; i < projectCount; i++) {
      unified.projects.push({
        id: `proj_${i}`,
        title: data[`rms_project_${i}_title`] || data[`Rms_project_${i}_title`] || '',
        organization: data[`rms_project_${i}_organization`] || data[`Rms_project_${i}_organization`] || '',
        startDate: '',
        endDate: '',
        url: data[`rms_project_${i}_url`] || data[`Rms_project_${i}_url`] || '',
        description: data[`rms_project_${i}_description`] || data[`Rms_project_${i}_description`] || '',
        current: false,
        bulletPoints: []
      });
    }
  }

  // Parse involvements
  if (data.involvements && Array.isArray(data.involvements)) {
    unified.involvements = data.involvements;
  } else if (data.rms_involvement_count || data.Rms_involvement_count) {
    // Handle RMS format - try both lowercase and capitalized field names
    const involvementCount = data.rms_involvement_count || data.Rms_involvement_count;
    unified.involvements = [];
    for (let i = 0; i < involvementCount; i++) {
      unified.involvements.push({
        id: `inv_${i}`,
        organization: data[`rms_involvement_${i}_organization`] || data[`Rms_involvement_${i}_organization`] || '',
        role: data[`rms_involvement_${i}_role`] || data[`Rms_involvement_${i}_role`] || '',
        location: data[`rms_involvement_${i}_location`] || data[`Rms_involvement_${i}_location`] || '',
        startDate: data[`rms_involvement_${i}_dateBegin`] || data[`rms_involvement_${i}_datebegin`] || data[`Rms_involvement_${i}_dateBegin`] || '',
        endDate: data[`rms_involvement_${i}_dateEnd`] || data[`rms_involvement_${i}_dateend`] || data[`Rms_involvement_${i}_dateEnd`] || '',
        current: false,
        description: data[`rms_involvement_${i}_description`] || data[`Rms_involvement_${i}_description`] || ''
      });
    }
  }

  // Parse certifications
  if (data.certifications && Array.isArray(data.certifications)) {
    unified.certifications = data.certifications.map((cert: any) => ({
      id: cert.id || `cert_${Date.now()}`,
      name: cert.name || cert.certificateName || '',
      issuer: cert.issuer || cert.issuingOrganization || cert.department || '',
      date: cert.date || cert.issueDate || '',
      expiryDate: cert.expiryDate || '',
      credentialId: cert.credentialId || '',
      url: cert.url || ''
    }));
  } else if (data.rms_certification_count || data.Rms_certification_count) {
    // Handle RMS format - try both lowercase and capitalized field names
    const certificationCount = data.rms_certification_count || data.Rms_certification_count;
    unified.certifications = [];
    for (let i = 0; i < certificationCount; i++) {
      unified.certifications.push({
        id: `cert_${i}`,
        name: data[`rms_certification_${i}_name`] || data[`Rms_certification_${i}_name`] || '',
        issuer: data[`rms_certification_${i}_department`] || data[`rms_certification_${i}_issuer`] || data[`Rms_certification_${i}_department`] || data[`Rms_certification_${i}_issuer`] || '',
        date: data[`rms_certification_${i}_date`] || data[`Rms_certification_${i}_date`] || '',
        expiryDate: '',
        credentialId: '',
        url: ''
      });
    }
  }

  // Copy over remaining fields
  unified.coursework = data.coursework || [];
  unified.awards = data.awards || [];
  unified.languages = data.languages || [];
  unified.publications = data.publications || [];

  return unified;
};

export default function ResumeEditorArea({ resume }: ResumeEditorAreaProps) {
  const pathname = usePathname();
  const params = useParams();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Initialize with unified format
  const [resumeData, setResumeData] = useState<UnifiedResumeData>(() => {
    if (resume?.data) {
      return resume.data;
    }
    // Handle legacy format
    return parseToUnifiedFormat(resume);
  });

  // Determine which section to show based on the current route
  const section = pathname.split('/').pop() || 'summary';

  // Save data to Firebase
  const saveToFirebase = async (updatedData: UnifiedResumeData) => {
    if (!resume || !resume.id) {
      toast({
        title: "Save Failed",
        description: "No resume ID found. Unable to save changes.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const resumeRef = doc(db, 'resumes', resume.id);
      await updateDoc(resumeRef, {
        data: updatedData,
        // Keep parsedData for backward compatibility during migration
        parsedData: updatedData,
        updatedAt: serverTimestamp()
      });
      toast({
        title: "Saved Successfully",
        description: "Your changes have been saved.",
      });
    } catch (error) {
      console.error('Error saving resume:', error);
      toast({
        title: "Save Failed",
        description: "There was an error saving your changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handler functions for each form
  const handleSummaryChange = async (summary: string) => {
    const updatedData = { ...resumeData, summary };
    setResumeData(updatedData);
    await saveToFirebase(updatedData);
  };

  const handleContactChange = async (contactInfo: ContactFormData) => {
    const updatedData = { ...resumeData, contactInfo };
    setResumeData(updatedData);
    await saveToFirebase(updatedData);
  };

  const handleExperienceChange = async (experiences: ExperienceEntry[]) => {
    const updatedData = { ...resumeData, experiences };
    setResumeData(updatedData);
    await saveToFirebase(updatedData);
  };

  const handleEducationChange = async (education: EducationEntry[]) => {
    const updatedData = { ...resumeData, education };
    setResumeData(updatedData);
    await saveToFirebase(updatedData);
  };

  const handleSkillsChange = async (skills: SkillEntry[]) => {
    const updatedData = { ...resumeData, skills };
    setResumeData(updatedData);
    await saveToFirebase(updatedData);
  };

  const handleProjectsChange = async (projects: ProjectEntry[]) => {
    const updatedData = { ...resumeData, projects };
    setResumeData(updatedData);
    await saveToFirebase(updatedData);
  };

  const handleInvolvementChange = async (involvements: InvolvementEntry[]) => {
    const updatedData = { ...resumeData, involvements };
    setResumeData(updatedData);
    await saveToFirebase(updatedData);
  };

  const handleCourseworkChange = async (coursework: CourseworkEntry[]) => {
    const updatedData = { ...resumeData, coursework };
    setResumeData(updatedData);
    await saveToFirebase(updatedData);
  };

  const handleCertificationsChange = async (certifications: CertificationEntry[]) => {
    const updatedData = { ...resumeData, certifications };
    setResumeData(updatedData);
    await saveToFirebase(updatedData);
  };

  // Render the appropriate form based on the current section
  const renderSection = () => {
    switch (section) {
      case 'summary':
        return (
          <SummaryForm
            initialData={resumeData.summary}
            onSave={handleSummaryChange}
          />
        );

      case 'contact':
        return (
          <ContactForm
            initialData={resumeData.contactInfo}
            onSave={handleContactChange}
            autoSave={false}
          />
        );

      case 'experience':
        return (
          <ExperienceForm
            initialData={resumeData.experiences}
            onSave={handleExperienceChange}
          />
        );

      case 'education':
        return (
          <EducationForm
            initialData={resumeData.education}
            onSave={handleEducationChange}
          />
        );

      case 'skills':
        return (
          <SkillsForm
            initialData={resumeData.skills}
            onSave={handleSkillsChange}
          />
        );

      case 'projects':
        return (
          <ProjectsForm
            initialData={resumeData.projects}
            onSave={handleProjectsChange}
          />
        );

      case 'involvement':
        return (
          <InvolvementForm
            initialData={resumeData.involvements}
            onSave={handleInvolvementChange}
          />
        );

      case 'coursework':
        return (
          <CourseworkForm
            initialData={resumeData.coursework}
            onSave={handleCourseworkChange}
          />
        );

      case 'certifications':
        return (
          <CertificationsForm
            initialData={resumeData.certifications}
            onSave={handleCertificationsChange}
          />
        );

      case 'preview':
        return (
          <ResumePreview
            resumeData={resumeData}
            resumeId={resume.id}
          />
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">Section not found</p>
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      <div className="resume-editor-content">
        {renderSection()}
      </div>
      {isSaving && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded shadow">
          Saving...
        </div>
      )}
    </div>
  );
}