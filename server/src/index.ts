import express, { type Request, type Response } from "express";
import cors from "cors";
import { config } from "./config.js";
import { getAthleteStats, getRecentActivities } from "./strava.js";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:4321", "http://localhost:3000"],
  })
);

app.get("/api/strava/stats", async (_req: Request, res: Response) => {
  try {
    const stats = await getAthleteStats();
    res.json(stats);
  } catch (err) {
    console.error("Strava stats error:", (err as Error).message);
    res.status(502).json({ error: "Failed to fetch Strava stats" });
  }
});

app.get("/api/strava/activities", async (_req: Request, res: Response) => {
  try {
    const activities = await getRecentActivities();
    res.json(activities);
  } catch (err) {
    console.error("Strava activities error:", (err as Error).message);
    res.status(502).json({ error: "Failed to fetch Strava activities" });
  }
});

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});
