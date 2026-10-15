import "dotenv/config";
import cors from "cors";
import express from "express";
import { rateLimit } from "express-rate-limit";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PROVIDER_IDS, hasApiKey } from "./lib/providers.js";
import chatRouter from "./routes/chat.js";
import recommendRouter from "./routes/recommend.js";
import searchRouter from "./routes/search.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const port = Number(process.env.PORT) || 8787;
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

// Hosts like Render sit behind a proxy; trust it so rate limiting sees the real client IP.
app.set("trust proxy", 1);
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    providers: Object.fromEntries(PROVIDER_IDS.map((id) => [id, hasApiKey(id)])),
  });
});

// Protect the free-tier API quotas from being drained by a single visitor.
app.use(
  "/api",
  rateLimit({
    windowMs: 60_000,
    limit: Number(process.env.AFT_RATE_LIMIT) || 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many requests — please wait a minute and try again." },
  })
);

app.use("/api", chatRouter);
app.use("/api", recommendRouter);
app.use("/api", searchRouter);

// In production the built React app is served from here, so frontend and API share one origin.
const clientDist = path.resolve(__dirname, "../../client/dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api\/).*/, (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.listen(port, () => {
  console.log(`AI frontend toolkit server listening on http://localhost:${port}`);
});
