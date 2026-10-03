// ═══════════════════════════════════════════════════════════════
// ROLLER — d20 roll-under engine, shared table log, Focus rerolls.
// Every roll anywhere in the app (sheet moves, techniques, the roller
// drawer) goes through performRoll(), is written to state.rolls so the GM
// sees player rolls live, and pops up as a result card.
// ═══════════════════════════════════════════════════════════════

const ROLL_LOG_LIMIT = 40;
let lastRoll = null;       // most recent roll shown in the result card
let rollerOpen = false;
let rollerDraft = { charId: null, move: '', a: 'body', b: 'force', mod: 0 };

function canActAs(charId) { return session.role === 'gm' || (session.role === 'player' && session.charId === charId); }

// Off by default: the table rolls real dice. The sheet then just shows each
// move's target number. The GM can switch the in-app roller on from the header.
function digitalRolls() { return !!state.settings?.digitalRolls; }
async function setDigitalRolls(on) {
  await dbWrite('settings/digitalRolls', !!on);
  if (!on && rollerOpen) toggleRoller();
}

function highWindow() { return Number(state.settings?.highWindow ?? 3); }

async function logRoll(entry) {
  const id = uid();
  // the new id must win over any id carried by a rerolled entry, and Firebase
  // rejects `undefined`, so round-trip through JSON to strip it
  const rec = JSON.parse(JSON.stringify({ ...entry, id, ts: Date.now() }));
  const updates = { ['rolls/' + id]: rec };
  // prune the oldest entries beyond the limit
  const all = Object.values(state.rolls || {}).sort((x, y) => y.ts - x.ts);
  all.slice(ROLL_LOG_LIMIT - 1).forEach(r => { updates['rolls/' + r.id] = null; });
  await dbUpdate(updates);
  return rec;
}

// Roll Stat A + Stat B (+ mod) for a character and publish it.
async function performRoll(charId, a, b, mod, label, extra) {
  const c = state.characters[charId];
  if (!c) return null;
  const r = makeRoll(c, a, b, mod, highWindow(), label);
  Object.assign(r, extra || {});
  lastRoll = r;
  showRollResult(r);
  const rec = await logRoll(r);
  lastRoll = { ...r, id: rec.id };
  showRollResult(lastRoll);
  return lastRoll;
}

// Spend 1 Focus to reroll the last roll (keeps the same target number).
async function rerollLast() {
  const r = lastRoll;
  if (!r) return;
  const c = state.characters[r.charId];
  if (!c || !canActAs(c.id)) return;
  if ((c.focus || 0) < 1) { showToast(`${c.name} has no Focus left.`); return; }
  const roll = d20();
  const nr = { ...r, roll, ...gradeRoll(roll, r.tn, highWindow()), rerolled: true, id: undefined };
  await dbWrite('characters/' + c.id + '/focus', c.focus - 1);
  lastRoll = nr;
  showRollResult(nr);
  const rec = await logRoll(nr);
  lastRoll = { ...nr, id: rec.id, rerolled: true };
  showRollResult(lastRoll);
}

async function rollMove(charId, moveIdx) {
  const m = MOVES[moveIdx];
  if (!m) return;
  await performRoll(charId, m[1], m[2], 0, m[0]);
}

async function rollStats(charId, a, b, label) { await performRoll(charId, a, b, 0, label || `${STAT_LABEL(a)} + ${STAT_LABEL(b)}`); }

// ── Result card ──
function tierClass(t) { return 'tier-' + t; }

function rollSummary(r) {
  const mod = r.mod ? ` ${r.mod > 0 ? '+' : '−'} ${Math.abs(r.mod)} mod` : '';
  const stats = r.statB ? `${STAT_LABEL(r.statA)} + ${STAT_LABEL(r.statB)}` : STAT_LABEL(r.statA);
  return `${stats}${mod} = TN ${r.tn}`;
}

function showRollResult(r) {
  const el = document.getElementById('roll-result');
  if (!el) return;
  const c = state.characters[r.charId];
  const canReroll = c && canActAs(c.id) && (c.focus || 0) > 0 && !r.rerolled;
  el.className = 'roll-result show ' + tierClass(r.tier);
  el.innerHTML = `
    <button class="icon-btn close" onclick="hideRollResult()" aria-label="Dismiss">✕</button>
    <div class="rr-who">${escapeHtml(r.who)}${r.label ? ' — ' + escapeHtml(r.label) : ''}${r.rerolled ? ' <span class="tag">rerolled</span>' : ''}</div>
    <div class="rr-roll">${r.roll}</div>
    <div class="rr-tier">${escapeHtml(r.grade)}</div>
    <div class="rr-calc">d20 vs ${escapeHtml(rollSummary(r))}${r.tn > 19 ? ' (best normal roll is 19)' : ''}</div>
    ${canReroll ? `<button class="btn small" onclick="rerollLast()">Spend 1 Focus to reroll (${c.focus} left)</button>` : ''}`;
  clearTimeout(showRollResult._t);
  showRollResult._t = setTimeout(hideRollResult, 12000);
  if (rollerOpen) renderRoller();
}
function hideRollResult() { const el = document.getElementById('roll-result'); if (el) el.classList.remove('show'); }

