// ═══════════════════════════════════════════════════════════════
// CURRICULUM MODULE — the school's rulebook content.
//  Talents      general, level-gated, often multi-rank (Level 4/8/12 = Rank I/II/III)
//  Techniques   origin-bound (professor discipline or club), level-gated
//  Professors   BODY / MIND / SOUL mentors with oath + table rules + GM secret
//  Clubs        extracurriculars with one signature ability
//  Archetypes   18 character archetypes: an advantage talent + a condition
// "Secret" items are hidden from players until the GM unlocks them.
// One schema-driven editor handles all five content types.
// ═══════════════════════════════════════════════════════════════

let currView = 'talents';     // talents | skills | professors | clubs | archetypes | unlocks
let currDraft = null;         // { type, data, isNew }
let unlockCharId = null;
let currSearch = '';

const professorSelect = () => Object.values(state.professors).map(p => [p.id, p.name]);
const schoolSelect = () => MAGIC_SCHOOLS.map(s => [s.id, s.id]);

const CURR = {
  talents: {
    label: 'Talents', one: 'talent', coll: 'talents',
    blank: () => ({ name: '', type: '', levelRequirements: [1], description: '', secret: false }),
    fields: [
      { k: 'name', l: 'Name', t: 'text' }, { k: 'type', l: 'Type (Fight, RP, Health…)', t: 'text' },
      { k: 'school', l: 'Magic school (optional)', t: 'select', options: schoolSelect },
      { k: 'levelRequirements', l: 'Level(s), e.g. 1 or 4;8;12', t: 'levels' },
      { k: 'description', l: 'Description', t: 'area' }, { k: 'secret', l: 'Secret (GM unlocks per character)', t: 'bool' }],
    tags: t => [t.type, 'Lvl ' + (t.levelRequirements || [1]).join('/')],
    meta: t => t.description,
  },
  skills: {
    label: 'Techniques', one: 'technique', coll: 'skills',
    blank: () => ({ name: '', origin: '', cooldownCost: '', levelRequirement: 0, roll: '', effect: '', secret: false }),
    fields: [
      { k: 'name', l: 'Name', t: 'text' }, { k: 'origin', l: 'Origin (professor / club / item)', t: 'text' },
      { k: 'school', l: 'Magic school (optional)', t: 'select', options: schoolSelect },
      { k: 'cast', l: 'Kind (Instant · Sustained · Reaction · Attack…)', t: 'text' },
      { k: 'cooldownCost', l: 'Cooldown / cost (CD 2 · Once per battle · Spend 1 Focus)', t: 'text' },
      { k: 'levelRequirement', l: 'Level', t: 'num' }, { k: 'roll', l: 'Roll (e.g. Body + Force)', t: 'text' },
      { k: 'effect', l: 'Effect', t: 'area' }, { k: 'secret', l: 'Secret (GM unlocks per character)', t: 'bool' }],
    tags: s => [s.origin, 'Lvl ' + (s.levelRequirement || 0), s.cooldownCost, s.roll],
    meta: s => s.effect,
  },
  professors: {
    label: 'Professors', one: 'professor', coll: 'professors',
    blank: () => ({ name: '', pillar: '', titleRole: '', description: '', quote: '', oath: '', tableRules: '', vibe: '', secretNotes: '', secretRevealed: false }),
    fields: [
      { k: 'name', l: 'Name', t: 'text' }, { k: 'pillar', l: 'Pillar (BODY / MIND / SOUL)', t: 'text' },
      { k: 'titleRole', l: 'Title / role', t: 'text' }, { k: 'description', l: 'Description', t: 'area' },
      { k: 'quote', l: 'Quote', t: 'text' }, { k: 'oath', l: 'Oath', t: 'area' },
      { k: 'tableRules', l: 'Rules at the table', t: 'area' }, { k: 'vibe', l: 'Vibe', t: 'text' },
      { k: 'secretNotes', l: 'GM secret', t: 'area' }, { k: 'secretRevealed', l: 'Secret revealed to players', t: 'bool' }],
    tags: p => [p.pillar, p.secretNotes ? (p.secretRevealed ? '👁 revealed' : '🔒 secret') : ''],
    meta: p => p.titleRole,
  },
  clubs: {
    label: 'Clubs', one: 'club', coll: 'clubs',
    blank: () => ({ name: '', whatYouDo: '', unlockableText: '', professorId: null, secret: false }),
    fields: [
      { k: 'name', l: 'Name', t: 'text' }, { k: 'whatYouDo', l: 'What you do there', t: 'area' },
      { k: 'unlockableText', l: 'Signature ability', t: 'area' },
      { k: 'professorId', l: 'Overseeing professor', t: 'select', options: professorSelect },
      { k: 'secret', l: 'Secret (GM unlocks per character)', t: 'bool' }],
    tags: c => [state.professors[c.professorId]?.name || c.professorNote, c.secret ? '🔒 secret' : ''],
    meta: c => c.whatYouDo,
  },
  archetypes: {
    label: 'Archetypes', one: 'archetype', coll: 'archetypes',
    blank: () => ({ name: '', tagline: '', talent: '', advantage: '', condition: '', conditionText: '' }),
    fields: [
      { k: 'name', l: 'Name', t: 'text' }, { k: 'tagline', l: 'Tagline', t: 'text' },
      { k: 'talent', l: 'Advantage talent name', t: 'text' }, { k: 'advantage', l: 'Advantage effect', t: 'area' },
      { k: 'condition', l: 'Condition name', t: 'text' }, { k: 'conditionText', l: 'Condition effect', t: 'area' }],
    tags: a => [a.talent, a.condition],
    meta: a => a.advantage,
  },
};

