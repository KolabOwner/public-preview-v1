// scripts/check-templates.ts
// Quick script to check what templates exist in Firestore

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Firebase Admin SDK
if (!getApps().length) {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (serviceAccountKey) {
    try {
      const serviceAccount = JSON.parse(serviceAccountKey);
      initializeApp({
        credential: cert(serviceAccount),
        projectId: projectId,
      });
    } catch (error) {
      console.error('Failed to parse service account key:', error);
      process.exit(1);
    }
  } else {
    // Try to use default credentials or environment variables
    initializeApp({
      projectId: projectId,
    });
  }
}

const db = getFirestore();

async function checkTemplates() {
  try {
    console.log('🔍 Checking templates in Firestore...\n');

    // Check resume templates
    const resumeTemplatesRef = db.collection('resume_templates');
    const resumeSnapshot = await resumeTemplatesRef.limit(5).get();
    
    console.log(`📄 Resume templates count: ${resumeSnapshot.size}`);
    
    if (resumeSnapshot.size > 0) {
      console.log('Sample resume templates:');
      resumeSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`  - ${data.role} (${data.industry}, ${data.experienceLevel})`);
      });
    }
    
    console.log('');

    // Check cover letter templates
    const coverLetterTemplatesRef = db.collection('cover_letter_templates');
    const coverLetterSnapshot = await coverLetterTemplatesRef.limit(5).get();
    
    console.log(`💌 Cover letter templates count: ${coverLetterSnapshot.size}`);
    
    if (coverLetterSnapshot.size > 0) {
      console.log('Sample cover letter templates:');
      coverLetterSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`  - ${data.role} (${data.industry}, ${data.experienceLevel})`);
      });
    }

    console.log('');

    // Check templates by industry
    const industries = ['marketing', 'business', 'technology', 'healthcare', 'finance'];
    
    console.log('📊 Templates by industry:');
    for (const industry of industries) {
      const industrySnapshot = await resumeTemplatesRef.where('industry', '==', industry).get();
      console.log(`  - ${industry}: ${industrySnapshot.size} templates`);
    }

  } catch (error) {
    console.error('❌ Error checking templates:', error);
  }
}

checkTemplates().catch(console.error);