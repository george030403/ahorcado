import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Play, RotateCcw, Download, Sparkles, Users, Gamepad2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { initialWords } from '../../utils/initialWords';

interface Word {
  id: string;
  word: string;
  category: string;
  hint?: string;
}

interface Game {
  code: string;
  status: 'waiting' | 'playing' | 'finished';
  currentWord?: string;
  currentHint?: string;
  guessedLetters: string[];
  wrongGuesses: number;
  maxWrongs: number;
}

interface AdminPanelProps {
  onBack: () => void;
}

export function AdminPanel({ onBack }: AdminPanelProps) {
  const [words, setWords] = useState<Word[]>([]);
  const [newWord, setNewWord] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newHint, setNewHint] = useState('');
  const [gameCode, setGameCode] = useState('');
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(false);
  const [playerCount, setPlayerCount] = useState(0);

  useEffect(() => { loadWords(); }, []);

  useEffect(() => {
    if (gameCode) {
      const interval = setInterval(() => loadPlayerCount(), 2000);
      return () => clearInterval(interval);
    }
  }, [gameCode]);

  const loadWords = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e9cd80f1/words`,
        { headers: { Authorization: `Bearer ${publicAnonKey}` } }
      );
      const data = await response.json();
      if (data.words) setWords(data.words);
    } catch (error) {
      console.error('Error loading words:', error);
    }
  };

  const loadPlayerCount = async () => {
    if (!gameCode) return;
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e9cd80f1/games/${gameCode}/players`,
        { headers: { Authorization: `Bearer ${publicAnonKey}` } }
      );
      const data = await response.json();
      if (data.players) setPlayerCount(data.players.length);
    } catch (error) {
      console.error('Error loading player count:', error);
    }
  };

  const loadInitialWords = async () => {
    setLoading(true);
    try {
      for (const wordData of initialWords) {
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-e9cd80f1/words`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
            body: JSON.stringify(wordData)
          }
        );
      }
      await loadWords();
    } catch (error) {
      console.error('Error loading initial words:', error);
    }
    setLoading(false);
  };

  const addWord = async () => {
    if (!newWord.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e9cd80f1/words`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
          body: JSON.stringify({
            word: newWord.toUpperCase().trim(),
            category: newCategory.trim() || 'General',
            hint: newHint.trim()
          })
        }
      );
      if (response.ok) {
        setNewWord('');
        setNewCategory('');
        setNewHint('');
        await loadWords();
      }
    } catch (error) {
      console.error('Error adding word:', error);
    }
    setLoading(false);
  };

  const deleteWord = async (id: string) => {
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e9cd80f1/words/${id}`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${publicAnonKey}` } }
      );
      await loadWords();
    } catch (error) {
      console.error('Error deleting word:', error);
    }
  };

  const createGame = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e9cd80f1/games/create`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` }
        }
      );
      const data = await response.json();
      if (data.code) {
        setGameCode(data.code);
        setCurrentGame(data.game);
      }
    } catch (error) {
      console.error('Error creating game:', error);
    }
    setLoading(false);
  };

  const startGame = async () => {
    if (!gameCode || words.length === 0) return;
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e9cd80f1/games/${gameCode}/start`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` }
        }
      );
      const data = await response.json();
      if (data.game) setCurrentGame(data.game);
    } catch (error) {
      console.error('Error starting game:', error);
    }
    setLoading(false);
  };

  const resetGame = async () => {
    if (!gameCode) return;
    setLoading(true);
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e9cd80f1/games/${gameCode}/reset`,
        { method: 'POST', headers: { Authorization: `Bearer ${publicAnonKey}` } }
      );
      setCurrentGame(null);
      setGameCode('');
    } catch (error) {
      console.error('Error resetting game:', error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen p-6 relative z-10">
      <div className="max-w-7xl mx-auto">
        <button onClick={onBack}
          className="mb-6 flex items-center gap-2 text-white/70 hover:text-white transition-all group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back
        </button>

        <div className="flex items-center gap-4 mb-8 animate-fade-in-up">
          <div className="relative">
            <Sparkles className="w-12 h-12 text-yellow-400 animate-float" />
            <div className="absolute inset-0 blur-xl bg-yellow-500/30 animate-pulse"></div>
          </div>
          <h1 className="text-4xl font-bold text-gradient-gold">Admin Panel</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Game Management */}
          <div className="glass-card rounded-2xl p-6 animate-fade-in-up stagger-1">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Gamepad2 className="w-7 h-7 text-green-400" />
              Game Management
            </h2>
            
            {!gameCode ? (
              <button onClick={createGame} disabled={loading}
                className="w-full btn-premium btn-emerald text-white py-4 px-6 rounded-xl font-bold text-lg disabled:opacity-50">
                <span className="flex items-center justify-center gap-2">
                  <Plus className="w-5 h-5" /> Create New Game
                </span>
              </button>
            ) : (
              <div className="space-y-4">
                <div className="glass-card rounded-xl p-4 animate-pulse-glow">
                  <p className="text-white/60 text-sm mb-1">Game Code</p>
                  <p className="text-4xl font-bold text-white tracking-[0.3em] font-mono">{gameCode}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="glass-card rounded-xl p-4">
                    <p className="text-white/60 text-sm mb-1">Status</p>
                    <p className={`text-xl font-bold capitalize ${
                      currentGame?.status === 'playing' ? 'text-green-400' :
                      currentGame?.status === 'finished' ? 'text-blue-400' : 'text-yellow-400'
                    }`}>
                      {currentGame?.status || 'waiting'}
                    </p>
                  </div>
                  
                  <div className="glass-card rounded-xl p-4">
                    <p className="text-white/60 text-sm mb-1">Players</p>
                    <p className="text-xl font-bold text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-400" />
                      {playerCount}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  {currentGame?.status === 'waiting' && (
                    <button onClick={startGame} disabled={loading || words.length === 0}
                      className="flex-1 btn-premium btn-ocean text-white py-3 px-4 rounded-xl font-bold disabled:opacity-50">
                      <span className="flex items-center justify-center gap-2">
                        <Play className="w-5 h-5" /> Start Game
                      </span>
                    </button>
                  )}
                  
                  <button onClick={resetGame} disabled={loading}
                    className="flex-1 btn-premium btn-sunset text-white py-3 px-4 rounded-xl font-bold disabled:opacity-50">
                    <span className="flex items-center justify-center gap-2">
                      <RotateCcw className="w-5 h-5" /> Reset
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Word Management */}
          <div className="glass-card rounded-2xl p-6 animate-fade-in-up stagger-2">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Plus className="w-7 h-7 text-purple-400" />
              Add New Word
            </h2>
            
            <div className="space-y-3">
              <input type="text" placeholder="Word (e.g., ELEPHANT)" value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                className="w-full input-glass rounded-xl px-4 py-3 text-white uppercase" />
              
              <input type="text" placeholder="Category (e.g., Animals)" value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full input-glass rounded-xl px-4 py-3 text-white" />
              
              <input type="text" placeholder="Hint (optional)" value={newHint}
                onChange={(e) => setNewHint(e.target.value)}
                className="w-full input-glass rounded-xl px-4 py-3 text-white" />
              
              <button onClick={addWord} disabled={loading || !newWord.trim()}
                className="w-full btn-premium btn-cosmic text-white py-3 px-6 rounded-xl font-bold disabled:opacity-50">
                <span className="flex items-center justify-center gap-2">
                  <Plus className="w-5 h-5" /> Add Word
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Word List */}
        <div className="mt-6 glass-card rounded-2xl p-6 animate-fade-in-up stagger-3">
          <h2 className="text-2xl font-bold text-white mb-4">
            Word Bank <span className="text-purple-400">({words.length})</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-2">
            {words.map((word, index) => (
              <div key={word.id} style={{ animationDelay: `${index * 0.03}s` }}
                className="glass-card glass-card-hover rounded-xl p-4 flex items-start justify-between gap-3 animate-fade-in-up">
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold text-white truncate">{word.word}</p>
                  <p className="text-sm text-purple-300">{word.category}</p>
                  {word.hint && <p className="text-xs text-white/40 mt-1 italic">"{word.hint}"</p>}
                </div>
                <button onClick={() => deleteWord(word.id)}
                  className="text-red-400 hover:text-red-300 hover:scale-110 transition-all flex-shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          
          {words.length === 0 && (
            <p className="text-white/40 text-center py-8">No words added yet. Add your first word above!</p>
          )}
        </div>

        {/* Load Initial Words */}
        <div className="mt-6 glass-card rounded-2xl p-6 animate-fade-in-up stagger-4">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <Download className="w-7 h-7 text-blue-400" />
            Quick Setup
          </h2>
          
          <p className="text-white/70 text-sm mb-4">
            Load <span className="text-blue-400 font-bold">{initialWords.length}</span> pre-configured English words to get started quickly
          </p>
          
          <button onClick={loadInitialWords} disabled={loading}
            className="w-full btn-premium btn-ocean text-white py-3 px-6 rounded-xl font-bold disabled:opacity-50">
            <span className="flex items-center justify-center gap-2">
              <Download className="w-5 h-5" /> Load {initialWords.length} Initial Words
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
