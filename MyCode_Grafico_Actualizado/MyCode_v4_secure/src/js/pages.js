import { CONFIG } from './config.js';
import { ApiError } from './api.js';
import * as Auth from './auth.js';
import * as Tokens from './tokens.js';
import { planApi } from './api.js';
import { I18n, UI, bindCommon, resetAndSetUserCache, getUserCache } from './ui.js';

function planName(id) { return id ? id.charAt(0).toUpperCase() + id.slice(1) : ''; }

function validateRegister(data) {
  const errors = {};
  if (!data.username.trim() || data.username.trim().length < 3 || data.username.trim().length > 30) errors.username = 'auth.usernameMin';
  if (!/^\S+@\S+\.\S+$/.test(data.email.trim())) errors.email = 'auth.invalidEmail';
  if (!data.birthDate) errors.birthDate = 'auth.required';
  if (!['student','general'].includes(data.userType)) errors.userType = 'auth.required';
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,128}$/.test(data.password)) errors.password = 'auth.passwordMin';
  if (data.confirmPassword !== data.password) errors.confirmPassword = 'auth.passwordMismatch';
  return errors;
}

function validateLogin(data) {
  const errors = {};
  if (!data.identifier.trim()) errors.identifier = 'auth.required';
  if (!data.password) errors.password = 'auth.required';
  return errors;
}

function renderPlansGrid() {
  const grid = document.querySelector('#plansGrid');
  if (!grid) return;
  const user = getUserCache();
  grid.innerHTML = CONFIG.planOrder.map(id => {
    const plan = CONFIG.plans[id];
    const isCurrent = user?.plan === id;
    const badge = plan.badgeKey ? `<span class="plan-badge">${UI.esc(I18n.get(plan.badgeKey))}</span>` : '';
    const action = isCurrent ? `<button class="btn btn-outline btn-full" disabled>${UI.esc(I18n.get('common.current'))}</button>` : `<a class="btn btn-primary btn-full" href="checkout.html?plan=${encodeURIComponent(id)}">${UI.esc(I18n.get(user ? 'plans.update' : 'plans.select'))}</a>`;
    return `<article class="plan-card ${plan.tone} ${isCurrent ? 'current' : ''}">${badge}<div class="plan-card-head"><span>${UI.esc(planName(plan.id))}</span><strong>$${plan.price.toFixed(2)} <small>USD / mes</small></strong></div><p>${UI.esc(I18n.get(`plans.${plan.tone}Desc`))}</p><ul>${plan.benefitsKeys.map(key => `<li>✓ ${UI.esc(I18n.get(key))}</li>`).join('')}</ul>${action}</article>`;
  }).join('');
}

function renderCourses() {
  const grid = document.querySelector('#courseGrid');
  if (!grid) return;
  grid.innerHTML = CONFIG.courses.map(course => `<article class="course-card"><div class="course-icon">${UI.esc(course.icon)}</div><h3>${UI.esc(I18n.get(course.titleKey))}</h3><p>${UI.esc(I18n.get(course.descriptionKey))}</p><a class="btn btn-primary" href="course.html?course=${encodeURIComponent(course.id)}">${UI.esc(I18n.get('common.open'))} →</a></article>`).join('');
}

function searchContent(query) {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return [];
  const courseHits = CONFIG.courses.filter(course => [course.name, ...course.keywords, I18n.get(course.titleKey), I18n.get(course.descriptionKey)].join(' ').toLocaleLowerCase().includes(normalized));
  const contentHits = CONFIG.content.filter(item => [item.title.es,item.title.en,item.description.es,item.description.en].join(' ').toLocaleLowerCase().includes(normalized));
  return [...courseHits.map(course => ({ type:'course', id:course.id, title:I18n.get(course.titleKey), description:I18n.get(course.descriptionKey) })), ...contentHits.map(item => ({ type:'content', id:item.id, title:item.title[I18n.current()] || item.title.es, description:item.description[I18n.current()] || item.description.es }))];
}

function renderSearchResults(results) {
  const root = document.querySelector('#searchResults');
  if (!root) return;
  root.innerHTML = results.length ? results.map(item => `<a class="search-result" href="${item.type === 'course' ? `course.html?course=${encodeURIComponent(item.id)}` : '#courses'}"><strong>${UI.esc(item.title)}</strong><span>${UI.esc(item.description)}</span></a>`).join('') : `<p class="muted">${UI.esc(I18n.get('home.noResults'))}</p>`;
}

