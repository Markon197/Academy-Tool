// ═══════════════════════════════════════════════════════════════
// CHARACTER MODULE
// A live character sheet built on the real rules: 3 Pillars x 3 Skills,
// derived LIFE, Focus / Energy / Stress / Ascension / Ruin, techniques with
// enforced cooldowns, talents, archetype, professors & clubs, inventory.
//
// GM: sees and edits everything (PCs and NPCs).
// Player: sees only their own sheet; may roll, use techniques and adjust
//         their own LIFE / Focus / Energy / Stress.
//
// Edits save immediately on change (no Save button), so everyone at the
// table sees them live and nothing is lost on a reload.
// ═══════════════════════════════════════════════════════════════

let openCharId = null;      // GM: which sheet is open
let charFilter = 'all';     // 'all' | 'pc' | 'npc'
let charSearch = '';
let showAllMoves = false;
let techDraft = null;       // GM: custom technique being written

// Which fields a player may change on their own sheet.
const PLAYER_EDITABLE = ['life', 'focus', 'energy', 'stress'];
function canEdit(c, field) {
  if (session.role === 'gm') return true;
  return session.role === 'player' && session.charId === c.id && PLAYER_EDITABLE.includes(field);
}

function blankCharacter(isNPC) {
  const c = normaliseCharacter({
    id: uid(), name: '', isNPC, player: '', year: 1, level: 1,
    focus: isNPC ? 0 : 1, energy: isNPC ? 0 : 5, stress: 0, ascension: 0, ruin: 0, detention: 0,
    archetypeId: '', professorIds: [], clubIds: [], skillIds: [], unlockedIds: [],
    talentRanks: {}, techniques: {}, inventory: {}, notes: '', gmNotes: '', pin: '',
  });
  c.life = lifeMax(c);
  return c;
}

// ── Shared helpers (also used by combat.js) ──
function charTechniques(c) {
  const lib = (c.skillIds || []).map(id => state.skills[id]).filter(Boolean).map(s => ({ ...s, key: s.id, custom: false }));
  const own = Object.values(c.techniques || {}).map(t => ({ ...t, key: t.id, custom: true }));
  return lib.concat(own);
}

function cooldownLabel(c, key) {
  const v = (c.cooldowns || {})[key];
  if (!v) return '';
  if (v === 'battle') return 'used this battle';
  if (v === 'rest') return 'used until rest';
  return `ready in ${v} round${v > 1 ? 's' : ''}`;
}

async function setField(id, field, value, numeric) {
  const v = numeric ? (Number(value) || 0) : value;
  await dbWrite('characters/' + id + '/' + field, v);
}
async function bump(id, field, delta, min, max) {
  const c = state.characters[id];
  if (!c || !canEdit(c, field)) return;
  let v = (Number(c[field]) || 0) + delta;
  if (min !== undefined) v = Math.max(min, v);
  if (max !== undefined) v = Math.min(max, v);
  await dbWrite('characters/' + id + '/' + field, v);
}

// LIFE can drop below 0 (down to the death buffer); healing is capped at max.
async function applyLife(id, delta) {
  const c = state.characters[id];
  if (!c || !delta || !canEdit(c, 'life')) return;
  const next = Math.max(-999, Math.min(lifeMax(c), (Number(c.life) || 0) + delta));
  await dbWrite('characters/' + id + '/life', next);
  const after = { ...c, life: next };
  if (lifeStatus(c) !== lifeStatus(after)) {
    const st = lifeStatus(after);
    showToast(st === 'downed' ? `${c.name} is down! Death buffer: ${deathBuffer(c)}.` : st === 'dead' ? `${c.name} has died.` : `${c.name} is back on their feet.`);
  }
}
function lifeCalc(id, sign) {
  const el = document.getElementById('lifecalc-' + id);
  const n = Math.abs(Number(el?.value) || 0);
  if (n) applyLife(id, sign * n);
}

