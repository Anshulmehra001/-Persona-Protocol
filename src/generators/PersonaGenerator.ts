import { PersonaGenerator as IPersonaGenerator } from '../interfaces/PersonaGenerator';
import { Scores, AnalysisResult } from '../types';

/**
 * PersonaGenerator implementation
 * Generates persona title, summary, traits, and notable protocols
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 7.2, 7.3
 */
export class PersonaGenerator implements IPersonaGenerator {
  /**
   * Generate persona title based on scores and transaction patterns
   * Requirements: 5.1, 5.2, 5.3
   */
  generateTitle(scores: Scores, analysis: AnalysisResult): string {
    const { riskAppetite, loyalty, activity } = scores;
    const nftPercentage = analysis.totalTransactions > 0 
      ? (analysis.nftTransactions / analysis.totalTransactions) * 100 
      : 0;

    // Decision tree for title generation
    // 1. NFT-focused titles (>50% NFT transactions)
    if (nftPercentage > 50) {
      return this.getNFTTitle(activity);
    }

    // 2. Active trader titles (high risk + high activity)
    if (riskAppetite > 70 && activity > 70) {
      return this.getActiveTraderTitle(riskAppetite);
    }

    // 3. Stable holder titles (high loyalty + low risk)
    if (loyalty > 70 && riskAppetite < 40) {
      return this.getStableHolderTitle(loyalty);
    }

    // 4. Dormant/inactive titles (low activity)
    if (activity < 30) {
      return this.getDormantTitle(loyalty);
    }

    // 5. Balanced/general titles
    return this.getBalancedTitle(riskAppetite, loyalty, activity);
  }

  /**
   * Generate narrative summary describing wallet behavior
   * Requirements: 5.4, 5.5
   */
  generateSummary(scores: Scores, analysis: AnalysisResult): string {
    const { riskAppetite, loyalty, activity } = scores;
    const sentences: string[] = [];

    // Sentence 1: Overall characterization
    sentences.push(this.getCharacterizationSentence(scores, analysis));

    // Sentence 2: Specific behaviors and protocols
    sentences.push(this.getBehaviorSentence(scores, analysis));

    // Sentence 3 (optional): Additional context if notable patterns exist
    const contextSentence = this.getContextSentence(scores, analysis);
    if (contextSentence) {
      sentences.push(contextSentence);
    }

    return sentences.join(' ');
  }

  /**
   * Identify and return key behavioral traits
   * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6
   */
  generateTraits(scores: Scores, analysis: AnalysisResult): string[] {
    const traits: Array<{ name: string; priority: number }> = [];

    // Airdrop Hunter (6.1)
    const uniqueAirdrops = this.countUniqueAirdropSources(analysis);
    if (uniqueAirdrops >= 5) {
      traits.push({ name: 'Airdrop Hunter', priority: 10 });
    }

    // Early Adopter (6.2)
    if (analysis.newProtocolInteractions > 0) {
      traits.push({ name: 'Early Adopter', priority: 9 });
    }

    // Diamond Hands (6.3)
    if (scores.loyalty > 85) {
      traits.push({ name: 'Diamond Hands', priority: 10 });
    }

    // Protocol Specialist (6.4)
    const specialistProtocol = this.getSpecialistProtocol(analysis);
    if (specialistProtocol) {
      traits.push({ name: 'Protocol Specialist', priority: 8 });
    }

    // Governance Participant (6.5)
    if (analysis.governanceVotes.length > 0) {
      traits.push({ name: 'Governance Participant', priority: 7 });
    }

    // Additional traits based on behavior patterns
    if (analysis.nftTransactions > analysis.totalTransactions * 0.3) {
      traits.push({ name: 'NFT Enthusiast', priority: 6 });
    }

    if (analysis.swapFrequency > 10) {
      traits.push({ name: 'Active Trader', priority: 5 });
    }

    if (analysis.liquidityProvisions.length > 3) {
      traits.push({ name: 'Liquidity Provider', priority: 5 });
    }

    if (scores.riskAppetite > 75) {
      traits.push({ name: 'Risk Taker', priority: 4 });
    }

    if (scores.activity < 30) {
      traits.push({ name: 'Passive Holder', priority: 3 });
    }

    // Sort by priority and select top 3-5
    traits.sort((a, b) => b.priority - a.priority);
    const selectedTraits = traits.slice(0, 5).map(t => t.name);

    // Ensure at least 3 traits
    while (selectedTraits.length < 3) {
      if (!selectedTraits.includes('Web3 User')) {
        selectedTraits.push('Web3 User');
      } else if (!selectedTraits.includes('Blockchain Participant')) {
        selectedTraits.push('Blockchain Participant');
      } else {
        selectedTraits.push('DeFi Explorer');
      }
    }

    return selectedTraits.slice(0, 5);
  }

  /**
   * Extract top 3-5 most interacted protocols
   * Requirements: 7.2, 7.3
   */
  getNotableProtocols(analysis: AnalysisResult): string[] {
    // Convert Map to array and sort by frequency
    const protocolArray = Array.from(analysis.protocolFrequency.entries())
      .map(([protocol, count]) => ({ protocol, count }))
      .sort((a, b) => b.count - a.count);

    // Return top 3-5 protocols
    const count = Math.min(Math.max(protocolArray.length, 0), 5);
    const topProtocols = protocolArray.slice(0, Math.max(count, 3));

    return topProtocols.map(p => p.protocol);
  }

  // Private helper methods for title generation

