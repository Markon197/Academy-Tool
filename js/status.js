// ═══════════════════════════════════════════════════════════════
// STATUS TAB — the live "scene" screen. The one both sides sit on.
//
// PLAYER: one screen, no scrolling. Huge LIFE with big −/+ buttons, Focus /
//   Energy / Stress counters, tap-to-toggle status effects, and the three
//   pillars with their skills as big buttons (tap a skill to see the target
//   number to roll under). Revealed allies/enemies show as a name and a health
//   band only — never numbers. Think of a Magic: The Gathering life counter.
//
// GM: all four players at a glance with big life controls, group actions,
//   a live feed of what players just changed, and a Scene section to bring
//   allies and enemies in (and reveal or hide them) without a combat tracker.
// ═══════════════════════════════════════════════════════════════

const EFFECT_PRESETS = ['Prone', 'Held', 'Stunned', 'Poisoned', 'Bleeding', 'Scared', 'Blinded', 'Slowed', 'Burning', 'Cursed'];
const SKILL_SHORT = { endurance: 'Endur.', presence: 'Pres.', empathy: 'Emp.' };   // so labels never get cut off on narrow phones
const SKILL_PILLAR = Object.fromEntries(PILLARS.flatMap(p => SKILLS_BY_PILLAR[p].map(s => [s, p])));

let psSkill = null;            // skill the player just tapped: { charId, stat, pillar, tn }
let psSkillTimer = null;
let sceneForm = { open: false, name: '', side: 'enemy', life: 20 };
let wakeLock = null, wakeWanted = false;

const mainPCs = () => Object.values(state.characters).filter(c => !c.isNPC).sort((a, b) => a.name.localeCompare(b.name));
const sceneEntries = () => Object.values(state.scene || {}).filter(e => state.characters[e.charId]).sort((a, b) => (a.n || 0) - (b.n || 0));
const buzz = () => { try { navigator.vibrate && navigator.vibrate(12); } catch (e) {} };

// ── Focus mode: on the Status tab the header and tab bar can get out of the way ──
function focusMode() {
  let v = null; try { v = localStorage.getItem('academy_focus'); } catch (e) {}
  return v === null ? session.role === 'player' : v === '1';
}
function setFocusMode(on) {
  try { localStorage.setItem('academy_focus', on ? '1' : '0'); } catch (e) {}
  closeStatusMenu(); applyChrome(); renderStatus();
}
// One tap out of the live screen: bring the header and tabs back and open the character sheet
// (the Status tab stays first in the tab bar to get back).
function exitStatus() {
  try { localStorage.setItem('academy_focus', '0'); } catch (e) {}
  switchView('view-characters');
  applyChrome();
}

function applyChrome() {
  const onStatus = currentView() === 'view-status';
  document.body.classList.toggle('on-status', onStatus);
  document.body.classList.toggle('focus-mode', onStatus && focusMode());
  document.body.classList.toggle('status-fit', onStatus && session.role === 'player');
  // the Exit/Focus button depends on the mode, so redraw when the mode or tab changes
  const key = onStatus + '|' + focusMode();
  if (key !== lastChrome) { lastChrome = key; renderStatus(); }
  fitStatus();
}
let lastChrome = null;
// The player screen must fit the visible window exactly (phones have moving toolbars).
function fitStatus() {
  const ps = document.querySelector('#status-root .ps');
  if (!ps) return;
  const nav = document.getElementById('tabs');
  const top = document.body.classList.contains('focus-mode') ? 0 : (nav ? nav.getBoundingClientRect().bottom : 0);
  ps.style.height = Math.max(320, window.innerHeight - top) + 'px';
}

