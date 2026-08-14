import { bindPasswordToggles } from '../src/js/ui.js';

test('password toggle changes input type and accessible state', () => {
  document.body.innerHTML = `
    <div class="password-wrap">
      <input id="password" type="password">
      <button type="button" data-password-toggle aria-controls="password"><span data-eye-icon>◌</span></button>
    </div>`;

  bindPasswordToggles(document);
  const button = document.querySelector('[data-password-toggle]');
  const input = document.getElementById('password');

  expect(input.type).toBe('password');
  button.click();
  expect(input.type).toBe('text');
  expect(button.getAttribute('aria-pressed')).toBe('true');
  button.click();
  expect(input.type).toBe('password');
  expect(button.getAttribute('aria-pressed')).toBe('false');
});
