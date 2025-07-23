'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Filter, Star, Clock, TrendingUp, Users } from 'lucide-react';

type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'executive';
type SortOption = 'popular' | 'newest' | 'alphabetical';

interface ResumeExample {
  id: string;
  title: string;
  category: string;
  experienceLevel: ExperienceLevel;
  description: string;
  keywords: string[];
  popularity: number;
  dateAdded: string;
  href: string;
  image: string;
  featured?: boolean;
}

const resumeExamples: ResumeExample[] = [
  // Popular & Featured
  { id: '1', title: 'Account Executive', category: 'business', experienceLevel: 'mid', description: 'Drive sales growth and build client relationships with proven strategies and KPIs.', keywords: ['sales', 'CRM', 'client management', 'revenue growth'], popularity: 95, dateAdded: '2024-01-15', href: '/resume-examples/account-executive', image: '/api/placeholder/400/300', featured: true },
  { id: '2', title: 'Software Engineer', category: 'programming', experienceLevel: 'mid', description: 'Full-stack development with modern frameworks and scalable architecture design.', keywords: ['JavaScript', 'React', 'Node.js', 'AWS', 'databases'], popularity: 92, dateAdded: '2024-01-10', href: '/resume-examples/software-engineer', image: '/api/placeholder/400/300', featured: true },
  { id: '3', title: 'Data Scientist', category: 'programming', experienceLevel: 'entry', description: 'Machine learning and analytics to derive insights from complex datasets.', keywords: ['Python', 'machine learning', 'SQL', 'statistics', 'visualization'], popularity: 88, dateAdded: '2024-01-12', href: '/resume-examples/data-scientist', image: '/api/placeholder/400/300', featured: true },
  { id: '4', title: 'Product Manager', category: 'business', experienceLevel: 'senior', description: 'Lead product strategy and cross-functional teams to deliver user-centric solutions.', keywords: ['product strategy', 'agile', 'user research', 'roadmapping'], popularity: 85, dateAdded: '2024-01-08', href: '/resume-examples/product-manager', image: '/api/placeholder/400/300', featured: true },
  
  // Programming
  { id: '5', title: 'Full Stack Developer', category: 'programming', experienceLevel: 'mid', description: 'End-to-end web development with modern JavaScript frameworks and cloud deployment.', keywords: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'Docker'], popularity: 82, dateAdded: '2024-01-05', href: '/resume-examples/full-stack-developer', image: '/api/placeholder/400/300' },
  { id: '6', title: 'DevOps Engineer', category: 'programming', experienceLevel: 'senior', description: 'Infrastructure automation and CI/CD pipeline optimization for scalable applications.', keywords: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'Jenkins'], popularity: 79, dateAdded: '2024-01-03', href: '/resume-examples/devops-engineer', image: '/api/placeholder/400/300' },
  { id: '7', title: 'Mobile Developer', category: 'programming', experienceLevel: 'mid', description: 'Native and cross-platform mobile app development with excellent user experience.', keywords: ['React Native', 'Swift', 'Kotlin', 'mobile UI', 'app store'], popularity: 76, dateAdded: '2024-01-01', href: '/resume-examples/mobile-developer', image: '/api/placeholder/400/300' },
  { id: '8', title: 'Backend Engineer', category: 'programming', experienceLevel: 'senior', description: 'Scalable server-side architecture and API development with microservices.', keywords: ['Java', 'Spring Boot', 'microservices', 'REST API', 'database design'], popularity: 74, dateAdded: '2023-12-28', href: '/resume-examples/backend-engineer', image: '/api/placeholder/400/300' },
  
  // Marketing
  { id: '9', title: 'Digital Marketing Manager', category: 'marketing', experienceLevel: 'mid', description: 'Drive online growth through SEO, SEM, and multi-channel marketing campaigns.', keywords: ['SEO', 'Google Ads', 'analytics', 'content marketing', 'conversion optimization'], popularity: 71, dateAdded: '2023-12-25', href: '/resume-examples/digital-marketing-manager', image: '/api/placeholder/400/300' },
  { id: '10', title: 'Content Marketing Specialist', category: 'marketing', experienceLevel: 'entry', description: 'Create engaging content that drives brand awareness and customer engagement.', keywords: ['content creation', 'social media', 'SEO writing', 'brand storytelling'], popularity: 68, dateAdded: '2023-12-20', href: '/resume-examples/content-marketing-specialist', image: '/api/placeholder/400/300' },
  { id: '11', title: 'Growth Marketing Lead', category: 'marketing', experienceLevel: 'senior', description: 'Implement data-driven growth strategies and optimize customer acquisition funnels.', keywords: ['growth hacking', 'A/B testing', 'funnel optimization', 'user acquisition'], popularity: 65, dateAdded: '2023-12-18', href: '/resume-examples/growth-marketing-lead', image: '/api/placeholder/400/300' },
  { id: '12', title: 'Brand Manager', category: 'marketing', experienceLevel: 'mid', description: 'Develop and execute brand strategy to increase market share and customer loyalty.', keywords: ['brand strategy', 'market research', 'campaign management', 'brand positioning'], popularity: 62, dateAdded: '2023-12-15', href: '/resume-examples/brand-manager', image: '/api/placeholder/400/300' },
  
  // Engineering
  { id: '13', title: 'Mechanical Engineer', category: 'engineering', experienceLevel: 'mid', description: 'Design and develop mechanical systems with CAD software and engineering principles.', keywords: ['CAD', 'SolidWorks', 'manufacturing', 'product design', 'project management'], popularity: 59, dateAdded: '2023-12-12', href: '/resume-examples/mechanical-engineer', image: '/api/placeholder/400/300' },
  { id: '14', title: 'Civil Engineer', category: 'engineering', experienceLevel: 'senior', description: 'Infrastructure planning and construction project management with regulatory compliance.', keywords: ['AutoCAD', 'project management', 'construction', 'regulations', 'structural design'], popularity: 56, dateAdded: '2023-12-10', href: '/resume-examples/civil-engineer', image: '/api/placeholder/400/300' },
  { id: '15', title: 'Electrical Engineer', category: 'engineering', experienceLevel: 'mid', description: 'Electrical system design and power distribution with safety and efficiency focus.', keywords: ['circuit design', 'power systems', 'electrical safety', 'MATLAB', 'PLC programming'], popularity: 53, dateAdded: '2023-12-08', href: '/resume-examples/electrical-engineer', image: '/api/placeholder/400/300' },
  { id: '16', title: 'Aerospace Engineer', category: 'engineering', experienceLevel: 'senior', description: 'Aircraft and spacecraft design with advanced materials and aerodynamic optimization.', keywords: ['aerodynamics', 'CATIA', 'flight testing', 'materials science', 'systems engineering'], popularity: 50, dateAdded: '2023-12-05', href: '/resume-examples/aerospace-engineer', image: '/api/placeholder/400/300' },
  
  // Business
  { id: '17', title: 'Business Analyst', category: 'business', experienceLevel: 'entry', description: 'Analyze business processes and recommend data-driven improvements for efficiency.', keywords: ['process analysis', 'requirements gathering', 'SQL', 'business intelligence', 'stakeholder management'], popularity: 72, dateAdded: '2023-12-03', href: '/resume-examples/business-analyst', image: '/api/placeholder/400/300' },
  { id: '18', title: 'Management Consultant', category: 'business', experienceLevel: 'senior', description: 'Strategic advisory services to optimize operations and drive organizational transformation.', keywords: ['strategy consulting', 'change management', 'process improvement', 'stakeholder engagement'], popularity: 69, dateAdded: '2023-12-01', href: '/resume-examples/management-consultant', image: '/api/placeholder/400/300' },
  { id: '19', title: 'Project Manager', category: 'business', experienceLevel: 'mid', description: 'Lead cross-functional teams to deliver projects on time and within budget using agile methods.', keywords: ['project management', 'agile', 'scrum', 'team leadership', 'risk management'], popularity: 66, dateAdded: '2023-11-28', href: '/resume-examples/project-manager', image: '/api/placeholder/400/300' },
  { id: '20', title: 'Operations Manager', category: 'business', experienceLevel: 'senior', description: 'Optimize operational processes and manage teams to achieve business objectives.', keywords: ['operations management', 'process optimization', 'team leadership', 'KPI management'], popularity: 63, dateAdded: '2023-11-25', href: '/resume-examples/operations-manager', image: '/api/placeholder/400/300' },
  
  // Finance
  { id: '21', title: 'Financial Analyst', category: 'finance', experienceLevel: 'entry', description: 'Financial modeling and analysis to support strategic business decisions and investments.', keywords: ['financial modeling', 'Excel', 'valuation', 'forecasting', 'financial reporting'], popularity: 60, dateAdded: '2023-11-22', href: '/resume-examples/financial-analyst', image: '/api/placeholder/400/300' },
  { id: '22', title: 'Investment Banker', category: 'finance', experienceLevel: 'mid', description: 'Manage M&A transactions and capital raising with sophisticated financial analysis.', keywords: ['M&A', 'financial modeling', 'due diligence', 'client management', 'capital markets'], popularity: 57, dateAdded: '2023-11-20', href: '/resume-examples/investment-banker', image: '/api/placeholder/400/300' },
  { id: '23', title: 'Accountant', category: 'finance', experienceLevel: 'mid', description: 'Ensure accurate financial reporting and compliance with accounting standards and regulations.', keywords: ['GAAP', 'financial reporting', 'tax preparation', 'auditing', 'QuickBooks'], popularity: 54, dateAdded: '2023-11-18', href: '/resume-examples/accountant', image: '/api/placeholder/400/300' },
  { id: '24', title: 'Financial Planner', category: 'finance', experienceLevel: 'senior', description: 'Provide comprehensive financial planning and investment advice to help clients achieve goals.', keywords: ['financial planning', 'investment advisory', 'retirement planning', 'risk assessment'], popularity: 51, dateAdded: '2023-11-15', href: '/resume-examples/financial-planner', image: '/api/placeholder/400/300' },
  
  // Design
  { id: '25', title: 'UX Designer', category: 'design', experienceLevel: 'mid', description: 'Design user-centered digital experiences with research-driven design decisions.', keywords: ['user research', 'wireframing', 'prototyping', 'usability testing', 'Figma'], popularity: 77, dateAdded: '2023-11-12', href: '/resume-examples/ux-designer', image: '/api/placeholder/400/300' },
  { id: '26', title: 'Product Designer', category: 'design', experienceLevel: 'senior', description: 'Lead design strategy and create innovative product experiences from concept to launch.', keywords: ['product design', 'design systems', 'user experience', 'design thinking', 'cross-functional collaboration'], popularity: 73, dateAdded: '2023-11-10', href: '/resume-examples/product-designer', image: '/api/placeholder/400/300' },
  { id: '27', title: 'Graphic Designer', category: 'design', experienceLevel: 'entry', description: 'Create visually compelling designs for print and digital media across multiple channels.', keywords: ['Adobe Creative Suite', 'branding', 'print design', 'digital design', 'typography'], popularity: 58, dateAdded: '2023-11-08', href: '/resume-examples/graphic-designer', image: '/api/placeholder/400/300' },
  { id: '28', title: 'UI Designer', category: 'design', experienceLevel: 'mid', description: 'Design intuitive and visually appealing user interfaces for web and mobile applications.', keywords: ['interface design', 'visual design', 'design systems', 'responsive design', 'accessibility'], popularity: 55, dateAdded: '2023-11-05', href: '/resume-examples/ui-designer', image: '/api/placeholder/400/300' },
  
  // Legal
  { id: '29', title: 'Corporate Attorney', category: 'legal', experienceLevel: 'senior', description: 'Provide legal counsel on corporate transactions, compliance, and regulatory matters.', keywords: ['corporate law', 'M&A', 'contract negotiation', 'regulatory compliance', 'legal research'], popularity: 48, dateAdded: '2023-11-03', href: '/resume-examples/corporate-attorney', image: '/api/placeholder/400/300' },
  { id: '30', title: 'Paralegal', category: 'legal', experienceLevel: 'entry', description: 'Support attorneys with legal research, document preparation, and case management.', keywords: ['legal research', 'document preparation', 'case management', 'litigation support'], popularity: 45, dateAdded: '2023-11-01', href: '/resume-examples/paralegal', image: '/api/placeholder/400/300' },
  { id: '31', title: 'Legal Assistant', category: 'legal', experienceLevel: 'entry', description: 'Provide administrative support to legal teams with document management and client communication.', keywords: ['legal administration', 'document management', 'client communication', 'scheduling'], popularity: 42, dateAdded: '2023-10-28', href: '/resume-examples/legal-assistant', image: '/api/placeholder/400/300' },
  { id: '32', title: 'Litigation Attorney', category: 'legal', experienceLevel: 'mid', description: 'Represent clients in legal disputes with strong advocacy and case preparation skills.', keywords: ['litigation', 'trial advocacy', 'legal writing', 'case strategy', 'client representation'], popularity: 39, dateAdded: '2023-10-25', href: '/resume-examples/litigation-attorney', image: '/api/placeholder/400/300' },
  
  // Medical
  { id: '33', title: 'Registered Nurse', category: 'medical', experienceLevel: 'mid', description: 'Provide comprehensive patient care with clinical expertise and compassionate bedside manner.', keywords: ['patient care', 'clinical skills', 'medication administration', 'patient education', 'EMR'], popularity: 67, dateAdded: '2023-10-22', href: '/resume-examples/registered-nurse', image: '/api/placeholder/400/300' },
  { id: '34', title: 'Physician', category: 'medical', experienceLevel: 'senior', description: 'Diagnose and treat patients with evidence-based medicine and excellent clinical judgment.', keywords: ['clinical diagnosis', 'patient treatment', 'medical procedures', 'clinical research', 'interdisciplinary collaboration'], popularity: 64, dateAdded: '2023-10-20', href: '/resume-examples/physician', image: '/api/placeholder/400/300' },
  { id: '35', title: 'Medical Assistant', category: 'medical', experienceLevel: 'entry', description: 'Support healthcare providers with patient care, administrative tasks, and clinical procedures.', keywords: ['patient care', 'medical procedures', 'administrative support', 'EHR', 'vital signs'], popularity: 52, dateAdded: '2023-10-18', href: '/resume-examples/medical-assistant', image: '/api/placeholder/400/300' },
  { id: '36', title: 'Pharmacist', category: 'medical', experienceLevel: 'senior', description: 'Dispense medications and provide pharmaceutical care with drug therapy expertise.', keywords: ['pharmaceutical care', 'medication therapy', 'drug interactions', 'patient counseling', 'pharmacy management'], popularity: 49, dateAdded: '2023-10-15', href: '/resume-examples/pharmacist', image: '/api/placeholder/400/300' }
];

