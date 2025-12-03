import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { InputValidator } from './InputValidator';
import { TransactionType, WalletData } from '../types';

describe('InputValidator', () => {
  const validator = new InputValidator();

  // Generators for property-based testing
  const transactionTypeArb = fc.constantFrom<TransactionType>(
    'swap',
    'nft_mint',
    'stake',
    'provide_liquidity',
    'receive_airdrop',
    'governance_vote',
    'token_hold'
  );

  const transactionDetailsArb = fc.record({
    protocol: fc.option(fc.string(), { nil: undefined }),
    is_new_protocol: fc.option(fc.boolean(), { nil: undefined }),
  }, { requiredKeys: [] }).chain(base =>
    fc.dictionary(fc.string(), fc.anything()).map(extra => ({ ...base, ...extra }))
  );

  const transactionArb = fc.record({
    hash: fc.hexaString({ minLength: 64, maxLength: 64 }),
    timestamp: fc.date().map(d => d.toISOString()),
    type: transactionTypeArb,
    details: transactionDetailsArb
  });

  const walletAddressArb = fc.hexaString({ minLength: 40, maxLength: 42 })
    .map(hex => hex.startsWith('0x') ? hex : `0x${hex}`);

  const validWalletDataArb = fc.record({
    walletAddress: walletAddressArb,
    transactions: fc.array(transactionArb, { minLength: 0, maxLength: 100 })
  });

  /**
   * Feature: persona-protocol, Property 1: Valid input acceptance
   * Validates: Requirements 1.1, 1.2, 1.3
   */
  it('Property 1: should accept any well-formed JSON with walletAddress and valid transactions', () => {
    fc.assert(
      fc.property(validWalletDataArb, (walletData) => {
        const result = validator.validate(walletData);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: persona-protocol, Property 2: Invalid input rejection
   * Validates: Requirements 1.5
   */
  it('Property 2: should reject JSON missing required fields or with malformed data', () => {
    // Generator for invalid wallet data
    const invalidWalletDataArb = fc.oneof(
      // Missing walletAddress
      fc.record({
        transactions: fc.array(transactionArb)
      }),
      // Missing transactions
      fc.record({
        walletAddress: walletAddressArb
      }),
      // Empty walletAddress
      fc.record({
        walletAddress: fc.constant(''),
        transactions: fc.array(transactionArb)
      }),
      // Non-array transactions
      fc.record({
        walletAddress: walletAddressArb,
        transactions: fc.string()
      }),
      // Transaction missing required fields
      fc.record({
        walletAddress: walletAddressArb,
        transactions: fc.array(
          fc.oneof(
            // Missing hash
            fc.record({
              timestamp: fc.date().map(d => d.toISOString()),
              type: transactionTypeArb,
              details: transactionDetailsArb
            }),
            // Missing timestamp
            fc.record({
              hash: fc.hexaString({ minLength: 64, maxLength: 64 }),
              type: transactionTypeArb,
              details: transactionDetailsArb
            }),
            // Missing type
            fc.record({
              hash: fc.hexaString({ minLength: 64, maxLength: 64 }),
              timestamp: fc.date().map(d => d.toISOString()),
              details: transactionDetailsArb
            }),
            // Missing details
            fc.record({
              hash: fc.hexaString({ minLength: 64, maxLength: 64 }),
              timestamp: fc.date().map(d => d.toISOString()),
              type: transactionTypeArb
            })
          ),
          { minLength: 1 }
        )
      })
    );

    fc.assert(
      fc.property(invalidWalletDataArb, (invalidData) => {
        const result = validator.validate(invalidData);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Unit test for parse method
   * Requirements: 1.2, 1.3
   */
  it('should parse valid JSON string and extract wallet data', () => {
    const jsonInput = JSON.stringify({
      walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
      transactions: [
        {
          hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
          timestamp: '2024-01-01T00:00:00.000Z',
          type: 'swap',
          details: {
            protocol: 'Uniswap',
            is_new_protocol: false
          }
        }
      ]
    });

    const result = validator.parse(jsonInput);
    
    expect(result.walletAddress).toBe('0x1234567890abcdef1234567890abcdef12345678');
    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0].hash).toBe('0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890');
    expect(result.transactions[0].type).toBe('swap');
    expect(result.transactions[0].details.protocol).toBe('Uniswap');
  });

  it('should throw error for invalid JSON string', () => {
    const invalidJson = '{ invalid json }';
    expect(() => validator.parse(invalidJson)).toThrow('Invalid JSON');
  });

  it('should throw error for JSON with validation errors', () => {
    const jsonWithMissingField = JSON.stringify({
      transactions: []
    });
    expect(() => validator.parse(jsonWithMissingField)).toThrow('Validation failed');
  });

  /**
   * Feature: persona-protocol, Property 3: Transaction type validation
   * Validates: Requirements 1.4
   */
  it('Property 3: should accept transaction if and only if type is one of seven supported types', () => {
    const validTypes: TransactionType[] = [
      'swap',
      'nft_mint',
      'stake',
      'provide_liquidity',
      'receive_airdrop',
      'governance_vote',
      'token_hold'
    ];

    // Test valid types - should be accepted
    fc.assert(
      fc.property(
        walletAddressArb,
        fc.constantFrom(...validTypes),
        fc.hexaString({ minLength: 64, maxLength: 64 }),
        fc.date().map(d => d.toISOString()),
        transactionDetailsArb,
        (walletAddress, type, hash, timestamp, details) => {
          const walletData = {
            walletAddress,
            transactions: [{
              hash,
              timestamp,
              type,
              details
            }]
          };
          const result = validator.validate(walletData);
          expect(result.isValid).toBe(true);
          expect(result.errors).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );

    // Test invalid types - should be rejected
    const invalidTypeArb = fc.string().filter(s => !validTypes.includes(s as TransactionType));
    
    fc.assert(
      fc.property(
        walletAddressArb,
        invalidTypeArb,
        fc.hexaString({ minLength: 64, maxLength: 64 }),
        fc.date().map(d => d.toISOString()),
        transactionDetailsArb,
        (walletAddress, type, hash, timestamp, details) => {
          const walletData = {
            walletAddress,
            transactions: [{
              hash,
              timestamp,
              type,
              details
            }]
          };
          const result = validator.validate(walletData);
          expect(result.isValid).toBe(false);
          expect(result.errors.some(err => err.includes('invalid type'))).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
