'use server';

/**
 * @fileOverview Advanced Resume Targeting with 4-Layer Analysis Framework
 * Implements comprehensive semantic analysis and strategic keyword optimization
 */

import { ai } from '@/lib/ai/genkit';
import { z } from 'genkit';

// ============================================================================
// ACTION VERB LIBRARY - High-quality verbs categorized by impact
// ============================================================================

const ACTION_VERBS = {
  leadership: [
    'Led', 'Directed', 'Managed', 'Supervised', 'Coordinated', 'Orchestrated',
    'Spearheaded', 'Championed', 'Pioneered', 'Established', 'Founded', 'Launched'
  ],
  achievement: [
    'Achieved', 'Exceeded', 'Surpassed', 'Delivered', 'Accomplished', 'Attained',
    'Earned', 'Won', 'Secured', 'Generated', 'Produced', 'Yielded'
  ],
  improvement: [
    'Improved', 'Enhanced', 'Optimized', 'Streamlined', 'Upgraded', 'Refined',
    'Revamped', 'Transformed', 'Modernized', 'Revolutionized', 'Elevated', 'Advanced'
  ],
  creation: [
    'Developed', 'Created', 'Designed', 'Built', 'Engineered', 'Architected',
    'Constructed', 'Formulated', 'Authored', 'Crafted', 'Devised', 'Conceptualized'
  ],
  analysis: [
    'Analyzed', 'Evaluated', 'Assessed', 'Investigated', 'Examined', 'Researched',
    'Diagnosed', 'Audited', 'Reviewed', 'Studied', 'Explored', 'Interpreted'
  ],
  implementation: [
    'Implemented', 'Executed', 'Deployed', 'Rolled-out', 'Instituted', 'Integrated',
    'Incorporated', 'Applied', 'Utilized', 'Employed', 'Operated', 'Administered'
  ],
  collaboration: [
    'Collaborated', 'Partnered', 'Facilitated', 'Negotiated', 'Liaised', 'Consulted',
    'Advised', 'Mentored', 'Coached', 'Trained', 'Educated', 'Guided'
  ],
  growth: [
    'Increased', 'Expanded', 'Grew', 'Scaled', 'Accelerated', 'Boosted',
    'Amplified', 'Extended', 'Broadened', 'Doubled', 'Tripled', 'Multiplied'
  ],
  efficiency: [
    'Reduced', 'Decreased', 'Minimized', 'Eliminated', 'Consolidated', 'Automated',
    'Simplified', 'Standardized', 'Centralized', 'Restructured', 'Reorganized', 'Systematized'
  ],
  technical: [
    'Programmed', 'Coded', 'Configured', 'Debugged', 'Tested', 'Maintained',
    'Migrated', 'Integrated', 'Customized', 'Troubleshot', 'Resolved', 'Patched'
  ]
};

// Flatten all action verbs for easy access
const ALL_ACTION_VERBS = Object.values(ACTION_VERBS).flat();

// Weak verbs to avoid
const WEAK_VERBS = [
  'responsible for', 'duties included', 'helped with', 'assisted in',
  'worked on', 'participated in', 'involved in', 'tasked with'
];


// ============================================================================
// SCHEMAS
// ============================================================================

const KeywordSchema = z.object({
  keyword: z.string(),
  category: z.string(),
  importance: z.enum(['critical', 'high', 'moderate', 'supplementary']),
  score: z.number().min(1).max(4)
});
z.object({
  resume: z.record(z.any()),
  jobTitle: z.string(),
  jobDescription: z.string(),
  companyName: z.string().optional(),
  industryContext: z.string().optional()
});

const TargetingOutputSchema = z.object({
  optimizedResume: z.record(z.any()),
  enhancedSections: z.array(z.string()),
  keywordIntegration: z.object({
    integrated: z.array(z.string()),
    total: z.number(),
    rate: z.number()
  }),
  actionVerbUsage: z.object({
    strong: z.array(z.string()),
    replaced: z.array(z.string()),
    duplicates: z.number()
  }),
  matchScore: z.number(),
  changesSummary: z.array(z.string())
});

// ============================================================================
// LAYER 1: Document Structure & Intent Recognition
// ============================================================================

