// src/adapters/firebase/storage.ts
// Firebase storage adapter for resume data

import admin from 'firebase-admin';
import { RMSData } from '../../lib/schema';

/**
 * Firebase storage service for resume data
 */
export class FirebaseStorage {
  private firestore: admin.firestore.Firestore;
  private initialized: boolean = false;

  constructor() {
    this.initialize();
    this.firestore = admin.firestore();
  }

  /**
   * Initialize Firebase if not already initialized
   */
  private initialize(): void {
    if (this.initialized) return;

    try {
      // Check if app is already initialized
      admin.app();
    } catch (error) {
      // Initialize Firebase if not already initialized
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

      if (!projectId || !privateKey || !clientEmail) {
        throw new Error('Firebase credentials not properly configured');
      }

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          privateKey,
          clientEmail,
        }),
      });
    }

    this.initialized = true;
  }

  /**
   * Store resume metadata in Firestore
   */
  async storeResumeMetadata(userId: string, rmsData: RMSData): Promise<string> {
    try {
      // Generate document ID
      const docId = `${userId}_${Date.now()}`;

      // Store resume metadata
      const resumeRef = this.firestore.collection('resumes').doc(docId);
      await resumeRef.set({
        userId,
        rmsData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Store user-resume association
      const userResumeRef = this.firestore
        .collection('users')
        .doc(userId)
        .collection('resumes')
        .doc(docId);

      await userResumeRef.set({
        resumeId: docId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return docId;
    } catch (error) {
      console.error('Error storing resume metadata:', error);
      throw error;
    }
  }

  /**
   * Retrieve resume metadata from Firestore
   */
  async getResumeMetadata(resumeId: string): Promise<RMSData | null> {
    try {
      const resumeDoc = await this.firestore.collection('resumes').doc(resumeId).get();

      if (!resumeDoc.exists) {
        return null;
      }

      const data = resumeDoc.data();
      return data?.rmsData as RMSData;
    } catch (error) {
      console.error('Error retrieving resume metadata:', error);
      throw error;
    }
  }

  /**
   * List all resumes for a user
   */
  async listUserResumes(userId: string): Promise<Array<{ id: string; createdAt: Date }>> {
    try {
      const resumesSnapshot = await this.firestore
        .collection('users')
        .doc(userId)
        .collection('resumes')
        .orderBy('createdAt', 'desc')
        .get();

      return resumesSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
        };
      });
    } catch (error) {
      console.error('Error listing user resumes:', error);
      throw error;
    }
  }

  /**
   * Delete a resume
   */
  async deleteResume(userId: string, resumeId: string): Promise<void> {
    try {
      // Delete from main resumes collection
      await this.firestore.collection('resumes').doc(resumeId).delete();

      // Delete from user's resumes subcollection
      await this.firestore
        .collection('users')
        .doc(userId)
        .collection('resumes')
        .doc(resumeId)
        .delete();
    } catch (error) {
      console.error('Error deleting resume:', error);
      throw error;
    }
  }
}