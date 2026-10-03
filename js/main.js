// ═══════════════════════════════════════════════════════════════
// APP INIT / VIEW SWITCHING
// ═══════════════════════════════════════════════════════════════

const VIEWS = ['view-characters', 'view-combat', 'view-curriculum', 'view-ledger', 'view-items'];

function switchView(viewId) {
  if (!VIEWS.includes(viewId) || (viewId === 'view-items' && session.role !== 'gm')) viewId = 'view-characters';
  document.querySelectorAll('#tabs > button[data-view]').forEach(b => {
    const on = b.dataset.view === viewId;
    b.classList.toggle('active', on);
    b.setAttribute('aria-selected', on);
  });
  document.querySelectorAll('main > .view').forEach(v => v.classList.toggle('active', v.id === viewId));
  try { localStorage.setItem('academy_last_view', viewId); } catch (e) {}
}

function renderAll() {
  if (!session.role) return;
  renderCharacters();
  renderCombat();
  renderCurriculum();
  renderLedger();
  renderItems();
  if (rollerOpen) renderRoller();
  applyRoleGating();
  // in-app dice are optional (real dice by default)
  document.getElementById('roll-btn')?.classList.toggle('hidden', !digitalRolls());
  const dt = document.getElementById('dice-toggle');
  if (dt) dt.checked = digitalRolls();
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

// Called by showApp() once someone is logged in.
function restoreLastView() {
  let last = 'view-characters';
  try { last = localStorage.getItem('academy_last_view') || last; } catch (e) {}
  switchView(last);
}
