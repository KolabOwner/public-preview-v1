// scripts/generate-sample-pages.ts
// Script to generate all sample pages for different industries

import * as fs from 'fs';
import * as path from 'path';

const industries = [
  { name: 'technology', displayName: 'Technology', placeholder: 'Search technology resume and cover letter samples' },
  { name: 'programming', displayName: 'Programming', placeholder: 'Search programming resume and cover letter samples' },
  { name: 'healthcare', displayName: 'Healthcare', placeholder: 'Search healthcare resume and cover letter samples' },
  { name: 'finance', displayName: 'Finance', placeholder: 'Search finance resume and cover letter samples' },
  { name: 'education', displayName: 'Education', placeholder: 'Search education resume and cover letter samples' },
  { name: 'engineering', displayName: 'Engineering', placeholder: 'Search engineering resume and cover letter samples' },
  { name: 'legal', displayName: 'Legal', placeholder: 'Search legal resume and cover letter samples' },
  { name: 'design', displayName: 'Design', placeholder: 'Search design resume and cover letter samples' },
  { name: 'creative', displayName: 'Creative', placeholder: 'Search creative resume and cover letter samples' },
  { name: 'hospitality', displayName: 'Hospitality', placeholder: 'Search hospitality resume and cover letter samples' },
  { name: 'retail', displayName: 'Retail', placeholder: 'Search retail resume and cover letter samples' },
  { name: 'manufacturing', displayName: 'Manufacturing', placeholder: 'Search manufacturing resume and cover letter samples' },
  { name: 'nonprofit', displayName: 'Nonprofit', placeholder: 'Search nonprofit resume and cover letter samples' },
  { name: 'government', displayName: 'Government', placeholder: 'Search government resume and cover letter samples' },
  { name: 'other', displayName: 'Other', placeholder: 'Search resume and cover letter samples' }
];

