# Backend Security, Authentication & Middleware Documentation
## Comprehensive Security Architecture for Resume Processing Platform

---

## 📋 Table of Contents

1. [Security Architecture Overview](#security-architecture-overview)
2. [Authentication System](#authentication-system)
3. [Authorization Framework](#authorization-framework)
4. [Firebase/Firestore Security Rules](#firebasefirestore-security-rules)
5. [Backend Middleware Stack](#backend-middleware-stack)
6. [Threat Model Analysis](#threat-model-analysis)
7. [Security Policies & Procedures](#security-policies--procedures)
8. [API Security Implementation](#api-security-implementation)
9. [Data Protection & Privacy](#data-protection--privacy)
10. [Security Monitoring & Incident Response](#security-monitoring--incident-response)

---

## 🏗️ Security Architecture Overview

### Defense-in-Depth Architecture

```typescript
interface SecurityArchitecture {
  // Layer 1: Network Security
  network: {
    firewall: 'WAF with DDoS protection',
    ssl: 'TLS 1.3 minimum',
    cors: 'Strict origin validation',
    rateLimit: 'IP and user-based throttling'
  };
  
  // Layer 2: Application Security
  application: {
    authentication: 'Firebase Auth + JWT',
    authorization: 'RBAC with fine-grained permissions',
    validation: 'Input sanitization and type checking',
    encryption: 'AES-256-GCM for sensitive data'
  };
  
  // Layer 3: Data Security
  data: {
    encryption: {
      atRest: 'Firestore automatic encryption',
      inTransit: 'TLS + additional app-layer encryption',
      keys: 'Cloud KMS with rotation'
    },
    privacy: 'GDPR/CCPA compliant data handling',
    retention: 'Automated data lifecycle management'
  };
  
  // Layer 4: Infrastructure Security
  infrastructure: {
    access: 'Zero-trust with service accounts',
    secrets: 'Secret Manager with versioning',
    logging: 'Centralized audit logging',
    monitoring: 'Real-time threat detection'
  };
}
```

### Security Principles

```typescript
export const SecurityPrinciples = {
  // Principle of Least Privilege
  leastPrivilege: {
    users: 'Only access to own data',
    services: 'Minimal required permissions',
    apis: 'Scoped access tokens'
  },
  
  // Defense in Depth
  defenseInDepth: {
    multiple_layers: true,
    fail_securely: true,
    assume_breach: true
  },
  
  // Zero Trust
  zeroTrust: {
    verify_always: true,
    trust_no_one: true,
    continuous_validation: true
  },
  
  // Data Minimization
  dataMinimization: {
    collect_minimum: true,
    retention_limits: true,
    purpose_limitation: true
  }
};
```

---

## 🔐 Authentication System

### Firebase Authentication Configuration

```typescript
// Firebase Auth Configuration
export class AuthenticationService {
  private auth: FirebaseAuth;
  private db: Firestore;
  
  constructor() {
    this.auth = getAuth();
    this.db = getFirestore();
    
    // Configure auth settings
    this.auth.settings = {
      appVerificationDisabledForTesting: false
    };
  }

  // Multi-factor Authentication Setup
  async setupMFA(user: User): Promise<void> {
    const multiFactorUser = multiFactor(user);
    
    // Enroll TOTP (Time-based One-Time Password)
    const totpSecret = await multiFactorUser.enroll(
      await TotpMultiFactorGenerator.generate()
    );
    
    // Store backup codes securely
    const backupCodes = this.generateBackupCodes();
    await this.storeBackupCodes(user.uid, backupCodes);
    
    return totpSecret;
  }

  // Enhanced Sign-In with Security Checks
  async signInWithSecurity(
    email: string,
    password: string,
    context: AuthContext
  ): Promise<AuthResult> {
    try {
      // Rate limiting check
      await this.checkRateLimit(context.ip);
      
      // Attempt sign in
      const credential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      
      // Verify additional security factors
      await this.verifySecurityFactors(credential.user, context);
      
      // Create secure session
      const session = await this.createSecureSession(credential.user);
      
      // Log successful authentication
      await this.logAuthEvent('signin_success', credential.user.uid, context);
      
      return {
        user: credential.user,
        session,
        requiresMFA: await this.checkMFARequired(credential.user)
      };
      
    } catch (error) {
      // Log failed attempt
      await this.logAuthEvent('signin_failure', email, context);
      
      // Increment failed attempts
      await this.incrementFailedAttempts(email);
      
      throw this.sanitizeAuthError(error);
    }
  }

  // Token Management
  async generateSecureTokens(user: User): Promise<TokenPair> {
    // Generate access token (short-lived)
    const accessToken = await user.getIdToken();
    
    // Generate refresh token (long-lived)
    const refreshToken = await this.generateRefreshToken(user.uid);
    
    // Store token metadata
    await this.storeTokenMetadata(user.uid, {
      accessTokenExp: Date.now() + 3600000, // 1 hour
      refreshTokenExp: Date.now() + 2592000000, // 30 days
      deviceId: this.getDeviceId(),
      issuedAt: Date.now()
    });
    
    return { accessToken, refreshToken };
  }

  // Session Management
  private async createSecureSession(user: User): Promise<SecureSession> {
    const sessionId = this.generateSessionId();
    const deviceFingerprint = await this.getDeviceFingerprint();
    
    const session: SecureSession = {
      id: sessionId,
      userId: user.uid,
      deviceFingerprint,
      createdAt: serverTimestamp(),
      lastActivity: serverTimestamp(),
      ipAddress: this.context.ip,
      userAgent: this.context.userAgent,
      // Security flags
      flags: {
        mfaVerified: false,
        suspicious: false,
        highRisk: false
      }
    };
    
    // Store in Firestore with TTL
    await setDoc(
      doc(this.db, 'sessions', sessionId),
      session
    );
    
    // Set in Redis for fast access
    await this.redis.setex(
      `session:${sessionId}`,
      3600, // 1 hour
      JSON.stringify(session)
    );
    
    return session;
  }

  // Device Fingerprinting
  private async getDeviceFingerprint(): Promise<string> {
    const components = [
      navigator.userAgent,
      navigator.language,
      new Date().getTimezoneOffset(),
      screen.colorDepth,
      screen.width + 'x' + screen.height,
      // Canvas fingerprinting
      await this.getCanvasFingerprint(),
      // WebGL fingerprinting
      await this.getWebGLFingerprint()
    ];
    
    return this.hashComponents(components);
  }

  // Anomaly Detection
  private async verifySecurityFactors(
    user: User,
    context: AuthContext
  ): Promise<void> {
    const securityChecks = await Promise.all([
      this.checkLocationAnomaly(user.uid, context.location),
      this.checkDeviceAnomaly(user.uid, context.deviceId),
      this.checkTimeAnomaly(user.uid),
      this.checkBehaviorAnomaly(user.uid, context)
    ]);
    
    const riskScore = this.calculateRiskScore(securityChecks);
    
    if (riskScore > 0.7) {
      // High risk - require additional verification
      throw new SecurityError('Additional verification required', {
        code: 'auth/high-risk-signin',
        factors: securityChecks
      });
    }
    
    if (riskScore > 0.4) {
      // Medium risk - flag for monitoring
      await this.flagSessionForMonitoring(user.uid, riskScore);
    }
  }
}

// OAuth Integration with Security
export class OAuthSecurityWrapper {
  async signInWithGoogle(context: AuthContext): Promise<AuthResult> {
    const provider = new GoogleAuthProvider();
    
    // Configure OAuth scopes
    provider.addScope('profile');
    provider.addScope('email');
    
    // Set custom parameters
    provider.setCustomParameters({
      prompt: 'select_account',
      hd: process.env.ALLOWED_DOMAIN // Restrict to domain
    });
    
    try {
      const result = await signInWithPopup(this.auth, provider);
      
      // Verify OAuth token
      await this.verifyOAuthToken(result);
      
      // Check if user is allowed
      await this.checkUserAllowlist(result.user);
      
      // Create user profile if new
      if (result.additionalUserInfo?.isNewUser) {
        await this.createSecureUserProfile(result.user);
      }
      
      return this.processOAuthResult(result, context);
      
    } catch (error) {
      await this.handleOAuthError(error, context);
      throw error;
    }
  }

  private async verifyOAuthToken(result: UserCredential): Promise<void> {
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    if (!credential) {
      throw new SecurityError('Invalid OAuth credential');
    }
    
    // Verify token with Google
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?access_token=${credential.accessToken}`
    );
    
    const tokenInfo = await response.json();
    
    // Verify audience and issuer
    if (tokenInfo.aud !== process.env.GOOGLE_CLIENT_ID) {
      throw new SecurityError('Invalid token audience');
    }
  }
}
```

### Password Security

```typescript
export class PasswordSecurity {
  // Password Policy
  private readonly policy: PasswordPolicy = {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    preventCommon: true,
    preventUserInfo: true,
    maxAge: 90, // days
    historyCount: 5 // prevent reuse of last 5 passwords
  };

  // Password Validation
  async validatePassword(
    password: string,
    userContext?: UserContext
  ): Promise<ValidationResult> {
    const checks = await Promise.all([
      this.checkLength(password),
      this.checkComplexity(password),
      this.checkCommonPasswords(password),
      this.checkUserInfo(password, userContext),
      this.checkBreachedPasswords(password)
    ]);
    
    const failures = checks.filter(check => !check.passed);
    
    return {
      valid: failures.length === 0,
      failures,
      score: this.calculatePasswordStrength(password),
      suggestions: this.generateSuggestions(failures)
    };
  }

  // Check against breached passwords (HaveIBeenPwned)
  private async checkBreachedPasswords(password: string): Promise<CheckResult> {
    const sha1 = await this.sha1(password);
    const prefix = sha1.substring(0, 5);
    const suffix = sha1.substring(5);
    
    try {
      const response = await fetch(
        `https://api.pwnedpasswords.com/range/${prefix}`
      );
      
      const hashes = await response.text();
      const breached = hashes.includes(suffix.toUpperCase());
      
      return {
        passed: !breached,
        message: breached ? 'Password found in data breach' : null
      };
    } catch {
      // Fail open - don't block on API failure
      return { passed: true };
    }
  }

  // Password History
  async checkPasswordHistory(
    userId: string,
    passwordHash: string
  ): Promise<boolean> {
    const history = await this.getPasswordHistory(userId);
    
    // Check if password was used recently
    for (const entry of history.slice(0, this.policy.historyCount)) {
      if (await bcrypt.compare(passwordHash, entry.hash)) {
        return false; // Password was used before
      }
    }
    
    return true;
  }

  // Secure Password Storage
  async hashPassword(password: string): Promise<string> {
    // Use Argon2id for password hashing
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536, // 64 MB
      timeCost: 3,
      parallelism: 4,
      hashLength: 32
    });
  }
}
```

---

## 🛡️ Authorization Framework

### Role-Based Access Control (RBAC)

```typescript
// RBAC Implementation
export class AuthorizationService {
  private readonly roles: RoleHierarchy = {
    admin: {
      permissions: ['*'], // All permissions
      inherits: []
    },
    manager: {
      permissions: [
        'resume:read',
        'resume:write',
        'resume:delete',
        'analytics:read',
        'team:manage'
      ],
      inherits: ['user']
    },
    user: {
      permissions: [
        'resume:read:own',
        'resume:write:own',
        'resume:delete:own',
        'profile:read:own',
        'profile:write:own'
      ],
      inherits: []
    },
    guest: {
      permissions: [
        'resume:read:public',
        'auth:signup'
      ],
      inherits: []
    }
  };

  // Permission Checking
  async checkPermission(
    user: AuthUser,
    resource: string,
    action: string,
    context?: ResourceContext
  ): Promise<boolean> {
    // Get user's effective permissions
    const permissions = await this.getUserPermissions(user);
    
    // Build permission string
    const permission = `${resource}:${action}${context?.scope || ''}`;
    
    // Check exact match
    if (permissions.includes(permission)) {
      return true;
    }
    
    // Check wildcard permissions
    if (this.checkWildcardPermission(permissions, permission)) {
      return true;
    }
    
    // Check resource ownership
    if (context?.resourceId && permission.endsWith(':own')) {
      return this.checkResourceOwnership(user.uid, context.resourceId);
    }
    
    // Check dynamic permissions
    return this.checkDynamicPermissions(user, resource, action, context);
  }

  // Dynamic Permission Rules
  private async checkDynamicPermissions(
    user: AuthUser,
    resource: string,
    action: string,
    context?: ResourceContext
  ): Promise<boolean> {
    // Team-based permissions
    if (context?.teamId) {
      const membership = await this.getTeamMembership(user.uid, context.teamId);
      if (membership?.permissions.includes(`${resource}:${action}`)) {
        return true;
      }
    }
    
    // Time-based permissions
    if (context?.timeRestriction) {
      if (!this.isWithinTimeWindow(context.timeRestriction)) {
        return false;
      }
    }
    
    // Attribute-based permissions (ABAC)
    if (context?.attributes) {
      return this.evaluateAttributePolicy(user, resource, action, context.attributes);
    }
    
    return false;
  }

  // Resource-Level Security
  async secureResourceAccess<T>(
    user: AuthUser,
    resource: string,
    operation: () => Promise<T>,
    options: AccessOptions = {}
  ): Promise<T> {
    // Pre-access checks
    const canAccess = await this.checkPermission(
      user,
      resource,
      options.action || 'read',
      options.context
    );
    
    if (!canAccess) {
      throw new ForbiddenError(`Access denied to ${resource}`, {
        user: user.uid,
        resource,
        action: options.action
      });
    }
    
    // Log access attempt
    await this.logAccessAttempt(user.uid, resource, options.action || 'read');
    
    try {
      // Execute operation with monitoring
      const startTime = Date.now();
      const result = await operation();
      
      // Post-access auditing
      await this.auditResourceAccess({
        userId: user.uid,
        resource,
        action: options.action || 'read',
        duration: Date.now() - startTime,
        success: true,
        metadata: options.metadata
      });
      
      return result;
    } catch (error) {
      // Audit failed access
      await this.auditResourceAccess({
        userId: user.uid,
        resource,
        action: options.action || 'read',
        success: false,
        error: error.message
      });
      
      throw error;
    }
  }
}

// Attribute-Based Access Control (ABAC)
export class ABACPolicy {
  private policies: PolicyRule[] = [
    {
      id: 'resume-owner-access',
      effect: 'allow',
      conditions: {
        'resource.ownerId': '${user.id}',
        'action': ['read', 'write', 'delete']
      }
    },
    {
      id: 'team-member-read',
      effect: 'allow',
      conditions: {
        'user.teams': { contains: '${resource.teamId}' },
        'action': ['read']
      }
    },
    {
      id: 'premium-features',
      effect: 'allow',
      conditions: {
        'user.subscription': 'premium',
        'resource.type': 'premium-feature'
      }
    },
    {
      id: 'rate-limit-free-users',
      effect: 'deny',
      conditions: {
        'user.subscription': 'free',
        'user.dailyRequests': { gte: 100 }
      }
    }
  ];

  async evaluate(
    subject: Subject,
    resource: Resource,
    action: string,
    environment: Environment
  ): Promise<Decision> {
    const context = {
      user: subject,
      resource,
      action,
      environment,
      // Helper functions for policy evaluation
      helpers: {
        contains: (arr: any[], val: any) => arr.includes(val),
        gte: (a: number, b: number) => a >= b,
        lte: (a: number, b: number) => a <= b
      }
    };
    
    for (const policy of this.policies) {
      if (this.evaluatePolicy(policy, context)) {
        return {
          decision: policy.effect,
          policy: policy.id,
          reason: policy.description
        };
      }
    }
    
    return { decision: 'deny', reason: 'No matching policy' };
  }
}
```

### API Key Management

```typescript
export class APIKeyManager {
  // API Key Generation
  async generateAPIKey(
    userId: string,
    options: APIKeyOptions
  ): Promise<APIKey> {
    // Generate cryptographically secure key
    const keyValue = this.generateSecureKey();
    const keyId = this.generateKeyId();
    
    const apiKey: APIKey = {
      id: keyId,
      key: `rp_${options.environment}_${keyValue}`, // rp = resume parser
      userId,
      name: options.name,
      permissions: options.permissions || [],
      rateLimit: options.rateLimit || {
        requests: 1000,
        window: '1h'
      },
      expiresAt: options.expiresAt,
      createdAt: new Date(),
      lastUsed: null,
      metadata: options.metadata || {}
    };
    
    // Hash the key for storage
    const hashedKey = await this.hashAPIKey(apiKey.key);
    
    // Store in Firestore
    await setDoc(
      doc(this.db, 'apiKeys', keyId),
      {
        ...apiKey,
        key: hashedKey // Store hash, not plaintext
      }
    );
    
    // Cache for fast lookup
    await this.cacheAPIKey(keyId, apiKey);
    
    return apiKey;
  }

  // API Key Validation
  async validateAPIKey(key: string): Promise<APIKeyValidation> {
    try {
      // Extract key parts
      const [prefix, env, value] = key.split('_');
      
      if (prefix !== 'rp') {
        throw new Error('Invalid key format');
      }
      
      // Try cache first
      const cached = await this.getCachedKey(key);
      if (cached) {
        return this.validateCachedKey(cached);
      }
      
      // Query Firestore
      const snapshot = await getDocs(
        collection(this.db, 'apiKeys')
      );
      
      for (const doc of snapshot.docs) {
        const data = doc.data();
        if (await this.verifyAPIKey(key, data.key)) {
          const apiKey = { id: doc.id, ...data };
          
          // Update last used
          await this.updateLastUsed(doc.id);
          
          // Cache for future requests
          await this.cacheAPIKey(doc.id, apiKey);
          
          return {
            valid: true,
            keyId: doc.id,
            userId: data.userId,
            permissions: data.permissions,
            rateLimit: data.rateLimit
          };
        }
      }
      
      return { valid: false, reason: 'Invalid API key' };
      
    } catch (error) {
      return { valid: false, reason: 'Key validation failed' };
    }
  }

  // Key Rotation
  async rotateAPIKey(keyId: string): Promise<APIKey> {
    const existingKey = await this.getAPIKey(keyId);
    
    if (!existingKey) {
      throw new Error('API key not found');
    }
    
    // Generate new key
    const newKey = await this.generateAPIKey(existingKey.userId, {
      name: `${existingKey.name} (rotated)`,
      permissions: existingKey.permissions,
      rateLimit: existingKey.rateLimit,
      metadata: {
        ...existingKey.metadata,
        rotatedFrom: keyId,
        rotatedAt: new Date()
      }
    });
    
    // Revoke old key
    await this.revokeAPIKey(keyId, 'rotated');
    
    return newKey;
  }
}
```

---

## 🔥 Firebase/Firestore Security Rules

### Comprehensive Security Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper Functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function hasRole(role) {
      return isAuthenticated() && 
        request.auth.token.role == role;
    }
    
    function isAdmin() {
      return hasRole('admin');
    }
    
    function isTeamMember(teamId) {
      return isAuthenticated() &&
        exists(/databases/$(database)/documents/teams/$(teamId)/members/$(request.auth.uid));
    }
    
    function rateLimitOk() {
      return request.time > resource.data.lastUpdate + duration.value(1, 's');
    }
    
    function validResumeData() {
      return request.resource.data.keys().hasAll(['content', 'metadata']) &&
        request.resource.data.content is string &&
        request.resource.data.content.size() < 5 * 1024 * 1024 && // 5MB limit
        request.resource.data.metadata is map;
    }
    
    // Users Collection
    match /users/{userId} {
      // Users can read their own profile
      allow read: if isOwner(userId);
      
      // Users can update their own profile with restrictions
      allow update: if isOwner(userId) && 
        request.resource.data.keys().hasAll(['email', 'profile']) &&
        request.resource.data.email == resource.data.email && // Can't change email
        request.resource.data.role == resource.data.role; // Can't change role
      
      // Only admins can delete users
      allow delete: if isAdmin();
      
      // Only auth system can create users
      allow create: if false;
      
      // Subcollections
      match /resumes/{resumeId} {
        // Users can read their own resumes
        allow read: if isOwner(userId);
        
        // Users can create resumes with validation
        allow create: if isOwner(userId) && 
          validResumeData() &&
          request.resource.data.userId == userId;
        
        // Users can update their own resumes with rate limiting
        allow update: if isOwner(userId) && 
          validResumeData() &&
          rateLimitOk();
        
        // Users can delete their own resumes
        allow delete: if isOwner(userId);
      }
      
      match /jobContexts/{jobId} {
        // Users can manage their own job contexts
        allow read, write: if isOwner(userId);
        
        // Validate job data
        allow create, update: if isOwner(userId) &&
          request.resource.data.keys().hasAll(['title', 'company', 'description']) &&
          request.resource.data.title.size() > 0 &&
          request.resource.data.title.size() < 200;
      }
      
      match /apiKeys/{keyId} {
        // Users can read their own API keys (metadata only)
        allow read: if isOwner(userId) && 
          !resource.data.keys().contains('key'); // Don't expose actual key
        
        // API key creation/updates through backend only
        allow write: if false;
      }
    }
    
    // Teams Collection
    match /teams/{teamId} {
      // Team members can read team data
      allow read: if isTeamMember(teamId);
      
      // Only team admins can update
      allow update: if isTeamMember(teamId) &&
        get(/databases/$(database)/documents/teams/$(teamId)/members/$(request.auth.uid)).data.role == 'admin';
      
      // Team creation through backend only
      allow create, delete: if false;
      
      match /members/{memberId} {
        // Team members can read member list
        allow read: if isTeamMember(teamId);
        
        // Only team admins can manage members
        allow write: if isTeamMember(teamId) &&
          get(/databases/$(database)/documents/teams/$(teamId)/members/$(request.auth.uid)).data.role == 'admin';
      }
      
      match /sharedResumes/{resumeId} {
        // Team members can read shared resumes
        allow read: if isTeamMember(teamId);
        
        // Resume owner or team admin can share/unshare
        allow write: if isTeamMember(teamId) && (
          resource.data.ownerId == request.auth.uid ||
          get(/databases/$(database)/documents/teams/$(teamId)/members/$(request.auth.uid)).data.role == 'admin'
        );
      }
    }
    
    // Audit Logs (Read-only for users)
    match /auditLogs/{logId} {
      // Users can read their own audit logs
      allow read: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
      
      // Only system can write audit logs
      allow write: if false;
    }
    
    // Public Resources
    match /public/{document=**} {
      allow read: if true;
      allow write: if false;
    }
    
    // Admin-only Collections
    match /admin/{document=**} {
      allow read, write: if isAdmin();
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Storage Security Rules

```javascript
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isValidResume() {
      return request.resource.size < 10 * 1024 * 1024 && // 10MB limit
        request.resource.contentType.matches('application/pdf|application/vnd.openxmlformats-officedocument.wordprocessingml.document|text/plain');
    }
    
    function isValidImage() {
      return request.resource.size < 5 * 1024 * 1024 && // 5MB limit
        request.resource.contentType.matches('image/.*');
    }
    
    // User uploads
    match /users/{userId}/resumes/{fileName} {
      // Users can read their own resumes
      allow read: if isOwner(userId);
      
      // Users can upload valid resumes
      allow create: if isOwner(userId) && isValidResume();
      
      // Users can update their own resumes
      allow update: if isOwner(userId) && isValidResume();
      
      // Users can delete their own resumes
      allow delete: if isOwner(userId);
    }
    
    // Profile pictures
    match /users/{userId}/profile/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId) && isValidImage();
    }
    
    // Temporary uploads (auto-deleted after 24h)
    match /temp/{userId}/{fileId} {
      allow read: if isOwner(userId);
      allow create: if isOwner(userId) && 
        request.resource.size < 50 * 1024 * 1024; // 50MB for processing
      allow delete: if isOwner(userId);
    }
    
    // Public assets
    match /public/{allPaths=**} {
      allow read: if true;
      allow write: if false;
    }
    
    // Deny all other access
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 🛠️ Backend Middleware Stack

### Core Security Middleware

```typescript
// Authentication Middleware
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from multiple sources
    const token = extractToken(req);
    
    if (!token) {
      throw new UnauthorizedError('No authentication token provided');
    }
    
    // Verify token based on type
    let user: AuthUser;
    
    if (token.startsWith('rp_')) {
      // API Key authentication
      const validation = await apiKeyManager.validateAPIKey(token);
      if (!validation.valid) {
        throw new UnauthorizedError('Invalid API key');
      }
      
      user = await userService.getUser(validation.userId);
      req.apiKey = validation;
      
    } else {
      // JWT authentication
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      // Check if token is revoked
      if (await tokenBlacklist.isRevoked(token)) {
        throw new UnauthorizedError('Token has been revoked');
      }
      
      user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: decodedToken.role || 'user',
        permissions: decodedToken.permissions || []
      };
    }
    
    // Attach user to request
    req.user = user;
    
    // Log authentication
    await auditLogger.log('auth_success', {
      userId: user.uid,
      method: token.startsWith('rp_') ? 'api_key' : 'jwt',
      ip: req.ip
    });
    
    next();
  } catch (error) {
    next(error);
  }
};

// Authorization Middleware Factory
export const authorize = (
  resource: string,
  action: string
) => async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedError('Not authenticated');
    }
    
    // Build context
    const context: ResourceContext = {
      resourceId: req.params.id,
      teamId: req.params.teamId,
      scope: determineScope(req),
      attributes: extractAttributes(req)
    };
    
    // Check permission
    const hasPermission = await authorizationService.checkPermission(
      user,
      resource,
      action,
      context
    );
    
    if (!hasPermission) {
      await auditLogger.log('auth_denied', {
        userId: user.uid,
        resource,
        action,
        context
      });
      
      throw new ForbiddenError(
        `Insufficient permissions for ${action} on ${resource}`
      );
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

// Rate Limiting Middleware
export const rateLimiter = (options: RateLimitOptions = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // requests per window
    standardHeaders: true,
    legacyHeaders: false,
    // Dynamic rate limits based on user type
    keyGenerator: (req: Request) => {
      if (req.user) {
        return `user:${req.user.uid}`;
      }
      if (req.apiKey) {
        return `apikey:${req.apiKey.keyId}`;
      }
      return req.ip;
    },
    // Custom rate limits
    max: async (req: Request) => {
      if (req.user?.role === 'premium') return 1000;
      if (req.user?.role === 'admin') return 10000;
      if (req.apiKey) return req.apiKey.rateLimit.requests;
      return 100; // Default for unauthenticated
    },
    // Redis store for distributed rate limiting
    store: new RedisStore({
      client: redis,
      prefix: 'ratelimit:'
    }),
    // Custom error handling
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        error: 'Too many requests',
        retryAfter: res.getHeader('Retry-After'),
        limit: res.getHeader('X-RateLimit-Limit')
      });
    }
  };
  
  return rateLimit({ ...defaultOptions, ...options });
};

// Input Validation Middleware
export const validateInput = (schema: Joi.Schema) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Validate against schema
      const validated = await schema.validateAsync(
        {
          body: req.body,
          query: req.query,
          params: req.params
        },
        {
          abortEarly: false,
          stripUnknown: true,
          convert: true
        }
      );
      
      // Replace request data with validated data
      req.body = validated.body;
      req.query = validated.query;
      req.params = validated.params;
      
      next();
    } catch (error) {
      if (error.isJoi) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.details.map(d => ({
            field: d.path.join('.'),
            message: d.message
          }))
        });
      }
      next(error);
    }
  };
};

// CORS Configuration
export const corsMiddleware = cors({
  origin: async (origin, callback) => {
    // Dynamic CORS validation
    if (!origin) {
      // Allow requests with no origin (mobile apps, Postman)
      return callback(null, true);
    }
    
    const allowedOrigins = await getAllowedOrigins();
    
    if (allowedOrigins.includes(origin) || 
        process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining'],
  maxAge: 86400 // 24 hours
});

// Security Headers Middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://apis.google.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.resumeparser.ai', 'wss://api.resumeparser.ai']
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Request Sanitization Middleware
export const sanitizeRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Sanitize body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  // Sanitize headers
  const dangerousHeaders = ['x-forwarded-for', 'x-real-ip'];
  dangerousHeaders.forEach(header => {
    if (req.headers[header]) {
      req.headers[header] = sanitizeString(req.headers[header] as string);
    }
  });
  
  next();
};

function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Prevent prototype pollution
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }
      sanitized[sanitizeString(key)] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
}

function sanitizeString(str: string): string {
  // Remove null bytes
  str = str.replace(/\0/g, '');
  
  // Escape HTML
  str = str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
  
  // Remove potential SQL injection attempts
  str = str.replace(/(\b)(union|select|insert|update|delete|drop)(\b)/gi, '');
  
  return str.trim();
}
```

### Advanced Middleware Patterns

```typescript
// Circuit Breaker Middleware
export class CircuitBreakerMiddleware {
  private breakers = new Map<string, CircuitBreaker>();
  
  middleware(serviceName: string, options: CircuitBreakerOptions = {}) {
    return async (req: Request, res: Response, next: NextFunction) => {
      let breaker = this.breakers.get(serviceName);
      
      if (!breaker) {
        breaker = new CircuitBreaker({
          timeout: options.timeout || 3000,
          errorThreshold: options.errorThreshold || 50,
          resetTimeout: options.resetTimeout || 60000
        });
        this.breakers.set(serviceName, breaker);
      }
      
      try {
        await breaker.execute(async () => {
          await next();
        });
      } catch (error) {
        if (error.code === 'CIRCUIT_OPEN') {
          res.status(503).json({
            error: 'Service temporarily unavailable',
            service: serviceName,
            retryAfter: breaker.nextAttempt
          });
        } else {
          next(error);
        }
      }
    };
  }
}

// Request Context Middleware
export const requestContext = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Generate request ID
  const requestId = req.headers['x-request-id'] as string || generateRequestId();
  
  // Create context
  const context: RequestContext = {
    requestId,
    startTime: Date.now(),
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    method: req.method,
    path: req.path,
    user: null // Will be populated by auth middleware
  };
  
  // Attach to request
  req.context = context;
  
  // Add to response headers
  res.setHeader('X-Request-ID', requestId);
  
  // Log request start
  logger.info('Request started', context);
  
  // Track request completion
  res.on('finish', () => {
    const duration = Date.now() - context.startTime;
    
    logger.info('Request completed', {
      ...context,
      statusCode: res.statusCode,
      duration
    });
    
    // Record metrics
    metrics.recordHistogram('http.request.duration', duration, {
      method: req.method,
      path: req.route?.path || 'unknown',
      status: res.statusCode.toString()
    });
  });
  
  next();
};

// Idempotency Middleware
export const idempotency = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (req.method !== 'POST' && req.method !== 'PUT') {
    return next();
  }
  
  const idempotencyKey = req.headers['idempotency-key'] as string;
  
  if (!idempotencyKey) {
    return next();
  }
  
  const cacheKey = `idempotency:${idempotencyKey}`;
  
  // Check if we have a cached response
  const cached = await redis.get(cacheKey);
  
  if (cached) {
    const response = JSON.parse(cached);
    return res.status(response.status).json(response.body);
  }
  
  // Intercept response
  const originalJson = res.json;
  res.json = function(body: any) {
    // Cache the response
    redis.setex(cacheKey, 86400, JSON.stringify({
      status: res.statusCode,
      body
    }));
    
    return originalJson.call(this, body);
  };
  
  next();
};
```

---

## 🎯 Threat Model Analysis

### STRIDE Threat Modeling

```typescript
export const ThreatModel = {
  // Spoofing Identity
  spoofing: {
    threats: [
      {
        id: 'T001',
        name: 'Credential Theft',
        description: 'Attacker obtains user credentials',
        impact: 'High',
        likelihood: 'Medium',
        mitigations: [
          'Multi-factor authentication',
          'Strong password policy',
          'Account lockout after failed attempts',
          'Anomaly detection'
        ]
      },
      {
        id: 'T002',
        name: 'Session Hijacking',
        description: 'Attacker steals session token',
        impact: 'High',
        likelihood: 'Medium',
        mitigations: [
          'Secure session management',
          'HTTPOnly cookies',
          'Session timeout',
          'Device fingerprinting'
        ]
      }
    ]
  },
  
  // Tampering
  tampering: {
    threats: [
      {
        id: 'T003',
        name: 'Data Manipulation',
        description: 'Attacker modifies resume data',
        impact: 'High',
        likelihood: 'Low',
        mitigations: [
          'Input validation',
          'Data integrity checks',
          'Audit logging',
          'Version control'
        ]
      },
      {
        id: 'T004',
        name: 'API Parameter Tampering',
        description: 'Attacker modifies API requests',
        impact: 'Medium',
        likelihood: 'Medium',
        mitigations: [
          'Request signing',
          'Parameter validation',
          'Rate limiting',
          'API versioning'
        ]
      }
    ]
  },
  
  // Repudiation
  repudiation: {
    threats: [
      {
        id: 'T005',
        name: 'Action Denial',
        description: 'User denies performing action',
        impact: 'Medium',
        likelihood: 'Low',
        mitigations: [
          'Comprehensive audit logging',
          'Digital signatures',
          'Timestamp verification',
          'Blockchain audit trail'
        ]
      }
    ]
  },
  
  // Information Disclosure
  informationDisclosure: {
    threats: [
      {
        id: 'T006',
        name: 'Data Breach',
        description: 'Unauthorized access to resume data',
        impact: 'Critical',
        likelihood: 'Low',
        mitigations: [
          'Encryption at rest',
          'Encryption in transit',
          'Access control',
          'Data minimization'
        ]
      },
      {
        id: 'T007',
        name: 'Error Message Leakage',
        description: 'Sensitive info in error messages',
        impact: 'Low',
        likelihood: 'Medium',
        mitigations: [
          'Generic error messages',
          'Error logging separation',
          'Stack trace sanitization'
        ]
      }
    ]
  },
  
  // Denial of Service
  denialOfService: {
    threats: [
      {
        id: 'T008',
        name: 'Resource Exhaustion',
        description: 'Attacker overwhelms system',
        impact: 'High',
        likelihood: 'Medium',
        mitigations: [
          'Rate limiting',
          'DDoS protection',
          'Resource quotas',
          'Circuit breakers'
        ]
      },
      {
        id: 'T009',
        name: 'Large File Upload',
        description: 'Upload of oversized files',
        impact: 'Medium',
        likelihood: 'High',
        mitigations: [
          'File size limits',
          'Async processing',
          'Stream processing',
          'Storage quotas'
        ]
      }
    ]
  },
  
  // Elevation of Privilege
  elevationOfPrivilege: {
    threats: [
      {
        id: 'T010',
        name: 'Privilege Escalation',
        description: 'User gains admin access',
        impact: 'Critical',
        likelihood: 'Low',
        mitigations: [
          'Principle of least privilege',
          'Role-based access control',
          'Permission validation',
          'Secure defaults'
        ]
      },
      {
        id: 'T011',
        name: 'SQL Injection',
        description: 'Database query manipulation',
        impact: 'Critical',
        likelihood: 'Low',
        mitigations: [
          'Parameterized queries',
          'Input sanitization',
          'ORM usage',
          'Database permissions'
        ]
      }
    ]
  }
};

// Risk Assessment Matrix
export class RiskAssessment {
  calculateRisk(impact: Impact, likelihood: Likelihood): RiskLevel {
    const matrix = {
      'Low': { 'Low': 'Low', 'Medium': 'Low', 'High': 'Medium' },
      'Medium': { 'Low': 'Low', 'Medium': 'Medium', 'High': 'High' },
      'High': { 'Low': 'Medium', 'Medium': 'High', 'High': 'Critical' },
      'Critical': { 'Low': 'High', 'Medium': 'Critical', 'High': 'Critical' }
    };
    
    return matrix[impact][likelihood];
  }
  
  prioritizeThreats(threats: Threat[]): Threat[] {
    return threats
      .map(threat => ({
        ...threat,
        riskLevel: this.calculateRisk(threat.impact, threat.likelihood),
        priority: this.calculatePriority(threat)
      }))
      .sort((a, b) => b.priority - a.priority);
  }
}
```

### Attack Surface Analysis

```typescript
export const AttackSurface = {
  // External Attack Surface
  external: {
    publicAPIs: [
      {
        endpoint: '/api/auth/*',
        authentication: 'None',
        riskLevel: 'High',
        controls: ['Rate limiting', 'Input validation', 'CAPTCHA']
      },
      {
        endpoint: '/api/resume/*',
        authentication: 'Required',
        riskLevel: 'Medium',
        controls: ['Auth required', 'File validation', 'Size limits']
      }
    ],
    
    fileUploads: {
      endpoints: ['/api/resume/upload', '/api/profile/avatar'],
      maxSize: '10MB',
      allowedTypes: ['pdf', 'docx', 'jpg', 'png'],
      controls: [
        'File type validation',
        'Virus scanning',
        'Content verification',
        'Sandboxed processing'
      ]
    },
    
    thirdPartyIntegrations: [
      {
        service: 'Google OAuth',
        dataShared: ['email', 'profile'],
        controls: ['Token validation', 'Scope limitation']
      },
      {
        service: 'AI Models',
        dataShared: ['resume content'],
        controls: ['Data anonymization', 'No PII in logs']
      }
    ]
  },
  
  // Internal Attack Surface
  internal: {
    adminAPIs: {
      authentication: 'Admin role required',
      additionalControls: ['IP whitelisting', 'MFA required', 'Audit logging']
    },
    
    databaseAccess: {
      controls: [
        'Encrypted connections',
        'Least privilege accounts',
        'Query logging',
        'Prepared statements only'
      ]
    },
    
    interServiceCommunication: {
      protocol: 'HTTPS with mTLS',
      authentication: 'Service accounts',
      controls: ['Service mesh', 'Zero trust networking']
    }
  }
};
```

---

## 📜 Security Policies & Procedures

### Security Policy Documentation

```typescript
export const SecurityPolicies = {
  // Data Classification Policy
  dataClassification: {
    levels: {
      public: {
        description: 'Public information',
        examples: ['Marketing content', 'Public APIs'],
        controls: ['None required']
      },
      internal: {
        description: 'Internal use only',
        examples: ['Architecture docs', 'Meeting notes'],
        controls: ['Authentication required']
      },
      confidential: {
        description: 'Sensitive business data',
        examples: ['User emails', 'Analytics data'],
        controls: ['Encryption', 'Access logging', 'Need-to-know']
      },
      restricted: {
        description: 'Highly sensitive data',
        examples: ['Resume content', 'PII', 'Payment info'],
        controls: ['End-to-end encryption', 'Audit trail', 'MFA required']
      }
    }
  },
  
  // Incident Response Plan
  incidentResponse: {
    phases: {
      detection: {
        responsibilities: ['SOC team', 'Automated monitoring'],
        sla: '15 minutes',
        actions: [
          'Identify threat indicators',
          'Assess severity',
          'Initial containment'
        ]
      },
      
      containment: {
        responsibilities: ['Security team', 'DevOps'],
        sla: '1 hour',
        actions: [
          'Isolate affected systems',
          'Preserve evidence',
          'Prevent spread'
        ]
      },
      
      eradication: {
        responsibilities: ['Security team', 'Development'],
        sla: '4 hours',
        actions: [
          'Remove threat',
          'Patch vulnerabilities',
          'Update security controls'
        ]
      },
      
      recovery: {
        responsibilities: ['DevOps', 'QA'],
        sla: '8 hours',
        actions: [
          'Restore services',
          'Verify integrity',
          'Monitor for reoccurrence'
        ]
      },
      
      postIncident: {
        responsibilities: ['All teams'],
        sla: '48 hours',
        actions: [
          'Root cause analysis',
          'Lessons learned',
          'Update procedures'
        ]
      }
    }
  },
  
  // Access Control Policy
  accessControl: {
    principles: [
      'Least privilege by default',
      'Separation of duties',
      'Regular access reviews',
      'Immediate revocation on termination'
    ],
    
    requirements: {
      authentication: {
        passwordPolicy: {
          minLength: 12,
          complexity: 'Required',
          rotation: '90 days',
          history: 5
        },
        mfa: {
          required: ['Admin users', 'Privileged operations'],
          methods: ['TOTP', 'SMS', 'Hardware tokens']
        }
      },
      
      authorization: {
        model: 'RBAC with ABAC policies',
        reviews: 'Quarterly',
        provisioning: 'Approval required',
        deprovisioning: 'Automated on termination'
      }
    }
  },
  
  // Security Training Requirements
  securityTraining: {
    onboarding: {
      topics: [
        'Security policies overview',
        'Data handling procedures',
        'Incident reporting',
        'Secure coding practices'
      ],
      frequency: 'Once',
      duration: '4 hours'
    },
    
    annual: {
      topics: [
        'Threat landscape update',
        'Phishing awareness',
        'Data privacy regulations',
        'Security best practices'
      ],
      frequency: 'Yearly',
      duration: '2 hours'
    },
    
    roleSpecific: {
      developers: [
        'OWASP Top 10',
        'Secure coding',
        'Dependency management',
        'Code review practices'
      ],
      operations: [
        'Infrastructure security',
        'Incident response',
        'Access management',
        'Monitoring and logging'
      ]
    }
  }
};

// Compliance Requirements
export const ComplianceRequirements = {
  gdpr: {
    requirements: [
      'Data minimization',
      'Purpose limitation',
      'Consent management',
      'Right to erasure',
      'Data portability',
      'Privacy by design'
    ],
    
    implementation: {
      dataMapping: 'Complete inventory of personal data',
      privacyNotices: 'Clear and accessible',
      consentMechanism: 'Explicit opt-in with granular controls',
      dataRetention: 'Automated deletion after retention period',
      subjectRequests: 'Automated DSAR handling'
    }
  },
  
  ccpa: {
    requirements: [
      'Right to know',
      'Right to delete',
      'Right to opt-out',
      'Non-discrimination'
    ],
    
    implementation: {
      privacyPolicy: 'Comprehensive disclosure',
      optOut: 'Clear mechanism for sale opt-out',
      dataRequests: '45-day response time',
      doNotSell: 'Prominent link on homepage'
    }
  },
  
  sox: {
    requirements: [
      'Access controls',
      'Audit trails',
      'Data integrity',
      'Change management'
    ],
    
    implementation: {
      controls: 'IT general controls',
      testing: 'Annual control testing',
      documentation: 'Complete control documentation',
      segregation: 'Duties properly separated'
    }
  }
};
```

---

## 🔒 API Security Implementation

### API Security Patterns

```typescript
// API Security Gateway
export class APISecurityGateway {
  // Request Signing
  async signRequest(
    request: APIRequest,
    credentials: APICredentials
  ): Promise<SignedRequest> {
    const timestamp = Date.now();
    const nonce = crypto.randomBytes(16).toString('hex');
    
    // Create canonical request
    const canonicalRequest = [
      request.method,
      request.path,
      request.queryString || '',
      request.headers['content-type'] || '',
      request.headers['x-api-key'] || '',
      timestamp,
      nonce,
      crypto.createHash('sha256').update(request.body || '').digest('hex')
    ].join('\n');
    
    // Sign with HMAC-SHA256
    const signature = crypto
      .createHmac('sha256', credentials.secretKey)
      .update(canonicalRequest)
      .digest('hex');
    
    return {
      ...request,
      headers: {
        ...request.headers,
        'X-Signature': signature,
        'X-Timestamp': timestamp.toString(),
        'X-Nonce': nonce
      }
    };
  }

  // Request Verification
  async verifyRequest(
    request: SignedRequest,
    getCredentials: (keyId: string) => Promise<APICredentials>
  ): Promise<boolean> {
    const keyId = request.headers['x-api-key'];
    if (!keyId) return false;
    
    const credentials = await getCredentials(keyId);
    if (!credentials) return false;
    
    // Check timestamp (5 minute window)
    const timestamp = parseInt(request.headers['x-timestamp']);
    if (Math.abs(Date.now() - timestamp) > 300000) {
      return false;
    }
    
    // Check nonce for replay attacks
    if (await this.isNonceUsed(request.headers['x-nonce'])) {
      return false;
    }
    
    // Verify signature
    const expectedSignature = await this.signRequest(request, credentials);
    
    const valid = crypto.timingSafeEqual(
      Buffer.from(request.headers['x-signature']),
      Buffer.from(expectedSignature.headers['X-Signature'])
    );
    
    if (valid) {
      // Mark nonce as used
      await this.markNonceUsed(request.headers['x-nonce']);
    }
    
    return valid;
  }

  // OAuth 2.0 Token Management
  async generateTokens(
    user: User,
    scopes: string[]
  ): Promise<TokenResponse> {
    const accessTokenPayload = {
      sub: user.id,
      email: user.email,
      scopes,
      type: 'access',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
    };
    
    const refreshTokenPayload = {
      sub: user.id,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 2592000 // 30 days
    };
    
    const accessToken = jwt.sign(
      accessTokenPayload,
      process.env.JWT_SECRET,
      { algorithm: 'RS256' }
    );
    
    const refreshToken = jwt.sign(
      refreshTokenPayload,
      process.env.JWT_REFRESH_SECRET,
      { algorithm: 'RS256' }
    );
    
    // Store refresh token
    await this.storeRefreshToken(user.id, refreshToken);
    
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: 3600,
      scopes: scopes.join(' ')
    };
  }
}

// API Versioning Security
export class APIVersioningSecurity {
  private supportedVersions = ['v1', 'v2'];
  private deprecatedVersions = ['v0'];
  
  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const version = this.extractVersion(req);
      
      if (!version) {
        return res.status(400).json({
          error: 'API version required'
        });
      }
      
      if (this.deprecatedVersions.includes(version)) {
        res.setHeader('X-API-Deprecated', 'true');
        res.setHeader('X-API-Sunset-Date', '2025-12-31');
        
        // Log deprecated usage
        logger.warn('Deprecated API version used', {
          version,
          user: req.user?.uid,
          endpoint: req.path
        });
      }
      
      if (!this.supportedVersions.includes(version) && 
          !this.deprecatedVersions.includes(version)) {
        return res.status(400).json({
          error: 'Unsupported API version',
          supported: this.supportedVersions
        });
      }
      
      req.apiVersion = version;
      next();
    };
  }
  
  private extractVersion(req: Request): string | null {
    // Check header first
    const headerVersion = req.headers['x-api-version'];
    if (headerVersion) return headerVersion;
    
    // Check URL path
    const pathMatch = req.path.match(/^\/api\/(v\d+)\//);
    if (pathMatch) return pathMatch[1];
    
    // Check query parameter
    return req.query.version as string || null;
  }
}
```

### GraphQL Security

```typescript
// GraphQL Security Implementation
export const graphqlSecurity = {
  // Query Depth Limiting
  depthLimit: depthLimit(10),
  
  // Query Complexity Analysis
  complexityAnalysis: createComplexityLimitRule({
    maximumComplexity: 1000,
    variables: {},
    onComplete: (complexity: number) => {
      console.log('Query Complexity:', complexity);
    },
    estimators: [
      fieldExtensionsEstimator(),
      simpleEstimator({ defaultComplexity: 1 })
    ]
  }),
  
  // Rate Limiting by Query
  queryRateLimiting: graphqlRateLimit({
    identifyContext: (ctx) => ctx.user?.id || ctx.ip,
    formatError: () => 'Too many requests',
    // Different limits for different operations
    createRateLimiter: (options) => {
      return {
        queries: {
          // Expensive queries
          searchResumes: { max: 10, window: '1m' },
          generateReport: { max: 5, window: '10m' },
          // Cheap queries
          getProfile: { max: 100, window: '1m' },
          listResumes: { max: 50, window: '1m' }
        },
        mutations: {
          // Write operations
          createResume: { max: 10, window: '1h' },
          updateResume: { max: 30, window: '1h' },
          deleteResume: { max: 10, window: '1h' }
        }
      };
    }
  }),
  
  // Field-Level Authorization
  fieldAuthorization: {
    User: {
      email: (parent, args, context) => {
        // Only user themselves or admin can see email
        return context.user?.id === parent.id || 
               context.user?.role === 'admin';
      },
      apiKeys: (parent, args, context) => {
        // Only user themselves can see API keys
        return context.user?.id === parent.id;
      }
    },
    Resume: {
      content: (parent, args, context) => {
        // Check resume access permissions
        return checkResumeAccess(context.user, parent.id);
      }
    }
  },
  
  // Input Validation
  validationRules: [
    require('graphql-input-string').default({
      trim: true,
      empty: false,
      max: 1000
    }),
    require('graphql-constraint-directive')()
  ]
};
```

---

## 🛡️ Data Protection & Privacy

### Encryption Implementation

```typescript
// Data Encryption Service
export class DataEncryptionService {
  private readonly kms: CloudKMS;
  
  // Field-Level Encryption
  async encryptField(
    plaintext: string,
    context: EncryptionContext
  ): Promise<EncryptedData> {
    // Generate or retrieve DEK (Data Encryption Key)
    const dek = await this.getDEK(context.userId);
    
    // Encrypt data
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', dek, iv);
    
    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final()
    ]);
    
    const authTag = cipher.getAuthTag();
    
    return {
      ciphertext: encrypted.toString('base64'),
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64'),
      keyVersion: dek.version,
      algorithm: 'AES-256-GCM'
    };
  }

  // Searchable Encryption
  async encryptSearchable(
    plaintext: string,
    context: EncryptionContext
  ): Promise<SearchableEncrypted> {
    // Standard encryption
    const encrypted = await this.encryptField(plaintext, context);
    
    // Generate search tokens
    const tokens = this.generateSearchTokens(plaintext);
    const encryptedTokens = await Promise.all(
      tokens.map(token => this.encryptSearchToken(token, context))
    );
    
    return {
      ...encrypted,
      searchTokens: encryptedTokens
    };
  }

  // Format Preserving Encryption (for structured data)
  async encryptFormatPreserving(
    value: string,
    format: string
  ): Promise<string> {
    // Use FF3-1 algorithm for format preservation
    const key = await this.getFormPreservingKey();
    const tweak = crypto.randomBytes(8);
    
    const cipher = new FF3Cipher(key, tweak);
    return cipher.encrypt(value, format);
  }

  // Homomorphic Encryption (for analytics)
  async encryptHomomorphic(
    value: number
  ): Promise<HomomorphicCiphertext> {
    const publicKey = await this.getHomomorphicPublicKey();
    
    // Using CKKS scheme for approximate arithmetic
    const context = seal.Context.create({
      schemeType: 'CKKS',
      polyModulusDegree: 8192,
      coeffModulus: [60, 40, 40, 60],
      scale: Math.pow(2, 40)
    });
    
    const encoder = new seal.CKKSEncoder(context);
    const encryptor = new seal.Encryptor(context, publicKey);
    
    const plaintext = encoder.encode(value);
    const ciphertext = encryptor.encrypt(plaintext);
    
    return {
      data: ciphertext.save(),
      context: context.save(),
      scale: Math.pow(2, 40)
    };
  }
}

// Privacy Controls
export class PrivacyControls {
  // Data Minimization
  async minimizeData<T>(
    data: T,
    purpose: DataPurpose
  ): Promise<Partial<T>> {
    const requiredFields = this.getRequiredFields(purpose);
    const minimized: any = {};
    
    for (const field of requiredFields) {
      if (data[field] !== undefined) {
        minimized[field] = data[field];
      }
    }
    
    return minimized;
  }

  // Consent Management
  async checkConsent(
    userId: string,
    purpose: string,
    dataCategories: string[]
  ): Promise<ConsentStatus> {
    const consents = await this.getConsents(userId);
    
    const relevantConsents = consents.filter(c => 
      c.purpose === purpose &&
      dataCategories.every(cat => c.categories.includes(cat))
    );
    
    if (relevantConsents.length === 0) {
      return { hasConsent: false, reason: 'No consent given' };
    }
    
    const activeConsent = relevantConsents.find(c => 
      c.status === 'active' &&
      (!c.expiresAt || c.expiresAt > new Date())
    );
    
    if (!activeConsent) {
      return { hasConsent: false, reason: 'Consent expired or withdrawn' };
    }
    
    return {
      hasConsent: true,
      consentId: activeConsent.id,
      givenAt: activeConsent.createdAt
    };
  }

  // Right to Erasure
  async deleteUserData(
    userId: string,
    verification: DeletionVerification
  ): Promise<DeletionResult> {
    // Verify request
    if (!await this.verifyDeletionRequest(userId, verification)) {
      throw new Error('Deletion request verification failed');
    }
    
    const deletionPlan = await this.createDeletionPlan(userId);
    
    // Execute deletion
    const results = await Promise.allSettled([
      this.deleteFromFirestore(userId, deletionPlan.firestore),
      this.deleteFromStorage(userId, deletionPlan.storage),
      this.deleteFromRedis(userId, deletionPlan.redis),
      this.deleteFromAnalytics(userId),
      this.deleteFromBackups(userId)
    ]);
    
    // Create deletion certificate
    const certificate = await this.createDeletionCertificate({
      userId,
      deletionId: generateDeletionId(),
      timestamp: new Date(),
      deletedItems: this.summarizeResults(results),
      retainedItems: deletionPlan.retained // Legal holds, etc.
    });
    
    return {
      success: results.every(r => r.status === 'fulfilled'),
      certificate,
      details: results
    };
  }

  // Data Portability
  async exportUserData(
    userId: string,
    format: ExportFormat
  ): Promise<ExportedData> {
    const data = await this.collectUserData(userId);
    
    // Decrypt sensitive fields
    const decrypted = await this.decryptForExport(data);
    
    // Format data
    let formatted: any;
    switch (format) {
      case 'json':
        formatted = JSON.stringify(decrypted, null, 2);
        break;
      case 'csv':
        formatted = await this.convertToCSV(decrypted);
        break;
      case 'xml':
        formatted = await this.convertToXML(decrypted);
        break;
    }
    
    // Create secure download
    const downloadToken = await this.createSecureDownload({
      userId,
      data: formatted,
      format,
      expiresIn: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    return {
      token: downloadToken,
      format,
      size: Buffer.byteLength(formatted),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };
  }
}
```

---

## 📊 Security Monitoring & Incident Response

### Security Event Monitoring

```typescript
// Security Monitoring Service
export class SecurityMonitoringService {
  private readonly siem: SIEMConnector;
  private readonly alerting: AlertingService;
  
  // Real-time Threat Detection
  async monitorSecurityEvents(): Promise<void> {
    // Authentication anomalies
    this.monitorAuthEvents();
    
    // API abuse detection
    this.monitorAPIUsage();
    
    // Data access patterns
    this.monitorDataAccess();
    
    // System anomalies
    this.monitorSystemHealth();
  }

  private async monitorAuthEvents(): Promise<void> {
    const authStream = this.createEventStream('auth.*');
    
    authStream.on('data', async (event: AuthEvent) => {
      // Failed login monitoring
      if (event.type === 'auth.failed') {
        const failureCount = await this.getFailureCount(
          event.email,
          300000 // 5 minutes
        );
        
        if (failureCount >= 5) {
          await this.createAlert({
            severity: 'high',
            type: 'brute_force_attempt',
            details: {
              email: event.email,
              attempts: failureCount,
              ip: event.ip
            }
          });
        }
      }
      
      // Impossible travel detection
      if (event.type === 'auth.success') {
        const lastLocation = await this.getLastLocation(event.userId);
        
        if (lastLocation) {
          const distance = this.calculateDistance(
            lastLocation,
            event.location
          );
          
          const timeDiff = event.timestamp - lastLocation.timestamp;
          const speed = distance / (timeDiff / 3600000); // km/h
          
          if (speed > 1000) { // Faster than commercial flight
            await this.createAlert({
              severity: 'critical',
              type: 'impossible_travel',
              details: {
                userId: event.userId,
                locations: [lastLocation, event.location],
                speed
              }
            });
          }
        }
      }
    });
  }

  private async monitorAPIUsage(): Promise<void> {
    const apiStream = this.createEventStream('api.*');
    
    // Sliding window for rate monitoring
    const windows = new Map<string, number[]>();
    
    apiStream.on('data', async (event: APIEvent) => {
      const key = `${event.userId}:${event.endpoint}`;
      
      // Update sliding window
      if (!windows.has(key)) {
        windows.set(key, []);
      }
      
      const window = windows.get(key)!;
      const now = Date.now();
      
      // Remove old entries (> 1 minute)
      while (window.length > 0 && window[0] < now - 60000) {
        window.shift();
      }
      
      window.push(now);
      
      // Check for anomalies
      if (window.length > 100) { // 100 requests per minute
        await this.createAlert({
          severity: 'medium',
          type: 'api_abuse',
          details: {
            userId: event.userId,
            endpoint: event.endpoint,
            requestCount: window.length,
            window: '1m'
          }
        });
      }
      
      // Check for suspicious patterns
      if (this.isSuspiciousPattern(event)) {
        await this.createAlert({
          severity: 'high',
          type: 'suspicious_api_pattern',
          details: event
        });
      }
    });
  }

  // Incident Response Automation
  async handleSecurityIncident(
    incident: SecurityIncident
  ): Promise<IncidentResponse> {
    const response = {
      incidentId: incident.id,
      actions: [] as string[],
      status: 'in_progress' as IncidentStatus
    };
    
    try {
      // Immediate containment
      if (incident.severity === 'critical') {
        await this.containThreat(incident);
        response.actions.push('threat_contained');
      }
      
      // Collect evidence
      const evidence = await this.collectEvidence(incident);
      response.actions.push('evidence_collected');
      
      // Notify stakeholders
      await this.notifyStakeholders(incident);
      response.actions.push('stakeholders_notified');
      
      // Apply remediations
      const remediations = await this.applyRemediations(incident);
      response.actions.push(...remediations);
      
      // Update security controls
      await this.updateSecurityControls(incident);
      response.actions.push('controls_updated');
      
      response.status = 'resolved';
    } catch (error) {
      response.status = 'failed';
      response.error = error.message;
    }
    
    return response;
  }

  private async containThreat(
    incident: SecurityIncident
  ): Promise<void> {
    switch (incident.type) {
      case 'account_compromise':
        // Disable account
        await this.disableUser(incident.affectedUsers[0]);
        // Revoke all sessions
        await this.revokeAllSessions(incident.affectedUsers[0]);
        // Force password reset
        await this.forcePasswordReset(incident.affectedUsers[0]);
        break;
        
      case 'api_abuse':
        // Block IP
        await this.blockIP(incident.sourceIP);
        // Revoke API key
        if (incident.apiKey) {
          await this.revokeAPIKey(incident.apiKey);
        }
        break;
        
      case 'data_breach':
        // Enable read-only mode
        await this.enableReadOnlyMode();
        // Snapshot affected data
        await this.snapshotData(incident.affectedResources);
        break;
    }
  }
}

// Security Metrics Dashboard
export class SecurityMetricsDashboard {
  async getSecurityMetrics(): Promise<SecurityMetrics> {
    const [
      authMetrics,
      apiMetrics,
      threatMetrics,
      complianceMetrics
    ] = await Promise.all([
      this.getAuthMetrics(),
      this.getAPIMetrics(),
      this.getThreatMetrics(),
      this.getComplianceMetrics()
    ]);
    
    return {
      timestamp: new Date(),
      authentication: authMetrics,
      api: apiMetrics,
      threats: threatMetrics,
      compliance: complianceMetrics,
      overallScore: this.calculateSecurityScore({
        authMetrics,
        apiMetrics,
        threatMetrics,
        complianceMetrics
      })
    };
  }

  private async getAuthMetrics(): Promise<AuthMetrics> {
    const window = 24 * 60 * 60 * 1000; // 24 hours
    
    return {
      totalLogins: await this.countEvents('auth.success', window),
      failedLogins: await this.countEvents('auth.failed', window),
      mfaAdoption: await this.getMFAAdoptionRate(),
      suspiciousLogins: await this.countEvents('auth.suspicious', window),
      passwordChanges: await this.countEvents('password.changed', window),
      accountLockouts: await this.countEvents('account.locked', window)
    };
  }

  private calculateSecurityScore(metrics: any): number {
    const scores = {
      mfaAdoption: metrics.authMetrics.mfaAdoption * 100,
      lowFailureRate: (1 - metrics.authMetrics.failedLogins / 
        (metrics.authMetrics.totalLogins || 1)) * 100,
      noThreats: metrics.threatMetrics.blocked === 0 ? 100 : 50,
      compliance: metrics.complianceMetrics.score
    };
    
    const weights = {
      mfaAdoption: 0.3,
      lowFailureRate: 0.2,
      noThreats: 0.3,
      compliance: 0.2
    };
    
    return Object.entries(scores).reduce((total, [key, score]) => {
      return total + (score * weights[key]);
    }, 0);
  }
}
```

---

## 🎯 Conclusion

This comprehensive security documentation provides a complete security architecture for the Resume Processing Platform, covering:

1. **Multi-layer Authentication**: Firebase Auth with MFA, session management, and anomaly detection
2. **Fine-grained Authorization**: RBAC with ABAC policies for flexible access control
3. **Comprehensive Middleware**: Rate limiting, input validation, CORS, and security headers
4. **Threat Mitigation**: Based on STRIDE model with specific countermeasures
5. **Data Protection**: Encryption at rest and in transit, privacy controls, GDPR compliance
6. **Security Monitoring**: Real-time threat detection and automated incident response

The security architecture follows defense-in-depth principles, ensuring multiple layers of protection for user data and system integrity. All components are designed to work together to provide enterprise-grade security while maintaining performance and user experience.

---

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Classification**: Confidential  
**Review Cycle**: Quarterly
