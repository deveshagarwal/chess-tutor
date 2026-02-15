import { Chess, Square, Move as ChessJSMove } from 'chess.js';
import { ChessMove, Move, Position } from '@/types/chess';

export class ChessGame {
  private chess: Chess;

  constructor(fen?: string) {
    this.chess = new Chess(fen);
  }

  // Get current FEN
  fen(): string {
    return this.chess.fen();
  }

  // Get current PGN
  pgn(): string {
    return this.chess.pgn();
  }

  // Load FEN
  load(fen: string): boolean {
    try {
      this.chess.load(fen);
      return true;
    } catch {
      return false;
    }
  }

  // Load PGN
  loadPgn(pgn: string): boolean {
    try {
      this.chess.loadPgn(pgn);
      return true;
    } catch {
      return false;
    }
  }

  // Make a move
  move(move: string | Move): ChessMove | null {
    try {
      const result = this.chess.move(move as any);
      if (!result) return null;

      return {
        from: result.from,
        to: result.to,
        promotion: result.promotion,
        san: result.san,
        lan: result.lan,
        before: result.before,
        after: result.after,
        color: result.color,
        piece: result.piece,
        captured: result.captured,
        flags: result.flags,
      };
    } catch {
      return null;
    }
  }

  // Undo last move
  undo(): ChessMove | null {
    const move = this.chess.undo();
    if (!move) return null;

    return {
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
    };
  }

  // Get all legal moves
  moves(options?: { square?: Square; verbose?: boolean }): any[] {
    return this.chess.moves(options as any);
  }

  // Get move history
  history(options?: { verbose?: boolean }): any[] {
    return this.chess.history(options as any);
  }

  // Check if game is over
  isGameOver(): boolean {
    return this.chess.isGameOver();
  }

  // Check if in check
  inCheck(): boolean {
    return this.chess.inCheck();
  }

  // Check if checkmate
  isCheckmate(): boolean {
    return this.chess.isCheckmate();
  }

  // Check if stalemate
  isStalemate(): boolean {
    return this.chess.isStalemate();
  }

  // Check if draw
  isDraw(): boolean {
    return this.chess.isDraw();
  }

  // Check if threefold repetition
  isThreefoldRepetition(): boolean {
    return this.chess.isThreefoldRepetition();
  }

  // Check if insufficient material
  isInsufficientMaterial(): boolean {
    return this.chess.isInsufficientMaterial();
  }

  // Get current turn
  turn(): 'w' | 'b' {
    return this.chess.turn();
  }

  // Get game result
  getResult(): string {
    if (this.isCheckmate()) {
      return this.turn() === 'w' ? '0-1' : '1-0';
    }
    if (this.isDraw() || this.isStalemate()) {
      return '1/2-1/2';
    }
    return '*';
  }

  // Get board as ASCII (for debugging)
  ascii(): string {
    return this.chess.ascii();
  }

  // Get current position info
  getPosition(): Position {
    return {
      fen: this.fen(),
      moves: this.moves({ verbose: true }),
    };
  }

  // Reset to starting position
  reset(): void {
    this.chess.reset();
  }

  // Get piece at square
  get(square: Square): any {
    return this.chess.get(square);
  }

  // Put piece on square
  put(piece: any, square: Square): boolean {
    return this.chess.put(piece, square);
  }

  // Remove piece from square
  remove(square: Square): any {
    return this.chess.remove(square);
  }

  // Get board state
  board(): any[][] {
    return this.chess.board();
  }

  // Clone game
  clone(): ChessGame {
    const cloned = new ChessGame();
    cloned.load(this.fen());
    return cloned;
  }

  // Validate FEN
  static validateFen(fen: string): { valid: boolean; error?: string } {
    try {
      const chess = new Chess(fen);
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Invalid FEN'
      };
    }
  }

  // Get legal moves for a square
  getSquareMoves(square: Square): Move[] {
    const moves = this.moves({ square, verbose: true });
    return moves.map((m: any) => ({
      from: m.from,
      to: m.to,
      promotion: m.promotion,
      san: m.san,
      captured: m.captured,
      flags: m.flags,
    }));
  }

  // Get legal move destinations as Map (for Chessground)
  getLegalMoves(): Map<any, any[]> {
    const moves = this.moves({ verbose: true });
    const dests = new Map<any, any[]>();

    moves.forEach((move: any) => {
      if (!dests.has(move.from)) {
        dests.set(move.from, []);
      }
      dests.get(move.from)?.push(move.to);
    });

    return dests;
  }

  // Get move count
  moveCount(): number {
    return this.history().length;
  }

  // Get full move number
  fullMoveNumber(): number {
    return Math.floor(this.moveCount() / 2) + 1;
  }

  // Get game phase (opening, middlegame, endgame)
  getGamePhase(): 'opening' | 'middlegame' | 'endgame' {
    const moveCount = this.moveCount();
    const board = this.board();

    // Count pieces
    let pieceCount = 0;
    let queenCount = 0;

    board.forEach(row => {
      row.forEach(square => {
        if (square) {
          pieceCount++;
          if (square.type === 'q') queenCount++;
        }
      });
    });

    // Opening: first 10-15 moves
    if (moveCount < 20) return 'opening';

    // Endgame: few pieces left (< 12) or no queens
    if (pieceCount < 12 || queenCount === 0) return 'endgame';

    // Otherwise middlegame
    return 'middlegame';
  }
}
