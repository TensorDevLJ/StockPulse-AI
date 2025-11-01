from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fetcher import fetch_stock_price, save_to_db
from database import init_db
from model import train_and_predict
from datetime import datetime, timedelta
import yfinance as yf

# ✅ Create FastAPI app first
app = FastAPI(title="StockPulse-AI Backend")

# ✅ Enable CORS for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Initialize database
init_db()


@app.get("/")
def root():
    return {"message": "Welcome to StockPulse-AI Backend"}


@app.get("/latest/{symbol}")
def get_latest(symbol: str, background_tasks: BackgroundTasks):
    stock_data = fetch_stock_price(symbol)
    background_tasks.add_task(save_to_db, stock_data)
    return stock_data


@app.get("/predict/{symbol}")
def get_prediction(symbol: str):
    return train_and_predict(symbol)


# ✅ New route for chart history (must be *after app is defined*)
@app.get("/history/{symbol}")
def get_stock_history(symbol: str):
    """
    Fetch historical stock data for the past 5 days.
    Used by frontend's StockChart.tsx.
    """
    try:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=5)

        data = yf.download(symbol, start=start_date, end=end_date, interval="1h")

        if data.empty:
            return {"error": "No data available for this symbol"}

        history = [
            {"timestamp": idx.strftime("%Y-%m-%d %H:%M:%S"), "price": float(row["Close"])}
            for idx, row in data.iterrows()
        ]

        return {"symbol": symbol, "history": history}

    except Exception as e:
        return {"error": str(e)}
