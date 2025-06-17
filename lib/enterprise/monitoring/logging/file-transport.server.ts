/**
 * Server-side file transport for structured logging
 * This file should only be imported in server-side code
 */

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { LogEntry, LogTransport } from './index';

export class ServerFileTransport implements LogTransport {
  name = 'file';
  private writeStream: fs.WriteStream | null = null;
  private currentSize = 0;
  
  constructor(
    private filePath: string,
    private options: {
      maxSize?: number;
      maxFiles?: number;
      compress?: boolean;
    } = {}
  ) {
    this.options = {
      maxSize: 10 * 1024 * 1024, // 10MB default
      maxFiles: 5,
      compress: true,
      ...options
    };
    this.initializeStream();
  }

  private initializeStream(): void {
    // Ensure log directory exists
    const logDir = path.dirname(this.filePath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    // Check existing file size
    if (fs.existsSync(this.filePath)) {
      const stats = fs.statSync(this.filePath);
      this.currentSize = stats.size;
      
      // Rotate if needed
      if (this.currentSize >= (this.options.maxSize || 0)) {
        this.rotateLogSync();
      }
    }
    
    // Create write stream
    this.writeStream = fs.createWriteStream(this.filePath, { flags: 'a' });
  }

  async log(entry: LogEntry): Promise<void> {
    const line = JSON.stringify(entry) + '\n';
    const bytes = Buffer.byteLength(line);
    
    // Check if rotation needed
    if (this.currentSize + bytes > (this.options.maxSize || Infinity)) {
      await this.rotateLog();
    }
    
    // Write to file
    return new Promise((resolve, reject) => {
      if (!this.writeStream) {
        resolve();
        return;
      }
      
      this.writeStream.write(line, (error) => {
        if (error) {
          console.error('Failed to write log to file:', error);
        } else {
          this.currentSize += bytes;
        }
        resolve();
      });
    });
  }

  private rotateLogSync(): void {
    // Close current stream
    if (this.writeStream) {
      this.writeStream.close();
    }
    
    // Rotate existing files
    const baseName = path.basename(this.filePath, path.extname(this.filePath));
    const dir = path.dirname(this.filePath);
    const ext = path.extname(this.filePath);
    
    // Move existing rotated files
    for (let i = (this.options.maxFiles || 5) - 1; i >= 1; i--) {
      const oldFile = path.join(dir, `${baseName}.${i}${ext}${this.options.compress ? '.gz' : ''}`);
      const newFile = path.join(dir, `${baseName}.${i + 1}${ext}${this.options.compress ? '.gz' : ''}`);
      
      if (fs.existsSync(oldFile)) {
        if (i === (this.options.maxFiles || 5) - 1) {
          // Delete oldest file
          fs.unlinkSync(oldFile);
        } else {
          // Move to next index
          fs.renameSync(oldFile, newFile);
        }
      }
    }
    
    // Move current file to .1
    if (fs.existsSync(this.filePath)) {
      const rotatedFile = path.join(dir, `${baseName}.1${ext}`);
      fs.renameSync(this.filePath, rotatedFile);
      
      // Compress if enabled
      if (this.options.compress) {
        const gzip = zlib.createGzip();
        const source = fs.createReadStream(rotatedFile);
        const destination = fs.createWriteStream(`${rotatedFile}.gz`);
        
        source.pipe(gzip).pipe(destination)
          .on('finish', () => {
            fs.unlinkSync(rotatedFile); // Remove uncompressed file
          })
          .on('error', (err) => {
            console.error('Failed to compress log file:', err);
          });
      }
    }
    
    this.currentSize = 0;
  }

  private async rotateLog(): Promise<void> {
    return new Promise((resolve) => {
      this.rotateLogSync();
      // Re-create write stream
      this.writeStream = fs.createWriteStream(this.filePath, { flags: 'a' });
      resolve();
    });
  }

  async flush(): Promise<void> {
    if (this.writeStream) {
      return new Promise((resolve) => {
        this.writeStream!.end(() => resolve());
      });
    }
  }
}