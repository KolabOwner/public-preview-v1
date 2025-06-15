import { AIProvider, SparcConfig } from '../types';
import { AI_PROVIDERS } from '../constants';
import { ClaudeProvider } from './claude-provider';
import { GeminiProvider } from './gemini-provider';
import { OllamaProvider } from './ollama-provider';
import { Logger } from '../utils/logger';

export class AIProviderFactory {
  private static logger = new Logger('AIProviderFactory');
  private static providers: Map<string, AIProvider> = new Map();

  static async create(providerName: string, config: SparcConfig): Promise<AIProvider> {
    // Check cache first
    if (this.providers.has(providerName)) {
      this.logger.debug(`Using cached provider: ${providerName}`);
      return this.providers.get(providerName)!;
    }

    let provider: AIProvider;

    switch (providerName.toLowerCase()) {
      case AI_PROVIDERS.CLAUDE:
        provider = new ClaudeProvider(config);
        break;
      
      case AI_PROVIDERS.GEMINI:
        provider = new GeminiProvider(config);
        break;
      
      case AI_PROVIDERS.OLLAMA:
        provider = new OllamaProvider(config);
        break;
      
      default:
        throw new Error(`Unknown AI provider: ${providerName}`);
    }

    // Validate provider configuration
    const isValid = await provider.validateConfig();
    if (!isValid) {
      throw new Error(`${providerName} provider validation failed. Check your configuration and API keys.`);
    }

    // Cache the provider
    this.providers.set(providerName, provider);
    this.logger.info(`Created and validated ${providerName} provider`);

    return provider;
  }

  static async createWithFallback(
    primaryProvider: string,
    fallbackProviders: string[],
    config: SparcConfig
  ): Promise<AIProvider> {
    // Try primary provider first
    try {
      return await this.create(primaryProvider, config);
    } catch (error) {
      this.logger.warn(`Primary provider ${primaryProvider} failed:`, error);
    }

    // Try fallback providers
    for (const fallbackProvider of fallbackProviders) {
      try {
        this.logger.info(`Trying fallback provider: ${fallbackProvider}`);
        return await this.create(fallbackProvider, config);
      } catch (error) {
        this.logger.warn(`Fallback provider ${fallbackProvider} failed:`, error);
      }
    }

    throw new Error('All AI providers failed. Please check your configuration.');
  }

  static clearCache(): void {
    this.providers.clear();
    this.logger.debug('Provider cache cleared');
  }

  static getAvailableProviders(): string[] {
    return Object.values(AI_PROVIDERS);
  }

  static getCachedProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}