const fallbackSamples = {
  technology: {
    title: 'Software Engineer',
    name: 'Sarah Tech',
    location: 'San Francisco, CA',
    summary: 'Innovative Software Engineer with 4+ years of experience developing scalable web applications. Expert in React, Node.js, and cloud technologies with a passion for clean code and user experience.',
    experience: 'Software Engineer | Tech Innovations Corp',
    achievements: [
      'Built microservices architecture serving 1M+ daily active users',
      'Reduced application load time by 60% through optimization techniques',
      'Led development of real-time collaboration features used by 50K+ users'
    ]
  },
  programming: {
    title: 'Full Stack Developer',
    name: 'Alex Code',
    location: 'Austin, TX',
    summary: 'Versatile Full Stack Developer with expertise in modern JavaScript frameworks and backend technologies. Passionate about creating efficient, scalable solutions.',
    experience: 'Full Stack Developer | Development Partners LLC',
    achievements: [
      'Developed and deployed 15+ web applications using React and Node.js',
      'Implemented CI/CD pipelines reducing deployment time by 80%',
      'Mentored 3 junior developers and improved team code quality standards'
    ]
  },
  healthcare: {
    title: 'Registered Nurse',
    name: 'Maria Care',
    location: 'Chicago, IL',
    summary: 'Compassionate Registered Nurse with 5+ years of experience in critical care settings. Dedicated to providing exceptional patient care and supporting interdisciplinary healthcare teams.',
    experience: 'Registered Nurse | Regional Medical Center',
    achievements: [
      'Maintained 98% patient satisfaction scores in ICU department',
      'Reduced medication errors by 25% through improved protocols',
      'Trained 10+ new nursing staff on advanced cardiac monitoring'
    ]
  },
  finance: {
    title: 'Financial Analyst',
    name: 'Robert Finance',
    location: 'New York, NY',
    summary: 'Detail-oriented Financial Analyst with 3+ years of experience in investment analysis and financial modeling. Strong analytical skills with expertise in Excel and financial software.',
    experience: 'Financial Analyst | Investment Solutions Inc.',
    achievements: [
      'Analyzed investment portfolios worth $50M+ with 15% annual returns',
      'Created financial models reducing forecasting errors by 30%',
      'Presented quarterly reports to executive leadership and board members'
    ]
  },
  education: {
    title: 'High School Teacher',
    name: 'Jennifer Teach',
    location: 'Denver, CO',
    summary: 'Passionate High School Teacher with 6+ years of experience inspiring students in mathematics. Committed to innovative teaching methods and student success.',
    experience: 'High School Math Teacher | Academic Excellence Institute',
    achievements: [
      'Improved student test scores by 35% through personalized learning plans',
      'Developed curriculum adopted by 5 schools in the district',
      'Mentored struggling students with 90% graduation rate improvement'
    ]
  },
  engineering: {
    title: 'Mechanical Engineer',
    name: 'David Engineer',
    location: 'Detroit, MI',
    summary: 'Innovative Mechanical Engineer with 7+ years of experience in automotive design and manufacturing. Expert in CAD software and project management.',
    experience: 'Senior Mechanical Engineer | Engineering Solutions Group',
    achievements: [
      'Designed automotive components reducing manufacturing costs by 20%',
      'Led cross-functional teams on 12+ successful product launches',
      'Improved product reliability by 40% through design optimization'
    ]
  },
  legal: {
    title: 'Corporate Counsel',
    name: 'Lisa Legal',
    location: 'Washington, DC',
    summary: 'Experienced Corporate Counsel with 8+ years of experience in contract law and compliance. Strong negotiation skills and expertise in regulatory matters.',
    experience: 'Senior Corporate Counsel | Legal Associates Group',
    achievements: [
      'Negotiated contracts worth $100M+ with favorable terms',
      'Reduced legal disputes by 45% through proactive compliance programs',
      'Led due diligence for 5 major corporate acquisitions'
    ]
  },
  design: {
    title: 'UX Designer',
    name: 'Creative Sam',
    location: 'Los Angeles, CA',
    summary: 'Creative UX Designer with 4+ years of experience creating user-centered digital experiences. Expert in design thinking and prototyping tools.',
    experience: 'Senior UX Designer | Creative Design Studio',
    achievements: [
      'Increased user engagement by 65% through redesigned mobile app',
      'Led design research with 1000+ user interviews and usability tests',
      'Created design system adopted by 8 product teams across the company'
    ]
  },
  creative: {
    title: 'Content Writer',
    name: 'Emma Creative',
    location: 'Portland, OR',
    summary: 'Talented Content Writer with 3+ years of experience creating engaging content across multiple channels. Skilled in SEO and brand storytelling.',
    experience: 'Content Writer | Creative Solutions Agency',
    achievements: [
      'Increased website organic traffic by 200% through SEO-optimized content',
      'Created content strategy generating 5000+ social media followers',
      'Wrote copy for campaigns that increased conversion rates by 35%'
    ]
  },
  hospitality: {
    title: 'Hotel Manager',
    name: 'Michael Host',
    location: 'Las Vegas, NV',
    summary: 'Experienced Hotel Manager with 6+ years of experience in luxury hospitality. Expert in guest services and team leadership.',
    experience: 'Hotel Manager | Premier Hospitality Group',
    achievements: [
      'Maintained 95% guest satisfaction scores across 200+ room property',
      'Increased hotel revenue by 25% through improved operational efficiency',
      'Led team of 50+ staff members with 98% employee retention rate'
    ]
  },
  retail: {
    title: 'Store Manager',
    name: 'Susan Retail',
    location: 'Atlanta, GA',
    summary: 'Dynamic Store Manager with 5+ years of experience in retail operations. Strong leadership skills and expertise in sales optimization.',
    experience: 'Store Manager | Retail Solutions Group',
    achievements: [
      'Exceeded sales targets by 30% for 8 consecutive quarters',
      'Reduced inventory shrinkage by 40% through improved loss prevention',
      'Trained and developed 15+ team members with 85% promotion rate'
    ]
  },
  manufacturing: {
    title: 'Production Manager',
    name: 'Tom Factory',
    location: 'Cleveland, OH',
    summary: 'Results-driven Production Manager with 8+ years of experience in manufacturing operations. Expert in lean manufacturing and quality control.',
    experience: 'Production Manager | Manufacturing Solutions Group',
    achievements: [
      'Improved production efficiency by 45% through lean manufacturing principles',
      'Reduced defect rates by 60% through enhanced quality control processes',
      'Led facility safety initiatives achieving zero workplace accidents for 2 years'
    ]
  },
  nonprofit: {
    title: 'Program Coordinator',
    name: 'Grace Impact',
    location: 'Seattle, WA',
    summary: 'Dedicated Program Coordinator with 4+ years of experience in nonprofit program management. Passionate about community development and social impact.',
    experience: 'Program Coordinator | Community Impact Organization',
    achievements: [
      'Managed programs serving 500+ community members annually',
      'Secured $250K+ in grant funding for youth development initiatives',
      'Coordinated volunteer teams of 100+ members for community events'
    ]
  },
  government: {
    title: 'Policy Analyst',
    name: 'John Policy',
    location: 'Washington, DC',
    summary: 'Analytical Policy Analyst with 5+ years of experience in public policy research and analysis. Strong research skills and government experience.',
    experience: 'Policy Analyst | Public Service Agency',
    achievements: [
      'Analyzed policy impacts affecting 1M+ citizens in the district',
      'Authored 15+ policy briefs adopted by city council',
      'Led stakeholder engagement sessions with 200+ community representatives'
    ]
  },
  other: {
    title: 'Customer Success Manager',
    name: 'Rachel Success',
    location: 'Boston, MA',
    summary: 'Customer-focused Success Manager with 4+ years of experience driving client satisfaction and retention. Expert in relationship building and account management.',
    experience: 'Customer Success Manager | Professional Services Group',
    achievements: [
      'Achieved 95% customer retention rate across 100+ client accounts',
      'Increased account expansion revenue by 50% through strategic initiatives',
      'Implemented customer onboarding process reducing time-to-value by 40%'
    ]
  }
};

