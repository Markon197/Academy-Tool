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

function seedDemoState() {
  const teacherAurelia = uid(), teacherDoran = uid(), teacherFenwick = uid();
  const tGeneral1 = uid(), tGeneral2 = uid(), tGeneral3 = uid();
  const tBlitzruf = uid(), tSturmschild = uid(), tRunenschmiede = uid(), tSchattenschritt = uid();
  const charLyra = uid(), charBram = uid(), charGrimhorn = uid(), charVex = uid();

  const teachers = {
    [teacherAurelia]: { id: teacherAurelia, name: 'Meisterin Aurelia Sturmwind', description: 'Lehrmeisterin der Sturm- und Wettermagie. Streng, aber gerecht — Prüfungen finden gerne mitten in echten Unwettern statt.' },
    [teacherDoran]: { id: teacherDoran, name: 'Altmeister Doran Eisenbart', description: 'Schmiedekunst und Runenzauber. Redet mehr mit seinem Amboss als mit Schülern.' },
    [teacherFenwick]: { id: teacherFenwick, name: 'Fenwick Nachtschatten', description: 'Heimlichkeit, Giftkunde und "praktische Überzeugungskunst". Niemand weiß, wo sein Büro eigentlich ist.' },
  };

  const talents = {
    [tGeneral1]: { id: tGeneral1, name: 'Arkane Grundlagen', description: 'Grundlegendes Verständnis arkaner Energien. +1 auf alle Zauberproben.', category: 'general', levelRequirement: 1 },
    [tGeneral2]: { id: tGeneral2, name: 'Zähes Fell', description: 'Jahre an Prügeleien und Trainingsunfällen haben ihre Spuren hinterlassen — im positiven Sinne. +5 maximale HP.', category: 'general', levelRequirement: 1 },
    [tGeneral3]: { id: tGeneral3, name: 'Schnelle Reflexe', description: 'Reagiert schneller als der Verstand hinterherkommt. Zählt in der Initiative immer als einen Punkt höher gewürfelt.', category: 'general', levelRequirement: 3 },
    [tBlitzruf]: { id: tBlitzruf, name: 'Blitzruf', description: 'Ruft einen Blitz vom Himmel herab. Nur lehrbar, wenn die Schülerin während eines echten Sturms geprüft wurde.', category: 'teacher', teacherId: teacherAurelia },
    [tSturmschild]: { id: tSturmschild, name: 'Sturmschild', description: 'Eine Wind-Barriere blockt Fernkampfangriffe für 1 Runde.', category: 'teacher', teacherId: teacherAurelia },
    [tRunenschmiede]: { id: tRunenschmiede, name: 'Runenschmiede', description: 'Kann eine Waffe dauerhaft mit einer einfachen Rune verzaubern (z.B. Schärfe, Leichtigkeit).', category: 'teacher', teacherId: teacherDoran },
    [tSchattenschritt]: { id: tSchattenschritt, name: 'Schattenschritt', description: 'Wird für 1 Runde unsichtbar, solange sie sich im Schatten oder Dunkeln befindet.', category: 'teacher', teacherId: teacherFenwick },
  };

  const characters = {
    [charLyra]: {
      id: charLyra, name: 'Lyra Sonnenschmied', isNPC: false, level: 3,
      hp: 20, maxHp: 24, mana: 9, maxMana: 12,
      stats: [{ key: 'Stärke', value: '10' }, { key: 'Geschick', value: '14' }, { key: 'Intelligenz', value: '16' }, { key: 'Willenskraft', value: '13' }],
      teacherIds: [teacherAurelia, teacherDoran],
      talentIds: [tGeneral1],
      unlockedTeacherTalentIds: [tBlitzruf],
      inventory: [
        { id: uid(), name: 'Sturmrufer-Stab', description: 'Ein schlanker Eschenstab mit eingelassenem Blitzquarz. Kanalisiert Wettermagie deutlich zuverlässiger.' },
        { id: uid(), name: 'Gewebter Reiseumhang', description: 'Wasserabweisend, mit versteckten Innentaschen.' },
      ],
      abilitiesNotes: 'Kann einmal pro Tag einen kleinen Windstoß erzeugen, der Kerzen löscht oder leichte Gegenstände umwirft — reiner Fluff, kein Kampfeffekt.',
      pin: '1234',
    },
    [charBram]: {
      id: charBram, name: 'Bram Eichenschild', isNPC: false, level: 2,
      hp: 32, maxHp: 32, mana: 4, maxMana: 4,
      stats: [{ key: 'Stärke', value: '16' }, { key: 'Konstitution', value: '15' }, { key: 'Geschick', value: '9' }],
      teacherIds: [teacherDoran, teacherFenwick],
      talentIds: [tGeneral2],
      unlockedTeacherTalentIds: [],
      inventory: [
        { id: uid(), name: 'Eichenschild, runenverstärkt', description: 'Von Altmeister Doran persönlich mit einer Härte-Rune versehen.' },
        { id: uid(), name: 'Kurzschwert "Nagezahn"', description: 'Nichts Besonderes, aber gut gepflegt.' },
      ],
      abilitiesNotes: 'Ausgebildeter Schildkämpfer — im echten Regelwerk später mit Block-Boni hinterlegt.',
      pin: '5678',
    },
    [charGrimhorn]: {
      id: charGrimhorn, name: 'Grimhorn der Ödlandtroll', isNPC: true, level: 5,
      hp: 28, maxHp: 40, mana: 0, maxMana: 0,
      stats: [{ key: 'Rüstung', value: 'schwer, vernarbte Trollhaut' }],
      teacherIds: [], talentIds: [], unlockedTeacherTalentIds: [],
      inventory: [{ id: uid(), name: 'Ödland-Kriegskeule', description: 'Roh, riesig, effektiv. Verursacht bei einem kritischen Treffer einen Stun-Effekt für 1 Runde.' }],
      abilitiesNotes: 'Regeneriert 5 HP pro Runde, solange er in dieser Runde keinen Feuerschaden erlitten hat.',
      pin: '',
    },
    [charVex]: {
      id: charVex, name: 'Schattenläufer Vex', isNPC: true, level: 4,
      hp: 18, maxHp: 18, mana: 6, maxMana: 6,
      stats: [{ key: 'Tarnung', value: 'sehr hoch' }, { key: 'Geschick', value: '18' }],
      teacherIds: [], talentIds: [], unlockedTeacherTalentIds: [],
      inventory: [{ id: uid(), name: 'Vergiftete Zwillingsdolche', description: 'Getroffene müssen eine Konstitutionsprobe bestehen oder sind für 2 Runden vergiftet.' }],
      abilitiesNotes: 'Kann sich einmal pro Kampf für eine Runde vollständig unsichtbar machen.',
      pin: '',
    },
  };

  return {
    campaignName: 'Die Akademie von Ashveil (Demo)',
    gmPin: null,
    characters, teachers, talents,
    combat: { active: true, round: 2, currentTurn: 1, order: [charBram, charGrimhorn, charLyra] },
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
