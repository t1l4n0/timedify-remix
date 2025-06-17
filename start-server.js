#!/usr/bin/env node

// Explizites Server-Startskript für die Remix-App
// Setzt Host auf 0.0.0.0 und Port auf 8080 (oder ENV-Variable PORT)

import { createRequestHandler } from "@remix-run/express";
import express from "express";
import { broadcastDevReady } from "@remix-run/node";

// ESM-Import des gebauten Servers
import * as build from "./build/server/index.js";

const app = express();
const port = process.env.PORT || 8080;
const host = process.env.HOST || "0.0.0.0";

// Alle anderen Middleware zuerst...
app.use(express.static("public"));

// Dann der Remix-Request-Handler
app.all(
  "*",
  createRequestHandler({
    build,
    mode: process.env.NODE_ENV
  })
);

app.listen(port, host, () => {
  console.log(`🚀 Remix-App läuft auf http://${host}:${port}`);
  if (process.env.NODE_ENV === "development") {
    broadcastDevReady(build);
  }
});
