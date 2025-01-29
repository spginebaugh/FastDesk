import { responseGenerationService } from './response-generation.service';
import { responseEditingService } from './response-editing.service';

// Export individual services for granular access
export { responseGenerationService } from './response-generation.service';
export { responseEditingService } from './response-editing.service';

// Export unified API for backward compatibility
export const openAIService = {
  ...responseGenerationService,
  ...responseEditingService
}; 