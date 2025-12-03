import { describe, it, expect } from 'vitest';
import type { TransactionType, WalletData, Scores } from './index';

describe('Core Types', () => {
  it('should allow valid transaction types', () => {
    const validTypes: TransactionType[] = [
      'swap',
      'nft_mint',
      'stake',
      'provide_liquidity',
      'receive_airdrop',
      'governance_vote',
      'token_hold'
    ];
    
    expect(validTypes).toHaveLength(7);
  });

  it('should create valid WalletData structure', () => {
    const walletData: WalletData = {
      walletAddress: '0x1234567890abcdef',
      transactions: []
    };
    
    expect(walletData.walletAddress).toBe('0x1234567890abcdef');
    expect(walletData.transactions).toEqual([]);
  });

  it('should create valid Scores structure', () => {
    const scores: Scores = {
      riskAppetite: 50,
      loyalty: 75,
      activity: 60
    };
    
    expect(scores.riskAppetite).toBe(50);
    expect(scores.loyalty).toBe(75);
    expect(scores.activity).toBe(60);
  });
});
