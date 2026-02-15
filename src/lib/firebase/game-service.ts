import {
  ref,
  push,
  set,
  get,
  onValue,
  update,
  off,
  onDisconnect,
  serverTimestamp,
  DatabaseReference,
} from 'firebase/database';
import { database } from './config';
import { ChessMove } from '@/types/chess';

export interface PlayerInfo {
  id: string;
  connected: boolean;
  color: 'white' | 'black';
}

export interface MultiplayerGameState {
  fen: string;
  history: ChessMove[];
  playerWhite: PlayerInfo | null;
  playerBlack: PlayerInfo | null;
  currentTurn: 'white' | 'black';
  result: string;
  createdAt: number;
  lastMoveAt: number;
}

export type MoveCallback = (gameState: MultiplayerGameState) => void;
export type UnsubscribeFn = () => void;

class FirebaseGameService {
  private gameRef: DatabaseReference | null = null;
  private playerId: string;

  constructor() {
    // Generate a unique player ID
    this.playerId = this.generatePlayerId();
  }

  /**
   * Generate a unique player ID
   */
  private generatePlayerId(): string {
    return `player_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Create a new multiplayer game
   */
  async createGame(playerColor: 'white' | 'black'): Promise<{ gameId: string; url: string }> {
    if (!database) {
      throw new Error('Firebase not initialized. Please configure Firebase by following the instructions in FIREBASE_SETUP.md');
    }

    const gamesRef = ref(database, 'games');
    const newGameRef = push(gamesRef);
    const gameId = newGameRef.key!;

    const initialGameState: MultiplayerGameState = {
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      history: [],
      playerWhite: playerColor === 'white' ? { id: this.playerId, connected: true, color: 'white' } : null,
      playerBlack: playerColor === 'black' ? { id: this.playerId, connected: true, color: 'black' } : null,
      currentTurn: 'white',
      result: '*',
      createdAt: Date.now(),
      lastMoveAt: Date.now(),
    };

    await set(newGameRef, initialGameState);

    // Set up disconnect handler
    this.gameRef = newGameRef;
    this.setupDisconnectHandler(gameId, playerColor);

    const url = `${window.location.origin}/play/friend/${gameId}`;
    return { gameId, url };
  }

  /**
   * Join an existing game
   */
  async joinGame(gameId: string): Promise<MultiplayerGameState> {
    if (!database) {
      throw new Error('Firebase not initialized');
    }

    const gameRef = ref(database, `games/${gameId}`);
    const snapshot = await get(gameRef);

    if (!snapshot.exists()) {
      throw new Error('Game not found');
    }

    const gameState = snapshot.val() as MultiplayerGameState;

    // Determine which color to join as
    let playerColor: 'white' | 'black';
    if (!gameState.playerWhite) {
      playerColor = 'white';
    } else if (!gameState.playerBlack) {
      playerColor = 'black';
    } else {
      throw new Error('Game is full');
    }

    // Update game state with new player
    const updates: any = {};
    if (playerColor === 'white') {
      updates.playerWhite = { id: this.playerId, connected: true, color: 'white' };
    } else {
      updates.playerBlack = { id: this.playerId, connected: true, color: 'black' };
    }

    await update(gameRef, updates);

    // Set up disconnect handler
    this.gameRef = gameRef;
    this.setupDisconnectHandler(gameId, playerColor);

    return { ...gameState, ...updates };
  }

  /**
   * Listen for game state changes
   */
  listenForMoves(gameId: string, callback: MoveCallback): UnsubscribeFn {
    if (!database) {
      throw new Error('Firebase not initialized');
    }

    const gameRef = ref(database, `games/${gameId}`);

    onValue(gameRef, (snapshot) => {
      if (snapshot.exists()) {
        const gameState = snapshot.val() as MultiplayerGameState;
        callback(gameState);
      }
    });

    return () => off(gameRef);
  }

  /**
   * Make a move in the game
   */
  async makeMove(gameId: string, move: ChessMove, newFen: string): Promise<void> {
    if (!database) {
      throw new Error('Firebase not initialized');
    }

    const gameRef = ref(database, `games/${gameId}`);
    const snapshot = await get(gameRef);

    if (!snapshot.exists()) {
      throw new Error('Game not found');
    }

    const gameState = snapshot.val() as MultiplayerGameState;
    const newHistory = [...gameState.history, move];
    const newTurn = gameState.currentTurn === 'white' ? 'black' : 'white';

    const updates = {
      fen: newFen,
      history: newHistory,
      currentTurn: newTurn,
      lastMoveAt: Date.now(),
    };

    await update(gameRef, updates);
  }

  /**
   * Update game state (e.g., when game ends)
   */
  async updateGameState(gameId: string, updates: Partial<MultiplayerGameState>): Promise<void> {
    if (!database) {
      throw new Error('Firebase not initialized');
    }

    const gameRef = ref(database, `games/${gameId}`);
    await update(gameRef, updates);
  }

  /**
   * Set up disconnect handler to update player status
   */
  private setupDisconnectHandler(gameId: string, playerColor: 'white' | 'black'): void {
    if (!database || !this.gameRef) return;

    const playerPath = playerColor === 'white' ? 'playerWhite' : 'playerBlack';
    const playerRef = ref(database, `games/${gameId}/${playerPath}/connected`);

    // When this client disconnects, set connected to false
    onDisconnect(playerRef).set(false);

    // Update connected status to true
    set(playerRef, true);
  }

  /**
   * Manually disconnect from a game
   */
  async disconnect(gameId: string, playerColor: 'white' | 'black'): Promise<void> {
    if (!database) return;

    const playerPath = playerColor === 'white' ? 'playerWhite' : 'playerBlack';
    const playerRef = ref(database, `games/${gameId}/${playerPath}/connected`);

    await set(playerRef, false);
    this.gameRef = null;
  }

  /**
   * Check if a game exists
   */
  async gameExists(gameId: string): Promise<boolean> {
    if (!database) {
      throw new Error('Firebase not initialized');
    }

    const gameRef = ref(database, `games/${gameId}`);
    const snapshot = await get(gameRef);
    return snapshot.exists();
  }

  /**
   * Get current player ID
   */
  getPlayerId(): string {
    return this.playerId;
  }

  /**
   * Get player color in a game
   */
  async getPlayerColor(gameId: string): Promise<'white' | 'black' | null> {
    if (!database) {
      throw new Error('Firebase not initialized');
    }

    const gameRef = ref(database, `games/${gameId}`);
    const snapshot = await get(gameRef);

    if (!snapshot.exists()) {
      return null;
    }

    const gameState = snapshot.val() as MultiplayerGameState;

    if (gameState.playerWhite?.id === this.playerId) {
      return 'white';
    } else if (gameState.playerBlack?.id === this.playerId) {
      return 'black';
    }

    return null;
  }
}

// Export a singleton instance
export const gameService = new FirebaseGameService();