// ── Roster / sheet switch ──
function renderCharacters() {
  const root = document.getElementById('characters-root');
  if (!root) return;

  if (session.role === 'player') {
    const c = state.characters[session.charId];
    root.innerHTML = c ? sheetHtml(c) : '<div class="empty-state">No character found.</div>';
    return;
  }
  if (openCharId && !state.characters[openCharId]) openCharId = null;
  if (openCharId) { root.innerHTML = sheetHtml(state.characters[openCharId]); return; }

  const list = Object.values(state.characters)
    .filter(c => charFilter === 'all' || (charFilter === 'pc' && !c.isNPC) || (charFilter === 'npc' && c.isNPC))
    .filter(c => !charSearch || c.name.toLowerCase().includes(charSearch.toLowerCase()) || (c.player || '').toLowerCase().includes(charSearch.toLowerCase()))
    .sort((a, b) => (a.isNPC - b.isNPC) || a.name.localeCompare(b.name));

  root.innerHTML = `
  <div class="panel">
    <div class="panel-title">Characters &amp; NPCs</div>
    <div class="toolbar">
      <div class="field grow"><label>Search</label><input type="text" placeholder="Name or player…" value="${escapeAttr(charSearch)}" oninput="charSearch=this.value;renderCharacters()"></div>
      <div class="field"><label>Filter</label>
        <select onchange="charFilter=this.value;renderCharacters()">
          <option value="all" ${charFilter === 'all' ? 'selected' : ''}>All</option>
          <option value="pc" ${charFilter === 'pc' ? 'selected' : ''}>PCs only</option>
          <option value="npc" ${charFilter === 'npc' ? 'selected' : ''}>NPCs only</option>
        </select></div>
      <div class="btn-row"><button class="btn primary" onclick="newCharacter(false)">+ New PC</button><button class="btn" onclick="newCharacter(true)">+ New NPC</button></div>
    </div>
    ${list.length ? list.map(rosterItemHtml).join('') : '<div class="empty-state">No characters yet — create one to get started.</div>'}
  </div>`;
}

function rosterItemHtml(c) {
  const st = lifeStatus(c);
  const arch = state.archetypes[c.archetypeId];
  return `
  <div class="roster-item" onclick="openChar('${c.id}')">
    <div>
      <div class="name">${escapeHtml(c.name || '(unnamed)')} ${c.isNPC ? '<span class="tag">NPC</span>' : '<span class="tag">PC</span>'}${st !== 'ok' ? `<span class="tag danger">${st === 'dead' ? 'Dead' : 'Down'}</span>` : ''}</div>
      <div class="meta">${c.player ? 'Player: ' + escapeHtml(c.player) + ' · ' : ''}${c.year ? 'Year ' + c.year + ' · ' : ''}Lvl ${c.level} · Life ${c.life}/${lifeMax(c)} · Focus ${c.focus} · Stress ${c.stress}${arch ? ' · ' + escapeHtml(arch.name) : ''}</div>
    </div>
    <button class="icon-btn" onclick="event.stopPropagation();deleteCharacter('${c.id}')" title="Delete" aria-label="Delete ${escapeAttr(c.name)}">✕</button>
  </div>`;
}

async function newCharacter(isNPC) {
  const c = blankCharacter(isNPC);
  c.name = isNPC ? 'New NPC' : 'New Character';
  await dbWrite('characters/' + c.id, c);
  openCharId = c.id;
  renderCharacters();
}
function openChar(id) { openCharId = id; techDraft = null; renderCharacters(); window.scrollTo(0, 0); }
function closeChar() { openCharId = null; techDraft = null; renderCharacters(); }

async function deleteCharacter(id) {
  const c = state.characters[id];
  if (!confirm(`Really delete ${c ? c.name : 'this character'}? This cannot be undone.`)) return;
  const order = (state.combat.order || []).filter(x => x !== id);
  await dbUpdate({ ['characters/' + id]: null, 'combat/order': order });
  if (openCharId === id) openCharId = null;
  showToast('Character deleted.');
}

