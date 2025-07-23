/**
 * Resume Scoring Engine
 * Analyzes resumes across 5 categories with 23 audit points
 * Based on industry best practices and ATS optimization requirements
 */

export interface AuditResult {
  id: string;
  category: ScoreCategory;
  passed: boolean;
  score: number;
  title: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  items?: string[]; // Specific items that failed the audit
  recommendation?: string;
  isPro?: boolean; // Some audits might be premium features
}

export interface CategoryScore {
  category: ScoreCategory;
  score: number;
  maxScore: number;
  audits: AuditResult[];
}

export interface ResumeScore {
  totalScore: number;
  categories: CategoryScore[];
  breakdown: {
    content: number;
    format: number;
    optimization: number;
    bestPractices: number;
    applicationReady: number;
  };
  summary: string;
  scoreLabel: 'Excellent' | 'Good' | 'Fair' | 'Needs Work';
}

export type ScoreCategory = 'content' | 'format' | 'optimization' | 'bestPractices' | 'applicationReady';

// Utility functions for text analysis
const countWords = (text: string): number => {
  return text.split(/\s+/).filter(word => word.length > 0).length;
};

const containsPersonalPronouns = (text: string): boolean => {
  const pronouns = /\b(I|me|my|mine|myself|we|us|our|ours|ourselves)\b/gi;
  return pronouns.test(text);
};

const containsBuzzwords = (text: string): boolean => {
  const buzzwords = [
    'synergy', 'leverage', 'paradigm', 'holistic', 'ecosystem',
    'disruptive', 'innovative', 'cutting-edge', 'game-changer',
    'thought leader', 'guru', 'ninja', 'rockstar', 'wizard'
  ];
  const regex = new RegExp(`\\b(${buzzwords.join('|')})\\b`, 'gi');
  return regex.test(text);
};

const containsPassiveVoice = (text: string): boolean => {
  // Simple passive voice detection
  const passiveIndicators = /(was|were|been|being|is|are|am) \w+ed\b/gi;
  return passiveIndicators.test(text);
};

const containsFillerWords = (text: string): boolean => {
  const fillerWords = [
    'really', 'very', 'quite', 'just', 'actually', 'basically',
    'literally', 'honestly', 'obviously', 'clearly', 'simply'
  ];
  const regex = new RegExp(`\\b(${fillerWords.join('|')})\\b`, 'gi');
  const matches = text.match(regex) || [];
  return matches.length > 3; // Allow some usage, but flag excessive use
};

const hasQuantifiableMetrics = (text: string): boolean => {
  // Check for numbers, percentages, dollar amounts, etc.
  const metrics = /\b\d+\b|\$[\d,]+|\d+%|\d+\.\d+/g;
  return metrics.test(text);
};

const isWeakBullet = (text: string): boolean => {
  const weakStarters = [
    'responsible for', 'duties included', 'helped with',
    'assisted in', 'worked on', 'participated in'
  ];
  const regex = new RegExp(`^(${weakStarters.join('|')})`, 'i');
  return regex.test(text.trim()) || text.length < 20;
};

const hasActionVerbs = (text: string): boolean => {
  const actionVerbs = [
    'achieved', 'implemented', 'developed', 'led', 'managed',
    'created', 'designed', 'improved', 'increased', 'reduced',
    'launched', 'built', 'established', 'generated', 'delivered'
  ];
  const regex = new RegExp(`\\b(${actionVerbs.join('|')})\\b`, 'i');
  return regex.test(text);
};

