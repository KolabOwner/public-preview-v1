// scripts/generators/experience-generator.ts

import { Industry, ExperienceLevel } from '@/types/template.types';
import { ActionVerbSelector, RoleClassifier } from './action-verbs';

export interface ExperienceEntry {
  id: string;
  jobTitle: string;
  companyName: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  responsibilities: string[];
  achievements: string[];
}

// Industry-specific company pools (significantly expanded)
export const INDUSTRY_COMPANIES: Record<Industry, string[]> = {
  business: [
    'Acme Consulting Group', 'Strategic Solutions Inc.', 'Global Business Partners', 'Enterprise Dynamics Corp',
    'McKinsey & Company', 'Boston Consulting Group', 'Bain & Company', 'Deloitte Consulting',
    'PwC Advisory', 'KPMG Consulting', 'EY Strategy', 'Oliver Wyman',
    'A.T. Kearney', 'Strategy& (PwC)', 'Roland Berger', 'L.E.K. Consulting',
    'Accenture Strategy', 'IBM Consulting', 'Capgemini Consulting', 'ZS Associates'
  ],
  marketing: [
    'Creative Marketing Agency', 'Digital Growth Partners', 'Brand Strategy Group', 'Marketing Innovations LLC',
    'WPP', 'Omnicom Group', 'Publicis Groupe', 'Interpublic Group',
    'Dentsu', 'Havas', 'R/GA', 'Wieden+Kennedy',
    'BBDO', 'DDB', 'McCann Worldgroup', 'Ogilvy',
    'Grey Group', 'Leo Burnett', 'Saatchi & Saatchi', 'TBWA Worldwide'
  ],
  technology: [
    'TechFlow Solutions', 'Innovation Labs Inc.', 'Digital Transformation Corp', 'NextGen Technology',
    'Microsoft', 'Google', 'Amazon', 'Apple',
    'Meta (Facebook)', 'Netflix', 'Salesforce', 'Oracle',
    'IBM', 'Intel', 'Cisco', 'Adobe',
    'ServiceNow', 'Snowflake', 'Databricks', 'Stripe'
  ],
  programming: [
    'CodeCraft Inc.', 'Software Solutions Group', 'Development Partners LLC', 'Tech Innovations Corp',
    'GitHub', 'GitLab', 'Atlassian', 'JetBrains',
    'Stack Overflow', 'Red Hat', 'MongoDB', 'Elastic',
    'Docker', 'Kubernetes', 'HashiCorp', 'Terraform',
    'Vercel', 'Netlify', 'Supabase', 'PlanetScale'
  ],
  healthcare: [
    'Regional Medical Center', 'Healthcare Solutions Group', 'MedTech Innovations', 'Wellness Partners LLC',
    'Mayo Clinic', 'Cleveland Clinic', 'Johns Hopkins', 'Kaiser Permanente',
    'UnitedHealth Group', 'Anthem', 'Aetna', 'Humana',
    'Johnson & Johnson', 'Pfizer', 'Merck', 'Abbott',
    'Medtronic', 'Boston Scientific', 'Stryker', 'Baxter'
  ],
  finance: [
    'Financial Partners Group', 'Investment Solutions Inc.', 'Capital Management Corp', 'Finance Innovations LLC',
    'Goldman Sachs', 'Morgan Stanley', 'JPMorgan Chase', 'Bank of America',
    'Wells Fargo', 'Citigroup', 'Deutsche Bank', 'Credit Suisse',
    'BlackRock', 'Vanguard', 'Fidelity', 'State Street',
    'American Express', 'Mastercard', 'Visa', 'PayPal'
  ],
  education: [
    'Academic Excellence Institute', 'Learning Solutions Group', 'Education Partners LLC', 'Knowledge Systems Inc.',
    'Harvard University', 'Stanford University', 'MIT', 'Princeton University',
    'Yale University', 'Columbia University', 'University of Pennsylvania', 'Northwestern University',
    'Pearson Education', 'McGraw-Hill', 'Cengage Learning', 'Wiley',
    'Khan Academy', 'Coursera', 'edX', 'Udemy'
  ],
  engineering: [
    'Engineering Solutions Group', 'Technical Innovations Corp', 'Design & Build Partners', 'Infrastructure Systems LLC',
    'General Electric', 'Boeing', 'Lockheed Martin', 'Raytheon',
    'Caterpillar', '3M', 'Honeywell', 'Siemens',
    'Tesla', 'SpaceX', 'Blue Origin', 'Virgin Galactic',
    'AECOM', 'Jacobs Engineering', 'Fluor Corporation', 'KBR'
  ],
  legal: [
    'Legal Associates Group', 'Corporate Law Partners', 'Justice Solutions Inc.', 'Legal Innovations LLC',
    'Baker McKenzie', 'DLA Piper', 'Latham & Watkins', 'Clifford Chance',
    'Skadden Arps', 'Kirkland & Ellis', 'White & Case', 'Freshfields',
    'Sullivan & Cromwell', 'Davis Polk', 'Cravath Swaine', 'Simpson Thacher',
    'Wachtell Lipton', 'Paul Weiss', 'Cleary Gottlieb', 'Milbank'
  ],
  design: [
    'Creative Design Studio', 'Visual Solutions Group', 'Design Partners Inc.', 'Creative Innovations LLC',
    'IDEO', 'Frog Design', 'Pentagram', 'Ammunition Group',
    'Method', 'Smart Design', 'Continuum', 'Ziba Design',
    'Lunar Design', 'Astro Studios', 'Designit', 'Fjord',
    'Huge', 'Work & Co', 'Ueno', 'Fantasy Interactive'
  ],
  creative: [
    'Creative Solutions Agency', 'Artistic Innovations Group', 'Content Creation Partners', 'Creative Labs Inc.',
    'Droga5', 'Anomaly', 'Mother', 'Goodby Silverstein',
    'Crispin Porter + Bogusky', 'Deutsch', ' 72andSunny', 'The Martin Agency',
    'Fallon', 'Arnold Worldwide', 'Hill Holliday', 'Mullen Lowe',
    'Giant Spoon', 'Essence', 'Momentum Worldwide', 'MRM McCann'
  ],
  hospitality: [
    'Premier Hospitality Group', 'Service Excellence Corp', 'Hospitality Partners LLC', 'Guest Experience Inc.',
    'Marriott International', 'Hilton Worldwide', 'InterContinental Hotels', 'Hyatt Hotels',
    'Accor', 'Wyndham Hotels', 'Choice Hotels', 'Best Western',
    'Four Seasons', 'Ritz-Carlton', 'W Hotels', 'Edition Hotels',
    'Airbnb', 'Expedia Group', 'Booking Holdings', 'TripAdvisor'
  ],
  retail: [
    'Retail Solutions Group', 'Commerce Partners Inc.', 'Customer Experience Corp', 'Retail Innovations LLC',
    'Amazon', 'Walmart', 'Target', 'Home Depot',
    'Costco', 'Best Buy', 'Macy\'s', 'Nordstrom',
    'Gap Inc.', 'TJX Companies', 'Ross Stores', 'L Brands',
    'Nike', 'Adidas', 'Under Armour', 'Lululemon'
  ],
  manufacturing: [
    'Production Excellence Corp', 'Manufacturing Solutions Group', 'Industrial Partners Inc.', 'Operations LLC',
    'General Motors', 'Ford Motor Company', 'Toyota', 'Honda',
    'Procter & Gamble', 'Unilever', 'Coca-Cola', 'PepsiCo',
    'General Electric', 'Siemens', 'ABB', 'Schneider Electric',
    'Caterpillar', 'John Deere', 'Cummins', 'Parker Hannifin'
  ],
  nonprofit: [
    'Community Impact Organization', 'Social Change Partners', 'Nonprofit Solutions Group', 'Mission Driven Inc.',
    'United Way', 'Salvation Army', 'Goodwill Industries', 'American Red Cross',
    'Habitat for Humanity', 'Boys & Girls Clubs', 'YMCA', 'Big Brothers Big Sisters',
    'Doctors Without Borders', 'Oxfam', 'Save the Children', 'World Wildlife Fund',
    'American Cancer Society', 'March of Dimes', 'Susan G. Komen', 'Alzheimer\'s Association'
  ],
  government: [
    'Public Service Agency', 'Government Solutions Corp', 'Civic Partners Group', 'Public Administration LLC',
    'Department of Defense', 'Department of Health', 'Department of Education', 'Department of Transportation',
    'Environmental Protection Agency', 'Federal Bureau of Investigation', 'Central Intelligence Agency', 'National Security Agency',
    'Department of Homeland Security', 'Department of Veterans Affairs', 'Social Security Administration', 'Internal Revenue Service',
    'Federal Trade Commission', 'Securities and Exchange Commission', 'Food and Drug Administration', 'Centers for Disease Control'
  ],
  other: [
    'Professional Services Group', 'Business Solutions Corp', 'Industry Partners Inc.', 'Professional LLC',
    'Accenture', 'Deloitte', 'PwC', 'KPMG',
    'EY', 'IBM', 'Capgemini', 'Cognizant',
    'Tata Consultancy Services', 'Infosys', 'Wipro', 'HCL Technologies',
    'ManpowerGroup', 'Adecco', 'Randstad', 'Kelly Services'
  ]
};

