import { ProcessedResumeData, ResumeData } from '../types';

/**
 * Parse resume text and return RMS compliant data
 * @param resumeText The resume text to parse
 * @param userId User ID for tracking
 * @param saveToFirebase Whether to save results to Firebase
 * @returns Parsed resume data in RMS format
 */
export interface ParseResultResponse {
  success: boolean;
  data?: ProcessedResumeData;
  parseTime?: number;
  model?: string;
  timestamp?: string;
  error?: string;
}

export async function parseResumeText(
  resumeText: string,
  userId: string = 'anonymous',
  saveToFirebase: boolean = true
): Promise<ParseResultResponse> {
  console.log(`Parsing resume text using RMSParser (${resumeText.length} chars)`);

  try {
    const parser = new RMSParser();
    const startTime = Date.now();
    const result = await parser.parseResume(resumeText);
    const parseTime = Date.now() - startTime;

    if (!result.success) {
      throw new Error(result.errors?.[0]?.message || 'Failed to parse resume');
    }

    // If saveToFirebase is true, we would save to Firebase here
    // This is a placeholder for that functionality

    return {
      success: true,
      data: result.data,
      parseTime,
      model: result.metadata?.model || 'rms-parser',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in parseResumeText:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error parsing resume'
    };
  }
}

const fetch = global.fetch;

export interface ParseResult {
  success: boolean;
  data?: ProcessedResumeData;
  errors?: Array<{ field: string; message: string }>;
  attempts?: number;
  metadata?: Record<string, unknown>;
}

export interface ParserOptions {
  ollamaHost?: string;
  model?: string;
  maxAttempts?: number;
  timeout?: number;
}

// Constants
const INVOLVEMENT_KEYWORDS = [
  'coach', 'coaching', 'assistant coach', 'head coach', 'varsity', 'jv',
  'teaching assistant', 'ta', 'tutor', 'mentor', 'instructor',
  'volunteer', 'club', 'society', 'organization', 'chapter',
  'team', 'leadership', 'president', 'vice president', 'vp',
  'secretary', 'treasurer', 'member', 'participant',
  'ambassador', 'representative', 'coordinator', 'director',
  'community service', 'outreach', 'advocacy'
];

const PROJECT_KEYWORDS = [
  'developed', 'built', 'created', 'designed', 'architected',
  'implemented', 'project', 'application', 'app', 'software',
  'website', 'system', 'tool', 'platform', 'framework',
  'research', 'analysis', 'study', 'prototype', 'model',
  'algorithm', 'database', 'api', 'frontend', 'backend'
];

const SECTION_HEADERS = [
  'INVOLVEMENT', 'EDUCATION', 'SKILLS', 'PROJECTS', 'EXPERIENCE', 'CERTIFICATIONS'
];

const DEFAULT_OPTIONS: Required<ParserOptions> = {
  ollamaHost: process.env.OLLAMA_HOST || 'http://localhost:11434',
  model: process.env.OLLAMA_MODEL || 'llama3.1:8b-instruct-q2_K',
  maxAttempts: 3,
  timeout: 180000 // 3 minutes
};

// Helper Classes
class ResumePreprocessor {
  static process(resumeText: string): string {
    const normalized = this.normalizeHeaders(resumeText);
    return this.structureContent(normalized);
  }

  private static normalizeHeaders(text: string): string {
    return text
      .replace(/LEADERSHIP\s*&\s*EXTRACURRICULARS?/gi, 'INVOLVEMENT AND ACTIVITIES')
      .replace(/EXTRACURRICULAR ACTIVITIES?/gi, 'INVOLVEMENT')
      .replace(/VOLUNTEER(ING)? EXPERIENCE/gi, 'INVOLVEMENT')
      .replace(/CAMPUS INVOLVEMENT/gi, 'INVOLVEMENT')
      .replace(/ACTIVITIES/gi, 'INVOLVEMENT');
  }

  private static structureContent(resumeText: string): string {
    const lines = resumeText.split('\n');
    const structured: string[] = [];
    let currentBlock: string[] = [];
    let currentSection = '';

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (!trimmedLine) {
        this.processEmptyLine(structured, currentBlock, currentSection);
        currentBlock = [];
        continue;
      }

      if (this.isSectionHeader(trimmedLine)) {
        this.processSectionHeader(structured, currentBlock, currentSection, trimmedLine);
        currentSection = trimmedLine;
        currentBlock = [];
        continue;
      }

      if (this.isNewEntry(trimmedLine) && currentBlock.length > 0) {
        structured.push(this.formatBlock(currentBlock, currentSection));
        currentBlock = [trimmedLine];
      } else {
        currentBlock.push(trimmedLine);
      }
    }

    if (currentBlock.length > 0) {
      structured.push(this.formatBlock(currentBlock, currentSection));
    }

