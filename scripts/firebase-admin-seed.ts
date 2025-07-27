// scripts/firebase-admin-seed.ts
// Production-grade template seeding using Firebase Admin SDK

import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Import types
import { 
  ResumeTemplate, 
  CoverLetterTemplate,
  Industry,
  ExperienceLevel,
  Template
} from '../types/template.types';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

// Initialize Firebase Admin SDK
function initializeFirebaseAdmin() {
  if (admin.apps.length === 0) {
    try {
      // Option 1: Using service account key file
      if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
        console.log('🔑 Attempting to load service account from file:', process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
        const serviceAccount = require(resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH));
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
        });
        console.log('✅ Firebase Admin initialized with service account file');
      }
      // Option 2: Using individual environment variables
      else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
        console.log('🔑 Using individual Firebase credentials from environment variables');
        const serviceAccount = {
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        };
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
        });
        console.log('✅ Firebase Admin initialized with individual credentials');
      }
      // Option 3: Using service account key as environment variable
      else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        console.log('🔑 Using Firebase service account key from environment variable');
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
        });
        console.log('✅ Firebase Admin initialized with service account key');
      }
      // Option 4: Using Application Default Credentials (for Cloud environments)
      else if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FIREBASE_CONFIG) {
        console.log('🔑 Using Application Default Credentials');
        admin.initializeApp({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
        });
        console.log('✅ Firebase Admin initialized with default credentials');
      }
      else {
        console.error('❌ Firebase Admin credentials not found!');
        console.error('Please set one of the following:');
        console.error('1. FIREBASE_SERVICE_ACCOUNT_PATH (path to service account JSON file)');
        console.error('2. Individual credentials: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
        console.error('3. FIREBASE_SERVICE_ACCOUNT_KEY (service account JSON as string)');
        console.error('4. GOOGLE_APPLICATION_CREDENTIALS (for Cloud environments)');
        console.error('\nTo get a service account key:');
        console.error('1. Go to Firebase Console > Project Settings > Service Accounts');
        console.error('2. Click "Generate new private key"');
        console.error('3. Save the JSON file and set the path in .env.local');
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Error initializing Firebase Admin:', error);
      console.error('Make sure your service account file exists and is valid JSON');
      process.exit(1);
    }
  }
  
  return admin.firestore();
}