// Significantly expanded and more intelligent role-specific responsibilities
export const ROLE_RESPONSIBILITIES: Record<string, {
  base: string[];
  entry: string[];
  mid: string[];
  senior: string[];
  executive: string[];
}> = {
  'Software Engineer': {
    base: [
      'Developed and maintained {industry} applications using modern technologies and frameworks',
      'Collaborated with cross-functional teams to design and implement scalable software solutions',
      'Participated in code reviews and maintained high-quality coding standards',
      'Debugged and resolved complex technical issues in production environments'
    ],
    entry: [
      'Implemented new features and bug fixes under senior developer guidance',
      'Participated in agile development processes and sprint planning meetings',
      'Wrote unit tests and documentation for code modules',
      'Contributed to team knowledge sharing through code reviews and pair programming'
    ],
    mid: [
      'Led development of major features and coordinated with product teams on requirements',
      'Mentored junior developers and conducted technical interviews',
      'Optimized application performance resulting in 30-50% faster load times',
      'Architected microservices and API integrations for scalable solutions'
    ],
    senior: [
      'Designed and implemented enterprise-level software architecture for critical systems',
      'Led technical decision-making and evaluated new technologies for adoption',
      'Managed development team of 8-12 engineers across multiple projects',
      'Established development best practices and coding standards organization-wide'
    ],
    executive: [
      'Defined technology strategy and roadmap aligned with business objectives',
      'Built and scaled engineering organizations from 50 to 200+ team members',
      'Oversaw technology budget planning and resource allocation across departments',
      'Partnered with executive leadership on digital transformation initiatives'
    ]
  },
  'Marketing Manager': {
    base: [
      'Developed and executed comprehensive marketing campaigns for {industry} products',
      'Analyzed market trends and customer behavior to inform marketing strategies',
      'Collaborated with sales teams to align marketing efforts with revenue goals',
      'Managed marketing budget allocation and tracked campaign ROI'
    ],
    entry: [
      'Assisted in creating marketing materials and campaign content',
      'Conducted market research and compiled competitive analysis reports',
      'Managed social media accounts and executed email marketing campaigns',
      'Supported event planning and trade show participation'
    ],
    mid: [
      'Led digital marketing initiatives resulting in 40-60% increase in lead generation',
      'Managed marketing automation platforms and optimized conversion funnels',
      'Coordinated with creative teams on brand messaging and visual identity',
      'Analyzed campaign performance metrics and implemented data-driven optimizations'
    ],
    senior: [
      'Developed integrated marketing strategies across multiple channels and markets',
      'Managed marketing team of 10-15 specialists and external agency relationships',
      'Led brand positioning initiatives and market expansion strategies',
      'Established marketing analytics framework and KPI measurement systems'
    ],
    executive: [
      'Defined company-wide brand strategy and positioning in competitive markets',
      'Built marketing organization and processes to support rapid business growth',
      'Partnered with C-suite on go-to-market strategies for new product launches',
      'Oversaw marketing technology stack implementation and data integration'
    ]
  },
  'Product Manager': {
    base: [
      'Defined product vision and strategy based on market research and customer feedback',
      'Collaborated with engineering teams to prioritize feature development',
      'Analyzed product metrics and user data to inform product decisions',
      'Managed product roadmap and communicated updates to stakeholders'
    ],
    entry: [
      'Assisted senior product managers with feature specification and testing',
      'Conducted user research and gathered feedback through surveys and interviews',
      'Created product documentation and user stories for development teams',
      'Supported product launches and go-to-market activities'
    ],
    mid: [
      'Owned end-to-end product lifecycle for 2-3 product lines',
      'Led cross-functional teams through feature development from concept to launch',
      'Established product metrics and KPIs to measure success and user adoption',
      'Conducted competitive analysis and market positioning for product features'
    ],
    senior: [
      'Defined product strategy for multiple product lines and market segments',
      'Managed product team of 5-8 product managers and analysts',
      'Led product discovery initiatives and customer development research',
      'Established product management processes and best practices'
    ],
    executive: [
      'Defined company product vision and long-term strategic roadmap',
      'Built product organization to support multiple product lines and markets',
      'Partnered with executive team on product investment and portfolio decisions',
      'Led product-market fit initiatives and expansion into new market segments'
    ]
  },
  'Data Scientist': {
    base: [
      'Developed predictive models and machine learning algorithms for {industry} applications',
      'Analyzed large datasets to extract actionable business insights',
      'Collaborated with engineering teams to deploy models into production systems',
      'Presented findings and recommendations to business stakeholders'
    ],
    entry: [
      'Built statistical models and performed exploratory data analysis',
      'Created data visualizations and dashboards for business reporting',
      'Cleaned and preprocessed datasets for analysis and modeling',
      'Supported senior data scientists with model validation and testing'
    ],
    mid: [
      'Led end-to-end data science projects from problem definition to deployment',
      'Developed automated model training and monitoring pipelines',
      'Mentored junior data scientists and established modeling best practices',
      'Collaborated with product teams to implement data-driven features'
    ],
    senior: [
      'Architected data science infrastructure and model deployment frameworks',
      'Led data science team of 6-10 scientists and engineers',
      'Established data governance and model risk management practices',
      'Defined data strategy and analytics roadmap for business units'
    ],
    executive: [
      'Built enterprise data science and AI capabilities across the organization',
      'Defined data and AI strategy aligned with business transformation goals',
      'Managed data science budget and technology investment decisions',
      'Partnered with business leaders on strategic analytics initiatives'
    ]
  },
  'UX Designer': {
    base: [
      'Designed user-centered experiences for {industry} digital products and services',
      'Conducted user research and usability testing to inform design decisions',
      'Created wireframes, prototypes, and high-fidelity designs for development',
      'Collaborated with product and engineering teams throughout design process'
    ],
    entry: [
      'Created user interface designs and interactive prototypes',
      'Conducted user interviews and usability testing sessions',
      'Developed design specifications and documentation for developers',
      'Participated in design critiques and contributed to design system maintenance'
    ],
    mid: [
      'Led user experience design for major product features and initiatives',
      'Established design research practices and user testing methodologies',
      'Mentored junior designers and conducted design reviews',
      'Collaborated with stakeholders to define user experience strategy'
    ],
    senior: [
      'Defined user experience vision and design strategy for product portfolios',
      'Led design team of 8-12 designers across multiple product areas',
      'Established design systems and standards organization-wide',
      'Partnered with product leadership on user experience roadmap planning'
    ],
    executive: [
      'Built design organization and culture focused on user-centered innovation',
      'Defined design strategy and vision aligned with business objectives',
      'Established design thinking methodologies and customer research practices',
      'Led design transformation initiatives across the organization'
    ]
  },
  'Financial Analyst': {
    base: [
      'Conducted financial analysis and modeling for {industry} business units',
      'Prepared comprehensive financial reports and presentations for leadership',
      'Analyzed budget variance and provided recommendations for cost optimization',
      'Supported financial planning and forecasting processes'
    ],
    entry: [
      'Prepared financial models and analysis for investment decisions',
      'Assisted with monthly and quarterly financial reporting processes',
      'Conducted competitive analysis and market research for financial planning',
      'Supported budget preparation and variance analysis activities'
    ],
    mid: [
      'Led financial planning and analysis for multiple business units',
      'Developed automated reporting tools and financial dashboards',
      'Managed relationships with external auditors and financial advisors',
      'Identified cost savings opportunities resulting in 15-25% expense reduction'
    ],
    senior: [
      'Directed financial strategy and planning for regional operations',
      'Led finance team of 6-10 analysts and specialists',
      'Established financial controls and reporting frameworks',
      'Supported M&A due diligence and integration activities'
    ],
    executive: [
      'Defined financial strategy and capital allocation framework',
      'Built finance organization to support rapid business growth',
      'Led investor relations and financial communications activities',
      'Partnered with CEO on strategic planning and business development'
    ]
  },
  'Human Resources Manager': {
    base: [
      'Developed and implemented talent acquisition and retention strategies',
      'Managed employee relations and workplace culture initiatives',
      'Designed compensation and benefits programs to attract top talent',
      'Ensured compliance with employment laws and regulations'
    ],
    entry: [
      'Supported recruitment processes and candidate screening activities',
      'Assisted with employee onboarding and training program coordination',
      'Maintained employee records and HR information systems',
      'Participated in employee relations and conflict resolution activities'
    ],
    mid: [
      'Led talent acquisition strategy resulting in 30% reduction in time-to-hire',
      'Implemented performance management and employee development programs',
      'Managed HR operations for 200-500 employee organizations',
      'Developed diversity and inclusion initiatives and training programs'
    ],
    senior: [
      'Defined people strategy and organizational development initiatives',
      'Led HR team of 8-12 specialists across multiple functional areas',
      'Established HR technology stack and process automation',
      'Partnered with leadership on workforce planning and organizational design'
    ],
    executive: [
      'Built people and culture organization to support company growth',
      'Defined talent strategy aligned with business transformation goals',
      'Led organizational change management and culture transformation',
      'Established executive compensation and leadership development programs'
    ]
  },
  'Sales Manager': {
    base: [
      'Developed and executed sales strategies to achieve revenue targets',
      'Managed customer relationships and led complex sales negotiations',
      'Analyzed sales performance metrics and market opportunities',
      'Collaborated with marketing and product teams on go-to-market strategies'
    ],
    entry: [
      'Generated new business leads through prospecting and networking',
      'Conducted product demonstrations and sales presentations to prospects',
      'Maintained CRM system and tracked sales pipeline activities',
      'Supported account management and customer service activities'
    ],
    mid: [
      'Managed key accounts and strategic customer relationships',
      'Led sales team of 5-8 representatives and coordinated territory planning',
      'Developed sales training programs and onboarding processes',
      'Exceeded sales targets by 25-40% through strategic account development'
    ],
    senior: [
      'Defined regional sales strategy and managed multi-state territories',
      'Led sales organization of 15-25 representatives and managers',
      'Established sales processes and performance management systems',
      'Partnered with executive team on revenue planning and market expansion'
    ],
    executive: [
      'Built sales organization and revenue operations to scale business growth',
      'Defined go-to-market strategy for new products and market segments',
      'Led customer success and account management functions',
      'Established strategic partnerships and channel development programs'
    ]
  }
};

