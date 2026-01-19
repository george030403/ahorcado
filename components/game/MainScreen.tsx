import { useState, useEffect } from 'react';
import { ArrowLeft, Users, Trophy } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface Player {
  id: string;
  name: string;
  score: number;
  joinedAt: number;
}

interface Game {
  code: string;
  status: 'waiting' | 'playing' | 'finished';
  currentWord?: string;
  guessedLetters: string[];
  wrongGuesses: number;
  maxWrongs: number;
  winner?: string;
}

interface MainScreenProps {
  onBack: () => void;
}

export function MainScreen({ onBack }: MainScreenProps) {
  const [gameCode, setGameCode] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [game, setGame] = useState<Game | null>(null);
  const [inputCode, setInputCode] = useState('');

  useEffect(() => {
    if (!isJoined || !gameCode) return;

    const interval = setInterval(() => {
      loadGameData();
    }, 2000);

    return () => clearInterval(interval);
  }, [isJoined, gameCode]);

  const loadGameData = async () => {
    try {
      const [playersResponse, gameResponse] = await Promise.all([
        fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-e9cd80f1/games/${gameCode}/players`,
          {
            headers: { Authorization: `Bearer ${publicAnonKey}` }
          }
        ),
        fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-e9cd80f1/games/${gameCode}`,
          {
            headers: { Authorization: `Bearer ${publicAnonKey}` }
          }
        )
      ]);

      const playersData = await playersResponse.json();
      const gameData = await gameResponse.json();

      if (playersData.players) {
        setPlayers(playersData.players.sort((a: Player, b: Player) => b.score - a.score));
      }
      if (gameData.game) {
        setGame(gameData.game);
      }
    } catch (error) {
      console.error('Error loading game data:', error);
    }
  };

  const joinGame = async () => {
    if (!inputCode.trim()) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e9cd80f1/games/${inputCode.toUpperCase()}`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` }
        }
      );

      if (response.ok) {
        setGameCode(inputCode.toUpperCase());
        setIsJoined(true);
        await loadGameData();
      } else {
        alert('Game not found. Please check the code.');
      }
    } catch (error) {
      console.error('Error joining game:', error);
      alert('Error joining game');
    }
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
            Main Display Screen
          </h1>
          
          <p className="text-white/70 text-center mb-6">
            Enter the game code to display the leaderboard
          </p>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter game code"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-center text-2xl tracking-wider placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 uppercase"
              maxLength={6}
            />
            
            <button
              onClick={joinGame}
              disabled={!inputCode.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              Connect to Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <button
        onClick={() => {
          setIsJoined(false);
          setGameCode('');
          setPlayers([]);
          setGame(null);
        }}
        className="mb-6 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Disconnect
      </button>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 mb-6 border border-white/20 text-center">
          <h1 className="text-5xl font-bold text-white mb-4">Hangman Game</h1>
          <div className="flex items-center justify-center gap-8 text-white/80">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-lg">Game Code: <span className="font-mono font-bold text-2xl text-white">{gameCode}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6" />
              <span className="text-lg font-semibold">{players.length} Players</span>
            </div>
          </div>
        </div>

        {/* Game Status */}
        {game && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20 text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className={`px-6 py-3 rounded-full font-bold text-lg ${
                game.status === 'waiting' ? 'bg-yellow-500/20 text-yellow-300' :
                game.status === 'playing' ? 'bg-green-500/20 text-green-300' :
                'bg-blue-500/20 text-blue-300'
              }`}>
                {game.status === 'waiting' ? '⏳ Waiting to Start' :
                 game.status === 'playing' ? '🎮 Game in Progress' :
                 '🏁 Game Finished'}
              </span>
            </div>

            {game.status === 'finished' && game.winner && (
              <div className="mt-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-6 border border-yellow-500/30">
                <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">Winner: {game.winner}!</p>
              </div>
            )}
          </div>
        )}

        {/* Leaderboard */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-400" />
            Leaderboard
          </h2>
          
          {players.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/40 text-xl">Waiting for players to join...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {players.map((player, index) => (
                <div
                  key={player.id}
                  className={`rounded-xl p-6 flex items-center gap-6 transition-all ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border-2 border-yellow-500/50 scale-105' :
                    index === 1 ? 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border border-gray-400/30' :
                    index === 2 ? 'bg-gradient-to-r from-orange-700/20 to-orange-800/20 border border-orange-700/30' :
                    'bg-white/5 border border-white/10'
                  }`}
                >
                  <div className={`text-4xl font-bold ${
                    index === 0 ? 'text-yellow-400' :
                    index === 1 ? 'text-gray-300' :
                    index === 2 ? 'text-orange-400' :
                    'text-white/40'
                  }`}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-white">{player.name}</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white">{player.score}</p>
                    <p className="text-sm text-white/60">points</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
