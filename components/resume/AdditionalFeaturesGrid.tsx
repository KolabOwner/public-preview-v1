import React from 'react';
import { 
  Link, 
  Palette, 
  Target, 
  FileText, 
  BarChart, 
  LogOut,
  PenTool,
  FolderOpen,
  Video,
  Type,
  Download,
  Settings,
  Star,
  Edit3,
  Grid,
  Lightbulb,
  BookOpen,
  UserCheck,
  MessageSquare,
  Library
} from 'lucide-react';

interface Feature {
  title: string;
  icon: React.ReactNode;
  description: string;
  isNew?: boolean;
  isPremium?: boolean;
}

const features: Feature[] = [
  {
    title: 'Custom URL for Sharing',
    icon: <Link className="w-6 h-6" />,
    description: 'Create a personalized link to share your resume online with recruiters',
    isNew: true
  },
  {
    title: 'AI Keyword Tailoring',
    icon: <Target className="w-6 h-6" />,
    description: 'Automatically tailor your resume keywords for each job application',
    isPremium: true
  },
  {
    title: 'AI Keyword Targeting',
    icon: <Target className="w-6 h-6" />,
    description: 'Identify and integrate crucial keywords from job descriptions'
  },
  {
    title: 'AI Summary Writer',
    icon: <FileText className="w-6 h-6" />,
    description: 'Generate compelling professional summaries tailored to your experience'
  },
  {
    title: 'Real-Time Content Analysis',
    icon: <BarChart className="w-6 h-6" />,
    description: 'Get instant feedback on resume content, grammar, and impact'
  },
  {
    title: 'AI Resignation Letter Generator',
    icon: <LogOut className="w-6 h-6" />,
    description: 'Create professional resignation letters in minutes',
    isNew: true
  },
  {
    title: 'AI Cover Letter Generator',
    icon: <PenTool className="w-6 h-6" />,
    description: 'Generate tailored cover letters that complement your resume'
  },
  {
    title: 'Resume Folders',
    icon: <FolderOpen className="w-6 h-6" />,
    description: 'Organize multiple resume versions for different applications'
  },
  {
    title: 'Video Education Guides',
    icon: <Video className="w-6 h-6" />,
    description: 'Learn resume best practices through comprehensive video tutorials'
  },
  {
    title: 'Text Styling',
    icon: <Type className="w-6 h-6" />,
    description: 'Customize fonts, sizes, and formatting to match your style'
  },
  {
    title: 'Download Types',
    icon: <Download className="w-6 h-6" />,
    description: 'Export as PDF, Word, or plain text for any application system'
  },
  {
    title: 'Formatting Adjustments',
    icon: <Settings className="w-6 h-6" />,
    description: 'Fine-tune margins, spacing, and layout for perfect presentation'
  },
  {
    title: 'Resume Score',
    icon: <Star className="w-6 h-6" />,
    description: 'Get your resume rated on 23 criteria with actionable feedback'
  },
  {
    title: 'AI Writer & Editor',
    icon: <Edit3 className="w-6 h-6" />,
    description: 'AI-powered writing assistance for bullet points and descriptions'
  },
  {
    title: 'Custom Sections',
    icon: <Grid className="w-6 h-6" />,
    description: 'Add unique sections like certifications, publications, or projects'
  },
  {
    title: 'Fine-Tuned Prompts',
    icon: <Lightbulb className="w-6 h-6" />,
    description: 'Pre-written prompts optimized for different industries and roles',
    isPremium: true
  },
  {
    title: 'Best-Practice Resume Formats',
    icon: <BookOpen className="w-6 h-6" />,
    description: 'ATS-optimized templates following industry standards'
  },
  {
    title: 'AI Skills Explorer',
    icon: <UserCheck className="w-6 h-6" />,
    description: 'Discover relevant skills based on your experience and target role'
  },
  {
    title: 'AI Interview Practice',
    icon: <MessageSquare className="w-6 h-6" />,
    description: 'Practice common interview questions with AI-powered feedback',
    isNew: true
  },
  {
    title: '900+ Resume Examples',
    icon: <Library className="w-6 h-6" />,
    description: 'Browse real resume examples across all industries and experience levels'
  }
];

export default function AdditionalFeaturesGrid() {
  return (
    <section className="py-20 bg-slate-900">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-blue-400 font-semibold mb-2 block">Even more reasons to love Resume</span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Resume does more than any other resume builder
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Resume makes it easy to get the help you need, stay organized, and take on any challenge. 
            Its clear, simple design just makes sense — especially if you have many applications.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6 hover:border-slate-700 hover:shadow-lg transition-all relative group"
            >
              {/* Badges */}
              <div className="absolute top-4 right-4 flex gap-2">
                {feature.isNew && (
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full">
                    NEW
                  </span>
                )}
                {feature.isPremium && (
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-semibold rounded-full">
                    PRO
                  </span>
                )}
              </div>

              {/* Icon */}
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center text-blue-400 mb-4 group-hover:from-blue-500 group-hover:to-purple-500 group-hover:text-white transition-all">
                {feature.icon}
              </div>

              {/* Content */}
              <h3 className="font-bold text-lg mb-2 text-white">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-12 max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold mb-4 text-white">
            Ready to experience all these features?
          </h3>
          <p className="text-gray-400 text-lg mb-8">
            Join over 3 million job seekers who trust Resume to land their dream jobs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://app.resume.ai/signup"
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all shadow-xl"
            >
              Start Free Trial
            </a>
            <a
              href="/resume-docs"
              className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-lg font-semibold hover:bg-white/20 transition-all"
            >
              Explore User Guides
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}