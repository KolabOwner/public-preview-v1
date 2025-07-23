import { NextRequest, NextResponse } from 'next/server';
import { generateCoverLetterFlow, GenerateCoverLetterInput } from '@/lib/ai/flows/cover-letter/generate';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as GenerateCoverLetterInput;
    
    // Validate required fields
    if (!body.resumeText || !body.jobTitle || !body.companyName) {
      return NextResponse.json(
        { error: 'Missing required fields: resumeText, jobTitle, companyName' },
        { status: 400 }
      );
    }

    // Call the AI flow
    const result = await generateCoverLetterFlow(body);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating cover letter:', error);
    return NextResponse.json(
      { error: 'Failed to generate cover letter' },
      { status: 500 }
    );
  }
}