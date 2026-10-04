// ═══════════════════════════════════════════════════════════════
// DEMO MODE — runs entirely without Firebase, so the GM can look at the
// tool and give feedback before setting up a database. State lives in
// localStorage; dbWrite/dbUpdate in state.js branch off to setPath() for this.
//
// Seed data comes from the campaign documents: the real curriculum
// (curriculum-seed.js), loot tables (loot-seed.js), archetypes + mission
// loot (rules-seed.js) and the NPC sheets (Packson, Varn, Aethyrix, Gladius).
// The four PCs' STATS are placeholders until the real sheets are entered.
// ═══════════════════════════════════════════════════════════════

const DEMO_STORAGE_KEY = 'academy_demo_state_v2';

function saveDemoState() { localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state)); }

function loadDemoState() {
  const raw = localStorage.getItem(DEMO_STORAGE_KEY);
  if (!raw) return null;
  try { return normaliseState(JSON.parse(raw)); } catch (e) { return null; }
}

function findBy(list, text) {
  const t = text.toLowerCase();
  return (list || []).find(x => x.name.toLowerCase().includes(t));
}

// A technique defined inline on a character (NPC sheets list their own).
function tech(name, origin, cd, lvl, roll, effect) {
  return { id: 'tq_' + uid(), name, origin, cooldownCost: cd, levelRequirement: lvl || 0, roll: roll || '', effect };
}
function invItem(name, type, rarity, effect, description) {
  return { id: uid(), name, type, rarity, effect: effect || '', description: description || '' };
}

function seedLibrary() {
  const lib = { talents: {}, skills: {}, professors: {}, clubs: {}, archetypes: {}, items: {} };
  if (typeof CURRICULUM_SEED !== 'undefined') {
    CURRICULUM_SEED.talents.forEach(t => { lib.talents[t.id] = t; });
    CURRICULUM_SEED.skills.forEach(s => { lib.skills[s.id] = s; });
    CURRICULUM_SEED.professors.forEach(p => { lib.professors[p.id] = p; });
    CURRICULUM_SEED.clubs.forEach(c => { lib.clubs[c.id] = c; });
  }
  ARCHETYPES_SEED.forEach(a => { lib.archetypes[a.id] = a; });
  MAGIC_SEED.skills.forEach(s => { lib.skills[s.id] = s; });
  MAGIC_SEED.talents.forEach(t => { lib.talents[t.id] = t; });
  LOOT_SEED.concat(MISSION_LOOT_SEED).forEach(i => { lib.items[i.id] = i; });
  return lib;
}

