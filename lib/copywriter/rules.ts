/**
 * Sitecore UI Text Copywriting Rules Configuration
 * 
 * This file contains all copywriting rules that the copywriter agent enforces.
 * Rules are organized by category and include both documentation and
 * programmatic enforcement where applicable.
 */

// =============================================================================
// RULE DEFINITIONS (Structured Data)
// =============================================================================

export interface CopywritingRuleDefinition {
  category: string;
  ruleType: string;
  rule: string;
  source: string;
}

/**
 * Complete list of all Sitecore UI text copywriting rules
 */
export const ruleDefinitions: CopywritingRuleDefinition[] = [
  // General Style
  {
    category: 'General Style',
    ruleType: 'Voice',
    rule: 'Write simply, directly, and correctly. Do not explain things that go without saying. Avoid repetition.',
    source: 'General guidelines',
  },
  {
    category: 'General Style',
    ruleType: 'Tone',
    rule: 'Friendly but not chatty. Find the middle ground between "corporate/cold" and "fluff".',
    source: 'General guidelines',
  },
  {
    category: 'General Style',
    ruleType: 'Vocabulary',
    rule: 'Use short, plain, common words. Do not invent words or use slang.',
    source: 'General guidelines',
  },
  {
    category: 'General Style',
    ruleType: 'Self-contained text',
    rule: 'Individual elements (headings, buttons) must stand on their own without surrounding context.',
    source: 'General guidelines',
  },

  // Grammar
  {
    category: 'Grammar',
    ruleType: 'Language',
    rule: 'Follow American English rules (Merriam-Webster dictionary). Use American spelling (e.g., "Color" not "Colour").',
    source: 'General guidelines',
  },
  {
    category: 'Grammar',
    ruleType: 'Word Choice',
    rule: 'Use "fill out a form" instead of "fill in".',
    source: 'General guidelines',
  },
  {
    category: 'Grammar',
    ruleType: 'Plurals',
    rule: 'Use the plural form for items that can be singular or plural. Do not use brackets like Asset(s).',
    source: 'General guidelines',
  },
  {
    category: 'Grammar',
    ruleType: 'Tense',
    rule: 'Use present tense to describe product behavior. Avoid future tense for how the product always acts.',
    source: 'General guidelines',
  },

  // Capitalization
  {
    category: 'Capitalization',
    ruleType: 'Sentence case',
    rule: 'Capitalize only the first word of sentences, headings, buttons, and labels (except proper nouns).',
    source: 'General guidelines',
  },
  {
    category: 'Capitalization',
    ruleType: 'Product Names',
    rule: 'Preserve capitalization of proper names and abbreviations (e.g., "API key", "Content Hub ONE").',
    source: 'General guidelines',
  },
  {
    category: 'Capitalization',
    ruleType: 'Styling',
    rule: 'Do not hard-code uppercase text. Use CSS (text-transform: uppercase) if stylistic uppercase is needed.',
    source: 'General guidelines',
  },

  // Punctuation
  {
    category: 'Punctuation',
    ruleType: 'Solo sentences',
    rule: 'Do not use periods on solo sentences (headers, buttons, toasts, inputs, tooltips).',
    source: 'General guidelines',
  },
  {
    category: 'Punctuation',
    ruleType: 'Body text',
    rule: 'End all sentences in body text (persistent text in page/dialog body) with a period.',
    source: 'General guidelines',
  },
  {
    category: 'Punctuation',
    ruleType: 'Links',
    rule: 'Use a period after a solo sentence if it is followed by a link.',
    source: 'General guidelines',
  },
  {
    category: 'Punctuation',
    ruleType: 'Exclamations',
    rule: 'Avoid exclamation points. Use only one if necessary for sincere congratulations.',
    source: 'General guidelines',
  },

  // Numbers
  {
    category: 'Numbers',
    ruleType: 'Numerals',
    rule: 'Use numerals instead of words (e.g., "3 messages"). Exception: Use words when mixing numbers (e.g., "Enter two 3s").',
    source: 'General guidelines',
  },

  // Units
  {
    category: 'Units',
    ruleType: 'Spacing',
    rule: 'Leave a space between value and unit (e.g., "123 MB"). Exception: No space for single-character units (e.g., "1080p", "5d").',
    source: 'General guidelines',
  },

  // Truncation
  {
    category: 'Truncation',
    ruleType: 'Ellipsis',
    rule: 'Ensure truncated text ends with an ellipsis and provide the full text in a tooltip.',
    source: 'General guidelines',
  },

  // Buttons
  {
    category: 'Buttons',
    ruleType: 'Labels',
    rule: 'Describe the specific action (concise, 1-2 words). Do not use ending punctuation.',
    source: 'Button',
  },
  {
    category: 'Buttons',
    ruleType: 'Creation',
    rule: 'Use "Create {thing}" (e.g., "Create widget"). Avoid "New {thing}" or "Create new {thing}".',
    source: 'Button',
  },
  {
    category: 'Buttons',
    ruleType: 'Create vs. Add',
    rule: 'Use Create if the opposite is Destroy/Delete (high stakes). Use Add if the opposite is Remove (low stakes).',
    source: 'Button',
  },
  {
    category: 'Buttons',
    ruleType: 'Content Hub',
    rule: 'For Content Hub, creation buttons use the format + {ThingName} to avoid translation issues.',
    source: 'Button',
  },

  // Dialogs
  {
    category: 'Dialogs',
    ruleType: 'Consistency',
    rule: 'The dialog title must match the button clicked to open it (e.g., Button "Edit widget" -> Title "Edit widget").',
    source: 'Dialog, Modal...',
  },
  {
    category: 'Dialogs',
    ruleType: 'Decision Buttons',
    rule: 'Use explicit verbs for buttons (e.g., "Enable", "Delete"). Avoid ambiguous text like "Yes", "No", or "OK".',
    source: 'Dialog, Modal...',
  },
  {
    category: 'Dialogs',
    ruleType: 'Unsaved Changes',
    rule: 'Use exactly two options: 1. "Keep editing" (return to form), 2. "Discard" (lose changes).',
    source: 'Dialog, Modal...',
  },
  {
    category: 'Dialogs',
    ruleType: 'Info Dialogs',
    rule: 'Use "Dismiss" or "OK" to acknowledge. Avoid "Cancel" on purely informative dialogs.',
    source: 'Dialog, Modal...',
  },
  {
    category: 'Dialogs',
    ruleType: 'Terminology',
    rule: '"Close" closes the dialog. "Cancel" cancels the actions/settings within the dialog.',
    source: 'Dialog, Modal...',
  },

  // Alerts
  {
    category: 'Alerts',
    ruleType: 'Content',
    rule: 'Limit to 1–2 sentences. Link to documentation if more detail is needed.',
    source: 'Alert',
  },
  {
    category: 'Alerts',
    ruleType: 'Structure',
    rule: 'Avoid "Title / Description" structure; it creates redundancy.',
    source: 'Alert',
  },

  // Forms
  {
    category: 'Forms',
    ruleType: 'Field Labels',
    rule: 'Use a word or phrase (not a sentence). Do not use punctuation (no colons).',
    source: 'Form field',
  },
  {
    category: 'Forms',
    ruleType: 'Helper Text',
    rule: 'Use helper text generously to provide context or instructions.',
    source: 'Form field',
  },
  {
    category: 'Forms',
    ruleType: 'Placeholders',
    rule: 'Avoid placeholder text inside input fields. Exception: Search or filter boxes.',
    source: 'Form field',
  },
  {
    category: 'Forms',
    ruleType: 'Errors',
    rule: 'Explain the error and how to fix it immediately.',
    source: 'Form field',
  },

  // Checkboxes
  {
    category: 'Checkboxes',
    ruleType: 'Labels',
    rule: 'Use active, positive wording (e.g., "Send me a copy"). Avoid negations ("Don\'t send") or questions.',
    source: 'Checkbox, Radio',
  },
  {
    category: 'Checkboxes',
    ruleType: 'Punctuation',
    rule: 'Do not add a period at the end of a checkbox label.',
    source: 'Checkbox, Radio',
  },
  {
    category: 'Checkboxes',
    ruleType: 'Grouping',
    rule: 'Group labels should explain the purpose. Option labels should focus on the differences between choices.',
    source: 'Checkbox, Radio',
  },

  // Date & Time
  {
    category: 'Date & Time',
    ruleType: 'Date Format',
    rule: 'Use US order: Month Day, Year (e.g., Dec 6, 2020).',
    source: 'Date and time',
  },
  {
    category: 'Date & Time',
    ruleType: 'Months',
    rule: 'Write out the month, abbreviated to 3 letters (e.g., "Dec").',
    source: 'Date and time',
  },
  {
    category: 'Date & Time',
    ruleType: 'Day Format',
    rule: 'Do not use leading zeros (use "6" not "06"). Do not use ordinals (use "Dec 6" not "Dec 6th").',
    source: 'Date and time',
  },
  {
    category: 'Date & Time',
    ruleType: 'Time Format',
    rule: 'Use 12-hour clock with AM/PM (e.g., 2:23 PM).',
    source: 'Date and time',
  },

  // API Messages
  {
    category: 'API Messages',
    ruleType: 'Structure',
    rule: 'Part 1: Location (code generated). Part 2: Human-readable explanation specific to the occurrence.',
    source: 'API messages',
  },
  {
    category: 'API Messages',
    ruleType: 'Detail',
    rule: 'Focus on the error itself, not user action. Include an example if applicable.',
    source: 'API messages',
  },
  {
    category: 'API Messages',
    ruleType: 'Formatting',
    rule: 'Start with an initial capital letter. End with a standard period.',
    source: 'API messages',
  },

  // Inline Help
  {
    category: 'Inline Help',
    ruleType: 'Usage',
    rule: 'Use to clarify unfamiliar concepts or explain a task flow.',
    source: 'Inline help',
  },
];

