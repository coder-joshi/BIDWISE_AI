# BidVerify AI

BidVerify AI is a centralized platform for government procurement and automated compliance verification. Built to scale, this application streamlines tender evaluations, significantly reduces the manual verification burden on officers, and incorporates real-time AI to intelligently extract and evaluate data from government bids.

## 🚀 Features

- **Automated AI Extraction**: Integrates Google Gemini API to parse PDFs, presentations, and documents to extract crucial bidding parameters (GST, PAN, Udyam Registration, Financial Turnover).
- **Compliance Dashboards**: Dynamic, real-time analytics dashboards offering insight into compliance scores, risk levels, and tender eligibility.
- **Fraud Detection**: Utilizes machine learning metrics to detect suspicious patterns, manipulated documents, and anomalies across bids.
- **Microservice Architecture**: Decoupled environment featuring a high-performance Python FastAPI engine for AI inference and a Node.js Express backend for user authentication and state management.

## 🛠️ Technology Stack

- **Frontend**: React, Vite, Tailwind CSS, Recharts, Zustand (State Management)
- **AI / Data Backend**: Python, FastAPI, Google Generative AI (Gemini)
- **Auth Backend**: Node.js, Express, Mongoose
- **Database**: MongoDB (via Mongoose)

## 📦 Project Structure

```
.
├── backend/            # Node.js + Express backend (Auth & Sessions)
├── python-backend/     # Python FastAPI backend (AI engine & Data routing)
└── frontend/           # React frontend application
```

## ⚙️ Getting Started

### Prerequisites
- Node.js & npm
- Python 3.9+
- MongoDB instance running locally (or adjust connection string)
- Gemini API Key

### 1. Set up the AI Backend (Python)
Navigate to the `python-backend` directory, install dependencies, set your Gemini API key, and start the server:

```bash
cd python-backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
export GEMINI_API_KEY="your_api_key_here"
python3 main.py
```
*Runs on `http://localhost:8000`*

### 2. Set up the Auth Backend (Node.js)
Navigate to the `backend` directory, install dependencies, and start the server:

```bash
cd backend
npm install
node server.js
```
*Runs on `http://localhost:4000`*

### 3. Set up the Frontend (React)
Navigate to the `frontend` directory, install dependencies, and start the development server:

```bash
cd frontend
npm install
npm run dev
```
*Runs on `http://localhost:5173`*

## 🛡️ License
This project is proprietary and intended for internal government verification usage.
