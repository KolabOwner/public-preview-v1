import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/lib/ai/genkit';
import { z } from 'genkit';

const ACTION_VERBS = [
  'Developed', 'Implemented', 'Created', 'Built', 'Designed', 'Led', 'Managed', 
  'Optimized', 'Improved', 'Enhanced', 'Achieved', 'Delivered', 'Coordinated',
  'Established', 'Streamlined', 'Automated', 'Analyzed', 'Collaborated',
  'Executed', 'Increased', 'Reduced', 'Transformed', 'Architected'
];

const generateSingleBullet = ai.definePrompt({
  name: 'generateSingleBullet',
  input: {
    schema: z.object({
      keyword: z.string(),
      company: z.string(),
      position: z.string(),
      currentDescription: z.string(),
      jobTitle: z.string(),
      jobDescription: z.string()
    })
  },
  output: {
    schema: z.object({
      bullet: z.string()
    })
  },
  prompt: `You are an expert resume writer helping create a compelling bullet point that incorporates a specific keyword.

TARGET KEYWORD: {{keyword}}
CURRENT ROLE: {{position}} at {{company}}
TARGET JOB: {{jobTitle}}
CURRENT EXPERIENCE DESCRIPTION: {{currentDescription}}
TARGET JOB DESCRIPTION: {{jobDescription}}

AVAILABLE ACTION VERBS: ${ACTION_VERBS.join(', ')}

CRITICAL REQUIREMENTS:
1. Create exactly ONE bullet point that naturally incorporates the keyword "{{keyword}}"
2. Start with a strong action verb from the available list
3. Make it relevant to both the current role at {{company}} and the target job
4. Include quantifiable metrics when possible (percentages, numbers, timeframes)
5. Keep it concise (under 120 characters)
6. Ensure it sounds authentic for someone in the {{position}} role
7. Do NOT use bullet symbols (•) - return just the text
8. Make it achievement-focused, not responsibility-focused

EXAMPLES OF GOOD BULLET POINTS:
- "Implemented agile methodologies resulting in 30% faster project delivery"
- "Developed Python automation scripts reducing manual processing time by 2 hours daily"
- "Led cross-functional team of 5 engineers to deliver cloud migration ahead of schedule"

Generate a single, powerful bullet point that showcases relevant experience while naturally incorporating "{{keyword}}".`
});

export async function POST(request: NextRequest) {
  try {
    const { keyword, company, position, currentDescription, jobTitle, jobDescription } = await request.json();

    if (!keyword || !company || !position) {
      return NextResponse.json(
        { error: 'Missing required fields: keyword, company, position' },
        { status: 400 }
      );
    }

    console.log(`🎯 Generating bullet for keyword: ${keyword}`);

    const { output } = await generateSingleBullet({
      keyword,
      company,
      position,
      currentDescription: currentDescription || 'No description available',
      jobTitle: jobTitle || 'Software Engineer',
      jobDescription: jobDescription || 'Software engineering role'
    });

    if (!output?.bullet) {
      throw new Error('No bullet point generated');
    }

    // Clean up the bullet point
    let cleanBullet = output.bullet.trim();
    
    // Remove any leading bullet symbols if present
    cleanBullet = cleanBullet.replace(/^[•·▪-]\s*/, '');
    
    // Ensure it doesn't end with a period unless it's already there
    if (!cleanBullet.endsWith('.') && !cleanBullet.endsWith('!')) {
      cleanBullet += '.';
    }

    console.log(`✅ Generated bullet: ${cleanBullet}`);

    return NextResponse.json({ bullet: cleanBullet });

  } catch (error) {
    console.error('❌ Bullet generation failed:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate bullet point' },
      { status: 500 }
    );
  }
}