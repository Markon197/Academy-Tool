// ═══════════════════════════════════════════════════════════════
// LIBRARY VIEWS — Talents, Techniques and Magic Schools in the Curriculum tab.
//   TECHNIQUE = something you actively use (cooldown / cost / roll)
//   TALENT    = always on
// Both are shown as filterable card grids: search, magic school, source, level,
// cooldown type, "show" (available / taken / all) and sort, with group headings.
// The same screen serves the GM (edit, delete, hand out) and players (what they can
// use, with their own target numbers).
// ═══════════════════════════════════════════════════════════════

const libDefault = () => ({ q: '', school: '', source: '', type: '', maxLevel: '', cd: '', show: '', sort: 'level' });
let libFilters = { talents: libDefault(), skills: libDefault() };
let libOpen = new Set();       // cards whose text is expanded
let magicOpen = new Set();     // magic sections that are expanded

const schoolById = id => MAGIC_SCHOOLS.find(s => s.id === id);
const schoolColor = id => schoolById(id)?.color || '#8a6a2e';

// Splits "Prof. Ironwell / Martial Discipline" into ["Prof. Ironwell", "Martial Discipline"]
const sourceTokens = x => (x.origin || '').split('/').map(s => s.trim()).filter(Boolean);

function cdKind(x) {
  const cd = parseCooldown(x.cooldownCost);
  if (cd.passive) return 'Passive';
  if (cd.focus || cd.energy) return 'Costs Focus / Energy';
  if (cd.rounds) return 'Rounds cooldown';
  if (cd.perBattle) return 'Once per battle';
  if (cd.perRest) return 'Once per rest / day';
  return /stress/i.test(x.cooldownCost || '') ? 'Costs Stress' : 'No limit';
}
const CD_KINDS = ['Rounds cooldown', 'Once per battle', 'Once per rest / day', 'Costs Focus / Energy', 'Costs Stress', 'Passive', 'No limit'];

function libItem(kind, x, c) {
  const isTech = kind === 'skills';
  const level = isTech ? (x.levelRequirement || 0) : ((x.levelRequirements && x.levelRequirements[0]) || 1);
  const it = { x, isTech, level, school: schoolOf(x), tokens: isTech ? sourceTokens(x) : [x.type].filter(Boolean), cd: isTech ? cdKind(x) : '' };
  if (c) {
    const unlocked = c.unlockedIds || [];
    const visible = !x.secret || unlocked.includes(x.id);
    if (isTech) {
      const learned = (c.skillIds || []).includes(x.id);
      it.taken = learned; it.visible = visible || learned;
      // access comes from the origin text, or from the magic school's teacher (e.g. Prof. Ash teaches Psychomancy)
      const teacher = schoolById(it.school)?.teacher;
      const access = characterHasAccessToOrigin(c, x.origin) || (!!teacher && characterHasAccessToOrigin(c, teacher));
      it.available = learned || (c.level >= level && (x.secret ? unlocked.includes(x.id) : access));
    } else {
      const rank = (c.talentRanks || {})[x.id] || 0;
      it.taken = rank > 0; it.rank = rank; it.visible = visible || rank > 0;
      it.available = rank > 0 || (eligibleRanks(x, c.level) >= 1 && visible);
    }
  }
  return it;
}

