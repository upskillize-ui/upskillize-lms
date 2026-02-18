# 🚀 Upskillize LMS - Deployment Guide

## Production Deployment Checklist

### Pre-Deployment

- [ ] All features tested locally
- [ ] Environment variables configured
- [ ] Database schema finalized
- [ ] Security audit completed
- [ ] Performance testing done
- [ ] Backup strategy in place

## Option 1: Deploy to Render.com

### Backend Deployment (Render)

1. **Create Render Account**
   - Sign up at https://render.com

2. **Create New Web Service**
   - Connect GitHub repository
   - Select `backend` folder
   - Configure:
     - **Name**: upskillize-api
     - **Environment**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `node server.js`

3. **Add Environment Variables**
   ```
   NODE_ENV=production
   DB_HOST=<your-db-host>
   DB_USER=<your-db-user>
   DB_PASS=<your-db-password>
   DB_NAME=upskillize_lms
   DB_PORT=3306
   JWT_SECRET=<generate-strong-secret>
   RESEND_API_KEY=<your-resend-key>
   FROM_EMAIL=noreply@upskillize.com
   RAZORPAY_KEY_ID=<your-razorpay-key>
   RAZORPAY_KEY_SECRET=<your-razorpay-secret>
   CORS_ORIGIN=https://upskillize.com
   FRONTEND_URL=https://upskillize.com
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment
   - Note your API URL: `https://upskillize-api.onrender.com`

### Database (Render PostgreSQL) - Alternative to MySQL

1. **Create PostgreSQL Database**
   - Dashboard → New → PostgreSQL
   - Note connection details

2. **Update Backend Code**
   - Change dialect from 'mysql' to 'postgres'
   - Update connection string

### Frontend Deployment (Vercel)

1. **Create Vercel Account**
   - Sign up at https://vercel.com

2. **Import Project**
   - New Project → Import Git Repository
   - Select `frontend` folder
   - Framework Preset: Vite

3. **Configure Environment Variables**
   ```
   VITE_API_URL=https://upskillize-api.onrender.com/api
   VITE_RAZORPAY_KEY_ID=<your-razorpay-key>
   ```

4. **Deploy**
   - Click Deploy
   - Custom domain: `upskillize.com`

## Option 2: Deploy to Railway.app

### Backend + Database on Railway

1. **Create Railway Account**
   - Sign up at https://railway.app

2. **New Project**
   - Create New Project
   - Deploy from GitHub
   - Select backend directory

3. **Add MySQL Database**
   - Add Plugin → MySQL
   - Railway auto-populates DB credentials

4. **Environment Variables**
   ```
   NODE_ENV=production
   JWT_SECRET=<strong-secret>
   RESEND_API_KEY=<key>
   FROM_EMAIL=noreply@upskillize.com
   RAZORPAY_KEY_ID=<key>
   RAZORPAY_KEY_SECRET=<secret>
   CORS_ORIGIN=https://upskillize.com
   FRONTEND_URL=https://upskillize.com
   ```

5. **Deploy Frontend**
   - Same steps as Vercel above

## Option 3: VPS Deployment (DigitalOcean/AWS EC2)

### Server Setup

1. **Create Ubuntu 22.04 Server**
   - 2GB RAM minimum
   - Open ports: 22 (SSH), 80 (HTTP), 443 (HTTPS)

2. **Initial Setup**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs

   # Install MySQL
   sudo apt install -y mysql-server
   sudo mysql_secure_installation

   # Install Nginx
   sudo apt install -y nginx

   # Install PM2
   sudo npm install -g pm2

   # Install Certbot for SSL
   sudo apt install -y certbot python3-certbot-nginx
   ```

3. **Create Database**
   ```bash
   sudo mysql
   ```
   ```sql
   CREATE DATABASE upskillize_lms;
   CREATE USER 'upskillize'@'localhost' IDENTIFIED BY 'strong_password';
   GRANT ALL PRIVILEGES ON upskillize_lms.* TO 'upskillize'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

### Deploy Backend

1. **Clone Repository**
   ```bash
   cd /var/www
   git clone https://github.com/yourusername/upskillize-lms.git
   cd upskillize-lms/backend
   ```

