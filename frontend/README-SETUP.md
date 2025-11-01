# Real-Time Stock Market Data Pipeline Setup Guide

## Architecture Overview

```
React Dashboard ←→ FastAPI Backend (Python - Run Separately) ←→ Database (SQLite/PostgreSQL)
```

**IMPORTANT**: This Lovable project contains only the React frontend. You must set up the Python backend separately following the instructions below.

---

## Part 1: Python Backend Setup (Do This First)

### 1.1 Create Backend Directory

```bash
mkdir stock-backend
cd stock-backend
```

### 1.2 Install Python Dependencies

Create `requirements.txt`:
```
fastapi==0.104.1
uvicorn==0.24.0
yfinance==0.2.32
pandas==2.1.3
prophet==1.1.5
sqlalchemy==2.0.23
python-dotenv==1.0.0
```

Install:
```bash
pip install -r requirements.txt
```

### 1.3 Create Database Module

Create `database.py`:
```python
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

SQLALCHEMY_DATABASE_URL = "sqlite:///./stocks.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class StockPrice(Base):
    __tablename__ = "stock_prices"
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, index=True)
    price = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)
```

### 1.4 Create Data Fetcher

Create `fetcher.py`:
```python
import yfinance as yf
from datetime import datetime

def fetch_live_price(symbol: str):
    try:
        ticker = yf.Ticker(symbol)
        data = ticker.history(period='1d', interval='1m')
        if not data.empty:
            latest = data.iloc[-1]
            return {
                "symbol": symbol,
                "price": float(latest['Close']),
                "timestamp": datetime.now().isoformat(),
                "volume": int(latest['Volume']),
                "high": float(latest['High']),
                "low": float(latest['Low'])
            }
    except Exception as e:
        print(f"Error fetching {symbol}: {e}")
        return None

def fetch_historical(symbol: str, days: int = 30):
    try:
        ticker = yf.Ticker(symbol)
        data = ticker.history(period=f'{days}d', interval='1d')
        return data.reset_index().to_dict('records')
    except Exception as e:
        print(f"Error fetching historical {symbol}: {e}")
        return []
```

### 1.5 Create AI Prediction Model

Create `model.py`:
```python
from prophet import Prophet
import pandas as pd
from database import SessionLocal, StockPrice

def predict_price(symbol: str, periods: int = 5):
    db = SessionLocal()
    try:
        prices = db.query(StockPrice).filter(StockPrice.symbol == symbol).order_by(StockPrice.timestamp).all()
        
        if len(prices) < 10:
            return None
        
        df = pd.DataFrame([{
            'ds': p.timestamp,
            'y': p.price
        } for p in prices])
        
        model = Prophet(daily_seasonality=True)
        model.fit(df)
        
        future = model.make_future_dataframe(periods=periods, freq='min')
        forecast = model.predict(future)
        
        latest_pred = forecast.iloc[-1]
        current_price = prices[-1].price
        predicted_price = float(latest_pred['yhat'])
        
        return {
            "symbol": symbol,
            "current_price": current_price,
            "predicted_price": predicted_price,
            "trend": "uptrend" if predicted_price > current_price else "downtrend",
            "confidence_lower": float(latest_pred['yhat_lower']),
            "confidence_upper": float(latest_pred['yhat_upper'])
        }
    finally:
        db.close()
```

### 1.6 Create FastAPI Main Server

Create `main.py`:
```python
from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from database import SessionLocal, StockPrice
from fetcher import fetch_live_price, fetch_historical
from model import predict_price
import time
from datetime import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store prices in background
def store_prices_loop():
    symbols = ["AAPL", "MSFT", "GOOGL", "TSLA"]
    while True:
        db = SessionLocal()
        for symbol in symbols:
            data = fetch_live_price(symbol)
            if data:
                price_entry = StockPrice(
                    symbol=symbol,
                    price=data['price'],
                    timestamp=datetime.now()
                )
                db.add(price_entry)
        db.commit()
        db.close()
        time.sleep(60)  # Fetch every minute

@app.on_event("startup")
async def startup_event():
    import threading
    thread = threading.Thread(target=store_prices_loop, daemon=True)
    thread.start()

@app.get("/")
def read_root():
    return {"status": "Stock API Running"}

@app.get("/latest/{symbol}")
def get_latest(symbol: str):
    data = fetch_live_price(symbol)
    return data if data else {"error": "Symbol not found"}

@app.get("/history/{symbol}")
def get_history(symbol: str, days: int = 30):
    db = SessionLocal()
    prices = db.query(StockPrice).filter(StockPrice.symbol == symbol).order_by(StockPrice.timestamp.desc()).limit(days * 24 * 60).all()
    db.close()
    return [{
        "price": p.price,
        "timestamp": p.timestamp.isoformat()
    } for p in prices]

@app.get("/predict/{symbol}")
def get_prediction(symbol: str):
    prediction = predict_price(symbol)
    return prediction if prediction else {"error": "Not enough data for prediction"}

@app.get("/symbols")
def get_symbols():
    return {"symbols": ["AAPL", "MSFT", "GOOGL", "TSLA", "AMZN", "META", "NVDA"]}
```

