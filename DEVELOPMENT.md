# Neurlyn Development Guide

## Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/neurlyn.git
cd neurlyn

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development environment
./dev.sh start full
# OR use npm scripts
npm run dev:full
```

## Development Workflow

### Process Management

We use a custom `dev.sh` script to manage development processes and prevent duplicate instances:

```bash
# Clean all processes and start fresh
./dev.sh clean
./dev.sh start

# Check what's running
./dev.sh status

# Start specific services
./dev.sh start backend   # Backend only on port 3002
./dev.sh start frontend  # Frontend dev server
./dev.sh start full      # Both services (default)
```

### NPM Scripts

Convenient npm scripts are available for common tasks:

```bash
npm run dev:clean     # Kill all processes
npm run dev:backend   # Start backend only
npm run dev:frontend  # Start frontend only
npm run dev:full      # Start full stack
npm run dev:status    # Check running services
npm run check:ports   # Check port usage
```

### Environment Configuration

The application uses a centralized environment configuration system (`config/environment.js`):

- **Development**: `http://localhost:3002` (auto-detected)
- **Staging**: `https://staging.neurlyn.com`
- **Production**: `https://www.neurlyn.com`

Environment is automatically detected based on hostname. Override with `NODE_ENV` if needed.

## Project Structure

```
neurlyn/
├── backend.js              # Express server (port 3002)
├── index.html              # Main application entry
├── dev.sh                  # Process management script
├── config/
│   ├── environment.js      # Environment configuration
│   ├── database.js         # MongoDB configuration
│   └── jest.config.js      # Test configuration
├── js/
│   ├── neurlyn-adaptive-integration.js  # Adaptive assessment
│   ├── neurlyn-api-integrated.js        # API integration
│   └── services/           # Service modules
│       ├── error-handler.js
│       └── storage-service.js
├── styles/                 # CSS files
├── scripts/                # Utility scripts
└── .github/workflows/      # CI/CD pipelines
```

## JavaScript Architecture

The application uses three main JavaScript modules:

1. **neurlyn-adaptive-integration.js**: Handles adaptive assessment logic
2. **neurlyn-api-integrated.js**: Manages API communication
3. **neurlyn-integrated.js**: Core application initialization

## Testing

```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage

# Test API endpoints
npm run test:api

# Test assessment variations
node scripts/test-assessment-variations.js
```

## Code Quality

### Linting and Formatting

```bash
# Run linter
npm run lint

# Auto-fix lint issues
npm run lint:fix

# Check code formatting
npm run format:check

# Format code
npm run format
```

### Type Checking

```bash
npm run typecheck
```

### Pre-commit Checks

All quality checks run automatically before commit:

```bash
npm run precommit
```

## CI/CD Pipeline

### GitHub Actions Workflows

1. **Deploy Workflow** (`deploy.yml`)
   - Triggered on push to main
   - Runs tests and linting
   - Builds and deploys to GitHub Pages

2. **PR Checks** (`pr-checks.yml`)
   - Triggered on pull requests
   - Runs comprehensive quality checks
   - Integration tests with MongoDB
   - Performance testing with Lighthouse

### Local Build

```bash
# Production build
npm run build

# Development build
npm run build:dev

# Build with bundle analysis
npm run build:analyze
```

## Database Management

### Seeding Data

```bash
# Seed all questions (241+ questions)
npm run seed:all

# Basic seed data
npm run seed:basic

# Verify database setup
npm run verify
```

### MongoDB Connection

- Development: `mongodb://localhost:27017/neurlyn`
- Configure in `.env` file

## Common Issues & Solutions

### Port Already in Use

```bash
# Clean all processes
npm run dev:clean

# Check specific ports
npm run check:ports
```

### Multiple Backend Instances

The `dev.sh` script automatically kills duplicate processes before starting new ones.

### Assessment Not Loading

1. Ensure backend is running on port 3002
2. Check browser console for errors
3. Verify MongoDB connection

### API Errors

- Error handler automatically detects environment
- Development errors go to `http://localhost:3002/api/errors`
- Production errors go to configured endpoint

## Development Best Practices

1. **Always use the dev script** to start services to prevent duplicates
2. **Check port status** before starting development
3. **Run tests** before committing changes
4. **Use environment configuration** instead of hardcoding URLs
5. **Follow the existing code style** (enforced by ESLint/Prettier)

## Deployment

### Production Deployment

```bash
# Build for production
npm run build

# Deploy with PM2 (if configured)
npm run deploy
```

### Environment Variables

Required environment variables (see `.env.example`):

- `NODE_ENV`: development/staging/production
- `PORT`: Server port (default: 3002)
- `MONGODB_URI`: MongoDB connection string
- `STRIPE_SECRET_KEY`: Payment processing (production only)

## Additional Resources

- [API Documentation](./docs/API.md)
- [Assessment Question Bank](./exports/questions.md)
- [Troubleshooting Guide](./docs/TROUBLESHOOTING.md)

## Contributing

1. Create a feature branch
2. Make your changes
3. Run quality checks: `npm run precommit`
4. Submit a pull request
5. CI/CD will run automated checks

## Support

For issues or questions:

- Check existing [GitHub Issues](https://github.com/yourusername/neurlyn/issues)
- Review this documentation
- Contact the development team
