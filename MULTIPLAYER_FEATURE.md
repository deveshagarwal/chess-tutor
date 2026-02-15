# Multiplayer Chess Feature

## Overview

The "Play Against Friend" feature allows users to play chess in real-time with friends over the internet. Games are synchronized using Firebase Realtime Database, providing instant move updates without requiring a custom backend.

## Features

- **Real-time synchronization**: Moves appear instantly on opponent's board
- **Connection status**: Visual indicators show when opponent is connected
- **Shareable links**: Create a game and share a link with anyone
- **No authentication required**: Simple, frictionless gameplay
- **Automatic reconnection**: Players can refresh without losing game state
- **Board orientation**: Each player sees the board from their perspective

## Architecture

### Tech Stack
- **Frontend**: Next.js 14, React, TypeScript
- **State Management**: Zustand
- **Real-time Sync**: Firebase Realtime Database
- **Chess Logic**: chess.js
- **Board UI**: Chessground

### Data Flow

```
Player A                    Firebase                    Player B
   |                           |                           |
   |-- Create game ----------->|                           |
   |<-- Game ID + URL ---------|                           |
   |                           |<-- Join via link ---------|
   |<-- Opponent connected ----|-->-- Both connected ----->|
   |                           |                           |
   |-- Make move ------------->|                           |
   |                           |-- Push update ----------->|
   |                           |<-- Board updated ---------|
```

### Firebase Structure

```
games/
  {gameId}/
    fen: string                    # Current board position
    history: ChessMove[]           # All moves played
    playerWhite: {
      id: string
      connected: boolean
      color: "white"
    }
    playerBlack: {
      id: string
      connected: boolean
      color: "black"
    }
    currentTurn: "white" | "black"
    result: string                 # "*" | "1-0" | "0-1" | "1/2-1/2"
    createdAt: number
    lastMoveAt: number
```

## File Structure

### New Files Created

```
src/lib/firebase/
├── config.ts              # Firebase initialization
└── game-service.ts        # Real-time game sync service

src/components/multiplayer/
└── ConnectionStatus.tsx   # Connection indicator component

app/play/friend/
├── page.tsx              # Create game page
└── [gameId]/
    └── page.tsx          # Join game page

.env.local.example        # Environment variable template
FIREBASE_SETUP.md         # Setup instructions
```

### Modified Files

```
src/store/game-store.ts   # Added multiplayer state & actions
app/page.tsx              # Added "Play vs Friend" card
package.json              # Added firebase dependency
.eslintrc.json            # Disabled unescaped-entities rule
```

## Usage

### 1. Setup Firebase (First Time)

Follow the instructions in `FIREBASE_SETUP.md`:
1. Create Firebase project
2. Enable Realtime Database
3. Configure database rules
4. Copy configuration to `.env.local`

### 2. Start Development Server

```bash
npm run dev
```

### 3. Create a Game

1. Navigate to http://localhost:3000
2. Click "Play vs Friend"
3. Choose your color (White or Black)
4. Click "Create Game"
5. Copy the generated link

### 4. Join a Game

1. Open the copied link in another browser/device
2. The second player automatically joins as the opposite color
3. Start playing!

## API Reference

### GameService Methods

#### `createGame(playerColor: 'white' | 'black')`
Creates a new multiplayer game.

**Returns**: `Promise<{ gameId: string, url: string }>`

**Example**:
```typescript
const { gameId, url } = await gameService.createGame('white');
console.log('Share this link:', url);
```

#### `joinGame(gameId: string)`
Joins an existing game.

**Returns**: `Promise<MultiplayerGameState>`

**Throws**: Error if game doesn't exist or is full

**Example**:
```typescript
try {
  const gameState = await gameService.joinGame('abc123');
  console.log('Joined as:', gameState.playerWhite ? 'black' : 'white');
} catch (error) {
  console.error('Failed to join:', error);
}
```

#### `listenForMoves(gameId: string, callback: MoveCallback)`
Listens for real-time game updates.

**Returns**: `UnsubscribeFn` (call to unsubscribe)

**Example**:
```typescript
const unsubscribe = gameService.listenForMoves(gameId, (gameState) => {
  console.log('Game updated:', gameState.fen);
  updateChessboard(gameState.fen);
});

// Later, when leaving the game:
unsubscribe();
```

#### `makeMove(gameId: string, move: ChessMove, newFen: string)`
Syncs a move to Firebase.

**Returns**: `Promise<void>`

**Example**:
```typescript
await gameService.makeMove(gameId, {
  from: 'e2',
  to: 'e4',
  san: 'e4',
  // ... other move properties
}, newFen);
```

### Store Actions

#### `initMultiplayerGame(playerColor: Color)`
Initializes a new multiplayer game.

**Returns**: `Promise<string>` (shareable URL)

**Example**:
```typescript
const url = await useGameStore.getState().initMultiplayerGame('white');
```