// ── Sheet ──
function counterHtml(c, field, label, opts) {
  opts = opts || {};
  const edit = canEdit(c, field);
  return `
  <div class="counter" title="${escapeAttr(opts.hint || '')}">
    <div class="c-label">${label}</div>
    <div class="c-ctl">
      ${edit ? `<button class="icon-btn" onclick="bump('${c.id}','${field}',-1,${opts.min ?? 0})" aria-label="Decrease ${label}">−</button>` : ''}
      <span class="c-val">${c[field]}</span>
      ${edit ? `<button class="icon-btn" onclick="bump('${c.id}','${field}',1,${opts.min ?? 0})" aria-label="Increase ${label}">+</button>` : ''}
    </div>
  </div>`;
}

function lifeBlockHtml(c) {
  const max = lifeMax(c), st = lifeStatus(c);
  const buffer = deathBuffer(c);
  const below = Math.max(0, -c.life);
  return `
  <div class="stat-bar-wrap">
    <div class="stat-bar-label"><span>LIFE ${c.lifeOverride ? '(manual max)' : '= (Body + Mind + Soul) × 2'}</span><span>${c.life} / ${max}</span></div>
    <div class="stat-bar"><div class="stat-bar-fill hp" style="width:${pct(c.life, max)}%"></div></div>
  </div>
  ${st === 'downed' ? `<div class="alert danger">DOWNED — passed out. Death buffer used: ${below} / ${buffer}. Anything past ${buffer} below 0 is death.</div>` : ''}
  ${st === 'dead' ? '<div class="alert danger">DEAD — pushed beyond the death buffer.</div>' : ''}
  ${canEdit(c, 'life') ? `
  <div class="calc-row">
    <input type="number" id="lifecalc-${c.id}" value="1" min="1" aria-label="Amount">
    <button class="btn small danger" onclick="lifeCalc('${c.id}',-1)">− Damage</button>
    <button class="btn small" onclick="lifeCalc('${c.id}',1)">+ Heal</button>
    ${session.role === 'gm' ? `<button class="btn small" onclick="setField('${c.id}','life',${max},true)">Full</button>` : ''}
  </div>` : ''}`;
}

function pillarsHtml(c) {
  const gm = session.role === 'gm';
  const inp = (group, key, big) => gm
    ? `<input type="number" class="${big ? 'pillar-in' : 'skill-in'}" value="${c[group][key]}" onchange="setField('${c.id}','${group}/${key}',this.value,true)" aria-label="${STAT_LABEL(key)}">`
    : `<span class="${big ? 'pillar-val' : 'skill-val'}">${c[group][key]}</span>`;
  return `
  <div class="pillars">${PILLARS.map(p => `
    <div class="pillar pillar-${p}">
      <div class="pillar-head"><span>${p.toUpperCase()}</span>${inp('pillars', p, true)}</div>
      ${SKILLS_BY_PILLAR[p].map(s => `
        <div class="skill-row">
          <button class="skill-roll" onclick="rollStats('${c.id}','${p}','${s}')" title="Roll ${STAT_LABEL(p)} + ${STAT_LABEL(s)} (TN ${statValue(c, p) + statValue(c, s)})">🎲 ${STAT_LABEL(s)}</button>
          ${inp('skills', s, false)}
        </div>`).join('')}
    </div>`).join('')}</div>`;
}

function movesHtml(c) {
  const shown = showAllMoves ? MOVES.map((m, i) => [m, i]) : MOVES.map((m, i) => [m, i]).filter(([m]) => CORE_MOVES.includes(m[0]));
  return `
  <div class="moves">${shown.map(([m, i]) => `<button class="move-btn" onclick="rollMove('${c.id}',${i})"><span>${m[0]}</span><small>${STAT_LABEL(m[1])}+${STAT_LABEL(m[2])} · TN ${statValue(c, m[1]) + statValue(c, m[2])}</small></button>`).join('')}</div>
  <button class="btn small" style="margin-top:8px" onclick="showAllMoves=!showAllMoves;renderCharacters()">${showAllMoves ? 'Show fewer moves' : 'Show all ' + MOVES.length + ' moves'}</button>`;
}

