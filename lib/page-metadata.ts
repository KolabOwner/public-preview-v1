import { Metadata } from 'next';

const baseUrl = 'https://www.rezum-ai.com';
const defaultImage = `${baseUrl}/og-image.png`;

// Authentication Pages Metadata
export const authMetadata = {
  signIn: {
    title: 'Sign In | Rezum AI - Access Your Resume Builder Account',
    description: 'Sign in to Rezum AI to access your saved resumes, cover letters, and AI-powered career tools. Secure login with email or social accounts.',
    keywords: 'sign in, login, resume builder account, Rezum AI login',
    robots: 'index, follow',
  } as Metadata,
  
  signUp: {
    title: 'Sign Up Free | Rezum AI - Start Building Your Professional Resume',
    description: 'Create your free Rezum AI account. Get instant access to AI-powered resume builder, ATS optimization tools, and professional templates.',
    keywords: 'sign up, register, free resume builder, create account, Rezum AI',
    robots: 'index, follow',
  } as Metadata,
  
  forgotPassword: {
    title: 'Reset Password | Rezum AI Account Recovery',
    description: 'Reset your Rezum AI account password. Enter your email to receive password reset instructions.',
    keywords: 'forgot password, reset password, account recovery, Rezum AI',
    robots: 'noindex, follow',
  } as Metadata,
  
  verifyEmail: {
    title: 'Verify Your Email | Rezum AI',
    description: 'Please verify your email address to activate your Rezum AI account and start building professional resumes.',
    robots: 'noindex, nofollow',
  } as Metadata,
};

// Marketing Pages Metadata
export const marketingMetadata = {
  pricing: {
    title: 'Pricing Plans | Rezum AI - Affordable Resume Builder Pricing',
    description: 'Choose the perfect Rezum AI plan for your career needs. Free tier available. Professional plans with unlimited resumes, AI credits, and premium templates.',
    keywords: 'resume builder pricing, Rezum AI plans, subscription, free resume builder, premium features',
    openGraph: {
      title: 'Rezum AI Pricing - Start Free, Upgrade Anytime',
      description: 'Transparent pricing for professional resume building. Free tier included.',
      url: `${baseUrl}/pricing`,
      siteName: 'Rezum AI',
      images: [{ url: defaultImage }],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Rezum AI Pricing - Affordable Resume Builder Plans',
      description: 'Start with our free plan or upgrade for unlimited AI-powered features.',
      images: [defaultImage],
    },
    alternates: {
      canonical: `${baseUrl}/pricing`,
    },
  } as Metadata,
  
  about: {
    title: 'About Us | Rezum AI - AI-Powered Career Success Platform',
    description: 'Learn about Rezum AI\'s mission to revolutionize job searching with AI-powered resume builders, ATS optimization, and career tools. Meet our team and story.',
    keywords: 'about Rezum AI, company, mission, team, AI resume builder story',
    openGraph: {
      title: 'About Rezum AI - Empowering Career Success with AI',
      description: 'Our mission is to help job seekers create winning resumes with AI technology.',
      url: `${baseUrl}/about`,
      siteName: 'Rezum AI',
      images: [{ url: defaultImage }],
      locale: 'en_US',
      type: 'website',
    },
    alternates: {
      canonical: `${baseUrl}/about`,
    },
  } as Metadata,
  
  contact: {
    title: 'Contact Us | Rezum AI - Get Support & Help',
    description: 'Contact Rezum AI support team for help with resume building, account issues, or general inquiries. We\'re here to help you succeed.',
    keywords: 'contact Rezum AI, support, help, customer service, get in touch',
    openGraph: {
      title: 'Contact Rezum AI - We\'re Here to Help',
      description: 'Get support for your resume building needs. Our team is ready to assist.',
      url: `${baseUrl}/contact`,
      siteName: 'Rezum AI',
      images: [{ url: defaultImage }],
      locale: 'en_US',
      type: 'website',
    },
    alternates: {
      canonical: `${baseUrl}/contact`,
    },
  } as Metadata,
  
  blog: {
    title: 'Career Blog | Rezum AI - Resume Tips, Job Search Advice & Career Guides',
    description: 'Expert career advice, resume writing tips, interview preparation guides, and job search strategies. Stay updated with the latest career trends.',
    keywords: 'career blog, resume tips, job search advice, interview tips, career guides, professional development',
    openGraph: {
      title: 'Rezum AI Blog - Career Success Tips & Guides',
      description: 'Expert advice on resumes, job searching, and career development.',
      url: `${baseUrl}/blog`,
      siteName: 'Rezum AI',
      images: [{ url: defaultImage }],
      locale: 'en_US',
      type: 'website',
    },
    alternates: {
      canonical: `${baseUrl}/blog`,
    },
  } as Metadata,
  
  legal: {
    title: 'Legal Terms & Privacy Policy | Rezum AI',
    description: 'Read Rezum AI\'s terms of service, privacy policy, and legal information. Learn how we protect your data and your rights as a user.',
    keywords: 'terms of service, privacy policy, legal, data protection, user rights',
    robots: 'index, follow',
    alternates: {
      canonical: `${baseUrl}/legal`,
    },
  } as Metadata,
  
  editorialProcess: {
    title: 'Editorial Process | Rezum AI - Quality & Accuracy Standards',
    description: 'Learn about Rezum AI\'s editorial process, quality standards, and how we ensure accurate, professional resume content and career advice.',
    keywords: 'editorial process, quality standards, content accuracy, professional standards',
    alternates: {
      canonical: `${baseUrl}/editorial-process`,
    },
  } as Metadata,
};

