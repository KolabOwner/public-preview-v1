// app/api/templates/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { AdminTemplateService } from '@/lib/server/services/template/admin-template-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') as 'resume' | 'cover_letter' || 'resume';
    
    const template = await AdminTemplateService.getTemplate(params.id, type);
    
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error getting template:', error);
    return NextResponse.json(
      { error: 'Failed to get template' },
      { status: 500 }
    );
  }
}