import { create } from 'zustand';
import { ChessGame } from '@/lib/chess/game-logic';
import { ChessMove, Color } from '@/types/chess';
import { EngineController } from '@/lib/engine/engine-controller';
import { DifficultyCalculator } from '@/lib/engine/difficulty-calculator';
import { DifficultySettings } from '@/types/engine';
import { gameService, MultiplayerGameState, UnsubscribeFn } from '@/lib/firebase/game-service';

interface GameState {
  // Chess game instance
  chess: ChessGame;

  // Game state
  fen: string;
  pgn: string;
  history: ChessMove[];
  currentMoveIndex: number;

  // Game mode
  gameMode: 'play' | 'analysis' | 'review' | 'multiplayer';
  isPlayerTurn: boolean;
  playerColor: Color;

  // AI opponent
  engine: EngineController | null;
  difficulty: DifficultySettings;
  aiThinking: boolean;

  // Multiplayer state
  multiplayerMode: boolean;
  gameId: string | null;
  opponentConnected: boolean;
  localPlayerId: string;
  unsubscribeMultiplayer: UnsubscribeFn | null;

  // Game status
  isGameOver: boolean;
  result: string;

  // Actions
  initGame: () => void;
  resetGame: () => void;
  makeMove: (move: { from: string; to: string; promotion?: string }) => ChessMove | null;
  undoMove: () => void;
  navigateToMove: (index: number) => void;
  setPlayerColor: (color: Color) => void;
  setGameMode: (mode: 'play' | 'analysis' | 'review' | 'multiplayer') => void;
  setDifficulty: (rating: number) => void;
  loadPgn: (pgn: string) => boolean;
  loadFen: (fen: string) => boolean;

  // AI actions
  initEngine: () => Promise<void>;
  makeAiMove: () => Promise<void>;
  stopAi: () => void;
  destroyEngine: () => void;

  // Multiplayer actions
  initMultiplayerGame: (playerColor: Color) => Promise<string>;
  joinMultiplayerGame: (gameId: string) => Promise<void>;
  makeMultiplayerMove: (move: { from: string; to: string; promotion?: string }) => Promise<ChessMove | null>;
  listenToOpponent: () => void;
  disconnectMultiplayer: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  chess: new ChessGame(),
  fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  pgn: '',
  history: [],
  currentMoveIndex: 0,
  gameMode: 'play',
  isPlayerTurn: true,
  playerColor: 'white',
  engine: null,
  difficulty: DifficultyCalculator.calculate(1500),
  aiThinking: false,
  multiplayerMode: false,
  gameId: null,
  opponentConnected: false,
  localPlayerId: gameService.getPlayerId(),
  unsubscribeMultiplayer: null,
  isGameOver: false,
  result: '*',

  // Initialize game
  initGame: () => {
    const chess = new ChessGame();
    set({
      chess,
      fen: chess.fen(),
      pgn: chess.pgn(),
      history: [],
      currentMoveIndex: 0,
      isGameOver: false,
      result: '*',
      isPlayerTurn: true,
    });
  },

  // Reset game to starting position
  resetGame: () => {
    const { chess, playerColor } = get();
    chess.reset();

    set({
      fen: chess.fen(),
      pgn: chess.pgn(),
      history: [],
      currentMoveIndex: 0,
      isGameOver: false,
      result: '*',
      isPlayerTurn: playerColor === 'white',
      aiThinking: false,
    });

    // If AI plays first (player is black), make AI move
    const state = get();
    if (state.gameMode === 'play' && state.playerColor === 'black') {
      setTimeout(() => state.makeAiMove(), 500);
    }
  },

  // Make a move
  makeMove: (move) => {
    const { chess, gameMode, playerColor, engine, multiplayerMode } = get();

    // If in multiplayer mode, use multiplayer move handler
    if (multiplayerMode) {
      return get().makeMultiplayerMove(move) as any;
    }

    const chessMove = chess.move(move as any);

    if (!chessMove) return null;

    const history = [...get().history, chessMove];
    const fen = chess.fen();
    const pgn = chess.pgn();
    const isGameOver = chess.isGameOver();
    const result = chess.getResult();

    // Determine whose turn it is
    const currentTurn = chess.turn() === 'w' ? 'white' : 'black';
    const isPlayerTurn = gameMode === 'analysis' ? true : currentTurn === playerColor;

    set({
      fen,
      pgn,
      history,
      currentMoveIndex: history.length,
      isGameOver,
      result,
      isPlayerTurn,
    });

    // If in play mode and it's AI's turn, make AI move
    if (gameMode === 'play' && !isPlayerTurn && !isGameOver && engine) {
      setTimeout(() => get().makeAiMove(), 300);
    }

    return chessMove;
  },

