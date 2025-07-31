import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { LRUCache } from 'lru-cache';

// Rate limiting configuration
const rateLimitCache = new LRUCache<string, number[]>({
  max: 1000, // Maximum number of IP addresses to track
  ttl: 15 * 60 * 1000, // 15 minutes TTL
});

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  maxRequestsPerWindow: 5, // Max requests per IP in time window
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequestsPerDay: 20, // Max requests per IP per day
  dayMs: 24 * 60 * 60 * 1000, // 24 hours
};

// Contact form validation schema (server-side)
const contactSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  email: z.string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  subject: z.string()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must be less than 200 characters'),
  category: z.enum(['technical', 'billing', 'general', 'feedback', 'bug'], {
    required_error: 'Please select a category'
  }),
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be less than 2000 characters'),
});

// Email template for support team
function generateSupportEmail(data: z.infer<typeof contactSchema>, userIP: string) {
  const categoryEmojis = {
    technical: '🔧',
    billing: '💳',
    general: '❓',
    feedback: '💡',
    bug: '🐛'
  };

  return {
    to: 'support@rezum-ai.com',
    subject: `[${categoryEmojis[data.category]} ${data.category.toUpperCase()}] ${data.subject}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: 600; color: #374151; margin-bottom: 5px; }
            .value { background: #f9fafb; padding: 10px; border-radius: 4px; border-left: 3px solid #3b82f6; }
            .message { background: #f9fafb; padding: 15px; border-radius: 4px; white-space: pre-wrap; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0; color: #1f2937;">New Support Request</h2>
              <p style="margin: 10px 0 0 0; color: #6b7280;">Received: ${new Date().toLocaleString('en-US', { 
                timeZone: 'America/New_York',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZoneName: 'short'
              })}</p>
            </div>
            
            <div class="field">
              <div class="label">Category:</div>
              <div class="value">${categoryEmojis[data.category]} ${data.category.charAt(0).toUpperCase() + data.category.slice(1)}</div>
            </div>
            
            <div class="field">
              <div class="label">Subject:</div>
              <div class="value">${data.subject}</div>
            </div>
            
            <div class="field">
              <div class="label">From:</div>
              <div class="value">${data.name} &lt;${data.email}&gt;</div>
            </div>
            
            <div class="field">
              <div class="label">Message:</div>
              <div class="message">${data.message}</div>
            </div>
            
            <div class="footer">
              <p><strong>User Information:</strong></p>
              <p>IP Address: ${userIP}</p>
              <p>User Agent: ${process.env.NODE_ENV === 'development' ? 'Development Environment' : 'Production'}</p>
              <p>Timestamp: ${new Date().toISOString()}</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
New Support Request

Category: ${data.category.toUpperCase()}
Subject: ${data.subject}
From: ${data.name} <${data.email}>

Message:
${data.message}

---
IP Address: ${userIP}
Timestamp: ${new Date().toISOString()}
    `.trim()
  };
}

// Auto-reply email template for user
function generateAutoReplyEmail(data: z.infer<typeof contactSchema>) {
  return {
    to: data.email,
    subject: `We've received your message - ${data.subject}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { color: #3b82f6; font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .content { background: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 20px; }
            .footer { text-align: center; font-size: 14px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Rezum AI</div>
              <h2 style="margin: 0; color: #1f2937;">Thank you for contacting us!</h2>
            </div>
            
            <div class="content">
              <p>Hi ${data.name},</p>
              
              <p>We've successfully received your message regarding "<strong>${data.subject}</strong>" and wanted to confirm that it's in our support queue.</p>
              
              <p><strong>What happens next:</strong></p>
              <ul>
                <li>Our support team will review your inquiry within 24 hours</li>
                <li>You'll receive a personalized response from one of our experts</li>
                <li>If needed, we may follow up with additional questions to better assist you</li>
              </ul>
              
              <p>In the meantime, you might find these resources helpful:</p>
              <ul>
                <li><a href="https://yourdomain.com/resume-docs" style="color: #3b82f6;">Documentation & Guides</a></li>
                <li><a href="https://yourdomain.com/faq" style="color: #3b82f6;">Frequently Asked Questions</a></li>
                <li><a href="https://yourdomain.com/status" style="color: #3b82f6;">Service Status</a></li>
              </ul>
              
              <p>Thank you for using Rezum AI!</p>
              
              <p>Best regards,<br>
              The Rezum AI Support Team</p>
            </div>
            
            <div class="footer">
              <p>This is an automated response. Please do not reply to this email.</p>
              <p>Need immediate help? Visit our <a href="https://yourdomain.com/contact" style="color: #3b82f6;">support center</a>.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Hi ${data.name},

We've successfully received your message regarding "${data.subject}" and wanted to confirm that it's in our support queue.

What happens next:
- Our support team will review your inquiry within 24 hours
- You'll receive a personalized response from one of our experts
- If needed, we may follow up with additional questions to better assist you

In the meantime, you might find these resources helpful:
- Documentation & Guides: https://yourdomain.com/resume-docs
- Frequently Asked Questions: https://yourdomain.com/faq
- Service Status: https://yourdomain.com/status

Thank you for using Rezum AI!

Best regards,
The Rezum AI Support Team

---
This is an automated response. Please do not reply to this email.
Need immediate help? Visit our support center: https://yourdomain.com/contact
    `.trim()
  };
}

