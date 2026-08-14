import { CONFIG } from './config.js';
import { createI18n } from './i18n.js';
import { createTheme } from './theme.js';
import { getCurrentUser, isAuthenticated, clearCurrentUser, logout } from './auth.js';
import { getTokenStatus } from './tokens.js';

export const I18n = createI18n();
export const Theme = createTheme();
let currentUser = null;

export const UI = Object.freeze({
  esc(value) { return String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])); },
  date(value) { return new Intl.DateTimeFormat(I18n.current() === 'es' ? 'es-CO' : 'en-US', { day:'2-digit', month:'2-digit', year:'numeric' }).format(new Date(value)); },
  days(value) { return Math.max(0, Math.ceil((new Date(value) - Date.now()) / 86400000)); },
  setError(input, message) {
    input?.setAttribute('aria-invalid', 'true');
    const target = input ? document.querySelector(`[data-error-for="${CSS.escape(input.id)}"]`) : null;
    if (target) target.textContent = message;
  },
  clearErrors(form) {
    form?.querySelectorAll('.field-error').forEach(el => { el.textContent = ''; });
    form?.querySelectorAll('[aria-invalid="true"]').forEach(el => el.removeAttribute('aria-invalid'));
  },
  toast(message, type = 'info') {
    let host = document.querySelector('#toastHost');
    if (!host) { host = document.createElement('div'); host.id = 'toastHost'; host.className = 'toast-host'; document.body.append(host); }
    const item = document.createElement('div'); item.className = `toast ${type}`; item.setAttribute('role', 'status'); item.textContent = message; host.append(item);
    requestAnimationFrame(() => item.classList.add('show'));
    setTimeout(() => { item.classList.remove('show'); setTimeout(() => item.remove(), 180); }, 3000);
  },
  toggleBusy(button, busy) {
    if (!button) return;
    button.disabled = busy;
    button.classList.toggle('is-loading', busy);
    button.setAttribute('aria-busy', String(busy));
  },
  goBack() {
    const referrer = document.referrer;
    if (history.length > 1 && referrer) {
      try {
        const url = new URL(referrer);
        if (url.origin === location.origin) { history.back(); return; }
      } catch {}
    }
    location.assign('index.html');
  },
  async requireAuth() {
    try {
      await getCurrentUser();
      return true;
    } catch {
      location.assign('login.html');
      return false;
    }
  },
  updateAuthNav() {
    const logged = isAuthenticated();
    document.querySelectorAll('[data-guest-nav]').forEach(el => { el.hidden = logged; });
    document.querySelectorAll('[data-member-nav]').forEach(el => { el.hidden = !logged; });
    document.querySelectorAll('[data-nav-user]').forEach(el => { el.textContent = logged ? currentUser?.username || '' : ''; });
  },
  renderTokenAlert(target, user) {
    if (!target) return;
    const status = getTokenStatus(user);
    target.replaceChildren();
    if (!status || status.level === 'normal') return;
    const box = document.createElement('div');
    box.className = `token-alert ${status.level}`;
    const titleKey = status.level === 'low' ? 'tokens.lowTitle' : status.level === 'critical' ? 'tokens.criticalTitle' : 'tokens.emptyTitle';
    const textKey = status.level === 'low' ? 'tokens.lowText' : status.level === 'critical' ? 'tokens.criticalText' : 'tokens.emptyText';
    box.innerHTML = `<strong>${UI.esc(I18n.get(titleKey))}</strong><span>${UI.esc(I18n.get(textKey))}</span><a href="plans.html">${UI.esc(I18n.get('tokens.viewPlans'))}</a>`;
    target.append(box);
  }
});

export function bindPasswordToggles(root = document) {
  root.querySelectorAll('[data-password-toggle]').forEach(button => {
    if (button.dataset.bound === 'true') return;
    button.dataset.bound = 'true';
    button.addEventListener('click', () => {
      const inputId = button.getAttribute('aria-controls');
      const input = inputId ? document.getElementById(inputId) : null;
      if (!input) return;
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      button.setAttribute('aria-pressed', String(show));
      button.setAttribute('aria-label', show ? I18n.get('auth.hidePassword') : I18n.get('auth.showPassword'));
      const icon = button.querySelector('[data-eye-icon]');
      if (icon) icon.textContent = show ? '◉' : '◌';
    });
    button.setAttribute('aria-label', I18n.get('auth.showPassword'));
    button.setAttribute('aria-pressed', 'false');
  });
}

export function applyTranslations(root = document) {
  root.documentElement?.setAttribute('lang', I18n.current());
  root.querySelectorAll('[data-i18n]').forEach(element => { element.textContent = I18n.get(element.dataset.i18n); });
  root.querySelectorAll('[data-i18n-placeholder]').forEach(element => { element.setAttribute('placeholder', I18n.get(element.dataset.i18nPlaceholder)); });
  root.querySelectorAll('[data-lang]').forEach(button => { button.classList.toggle('active', button.dataset.lang === I18n.current()); });
  Theme.apply();
  bindPasswordToggles(root);
}

export function resetAndSetUserCache(user) { currentUser = user || null; return currentUser; }
export function getUserCache() { return currentUser; }

export async function syncUserCache() {
  try { const user = await getCurrentUser(); currentUser = user; return user; }
  catch { clearCurrentUser(); currentUser = null; return null; }
}

export async function bindCommon(root = document) {
  applyTranslations(root);
  Theme.apply();
  document.querySelectorAll('[data-theme-toggle]').forEach(button => button.addEventListener('click', () => { Theme.toggle(); }));
  document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => {
    if (I18n.set(button.dataset.lang)) location.reload();
  }));
  document.querySelectorAll('[data-back]').forEach(button => button.addEventListener('click', () => UI.goBack()));
  document.querySelectorAll('[data-logout]').forEach(button => button.addEventListener('click', async () => {
    UI.toggleBusy(button, true);
    try { await logout(); location.assign('index.html'); } finally { UI.toggleBusy(button, false); }
  }));
  const user = await syncUserCache();
  document.querySelectorAll('[data-guest-nav]').forEach(el => { el.hidden = Boolean(user); });
  document.querySelectorAll('[data-member-nav]').forEach(el => { el.hidden = !user; });
  document.querySelectorAll('[data-nav-user]').forEach(el => { el.textContent = user?.username || ''; });
  return user;
}

let currentPageRenderer = null;
export function registerCurrentPageRenderer(renderer) { currentPageRenderer = renderer; }
async function renderCurrentPage() { if (currentPageRenderer) await currentPageRenderer(); }
