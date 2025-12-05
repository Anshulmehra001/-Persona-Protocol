import Database from 'better-sqlite3';
import { PersonaProfile } from '../types';

export class DatabaseService {
  private db: Database.Database;

  constructor(dbPath: string = './persona-protocol.db') {
    this.db = new Database(dbPath);
    this.initializeDatabase();
  }

  /**
   * Initialize database schema
   */
  private initializeDatabase(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS analyses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        wallet_address TEXT NOT NULL UNIQUE,
        persona_title TEXT NOT NULL,
        summary TEXT NOT NULL,
        risk_appetite INTEGER NOT NULL,
        loyalty INTEGER NOT NULL,
        activity INTEGER NOT NULL,
        key_traits TEXT NOT NULL,
        notable_protocols TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_wallet_address ON analyses(wallet_address);
      CREATE INDEX IF NOT EXISTS idx_created_at ON analyses(created_at);
    `);
  }

  /**
   * Save analysis result to database
   */
  saveAnalysis(persona: PersonaProfile): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO analyses (
        wallet_address, persona_title, summary,
        risk_appetite, loyalty, activity,
        key_traits, notable_protocols, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    stmt.run(
      persona.walletAddress,
      persona.personaTitle,
      persona.summary,
      persona.scores.riskAppetite,
      persona.scores.loyalty,
      persona.scores.activity,
      JSON.stringify(persona.keyTraits),
      JSON.stringify(persona.notableProtocols)
    );
  }

  /**
   * Get cached analysis for a wallet
   */
  getAnalysis(walletAddress: string): PersonaProfile | null {
    const stmt = this.db.prepare(`
      SELECT * FROM analyses WHERE wallet_address = ?
    `);

    const row: any = stmt.get(walletAddress);

    if (!row) {
      return null;
    }

    return {
      walletAddress: row.wallet_address,
      personaTitle: row.persona_title,
      summary: row.summary,
      scores: {
        riskAppetite: row.risk_appetite,
        loyalty: row.loyalty,
        activity: row.activity
      },
      keyTraits: JSON.parse(row.key_traits),
      notableProtocols: JSON.parse(row.notable_protocols)
    };
  }

  /**
   * Get all analyses
   */
  getAllAnalyses(limit: number = 100): PersonaProfile[] {
    const stmt = this.db.prepare(`
      SELECT * FROM analyses ORDER BY updated_at DESC LIMIT ?
    `);

    const rows: any[] = stmt.all(limit);

    return rows.map(row => ({
      walletAddress: row.wallet_address,
      personaTitle: row.persona_title,
      summary: row.summary,
      scores: {
        riskAppetite: row.risk_appetite,
        loyalty: row.loyalty,
        activity: row.activity
      },
      keyTraits: JSON.parse(row.key_traits),
      notableProtocols: JSON.parse(row.notable_protocols)
    }));
  }

  /**
   * Get analysis statistics
   */
  getStatistics(): any {
    const totalStmt = this.db.prepare('SELECT COUNT(*) as count FROM analyses');
    const avgStmt = this.db.prepare(`
      SELECT 
        AVG(risk_appetite) as avg_risk,
        AVG(loyalty) as avg_loyalty,
        AVG(activity) as avg_activity
      FROM analyses
    `);

    const total = totalStmt.get() as any;
    const averages = avgStmt.get() as any;

    return {
      totalAnalyses: total.count,
      averageScores: {
        riskAppetite: Math.round(averages.avg_risk || 0),
        loyalty: Math.round(averages.avg_loyalty || 0),
        activity: Math.round(averages.avg_activity || 0)
      }
    };
  }

  /**
   * Delete old analyses (older than specified days)
   */
  cleanOldAnalyses(daysOld: number = 30): number {
    const stmt = this.db.prepare(`
      DELETE FROM analyses 
      WHERE updated_at < datetime('now', '-' || ? || ' days')
    `);

    const result = stmt.run(daysOld);
    return result.changes;
  }

  /**
   * Close database connection
   */
  close(): void {
    this.db.close();
  }
}