function libFiltered(kind) {
  const f = libFilters[kind], gm = session.role === 'gm';
  const c = gm ? null : state.characters[session.charId];
  const q = f.q.toLowerCase();
  let items = Object.values(state[kind]).map(x => libItem(kind, x, c));
  if (!gm) items = items.filter(i => i.visible);
  const all = items;
  items = items.filter(i => {
    const x = i.x;
    if (q && !((x.name || '') + ' ' + (x.effect || x.description || '') + ' ' + (x.origin || x.type || '') + ' ' + i.school).toLowerCase().includes(q)) return false;
    if (f.school && i.school !== f.school) return false;
    if (f.source && !i.tokens.some(t => t.toLowerCase() === f.source.toLowerCase())) return false;
    if (f.maxLevel !== '' && i.level > Number(f.maxLevel)) return false;
    if (f.cd && i.cd !== f.cd) return false;
    if (gm) { if (f.show === 'secret' && !x.secret) return false; }
    else { const show = f.show || 'available'; if (show === 'available' && !i.available) return false; if (show === 'taken' && !i.taken) return false; }
    return true;
  });
  const key = { level: i => [i.level, i.x.name], name: i => [i.x.name], school: i => [i.school || '~', i.level, i.x.name], source: i => [(i.tokens[0] || '~'), i.level, i.x.name] }[f.sort] || (i => [i.level, i.x.name]);
  items.sort((a, b) => { const A = key(a), B = key(b); for (let n = 0; n < A.length; n++) { if (A[n] === B[n]) continue; return typeof A[n] === 'number' ? A[n] - B[n] : String(A[n]).localeCompare(String(B[n])); } return 0; });
  return { items, all };
}

function libSet(kind, field, value) { libFilters[kind][field] = value; renderCurriculum(); }
function libReset(kind) { libFilters[kind] = libDefault(); renderCurriculum(); }
function libToggle(id) { if (libOpen.has(id)) libOpen.delete(id); else libOpen.add(id); renderCurriculum(); }

// ── Filter bar + grid ──
function libraryHtml(kind) {
  const isTech = kind === 'skills', gm = session.role === 'gm';
  const f = libFilters[kind];
  const { items, all } = libFiltered(kind);
  const noun = isTech ? 'Techniques' : 'Talents';
  const schools = MAGIC_SCHOOLS.map(s => s.id).filter(id => all.some(i => i.school === id));
  const sources = [...new Set(all.flatMap(i => i.tokens))].sort((a, b) => a.localeCompare(b));
  const maxLvl = Math.max(15, ...all.map(i => i.level));
  const sel = (field, opts, label, current) => `<div class="field"><label>${label}</label><select onchange="libSet('${kind}','${field}',this.value)">${opts.map(([v, l]) => `<option value="${escapeAttr(v)}" ${String(current) === String(v) ? 'selected' : ''}>${escapeHtml(l)}</option>`).join('')}</select></div>`;
  const showOpts = gm ? [['', 'Everything'], ['secret', 'Secret only']] : [['available', 'Available to me'], ['taken', 'Taken'], ['all', 'Everything I can see']];
  const active = ['q', 'school', 'source', 'maxLevel', 'cd', 'show'].some(k => f[k] !== '' && !(k === 'show' && !gm && f.show === 'available'));

  const heading = i => f.sort === 'school' ? (i.school || 'No school') : f.sort === 'level' ? `Level ${i.level}` : f.sort === 'source' ? (i.tokens[0] || 'No source') : null;
  let lastHead = null, body = '';
  items.forEach(i => { const h = heading(i); if (h !== null && h !== lastHead) { lastHead = h; body += `<h3 class="lib-group" ${f.sort === 'school' && i.school ? `style="--sc:${schoolColor(i.school)}"` : ''}>${escapeHtml(h)}</h3>`; } body += libCardHtml(kind, i); });

  return `
  <div class="panel lib-bar">
    <div class="lib-top">
      <div class="field grow"><label>Search ${noun.toLowerCase()}</label><input type="text" value="${escapeAttr(f.q)}" placeholder="Name, effect, school…" oninput="libSet('${kind}','q',this.value)"></div>
      ${gm ? `<button class="btn primary" onclick="openDraft('${kind}',null)">+ New ${isTech ? 'technique' : 'talent'}</button>` : ''}
    </div>
    <div class="lib-chips">
      <button class="chip ${f.school === '' ? 'on' : ''}" onclick="libSet('${kind}','school','')">All schools</button>
      ${schools.map(id => `<button class="chip ${f.school === id ? 'on' : ''}" style="--sc:${schoolColor(id)}" onclick="libSet('${kind}','school','${id}')">${id} <i>${all.filter(x => x.school === id).length}</i></button>`).join('')}
    </div>
    <div class="lib-selects">
      ${sel('source', [['', isTech ? 'Any source' : 'Any type']].concat(sources.map(s => [s, s])), isTech ? 'Source' : 'Type', f.source)}
      ${sel('maxLevel', [['', 'Any level']].concat(Array.from({ length: maxLvl + 1 }, (_, n) => [String(n), '≤ ' + n])), 'Max level', f.maxLevel)}
      ${isTech ? sel('cd', [['', 'Any']].concat(CD_KINDS.filter(k => all.some(i => i.cd === k)).map(k => [k, k])), 'Cooldown', f.cd) : ''}
      ${sel('show', showOpts, 'Show', f.show || (gm ? '' : 'available'))}
      ${sel('sort', [['level', 'Level'], ['name', 'Name'], ['school', 'School'], ['source', isTech ? 'Source' : 'Type']], 'Sort', f.sort)}
      <div class="field lib-count"><label>&nbsp;</label><span><strong>${items.length}</strong> of ${all.length}</span> ${active ? `<button class="btn small" onclick="libReset('${kind}')">Reset</button>` : ''}</div>
    </div>
  </div>
  ${items.length ? `<div class="lib-grid">${body}</div>` : `<div class="panel"><div class="empty-state">Nothing matches these filters.${active ? ` <button class="btn small" onclick="libReset('${kind}')">Reset filters</button>` : ''}</div></div>`}
  ${currDraft && currDraft.type === kind ? draftFormHtml(kind) : ''}`;
}

