# Frontend Documentation - Krishi Mitra

## Table of Contents
- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Pages](#pages)
- [Components](#components)
- [Internationalization](#internationalization)
- [API Integration](#api-integration)
- [Setup and Running](#setup-and-running)

## Overview

The Krishi Mitra frontend is a modern React-based single-page application built with Vite, providing farmers with AI-powered crop recommendations, market prices, weather forecasts, and crop rotation management.

**Key Features:**
- Bilingual support (English & Hindi) with 1900+ translation keys
- Responsive design for mobile, tablet, and desktop
- Real-time weather and market price data
- AI-powered crop recommendations with 99.77% accuracy
- Voice assistant integration
- Push notifications support

## Technology Stack

### Core Technologies
- **React 18.3.1** - UI framework
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **TailwindCSS** - Utility-first CSS framework
- **i18next** - Internationalization framework

### Key Libraries
- **react-i18next** - React bindings for i18next
- **axios** - HTTP client for API requests
- **date-fns** - Date manipulation
- **Recharts** - Data visualization charts

### Build Tools
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing
- **ESLint** - Code linting

## Project Structure

```
frontend/
 public/
    sw.js                    # Service worker for PWA
    hero-farmer.jpg          # Landing page images
    farmer-phone.jpg
 src/
    components/              # Reusable components
       AuthModal.jsx        # Login/Register modal
       Header.jsx           # App header with navigation
       LanguageSwitcher.jsx # Language toggle (EN/HI)
       NotificationBell.jsx # In-app notifications
       VoiceAssistant.jsx   # Voice interaction
       ...
    pages/                   # Main application pages
       Landing.jsx          # Public landing page
       Dashboard.jsx        # Main dashboard
       CropRotation.jsx     # Crop rotation management
       MyCrops.jsx          # User crops list
       MarketPrices.jsx     # Real-time market prices
       ...
    services/                # API service layers
       auth.js              # Authentication API
       marketApi.js         # Market price API
    utils/                   # Utility functions
       cropTranslation.js   # Crop name translations
       notificationUtils.js # Notification helpers
    App.jsx                  # Main app component
    i18n.js                  # i18next configuration
    main.jsx                 # App entry point
 .env                         # Environment variables
 index.html                   # HTML template
 package.json                 # Dependencies
 tailwind.config.cjs          # Tailwind configuration
```

## Pages

### 1. Landing Page (`Landing.jsx`)
- **Purpose:** Public-facing homepage
- **Features:**
  - Hero section with farmer imagery
  - Feature highlights
  - Language switcher
  - Call-to-action buttons

### 2. Dashboard (`Dashboard.jsx`)
- **Purpose:** Main authenticated user interface
- **Features:**
  - Weather widget (location-based)
  - Quick stats (total crops, avg yield)
  - Recent crops list
  - Market price highlights
  - Quick action buttons

### 3. Crop Rotation (`CropRotation.jsx`)
- **Purpose:** Advanced crop rotation management
- **Features:**
  - Field creation and management
  - Rotation history tracking
  - Pattern analysis (monoculture detection)
  - Soil health tracking (before/after)
  - Fertility trend visualization (sparklines)
  - Prioritized recommendations with guides
  - Severity-based warnings

### 4. My Crops (`MyCrops.jsx`)
- **Purpose:** User crop inventory
- **Features:**
  - Add new crops with details
  - Edit/delete existing crops
  - Yield tracking
  - Status monitoring (planted/harvested)

### 5. Market Prices (`MarketPrices.jsx`)
- **Purpose:** Real-time market data
- **Features:**
  - State-wise commodity prices
  - Price trends and comparisons
  - Search and filter
  - Data from Agmarknet API

### 6. Recommendations (`Recommendations.jsx`)
- **Purpose:** AI crop recommendations
- **Features:**
  - ML-powered suggestions
  - Soil parameter input form
  - Alternative crop suggestions
  - Confidence scores
  - Detailed crop information

### 7. Weather (`Weather.jsx`)
- **Purpose:** Weather forecasts
- **Features:**
  - Current conditions
  - 5-day forecast
  - Temperature, humidity, wind
  - OpenWeather API integration

### 8. AI Chat (`AIChat.jsx`)
- **Purpose:** Conversational AI assistant
- **Features:**
  - Natural language queries
  - Farming advice
  - Chat history
  - Bilingual support

### 9. Settings (`Settings.jsx`)
- **Purpose:** User preferences
- **Features:**
  - Profile management
  - Language selection
  - Notification preferences (Hindi-only tab)
  - Theme settings

### 10. Soil Data (`SoilData.jsx`)
- **Purpose:** Soil health analysis
- **Features:**
  - Location-based soil data
  - NPK level display
  - pH and organic matter
  - SoilGrids API integration

## Components

### AuthModal (`AuthModal.jsx`)
- Login/Register modal with tab switching
- Email verification (OTP)
- Form validation
- Token-based authentication

### Header (`Header.jsx`)
- App branding (Krishi Mitra logo)
- Language switcher
- Notification bell
- User profile dropdown

### LanguageSwitcher (`LanguageSwitcher.jsx`)
- Toggle between English and Hindi
- Persists selection to localStorage
- Updates entire UI dynamically

### NotificationBell (`NotificationBell.jsx`)
- Displays in-app notifications
- Unread count badge
- Mark as read functionality
- Demo notifications for testing

### VoiceAssistant (`VoiceAssistant.jsx`)
- Speech recognition
- Text-to-speech output
- Hindi voice support
- Voice command handling

### CropRecommendationForm (`CropRecommendationForm.jsx`)
- Soil parameter inputs
- State/location selection
- ML model integration
- Recommendation display

## Internationalization

### Configuration (`i18n.js`)
- **Supported Languages:** English (en), Hindi (hi)
- **Total Keys:** 1900+
- **Storage:** localStorage persistence
- **Fallback:** English

### Key Namespaces
```javascript
{
  "app": {
    "common": { /* Common UI text */ },
    "dashboard": { /* Dashboard specific */ },
    "cropRotation": { /* Rotation page */ },
    "notifications": { /* Only Hindi */ },
    // ... other namespaces
  }
}
```

### Usage Example
```javascript
import { useTranslation } from 'react-i18next';

function Component() {
  const { t, i18n } = useTranslation();
  
  return (
    <div>
      <h1>{t('app.common.welcome')}</h1>
      <p>{i18n.language === 'hi' ? 'हद' : 'English'}</p>
    </div>
  );
}
```

## API Integration

### Base URL
```javascript
const API_URL = 'http://127.0.0.1:5000';
```

### Authentication Service (`services/auth.js`)
```javascript
// Register user
POST /api/auth/register
Body: { name, email, phone, password, location }

// Login user
POST /api/auth/login
Body: { email, password }

// Get profile
GET /api/auth/profile
Headers: { Authorization: Bearer <token> }
```

### Crop API
```javascript
// Add crop
POST /api/crops
Body: { name, variety, area, ... }

// Get user crops
GET /api/crops

// Update crop
PUT /api/crops/:id

// Delete crop
DELETE /api/crops/:id
```

### Crop Rotation API
```javascript
// Create rotation field
POST /api/crop-rotation

// Add crop to rotation
POST /api/crop-rotation/:id/add-crop

// Get rotation analysis
GET /api/crop-rotation/:id/analysis
```

### ML Recommendation
```javascript
POST /api/recommend
Body: {
  nitrogen, phosphorus, potassium,
  temperature, humidity, ph, rainfall,
  state
}
Response: {
  crop, confidence, alternatives
}
```

### External APIs
- **OpenWeather API:** Weather data
- **Agmarknet API:** Market prices
- **SoilGrids API:** Soil health data

## Setup and Running

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
cd frontend
npm install
```

### Environment Variables
Create `.env` file:
```
VITE_OPENWEATHER_API_KEY=your-api-key
```

### Development
```bash
npm run dev
# Opens at http://localhost:5173
```

### Build for Production
```bash
npm run build
# Output in dist/
```

### Preview Production Build
```bash
npm run preview
```

## Styling

### TailwindCSS Configuration
- Custom colors for agricultural theme
- Green color palette (`green-50` to `green-900`)
- Responsive breakpoints
- Custom utilities

### Common Patterns
```javascript
// Card style
className="bg-white rounded-lg shadow-md p-6"

// Button style
className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"

// Input style
className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
```

## State Management

- **React hooks** (useState, useEffect)
- **localStorage** for persistence
- **Context API** for global state (auth)
- **No Redux** (not needed for current scale)

## Performance Optimizations

- Code splitting with React.lazy()
- Image optimization
- Vite's fast HMR
- Service worker for offline support
- Debounced search inputs

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Deployment

### Build
```bash
npm run build
```

### Deploy to Netlify/Vercel
- Connect GitHub repository
- Set build command: `npm run build`
- Set publish directory: `dist`
- Add environment variables

---

**Last Updated:** November 23, 2025
**Version:** 1.2.0
