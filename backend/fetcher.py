import yfinance as yf
from datetime import datetime
from database import Stock, SessionLocal

def fetch_stock_price(symbol: str):
    try:
        # Download 1-day, 1-minute interval data
        data = yf.download(tickers=symbol, period="1d", interval="1m", progress=False)

        # If no data, handle gracefully
        if data.empty:
            return {"error": f"No data found for symbol: {symbol}"}

        # Get the latest close price
        latest = data.tail(1)
        price = round(float(latest["Close"].values[0]), 2)

        return {
            "symbol": symbol.upper(),
            "price": price,
            "timestamp": datetime.utcnow(),
        }

    except Exception as e:
        # Return error details if yfinance fails
        return {"error": str(e)}


def save_to_db(stock_data):
    """Save stock data dictionary to the database"""
    db = SessionLocal()
    try:
        stock = Stock(**stock_data)
        db.add(stock)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Database error: {e}")
    finally:
        db.close()
