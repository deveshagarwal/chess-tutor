import { Chess } from 'chess.js';
import { Game, GameMetadata, ChessMove } from '@/types/chess';

export interface ParsedPGN {
  headers: Record<string, string>;
  moves: string[];
}

export class PGNParser {
  /**
   * Parse a single PGN string into headers and moves
   */
  static parseSingle(pgn: string): ParsedPGN | null {
    try {
      const lines = pgn.trim().split('\n');
      const headers: Record<string, string> = {};
      const moveLines: string[] = [];

      let inHeaders = true;

      for (const line of lines) {
        const trimmed = line.trim();

        if (!trimmed) {
          inHeaders = false;
          continue;
        }

        // Parse headers [Key "Value"]
        if (inHeaders && trimmed.startsWith('[')) {
          const match = trimmed.match(/\[(\w+)\s+"(.*)"\]/);
          if (match) {
            headers[match[1]] = match[2];
          }
        } else if (!trimmed.startsWith('[')) {
          // This is a move line
          moveLines.push(trimmed);
        }
      }

      const movesText = moveLines.join(' ');
      const moves = this.extractMoves(movesText);

      return { headers, moves };
    } catch (error) {
      console.error('Failed to parse PGN:', error);
      return null;
    }
  }

  /**
   * Extract move list from PGN move text
   */
  private static extractMoves(movesText: string): string[] {
    // Remove comments in {}
    let cleaned = movesText.replace(/\{[^}]*\}/g, '');

    // Remove variations in ()
    cleaned = cleaned.replace(/\([^)]*\)/g, '');

    // Remove move numbers like "1." "2..."
    cleaned = cleaned.replace(/\d+\.\s*/g, '');

    // Remove game result
    cleaned = cleaned.replace(/\s*(1-0|0-1|1\/2-1\/2|\*)\s*$/, '');

    // Split by whitespace and filter empty
    const moves = cleaned.split(/\s+/).filter(m => m && m !== '');

    return moves;
  }

  /**
   * Parse multiple PGN games from a single string
   */
  static parseMultiple(pgnText: string): ParsedPGN[] {
    const games: ParsedPGN[] = [];
    const pgnGames = pgnText.split(/\n\s*\n(?=\[)/);

    for (const pgn of pgnGames) {
      if (pgn.trim()) {
        const parsed = this.parseSingle(pgn);
        if (parsed) {
          games.push(parsed);
        }
      }
    }

    return games;
  }

  /**
   * Convert parsed PGN to Game object with full move details
   */
  static toGame(pgn: string, source: 'lichess' | 'chesscom' | 'manual' = 'manual'): Game | null {
    try {
      const parsed = this.parseSingle(pgn);
      if (!parsed) return null;

      const chess = new Chess();
      chess.loadPgn(pgn);

      const moves: ChessMove[] = [];
      const history = chess.history({ verbose: true });

      history.forEach((move: any) => {
        moves.push({
          from: move.from,
          to: move.to,
          promotion: move.promotion,
          san: move.san,
          lan: move.lan,
          before: move.before,
          after: move.after,
          color: move.color,
          piece: move.piece,
          captured: move.captured,
          flags: move.flags,
        });
      });

      const metadata: GameMetadata = {
        id: this.generateGameId(parsed.headers),
        white: parsed.headers.White || 'Unknown',
        black: parsed.headers.Black || 'Unknown',
        result: parsed.headers.Result || '*',
        date: parsed.headers.Date || new Date().toISOString().split('T')[0],
        whiteRating: parsed.headers.WhiteElo ? parseInt(parsed.headers.WhiteElo) : undefined,
        blackRating: parsed.headers.BlackElo ? parseInt(parsed.headers.BlackElo) : undefined,
        timeControl: parsed.headers.TimeControl,
        opening: parsed.headers.Opening || parsed.headers.ECO,
        source,
      };

      return {
        metadata,
        pgn,
        moves,
      };
    } catch (error) {
      console.error('Failed to convert PGN to Game:', error);
      return null;
    }
  }

  /**
   * Generate unique game ID from headers
   */
  private static generateGameId(headers: Record<string, string>): string {
    // Use Site + Date + White + Black if available
    const parts = [
      headers.Site || '',
      headers.Date || '',
      headers.White || '',
      headers.Black || '',
      Date.now().toString(),
    ];

    return parts.join('-').replace(/[^a-zA-Z0-9-]/g, '');
  }

  /**
   * Validate PGN format
   */
  static validate(pgn: string): { valid: boolean; error?: string } {
    try {
      const chess = new Chess();
      chess.loadPgn(pgn);
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Invalid PGN format'
      };
    }
  }

  /**
   * Extract headers from PGN
   */
  static extractHeaders(pgn: string): Record<string, string> {
    const parsed = this.parseSingle(pgn);
    return parsed?.headers || {};
  }

  /**
   * Extract moves from PGN as SAN notation
   */
  static extractMovesOnly(pgn: string): string[] {
    const parsed = this.parseSingle(pgn);
    return parsed?.moves || [];
  }

  /**
   * Create PGN from headers and moves
   */
  static create(headers: Record<string, string>, moves: string[]): string {
    let pgn = '';

    // Add headers
    const orderedHeaders = ['Event', 'Site', 'Date', 'Round', 'White', 'Black', 'Result'];

    orderedHeaders.forEach(key => {
      if (headers[key]) {
        pgn += `[${key} "${headers[key]}"]\n`;
      }
    });

    // Add remaining headers
    Object.keys(headers).forEach(key => {
      if (!orderedHeaders.includes(key)) {
        pgn += `[${key} "${headers[key]}"]\n`;
      }
    });

    pgn += '\n';

    // Add moves with move numbers
    let moveText = '';
    moves.forEach((move, index) => {
      if (index % 2 === 0) {
        moveText += `${Math.floor(index / 2) + 1}. `;
      }
      moveText += move + ' ';
    });

    // Add result
    const result = headers.Result || '*';
    moveText += result;

    // Wrap text at ~80 characters
    const wrapped = this.wrapText(moveText, 80);
    pgn += wrapped;

    return pgn;
  }

  /**
   * Wrap text at specified width
   */
  private static wrapText(text: string, width: number): string {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
      if (currentLine.length + word.length + 1 > width) {
        lines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        currentLine += word + ' ';
      }
    });

    if (currentLine.trim()) {
      lines.push(currentLine.trim());
    }

    return lines.join('\n');
  }

  /**
   * Get position at specific move number
   */
  static getPositionAt(pgn: string, moveNumber: number): string | null {
    try {
      const chess = new Chess();
      chess.loadPgn(pgn);

      const history = chess.history();

      // Reset and replay up to moveNumber
      chess.reset();
      for (let i = 0; i < moveNumber && i < history.length; i++) {
        chess.move(history[i]);
      }

      return chess.fen();
    } catch {
      return null;
    }
  }
}