    return structured.join('\n');
  }

  private static processEmptyLine(structured: string[], currentBlock: string[], currentSection: string): void {
    if (currentBlock.length > 0) {
      structured.push(this.formatBlock(currentBlock, currentSection));
    }
    structured.push('');
  }

  private static processSectionHeader(structured: string[], currentBlock: string[], currentSection: string, line: string): void {
    if (currentBlock.length > 0) {
      structured.push(this.formatBlock(currentBlock, currentSection));
    }
    structured.push(`\n[SECTION: ${line}]`);
  }

  private static isSectionHeader(line: string): boolean {
    return /^[A-Z][A-Z\s&]+$/.test(line) &&
           line.length < 50 &&
           !line.match(/^[A-Z]{2,5}$/);
  }

  private static isNewEntry(line: string): boolean {
    const patterns = [
      /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b/i,
      /\bPresent\b/i,
      /^(Teaching Assistant|Coach|Intern|Volunteer|President|Manager)/i,
      /\b(University|College|School|Company|Inc\.|LLC|Corp)\b/i
    ];

    return patterns.some(pattern => pattern.test(line)) &&
           !line.startsWith('"') &&
           !line.startsWith('-');
  }

  private static formatBlock(block: string[], section: string): string {
    if (block.length === 0) return '';

    const formatted: string[] = [];
    let header = '';
    let bullets: string[] = [];

    for (const line of block) {
      if (this.isBulletPoint(line)) {
        bullets.push(line);
      } else if (bullets.length > 0) {
        formatted.push(`${header}\n[BULLETS]\n${bullets.join('\n')}\n[/BULLETS]`);
        header = line;
        bullets = [];
      } else {
        if (header) formatted.push(header);
        header = line;
      }
    }

    this.finalizeBullets(formatted, header, bullets);
    return formatted.join('\n');
  }

  private static isBulletPoint(line: string): boolean {
    return line.startsWith('"') || line.startsWith('-') || line.startsWith('*');
  }

  private static finalizeBullets(formatted: string[], header: string, bullets: string[]): void {
    if (header && bullets.length === 0) {
      formatted.push(header);
    } else if (header && bullets.length > 0) {
      formatted.push(`${header}\n[BULLETS]\n${bullets.join('\n')}\n[/BULLETS]`);
    } else if (bullets.length > 0) {
      formatted.push(`[BULLETS]\n${bullets.join('\n')}\n[/BULLETS]`);
    }
  }
}

class DataClassifier {
  static fixClassifications(data: any): any {
    const corrected = { ...data };

    if (!Array.isArray(corrected.projects)) corrected.projects = [];
    if (!Array.isArray(corrected.involvement)) corrected.involvement = [];
    if (!Array.isArray(corrected.experiences)) corrected.experiences = [];

    // Move misclassified items from projects to involvement
    const { projectsToKeep, projectsToMove } = this.classifyProjects(corrected.projects);
    corrected.projects = projectsToKeep;
    corrected.involvement = [...corrected.involvement, ...projectsToMove];

    // Move misclassified items from experiences to involvement
    const { experiencesToKeep, experiencesToMove } = this.classifyExperiences(corrected.experiences);
    corrected.experiences = experiencesToKeep;
    corrected.involvement = [...corrected.involvement, ...experiencesToMove];

    return corrected;
  }

  private static classifyProjects(projects: any[]): { projectsToKeep: any[], projectsToMove: any[] } {
    const projectsToKeep: any[] = [];
    const projectsToMove: any[] = [];

    projects.forEach((proj: any) => {
      if (!proj || typeof proj !== 'object') return;

      const text = `${proj.title || ''} ${proj.description || ''}`.toLowerCase();
      const hasInvolvementKeywords = INVOLVEMENT_KEYWORDS.some(k => text.includes(k));
      const hasProjectKeywords = PROJECT_KEYWORDS.some(k => text.includes(k));

      if (hasInvolvementKeywords && !hasProjectKeywords) {
        projectsToMove.push(this.convertProjectToInvolvement(proj));
      } else {
        projectsToKeep.push(proj);
      }
    });

    return { projectsToKeep, projectsToMove };
  }

  private static classifyExperiences(experiences: any[]): { experiencesToKeep: any[], experiencesToMove: any[] } {
    const experiencesToKeep: any[] = [];
    const experiencesToMove: any[] = [];

    experiences.forEach((exp: any) => {
      if (!exp || typeof exp !== 'object') return;

      const text = `${exp.role || ''} ${exp.company || ''} ${exp.description || ''}`.toLowerCase();

      // Check for coaching keywords
      const coachingKeywords = ['coach', 'coaching', 'assistant coach', 'head coach', 'jv coach'];
      const teachingKeywords = ['teaching', 'tutor', 'tutoring', 'substitute teacher', 'instructor'];
      const schoolKeywords = ['elementary', 'high school', 'middle school', 'school district'];

      const hasCoaching = coachingKeywords.some(k => text.includes(k));
      const hasTeaching = teachingKeywords.some(k => text.includes(k));
      const hasSchool = schoolKeywords.some(k => text.includes(k));

      // If it's coaching, teaching, or at a school context, it's likely involvement
      if ((hasCoaching || hasTeaching) && hasSchool) {
        experiencesToMove.push(this.convertExperienceToInvolvement(exp));
      } else {
        experiencesToKeep.push(exp);
      }
    });

    return { experiencesToKeep, experiencesToMove };
  }

