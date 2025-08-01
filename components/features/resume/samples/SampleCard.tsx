'use client';

import React, { useState } from 'react';
import { Template } from '@/types/template.types';
import TemplateApplyModal from '@/components/features/resume/modals/template-apply-modal';

interface Sample {
  resumeContent: string;
  title: string;
  tag: string;
  template?: Template;
  templateType?: 'resume' | 'cover_letter';
}

interface SampleCardProps {
  sample: Sample;
}

const SampleCard: React.FC<SampleCardProps> = ({ sample }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const resumePreviewMarkup = { __html: sample.resumeContent };

  const handleCardClick = () => {
    if (sample.template) {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div className="">
        <div className="relative w-[calc(50vw_-_25px)] xs:h-48 sm:h-[290px] md:w-60">
          <div className="bg-white/80 dark:bg-navy-800/90 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-navy-700 shadow-2xl shadow-slate-300/30 dark:shadow-navy-900/50 relative w-[calc(50vw_-_25px)] xs:h-48 sm:h-[290px] md:w-60">
            <div 
              className="relative h-[calc(100%-60px)] cursor-pointer overflow-hidden"
              onClick={handleCardClick}
            >
              <div className="relative h-full">
                <div className="relative overflow-hidden rounded-t-2xl">
                  {/* Resume/Document Preview Area */}
                  <div className="bg-white dark:bg-navy-900 select-none">
                    <div className="bg-white dark:bg-navy-900" style={{ minHeight: '11in' }}>
                      <div dangerouslySetInnerHTML={resumePreviewMarkup} />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Hover overlay with Use Template button */}
              <div className="absolute inset-0 bg-slate-900/60 dark:bg-navy-900/70 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-t-2xl">
                <div className="bg-white/90 dark:bg-navy-800/90 backdrop-blur-sm px-6 py-3 rounded-xl shadow-2xl border border-slate-200 dark:border-navy-600">
                  <span className="text-sm font-bold text-slate-800 dark:text-white">
                    Use Template
                  </span>
                </div>
              </div>

              {/* Template Type Badge */}
              <div className="absolute top-3 right-3">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                  {sample.templateType === 'cover_letter' ? 'Cover Letter' : 'Resume'}
                </div>
              </div>
            </div>
            
            {/* Bottom Info Bar */}
            <div className="relative flex h-[60px] flex-row items-center justify-between rounded-b-2xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-navy-800 dark:to-navy-700 px-4 py-2 border-t border-slate-200 dark:border-navy-600">
              <div className="flex-1 min-w-0">
                <p className="overflow-hidden overflow-ellipsis whitespace-nowrap text-base font-bold leading-6 text-slate-800 dark:text-slate-100">
                  {sample.title}
                </p>
              </div>
              <div className="flex items-center rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-1 ml-2 shadow-md">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  {sample.tag}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Template Application Modal */}
      <TemplateApplyModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        template={sample.template || null}
      />
    </>
  );
};

export default SampleCard;