const categories = [
  { id: 'all', label: 'All', icon: TrendingUp },
  { id: 'featured', label: 'Featured', icon: Star },
  { id: 'programming', label: 'Programming', icon: Users },
  { id: 'business', label: 'Business', icon: Users },
  { id: 'design', label: 'Design', icon: Users },
  { id: 'marketing', label: 'Marketing', icon: Users },
  { id: 'engineering', label: 'Engineering', icon: Users },
  { id: 'finance', label: 'Finance', icon: Users },
  { id: 'legal', label: 'Legal', icon: Users },
  { id: 'medical', label: 'Medical', icon: Users },
];

const experienceLevels = [
  { id: 'all', label: 'All Levels' },
  { id: 'entry', label: 'Entry Level' },
  { id: 'mid', label: 'Mid Level' },
  { id: 'senior', label: 'Senior Level' },
  { id: 'executive', label: 'Executive' },
];

const sortOptions = [
  { id: 'popular', label: 'Most Popular', icon: TrendingUp },
  { id: 'newest', label: 'Newest', icon: Clock },
  { id: 'alphabetical', label: 'A-Z', icon: Filter },
];

const ExampleCard = ({ example }: { example: ResumeExample }) => (
  <Link href={example.href} className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-blue-300 transition-all duration-300">
    <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-20 mx-auto mb-2 bg-white border border-gray-200 rounded shadow-sm flex items-center justify-center group-hover:shadow-md transition-shadow">
            <div className="text-xs text-gray-400">Resume</div>
          </div>
          <div className="text-xs text-gray-500">Preview</div>
        </div>
      </div>
      {example.featured && (
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Star className="w-3 h-3 mr-1 fill-current" />
            Featured
          </span>
        </div>
      )}
      <div className="absolute top-3 left-3">
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-700 capitalize">
          {example.experienceLevel}
        </span>
      </div>
    </div>
    <div className="p-5">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-lg">
          {example.title}
        </h3>
        <div className="flex items-center text-xs text-gray-500 ml-2">
          <TrendingUp className="w-3 h-3 mr-1" />
          {example.popularity}
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {example.description}
      </p>
      <div className="flex flex-wrap gap-1">
        {example.keywords.slice(0, 3).map((keyword, index) => (
          <span key={index} className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-md">
            {keyword}
          </span>
        ))}
        {example.keywords.length > 3 && (
          <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-md">
            +{example.keywords.length - 3}
          </span>
        )}
      </div>
    </div>
  </Link>
);