// Initialize Firestore Admin
const db = initializeFirebaseAdmin();
console.log('🔥 Firebase Admin SDK initialized for project:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);

// Industry-specific roles mapping
const INDUSTRY_ROLES: Record<Industry, { role: string; level: ExperienceLevel }[]> = {
  business: [
    { role: 'Business Analyst', level: 'entry' },
    { role: 'Senior Business Analyst', level: 'mid' },
    { role: 'Business Operations Manager', level: 'mid' },
    { role: 'Project Manager', level: 'mid' },
    { role: 'Senior Project Manager', level: 'senior' },
    { role: 'Program Manager', level: 'senior' },
    { role: 'Operations Director', level: 'executive' },
    { role: 'Chief Operating Officer', level: 'executive' },
    { role: 'Business Development Representative', level: 'entry' },
    { role: 'Business Development Manager', level: 'mid' },
    { role: 'Strategic Partnerships Manager', level: 'senior' },
    { role: 'Management Consultant', level: 'mid' },
    { role: 'Senior Management Consultant', level: 'senior' },
    { role: 'Strategy Director', level: 'executive' },
    { role: 'Account Manager', level: 'mid' },
  ],
  marketing: [
    { role: 'Marketing Coordinator', level: 'entry' },
    { role: 'Marketing Specialist', level: 'entry' },
    { role: 'Digital Marketing Specialist', level: 'entry' },
    { role: 'Content Marketing Manager', level: 'mid' },
    { role: 'Social Media Manager', level: 'mid' },
    { role: 'SEO Specialist', level: 'mid' },
    { role: 'Marketing Manager', level: 'mid' },
    { role: 'Senior Marketing Manager', level: 'senior' },
    { role: 'Growth Marketing Manager', level: 'senior' },
    { role: 'Marketing Director', level: 'executive' },
    { role: 'Chief Marketing Officer', level: 'executive' },
    { role: 'Brand Manager', level: 'mid' },
    { role: 'Product Marketing Manager', level: 'mid' },
    { role: 'Email Marketing Specialist', level: 'entry' },
    { role: 'Marketing Analyst', level: 'entry' },
  ],
  technology: [
    { role: 'Software Engineer', level: 'entry' },
    { role: 'Junior Developer', level: 'entry' },
    { role: 'Full Stack Developer', level: 'mid' },
    { role: 'Senior Software Engineer', level: 'senior' },
    { role: 'Lead Software Engineer', level: 'senior' },
    { role: 'Engineering Manager', level: 'senior' },
    { role: 'Technical Lead', level: 'senior' },
    { role: 'Solutions Architect', level: 'senior' },
    { role: 'VP of Engineering', level: 'executive' },
    { role: 'CTO', level: 'executive' },
    { role: 'DevOps Engineer', level: 'mid' },
    { role: 'Site Reliability Engineer', level: 'mid' },
    { role: 'Data Scientist', level: 'mid' },
    { role: 'Machine Learning Engineer', level: 'mid' },
    { role: 'Security Engineer', level: 'mid' },
  ],
  programming: [
    { role: 'Frontend Developer', level: 'entry' },
    { role: 'Backend Developer', level: 'entry' },
    { role: 'React Developer', level: 'mid' },
    { role: 'Node.js Developer', level: 'mid' },
    { role: 'Python Developer', level: 'mid' },
    { role: 'Java Developer', level: 'mid' },
    { role: 'Senior Frontend Engineer', level: 'senior' },
    { role: 'Senior Backend Engineer', level: 'senior' },
    { role: 'Mobile Developer', level: 'mid' },
    { role: 'iOS Developer', level: 'mid' },
    { role: 'Android Developer', level: 'mid' },
    { role: 'Game Developer', level: 'mid' },
    { role: 'Blockchain Developer', level: 'mid' },
    { role: 'Platform Engineer', level: 'senior' },
    { role: 'Staff Engineer', level: 'senior' },
  ],
  healthcare: [
    { role: 'Registered Nurse', level: 'entry' },
    { role: 'Nurse Practitioner', level: 'mid' },
    { role: 'Clinical Nurse Specialist', level: 'senior' },
    { role: 'Physician Assistant', level: 'mid' },
    { role: 'Medical Assistant', level: 'entry' },
    { role: 'Healthcare Administrator', level: 'mid' },
    { role: 'Hospital Administrator', level: 'senior' },
    { role: 'Clinical Research Coordinator', level: 'entry' },
    { role: 'Clinical Research Manager', level: 'mid' },
    { role: 'Medical Director', level: 'executive' },
    { role: 'Physical Therapist', level: 'mid' },
    { role: 'Occupational Therapist', level: 'mid' },
    { role: 'Pharmacist', level: 'mid' },
    { role: 'Medical Technologist', level: 'mid' },
    { role: 'Healthcare IT Specialist', level: 'mid' },
  ],
  finance: [
    { role: 'Financial Analyst', level: 'entry' },
    { role: 'Senior Financial Analyst', level: 'mid' },
    { role: 'Finance Manager', level: 'mid' },
    { role: 'Controller', level: 'senior' },
    { role: 'CFO', level: 'executive' },
    { role: 'Investment Analyst', level: 'entry' },
    { role: 'Portfolio Manager', level: 'senior' },
    { role: 'Risk Analyst', level: 'mid' },
    { role: 'Compliance Officer', level: 'mid' },
    { role: 'Internal Auditor', level: 'mid' },
    { role: 'Tax Accountant', level: 'mid' },
    { role: 'Financial Advisor', level: 'mid' },
    { role: 'Credit Analyst', level: 'entry' },
    { role: 'Treasury Analyst', level: 'mid' },
    { role: 'Accounting Manager', level: 'mid' },
  ],
  education: [
    { role: 'Elementary School Teacher', level: 'entry' },
    { role: 'High School Teacher', level: 'entry' },
    { role: 'Special Education Teacher', level: 'mid' },
    { role: 'School Counselor', level: 'mid' },
    { role: 'Assistant Principal', level: 'senior' },
    { role: 'Principal', level: 'executive' },
    { role: 'Curriculum Developer', level: 'mid' },
    { role: 'Instructional Designer', level: 'mid' },
    { role: 'Academic Advisor', level: 'entry' },
    { role: 'Education Administrator', level: 'senior' },
    { role: 'Professor', level: 'senior' },
    { role: 'Teaching Assistant', level: 'entry' },
    { role: 'Librarian', level: 'mid' },
    { role: 'Education Consultant', level: 'senior' },
    { role: 'Dean', level: 'executive' },
  ],
  engineering: [
    { role: 'Mechanical Engineer', level: 'entry' },
    { role: 'Senior Mechanical Engineer', level: 'senior' },
    { role: 'Electrical Engineer', level: 'entry' },
    { role: 'Civil Engineer', level: 'entry' },
    { role: 'Project Engineer', level: 'mid' },
    { role: 'Engineering Manager', level: 'senior' },
    { role: 'Quality Engineer', level: 'mid' },
    { role: 'Systems Engineer', level: 'mid' },
    { role: 'Manufacturing Engineer', level: 'mid' },
    { role: 'Process Engineer', level: 'mid' },
    { role: 'Design Engineer', level: 'mid' },
    { role: 'Field Engineer', level: 'entry' },
    { role: 'Environmental Engineer', level: 'mid' },
    { role: 'VP of Engineering', level: 'executive' },
  ],
  legal: [
    { role: 'Legal Assistant', level: 'entry' },
    { role: 'Paralegal', level: 'entry' },
    { role: 'Contract Specialist', level: 'mid' },
    { role: 'Corporate Counsel', level: 'senior' },
    { role: 'Senior Corporate Counsel', level: 'senior' },
    { role: 'General Counsel', level: 'executive' },
    { role: 'Compliance Manager', level: 'mid' },
    { role: 'Legal Operations Manager', level: 'mid' },
    { role: 'Litigation Attorney', level: 'mid' },
    { role: 'Patent Attorney', level: 'senior' },
  ],
  design: [
    { role: 'Graphic Designer', level: 'entry' },
    { role: 'UI/UX Designer', level: 'mid' },
    { role: 'Senior Product Designer', level: 'senior' },
    { role: 'Design Director', level: 'executive' },
    { role: 'Web Designer', level: 'entry' },
    { role: 'Visual Designer', level: 'mid' },
    { role: 'Interaction Designer', level: 'mid' },
    { role: 'Motion Designer', level: 'mid' },
    { role: 'Brand Designer', level: 'mid' },
    { role: 'Design Lead', level: 'senior' },
  ],
  creative: [
    { role: 'Content Writer', level: 'entry' },
    { role: 'Copywriter', level: 'mid' },
    { role: 'Creative Director', level: 'executive' },
    { role: 'Art Director', level: 'senior' },
    { role: 'Video Editor', level: 'mid' },
    { role: 'Photographer', level: 'mid' },
    { role: 'Social Media Content Creator', level: 'entry' },
    { role: 'Creative Producer', level: 'senior' },
    { role: 'Brand Strategist', level: 'senior' },
    { role: 'Content Strategist', level: 'mid' },
  ],
  hospitality: [
    { role: 'Hotel Manager', level: 'mid' },
    { role: 'Restaurant Manager', level: 'mid' },
    { role: 'Event Coordinator', level: 'entry' },
    { role: 'Chef', level: 'mid' },
    { role: 'Food Service Manager', level: 'mid' },
  ],
  retail: [
    { role: 'Store Manager', level: 'mid' },
    { role: 'Retail Sales Associate', level: 'entry' },
    { role: 'District Manager', level: 'senior' },
    { role: 'Merchandising Manager', level: 'mid' },
    { role: 'Buyer', level: 'mid' },
  ],
  manufacturing: [
    { role: 'Production Manager', level: 'mid' },
    { role: 'Quality Control Inspector', level: 'entry' },
    { role: 'Operations Manager', level: 'senior' },
    { role: 'Supply Chain Manager', level: 'mid' },
    { role: 'Plant Manager', level: 'senior' },
  ],
  nonprofit: [
    { role: 'Program Coordinator', level: 'entry' },
    { role: 'Development Manager', level: 'mid' },
    { role: 'Executive Director', level: 'executive' },
    { role: 'Grant Writer', level: 'mid' },
    { role: 'Volunteer Coordinator', level: 'entry' },
  ],
  government: [
    { role: 'Policy Analyst', level: 'mid' },
    { role: 'Program Manager', level: 'mid' },
    { role: 'Administrative Officer', level: 'mid' },
    { role: 'Public Affairs Specialist', level: 'mid' },
    { role: 'Budget Analyst', level: 'mid' },
  ],
  other: [
    { role: 'Human Resources Manager', level: 'mid' },
    { role: 'Recruiter', level: 'entry' },
    { role: 'Training Specialist', level: 'mid' },
    { role: 'Customer Success Manager', level: 'mid' },
    { role: 'Sales Representative', level: 'entry' },
  ]
};

// Helper function to generate role slug
function generateRoleSlug(role: string): string {
  return role
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Template generator function
function generateResumeTemplate(
  industry: Industry,
  role: string,
  experienceLevel: ExperienceLevel
): Omit<ResumeTemplate, 'id'> {
  const roleSlug = generateRoleSlug(role);
  
  // Generate appropriate content based on experience level
  const yearsOfExperience = {
    entry: '1-3',
    mid: '3-7',
    senior: '7-12',
    executive: '12+'
  }[experienceLevel];

  // Generate template content
  const template: Omit<ResumeTemplate, 'id'> = {
    type: 'resume',
    industry,
    role,
    roleSlug,
    experienceLevel,
    content: {
      name: 'John Doe',
      title: role,
      location: 'New York, NY',
      email: 'john.doe@email.com',
      phone: '(555) 123-4567',
      linkedin: 'linkedin.com/in/johndoe',
      summary: `Results-driven ${role} with ${yearsOfExperience} years of experience in ${industry}. Proven track record of delivering exceptional results and driving business growth.`,
      experience: generateExperienceSection(role, experienceLevel, industry),
      education: generateEducationSection(experienceLevel),
      skills: generateSkillsSection(role, industry)
    },
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      author: 'System',
      version: '1.0.0',
      tags: [industry, role, experienceLevel],
      popularity: 0,
      rating: 0,
      ratingCount: 0,
      isActive: true,
      isPremium: experienceLevel === 'executive'
    },
    keywords: generateKeywords(role, industry, experienceLevel)
  };

  return template;
}

function generateCoverLetterTemplate(
  industry: Industry,
  role: string,
  experienceLevel: ExperienceLevel
): Omit<CoverLetterTemplate, 'id'> {
  const roleSlug = generateRoleSlug(role);
  
  const template: Omit<CoverLetterTemplate, 'id'> = {
    type: 'cover_letter',
    industry,
    role,
    roleSlug,
    experienceLevel,
    content: {
      name: 'John Doe',
      address: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      email: 'john.doe@email.com',
      phone: '(555) 123-4567',
      date: new Date().toLocaleDateString(),
      companyName: '[Company Name]',
      salutation: 'Dear Hiring Manager',
      opening: {
        hook: `As an experienced ${role} with a proven track record in ${industry}, I was excited to learn about the opportunity at [Company Name].`,
        position: role,
        source: 'your company website'
      },
      body: generateCoverLetterBody(role, experienceLevel, industry),
      closing: {
        callToAction: 'I would welcome the opportunity to discuss how my skills and experience can contribute to your team.',
        availability: 'I am available for an interview at your convenience.',
        thanks: 'Thank you for considering my application.'
      },
      signature: {
        closing: 'Sincerely',
        name: 'John Doe'
      }
    },
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      author: 'System',
      version: '1.0.0',
      tags: [industry, role, experienceLevel],
      popularity: 0,
      rating: 0,
      ratingCount: 0,
      isActive: true,
      isPremium: experienceLevel === 'executive'
    },
    tone: experienceLevel === 'entry' ? 'enthusiastic' : 'formal',
    keywords: generateKeywords(role, industry, experienceLevel)
  };

  return template;
}

