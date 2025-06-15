// src/services/KeywordPersistenceService.ts
import axios from 'axios';
import { AnalysisResponse, KeywordAnalysisData, Keyword, ATSScore } from '@/src/types';

interface FallbackAnalysisOptions {
  resumeText: string;
  jobTitle: string;
  jobDescription: string;
}

class KeywordPersistenceService {
  private static readonly STORAGE_PREFIX = 'keyword_analysis_';

  // Common keywords by category
  private static readonly TECH_KEYWORDS = [
    'python', 'java', 'javascript', 'typescript', 'react', 'node', 'aws', 'cloud',
    'docker', 'kubernetes', 'ai', 'machine', 'learning', 'data', 'analysis',
    'analytics', 'algorithm', 'database', 'sql', 'api', 'microservices'
  ];

  private static readonly SOFT_SKILL_KEYWORDS = [
    'communication', 'teamwork', 'leadership', 'problem-solving', 'critical',
    'thinking', 'collaboration', 'adaptability', 'creativity', 'time-management',
    'project-management', 'agile', 'scrum', 'mentoring', 'presentation'
  ];

  private static readonly BUSINESS_KEYWORDS = [
    'marketing', 'strategy', 'management', 'project', 'budget', 'planning',
    'research', 'development', 'sales', 'customer', 'stakeholder', 'roi',
    'kpi', 'metrics', 'analysis', 'growth', 'revenue', 'optimization'
  ];

  /**
   * Save keyword analysis to storage
   */
  static saveKeywordAnalysis(
    documentId: string,
    jobTitle: string,
    jobDescription: string,
    analysisData: AnalysisResponse
  ): boolean {
    if (!documentId || !analysisData) return false;

    try {
      const storageKey = `${this.STORAGE_PREFIX}${documentId}`;
      const dataToStore: KeywordAnalysisData = {
        job_title: jobTitle,
        job_description: jobDescription,
        matching_keywords: analysisData.matching_keywords || [],
        missing_keywords: analysisData.missing_keywords || [],
        ats_score: analysisData.ats_score || { score: 0, grade: 'C', match_rate: 0 },
        analyzed_at: new Date().toISOString()
      };

      localStorage.setItem(storageKey, JSON.stringify(dataToStore));
      console.log('Saved keyword analysis to localStorage');

      // Try saving to API asynchronously
      this.tryApiSave(documentId, dataToStore).catch(console.error);

      return true;
    } catch (error) {
      console.error('Failed to save keyword analysis:', error);
      return false;
    }
  }

  /**
   * Get keyword analysis from storage
   */
  static async getKeywordAnalysis(
    documentId: string,
    jobTitle: string,
    jobDescription: string
  ): Promise<KeywordAnalysisData | null> {
    if (!documentId) return null;

    // First try localStorage
    try {
      const storageKey = `${this.STORAGE_PREFIX}${documentId}`;
      const savedData = localStorage.getItem(storageKey);

      if (savedData) {
        const parsedData: KeywordAnalysisData = JSON.parse(savedData);

        // Verify data matches current job
        if (parsedData.job_title === jobTitle &&
            parsedData.job_description === jobDescription) {
          console.log('Found matching keyword analysis in localStorage');
          return parsedData;
        }
      }
    } catch (error) {
      console.error('Error retrieving from localStorage:', error);
    }

    // Then try API as backup
    try {
      const userId = localStorage.getItem('current_user_id');
      if (userId) {
        const response = await axios.get(`/api/resume/get/${documentId}`, {
          params: { user_id: userId }
        });

        if (response.data?.keyword_analysis) {
          const apiData = response.data.keyword_analysis;

          // Verify data matches current job
          if (apiData.job_title === jobTitle &&
              apiData.job_description === jobDescription) {
            console.log('Found matching keyword analysis in API');

            // Save to localStorage for next time
            this.saveKeywordAnalysis(documentId, jobTitle, jobDescription, {
              matching_keywords: apiData.matching_keywords,
              missing_keywords: apiData.missing_keywords,
              ats_score: apiData.ats_score
            });

            return apiData;
          }
        }
      }
    } catch (error) {
      console.error('Error retrieving from API:', error);
    }

    return null;
  }

