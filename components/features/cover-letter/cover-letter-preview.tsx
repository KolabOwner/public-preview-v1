// src/components/cover-letter/cover-letter-preview.tsx
import React, { useMemo } from 'react';
import { CoverLetterSettings } from '@/components/features/dashboard/cover-letter-header-bar';
import { MapPin, Phone, Mail } from 'lucide-react';

interface CoverLetterPreviewProps {
  coverLetter?: {
    salutation: string;
    opening: string;
    bodyParagraphs: string[];
    closing: string;
    signature: string;
  };
  contactInfo?: {
    fullName?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    city?: string;
    state?: string;
    country?: string;
    linkedin?: string;
  };
  recipientInfo?: {
    companyName: string;
    positionTitle: string;
  };
  settings: CoverLetterSettings;
  className?: string;
}

export default function CoverLetterPreview({
  coverLetter,
  contactInfo,
  recipientInfo,
  settings,
  className = ''
}: CoverLetterPreviewProps) {
  // Get full name from various possible fields
  const fullName = contactInfo?.fullName || 
    (contactInfo?.firstName && contactInfo?.lastName ? 
      `${contactInfo.firstName} ${contactInfo.lastName}` : 
      'Your Name');
  
  const email = contactInfo?.email;
  const phone = contactInfo?.phone;
  const location = [
    contactInfo?.city,
    contactInfo?.state,
    contactInfo?.country
  ].filter(Boolean).join(', ');

  const letterStyles = useMemo(() => ({
    fontFamily: settings.fontFamily,
    fontSize: `${settings.fontSize}pt`,
    lineHeight: settings.lineHeight,
    color: settings.textColor,
  }), [settings]);

  // Default salutation if no cover letter generated
  const defaultSalutation = recipientInfo ? 
    `Dear ${recipientInfo.companyName} Hiring Team` : 
    'Dear Hiring Team';

  return (
    <div 
      data-size="large" 
      data-cropped="false" 
      data-editable="true"
      className={`min-h-[30cm] w-[23.3cm] mx-auto shadow-2xl overflow-hidden max-w-full bg-white rounded-lg ${className}`}
      style={letterStyles}
    >
        {/* Page Break Indicator */}
        <div 
          className="design-studio-break-page absolute -left-[5%] w-[110%] text-gray-600 text-sm hidden"
          style={{ 
            top: 'calc(1006.87px)', 
            fontFamily: '"Source Sans Pro", sans-serif', 
            lineHeight: '20px' 
          }}
        >
          <div className="border-t border-dashed border-black/20"></div>
          Break
        </div>

        {/* Cover Letter Content */}
        <div className="p-[2.6cm_1.42cm_2.6cm_1.38cm]">
          <article className="omegacover" data-icons="true" style={{ fontSize: '9pt', lineHeight: 1.5 }}>
            {/* Header Section */}
            <div className="mb-8">
              {/* Name */}
              <h1 className="name mb-2">
                <div className="inline-block">
                  <span>
                    <div className="focus:outline-none inline">
                      <p className="block editableContent cursor-text !font-bold text-[1em]" dir="ltr">
                        <span>{fullName}</span>
                      </p>
                    </div>
                  </span>
                </div>
              </h1>

              {/* Contact Information */}
              <div className="contact">
                {location && (
                  <div className="block">
                    <span>
                      <div className="focus:outline-none inline">
                        <p className="block editableContent cursor-text font-light pt-0 pb-0 text-sm" dir="ltr">
                          <span>{location}</span>
                        </p>
                      </div>
                    </span>
                  </div>
                )}
                {phone && (
                  <div className="block">
                    <span>
                      <div className="focus:outline-none inline">
                        <p className="block editableContent cursor-text font-light pt-0 pb-0 text-sm">
                          <span>{phone}</span>
                        </p>
                      </div>
                    </span>
                  </div>
                )}
                {email && (
                  <div className="block">
                    <span>
                      <div className="focus:outline-none inline">
                        <p className="block editableContent cursor-text font-light pt-0 pb-0 text-sm" dir="ltr">
                          <span>{email}</span>
                        </p>
                      </div>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Date */}
            <div className="mb-8 text-sm font-light">
              {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>

            {/* Salutation */}
            <div className="intro mb-6">
              <div className="inline-block">
                <span>
                  <div className="focus:outline-none inline">
                    <p className="block editableContent cursor-text inline-flex items-center font-light pt-0 pb-0 text-sm !pb-4" dir="ltr">
                      <span>{coverLetter?.salutation || defaultSalutation}</span>
                    </p>
                  </div>
                </span>
              </div>
            </div>

            {/* Letter Body */}
            <div className="item">
              <div className="">
                <span>
                  <div className="focus:outline-none inline template-node-placeholder" style={{ lineHeight: 1.5, userSelect: 'text', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {coverLetter ? (
                      <>
                        {/* Opening */}
                        <p className="block editableContent cursor-text mb-4 text-justify font-light text-sm">
                          {coverLetter.opening}
                        </p>

                        {/* Body Paragraphs */}
                        {coverLetter.bodyParagraphs.map((paragraph, index) => (
                          <p key={index} className="block editableContent cursor-text mb-4 text-justify font-light text-sm">
                            {paragraph}
                          </p>
                        ))}

                        {/* Closing */}
                        <p className="block editableContent cursor-text mb-4 text-justify font-light text-sm">
                          {coverLetter.closing}
                        </p>

                        {/* Signature */}
                        <div className="mt-8">
                          <p className="block editableContent cursor-text mb-12 font-light text-sm">{coverLetter.signature}</p>
                          <p className="block editableContent cursor-text font-semibold text-sm">{fullName}</p>
                        </div>
                      </>
                    ) : (
                      /* Placeholder content when no cover letter is generated */
                      <p className="block editableContent cursor-text text-gray-400 italic text-sm">
                        Write a tailored cover letter that showcases your unique fit and aspirations for this position…
                      </p>
                    )}
                  </div>
                </span>
              </div>
            </div>
          </article>
        </div>
    </div>
  );
}