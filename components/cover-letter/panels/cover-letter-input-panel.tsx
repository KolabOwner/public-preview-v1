// src/components/cover-letter/panels/cover-letter-input-panel.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useJobInfo } from '@/contexts/job-info-context';
import { Sparkles } from 'lucide-react';

interface CoverLetterInputPanelProps {
  resumeData: any;
  onGenerate: (params: CoverLetterParams) => void;
  isGenerating?: boolean;
  className?: string;
}

export interface CoverLetterParams {
  companyName: string;
  positionTitle: string;
  jobDescription?: string;
  educationHighlight: string;
  skillsHighlight: string[];
  positionHighlight: string;
  tone: 'professional' | 'enthusiastic' | 'confident' | 'friendly';
  length: 'concise' | 'standard' | 'detailed';
  includeCallToAction: boolean;
}

export default function CoverLetterInputPanel({
  resumeData,
  onGenerate,
  isGenerating = false,
  className = ''
}: CoverLetterInputPanelProps) {
  const { jobInfo } = useJobInfo();

  // Form state
  const [companyName, setCompanyName] = useState('');
  const [positionTitle, setPositionTitle] = useState('');
  const [positionHighlight, setPositionHighlight] = useState('');
  const [educationHighlight, setEducationHighlight] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [useResumePosition, setUseResumePosition] = useState(false);
  const [useResumeEducation, setUseResumeEducation] = useState(false);

  // Extract position options from resume
  const positionOptions = useCallback(() => {
    const options: string[] = [];
    
    // Handle array format
    if (resumeData?.experience) {
      resumeData.experience.slice(0, 3).forEach((exp: any) => {
        if (exp.position && exp.company) {
          options.push(`${exp.position} at ${exp.company}`);
        }
      });
    } 
    // Handle RMS format with indexed fields in rmsRawData
    else if (resumeData?.rmsRawData?.rms_experience_count) {
      const expCount = resumeData.rmsRawData.rms_experience_count;
      for (let i = 0; i < Math.min(expCount, 3); i++) {
        const role = resumeData.rmsRawData[`rms_experience_${i}_role`];
        const company = resumeData.rmsRawData[`rms_experience_${i}_company`];
        if (role && company) {
          options.push(`${role} at ${company}`);
        }
      }
    }
    
    return options;
  }, [resumeData]);

  // Extract education options from resume
  const educationOptions = useCallback(() => {
    const options: string[] = [];
    
    // Handle array format
    if (resumeData?.education) {
      resumeData.education.forEach((edu: any) => {
        const degree = edu.qualification && edu.fieldOfStudy ?
          `${edu.qualification} in ${edu.fieldOfStudy}` :
          edu.qualification || edu.degree || '';
        if (degree) {
          const institution = edu.institution || edu.school || '';
          options.push(`${degree} at ${institution}`);
        }
      });
    }
    // Handle RMS format with indexed fields in rmsRawData
    else if (resumeData?.rmsRawData?.rms_education_count) {
      const eduCount = resumeData.rmsRawData.rms_education_count;
      for (let i = 0; i < eduCount; i++) {
        const qualification = resumeData.rmsRawData[`rms_education_${i}_qualification`];
        const institution = resumeData.rmsRawData[`rms_education_${i}_institution`];
        const minor = resumeData.rmsRawData[`rms_education_${i}_minor`];
        
        if (qualification && institution) {
          const degree = minor && minor !== 'n/a' && minor !== 'Computer Science' ? 
            `${qualification}, Minor in ${minor}` : 
            qualification;
          options.push(`${degree} at ${institution}`);
        }
      }
    }
    
    return options;
  }, [resumeData]);

  // Auto-populate from job info if available
  useEffect(() => {
    if (jobInfo && jobInfo.isActive) {
      if (jobInfo.company && !companyName) {
        setCompanyName(jobInfo.company);
      }
      if (jobInfo.title && !positionTitle) {
        setPositionTitle(jobInfo.title);
      }
    }
  }, [jobInfo]);

  // Handle toggle switches
  useEffect(() => {
    if (useResumePosition) {
      const positions = positionOptions();
      if (positions.length > 0) {
        setPositionHighlight(positions[0]);
      }
    } else {
      setPositionHighlight('');
    }
  }, [useResumePosition, positionOptions]);

  useEffect(() => {
    if (useResumeEducation) {
      const education = educationOptions();
      if (education.length > 0) {
        setEducationHighlight(education[0]);
      }
    } else {
      setEducationHighlight('');
    }
  }, [useResumeEducation, educationOptions]);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse skills
    const skills = skillsInput.split(',').map(s => s.trim()).filter(Boolean);
    
    onGenerate({
      companyName: companyName.trim(),
      positionTitle: positionTitle.trim(),
      jobDescription: jobInfo?.description,
      positionHighlight: positionHighlight.trim(),
      educationHighlight: educationHighlight.trim(),
      skillsHighlight: skills,
      tone: 'professional',
      length: 'standard',
      includeCallToAction: true,
    });
  };

  const isReady = companyName && positionTitle && skillsInput.trim();

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex flex-col gap-y-4">
        <div>
          <h2 className="text-lg leading-7 font-semibold text-gray-900 dark:text-gray-100 flex w-full justify-between items-center">
            <span className="w-full">AI Cover Letter Writer</span>
          </h2>
          <div className="border-t border-gray-200 dark:border-gray-700 w-full mt-3 h-0 transition duration-150 ease-in-out"></div>
        </div>
        <h5 className="text-sm leading-5 font-normal text-gray-500 dark:text-gray-400">
          Rezi AI helps you to write your cover letter. It's super easy - let's start by adding information for the position you want apply for. Strange result? Just regenerate!
        </h5>
      </div>

      <form onSubmit={handleGenerate} className="my-4 flex flex-col gap-y-4">
        {/* Company Name */}
        <div className="relative grid content-baseline gap-y-1">
          <div className="inline-block">
            <div className="flex items-end justify-between">
              <label className="uppercase flex items-center text-gray-900 dark:text-gray-100 font-normal">
                <span className="cursor-default text-sm leading-5">Company Name</span>
                <span className="cursor-default text-sm leading-5 ml-1 text-red-500">*</span>
              </label>
            </div>
          </div>
          <div className="flex flex-row items-center">
            <div className="flex w-full flex-col gap-1">
              <div className="h-10 text-base flex w-full flex-row items-center self-stretch border-2 rounded border-gray-300 dark:border-gray-600 px-3 py-1 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white dark:bg-gray-700 gap-1">
                <input
                  autoComplete="off"
                  className="bg-transparent text-gray-900 dark:text-gray-100 h-6 w-full !border-0 px-1 text-base font-semibold leading-6 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-ellipsis focus:outline-none focus:ring-0"
                  type="text"
                  placeholder="Google"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  disabled={isGenerating}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Position/Title */}
        <div className="relative grid content-baseline gap-y-1">
          <div className="inline-block">
            <div className="flex items-end justify-between">
              <label className="uppercase flex items-center text-gray-900 dark:text-gray-100 font-normal">
                <span className="cursor-default text-sm leading-5">Position/Title</span>
                <span className="cursor-default text-sm leading-5 ml-1 text-red-500">*</span>
              </label>
            </div>
          </div>
          <div className="flex flex-row items-center">
            <div className="flex w-full flex-col gap-1">
              <div className="h-10 text-base flex w-full flex-row items-center self-stretch border-2 rounded border-gray-300 dark:border-gray-600 px-3 py-1 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white dark:bg-gray-700 gap-1">
                <input
                  autoComplete="off"
                  className="bg-transparent text-gray-900 dark:text-gray-100 h-6 w-full !border-0 px-1 text-base font-semibold leading-6 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-ellipsis focus:outline-none focus:ring-0"
                  type="text"
                  placeholder="Data Analyst"
                  required
                  value={positionTitle}
                  onChange={(e) => setPositionTitle(e.target.value)}
                  disabled={isGenerating}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Position Highlight */}
        <div className="relative w-full">
          <div className="flex flex-row items-center justify-between gap-1 mb-1">
            <div className="cursor-pointer text-ellipsis whitespace-nowrap text-sm uppercase leading-5 text-gray-900 dark:text-gray-100">
              Position Highlight <span className="text-red-500">*</span>
            </div>
            <div className="flex flex-col items-center sm:flex-row">
              <span className="text-ellipsis whitespace-nowrap pr-1 text-sm leading-5 text-gray-600 dark:text-gray-400">from resume</span>
              <div className={`w-7 h-3.5 ${useResumePosition ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'} flex relative rounded-full items-center p-[0.19rem] cursor-pointer transition-all ease-in-out duration-200`}>
                <div className={`w-2 h-2 bg-white dark:bg-gray-200 flex absolute justify-center items-center rounded-full transition-all ease-in-out duration-200 ${useResumePosition ? 'translate-x-3.5' : ''}`}></div>
                <input
                  className="flex h-full w-full cursor-pointer p-5 opacity-0"
                  type="checkbox"
                  checked={useResumePosition}
                  onChange={(e) => setUseResumePosition(e.target.checked)}
                  disabled={isGenerating}
                />
              </div>
            </div>
          </div>
          <div className="flex w-full flex-col gap-1">
            <div className="h-10 text-base flex w-full flex-row items-center self-stretch border-2 rounded border-gray-300 dark:border-gray-600 px-3 py-1 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white dark:bg-gray-700 gap-1">
              <input
                autoComplete="off"
                className="bg-transparent text-gray-900 dark:text-gray-100 h-6 w-full !border-0 px-1 text-base font-semibold leading-6 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-ellipsis focus:outline-none focus:ring-0"
                type="text"
                placeholder="Marketing Assistant at Sony"
                value={positionHighlight}
                onChange={(e) => setPositionHighlight(e.target.value)}
                disabled={isGenerating || useResumePosition}
              />
            </div>
          </div>
        </div>

        {/* Education Highlight */}
        <div className="relative w-full">
          <div className="flex flex-row items-center justify-between gap-1 mb-1">
            <div className="cursor-pointer text-ellipsis whitespace-nowrap text-sm uppercase leading-5 text-gray-900 dark:text-gray-100">
              Education Highlight <span className="text-red-500">*</span>
            </div>
            <div className="flex flex-col items-center justify-end sm:flex-row">
              <span className="text-ellipsis whitespace-nowrap pr-1 text-sm leading-5 text-gray-600 dark:text-gray-400">from resume</span>
              <div className={`w-7 h-3.5 ${useResumeEducation ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'} flex relative rounded-full items-center p-[0.19rem] cursor-pointer transition-all ease-in-out duration-200`}>
                <div className={`w-2 h-2 bg-white dark:bg-gray-200 flex absolute justify-center items-center rounded-full transition-all ease-in-out duration-200 ${useResumeEducation ? 'translate-x-3.5' : ''}`}></div>
                <input
                  className="flex h-full w-full cursor-pointer p-5 opacity-0"
                  type="checkbox"
                  checked={useResumeEducation}
                  onChange={(e) => setUseResumeEducation(e.target.checked)}
                  disabled={isGenerating}
                />
              </div>
            </div>
          </div>
          <div className="flex w-full flex-col gap-1">
            <div className="h-10 text-base flex w-full flex-row items-center self-stretch border-2 rounded border-gray-300 dark:border-gray-600 px-3 py-1 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white dark:bg-gray-700 gap-1">
              <input
                autoComplete="off"
                className="bg-transparent text-gray-900 dark:text-gray-100 h-6 w-full !border-0 px-1 text-base font-semibold leading-6 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-ellipsis focus:outline-none focus:ring-0"
                type="text"
                placeholder="Master in Computer Science at..."
                value={educationHighlight}
                onChange={(e) => setEducationHighlight(e.target.value)}
                disabled={isGenerating || useResumeEducation}
              />
            </div>
          </div>
        </div>

        {/* Skills Highlight */}
        <div>
          <span className="text-sm uppercase leading-5 text-gray-900 dark:text-gray-100">Skills Highlight <span className="text-red-500">*</span></span>
          <div>
            <div className="my-0.5"></div>
            <div className="flex w-full flex-col gap-1">
              <div className="h-10 text-base flex w-full flex-row items-center self-stretch border-2 rounded border-gray-300 dark:border-gray-600 px-3 py-1 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white dark:bg-gray-700 gap-1">
                <input
                  autoComplete="off"
                  className="bg-transparent text-gray-900 dark:text-gray-100 h-6 w-full !border-0 px-1 text-base font-semibold leading-6 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-ellipsis focus:outline-none focus:ring-0"
                  type="text"
                  placeholder="Enter skill"
                  required
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  disabled={isGenerating}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <button
          type="submit"
          disabled={!isReady || isGenerating}
          style={{
            backgroundImage: isReady && !isGenerating ? 'linear-gradient(80deg, #2563eb 0%, #2563eb 10%, #b3241a 50%, #a63cac 70%, #2563eb 90%, #2563eb 100%)' : '',
            backgroundPosition: 'left center',
            backgroundSize: '800%'
          }}
          className={`relative flex items-center justify-center font-bold uppercase focus:ring-0 focus:outline-none transition transition-200 ${
            isReady && !isGenerating
              ? 'hover:animate-[loading_2s_infinite] border-0 bg-blue-600 active:bg-blue-700 focus:bg-blue-500 text-white hover:bg-blue-500'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
          } px-2 py-1 min-h-8 leading-4 rounded-md text-xs`}
        >
          <div className="mr-1 relative w-[14px] h-[14px]">
            <div className="opacity-100">
              <Sparkles className="w-[14px] h-[14px] fill-white" />
            </div>
            <div className="opacity-40 absolute right-0 top-0">
              <Sparkles className="w-[6px] h-[6px] fill-white" />
            </div>
            <div className="opacity-40 absolute right-0 bottom-0">
              <Sparkles className="w-[6px] h-[6px] fill-white" />
            </div>
          </div>
          <span className="px-1">{isGenerating ? 'GENERATING...' : 'AI WRITER READY'}</span>
        </button>
      </form>
    </div>
  );
}