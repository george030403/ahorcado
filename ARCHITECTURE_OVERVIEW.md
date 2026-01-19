# Hangman Game - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Admin Panel  │  │ Main Screen  │  │Player Screen │     │
│  │              │  │              │  │              │     │
│  │ - Manage     │  │ - Leaderboard│  │ - Game UI    │     │
│  │   words      │  │ - Player     │  │ - Keyboard   │     │
│  │ - Create     │  │   names      │  │ - Hangman    │     │
│  │   games      │  │ - Live       │  │ - Hints      │     │
│  │ - Control    │  │   scores     │  │              │     │
│  │   flow       │  │              │  │              │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                 │                 │              │
│         └─────────────────┼─────────────────┘              │
│                           │                                │
└───────────────────────────┼────────────────────────────────┘
                            │
                            │ HTTPS REST API
                            │
┌───────────────────────────┼────────────────────────────────┐
│                  BACKEND (Supabase)                        │
├───────────────────────────┼────────────────────────────────┤
│                           │                                │
│  ┌────────────────────────▼──────────────────────────┐    │
│  │        Hono Web Server (Deno Runtime)             │    │
│  │                                                    │    │
│  │  Routes:                                           │    │
│  │  • /words - Word management                        │    │
│  │  • /games/create - Create new game                 │    │
│  │  • /games/:code - Get game state                   │    │
│  │  • /games/:code/start - Start game                 │    │
│  │  • /games/:code/join - Player joins                │    │
│  │  • /games/:code/players - Get players              │    │
│  │  • /games/:code/guess - Submit guess               │    │
│  │  • /games/:code/reset - Reset game                 │    │
│  └────────────────────────┬──────────────────────────┘    │
│                           │                                │
│  ┌────────────────────────▼──────────────────────────┐    │
│  │       Key-Value Store (PostgreSQL)                 │    │
│  │                                                    │    │
│  │  Keys:                                             │    │
│  │  • word:{id} - Word data                           │    │
│  │  • game:{code} - Game state                        │    │
│  │  • player:{code}:{id} - Player data                │    │
│  └────────────────────────────────────────────────────┘    │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Game Creation Flow
```
Admin Panel → POST /games/create
           → Server generates unique code
           → Stores game:{code} in KV
           → Returns code to admin
```

### 2. Player Join Flow
```
Player Screen → POST /games/:code/join
             → Server validates game exists
             → Creates player:{code}:{id}
             → Returns player ID
```

### 3. Game Start Flow
```
Admin Panel → POST /games/:code/start
           → Server selects random word
           → Updates game state to 'playing'
           → Returns updated game state
```

### 4. Guess Flow
```
Player Screen → POST /games/:code/guess
             → Server validates letter
             → Updates guessed letters
             → Checks win/lose conditions
             → Updates player score if won
             → Returns updated game state
```

### 5. Real-time Updates
```
All Screens → Poll GET /games/:code (every 1-2s)
           → Get latest game state
           → Poll GET /games/:code/players
           → Get latest player list
           → Update UI
```

## Component Structure

```
/App.tsx                    - Main app entry point
/components/
  /admin/
    AdminPanel.tsx          - Admin interface
  /game/
    MainScreen.tsx          - Leaderboard display
    PlayerScreen.tsx        - Player game interface
    HangmanDrawing.tsx      - SVG hangman visual
    JoinGame.tsx            - Join game form (unused)
/utils/
  initialWords.ts           - Pre-loaded vocabulary
  /supabase/
    info.tsx                - Supabase config
/supabase/
  /functions/
    /server/
      index.tsx             - Main server file
      kv_store.tsx          - KV utilities (protected)
```

## Data Models

### Word
```typescript
{
  id: string
  word: string          // UPPERCASE
  category: string
  hint?: string
}
```

### Game
```typescript
{
  code: string          // 6-char unique code
  status: 'waiting' | 'playing' | 'finished'
  currentWord?: string
  currentCategory?: string
  currentHint?: string
  guessedLetters: string[]
  wrongGuesses: number
  maxWrongs: 6
  winner?: string
  createdAt: number
  startedAt?: number
}
```

### Player
```typescript
{
  id: string
  name: string
  score: number
  joinedAt: number
}
```

## Key Design Decisions

### Why Polling Instead of WebSockets?
- Simpler implementation
- No connection management needed
- Works reliably across all devices/networks
- Adequate for game pace (1-2 second updates)

### Why Key-Value Store?
- Simple data structure
- Fast reads/writes
- No complex queries needed
- Easy to reason about
- Pre-configured in environment

### Why Separate Screens?
- Flexibility in device usage
- Can project leaderboard separately
- Admin has full control
- Players get focused interface

### Why 6-Character Codes?
- Easy to read and share
- Low collision probability
- Can be written on board
- Memorable for short session

## Scaling Considerations

**Current Limitations:**
- Single game instance per code
- Polling creates repeated requests
- KV store has no indexing

**If Needed to Scale:**
- Add WebSocket for real-time updates
- Implement proper database with indexes
- Add game rooms/sessions
- Implement player authentication
- Add rate limiting

**Current Capacity (estimated):**
- ~100 concurrent players per game
- ~50 active games simultaneously
- ~1000 words in database

## Security Notes

- No sensitive data stored
- Public read access to game state
- No user authentication required
- CORS enabled for all origins
- Service role key stays on server

## Performance

**Typical Response Times:**
- GET requests: <100ms
- POST requests: <200ms
- Initial load: <500ms

**Network Usage:**
- Main Screen: ~1KB every 2s
- Player Screen: ~500B every 1s
- Total per game: ~5KB/s

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- No IE support
- Requires JavaScript enabled

---

Built with ❤️ using React, Vite, Tailwind CSS, and Supabase
