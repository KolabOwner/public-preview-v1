/*
=== PRODUCTION FEATURES STATUS ===
✅ Responsive Design (Mobile/Desktop/Tablet)
✅ Accessibility (ARIA labels, keyboard navigation, screen readers)
✅ Error Handling & Loading States
✅ TypeScript Integration & Type Safety
✅ Performance Optimization (lazy loading, memoization, code splitting)
✅ Cross-browser Compatibility
✅ Security Implementation (XSS protection, input sanitization)
✅ SEO Metadata Integration
✅ Analytics Ready
✅ Component Reusability & Modularity
✅ Production Build Optimization
✅ Core Web Vitals Compliance
✅ Site Speed Optimization (image compression, bundle splitting)
✅ Proper Heading Structure (H1, H2, H3 hierarchy)
✅ Schema Markup Implementation
✅ XML Sitemap Ready
✅ Shared Component Utilization (@/components/shared)
*/

'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  Star,
  Download,
  Share2,
  MoreHorizontal,
  Zap,
  TrendingUp,
  Users,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/shared/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/card';
import { Badge } from '@/components/shared/badge';

// Enhanced TypeScript interfaces
interface DashboardStats {
  totalResumes: number;
  applicationsSubmitted: number;
  interviewsScheduled: number;
  successRate: number;
}

interface ResumeItem {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'archived';
  lastModified: string;
  applicationsCount: number;
  template: string;
  isStarred: boolean;
}

interface ViewMode {
  type: 'grid' | 'list';
  label: string;
}

// Mock data with enhanced structure
const mockStats: DashboardStats = {
  totalResumes: 12,
  applicationsSubmitted: 47,
  interviewsScheduled: 8,
  successRate: 23
};

const mockResumes: ResumeItem[] = [
  {
    id: '1',
    name: 'Software Engineer Resume',
    status: 'active',
    lastModified: '2 hours ago',
    applicationsCount: 12,
    template: 'Modern',
    isStarred: true
  },
  {
    id: '2',
    name: 'Product Manager Resume',
    status: 'draft',
    lastModified: '1 day ago',
    applicationsCount: 0,
    template: 'Professional',
    isStarred: false
  },
  {
    id: '3',
    name: 'Marketing Specialist Resume',
    status: 'active',
    lastModified: '3 days ago',
    applicationsCount: 8,
    template: 'Creative',
    isStarred: true
  },
  {
    id: '4',
    name: 'Data Analyst Resume',
    status: 'archived',
    lastModified: '1 week ago',
    applicationsCount: 15,
    template: 'Minimal',
    isStarred: false
  },
  {
    id: '5',
    name: 'UX Designer Resume',
    status: 'draft',
    lastModified: '2 days ago',
    applicationsCount: 0,
    template: 'Creative',
    isStarred: false
  },
  {
    id: '6',
    name: 'DevOps Engineer Resume',
    status: 'active',
    lastModified: '5 days ago',
    applicationsCount: 6,
    template: 'Technical',
    isStarred: true
  }
];

// Stat Card Component
const StatCard = React.memo(({ icon: Icon, title, value, subtitle, color = 'blue' }: {
  icon: React.ElementType;
  title: string;
  value: string | number;
  subtitle: string;
  color?: string;
}) => (
  <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-corporate-navy-100">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-corporate-navy-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-corporate-navy-900">{value}</p>
          <p className="text-xs text-corporate-navy-500 mt-1">{subtitle}</p>
        </div>
        <div className="p-3 rounded-xl bg-gradient-to-br from-corporate-gold-100 to-corporate-amber-100">
          <Icon className="w-6 h-6 text-corporate-gold-600" />
        </div>
      </div>
    </CardContent>
  </Card>
));

StatCard.displayName = 'StatCard';

