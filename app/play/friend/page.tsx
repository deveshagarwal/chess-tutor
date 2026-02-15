'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/game-store';
import { ChessBoard } from '@/components/chess/ChessBoard';
import { ConnectionStatus } from '@/components/multiplayer/ConnectionStatus';
import Link from 'next/link';

export default function PlayFriendPage() {
  const [gameUrl, setGameUrl] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<'white' | 'black'>('white');
  const [isCreating, setIsCreating] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [firebaseConfigured, setFirebaseConfigured] = useState(true);

  const {
    fen,
    history,
    playerColor,
    isPlayerTurn,
    opponentConnected,
    gameId,
    multiplayerMode,
    initMultiplayerGame,
    makeMove,
    disconnectMultiplayer,
    chess,
  } = useGameStore();

  // Check Firebase configuration
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    const isConfigured = apiKey && apiKey !== 'YOUR_API_KEY' && apiKey !== 'your_api_key_here';
    setFirebaseConfigured(!!isConfigured);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (multiplayerMode) {
        disconnectMultiplayer();
      }
    };
  }, [multiplayerMode, disconnectMultiplayer]);

  const handleCreateGame = async () => {
    setIsCreating(true);
    setError(null);

    try {
      const url = await initMultiplayerGame(selectedColor);
      setGameUrl(url);
    } catch (err: any) {
      console.error('Failed to create game:', err);
      const errorMessage = err?.message || 'Failed to create game';
      if (errorMessage.includes('Firebase not initialized')) {
        setError('Firebase is not configured yet. Please follow the setup instructions in FIREBASE_SETUP.md to enable multiplayer features.');
      } else {
        setError(`Failed to create game: ${errorMessage}`);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyLink = () => {
    if (gameUrl) {
      navigator.clipboard.writeText(gameUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleMove = (from: string, to: string) => {
    if (!isPlayerTurn) return;
    makeMove({ from, to });
  };

  // Get legal moves for current position
  const getLegalMoves = () => {
    if (!isPlayerTurn) return new Map();

    const dests = new Map();
    const moves = chess.moves({ verbose: true });

    moves.forEach((move: any) => {
      if (!dests.has(move.from)) {
        dests.set(move.from, []);
      }
      dests.get(move.from).push(move.to);
    });

    return dests;
  };

  const getLastMove = (): [string, string] | undefined => {
    if (history.length === 0) return undefined;
    const lastMove = history[history.length - 1];
    return [lastMove.from, lastMove.to];
  };

  // If no game is created yet, show the create game UI
  if (!gameId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <nav className="border-b border-white/10 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold text-white">♔ Chess Mentor</span>
              </Link>
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">
              Play Against a Friend
            </h1>
            <p className="text-xl text-gray-300">
              Create a game and share the link with your friend
            </p>
          </div>

          {!firebaseConfigured && (
            <div className="mb-8 p-6 bg-purple-500/20 border-2 border-purple-500/50 rounded-2xl">
              <p className="text-purple-300 text-center text-2xl font-bold mb-2">🚧 Coming Soon</p>
              <p className="text-purple-200 text-center">
                Multiplayer functionality is currently under development and will be available soon!
              </p>
            </div>
          )}

          {error && (
            <div className="mb-8 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-center">{error}</p>
            </div>
          )}

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Choose Your Color</h2>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                onClick={() => setSelectedColor('white')}
                className={`p-6 rounded-xl border-2 transition-all ${
                  selectedColor === 'white'
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <div className="text-6xl mb-2">♔</div>
                <div className="text-xl font-semibold text-white">White</div>
                <div className="text-sm text-gray-400">You play first</div>
              </button>

              <button
                onClick={() => setSelectedColor('black')}
                className={`p-6 rounded-xl border-2 transition-all ${
                  selectedColor === 'black'
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <div className="text-6xl mb-2">♚</div>
                <div className="text-xl font-semibold text-white">Black</div>
                <div className="text-sm text-gray-400">Opponent plays first</div>
              </button>
            </div>

            <button
              onClick={handleCreateGame}
              disabled={isCreating}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Creating Game...' : 'Create Game'}
            </button>
          </div>

          {gameUrl && (
            <div className="mt-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Share This Link</h2>
              <p className="text-gray-300 mb-4">
                Send this link to your friend to start playing:
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={gameUrl}
                  readOnly
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white font-mono text-sm"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-all"
                >
                  {copySuccess ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Game is created, show the game board
  const opponentColor = playerColor === 'white' ? 'black' : 'white';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <nav className="border-b border-white/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-white">♔ Chess Mentor</span>
            </Link>
            <ConnectionStatus
              connected={opponentConnected}
              playerColor={playerColor}
              opponentColor={opponentColor}
            />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chessboard */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">
                  Playing as {playerColor === 'white' ? '♔ White' : '♚ Black'}
                </h2>
                {!isPlayerTurn && (
                  <div className="text-yellow-400 text-sm">
                    Opponent&apos;s turn...
                  </div>
                )}
              </div>

              <ChessBoard
                fen={fen}
                orientation={playerColor}
                movable={{
                  color: isPlayerTurn ? playerColor : undefined,
                  dests: getLegalMoves(),
                  showDests: true,
                }}
                onMove={handleMove}
                lastMove={getLastMove()}
                viewOnly={!isPlayerTurn}
              />
            </div>
          </div>

          {/* Game Info */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Game Info</h3>

              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Game ID</div>
                  <div className="text-white font-mono text-xs break-all">{gameId}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-400 mb-1">Your Color</div>
                  <div className="text-white">{playerColor === 'white' ? '♔ White' : '♚ Black'}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-400 mb-1">Status</div>
                  <div className="text-white">
                    {opponentConnected ? (
                      <span className="text-green-400">Both players connected</span>
                    ) : (
                      <span className="text-yellow-400">Waiting for opponent...</span>
                    )}
                  </div>
                </div>

                {gameUrl && !opponentConnected && (
                  <div>
                    <div className="text-sm text-gray-400 mb-2">Share Link</div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={gameUrl}
                        readOnly
                        className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white font-mono text-xs"
                      />
                      <button
                        onClick={handleCopyLink}
                        className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm rounded transition-all"
                      >
                        {copySuccess ? '✓' : 'Copy'}
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-sm text-gray-400 mb-1">Moves</div>
                  <div className="text-white">{history.length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
