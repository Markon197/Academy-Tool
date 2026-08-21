// ═══════════════════════════════════════════════════════════════
// COMBAT MODULE
// Simplified combat tracking: no dice/probability logic. The GM moves the
// initiative order manually (based on rolls at the table), tracks HP/Mana
// with a heal/damage calculator, and sees every character's weapons,
// abilities, and artifacts at a glance.
// ═══════════════════════════════════════════════════════════════

function renderCombat() {
  const root = document.getElementById('combat-root');
  if (!root) return;
  const isGM = session.role === 'gm';
  const order = state.combat.order || [];
  const inCombat = order.map(id => state.characters[id]).filter(Boolean);
  const notInCombat = Object.values(state.characters).filter(c => !order.includes(c.id)).sort((a, b) => a.name.localeCompare(b.name));

  let html = `
  <div class="panel">
    <div class="panel-title">
      <span>Initiative — Round ${state.combat.round}</span>
      ${isGM ? `
      <div style="display:flex;gap:8px">
        ${state.combat.active
          ? `<button class="btn small" onclick="nextTurn()">Next turn →</button><button class="btn small danger" onclick="endCombat()">End combat</button>`
          : `<button class="btn small primary" onclick="startCombat()">Start combat</button>`}
      </div>` : ''}
    </div>
    ${isGM && notInCombat.length ? `
    <div class="grid cols-3" style="margin-bottom:12px">
      <select id="add-to-combat-select" style="grid-column:span 2">
        ${notInCombat.map(c => `<option value="${c.id}">${escapeHtml(c.name)} ${c.isNPC ? '(NPC)' : '(PC)'}</option>`).join('')}
      </select>
      <button class="btn" onclick="addToCombat(document.getElementById('add-to-combat-select').value)">+ Add to initiative order</button>
    </div>` : ''}
    ${inCombat.length ? '' : '<div class="empty-state">No one in combat yet.</div>'}
  </div>
  ${inCombat.map((c, i) => combatCardHtml(c, i, isGM)).join('')}
  `;
  root.innerHTML = html;
}

function combatCardHtml(c, i, isGM) {
  const isCurrent = state.combat.active && i === state.combat.currentTurn;
  const order = state.combat.order || [];
  return `
  <div class="card combat-card ${isCurrent ? 'current-turn' : ''}">
    ${isGM ? `
    <div class="order-controls">
      <button class="icon-btn" onclick="moveInCombat('${c.id}',-1)" ${i === 0 ? 'disabled' : ''}>↑</button>
      <button class="icon-btn" onclick="moveInCombat('${c.id}',1)" ${i === order.length - 1 ? 'disabled' : ''}>↓</button>
      <button class="icon-btn" onclick="removeFromCombat('${c.id}')">✕</button>
    </div>` : ''}
    <h3>${isCurrent ? '▶ ' : ''}${escapeHtml(c.name)} ${c.isNPC ? '<span class="tag on-card">NPC</span>' : '<span class="tag on-card">PC</span>'} <span class="sub">Lvl ${c.level}</span></h3>
    <div class="grid cols-2" style="margin-top:10px">
      <div>
        <div class="stat-bar-wrap">
          <div class="stat-bar-label"><span>HP</span><span>${c.hp}/${c.maxHp}</span></div>
          <div class="stat-bar"><div class="stat-bar-fill hp" style="width:${pct(c.hp, c.maxHp)}%"></div></div>
        </div>
        ${isGM ? `
        <div class="calc-row">
          <input type="number" id="hpcalc-${c.id}" value="1" min="1">
          <button class="btn small danger" onclick="applyDelta('${c.id}','hp',-Number(document.getElementById('hpcalc-${c.id}').value))">− Damage</button>
          <button class="btn small" onclick="applyDelta('${c.id}','hp',Number(document.getElementById('hpcalc-${c.id}').value))">+ Heal</button>
        </div>` : ''}
        <div class="stat-bar-wrap" style="margin-top:8px">
          <div class="stat-bar-label"><span>Mana</span><span>${c.mana}/${c.maxMana}</span></div>
          <div class="stat-bar"><div class="stat-bar-fill mana" style="width:${pct(c.mana, c.maxMana)}%"></div></div>
        </div>
        ${isGM ? `
        <div class="calc-row">
          <input type="number" id="manacalc-${c.id}" value="1" min="1">
          <button class="btn small danger" onclick="applyDelta('${c.id}','mana',-Number(document.getElementById('manacalc-${c.id}').value))">− Spend</button>
          <button class="btn small" onclick="applyDelta('${c.id}','mana',Number(document.getElementById('manacalc-${c.id}').value))">+ Regen</button>
        </div>` : ''}
      </div>
      <div>
        ${(c.stats || []).length ? `<div style="margin-bottom:6px">${c.stats.map(s => `<span class="tag on-card">${escapeHtml(s.key)}: ${escapeHtml(s.value)}</span>`).join('')}</div>` : ''}
        <div class="sub" style="font-weight:bold;margin-bottom:2px">Abilities</div>
        <div style="font-size:12px;white-space:pre-wrap;margin-bottom:8px">${escapeHtml(c.abilitiesNotes) || '—'}</div>
        ${combatSkillsHtml(c)}
        <div class="sub" style="font-weight:bold;margin-bottom:2px">Weapons & Gear</div>
        ${(c.inventory || []).length ? c.inventory.map(it => `<div style="font-size:12px;margin-bottom:3px"><strong>${escapeHtml(it.name)}</strong>${it.description ? ' — ' + escapeHtml(it.description) : ''}</div>`).join('') : '<div class="sub">—</div>'}
      </div>
    </div>
  </div>`;
}

