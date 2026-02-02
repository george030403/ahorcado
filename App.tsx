import { useState } from 'react';
import { AdminPanel } from './components/admin/AdminPanel';
import { MainScreen } from './components/game/MainScreen';
import { PlayerScreen } from './components/game/PlayerScreen';
import { HelpCircle, Sparkles, Settings, Monitor, Gamepad2, Heart, BookOpen, ArrowRight, Zap, Lock, User, AlertCircle } from 'lucide-react';

type ViewMode = 'select' | 'admin-login' | 'admin' | 'main-screen' | 'player';

// Admin credentials - Change these to your desired username and password
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "hangman2026";

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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  const handleAdminLogin = () => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setViewMode('admin');
      setLoginError(false);
      setUsername('');
      setPassword('');
    } else {
      setLoginError(true);
    }
  };

  return (
    <div className="min-h-screen animated-bg">
      <Particles />
      
      {viewMode === 'select' && (
        <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
          <div className="glass-card glass-card-hover rounded-3xl p-8 max-w-md w-full animate-fade-in-scale">
            {/* Header */}
            <div className="flex items-center justify-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gradient text-center">Hangman</h1>
                <p className="text-xs text-white/40 text-center">Multiplayer Edition</p>
              </div>
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
                onClick={() => setViewMode('admin-login')}
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
                <span>Created by George & Ivan</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'admin-login' && (
        <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
          <div className="glass-card rounded-3xl p-8 max-w-md w-full animate-fade-in-scale">
            <div className="text-center mb-8">
              <div className="icon-container w-16 h-16 mx-auto mb-4">
                <Lock className="w-8 h-8 text-amber-400" />
              </div>
              <h1 className="text-2xl font-bold text-gradient-gold">Admin Login</h1>
              <p className="text-white/50 text-sm mt-1">Enter credentials to access</p>
            </div>

            {loginError && (
              <div className="mb-4 glass-card rounded-xl p-3 border border-red-500/30 bg-red-500/10 animate-fade-in-up">
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Invalid username or password</span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-white/70 text-sm mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" /> Username
                </label>
                <input
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setLoginError(false); }}
                  className="w-full input-glass rounded-xl px-4 py-3 text-white"
                  onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                />
              </div>
              
              <div>
                <label className="text-white/70 text-sm mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Password
                </label>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setLoginError(false); }}
                  className="w-full input-glass rounded-xl px-4 py-3 text-white"
                  onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                />
              </div>
              
              <button
                onClick={handleAdminLogin}
                className="w-full btn-premium btn-gold text-gray-900 py-4 px-6 rounded-xl font-bold text-lg mt-2"
              >
                Login
              </button>
              
              <button
                onClick={() => { setViewMode('select'); setLoginError(false); setUsername(''); setPassword(''); }}
                className="w-full text-white/50 hover:text-white py-2 text-sm transition-all"
              >
                ← Back to menu
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
        <PlayerScreen onBack={() => setViewMode('select')} />
      )}
    </div>
  );
}