// ── Roller drawer ──
function toggleRoller() {
  rollerOpen = !rollerOpen;
  document.getElementById('roller').classList.toggle('open', rollerOpen);
  if (rollerOpen) renderRoller();
}

function rollerChars() {
  if (session.role === 'player') return [state.characters[session.charId]].filter(Boolean);
  return Object.values(state.characters).sort((a, b) => (a.isNPC - b.isNPC) || a.name.localeCompare(b.name));
}

function renderRoller() {
  const root = document.getElementById('roller-body');
  if (!root) return;
  const chars = rollerChars();
  if (!rollerDraft.charId || !chars.find(c => c.id === rollerDraft.charId)) rollerDraft.charId = chars[0]?.id || null;
  const c = state.characters[rollerDraft.charId];
  const statOpts = sel => STAT_KEYS.map(k => `<option value="${k}" ${sel === k ? 'selected' : ''}>${STAT_LABEL(k)}${c ? ' (' + statValue(c, k) + ')' : ''}</option>`).join('');
  const groups = [...new Set(MOVES.map(m => m[3]))];
  const tn = c ? statValue(c, rollerDraft.a) + statValue(c, rollerDraft.b) + Number(rollerDraft.mod || 0) : 0;
  const log = Object.values(state.rolls || {}).sort((x, y) => y.ts - x.ts).slice(0, 25);

  root.innerHTML = `
    <div class="field"><label>Character</label>
      <select onchange="rollerDraft.charId=this.value;renderRoller()">${chars.map(x => `<option value="${x.id}" ${x.id === rollerDraft.charId ? 'selected' : ''}>${escapeHtml(x.name)}${x.isNPC ? ' (NPC)' : ''}</option>`).join('')}</select></div>
    <div class="field"><label>Move (Rule Sheet defaults)</label>
      <select onchange="pickMove(this.value)">
        <option value="">— custom pairing —</option>
        ${groups.map(g => `<optgroup label="${g}">${MOVES.map((m, i) => m[3] === g ? `<option value="${i}" ${rollerDraft.move === String(i) ? 'selected' : ''}>${m[0]} (${STAT_LABEL(m[1])} + ${STAT_LABEL(m[2])})</option>` : '').join('')}</optgroup>`).join('')}
      </select></div>
    <div class="grid cols-3" style="gap:8px">
      <div class="field"><label>Stat A</label><select onchange="rollerDraft.a=this.value;rollerDraft.move='';renderRoller()">${statOpts(rollerDraft.a)}</select></div>
      <div class="field"><label>Stat B</label><select onchange="rollerDraft.b=this.value;rollerDraft.move='';renderRoller()">${statOpts(rollerDraft.b)}</select></div>
      <div class="field"><label>TN modifier</label><input type="number" value="${rollerDraft.mod}" onchange="rollerDraft.mod=Number(this.value)||0;renderRoller()"></div>
    </div>
    <div class="roller-tn">Target number <strong>${tn}</strong> — roll d20, ${tn >= 20 ? 'only a 20 fails' : 'roll ' + tn + ' or lower'}</div>
    <button class="btn primary" style="width:100%" onclick="rollFromDrawer()" ${c ? '' : 'disabled'}>🎲 Roll d20</button>
    <div class="panel-title" style="margin-top:18px;font-size:14px">Table log</div>
    ${log.length ? log.map(logRowHtml).join('') : '<div class="empty-state" style="padding:10px">No rolls yet.</div>'}`;
}

function pickMove(v) {
  rollerDraft.move = v;
  if (v !== '') { const m = MOVES[Number(v)]; rollerDraft.a = m[1]; rollerDraft.b = m[2]; }
  renderRoller();
}

async function rollFromDrawer() {
  const c = state.characters[rollerDraft.charId];
  if (!c) return;
  const mv = rollerDraft.move !== '' ? MOVES[Number(rollerDraft.move)][0] : '';
  await performRoll(c.id, rollerDraft.a, rollerDraft.b, rollerDraft.mod, mv);
}

function logRowHtml(r) {
  const g = gradeRoll(r.roll, r.tn, highWindow());
  const stats = r.statB ? `${STAT_LABEL(r.statA)}+${STAT_LABEL(r.statB)}` : STAT_LABEL(r.statA || '');
  const detail = r.kind === 'note' ? escapeHtml(r.text || '') : `${stats} TN ${r.tn}`;
  if (r.kind === 'note') return `<div class="log-row note"><span>${escapeHtml(r.who)}</span> <em>${detail}</em></div>`;
  return `<div class="log-row ${tierClass(g.tier)}"><span class="lr-roll">${r.roll}</span>
    <div><strong>${escapeHtml(r.who)}</strong>${r.label ? ' · ' + escapeHtml(r.label) : ''}${r.rerolled ? ' ↻' : ''}<div class="lr-sub">${detail} · ${g.grade}</div></div></div>`;
}

// A non-roll entry for the table log ("Fad uses Cleaving Arc").
function logNote(c, text) { return logRoll({ kind: 'note', charId: c.id, who: c.name, text }); }