export default function ResumeExamplesPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [experienceLevel, setExperienceLevel] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredAndSortedExamples = useMemo(() => {
    let filtered = resumeExamples;

    // Category filter
    if (activeCategory === 'featured') {
      filtered = filtered.filter(example => example.featured);
    } else if (activeCategory !== 'all') {
      filtered = filtered.filter(example => example.category === activeCategory);
    }

    // Experience level filter
    if (experienceLevel !== 'all') {
      filtered = filtered.filter(example => example.experienceLevel === experienceLevel);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(example => 
        example.title.toLowerCase().includes(query) ||
        example.description.toLowerCase().includes(query) ||
        example.keywords.some(keyword => keyword.toLowerCase().includes(query))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.popularity - a.popularity;
        case 'newest':
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [activeCategory, experienceLevel, sortBy, searchQuery]);

  const resultsCount = filteredAndSortedExamples.length;
  const totalCount = resumeExamples.length;

  return (
    <>
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {totalCount}+ Resume Examples for All Jobs
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-4xl mx-auto">
              Discover proven resume formats, keywords, and achievements from real professionals.
              Find examples tailored to your industry and experience level to land your dream job in 2024.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/ai-resume-builder"
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-blue-600 bg-white hover:bg-gray-50 transition-colors"
              >
                Create your resume now
              </Link>
              <div className="text-sm text-blue-100">
                ✨ AI-powered • Professional templates • ATS-friendly
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Search Bar */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search resume examples by job title, skills, or keywords..."
              className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>

          {/* Filter Toggles */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Category Tabs */}
            <div className="flex space-x-2 overflow-x-auto pb-2 lg:pb-0">
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`whitespace-nowrap inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      activeCategory === category.id
                        ? 'text-blue-600 bg-blue-50 border border-blue-200'
                        : 'text-gray-700 bg-white border border-gray-200 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 mr-2" />
                    {category.label}
                  </button>
                );
              })}
            </div>

            {/* Filters and Sort */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </button>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Level
                  </label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {experienceLevels.map((level) => (
                      <option key={level.id} value={level.id}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setActiveCategory('all');
                      setExperienceLevel('all');
                      setSearchQuery('');
                      setSortBy('popular');
                    }}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 underline"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {resultsCount} of {totalCount} resume examples
            {searchQuery && ` for "${searchQuery}"`}
            {activeCategory !== 'all' && ` in ${categories.find(c => c.id === activeCategory)?.label}`}
            {experienceLevel !== 'all' && ` • ${experienceLevels.find(l => l.id === experienceLevel)?.label}`}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {resultsCount === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
              <Search className="h-full w-full" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No resume examples found</h3>
            <p className="text-gray-500 mb-6">
              Try adjusting your search terms or filters to find more results.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
                setExperienceLevel('all');
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            {/* Category Description */}
            {activeCategory !== 'all' && (
              <div className="mb-12 text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {activeCategory === 'featured' ? 'Featured Resume Examples' :
                   activeCategory === 'programming' ? 'Programming & Tech Resume Examples' :
                   activeCategory === 'business' ? 'Business & Management Resume Examples' :
                   activeCategory === 'design' ? 'Design & Creative Resume Examples' :
                   activeCategory === 'marketing' ? 'Marketing & Sales Resume Examples' :
                   activeCategory === 'engineering' ? 'Engineering Resume Examples' :
                   activeCategory === 'finance' ? 'Finance & Accounting Resume Examples' :
                   activeCategory === 'legal' ? 'Legal Resume Examples' :
                   activeCategory === 'medical' ? 'Healthcare & Medical Resume Examples' :
                   'Resume Examples'}
                </h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  {activeCategory === 'featured' && "Hand-picked resume examples that consistently deliver results for job seekers."}
                  {activeCategory === 'programming' && "Technical resumes showcasing coding skills, frameworks, and development experience that appeal to hiring managers."}
                  {activeCategory === 'business' && "Strategic and analytical resumes that demonstrate leadership, problem-solving, and business impact."}
                  {activeCategory === 'design' && "Creative resumes highlighting design thinking, user experience expertise, and visual problem-solving skills."}
                  {activeCategory === 'marketing' && "Results-driven resumes showcasing campaign success, brand growth, and customer acquisition strategies."}
                  {activeCategory === 'engineering' && "Technical engineering resumes emphasizing project management, problem-solving, and technical expertise."}
                  {activeCategory === 'finance' && "Analytical resumes demonstrating financial expertise, risk management, and quantitative analysis skills."}
                  {activeCategory === 'legal' && "Professional legal resumes showcasing advocacy skills, legal research, and case management experience."}
                  {activeCategory === 'medical' && "Healthcare resumes highlighting patient care, clinical skills, and medical expertise across specialties."}
                </p>
              </div>
            )}

            {/* Resume Examples Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredAndSortedExamples.map((example) => (
                <ExampleCard key={example.id} example={example} />
              ))}
            </div>

            {/* Load More or Pagination could go here */}
            {resultsCount > 20 && (
              <div className="text-center mt-12">
                <p className="text-gray-600 mb-4">
                  Showing first 20 results. Use filters to refine your search.
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Call to Action */}
      <section className="bg-white border-t border-gray-200 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to create your standout resume?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join over 3 million professionals who trust Kolab AI to build resumes that get interviews.
            Our AI-powered builder uses insights from these examples to create your perfect resume.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/ai-resume-builder"
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Build My Resume with AI
            </Link>
            <Link
              href="/resume-templates"
              className="inline-flex items-center px-8 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Browse Templates
            </Link>
          </div>
          <div className="mt-6 flex justify-center items-center gap-8 text-sm text-gray-500">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 mr-1" />
              4.9/5 rating
            </div>
            <div>ATS-friendly</div>
            <div>Professional designs</div>
          </div>
        </div>
      </section>
    </>
  );
}

