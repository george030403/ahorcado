import { useState, useEffect } from 'react';
import { ArrowLeft, Users, Trophy, Skull, Crown, Sparkles, Radio, Clock, Medal, Target, CheckCircle2 } from 'lucide-react';
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

  const getPodiumPlayers = () => {
    const winners = players
      .filter(p => {
        if (!game?.currentWord || !p.guessedLetters) return false;
        return game.currentWord.split('').every(l => p.guessedLetters.includes(l));
      })
      .sort((a, b) => {
        if (a.finishedAt && b.finishedAt) {
          if (a.finishedAt !== b.finishedAt) return a.finishedAt - b.finishedAt;
        }
        return (a.wrongGuesses || 0) - (b.wrongGuesses || 0);
      });
    return winners.slice(0, 3);
  };

  if (!isJoined) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <button onClick={onBack} className="absolute top-6 left-6 flex items-center gap-2 text-white/70 hover:text-white transition-all group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back
        </button>

        <div className="glass-card rounded-3xl p-8 max-w-md w-full animate-fade-in-scale">
          <div className="text-center mb-8">
            <div className="icon-container w-20 h-20 mx-auto mb-4 animate-float">
              <Radio className="w-10 h-10 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-gradient mb-2">Main Display</h1>
            <p className="text-white/60">Connect to show the leaderboard</p>
          </div>

          <div className="space-y-4">
            <input type="text" placeholder="Enter game code" value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              className="w-full input-glass rounded-xl px-4 py-3 text-white text-center text-2xl tracking-[0.5em] uppercase"
              maxLength={6} />
            
            <button onClick={joinGame} disabled={!inputCode.trim()}
              className="w-full btn-premium btn-ocean text-white py-4 px-6 rounded-xl font-bold text-lg disabled:opacity-50">
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
    <div className="min-h-screen p-6 relative z-10">
      <button onClick={() => { setIsJoined(false); setGameCode(''); setPlayers([]); setGame(null); }}
        className="mb-6 flex items-center gap-2 text-white/70 hover:text-white transition-all group">
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Disconnect
      </button>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="glass-card rounded-3xl p-8 mb-6 text-center animate-fade-in-up">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Sparkles className="w-10 h-10 text-purple-400 animate-spin-slow" />
            <h1 className="text-5xl font-bold text-gradient">Hangman Game</h1>
            <Sparkles className="w-10 h-10 text-purple-400 animate-spin-slow" />
          </div>
          <div className="flex items-center justify-center gap-8 text-white/80">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-lg">Code: <span className="font-mono font-bold text-2xl text-white">{gameCode}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-400" />
              <span className="text-lg font-semibold">{players.length} Players</span>
            </div>
          </div>
        </div>

        {/* Game Status */}
        {game && (
          <div className="glass-card rounded-2xl p-6 mb-6 text-center animate-fade-in-up stagger-1">
            <span className={`px-8 py-3 rounded-full font-bold text-lg inline-flex items-center gap-2 ${
              game.status === 'waiting' ? 'status-waiting text-gray-900' :
              game.status === 'playing' ? 'status-playing text-white' :
              'status-finished text-white'
            }`}>
              {game.status === 'waiting' && <><Clock className="w-5 h-5" /> Waiting to Start</>}
              {game.status === 'playing' && <><Target className="w-5 h-5" /> Game in Progress</>}
              {game.status === 'finished' && <><CheckCircle2 className="w-5 h-5" /> Game Finished</>}
            </span>
          </div>
        )}

        {/* Podium */}
        {game?.status === 'finished' && podiumPlayers.length > 0 && (
          <div className="glass-card rounded-3xl p-8 mb-6 animate-bounce-in">
            <h2 className="text-3xl font-bold text-center mb-8 flex items-center justify-center gap-3">
              <Trophy className="w-10 h-10 text-yellow-400 animate-float" />
              <span className="text-gradient-gold">WINNERS PODIUM</span>
              <Trophy className="w-10 h-10 text-yellow-400 animate-float" />
            </h2>
            
            <div className="flex items-end justify-center gap-6">
              {/* 2nd Place */}
              {podiumPlayers[1] && (
                <div className="flex flex-col items-center animate-slide-in-left">
                  <div className="glass-card rounded-2xl p-6 w-44 mb-3 trophy-shine">
                    <Medal className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-xl font-bold text-white text-center truncate">{podiumPlayers[1].name}</p>
                    <p className="text-gray-300 text-center text-sm">{podiumPlayers[1].score} pts</p>
                  </div>
                  <div className="podium-2nd w-44 h-24 rounded-t-xl flex items-center justify-center">
                    <span className="text-4xl font-bold text-white/80">2</span>
                  </div>
                </div>
              )}
              
              {/* 1st Place */}
              {podiumPlayers[0] && (
                <div className="flex flex-col items-center -mt-12 animate-fade-in-up">
                  <Crown className="w-14 h-14 text-yellow-400 mb-3 animate-bounce" />
                  <div className="glass-card rounded-2xl p-8 w-52 mb-3 trophy-shine border-2 border-yellow-400/50">
                    <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-3" />
                    <p className="text-2xl font-bold text-white text-center truncate">{podiumPlayers[0].name}</p>
                    <p className="text-yellow-300 text-center font-semibold">{podiumPlayers[0].score} pts</p>
                  </div>
                  <div className="podium-1st w-52 h-36 rounded-t-xl flex items-center justify-center">
                    <span className="text-5xl font-bold text-yellow-900">1</span>
                  </div>
                </div>
              )}
              
              {/* 3rd Place */}
              {podiumPlayers[2] && (
                <div className="flex flex-col items-center animate-slide-in-right">
                  <div className="glass-card rounded-2xl p-6 w-44 mb-3 trophy-shine">
                    <Medal className="w-12 h-12 text-orange-400 mx-auto mb-3" />
                    <p className="text-xl font-bold text-white text-center truncate">{podiumPlayers[2].name}</p>
                    <p className="text-orange-300 text-center text-sm">{podiumPlayers[2].score} pts</p>
                  </div>
                  <div className="podium-3rd w-44 h-16 rounded-t-xl flex items-center justify-center">
                    <span className="text-4xl font-bold text-white/80">3</span>
                  </div>
                </div>
              )}
            </div>
            
            {game.currentWord && (
              <div className="mt-10 text-center">
                <p className="text-white/50 text-sm mb-2">The word was</p>
                <p className="text-4xl font-bold text-white tracking-[0.3em]">{game.currentWord}</p>
              </div>
            )}
          </div>
        )}

        {/* Players List */}
        <div className="glass-card rounded-2xl p-8 animate-fade-in-up stagger-2">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-400" />
            {game?.status === 'playing' ? 'Players Status' : 'Players'}
          </h2>
          
          {players.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-white/20 mx-auto mb-4 animate-pulse" />
              <p className="text-white/40 text-xl">Waiting for players to join...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {players.map((player, index) => {
                const attemptsLeft = maxWrongs - (player.wrongGuesses || 0);
                const isEliminated = player.isEliminated || attemptsLeft <= 0;
                const hasWon = game?.currentWord && player.guessedLetters && 
                  game.currentWord.split('').every(l => player.guessedLetters.includes(l));

                return (
                  <div key={player.id}
                    style={{ animationDelay: `${index * 0.05}s` }}
                    className={`glass-card-hover rounded-xl p-5 animate-fade-in-up ${
                      hasWon ? 'winner-glow border-2 border-green-400/50' :
                      isEliminated ? 'border-2 border-red-500/30 opacity-60' :
                      'border border-white/10'
                    }`}>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {hasWon && <Trophy className="w-6 h-6 text-yellow-400 animate-float" />}
                        {isEliminated && !hasWon && <Skull className="w-6 h-6 text-red-400 skull-shake" />}
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
                          <p className={`text-3xl font-bold ${
                            attemptsLeft <= 1 ? 'text-red-400 animate-heartbeat' :
                            attemptsLeft <= 3 ? 'text-yellow-400' :
                            'text-green-400'
                          }`}>
                            {isEliminated ? <Skull className="w-8 h-8 inline" /> : attemptsLeft}
                          </p>
                          <p className="text-xs text-white/50">
                            {isEliminated ? 'OUT' : 'left'}
                          </p>
                        </div>
                      )}
                      
                      {hasWon && (
                        <div className="text-right">
                          <p className="text-xl font-bold text-green-400">{player.score}</p>
                          <p className="text-xs text-green-300">pts</p>
                        </div>
                      )}
                    </div>
                    
                    {game?.status === 'playing' && !isEliminated && !hasWon && (
                      <div className="mt-3 progress-bar h-2 rounded-full">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            attemptsLeft <= 1 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                            attemptsLeft <= 3 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                            'bg-gradient-to-r from-green-500 to-emerald-500'
                          }`}
                          style={{ width: `${(attemptsLeft / maxWrongs) * 100}%` }}
                        />
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
