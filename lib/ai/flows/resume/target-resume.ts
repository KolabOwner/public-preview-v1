'use server';

/**
 * @fileOverview Minimal Touch Resume Targeting System
 * Philosophy: Less is more. Small, strategic changes beat massive rewrites.
 */

import { ai } from '@/lib/ai/genkit';
import { z } from 'genkit';

// ============================================================================
// CORE PHILOSOPHY: MINIMAL CHANGES, MAXIMUM IMPACT
// ============================================================================

const TARGETING_RULES = {
  // HARD LIMITS - NEVER EXCEED
  maxChangesPerSection: 3,      // Max 3 changes per experience/project
  maxKeywordAdditions: 10,       // Total new keywords across entire resume
  maxVerbReplacements: 5,        // Only replace weak verbs
  preserveSpecificity: true,     // Never replace "ElasticSearch" with "database"

  // QUALITY CHECKS
  requireNaturalLanguage: true,  // Every change must sound natural
  banCapitalizedKeywords: true,  // No "Web Applications" - use "web applications"
  preventDuplication: true,       // Never add skill that already exists

  // TARGETING STRATEGY
  keywordPlacementStrategy: 'strategic', // Not 'everywhere'
  changeOnlyIfNeeded: true,             // If bullet is good, leave it alone
};

// ============================================================================
// SCHEMAS
// ============================================================================

const ChangeSchema = z.object({
  original: z.string(),
  modified: z.string(),
  reason: z.string(),
  keywordsAdded: z.array(z.string())
});

// ============================================================================
// OPTIMIZED PROMPTS
// ============================================================================

const analyzeKeywordGaps = ai.definePrompt({
  name: 'analyzeKeywordGaps',
  input: {
    schema: z.object({
      resume: z.string(),
      jobDescription: z.string(),
      jobTitle: z.string()
    })
  },
  output: {
    schema: z.object({
      missingRequired: z.array(z.string()),
      missingPreferred: z.array(z.string()),
      alreadyPresent: z.array(z.string()),
      recommendations: z.array(z.object({
        keyword: z.string(),
        whereToPutIt: z.string(),
        howToAddNaturally: z.string()
      }))
    })
  },
  prompt: `You are an ATS expert analyzing keyword gaps. Be precise and minimal.

RESUME:
{{resume}}

JOB DESCRIPTION:
{{jobDescription}}

TARGET: {{jobTitle}}

TASK:
1. Identify REQUIRED keywords that are completely missing
2. Identify PREFERRED keywords that would help
3. List keywords ALREADY PRESENT (don't add these again!)
4. Recommend WHERE to add missing keywords naturally

CRITICAL RULES:
- Only flag keywords that are ACTUALLY missing
- If "JavaScript" is present, don't flag "JS" as missing
- If "web application" exists, don't add "Web Applications"
- Check for implied presence (e.g., "WCAG compliance" implies HTML/CSS knowledge)
- Maximum 10 missing keywords total

Focus on what's truly missing, not variations of what's already there.`
});

