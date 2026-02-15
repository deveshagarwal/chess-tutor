'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChessBoard } from '@/components/chess/ChessBoard';
import { useGameStore } from '@/store/game-store';
import { Chess } from 'chess.js';

interface MoveAnalysis {
  move: string;
  evaluation: number;
  isGood: boolean;
  feedback: string;
  bestMove?: string;
}

function getCategoryFromDiff(diff: number): string {
  if (diff > 500) return '🚨 Blunder';
  if (diff > 300) return '❌ Major Mistake';
  if (diff > 150) return '⚠️ Mistake';
  if (diff > 75) return '⚠️ Inaccuracy';
  if (diff > 25) return '✓ Okay';
  if (diff > -25) return '✅ Good';
  if (diff > -100) return '⭐ Excellent';
  if (diff > -200) return '💎 Brilliant';
  return '🌟 Best';
}

export default function TrainPage() {
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
  const [moveAnalysis, setMoveAnalysis] = useState<MoveAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previousEval, setPreviousEval] = useState<number | null>(null);
  const [showResignModal, setShowResignModal] = useState(false);
  const [showDrawModal, setShowDrawModal] = useState(false);

  const { initEngine, aiThinking, setDifficulty, engine } = useGameStore();

  useEffect(() => {
    initEngine().then(() => {
      setEngineReady(true);
      console.log('Engine initialized successfully!');
    }).catch(err => {
      console.error('Failed to initialize engine:', err);
    });
  }, [initEngine]);

  const startGame = () => {
    resetGame();
    setResetCount(prev => prev + 1);
    setGameMode('play');
    setPlayerColor(setupColor);
    setSelectedDifficulty(setupDifficulty);
    setDifficulty(setupDifficulty);
    setMoveAnalysis(null);
    setPreviousEval(null);
    setShowSetupModal(false);
  };

  useEffect(() => {
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

  const analyzeMoveQuality = async (moveFen: string, moveNotation: string, beforeFen: string) => {
    if (!engine) return;

    setIsAnalyzing(true);

    try {
      console.log('\n🎯 ============ STARTING ANALYSIS ============');
      console.log('📍 Position BEFORE player moved:', beforeFen);
      console.log('📍 Position AFTER player moved:', moveFen);
      console.log('♟️ Player move notation:', moveNotation);

      // Verify the position is valid
      const testChess = new Chess(beforeFen);
      console.log('🎲 Legal moves from this position:', testChess.moves().slice(0, 10).join(', '), '...');
      console.log('👤 Turn to move in beforeFen:', testChess.turn() === 'w' ? 'white' : 'black');

      // Get Stockfish's best move and evaluation for the position BEFORE the player moved
      // Using depth 8 for speed - still accurate enough for training
      console.log('⏳ Asking Stockfish for best move...');
      const evalBefore = await engine.evaluate(beforeFen, { depth: 8 });
      const scoreBefore = evalBefore.type === 'mate'
        ? (evalBefore.value > 0 ? 10000 : -10000)
        : evalBefore.value;

      const bestMoveNotation = evalBefore.bestMove;
      console.log('🤖 Stockfish says best move is (UCI):', bestMoveNotation);
      console.log('📊 Position evaluation:', scoreBefore);

      // Now evaluate what would happen after the BEST move
      const chess = new Chess(beforeFen);
      const bestMoveUci = bestMoveNotation; // Format: e2e4

      let bestMoveFen = beforeFen;
      let bestMoveEval = scoreBefore;

      if (bestMoveUci) {
        try {
          // Parse UCI move (e2e4 or e7e8q for promotion)
          const from = bestMoveUci.substring(0, 2);
          const to = bestMoveUci.substring(2, 4);
          const promotion = bestMoveUci.length > 4 ? bestMoveUci[4] : undefined;

          const testMove = chess.move({ from, to, promotion } as any);
          if (testMove) {
            bestMoveFen = chess.fen();
            const evalBestMove = await engine.evaluate(bestMoveFen, { depth: 8 });
            bestMoveEval = evalBestMove.type === 'mate'
              ? (evalBestMove.value > 0 ? 10000 : -10000)
              : evalBestMove.value;
          }
        } catch (e) {
          console.log('Could not evaluate best move:', e);
        }
      }

      // Get evaluation after the PLAYER'S move
      const evalAfter = await engine.evaluate(moveFen, { depth: 8 });
      const scoreAfter = evalAfter.type === 'mate'
        ? (evalAfter.value > 0 ? 10000 : -10000)
        : evalAfter.value;

      // Adjust scores based on player color (positive = good for player)
      const adjustedBefore = playerColor === 'white' ? scoreBefore : -scoreBefore;
      const adjustedAfterBest = playerColor === 'white' ? -bestMoveEval : bestMoveEval;
      const adjustedAfterPlayer = playerColor === 'white' ? -scoreAfter : scoreAfter;

      // Calculate how much worse the player's move was compared to best move
      const diff = adjustedAfterBest - adjustedAfterPlayer;

      // Check if player played the best move
      const playedBestMove = diff < 25; // Within 0.25 pawns = essentially best

      // Analyze position characteristics
      const moveNumber = Math.floor(history.length / 2) + 1;
      const gamePhase = moveNumber <= 10 ? 'opening' : moveNumber <= 25 ? 'middlegame' : 'endgame';

      // Check if the move was capturing
      const isCapture = moveNotation.includes('x');
      const isCheck = moveNotation.includes('+');
      const isCheckmate = moveNotation.includes('#');

      // Convert best move UCI to readable notation FIRST (needed for tactical analysis)
      let bestMoveSAN = '';

      if (bestMoveNotation && bestMoveNotation.length >= 4) {
        try {
          const testChess = new Chess(beforeFen);
          const from = bestMoveNotation.substring(0, 2);
          const to = bestMoveNotation.substring(2, 4);
          const promotion = bestMoveNotation.length > 4 ? bestMoveNotation[4] : undefined;

          const legalMoves = testChess.moves({ verbose: true });
          const isLegal = legalMoves.some((m: any) =>
            m.from === from && m.to === to &&
            (promotion ? m.promotion === promotion : true)
          );

          if (isLegal) {
            const move = testChess.move({ from, to, promotion } as any);
            if (move) {
              bestMoveSAN = move.san;
            }
          }
        } catch (e) {
          console.error('Error converting best move:', bestMoveNotation, e);
        }
      }

      // COMPREHENSIVE TACTICAL ANALYSIS
      const chessAfter = new Chess(moveFen);
      const chessBefore = new Chess(beforeFen);

      const pieceNames: any = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' };
      const pieceValues: any = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

      let tacticalAnalysis = '';

      // Parse player's move
      const moveObj = chessBefore.move(moveNotation);
      chessBefore.undo();

      if (!moveObj) {
        console.error('Could not parse move:', moveNotation);
        tacticalAnalysis = `Move ${moveNotation} was played. `;
      } else {
        // 1. Check if we captured something
        if (moveObj.captured) {
          const capturedValue = pieceValues[moveObj.captured];
          tacticalAnalysis += `You captured a ${pieceNames[moveObj.captured]} (worth ${capturedValue} points). `;
        }

        // 2. Check if the piece we moved is now hanging
        const ourPieceSquare = moveObj.to;
        const ourPieceType = moveObj.piece;
        const opponentMoves = chessAfter.moves({ verbose: true });

        const attackersOnOurPiece = opponentMoves.filter((m: any) => m.to === ourPieceSquare);
        if (attackersOnOurPiece.length > 0) {
          const pieceValue = pieceValues[ourPieceType];
          tacticalAnalysis += `Your ${pieceNames[ourPieceType]} on ${ourPieceSquare} is now attacked and can be captured (losing ${pieceValue} points). `;
        }

        // 3. Check what Stockfish's best move would have done
        if (bestMoveNotation && !playedBestMove) {
          const testChess = new Chess(beforeFen);
          const bestFrom = bestMoveNotation.substring(0, 2) as any;
          const bestTo = bestMoveNotation.substring(2, 4) as any;
          const bestPromo = bestMoveNotation.length > 4 ? bestMoveNotation[4] : undefined;

          const targetPiece = testChess.get(bestTo);
          const movingPiece = testChess.get(bestFrom);

          if (targetPiece && targetPiece.color !== testChess.turn()) {
            // Best move was a capture we missed
            const targetValue = pieceValues[targetPiece.type];
            tacticalAnalysis += `Stockfish's ${bestMoveSAN} would have captured the opponent's ${pieceNames[targetPiece.type]} on ${bestTo} (winning ${targetValue} points). `;
          } else if (movingPiece) {
            // Best move was positional - describe what it does
            testChess.move({ from: bestFrom, to: bestTo, promotion: bestPromo } as any);
            const afterBestMove = testChess.moves({ verbose: true });

            // Check if best move creates threats
            const threatsCreated = afterBestMove.filter((m: any) => m.captured).length;
            if (threatsCreated > 0) {
              tacticalAnalysis += `Stockfish's ${bestMoveSAN} creates ${threatsCreated} threat(s) against opponent pieces. `;
            } else {
              tacticalAnalysis += `Stockfish's ${bestMoveSAN} improves piece placement and position. `;
            }
          }
        }

        // 4. Evaluate based on eval diff
        if (diff < 25) {
          tacticalAnalysis += 'Your move is roughly equal to the best move.';
        } else if (diff < 100) {
          tacticalAnalysis += 'Your move is slightly inaccurate but acceptable.';
        } else if (diff < 300) {
          tacticalAnalysis += `Your move loses about ${Math.round(diff / 100)} pawn(s) worth of advantage.`;
        } else {
          tacticalAnalysis += `This is a serious mistake, losing ${Math.round(diff / 100)}+ pawn(s) of advantage.`;
        }
      }

      console.log('\n📊 ============ FINAL COMPARISON ============');
      console.log('🤖 Stockfish best move (SAN):', bestMoveSAN);
      console.log('👤 Player actually played:', moveNotation);
      console.log('🎯 Player played best move?', playedBestMove);
      console.log('📉 Eval difference:', diff);
      console.log('\n🔍 ============ TACTICAL ANALYSIS ============');
      console.log(tacticalAnalysis || 'No tactical analysis generated');
      console.log('============================================\n');

      // Ensure we have some analysis
      if (!tacticalAnalysis) {
        tacticalAnalysis = `Move ${moveNotation} was analyzed.`;
      }

      // IMPORTANT: Only show best move if player DIDN'T play it
      // This tells them what they SHOULD have played instead of what they did play
      if (bestMoveSAN === moveNotation || !bestMoveSAN || playedBestMove) {
        console.log('Not showing suggestion because:', {
          sameMove: bestMoveSAN === moveNotation,
          empty: !bestMoveSAN,
          playedBest: playedBestMove
        });
        bestMoveSAN = ''; // Don't show it if it's the same as what they played
      } else {
        console.log('SHOWING SUGGESTION:', bestMoveSAN);
      }
      console.log('=== END DEBUG ===');

      // Clean up tactical analysis - remove points and replace technical language
      let feedback = tacticalAnalysis
        .replace(/\(worth \d+ points?\)/g, '')
        .replace(/\(losing \d+ points?\)/g, '')
        .replace(/\(winning \d+ points?\)/g, '')
        .replace(/Stockfish's/g, 'The best move was')
        .replace(/loses about \d+ pawn\(s\) worth of advantage/g, 'weakens your position')
        .replace(/Your move is roughly equal to the best move\./g, 'Excellent move!')
        .replace(/Your move is slightly inaccurate but acceptable\./g, 'Decent move, but there was something slightly better.')
        .replace(/This is a serious mistake, losing \d+\+ pawn\(s\) of advantage\./g, 'This is a serious mistake that significantly weakens your position.');

      const category = getCategoryFromDiff(diff);

      console.log('📥 Final Feedback:', { feedback, category });

      // Determine if move is good based on comparison to best move
      const isGood = diff < 75; // Within 0.75 pawns of best = good

      // Final check: only show bestMove if it's valid SAN notation and different from played move
      const shouldShowBestMove = !playedBestMove && bestMoveSAN && bestMoveSAN !== moveNotation;

      setMoveAnalysis({
        move: `${moveNotation} - ${category}`,
        evaluation: diff,
        isGood,
        feedback,
        bestMove: shouldShowBestMove ? bestMoveSAN : undefined,
      });

      setPreviousEval(scoreAfter);
    } catch (error) {
      console.error('Failed to analyze move:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      setMoveAnalysis({
        move: moveNotation,
        evaluation: 0,
        isGood: true,
        feedback: `Unable to analyze this move. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleMove = async (from: string, to: string) => {
    if (!isPlayerTurn || isAnalyzing || aiThinking) return;

    // IMPORTANT: Use move.before from the move result, not fen state
    // The fen state might be stale or not updated yet
    const move = makeMove({ from, to });

    if (move) {
      const beforeFen = move.before; // This is the ACTUAL position before the move

      console.log('✅ Move made:', move);
      console.log('📋 Positions:', {
        before: beforeFen,
        after: move.after,
        moveSAN: move.san
      });

      // Only analyze if this was the PLAYER's move (not AI's response)
      // Check by seeing whose turn it is now - if it's player's turn, skip analysis
      const chess = new Chess(move.after);
      const currentTurn = chess.turn() === 'w' ? 'white' : 'black';

      console.log('🎯 Turn check:', {
        currentTurn,
        playerColor,
        shouldAnalyze: currentTurn !== playerColor
      });

      // If it's player's turn now, that means AI just moved, so don't analyze
      // If it's opponent's turn, that means player just moved, so DO analyze
      if (currentTurn !== playerColor) {
        await analyzeMoveQuality(move.after, move.san, beforeFen);
      } else {
        console.log('⏭️ Skipping analysis (AI just moved)');
      }
    }
  };

  const handleReset = () => {
    setShowSetupModal(true);
    setResetCount(prev => prev + 1);
    setMoveAnalysis(null);
    setPreviousEval(null);
  };

  const handleResign = () => {
    console.log('Resigning game...');
    set({
      isGameOver: true,
      result: playerColor === 'white' ? '0-1' : '1-0'
    });
    setShowResignModal(false);
    console.log('Game over state set:', { isGameOver: true, result: playerColor === 'white' ? '0-1' : '1-0' });
  };

  const handleDrawOffer = () => {
    console.log('Offering draw...');
    set({
      isGameOver: true,
      result: '½-½'
    });
    setShowDrawModal(false);
    console.log('Game over state set:', { isGameOver: true, result: '½-½' });
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
            <h2 className="text-3xl font-bold text-white mb-2 text-center">
              Train with AI
            </h2>
            <p className="text-gray-400 text-sm text-center mb-6">
              Get instant feedback on every move you make
            </p>

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

            {/* Start Button */}
            <button
              onClick={startGame}
              disabled={!engineReady}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/50 disabled:shadow-none"
            >
              {!engineReady ? 'Initializing AI...' : 'Start Training'}
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
              Train with AI Coach
            </h1>
            <p className="text-gray-400">
              {!engineReady ? 'Initializing AI engine...' :
               isAnalyzing ? '🔍 Analyzing your move...' :
               aiThinking ? '🤔 AI is thinking...' :
               'Make your move and get instant feedback'}
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
            {/* Move Feedback */}
            {moveAnalysis && (
              <div className={`p-6 rounded-2xl border-2 ${
                moveAnalysis.isGood
                  ? 'bg-green-500/10 border-green-500/50'
                  : 'bg-red-500/10 border-red-500/50'
              }`}>
                <div className="flex items-start gap-4">
                  <div className="text-4xl">
                    {moveAnalysis.isGood ? '✅' : '❌'}
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-xl font-bold mb-2 ${
                      moveAnalysis.isGood ? 'text-green-400' : 'text-red-400'
                    }`}>
                      Move: {moveAnalysis.move}
                    </h3>
                    <p className="text-white text-sm leading-relaxed">
                      {moveAnalysis.feedback}
                    </p>
                    {moveAnalysis.bestMove && (
                      <div className="mt-3 p-3 bg-white/10 rounded-lg">
                        <p className="text-xs text-gray-300">
                          💡 <span className="font-semibold">Better was:</span> {moveAnalysis.bestMove}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Loading state */}
            {isAnalyzing && (
              <div className="p-6 rounded-2xl border-2 border-purple-500/50 bg-purple-500/10 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="text-4xl animate-spin">⚙️</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">Analyzing Move...</h3>
                    <p className="text-gray-300 text-sm">
                      AI is evaluating your position and finding insights
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Placeholder when no analysis */}
            {!moveAnalysis && !isAnalyzing && (
              <div className="p-6 rounded-2xl border-2 border-white/10 bg-white/5">
                <div className="text-center">
                  <div className="text-4xl mb-2">🎓</div>
                  <h3 className="text-lg font-bold text-white mb-2">Move Feedback</h3>
                  <p className="text-gray-400 text-sm">
                    Make a move to see analysis and feedback here
                  </p>
                </div>
              </div>
            )}
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
                  disabled={isGameOver || history.length < 2}
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
                  className="group relative px-4 py-3 bg-gradient-to-b from-white/10 to-white/5 hover:from-red-500/20 hover:to-red-500/10 disabled:from-white/5 disabled:to-white/5 disabled:cursor-not-allowed text-white rounded-xl transition-all font-medium border border-white/20 hover:border-red-400/50 disabled:border-white/10 shadow-lg disabled:shadow-none"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xl group-disabled:opacity-30">⚐</span>
                    <span className="text-xs group-disabled:text-gray-500">Resign</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Move History */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden flex flex-col" style={{ height: '400px' }}>
              <div className="px-6 py-4 border-b border-white/10">
                <h2 className="text-lg font-semibold text-white">
                  Move History
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                {history.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="text-6xl mb-4 opacity-20">🎓</div>
                      <p className="text-gray-500 text-sm">No moves yet</p>
                      <p className="text-gray-600 text-xs mt-1">Start playing to get feedback!</p>
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
            <div className="flex gap-4">
              <button
                onClick={() => setShowResignModal(false)}
                className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleResign}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all"
              >
                Resign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Draw Modal */}
      {showDrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-blue-500/50 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h2 className="text-3xl font-bold text-white mb-4 text-center">Offer Draw?</h2>
            <p className="text-gray-400 text-center mb-6">
              The AI will accept your draw offer.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDrawModal(false)}
                className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDrawOffer}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all"
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
                setMoveAnalysis(null);
                setPreviousEval(null);
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
