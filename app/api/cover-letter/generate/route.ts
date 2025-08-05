import { NextRequest, NextResponse } from 'next/server';
import { generateCoverLetterFlow, GenerateCoverLetterInput } from '@/lib/ai/flows/cover-letter/generate';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as GenerateCoverLetterInput;
    
    // Debug logging
    console.log('Cover letter generation request received:', {
      hasResumeText: !!body.resumeText,
      resumeTextLength: body.resumeText?.length,
      jobTitle: body.jobTitle,
      companyName: body.companyName,
      keys: Object.keys(body)
    });
    
    // Validate required fields
    if (!body.resumeText || !body.jobTitle || !body.companyName) {
      return NextResponse.json(
        { error: 'Missing required fields: resumeText, jobTitle, companyName' },
        { status: 400 }
      );
    }

    // Call the AI flow
    console.log('Calling generateCoverLetterFlow with input:', {
      resumeTextLength: body.resumeText.length,
      jobTitle: body.jobTitle,
      companyName: body.companyName
    });
    
    const result = await generateCoverLetterFlow(body);
    
    console.log('generateCoverLetterFlow result:', {
      hasCoverLetter: !!result.coverLetter,
      coverLetterLength: result.coverLetter?.length,
      hasSections: !!result.sections,
      hasMetadata: !!result.metadata
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating cover letter:', error);
    return NextResponse.json(
      { error: 'Failed to generate cover letter' },
      { status: 500 }
    );
  }
}