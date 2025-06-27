// src/components/cover-letter/cover-letter-preview.tsx
import React, { useMemo } from 'react';
import { CoverLetterSettings } from '@/components/layout/cover-letter-header-bar';
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
  
  const email = contactInfo?.email || 'your.email@example.com';
  const phone = contactInfo?.phone || '(555) 123-4567';
  const location = [
    contactInfo?.city,
    contactInfo?.state,
    contactInfo?.country
  ].filter(Boolean).join(', ') || 'City, State';

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
    <div className={`${className}`}>
      {/* Document Container - A4 size */}
      <div 
        data-size="large" 
        data-cropped="false" 
        data-editable="true"
        className="min-h-[30cm] w-[23.3cm] mx-auto rounded-lg border border-gray-200 dark:border-gray-700 relative bg-white shadow-xl"
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
        <div className="p-16">
          <article className="cover-letter-content" style={{ fontSize: letterStyles.fontSize, lineHeight: letterStyles.lineHeight }}>
            {/* Header Section */}
            <div className="mb-8">
              {/* Name */}
              <h1 className="name mb-2">
                <div className="inline-block">
                  <span className="block font-bold text-2xl" style={{ lineHeight: 1.3 }}>
                    {fullName}
                  </span>
                </div>
              </h1>

              {/* Contact Information */}
              <div className="contact flex flex-wrap items-center gap-x-4 text-sm text-gray-600 dark:text-gray-400">
                {location && (
                  <div className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{location}</span>
                  </div>
                )}
                {phone && (
                  <div className="inline-flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    <span>{phone}</span>
                  </div>
                )}
                {email && (
                  <div className="inline-flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    <span>{email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Date */}
            <div className="mb-8 text-sm">
              {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>

            {/* Salutation */}
            <div className="intro mb-6">
              <p className="font-normal">
                {coverLetter?.salutation || defaultSalutation}
              </p>
            </div>

            {/* Letter Body */}
            <div className="letter-content">
              {coverLetter ? (
                <>
                  {/* Opening */}
                  <p className="mb-4 text-justify">
                    {coverLetter.opening}
                  </p>

                  {/* Body Paragraphs */}
                  {coverLetter.bodyParagraphs.map((paragraph, index) => (
                    <p key={index} className="mb-4 text-justify">
                      {paragraph}
                    </p>
                  ))}

                  {/* Closing */}
                  <p className="mb-4 text-justify">
                    {coverLetter.closing}
                  </p>

                  {/* Signature */}
                  <div className="mt-8">
                    <p className="mb-12">{coverLetter.signature}</p>
                    <p className="font-semibold">{fullName}</p>
                  </div>
                </>
              ) : (
                /* Placeholder content when no cover letter is generated */
                <div className="text-gray-400 dark:text-gray-600 italic">
                  <p className="mb-4">
                    Write a tailored cover letter that showcases your unique fit and aspirations for this position...
                  </p>
                </div>
              )}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}