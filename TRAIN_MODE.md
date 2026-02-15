# Train with AI Mode

## Overview

The "Train with AI" mode is an educational chess feature that provides instant feedback on every move you make. Unlike the regular "Play vs AI" mode, this mode analyzes each of your moves and tells you whether it was good, bad, or a blunder.

## How It Works

### Real-Time Move Analysis

After every move you make, the Stockfish engine:
1. Evaluates the position before your move
2. Evaluates the position after your move
3. Compares the two evaluations
4. Calculates how much your move improved or worsened your position
5. Provides instant feedback with explanations

### Move Quality Categories

The system categorizes your moves based on how much evaluation changed:

#### Excellent Moves ⭐
- Gained advantage or played the best/near-best move
- Evaluation improved by more than 0.25 pawns
- Shows green feedback card

#### Good Moves ✅
- Maintained position well
- Evaluation stayed roughly the same (within 0.5 pawns)
- Shows green feedback card

#### Inaccuracy ⚠️
- Lost 0.5 to 1.5 pawns of advantage
- Not the best move, but still playable
- Shows red feedback card with suggested better move

#### Mistake ❌
- Lost 1.5 to 3 pawns of advantage
- Significant positional error
- Shows red feedback card with explanation and suggested better move

#### Blunder 🚨
- Lost more than 3 pawns of advantage
- Severely weakened position
- Shows red feedback card with detailed explanation

### Feedback Display

After each move, a colored feedback card appears below the board showing:
- Move notation (e.g., "e4", "Nf3")
- Emoji indicator (✅, ⚠️, ❌, 🚨)
- Detailed explanation of why the move was good or bad
- Suggested better move (if your move wasn't optimal)
- Evaluation difference in centipawns

## Features

### Setup Options
- Choose your color (White or Black)
- Select AI difficulty (800-2500 rating)
- Same difficulty system as regular Play mode

### During Training
- Make moves and get instant feedback
- AI responds after analysis completes
- Move history displayed in sidebar
- Visual board with highlighted last move
- Analyzing indicator while engine evaluates

### Educational Benefits
- Learn from mistakes immediately
- Understand position evaluation
- See suggested improvements
- Build better chess intuition
- Track your move quality over time

## Usage

1. Navigate to "Train with AI" from the homepage
2. Choose your color and AI difficulty
3. Click "Start Training"
4. Play chess as normal
5. After each of your moves, read the feedback
6. Learn from the analysis and continue playing

## Technical Details

### Analysis Depth
- Moves are analyzed at depth 15 for accuracy
- Engine provides best move suggestions
- Evaluation measured in centipawns (1 pawn = 100 centipawns)

### Performance
- Analysis takes 1-3 seconds per move (depending on position complexity)
- "Analyzing..." indicator shown during evaluation
- Board is locked while analysis runs
- AI waits for analysis before making its move

### Evaluation Scoring
- Positive score = better for you
- Negative score = better for opponent
- Scores adjusted automatically based on your color
- Mate scores treated as +/- 100 pawns

## Tips for Effective Training

1. **Read Every Feedback**: Don't just glance - understand why a move was good or bad
2. **Try Suggested Moves**: When the engine suggests a better move, try to understand why it's superior
3. **Start with Lower Difficulty**: Against weaker opponents, you'll make fewer blunders and can focus on learning
4. **Look for Patterns**: Notice which types of positions lead to mistakes
5. **Use Draw Tool**: Practice drawing arrows to visualize the suggested moves

## Differences from Regular Play Mode

| Feature | Play vs AI | Train with AI |
|---------|-----------|---------------|
| Move feedback | None | After every move |
| Analysis | Manual | Automatic |
| Learning focus | Winning | Improvement |
| Pace | Faster | Slower (analysis time) |
| Best move hints | No | Yes |
| Evaluation shown | No | Yes |

## Future Enhancements

Potential additions:
- [ ] Move accuracy percentage at game end
- [ ] Classification of moves (brilliant, best, excellent, good, inaccuracy, mistake, blunder)
- [ ] Detailed position breakdown
- [ ] Save training sessions
- [ ] Progress tracking over multiple games
- [ ] Tactical puzzle suggestions based on mistakes
- [ ] Opening trainer integration
- [ ] Endgame practice mode

## Known Limitations

1. **Analysis Speed**: Each move takes a few seconds to analyze
2. **No Multi-PV**: Only shows one suggested move, not multiple alternatives
3. **No Takebacks During Analysis**: Must wait for analysis to complete
4. **Engine-Based**: Feedback is from Stockfish, not human coaching
5. **Position-Specific**: Doesn't consider long-term strategic plans

## Troubleshooting

### "Unable to analyze this move"
- Engine may be overloaded - try restarting
- Refresh the page and start a new game

### Analysis taking too long
- Complex positions take longer
- Depth 15 is necessary for accuracy
- Consider patience as part of the learning process

### Feedback seems wrong
- Remember: engine sees tactical patterns humans might miss
- Trust the evaluation - Stockfish is rated 3500+
- Look deeper into the position to understand

## Educational Philosophy

This mode follows deliberate practice principles:
- **Immediate Feedback**: Learn right after making mistakes
- **Specific Guidance**: Know exactly what to improve
- **Appropriate Challenge**: Adjustable difficulty
- **Focused Practice**: Concentrate on move quality, not just winning

Use this mode when you want to improve, not just play for fun. It's designed to make you a better chess player through active learning.

---

**Pro Tip**: Alternate between Train mode (for learning) and regular Play mode (for testing your skills). You'll notice your regular play improves after training sessions!