  // Undo last move
  undoMove: () => {
    const { chess, history, gameMode, playerColor } = get();

    if (history.length === 0) return;

    chess.undo();

    // In play mode, undo both player and AI move
    if (gameMode === 'play' && history.length >= 2) {
      chess.undo();
      const newHistory = history.slice(0, -2);

      set({
        fen: chess.fen(),
        pgn: chess.pgn(),
        history: newHistory,
        currentMoveIndex: newHistory.length,
        isPlayerTurn: true,
        isGameOver: false,
        result: '*',
      });
    } else {
      const newHistory = history.slice(0, -1);
      const currentTurn = chess.turn() === 'w' ? 'white' : 'black';

      set({
        fen: chess.fen(),
        pgn: chess.pgn(),
        history: newHistory,
        currentMoveIndex: newHistory.length,
        isPlayerTurn: gameMode === 'analysis' ? true : currentTurn === playerColor,
        isGameOver: false,
        result: '*',
      });
    }
  },

  // Navigate to a specific move
  navigateToMove: (index) => {
    const { chess, history } = get();

    // Reset to start
    chess.reset();

    // Replay moves up to index
    for (let i = 0; i < index && i < history.length; i++) {
      const move = history[i];
      chess.move({ from: move.from, to: move.to, promotion: move.promotion } as any);
    }

    set({
      fen: chess.fen(),
      currentMoveIndex: index,
    });
  },

  // Set player color
  setPlayerColor: (color) => {
    set({ playerColor: color, isPlayerTurn: color === 'white' });

    // If changing to black and in play mode, AI should move first
    const state = get();
    if (color === 'black' && state.gameMode === 'play' && state.history.length === 0) {
      setTimeout(() => state.makeAiMove(), 500);
    }
  },

  // Set game mode
  setGameMode: (mode) => {
    set({ gameMode: mode, isPlayerTurn: mode === 'analysis' ? true : get().isPlayerTurn });
  },

  // Set difficulty
  setDifficulty: (rating) => {
    const difficulty = DifficultyCalculator.calculate(rating);
    set({ difficulty });

    // Update engine skill level
    const { engine } = get();
    if (engine) {
      engine.setSkillLevel(difficulty.skillLevel);
    }
  },

  // Load PGN
  loadPgn: (pgn) => {
    const chess = new ChessGame();
    const success = chess.loadPgn(pgn);

    if (!success) return false;

    const history = chess.history({ verbose: true }).map((m: any) => ({
      from: m.from,
      to: m.to,
      promotion: m.promotion,
      san: m.san,
      lan: m.lan,
      before: m.before,
      after: m.after,
      color: m.color,
      piece: m.piece,
      captured: m.captured,
      flags: m.flags,
    }));

    set({
      chess,
      fen: chess.fen(),
      pgn: chess.pgn(),
      history,
      currentMoveIndex: history.length,
      isGameOver: chess.isGameOver(),
      result: chess.getResult(),
    });

    return true;
  },

  // Load FEN
  loadFen: (fen) => {
    const chess = new ChessGame();
    const success = chess.load(fen);

    if (!success) return false;

    set({
      chess,
      fen: chess.fen(),
      pgn: chess.pgn(),
      history: [],
      currentMoveIndex: 0,
      isGameOver: chess.isGameOver(),
      result: chess.getResult(),
    });

    return true;
  },

  // Initialize engine
  initEngine: async () => {
    const { engine, difficulty } = get();

    if (engine) return;

    const newEngine = new EngineController();
    await newEngine.init();
    await newEngine.setSkillLevel(difficulty.skillLevel);

    set({ engine: newEngine });
  },

  // Make AI move
  makeAiMove: async () => {
    const { chess, engine, difficulty, aiThinking, isGameOver } = get();

    if (!engine || aiThinking || isGameOver) return;

    set({ aiThinking: true });

    try {
      const fen = chess.fen();

      // Get best move from engine
      const bestMove = await engine.getBestMove(fen, {
        depth: difficulty.depth,
        moveTime: difficulty.moveTime,
        skillLevel: difficulty.skillLevel,
      });

      if (!bestMove) {
        set({ aiThinking: false });
        return;
      }

      // Parse move (format: e2e4 or e7e8q for promotion)
      const from = bestMove.substring(0, 2);
      const to = bestMove.substring(2, 4);
      const promotion = bestMove.length > 4 ? bestMove[4] : undefined;

      // Make the move
      const move = chess.move({ from, to, promotion } as any);

      if (move) {
        const history = [...get().history, move];
        const newFen = chess.fen();
        const newPgn = chess.pgn();
        const newIsGameOver = chess.isGameOver();
        const newResult = chess.getResult();

        set({
          fen: newFen,
          pgn: newPgn,
          history,
          currentMoveIndex: history.length,
          isGameOver: newIsGameOver,
          result: newResult,
          isPlayerTurn: true,
          aiThinking: false,
        });
      } else {
        set({ aiThinking: false });
      }
    } catch (error) {
      console.error('AI move failed:', error);
      set({ aiThinking: false });
    }
  },

  // Stop AI thinking
  stopAi: () => {
    const { engine } = get();
    if (engine) {
      engine.stop();
    }
    set({ aiThinking: false });
  },

