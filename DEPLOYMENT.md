# Deployment Guide - Persona Protocol

## Quick Deployment Options

### 1. Vercel (Recommended for Web Apps)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

**Configuration** (`vercel.json`):
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/analyze",
      "dest": "src/index.ts"
    }
  ]
}
```

### 2. Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create persona-protocol

# Deploy
git push heroku main

# Open app
heroku open
```

**Configuration** (`Procfile`):
```
web: node dist/index.js
```

### 3. Replit

1. Go to https://replit.com
2. Click "Create Repl"
3. Import from GitHub: `https://github.com/Anshulmehra001/-Persona-Protocol`
4. Click "Run"

**Configuration** (`.replit`):
```toml
run = "npm start"
entrypoint = "src/index.ts"

[nix]
channel = "stable-22_11"

[deployment]
run = ["npm", "run", "build"]
deploymentTarget = "cloudrun"
```

### 4. Docker

**Dockerfile**:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

**Build and Run**:
```bash
# Build image
docker build -t persona-protocol .

# Run container
docker run -p 3000:3000 persona-protocol

# Push to Docker Hub
docker tag persona-protocol yourusername/persona-protocol
docker push yourusername/persona-protocol
```

### 5. AWS Lambda

**Install Serverless Framework**:
```bash
npm install -g serverless
```

**Configuration** (`serverless.yml`):
```yaml
service: persona-protocol

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1

functions:
  analyze:
    handler: dist/index.handler
    events:
      - http:
          path: analyze
          method: post
          cors: true

plugins:
  - serverless-plugin-typescript
```

**Deploy**:
```bash
serverless deploy
```

### 6. Google Cloud Run

```bash
# Build container
gcloud builds submit --tag gcr.io/PROJECT_ID/persona-protocol

# Deploy
gcloud run deploy persona-protocol \
  --image gcr.io/PROJECT_ID/persona-protocol \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### 7. Railway

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Railway auto-detects and deploys

### 8. Render

1. Go to https://render.com
2. Click "New +"
3. Select "Web Service"
4. Connect GitHub repository
5. Configure:
   - Build Command: `npm install && npm run build`
   - Start Command: `node dist/index.js`

## API Deployment

### Express Server Setup

Create `src/server.ts`:
```typescript
import express from 'express';
import { analyzeWallet } from './index';

const app = express();
app.use(express.json());

app.post('/analyze', (req, res) => {
  try {
    const result = analyzeWallet(JSON.stringify(req.body));
    res.json(JSON.parse(result));
  } catch (error) {
    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Persona Protocol API running on port ${PORT}`);
});
```

### Environment Variables

Create `.env`:
```env
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
```

## Testing Deployment

### Health Check
```bash
curl https://your-deployment-url.com/health
```

### API Test
```bash
curl -X POST https://your-deployment-url.com/analyze \
  -H "Content-Type: application/json" \
  -d @examples/wallet1-defi-degen.json
```

## Monitoring & Logging

### Add Logging
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Add Monitoring
```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});
```

## Performance Optimization

### Enable Caching
```typescript
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 600 });

app.post('/analyze', (req, res) => {
  const cacheKey = JSON.stringify(req.body);
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return res.json(cached);
  }
  
  const result = analyzeWallet(JSON.stringify(req.body));
  const parsed = JSON.parse(result);
  cache.set(cacheKey, parsed);
  res.json(parsed);
});
```

### Add Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/analyze', limiter);
```

## Security

### Add CORS
```typescript
import cors from 'cors';

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*'
}));
```

### Add Helmet
```typescript
import helmet from 'helmet';

app.use(helmet());
```

### Add Input Validation
```typescript
import { body, validationResult } from 'express-validator';

app.post('/analyze',
  body('walletAddress').isString().notEmpty(),
  body('transactions').isArray(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // ... rest of handler
  }
);
```

## CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## Scaling Considerations

### Horizontal Scaling
- Use load balancer (AWS ELB, Google Cloud Load Balancing)
- Deploy multiple instances
- Use container orchestration (Kubernetes)

### Vertical Scaling
- Increase instance size
- Optimize memory usage
- Enable Node.js clustering

### Database Integration (Future)
```typescript
// For caching and analytics
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db('persona-protocol');
```

## Cost Estimation

### Free Tier Options
- **Vercel**: 100GB bandwidth/month
- **Heroku**: 550-1000 dyno hours/month
- **Replit**: Free for public projects
- **Railway**: $5 credit/month

### Paid Tier Estimates
- **Vercel Pro**: $20/month
- **Heroku Hobby**: $7/month
- **AWS Lambda**: ~$0.20 per 1M requests
- **Google Cloud Run**: ~$0.40 per 1M requests

## Troubleshooting

### Common Issues

**Build Fails**:
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

**Port Already in Use**:
```bash
# Change port
PORT=3001 npm start
```

**Memory Issues**:
```bash
# Increase Node.js memory
NODE_OPTIONS="--max-old-space-size=4096" npm start
```

## Support

For deployment issues:
1. Check logs: `npm run logs`
2. Review documentation
3. Open GitHub issue
4. Contact: [Your Email]

---

**Last Updated**: December 2024  
**Deployment Status**: Production-Ready