  private static convertProjectToInvolvement(proj: any): any {
    return {
      organization: proj.organization || this.extractOrganization(proj.title),
      role: this.extractRole(proj.title),
      location: 'n/a',
      dateBegin: 'n/a',
      dateEnd: 'n/a',
      description: proj.description || 'n/a'
    };
  }

  private static convertExperienceToInvolvement(exp: any): any {
    return {
      organization: exp.company || 'n/a',
      role: exp.role || 'n/a',
      location: exp.location || 'n/a',
      dateBegin: exp.dateBegin || 'n/a',
      dateEnd: exp.dateEnd || 'n/a',
      description: exp.description || 'n/a'
    };
  }

  private static extractOrganization(title: string): string {
    const parts = title.split(/[-]/);
    return parts.length > 1 ? parts[1].trim() : title;
  }

  private static extractRole(title: string): string {
    const parts = title.split(/[-]/);
    if (parts.length > 1) return parts[0].trim();

    const patterns = [
      /^(.+?)\s+at\s+/i,
      /^(.+?)\s+for\s+/i,
      /^(.+?),\s+/i
    ];

    for (const pattern of patterns) {
      const match = title.match(pattern);
      if (match) return match[1].trim();
    }

    return title;
  }
}

class DescriptionFixer {
  static fixMissingDescriptions(data: any, originalResume: string): any {
    const corrected = { ...data };

    if (Array.isArray(corrected.involvement)) {
      corrected.involvement.forEach((inv: any) => {
        this.fixInvolvementDescription(inv, originalResume);
      });
    }

    if (Array.isArray(corrected.projects)) {
      corrected.projects.forEach((proj: any) => {
        this.fixProjectDescription(proj, originalResume);
      });
    }

    return corrected;
  }

  private static fixInvolvementDescription(inv: any, originalResume: string): void {
    const currentDesc = String(inv.description || '').trim();

    if (!currentDesc || currentDesc === 'n/a' || currentDesc === '') {
      const orgName = String(inv.organization || '');
      const roleName = String(inv.role || '');

      const patterns = [
        new RegExp(`${this.escapeRegex(orgName)}[^\\n]*\\n((?:["\\-\\*][^\\n]+\\n?)+)`, 'is'),
        new RegExp(`${this.escapeRegex(roleName)}[^\\n]*\\n((?:["\\-\\*][^\\n]+\\n?)+)`, 'is'),
        new RegExp(`${this.escapeRegex(roleName)}.*?${this.escapeRegex(orgName)}[^\\n]*\\n((?:["\\-\\*][^\\n]+\\n?)+)`, 'is')
      ];

      for (const pattern of patterns) {
        const match = originalResume.match(pattern);
        if (match && match[1]) {
          inv.description = match[1].trim();
          break;
        }
      }
    }
  }

  private static fixProjectDescription(proj: any, originalResume: string): void {
    const currentDesc = String(proj.description || '').trim();
    if (!currentDesc || currentDesc === 'n/a') {
      const title = String(proj.title || '');
      const pattern = new RegExp(`${this.escapeRegex(title)}[^\\n]*\\n((?:["\\-\\*][^\\n]+\\n?)+)`, 'is');
      const match = originalResume.match(pattern);
      if (match && match[1]) {
        proj.description = match[1].trim();
      }
    }
  }

  private static escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

class DescriptionCleaner {
  static cleanDescriptions(data: any): any {
    const corrected = { ...data };

    ['experiences', 'projects', 'involvement'].forEach(section => {
      if (Array.isArray(corrected[section])) {
        corrected[section].forEach((item: any) => {
          if (item.description) {
            item.description = this.cleanDescription(item.description);
          }
        });
      }
    });

    return corrected;
  }

  private static cleanDescription(description: string): string {
    let cleaned = String(description);

    // Remove section headers
    SECTION_HEADERS.forEach(header => {
      const regex = new RegExp(`\\s*${header}\\s*`, 'i');
      cleaned = cleaned.replace(regex, '');
    });

    // Remove [BULLETS] tags
    cleaned = cleaned.replace(/\[BULLETS\]|\[\/BULLETS\]/g, '');

    // Clean up formatting
    return cleaned
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\s+$/gm, '')
      .trim();
  }
}

