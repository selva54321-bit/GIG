# GigShield: Parametric Protection & Yield for the Gig Economy

**GigShield** is a zero-touch, parametric protection platform designed to solve the income volatility of gig workers (Swiggy, Zomato, Zepto) due to disruptive events like heavy rain, heatwaves, or high pollution. 

Unlike traditional insurance, **GigShield** combines insurance-like protection with an investment corpus (**GigCorpus**) to ensure workers either get paid for disruptions *or* build wealth over time.

---

## 🚀 Key Innovation: "Zero-Touch" Protection
- **Parametric Triggers**: Claims are fired automatically based on real-time weather, AQI, and government alerts. 
- **The GigCorpus**: 45% of premiums go into a long-term yield fund, ensuring workers get value even if they never file a claim.
- **AI Fraud Engine**: 5-layer detection system (GPS, Node analysis, Platform signals) allows instant payouts without human intervention.

---

## 📂 Project Structure
- `/services/core-backend`: Node.js/Express API (Insurance engine + Cron triggers).
- `/services/ml-fraud-engine`: Python FastAPI (XGBoost Pricing + GNN Risk Scoring).
- `/apps/admin-dashboard`: React web app (Operations, Risk Hub, and **Worker Simulator**).
- `/apps/worker-app`: React Native source (for future mobile deployment).

---

## 🛠️ How to Run (Hackathon Demo Mode)

To run the complete integrated stack for a live demo:

### 1. Prerequisites
- Docker & Docker Compose
- Node.js (v18+) & Python (3.9+)

### 2. One-Click Startup (Recommended)
From the project root, run:
```bash
docker-compose up -d --build
```
*This will spin up the Node Backend, Python ML Service, PostgreSQL, and Redis.*

---

### 3. Manual Start (Developer Mode)

If you prefer running services manually, open **four terminals**:

**Terminal A: ML Engine (Python)**
```bash
cd services/ml-fraud-engine
pip install -r requirements.txt
python app/main.py
```

**Terminal B: Core Backend (Node)**
```bash
cd services/core-backend
npm install
npm start
```

**Terminal C: Admin Dashboard & Simulator (Web)**
```bash
cd apps/admin-dashboard
npm install
npm start
```
*Visit `http://localhost:3000` to view the unified demo.*

---

## 🎭 5-Minute Demo Script (Judges' Protocol)

1.  **Open the Admin Dashboard**: `http://localhost:3000`.
2.  **Dashboard Hub**: Showcase the "Resource Liquidity" (GigCorpus performance) and "Investigation Hub".
3.  **The Flip (Worker View)**: Click the **"Worker App"** button in the header. Show exactly what Ramesh (the driver) sees on his phone.
4.  **Parametric Trigger**:
    - On the phone simulator, click **"REPORT AN INCIDENT"**.
    - Click **"YES, TRIGGER CLAIM"**.
    - **Watch the slider**: An emerald-green "Payout Received" banner appears instantly. **Tell the judges**: *"Zero human touch, zero paper, instant credit."*
5.  **Wealth Building**: Switch the phone simulator to the **"Corpus"** tab to show the ₹8,000+ driver's savings building from their ₹39/week premium.

---

## 🧑‍💻 Technical Compliance
- **DevTrails 2026**: Fully compliant. NO health, life, or accident logic. 
- **Hardcoded Cycles**: All premiums and payouts follow a strict 7-day hardcoded cycle.
- **Parametric First**: Only external indices (AQI, Rain) drive claim events.