// Location pools by region
export const LOCATION_POOLS = {
  major_tech_hubs: ['San Francisco, CA', 'Seattle, WA', 'Austin, TX', 'Boston, MA', 'New York, NY'],
  financial_centers: ['New York, NY', 'Chicago, IL', 'Charlotte, NC', 'San Francisco, CA', 'Boston, MA'],
  healthcare_hubs: ['Boston, MA', 'Houston, TX', 'Minneapolis, MN', 'Cleveland, OH', 'Rochester, MN'],
  manufacturing_centers: ['Detroit, MI', 'Chicago, IL', 'Charlotte, NC', 'Milwaukee, WI', 'Indianapolis, IN'],
  general_business: ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ', 'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'Denver, CO', 'Atlanta, GA', 'Miami, FL']
};

// Achievements by category and level
export const ACHIEVEMENT_TEMPLATES = {
  performance: {
    entry: [
      'Improved team productivity by {15-25}% through process optimization and automation',
      'Exceeded performance targets by {10-20}% for {2-3} consecutive quarters',
      'Reduced operational costs by ${25-75}K through strategic initiatives and efficiency improvements'
    ],
    mid: [
      'Led initiatives that increased revenue by {25-40}% and improved customer satisfaction scores',
      'Implemented solutions that reduced processing time by {30-50}% and eliminated manual errors',
      'Managed projects worth ${500K-2M} and delivered results {15-25}% under budget'
    ],
    senior: [
      'Orchestrated transformation initiatives resulting in {40-60}% improvement in key metrics',
      'Led organization-wide changes that generated ${2M-10M} in additional revenue',
      'Established best practices adopted across {5-10} departments and {100-500} employees'
    ],
    executive: [
      'Drove strategic initiatives that increased company valuation by {50-200}%',
      'Led market expansion resulting in ${50M-500M} in new revenue streams',
      'Transformed business operations reducing costs by ${10M-100M} annually'
    ]
  },
  leadership: {
    entry: [
      'Mentored {2-3} junior team members resulting in {1-2} promotions within the team',
      'Led cross-functional project teams of {5-8} members to deliver successful outcomes',
      'Coordinated with {3-5} departments to ensure alignment on project objectives'
    ],
    mid: [
      'Managed team of {8-15} professionals and achieved {20-30}% improvement in team performance',
      'Led {5-10} major projects simultaneously while maintaining {95%+} on-time delivery rate',
      'Developed {3-8} high-potential employees who were promoted to leadership roles'
    ],
    senior: [
      'Built and scaled teams from {10-20} to {50-100} members across multiple locations',
      'Established leadership development programs that improved retention by {25-40}%',
      'Led organizational restructuring affecting {200-500} employees and {10-20} departments'
    ],
    executive: [
      'Built world-class organizations of {500-2000}+ employees across global markets',
      'Developed executive leadership team and succession planning for C-suite positions',
      'Led cultural transformation initiatives impacting {5000-50000}+ stakeholders'
    ]
  },
  innovation: {
    entry: [
      'Implemented innovative solutions that reduced manual work by {20-40} hours per week',
      'Developed automated processes that improved accuracy by {25-50}% and reduced errors',
      'Introduced new technologies that enhanced team collaboration and productivity'
    ],
    mid: [
      'Launched innovative products/services that captured {15-30}% market share in first year',
      'Designed systems and processes adopted by {5-15} teams across the organization',
      'Led digital transformation projects that modernized legacy systems and workflows'
    ],
    senior: [
      'Pioneered industry-leading practices that were adopted by {10-50} organizations',
      'Developed intellectual property portfolio including {5-20} patents and proprietary methods',
      'Led innovation labs that produced {10-25} new products and service offerings'
    ],
    executive: [
      'Established innovation culture and R&D capabilities that positioned company as market leader',
      'Created new business models that disrupted traditional {industry} practices',
      'Built strategic partnerships that unlocked {$50M-500M} in innovation investments'
    ]
  }
};

