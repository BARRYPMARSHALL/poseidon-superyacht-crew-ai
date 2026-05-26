const API_BASE = '/api';

let authToken: string | null = localStorage.getItem('poseidon_token');

export function setToken(token: string | null) {
  authToken = token;
  if (token) localStorage.setItem('poseidon_token', token);
  else localStorage.removeItem('poseidon_token');
}

export function getToken(): string | null {
  return authToken;
}

async function request(path: string, options: RequestInit = {}): Promise<any> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (res.status === 401) {
    setToken(null);
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (email: string, password: string, name: string, role: string) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name, role }) }),
  me: () => request('/auth/me'),

  // Dashboard
  dashboard: (vesselId: string) => request(`/dashboard/${vesselId}`),

  // Vessels
  vessels: () => request('/vessels'),
  getVessel: (id: string) => request(`/vessels/${id}`),

  // Crew
  getCrew: (vesselId: string) => request(`/crew/${vesselId}`),
  getCrewMember: (vesselId: string, crewId: string) => request(`/crew/${vesselId}/${crewId}`),
  addCrew: (vesselId: string, data: any) =>
    request(`/crew/${vesselId}`, { method: 'POST', body: JSON.stringify(data) }),
  updateCrew: (vesselId: string, crewId: string, data: any) =>
    request(`/crew/${vesselId}/${crewId}`, { method: 'PUT', body: JSON.stringify(data) }),
  offboardCrew: (vesselId: string, crewId: string) =>
    request(`/crew/${vesselId}/${crewId}`, { method: 'DELETE' }),

  // Certifications
  getCerts: (crewId: string) => request(`/certs/crew/${crewId}`),
  getExpiringCerts: (vesselId: string, days = 90) => request(`/certs/vessel/${vesselId}/expiring?days=${days}`),
  addCert: (crewId: string, data: any) =>
    request(`/certs/crew/${crewId}`, { method: 'POST', body: JSON.stringify(data) }),
  updateCert: (certId: string, data: any) =>
    request(`/certs/${certId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCert: (certId: string) => request(`/certs/${certId}`, { method: 'DELETE' }),

  // Alerts
  getAlerts: (vesselId: string) => request(`/alerts/${vesselId}?unresolved=true`),
  getAlertCounts: (vesselId: string) => request(`/alerts/${vesselId}/count`),
  markRead: (alertId: string) => request(`/alerts/${alertId}/read`, { method: 'PUT' }),
  resolveAlert: (alertId: string) => request(`/alerts/${alertId}/resolve`, { method: 'PUT' }),

  // Compliance
  getReports: (vesselId: string) => request(`/compliance/${vesselId}/reports`),
  generateReport: (vesselId: string, reportType: string) =>
    request(`/compliance/${vesselId}/generate`, { method: 'POST', body: JSON.stringify({ report_type: reportType }) }),
  getTrainingProviders: () => request('/compliance/training-providers'),

  // Agents
  runCerberus: () => request('/agents/cerberus/scan'),
  runNereus: () => request('/agents/nereus/scan'),
  getRenewalPlan: (crewId: string) => request(`/agents/cerberus/renewal-plan/${crewId}`),
  getRotationPlan: (vesselId: string) => request(`/agents/nereus/rotation-plan/${vesselId}`),
  generateOwnerReport: (vesselId: string) =>
    request(`/agents/hermes/owner-report/${vesselId}`, { method: 'POST' }),
  getOnboarding: (crewId: string) => request(`/agents/hermes/onboarding/${crewId}`),
  getOffboarding: (crewId: string) => request(`/agents/hermes/offboarding/${crewId}`),
};