// ── Menu (players in focus mode have no header, so everything lives here) ──
function openStatusMenu() { renderStatusMenu(true); }
function closeStatusMenu() { document.getElementById('status-menu')?.remove(); }
function renderStatusMenu(open) {
  let el = document.getElementById('status-menu');
  if (!open && !el) return;
  if (!el) { el = document.createElement('div'); el.id = 'status-menu'; document.body.appendChild(el); }
  const tabs = VIEWS.filter(v => v !== 'view-status' && viewAllowed(v));
  const label = v => ({ 'view-characters': session.role === 'player' ? 'My Character' : 'Characters', 'view-combat': 'Combat', 'view-curriculum': 'Curriculum', 'view-ledger': 'Ledger', 'view-items': 'Items', 'view-world': 'World' }[v]);
  el.innerHTML = `
    <div class="sm-backdrop" onclick="closeStatusMenu()"></div>
    <div class="sm-card" role="dialog" aria-label="Menu">
      ${tabs.map(v => `<button class="sm-btn" onclick="closeStatusMenu();switchView('${v}')">${label(v)}</button>`).join('')}
      <button class="sm-btn" onclick="setFocusMode(${!focusMode()})">${focusMode() ? 'Show header & tabs' : 'Focus mode (hide header)'}</button>
      <button class="sm-btn" onclick="toggleWake()">${wakeLock ? '✓ Screen stays on' : 'Keep screen on'}</button>
      <button class="sm-btn danger" onclick="closeStatusMenu();doLogout()">Log out</button>
      <button class="sm-btn ghost" onclick="closeStatusMenu()">Close</button>
    </div>`;
}
async function toggleWake() {
  if (wakeLock) { wakeWanted = false; try { await wakeLock.release(); } catch (e) {} wakeLock = null; }
  else if ('wakeLock' in navigator) {
    try { wakeLock = await navigator.wakeLock.request('screen'); wakeWanted = true; wakeLock.addEventListener('release', () => { wakeLock = null; }); }
    catch (e) { showToast('Could not keep the screen on.'); }
  } else showToast('This browser can’t keep the screen on.');
  renderStatusMenu(true);
}
document.addEventListener('visibilitychange', async () => {   // browsers drop the lock when the tab is hidden
  if (wakeWanted && !wakeLock && document.visibilityState === 'visible' && 'wakeLock' in navigator) {
    try { wakeLock = await navigator.wakeLock.request('screen'); wakeLock.addEventListener('release', () => { wakeLock = null; }); } catch (e) {}
  }
});

// ── Actions shared by both views ──
async function statusLife(id, delta) { buzz(); await applyLife(id, delta); }
async function statusBump(id, field, delta) { buzz(); await bump(id, field, delta, 0); }

async function toggleEffect(id, name) {
  const c = state.characters[id];
  if (!c || !canActAs(id)) return;
  buzz();
  const list = (c.conditions || []).slice(), i = list.indexOf(name);
  if (i === -1) list.push(name); else list.splice(i, 1);
  await dbWrite(`characters/${id}/conditions`, list);
  notifyEvent(c, i === -1 ? `is now ${name}` : `is no longer ${name}`);
}
async function addCustomEffect(id, inputId) {
  const el = document.getElementById(inputId); const t = (el?.value || '').trim();
  if (!t) return;
  el.value = ''; await addCondition(id, t);
}

// Player taps a skill: with real dice we just show the number to roll under.
function pickSkill(id, stat) {
  const c = state.characters[id];
  if (!c || !canActAs(id)) return;
  buzz();
  if (digitalRolls()) { rollStats(id, SKILL_PILLAR[stat], stat); return; }
  const pillar = SKILL_PILLAR[stat];
  const tn = statValue(c, pillar) + statValue(c, stat);
  psSkill = { charId: id, stat, pillar, tn };
  notifyEvent(c, `uses ${STAT_LABEL(stat)} (TN ${tn})`);
  clearTimeout(psSkillTimer);
  psSkillTimer = setTimeout(() => { psSkill = null; renderStatus(); }, 12000);
  renderStatus();
}
function clearSkill() { psSkill = null; clearTimeout(psSkillTimer); renderStatus(); }