function combatSkillsHtml(c) {
  const taken = (c.skillIds || []).map(id => state.skills[id]).filter(Boolean);
  if (!taken.length) return '';
  return `
  <div class="sub" style="font-weight:bold;margin-bottom:2px">Skills / Techniques</div>
  ${taken.map(s => `<div style="font-size:12px;margin-bottom:3px"><strong>${escapeHtml(s.name)}</strong>${s.cooldownCost ? ` <span class="sub">(${escapeHtml(s.cooldownCost)})</span>` : ''}${s.roll ? ` — <em>${escapeHtml(s.roll)}</em>` : ''}${s.effect ? ` — ${escapeHtml(s.effect)}` : ''}</div>`).join('')}
  `;
}

async function applyDelta(charId, field, delta) {
  const c = state.characters[charId];
  if (!c || !delta) return;
  const max = field === 'hp' ? c.maxHp : c.maxMana;
  const next = Math.max(0, Math.min(max, (c[field] || 0) + delta));
  await dbWrite('characters/' + charId + '/' + field, next);
}

async function addToCombat(charId) {
  if (!charId) return;
  const order = (state.combat.order || []).slice();
  if (order.includes(charId)) return;
  order.push(charId);
  await dbWrite('combat/order', order);
}

async function removeFromCombat(charId) {
  const order = (state.combat.order || []).filter(id => id !== charId);
  const idx = (state.combat.order || []).indexOf(charId);
  let currentTurn = state.combat.currentTurn;
  if (idx !== -1 && idx <= currentTurn && currentTurn > 0) currentTurn -= 1;
  await dbUpdate({ 'combat/order': order, 'combat/currentTurn': Math.min(currentTurn, Math.max(0, order.length - 1)) });
}

async function moveInCombat(charId, dir) {
  const order = (state.combat.order || []).slice();
  const i = order.indexOf(charId);
  const j = i + dir;
  if (i === -1 || j < 0 || j >= order.length) return;
  [order[i], order[j]] = [order[j], order[i]];
  await dbWrite('combat/order', order);
}

async function startCombat() {
  await dbUpdate({ 'combat/active': true, 'combat/round': 1, 'combat/currentTurn': 0 });
  showToast('Combat started.');
}

async function endCombat() {
  await dbUpdate({ 'combat/active': false });
  showToast('Combat ended.');
}

async function nextTurn() {
  const order = state.combat.order || [];
  if (!order.length) return;
  let next = state.combat.currentTurn + 1;
  let round = state.combat.round;
  if (next >= order.length) { next = 0; round += 1; }
  await dbUpdate({ 'combat/currentTurn': next, 'combat/round': round });
}
