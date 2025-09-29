# Neurlyn Assessment Architecture Overview

## Last Updated: September 28, 2025

## System Architecture

### Current State

The Neurlyn platform provides an adaptive personality assessment system with clear separation between free and paid tiers. The system uses a two-phase approach: baseline questions followed by adaptive questions tailored to the user's responses.

## Recent Updates (September 2025)

### Initial Refactoring (September 27, 2025)

1. **Created Clear Folder Structure**
   - `/assessments/free/` - Free assessment components
   - `/assessments/paid/` - Future paid assessment (placeholder)
   - `/assessments/shared/` - Shared components (api-client.js)
   - `/config/` - Configuration files

2. **Removed Confusing Fallback Code**
   - Cleaned up `/js/neurlyn-adaptive-integration.js`
   - API client is now required (no fallbacks to mock data)
   - Clear error handling instead of silent fallbacks

3. **Added Configuration Management**
   - `/config/assessment-config.js` defines both tiers:
     - FREE: 30 questions (10 baseline + 20 adaptive)
     - PAID: 70 questions (20 baseline + 50 adaptive)
   - Centralized feature flags and settings

4. **Updated API Endpoints**
   - Added `/api/assessments/free/*` endpoints
   - Maintains `/api/assessments/adaptive/*` for backward compatibility
   - Free endpoints enforce `tier: 'standard'`

## Assessment Flow

### 1. User Journey

```
Landing Page (index.html)
    ↓
Free Assessment Page (free-assessment.html)
    ↓
Initialize Assessment (NeurlynAdaptiveAssessment)
    ↓
Phase 1: Baseline Questions (10 questions)
    ↓
Phase 2: Adaptive Questions (20 questions, based on baseline)
    ↓
Report Generation (AdvancedReportGenerator)
    ↓
Report Display (ReportDisplayComponent)
```

### 2. Technical Flow

#### Frontend Components

- **free-assessment.html**: Main assessment page
- **neurlyn-adaptive-integration.js**: Core assessment controller
- **api-client.js**: Handles all API communication
- **advanced-report-generator.js**: Creates comprehensive reports
- **report-display-component.js**: Renders reports with charts

#### Backend Endpoints

```javascript
// Free Assessment Endpoints
POST / api / assessments / free / start;
POST / api / assessments / free / baseline - complete;
POST / api / assessments / free / next - question;
POST / api / assessments / free / complete;

// Each endpoint delegates to the adaptive handlers
// but enforces tier: 'standard' for free assessments
```

### 3. Data Flow

#### Session Initialization

```javascript
// Request
{
  tier: 'standard',
  concerns: [],
  demographics: {}
}

// Response
{
  sessionId: 'session_xxx',
  phase: 'baseline',
  questions: [...], // 10 baseline questions
  totalQuestions: 30
}
```

#### Baseline Completion

```javascript
// Request
{
  sessionId: 'session_xxx',
  baselineResponses: [
    {
      questionId: 'BFI_OPENNESS_1',
      response: 4,
      responseTime: 3500
    }
    // ... 9 more responses
  ]
}

// Response
{
  phase: 'adaptive',
  profile: {
    traits: {
      openness: 72,
      conscientiousness: 45,
      extraversion: 60,
      agreeableness: 55,
      neuroticism: 38
    }
  },
  adaptiveQuestions: [...] // 20 questions selected based on profile
}
```

## Key Components

### 1. Question Selection Algorithm

Located in `/models/QuestionBank.js`:

- **Baseline Questions**: Selected by `baselinePriority` field
- **Adaptive Questions**: Selected based on trait extremes
  - High traits (>70): Focus questions for high scorers
  - Low traits (<30): Focus questions for low scorers
  - Middle traits: Balance questions

### 2. Report Generation (Enhanced September 28, 2025)

The `ComprehensiveReportGenerator` now fully utilizes all available engines:

#### Frontend Report Generation (`AdvancedReportGenerator`):

- **Personality Profile**: Big Five traits with percentiles
- **Archetypes**: Based on trait combinations
- **Behavioral Insights**: Derived from response patterns
- **Growth Recommendations**: Personalized suggestions
- **Population Comparisons**: Statistical percentiles
- **Visual Elements**: SVG charts and progress bars