// Status effects are rare, so they get one slim row: only the ACTIVE ones, plus a "＋ Effect" button
// that opens a picker. That frees the screen for what matters most: life, skills, friends and foes.
const effArg = name => escapeAttr(name).replace(/'/g, '&#39;');
function fxRow(c, cls) {
  const active = c.conditions || [];
  return `<div class="${cls}-fx">${active.map(e => `<button class="eff on" onclick="toggleEffect('${c.id}','${effArg(e)}')" title="Tap to remove">${escapeHtml(e)} ✕</button>`).join('')}<button class="eff add" onclick="openEffectPicker('${c.id}')">＋ Effect</button></div>`;
}

let effPickId = null;
function openEffectPicker(id) { effPickId = id; renderEffectPicker(); }
function closeEffectPicker() { effPickId = null; document.getElementById('effect-picker')?.remove(); }
function renderEffectPicker() {
  const c = state.characters[effPickId];
  if (!c) { closeEffectPicker(); return; }
  let el = document.getElementById('effect-picker');
  if (!el) { el = document.createElement('div'); el.id = 'effect-picker'; document.body.appendChild(el); }
  const active = c.conditions || [];
  const names = EFFECT_PRESETS.concat(active.filter(e => !EFFECT_PRESETS.includes(e)));
  el.innerHTML = `
    <div class="sm-backdrop" onclick="closeEffectPicker()"></div>
    <div class="sm-card" role="dialog" aria-label="Status effects">
      <div class="ep-title">Status effects — ${escapeHtml(c.name)}</div>
      <div class="ep-grid">${names.map(n => `<button class="eff ${active.includes(n) ? 'on' : ''}" onclick="toggleEffect('${c.id}','${effArg(n)}')">${escapeHtml(n)}</button>`).join('')}</div>
      ${session.role === 'gm' ? `<div class="inline"><input type="text" id="ep-custom" placeholder="Custom effect…" onkeydown="if(event.key==='Enter')addCustomEffect('${c.id}','ep-custom')"><button class="btn small" onclick="addCustomEffect('${c.id}','ep-custom')">Add</button></div>` : ''}
      <button class="sm-btn ghost" onclick="closeEffectPicker()">Done</button>
    </div>`;
}

// Friends and foes the GM has revealed: names + a coarse health band only (never numbers).
const bandPct = o => ({ Unhurt: 100, Hurt: 66, Bloodied: 38, Critical: 14 }[healthBand(o)] || 0);
function sceneSectionHtml() {
  const entries = sceneEntries().filter(e => e.visible);
  if (!entries.length) return '';
  const card = e => {
    const o = state.characters[e.charId];
    const dead = lifeStatus(o) === 'dead' || o.status === 'Dead';
    const label = dead ? 'Defeated' : (o.status && o.status !== 'Alive' ? o.status : healthBand(o));
    return `<div class="ps-foe ${e.side} ${dead ? 'down' : ''}"><div class="fn">${escapeHtml(o.name)}</div><div class="fb">${escapeHtml(label)}</div><div class="fbar"><i style="width:${dead ? 0 : bandPct(o)}%"></i></div></div>`;
  };
  const group = (side, title) => { const l = entries.filter(e => e.side === side); return l.length ? `<div class="ps-grp ${side}"><h5>${title}</h5>${l.map(card).join('')}</div>` : ''; };
  return `<div class="ps-scene2">${group('ally', 'Friends')}${group('enemy', 'Foes')}</div>`;
}

// ═══════════════════ RENDER ═══════════════════
function renderStatus() {
  const root = document.getElementById('status-root');
  if (!root) return;
  if (session.role === 'player') {
    const c = state.characters[session.charId];
    root.innerHTML = c ? playerStatusHtml(c) : '<div class="empty-state">No character found.</div>';
  } else root.innerHTML = gmStatusHtml();
  fitStatus();
  if (effPickId) renderEffectPicker();   // keep an open effect picker current
}

// ── Player ──
function playerStatusHtml(c) {
  const max = lifeMax(c), st = lifeStatus(c);
  const scene = sceneEntries().filter(e => e.visible);
  const sceneName = state.settings?.sceneName;
  const picked = psSkill && psSkill.charId === c.id ? psSkill : null;
  const isSel = s => !!picked && picked.stat === s;
  const counter = (field, label, cls) => `
    <div class="ps-counter ${cls}">
      <button class="ps-cbtn" onclick="statusBump('${c.id}','${field}',-1)" aria-label="${label} down">−</button>
      <div class="ps-cmid"><div class="ps-cval">${c[field]}</div><div class="ps-clab">${label}</div></div>
      <button class="ps-cbtn" onclick="statusBump('${c.id}','${field}',1)" aria-label="${label} up">+</button>
    </div>`;
  return `
  <div class="ps">
    <div class="ps-top">
      <button class="ps-menu" onclick="openStatusMenu()" aria-label="Menu">☰</button>
      <div class="ps-title">
        <div class="ps-name">${escapeHtml(c.name)} ${statusTagHtml(c, false)}</div>
        <div class="ps-scene">${sceneName ? escapeHtml(sceneName) : 'Lvl ' + c.level}</div>
      </div>
      ${focusMode()
        ? `<button class="ps-exit" onclick="exitStatus()" aria-label="Exit the status screen">Exit ✕</button>`
        : `<button class="ps-exit ghost" onclick="setFocusMode(true)" aria-label="Focus mode">Focus ⛶</button>`}
    </div>
    <div class="ps-main">
      <div class="ps-left">
        <div class="ps-life ${st}">
          <div class="ps-life-head"><span class="ps-heart">♥</span><span class="ps-life-lab">LIFE</span>${st === 'downed' ? '<span class="ps-flag">DOWNED</span>' : st === 'dead' ? '<span class="ps-flag">DEAD</span>' : ''}</div>
          <div class="ps-life-num"><span class="n">${c.life}</span><span class="m">/ ${max}</span></div>
          <div class="ps-bar"><div style="width:${pct(c.life, max)}%"></div></div>
          ${st === 'downed' ? `<div class="ps-note">Death buffer ${Math.max(0, -c.life)} / ${deathBuffer(c)}</div>` : ''}
          <div class="ps-life-btns">
            ${[-5, -1, 1, 5].map(d => `<button class="ps-btn ${d < 0 ? 'neg' : 'pos'}" onclick="statusLife('${c.id}',${d})">${d > 0 ? '+' : '−'}${Math.abs(d)}</button>`).join('')}
          </div>
        </div>
        <div class="ps-counters">${counter('focus', 'Focus', 'c-focus')}${counter('energy', 'Energy', 'c-energy')}${counter('stress', 'Stress', 'c-stress')}</div>
        ${c.stress >= 6 ? '<div class="ps-alert">6 Stress — gain a Ruin point</div>' : ''}
        ${fxRow(c, 'ps')}
      </div>
      <div class="ps-right">
        ${sceneSectionHtml()}
        ${picked ? `<div class="ps-pick" onclick="clearSkill()"><span>${STAT_LABEL(psSkill.pillar)} + ${STAT_LABEL(psSkill.stat)} → roll a d20, <strong>${psSkill.tn >= 20 ? 'only a 20 fails' : psSkill.tn + ' or lower'}</strong></span><i>✕</i></div>` : ''}
        <div class="ps-attrs">
          ${PILLARS.map(p => `
            <div class="ps-pillar pillar-${p}">
              <div class="ps-phead"><span>${p.toUpperCase()}</span><b>${c.pillars[p]}</b></div>
              ${SKILLS_BY_PILLAR[p].map(s => `<button class="ps-skill ${isSel(s) ? 'sel' : ''}" onclick="pickSkill('${c.id}','${s}')"><span>${SKILL_SHORT[s] || STAT_LABEL(s)}</span><b>${isSel(s) ? psSkill.tn : c.skills[s]}</b>${isSel(s) ? '<small>roll ≤ TN</small>' : ''}</button>`).join('')}
            </div>`).join('')}
        </div>
      </div>
    </div>
  </div>`;
}

// ── GM ──
function gmStatusHtml() {
  const pcs = mainPCs();
  const entries = sceneEntries();
  const allyList = entries.filter(e => e.side === 'ally'), foeList = entries.filter(e => e.side === 'enemy');
  const inScene = new Set(entries.map(e => e.charId));
  const pool = Object.values(state.characters).filter(c => c.isNPC && !inScene.has(c.id)).sort((a, b) => a.name.localeCompare(b.name));
  const feed = activityList().slice(0, 4);
  return `
  <div class="gs-bar panel">
    <div class="gs-row">
      <div class="field grow"><label>Scene <span class="sub">(players see this)</span></label>
        <input type="text" value="${escapeAttr(state.settings?.sceneName || '')}" placeholder="e.g. The Great Gate of Kain" onchange="dbWrite('settings/sceneName', this.value)"></div>
      <div class="field"><label>Group amount</label><input type="number" id="gs-amount" value="5" min="1" class="gs-amount"></div>
      <div class="btn-row gs-group">
        <button class="btn danger" onclick="groupLife(-1)">− Damage all</button>
        <button class="btn" onclick="groupLife(1)">+ Heal all</button>
        <button class="btn" onclick="fullHealAll()">Full heal</button>
        <button class="btn" onclick="restAll()" title="Refresh every player's technique cooldowns">Rest all</button>
        <button class="btn" onclick="clearAllEffects()">Clear effects</button>
        <button class="btn small" onclick="setFocusMode(${!focusMode()})">${focusMode() ? 'Show header' : 'Focus mode'}</button>
      </div>
    </div>
    ${feed.length ? `<div class="gs-feed"><span class="sub">Just now:</span> ${feed.map(a => `<span class="gs-feed-item">${escapeHtml(a.text)} <em>${timeAgo(a.ts)}</em></span>`).join('')}</div>` : ''}
  </div>

  <div class="panel gs-scene">
    <div class="panel-title"><span>Scene <span class="sub">allies &amp; enemies — players only ever see a name and health band</span></span>
      ${entries.length ? '<button class="btn small" onclick="clearScene()">Clear scene</button>' : ''}</div>
    <div class="toolbar">
      <div class="field grow"><label>Bring in</label>
        <select id="scene-pick"><option value="">— choose an NPC —</option>${pool.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('')}</select></div>
      <div class="btn-row">
        <button class="btn" onclick="addPicked('ally')">+ Ally</button>
        <button class="btn danger" onclick="addPicked('enemy')">+ Enemy</button>
        <button class="btn primary" onclick="sceneForm.open=!sceneForm.open;renderStatus()">${sceneForm.open ? 'Cancel' : '+ Quick new'}</button>
      </div>
    </div>
    ${sceneForm.open ? `
    <div class="toolbar gs-quick">
      <div class="field grow"><label>Name</label><input type="text" value="${escapeAttr(sceneForm.name)}" oninput="sceneForm.name=this.value" onkeydown="if(event.key==='Enter')quickScene()" placeholder="Goblin, Warden, Mysterious stranger…"></div>
      <div class="field"><label>Side</label><select onchange="sceneForm.side=this.value"><option value="enemy" ${sceneForm.side === 'enemy' ? 'selected' : ''}>Enemy</option><option value="ally" ${sceneForm.side === 'ally' ? 'selected' : ''}>Ally</option></select></div>
      <div class="field"><label>LIFE</label><input type="number" min="1" value="${sceneForm.life}" oninput="sceneForm.life=Number(this.value)||1" style="width:90px"></div>
      <div class="btn-row"><button class="btn primary" onclick="quickScene()">Add to scene</button></div>
    </div>` : ''}
    <div class="gs-sides">
      <div class="gs-side ally"><h4>Allies</h4>${allyList.length ? allyList.map(sceneCardHtml).join('') : '<div class="empty-state" style="padding:14px">No allies in the scene.</div>'}</div>
      <div class="gs-side enemy"><h4>Enemies</h4>${foeList.length ? foeList.map(sceneCardHtml).join('') : '<div class="empty-state" style="padding:14px">No enemies in the scene.</div>'}</div>
    </div>
  </div>

  <div class="gs-grid">${pcs.length ? pcs.map(gmPlayerCard).join('') : '<div class="panel"><div class="empty-state">No player characters yet.</div></div>'}</div>`;
}

function gmPlayerCard(c) {
  const max = lifeMax(c), st = lifeStatus(c);
  const mini = (field, label) => `<div class="gs-mini"><button class="icon-btn" onclick="statusBump('${c.id}','${field}',-1)" aria-label="${label} down">−</button><div><b>${c[field]}</b><span>${label}</span></div><button class="icon-btn" onclick="statusBump('${c.id}','${field}',1)" aria-label="${label} up">+</button></div>`;
  return `
  <div class="gs-card ${st}">
    <div class="gs-head">
      <div><a href="#" class="gs-name" onclick="event.preventDefault();switchView('view-characters');openChar('${c.id}')">${escapeHtml(c.name)}</a> <span class="sub">${escapeHtml(c.player || '')}</span></div>
      <div class="inline"><button class="icon-btn edit" onclick="openQuickEdit('${c.id}')" title="Quick edit (max LIFE, stats)" aria-label="Quick edit ${escapeAttr(c.name)}">✎</button>
      <select class="gs-status ${statusClass(c.status)}" onchange="setField('${c.id}','status',this.value)" aria-label="Status">${CHAR_STATUSES.map(s => `<option ${c.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
    </div>
    <div class="gs-life"><span class="n">${c.life}</span><span class="m">/ ${max}</span>
      ${st === 'downed' ? `<span class="gs-flag">DOWNED · buffer ${Math.max(0, -c.life)}/${deathBuffer(c)}</span>` : st === 'dead' ? '<span class="gs-flag">LIFE: DEAD</span>' : ''}</div>
    <div class="ps-bar"><div style="width:${pct(c.life, max)}%"></div></div>
    <div class="gs-btns">
      ${[-10, -5, -1, 1, 5, 10].map(d => `<button class="gs-btn ${d < 0 ? 'neg' : 'pos'}" onclick="statusLife('${c.id}',${d})">${d > 0 ? '+' : '−'}${Math.abs(d)}</button>`).join('')}
      <button class="gs-btn full" onclick="setField('${c.id}','life',${max},true)">Full</button>
    </div>
    <div class="gs-minis">${mini('focus', 'Focus')}${mini('energy', 'Energy')}${mini('stress', 'Stress')}${mini('ascension', 'Ascension')}${mini('ruin', 'Ruin')}</div>
    ${c.stress >= 6 ? '<div class="alert danger" style="margin:6px 0">6 Stress — Ruin point due</div>' : ''}
    ${fxRow(c, 'gs')}
    ${c.gmNotes ? `<div class="combat-gmnote"><strong>GM:</strong> ${escapeHtml(notePreview(c.gmNotes, 160))}</div>` : ''}
  </div>`;
}

function sceneCardHtml(e) {
  const c = state.characters[e.charId];
  const max = lifeMax(c), st = lifeStatus(c);
  const dead = st === 'dead' || c.status === 'Dead';
  return `
  <div class="gs-npc ${e.side} ${dead ? 'dead' : ''} ${e.visible ? '' : 'hidden-from-players'}">
    <div class="gs-npc-head">
      <div><a href="#" class="gs-name" onclick="event.preventDefault();switchView('view-characters');openChar('${c.id}')">${escapeHtml(c.name)}</a>
        <span class="tag">${healthBand(c)}</span>${statusTagHtml(c, false)}${factionTagHtml(c)}${e.visible ? '' : '<span class="tag danger">hidden from players</span>'}</div>
      <div class="inline">
        <button class="icon-btn edit" onclick="openQuickEdit('${c.id}')" title="Quick edit (max LIFE, stats)" aria-label="Quick edit ${escapeAttr(c.name)}">✎</button>
        <button class="icon-btn" onclick="toggleSceneVisible('${e.id}')" title="${e.visible ? 'Hide from players' : 'Reveal to players'}" aria-label="${e.visible ? 'Hide from players' : 'Reveal to players'}">${e.visible ? '👁' : '🚫'}</button>
        <button class="icon-btn" onclick="removeFromScene('${e.id}')" aria-label="Remove from scene">✕</button></div>
    </div>
    <div class="gs-npc-life"><b>${c.life}</b> / ${max}<div class="ps-bar thin"><div style="width:${pct(c.life, max)}%"></div></div></div>
    <div class="gs-btns small">${[-5, -1, 1, 5].map(d => `<button class="gs-btn ${d < 0 ? 'neg' : 'pos'}" onclick="statusLife('${c.id}',${d})">${d > 0 ? '+' : '−'}${Math.abs(d)}</button>`).join('')}
      <button class="gs-btn full" onclick="setField('${c.id}','status','Dead')">☠ Defeated</button></div>
    ${fxRow(c, 'gs')}
  </div>`;
}

// ── GM: scene management ──
async function addToScene(charId, side, visible) {
  const id = uid();
  await dbWrite('scene/' + id, { id, charId, side, visible: visible !== false, n: Date.now() });
}
async function addPicked(side) {
  const id = document.getElementById('scene-pick').value;
  if (!id) { showToast('Choose an NPC first.'); return; }
  await addToScene(id, side, true);
}
async function quickScene() {
  const name = (sceneForm.name || '').trim();
  if (!name) { showToast('Give them a name.'); return; }
  const c = blankCharacter(true);
  c.name = name; c.lifeOverride = true; c.maxLife = Math.max(1, sceneForm.life); c.life = c.maxLife;
  await dbWrite('characters/' + c.id, c);
  await addToScene(c.id, sceneForm.side, true);
  sceneForm.name = ''; renderStatus();
  showToast(`${name} joins the scene.`);
}
async function removeFromScene(id) { await dbWrite('scene/' + id, null); }
async function toggleSceneVisible(id) { await dbWrite(`scene/${id}/visible`, !state.scene[id].visible); }
async function clearScene() {
  if (!confirm('Take everyone out of the scene? (Characters stay in the roster.)')) return;
  await dbWrite('scene', null);
}

// ── GM: group actions on the four main characters ──
async function groupLife(sign) {
  const n = Math.abs(Number(document.getElementById('gs-amount')?.value) || 0);
  if (!n) return;
  for (const c of mainPCs()) await applyLife(c.id, sign * n);
  showToast(`${sign < 0 ? 'Damage' : 'Heal'} ${n} to everyone.`);
}
async function fullHealAll() { for (const c of mainPCs()) await dbWrite(`characters/${c.id}/life`, lifeMax(c)); showToast('Everyone healed to full.'); }
async function restAll() {
  const u = {}; mainPCs().forEach(c => { u[`characters/${c.id}/cooldowns`] = null; });
  await dbUpdate(u); showToast('Everyone rested — techniques refreshed.');
}
async function clearAllEffects() {
  const u = {}; mainPCs().forEach(c => { u[`characters/${c.id}/conditions`] = null; });
  await dbUpdate(u); showToast('All status effects cleared.');
}