function seedDemoState() {
  const lib = seedLibrary();
  const P = Object.values(lib.professors), C = Object.values(lib.clubs), T = Object.values(lib.talents), S = Object.values(lib.skills);
  const ids = list => list.filter(Boolean).map(x => x.id);

  const ironwell = findBy(P, 'Ironwell'), vale = findBy(P, 'Vale'), ash = findBy(P, 'Ash');
  const prefects = findBy(C, 'Prefect'), bookworm = findBy(C, 'Bookworm'), craft = findBy(C, 'Ritual & Craft') || findBy(C, 'Craft');
  const murder = findBy(C, 'Murder'), dueling = findBy(C, 'Dueling'), dungeonball = findBy(C, 'Dungeonball');
  const rank = (t) => (t ? { [t.id]: 1 } : {});

  const mk = (o) => normaliseCharacter({
    id: uid(), isNPC: false, year: 1, level: 2, focus: 1, energy: 5, stress: 0, ascension: 0, ruin: 0, detention: 0,
    professorIds: [], clubIds: [], skillIds: [], unlockedIds: [], talentRanks: {}, techniques: {}, inventory: {},
    notes: '', gmNotes: '', pin: '', ...o,
  });
  const withLife = c => { c.life = lifeMax(c); return c; };
  const inv = (...items) => Object.fromEntries(items.map(i => [i.id, i]));
  const techs = (...ts) => Object.fromEntries(ts.map(t => [t.id, t]));
  const PLACEHOLDER = 'PLACEHOLDER STATS — replace with the real sheet.';

  const lucien = withLife(mk({
    name: 'Lucien', player: 'Mirko', pin: '1111',
    pillars: { body: 6, mind: 8, soul: 7 },
    skills: { force: 5, endurance: 5, reflex: 6, study: 8, logic: 7, craft: 5, will: 6, presence: 7, empathy: 6 },
    professorIds: ids([ash]), clubIds: ids([prefects, bookworm]), talentRanks: rank(findBy(T, 'Close Combat')),
    inventory: inv(invItem('Prefect Badge', 'Wearable', 'Common', 'Social leverage + limited access to staff corridors.')),
    notes: 'Illegitimate twin (2 minutes older than Dani). Separated at age 10; both believe the other is dead. Wants to prove himself to his adoptive father. Woke up on day one with a bloody knife.',
    gmNotes: PLACEHOLDER + ' Starting option: +1 Ruin or +1 Ascension (player choice) - not yet chosen.',
  }));
  const drusilla = withLife(mk({
    name: 'Drusilla', player: 'Dani', pin: '2222',
    pillars: { body: 4, mind: 7, soul: 9 },
    skills: { force: 3, endurance: 4, reflex: 5, study: 7, logic: 6, craft: 8, will: 9, presence: 7, empathy: 6 },
    professorIds: ids([ash]), clubIds: ids([murder, craft]), talentRanks: rank(findBy(T, 'Nerves of Steel')),
    inventory: inv(invItem('Runebound Tinker’s Hammer', 'Weapon', 'Rare', MISSION_LOOT_SEED[0].effect, MISSION_LOOT_SEED[0].description)),
    notes: '"Sister Dani of the Cross" - raised in a convent; the church considers her its best shot at the Chosen One. Contract tattoo on the forearm.',
    gmNotes: PLACEHOLDER,
  }));
  const fad = withLife(mk({
    name: 'Thad', player: 'Henry', pin: '3333', detention: 1,
    pillars: { body: 9, mind: 5, soul: 6 },
    skills: { force: 8, endurance: 7, reflex: 6, study: 4, logic: 5, craft: 4, will: 6, presence: 7, empathy: 3 },
    professorIds: ids([ironwell]), clubIds: ids([dueling, dungeonball]), talentRanks: rank(findBy(T, 'Backstabber')),
    skillIds: ids([findBy(S, 'Cleaving Arc')]),
    inventory: inv(invItem('Ranked Blade', 'Weapon', 'Common', 'Tournament-grade duelling weapon from the Dueling Society.')),
    notes: 'Rich, spoiled dwarf who feels the Chosen title is his by right. Sealed envelope in his own handwriting: "OPEN WHEN THEY LIE."',
    gmNotes: PLACEHOLDER + ' Detention hours are a guess (Conduct seal 2/5).',
  }));
  const dalton = withLife(mk({
    name: 'Dalton', player: 'Bex', pin: '4444',
    pillars: { body: 8, mind: 6, soul: 6 },
    skills: { force: 6, endurance: 8, reflex: 7, study: 5, logic: 5, craft: 5, will: 6, presence: 5, empathy: 6 },
    professorIds: ids([ironwell]), clubIds: ids([dungeonball, dueling]),
    skillIds: ids([findBy(S, 'Iron Guard')]),
    inventory: inv(
      invItem('Flute of the First Note', 'Artifact', 'Rare', MISSION_LOOT_SEED[1].effect, MISSION_LOOT_SEED[1].description),
      invItem('Ember of the Bound Dawn', 'Wearable', 'Epic', MISSION_LOOT_SEED[4].effect, MISSION_LOOT_SEED[4].description)),
    notes: 'Got in through a scandalous back door (father is the janitor). Raised near Dani’s convent. Companion: Winter, a white, bushy, light-blue-eyed cat-like creature that only follows Dalton.',
    gmNotes: PLACEHOLDER,
  }));
  lucien.inventory = { ...lucien.inventory, ...inv(invItem('Staff of Lingering Seconds', 'Weapon', 'Rare', MISSION_LOOT_SEED[2].effect, MISSION_LOOT_SEED[2].description)) };

  // ── NPCs from the campaign docs (real stats where the docs give them) ──
  const packson = withLife(mk({
    name: 'Packson', isNPC: true, year: 2, level: 2, player: '',
    pillars: { body: 4, mind: 10, soul: 5 },
    skills: { force: 4, endurance: 5, reflex: 7, study: 12, logic: 9, craft: 6, will: 8, presence: 5, empathy: 4 },
    professorIds: ids([vale]), clubIds: ids([bookworm]),
    techniques: techs(
      tech('Hijack Pattern', 'Independent Study', 'CD 2', 2, 'Mind + Study', 'Observe a target for 1 round; on your next turn force them to reroll one successful action. If the reroll fails, gain +2 on your next roll against them.'),
      tech('Displacement Trick', 'Practical Theory', 'CD 3', 2, 'Mind + Reflex', 'Swap positions with an ally or unattended object within 10m; leaves an afterimage for 1 round (attacks against it suffer -2).'),
      tech('Prepared Contingency', 'Fieldcraft', '1/scene (CD 4)', 2, 'Mind + Study', 'Declare prior preparation: smoke (obscure 1 round), flash (-2 next roll), tripline (first entrant prone), or inversion rune (halve one magical damage instance).'),
      tech('Lecture in Motion', 'Academic Combat', 'CD 2', 2, 'Mind + Presence', 'After an enemy acts, identify a flaw; one ally gains +3 against them. If the ally succeeds, reduce this cooldown by 1.'),
      tech('Counter-Curse Sketch', 'Runic Theory', 'Reaction (CD 3)', 3, 'Mind + Study', 'When a magical/time effect triggers, reduce its effect by 50% or delay it until end of round.'),
      tech('Last Laugh Protocol', 'Improvised Defense', '1/scene', 2, 'Mind + Reflex', 'When reduced to very low health: enemy loses next action, OR create 3m smoke + move freely, OR flash (adjacent enemies have disadvantage next roll).')),
    notes: 'Year 2 star student of Prof. Vale. Brown messy hair, sharp green-brown eyes, ink-stained fingers. Famous for pranks; deeply loyal.',
    gmNotes: 'Real sheet (Packson Character Sheet.docx).',
  }));
  const varn = withLife(mk({
    name: 'Archivist Varn', isNPC: true, year: 0, level: 10, player: '', faction: 'Midnight Archive',
    pillars: { body: 9, mind: 8, soul: 10 },
    skills: { force: 8, endurance: 7, reflex: 6, study: 9, logic: 8, craft: 7, will: 10, presence: 9, empathy: 6 },
    techniques: techs(
      tech('Invert Gravity', '', '', 0, '', ''), tech('Psychosmoke', '', '', 0, '', ''), tech('Bone Marionette', '', '', 0, '', ''),
      tech('Name the Weakness', '', '', 0, '', ''),
      tech('Walk Through Hell and Back', '', '', 0, '', 'Reappear anywhere on the battlefield. Everything in a small radius on arrival takes damage.'),
      tech('Erase the Boundary', '', '', 0, '', 'You can walk through walls.'),
      tech('The Debt Comes Due', '', 'Passive', 0, '', 'Every time you use a demonic ability, gain one Stress. At 6 Stress a small demon spawns.')),
    inventory: inv(
      invItem('Momentrings (x2)', 'Wearable', 'Epic', 'Take an additional action point of your choice once per battle.'),
      invItem('The Spine of Records', 'Weapon', 'Epic', 'Whenever Varn witnesses a unique action (spell, attack, ability) he may replicate it once later in the fight (same roll, same effect).'),
      invItem('Rootbound Robe', 'Wearable', 'Epic', 'If Varn stands still for a full round: +5 to all rolls next round and heal 5 HP.'),
      invItem('The Second Body (hidden)', 'Artifact', 'Epic', 'Once per battle, 2 rounds of "true form": use Body instead of Soul for all rolls, massive resistance, melee deals heavy damage. Afterwards gain 2 Stress.')),
    notes: 'Leader of the Midnight Archive. Looks like a frail old wizard; secretly ripped, with a hidden second pair of demonic arms. Believes the world should be left to heal.',
    gmNotes: 'Sheet lists "Life: 27" but (9+8+10)x2 = 54. Using the formula - confirm. Talent: Rigid Mind (cannot be fully controlled; suffers -3 instead). Several items marked NEEDS WORK in the doc.',
  }));
  const aethyrix = withLife(mk({
    name: 'Aethyrix, the Unmoored', isNPC: true, year: 0, level: 10, player: '',
    pillars: { body: 9, mind: 8, soul: 10 },
    skills: { force: 8, endurance: 7, reflex: 9, study: 12, logic: 7, craft: 5, will: 10, presence: 8, empathy: 3 },
    techniques: techs(
      tech('Temporal Rend', 'Demonic Force', 'CD 2', 10, 'Body + Force', 'A heavy strike that fractures the air. Moderate damage. High success: target -2 on their next roll (temporal lag).'),
      tech('Echoed Assault', 'Fractured Momentum', 'CD 3', 10, 'Body + Reflex', 'Strike twice in rapid succession; the second deals minor damage. High success: target must roll or fall prone.'),
      tech('Shatter the Moment', 'Chronal Disruption', 'CD 4', 11, 'Soul + Will', 'Target within 12m loses their next reaction. High success: also -2 on their next action.'),
      tech('Unstable Pulse', 'Bound Cataclysm', 'CD 4', 11, 'Soul + Presence', '4m radius burst: minor damage to all in range. High success: push all targets 2m back.'),
      tech('Fragmented Existence', 'Demonic Trait', 'Passive', 10, '', 'The first failed roll each round may be rerolled. Must take the second result.'),
      tech('Phase Fracture', 'Temporal Overload', 'Trigger at 50% Life', 0, 'Soul + Will', 'All players roll Soul + Will; on failure -1 to all rolls for 1 round. Aethyrix gains +2 Reflex for the rest of combat.'),
      tech('Final Collapse', 'Redemption Window', 'Trigger at 25% Life', 0, 'Soul + Empathy', 'If players try to reach him, group check. Success: combat ends without death. Failure: Aethyrix gains +2 Force and fights on.'),
      tech('Call of the Fracture', 'Optional Boss Ability', 'CD 4', 0, 'Soul + Will', 'Summon 1d2 Temporal Shades OR 1 Echoed Villager.')),
    notes: 'Time-bound demon, elongated and slightly wrong; speech echoes. Not pure malice - exhausted. Redeemable boss of "The Village That Dreams Tomorrow".',
    gmNotes: 'Real sheet (Final Boss Character Sheet.docx). Weapon: Chrono-Sunder Claw (Body + Force, high damage; high success Temporal Lag -2; crit: movement 0 next turn).',
  }));
  const gladius = withLife(mk({
    name: 'Gladius Solo', isNPC: true, year: 0, level: 15, player: '', focus: 3,
    pillars: { body: 12, mind: 10, soul: 12 },
    skills: { force: 11, endurance: 12, reflex: 10, study: 8, logic: 8, craft: 6, will: 12, presence: 10, empathy: 9 },
    techniques: techs(
      tech('Shield of Mercy', 'Skill', '2 turns', 0, 'Body + Reflex', 'Intercept an attack aimed at an ally within close range. Reduce damage heavily, or negate it on a strong success. A full block allows an immediate shield bash.'),
      tech('Blade of the First Age', 'Skill', '1 turn', 0, 'Body + Force', 'A clean, devastating strike: 5x heavy damage to one target. If he rolled much higher he may force them back, disarm them, or break their stance.'),
      tech('Ashen Return', 'Talent', 'Once per battle', 0, 'Soul + Endurance', 'If reduced to 0 health he remains standing at 20 HP and may take one action. On a very strong success he restores a chunk of health instead.'),
      tech('Last Dawn Counter', 'Talent', '2 turns', 10, 'Body + Reflex', 'When targeted by a melee attack: on success negate it and deal strong retaliation; very strong success may also stun, disarm or knock prone.'),
      tech('Final Oath', 'Talent', 'Once per battle', 15, 'Body + Soul + Will', 'Swear to protect, endure or defeat a chosen target: cannot be frightened, broken or compelled away; major bonus against enemies in the way.')),
    notes: 'One of the oldest living beings; survivor of the first apocalypse; touched the Elder Soul. Compassionate, honourable, unyielding. Legendary: 2 actions per turn in serious fights; impossible to intimidate.',
    gmNotes: 'Stats are PLACEHOLDERS - the doc gives none. Techniques are from Gladius Solo.docx.',
  }));

  // Varn's people at the Midnight Archive. Details beyond the name are not written down yet.
  const november = withLife(mk({ name: 'Princess November', isNPC: true, year: 0, level: 1, player: '', faction: 'Midnight Archive',
    notes: 'Archivist Varn’s assistant. Killed Ser Caldus on Varn’s order (The Teacher Beyond the Wall).', gmNotes: 'Stats are PLACEHOLDERS - the docs give none. Doc spelling: "Princerss November Forna".' }));
  const march = withLife(mk({ name: 'Matriarch March', isNPC: true, year: 0, level: 1, player: '', faction: 'Midnight Archive',
    notes: '', gmNotes: 'No details written down yet. Stats are PLACEHOLDERS.' }));
  const sola = withLife(mk({ name: 'Headmistress Sola Occasio', isNPC: true, year: 0, level: 1, player: '', faction: 'Faculty',
    notes: 'Head of the Universitas Aeterna Selectorum. Leapt from the main tower at the opening and unfurled massive wings from her back. "You are the chosen few… there can only be one chosen in the end."', gmNotes: 'Stats are PLACEHOLDERS - the documents give none.' }));
  // which magic schools each PC has (decides which magic techniques/talents they can ever see)
  lucien.schools = ['Curseancy', 'Psychomancy']; dalton.schools = ['Animancy']; drusilla.schools = ['Sunmancy']; fad.schools = ['Demonancy'];
  const characters = Object.fromEntries([lucien, drusilla, fad, dalton, packson, varn, aethyrix, gladius, november, march, sola].map(c => [c.id, c]));

  // Mission 1 seals (Back to School 2.docx). Marks are n/5.
  const byChar = Object.fromEntries(Object.values(characters).map(c => [c.name, c.id]));
  const markOf = n => SEAL_MARKS.find(m => m.score === n).id;
  const seals = {};
  Object.entries(LEDGER_MISSION_1.grades).forEach(([name, g]) => {
    seals[byChar[name]] = { mastery: markOf(g[0]), method: markOf(g[1]), conduct: markOf(g[2]) };
  });
  const missionId = uid();

  return normaliseState({
    campaignName: 'The Last Curriculum (Demo)',
    settings: { highWindow: 3 },
    characters, ...lib,
    missions: { [missionId]: { id: missionId, name: LEDGER_MISSION_1.name, notes: LEDGER_MISSION_1.notes, order: 1, seals } },
    combat: blankCombat(),
  });
}

function resetDemoState() {
  if (!confirm('Reset the demo to its starting data? Everything you changed will be lost.')) return;
  state = seedDemoState();
  saveDemoState();
  scheduleRender();
  showToast('Demo reset.');
}

function startDemoMode(role, charName) {
  demoMode = true;
  let saved = loadDemoState();
  if (!saved) { saved = seedDemoState(); localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(saved)); }
  state = saved;
  if (role === 'gm') {
    session = { role: 'gm', charId: null };
  } else {
    const pcs = Object.values(state.characters).filter(c => !c.isNPC);
    const pc = pcs.find(c => c.name === charName) || pcs[0];
    session = { role: 'player', charId: pc ? pc.id : null };
  }
  showApp();
  renderAll();
}

function exitDemoMode() {
  demoMode = false;
  session = { role: null, charId: null };
  showLoginScreen();
}
