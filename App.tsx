import { useState, useEffect } from 'react';
import { AdminPanel } from './components/admin/AdminPanel';
import { MainScreen } from './components/game/MainScreen';
import { PlayerScreen } from './components/game/PlayerScreen';
import { HelpCircle } from 'lucide-react';

type ViewMode = 'select' | 'admin' | 'main-screen' | 'player';

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('select');
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      {viewMode === 'select' && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/20">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-4xl font-bold text-white">
                Hangman Game
              </h1>
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <HelpCircle className="w-6 h-6" />
              </button>
            </div>
            
            {showHelp && (
              <div className="mb-6 bg-white/5 rounded-xl p-4 border border-white/10 text-sm text-white/80">
                <p className="font-semibold mb-2">Quick Guide:</p>
                <ul className="space-y-1 text-xs">
                  <li>• <strong>Admin:</strong> Create games & manage words</li>
                  <li>• <strong>Display:</strong> Show leaderboard (for projector)</li>
                  <li>• <strong>Player:</strong> Join and play the game</li>
                </ul>
              </div>
            )}
            
            <div className="space-y-4">
              <button
                onClick={() => setViewMode('admin')}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-lg transition-all hover:scale-105"
              >
                🔑 Admin Panel
              </button>
              
              <button
                onClick={() => setViewMode('main-screen')}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-lg transition-all hover:scale-105"
              >
                📺 Main Display Screen
              </button>
              
              <button
                onClick={() => setViewMode('player')}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-lg transition-all hover:scale-105"
              >
                🎮 Join as Player
              </button>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'admin' && (
        <AdminPanel onBack={() => setViewMode('select')} />
      )}

      {viewMode === 'main-screen' && (
        <MainScreen onBack={() => setViewMode('select')} />
      )}

      {viewMode === 'player' && (
        <PlayerScreen 
          onBack={() => setViewMode('select')} 
        />
      )}
    </div>
  );
}