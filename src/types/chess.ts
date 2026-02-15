import { Square } from 'chess.js';

export interface Move {
  from: Square;
  to: Square;
  promotion?: string;
  san?: string;
  captured?: string;
  flags?: string;
}

export interface ChessMove {
  from: string;
  to: string;
  promotion?: string;
  san: string;
  lan: string;
  before: string;
  after: string;
  color: 'w' | 'b';
  piece: string;
  captured?: string;
  flags: string;
}

export interface GameMetadata {
  id: string;
  white: string;
  black: string;
  result: string;
  date: string;
  whiteRating?: number;
  blackRating?: number;
  timeControl?: string;
  opening?: string;
  source: 'lichess' | 'chesscom' | 'manual';
}

export interface Game {
  metadata: GameMetadata;
  pgn: string;
  moves: ChessMove[];
}

export interface Position {
  fen: string;
  moves: Move[];
  evaluation?: number;
}

export type Color = 'white' | 'black';
export type GameResult = '1-0' | '0-1' | '1/2-1/2' | '*';
