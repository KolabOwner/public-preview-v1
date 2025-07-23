// src/components/samples/SampleCard.tsx
import React from 'react';

interface Sample {
  resumeContent: string;
  companyIcon: string;
  title: string;
  tag: string;
}

interface SampleCardProps {
  sample: Sample;
}

const SampleCard: React.FC<SampleCardProps> = ({ sample }) => {
  // The full HTML for the resume preview is extensive.
  // In a real application, you might use a dedicated viewer component
  // to parse and render this content more safely and efficiently,
  // possibly constructing React elements instead of raw HTML strings.
  // Using dangerouslySetInnerHTML is generally discouraged due to XSS risks
  // if content is not sanitized properly. For direct conversion, it's used here.
  const resumePreviewMarkup = { __html: sample.resumeContent };

  return (
    <div style={{ order: 0 }}>
      {/* Container for the sample card - adjust w/h as needed */}
      <div className="relative w-[calc(50vw_-_25px)] xs:h-48 sm:h-[290px] md:w-60">
        <div className="bg-surface-2 rounded-lg border border-surface-2-stroke relative w-[calc(50vw_-_25px)] xs:h-48 sm:h-[290px] md:w-60">
          <div className="relative h-[calc(100%-60px)] cursor-pointer overflow-hidden">
            <div className="relative h-full">
              <div className="relative overflow-hidden rounded-lg rounded-b-none border-b-0 p-0">
                {/* Resume/Document Preview Area */}
                {/* Keeping inline style to preserve original HTML's color declaration */}
                <div className="bg-surface-2 select-none" style={{ color: 'rgb(46, 61, 80)' }}>
                  <div className="bg-surface-2" style={{ minHeight: '11in' }}>
                    <div dangerouslySetInnerHTML={resumePreviewMarkup} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Bottom Bar of the card */}
          <div className="relative flex h-[60px] flex-row items-center justify-between rounded-lg rounded-t-none bg-surface-2 py-2">
            <div className="absolute right-4 top-[-8rem] bg-surface-2 sm:top-[-13rem] md:top-[-13.75rem]">
              <img src={sample.companyIcon} alt="company_icon" />
            </div>
            <div className="flex max-w-[calc(100%-3rem)] flex-row items-center pl-4">
              <div className="w-full">
                <p className="overflow-hidden overflow-ellipsis whitespace-nowrap pr-2 text-base font-semibold leading-6 text-gray-900">
                  {sample.title}
                </p>
              </div>
              <div className="absolute right-4 flex h-6 items-center rounded-full bg-gray-300 px-2 text-sm font-semibold text-gray-900">
                {sample.tag}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SampleCard;