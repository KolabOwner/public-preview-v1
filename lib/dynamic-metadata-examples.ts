import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata } from './seo-utils';

// Example for product/template pages
export async function generateProductMetadata({ 
  params 
}: { 
  params: { id: string } 
}): Promise<Metadata> {
  // Fetch product data - replace with your actual data fetching
  const product = await fetchProductData(params.id);
  
  return generateSEOMetadata({
    title: product.name,
    description: product.description,
    keywords: product.tags,
    image: product.image,
    url: `https://www.rezum-ai.com/products/${params.id}`,
    type: 'product',
  });
}

// Example for resume template pages
export async function generateResumeTemplateMetadata({ 
  params 
}: { 
  params: { slug: string } 
}): Promise<Metadata> {
  // Fetch template data
  const template = await fetchTemplateData(params.slug);
  
  return generateSEOMetadata({
    title: `${template.name} Resume Template - Professional ATS-Optimized`,
    description: `Download our ${template.name} resume template. ATS-friendly, professionally designed, and customizable. Perfect for ${template.industry} professionals.`,
    keywords: [
      `${template.name} resume template`,
      'ATS resume template',
      `${template.industry} resume`,
      'professional resume template',
      'downloadable resume template',
    ],
    image: template.preview,
    url: `https://www.rezum-ai.com/resume-templates/${params.slug}`,
    type: 'product',
  });
}

// Example for cover letter template pages
export async function generateCoverLetterTemplateMetadata({ 
  params 
}: { 
  params: { slug: string } 
}): Promise<Metadata> {
  const template = await fetchCoverLetterTemplate(params.slug);
  
  return generateSEOMetadata({
    title: `${template.name} Cover Letter Template - Professional & Customizable`,
    description: `Create a compelling cover letter with our ${template.name} template. Industry-specific, ATS-optimized, and professionally written.`,
    keywords: [
      `${template.name} cover letter template`,
      'professional cover letter',
      `${template.industry} cover letter`,
      'cover letter examples',
      'customizable cover letter',
    ],
    image: template.preview,
    url: `https://www.rezum-ai.com/cover-letter-templates/${params.slug}`,
    type: 'product',
  });
}

// Example for industry-specific pages
export async function generateIndustryPageMetadata({ 
  params 
}: { 
  params: { industry: string } 
}): Promise<Metadata> {
  const industryName = params.industry.replace(/-/g, ' ');
  const capitalizedIndustry = industryName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return generateSEOMetadata({
    title: `${capitalizedIndustry} Resume Examples & Templates`,
    description: `Professional ${capitalizedIndustry} resume templates and examples. Get hired faster with industry-specific resumes optimized for ATS systems.`,
    keywords: [
      `${capitalizedIndustry} resume`,
      `${capitalizedIndustry} CV`,
      `${capitalizedIndustry} resume examples`,
      `${capitalizedIndustry} resume template`,
      'industry specific resume',
    ],
    url: `https://www.rezum-ai.com/industries/${params.industry}`,
    type: 'website',
  });
}

// Example for user profile/portfolio pages
export async function generateUserProfileMetadata({ 
  params 
}: { 
  params: { username: string } 
}): Promise<Metadata> {
  const user = await fetchUserProfile(params.username);
  
  return generateSEOMetadata({
    title: `${user.name} - Professional Profile`,
    description: user.bio || `View ${user.name}'s professional profile, resume, and career accomplishments.`,
    keywords: [
      user.name,
      'professional profile',
      user.title,
      ...user.skills.slice(0, 5),
    ],
    image: user.avatar,
    url: `https://www.rezum-ai.com/profile/${params.username}`,
    type: 'profile',
    author: user.name,
  });
}

// Example for job posting pages
export async function generateJobPostingMetadata({ 
  params 
}: { 
  params: { jobId: string } 
}): Promise<Metadata> {
  const job = await fetchJobPosting(params.jobId);
  
  return generateSEOMetadata({
    title: `${job.title} at ${job.company} - Apply Now`,
    description: `${job.company} is hiring a ${job.title}. ${job.summary} Location: ${job.location}. Apply with your Rezum AI optimized resume.`,
    keywords: [
      job.title,
      job.company,
      job.location,
      ...job.skills,
      'job opening',
      'career opportunity',
    ],
    url: `https://www.rezum-ai.com/jobs/${params.jobId}`,
    type: 'article',
    publishedTime: job.postedDate,
  });
}

// Example for FAQ/Help pages
export async function generateHelpArticleMetadata({ 
  params 
}: { 
  params: { slug: string } 
}): Promise<Metadata> {
  const article = await fetchHelpArticle(params.slug);
  
  return generateSEOMetadata({
    title: `${article.title} - Rezum AI Help Center`,
    description: article.summary,
    keywords: [
      ...article.tags,
      'help',
      'support',
      'how to',
      'guide',
      'tutorial',
    ],
    url: `https://www.rezum-ai.com/help/${params.slug}`,
    type: 'article',
    publishedTime: article.createdAt,
    modifiedTime: article.updatedAt,
    author: article.author,
  });
}

// Placeholder functions - replace with actual data fetching
async function fetchProductData(id: string) {
  // Replace with actual data fetching
  return {
    name: 'Product Name',
    description: 'Product Description',
    tags: ['tag1', 'tag2'],
    image: 'https://www.rezum-ai.com/product-image.png',
  };
}

async function fetchTemplateData(slug: string) {
  return {
    name: 'Template Name',
    industry: 'Technology',
    preview: 'https://www.rezum-ai.com/template-preview.png',
  };
}

async function fetchCoverLetterTemplate(slug: string) {
  return {
    name: 'Cover Letter Template',
    industry: 'Business',
    preview: 'https://www.rezum-ai.com/cover-letter-preview.png',
  };
}

async function fetchUserProfile(username: string) {
  return {
    name: 'User Name',
    bio: 'User bio',
    title: 'Software Engineer',
    skills: ['JavaScript', 'React', 'Node.js'],
    avatar: 'https://www.rezum-ai.com/avatar.png',
  };
}

async function fetchJobPosting(jobId: string) {
  return {
    title: 'Job Title',
    company: 'Company Name',
    summary: 'Job summary',
    location: 'San Francisco, CA',
    skills: ['skill1', 'skill2'],
    postedDate: new Date().toISOString(),
  };
}

async function fetchHelpArticle(slug: string) {
  return {
    title: 'Help Article',
    summary: 'Article summary',
    tags: ['tag1', 'tag2'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: 'Support Team',
  };
}