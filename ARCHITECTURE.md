# Persona Protocol - Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PERSONA PROTOCOL                             │
│                    Web3 Wallet Analysis System                       │
└─────────────────────────────────────────────────────────────────────┘

                              INPUT
                                │
                                ▼
                    ┌───────────────────────┐
                    │   JSON Input          │
                    │   - walletAddress     │
                    │   - transactions[]    │
                    └───────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────────────┐
│                        STAGE 1: VALIDATION                            │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  InputValidator (src/validators/InputValidator.ts)              │ │
│  │  ─────────────────────────────────────────────────────────────  │ │
│  │  • Validates JSON structure                                     │ │
│  │  • Checks required fields                                       │ │
│  │  • Validates transaction types                                  │ │
│  │  • Parses JSON strings                                          │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                        WalletData Object
                                │
                                ▼
┌───────────────────────────────────────────────────────────────────────┐
│                        STAGE 2: ANALYSIS                              │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  TransactionAnalyzer (src/analyzers/TransactionAnalyzer.ts)    │ │
│  │  ─────────────────────────────────────────────────────────────  │ │
│  │  Extracts Behavioral Signals:                                   │ │
│  │  • Swap frequency                                               │ │
│  │  • New protocol interactions                                    │ │
│  │  • Liquidity provisions                                         │ │
│  │  • Blue-chip holdings                                           │ │
│  │  • Stable stakes                                                │ │
│  │  • Hold durations                                               │ │
│  │  • Governance votes                                             │ │
│  │  • Airdrop flips                                                │ │
│  │  • Protocol frequency map                                       │ │
│  │  • NFT transactions                                             │ │
│  │  • Recent activity                                              │ │
│  │  • Dormancy periods                                             │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                        AnalysisResult Object
                                │
                                ▼
┌───────────────────────────────────────────────────────────────────────┐
│                     STAGE 3: SCORE CALCULATION                        │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  ScoreCalculator (src/calculators/ScoreCalculator.ts)          │ │
│  │  ─────────────────────────────────────────────────────────────  │ │
│  │  Calculates Three Core Scores:                                  │ │
│  │                                                                  │ │
│  │  1. Risk Appetite (1-100)                                       │ │
│  │     • Base: 50                                                  │ │
│  │     • +5 per swap (max +30)                                     │ │
│  │     • +10 per new protocol (max +20)                            │ │
│  │     • +8 per volatile LP (max +20)                              │ │
│  │     • -10 per blue-chip hold (max -30)                          │ │
│  │     • -8 per stable stake (max -20)                             │ │
│  │                                                                  │ │
│  │  2. Loyalty Score (1-100)                                       │ │
│  │     • Base: 50                                                  │ │
│  │     • +0.1 per hold day (max +30)                               │ │
│  │     • +8 per governance vote (max +20)                          │ │
│  │     • +5 per repeated protocol (max +20)                        │ │
│  │     • -15 per airdrop flip (max -30)                            │ │
│  │     • -0.5 per short hold day (max -20)                         │ │
│  │                                                                  │ │
│  │  3. Activity Score (1-100)                                      │ │
│  │     • Base: 30                                                  │ │
│  │     • +1 per transaction (max +40)                              │ │
│  │     • +2 per recent tx (max +30)                                │ │
│  │     • -5 per dormancy period (max -20)                          │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                          Scores Object
                                │
                                ▼
┌───────────────────────────────────────────────────────────────────────┐
│                    STAGE 4: PERSONA GENERATION                        │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  PersonaGenerator (src/generators/PersonaGenerator.ts)          │ │
│  │  ─────────────────────────────────────────────────────────────  │ │
│  │  Generates Persona Profile:                                     │ │
│  │                                                                  │ │
│  │  • Title Generation (Decision Tree)                             │ │
│  │    - NFT transactions > 50% → NFT-focused                       │ │
│  │    - Risk > 70 & Activity > 70 → Active trader                  │ │
│  │    - Loyalty > 70 & Risk < 40 → Stable holder                   │ │
│  │    - Activity < 30 → Dormant                                    │ │
│  │    - Else → Balanced                                            │ │
│  │                                                                  │ │
│  │  • Summary Generation (Template-based)                          │ │
│  │    - 2-3 sentences describing behavior                          │ │
│  │    - References top protocols                                   │ │
│  │    - Incorporates score characteristics                         │ │
│  │                                                                  │ │
│  │  • Trait Identification                                         │ │
│  │    - Airdrop Hunter (5+ airdrops)                               │ │
│  │    - Early Adopter (new protocols)                              │ │
│  │    - Diamond Hands (loyalty > 85)                               │ │
│  │    - Protocol Specialist (>60% one protocol)                    │ │
│  │    - Governance Participant (votes)                             │ │
│  │    - Returns 3-5 traits                                         │ │
│  │                                                                  │ │
│  │  • Notable Protocols                                            │ │
│  │    - Top 3-5 by interaction frequency                           │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                      PersonaProfile Object
                                │
                                ▼
