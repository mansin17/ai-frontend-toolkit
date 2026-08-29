import "dotenv/config";
import cors from "cors";
import express from "express";
import chatRouter from "./routes/chat.js";
import recommendRouter from "./routes/recommend.js";
import searchRouter from "./routes/search.js";

const app = express();
const port = Number(process.env.PORT) || 8787;
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    providers: {
      openai: Boolean(process.env.OPENAI_API_KEY),
      anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
    },
  });
});

app.use("/api", chatRouter);
app.use("/api", recommendRouter);
app.use("/api", searchRouter);

app.listen(port, () => {
  console.log(`AI frontend toolkit server listening on http://localhost:${port}`);
});