function techniquesHtml(c) {
  const list = charTechniques(c);
  const gm = session.role === 'gm';
  const canUse = canActAs(c.id);
  const lib = Object.values(state.skills).filter(s => !(c.skillIds || []).includes(s.id)).sort((a, b) => (a.origin || '').localeCompare(b.origin || '') || a.name.localeCompare(b.name));
  return `
  ${list.length ? list.map(t => {
    const cd = parseCooldown(t.cooldownCost);
    const state_ = cooldownLabel(c, t.key);
    const roll = parseRoll(t.roll);
    return `
    <div class="tech ${state_ ? 'on-cd' : ''}">
      <div class="tech-main">
        <div><strong>${escapeHtml(t.name)}</strong> <span class="tag">${escapeHtml(t.origin || 'Technique')}</span>${t.levelRequirement ? `<span class="tag">Lvl ${t.levelRequirement}</span>` : ''}${t.cooldownCost ? `<span class="tag">${escapeHtml(t.cooldownCost)}</span>` : ''}${t.roll ? `<span class="tag">${escapeHtml(t.roll)}</span>` : ''}</div>
        <div class="desc">${escapeHtml(t.effect) || '—'}</div>
        ${state_ ? `<div class="cd-note">⏳ ${state_}</div>` : ''}
      </div>
      <div class="tech-btns">
        ${canUse && !cd.passive ? `<button class="btn small primary" onclick="useTechnique('${c.id}','${t.key}')" ${state_ ? 'disabled' : ''}>${roll ? 'Use + roll' : 'Use'}</button>` : ''}
        ${canUse && state_ ? `<button class="icon-btn" title="Reset cooldown" onclick="resetCooldown('${c.id}','${t.key}')">↺</button>` : ''}
        ${gm ? `<button class="icon-btn" title="Remove" onclick="removeTechnique('${c.id}','${t.key}',${t.custom})">✕</button>` : ''}
      </div>
    </div>`;
  }).join('') : '<div class="empty-state">No techniques yet.</div>'}
  ${canUse ? `<button class="btn small" onclick="restCharacter('${c.id}')" title="Clears 'per battle' and 'until rest' cooldowns">Rest / new scene — refresh techniques</button>` : ''}
  ${gm ? `
  <div class="subpanel">
    <div class="field"><label>Teach a curriculum technique</label>
      <div class="inline"><select id="add-skill-${c.id}"><option value="">— choose —</option>${lib.map(s => `<option value="${s.id}">${escapeHtml(s.name)} (${escapeHtml(s.origin || '—')}${s.levelRequirement ? ', Lvl ' + s.levelRequirement : ''})</option>`).join('')}</select>
      <button class="btn small" onclick="addLibrarySkill('${c.id}')">+ Add</button></div></div>
    ${techDraft ? techDraftHtml(c) : `<button class="btn small" onclick="techDraft={name:'',origin:'',cooldownCost:'',levelRequirement:0,roll:'',effect:''};renderCharacters()">+ Write a custom technique</button>`}
  </div>` : ''}`;
}

function techDraftHtml(c) {
  const d = techDraft;
  return `
  <div class="subpanel">
    <div class="grid cols-3">
      <div class="field"><label>Name</label><input type="text" value="${escapeAttr(d.name)}" oninput="techDraft.name=this.value"></div>
      <div class="field"><label>Origin</label><input type="text" value="${escapeAttr(d.origin)}" oninput="techDraft.origin=this.value" placeholder="Professor / club / item"></div>
      <div class="field"><label>Cooldown / cost</label><input type="text" value="${escapeAttr(d.cooldownCost)}" oninput="techDraft.cooldownCost=this.value" placeholder="CD 2 · Once per battle · Spend 1 Focus"></div>
    </div>
    <div class="grid cols-3">
      <div class="field"><label>Level</label><input type="number" value="${d.levelRequirement}" oninput="techDraft.levelRequirement=Number(this.value)||0"></div>
      <div class="field" style="grid-column:span 2"><label>Roll (e.g. Body + Force)</label><input type="text" value="${escapeAttr(d.roll)}" oninput="techDraft.roll=this.value"></div>
    </div>
    <div class="field"><label>Effect</label><textarea oninput="techDraft.effect=this.value">${escapeHtml(d.effect)}</textarea></div>
    <div class="btn-row"><button class="btn primary small" onclick="saveTechDraft('${c.id}')">Add technique</button><button class="btn small" onclick="techDraft=null;renderCharacters()">Cancel</button></div>
  </div>`;
}