  // Destroy engine
  destroyEngine: () => {
    const { engine } = get();
    if (engine) {
      engine.destroy();
    }
    set({ engine: null, aiThinking: false });
  },

  // Initialize multiplayer game
  initMultiplayerGame: async (playerColor: Color) => {
    const chess = new ChessGame();

    try {
      const { gameId, url } = await gameService.createGame(playerColor);

      set({
        chess,
        fen: chess.fen(),
        pgn: chess.pgn(),
        history: [],
        currentMoveIndex: 0,
        gameMode: 'multiplayer',
        multiplayerMode: true,
        gameId,
        playerColor,
        isPlayerTurn: playerColor === 'white',
        isGameOver: false,
        result: '*',
        opponentConnected: false,
      });

      // Start listening for opponent
      get().listenToOpponent();

      return url;
    } catch (error) {
      console.error('Failed to create multiplayer game:', error);
      throw error;
    }
  },

  // Join multiplayer game
  joinMultiplayerGame: async (gameId: string) => {
    const chess = new ChessGame();

    try {
      const gameState = await gameService.joinGame(gameId);

      // Determine player color
      const playerColor = gameState.playerWhite === null ? 'white' : 'black';

      // Load game state
      if (gameState.fen) {
        chess.load(gameState.fen);
      }

      set({
        chess,
        fen: chess.fen(),
        pgn: chess.pgn(),
        history: gameState.history || [],
        currentMoveIndex: gameState.history?.length || 0,
        gameMode: 'multiplayer',
        multiplayerMode: true,
        gameId,
        playerColor,
        isPlayerTurn: chess.turn() === (playerColor === 'white' ? 'w' : 'b'),
        isGameOver: chess.isGameOver(),
        result: gameState.result || '*',
        opponentConnected: true,
      });

      // Start listening for opponent
      get().listenToOpponent();
    } catch (error) {
      console.error('Failed to join multiplayer game:', error);
      throw error;
    }
  },

  // Make multiplayer move
  makeMultiplayerMove: async (move) => {
    const { chess, gameId, playerColor, multiplayerMode } = get();

    if (!multiplayerMode || !gameId) {
      return null;
    }

    const chessMove = chess.move(move as any);

    if (!chessMove) return null;

    const history = [...get().history, chessMove];
    const fen = chess.fen();
    const pgn = chess.pgn();
    const isGameOver = chess.isGameOver();
    const result = chess.getResult();

    try {
      // Sync move to Firebase
      await gameService.makeMove(gameId, chessMove, fen);

      set({
        fen,
        pgn,
        history,
        currentMoveIndex: history.length,
        isGameOver,
        result,
        isPlayerTurn: false,
      });

      // Update game result if game is over
      if (isGameOver) {
        await gameService.updateGameState(gameId, { result });
      }

      return chessMove;
    } catch (error) {
      console.error('Failed to sync move:', error);
      // Revert move on error
      chess.undo();
      return null;
    }
  },

  // Listen to opponent moves
  listenToOpponent: () => {
    const { gameId, unsubscribeMultiplayer } = get();

    if (!gameId) return;

    // Unsubscribe from previous listener
    if (unsubscribeMultiplayer) {
      unsubscribeMultiplayer();
    }

    const unsubscribe = gameService.listenForMoves(gameId, (gameState) => {
      const { chess, playerColor, localPlayerId } = get();

      // Update opponent connection status
      const opponentColor = playerColor === 'white' ? 'black' : 'white';
      const opponent = opponentColor === 'white' ? gameState.playerWhite : gameState.playerBlack;
      const opponentConnected = opponent?.connected ?? false;

      // Check if this is our own move (skip if so)
      const lastMove = gameState.history[gameState.history.length - 1];
      if (lastMove && gameState.history.length > get().history.length) {
        // New move from opponent, update board
        chess.load(gameState.fen);

        const currentTurn = chess.turn() === 'w' ? 'white' : 'black';

        set({
          fen: gameState.fen,
          pgn: chess.pgn(),
          history: gameState.history,
          currentMoveIndex: gameState.history.length,
          isPlayerTurn: currentTurn === playerColor,
          isGameOver: chess.isGameOver(),
          result: gameState.result,
          opponentConnected,
        });
      } else {
        // Just update connection status
        set({ opponentConnected });
      }
    });

    set({ unsubscribeMultiplayer: unsubscribe });
  },

  // Disconnect from multiplayer game
  disconnectMultiplayer: () => {
    const { gameId, playerColor, unsubscribeMultiplayer } = get();

    if (gameId && playerColor) {
      gameService.disconnect(gameId, playerColor);
    }

    if (unsubscribeMultiplayer) {
      unsubscribeMultiplayer();
    }

    set({
      multiplayerMode: false,
      gameId: null,
      opponentConnected: false,
      unsubscribeMultiplayer: null,
      gameMode: 'play',
    });
  },
}));
