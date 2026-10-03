#!/bin/bash
echo "=== Starting ASTRA-1: Mars Mission Control System ==="

# 1. Start PostgreSQL 17
export PATH="/opt/anaconda3/envs/astra_pg/bin:$PATH"
if pg_ctl -D /Users/apple/Desktop/ASTRA-1-Mars-Crisis/pgdata status > /dev/null 2>&1; then
    echo "✓ PostgreSQL server is already running on port 5432"
else
    echo "Starting PostgreSQL server..."
    pg_ctl -D /Users/apple/Desktop/ASTRA-1-Mars-Crisis/pgdata -l /Users/apple/Desktop/ASTRA-1-Mars-Crisis/pgdata/logfile start
fi

# 2. Start ASP.NET Core Web API (:5000)
echo "Starting ASP.NET Core .NET 8 Web API on http://localhost:5000 ..."
cd /Users/apple/Desktop/ASTRA-1-Mars-Crisis/backend/AstraMissionControl.Api
~/.dotnet/dotnet run > /Users/apple/Desktop/ASTRA-1-Mars-Crisis/backend.log 2>&1 &
BACKEND_PID=$!
echo "✓ Backend launched (PID: $BACKEND_PID)"

# 3. Start Next.js Frontend (:3000)
echo "Starting Next.js frontend on http://localhost:3000 ..."
cd /Users/apple/Desktop/ASTRA-1-Mars-Crisis/frontend
npm run start -- -p 3000 > /Users/apple/Desktop/ASTRA-1-Mars-Crisis/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "✓ Frontend launched (PID: $FRONTEND_PID)"

echo "====================================================="
echo "ASTRA-1 MARS MISSION CONTROL IS LIVE!"
echo "Frontend Dashboard: http://localhost:3000"
echo "Backend REST API:   http://localhost:5000/api"
echo "Swagger API Docs:   http://localhost:5000/swagger"
echo "PostgreSQL:         localhost:5432 (astra_mission_db)"
echo "====================================================="