// Main scoring function
export function scoreResume(resumeData: any, jobInfo?: any): ResumeScore {
  const audits: AuditResult[] = [];
  
  // Extract text content for analysis
  const fullText = extractFullText(resumeData);
  const wordCount = countWords(fullText);
  
  // CONTENT AUDITS (30 points)
  
  // 1. Personal Information Completeness
  const contact = resumeData.contact || resumeData.contactInfo || {};
  if (!contact.email) {
    audits.push({
      id: 'C1',
      category: 'content',
      passed: false,
      score: 0,
      title: 'Missing email address',
      description: 'Your email address is essential for employers to contact you',
      severity: 'error',
      recommendation: 'Add your professional email address to the contact section'
    });
  } else {
    audits.push({
      id: 'C1',
      category: 'content',
      passed: true,
      score: 5,
      title: 'Email address included',
      description: 'Contact information is complete',
      severity: 'info'
    });
  }
  
  // 2. Word Count Analysis
  const isWordCountOptimal = wordCount >= 400 && wordCount <= 800;
  audits.push({
    id: 'C2',
    category: 'content',
    passed: isWordCountOptimal,
    score: isWordCountOptimal ? 5 : 0,
    title: `Your resume has ${wordCount} words`,
    description: isWordCountOptimal 
      ? 'Word count is within optimal range' 
      : 'Your resume should contain between 400-800 words',
    severity: isWordCountOptimal ? 'info' : 'warning',
    recommendation: wordCount < 400 
      ? 'Add more detailed accomplishments and expand your bullet points' 
      : 'Consider condensing content to focus on most relevant experiences'
  });
  
  // 3. Bullet Points Analysis
  const bulletAnalysis = analyzeBulletPoints(resumeData);
  audits.push({
    id: 'C3',
    category: 'content',
    passed: bulletAnalysis.passed,
    score: bulletAnalysis.passed ? 5 : 0,
    title: bulletAnalysis.title,
    description: bulletAnalysis.description,
    severity: bulletAnalysis.passed ? 'info' : 'error',
    items: bulletAnalysis.items
  });
  
  // 4. Quantifiable Achievements
  const quantifiedBullets = analyzeQuantification(resumeData);
  audits.push({
    id: 'C4',
    category: 'content',
    passed: quantifiedBullets.passed,
    score: quantifiedBullets.passed ? 5 : 2,
    title: 'Quantifiable achievements',
    description: quantifiedBullets.description,
    severity: quantifiedBullets.passed ? 'info' : 'warning',
    items: quantifiedBullets.items
  });
  
  // 5. Personal Pronouns (PRO feature)
  audits.push({
    id: 'C5',
    category: 'content',
    passed: !containsPersonalPronouns(fullText),
    score: 2,
    title: 'Personal pronouns',
    description: 'Check for use of I, me, my, etc.',
    severity: 'info',
    isPro: true
  });
  
  // 6. Buzzwords (PRO feature)
  audits.push({
    id: 'C6',
    category: 'content',
    passed: !containsBuzzwords(fullText),
    score: 2,
    title: 'Buzzwords',
    description: 'Avoid overused terms that lack substance',
    severity: 'info',
    isPro: true
  });
  
  // 7. Passive Voice (PRO feature)
  audits.push({
    id: 'C7',
    category: 'content',
    passed: !containsPassiveVoice(fullText),
    score: 2,
    title: 'Passive voice',
    description: 'Use active voice for stronger impact',
    severity: 'info',
    isPro: true
  });
  
  // 8. Filler Words (PRO feature)
  audits.push({
    id: 'C8',
    category: 'content',
    passed: !containsFillerWords(fullText),
    score: 2,
    title: 'Filler words',
    description: 'Remove unnecessary words that dilute impact',
    severity: 'info',
    isPro: true
  });
  
  // 9. Weak Bullet Points
  const weakBullets = analyzeWeakBullets(resumeData);
  if (!weakBullets.passed) {
    audits.push({
      id: 'C9',
      category: 'content',
      passed: false,
      score: 0,
      title: weakBullets.title,
      description: weakBullets.description,
      severity: 'error',
      items: weakBullets.items
    });
  } else {
    audits.push({
      id: 'C9',
      category: 'content',
      passed: true,
      score: 4,
      title: 'Strong bullet points',
      description: 'All bullet points use action verbs and show impact',
      severity: 'info'
    });
  }
  
  // FORMAT AUDITS (20 points)
  
  // 10. Page Length
  const pageLength = estimatePageLength(resumeData);
  const isPageLengthOptimal = pageLength >= 0.8 && pageLength <= 1.2;
  audits.push({
    id: 'F1',
    category: 'format',
    passed: isPageLengthOptimal,
    score: isPageLengthOptimal ? 10 : 0,
    title: `Your resume is ${pageLength.toFixed(2)} pages long`,
    description: isPageLengthOptimal 
      ? 'Resume length is optimal' 
      : 'One page is ideal for most applications',
    severity: isPageLengthOptimal ? 'info' : 'error',
    recommendation: 'Adjust content to fit one page'
  });
  
  // 11. Date Format Consistency
  const dateAnalysis = analyzeDateFormats(resumeData);
  audits.push({
    id: 'F2',
    category: 'format',
    passed: dateAnalysis.passed,
    score: dateAnalysis.passed ? 5 : 0,
    title: 'Date format consistency',
    description: dateAnalysis.description,
    severity: dateAnalysis.passed ? 'info' : 'warning'
  });
  
  // 12. Section Headers
  const sectionAnalysis = analyzeSectionHeaders(resumeData);
  audits.push({
    id: 'F3',
    category: 'format',
    passed: sectionAnalysis.passed,
    score: sectionAnalysis.passed ? 5 : 2,
    title: 'Section organization',
    description: sectionAnalysis.description,
    severity: sectionAnalysis.passed ? 'info' : 'warning'
  });
  
  // OPTIMIZATION AUDITS (20 points)
  
  // 13. Keyword Optimization
  const keywordScore = analyzeKeywordOptimization(resumeData, jobInfo);
  audits.push({
    id: 'O1',
    category: 'optimization',
    passed: keywordScore.passed,
    score: keywordScore.passed ? 10 : 5,
    title: keywordScore.title,
    description: keywordScore.description,
    severity: keywordScore.passed ? 'info' : 'warning'
  });
  
  // 14. Skills Section
  const skillsAnalysis = analyzeSkillsSection(resumeData);
  audits.push({
    id: 'O2',
    category: 'optimization',
    passed: skillsAnalysis.passed,
    score: skillsAnalysis.passed ? 5 : 0,
    title: 'Skills section optimization',
    description: skillsAnalysis.description,
    severity: skillsAnalysis.passed ? 'info' : 'warning'
  });
  
  // 15. Experience Targeting
  const experienceTargeting = analyzeExperienceLevel(resumeData);
  audits.push({
    id: 'O3',
    category: 'optimization',
    passed: experienceTargeting.passed,
    score: experienceTargeting.passed ? 5 : 0,
    title: experienceTargeting.title,
    description: experienceTargeting.description,
    severity: 'warning'
  });
  
  // BEST PRACTICES AUDITS (20 points)
  
  // 16. Location Information
  const locationAnalysis = analyzeLocationInfo(resumeData);
  audits.push({
    id: 'BP1',
    category: 'bestPractices',
    passed: locationAnalysis.passed,
    score: locationAnalysis.passed ? 5 : 0,
    title: locationAnalysis.title,
    description: locationAnalysis.description,
    severity: 'warning',
    items: locationAnalysis.items
  });
  
  // 17. Education Details
  const educationAnalysis = analyzeEducation(resumeData);
  audits.push({
    id: 'BP2',
    category: 'bestPractices',
    passed: educationAnalysis.passed,
    score: educationAnalysis.passed ? 5 : 3,
    title: 'Education section completeness',
    description: educationAnalysis.description,
    severity: educationAnalysis.passed ? 'info' : 'warning'
  });
  
  // 18. Professional Summary
  const summaryAnalysis = analyzeSummary(resumeData);
  audits.push({
    id: 'BP3',
    category: 'bestPractices',
    passed: summaryAnalysis.passed,
    score: summaryAnalysis.passed ? 5 : 0,
    title: summaryAnalysis.title,
    description: summaryAnalysis.description,
    severity: summaryAnalysis.passed ? 'info' : 'warning'
  });
  
  // 19. Contact Information Completeness
  const contactAnalysis = analyzeContactInfo(resumeData);
  audits.push({
    id: 'BP4',
    category: 'bestPractices',
    passed: contactAnalysis.passed,
    score: contactAnalysis.passed ? 5 : 2,
    title: 'Contact information completeness',
    description: contactAnalysis.description,
    severity: contactAnalysis.passed ? 'info' : 'warning'
  });
  
  // APPLICATION READY AUDITS (10 points)
  
  // 20. Overall Readiness
  const readinessScore = calculateReadiness(audits);
  audits.push({
    id: 'AR1',
    category: 'applicationReady',
    passed: readinessScore >= 80,
    score: readinessScore >= 80 ? 10 : 5,
    title: readinessScore >= 80 
      ? 'Your resume is ready for application' 
      : 'Your resume needs improvements before applying',
    description: readinessScore >= 80 
      ? 'Your resume meets professional standards' 
      : 'Address the critical issues identified above',
    severity: readinessScore >= 80 ? 'info' : 'warning'
  });
  
  // Calculate category scores
  const categories = calculateCategoryScores(audits);
  const totalScore = Math.round(
    categories.reduce((sum, cat) => sum + (cat.score / cat.maxScore) * 20, 0)
  );
  
  // Determine score label
  let scoreLabel: ResumeScore['scoreLabel'];
  if (totalScore >= 90) scoreLabel = 'Excellent';
  else if (totalScore >= 75) scoreLabel = 'Good';
  else if (totalScore >= 60) scoreLabel = 'Fair';
  else scoreLabel = 'Needs Work';
  
  return {
    totalScore: Math.min(100, totalScore),
    categories,
    breakdown: {
      content: Math.round((categories.find(c => c.category === 'content')?.score || 0) / 30 * 100),
      format: Math.round((categories.find(c => c.category === 'format')?.score || 0) / 20 * 100),
      optimization: Math.round((categories.find(c => c.category === 'optimization')?.score || 0) / 20 * 100),
      bestPractices: Math.round((categories.find(c => c.category === 'bestPractices')?.score || 0) / 20 * 100),
      applicationReady: Math.round((categories.find(c => c.category === 'applicationReady')?.score || 0) / 10 * 100)
    },
    summary: generateSummary(totalScore, audits),
    scoreLabel
  };
}

