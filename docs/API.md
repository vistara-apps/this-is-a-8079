# Reddit Digest API Documentation

## Overview

The Reddit Digest API provides endpoints for managing user authentication, curation sessions, curated items, and AI-powered synthesis features. The API follows RESTful principles and uses JWT tokens for authentication.

**Base URL:** `http://localhost:3001/api`

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Authentication Endpoints

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "jwt-token-here",
  "user": {
    "userId": "user-id",
    "email": "user@example.com",
    "subscriptionTier": "free",
    "monthlyUsage": 0,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### POST /auth/login
Login with existing credentials.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": {
    "userId": "user-id",
    "email": "user@example.com",
    "subscriptionTier": "free",
    "monthlyUsage": 2,
    "lastLoginAt": "2024-01-01T12:00:00.000Z"
  }
}
```

#### GET /auth/me
Get current user profile.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "user": {
    "userId": "user-id",
    "email": "user@example.com",
    "subscriptionTier": "pro",
    "monthlyUsage": 15,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Curation Endpoints

### Sessions

#### POST /curation/sessions
Create a new curation session.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "My Reddit Digest Session",
  "description": "Curating insights about productivity tools",
  "tags": ["productivity", "tools", "development"]
}
```

**Response:**
```json
{
  "message": "Curation session created successfully",
  "session": {
    "sessionId": "session-id",
    "userId": "user-id",
    "title": "My Reddit Digest Session",
    "status": "active",
    "itemCount": 0,
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
}
```

#### GET /curation/sessions
Get user's curation sessions.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (optional): Filter by status (`active`, `completed`, `archived`)
- `limit` (optional): Number of sessions per page (default: 10)
- `page` (optional): Page number (default: 1)

**Response:**
```json
{
  "sessions": [
    {
      "sessionId": "session-id",
      "title": "My Reddit Digest Session",
      "status": "active",
      "itemCount": 5,
      "createdAt": "2024-01-01T12:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

#### GET /curation/sessions/:sessionId
Get specific curation session with items.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "session": {
    "sessionId": "session-id",
    "title": "My Reddit Digest Session",
    "status": "active",
    "itemCount": 2,
    "curatedItems": [
      {
        "itemId": "item-id",
        "text": "This is a great productivity tip...",
        "sourceUrl": "https://reddit.com/r/productivity/comments/abc123#def456",
        "threadTitle": "Best productivity tips for developers",
        "highlightedAt": "2024-01-01T12:30:00.000Z"
      }
    ]
  }
}
```

#### PUT /curation/sessions/:sessionId/complete
Complete a curation session.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "Session completed successfully",
  "session": {
    "sessionId": "session-id",
    "status": "completed",
    "completedAt": "2024-01-01T13:00:00.000Z"
  }
}
```

### Curated Items

#### POST /curation/items
Add a curated item to the active session.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "text": "This is an insightful comment about productivity tools and their impact on developer workflow.",
  "sourceUrl": "https://reddit.com/r/webdev/comments/abc123#def456",
  "threadTitle": "Best productivity apps for developers in 2024",
  "redditData": {
    "subreddit": "webdev",
    "postId": "abc123",
    "commentId": "def456",
    "author": "ProductivityGuru",
    "upvotes": 234
  }
}
```

**Response:**
```json
{
  "message": "Item curated successfully",
  "item": {
    "itemId": "item-id",
    "sessionId": "session-id",
    "text": "This is an insightful comment...",
    "sourceUrl": "https://reddit.com/r/webdev/comments/abc123#def456",
    "threadTitle": "Best productivity apps for developers in 2024",
    "redditData": {
      "subreddit": "webdev",
      "postId": "abc123",
      "commentId": "def456",
      "author": "ProductivityGuru"
    },
    "metadata": {
      "wordCount": 15
    },
    "highlightedAt": "2024-01-01T12:30:00.000Z"
  }
}
```

#### GET /curation/items
Get curated items for a session.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `sessionId` (required): Session ID to get items for

**Response:**
```json
{
  "items": [
    {
      "itemId": "item-id",
      "text": "This is an insightful comment...",
      "sourceUrl": "https://reddit.com/r/webdev/comments/abc123#def456",
      "threadTitle": "Best productivity apps for developers in 2024",
      "highlightedAt": "2024-01-01T12:30:00.000Z"
    }
  ]
}
```

#### DELETE /curation/items/:itemId
Delete a curated item.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "Item deleted successfully"
}
```

## Synthesis Endpoints (Pro Feature)

### POST /synthesis/analyze
Perform AI analysis and generate insights from curated items.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "sessionId": "session-id"
}
```

**Response:**
```json
{
  "message": "Synthesis completed successfully",
  "synthesis": {
    "sessionId": "session-id",
    "itemCount": 5,
    "themes": [
      {
        "name": "Productivity Tools",
        "relevance": 0.95,
        "itemCount": 4
      },
      {
        "name": "Developer Workflow",
        "relevance": 0.87,
        "itemCount": 3
      }
    ],
    "insights": [
      "The most prominent theme is \"Productivity Tools\" appearing in 4 items.",
      "Overall sentiment is positive, indicating favorable opinions and experiences.",
      "Content spans 2 different subreddits, showing diverse perspectives."
    ],
    "sentiment": "positive",
    "keyTopics": [
      {
        "name": "API Integration",
        "frequency": 3,
        "relevance": 0.89
      }
    ],
    "summary": "Analysis of 5 curated items revealed 2 key themes. The most prominent theme is \"Productivity Tools\" appearing in 4 items. The content provides valuable insights into community perspectives and best practices.",
    "generatedAt": "2024-01-01T13:00:00.000Z"
  }
}
```

