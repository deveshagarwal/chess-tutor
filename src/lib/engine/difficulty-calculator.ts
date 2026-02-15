import { DifficultySettings } from '@/types/engine';

/**
 * Calculate engine difficulty settings based on player rating
 */
export class DifficultyCalculator {
  /**
   * Map player rating to engine settings
   */
  static calculate(playerRating: number): DifficultySettings {
    // Clamp rating to reasonable range
    const rating = Math.max(400, Math.min(3000, playerRating));

    if (rating < 800) {
      // Beginner: Very weak play
      return {
        depth: 1,
        moveTime: 100,
        skillLevel: 0,
        errorRate: 0.30,
      };
    } else if (rating < 1000) {
      // Novice: Weak play with frequent mistakes
      return {
        depth: 3,
        moveTime: 200,
        skillLevel: 2,
        errorRate: 0.25,
      };
    } else if (rating < 1200) {
      // Casual player: Some tactical awareness
      return {
        depth: 5,
        moveTime: 300,
        skillLevel: 5,
        errorRate: 0.20,
      };
    } else if (rating < 1400) {
      // Intermediate: Decent tactical play
      return {
        depth: 6,
        moveTime: 500,
        skillLevel: 8,
        errorRate: 0.12,
      };
    } else if (rating < 1600) {
      // Club player: Strong tactical play
      return {
        depth: 8,
        moveTime: 800,
        skillLevel: 11,
        errorRate: 0.08,
      };
    } else if (rating < 1800) {
      // Advanced: Very strong tactical and positional play
      return {
        depth: 10,
        moveTime: 1000,
        skillLevel: 14,
        errorRate: 0.05,
      };
    } else if (rating < 2000) {
      // Expert: Near-perfect tactical play
      return {
        depth: 12,
        moveTime: 1200,
        skillLevel: 17,
        errorRate: 0.03,
      };
    } else if (rating < 2200) {
      // Master level: Excellent play
      return {
        depth: 13,
        moveTime: 1500,
        skillLevel: 19,
        errorRate: 0.01,
      };
    } else if (rating < 2400) {
      // Grandmaster level: Near-perfect play
      return {
        depth: 14,
        moveTime: 2000,
        skillLevel: 20,
        errorRate: 0.005,
      };
    } else {
      // Super GM: Perfect play
      return {
        depth: 15,
        moveTime: 2500,
        skillLevel: 20,
        errorRate: 0,
      };
    }
  }

  /**
   * Adjust difficulty based on game performance
   * Call this after each game to dynamically adapt
   */
  static adjust(
    currentSettings: DifficultySettings,
    playerWon: boolean,
    moveAccuracy: number
  ): DifficultySettings {
    // If player won with high accuracy, increase difficulty
    if (playerWon && moveAccuracy > 85) {
      return {
        depth: Math.min(22, currentSettings.depth + 2),
        moveTime: Math.min(3000, currentSettings.moveTime + 200),
        skillLevel: Math.min(20, currentSettings.skillLevel + 1),
        errorRate: Math.max(0, currentSettings.errorRate - 0.02),
      };
    }

    // If player lost badly, decrease difficulty
    if (!playerWon && moveAccuracy < 60) {
      return {
        depth: Math.max(3, currentSettings.depth - 2),
        moveTime: Math.max(100, currentSettings.moveTime - 200),
        skillLevel: Math.max(0, currentSettings.skillLevel - 2),
        errorRate: Math.min(0.3, currentSettings.errorRate + 0.03),
      };
    }

    // Minor adjustments for close games
    if (playerWon) {
      return {
        depth: Math.min(22, currentSettings.depth + 1),
        moveTime: Math.min(3000, currentSettings.moveTime + 100),
        skillLevel: Math.min(20, currentSettings.skillLevel + 0.5),
        errorRate: Math.max(0, currentSettings.errorRate - 0.01),
      };
    } else {
      return {
        depth: Math.max(3, currentSettings.depth - 1),
        moveTime: Math.max(100, currentSettings.moveTime - 100),
        skillLevel: Math.max(0, currentSettings.skillLevel - 0.5),
        errorRate: Math.min(0.3, currentSettings.errorRate + 0.01),
      };
    }
  }

  /**
   * Estimate equivalent rating from difficulty settings
   */
  static estimateRating(settings: DifficultySettings): number {
    // Map skill level to approximate rating
    const baseRating = settings.skillLevel * 100 + 800;

    // Adjust for error rate
    const errorPenalty = settings.errorRate * 500;

    return Math.round(baseRating - errorPenalty);
  }

  /**
   * Should the engine make an intentional mistake?
   */
  static shouldMakeError(settings: DifficultySettings): boolean {
    return Math.random() < settings.errorRate;
  }

  /**
   * Get a weaker move instead of the best move
   * Returns move index from the sorted move list (0 = best, 1 = second best, etc.)
   */
  static getErrorMoveIndex(settings: DifficultySettings): number {
    const errorRate = settings.errorRate;

    if (errorRate === 0) return 0;

    // Higher error rate = more likely to choose worse moves
    if (Math.random() < errorRate * 0.5) {
      // Blunder: choose a move from the bottom half
      return Math.floor(Math.random() * 10) + 10;
    } else if (Math.random() < errorRate) {
      // Mistake: choose from moves 3-10
      return Math.floor(Math.random() * 7) + 3;
    } else {
      // Inaccuracy: choose from moves 1-3
      return Math.floor(Math.random() * 3) + 1;
    }
  }

  /**
   * Get recommended depth for quick analysis during play
   */
  static getQuickAnalysisDepth(settings: DifficultySettings): number {
    // Use lower depth for faster analysis
    return Math.max(10, settings.depth - 5);
  }

  /**
   * Get recommended depth for post-game analysis
   */
  static getFullAnalysisDepth(): number {
    return 20;
  }

  /**
   * Calculate time per move in a game with time control
   */
  static calculateMoveTime(
    timeRemainingMs: number,
    movesRemaining: number,
    settings: DifficultySettings
  ): number {
    // Use a fraction of remaining time
    const baseTime = timeRemainingMs / (movesRemaining + 10);

    // Don't exceed settings max move time
    return Math.min(settings.moveTime, baseTime);
  }
}

/**
 * Difficulty presets
 */
export const DIFFICULTY_PRESETS = {
  veryEasy: DifficultyCalculator.calculate(800),
  easy: DifficultyCalculator.calculate(1200),
  medium: DifficultyCalculator.calculate(1500),
  hard: DifficultyCalculator.calculate(1800),
  veryHard: DifficultyCalculator.calculate(2200),
  master: DifficultyCalculator.calculate(2500),
};

/**
 * Difficulty names
 */
export type DifficultyPreset = keyof typeof DIFFICULTY_PRESETS;

export const DIFFICULTY_NAMES: Record<DifficultyPreset, string> = {
  veryEasy: 'Very Easy (800)',
  easy: 'Easy (1200)',
  medium: 'Medium (1500)',
  hard: 'Hard (1800)',
  veryHard: 'Very Hard (2200)',
  master: 'Master (2500)',
};
