// app/api/reviews/[reviewId]/download/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { adminDb } from '@/lib/server/auth/firebase-admin';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function GET(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const session = await auth(request);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const reviewDoc = await adminDb.collection('reviews').doc(params.reviewId).get();
    
    if (!reviewDoc.exists) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }
    
    const reviewData = reviewDoc.data();
    
    // Ensure user owns this review
    if (reviewData.userId !== session.user.uid) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }
    
    // Fetch associated resume data
    const resumeDoc = await adminDb.collection('resumes').doc(reviewData.resumeId).get();
    const resumeData = resumeDoc.exists ? resumeDoc.data() : null;
    
    const review = {
      id: reviewDoc.id,
      ...reviewData,
      resume: resumeData ? {
        name: resumeData.name,
        dataUri: resumeData.dataUri,
      } : null,
    };

    if (!review.resume) {
      return NextResponse.json(
        { error: 'Associated resume not found' },
        { status: 404 }
      );
    }

    if (review.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Review not completed yet' },
        { status: 400 }
      );
    }

    // Generate PDF report
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const page = pdfDoc.addPage([612, 792]); // US Letter size
    const { width, height } = page.getSize();

    let yPosition = height - 50;
    const margin = 50;
    const lineHeight = 20;

    // Title
    page.drawText('Resume Review Report', {
      x: margin,
      y: yPosition,
      size: 24,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 40;

    // Resume name
    page.drawText(`Resume: ${review.resume.name}`, {
      x: margin,
      y: yPosition,
      size: 14,
      font: font,
      color: rgb(0, 0, 0),
    });
    yPosition -= 30;

    // Overall score
    page.drawText(`Overall Score: ${review.overallScore}/10`, {
      x: margin,
      y: yPosition,
      size: 16,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 30;

    // Summary
    page.drawText('Summary:', {
      x: margin,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= lineHeight;

    const summaryLines = wrapText(review.summary, 70);
    for (const line of summaryLines) {
      page.drawText(line, {
        x: margin,
        y: yPosition,
        size: 12,
        font: font,
        color: rgb(0, 0, 0),
      });
      yPosition -= lineHeight;
    }
    yPosition -= 10;

    // Strengths
    page.drawText('Strengths:', {
      x: margin,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= lineHeight;

    for (const strength of review.strengths) {
      const strengthLines = wrapText(`• ${strength}`, 70);
      for (const line of strengthLines) {
        page.drawText(line, {
          x: margin,
          y: yPosition,
          size: 12,
          font: font,
          color: rgb(0, 0, 0),
        });
        yPosition -= lineHeight;
      }
    }
    yPosition -= 10;

    // Weaknesses
    page.drawText('Areas for Improvement:', {
      x: margin,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= lineHeight;

    for (const weakness of review.weaknesses) {
      const weaknessLines = wrapText(`• ${weakness}`, 70);
      for (const line of weaknessLines) {
        page.drawText(line, {
          x: margin,
          y: yPosition,
          size: 12,
          font: font,
          color: rgb(0, 0, 0),
        });
        yPosition -= lineHeight;
      }
    }
    yPosition -= 10;

    // Recommendations (if space allows)
    if (yPosition > 200) {
      page.drawText('Recommendations:', {
        x: margin,
        y: yPosition,
        size: 14,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= lineHeight;

      for (const rec of review.recommendations.slice(0, 3)) { // Limit to first 3 for space
        const recText = `${rec.category} (${rec.priority}): ${rec.description}`;
        const recLines = wrapText(`• ${recText}`, 70);
        for (const line of recLines) {
          if (yPosition < 100) break; // Stop if we're running out of space
          page.drawText(line, {
            x: margin,
            y: yPosition,
            size: 11,
            font: font,
            color: rgb(0, 0, 0),
          });
          yPosition -= lineHeight;
        }
      }
    }

    // Generate PDF bytes
    const pdfBytes = await pdfDoc.save();

    // Return PDF as download
    const fileName = `${review.resume.name}_review.pdf`;

    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': pdfBytes.length.toString(),
      },
    });

  } catch (error) {
    console.error('Download review API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to wrap text
function wrapText(text: string, maxLength: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + word).length <= maxLength) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}