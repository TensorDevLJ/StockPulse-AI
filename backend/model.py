from prophet import Prophet
import pandas as pd
from database import SessionLocal, Stock

def train_and_predict(symbol: str):
    db = SessionLocal()
    records = db.query(Stock).filter(Stock.symbol == symbol).order_by(Stock.timestamp).all()
    db.close()

    df = pd.DataFrame([{
        "ds": r.timestamp,
        "y": r.price
    } for r in records])

    if len(df) < 10:
        return {"error": "Not enough data for prediction"}

    model = Prophet(daily_seasonality=True)
    model.fit(df)

    future = model.make_future_dataframe(periods=5, freq="min")
    forecast = model.predict(future)

    predicted = forecast.tail(1)["yhat"].values[0]
    current = df.tail(1)["y"].values[0]
    trend = "uptrend" if predicted > current else "downtrend"

    return {
        "symbol": symbol,
        "current_price": round(float(current), 2),
        "predicted_price": round(float(predicted), 2),
        "trend": trend
    }
