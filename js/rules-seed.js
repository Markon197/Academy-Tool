// ═══════════════════════════════════════════════════════════════
// RULES SEED — content from the campaign documents that isn't in the
// curriculum spreadsheet: Archetypes ("The Archetype List.docx") and the
// mission loot found so far ("Items.docx", "TLC Items.xlsx").
// ═══════════════════════════════════════════════════════════════

const ARCHETYPES_SEED = [
  { id: 'arch_1', name: 'The Prodigy', tagline: 'You were chosen early.', talent: 'Ahead of the Curve', advantage: 'Once per session, treat one Study or Logic roll as if you had spent 1 Focus (without spending it).', condition: 'Crushing Expectations', conditionText: '' },
  { id: 'arch_2', name: 'The Survivor', tagline: 'You weren’t meant to be here.', talent: 'Hard to Kill', advantage: 'The first time per session you would mark an Injury, ignore it.', condition: 'Hypervigilant', conditionText: '' },
  { id: 'arch_3', name: 'The Devout', tagline: 'You believe this has meaning.', talent: 'Steadfast Faith', advantage: 'Once per session, you may reroll a Will test.', condition: 'Dogmatic', conditionText: 'When asked to compromise your beliefs, gain +1 Ruin or +1 Stress (your choice).' },
  { id: 'arch_4', name: 'The Rival', tagline: 'You must be better than someone.', talent: 'Competitive Edge', advantage: 'When directly outperforming another student, gain +1 on the roll.', condition: 'Obsession', conditionText: '' },
  { id: 'arch_5', name: 'The Scholar', tagline: 'Knowledge is survival.', talent: 'Prepared Mind', advantage: 'Once per mission, ask the GM one factual question about the environment or exam rules.', condition: 'Overthinking', conditionText: '' },
  { id: 'arch_6', name: 'The Outcast', tagline: 'You don’t belong here.', talent: 'Unnoticed', advantage: 'Gain +1 on Skulk when moving alone.', condition: 'Distrusted', conditionText: '' },
  { id: 'arch_7', name: 'The Scion', tagline: 'Your name opens doors.', talent: 'Institutional Favour', advantage: 'Once per session, downgrade a disciplinary consequence.', condition: 'Entitled', conditionText: '' },
  { id: 'arch_8', name: 'The Rebel', tagline: 'Rules are just another test.', talent: 'Break the System', advantage: 'Once per session, ignore one rule or restriction for a single action.', condition: 'Defiant', conditionText: '' },
  { id: 'arch_9', name: 'The Caretaker', tagline: 'You keep others alive.', talent: 'Steady Hands', advantage: 'When assisting another student, they gain +2 on their roll.', condition: 'Self-Neglect', conditionText: '' },
  { id: 'arch_10', name: 'The Late Bloomer', tagline: 'You’re still becoming.', talent: 'Sudden Insight', advantage: 'Once per session after failing a roll, you may immediately retry with +1.', condition: 'Insecure', conditionText: '' },
  { id: 'arch_11', name: 'The Bully', tagline: 'Fear works.', talent: 'Intimidating Presence', advantage: 'Gain +1 on Intimidation rolls made to threaten, pressure, or dominate.', condition: 'Mean Streak', conditionText: 'When a situation could be resolved peacefully but you escalate, gain +1 Stress.' },
  { id: 'arch_12', name: 'The Nerd', tagline: 'You actually studied.', talent: 'Encyclopedic Memory', advantage: 'Once per session, automatically succeed on a basic Study check.', condition: 'Socially Awkward', conditionText: '' },
  { id: 'arch_13', name: 'The Class Clown', tagline: 'If they’re laughing, they’re not afraid.', talent: 'Comic Relief', advantage: 'Once per session, reduce another student’s Stress by 1 through humour.', condition: 'Never Serious', conditionText: '' },
  { id: 'arch_14', name: 'The Athlete', tagline: 'Body first, questions later.', talent: 'Peak Condition', advantage: 'Once per mission, ignore a stress affliction.', condition: 'Overconfidence', conditionText: '' },
  { id: 'arch_15', name: 'The Teacher’s Pet', tagline: 'I follow the rules.', talent: 'Model Student', advantage: 'Gain +1 on rolls when staff supervision is present.', condition: 'Naïve', conditionText: '' },
  { id: 'arch_16', name: 'The Loner', tagline: 'I work better alone.', talent: 'Self-Reliant', advantage: 'Gain +1 on rolls made without assistance.', condition: 'Isolated', conditionText: '' },
  { id: 'arch_17', name: 'The Gossip', tagline: 'Information is currency.', talent: 'Rumour Mill', advantage: 'Start each session with 1 random secret.', condition: 'Loose Tongue', conditionText: '' },
  { id: 'arch_18', name: 'The Slacker', tagline: 'I’ll deal with it later.', talent: 'Minimal Effort', advantage: 'Dilly-dallying actions regain +1 extra Energy.', condition: 'Unprepared', conditionText: '' },
];

