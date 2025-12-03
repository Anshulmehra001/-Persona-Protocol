# Example Wallet Data

This directory contains example wallet JSON files demonstrating diverse persona types for the Persona Protocol analysis system.

## Example Wallets

### 1. wallet1-defi-degen.json
**Expected Persona: DeFi Degen / Active Trader**

Characteristics:
- High frequency of swap transactions (15 swaps)
- Multiple volatile liquidity provisions
- Airdrop flipping behavior (received ARB, immediately swapped)
- Active in last 30 days
- High risk appetite, high activity

### 2. wallet2-steady-staker.json
**Expected Persona: Steady Staker / Blue-Chip Believer**

Characteristics:
- Long-term holdings of blue-chip assets (ETH, WBTC)
- Multiple staking transactions in established protocols (Lido, Aave)
- Active governance participation (5 votes)
- Low risk appetite, high loyalty
- Consistent engagement over 2 years

### 3. wallet3-nft-collector.json
**Expected Persona: NFT Connoisseur / Digital Art Collector**

Characteristics:
- NFT transactions dominate (15 out of 16 transactions are NFT mints)
- High-value NFT purchases (BAYC, CryptoPunks, Azuki)
- Diverse NFT platforms (OpenSea, Blur, Foundation, SuperRare)
- Long-term ETH holding for NFT purchases
- NFT-focused behavior

### 4. wallet4-airdrop-hunter.json
**Expected Persona: Airdrop Hunter / Early Adopter**

Characteristics:
- Multiple airdrop claims from different protocols (6 airdrops)
- Immediate flipping of airdrop tokens
- Interactions with new protocols (ZkSync, Scroll, Base, Linea, Blast)
- Low loyalty score due to flipping behavior
- Early adopter trait

### 5. wallet5-protocol-specialist.json
**Expected Persona: Protocol Specialist / Governance Participant**

Characteristics:
- 100% of transactions on Uniswap protocol
- Multiple governance votes (5 votes)
- Repeated liquidity provision on same protocol
- Consistent engagement over time
- Protocol specialist and governance participant traits

## Usage

To analyze any of these wallets using the CLI:

```bash
npm run build
npm run cli examples/wallet1-defi-degen.json
```

Or after installing globally:

```bash
persona-protocol examples/wallet2-steady-staker.json
```

## Testing Different Personas

These examples are designed to trigger different persona titles, traits, and scoring patterns:

- **High Risk + High Activity**: wallet1-defi-degen.json
- **High Loyalty + Low Risk**: wallet2-steady-staker.json
- **NFT Dominant**: wallet3-nft-collector.json
- **Airdrop Hunter**: wallet4-airdrop-hunter.json
- **Protocol Specialist**: wallet5-protocol-specialist.json

Each wallet validates different requirements and correctness properties from the design specification.