function generateSamplePage(industry: { name: string; displayName: string; placeholder: string }) {
  const sample = fallbackSamples[industry.name as keyof typeof fallbackSamples];
  
  return `// app/(app)/dashboard/samples/${industry.name}/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import SampleCard from "@/components/features/resume/samples/SampleCard";
import { TemplateClient } from '@/lib/client/services/template-client';

export interface Sample {
  id: number;
  title: string;
  tag: string;
  companyIcon: string;
  resumeContent: string;
}

const ${industry.displayName}SamplesPage: React.FC = () => {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load${industry.displayName}Samples = async () => {
      try {
        setLoading(true);
        const templates = await TemplateClient.getSamplesForIndustry('${industry.name}', 'resume');
        
        // Convert templates to samples format for existing SampleCard component
        const convertedSamples = templates.map(template => 
          TemplateClient.templateToSample(template)
        );
        
        setSamples(convertedSamples);
      } catch (err) {
        console.error('Error loading ${industry.name} samples:', err);
        setError('Failed to load ${industry.name} samples');
        
        // Fallback to static data if needed
        setSamples([
          {
            id: 1,
            title: '${sample.title}',
            tag: 'PRO',
            companyIcon: '',
            resumeContent: \`
              <div class="resume-content-wrapper" style="padding: 1.5cm; font-family: Merriweather, serif; font-size: 9pt; transform: scale(0.4); transform-origin: left top;">
                <h2 style="font-size: 1.65em; font-weight: bold; margin-bottom: 0.5em; text-align: center;">${sample.name}</h2>
                <p style="font-size: 0.75em; text-align: center; margin-bottom: 1em; opacity: 0.7;">${sample.location} | (555) 123-4567 | ${sample.name.toLowerCase().replace(' ', '.')}@email.com</p>
                <hr style="margin: 1em 0; opacity: 0.3;">
                <h3 style="font-size: 1.15em; font-weight: 600; text-transform: uppercase; margin-bottom: 0.5em;">Summary</h3>
                <p style="font-size: 0.85em; line-height: 1.5;">${sample.summary}</p>
                <h3 style="font-size: 1.15em; font-weight: 600; text-transform: uppercase; margin-top: 1.5em; margin-bottom: 0.5em;">Experience</h3>
                <h4 style="font-size: 1em; font-weight: 600; margin-bottom: 0.25em;">${sample.experience}</h4>
                <p style="font-size: 0.85em; font-weight: 400; margin-bottom: 0.5em; opacity: 0.7;">January 2021 - Present | ${sample.location}</p>
                <ul style="list-style: disc; margin-left: 1.5em; font-size: 0.85em; line-height: 1.6;">
                  ${sample.achievements.map(achievement => `<li>${achievement}</li>`).join('\n                  ')}
                </ul>
              </div>
            \`,
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    load${industry.displayName}Samples();
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
              <span className="ml-2">Loading ${industry.name} samples...</span>
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
                    placeholder="${industry.placeholder}"
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
                    defaultValue="${industry.name}"
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
                <a id="unsafe-nav-2" aria-label="${industry.displayName}" href="/dashboard/samples/${industry.name}">
                  <div
                    className="rounded-md bg-primary hover:bg-primary/90 focus:bg-primary/95 flex items-center h-6 px-2 text-xs cursor-pointer text-primary-foreground flex relative h-6 text-xs font-semibold leading-4 font-sans-pro uppercase py-0 px-2 transition-all duration-200 ease-in-out whitespace-nowrap items-center rounded-md tracking-[.12px]"
                    role="button"
                    tabIndex={0}
                    aria-disabled={false}
                  >
                    <div className="flex items-center justify-center gap-x-2">
                      <span className="uppercase text-xs font-semibold text-center whitespace-nowrap overflow-hidden text-ellipsis w-full">
                        ${industry.displayName}
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
                ].filter(item => item.label !== '${industry.displayName}').map((item, index) => (
                  <a key={index} id={\`unsafe-nav-\${index + 3}\`} aria-label={item.label} href={item.href}>
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
              __html: \`
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
              \`
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

export default ${industry.displayName}SamplesPage;`;
}

// Generate all sample pages
async function generateAllPages() {
  const baseDir = path.join(process.cwd(), 'app/(app)/dashboard/samples');
  
  console.log('🚀 Generating sample pages for all industries...\n');
  
  for (const industry of industries) {
    const industryDir = path.join(baseDir, industry.name);
    const pageFile = path.join(industryDir, 'page.tsx');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(industryDir)) {
      fs.mkdirSync(industryDir, { recursive: true });
    }
    
    // Generate and write the page content
    const pageContent = generateSamplePage(industry);
    fs.writeFileSync(pageFile, pageContent);
    
    console.log(`✅ Created ${industry.displayName} samples page: ${pageFile}`);
  }
  
  console.log(`\n🎉 Successfully generated ${industries.length} sample pages!`);
}

// Run the generator
generateAllPages().catch(console.error);