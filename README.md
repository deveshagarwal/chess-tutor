# Chess Mentor

A modern chess learning web application that helps players improve through AI-powered analysis and personalized training.

## Features

### ✅ Implemented (MVP)

#### 1. Play Against AI
- Interactive chessboard with drag-and-drop moves
- AI opponent powered by Stockfish engine
- Multiple difficulty levels (800-2500 rating)
- Real-time game state tracking
- Move history display
- Board flipping and game reset

#### 2. Import Games
- Import games from Lichess
- Import games from Chess.com
- Progress tracking during import
- Display imported game list with metadata
- Support for up to 100 games per import

#### 3. Analysis (Framework)
- Landing page with feature descriptions
- Navigation to import games
- Foundation for future analysis features

### Core Infrastructure

- **Chess Engine**: Stockfish.js running in Web Worker
  - Non-blocking UI during analysis
  - UCI protocol communication
  - Configurable depth and skill level

- **Game Logic**: Chess.js wrapper with utilities
  - Move validation and generation
  - PGN parsing and generation
  - FEN handling
  - Game phase detection

- **State Management**: Zustand stores
  - Game state (position, history, turn)
  - Engine state (AI thinking, difficulty)
  - Persistent game modes

- **API Integration**:
  - Lichess API client with rate limiting
  - Chess.com API client with rate limiting
  - CORS-compatible fetching

- **UI Components**:
  - ChessBoard (Chessground wrapper)
  - Import Form with platform selection
  - Progress indicators
  - Responsive design for mobile/desktop

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Chess Libraries**:
  - chess.js - Game logic
  - chessground - Interactive board
  - stockfish.js - Chess engine
- **State**: Zustand
- **Styling**: Tailwind CSS
- **Storage**: Client-side (localStorage, future IndexedDB)

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
chess-mentor/
├── app/                    # Next.js app router pages
│   ├── page.tsx           # Landing page
│   ├── play/page.tsx      # Play against AI
│   ├── import/page.tsx    # Import games
│   └── analysis/page.tsx  # Analysis page
├── src/
│   ├── components/        # React components
│   │   ├── chess/        # Chess-related components
│   │   └── import/       # Import form components
│   ├── lib/              # Core libraries
│   │   ├── chess/        # Chess logic and PGN parsing
│   │   ├── engine/       # Stockfish controller and difficulty
│   │   ├── api/          # API clients for Lichess/Chess.com
│   │   └── storage/      # Local storage utilities
│   ├── store/            # Zustand state stores
│   ├── types/            # TypeScript type definitions
│   └── workers/          # Web Workers (Stockfish)
├── public/               # Static assets
│   └── stockfish.js      # Stockfish engine
└── README.md            # This file
```

## Usage Guide

### Playing Against AI

1. Navigate to `/play`
2. Wait for the engine to initialize
3. Make moves by dragging and dropping pieces
4. The AI will respond automatically
5. Use "Flip Board" to change orientation
6. Use "Reset Game" to start over

### Importing Games

1. Navigate to `/import`
2. Select platform (Lichess or Chess.com)
3. Enter your username
4. Choose number of games (10-100)
5. Click "Import Games"
6. View imported games in the list

### Future: Analysis

The Analysis page framework is in place for future implementation of:
- Comprehensive game analysis with Stockfish
- Blunder detection and classification
- Move accuracy calculation
- Rating estimation
- Opening repertoire analysis
- Performance trends

## Development Status

### Completed ✅
- Chess game logic and move validation
- Stockfish Web Worker integration
- Engine controller with UCI protocol
- Difficulty calculation system
- Game state management (Zustand)
- Interactive chessboard component
- AI opponent with multiple difficulty levels
- Lichess API integration
- Chess.com API integration
- Import functionality with progress tracking
- Responsive UI design
- Rate limiting for API calls

### In Progress 🚧
- Game analysis implementation
- IndexedDB caching for games
- Real-time move feedback system

### Planned 📋
- Skill analyzer with rating estimation
- Blunder detection algorithm
- Opening repertoire analysis
- Performance visualization charts
- Move-by-move analysis view
- Tactical pattern recognition
- UI/UX polish and animations
- Performance optimization

## Performance Targets

- ✅ Build: Successful compilation
- ✅ First Contentful Paint: <2s (local)
- ✅ Chess engine initialization: <1s
- ⏳ Move feedback latency: <50ms (not yet implemented)
- ⏳ Stockfish depth 15 evaluation: <2s (varies by device)

## Known Issues

- Stockfish worker initialization needs error handling
- Some TypeScript type warnings in ChessBoard component
- Analysis features are placeholder UI only
- No persistence of imported games yet
- Engine worker needs better error recovery

## Contributing

This is a learning project. Key areas for contribution:
1. Implementing the analysis features
2. Adding IndexedDB persistence
3. Improving UI/UX with animations
4. Adding more comprehensive error handling
5. Writing tests for chess logic
6. Optimizing bundle size

## License

MIT License - See LICENSE file for details

## Acknowledgments

- [Stockfish](https://stockfishchess.org/) - Chess engine
- [Lichess](https://lichess.org/) - Open platform and API
- [Chess.com](https://chess.com/) - API access
- [chessground](https://github.com/lichess-org/chessground) - Interactive board
- [chess.js](https://github.com/jhlywa/chess.js) - Chess logic

## Contact

For questions or suggestions, please open an issue on GitHub.

---

**Status**: MVP Complete - Play feature fully functional, Import feature working, Analysis framework in place
**Last Updated**: February 2026
