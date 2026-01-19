# Hangman Multiplayer Game 🎮

A professional multiplayer Hangman game built with React, Vite, and Supabase. Perfect for classrooms, team building, or fun with friends!

## Features ✨

- **Multiplayer Support**: Multiple players can join the same game using a unique code
- **Admin Panel**: Manage words, categories, and game sessions
- **Main Display Screen**: Show player names and leaderboard (perfect for projecting)
- **Player Screen**: Individual game interface with hangman drawing
- **English Vocabulary**: Pre-loaded with categorized words and hints
- **Real-time Updates**: All screens sync automatically
- **Scoring System**: Points awarded based on performance

## How to Use 🚀

### Setup (First Time)

1. **Open Admin Panel**
   - Click "Admin Panel" from the main menu
   - Click "Load Initial Words" to add 30+ pre-configured English words
   - Or manually add custom words with categories and hints

2. **Create a Game**
   - In Admin Panel, click "Create New Game"
   - A unique 6-character game code will be generated
   - Share this code with players

### Running a Game Session

**For the Host/Teacher:**

1. Open **Admin Panel** on your device
   - Create a new game to get the code
   - Click "Start Game" when players are ready

2. Open **Main Display Screen** on a projector/TV
   - Enter the game code
   - This shows the leaderboard with all player names and scores

**For Players:**

1. Click **"Join as Player"**
2. Enter your name and the game code
3. Wait for the admin to start the game
4. Guess letters by clicking the keyboard
5. Use hints if you need help!

## Game Screens 📺

### 🔑 Admin Panel
- Manage word database
- Create and control games
- Start/reset game sessions
- Add custom vocabulary

### 📺 Main Display Screen
- Real-time leaderboard
- Player names and scores
- Game status
- Perfect for projecting to a class or group

### 🎮 Player Screen
- Hangman drawing
- Interactive keyboard
- Category and hint display
- Word progress
- Personal score

## Game Rules 📋

- Players take turns guessing letters
- Correct guesses reveal the letter in the word
- Wrong guesses add to the hangman drawing (6 wrong guesses = game over)
- First player to complete the word wins
- Points awarded: 100 - (wrong guesses × 10), minimum 10 points

## Technical Details 🛠️

- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Supabase Edge Functions (Hono server)
- **Database**: Key-Value store for games, players, and words
- **Real-time**: Polling-based updates (1-2 seconds)

## Word Categories 📚

Pre-loaded categories include:
- Animals
- Food
- Countries
- Technology
- Sports
- Nature
- Professions

## Tips for Teachers 👨‍🏫

1. **Before class**: Load initial words or add custom vocabulary
2. **Create game**: Generate a code and write it on the board
3. **Project**: Show Main Display Screen on classroom TV
4. **Students join**: Using their phones/tablets with the game code
5. **Play**: Start the game and let students compete!
6. **Reset**: After each round, reset and start a new game

## Customization 🎨

You can easily customize:
- Add words in any language
- Create themed word sets (holidays, science terms, etc.)
- Adjust difficulty by choosing longer/shorter words
- Create category-specific games

## Browser Support 🌐

Works on all modern browsers:
- Chrome/Edge
- Firefox
- Safari
- Mobile browsers (iOS/Android)

---

**Have fun playing Hangman! 🎉**
