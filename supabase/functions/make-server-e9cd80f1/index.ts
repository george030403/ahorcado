import { Hono } from 'https://deno.land/x/hono@v3.11.7/mod.ts';
import { cors } from 'https://deno.land/x/hono@v3.11.7/middleware.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const app = new Hono();

app.use('*', cors());

// Supabase client
const supabase = () => createClient(
  (typeof Deno !== "undefined" ? Deno.env.get("SUPABASE_URL") : process.env.SUPABASE_URL)!,
  (typeof Deno !== "undefined" ? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") : process.env.SUPABASE_SERVICE_ROLE_KEY)!,
);

// KV Store functions
const kv = {
  async set(key: string, value: any): Promise<void> {
    const { error } = await supabase().from("kv_store_e9cd80f1").upsert({ key, value });
    if (error) throw new Error(error.message);
  },
  
  async get(key: string): Promise<any> {
    const { data, error } = await supabase().from("kv_store_e9cd80f1").select("value").eq("key", key).maybeSingle();
    if (error) throw new Error(error.message);
    return data?.value;
  },
  
  async del(key: string): Promise<void> {
    const { error } = await supabase().from("kv_store_e9cd80f1").delete().eq("key", key);
    if (error) throw new Error(error.message);
  },
  
  async getByPrefix(prefix: string): Promise<any[]> {
    const { data, error } = await supabase().from("kv_store_e9cd80f1").select("key, value").like("key", prefix + "%");
    if (error) throw new Error(error.message);
    return data?.map((d) => d.value) ?? [];
  }
};

// Generate random game code
function generateGameCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// ==================== WORDS MANAGEMENT ====================

// Get all words
app.get('/make-server-e9cd80f1/words', async (c) => {
  try {
    const words = await kv.getByPrefix('word:');
    return c.json({ words: words || [] });
  } catch (error) {
    console.error('Error getting words:', error);
    return c.json({ error: 'Failed to get words' }, 500);
  }
});

// Add new word
app.post('/make-server-e9cd80f1/words', async (c) => {
  try {
    const { word, category, hint } = await c.req.json();
    
    if (!word || typeof word !== 'string') {
      return c.json({ error: 'Word is required' }, 400);
    }

    const wordId = generateId();
    const wordData = {
      id: wordId,
      word: word.toUpperCase().trim(),
      category: category || 'General',
      hint: hint || ''
    };

    await kv.set(`word:${wordId}`, wordData);
    return c.json({ word: wordData });
  } catch (error) {
    console.error('Error adding word:', error);
    return c.json({ error: 'Failed to add word' }, 500);
  }
});

// Delete word
app.delete('/make-server-e9cd80f1/words/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`word:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting word:', error);
    return c.json({ error: 'Failed to delete word' }, 500);
  }
});

// ==================== GAME MANAGEMENT ====================

// Create new game
app.post('/make-server-e9cd80f1/games/create', async (c) => {
  try {
    const code = generateGameCode();
    const game = {
      code,
      status: 'waiting' as const,
      guessedLetters: [],
      wrongGuesses: 0,
      maxWrongs: 6,
      createdAt: Date.now()
    };

    await kv.set(`game:${code}`, game);
    return c.json({ code, game });
  } catch (error) {
    console.error('Error creating game:', error);
    return c.json({ error: 'Failed to create game' }, 500);
  }
});

// Get game info
app.get('/make-server-e9cd80f1/games/:code', async (c) => {
  try {
    const code = c.req.param('code').toUpperCase();
    const game = await kv.get(`game:${code}`);
    
    if (!game) {
      return c.json({ error: 'Game not found' }, 404);
    }

    return c.json({ game });
  } catch (error) {
    console.error('Error getting game:', error);
    return c.json({ error: 'Failed to get game' }, 500);
  }
});

// Start game
app.post('/make-server-e9cd80f1/games/:code/start', async (c) => {
  try {
    const code = c.req.param('code').toUpperCase();
    const game = await kv.get(`game:${code}`);
    
    if (!game) {
      return c.json({ error: 'Game not found' }, 404);
    }

    // Get random word
    const words = await kv.getByPrefix('word:');
    if (!words || words.length === 0) {
      return c.json({ error: 'No words available' }, 400);
    }

    const randomWord = words[Math.floor(Math.random() * words.length)];
    
    const updatedGame = {
      ...game,
      status: 'playing' as const,
      currentWord: randomWord.word,
      currentCategory: randomWord.category,
      currentHint: randomWord.hint,
      guessedLetters: [],
      wrongGuesses: 0,
      startedAt: Date.now()
    };

    await kv.set(`game:${code}`, updatedGame);
    return c.json({ game: updatedGame });
  } catch (error) {
    console.error('Error starting game:', error);
    return c.json({ error: 'Failed to start game' }, 500);
  }
});

