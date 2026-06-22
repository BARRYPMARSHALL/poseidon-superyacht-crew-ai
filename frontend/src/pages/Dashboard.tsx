import { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface DashboardData {
  vessel: any;
  crew: any;
  certifications: any;
  visas_expiring_90_days: number;
  passports_expiring_90_days: number;
  alerts: any;
  contracts_ending_60_days: any[];
  recent_activity: any[];
}

/* ─── Inline SVG icon components (no emoji) ─── */

function ShipWheelIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" />
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function ClockAlertIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
      <line x1="12" y1="2" x2="12" y2="4" />
      <line x1="2" y1="12" x2="4" y2="12" />
      <line x1="12" y1="20" x2="12" y2="22" />
      <line x1="20" y1="12" x2="22" y2="12" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function ActivityIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function CompassIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

/* ─── Formatting helpers ─── */

function formatDate(): string {
  const d = new Date();
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatTime(): string {
  const d = new Date();
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/* ─── Status colour dot ─── */

function StatusDot({ color }: { color: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: color,
        boxShadow: `0 0 8px ${color}40`,
        flexShrink: 0,
      }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════
   DASHBOARD COMPONENT
   ═══════════════════════════════════════════════════════════ */

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [vesselId, setVesselId] = useState<string>('');
  const [vesselList, setVesselList] = useState<any[]>([]);

  useEffect(() => {
    api.vessels().then((res) => {
      const list = res.vessels ?? [];
      setVesselList(list);
      if (list.length > 0) {
        setVesselId(list[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (!vesselId) return;
    setLoading(true);
    api.dashboard(vesselId).then(setData).finally(() => setLoading(false));
  }, [vesselId]);

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-4">
          <ShipWheelIcon />
          <span className="text-xs uppercase tracking-widest text-navy-300 animate-pulse">
            Plotting course…
          </span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]" style={{ color: 'var(--text-secondary)' }}>
        <p>No vessel data found. Select a vessel to begin.</p>
      </div>
    );
  }

  const { vessel, crew, certifications, alerts } = data;

  /* ── Derived KPIs ── */
  const totalCertsEstimate = Math.max(crew.total * 5, 1);
  const expiredPct = Math.round((certifications.expired / totalCertsEstimate) * 100);
  const certHealthPct = Math.max(0, 100 - expiredPct);
  const totalAlerts = (alerts.critical ?? 0) + (alerts.warnings ?? 0);

  /* ═══════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════ */

  return (
    <div
      className="animate-fade-in"
      style={{ padding: 'var(--space-xl)', maxWidth: 'var(--max-width)', margin: '0 auto' }}
    >
      {/* ═══ TOP ROW: Captain's Log — Welcome + Date + Vessel Selector ═══ */}
      <div
        className="animate-slide-up"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-md)',
          marginBottom: 'var(--space-2xl)',
        }}
      >
        {/* Left — welcome */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--brass-500), var(--brass-600))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--navy-900)',
              boxShadow: 'var(--glow-brass)',
            }}
          >
            <ShipWheelIcon />
          </div>
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 26,
                fontWeight: 600,
                color: 'var(--text-primary)',
                letterSpacing: '0.02em',
                margin: 0,
              }}
            >
              Bridge Command Center
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
              Captain's Log &middot; {formatDate()} &middot; {formatTime()} UTC
            </p>
          </div>
        </div>

        {/* Right — vessel selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {vessel && (
            <div
              className="glass"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '6px 14px 6px 6px',
                borderRadius: 'var(--radius-full)',
                fontSize: 13,
              }}
            >
              <StatusDot color={vessel.status === 'active' ? 'var(--teal-400)' : 'var(--color-warning)'} />
              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                {vessel.name}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                {vessel.length}m &middot; {vessel.flag}
              </span>
            </div>
          )}
          {vesselList.length > 1 && (
            <select
              className="input-field"
              style={{ width: 'auto', minWidth: 140, padding: '6px 12px', fontSize: 13 }}
              value={vesselId}
              onChange={(e) => setVesselId(e.target.value)}
            >
              {vesselList.map((v: any) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* ═══ KPI CARDS ROW ═══ */}
      <div
        className="animate-slide-up"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--space-lg)',
          marginBottom: 'var(--space-2xl)',
        }}
      >
        <KpiCard
          icon={<UsersIcon />}
          label="Active Crew"
          value={crew.total}
          sub={`${crew.on_leave ?? 0} on leave`}
          accentColor="var(--teal-400)"
        />
        <KpiCard
          icon={<ShieldIcon />}
          label="Certification Health"
          value={`${certHealthPct}%`}
          sub={`${certifications.expired} expired`}
          accentColor={certHealthPct >= 90 ? 'var(--teal-400)' : certHealthPct >= 70 ? 'var(--color-warning)' : 'var(--color-danger)'}
        />
        <KpiCard
          icon={<ClockAlertIcon />}
          label="Expiring ≤ 30 Days"
          value={certifications.expiring_30_days}
          sub="Critical window"
          accentColor={certifications.expiring_30_days > 0 ? 'var(--color-warning)' : 'var(--teal-400)'}
        />
        <KpiCard
          icon={<BellIcon />}
          label="Open Alerts"
          value={totalAlerts}
          sub={`${alerts.critical ?? 0} critical`}
          accentColor={alerts.critical > 0 ? 'var(--color-danger)' : totalAlerts > 0 ? 'var(--color-warning)' : 'var(--teal-400)'}
        />
      </div>

      {/* ═══ MIDDLE: AGENT FEED + UPCOMING EVENTS ═══ */}
      <div
        className="animate-slide-up"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-lg)',
          marginBottom: 'var(--space-2xl)',
        }}
      >
        {/* ── Left: Agent Activity Feed ── */}
        <div className="card" style={{ animationDelay: '0.1s' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 'var(--space-lg)',
            }}
          >
            <ActivityIcon />
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 18,
                fontWeight: 600,
                color: 'var(--text-primary)',
                margin: 0,
                letterSpacing: '0.01em',
              }}
            >
              Agent Activity Feed
            </h2>
            <span
              className="badge badge-info"
              style={{ marginLeft: 'auto', fontSize: 11 }}
            >
              Live
            </span>
          </div>

          {data.recent_activity?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {data.recent_activity.slice(0, 8).map((act: any, idx: number) => (
                <div
                  key={act.id ?? idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                    transition: 'background var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(201,168,76,0.04)')}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent')
                  }
                >
                  {/* Agent indicator */}
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--navy-700)',
                      border: '1px solid var(--border-glass)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      fontWeight: 600,
                      color: 'var(--brass-500)',
                      flexShrink: 0,
                    }}
                  >
                    {(act.agent_name ?? 'AI').slice(0, 2).toUpperCase()}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        marginBottom: 2,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: 'var(--brass-400)',
                        }}
                      >
                        {act.agent_name}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {new Date(act.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        color: 'var(--text-secondary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {act.action_summary}
                    </p>
                  </div>

                  {/* Status badge */}
                  <span
                    className={
                      act.status === 'completed'
                        ? 'badge badge-success'
                        : act.status === 'pending_approval'
                        ? 'badge badge-warning'
                        : 'badge badge-danger'
                    }
                    style={{ flexShrink: 0, fontSize: 11 }}
                  >
                    {act.status === 'completed' && <StatusDot color="var(--teal-400)" />}
                    {act.status === 'pending_approval' && <StatusDot color="var(--color-warning)" />}
                    {act.status !== 'completed' && act.status !== 'pending_approval' && (
                      <StatusDot color="var(--color-danger)" />
                    )}
                    {act.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: 'var(--space-2xl) var(--space-lg)',
                color: 'var(--text-muted)',
                fontSize: 14,
              }}
            >
              <CompassIcon />
              <p style={{ marginTop: 8 }}>No agent activity yet. Run a scan to light up the bridge.</p>
            </div>
          )}
        </div>

        {/* ── Right: Upcoming Events ── */}
        <div className="card" style={{ animationDelay: '0.2s' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 'var(--space-lg)',
            }}
          >
            <CalendarIcon />
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 18,
                fontWeight: 600,
                color: 'var(--text-primary)',
                margin: 0,
                letterSpacing: '0.01em',
              }}
            >
              Upcoming Events
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Cert timeline */}
            <EventItem
              label="Expired Certifications"
              count={certifications.expired}
              color="var(--color-danger)"
            />
            <EventItem
              label="Expiring ≤ 30 Days"
              count={certifications.expiring_30_days}
              color="var(--color-warning)"
            />
            <EventItem
              label="Expiring 30–90 Days"
              count={certifications.expiring_90_days}
              color="var(--navy-300)"
            />

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-glass)', margin: 'var(--space-sm) 0' }} />

            {/* Passports & Visas */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(201,168,76,0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <StatusDot color="var(--brass-500)" />
                <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                  Passports expiring ≤ 90 days
                </span>
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 15,
                  fontWeight: 600,
                  color: data.passports_expiring_90_days > 0 ? 'var(--color-warning)' : 'var(--teal-400)',
                }}
              >
                {data.passports_expiring_90_days}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(201,168,76,0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <StatusDot color="var(--brass-500)" />
                <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                  Visas expiring ≤ 90 days
                </span>
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 15,
                  fontWeight: 600,
                  color: data.visas_expiring_90_days > 0 ? 'var(--color-warning)' : 'var(--teal-400)',
                }}
              >
                {data.visas_expiring_90_days}
              </span>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-glass)', margin: 'var(--space-sm) 0' }} />

            {/* Contracts ending */}
            <h3
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--brass-500)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                margin: '4px 0 8px',
              }}
            >
              Contracts Ending (60 days)
            </h3>

            {data.contracts_ending_60_days?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {data.contracts_ending_60_days.map((c: any) => (
                  <div
                    key={c.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 13,
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <span>
                      {c.first_name} {c.last_name}
                      <span style={{ color: 'var(--text-muted)', fontSize: 12, marginLeft: 6 }}>
                        ({c.position})
                      </span>
                    </span>
                    <span style={{ color: 'var(--color-warning)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                      {c.contract_end_date}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                No contracts ending in the next 60 days.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ═══ BOTTOM: QUICK ACTIONS ═══ */}
      <div
        className="animate-slide-up card"
        style={{
          animationDelay: '0.3s',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 'var(--space-md)',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <CompassIcon />
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 18,
              fontWeight: 600,
              color: 'var(--text-primary)',
              margin: 0,
              letterSpacing: '0.01em',
            }}
          >
            Quick Actions
          </h2>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <QuickActionButton
            label="View Crew"
            onClick={() => {}}
            variant="primary"
          />
          <QuickActionButton
            label="Check Certs"
            onClick={() => {}}
            variant="outline"
          />
          <QuickActionButton
            label="Run Compliance Scan"
            onClick={() => {}}
            variant="outline"
          />
          <QuickActionButton
            label="Generate Report"
            onClick={() => {}}
            variant="outline"
          />
        </div>
      </div>

      {/* ── Footer — vessel department breakdown (compact) ── */}
      {crew.by_department?.length > 0 && (
        <div
          className="animate-fade-in"
          style={{
            marginTop: 'var(--space-lg)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--space-md)',
            alignItems: 'center',
            padding: 'var(--space-md) var(--space-lg)',
            borderRadius: 'var(--radius-lg)',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--border-glass)',
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--brass-500)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Crew Breakdown
          </span>
          {crew.by_department.map((dept: any) => (
            <div
              key={dept.department}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--navy-700)',
                fontSize: 12,
              }}
            >
              <StatusDot color="var(--brass-400)" />
              <span style={{ color: 'var(--text-secondary)' }}>{dept.department ?? 'Unassigned'}</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                {dept.count}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════ */

/* ─── KPI Card ─── */
function KpiCard({
  icon,
  label,
  value,
  sub,
  accentColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub: string;
  accentColor: string;
}) {
  return (
    <div
      className="card"
      style={{
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      {/* Decorative accent bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 4,
          height: '100%',
          background: `linear-gradient(180deg, ${accentColor}, transparent)`,
          borderRadius: 'var(--radius-sm) 0 0 var(--radius-sm)',
        }}
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </span>
        <span style={{ color: accentColor, opacity: 0.6 }}>{icon}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 32,
            fontWeight: 700,
            color: 'var(--text-primary)',
            lineHeight: 1,
          }}
        >
          {value}
        </span>
        <StatusDot color={accentColor} />
      </div>

      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub}</span>
    </div>
  );
}

/* ─── Event Item ─── */
function EventItem({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(255,255,255,0.02)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <StatusDot color={color} />
        <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{label}</span>
      </div>
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 15,
          fontWeight: 600,
          color: count > 0 ? color : 'var(--text-muted)',
        }}
      >
        {count}
      </span>
    </div>
  );
}

/* ─── Quick Action Button ─── */
function QuickActionButton({
  label,
  onClick,
  variant = 'outline',
}: {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'outline';
}) {
  return (
    <button
      onClick={onClick}
      className={variant === 'primary' ? 'brass-button' : 'brass-button-outline'}
      style={{
        padding: '10px 22px',
        fontSize: 13,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        whiteSpace: 'nowrap',
        cursor: 'pointer',
      }}
    >
      {variant === 'primary' ? (
        <CompassIcon />
      ) : (
        <ChevronRightIcon />
      )}
      {label}
    </button>
  );
}
