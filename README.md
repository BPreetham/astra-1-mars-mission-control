# ASTRA-1 — MARS MISSION CONTROL

A professional, futuristic, and operational mission-control platform designed for managing the emergency crisis at the **Astra-1 Mars colony** (10,000 population).

Strict Technology Constraint Adherence:
- **Frontend**: Next.js (App Router, Tailwind CSS, Lucide Icons, Interactive SVG Mars Tactical Surface Map, Ticking Live Recovery Clock)
- **Backend**: ASP.NET Core (.NET 8 Web API, Entity Framework Core, Npgsql Provider, Explainable Decision Support Engine, 12-Stage Crisis Simulation Engine)
- **Database**: PostgreSQL 17 (Relational schema with 16 tables, constraints, foreign keys, migrations, rich seed data)

---

## System Architecture

```
                    COLONY OPERATOR (Browser)
                               │
                               ▼
                    NEXT.JS FRONTEND (:3000)
        (App Router, Mars Map, Real-time Polling, Telemetry HUD)
                               │
                          REST API (HTTP)
                               ▼
               ASP.NET CORE .NET 8 WEB API (:5000)
    ┌──────────────────────────────────────────────────────────┐
    │ - Controllers & DTOs (Validation & Status Codes)         │
    │ - Data-Driven Decision Support Engine (100pt Scoring)     │
    │ - 12-Stage Crisis Simulation State Machine               │
    │ - Entity Framework Core (Npgsql Provider)                │
    └──────────────────────────────────────────────────────────┘
                               │
                               ▼
                   POSTGRESQL DATABASE (:5432)
   (Colonies, Robots, Telemetry, Astra Signals, Structure,
    Emergencies, Comms Nodes/Routes, Resources, Oxygen, Actions)
```

---

## Features & Navigation

1. **1. Command Center (`/`)**:
   - Header with Energy Storm Critical Alert (94.5% ionization), Mars Sol counter (Sol 428), UTC clock, and continuous 6-hour Astra recovery countdown (`05:42:18`).
   - 4 Live Status Cards: Oxygen (`78%`, `-8.4%`), Resources (`61%`), Comms (`Degraded`, `3 affected`), Robots (`9/12 Online`).
   - **Interactive Mars Tactical Map**: SVG topographic terrain with craters, sector grid (A-01 to C-24), toggleable layers (Robots, Astra Beacon, Energy Storm, Emergencies, Comms, Underground Structure), zoom/pan controls, and clickable entity inspection drawer with direct deployment actions.
   - **Critical Emergency Queue**: Prioritize, Assign rover, Resolve directly from the dashboard.
   - **Data-Driven Decision Support Panel**: Transparent factor contribution scoring (Signal strength 30pts, Robot proximity 20pts, Battery 15pts, Comms route 15pts, Urgency 20pts) with `[ACCEPT & DEPLOY]` and `[VIEW ANALYSIS]`.
   - **Mission Activity Feed**: Real-time event ticker streamed from PostgreSQL.

2. **2. Astra Tracking (`/astra`)**:
   - Protector intercept HUD, last known location (Sector B-17), signal strength (`88%`), confidence (`82%`), distance from base (`4.8 km`).
   - Signal strength and confidence curve chart over time.
   - Complete PostgreSQL beacon history event table.

3. **3. Robot Fleet (`/robots`)**:
   - Complete fleet telemetry for all 12 rovers (9 Online, 2 Searching, 1 Offline).
   - Detailed inspection modal with live temperature, coordinates, battery, and real commands: `[DEPLOY TO SECTOR B-17]`, `[RETURN TO BASE]`, `[CHANGE MISSION]`, and telemetry logs.

4. **4. Emergencies (`/emergencies`)**:
   - Grouped by severity: Critical, High, Medium, Low.
   - Direct triage actions: `[PRIORITIZE TO CRITICAL]`, rover assignment dropdown, and `[RESOLVE]`.

5. **5. Communications (`/communications`)**:
   - Hierarchical network topology tree from Colony Base Hub to Relays A, B, C, D.
   - Bypass route recommendation: `Colony -> Relay B -> Relay C -> R-04`.
   - `[ACTIVATE ROUTE]` button that executes a database transaction and displays before/after recovery metrics (Signal: `42% -> 79%`, Latency: `830ms -> 210ms`).

6. **6. Resources (`/resources`)**:
   - Gauges and status tracking for Oxygen, Water, Food, Power, Fuel, Medical Supplies.
   - Consumption & production rates, reserve estimates, 24-hour depletion trajectories.

7. **7. Analytics (`/analytics`)**:
   - Multi-metric historical analysis: Oxygen deficit, storm flux vs latency, fleet distribution, emergency severity distribution, auditable operator action logs.

8. **8. Underground Structure (`/structure`)**:
   - Sector B-21 investigation at 340m depth, 91% energy signature, 432.85 MHz resonance.
   - Side-by-side harmonic signal comparison between Astra's beacon (`88%`) and Subterranean Anomaly Alpha (`91%`).

9. **Crisis Simulation Engine (Global Toolbar)**:
   - `[START CRISIS]`, `[STEP NEXT]`, `[RESET]`.
   - Steps through 12 crisis stages, updating actual database state:
     - Stage 1: Energy Storm Detected
     - Stage 2: Communication Degraded
     - Stage 3: Oxygen Production Dropping
     - Stage 4: Robots Failing (R-07 offline)
     - Stage 5: Astra-like Signal Detected
     - Stage 6: Unknown Structure Detected
     - Stage 7: System Analyzes Data
     - Stage 8: Recommendation Formulated
     - Stage 9: Operator Accepts Recommendation
     - Stage 10: Robot Deployed & En Route
     - Stage 11: New Telemetry Received
     - Stage 12: Astra Signal Confidence Locked & Mission Adapted

---

## Running the Application

### One-Command Launch:
```bash
cd /Users/apple/Desktop/ASTRA-1-Mars-Crisis
./start.sh
```

### Stop Services:
```bash
./stop.sh
```

### Direct URLs:
- **Next.js Frontend**: http://localhost:3000
- **.NET 8 Backend API**: http://localhost:5000/api
- **Swagger Documentation**: http://localhost:5000/swagger
- **PostgreSQL**: `localhost:5432` (Database: `astra_mission_db`, User: `postgres`)
