import { accessForPlan, canConsume, getTokenStatus } from '../src/js/tokens.js';

describe('token state validation', () => {
  const user = { plan: 'bronce', totalTokens: 50, availableTokens: 12, usedTokens: 38 };

  test('reports normal level above low threshold', () => {
    expect(getTokenStatus(user).level).toBe('normal');
  });

  test('reports low and critical levels correctly', () => {
    expect(getTokenStatus({ ...user, availableTokens: 15 }).level).toBe('normal');
    expect(getTokenStatus({ ...user, availableTokens: 10 }).level).toBe('low');
    expect(getTokenStatus({ ...user, availableTokens: 5 }).level).toBe('critical');
    expect(getTokenStatus({ ...user, availableTokens: 0 }).level).toBe('empty');
  });

  test('never normalizes a negative balance into a valid balance', () => {
    expect(getTokenStatus({ ...user, availableTokens: -50 }).availableTokens).toBe(0);
  });
});

describe('token consumption gate', () => {
  const user = { availableTokens: 5 };

  test('allows an action when balance is sufficient', () => {
    expect(canConsume(user, 5)).toEqual({ ok: true });
  });

  test('blocks an action when balance is insufficient', () => {
    expect(canConsume(user, 6)).toEqual({ ok: false, reason: 'insufficient', available: 5, required: 6 });
  });

  test('rejects invalid costs', () => {
    expect(canConsume(user, 0).reason).toBe('invalid_cost');
    expect(canConsume(user, -1).reason).toBe('invalid_cost');
    expect(canConsume(user, Number.NaN).reason).toBe('invalid_cost');
  });

  test('requires authentication', () => {
    expect(canConsume(null, 1).reason).toBe('auth');
  });
});

describe('plan-based access control', () => {
  test('higher plans satisfy lower access requirements', () => {
    expect(accessForPlan('oro', 'plata')).toBe(true);
    expect(accessForPlan('plata', 'oro')).toBe(false);
    expect(accessForPlan('bronce', 'bronce')).toBe(true);
  });
});