#### Backend Report Generation (`ComprehensiveReportGenerator`):

**Now Enhanced with Full Engine Integration:**

- **ExplanationEngine**: Provides detailed reasoning for trait scores
- **EnhancedTraitAnalyzer**: Calculates sub-dimensions and confidence intervals
- **InsightTracker**: Tracks response patterns for deeper insights
- **NarrativeGenerator**: Creates compelling narrative descriptions
- **StatisticalAnalyzer**: Performs advanced statistical analysis
- **NeurodiversityScoring**: Comprehensive ADHD/Autism screening

**New Visualization Data Structures:**

- Radar charts for Big Five comparison
- Sub-dimension bar charts
- Response timeline analysis
- Trait interaction heatmaps
- Neurodiversity gauge charts
- Cognitive style distributions

**Enhanced Cognitive Analysis:**

- Processing modes (Intuitive-Creative, Systematic-Sequential, etc.)
- Decision styles (Collaborative, Analytical, Intuitive)
- Learning preferences with multiple dimensions
- Cognitive strengths identification
- Problem-solving approach determination

### 3. Response Quality Assessment

`/js/response-quality-assessor.js` monitors:

- Response time patterns
- Consistency checking
- Straight-lining detection
- Random response detection

## Database Schema

### Key Collections

1. **questions**: Master question bank
   - Contains 218 validated questions (as of Sept 28, 2025)
   - Tagged by trait, category, tier
   - 100% of adaptive questions have criteria
   - Standardized ID format: CATEGORY*SUBCODE*###

2. **assessmentsessions**: Active sessions
   - Tracks progress through assessment
   - Stores baseline and adaptive responses
   - Maintains user profile

3. **assessments**: Completed assessments
   - Final reports and analyses
   - Historical data for research

## Testing Infrastructure

### Test Suites

- **comprehensive-test-suite.html**: Tests multiple personality patterns
- **E2E tests**: Playwright tests for full user journey
- **API tests**: Direct endpoint testing

### Test Patterns Used

1. High Openness Profile
2. Low Conscientiousness Profile
3. High Extraversion Profile
4. Balanced Profile
5. Extreme Mixed Profile

## Configuration Details

### Free Assessment (Current)

```javascript
{
  name: 'Free Assessment',
  baselineQuestions: 10,
  adaptiveQuestions: 20,
  totalQuestions: 30,
  reportDepth: 'standard',
  features: [
    'basic_traits',
    'personality_archetype',
    'key_insights',
    'basic_recommendations'
  ]
}
```

### Paid Assessment (Comprehensive - Fully Enhanced)

```javascript
{
  name: 'Comprehensive Assessment',
  baselineQuestions: 20,
  adaptiveQuestions: 50,
  totalQuestions: 70,
  reportDepth: 'comprehensive',
  features: [
    'detailed_traits',
    'sub_dimensions',
    'cognitive_profile',
    'emotional_profile',
    'career_insights',
    'relationship_insights',
    'neurodiversity_screening',
    'behavioral_fingerprint',
    // New enhanced features:
    'trait_explanations',
    'confidence_intervals',
    'pattern_tracking',
    'statistical_analysis',
    'narrative_sections',
    'visualization_data',
    'response_quality_assessment',
    'cognitive_style_analysis',
    'problem_solving_profiling'
  ]
}
```

## Important Files Reference

### Core Assessment Files

- `/js/neurlyn-adaptive-integration.js` - Main assessment controller
- `/js/api-client.js` - API communication layer
- `/js/advanced-report-generator.js` - Report generation
- `/js/report-display-component.js` - Report rendering

### Configuration

- `/config/assessment-config.js` - Tier configurations
- `/backend.js` - Express server with all endpoints

### Models

- `/models/QuestionBank.js` - Question selection logic
- `/models/AssessmentSession.js` - Session management
- `/models/Assessment.js` - Assessment storage

### Services

- `/services/adaptive-assessment-engine.js` - Core assessment logic
- `/services/comprehensive-report-generator.js` - Enhanced backend report generation with full engine integration
- `/services/narrative-generator.js` - Narrative text generation
- `/services/neurodiversity-scoring.js` - ADHD/Autism screening analysis
- `/services/statistical-analyzer.js` - Advanced statistical analysis