// =============================================================================
// RULE CATEGORIES (for filtering and organization)
// =============================================================================

export const ruleCategories = [
  'General Style',
  'Grammar',
  'Capitalization',
  'Punctuation',
  'Numbers',
  'Units',
  'Truncation',
  'Buttons',
  'Dialogs',
  'Alerts',
  'Forms',
  'Checkboxes',
  'Date & Time',
  'API Messages',
  'Inline Help',
] as const;

export type RuleCategory = (typeof ruleCategories)[number];

/**
 * Get rules filtered by category
 */
export function getRulesByCategory(category: RuleCategory): CopywritingRuleDefinition[] {
  return ruleDefinitions.filter((rule) => rule.category === category);
}

/**
 * Get all rules formatted as a string for AI prompts
 */
export function getRulesAsPrompt(): string {
  let prompt = '# Sitecore UI Text Copywriting Rules\n\n';
  prompt += 'Follow these rules when writing or reviewing UI text:\n\n';

  let currentCategory = '';
  for (const rule of ruleDefinitions) {
    if (rule.category !== currentCategory) {
      currentCategory = rule.category;
      prompt += `## ${currentCategory}\n\n`;
    }
    prompt += `- **${rule.ruleType}**: ${rule.rule}\n`;
  }

  return prompt;
}