const analyzeJobStructure = ai.definePrompt({
  name: 'analyzeJobStructure',
  input: { 
    schema: z.object({
      jobDescription: z.string(),
      jobTitle: z.string()
    })
  },
  output: {
    schema: z.object({
      organizationalContext: z.string(),
      positionRequirements: z.array(z.string()),
      desiredQualifications: z.array(z.string()),
      industryPatterns: z.array(z.string())
    })
  },
  prompt: `As a seasoned hiring manager who never overlooks any details, analyze this job posting structure.

JOB TITLE: {{jobTitle}}
JOB DESCRIPTION: {{jobDescription}}

Identify and extract:
1. Organizational context and company culture indicators
2. Core position requirements (must-haves)
3. Desired qualifications (nice-to-haves)
4. Industry-specific language patterns and conventions

Be thorough and precise. Missing critical requirements is unacceptable.`
});

// ============================================================================
// LAYER 2 & 3: Term Extraction, Relevance Weighting & Semantic Expansion
// ============================================================================

const extractAndWeighKeywords = ai.definePrompt({
  name: 'extractAndWeighKeywords',
  input: {
    schema: z.object({
      jobDescription: z.string(),
      jobTitle: z.string(),
      requirements: z.array(z.string()),
      qualifications: z.array(z.string())
    })
  },
  output: {
    schema: z.object({
      keywords: z.array(KeywordSchema)
    })
  },
  prompt: `Extract and weigh ALL relevant keywords from this job description with the precision of an expert talent acquisition specialist.

JOB: {{jobTitle}}
DESCRIPTION: {{jobDescription}}
REQUIREMENTS: {{requirements}}
QUALIFICATIONS: {{qualifications}}

For EVERY keyword you identify:

1. Extract the exact term (disambiguate compound phrases like "financial modeling, forecasting and risk" into separate keywords)
2. Assign a category from these 12 strategic categories:
   - Technical Proficiencies
   - Process Frameworks
   - Educational Credentials
   - Industry Certifications
   - Leadership Capabilities
   - Sector Expertise
   - Core Competencies
   - Seniority Indicators
   - Compliance & Governance
   - Performance Orientation
   - Communication Skills
   - Innovation & Strategy

3. Determine importance level:
   - critical: Mission-critical requirement (score: 4)
   - high: High-priority preference (score: 3)
   - moderate: Valuable addition (score: 2)
   - supplementary: Useful but not essential (score: 1)

Extract at least 30 keywords. Be comprehensive - missing keywords means missing opportunities.`
});

// ============================================================================
// SECTION ENHANCEMENT PROMPTS
// ============================================================================

const enhanceExperienceSection = ai.definePrompt({
  name: 'enhanceExperienceSection',
  input: {
    schema: z.object({
      experiences: z.array(z.any()),
      keywords: z.array(KeywordSchema),
      jobTitle: z.string(),
      jobDescription: z.string(),
      actionVerbs: z.array(z.string())
    })
  },
  output: {
    schema: z.object({
      enhanced: z.array(z.object({
        company: z.string(),
        role: z.string(),
        location: z.string().optional(),
        description: z.string(),
        datebegin: z.string(),
        dateend: z.string(),
        index: z.number()
      })),
      verbsUsed: z.array(z.string()),
      keywordsIntegrated: z.array(z.string())
    })
  },
  prompt: `You are a seasoned hiring manager optimizing experience descriptions for ATS and human review.

TARGET JOB: {{jobTitle}}
CRITICAL KEYWORDS TO INTEGRATE: {{keywords}}
STRONG ACTION VERBS TO USE: {{actionVerbs}}

CURRENT EXPERIENCES:
{{experiences}}

TRANSFORMATION RULES:
1. Start EVERY bullet with a strong action verb from the provided list
2. Integrate keywords naturally - no stuffing
3. Add specific metrics and quantifiable results where credible
4. Show technical depth relevant to the target role
5. Connect each experience to job requirements
6. Replace weak phrases like "responsible for" with impact statements
7. Maintain truthfulness - enhance and align, don't fabricate
8. Use varied action verbs - maximum 2 uses of the same verb

For each experience, enhance the description bullets to powerfully demonstrate relevance to the target position.`
});

const enhanceSkillsSection = ai.definePrompt({
  name: 'enhanceSkillsSection',
  input: {
    schema: z.object({
      skills: z.array(z.any()),
      keywords: z.array(KeywordSchema),
      jobTitle: z.string()
    })
  },
  output: {
    schema: z.object({
      enhanced: z.array(z.object({
        category: z.string(),
        keywords: z.string(),
        index: z.number()
      })),
      keywordsIntegrated: z.array(z.string())
    })
  },
  prompt: `Optimize the skills section for maximum ATS impact.

TARGET JOB: {{jobTitle}}
CRITICAL KEYWORDS: {{keywords}}
CURRENT SKILLS: {{skills}}

Reorganize and enhance:
1. Lead with most relevant skills for this role
2. Integrate missing critical keywords naturally
3. Group related skills logically
4. Maximum 8 items per category
5. Use industry-standard terminology
6. Prioritize by job relevance`
});

