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

const enhanceSingleExperience = ai.definePrompt({
  name: 'enhanceSingleExperience',
  input: {
    schema: z.object({
      company: z.string(),
      role: z.string(),
      location: z.string().optional(),
      dateBegin: z.string(),
      dateEnd: z.string(),
      originalDescription: z.string(),
      keywords: z.string(),
      jobTitle: z.string(),
      jobDescription: z.string(),
      availableActionVerbs: z.string(),
      usedActionVerbs: z.string()
    })
  },
  output: {
    schema: z.object({
      enhanced: z.object({
        company: z.string(),
        role: z.string(),
        location: z.string().optional(),
        description: z.string(),
        datebegin: z.string(),
        dateend: z.string()
      }),
      verbsUsed: z.array(z.string()),
      keywordsIntegrated: z.array(z.string())
    })
  },
  prompt: `You are a seasoned hiring manager optimizing a SINGLE work experience for maximum relevance to the target role.

TARGET JOB: {{jobTitle}}
JOB DESCRIPTION: {{jobDescription}}
CRITICAL KEYWORDS TO INTEGRATE: {{keywords}}

EXPERIENCE TO ENHANCE:
Company: {{company}}
Role: {{role}}
Location: {{location}}
Dates: {{dateBegin}} - {{dateEnd}}
Current Description: {{originalDescription}}

AVAILABLE ACTION VERBS: {{availableActionVerbs}}
ALREADY USED VERBS (DO NOT REUSE): {{usedActionVerbs}}

CRITICAL RULES:
1. ONLY enhance THIS specific experience - do NOT borrow achievements from other roles
2. Base enhancements ONLY on the provided original description for THIS role
3. Start EVERY bullet with a UNIQUE action verb from available verbs (not used verbs)
4. Integrate keywords that are genuinely relevant to THIS specific role
5. Add credible metrics and quantifiable results that fit THIS company/role context
6. Show technical depth relevant to BOTH the original role AND target job
7. Maintain complete authenticity - enhance what exists, don't fabricate
8. NO DUPLICATING achievements from other experiences

FORMATTING REQUIREMENTS:
- Create exactly 3-4 bullet points maximum
- Each bullet: "•Action verb + achievement + quantified impact"
- Keep bullets concise (aim for 1-2 lines when formatted on resume)
- Avoid excessive technical detail lists - focus on impact over process
- Use specific metrics and results

Focus exclusively on this one experience. Create compelling, authentic bullets that showcase how THIS specific role prepares the candidate for the target position.`
});

const enhanceSingleSkillCategory = ai.definePrompt({
  name: 'enhanceSingleSkillCategory',
  input: {
    schema: z.object({
      category: z.string(),
      currentKeywords: z.string(),
      targetKeywords: z.string(),
      jobTitle: z.string(),
      allExistingCategories: z.string(),
      usedSkills: z.string()
    })
  },
  output: {
    schema: z.object({
      enhanced: z.object({
        category: z.string(),
        keywords: z.string()
      }),
      keywordsIntegrated: z.array(z.string())
    })
  },
  prompt: `You are optimizing a SINGLE skill category for maximum relevance to the target job.

TARGET JOB: {{jobTitle}}
TARGET KEYWORDS TO INTEGRATE: {{targetKeywords}}

SKILL CATEGORY TO ENHANCE:
Category Name: {{category}}
Current Keywords: {{currentKeywords}}

EXISTING CATEGORIES (do not duplicate): {{allExistingCategories}}
ALREADY USED SKILLS (do NOT include): {{usedSkills}}

CRITICAL RULES:
1. ONLY enhance THIS specific category - do not merge with or duplicate other categories
2. Keep the category focused and coherent (e.g., don't mix programming languages with soft skills)
3. Integrate target keywords that genuinely fit this category type
4. Use industry-standard terminology
5. Prioritize keywords most relevant to the target job
6. Maximum 8 keywords per category
7. Maintain logical grouping within the category
8. ABSOLUTELY NO DUPLICATE SKILLS - do not include any skill that appears in "ALREADY USED SKILLS"
9. Avoid similar variations (e.g., if "NodeJS" is used, don't include "Node.js")

OUTPUT:
- Enhanced category name (can refine for clarity)
- Comma-separated list of keywords, prioritized by relevance
- Focus on quality over quantity

Ensure this category remains distinct and doesn't overlap with existing categories.`
});