// Dashboard Pages Metadata (No-Index for Privacy)
export const dashboardMetadata = {
  base: {
    robots: 'noindex, nofollow',
  } as Metadata,
  
  resumes: {
    title: 'My Resumes | Rezum AI Dashboard',
    description: 'Manage your resumes in Rezum AI dashboard',
    robots: 'noindex, nofollow',
  } as Metadata,
  
  coverLetters: {
    title: 'My Cover Letters | Rezum AI Dashboard',
    description: 'Manage your cover letters in Rezum AI dashboard',
    robots: 'noindex, nofollow',
  } as Metadata,
  
  account: {
    title: 'Account Settings | Rezum AI Dashboard',
    description: 'Manage your Rezum AI account settings and preferences',
    robots: 'noindex, nofollow',
  } as Metadata,
  
  aiInterview: {
    title: 'AI Interview Prep | Rezum AI Dashboard',
    description: 'Practice interviews with AI-powered mock interview tool',
    robots: 'noindex, nofollow',
  } as Metadata,
  
  review: {
    title: 'Resume Review | Rezum AI Dashboard',
    description: 'Get AI-powered feedback on your resume',
    robots: 'noindex, nofollow',
  } as Metadata,
};

// Sample/Industry Pages Metadata (Public for SEO)
export function generateIndustryMetadata(industry: string): Metadata {
  const industryNames: Record<string, string> = {
    business: 'Business & Management',
    programming: 'Programming & Software Development',
    design: 'Design & Creative',
    education: 'Education & Teaching',
    engineering: 'Engineering',
    finance: 'Finance & Banking',
    legal: 'Legal & Law',
    marketing: 'Marketing & Advertising',
    medical: 'Medical & Healthcare',
    student: 'Student & Entry Level',
    other: 'Other Industries',
  };
  
  const name = industryNames[industry] || industry;
  
  return {
    title: `${name} Resume Examples & Templates | Rezum AI`,
    description: `Professional ${name.toLowerCase()} resume examples and templates. Get inspired by real resumes that got people hired. ATS-optimized formats.`,
    keywords: `${name.toLowerCase()} resume, ${name.toLowerCase()} CV, ${industry} resume examples, ${industry} resume template, professional resume`,
    openGraph: {
      title: `${name} Resume Examples - Get Hired Faster`,
      description: `Browse professional ${name.toLowerCase()} resume examples and templates. ATS-optimized and proven to work.`,
      url: `${baseUrl}/dashboard/samples/${industry}`,
      siteName: 'Rezum AI',
      images: [{ url: defaultImage }],
      locale: 'en_US',
      type: 'website',
    },
    alternates: {
      canonical: `${baseUrl}/dashboard/samples/${industry}`,
    },
  };
}