const enhanceSummary = ai.definePrompt({
  name: 'enhanceSummary',
  input: {
    schema: z.object({
      summary: z.string(),
      keywords: z.array(KeywordSchema),
      jobTitle: z.string(),
      companyName: z.string().optional()
    })
  },
  output: {
    schema: z.object({
      enhanced: z.string(),
      keywordsIntegrated: z.array(z.string())
    })
  },
  prompt: `Enhance this professional summary for the target position.

CURRENT SUMMARY: {{summary}}
TARGET POSITION: {{jobTitle}}
{{#companyName}}COMPANY: {{companyName}}{{/companyName}}
CRITICAL KEYWORDS: {{keywords}}

Create a compelling 2-3 sentence summary that:
1. Leads with strongest relevant qualification
2. Mentions company name if provided
3. Integrates 2-3 critical keywords naturally
4. Ends with specific value proposition
5. Maintains authenticity while aligning to role`
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function validateActionVerbs(text: string): { 
  verbsUsed: string[], 
  duplicates: number, 
  weakVerbsFound: string[] 
} {
  const verbsUsed: string[] = [];
  const verbCounts: { [verb: string]: number } = {};
  const weakVerbsFound: string[] = [];

  // Check for weak verbs
  WEAK_VERBS.forEach(weak => {
    if (text.toLowerCase().includes(weak)) {
      weakVerbsFound.push(weak);
    }
  });

  // Count action verb usage
  ALL_ACTION_VERBS.forEach(verb => {
    const regex = new RegExp(`\\b${verb}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) {
      verbsUsed.push(verb);
      verbCounts[verb.toLowerCase()] = matches.length;
    }
  });

  // Count duplicates (more than 2 uses)
  const duplicates = Object.values(verbCounts).filter(count => count > 2).length;

  return { verbsUsed, duplicates, weakVerbsFound };
}

function extractRMSExperiences(resume: any): any[] {
  const experiences = [];
  const count = resume.rms_experience_count || 0;
  
  for (let i = 0; i < count; i++) {
    experiences.push({
      company: resume[`rms_experience_${i}_company`],
      role: resume[`rms_experience_${i}_role`],
      location: resume[`rms_experience_${i}_location`],
      description: resume[`rms_experience_${i}_description`],
      datebegin: resume[`rms_experience_${i}_datebegin`],
      dateend: resume[`rms_experience_${i}_dateend`],
      index: i
    });
  }
  
  return experiences;
}

function extractRMSSkills(resume: any): any[] {
  const skills = [];
  const count = resume.rms_skill_count || 0;
  
  for (let i = 0; i < count; i++) {
    skills.push({
      category: resume[`rms_skill_${i}_category`],
      keywords: resume[`rms_skill_${i}_keywords`],
      index: i
    });
  }
  
  return skills;
}

function applyEnhancedExperiences(resume: any, enhanced: any[]): any {
  const updated = { ...resume };
  
  enhanced.forEach((exp: any) => {
    const i = exp.index;
    updated[`rms_experience_${i}_description`] = exp.description;
  });
  
  return updated;
}

function applyEnhancedSkills(resume: any, enhanced: any[]): any {
  const updated = { ...resume };
  
  enhanced.forEach((skill: any) => {
    const i = skill.index;
    updated[`rms_skill_${i}_category`] = skill.category;
    updated[`rms_skill_${i}_keywords`] = skill.keywords;
  });
  
  return updated;
}

// ============================================================================
// MAIN TARGETING FUNCTION
// ============================================================================

export async function targetResume(
  resume: Record<string, any>,
  jobTitle: string,
  jobDescription: string,
  companyName?: string,
  industryContext?: string
): Promise<z.infer<typeof TargetingOutputSchema>> {
  try {
    console.log(`🎯 Starting advanced resume targeting for: ${jobTitle}`);
    
    // Layer 1: Document Structure Analysis
    const { output: structure } = await analyzeJobStructure({
      jobDescription,
      jobTitle
    });

    // Layers 2 & 3: Keyword Extraction and Weighting
    const { output: keywordAnalysis } = await extractAndWeighKeywords({
      jobDescription,
      jobTitle,
      requirements: structure!.positionRequirements,
      qualifications: structure!.desiredQualifications
    });

    const keywords = keywordAnalysis!.keywords;
    const criticalKeywords = keywords.filter(k => k.score >= 3);
    
    console.log(`📊 Extracted ${keywords.length} keywords, ${criticalKeywords.length} critical`);

    let optimizedResume = { ...resume };
    const enhancedSections: string[] = [];
    const integratedKeywords: string[] = [];

    // Select appropriate action verbs for this role
    const roleBasedVerbs = [
      ...ACTION_VERBS.achievement,
      ...ACTION_VERBS.implementation,
      ...ACTION_VERBS.creation,
      ...ACTION_VERBS.improvement
    ];

    // Enhance Experience Section
    const experiences = extractRMSExperiences(resume);
    if (experiences.length > 0) {
      const { output: enhancedExp } = await enhanceExperienceSection({
        experiences,
        keywords: criticalKeywords,
        jobTitle,
        jobDescription,
        actionVerbs: roleBasedVerbs
      });

      if (enhancedExp) {
        optimizedResume = applyEnhancedExperiences(optimizedResume, enhancedExp.enhanced);
        enhancedSections.push('experience');
        integratedKeywords.push(...enhancedExp.keywordsIntegrated);
      }
    }

    // Enhance Skills Section
    const skills = extractRMSSkills(resume);
    if (skills.length > 0) {
      const { output: enhancedSkills } = await enhanceSkillsSection({
        skills,
        keywords: criticalKeywords,
        jobTitle
      });

      if (enhancedSkills) {
        optimizedResume = applyEnhancedSkills(optimizedResume, enhancedSkills.enhanced);
        enhancedSections.push('skills');
        integratedKeywords.push(...enhancedSkills.keywordsIntegrated);
      }
    }

    // Enhance Summary (only if it exists)
    if (resume.rms_summary) {
      const { output: enhancedSummary } = await enhanceSummary({
        summary: resume.rms_summary,
        keywords: criticalKeywords,
        jobTitle,
        companyName
      });

      if (enhancedSummary) {
        optimizedResume.rms_summary = enhancedSummary.enhanced;
        enhancedSections.push('summary');
        integratedKeywords.push(...enhancedSummary.keywordsIntegrated);
      }
    }

    // Validate action verb usage
    const resumeText = JSON.stringify(optimizedResume);
    const verbValidation = validateActionVerbs(resumeText);

    // Calculate match score
    const uniqueIntegrated = Array.from(new Set(integratedKeywords));
    const integrationRate = (uniqueIntegrated.length / criticalKeywords.length) * 100;
    const baseScore = 40;
    const keywordScore = integrationRate * 0.4;
    const verbScore = verbValidation.duplicates === 0 ? 10 : 5;
    const matchScore = Math.min(95, baseScore + keywordScore + verbScore);

    // Add metadata
    optimizedResume = {
      ...optimizedResume,
      userId: resume.userId,
      fileUrl: resume.fileUrl,
      createdAt: resume.createdAt,
      updatedAt: new Date().toISOString(),
      isTargeted: true,
      targetJobTitle: jobTitle,
      targetCompany: companyName,
      lastTargetedDate: new Date().toISOString()
    };

    return {
      optimizedResume,
      enhancedSections,
      keywordIntegration: {
        integrated: uniqueIntegrated,
        total: criticalKeywords.length,
        rate: integrationRate
      },
      actionVerbUsage: {
        strong: verbValidation.verbsUsed,
        replaced: verbValidation.weakVerbsFound,
        duplicates: verbValidation.duplicates
      },
      matchScore,
      changesSummary: [
        `Optimized for ${jobTitle}${companyName ? ` at ${companyName}` : ''}`,
        `Enhanced ${enhancedSections.length} sections`,
        `Integrated ${uniqueIntegrated.length} of ${criticalKeywords.length} critical keywords`,
        `Used ${verbValidation.verbsUsed.length} strong action verbs`,
        `Match score: ${matchScore.toFixed(0)}%`
      ]
    };

  } catch (error) {
    console.error('❌ Targeting failed:', error);
    throw error;
  }
}

// ============================================================================
// API COMPATIBILITY WRAPPER
// ============================================================================

export const targetResumeFlow = async (input: {
  resumeData: {
    parsedData: Record<string, any>;
  };
  jobTitle: string;
  jobDescription: string;
  companyName?: string;
  missingKeywords?: string[];
}) => {
  try {
    const result = await targetResume(
      input.resumeData.parsedData,
      input.jobTitle,
      input.jobDescription,
      input.companyName
    );

    return {
      optimizedFields: result.optimizedResume,
      success: result.matchScore > 0,
      matchScore: result.matchScore
    };
  } catch (error) {
    console.error('Error in targetResumeFlow:', error);
    return {
      optimizedFields: input.resumeData.parsedData,
      success: false,
      matchScore: 0
    };
  }
};