async function saveTechDraft(charId) {
  if (!techDraft.name.trim()) { showToast('Technique needs a name.'); return; }
  const id = 'tq_' + uid();
  await dbWrite(`characters/${charId}/techniques/${id}`, { ...techDraft, id, name: techDraft.name.trim() });
  techDraft = null;
  showToast('Technique added.');
}
async function addLibrarySkill(charId) {
  const id = document.getElementById('add-skill-' + charId).value;
  if (!id) return;
  const c = state.characters[charId];
  await dbWrite(`characters/${charId}/skillIds`, (c.skillIds || []).concat([id]));
}
async function removeTechnique(charId, key, custom) {
  const c = state.characters[charId];
  if (custom) await dbWrite(`characters/${charId}/techniques/${key}`, null);
  else await dbWrite(`characters/${charId}/skillIds`, (c.skillIds || []).filter(x => x !== key));
}

// ── Using techniques: enforces Focus/Energy cost and cooldowns ──
async function useTechnique(charId, key) {
  const c = state.characters[charId];
  if (!c || !canActAs(charId)) return;
  const t = charTechniques(c).find(x => x.key === key);
  if (!t) return;
  if ((c.cooldowns || {})[key]) { showToast(`${t.name} is not ready (${cooldownLabel(c, key)}).`); return; }
  const cd = parseCooldown(t.cooldownCost);
  if (cd.focus && c.focus < cd.focus) { showToast(`${t.name} costs ${cd.focus} Focus — ${c.name} has ${c.focus}.`); return; }
  if (cd.energy && c.energy < cd.energy) { showToast(`${t.name} costs ${cd.energy} Energy — ${c.name} has ${c.energy}.`); return; }
  const updates = {};
  if (cd.focus) updates[`characters/${charId}/focus`] = c.focus - cd.focus;
  if (cd.energy) updates[`characters/${charId}/energy`] = c.energy - cd.energy;
  if (cd.perBattle) updates[`characters/${charId}/cooldowns/${key}`] = 'battle';
  else if (cd.rounds) updates[`characters/${charId}/cooldowns/${key}`] = cd.rounds;
  else if (cd.perRest) updates[`characters/${charId}/cooldowns/${key}`] = 'rest';
  if (Object.keys(updates).length) await dbUpdate(updates);
  const r = parseRoll(t.roll);
  if (r) await performRoll(charId, r.a, r.b, 0, t.name);
  else { await logNote(c, `uses ${t.name}`); showToast(`${c.name} uses ${t.name}.`); }
}
async function resetCooldown(charId, key) { await dbWrite(`characters/${charId}/cooldowns/${key}`, null); }
async function restCharacter(charId) {
  const c = state.characters[charId];
  await dbWrite(`characters/${charId}/cooldowns`, null);
  showToast(`${c.name}: techniques refreshed.`);
}

// ── Talents, professors, clubs ──
function talentsHtml(c) {
  const ranks = c.talentRanks || {};
  const owned = Object.keys(ranks).filter(id => ranks[id] > 0 && state.talents[id]);
  const gm = session.role === 'gm';
  const avail = Object.values(state.talents).filter(t => !(ranks[t.id] > 0)).sort((a, b) => a.name.localeCompare(b.name));
  return `
  ${owned.length ? owned.map(id => {
    const t = state.talents[id], max = (t.levelRequirements || [1]).length;
    return `<div class="tech"><div class="tech-main"><strong>${escapeHtml(t.name)}</strong> <span class="tag">${escapeHtml(t.type || 'Talent')}</span>${max > 1 ? `<span class="tag">Rank ${ranks[id]}/${max}</span>` : ''}<div class="desc">${escapeHtml(t.description)}</div></div>
      ${gm ? `<div class="tech-btns"><button class="icon-btn" onclick="adjustRank('${c.id}','${id}',-1)">−</button><button class="icon-btn" onclick="adjustRank('${c.id}','${id}',1,${max})">+</button></div>` : ''}</div>`;
  }).join('') : '<div class="empty-state">No talents taken.</div>'}
  ${gm ? `<div class="inline" style="margin-top:8px"><select id="add-talent-${c.id}"><option value="">— add a talent —</option>${avail.map(t => `<option value="${t.id}">${escapeHtml(t.name)} (Lvl ${(t.levelRequirements || [1]).join('/')})</option>`).join('')}</select><button class="btn small" onclick="addTalent('${c.id}')">+ Add</button></div>` : ''}`;
}
async function addTalent(charId) {
  const id = document.getElementById('add-talent-' + charId).value;
  if (id) await dbWrite(`characters/${charId}/talentRanks/${id}`, 1);
}

