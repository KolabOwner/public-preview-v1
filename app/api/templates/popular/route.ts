// app/api/templates/popular/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { AdminTemplateService } from '@/lib/server/services/template/admin-template-service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') as 'resume' | 'cover_letter' || 'resume';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
    
    const templates = await AdminTemplateService.getPopularTemplates(type, limit);
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error getting popular templates:', error);
    return NextResponse.json(
      { error: 'Failed to get popular templates' },
      { status: 500 }
    );
  }
}