// components/landing/ReziFeatures.tsx
// Specific features commonly found in Rezi and similar AI resume builders

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  X,
  Sparkles,
  Target,
  BarChart3,
  FileText,
  Zap,
  ArrowRight
} from 'lucide-react';

// ATS Score Meter Component
export const ATSScoreMeter = () => {
  const [score, setScore] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const animateScore = () => {
    setIsAnimating(true);
    let currentScore = 0;
    const targetScore = 87;
    const interval = setInterval(() => {
      currentScore += 2;
      setScore(currentScore);
      if (currentScore >= targetScore) {
        clearInterval(interval);
        setIsAnimating(false);
      }
    }, 30);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
      <h3 className="text-2xl font-bold mb-6 text-center">ATS Compatibility Score</h3>

      <div className="relative w-48 h-48 mx-auto mb-6">
        <svg className="transform -rotate-90 w-48 h-48">
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="#e5e7eb"
            strokeWidth="12"
            fill="none"
          />
          <motion.circle
            cx="96"
            cy="96"
            r="88"
            stroke="url(#gradient)"
            strokeWidth="12"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 88}`}
            strokeDashoffset={`${2 * Math.PI * 88 * (1 - score / 100)}`}
            strokeLinecap="round"
            animate={{ strokeDashoffset: `${2 * Math.PI * 88 * (1 - score / 100)}` }}
            transition={{ duration: 2, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              {score}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">ATS Score</div>
          </div>
        </div>
      </div>

      <button
        onClick={animateScore}
        disabled={isAnimating}
        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
      >
        {isAnimating ? 'Analyzing...' : 'Analyze Resume'}
      </button>

      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Keywords Match</span>
          <span className="font-semibold text-green-600">92%</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Formatting</span>
          <span className="font-semibold text-green-600">88%</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Content Quality</span>
          <span className="font-semibold text-yellow-600">79%</span>
        </div>
      </div>
    </div>
  );
};

// Resume vs Job Description Comparison
export const ResumeComparison = () => {
  const [activeTab, setActiveTab] = useState<'missing' | 'matching'>('missing');

  const missingKeywords = [
    'Project Management',
    'Agile Methodology',
    'Stakeholder Communication',
    'Budget Management'
  ];

  const matchingKeywords = [
    'JavaScript',
    'React',
    'Node.js',
    'Team Leadership',
    'Problem Solving'
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
      <h3 className="text-2xl font-bold mb-6">Resume vs Job Description</h3>

      <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('missing')}
          className={`flex-1 py-2 px-4 rounded-md transition-all ${
            activeTab === 'missing'
              ? 'bg-white dark:bg-gray-800 shadow-sm'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          Missing Keywords
        </button>
        <button
          onClick={() => setActiveTab('matching')}
          className={`flex-1 py-2 px-4 rounded-md transition-all ${
            activeTab === 'matching'
              ? 'bg-white dark:bg-gray-800 shadow-sm'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          Matching Keywords
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'missing' ? (
          <motion.div
            key="missing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            {missingKeywords.map((keyword, index) => (
              <motion.div
                key={keyword}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <X className="w-5 h-5 text-red-600" />
                  <span className="text-gray-800 dark:text-gray-200">{keyword}</span>
                </div>
                <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                  Add to Resume
                </button>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="matching"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            {matchingKeywords.map((keyword, index) => (
              <motion.div
                key={keyword}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
              >
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-800 dark:text-gray-200">{keyword}</span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// AI Content Suggestions
export const AIContentSuggestions = () => {
  const [selectedSuggestion, setSelectedSuggestion] = useState<number | null>(null);

  const suggestions = [
    {
      original: "Managed team projects",
      improved: "Led cross-functional team of 8 members, delivering 5 major projects on time and 15% under budget",
      improvement: "+65% Impact"
    },
    {
      original: "Good communication skills",
      improved: "Presented quarterly results to C-suite executives, influencing strategic decisions that increased revenue by 20%",
      improvement: "+80% Impact"
    },
    {
      original: "Worked on website development",
      improved: "Developed responsive e-commerce platform using React and Node.js, serving 50K+ daily active users",
      improvement: "+75% Impact"
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold">AI Content Suggestions</h3>
        <Sparkles className="w-6 h-6 text-purple-600" />
      </div>

      <div className="space-y-4">
        {suggestions.map((suggestion, index) => (
          <motion.div
            key={index}
            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden cursor-pointer"
            onClick={() => setSelectedSuggestion(selectedSuggestion === index ? null : index)}
            whileHover={{ scale: 1.02 }}
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm text-gray-600 dark:text-gray-400 line-through">
                  {suggestion.original}
                </p>
                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full">
                  {suggestion.improvement}
                </span>
              </div>

              <AnimatePresence>
                {selectedSuggestion === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-gray-800 dark:text-gray-200 font-medium mb-3">
                      {suggestion.improved}
                    </p>
                    <button className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all">
                      Apply Suggestion
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Template Preview Carousel
export const TemplateCarousel = () => {
  const [activeTemplate, setActiveTemplate] = useState(0);

  const templates = [
    { name: 'Modern Professional', color: 'from-blue-600 to-purple-600' },
    { name: 'Creative Designer', color: 'from-pink-600 to-orange-600' },
    { name: 'Executive Classic', color: 'from-gray-600 to-gray-800' },
    { name: 'Tech Innovator', color: 'from-green-600 to-blue-600' }
  ];

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-2xl">
        <motion.div
          className="flex"
          animate={{ x: `-${activeTemplate * 100}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {templates.map((template, index) => (
            <div
              key={index}
              className="w-full flex-shrink-0 bg-white dark:bg-gray-800 p-8 min-h-[400px]"
            >
              <div className={`h-full bg-gradient-to-br ${template.color} rounded-lg p-6 text-white`}>
                <div className="h-8 bg-white/20 rounded mb-4" />
                <div className="space-y-3">
                  <div className="h-4 bg-white/20 rounded w-3/4" />
                  <div className="h-4 bg-white/20 rounded w-1/2" />
                  <div className="h-4 bg-white/20 rounded w-5/6" />
                </div>
                <div className="mt-8 space-y-2">
                  <div className="h-3 bg-white/20 rounded" />
                  <div className="h-3 bg-white/20 rounded" />
                  <div className="h-3 bg-white/20 rounded w-4/5" />
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="flex justify-center mt-6 space-x-2">
        {templates.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveTemplate(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              activeTemplate === index
                ? 'w-8 bg-gradient-to-r from-purple-600 to-pink-600'
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
          />
        ))}
      </div>

      <div className="text-center mt-4">
        <h4 className="font-semibold text-lg">{templates[activeTemplate].name}</h4>
      </div>
    </div>
  );
};

// Real-time Resume Editor Preview
export const LiveEditorPreview = () => {
  const [text, setText] = useState('Senior Software Engineer with 5+ years...');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-gray-900 rounded-2xl p-6">
        <div className="flex items-center mb-4">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <div className="w-3 h-3 bg-green-500 rounded-full" />
          </div>
          <div className="ml-4 text-gray-400 text-sm">Editor</div>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-64 bg-gray-800 text-gray-100 p-4 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-600"
          placeholder="Type your resume content here..."
        />

        <div className="mt-4 flex items-center justify-between">
          <div className="flex space-x-2">
            <button className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <Sparkles className="w-4 h-4" />
            </button>
            <button className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
              <Target className="w-4 h-4" />
            </button>
            <button className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>
          <span className="text-sm text-gray-400">{text.length} characters</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h3 className="text-2xl font-bold mb-4">Live Preview</h3>
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap">{text}</p>
        </div>
      </div>
    </div>
  );
};

// Job Match Score
export const JobMatchScore = () => {
  const jobMatches = [
    { title: 'Senior React Developer', company: 'Tech Corp', score: 94 },
    { title: 'Full Stack Engineer', company: 'StartupXYZ', score: 87 },
    { title: 'Frontend Lead', company: 'Big Tech Inc', score: 82 },
    { title: 'Software Architect', company: 'Enterprise Co', score: 78 }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
      <h3 className="text-2xl font-bold mb-6">Job Match Scores</h3>

      <div className="space-y-4">
        {jobMatches.map((job, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">{job.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{job.company}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                  {job.score}%
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Match</p>
              </div>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                initial={{ width: 0 }}
                animate={{ width: `${job.score}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
              />
            </div>

            <button className="mt-3 text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center">
              Optimize for this job <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};