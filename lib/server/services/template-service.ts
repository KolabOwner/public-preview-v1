// lib/server/services/template-service.ts

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit as firestoreLimit,
  startAfter,
  DocumentSnapshot,
  QueryConstraint,
  addDoc,
  serverTimestamp,
  increment,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/config/firebase-config';
import { 
  Template, 
  ResumeTemplate, 
  CoverLetterTemplate, 
  TemplateSearchParams,
  TemplateSearchResult,
  Industry,
  ExperienceLevel
} from '@/types/template.types';

const RESUME_TEMPLATES_COLLECTION = 'resume_templates';
const COVER_LETTER_TEMPLATES_COLLECTION = 'cover_letter_templates';

export class TemplateService {
  // Create a new template
  static async createTemplate(template: Omit<Template, 'id'>): Promise<string> {
    try {
      const collectionName = template.type === 'resume' 
        ? RESUME_TEMPLATES_COLLECTION 
        : COVER_LETTER_TEMPLATES_COLLECTION;
      
      const docRef = await addDoc(collection(db, collectionName), {
        ...template,
        metadata: {
          ...template.metadata,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  }

  // Batch create templates (for seeding)
  static async batchCreateTemplates(templates: Omit<Template, 'id'>[]): Promise<string[]> {
    try {
      const batch = writeBatch(db);
      const ids: string[] = [];
      
      for (const template of templates) {
        const collectionName = template.type === 'resume' 
          ? RESUME_TEMPLATES_COLLECTION 
          : COVER_LETTER_TEMPLATES_COLLECTION;
        
        const docRef = doc(collection(db, collectionName));
        ids.push(docRef.id);
        
        batch.set(docRef, {
          ...template,
          metadata: {
            ...template.metadata,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }
        });
      }
      
      await batch.commit();
      return ids;
    } catch (error) {
      console.error('Error batch creating templates:', error);
      throw error;
    }
  }

  // Get a single template by ID
  static async getTemplate(id: string, type: 'resume' | 'cover_letter'): Promise<Template | null> {
    try {
      const collectionName = type === 'resume' 
        ? RESUME_TEMPLATES_COLLECTION 
        : COVER_LETTER_TEMPLATES_COLLECTION;
      
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
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

      // Build query constraints
      const constraints: QueryConstraint[] = [
        where('metadata.isActive', '==', true)
      ];

      if (industry) {
        constraints.push(where('industry', '==', industry));
      }

      if (experienceLevel) {
        constraints.push(where('experienceLevel', '==', experienceLevel));
      }

      if (isPremium !== undefined) {
        constraints.push(where('metadata.isPremium', '==', isPremium));
      }

      if (keywords.length > 0) {
        constraints.push(where('keywords', 'array-contains-any', keywords));
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
      constraints.push(orderBy(sortField, sortOrder));

      // Add pagination
      constraints.push(firestoreLimit(limit + 1)); // Get one extra to check if there are more

      const q = query(collection(db, collectionName), ...constraints);
      const querySnapshot = await getDocs(q);
      
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

      const q = query(
        collection(db, collectionName),
        where('industry', '==', industry),
        where('metadata.isActive', '==', true),
        orderBy('metadata.popularity', 'desc'),
        firestoreLimit(limit)
      );

      const querySnapshot = await getDocs(q);
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

  // Update template popularity (when used)
  static async incrementTemplatePopularity(id: string, type: 'resume' | 'cover_letter'): Promise<void> {
    try {
      const collectionName = type === 'resume' 
        ? RESUME_TEMPLATES_COLLECTION 
        : COVER_LETTER_TEMPLATES_COLLECTION;
      
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        'metadata.popularity': increment(1),
        'metadata.updatedAt': serverTimestamp()
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
      
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const currentData = docSnap.data();
        const currentRating = currentData.metadata.rating || 0;
        const currentCount = currentData.metadata.ratingCount || 0;
        
        // Calculate new average rating
        const newAvgRating = ((currentRating * currentCount) + newRating) / (currentCount + 1);
        
        await updateDoc(docRef, {
          'metadata.rating': newAvgRating,
          'metadata.ratingCount': increment(1),
          'metadata.updatedAt': serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error updating template rating:', error);
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

      const q = query(
        collection(db, collectionName),
        where('metadata.isActive', '==', true),
        orderBy('metadata.popularity', 'desc'),
        firestoreLimit(limit)
      );

      const querySnapshot = await getDocs(q);
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

  // Helper method to generate role slug
  static generateRoleSlug(role: string): string {
    return role
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}