// ═══════════════════════════════════════════════════════════════
// AI ASSISTANT (GM only)
// A floating bubble. The GM types free text on any screen — a character
// sheet, the World tab, the ledger… — and Claude decides where it belongs
// and proposes edits ("add relationship: Astrus — Lieutenant of the Wall").
// The GM ticks what to keep and applies it, so nothing changes silently.
//
// The Claude API key is stored ONLY in this browser (localStorage) and is
// sent only to api.anthropic.com. It is never written to the database or
// the repo. Players can't reach the bubble.
// ═══════════════════════════════════════════════════════════════

const AI_KEY_STORE = 'academy_ai_key';
const AI_MODEL_STORE = 'academy_ai_model';
const AI_DEFAULT_MODEL = 'claude-sonnet-5-5';

let aiOpen = false;
let aiBusy = false;
let aiSettings = false;
let aiLog = [];          // what the panel shows: {role:'user'|'assistant'|'error'|'info', text}
let aiTurns = [];        // plain text turns sent back to the API for follow-ups
let aiProposal = null;   // { actions: [{ text, error, run, on }] }

const aiKey = () => { try { return localStorage.getItem(AI_KEY_STORE) || ''; } catch (e) { return ''; } };
const aiModel = () => { try { return localStorage.getItem(AI_MODEL_STORE) || AI_DEFAULT_MODEL; } catch (e) { return AI_DEFAULT_MODEL; } };

const AI_SYSTEM = `You are the Game Master's assistant inside the app for the tabletop RPG "The Last Curriculum", a dark-academy campaign: students attend Universitas Aeterna Selectorum inside an empire walled off from the Demonlands. Rules in brief: three Pillars (Body, Mind, Soul) each with three Skills; d20 roll-under; LIFE; Focus, Energy, Stress, Ascension and Ruin counters.

The GM types free text about what happened, or about a character, place, faction or item. Record it where it belongs by calling the provided tools, so the information is added organically to the right sheets, notes and entries.

Rules:
- Use the current-screen context to decide where things go. If a character sheet is open, the text is probably about that character, unless the GM names someone else.
- Prefer appending to existing notes over replacing anything. Keep the GM's wording and details. Never invent facts, names or numbers.
- Secrets, plans and spoilers go in gmNotes; things the player knows go in notes.
- Places, factions, events and lore go in the World via upsert_world_entry (append to an existing entry when one matches).
- Only use character names from the roster, exactly as listed.
- If the request is ambiguous or a needed detail is missing, ask ONE short question and call no tools.
- After calling tools, write one short sentence summarising what you propose. The GM approves every change before it is applied.`;

