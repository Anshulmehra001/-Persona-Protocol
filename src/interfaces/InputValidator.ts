import { ValidationResult, WalletData } from '../types';

/**
 * Input Validator Interface
 * Validates and parses input JSON structure
 */
export interface InputValidator {
  validate(input: unknown): ValidationResult;
  parse(input: string): WalletData;
}