export class ExperienceGenerator {
  static generateExperienceSection(
    role: string, 
    level: ExperienceLevel, 
    industry: Industry
  ): ExperienceEntry[] {
    const experienceConfig = {
      entry: { count: 2, yearsPerRole: [1, 2] },
      mid: { count: 3, yearsPerRole: [2, 3, 4] },
      senior: { count: 4, yearsPerRole: [3, 4, 5] },
      executive: { count: 4, yearsPerRole: [4, 5, 6, 7] }
    }[level];

    const companies = INDUSTRY_COMPANIES[industry];
    const locations = this.getRelevantLocations(industry);
    
    const experiences: ExperienceEntry[] = [];
    const currentYear = new Date().getFullYear();
    let currentEndYear = currentYear;
    
    // Track used job title and company combinations to ensure uniqueness
    const usedCombinations = new Set<string>();
    
    // Track used bullet points to ensure uniqueness across all experience entries
    const usedResponsibilities = new Set<string>();
    const usedAchievements = new Set<string>();

    for (let i = 0; i < experienceConfig.count; i++) {
      const isCurrent = i === 0;
      const yearsInRole = experienceConfig.yearsPerRole[
        Math.floor(Math.random() * experienceConfig.yearsPerRole.length)
      ];
      
      const endYear = isCurrent ? currentYear : currentEndYear;
      const startYear = endYear - yearsInRole;
      
      let jobTitle: string;
      let companyName: string;
      let combinationKey: string;
      let attempts = 0;
      const maxAttempts = 50; // Prevent infinite loops
      
      // Generate unique job title and company combination
      do {
        jobTitle = this.generateProgressiveTitle(role, level, i);
        companyName = companies[Math.floor(Math.random() * companies.length)];
        combinationKey = `${jobTitle}|${companyName}`;
        attempts++;
        
        // If we can't find a unique combination after many attempts, 
        // allow the combination but log a warning
        if (attempts >= maxAttempts) {
          console.warn(`Warning: Could not find unique job title/company combination for ${role} in ${industry}. Using: ${jobTitle} at ${companyName}`);
          break;
        }
      } while (usedCombinations.has(combinationKey));
      
      // Add the combination to our tracking set
      usedCombinations.add(combinationKey);
      
      const location = locations[i % locations.length];
      
      const responsibilities = this.generateUniqueResponsibilities(
        role, level, industry, i === 0, usedResponsibilities
      );
      const achievements = this.generateUniqueAchievements(
        role, level, i, usedAchievements
      );

      experiences.push({
        id: (i + 1).toString(),
        jobTitle,
        companyName,
        location,
        startDate: startYear.toString(),
        endDate: isCurrent ? 'Present' : endYear.toString(),
        isCurrent,
        responsibilities,
        achievements
      });

      currentEndYear = startYear - 1; // Gap year for next position
    }

    return experiences;
  }

