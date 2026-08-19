// ═══════════════════════════════════════════════════════════════
// DEMO-MODUS — komplett ohne Firebase, damit der GM sich das Tool
// anschauen und Feedback geben kann, bevor er seine eigene Datenbank
// eingerichtet hat. Schreibt/liest nur lokal (localStorage), dbWrite/
// dbUpdate in state.js zweigen dafür einfach auf setPath() ab.
// ═══════════════════════════════════════════════════════════════

const DEMO_STORAGE_KEY = 'academy_demo_state';

function saveDemoState() {
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state));
}

function loadDemoState() {
  const raw = localStorage.getItem(DEMO_STORAGE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (e) { return null; }
}

// Demo lädt direkt die echten Regelwerk-Daten (CURRICULUM_SEED aus
// curriculum-seed.js, 1:1 aus der DM-Excel importiert) statt erfundener
// Platzhalter-Inhalte — der DM soll seine eigenen Talente/Skills/
// Professoren/Clubs sofort korrekt eingebunden sehen, inkl. der vier
// echten Spielercharaktere mit ihren tatsächlichen Club-Mitgliedschaften.
function byName(list, name) { return list.find(x => x.name.toLowerCase().includes(name.toLowerCase())); }

function seedDemoState() {
  const hasCurriculum = typeof CURRICULUM_SEED !== 'undefined';
  const talents = {}, skills = {}, professors = {}, clubs = {};
  if (hasCurriculum) {
    CURRICULUM_SEED.talents.forEach(t => { talents[t.id] = t; });
    CURRICULUM_SEED.skills.forEach(s => { skills[s.id] = s; });
    CURRICULUM_SEED.professors.forEach(p => { professors[p.id] = p; });
    CURRICULUM_SEED.clubs.forEach(c => { clubs[c.id] = c; });
  }

  const ironwell = hasCurriculum ? byName(CURRICULUM_SEED.professors, 'Ironwell') : null;
  const vale = hasCurriculum ? byName(CURRICULUM_SEED.professors, 'Vale') : null;
  const prefectCorps = hasCurriculum ? byName(CURRICULUM_SEED.clubs, 'Prefect Corps') : null;
  const bookwormClub = hasCurriculum ? byName(CURRICULUM_SEED.clubs, 'Bookworm Club') : null;
  const ritualCraft = hasCurriculum ? byName(CURRICULUM_SEED.clubs, 'Ritual & Craft') : null;
  const murderClub = hasCurriculum ? byName(CURRICULUM_SEED.clubs, 'Murder Club') : null;
  const duelingSociety = hasCurriculum ? byName(CURRICULUM_SEED.clubs, 'Dueling Society') : null;
  const dungeonball = hasCurriculum ? byName(CURRICULUM_SEED.clubs, 'Dungeonball') : null;
  const closeCombat = hasCurriculum ? byName(CURRICULUM_SEED.talents, 'Close Combat') : null;
  const backstabber = hasCurriculum ? byName(CURRICULUM_SEED.talents, 'Backstabber') : null;
  const nervesOfSteel = hasCurriculum ? byName(CURRICULUM_SEED.talents, 'Nerves of Steel') : null;
  const cleavingArc = hasCurriculum ? byName(CURRICULUM_SEED.skills, 'Cleaving Arc') : null;
  const ironGuard = hasCurriculum ? byName(CURRICULUM_SEED.skills, 'Iron Guard') : null;

  const charLucien = uid(), charDrusilla = uid(), charFad = uid(), charDalton = uid();

  const characters = {
    [charLucien]: {
      id: charLucien, name: 'Mirko "Lucien" —', isNPC: false, level: 3,
      hp: 22, maxHp: 22, mana: 8, maxMana: 8,
      stats: [{ key: 'BODY', value: '11' }, { key: 'MIND', value: '13' }, { key: 'SOUL', value: '10' }],
      professorIds: [ironwell, vale].filter(Boolean).map(p => p.id),
      clubIds: [prefectCorps, bookwormClub].filter(Boolean).map(c => c.id),
      talentRanks: closeCombat ? { [closeCombat.id]: 1 } : {},
      skillIds: [], unlockedIds: [],
      inventory: [{ id: uid(), name: 'Prefect-Abzeichen', description: 'Soziale Hebelwirkung + begrenzter Zugang zu Personal-Korridoren.' }],
      abilitiesNotes: 'Illegitimer Zwilling (2 Minuten älter als Dani). Von ihr getrennt seit dem 10. Lebensjahr, beide glauben den anderen tot. Will sich vor allem seinem Adoptivvater beweisen.',
      pin: '1111',
    },
    [charDrusilla]: {
      id: charDrusilla, name: 'Dani "Drusilla" —', isNPC: false, level: 3,
      hp: 18, maxHp: 18, mana: 12, maxMana: 12,
      stats: [{ key: 'BODY', value: '9' }, { key: 'MIND', value: '12' }, { key: 'SOUL', value: '15' }],
      professorIds: [vale].filter(Boolean).map(p => p.id),
      clubIds: [ritualCraft, murderClub].filter(Boolean).map(c => c.id),
      talentRanks: nervesOfSteel ? { [nervesOfSteel.id]: 1 } : {},
      skillIds: [], unlockedIds: [],
      inventory: [{ id: uid(), name: 'Persönliches Ritual-Kit', description: 'Werkzeug für Wards, Alchemie, kleinere gefährliche Experimente.' }],
      abilitiesNotes: '"Sister Dani of the Cross" — religiöse Fanatikerin, im Kloster aufgewachsen. Die Kirche hält sie für eine Top-Kandidatin für "die Erwählte".',
      pin: '2222',
    },
    [charFad]: {
      id: charFad, name: 'Henry "Fad" —', isNPC: false, level: 2,
      hp: 28, maxHp: 28, mana: 4, maxMana: 4,
      stats: [{ key: 'BODY', value: '15' }, { key: 'MIND', value: '9' }, { key: 'SOUL', value: '11' }],
      professorIds: [ironwell].filter(Boolean).map(p => p.id),
      clubIds: [duelingSociety, dungeonball].filter(Boolean).map(c => c.id),
      talentRanks: backstabber ? { [backstabber.id]: 1 } : {},
      skillIds: cleavingArc ? [cleavingArc.id] : [], unlockedIds: [],
      inventory: [{ id: uid(), name: 'Ranglisten-Klinge', description: 'Turniertaugliche Duellwaffe aus der Dueling Society.' }],
      abilitiesNotes: 'Ein versiegelter Brief in eigener Handschrift: "OPEN WHEN THEY LIE." Adressiert an sich selbst — Inhalt bisher unbekannt.',
      pin: '3333',
    },
    [charDalton]: {
      id: charDalton, name: 'Bex "Dalton" —', isNPC: false, level: 2,
      hp: 24, maxHp: 24, mana: 6, maxMana: 6,
      stats: [{ key: 'BODY', value: '13' }, { key: 'MIND', value: '10' }, { key: 'SOUL', value: '12' }],
      professorIds: [ironwell].filter(Boolean).map(p => p.id),
      clubIds: [dungeonball].filter(Boolean).map(c => c.id),
      talentRanks: {},
      skillIds: ironGuard ? [ironGuard.id] : [], unlockedIds: [],
      inventory: [{ id: uid(), name: 'Winter', description: 'Uncanny-smart weißes Katzenwesen mit hellblauen Augen. Folgt nur Dalton, kann einmal pro Sitzung etwas Kleines holen/stibitzen.' }],
      abilitiesNotes: 'Ein Fänger beim Dungeonball. Das Katzenwesen "Winter" saß eines Morgens einfach mit einem Namensschild auf ihrer Brust.',
      pin: '4444',
    },
  };

  return {
    campaignName: 'The Last Curriculum (Demo)',
    gmPin: null,
    characters, professors, clubs, talents, skills,
    combat: { active: false, round: 1, currentTurn: 0, order: [] },
  };
}

function resetDemoState() {
  const fresh = seedDemoState();
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(fresh));
  state = fresh;
  renderAll();
  showToast('Demo zurückgesetzt.');
}

function startDemoMode(role) {
  demoMode = true;
  let saved = loadDemoState();
  if (!saved) {
    saved = seedDemoState();
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(saved));
  }
  state = saved;
  if (role === 'gm') {
    session = { role: 'gm', charId: null };
  } else {
    const firstPC = Object.values(state.characters).find(c => !c.isNPC);
    session = { role: 'player', charId: firstPC ? firstPC.id : null };
  }
  showApp();
  renderAll();
}

function exitDemoMode() {
  demoMode = false;
  session = { role: null, charId: null };
  showLoginScreen();
}
