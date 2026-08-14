import { initApp, renderPage } from './pages.js';
import { registerCurrentPageRenderer } from './ui.js';

document.addEventListener('DOMContentLoaded', async () => {
  registerCurrentPageRenderer(renderPage);
  await initApp();
});
