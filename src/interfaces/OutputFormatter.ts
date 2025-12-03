import { PersonaProfile } from '../types';

/**
 * Output Formatter Interface
 * Formats final output as valid JSON
 */
export interface OutputFormatter {
  format(persona: PersonaProfile): string;
}
