import { ChessMove } from './chess';

export interface MoveClassification {
  type: 'brilliant' | 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder';
  evalBefore: number;
  evalAfter: number;
  evalDrop: number;
  bestMove?: string;
  explanation?: string;
}

export interface MoveAnalysis {
  move: ChessMove;
  classification: MoveClassification;
  position: string; // FEN
  moveNumber: number;
}

export interface GamePhaseStats {
  accuracy: number;
  blunders: number;
  mistakes: number;
  inaccuracies: number;
  averageEvalDrop: number;
}

export interface GameAnalysis {
  gameId: string;
  playerColor: 'white' | 'black';
  moves: MoveAnalysis[];
  overall: {
    accuracy: number;
    blunders: number;
    mistakes: number;
    inaccuracies: number;
    estimatedRating: number;
    averageCentipawnLoss: number;
  };
  byPhase: {
    opening: GamePhaseStats;
    middlegame: GamePhaseStats;
    endgame: GamePhaseStats;
  };
  tacticalThemes: string[];
  criticalMoments: MoveAnalysis[];
}

export interface PlayerStats {
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  estimatedRating: number;
  ratingConfidence: number;
  averageAccuracy: number;
  blunderRate: number;
  mistakeRate: number;
  tacticalStrength: number;
  positionalStrength: number;
  openingRepertoire: OpeningStats[];
}

export interface OpeningStats {
  name: string;
  eco: string;
  gamesPlayed: number;
  winRate: number;
  averageAccuracy: number;
}

export interface AnalysisProgress {
  totalMoves: number;
  analyzedMoves: number;
  currentMove: number;
  estimatedTimeRemaining: number;
}