const makeMinimalChanges = ai.definePrompt({
  name: 'makeMinimalChanges',
  input: {
    schema: z.object({
      section: z.string(),
      content: z.string(),
      missingKeywords: z.array(z.string()),
      maxChanges: z.number(),
      sectionType: z.enum(['experience', 'project', 'skills', 'education'])
    })
  },
  output: {
    schema: z.object({
      changes: z.array(ChangeSchema),
      finalContent: z.string(),
      keywordsAdded: z.array(z.string()),
      changeCount: z.number()
    })
  },
  prompt: `You are a professional resume editor making MINIMAL, STRATEGIC changes.

SECTION TYPE: {{sectionType}}
CURRENT CONTENT:
{{content}}

KEYWORDS TO ADD (only if natural): {{missingKeywords}}
MAXIMUM CHANGES ALLOWED: {{maxChanges}}

STRICT RULES:
1. Make the MINIMUM changes necessary
2. NEVER force keywords where they don't belong
3. NEVER capitalize keywords unnaturally (no "Web Applications")
4. NEVER replace specific terms with generic ones
5. NEVER add a keyword if a variation already exists
6. If a bullet is already strong, DON'T CHANGE IT
7. Preserve all specific technologies (ElasticSearch, Firebase, etc.)
8. Maximum {{maxChanges}} changes total

SECTION-SPECIFIC STRATEGIES:
For EXPERIENCE sections:
- Look for places where implied skills can be made explicit
- "WCAG compliance" → "WCAG 2.1 AA compliance using HTML/CSS" (makes HTML/CSS explicit)
- "REST API" → "REST API endpoints handling JSON" (APIs use JSON, making it explicit)
- "web platform" → "web platform using HTML/CSS/JavaScript" (be specific once)
- "dashboard" → "web dashboard" (if it's a web role)

For PROJECT sections:
- Keep changes minimal, focus on adding missing tech stack mentions
- Only change if directly relevant to target role

For each change:
- Explain WHY it's necessary
- Show ORIGINAL vs MODIFIED
- List keywords added

If the section is already good, return 0 changes.

Examples of GOOD changes:
ORIGINAL: "Engineered accessible event management platform with WCAG 2.1 AA compliance"
MODIFIED: "Engineered accessible web platform using HTML/CSS with WCAG 2.1 AA compliance"
REASON: Makes HTML/CSS explicit since WCAG requires their use

ORIGINAL: "Established secure REST API endpoints with JWT authentication"
MODIFIED: "Established secure REST API endpoints with JWT authentication, handling 1,000+ daily JSON requests"
REASON: APIs typically use JSON, making it explicit is natural

Examples of BAD changes (DO NOT DO):
BAD: "Engineered Web Applications with Database Knowledge"
BAD: "Developed application showcasing Web Developer skills"
BAD: "Built Database-Driven Web Applications using Databases"

Remember: Less is more. Natural language beats keyword density.`
});