### POST /synthesis/themes
Extract themes from curated items.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "sessionId": "session-id"
}
```

**Response:**
```json
{
  "message": "Theme extraction completed successfully",
  "themes": {
    "sessionId": "session-id",
    "itemCount": 5,
    "themes": [
      {
        "name": "Productivity Tools",
        "relevance": 0.95,
        "itemCount": 4
      }
    ],
    "extractedAt": "2024-01-01T13:00:00.000Z"
  }
}
```

### POST /synthesis/sentiment
Analyze sentiment of curated items.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "sessionId": "session-id"
}
```

**Response:**
```json
{
  "message": "Sentiment analysis completed successfully",
  "sentiment": {
    "sessionId": "session-id",
    "itemCount": 5,
    "overall": "positive",
    "distribution": {
      "positive": "60.0",
      "negative": "20.0",
      "neutral": "20.0"
    },
    "items": [
      {
        "itemId": "item-id",
        "sentiment": "positive",
        "confidence": 0.89
      }
    ],
    "analyzedAt": "2024-01-01T13:00:00.000Z"
  }
}
```

## User Management Endpoints

### GET /users/profile
Get user profile information.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "user": {
    "userId": "user-id",
    "email": "user@example.com",
    "subscriptionTier": "pro",
    "monthlyUsage": 15,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### POST /users/upgrade
Upgrade user to Pro subscription.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "Successfully upgraded to Pro subscription",
  "user": {
    "userId": "user-id",
    "subscriptionTier": "pro",
    "subscriptionStatus": "active"
  }
}
```

### GET /users/usage
Get user usage statistics.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "usage": {
    "current": 3,
    "limit": 5,
    "resetDate": "2024-02-01T00:00:00.000Z",
    "subscriptionTier": "free",
    "canCreateSession": true
  }
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Validation Error",
  "details": [
    {
      "field": "email",
      "message": "Please enter a valid email"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Access Denied",
  "message": "No token provided"
}
```

### 403 Forbidden
```json
{
  "error": "Pro Subscription Required",
  "message": "This feature requires a Pro subscription"
}
```

### 404 Not Found
```json
{
  "error": "Session Not Found",
  "message": "Curation session not found"
}
```

### 429 Too Many Requests
```json
{
  "error": "Usage Limit Exceeded",
  "message": "Free tier limit of 5 sessions per month reached. Upgrade to Pro for unlimited access.",
  "upgradeUrl": "/upgrade"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "Something went wrong"
}
```

## Rate Limiting

The API implements rate limiting to ensure fair usage:

- **General endpoints**: 100 requests per 15 minutes per IP
- **Authentication endpoints**: Additional rate limiting may apply
- **Synthesis endpoints**: Pro users have higher limits

## Data Models

### User
```typescript
interface User {
  userId: string;
  email: string;
  subscriptionTier: 'free' | 'pro';
  monthlyUsage: number;
  usageResetDate: string;
  subscriptionStatus: 'active' | 'canceled' | 'past_due' | 'unpaid';
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  isActive: boolean;
}
```

### CurationSession
```typescript
interface CurationSession {
  sessionId: string;
  userId: string;
  status: 'active' | 'completed' | 'archived';
  title?: string;
  description?: string;
  tags: string[];
  itemCount: number;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

### CuratedItem
```typescript
interface CuratedItem {
  itemId: string;
  sessionId: string;
  text: string;
  sourceUrl: string;
  threadTitle?: string;
  redditData: {
    subreddit?: string;
    postId?: string;
    commentId?: string;
    author?: string;
    upvotes?: number;
  };
  metadata: {
    wordCount: number;
    sentiment?: 'positive' | 'negative' | 'neutral';
    topics: string[];
    extractedAt: string;
  };
  highlightedAt: string;
  createdAt: string;
  updatedAt: string;
}
```

## SDK and Integration

### JavaScript/TypeScript SDK

```javascript
import { RedditDigestAPI } from 'reddit-digest-sdk';

const api = new RedditDigestAPI({
  baseUrl: 'http://localhost:3001/api',
  token: 'your-jwt-token'
});

// Create a session
const session = await api.curation.createSession({
  title: 'My Digest Session'
});

// Add curated item
const item = await api.curation.addItem({
  text: 'Insightful comment text...',
  sourceUrl: 'https://reddit.com/r/webdev/comments/abc123',
  threadTitle: 'Thread title'
});

// Generate insights (Pro feature)
const insights = await api.synthesis.analyze({
  sessionId: session.sessionId
});
```

### Browser Extension Integration

The API is designed to work seamlessly with the Reddit Digest browser extension. The extension handles:

- Automatic text selection and highlighting on Reddit
- Session management through the extension popup
- Real-time synchronization with the backend API
- Offline support with local storage fallback

## Environment Variables

Required environment variables for the API server:

```env
# Server Configuration
PORT=3001
NODE_ENV=production

# Database
MONGODB_URI=mongodb://localhost:27017/reddit-digest

# Authentication
JWT_SECRET=your-super-secret-jwt-key

# Frontend
FRONTEND_URL=http://localhost:5173

# Optional: AI Services (for production synthesis)
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
```

## Deployment

The API can be deployed using Docker:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

Or using traditional hosting with PM2:

```bash
npm install -g pm2
pm2 start index.js --name reddit-digest-api
```
