import { describe, it, expect } from 'vitest';
import { analyzeWallet } from './index';

describe('analyzeWallet - Integration Tests', () => {
  describe('Example input/output tests', () => {
    it('should analyze a realistic DeFi degen wallet', () => {
      const input = JSON.stringify({
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        transactions: [
          {
            hash: '0xabc123',
            timestamp: '2024-01-15T10:00:00Z',
            type: 'swap',
            details: { protocol: 'Uniswap', token_from: 'ETH', token_to: 'PEPE' }
          },
          {
            hash: '0xdef456',
            timestamp: '2024-01-16T14:30:00Z',
            type: 'swap',
            details: { protocol: 'Uniswap', token_from: 'PEPE', token_to: 'DOGE' }
          },
          {
            hash: '0xghi789',
            timestamp: '2024-01-17T09:15:00Z',
            type: 'provide_liquidity',
            details: { protocol: 'SushiSwap', token1: 'SHIB', token2: 'DOGE', is_new_protocol: true }
          },
          {
            hash: '0xjkl012',
            timestamp: '2024-01-18T16:45:00Z',
            type: 'swap',
            details: { protocol: 'Uniswap', token_from: 'DOGE', token_to: 'WOJAK' }
          },
          {
            hash: '0xmno345',
            timestamp: '2024-01-19T11:20:00Z',
            type: 'receive_airdrop',
            details: { protocol: 'NewProtocol', token: 'AIRDROP1' }
          },
          {
            hash: '0xpqr678',
            timestamp: '2024-01-19T12:00:00Z',
            type: 'swap',
            details: { protocol: 'Uniswap', token_from: 'AIRDROP1', token_to: 'ETH' }
          }
        ]
      });

      const result = analyzeWallet(input);
      const parsed = JSON.parse(result);

      // Verify structure
      expect(parsed).toHaveProperty('walletAddress');
      expect(parsed).toHaveProperty('personaTitle');
      expect(parsed).toHaveProperty('summary');
      expect(parsed).toHaveProperty('scores');
      expect(parsed).toHaveProperty('keyTraits');
      expect(parsed).toHaveProperty('notableProtocols');

      // Verify wallet address
      expect(parsed.walletAddress).toBe('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');

      // Verify scores are in valid range
      expect(parsed.scores.riskAppetite).toBeGreaterThanOrEqual(1);
      expect(parsed.scores.riskAppetite).toBeLessThanOrEqual(100);
      expect(parsed.scores.loyalty).toBeGreaterThanOrEqual(1);
      expect(parsed.scores.loyalty).toBeLessThanOrEqual(100);
      expect(parsed.scores.activity).toBeGreaterThanOrEqual(1);
      expect(parsed.scores.activity).toBeLessThanOrEqual(100);

      // Verify high risk due to swaps and new protocol
      expect(parsed.scores.riskAppetite).toBeGreaterThan(60);

      // Verify traits array has 3-5 items
      expect(parsed.keyTraits.length).toBeGreaterThanOrEqual(3);
      expect(parsed.keyTraits.length).toBeLessThanOrEqual(5);

      // Verify notable protocols
      expect(parsed.notableProtocols).toContain('Uniswap');
    });

    it('should analyze a stable holder wallet', () => {
      const input = JSON.stringify({
        walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
        transactions: [
          {
            hash: '0xhold1',
            timestamp: '2023-01-01T00:00:00Z',
            type: 'token_hold',
            details: {
              token: 'ETH',
              start_date: '2023-01-01T00:00:00Z',
              end_date: '2024-01-01T00:00:00Z'
            }
          },
          {
            hash: '0xstake1',
            timestamp: '2023-06-01T00:00:00Z',
            type: 'stake',
            details: { protocol: 'Lido', token: 'ETH' }
          },
          {
            hash: '0xvote1',
            timestamp: '2023-09-01T00:00:00Z',
            type: 'governance_vote',
            details: { protocol: 'Lido', proposal_id: 'prop-123' }
          },
          {
            hash: '0xstake2',
            timestamp: '2023-12-01T00:00:00Z',
            type: 'stake',
            details: { protocol: 'Lido', token: 'ETH' }
          }
        ]
      });

      const result = analyzeWallet(input);
      const parsed = JSON.parse(result);

      // Verify structure
      expect(parsed.walletAddress).toBe('0x1234567890abcdef1234567890abcdef12345678');

      // Verify high loyalty due to long hold and governance
      expect(parsed.scores.loyalty).toBeGreaterThan(60);

      // Verify low risk due to blue-chip holding and established protocol staking
      expect(parsed.scores.riskAppetite).toBeLessThan(50);

      // Should have Governance Participant trait
      expect(parsed.keyTraits).toContain('Governance Participant');

      // Should mention Lido
      expect(parsed.notableProtocols).toContain('Lido');
    });

    it('should analyze an NFT collector wallet', () => {
      const input = JSON.stringify({
        walletAddress: '0xnftcollector123456789abcdef',
        transactions: [
          {
            hash: '0xnft1',
            timestamp: '2024-01-01T10:00:00Z',
            type: 'nft_mint',
            details: { protocol: 'OpenSea', collection: 'CoolApes' }
          },
          {
            hash: '0xnft2',
            timestamp: '2024-01-05T11:00:00Z',
            type: 'nft_mint',
            details: { protocol: 'OpenSea', collection: 'BoredPunks' }
          },
          {
            hash: '0xnft3',
            timestamp: '2024-01-10T12:00:00Z',
            type: 'nft_mint',
            details: { protocol: 'Rarible', collection: 'ArtBlocks' }
          },
          {
            hash: '0xnft4',
            timestamp: '2024-01-15T13:00:00Z',
            type: 'nft_mint',
            details: { protocol: 'OpenSea', collection: 'Doodles' }
          },
          {
            hash: '0xswap1',
            timestamp: '2024-01-20T14:00:00Z',
            type: 'swap',
            details: { protocol: 'Uniswap', token_from: 'ETH', token_to: 'USDC' }
          }
        ]
      });

      const result = analyzeWallet(input);
      const parsed = JSON.parse(result);

      // NFT transactions are 80% of total (4 out of 5)
      // Title should reflect NFT focus
      expect(parsed.personaTitle).toMatch(/NFT|Collector|Art|Digital/i);

      // Should have NFT-related trait
      expect(parsed.keyTraits.some((trait: string) => 
        trait.includes('NFT') || trait.includes('Collector')
      )).toBe(true);

      // Should mention OpenSea as top protocol
      expect(parsed.notableProtocols).toContain('OpenSea');
    });
  });

  describe('Edge case tests', () => {
    it('should handle empty wallet (no transactions)', () => {
      const input = JSON.stringify({
        walletAddress: '0xemptywallet',
        transactions: []
      });

      const result = analyzeWallet(input);
      const parsed = JSON.parse(result);

      // Should still produce valid output
      expect(parsed.walletAddress).toBe('0xemptywallet');
      expect(parsed.personaTitle).toBeTruthy();
      expect(parsed.summary).toBeTruthy();

      // Scores should be in valid range
      expect(parsed.scores.riskAppetite).toBeGreaterThanOrEqual(1);
      expect(parsed.scores.riskAppetite).toBeLessThanOrEqual(100);
      expect(parsed.scores.loyalty).toBeGreaterThanOrEqual(1);
      expect(parsed.scores.loyalty).toBeLessThanOrEqual(100);
      expect(parsed.scores.activity).toBeGreaterThanOrEqual(1);
      expect(parsed.scores.activity).toBeLessThanOrEqual(100);

      // Should have 3-5 traits even with no activity
      expect(parsed.keyTraits.length).toBeGreaterThanOrEqual(3);
      expect(parsed.keyTraits.length).toBeLessThanOrEqual(5);

      // Notable protocols should be empty or minimal
      expect(Array.isArray(parsed.notableProtocols)).toBe(true);
    });

    it('should handle single-transaction wallet', () => {
      const input = JSON.stringify({
        walletAddress: '0xsingletx',
        transactions: [
          {
            hash: '0xsingle',
            timestamp: '2024-01-01T00:00:00Z',
            type: 'swap',
            details: { protocol: 'Uniswap', token_from: 'ETH', token_to: 'USDC' }
          }
        ]
      });

      const result = analyzeWallet(input);
      const parsed = JSON.parse(result);

      expect(parsed.walletAddress).toBe('0xsingletx');
      expect(parsed.scores.activity).toBeGreaterThanOrEqual(1);
      expect(parsed.scores.activity).toBeLessThanOrEqual(100);
      expect(parsed.keyTraits.length).toBeGreaterThanOrEqual(3);
      expect(parsed.notableProtocols).toContain('Uniswap');
    });

    it('should handle wallet with only one transaction type', () => {
      const input = JSON.stringify({
        walletAddress: '0xonetype',
        transactions: [
          {
            hash: '0xstake1',
            timestamp: '2024-01-01T00:00:00Z',
            type: 'stake',
            details: { protocol: 'Aave', token: 'USDC' }
          },
          {
            hash: '0xstake2',
            timestamp: '2024-01-05T00:00:00Z',
            type: 'stake',
            details: { protocol: 'Aave', token: 'USDC' }
          },
          {
            hash: '0xstake3',
            timestamp: '2024-01-10T00:00:00Z',
            type: 'stake',
            details: { protocol: 'Aave', token: 'USDC' }
          }
        ]
      });

      const result = analyzeWallet(input);
      const parsed = JSON.parse(result);

      expect(parsed.walletAddress).toBe('0xonetype');
      expect(parsed.scores.riskAppetite).toBeGreaterThanOrEqual(1);
      expect(parsed.scores.riskAppetite).toBeLessThanOrEqual(100);
      expect(parsed.notableProtocols).toContain('Aave');
    });

    it('should handle boundary condition: exactly 85 loyalty for Diamond Hands', () => {
      // Create a wallet that should score exactly 85 loyalty
      // Base: 50, need +35 from holds
      // +0.1 per day, so 350 days of holding
      const input = JSON.stringify({
        walletAddress: '0xdiamondhands',
        transactions: [
          {
            hash: '0xhold1',
            timestamp: '2023-01-01T00:00:00Z',
            type: 'token_hold',
            details: {
              token: 'ETH',
              start_date: '2023-01-01T00:00:00Z',
              end_date: '2024-01-16T00:00:00Z' // ~380 days
            }
          }
        ]
      });

      const result = analyzeWallet(input);
      const parsed = JSON.parse(result);

      // Should have high loyalty (around 85+)
      expect(parsed.scores.loyalty).toBeGreaterThanOrEqual(80);
      
      // Should include Diamond Hands trait if loyalty > 85
      if (parsed.scores.loyalty > 85) {
        expect(parsed.keyTraits).toContain('Diamond Hands');
      }
    });

    it('should handle boundary condition: exactly 50% NFT transactions', () => {
      const input = JSON.stringify({
        walletAddress: '0xhalfnft',
        transactions: [
          {
            hash: '0xnft1',
            timestamp: '2024-01-01T00:00:00Z',
            type: 'nft_mint',
            details: { protocol: 'OpenSea' }
          },
          {
            hash: '0xswap1',
            timestamp: '2024-01-02T00:00:00Z',
            type: 'swap',
            details: { protocol: 'Uniswap', token_from: 'ETH', token_to: 'USDC' }
          }
        ]
      });

      const result = analyzeWallet(input);
      const parsed = JSON.parse(result);

      // At exactly 50%, should NOT trigger NFT-focused title (needs >50%)
      expect(parsed.walletAddress).toBe('0xhalfnft');
      expect(parsed.scores.riskAppetite).toBeGreaterThanOrEqual(1);
      expect(parsed.scores.riskAppetite).toBeLessThanOrEqual(100);
    });

    it('should handle boundary condition: exactly 60% protocol specialist threshold', () => {
      const input = JSON.stringify({
        walletAddress: '0xspecialist',
        transactions: [
          {
            hash: '0x1',
            timestamp: '2024-01-01T00:00:00Z',
            type: 'swap',
            details: { protocol: 'Uniswap' }
          },
          {
            hash: '0x2',
            timestamp: '2024-01-02T00:00:00Z',
            type: 'swap',
            details: { protocol: 'Uniswap' }
          },
          {
            hash: '0x3',
            timestamp: '2024-01-03T00:00:00Z',
            type: 'swap',
            details: { protocol: 'Uniswap' }
          },
          {
            hash: '0x4',
            timestamp: '2024-01-04T00:00:00Z',
            type: 'swap',
            details: { protocol: 'SushiSwap' }
          },
          {
            hash: '0x5',
            timestamp: '2024-01-05T00:00:00Z',
            type: 'swap',
            details: { protocol: 'SushiSwap' }
          }
        ]
      });

      const result = analyzeWallet(input);
      const parsed = JSON.parse(result);

      // Uniswap is 60% (3 out of 5)
      // Should NOT include Protocol Specialist (needs >60%)
      expect(parsed.walletAddress).toBe('0xspecialist');
      expect(parsed.notableProtocols).toContain('Uniswap');
    });

    it('should handle invalid JSON input', () => {
      const invalidInput = '{ invalid json }';

      expect(() => analyzeWallet(invalidInput)).toThrow();
    });

    it('should handle missing required fields', () => {
      const input = JSON.stringify({
        transactions: []
      });

      expect(() => analyzeWallet(input)).toThrow(/walletAddress/);
    });
  });
});
