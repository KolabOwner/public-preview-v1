// app/api/templates/by-industry/[industry]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { AdminTemplateService } from '@/lib/server/services/template/admin-template-service';
import { Industry } from '@/types/template.types';

export async function GET(
  request: NextRequest,
  { params }: { params: { industry: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') as 'resume' | 'cover_letter' || 'resume';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
    
    const templates = await AdminTemplateService.getTemplatesByIndustry(
      params.industry as Industry,
      type,
      limit
    );

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error getting templates by industry:', error);
    return NextResponse.json(
      { error: 'Failed to get templates by industry' },
      { status: 500 }
    );
  }
}