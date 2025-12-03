import { AnalysisResult } from '../types';

/**
 * Score Calculator Interface
 * Calculates risk appetite, loyalty, and activity scores
 */
export interface ScoreCalculator {
  calculateRiskAppetite(analysis: AnalysisResult): number;
  calculateLoyalty(analysis: AnalysisResult): number;
  calculateActivity(analysis: AnalysisResult): number;
}
