import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { ScoreCalculator } from './ScoreCalculator';
import { 
  AnalysisResult, 
  LiquidityProvision, 
  TokenHolding, 
  StakeInfo,
  GovernanceVote,
  AirdropFlip
} from '../types';

describe('ScoreCalculator', () => {
  const calculator = new ScoreCalculator();

  // Generators for property-based testing
  const liquidityProvisionArb = fc.record({
    token1: fc.string({ minLength: 1, maxLength: 10 }),
    token2: fc.string({ minLength: 1, maxLength: 10 }),
    protocol: fc.string({ minLength: 1, maxLength: 20 }),
    isVolatile: fc.boolean()
  });

  const tokenHoldingArb = fc.record({
    token: fc.string({ minLength: 1, maxLength: 10 }),
    durationDays: fc.nat({ max: 1000 }),
    isBlueChip: fc.boolean()
  });

  const stakeInfoArb = fc.record({
    token: fc.string({ minLength: 1, maxLength: 10 }),
    protocol: fc.string({ minLength: 1, maxLength: 20 }),
    isEstablished: fc.boolean()
  });

  const governanceVoteArb = fc.record({
    protocol: fc.string({ minLength: 1, maxLength: 20 }),
    timestamp: fc.date().map(d => d.toISOString())
  });

  const airdropFlipArb = fc.record({
    token: fc.string({ minLength: 1, maxLength: 10 }),
    receivedAt: fc.date().map(d => d.toISOString()),
    swappedAt: fc.date().map(d => d.toISOString()),
    timeDelta: fc.nat({ max: 86400000 }) // up to 1 day in ms
  });

  const protocolFrequencyArb = fc.array(
    fc.tuple(
      fc.string({ minLength: 1, maxLength: 20 }),
      fc.nat({ max: 100 })
    ),
    { minLength: 0, maxLength: 20 }
  ).map(entries => new Map(entries));

  const holdDurationsArb = fc.array(
    fc.tuple(
      fc.string({ minLength: 1, maxLength: 10 }),
      fc.nat({ max: 1000 })
    ),
    { minLength: 0, maxLength: 50 }
  ).map(entries => new Map(entries));

  const analysisResultArb = fc.record({
    swapFrequency: fc.nat({ max: 100 }),
    newProtocolInteractions: fc.nat({ max: 50 }),
    liquidityProvisions: fc.array(liquidityProvisionArb, { maxLength: 20 }),
    blueChipHoldings: fc.array(tokenHoldingArb, { maxLength: 20 }),
    stableStakes: fc.array(stakeInfoArb, { maxLength: 20 }),
    holdDurations: holdDurationsArb,
    governanceVotes: fc.array(governanceVoteArb, { maxLength: 50 }),
    airdropFlips: fc.array(airdropFlipArb, { maxLength: 20 }),
    protocolFrequency: protocolFrequencyArb,
    nftTransactions: fc.nat({ max: 100 }),
    recentActivityCount: fc.nat({ max: 100 }),
    totalTransactions: fc.nat({ max: 1000 }),
    dormancyPeriods: fc.array(fc.nat({ max: 365 }), { maxLength: 20 })
  });

  /**
   * Feature: persona-protocol, Property 4: Score range invariant
   * Validates: Requirements 2.6, 3.6, 4.4
   */
  it('Property 4: all calculated scores should be integers in range [1, 100]', () => {
    fc.assert(
      fc.property(analysisResultArb, (analysis) => {
        const riskAppetite = calculator.calculateRiskAppetite(analysis);
        const loyalty = calculator.calculateLoyalty(analysis);
        const activity = calculator.calculateActivity(analysis);

        // All scores must be in range [1, 100]
        expect(riskAppetite).toBeGreaterThanOrEqual(1);
        expect(riskAppetite).toBeLessThanOrEqual(100);
        expect(loyalty).toBeGreaterThanOrEqual(1);
        expect(loyalty).toBeLessThanOrEqual(100);
        expect(activity).toBeGreaterThanOrEqual(1);
        expect(activity).toBeLessThanOrEqual(100);

        // All scores must be integers
        expect(Number.isInteger(riskAppetite)).toBe(true);
        expect(Number.isInteger(loyalty)).toBe(true);
        expect(Number.isInteger(activity)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: persona-protocol, Property 5: Risk score monotonicity - risky behaviors
   * Validates: Requirements 2.1, 2.2, 2.3
   */
  it('Property 5: adding risky behaviors should not decrease risk appetite score', () => {
    fc.assert(
      fc.property(
        analysisResultArb,
        fc.nat({ max: 10 }), // additional swaps
        fc.nat({ max: 5 }),  // additional new protocol interactions
        fc.nat({ max: 5 }),  // additional volatile LPs
        (baseAnalysis, additionalSwaps, additionalNewProtocols, additionalVolatileLPs) => {
          const baseScore = calculator.calculateRiskAppetite(baseAnalysis);

          // Create enhanced analysis with more risky behaviors
          const enhancedAnalysis: AnalysisResult = {
            ...baseAnalysis,
            swapFrequency: baseAnalysis.swapFrequency + additionalSwaps,
            newProtocolInteractions: baseAnalysis.newProtocolInteractions + additionalNewProtocols,
            liquidityProvisions: [
              ...baseAnalysis.liquidityProvisions,
              ...Array(additionalVolatileLPs).fill(null).map((_, i) => ({
                token1: `TOKEN${i}`,
                token2: `TOKEN${i + 1}`,
                protocol: `Protocol${i}`,
                isVolatile: true
              }))
            ]
          };

          const enhancedScore = calculator.calculateRiskAppetite(enhancedAnalysis);

          // Adding risky behaviors should not decrease the score
          expect(enhancedScore).toBeGreaterThanOrEqual(baseScore);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: persona-protocol, Property 6: Risk score monotonicity - safe behaviors
   * Validates: Requirements 2.4, 2.5
   */
  it('Property 6: adding safe behaviors should not increase risk appetite score', () => {
    fc.assert(
      fc.property(
        analysisResultArb,
        fc.nat({ max: 5 }), // additional blue-chip holdings
        fc.nat({ max: 5 }), // additional stable stakes
        (baseAnalysis, additionalBlueChips, additionalStableStakes) => {
          const baseScore = calculator.calculateRiskAppetite(baseAnalysis);

          // Create enhanced analysis with more safe behaviors
          const enhancedAnalysis: AnalysisResult = {
            ...baseAnalysis,
            blueChipHoldings: [
              ...baseAnalysis.blueChipHoldings,
              ...Array(additionalBlueChips).fill(null).map((_, i) => ({
                token: `BLUECHIP${i}`,
                durationDays: 100,
                isBlueChip: true
              }))
            ],
            stableStakes: [
              ...baseAnalysis.stableStakes,
              ...Array(additionalStableStakes).fill(null).map((_, i) => ({
                token: `STABLE${i}`,
                protocol: `EstablishedProtocol${i}`,
                isEstablished: true
              }))
            ]
          };

          const enhancedScore = calculator.calculateRiskAppetite(enhancedAnalysis);

          // Adding safe behaviors should not increase the score
          expect(enhancedScore).toBeLessThanOrEqual(baseScore);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: persona-protocol, Property 7: Loyalty score monotonicity - loyal behaviors
   * Validates: Requirements 3.1, 3.2, 3.3
   */
  it('Property 7: adding loyal behaviors should not decrease loyalty score', () => {
    fc.assert(
      fc.property(
        analysisResultArb,
        fc.integer({ min: 7, max: 365 }), // additional hold days (long holds only, >= 7 days)
        fc.nat({ max: 5 }),   // additional governance votes
        fc.nat({ max: 3 }),   // additional repeated protocols
        (baseAnalysis, additionalHoldDays, additionalVotes, additionalRepeatedProtocols) => {
          const baseScore = calculator.calculateLoyalty(baseAnalysis);

          // Create enhanced analysis with more loyal behaviors
          const newHoldDurations = new Map(baseAnalysis.holdDurations);
          newHoldDurations.set(`LONGHOLD`, additionalHoldDays); // Always add long hold

          const newProtocolFrequency = new Map(baseAnalysis.protocolFrequency);
          for (let i = 0; i < additionalRepeatedProtocols; i++) {
            newProtocolFrequency.set(`RepeatedProtocol${i}`, 5); // 5 interactions
          }

          const enhancedAnalysis: AnalysisResult = {
            ...baseAnalysis,
            holdDurations: newHoldDurations,
            governanceVotes: [
              ...baseAnalysis.governanceVotes,
              ...Array(additionalVotes).fill(null).map((_, i) => ({
                protocol: `Protocol${i}`,
                timestamp: new Date().toISOString()
              }))
            ],
            protocolFrequency: newProtocolFrequency
          };

          const enhancedScore = calculator.calculateLoyalty(enhancedAnalysis);

          // Adding loyal behaviors should not decrease the score
          expect(enhancedScore).toBeGreaterThanOrEqual(baseScore);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: persona-protocol, Property 8: Loyalty score monotonicity - disloyal behaviors
   * Validates: Requirements 3.4, 3.5
   */
  it('Property 8: adding disloyal behaviors should not increase loyalty score', () => {
    fc.assert(
      fc.property(
        analysisResultArb,
        fc.nat({ max: 5 }),   // additional airdrop flips
        fc.integer({ min: 1, max: 6 }), // additional short hold days (< 7 days)
        (baseAnalysis, additionalFlips, additionalShortHoldDays) => {
          const baseScore = calculator.calculateLoyalty(baseAnalysis);

          // Create enhanced analysis with more disloyal behaviors
          const newHoldDurations = new Map(baseAnalysis.holdDurations);
          newHoldDurations.set(`SHORTHOLD`, additionalShortHoldDays); // Add short hold

          const enhancedAnalysis: AnalysisResult = {
            ...baseAnalysis,
            holdDurations: newHoldDurations,
            airdropFlips: [
              ...baseAnalysis.airdropFlips,
              ...Array(additionalFlips).fill(null).map((_, i) => ({
                token: `AIRDROP${i}`,
                receivedAt: new Date().toISOString(),
                swappedAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour later
                timeDelta: 3600000
              }))
            ]
          };

          const enhancedScore = calculator.calculateLoyalty(enhancedAnalysis);

          // Adding disloyal behaviors should not increase the score
          expect(enhancedScore).toBeLessThanOrEqual(baseScore);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: persona-protocol, Property 9: Activity score monotonicity
   * Validates: Requirements 4.1, 4.2
   */
  it('Property 9: adding more transactions should not decrease activity score', () => {
    fc.assert(
      fc.property(
        analysisResultArb,
        fc.nat({ max: 20 }), // additional total transactions
        fc.nat({ max: 10 }), // additional recent transactions (last 30 days)
        (baseAnalysis, additionalTotal, additionalRecent) => {
          const baseScore = calculator.calculateActivity(baseAnalysis);

          // Create enhanced analysis with more transactions
          const enhancedAnalysis: AnalysisResult = {
            ...baseAnalysis,
            totalTransactions: baseAnalysis.totalTransactions + additionalTotal,
            recentActivityCount: baseAnalysis.recentActivityCount + additionalRecent
          };

          const enhancedScore = calculator.calculateActivity(enhancedAnalysis);

          // Adding more transactions should not decrease the score
          expect(enhancedScore).toBeGreaterThanOrEqual(baseScore);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: persona-protocol, Property 10: Dormancy decreases activity
   * Validates: Requirements 4.3
   */
  it('Property 10: increasing dormancy periods should not increase activity score', () => {
    fc.assert(
      fc.property(
        analysisResultArb,
        fc.nat({ max: 5 }), // additional long dormancy periods (> 90 days)
        (baseAnalysis, additionalLongDormancy) => {
          const baseScore = calculator.calculateActivity(baseAnalysis);

          // Create enhanced analysis with more long dormancy periods
          const enhancedAnalysis: AnalysisResult = {
            ...baseAnalysis,
            dormancyPeriods: [
              ...baseAnalysis.dormancyPeriods,
              ...Array(additionalLongDormancy).fill(null).map(() => 
                91 + Math.floor(Math.random() * 100) // Random dormancy > 90 days
              )
            ]
          };

          const enhancedScore = calculator.calculateActivity(enhancedAnalysis);

          // Adding dormancy periods should not increase the score
          expect(enhancedScore).toBeLessThanOrEqual(baseScore);
        }
      ),
      { numRuns: 100 }
    );
  });
});
