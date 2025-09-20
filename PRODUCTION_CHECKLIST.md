# Neurlyn Production Deployment Checklist

## 🔐 Security & Environment

### Environment Variables
- [ ] Update `.env` with production values
- [ ] Set strong `JWT_SECRET`
- [ ] Add real Stripe keys (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`)
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper `MONGODB_URI` for production database
- [ ] Set correct `BASE_URL` for your domain

### Security Headers
- [ ] Enable HTTPS only
- [ ] Configure CORS for your domain
- [ ] Set up rate limiting appropriately
- [ ] Enable helmet security headers
- [ ] Configure CSP headers

## 🗄️ Database

### MongoDB Setup
- [ ] Set up MongoDB Atlas or production MongoDB server
- [ ] Create database indexes: `npm run optimize-mongodb-indexes`
- [ ] Set up database backups
- [ ] Configure replica set for high availability
- [ ] Set up monitoring alerts

### Data Migration
- [ ] Seed initial questions: `npm run seed:all`
- [ ] Verify question count (should be 295+)
- [ ] Test database connections
- [ ] Set up automated backup cron job

## 🚀 Deployment

### Server Setup
- [ ] Configure Nginx/Apache reverse proxy
- [ ] Set up SSL certificate (Let's Encrypt)
- [ ] Configure firewall rules
- [ ] Set up PM2 for process management
- [ ] Configure log rotation

### Deployment Steps
```bash
# 1. Clone repository
git clone https://github.com/yourusername/neurlyn.git
cd neurlyn

# 2. Install dependencies
npm install --production

# 3. Build frontend
npm run build

# 4. Set up environment
cp .env.example .env
# Edit .env with production values

# 5. Set up database
npm run seed:all

# 6. Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

# 7. Set up Nginx
sudo cp nginx.conf /etc/nginx/sites-available/neurlyn
sudo ln -s /etc/nginx/sites-available/neurlyn /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔍 Monitoring

### Application Monitoring
- [ ] Set up PM2 monitoring
- [ ] Configure error tracking (Sentry/Rollbar)
- [ ] Set up uptime monitoring (UptimeRobot/Pingdom)
- [ ] Configure performance monitoring
- [ ] Set up log aggregation

### Alerts
- [ ] Database connection failures
- [ ] High error rates
- [ ] Payment failures
- [ ] Memory/CPU usage alerts
- [ ] Disk space alerts

## 💳 Payment Integration

### Stripe Setup
- [ ] Verify Stripe account
- [ ] Add production API keys
- [ ] Configure webhook endpoints
- [ ] Test payment flow in Stripe test mode
- [ ] Switch to live mode
- [ ] Set up billing emails

## 🧪 Testing

### Pre-deployment Tests
- [ ] Run unit tests: `npm test`
- [ ] Run E2E tests: `npm run e2e`
- [ ] Test payment flow
- [ ] Test assessment flow
- [ ] Test mobile responsiveness
- [ ] Load testing with Apache Bench or k6

### Post-deployment Tests
- [ ] Health check endpoint: `curl https://yourdomain.com/health`
- [ ] Test SSL certificate
- [ ] Test API endpoints
- [ ] Complete user journey test
- [ ] Payment flow test with test card
- [ ] Mobile device testing

## 📊 Performance

### Optimization
- [ ] Enable Gzip compression
- [ ] Set up CDN for static assets
- [ ] Optimize images
- [ ] Enable browser caching
- [ ] Minify CSS/JS
- [ ] Enable HTTP/2

### Benchmarks
- [ ] Page load time < 3s
- [ ] API response time < 500ms
- [ ] Database queries < 100ms
- [ ] Memory usage < 500MB
- [ ] CPU usage < 70%

## 📝 Documentation

### User Documentation
- [ ] Update README with production URL
- [ ] Create user guide
- [ ] Document API endpoints
- [ ] Create FAQ section
- [ ] Privacy policy
- [ ] Terms of service

### Technical Documentation
- [ ] Document deployment process
- [ ] Create troubleshooting guide
- [ ] Document backup procedures
- [ ] Create incident response plan
- [ ] Document scaling procedures

## 🔄 Backup & Recovery

### Backup Strategy
- [ ] Daily database backups
- [ ] Weekly full system backups
- [ ] Store backups offsite (S3/Google Cloud)
- [ ] Test restore procedure
- [ ] Document recovery process

### Disaster Recovery
- [ ] Create disaster recovery plan
- [ ] Set up staging environment
- [ ] Document rollback procedure
- [ ] Create emergency contacts list
- [ ] Regular recovery drills

## 📈 Post-Launch

### Monitoring Period (First Week)
- [ ] Monitor error logs closely
- [ ] Check performance metrics
- [ ] Monitor database performance
- [ ] Track user feedback
- [ ] Daily health checks

### Optimization
- [ ] Analyze user behavior
- [ ] Optimize slow queries
- [ ] Review error patterns
- [ ] Update based on feedback
- [ ] Plan feature updates

## 🚨 Emergency Contacts

- **Server Issues**: [Your hosting provider support]
- **Database Issues**: [MongoDB Atlas support]
- **Payment Issues**: Stripe Support
- **Domain/DNS**: [Your registrar support]
- **SSL Issues**: Let's Encrypt community

## 📋 Final Checks

- [ ] All tests passing
- [ ] No console errors in production
- [ ] SSL certificate valid
- [ ] Robots.txt configured
- [ ] Sitemap.xml created
- [ ] Analytics tracking enabled
- [ ] Error tracking enabled
- [ ] Backups automated
- [ ] Monitoring active
- [ ] Documentation complete

---

## Quick Commands

```bash
# Check system status
pm2 status

# View logs
pm2 logs neurlyn-backend

# Restart application
pm2 restart neurlyn-backend

# Database backup
mongodump --uri="mongodb://..." --out=/backup/$(date +%Y%m%d)

# Check disk space
df -h

# Check memory
free -m

# Check nginx status
sudo systemctl status nginx

# SSL certificate renewal
sudo certbot renew
```

## Notes

- Keep this checklist updated with your specific configuration
- Review before each deployment
- Create a staging environment for testing
- Always have a rollback plan
- Document any custom configurations