// Helper functions with realistic, role-specific content
function generateExperienceSection(role: string, level: ExperienceLevel, industry: Industry) {
  const experienceYears = {
    entry: { min: 1, max: 3, count: 1 },
    mid: { min: 3, max: 7, count: 2 },
    senior: { min: 7, max: 12, count: 3 },
    executive: { min: 12, max: 20, count: 3 }
  }[level];

  const companies = getIndustryCompanies(industry);
  const locations = ['New York, NY', 'San Francisco, CA', 'Chicago, IL', 'Austin, TX', 'Seattle, WA', 'Boston, MA', 'Denver, CO', 'Atlanta, GA'];
  
  const experiences = [];
  const currentYear = new Date().getFullYear();
  
  for (let i = 0; i < experienceYears.count; i++) {
    const isCurrent = i === 0;
    const yearsInRole = Math.floor(Math.random() * 3) + 1;
    const startYear = currentYear - (i * 3) - yearsInRole;
    const endYear = isCurrent ? currentYear : startYear + yearsInRole;
    
    const jobTitle = i === 0 ? role : generateProgressionTitle(role, level, i);
    const responsibilities = generateRoleResponsibilities(role, industry, level, i === 0);
    
    experiences.push({
      id: (i + 1).toString(),
      jobTitle,
      companyName: companies[i % companies.length],
      location: locations[i % locations.length],
      startDate: startYear.toString(),
      endDate: isCurrent ? 'Present' : endYear.toString(),
      isCurrent,
      responsibilities,
      achievements: generateAchievements(role, industry, level)
    });
  }
  
  return experiences;
}

