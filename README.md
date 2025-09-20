# Neurlyn

## 🧠 Advanced Adaptive Neurodiversity & Personality Assessment Platform

Neurlyn is a comprehensive, scientifically-grounded assessment platform that provides deep insights into personality, neurodiversity, cognitive patterns, and emotional profiles through adaptive questioning and intelligent analysis.

## ✨ Key Features

### 🎯 Adaptive Assessment Engine

- **Smart Question Selection**: Dynamically selects from 241+ validated questions
- **Three-Tier System**: Quick (20 questions), Standard (45 questions), Deep (75 questions)
- **Intelligent Branching**: ADHD, Autism, AuDHD, Trauma, Giftedness pathways
- **Real-time Adaptation**: Questions adjust based on response patterns

### 🧩 Comprehensive Assessment Coverage (241 Total Questions)

- **Personality (Big Five)**: 61 validated BFI-2 Extended questions
- **Neurodiversity**: 90 specialized questions
  - Executive Function (20)
  - Sensory Processing (18)
  - Masking & Camouflaging (15)
  - Emotional Regulation (12)
  - Special Interests (6)
- **Cognitive Functions**: 16 Jungian-based questions
- **Attachment Styles**: 12 questions
- **Trauma Screening**: 12 validated questions
- **Enneagram**: 18 type-specific questions
- **Learning Styles**: 8 multimodal questions
- **Lateral Thinking**: 22 creative problem-solving questions

### 📊 Deep Personalization & Analysis

- **Behavioral Pattern Analysis**: Response time, consistency, engagement tracking
- **Hidden Pattern Detection**: Identifies compensation strategies and masking
- **Cognitive Style Profiling**: Processing style, learning preferences
- **Emotional Landscape Mapping**: Awareness, regulation, stress response

### 📈 Comprehensive Report Generation

- **15 Report Sections**: Executive summary through actionable next steps
- **Neurodiversity-Affirming Language**: Celebrates differences as strengths
- **Personalized Narratives**: Unique, compassionate summaries
- **Hidden Strengths Discovery**: Reveals untapped potential
- **Actionable Strategies**: Daily, environmental, relational recommendations

### Privacy First

- **No User Data Storage**: Zero PII collection
- **Temporary Sessions**: Auto-delete after 24 hours
- **Anonymous Processing**: All assessments processed without accounts
- **Auto-Cleanup**: Transaction records auto-delete after 30 days

### Technical Excellence

- **Production-Ready**: Environment validation, structured logging, health checks
- **Type-Safe**: TypeScript configuration with strict type checking
- **Quality Assured**: ESLint, Prettier, and comprehensive test suite
- **Performance Optimized**: Code splitting, lazy loading, and compression
- **Monitoring Ready**: Health endpoints and metrics
- **Database Resilient**: Connection pooling with automatic retry logic

## 📋 Prerequisites

- Node.js v20+
- npm v9+
- MongoDB 6.0+ (via Docker or local installation)
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd neurlyn
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/neurlyn
JWT_SECRET=your-secure-jwt-secret
STRIPE_SECRET_KEY=your-stripe-secret-key
```

### 4. Start MongoDB (Docker)

```bash
docker run -d --name neurlyn-mongo \
  -p 27017:27017 \
  -v neurlyn-data:/data/db \
  mongo:latest
