import axios from 'axios';
import { Transaction, TransactionType } from '../types';

export interface EtherscanTransaction {
  hash: string;
  timeStamp: string;
  from: string;
  to: string;
  value: string;
  methodId?: string;
  functionName?: string;
  input?: string;
}

export class BlockchainService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string = 'YourApiKeyToken') {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.etherscan.io/api';
  }

  /**
   * Fetch transactions from Etherscan for a given wallet address
   */
  async fetchTransactions(walletAddress: string, limit: number = 100): Promise<Transaction[]> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          module: 'account',
          action: 'txlist',
          address: walletAddress,
          startblock: 0,
          endblock: 99999999,
          page: 1,
          offset: limit,
          sort: 'desc',
          apikey: this.apiKey
        }
      });

      if (response.data.status !== '1') {
        throw new Error(`Etherscan API error: ${response.data.message}`);
      }

      const etherscanTxs: EtherscanTransaction[] = response.data.result;
      return this.transformTransactions(etherscanTxs, walletAddress);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to fetch transactions: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Transform Etherscan transactions to our internal format
   */
  private transformTransactions(
    etherscanTxs: EtherscanTransaction[],
    walletAddress: string
  ): Transaction[] {
    return etherscanTxs.map(tx => {
      const type = this.inferTransactionType(tx, walletAddress);
      const details = this.extractDetails(tx, type, walletAddress);

      return {
        hash: tx.hash,
        timestamp: new Date(parseInt(tx.timeStamp) * 1000).toISOString(),
        type,
        details
      };
    });
  }

  /**
   * Infer transaction type from Etherscan data
   */
  private inferTransactionType(tx: EtherscanTransaction, walletAddress: string): TransactionType {
    const functionName = tx.functionName?.toLowerCase() || '';
    const methodId = tx.methodId?.toLowerCase() || '';

    // NFT minting
    if (functionName.includes('mint') || functionName.includes('safemint')) {
      return 'nft_mint';
    }

    // Swaps
    if (
      functionName.includes('swap') ||
      functionName.includes('exchange') ||
      methodId === '0x38ed1739' || // swapExactTokensForTokens
      methodId === '0x7ff36ab5'    // swapExactETHForTokens
    ) {
      return 'swap';
    }

    // Staking
    if (functionName.includes('stake') || functionName.includes('deposit')) {
      return 'stake';
    }

    // Liquidity provision
    if (
      functionName.includes('addliquidity') ||
      functionName.includes('addliquidityeth')
    ) {
      return 'provide_liquidity';
    }

    // Governance
    if (
      functionName.includes('vote') ||
      functionName.includes('castvote')
    ) {
      return 'governance_vote';
    }

    // Airdrops (receiving tokens)
    if (tx.from.toLowerCase() !== walletAddress.toLowerCase() && tx.value === '0') {
      return 'receive_airdrop';
    }

    // Default to token hold
    return 'token_hold';
  }

  /**
   * Extract transaction details
   */
  private extractDetails(
    tx: EtherscanTransaction,
    type: TransactionType,
    walletAddress: string
  ): any {
    const protocol = this.inferProtocol(tx);
    const isNewProtocol = this.isNewProtocol(tx);

    const details: any = {
      protocol,
      is_new_protocol: isNewProtocol,
      value: tx.value,
      from: tx.from,
      to: tx.to
    };

    // Add type-specific details
    switch (type) {
      case 'swap':
        details.token_in = 'ETH';
        details.token_out = 'Unknown';
        break;

      case 'nft_mint':
        details.collection = protocol;
        details.token_id = 'Unknown';
        break;

      case 'stake':
        details.token = 'ETH';
        details.amount = tx.value;
        details.is_stable = false;
        break;

      case 'provide_liquidity':
        details.token1 = 'ETH';
        details.token2 = 'Unknown';
        details.is_volatile = true;
        break;

      case 'token_hold':
        details.token = 'ETH';
        details.duration_days = 0;
        details.is_blue_chip = this.isBlueChip(tx.to);
        break;

      case 'governance_vote':
        details.proposal_id = 'Unknown';
        break;

      case 'receive_airdrop':
        details.token = 'Unknown';
        details.amount = tx.value;
        break;
    }

    return details;
  }

  /**
   * Infer protocol from transaction
   */
  private inferProtocol(tx: EtherscanTransaction): string {
    const knownProtocols: { [key: string]: string } = {
      '0x7a250d5630b4cf539739df2c5dacb4c659f2488d': 'Uniswap V2',
      '0xe592427a0aece92de3edee1f18e0157c05861564': 'Uniswap V3',
      '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45': 'Uniswap',
      '0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9': 'Aave',
      '0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b': 'Compound',
      '0xae7ab96520de3a18e5e111b5eaab095312d7fe84': 'Lido',
      '0x1f98431c8ad98523631ae4a59f267346ea31f984': 'Uniswap V3 Factory',
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': 'WETH',
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 'USDC',
      '0xdac17f958d2ee523a2206206994597c13d831ec7': 'USDT'
    };

    const toAddress = tx.to?.toLowerCase();
    return knownProtocols[toAddress] || 'Unknown Protocol';
  }

  /**
   * Check if protocol is new (launched in last 6 months)
   */
  private isNewProtocol(tx: EtherscanTransaction): boolean {
    // Simplified: mark unknown protocols as potentially new
    const protocol = this.inferProtocol(tx);
    return protocol === 'Unknown Protocol';
  }

  /**
   * Check if token is blue-chip
   */
  private isBlueChip(address: string): boolean {
    const blueChipAddresses = [
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH
      '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', // WBTC
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
      '0xdac17f958d2ee523a2206206994597c13d831ec7'  // USDT
    ];
    return blueChipAddresses.includes(address?.toLowerCase());
  }

  /**
   * Fetch wallet balance
   */
  async fetchBalance(walletAddress: string): Promise<string> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          module: 'account',
          action: 'balance',
          address: walletAddress,
          tag: 'latest',
          apikey: this.apiKey
        }
      });

      if (response.data.status !== '1') {
        throw new Error(`Etherscan API error: ${response.data.message}`);
      }

      // Convert from Wei to ETH
      const balanceWei = response.data.result;
      const balanceEth = (parseInt(balanceWei) / 1e18).toFixed(4);
      return balanceEth;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to fetch balance: ${error.message}`);
      }
      throw error;
    }
  }
}
