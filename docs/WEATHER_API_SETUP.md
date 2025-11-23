# Weather API Setup Instructions

## Get Your Free OpenWeatherMap API Key

1. **Visit OpenWeatherMap**
   - Go to: https://openweathermap.org/api

2. **Sign Up for Free Account**
   - Click "Sign Up" or "Get API Key"
   - Create a free account (no credit card required)
   - Verify your email address

3. **Get API Key**
   - After login, go to: https://home.openweathermap.org/api_keys
   - You'll see your default API key already generated
   - Copy the API key

4. **Add API Key to Project**
   - Open `frontend/.env` file
   - Replace `your_api_key_here` with your actual API key:
   ```
   VITE_OPENWEATHER_API_KEY=your_actual_api_key_here
   ```

5. **Restart Development Server**
   - Stop the current server (Ctrl+C)
   - Run: `npm run dev`
   - The Weather page will now show real-time data!

## Free Tier Limits
- ✅ 1,000 API calls per day
- ✅ Current weather data
- ✅ 5-day/3-hour forecast
- ✅ More than enough for development and testing

## API Features Used
- Current Weather Data (temperature, humidity, wind, pressure, etc.)
- 5-Day Weather Forecast
- Real-time updates for 4 Indian locations:
  - Ranchi, Jharkhand
  - Patna, Bihar
  - Lucknow, Uttar Pradesh
  - Bhopal, Madhya Pradesh

## Troubleshooting
- If you see "Failed to fetch weather data", check:
  1. API key is correctly added to `.env`
  2. Development server was restarted after adding key
  3. Internet connection is active
  4. API key is activated (may take a few minutes after signup)