// Helper functions

function extractFullText(resumeData: any): string {
  const texts: string[] = [];
  
  // Add summary
  if (resumeData.summary) texts.push(resumeData.summary);
  
  // Add experience descriptions
  if (Array.isArray(resumeData.experience)) {
    resumeData.experience.forEach((exp: any) => {
      if (exp.description) texts.push(exp.description);
    });
  }
  
  // Add project descriptions
  if (Array.isArray(resumeData.projects)) {
    resumeData.projects.forEach((proj: any) => {
      if (proj.description) texts.push(proj.description);
    });
  }
  
  // Add other sections
  if (Array.isArray(resumeData.volunteer)) {
    resumeData.volunteer.forEach((vol: any) => {
      if (vol.description) texts.push(vol.description);
    });
  }
  
  return texts.join(' ');
}

function analyzeBulletPoints(resumeData: any): any {
  const sections = ['experience', 'projects', 'volunteer'];
  const issues: string[] = [];
  let totalBullets = 0;
  
  sections.forEach(section => {
    if (Array.isArray(resumeData[section])) {
      resumeData[section].forEach((item: any) => {
        if (item.description) {
          const bullets = item.description.split('\n').filter((b: string) => b.trim());
          totalBullets += bullets.length;
          
          if (bullets.length < 3 || bullets.length > 6) {
            issues.push(item.position || item.title || item.role || 'Unknown position');
          }
        }
      });
    }
  });
  
  return {
    passed: issues.length === 0 && totalBullets >= 3,
    title: issues.length > 0 
      ? `${issues.length} positions with incorrect number of bullet points`
      : 'Bullet point count is optimal',
    description: issues.length > 0 
      ? 'Each position should have 3-6 bullet points'
      : 'All positions have appropriate number of bullet points',
    items: issues
  };
}