  private static getRelevantLocations(industry: Industry): string[] {
    const locationMap: Record<Industry, keyof typeof LOCATION_POOLS> = {
      technology: 'major_tech_hubs',
      programming: 'major_tech_hubs',
      finance: 'financial_centers',
      healthcare: 'healthcare_hubs',
      manufacturing: 'manufacturing_centers',
      business: 'general_business',
      marketing: 'general_business',
      education: 'general_business',
      engineering: 'manufacturing_centers',
      legal: 'financial_centers',
      design: 'major_tech_hubs',
      creative: 'general_business',
      hospitality: 'general_business',
      retail: 'general_business',
      nonprofit: 'general_business',
      government: 'general_business',
      other: 'general_business'
    };

    return LOCATION_POOLS[locationMap[industry]];
  }

  private static generateProgressiveTitle(
    currentRole: string, 
    level: ExperienceLevel, 
    positionIndex: number
  ): string {
    if (positionIndex === 0) return currentRole;

    // Extract base role by removing common prefixes and suffixes
    const baseRole = currentRole
      .replace(/^(Senior|Lead|Principal|Chief|Head of|Director of|VP of|Associate|Junior)\s+/i, '')
      .replace(/\s+(Manager|Director|Lead|Specialist|Coordinator|Associate)$/i, '');

    // Seniority prefixes (career progression)
    const seniorityPrefixes = [
      '', 'Associate', 'Junior', 'Staff', 'Principal', 'Lead'
    ];

    // Role suffixes/variations
    const roleSuffixes = [
      '', 'Specialist', 'Coordinator', 'Manager', 'Analyst', 'Consultant', 
      'Associate', 'Representative', 'Executive', 'Advisor'
    ];

    // Domain-specific modifiers that can be combined with roles
    const domainModifiers = [
      'Digital', 'Strategic', 'Technical', 'Operations', 'Business', 'Product',
      'Customer', 'Market', 'Data', 'Systems', 'Process', 'Quality',
      'Regional', 'Global', 'Enterprise', 'Platform', 'Solutions', 'Client'
    ];

    // Generate combinations, ensuring we don't recreate the original title
    const variations: string[] = [];
    
    // Add variations with different seniority levels
    seniorityPrefixes.forEach(prefix => {
      const prefixedRole = prefix ? `${prefix} ${baseRole}` : baseRole;
      if (prefixedRole !== currentRole) {
        variations.push(prefixedRole);
      }
    });

    // Add variations with different suffixes
    roleSuffixes.forEach(suffix => {
      const suffixedRole = suffix ? `${baseRole} ${suffix}` : baseRole;
      if (suffixedRole !== currentRole) {
        variations.push(suffixedRole);
      }
    });

    // Add variations with domain modifiers
    domainModifiers.forEach(modifier => {
      const modifiedRole = `${modifier} ${baseRole}`;
      if (modifiedRole !== currentRole) {
        variations.push(modifiedRole);
      }
    });

    // Add combinations of modifiers with suffixes (for more variety)
    if (variations.length < 10) {
      domainModifiers.slice(0, 5).forEach(modifier => {
        roleSuffixes.slice(0, 3).forEach(suffix => {
          if (suffix) {
            const combinedRole = `${modifier} ${baseRole} ${suffix}`;
            if (combinedRole !== currentRole) {
              variations.push(combinedRole);
            }
          }
        });
      });
    }

    // Add seniority + modifier combinations
    if (variations.length < 15) {
      seniorityPrefixes.slice(0, 3).forEach(prefix => {
        domainModifiers.slice(0, 3).forEach(modifier => {
          if (prefix) {
            const combinedRole = `${prefix} ${modifier} ${baseRole}`;
            if (combinedRole !== currentRole) {
              variations.push(combinedRole);
            }
          }
        });
      });
    }

    // Remove duplicates and filter out the original role
    const uniqueVariations = [...new Set(variations)].filter(v => v !== currentRole);
    
    // Return a random variation
    if (uniqueVariations.length > 0) {
      return uniqueVariations[Math.floor(Math.random() * uniqueVariations.length)];
    }
    
    // Fallback: just modify the original role slightly
    return currentRole.includes('Senior') 
      ? currentRole.replace('Senior ', '') 
      : `Associate ${currentRole}`;
  }

