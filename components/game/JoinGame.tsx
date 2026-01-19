import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

interface JoinGameProps {
  onJoin: (code: string, name: string) => void;
  onBack: () => void;
}

export function JoinGame({ onJoin, onBack }: JoinGameProps) {
  const [gameCode, setGameCode] = useState('');
  const [playerName, setPlayerName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameCode.trim() && playerName.trim()) {
      onJoin(gameCode.toUpperCase(), playerName.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <button
        onClick={onBack}
        className="absolute top-6 left-6 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/20">
        <h1 className="text-3xl font-bold text-white text-center mb-8">
          Join Game
        </h1>

        <div className="space-y-6">
          <div>
            <label className="block text-white/80 mb-2 font-medium">Your Name</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
              maxLength={20}
              required
            />
          </div>

          <div>
            <label className="block text-white/80 mb-2 font-medium">Game Code</label>
            <input
              type="text"
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value.toUpperCase())}
              placeholder="XXXXXX"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-center text-2xl tracking-wider placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 uppercase font-mono"
              maxLength={6}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-lg transition-all hover:scale-105"
          >
            Join Game
          </button>
        </div>
      </form>
    </div>
  );
}
