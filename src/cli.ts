#!/usr/bin/env node

/**
 * Persona Protocol CLI
 * Command-line interface for wallet analysis
 * Requirements: 1.1, 8.1
 */

import * as fs from 'fs';
import * as path from 'path';
import { analyzeWallet } from './index.js';

/**
 * Main CLI function
 * Accepts JSON file path as input and outputs formatted JSON to stdout
 */
function main() {
  const args = process.argv.slice(2);

  // Check for help flag or no arguments
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
Persona Protocol - Web3 Wallet Analysis CLI

Usage:
  persona-protocol <input-file.json>
  persona-protocol --help

Arguments:
  <input-file.json>    Path to JSON file containing wallet data

Example:
  persona-protocol examples/wallet1.json
    `);
    process.exit(args.length === 0 ? 1 : 0);
  }

  const inputFilePath = args[0];

  try {
    // Read input file
    const absolutePath = path.resolve(inputFilePath);
    
    if (!fs.existsSync(absolutePath)) {
      console.error(`Error: File not found: ${inputFilePath}`);
      process.exit(1);
    }

    const inputJson = fs.readFileSync(absolutePath, 'utf-8');

    // Analyze wallet
    const result = analyzeWallet(inputJson);

    // Output formatted JSON to stdout
    console.log(result);
    process.exit(0);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error('Error: Unknown error occurred');
    }
    process.exit(1);
  }
}

main();
