# Outline Railway Deployment

Deploy [Outline](https://getoutline.com) - open-source wiki and knowledge base - to Railway.

## Features

- Public collections with sidebar navigation
- No "Powered by" branding
- Clean, modern interface
- Real-time collaboration

## Prerequisites

**Outline requires OAuth authentication.** You need ONE of:
- Google OAuth credentials
- Slack OAuth credentials
- Generic OIDC provider

## Quick Setup

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project (or select existing)
3. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
4. Configure consent screen if prompted:
   - User Type: External
   - App name: Outline
   - Support email: your email
5. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: Outline
   - Authorized redirect URIs: `https://YOUR-APP.up.railway.app/auth/google.callback`
6. Copy **Client ID** and **Client Secret**

### Step 2: Deploy to Railway

1. Fork this repo or click: [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

2. In Railway, create new project from GitHub repo

3. Add **PostgreSQL**: Click "+ New" → "Database" → "PostgreSQL"

4. Add **Redis**: Click "+ New" → "Database" → "Redis"

5. Configure Outline service variables:

| Variable | Value |
|----------|-------|
| `SECRET_KEY` | Generate: `openssl rand -hex 32` |
| `UTILS_SECRET` | Generate: `openssl rand -hex 32` |
| `URL` | `https://${{RAILWAY_PUBLIC_DOMAIN}}` |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` |
| `REDIS_URL` | `${{Redis.REDIS_URL}}` |
| `FILE_STORAGE` | `local` |
| `FILE_STORAGE_LOCAL_ROOT_DIR` | `/var/lib/outline/data` |
| `GOOGLE_CLIENT_ID` | Your Google Client ID |
| `GOOGLE_CLIENT_SECRET` | Your Google Client Secret |
| `FORCE_HTTPS` | `true` |
| `PGSSLMODE` | `disable` |

6. Generate domain: Settings → Networking → Generate Domain

7. **Important:** Update Google OAuth redirect URI with your actual Railway domain

### Step 3: Configure Public Access

After logging in:

1. Go to **Settings** → **Security**
2. Enable **"Public document sharing"**
3. Create a Collection
4. In Collection settings, enable **"Publish to internet"**
5. Your collection will be publicly accessible with sidebar navigation!

## Custom Domain

1. In Railway: Settings → Networking → + Custom Domain
2. Add DNS record:
   ```
   Type: CNAME
   Name: wiki (or docs, kb, etc.)
   Value: your-app.up.railway.app
   ```
3. Update `URL` variable to your custom domain
4. Update Google OAuth redirect URI

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `SECRET_KEY` | Yes | Encryption key (32+ hex chars) |
| `UTILS_SECRET` | Yes | Utils encryption key (32+ hex chars) |
| `URL` | Yes | Public URL of your Outline instance |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis connection string |
| `FILE_STORAGE` | Yes | `local` or `s3` |
| `GOOGLE_CLIENT_ID` | Yes* | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes* | Google OAuth client secret |

*At least one OAuth provider is required

## Troubleshooting

### "Invalid redirect URI" error
- Ensure Google OAuth redirect URI exactly matches: `https://YOUR-DOMAIN/auth/google.callback`

### Database connection errors
- Check `DATABASE_URL` uses Railway variable reference
- Ensure `PGSSLMODE=disable` is set

### Files not uploading
- For production, consider using S3 storage
- Railway's filesystem is ephemeral - files may be lost on redeploy with local storage

## Resources

- [Outline Documentation](https://docs.getoutline.com)
- [Outline GitHub](https://github.com/outline/outline)
- [Railway Documentation](https://docs.railway.app)
