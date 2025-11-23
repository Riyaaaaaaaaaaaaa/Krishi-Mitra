# ML Service Setup Guide

## Step 1: Install Python (if not already installed)

Download Python 3.8+ from https://www.python.org/downloads/

**Important:** During installation, check "Add Python to PATH"

Verify installation:
```bash
python --version
```

## Step 2: Create Virtual Environment (Recommended)

```bash
# Navigate to ml-service directory
cd d:\KrishiCropAI\ml-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1

# Windows CMD:
.\venv\Scripts\activate.bat

# If you get execution policy error in PowerShell, run:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

This will install:
- Flask (web framework)
- Flask-CORS (CORS support)
- scikit-learn (ML library)
- pandas (data processing)
- numpy (numerical computing)
- joblib (model serialization)

## Step 4: Train the Model

```bash
python train_model.py
```

Expected output:
```
Dataset Shape: (2200, 8)
Training samples: 1760
Testing samples: 440
🌱 Training Random Forest Classifier...
✅ Model training complete!
📊 Model Accuracy: 99.xx%
💾 Model saved as 'crop_model.pkl'
💾 Feature names saved as 'feature_names.json'
🧪 Test Prediction:
Input: N=90, P=42, K=43, temp=28°C, humidity=80%, pH=6.5, rainfall=200mm
Predicted Crop: rice
Confidence: 92.xx%
✅ Training script completed successfully!
```

This creates two files:
- `crop_model.pkl` (trained Random Forest model)
- `feature_names.json` (feature metadata)

## Step 5: Start Flask API Server

```bash
python app.py
```

Expected output:
```
🌾 Krishi Mitra ML Service
==================================================
Model loaded: True
Listening on: http://localhost:5001
==================================================
 * Running on http://0.0.0.0:5001
```

The server is now running on **port 5001**.

## Step 6: Test the API

### Option 1: Using PowerShell (curl)
```powershell
$body = @{
    N = 90
    P = 42
    K = 43
    temperature = 28
    humidity = 80
    ph = 6.5
    rainfall = 200
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:5001/predict -Method Post -Body $body -ContentType "application/json"
```

### Option 2: Using Python
```python
import requests

data = {
    "N": 90,
    "P": 42,
    "K": 43,
    "temperature": 28,
    "humidity": 80,
    "ph": 6.5,
    "rainfall": 200
}

response = requests.post("http://localhost:5001/predict", json=data)
print(response.json())
```

### Option 3: Health Check (Browser)
Open in browser: http://localhost:5001/health

## Expected Response

```json
{
  "success": true,
  "prediction": {
    "crop": "Rice",
    "confidence": 0.923,
    "season": "Kharif",
    "yield_estimate": "4500 kg/ha",
    "profit_margin": "₹45000/ha",
    "alternatives": [
      {
        "crop": "Maize",
        "confidence": 0.856,
        "season": "Kharif",
        "yield": "3500 kg/ha",
        "profit": "₹32000/ha"
      }
    ]
  },
  "input": {
    "N": 90,
    "P": 42,
    "K": 43,
    "temperature": 28,
    "humidity": 80,
    "ph": 6.5,
    "rainfall": 200
  },
  "timestamp": "2025-11-14T18:30:00.000000"
}
```

## Troubleshooting

### Error: "Module not found"
```bash
# Ensure virtual environment is activated
# Reinstall dependencies
pip install -r requirements.txt
```

### Error: "Model not loaded"
```bash
# Train the model first
python train_model.py
```

### Error: "Port 5001 already in use"
```bash
# Find process using port 5001
netstat -ano | findstr :5001

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Or change port in app.py:
# app.run(host='0.0.0.0', port=5002, debug=True)
```

### Error: "CORS error" from frontend
- Ensure Flask-CORS is installed
- Check that `CORS(app)` is present in app.py

## Running All Services Together

### Terminal 1: ML Service (Flask)
```bash
cd d:\KrishiCropAI\ml-service
python app.py
```

### Terminal 2: Backend (Node.js)
```bash
cd d:\KrishiCropAI\backend
npm start
```

### Terminal 3: Frontend (React)
```bash
cd d:\KrishiCropAI\frontend
npm run dev
```

Now visit: http://localhost:5173 (or the port shown by Vite)

## Next Steps

1. Test the crop recommendation form in the dashboard
2. Verify predictions are coming from the ML model
3. Check console logs for success messages
4. If ML service is down, frontend will show fallback dummy data

## Production Deployment

For production:
1. Use `gunicorn` instead of Flask dev server
2. Set `debug=False` in app.py
3. Add authentication/API keys
4. Use environment variables for configuration
5. Deploy on cloud platform (Heroku, AWS, etc.)

Example with gunicorn:
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5001 app:app
```