2. **Install Dependencies**
   ```bash
   npm install --production
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   nano .env
   # Edit with your production values
   ```

4. **Start with PM2**
   ```bash
   pm2 start server.js --name upskillize-api
   pm2 save
   pm2 startup
   ```

### Deploy Frontend

1. **Build Frontend**
   ```bash
   cd /var/www/upskillize-lms/frontend
   npm install
   npm run build
   ```

2. **Configure Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/upskillize
   ```

   ```nginx
   # Frontend
   server {
       listen 80;
       server_name upskillize.com www.upskillize.com;
       
       root /var/www/upskillize-lms/frontend/dist;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
   }

   # Backend API
   server {
       listen 80;
       server_name api.upskillize.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. **Enable Site**
   ```bash
   sudo ln -s /etc/nginx/sites-available/upskillize /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

4. **Setup SSL**
   ```bash
   sudo certbot --nginx -d upskillize.com -d www.upskillize.com
   sudo certbot --nginx -d api.upskillize.com
   ```

## Post-Deployment

### 1. Health Checks
- [ ] API health endpoint responding
- [ ] Database connection working
- [ ] Frontend loading correctly
- [ ] Authentication working
- [ ] Payment integration functional

### 2. Monitoring Setup

**Using PM2 (VPS)**
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

**Using External Services**
- [ ] UptimeRobot for uptime monitoring
- [ ] Sentry for error tracking
- [ ] Google Analytics for user tracking

### 3. Backup Strategy

**Database Backups**
```bash
# Create backup script
nano /root/backup.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u upskillize -p upskillize_lms > /backups/db_$DATE.sql
# Keep only last 7 days
find /backups -name "db_*.sql" -mtime +7 -delete
```

```bash
chmod +x /root/backup.sh
# Add to crontab
crontab -e
# 0 2 * * * /root/backup.sh
```

### 4. Security Hardening

- [ ] Enable firewall (UFW)
- [ ] Disable root SSH login
- [ ] Setup fail2ban
- [ ] Regular security updates
- [ ] Strong passwords everywhere
- [ ] SSH key authentication only

### 5. Performance Optimization

- [ ] Enable Nginx gzip compression
- [ ] Setup CDN for static assets (Cloudflare)
- [ ] Database query optimization
- [ ] Enable caching where appropriate

## Continuous Deployment

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to Server
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.SERVER_HOST }}
        username: ${{ secrets.SERVER_USER }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /var/www/upskillize-lms
          git pull
          cd backend && npm install && pm2 restart upskillize-api
          cd ../frontend && npm install && npm run build
```

## Domain Configuration

### DNS Settings

**For Cloudflare/Namecheap:**

```
Type    Name    Value               TTL
A       @       <server-ip>         Auto
A       www     <server-ip>         Auto
A       api     <server-ip>         Auto
CNAME   www     upskillize.com      Auto
```

## Troubleshooting

### Common Issues

**Backend won't start**
```bash
pm2 logs upskillize-api
# Check for errors
```

**Database connection failed**
```bash
# Test MySQL connection
mysql -u upskillize -p upskillize_lms
```

**Nginx not working**
```bash
sudo nginx -t
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

**SSL certificate issues**
```bash
sudo certbot renew --dry-run
```

## Maintenance

### Regular Tasks

**Weekly:**
- [ ] Review error logs
- [ ] Check disk space
- [ ] Monitor traffic

**Monthly:**
- [ ] Update dependencies
- [ ] Review security patches
- [ ] Database optimization
- [ ] Backup verification

**Quarterly:**
- [ ] Performance audit
- [ ] Security audit
- [ ] User feedback review

## Scaling

### Horizontal Scaling

1. **Add Load Balancer**
   - Nginx or AWS ALB
   - Multiple backend instances
   - Session store (Redis)

2. **Database Replication**
   - Master-slave setup
   - Read replicas
   - Connection pooling

3. **CDN Integration**
   - Cloudflare
   - AWS CloudFront
   - Static asset distribution

## Support

For deployment issues:
- Check logs first
- Review this guide
- Contact DevOps team
- Create GitHub issue

---

**Deploy with confidence! 🚀**
