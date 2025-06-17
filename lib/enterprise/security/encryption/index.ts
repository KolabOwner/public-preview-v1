/**
 * Web Crypto API Encryption Service
 * Browser-compatible encryption using the Web Crypto API
 */

export interface EncryptedData {
  data: string;        // Base64 encoded encrypted data
  iv: string;          // Base64 encoded initialization vector
  salt: string;        // Base64 encoded salt
  algorithm: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface EncryptionConfig {
  algorithm?: string;
  keyDerivation?: 'pbkdf2' | 'scrypt';
  iterations?: number;
  saltLength?: number;
  ivLength?: number;
}

export class EncryptionService {
  private readonly algorithm = 'AES-GCM';
  private readonly keyLength = 256;
  private readonly saltLength = 32;
  private readonly ivLength = 12; // GCM recommended
  private readonly iterations = 100000;

  /**
   * Encrypts data using a password
   */
  async encryptWithPassword(data: string | ArrayBuffer, password: string): Promise<EncryptedData> {
    // Generate salt and IV
    const salt = crypto.getRandomValues(new Uint8Array(this.saltLength));
    const iv = crypto.getRandomValues(new Uint8Array(this.ivLength));

    // Derive key from password
    const key = await this.deriveKey(password, salt);

    // Convert data to ArrayBuffer if string
    const dataBuffer = typeof data === 'string' 
      ? new TextEncoder().encode(data)
      : new Uint8Array(data);

    // Encrypt
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: this.algorithm,
        iv: iv
      },
      key,
      dataBuffer
    );

    return {
      data: this.bufferToBase64(encryptedBuffer),
      iv: this.bufferToBase64(iv),
      salt: this.bufferToBase64(salt),
      algorithm: this.algorithm,
      timestamp: Date.now()
    };
  }

  /**
   * Decrypts data using a password
   */
  async decryptWithPassword(encryptedData: EncryptedData, password: string): Promise<string> {
    // Convert from base64
    const encryptedBuffer = this.base64ToBuffer(encryptedData.data);
    const salt = this.base64ToBuffer(encryptedData.salt);
    const iv = this.base64ToBuffer(encryptedData.iv);

    // Derive key from password
    const key = await this.deriveKey(password, salt);

    // Decrypt
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: this.algorithm,
        iv: iv
      },
      key,
      encryptedBuffer
    );

    // Convert back to string
    return new TextDecoder().decode(decryptedBuffer);
  }

  /**
   * Encrypts a file
   */
  async encryptFile(file: File | ArrayBuffer, password: string): Promise<EncryptedData> {
    const buffer = file instanceof File ? await file.arrayBuffer() : file;
    const encrypted = await this.encryptWithPassword(buffer, password);
    
    // Add file metadata
    if (file instanceof File) {
      encrypted.metadata = {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size
      };
    }
    
    return encrypted;
  }

  /**
   * Generates a secure random key
   */
  async generateEphemeralKey(): Promise<{ key: string; expires: Date }> {
    const key = crypto.getRandomValues(new Uint8Array(32));
    const expires = new Date();
    expires.setHours(expires.getHours() + 24); // 24 hour expiry
    
    return { 
      key: this.bufferToBase64(key),
      expires
    };
  }

  /**
   * Creates a secure hash of data
   */
  async hash(data: string | ArrayBuffer, algorithm: string = 'SHA-256'): Promise<string> {
    const dataBuffer = typeof data === 'string'
      ? new TextEncoder().encode(data)
      : data;
      
    const hashBuffer = await crypto.subtle.digest(algorithm, dataBuffer);
    return this.bufferToHex(hashBuffer);
  }

  /**
   * Derives encryption key from password
   */
  private async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    // Import password as key material
    const passwordKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    // Derive key using PBKDF2
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: this.iterations,
        hash: 'SHA-256'
      },
      passwordKey,
      {
        name: this.algorithm,
        length: this.keyLength
      },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Converts ArrayBuffer to base64
   */
  private bufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Converts base64 to ArrayBuffer
   */
  private base64ToBuffer(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  /**
   * Converts ArrayBuffer to hex string
   */
  private bufferToHex(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
}

/**
 * Utility class for encrypting specific fields in objects
 */
export class FieldEncryption {
  constructor(private crypto: EncryptionService) {}

  /**
   * Encrypts specified fields in an object
   */
  async encryptFields<T extends Record<string, any>>(
    obj: T,
    fields: (keyof T)[],
    password: string
  ): Promise<T> {
    const encrypted = { ...obj };
    
    for (const field of fields) {
      if (obj[field] !== undefined && obj[field] !== null) {
        const encryptedField = await this.crypto.encryptWithPassword(
          String(obj[field]),
          password
        );
        // Store encrypted data with marker
        (encrypted as any)[field] = {
          __encrypted: true,
          data: encryptedField
        };
      }
    }
    
    return encrypted;
  }

  /**
   * Decrypts specified fields in an object
   */
  async decryptFields<T extends Record<string, any>>(
    obj: T,
    fields: (keyof T)[],
    password: string
  ): Promise<T> {
    const decrypted = { ...obj };
    
    for (const field of fields) {
      const value = obj[field];
      if (value && typeof value === 'object' && value.__encrypted) {
        try {
          (decrypted as any)[field] = await this.crypto.decryptWithPassword(
            value.data,
            password
          );
        } catch (error) {
          console.error(`Failed to decrypt field ${String(field)}:`, error);
          // Keep encrypted value on failure
        }
      }
    }
    
    return decrypted;
  }
}

// Export singleton instances
export const encryptionService = new EncryptionService();
export const fieldEncryption = new FieldEncryption(encryptionService);