┌───────────────────────────────────────────────────────────────────────┐
│                     STAGE 5: OUTPUT FORMATTING                        │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  OutputFormatter (src/formatters/OutputFormatter.ts)            │ │
│  │  ─────────────────────────────────────────────────────────────  │ │
│  │  • Serializes to JSON                                           │ │
│  │  • Validates output structure                                   │ │
│  │  • Ensures pure JSON (no extra text)                            │ │
│  │  • Returns formatted string                                     │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                           JSON OUTPUT
                    ┌───────────────────────┐
                    │  {                    │
                    │    walletAddress,     │
                    │    personaTitle,      │
                    │    summary,           │
                    │    scores: {          │
                    │      riskAppetite,    │
                    │      loyalty,         │
                    │      activity         │
                    │    },                 │
                    │    keyTraits[],       │
                    │    notableProtocols[] │
                    │  }                    │
                    └───────────────────────┘
```

## Core Components

### 1. InputValidator (`src/validators/InputValidator.ts`)

**Purpose**: Validates and parses incoming JSON data

**Key Methods**:
- `validate(input: unknown): ValidationResult` - Validates structure and fields
- `parse(jsonString: string): WalletData` - Parses JSON string to WalletData

**Validation Rules**:
- Required fields: `walletAddress`, `transactions`
- Transaction fields: `hash`, `timestamp`, `type`, `details`
- Valid transaction types: swap, nft_mint, stake, provide_liquidity, receive_airdrop, governance_vote, token_hold

**Error Handling**:
- Returns validation errors with descriptive messages
- Throws on invalid JSON or failed validation

### 2. TransactionAnalyzer (`src/analyzers/TransactionAnalyzer.ts`)

**Purpose**: Extracts behavioral signals from transaction history

**Key Method**:
- `analyze(transactions: Transaction[]): AnalysisResult`

**Analysis Metrics**:
- **Swap Frequency**: Count of swap transactions
- **New Protocol Interactions**: Protocols marked as `is_new_protocol: true`
- **Liquidity Provisions**: LP transactions with volatility assessment
- **Blue-chip Holdings**: Long-term holds of ETH, WBTC
- **Stable Stakes**: Staking in established protocols
- **Hold Durations**: Time between token acquisition and disposal
- **Governance Votes**: Participation in protocol governance
- **Airdrop Flips**: Quick sells after receiving airdrops
- **Protocol Frequency**: Interaction count per protocol
- **NFT Transactions**: Count of NFT mints
- **Recent Activity**: Transactions in last 30 days
- **Dormancy Periods**: Gaps > 90 days between transactions

**Time Complexity**: O(n) where n = number of transactions

### 3. ScoreCalculator (`src/calculators/ScoreCalculator.ts`)

**Purpose**: Calculates three behavioral scores from analysis results

**Key Methods**:
- `calculateRiskAppetite(analysis: AnalysisResult): number`
- `calculateLoyalty(analysis: AnalysisResult): number`
- `calculateActivity(analysis: AnalysisResult): number`

**Scoring Algorithms**:

**Risk Appetite** (1-100):
```
Base: 50
+ Risky behaviors:
  • +5 per swap (capped at +30)
  • +10 per new protocol (capped at +20)
  • +8 per volatile LP (capped at +20)
- Safe behaviors:
  • -10 per blue-chip hold (capped at -30)
  • -8 per stable stake (capped at -20)
Final: Clamped to [1, 100]
```

**Loyalty** (1-100):
```
Base: 50
+ Loyal behaviors:
  • +0.1 per day of holding (capped at +30)
  • +8 per governance vote (capped at +20)
  • +5 per repeated protocol usage (capped at +20)
- Disloyal behaviors:
  • -15 per airdrop flip (capped at -30)
  • -0.5 per day of short holding (capped at -20)
Final: Clamped to [1, 100]
```

**Activity** (1-100):
```
Base: 30
+ Active behaviors:
  • +1 per transaction (capped at +40)
  • +2 per transaction in last 30 days (capped at +30)
