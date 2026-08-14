import { CONFIG } from './config.js';
import { getCurrentUser, setCurrentUser } from './auth.js';
import { tokenApi } from './api.js';

export function getTokenStatus(user) {
  if (!user) return null;
  const total = Math.max(0, Number(user.totalTokens) || 0);
  const available = Math.max(0, Math.min(Number(user.availableTokens) || 0, total));
  const ratio = total > 0 ? available / total : 0;
  const level = available === 0 ? 'empty' : ratio <= CONFIG.warningThresholds.critical ? 'critical' : ratio <= CONFIG.warningThresholds.low ? 'low' : 'normal';
  return { ...user, totalTokens: total, availableTokens: available, ratio, level };
}

export function canConsume(user, cost) {
  const numericCost = Number(cost);
  if (!Number.isFinite(numericCost) || numericCost <= 0) return { ok: false, reason: 'invalid_cost' };
  if (!user) return { ok: false, reason: 'auth' };
  if (user.availableTokens < numericCost) return { ok: false, reason: 'insufficient', available: user.availableTokens, required: numericCost };
  return { ok: true };
}

export async function consumeTokens({ actionKey, cost, courseId = null }) {
  const user = await getCurrentUser();
  const gate = canConsume(user, cost);
  if (!gate.ok) return gate;

  const idempotencyKey = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
  const result = await tokenApi.consume({ actionKey, cost, courseId, idempotencyKey });
  const nextUser = setCurrentUser(result.user);
  return { ok: true, user: nextUser, idempotencyKey };
}

export function accessForPlan(planId, requiredPlan = 'bronce') {
  const currentIndex = CONFIG.planOrder.indexOf(planId);
  const requiredIndex = CONFIG.planOrder.indexOf(requiredPlan);
  return currentIndex >= 0 && requiredIndex >= 0 && currentIndex >= requiredIndex;
}
