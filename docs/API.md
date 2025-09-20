# Neurlyn API Documentation

## Base URL

```
http://localhost:3000/api
```

## Authentication

Currently, the API does not require authentication for question retrieval endpoints. Payment and session management endpoints will require JWT tokens (to be implemented).

## Response Format

All API responses follow this structure:

```json
{
  "success": true|false,
  "data": { ... } | null,
  "error": "error message" | null
}
```

---

## Endpoints

### 1. Health Checks

#### GET /health

Basic health check endpoint.

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-17T12:00:00.000Z"
}
```

#### GET /health/ready

Checks if the service is ready to accept requests (including database connectivity).

**Response:**

```json
{
  "status": "ready",
  "database": "connected",
  "timestamp": "2024-01-17T12:00:00.000Z"
}
```

#### GET /health/detailed

Provides detailed system information.

**Response:**

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "environment": "development",
  "uptime": 3600,
  "memory": {
    "rss": 123456789,
    "heapTotal": 123456789,
    "heapUsed": 123456789,
    "external": 123456789
  },
  "database": {
    "status": "connected",
    "host": "localhost:27017"
  }
}
```

#### GET /health/metrics

Prometheus-compatible metrics endpoint.

**Response:**

```
# HELP neurlyn_http_requests_total Total number of HTTP requests
# TYPE neurlyn_http_requests_total counter
neurlyn_http_requests_total 1234

# HELP neurlyn_active_connections Number of active connections
# TYPE neurlyn_active_connections gauge
neurlyn_active_connections 5
```

---

### 2. Questions API

#### GET /api/questions/assessment/:type

Retrieves questions based on assessment type.

**Parameters:**

- `type` (path): Assessment type
  - `personality` - Big Five personality questions
  - `neurodiversity` - ADHD, Autism, Depression, Anxiety screening
  - `lateral` - Lateral thinking questions
  - `cognitive` - Cognitive assessment questions
  - `comprehensive` - All categories combined

**Query Parameters:**

- `tier` (optional): Filter by tier
  - `free` - Free tier questions only
  - `core` - Free + Core tier questions
  - `comprehensive` - Free + Core + Comprehensive
  - `specialized` - All tiers
  - Default: `free`
- `limit` (optional): Maximum number of questions to return
  - Type: Integer
  - Range: 1-200
- `randomize` (optional): Randomize question order
  - Type: Boolean
  - Default: `true`

**Example Request:**

```bash
GET /api/questions/assessment/personality?tier=core&limit=20&randomize=true
```

**Response:**

```json
{
  "success": true,
  "assessmentType": "personality",
  "tier": "core",
  "totalQuestions": 20,
  "questions": [
    {
      "questionId": "STD_OPENNESS_1",
      "text": "When I discover a hidden path while walking, I usually take it to see where it leads",
      "category": "personality",
      "instrument": "BFI-2-Extended",
      "trait": "openness",
      "responseType": "likert",
      "options": [
        { "value": 1, "label": "Strongly Disagree", "score": 1 },
        { "value": 2, "label": "Disagree", "score": 2 },
        { "value": 3, "label": "Neutral", "score": 3 },
        { "value": 4, "label": "Agree", "score": 4 },
        { "value": 5, "label": "Strongly Agree", "score": 5 }
      ],
      "reverseScored": false,
      "weight": 1,
      "tier": "free",
      "active": true
    }
    // ... more questions
  ],
  "traitBreakdown": {
    "openness": 4,
    "conscientiousness": 4,
    "extraversion": 4,
    "agreeableness": 4,
    "neuroticism": 4
  }
}
```

#### GET /api/questions/by-instrument/:instrument

Retrieves questions for a specific assessment instrument.

**Parameters:**

- `instrument` (path): Instrument identifier
  - `BFI-2-Extended` - Big Five Inventory Extended
  - `ASRS-5` - ADHD Self-Report Scale
  - `AQ-10` - Autism Spectrum Quotient
  - `PHQ-2` - Patient Health Questionnaire (Depression)
  - `GAD-2` - Generalized Anxiety Disorder scale
  - `LATERAL_THINKING` - Lateral thinking assessment
  - `PATTERN_RECOGNITION` - Pattern recognition test
  - `WORD_ASSOCIATION` - Word association test

**Example Request:**

```bash
GET /api/questions/by-instrument/ASRS-5
```

**Response:**

```json
{
  "success": true,
  "instrument": "ASRS-5",
  "totalQuestions": 5,
  "questions": [
    {
      "questionId": "ASRS_1",
      "text": "How often do you have difficulty concentrating on what people say to you?",
      "category": "neurodiversity",
      "instrument": "ASRS-5",
      "trait": "adhd",
      "responseType": "likert",
      "options": [
        { "value": 0, "label": "Never", "score": 0 },
        { "value": 1, "label": "Rarely", "score": 1 },
        { "value": 2, "label": "Sometimes", "score": 2 },
        { "value": 3, "label": "Often", "score": 3 },
        { "value": 4, "label": "Very Often", "score": 4 }
      ],
      "tier": "core",
      "active": true
    }
    // ... more questions
  ]
}
```

