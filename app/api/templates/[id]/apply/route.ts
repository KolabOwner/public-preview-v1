// app/api/templates/[id]/apply/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { AdminTemplateService } from '@/lib/server/services/template/admin-template-service';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { type, resumeId } = body;

    if (!type || !resumeId) {
      return NextResponse.json(
        { error: 'Type and resumeId are required' },
        { status: 400 }
      );
    }

    // Increment template popularity
    await AdminTemplateService.incrementTemplatePopularity(params.id, type);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error applying template:', error);
    return NextResponse.json(
      { error: 'Failed to apply template' },
      { status: 500 }
    );
  }
}