import { useState } from 'react';
import { AdminPanel } from './components/admin/AdminPanel';
import { MainScreen } from './components/game/MainScreen';
import { PlayerScreen } from './components/game/PlayerScreen';
import { HelpCircle, Sparkles, Settings, Monitor, Gamepad2, Heart, BookOpen, ArrowRight, Zap } from 'lucide-react';

type ViewMode = 'select' | 'admin' | 'main-screen' | 'player';

// Floating particles component
function Particles() {
  return (
    <div className="particles">
      {[...Array(5)].map((_, i) => (
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
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="icon-container w-12 h-12">
                    <Sparkles className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="absolute inset-0 blur-xl bg-purple-500/20 animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gradient">Hangman</h1>
                  <p className="text-xs text-white/40">Multiplayer Edition</p>
                </div>
              </div>
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="icon-container w-10 h-10 text-white/50 hover:text-white hover:bg-white/10 transition-all"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>
            
            {/* Help Panel */}
            {showHelp && (
              <div className="mb-6 glass-card rounded-xl p-4 border border-white/10 animate-fade-in-up">
                <p className="font-semibold mb-3 text-white flex items-center gap-2 text-sm">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  Quick Guide
                </p>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <div className="icon-container w-8 h-8 flex-shrink-0">
                      <Settings className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <strong className="text-amber-300 block">Admin Panel</strong>
                      <span className="text-white/60 text-xs">Create games & manage word bank</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="icon-container w-8 h-8 flex-shrink-0">
                      <Monitor className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <strong className="text-blue-300 block">Main Display</strong>
                      <span className="text-white/60 text-xs">Show leaderboard on projector/TV</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="icon-container w-8 h-8 flex-shrink-0">
                      <Gamepad2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <strong className="text-emerald-300 block">Player Mode</strong>
                      <span className="text-white/60 text-xs">Join game with code to play</span>
                    </div>
                  </li>
                </ul>
              </div>
            )}
            
            {/* Navigation Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => setViewMode('admin')}
                className="w-full btn-premium btn-gold text-gray-900 py-4 px-6 rounded-2xl font-semibold text-base stagger-1 animate-fade-in-up group"
              >
                <span className="flex items-center justify-between">
                  <span className="flex items-center gap-3">
                    <Settings className="w-5 h-5" />
                    Admin Panel
                  </span>
                  <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </span>
              </button>
              
              <button
                onClick={() => setViewMode('main-screen')}
                className="w-full btn-premium btn-ocean text-white py-4 px-6 rounded-2xl font-semibold text-base stagger-2 animate-fade-in-up group"
              >
                <span className="flex items-center justify-between">
                  <span className="flex items-center gap-3">
                    <Monitor className="w-5 h-5" />
                    Main Display
                  </span>
                  <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </span>
              </button>
              
              <button
                onClick={() => setViewMode('player')}
                className="w-full btn-premium btn-emerald text-white py-4 px-6 rounded-2xl font-semibold text-base stagger-3 animate-fade-in-up group"
              >
                <span className="flex items-center justify-between">
                  <span className="flex items-center gap-3">
                    <Gamepad2 className="w-5 h-5" />
                    Join as Player
                  </span>
                  <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </span>
              </button>
            </div>
            
            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <p className="text-white/30 text-xs flex items-center justify-center gap-1">
                Made with <Heart className="w-3 h-3 text-red-400 animate-pulse" /> for fun multiplayer games
              </p>
              <div className="mt-2 flex items-center justify-center gap-1 text-white/20 text-xs">
                <Zap className="w-3 h-3" />
                <span>Powered by Supabase</span>
              </div>
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