const CHAR_PROP = { type: 'string', description: 'Character name exactly as in the roster' };
const AI_TOOLS = [
  { name: 'append_character_note', description: 'Append text to a character’s Notes (player-visible) or GM notes (GM only).', input_schema: { type: 'object', properties: { character: CHAR_PROP, field: { type: 'string', enum: ['notes', 'gmNotes'] }, text: { type: 'string' } }, required: ['character', 'field', 'text'] } },
  { name: 'add_relationship', description: 'Add a row to a character’s Relationships list.', input_schema: { type: 'object', properties: { character: CHAR_PROP, who: { type: 'string' }, note: { type: 'string' } }, required: ['character', 'who', 'note'] } },
  { name: 'add_inventory_item', description: 'Give a character an item.', input_schema: { type: 'object', properties: { character: CHAR_PROP, name: { type: 'string' }, effect: { type: 'string' }, description: { type: 'string' } }, required: ['character', 'name'] } },
  { name: 'add_sheet_row', description: 'Add a passive talent, active talent or condition to a character sheet.', input_schema: { type: 'object', properties: { character: CHAR_PROP, section: { type: 'string', enum: ['passives', 'activeTalents', 'sheetConditions'] }, name: { type: 'string' }, effect: { type: 'string' }, level: { type: 'string', description: 'Bonus or level shown in the L column (passives only)' } }, required: ['character', 'section', 'name'] } },
  { name: 'set_quick_info', description: 'Set one Quick info field on a character.', input_schema: { type: 'object', properties: { character: CHAR_PROP, field: { type: 'string', enum: ['fullName', 'age', 'height', 'race', 'family', 'other'] }, value: { type: 'string' } }, required: ['character', 'field', 'value'] } },
  { name: 'add_technique', description: 'Add a technique to a character.', input_schema: { type: 'object', properties: { character: CHAR_PROP, name: { type: 'string' }, roll: { type: 'string', description: 'e.g. "Soul + Presence"' }, bonus: { type: 'number' }, cooldown: { type: 'string', description: 'e.g. "CD 2", "Once per combat", "Spend 1 Focus"' }, origin: { type: 'string' }, effect: { type: 'string' } }, required: ['character', 'name'] } },
  { name: 'adjust_counter', description: 'Change a character counter: life, focus, energy, stress, ascension, ruin, detention (hours) or xp.', input_schema: { type: 'object', properties: { character: CHAR_PROP, field: { type: 'string', enum: ['life', 'focus', 'energy', 'stress', 'ascension', 'ruin', 'detention', 'xp'] }, mode: { type: 'string', enum: ['set', 'add'] }, value: { type: 'number' } }, required: ['character', 'field', 'mode', 'value'] } },
  { name: 'set_character_status', description: 'Set a character story status tag (Alive, Injured, Missing, Captured, Dead, Unknown).', input_schema: { type: 'object', properties: { character: CHAR_PROP, status: { type: 'string', enum: ['Alive', 'Injured', 'Missing', 'Captured', 'Dead', 'Unknown'] } }, required: ['character', 'status'] } },
  { name: 'set_character_faction', description: 'Set which faction a character belongs to (e.g. Midnight Archive). Empty string clears it.', input_schema: { type: 'object', properties: { character: CHAR_PROP, faction: { type: 'string' } }, required: ['character', 'faction'] } },
  { name: 'add_status_condition', description: 'Add a temporary status chip (prone, held, -2 on rolls…) to a character, shown in combat.', input_schema: { type: 'object', properties: { character: CHAR_PROP, text: { type: 'string' } }, required: ['character', 'text'] } },
  { name: 'upsert_world_entry', description: 'Create or update a World entry (place, faction, NPC write-up, event, lore).', input_schema: { type: 'object', properties: { name: { type: 'string' }, kind: { type: 'string', enum: ['Place', 'Faction', 'NPC', 'Event', 'Lore', 'Other'] }, text: { type: 'string' }, mode: { type: 'string', enum: ['append', 'replace'], description: 'append to an existing entry of that name, or replace its text' } }, required: ['name', 'kind', 'text'] } },
  { name: 'append_mission_note', description: 'Append to the notes of a mission in the Ledger.', input_schema: { type: 'object', properties: { mission: { type: 'string', description: 'Mission name (or part of it)' }, text: { type: 'string' } }, required: ['mission', 'text'] } },
];

// ── context: what the GM is looking at ──
function aiCompactChar(c) {
  const list = m => Object.values(m || {}).sort((a, b) => (a.n || 0) - (b.n || 0));
  return {
    name: c.name, player: c.player, npc: c.isNPC, status: c.status, faction: c.faction, level: c.level, year: c.year, xp: `${c.xp}/${c.xpMax}`,
    archetype: state.archetypes[c.archetypeId]?.name || null, background: c.background,
    life: `${c.life}/${lifeMax(c)}`, focus: c.focus, energy: c.energy, stress: c.stress, ascension: c.ascension, ruin: c.ruin, detentionHours: c.detention,
    pillars: c.pillars, skills: c.skills,
    professors: (c.professorIds || []).map(id => state.professors[id]?.name).filter(Boolean),
    clubs: (c.clubIds || []).map(id => state.clubs[id]?.name).filter(Boolean),
    quickInfo: c.quick, discipline: c.discipline,
    techniques: charTechniques(c).map(t => ({ name: t.name, roll: t.roll, bonus: t.bonus || 0, cooldown: t.cooldownCost, effect: t.effect })),
    passiveTalents: list(c.passives).map(r => ({ name: r.name, bonus: r.level, effect: r.effect })),
    activeTalents: list(c.activeTalents).map(r => ({ name: r.name, effect: r.effect })),
    conditions: list(c.sheetConditions).map(r => ({ name: r.name, effect: r.effect })),
    relationships: list(c.relationships).map(r => ({ who: r.name, note: r.note })),
    inventory: Object.values(c.inventory || {}).map(i => ({ name: i.name, effect: i.effect })),
    statuses: c.conditions || [], notes: c.notes, gmNotes: c.gmNotes,
  };
}

