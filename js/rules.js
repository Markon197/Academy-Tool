// ═══════════════════════════════════════════════════════════════
// RULES ENGINE — The Last Curriculum core rules as pure functions.
// Source: "Rule Sheet.docx" + character sheets (Packson, Varn, Aethyrix).
//
//  - 3 Pillars (BODY / MIND / SOUL), each with 3 Skills.
//  - Action roll: add Pillar + Skill = target number (TN). Roll a d20.
//    Roll <= TN succeeds. 1 = critical success, 20 = critical failure.
//    The higher the roll (while still <= TN), the stronger the success.
//  - LIFE = (BODY + MIND + SOUL) x 2. At 0 you pass out; you die once you
//    are pushed past a death buffer equal to BODY.
//  - Initiative = BODY + Reflex. Players go first unless ambushed.
//  - Turn: 1 offensive + 1 neutral action; 1 defensive reaction when attacked.
//  - Focus = 1 reroll. Stress / Energy / Ascension / Ruin are counters.
// ═══════════════════════════════════════════════════════════════

const PILLARS = ['body', 'mind', 'soul'];
const SKILLS_BY_PILLAR = {
  body: ['force', 'endurance', 'reflex'],
  mind: ['study', 'logic', 'craft'],
  soul: ['will', 'presence', 'empathy'],
};
const ALL_SKILLS = [].concat(...PILLARS.map(p => SKILLS_BY_PILLAR[p]));
const STAT_KEYS = PILLARS.concat(ALL_SKILLS);
const STAT_LABEL = k => k.charAt(0).toUpperCase() + k.slice(1);

// Default "Moves" from the Rule Sheet: [label, statA, statB, group]
const MOVES = [
  ['Strike', 'body', 'force', 'Combat'], ['Aim', 'body', 'logic', 'Combat'],
  ['Block', 'body', 'endurance', 'Combat'], ['Evade', 'body', 'reflex', 'Combat'],
  ['Grapple / Restrain', 'body', 'force', 'Combat'], ['Endure pain / conditions', 'will', 'endurance', 'Combat'],
  ['Act first / avoid ambush', 'body', 'reflex', 'Combat'], ['Break / smash', 'body', 'force', 'Combat'],
  ['Sneak / hide', 'body', 'reflex', 'Movement'], ['Sprint (speed)', 'body', 'reflex', 'Movement'],
  ['Sprint (stamina)', 'body', 'endurance', 'Movement'], ['Climb', 'body', 'force', 'Movement'],
  ['Jump / climb stamina', 'body', 'endurance', 'Movement'],
  ['Persuade / charm', 'soul', 'presence', 'Social'], ['Intimidate', 'soul', 'will', 'Social'],
  ['Lie / bluff', 'presence', 'empathy', 'Social'], ['Read a room', 'soul', 'empathy', 'Social'],
  ['Resist coercion', 'soul', 'will', 'Social'],
  ['Recall lore', 'mind', 'study', 'Knowledge'], ['Solve / deduce', 'mind', 'logic', 'Knowledge'],
  ['Spot clues', 'mind', 'study', 'Knowledge'], ['Track / navigate', 'mind', 'logic', 'Knowledge'],
  ['Craft / repair / alchemy', 'mind', 'craft', 'Knowledge'], ['Pick locks', 'mind', 'craft', 'Knowledge'],
  ['Sense the supernatural', 'soul', 'empathy', 'Knowledge'],
];
const CORE_MOVES = ['Strike', 'Aim', 'Block', 'Evade', 'Sneak / hide', 'Persuade / charm', 'Solve / deduce', 'Recall lore'];

const SEAL_MARKS = [
  { id: 'golden', label: 'Golden', score: 5, hint: 'Exceptional work beyond expectation' },
  { id: 'silver', label: 'Silver', score: 4, hint: 'Strong performance' },
  { id: 'iron', label: 'Iron', score: 3, hint: 'Acceptable result' },
  { id: 'cracked', label: 'Cracked', score: 2, hint: 'Poor judgement or sloppy work' },
  { id: 'broken', label: 'Broken', score: 1, hint: 'Failure or serious misconduct' },
];
const SEAL_KINDS = [
  { id: 'mastery', label: 'Mastery', hint: 'How well the objective was achieved' },
  { id: 'method', label: 'Method', hint: 'How well discipline and training were applied' },
  { id: 'conduct', label: 'Conduct', hint: 'How responsibly they acted / how much chaos they caused' },
];

// ── Stat access ──
function statValue(c, key) {
  key = (key || '').toLowerCase();
  if (PILLARS.includes(key)) return Number(c.pillars?.[key]) || 0;
  if (ALL_SKILLS.includes(key)) return Number(c.skills?.[key]) || 0;
  return 0;
}

function blankPillars() { return { body: 5, mind: 5, soul: 5 }; }
function blankSkills() { return Object.fromEntries(ALL_SKILLS.map(k => [k, 5])); }

// ── Derived values ──
function lifeFormula(c) { return ((statValue(c, 'body') + statValue(c, 'mind') + statValue(c, 'soul')) * 2); }
function lifeMax(c) { return c.lifeOverride ? Number(c.maxLife) || lifeFormula(c) : lifeFormula(c); }
function deathBuffer(c) { return statValue(c, 'body'); }
function initiativeScore(c) { return statValue(c, 'body') + statValue(c, 'reflex'); }

