import { authApi } from './api.js';
import { CONFIG } from './config.js';

let cachedUser = null;
let pendingMe = null;

function normalizeUser(user) {
  if (!user || typeof user !== 'object') return null;
  const safePlan = CONFIG.planOrder.includes(user.plan) ? user.plan : CONFIG.planOrder[0];
  const plan = CONFIG.plans[safePlan];
  const totalTokens = Number.isFinite(Number(user.totalTokens)) ? Math.max(0, Number(user.totalTokens)) : plan.tokens;
  const availableTokens = Number.isFinite(Number(user.availableTokens)) ? Math.max(0, Math.min(Number(user.availableTokens), totalTokens)) : 0;
  const usedTokens = Number.isFinite(Number(user.usedTokens)) ? Math.max(0, Number(user.usedTokens)) : 0;
  return Object.freeze({
    ...user,
    plan: safePlan,
    totalTokens,
    availableTokens,
    usedTokens,
    tokenHistory: Array.isArray(user.tokenHistory) ? user.tokenHistory.slice(-100) : []
  });
}

export async function getCurrentUser({ force = false } = {}) {
  if (!force && cachedUser) return cachedUser;
  if (!force && pendingMe) return pendingMe;
  pendingMe = authApi.me()
    .then(({ user }) => { cachedUser = normalizeUser(user); return cachedUser; })
    .catch(error => {
      if (error.status === 401 || error.code === 'unauthorized') cachedUser = null;
      throw error;
    })
    .finally(() => { pendingMe = null; });
  return pendingMe;
}

export function setCurrentUser(user) {
  cachedUser = normalizeUser(user);
  return cachedUser;
}

export function clearCurrentUser() {
  cachedUser = null;
}

export function isAuthenticated() {
  return Boolean(cachedUser);
}

export async function register(data) {
  const payload = {
    username: data.username.trim(),
    email: data.email.trim().toLowerCase(),
    password: data.password,
    birthDate: data.birthDate,
    userType: data.userType
  };
  const result = await authApi.register(payload);
  cachedUser = normalizeUser(result.user);
  return cachedUser;
}

export async function login(identifier, password) {
  const result = await authApi.login({ identifier: identifier.trim(), password });
  cachedUser = normalizeUser(result.user);
  return cachedUser;
}

export async function logout() {
  try { await authApi.logout(); } finally { clearCurrentUser(); }
}