function aiContextLabel() {
  const v = currentView().replace('view-', '');
  if (v === 'characters') return openCharId && state.characters[openCharId] ? `Character: ${state.characters[openCharId].name}` : 'Characters list';
  return { status: 'Status screen (live scene)', combat: 'Combat', curriculum: 'Curriculum', ledger: 'Ledger', items: 'Items', world: 'World' }[v] || v;
}

function aiContext() {
  const v = currentView().replace('view-', '');
  const ctx = {
    screen: aiContextLabel(),
    roster: Object.values(state.characters).map(c => ({ name: c.name, npc: !!c.isNPC, status: c.status, faction: c.faction || undefined, player: c.player || undefined })),
    missions: Object.values(state.missions || {}).sort((a, b) => (a.order || 0) - (b.order || 0)).map(m => m.name),
    worldEntries: Object.values(state.world || {}).map(e => ({ name: e.name, kind: e.kind })),
  };
  if (v === 'characters' && openCharId && state.characters[openCharId]) ctx.openCharacter = aiCompactChar(state.characters[openCharId]);
  if (v === 'status') ctx.scene = { name: state.settings?.sceneName || '', entries: sceneEntries().map(e => ({ name: state.characters[e.charId].name, side: e.side, visibleToPlayers: !!e.visible, life: state.characters[e.charId].life + '/' + lifeMax(state.characters[e.charId]) })) };
  if (v === 'combat') ctx.combat = { active: state.combat.active, round: state.combat.round, order: combatOrder().map(id => state.characters[id].name) };
  if (v === 'ledger') ctx.ledger = Object.values(state.missions || {}).map(m => ({ name: m.name, notes: m.notes }));
  if (v === 'world') ctx.world = Object.values(state.world || {}).map(e => ({ name: e.name, kind: e.kind, text: (e.text || '').slice(0, 600) }));
  if (v === 'curriculum') ctx.curriculumSection = currView;
  return ctx;
}

// ── UI ──
function toggleAI() {
  if (session.role !== 'gm') return;
  aiOpen = !aiOpen;
  document.getElementById('ai-panel').classList.toggle('open', aiOpen);
  if (aiOpen) { aiRefreshContext(); renderAI(); setTimeout(() => document.getElementById('ai-text')?.focus(), 80); }
}
function aiShowSettings() { aiSettings = true; renderAI(); }
function aiRefreshContext() {
  const el = document.getElementById('ai-context');
  if (el) el.textContent = 'Looking at: ' + aiContextLabel();
}

function renderAI() {
  const root = document.getElementById('ai-log');
  if (!root) return;
  const key = aiKey();
  if (!key || aiSettings) {
    root.innerHTML = `
      <div class="ai-card">
        <strong>Claude API key</strong>
        <p class="note" style="margin:6px 0 10px">Paste a key from console.anthropic.com. It is saved <em>only in this browser</em> and sent only to Anthropic — never to the campaign database or GitHub. Use a key with a spend limit, and don't use this on a shared computer.</p>
        <div class="field"><label>API key</label><input type="password" id="ai-key-in" placeholder="${key ? 'Saved — paste a new key to replace it' : 'sk-ant-…'}" autocomplete="off"></div>
        <div class="field"><label>Model</label><input type="text" id="ai-model-in" value="${escapeAttr(aiModel())}"></div>
        <div class="btn-row"><button class="btn primary" onclick="aiSaveSettings()">Save</button>
          ${key ? `<button class="btn" onclick="aiSettings=false;renderAI()">Cancel</button><button class="btn danger" onclick="aiRemoveKey()">Remove key</button>` : ''}</div>
      </div>`;
    return;
  }
  root.innerHTML = `
    ${aiLog.length ? '' : '<div class="ai-hint">Tell me what happened or describe something — a character, a place, an item — and I’ll suggest where to record it. I look at whatever screen you have open. You approve every change.</div>'}
    ${aiLog.map(m => `<div class="ai-msg ai-${m.role}">${escapeHtml(m.text)}</div>`).join('')}
    ${aiBusy ? '<div class="ai-msg ai-assistant ai-thinking">Thinking…</div>' : ''}
    ${aiProposal ? proposalHtml() : ''}`;
  root.scrollTop = root.scrollHeight;
}

