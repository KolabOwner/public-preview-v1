import {
  AIProvider,
  AIExecutionOptions,
  AIResponse,
  SparcConfig
} from '../types';
import { Logger } from '../utils/logger';

interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export class OllamaProvider implements AIProvider {
  readonly name = 'ollama';
  private logger: Logger;
  private baseUrl: string;
  private model: string;

  constructor(config: SparcConfig) {
    this.logger = new Logger('OllamaProvider');
    
    // Get Ollama base URL from environment or use default
    this.baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    
    // Use model from config or default to llama3.1
    this.model = config.features?.resumeParsing?.ai?.models?.find(m => 
      m.includes('llama') || m.includes('ollama')
    )?.replace('ollama-', '') || 'llama3.1';
  }

  async execute(prompt: string, options?: AIExecutionOptions): Promise<AIResponse> {
    try {
      const systemPrompt = options?.systemPrompt || this.buildSystemPrompt(options?.tools);
      
      // Combine system prompt and user prompt
      const fullPrompt = `${systemPrompt}\n\n${prompt}`;
      
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt: fullPrompt,
          stream: false,
          options: {
            temperature: options?.temperature ?? 0.7,
            num_predict: options?.maxTokens ?? 4096,
          }
        }),
        signal: options?.timeout ? AbortSignal.timeout(options.timeout) : undefined
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data: OllamaResponse = await response.json();

      return {
        content: data.response,
        usage: {
          promptTokens: data.prompt_eval_count || 0,
          completionTokens: data.eval_count || 0,
          totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0)
        },
        metadata: {
          model: this.model,
          totalDuration: data.total_duration,
          loadDuration: data.load_duration,
          promptEvalDuration: data.prompt_eval_duration,
          evalDuration: data.eval_duration
        }
      };

    } catch (error) {
      this.logger.error('Failed to execute Ollama API call', error);
      
      if (error instanceof Error) {
        if (error.message.includes('ECONNREFUSED')) {
          throw new Error('Ollama is not running. Please start Ollama service.');
        } else if (error.message.includes('model not found')) {
          throw new Error(`Model ${this.model} not found. Please pull the model first: ollama pull ${this.model}`);
        }
      }
      
      throw error;
    }
  }

  async validateConfig(): Promise<boolean> {
    try {
      // Check if Ollama is running
      const response = await fetch(`${this.baseUrl}/api/version`);
      if (!response.ok) {
        return false;
      }

      // Check if model is available
      const modelsResponse = await fetch(`${this.baseUrl}/api/tags`);
      if (!modelsResponse.ok) {
        return false;
      }

      const data = await modelsResponse.json();
      const models = data.models || [];
      
      const modelExists = models.some((m: any) => 
        m.name === this.model || m.name.startsWith(`${this.model}:`)
      );

      if (!modelExists) {
        this.logger.warn(`Model ${this.model} not found in Ollama. Available models: ${models.map((m: any) => m.name).join(', ')}`);
        return false;
      }

      // Test generation
      const testResponse = await this.execute('Hello, respond with "OK"', {
        maxTokens: 10
      });

      return testResponse.content.includes('OK');
    } catch (error) {
      this.logger.error('Ollama validation failed', error);
      return false;
    }
  }

  private buildSystemPrompt(tools?: string[]): string {
    let prompt = `You are an expert software architect and developer executing SPARC methodology.
You have deep knowledge of software design patterns, best practices, and modern development techniques.
You write clean, maintainable, and well-tested code.
You are currently using a local Ollama model (${this.model}).`;

    if (tools && tools.length > 0) {
      prompt += `\n\nYou have access to the following tools: ${tools.join(', ')}.
Use these tools as needed to complete your tasks effectively.`;
    }

    return prompt;
  }

  // Utility method to pull a model if not available
  async pullModel(modelName: string): Promise<void> {
    this.logger.info(`Pulling Ollama model: ${modelName}`);
    
    try {
      const response = await fetch(`${this.baseUrl}/api/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: modelName,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to pull model: ${response.statusText}`);
      }

      this.logger.info(`Successfully pulled model: ${modelName}`);
    } catch (error) {
      this.logger.error(`Failed to pull model ${modelName}`, error);
      throw error;
    }
  }

  // Get list of available models
  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) {
        throw new Error('Failed to list models');
      }

      const data = await response.json();
      return (data.models || []).map((m: any) => m.name);
    } catch (error) {
      this.logger.error('Failed to list Ollama models', error);
      return [];
    }
  }
}