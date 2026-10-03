// ═══════════════════════════════════════════════════════════════
// APP INIT / VIEW SWITCHING / BROWSER HISTORY
// The tabs and the open character sheet are real history entries, so the
// browser's Back button (and a phone's back gesture) steps back through them
// instead of leaving the app.
// ═══════════════════════════════════════════════════════════════

const VIEWS = ['view-characters', 'view-combat', 'view-curriculum', 'view-ledger', 'view-items', 'view-world'];
const GM_ONLY_VIEWS = ['view-items', 'view-world'];

// Items and World are GM-only. Combat is hidden from players until the GM ticks "Combat for players".
function viewAllowed(viewId) {
  if (!VIEWS.includes(viewId)) return false;
  if (session.role === 'gm') return true;
  if (GM_ONLY_VIEWS.includes(viewId)) return false;
  if (viewId === 'view-combat') return !!state.settings?.playerCombat;
  return true;
}
async function setPlayerCombat(on) { await dbWrite('settings/playerCombat', !!on); }

function currentView() { return document.querySelector('main > .view.active')?.id || 'view-characters'; }

// ── history ──
let navFromHistory = false;
function pushNav(replace) {
  if (navFromHistory) return;
  const st = { view: currentView(), char: (session.role === 'gm' && currentView() === 'view-characters') ? openCharId : null };
  const cur = history.state;
  if (!replace && cur && cur.view === st.view && cur.char === st.char) return;
  const hash = '#' + st.view.replace('view-', '') + (st.char ? '/' + st.char : '');
  try { history[replace ? 'replaceState' : 'pushState'](st, '', hash); } catch (e) { /* e.g. file:// */ }
}
window.addEventListener('popstate', e => {
  const st = e.state;
  if (!session.role || !st) return;
  navFromHistory = true;
  try {
    openCharId = st.char || null;
    switchView(st.view);
    renderCharacters();
  } finally { navFromHistory = false; }
});

function switchView(viewId, replace) {
  if (!viewAllowed(viewId)) viewId = 'view-characters';
  document.querySelectorAll('#tabs > button[data-view]').forEach(b => {
    const on = b.dataset.view === viewId;
    b.classList.toggle('active', on);
    b.setAttribute('aria-selected', on);
  });
  document.querySelectorAll('main > .view').forEach(v => v.classList.toggle('active', v.id === viewId));
  try { localStorage.setItem('academy_last_view', viewId); } catch (e) {}
  pushNav(replace);
  if (typeof aiRefreshContext === "function") aiRefreshContext();
}

function renderAll() {
  if (!session.role) return;
  renderCharacters();
  renderCombat();
  renderCurriculum();
  renderLedger();
  renderItems();
  renderWorld();
  if (rollerOpen) renderRoller();
  applyRoleGating();
  checkActivity();
  if (typeof aiRefreshContext === "function") aiRefreshContext();
  // in-app dice are optional (real dice by default)
  document.getElementById('roll-btn')?.classList.toggle('hidden', !digitalRolls());
  const dt = document.getElementById('dice-toggle');
  if (dt) dt.checked = digitalRolls();
  const showCombat = viewAllowed('view-combat');
  document.getElementById('tab-combat')?.classList.toggle('hidden', !showCombat);
  const ct = document.getElementById('combat-toggle');
  if (ct) ct.checked = !!state.settings?.playerCombat;
  // a player who is on the Combat tab when the GM hides it gets moved off it
  if (!showCombat && document.getElementById('view-combat').classList.contains('active')) switchView('view-characters', true);
  const name = document.getElementById('header-campaign-name');
  if (name) name.textContent = state.campaignName;
  // players only have one character, so say so
  const tab = document.getElementById('tab-characters');
  if (tab) tab.textContent = session.role === 'player' ? 'My Character' : 'Characters';
}

onStateChange(renderAll);

document.addEventListener('DOMContentLoaded', () => {
  initAuthOnLoad();
});

// Called by showApp() once someone is logged in. The first entry replaces
// the login page's history slot so Back doesn't land on a blank state.
function restoreLastView() {
  let last = 'view-characters';
  try { last = localStorage.getItem('academy_last_view') || last; } catch (e) {}
  switchView(last, true);
}
