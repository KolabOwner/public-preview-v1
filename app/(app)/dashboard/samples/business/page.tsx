// app/(app)/dashboard/samples/business/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import SampleCard from "@/components/features/resume/samples/SampleCard";
import { TemplateClient } from '@/lib/client/services/template-client';
import { Template } from '@/types/template.types';

export interface Sample {
  id: number;
  title: string;
  tag: string;
  resumeContent: string;
}

const BusinessSamplesPage: React.FC = () => {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBusinessSamples = async () => {
      try {
        setLoading(true);
        const templates = await TemplateClient.getSamplesForIndustry('business', 'resume');
        
        // Convert templates to samples format for existing SampleCard component
        const convertedSamples = templates.map(template => 
          TemplateClient.templateToSample(template)
        );
        
        setSamples(convertedSamples);
      } catch (err) {
        console.error('Error loading business samples:', err);
        setError('Failed to load business samples');
        
        // Fallback to static data if needed
        setSamples([
          {
            id: 1,
            title: 'Marketing Project Coordinator',
            tag: 'PRO',
resumeContent: `
              <div class="resume-content-wrapper" style="padding: 1.5cm; font-family: Merriweather, serif; font-size: 9pt; transform: scale(0.4); transform-origin: left top;">
                <h2 style="font-size: 1.65em; font-weight: bold; margin-bottom: 0.5em; text-align: center;">Sarah Johnson</h2>
                <p style="font-size: 0.75em; text-align: center; margin-bottom: 1em; opacity: 0.7;">New York, NY | (555) 123-4567 | sarah.johnson@email.com</p>
                <hr style="margin: 1em 0; opacity: 0.3;">
                <h3 style="font-size: 1.15em; font-weight: 600; text-transform: uppercase; margin-bottom: 0.5em;">Summary</h3>
                <p style="font-size: 0.85em; line-height: 1.5;">Results-driven Marketing Project Coordinator with 4+ years of experience managing cross-functional teams and delivering high-impact campaigns. Proven track record of increasing brand awareness and generating qualified leads through strategic digital marketing initiatives.</p>
                <h3 style="font-size: 1.15em; font-weight: 600; text-transform: uppercase; margin-top: 1.5em; margin-bottom: 0.5em;">Experience</h3>
                <h4 style="font-size: 1em; font-weight: 600; margin-bottom: 0.25em;">Marketing Project Coordinator | TechCorp Inc.</h4>
                <p style="font-size: 0.85em; font-weight: 400; margin-bottom: 0.5em; opacity: 0.7;">June 2021 - Present | New York, NY</p>
                <ul style="list-style: disc; margin-left: 1.5em; font-size: 0.85em; line-height: 1.6;">
                  <li>Managed creation of new websites for global product releases to increase awareness and sales by 35%</li>
                  <li>Led a team of 5 to produce digital content generating over 1,000 new sales qualified leads quarterly</li>
                  <li>Coordinated cross-departmental collaboration between marketing, sales, and product teams</li>
                </ul>
              </div>
            `,
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadBusinessSamples();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center px-0 pt-16 lg:pt-0 lg:px-16 bg-background text-foreground">
        <div className="relative flex w-[100vw] flex-col gap-4 md:gap-6 lg:min-h-[calc(100dvh_-_16px)] lg:max-w-[824px] lg:px-6 xl1:max-w-[968px] xl:max-w-[1248px] xl:px-8">
          <main className="w-full sm:h-full lg:h-auto">
            <div className="mt-6 flex flex-row items-center justify-between self-stretch">
              <div className="text-3xl font-semibold leading-9 text-foreground">Search Sample Library</div>
            </div>
            <div className="mt-6 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading business samples...</span>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error && samples.length === 0) {
    return (
      <div className="flex justify-center px-0 pt-16 lg:pt-0 lg:px-16 bg-background text-foreground">
        <div className="relative flex w-[100vw] flex-col gap-4 md:gap-6 lg:min-h-[calc(100dvh_-_16px)] lg:max-w-[824px] lg:px-6 xl1:max-w-[968px] xl:max-w-[1248px] xl:px-8">
          <main className="w-full sm:h-full lg:h-auto">
            <div className="mt-6 flex flex-row items-center justify-between self-stretch">
              <div className="text-3xl font-semibold leading-9 text-foreground">Search Sample Library</div>
            </div>
            <div className="mt-6 text-center text-red-500">
              {error}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center px-0 pt-16 lg:pt-0 lg:px-16 bg-background text-foreground">
      <div
        className="relative flex w-[100vw] flex-col gap-4 md:gap-6 lg:min-h-[calc(100dvh_-_16px)] lg:max-w-[824px] lg:px-6 xl1:max-w-[968px] xl:max-w-[1248px] xl:px-8"
        id="layout_full_screen"
      >
        <main className="w-full sm:h-full lg:h-auto">
          {/* Page Header */}
          <div className="mt-6 flex flex-row items-center justify-between self-stretch">
            <div className="text-3xl font-semibold leading-9 text-foreground">Search Sample Library</div>
          </div>

          {/* Search and Filter Section */}
          <div className="mb-6 flex w-full flex-col items-center gap-6 self-stretch pt-6">
            {/* Search Form */}
            <form className="relative flex w-[100%] flex-row items-center justify-start self-stretch">
              <div className="flex w-full flex-col gap-1">
                <div className="w-[100%] h-10 text-base sm:h-12 flex w-full flex-row items-center self-stretch border-2 rounded group-[.company-found]:rounded-b-none transition-all duration-200 group-[.company-found]:border-purple-200 border-border px-3 py-1 bg-background gap-1">
                  <i className="fad fa-magnifying-glass !flex h-6 !w-6 justify-center items-center text-muted-foreground" aria-hidden="true"></i>
                  <input
                    autoComplete="off"
                    className="bg-background text-foreground h-6 w-full !border-0 px-1 text-base font-semibold leading-6 placeholder:text-muted-foreground text-ellipsis focus:outline-none focus:ring-0"
                    type="text"
                    name=""
                    placeholder="Search resume and cover letter samples by role or skill"
                    accept=""
                    defaultValue=""
                  />
                </div>
              </div>
            </form>

            {/* Mobile Category Dropdown */}
            <div className="block w-full sm:hidden">
              <div className="w-full">
                <div className="relative">
                  <select
                    className="h-10 sm:h-12 pl-4 text-base leading-6 pr-4 py-1 rounded w-full ellipsis cursor-pointer font-semibold text-foreground bg-background border-2 border-border border-solid"
                    style={{ fontWeight: 600 }}
                    defaultValue="business"
                  >
                    <option value="pro">Pro</option>
                    <option value="business">Business</option>
                    <option value="programming">Programming</option>
                    <option value="engineering">Engineering</option>
                    <option value="marketing">Marketing</option>
                    <option value="design">Design</option>
                    <option value="student">Student</option>
                    <option value="medical">Medical</option>
                    <option value="finance">Finance</option>
                    <option value="education">Education</option>
                    <option value="legal">Legal</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Desktop Category Tabs */}
            <div className="hidden w-full sm:flex">
              <nav className="flex content-center gap-2 self-stretch flex-wrap min-h-[32px]">
                <a id="unsafe-nav-0" aria-label="Pro" href="/dashboard/samples/pro">
                  <div
                    className="rounded-md bg-secondary hover:bg-secondary/80 focus:bg-secondary/90 flex items-center h-6 px-2 text-xs cursor-pointer text-secondary-foreground flex relative h-6 text-xs font-semibold leading-4 font-sans-pro uppercase py-0 px-2 transition-all duration-200 ease-in-out whitespace-nowrap items-center rounded-md tracking-[.12px]"
                    role="button"
                    tabIndex={0}
                    aria-disabled={false}
                  >
                    <div className="flex items-center justify-center gap-x-2">
                      <span className="uppercase text-xs font-semibold text-center whitespace-nowrap overflow-hidden text-ellipsis w-full">
                        Pro
                      </span>
                    </div>
                  </div>
                </a>
                <a id="unsafe-nav-1" aria-label="Business" href="/dashboard/samples/business">
                  <div
                    className="rounded-md bg-primary hover:bg-primary/90 focus:bg-primary/95 flex items-center h-6 px-2 text-xs cursor-pointer text-primary-foreground flex relative h-6 text-xs font-semibold leading-4 font-sans-pro uppercase py-0 px-2 transition-all duration-200 ease-in-out whitespace-nowrap items-center rounded-md tracking-[.12px]"
                    role="button"
                    tabIndex={0}
                    aria-disabled={false}
                  >
                    <div className="flex items-center justify-center gap-x-2">
                      <span className="uppercase text-xs font-semibold text-center whitespace-nowrap overflow-hidden text-ellipsis w-full">
                        Business
                      </span>
                    </div>
                  </div>
                </a>
                {/* Remaining nav items with consistent theming */}
                {[
                  { label: 'Programming', href: '/dashboard/samples/programming' },
                  { label: 'Engineering', href: '/dashboard/samples/engineering' },
                  { label: 'Marketing', href: '/dashboard/samples/marketing' },
                  { label: 'Design', href: '/dashboard/samples/design' },
                  { label: 'Student', href: '/dashboard/samples/student' },
                  { label: 'Medical', href: '/dashboard/samples/medical' },
                  { label: 'Finance', href: '/dashboard/samples/finance' },
                  { label: 'Education', href: '/dashboard/samples/education' },
                  { label: 'Legal', href: '/dashboard/samples/legal' },
                  { label: 'Other', href: '/dashboard/samples/other' },
                ].map((item, index) => (
                  <a key={index} id={`unsafe-nav-${index + 2}`} aria-label={item.label} href={item.href}>
                    <div
                      className="rounded-md bg-secondary hover:bg-secondary/80 focus:bg-secondary/90 flex items-center h-6 px-2 text-xs cursor-pointer text-secondary-foreground flex relative h-6 text-xs font-semibold leading-4 font-sans-pro uppercase py-0 px-2 transition-all duration-200 ease-in-out whitespace-nowrap items-center rounded-md tracking-[.12px]"
                      role="button"
                      tabIndex={0}
                      aria-disabled={false}
                    >
                      <div className="flex items-center justify-center gap-x-2">
                        <span className="uppercase text-xs font-semibold text-center whitespace-nowrap overflow-hidden text-ellipsis w-full">
                          {item.label}
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </nav>
            </div>
          </div>

          {/* Samples Grid */}
          <div className="flex w-full flex-row flex-wrap gap-4 md:gap-6">
            <style dangerouslySetInnerHTML={{
              __html: `
                .resume-content-wrapper {
                  background-color: hsl(var(--background)) !important;
                  color: hsl(var(--foreground)) !important;
                }
                .resume-content-wrapper h2,
                .resume-content-wrapper h3,
                .resume-content-wrapper h4 {
                  color: hsl(var(--foreground)) !important;
                }
                .resume-content-wrapper p:nth-of-type(1),
                .resume-content-wrapper p:has(~ ul) + p {
                  color: hsl(var(--muted-foreground)) !important;
                }
                .resume-content-wrapper hr {
                  border-top: 1px solid hsl(var(--border)) !important;
                  border-bottom: none !important;
                  border-left: none !important;
                  border-right: none !important;
                }
                .resume-content-wrapper ul,
                .resume-content-wrapper li {
                  color: hsl(var(--foreground)) !important;
                }
              `
            }} />
            {samples.map((sample: Sample) => (
              <SampleCard key={sample.id} sample={sample} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default BusinessSamplesPage;