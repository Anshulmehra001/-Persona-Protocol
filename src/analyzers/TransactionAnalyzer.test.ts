import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { TransactionAnalyzer } from './TransactionAnalyzer';
import { Transaction, TransactionType } from '../types';

describe('TransactionAnalyzer', () => {
  const analyzer = new TransactionAnalyzer();

  /**
   * Feature: persona-protocol, Property 22: Protocol frequency accuracy
   * Validates: Requirements 7.1
   * 
   * For any wallet with known transaction distribution across protocols,
   * the calculated protocol frequencies should exactly match the actual
   * count of transactions per protocol.
   */
  describe('Property 22: Protocol frequency accuracy', () => {
    it('should accurately count protocol frequencies for any transaction set', () => {
      // Generator for protocol names
      const protocolArb = fc.constantFrom(
        'Uniswap',
        'Aave',
        'Lido',
        'Compound',
        'Curve',
        'Sushiswap',
        'Balancer'
      );

      // Generator for transaction types
      const transactionTypeArb = fc.constantFrom<TransactionType>(
        'swap',
        'nft_mint',
        'stake',
        'provide_liquidity',
        'receive_airdrop',
        'governance_vote',
        'token_hold'
      );

      // Generator for transactions with protocols
      const transactionArb = fc.record({
        hash: fc.hexaString({ minLength: 64, maxLength: 64 }),
        timestamp: fc.date({ min: new Date('2020-01-01'), max: new Date() }).map(d => d.toISOString()),
        type: transactionTypeArb,
        details: fc.record({
          protocol: fc.option(protocolArb, { nil: undefined }),
        }),
      }) as fc.Arbitrary<Transaction>;

      // Generator for array of transactions
      const transactionsArb = fc.array(transactionArb, { minLength: 0, maxLength: 100 });

      fc.assert(
        fc.property(transactionsArb, (transactions) => {
          // Calculate expected frequencies manually
          const expectedFrequency = new Map<string, number>();
          transactions.forEach(tx => {
            const protocol = tx.details.protocol;
            if (protocol) {
              expectedFrequency.set(protocol, (expectedFrequency.get(protocol) || 0) + 1);
            }
          });

          // Get actual frequencies from analyzer
          const result = analyzer.analyze(transactions);
          const actualFrequency = result.protocolFrequency;

          // Verify all expected protocols are present with correct counts
          for (const [protocol, expectedCount] of expectedFrequency.entries()) {
            expect(actualFrequency.get(protocol)).toBe(expectedCount);
          }

          // Verify no extra protocols are present
          for (const [protocol, actualCount] of actualFrequency.entries()) {
            expect(expectedFrequency.get(protocol)).toBe(actualCount);
          }

          // Verify sizes match
          expect(actualFrequency.size).toBe(expectedFrequency.size);

          return true;
        }),
        { numRuns: 100 }
      );
    });
  });
});
