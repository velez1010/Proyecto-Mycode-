import { createI18n } from '../src/js/i18n.js';

function makeStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: key => map.get(key) ?? null,
    setItem: (key, value) => map.set(key, value),
    removeItem: key => map.delete(key)
  };
}

describe('i18n', () => {
  test('starts in Spanish by default', () => {
    const i18n = createI18n({ storage: makeStorage() });
    expect(i18n.current()).toBe('es');
    expect(i18n.get('nav.login')).toBe('Iniciar sesión');
  });

  test('switches to English and persists the language', () => {
    const storage = makeStorage();
    const i18n = createI18n({ storage });
    expect(i18n.set('en')).toBe(true);
    expect(i18n.current()).toBe('en');
    expect(i18n.get('nav.login')).toBe('Log in');
    expect(storage.getItem('mycode.language.v4')).toBe('en');
  });

  test('restores persisted language', () => {
    const i18n = createI18n({ storage: makeStorage({ 'mycode.language.v4': 'en' }) });
    expect(i18n.current()).toBe('en');
    expect(i18n.get('home.title')).toBe('Your code. Your next level.');
  });

  test('rejects unsupported languages', () => {
    const i18n = createI18n({ storage: makeStorage() });
    expect(i18n.set('fr')).toBe(false);
    expect(i18n.current()).toBe('es');
  });
});