function generateProgressionTitle(currentRole: string, level: ExperienceLevel, index: number): string {
  // Generate career progression titles
  const progressionMap: Record<string, string[]> = {
    'Software Engineer': ['Junior Software Engineer', 'Software Developer'],
    'Marketing Manager': ['Marketing Specialist', 'Marketing Coordinator'],
    'Business Analyst': ['Junior Business Analyst', 'Business Associate'],
    'Project Manager': ['Project Coordinator', 'Assistant Project Manager'],
    'Data Scientist': ['Data Analyst', 'Junior Data Scientist'],
    'Product Manager': ['Product Analyst', 'Associate Product Manager'],
    'UX Designer': ['Junior UX Designer', 'UI Designer'],
    'Financial Analyst': ['Junior Financial Analyst', 'Finance Associate'],
    'HR Manager': ['HR Specialist', 'HR Coordinator'],
    'Sales Manager': ['Sales Representative', 'Account Executive']
  };

  const progressions = progressionMap[currentRole] || [currentRole.replace('Senior ', '').replace('Lead ', '')];
  return progressions[index] || currentRole;
}

function generateRoleResponsibilities(role: string, industry: Industry, level: ExperienceLevel, isCurrent: boolean): string[] {
  const baseResponsibilities = getRoleBaseResponsibilities(role, industry);
  const levelModifiers = getLevelModifiers(level);
  const industryContext = getIndustryContext(industry);
  
  // Combine base responsibilities with level and industry modifiers
  const responsibilities = baseResponsibilities.map(resp => {
    return resp
      .replace('{industry}', industryContext)
      .replace('{level_modifier}', levelModifiers.action)
      .replace('{team_size}', levelModifiers.teamSize);
  });

  return responsibilities.slice(0, level === 'entry' ? 3 : level === 'mid' ? 4 : 5);
}

function getRoleBaseResponsibilities(role: string, industry: Industry): string[] {
  const responsibilityMap: Record<string, string[]> = {
    'Software Engineer': [
      'Developed and maintained {industry} applications using modern technologies',
      '{level_modifier} software solutions that improved system performance by 25-40%',
      'Collaborated with {team_size} cross-functional team members on feature development',
      'Implemented automated testing procedures reducing bugs by 30%',
      'Participated in code reviews and maintained high-quality coding standards'
    ],
    'Marketing Manager': [
      '{level_modifier} comprehensive marketing campaigns for {industry} products',
      'Increased brand awareness and lead generation by 35% through digital marketing',
      'Managed marketing budget of $50K-$500K and optimized spend allocation',
      'Coordinated with {team_size} team members across creative and analytics functions',
      'Analyzed campaign performance and implemented data-driven optimizations'
    ],
    'Business Analyst': [
      'Analyzed {industry} business processes and identified improvement opportunities',
      '{level_modifier} requirements gathering and stakeholder management initiatives',
      'Created comprehensive documentation and process maps for operational efficiency',
      'Collaborated with {team_size} IT and business teams on system implementations',
      'Delivered cost-saving recommendations resulting in 15-25% efficiency gains'
    ],
    'Project Manager': [
      '{level_modifier} end-to-end project delivery for {industry} initiatives',
      'Managed project budgets ranging from $100K to $2M with 95% on-time delivery',
      'Coordinated with {team_size} cross-functional team members and stakeholders',
      'Implemented agile methodologies improving team productivity by 30%',
      'Mitigated project risks and maintained clear communication with leadership'
    ],
    'Data Scientist': [
      'Developed predictive models and analytics solutions for {industry} challenges',
      '{level_modifier} machine learning algorithms improving decision-making by 40%',
      'Analyzed large datasets to extract actionable business insights',
      'Collaborated with {team_size} engineering and product teams on data initiatives',
      'Presented findings to leadership and influenced strategic business decisions'
    ],
    'Financial Analyst': [
      'Conducted financial analysis and modeling for {industry} business units',
      '{level_modifier} budget planning and variance analysis for executive leadership',
      'Prepared comprehensive financial reports and presentations for stakeholders',
      'Identified cost optimization opportunities saving 10-20% in operational expenses',
      'Collaborated with {team_size} finance and operations teams on forecasting'
    ],
    'HR Manager': [
      '{level_modifier} talent acquisition and employee development programs',
      'Reduced time-to-hire by 30% through process optimization and technology adoption',
      'Managed employee relations and implemented policies improving retention by 25%',
      'Led {team_size} HR team members in delivering comprehensive people solutions',
      'Developed training programs and performance management systems'
    ],
    'UX Designer': [
      'Designed user-centered experiences for {industry} digital products',
      '{level_modifier} design research and usability testing improving user satisfaction by 45%',
      'Created wireframes, prototypes, and design systems for development teams',
      'Collaborated with {team_size} product and engineering teams on feature delivery',
      'Established design guidelines and best practices across the organization'
    ]
  };

  // Fallback to generic responsibilities if role not found
  return responsibilityMap[role] || [
    '{level_modifier} strategic initiatives for {industry} business objectives',
    'Collaborated with {team_size} cross-functional team members on key projects',
    'Implemented process improvements resulting in 20-30% efficiency gains',
    'Managed stakeholder relationships and delivered results on time and budget',
    'Analyzed performance metrics and recommended data-driven solutions'
  ];
}