function originsHtml(c) {
  const gm = session.role === 'gm';
  const profs = Object.values(state.professors).sort((a, b) => a.name.localeCompare(b.name));
  const clubs = Object.values(state.clubs).sort((a, b) => a.name.localeCompare(b.name));
  const check = (kind, ids, items) => items.map(x => `
    <label class="chk"><input type="checkbox" ${ids.includes(x.id) ? 'checked' : ''} ${gm ? '' : 'disabled'} onchange="toggleOrigin('${c.id}','${kind}','${x.id}')"> ${escapeHtml(x.name)}</label>`).join('');
  const myProfs = (c.professorIds || []).map(id => state.professors[id]).filter(Boolean);
  const myClubs = (c.clubIds || []).map(id => state.clubs[id]).filter(Boolean);
  return `
  ${gm ? `<div class="field"><label>Professor / discipline (pupil)</label><div>${check('professorIds', c.professorIds, profs) || '<span class="note">No professors in the library yet.</span>'}</div></div>
          <div class="field"><label>Clubs / extracurricular</label><div>${check('clubIds', c.clubIds, clubs) || '<span class="note">No clubs in the library yet.</span>'}</div></div>` : ''}
  ${myProfs.map(p => `<div class="origin"><strong>${escapeHtml(p.name)}</strong> ${p.pillar ? `<span class="tag">${escapeHtml(p.pillar)}</span>` : ''}${p.quote ? `<div class="desc"><em>${escapeHtml(p.quote)}</em></div>` : ''}${p.tableRules ? `<div class="desc"><strong>Rules at the table:</strong> ${escapeHtml(p.tableRules)}</div>` : ''}</div>`).join('')}
  ${myClubs.map(cl => `<div class="origin"><strong>${escapeHtml(cl.name)}</strong>${cl.whatYouDo ? `<div class="desc">${escapeHtml(cl.whatYouDo)}</div>` : ''}${cl.unlockableText && (!cl.secret || (c.unlockedIds || []).includes(cl.id) || gm) ? `<div class="desc"><strong>Signature:</strong> ${escapeHtml(cl.unlockableText)}</div>` : ''}</div>`).join('')}
  ${!myProfs.length && !myClubs.length && !gm ? '<div class="empty-state">No professor or club yet.</div>' : ''}`;
}
async function toggleOrigin(charId, kind, id) {
  const c = state.characters[charId];
  const list = (c[kind] || []).slice();
  const i = list.indexOf(id);
  if (i === -1) list.push(id); else list.splice(i, 1);
  await dbWrite(`characters/${charId}/${kind}`, list);
}