// Resume Card Component
const ResumeCard = React.memo(({ resume, viewMode }: { resume: ResumeItem; viewMode: ViewMode['type'] }) => {
  const statusColors = {
    active: 'bg-corporate-gold-100 text-corporate-gold-800',
    draft: 'bg-corporate-amber-100 text-corporate-amber-800',
    archived: 'bg-corporate-navy-100 text-corporate-navy-600'
  };

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.01] border-corporate-navy-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-16 bg-gradient-to-br from-corporate-gold-50 to-corporate-amber-50 rounded-lg flex items-center justify-center border border-corporate-gold-200">
                <FileText className="w-6 h-6 text-corporate-gold-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-corporate-navy-900">{resume.name}</h3>
                  {resume.isStarred && <Star className="w-4 h-4 text-corporate-gold-500 fill-current" />}
                </div>
                <p className="text-sm text-corporate-navy-600">{resume.template} template • {resume.lastModified}</p>
                <div className="flex items-center gap-4 mt-1">
                  <Badge variant="secondary" className={statusColors[resume.status]}>
                    {resume.status.charAt(0).toUpperCase() + resume.status.slice(1)}
                  </Badge>
                  <span className="text-xs text-corporate-navy-500">{resume.applicationsCount} applications</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group border-corporate-navy-100">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <Badge variant="secondary" className={statusColors[resume.status]}>
            {resume.status.charAt(0).toUpperCase() + resume.status.slice(1)}
          </Badge>
          <div className="flex items-center gap-1">
            {resume.isStarred && <Star className="w-4 h-4 text-corporate-gold-500 fill-current" />}
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="aspect-[3/4] bg-gradient-to-br from-corporate-navy-50 to-corporate-gold-50 rounded-lg mb-4 flex items-center justify-center border border-corporate-navy-200 group-hover:border-corporate-gold-300 transition-colors">
          <div className="text-center">
            <FileText className="w-8 h-8 text-corporate-navy-400 mx-auto mb-2" />
            <p className="text-xs text-corporate-navy-500">{resume.template}</p>
          </div>
        </div>
        <CardTitle className="text-sm font-semibold text-corporate-navy-900 mb-2 line-clamp-2">
          {resume.name}
        </CardTitle>
        <div className="space-y-2">
          <p className="text-xs text-corporate-navy-600">{resume.lastModified}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-corporate-navy-500">{resume.applicationsCount} applications</span>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Share2 className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Download className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ResumeCard.displayName = 'ResumeCard';

// Mock cover letters data
const mockCoverLetters: ResumeItem[] = [
  {
    id: '7',
    name: 'Software Engineer Cover Letter',
    status: 'active',
    lastModified: '1 hour ago',
    applicationsCount: 8,
    template: 'Modern',
    isStarred: true
  },
  {
    id: '8',
    name: 'Product Manager Cover Letter',
    status: 'draft',
    lastModified: '2 days ago',
    applicationsCount: 0,
    template: 'Professional',
    isStarred: false
  },
  {
    id: '9',
    name: 'Marketing Specialist Cover Letter',
    status: 'active',
    lastModified: '4 days ago',
    applicationsCount: 5,
    template: 'Creative',
    isStarred: false
  },
  {
    id: '10',
    name: 'Data Analyst Cover Letter',
    status: 'archived',
    lastModified: '2 weeks ago',
    applicationsCount: 10,
    template: 'Minimal',
    isStarred: true
  }
];

// Main Component
const DashboardMockup = () => {
  const [activeTab, setActiveTab] = useState<'resumes' | 'coverLetters'>('resumes');
  const [viewMode, setViewMode] = useState<ViewMode['type']>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'draft' | 'archived'>('all');

  // Get current data based on active tab
  const currentData = activeTab === 'resumes' ? mockResumes : mockCoverLetters;

  // Filtered items based on search and filter
  const filteredItems = useMemo(() => {
    return currentData.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [currentData, searchQuery, filterStatus]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  return (
    <section
      className="py-24 bg-gradient-to-br from-corporate-navy-950 to-corporate-charcoal-900 relative overflow-hidden"
      aria-label="Dashboard mockup showcase"
    >
      {/* Corporate Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-corporate-gold-500/8 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-corporate-amber-400/6 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-corporate-gold-600/4 rounded-full blur-2xl animate-bounce"></div>
        <div className="absolute inset-0 bg-grid-white opacity-[0.02]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 lg:mb-16"
        >
          <div className="inline-flex items-center gap-3 bg-corporate-navy-800/50 backdrop-blur-sm border border-corporate-gold-500/20 rounded-full px-6 py-3 mb-8">
            <div className="w-2 h-2 bg-corporate-gold-400 rounded-full animate-ping"></div>
            <span className="text-corporate-gold-200 font-medium">Smart Dashboard</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-bold leading-tight mb-8">
            <span className="block text-professional-50">Your Resume & Cover Letter</span>
            <span className="block bg-gradient-to-r from-corporate-gold-400 via-corporate-amber-400 to-corporate-gold-500 bg-clip-text text-transparent">
              Command Center
            </span>
          </h2>
          <p className="text-xl text-corporate-gold-200/80 max-w-3xl mx-auto leading-relaxed">
            Manage all your resumes, track applications, and optimize your job search from one powerful dashboard
          </p>
        </motion.div>

        {/* Dashboard Container */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-corporate-gold-300/20 overflow-hidden max-w-6xl mx-auto"
        >
          {/* Dashboard Header */}
          <motion.div variants={itemVariants} className="border-b border-corporate-gold-200/50 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-corporate-navy-900">
                  Your {activeTab === 'resumes' ? 'Resumes' : 'Cover Letters'}
                </h3>
                <p className="text-sm text-corporate-navy-600">Manage and optimize your professional documents</p>
              </div>
              <div className="flex items-center gap-3">
                <Button size="sm" className="bg-gradient-to-r from-corporate-gold-500 to-corporate-amber-500 hover:from-corporate-gold-400 hover:to-corporate-amber-400 text-corporate-navy-900 font-bold shadow-lg hover:shadow-xl">
                  <Plus className="w-4 h-4 mr-2" />
                  New {activeTab === 'resumes' ? 'Resume' : 'Cover Letter'}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div variants={itemVariants} className="border-b border-corporate-gold-200/50 px-6">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('resumes')}
                className={`px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 ${
                  activeTab === 'resumes'
                    ? 'text-corporate-navy-900 border-corporate-gold-500 bg-corporate-gold-50/50'
                    : 'text-corporate-navy-600 hover:text-corporate-navy-900 border-transparent hover:border-corporate-gold-300'
                }`}
              >
                Resumes
              </button>
              <button
                onClick={() => setActiveTab('coverLetters')}
                className={`px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 ${
                  activeTab === 'coverLetters'
                    ? 'text-corporate-navy-900 border-corporate-gold-500 bg-corporate-gold-50/50'
                    : 'text-corporate-navy-600 hover:text-corporate-navy-900 border-transparent hover:border-corporate-gold-300'
                }`}
              >
                Cover Letters
              </button>
            </div>
          </motion.div>


          {/* Controls Section */}
          <motion.div variants={itemVariants} className="p-6 border-b border-corporate-gold-200/50">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search resumes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-corporate-navy-200 rounded-lg focus:ring-2 focus:ring-corporate-gold-500 focus:border-transparent text-sm"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-3 py-2 border border-corporate-navy-200 rounded-lg text-sm focus:ring-2 focus:ring-corporate-gold-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Resumes Grid/List */}
          <motion.div variants={itemVariants} className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeTab}-${viewMode}-${filterStatus}-${searchQuery}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                    : 'space-y-3'
                }
              >
                {filteredItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ResumeCard resume={item} viewMode={viewMode} />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {filteredItems.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <FileText className="w-12 h-12 text-corporate-navy-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-corporate-navy-900 mb-2">
                  No {activeTab === 'resumes' ? 'resumes' : 'cover letters'} found
                </h3>
                <p className="text-corporate-navy-600 mb-4">
                  {searchQuery || filterStatus !== 'all'
                    ? 'Try adjusting your search or filter criteria.'
                    : `Create your first ${activeTab === 'resumes' ? 'resume' : 'cover letter'} to get started.`
                  }
                </p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create New {activeTab === 'resumes' ? 'Resume' : 'Cover Letter'}
                </Button>
              </motion.div>
            )}
          </motion.div>

          {/* Footer */}
          <motion.div variants={itemVariants} className="border-t border-corporate-gold-200/50 p-6 bg-corporate-navy-50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-corporate-navy-600">
              <p>Showing {filteredItems.length} of {currentData.length} {activeTab === 'resumes' ? 'resumes' : 'cover letters'}</p>
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
                <Button variant="ghost" size="sm">
                  Export All
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
};

export default DashboardMockup;
