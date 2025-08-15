// GET /api/jobs - Search jobs using simplified LinkedIn scraper
// POST /api/jobs - Create new job (admin only)

import { NextRequest, NextResponse } from 'next/server';
import { 
  collection, 
  addDoc, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../../../config/firebase-config';
import { 
  Job, 
  SearchJobsResponse, 
  JobType, 
  ExperienceLevel 
} from '../../../types/job-board.types';
import { LinkedInScraper } from '../../../lib/linkedin-scraper';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const searchQuery = searchParams.get('q') || 'software engineer';
    const location = searchParams.get('location') || 'United States';
    const jobType = searchParams.get('type') as JobType | null;
    const experienceLevel = searchParams.get('level') as ExperienceLevel | null;
    const remote = searchParams.get('remote') === 'true';
    const pageSize = parseInt(searchParams.get('limit') || '25');
    const distance = parseInt(searchParams.get('distance') || '25');

    console.log('Job search request:', {
      searchQuery,
      location,
      jobType,
      experienceLevel,
      remote,
      pageSize
    });

    // Use LinkedIn scraper directly with JobSpy
    const scraper = new LinkedInScraper();
    
    try {
      const jobs = await scraper.searchJobs({
        keywords: searchQuery,
        location,
        distance,
        remote,
        jobType: jobType || undefined,
        experienceLevel: experienceLevel || undefined,
        limit: pageSize,
        hoursOld: 72 // 3 days
      });

      console.log(`✅ Successfully fetched ${jobs.length} jobs from LinkedIn`);

      const response: SearchJobsResponse = {
        jobs,
        lastDoc: null,
        hasMore: jobs.length >= pageSize,
        totalCount: jobs.length,
        sources: {
          internal: 0,
          external: jobs.length
        }
      };

      return NextResponse.json(response);
      
    } catch (scraperError) {
      console.error('LinkedIn scraper error:', scraperError);
      
      // Return empty results instead of error to maintain UI functionality
      const response: SearchJobsResponse = {
        jobs: [],
        lastDoc: null,
        hasMore: false,
        totalCount: 0,
        sources: {
          internal: 0,
          external: 0
        }
      };

      return NextResponse.json(response);
    }

  } catch (error) {
    console.error('Error searching jobs:', error);
    return NextResponse.json(
      { 
        error: 'Failed to search jobs', 
        message: error instanceof Error ? error.message : 'Unknown error',
        jobs: [],
        totalCount: 0
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const jobData = await request.json();
    
    // TODO: Add authentication check for admin users
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.isAdmin) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const newJob: Partial<Job> = {
      ...jobData,
      isActive: true,
      postedAt: Timestamp.now(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    const docRef = await addDoc(collection(db, 'jobs'), newJob);
    
    const createdJob = { id: docRef.id, ...newJob } as Job;
    
    return NextResponse.json(createdJob, { status: 201 });
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create job', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}