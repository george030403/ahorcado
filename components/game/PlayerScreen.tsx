import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Trophy, Skull } from 'lucide-react';
import { HangmanDrawing } from './HangmanDrawing';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface Game {
  code: string;
  status: 'waiting' | 'playing' | 'finished';
  currentWord?: string;
  currentHint?: string;
  maxWrongs: number;
  winner?: string;
  winnerId?: string;
}

interface PlayerState {
  guessedLetters: string[];
  wrongGuesses: number;
  isEliminated: boolean;
  finishedAt: number | null;
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
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastGuess, setLastGuess] = useState<{letter: string, correct: boolean} | null>(null);

  useEffect(() => {
    if (!isJoined || !gameCode) return;
    loadGameState();
    const interval = setInterval(loadGameState, 1000);
    return () => clearInterval(interval);
  }, [isJoined, gameCode, playerId]);

  const loadGameState = async () => {
    try {
      const [gameRes, playerRes] = await Promise.all([
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e9cd80f1/games/${gameCode}`,
          { headers: { Authorization: `Bearer ${publicAnonKey}` }, cache: 'no-store' }),
        playerId ? fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e9cd80f1/games/${gameCode}/player/${playerId}`,
          { headers: { Authorization: `Bearer ${publicAnonKey}` }, cache: 'no-store' }) : null
      ]);

      const gameData = await gameRes.json();
      if (gameData.game) setGame(gameData.game);

      if (playerRes) {
        const playerData = await playerRes.json();
        if (playerData.player) {
          setPlayerState({
            guessedLetters: playerData.player.guessedLetters || [],
            wrongGuesses: playerData.player.wrongGuesses || 0,
            isEliminated: playerData.player.isEliminated || false,
            finishedAt: playerData.player.finishedAt
          });
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const joinGame = async () => {
    if (!gameCode.trim() || !playerName.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e9cd80f1/games/${gameCode.toUpperCase()}/join`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
          body: JSON.stringify({ playerName: playerName.trim() })
        }
      );
      const data = await response.json();
      if (response.ok && data.player) {
        setPlayerId(data.player.id);
        setGameCode(gameCode.toUpperCase());
        setIsJoined(true);
        await loadGameState();
      } else {
        alert(data.error || 'Error joining game');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error joining game');
    }
    setLoading(false);
  };

  const guessLetter = async (letter: string) => {
    if (!game || !playerId || playerState?.isEliminated) return;
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e9cd80f1/games/${gameCode}/guess`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
          body: JSON.stringify({ letter: letter.toUpperCase(), playerId })
        }
      );
      const data = await response.json();
      
      setLastGuess({ letter, correct: data.correct });
      setTimeout(() => setLastGuess(null), 500);
      
      await loadGameState();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const guessedLetters = playerState?.guessedLetters || [];
  const wrongGuesses = playerState?.wrongGuesses || 0;
  const maxWrongs = game?.maxWrongs || 6;
  const isEliminated = playerState?.isEliminated || wrongGuesses >= maxWrongs;
  
  const hasWon = game?.currentWord && game.status === 'playing' &&
    game.currentWord.split('').every(l => guessedLetters.includes(l));

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  if (!isJoined) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <button onClick={onBack} className="absolute top-6 left-6 flex items-center gap-2 text-white/70 hover:text-white transition-all group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back
        </button>

        <div className="glass-card rounded-3xl p-8 max-w-md w-full animate-fade-in-scale">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4 animate-float"></div>
            <h1 className="text-3xl font-bold text-gradient mb-2">Join Game</h1>
            <p className="text-white/60">Enter the game code to play</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-white/70 text-sm mb-2 block">Game Code</label>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                className="w-full input-glass rounded-xl px-4 py-3 text-white text-center text-2xl tracking-[0.5em] uppercase"
                maxLength={6}
              />
            </div>
            
            <div>
              <label className="text-white/70 text-sm mb-2 block">Your Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full input-glass rounded-xl px-4 py-3 text-white text-center text-lg"
                maxLength={20}
              />
            </div>
            
            <button
              onClick={joinGame}
              disabled={loading || !gameCode.trim() || !playerName.trim()}
              className="w-full btn-premium btn-emerald text-white py-4 px-6 rounded-xl font-bold text-lg mt-4 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Join Game'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 relative z-10">
      <button onClick={() => { setIsJoined(false); setPlayerId(''); setGame(null); setPlayerState(null); }}
        className="mb-4 flex items-center gap-2 text-white/70 hover:text-white transition-all group">
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Leave Game
      </button>

      <div className="max-w-lg mx-auto space-y-4">
        {/* Header Card */}
        <div className="glass-card rounded-2xl p-4 text-center animate-fade-in-up">
          <p className="text-white/60 text-sm">Playing as</p>
          <p className="text-xl font-bold text-white">{playerName}</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-white/70 font-mono">{gameCode}</span>
          </div>
        </div>

        {/* Game Status */}
        {game?.status === 'waiting' && (
          <div className="glass-card rounded-2xl p-8 text-center animate-fade-in-up">
            <div className="text-5xl mb-4 animate-bounce"></div>
            <p className="text-xl text-yellow-300 font-semibold">Waiting for game to start...</p>
            <p className="text-white/50 text-sm mt-2">The admin will start the game soon</p>
          </div>
        )}

        {/* Winner State */}
        {hasWon && (
          <div className="glass-card rounded-2xl p-8 text-center winner-glow border-2 border-green-400/50 animate-bounce-in">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-float" />
            <p className="text-3xl font-bold text-green-400 mb-2">YOU WIN! </p>
            <p className="text-4xl font-bold text-white tracking-widest">{game?.currentWord}</p>
          </div>
        )}

        {/* Eliminated State */}
        {isEliminated && !hasWon && game?.status === 'playing' && (
          <div className="glass-card rounded-2xl p-8 text-center border-2 border-red-500/50 animate-shake">
            <Skull className="w-16 h-16 text-red-400 mx-auto mb-4 skull-shake" />
            <p className="text-3xl font-bold text-red-400 mb-2">ELIMINATED! </p>
            <p className="text-white/60">The word was:</p>
            <p className="text-2xl font-bold text-white tracking-widest mt-2">{game?.currentWord}</p>
          </div>
        )}

        {/* Game Finished */}
        {game?.status === 'finished' && (
          <div className="glass-card rounded-2xl p-8 text-center animate-fade-in-up">
            <p className="text-2xl font-bold text-blue-400 mb-4"> Game Finished!</p>
            {game.winner && <p className="text-white">Winner: <span className="font-bold text-yellow-400">{game.winner}</span></p>}
            <p className="text-white/60 mt-2">Word: <span className="font-bold text-white">{game.currentWord}</span></p>
          </div>
        )}

        {/* Active Game */}
        {game?.status === 'playing' && !isEliminated && !hasWon && (
          <>
            {/* Hangman Drawing */}
            <div className="glass-card rounded-2xl p-6 animate-fade-in-up">
              <HangmanDrawing wrongGuesses={wrongGuesses} maxWrongs={maxWrongs} />
              <div className="flex justify-between items-center mt-4 px-2">
                <div className="text-sm text-white/60">
                  Attempts: <span className={`font-bold ${wrongGuesses >= maxWrongs - 2 ? 'text-red-400' : 'text-white'}`}>
                    {maxWrongs - wrongGuesses}
                  </span> left
                </div>
                {game.currentHint && (
                  <div className="text-sm text-purple-300">
                     {game.currentHint}
                  </div>
                )}
              </div>
              
              {/* Progress Bar */}
              <div className="mt-3 progress-bar h-2 rounded-full">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    wrongGuesses >= maxWrongs - 1 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                    wrongGuesses >= maxWrongs - 3 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                    'bg-gradient-to-r from-green-500 to-emerald-500'
                  }`}
                  style={{ width: `${((maxWrongs - wrongGuesses) / maxWrongs) * 100}%` }}
                />
              </div>
            </div>

            {/* Word Display */}
            <div className="glass-card rounded-2xl p-6 animate-fade-in-up stagger-1">
              <div className="flex flex-wrap justify-center gap-2">
                {game.currentWord?.split('').map((letter, i) => (
                  <div key={i} className={`word-letter ${guessedLetters.includes(letter) ? 'revealed' : ''}`}>
                    {guessedLetters.includes(letter) ? letter : ''}
                  </div>
                ))}
              </div>
            </div>

            {/* Keyboard */}
            <div className="glass-card rounded-2xl p-4 animate-fade-in-up stagger-2">
              <div className="grid grid-cols-7 gap-2">
                {alphabet.map((letter) => {
                  const isGuessed = guessedLetters.includes(letter);
                  const isCorrect = isGuessed && game.currentWord?.includes(letter);
                  const isWrong = isGuessed && !game.currentWord?.includes(letter);
                  const isLastGuess = lastGuess?.letter === letter;

                  return (
                    <button
                      key={letter}
                      onClick={() => guessLetter(letter)}
                      disabled={isGuessed}
                      className={`letter-tile aspect-square rounded-lg font-bold text-lg transition-all
                        ${isLastGuess && lastGuess?.correct ? 'correct' : ''}
                        ${isLastGuess && !lastGuess?.correct ? 'wrong' : ''}
                        ${isCorrect ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-glow-emerald' :
                          isWrong ? 'bg-gradient-to-br from-red-500/50 to-red-700/50 text-white/50' :
                          'bg-white/10 hover:bg-white/20 text-white border border-white/10 hover:border-white/30'}
                        disabled:cursor-not-allowed`}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
