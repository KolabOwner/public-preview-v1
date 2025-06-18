/**
 * Type definitions for Skills Taxonomy Service
 * Comprehensive types for ESCO and O*NET API integration
 */

/**
 * Supported taxonomy providers
 */
export type TaxonomyProvider = 'esco' | 'onet';

/**
 * Skills taxonomy service interface
 */
export interface ISkillsTaxonomyService {
  /**
   * Initialize the service and validate connections
   */
  initialize(): Promise<void>;

  /**
   * Enrich skills with taxonomy data
   */
  enrichSkills(
    skills: string[],
    options?: SkillTaxonomyOptions
  ): Promise<SkillEnrichmentResult[]>;

  /**
   * Search for skills in taxonomies
   */
  searchSkills(
    query: string,
    options?: SkillTaxonomyOptions
  ): Promise<SkillMatch[]>;

  /**
   * Search for occupations related to skills
   */
  searchOccupations(
    skills: string[],
    options?: SkillTaxonomyOptions
  ): Promise<OccupationMatch[]>;

  /**
   * Get detailed information about a skill
   */
  getSkillDetails(
    skillId: string,
    provider: TaxonomyProvider
  ): Promise<SkillMatch | null>;

  /**
   * Get related skills
   */
  getRelatedSkills(
    skill: string,
    options?: SkillTaxonomyOptions
  ): Promise<SkillMatch[]>;

  /**
   * Map skills between taxonomies
   */
  mapSkillsAcrossTaxonomies(
    skills: string[],
    fromProvider: TaxonomyProvider,
    toProvider: TaxonomyProvider
  ): Promise<Map<string, SkillMatch[]>>;

  /**
   * Validate skill against taxonomies
   */
  validateSkill(
    skill: string,
    options?: SkillTaxonomyOptions
  ): Promise<SkillValidationResult>;
}

/**
 * Options for skill taxonomy operations
 */
export interface SkillTaxonomyOptions {
  /**
   * Which providers to use
   */
  providers?: TaxonomyProvider[];

  /**
   * Language for ESCO queries
   */
  language?: string;

  /**
   * Maximum results to return
   */
  limit?: number;

  /**
   * Include broader/narrower concepts
   */
  includeRelations?: boolean;

  /**
   * Minimum relevance score (0-1)
   */
  minRelevance?: number;

  /**
   * Industry context for filtering
   */
  industryContext?: string;

  /**
   * Skill type filter
   */
  skillTypes?: string[];

  /**
   * Include obsolete skills
   */
  includeObsolete?: boolean;
}

/**
 * Skill enrichment result
 */
export interface SkillEnrichmentResult {
  /**
   * Original skill term
   */
  originalSkill: string;

  /**
   * Matched skills from taxonomies
   */
  matches: SkillMatch[];

  /**
   * Related skills
   */
  relatedSkills: string[];

  /**
   * Related occupations
   */
  occupations: string[];

  /**
   * Skill categories
   */
  categories: string[];

  /**
   * Broader concepts
   */
  broaderConcepts: string[];

  /**
   * Narrower concepts
   */
  narrowerConcepts: string[];
}

/**
 * Skill match from taxonomy
 */
export interface SkillMatch {
  /**
   * Unique identifier
   */
  id: string;

  /**
   * URI in the taxonomy
   */
  uri: string;

  /**
   * Preferred label
   */
  preferredLabel: string;

  /**
   * Alternative labels/synonyms
   */
  alternativeLabels: string[];

  /**
   * Skill description
   */
  description: string;

  /**
   * Skill type (e.g., 'skill/competence', 'knowledge')
   */
  type: string;

  /**
   * Source provider
   */
  provider: TaxonomyProvider;

  /**
   * Relevance score (0-1)
   */
  relevanceScore: number;

  /**
   * Broader concept URIs
   */
  broaderConcepts?: string[];

  /**
   * Narrower concept URIs
   */
  narrowerConcepts?: string[];

  /**
   * Related concept URIs
   */
  relatedConcepts?: string[];

  /**
   * Additional metadata
   */
  metadata?: Record<string, any>;
}

/**
 * Occupation match from taxonomy
 */
export interface OccupationMatch {
  /**
   * Unique identifier
   */
  id: string;

