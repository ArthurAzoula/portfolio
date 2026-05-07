import { useState, useEffect } from 'react';

interface StravaStats {
  totalActivities: number;
  totalDistance: number;
  totalTime: number;
  totalRuns: number;
  totalRunDistance: number;
  totalRides: number;
  totalRideDistance: number;
}

interface StravaActivity {
  id: number;
  name: string;
  type: string;
  distance: number;
  movingTime: number;
  startDate: string;
  totalElevationGain: number;
  kudosCount: number;
}

interface Props {
  locale: string;
}

const API_BASE = import.meta.env.DEV ? 'http://localhost:3001' : '';

const activityIcons: Record<string, string> = {
  Run: '🏃',
  Ride: '🚴',
  Swim: '🏊',
  Walk: '🚶',
  Hike: '🥾',
  WeightTraining: '🏋️',
  Workout: '💪',
  Tennis: '🎾',
  default: '🏅',
};

function formatDistance(meters: number): string {
  return (meters / 1000).toFixed(1);
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h${m.toString().padStart(2, '0')}`;
  return `${m}min`;
}

function formatTotalTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  return `${hours}h`;
}

function formatDate(dateStr: string, locale: string): string {
  return new Date(dateStr).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
    day: 'numeric',
    month: 'short',
  });
}

export default function StravaStats({ locale }: Props) {
  const [stats, setStats] = useState<StravaStats | null>(null);
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/strava/stats`).then((r) => r.ok ? r.json() : Promise.reject()),
      fetch(`${API_BASE}/api/strava/activities`).then((r) => r.ok ? r.json() : Promise.reject()),
    ])
      .then(([s, a]) => {
        setStats(s);
        setActivities(a);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-[3rem]">
        <div className="flex items-center gap-[0.75rem] text-brown-light">
          <svg className="w-[1.25rem] h-[1.25rem] animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-[0.875rem] font-medium">
            {locale === 'fr' ? 'Chargement Strava...' : 'Loading Strava...'}
          </span>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return null;
  }

  const labels = {
    fr: { activities: 'Activités', distance: 'Distance', time: 'Temps', recent: 'Activités récentes', elev: 'D+' },
    en: { activities: 'Activities', distance: 'Distance', time: 'Time', recent: 'Recent activities', elev: 'Elev.' },
  };
  const l = labels[locale as 'fr' | 'en'] || labels.en;

  return (
    <div className="mt-[3rem]">
      <div className="flex items-center gap-[0.625rem] mb-[1.5rem]">
        <svg className="w-[1.25rem] h-[1.25rem]" viewBox="0 0 24 24" fill="#FC4C02">
          <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
        </svg>
        <span className="text-[0.75rem] font-black uppercase tracking-[0.14em] text-brown-light">
          Strava
        </span>
      </div>

      <div className="grid grid-cols-3 gap-[0.75rem] mb-[1.5rem]">
        <div className="strava-stat">
          <div className="strava-stat-value">{stats.totalActivities}</div>
          <div className="strava-stat-label">{l.activities}</div>
        </div>
        <div className="strava-stat">
          <div className="strava-stat-value">{formatDistance(stats.totalDistance)}</div>
          <div className="strava-stat-label">{l.distance} (km)</div>
        </div>
        <div className="strava-stat">
          <div className="strava-stat-value">{formatTotalTime(stats.totalTime)}</div>
          <div className="strava-stat-label">{l.time}</div>
        </div>
      </div>

      {activities.length > 0 && (
        <div>
          <h4 className="text-[0.75rem] font-black uppercase tracking-[0.14em] text-brown-light mb-[0.75rem]">
            {l.recent}
          </h4>
          <div className="flex flex-col gap-[0.5rem]">
            {activities.map((activity) => (
              <div key={activity.id} className="strava-card flex items-center gap-[1rem]">
                <span className="text-[1.25rem]">
                  {activityIcons[activity.type] || activityIcons.default}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-[0.5rem]">
                    <span className="text-[0.875rem] font-bold text-brown truncate">
                      {activity.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-[0.75rem] mt-[0.125rem]">
                    <span className="text-[0.75rem] text-brown-light">
                      {formatDistance(activity.distance)} km
                    </span>
                    <span className="text-[0.75rem] text-brown-light">
                      {formatDuration(activity.movingTime)}
                    </span>
                    {activity.totalElevationGain > 0 && (
                      <span className="text-[0.75rem] text-brown-light">
                        ↑ {Math.round(activity.totalElevationGain)}m
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-[0.6875rem] text-brown-light font-medium whitespace-nowrap">
                  {formatDate(activity.startDate, locale)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