const enhanceSummary = ai.definePrompt({
  name: 'enhanceSummary',
  input: {
    schema: z.object({
      summary: z.string(),
      keywords: z.string(),
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

const enhanceSingleProject = ai.definePrompt({
  name: 'enhanceSingleProject',
  input: {
    schema: z.object({
      title: z.string(),
      originalDescription: z.string(),
      url: z.string().optional(),
      dateBegin: z.string().optional(),
      dateEnd: z.string().optional(),
      keywords: z.string(),
      jobTitle: z.string(),
      availableActionVerbs: z.string(),
      usedActionVerbs: z.string()
    })
  },
  output: {
    schema: z.object({
      enhanced: z.object({
        description: z.string()
      }),
      verbsUsed: z.array(z.string()),
      keywordsIntegrated: z.array(z.string())
    })
  },
  prompt: `Enhance this SINGLE project description to showcase relevance to the target role.

TARGET JOB: {{jobTitle}}
CRITICAL KEYWORDS: {{keywords}}

PROJECT TO ENHANCE:
Title: {{title}}
{{#url}}URL: {{url}}{{/url}}
{{#dateBegin}}Timeline: {{dateBegin}}{{#dateEnd}} - {{dateEnd}}{{/dateEnd}}{{/dateBegin}}
Current Description: {{originalDescription}}

AVAILABLE ACTION VERBS: {{availableActionVerbs}}
ALREADY USED VERBS (DO NOT REUSE): {{usedActionVerbs}}

CRITICAL RULES:
1. ONLY enhance THIS specific project - do not borrow from other projects
2. Base enhancements ONLY on the provided original description
3. Start EVERY bullet with a UNIQUE action verb from available verbs
4. Integrate keywords that genuinely relate to this project's scope
5. Add credible metrics and technical details relevant to the project
6. Show how this project demonstrates skills for the target role
7. Maintain complete authenticity - enhance what exists, don't fabricate

FORMATTING:
- Create exactly 3-4 bullet points maximum
- Each bullet: "•Action verb + technical achievement + measurable impact"
- Keep bullets concise (aim for 1-2 lines when formatted on resume)
- Focus on key technologies and measurable outcomes, avoid lengthy tech stacks`
});

const enhanceSingleInvolvement = ai.definePrompt({
  name: 'enhanceSingleInvolvement',
  input: {
    schema: z.object({
      organization: z.string(),
      role: z.string(),
      originalDescription: z.string(),
      dateBegin: z.string().optional(),
      dateEnd: z.string().optional(),
      keywords: z.string(),
      jobTitle: z.string(),
      availableActionVerbs: z.string(),
      usedActionVerbs: z.string()
    })
  },
  output: {
    schema: z.object({
      enhanced: z.object({
        description: z.string()
      }),
      verbsUsed: z.array(z.string()),
      keywordsIntegrated: z.array(z.string())
    })
  },
  prompt: `Enhance this SINGLE involvement/volunteer experience to highlight transferable skills for the target role.

TARGET JOB: {{jobTitle}}
CRITICAL KEYWORDS: {{keywords}}

INVOLVEMENT TO ENHANCE:
Organization: {{organization}}
Role: {{role}}
{{#dateBegin}}Timeline: {{dateBegin}}{{#dateEnd}} - {{dateEnd}}{{/dateEnd}}{{/dateBegin}}
Current Description: {{originalDescription}}

AVAILABLE ACTION VERBS: {{availableActionVerbs}}
ALREADY USED VERBS (DO NOT REUSE): {{usedActionVerbs}}

CRITICAL RULES:
1. ONLY enhance THIS specific involvement - do not copy from other experiences
2. Base enhancements ONLY on the provided original description
3. Start EVERY bullet with a UNIQUE action verb from available verbs
4. Highlight transferable skills relevant to the target job
5. Add credible metrics about impact, scale, or results
6. Show leadership, collaboration, and technical skills gained
7. Connect volunteer work to professional competencies

FORMATTING:
- Create exactly 2-3 bullet points maximum
- Each bullet: "•Action verb + contribution + measurable impact"
- Keep bullets concise (aim for 1-2 lines when formatted on resume)
- Focus on transferable professional skills and quantifiable results`
});

const enhanceSingleCertification = ai.definePrompt({
  name: 'enhanceSingleCertification',
  input: {
    schema: z.object({
      name: z.string(),
      issuer: z.string(),
      originalDescription: z.string(),
      dateIssued: z.string().optional(),
      dateExpires: z.string().optional(),
      keywords: z.string(),
      jobTitle: z.string()
    })
  },
  output: {
    schema: z.object({
      enhanced: z.object({
        description: z.string()
      }),
      keywordsIntegrated: z.array(z.string())
    })
  },
  prompt: `Enhance this SINGLE certification description to emphasize its relevance to the target role.

TARGET JOB: {{jobTitle}}
CRITICAL KEYWORDS: {{keywords}}

CERTIFICATION TO ENHANCE:
Name: {{name}}
Issuer: {{issuer}}
{{#dateIssued}}Issued: {{dateIssued}}{{/dateIssued}}
{{#dateExpires}}Expires: {{dateExpires}}{{/dateExpires}}
Current Description: {{originalDescription}}

ENHANCEMENT RULES:
1. Focus on skills and competencies gained from this certification
2. Connect certification content to target job requirements
3. Integrate relevant keywords naturally
4. Highlight practical applications and technical depth
5. Keep descriptions concise but impactful (1-2 sentences)
6. Emphasize current relevance and ongoing validity

Create a compelling description that shows how this certification directly supports qualification for the target role.`
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

  // Count duplicates (more than 1 use - zero duplicates allowed)
  const duplicates = Object.values(verbCounts).filter(count => count > 1).length;

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

function extractRMSProjects(resume: any): any[] {
  const projects = [];
  const count = resume.rms_project_count || 0;
  
  for (let i = 0; i < count; i++) {
    projects.push({
      title: resume[`rms_project_${i}_title`],
      description: resume[`rms_project_${i}_description`],
      url: resume[`rms_project_${i}_url`],
      dateBegin: resume[`rms_project_${i}_datebegin`],
      dateEnd: resume[`rms_project_${i}_dateend`],
      index: i
    });
  }
  
  return projects;
}

function extractRMSInvolvement(resume: any): any[] {
  const involvement = [];
  const count = resume.rms_involvement_count || 0;
  
  for (let i = 0; i < count; i++) {
    involvement.push({
      organization: resume[`rms_involvement_${i}_organization`],
      role: resume[`rms_involvement_${i}_role`],
      description: resume[`rms_involvement_${i}_description`],
      dateBegin: resume[`rms_involvement_${i}_datebegin`],
      dateEnd: resume[`rms_involvement_${i}_dateend`],
      index: i
    });
  }
  
  return involvement;
}

function extractRMSCertifications(resume: any): any[] {
  const certifications = [];
  const count = resume.rms_certification_count || 0;
  
  for (let i = 0; i < count; i++) {
    certifications.push({
      name: resume[`rms_certification_${i}_name`],
      issuer: resume[`rms_certification_${i}_issuer`],
      description: resume[`rms_certification_${i}_description`],
      dateIssued: resume[`rms_certification_${i}_dateissued`],
      dateExpires: resume[`rms_certification_${i}_dateexpires`],
      index: i
    });
  }
  
  return certifications;
}

function applyEnhancedExperiences(resume: any, enhanced: any[]): any {
  const updated = { ...resume };
  
  enhanced.forEach((exp: any) => {
    const i = exp.index;
    // Ensure proper bullet formatting
    let description = exp.description;
    
    // If the description is one long text block, try to split into bullets
    if (!description.includes('•') && description.length > 200) {
      // Split on periods followed by capital letters or common sentence starters
      const sentences = description.split(/(?<=\.)\s*(?=[A-Z]|Developed|Implemented|Created|Built|Designed|Led|Managed)/)
        .filter((s: string) => s.trim().length > 20); // Only keep substantial sentences
      
      if (sentences.length > 1) {
        description = sentences.map((sentence: string) => 
          sentence.trim().startsWith('•') ? sentence.trim() : `•${sentence.trim()}`
        ).join('\n');
      }
    }
    
    // Ensure each line starts with a bullet if it doesn't already
    description = description
      .split('\n')
      .map((line: string) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('•')) {
          return `•${trimmed}`;
        }
        return line;
      })
      .join('\n');
    
    updated[`rms_experience_${i}_description`] = description;
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

function applyEnhancedProjects(resume: any, enhanced: any[]): any {
  const updated = { ...resume };
  
  enhanced.forEach((project: any) => {
    const i = project.index;
    updated[`rms_project_${i}_description`] = project.description;
  });
  
  return updated;
}

function applyEnhancedInvolvement(resume: any, enhanced: any[]): any {
  const updated = { ...resume };
  
  enhanced.forEach((involvement: any) => {
    const i = involvement.index;
    updated[`rms_involvement_${i}_description`] = involvement.description;
  });
  
  return updated;
}

function applyEnhancedCertifications(resume: any, enhanced: any[]): any {
  const updated = { ...resume };
  
  enhanced.forEach((cert: any) => {
    const i = cert.index;
    updated[`rms_certification_${i}_description`] = cert.description;
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
    const usedActionVerbs: string[] = []; // Global tracking across ALL sections

    // Select appropriate action verbs for this role
    const roleBasedVerbs = [
      ...ACTION_VERBS.achievement,
      ...ACTION_VERBS.implementation,
      ...ACTION_VERBS.creation,
      ...ACTION_VERBS.improvement
    ];

    // Enhance Experience Section - Process each experience individually
    const experiences = extractRMSExperiences(resume);
    if (experiences.length > 0) {
      const enhancedExperiences: any[] = [];
      
      // Serialize keywords for prompt (same for all experiences)
      const keywordsText = criticalKeywords.map(k => 
        `${k.keyword} (${k.category}, importance: ${k.importance})`
      ).join(', ');
      
      // Process each experience individually to prevent cross-contamination
      for (let i = 0; i < experiences.length; i++) {
        const exp = experiences[i];
        
        // Create available verbs list (excluding already used ones)
        const availableVerbs = roleBasedVerbs.filter(verb => 
          !usedActionVerbs.includes(verb.toLowerCase())
        );
        
        const availableVerbsText = availableVerbs.slice(0, 15).join(', ');
        const usedVerbsText = usedActionVerbs.join(', ');
        
        console.log(`🔄 Processing experience ${i + 1}/${experiences.length}: ${exp.company} - ${exp.role}`);
        
        try {
          const { output: enhancedSingle } = await enhanceSingleExperience({
            company: exp.company || 'Unknown Company',
            role: exp.role || 'Unknown Role',
            location: exp.location || '',
            dateBegin: exp.datebegin || 'Unknown',
            dateEnd: exp.dateend || 'Unknown',
            originalDescription: exp.description || 'No description available',
            keywords: keywordsText,
            jobTitle,
            jobDescription,
            availableActionVerbs: availableVerbsText,
            usedActionVerbs: usedVerbsText
          });

          if (enhancedSingle) {
            // Add the enhanced experience with original index
            enhancedExperiences.push({
              ...enhancedSingle.enhanced,
              index: exp.index
            });
            
            // Track used action verbs to prevent duplicates
            enhancedSingle.verbsUsed.forEach(verb => {
              if (!usedActionVerbs.includes(verb.toLowerCase())) {
                usedActionVerbs.push(verb.toLowerCase());
              }
            });
            
            // Collect integrated keywords
            integratedKeywords.push(...enhancedSingle.keywordsIntegrated);
            
            console.log(`✅ Enhanced ${exp.company} experience, used verbs: ${enhancedSingle.verbsUsed.join(', ')}`);
          }
        } catch (error) {
          console.error(`❌ Failed to enhance experience ${i + 1}:`, error);
          // Keep original experience if enhancement fails
          enhancedExperiences.push({
            ...exp,
            index: exp.index
          });
        }
      }

      // Apply all enhanced experiences
      if (enhancedExperiences.length > 0) {
        optimizedResume = applyEnhancedExperiences(optimizedResume, enhancedExperiences);
        enhancedSections.push('experience');
        console.log(`🎯 Enhanced ${enhancedExperiences.length} experiences with ${usedActionVerbs.length} unique verbs`);
      }
    }

    // Enhance Skills Section - Process each category individually
    const skills = extractRMSSkills(resume);
    if (skills.length > 0) {
      const enhancedSkillCategories: any[] = [];
      const usedSkills: string[] = []; // Track used skills to prevent duplicates
      
      // Serialize target keywords for prompt (same for all categories)
      const targetKeywordsText = criticalKeywords
        .filter(k => k.category === 'Technical Proficiencies' || k.category === 'Core Competencies')
        .map(k => `${k.keyword} (${k.importance})`)
        .join(', ');
      
      // Create a summary of all existing categories to prevent duplication
      const existingCategoriesText = skills.map(s => s.category || 'Unnamed').join(', ');
      
      // Process each skill category individually
      for (let i = 0; i < skills.length; i++) {
        const skill = skills[i];
        
        console.log(`🔄 Processing skill category ${i + 1}/${skills.length}: ${skill.category}`);
        
        // Create list of already used skills to avoid duplicates
        const usedSkillsText = usedSkills.join(', ');
        
        try {
          const { output: enhancedCategory } = await enhanceSingleSkillCategory({
            category: skill.category || `Category ${i + 1}`,
            currentKeywords: skill.keywords || 'No keywords',
            targetKeywords: targetKeywordsText,
            jobTitle,
            allExistingCategories: existingCategoriesText,
            usedSkills: usedSkillsText
          });

          if (enhancedCategory) {
            // Parse and deduplicate keywords
            const categoryKeywords = enhancedCategory.enhanced.keywords
              .split(',')
              .map(k => k.trim())
              .filter(k => k && !usedSkills.some(used => 
                used.toLowerCase() === k.toLowerCase() || 
                k.toLowerCase().includes(used.toLowerCase()) ||
                used.toLowerCase().includes(k.toLowerCase())
              ));
            
            // Add unique keywords to the used list
            categoryKeywords.forEach(keyword => {
              if (!usedSkills.some(used => used.toLowerCase() === keyword.toLowerCase())) {
                usedSkills.push(keyword);
              }
            });
            
            // Add the enhanced category with deduplicated keywords
            enhancedSkillCategories.push({
              category: enhancedCategory.enhanced.category,
              keywords: categoryKeywords.join(', '),
              index: skill.index
            });
            
            // Collect integrated keywords
            integratedKeywords.push(...enhancedCategory.keywordsIntegrated);
            
            console.log(`✅ Enhanced "${skill.category}" → "${enhancedCategory.enhanced.category}" (${categoryKeywords.length} unique skills)`);
          }
        } catch (error) {
          console.error(`❌ Failed to enhance skill category ${i + 1}:`, error);
          // Keep original category if enhancement fails
          enhancedSkillCategories.push({
            category: skill.category,
            keywords: skill.keywords,
            index: skill.index
          });
        }
      }

      // Apply all enhanced skill categories
      if (enhancedSkillCategories.length > 0) {
        optimizedResume = applyEnhancedSkills(optimizedResume, enhancedSkillCategories);
        enhancedSections.push('skills');
        console.log(`🎯 Enhanced ${enhancedSkillCategories.length} skill categories`);
        console.log('Final skill structure:', enhancedSkillCategories.map(s => ({ 
          index: s.index, 
          category: s.category, 
          keywords: s.keywords?.substring(0, 50) + '...' 
        })));
      }
    }

    // Enhance Projects Section - Process each project individually
    const projects = extractRMSProjects(resume);
    if (projects.length > 0) {
      const enhancedProjects: any[] = [];
      
      // Serialize keywords for prompt
      const keywordsText = criticalKeywords
        .filter(k => k.category === 'Technical Proficiencies' || k.category === 'Core Competencies')
        .map(k => `${k.keyword} (${k.importance})`)
        .join(', ');
      
      for (let i = 0; i < projects.length; i++) {
        const project = projects[i];
        
        // Create available verbs list (excluding already used ones)
        const availableVerbs = roleBasedVerbs.filter(verb => 
          !usedActionVerbs.includes(verb.toLowerCase())
        );
        
        const availableVerbsText = availableVerbs.slice(0, 10).join(', ');
        const usedVerbsText = usedActionVerbs.join(', ');
        
        console.log(`🔄 Processing project ${i + 1}/${projects.length}: ${project.title}`);
        
        try {
          const { output: enhancedProject } = await enhanceSingleProject({
            title: project.title || 'Untitled Project',
            originalDescription: project.description || 'No description available',
            url: project.url || '',
            dateBegin: project.dateBegin || '',
            dateEnd: project.dateEnd || '',
            keywords: keywordsText,
            jobTitle,
            availableActionVerbs: availableVerbsText,
            usedActionVerbs: usedVerbsText
          });

          if (enhancedProject) {
            enhancedProjects.push({
              ...enhancedProject.enhanced,
              index: project.index
            });
            
            // Track used action verbs
            enhancedProject.verbsUsed.forEach(verb => {
              if (!usedActionVerbs.includes(verb.toLowerCase())) {
                usedActionVerbs.push(verb.toLowerCase());
              }
            });
            
            integratedKeywords.push(...enhancedProject.keywordsIntegrated);
            console.log(`✅ Enhanced "${project.title}" project, used verbs: ${enhancedProject.verbsUsed.join(', ')}`);
          }
        } catch (error) {
          console.error(`❌ Failed to enhance project ${i + 1}:`, error);
          enhancedProjects.push({
            description: project.description,
            index: project.index
          });
        }
      }

      if (enhancedProjects.length > 0) {
        optimizedResume = applyEnhancedProjects(optimizedResume, enhancedProjects);
        enhancedSections.push('projects');
        console.log(`🎯 Enhanced ${enhancedProjects.length} projects`);
      }
    }

    // Enhance Involvement Section - Process each involvement individually
    const involvement = extractRMSInvolvement(resume);
    if (involvement.length > 0) {
      const enhancedInvolvement: any[] = [];
      
      // Serialize keywords for prompt
      const keywordsText = criticalKeywords
        .filter(k => k.category === 'Leadership Capabilities' || k.category === 'Core Competencies')
        .map(k => `${k.keyword} (${k.importance})`)
        .join(', ');
      
      for (let i = 0; i < involvement.length; i++) {
        const inv = involvement[i];
        
        // Create available verbs list (excluding already used ones)
        const availableVerbs = roleBasedVerbs.filter(verb => 
          !usedActionVerbs.includes(verb.toLowerCase())
        );
        
        const availableVerbsText = availableVerbs.slice(0, 10).join(', ');
        const usedVerbsText = usedActionVerbs.join(', ');
        
        console.log(`🔄 Processing involvement ${i + 1}/${involvement.length}: ${inv.organization} - ${inv.role}`);
        
        try {
          const { output: enhancedInv } = await enhanceSingleInvolvement({
            organization: inv.organization || 'Organization',
            role: inv.role || 'Volunteer',
            originalDescription: inv.description || 'No description available',
            dateBegin: inv.dateBegin || '',
            dateEnd: inv.dateEnd || '',
            keywords: keywordsText,
            jobTitle,
            availableActionVerbs: availableVerbsText,
            usedActionVerbs: usedVerbsText
          });

          if (enhancedInv) {
            enhancedInvolvement.push({
              ...enhancedInv.enhanced,
              index: inv.index
            });
            
            // Track used action verbs
            enhancedInv.verbsUsed.forEach(verb => {
              if (!usedActionVerbs.includes(verb.toLowerCase())) {
                usedActionVerbs.push(verb.toLowerCase());
              }
            });
            
            integratedKeywords.push(...enhancedInv.keywordsIntegrated);
            console.log(`✅ Enhanced "${inv.organization}" involvement, used verbs: ${enhancedInv.verbsUsed.join(', ')}`);
          }
        } catch (error) {
          console.error(`❌ Failed to enhance involvement ${i + 1}:`, error);
          enhancedInvolvement.push({
            description: inv.description,
            index: inv.index
          });
        }
      }

      if (enhancedInvolvement.length > 0) {
        optimizedResume = applyEnhancedInvolvement(optimizedResume, enhancedInvolvement);
        enhancedSections.push('involvement');
        console.log(`🎯 Enhanced ${enhancedInvolvement.length} involvements`);
      }
    }

    // Enhance Certifications Section - Process each certification individually
    const certifications = extractRMSCertifications(resume);
    if (certifications.length > 0) {
      const enhancedCertifications: any[] = [];
      
      // Serialize keywords for prompt
      const keywordsText = criticalKeywords
        .filter(k => k.category === 'Technical Proficiencies' || k.category === 'Industry Certifications')
        .map(k => `${k.keyword} (${k.importance})`)
        .join(', ');
      
      for (let i = 0; i < certifications.length; i++) {
        const cert = certifications[i];
        
        console.log(`🔄 Processing certification ${i + 1}/${certifications.length}: ${cert.name}`);
        
        try {
          const { output: enhancedCert } = await enhanceSingleCertification({
            name: cert.name || 'Certification',
            issuer: cert.issuer || 'Issuing Organization',
            originalDescription: cert.description || 'Professional certification',
            dateIssued: cert.dateIssued || '',
            dateExpires: cert.dateExpires || '',
            keywords: keywordsText,
            jobTitle
          });

          if (enhancedCert) {
            enhancedCertifications.push({
              ...enhancedCert.enhanced,
              index: cert.index
            });
            
            integratedKeywords.push(...enhancedCert.keywordsIntegrated);
            console.log(`✅ Enhanced "${cert.name}" certification`);
          }
        } catch (error) {
          console.error(`❌ Failed to enhance certification ${i + 1}:`, error);
          enhancedCertifications.push({
            description: cert.description,
            index: cert.index
          });
        }
      }

      if (enhancedCertifications.length > 0) {
        optimizedResume = applyEnhancedCertifications(optimizedResume, enhancedCertifications);
        enhancedSections.push('certifications');
        console.log(`🎯 Enhanced ${enhancedCertifications.length} certifications`);
      }
    }

    // Enhance Summary (only if it exists)
    if (resume.rms_summary) {
      // Serialize keywords for prompt
      const keywordsText = criticalKeywords.map(k => 
        `${k.keyword} (${k.category}, importance: ${k.importance})`
      ).join(', ');
      
      const { output: enhancedSummary } = await enhanceSummary({
        summary: resume.rms_summary,
        keywords: keywordsText,
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