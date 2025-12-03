import { ScoreCalculator as IScoreCalculator } from '../interfaces/ScoreCalculator';
import { AnalysisResult } from '../types';

/**
 * Score Calculator Implementation
 * Calculates risk appetite, loyalty, and activity scores based on transaction analysis
 * Requirements: 2.1-2.6, 3.1-3.6, 4.1-4.4
 */
export class ScoreCalculator implements IScoreCalculator {
  /**
   * Calculate risk appetite score (1-100)
   * Higher scores indicate more risky behavior
   * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
   */
  calculateRiskAppetite(analysis: AnalysisResult): number {
    let score = 50; // Base score

    // Risky behaviors increase score
    // +5 per swap transaction (capped at +30)
    const swapBonus = Math.min(analysis.swapFrequency * 5, 30);
    score += swapBonus;

    // +10 per new protocol interaction (capped at +20)
    const newProtocolBonus = Math.min(analysis.newProtocolInteractions * 10, 20);
    score += newProtocolBonus;

    // +8 per volatile liquidity provision (capped at +20)
    const volatileLPs = analysis.liquidityProvisions.filter(lp => lp.isVolatile).length;
    const volatileLPBonus = Math.min(volatileLPs * 8, 20);
    score += volatileLPBonus;

    // Safe behaviors decrease score
    // -10 per blue-chip long hold (capped at -30)
    const blueChipPenalty = Math.min(analysis.blueChipHoldings.length * 10, 30);
    score -= blueChipPenalty;

    // -8 per stable stake in established protocol (capped at -20)
    const establishedStakes = analysis.stableStakes.filter(stake => stake.isEstablished).length;
    const stablePenalty = Math.min(establishedStakes * 8, 20);
    score -= stablePenalty;

    // Clamp to [1, 100]
    return this.clampScore(score);
  }

  /**
   * Calculate loyalty score (1-100)
   * Higher scores indicate more loyal/long-term behavior
   * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
   */
  calculateLoyalty(analysis: AnalysisResult): number {
    let score = 50; // Base score

    // Loyal behaviors increase score
    // +0.1 per day of token holding (capped at +30)
    let totalHoldDays = 0;
    analysis.holdDurations.forEach(days => {
      totalHoldDays += days;
    });
    const holdBonus = Math.min(totalHoldDays * 0.1, 30);
    score += holdBonus;

    // +8 per governance vote (capped at +20)
    const governanceBonus = Math.min(analysis.governanceVotes.length * 8, 20);
    score += governanceBonus;

    // +5 per repeated protocol usage (protocols with >1 interaction) (capped at +20)
    let repeatedProtocols = 0;
    analysis.protocolFrequency.forEach(count => {
      if (count > 1) {
        repeatedProtocols++;
      }
    });
    const repeatedProtocolBonus = Math.min(repeatedProtocols * 5, 20);
    score += repeatedProtocolBonus;

    // Disloyal behaviors decrease score
    // -15 per airdrop flip (capped at -30)
    const airdropFlipPenalty = Math.min(analysis.airdropFlips.length * 15, 30);
    score -= airdropFlipPenalty;

    // -0.5 per day of short holding (holds < 7 days) (capped at -20)
    let shortHoldDays = 0;
    analysis.holdDurations.forEach(days => {
      if (days < 7) {
        shortHoldDays += days;
      }
    });
    const shortHoldPenalty = Math.min(shortHoldDays * 0.5, 20);
    score -= shortHoldPenalty;

    // Clamp to [1, 100]
    return this.clampScore(score);
  }

  /**
   * Calculate activity score (1-100)
   * Higher scores indicate more active engagement
   * Requirements: 4.1, 4.2, 4.3, 4.4
   */
  calculateActivity(analysis: AnalysisResult): number {
    let score = 30; // Base score

    // Active behaviors increase score
    // +1 per transaction (capped at +40)
    const transactionBonus = Math.min(analysis.totalTransactions * 1, 40);
    score += transactionBonus;

    // +2 per transaction in last 30 days (capped at +30)
    const recentBonus = Math.min(analysis.recentActivityCount * 2, 30);
    score += recentBonus;

    // Dormancy decreases score
    // -5 per dormancy period > 90 days (capped at -20)
    const longDormancyPeriods = analysis.dormancyPeriods.filter(days => days > 90).length;
    const dormancyPenalty = Math.min(longDormancyPeriods * 5, 20);
    score -= dormancyPenalty;

    // Clamp to [1, 100]
    return this.clampScore(score);
  }

  /**
   * Clamp score to valid range [1, 100]
   */
  private clampScore(score: number): number {
    return Math.max(1, Math.min(100, Math.round(score)));
  }
}
