# Quick Start Guide

## Try the Application Now

The dev server is already running at: **http://localhost:3003**

## What You Can Do Right Now

### 1. Play Chess Against AI ♟️

Visit http://localhost:3003/play

- The AI engine (Stockfish) initializes automatically
- Click and drag pieces to make moves
- The AI responds after each move
- Adjust difficulty by modifying the rating in the game store (default: 1500)
- Reset the game anytime with the "Reset Game" button
- Flip the board to play as Black

**Features Working:**
- ✅ Legal move validation
- ✅ AI move calculation
- ✅ Move history tracking
- ✅ Game state detection (checkmate, stalemate, draw)
- ✅ Board orientation flipping

### 2. Import Your Games 📥

Visit http://localhost:3003/import

- Choose between Lichess or Chess.com
- Enter your username (try public profiles like "DrNykterstein" on Lichess)
- Select how many recent games to import (10-100)
- Watch the progress bar as games load
- View imported games with metadata

**APIs Working:**
- ✅ Lichess game import
- ✅ Chess.com game import
- ✅ Progress tracking
- ✅ Error handling
- ✅ Rate limiting

### 3. Explore Analysis Features 📊

Visit http://localhost:3003/analysis

- See the planned features
- Understand what analysis capabilities are coming
- Navigate to import games for future analysis

## Testing the Features

### Test Playing Against AI

1. Go to http://localhost:3003/play
2. Wait for "Initializing AI engine..." message to disappear (~1 second)
3. Make your first move (e.g., move e2 pawn to e4)
4. Watch the AI respond (should take 1-3 seconds depending on position)
5. Continue playing!

**Tips:**
- The AI is set to 1500 rating by default (intermediate level)
- The board shows legal moves when you click a piece
- Last move is highlighted in yellow
- Move history appears on the right side

### Test Game Import

1. Go to http://localhost:3003/import
2. Select "Lichess"
3. Enter username: `DrNykterstein` (Magnus Carlsen's account)
4. Set games to 20
5. Click "Import Games"
6. Watch the progress bar fill up
7. See the imported games list populate

**Note:** Rate limits apply - Lichess allows 15 requests/minute

### Verify Everything Works

```bash
# Make sure dev server is running
npm run dev

# In another terminal, build to check for errors
npm run build

# If build succeeds, everything is properly configured!
```

## How the AI Works

The AI uses Stockfish chess engine running in a Web Worker:

1. **Engine Initialization**: Loads stockfish.js (~2MB) on first use
2. **Move Calculation**: Evaluates positions to depth 5-20 depending on difficulty
3. **Skill Level**: Stockfish skill parameter (0-20) controls strength
4. **Response Time**: 200-2000ms based on difficulty setting

**Difficulty Mapping:**
- 800 rating: Depth 3, Skill 0, makes frequent errors
- 1200 rating: Depth 7, Skill 5, casual player
- 1500 rating: Depth 10, Skill 8, intermediate (default)
- 1800 rating: Depth 14, Skill 14, advanced
- 2200 rating: Depth 18, Skill 19, master level

## Troubleshooting

### "Engine not initialized" error
- Refresh the page
- Check browser console for errors
- Ensure stockfish.js is in /public directory

### Import not working
- Check internet connection
- Verify username exists on the platform
- Check browser console for CORS errors
- Try a different username

### Board not displaying
- Clear browser cache
- Check browser console for CSS loading errors
- Ensure chessground CSS files are loaded

### AI not responding
- Check browser console for Web Worker errors
- Verify stockfish.js loaded correctly
- Try resetting the game

## Next Steps

### For Development:

1. **Implement Analysis Features**
   - Create skill analyzer in `src/lib/analysis/`
   - Add blunder detection
   - Build visualization components

2. **Add Persistence**
   - Implement IndexedDB game cache
   - Store user preferences
   - Save analysis results

3. **Enhance UI**
   - Add Framer Motion animations
   - Improve loading states
   - Add tooltips and help

4. **Optimize Performance**
   - Code split heavy components
   - Lazy load chess engine
   - Optimize bundle size

### For Testing:

1. Try different difficulty levels by modifying the store
2. Import games from your own accounts
3. Test on mobile devices (responsive design)
4. Check move validation edge cases
5. Test long games (50+ moves)

## File Structure Quick Reference

```
Key files you'll work with:

app/
  play/page.tsx          - Play page UI
  import/page.tsx        - Import page UI
  analysis/page.tsx      - Analysis page UI

src/
  store/game-store.ts    - Game state management
  components/chess/      - Chess UI components
  lib/engine/            - Stockfish controller
  lib/api/               - API clients
  workers/               - Web Workers
```

## Performance Notes

Current bundle sizes:
- Initial load: ~500KB (uncompressed)
- Stockfish.js: ~2MB (loaded on demand)
- Chessground CSS: ~50KB

**Optimization opportunities:**
- Dynamic imports for heavy components
- Lazy load stockfish until needed
- Tree shake unused chess.js methods
- Optimize images and assets

## Have Fun!

You now have a fully functional chess application with:
- ✅ AI opponent
- ✅ Game import from major platforms
- ✅ Interactive board
- ✅ Move validation
- ✅ Modern, responsive UI

Start playing at http://localhost:3003/play!