class DateFormatter {
  static fixDates(data: any): any {
    const corrected = { ...data };

    // Fix education dates
    if (Array.isArray(corrected.education)) {
      corrected.education.forEach((edu: any) => {
        if (!edu.date || edu.date === 'n/a') {
          const yearMatch = (edu.qualification || '').match(/\b(19|20)\d{2}\b/);
          if (yearMatch) {
            edu.date = yearMatch[0];
          }
        }
      });
    }

    // Fix experience dates
    if (Array.isArray(corrected.experiences)) {
      corrected.experiences = corrected.experiences.map((exp: any) => {
        return this.fixExperienceDates(exp);
      });
    }

    // Fix involvement dates
    if (Array.isArray(corrected.involvement)) {
      corrected.involvement = corrected.involvement.map((inv: any) => {
        return this.fixInvolvementDates(inv);
      });
    }

    return corrected;
  }

  private static fixExperienceDates(exp: any): any {
    // Try to extract dates from company, role, or description fields
    const searchText = `${exp.company || ''} ${exp.role || ''} ${exp.description || ''}`;

    if ((!exp.dateBegin || exp.dateBegin === 'n/a') || (!exp.dateEnd || exp.dateEnd === 'n/a')) {
      const dateRange = this.extractDateRange(searchText);
      if (dateRange) {
        if (!exp.dateBegin || exp.dateBegin === 'n/a') exp.dateBegin = dateRange.start;
        if (!exp.dateEnd || exp.dateEnd === 'n/a') exp.dateEnd = dateRange.end;
        exp.isCurrent = dateRange.end.toLowerCase() === 'present';
      }
    }

    return exp;
  }

  private static fixInvolvementDates(inv: any): any {
    const searchText = `${inv.organization || ''} ${inv.role || ''} ${inv.description || ''}`;

    if ((!inv.dateBegin || inv.dateBegin === 'n/a') || (!inv.dateEnd || inv.dateEnd === 'n/a')) {
      const dateRange = this.extractDateRange(searchText);
      if (dateRange) {
        if (!inv.dateBegin || inv.dateBegin === 'n/a') inv.dateBegin = dateRange.start;
        if (!inv.dateEnd || inv.dateEnd === 'n/a') inv.dateEnd = dateRange.end;
      }
    }

    return inv;
  }

  private static extractDateRange(text: string): { start: string, end: string } | null {
    // Common date range patterns
    const patterns = [
      // "June 2022 - August 2024" or "June 2022 - Present"
      /(\w+\s+\d{4})\s*[-]\s*(\w+\s+\d{4}|Present)/i,
      // "06/2022 - 08/2024"
      /(\d{1,2}\/\d{4})\s*[-]\s*(\d{1,2}\/\d{4}|Present)/i,
      // "2022 - 2024"
      /(\d{4})\s*[-]\s*(\d{4}|Present)/i,
      // "Jan 2022 - Dec 2024"
      /(\w{3}\s+\d{4})\s*[-]\s*(\w{3}\s+\d{4}|Present)/i,
      // Single date patterns
      /(\w+\s+\d{4})/i,
      /(\d{1,2}\/\d{4})/i,
      /(\d{4})/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        if (match[2]) {
          // Date range found
          return { start: match[1], end: match[2] };
        } else {
          // Single date found
          return { start: match[1], end: match[1] };
        }
      }
    }

    return null;
  }

  static getDateFormat(dateStr: string | undefined): string {
    if (!dateStr || dateStr === "n/a") return "n/a";
    if (dateStr === "Present") return "Present";

    if (dateStr.match(/^\d{4}$/)) return "YYYY";
    if (dateStr.match(/^\w+\s+\d{4}$/)) return "MMMM YYYY";
    if (dateStr.match(/^\w{3}\s+\d{4}$/)) return "MMM YYYY";
    if (dateStr.match(/^\d{1,2}\/\d{4}$/)) return "MM/YYYY";

    return "MMMM YYYY";
  }

  static getTimestamp(dateStr: string | undefined): string {
    if (!dateStr || dateStr === "n/a" || dateStr === "Present") return "n/a";

    try {
      let date: Date | null = null;

      if (dateStr.match(/^\d{4}$/)) {
        date = new Date(parseInt(dateStr), 0, 1);
      } else if (dateStr.match(/^(\w+)\s+(\d{4})$/)) {
        const [, month, year] = dateStr.match(/^(\w+)\s+(\d{4})$/)!;
        const monthIndex = this.getMonthIndex(month);
        if (monthIndex !== -1) {
          date = new Date(parseInt(year), monthIndex, 1);
        }
      }

      return date ? date.getTime().toString() : "n/a";
    } catch {
      return "n/a";
    }
  }

  private static getMonthIndex(monthName: string): number {
    const months = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ];
    const shortMonths = [
      'jan', 'feb', 'mar', 'apr', 'may', 'jun',
      'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
    ];

    const lower = monthName.toLowerCase();
    let index = months.indexOf(lower);
    if (index === -1) {
      index = shortMonths.indexOf(lower);
    }
    return index;
  }
}

class OllamaClient {
  constructor(private host: string, private model: string, private timeout: number) {}

