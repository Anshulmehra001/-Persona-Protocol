import {
  Transaction,
  AnalysisResult,
  TokenHolding,
  LiquidityProvision,
  StakeInfo,
  GovernanceVote,
  AirdropFlip,
} from '../types';
import { TransactionAnalyzer as ITransactionAnalyzer } from '../interfaces';

/**
 * TransactionAnalyzer implementation
 * Extracts behavioral signals from transaction history
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3
 */
export class TransactionAnalyzer implements ITransactionAnalyzer {
  private readonly BLUE_CHIP_TOKENS = ['ETH', 'WETH', 'WBTC', 'BTC'];
  private readonly ESTABLISHED_PROTOCOLS = ['Uniswap', 'Aave', 'Lido', 'Compound', 'MakerDAO'];
  private readonly RECENT_ACTIVITY_DAYS = 30;
  private readonly DORMANCY_THRESHOLD_DAYS = 90;
  private readonly AIRDROP_FLIP_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours

  analyze(transactions: Transaction[]): AnalysisResult {
    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    return {
      swapFrequency: this.calculateSwapFrequency(sortedTransactions),
      newProtocolInteractions: this.detectNewProtocolInteractions(sortedTransactions),
      liquidityProvisions: this.analyzeLiquidityProvisions(sortedTransactions),
      blueChipHoldings: this.detectBlueChipHoldings(sortedTransactions),
      stableStakes: this.analyzeStableStaking(sortedTransactions),
      holdDurations: this.calculateHoldDurations(sortedTransactions),
      governanceVotes: this.trackGovernanceVotes(sortedTransactions),
      airdropFlips: this.detectAirdropFlips(sortedTransactions),
      protocolFrequency: this.countProtocolFrequency(sortedTransactions),
      nftTransactions: this.countNFTTransactions(sortedTransactions),
      recentActivityCount: this.calculateRecentActivity(sortedTransactions),
      totalTransactions: transactions.length,
      dormancyPeriods: this.detectDormancyPeriods(sortedTransactions),
    };
  }

  /**
   * Calculate swap frequency
   * Requirements: 2.1
   */
  private calculateSwapFrequency(transactions: Transaction[]): number {
    return transactions.filter(tx => tx.type === 'swap').length;
  }

  /**
   * Detect new protocol interactions
   * Requirements: 2.2
   */
  private detectNewProtocolInteractions(transactions: Transaction[]): number {
    return transactions.filter(
      tx => tx.details.is_new_protocol === true
    ).length;
  }

  /**
   * Analyze liquidity provisions
   * Requirements: 2.3
   */
  private analyzeLiquidityProvisions(transactions: Transaction[]): LiquidityProvision[] {
    return transactions
      .filter(tx => tx.type === 'provide_liquidity')
      .map(tx => {
        const token1 = tx.details.token1 || tx.details.tokenA || 'UNKNOWN';
        const token2 = tx.details.token2 || tx.details.tokenB || 'UNKNOWN';
        const protocol = tx.details.protocol || 'UNKNOWN';
        
        // Consider volatile if neither token is a stablecoin or blue-chip
        const stablecoins = ['USDC', 'USDT', 'DAI', 'BUSD'];
        const isToken1Stable = stablecoins.includes(token1) || this.BLUE_CHIP_TOKENS.includes(token1);
        const isToken2Stable = stablecoins.includes(token2) || this.BLUE_CHIP_TOKENS.includes(token2);
        const isVolatile = !isToken1Stable || !isToken2Stable;

        return {
          token1,
          token2,
          protocol,
          isVolatile,
        };
      });
  }

  /**
   * Detect blue-chip holdings
   * Requirements: 2.4
   */
  private detectBlueChipHoldings(transactions: Transaction[]): TokenHolding[] {
    const holdings: TokenHolding[] = [];
    
    transactions
      .filter(tx => tx.type === 'token_hold')
      .forEach(tx => {
        const token = tx.details.token || 'UNKNOWN';
        const isBlueChip = this.BLUE_CHIP_TOKENS.includes(token);
        
        if (isBlueChip) {
          const durationDays = this.calculateDurationInDays(
            tx.details.start_date || tx.timestamp,
            tx.details.end_date || new Date().toISOString()
          );
          
          holdings.push({
            token,
            durationDays,
            isBlueChip: true,
          });
        }
      });

    return holdings;
  }

