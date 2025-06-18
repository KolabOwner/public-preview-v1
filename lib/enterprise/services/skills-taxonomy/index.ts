/**
 * Skills Taxonomy Service
 * Enterprise-grade integration with ESCO and O*NET APIs for skills enhancement
 * Provides unified interface for skills matching, enrichment, and taxonomy management
 */

import { logger } from '../../monitoring/logging';
import { performanceAnalytics } from '../../monitoring/analytics';
import { circuitBreakerManager } from '../../resilience/circuit-breaker';
import { cache } from '../../infrastructure/cache';
import { RateLimiter } from '../../infrastructure/rate-limiter';
import { 
  ISkillsTaxonomyService,
  SkillEnrichmentResult,
  SkillMatch,
  OccupationMatch,
  SkillTaxonomyOptions,
  ESCOConfig,
  ONETConfig,
  TaxonomyProvider
} from './types';

/**
 * Default configuration for ESCO API
 */
const DEFAULT_ESCO_CONFIG: ESCOConfig = {
  baseUrl: process.env.ESCO_API_URL || 'https://ec.europa.eu/esco/api',
  version: process.env.ESCO_API_VERSION || 'v1.1.0',
  language: process.env.ESCO_DEFAULT_LANGUAGE || 'en',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  maxResultsPerPage: 100,
  rateLimit: {
    maxRequests: 100,
    windowMs: 60000 // 1 minute
  }
};

/**
 * Default configuration for O*NET API
 */
const DEFAULT_ONET_CONFIG: ONETConfig = {
  baseUrl: process.env.ONET_API_URL || 'https://services.onetcenter.org',
  version: process.env.ONET_API_VERSION || 'v1.9',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  maxResultsPerPage: 50,
  rateLimit: {
    maxRequests: 150,
    windowMs: 60000 // 1 minute
  },
  // Authentication from environment variables
  username: process.env.ONET_API_USERNAME || '',
  password: process.env.ONET_API_PASSWORD || ''
};

/**
 * Skills Taxonomy Service Implementation
 * Provides unified access to ESCO and O*NET taxonomies with caching,
 * rate limiting, and circuit breaker patterns
 */
export class SkillsTaxonomyService implements ISkillsTaxonomyService {
  private escoConfig: ESCOConfig;
  private onetConfig: ONETConfig;
  private escoRateLimiter: RateLimiter;
  private onetRateLimiter: RateLimiter;
  private initialized: boolean = false;

  constructor(
    escoConfig: Partial<ESCOConfig> = {},
    onetConfig: Partial<ONETConfig> = {}
  ) {
    this.escoConfig = { ...DEFAULT_ESCO_CONFIG, ...escoConfig };
    this.onetConfig = { ...DEFAULT_ONET_CONFIG, ...onetConfig };

    // Initialize rate limiters
    this.escoRateLimiter = new RateLimiter({
      windowMs: this.escoConfig.rateLimit.windowMs,
      max: this.escoConfig.rateLimit.maxRequests,
      keyGenerator: () => 'esco-api'
    });

    this.onetRateLimiter = new RateLimiter({
      windowMs: this.onetConfig.rateLimit.windowMs,
      max: this.onetConfig.rateLimit.maxRequests,
      keyGenerator: () => 'onet-api'
    });
  }