// Loot that has actually dropped in the campaign so far (+ the Buried Hour table).
const MISSION_LOOT_SEED = [
  { id: 'ml_1', name: 'Runebound Tinker’s Hammer', type: 'Weapon', rarity: 'Rare', source: 'The Village That Dreams Tomorrow', effect: 'Light melee. Roll Body + Craft, moderate damage. On success mark the target with a faint sigil; your next hit against it deals +2 damage. On high success the target suffers -1 Craft or Reflex next turn.', description: 'Designed to break runes, not bones.' },
  { id: 'ml_2', name: 'Flute of the First Note', type: 'Artifact', rarity: 'Rare', source: 'The Village That Dreams Tomorrow', effect: 'Roll Soul + Presence. Beautiful melody: allies within 5m gain d20/4 on their next roll. Dark melody: enemies within 5m get d20/4 on their next roll.', description: 'Soft golden tone. Echo lingers half a second too long.' },
  { id: 'ml_3', name: 'Staff of Lingering Seconds', type: 'Weapon', rarity: 'Rare', source: 'The Village That Dreams Tomorrow', effect: 'Strike: Body + Force, moderate; on high success target -1 next roll. Delayed Impact (CD 2, Lvl 1, Mind + Study, 10m): minor magical damage now and again at the start of their next turn.', description: 'An ashwood staff ringed with brass bands marked like measuring ticks.' },
  { id: 'ml_4', name: 'The Fourth Bell', type: 'Artifact', rarity: 'Epic', source: 'The Village That Dreams Tomorrow', effect: 'Once per session ring it: all creatures within 6m reroll their last successful action and take the worse result. Allies may ignore the effect.', description: 'A small black iron handbell from beneath the fountain. The sound echoes twice.' },
  { id: 'ml_5', name: 'Ember of the Bound Dawn', type: 'Wearable', rarity: 'Epic', source: 'The Village That Dreams Tomorrow', effect: 'Passive: +1 Soul permanently. Once per session declare "This moment matters": treat a normal success as a high success. In a redemption or moral choice it automatically succeeds.', description: 'A floating amber flame inside crystal.' },
  { id: 'ml_6', name: 'The Hour Unbroken', type: 'Weapon', rarity: 'Epic', source: 'Aethyrix (reforged claw)', effect: 'Any melee weapon can be infused. +1 damage permanently. On a critical hit freeze the target: they lose their next action. Cost: -1 to your next roll afterwards.', description: 'A jagged crystal blade that hums softly.' },
  { id: 'ml_7', name: 'Spectacles of the Fixed Moment', type: 'Wearable', rarity: 'Rare', source: 'The Village That Dreams Tomorrow', effect: 'Passive: +2 Study.', description: 'Thin silver-rimmed glasses. The lenses shimmer faintly.' },
  { id: 'ml_8', name: 'The Scholar’s Second Sight', type: 'Wearable', rarity: 'Rare', source: 'The Village That Dreams Tomorrow', effect: 'Passive: you can see minor time distortions and invisible temporal effects.', description: 'Round brass spectacles recovered from beneath the fountain.' },
  { id: 'ml_9', name: 'Chrono-Wire Spool', type: 'Weapon', rarity: 'Rare', source: 'The Buried Hour', effect: 'Deploy (Mind + Craft): thin wire between two points, max 5m; first enemy crossing must roll or fall prone. Strike (Body + Reflex): garrote, minor damage.', description: '' },
  { id: 'ml_10', name: 'Boundary Hook Blade', type: 'Weapon', rarity: 'Rare', source: 'The Buried Hour', effect: 'Short blade, Body + Reflex, moderate damage. High success: pull target 1m closer or prevent them disengaging. +1 against time-distorted enemies.', description: '' },
  { id: 'ml_11', name: 'Rivet-Launcher Bracer', type: 'Weapon', rarity: 'Rare', source: 'The Buried Hour', effect: 'Ranged, Mind + Craft, 10m, minor damage. On success pin the target to a surface (must roll to move next turn). 1 use per combat.', description: 'Ancient mechanical wrist tool.' },
  { id: 'ml_12', name: 'Mason’s Anchor Pick', type: 'Weapon', rarity: 'Rare', source: 'The Buried Hour', effect: 'Versatile tool, Body + Craft, moderate damage. On success embed in terrain for cover or a climbing anchor. High success: target -1 Endurance next turn.', description: '' },
  { id: 'ml_13', name: 'Iron Ring of the Anchor', type: 'Wearable', rarity: 'Rare', source: 'The Buried Hour', effect: 'Once per combat when pushed or knocked prone, choose not to move. Passive: +1 Endurance while below half Life.', description: 'A cracked iron ring from the original binding. Feels heavy when lies are spoken nearby.' },
  { id: 'ml_14', name: 'Fragment of the First Rune', type: 'Artifact', rarity: 'Rare', source: 'The Buried Hour', effect: 'Once per combat add +2 to a Mind-based roll after seeing the result. Risk: on a critical failure, temporal echo (-1 next roll).', description: '' },
  { id: 'ml_15', name: 'Pine-Shadow Cloak Thread', type: 'Wearable', rarity: 'Rare', source: 'The Buried Hour', effect: 'Once per scene gain +3 to a Reflex or stealth roll. Leaves autumn leaves drifting when activated.', description: '' },
  { id: 'ml_16', name: 'Chalk of the Turning', type: 'Artifact', rarity: 'Rare', source: 'The Buried Hour', effect: 'Draw a 2m circle as an action. The first enemy entering must roll or lose movement next turn. 1 use per long rest.', description: '' },
  { id: 'ml_17', name: 'Flicker Pebble', type: 'Artifact', rarity: 'Rare', source: 'The Buried Hour', effect: 'Once per combat move 3m immediately without triggering reactions.', description: 'A minor time skip. Limited use.' },
  { id: 'ml_18', name: 'Lantern of Borrowed Seasons', type: 'Artifact', rarity: 'Epic', source: 'The Buried Hour', effect: '3 charges. When lit choose one effect for 1 round: +1 to all Soul rolls / ignore the first -1 penalty this round / remove a minor time distortion. When the last charge is used the lantern cracks but remains a normal light.', description: 'Ancient brass lantern found near the Anchor Vault.' },
  { id: 'ml_19', name: 'Ember of the Unmoored', type: 'Artifact', rarity: 'Epic', source: 'Redeeming Aethyrix', effect: 'Once per session ask the GM one question about a possible future outcome. The answer is vague but truthful.', description: 'Small floating amber spark.' },
  { id: 'ml_20', name: 'Beacon Knife', type: 'Weapon', rarity: 'Common', source: 'The Teacher Beyond the Wall', effect: 'Once per scene it lights up when drawn and reveals invisible runes or fresh blood.', description: 'Short military blade with a pale blue edge.' },
  { id: 'ml_21', name: 'Warden’s Hammer', type: 'Weapon', rarity: 'Common', source: 'The Teacher Beyond the Wall', effect: 'Normal damage, but advantage when breaking locks, sigils, weak walls or damaged constructs.', description: 'Heavy one-handed hammer used by engineers and soldiers alike.' },
];

// Seals recorded in the Mission Ledger so far (Back to School 2 doc; marks given as n/5).
// "Thad" and "Dalston" in the doc are Thad and Dalton (confirmed by the character sheets).
const LEDGER_MISSION_1 = {
  name: 'Mission 1 — The Village That Dreams Tomorrow',
  notes: 'Choice: do they rat out Thad for hesitating to kill the demon? Detention: Rune Floor Scrubbing.',
  grades: { Thad: [4, 4, 2], Lucien: [4, 3, 4], Drusilla: [4, 3, 3], Dalton: [4, 3, 5] }, // [mastery, method, conduct]
};
