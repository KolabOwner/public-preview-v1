import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  AIProvider,
  AIExecutionOptions,
  AIResponse,
  SparcConfig
} from '../types';
import { Logger } from '../utils/logger';

export class GeminiProvider implements AIProvider {
  readonly name = 'gemini';
  private client: GoogleGenerativeAI;
  private logger: Logger;
  private model: string;

  constructor(config: SparcConfig) {
    this.logger = new Logger('GeminiProvider');
    
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Google/Gemini API key not found in environment variables');
    }

    // Initialize Google Generative AI client
    this.client = new GoogleGenerativeAI(apiKey);
    
    // Use Gemini 1.5 Pro by default (or 2.0 Flash if available in config)
    this.model = config.features?.resumeParsing?.ai?.models?.find(m => 
      m.includes('gemini')
    ) || 'gemini-1.5-pro';
  }

  async execute(prompt: string, options?: AIExecutionOptions): Promise<AIResponse> {
    try {
      const model = this.client.getGenerativeModel({ 
        model: this.model,
        systemInstruction: options?.systemPrompt || this.buildSystemPrompt(options?.tools),
        generationConfig: {
          temperature: options?.temperature ?? 0.7,
          maxOutputTokens: options?.maxTokens ?? 4096,
        }
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      // Get token usage if available
      const usage = response.usageMetadata;

      return {
        content,
        usage: usage ? {
          promptTokens: usage.promptTokenCount || 0,
          completionTokens: usage.candidatesTokenCount || 0,
          totalTokens: usage.totalTokenCount || 0
        } : undefined,
        metadata: {
          model: this.model,
          finishReason: response.candidates?.[0]?.finishReason
        }
      };

    } catch (error) {
      this.logger.error('Failed to execute Gemini API call', error);
      
      // Handle specific Gemini errors
      if (error instanceof Error) {
        if (error.message.includes('SAFETY')) {
          throw new Error('Content was blocked by Gemini safety filters');
        } else if (error.message.includes('quota')) {
          throw new Error('Gemini API quota exceeded');
        }
      }
      
      throw error;
    }
  }

  async validateConfig(): Promise<boolean> {
    try {
      // Test API connection with a simple prompt
      const model = this.client.getGenerativeModel({ model: this.model });
      const result = await model.generateContent('Hello, respond with "OK"');
      const response = await result.response;
      
      return response.text().includes('OK');
    } catch (error) {
      this.logger.error('Gemini API validation failed', error);
      return false;
    }
  }

  private buildSystemPrompt(tools?: string[]): string {
    let prompt = `You are an expert software architect and developer executing SPARC methodology.
You have deep knowledge of software design patterns, best practices, and modern development techniques.
You write clean, maintainable, and well-tested code.
You are currently using Google's Gemini AI model.`;

    if (tools && tools.length > 0) {
      prompt += `\n\nYou have access to the following tools: ${tools.join(', ')}.
Use these tools as needed to complete your tasks effectively.`;
    }

    return prompt;
  }
}