function getLevelModifiers(level: ExperienceLevel) {
  const modifiers = {
    entry: { action: 'Supported', teamSize: '3-5', scope: 'local' },
    mid: { action: 'Led', teamSize: '5-10', scope: 'departmental' },
    senior: { action: 'Directed', teamSize: '10-15', scope: 'cross-functional' },
    executive: { action: 'Orchestrated', teamSize: '15+', scope: 'organization-wide' }
  };
  
  return modifiers[level];
}

function getIndustryContext(industry: Industry): string {
  const contexts = {
    business: 'enterprise business',
    marketing: 'digital marketing',
    technology: 'technology',
    programming: 'software development',
    healthcare: 'healthcare',
    finance: 'financial services',
    education: 'educational',
    engineering: 'engineering',
    legal: 'legal',
    design: 'design',
    creative: 'creative',
    hospitality: 'hospitality',
    retail: 'retail',
    manufacturing: 'manufacturing',
    nonprofit: 'nonprofit',
    government: 'government',
    other: 'industry'
  };
  
  return contexts[industry] || 'business';
}

function generateAchievements(role: string, industry: Industry, level: ExperienceLevel): string[] {
  const achievementTemplates = {
    performance: [
      'Improved team productivity by {percentage}% through process optimization',
      'Exceeded performance targets by {percentage}% for {duration} consecutive quarters',
      'Reduced operational costs by ${amount}K through strategic initiatives'
    ],
    leadership: [
      'Led {team_size} team members to deliver {project_count} successful projects',
      'Mentored {mentee_count} junior team members resulting in {promotion_count} promotions',
      'Established best practices adopted across {scope} organization'
    ],
    innovation: [
      'Implemented innovative solution reducing processing time by {percentage}%',
      'Developed new {process/system} increasing efficiency by {percentage}%',
      'Introduced technology improvements saving ${amount}K annually'
    ]
  };

  const levelMetrics = {
    entry: { percentage: '15-25', amount: '25-75', team_size: '2-3', project_count: '3-5' },
    mid: { percentage: '25-40', amount: '100-300', team_size: '5-8', project_count: '8-12' },
    senior: { percentage: '40-60', amount: '500-1000', team_size: '10-15', project_count: '15-25' },
    executive: { percentage: '60-100', amount: '1000-5000', team_size: '20+', project_count: '25+' }
  };

  const metrics = levelMetrics[level];
  const achievements = [];
  
  // Randomly select and populate achievement templates
  const selectedTemplates = Object.values(achievementTemplates).flat().slice(0, 2);
  
  selectedTemplates.forEach(template => {
    let achievement = template
      .replace('{percentage}', getRandomFromRange(metrics.percentage))
      .replace('{amount}', getRandomFromRange(metrics.amount))
      .replace('{team_size}', getRandomFromRange(metrics.team_size))
      .replace('{project_count}', getRandomFromRange(metrics.project_count))
      .replace('{duration}', Math.floor(Math.random() * 4 + 2).toString())
      .replace('{mentee_count}', Math.floor(Math.random() * 3 + 1).toString())
      .replace('{promotion_count}', Math.floor(Math.random() * 2 + 1).toString())
      .replace('{scope}', level === 'executive' ? 'the entire' : 'the')
      .replace('{process/system}', Math.random() > 0.5 ? 'process' : 'system');
    
    achievements.push(achievement);
  });

  return achievements;
}

function getRandomFromRange(range: string): string {
  const [min, max] = range.split('-').map(Number);
  return Math.floor(Math.random() * (max - min + 1) + min).toString();
}