// =============================================================================
// PROGRAMMATIC RULE FUNCTIONS
// =============================================================================

export type CopywritingRule = (text: string) => string;

/**
 * British to American English spelling conversions
 */
const britishToAmerican: Record<string, string> = {
  colour: 'color',
  colours: 'colors',
  coloured: 'colored',
  colouring: 'coloring',
  favour: 'favor',
  favours: 'favors',
  favoured: 'favored',
  favouring: 'favoring',
  favourite: 'favorite',
  favourites: 'favorites',
  honour: 'honor',
  honours: 'honors',
  honoured: 'honored',
  honouring: 'honoring',
  labour: 'labor',
  labours: 'labors',
  laboured: 'labored',
  labouring: 'laboring',
  neighbour: 'neighbor',
  neighbours: 'neighbors',
  neighbourhood: 'neighborhood',
  neighbourhoods: 'neighborhoods',
  behaviour: 'behavior',
  behaviours: 'behaviors',
  behavioural: 'behavioral',
  harbour: 'harbor',
  harbours: 'harbors',
  humour: 'humor',
  humours: 'humors',
  humoured: 'humored',
  rumour: 'rumor',
  rumours: 'rumors',
  vapour: 'vapor',
  vapours: 'vapors',
  savour: 'savor',
  savours: 'savors',
  savoured: 'savored',
  endeavour: 'endeavor',
  endeavours: 'endeavors',
  endeavoured: 'endeavored',
  catalogue: 'catalog',
  catalogues: 'catalogs',
  catalogued: 'cataloged',
  dialogue: 'dialog',
  dialogues: 'dialogs',
  analogue: 'analog',
  analogues: 'analogs',
  programme: 'program',
  programmes: 'programs',
  programmed: 'programmed',
  centre: 'center',
  centres: 'centers',
  centred: 'centered',
  theatre: 'theater',
  theatres: 'theaters',
  metre: 'meter',
  metres: 'meters',
  litre: 'liter',
  litres: 'liters',
  fibre: 'fiber',
  fibres: 'fibers',
  spectre: 'specter',
  spectres: 'specters',
  sombre: 'somber',
  lustre: 'luster',
  defence: 'defense',
  defences: 'defenses',
  offence: 'offense',
  offences: 'offenses',
  licence: 'license',
  licences: 'licenses',
  practise: 'practice',
  practised: 'practiced',
  practising: 'practicing',
  analyse: 'analyze',
  analyses: 'analyzes',
  analysed: 'analyzed',
  analysing: 'analyzing',
  organise: 'organize',
  organises: 'organizes',
  organised: 'organized',
  organising: 'organizing',
  organisation: 'organization',
  organisations: 'organizations',
  recognise: 'recognize',
  recognises: 'recognizes',
  recognised: 'recognized',
  recognising: 'recognizing',
  realise: 'realize',
  realises: 'realizes',
  realised: 'realized',
  realising: 'realizing',
  customise: 'customize',
  customises: 'customizes',
  customised: 'customized',
  customising: 'customizing',
  minimise: 'minimize',
  minimises: 'minimizes',
  minimised: 'minimized',
  minimising: 'minimizing',
  maximise: 'maximize',
  maximises: 'maximizes',
  maximised: 'maximized',
  maximising: 'maximizing',
  optimise: 'optimize',
  optimises: 'optimizes',
  optimised: 'optimized',
  optimising: 'optimizing',
  synchronise: 'synchronize',
  synchronises: 'synchronizes',
  synchronised: 'synchronized',
  synchronising: 'synchronizing',
  apologise: 'apologize',
  apologises: 'apologizes',
  apologised: 'apologized',
  apologising: 'apologizing',
  authorise: 'authorize',
  authorises: 'authorizes',
  authorised: 'authorized',
  authorising: 'authorizing',
  authorisation: 'authorization',
  cancelled: 'canceled',
  cancelling: 'canceling',
  travelled: 'traveled',
  travelling: 'traveling',
  traveller: 'traveler',
  travellers: 'travelers',
  labelled: 'labeled',
  labelling: 'labeling',
  modelled: 'modeled',
  modelling: 'modeling',
  grey: 'gray',
  greys: 'grays',
  cheque: 'check',
  cheques: 'checks',
  enquiry: 'inquiry',
  enquiries: 'inquiries',
  enquire: 'inquire',
  enquires: 'inquires',
  enquired: 'inquired',
  enquiring: 'inquiring',
  fulfil: 'fulfill',
  fulfils: 'fulfills',
  fulfilled: 'fulfilled',
  fulfilling: 'fulfilling',
  jewellery: 'jewelry',
  judgement: 'judgment',
  manoeuvre: 'maneuver',
  manoeuvres: 'maneuvers',
  mould: 'mold',
  moulds: 'molds',
  moulded: 'molded',
  moulding: 'molding',
  plough: 'plow',
  ploughs: 'plows',
  skilful: 'skillful',
  storey: 'story',
  storeys: 'stories',
  tyre: 'tire',
  tyres: 'tires',
};