// ── shared helpers ──
function eligibleRanks(talent, level) {
  return (talent.levelRequirements && talent.levelRequirements.length ? talent.levelRequirements : [1]).filter(l => level >= l).length;
}
// Words that say nothing about WHICH professor or club ("Professor X" / "Prof. Y" must not match each other)
const STEM_STOPWORDS = new Set(['prof', 'club', 'corp', 'soci', 'work', 'guil', 'grou', 'the', 'and', 'item']);
function wordStems(name) { return (name || '').toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length >= 3).map(w => w.slice(0, 4)).filter(s => !STEM_STOPWORDS.has(s)); }
// A technique's free-text origin ("Prof. Ironwell / Martial Discipline") is matched against the
// names of the character's professors and clubs by word stem. Secret techniques use unlocks instead.
function characterHasAccessToOrigin(c, originText) {
  if (!originText) return true;
  const text = originText.toLowerCase();
  const names = [...(c.professorIds || []).map(id => state.professors[id]?.name), ...(c.clubIds || []).map(id => state.clubs[id]?.name)].filter(Boolean);
  return names.some(n => wordStems(n).some(s => text.includes(s)));
}

// One tab bar for everyone. TECHNIQUES are things you actively use; TALENTS are always on.
function curriculumTabs() {
  return session.role === 'gm'
    ? [['talents', 'Talents'], ['skills', 'Techniques'], ['magic', 'Magic schools'], ['professors', 'Professors'], ['clubs', 'Clubs'], ['archetypes', 'Archetypes'], ['unlocks', 'Unlocks']]
    : [['talents', 'Talents'], ['skills', 'Techniques']].concat(state.settings?.playerMagic ? [['magic', 'Magic schools']] : []).concat([['archetypes', 'Archetypes']]);
}