```

### 5. Seed Database

```bash
npm run seed:all
```

### 6. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to access the application.

## 🏗 Project Structure

```
neurlyn/
├── config/                 # Configuration files
│   ├── database.js        # MongoDB connection with retry logic
│   └── env.validation.js  # Environment variable validation
├── middleware/            # Express middleware
│   ├── errorHandler.js   # Global error handling
│   └── validation.js     # Request validation with Joi
├── models/                # Database schemas (privacy-focused)
│   ├── QuestionBank.js    # Assessment questions
│   ├── ReportTemplate.js  # Report generation templates
│   ├── TemporarySession.js # Auto-deleting sessions
│   └── Transaction.js     # Anonymous payment records
├── routes/                # API endpoints
│   ├── health.js         # Health check endpoints
│   └── questions.js      # Question retrieval endpoints
├── scripts/               # Utility scripts
│   ├── seed-all-questions.js     # Database seeder
│   ├── test-assessment-variations.js # API tests
│   └── verify-setup.js   # Setup verification
├── utils/                 # Utility functions
│   └── logger.js         # Winston logging
├── js/                    # Frontend modules
│   ├── modules/          # Core modules
│   └── questions/        # Question definitions
└── tests/                 # Test suite
```

## 📡 API Endpoints

### Health Checks

- `GET /health` - Basic health status
- `GET /health/ready` - Readiness check with DB status
- `GET /health/detailed` - Comprehensive system info
- `GET /health/metrics` - Prometheus-compatible metrics

### Questions API

- `GET /api/questions/assessment/:type` - Get questions by assessment type
  - Types: `personality`, `neurodiversity`, `lateral`, `cognitive`, `comprehensive`
  - Query params: `tier`, `limit`, `randomize`
- `GET /api/questions/by-instrument/:instrument` - Get by specific instrument
  - Instruments: `BFI-2-Extended`, `ASRS-5`, `AQ-10`, `PHQ-2`, `GAD-2`, `LATERAL_THINKING`
- `GET /api/questions/stats` - Get question statistics

### Example API Calls

```bash
# Get personality questions (free tier)
curl http://localhost:3000/api/questions/assessment/personality?tier=free

# Get neurodiversity screening questions
curl http://localhost:3000/api/questions/assessment/neurodiversity

# Get comprehensive assessment (all categories)
curl http://localhost:3000/api/questions/assessment/comprehensive?tier=comprehensive

# Get question statistics
curl http://localhost:3000/api/questions/stats
```

## 📊 Database Schema

### QuestionBank

Stores all assessment questions without any user data:

- Question text, ID, and metadata
- Category (personality, neurodiversity, lateral, cognitive)
- Instrument (BFI-2, ASRS-5, AQ-10, etc.)
- Response type and options
- Tier (free, core, comprehensive, specialized)

### TemporarySession

Auto-deletes after 24 hours:

- Session progress tracking
- No personal data storage
- Automatic cleanup

### Transaction

Anonymous payment records, auto-delete after 30 days:

- Transaction ID and amount
- No customer PII
- Automatic anonymization

## 🧪 Testing

### Run All Tests

```bash
# Verify setup
node scripts/verify-setup.js

# Test API endpoints
node scripts/test-assessment-variations.js

# Interactive frontend test
open test-frontend-integration.html
```

### Test Coverage

- ✅ 13/13 API endpoint tests passing
- ✅ 104 questions properly categorized
- ✅ All assessment variations working
- ✅ Tier-based filtering operational
- ✅ Randomization and limiting functional

## 📝 Available Scripts

```bash
npm run dev          # Start development server with nodemon
npm run build        # Build production bundle with webpack
npm run start        # Start production server
npm run test         # Run test suite
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run seed:all     # Seed database with all questions
npm run verify       # Verify system setup
```

## 🔐 Security Features

- **Helmet.js**: Security headers
- **Rate Limiting**: API rate limiting (100 req/15min)
- **CORS**: Configured CORS policies
- **Input Validation**: Joi schema validation
- **Environment Validation**: Secure config management
- **No PII Storage**: Complete privacy by design

## 📈 Monitoring

The application provides comprehensive monitoring endpoints:

- `/health` - Basic uptime check
- `/health/ready` - Database connectivity check
- `/health/detailed` - Full system information
- `/health/metrics` - Prometheus-compatible metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For issues or questions, please create an issue in the repository.

## 🙏 Acknowledgments

- Big Five Inventory (BFI-2) for personality assessment framework
- ASRS-5, AQ-10, PHQ-2, GAD-2 for clinical screening instruments
- MongoDB for privacy-focused data persistence
- Express.js for robust API framework
