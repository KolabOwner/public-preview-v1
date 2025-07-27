// lib/server/services/admin-template-service.ts

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { 
  Template, 
  TemplateSearchParams,
  TemplateSearchResult,
  Industry,
  ExperienceLevel
} from '@/types/template.types';

// Initialize Firebase Admin SDK
if (!getApps().length) {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (serviceAccountKey) {
    try {
      const serviceAccount = JSON.parse(serviceAccountKey);
      initializeApp({
        credential: cert(serviceAccount),
        projectId: projectId,
      });
    } catch (error) {
      console.error('Failed to parse service account key:', error);
      // Fallback to individual credentials
      if (projectId && clientEmail && privateKey) {
        initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, '\n'),
          }),
          projectId,
        });
      }
    }
  } else if (projectId && clientEmail && privateKey) {
    // Use individual credential fields
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
      projectId,
    });
  } else {
    // Try to use default credentials or environment variables
    initializeApp({
      projectId: projectId,
    });
  }
}

const db = getFirestore();

const RESUME_TEMPLATES_COLLECTION = 'resume_templates';
const COVER_LETTER_TEMPLATES_COLLECTION = 'cover_letter_templates';

export class AdminTemplateService {
  // Search templates with filters
  static async searchTemplates(params: TemplateSearchParams): Promise<TemplateSearchResult> {
    try {
      const {
        type = 'resume',
        industry,
        experienceLevel,
        keywords = [],
        isPremium,
        limit = 20,
        offset = 0,
        sortBy = 'popularity',
        sortOrder = 'desc'
      } = params;

      const collectionName = type === 'resume' 
        ? RESUME_TEMPLATES_COLLECTION 
        : COVER_LETTER_TEMPLATES_COLLECTION;

      let query = db.collection(collectionName)
        .where('metadata.isActive', '==', true);

      if (industry) {
        query = query.where('industry', '==', industry);
      }

      if (experienceLevel) {
        query = query.where('experienceLevel', '==', experienceLevel);
      }

      if (isPremium !== undefined) {
        query = query.where('metadata.isPremium', '==', isPremium);
      }

      if (keywords.length > 0) {
        query = query.where('keywords', 'array-contains-any', keywords);
      }

      // Add sorting
      let sortField = 'metadata.popularity';
      switch (sortBy) {
        case 'rating':
          sortField = 'metadata.rating';
          break;
        case 'newest':
          sortField = 'metadata.createdAt';
          break;
        case 'alphabetical':
          sortField = 'role';
          break;
      }
      query = query.orderBy(sortField, sortOrder);

      // Add pagination
      query = query.limit(limit + 1); // Get one extra to check if there are more

      if (offset > 0) {
        query = query.offset(offset);
      }

      const querySnapshot = await query.get();
      
      const templates: Template[] = [];
      querySnapshot.forEach((doc) => {
        if (templates.length < limit) {
          templates.push({
            id: doc.id,
            ...doc.data()
          } as Template);
        }
      });

      return {
        templates,
        total: querySnapshot.size,
        hasMore: querySnapshot.size > limit
      };
    } catch (error) {
      console.error('Error searching templates:', error);
      throw error;
    }
  }

  // Get templates by industry
  static async getTemplatesByIndustry(
    industry: Industry, 
    type: 'resume' | 'cover_letter' = 'resume',
    limit: number = 10
  ): Promise<Template[]> {
    try {
      const collectionName = type === 'resume' 
        ? RESUME_TEMPLATES_COLLECTION 
        : COVER_LETTER_TEMPLATES_COLLECTION;

      const querySnapshot = await db.collection(collectionName)
        .where('industry', '==', industry)
        .where('metadata.isActive', '==', true)
        .orderBy('metadata.popularity', 'desc')
        .limit(limit)
        .get();

      const templates: Template[] = [];
      
      querySnapshot.forEach((doc) => {
        templates.push({
          id: doc.id,
          ...doc.data()
        } as Template);
      });

      return templates;
    } catch (error) {
      console.error('Error getting templates by industry:', error);
      throw error;
    }
  }

  // Get a single template by ID
  static async getTemplate(id: string, type: 'resume' | 'cover_letter'): Promise<Template | null> {
    try {
      const collectionName = type === 'resume' 
        ? RESUME_TEMPLATES_COLLECTION 
        : COVER_LETTER_TEMPLATES_COLLECTION;
      
      const docSnap = await db.collection(collectionName).doc(id).get();
      
      if (docSnap.exists) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Template;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting template:', error);
      throw error;
    }
  }

  // Get popular templates across all industries
  static async getPopularTemplates(
    type: 'resume' | 'cover_letter' = 'resume',
    limit: number = 10
  ): Promise<Template[]> {
    try {
      const collectionName = type === 'resume' 
        ? RESUME_TEMPLATES_COLLECTION 
        : COVER_LETTER_TEMPLATES_COLLECTION;

      const querySnapshot = await db.collection(collectionName)
        .where('metadata.isActive', '==', true)
        .orderBy('metadata.popularity', 'desc')
        .limit(limit)
        .get();

      const templates: Template[] = [];
      
      querySnapshot.forEach((doc) => {
        templates.push({
          id: doc.id,
          ...doc.data()
        } as Template);
      });

      return templates;
    } catch (error) {
      console.error('Error getting popular templates:', error);
      throw error;
    }
  }

  // Update template popularity (when used)
  static async incrementTemplatePopularity(id: string, type: 'resume' | 'cover_letter'): Promise<void> {
    try {
      const collectionName = type === 'resume' 
        ? RESUME_TEMPLATES_COLLECTION 
        : COVER_LETTER_TEMPLATES_COLLECTION;
      
      const docRef = db.collection(collectionName).doc(id);
      await docRef.update({
        'metadata.popularity': (await docRef.get()).data()?.metadata?.popularity + 1 || 1,
        'metadata.updatedAt': new Date()
      });
    } catch (error) {
      console.error('Error incrementing template popularity:', error);
      throw error;
    }
  }

  // Update template rating
  static async updateTemplateRating(
    id: string, 
    type: 'resume' | 'cover_letter',
    newRating: number
  ): Promise<void> {
    try {
      const collectionName = type === 'resume' 
        ? RESUME_TEMPLATES_COLLECTION 
        : COVER_LETTER_TEMPLATES_COLLECTION;
      
      const docRef = db.collection(collectionName).doc(id);
      const docSnap = await docRef.get();
      
      if (docSnap.exists) {
        const currentData = docSnap.data();
        const currentRating = currentData?.metadata?.rating || 0;
        const currentCount = currentData?.metadata?.ratingCount || 0;
        
        // Calculate new average rating
        const newAvgRating = ((currentRating * currentCount) + newRating) / (currentCount + 1);
        
        await docRef.update({
          'metadata.rating': newAvgRating,
          'metadata.ratingCount': currentCount + 1,
          'metadata.updatedAt': new Date()
        });
      }
    } catch (error) {
      console.error('Error updating template rating:', error);
      throw error;
    }
  }
}