function renderCurriculum() {
  const root = document.getElementById('curriculum-root');
  if (!root) return;
  const gm = session.role === 'gm', tabs = curriculumTabs();
  if (!tabs.some(t => t[0] === currView)) currView = 'talents';
  const body = currView === 'talents' || currView === 'skills' ? libraryHtml(currView)
    : currView === 'magic' ? magicHtml()
    : currView === 'unlocks' ? renderUnlocks()
    : gm ? renderAdmin(currView) : playerArchetypesHtml();
  root.innerHTML = `
  <div class="toolbar">
    <div class="subnav" role="tablist">${tabs.map(([k, l]) => `<button role="tab" class="${currView === k ? 'active' : ''}" onclick="currView='${k}';currDraft=null;renderCurriculum()">${l}</button>`).join('')}</div>
    ${gm ? '<div class="btn-row"><button class="btn small" onclick="importCurriculum()" title="Adds anything missing from the campaign documents; never overwrites your edits">📥 Import campaign data</button></div>' : ''}
  </div>
  ${body}`;
}

// ═══════════════════ PLAYER: archetypes + revealed secrets ═══════════════════
function playerArchetypesHtml() {
  const c = state.characters[session.charId];
  if (!c) return '<div class="empty-state">No character found.</div>';
  return `
  <div class="panel"><div class="panel-title">Archetypes</div>
    ${Object.values(state.archetypes).sort((a, b) => a.name.localeCompare(b.name)).map(a => `<div class="origin ${a.id === c.archetypeId ? 'mine' : ''}"><strong>${escapeHtml(a.name)}</strong> <span class="sub">“${escapeHtml(a.tagline)}”</span>${a.id === c.archetypeId ? ' <span class="tag">yours</span>' : ''}<div class="desc"><strong>${escapeHtml(a.talent)}:</strong> ${escapeHtml(a.advantage)}</div><div class="desc"><span class="tag danger">Condition</span> ${escapeHtml(a.condition)}${a.conditionText ? ' — ' + escapeHtml(a.conditionText) : ''}</div></div>`).join('')}</div>
  ${(c.professorIds || []).map(id => state.professors[id]).filter(Boolean).map(p => p.secretRevealed && p.secretNotes ? `<div class="panel"><div class="panel-title">${escapeHtml(p.name)} — revealed</div><p style="white-space:pre-wrap">${escapeHtml(p.secretNotes)}</p></div>` : '').join('')}`;
}

// ═══════════════════ GM ═══════════════════
function renderAdmin(type) {
  const T = CURR[type];
  const q = currSearch.toLowerCase();
  const list = Object.values(state[T.coll]).filter(x => !q || JSON.stringify(x).toLowerCase().includes(q))
    .sort((a, b) => ((a.origin || a.pillar || '').localeCompare(b.origin || b.pillar || '')) || a.name.localeCompare(b.name));
  return `
  <div class="panel">
    <div class="panel-title">${T.label} <span class="sub">${Object.keys(state[T.coll]).length} total</span><button class="btn small" onclick="openDraft('${type}',null)">+ New ${T.one}</button></div>
    <div class="field"><input type="text" placeholder="Search ${T.label.toLowerCase()}…" value="${escapeAttr(currSearch)}" oninput="currSearch=this.value;renderCurriculum()"></div>
    ${list.length ? list.map(x => `
      <div class="roster-item">
        <div><div class="name">${escapeHtml(x.name)} ${T.tags(x).filter(Boolean).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}${x.secret ? '<span class="tag danger">🔒 secret</span>' : ''}</div>
          <div class="meta">${escapeHtml(T.meta(x) || '—')}</div></div>
        <div class="inline"><button class="icon-btn" onclick="openDraft('${type}','${x.id}')" aria-label="Edit ${escapeAttr(x.name)}">✎</button><button class="icon-btn" onclick="deleteEntry('${type}','${x.id}')" aria-label="Delete ${escapeAttr(x.name)}">✕</button></div>
      </div>`).join('') : '<div class="empty-state">Nothing here yet.</div>'}
  </div>
  ${currDraft && currDraft.type === type ? draftFormHtml(type) : ''}`;
}

