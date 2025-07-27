// app/api/templates/search/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { AdminTemplateService } from '@/lib/server/services/template/admin-template-service';
import { TemplateSearchParams } from '@/types/template.types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const params: TemplateSearchParams = {
      type: searchParams.get('type') as 'resume' | 'cover_letter' || 'resume',
      industry: searchParams.get('industry') as any,
      experienceLevel: searchParams.get('experienceLevel') as any,
      keywords: searchParams.get('keywords')?.split(',').filter(Boolean),
      isPremium: searchParams.get('isPremium') ? searchParams.get('isPremium') === 'true' : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
      sortBy: searchParams.get('sortBy') as any || 'popularity',
      sortOrder: searchParams.get('sortOrder') as any || 'desc'
    };

    const result = await AdminTemplateService.searchTemplates(params);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in template search API:', error);
    return NextResponse.json(
      { error: 'Failed to search templates' },
      { status: 500 }
    );
  }
}