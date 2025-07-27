// lib/client/services/template-client.ts

import { 
  Template, 
  TemplateSearchParams,
  TemplateSearchResult,
  Industry,
  ExperienceLevel
} from '@/types/template.types';

const API_BASE_URL = '/api/templates';

export class TemplateClient {
  // Search templates
  static async searchTemplates(params: TemplateSearchParams): Promise<TemplateSearchResult> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params.type) searchParams.append('type', params.type);
      if (params.industry) searchParams.append('industry', params.industry);
      if (params.experienceLevel) searchParams.append('experienceLevel', params.experienceLevel);
      if (params.keywords?.length) searchParams.append('keywords', params.keywords.join(','));
      if (params.isPremium !== undefined) searchParams.append('isPremium', params.isPremium.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.offset) searchParams.append('offset', params.offset.toString());
      if (params.sortBy) searchParams.append('sortBy', params.sortBy);
      if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

      const response = await fetch(`${API_BASE_URL}/search?${searchParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to search templates: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching templates:', error);
      throw error;
    }
  }

  // Get a single template
  static async getTemplate(id: string, type: 'resume' | 'cover_letter'): Promise<Template | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}?type=${type}`);
      
      if (response.status === 404) {
        return null;
      }
      
      if (!response.ok) {
        throw new Error(`Failed to get template: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting template:', error);
      throw error;
    }
  }

  // Get templates by industry
  static async getTemplatesByIndustry(
    industry: Industry,
    type: 'resume' | 'cover_letter' = 'resume',
    limit: number = 10
  ): Promise<Template[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/by-industry/${industry}?type=${type}&limit=${limit}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to get templates by industry: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting templates by industry:', error);
      throw error;
    }
  }

  // Get popular templates
  static async getPopularTemplates(
    type: 'resume' | 'cover_letter' = 'resume',
    limit: number = 10
  ): Promise<Template[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/popular?type=${type}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get popular templates: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting popular templates:', error);
      throw error;
    }
  }

  // Apply template to resume (increment popularity)
  static async applyTemplate(
    templateId: string,
    type: 'resume' | 'cover_letter',
    resumeId: string
  ): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/${templateId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          resumeId
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to apply template: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error applying template:', error);
      throw error;
    }
  }

  // Rate a template
  static async rateTemplate(
    templateId: string,
    type: 'resume' | 'cover_letter',
    rating: number
  ): Promise<void> {
    try {
      if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      const response = await fetch(`${API_BASE_URL}/${templateId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          rating
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to rate template: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error rating template:', error);
      throw error;
    }
  }

  // Get filtered templates for samples page
  static async getSamplesForIndustry(
    industry: Industry,
    type: 'resume' | 'cover_letter' = 'resume'
  ): Promise<Template[]> {
    try {
      return await this.searchTemplates({
        type,
        industry,
        limit: 20,
        sortBy: 'popularity',
        sortOrder: 'desc'
      }).then(result => result.templates);
    } catch (error) {
      console.error('Error getting samples for industry:', error);
      throw error;
    }
  }

  // Convert template to sample format (for existing SampleCard component)
  static templateToSample(template: Template) {
    if (template.type !== 'resume') {
      throw new Error('Only resume templates can be converted to samples');
    }

    const resumeTemplate = template;
    
    // Generate HTML content similar to existing business samples
    const resumeContent = `
      <div class="resume-content-wrapper" style="padding: 6px; margin: 6px; font-family: Merriweather, serif; font-size: 4pt; background-color: hsl(var(--background)); border-radius: 4px;">
        <h2 style="font-size: 7pt; font-weight: bold; margin: 0px; margin-bottom: 4px; text-align: center; line-height: 1; color: white !important;">${resumeTemplate.content.name}</h2>
        <p style="font-size: 3pt; text-align: center; margin: 0px; margin-bottom: 3px; padding-bottom: 6px; opacity: 0.7; line-height: 1; color: white !important; font-weight: 300;">${resumeTemplate.content.location} | ${resumeTemplate.content.phone} | ${resumeTemplate.content.email}</p>
        <h3 style="font-size: 4.5pt; font-weight: 600; text-transform: uppercase; margin-bottom: 3px; border-bottom: 0.5px solid #666; line-height: 1.1; display: block; padding-bottom: 1px;">Summary</h3>
        <p style="font-size: 4pt; line-height: 1.2; margin-bottom: 0px; padding-bottom: 4px;">${resumeTemplate.content.summary}</p>
        <h3 style="font-size: 4.5pt; font-weight: 600; text-transform: uppercase; margin-top: 4px; margin-bottom: 3px; border-bottom: 0.5px solid #666; line-height: 1.1; display: block; padding-bottom: 1px;">Experience</h3>
        <div style="padding-bottom: 4px;">
          ${resumeTemplate.content.experience.map(exp => `
            <div style="margin-bottom: 3px;">
              <h4 style="font-size: 4pt; font-weight: 600; margin: 0; margin-bottom: 0.5px; line-height: 1.1;">${exp.jobTitle}</h4>
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 1px;">
                <p style="font-size: 3.5pt; font-weight: 400; margin: 0; line-height: 1.1; color: white !important;">${exp.companyName}</p>
                <span style="font-size: 3.5pt; font-weight: 400; line-height: 1.1;">${exp.startDate} - ${exp.endDate}, ${exp.location}</span>
              </div>
              <ul style="list-style: disc; margin-left: 6px; font-size: 3.5pt; line-height: 1.1; margin-bottom: 0; margin-top: 1px;">
                ${exp.responsibilities.map(resp => `<li>${resp}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    return {
      id: parseInt(template.id.slice(-6), 16) || Math.floor(Math.random() * 100000), // Convert to number for compatibility
      title: template.role,
      tag: template.metadata.isPremium ? 'PRO' : 'FREE',
      resumeContent
    };
  }
}