FROM node:18-alpine
RUN apk add --no-cache openssl

EXPOSE 8080

WORKDIR /app

# Umgebungsvariablen für korrekte Portbindung
ENV NODE_ENV=production
ENV PORT=8080
# HOST wird im Startup-Script gesetzt

COPY package.json package-lock.json* ./

RUN npm ci --omit=dev && npm cache clean --force
# Remove CLI packages since we don't need them in production by default.
# Remove this line if you want to run CLI commands in your container.
RUN npm remove @shopify/cli

COPY . .

RUN npm run build

# Prisma Client vor dem Start generieren
RUN npx prisma generate

# Direkt den Server mit expliziten Host- und Port-Parametern starten
CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && node node_modules/@remix-run/serve/dist/cli.js build/server/index.js --host 0.0.0.0 --port 8080"]