function analyzeQuantification(resumeData: any): any {
  const unquantified: string[] = [];
  let totalBullets = 0;
  let quantifiedBullets = 0;
  
  ['experience', 'projects'].forEach(section => {
    if (Array.isArray(resumeData[section])) {
      resumeData[section].forEach((item: any) => {
        if (item.description) {
          const bullets = item.description.split('\n').filter((b: string) => b.trim());
          bullets.forEach((bullet: string) => {
            totalBullets++;
            if (hasQuantifiableMetrics(bullet)) {
              quantifiedBullets++;
            }
          });
          
          const quantifiedRatio = bullets.filter(hasQuantifiableMetrics).length / bullets.length;
          if (quantifiedRatio < 0.5) {
            unquantified.push(item.position || item.title || 'Unknown');
          }
        }
      });
    }
  });
  
  const overallRatio = totalBullets > 0 ? quantifiedBullets / totalBullets : 0;
  
  return {
    passed: overallRatio >= 0.5,
    description: overallRatio >= 0.5 
      ? `${Math.round(overallRatio * 100)}% of bullet points include metrics`
      : 'Add numbers, percentages, or measurable outcomes to your achievements',
    items: unquantified
  };
}

function analyzeWeakBullets(resumeData: any): any {
  const weakItems: string[] = [];
  
  ['experience', 'projects'].forEach(section => {
    if (Array.isArray(resumeData[section])) {
      resumeData[section].forEach((item: any) => {
        if (item.description) {
          const bullets = item.description.split('\n').filter((b: string) => b.trim());
          const hasWeak = bullets.some((bullet: string) => isWeakBullet(bullet));
          
          if (hasWeak) {
            weakItems.push(item.position || item.title || 'Unknown');
          }
        }
      });
    }
  });
  
  return {
    passed: weakItems.length === 0,
    title: weakItems.length > 0 
      ? `${weakItems.length} positions with weak bullet points`
      : 'All bullet points are strong',
    description: 'Start bullets with action verbs and focus on achievements',
    items: weakItems
  };
}

