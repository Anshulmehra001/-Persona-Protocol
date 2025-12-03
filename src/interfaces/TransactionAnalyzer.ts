import { Transaction, AnalysisResult } from '../types';

/**
 * Transaction Analyzer Interface
 * Extracts behavioral signals from transaction history
 */
export interface TransactionAnalyzer {
  analyze(transactions: Transaction[]): AnalysisResult;
}
