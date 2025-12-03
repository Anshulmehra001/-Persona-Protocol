/**
 * Persona Protocol - Web3 Wallet Analysis System
 * Main entry point
 */

export * from './types/index.js';
export * from './interfaces/index.js';

import { InputValidator } from './validators/InputValidator.js';
import { TransactionAnalyzer } from './analyzers/TransactionAnalyzer.js';
import { ScoreCalculator } from './calculators/ScoreCalculator.js';
import { PersonaGenerator } from './generators/PersonaGenerator.js';
import { OutputFormatter } from './formatters/OutputFormatter.js';
import { PersonaProfile } from './types/index.js';

/**
 * Main pipeline function that analyzes a wallet and generates a persona profile
 * Wires together validator, analyzer, calculator, generator, and formatter
 * Requirements: All requirements
 * 
 * @param inputJson - JSON string containing wallet address and transactions
 * @returns JSON string containing the persona profile
 * @throws Error if validation fails or processing encounters an error
 */
export function analyzeWallet(inputJson: string): string {
  try {
    // Step 1: Validate and parse input
    const validator = new InputValidator();
    const walletData = validator.parse(inputJson);

    // Step 2: Analyze transactions
    const analyzer = new TransactionAnalyzer();
    const analysisResult = analyzer.analyze(walletData.transactions);

    // Step 3: Calculate scores
    const calculator = new ScoreCalculator();
    const scores = {
      riskAppetite: calculator.calculateRiskAppetite(analysisResult),
      loyalty: calculator.calculateLoyalty(analysisResult),
      activity: calculator.calculateActivity(analysisResult),
    };

    // Step 4: Generate persona
    const generator = new PersonaGenerator();
    const personaProfile: PersonaProfile = {
      walletAddress: walletData.walletAddress,
      personaTitle: generator.generateTitle(scores, analysisResult),
      summary: generator.generateSummary(scores, analysisResult),
      scores,
      keyTraits: generator.generateTraits(scores, analysisResult),
      notableProtocols: generator.getNotableProtocols(analysisResult),
    };

    // Step 5: Format output
    const formatter = new OutputFormatter();
    return formatter.format(personaProfile);
  } catch (error) {
    // Error handling throughout pipeline
    if (error instanceof Error) {
      throw new Error(`Wallet analysis failed: ${error.message}`);
    }
    throw new Error('Wallet analysis failed: Unknown error');
  }
}
