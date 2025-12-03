import { OutputFormatter as IOutputFormatter } from '../interfaces/OutputFormatter';
import { PersonaProfile } from '../types';

/**
 * OutputFormatter implementation
 * Formats persona profile as valid JSON
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */
export class OutputFormatter implements IOutputFormatter {
  /**
   * Format persona profile as valid JSON string
   * Ensures output contains only JSON with no additional text
   * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
   */
  format(persona: PersonaProfile): string {
    // Validate output structure before returning
    this.validateStructure(persona);

    // Create output object with exact structure required
    const output = {
      walletAddress: persona.walletAddress,
      personaTitle: persona.personaTitle,
      summary: persona.summary,
      scores: {
        riskAppetite: persona.scores.riskAppetite,
        loyalty: persona.scores.loyalty,
        activity: persona.scores.activity,
      },
      keyTraits: persona.keyTraits,
      notableProtocols: persona.notableProtocols,
    };

    // Serialize to JSON with no additional text
    return JSON.stringify(output);
  }

  /**
   * Validate output structure completeness
   * Requirements: 8.2, 8.3
   */
  private validateStructure(persona: PersonaProfile): void {
    // Check required fields exist
    if (!persona.walletAddress || typeof persona.walletAddress !== 'string') {
      throw new Error('Invalid output: walletAddress must be a non-empty string');
    }

    if (!persona.personaTitle || typeof persona.personaTitle !== 'string') {
      throw new Error('Invalid output: personaTitle must be a non-empty string');
    }

    if (!persona.summary || typeof persona.summary !== 'string') {
      throw new Error('Invalid output: summary must be a non-empty string');
    }

    // Validate scores object
    if (!persona.scores || typeof persona.scores !== 'object') {
      throw new Error('Invalid output: scores must be an object');
    }

    // Validate score field types (must be integers)
    if (!Number.isInteger(persona.scores.riskAppetite) ||
        persona.scores.riskAppetite < 1 || 
        persona.scores.riskAppetite > 100) {
      throw new Error('Invalid output: riskAppetite must be an integer between 1 and 100');
    }

    if (!Number.isInteger(persona.scores.loyalty) ||
        persona.scores.loyalty < 1 || 
        persona.scores.loyalty > 100) {
      throw new Error('Invalid output: loyalty must be an integer between 1 and 100');
    }

    if (!Number.isInteger(persona.scores.activity) ||
        persona.scores.activity < 1 || 
        persona.scores.activity > 100) {
      throw new Error('Invalid output: activity must be an integer between 1 and 100');
    }

    // Validate arrays
    if (!Array.isArray(persona.keyTraits)) {
      throw new Error('Invalid output: keyTraits must be an array');
    }

    if (!Array.isArray(persona.notableProtocols)) {
      throw new Error('Invalid output: notableProtocols must be an array');
    }
  }
}
