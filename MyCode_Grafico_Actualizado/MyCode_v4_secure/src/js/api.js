import { CONFIG } from './config.js';

const API_ERROR_MESSAGES = new Map([
  ['invalid_credentials', 'auth.invalidCredentials'],
  ['duplicate_email', 'auth.duplicate'],
  ['insufficient_tokens', 'tokens.insufficient'],
  ['invalid_plan', 'plans.invalidPlan'],
  ['unauthorized', 'auth.unauthorized'],
  ['forbidden', 'auth.forbidden']
]);

export class ApiError extends Error {
  constructor(message, { status = 0, code = 'request_failed', details = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function getCsrfToken() {
  return document.querySelector('meta[name="csrf-token"]')?.content || '';
}

export async function apiFetch(path, options = {}) {
  const method = String(options.method || 'GET').toUpperCase();
  const headers = new Headers(options.headers || {});
  headers.set('Accept', 'application/json');
  if (options.body !== undefined && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  const csrf = getCsrfToken();
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method) && csrf) headers.set('X-CSRF-Token', csrf);

  const response = await fetch(`${CONFIG.apiBase}${path}`, {
    ...options,
    method,
    headers,
    credentials: 'include',
    cache: 'no-store'
  });

  const type = response.headers.get('content-type') || '';
  const payload = type.includes('application/json') ? await response.json().catch(() => ({})) : {};

  if (!response.ok) {
    const code = payload?.error?.code || payload?.code || 'request_failed';
    const key = API_ERROR_MESSAGES.get(code);
    throw new ApiError(key || code, { status: response.status, code, details: payload });
  }
  return payload;
}

export const authApi = Object.freeze({
  me: () => apiFetch('/auth/me'),
  register: (data) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => apiFetch('/auth/logout', { method: 'POST', body: JSON.stringify({}) })
});

export const tokenApi = Object.freeze({
  consume: ({ actionKey, cost, courseId = null, idempotencyKey }) => apiFetch('/tokens/consume', {
    method: 'POST',
    body: JSON.stringify({ actionKey, cost, courseId, idempotencyKey })
  })
});

export const planApi = Object.freeze({
  change: (planId) => apiFetch('/plans/change', { method: 'POST', body: JSON.stringify({ planId }) })
});
