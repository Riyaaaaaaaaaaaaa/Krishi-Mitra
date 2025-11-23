# Backend Documentation - Krishi Mitra

## Table of Contents
- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Database Models](#database-models)
- [API Endpoints](#api-endpoints)
- [Services](#services)
- [Authentication](#authentication)
- [Setup and Running](#setup-and-running)

## Overview

The Krishi Mitra backend is a RESTful API server built with Node.js and Express, serving as the central hub for data management, authentication, ML model integration, and external API orchestration.

**Core Responsibilities:**
- User authentication and session management
- CRUD operations for crops, alerts, and rotations
- ML model proxy (forwards requests to Python ML service)
- External API integration (Agmarknet, SoilGrids, OpenWeather)
- Email notifications (OTP verification)
- Push notifications via VAPID

## Technology Stack

### Runtime & Framework
- **Node.js 18+** - JavaScript runtime
- **Express 4.x** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB

### Key Libraries
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **nodemailer** - Email service
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variables
- **axios** - HTTP client for external APIs

### External Services
- **MongoDB Atlas** - Cloud database (or local)
- **Gmail SMTP** - Email delivery
- **Agmarknet API** - Market prices
- **SoilGrids API** - Soil data
- **ML Service (Flask)** - Crop recommendations

## Architecture

```
Backend Architecture:

   Client (Web)  

          HTTP/HTTPS
         

  Express Server     
  (Port 5000)        

  Routes Layer         API endpoints

  Services Layer       Business logic

  Models Layer         Data schemas

         
    
     MongoDB 
    

External APIs:
- ML Service (localhost:5001)
- Agmarknet API
- SoilGrids API
```

## Database Models

### 1. User Model (`models/User.js`)

**Schema:**
```javascript
{
  name: String (required),
  email: String (required, unique),
  phone: String,
  password: String (hashed),
  location: {
    state: String,
    district: String,
    coordinates: {
      lat: Number,
      lon: Number
    }
  },
  verified: Boolean,
  otp: String,
  otpExpires: Date,
  createdAt: Date
}
```

**Methods:**
- `matchPassword(password)` - Compare hashed password
- Pre-save hook for password hashing

### 2. Crop Model (`models/Crop.js`)

**Schema:**
```javascript
{
  userId: ObjectId (ref: User),
  name: String,
  variety: String,
  area: Number,
  unit: String (acre/hectare),
  plantedDate: Date,
  expectedHarvest: Date,
  actualHarvest: Date,
  yield: Number,
  notes: String,
  status: String (planned/planted/harvested),
  createdAt: Date
}
```

### 3. CropRotation Model (`models/CropRotation.js`)

**Schema:**
```javascript
{
  userId: ObjectId,
  fieldName: String,
  area: Number,
  location: String,
  currentSoilHealth: {
    nitrogen: Number,
    phosphorus: Number,
    potassium: Number,
    ph: Number,
    organicMatter: Number
  },
  rotationHistory: [{
    cropName: String,
    cropFamily: String,
    plantedDate: Date,
    harvestedDate: Date,
    yield: Number,
    season: String,
    year: Number,
    soilHealthBefore: { N, P, K, pH, OM },
    soilHealthAfter: { N, P, K, pH, OM },
    notes: String
  }],
  notes: String,
  createdAt: Date
}
```

**Methods:**
- `analyzeRotationPattern()` - Detects monoculture
- `getSoilFertilityTrend()` - Calculates NPK trends
- `getRecommendations()` - Returns crop suggestions

### 4. Alert Model (`models/Alert.js`)

**Schema:**
```javascript
{
  userId: ObjectId,
  type: String (weather/market/pest/general),
  title: String,
  message: String,
  read: Boolean,
  createdAt: Date
}
```

### 5. Conversation Model (`models/Conversation.js`)

**Schema:**
```javascript
{
  userId: ObjectId,
  messages: [{
    role: String (user/assistant),
    content: String,
    timestamp: Date
  }],
  createdAt: Date
}
```

## API Endpoints

### Authentication (`routes/auth.js`)

#### Register User
```
POST /api/auth/register
Body: {
  name, email, phone, password, location
}
Response: {
  token, user: { id, name, email, verified }
}
```

#### Login
```
POST /api/auth/login
Body: { email, password }
Response: {
  token, user: { id, name, email }
}
```

#### Get Profile
```
GET /api/auth/profile
Headers: { Authorization: Bearer <token> }
Response: { user object }
```

#### Verify Email
```
POST /api/auth/verify-email
Body: { email, otp }
Response: { verified: true }
```

### Crops (`routes/crops.js`)

#### Get All User Crops
```
GET /api/crops
Headers: { Authorization: Bearer <token> }
Response: [ { crop objects } ]
```

#### Add Crop
```
POST /api/crops
Headers: { Authorization: Bearer <token> }
Body: { name, variety, area, plantedDate, ... }
Response: { crop object }
```

#### Update Crop
```
PUT /api/crops/:id
Body: { fields to update }
Response: { updated crop }
```

#### Delete Crop
```
DELETE /api/crops/:id
Response: { message: 'Crop deleted' }
```

### Crop Rotation (`routes/cropRotation.js`)

#### Create Rotation Field
```
POST /api/crop-rotation
Body: {
  fieldName, area, location,
  currentSoilHealth: { N, P, K, pH, OM }
}
Response: { rotation object }
```

#### Get User Rotations
```
GET /api/crop-rotation
Response: [ { rotation objects } ]
```

#### Add Crop to Rotation
```
POST /api/crop-rotation/:id/add-crop
Body: {
  cropName, cropFamily, plantedDate,
  harvestedDate, yield, season, year,
  soilHealthBefore, soilHealthAfter
}
Response: { updated rotation }
```

#### Get Rotation Analysis
```
GET /api/crop-rotation/:id/analysis
Response: {
  rotationPattern, soilTrend,
  recommendations, diversity
}
```

#### Update Rotation
```
PUT /api/crop-rotation/:id
Body: { fields to update }
Response: { updated rotation }
```

#### Delete Rotation
```
DELETE /api/crop-rotation/:id
Response: { message: 'Deleted' }
```

### ML Recommendations (`routes/recommend.js`)

#### Get Crop Recommendation
```
POST /api/recommend
Body: {
  nitrogen, phosphorus, potassium,
  temperature, humidity, ph, rainfall,
  state (optional)
}
Response: {
  crop, confidence, alternatives: [...]
}
```

**Flow:**
1. Backend receives request
2. Forwards to ML service at `http://localhost:5001/recommend`
3. ML model predicts best crop
4. Returns recommendation with confidence score

### Market Prices (`routes/marketPrices.js`)

#### Get Market Prices
```
GET /api/market-prices?state=<state>&commodity=<crop>
Response: {
  prices: [
    { market, commodity, price, date }
  ]
}
```

**Data Source:** Agmarknet API

### Soil Data (`routes/soilData.js`)

#### Get Soil Data by Location
```
GET /api/soil-data?lat=<lat>&lon=<lon>
Response: {
  nitrogen, phosphorus, potassium,
  ph, organicMatter, location
}
```

**Data Source:** SoilGrids API

### Notifications (`routes/notificationRoutes.js`)

#### Get User Notifications
```
GET /api/notifications
Response: [ { alert objects } ]
```

#### Mark as Read
```
PUT /api/notifications/:id/read
Response: { message: 'Marked as read' }
```

### Conversational AI (`routes/conversationalAI.js`)

#### Send Chat Message
```
POST /api/chat
Body: { message }
Response: { response: 'AI response text' }
```

## Services

### 1. Email Service (`utils/emailService.js`)

**Functions:**
- `sendOTPEmail(email, otp)` - Sends 6-digit verification code
- `sendWelcomeEmail(email, name)` - Welcome message

**Configuration:**
```javascript
Transporter: Gmail SMTP
Port: 587
Auth: EMAIL_USER, EMAIL_PASSWORD (app password)
```

### 2. Notification Service (`services/notificationService.js`)

**Functions:**
- `createAlert(userId, type, title, message)` - Creates notification
- `getUserAlerts(userId)` - Fetches all alerts
- `markAsRead(alertId)` - Updates read status

### 3. Soil Data Service (`services/soilDataService.js`)

**Functions:**
- `getSoilDataByLocation(lat, lon)` - Fetches from SoilGrids API
- `parseSoilResponse(data)` - Transforms API response

**API:** https://rest.isric.org/soilgrids/v2.0/properties/query

### 4. Conversational AI Service (`services/conversationalAI.js`)

**Functions:**
- `processMessage(userId, message)` - Handles chat queries
- `getConversationHistory(userId)` - Retrieves chat history
- Pattern matching for common queries

## Authentication

### Strategy
- **JWT (JSON Web Tokens)**
- Token expires in 30 days
- Stored in client localStorage

### Middleware
```javascript
const protect = async (req, res, next) => {
  let token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Not authorized' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token invalid' });
  }
};
```

### Usage
```javascript
router.get('/api/crops', protect, getCrops);
```

## Setup and Running

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Gmail account (for email)

### Installation
```bash
cd backend
npm install
```

### Environment Variables
Create `.env` file:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/krishimitra
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=KrishiMitra <your-email@gmail.com>
VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key
VAPID_EMAIL=your-email@gmail.com
```

### Start MongoDB
```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas connection string
```

### Start Server
```bash
# Development
npm run dev

# Production
npm start
```

Server runs at: `http://localhost:5000`

## Error Handling

### Standard Error Response
```javascript
{
  error: 'Error message',
  details: 'Additional info'
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Server Error

## Security

### Password Hashing
- **bcryptjs** with 10 salt rounds
- Never store plain text passwords

### JWT Secret
- Strong secret key in `.env`
- Token expiration: 30 days

### CORS Configuration
```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### Input Validation
- Mongoose schema validation
- Email format validation
- Required field checks

## Logging

### Console Logs
- Server startup
- Database connection
- API requests (optional)
- Errors with stack traces

### Production Logging
- Use Winston or Morgan
- Log to files
- Error tracking (Sentry)

## Testing

### Manual Testing
- Use Postman or Thunder Client
- Test scripts in `test-*.js` files

### Unit Testing (TODO)
- Jest framework
- Supertest for API testing

## Deployment

### Build
```bash
npm install --production
```

### Deploy to Heroku
```bash
heroku create krishi-mitra-backend
git push heroku main
heroku config:set MONGODB_URI=<atlas-uri>
```

### Deploy to Render/Railway
- Connect GitHub repo
- Set environment variables
- Auto-deploy on push

### Environment Variables (Production)
- Set all `.env` variables in hosting platform
- Use MongoDB Atlas for database
- Use SendGrid/AWS SES for email (scalable)

## Performance

### Database Indexing
```javascript
userSchema.index({ email: 1 });
cropSchema.index({ userId: 1 });
```

### Caching (TODO)
- Redis for market prices
- Cache soil data responses

### Rate Limiting (TODO)
```javascript
const rateLimit = require('express-rate-limit');
app.use('/api', rateLimit({ windowMs: 15*60*1000, max: 100 }));
```

---

**Last Updated:** November 23, 2025
**Version:** 1.2.0
