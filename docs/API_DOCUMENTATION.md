# Neurlyn API Documentation

## Base URL

- Development: `http://localhost:3002/api`
- Production: `https://api.neurlyn.com/api`

## Authentication

Currently using session-based authentication. JWT implementation available.

## Endpoints

### 1. Adaptive Assessment

#### Generate Adaptive Assessment

```
POST /api/assessments/adaptive
```

Creates a personalized adaptive assessment based on user profile.

**Request Body:**

```json
{
  "tier": "standard", // "quick" | "standard" | "deep"
  "concerns": ["adhd", "autism"], // Array of concerns
  "demographics": {
    "age": 28,
    "gender": "female", // "male" | "female" | "non-binary" | "other"
    "culture": "western",
    "education": "graduate"
  },
  "previousAssessments": [] // Optional: previous assessment IDs
}
```

**Response:**

```json
{
  "success": true,
  "questions": [
    {
      "_id": "questionId",
      "questionId": "STD_OPENNESS_1",
      "text": "When I discover a hidden path while walking...",
      "category": "personality",
      "subcategory": "openness",
      "responseType": "likert",
      "options": [
        { "value": 1, "label": "Strongly Disagree", "score": 1 },
        { "value": 2, "label": "Disagree", "score": 2 },
        { "value": 3, "label": "Neutral", "score": 3 },
        { "value": 4, "label": "Agree", "score": 4 },
        { "value": 5, "label": "Strongly Agree", "score": 5 }
      ],
      "metadata": {
        "order": 1,
        "pathway": "general",
        "priority": 50,
        "responseTracking": {
          "expectedTime": 5000,
          "behaviorMarkers": ["openness", "exploration"]
        }
      }
    }
  ],
  "totalQuestions": 45,
  "tier": "standard",
  "adaptiveMetadata": {
    "pathways": ["adhd", "autism"],
    "primaryConcerns": ["adhd", "autism"],
    "adaptationStrategy": "comprehensive_neurodivergent"
  }
}
```

---

### 2. Assessment Management

#### Start Assessment Session

```
POST /api/assessment/start
```

**Request Body:**

```json
{
  "mode": "adaptive",
  "tier": "standard"
}
```

**Response:**

```json
{
  "sessionId": "unique-session-id",
  "assessmentId": "assessment-id",
  "status": "in_progress"
}
```

---

#### Submit Response

```
POST /api/assessment/response
```

**Request Body:**

```json
{
  "sessionId": "unique-session-id",
  "questionId": "question-id",
  "response": {
    "value": 4,
    "score": 4,
    "responseTime": 3500
  }
}
```

**Response:**

```json
{
  "success": true,
  "nextQuestion": {
    /* question object */
  },
  "progress": {
    "answered": 15,
    "total": 45,
    "percentage": 33
  }
}
```

---

#### Get Assessment Status

```
GET /api/assessment/:sessionId
```

**Response:**

```json
{
  "sessionId": "unique-session-id",
  "status": "in_progress",
  "progress": {
    "answered": 20,
    "total": 45,
    "percentage": 44
  },
  "startTime": "2024-01-01T10:00:00Z",
  "lastActivity": "2024-01-01T10:15:00Z"
}
```

---

#### Complete Assessment

```
POST /api/assessment/complete
```

**Request Body:**

```json
{
  "sessionId": "unique-session-id"
}
```

**Response:**

```json
{
  "success": true,
  "assessmentId": "assessment-id",
  "reportAvailable": true,
  "paymentRequired": false
}
```

---

### 3. Report Generation

#### Get Assessment Report

```
GET /api/report/:sessionId
```

**Response:**

```json
{
  "success": true,
  "report": {
    "meta": {
      "assessmentDate": "2024-01-01T10:30:00Z",
      "assessmentType": "standard",
      "totalQuestions": 45,
      "completionTime": "12 minutes",
      "responseConsistency": "High",
      "engagementLevel": "Engaged",
      "confidenceLevel": "High"
    },
    "executiveSummary": {
      "headline": "The Creative Innovator: Original Thinking and Unique Perspective",
      "coreIdentity": "You are a creative and intuitive thinker...",
      "keyStrengths": ["Creative problem-solving", "Pattern recognition", "Deep focus"],
      "growthAreas": ["Time management", "Task initiation"],
      "uniqueQualities": ["Ability to see connections others miss"],
      "narrative": "Your assessment reveals a rich and complex personality..."
    },
    "personalityProfile": {
      "openness": 4.2,
      "conscientiousness": 3.1,
      "extraversion": 2.8,
      "agreeableness": 3.9,
      "neuroticism": 3.5
    },
    "neurodiversityInsights": {
      "adhd": {
        "presence": 0.7,
        "primaryTraits": ["hyperfocus", "time_blindness"],
        "superpowers": ["Crisis management", "Creative thinking"],
        "supportStrategies": ["External structure", "Visual reminders"]
      },
      "autism": {
        "presence": 0.4,
        "primaryTraits": ["pattern_recognition", "detail_focus"],
        "superpowers": ["Systematic thinking", "Deep expertise"],
        "supportStrategies": ["Predictable routines", "Sensory accommodations"]
      }
    },
    "hiddenStrengths": [
      {
        "strength": "Adaptive Problem-Solving",
        "description": "You've developed creative workarounds...",
        "development": "These skills can be systematic strengths"
      }
    ],
    "personalizedStrategies": {
      "daily": [
        {
          "strategy": "Morning Brain Dump",
          "description": "Start each day by writing all thoughts...",
          "benefit": "Reduces mental clutter"
        }
      ],
      "environmental": [
        {
          "strategy": "Sensory Sanctuary",
          "description": "Create a low-stimulation space",
          "items": ["Soft lighting", "Noise-canceling headphones"]
        }
      ]
    }
  }
}
```

---

### 4. Analytics

#### Get Population Analytics

```
GET /api/analytics/population
```

**Response:**

```json
{
  "totalAssessments": 1542,
  "byMode": [
    {
      "_id": "adaptive",
      "count": 892,
      "avgConfidence": 0.82,
      "avgCompletionTime": 720000
    }
  ],
  "demographics": [
    {
      "_id": {
        "ageGroup": "25-34",
        "gender": "female",
        "country": "US"
      },
      "count": 234
    }
  ]
}
```

---

### 5. Payment Integration

#### Create Payment Session

```
POST /api/payment/session
```

**Request Body:**

```json
{
  "sessionId": "assessment-session-id"
}
```

**Response:**

```json
{
  "checkoutUrl": "https://checkout.stripe.com/...",
  "sessionId": "stripe-session-id"
}
```

---

#### Stripe Webhook

```
POST /api/webhook/stripe
```

Handles Stripe payment confirmations (webhook endpoint).

---

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional error details"
}
```

Common error codes:

- `SESSION_NOT_FOUND` - Invalid or expired session
- `VALIDATION_ERROR` - Invalid request parameters
- `DATABASE_ERROR` - Database operation failed
- `PAYMENT_REQUIRED` - Payment needed to access resource
- `RATE_LIMITED` - Too many requests

## Rate Limiting

- Default: 100 requests per 15 minutes per IP
- Assessment endpoints: 50 requests per 15 minutes per session

## Response Headers

All responses include:

```
Content-Type: application/json
X-Request-ID: unique-request-id
X-Response-Time: 123ms
```

## WebSocket Events (Future)

Planned real-time events:

- `assessment.progress` - Progress updates
- `assessment.complete` - Assessment completed
- `report.ready` - Report generation complete