// ── Inventory (stored as an id-keyed map so simultaneous edits don't clobber) ──
function inventoryHtml(c) {
  const gm = session.role === 'gm';
  const items = Object.values(c.inventory || {});
  const others = Object.values(state.characters).filter(x => x.id !== c.id).sort((a, b) => a.name.localeCompare(b.name));
  return `
  ${items.length ? items.map(it => `
    <div class="inventory-item">
      <div style="flex:1"><strong>${escapeHtml(it.name)}</strong> ${it.rarity ? `<span class="tag rarity-${(it.rarity || '').toLowerCase()}">${escapeHtml(it.rarity)}</span>` : ''}${it.type ? `<span class="tag">${escapeHtml(it.type)}</span>` : ''}
        ${it.effect ? `<div class="desc">${escapeHtml(it.effect)}</div>` : ''}${it.description ? `<div class="desc"><em>${escapeHtml(it.description)}</em></div>` : ''}</div>
      ${gm ? `<div class="inline">
        ${others.length ? `<select id="transfer-${it.id}" style="width:auto">${others.map(o => `<option value="${o.id}">${escapeHtml(o.name)}</option>`).join('')}</select><button class="btn small" onclick="transferItem('${c.id}','${it.id}',document.getElementById('transfer-${it.id}').value)">Give →</button>` : ''}
        <button class="icon-btn" onclick="removeInventoryItem('${c.id}','${it.id}')" aria-label="Remove ${escapeAttr(it.name)}">✕</button></div>` : ''}
    </div>`).join('') : '<div class="empty-state">Nothing carried.</div>'}
  ${gm ? `<div class="grid cols-3" style="margin-top:10px">
      <input type="text" id="new-item-name-${c.id}" placeholder="Item name">
      <input type="text" id="new-item-effect-${c.id}" placeholder="Effect (optional)">
      <button class="btn" onclick="addInventoryItem('${c.id}')">+ Add item</button></div>
    <div class="note">The Items tab holds the full loot tables — use it to hand out library items.</div>` : ''}`;
}
async function addInventoryItem(charId) {
  const name = document.getElementById('new-item-name-' + charId).value.trim();
  if (!name) return;
  const id = uid();
  await dbWrite(`characters/${charId}/inventory/${id}`, { id, name, effect: document.getElementById('new-item-effect-' + charId).value.trim(), description: '' });
  showToast('Item added.');
}
async function removeInventoryItem(charId, itemId) { await dbWrite(`characters/${charId}/inventory/${itemId}`, null); }
async function transferItem(fromId, itemId, toId) {
  if (!toId || fromId === toId) return;
  const from = state.characters[fromId], to = state.characters[toId];
  const item = from && (from.inventory || {})[itemId];
  if (!to || !item) return;
  await dbUpdate({ [`characters/${fromId}/inventory/${itemId}`]: null, [`characters/${toId}/inventory/${itemId}`]: item });
  showToast(`${item.name} → ${to.name}`);
}

