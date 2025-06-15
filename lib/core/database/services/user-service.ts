// lib/services/user.service.ts
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { User as FirebaseUser } from 'firebase/auth';
import { db } from "@/lib/core/auth/firebase-config";


export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  company?: string;
  jobTitle?: string;
  location?: string;
  website?: string;
  linkedIn?: string;
  github?: string;
  isProfileComplete: boolean;
  emailVerified: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt: Timestamp;
  authProvider: 'email' | 'google' | 'facebook' | 'github';
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    emailNotifications?: boolean;
    marketingEmails?: boolean;
  };
  subscription?: {
    plan: 'free' | 'pro' | 'enterprise';
    status: 'active' | 'cancelled' | 'expired';
    startDate?: Timestamp;
    endDate?: Timestamp;
  };
}

class UserService {
  private readonly USERS_COLLECTION = 'users';

  /**
   * Creates a new user document in Firestore
   */
  async createUserDocument(
    user: FirebaseUser,
    additionalData?: Partial<UserProfile>
  ): Promise<void> {
    const userRef = doc(db, this.USERS_COLLECTION, user.uid);

    // Check if user document already exists
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // Determine auth provider
      let authProvider: UserProfile['authProvider'] = 'email';
      if (user.providerData.length > 0) {
        const providerId = user.providerData[0].providerId;
        if (providerId.includes('google')) authProvider = 'google';
        else if (providerId.includes('facebook')) authProvider = 'facebook';
        else if (providerId.includes('github')) authProvider = 'github';
      }

      // Extract name parts from displayName if available
      let firstName = '';
      let lastName = '';
      if (user.displayName) {
        const nameParts = user.displayName.split(' ');
        firstName = nameParts[0] || '';
        lastName = nameParts.slice(1).join(' ') || '';
      }

      const userData: UserProfile = {
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        phoneNumber: user.phoneNumber || '',
        firstName: additionalData?.firstName || firstName,
        lastName: additionalData?.lastName || lastName,
        bio: '',
        company: '',
        jobTitle: '',
        location: '',
        website: '',
        linkedIn: '',
        github: '',
        isProfileComplete: false,
        emailVerified: user.emailVerified,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
        lastLoginAt: serverTimestamp() as Timestamp,
        authProvider,
        preferences: {
          theme: 'system',
          emailNotifications: true,
          marketingEmails: false,
        },
        subscription: {
          plan: 'free',
          status: 'active',
        },
        ...additionalData,
      };

      await setDoc(userRef, userData);
      console.log('User document created successfully');
    } else {
      // Update last login time if document exists
      await this.updateLastLogin(user.uid);
    }
  }

  /**
   * Gets a user document from Firestore
   */
  async getUserDocument(uid: string): Promise<UserProfile | null> {
    const userRef = doc(db, this.USERS_COLLECTION, uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }

    return null;
  }

  /**
   * Updates a user document in Firestore
   */
  async updateUserDocument(
    uid: string,
    data: Partial<UserProfile>
  ): Promise<void> {
    const userRef = doc(db, this.USERS_COLLECTION, uid);

    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Updates the last login timestamp
   */
  async updateLastLogin(uid: string): Promise<void> {
    const userRef = doc(db, this.USERS_COLLECTION, uid);

    await updateDoc(userRef, {
      lastLoginAt: serverTimestamp(),
    });
  }

  /**
   * Checks if a user's profile is complete
   */
  async checkProfileCompleteness(uid: string): Promise<boolean> {
    const user = await this.getUserDocument(uid);

    if (!user) return false;

    const requiredFields = [
      'firstName',
      'lastName',
      'jobTitle',
      'company'
    ];

    const isComplete = requiredFields.every(field =>
      user[field as keyof UserProfile] &&
      user[field as keyof UserProfile] !== ''
    );

    // Update the isProfileComplete field if it has changed
    if (isComplete !== user.isProfileComplete) {
      await this.updateUserDocument(uid, { isProfileComplete: isComplete });
    }

    return isComplete;
  }

  /**
   * Updates user preferences
   */
  async updateUserPreferences(
    uid: string,
    preferences: Partial<UserProfile['preferences']>
  ): Promise<void> {
    const user = await this.getUserDocument(uid);

    if (!user) throw new Error('User not found');

    await this.updateUserDocument(uid, {
      preferences: {
        ...user.preferences,
        ...preferences,
      },
    });
  }

  /**
   * Updates user subscription
   */
  async updateUserSubscription(
    uid: string,
    subscription: Partial<UserProfile['subscription']>
  ): Promise<void> {
    const user = await this.getUserDocument(uid);

    if (!user) throw new Error('User not found');

    await this.updateUserDocument(uid, {
      subscription: {
        ...user.subscription,
        ...subscription,
      },
    });
  }
}

export const userService = new UserService();