// components/resume/resume-editor-area.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useParams } from 'next/navigation';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import ContactForm, { ContactFormData } from '../resume-editor/contact-form';
import ExperienceForm, { ExperienceEntry } from '../resume-editor/experience-form';
import EducationForm, { EducationEntry } from '../resume-editor/education-form';
import SkillsForm, { SkillEntry } from '../resume-editor/skills-form';
import ProjectsForm, { ProjectEntry } from '../resume-editor/projects-form';
import InvolvementForm, { InvolvementEntry } from '../resume-editor/involvement-form';
import { CourseworkEntry, CourseworkForm } from '../resume-editor/coursework-form';
import SummaryForm from '../resume-editor/summary-form';

// Import all form components


interface ResumeData {
  id: string;
  title: string;
  userId: string;
  parsedData?: any;
  createdAt: string;
  updatedAt: string;
}

interface ResumeEditorAreaProps {
  resume: ResumeData;
}

function ResumePreview(props: { resumeData: any, resumeId: string }) {
  return null;
}

export default function ResumeEditorArea({ resume }: ResumeEditorAreaProps) {
  const pathname = usePathname();
  const params = useParams();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [resumeData, setResumeData] = useState<any>(resume?.parsedData || {});

  // Determine which section to show based on the current route
  const section = pathname.split('/').pop() || 'summary';

  // Initialize empty data structure if parsedData is missing
  useEffect(() => {
    if (!resume || !resume.parsedData) {
      const defaultData = {
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
        skillCategories: [],
        projects: [],
        involvements: [],
        coursework: [],
        certifications: [],
        awards: [],
        languages: [],
        publications: []
      };
      setResumeData(defaultData);
    } else {
      setResumeData(resume.parsedData);
    }
  }, [resume?.parsedData]);

  // Save data to Firebase
  const saveToFirebase = async (updatedData: any) => {
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
    // Transform education entries to match the expected Firestore format
    const transformedEducation = education.map((edu, idx) => {
      // Convert Date object to string format for storage
      let formattedDate = '';
      if (edu.date) {
        if (edu.date instanceof Date) {
          // Format based on specified format
          if (edu.dateFormat === 'YYYY') {
            formattedDate = format(edu.date, 'yyyy');
          } else if (edu.dateFormat === 'MM/YYYY') {
            formattedDate = format(edu.date, 'MM/yyyy');
          } else {
            // Default format (MMMM YYYY)
            formattedDate = format(edu.date, 'MMMM yyyy');
          }
        } else if (typeof edu.date === 'string') {
          formattedDate = edu.date;
        }
      }

      // Create a comprehensive object that works with both our form and Firestore schema
      // Check for RMS qualification data (this often has the richest data)
      const richQualification = edu.rms_education_0_qualification || edu.qualification || edu.degree || "";

      return {
        // Fields expected by the Firestore schema
        id: edu.id || `edu_${idx}`,
        school: edu.institution,  // Primary field for Firestore
        degree: richQualification, // Primary field for Firestore
        fieldOfStudy: edu.minor || "",
        location: edu.location || "",
        startDate: "",
        endDate: formattedDate,
        current: false,
        gpa: edu.score || "",
        gpaScale: edu.scoreType || "",
        honors: "",
        activities: "",
        description: edu.details || "",

        // Extra fields for our form to use when editing - these maintain backward compatibility
        date: edu.date,
        dateFormat: edu.dateFormat,
        institution: edu.institution, // Primary field for form
        qualification: richQualification, // Primary field for form
        minor: edu.minor,
        score: edu.score,
        scoreType: edu.scoreType,
        details: edu.details,
        isGraduate: edu.isGraduate,
        formattedDate
      };
    });

    const updatedData = { ...resumeData, education: transformedEducation };
    setResumeData(updatedData);
    await saveToFirebase(updatedData);
  };

  const handleSkillsChange = async (skillCategories: SkillEntry[]) => {
    // Transform skill entries to match the expected format
    const transformedSkills = skillCategories.map((category, idx) => ({
      id: category.id || `category_${idx}`,
      name: category.category,
      skills: category.keywords.split(/[,\n]/).map((skill, skillIdx) => ({
        id: `skill_${idx}_${skillIdx}`,
        name: skill.trim(),
        level: ''
      })).filter(s => s.name)
    }));

    const updatedData = { ...resumeData, skillCategories: transformedSkills };
    setResumeData(updatedData);
    await saveToFirebase(updatedData);
  };

  const handleProjectsChange = async (projects: ProjectEntry[]) => {
    // Transform project entries to match the expected Firestore schema format
    const transformedProjects = projects.map((proj, idx) => {
      return {
        id: proj.id || `proj_${idx}`,
        title: proj.title,
        organization: proj.organization,
        startDate: proj.startDate,
        endDate: proj.endDate,
        url: proj.url,
        description: proj.description,
        technologies: Array.isArray(proj.technologies) ? proj.technologies :
                     typeof proj.technologies === 'string' ? [proj.technologies] : [],

        // Add any additional fields that might be expected by the Firestore schema
        current: false,
        projectType: ""
      };
    });

    const updatedData = { ...resumeData, projects: transformedProjects };
    setResumeData(updatedData);
    await saveToFirebase(updatedData);
  };

  const handleInvolvementChange = async (involvements: InvolvementEntry[]) => {
    // Transform involvement entries to match the expected Firestore schema format
    const transformedInvolvements = involvements.map((inv, idx) => {
      return {
        id: inv.id || `inv_${idx}`,
        organization: inv.organization,
        role: inv.role,
        location: inv.location,
        startDate: inv.startDate,
        endDate: inv.endDate,
        current: inv.current,
        description: inv.description,

        // Extra fields that might be expected by the Firestore schema
        position: inv.role, // alias for role
        activities: "",
        achievements: ""
      };
    });

    const updatedData = { ...resumeData, involvements: transformedInvolvements };
    setResumeData(updatedData);
    await saveToFirebase(updatedData);
  };

  const handleCourseworkChange = async (coursework: CourseworkEntry[]) => {
    const updatedData = { ...resumeData, coursework };
    setResumeData(updatedData);
    await saveToFirebase(updatedData);
  };

  // Transform data for forms
  const getContactFormData = (): ContactFormData => {
    const contact = resumeData.contactInfo || {};
    return {
      fullName: contact.fullName || '',
      email: contact.email || '',
      phone: contact.phone || '',
      linkedin: contact.linkedin || '',
      website: contact.website || '',
      country: contact.country || '',
      state: contact.state || '',
      city: contact.city || '',
      showEmail: contact.showEmail !== false,
      showPhone: contact.showPhone !== false,
      showLinkedin: contact.showLinkedin !== false,
      showWebsite: contact.showWebsite !== false,
      showLocation: contact.showLocation !== false
    };
  };

  const getSkillsFormData = (): SkillEntry[] => {
    if (!resumeData.skillCategories || resumeData.skillCategories.length === 0) {
      return [{ id: `skill-${Date.now()}`, category: '', keywords: '' }];
    }

    return resumeData.skillCategories.map((category: any) => ({
      id: category.id,
      category: category.name,
      keywords: category.skills.map((s: any) => s.name).join(', ')
    }));
  };

  // Render the appropriate form based on the current section
  const renderSection = () => {
    switch (section) {
      case 'summary':
        return (
          <SummaryForm
            initialData={resumeData.summary || ''}
            onSave={handleSummaryChange}
          />
        );

      case 'contact':
        return (
          <ContactForm
            initialData={getContactFormData()}
            onSave={handleContactChange}
            autoSave={false}
          />
        );

      case 'experience':
        return (
          <ExperienceForm
            initialData={resumeData.experiences || []}
            onSave={handleExperienceChange}
          />
        );

      case 'education':
        return (
          <EducationForm
            initialData={resumeData.education || []}
            onSave={handleEducationChange}
          />
        );

      case 'skills':
        return (
          <SkillsForm
            initialData={getSkillsFormData()}
            onSave={handleSkillsChange}
          />
        );

      case 'projects':
        return (
          <ProjectsForm
            initialData={resumeData.projects || []}
            onSave={handleProjectsChange}
          />
        );

      case 'involvement':
        return (
          <InvolvementForm
            initialData={resumeData.involvements || []}
            onSave={handleInvolvementChange}
          />
        );

      case 'coursework':
        return (
          <CourseworkForm
            initialData={resumeData.coursework || []}
            onSave={handleCourseworkChange}
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
    </div>
  );
}