// ── Sheet assembly ──
function sheetHtml(c) {
  const gm = session.role === 'gm';
  const arch = state.archetypes[c.archetypeId];
  const archList = Object.values(state.archetypes).sort((a, b) => a.name.localeCompare(b.name));
  const f = (label, html, cls) => `<div class="field ${cls || ''}"><label>${label}</label>${html}</div>`;
  const inpText = (field, ph) => `<input type="text" value="${escapeAttr(c[field])}" placeholder="${ph || ''}" ${gm ? '' : 'disabled'} onchange="setField('${c.id}','${field}',this.value)">`;
  const inpNum = (field, min) => `<input type="number" min="${min ?? 0}" value="${c[field]}" ${gm ? '' : 'disabled'} onchange="setField('${c.id}','${field}',this.value,true)">`;

  return `
  <div class="sheet">
    ${gm ? `<div class="btn-row" style="margin-bottom:10px"><button class="btn small" onclick="closeChar()">← All characters</button><button class="btn small danger" onclick="deleteCharacter('${c.id}')">Delete</button></div>` : ''}

    <div class="panel">
      <div class="panel-title"><span>${escapeHtml(c.name || '(unnamed)')}${c.isNPC ? '<span class="tag">NPC</span>' : '<span class="tag">PC</span>'}</span></div>
      <div class="grid cols-4">
        ${f('Name', inpText('name'))}
        ${f(c.isNPC ? 'Role' : 'Player', inpText('player', c.isNPC ? '' : 'Real name'))}
        ${f('Year', inpNum('year'))}
        ${f('Level', inpNum('level', 1))}
      </div>
      <div class="grid cols-2">
        ${f('Archetype', gm ? `<select onchange="setField('${c.id}','archetypeId',this.value)"><option value="">— none —</option>${archList.map(a => `<option value="${a.id}" ${a.id === c.archetypeId ? 'selected' : ''}>${escapeHtml(a.name)}</option>`).join('')}</select>` : `<div>${arch ? escapeHtml(arch.name) : '—'}</div>`)}
        ${gm && !c.isNPC ? f('Player PIN (login)', `<input type="text" maxlength="8" value="${escapeAttr(c.pin)}" onchange="setField('${c.id}','pin',this.value)">`) : ''}
      </div>
      ${arch ? `<div class="origin"><strong>${escapeHtml(arch.talent)}</strong> <span class="tag">Advantage</span><div class="desc">${escapeHtml(arch.advantage)}</div><div class="desc"><span class="tag danger">Condition</span> <strong>${escapeHtml(arch.condition)}</strong>${arch.conditionText ? ' — ' + escapeHtml(arch.conditionText) : ''}</div></div>` : ''}
    </div>

    <div class="grid cols-2">
      <div class="panel">
        <div class="panel-title">Vitals</div>
        ${lifeBlockHtml(c)}
        <div class="counters">
          ${counterHtml(c, 'focus', 'Focus', { hint: '1 Focus = 1 reroll; also powers abilities' })}
          ${counterHtml(c, 'energy', 'Energy', { hint: 'Fuels school actions' })}
          ${counterHtml(c, 'stress', 'Stress', { hint: 'Pressure / trauma — causes roleplay penalties and debuffs' })}
          ${counterHtml(c, 'ascension', 'Ascension', { hint: 'Impressing the school / rising status' })}
          ${counterHtml(c, 'ruin', 'Ruin', { hint: 'Harming the school’s image or acting against its interests' })}
          ${counterHtml(c, 'detention', 'Detention hrs', { hint: 'Hours of detention still owed' })}
        </div>
        <div class="derived">Initiative <strong>${initiativeScore(c)}</strong> (Body + Reflex) · Death buffer <strong>${deathBuffer(c)}</strong> (= Body)</div>
        ${gm ? `<label class="chk" style="margin-top:8px"><input type="checkbox" ${c.lifeOverride ? 'checked' : ''} onchange="setField('${c.id}','lifeOverride',this.checked);setField('${c.id}','maxLife',${lifeMax(c)},true)"> Override max LIFE manually</label>
          ${c.lifeOverride ? `<div class="field"><label>Max LIFE</label><input type="number" value="${c.maxLife}" onchange="setField('${c.id}','maxLife',this.value,true)"></div>` : ''}` : ''}
      </div>
      <div class="panel">
        <div class="panel-title">Moves <span class="sub">click to roll d20 ≤ TN</span></div>
        ${movesHtml(c)}
      </div>
    </div>

    <div class="panel">
      <div class="panel-title">Pillars &amp; Skills</div>
      ${pillarsHtml(c)}
    </div>

    <div class="grid cols-2">
      <div class="panel"><div class="panel-title">Techniques</div>${techniquesHtml(c)}</div>
      <div class="panel"><div class="panel-title">Talents</div>${talentsHtml(c)}</div>
    </div>

    <div class="grid cols-2">
      <div class="panel"><div class="panel-title">Discipline &amp; Clubs</div>${originsHtml(c)}</div>
      <div class="panel"><div class="panel-title">Inventory</div>${inventoryHtml(c)}</div>
    </div>

    <div class="grid cols-2">
      <div class="panel"><div class="panel-title">Notes</div>
        <textarea ${gm ? '' : 'disabled'} onchange="setField('${c.id}','notes',this.value)" placeholder="Background, traits, goals…">${escapeHtml(c.notes)}</textarea></div>
      ${gm ? `<div class="panel"><div class="panel-title">GM notes <span class="tag danger">GM only</span></div>
        <textarea onchange="setField('${c.id}','gmNotes',this.value)" placeholder="Secrets, plans, to-dos…">${escapeHtml(c.gmNotes)}</textarea></div>` : ''}
    </div>
  </div>`;
}