// Reset game
app.post('/make-server-e9cd80f1/games/:code/reset', async (c) => {
  try {
    const code = c.req.param('code').toUpperCase();
    
    // Delete game and all players
    await kv.del(`game:${code}`);
    const players = await kv.getByPrefix(`player:${code}:`);
    if (players) {
      for (const player of players) {
        await kv.del(`player:${code}:${player.id}`);
      }
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Error resetting game:', error);
    return c.json({ error: 'Failed to reset game' }, 500);
  }
});

// ==================== PLAYER MANAGEMENT ====================

// Join game
app.post('/make-server-e9cd80f1/games/:code/join', async (c) => {
  try {
    const code = c.req.param('code').toUpperCase();
    const { name } = await c.req.json();
    
    if (!name || typeof name !== 'string') {
      return c.json({ error: 'Name is required' }, 400);
    }

    const game = await kv.get(`game:${code}`);
    if (!game) {
      return c.json({ error: 'Game not found' }, 404);
    }

    const playerId = generateId();
    const player = {
      id: playerId,
      name: name.trim(),
      score: 0,
      guessedLetters: [],
      wrongGuesses: 0,
      isEliminated: false,
      finishedAt: null,
      joinedAt: Date.now()
    };

    await kv.set(`player:${code}:${playerId}`, player);
    return c.json({ playerId, player });
  } catch (error) {
    console.error('Error joining game:', error);
    return c.json({ error: 'Failed to join game' }, 500);
  }
});

// Get players in game
app.get('/make-server-e9cd80f1/games/:code/players', async (c) => {
  try {
    const code = c.req.param('code').toUpperCase();
    const players = await kv.getByPrefix(`player:${code}:`);
    return c.json({ players: players || [] });
  } catch (error) {
    console.error('Error getting players:', error);
    return c.json({ error: 'Failed to get players' }, 500);
  }
});

// ==================== GAME PLAY ====================

// Guess letter (individual per player)
app.post('/make-server-e9cd80f1/games/:code/guess', async (c) => {
  try {
    const code = c.req.param('code').toUpperCase();
    const { letter, playerId } = await c.req.json();
    
    if (!letter || typeof letter !== 'string' || letter.length !== 1) {
      return c.json({ error: 'Invalid letter' }, 400);
    }

    if (!playerId) {
      return c.json({ error: 'Player ID required' }, 400);
    }

    const game = await kv.get(`game:${code}`);
    if (!game || game.status !== 'playing') {
      return c.json({ error: 'Game not in playing state' }, 400);
    }

    const player = await kv.get(`player:${code}:${playerId}`);
    if (!player) {
      return c.json({ error: 'Player not found' }, 404);
    }

    if (player.isEliminated) {
      return c.json({ error: 'Player is eliminated' }, 400);
    }

    const upperLetter = letter.toUpperCase();
    if (player.guessedLetters?.includes(upperLetter)) {
      return c.json({ error: 'Letter already guessed' }, 400);
    }

    const isCorrect = game.currentWord.includes(upperLetter);
    const updatedPlayer = {
      ...player,
      guessedLetters: [...(player.guessedLetters || []), upperLetter],
      wrongGuesses: isCorrect ? player.wrongGuesses : (player.wrongGuesses || 0) + 1
    };

    // Check if player won
    const allLettersGuessed = game.currentWord
      .split('')
      .every((l: string) => updatedPlayer.guessedLetters.includes(l));

    // Check if player lost (eliminated)
    const isEliminated = updatedPlayer.wrongGuesses >= game.maxWrongs;

    if (allLettersGuessed) {
      updatedPlayer.finishedAt = Date.now();
      updatedPlayer.score = (player.score || 0) + Math.max(100 - (updatedPlayer.wrongGuesses * 10), 10);
      
      // Check if this is the first winner
      if (!game.winner) {
        const updatedGame = {
          ...game,
          winner: player.name,
          winnerId: playerId,
          status: 'finished'
        };
        await kv.set(`game:${code}`, updatedGame);
      }
    }

    if (isEliminated) {
      updatedPlayer.isEliminated = true;
      updatedPlayer.finishedAt = Date.now();
    }

    await kv.set(`player:${code}:${playerId}`, updatedPlayer);

    // Return player state along with game
    return c.json({ 
      game, 
      player: updatedPlayer,
      isCorrect,
      won: allLettersGuessed,
      eliminated: isEliminated
    });
  } catch (error) {
    console.error('Error guessing letter:', error);
    return c.json({ error: 'Failed to process guess' }, 500);
  }
});

// Get player state
app.get('/make-server-e9cd80f1/games/:code/player/:playerId', async (c) => {
  try {
    const code = c.req.param('code').toUpperCase();
    const playerId = c.req.param('playerId');
    
    const player = await kv.get(`player:${code}:${playerId}`);
    if (!player) {
      return c.json({ error: 'Player not found' }, 404);
    }

    return c.json({ player });
  } catch (error) {
    console.error('Error getting player:', error);
    return c.json({ error: 'Failed to get player' }, 500);
  }
});

// Health check
app.get('/make-server-e9cd80f1/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

Deno.serve(app.fetch);