  private static generateUniqueResponsibilities(
    role: string, 
    level: ExperienceLevel, 
    industry: Industry, 
    isCurrent: boolean,
    usedResponsibilities: Set<string>
  ): string[] {
    const allPossibleResponsibilities = this.getAllPossibleResponsibilities(role, level, industry, isCurrent);
    const selectedResponsibilities: string[] = [];
    const targetCount = this.getResponsibilityCount(level);
    
    // Try to select unique responsibilities
    let attempts = 0;
    const maxAttempts = 100;
    
    while (selectedResponsibilities.length < targetCount && attempts < maxAttempts) {
      const candidate = allPossibleResponsibilities[Math.floor(Math.random() * allPossibleResponsibilities.length)];
      
      if (!usedResponsibilities.has(candidate) && !selectedResponsibilities.includes(candidate)) {
        selectedResponsibilities.push(candidate);
        usedResponsibilities.add(candidate);
      }
      attempts++;
    }
    
    // If we couldn't find enough unique responsibilities, generate variations of existing ones
    while (selectedResponsibilities.length < targetCount) {
      const baseResponsibility = allPossibleResponsibilities[Math.floor(Math.random() * allPossibleResponsibilities.length)];
      const variation = this.createResponsibilityVariation(baseResponsibility);
      
      if (!usedResponsibilities.has(variation) && !selectedResponsibilities.includes(variation)) {
        selectedResponsibilities.push(variation);
        usedResponsibilities.add(variation);
      }
    }
    
    return selectedResponsibilities;
  }