function estimatePageLength(resumeData: any): number {
  // Rough estimation based on content
  const wordCount = countWords(extractFullText(resumeData));
  const sections = ['experience', 'education', 'projects', 'skills', 'certifications'].filter(
    section => resumeData[section] && 
    (Array.isArray(resumeData[section]) ? resumeData[section].length > 0 : true)
  ).length;
  
  // Estimate based on word count and sections
  // Typical resume: ~500 words = 1 page
  const wordPages = wordCount / 500;
  const sectionPages = sections * 0.15; // Each section adds ~0.15 pages
  
  return Math.max(wordPages, sectionPages);
}

function analyzeDateFormats(resumeData: any): any {
  const dates: string[] = [];
  const sections = ['experience', 'education', 'projects', 'certifications'];
  
  sections.forEach(section => {
    if (Array.isArray(resumeData[section])) {
      resumeData[section].forEach((item: any) => {
        if (item.dateBegin) dates.push(item.dateBegin);
        if (item.dateEnd) dates.push(item.dateEnd);
        if (item.startDate) dates.push(item.startDate);
        if (item.endDate) dates.push(item.endDate);
        if (item.date) dates.push(item.date);
      });
    }
  });
  
  // Check for consistency (simplified check)
  const hasInconsistentFormats = dates.some(date => {
    return typeof date === 'string' && 
           (date.includes('-') || date.includes('/')) && 
           !date.match(/^(January|February|March|April|May|June|July|August|September|October|November|December)/);
  });
  
  return {
    passed: !hasInconsistentFormats,
    description: hasInconsistentFormats 
      ? 'Use consistent date format (e.g., "March 2023")'
      : 'Date formatting is consistent'
  };
}

