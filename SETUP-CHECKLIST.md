# Neurlyn Setup Checklist

Use this checklist when setting up Neurlyn on a new device after cloning.

## ✅ Pre-requisites (Required Before Setup)

### System Requirements
- [ ] **Node.js v20+** installed
  ```bash
  node --version  # Should show v20.x.x or higher
  ```
- [ ] **npm v9+** installed
  ```bash
  npm --version  # Should show v9.x.x or higher
  ```
- [ ] **MongoDB 6.0+** installed or Docker available
  ```bash
  mongod --version  # Should show v6.x.x or higher
  # OR
  docker --version  # For MongoDB via Docker
  ```
- [ ] **Git** installed
  ```bash
  git --version
  ```

### Optional (For Full Features)
- [ ] **Stripe Account** (only if using payment features)
- [ ] **Python 3** (only if using dev:with-logging script)
- [ ] **Playwright browsers** (only for E2E tests)

## 📥 Step 1: Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd neurlyn

# Install dependencies (this will take a few minutes)
npm install

# Verify installation
npm list --depth=0
```

**Expected**: All dependencies from package.json should install without errors

## 🔧 Step 2: Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your values
nano .env  # or use your preferred editor
```

### Required Environment Variables

Edit `.env` and configure:

- [ ] **NODE_ENV** - Set to `development` for local dev
- [ ] **PORT** - Default is `3000` (change if needed)
- [ ] **MONGODB_URI** - MongoDB connection string (see Step 3)
- [ ] **JWT_SECRET** - Generate a secure random string:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

### Optional Environment Variables

- [ ] **STRIPE_SECRET_KEY** - Only needed if using payments
- [ ] **STRIPE_WEBHOOK_SECRET** - Only needed if using payments
- [ ] **LOG_LEVEL** - Default is `info` (options: error, warn, info, debug)

## 💾 Step 3: Database Setup

### Option A: Local MongoDB Installation

```bash
# Start MongoDB service
sudo systemctl start mongod
# OR on macOS
brew services start mongodb-community

# Verify MongoDB is running
mongo --eval "db.adminCommand('ping')"
```

Your `.env` should have:
```
MONGODB_URI=mongodb://localhost:27017/neurlyn
```

### Option B: MongoDB via Docker (Recommended)

```bash
# Start MongoDB container
docker run -d --name neurlyn-mongo \
  -p 27017:27017 \
  -v neurlyn-data:/data/db \
  mongo:latest

# Verify container is running
docker ps | grep neurlyn-mongo
```

Your `.env` should have:
```
MONGODB_URI=mongodb://localhost:27017/neurlyn
```

### Option C: MongoDB Atlas (Cloud)

1. Create free cluster at https://www.mongodb.com/cloud/atlas
2. Get connection string from Atlas dashboard
3. Add to `.env`:
```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/neurlyn?retryWrites=true&w=majority
```

## 🌱 Step 4: Seed Database

```bash
# Seed the question bank with all assessment questions
npm run seed

# Expected output:
# - Successfully seeded master questions (core personality, baseline, etc.)
# - Successfully seeded expanded questions (neurodiversity, trauma, etc.)
# - Total: 241+ questions added to database

# Verify seeding worked
npm run verify
```

**Expected**: Should show question counts by category, all instruments present

## 🚀 Step 5: Start Development Server

```bash
# Start the backend server
npm run dev

# Expected output:
# - Neurlyn Backend running on port 3000
# - MongoDB connected
# - Stripe integration active (or warning if not configured)
```

### Verify Server is Running

```bash
# In another terminal, test the health endpoint
curl http://localhost:3000/health

# Expected response:
# {"status":"ok","timestamp":"...","uptime":...}
```

## 🧪 Step 6: Verification Tests

### Basic API Tests

```bash
# Test question retrieval
curl http://localhost:3000/api/questions/stats

# Expected: JSON with question counts by category
```

### Run Test Suite

```bash
# Unit and integration tests
npm test

# Expected: All tests should pass
```

### Frontend Test

Open in browser:
```
http://localhost:3000/index.html
```

**Verify**:
- [ ] Page loads without errors
- [ ] Can start free assessment
- [ ] Questions load properly
- [ ] Can submit responses

## 🔍 Step 7: Port Conflict Check

```bash
# Check if required ports are available
npm run check:ports

# Expected: "All ports are free"
# If not, you may need to stop other services or change ports
```

## 📋 Common Issues and Solutions

### Issue: MongoDB Connection Failed

**Solution**:
```bash
# Check MongoDB is running
pgrep -l mongod
# OR for Docker
docker ps | grep mongo

# Check connection string in .env
cat .env | grep MONGODB_URI
```

### Issue: Port 3000 Already in Use

**Solution**:
```bash
# Find what's using the port
lsof -i :3000

# Kill the process or change PORT in .env
```

### Issue: npm install fails

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and try again
rm -rf node_modules package-lock.json
npm install
```

### Issue: Database seeding fails

**Solution**:
```bash
# Verify MongoDB connection first
mongo mongodb://localhost:27017/neurlyn --eval "db.runCommand({ ping: 1 })"

# Try seeding again with verbose logging
NODE_ENV=development npm run seed
```

## ✨ Step 8: Optional Setup

### Enable E2E Tests

```bash
# Install Playwright browsers
npx playwright install

# Run E2E tests
npm run e2e
```

### Enable Code Quality Tools

```bash
# Run linter
npm run lint

# Run formatter
npm run format

# Run type checking
npm run typecheck
```

### Enable Monitoring (Production)

```bash
# Start performance monitor
npm run monitor

# View monitoring dashboard
npm run monitor:dashboard
```

## 🎯 Final Verification Checklist

- [ ] Node and npm versions meet requirements
- [ ] MongoDB is running and accessible
- [ ] `.env` file exists with all required variables
- [ ] `npm install` completed successfully
- [ ] Database seeded (241+ questions)
- [ ] Development server starts without errors
- [ ] Health check endpoint returns OK
- [ ] Question stats endpoint returns data
- [ ] Frontend loads in browser
- [ ] Can start and complete an assessment
- [ ] Tests pass (optional but recommended)

## 📝 Quick Start Commands (After Initial Setup)

```bash
# Start development (most common)
npm run dev

# Run tests
npm test

# Re-seed database (if needed)
npm run seed

# Check system health
npm run verify

# Build for production
npm run build

# Start production server
npm start
```

## 🆘 Need Help?

If you encounter issues:

1. Check the logs: `tail -f logs/combined.log`
2. Verify environment variables: `cat .env`
3. Check MongoDB connection: `npm run verify`
4. Review the README.md for detailed documentation
5. Create an issue in the repository

## 🔒 Security Notes

**IMPORTANT**: Never commit these files:
- `.env` (contains secrets)
- `.env.local`, `.env.production`
- `node_modules/` (too large, reinstall with npm)
- `logs/` (may contain sensitive data)

These are already in `.gitignore` and should never be pushed to the repository.

---

## Summary: Minimum Required Steps

For a quick setup, at minimum you need:

1. Install Node.js v20+, npm v9+, MongoDB 6.0+
2. Clone repo and run `npm install`
3. Copy `.env.example` to `.env` and set `MONGODB_URI`
4. Start MongoDB
5. Run `npm run seed`
6. Run `npm run dev`
7. Visit `http://localhost:3000`

That's it! You should have a working Neurlyn instance.