/**
 * Word number to numeral conversions (common cases)
 */
const wordToNumeral: Record<string, string> = {
  zero: '0',
  one: '1',
  two: '2',
  three: '3',
  four: '4',
  five: '5',
  six: '6',
  seven: '7',
  eight: '8',
  nine: '9',
  ten: '10',
  eleven: '11',
  twelve: '12',
  thirteen: '13',
  fourteen: '14',
  fifteen: '15',
  sixteen: '16',
  seventeen: '17',
  eighteen: '18',
  nineteen: '19',
  twenty: '20',
};

/**
 * List of copywriting rules that can be programmatically applied.
 * These transform text according to the Sitecore UI text guidelines.
 */
export const copywritingRules: CopywritingRule[] = [
  // Rule: American English spelling (Grammar - Language)
  (text: string): string => {
    if (!text) return text;
    let result = text;
    for (const [british, american] of Object.entries(britishToAmerican)) {
      // Case-insensitive replacement preserving original case
      const regex = new RegExp(`\\b${british}\\b`, 'gi');
      result = result.replace(regex, (match) => {
        // Preserve the case of the original
        if (match[0] === match[0].toUpperCase()) {
          return american.charAt(0).toUpperCase() + american.slice(1);
        }
        return american;
      });
    }
    return result;
  },

  // Rule: Use "fill out" instead of "fill in" (Grammar - Word Choice)
  (text: string): string => {
    if (!text) return text;
    return text.replace(/\bfill in\b/gi, (match) => {
      if (match[0] === 'F') return 'Fill out';
      return 'fill out';
    });
  },

  // Rule: Remove bracketed plurals like Asset(s) (Grammar - Plurals)
  (text: string): string => {
    if (!text) return text;
    // Replace patterns like "Asset(s)" with "Assets" (plural form)
    return text.replace(/(\w+)\(s\)/gi, '$1s');
  },

  // Rule: Convert word numbers to numerals (Numbers - Numerals)
  (text: string): string => {
    if (!text) return text;
    let result = text;
    for (const [word, numeral] of Object.entries(wordToNumeral)) {
      // Only convert standalone number words (not when describing another number)
      // Avoid converting patterns like "two 3s" or "three 5s"
      const regex = new RegExp(`\\b${word}\\b(?!\\s+\\d)`, 'gi');
      result = result.replace(regex, numeral);
    }
    return result;
  },

  // Rule: Ensure proper spacing between value and unit (Units - Spacing)
  (text: string): string => {
    if (!text) return text;
    // Add space between number and multi-character units if missing
    // But keep no space for single-character units like 1080p, 5d, 4k
    const multiCharUnits = ['MB', 'GB', 'TB', 'KB', 'ms', 'px', 'em', 'rem', 'Hz', 'kHz', 'MHz', 'GHz'];
    let result = text;
    for (const unit of multiCharUnits) {
      const regex = new RegExp(`(\\d)${unit}\\b`, 'g');
      result = result.replace(regex, `$1 ${unit}`);
    }
    return result;
  },

  // Rule: Remove excessive exclamation points (Punctuation - Exclamations)
  (text: string): string => {
    if (!text) return text;
    // Replace multiple exclamation points with one
    let result = text.replace(/!{2,}/g, '!');
    // Count exclamation points - if more than one in the text, reduce
    const exclamationCount = (result.match(/!/g) || []).length;
    if (exclamationCount > 1) {
      // Keep only the first exclamation point
      let found = false;
      result = result.replace(/!/g, () => {
        if (!found) {
          found = true;
          return '!';
        }
        return '.';
      });
    }
    return result;
  },

  // Rule: Sentence case - avoid ALL CAPS (Capitalization - Styling)
  (text: string): string => {
    if (!text) return text;
    // Don't modify if it's an acronym (3 chars or less all caps) or known abbreviations
    const knownAcronyms = ['API', 'URL', 'HTML', 'CSS', 'JSON', 'XML', 'SQL', 'HTTP', 'HTTPS', 'REST', 'SDK', 'CLI', 'UI', 'UX', 'ID', 'CMS', 'CDN', 'SSO', 'OAuth', 'JWT', 'CORS', 'DNS', 'SSL', 'TLS', 'AWS', 'GCP', 'ONE'];
    
    // Split into words and process each
    return text.split(' ').map((word) => {
      // Skip if it's a known acronym
      if (knownAcronyms.includes(word)) return word;
      // Skip if 3 chars or less and all caps (likely an acronym)
      if (word.length <= 3 && word === word.toUpperCase() && /^[A-Z]+$/.test(word)) return word;
      // If entire word is uppercase and longer than 3 chars, convert to sentence case
      if (word.length > 3 && word === word.toUpperCase() && /^[A-Z]+$/.test(word)) {
        return word.charAt(0) + word.slice(1).toLowerCase();
      }
      return word;
    }).join(' ');
  },

  // Rule: Capitalize first letter of text (Capitalization - Sentence case)
  (text: string): string => {
    if (!text || !text.trim()) return text;
    const trimmed = text.trim();
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  },

  // Rule: Replace "New {thing}" with "Create {thing}" for buttons (Buttons - Creation)
  (text: string): string => {
    if (!text) return text;
    // Replace "New X" patterns (but not "New York" etc - only when followed by lowercase)
    return text.replace(/\bNew\s+([a-z]\w*)/g, 'Create $1');
  },

  // Rule: Replace "Create new {thing}" with "Create {thing}" (Buttons - Creation)
  (text: string): string => {
    if (!text) return text;
    return text.replace(/\bCreate new\s+/gi, 'Create ');
  },

  // Rule: Replace ambiguous dialog buttons (Dialogs - Decision Buttons)
  (text: string): string => {
    if (!text) return text;
    // Only apply to very short text (likely button labels)
    if (text.length > 10) return text;
    const trimmed = text.trim().toLowerCase();
    if (trimmed === 'yes') return 'Confirm';
    if (trimmed === 'no') return 'Cancel';
    return text;
  },

  // Rule: Remove colons from labels (Forms - Field Labels)
  (text: string): string => {
    if (!text) return text;
    // Remove trailing colons from short text (likely labels)
    if (text.length < 50) {
      return text.replace(/:$/, '');
    }
    return text;
  },
];