function analyzeSectionHeaders(resumeData: any): any {
  const expectedSections = ['experience', 'education', 'skills'];
  const missingSections = expectedSections.filter(section => 
    !resumeData[section] || 
    (Array.isArray(resumeData[section]) && resumeData[section].length === 0)
  );
  
  return {
    passed: missingSections.length === 0,
    description: missingSections.length === 0 
      ? 'All essential sections are present'
      : `Missing sections: ${missingSections.join(', ')}`
  };
}

function analyzeKeywordOptimization(resumeData: any, jobInfo: any): any {
  if (!jobInfo || !jobInfo.extractedKeywords) {
    return {
      passed: false,
      title: 'No job targeting',
      description: 'Add a job description to optimize keyword matching'
    };
  }
  
  const resumeText = extractFullText(resumeData).toLowerCase();
  const matchedKeywords = jobInfo.extractedKeywords.filter((kw: any) => 
    resumeText.includes(kw.keyword.toLowerCase())
  );
  
  const matchRate = matchedKeywords.length / jobInfo.extractedKeywords.length;
  
  return {
    passed: matchRate >= 0.6,
    title: `${Math.round(matchRate * 100)}% keyword match`,
    description: matchRate >= 0.6 
      ? 'Good keyword optimization for target role'
      : 'Add more relevant keywords from the job description'
  };
}

function analyzeSkillsSection(resumeData: any): any {
  if (!resumeData.skills || !Array.isArray(resumeData.skills) || resumeData.skills.length === 0) {
    return {
      passed: false,
      description: 'Add a skills section to highlight your technical competencies'
    };
  }
  
  const totalSkills = resumeData.skills.reduce((count: number, category: any) => {
    const skills = category.keywords || category.skills || '';
    return count + skills.split(',').filter((s: string) => s.trim()).length;
  }, 0);
  
  return {
    passed: totalSkills >= 5,
    description: totalSkills >= 5 
      ? `${totalSkills} skills listed across ${resumeData.skills.length} categories`
      : 'Add more relevant skills to strengthen your profile'
  };
}

function analyzeExperienceLevel(resumeData: any): any {
  const experienceYears = calculateExperienceYears(resumeData);
  
  return {
    passed: experienceYears > 0,
    title: experienceYears > 0 
      ? `${experienceYears} years of experience detected`
      : 'Experience level not defined',
    description: experienceYears > 0 
      ? 'Resume shows clear career progression'
      : 'Add more details about your work experience'
  };
}

function analyzeLocationInfo(resumeData: any): any {
  const missingLocations: string[] = [];
  
  ['experience', 'education', 'projects'].forEach(section => {
    if (Array.isArray(resumeData[section])) {
      resumeData[section].forEach((item: any) => {
        if (!item.location) {
          missingLocations.push(item.position || item.title || item.institution || 'Unknown');
        }
      });
    }
  });
  
  return {
    passed: missingLocations.length === 0,
    title: missingLocations.length > 0 
      ? `${missingLocations.length} items missing location information`
      : 'All locations included',
    description: 'Location information helps validate your experience',
    items: missingLocations
  };
}

function analyzeEducation(resumeData: any): any {
  if (!resumeData.education || !Array.isArray(resumeData.education) || resumeData.education.length === 0) {
    return {
      passed: false,
      description: 'Add your educational background'
    };
  }
  
  const hasCompleteInfo = resumeData.education.every((edu: any) => 
    edu.institution && (edu.qualification || edu.degree)
  );
  
  return {
    passed: hasCompleteInfo,
    description: hasCompleteInfo 
      ? 'Education section is complete'
      : 'Add missing degree or institution information'
  };
}

