# Task: Security Hardening

## Overview
Implement comprehensive security measures across the application based on security audit findings.

## Requirements
- [ ] Add authentication middleware to all API routes
- [ ] Implement rate limiting (100 requests/minute per IP)
- [ ] Fix CORS configuration (whitelist specific domains)
- [ ] Sanitize all user inputs including theme script
- [ ] Add comprehensive input validation using Zod
- [ ] Implement security headers (CSP, HSTS, etc.)
- [ ] Add file upload virus scanning
- [ ] Remove sensitive data from error responses

## Technical Approach
1. Create authentication middleware using Firebase Admin SDK
2. Implement rate limiting using express-rate-limit or Next.js middleware
3. Update CORS to whitelist approved domains
4. Add input sanitization library (DOMPurify)
5. Create Zod schemas for all API inputs
6. Add security headers via Next.js middleware
7. Integrate ClamAV or similar for file scanning
8. Create generic error response handlers

## Success Criteria
- [ ] All API endpoints require valid authentication
- [ ] Rate limiting prevents abuse (tested)
- [ ] XSS vulnerabilities eliminated
- [ ] Security headers properly configured
- [ ] File uploads are scanned and safe
- [ ] No sensitive information in error responses
- [ ] Security audit shows 0 critical/high issues

## Dependencies
- Depends on: Firebase Admin SDK setup
- Blocks: Production deployment

## Assigned To
Agent: Security Agent
Status: 🔴 HIGH PRIORITY