  /**
   * Clear keyword analysis for a document
   */
  static clearKeywordAnalysis(documentId: string): void {
    const storageKey = `${this.STORAGE_PREFIX}${documentId}`;
    localStorage.removeItem(storageKey);
  }

  /**
   * Generate fallback keyword analysis when API is unavailable
   */
  static generateFallbackAnalysis({
    resumeText,
    jobTitle,
    jobDescription
  }: FallbackAnalysisOptions): AnalysisResponse {
    console.log('Generating fallback keyword analysis');

    // Extract words from texts
    const extractWords = (text: string): Set<string> => {
      return new Set(
        text.toLowerCase()
          .match(/\b[a-z]{3,}\b/g) || []
      );
    };

    const resumeWords = extractWords(resumeText);
    const jobWords = extractWords(jobDescription);
    const titleWords = extractWords(jobTitle);

    // Combine job-related words
    const jobRelatedWords = new Set([...jobWords, ...titleWords]);

    // Find matches and missing keywords
    const findKeywords = (
      keywords: string[],
      category: string
    ): { matching: Keyword[], missing: Keyword[] } => {
      const matching: Keyword[] = [];
      const missing: Keyword[] = [];

      keywords.forEach(keyword => {
        const isInResume = resumeWords.has(keyword);
        const isInJob = jobRelatedWords.has(keyword);

        if (isInJob) {
          const keywordObj: Keyword = {
            keyword: keyword.charAt(0).toUpperCase() + keyword.slice(1),
            importance: Math.random() > 0.3 ? 'high' : 'medium',
            category
          };

          if (isInResume) {
            matching.push(keywordObj);
          } else {
            missing.push({
              ...keywordObj,
              suggestion: `Consider adding "${keyword}" to your resume as it appears in the job description`
            });
          }
        }
      });

      return { matching, missing };
    };

    // Analyze each category
    const techAnalysis = findKeywords(this.TECH_KEYWORDS, 'technical');
    const softAnalysis = findKeywords(this.SOFT_SKILL_KEYWORDS, 'soft-skills');
    const businessAnalysis = findKeywords(this.BUSINESS_KEYWORDS, 'business');

    // Combine results
    const matchingKeywords = [
      ...techAnalysis.matching,
      ...softAnalysis.matching,
      ...businessAnalysis.matching
    ];

    const missingKeywords = [
      ...techAnalysis.missing,
      ...softAnalysis.missing,
      ...businessAnalysis.missing
    ];

    // Calculate ATS score
    const totalKeywords = matchingKeywords.length + missingKeywords.length;
    const matchRate = totalKeywords > 0 ? matchingKeywords.length / totalKeywords : 0;
    const score = Math.floor(matchRate * 100);

    // Determine grade
    let grade: ATSScore['grade'] = 'C';
    if (score >= 80) grade = 'A';
    else if (score >= 65) grade = 'B';
    else if (score >= 50) grade = 'C';
    else if (score >= 35) grade = 'D';
    else grade = 'F';

    return {
      matching_keywords: matchingKeywords.slice(0, 15), // Limit results
      missing_keywords: missingKeywords.slice(0, 20),
      ats_score: {
        score,
        grade,
        match_rate: matchRate
      }
    };
  }

  /**
   * Try saving keyword analysis to API (fire-and-forget)
   */
  private static async tryApiSave(
    documentId: string,
    data: KeywordAnalysisData
  ): Promise<void> {
    const userId = localStorage.getItem('current_user_id');
    if (!userId || !documentId) return;

    try {
      await axios.post('/api/analyze', {
        jobTitle: data.job_title,
        jobDescription: data.job_description,
        resumeText: 'from_cache',
        userId,
        documentId,
        cachedAnalysis: data
      });
      console.log('Saved keyword analysis to API');
    } catch (error) {
      console.error('Failed to save to API, but localStorage backup exists:', error);
    }
  }
}

export default KeywordPersistenceService;
