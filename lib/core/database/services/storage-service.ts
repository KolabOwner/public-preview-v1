// src/services/StorageService.ts
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection } from 'firebase/firestore';
import { db } from "@/lib/core/auth/firebase-config";


interface StorageDocument {
  id: string;
  [key: string]: any;
}

class StorageService {
  /**
   * Get document data from Firestore
   */
  static async getDocumentData(userId: string, documentId: string): Promise<any | null> {
    try {
      const docRef = doc(db, 'users', userId, 'resumes', documentId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      console.error('Error getting document:', error);
      throw error;
    }
  }

  /**
   * Create a new document in Firestore
   */
  static async createDocument(userId: string, documentId: string, data: any): Promise<void> {
    try {
      const docRef = doc(db, 'users', userId, 'resumes', documentId);
      await setDoc(docRef, {
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  }

  /**
   * Update an existing document in Firestore
   */
  static async updateDocument(userId: string, documentId: string, updates: any): Promise<void> {
    try {
      const docRef = doc(db, 'users', userId, 'resumes', documentId);
      await updateDoc(docRef, {
        ...updates,
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }

  /**
   * Delete a document from Firestore
   */
  static async deleteDocument(userId: string, documentId: string): Promise<void> {
    try {
      const docRef = doc(db, 'users', userId, 'resumes', documentId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  /**
   * Save job info for a resume
   */
  static async saveJobInfo(
    userId: string,
    documentId: string,
    jobInfo: { title: string; description: string; company?: string }
  ): Promise<void> {
    try {
      await this.updateDocument(userId, documentId, {
        job_info: {
          ...jobInfo,
          updated_at: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error saving job info:', error);
      throw error;
    }
  }

  /**
   * Get all resumes for a user
   */
  static async getUserResumes(userId: string): Promise<StorageDocument[]> {
    try {
      // Note: This is a simplified version. In production, you'd use
      // Firestore queries to get all documents in the subcollection
      const resumesRef = collection(db, 'users', userId, 'resumes');
      // Implementation would go here
      return [];
    } catch (error) {
      console.error('Error getting user resumes:', error);
      throw error;
    }
  }
}

export { StorageService };