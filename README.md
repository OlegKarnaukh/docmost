# Docmost Railway Deployment

Deploy [Docmost](https://docmost.com) - open-source collaborative documentation platform - to Railway.

## Quick Deploy

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template)

## Manual Deployment on Railway

### Step 1: Create a New Project

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Connect your GitHub account if not connected
5. Select this repository

### Step 2: Add PostgreSQL

1. In your project, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Wait for PostgreSQL to deploy
4. Click on PostgreSQL service → **"Variables"** tab
5. Copy the `DATABASE_URL` value

### Step 3: Add Redis

1. Click **"+ New"** again
2. Select **"Database"** → **"Add Redis"**
3. Wait for Redis to deploy
4. Click on Redis service → **"Variables"** tab
5. Copy the `REDIS_URL` value

### Step 4: Configure Docmost Service

1. Click on your Docmost service (the one from GitHub)
2. Go to **"Variables"** tab
3. Add the following environment variables:

| Variable | Value |
|----------|-------|
| `APP_URL` | `https://${{RAILWAY_PUBLIC_DOMAIN}}` |
| `APP_SECRET` | Generate with: `openssl rand -hex 32` |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` |
| `REDIS_URL` | `${{Redis.REDIS_URL}}` |

**Important:** Use Railway variable references (`${{Postgres.DATABASE_URL}}`) to automatically link services.

### Step 5: Deploy

1. Railway will automatically deploy when variables are configured
2. Go to **"Settings"** tab → **"Networking"**
3. Click **"Generate Domain"** to get a public URL
4. Your Docmost instance will be available at `https://your-app.up.railway.app`

## Custom Domain Setup

### Option A: Railway Subdomain

Your app is automatically available at `https://your-service-name.up.railway.app`

### Option B: Custom Domain

1. Go to your Docmost service **"Settings"** → **"Networking"**
2. Click **"+ Custom Domain"**
3. Enter your domain (e.g., `docs.yourdomain.com`)
4. Add the DNS records shown by Railway to your domain provider:

**For subdomain (recommended):**
```
Type: CNAME
Name: docs
Value: your-app.up.railway.app
```

**For root domain:**
```
Type: A
Name: @
Value: <Railway IP address shown in dashboard>
```

5. Wait for DNS propagation (can take up to 48 hours, usually ~10 minutes)
6. Railway will automatically provision SSL certificate

### Update APP_URL

After adding custom domain, update the `APP_URL` variable:
```
APP_URL=https://docs.yourdomain.com
```

## Local Development

For local development using Docker Compose:

```bash
# Copy environment file
cp .env.example .env

# Generate APP_SECRET
APP_SECRET=$(openssl rand -hex 32)
sed -i "s/your_secret_here_generate_with_openssl_rand_hex_32/$APP_SECRET/" .env

# Start services
docker-compose up -d

# View logs
docker-compose logs -f docmost

# Access Docmost
open http://localhost:3000
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `APP_URL` | Yes | Full URL of your Docmost instance |
| `APP_SECRET` | Yes | Secret key for encryption (min 32 chars) |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis connection string |
| `MAIL_DRIVER` | No | Mail driver (smtp) |
| `SMTP_HOST` | No | SMTP server host |
| `SMTP_PORT` | No | SMTP server port |
| `SMTP_USERNAME` | No | SMTP username |
| `SMTP_PASSWORD` | No | SMTP password |
| `STORAGE_DRIVER` | No | Storage driver (local, s3) |

## Troubleshooting

### Application won't start

1. Check that all required environment variables are set
2. Verify PostgreSQL and Redis are running
3. Check Railway logs for error messages

### Database connection errors

1. Ensure `DATABASE_URL` uses Railway's variable reference: `${{Postgres.DATABASE_URL}}`
2. Check PostgreSQL service is healthy in Railway dashboard

### Redis connection errors

1. Ensure `REDIS_URL` uses Railway's variable reference: `${{Redis.REDIS_URL}}`
2. Check Redis service is healthy in Railway dashboard

## Resources

- [Docmost Documentation](https://docmost.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Docmost GitHub](https://github.com/docmost/docmost)

## License

This deployment configuration is provided as-is for deploying Docmost.
Docmost itself is licensed under [AGPL-3.0](https://github.com/docmost/docmost/blob/main/LICENSE).