// Dynamic Resume Editor Metadata
export function generateResumeEditorMetadata(
  resumeId: string,
  resumeTitle?: string,
  section?: string
): Metadata {
  const sectionTitles: Record<string, string> = {
    contact: 'Contact Information',
    experience: 'Work Experience',
    education: 'Education',
    skills: 'Skills',
    projects: 'Projects',
    involvement: 'Activities & Involvement',
    coursework: 'Coursework',
    certifications: 'Certifications',
    summary: 'Professional Summary',
    'cover-letter': 'Cover Letter',
    preview: 'Preview',
  };
  
  const sectionName = section ? sectionTitles[section] || section : 'Overview';
  const title = resumeTitle || 'Resume';
  
  return {
    title: `Edit ${title} - ${sectionName} | Rezum AI`,
    description: `Editing ${sectionName} section of your resume in Rezum AI`,
    robots: 'noindex, nofollow',
  };
}

// AI Tool Pages Enhanced Metadata
export const aiToolsMetadata = {
  resumeBuilder: {
    title: 'AI Resume Builder - Create ATS-Optimized Resumes in Minutes | Rezum AI',
    description: 'Build professional resumes with AI assistance. Get personalized suggestions, ATS optimization, and instant formatting. Start free today.',
    keywords: 'AI resume builder, ATS resume, resume generator, professional resume builder, free resume maker, AI-powered resume',
    openGraph: {
      title: 'AI Resume Builder - Land Your Dream Job with Rezum AI',
      description: 'Create ATS-optimized resumes in minutes with AI. Professional templates and personalized content suggestions.',
      url: `${baseUrl}/ai-resume-builder`,
      siteName: 'Rezum AI',
      images: [{ url: `${baseUrl}/images/ai-resume-builder-og.png` }],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'AI Resume Builder by Rezum AI',
      description: 'Create winning resumes with AI in minutes. ATS-optimized and professional.',
      images: [`${baseUrl}/images/ai-resume-builder-og.png`],
    },
    alternates: {
      canonical: `${baseUrl}/ai-resume-builder`,
    },
  } as Metadata,
  
  coverLetterBuilder: {
    title: 'AI Cover Letter Generator - Personalized Cover Letters in Seconds | Rezum AI',
    description: 'Generate tailored cover letters with AI. Match job descriptions, highlight relevant skills, and create compelling narratives instantly.',
    keywords: 'AI cover letter generator, cover letter builder, personalized cover letter, job application letter, professional cover letter',
    openGraph: {
      title: 'AI Cover Letter Generator - Stand Out from the Competition',
      description: 'Create personalized, compelling cover letters with AI that match job requirements perfectly.',
      url: `${baseUrl}/ai-cover-letter-builder`,
      siteName: 'Rezum AI',
      images: [{ url: `${baseUrl}/images/ai-cover-letter-og.png` }],
      locale: 'en_US',
      type: 'website',
    },
    alternates: {
      canonical: `${baseUrl}/ai-cover-letter-builder`,
    },
  } as Metadata,
  
  keywordScanner: {
    title: 'ATS Keyword Scanner - Optimize Your Resume for Job Applications | Rezum AI',
    description: 'Scan your resume against job descriptions. Identify missing keywords, improve ATS compatibility, and increase interview chances.',
    keywords: 'ATS keyword scanner, resume keyword optimizer, job description matcher, ATS checker, resume scanner',
    openGraph: {
      title: 'ATS Keyword Scanner - Beat the ATS System',
      description: 'Optimize your resume with the right keywords. Match job descriptions and pass ATS filters.',
      url: `${baseUrl}/keyword-scanner`,
      siteName: 'Rezum AI',
      images: [{ url: `${baseUrl}/images/keyword-scanner-og.png` }],
      locale: 'en_US',
      type: 'website',
    },
    alternates: {
      canonical: `${baseUrl}/keyword-scanner`,
    },
  } as Metadata,
  
  resumeChecker: {
    title: 'Free Resume Checker - ATS Compatibility & Score Analysis | Rezum AI',
    description: 'Check your resume for ATS compatibility. Get instant feedback on formatting, keywords, and content. Improve your resume score free.',
    keywords: 'resume checker, ATS checker, resume score, resume analysis, free resume review, ATS compatibility',
    openGraph: {
      title: 'Free Resume Checker - Get Your ATS Score',
      description: 'Instantly check your resume for ATS compatibility and get improvement suggestions.',
      url: `${baseUrl}/resume-checker`,
      siteName: 'Rezum AI',
      images: [{ url: `${baseUrl}/images/resume-checker-og.png` }],
      locale: 'en_US',
      type: 'website',
    },
    alternates: {
      canonical: `${baseUrl}/resume-checker`,
    },
  } as Metadata,
  
  bulletPointGenerator: {
    title: 'Resume Bullet Point Generator - Create Impactful Achievements | Rezum AI',
    description: 'Generate powerful resume bullet points with AI. Transform job duties into quantified achievements that impress recruiters.',
    keywords: 'bullet point generator, resume achievements, action verbs, resume bullet points, accomplishment statements',
    openGraph: {
      title: 'Resume Bullet Point Generator - Write Like a Pro',
      description: 'Create impactful, quantified bullet points that showcase your achievements effectively.',
      url: `${baseUrl}/resume-bullet-point-generator`,
      siteName: 'Rezum AI',
      images: [{ url: `${baseUrl}/images/bullet-point-generator-og.png` }],
      locale: 'en_US',
      type: 'website',
    },
    alternates: {
      canonical: `${baseUrl}/resume-bullet-point-generator`,
    },
  } as Metadata,
  
  summaryGenerator: {
    title: 'AI Resume Summary Generator - Professional Summary in Seconds | Rezum AI',
    description: 'Generate compelling professional summaries with AI. Tailored to your experience and target role. Stand out from the first line.',
    keywords: 'resume summary generator, professional summary, resume objective, career summary, AI summary writer',
    openGraph: {
      title: 'AI Resume Summary Generator - Make a Strong First Impression',
      description: 'Create powerful professional summaries that capture recruiter attention instantly.',
      url: `${baseUrl}/ai-resume-summary-generator`,
      siteName: 'Rezum AI',
      images: [{ url: `${baseUrl}/images/summary-generator-og.png` }],
      locale: 'en_US',
      type: 'website',
    },
    alternates: {
      canonical: `${baseUrl}/ai-resume-summary-generator`,
    },
  } as Metadata,
};