- Inactive behaviors:
  • -5 per dormancy period > 90 days (capped at -20)
Final: Clamped to [1, 100]
```

### 4. PersonaGenerator (`src/generators/PersonaGenerator.ts`)

**Purpose**: Generates human-readable persona profile

**Key Methods**:
- `generateTitle(scores: Scores, analysis: AnalysisResult): string`
- `generateSummary(scores: Scores, analysis: AnalysisResult): string`
- `generateTraits(scores: Scores, analysis: AnalysisResult): string[]`
- `getNotableProtocols(analysis: AnalysisResult): string[]`

**Title Generation Logic** (Decision Tree):
```
1. If NFT transactions > 50% total → NFT-focused titles
   Examples: "NFT Connoisseur", "Digital Art Collector"

2. Else if risk > 70 AND activity > 70 → Active trader titles
   Examples: "DeFi Degen", "Active Trader", "Yield Farmer"

3. Else if loyalty > 70 AND risk < 40 → Stable holder titles
   Examples: "Steady Staker", "Blue-Chip Believer", "HODLer"

4. Else if activity < 30 → Dormant titles
   Examples: "Dormant Wallet", "Inactive Holder"

5. Else → Balanced titles
   Examples: "Balanced Investor", "Casual DeFi User"
```

**Trait Identification**:
- **Airdrop Hunter**: 5+ airdrops from different sources
- **Early Adopter**: Interactions with new protocols
- **Diamond Hands**: Loyalty score > 85
- **Protocol Specialist**: >60% transactions on one protocol
- **Governance Participant**: Any governance votes
- Returns 3-5 traits (adds generic traits if < 3)

**Summary Generation**:
- Template-based with dynamic content
- 2-3 sentences
- References top protocols
- Incorporates score characteristics

### 5. OutputFormatter (`src/formatters/OutputFormatter.ts`)

**Purpose**: Formats persona profile as valid JSON

**Key Method**:
- `format(persona: PersonaProfile): string`

**Output Structure**:
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
    "Airdrop Hunter",
    "Early Adopter",
    "Governance Participant"
  ],
  "notableProtocols": [
    "Uniswap",
    "Aave",
    "Lido"
  ]
}
```

**Validation**:
- Ensures all required fields present
- Validates score ranges [1, 100]
- Ensures scores are integers
- Returns pure JSON (no extra text)

## Data Flow

### Input → Output Pipeline

```typescript
// 1. Validate and parse input
const validator = new InputValidator();
const walletData = validator.parse(jsonInput);

// 2. Analyze transactions
const analyzer = new TransactionAnalyzer();
const analysis = analyzer.analyze(walletData.transactions);

// 3. Calculate scores
const calculator = new ScoreCalculator();
const scores = {
  riskAppetite: calculator.calculateRiskAppetite(analysis),
  loyalty: calculator.calculateLoyalty(analysis),
  activity: calculator.calculateActivity(analysis)
};

// 4. Generate persona
const generator = new PersonaGenerator();
const persona = {
  walletAddress: walletData.walletAddress,
  personaTitle: generator.generateTitle(scores, analysis),
  summary: generator.generateSummary(scores, analysis),
  scores,
  keyTraits: generator.generateTraits(scores, analysis),
  notableProtocols: generator.getNotableProtocols(analysis)
};

// 5. Format output
const formatter = new OutputFormatter();
const output = formatter.format(persona);
```

## Type System

### Core Types (`src/types/index.ts`)

