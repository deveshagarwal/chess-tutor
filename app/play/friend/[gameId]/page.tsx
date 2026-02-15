'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGameStore } from '@/store/game-store';
import { ChessBoard } from '@/components/chess/ChessBoard';
import { ConnectionStatus } from '@/components/multiplayer/ConnectionStatus';
import Link from 'next/link';

export default function JoinGamePage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    fen,
    history,
    playerColor,
    isPlayerTurn,
    opponentConnected,
    multiplayerMode,
    joinMultiplayerGame,
    makeMove,
    disconnectMultiplayer,
    chess,
  } = useGameStore();

  useEffect(() => {
    const joinGame = async () => {
      setIsLoading(true);
      setError(null);

      try {
        await joinMultiplayerGame(gameId);
      } catch (err: any) {
        console.error('Failed to join game:', err);
        setError(err.message || 'Failed to join game. The game may not exist or is already full.');
      } finally {
        setIsLoading(false);
      }
    };

    if (gameId) {
      joinGame();
    }

    return () => {
      if (multiplayerMode) {
        disconnectMultiplayer();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

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

  // Loading state
  if (isLoading) {
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
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mb-4"></div>
            <h1 className="text-3xl font-bold text-white">Joining game...</h1>
            <p className="text-gray-300 mt-2">Please wait while we connect you to the game.</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
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
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-3xl font-bold text-white mb-4">Unable to Join Game</h1>
            <p className="text-gray-300 mb-8">{error}</p>
            <Link
              href="/play/friend"
              className="inline-block px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all"
            >
              Create New Game
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Game view
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
                      <span className="text-yellow-400">Opponent disconnected</span>
                    )}
                  </div>
                </div>

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
