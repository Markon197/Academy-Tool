// ═══════════════════════════════════════════════════════════════
// COMBAT MODULE — follows the core rules:
//  - Initiative: BODY + Reflex. Players act first (highest first), then
//    enemies — unless the party was ambushed, which flips it.
//  - Each turn: 1 offensive action + 1 neutral action. Being attacked
//    grants 1 defensive reaction (refreshes every round).
//  - LIFE hits 0 -> downed; pushed past BODY below 0 -> dead.
//  - Technique cooldowns tick down at the start of their owner's turn;
//    "once per battle" techniques refresh when combat ends.
// GM runs everything; players see the order, their own sheet and a
// health band for enemies (no raw NPC numbers).
// ═══════════════════════════════════════════════════════════════

function combatOrder() { return (state.combat.order || []).filter(id => state.characters[id]); }
function currentCombatantId() { return combatOrder()[state.combat.turn] || null; }

function renderCombat() {
  const root = document.getElementById('combat-root');
  if (!root) return;
  const isGM = session.role === 'gm';
  const cb = state.combat;
  const order = combatOrder();
  const notIn = Object.values(state.characters).filter(c => !order.includes(c.id)).sort((a, b) => (a.isNPC - b.isNPC) || a.name.localeCompare(b.name));
  const curId = currentCombatantId();

  root.innerHTML = `
  <div class="panel">
    <div class="panel-title">
      <span>${cb.active ? `Round ${cb.round}` : 'Combat'} ${cb.active && curId ? `· <span class="sub">${escapeHtml(state.characters[curId].name)}'s turn</span>` : ''}</span>
      ${isGM ? `<div class="btn-row">
        ${cb.active
          ? `<button class="btn small primary" onclick="nextTurn()">Next turn →</button><button class="btn small danger" onclick="endCombat()">End combat</button>`
          : `<button class="btn small primary" onclick="startCombat()" ${order.length ? '' : 'disabled'}>Start combat</button>`}
      </div>` : ''}
    </div>
    ${isGM ? `
    <div class="toolbar">
      <div class="field grow"><label>Add to the fight</label>
        <div class="inline"><select id="add-to-combat-select">${notIn.map(c => `<option value="${c.id}">${escapeHtml(c.name)} ${c.isNPC ? '(NPC)' : '(PC)'}</option>`).join('') || '<option value="">— everyone is in —</option>'}</select>
        <button class="btn" onclick="addToCombat(document.getElementById('add-to-combat-select').value)">+ Add</button>
        <button class="btn" onclick="addAllPCs()">+ All PCs</button></div></div>
      <div class="field"><label>&nbsp;</label><label class="chk"><input type="checkbox" ${cb.ambush ? 'checked' : ''} onchange="setAmbush(this.checked)"> Party ambushed (enemies first)</label></div>
      <div class="btn-row"><button class="btn" onclick="rollInitiative()" ${order.length ? '' : 'disabled'}>Sort by initiative</button></div>
    </div>
    <div class="note">Initiative = BODY + Reflex. Players first in descending order, then enemies${cb.ambush ? ' — <strong>ambush: enemies go first</strong>' : ''}. You can still reorder by hand with ↑ ↓.</div>` : ''}
    ${order.length ? '' : '<div class="empty-state">No one in the fight yet.</div>'}
  </div>
  ${order.map((id, i) => combatCardHtml(state.characters[id], i, isGM, id === curId && cb.active, order.length)).join('')}`;
}

function actionPips(c) {
  const a = (state.combat.actions || {})[c.id] || {};
  const can = canActAs(c.id) && state.combat.active;
  const pip = (key, label, hint) => `<button class="pip ${a[key] ? 'spent' : ''}" ${can ? '' : 'disabled'} title="${hint}" onclick="togglePip('${c.id}','${key}')">${label}</button>`;
  return `<div class="pips">${pip('off', 'Offense', 'One offensive action per turn')}${pip('neu', 'Neutral', 'Move, interact, etc.')}${pip('rea', 'Reaction', 'One defensive reaction when attacked (refreshes each round)')}</div>`;
}
async function togglePip(id, key) {
  const a = (state.combat.actions || {})[id] || {};
  await dbWrite(`combat/actions/${id}/${key}`, !a[key]);
}

function combatCardHtml(c, i, isGM, isCurrent, total) {
  const seeNumbers = isGM || !c.isNPC;
  const st = lifeStatus(c);
  const techs = (isGM || canActAs(c.id)) ? charTechniques(c) : [];
  return `
  <div class="card combat-card ${isCurrent ? 'current-turn' : ''} ${st === 'dead' ? 'dead' : ''}">
    ${isGM ? `<div class="order-controls">
      <button class="icon-btn" onclick="moveInCombat('${c.id}',-1)" ${i === 0 ? 'disabled' : ''} aria-label="Move up">↑</button>
      <button class="icon-btn" onclick="moveInCombat('${c.id}',1)" ${i === total - 1 ? 'disabled' : ''} aria-label="Move down">↓</button>
      <button class="icon-btn" onclick="removeFromCombat('${c.id}')" aria-label="Remove from combat">✕</button></div>` : ''}
    <h3>${isCurrent ? '▶ ' : ''}${escapeHtml(c.name)} ${c.isNPC ? '<span class="tag on-card">NPC</span>' : '<span class="tag on-card">PC</span>'}
      <span class="sub">Lvl ${c.level} · Init ${initiativeScore(c)}</span>
      ${statusTagHtml(c, false).replace('class="tag ', 'class="tag on-card ')}
      ${st === 'downed' ? '<span class="tag on-card danger">DOWNED</span>' : st === 'dead' ? '<span class="tag on-card danger">DEAD</span>' : ''}</h3>
    ${isGM && c.gmNotes ? `<div class="combat-gmnote"><strong>GM:</strong> ${escapeHtml(notePreview(c.gmNotes, 220))}</div>` : ''}
    ${state.combat.active ? actionPips(c) : ''}
    <div class="grid cols-2" style="margin-top:10px">
      <div>
        ${seeNumbers ? `
          <div class="stat-bar-wrap">
            <div class="stat-bar-label"><span>LIFE</span><span>${c.life} / ${lifeMax(c)}</span></div>
            <div class="stat-bar"><div class="stat-bar-fill hp" style="width:${pct(c.life, lifeMax(c))}%"></div></div>
          </div>
          ${st === 'downed' ? `<div class="alert danger">Death buffer: ${Math.max(0, -c.life)} / ${deathBuffer(c)}</div>` : ''}
          ${canEdit(c, 'life') ? `<div class="calc-row"><input type="number" id="lifecalc-${c.id}" value="1" min="1" aria-label="Amount"><button class="btn small danger" onclick="lifeCalc('${c.id}',-1)">− Damage</button><button class="btn small" onclick="lifeCalc('${c.id}',1)">+ Heal</button></div>` : ''}
          <div class="mini-counters">Focus <strong>${c.focus}</strong> · Energy <strong>${c.energy}</strong> · Stress <strong>${c.stress}</strong></div>`
        : `<div class="health-band band-${healthBand(c).toLowerCase()}">${healthBand(c)}</div>`}
        ${seeNumbers && (isGM || canActAs(c.id)) ? `<div class="mini-counters" style="margin-top:6px">
          ${['focus', 'energy', 'stress'].map(f => `${canEdit(c, f) ? `<button class="icon-btn" onclick="bump('${c.id}','${f}',-1,0)" aria-label="${f} down">−</button>` : ''}<span class="sub">${f}</span>${canEdit(c, f) ? `<button class="icon-btn" onclick="bump('${c.id}','${f}',1,0)" aria-label="${f} up">+</button>` : ''}`).join(' ')}</div>` : ''}
        <div class="conds">${(c.conditions || []).map((t, k) => `<span class="tag on-card cond">${escapeHtml(t)}${isGM ? ` <a href="#" onclick="removeCondition('${c.id}',${k});return false" aria-label="Remove condition">✕</a>` : ''}</span>`).join('')}
          ${isGM ? `<input type="text" class="cond-in" placeholder="+ condition (prone, held, -2…) ↵" onkeydown="if(event.key==='Enter'){addCondition('${c.id}',this.value);this.value=''}">` : ''}</div>
      </div>
      <div>
        ${techs.length ? `<div class="sub bold">Techniques</div>${techs.map(t => {
          const cdn = cooldownLabel(c, t.key), cd = parseCooldown(t.cooldownCost);
          return `<div class="tech-line ${cdn ? 'on-cd' : ''}"><div><strong>${escapeHtml(t.name)}</strong> <span class="sub">${[rollTagText(c, t), t.cooldownCost].filter(Boolean).map(escapeHtml).join(' · ')}</span>${cdn ? ` <span class="cd-note">⏳ ${cdn}</span>` : ''}
            <div class="desc">${escapeHtml(t.effect)}</div></div>
            ${canActAs(c.id) && !cd.passive ? `<button class="btn small" onclick="useTechnique('${c.id}','${t.key}')" ${cdn ? 'disabled' : ''}>Use</button>` : ''}</div>`;
        }).join('')}` : ''}
        ${seeNumbers && Object.keys(c.inventory || {}).length ? `<div class="sub bold" style="margin-top:6px">Weapons &amp; gear</div>${Object.values(c.inventory).map(it => `<div class="gear-line"><strong>${escapeHtml(it.name)}</strong>${it.effect ? ' — ' + escapeHtml(it.effect) : ''}</div>`).join('')}` : ''}
      </div>
    </div>
  </div>`;
}

async function addCondition(id, text) {
  text = (text || '').trim();
  if (!text) return;
  const c = state.characters[id];
  await dbWrite(`characters/${id}/conditions`, (c.conditions || []).concat([text]));
}
async function removeCondition(id, idx) {
  const c = state.characters[id];
  await dbWrite(`characters/${id}/conditions`, (c.conditions || []).filter((_, i) => i !== idx));
}

// ── Order management ──
async function addToCombat(id) {
  if (!id) return;
  const order = combatOrder();
  if (order.includes(id)) return;
  await dbWrite('combat/order', order.concat([id]));
}
async function addAllPCs() {
  const order = combatOrder();
  const add = Object.values(state.characters).filter(c => !c.isNPC && !order.includes(c.id)).map(c => c.id);
  if (add.length) await dbWrite('combat/order', order.concat(add));
}
async function removeFromCombat(id) {
  const order = combatOrder();
  const idx = order.indexOf(id);
  if (idx === -1) return;
  const next = order.filter(x => x !== id);
  let turn = state.combat.turn || 0;
  if (idx < turn) turn -= 1;
  turn = Math.max(0, Math.min(turn, next.length - 1));
  await dbUpdate({ 'combat/order': next, 'combat/turn': turn, [`combat/actions/${id}`]: null });
}
async function moveInCombat(id, dir) {
  const order = combatOrder();
  const i = order.indexOf(id), j = i + dir;
  if (i === -1 || j < 0 || j >= order.length) return;
  const cur = currentCombatantId();
  [order[i], order[j]] = [order[j], order[i]];
  await dbUpdate({ 'combat/order': order, 'combat/turn': Math.max(0, order.indexOf(cur)) });
}
async function setAmbush(v) { await dbWrite('combat/ambush', !!v); }

// BODY + Reflex, players first (unless ambushed). Ties: higher Reflex, then name.
async function rollInitiative() {
  const order = combatOrder().map(id => state.characters[id]);
  const cmp = (a, b) => initiativeScore(b) - initiativeScore(a) || statValue(b, 'reflex') - statValue(a, 'reflex') || a.name.localeCompare(b.name);
  const pcs = order.filter(c => !c.isNPC).sort(cmp), npcs = order.filter(c => c.isNPC).sort(cmp);
  const sorted = (state.combat.ambush ? npcs.concat(pcs) : pcs.concat(npcs)).map(c => c.id);
  await dbUpdate({ 'combat/order': sorted, 'combat/turn': 0 });
  showToast(state.combat.ambush ? 'Initiative sorted — ambush, enemies first.' : 'Initiative sorted — players first.');
}

// ── Turn flow ──
async function startCombat() {
  const order = combatOrder();
  if (!order.length) return;
  const first = order[0];
  await dbUpdate({ 'combat/active': true, 'combat/round': 1, 'combat/turn': 0, 'combat/actions': { [first]: { off: false, neu: false, rea: false } } });
  await beginTurn(first);
  showToast('Combat started.');
}

// Cooldowns count down at the start of the owner's own turn.
async function beginTurn(id) {
  const c = state.characters[id];
  if (!c) return;
  const updates = {};
  Object.entries(c.cooldowns || {}).forEach(([k, v]) => { if (typeof v === 'number') updates[`characters/${id}/cooldowns/${k}`] = v > 1 ? v - 1 : null; });
  updates[`combat/actions/${id}/off`] = false;
  updates[`combat/actions/${id}/neu`] = false;
  await dbUpdate(updates);
}

async function nextTurn() {
  const order = combatOrder();
  if (!order.length) return;
  let turn = state.combat.turn || 0, round = state.combat.round, wrapped = false;
  for (let n = 0; n < order.length; n++) {
    turn += 1;
    if (turn >= order.length) { turn = 0; round += 1; wrapped = true; }
    if (lifeStatus(state.characters[order[turn]]) !== 'dead') break;   // skip the dead
  }
  const updates = { 'combat/turn': turn, 'combat/round': round };
  if (wrapped) order.forEach(id => { updates[`combat/actions/${id}/rea`] = false; });   // reactions refresh each round
  await dbUpdate(updates);
  await beginTurn(order[turn]);
}

async function endCombat() {
  const updates = { 'combat/active': false, 'combat/turn': 0, 'combat/round': 1, 'combat/actions': null };
  combatOrder().forEach(id => {
    const c = state.characters[id];
    Object.entries(c.cooldowns || {}).forEach(([k, v]) => { if (v === 'battle' || typeof v === 'number') updates[`characters/${id}/cooldowns/${k}`] = null; });
  });
  await dbUpdate(updates);
  showToast('Combat ended — per-battle techniques refreshed.');
}
