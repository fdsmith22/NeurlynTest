# Neurlyn API Reference

## Base URL
```
Development: http://localhost:3000
Production: https://your-domain.com
```

## Authentication
Currently, the API uses session-based authentication. JWT authentication is prepared for future implementation.

## Endpoints

### Health Check

#### GET /health
Check if the backend service is running.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-09-20T17:46:32.654Z",
  "service": "neurlyn-backend",
  "version": "1.0.0"
}
```

---

### Questions API

#### GET /api/questions/stats
Get statistics about questions in the database.

**Response:**
```json
{
  "totalQuestions": 295,
  "categoriesCount": 15,
  "subcategoriesCount": 42,
  "lastUpdated": "2025-09-20T10:30:00Z"
}
```

---

#### GET /api/questions/assessment/neurodiversity
Get neurodiversity assessment questions.

**Query Parameters:**
- `tier` (string, required): Assessment tier - `basic`, `quick`, `core`, `comprehensive`, `specialized`, `experimental`
- `category` (string, optional): Specific category - `executive_function`, `social_processing`, etc.
- `complexity` (string, optional): Question complexity - `low`, `medium`, `high`
- `limit` (number, optional): Number of questions to return (default: 20)

**Response:**
```json
{
  "success": true,
  "questions": [
    {
      "id": "q_001",
      "category": "executive_function",
      "subcategory": "planning",
      "question": "How often do you create detailed plans before starting tasks?",
      "type": "likert",
      "options": ["Never", "Rarely", "Sometimes", "Often", "Always"],
      "complexity": "low",
      "validated": true
    }
  ],
  "metadata": {
    "tier": "basic",
    "count": 5,
    "timestamp": "2025-09-20T10:30:00Z"
  }
}
```

---

#### GET /api/questions/assessment/personality
Get personality assessment questions.

**Query Parameters:**
- `tier` (string, required): Assessment tier
- `trait` (string, optional): Specific personality trait
- `limit` (number, optional): Number of questions (default: 20)

**Response:**
```json
{
  "success": true,
  "questions": [
    {
      "id": "p_001",
      "category": "personality",
      "trait": "openness",
      "question": "I enjoy exploring new ideas and concepts",
      "type": "likert",
      "scale": 5
    }
  ],
  "metadata": {
    "tier": "core",
    "count": 10
  }
}
```

---

### Assessment API

#### POST /api/assessments/start
Start a new assessment session.

**Request Body:**
```json
{
  "mode": "adaptive",
  "tier": "basic",
  "userId": "optional_user_id"
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "sess_abc123",
  "assessmentId": "assess_xyz789",
  "nextQuestions": [],
  "progress": 0
}
```

---

#### POST /api/assessments/:sessionId/submit
Submit answers for an assessment.

**Request Body:**
```json
{
  "responses": [
    {
      "questionId": "q_001",
      "value": 3,
      "responseTime": 2500
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "progress": 25,
  "nextQuestions": [],
  "isComplete": false
}
```

---

#### GET /api/assessments/:sessionId/results
Get assessment results.

**Response:**
```json
{
  "success": true,
  "results": {
    "profile": {
      "neurodiversity": {
        "adhd_likelihood": 0.65,
        "autism_traits": 0.42,
        "dyslexia_indicators": 0.18
      },
      "personality": {
        "openness": 0.75,
        "conscientiousness": 0.60,
        "extraversion": 0.45,
        "agreeableness": 0.70,
        "neuroticism": 0.35
      }
    },
    "recommendations": [],
    "confidence": 0.82
  }
}
```

---

### Payment API

#### POST /api/payment/create-session
Create a Stripe checkout session.

**Request Body:**
```json
{
  "tier": "comprehensive",
  "sessionId": "sess_abc123"
}
```

**Response:**
```json
{
  "success": true,
  "checkoutUrl": "https://checkout.stripe.com/...",
  "sessionId": "cs_test_..."
}
```

---

#### POST /api/webhook/stripe
Stripe webhook endpoint for payment confirmations.

**Headers:**
- `stripe-signature`: Stripe webhook signature

**Note:** This endpoint is called directly by Stripe.

---

### Reports API

#### GET /api/reports/:assessmentId
Get detailed assessment report.

**Response:**
```json
{
  "success": true,
  "report": {
    "assessmentId": "assess_xyz789",
    "generatedAt": "2025-09-20T10:30:00Z",
    "sections": {
      "executive_summary": {},
      "detailed_analysis": {},
      "recommendations": {},
      "visualizations": {}
    }
  }
}
```

---

#### GET /api/reports/:assessmentId/pdf
Download assessment report as PDF.

**Response:** PDF file download

---

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Error Codes
- `VALIDATION_ERROR` - Invalid request parameters
- `NOT_FOUND` - Resource not found
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `RATE_LIMITED` - Too many requests
- `INTERNAL_ERROR` - Server error

## Rate Limiting

- Rate limit: 100 requests per 15 minutes per IP
- Headers returned:
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset timestamp

## Testing

### Example cURL Commands

```bash
# Health check
curl http://localhost:3000/health

# Get questions stats
curl http://localhost:3000/api/questions/stats

# Get neurodiversity questions
curl "http://localhost:3000/api/questions/assessment/neurodiversity?tier=basic&limit=5"

# Get personality questions
curl "http://localhost:3000/api/questions/assessment/personality?tier=core&limit=10"
```

## WebSocket Events (Future)

Planned for real-time assessment updates:
- `assessment:progress` - Progress updates
- `assessment:complete` - Assessment completed
- `question:next` - Next question available

## SDK Examples

### JavaScript/TypeScript
```javascript
class NeurlynAPI {
  constructor(baseURL = 'http://localhost:3000') {
    this.baseURL = baseURL;
  }

  async getHealth() {
    const response = await fetch(`${this.baseURL}/health`);
    return response.json();
  }

  async getQuestions(type, tier, options = {}) {
    const params = new URLSearchParams({ tier, ...options });
    const response = await fetch(
      `${this.baseURL}/api/questions/assessment/${type}?${params}`
    );
    return response.json();
  }
}

// Usage
const api = new NeurlynAPI();
const questions = await api.getQuestions('neurodiversity', 'basic', { limit: 5 });
```

### Python
```python
import requests

class NeurlynAPI:
    def __init__(self, base_url='http://localhost:3000'):
        self.base_url = base_url

    def get_health(self):
        return requests.get(f'{self.base_url}/health').json()

    def get_questions(self, assessment_type, tier, **options):
        params = {'tier': tier, **options}
        response = requests.get(
            f'{self.base_url}/api/questions/assessment/{assessment_type}',
            params=params
        )
        return response.json()

# Usage
api = NeurlynAPI()
questions = api.get_questions('neurodiversity', 'basic', limit=5)
```

## Changelog

### Version 1.0.0
- Initial API release
- Basic assessment endpoints
- Question retrieval system
- Payment integration
- Health monitoring