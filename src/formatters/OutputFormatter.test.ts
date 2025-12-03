import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { OutputFormatter } from './OutputFormatter';
import { PersonaProfile } from '../types';

describe('OutputFormatter', () => {
  const formatter = new OutputFormatter();

  // Generators for property-based testing
  const walletAddressArb = fc.hexaString({ minLength: 40, maxLength: 42 })
    .map(hex => hex.startsWith('0x') ? hex : `0x${hex}`);

  const scoreArb = fc.integer({ min: 1, max: 100 });

  const scoresArb = fc.record({
    riskAppetite: scoreArb,
    loyalty: scoreArb,
    activity: scoreArb,
  });

  const personaTitleArb = fc.oneof(
    fc.constant('DeFi Degen'),
    fc.constant('Active Trader'),
    fc.constant('Steady Staker'),
    fc.constant('Blue-Chip Believer'),
    fc.constant('NFT Connoisseur'),
    fc.constant('Digital Art Collector'),
    fc.constant('Balanced Investor'),
  );

  const summaryArb = fc.string({ minLength: 50, maxLength: 500 })
    .map(s => s + '. ' + s + '.');

  const traitsArb = fc.array(
    fc.oneof(
      fc.constant('Airdrop Hunter'),
      fc.constant('Early Adopter'),
      fc.constant('Diamond Hands'),
      fc.constant('Protocol Specialist'),
      fc.constant('Governance Participant'),
      fc.constant('NFT Enthusiast'),
      fc.constant('Active Trader'),
      fc.constant('Liquidity Provider'),
    ),
    { minLength: 3, maxLength: 5 }
  );

  const protocolsArb = fc.array(
    fc.oneof(
      fc.constant('Uniswap'),
      fc.constant('Aave'),
      fc.constant('Lido'),
      fc.constant('Compound'),
      fc.constant('Curve'),
      fc.constant('MakerDAO'),
    ),
    { minLength: 0, maxLength: 5 }
  );

  const validPersonaProfileArb = fc.record({
    walletAddress: walletAddressArb,
    personaTitle: personaTitleArb,
    summary: summaryArb,
    scores: scoresArb,
    keyTraits: traitsArb,
    notableProtocols: protocolsArb,
  });

  /**
   * Feature: persona-protocol, Property 25: JSON validity
   * Validates: Requirements 8.1, 8.4
   */
  it('Property 25: should generate valid JSON that can be parsed without errors', () => {
    fc.assert(
      fc.property(validPersonaProfileArb, (persona) => {
        const output = formatter.format(persona);
        
        // Should not throw when parsing
        let parsed;
        expect(() => {
          parsed = JSON.parse(output);
        }).not.toThrow();
        
        // Parsed result should be an object
        expect(typeof parsed).toBe('object');
        expect(parsed).not.toBeNull();
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: persona-protocol, Property 26: Output structure completeness
   * Validates: Requirements 8.2
   */
  it('Property 26: should include exactly the required top-level fields', () => {
    fc.assert(
      fc.property(validPersonaProfileArb, (persona) => {
        const output = formatter.format(persona);
        const parsed = JSON.parse(output);
        
        // Check all required fields exist
        expect(parsed).toHaveProperty('walletAddress');
        expect(parsed).toHaveProperty('personaTitle');
        expect(parsed).toHaveProperty('summary');
        expect(parsed).toHaveProperty('scores');
        expect(parsed).toHaveProperty('keyTraits');
        expect(parsed).toHaveProperty('notableProtocols');
        
        // Check exactly these fields (no extra fields)
        const keys = Object.keys(parsed);
        expect(keys).toHaveLength(6);
        expect(keys).toContain('walletAddress');
        expect(keys).toContain('personaTitle');
        expect(keys).toContain('summary');
        expect(keys).toContain('scores');
        expect(keys).toContain('keyTraits');
        expect(keys).toContain('notableProtocols');
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: persona-protocol, Property 27: Score field types
   * Validates: Requirements 8.3
   */
  it('Property 27: should have scores object with integer values for riskAppetite, loyalty, and activity', () => {
    fc.assert(
      fc.property(validPersonaProfileArb, (persona) => {
        const output = formatter.format(persona);
        const parsed = JSON.parse(output);
        
        // Check scores object exists and has correct structure
        expect(parsed.scores).toBeDefined();
        expect(typeof parsed.scores).toBe('object');
        
        // Check all three score fields exist and are integers
        expect(parsed.scores).toHaveProperty('riskAppetite');
        expect(parsed.scores).toHaveProperty('loyalty');
        expect(parsed.scores).toHaveProperty('activity');
        
        expect(Number.isInteger(parsed.scores.riskAppetite)).toBe(true);
        expect(Number.isInteger(parsed.scores.loyalty)).toBe(true);
        expect(Number.isInteger(parsed.scores.activity)).toBe(true);
        
        // Verify values are in valid range
        expect(parsed.scores.riskAppetite).toBeGreaterThanOrEqual(1);
        expect(parsed.scores.riskAppetite).toBeLessThanOrEqual(100);
        expect(parsed.scores.loyalty).toBeGreaterThanOrEqual(1);
        expect(parsed.scores.loyalty).toBeLessThanOrEqual(100);
        expect(parsed.scores.activity).toBeGreaterThanOrEqual(1);
        expect(parsed.scores.activity).toBeLessThanOrEqual(100);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: persona-protocol, Property 28: Output purity
   * Validates: Requirements 8.5
   */
  it('Property 28: should contain only JSON with no additional text or commentary', () => {
    fc.assert(
      fc.property(validPersonaProfileArb, (persona) => {
        const output = formatter.format(persona);
        
        // Output should start with { and end with }
        expect(output.trim().startsWith('{')).toBe(true);
        expect(output.trim().endsWith('}')).toBe(true);
        
        // Should be parseable as JSON
        const parsed = JSON.parse(output);
        
        // Re-stringifying should produce equivalent output (no extra text)
        const reparsed = JSON.stringify(parsed);
        expect(JSON.parse(output)).toEqual(JSON.parse(reparsed));
        
        // Should not contain common commentary patterns
        expect(output).not.toMatch(/^[^{].*{/); // No text before opening brace
        expect(output).not.toMatch(/}.*[^}]$/); // No text after closing brace
      }),
      { numRuns: 100 }
    );
  });

  // Unit tests for edge cases and error handling
  it('should throw error for invalid walletAddress', () => {
    const invalidPersona: PersonaProfile = {
      walletAddress: '',
      personaTitle: 'Test',
      summary: 'Test summary.',
      scores: { riskAppetite: 50, loyalty: 50, activity: 50 },
      keyTraits: ['Trait1', 'Trait2', 'Trait3'],
      notableProtocols: ['Protocol1'],
    };

    expect(() => formatter.format(invalidPersona)).toThrow('walletAddress');
  });

  it('should throw error for invalid score values', () => {
    const invalidPersona: PersonaProfile = {
      walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
      personaTitle: 'Test',
      summary: 'Test summary.',
      scores: { riskAppetite: 150, loyalty: 50, activity: 50 }, // Invalid: > 100
      keyTraits: ['Trait1', 'Trait2', 'Trait3'],
      notableProtocols: ['Protocol1'],
    };

    expect(() => formatter.format(invalidPersona)).toThrow('riskAppetite');
  });

  it('should throw error for non-integer scores', () => {
    const invalidPersona: any = {
      walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
      personaTitle: 'Test',
      summary: 'Test summary.',
      scores: { riskAppetite: 50.5, loyalty: 50, activity: 50 }, // Invalid: not integer
      keyTraits: ['Trait1', 'Trait2', 'Trait3'],
      notableProtocols: ['Protocol1'],
    };

    expect(() => formatter.format(invalidPersona)).toThrow('riskAppetite');
  });

  it('should format valid persona profile correctly', () => {
    const persona: PersonaProfile = {
      walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
      personaTitle: 'DeFi Degen',
      summary: 'This wallet exhibits highly active trading behavior. The wallet frequently swaps tokens.',
      scores: { riskAppetite: 85, loyalty: 45, activity: 90 },
      keyTraits: ['Active Trader', 'Risk Taker', 'Early Adopter'],
      notableProtocols: ['Uniswap', 'Aave', 'Curve'],
    };

    const output = formatter.format(persona);
    const parsed = JSON.parse(output);

    expect(parsed.walletAddress).toBe(persona.walletAddress);
    expect(parsed.personaTitle).toBe(persona.personaTitle);
    expect(parsed.summary).toBe(persona.summary);
    expect(parsed.scores).toEqual(persona.scores);
    expect(parsed.keyTraits).toEqual(persona.keyTraits);
    expect(parsed.notableProtocols).toEqual(persona.notableProtocols);
  });
});
