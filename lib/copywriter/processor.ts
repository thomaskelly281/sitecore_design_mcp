import { copywritingRules, getRulesAsPrompt, ruleDefinitions, getRulesByCategory, RuleCategory } from './rules';

/**
 * Processes text by applying all enabled copywriting rules
 * @param inputText - The original text to process
 * @returns The processed text with all rules applied
 */
export function processCopywritingRules(inputText: string): string {
  if (!inputText || typeof inputText !== 'string') {
    return inputText || '';
  }

  let processedText = inputText;

  // Apply each programmatic rule in sequence
  for (const rule of copywritingRules) {
    try {
      processedText = rule(processedText);
    } catch (error) {
      // Log error but continue with other rules
      console.error('Error applying copywriting rule:', error);
    }
  }

  return processedText;
}

/**
 * Get all rules formatted as instructions for AI/LLM prompts
 * @returns Formatted string containing all copywriting rules
 */
export function getCopywritingInstructions(): string {
  return getRulesAsPrompt();
}

/**
 * Get rules for a specific context (category)
 * @param context - The UI context (e.g., "button", "dialog", "form")
 * @returns Array of relevant rule definitions
 */
export function getRulesForContext(context: string): typeof ruleDefinitions {
  const contextMap: Record<string, RuleCategory> = {
    button: 'Buttons',
    buttons: 'Buttons',
    dialog: 'Dialogs',
    dialogs: 'Dialogs',
    modal: 'Dialogs',
    modals: 'Dialogs',
    form: 'Forms',
    forms: 'Forms',
    field: 'Forms',
    fields: 'Forms',
    input: 'Forms',
    inputs: 'Forms',
    checkbox: 'Checkboxes',
    checkboxes: 'Checkboxes',
    radio: 'Checkboxes',
    alert: 'Alerts',
    alerts: 'Alerts',
    toast: 'Alerts',
    notification: 'Alerts',
    date: 'Date & Time',
    time: 'Date & Time',
    datetime: 'Date & Time',
    api: 'API Messages',
    error: 'API Messages',
    help: 'Inline Help',
    tooltip: 'Inline Help',
  };

  const category = contextMap[context.toLowerCase()];
  if (category) {
    // Return category-specific rules plus general rules
    return [
      ...getRulesByCategory('General Style'),
      ...getRulesByCategory('Grammar'),
      ...getRulesByCategory('Capitalization'),
      ...getRulesByCategory('Punctuation'),
      ...getRulesByCategory(category),
    ];
  }

  // Return all rules if no specific context
  return ruleDefinitions;
}

/**
 * Validates that the processed text meets quality standards
 * @param text - The text to validate
 * @returns Validation result with any issues found
 */
export interface ValidationResult {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
}

export function validateCopy(text: string): ValidationResult {
  const issues: string[] = [];
  const suggestions: string[] = [];

  if (!text || text.trim().length === 0) {
    issues.push('Text is empty');
    return { isValid: false, issues, suggestions };
  }

  if (text.length > 10000) {
    issues.push('Text exceeds maximum length of 10,000 characters');
  }

  // Check for British spellings
  const britishPatterns = [
    /\bcolour/i,
    /\bfavour/i,
    /\borganise/i,
    /\brealise/i,
    /\bcentre\b/i,
    /\banalyse/i,
  ];
  for (const pattern of britishPatterns) {
    if (pattern.test(text)) {
      suggestions.push('Consider using American English spelling');
      break;
    }
  }

  // Check for excessive exclamation points
  const exclamationCount = (text.match(/!/g) || []).length;
  if (exclamationCount > 1) {
    suggestions.push('Avoid multiple exclamation points');
  }

  // Check for "fill in" usage
  if (/\bfill in\b/i.test(text)) {
    suggestions.push('Use "fill out" instead of "fill in"');
  }

  // Check for bracketed plurals
  if (/\w+\(s\)/i.test(text)) {
    suggestions.push('Use plural form instead of bracketed plurals like "Item(s)"');
  }

  // Check for all caps (excluding short acronyms)
  const words = text.split(/\s+/);
  const allCapsWords = words.filter(
    (w) => w.length > 3 && w === w.toUpperCase() && /^[A-Z]+$/.test(w)
  );
  if (allCapsWords.length > 0) {
    suggestions.push('Avoid ALL CAPS text; use CSS text-transform if needed');
  }

  // Check for ambiguous button text
  const trimmedLower = text.trim().toLowerCase();
  if (['yes', 'no', 'ok'].includes(trimmedLower)) {
    suggestions.push('Use explicit action verbs instead of "Yes", "No", or "OK"');
  }

  // Check for "New X" pattern that should be "Create X"
  if (/\bNew\s+[a-z]/i.test(text)) {
    suggestions.push('Consider using "Create" instead of "New" for creation actions');
  }

  return {
    isValid: issues.length === 0,
    issues,
    suggestions,
  };
}

/**
 * Format rules for a specific context as a concise prompt
 * @param context - The UI context
 * @returns Formatted rules string
 */
export function getContextualPrompt(context?: string): string {
  const rules = context ? getRulesForContext(context) : ruleDefinitions;
  
  let prompt = '## Copywriting Rules to Follow\n\n';
  
  let currentCategory = '';
  for (const rule of rules) {
    if (rule.category !== currentCategory) {
      currentCategory = rule.category;
      prompt += `### ${currentCategory}\n`;
    }
    prompt += `- **${rule.ruleType}**: ${rule.rule}\n`;
  }
  
  return prompt;
}