  /**
   * Analyze stable staking
   * Requirements: 2.5
   */
  private analyzeStableStaking(transactions: Transaction[]): StakeInfo[] {
    const stablecoins = ['USDC', 'USDT', 'DAI', 'BUSD'];
    
    return transactions
      .filter(tx => tx.type === 'stake')
      .map(tx => {
        const token = tx.details.token || 'UNKNOWN';
        const protocol = tx.details.protocol || 'UNKNOWN';
        const isStablecoin = stablecoins.includes(token);
        const isBlueChip = this.BLUE_CHIP_TOKENS.includes(token);
        const isEstablished = this.ESTABLISHED_PROTOCOLS.includes(protocol);

        return {
          token,
          protocol,
          isEstablished: isEstablished && (isStablecoin || isBlueChip),
        };
      })
      .filter(stake => stake.isEstablished);
  }

  /**
   * Calculate hold durations
   * Requirements: 3.1
   */
  private calculateHoldDurations(transactions: Transaction[]): Map<string, number> {
    const holdDurations = new Map<string, number>();

    transactions
      .filter(tx => tx.type === 'token_hold')
      .forEach(tx => {
        const token = tx.details.token || 'UNKNOWN';
        const durationDays = this.calculateDurationInDays(
          tx.details.start_date || tx.timestamp,
          tx.details.end_date || new Date().toISOString()
        );
        
        const currentDuration = holdDurations.get(token) || 0;
        holdDurations.set(token, currentDuration + durationDays);
      });

    return holdDurations;
  }

  /**
   * Track governance votes
   * Requirements: 3.2
   */
  private trackGovernanceVotes(transactions: Transaction[]): GovernanceVote[] {
    return transactions
      .filter(tx => tx.type === 'governance_vote')
      .map(tx => ({
        protocol: tx.details.protocol || 'UNKNOWN',
        timestamp: tx.timestamp,
      }));
  }

  /**
   * Detect airdrop flips
   * Requirements: 3.4
   */
  private detectAirdropFlips(transactions: Transaction[]): AirdropFlip[] {
    const airdropFlips: AirdropFlip[] = [];
    const airdrops = transactions.filter(tx => tx.type === 'receive_airdrop');

    airdrops.forEach(airdrop => {
      const token = airdrop.details.token || 'UNKNOWN';
      const receivedAt = airdrop.timestamp;
      const receivedTime = new Date(receivedAt).getTime();

      // Find swaps of the same token shortly after receiving
      const swaps = transactions.filter(
        tx => tx.type === 'swap' &&
        (tx.details.token_from === token || tx.details.tokenFrom === token) &&
        new Date(tx.timestamp).getTime() > receivedTime
      );

      if (swaps.length > 0) {
        const firstSwap = swaps[0];
        const swappedAt = firstSwap.timestamp;
        const timeDelta = new Date(swappedAt).getTime() - receivedTime;

        if (timeDelta <= this.AIRDROP_FLIP_THRESHOLD_MS) {
          airdropFlips.push({
            token,
            receivedAt,
            swappedAt,
            timeDelta,
          });
        }
      }
    });

    return airdropFlips;
  }

  /**
   * Count protocol frequency
   * Requirements: 7.1
   */
  private countProtocolFrequency(transactions: Transaction[]): Map<string, number> {
    const frequency = new Map<string, number>();

    transactions.forEach(tx => {
      const protocol = tx.details.protocol;
      if (protocol) {
        frequency.set(protocol, (frequency.get(protocol) || 0) + 1);
      }
    });

    return frequency;
  }

  /**
   * Count NFT transactions
   * Requirements: 5.3
   */
  private countNFTTransactions(transactions: Transaction[]): number {
    return transactions.filter(tx => tx.type === 'nft_mint').length;
  }

  /**
   * Calculate recent activity (last 30 days)
   * Requirements: 4.2
   */
  private calculateRecentActivity(transactions: Transaction[]): number {
    const now = new Date().getTime();
    const thirtyDaysAgo = now - (this.RECENT_ACTIVITY_DAYS * 24 * 60 * 60 * 1000);

    return transactions.filter(
      tx => new Date(tx.timestamp).getTime() >= thirtyDaysAgo
    ).length;
  }

  /**
   * Detect dormancy periods
   * Requirements: 4.3
   */
  private detectDormancyPeriods(transactions: Transaction[]): number[] {
    if (transactions.length < 2) {
      return [];
    }

    const dormancyPeriods: number[] = [];

    for (let i = 1; i < transactions.length; i++) {
      const prevTime = new Date(transactions[i - 1].timestamp).getTime();
      const currTime = new Date(transactions[i].timestamp).getTime();
      const gapDays = (currTime - prevTime) / (24 * 60 * 60 * 1000);

      if (gapDays >= this.DORMANCY_THRESHOLD_DAYS) {
        dormancyPeriods.push(gapDays);
      }
    }

    return dormancyPeriods;
  }

  /**
   * Helper: Calculate duration in days between two dates
   */
  private calculateDurationInDays(startDate: string, endDate: string): number {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    return Math.max(0, (end - start) / (24 * 60 * 60 * 1000));
  }
}
