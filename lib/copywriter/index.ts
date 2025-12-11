import { 
  processCopywritingRules, 
  validateCopy, 
  getCopywritingInstructions,
  getContextualPrompt,
  getRulesForContext,
} from './processor';
import { ruleDefinitions, ruleCategories, getRulesAsPrompt } from './rules';

/**
 * Copywriter Agent
 * 
 * Main interface for the copywriter agent that processes UI copy text
 * and enforces Sitecore copywriting rules.
 */
export interface CopywriterInput {
  text: string;
  context?: string; // Optional context about where the copy will be used (e.g., "button", "dialog", "form")
}

export interface CopywriterOutput {
  processedText: string;
  originalText: string;
  applied: boolean;
  validation: {
    isValid: boolean;
    issues: string[];
    suggestions: string[];
  };
  relevantRules: string;
}

/**
 * Processes UI copy text through the copywriter agent
 * @param input - The input text and optional context
 * @returns Processed copy with validation results and relevant rules
 */
export async function processCopy(input: CopywriterInput): Promise<CopywriterOutput> {
  const { text, context } = input;

  // Process the text through all copywriting rules
  const processedText = processCopywritingRules(text);

  // Validate the processed copy
  const validation = validateCopy(processedText);

  // Get relevant rules for the context
  const relevantRules = getContextualPrompt(context);

  return {
    processedText,
    originalText: text,
    applied: processedText !== text || validation.suggestions.length > 0,
    validation,
    relevantRules,
  };
}

/**
 * Get all copywriting rules formatted for AI prompts
 * @returns Complete rules documentation as a string
 */
export function getAllRules(): string {
  return getRulesAsPrompt();
}

/**
 * Get copywriting rules for a specific UI context
 * @param context - The UI context (e.g., "button", "dialog", "form")
 * @returns Relevant rules as formatted string
 */
export function getRulesForUIContext(context: string): string {
  return getContextualPrompt(context);
}

/**
 * Get the complete list of rule definitions
 */
export function getRuleDefinitions() {
  return ruleDefinitions;
}

/**
 * Get all available rule categories
 */
export function getRuleCategories() {
  return ruleCategories;
}

// Re-export for convenience
export { 
  getCopywritingInstructions,
  ruleDefinitions,
  ruleCategories,
};