```typescript
// Transaction Types
type TransactionType = 
  | 'swap' 
  | 'nft_mint' 
  | 'stake' 
  | 'provide_liquidity' 
  | 'receive_airdrop' 
  | 'governance_vote' 
  | 'token_hold';

interface Transaction {
  hash: string;
  timestamp: string;
  type: TransactionType;
  details: TransactionDetails;
}

interface TransactionDetails {
  protocol?: string;
  is_new_protocol?: boolean;
  [key: string]: any;
}

// Input/Output Types
interface WalletData {
  walletAddress: string;
  transactions: Transaction[];
}

interface Scores {
  riskAppetite: number;
  loyalty: number;
  activity: number;
}

interface PersonaProfile {
  walletAddress: string;
  personaTitle: string;
  summary: string;
  scores: Scores;
  keyTraits: string[];
  notableProtocols: string[];
}

// Analysis Types
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

## Design Principles

### 1. Stateless Architecture
- No persistent state between analyses
- Each analysis is independent
- Deterministic: same input → same output
- Thread-safe and parallelizable

### 2. Modularity
- Clear separation of concerns
- Each component has single responsibility
- Components can be tested independently
- Easy to extend or replace components

### 3. Type Safety
- Full TypeScript type coverage
- Compile-time type checking
- Interface-driven design
- Prevents runtime type errors

### 4. Error Handling
- Graceful degradation
- Descriptive error messages
- Validation at boundaries
- No silent failures

### 5. Testability
- Property-based testing with fast-check
- Unit tests for specific cases
- Integration tests for full pipeline
- 49 tests with 100% pass rate

## Performance Characteristics

### Time Complexity
- **Input Validation**: O(n) where n = number of transactions
- **Transaction Analysis**: O(n) single pass through transactions
- **Score Calculation**: O(1) arithmetic operations
- **Persona Generation**: O(p) where p = number of protocols (typically small)
- **Output Formatting**: O(1) JSON serialization
- **Overall**: O(n) linear time complexity

### Space Complexity
- **Transaction Storage**: O(n) for transaction array
- **Protocol Frequency Map**: O(p) where p = unique protocols
- **Analysis Results**: O(n) in worst case
- **Overall**: O(n) linear space complexity

### Scalability
- Can handle wallets with thousands of transactions
- Memory-efficient single-pass algorithms
- No recursive operations
- Suitable for batch processing

## Extension Points

### Adding New Transaction Types

1. Update `TransactionType` in `src/types/index.ts`
2. Add handling in `TransactionAnalyzer.analyze()`
3. Update scoring algorithms if needed
4. Add validation in `InputValidator`
5. Update tests

### Adding New Scoring Factors

1. Extract new signals in `TransactionAnalyzer`
2. Update `AnalysisResult` interface
3. Modify scoring algorithms in `ScoreCalculator`
4. Update property-based tests
5. Document in design.md

### Adding New Traits

1. Define trait criteria in `PersonaGenerator.generateTraits()`
2. Add detection logic based on analysis results
3. Update trait selection algorithm
4. Add property-based tests
5. Document in requirements.md

### Custom Persona Titles

1. Extend decision tree in `PersonaGenerator.generateTitle()`
2. Add new title categories
3. Define score/behavior thresholds
4. Update tests
5. Document title logic

## Integration Patterns

### As a Library

```typescript
import { analyzeWallet } from 'persona-protocol';

const result = analyzeWallet(walletJsonString);
console.log(JSON.parse(result));
```

### As a CLI Tool

```bash
npm run analyze examples/wallet1-defi-degen.json
```

### As an API Endpoint

```typescript
app.post('/analyze', (req, res) => {
  try {
    const result = analyzeWallet(JSON.stringify(req.body));
    res.json(JSON.parse(result));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

### As a Microservice

```typescript
// Docker container exposing REST API
// Kubernetes deployment for scaling
// Message queue for batch processing
```

## Security Considerations

### Input Validation
- Strict JSON schema validation
- Type checking on all inputs
- Sanitization of user-provided data
- Protection against injection attacks

### Data Privacy
- No data persistence
- Stateless processing
- No external API calls
- Wallet addresses treated as identifiers only

### Error Information
- No sensitive data in error messages
- Generic error responses
- Detailed logging for debugging
- Rate limiting recommended for production

## Future Enhancements

### Planned Features
1. Multi-chain support (Polygon, BSC, Arbitrum)
2. Historical persona tracking
3. Comparative analysis (peer groups)
4. Predictive modeling
5. Social graph integration
6. Real-time blockchain data integration
7. Custom scoring weights
8. Machine learning-based classification

### Optimization Opportunities
1. Caching for repeated analyses
2. Streaming processing for large datasets
3. Parallel processing for batch operations
4. Database integration for historical data
5. GraphQL API for flexible queries

## Testing Strategy

### Property-Based Testing
- 28 correctness properties
- 100+ iterations per property
- Random input generation with fast-check
- Validates universal invariants

### Unit Testing
- Specific example validation
- Edge case coverage
- Error condition testing
- Integration testing

### Test Coverage
- 49 tests across 7 test suites
- All tests passing
- Comprehensive validation of requirements
- Continuous integration ready

## Deployment

### Build Process
```bash
npm run build    # Compile TypeScript to JavaScript
npm test         # Run all tests
npm run analyze  # Test with examples
```

### Distribution
- NPM package
- Docker container
- Serverless function
- Standalone binary

### Monitoring
- Error tracking
- Performance metrics
- Usage analytics
- Health checks

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Maintainer**: Persona Protocol Team