  /**
   * Initialize the service and validate configurations
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      logger.info('Initializing Skills Taxonomy Service');

      // Validate ESCO configuration
      await this.validateESCOConnection();

      // Validate O*NET configuration
      if (this.onetConfig.username && this.onetConfig.password) {
        await this.validateONETConnection();
      } else {
        logger.warn('O*NET credentials not configured, O*NET features will be disabled');
      }

      this.initialized = true;
      logger.info('Skills Taxonomy Service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Skills Taxonomy Service', { error });
      throw error;
    }
  }

  /**
   * Enrich skills with taxonomy data from ESCO and O*NET
   */
  async enrichSkills(
    skills: string[],
    options: SkillTaxonomyOptions = {}
  ): Promise<SkillEnrichmentResult[]> {
    const timer = performanceAnalytics.startTimer('skills.enrichment', {
      skillCount: skills.length,
      providers: options.providers?.join(',') || 'all'
    });

    try {
      const results: SkillEnrichmentResult[] = [];
      const providers = options.providers || ['esco', 'onet'];

      // Process skills in batches for efficiency
      const batchSize = 10;
      for (let i = 0; i < skills.length; i += batchSize) {
        const batch = skills.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(skill => this.enrichSingleSkill(skill, providers, options))
        );
        results.push(...batchResults);
      }

      // Record metrics
      await performanceAnalytics.recordMetric(
        'skills.enrichment.success_rate',
        results.filter(r => r.matches.length > 0).length / skills.length,
        'gauge' as any,
        { providers: providers.join(',') }
      );

      return results;
    } finally {
      await timer();
    }
  }

  /**
   * Search for skills in taxonomies
   */
  async searchSkills(
    query: string,
    options: SkillTaxonomyOptions = {}
  ): Promise<SkillMatch[]> {
    const cacheKey = `skills:search:${query}:${JSON.stringify(options)}`;
    
    // Check cache first
    const cached = await cache.get(cacheKey);
    if (cached) {
      return cached as SkillMatch[];
    }

    const providers = options.providers || ['esco', 'onet'];
    const results: SkillMatch[] = [];

    // Search in ESCO
    if (providers.includes('esco')) {
      const escoResults = await this.searchESCOSkills(query, options);
      results.push(...escoResults);
    }

    // Search in O*NET
    if (providers.includes('onet') && this.onetConfig.username) {
      const onetResults = await this.searchONETSkills(query, options);
      results.push(...onetResults);
    }

    // Deduplicate and sort by relevance
    const deduplicated = this.deduplicateSkills(results);
    const sorted = deduplicated.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Cache results
    await cache.set(cacheKey, sorted, 3600); // 1 hour TTL

    return sorted.slice(0, options.limit || 20);
  }

  /**
   * Search for occupations related to skills
   */
  async searchOccupations(
    skills: string[],
    options: SkillTaxonomyOptions = {}
  ): Promise<OccupationMatch[]> {
    const timer = performanceAnalytics.startTimer('skills.occupation_search', {
      skillCount: skills.length
    });

    try {
      const providers = options.providers || ['esco', 'onet'];
      const occupations: OccupationMatch[] = [];

      // Search in ESCO
      if (providers.includes('esco')) {
        const escoOccupations = await this.searchESCOOccupations(skills, options);
        occupations.push(...escoOccupations);
      }

      // Search in O*NET
      if (providers.includes('onet') && this.onetConfig.username) {
        const onetOccupations = await this.searchONETOccupations(skills, options);
        occupations.push(...onetOccupations);
      }

      // Merge and rank occupations
      const merged = this.mergeOccupations(occupations);
      
      return merged.slice(0, options.limit || 10);
    } finally {
      await timer();
    }
  }

  /**
   * Get skill details from taxonomy
   */
  async getSkillDetails(
    skillId: string,
    provider: TaxonomyProvider
  ): Promise<SkillMatch | null> {
    const cacheKey = `skill:details:${provider}:${skillId}`;
    
    // Check cache
    const cached = await cache.get(cacheKey);
    if (cached) {
      return cached as SkillMatch;
    }

    let result: SkillMatch | null = null;

    if (provider === 'esco') {
      result = await this.getESCOSkillDetails(skillId);
    } else if (provider === 'onet' && this.onetConfig.username) {
      result = await this.getONETSkillDetails(skillId);
    }

    if (result) {
      await cache.set(cacheKey, result, 86400); // 24 hour TTL
    }

    return result;
  }

  /**
   * Get related skills from taxonomies
   */
  async getRelatedSkills(
    skill: string,
    options: SkillTaxonomyOptions = {}
  ): Promise<SkillMatch[]> {
    const providers = options.providers || ['esco', 'onet'];
    const relatedSkills: SkillMatch[] = [];

    // Get from ESCO
    if (providers.includes('esco')) {
      const escoRelated = await this.getESCORelatedSkills(skill, options);
      relatedSkills.push(...escoRelated);
    }

    // Get from O*NET
    if (providers.includes('onet') && this.onetConfig.username) {
      const onetRelated = await this.getONETRelatedSkills(skill, options);
      relatedSkills.push(...onetRelated);
    }

    // Deduplicate and sort
    const deduplicated = this.deduplicateSkills(relatedSkills);
    
    return deduplicated.slice(0, options.limit || 15);
  }

  /**
   * Map skills between different taxonomies
   */
  async mapSkillsAcrossTaxonomies(
    skills: string[],
    fromProvider: TaxonomyProvider,
    toProvider: TaxonomyProvider
  ): Promise<Map<string, SkillMatch[]>> {
    const mappings = new Map<string, SkillMatch[]>();

    for (const skill of skills) {
      // First, get skill details from source provider
      const sourceSkill = await this.searchSkills(skill, {
        providers: [fromProvider],
        limit: 1
      });

      if (sourceSkill.length === 0) continue;

      // Then search for equivalent in target provider
      const targetSkills = await this.searchSkills(sourceSkill[0].preferredLabel, {
        providers: [toProvider],
        limit: 5
      });

      // Also search using alternative labels
      for (const altLabel of sourceSkill[0].alternativeLabels || []) {
        const altResults = await this.searchSkills(altLabel, {
          providers: [toProvider],
          limit: 3
        });
        targetSkills.push(...altResults);
      }

      // Deduplicate and store mapping
      const deduplicated = this.deduplicateSkills(targetSkills);
      mappings.set(skill, deduplicated);
    }

    return mappings;
  }

  /**
   * Validate skill against taxonomies
   */
  async validateSkill(
    skill: string,
    options: SkillTaxonomyOptions = {}
  ): Promise<{
    isValid: boolean;
    confidence: number;
    matches: SkillMatch[];
    suggestions: string[];
  }> {
    const matches = await this.searchSkills(skill, {
      ...options,
      limit: 5
    });

    // Calculate confidence based on match scores
    const maxScore = matches.length > 0 ? matches[0].relevanceScore : 0;
    const confidence = maxScore > 0.8 ? 1.0 : maxScore;

    // Generate suggestions from top matches
    const suggestions = matches
      .filter(m => m.relevanceScore > 0.5)
      .map(m => m.preferredLabel)
      .filter(label => label.toLowerCase() !== skill.toLowerCase());

    return {
      isValid: matches.length > 0 && maxScore > 0.7,
      confidence,
      matches,
      suggestions
    };
  }

  // Private helper methods

  /**
   * Enrich a single skill
   */
  private async enrichSingleSkill(
    skill: string,
    providers: string[],
    options: SkillTaxonomyOptions
  ): Promise<SkillEnrichmentResult> {
    const matches: SkillMatch[] = [];
    const relatedSkills: string[] = [];
    const occupations: string[] = [];

    // Search in each provider
    for (const provider of providers) {
      try {
        const searchResults = await this.searchSkills(skill, {
          ...options,
          providers: [provider as TaxonomyProvider],
          limit: 3
        });
        matches.push(...searchResults);

        // Get related skills for top match
        if (searchResults.length > 0) {
          const related = await this.getRelatedSkills(searchResults[0].preferredLabel, {
            providers: [provider as TaxonomyProvider],
            limit: 5
          });
          relatedSkills.push(...related.map(r => r.preferredLabel));
        }
      } catch (error) {
        logger.warn(`Failed to enrich skill in ${provider}`, { skill, error });
      }
    }

    // Get related occupations
    if (matches.length > 0) {
      const occupationResults = await this.searchOccupations([skill], {
        ...options,
        limit: 5
      });
      occupations.push(...occupationResults.map(o => o.title));
    }

    return {
      originalSkill: skill,
      matches: this.deduplicateSkills(matches),
      relatedSkills: [...new Set(relatedSkills)],
      occupations: [...new Set(occupations)],
      categories: this.extractCategories(matches),
      broaderConcepts: this.extractBroaderConcepts(matches),
      narrowerConcepts: this.extractNarrowerConcepts(matches)
    };
  }

  /**
   * Search skills in ESCO
   */
  private async searchESCOSkills(
    query: string,
    options: SkillTaxonomyOptions
  ): Promise<SkillMatch[]> {
    // Validate input
    if (!query || query.trim().length === 0) {
      return [];
    }
    
    // Sanitize query for ESCO API
    const sanitizedQuery = query.trim().slice(0, 100); // ESCO has query length limits
    
    const breaker = circuitBreakerManager.getBreaker('esco_api');
    
    return await breaker.execute(async () => {
      await this.escoRateLimiter.checkLimit();

      const params = new URLSearchParams({
        text: sanitizedQuery,
        language: options.language || this.escoConfig.language,
        type: 'skill',
        offset: '0',
        limit: String(options.limit || 20),
        selectedVersion: this.escoConfig.version
      });
      
      // Add facets separately to avoid URLSearchParams overwriting
      params.append('facet', 'type');
      params.append('facet', 'skillType');

      const response = await fetch(
        `${this.escoConfig.baseUrl}/search?${params}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Accept-Language': options.language || this.escoConfig.language
          },
          signal: AbortSignal.timeout(this.escoConfig.timeout)
        }
      );

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        logger.warn(`ESCO API request failed`, {
          status: response.status,
          statusText: response.statusText,
          query,
          url: `${this.escoConfig.baseUrl}/search?${params}`,
          errorResponse: errorText.substring(0, 200)
        });
        throw new Error(`ESCO API error: ${response.status}`);
      }

      const data = await response.json();
      
      return this.transformESCOSkills(data._embedded?.results || []);
    });
  }

  /**
   * Search skills in O*NET
   */
  private async searchONETSkills(
    query: string,
    options: SkillTaxonomyOptions
  ): Promise<SkillMatch[]> {
    const breaker = circuitBreakerManager.getBreaker('onet_api');
    
    return await breaker.execute(async () => {
      await this.onetRateLimiter.checkLimit();

      const auth = Buffer.from(
        `${this.onetConfig.username}:${this.onetConfig.password}`
      ).toString('base64');

      // First, search for occupations containing the skill keyword
      const searchResponse = await fetch(
        `${this.onetConfig.baseUrl}/ws/mnm/search?keyword=${encodeURIComponent(query)}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Basic ${auth}`,
            'User-Agent': 'SkillsTaxonomyService/1.0'
          },
          signal: AbortSignal.timeout(this.onetConfig.timeout)
        }
      );

      if (!searchResponse.ok) {
        throw new Error(`O*NET API error: ${searchResponse.status} ${searchResponse.statusText}`);
      }

      const searchData = await searchResponse.json();
      const skills: SkillMatch[] = [];
      const processedSkills = new Set<string>();

      // For each occupation found, get its skills
      for (const occupation of (searchData.occupation || []).slice(0, 5)) {
        try {
          const skillsResponse = await fetch(
            `${this.onetConfig.baseUrl}/ws/online/occupations/${occupation.code}/summary/skills`,
            {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'Authorization': `Basic ${auth}`,
                'User-Agent': 'SkillsTaxonomyService/1.0'
              },
              signal: AbortSignal.timeout(this.onetConfig.timeout)
            }
          );

          if (skillsResponse.ok) {
            const skillsData = await skillsResponse.json();
            
            for (const skillGroup of (skillsData.group || [])) {
              for (const skill of (skillGroup.element || [])) {
                // Only add skills that match our query and haven't been processed
                if (skill.name.toLowerCase().includes(query.toLowerCase()) && 
                    !processedSkills.has(skill.id)) {
                  processedSkills.add(skill.id);
                  
                  skills.push({
                    id: skill.id,
                    uri: skill.related?.href || `${this.onetConfig.baseUrl}/ws/online/occupations/${occupation.code}/summary/skills/${skill.id}`,
                    preferredLabel: skill.name,
                    alternativeLabels: [],
                    description: skill.description || '',
                    type: 'skill',
                    provider: 'onet' as TaxonomyProvider,
                    relevanceScore: this.calculateONETRelevance(skill, query),
                    broaderConcepts: [],
                    narrowerConcepts: [],
                    relatedConcepts: [],
                    metadata: {
                      level: skill.level?.value,
                      importance: skill.importance?.value,
                      category: skillGroup.title,
                      occupationCode: occupation.code,
                      occupationTitle: occupation.title
                    }
                  });
                }
              }
            }
          }
        } catch (error) {
          logger.warn(`Failed to fetch skills for occupation ${occupation.code}`, { error });
        }
      }

      return skills;
    });
  }

  /**
   * Transform ESCO API results to SkillMatch format
   */
  private transformESCOSkills(escoSkills: any[]): SkillMatch[] {
    return escoSkills.map(skill => ({
      id: skill.uri,
      uri: skill.uri,
      preferredLabel: skill.title,
      alternativeLabels: skill.alternativeLabel || [],
      description: skill.description?.en?.literal || '',
      type: skill.skillType || 'skill/competence',
      provider: 'esco' as TaxonomyProvider,
      relevanceScore: skill.score || 0.5,
      broaderConcepts: skill.broaderUri || [],
      narrowerConcepts: skill.narrowerUri || [],
      relatedConcepts: skill.relatedUri || [],
      metadata: {
        skillType: skill.skillType,
        reuseLevel: skill.skillReuseLevel,
        lastModified: skill.modifiedDate
      }
    }));
  }

  /**
   * Calculate relevance score for O*NET skills
   */
  private calculateONETRelevance(skill: any, query: string): number {
    let score = 0.5;
    
    // Exact match gets highest score
    if (skill.name.toLowerCase() === query.toLowerCase()) {
      score = 1.0;
    } else if (skill.name.toLowerCase().includes(query.toLowerCase())) {
      score = 0.8;
    }
    
    // Boost score based on importance
    if (skill.importance?.value) {
      score += (skill.importance.value / 100) * 0.2;
    }
    
    return Math.min(score, 1.0);
  }

  /**
   * Search occupations in ESCO
   */
  private async searchESCOOccupations(
    skills: string[],
    options: SkillTaxonomyOptions
  ): Promise<OccupationMatch[]> {
    const occupations: OccupationMatch[] = [];

    for (const skill of skills) {
      const params = new URLSearchParams({
        text: skill,
        language: options.language || this.escoConfig.language,
        type: 'occupation',
        offset: '0',
        limit: '10',
        selectedVersion: this.escoConfig.version
      });

      try {
        const response = await fetch(
          `${this.escoConfig.baseUrl}/search?${params}`,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            },
            signal: AbortSignal.timeout(this.escoConfig.timeout)
          }
        );

        if (response.ok) {
          const data = await response.json();
          const escoOccupations = this.transformESCOOccupations(
            data._embedded?.results || [],
            skill
          );
          occupations.push(...escoOccupations);
        }
      } catch (error) {
        logger.warn('Failed to search ESCO occupations', { skill, error });
      }
    }

    return occupations;
  }

  /**
   * Search occupations in O*NET by skills
   */
  private async searchONETOccupations(
    skills: string[],
    options: SkillTaxonomyOptions
  ): Promise<OccupationMatch[]> {
    const breaker = circuitBreakerManager.getBreaker('onet_api');
    
    return await breaker.execute(async () => {
      await this.onetRateLimiter.checkLimit();

      const auth = Buffer.from(
        `${this.onetConfig.username}:${this.onetConfig.password}`
      ).toString('base64');

      const occupations: OccupationMatch[] = [];
      const processedOccupations = new Set<string>();

      // Search for each skill
      for (const skill of skills) {
        try {
          const response = await fetch(
            `${this.onetConfig.baseUrl}/ws/mnm/search?keyword=${encodeURIComponent(skill)}`,
            {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'Authorization': `Basic ${auth}`,
                'User-Agent': 'SkillsTaxonomyService/1.0'
              },
              signal: AbortSignal.timeout(this.onetConfig.timeout)
            }
          );

          if (response.ok) {
            const data = await response.json();
            
            for (const occupation of (data.occupation || [])) {
              if (!processedOccupations.has(occupation.code)) {
                processedOccupations.add(occupation.code);
                
                // Get detailed occupation info
                const detailResponse = await fetch(
                  `${this.onetConfig.baseUrl}/ws/online/occupations/${occupation.code}`,
                  {
                    method: 'GET',
                    headers: {
                      'Accept': 'application/json',
                      'Authorization': `Basic ${auth}`,
                      'User-Agent': 'SkillsTaxonomyService/1.0'
                    }
                  }
                );

                if (detailResponse.ok) {
                  const detailData = await detailResponse.json();
                  
                  occupations.push({
                    id: occupation.code,
                    uri: `${this.onetConfig.baseUrl}/ws/online/occupations/${occupation.code}`,
                    code: occupation.code,
                    title: occupation.title,
                    description: detailData.description || '',
                    provider: 'onet' as TaxonomyProvider,
                    matchedSkills: [skill],
                    relevanceScore: occupation.relevance_score || 0.5,
                    requiredSkills: [],
                    optionalSkills: [],
                    metadata: {
                      tags: occupation.tags,
                      jobZone: detailData.job_zone,
                      svpRange: detailData.svp_range
                    }
                  });
                }
              }
            }
          }
        } catch (error) {
          logger.warn(`Failed to search O*NET occupations for skill: ${skill}`, { error });
        }
      }

      return occupations;
    });
  }

  /**
   * Transform ESCO occupations to OccupationMatch format
   */
  private transformESCOOccupations(
    occupations: any[],
    matchedSkill: string
  ): OccupationMatch[] {
    return occupations.map(occ => ({
      id: occ.uri,
      uri: occ.uri,
      code: occ.code || '',
      title: occ.title,
      description: occ.description?.en?.literal || '',
      provider: 'esco' as TaxonomyProvider,
      matchedSkills: [matchedSkill],
      relevanceScore: occ.score || 0.5,
      requiredSkills: [],
      optionalSkills: [],
      metadata: {
        iscoGroup: occ.iscoGroup,
        lastModified: occ.modifiedDate
      }
    }));
  }

  /**
   * Get ESCO skill details
   */
  private async getESCOSkillDetails(skillUri: string): Promise<SkillMatch | null> {
    try {
      const response = await fetch(
        `${this.escoConfig.baseUrl}/resource/skill?uri=${encodeURIComponent(skillUri)}&language=${this.escoConfig.language}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          },
          signal: AbortSignal.timeout(this.escoConfig.timeout)
        }
      );

      if (!response.ok) return null;

      const data = await response.json();
      return this.transformESCOSkills([data])[0] || null;
    } catch (error) {
      logger.error('Failed to get ESCO skill details', { skillUri, error });
      return null;
    }
  }

  /**
   * Get O*NET skill details
   */
  private async getONETSkillDetails(skillId: string): Promise<SkillMatch | null> {
    try {
      const auth = Buffer.from(
        `${this.onetConfig.username}:${this.onetConfig.password}`
      ).toString('base64');

      // O*NET skills are tied to occupations, so we need to extract occupation code
      const parts = skillId.split('-');
      if (parts.length < 3) return null;

      const elementId = parts[parts.length - 1];
      
      // Search for skill element details
      const response = await fetch(
        `${this.onetConfig.baseUrl}/ws/online/abilities/${elementId}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Basic ${auth}`,
            'User-Agent': 'SkillsTaxonomyService/1.0'
          },
          signal: AbortSignal.timeout(this.onetConfig.timeout)
        }
      );

      if (!response.ok) {
        // Try skills endpoint
        const skillResponse = await fetch(
          `${this.onetConfig.baseUrl}/ws/online/skills/${elementId}`,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Authorization': `Basic ${auth}`,
              'User-Agent': 'SkillsTaxonomyService/1.0'
            }
          }
        );

        if (!skillResponse.ok) return null;
        
        const data = await skillResponse.json();
        return {
          id: elementId,
          uri: `${this.onetConfig.baseUrl}/ws/online/skills/${elementId}`,
          preferredLabel: data.name || data.title,
          alternativeLabels: [],
          description: data.description || '',
          type: 'skill',
          provider: 'onet' as TaxonomyProvider,
          relevanceScore: 1.0,
          broaderConcepts: [],
          narrowerConcepts: [],
          relatedConcepts: data.related ? [data.related.href] : [],
          metadata: {
            category: data.category
          }
        };
      }

      const data = await response.json();
      return {
        id: elementId,
        uri: `${this.onetConfig.baseUrl}/ws/online/abilities/${elementId}`,
        preferredLabel: data.name || data.title,
        alternativeLabels: [],
        description: data.description || '',
        type: 'ability',
        provider: 'onet' as TaxonomyProvider,
        relevanceScore: 1.0,
        broaderConcepts: [],
        narrowerConcepts: [],
        relatedConcepts: data.related ? [data.related.href] : [],
        metadata: {
          category: data.category
        }
      };
    } catch (error) {
      logger.error('Failed to get O*NET skill details', { skillId, error });
      return null;
    }
  }

  /**
   * Get related skills from ESCO
   */
  private async getESCORelatedSkills(
    skill: string,
    options: SkillTaxonomyOptions
  ): Promise<SkillMatch[]> {
    // First find the skill
    const skillMatches = await this.searchESCOSkills(skill, { ...options, limit: 1 });
    if (skillMatches.length === 0) return [];

    const skillUri = skillMatches[0].uri;
    
    // Get full skill details including relations
    const details = await this.getESCOSkillDetails(skillUri);
    if (!details) return [];

    const relatedSkills: SkillMatch[] = [];

    // Fetch broader concepts
    for (const broaderUri of details.broaderConcepts || []) {
      const broader = await this.getESCOSkillDetails(broaderUri);
      if (broader) relatedSkills.push(broader);
    }

    // Fetch narrower concepts
    for (const narrowerUri of details.narrowerConcepts || []) {
      const narrower = await this.getESCOSkillDetails(narrowerUri);
      if (narrower) relatedSkills.push(narrower);
    }

    return relatedSkills;
  }

  /**
   * Get related skills from O*NET
   */
  private async getONETRelatedSkills(
    skill: string,
    options: SkillTaxonomyOptions
  ): Promise<SkillMatch[]> {
    const breaker = circuitBreakerManager.getBreaker('onet_api');
    
    return await breaker.execute(async () => {
      const auth = Buffer.from(
        `${this.onetConfig.username}:${this.onetConfig.password}`
      ).toString('base64');

      // First find occupations that require this skill
      const searchResponse = await fetch(
        `${this.onetConfig.baseUrl}/ws/mnm/search?keyword=${encodeURIComponent(skill)}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Basic ${auth}`,
            'User-Agent': 'SkillsTaxonomyService/1.0'
          }
        }
      );

      if (!searchResponse.ok) return [];

      const searchData = await searchResponse.json();
      const relatedSkills: SkillMatch[] = [];
      const processedSkills = new Set<string>();

      // Get skills from related occupations
      for (const occupation of (searchData.occupation || []).slice(0, 3)) {
        try {
          const skillsResponse = await fetch(
            `${this.onetConfig.baseUrl}/ws/online/occupations/${occupation.code}/summary/skills`,
            {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'Authorization': `Basic ${auth}`,
                'User-Agent': 'SkillsTaxonomyService/1.0'
              }
            }
          );

          if (skillsResponse.ok) {
            const skillsData = await skillsResponse.json();
            
            for (const skillGroup of (skillsData.group || [])) {
              for (const relatedSkill of (skillGroup.element || [])) {
                if (!processedSkills.has(relatedSkill.id) && 
                    relatedSkill.name.toLowerCase() !== skill.toLowerCase()) {
                  processedSkills.add(relatedSkill.id);
                  
                  relatedSkills.push({
                    id: relatedSkill.id,
                    uri: relatedSkill.related?.href || '',
                    preferredLabel: relatedSkill.name,
                    alternativeLabels: [],
                    description: relatedSkill.description || '',
                    type: 'skill',
                    provider: 'onet' as TaxonomyProvider,
                    relevanceScore: relatedSkill.importance?.value ? 
                      relatedSkill.importance.value / 100 : 0.5,
                    broaderConcepts: [],
                    narrowerConcepts: [],
                    relatedConcepts: [],
                    metadata: {
                      level: relatedSkill.level?.value,
                      importance: relatedSkill.importance?.value,
                      category: skillGroup.title
                    }
                  });
                }
              }
            }
          }
        } catch (error) {
          logger.warn(`Failed to get related skills for occupation ${occupation.code}`, { error });
        }
      }

      return relatedSkills;
    });
  }

  /**
   * Deduplicate skills based on URI and label similarity
   */
  private deduplicateSkills(skills: SkillMatch[]): SkillMatch[] {
    const seen = new Map<string, SkillMatch>();
    
    for (const skill of skills) {
      const key = `${skill.provider}:${skill.preferredLabel.toLowerCase()}`;
      
      if (!seen.has(key) || skill.relevanceScore > seen.get(key)!.relevanceScore) {
        seen.set(key, skill);
      }
    }

    return Array.from(seen.values());
  }

  /**
   * Merge occupations from different providers
   */
  private mergeOccupations(occupations: OccupationMatch[]): OccupationMatch[] {
    // Group by similar titles
    const grouped = new Map<string, OccupationMatch[]>();
    
    for (const occ of occupations) {
      const key = occ.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(occ);
    }

    // Merge similar occupations
    const merged: OccupationMatch[] = [];
    
    for (const group of grouped.values()) {
      if (group.length === 1) {
        merged.push(group[0]);
      } else {
        // Merge occupations from different providers
        const primary = group.reduce((a, b) => 
          a.relevanceScore > b.relevanceScore ? a : b
        );
        
        // Combine matched skills from all providers
        const allMatchedSkills = new Set<string>();
        group.forEach(occ => occ.matchedSkills.forEach(s => allMatchedSkills.add(s)));
        
        merged.push({
          ...primary,
          matchedSkills: Array.from(allMatchedSkills),
          metadata: {
            ...primary.metadata,
            providers: group.map(g => g.provider)
          }
        });
      }
    }

    return merged.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Extract categories from skill matches
   */
  private extractCategories(matches: SkillMatch[]): string[] {
    const categories = new Set<string>();
    
    for (const match of matches) {
      if (match.type) categories.add(match.type);
      if (match.metadata?.skillType) categories.add(match.metadata.skillType);
      if (match.metadata?.category) categories.add(match.metadata.category);
    }
    
    return Array.from(categories);
  }

  /**
   * Extract broader concepts
   */
  private extractBroaderConcepts(matches: SkillMatch[]): string[] {
    const concepts = new Set<string>();
    
    for (const match of matches) {
      match.broaderConcepts?.forEach(c => concepts.add(c));
    }
    
    return Array.from(concepts);
  }

  /**
   * Extract narrower concepts
   */
  private extractNarrowerConcepts(matches: SkillMatch[]): string[] {
    const concepts = new Set<string>();
    
    for (const match of matches) {
      match.narrowerConcepts?.forEach(c => concepts.add(c));
    }
    
    return Array.from(concepts);
  }

  /**
   * Validate ESCO connection
   */
  private async validateESCOConnection(): Promise<void> {
    try {
      // Try a simple search first as it's more reliable than taxonomy endpoint
      const response = await fetch(
        `${this.escoConfig.baseUrl}/search?text=javascript&type=skill&limit=1&language=en&selectedVersion=${this.escoConfig.version}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Accept-Language': 'en',
            'User-Agent': 'SkillsTaxonomyService/1.0'
          },
          signal: AbortSignal.timeout(10000)
        }
      );

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        logger.warn(`ESCO API returned ${response.status}: ${errorText}`);
        
        // Don't throw error for ESCO validation failure - just log warning
        // ESCO is a free public API that may have availability issues
        logger.warn('ESCO API validation failed, but service will continue without ESCO features', {
          status: response.status,
          url: response.url
        });
        return;
      }

      const data = await response.json().catch(() => null);
      if (data && data._embedded) {
        logger.info('ESCO API connection validated successfully');
      } else {
        logger.warn('ESCO API returned unexpected response format, but connection appears working');
      }
    } catch (error) {
      // Log the error but don't throw - ESCO is optional
      logger.warn('ESCO API validation failed, continuing without ESCO features', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  }

  /**
   * Validate O*NET connection
   */
  private async validateONETConnection(): Promise<void> {
    try {
      if (!this.onetConfig.username || !this.onetConfig.password) {
        logger.warn('O*NET credentials not provided, O*NET features will be disabled');
        return;
      }

      const auth = Buffer.from(
        `${this.onetConfig.username}:${this.onetConfig.password}`
      ).toString('base64');

      const response = await fetch(
        `${this.onetConfig.baseUrl}/ws/`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Basic ${auth}`,
            'User-Agent': 'SkillsTaxonomyService/1.0'
          },
          signal: AbortSignal.timeout(10000)
        }
      );

      if (!response.ok) {
        logger.warn(`O*NET API validation failed with status ${response.status}, O*NET features will be disabled`);
        return;
      }

      logger.info('O*NET API connection validated successfully');
    } catch (error) {
      // Log the error but don't throw - O*NET is optional
      logger.warn('O*NET API validation failed, continuing without O*NET features', { 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

// Export singleton instance
export const skillsTaxonomyService = new SkillsTaxonomyService();

// Export types
export * from './types';