  private static getAllPossibleResponsibilities(
    role: string, 
    level: ExperienceLevel, 
    industry: Industry, 
    isCurrent: boolean
  ): string[] {
    const roleKey = this.findRoleKey(role);
    const roleResponsibilities = ROLE_RESPONSIBILITIES[roleKey];
    
    if (!roleResponsibilities) {
      return this.generateGenericResponsibilities(level, industry, role);
    }

    const baseResp = roleResponsibilities.base || [];
    const levelResp = roleResponsibilities[level] || [];
    
    // Combine all responsibilities from base and level-specific
    const allResponsibilities = [...baseResp, ...levelResp];
    const industryContext = this.getIndustryContext(industry);
    
    // Replace placeholders and enhance with varied action verbs
    const processedResponsibilities = allResponsibilities
      .map(resp => resp.replace('{industry}', industryContext));

    // Apply enhanced action verb variation to get more possibilities
    const enhancedResponsibilities = ActionVerbSelector.enhanceResponsibilityContent(
      processedResponsibilities, 
      role
    );

    return enhancedResponsibilities;
  }

  private static createResponsibilityVariation(baseResponsibility: string): string {
    // Simple variations to create unique bullet points
    const variations = [
      baseResponsibility.replace(/Developed/i, 'Created'),
      baseResponsibility.replace(/Managed/i, 'Oversaw'),
      baseResponsibility.replace(/Led/i, 'Directed'),
      baseResponsibility.replace(/Implemented/i, 'Executed'),
      baseResponsibility.replace(/Collaborated/i, 'Partnered'),
      baseResponsibility.replace(/Analyzed/i, 'Evaluated'),
      baseResponsibility.replace(/improved/i, 'enhanced'),
      baseResponsibility.replace(/increased/i, 'boosted'),
      baseResponsibility.replace(/reduced/i, 'decreased'),
      baseResponsibility.replace(/team/i, 'group'),
      baseResponsibility.replace(/projects/i, 'initiatives'),
      baseResponsibility.replace(/processes/i, 'workflows'),
      baseResponsibility.replace(/strategies/i, 'approaches'),
      baseResponsibility.replace(/solutions/i, 'systems')
    ];
    
    // Return a random variation that's different from the original
    const uniqueVariations = variations.filter(v => v !== baseResponsibility);
    return uniqueVariations.length > 0 
      ? uniqueVariations[Math.floor(Math.random() * uniqueVariations.length)]
      : `${baseResponsibility} and related activities`;
  }

  private static generateUniqueAchievements(
    role: string, 
    level: ExperienceLevel, 
    positionIndex: number,
    usedAchievements: Set<string>
  ): string[] {
    const numAchievements = level === 'entry' ? 1 : level === 'mid' ? 2 : 2;
    const selectedAchievements: string[] = [];
    
    // Get all possible achievement templates
    const allAchievements = this.getAllPossibleAchievements(role, level);
    
    let attempts = 0;
    const maxAttempts = 100;
    
    while (selectedAchievements.length < numAchievements && attempts < maxAttempts) {
      const candidate = allAchievements[Math.floor(Math.random() * allAchievements.length)];
      
      if (!usedAchievements.has(candidate) && !selectedAchievements.includes(candidate)) {
        selectedAchievements.push(candidate);
        usedAchievements.add(candidate);
      }
      attempts++;
    }
    
    // If we couldn't find enough unique achievements, create variations
    while (selectedAchievements.length < numAchievements) {
      const baseAchievement = allAchievements[Math.floor(Math.random() * allAchievements.length)];
      const variation = this.createAchievementVariation(baseAchievement);
      
      if (!usedAchievements.has(variation) && !selectedAchievements.includes(variation)) {
        selectedAchievements.push(variation);
        usedAchievements.add(variation);
      }
    }
    
    return selectedAchievements;
  }