function libCardHtml(kind, i) {
  const x = i.x, gm = session.role === 'gm';
  const c = gm ? null : state.characters[session.charId];
  const text = i.isTech ? x.effect : x.description;
  const open = libOpen.has(x.id);
  const rollInfo = i.isTech && x.roll && !/^no roll$/i.test(x.roll.trim()) ? (() => { const r = parseRoll(x.roll); return r && c ? `${x.roll} · TN ${statValue(c, r.a) + statValue(c, r.b)}` : x.roll; })() : '';
  const ranks = !i.isTech && (x.levelRequirements || []).length > 1 ? `Ranks at ${x.levelRequirements.join(' / ')}` : '';
  const chars = gm ? Object.values(state.characters).sort((a, b) => (a.isNPC - b.isNPC) || a.name.localeCompare(b.name)) : [];
  return `
  <article class="lib-card ${i.taken ? 'taken' : ''} ${!gm && !i.available ? 'locked' : ''} ${x.secret ? 'secret' : ''}" style="--sc:${schoolColor(i.school)}">
    <header><h4>${escapeHtml(x.name)}</h4><span class="lvl">Lvl ${i.level}</span></header>
    <div class="lib-chips-row">
      ${i.school ? `<span class="chip sm school" style="--sc:${schoolColor(i.school)}">${escapeHtml(i.school)}</span>` : ''}
      ${i.tokens.filter(t => t !== i.school).map(t => `<span class="chip sm">${escapeHtml(t)}</span>`).join('')}
      ${i.isTech && x.cast ? `<span class="chip sm">${escapeHtml(x.cast)}</span>` : ''}
      ${i.isTech && x.cooldownCost ? `<span class="chip sm cd">⏱ ${escapeHtml(x.cooldownCost)}</span>` : ''}
      ${rollInfo ? `<span class="chip sm roll">🎲 ${escapeHtml(rollInfo)}</span>` : ''}
      ${ranks ? `<span class="chip sm">${ranks}</span>` : ''}
      ${x.secret ? '<span class="chip sm danger">🔒 secret</span>' : ''}
    </div>
    <p class="lib-text ${open ? 'open' : ''}" onclick="libToggle('${x.id}')" title="Click to ${open ? 'collapse' : 'expand'}">${escapeHtml(text) || '—'}</p>
    <footer>
      ${gm ? `
        <div class="inline"><button class="icon-btn" onclick="openDraft('${kind}','${x.id}')" aria-label="Edit ${escapeAttr(x.name)}">✎</button><button class="icon-btn" onclick="deleteEntry('${kind}','${x.id}')" aria-label="Delete ${escapeAttr(x.name)}">✕</button></div>
        <div class="inline lib-give"><select id="lib-give-${x.id}" aria-label="Character">${chars.map(ch => `<option value="${ch.id}">${escapeHtml(ch.name)}</option>`).join('')}</select><button class="btn small" onclick="libGive('${kind}','${x.id}')">${i.isTech ? 'Teach' : 'Give'}</button></div>`
      : (i.taken ? `<span class="lib-state taken">✓ ${i.isTech ? 'Learned' : (i.rank > 1 ? 'Rank ' + i.rank : 'Taken')}</span>` : i.available ? '<span class="lib-state ok">Available</span>' : `<span class="lib-state">${i.isTech ? 'Needs ' + (i.level > (c?.level || 0) ? 'Level ' + i.level : 'a professor or club') : 'Level ' + i.level}</span>`)}
    </footer>
  </article>`;
}

