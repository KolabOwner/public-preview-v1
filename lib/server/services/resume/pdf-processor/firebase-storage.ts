import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, doc, addDoc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db, storage } from '@/config/firebase-config';
import { FileStatus } from '../types/pdf-types';
import { RMS_VERSION } from '../constants/rms-schema';

/**
 * Firebase storage operations for resume PDFs
 */
export class FirebaseStorageService {
  /**
   * Upload a PDF file to Firebase Storage
   */
  public static async uploadPDFToStorage(
    file: File,
    userId: string,
    resumeId: string
  ): Promise<string> {
    const timestamp = Date.now();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9-_.]/g, '_');
    const filename = `${timestamp}-${safeFileName}`;
    const storagePath = `resumes/${userId}/${resumeId}/${filename}`;
    
    console.log(`Uploading file to storage path: ${storagePath}`);
    
    const storageRef = ref(storage, storagePath);
    
    try {
      // Set metadata for the file
      const metadata = {
        contentType: file.type,
        customMetadata: {
          userId,
          resumeId,
          originalName: file.name,
          uploadTime: new Date().toISOString(),
          rmsVersion: RMS_VERSION
        }
      };
      
      // Upload the file with metadata
      const uploadResult = await uploadBytes(storageRef, file, metadata);
      console.log('Upload successful:', uploadResult);
      
      // Get the download URL
      const downloadUrl = await getDownloadURL(storageRef);
      return downloadUrl;
    } catch (error) {
      console.error('Error uploading file to Firebase Storage:', error);
      throw new Error(`Failed to upload PDF: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Create a new resume record in Firestore
   */
  public static async createResume(options: {
    userId: string;
    title: string;
    initialStatus?: FileStatus;
  }): Promise<string> {
    try {
      const resumeData = {
        userId: options.userId,
        title: options.title,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: options.initialStatus || FileStatus.UPLOADED,
        parsedData: null,
        fileUrl: null,
        rmsVersion: RMS_VERSION
      };
      
      const docRef = await addDoc(collection(db, 'resumes'), resumeData);
      console.log(`Created new resume document with ID: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      console.error('Error creating resume document:', error);
      throw error;
    }
  }

  /**
   * Update resume status in Firestore
   */
  public static async updateResumeStatus(
    resumeId: string, 
    status: FileStatus, 
    additionalData?: any
  ): Promise<void> {
    try {
      const resumeRef = doc(db, 'resumes', resumeId);
      const updateData: any = {
        status,
        updatedAt: serverTimestamp(),
        ...additionalData
      };
      
      await updateDoc(resumeRef, updateData);
      console.log(`Updated resume ${resumeId} status to ${status}`);
    } catch (error) {
      console.error(`Error updating resume ${resumeId} status:`, error);
      throw error;
    }
  }

  /**
   * Save processing results to Firestore
   */
  public static async saveResultsToFirebase(
    resumeId: string,
    results: {
      fileUrl: string;
      rmsData: any;
      title: string;
      exifToolExtracted?: boolean;
      usedRMSFastPath?: boolean;
    }
  ): Promise<void> {
    try {
      const resumeRef = doc(db, 'resumes', resumeId);
      
      const updateData = {
        fileUrl: results.fileUrl,
        parsedData: results.rmsData,
        title: results.title,
        updatedAt: serverTimestamp(),
        processingMetadata: {
          exifToolExtracted: results.exifToolExtracted || false,
          usedRMSFastPath: results.usedRMSFastPath || false,
          processedAt: new Date().toISOString()
        }
      };
      
      await updateDoc(resumeRef, updateData);
      console.log(`Saved processing results for resume ${resumeId}`);
    } catch (error) {
      console.error(`Error saving results for resume ${resumeId}:`, error);
      throw error;
    }
  }

  /**
   * Get a resume by ID
   */
  public static async getResume(resumeId: string): Promise<any | null> {
    try {
      const resumeRef = doc(db, 'resumes', resumeId);
      const resumeSnap = await getDoc(resumeRef);
      
      if (!resumeSnap.exists()) {
        console.log(`Resume with ID ${resumeId} not found`);
        return null;
      }
      
      return {
        id: resumeSnap.id,
        ...resumeSnap.data()
      };
    } catch (error) {
      console.error('Error getting resume:', error);
      throw error;
    }
  }
}