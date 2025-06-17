#!/bin/sh

# Führe das Setup durch (Datenbank-Migration usw.)
npm run setup

# Starte die App mit dem expliziten Remix-Server-Befehl
# Wir übergeben explizit die Parameter für Host und Port
echo "Starte Server auf 0.0.0.0:8080..."
node node_modules/@remix-run/serve/dist/cli.js ./build/server/index.js --host 0.0.0.0 --port 8080
