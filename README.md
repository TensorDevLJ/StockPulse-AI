# 🧠 StockPulse-AI  
**Real-Time Stock Market Data Pipeline with AI Price Prediction**

StockPulse-AI is a full-stack web application that provides **real-time stock price visualization and AI-based price predictions**.  
The backend uses **FastAPI** to fetch and process live market data, while the frontend built with **React + TypeScript + Tailwind CSS** offers an intuitive and interactive dashboard for users.

---

## 📊 Key Features

### 💡 Real-Time Market Data  
- Fetches and displays **live stock prices** using external APIs.  
- Auto-updates charts with smooth transitions.  

### 🤖 AI-Powered Predictions  
- Uses a **machine learning model** (trained on historical data) to predict short-term price movements.  
- Displays predicted trends visually on the stock chart.  

### 🧩 Interactive Dashboard  
- Responsive and modern UI built with **React + Tailwind + ShadCN UI components**.  
- Includes **search**, **stock selection**, and **detailed metrics** sections.  

### ⚡ FastAPI Backend  
- Lightweight REST API built with **FastAPI** for fast responses.  
- Handles data fetching, preprocessing, and model inference efficiently.  

### 💾 Local SQLite Database  
- Caches fetched stock data in `stocks.db` for improved performance.  
- Works even without an active internet connection once data is cached.  

---

## 🛠️ Tech Stack

### **Frontend**
- React 18 + TypeScript  
- Vite  
- Tailwind CSS + ShadCN/UI  
- Axios (API calls)  
- Recharts (Data visualization)

### **Backend**
- FastAPI (Python)  
- SQLite (Local database)  
- Pandas, NumPy (Data processing)  
- Scikit-learn / Transformer model (AI prediction)  

---

## 🗂️ Folder Structure
```
StockPulse-AI/
├── backend/
│   ├── main.py              # FastAPI entry point
│   ├── fetcher.py           # Fetches real-time stock data
│   ├── model.py             # AI/ML model logic
│   ├── database.py          # SQLite setup and management
│   ├── schemas.py           # Pydantic models
│   ├── utils.py             # Helper functions
│   ├── stocks.db            # Local database (auto-created)
│   └── requirements.txt     # Python dependencies
│
└── frontend/
    ├── src/
    │   ├── pages/           # Page components
    │   ├── components/      # UI + chart components
    │   ├── lib/             # API and utility modules
    │   └── main.tsx         # App entry point
    ├── package.json
    ├── tailwind.config.ts
    ├── vite.config.ts
    └── README-SETUP.md
```

---

## 🚀 Setup Instructions

### 1️⃣ Clone Repository
```bash
git clone https://github.com/TensorDevLJ/StockPulse-AI.git
cd StockPulse-AI
```

---

## 🧩 Backend Setup (FastAPI)

### 2️⃣ Go to backend folder
```bash
cd backend
```

### 3️⃣ Create and activate virtual environment
```bash
python -m venv venv
# For Windows
venv\Scripts\activate
# For macOS/Linux
source venv/bin/activate
```

### 4️⃣ Install dependencies
```bash
pip install -r requirements.txt
```

### 5️⃣ Run the FastAPI server
```bash
uvicorn main:app --reload
```

Server will start at 👉 **http://127.0.0.1:8000**

Test endpoint:
```
http://127.0.0.1:8000/docs
```

---

## 💻 Frontend Setup (React + TypeScript)

### 6️⃣ Open a new terminal and navigate to frontend
```bash
cd ../frontend
```

### 7️⃣ Install dependencies
```bash
npm install
```

### 8️⃣ Run the frontend
```bash
npm run dev
```

Frontend will start at 👉 **http://localhost:5173**

---

## 🔄 Connecting Frontend & Backend

- The frontend communicates with the FastAPI backend via `http://127.0.0.1:8000`.  
- API configuration is handled inside:  
  ```
  frontend/src/lib/api.ts
  ```
- Make sure both servers are running simultaneously.

---

## 🧠 Example Workflow

1. User selects a stock symbol (e.g., AAPL or TCS).  
2. Backend fetches latest market data and predicts near-future trends.  
3. Frontend displays:
   - Real-time price updates  
   - AI-generated prediction graph  
   - Additional insights and metrics  

---

## 🧾 Future Improvements

- Integrate **WebSockets** for true real-time streaming.  
- Add **user authentication** and portfolio management.  
- Support **multiple AI models** for comparison.  
- Add **dark/light themes** and advanced analytics dashboard.  
- Deploy backend (FastAPI) to Render or Railway and frontend to Vercel.

---

## 🧑‍💻 Author
**Likhitha J**  
🚀 *Developer | AI + Full Stack Enthusiast*  
🌐 GitHub: [TensorDevLJ](https://github.com/TensorDevLJ)
