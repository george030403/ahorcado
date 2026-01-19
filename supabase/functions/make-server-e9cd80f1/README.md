# Supabase Edge Function: make-server-e9cd80f1

This folder contains the Edge Function that handles all the game logic.

## Deployment Instructions

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link to your project:
```bash
supabase link --project-ref YOUR_PROJECT_ID
```

4. Deploy the function:
```bash
supabase functions deploy make-server-e9cd80f1 --no-verify-jwt
```

## Important Notes

- The `--no-verify-jwt` flag allows public access to the API
- The function uses Deno runtime
- Environment variables `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are automatically provided

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /words | Get all words |
| POST | /words | Add new word |
| DELETE | /words/:id | Delete word |
| POST | /games/create | Create new game |
| GET | /games/:code | Get game info |
| POST | /games/:code/start | Start game |
| POST | /games/:code/reset | Reset game |
| POST | /games/:code/join | Join game |
| GET | /games/:code/players | Get players |
| POST | /games/:code/guess | Guess letter |
| GET | /health | Health check |
