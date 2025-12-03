import { Scores, AnalysisResult } from '../types';

/**
 * Persona Generator Interface
 * Generates persona title, summary, and traits
 */
export interface PersonaGenerator {
  generateTitle(scores: Scores, analysis: AnalysisResult): string;
  generateSummary(scores: Scores, analysis: AnalysisResult): string;
  generateTraits(scores: Scores, analysis: AnalysisResult): string[];
  getNotableProtocols(analysis: AnalysisResult): string[];
}