### 1.7 Run the Backend

```bash
uvicorn main:app --reload --port 8000
```

Backend will run at: `http://localhost:8000`

Test it:
```bash
curl http://localhost:8000/latest/AAPL
curl http://localhost:8000/predict/AAPL
```

---

## Part 2: React Frontend (Already in This Lovable Project)

The React dashboard is already set up in this project. It will connect to your Python backend at `http://localhost:8000`.

### Configuration

Update the API base URL if needed in the frontend components (default is `http://localhost:8000`).

---

## Part 3: Running the Complete System

### Terminal 1 - Python Backend
```bash
cd stock-backend
uvicorn main:app --reload --port 8000
```

### Terminal 2 - React Frontend (This Lovable Project)
The preview will automatically connect to your backend.

---

## Deployment Options

### Backend Deployment (Choose One)

**Option 1: Render (Free)**
1. Push backend code to GitHub
2. Create new Web Service on Render
3. Connect GitHub repo
4. Set build command: `pip install -r requirements.txt`
5. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

**Option 2: Railway (Free Tier)**
1. Push to GitHub
2. Deploy on Railway
3. Auto-detects Python

**Option 3: PythonAnywhere (Free Tier)**
1. Upload backend files
2. Configure WSGI

### Frontend Deployment

Use Lovable's built-in publish feature (top-right corner) to deploy the React dashboard.

---

## Environment Variables

### Backend (.env file)
```
DATABASE_URL=sqlite:///./stocks.db
# or for PostgreSQL: postgresql://user:pass@host:port/db
```

### Frontend (Lovable)
Update API URLs in components to point to your deployed backend URL.

---

## Database Migration (SQLite → PostgreSQL)

When ready for production:

1. Install psycopg2: `pip install psycopg2-binary`
2. Update `database.py`:
```python
SQLALCHEMY_DATABASE_URL = "postgresql://user:password@localhost/stockdb"
```

---

## Features Implemented

### Backend
✅ Real-time stock price fetching (yfinance)
✅ SQLite/PostgreSQL storage
✅ Prophet AI predictions
✅ RESTful API (FastAPI)
✅ Background data collection
✅ Historical data endpoints

### Frontend
✅ Real-time stock charts
✅ AI prediction display
✅ Multiple stock tracking
✅ Trend indicators
✅ Responsive design
✅ Auto-refresh

---

## Troubleshooting

### Backend Issues

**"No module named 'prophet'"**
```bash
pip install prophet
# On Mac M1/M2: conda install -c conda-forge prophet
```

**CORS errors**
- Ensure CORS middleware is configured in `main.py`
- Check frontend API URL matches backend URL

**Database locked**
- SQLite can have concurrency issues
- Consider PostgreSQL for production

### Frontend Issues

**"Failed to fetch"**
- Check backend is running on port 8000
- Verify API URL in frontend code
- Check browser console for CORS errors

---

## Next Steps

1. ✅ Set up Python backend (above)
2. ✅ Run and test locally
3. 🔄 Deploy backend to Render/Railway
4. 🔄 Update frontend API URLs
5. 🔄 Deploy frontend via Lovable
6. 🚀 Add features (alerts, sentiment analysis, etc.)

---

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + Tailwind CSS |
| Backend | FastAPI (Python) |
| Database | SQLite → PostgreSQL |
| AI Model | Facebook Prophet |
| Data Source | Yahoo Finance (yfinance) |
| Charts | Recharts |
| Deployment | Lovable (Frontend) + Render (Backend) |

---

## Support

For backend issues: Check FastAPI logs
For frontend issues: Check browser console
For AI issues: Ensure enough historical data (min 10 data points)

---

**Important**: Remember to keep your backend running while developing the frontend locally!