function setupSearch() {
  const input = document.querySelector('#contentSearch');
  if (!input) return;
  const run = () => renderSearchResults(searchContent(input.value));
  input.addEventListener('input', run);
}

async function setupRegister() {
  const form = document.querySelector('#registerForm'); if (!form) return;
  const message = document.querySelector('#registerMessage');
  form.addEventListener('submit', async (event) => {
    event.preventDefault(); UI.clearErrors(form); message.textContent = '';
    const data = Object.fromEntries(new FormData(form).entries());
    const errors = validateRegister(data);
    Object.entries(errors).forEach(([field,key]) => UI.setError(form.elements[field], I18n.get(key)));
    if (Object.keys(errors).length) return;
    const button = form.querySelector('[type="submit"]'); UI.toggleBusy(button, true);
    try { const user = await Auth.register(data); resetAndSetUserCache(user); message.textContent = I18n.get('auth.created'); message.className = 'form-message success'; setTimeout(() => location.assign('dashboard.html'), 500); }
    catch (error) { message.textContent = I18n.get(error instanceof ApiError ? error.message : 'auth.forbidden'); message.className = 'form-message error'; }
    finally { UI.toggleBusy(button, false); }
  });
}

async function setupLogin() {
  const form = document.querySelector('#loginForm'); if (!form) return;
  const message = document.querySelector('#loginMessage');
  form.addEventListener('submit', async (event) => {
    event.preventDefault(); UI.clearErrors(form); message.textContent='';
    const data = Object.fromEntries(new FormData(form).entries());
    const errors = validateLogin(data);
    Object.entries(errors).forEach(([field,key]) => UI.setError(form.elements[field], I18n.get(key)));
    if (Object.keys(errors).length) return;
    const button = form.querySelector('[type="submit"]'); UI.toggleBusy(button, true);
    try { const user = await Auth.login(data.identifier, data.password); resetAndSetUserCache(user); message.textContent = I18n.get('auth.loginSuccess'); message.className = 'form-message success'; setTimeout(() => location.assign('dashboard.html'), 350); }
    catch (error) { message.textContent = I18n.get(error instanceof ApiError ? error.message : 'auth.invalidCredentials'); message.className = 'form-message error'; }
    finally { UI.toggleBusy(button, false); }
  });
}

function renderDashboard(user) {
  if (!document.querySelector('#dashboardPage') || !user) return;
  const status = Tokens.getTokenStatus(user);
  document.querySelector('[data-user-name]').textContent = user.username || '';
  document.querySelector('#currentPlan').textContent = planName(user.plan);
  document.querySelector('#availableTokens').textContent = String(status.availableTokens);
  document.querySelector('#usedTokens').textContent = String(user.usedTokens);
  document.querySelector('#renewalDate').textContent = UI.days(user.tokenResetDate);
  document.querySelector('#planBadge').textContent = planName(user.plan);
  document.querySelector('#planBenefitList').innerHTML = CONFIG.plans[user.plan].benefitsKeys.map(key => `<li>✓ ${UI.esc(I18n.get(key))}</li>`).join('');
  const progress = Math.round(status.ratio * 100);
  const fill = document.querySelector('#progressFill'); fill.style.width = `${progress}%`; fill.setAttribute('aria-valuenow', String(progress));
  document.querySelector('#walletLabel').textContent = `${status.availableTokens} / ${status.totalTokens}`;
  document.querySelector('#walletSub').textContent = `${I18n.get('dashboard.used')}: ${user.usedTokens} · ${I18n.get('dashboard.renewal')}: ${UI.days(user.tokenResetDate)} ${I18n.get('dashboard.days')}`;
  UI.renderTokenAlert(document.querySelector('#tokenAlert'), user);
  const body = document.querySelector('#historyBody');
  const rows = [...(user.tokenHistory || [])].reverse();
  body.innerHTML = rows.length ? rows.map(item => `<tr><td>${UI.date(item.date)}</td><td>${UI.esc(I18n.get(item.actionKey) || item.actionKey || '')}</td><td class="${item.tokens < 0 ? 'negative' : ''}">${item.tokens ?? '—'}</td></tr>`).join('') : `<tr><td colspan="3">${UI.esc(I18n.get('dashboard.emptyHistory'))}</td></tr>`;
}

