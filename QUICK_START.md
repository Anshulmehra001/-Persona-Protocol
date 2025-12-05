# Persona Protocol - Quick Start Guide

## What Does This Project Do?

Analyzes crypto wallet transaction history and generates a behavioral persona profile with:
- **Risk Appetite Score** (1-100): How aggressive/conservative the wallet is
- **Loyalty Score** (1-100): Long-term holder vs. short-term flipper
- **Activity Score** (1-100): How engaged with blockchain
- **Persona Title**: e.g., "DeFi Degen", "Steady Staker", "NFT Collector"
- **Summary**: 2-3 sentence description
- **Key Traits**: 3-5 behavioral characteristics
- **Notable Protocols**: Top protocols used

## Installation

```bash
npm install
npm run build
```

## Basic Usage

### Option 1: Use the Main Function

```typescript
import { analyzeWallet } from './src/index';

const result = analyzeWallet({
  walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
  transactions: [
    {
      hash: "0xabc...",
      timestamp: "2024-01-01T00:00:00.000Z",
      type: "swap",
      details: { protocol: "Uniswap" }
    }
  ]
});

console.log(JSON.parse(result));
```

### Option 2: Use the CLI

```bash
npm run analyze examples/wallet1-defi-degen.json
```

## Input Format

```json
{
  "walletAddress": "0x...",
  "transactions": [
    {
      "hash": "0x...",
      "timestamp": "2024-01-01T00:00:00.000Z",
      "type": "swap",
      "details": {
        "protocol": "Uniswap",
        "from_token": "USDC",
        "to_token": "ETH"
      }
    }
  ]
}
```

### Supported Transaction Types

1. **swap** - Token exchanges on DEXs
2. **nft_mint** - NFT minting/buying
3. **stake** - Token staking
4. **provide_liquidity** - LP provision
5. **receive_airdrop** - Airdrop receipt
6. **governance_vote** - DAO voting
7. **token_hold** - Long-term holding

## Output Format

```json
{
  "walletAddress": "0x...",
  "personaTitle": "DeFi Degen",
  "summary": "This wallet exhibits...",
  "scores": {
    "riskAppetite": 85,
    "loyalty": 45,
    "activity": 92
  },
  "keyTraits": [
    "High-Frequency Trader",
    "Early Adopter",
    "Governance Participant"
  ],
  "notableProtocols": [
    "Uniswap",
    "Aave",
    "Compound"
  ]
}
```

## Running Tests

```bash
npm test
```

All 49 tests should pass.

## Example Wallets

Try the included examples:

```bash
npm run analyze examples/wallet1-defi-degen.json
npm run analyze examples/wallet2-steady-staker.json
npm run analyze examples/wallet3-nft-collector.json
npm run analyze examples/wallet4-airdrop-hunter.json
npm run analyze examples/wallet5-protocol-specialist.json
```

## Understanding Scores

### Risk Appetite (1-100)

- **1-30**: Conservative investor (holds blue-chips, stakes stables)
- **31-60**: Balanced approach
- **61-100**: Aggressive trader (frequent swaps, new protocols)

### Loyalty (1-100)

- **1-30**: Short-term flipper (airdrop hunter, quick sells)
- **31-60**: Mixed strategy
- **61-85**: Long-term holder
- **86-100**: "Diamond Hands" (extreme loyalty, governance participation)

### Activity (1-100)

- **1-30**: Dormant/inactive
- **31-60**: Moderate activity
- **61-100**: Highly active (many recent transactions)

## Common Persona Types

| Persona | Risk | Loyalty | Activity | Behavior |
|---------|------|---------|----------|----------|
| DeFi Degen | 70+ | <40 | 70+ | Aggressive trader |
| Steady Staker | <40 | 70+ | 30-60 | Conservative holder |
| NFT Collector | 40-60 | 50-70 | 50-70 | NFT focused |
| Airdrop Hunter | 40-60 | <30 | 60+ | Farms airdrops |
| Protocol Specialist | <50 | 70+ | 40-60 | Loyal to one protocol |

## Key Traits Explained

- **Airdrop Hunter**: 5+ airdrops from different sources
- **Early Adopter**: Uses new/experimental protocols
- **Diamond Hands**: Loyalty score > 85
- **Protocol Specialist**: >60% transactions on one protocol
- **Governance Participant**: Has governance votes
- **High-Frequency Trader**: Many swap transactions
- **NFT Collector**: Significant NFT activity
- **Blue-Chip Holder**: Holds ETH, WBTC long-term

## Project Structure

```
src/
├── types/              # Type definitions
├── validators/         # Input validation
├── analyzers/          # Transaction analysis
├── calculators/        # Score calculation
├── generators/         # Persona generation
├── formatters/         # Output formatting
├── index.ts           # Main pipeline
└── cli.ts             # CLI interface
```

## Need More Details?

See **DOCUMENTATION.md** for comprehensive documentation including:
- Detailed architecture
- Scoring algorithms
- API reference
- Testing strategy
- Development guide
- Troubleshooting

## Quick Commands

```bash
# Install dependencies
npm install

# Build project
npm run build

# Run tests
npm test

# Analyze a wallet
npm run analyze examples/wallet1-defi-degen.json

# Watch mode for development
npm run test:watch
```

## Support

- **Full Documentation**: See DOCUMENTATION.md
- **GitHub**: https://github.com/Anshulmehra001/-Persona-Protocol
- **Issues**: https://github.com/Anshulmehra001/-Persona-Protocol/issues