function analyzeSummary(resumeData: any): any {
  const summary = resumeData.summary || '';
  const wordCount = countWords(summary);
  
  return {
    passed: wordCount >= 30 && wordCount <= 150,
    title: summary 
      ? `Summary has ${wordCount} words`
      : 'No professional summary',
    description: wordCount >= 30 && wordCount <= 150 
      ? 'Professional summary is well-sized'
      : summary 
        ? 'Adjust summary length (30-150 words recommended)'
        : 'Add a professional summary to introduce yourself'
  };
}

function analyzeContactInfo(resumeData: any): any {
  const contact = resumeData.contact || resumeData.contactInfo || {};
  const required = ['email', 'phone'];
  const missing = required.filter(field => !contact[field]);
  
  return {
    passed: missing.length === 0,
    description: missing.length === 0 
      ? 'Contact information is complete'
      : `Missing: ${missing.join(', ')}`
  };
}

function calculateExperienceYears(resumeData: any): number {
  if (!Array.isArray(resumeData.experience) || resumeData.experience.length === 0) {
    return 0;
  }
  
  let earliestDate = new Date();
  let latestDate = new Date(0);
  
  resumeData.experience.forEach((exp: any) => {
    if (exp.dateBegin || exp.startDate) {
      const start = new Date(exp.dateBegin || exp.startDate);
      if (start < earliestDate) earliestDate = start;
    }
    
    if (exp.dateEnd || exp.endDate) {
      const end = exp.dateEnd === 'Present' || exp.endDate === 'Present' 
        ? new Date() 
        : new Date(exp.dateEnd || exp.endDate);
      if (end > latestDate) latestDate = end;
    }
  });
  
  const years = (latestDate.getTime() - earliestDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
  return Math.round(years * 10) / 10;
}

function calculateReadiness(audits: AuditResult[]): number {
  const criticalAudits = audits.filter(a => a.severity === 'error' && !a.isPro);
  const warningAudits = audits.filter(a => a.severity === 'warning' && !a.isPro);
  
  if (criticalAudits.filter(a => !a.passed).length > 0) {
    return 70; // Has critical issues
  }
  
  const warningsPassed = warningAudits.filter(a => a.passed).length;
  const warningsTotal = warningAudits.length;
  
  return 70 + (warningsTotal > 0 ? (warningsPassed / warningsTotal) * 30 : 30);
}

function calculateCategoryScores(audits: AuditResult[]): CategoryScore[] {
  const categories: ScoreCategory[] = ['content', 'format', 'optimization', 'bestPractices', 'applicationReady'];
  const maxScores = {
    content: 30,
    format: 20,
    optimization: 20,
    bestPractices: 20,
    applicationReady: 10
  };
  
  return categories.map(category => {
    const categoryAudits = audits.filter(a => a.category === category);
    const score = categoryAudits.reduce((sum, audit) => sum + (audit.passed ? audit.score : 0), 0);
    
    return {
      category,
      score,
      maxScore: maxScores[category],
      audits: categoryAudits
    };
  });
}

function generateSummary(score: number, audits: AuditResult[]): string {
  const failedCritical = audits.filter(a => a.severity === 'error' && !a.passed && !a.isPro).length;
  const failedWarnings = audits.filter(a => a.severity === 'warning' && !a.passed && !a.isPro).length;
  
  if (score >= 90) {
    return 'Your resume is well-optimized and ready for applications!';
  } else if (score >= 75) {
    return `Good foundation with ${failedCritical + failedWarnings} areas for improvement.`;
  } else if (score >= 60) {
    return `Address ${failedCritical} critical issues and ${failedWarnings} warnings to improve your chances.`;
  } else {
    return `Significant improvements needed. Focus on fixing ${failedCritical} critical issues first.`;
  }
}