function proposalHtml() {
  return `<div class="ai-card"><strong>Proposed changes</strong>
    ${aiProposal.actions.map((a, i) => `<label class="chk ai-act ${a.error ? 'bad' : ''}"><input type="checkbox" ${a.error ? 'disabled' : (a.on ? 'checked' : '')} onchange="aiProposal.actions[${i}].on=this.checked"> <span>${escapeHtml(a.text)}${a.error ? ` — <em>${escapeHtml(a.error)}</em>` : ''}</span></label>`).join('')}
    <div class="btn-row" style="margin-top:8px"><button class="btn primary" onclick="aiApply()">Apply selected</button><button class="btn" onclick="aiDismiss()">Dismiss</button></div></div>`;
}

function aiSaveSettings() {
  const k = document.getElementById('ai-key-in').value.trim();
  const m = document.getElementById('ai-model-in').value.trim();
  try {
    if (k) localStorage.setItem(AI_KEY_STORE, k);
    localStorage.setItem(AI_MODEL_STORE, m || AI_DEFAULT_MODEL);
  } catch (e) { aiLog.push({ role: 'error', text: 'Could not save to this browser’s storage.' }); }
  aiSettings = false;
  renderAI();
}
function aiRemoveKey() {
  try { localStorage.removeItem(AI_KEY_STORE); } catch (e) {}
  aiSettings = false; aiLog = []; aiTurns = []; aiProposal = null;
  renderAI();
}
function aiClear() { aiLog = []; aiTurns = []; aiProposal = null; renderAI(); }
function aiDismiss() { aiProposal = null; aiLog.push({ role: 'info', text: 'Dismissed — nothing was changed.' }); renderAI(); }

// ── calling Claude ──
async function aiSend() {
  if (aiBusy) return;
  const box = document.getElementById('ai-text');
  const text = (box.value || '').trim();
  if (!text) return;
  if (!aiKey()) { aiSettings = true; renderAI(); return; }
  box.value = '';
  aiLog.push({ role: 'user', text });
  aiProposal = null; aiBusy = true; renderAI();
  document.getElementById('ai-send').disabled = true;
  try {
    const content = `CURRENT SCREEN CONTEXT (JSON):\n${JSON.stringify(aiContext())}\n\nGM SAYS:\n${text}`;
    const messages = aiTurns.slice(-8).concat([{ role: 'user', content }]);
    const data = await aiCallClaude(messages);
    aiTurns.push({ role: 'user', content: text });
    const reply = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
    const tools = (data.content || []).filter(b => b.type === 'tool_use');
    aiTurns.push({ role: 'assistant', content: reply || (tools.length ? 'I proposed some changes.' : '(no reply)') });
    if (reply) aiLog.push({ role: 'assistant', text: reply });
    if (tools.length) aiProposal = { actions: tools.map(aiPlanAction) };
    else if (!reply) aiLog.push({ role: 'assistant', text: 'I had nothing to add.' });
  } catch (e) {
    aiLog.push({ role: 'error', text: e.message });
  } finally {
    aiBusy = false;
    const btn = document.getElementById('ai-send'); if (btn) btn.disabled = false;
    renderAI();
  }
}

