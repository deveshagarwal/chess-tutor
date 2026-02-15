'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChessBoard } from '@/components/chess/ChessBoard';
import { useGameStore } from '@/store/game-store';
import { Chess } from 'chess.js';

export default function PlayPage() {
  const {
    fen,
    makeMove,
    resetGame,
    history,
    isPlayerTurn,
    playerColor,
    setPlayerColor,
    isGameOver,
    result,
    setGameMode,
    undoMove,
  } = useGameStore();

  // Get the set function to update game state directly
  const set = (updates: any) => {
    useGameStore.setState(updates);
  };

  const [legalMoves, setLegalMoves] = useState<Map<any, any[]>>(new Map());
  const [engineReady, setEngineReady] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState(1500);
  const [resetCount, setResetCount] = useState(0);
  const [showSetupModal, setShowSetupModal] = useState(true);
  const [setupColor, setSetupColor] = useState<'white' | 'black'>('white');
  const [setupDifficulty, setSetupDifficulty] = useState(1500);
  const [showResignModal, setShowResignModal] = useState(false);
  const [showDrawModal, setShowDrawModal] = useState(false);
  const { initEngine, aiThinking, setDifficulty, difficulty, engine } = useGameStore();

  const handleDrawOffer = async () => {
    if (!engine) {
      alert('Engine not ready');
      return;
    }

    try {
      // Evaluate current position
      const evaluation = await engine.evaluate(fen, { depth: 10 });

      // Get centipawn evaluation (positive = white is better, negative = black is better)
      let evalScore = evaluation.type === 'mate' ?
        (evaluation.value > 0 ? 10000 : -10000) :
        evaluation.value;

      // Adjust based on player color
      const adjustedScore = playerColor === 'white' ? evalScore : -evalScore;

      // AI accepts draw if position is roughly equal (within ±100 centipawns)
      // Or if AI is losing (position is bad for AI)
      const isPositionEqual = Math.abs(adjustedScore) < 100;
      const aiIsLosing = adjustedScore > 150; // Player is winning by 1.5 pawns or more

      if (isPositionEqual || aiIsLosing) {
        set({ isGameOver: true, result: '1/2-1/2' });
        alert(`AI accepts the draw! (Position evaluation: ${(adjustedScore / 100).toFixed(2)})`);
      } else {
        alert(`AI declines the draw. (Position evaluation: ${(adjustedScore / 100).toFixed(2)})`);
      }
    } catch (error) {
      console.error('Failed to evaluate position:', error);
      alert('Failed to evaluate position for draw offer');
    } finally {
      setShowDrawModal(false);
    }
  };

  const handleResign = () => {
    set({ isGameOver: true, result: playerColor === 'white' ? '0-1' : '1-0' });
    setShowResignModal(false);
  };

  // Initialize engine (but don't start game until modal is closed)
  useEffect(() => {
    initEngine().then(() => {
      setEngineReady(true);
      console.log('Engine initialized successfully!');
    }).catch(err => {
      console.error('Failed to initialize engine:', err);
    });
  }, [initEngine]);

  const startGame = () => {
    // Reset everything first
    resetGame();
    setResetCount(prev => prev + 1); // Force board remount to clear highlights

    // Then set up new game
    setGameMode('play');
    setPlayerColor(setupColor);
    setSelectedDifficulty(setupDifficulty);
    setDifficulty(setupDifficulty);

    // Close modal
    setShowSetupModal(false);
  };

  useEffect(() => {
    // Calculate legal moves for the current position
    const chess = new Chess(fen);
    const moves = chess.moves({ verbose: true });
    const dests = new Map<any, any[]>();

    moves.forEach((move) => {
      if (!dests.has(move.from)) {
        dests.set(move.from, []);
      }
      dests.get(move.from)?.push(move.to);
    });

    setLegalMoves(dests);
  }, [fen]);

  const handleMove = (from: string, to: string) => {
    const move = makeMove({ from, to });
    if (move) {
      console.log('Move made:', move);
    }
  };

  const handleReset = () => {
    setShowSetupModal(true);
    setResetCount(prev => prev + 1);
  };

  const handleFlip = () => {
    setPlayerColor(playerColor === 'white' ? 'black' : 'white');
  };

  const lastMoveSquares = history.length > 0
    ? [history[history.length - 1].from, history[history.length - 1].to] as [string, string]
    : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Setup Modal */}
      {showSetupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-purple-500/50 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">
              New Game Setup
            </h2>

            {/* Color Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                Choose Your Color
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setSetupColor('white')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    setupColor === 'white'
                      ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/50'
                      : 'border-white/20 bg-white/5 hover:border-purple-500/50'
                  }`}
                >
                  <div className="text-4xl mb-2">⚪</div>
                  <div className="font-semibold text-white">White</div>
                  <div className="text-xs text-gray-400">Play first</div>
                </button>
                <button
                  onClick={() => setSetupColor('black')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    setupColor === 'black'
                      ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/50'
                      : 'border-white/20 bg-white/5 hover:border-purple-500/50'
                  }`}
                >
                  <div className="text-4xl mb-2">⚫</div>
                  <div className="font-semibold text-white">Black</div>
                  <div className="text-xs text-gray-400">AI plays first</div>
                </button>
              </div>
            </div>

            {/* Difficulty Selection */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                AI Difficulty
              </label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Rating</span>
                  <span className="text-2xl font-bold text-purple-400">{setupDifficulty}</span>
                </div>
                <input
                  type="range"
                  min="800"
                  max="2500"
                  step="100"
                  value={setupDifficulty}
                  onChange={(e) => setSetupDifficulty(parseInt(e.target.value))}
                  className="w-full h-3 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Beginner</span>
                  <span>Master</span>
                </div>
                <div className="p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30">
                  <p className="text-sm text-center font-semibold text-white">
                    {setupDifficulty < 1000 ? '🟢 Beginner' :
                     setupDifficulty < 1400 ? '🟡 Intermediate' :
                     setupDifficulty < 1800 ? '🟠 Advanced' :
                     setupDifficulty < 2200 ? '🔴 Expert' :
                     '⚫ Master'}
                  </p>
                </div>
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={startGame}
              disabled={!engineReady}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/50 disabled:shadow-none"
            >
              {!engineReady ? 'Initializing AI...' : 'Start Game'}
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="border-b border-white/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 text-white hover:text-purple-400 transition-colors">
              <span>←</span>
              <span className="font-semibold">Back to Home</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {engineReady ? 'Play Against AI' : 'Chess Board'}
            </h1>
            <p className="text-gray-400">
              {!engineReady ? 'Initializing AI engine...' : aiThinking ? '🤔 AI is thinking...' : 'Your turn to move'}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all font-medium shadow-lg shadow-purple-500/50"
            >
              New Game
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chessboard */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-2xl">
              <ChessBoard
                key={resetCount}
                fen={fen}
                orientation={playerColor}
                movable={{
                  free: false,
                  color: 'both',
                  dests: legalMoves,
                }}
                onMove={handleMove}
                lastMove={lastMoveSquares}
                animation={{ enabled: true, duration: 300 }}
                coordinates={true}
                drawable={true}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Game Actions */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-3">
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    undoMove();
                    setResetCount(prev => prev + 1);
                  }}
                  disabled={history.length === 0 || isGameOver}
                  className="group relative px-4 py-3 bg-gradient-to-b from-white/10 to-white/5 hover:from-blue-500/20 hover:to-blue-500/10 disabled:from-white/5 disabled:to-white/5 disabled:cursor-not-allowed text-white rounded-xl transition-all font-medium border border-white/20 hover:border-blue-400/50 disabled:border-white/10 shadow-lg disabled:shadow-none"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xl group-disabled:opacity-30">↶</span>
                    <span className="text-xs group-disabled:text-gray-500">Takeback</span>
                  </div>
                </button>
                <button
                  onClick={() => setShowDrawModal(true)}
                  disabled={isGameOver || history.length < 10}
                  className="group relative px-4 py-3 bg-gradient-to-b from-white/10 to-white/5 hover:from-gray-400/20 hover:to-gray-400/10 disabled:from-white/5 disabled:to-white/5 disabled:cursor-not-allowed text-white rounded-xl transition-all font-medium border border-white/20 hover:border-gray-300/50 disabled:border-white/10 shadow-lg disabled:shadow-none"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xl group-disabled:opacity-30">½</span>
                    <span className="text-xs group-disabled:text-gray-500">Draw</span>
                  </div>
                </button>
                <button
                  onClick={() => setShowResignModal(true)}
                  disabled={isGameOver}
                  className="group relative px-4 py-3 bg-gradient-to-b from-white/10 to-white/5 hover:from-red-500/30 hover:to-red-500/20 disabled:from-white/5 disabled:to-white/5 disabled:cursor-not-allowed text-white rounded-xl transition-all font-medium border border-white/20 hover:border-red-400/50 disabled:border-white/10 shadow-lg disabled:shadow-none"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xl group-disabled:opacity-30">🏳</span>
                    <span className="text-xs group-disabled:text-gray-500">Resign</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Move History */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden flex flex-col" style={{ height: '525px' }}>
              <div className="px-6 py-4 border-b border-white/10">
                <h2 className="text-lg font-semibold text-white">
                  Move History
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                {history.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="text-6xl mb-4 opacity-20">♟️</div>
                      <p className="text-gray-500 text-sm">No moves yet</p>
                      <p className="text-gray-600 text-xs mt-1">Make your first move!</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {Array.from({ length: Math.ceil(history.length / 2) }, (_, moveNumber) => {
                      const whiteMove = history[moveNumber * 2];
                      const blackMove = history[moveNumber * 2 + 1];
                      const isLastMove = moveNumber === Math.ceil(history.length / 2) - 1;

                      return (
                        <div
                          key={moveNumber}
                          className={`flex items-center gap-2 p-2.5 rounded-lg transition-all ${
                            isLastMove ? 'bg-purple-500/20 border border-purple-500/30' : 'hover:bg-white/5'
                          }`}
                        >
                          <span className="font-bold text-gray-400 w-8 text-sm">
                            {moveNumber + 1}.
                          </span>
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <div className="font-mono text-sm bg-white/10 text-white px-3 py-1.5 rounded-md text-center font-medium">
                              {whiteMove.san}
                            </div>
                            {blackMove ? (
                              <div className="font-mono text-sm bg-white/10 text-white px-3 py-1.5 rounded-md text-center font-medium">
                                {blackMove.san}
                              </div>
                            ) : (
                              <div className="bg-white/5 rounded-md"></div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              {history.length > 0 && (
                <div className="px-6 py-3 border-t border-white/10 bg-white/5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Total Moves</span>
                    <span className="font-semibold text-white">{history.length}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Resign Modal */}
      {showResignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-red-500/50 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h2 className="text-3xl font-bold text-white mb-4 text-center">Resign Game?</h2>
            <p className="text-gray-400 text-center mb-6">
              Are you sure you want to resign? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResignModal(false)}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all border border-white/20"
              >
                Cancel
              </button>
              <button
                onClick={handleResign}
                className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl transition-all shadow-lg"
              >
                Resign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Draw Offer Modal */}
      {showDrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-gray-500/50 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h2 className="text-3xl font-bold text-white mb-4 text-center">Offer Draw?</h2>
            <p className="text-gray-400 text-center mb-6">
              Do you want to offer a draw to the AI? The AI will evaluate the position and decide whether to accept.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDrawModal(false)}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all border border-white/20"
              >
                Cancel
              </button>
              <button
                onClick={handleDrawOffer}
                className="flex-1 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold rounded-xl transition-all shadow-lg"
              >
                Offer Draw
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-purple-500/50 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">
                {result === '1-0' && playerColor === 'white' ? '🎉' :
                 result === '0-1' && playerColor === 'black' ? '🎉' :
                 result === '½-½' || result === '1/2-1/2' ? '🤝' : '😔'}
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {result === '1-0' && playerColor === 'white' ? 'You Win!' :
                 result === '0-1' && playerColor === 'black' ? 'You Win!' :
                 result === '½-½' || result === '1/2-1/2' ? 'Draw!' : 'You Lose!'}
              </h2>
              <p className="text-gray-400">
                {result === '1-0' ? 'White wins' :
                 result === '0-1' ? 'Black wins' :
                 result === '½-½' || result === '1/2-1/2' ? 'Game drawn' : 'Game over'}
              </p>
            </div>
            <button
              onClick={() => {
                resetGame();
                setShowSetupModal(true);
                setResetCount(prev => prev + 1);
              }}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl transition-all shadow-lg"
            >
              New Game
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.7);
        }
      `}</style>
    </div>
  );
}
