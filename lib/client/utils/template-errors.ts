// Template error handling and validation utilities

export class TemplateError extends Error {
  constructor(
    message: string,
    public code: string,
    public templateId?: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'TemplateError';
  }
}

export class TemplateValidationError extends TemplateError {
  constructor(
    message: string,
    templateId: string,
    public validationErrors: string[],
    details?: Record<string, any>
  ) {
    super(message, 'TEMPLATE_VALIDATION_ERROR', templateId, details);
    this.name = 'TemplateValidationError';
  }
}

export class TemplateNotFoundError extends TemplateError {
  constructor(templateId: string, availableTemplates: string[] = []) {
    super(
      `Template "${templateId}" not found`,
      'TEMPLATE_NOT_FOUND',
      templateId,
      { availableTemplates }
    );
    this.name = 'TemplateNotFoundError';
  }
}

export class TemplateApplicationError extends TemplateError {
  constructor(
    message: string,
    templateId: string,
    public originalError?: Error,
    details?: Record<string, any>
  ) {
    super(message, 'TEMPLATE_APPLICATION_ERROR', templateId, details);
    this.name = 'TemplateApplicationError';
  }
}

export class SubscriptionError extends Error {
  constructor(
    message: string,
    public templateId: string,
    public requiredPlan: string,
    public currentPlan: string
  ) {
    super(message);
    this.name = 'SubscriptionError';
  }
}

// Error handling utilities
export const TemplateErrorHandler = {
  
  // Handle template application errors with detailed logging
  handleTemplateApplicationError(error: unknown, templateId: string): TemplateError {
    if (error instanceof TemplateError) {
      return error;
    }

    if (error instanceof Error) {
      const templateError = new TemplateApplicationError(
        `Failed to apply template: ${error.message}`,
        templateId,
        error
      );
      
      // Log error details in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Template application error:', {
          templateId,
          originalError: error,
          stack: error.stack
        });
      }
      
      return templateError;
    }

    return new TemplateApplicationError(
      'Unknown error occurred while applying template',
      templateId,
      undefined,
      { originalError: error }
    );
  },

  // Handle subscription errors
  handleSubscriptionError(templateId: string, currentPlan: string): SubscriptionError {
    const requiredPlan = templateId === 'professional' ? 'free' : 'pro';
    
    return new SubscriptionError(
      `Template "${templateId}" requires ${requiredPlan} subscription. Current plan: ${currentPlan}`,
      templateId,
      requiredPlan,
      currentPlan
    );
  },

  // Safe template execution wrapper
  async safeTemplateOperation<T>(
    operation: () => Promise<T> | T,
    templateId: string,
    context?: string
  ): Promise<{ success: true; data: T } | { success: false; error: TemplateError }> {
    try {
      const result = await operation();
      return { success: true, data: result };
    } catch (error) {
      const templateError = this.handleTemplateApplicationError(error, templateId);
      
      // Add context if provided
      if (context) {
        templateError.details = {
          ...templateError.details,
          context
        };
      }
      
      return { success: false, error: templateError };
    }
  },

  // Validate operation result
  validateOperationResult<T>(
    result: { success: boolean; error?: TemplateError; data?: T },
    onError?: (error: TemplateError) => void
  ): result is { success: true; data: T } {
    if (!result.success && result.error) {
      if (onError) {
        onError(result.error);
      } else {
        console.error('Template operation failed:', result.error);
      }
      return false;
    }
    return result.success;
  }
};

// Error recovery strategies
export const TemplateErrorRecovery = {
  
  // Attempt to recover from template application failure
  async recoverFromTemplateError(
    error: TemplateError,
    fallbackTemplateId: string = 'professional'
  ): Promise<{ recovered: boolean; templateId: string; strategy: string }> {
    
    // Strategy 1: Use fallback template
    if (error.templateId !== fallbackTemplateId) {
      try {
        return {
          recovered: true,
          templateId: fallbackTemplateId,
          strategy: 'fallback_template'
        };
      } catch (fallbackError) {
        console.error('Fallback template also failed:', fallbackError);
      }
    }

    // Strategy 2: Use last known good state (would need to be implemented)
    // This would require storing previous successful template states

    // Strategy 3: Reset to default
    return {
      recovered: false,
      templateId: fallbackTemplateId,
      strategy: 'reset_to_default'
    };
  },

  // Get user-friendly error message
  getUserFriendlyMessage(error: TemplateError): string {
    switch (error.code) {
      case 'TEMPLATE_NOT_FOUND':
        return `The template you selected is not available. Please try another template.`;
      
      case 'TEMPLATE_VALIDATION_ERROR':
        return `There's an issue with this template. Please contact support if this persists.`;
      
      case 'TEMPLATE_APPLICATION_ERROR':
        return `Unable to apply this template right now. Please try again or select a different template.`;
      
      default:
        return `Something went wrong with your template. Please try again or contact support.`;
    }
  },

  // Get suggested actions for error recovery
  getSuggestedActions(error: TemplateError): string[] {
    const actions: string[] = [];

    switch (error.code) {
      case 'TEMPLATE_NOT_FOUND':
        actions.push('Try refreshing the page');
        actions.push('Select a different template');
        break;
      
      case 'TEMPLATE_VALIDATION_ERROR':
        actions.push('Contact support with error details');
        actions.push('Use the Professional template as an alternative');
        break;
      
      case 'TEMPLATE_APPLICATION_ERROR':
        actions.push('Try again in a few moments');
        actions.push('Check your internet connection');
        actions.push('Clear your browser cache');
        break;
    }

    actions.push('If the problem persists, please contact our support team');
    return actions;
  }
};

// Validation helpers
export const TemplateValidation = {
  
  // Validate template ID
  isValidTemplateId(templateId: string, availableTemplates: string[]): boolean {
    return availableTemplates.includes(templateId);
  },

  // Validate template structure
  hasRequiredFields(template: any): boolean {
    const requiredFields = ['id', 'name', 'description', 'category', 'defaults', 'styles'];
    return requiredFields.every(field => field in template);
  },

  // Validate style configuration
  hasValidStyles(styles: any): boolean {
    const requiredStyleSections = ['fontScales', 'layout', 'typography', 'colors', 'decorations'];
    return requiredStyleSections.every(section => section in styles);
  },

  // Check if template is accessible to user
  checkTemplateAccess(templateId: string, userPlan: string): boolean {
    if (templateId === 'professional') return true;
    return userPlan === 'pro' || userPlan === 'enterprise';
  }
};