// 'ok' | 'downed' | 'dead'. Life may go negative: the death buffer is how far
// below 0 you can be and still be saved.
function lifeStatus(c) {
  const life = Number(c.life) || 0;
  if (life > 0) return 'ok';
  return life >= -deathBuffer(c) ? 'downed' : 'dead';
}
// Descriptive health band (shown to players for NPCs instead of raw numbers)
function healthBand(c) {
  const st = lifeStatus(c);
  if (st === 'dead') return 'Dead';
  if (st === 'downed') return 'Down';
  const r = (Number(c.life) || 0) / (lifeMax(c) || 1);
  return r > 0.75 ? 'Unhurt' : r > 0.5 ? 'Hurt' : r > 0.25 ? 'Bloodied' : 'Critical';
}

// ── Dice ──
function d20() { return 1 + Math.floor(Math.random() * 20); }
function dN(n) { return 1 + Math.floor(Math.random() * n); }

// Grade a d20 roll against a target number.
//  - 1 is always a critical success, 20 always a critical failure.
//  - Otherwise roll <= TN succeeds. The higher the roll the better, so we
//    compare to the TN capped at 19 (a roll of 19 is the best non-crit result):
//    exactly on the cap = "perfect", within `window` of it = "high".
// `window` is a house-rule setting (state.settings.highWindow).
function gradeRoll(roll, tn, window) {
  window = Number.isFinite(window) ? window : 3;
  if (roll === 1) return { tier: 'crit', grade: 'Critical Success', success: true };
  if (roll === 20) return { tier: 'fumble', grade: 'Critical Failure', success: false };
  if (roll > tn) return { tier: 'fail', grade: 'Failure', success: false };
  const top = Math.min(tn, 19);
  if (roll === top) return { tier: 'perfect', grade: 'Perfect Success', success: true };
  if (roll >= top - window) return { tier: 'high', grade: 'High Success', success: true };
  return { tier: 'success', grade: 'Success', success: true };
}

// Roll pillar + skill (+ modifier to the TN) for a character.
function makeRoll(c, statA, statB, mod, window, label) {
  const base = statValue(c, statA) + (statB ? statValue(c, statB) : 0);
  const tn = base + (Number(mod) || 0);
  const roll = d20();
  return {
    charId: c.id, who: c.name, label: label || '', statA, statB: statB || null,
    base, mod: Number(mod) || 0, tn, roll, ...gradeRoll(roll, tn, window),
  };
}

// Pull "Body + Force" out of free text like "Soul + Presence (Half Damage…)".
const STAT_RE = '(body|mind|soul|force|endurance|reflex|study|logic|craft|will|presence|empathy)';
function parseRoll(text) {
  const m = new RegExp(STAT_RE + '\\s*\\+\\s*' + STAT_RE, 'i').exec(text || '');
  return m ? { a: m[1].toLowerCase(), b: m[2].toLowerCase() } : null;
}

// Turn free-text cooldown/cost into something we can enforce.
//  { rounds, perBattle, perRest, focus, energy, passive, text }
function parseCooldown(text) {
  const t = (text || '').toLowerCase();
  const out = { rounds: 0, perBattle: false, perRest: false, hours: 0, focus: 0, energy: 0, passive: false, text: text || '' };
  if (!t) return out;
  if (/passive/.test(t)) out.passive = true;
  // in-world hours (used by the optional timed cooldowns): "Every 6 hours", "Once per day", "Once per hour"
  const hh = /(\d+)\s*hours?\b/.exec(t);
  out.hours = hh ? Number(hh[1]) : /\b(per|every|once a|once an)\s*(day|24)|\bdaily\b/.test(t) ? 24 : /\b(per|every|an)\s*hour\b/.test(t) ? 1 : 0;
  const r = /(\d+)\s*(?:rounds?|turns?)\b/.exec(t) || /\bcd\s*(\d+)/.exec(t);
  if (r) out.rounds = Number(r[1]);
  else if (/1\s*round/.test(t)) out.rounds = 1;
  if (/(once|1)\s*(per|\/)\s*(battle|combat|scene|fight)|1\/scene|once per (battle|combat|scene)/.test(t)) out.perBattle = true;
  if (/(per|every|\/)\s*(\d+\s*)?(hours?|day|session|rest|24)|once every|per day|per session|per hour/.test(t)) out.perRest = true;
  const f = /spend\s*(\d+)?\s*focus/.exec(t); if (f) out.focus = Number(f[1] || 1);
  const e = /spend\s*(\d+)?\s*energy/.exec(t); if (e) out.energy = Number(e[1] || 1);
  return out;
}

function escapeHtml(s) { return (s ?? '').toString().replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); }
function escapeAttr(s) { return escapeHtml(s); }
function pct(v, max) { if (!max) return 0; return Math.max(0, Math.min(100, Math.round((v / max) * 100))); }

// ── Story status: a tag the GM sets by hand. Separate from the automatic
//    Downed/Dead that LIFE triggers — someone can be Missing or Captured with
//    plenty of LIFE left. ──
const CHAR_STATUSES = ['Alive', 'Injured', 'Missing', 'Captured', 'Dead', 'Unknown'];
function statusClass(s) { return 'status-' + String(s || 'Alive').toLowerCase(); }

// ── Factions: who a character answers to. The main ones from the Empire lore are a dropdown on the
//    sheet; anything else can be added with "Custom…". ──
const FACTION_SUGGESTIONS = ['Midnight Archive', 'Order of the Last Flame', 'The First Mother', 'Wardens of the Wall', 'The Gilded Tide', 'The Three Roots', 'The Imperial Council', 'Faculty'];