function getIndustryCompanies(industry: Industry): string[] {
  const companyMap: Record<Industry, string[]> = {
    business: ['Acme Consulting Group', 'Strategic Solutions Inc.', 'Global Business Partners', 'Enterprise Dynamics Corp'],
    marketing: ['Creative Marketing Agency', 'Digital Growth Partners', 'Brand Strategy Group', 'Marketing Innovations LLC'],
    technology: ['TechFlow Solutions', 'Innovation Labs Inc.', 'Digital Transformation Corp', 'NextGen Technology'],
    programming: ['CodeCraft Inc.', 'Software Solutions Group', 'Development Partners LLC', 'Tech Innovations Corp'],
    healthcare: ['Regional Medical Center', 'Healthcare Solutions Group', 'MedTech Innovations', 'Wellness Partners LLC'],
    finance: ['Financial Partners Group', 'Investment Solutions Inc.', 'Capital Management Corp', 'Finance Innovations LLC'],
    education: ['Academic Excellence Institute', 'Learning Solutions Group', 'Education Partners LLC', 'Knowledge Systems Inc.'],
    engineering: ['Engineering Solutions Group', 'Technical Innovations Corp', 'Design & Build Partners', 'Infrastructure Systems LLC'],
    legal: ['Legal Associates Group', 'Corporate Law Partners', 'Justice Solutions Inc.', 'Legal Innovations LLC'],
    design: ['Creative Design Studio', 'Visual Solutions Group', 'Design Partners Inc.', 'Creative Innovations LLC'],
    creative: ['Creative Solutions Agency', 'Artistic Innovations Group', 'Content Creation Partners', 'Creative Labs Inc.'],
    hospitality: ['Premier Hospitality Group', 'Service Excellence Corp', 'Hospitality Partners LLC', 'Guest Experience Inc.'],
    retail: ['Retail Solutions Group', 'Commerce Partners Inc.', 'Customer Experience Corp', 'Retail Innovations LLC'],
    manufacturing: ['Production Excellence Corp', 'Manufacturing Solutions Group', 'Industrial Partners Inc.', 'Operations LLC'],
    nonprofit: ['Community Impact Organization', 'Social Change Partners', 'Nonprofit Solutions Group', 'Mission Driven Inc.'],
    government: ['Public Service Agency', 'Government Solutions Corp', 'Civic Partners Group', 'Public Administration LLC'],
    other: ['Professional Services Group', 'Business Solutions Corp', 'Industry Partners Inc.', 'Professional LLC']
  };

  return companyMap[industry] || companyMap.other;
}

function generateEducationSection(level: ExperienceLevel): any[] {
  const universities = [
    'Stanford University', 'MIT', 'Harvard University', 'UC Berkeley', 'Carnegie Mellon',
    'University of Pennsylvania', 'Northwestern University', 'University of Chicago',
    'Columbia University', 'NYU', 'University of Michigan', 'UT Austin', 'UCLA'
  ];
  
  const locations = [
    'Stanford, CA', 'Cambridge, MA', 'Cambridge, MA', 'Berkeley, CA', 'Pittsburgh, PA',
    'Philadelphia, PA', 'Evanston, IL', 'Chicago, IL', 'New York, NY', 'New York, NY',
    'Ann Arbor, MI', 'Austin, TX', 'Los Angeles, CA'
  ];

  const education = [];
  const currentYear = new Date().getFullYear();
  
  // Primary degree based on level
  const primaryDegree = {
    entry: {
      degree: 'Bachelor of Science in Business Administration',
      duration: 4,
      gpa: '3.5'
    },
    mid: {
      degree: 'Bachelor of Science in Business',
      duration: 4,
      gpa: '3.7'
    },
    senior: {
      degree: 'Master of Business Administration',
      duration: 2,
      gpa: '3.8'
    },
    executive: {
      degree: 'Master of Business Administration',
      duration: 2,
      gpa: '3.9'
    }
  }[level];

  const universityIndex = Math.floor(Math.random() * universities.length);
  const graduationYear = currentYear - (level === 'entry' ? 2 : level === 'mid' ? 5 : level === 'senior' ? 8 : 15);
  
  education.push({
    id: '1',
    degree: primaryDegree.degree,
    school: universities[universityIndex],
    location: locations[universityIndex],
    startDate: (graduationYear - primaryDegree.duration).toString(),
    endDate: graduationYear.toString(),
    gpa: primaryDegree.gpa,
    relevantCourses: generateRelevantCourses(level),
    ...(level !== 'entry' && { honors: ['Cum Laude', 'Dean\'s List'] })
  });

  // Add undergraduate degree for senior/executive if they have MBA
  if (level === 'senior' || level === 'executive') {
    const undergradIndex = Math.floor(Math.random() * universities.length);
    const undergradYear = graduationYear - 6;
    
    education.push({
      id: '2',
      degree: 'Bachelor of Science',
      school: universities[undergradIndex],
      location: locations[undergradIndex],
      startDate: (undergradYear - 4).toString(),
      endDate: undergradYear.toString(),
      gpa: '3.6'
    });
  }

  return education;
}

function generateRelevantCourses(level: ExperienceLevel): string[] {
  const coursesByLevel = {
    entry: [
      'Business Strategy', 'Financial Analysis', 'Marketing Principles', 'Operations Management'
    ],
    mid: [
      'Advanced Business Strategy', 'Financial Modeling', 'Digital Marketing', 'Project Management',
      'Data Analytics', 'Leadership Fundamentals'
    ],
    senior: [
      'Strategic Leadership', 'Advanced Financial Analysis', 'Organizational Behavior',
      'International Business', 'Innovation Management', 'Executive Decision Making'
    ],
    executive: [
      'Executive Leadership', 'Corporate Strategy', 'Mergers & Acquisitions',
      'Global Business Management', 'Strategic Innovation', 'Board Governance'
    ]
  };

  return coursesByLevel[level].slice(0, 4);
}

function generateSkillsSection(role: string, industry: Industry): any {
  const skillsMap = {
    technical: getTechnicalSkills(role, industry),
    soft: getSoftSkills(role),
    languages: generateLanguages(),
    certifications: getCertifications(role, industry)
  };

  return skillsMap;
}

