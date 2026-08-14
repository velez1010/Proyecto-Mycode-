import { apiFetch } from '../src/js/api.js';

beforeEach(() => {
  document.head.innerHTML = '<meta name="csrf-token" content="csrf-demo">';
  global.fetch = jest.fn();
});

test('always sends auth cookies with API requests', async () => {
  global.fetch.mockResolvedValue({ ok: true, headers: new Headers({ 'content-type': 'application/json' }), json: async () => ({ ok: true }) });
  await apiFetch('/auth/me');
  const [, options] = global.fetch.mock.calls[0];
  expect(options.credentials).toBe('include');
  expect(options.cache).toBe('no-store');
});

test('adds a CSRF header for state-changing requests when server provides a token', async () => {
  global.fetch.mockResolvedValue({ ok: true, headers: new Headers({ 'content-type': 'application/json' }), json: async () => ({ ok: true }) });
  await apiFetch('/auth/logout', { method: 'POST', body: '{}' });
  const [, options] = global.fetch.mock.calls[0];
  expect(options.headers.get('X-CSRF-Token')).toBe('csrf-demo');
});