  /**
   * URI in the taxonomy
   */
  uri: string;

  /**
   * Occupation code (e.g., ISCO, SOC)
   */
  code: string;

  /**
   * Occupation title
   */
  title: string;

  /**
   * Occupation description
   */
  description: string;

  /**
   * Source provider
   */
  provider: TaxonomyProvider;

  /**
   * Skills that matched this occupation
   */
  matchedSkills: string[];

  /**
   * Relevance score (0-1)
   */
  relevanceScore: number;

  /**
   * Required skills for this occupation
   */
  requiredSkills: string[];

  /**
   * Optional/preferred skills
   */
  optionalSkills: string[];

  /**
   * Additional metadata
   */
  metadata?: Record<string, any>;
}

/**
 * Skill validation result
 */
export interface SkillValidationResult {
  /**
   * Whether the skill is valid
   */
  isValid: boolean;

  /**
   * Confidence score (0-1)
   */
  confidence: number;

  /**
   * Matched skills from taxonomies
   */
  matches: SkillMatch[];

  /**
   * Suggested alternative skills
   */
  suggestions: string[];
}

/**
 * ESCO API configuration
 */
export interface ESCOConfig {
  /**
   * Base URL for ESCO API
   */
  baseUrl: string;

  /**
   * ESCO version to use
   */
  version: string;

  /**
   * Default language
   */
  language: string;

  /**
   * Request timeout in milliseconds
   */
  timeout: number;

  /**
   * Number of retry attempts
   */
  retryAttempts: number;

  /**
   * Delay between retries
   */
  retryDelay: number;

  /**
   * Maximum results per page
   */
  maxResultsPerPage: number;

  /**
   * Rate limiting configuration
   */
  rateLimit: {
    maxRequests: number;
    windowMs: number;
  };
}

/**
 * O*NET API configuration
 */
export interface ONETConfig {
  /**
   * Base URL for O*NET API
   */
  baseUrl: string;

  /**
   * API version
   */
  version: string;

  /**
   * API username
   */
  username: string;

  /**
   * API password
   */
  password: string;

  /**
   * Request timeout in milliseconds
   */
  timeout: number;

  /**
   * Number of retry attempts
   */
  retryAttempts: number;

  /**
   * Delay between retries
   */
  retryDelay: number;

  /**
   * Maximum results per page
   */
  maxResultsPerPage: number;

  /**
   * Rate limiting configuration
   */
  rateLimit: {
    maxRequests: number;
    windowMs: number;
  };
}

/**
 * Skill category types in ESCO
 */
export enum ESCOSkillType {
  SKILL_COMPETENCE = 'skill/competence',
  KNOWLEDGE = 'knowledge',
  LANGUAGE = 'language',
  ATTITUDE = 'attitude'
}

/**
 * Skill reuse levels in ESCO
 */
export enum ESCOSkillReuseLevel {
  TRANSVERSAL = 'transversal',
  CROSS_SECTOR = 'cross-sector',
  SECTOR_SPECIFIC = 'sector-specific',
  OCCUPATION_SPECIFIC = 'occupation-specific'
}

/**
 * O*NET element types
 */
export enum ONETElementType {
  ABILITY = 'ability',
  SKILL = 'skill',
  KNOWLEDGE = 'knowledge',
  WORK_ACTIVITY = 'work_activity',
  WORK_CONTEXT = 'work_context',
  INTEREST = 'interest',
  WORK_VALUE = 'work_value',
  WORK_STYLE = 'work_style'
}

/**
 * Skills API error
 */
export class SkillsAPIError extends Error {
  constructor(
    message: string,
    public provider: TaxonomyProvider,
    public statusCode?: number,
    public originalError?: any
  ) {
    super(message);
    this.name = 'SkillsAPIError';
  }
}

/**
 * Skills enrichment metrics
 */
export interface SkillsEnrichmentMetrics {
  totalSkills: number;
  enrichedSkills: number;
  providersUsed: TaxonomyProvider[];
  averageConfidence: number;
  processingTime: number;
  cacheHits: number;
  apiCalls: number;
  errors: Array<{
    skill: string;
    provider: TaxonomyProvider;
    error: string;
  }>;
}