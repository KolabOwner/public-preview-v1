// app/(app)/dashboard/samples/design/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import SampleCard from "@/components/features/resume/samples/SampleCard";
import { TemplateClient } from '@/lib/client/services/template-client';

export interface Sample {
  id: number;
  title: string;
  tag: string;
  resumeContent: string;
}

const DesignSamplesPage: React.FC = () => {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDesignSamples = async () => {
      try {
        setLoading(true);
        const templates = await TemplateClient.getSamplesForIndustry('design', 'resume');
        
        // Convert templates to samples format for existing SampleCard component
        const convertedSamples = templates.map(template => 
          TemplateClient.templateToSample(template)
        );
        
        setSamples(convertedSamples);
      } catch (err) {
        console.error('Error loading design samples:', err);
        setError('Failed to load design samples');
        
        // Fallback to static data if needed
        setSamples([
          {
            id: 1,
            title: 'UX Designer',
            tag: 'PRO',
resumeContent: `
              <div class="resume-content-wrapper" style="padding: 1.5cm; font-family: Merriweather, serif; font-size: 9pt; transform: scale(0.4); transform-origin: left top;">
                <h2 style="font-size: 1.65em; font-weight: bold; margin-bottom: 0.5em; text-align: center;">Creative Sam</h2>
                <p style="font-size: 0.75em; text-align: center; margin-bottom: 1em; opacity: 0.7;">Los Angeles, CA | (555) 123-4567 | creative.sam@email.com</p>
                <hr style="margin: 1em 0; opacity: 0.3;">
                <h3 style="font-size: 1.15em; font-weight: 600; text-transform: uppercase; margin-bottom: 0.5em;">Summary</h3>
                <p style="font-size: 0.85em; line-height: 1.5;">Creative UX Designer with 4+ years of experience creating user-centered digital experiences. Expert in design thinking and prototyping tools.</p>
                <h3 style="font-size: 1.15em; font-weight: 600; text-transform: uppercase; margin-top: 1.5em; margin-bottom: 0.5em;">Experience</h3>
                <h4 style="font-size: 1em; font-weight: 600; margin-bottom: 0.25em;">Senior UX Designer | Creative Design Studio</h4>
                <p style="font-size: 0.85em; font-weight: 400; margin-bottom: 0.5em; opacity: 0.7;">January 2021 - Present | Los Angeles, CA</p>
                <ul style="list-style: disc; margin-left: 1.5em; font-size: 0.85em; line-height: 1.6;">
                  <li>Increased user engagement by 65% through redesigned mobile app</li>
                  <li>Led design research with 1000+ user interviews and usability tests</li>
                  <li>Created design system adopted by 8 product teams across the company</li>
                </ul>
              </div>
            `,
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadDesignSamples();
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
              <span className="ml-2">Loading design samples...</span>
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
                    placeholder="Search design resume and cover letter samples"
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
                    defaultValue="design"
                  >
                    <option value="pro">Pro</option>
                    <option value="business">Business</option>
                    <option value="programming">Programming</option>
                    <option value="engineering">Engineering</option>
                    <option value="marketing">Marketing</option>
                    <option value="technology">Technology</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="finance">Finance</option>
                    <option value="education">Education</option>
                    <option value="legal">Legal</option>
                    <option value="design">Design</option>
                    <option value="creative">Creative</option>
                    <option value="hospitality">Hospitality</option>
                    <option value="retail">Retail</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="nonprofit">Nonprofit</option>
                    <option value="government">Government</option>
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
                    className="rounded-md bg-secondary hover:bg-secondary/80 focus:bg-secondary/90 flex items-center h-6 px-2 text-xs cursor-pointer text-secondary-foreground flex relative h-6 text-xs font-semibold leading-4 font-sans-pro uppercase py-0 px-2 transition-all duration-200 ease-in-out whitespace-nowrap items-center rounded-md tracking-[.12px]"
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
                <a id="unsafe-nav-2" aria-label="Design" href="/dashboard/samples/design">
                  <div
                    className="rounded-md bg-primary hover:bg-primary/90 focus:bg-primary/95 flex items-center h-6 px-2 text-xs cursor-pointer text-primary-foreground flex relative h-6 text-xs font-semibold leading-4 font-sans-pro uppercase py-0 px-2 transition-all duration-200 ease-in-out whitespace-nowrap items-center rounded-md tracking-[.12px]"
                    role="button"
                    tabIndex={0}
                    aria-disabled={false}
                  >
                    <div className="flex items-center justify-center gap-x-2">
                      <span className="uppercase text-xs font-semibold text-center whitespace-nowrap overflow-hidden text-ellipsis w-full">
                        Design
                      </span>
                    </div>
                  </div>
                </a>
                {/* Other navigation items */}
                {[
                  { label: 'Marketing', href: '/dashboard/samples/marketing' },
                  { label: 'Programming', href: '/dashboard/samples/programming' },
                  { label: 'Engineering', href: '/dashboard/samples/engineering' },
                  { label: 'Technology', href: '/dashboard/samples/technology' },
                  { label: 'Healthcare', href: '/dashboard/samples/healthcare' },
                  { label: 'Finance', href: '/dashboard/samples/finance' },
                  { label: 'Education', href: '/dashboard/samples/education' },
                  { label: 'Legal', href: '/dashboard/samples/legal' },
                  { label: 'Design', href: '/dashboard/samples/design' },
                  { label: 'Creative', href: '/dashboard/samples/creative' },
                  { label: 'Other', href: '/dashboard/samples/other' },
                ].filter(item => item.label !== 'Design').map((item, index) => (
                  <a key={index} id={`unsafe-nav-${index + 3}`} aria-label={item.label} href={item.href}>
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

export default DesignSamplesPage;