function openDraft(type, id) {
  const data = id ? JSON.parse(JSON.stringify(state[CURR[type].coll][id])) : CURR[type].blank();
  currDraft = { type, data, isNew: !id };
  renderCurriculum();
  setTimeout(() => document.getElementById('draft-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 40);
}
function draftFormHtml(type) {
  const T = CURR[type], d = currDraft.data;
  return `
  <div class="panel" id="draft-panel">
    <div class="panel-title">${currDraft.isNew ? 'New' : 'Edit'} ${T.one}</div>
    ${T.fields.map(f => {
      const v = d[f.k];
      if (f.t === 'text') return `<div class="field"><label>${f.l}</label><input type="text" value="${escapeAttr(v)}" oninput="currDraft.data['${f.k}']=this.value"></div>`;
      if (f.t === 'area') return `<div class="field"><label>${f.l}</label><textarea oninput="currDraft.data['${f.k}']=this.value">${escapeHtml(v)}</textarea></div>`;
      if (f.t === 'num') return `<div class="field"><label>${f.l}</label><input type="number" value="${Number(v) || 0}" oninput="currDraft.data['${f.k}']=Number(this.value)||0"></div>`;
      if (f.t === 'levels') return `<div class="field"><label>${f.l}</label><input type="text" value="${escapeAttr((v || [1]).join(';'))}" oninput="currDraft.data['${f.k}']=parseLevels(this.value)"></div>`;
      if (f.t === 'bool') return `<label class="chk"><input type="checkbox" ${v ? 'checked' : ''} onchange="currDraft.data['${f.k}']=this.checked"> ${f.l}</label>`;
      if (f.t === 'select') return `<div class="field"><label>${f.l}</label><select onchange="currDraft.data['${f.k}']=this.value||null"><option value="">— none —</option>${f.options().map(([id, n]) => `<option value="${id}" ${v === id ? 'selected' : ''}>${escapeHtml(n)}</option>`).join('')}</select></div>`;
      return '';
    }).join('')}
    <div class="btn-row"><button class="btn primary" onclick="saveDraft()">Save</button><button class="btn" onclick="currDraft=null;renderCurriculum()">Cancel</button></div>
  </div>`;
}
function parseLevels(raw) {
  const nums = raw.split(/[;,\s]+/).map(s => parseInt(s, 10)).filter(n => !isNaN(n));
  return nums.length ? nums : [1];
}
async function saveDraft() {
  const { type, data } = currDraft;
  if (!(data.name || '').trim()) { showToast('Name is missing.'); return; }
  data.name = data.name.trim();
  data.id = data.id || uid();
  await dbWrite(CURR[type].coll + '/' + data.id, data);
  currDraft = null;
  showToast('Saved.');
}
async function deleteEntry(type, id) {
  const x = state[CURR[type].coll][id];
  if (!confirm(`Really delete "${x?.name}"?`)) return;
  await dbWrite(CURR[type].coll + '/' + id, null);
}

// ── Unlocks: per-character secrets, talent ranks, learned techniques ──
function renderUnlocks() {
  const chars = Object.values(state.characters).filter(c => !c.isNPC).sort((a, b) => a.name.localeCompare(b.name));
  let html = `<div class="panel"><div class="panel-title">Unlocks per character</div>
    <select onchange="unlockCharId=this.value;renderCurriculum()"><option value="">— choose a character —</option>
    ${chars.map(c => `<option value="${c.id}" ${unlockCharId === c.id ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('')}</select>
    <div class="note">Talent ranks and learned techniques can also be edited directly on the character sheet.</div></div>`;
  const c = unlockCharId ? state.characters[unlockCharId] : null;
  if (!c) return html;
  const unlocked = c.unlockedIds || [], ranks = c.talentRanks || {}, learned = c.skillIds || [];
  const chk = (id) => `<label class="chk"><input type="checkbox" ${unlocked.includes(id) ? 'checked' : ''} onchange="toggleUnlock('${c.id}','${id}')"> unlocked</label>`;
  html += `<div class="panel"><div class="panel-title">Talents</div>${Object.values(state.talents).sort((a, b) => a.name.localeCompare(b.name)).map(t => {
    const th = t.levelRequirements?.length ? t.levelRequirements : [1];
    return `<div class="roster-item static"><div><div class="name">${escapeHtml(t.name)} <span class="tag">Lvl ${th.join('/')}</span></div><div class="meta">${escapeHtml(t.description)}</div></div>
      <div class="inline">${t.secret ? chk(t.id) : ''}<button class="icon-btn" onclick="adjustRank('${c.id}','${t.id}',-1)">−</button><span class="sub">${ranks[t.id] || 0}/${th.length}</span><button class="icon-btn" onclick="adjustRank('${c.id}','${t.id}',1,${th.length})">+</button></div></div>`;
  }).join('')}</div>`;
  html += `<div class="panel"><div class="panel-title">Techniques</div>${Object.values(state.skills).sort((a, b) => (a.origin || '').localeCompare(b.origin || '')).map(s => `
    <div class="roster-item static"><div><div class="name">${escapeHtml(s.name)} <span class="tag">${escapeHtml(s.origin) || '—'}</span> <span class="tag">Lvl ${s.levelRequirement || 0}</span></div><div class="meta">${escapeHtml(s.effect)}</div></div>
      <div class="inline">${s.secret ? chk(s.id) : ''}<label class="chk"><input type="checkbox" ${learned.includes(s.id) ? 'checked' : ''} onchange="toggleSkillTaken('${c.id}','${s.id}')"> learned</label></div></div>`).join('')}</div>`;
  const secretClubs = (c.clubIds || []).map(id => state.clubs[id]).filter(x => x && x.secret);
  if (secretClubs.length) html += `<div class="panel"><div class="panel-title">Club secrets</div>${secretClubs.map(cl => `<div class="roster-item static"><div class="name">${escapeHtml(cl.name)}</div>${chk(cl.id)}</div>`).join('')}</div>`;
  return html;
}
async function toggleUnlock(charId, itemId) {
  const c = state.characters[charId], list = (c.unlockedIds || []).slice(), i = list.indexOf(itemId);
  if (i === -1) list.push(itemId); else list.splice(i, 1);
  await dbWrite('characters/' + charId + '/unlockedIds', list);
}
async function toggleSkillTaken(charId, skillId) {
  const c = state.characters[charId], list = (c.skillIds || []).slice(), i = list.indexOf(skillId);
  if (i === -1) list.push(skillId); else list.splice(i, 1);
  await dbWrite('characters/' + charId + '/skillIds', list);
}
async function adjustRank(charId, talentId, delta, max) {
  const c = state.characters[charId];
  const next = Math.max(0, Math.min(max ?? 99, ((c.talentRanks || {})[talentId] || 0) + delta));
  await dbWrite(`characters/${charId}/talentRanks/${talentId}`, next || null);
}

// ── Import: adds only what's missing, never overwrites GM edits ──
async function importCurriculum() {
  const sets = [
    ['talents', CURRICULUM_SEED.talents], ['skills', CURRICULUM_SEED.skills],
    ['professors', CURRICULUM_SEED.professors], ['clubs', CURRICULUM_SEED.clubs],
    ['archetypes', ARCHETYPES_SEED], ['items', LOOT_SEED.concat(MISSION_LOOT_SEED)],
    ['skills', MAGIC_SEED.skills], ['talents', MAGIC_SEED.talents],   // magic schools
  ];
  const updates = {};
  sets.forEach(([coll, list]) => list.forEach(x => { if (!state[coll][x.id]) updates[coll + '/' + x.id] = x; }));
  const n = Object.keys(updates).length;
  if (!n) { showToast('Everything is already imported.'); return; }
  if (!confirm(`Import ${n} missing entries (talents, techniques, magic schools, professors, clubs, archetypes, loot)? Existing entries are never overwritten.`)) return;
  await dbUpdate(updates);
  showToast(`Imported ${n} entries.`);
}
