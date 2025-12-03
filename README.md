# Persona Protocol

Web3 wallet analysis system that generates comprehensive, data-driven persona profiles from blockchain transaction history.

## Project Structure

```
persona-protocol/
├── src/
│   ├── types/           # Core TypeScript type definitions
│   ├── interfaces/      # Component interface definitions
│   └── index.ts         # Main entry point
├── dist/                # Compiled JavaScript output
├── package.json         # Project dependencies
├── tsconfig.json        # TypeScript configuration
└── vitest.config.ts     # Testing configuration
```

## Setup

Install dependencies:
```bash
npm install
```

## Development

Build the project:
```bash
npm run build
```

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Core Types

The project defines the following core types:

- **TransactionType**: Supported transaction types (swap, nft_mint, stake, etc.)
- **WalletData**: Input structure containing wallet address and transactions
- **AnalysisResult**: Behavioral signals extracted from transactions
- **Scores**: Risk appetite, loyalty, and activity scores (1-100)
- **PersonaProfile**: Complete persona output with title, summary, and traits

## Testing

The project uses:
- **Vitest** for unit testing
- **fast-check** for property-based testing

All tests are located alongside their source files with `.test.ts` extension.