function setupCourse(user) {
  const page = document.querySelector('#coursePage'); if (!page || !user) return;
  const courseId = new URLSearchParams(location.search).get('course') || 'cpp';
  const course = CONFIG.courses.find(item => item.id === courseId) || CONFIG.courses[0];
  page.querySelector('[data-course-icon]').textContent = course.icon;
  page.querySelector('[data-course-name]').textContent = I18n.get(course.titleKey);
  page.querySelector('[data-course-description]').textContent = I18n.get(course.descriptionKey);
  const updateBalance = (nextUser = user) => { const s = Tokens.getTokenStatus(nextUser); page.querySelector('#courseTokenPill').textContent = `${s.availableTokens} / ${s.totalTokens}`; page.querySelector('#courseProgress').style.width = `${Math.round(s.ratio * 100)}%`; UI.renderTokenAlert(page.querySelector('#courseTokenAlert'), nextUser); };
  updateBalance();
  page.querySelectorAll('[data-cost]').forEach(button => button.addEventListener('click', async () => {
    const cost = Number(button.dataset.cost); UI.toggleBusy(button,true);
    try {
      const result = await Tokens.consumeTokens({ actionKey: button.dataset.action, cost, courseId: course.id });
      if (!result.ok) { showUpgradeModal(result); return; }
      resetAndSetUserCache(result.user); updateBalance(result.user); UI.toast(I18n.get('tokens.consumed'), 'success');
    } catch { UI.toast(I18n.get('tokens.insufficient'), 'error'); }
    finally { UI.toggleBusy(button,false); }
  }));
}

function showUpgradeModal(result) {
  const modal = document.querySelector('#upgradeModal'); if (!modal) return;
  modal.querySelector('[data-required]').textContent = String(result.required ?? '—');
  modal.querySelector('[data-available]').textContent = String(result.available ?? '—');
  const user = getUserCache(); const index = CONFIG.planOrder.indexOf(user?.plan || 'bronce');
  modal.querySelector('[data-upgrade-copy]').textContent = I18n.get(index >= 2 ? 'course.upgradeCopyGold' : index === 1 ? 'course.upgradeCopySilver' : 'course.upgradeCopyBronze');
  modal.hidden = false;
}

function setupCheckout(user) {
  const page = document.querySelector('#checkoutPage'); if (!page || !user) return;
  const planId = new URLSearchParams(location.search).get('plan') || 'bronce';
  const plan = CONFIG.plans[planId];
  if (!plan) return;
  document.querySelector('#selectedPlan').textContent = `${planName(plan.id)} · ${plan.tokens} tokens / mes · $${plan.price.toFixed(2)} USD`;
  const button = document.querySelector('#subscriptionAction');
  button.addEventListener('click', async () => {
    UI.toggleBusy(button, true);
    try {
      const { user: nextUser } = await planApi.change(plan.id);
      Auth.setCurrentUser(nextUser); resetAndSetUserCache(nextUser);
      document.querySelector('#subscriptionCard').hidden = true; document.querySelector('#checkoutSuccess').hidden = false;
    } catch (error) { UI.toast(I18n.get(error instanceof ApiError ? error.message : 'plans.invalidPlan'), 'error'); }
    finally { UI.toggleBusy(button, false); }
  });
}

export async function renderPage() {
  const page = document.body.dataset.page;
  const user = getUserCache();
  if (page === 'home') { renderCourses(); renderPlansGrid(); setupSearch(); }
  if (page === 'plans') { renderPlansGrid(); }
  if (page === 'register') await setupRegister();
  if (page === 'login') await setupLogin();
  if (page === 'dashboard') renderDashboard(user);
  if (page === 'course') setupCourse(user);
  if (page === 'checkout') setupCheckout(user);
}

export async function initApp() {
  const memberOnly = ['dashboard','course','checkout'];
  let user = null;
  try { user = await Auth.getCurrentUser(); }
  catch { user = null; }
  resetAndSetUserCache(user);
  if (memberOnly.includes(document.body.dataset.page) && !user) { location.assign('login.html'); return; }
  await bindCommon();
  await renderPage();
}
