import { CONFIG } from './config.js';

export function createTheme({ storage = globalThis.localStorage, mediaQuery = globalThis.matchMedia?.('(prefers-color-scheme: dark)') } = {}) {
  let theme = storage?.getItem(CONFIG.storageKeys.theme) || (mediaQuery?.matches ? 'dark' : 'light');
  if (!['light','dark'].includes(theme)) theme = 'light';

  const apply = () => {
    document.documentElement.dataset.theme = theme;
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      const dark = theme === 'dark';
      button.textContent = dark ? '☀️' : '🌙';
      const label = dark ? 'ui.themeLight' : 'ui.themeDark';
      const translated = document.documentElement.lang === 'en' ? (dark ? 'Switch to light mode' : 'Switch to dark mode') : (dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
      button.setAttribute('aria-label', translated);
      button.setAttribute('aria-pressed', String(dark));
      button.title = translated;
    });
  };

  const toggle = () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    storage?.setItem(CONFIG.storageKeys.theme, theme);
    apply();
    return theme;
  };

  return Object.freeze({ apply, toggle, current: () => theme });
}
