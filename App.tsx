import { useState } from 'react';
import { AdminPanel } from './components/admin/AdminPanel';
import { MainScreen } from './components/game/MainScreen';
import { PlayerScreen } from './components/game/PlayerScreen';
import { HelpCircle, Sparkles } from 'lucide-react';

type ViewMode = 'select' | 'admin' | 'main-screen' | 'player';

// Floating particles component
function Particles() {
  return (
    <div className="particles">
      {[...Array(9)].map((_, i) => (
        <div key={i} className="particle" />
      ))}
    </div>
  );
}

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('select');
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="min-h-screen animated-bg">
      <Particles />
      
      {viewMode === 'select' && (
        <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
          <div className="glass-card glass-card-hover rounded-3xl p-8 max-w-md w-full animate-fade-in-scale">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Sparkles className="w-10 h-10 text-purple-400 animate-float" />
                  <div className="absolute inset-0 blur-xl bg-purple-500/30 animate-pulse"></div>
                </div>
                <h1 className="text-4xl font-bold text-gradient">
                  Hangman
                </h1>
              </div>
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="text-white/70 hover:text-white transition-all hover:rotate-12 hover:scale-110"
              >
                <HelpCircle className="w-6 h-6" />
              </button>
            </div>
            
            {showHelp && (
              <div className="mb-6 glass-card rounded-xl p-4 border border-white/10 text-sm text-white/80 animate-fade-in-up">
                <p className="font-semibold mb-2 text-white flex items-center gap-2">
                  <span className="text-lg"></span> Quick Guide
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400"></span>
                    <span><strong className="text-yellow-300">Admin:</strong> Create games & manage words</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400"></span>
                    <span><strong className="text-blue-300">Display:</strong> Show leaderboard (for projector)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400"></span>
                    <span><strong className="text-green-300">Player:</strong> Join and play the game</span>
                  </li>
                </ul>
              </div>
            )}
            
            <div className="space-y-4">
              <button
                onClick={() => setViewMode('admin')}
                className="w-full btn-premium btn-gold text-gray-900 py-4 px-6 rounded-2xl font-bold text-lg shadow-glow-amber stagger-1 animate-fade-in-up"
              >
                <span className="flex items-center justify-center gap-3">
                  <span className="text-2xl"></span>
                  Admin Panel
                </span>
              </button>
              
              <button
                onClick={() => setViewMode('main-screen')}
                className="w-full btn-premium btn-ocean text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-glow-indigo stagger-2 animate-fade-in-up"
              >
                <span className="flex items-center justify-center gap-3">
                  <span className="text-2xl"></span>
                  Main Display Screen
                </span>
              </button>
              
              <button
                onClick={() => setViewMode('player')}
                className="w-full btn-premium btn-emerald text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-glow-emerald stagger-3 animate-fade-in-up"
              >
                <span className="flex items-center justify-center gap-3">
                  <span className="text-2xl"></span>
                  Join as Player
                </span>
              </button>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-white/30 text-xs">
                Made with  for fun multiplayer games
              </p>
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
        <PlayerScreen onBack={() => setViewMode('select')} />
      )}
    </div>
  );
}