// Template Pages Metadata
export const templateMetadata = {
  resumeTemplates: {
    title: 'Professional Resume Templates - ATS-Friendly Designs | Rezum AI',
    description: 'Choose from 50+ professional resume templates. ATS-optimized, customizable, and designed to get you hired. Download in multiple formats.',
    keywords: 'resume templates, professional resume, CV templates, ATS-friendly templates, free resume templates, modern resume designs',
    openGraph: {
      title: 'Professional Resume Templates - Stand Out & Get Hired',
      description: '50+ ATS-optimized resume templates. Professional, modern, and customizable designs.',
      url: `${baseUrl}/resume-templates`,
      siteName: 'Rezum AI',
      images: [{ url: `${baseUrl}/images/resume-templates-og.png` }],
      locale: 'en_US',
      type: 'website',
    },
    alternates: {
      canonical: `${baseUrl}/resume-templates`,
    },
  } as Metadata,
  
  coverLetterTemplates: {
    title: 'Cover Letter Templates - Professional & Customizable | Rezum AI',
    description: 'Professional cover letter templates for every industry. Customizable, ATS-friendly, and designed to complement your resume perfectly.',
    keywords: 'cover letter templates, professional cover letter, job application letter, cover letter examples, free templates',
    openGraph: {
      title: 'Professional Cover Letter Templates - Get Noticed',
      description: 'Customizable cover letter templates that complement your resume and impress recruiters.',
      url: `${baseUrl}/cover-letter-templates`,
      siteName: 'Rezum AI',
      images: [{ url: `${baseUrl}/images/cover-letter-templates-og.png` }],
      locale: 'en_US',
      type: 'website',
    },
    alternates: {
      canonical: `${baseUrl}/cover-letter-templates`,
    },
  } as Metadata,
  
  resumeExamples: {
    title: 'Resume Examples by Industry - Real Resumes That Work | Rezum AI',
    description: 'Browse 500+ real resume examples by industry and job title. See what got others hired and create your winning resume.',
    keywords: 'resume examples, resume samples, CV examples, real resumes, industry-specific resumes, job resume examples',
    openGraph: {
      title: 'Resume Examples - Real Resumes That Got People Hired',
      description: '500+ resume examples across all industries. Learn from successful job seekers.',
      url: `${baseUrl}/resume-examples`,
      siteName: 'Rezum AI',
      images: [{ url: `${baseUrl}/images/resume-examples-og.png` }],
      locale: 'en_US',
      type: 'website',
    },
    alternates: {
      canonical: `${baseUrl}/resume-examples`,
    },
  } as Metadata,
};