  async generate(prompt: string): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.host}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: false,
          format: "json",
          options: {
            temperature: 0.1,
            top_p: 0.9,
            num_predict: 16384
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.text();
        if (error.includes('model') && error.includes('not found')) {
          throw new Error(`Model '${this.model}' not found. Run: ollama pull ${this.model}`);
        }
        throw new Error(`Ollama API error: ${response.status} - ${error}`);
      }

      // Properly type the response data
      interface OllamaResponse {
        response: string;
        model: string;
        created_at: string;
        done: boolean;
      }

      const data = await response.json() as OllamaResponse;
      return data.response;

    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new Error('Request timeout - Ollama took too long to respond');
      }

      if (error.message.includes('fetch failed')) {
        throw new Error('Cannot connect to Ollama. Make sure it\'s running: ollama serve');
      }

      throw error;
    }
  }
}

class JSONExtractor {
  static extract(text: string): any {
    let jsonStr = text.trim();

    // Remove markdown code blocks
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1];
    }

    // Find JSON object
    const jsonMatch = jsonStr.match(/(\{[\s\S]*)/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    // Fix incomplete JSON
    jsonStr = this.fixIncompleteJSON(jsonStr);

    try {
      jsonStr = this.cleanJSONString(jsonStr);
      const parsed = JSON.parse(jsonStr);

      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Parsed JSON is not an object');
      }

      return parsed;
    } catch (error: any) {
      console.error('Failed to parse JSON:', error.message);
      console.error('JSON string preview:', jsonStr.substring(0, 500) + '...');

      // Try alternative parsing approaches
      try {
        return this.attemptAlternativeParsing(text);
      } catch (altError) {
        throw new Error(`Failed to extract valid JSON: ${error.message}`);
      }
    }
  }

  private static fixIncompleteJSON(jsonStr: string): string {
    const openBraces = (jsonStr.match(/\{/g) || []).length;
    const closeBraces = (jsonStr.match(/\}/g) || []).length;
    if (openBraces > closeBraces) {
      jsonStr += '}'.repeat(openBraces - closeBraces);
    }
    return jsonStr;
  }

  private static cleanJSONString(jsonStr: string): string {
    // Clean common JSON formatting issues without breaking newlines
    let cleaned = jsonStr
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']')
      .replace(/\}\s*\{/g, '},{')
      .trim();

    // Only escape newlines that are inside string values, not structural newlines
    cleaned = this.escapeNewlinesInStringValues(cleaned);

    return cleaned;
  }

  private static escapeNewlinesInStringValues(jsonStr: string): string {
    // This regex finds string values and replaces unescaped newlines within them
    return jsonStr.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, (match, content) => {
      // Only escape newlines within the string content, preserve the quotes
      const escapedContent = content.replace(/\n/g, '\\n').replace(/\r/g, '\\r');
      return `"${escapedContent}"`;
    });
  }

  private static attemptAlternativeParsing(text: string): any {
    // Try to extract JSON with different approaches
    const approaches = [
      // Try to find the most complete JSON object
      /\{[\s\S]*\}/,
      // Try to find JSON starting from first {
      /\{[^}]*(?:\{[^}]*\}[^}]*)*\}/,
      // Look for JSON in response field
      /"response":\s*(\{[\s\S]*?\})(?:\s*[,}]|$)/
    ];

    for (const regex of approaches) {
      const match = text.match(regex);
      if (match) {
        try {
          let jsonStr = match[1] || match[0];
          jsonStr = this.fixIncompleteJSON(jsonStr);
          jsonStr = this.cleanJSONString(jsonStr);
          const parsed = JSON.parse(jsonStr);

          if (parsed && typeof parsed === 'object') {
            return parsed;
          }
        } catch (e) {
          // Continue to next approach
        }
      }
    }

    throw new Error('All alternative parsing approaches failed');
  }
}

// Main Parser Class
export class RMSParser {
  private options: Required<ParserOptions>;
  private ollamaClient: OllamaClient;

