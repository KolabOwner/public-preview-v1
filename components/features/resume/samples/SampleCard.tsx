'use client';

// src/components/samples/SampleCard.tsx
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
  
  // The full HTML for the resume preview is extensive.
  // In a real application, you might use a dedicated viewer component
  // to parse and render this content more safely and efficiently,
  // possibly constructing React elements instead of raw HTML strings.
  // Using dangerouslySetInnerHTML is generally discouraged due to XSS risks
  // if content is not sanitized properly. For direct conversion, it's used here.
  const resumePreviewMarkup = { __html: sample.resumeContent };

  const handleCardClick = () => {
    if (sample.template) {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div style={{ order: 0 }}>
        {/* Container for the sample card - adjust w/h as needed */}
        <div className="relative w-[calc(50vw_-_25px)] xs:h-48 sm:h-[290px] md:w-60">
          <div className="bg-card rounded-lg border border-border relative w-[calc(50vw_-_25px)] xs:h-48 sm:h-[290px] md:w-60 hover:border-corporate-amber-500 transition-colors">
            <div 
              className="relative h-[calc(100%-60px)] cursor-pointer overflow-hidden"
              onClick={handleCardClick}
            >
              <div className="relative h-full">
                <div className="relative overflow-hidden rounded-lg rounded-b-none border-b-0 p-0">
                  {/* Resume/Document Preview Area */}
                  <div className="bg-card text-card-foreground select-none">
                    <div className="bg-white dark:bg-gray-900" style={{ minHeight: '11in' }}>
                      <div dangerouslySetInnerHTML={resumePreviewMarkup} />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-lg rounded-b-none">
                <div className="bg-white dark:bg-corporate-navy-800 px-4 py-2 rounded-md shadow-lg">
                  <span className="text-sm font-medium text-corporate-navy-900 dark:text-white">
                    Use Template
                  </span>
                </div>
              </div>
            </div>
            {/* Bottom Bar of the card */}
            <div className="relative flex h-[60px] flex-row items-center justify-between rounded-lg rounded-t-none bg-card px-4 py-2">
              <div className="flex-1 min-w-0">
                <p className="overflow-hidden overflow-ellipsis whitespace-nowrap text-base font-semibold leading-6 text-card-foreground">
                  {sample.title}
                </p>
              </div>
              <div className="flex h-6 items-center rounded-full bg-muted px-2 ml-2 text-sm font-semibold text-muted-foreground">
                {sample.tag}
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