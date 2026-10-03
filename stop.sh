#!/bin/bash
echo "Stopping ASTRA-1 Mission Control services..."
kill $(lsof -t -i:3000) 2>/dev/null
kill $(lsof -t -i:5000) 2>/dev/null
echo "Stopping PostgreSQL server..."
/opt/anaconda3/envs/astra_pg/bin/pg_ctl -D /Users/apple/Desktop/ASTRA-1-Mars-Crisis/pgdata stop 2>/dev/null
echo "✓ All services stopped."
