'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { formatDistanceToNow } from 'date-fns';
import { doc, deleteDoc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from "@/lib/features/auth/firebase-config";
import { useAuth } from '@/contexts/auth-context';
import UpgradeModal from './modals/upgrade-modal';



interface ResumeProps {
  resume: {
    id: string;
    title: string;
    lastUpdated: string;
    createdAt: string;
    isTargeted?: boolean;
    thumbnail?: string;
  };
  isLocked?: boolean;
  usage?: any;
  onDelete?: () => void;
  onRefresh?: () => void;
}

interface ContactInfo {
  fullName?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
  linkedin?: string;
  website?: string;
  github?: string;
  showEmail?: boolean;
  showPhone?: boolean;
  showLocation?: boolean;
  showLinkedin?: boolean;
  showWebsite?: boolean;
}

interface Experience {
  id?: string;
  title?: string;
  company?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  responsibilities?: string[];
}

interface Education {
  id?: string;
  school?: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  gpa?: string;
  location?: string;
  description?: string;
}

interface SkillCategory {
  id?: string;
  name?: string;
  skills?: Array<{
    id?: string;
    name?: string;
    level?: string;
  }>;
}

interface ResumeData {
  contactInfo?: ContactInfo;
  experiences?: Experience[];
  education?: Education[];
  skillCategories?: SkillCategory[];
  summary?: string;
}

export default function ResumeGridCard({ resume, isLocked = false, usage, onDelete, onRefresh }: ResumeProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownButtonRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchResumeData = async () => {
      try {
        const resumeDoc = await getDoc(doc(db, 'resumes', resume.id));
        if (resumeDoc.exists()) {
          const data = resumeDoc.data();

          // Try to use parsed data first, fall back to raw RMS data
          if (data.parsedData) {
            // Use the parsed data structure
            const parsedData = data.parsedData;
            setResumeData({
              contactInfo: parsedData.contactInfo || {},
              experiences: (parsedData.experiences || []).slice(0, 3), // Limit to first 3
              education: (parsedData.education || []).slice(0, 2), // Limit to first 2
              skillCategories: parsedData.skillCategories || [],
              summary: parsedData.summary || ''
            });
          } else {
            // Fall back to extracting from raw RMS data
            // Check if we have rmsRawData object first
            const rmsData = data.rmsRawData || data;
            
            const transformedData: ResumeData = {
              contactInfo: {
                fullName: rmsData.Rms_contact_fullName || rmsData.rms_contact_fullName || data.title || resume.title || '',
                email: rmsData.Rms_contact_email || rmsData.rms_contact_email || '',
                phone: rmsData.Rms_contact_phone || rmsData.rms_contact_phone || '',
                city: rmsData.Rms_contact_city || rmsData.rms_contact_city || '',
                state: rmsData.Rms_contact_state || rmsData.rms_contact_state || '',
                linkedin: rmsData.Rms_contact_linkedin || rmsData.rms_contact_linkedin || '',
                website: rmsData.Rms_contact_website || rmsData.rms_contact_website || '',
                github: rmsData.Rms_contact_github || rmsData.rms_contact_github || ''
              },
              summary: rmsData.Rms_summary || rmsData.rms_summary || '',
              experiences: [],
              education: [],
              skillCategories: []
            };

            // Extract experience from RMS format
            const expCount = parseInt(rmsData.Rms_experience_count || rmsData.rms_experience_count || '0');
            for (let i = 0; i < expCount && i < 3; i++) {
              const exp: Experience = {
                title: rmsData[`Rms_experience_${i}_role`] || rmsData[`rms_experience_${i}_role`] || '',
                company: rmsData[`Rms_experience_${i}_company`] || rmsData[`rms_experience_${i}_company`] || '',
                location: rmsData[`Rms_experience_${i}_location`] || rmsData[`rms_experience_${i}_location`] || '',
                startDate: rmsData[`Rms_experience_${i}_dateBegin`] || rmsData[`rms_experience_${i}_dateBegin`] || '',
                endDate: rmsData[`Rms_experience_${i}_dateEnd`] || rmsData[`rms_experience_${i}_dateEnd`] || '',
                current: rmsData[`Rms_experience_${i}_isCurrent`] === true || rmsData[`Rms_experience_${i}_isCurrent`] === 'true' || rmsData[`rms_experience_${i}_isCurrent`] === 'true',
                description: rmsData[`Rms_experience_${i}_description`] || rmsData[`rms_experience_${i}_description`] || ''
              };
              if (exp.title || exp.company) {
                transformedData.experiences?.push(exp);
              }
            }

            // Extract education from RMS format
            const eduCount = parseInt(rmsData.Rms_education_count || rmsData.rms_education_count || '0');
            for (let i = 0; i < eduCount && i < 2; i++) {
              const edu: Education = {
                degree: rmsData[`Rms_education_${i}_qualification`] || rmsData[`rms_education_${i}_qualification`] || '',
                school: rmsData[`Rms_education_${i}_institution`] || rmsData[`rms_education_${i}_institution`] || '',
                startDate: rmsData[`Rms_education_${i}_date`] || rmsData[`rms_education_${i}_date`] || '',
                location: rmsData[`Rms_education_${i}_location`] || rmsData[`rms_education_${i}_location`] || ''
              };
              if (edu.degree || edu.school) {
                transformedData.education?.push(edu);
              }
            }

            // Extract skills from RMS format
            const skillCount = parseInt(rmsData.Rms_skill_count || rmsData.rms_skill_count || '0');
            for (let i = 0; i < skillCount && i < 5; i++) {
              const category = rmsData[`Rms_skill_${i}_category`] || rmsData[`rms_skill_${i}_category`] || '';
              const keywords = rmsData[`Rms_skill_${i}_keywords`] || rmsData[`rms_skill_${i}_keywords`] || '';

              if (keywords) {
                const skills = keywords.split(',').map((name: string, index: number) => ({
                  id: `skill_${i}_${index}`,
                  name: name.trim(),
                  level: ''
                }));

                transformedData.skillCategories?.push({
                  id: `category_${i}`,
                  name: category,
                  skills: skills
                });
              }
            }

            setResumeData(transformedData);
          }
        } else {
          setError('Resume not found');
        }
      } catch (error) {
        console.error('Error fetching resume data:', error);
        setError('Failed to load resume data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResumeData();
  }, [resume.id, resume.title]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownButtonRef.current && !dropdownButtonRef.current.contains(event.target as Node)) {
        const target = event.target as Element;
        // Don't close if clicking inside the dropdown portal
        if (!target.closest('[data-dropdown-portal]')) {
          setShowMenu(false);
        }
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!showMenu && dropdownButtonRef.current) {
      const rect = dropdownButtonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right + window.scrollX - 200 // Align right edge
      });
    }
    
    setShowMenu(!showMenu);
  };

  const formatDateRange = (startDate?: string, endDate?: string, current?: boolean) => {
    if (!startDate && !endDate) return '';

    const start = startDate || '';
    const end = current ? 'Present' : (endDate || '');

    if (start && end) {
      return `${start} – ${end}`;
    }
    return start || end;
  };

  const getExperienceDescriptionItems = (exp: Experience): string[] => {
    // Handle both string (comma-separated) and array formats
    if (exp.description && typeof exp.description === 'string') {
      // Split by periods followed by a space (to avoid splitting decimals)
      // Also check for double periods (..) which are used in the data
      const items = exp.description
        .split(/\.\s+/)
        .filter(item => item.trim().length > 0)
        .map(item => item.replace(/\.$/, '').trim()) // Remove trailing periods
        .slice(0, 6); // Limit to max 6 bullets per experience
      return items;
    }
    if (exp.responsibilities && Array.isArray(exp.responsibilities)) {
      return exp.responsibilities.slice(0, 6); // Limit to max 6 bullets per experience
    }
    return [];
  };

  const getAllSkills = (): string[] => {
    const allSkills: string[] = [];
    resumeData?.skillCategories?.forEach(category => {
      category.skills?.forEach(skill => {
        if (skill.name) {
          allSkills.push(skill.name);
        }
      });
    });
    return allSkills.slice(0, 15); // Limit to prevent overflow
  };

  const getLastUpdatedText = () => {
    try {
      const date = new Date(resume.lastUpdated);
      return `Edited ${formatDistanceToNow(date, { addSuffix: false })} ago`;
    } catch (e) {
      return 'Edited recently';
    }
  };

  const getFormattedDate = () => {
    try {
      const date = new Date(resume.lastUpdated);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
    } catch (e) {
      return '';
    }
  };

  // Navigate to the resume editor
  const handleEdit = () => {
    if (isLocked) {
      setShowUpgradeModal(true);
      return;
    }
    router.push(`/dashboard/resumes/${resume.id}/contact`);
  };

  // Navigate to the resume builder/details page
  const handleCardClick = () => {
    if (isLocked) {
      setShowUpgradeModal(true);
      return;
    }
    router.push(`/dashboard/resumes/${resume.id}/contact`);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm('Are you sure you want to delete this resume?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'resumes', resume.id));
      if (onDelete) onDelete();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error deleting resume:', error);
      alert('Failed to delete resume');
    } finally {
      setIsDeleting(false);
      setShowMenu(false);
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement PDF download functionality
    console.log('Download PDF:', resume.id);
    setShowMenu(false);
  };

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    
    if (!user) return;

    try {
      // Get the original resume data
      const originalDoc = await getDoc(doc(db, 'resumes', resume.id));
      if (!originalDoc.exists()) {
        alert('Resume not found');
        return;
      }

      const originalData = originalDoc.data();
      
      // Create new resume data with updated title and timestamps
      const { id, ...dataWithoutId } = originalData;
      const duplicatedData = {
        ...dataWithoutId,
        title: `${originalData.title} (Copy)`,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Add the duplicated resume to Firestore
      const newDocRef = await addDoc(collection(db, 'resumes'), duplicatedData);
      
      // Refresh the page to show the new resume
      if (onRefresh) onRefresh();
      
      // Optionally navigate to the new resume
      router.push(`/dashboard/resumes/${newDocRef.id}/contact`);
      
    } catch (error) {
      console.error('Error duplicating resume:', error);
      alert('Failed to duplicate resume');
    }
  };

  return (
    <div className="relative">
      <div className="relative w-[calc(50vw_-_25px)] xs:h-48 sm:h-[290px] md:w-60 group">
        <div className="bg-white/80 dark:bg-navy-800/90 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-navy-700 relative w-[calc(50vw_-_25px)] xs:h-48 sm:h-[290px] md:w-60 shadow-lg shadow-slate-200/30 dark:shadow-navy-900/50">
          {/* Resume Preview Section */}
          <div
            className="relative h-[calc(100%-60px)] cursor-pointer overflow-hidden"
            onClick={handleCardClick}
          >
            <div className="relative h-full">
              <div className="h-full w-full overflow-hidden rounded-lg rounded-b-none border-b-0 p-0 bg-white dark:bg-slate-800">
                {isLoading ? (
                  <div className="flex h-full w-full items-center justify-center bg-white dark:bg-slate-800">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#48c9b0] border-t-transparent"></div>
                  </div>
                ) : error ? (
                  <div className="flex h-full w-full items-center justify-center bg-white dark:bg-slate-800">
                    <p className="text-red-500 text-sm">{error}</p>
                  </div>
                ) : (
                  <div>
                    <div className="bg-white dark:bg-slate-800 select-none">
                      <div className="bg-white dark:bg-slate-800" style={{ minHeight: '11in' }}>
                        <div
                          id="resume"
                          className="relative bg-white dark:bg-slate-800 [&>*]:pointer-events-none [&>*]:select-none false"
                          data-type="designStudio"
                          data-format="letter"
                          data-template="standard"
                          style={{
                            fontSize: '9pt',
                            lineHeight: '1.5',
                            width: '250%',
                            transform: 'scale(0.4)',
                            transformOrigin: 'left top',
                            fontFamily: 'Merriweather, serif',
                            padding: '1cm 0cm',
                            borderColor: ''
                          }}
                        >
                          {/* Resume Header / Contact Information */}
                          <div className="relative z-50 mb-[8px] transition-all">
                            <div className="">
                              <div className="flex flex-row items-end gap-4 pb-1 false false" style={{ paddingLeft: '1.4cm', paddingRight: '1.4cm' }}>
                                <div className="grow">
                                  <h1 className="font-bold text-center text-gray-900 dark:text-gray-100" style={{ fontSize: '1.5em', fontFamily: 'Merriweather, serif', lineHeight: '1.2' }}>
                                    <span className="text-gray-900 dark:text-gray-100">
                                      {resumeData?.contactInfo?.fullName || resume.title || 'JOHN SMITH'}
                                    </span>
                                  </h1>
                                  <div className="flex flex-row items-center gap-1 flex-wrap text-gray-700 dark:text-gray-300" style={{ fontWeight: 300, fontSize: '0.7em', justifyContent: 'center' }}>
                                    {(resumeData?.contactInfo?.city || resumeData?.contactInfo?.state) && (
                                      <div className="flex flex-row items-center gap-1 text-gray-700 dark:text-gray-300">
                                        <svg xmlns="https://www.w3.org/2000/svg" xmlSpace="preserve" viewBox="0 0 24 24" className="fill-gray-700 dark:fill-gray-300" width="0.9em" height="0.9em" style={{ marginTop: '-2px' }}>
                                          <path d="M12 1.1C7.6 1.1 4.1 4.6 4.1 9c0 5.4 7.1 13.3 7.4 13.7.3.3.8.3 1.1 0S20 14.4 20 9c-.1-4.4-3.6-7.9-8-7.9M12 13c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4"></path>
                                        </svg>
                                        <div className="flex flex-row items-center gap-1">
                                          {resumeData?.contactInfo?.city && (
                                            <div className="[&amp;:not(:last-child)]:after:content-[',']">
                                              {resumeData.contactInfo.city}
                                            </div>
                                          )}
                                          {resumeData?.contactInfo?.state && (
                                            <div className="[&amp;:not(:last-child)]:after:content-[',']">
                                              {resumeData.contactInfo.state}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                    {resumeData?.contactInfo?.email && (
                                      <span className="flex flex-row items-center gap-1 text-gray-700 dark:text-gray-300">
                                        <svg xmlns="https://www.w3.org/2000/svg" viewBox="0 0 24 24" className="fill-gray-700 dark:fill-gray-300" width="0.9em" height="0.9em">
                                          <path d="M20.016 8.016V6L12 11.016 3.984 6v2.016L12 12.985zm0-4.032q.797 0 1.383.609t.586 1.406v12q0 .797-.586 1.406t-1.383.609H3.985q-.797 0-1.383-.609t-.586-1.406v-12q0-.797.586-1.406t1.383-.609z"></path>
                                        </svg>
                                        <div>{resumeData.contactInfo.email}</div>
                                      </span>
                                    )}
                                    {resumeData?.contactInfo?.phone && (
                                      <span className="flex flex-row items-center gap-1 text-gray-700 dark:text-gray-300">
                                        <svg xmlns="https://www.w3.org/2000/svg" viewBox="0 0 24 24" className="fill-gray-700 dark:fill-gray-300" width="0.9em" height="0.9em">
                                          <path d="M19.5 0h-15A1.5 1.5 0 0 0 3 1.5v21A1.5 1.5 0 0 0 4.5 24h15a1.5 1.5 0 0 0 1.5-1.5v-21A1.5 1.5 0 0 0 19.5 0M18 18H6V3h12z"></path>
                                        </svg>
                                        <div>{resumeData.contactInfo.phone}</div>
                                      </span>
                                    )}
                                    {resumeData?.contactInfo?.linkedin && (
                                      <span className="flex flex-row items-center gap-1 text-gray-700 dark:text-gray-300">
                                        <svg xmlns="https://www.w3.org/2000/svg" viewBox="0 0 24 24" className="fill-gray-700 dark:fill-gray-300" width="0.9em" height="0.9em">
                                          <path d="M21.75 0H2.25A2.257 2.257 0 0 0 0 2.25v19.5A2.257 2.257 0 0 0 2.25 24h19.5A2.257 2.257 0 0 0 24 21.75V2.25A2.257 2.257 0 0 0 21.75 0M9 19.5H6V9h3zm-1.5-12C6.67 7.5 6 6.83 6 6s.67-1.5 1.5-1.5S9 5.17 9 6s-.67 1.5-1.5 1.5m12 12h-3v-6c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v6h-3V9h3v1.861C14.119 10.013 15.066 9 16.125 9c1.866 0 3.375 1.678 3.375 3.75z"></path>
                                        </svg>
                                        <a target="_blank" href="#" rel="noreferrer noopener" className="text-gray-700 dark:text-gray-300">
                                          {resumeData.contactInfo.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, 'in/')}
                                        </a>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Separator */}
                          <div style={{ padding: '0cm 1.4cm', margin: '0.5em 0px 0.5em' }}><hr className="border-gray-300 dark:border-gray-600" /></div>

                          {/* Summary Section if available */}
                          {resumeData?.summary && (
                            <>
                              <div className="summary group relative leading-snug" style={{ marginBottom: '6px', marginTop: '0.5em' }}>
                                <div>
                                  <div className="uppercase mb-[2px]" style={{ fontWeight: 600, padding: '0cm 1.4cm', lineHeight: '1.2em' }}>
                                    <span className="text-gray-900 dark:text-gray-100">
                                      <p className="text-gray-900 dark:text-gray-100" style={{ fontSize: '1em', display: 'flex', minWidth: '1em', width: 'fit-content' }}>SUMMARY</p>
                                    </span>
                                    <hr className="mt-px border-0 border-b-[1px] border-gray-400 dark:border-gray-500" />
                                  </div>
                                  <div className="text-gray-700 dark:text-gray-300" style={{ padding: '0cm 1.4cm', fontSize: '0.8em', lineHeight: '1.4em' }}>
                                    <p>{resumeData.summary.slice(0, 150)}...</p>
                                  </div>
                                </div>
                              </div>
                              <div style={{ padding: '0cm 1.4cm', margin: '0.5em 0px' }}><hr style={{ borderTop: '1px solid #000' }} /></div>
                            </>
                          )}

                          {/* Experience Section */}
                          <ul className="classNames.sortable_container">
                            <li className="experience group relative leading-snug" style={{ marginBottom: '6px', marginTop: '0.5em' }}>
                              <div>
                                <div className="uppercase mb-[2px]" data-test-id="resume__section-title" style={{ fontWeight: 600, padding: '0cm 1.4cm', lineHeight: '1.2em' }}>
                                  <span className="text-gray-900 dark:text-gray-100">
                                    <p id="experience-heading" className="editableContent cursor-text designStudio text-gray-900 dark:text-gray-100" style={{ fontSize: '1em', display: 'flex', minWidth: '1em', width: 'fit-content' }}>EXPERIENCE</p>
                                  </span>
                                  <hr className="mt-px border-0 border-b-[1px] border-black border-gray-900" />
                                </div>
                                <div className="flex flex-col" style={{ lineHeight: '1.4em' }}>
                                  <ul className="sortable-container">
                                    {resumeData?.experiences && resumeData.experiences.length > 0 ? (
                                      resumeData.experiences.map((exp, index) => (
                                        <li key={index} className="group relative leading-snug" style={{ paddingLeft: '1.4cm', paddingRight: '1.4cm', marginBottom: '6px' }}>
                                          <div style={{ lineHeight: '1.1em' }}>
                                            <div className="flex gap-2">
                                              <span>
                                                <div className="flex flex-row text-[0.9em] font-semibold before:absolute before:content-[',_'] before:first:hidden text-gray-900 dark:text-gray-100">
                                                  <span className="text-[0.9em] leading-snug ml-0 designStudio font-bold text-gray-900 dark:text-gray-100">{exp.title || 'Software Engineer'}</span>
                                                </div>
                                              </span>
                                            </div>
                                            <div className="flex justify-between gap-2 font-semibold">
                                              <div className="flex flex-wrap text-gray-700 dark:text-gray-300">
                                                <span className="flex before:mr-1 before:content-['•_'] before:first:hidden font-semibold" style={{ fontSize: '0.8em', lineHeight: '1.3' }}>
                                                  <span className="mr-1 whitespace-pre-wrap designStudio text-gray-700 dark:text-gray-300" style={{ display: 'inline', verticalAlign: 'initial' }}>{exp.company || 'Tech Company'}</span>
                                                </span>
                                                {exp.location && (
                                                  <span className="flex before:mr-1 before:content-['•_'] before:first:hidden font-normal" style={{ fontSize: '0.8em', lineHeight: '1.3' }}>
                                                    <span className="mr-1 whitespace-pre-wrap designStudio text-gray-700 dark:text-gray-300" style={{ display: 'inline', verticalAlign: 'initial' }}>{exp.location}</span>
                                                  </span>
                                                )}
                                              </div>
                                              <div className="flex flex-wrap text-gray-700 dark:text-gray-300">
                                                <span className="inline-block before:absolute before:first:hidden" style={{ fontSize: '0.8em' }}>
                                                  <span className="leading-snug ml-0 designStudio text-gray-700 dark:text-gray-300">
                                                    {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                                                  </span>
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="text-[0.75em] relative whitespace-pre-line text-gray-600 dark:text-gray-400" style={{ lineHeight: '1.3em', fontSize: '0.75em', fontWeight: 300 }}>
                                            <span className="editableContent cursor-text designStudio">
                                              <ul className="line-inline m-0 list-none p-0 pl-1.5">
                                                {getExperienceDescriptionItems(exp).map((desc, i) => (
                                                  <li key={i} className="relative before:absolute before:left-[-7px] before:content-['•']" style={{ marginBottom: '1px' }}>{desc}</li>
                                                ))}
                                              </ul>
                                            </span>
                                          </div>
                                        </li>
                                      ))
                                    ) : (
                                      // Default experiences
                                      [
                                        { title: 'Senior Software Engineer', company: 'Tech Corp', location: 'New York, NY', startDate: '2022', endDate: 'Present', description: 'Led development of microservices architecture, Mentored junior developers' },
                                        { title: 'Software Engineer', company: 'StartupXYZ', location: 'San Francisco, CA', startDate: '2020', endDate: '2022', description: 'Built RESTful APIs, Implemented CI/CD pipelines' },
                                        { title: 'Junior Developer', company: 'Digital Agency', location: 'Remote', startDate: '2019', endDate: '2020', description: 'Developed responsive web applications, Collaborated with design team' }
                                      ].map((exp, index) => (
                                        <li key={index} className="group relative leading-snug" style={{ paddingLeft: '1.4cm', paddingRight: '1.4cm', marginBottom: '6px' }}>
                                          <div style={{ lineHeight: '1.1em' }}>
                                            <div className="flex gap-2">
                                              <span>
                                                <div className="flex flex-row text-[0.9em] font-semibold before:absolute before:content-[',_'] before:first:hidden text-gray-900 dark:text-gray-100">
                                                  <span className="text-[0.9em] leading-snug ml-0 designStudio font-bold text-gray-900 dark:text-gray-100">{exp.title}</span>
                                                </div>
                                              </span>
                                            </div>
                                            <div className="flex justify-between gap-2 font-semibold">
                                              <div className="flex flex-wrap text-gray-700 dark:text-gray-300">
                                                <span className="flex before:mr-1 before:content-['•_'] before:first:hidden font-semibold" style={{ fontSize: '0.8em', lineHeight: '1.3' }}>
                                                  <span className="mr-1 whitespace-pre-wrap designStudio text-gray-700 dark:text-gray-300" style={{ display: 'inline', verticalAlign: 'initial' }}>{exp.company}</span>
                                                </span>
                                                <span className="flex before:mr-1 before:content-['•_'] before:first:hidden font-normal" style={{ fontSize: '0.8em', lineHeight: '1.3' }}>
                                                  <span className="mr-1 whitespace-pre-wrap designStudio text-gray-700 dark:text-gray-300" style={{ display: 'inline', verticalAlign: 'initial' }}>{exp.location}</span>
                                                </span>
                                              </div>
                                              <div className="flex flex-wrap text-gray-700 dark:text-gray-300">
                                                <span className="inline-block before:absolute before:first:hidden" style={{ fontSize: '0.8em' }}>
                                                  <span className="leading-snug ml-0 designStudio text-gray-700 dark:text-gray-300">
                                                    {exp.startDate} – {exp.endDate}
                                                  </span>
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="text-[0.75em] relative whitespace-pre-line text-gray-600 dark:text-gray-400" style={{ lineHeight: '1.3em', fontSize: '0.75em', fontWeight: 300 }}>
                                            <span className="editableContent cursor-text designStudio">
                                              <ul className="line-inline m-0 list-none p-0 pl-1.5">
                                                {exp.description.split(',').map((desc, i) => (
                                                  <li key={i} className="relative before:absolute before:left-[-7px] before:content-['•']" style={{ marginBottom: '1px' }}>{desc.trim()}</li>
                                                ))}
                                              </ul>
                                            </span>
                                          </div>
                                        </li>
                                      ))
                                    )}
                                  </ul>
                                </div>
                              </div>
                            </li>
                          </ul>

                          {/* Separator */}
                          <div style={{ padding: '0cm 1.4cm', margin: '0.5em 0px 0.5em' }}><hr className="border-gray-300 dark:border-gray-600" /></div>

                          {/* Projects Section */}
                          <li className="projects group relative leading-snug" style={{ marginBottom: '6px', marginTop: '0.5em' }}>
                            <div className="">
                              <div className="uppercase mb-[2px]" style={{ fontWeight: 600, padding: '0cm 1.4cm', lineHeight: '1.2em' }}>
                                <span className="text-gray-900 dark:text-gray-100">
                                  <p className="text-gray-900 dark:text-gray-100" style={{ fontSize: '1em', display: 'flex', minWidth: '1em', width: 'fit-content' }}>PROJECTS</p>
                                </span>
                                <hr className="mt-px border-0 border-b-[1px] border-black" />
                              </div>
                              <div className="flex flex-col" style={{ lineHeight: '1.4em' }}>
                                <ul className="sortable-container">
                                  <li className="group relative leading-snug" style={{ paddingLeft: '1.4cm', paddingRight: '1.4cm', marginBottom: '4px' }}>
                                    <div style={{ lineHeight: '1.1em' }}>
                                      <div className="flex justify-between">
                                        <span className="text-[0.85em] font-semibold text-gray-800 dark:text-gray-200">E-commerce Platform</span>
                                        <span className="text-[0.8em] text-gray-700 dark:text-gray-300">2023</span>
                                      </div>
                                      <div className="text-[0.75em] text-gray-600 dark:text-gray-400" style={{ lineHeight: '1.3em', fontWeight: 300 }}>
                                        <ul className="line-inline m-0 list-none p-0 pl-1.5">
                                          <li className="relative before:absolute before:left-[-7px] before:content-['•']" style={{ marginBottom: '1px' }}>Built scalable microservices architecture using Node.js and Docker</li>
                                          <li className="relative before:absolute before:left-[-7px] before:content-['•']">Implemented real-time inventory tracking with Redis</li>
                                        </ul>
                                      </div>
                                    </div>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </li>

                          {/* Separator */}
                          <div style={{ padding: '0cm 1.4cm', margin: '0.5em 0px' }}><hr style={{ borderTop: '1px solid #000' }} /></div>

                          {/* Education Section */}
                          <li className="education group relative leading-snug" style={{ marginBottom: '6px', marginTop: '0.5em' }}>
                            <div className="">
                              <div className="uppercase mb-[2px]" data-test-id="resume__section-title" style={{ fontWeight: 600, padding: '0cm 1.4cm', lineHeight: '1.2em' }}>
                                <span className="text-gray-900 dark:text-gray-100">
                                  <p id="education-heading" className="editableContent cursor-text designStudio text-gray-900 dark:text-gray-100" style={{ fontSize: '1em', display: 'flex', minWidth: '1em', width: 'fit-content' }}>EDUCATION</p>
                                </span>
                                <hr className="mt-px border-0 border-b-[1px] border-black border-gray-900" />
                              </div>
                              <ul className="sortable-container">
                                <div className="flex flex-col">
                                  {resumeData?.education && resumeData.education.length > 0 ? (
                                    resumeData.education.map((edu, index) => (
                                      <li key={index} className="group relative leading-snug" style={{ paddingLeft: '1.4cm', paddingRight: '1.4cm', marginBottom: '4px' }}>
                                        <div className="">
                                          <div className="flex gap-2">
                                            <span>
                                              <div className="flex flex-row text-[0.9em] font-semibold before:absolute before:content-[',_'] before:first:hidden text-gray-900 dark:text-gray-100">
                                                <span className="text-[0.9em] leading-snug ml-0 designStudio font-bold text-gray-900 dark:text-gray-100">
                                                  {edu.degree || 'Bachelor of Science'} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}
                                                </span>
                                              </div>
                                            </span>
                                          </div>
                                          <div className="flex justify-between gap-2 font-semibold">
                                            <div className="flex flex-wrap text-gray-700 dark:text-gray-300">
                                              <span className="flex before:mr-1 before:content-['•_'] before:first:hidden font-normal" style={{ fontSize: '0.8em', lineHeight: '1.3' }}>
                                                <span className="mr-1 whitespace-pre-wrap designStudio text-gray-700 dark:text-gray-300" style={{ display: 'inline', verticalAlign: 'initial' }}>{edu.school || 'University Name'}</span>
                                              </span>
                                              {edu.location && (
                                                <span className="flex before:mr-1 before:content-['•_'] before:first:hidden font-normal" style={{ fontSize: '0.8em', lineHeight: '1.3' }}>
                                                  <span className="mr-1 whitespace-pre-wrap designStudio text-gray-700 dark:text-gray-300" style={{ display: 'inline', verticalAlign: 'initial' }}>{edu.location}</span>
                                                </span>
                                              )}
                                              {(edu.startDate || edu.endDate) && (
                                                <span className="flex before:mr-1 before:content-['•_'] before:first:hidden font-normal" style={{ fontSize: '0.8em', lineHeight: '1.3' }}>
                                                  <span className="mr-1 whitespace-pre-wrap designStudio text-gray-700 dark:text-gray-300" style={{ display: 'inline', verticalAlign: 'initial' }}>
                                                    {formatDateRange(edu.startDate, edu.endDate, edu.current)}
                                                  </span>
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                          {edu.gpa && (
                                            <div className="text-[0.75em] text-gray-600 dark:text-gray-400" style={{ fontWeight: 300 }}>
                                              GPA: {edu.gpa}
                                            </div>
                                          )}
                                        </div>
                                      </li>
                                    ))
                                  ) : (
                                    <li className="group relative leading-snug" style={{ paddingLeft: '1.4cm', paddingRight: '1.4cm', marginBottom: '4px' }}>
                                      <div className="">
                                        <div className="flex gap-2">
                                          <span>
                                            <div className="flex flex-row text-[0.9em] font-semibold before:absolute before:content-[',_'] before:first:hidden" style={{ color: 'rgb(0, 0, 0)' }}>
                                              <span className="text-[0.9em] leading-snug ml-0 designStudio" style={{ color: 'rgb(0, 0, 0)', fontWeight: 700 }}>Bachelor of Science in Computer Science</span>
                                            </div>
                                          </span>
                                        </div>
                                        <div className="flex justify-between gap-2 font-semibold">
                                          <div className="flex flex-wrap" style={{ color: 'rgb(0, 0, 0)' }}>
                                            <span className="flex before:mr-1 before:content-['•_'] before:first:hidden font-normal" style={{ fontSize: '0.8em', lineHeight: '1.3' }}>
                                              <span className="mr-1 whitespace-pre-wrap designStudio" style={{ display: 'inline', verticalAlign: 'initial', color: 'rgb(0, 0, 0)' }}>Massachusetts Institute of Technology</span>
                                            </span>
                                            <span className="flex before:mr-1 before:content-['•_'] before:first:hidden font-normal" style={{ fontSize: '0.8em', lineHeight: '1.3' }}>
                                              <span className="mr-1 whitespace-pre-wrap designStudio" style={{ display: 'inline', verticalAlign: 'initial', color: 'rgb(0, 0, 0)' }}>2019</span>
                                            </span>
                                          </div>
                                        </div>
                                        <div className="text-[0.75em] text-gray-600 dark:text-gray-400" style={{ fontWeight: 300 }}>
                                          GPA: 3.8/4.0 • Dean's List
                                        </div>
                                      </div>
                                    </li>
                                  )}
                                </div>
                              </ul>
                            </div>
                          </li>

                          {/* Separator */}
                          <div style={{ padding: '0cm 1.4cm', margin: '0.5em 0px 0.5em' }}><hr className="border-gray-300 dark:border-gray-600" /></div>

                          {/* Skills Section */}
                          <li className="skills group relative leading-snug" style={{ marginBottom: '8px', marginTop: '0.5em' }}>
                            <div className="">
                              <div className="uppercase mb-[2px]" data-test-id="resume__section-title" style={{ fontWeight: 600, padding: '0cm 1.4cm', lineHeight: '1.2em' }}>
                                <span className="text-gray-900 dark:text-gray-100">
                                  <p id="skills-heading" className="editableContent cursor-text designStudio text-gray-900 dark:text-gray-100" style={{ fontSize: '1em', display: 'flex', minWidth: '1em', width: 'fit-content' }}>SKILLS</p>
                                </span>
                                <hr className="mt-px border-0 border-b-[1px] border-black border-gray-900" />
                              </div>
                              <div className="flex flex-col" style={{ lineHeight: '1.4em' }}>
                                <ul className="sortable-container">
                                  {resumeData?.skillCategories && resumeData.skillCategories.length > 0 ? (
                                    resumeData.skillCategories.map((category, index) => (
                                      <li key={index} className="group relative leading-snug" style={{ paddingLeft: '1.4cm', paddingRight: '1.4cm', marginBottom: '2px' }}>
                                        <div className="relative whitespace-pre-line text-gray-700 dark:text-gray-300" style={{ fontWeight: 300, fontSize: '0.8em' }}>
                                          <span className="font-bold text-gray-800 dark:text-gray-200">{category.name || 'Technical'}:</span> {category.skills?.map(s => s.name).join(', ') || 'JavaScript, React, Node.js'}
                                        </div>
                                      </li>
                                    ))
                                  ) : (
                                    <>
                                      <li className="group relative leading-snug" style={{ paddingLeft: '1.4cm', paddingRight: '1.4cm', marginBottom: '2px' }}>
                                        <div className="relative whitespace-pre-line text-gray-700 dark:text-gray-300" style={{ fontWeight: 300, fontSize: '0.8em' }}>
                                          <span className="font-bold text-gray-800 dark:text-gray-200">Languages:</span> JavaScript, TypeScript, Python, Java, SQL, HTML/CSS
                                        </div>
                                      </li>
                                      <li className="group relative leading-snug" style={{ paddingLeft: '1.4cm', paddingRight: '1.4cm', marginBottom: '2px' }}>
                                        <div className="relative whitespace-pre-line text-gray-700 dark:text-gray-300" style={{ fontWeight: 300, fontSize: '0.8em' }}>
                                          <span className="font-bold text-gray-800 dark:text-gray-200">Frameworks:</span> React, Node.js, Express, Django, Spring Boot, Next.js
                                        </div>
                                      </li>
                                      <li className="group relative leading-snug" style={{ paddingLeft: '1.4cm', paddingRight: '1.4cm', marginBottom: '2px' }}>
                                        <div className="relative whitespace-pre-line text-gray-700 dark:text-gray-300" style={{ fontWeight: 300, fontSize: '0.8em' }}>
                                          <span className="font-bold text-gray-800 dark:text-gray-200">Tools:</span> Git, Docker, AWS, Jenkins, Kubernetes, MongoDB, PostgreSQL
                                        </div>
                                      </li>
                                    </>
                                  )}
                                </ul>
                              </div>
                            </div>
                          </li>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Targeted Badge */}
            {resume.isTargeted && (
              <div className="absolute right-2 top-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md shadow-blue-500/30">
                TARGETED
              </div>
            )}
          </div>

          {/* Card Footer */}
          <div className="relative flex h-[60px] flex-row items-center justify-between rounded-b-xl rounded-t-none bg-gradient-to-r from-slate-100 to-gray-100 dark:from-navy-800 dark:to-navy-700 py-2 border-t border-slate-200 dark:border-navy-600">
            <div className="flex max-w-[calc(100%-3rem)] flex-row items-center pl-4">
              <div className="w-full">
                <p className="overflow-hidden overflow-ellipsis whitespace-nowrap pr-2 text-base font-semibold leading-6 text-gray-900 dark:text-gray-100">
                  {resume.title}
                </p>
                <p className="text-400 overflow-hidden overflow-ellipsis whitespace-nowrap text-sm leading-5 text-gray-500 dark:text-gray-400">
                  {getLastUpdatedText()}
                </p>
              </div>
            </div>

            {/* Menu Button or Lock Icon */}
            {isLocked ? (
              <div 
                className="flex h-12 w-12 items-center justify-center cursor-pointer" 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUpgradeModal(true);
                }}
              >
                <i className="fad fa-lock text-gray-400 dark:text-gray-300" aria-hidden="true"></i>
              </div>
            ) : resume.isTargeted ? (
              <div className="flex h-12 w-12 items-center justify-center">
                <i className="fad fa-lock text-gray-900 dark:text-gray-100" aria-hidden="true"></i>
              </div>
            ) : (
              <div className="h-12 min-w-12 relative flex cursor-pointer items-center justify-center text-xl">
                <div 
                  ref={dropdownButtonRef}
                  className="h-6 w-6 cursor-pointer group relative flex items-center justify-center" 
                  id="icon"
                >
                  <i
                    className="!flex items-center justify-center fas fa-ellipsis-vertical text-gray-900 dark:text-gray-100 text-xl w-6 h-6"
                    onClick={handleMenuToggle}
                  ></i>
                </div>

                {/* Dropdown Menu - Rendered as Portal */}
                {showMenu && createPortal(
                  <div 
                    data-dropdown-portal="true"
                    className="bg-white dark:bg-navy-800 rounded-lg border border-slate-200 dark:border-navy-700 fixed flex flex-col items-start py-2 shadow-2xl shadow-slate-300/30 dark:shadow-navy-900/50 backdrop-blur-sm z-[9999] min-w-48"
                    style={{
                      top: dropdownPosition.top,
                      left: dropdownPosition.left,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-navy-700 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit();
                        setShowMenu(false);
                      }}
                    >
                      <i className="fad fa-pen-to-square text-base"></i>
                      Edit
                    </button>

                    <button
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-navy-700 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/resumes/${resume.id}/preview`);
                        setShowMenu(false);
                      }}
                    >
                      <i className="fad fa-eye text-base"></i>
                      Preview
                    </button>

                    <button
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-navy-700 transition-colors"
                      onClick={handleDownload}
                    >
                      <i className="fad fa-download text-base"></i>
                      Download PDF
                    </button>

                    <button
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-navy-700 transition-colors"
                      onClick={handleDuplicate}
                    >
                      <i className="fad fa-copy text-base"></i>
                      Duplicate
                    </button>

                    <div className="w-full border-t border-slate-200 dark:border-navy-700 mt-2 mb-2"></div>

                    <button
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      onClick={handleDelete}
                    >
                      <i className="fad fa-trash text-base"></i>
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>,
                  document.body
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
      />
    </div>
  );
}