  constructor(options?: ParserOptions) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.ollamaClient = new OllamaClient(
      this.options.ollamaHost,
      this.options.model,
      this.options.timeout
    );
  }

  async parseResume(resumeText: string): Promise<ParseResult> {
    console.log(`Starting RMS parsing with model: ${this.options.model}`);

    const processedResume = ResumePreprocessor.process(resumeText);
    let lastError: Error | null = null;
    let attempts = 0;

    while (attempts < this.options.maxAttempts) {
      attempts++;
      console.log(`Parse attempt ${attempts}/${this.options.maxAttempts}`);

      try {
        const result = await this.attemptParse(processedResume, resumeText, attempts);
        return result;
      } catch (error: any) {
        console.error(`Parse attempt ${attempts} failed:`, error.message);
        lastError = error;

        if (attempts === this.options.maxAttempts) {
          return this.createErrorResult(error, attempts);
        }

        if (attempts < this.options.maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    return this.createErrorResult(lastError, attempts);
  }

  private async attemptParse(processedResume: string, originalResume: string, attempts: number): Promise<ParseResult> {
    const prompt = this.generatePrompt(processedResume);
    const response = await this.ollamaClient.generate(prompt);
    const jsonData = JSONExtractor.extract(response);
    const correctedData = this.postProcessData(jsonData, originalResume);
    const rmsData = this.convertToIndexedFormat(correctedData);

    return {
      success: true,
      data: rmsData,
      attempts,
      metadata: {
        model: this.options.model,
        parseTime: new Date().toISOString()
      }
    };
  }

  private createErrorResult(error: Error | null, attempts: number): ParseResult {
    return {
      success: false,
      errors: [{
        field: 'general',
        message: error?.message || 'Failed to parse resume after all attempts'
      }],
      attempts
    };
  }

  private generatePrompt(resumeText: string): string {
    return `Extract ALL information from this resume and return a JSON object. Follow these rules EXACTLY:

CLASSIFICATION RULES:

EXPERIENCES (professional work history):
- Full-time, part-time, or internship positions at companies
- Paid professional roles with clear job titles
- Corporate, business, or organizational employment
- EXCLUDE: coaching, teaching, tutoring, volunteer work

INVOLVEMENT (community/leadership activities):
- Any teaching, tutoring, or mentoring roles (including substitute teaching)
- Sports coaching at any level (high school, elementary, etc.)
- Club or organization participation and leadership
- Volunteer work or community service
- Academic tutoring or teaching assistance
- Look for keywords: coach, teaching, mentor, volunteer, club, team, leadership, tutor

PROJECTS (technical work with deliverables):
- Software, apps, or websites you built
- Research with tangible outputs
- Technical implementations
- Look for keywords: developed, built, created, implemented, designed (in technical context)

PARSING RULES:
1. ALWAYS extract job titles/roles - never put "n/a" if a role is mentioned
2. ALWAYS extract dates - look for patterns like "June 2023", "2022-2024", "Present"
3. When you see [BULLETS] tags, include ALL bullet points in the description
4. For ALL descriptions with multiple points, separate them with • character
5. Extract company names, institutions, and organizations accurately
6. Look for education information (degrees, schools, graduation dates)
7. Extract skills sections with categories and keywords

REQUIRED EXTRACTION PATTERNS:
- Job Title at Company Name | Location | Dates
- Degree in Major from University | Location | Graduation Date
- Skills: Category - keyword1, keyword2, keyword3

JSON FORMAT:
{
  "contact": {
    "fullName": "string",
    "givenNames": "string", 
    "lastName": "string",
    "email": "string",
    "phone": "string",
    "city": "string",
    "state": "string", 
    "country": "string or USA if not specified",
    "linkedin": "string or n/a",
    "github": "string or n/a",
    "website": "string or n/a"
  },
  "summary": "string or n/a",
  "experiences": [
    {
      "company": "string",
      "role": "REQUIRED - extract job title",
      "location": "string",
      "dateBegin": "REQUIRED - start date", 
      "dateEnd": "REQUIRED - end date or Present",
      "isCurrent": boolean,
      "description": "string with ALL bullet points separated by • character"
    }
  ],
  "education": [
    {
      "institution": "REQUIRED - school name",
      "qualification": "REQUIRED - degree and major",
      "location": "string",
      "date": "REQUIRED - graduation date",
      "isGraduate": boolean,
      "score": "GPA if mentioned or n/a",
      "scoreType": "GPA or n/a", 
      "minor": "string or n/a",
      "description": "relevant coursework or achievements with bullet points separated by • character or n/a"
    }
  ],
  "skills": [
    {
      "category": "REQUIRED - skill category name",
      "keywords": "REQUIRED - comma-separated skills list"
    }
  ],
  "projects": [
    {
      "title": "REQUIRED - project name",
      "organization": "string or n/a",
      "description": "REQUIRED - project details with ALL bullet points separated by • character"
    }
  ],
  "involvement": [
    {
      "organization": "REQUIRED - organization name",
      "role": "REQUIRED - position/role title", 
      "location": "string or n/a",
      "dateBegin": "start date or n/a",
      "dateEnd": "end date or n/a", 
      "description": "REQUIRED - activities with ALL bullet points separated by • character"
    }
  ],
  "certifications": []
}

Resume to parse:
${resumeText}

CRITICAL REMINDERS:
- Coaching roles (JV Coach, Assistant Coach) are INVOLVEMENT
- Teaching/tutoring roles are INVOLVEMENT  
- Corporate internships/jobs are EXPERIENCES
- NEVER put "n/a" for roles, companies, or organizations if they exist in the text
- ALWAYS extract dates when visible
- ALWAYS extract education information
- ALWAYS extract skills if present
- ALWAYS format descriptions with bullet points: separate each point with • character
- Example: "Developed web app • Managed team of 5 • Increased sales by 20%"
Return ONLY valid JSON.`;
  }

  private postProcessData(data: any, originalResume: string): any {
    let corrected = JSON.parse(JSON.stringify(data));

    corrected = DataClassifier.fixClassifications(corrected);
    corrected = DescriptionFixer.fixMissingDescriptions(corrected, originalResume);
    corrected = DescriptionCleaner.cleanDescriptions(corrected);
    corrected = DateFormatter.fixDates(corrected);

    return corrected;
  }

  private convertToIndexedFormat(data: any): any {
    const result: any = {
      "Producer": "rms_v2.0.1",
      "rms_schema_detail": "https://github.com/rezi-io/resume-standard"
    };

    this.addContactInfo(result, data.contact);
    this.addSummary(result, data.summary);
    this.addExperiences(result, data.experiences);
    this.addEducation(result, data.education);
    this.addSkills(result, data.skills);
    this.addProjects(result, data.projects);
    this.addInvolvement(result, data.involvement);
    this.addCertifications(result, data.certifications);

    return result;
  }

  private addContactInfo(result: any, contact: any): void {
    const contactInfo = contact && typeof contact === 'object' ? contact : {};
    result["rms_contact_fullName"] = String(contactInfo.fullName || 'n/a');
    result["rms_contact_givenNames"] = String(contactInfo.givenNames || contactInfo.fullName?.split(' ')[0] || 'n/a');
    result["rms_contact_lastName"] = String(contactInfo.lastName || contactInfo.fullName?.split(' ').slice(-1)[0] || 'n/a');
    result["rms_contact_email"] = String(contactInfo.email || 'n/a');
    result["rms_contact_phone"] = String(contactInfo.phone || 'n/a');
    result["rms_contact_city"] = String(contactInfo.city || 'n/a');
    result["rms_contact_state"] = String(contactInfo.state || 'n/a');
    result["rms_contact_country"] = String(contactInfo.country || 'USA');
    result["rms_contact_linkedin"] = String(contactInfo.linkedin || 'n/a');
    result["rms_contact_github"] = String(contactInfo.github || 'n/a');
    result["rms_contact_website"] = String(contactInfo.website || 'n/a');
  }

  private addSummary(result: any, summary: any): void {
    result["rms_summary"] = String(summary || 'n/a');
  }

  private addExperiences(result: any, experiences: any[]): void {
    const validExperiences = Array.isArray(experiences) ? experiences : [];
    let validCount = 0;

    validExperiences.forEach((exp: any) => {
      if (!exp || typeof exp !== 'object') return;

      const prefix = `rms_experience_${validCount}`;
      result[`${prefix}_company`] = String(exp.company || 'n/a');
      result[`${prefix}_role`] = String(exp.role || 'n/a');
      result[`${prefix}_location`] = String(exp.location || 'n/a');
      result[`${prefix}_dateBegin`] = String(exp.dateBegin || 'n/a');
      result[`${prefix}_dateBeginFormat`] = DateFormatter.getDateFormat(exp.dateBegin);
      result[`${prefix}_dateBeginTS`] = DateFormatter.getTimestamp(exp.dateBegin);
      result[`${prefix}_dateEnd`] = exp.dateEnd === "Present" ? "Present" : String(exp.dateEnd || 'n/a');
      result[`${prefix}_dateEndFormat`] = exp.dateEnd === "Present" ? "Present" : DateFormatter.getDateFormat(exp.dateEnd);
      result[`${prefix}_dateEndTS`] = exp.dateEnd === "Present" ? "n/a" : DateFormatter.getTimestamp(exp.dateEnd);
      result[`${prefix}_isCurrent`] = (exp.isCurrent === true || exp.dateEnd === "Present").toString();
      result[`${prefix}_description`] = this.escapeHtml(exp.description || "n/a");
      validCount++;
    });

    result["rms_experience_count"] = validCount.toString();
  }

  private addEducation(result: any, education: any[]): void {
    const validEducation = Array.isArray(education) ? education : [];
    let validCount = 0;

    validEducation.forEach((edu: any) => {
      if (!edu || typeof edu !== 'object') return;

      const prefix = `rms_education_${validCount}`;
      result[`${prefix}_institution`] = String(edu.institution || 'n/a');
      result[`${prefix}_qualification`] = String(edu.qualification || 'n/a');
      result[`${prefix}_location`] = String(edu.location || 'n/a');
      result[`${prefix}_date`] = String(edu.date || 'n/a');
      result[`${prefix}_dateFormat`] = DateFormatter.getDateFormat(edu.date);
      result[`${prefix}_dateTS`] = DateFormatter.getTimestamp(edu.date);
      result[`${prefix}_isGraduate`] = (edu.isGraduate !== false).toString();
      result[`${prefix}_score`] = String(edu.score || 'n/a');
      result[`${prefix}_scoreType`] = String(edu.scoreType || 'n/a');
      result[`${prefix}_minor`] = String(edu.minor || 'n/a');
      result[`${prefix}_description`] = String(edu.description || 'n/a');
      validCount++;
    });

    result["rms_education_count"] = validCount.toString();
  }

  private addSkills(result: any, skills: any[]): void {
    const validSkills = Array.isArray(skills) ? skills : [];
    let validCount = 0;

    validSkills.forEach((skill: any) => {
      if (!skill || typeof skill !== 'object') return;

      const prefix = `rms_skill_${validCount}`;
      result[`${prefix}_category`] = String(skill.category || 'n/a');
      result[`${prefix}_keywords`] = String(skill.keywords || 'n/a');
      validCount++;
    });

    result["rms_skill_count"] = validCount.toString();
  }

  private addProjects(result: any, projects: any[]): void {
    const validProjects = Array.isArray(projects) ? projects : [];
    let validCount = 0;

    validProjects.forEach((proj: any) => {
      if (!proj || typeof proj !== 'object') return;

      const prefix = `rms_project_${validCount}`;
      result[`${prefix}_title`] = String(proj.title || 'n/a');
      result[`${prefix}_organization`] = String(proj.organization || 'n/a');
      result[`${prefix}_description`] = this.escapeHtml(proj.description || "n/a");
      validCount++;
    });

    result["rms_project_count"] = validCount.toString();
  }

  private addInvolvement(result: any, involvement: any[]): void {
    const validInvolvement = Array.isArray(involvement) ? involvement : [];
    let validCount = 0;

    validInvolvement.forEach((inv: any) => {
      if (!inv || typeof inv !== 'object') return;

      const prefix = `rms_involvement_${validCount}`;
      result[`${prefix}_organization`] = String(inv.organization || 'n/a');
      result[`${prefix}_role`] = String(inv.role || 'n/a');
      result[`${prefix}_location`] = String(inv.location || 'n/a');
      result[`${prefix}_dateBegin`] = String(inv.dateBegin || 'n/a');
      result[`${prefix}_dateBeginFormat`] = DateFormatter.getDateFormat(inv.dateBegin);
      result[`${prefix}_dateBeginTS`] = DateFormatter.getTimestamp(inv.dateBegin);
      result[`${prefix}_dateEnd`] = String(inv.dateEnd || 'n/a');
      result[`${prefix}_dateEndFormat`] = DateFormatter.getDateFormat(inv.dateEnd);
      result[`${prefix}_dateEndTS`] = DateFormatter.getTimestamp(inv.dateEnd);
      result[`${prefix}_description`] = this.escapeHtml(inv.description || "n/a");
      validCount++;
    });

    result["rms_involvement_count"] = validCount.toString();
  }

  private addCertifications(result: any, certifications: any[]): void {
    const validCertifications = Array.isArray(certifications) ? certifications : [];
    let validCount = 0;

    validCertifications.forEach((cert: any) => {
      if (!cert || typeof cert !== 'object') return;

      const prefix = `rms_certification_${validCount}`;
      result[`${prefix}_name`] = String(cert.name || 'n/a');
      result[`${prefix}_issuer`] = String(cert.issuer || 'n/a');
      result[`${prefix}_date`] = String(cert.date || 'n/a');
      result[`${prefix}_dateFormat`] = DateFormatter.getDateFormat(cert.date);
      result[`${prefix}_dateTS`] = DateFormatter.getTimestamp(cert.date);
      validCount++;
    });

    result["rms_certification_count"] = validCount.toString();
  }

  private escapeHtml(text: string | any): string {
    const str = String(text || '');
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /**
   * Validate and fix RMS data
   * This method validates and suggests improvements for RMS data
   */
  async validateAndFix(data: any): Promise<{
    isValid: boolean;
    suggestions: string[];
    fixedData?: any;
  }> {
    try {
      // Validate required fields
      const suggestions: string[] = [];
      let isValid = true;

      // Check for required fields
      const requiredFields = [
        'Producer',
        'rms_schema_detail',
        'rms_contact_fullName',
        'rms_contact_email'
      ];

      for (const field of requiredFields) {
        if (!data[field]) {
          suggestions.push(`Missing required field: ${field}`);
          isValid = false;
        }
      }

      // Check section counts match item counts
      const sections = [
        'experience', 'education', 'skill', 'project',
        'certification', 'involvement'
      ];

      for (const section of sections) {
        const countKey = `rms_${section}_count`;
        const count = parseInt(data[countKey] || '0');

        let actualCount = 0;
        for (let i = 0; i < 20; i++) {
          const hasAny = Object.keys(data).some(key =>
            key.startsWith(`rms_${section}_${i}_`)
          );
          if (hasAny) actualCount++;
        }

        if (count !== actualCount) {
          suggestions.push(
            `Section count mismatch: ${countKey}=${count} but found ${actualCount} items`
          );
          // Fix the count
          data[countKey] = actualCount;
        }
      }

      return {
        isValid,
        suggestions,
        fixedData: isValid ? data : undefined
      };
    } catch (error: any) {
      console.error('Validation error:', error);
      return {
        isValid: false,
        suggestions: ['Validation failed with error: ' + (error.message || 'Unknown error')]
      };
    }
  }
}