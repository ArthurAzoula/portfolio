import { config } from "./config.js";

interface StravaTokenResponse {
  access_token: string;
  expires_at: number;
  refresh_token?: string;
}

interface StravaAthlete {
  id: number;
}

interface StravaRunTotals {
  count?: number;
  distance?: number;
  moving_time?: number;
}

interface StravaAthleteStats {
  all_run_totals?: StravaRunTotals;
  all_ride_totals?: StravaRunTotals;
  all_swim_totals?: StravaRunTotals;
}

interface StravaRawActivity {
  id: number;
  name: string;
  sport_type?: string;
  type: string;
  distance: number;
  moving_time: number;
  start_date_local: string;
  average_speed: number;
  total_elevation_gain: number;
  kudos_count: number;
}

export interface AthleteStats {
  totalRuns: number;
  totalRunDistance: number;
  totalRunTime: number;
  totalRides: number;
  totalRideDistance: number;
  totalRideTime: number;
  totalActivities: number;
  totalDistance: number;
  totalTime: number;
}

export interface Activity {
  id: number;
  name: string;
  type: string;
  distance: number;
  movingTime: number;
  startDate: string;
  averageSpeed: number;
  totalElevationGain: number;
  kudosCount: number;
}

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() / 1000 < tokenExpiresAt - 60) {
    return cachedToken;
  }

  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: config.strava.clientId,
      client_secret: config.strava.clientSecret,
      refresh_token: config.strava.refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    throw new Error(`Strava token refresh failed: ${res.status}`);
  }

  const data = (await res.json()) as StravaTokenResponse;
  cachedToken = data.access_token;
  tokenExpiresAt = data.expires_at;

  if (data.refresh_token) {
    config.strava.refreshToken = data.refresh_token;
  }

  return cachedToken;
}

async function stravaFetch<T>(endpoint: string): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(`https://www.strava.com/api/v3${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`Strava API error: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL = 15 * 60 * 1000;

function withCache<T>(key: string, fetcher: () => Promise<T>): () => Promise<T> {
  return async () => {
    const cached = cache.get(key) as CacheEntry<T> | undefined;
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    const data = await fetcher();
    cache.set(key, { data, timestamp: Date.now() });
    return data;
  };
}

export const getAthleteStats = withCache<AthleteStats>("stats", async () => {
  const athlete = await stravaFetch<StravaAthlete>("/athlete");
  const stats = await stravaFetch<StravaAthleteStats>(`/athletes/${athlete.id}/stats`);

  return {
    totalRuns: stats.all_run_totals?.count || 0,
    totalRunDistance: stats.all_run_totals?.distance || 0,
    totalRunTime: stats.all_run_totals?.moving_time || 0,
    totalRides: stats.all_ride_totals?.count || 0,
    totalRideDistance: stats.all_ride_totals?.distance || 0,
    totalRideTime: stats.all_ride_totals?.moving_time || 0,
    totalActivities:
      (stats.all_run_totals?.count || 0) +
      (stats.all_ride_totals?.count || 0) +
      (stats.all_swim_totals?.count || 0),
    totalDistance:
      (stats.all_run_totals?.distance || 0) +
      (stats.all_ride_totals?.distance || 0) +
      (stats.all_swim_totals?.distance || 0),
    totalTime:
      (stats.all_run_totals?.moving_time || 0) +
      (stats.all_ride_totals?.moving_time || 0) +
      (stats.all_swim_totals?.moving_time || 0),
  };
});

export const getRecentActivities = withCache<Activity[]>("activities", async () => {
  const activities = await stravaFetch<StravaRawActivity[]>("/athlete/activities?per_page=5");

  return activities.map((a) => ({
    id: a.id,
    name: a.name,
    type: a.sport_type || a.type,
    distance: a.distance,
    movingTime: a.moving_time,
    startDate: a.start_date_local,
    averageSpeed: a.average_speed,
    totalElevationGain: a.total_elevation_gain,
    kudosCount: a.kudos_count,
  }));
});
