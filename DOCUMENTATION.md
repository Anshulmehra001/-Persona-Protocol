# Persona Protocol - Complete Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture & Design](#architecture--design)
3. [Core Components](#core-components)
4. [Data Flow](#data-flow)
5. [Scoring Algorithms](#scoring-algorithms)
6. [API Reference](#api-reference)
7. [Testing Strategy](#testing-strategy)
8. [Usage Examples](#usage-examples)
9. [Development Guide](#development-guide)
10. [Troubleshooting](#troubleshooting)

---

## 1. Project Overview

### What is Persona Protocol?

Persona Protocol is a **Web3 wallet analysis system** that transforms raw blockchain transaction data into actionable behavioral insights. It analyzes a crypto wallet's transaction history and generates a comprehensive persona profile that characterizes the wallet owner's behavior patterns.

### Key Features

- **Behavioral Analysis**: Analyzes transaction patterns to understand wallet behavior
- **Risk Assessment**: Calculates risk appetite based on trading and investment patterns
- **Loyalty Metrics**: Measures long-term holding vs. short-term flipping behavior
- **Activity Tracking**: Evaluates engagement levels with the blockchain ecosystem
- **Persona Generation**: Creates human-readable profiles with titles, summaries, and traits
- **Protocol Analysis**: Identifies most-used DeFi protocols and platforms

### Real-World Applications

1. **DeFi Platforms**: Personalize user experiences based on behavior
2. **Risk Assessment**: Evaluate creditworthiness for lending protocols
3. **Marketing**: Segment users for targeted campaigns
4. **Analytics Dashboards**: Provide insights to wallet owners
5. **Research**: Study Web3 adoption and usage patterns
6. **NFT Marketplaces**: Identify collector types and preferences


---

## 2. Architecture & Design

### System Architecture

The system follows a **pipeline architecture** with five main stages:

```
Input JSON → Validator → Analyzer → Calculator → Generator → Formatter → Output JSON
```

#### Pipeline Stages:

1. **Input Validation & Parsing**: Validates JSON structure and extracts wallet data
2. **Transaction Analysis**: Processes transactions to extract behavioral signals
3. **Score Calculation**: Computes risk, loyalty, and activity scores
4. **Persona Generation**: Creates title, summary, and identifies traits
5. **Output Formatting**: Produces valid JSON output

### Design Principles

- **Stateless**: Each analysis is independent with no persistent state
- **Deterministic**: Same input always produces same output
- **Modular**: Each component can be tested and modified independently
- **Extensible**: New transaction types and scoring heuristics can be added easily
- **Type-Safe**: Full TypeScript implementation with strict typing

### Project Structure

```
persona-protocol/
├── src/
│   ├── types/              # Core type definitions
│   ├── interfaces/         # Component interfaces
│   ├── validators/         # Input validation
│   ├── analyzers/          # Transaction analysis
│   ├── calculators/        # Score calculation
│   ├── generators/         # Persona generation
│   ├── formatters/         # Output formatting
│   ├── index.ts           # Main pipeline
│   └── cli.ts             # Command-line interface
├── examples/              # Example wallet data
├── tests/                 # Test files (co-located)
└── docs/                  # Documentation
```

---

## 3. Core Components

### 3.1 Type System (`src/types/`)

#### Transaction Types

The system supports **7 transaction types**:

1. **swap**: Token exchanges on DEXs (Uniswap, SushiSwap, etc.)
2. **nft_mint**: Minting or purchasing NFTs
3. **stake**: Staking tokens in protocols
4. **provide_liquidity**: Adding liquidity to pools
5. **receive_airdrop**: Receiving airdropped tokens
6. **governance_vote**: Participating in DAO governance
7. **token_hold**: Long-term token holding

#### Core Data Structures

```typescript
// Input structure
interface WalletData {
  walletAddress: string;
  transactions: Transaction[];
}

interface Transaction {
  hash: string;              // Transaction hash
  timestamp: string;         // ISO 8601 timestamp
  type: TransactionType;     // One of 7 types
  details: TransactionDetails;
}

interface TransactionDetails {
  protocol?: string;         // Protocol name (e.g., "Uniswap")
  is_new_protocol?: boolean; // Is this a new/experimental protocol?
  [key: string]: any;        // Additional type-specific fields
}

// Output structure
interface PersonaProfile {
  walletAddress: string;
  personaTitle: string;      // e.g., "DeFi Degen"
  summary: string;           // 2-3 sentence narrative
  scores: Scores;
  keyTraits: string[];       // 3-5 behavioral traits
  notableProtocols: string[]; // Top 3-5 protocols
}

interface Scores {
  riskAppetite: number;      // 1-100
  loyalty: number;           // 1-100
  activity: number;          // 1-100
}
```

### 3.2 Input Validator (`src/validators/InputValidator.ts`)

**Purpose**: Validates and parses input JSON to ensure data integrity.

#### Responsibilities:
- Validate JSON structure
- Check required fields (walletAddress, transactions)
- Validate transaction types
- Verify transaction field completeness
- Parse JSON strings into typed objects

#### Key Methods:

```typescript
class InputValidator {
  // Validates wallet data structure
  validate(input: unknown): ValidationResult
  
  // Parses JSON string and validates
  parse(input: string): WalletData
}
```

#### Validation Rules:

1. **walletAddress**: Must be a non-empty string
2. **transactions**: Must be an array (can be empty)
3. **Each transaction must have**:
   - `hash`: Non-empty string
   - `timestamp`: Valid ISO 8601 date string
   - `type`: One of 7 supported types
   - `details`: Object (can be empty)

#### Error Handling:

- Returns `ValidationResult` with `isValid` flag and `errors` array
- Throws descriptive errors during parsing
- Continues validation to collect all errors (doesn't fail fast)

#### Example Usage:

```typescript
const validator = new InputValidator();

// Validate object
const result = validator.validate(walletData);
if (!result.isValid) {
  console.error('Validation errors:', result.errors);
}

// Parse JSON string
try {
  const walletData = validator.parse(jsonString);
} catch (error) {
  console.error('Parse error:', error.message);
}
```

### 3.3 Transaction Analyzer (`src/analyzers/TransactionAnalyzer.ts`)

**Purpose**: Extracts behavioral signals from transaction history.

#### What It Analyzes:

1. **Swap Frequency**: How often the wallet trades tokens
2. **New Protocol Interactions**: Engagement with experimental protocols
3. **Liquidity Provisions**: LP positions and their volatility
4. **Blue-Chip Holdings**: Long-term holdings of established assets (ETH, WBTC)
5. **Stable Stakes**: Staking in established protocols
6. **Hold Durations**: How long tokens are held before selling
7. **Governance Votes**: DAO participation
8. **Airdrop Flips**: Quick selling of airdropped tokens
9. **Protocol Frequency**: Usage patterns across protocols
10. **NFT Transactions**: NFT minting and trading activity
11. **Recent Activity**: Transactions in last 30 days
12. **Dormancy Periods**: Gaps between transactions

#### Key Methods:

```typescript
class TransactionAnalyzer {
  analyze(transactions: Transaction[]): AnalysisResult
}

interface AnalysisResult {
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
```

#### Analysis Logic:

**Blue-Chip Detection**:
- Identifies holdings of ETH, WBTC, and other established assets
- Calculates hold duration in days
- Flags long-term holdings (>90 days)

**Airdrop Flip Detection**:
- Matches `receive_airdrop` with subsequent `swap` transactions
- Calculates time delta between receiving and selling
- Flags flips within 7 days as "quick flips"

**Protocol Frequency**:
- Counts interactions per protocol
- Builds frequency map for ranking
- Identifies protocol specialists (>60% on one protocol)

**Dormancy Calculation**:
- Sorts transactions by timestamp
- Calculates gaps between consecutive transactions
- Identifies dormancy periods >90 days

### 3.4 Score Calculator (`src/calculators/ScoreCalculator.ts`)

**Purpose**: Calculates three behavioral scores based on transaction analysis.

#### The Three Scores:

1. **Risk Appetite (1-100)**: Willingness to engage in high-risk activities
2. **Loyalty (1-100)**: Tendency to hold assets long-term vs. flip quickly
3. **Activity (1-100)**: Level of engagement with blockchain ecosystem

#### Scoring Algorithms:

##### Risk Appetite Calculation

```
Base Score: 50

Increases Risk (+):
  +5 per swap transaction (max +30)
  +10 per new protocol interaction (max +20)
  +8 per volatile liquidity provision (max +20)

Decreases Risk (-):
  -10 per blue-chip long hold (max -30)
  -8 per stable stake in established protocol (max -20)

Final: Clamp to [1, 100]
```

**Interpretation**:
- **1-30**: Conservative, risk-averse investor
- **31-60**: Balanced approach
- **61-100**: Aggressive, high-risk trader

##### Loyalty Calculation

```
Base Score: 50

Increases Loyalty (+):
  +0.1 per day of token holding (max +30)
  +8 per governance vote (max +20)
  +5 per repeated protocol usage (max +20)

Decreases Loyalty (-):
  -15 per airdrop flip (max -30)
  -0.5 per day of short holding (max -20)

Final: Clamp to [1, 100]
```

**Interpretation**:
- **1-30**: Short-term flipper, mercenary capital
- **31-60**: Mixed holding strategy
- **61-85**: Long-term holder
- **86-100**: "Diamond Hands" - extreme loyalty

##### Activity Calculation

```
Base Score: 30

Increases Activity (+):
  +1 per transaction (max +40)
  +2 per transaction in last 30 days (max +30)

Decreases Activity (-):
  -5 per dormancy period >90 days (max -20)

Final: Clamp to [1, 100]
```

**Interpretation**:
- **1-30**: Dormant or inactive wallet
- **31-60**: Moderate activity
- **61-100**: Highly active, engaged user

#### Key Methods:

```typescript
class ScoreCalculator {
  calculateRiskAppetite(analysis: AnalysisResult): number
  calculateLoyalty(analysis: AnalysisResult): number
  calculateActivity(analysis: AnalysisResult): number
}
```

### 3.5 Persona Generator (`src/generators/PersonaGenerator.ts`)

**Purpose**: Synthesizes scores and analysis into human-readable persona profiles.

#### What It Generates:

1. **Persona Title**: Catchy name describing wallet behavior
2. **Summary**: 2-3 sentence narrative description
3. **Key Traits**: 3-5 behavioral characteristics
4. **Notable Protocols**: Top 3-5 most-used protocols

#### Title Generation Logic

Uses a **decision tree** based on scores and transaction patterns:

```
IF NFT transactions > 50% of total:
  → "NFT Connoisseur", "Digital Art Collector", "NFT Enthusiast"

ELSE IF risk > 70 AND activity > 70:
  → "DeFi Degen", "Active Trader", "High-Frequency Trader"

ELSE IF loyalty > 70 AND risk < 40:
  → "Steady Staker", "Blue-Chip Believer", "Long-Term Holder"

ELSE IF activity < 30:
  → "Dormant Wallet", "Inactive Holder", "Sleeping Giant"

ELSE:
  → "Balanced Investor", "Diversified User", "Web3 Explorer"
```

#### Summary Generation

Template-based approach with dynamic content:

```
Sentence 1: Overall characterization
  "This wallet exhibits [behavior pattern] with [key characteristic]."

Sentence 2: Specific behaviors and protocols
  "Primary activity includes [top behaviors] on [top protocols]."

Sentence 3 (optional): Additional context
  "Notable for [special traits or patterns]."
```

**Example**:
> "This wallet exhibits aggressive trading behavior with high risk appetite. Primary activity includes frequent swaps on Uniswap and SushiSwap, with occasional liquidity provision. Notable for early adoption of new protocols and active governance participation."

#### Trait Identification

**Available Traits**:

1. **Airdrop Hunter**: 5+ airdrops from different sources
2. **Early Adopter**: Interacts with new/experimental protocols
3. **Diamond Hands**: Loyalty score > 85
4. **Protocol Specialist**: >60% transactions on one protocol
5. **Governance Participant**: Has governance votes
6. **Liquidity Provider**: Provides liquidity regularly
7. **NFT Collector**: Significant NFT activity
8. **Blue-Chip Holder**: Holds established assets long-term
9. **Stable Farmer**: Stakes stablecoins for yield
10. **High-Frequency Trader**: Very high swap frequency

**Selection Logic**:
- Calculate relevance score for each trait
- Rank by relevance
- Select top 3-5 traits
- Ensure minimum of 3 traits (add generic if needed)

#### Protocol Ranking

```typescript
getNotableProtocols(analysis: AnalysisResult): string[] {
  // 1. Extract protocol frequency map
  // 2. Sort by interaction count (descending)
  // 3. Return top 3-5 protocols
  // 4. If <3 protocols exist, return all
}
```

### 3.6 Output Formatter (`src/formatters/OutputFormatter.ts`)

**Purpose**: Formats persona profile as valid JSON output.

#### Responsibilities:

- Serialize PersonaProfile to JSON
- Validate output structure
- Ensure no additional text outside JSON
- Handle formatting errors gracefully

#### Key Methods:

```typescript
class OutputFormatter {
  format(persona: PersonaProfile): string
}
```

#### Output Structure:

```json
{
  "walletAddress": "0x1234...5678",
  "personaTitle": "DeFi Degen",
  "summary": "This wallet exhibits...",
  "scores": {
    "riskAppetite": 85,
    "loyalty": 45,
    "activity": 92
  },
  "keyTraits": [
    "Early Adopter",
    "High-Frequency Trader",
    "Governance Participant"
  ],
  "notableProtocols": [
    "Uniswap",
    "Aave",
    "Compound"
  ]
}
```

#### Validation:

Before formatting, validates:
- walletAddress is non-empty string
- All scores are integers in [1, 100]
- keyTraits array has 3-5 elements
- notableProtocols array has 0-5 elements
- All required fields are present

#### Error Handling:

Throws descriptive errors for:
- Invalid wallet address
- Out-of-range scores
- Non-integer scores
- Missing required fields
- Invalid array lengths

---

## 4. Data Flow

### Complete Pipeline Flow

```
1. INPUT
   ↓
   User provides JSON string or object
   {
     "walletAddress": "0x...",
     "transactions": [...]
   }

2. VALIDATION
   ↓
   InputValidator.validate() / parse()
   - Checks structure
   - Validates types
   - Ensures completeness
   ↓
   WalletData object

3. ANALYSIS
   ↓
   TransactionAnalyzer.analyze()
   - Processes each transaction
   - Extracts behavioral signals
   - Builds frequency maps
   ↓
   AnalysisResult object

4. CALCULATION
   ↓
   ScoreCalculator methods
   - calculateRiskAppetite()
   - calculateLoyalty()
   - calculateActivity()
   ↓
   Scores object (3 integers)

5. GENERATION
   ↓
   PersonaGenerator methods
   - generateTitle()
   - generateSummary()
   - generateTraits()
   - getNotableProtocols()
   ↓
   PersonaProfile object

6. FORMATTING
   ↓
   OutputFormatter.format()
   - Validates structure
   - Serializes to JSON
   ↓
   JSON string

7. OUTPUT
   ↓
   Valid JSON returned to user
```

### Main Entry Point

```typescript
// src/index.ts
export function analyzeWallet(input: string | WalletData): string {
  // 1. Validate/Parse
  const validator = new InputValidator();
  const walletData = typeof input === 'string' 
    ? validator.parse(input) 
    : input;
  
  // 2. Analyze
  const analyzer = new TransactionAnalyzer();
  const analysis = analyzer.analyze(walletData.transactions);
  
  // 3. Calculate
  const calculator = new ScoreCalculator();
  const scores = {
    riskAppetite: calculator.calculateRiskAppetite(analysis),
    loyalty: calculator.calculateLoyalty(analysis),
    activity: calculator.calculateActivity(analysis)
  };
  
  // 4. Generate
  const generator = new PersonaGenerator();
  const persona: PersonaProfile = {
    walletAddress: walletData.walletAddress,
    personaTitle: generator.generateTitle(scores, analysis),
    summary: generator.generateSummary(scores, analysis),
    scores,
    keyTraits: generator.generateTraits(scores, analysis),
    notableProtocols: generator.getNotableProtocols(analysis)
  };
  
  // 5. Format
  const formatter = new OutputFormatter();
  return formatter.format(persona);
}
```

---

## 5. Scoring Algorithms (Deep Dive)

### Risk Appetite Algorithm

#### Factors That Increase Risk:

**1. Swap Frequency** (Weight: +5 per swap, max +30)
- Frequent trading indicates active risk-taking
- More swaps = more exposure to price volatility
- Caps at 6 swaps to prevent over-weighting

**2. New Protocol Interactions** (Weight: +10 per interaction, max +20)
- Using experimental protocols is inherently risky
- Early adopters face smart contract risks
- Caps at 2 interactions

**3. Volatile Liquidity Provision** (Weight: +8 per provision, max +20)
- Providing liquidity to volatile pairs = impermanent loss risk
- Requires active management
- Caps at 2-3 provisions

#### Factors That Decrease Risk:

**1. Blue-Chip Long Holds** (Weight: -10 per hold, max -30)
- Holding ETH, WBTC long-term = conservative strategy
- Indicates preference for established assets
- Caps at 3 holdings

**2. Stable Stakes** (Weight: -8 per stake, max -20)
- Staking stablecoins or blue-chips in established protocols
- Low-risk yield farming
- Caps at 2-3 stakes

#### Example Calculation:

```
Wallet with:
- 8 swaps
- 1 new protocol interaction
- 2 blue-chip holds
- 1 stable stake

Risk Score:
  Base: 50
  + Swaps: min(8 * 5, 30) = +30
  + New protocols: 1 * 10 = +10
  - Blue-chip: 2 * 10 = -20
  - Stable stake: 1 * 8 = -8
  = 50 + 30 + 10 - 20 - 8 = 62
  
Final: 62 (Moderate-High Risk)
```

### Loyalty Algorithm

#### Factors That Increase Loyalty:

**1. Hold Duration** (Weight: +0.1 per day, max +30)
- Long holding periods indicate commitment
- Calculated across all token_hold transactions
- Caps at 300 days total

**2. Governance Votes** (Weight: +8 per vote, max +20)
- Voting shows protocol commitment
- Requires token locking
- Caps at 2-3 votes

**3. Repeated Protocol Usage** (Weight: +5 per repeat, max +20)
- Using same protocol multiple times
- Indicates trust and familiarity
- Caps at 4 repeats

#### Factors That Decrease Loyalty:

**1. Airdrop Flips** (Weight: -15 per flip, max -30)
- Selling airdrops within 7 days
- Indicates mercenary behavior
- Caps at 2 flips

**2. Short Holding Periods** (Weight: -0.5 per day, max -20)
- Holding <7 days before selling
- Indicates flipping behavior
- Caps at 40 days total

#### Example Calculation:

```
Wallet with:
- 180 days total hold duration
- 2 governance votes
- 3 repeated protocol uses
- 1 airdrop flip

Loyalty Score:
  Base: 50
  + Hold duration: min(180 * 0.1, 30) = +18
  + Governance: 2 * 8 = +16
  + Repeats: 3 * 5 = +15
  - Airdrop flip: 1 * 15 = -15
  = 50 + 18 + 16 + 15 - 15 = 84
  
Final: 84 (High Loyalty, close to Diamond Hands)
```

### Activity Algorithm

#### Factors That Increase Activity:

**1. Total Transactions** (Weight: +1 per tx, max +40)
- More transactions = more engagement
- Caps at 40 transactions

**2. Recent Activity** (Weight: +2 per tx in last 30 days, max +30)
- Recent transactions weighted more heavily
- Shows current engagement
- Caps at 15 recent transactions

#### Factors That Decrease Activity:

**1. Dormancy Periods** (Weight: -5 per period >90 days, max -20)
- Long gaps indicate inactivity
- Reduces overall activity score
- Caps at 4 dormancy periods

#### Example Calculation:

```
Wallet with:
- 25 total transactions
- 8 transactions in last 30 days
- 1 dormancy period (120 days)

Activity Score:
  Base: 30
  + Total: min(25 * 1, 40) = +25
  + Recent: min(8 * 2, 30) = +16
  - Dormancy: 1 * 5 = -5
  = 30 + 25 + 16 - 5 = 66
  
Final: 66 (Moderately Active)
```

---

## 6. API Reference

### Main Function

#### `analyzeWallet(input: string | WalletData): string`

Analyzes a wallet and returns a JSON string with the persona profile.

**Parameters**:
- `input`: Either a JSON string or WalletData object

**Returns**: JSON string containing PersonaProfile

**Throws**:
- `Error` if JSON is invalid
- `Error` if validation fails
- `Error` if required fields are missing

**Example**:
```typescript
import { analyzeWallet } from 'persona-protocol';

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

### Component Classes

#### InputValidator

```typescript
class InputValidator {
  validate(input: unknown): ValidationResult
  parse(input: string): WalletData
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
```

#### TransactionAnalyzer

```typescript
class TransactionAnalyzer {
  analyze(transactions: Transaction[]): AnalysisResult
}
```

#### ScoreCalculator

```typescript
class ScoreCalculator {
  calculateRiskAppetite(analysis: AnalysisResult): number
  calculateLoyalty(analysis: AnalysisResult): number
  calculateActivity(analysis: AnalysisResult): number
}
```

#### PersonaGenerator

```typescript
class PersonaGenerator {
  generateTitle(scores: Scores, analysis: AnalysisResult): string
  generateSummary(scores: Scores, analysis: AnalysisResult): string
  generateTraits(scores: Scores, analysis: AnalysisResult): string[]
  getNotableProtocols(analysis: AnalysisResult): string[]
}
```

#### OutputFormatter

```typescript
class OutputFormatter {
  format(persona: PersonaProfile): string
}
```

### CLI Usage

```bash
# Analyze a wallet from JSON file
npm run analyze examples/wallet1-defi-degen.json

# Or using node directly
node dist/cli.js examples/wallet1-defi-degen.json

# Pipe output to file
npm run analyze examples/wallet1-defi-degen.json > output.json
```

---

## 7. Testing Strategy

### Testing Philosophy

The project uses a **dual testing approach**:

1. **Unit Tests**: Verify specific examples and edge cases
2. **Property-Based Tests**: Verify universal properties across random inputs

### Test Coverage

**Total Tests**: 49 tests across 7 test suites

#### Test Breakdown:

1. **Input Validation** (6 tests)
   - Property 1: Valid input acceptance
   - Property 2: Invalid input rejection
   - Property 3: Transaction type validation
   - Unit tests for parsing and error handling

2. **Transaction Analysis** (1 test)
   - Property 22: Protocol frequency accuracy

3. **Score Calculation** (7 tests)
   - Property 4: Score range invariant [1, 100]
   - Property 5: Risk monotonicity (risky behaviors)
   - Property 6: Risk monotonicity (safe behaviors)
   - Property 7: Loyalty monotonicity (loyal behaviors)
   - Property 8: Loyalty monotonicity (disloyal behaviors)
   - Property 9: Activity monotonicity
   - Property 10: Dormancy decreases activity

4. **Persona Generation** (13 tests)
   - Property 11: High risk + high activity title
   - Property 12: High loyalty + low risk title
   - Property 13: NFT-dominant title
   - Property 14: Summary structure (2-3 sentences)
   - Property 15: Summary content relevance
   - Property 16: Airdrop Hunter trait
   - Property 17: Early Adopter trait
   - Property 18: Diamond Hands trait
   - Property 19: Protocol Specialist trait
   - Property 20: Governance Participant trait
   - Property 21: Trait count invariant (3-5)
   - Property 23: Protocol ranking correctness
   - Property 24: Notable protocol count (3-5)

5. **Output Formatting** (8 tests)
   - Property 25: JSON validity
   - Property 26: Output structure completeness
   - Property 27: Score field types
   - Property 28: Output purity (no extra text)
   - Unit tests for error conditions

6. **Integration Tests** (11 tests)
   - Example-based tests (3 realistic wallets)
   - Edge cases (8 boundary conditions)

7. **Type Tests** (3 tests)
   - Core type validation

### Property-Based Testing

Uses **fast-check** library to generate random test data.

#### Example Property Test:

```typescript
// Property 4: Score range invariant
it('Property 4: all calculated scores should be integers in range [1, 100]', () => {
  fc.assert(
    fc.property(validWalletDataArb, (walletData) => {
      const result = analyzeWallet(walletData);
      const parsed = JSON.parse(result);
      
      expect(parsed.scores.riskAppetite).toBeGreaterThanOrEqual(1);
      expect(parsed.scores.riskAppetite).toBeLessThanOrEqual(100);
      expect(parsed.scores.loyalty).toBeGreaterThanOrEqual(1);
      expect(parsed.scores.loyalty).toBeLessThanOrEqual(100);
      expect(parsed.scores.activity).toBeGreaterThanOrEqual(1);
      expect(parsed.scores.activity).toBeLessThanOrEqual(100);
    }),
    { numRuns: 100 } // Run 100 random test cases
  );
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- src/validators/InputValidator.test.ts
```

### Test Data Generators

Custom generators for property-based testing:

```typescript
// Generate valid wallet addresses
const walletAddressArb = fc.hexaString({ minLength: 40, maxLength: 42 })
  .map(hex => hex.startsWith('0x') ? hex : `0x${hex}`);

// Generate valid transaction types
const transactionTypeArb = fc.constantFrom<TransactionType>(
  'swap', 'nft_mint', 'stake', 'provide_liquidity',
  'receive_airdrop', 'governance_vote', 'token_hold'
);

// Generate complete transactions
const transactionArb = fc.record({
  hash: fc.hexaString({ minLength: 64, maxLength: 64 }),
  timestamp: fc.date().map(d => d.toISOString()),
  type: transactionTypeArb,
  details: transactionDetailsArb
});

// Generate complete wallet data
const validWalletDataArb = fc.record({
  walletAddress: walletAddressArb,
  transactions: fc.array(transactionArb, { minLength: 0, maxLength: 100 })
});
```

---

## 8. Usage Examples

### Example 1: DeFi Degen

**Input**:
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "transactions": [
    {
      "hash": "0xabc123...",
      "timestamp": "2024-01-15T10:30:00.000Z",
      "type": "swap",
      "details": {
        "protocol": "Uniswap",
        "from_token": "USDC",
        "to_token": "PEPE",
        "amount": "1000"
      }
    },
    {
      "hash": "0xdef456...",
      "timestamp": "2024-01-16T14:20:00.000Z",
      "type": "provide_liquidity",
      "details": {
        "protocol": "SushiSwap",
        "token1": "ETH",
        "token2": "SHIB",
        "is_volatile": true
      }
    },
    {
      "hash": "0xghi789...",
      "timestamp": "2024-01-17T09:15:00.000Z",
      "type": "swap",
      "details": {
        "protocol": "Uniswap",
        "from_token": "PEPE",
        "to_token": "DOGE"
      }
    }
  ]
}
```

**Output**:
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "personaTitle": "DeFi Degen",
  "summary": "This wallet exhibits aggressive trading behavior with high risk appetite and frequent activity. Primary engagement includes rapid token swaps on Uniswap and volatile liquidity provision on SushiSwap. Notable for chasing trending meme coins and high-frequency trading patterns.",
  "scores": {
    "riskAppetite": 85,
    "loyalty": 25,
    "activity": 78
  },
  "keyTraits": [
    "High-Frequency Trader",
    "Meme Coin Chaser",
    "Liquidity Provider"
  ],
  "notableProtocols": [
    "Uniswap",
    "SushiSwap"
  ]
}
```

### Example 2: Steady Staker

**Input**:
```json
{
  "walletAddress": "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
  "transactions": [
    {
      "hash": "0xaaa111...",
      "timestamp": "2023-06-01T00:00:00.000Z",
      "type": "token_hold",
      "details": {
        "token": "ETH",
        "amount": "10",
        "duration_days": 240
      }
    },
    {
      "hash": "0xbbb222...",
      "timestamp": "2023-07-15T00:00:00.000Z",
      "type": "stake",
      "details": {
        "protocol": "Lido",
        "token": "ETH",
        "amount": "5",
        "is_established": true
      }
    },
    {
      "hash": "0xccc333...",
      "timestamp": "2023-09-20T00:00:00.000Z",
      "type": "governance_vote",
      "details": {
        "protocol": "Lido",
        "proposal_id": "LIP-12"
      }
    }
  ]
}
```

**Output**:
```json
{
  "walletAddress": "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
  "personaTitle": "Steady Staker",
  "summary": "This wallet demonstrates conservative investment strategy with strong long-term holding patterns. Primary focus on blue-chip asset accumulation and staking in established protocols like Lido. Notable for governance participation and diamond hands mentality.",
  "scores": {
    "riskAppetite": 28,
    "loyalty": 88,
    "activity": 42
  },
  "keyTraits": [
    "Diamond Hands",
    "Blue-Chip Holder",
    "Governance Participant",
    "Protocol Specialist"
  ],
  "notableProtocols": [
    "Lido"
  ]
}
```

### Example 3: NFT Collector

**Input**:
```json
{
  "walletAddress": "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t",
  "transactions": [
    {
      "hash": "0xnft001...",
      "timestamp": "2024-01-10T12:00:00.000Z",
      "type": "nft_mint",
      "details": {
        "protocol": "OpenSea",
        "collection": "Bored Ape Yacht Club",
        "token_id": "1234"
      }
    },
    {
      "hash": "0xnft002...",
      "timestamp": "2024-01-12T15:30:00.000Z",
      "type": "nft_mint",
      "details": {
        "protocol": "Rarible",
        "collection": "CryptoPunks",
        "token_id": "5678"
      }
    },
    {
      "hash": "0xnft003...",
      "timestamp": "2024-01-14T09:45:00.000Z",
      "type": "nft_mint",
      "details": {
        "protocol": "OpenSea",
        "collection": "Azuki",
        "token_id": "9012"
      }
    }
  ]
}
```

**Output**:
```json
{
  "walletAddress": "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t",
  "personaTitle": "NFT Connoisseur",
  "summary": "This wallet is heavily focused on NFT collecting with minimal DeFi activity. Primary engagement includes minting and trading digital art across major marketplaces like OpenSea and Rarible. Notable for diverse collection strategy spanning blue-chip NFT projects.",
  "scores": {
    "riskAppetite": 55,
    "loyalty": 62,
    "activity": 58
  },
  "keyTraits": [
    "NFT Collector",
    "Digital Art Enthusiast",
    "Multi-Platform User"
  ],
  "notableProtocols": [
    "OpenSea",
    "Rarible"
  ]
}
```

### Example 4: Airdrop Hunter

**Input**:
```json
{
  "walletAddress": "0xairdrop123456789abcdef",
  "transactions": [
    {
      "hash": "0xair001...",
      "timestamp": "2024-01-05T08:00:00.000Z",
      "type": "receive_airdrop",
      "details": {
        "protocol": "Arbitrum",
        "token": "ARB",
        "amount": "1000"
      }
    },
    {
      "hash": "0xair002...",
      "timestamp": "2024-01-06T10:00:00.000Z",
      "type": "swap",
      "details": {
        "protocol": "Uniswap",
        "from_token": "ARB",
        "to_token": "USDC"
      }
    },
    {
      "hash": "0xair003...",
      "timestamp": "2024-01-10T12:00:00.000Z",
      "type": "receive_airdrop",
      "details": {
        "protocol": "Optimism",
        "token": "OP",
        "amount": "500"
      }
    },
    {
      "hash": "0xair004...",
      "timestamp": "2024-01-11T14:00:00.000Z",
      "type": "swap",
      "details": {
        "protocol": "Uniswap",
        "from_token": "OP",
        "to_token": "ETH"
      }
    }
  ]
}
```

**Output**:
```json
{
  "walletAddress": "0xairdrop123456789abcdef",
  "personaTitle": "Airdrop Hunter",
  "summary": "This wallet specializes in farming airdrops across multiple protocols with quick flip strategy. Primary pattern involves receiving airdrops and immediately converting to stablecoins or ETH. Notable for low loyalty and mercenary capital behavior.",
  "scores": {
    "riskAppetite": 48,
    "loyalty": 18,
    "activity": 65
  },
  "keyTraits": [
    "Airdrop Hunter",
    "Quick Flipper",
    "Multi-Chain User"
  ],
  "notableProtocols": [
    "Uniswap",
    "Arbitrum",
    "Optimism"
  ]
}
```

---

## 9. Development Guide

### Setup

```bash
# Clone repository
git clone https://github.com/Anshulmehra001/-Persona-Protocol.git
cd persona-protocol

# Install dependencies
npm install

# Build project
npm run build

# Run tests
npm test
```

### Project Dependencies

**Core Dependencies**:
- `typescript`: Type-safe JavaScript
- `fast-check`: Property-based testing

**Dev Dependencies**:
- `vitest`: Fast unit test framework
- `@types/node`: Node.js type definitions

### Scripts

```json
{
  "build": "tsc",
  "test": "vitest --run",
  "test:watch": "vitest",
  "test:coverage": "vitest --coverage",
  "analyze": "node dist/cli.js"
}
```

### Adding New Transaction Types

1. **Update Type Definition** (`src/types/index.ts`):
```typescript
export type TransactionType = 
  | 'swap'
  | 'nft_mint'
  | 'stake'
  | 'provide_liquidity'
  | 'receive_airdrop'
  | 'governance_vote'
  | 'token_hold'
  | 'your_new_type'; // Add here
```

2. **Update Analyzer** (`src/analyzers/TransactionAnalyzer.ts`):
```typescript
analyze(transactions: Transaction[]): AnalysisResult {
  // Add logic to handle new type
  const yourNewTypeCount = transactions.filter(
    tx => tx.type === 'your_new_type'
  ).length;
  
  // Include in result
  return {
    // ... existing fields
    yourNewTypeCount
  };
}
```

3. **Update Score Calculation** (if needed):
```typescript
// In ScoreCalculator.ts
calculateRiskAppetite(analysis: AnalysisResult): number {
  // Add scoring logic for new type
  const newTypeImpact = analysis.yourNewTypeCount * weight;
  // ...
}
```

4. **Update Persona Generation** (if needed):
```typescript
// In PersonaGenerator.ts
generateTraits(scores: Scores, analysis: AnalysisResult): string[] {
  // Add trait logic for new type
  if (analysis.yourNewTypeCount > threshold) {
    traits.push('Your New Trait');
  }
  // ...
}
```

5. **Add Tests**:
```typescript
// Add property-based test
it('should handle your_new_type transactions', () => {
  fc.assert(
    fc.property(walletWithNewTypeArb, (wallet) => {
      const result = analyzeWallet(wallet);
      // Assert expected behavior
    })
  );
});
```

### Adding New Traits

1. **Define Trait Logic** (`src/generators/PersonaGenerator.ts`):
```typescript
generateTraits(scores: Scores, analysis: AnalysisResult): string[] {
  const traits: string[] = [];
  
  // Add your trait condition
  if (/* your condition */) {
    traits.push('Your New Trait');
  }
  
  // ... rest of logic
}
```

2. **Add Test**:
```typescript
it('should include Your New Trait when condition is met', () => {
  fc.assert(
    fc.property(walletMeetingConditionArb, (wallet) => {
      const result = analyzeWallet(wallet);
      const parsed = JSON.parse(result);
      expect(parsed.keyTraits).toContain('Your New Trait');
    })
  );
});
```

### Modifying Scoring Weights

All scoring weights are defined in `src/calculators/ScoreCalculator.ts`:

```typescript
// Risk Appetite Weights
private readonly SWAP_WEIGHT = 5;
private readonly SWAP_MAX = 30;
private readonly NEW_PROTOCOL_WEIGHT = 10;
private readonly NEW_PROTOCOL_MAX = 20;
// ... etc

// Modify these constants to adjust scoring behavior
```

After modifying weights:
1. Run tests to ensure properties still hold
2. Update documentation if behavior changes significantly
3. Test with example wallets to verify expected output

### Code Style

- Use TypeScript strict mode
- Follow functional programming principles where possible
- Keep functions pure (no side effects)
- Use descriptive variable names
- Add JSDoc comments for public APIs
- Keep files focused (single responsibility)

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "feat: add your feature"

# Run tests before pushing
npm test

# Push to remote
git push origin feature/your-feature

# Create pull request on GitHub
```

### Debugging

**Enable verbose logging**:
```typescript
// Add console.log statements in development
const analysis = analyzer.analyze(transactions);
console.log('Analysis result:', JSON.stringify(analysis, null, 2));
```

**Run specific test**:
```bash
npm test -- src/calculators/ScoreCalculator.test.ts
```

**Debug in VS Code**:
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Tests",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["test"],
      "console": "integratedTerminal"
    }
  ]
}
```

---

## 10. Troubleshooting

### Common Issues

#### Issue: "Invalid JSON" Error

**Symptom**: Error thrown when calling `analyzeWallet()`

**Causes**:
- Malformed JSON string
- Missing quotes around keys/values
- Trailing commas
- Invalid escape sequences

**Solution**:
```typescript
// Validate JSON before passing
try {
  const parsed = JSON.parse(jsonString);
  const result = analyzeWallet(parsed);
} catch (error) {
  console.error('Invalid JSON:', error.message);
}
```

#### Issue: "Validation failed" Error

**Symptom**: Error during input validation

**Causes**:
- Missing required fields (walletAddress, transactions)
- Invalid transaction type
- Missing transaction fields (hash, timestamp, type, details)

**Solution**:
```typescript
// Check validation result first
const validator = new InputValidator();
const validationResult = validator.validate(input);

if (!validationResult.isValid) {
  console.error('Validation errors:', validationResult.errors);
  // Fix input based on errors
}
```

#### Issue: Scores Always at Extremes (1 or 100)

**Symptom**: Scores consistently hit min/max values

**Causes**:
- Too many transactions of one type
- Weights too high
- Insufficient balancing factors

**Solution**:
- Review scoring weights in `ScoreCalculator.ts`
- Ensure diverse transaction types in input
- Check that caps are appropriate

#### Issue: Wrong Persona Title Generated

**Symptom**: Title doesn't match expected behavior

**Causes**:
- Scores don't reflect actual behavior
- Decision tree logic needs adjustment
- Insufficient transaction data

**Solution**:
```typescript
// Debug scores first
const calculator = new ScoreCalculator();
const scores = {
  riskAppetite: calculator.calculateRiskAppetite(analysis),
  loyalty: calculator.calculateLoyalty(analysis),
  activity: calculator.calculateActivity(analysis)
};
console.log('Scores:', scores);

// Check which title logic is triggered
const generator = new PersonaGenerator();
const title = generator.generateTitle(scores, analysis);
console.log('Generated title:', title);
```

#### Issue: Tests Failing After Changes

**Symptom**: Property-based tests fail with counterexamples

**Causes**:
- Breaking change in scoring logic
- Invalid assumptions in test generators
- Edge case not handled

**Solution**:
1. Review the counterexample provided by fast-check
2. Determine if it's a valid test case
3. Either fix the code or adjust the test generator
4. Re-run tests to verify fix

```bash
# Run tests with verbose output
npm test -- --reporter=verbose

# Run specific failing test
npm test -- src/calculators/ScoreCalculator.test.ts
```

#### Issue: CLI Not Working

**Symptom**: `npm run analyze` fails

**Causes**:
- Project not built
- Invalid file path
- Missing dependencies

**Solution**:
```bash
# Rebuild project
npm run build

# Verify file exists
ls examples/wallet1-defi-degen.json

# Run with absolute path
node dist/cli.js "$(pwd)/examples/wallet1-defi-degen.json"
```

#### Issue: TypeScript Compilation Errors

**Symptom**: `npm run build` fails

**Causes**:
- Type mismatches
- Missing type definitions
- Incorrect imports

**Solution**:
```bash
# Check TypeScript errors
npx tsc --noEmit

# Install missing types
npm install --save-dev @types/node

# Verify tsconfig.json is correct
cat tsconfig.json
```

### Performance Issues

#### Issue: Slow Analysis for Large Wallets

**Symptom**: Analysis takes too long for wallets with many transactions

**Optimization Strategies**:

1. **Limit Transaction Count**:
```typescript
// Only analyze recent transactions
const recentTransactions = transactions
  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  .slice(0, 1000); // Limit to 1000 most recent
```

2. **Use Streaming**:
```typescript
// Process transactions in batches
function analyzeInBatches(transactions: Transaction[], batchSize = 100) {
  const results = [];
  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize);
    results.push(analyzer.analyze(batch));
  }
  return mergeResults(results);
}
```

3. **Cache Results**:
```typescript
// Cache analysis results
const cache = new Map<string, AnalysisResult>();

function analyzeWithCache(walletAddress: string, transactions: Transaction[]) {
  const cacheKey = `${walletAddress}-${transactions.length}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  const result = analyzer.analyze(transactions);
  cache.set(cacheKey, result);
  return result;
}
```

### Getting Help

**Documentation**:
- README.md: Quick start guide
- DOCUMENTATION.md: This comprehensive guide
- Design.md: Architecture and design decisions
- Requirements.md: Formal requirements

**Code Examples**:
- `examples/`: Sample wallet data files
- `src/*.test.ts`: Test files with usage examples

**Community**:
- GitHub Issues: Report bugs or request features
- GitHub Discussions: Ask questions or share ideas

**Contact**:
- Repository: https://github.com/Anshulmehra001/-Persona-Protocol
- Issues: https://github.com/Anshulmehra001/-Persona-Protocol/issues

---

## Appendix

### Glossary

- **Wallet**: Cryptocurrency wallet identified by blockchain address
- **Transaction**: Blockchain operation (swap, stake, mint, etc.)
- **Persona**: Data-driven behavioral profile
- **Risk Appetite**: Willingness to engage in high-risk activities (1-100)
- **Loyalty**: Tendency to hold assets long-term (1-100)
- **Activity**: Level of blockchain engagement (1-100)
- **Protocol**: DeFi platform or smart contract system
- **Blue-Chip**: Established, high-value cryptocurrency
- **Airdrop**: Free token distribution
- **Governance**: DAO voting and participation
- **LP**: Liquidity Provider
- **DEX**: Decentralized Exchange
- **NFT**: Non-Fungible Token

### Transaction Type Details

| Type | Description | Example Protocols |
|------|-------------|-------------------|
| swap | Token exchanges | Uniswap, SushiSwap, PancakeSwap |
| nft_mint | NFT minting/buying | OpenSea, Rarible, Foundation |
| stake | Token staking | Lido, Rocket Pool, Aave |
| provide_liquidity | LP provision | Uniswap, Curve, Balancer |
| receive_airdrop | Airdrop receipt | Arbitrum, Optimism, various |
| governance_vote | DAO voting | Compound, Aave, Uniswap |
| token_hold | Long-term holding | N/A (on-chain holding) |

### Persona Archetypes

| Archetype | Risk | Loyalty | Activity | Description |
|-----------|------|---------|----------|-------------|
| DeFi Degen | High | Low | High | Aggressive trader, chases trends |
| Steady Staker | Low | High | Medium | Conservative, long-term holder |
| NFT Collector | Medium | Medium | Medium | Focused on digital art |
| Airdrop Hunter | Medium | Low | High | Farms airdrops, quick flipper |
| Protocol Specialist | Low | High | Medium | Loyal to specific protocol |
| Dormant Holder | Low | High | Low | Inactive, holding long-term |
| Balanced Investor | Medium | Medium | Medium | Diversified strategy |

### Version History

- **v1.0.0** (2024-12): Initial release
  - Core analysis pipeline
  - 7 transaction types
  - 3 scoring dimensions
  - 49 comprehensive tests
  - CLI interface
  - Example wallet data

### License

MIT License - See LICENSE file for details

### Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

### Acknowledgments

Built with:
- TypeScript
- Vitest
- fast-check
- Node.js

Inspired by Web3 analytics needs and behavioral finance principles.

---

**End of Documentation**

For questions or issues, please visit: https://github.com/Anshulmehra001/-Persona-Protocol
