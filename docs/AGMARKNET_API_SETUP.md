========================================
AGMARKNET API SETUP GUIDE
========================================

How to Get Your Free API Key from Data.gov.in
----------------------------------------------

1. Visit: https://data.gov.in/

2. Click "Sign Up" (top right corner)
   - Fill in your details
   - Verify email
   - Login to your account

3. Search for "Agmarknet" or "Market Prices"
   - Look for dataset: "Market Prices API"
   - Resource ID: 9ef84268-d588-465a-a308-a864a43d0070

4. Click "API" or "Request Access"
   - You'll get an API key instantly

5. Copy your API key

6. Add to backend/.env file:
   AGMARKNET_API_KEY=your_actual_api_key_here

Alternative: Use Data.gov.in Open API
-------------------------------------
Most government datasets are publicly accessible.
You can use this default API key for testing:
579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b

Add to .env:
AGMARKNET_API_KEY=579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b

API Endpoints Available:
------------------------
Base URL: https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070

Parameters:
- api-key: Your API key (required)
- format: json (required)
- filters[state]: Filter by state name
- filters[district]: Filter by district
- filters[commodity]: Filter by crop name
- limit: Number of records (default 10, max 100)
- offset: For pagination

Example Request:
https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=YOUR_KEY&format=json&filters[state]=Jharkhand&limit=50

Response Fields:
- state: State name
- district: District name
- market: Market/Mandi name
- commodity: Crop name
- variety: Variety of crop
- grade: Grade
- min_price: Minimum price (Rs/Quintal)
- max_price: Maximum price (Rs/Quintal)
- modal_price: Modal/Average price (Rs/Quintal)
- arrival_date: Date of price data

Testing the API:
----------------
1. Open terminal/PowerShell
2. Test with curl:

curl "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=YOUR_KEY&format=json&limit=5"

Or test in browser:
https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=YOUR_KEY&format=json&filters[state]=Maharashtra&limit=10

Troubleshooting:
----------------
Q: API returns empty data?
A: Agmarknet data might not be available for all commodities/states daily.
   The system automatically falls back to mock data.

Q: Rate limits?
A: Data.gov.in has rate limits. For production, consider caching responses.

Q: Need more data sources?
A: Consider these alternatives:
   - e-NAM (National Agriculture Market): https://enam.gov.in
   - NCDEX (commodity exchange): https://www.ncdex.com
   - State agricultural marketing boards

========================================