// =============================================================================
// RULE METADATA (for documentation and debugging)
// =============================================================================

export interface RuleMetadata {
  name: string;
  description: string;
  category: string;
  enabled: boolean;
}

export const ruleMetadata: RuleMetadata[] = [
  {
    name: 'american-english-spelling',
    description: 'Converts British English spelling to American English',
    category: 'Grammar',
    enabled: true,
  },
  {
    name: 'fill-out-form',
    description: 'Uses "fill out" instead of "fill in" for forms',
    category: 'Grammar',
    enabled: true,
  },
  {
    name: 'plural-form',
    description: 'Removes bracketed plurals like Asset(s) and uses plural form',
    category: 'Grammar',
    enabled: true,
  },
  {
    name: 'word-to-numeral',
    description: 'Converts number words to numerals (e.g., "three" to "3")',
    category: 'Numbers',
    enabled: true,
  },
  {
    name: 'unit-spacing',
    description: 'Ensures proper spacing between values and units',
    category: 'Units',
    enabled: true,
  },
  {
    name: 'exclamation-limit',
    description: 'Limits exclamation points to at most one per text',
    category: 'Punctuation',
    enabled: true,
  },
  {
    name: 'sentence-case',
    description: 'Converts ALL CAPS text to sentence case (preserving acronyms)',
    category: 'Capitalization',
    enabled: true,
  },
  {
    name: 'capitalize-first',
    description: 'Ensures text starts with a capital letter',
    category: 'Capitalization',
    enabled: true,
  },
  {
    name: 'create-not-new',
    description: 'Replaces "New {thing}" with "Create {thing}" for buttons',
    category: 'Buttons',
    enabled: true,
  },
  {
    name: 'remove-create-new',
    description: 'Replaces "Create new {thing}" with "Create {thing}"',
    category: 'Buttons',
    enabled: true,
  },
  {
    name: 'explicit-dialog-buttons',
    description: 'Replaces ambiguous "Yes"/"No" with explicit action verbs',
    category: 'Dialogs',
    enabled: true,
  },
  {
    name: 'remove-label-colons',
    description: 'Removes trailing colons from form field labels',
    category: 'Forms',
    enabled: true,
  },
];
