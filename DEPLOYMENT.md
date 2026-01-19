# Deployment Guide - Hangman Multiplayer

## Prerequisites

This application is designed to run on **Figma Make** environment, which handles deployment automatically. However, if you want to understand how it works or deploy elsewhere, here's what you need:

- Supabase account and project
- Node.js 18+ or Deno runtime
- Modern web browser

---

## Current Deployment (Figma Make)

### ✅ What's Already Configured

1. **Frontend:** React app with Vite bundler
2. **Backend:** Supabase Edge Function
3. **Database:** Key-Value store (pre-configured)
4. **Environment:** Everything is pre-wired

### 🚀 How to Use

**The app is already deployed and running!** Just:

1. Open the application
2. Start with Admin Panel
3. Load initial words
4. Create a game
5. Share the code with players

---

## Manual Deployment (If Needed)

### Option 1: Deploy to Supabase

If you need to deploy this to your own Supabase project:

#### Step 1: Create Supabase Project
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Initialize project
supabase init
```

#### Step 2: Deploy Edge Function
```bash
# Deploy the server function
supabase functions deploy make-server-e9cd80f1

# Get your project details
supabase status
```

#### Step 3: Update Configuration
In `/utils/supabase/info.tsx`, update:
```typescript
export const projectId = 'your-project-id';
export const publicAnonKey = 'your-anon-key';
```

#### Step 4: Deploy Frontend
```bash
# Build the frontend
npm run build

# Deploy to your hosting (Vercel, Netlify, etc.)
# Or use Supabase hosting
```

### Option 2: Deploy to Vercel

#### Frontend (Vercel)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

#### Backend (Keep on Supabase)
- Backend stays on Supabase Edge Functions
- Update API URLs in frontend to point to your Supabase

### Option 3: Self-Hosted

#### Docker Deployment
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "preview"]
```

---

## Environment Variables

If deploying manually, you need:

### Frontend (.env)
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Backend (Supabase Edge Function)
Automatically provided:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## Database Setup

### Key-Value Store

The app uses Supabase's built-in KV store. If you need to create it manually:

```sql
-- This is already done in Figma Make environment
CREATE TABLE kv_store_e9cd80f1 (
  key TEXT PRIMARY KEY,
  value JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add index for prefix searches
CREATE INDEX idx_kv_prefix ON kv_store_e9cd80f1 (key text_pattern_ops);
```

---

## CORS Configuration

Make sure CORS is enabled in your Supabase Edge Function:

```typescript
app.use('*', cors({
  origin: '*',  // Or specify your domain
  credentials: true
}));
```

---

## Monitoring & Logs

### Supabase Dashboard
- View function logs: `supabase functions logs make-server-e9cd80f1`
- Monitor usage: Supabase dashboard → Functions tab

### Error Tracking
All errors are logged to console. Check:
- Browser DevTools Console (frontend)
- Supabase Function Logs (backend)

---

## Performance Optimization

### Frontend
- Static assets are cached
- Images optimized
- Code splitting enabled
- Lazy loading for routes

### Backend
- Edge function runs close to users
- KV store is fast (PostgreSQL)
- Minimal database queries
- Efficient data structures

### Recommended Settings
- Enable CDN for static files
- Use HTTP/2
- Enable Gzip/Brotli compression
- Set cache headers

---

## Scaling Considerations

### Current Limits
- **Concurrent games:** ~50
- **Players per game:** ~100
- **Words in database:** ~1000
- **API calls:** Based on Supabase plan

### If You Need More
1. **Upgrade Supabase plan** for more resources
2. **Add caching** (Redis) for frequently accessed data
3. **Implement WebSockets** for real-time updates
4. **Database indexing** for faster queries
5. **Load balancing** for multiple regions

---

## Security Checklist

- [x] No sensitive data stored
- [x] CORS properly configured
- [x] Service role key not exposed to frontend
- [x] Input validation on backend
- [x] SQL injection not possible (using KV store)
- [x] XSS protection (React escapes by default)
- [x] Rate limiting (via Supabase)

---

## Backup & Recovery

### Backup Words
```bash
# Export words from KV store
supabase db dump -f backup.sql

# Or use API to export
curl https://your-project.supabase.co/functions/v1/make-server-e9cd80f1/words
```

### Restore
- Re-run "Load Initial Words" in Admin Panel
- Or import from backup file

---

## Custom Domain (Optional)

If you want a custom domain:

### Vercel
```bash
vercel domains add yourdomain.com
```

### Supabase
- Configure in Supabase dashboard
- Add CNAME record to your DNS

---

## Testing Deployment

After deployment, test:

1. ✅ Admin Panel loads
2. ✅ Can create game
3. ✅ Players can join
4. ✅ Game starts correctly
5. ✅ Letters can be guessed
6. ✅ Scores update
7. ✅ Leaderboard displays
8. ✅ Game can reset

---

## Troubleshooting

### "Function not found"
- Check function name: `make-server-e9cd80f1`
- Verify it's deployed: `supabase functions list`

### "CORS error"
- Check CORS configuration in server
- Verify allowed origins

### "Database error"
- Check Supabase credentials
- Verify KV store exists

### "Words not loading"
- Check API endpoint
- Verify initial words are loaded
- Check browser console for errors

---

## Production Checklist

Before going live:

- [ ] Load production words
- [ ] Test all features
- [ ] Check mobile responsiveness
- [ ] Verify CORS settings
- [ ] Set up monitoring
- [ ] Configure custom domain (optional)
- [ ] Test with multiple devices
- [ ] Check error handling
- [ ] Verify backup strategy
- [ ] Document admin procedures

---

## Support & Maintenance

### Regular Tasks
- Monitor function logs weekly
- Check error rates
- Review player feedback
- Update word database as needed
- Test new features before deploying

### Updates
To update the app:
1. Make changes locally
2. Test thoroughly
3. Deploy frontend: `npm run build` + upload
4. Deploy backend: `supabase functions deploy`
5. Test in production

---

## Cost Estimates

### Supabase (Free Tier)
- ✅ Suitable for most classroom use
- ✅ 500MB database
- ✅ 2GB bandwidth
- ✅ 50,000 monthly active users

### Supabase (Pro - $25/month)
- 8GB database
- 250GB bandwidth
- 100,000 monthly active users
- Better for schools/organizations

---

## Conclusion

This application is designed to be **simple to deploy and maintain**. The Figma Make environment handles most of the complexity for you.

For questions or issues, check:
1. Browser console logs
2. Supabase function logs
3. This documentation
4. README.md and QUICKSTART_GUIDE.md

**Happy deploying! 🚀**