  private getNFTTitle(activity: number): string {
    const titles = [
      'NFT Connoisseur',
      'Digital Art Collector',
      'NFT Enthusiast',
      'NFT Trader',
    ];
    return activity > 60 ? titles[3] : titles[Math.floor(Math.random() * 3)];
  }

  private getActiveTraderTitle(riskAppetite: number): string {
    const titles = [
      'DeFi Degen',
      'Active Trader',
      'High-Frequency Swapper',
      'Yield Chaser',
    ];
    return riskAppetite > 85 ? titles[0] : titles[1];
  }

  private getStableHolderTitle(loyalty: number): string {
    const titles = [
      'Steady Staker',
      'Blue-Chip Believer',
      'Long-Term Holder',
      'Diamond Hands Investor',
    ];
    return loyalty > 90 ? titles[3] : titles[Math.floor(Math.random() * 3)];
  }

  private getDormantTitle(loyalty: number): string {
    return loyalty > 60 ? 'Dormant Holder' : 'Inactive Wallet';
  }

  private getBalancedTitle(risk: number, loyalty: number, activity: number): string {
    if (risk > 60) return 'Adventurous Investor';
    if (loyalty > 60) return 'Committed Participant';
    if (activity > 60) return 'Active Participant';
    return 'Balanced Investor';
  }

  // Private helper methods for summary generation

  private getCharacterizationSentence(scores: Scores, analysis: AnalysisResult): string {
    const { riskAppetite, loyalty, activity } = scores;

    if (riskAppetite > 70 && activity > 70) {
      return 'This wallet exhibits highly active trading behavior with a strong appetite for risk.';
    }

    if (loyalty > 70 && riskAppetite < 40) {
      return 'This wallet demonstrates a conservative, long-term holding strategy with strong loyalty to established protocols.';
    }

    if (analysis.nftTransactions > analysis.totalTransactions * 0.5) {
      return 'This wallet is primarily focused on NFT activities, with the majority of transactions involving digital collectibles.';
    }

    if (activity < 30) {
      return 'This wallet shows minimal recent activity, suggesting a passive or dormant investment approach.';
    }

    return 'This wallet maintains a balanced approach to DeFi participation across various activities.';
  }

  private getBehaviorSentence(scores: Scores, analysis: AnalysisResult): string {
    const topProtocols = this.getNotableProtocols(analysis);
    // Sanitize protocol names to remove sentence-ending punctuation
    const sanitizedProtocols = topProtocols.map(p => p.replace(/[.!?]/g, ''));
    const protocolMention = sanitizedProtocols.length > 0 
      ? sanitizedProtocols.slice(0, 2).join(' and ')
      : 'various protocols';

    const dominantBehavior = this.getDominantBehavior(analysis);

    if (dominantBehavior === 'swap') {
      return `The wallet frequently swaps tokens, with notable activity on ${protocolMention}.`;
    }

    if (dominantBehavior === 'nft_mint') {
      return `NFT minting and trading dominate the transaction history, with engagement across ${protocolMention}.`;
    }

    if (dominantBehavior === 'stake') {
      return `Staking activities are prominent, particularly on ${protocolMention}.`;
    }

    if (dominantBehavior === 'provide_liquidity') {
      return `The wallet actively provides liquidity to pools on ${protocolMention}.`;
    }

    return `The wallet engages with multiple DeFi activities across ${protocolMention}.`;
  }

  private getContextSentence(scores: Scores, analysis: AnalysisResult): string | null {
    // Governance participation
    if (analysis.governanceVotes.length > 0) {
      return 'Active participation in governance demonstrates commitment to protocol development.';
    }

    // Airdrop hunting
    const uniqueAirdrops = this.countUniqueAirdropSources(analysis);
    if (uniqueAirdrops >= 5) {
      return 'The wallet shows strategic positioning for airdrops across multiple protocols.';
    }

    // New protocol exploration
    if (analysis.newProtocolInteractions > 3) {
      return 'Early adoption of new protocols indicates a willingness to explore emerging opportunities.';
    }

    // Dormancy
    if (analysis.dormancyPeriods.length > 2) {
      return 'Extended periods of inactivity suggest intermittent engagement with the ecosystem.';
    }

    return null;
  }

  // Private utility methods

  private getDominantBehavior(analysis: AnalysisResult): string {
    const behaviors = {
      swap: analysis.swapFrequency,
      nft_mint: analysis.nftTransactions,
      stake: analysis.stableStakes.length,
      provide_liquidity: analysis.liquidityProvisions.length,
    };

    let maxCount = 0;
    let dominant = 'swap';

    for (const [behavior, count] of Object.entries(behaviors)) {
      if (count > maxCount) {
        maxCount = count;
        dominant = behavior;
      }
    }

    return dominant;
  }

  private countUniqueAirdropSources(analysis: AnalysisResult): number {
    const uniqueTokens = new Set(analysis.airdropFlips.map(flip => flip.token));
    // Note: airdropFlips only tracks flipped airdrops, not all airdrops
    // We need to count from protocolFrequency or estimate
    // For now, we'll use a heuristic based on available data
    return uniqueTokens.size + Math.floor(analysis.governanceVotes.length / 2);
  }

  private getSpecialistProtocol(analysis: AnalysisResult): string | null {
    if (analysis.totalTransactions === 0) return null;

    let maxProtocol: string | null = null;
    let maxCount = 0;

    analysis.protocolFrequency.forEach((count, protocol) => {
      if (count > maxCount) {
        maxCount = count;
        maxProtocol = protocol;
      }
    });

    // Check if this protocol accounts for >60% of transactions
    if (maxProtocol && maxCount > analysis.totalTransactions * 0.6) {
      return maxProtocol;
    }

    return null;
  }
}
