import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, adminDb } from '@/lib/server/auth/firebase-admin';
import { targetResumeFlow } from '@/lib/ai/flows/resume/target-resume';

interface TargetResumeRequest {
  resumeId: string;
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await verifyIdToken(idToken);
    
    if (!decodedToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const userId = decodedToken.uid;
    
    // Parse request body
    const body: TargetResumeRequest = await request.json();
    const { resumeId } = body;
    
    if (!resumeId) {
      return NextResponse.json({ error: 'Resume ID is required' }, { status: 400 });
    }
    
    // Fetch the resume data
    const resumeDoc = await adminDb.collection('resumes').doc(resumeId).get();
    
    if (!resumeDoc.exists) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }
    
    const resumeData = resumeDoc.data();
    
    // Verify the resume belongs to the authenticated user
    if (resumeData?.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized access to resume' }, { status: 403 });
    }
    
    // Check if job information exists in the resume
    if (!resumeData.job_info || !resumeData.job_info.title || !resumeData.job_info.description) {
      return NextResponse.json({ 
        error: 'No job information found. Please associate job details with this resume first.',
        code: 'MISSING_JOB_INFO'
      }, { status: 400 });
    }

    const jobInfo = resumeData.job_info;
    
    // Extract keywords from existing ATS analysis
    const targetKeywords = jobInfo.extractedKeywords?.map((k: any) => k.keyword) || [];
    const missingKeywordsRaw = jobInfo.missingKeywords || 
                               jobInfo.atsAnalysis?.missingKeywords || 
                               [];
    
    // Extract just the keyword strings from the objects
    const missingKeywords = Array.isArray(missingKeywordsRaw) 
      ? missingKeywordsRaw.map((k: any) => 
          typeof k === 'string' ? k : k.keyword
        ).filter(Boolean)
      : [];
    
    // Run the target resume AI flow with keywords from ATS analysis
    const targetingResult = await targetResumeFlow({
      resumeData: {
        parsedData: resumeData.parsedData || resumeData
      },
      jobTitle: jobInfo.title,
      jobDescription: jobInfo.description,
      companyName: jobInfo.company || '',
    });
    
    // The optimizedFields from our new implementation contains the ENTIRE optimized resume
    // Use ONLY the optimized resume data, don't merge with original
    const optimizedResumeData = targetingResult.optimizedFields || {};

    // Create the final targeted resume document using ONLY the optimized data
    const targetedResumeData = {
      // Use the complete optimized resume as the base
      ...optimizedResumeData,
      
      // Only override with essential metadata (preserve original values where needed)
      title: `${resumeData.title} - ${jobInfo.title} (Targeted)`,
      isTargeted: true,
      
      // Preserve critical original fields that shouldn't be changed by AI
      userId: resumeData.userId || userId,
      fileUrl: resumeData.fileUrl, // Keep original file reference
      
      // Add targeting metadata
      job_info: {
        ...jobInfo, // Keep existing job info
        targeting_applied_at: new Date().toISOString(),
        targeted_from_resume_id: resumeId
      },
      targeting_summary: {
        matchScore: targetingResult.matchScore,
        optimizedFieldsCount: Object.keys(optimizedResumeData).length,
        success: targetingResult.success
      },
      ai_targeting_metadata: {
        source_resume_id: resumeId,
        targeting_date: new Date().toISOString(),
        job_title: jobInfo.title,
        company: jobInfo.company || '',
        targeting_score: targetingResult.matchScore || 0
      },
      
      // Timestamps for the new targeted resume
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save the targeted resume
    const docRef = await adminDb.collection('resumes').add(targetedResumeData);

    // Apply optimized document settings for the targeted resume
    try {
      const optimizedSettings = {
        zoom: 120,
        fontFamily: 'Merriweather',
        primaryColor: '#000000',
        textColor: '#000000',
        fontSize: 11,
        lineHeight: 1.5,  // Optimized for readability
        sectionSpacing: 1,  // Better section separation
        paperSize: 'Letter',
        margins: {
          top: 0.5,    // Narrow margins for more content space
          right: 0.5,
          bottom: 0.5,
          left: 0.5,
        },
        showIcons: false,
        showDividers: true,
        useIndent: false,
        viewAsPages: true,
        template: 'professional',
        lastUpdated: new Date().toISOString(),
        version: 1,
      };
      
      await adminDb.collection('resumes').doc(docRef.id).update({
        documentSettings: optimizedSettings
      });
    } catch (settingsError) {
      console.warn('Failed to apply optimized settings to targeted resume:', settingsError);
      // Continue even if settings update fails
    }

    return NextResponse.json({
      success: true,
      targetedResumeId: docRef.id,
      targetingSummary: {
        matchScore: targetingResult.matchScore,
        optimizedFieldsCount: Object.keys(optimizedResumeData).length,
        success: targetingResult.success
      },
      optimizedFields: Object.keys(optimizedResumeData),
      message: 'Resume successfully targeted and optimized for this job position'
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error targeting resume:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message }, 
      { status: 500 }
    );
  }
}