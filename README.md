# Real-Time Air Quality Index (AQI) Aggregator & Mapping System

> **A full-stack MERN application for collecting real-time air quality metrics, storing timestamped pollutant readings, running scheduled data collection jobs, and presenting interactive maps, trend charts, multi-city comparisons, and health advisories.**

---

## 📌 Problem Statement

Air pollution is a major environmental health risk globally. However, public air quality information is often fragmented across multiple raw data sources or locked behind complex dashboards. Citizens, researchers, and urban planners require a centralized system that continuously aggregates real-time readings for key atmospheric pollutants, tracks historical trends, and delivers actionable, easy-to-understand health guidance.

---

## 🎯 Project Objectives

1. **Automated Real-Time Data Collection**: Fetch live air quality and pollutant readings for tracked global cities using a public API.
2. **Scheduled Background Synchronization**: Periodically poll and store timestamped readings in MongoDB using `Node-Cron`.
3. **Comprehensive Pollutant Tracking**: Monitor six mandatory atmospheric pollutants: **PM2.5**, **PM10**, **NO2**, **SO2**, **CO**, and **O3**.
4. **Interactive Geospatial Visualization**: Render dynamic interactive maps with color-coded severity markers using `Leaflet` / `React-Leaflet`.
5. **Historical Trend Analysis**: Display historical AQI trajectories over 24–48 hours using `Recharts` line charts.
6. **Multi-City Comparison**: Enable side-by-side analysis of air quality and pollutant parameters across multiple cities.
7. **Context-Aware Health Advisories**: Provide plain-language health recommendations and mask/activity guidelines tailored to the US EPA AQI category.

---

## 🌟 Key Features

- **Live AQI Hero Overview**: Displays current US EPA AQI score, severity category, dominant pollutant, last updated timestamp, and progress gauge.
- **Interactive Leaflet Map**: Dynamic map displaying color-coded markers for all tracked cities with click popups and smooth fly-to animations.
- **Detailed Pollutant Breakdown**: Progress cards for PM2.5, PM10, NO2, SO2, CO, and O3 with safety standard indicators and health impact notes.
- **Historical Trend Chart**: Recharts line chart supporting metric toggles (AQI, PM2.5, PM10, NO2, SO2, CO, O3) over past 24–48 hours with automated history backfilling.
- **Multi-City Comparison**: Interactive bar chart and parameter matrix allowing side-by-side comparison of up to 4 cities.
- **Health & Safety Guidance**: Plain-language health advisories, sensitive group alerts, and actionable recommendations (mask usage, ventilation, outdoor exercise).
- **City Search & Tracking Modal**: Fast search filtering plus a modal to start tracking custom geographic coordinates.
- **Zero-Config Fallback**: Automatic connection to local MongoDB with seamless `mongodb-memory-server` fallback for instant plug-and-play local execution.

---

## 🛠️ Technology Stack

- **Frontend**: React.js (Vite), React-Leaflet, Leaflet, Recharts, Lucide-React, Axios, Vanilla CSS
- **Backend**: Node.js, Express.js, Node-Cron, Mongoose
- **Database**: MongoDB (Local or MongoDB Atlas) + In-Memory Fallback
- **Data Source**: Open-Meteo Air Quality API (Default zero-key provider) & WAQI API adapter

---

## 🏗️ Architecture & Data Flow

```text
Public AQI API (Open-Meteo / WAQI)
       │
       ▼
Backend Scheduled Collector (Node-Cron Job)
       │
       ▼
Node.js / Express.js Server
       │
       ▼
MongoDB Database (City, AQIReading, HealthAdvisory)
       │
       ▼
Express REST API Endpoints
       │
       ▼
React Frontend (Vite + Axios + Leaflet + Recharts)
```

---

## 📁 Folder Structure

```text
AQI-aggregator/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── AQICard.jsx
│   │   │   ├── PollutantCard.jsx
│   │   │   ├── AQIMap.jsx
│   │   │   ├── TrendChart.jsx
│   │   │   ├── CityComparison.jsx
│   │   │   ├── HealthAdvisory.jsx
│   │   │   ├── LoadingState.jsx
│   │   │   └── ErrorState.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── utils/
│   │   │   └── aqiUtils.js
│   │   ├── pages/
│   │   │   └── Dashboard.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── cityController.js
│   │   └── aqiController.js
│   ├── jobs/
│   │   └── cronCollector.js
│   ├── models/
│   │   ├── City.js
│   │   ├── AQIReading.js
│   │   └── HealthAdvisory.js
│   ├── routes/
│   │   ├── cityRoutes.js
│   │   └── aqiRoutes.js
│   ├── services/
│   │   └── aqiProviderService.js
│   ├── utils/
│   │   ├── aqiCalculator.js
│   │   └── seedCities.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── .env.example
└── README.md
```

---

## 🚀 Installation & Setup Instructions

### Prerequisites
- Node.js (v18.x or higher)
- npm or yarn
- MongoDB installed locally (Optional: if not running, server automatically starts an In-Memory MongoDB instance).

---

### Step 1: Install Server Dependencies

```bash
cd server
npm install
```

### Step 2: Install Client Dependencies

```bash
cd ../client
npm install
```

---

## ⚙️ Environment Variables

Create `.env` files in both `server/` and `client/` directories based on the provided `.env.example` templates:

### `server/.env`
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/aqi_aggregator
CRON_SCHEDULE=*/15 * * * *
# Optional: WAQI API key (Default: Open-Meteo Air Quality API requires zero key)
# WAQI_API_KEY=your_waqi_api_key_here
```

### `client/.env`
```env
VITE_API_URL=/api
```

---

## 🏃 Running the Application

### 1. Start the Backend Server

```bash
cd server
npm run dev
```
*The server will connect to MongoDB, seed initial global cities (New Delhi, Beijing, Tokyo, London, New York, etc.), fetch initial live readings, and launch the Node-Cron scheduler on port `5000`.*

### 2. Start the React Frontend

Open a new terminal window:

```bash
cd client
npm run dev
```
*Vite will start the client dev server at `http://localhost:5173`.*

---

## ⏰ Scheduled Data Collection Flow

- **Cron Engine**: Configured via `node-cron` running in `server/jobs/cronCollector.js`.
- **Default Frequency**: Executes every 15 minutes (`*/15 * * * *`).
- **Data Validation & Deduplication**:
  - Fetches current pollutant values from the provider adapter (`aqiProviderService.js`).
  - Checks if the reading changed significantly or exceeds time thresholds before inserting new documents to prevent database bloat.
  - Handles API/network timeouts gracefully without disrupting other cities.

---

## 📡 REST API Endpoint Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Backend status & uptime health check |
| `GET` | `/api/cities` | List all tracked cities and coordinates |
| `POST` | `/api/cities` | Register a new city for real-time tracking |
| `GET` | `/api/aqi/latest` | Fetch latest AQI overview for all tracked cities |
| `GET` | `/api/aqi/latest/:cityName` | Fetch latest detailed AQI reading for a specific city |
| `GET` | `/api/aqi/history/:cityName?hours=48` | Query historical readings for time-series trend chart |
| `POST` | `/api/aqi/compare` | Compare 2–4 selected cities side-by-side |
| `POST` | `/api/aqi/trigger-fetch` | Manually trigger a background cron collection cycle |
| `GET` | `/api/aqi/advisory/:category` | Get health advisory guidance by category |

---

## 🛡️ License

This project is open-source and built for educational and academic presentation purposes.
