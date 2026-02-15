import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
    const {
      cleanedAnalysis,
      playerMove,
      evalDiff,
    } = body;

    const apiKey = process.env.OPENAI_API_KEY;
    const useOllama = process.env.USE_OLLAMA === 'true';

    if (!apiKey && !useOllama) {
      // Fallback to rule-based analysis if no API key
      return NextResponse.json({
        feedback: generateFallbackFeedback(body),
        category: getCategoryFromDiff(evalDiff || 0),
      });
    }

    // Build the prompt - Ollama only changes advantage/points language
    const prompt = `Rewrite this text by replacing technical jargon with simple language:

"${cleanedAnalysis}"

Rules:
- Replace "loses about X pawn(s) worth of advantage" with "weakens your position"
- Replace "slightly inaccurate" with "not the strongest"
- Keep all piece names, squares, and tactical facts exactly the same
- Add one chess tip at the very end

Output only the final text, no explanation.`;

    const systemMessage = 'Only replace phrases about "advantage" and "points" with simpler words. Keep everything else word-for-word. Add one chess tip at the end. Never say "here is" or use meta language.';

    let response;
    let feedback;

    if (useOllama) {
      // Use local Ollama API (free, runs on your computer)
      // Use 127.0.0.1 instead of localhost to force IPv4
      response = await fetch('http://127.0.0.1:11434/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3.2',
          messages: [
            {
              role: 'system',
              content: systemMessage,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          stream: false,
          options: {
            num_predict: 200, // Enough for complete response without cutoff
            temperature: 0.7,
            top_p: 0.9,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Ollama API request failed');
      }

      const data = await response.json();
      feedback = data.message.content;
    } else {
      // Use OpenAI API
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: systemMessage,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 250,
        }),
      });

      if (!response.ok) {
        throw new Error('OpenAI API request failed');
      }

      const data = await response.json();
      feedback = data.choices[0].message.content;
    }

    // Use actual eval difference for category
    const category = getCategoryFromDiff(evalDiff || 0);

    return NextResponse.json({
      feedback,
      category,
    });
  } catch (error) {
    console.error('Move analysis API error:', error);

    // Fallback to rule-based feedback
    if (!body) {
      return NextResponse.json({
        feedback: 'Unable to analyze this move. Please try again.',
        category: '⚠️ Error',
      });
    }

    return NextResponse.json({
      feedback: body.cleanedAnalysis || 'Unable to analyze this move.',
      category: getCategoryFromDiff(body.evalDiff || 0),
    });
  }
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

function getPositionContext(evaluation: number): string {
  const absEval = Math.abs(evaluation);
  if (absEval < 50) return '📊 Position is equal';
  if (evaluation > 300) return `📊 You're winning`;
  if (evaluation < -300) return `📊 You're losing`;
  if (evaluation > 100) return `📊 You have an advantage`;
  if (evaluation < -100) return `📊 Opponent has an advantage`;
  if (evaluation > 0) return `📊 Slight edge for you`;
  return `📊 Opponent has a slight edge`;
}

function generateFallbackFeedback(body: any): string {
  const { evaluationDiff, gamePhase, isCapture, bestMove, moveNotation, playedBestMove, afterEvalPlayer } = body;
  const diff = evaluationDiff;

  let feedback = '';

  if (playedBestMove) {
    feedback = `🌟 Best move! You found Stockfish's top choice. `;
    if (isCapture) {
      feedback += `This tactical capture is precisely what the position demanded. Always calculate forced sequences carefully. `;
    } else if (gamePhase === 'opening') {
      feedback += `Excellent opening play - you're following strong principles like development and center control. `;
    } else if (gamePhase === 'middlegame') {
      feedback += `Sharp calculation! This creates maximum pressure. Remember: in the middlegame, initiative often matters more than material. `;
    } else {
      feedback += `Perfect endgame technique. You're converting correctly. Key endgame principle: activate your king! `;
    }
  } else if (diff < 25) {
    feedback = `✅ Excellent! Your move is nearly as good as Stockfish's top choice. `;
    feedback += `This shows strong understanding of the position. When multiple moves are similarly good, trust your intuition.`;
  } else if (diff < 75) {
    feedback = `✓ Good move, though not the absolute best. `;
    if (bestMove) {
      feedback += `Stockfish slightly prefers ${bestMove} here. `;
    }
    if (gamePhase === 'opening') {
      feedback += `Remember: develop with purpose, not just to develop.`;
    } else {
      feedback += `Always look for the most forcing moves first.`;
    }
  } else if (diff < 150) {
    feedback = `⚠️ Inaccuracy. `;
    if (bestMove) {
      feedback += `The best move was ${bestMove}. `;
    }
    if (gamePhase === 'opening') {
      feedback += `Focus on piece development and center control. Knights before bishops in most openings!`;
    } else if (gamePhase === 'middlegame') {
      feedback += `Look for more active piece placement. Every piece should have a purpose.`;
    } else {
      feedback += `In the endgame, precision is everything. Calculate concrete variations.`;
    }
  } else if (diff < 300) {
    feedback = `❌ Mistake. `;
    if (bestMove) {
      feedback += `${bestMove} was much stronger here. `;
    }
    if (isCapture) {
      feedback += `This capture may have walked into a tactical shot. Always ask: "What does this move allow my opponent?" `;
    } else {
      feedback += `Before moving, always check for opponent threats. "See the whole board!"`;
    }
  } else if (diff < 500) {
    feedback = `🚨 Major mistake! `;
    if (bestMove) {
      feedback += `Playing ${bestMove} instead was critical. `;
    }
    feedback += `This significantly weakens your position. Important principle: When in doubt, improve your worst-placed piece.`;
  } else {
    feedback = `😱 Blunder! `;
    if (bestMove) {
      feedback += `${bestMove} was essential here. `;
    }
    if (isCapture) {
      feedback += `This capture was a trap! Lesson: Not every check or capture is good - calculate first.`;
    } else {
      feedback += `You may have hung a piece or missed a key defensive move. Take your time on critical positions!`;
    }
  }

  const positionContext = getPositionContext(afterEvalPlayer);
  return `${feedback}\n\n${positionContext}`;
}