#### `joinMultiplayerGame(gameId: string)`
Joins an existing multiplayer game.

**Returns**: `Promise<void>`

**Example**:
```typescript
await useGameStore.getState().joinMultiplayerGame('abc123');
```

#### `disconnectMultiplayer()`
Disconnects from the current multiplayer game.

**Example**:
```typescript
useGameStore.getState().disconnectMultiplayer();
```

## State Management

### Multiplayer State Fields

```typescript
interface GameState {
  // Existing fields...

  // Multiplayer fields
  multiplayerMode: boolean           // Is this a multiplayer game?
  gameId: string | null              // Firebase game ID
  opponentConnected: boolean         // Is opponent online?
  localPlayerId: string              // This player's unique ID
  unsubscribeMultiplayer: UnsubscribeFn | null  // Cleanup function
}
```

## Component Props

### ConnectionStatus

```typescript
interface ConnectionStatusProps {
  connected: boolean;              // Opponent connection state
  playerColor?: 'white' | 'black'; // Optional player color
  opponentColor?: 'white' | 'black'; // Optional opponent color
}
```

**Usage**:
```tsx
<ConnectionStatus
  connected={opponentConnected}
  playerColor="white"
  opponentColor="black"
/>
```

## Testing Checklist

### Basic Functionality
- [ ] Create game as white
- [ ] Create game as black
- [ ] Join game via link
- [ ] Copy link button works
- [ ] Make moves as white
- [ ] Make moves as black
- [ ] Moves sync in real-time
- [ ] Connection status updates

### Edge Cases
- [ ] Invalid game ID shows error
- [ ] Full game (2 players) rejects 3rd player
- [ ] Player disconnect updates status
- [ ] Player reconnect (refresh) maintains game
- [ ] Checkmate ends game
- [ ] Stalemate ends game
- [ ] En passant works
- [ ] Castling works
- [ ] Pawn promotion works

### UI/UX
- [ ] Board orientation correct for each player
- [ ] Last move highlighted
- [ ] Legal moves shown when dragging
- [ ] Disabled during opponent's turn
- [ ] Loading states show properly
- [ ] Error messages are clear

## Troubleshooting

### Moves not syncing
- Check Firebase console > Realtime Database > Data
- Verify both players see "Connected" status
- Check browser console for errors
- Ensure Firebase rules allow read/write

### "Permission denied" error
- Verify Firebase rules in console
- Check that rules are published
- Confirm database URL is correct in `.env.local`

### Connection issues
- Ensure Firebase config is correct
- Check network connectivity
- Verify Firebase project is active
- Review browser console for errors

### Development server issues
- Restart dev server after adding `.env.local`
- Clear browser cache
- Check for TypeScript errors: `npm run build`

## Performance Considerations

### Firebase Limits (Free Tier)
- **Simultaneous connections**: 100 (adequate for ~50 concurrent games)
- **Storage**: 1 GB (thousands of live games)
- **Bandwidth**: 10 GB/month download

### Optimization Tips
- Games are ephemeral (no long-term storage)
- Moves are small (~1 KB each)
- Use connection pooling (built-in)
- Clean up listeners on unmount

## Security Considerations

### Current Setup (MVP)
- ✓ Public read/write (acceptable for live games)
- ✓ Random game IDs (hard to guess)
- ✗ No authentication
- ✗ No rate limiting

### Production Recommendations
1. **Add Firebase Authentication**
   ```typescript
   import { getAuth, signInAnonymously } from 'firebase/auth';
   ```

2. **Restrict Database Rules**
   ```json
   {
     "rules": {
       "games": {
         "$gameId": {
           ".read": "auth != null",
           ".write": "auth != null && (
             !data.exists() ||
             data.child('playerWhite/id').val() === auth.uid ||
             data.child('playerBlack/id').val() === auth.uid
           )"
         }
       }
     }
   }
   ```

3. **Add Rate Limiting**
   - Implement move throttling
   - Limit game creation per user
   - Use Firebase App Check

4. **Add Game Expiration**
   - Auto-delete games after 24 hours
   - Clean up abandoned games

## Future Enhancements

### Short-term
- [ ] Time controls (blitz, rapid, classical)
- [ ] Move sound effects
- [ ] Chat between players
- [ ] Draw offers
- [ ] Resign button
- [ ] Rematch functionality

### Medium-term
- [ ] Game history/replay
- [ ] Player profiles
- [ ] Rating system (Elo)
- [ ] Matchmaking lobby
- [ ] Spectator mode

### Long-term
- [ ] Tournaments
- [ ] Puzzle mode with friends
- [ ] Analysis board sharing
- [ ] Mobile app (React Native)

## Contributing

When adding features to multiplayer:

1. Update `game-service.ts` for Firebase operations
2. Add state to `game-store.ts` if needed
3. Create UI components in `components/multiplayer/`
4. Update this documentation
5. Add tests for new functionality

## License

Same as parent project.
