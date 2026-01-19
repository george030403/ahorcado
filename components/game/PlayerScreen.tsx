import { useState, useEffect } from 'react';
import { ArrowLeft, Lightbulb } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { HangmanDrawing } from './HangmanDrawing';

interface Game {
  code: string;
  status: 'waiting' | 'playing' | 'finished';
  currentWord?: string;
  currentHint?: string;
  currentCategory?: string;
  guessedLetters: string[];
  wrongGuesses: number;
  maxWrongs: number;
  winner?: string;
}

interface PlayerScreenProps {
  onBack: () => void;
}

export function PlayerScreen({ onBack }: PlayerScreenProps) {
  const [gameCode, setGameCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [game, setGame] = useState<Game | null>(null);
  const [inputCode, setInputCode] = useState('');
  const [inputName, setInputName] = useState('');
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (!isJoined || !gameCode) return;

    const interval = setInterval(() => {
      loadGameData();
    }, 1000);

    return () => clearInterval(interval);
  }, [isJoined, gameCode]);

  const loadGameData = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e9cd80f1/games/${gameCode}`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` }
        }
      );

      const data = await response.json();
      if (data.game) {
        setGame(data.game);
      }
    } catch (error) {
      console.error('Error loading game data:', error);
    }
  };

  const joinGame = async () => {
    if (!inputCode.trim() || !inputName.trim()) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e9cd80f1/games/${inputCode.toUpperCase()}/join`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ name: inputName.trim() })
        }
      );

      const data = await response.json();
      if (data.playerId) {
        setGameCode(inputCode.toUpperCase());
        setPlayerName(inputName.trim());
        setPlayerId(data.playerId);
        setIsJoined(true);
        await loadGameData();
      } else {
        alert(data.error || 'Could not join game');
      }
    } catch (error) {
      console.error('Error joining game:', error);
      alert('Error joining game');
    }
  };

  const guessLetter = async (letter: string) => {
    if (!game || game.status !== 'playing' || game.guessedLetters.includes(letter)) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e9cd80f1/games/${gameCode}/guess`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ letter, playerId })
        }
      );

      const data = await response.json();
      if (data.game) {
        setGame(data.game);
      }
    } catch (error) {
      console.error('Error guessing letter:', error);
    }
  };

  const getDisplayWord = () => {
    if (!game?.currentWord) return '';
    return game.currentWord
      .split('')
      .map(letter => (game.guessedLetters.includes(letter) ? letter : '_'))
      .join(' ');
  };

  const isGameWon = () => {
    if (!game?.currentWord) return false;
    return game.currentWord.split('').every(letter => game.guessedLetters.includes(letter));
  };

  const isGameLost = () => {
    return game && game.wrongGuesses >= game.maxWrongs;
  };

  if (!isJoined) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <button
          onClick={onBack}
          className="absolute top-6 left-6 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/20">
          <h1 className="text-3xl font-bold text-white text-center mb-6">
            Join Game
          </h1>

          <div className="space-y-4">
            <div>
              <label className="block text-white/70 text-sm mb-2">Your Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                maxLength={20}
              />
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-2">Game Code</label>
              <input
                type="text"
                placeholder="Enter game code"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-center text-2xl tracking-wider placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 uppercase"
                maxLength={6}
              />
            </div>

            <button
              onClick={joinGame}
              disabled={!inputCode.trim() || !inputName.trim()}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              Join Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <button
        onClick={() => {
          setIsJoined(false);
          setGameCode('');
          setPlayerName('');
          setPlayerId('');
          setGame(null);
        }}
        className="mb-4 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Leave Game
      </button>

      <div className="max-w-4xl mx-auto">
        {/* Player Info */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 mb-4 border border-white/20 text-center">
          <p className="text-white/70 text-sm">Playing as</p>
          <p className="text-2xl font-bold text-white">{playerName}</p>
          <p className="text-white/50 text-sm mt-1">Game: {gameCode}</p>
        </div>

        {/* Game Status */}
        {game?.status === 'waiting' && (
          <div className="bg-yellow-500/20 backdrop-blur-lg rounded-2xl p-8 mb-6 border border-yellow-500/30 text-center">
            <p className="text-2xl font-bold text-yellow-300 mb-2">⏳ Waiting for game to start...</p>
            <p className="text-white/70">The admin will start the game soon</p>
          </div>
        )}

        {game?.status === 'playing' && (
          <>
            {/* Hangman Drawing */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-6 border border-white/20">
              <HangmanDrawing wrongGuesses={game.wrongGuesses} maxWrongs={game.maxWrongs} />
              <div className="text-center mt-4">
                <p className="text-white/60 text-sm">Wrong Guesses</p>
                <p className="text-2xl font-bold text-white">{game.wrongGuesses} / {game.maxWrongs}</p>
              </div>
            </div>

            {/* Category and Hint */}
            {game.currentCategory && (
              <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 mb-4 border border-white/10 text-center">
                <p className="text-white/60 text-sm mb-1">Category</p>
                <p className="text-xl font-semibold text-white">{game.currentCategory}</p>
              </div>
            )}

            {game.currentHint && (
              <div className="mb-4">
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="w-full bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10 text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                >
                  <Lightbulb className={`w-5 h-5 ${showHint ? 'text-yellow-400' : 'text-white/60'}`} />
                  <span>{showHint ? 'Hide Hint' : 'Show Hint'}</span>
                </button>
                {showHint && (
                  <div className="mt-2 bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20">
                    <p className="text-yellow-300 text-center italic">"{game.currentHint}"</p>
                  </div>
                )}
              </div>
            )}

            {/* Word Display */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-6 border border-white/20">
              <p className="text-4xl md:text-5xl font-bold text-white text-center tracking-[0.3em] font-mono">
                {getDisplayWord()}
              </p>
            </div>

            {/* Keyboard */}
            {!isGameWon() && !isGameLost() && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="grid grid-cols-7 gap-2">
                  {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((letter) => {
                    const isGuessed = game.guessedLetters.includes(letter);
                    const isCorrect = isGuessed && game.currentWord?.includes(letter);
                    const isWrong = isGuessed && !game.currentWord?.includes(letter);

                    return (
                      <button
                        key={letter}
                        onClick={() => guessLetter(letter)}
                        disabled={isGuessed}
                        className={`aspect-square rounded-xl font-bold text-lg transition-all ${
                          isCorrect ? 'bg-green-500 text-white' :
                          isWrong ? 'bg-red-500 text-white' :
                          'bg-white/20 text-white hover:bg-white/30 active:scale-95'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {letter}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Game Result */}
            {isGameWon() && (
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-lg rounded-2xl p-8 border border-green-500/30 text-center">
                <p className="text-4xl mb-2">🎉</p>
                <p className="text-2xl font-bold text-green-300 mb-2">You Won!</p>
                <p className="text-white/70">The word was: <span className="font-bold text-white">{game.currentWord}</span></p>
              </div>
            )}

            {isGameLost() && (
              <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 backdrop-blur-lg rounded-2xl p-8 border border-red-500/30 text-center">
                <p className="text-4xl mb-2">😢</p>
                <p className="text-2xl font-bold text-red-300 mb-2">Game Over</p>
                <p className="text-white/70">The word was: <span className="font-bold text-white">{game.currentWord}</span></p>
              </div>
            )}
          </>
        )}

        {game?.status === 'finished' && (
          <div className="bg-blue-500/20 backdrop-blur-lg rounded-2xl p-8 border border-blue-500/30 text-center">
            <p className="text-2xl font-bold text-blue-300 mb-2">🏁 Game Finished</p>
            {game.winner && (
              <p className="text-white/70">Winner: <span className="font-bold text-white">{game.winner}</span></p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
