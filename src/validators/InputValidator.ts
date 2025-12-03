import { ValidationResult, WalletData, Transaction, TransactionType } from '../types';
import { InputValidator as IInputValidator } from '../interfaces/InputValidator';

/**
 * InputValidator implementation
 * Requirements: 1.1, 1.4, 1.5
 */
export class InputValidator implements IInputValidator {
  private readonly VALID_TRANSACTION_TYPES: TransactionType[] = [
    'swap',
    'nft_mint',
    'stake',
    'provide_liquidity',
    'receive_airdrop',
    'governance_vote',
    'token_hold'
  ];

  /**
   * Validates input structure and content
   * Requirements: 1.1, 1.4, 1.5
   */
  validate(input: unknown): ValidationResult {
    const errors: string[] = [];

    // Check if input is an object
    if (typeof input !== 'object' || input === null) {
      errors.push('Input must be a valid object');
      return { isValid: false, errors };
    }

    const data = input as Record<string, unknown>;

    // Check for required walletAddress field
    if (!('walletAddress' in data)) {
      errors.push('Missing required field: walletAddress');
    } else if (typeof data.walletAddress !== 'string') {
      errors.push('walletAddress must be a string');
    } else if (data.walletAddress.trim() === '') {
      errors.push('walletAddress cannot be empty');
    }

    // Check for required transactions field
    if (!('transactions' in data)) {
      errors.push('Missing required field: transactions');
    } else if (!Array.isArray(data.transactions)) {
      errors.push('transactions must be an array');
    } else {
      // Validate each transaction
      const transactions = data.transactions as unknown[];
      transactions.forEach((tx, index) => {
        const txErrors = this.validateTransaction(tx, index);
        errors.push(...txErrors);
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates a single transaction
   * Requirements: 1.3, 1.4
   */
  private validateTransaction(tx: unknown, index: number): string[] {
    const errors: string[] = [];

    if (typeof tx !== 'object' || tx === null) {
      errors.push(`Transaction at index ${index} must be an object`);
      return errors;
    }

    const transaction = tx as Record<string, unknown>;

    // Check required fields
    if (!('hash' in transaction)) {
      errors.push(`Transaction at index ${index} missing required field: hash`);
    } else if (typeof transaction.hash !== 'string') {
      errors.push(`Transaction at index ${index}: hash must be a string`);
    }

    if (!('timestamp' in transaction)) {
      errors.push(`Transaction at index ${index} missing required field: timestamp`);
    } else if (typeof transaction.timestamp !== 'string') {
      errors.push(`Transaction at index ${index}: timestamp must be a string`);
    }

    if (!('type' in transaction)) {
      errors.push(`Transaction at index ${index} missing required field: type`);
    } else if (typeof transaction.type !== 'string') {
      errors.push(`Transaction at index ${index}: type must be a string`);
    } else if (!this.VALID_TRANSACTION_TYPES.includes(transaction.type as TransactionType)) {
      errors.push(
        `Transaction at index ${index}: invalid type "${transaction.type}". ` +
        `Must be one of: ${this.VALID_TRANSACTION_TYPES.join(', ')}`
      );
    }

    if (!('details' in transaction)) {
      errors.push(`Transaction at index ${index} missing required field: details`);
    } else if (typeof transaction.details !== 'object' || transaction.details === null) {
      errors.push(`Transaction at index ${index}: details must be an object`);
    }

    return errors;
  }

  /**
   * Parses JSON string and extracts wallet data
   * Requirements: 1.2, 1.3
   */
  parse(input: string): WalletData {
    let parsed: unknown;
    
    try {
      parsed = JSON.parse(input);
    } catch (error) {
      throw new Error(`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    const validationResult = this.validate(parsed);
    
    if (!validationResult.isValid) {
      throw new Error(`Validation failed: ${validationResult.errors.join('; ')}`);
    }

    const data = parsed as Record<string, unknown>;
    
    return {
      walletAddress: data.walletAddress as string,
      transactions: (data.transactions as unknown[]).map(tx => this.parseTransaction(tx))
    };
  }

  /**
   * Parses a single transaction object
   * Requirements: 1.3
   */
  private parseTransaction(tx: unknown): Transaction {
    const transaction = tx as Record<string, unknown>;
    
    return {
      hash: transaction.hash as string,
      timestamp: transaction.timestamp as string,
      type: transaction.type as TransactionType,
      details: transaction.details as Record<string, any>
    };
  }
}
