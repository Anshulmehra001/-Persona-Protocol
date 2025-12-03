/**
 * Core type definitions for Persona Protocol
 * Requirements: 1.1, 1.2, 1.3
 */

// Transaction Types
export type TransactionType =
  | 'swap'
  | 'nft_mint'
  | 'stake'
  | 'provide_liquidity'
  | 'receive_airdrop'
  | 'governance_vote'
  | 'token_hold';

// Input Models
export interface TransactionDetails {
  [key: string]: any;
  protocol?: string;
  is_new_protocol?: boolean;
}

export interface Transaction {
  hash: string;
  timestamp: string;
  type: TransactionType;
  details: TransactionDetails;
}

export interface WalletData {
  walletAddress: string;
  transactions: Transaction[];
}

export interface WalletInput {
  walletAddress: string;
  transactions: Transaction[];
}

// Validation Models
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Analysis Models
export interface TokenHolding {
  token: string;
  durationDays: number;
  isBlueChip: boolean;
}

export interface LiquidityProvision {
  token1: string;
  token2: string;
  protocol: string;
  isVolatile: boolean;
}

export interface StakeInfo {
  token: string;
  protocol: string;
  isEstablished: boolean;
}

export interface GovernanceVote {
  protocol: string;
  timestamp: string;
}

export interface AirdropFlip {
  token: string;
  receivedAt: string;
  swappedAt: string;
  timeDelta: number; // milliseconds
}

export interface AnalysisResult {
  swapFrequency: number;
  newProtocolInteractions: number;
  liquidityProvisions: LiquidityProvision[];
  blueChipHoldings: TokenHolding[];
  stableStakes: StakeInfo[];
  holdDurations: Map<string, number>;
  governanceVotes: GovernanceVote[];
  airdropFlips: AirdropFlip[];
  protocolFrequency: Map<string, number>;
  nftTransactions: number;
  recentActivityCount: number;
  totalTransactions: number;
  dormancyPeriods: number[];
}

// Score Models
export interface Scores {
  riskAppetite: number; // 1-100
  loyalty: number;      // 1-100
  activity: number;     // 1-100
}

// Output Models
export interface PersonaProfile {
  walletAddress: string;
  personaTitle: string;
  summary: string;
  scores: Scores;
  keyTraits: string[];
  notableProtocols: string[];
}

export interface PersonaOutput {
  walletAddress: string;
  personaTitle: string;
  summary: string;
  scores: {
    riskAppetite: number;
    loyalty: number;
    activity: number;
  };
  keyTraits: string[];
  notableProtocols: string[];
}
