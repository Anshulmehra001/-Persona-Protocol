import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { analyzeWallet } from './index.js';
import { BlockchainService } from './services/BlockchainService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize services
const blockchainService = new BlockchainService();

// In-memory cache (simple replacement for database)
const cache = new Map<string, any>();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../public')));

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Analyze wallet from JSON data
app.post('/api/analyze', async (req: Request, res: Response) => {
  try {
    const { walletAddress, transactions } = req.body;

    if (!walletAddress || !transactions) {
      return res.status(400).json({ 
        error: 'Missing required fields: walletAddress and transactions' 
      });
    }

    // Check cache first
    const cached = cache.get(walletAddress);
    if (cached) {
      return res.json({ 
        ...cached, 
        cached: true,
        message: 'Retrieved from cache'
      });
    }

    // Analyze wallet
    const result = analyzeWallet(JSON.stringify(req.body));
    const persona = JSON.parse(result);

    // Save to cache
    cache.set(walletAddress, persona);

    res.json({ ...persona, cached: false });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Analysis failed' 
    });
  }
});

// Analyze wallet from blockchain (Etherscan)
app.post('/api/analyze/blockchain', async (req: Request, res: Response) => {
  try {
    const { walletAddress, limit } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ 
        error: 'Missing required field: walletAddress' 
      });
    }

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return res.status(400).json({ 
        error: 'Invalid Ethereum address format' 
      });
    }

    // Check cache first
    const cached = cache.get(walletAddress);
    if (cached) {
      return res.json({ 
        ...cached, 
        cached: true,
        message: 'Retrieved from cache'
      });
    }

    // Fetch transactions from blockchain
    const transactions = await blockchainService.fetchTransactions(
      walletAddress, 
      limit || 100
    );

    if (transactions.length === 0) {
      return res.status(404).json({ 
        error: 'No transactions found for this wallet address' 
      });
    }

    // Analyze wallet
    const walletData = { walletAddress, transactions };
    const result = analyzeWallet(JSON.stringify(walletData));
    const persona = JSON.parse(result);

    // Save to cache
    cache.set(walletAddress, persona);

    // Get balance
    const balance = await blockchainService.fetchBalance(walletAddress);

    res.json({ 
      ...persona, 
      cached: false,
      transactionCount: transactions.length,
      balance: `${balance} ETH`
    });
  } catch (error) {
    console.error('Blockchain analysis error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Blockchain analysis failed' 
    });
  }
});

// Get cached analysis
app.get('/api/analysis/:walletAddress', (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.params;

    const analysis = cache.get(walletAddress);

    if (!analysis) {
      return res.status(404).json({ 
        error: 'No analysis found for this wallet address' 
      });
    }

    res.json(analysis);
  } catch (error) {
    console.error('Retrieval error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Retrieval failed' 
    });
  }
});

// Get all analyses
app.get('/api/analyses', (req: Request, res: Response) => {
  try {
    const analyses = Array.from(cache.values());

    res.json({
      count: analyses.length,
      analyses
    });
  } catch (error) {
    console.error('Retrieval error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Retrieval failed' 
    });
  }
});

// Get statistics
app.get('/api/statistics', (req: Request, res: Response) => {
  try {
    const analyses = Array.from(cache.values());
    const totalAnalyses = analyses.length;
    
    const avgRisk = analyses.length > 0 
      ? Math.round(analyses.reduce((sum: number, a: any) => sum + a.scores.riskAppetite, 0) / analyses.length)
      : 0;
    const avgLoyalty = analyses.length > 0
      ? Math.round(analyses.reduce((sum: number, a: any) => sum + a.scores.loyalty, 0) / analyses.length)
      : 0;
    const avgActivity = analyses.length > 0
      ? Math.round(analyses.reduce((sum: number, a: any) => sum + a.scores.activity, 0) / analyses.length)
      : 0;

    res.json({
      totalAnalyses,
      averageScores: {
        riskAppetite: avgRisk,
        loyalty: avgLoyalty,
        activity: avgActivity
      }
    });
  } catch (error) {
    console.error('Statistics error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Statistics retrieval failed' 
    });
  }
});

// Serve frontend
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║           🚀 PERSONA PROTOCOL SERVER RUNNING 🚀           ║
║                                                           ║
║   Server:    http://localhost:${PORT}                        ║
║   API:       http://localhost:${PORT}/api                    ║
║   Health:    http://localhost:${PORT}/api/health             ║
║                                                           ║
║   Ready to analyze Web3 wallets! 💎                      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down...');
  process.exit(0);
});
