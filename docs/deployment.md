# Deployment Guide - Azure Image Studio

This guide provides comprehensive deployment instructions for Azure Image Studio on various platforms and cloud services.

> ⚠️ **Important**: This is a **community project** and is not affiliated with or endorsed by Microsoft or Azure. It's an independent project that uses Azure AI services.

**Last Updated**: September 8, 2025  
**Version**: 1.0.1

## 🚀 Deployment Overview

Azure Image Studio can be deployed on various platforms including Azure Static Web Apps, Vercel, Netlify, and traditional hosting providers. This guide covers the most common deployment scenarios.

## ☁️ Azure Static Web Apps Deployment

### Prerequisites
- Azure subscription
- GitHub repository
- Azure CLI installed

### 1. Create Azure Static Web App

#### Using Azure Portal
1. Go to [Azure Portal](https://portal.azure.com)
2. Click "Create a resource"
3. Search for "Static Web App"
4. Click "Create"
5. Fill in the required information:
   - **Subscription**: Your Azure subscription
   - **Resource Group**: Create new or select existing
   - **Name**: Unique name for your static web app
   - **Plan type**: Free or Standard
   - **Region**: Choose your preferred region
   - **Source**: GitHub
   - **GitHub account**: Connect your GitHub account
   - **Organization**: Select your GitHub organization
   - **Repository**: Select your repository
   - **Branch**: main
   - **Build Presets**: Next.js

#### Using Azure CLI
```bash
# Login to Azure
az login

# Create resource group
az group create --name myResourceGroup --location "East US"

# Create static web app
az staticwebapp create \
  --name my-azure-image-studio \
  --resource-group myResourceGroup \
  --source https://github.com/yourusername/azure-image-studio \
  --location "East US 2" \
  --branch main \
  --app-location "/" \
  --output-location "out"
```

### 2. Configure Build Settings

#### Create .github/workflows/azure-static-web-apps.yml
```yaml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true
      - name: Build And Deploy
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/"
          api_location: ""
          output_location: "out"
          skip_app_build: false
          skip_api_build: true
```

### 3. Configure Environment Variables

#### In Azure Portal
1. Go to your Static Web App
2. Navigate to "Configuration"
3. Add the following application settings:
   - `AZURE_API_KEY`: Your Azure API key
   - `NEXT_PUBLIC_APP_URL`: Your static web app URL

#### Using Azure CLI
```bash
# Set environment variables
az staticwebapp appsettings set \
  --name my-azure-image-studio \
  --setting-names AZURE_API_KEY=your_api_key_here
```

### 4. Deploy
```bash
# Push to main branch to trigger deployment
git add .
git commit -m "Deploy to Azure Static Web Apps"
git push origin main
```

## 🟢 Vercel Deployment

### Prerequisites
- Vercel account
- GitHub repository

### 1. Connect Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: npm run build
   - **Output Directory**: .next

### 2. Configure Environment Variables
1. Go to Project Settings
2. Navigate to "Environment Variables"
3. Add the following variables:
   - `AZURE_API_KEY`: Your Azure API key
   - `NEXT_PUBLIC_APP_URL`: Your Vercel app URL

### 3. Deploy
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Or push to main branch for automatic deployment
git push origin main
```

### 4. Custom Domain (Optional)
1. Go to Project Settings
2. Navigate to "Domains"
3. Add your custom domain
4. Configure DNS settings

## 🟠 Netlify Deployment

### Prerequisites
- Netlify account
- GitHub repository

### 1. Connect Repository
1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click "New site from Git"
3. Connect your GitHub repository
4. Configure build settings:
   - **Build command**: npm run build
   - **Publish directory**: out
   - **Node version**: 18

### 2. Configure Environment Variables
1. Go to Site Settings
2. Navigate to "Environment variables"
3. Add the following variables:
   - `AZURE_API_KEY`: Your Azure API key
   - `NEXT_PUBLIC_APP_URL`: Your Netlify app URL

### 3. Create netlify.toml
```toml
[build]
  command = "npm run build"
  publish = "out"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 4. Deploy
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod

# Or push to main branch for automatic deployment
git push origin main
```

## 🐳 Docker Deployment

### 1. Create Dockerfile
```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 2. Create docker-compose.yml
```yaml
version: '3.8'

services:
  azure-image-studio:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - AZURE_API_KEY=${AZURE_API_KEY}
      - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
    volumes:
      - ./src/app/config:/app/src/app/config
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/config"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### 3. Build and Deploy
```bash
# Build the image
docker build -t azure-image-studio .

# Run the container
docker run -p 3000:3000 \
  -e AZURE_API_KEY=your_api_key_here \
  -e NEXT_PUBLIC_APP_URL=http://localhost:3000 \
  azure-image-studio

# Or use docker-compose
docker-compose up -d
```

## 🖥️ Traditional Hosting Deployment

### Prerequisites
- VPS or dedicated server
- Node.js 18+ installed
- PM2 or similar process manager
- Nginx or Apache web server

### 1. Server Setup

#### Install Node.js
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs
```

#### Install PM2
```bash
npm install -g pm2
```

### 2. Deploy Application
```bash
# Clone repository
git clone https://github.com/yourusername/azure-image-studio.git
cd azure-image-studio

# Install dependencies
npm install

# Build application
npm run build

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'azure-image-studio',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      AZURE_API_KEY: 'your_api_key_here',
      NEXT_PUBLIC_APP_URL: 'https://yourdomain.com'
    }
  }]
}
EOF

# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
pm2 startup
```

### 3. Configure Nginx
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔧 Environment Configuration

### Production Environment Variables

#### Required Variables
```bash
# Azure API Key
AZURE_API_KEY=your_production_api_key_here

# Application URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Node Environment
NODE_ENV=production

# Optional: Custom endpoint URL
AZURE_API_BASE_URL=https://your-endpoint.openai.azure.com
```

#### Optional Variables
```bash
# Debug mode (set to false in production)
DEBUG=false

# Log level
LOG_LEVEL=info

# Port (if not using default 3000)
PORT=3000

# Database URL (if using external database)
DATABASE_URL=your_database_url_here
```

### Configuration Files

#### Production Configuration
Ensure your configuration files are properly set up:

1. **azure-config.json**: Update with production endpoints
2. **azure-models.json**: Configure production models
3. **app-config.json**: Set production settings

## 📊 Monitoring and Maintenance

### Health Checks

#### Application Health Check
```bash
# Check if application is running
curl -f http://localhost:3000/api/config

# Check application status
pm2 status
```

#### Database Health Check
```bash
# Check IndexedDB status (if applicable)
# This would be done through the application interface
```

### Logging

#### PM2 Logs
```bash
# View logs
pm2 logs azure-image-studio

# View error logs
pm2 logs azure-image-studio --err

# View output logs
pm2 logs azure-image-studio --out
```

#### Nginx Logs
```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

### Performance Monitoring

#### PM2 Monitoring
```bash
# Monitor in real-time
pm2 monit

# Show detailed information
pm2 show azure-image-studio
```

#### System Monitoring
```bash
# Check system resources
htop

# Check disk usage
df -h

# Check memory usage
free -h
```

## 🔄 CI/CD Pipeline

### GitHub Actions

#### Create .github/workflows/deploy.yml
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build application
      run: npm run build
      env:
        AZURE_API_KEY: ${{ secrets.AZURE_API_KEY }}
        NEXT_PUBLIC_APP_URL: ${{ secrets.NEXT_PUBLIC_APP_URL }}
    
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /path/to/azure-image-studio
          git pull origin main
          npm ci
          npm run build
          pm2 restart azure-image-studio
```

### Secrets Configuration
Add the following secrets to your GitHub repository:
- `AZURE_API_KEY`: Your Azure API key
- `NEXT_PUBLIC_APP_URL`: Your production URL
- `HOST`: Your server IP address
- `USERNAME`: Your server username
- `SSH_KEY`: Your SSH private key

## 🚨 Troubleshooting

### Common Deployment Issues

#### Build Failures
```bash
# Check Node.js version
node --version

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run type-check
```

#### Environment Variable Issues
```bash
# Verify environment variables are set
echo $AZURE_API_KEY

# Check if variables are accessible in the application
curl http://localhost:3000/api/config
```

#### Port Issues
```bash
# Check if port is in use
lsof -i :3000

# Kill process using the port
kill -9 <PID>

# Use different port
PORT=3001 npm start
```

#### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Test SSL configuration
curl -I https://yourdomain.com
```

### Performance Issues

#### Memory Issues
```bash
# Check memory usage
free -h

# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm start
```

#### CPU Issues
```bash
# Check CPU usage
top

# Use PM2 cluster mode
pm2 start ecosystem.config.js --instances max
```

## 📚 Additional Resources

### Documentation
- [Installation Guide](installation.md) - Installation instructions
- [Getting Started](getting-started.md) - Setup and configuration
- [Architecture Guide](architecture.md) - System architecture
- [Developer Guide](developer-guide.md) - Development setup
- [API Documentation](api-documentation.md) - Technical reference

### Platform Documentation
- [Azure Static Web Apps](https://docs.microsoft.com/en-us/azure/static-web-apps/)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)
- [Docker Documentation](https://docs.docker.com/)

### Monitoring Tools
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

## 🆘 Support

### Getting Help
- Check the [troubleshooting section](#troubleshooting)
- Review the [GitHub Issues](https://github.com/DrHazemAli/azure-image-studio/issues)
- Join [GitHub Discussions](https://github.com/DrHazemAli/azure-image-studio/discussions)

### Contact
- **Author**: Hazem Ali (Microsoft MVP)
- **GitHub**: [@DrHazemAli](https://github.com/DrHazemAli)
- **LinkedIn**: [Hazem Ali](https://linkedin.com/in/hazemali)

---

## 🧭 Navigation

<div align="center">

[← Back: Installation Guide](installation.md) | [Next: CLI Documentation →](cli-documentation.md)

</div>

---

This guide provides comprehensive deployment instructions for Azure Image Studio. For more information, see the [Installation Guide](installation.md) or [Getting Started Guide](getting-started.md).
