'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/firebase-auth-context';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from "@/config/firebase-config";
import { useUserUsage } from '@/lib/client/hooks/auth/use-user-usage';
import { useSubscription } from '@/lib/client/hooks/auth/use-subscription';
import { Template, ResumeTemplate, CoverLetterTemplate } from '@/types/template.types';
import {
  X,
  FileText,
  Sparkles,
  Crown,
  CheckCircle
} from 'lucide-react';

interface TemplateApplyModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  template: Template | null;
}

export default function TemplateApplyModal({ isOpen, onOpenChange, template }: TemplateApplyModalProps) {
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState('');
  const [resumeTitle, setResumeTitle] = useState('');
  
  const { user } = useAuth();
  const router = useRouter();
  const { usage, loading: usageLoading, incrementPdfDownload, canDownloadPdf } = useUserUsage();
  const { subscription, loading: subscriptionLoading } = useSubscription();

  const onClose = () => {
    setResumeTitle('');
    setError('');
    setIsApplying(false);
    onOpenChange(false);
  };

  if (!isOpen || !template) return null;

  // Check if user can access this template
  const isResumeTemplate = template.type === 'resume';
  const isCoverLetterTemplate = template.type === 'cover_letter';
  const canAccessTemplate = isResumeTemplate || (isCoverLetterTemplate && (subscription.isPro || subscription.isEnterprise));
  const isPremiumTemplate = template.metadata.isPremium;
  const canAccessPremiumTemplate = !isPremiumTemplate || subscription.isPro || subscription.isEnterprise;

  // Set default title when template changes
  const defaultTitle = `${template.role} ${template.type === 'resume' ? 'Resume' : 'Cover Letter'}`;
  if (!resumeTitle && template) {
    setResumeTitle(defaultTitle);
  }

  const handleApplyTemplate = async () => {
    if (!user) {
      setError('You must be logged in to apply a template');
      return;
    }

    if (!resumeTitle.trim()) {
      setError('Please enter a name for your resume');
      return;
    }

    // Check if usage is still loading
    if (usageLoading) {
      setError('Loading your usage information...');
      return;
    }

    // Check subscription access for cover letters
    if (isCoverLetterTemplate && !subscription.isPro && !subscription.isEnterprise) {
      setError('Cover letter templates are available for Pro users only. Please upgrade your plan.');
      return;
    }

    // Check premium template access
    if (isPremiumTemplate && !subscription.isPro && !subscription.isEnterprise) {
      setError('This premium template is available for Pro users only. Please upgrade your plan.');
      return;
    }

    // Check PDF generation limit for resume templates
    if (isResumeTemplate && !canDownloadPdf()) {
      setError(`You've reached your PDF generation limit (${usage.pdfGenerations}/${usage.maxPdfGenerations}). Please upgrade your plan.`);
      return;
    }

    setIsApplying(true);
    setError('');

    try {
      // Create resume document in Firestore with template data
      const resumeData: Record<string, any> = {
        title: resumeTitle,
        userId: user.uid,
        templateId: template.id,
        templateType: template.type,
        industry: template.industry,
        role: template.role,
        experienceLevel: template.experienceLevel,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'created_from_template'
      };

      // Convert template content to RMS format
      if (isResumeTemplate) {
        const resumeTemplate = template as ResumeTemplate;
        const content = resumeTemplate.content;
        
        // Convert template content to RMS raw data format
        const rmsRawData: Record<string, any> = {
          // Contact info
          Rms_contact_fullName: content.name || '',
          rms_contact_fullname: content.name || '',
          Rms_contact_email: content.email || '',
          rms_contact_email: content.email || '',
          Rms_contact_phone: content.phone || '',
          rms_contact_phone: content.phone || '',
          Rms_contact_linkedin: content.linkedin || '',
          rms_contact_linkedin: content.linkedin || '',
          Rms_contact_website: content.website || '',
          rms_contact_website: content.website || '',
          Rms_contact_city: content.location?.split(',')[0]?.trim() || '',
          rms_contact_city: content.location?.split(',')[0]?.trim() || '',
          Rms_contact_state: content.location?.split(',')[1]?.trim() || '',
          rms_contact_state: content.location?.split(',')[1]?.trim() || '',
          Rms_contact_country: '',
          rms_contact_country: '',
          
          // Summary
          Rms_summary: content.summary || '',
          rms_summary: content.summary || '',
          
          // Experience
          Rms_experience_count: content.experience?.length || 0,
          rms_experience_count: content.experience?.length || 0,
          
          // Education
          Rms_education_count: content.education?.length || 0,
          rms_education_count: content.education?.length || 0,
          
          // Skills - count skill categories (technical, soft, languages)
          Rms_skill_count: ((content.skills?.technical?.length ?? 0) > 0 ? 1 : 0) + 
                           ((content.skills?.soft?.length ?? 0) > 0 ? 1 : 0) + 
                           ((content.skills?.languages?.length ?? 0) > 0 ? 1 : 0),
          rms_skill_count: ((content.skills?.technical?.length ?? 0) > 0 ? 1 : 0) + 
                          ((content.skills?.soft?.length ?? 0) > 0 ? 1 : 0) + 
                          ((content.skills?.languages?.length ?? 0) > 0 ? 1 : 0),
          
          // Projects
          Rms_project_count: content.projects?.length || 0,
          rms_project_count: content.projects?.length || 0,
          
          // Certifications
          Rms_certification_count: content.skills?.certifications?.length || 0,
          rms_certification_count: content.skills?.certifications?.length || 0,
          
          // Involvement/Volunteer
          Rms_involvement_count: content.volunteer?.length || 0,
          rms_involvement_count: content.volunteer?.length || 0,
        };

        // Add experience entries
        content.experience?.forEach((exp, index) => {
          rmsRawData[`Rms_experience_${index}_role`] = exp.jobTitle || '';
          rmsRawData[`rms_experience_${index}_role`] = exp.jobTitle || '';
          rmsRawData[`Rms_experience_${index}_company`] = exp.companyName || '';
          rmsRawData[`rms_experience_${index}_company`] = exp.companyName || '';
          rmsRawData[`Rms_experience_${index}_location`] = exp.location || '';
          rmsRawData[`rms_experience_${index}_location`] = exp.location || '';
          rmsRawData[`Rms_experience_${index}_dateBegin`] = exp.startDate || '';
          rmsRawData[`rms_experience_${index}_dateBegin`] = exp.startDate || '';
          rmsRawData[`Rms_experience_${index}_dateEnd`] = exp.endDate || '';
          rmsRawData[`rms_experience_${index}_dateEnd`] = exp.endDate || '';
          rmsRawData[`Rms_experience_${index}_isCurrent`] = exp.isCurrent || false;
          rmsRawData[`rms_experience_${index}_isCurrent`] = exp.isCurrent || false;
          rmsRawData[`Rms_experience_${index}_description`] = exp.responsibilities?.join('\n') || '';
          rmsRawData[`rms_experience_${index}_description`] = exp.responsibilities?.join('\n') || '';
        });

        // Add education entries
        content.education?.forEach((edu, index) => {
          rmsRawData[`Rms_education_${index}_institution`] = edu.school || '';
          rmsRawData[`rms_education_${index}_institution`] = edu.school || '';
          rmsRawData[`Rms_education_${index}_qualification`] = edu.degree || '';
          rmsRawData[`rms_education_${index}_qualification`] = edu.degree || '';
          rmsRawData[`Rms_education_${index}_location`] = edu.location || '';
          rmsRawData[`rms_education_${index}_location`] = edu.location || '';
          rmsRawData[`Rms_education_${index}_date`] = edu.endDate || '';
          rmsRawData[`rms_education_${index}_date`] = edu.endDate || '';
          rmsRawData[`Rms_education_${index}_score`] = edu.gpa || '';
          rmsRawData[`rms_education_${index}_score`] = edu.gpa || '';
          rmsRawData[`Rms_education_${index}_scoreType`] = edu.gpa ? 'GPA' : '';
          rmsRawData[`rms_education_${index}_scoreType`] = edu.gpa ? 'GPA' : '';
        });

        // Add skills grouped by category
        let skillIndex = 0;
        
        // Technical skills as one entry
        if (content.skills?.technical && content.skills.technical.length > 0) {
          rmsRawData[`Rms_skill_${skillIndex}_category`] = 'Technical Skills';
          rmsRawData[`rms_skill_${skillIndex}_category`] = 'Technical Skills';
          rmsRawData[`Rms_skill_${skillIndex}_keywords`] = content.skills.technical.join(', ');
          rmsRawData[`rms_skill_${skillIndex}_keywords`] = content.skills.technical.join(', ');
          skillIndex++;
        }

        // Soft skills as one entry
        if (content.skills?.soft && content.skills.soft.length > 0) {
          rmsRawData[`Rms_skill_${skillIndex}_category`] = 'Soft Skills';
          rmsRawData[`rms_skill_${skillIndex}_category`] = 'Soft Skills';
          rmsRawData[`Rms_skill_${skillIndex}_keywords`] = content.skills.soft.join(', ');
          rmsRawData[`rms_skill_${skillIndex}_keywords`] = content.skills.soft.join(', ');
          skillIndex++;
        }

        // Languages as one entry (if they exist)
        if (content.skills?.languages && content.skills.languages.length > 0) {
          rmsRawData[`Rms_skill_${skillIndex}_category`] = 'Languages';
          rmsRawData[`rms_skill_${skillIndex}_category`] = 'Languages';
          rmsRawData[`Rms_skill_${skillIndex}_keywords`] = content.skills.languages.map(lang => `${lang.language} (${lang.proficiency})`).join(', ');
          rmsRawData[`rms_skill_${skillIndex}_keywords`] = content.skills.languages.map(lang => `${lang.language} (${lang.proficiency})`).join(', ');
          skillIndex++;
        }

        // Add projects
        content.projects?.forEach((project, index) => {
          rmsRawData[`Rms_project_${index}_name`] = project.name || '';
          rmsRawData[`rms_project_${index}_name`] = project.name || '';
          rmsRawData[`Rms_project_${index}_title`] = project.name || '';
          rmsRawData[`rms_project_${index}_title`] = project.name || '';
          rmsRawData[`Rms_project_${index}_description`] = project.description || '';
          rmsRawData[`rms_project_${index}_description`] = project.description || '';
          rmsRawData[`Rms_project_${index}_url`] = project.link || '';
          rmsRawData[`rms_project_${index}_url`] = project.link || '';
          rmsRawData[`Rms_project_${index}_organization`] = '';
          rmsRawData[`rms_project_${index}_organization`] = '';
        });

        // Add certifications
        content.skills?.certifications?.forEach((cert, index) => {
          rmsRawData[`Rms_certification_${index}_name`] = cert.name || '';
          rmsRawData[`rms_certification_${index}_name`] = cert.name || '';
          rmsRawData[`Rms_certification_${index}_issuer`] = cert.issuer || '';
          rmsRawData[`rms_certification_${index}_issuer`] = cert.issuer || '';
          rmsRawData[`Rms_certification_${index}_department`] = cert.issuer || '';
          rmsRawData[`rms_certification_${index}_department`] = cert.issuer || '';
          rmsRawData[`Rms_certification_${index}_date`] = cert.date || '';
          rmsRawData[`rms_certification_${index}_date`] = cert.date || '';
        });

        // Add volunteer/involvement
        content.volunteer?.forEach((vol, index) => {
          rmsRawData[`Rms_involvement_${index}_organization`] = vol.organization || '';
          rmsRawData[`rms_involvement_${index}_organization`] = vol.organization || '';
          rmsRawData[`Rms_involvement_${index}_role`] = vol.role || '';
          rmsRawData[`rms_involvement_${index}_role`] = vol.role || '';
          rmsRawData[`Rms_involvement_${index}_location`] = '';
          rmsRawData[`rms_involvement_${index}_location`] = '';
          rmsRawData[`Rms_involvement_${index}_dateBegin`] = vol.startDate || '';
          rmsRawData[`rms_involvement_${index}_dateBegin`] = vol.startDate || '';
          rmsRawData[`Rms_involvement_${index}_dateEnd`] = vol.endDate || '';
          rmsRawData[`rms_involvement_${index}_dateEnd`] = vol.endDate || '';
          rmsRawData[`Rms_involvement_${index}_description`] = vol.description || '';
          rmsRawData[`rms_involvement_${index}_description`] = vol.description || '';
        });

        resumeData.rmsRawData = rmsRawData;
      }

      // Create resume document
      const docRef = await addDoc(collection(db, 'resumes'), resumeData);

      // Apply template via API (this increments template popularity)
      await fetch(`/api/templates/${template.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: template.type,
          resumeId: docRef.id
        }),
      });

      // Increment PDF generation count for resume templates
      if (isResumeTemplate) {
        await incrementPdfDownload();
      }

      // Navigate to the new resume's contact page
      router.push(`/dashboard/resumes/${docRef.id}/contact`);
      onClose();

    } catch (err) {
      console.error('Error applying template:', err);
      setError((err as Error).message || 'Failed to apply template');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 dark:bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 dark:bg-corporate-navy-800 backdrop-blur-sm rounded-lg w-full max-w-md shadow-2xl border border-corporate-navy-200 dark:border-corporate-navy-600">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-corporate-navy-200 dark:border-corporate-navy-600">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-corporate-amber-500/10 rounded-lg">
              <FileText className="w-6 h-6 text-corporate-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-corporate-navy-900 dark:text-white">
                Apply Template
              </h2>
              <p className="text-sm text-corporate-navy-600 dark:text-gray-400">
                {template.role} • {template.industry}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-corporate-navy-500 dark:text-gray-400 hover:text-corporate-amber-600 dark:hover:text-corporate-amber-400 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Access Restrictions */}
          {isCoverLetterTemplate && !subscription.isPro && !subscription.isEnterprise && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-amber-600" />
                <span className="font-medium text-amber-800 dark:text-amber-200">Pro Feature</span>
              </div>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Cover letter templates are available for Pro users only. Upgrade to access this template.
              </p>
            </div>
          )}

          {isPremiumTemplate && !subscription.isPro && !subscription.isEnterprise && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-amber-600" />
                <span className="font-medium text-amber-800 dark:text-amber-200">Premium Template</span>
              </div>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                This premium template is available for Pro users only. Upgrade to access this template.
              </p>
            </div>
          )}

          {/* Template Info */}
          <div className="bg-corporate-navy-50 dark:bg-corporate-navy-700 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-corporate-navy-900 dark:text-white">
                  {template.role}
                </h3>
                <p className="text-sm text-corporate-navy-600 dark:text-gray-400 capitalize">
                  {template.industry} • {template.experienceLevel} level
                </p>
              </div>
              <div className="flex items-center gap-2">
                {isPremiumTemplate && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Premium</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs font-medium">
                    {template.metadata.rating.toFixed(1)} rating
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sm text-corporate-navy-700 dark:text-gray-300">
              This template will create a new {template.type === 'resume' ? 'resume' : 'cover letter'} 
              pre-filled with professional content tailored for {template.industry} industry positions.
            </p>
          </div>

          {/* Resume Name Input */}
          {canAccessTemplate && canAccessPremiumTemplate && (
            <div>
              <label className="block text-sm font-medium text-corporate-navy-700 dark:text-gray-300 mb-2">
                {template.type === 'resume' ? 'RESUME' : 'COVER LETTER'} NAME <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={resumeTitle}
                onChange={(e) => setResumeTitle(e.target.value)}
                placeholder={`Enter name for your ${template.type === 'resume' ? 'resume' : 'cover letter'}...`}
                className="w-full px-4 py-3 bg-white dark:bg-corporate-navy-700 border border-corporate-navy-300 dark:border-corporate-navy-600 rounded-md text-corporate-navy-900 dark:text-white placeholder-corporate-navy-500 dark:placeholder-gray-400 focus:outline-none focus:border-corporate-amber-500 focus:ring-2 focus:ring-corporate-amber-500/20 transition-colors"
              />
            </div>
          )}

          {/* Usage Info for Resumes */}
          {isResumeTemplate && canAccessTemplate && canAccessPremiumTemplate && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <span className="font-medium">Usage:</span> {usage.pdfGenerations}/{usage.maxPdfGenerations === -1 ? '∞' : usage.maxPdfGenerations} PDF generations used
                {!canDownloadPdf() && (
                  <span className="block mt-1 text-red-600 dark:text-red-400 font-medium">
                    You&apos;ve reached your PDF generation limit. Please upgrade to continue.
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-corporate-navy-200 dark:border-corporate-navy-600">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-corporate-navy-600 dark:text-gray-300 hover:text-corporate-navy-800 dark:hover:text-white transition-colors"
          >
            CANCEL
          </button>
          <button
            onClick={handleApplyTemplate}
            disabled={
              !resumeTitle.trim() || 
              isApplying || 
              !canAccessTemplate || 
              !canAccessPremiumTemplate ||
              (isResumeTemplate && !canDownloadPdf()) ||
              usageLoading ||
              subscriptionLoading
            }
            className={`
              px-6 py-2 text-sm font-medium rounded-md transition-colors
              ${resumeTitle.trim() && !isApplying && canAccessTemplate && canAccessPremiumTemplate && (isResumeTemplate ? canDownloadPdf() : true) && !usageLoading && !subscriptionLoading
                ? 'bg-corporate-amber-600 text-white hover:bg-corporate-amber-700 shadow-md shadow-corporate-gold-500/30'
                : 'bg-corporate-navy-300 dark:bg-corporate-navy-700 text-corporate-navy-500 dark:text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {isApplying ? 'APPLYING...' : 'APPLY TEMPLATE'}
          </button>
        </div>
      </div>
    </div>
  );
}