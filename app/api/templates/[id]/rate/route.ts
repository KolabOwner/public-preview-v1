// app/api/templates/[id]/rate/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { AdminTemplateService } from '@/lib/server/services/admin-template-service';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { type, rating } = body;

    if (!type || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Valid type and rating (1-5) are required' },
        { status: 400 }
      );
    }

    await AdminTemplateService.updateTemplateRating(params.id, type, rating);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error rating template:', error);
    return NextResponse.json(
      { error: 'Failed to rate template' },
      { status: 500 }
    );
  }
}