const optimizeSkillsSection = ai.definePrompt({
  name: 'optimizeSkillsSection',
  input: {
    schema: z.object({
      currentSkills: z.string(),
      requiredSkills: z.array(z.string()),
      preferredSkills: z.array(z.string())
    })
  },
  output: {
    schema: z.object({
      categories: z.array(z.object({
        name: z.string(),
        skills: z.string()
      })),
      addedSkills: z.array(z.string()),
      reasoning: z.string()
    })
  },
  prompt: `Add missing skills to the appropriate existing categories. Preserve the exact structure.

CURRENT SKILLS SECTION:
{{currentSkills}}

SKILLS TO ADD IF MISSING:
Required: {{requiredSkills}}
Preferred: {{preferredSkills}}

RULES:
1. Return EACH category as a separate object with its name and skills
2. Only add skills that are genuinely missing (check for variations)
3. Add each skill to the most logical category based on the existing pattern
4. Keep all skills comma-separated within each category
5. Maximum 8 new skills total
6. Preserve the original category names exactly
7. If HTML/CSS/JavaScript are missing from Programming Languages, add them there

Return the categories array with each category's name and updated skills list.`
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function validateNaturalLanguage(text: string): {
  isNatural: boolean,
  issues: string[]
} {
  const issues: string[] = [];

  // Check for unnatural capitalization
  const unnaturalCaps = /\b(Web Applications?|Web Developer|Database Knowledge|Application Development)\b/g;
  const capsMatches = text.match(unnaturalCaps);
  if (capsMatches) {
    issues.push(`Unnatural capitalization: ${capsMatches.join(', ')}`);
  }

  // Check for keyword stuffing patterns
  const stuffingPatterns = [
    /database[- ]driven.+database/i,
    /web application.+web application.+web/i,
    /application.+application.+application/i,
  ];

  stuffingPatterns.forEach(pattern => {
    if (pattern.test(text)) {
      issues.push('Keyword repetition detected');
    }
  });

  // Check for awkward insertions
  const awkwardPatterns = [
    /showcasing \w+ skills/i,
    /demonstrating \w+ knowledge/i,
    /extensive databases/i,
    /utilizing.+utilizing/i,
  ];

  awkwardPatterns.forEach(pattern => {
    if (pattern.test(text)) {
      issues.push('Awkward phrasing detected');
    }
  });

  return {
    isNatural: issues.length === 0,
    issues
  };
}

// Helper to update skills section properly
function updateSkillsSection(
  resume: Record<string, any>,
  optimizedSkills: any
): Record<string, any> {
  const updatedResume = { ...resume };

  if (!optimizedSkills?.categories) {
    return updatedResume;
  }

  const skillCount = resume.rms_skill_count || 0;

  optimizedSkills.categories.forEach((category: any, index: number) => {
    if (index < skillCount && category.name && category.skills) {
      updatedResume[`rms_skill_${index}_category`] = category.name;
      updatedResume[`rms_skill_${index}_keywords`] = category.skills;
    }
  });

  return updatedResume;
}

// ============================================================================
// MAIN TARGETING FUNCTION - MINIMAL TOUCH APPROACH
// ============================================================================

export async function targetResume(
  resume: Record<string, any>,
  jobTitle: string,
  jobDescription: string,
  companyName?: string
): Promise<any> {
  try {
    console.log(`🎯 Starting MINIMAL targeting for: ${jobTitle}`);
    console.log(`📝 Philosophy: Make the fewest changes possible`);

    // Step 1: Convert resume to text for analysis
    const resumeText = Object.entries(resume)
      .filter(([key]) => key.startsWith('rms_'))
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    // Step 2: Analyze what's actually missing
    const { output: gapAnalysis } = await analyzeKeywordGaps({
      resume: resumeText,
      jobDescription,
      jobTitle
    });

    if (!gapAnalysis) {
      throw new Error('Failed to analyze keyword gaps');
    }

    console.log(`📊 Gap Analysis:`);
    console.log(`  ✅ Already present: ${gapAnalysis.alreadyPresent.length} keywords`);
    console.log(`  ⚠️ Missing required: ${gapAnalysis.missingRequired.length} keywords`);
    console.log(`  💡 Missing preferred: ${gapAnalysis.missingPreferred.length} keywords`);

    // If most keywords are already present, minimal changes needed
    if (gapAnalysis.missingRequired.length === 0 && gapAnalysis.missingPreferred.length < 3) {
      console.log(`✅ Resume already well-optimized! Making minimal adjustments only.`);
    }

    let optimizedResume = { ...resume };
    let totalChanges = 0;
    const totalKeywordsAdded: string[] = [];

    // Step 3: Process experiences (allow slightly more changes for better integration)
    const experienceCount = resume.rms_experience_count || 0;
    for (let i = 0; i < experienceCount && i < 2; i++) { // Focus on first 2 experiences
      const description = resume[`rms_experience_${i}_description`];
      if (!description) continue;

      // For the first experience, be slightly more aggressive with keywords
      const relevantKeywords = i === 0
        ? gapAnalysis.missingRequired.slice(0, 4).filter(k => !totalKeywordsAdded.includes(k))
        : gapAnalysis.missingRequired.slice(0, 2).filter(k => !totalKeywordsAdded.includes(k));

      if (relevantKeywords.length === 0) continue;

      const maxChangesForThis = i === 0 ? 3 : 2; // Allow 3 changes for most recent role

      const { output: changes } = await makeMinimalChanges({
        section: `Experience ${i + 1}`,
        content: description,
        missingKeywords: relevantKeywords,
        maxChanges: maxChangesForThis,
        sectionType: 'experience'
      });

      if (changes && changes.changeCount > 0) {
        optimizedResume[`rms_experience_${i}_description`] = changes.finalContent;
        totalChanges += changes.changeCount;
        totalKeywordsAdded.push(...changes.keywordsAdded);

        console.log(`  ✏️ Experience ${i + 1}: ${changes.changeCount} minimal changes`);
      }
    }

    // Step 4: Process projects (even more minimal)
    const projectCount = resume.rms_project_count || 0;
    for (let i = 0; i < projectCount && totalKeywordsAdded.length < TARGETING_RULES.maxKeywordAdditions; i++) {
      const description = resume[`rms_project_${i}_description`];
      if (!description) continue;

      const relevantKeywords = gapAnalysis.missingPreferred
        .slice(0, 2) // Max 2 keywords per project
        .filter(k => !totalKeywordsAdded.includes(k));

      if (relevantKeywords.length === 0) continue;

      const { output: changes } = await makeMinimalChanges({
        section: `Project ${i + 1}`,
        content: description,
        missingKeywords: relevantKeywords,
        maxChanges: 1, // Max 1 change per project
        sectionType: 'project'
      });

      if (changes && changes.changeCount > 0) {
        optimizedResume[`rms_project_${i}_description`] = changes.finalContent;
        totalChanges += changes.changeCount;
        totalKeywordsAdded.push(...changes.keywordsAdded);

        console.log(`  ✏️ Project ${i + 1}: ${changes.changeCount} minimal changes`);
      }
    }

    // Step 5: Optimize skills (add only truly missing skills)
    const skillsContent = [];
    const skillCount = resume.rms_skill_count || 0;

    for (let i = 0; i < skillCount; i++) {
      const category = resume[`rms_skill_${i}_category`];
      const keywords = resume[`rms_skill_${i}_keywords`];
      if (category && keywords) {
        skillsContent.push(`${category}: ${keywords}`);
      }
    }

    if (skillsContent.length > 0) {
      const { output: optimizedSkills } = await optimizeSkillsSection({
        currentSkills: skillsContent.join('\n'),
        requiredSkills: gapAnalysis.missingRequired.filter(k => !totalKeywordsAdded.includes(k)),
        preferredSkills: gapAnalysis.missingPreferred.filter(k => !totalKeywordsAdded.includes(k))
      });

      if (optimizedSkills && optimizedSkills.categories && optimizedSkills.addedSkills.length > 0) {
        // Use the helper function to update skills properly
        optimizedResume = updateSkillsSection(optimizedResume, optimizedSkills);
        totalKeywordsAdded.push(...optimizedSkills.addedSkills);
        console.log(`  ✏️ Skills: Added ${optimizedSkills.addedSkills.length} missing skills`);
      }
    }

    // Step 6: Final validation
    const optimizedText = Object.entries(optimizedResume)
      .filter(([key]) => key.startsWith('rms_'))
      .map(([key, value]) => `${value}`)
      .join(' ');

    const validation = validateNaturalLanguage(optimizedText);

    if (!validation.isNatural) {
      console.warn(`⚠️ Natural language issues detected: ${validation.issues.join(', ')}`);
    }

    // Calculate match score
    const matchScore = Math.min(95,
      70 + // Base score for having most requirements
      (totalKeywordsAdded.length * 2) + // 2 points per keyword added
      (validation.isNatural ? 10 : 0) // Bonus for natural language
    );

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

    console.log(`\n📊 Targeting Summary:`);
    console.log(`  Total changes made: ${totalChanges}`);
    console.log(`  Keywords added: ${totalKeywordsAdded.length}`);
    console.log(`  Natural language: ${validation.isNatural ? '✅' : '⚠️'}`);
    console.log(`  Match score: ${matchScore}%`);

    return {
      optimizedResume,
      enhancedSections: totalChanges > 0 ? ['minimal'] : [],
      keywordIntegration: {
        integrated: totalKeywordsAdded,
        total: gapAnalysis.missingRequired.length + gapAnalysis.missingPreferred.length,
        rate: (totalKeywordsAdded.length / Math.max(1, gapAnalysis.missingRequired.length)) * 100
      },
      actionVerbUsage: {
        strong: [],
        replaced: [],
        duplicates: 0
      },
      matchScore,
      changesSummary: [
        `Minimal optimization for ${jobTitle}${companyName ? ` at ${companyName}` : ''}`,
        `Made only ${totalChanges} strategic changes`,
        `Added ${totalKeywordsAdded.length} missing keywords naturally`,
        validation.isNatural ? '✅ Maintained natural language' : '⚠️ Some phrasing may sound forced',
        `Match score: ${matchScore}%`
      ]
    };

  } catch (error) {
    console.error('❌ Targeting failed:', error);
    throw error;
  }
}

// ============================================================================
// API WRAPPER
// ============================================================================

export const targetResumeFlow = async (input: {
  resumeData: {
    parsedData: Record<string, any>;
  };
  jobTitle: string;
  jobDescription: string;
  companyName?: string;
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