#### GET /api/questions/stats

Returns statistics about available questions in the database.

**Example Request:**

```bash
GET /api/questions/stats
```

**Response:**

```json
{
  "success": true,
  "totalQuestions": 104,
  "categoryBreakdown": [
    {
      "_id": {
        "category": "personality",
        "tier": "free"
      },
      "count": 61,
      "instruments": ["BFI-2-Extended"]
    },
    {
      "_id": {
        "category": "neurodiversity",
        "tier": "core"
      },
      "count": 19,
      "instruments": ["ASRS-5", "AQ-10", "PHQ-2", "GAD-2"]
    },
    {
      "_id": {
        "category": "lateral",
        "tier": "comprehensive"
      },
      "count": 22,
      "instruments": ["LATERAL_THINKING"]
    },
    {
      "_id": {
        "category": "cognitive",
        "tier": "comprehensive"
      },
      "count": 2,
      "instruments": ["PATTERN_RECOGNITION", "WORD_ASSOCIATION"]
    }
  ],
  "instrumentBreakdown": [
    {
      "_id": "BFI-2-Extended",
      "count": 61,
      "categories": ["personality"]
    },
    {
      "_id": "ASRS-5",
      "count": 5,
      "categories": ["neurodiversity"]
    },
    {
      "_id": "AQ-10",
      "count": 10,
      "categories": ["neurodiversity"]
    }
    // ... more instruments
  ]
}
```

---

## Error Responses

### 400 Bad Request

Returned when the request parameters are invalid.

```json
{
  "success": false,
  "error": "Invalid assessment type. Valid types: personality, neurodiversity, lateral, cognitive, comprehensive"
}
```

### 404 Not Found

Returned when no questions are found for the specified criteria.

```json
{
  "success": false,
  "error": "No questions found for the specified criteria"
}
```

### 500 Internal Server Error

Returned when there's a server error.

```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Rate Limiting

API endpoints are rate-limited to:

- 100 requests per 15 minutes per IP address
- Rate limit headers are included in responses:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Time when the rate limit resets

---

## Question Object Schema

```typescript
interface Question {
  questionId: string; // Unique identifier
  text: string; // Question text
  category: 'personality' | 'neurodiversity' | 'lateral' | 'cognitive';
  instrument: string; // Assessment instrument name
  trait?: string; // Personality trait or condition
  responseType: 'likert' | 'multiple-choice' | 'binary' | 'slider' | 'ranking' | 'word-association';
  options?: Array<{
    value: number | string;
    label: string;
    score: number;
  }>;
  reverseScored?: boolean; // If scoring should be reversed
  weight?: number; // Question weight in scoring
  tier: 'free' | 'core' | 'comprehensive' | 'specialized';
  interactiveElements?: {
    hasTimer?: boolean;
    timeLimit?: number; // Seconds
    hasVisual?: boolean;
    visualType?: string;
    gamificationPoints?: number;
  };
  measures?: string[]; // For lateral thinking questions
  active: boolean; // Whether question is active
}
```

---

## Testing the API

### Using curl

```bash
# Get personality questions
curl http://localhost:3000/api/questions/assessment/personality

# Get neurodiversity screening with limit
curl "http://localhost:3000/api/questions/assessment/neurodiversity?limit=10"

# Get comprehensive assessment without randomization
curl "http://localhost:3000/api/questions/assessment/comprehensive?randomize=false"

# Get ADHD screening questions
curl http://localhost:3000/api/questions/by-instrument/ASRS-5

# Get statistics
curl http://localhost:3000/api/questions/stats
```

### Using the Test Script

```bash
npm run test:api
```

This will run comprehensive tests on all API endpoints and display the results.

---

## WebSocket Support (Future)

WebSocket connections will be available for real-time assessment tracking:

- Endpoint: `ws://localhost:3000/ws`
- Events: `progress`, `complete`, `timeout`, `save`

---

## Security Considerations

1. **No PII Storage**: The API never stores personally identifiable information
2. **Session Management**: All sessions auto-expire after 24 hours
3. **Input Validation**: All inputs are validated using Joi schemas
4. **Rate Limiting**: Prevents abuse through request throttling
5. **CORS**: Properly configured CORS headers
6. **Helmet**: Security headers for protection against common attacks

---

## Support

For API issues or questions:

- Check the health endpoints first
- Review error messages in responses
- Check server logs for detailed error information
- Create an issue in the repository for bugs