### Supporting Engines (Frontend/Backend Compatible)

- `/js/explanation-engine.js` - Generates detailed explanations for trait scores
- `/js/enhanced-trait-analyzer.js` - Calculates sub-dimensions and confidence intervals
- `/js/insight-tracker.js` - Tracks patterns across responses
- `/js/response-quality-assessor.js` - Assesses response quality and flags issues

## Environment Setup

### Required Services

- MongoDB (localhost:27017/neurlyn-test)
- Node.js backend (PORT=3008)
- Python HTTP server for frontend (port 8080)

### Environment Variables

```bash
NODE_ENV=development
PORT=3008
MONGODB_URI=mongodb://localhost:27017/neurlyn-test
JWT_SECRET=test-secret-key-for-testing-purposes-only-32chars
```

## Known Issues & TODOs

### Current Issues

- One TODO in advanced-report-generator.js about confidence bands
- One TODO in reports route for PDF generation

### Future Enhancements

1. Complete paid assessment implementation
2. Add confidence bands to statistical analysis
3. Implement full neurodiversity screening
4. Add behavioral fingerprinting
5. Enhance career and relationship insights

## Database Optimization (September 28, 2025)

### Major Database Improvements

1. **Complete QuestionBank Reorganization**
   - Removed all duplicate questions
   - Standardized question IDs from 116 patterns to 54
   - Set 30 baseline questions with proper priorities
   - Added comprehensive adaptive criteria to 100% of adaptive questions
   - Full metadata coverage for all questions

2. **New Question ID Standard**
   - Format: `CATEGORY_SUBCODE_###`
   - Examples:
     - `BFI_OPEN_001` - Personality openness
     - `NDV_EXEC_001` - Neurodiversity executive function
     - `COG_SPAT_001` - Cognitive spatial reasoning
   - See `/scripts/QUESTION_ID_STANDARD.md` for full documentation

3. **Database Health Metrics**
   - Health Score: 94% (Excellent)
   - Total Questions: 218
   - Baseline Questions: 30
   - Adaptive Questions: 188 (100% with criteria)
   - Categories: 8 well-distributed
   - No duplicate questions

4. **Category Distribution**
   - Neurodiversity: 86 (39%)
   - Personality: 61 (28%)
   - Enneagram: 18 (8%)
   - Cognitive Functions: 16 (7%)
   - Trauma Screening: 12 (6%)
   - Attachment: 12 (6%)
   - Learning Style: 8 (4%)
   - Cognitive: 5 (2%)

5. **Maintenance Scripts Created**
   - `deep-questionbank-analysis.js` - Database health analysis
   - `reorganize-questionbank.js` - Complete reorganization
   - `standardize-question-ids.js` - ID standardization
   - `fix-adaptive-criteria.js` - Adaptive criteria fixes
   - `verify-questionbank-health.js` - Health verification
   - `test-new-ids.js` - System testing

## Development Notes

### When Adding New Questions

1. Follow the standardized ID format in `/scripts/QUESTION_ID_STANDARD.md`
2. Ensure proper adaptive criteria are set
3. Include all required metadata fields
4. Test with `verify-questionbank-health.js`

### When Adding New Features

1. Update `/config/assessment-config.js` with new settings
2. Add endpoints to both `/api/assessments/free/` and `/api/assessments/paid/`
3. Update report generator to handle new data
4. Add tests to comprehensive test suite

### Testing Checklist

- [ ] Free assessment flow works end-to-end
- [ ] Adaptive questions vary based on baseline
- [ ] Reports generate correctly for all trait patterns
- [ ] API endpoints return expected data
- [ ] Error handling works properly

## API Response Formats

### Success Response

```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "message": "User-friendly error description"
}
```

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Metrics

- Average assessment completion: 12-15 minutes
- API response time: <200ms
- Report generation: <2 seconds
- Questions per minute: 2-3

---

This document provides a complete overview of the Neurlyn assessment system architecture as of September 2025, following the recent refactoring to separate free and paid assessment tiers.
