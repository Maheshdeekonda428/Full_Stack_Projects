# E-Commerce Project Setup & Run Instructions

## Prerequisites
- Node.js installed.
- Python installed.
- MongoDB running (default port 27017).

## Backend Setup (FastAPI)
1. Navigate to `backend` folder:
   ```bash
   cd backend
   ```
2. Create virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   .\venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run server:
   ```bash
   uvicorn app.main:app --reload
   ```
   **API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

## Frontend Setup (Vite + React)
1. Navigate to `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run development server:
   ```bash
   npm run dev
   ```
   **App URL**: [http://localhost:5173](http://localhost:5173)  (Port may vary check terminal output)
