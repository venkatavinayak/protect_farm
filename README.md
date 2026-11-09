# 🌾 PROTECTFARM: Real-Time Agricultural Intelligence & Farmer Welfare Platform

An all-in-one, real-time agricultural climate defense and advisory web platform. **PROTECTFARM** connects smallholder farmers to micro-climate weather forecasts, assesses threats tailored specifically to each crop's water requirements and phenological vulnerability, provides Explainable AI (XAI) mitigation strategies, speaks alerts aloud via a multilingual voice assistant, and links to verified eco-friendly bio-pesticides.

---

## 🏗️ Architecture & Tech Stack

| Layer | Technology | Deployment |
| :--- | :--- | :--- |
| **Frontend** | React 18, Tailwind CSS, Lucide Icons, Leaflet GIS, Web Speech API | **Netlify** (Edge CDN + Proxy Redirects) |
| **Backend** | Python 3.11+, FastAPI (Async), Uvicorn | **Render** (Web Service + Background Workers) |
| **Database** | MySQL 8.0 with Spatial Geometry (`SRID 4326`, `POLYGON`, `POINT`) + SQLAlchemy Async | **Render MySQL** / Local MySQL |
| **Intelligence** | Open-Meteo & OpenWeatherMap APIs, Agronomic CWR Engine, Google Gemini AI (XAI) | Asynchronous Pipelines |
| **Voice / Speech** | Web Speech API SpeechSynthesis with regional Indian accents | Client-Side Zero-Latency |
| **E-Commerce** | Integrated Pest Management (IPM) biological linker | BigHaat, AgriBegri, Amazon India |

---

## 🌟 Core Features Implemented

### 1. Interactive Geospatial Farm Mapping
- **Centroid & Parcel Pinning:** Farmers drop a pin or sketch their farm boundaries directly onto satellite imagery.
- **Automated Acreage Calculation:** Derives geodesic land area (in Acres / Hectares) and binds latitude/longitude to the farm record.
- **GPS Snap:** One-tap geolocation snap (`navigator.geolocation`) directly out in the field.

### 2. Crop-Specific Weather Threat Engine
Differentiates rainfall and wind hazards based on **Crop Water Requirements (CWR)**:
- **Paddy / Rice (Wetland):** Moderate rainfall (15–45 mm) triggers a **SAFE / BENEFICIAL** status, advising the farmer to turn off tube-well pumps to conserve water and power.
- **Groundnut & Pulses (Arid Legumes):** Moderate rainfall (>20 mm) triggers a **CRITICAL / WARNING** status for **Root Rot & Anoxia**, alerting that saturated soil causes root nodule suffocation within 18–24 hours.
- **Banana, Sugarcane & Maize (Tall Stalks):** High wind gusts (>35 km/h) trigger a **CRITICAL LODGING ALERT** to prevent pseudostem breakage.

### 3. Explainable AI (XAI) & 3-Step Mitigation Planning
- **Agronomic Causation:** Explains the physiological reason *why* the weather hurts that crop (e.g., Pythium spore germination, pollen wash-off).
- **Time-Critical Action Plan:**
  1. *Immediate (Next 4–6 Hours):* Drainage trench excavation, propping, pump shutoff.
  2. *During Event:* Halting nitrogen/urea fertilizer broadcasting to stop leaching.
  3. *Post-Event (Within 24 Hours):* Prophylactic bio-fungicide drenching.

### 4. Multilingual Translation & Voice Assistant
- Converts alerts and mitigation steps into regional Indian languages:
  - **Telugu (తెలుగు)**
  - **Hindi (हिन्दी)**
  - **Tamil (தமிழ்)**
  - **Kannada (ಕನ್ನಡ)**
  - **Marathi (मराठी)**
  - **English**
- **Voice Synthesizer:** Reads alerts aloud in native dialects with adjustable speed controls (0.9x / 1.1x) to accommodate varying literacy levels.

### 5. Geospatial AI Crop Recommendation Studio
- Ingests farm latitude/longitude, analyzes soil type (Black Cotton, Alluvial Loam), soil pH, groundwater table, and annual rainfall curves.
- Ranks the **Top 3 Recommended Crops** with match percentage, projected yield per acre, and estimated net profit per acre.
- One-click **"Plant This Crop"** button to immediately add it to the active farm.

### 6. Eco-Friendly Bio-Pesticide & E-Commerce Linker
- Recommends *only* certified 100% organic biological agents:
  - *Neem Oil 10,000 PPM* (Azadirachtin)
  - *Trichoderma Viride* (Bio-fungicide)
  - *Beauveria Bassiana* (Bio-insecticide)
  - *Pseudomonas Fluorescens* (Bio-bactericide)
- Includes live/deep-links to **BigHaat**, **AgriBegri**, and **Amazon India** for rapid ordering.

### 7. Emergency Email Alerts
- Asynchronously sends responsive HTML threat notification emails with full mitigation steps and weather radar metrics.

---

## 🚀 Quickstart Guide (Local Development)

### 1. Start the FastAPI Backend
```bash
cd backend
python -m pip install -r requirements.txt
# Run the async server (creates SQLite/MySQL tables automatically on launch)
uvicorn app.main:app --reload --port 8000
```
API Documentation will be live at: `http://localhost:8000/docs`

### 2. Start the Frontend (Vite + React)
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🌐 Production Deployment

### Deploying to Netlify (Frontend)
1. Push this repository to GitHub.
2. In the **Netlify Dashboard**, click **Add New Site** > **Import an existing project**.
3. Select this repository:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Netlify automatically reads `frontend/netlify.toml` and proxies `/api/*` traffic directly to your Render backend.

### Deploying to Render (Backend & MySQL)
1. In the **Render Dashboard**, click **New** > **Blueprint**.
2. Select this repository (Render reads `backend/render.yaml`).
3. Render automatically provisions:
   - **`protectfarm-backend`:** FastAPI Web Service.
   - **`protectfarm-mysql`:** Managed MySQL 8.0 instance with spatial extensions.
4. Set your environment variables in the Render dashboard:
   - `OPENWEATHER_API_KEY` (optional; Open-Meteo works automatically out-of-the-box!)
   - `GEMINI_API_KEY` (optional; expert agronomy fallback runs automatically)
   - `SMTP_USER` & `SMTP_PASSWORD` (for transactional emails)
