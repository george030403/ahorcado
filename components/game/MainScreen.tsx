import { useState, useEffect } from 'react';
import { ArrowLeft, Users, Trophy, Skull, Crown } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface Player {
  id: string;
  name: string;
  score: number;
  wrongGuesses: number;
  isEliminated: boolean;
  guessedLetters: string[];
  finishedAt: number | null;
  joinedAt: number;
}

interface Game {
  code: string;
  status: 'waiting' | 'playing' | 'finished';
  currentWord?: string;
  maxWrongs: number;
  winner?: string;
  winnerId?: string;
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
    loadGameData();
    const interval = setInterval(() => loadGameData(), 1000);
    return () => clearInterval(interval);
  }, [isJoined, gameCode]);

  const loadGameData = async () => {
    try {
      const [playersResponse, gameResponse] = await Promise.all([
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e9cd80f1/games/${gameCode}/players`,
          { headers: { Authorization: `Bearer ${publicAnonKey}` }, cache: 'no-store' }),
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e9cd80f1/games/${gameCode}`,
          { headers: { Authorization: `Bearer ${publicAnonKey}` }, cache: 'no-store' })
      ]);

      const playersData = await playersResponse.json();
      const gameData = await gameResponse.json();

      if (playersData.players) setPlayers(playersData.players);
      if (gameData.game) setGame(gameData.game);
    } catch (error) {
      console.error('Error loading game data:', error);
    }
  };

  const joinGame = async () => {
    if (!inputCode.trim()) return;
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e9cd80f1/games/${inputCode.toUpperCase()}`,
        { headers: { Authorization: `Bearer ${publicAnonKey}` } }
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

  // Get podium players (sorted by who finished first with least wrong guesses)
  const getPodiumPlayers = () => {
    const winners = players
      .filter(p => {
        if (!game?.currentWord || !p.guessedLetters) return false;
        return game.currentWord.split('').every(l => p.guessedLetters.includes(l));
      })
      .sort((a, b) => {
        // Sort by finish time, then by wrong guesses
        if (a.finishedAt && b.finishedAt) {
          if (a.finishedAt !== b.finishedAt) return a.finishedAt - b.finishedAt;
        }
        return (a.wrongGuesses || 0) - (b.wrongGuesses || 0);
      });
    return winners.slice(0, 3);
  };

  if (!isJoined) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <button onClick={onBack} className="absolute top-6 left-6 flex items-center gap-2 text-white/80 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" /> Back
        </button>

        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/20">
          <h1 className="text-3xl font-bold text-white text-center mb-6">Main Display Screen</h1>
          <p className="text-white/70 text-center mb-6">Enter the game code to display the leaderboard</p>

          <div className="space-y-4">
            <input type="text" placeholder="Enter game code" value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-center text-2xl tracking-wider placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 uppercase"
              maxLength={6} />
            
            <button onClick={joinGame} disabled={!inputCode.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50">
              Connect to Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  const maxWrongs = game?.maxWrongs || 6;
  const podiumPlayers = getPodiumPlayers();

  return (
    <div className="min-h-screen p-6">
      <button onClick={() => { setIsJoined(false); setGameCode(''); setPlayers([]); setGame(null); }}
        className="mb-6 flex items-center gap-2 text-white/80 hover:text-white transition-colors">
        <ArrowLeft className="w-5 h-5" /> Disconnect
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
            <span className={`px-6 py-3 rounded-full font-bold text-lg ${
              game.status === 'waiting' ? 'bg-yellow-500/20 text-yellow-300' :
              game.status === 'playing' ? 'bg-green-500/20 text-green-300' :
              'bg-blue-500/20 text-blue-300'
            }`}>
              {game.status === 'waiting' ? ' Waiting to Start' :
               game.status === 'playing' ? ' Game in Progress' :
               ' Game Finished'}
            </span>
          </div>
        )}

        {/* Podium - Show when game is finished and there are winners */}
        {game?.status === 'finished' && podiumPlayers.length > 0 && (
          <div className="bg-gradient-to-br from-yellow-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-3xl p-8 mb-6 border border-yellow-500/30">
            <h2 className="text-3xl font-bold text-white text-center mb-8 flex items-center justify-center gap-3">
              <Trophy className="w-10 h-10 text-yellow-400" />
              WINNERS PODIUM
              <Trophy className="w-10 h-10 text-yellow-400" />
            </h2>
            
            <div className="flex items-end justify-center gap-4">
              {/* 2nd Place */}
              {podiumPlayers[1] && (
                <div className="flex flex-col items-center">
                  <div className="bg-gradient-to-b from-gray-300/30 to-gray-400/20 rounded-2xl p-6 border-2 border-gray-300/50 w-40 mb-2">
                    <p className="text-4xl text-center mb-2"></p>
                    <p className="text-xl font-bold text-white text-center truncate">{podiumPlayers[1].name}</p>
                    <p className="text-gray-300 text-center text-sm">{podiumPlayers[1].score} pts</p>
                  </div>
                  <div className="bg-gray-400/30 w-40 h-24 rounded-t-lg flex items-center justify-center">
                    <span className="text-4xl font-bold text-gray-300">2</span>
                  </div>
                </div>
              )}
              
              {/* 1st Place */}
              {podiumPlayers[0] && (
                <div className="flex flex-col items-center -mt-8">
                  <Crown className="w-12 h-12 text-yellow-400 mb-2 animate-bounce" />
                  <div className="bg-gradient-to-b from-yellow-400/30 to-yellow-600/20 rounded-2xl p-8 border-2 border-yellow-400/50 w-48 mb-2 relative">
                    <div className="absolute -top-3 -right-3 bg-yellow-400 rounded-full p-2">
                      <Trophy className="w-6 h-6 text-yellow-900" />
                    </div>
                    <p className="text-5xl text-center mb-2"></p>
                    <p className="text-2xl font-bold text-white text-center truncate">{podiumPlayers[0].name}</p>
                    <p className="text-yellow-300 text-center">{podiumPlayers[0].score} pts</p>
                  </div>
                  <div className="bg-yellow-500/30 w-48 h-32 rounded-t-lg flex items-center justify-center">
                    <span className="text-5xl font-bold text-yellow-300">1</span>
                  </div>
                </div>
              )}
              
              {/* 3rd Place */}
              {podiumPlayers[2] && (
                <div className="flex flex-col items-center">
                  <div className="bg-gradient-to-b from-orange-600/30 to-orange-700/20 rounded-2xl p-6 border-2 border-orange-500/50 w-40 mb-2">
                    <p className="text-4xl text-center mb-2"></p>
                    <p className="text-xl font-bold text-white text-center truncate">{podiumPlayers[2].name}</p>
                    <p className="text-orange-300 text-center text-sm">{podiumPlayers[2].score} pts</p>
                  </div>
                  <div className="bg-orange-600/30 w-40 h-16 rounded-t-lg flex items-center justify-center">
                    <span className="text-4xl font-bold text-orange-300">3</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* The word reveal */}
            {game.currentWord && (
              <div className="mt-8 text-center">
                <p className="text-white/60 text-sm mb-2">The word was:</p>
                <p className="text-4xl font-bold text-white tracking-widest">{game.currentWord}</p>
              </div>
            )}
          </div>
        )}

        {/* Players List */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-400" />
            {game?.status === 'playing' ? 'Players Status' : 'Players'}
          </h2>
          
          {players.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/40 text-xl">Waiting for players to join...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {players.map((player) => {
                const attemptsLeft = maxWrongs - (player.wrongGuesses || 0);
                const isEliminated = player.isEliminated || attemptsLeft <= 0;
                const hasWon = game?.currentWord && player.guessedLetters && 
                  game.currentWord.split('').every(l => player.guessedLetters.includes(l));

                return (
                  <div key={player.id}
                    className={`rounded-xl p-5 transition-all ${
                      hasWon ? 'bg-gradient-to-r from-green-500/30 to-emerald-500/30 border-2 border-green-400/50' :
                      isEliminated ? 'bg-gradient-to-r from-red-900/30 to-red-800/30 border-2 border-red-500/30' :
                      'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {hasWon && <span className="text-2xl"></span>}
                        {isEliminated && !hasWon && <Skull className="w-6 h-6 text-red-400" />}
                        <p className={`text-xl font-bold ${
                          hasWon ? 'text-green-300' :
                          isEliminated ? 'text-red-300 line-through' :
                          'text-white'
                        }`}>
                          {player.name}
                        </p>
                      </div>
                      
                      {game?.status === 'playing' && !hasWon && (
                        <div className={`text-right ${isEliminated ? 'opacity-50' : ''}`}>
                          <p className={`text-2xl font-bold ${
                            attemptsLeft <= 1 ? 'text-red-400' :
                            attemptsLeft <= 3 ? 'text-yellow-400' :
                            'text-green-400'
                          }`}>
                            {isEliminated ? '' : attemptsLeft}
                          </p>
                          <p className="text-xs text-white/50">
                            {isEliminated ? 'ELIMINATED' : 'attempts left'}
                          </p>
                        </div>
                      )}
                      
                      {hasWon && (
                        <div className="text-right">
                          <p className="text-xl font-bold text-green-400">{player.score}</p>
                          <p className="text-xs text-green-300">points</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Progress bar for attempts */}
                    {game?.status === 'playing' && !isEliminated && !hasWon && (
                      <div className="mt-3">
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${
                              attemptsLeft <= 1 ? 'bg-red-500' :
                              attemptsLeft <= 3 ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${(attemptsLeft / maxWrongs) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