// ── GM: hand a technique / talent to a character ──
async function libGive(kind, id) {
  const charId = document.getElementById('lib-give-' + id)?.value, c = state.characters[charId];
  if (!c) return;
  if (kind === 'skills') {
    if ((c.skillIds || []).includes(id)) { showToast(`${c.name} already knows ${state.skills[id].name}.`); return; }
    await dbWrite(`characters/${charId}/skillIds`, (c.skillIds || []).concat([id]));
    showToast(`${state.skills[id].name} taught to ${c.name}.`);
  } else {
    const max = (state.talents[id].levelRequirements || [1]).length, cur = (c.talentRanks || {})[id] || 0;
    if (cur >= max) { showToast(`${c.name} already has ${state.talents[id].name} at max rank.`); return; }
    await dbWrite(`characters/${charId}/talentRanks/${id}`, cur + 1);
    showToast(`${state.talents[id].name} given to ${c.name}.`);
  }
}

// ═══════════════════ MAGIC SCHOOLS ═══════════════════
function magicToggle(key) { if (magicOpen.has(key)) magicOpen.delete(key); else magicOpen.add(key); renderCurriculum(); }
function browseSchool(kind, school) {
  libFilters[kind] = { ...libDefault(), school, show: session.role === 'gm' ? '' : 'all', sort: 'level' };
  currView = kind; renderCurriculum();
}

function magicHtml() {
  const techs = Object.values(state.skills), tals = Object.values(state.talents);
  return `<div class="magic-grid">${MAGIC_SCHOOLS.map(s => {
    const nt = techs.filter(x => schoolOf(x) === s.id).length, nl = tals.filter(x => schoolOf(x) === s.id).length;
    return `
    <article class="magic-card" style="--sc:${s.color}">
      <header><h3>${s.id}</h3>${s.resource ? `<span class="chip sm school" style="--sc:${s.color}">Resource: ${s.resource}</span>` : ''}</header>
      <p class="magic-blurb">${escapeHtml(s.blurb)}</p>
      <div class="btn-row">
        <button class="btn small" onclick="browseSchool('skills','${s.id}')" ${nt ? '' : 'disabled'}>Techniques (${nt})</button>
        <button class="btn small" onclick="browseSchool('talents','${s.id}')" ${nl ? '' : 'disabled'}>Talents (${nl})</button>
      </div>
      ${s.sections.map((sec, n) => {
        const key = s.id + n, open = magicOpen.has(key);
        return `<div class="magic-sec ${open ? 'open' : ''}"><button class="magic-sec-h" onclick="magicToggle('${key}')" aria-expanded="${open}"><span>${open ? '▾' : '▸'}</span> ${escapeHtml(sec.title)}</button>${open ? `<ul>${sec.lines.map(l => `<li>${escapeHtml(l)}</li>`).join('')}</ul>` : ''}</div>`;
      }).join('')}
    </article>`;
  }).join('')}</div>`;
}