function getTechnicalSkills(role: string, industry: Industry): string[] {
  const roleSkillsMap: Record<string, string[]> = {
    'Software Engineer': ['Python', 'JavaScript', 'React', 'Node.js', 'AWS', 'Docker', 'Git', 'SQL'],
    'Marketing Manager': ['Google Analytics', 'HubSpot', 'Salesforce', 'Adobe Creative Suite', 'SEO/SEM', 'Email Marketing', 'Social Media Management'],
    'Business Analyst': ['SQL', 'Tableau', 'Excel', 'Power BI', 'JIRA', 'Confluence', 'Process Mapping', 'Requirements Gathering'],
    'Project Manager': ['Jira', 'Microsoft Project', 'Asana', 'Scrum/Agile', 'Risk Management', 'Budget Planning', 'Stakeholder Management'],
    'Data Scientist': ['Python', 'R', 'SQL', 'Machine Learning', 'TensorFlow', 'Pandas', 'Jupyter', 'Statistical Analysis'],
    'Financial Analyst': ['Excel', 'Financial Modeling', 'Bloomberg Terminal', 'SQL', 'Tableau', 'VBA', 'PowerPoint', 'QuickBooks'],
    'HR Manager': ['HRIS Systems', 'Workday', 'ATS Platforms', 'Employee Relations', 'Compensation Analysis', 'Performance Management'],
    'UX Designer': ['Figma', 'Sketch', 'Adobe XD', 'InVision', 'User Research', 'Prototyping', 'Usability Testing', 'Design Systems']
  };

  const industrySkills: Record<Industry, string[]> = {
    technology: ['Cloud Computing', 'DevOps', 'API Development', 'Microservices'],
    finance: ['Financial Modeling', 'Risk Assessment', 'Regulatory Compliance', 'Bloomberg'],
    healthcare: ['HIPAA Compliance', 'Electronic Health Records', 'Healthcare Analytics', 'Clinical Research'],
    marketing: ['Marketing Automation', 'CRM Systems', 'Content Management', 'A/B Testing'],
    business: ['Business Intelligence', 'Process Improvement', 'Strategic Planning', 'Market Analysis'],
    programming: ['Software Development', 'Code Review', 'Testing Frameworks', 'Version Control'],
    education: ['Learning Management Systems', 'Curriculum Development', 'Educational Technology', 'Assessment Tools'],
    engineering: ['CAD Software', 'Project Planning', 'Quality Assurance', 'Technical Documentation'],
    legal: ['Legal Research', 'Contract Management', 'Compliance Management', 'Case Management'],
    design: ['Design Software', 'Brand Development', 'Visual Communication', 'Creative Direction'],
    creative: ['Content Creation', 'Graphic Design', 'Video Production', 'Social Media'],
    hospitality: ['Property Management', 'Customer Service', 'Event Planning', 'Hospitality Software'],
    retail: ['Point of Sale', 'Inventory Management', 'Customer Analytics', 'E-commerce'],
    manufacturing: ['Lean Manufacturing', 'Quality Control', 'Supply Chain', 'Production Planning'],
    nonprofit: ['Grant Writing', 'Fundraising', 'Volunteer Management', 'Program Development'],
    government: ['Policy Analysis', 'Public Administration', 'Government Relations', 'Regulatory Affairs'],
    other: ['Project Management', 'Data Analysis', 'Communication', 'Problem Solving']
  };

  const roleSkills = roleSkillsMap[role] || ['Microsoft Office', 'Project Management', 'Data Analysis', 'Communication'];
  const industrySpecific = industrySkills[industry] || [];
  
  return [...roleSkills.slice(0, 5), ...industrySpecific.slice(0, 3)];
}

function getSoftSkills(role: string): string[] {
  const universalSoftSkills = [
    'Leadership', 'Communication', 'Problem Solving', 'Critical Thinking',
    'Team Collaboration', 'Adaptability', 'Time Management', 'Decision Making',
    'Negotiation', 'Presentation Skills', 'Emotional Intelligence', 'Conflict Resolution'
  ];

  // Return 4-6 relevant soft skills
  return universalSoftSkills.slice(0, Math.floor(Math.random() * 3) + 4);
}

function generateLanguages(): Array<{ language: string; proficiency: string }> {
  const languages = ['Spanish', 'French', 'German', 'Mandarin', 'Japanese', 'Portuguese', 'Italian'];
  const proficiencies = ['Native', 'Fluent', 'Conversational', 'Basic'];
  
  const languageSkills = [{ language: 'English', proficiency: 'Native' }];
  
  // Add 0-2 additional languages
  const additionalLanguages = Math.floor(Math.random() * 3);
  for (let i = 0; i < additionalLanguages; i++) {
    const language = languages[Math.floor(Math.random() * languages.length)];
    const proficiency = proficiencies[Math.floor(Math.random() * (proficiencies.length - 1)) + 1]; // Exclude 'Native' for non-English
    languageSkills.push({ language, proficiency });
  }
  
  return languageSkills;
}