// Get real IP address from request
function getClientIP(request: NextRequest): string {
  // Check various headers for real IP (in order of preference)
  const xForwardedFor = request.headers.get('x-forwarded-for');
  const xRealIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (xForwardedFor) {
    // x-forwarded-for can contain multiple IPs, get the first one
    return xForwardedFor.split(',')[0].trim();
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  if (xRealIP) {
    return xRealIP;
  }
  
  // Fallback to a default IP for development
  return '127.0.0.1';
}

// Check rate limits
function checkRateLimit(ip: string): { allowed: boolean; error?: string } {
  const now = Date.now();
  const requests = rateLimitCache.get(ip) || [];
  
  // Remove old requests outside the window
  const recentRequests = requests.filter(timestamp => 
    now - timestamp < RATE_LIMIT_CONFIG.windowMs
  );
  
  // Check requests in current window
  if (recentRequests.length >= RATE_LIMIT_CONFIG.maxRequestsPerWindow) {
    return {
      allowed: false,
      error: `Too many requests. Please wait before sending another message. (${RATE_LIMIT_CONFIG.maxRequestsPerWindow} requests per ${RATE_LIMIT_CONFIG.windowMs / 60000} minutes allowed)`
    };
  }
  
  // Check daily requests
  const dailyRequests = requests.filter(timestamp => 
    now - timestamp < RATE_LIMIT_CONFIG.dayMs
  );
  
  if (dailyRequests.length >= RATE_LIMIT_CONFIG.maxRequestsPerDay) {
    return {
      allowed: false,
      error: `Daily limit exceeded. Please try again tomorrow. (${RATE_LIMIT_CONFIG.maxRequestsPerDay} requests per day allowed)`
    };
  }
  
  // Add current request and update cache
  recentRequests.push(now);
  rateLimitCache.set(ip, recentRequests);
  
  return { allowed: true };
}

// Mock email sending function (replace with your actual email service)
async function sendEmail(emailData: { to: string; subject: string; html: string; text: string }) {
  // In a real application, you would use a service like:
  // - SendGrid
  // - Mailgun
  // - AWS SES
  // - Resend
  // - Nodemailer with SMTP
  
  console.log('📧 Email would be sent:', {
    to: emailData.to,
    subject: emailData.subject,
    // Don't log the full content in production for privacy
    contentLength: emailData.html.length
  });
  
  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // For development, you can uncomment this to see the email content:
  if (process.env.NODE_ENV === 'development') {
    console.log('📧 Email HTML content:', emailData.html);
  }
  
  return { success: true, messageId: `mock-${Date.now()}` };
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIP = getClientIP(request);
    
    // Check rate limits
    const rateLimitCheck = checkRateLimit(clientIP);
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { error: rateLimitCheck.error },
        { status: 429 }
      );
    }
    
    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    // Validate form data
    const validationResult = contactSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationResult.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }
    
    const formData = validationResult.data;
    
    // Basic spam detection
    const spamKeywords = ['viagra', 'casino', 'lottery', 'prize', 'winner', 'click here', 'make money'];
    const messageText = `${formData.subject} ${formData.message}`.toLowerCase();
    const containsSpam = spamKeywords.some(keyword => messageText.includes(keyword));
    
    if (containsSpam) {
      return NextResponse.json(
        { error: 'Message flagged as potential spam' },
        { status: 400 }
      );
    }
    
    // Generate emails
    const supportEmail = generateSupportEmail(formData, clientIP);
    const autoReplyEmail = generateAutoReplyEmail(formData);
    
    // Send emails
    try {
      await Promise.all([
        sendEmail(supportEmail),
        sendEmail(autoReplyEmail)
      ]);
    } catch (emailError) {
      console.error('Failed to send emails:', emailError);
      return NextResponse.json(
        { error: 'Failed to send message. Please try again later.' },
        { status: 500 }
      );
    }
    
    // Success response
    return NextResponse.json(
      { 
        success: true,
        message: 'Message sent successfully. You should receive a confirmation email shortly.'
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}