async function aiCallClaude(messages) {
  let res;
  try {
    res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': aiKey(),
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',   // required for calls straight from a browser
      },
      body: JSON.stringify({ model: aiModel(), max_tokens: 2000, system: AI_SYSTEM, tools: AI_TOOLS, messages }),
    });
  } catch (e) { throw new Error('Could not reach Anthropic. Check your connection.'); }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message || ('HTTP ' + res.status);
    throw new Error(res.status === 401 ? 'Anthropic rejected the API key (401). Open ⚙ and check it.' : 'Anthropic error: ' + msg);
  }
  return data;
}

// ── turning tool calls into reviewable, applicable actions ──
function aiFindChar(name) {
  const n = (name || '').trim().toLowerCase();
  const all = Object.values(state.characters);
  return all.find(c => c.name.toLowerCase() === n)
    || (all.filter(c => c.name.toLowerCase().startsWith(n) || n.startsWith(c.name.toLowerCase())).length === 1 ? all.find(c => c.name.toLowerCase().startsWith(n) || n.startsWith(c.name.toLowerCase())) : null);
}
const clip = (s, n) => { s = (s || '').toString(); return s.length > n ? s.slice(0, n - 1) + '…' : s; };

function aiPlanAction(tu) {
  const i = tu.input || {};
  const act = { text: tu.name, error: '', on: true, run: async () => {} };
  const needChar = () => { const c = aiFindChar(i.character); if (!c) act.error = `no character called "${i.character}"`; return c; };
  const row = (c, section, data) => { const id = uid(); return dbWrite(`characters/${c.id}/${section}/${id}`, { id, n: Date.now(), ...data }); };

  switch (tu.name) {
    case 'append_character_note': {
      const c = needChar(); const f = i.field === 'gmNotes' ? 'gmNotes' : 'notes';
      act.text = `${c ? c.name : i.character} — add to ${f === 'gmNotes' ? 'GM notes' : 'Notes'}: ${clip(i.text, 140)}`;
      if (c) act.run = () => dbWrite(`characters/${c.id}/${f}`, ((state.characters[c.id][f] || '') ? state.characters[c.id][f] + '\n\n' : '') + i.text);
      break; }
    case 'add_relationship': {
      const c = needChar(); act.text = `${c ? c.name : i.character} — relationship: ${i.who} — ${clip(i.note, 100)}`;
      if (c) act.run = () => row(c, 'relationships', { name: i.who, note: i.note });
      break; }
    case 'add_inventory_item': {
      const c = needChar(); act.text = `${c ? c.name : i.character} — item: ${i.name}${i.effect ? ' — ' + clip(i.effect, 100) : ''}`;
      if (c) act.run = () => { const id = uid(); return dbWrite(`characters/${c.id}/inventory/${id}`, { id, name: i.name, effect: i.effect || '', description: i.description || '', type: '', rarity: '' }); };
      break; }
    case 'add_sheet_row': {
      const c = needChar(); const label = { passives: 'passive talent', activeTalents: 'active talent', sheetConditions: 'condition' }[i.section] || i.section;
      act.text = `${c ? c.name : i.character} — ${label}: ${i.name}${i.effect ? ' — ' + clip(i.effect, 100) : ''}`;
      if (!['passives', 'activeTalents', 'sheetConditions'].includes(i.section)) act.error = 'unknown section';
      else if (c) act.run = () => row(c, i.section, { name: i.name, effect: i.effect || '', level: i.level || '' });
      break; }
    case 'set_quick_info': {
      const c = needChar(); act.text = `${c ? c.name : i.character} — ${i.field}: ${clip(i.value, 120)}`;
      if (!QUICK_FIELDS.some(f => f[0] === i.field)) act.error = 'unknown field';
      else if (c) act.run = () => dbWrite(`characters/${c.id}/quick/${i.field}`, i.value);
      break; }
    case 'add_technique': {
      const c = needChar(); act.text = `${c ? c.name : i.character} — technique: ${i.name}${i.roll ? ' (' + i.roll + ')' : ''}${i.effect ? ' — ' + clip(i.effect, 100) : ''}`;
      if (c) act.run = () => { const id = 'tq_' + uid(); return dbWrite(`characters/${c.id}/techniques/${id}`, { id, name: i.name, origin: i.origin || '', cooldownCost: i.cooldown || '', levelRequirement: 0, roll: i.roll || '', bonus: Number(i.bonus) || 0, effect: i.effect || '' }); };
      break; }
    case 'adjust_counter': {
      const c = needChar(); const f = i.field; const v = Number(i.value) || 0;
      const label = { xp: 'XP', life: 'LIFE', detention: 'Detention hours' }[f] || (f ? f[0].toUpperCase() + f.slice(1) : '?');
      act.text = `${c ? c.name : i.character} — ${label} ${i.mode === 'add' ? (v >= 0 ? '+' : '') + v : '= ' + v}`;
      if (!['life', 'focus', 'energy', 'stress', 'ascension', 'ruin', 'detention', 'xp'].includes(f)) act.error = 'unknown counter';
      else if (c) act.run = () => {
        const cur = Number(state.characters[c.id][f]) || 0;
        let next = i.mode === 'add' ? cur + v : v;
        next = f === 'life' ? Math.min(lifeMax(state.characters[c.id]), next) : Math.max(0, next);
        return dbWrite(`characters/${c.id}/${f}`, next);
      };
      break; }
    case 'set_character_status': {
      const c = needChar(); act.text = `${c ? c.name : i.character} — status: ${i.status}`;
      if (!CHAR_STATUSES.includes(i.status)) act.error = 'unknown status';
      else if (c) act.run = () => dbWrite(`characters/${c.id}/status`, i.status);
      break; }
    case 'set_character_faction': {
      const c = needChar(); act.text = `${c ? c.name : i.character} — faction: ${i.faction || '(none)'}`;
      if (c) act.run = () => dbWrite(`characters/${c.id}/faction`, (i.faction || '').trim());
      break; }
    case 'add_status_condition': {
      const c = needChar(); act.text = `${c ? c.name : i.character} — status: ${i.text}`;
      if (c) act.run = () => addCondition(c.id, i.text);
      break; }
    case 'upsert_world_entry': {
      const ex = Object.values(state.world || {}).find(e => e.name.toLowerCase() === (i.name || '').trim().toLowerCase());
      const append = ex && i.mode !== 'replace';
      act.text = `World — ${ex ? (append ? 'add to' : 'rewrite') : 'new'} ${i.kind || 'entry'} “${i.name}”: ${clip(i.text, 140)}`;
      act.run = () => {
        const id = ex ? ex.id : uid();
        const text = append ? (ex.text ? ex.text + '\n\n' : '') + i.text : i.text;
        return dbWrite('world/' + id, { id, name: ex ? ex.name : i.name.trim(), kind: ex ? (ex.kind || i.kind) : (i.kind || 'Other'), text, updated: Date.now() });
      };
      break; }
    case 'append_mission_note': {
      const m = Object.values(state.missions || {}).find(x => x.name.toLowerCase().includes((i.mission || '').toLowerCase()));
      act.text = `Ledger — ${m ? m.name : i.mission}: ${clip(i.text, 140)}`;
      if (!m) act.error = `no mission called "${i.mission}"`;
      else act.run = () => dbWrite(`missions/${m.id}/notes`, ((state.missions[m.id].notes || '') ? state.missions[m.id].notes + '\n' : '') + i.text);
      break; }
    default: act.error = 'unknown action';
  }
  if (act.error) act.on = false;
  return act;
}

async function aiApply() {
  if (!aiProposal) return;
  const chosen = aiProposal.actions.filter(a => a.on && !a.error);
  let done = 0, failed = 0;
  for (const a of chosen) { try { await a.run(); done++; } catch (e) { failed++; console.error(e); } }
  aiProposal = null;
  aiLog.push({ role: 'info', text: done ? `Applied ${done} change${done > 1 ? 's' : ''}.${failed ? ` ${failed} failed.` : ''}` : (failed ? `${failed} change(s) failed.` : 'Nothing selected — nothing changed.') });
  aiTurns.push({ role: 'user', content: `(The GM applied ${done} of the proposed changes.)` });
  aiTurns.push({ role: 'assistant', content: 'Noted.' });
  renderAI();
  if (done) showToast(`✨ Applied ${done} change${done > 1 ? 's' : ''}.`);
}