function getCertifications(role: string, industry: Industry): Array<{ name: string; issuer: string; date: string }> {
  const certificationMap: Record<string, Array<{ name: string; issuer: string }>> = {
    'Software Engineer': [
      { name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services' },
      { name: 'Certified Kubernetes Administrator', issuer: 'Cloud Native Computing Foundation' },
      { name: 'Google Cloud Professional Developer', issuer: 'Google Cloud' }
    ],
    'Marketing Manager': [
      { name: 'Google Analytics Certified', issuer: 'Google' },
      { name: 'HubSpot Content Marketing Certification', issuer: 'HubSpot' },
      { name: 'Facebook Blueprint Certification', issuer: 'Meta' }
    ],
    'Project Manager': [
      { name: 'Project Management Professional (PMP)', issuer: 'Project Management Institute' },
      { name: 'Certified ScrumMaster (CSM)', issuer: 'Scrum Alliance' },
      { name: 'Agile Certified Practitioner', issuer: 'Project Management Institute' }
    ],
    'Data Scientist': [
      { name: 'TensorFlow Developer Certificate', issuer: 'Google' },
      { name: 'Microsoft Certified: Azure Data Scientist Associate', issuer: 'Microsoft' },
      { name: 'Certified Analytics Professional', issuer: 'INFORMS' }
    ]
  };

  const defaultCerts = [
    { name: 'Professional Development Certificate', issuer: 'Industry Association' },
    { name: 'Leadership Excellence Certificate', issuer: 'Professional Institute' }
  ];

  const roleCerts = certificationMap[role] || defaultCerts;
  const currentYear = new Date().getFullYear();
  
  return roleCerts.slice(0, 2).map((cert, index) => ({
    ...cert,
    date: (currentYear - Math.floor(Math.random() * 3)).toString()
  }));
}

function generateCoverLetterBody(role: string, level: ExperienceLevel, industry: Industry) {
  return [
    {
      id: '1',
      content: `With my extensive background in ${industry}, I have developed the skills and expertise necessary to excel as a ${role}.`,
      focus: 'experience' as const
    },
    {
      id: '2',
      content: 'My key achievements include leading successful projects that resulted in significant improvements in operational efficiency and team performance.',
      focus: 'achievements' as const
    }
  ];
}

function generateKeywords(role: string, industry: Industry, level: ExperienceLevel): string[] {
  return [
    role.toLowerCase(),
    industry,
    level,
    ...role.split(' ').map(word => word.toLowerCase())
  ];
}

// Function to remove undefined values from objects
function cleanUndefinedValues(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(cleanUndefinedValues).filter(item => item !== undefined);
  }
  
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = cleanUndefinedValues(value);
      }
    }
    return cleaned;
  }
  
  return obj;
}

// Batch creation using Admin SDK
async function batchCreateTemplatesAdmin(templates: Omit<Template, 'id'>[]): Promise<string[]> {
  try {
    const BATCH_SIZE = 500; // Firestore batch limit
    const ids: string[] = [];
    
    // Process templates in batches
    for (let i = 0; i < templates.length; i += BATCH_SIZE) {
      const batch = db.batch();
      const batchTemplates = templates.slice(i, i + BATCH_SIZE);
      
      console.log(`📝 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(templates.length / BATCH_SIZE)} (${batchTemplates.length} templates)`);
      
      for (const template of batchTemplates) {
        const collectionName = template.type === 'resume' 
          ? 'resume_templates' 
          : 'cover_letter_templates';
        
        const docRef = db.collection(collectionName).doc();
        ids.push(docRef.id);
        
        // Clean the template data
        const cleanedTemplate = cleanUndefinedValues({
          ...template,
          metadata: {
            ...template.metadata,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          }
        });
        
        batch.set(docRef, cleanedTemplate);
      }
      
      await batch.commit();
      console.log(`✅ Batch ${Math.floor(i / BATCH_SIZE) + 1} completed`);
    }
    
    return ids;
  } catch (error) {
    console.error('Error in batch creation:', error);
    throw error;
  }
}

// Main seeding function
export async function seedTemplatesAdmin() {
  console.log('🌱 Starting Admin SDK template seeding...');
  console.log('📊 Generating templates for all industries and roles...\n');
  
  const resumeTemplates: Omit<ResumeTemplate, 'id'>[] = [];
  const coverLetterTemplates: Omit<CoverLetterTemplate, 'id'>[] = [];
  
  // Generate templates for each industry and role
  let totalCount = 0;
  for (const [industry, roles] of Object.entries(INDUSTRY_ROLES)) {
    console.log(`🏢 Generating templates for ${industry} industry (${roles.length} roles)`);
    
    for (const { role, level } of roles) {
      resumeTemplates.push(generateResumeTemplate(industry as Industry, role, level));
      coverLetterTemplates.push(generateCoverLetterTemplate(industry as Industry, role, level));
      totalCount += 2;
    }
  }
  
  console.log(`\n📈 Generated ${resumeTemplates.length} resume templates`);
  console.log(`📋 Generated ${coverLetterTemplates.length} cover letter templates`);
  console.log(`🎯 Total templates: ${totalCount}\n`);
  
  try {
    const allTemplates = [...resumeTemplates, ...coverLetterTemplates];
    console.log('🔥 Starting Firestore upload with Admin SDK...\n');
    
    const templateIds = await batchCreateTemplatesAdmin(allTemplates);
    
    console.log(`\n🎉 Successfully created ${templateIds.length} templates in Firestore!`);
    console.log(`📁 Collections created:`);
    console.log(`   - resume_templates: ${resumeTemplates.length} documents`);
    console.log(`   - cover_letter_templates: ${coverLetterTemplates.length} documents`);
    
    return templateIds;
  } catch (error) {
    console.error('❌ Error seeding templates:', error);
    throw error;
  }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedTemplatesAdmin()
    .then(() => {
      console.log('\n✨ Template seeding completed successfully with Admin SDK!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Template seeding failed:', error);
      process.exit(1);
    });
}