  private static getAllPossibleAchievements(role: string, level: ExperienceLevel): string[] {
    // Use the enhanced natural achievement generation to get base achievements
    const baseAchievements = ActionVerbSelector.generateVariedAchievements(role, 10); // Get more options
    
    // Also add templated achievements for more variety
    const categories = ['performance', 'leadership', 'innovation'] as const;
    const templatedAchievements: string[] = [];
    
    categories.forEach(category => {
      const templates = ACHIEVEMENT_TEMPLATES[category][level] || [];
      templates.forEach(template => {
        templatedAchievements.push(this.fillAchievementTemplate(template));
      });
    });
    
    return [...baseAchievements, ...templatedAchievements];
  }

  private static createAchievementVariation(baseAchievement: string): string {
    // Create variations for achievements
    const variations = [
      baseAchievement.replace(/increased/i, 'improved'),
      baseAchievement.replace(/reduced/i, 'minimized'),
      baseAchievement.replace(/led/i, 'spearheaded'),
      baseAchievement.replace(/implemented/i, 'deployed'),
      baseAchievement.replace(/generated/i, 'produced'),
      baseAchievement.replace(/achieved/i, 'accomplished'),
      baseAchievement.replace(/delivered/i, 'provided'),
      baseAchievement.replace(/developed/i, 'established'),
      baseAchievement.replace(/\d+%/, (match) => {
        // Vary percentages slightly
        const num = parseInt(match);
        const variation = num + Math.floor(Math.random() * 10) - 5; // ±5%
        return Math.max(1, variation) + '%';
      })
    ];
    
    const uniqueVariations = variations.filter(v => v !== baseAchievement);
    return uniqueVariations.length > 0 
      ? uniqueVariations[Math.floor(Math.random() * uniqueVariations.length)]
      : `${baseAchievement} through strategic initiatives`;
  }

  // Keep the original method for backward compatibility
  private static generateResponsibilities(
    role: string, 
    level: ExperienceLevel, 
    industry: Industry, 
    isCurrent: boolean
  ): string[] {
    // This method is now just a wrapper that doesn't enforce uniqueness
    const usedResponsibilities = new Set<string>();
    return this.generateUniqueResponsibilities(role, level, industry, isCurrent, usedResponsibilities);
  }

  private static findRoleKey(role: string): string {
    // Find exact match first
    if (ROLE_RESPONSIBILITIES[role]) return role;
    
    // Find partial matches
    const roleKeys = Object.keys(ROLE_RESPONSIBILITIES);
    for (const key of roleKeys) {
      if (role.includes(key) || key.includes(role.replace(/Senior |Lead |Principal |Chief /, ''))) {
        return key;
      }
    }
    
    return 'Software Engineer'; // Default fallback
  }

  private static generateGenericResponsibilities(level: ExperienceLevel, industry: Industry, role?: string): string[] {
    const industryContext = this.getIndustryContext(industry);
    const levelModifiers = this.getLevelModifiers(level);
    
    const genericTemplates = [
      `${levelModifiers.action} strategic initiatives for ${industryContext} business objectives`,
      `Collaborated with ${levelModifiers.teamSize} cross-functional team members on key projects`,
      `Implemented process improvements resulting in ${levelModifiers.impact}% efficiency gains`,
      `Managed stakeholder relationships and delivered results on time and budget`,
      `Analyzed performance metrics and recommended data-driven solutions`
    ];

    const baseResponsibilities = genericTemplates.slice(0, this.getResponsibilityCount(level));
    
    // Apply action verb enhancement even for generic responsibilities
    if (role) {
      return ActionVerbSelector.enhanceResponsibilityContent(baseResponsibilities, role);
    }
    
    return baseResponsibilities;
  }

  private static getIndustryContext(industry: Industry): string {
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

  private static getLevelModifiers(level: ExperienceLevel) {
    const modifiers = {
      entry: { action: 'Supported', teamSize: '3-5', impact: '15-25' },
      mid: { action: 'Led', teamSize: '5-10', impact: '25-40' },
      senior: { action: 'Directed', teamSize: '10-15', impact: '40-60' },
      executive: { action: 'Orchestrated', teamSize: '15+', impact: '60-100' }
    };
    
    return modifiers[level];
  }

  private static getResponsibilityCount(level: ExperienceLevel): number {
    return {
      entry: 3,
      mid: 4,
      senior: 5,
      executive: 5
    }[level];
  }

  private static generateAchievements(role: string, level: ExperienceLevel, positionIndex: number): string[] {
    // This method is now just a wrapper that doesn't enforce uniqueness
    const usedAchievements = new Set<string>();
    return this.generateUniqueAchievements(role, level, positionIndex, usedAchievements);
  }

  private static fillAchievementTemplate(template: string): string {
    return template.replace(/\{([^}]+)\}/g, (match, range) => {
      if (range.includes('-')) {
        const [min, max] = range.split('-').map((s: string) => parseInt(s.replace(/[^0-9]/g, '')));
        const value = Math.floor(Math.random() * (max - min + 1)) + min;
        return range.includes('K') ? `${value}K` :
               range.includes('M') ? `${value}M` :
               value.toString();
      }
      return range;
    });
  }
}