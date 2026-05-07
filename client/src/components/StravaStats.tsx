import { useState, useEffect } from 'react';

interface StravaData {
  totalActivities: number;
  totalDistance: number;
  totalTime: number;
}

interface StravaActivity {
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

interface Props {
  locale: string;
}

const   API_BASE = import.meta.env.DEV ? 'http://localhost:3001' : '';

const SPORT_META: Record<string, { icon: string; color: string }> = {
  Run: { icon: '🏃', color: '#FC4C02' },
  Ride: { icon: '🚴', color: '#3B82F6' },
  Swim: { icon: '🏊', color: '#06B6D4' },
  Walk: { icon: '🚶', color: '#8B5CF6' },
  Hike: { icon: '🥾', color: '#059669' },
  WeightTraining: { icon: '🏋️', color: '#EF4444' },
  Workout: { icon: '💪', color: '#EF4444' },
  Tennis: { icon: '🎾', color: '#84CC16' },
};

const DEFAULT_META = { icon: '🏅', color: '#FC4C02' };

function formatDistance(meters: number): string {
  return (meters / 1000).toFixed(1);
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h${m.toString().padStart(2, '0')}`;
  return `${m}min`;
}

function formatPace(avgSpeed: number): string {
  if (avgSpeed <= 0) return '';
  const paceSecPerKm = 1000 / avgSpeed;
  const min = Math.floor(paceSecPerKm / 60);
  const sec = Math.round(paceSecPerKm % 60);
  return `${min}'${sec.toString().padStart(2, '0')}"`;
}

function formatDate(dateStr: string, locale: string): string {
  return new Date(dateStr).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
    day: 'numeric',
    month: 'short',
  });
}

function isDistanceSport(type: string): boolean {
  return ['Run', 'Ride', 'Swim', 'Walk', 'Hike'].includes(type);
}

function ActivityCard({ activity, locale, index }: Readonly<{ activity: StravaActivity; locale: string; index: number }>) {
  const meta = SPORT_META[activity.type] || DEFAULT_META;
  const showDistance = isDistanceSport(activity.type) && activity.distance > 0;
  const showPace = activity.type === 'Run' && activity.averageSpeed > 0;

  return (
    <div
      className="strava-activity"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="strava-activity-icon" style={{ background: `${meta.color}12` }}>
        <span>{meta.icon}</span>
      </div>

      <div className="strava-activity-body">
        <div className="strava-activity-header">
          <span className="strava-activity-name">{activity.name}</span>
          <span className="strava-activity-date">{formatDate(activity.startDate, locale)}</span>
        </div>
        <div className="strava-activity-metrics">
          {showDistance && (
            <span className="strava-metric">
              {formatDistance(activity.distance)} km
            </span>
          )}
          <span className="strava-metric">
            {formatDuration(activity.movingTime)}
          </span>
          {showPace && (
            <span className="strava-metric">
              {formatPace(activity.averageSpeed)} /km
            </span>
          )}
          {activity.totalElevationGain > 0 && (
            <span className="strava-metric">
              ↑ {Math.round(activity.totalElevationGain)}m
            </span>
          )}
        </div>
      </div>

      {activity.kudosCount > 0 && (
        <div className="strava-kudos">
          👍 {activity.kudosCount}
        </div>
      )}
    </div>
  );
}

export default function StravaStats({ locale }: Props) {
  const [stats, setStats] = useState<StravaData | null>(null);
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/strava/stats`).then((r) => r.ok ? r.json() : Promise.reject()),
      fetch(`${API_BASE}/api/strava/activities`).then((r) => r.ok ? r.json() : Promise.reject()),
    ])
      .then(([s, a]) => { setStats(s); setActivities(a); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="strava-skeleton">
        <div className="strava-skeleton-bar" />
        <div className="strava-skeleton-bar short" />
      </div>
    );
  }

  if (error || !stats) return null;

  const totalKm = Math.round(stats.totalDistance / 1000);
  const totalHours = Math.floor(stats.totalTime / 3600);

  return (
    <div className="strava-widget">
      {/* Header banner */}
      <div className="strava-header">
        <svg className="strava-logo" viewBox="0 0 24 24" fill="#FC4C02">
          <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
        </svg>
        <div className="strava-header-stats">
          <strong>{stats.totalActivities}</strong> {locale === 'fr' ? 'activités' : 'activities'}
          <span className="strava-sep">·</span>
          <strong>{totalKm}</strong> km
          <span className="strava-sep">·</span>
          <strong>{totalHours}h</strong> {locale === 'fr' ? 'de sport' : 'of sport'}
        </div>
      </div>

      {/* Recent activities */}
      {activities.length > 0 && (
        <div className="strava-activities">
          {activities.map((activity, i) => (
            <ActivityCard key={activity.id} activity={activity} locale={locale} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
