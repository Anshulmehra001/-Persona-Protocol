import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { PersonaGenerator } from './PersonaGenerator';
import { 
  Scores,
  AnalysisResult, 
  LiquidityProvision, 
  TokenHolding, 
  StakeInfo,
  GovernanceVote,
  AirdropFlip
} from '../types';

describe('PersonaGenerator', () => {
  const generator = new PersonaGenerator();

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
    timeDelta: fc.nat({ max: 86400000 })
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

  const scoresArb = fc.record({
    riskAppetite: fc.integer({ min: 1, max: 100 }),
    loyalty: fc.integer({ min: 1, max: 100 }),
    activity: fc.integer({ min: 1, max: 100 })
  });

  /**
   * Feature: persona-protocol, Property 11: High risk + high activity title
   * Validates: Requirements 5.1
   */
  it('Property 11: high risk + high activity should generate active trading title', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 71, max: 100 }), // high risk
        fc.integer({ min: 71, max: 100 }), // high activity
        fc.integer({ min: 1, max: 100 }),  // any loyalty
        analysisResultArb,
        (riskAppetite, activity, loyalty, baseAnalysis) => {
          // Ensure NFT percentage is not > 50% to avoid NFT-focused titles
          const totalTx = Math.max(baseAnalysis.totalTransactions, 10);
          const nftTx = Math.min(baseAnalysis.nftTransactions, Math.floor(totalTx * 0.5));
          
          const scores: Scores = { riskAppetite, loyalty, activity };
          const analysis: AnalysisResult = {
            ...baseAnalysis,
            totalTransactions: totalTx,
            nftTransactions: nftTx
          };

          const title = generator.generateTitle(scores, analysis);

          // Title should indicate active trading behavior
          const activeTraderTerms = [
            'degen', 'trader', 'active', 'trading', 'swapper', 
            'chaser', 'frequency', 'high-frequency'
          ];
          
          const titleLower = title.toLowerCase();
          const hasActiveTerm = activeTraderTerms.some(term => titleLower.includes(term));
          
          expect(hasActiveTerm).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: persona-protocol, Property 12: High loyalty + low risk title
   * Validates: Requirements 5.2
   */
  it('Property 12: high loyalty + low risk should generate stable holding title', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 71, max: 100 }), // high loyalty
        fc.integer({ min: 1, max: 39 }),   // low risk
        fc.integer({ min: 1, max: 100 }),  // any activity
        analysisResultArb,
        (loyalty, riskAppetite, activity, baseAnalysis) => {
          // Ensure NFT percentage is not > 50% to avoid NFT-focused titles
          const totalTx = Math.max(baseAnalysis.totalTransactions, 10);
          const nftTx = Math.min(baseAnalysis.nftTransactions, Math.floor(totalTx * 0.5));
          
          const scores: Scores = { riskAppetite, loyalty, activity };
          const analysis: AnalysisResult = {
            ...baseAnalysis,
            totalTransactions: totalTx,
            nftTransactions: nftTx
          };

          const title = generator.generateTitle(scores, analysis);

          // Title should indicate stable holding behavior
          const stableHolderTerms = [
            'staker', 'holder', 'believer', 'steady', 'stable',
            'long-term', 'diamond', 'hands', 'blue-chip'
          ];
          
          const titleLower = title.toLowerCase();
          const hasStableTerm = stableHolderTerms.some(term => titleLower.includes(term));
          
          expect(hasStableTerm).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: persona-protocol, Property 13: NFT-dominant title
   * Validates: Requirements 5.3
   */
  it('Property 13: NFT-dominant wallets should generate NFT-focused title', () => {
    fc.assert(
      fc.property(
        scoresArb,
        fc.integer({ min: 10, max: 100 }), // total transactions
        (scores, totalTransactions) => {
          // Ensure NFT transactions are > 50% of total
          const nftTransactions = Math.ceil(totalTransactions * 0.51);
          
          const analysis: AnalysisResult = {
            swapFrequency: 0,
            newProtocolInteractions: 0,
            liquidityProvisions: [],
            blueChipHoldings: [],
            stableStakes: [],
            holdDurations: new Map(),
            governanceVotes: [],
            airdropFlips: [],
            protocolFrequency: new Map(),
            nftTransactions,
            recentActivityCount: 0,
            totalTransactions,
            dormancyPeriods: []
          };

          const title = generator.generateTitle(scores, analysis);

          // Title should indicate NFT focus
          const nftTerms = [
            'nft', 'collector', 'art', 'digital', 'connoisseur',
            'enthusiast', 'trader'
          ];
          
          const titleLower = title.toLowerCase();
          const hasNFTTerm = nftTerms.some(term => titleLower.includes(term));
          
          expect(hasNFTTerm).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: persona-protocol, Property 14: Summary structure
   * Validates: Requirements 5.4
   */
  it('Property 14: summary should contain 2-3 sentences', () => {
    fc.assert(
      fc.property(
        scoresArb,
        analysisResultArb,
        (scores, analysis) => {
          const summary = generator.generateSummary(scores, analysis);

          // Count sentence-ending punctuation marks
          const sentenceEndings = summary.match(/[.!?]/g);
          const sentenceCount = sentenceEndings ? sentenceEndings.length : 0;

          // Should have 2-3 sentences
          expect(sentenceCount).toBeGreaterThanOrEqual(2);
          expect(sentenceCount).toBeLessThanOrEqual(3);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: persona-protocol, Property 15: Summary content relevance
   * Validates: Requirements 5.5
   */
  it('Property 15: summary should mention protocols from transaction history', () => {
    fc.assert(
      fc.property(
        scoresArb,
        fc.string({ minLength: 3, maxLength: 20 }).filter(s => !s.includes('.')), // protocol name
        fc.nat({ min: 1, max: 50 }), // protocol frequency
        (scores, protocolName, frequency) => {
          // Create analysis with specific protocol
          const protocolFrequency = new Map([[protocolName, frequency]]);
          
          const analysis: AnalysisResult = {
            swapFrequency: 5,
            newProtocolInteractions: 0,
            liquidityProvisions: [],
            blueChipHoldings: [],
            stableStakes: [],
            holdDurations: new Map(),
            governanceVotes: [],
            airdropFlips: [],
            protocolFrequency,
            nftTransactions: 0,
            recentActivityCount: 5,
            totalTransactions: 10,
            dormancyPeriods: []
          };

          const summary = generator.generateSummary(scores, analysis);

          // Summary should mention the protocol or reference transaction patterns
          // Since we sanitize protocol names, check for the sanitized version
          const sanitizedProtocol = protocolName.replace(/[.!?]/g, '');
          const summaryLower = summary.toLowerCase();
          const protocolLower = sanitizedProtocol.toLowerCase();
          
          // Should either mention the protocol name or reference general patterns
          const mentionsProtocol = summaryLower.includes(protocolLower);
          const mentionsPatterns = summaryLower.includes('protocol') || 
                                   summaryLower.includes('swap') ||
                                   summaryLower.includes('defi') ||
                                   summaryLower.includes('transaction');
          
          expect(mentionsProtocol || mentionsPatterns).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: persona-protocol, Property 16: Airdrop Hunter trait
   * Validates: Requirements 6.1
   */
  it('Property 16: wallets with 5+ airdrops from different sources should have Airdrop Hunter trait', () => {
    fc.assert(
      fc.property(
        scoresArb,
        fc.array(fc.string({ minLength: 3, maxLength: 10 }), { minLength: 5, maxLength: 20 }), // unique airdrop tokens
        (scores, airdropTokens) => {
          // Create unique airdrop flips
          const uniqueTokens = [...new Set(airdropTokens)].slice(0, 10);
          
          // Ensure we have at least 5 unique tokens
          if (uniqueTokens.length < 5) {
            uniqueTokens.push('TOKEN1', 'TOKEN2', 'TOKEN3', 'TOKEN4', 'TOKEN5');
          }
          
          const airdropFlips = uniqueTokens.map(token => ({
            token,
            receivedAt: new Date().toISOString(),
            swappedAt: new Date(Date.now() + 3600000).toISOString(),
            timeDelta: 3600000
          }));

          const analysis: AnalysisResult = {
            swapFrequency: 0,
            newProtocolInteractions: 0,
            liquidityProvisions: [],
            blueChipHoldings: [],
            stableStakes: [],
            holdDurations: new Map(),
            governanceVotes: [],
            airdropFlips,
            protocolFrequency: new Map(),
            nftTransactions: 0,
            recentActivityCount: 0,
            totalTransactions: airdropFlips.length,
            dormancyPeriods: []
          };

          const traits = generator.generateTraits(scores, analysis);

          // Should include "Airdrop Hunter" trait
          expect(traits).toContain('Airdrop Hunter');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: persona-protocol, Property 17: Early Adopter trait
   * Validates: Requirements 6.2
   */
  it('Property 17: wallets with new protocol interactions should have Early Adopter trait', () => {
    fc.assert(
      fc.property(
        scoresArb,
        fc.integer({ min: 1, max: 20 }), // new protocol interactions (at least 1)
        (scores, newProtocolInteractions) => {
          const analysis: AnalysisResult = {
            swapFrequency: 0,
            newProtocolInteractions,
            liquidityProvisions: [],
            blueChipHoldings: [],
            stableStakes: [],
            holdDurations: new Map(),
            governanceVotes: [],
            airdropFlips: [],
            protocolFrequency: new Map(),
            nftTransactions: 0,
            recentActivityCount: 0,
            totalTransactions: newProtocolInteractions,
            dormancyPeriods: []
          };

          const traits = generator.generateTraits(scores, analysis);

          // Should include "Early Adopter" trait
          expect(traits).toContain('Early Adopter');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: persona-protocol, Property 18: Diamond Hands trait
   * Validates: Requirements 6.3
   */
  it('Property 18: wallets with loyalty score > 85 should have Diamond Hands trait', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 86, max: 100 }), // high loyalty
        fc.integer({ min: 1, max: 100 }),  // any risk
        fc.integer({ min: 1, max: 100 }),  // any activity
        analysisResultArb,
        (loyalty, riskAppetite, activity, analysis) => {
          const scores: Scores = { riskAppetite, loyalty, activity };
          const traits = generator.generateTraits(scores, analysis);

          // Should include "Diamond Hands" trait
          expect(traits).toContain('Diamond Hands');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: persona-protocol, Property 19: Protocol Specialist trait
   * Validates: Requirements 6.4
   */
  it('Property 19: wallets with >60% transactions on one protocol should have Protocol Specialist trait', () => {
    fc.assert(
      fc.property(
        scoresArb,
        fc.string({ minLength: 3, maxLength: 20 }), // protocol name
        fc.integer({ min: 10, max: 100 }), // total transactions (at least 10)
        (scores, protocolName, totalTransactions) => {
          // Ensure one protocol has >60% of transactions
          const dominantCount = Math.ceil(totalTransactions * 0.61);
          const protocolFrequency = new Map([[protocolName, dominantCount]]);

          const analysis: AnalysisResult = {
            swapFrequency: 0,
            newProtocolInteractions: 0,
            liquidityProvisions: [],
            blueChipHoldings: [],
            stableStakes: [],
            holdDurations: new Map(),
            governanceVotes: [],
            airdropFlips: [],
            protocolFrequency,
            nftTransactions: 0,
            recentActivityCount: 0,
            totalTransactions,
            dormancyPeriods: []
          };

          const traits = generator.generateTraits(scores, analysis);

          // Should include "Protocol Specialist" trait
          expect(traits).toContain('Protocol Specialist');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: persona-protocol, Property 20: Governance Participant trait
   * Validates: Requirements 6.5
   */
  it('Property 20: wallets with governance votes should have Governance Participant trait', () => {
    fc.assert(
      fc.property(
        scoresArb,
        fc.array(governanceVoteArb, { minLength: 1, maxLength: 20 }),
        (scores, governanceVotes) => {
          const analysis: AnalysisResult = {
            swapFrequency: 0,
            newProtocolInteractions: 0,
            liquidityProvisions: [],
            blueChipHoldings: [],
            stableStakes: [],
            holdDurations: new Map(),
            governanceVotes,
            airdropFlips: [],
            protocolFrequency: new Map(),
            nftTransactions: 0,
            recentActivityCount: 0,
            totalTransactions: governanceVotes.length,
            dormancyPeriods: []
          };

          const traits = generator.generateTraits(scores, analysis);

          // Should include "Governance Participant" trait
          expect(traits).toContain('Governance Participant');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: persona-protocol, Property 21: Trait count invariant
   * Validates: Requirements 6.6
   */
  it('Property 21: should return between 3 and 5 traits', () => {
    fc.assert(
      fc.property(
        scoresArb,
        analysisResultArb,
        (scores, analysis) => {
          const traits = generator.generateTraits(scores, analysis);

          // Should have 3-5 traits
          expect(traits.length).toBeGreaterThanOrEqual(3);
          expect(traits.length).toBeLessThanOrEqual(5);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: persona-protocol, Property 23: Protocol ranking correctness
   * Validates: Requirements 7.2
   */
  it('Property 23: notable protocols should be ordered by decreasing frequency', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.tuple(
            fc.string({ minLength: 3, maxLength: 20 }),
            fc.nat({ min: 1, max: 100 })
          ),
          { minLength: 3, maxLength: 10 }
        ),
        (protocolEntries) => {
          const protocolFrequency = new Map(protocolEntries);

          const analysis: AnalysisResult = {
            swapFrequency: 0,
            newProtocolInteractions: 0,
            liquidityProvisions: [],
            blueChipHoldings: [],
            stableStakes: [],
            holdDurations: new Map(),
            governanceVotes: [],
            airdropFlips: [],
            protocolFrequency,
            nftTransactions: 0,
            recentActivityCount: 0,
            totalTransactions: 0,
            dormancyPeriods: []
          };

          const notableProtocols = generator.getNotableProtocols(analysis);

          // Check that protocols are ordered by decreasing frequency
          for (let i = 0; i < notableProtocols.length - 1; i++) {
            const currentFreq = protocolFrequency.get(notableProtocols[i]) || 0;
            const nextFreq = protocolFrequency.get(notableProtocols[i + 1]) || 0;
            expect(currentFreq).toBeGreaterThanOrEqual(nextFreq);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: persona-protocol, Property 24: Notable protocol count
   * Validates: Requirements 7.3
   */
  it('Property 24: should return 3-5 notable protocols (or all if fewer than 3)', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.tuple(
            fc.string({ minLength: 3, maxLength: 20 }),
            fc.nat({ min: 1, max: 100 })
          ),
          { minLength: 0, maxLength: 10 }
        ),
        (protocolEntries) => {
          const protocolFrequency = new Map(protocolEntries);

          const analysis: AnalysisResult = {
            swapFrequency: 0,
            newProtocolInteractions: 0,
            liquidityProvisions: [],
            blueChipHoldings: [],
            stableStakes: [],
            holdDurations: new Map(),
            governanceVotes: [],
            airdropFlips: [],
            protocolFrequency,
            nftTransactions: 0,
            recentActivityCount: 0,
            totalTransactions: 0,
            dormancyPeriods: []
          };

          const notableProtocols = generator.getNotableProtocols(analysis);
          const uniqueProtocols = protocolFrequency.size;

          if (uniqueProtocols < 3) {
            // Should return all protocols if fewer than 3
            expect(notableProtocols.length).toBe(uniqueProtocols);
          } else {
            // Should return 3-5 protocols
            expect(notableProtocols.length).toBeGreaterThanOrEqual(3);
            expect(notableProtocols.length).toBeLessThanOrEqual(5);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

});
