// Loot tables imported 1:1 from LOOT.xlsx (Average / Rare / Epic / House / Forbidden Library).
// Item shape: { id, name, type, rarity, effect, description, source }

const LOOT_SEED = [
    {
        "id":  "loot_1",
        "name":  "Practice Wand",
        "type":  "Weapon",
        "rarity":  "Common",
        "effect":  "1d6 damage.",
        "description":  "",
        "source":  "Average"
    },
    {
        "id":  "loot_2",
        "name":  "Bronze-Inked Dueling Blade",
        "type":  "Weapon",
        "rarity":  "Common",
        "effect":  "1d6 damage; gains +1 on first attack each combat.",
        "description":  "",
        "source":  "Average"
    },
    {
        "id":  "loot_3",
        "name":  "House Signet Ring",
        "type":  "Wearable",
        "rarity":  "Common",
        "effect":  "+1 to one chosen stat while worn.",
        "description":  "",
        "source":  "Average"
    },
    {
        "id":  "loot_4",
        "name":  "Candlelit Scholar’s Cloak",
        "type":  "Wearable",
        "rarity":  "Common",
        "effect":  "+1 to stealth in dim light.",
        "description":  "",
        "source":  "Average"
    },
    {
        "id":  "loot_5",
        "name":  "Pocket Charm of Warmth",
        "type":  "Wearable",
        "rarity":  "Common",
        "effect":  "Resist minor cold effects; +2 max health.",
        "description":  "",
        "source":  "Average"
    },
    {
        "id":  "loot_6",
        "name":  "Oak-Handled Spellblade",
        "type":  "Weapon",
        "rarity":  "Common",
        "effect":  "1d8 damage.",
        "description":  "",
        "source":  "Average"
    },
    {
        "id":  "loot_7",
        "name":  "Pendant of Steady Focus",
        "type":  "Wearable",
        "rarity":  "Common",
        "effect":  "+1 to concentration rolls.",
        "description":  "",
        "source":  "Average"
    },
    {
        "id":  "loot_8",
        "name":  "Soft-Sole Courtyard Boots",
        "type":  "Wearable",
        "rarity":  "Common",
        "effect":  "+2 to stealth rolls.",
        "description":  "",
        "source":  "Average"
    },
    {
        "id":  "loot_9",
        "name":  "Brass Warden Bracer",
        "type":  "Wearable",
        "rarity":  "Common",
        "effect":  "+1 to defense rolls.",
        "description":  "",
        "source":  "Average"
    },
    {
        "id":  "loot_10",
        "name":  "Rune-Scored Shortsword",
        "type":  "Weapon",
        "rarity":  "Uncommon",
        "effect":  "1d8 damage; +1 to attack rolls.",
        "description":  "",
        "source":  "Average"
    },
    {
        "id":  "loot_11",
        "name":  "Amulet of Quiet Vitality",
        "type":  "Wearable",
        "rarity":  "Uncommon",
        "effect":  "+4 max health.",
        "description":  "",
        "source":  "Average"
    },
    {
        "id":  "loot_12",
        "name":  "Ring of Swift Assembly",
        "type":  "Wearable",
        "rarity":  "Uncommon",
        "effect":  "+2 Speed.",
        "description":  "",
        "source":  "Average"
    },
    {
        "id":  "loot_13",
        "name":  "Velarium Charm",
        "type":  "Artifact",
        "rarity":  "Uncommon",
        "effect":  "Once per day become invisible for 1 round.",
        "description":  "",
        "source":  "Average"
    },
    {
        "id":  "loot_14",
        "name":  "Silvered Hallway Rapier",
        "type":  "Weapon",
        "rarity":  "Uncommon",
        "effect":  "+3 damage on perfect success and inflicts  bleeding, 1 Damage per round, can be stacked",
        "description":  "",
        "source":  "Average"
    },
    {
        "id":  "loot_15",
        "name":  "Circlet of Watchful Eyes",
        "type":  "Wearable",
        "rarity":  "Uncommon",
        "effect":  "+2 perception rolls.",
        "description":  "",
        "source":  "Average"
    },
    {
        "id":  "loot_16",
        "name":  "Cloak of the North Tower",
        "type":  "Wearable",
        "rarity":  "Uncommon",
        "effect":  "Advantage on first stealth roll in a scene.",
        "description":  "",
        "source":  "Average"
    },
    {
        "id":  "loot_17",
        "name":  "Gauntlet of Disciplined Force",
        "type":  "Wearable",
        "rarity":  "Uncommon",
        "effect":  "+2 to physical damage rolls.",
        "description":  "",
        "source":  "Average"
    },
    {
        "id":  "loot_18",
        "name":  "Band of Clear Thought",
        "type":  "Wearable",
        "rarity":  "Uncommon",
        "effect":  "+2 knowledge or insight rolls.",
        "description":  "",
        "source":  "Average"
    },
    {
        "id":  "loot_19",
        "name":  "Lesser Warding Signet",
        "type":  "Wearable",
        "rarity":  "Uncommon",
        "effect":  "Once per day reduce incoming damage by 5.",
        "description":  "",
        "source":  "Average"
    },
    {
        "id":  "loot_20",
        "name":  "Sigil of Renewed Resolve",
        "type":  "Artifact",
        "rarity":  "Uncommon",
        "effect":  "Once per day heal 8 health as an action.",
        "description":  "",
        "source":  "Average"
    },
    {
        "id":  "loot_21",
        "name":  "Runed Duelling Sabre",
        "type":  "Weapon",
        "rarity":  "Rare",
        "effect":  "3 damage, +2 to attack rolls.",
        "description":  null,
        "source":  "Rare"
    },
    {
        "id":  "loot_22",
        "name":  "Professor’s Ember Wand",
        "type":  "Weapon",
        "rarity":  "Rare",
        "effect":  "1d10 damage; once per combat deal +4 bonus damage.",
        "description":  null,
        "source":  "Rare"
    },
    {
        "id":  "loot_23",
        "name":  "Ring of Greater Vitality",
        "type":  "Wearable",
        "rarity":  "Rare",
        "effect":  "+4 max health.",
        "description":  null,
        "source":  "Rare"
    },
    {
        "id":  "loot_24",
        "name":  "Cloak of Shifting Shadow",
        "type":  "Wearable",
        "rarity":  "Rare",
        "effect":  "Once per day become invisible for 2 rounds.",
        "description":  null,
        "source":  "Rare"
    },
    {
        "id":  "loot_25",
        "name":  "Circlet of Arcane Authority",
        "type":  "Wearable",
        "rarity":  "Rare",
        "effect":  "+2 to spellcasting rolls; +1 to initiative.",
        "description":  null,
        "source":  "Rare"
    },
    {
        "id":  "loot_26",
        "name":  "Gauntlets of Impact",
        "type":  "Wearable",
        "rarity":  "Rare",
        "effect":  "+3 to physical damage rolls.",
        "description":  null,
        "source":  "Rare"
    },
    {
        "id":  "loot_27",
        "name":  "Amulet of Resolute Mind",
        "type":  "Wearable",
        "rarity":  "Rare",
        "effect":  "+3 to resistance against fear or mental effects.",
        "description":  null,
        "source":  "Rare"
    },
    {
        "id":  "loot_28",
        "name":  "Runic Longbow",
        "type":  "Weapon",
        "rarity":  "Rare",
        "effect":  "1d10 damage; ignore 2 points of enemy defense.",
        "description":  null,
        "source":  "Rare"
    },
    {
        "id":  "loot_29",
        "name":  "Boots of the Grand Stair",
        "type":  "Wearable",
        "rarity":  "Rare",
        "effect":  "+3 to movement-related rolls; once per day take an additional move action.",
        "description":  null,
        "source":  "Rare"
    },
    {
        "id":  "loot_30",
        "name":  "Silver Boundary Blade",
        "type":  "Weapon",
        "rarity":  "Rare",
        "effect":  "1d10 damage; deal +3 damage to magical entities.",
        "description":  null,
        "source":  "Rare"
    },
    {
        "id":  "loot_31",
        "name":  "Band of the Veiled Scholar",
        "type":  "Wearable",
        "rarity":  "Rare",
        "effect":  "Once per day reroll a failed roll.",
        "description":  null,
        "source":  "Rare"
    },
    {
        "id":  "loot_32",
        "name":  "Hourglass of Reversal",
        "type":  "Artifact",
        "rarity":  "Rare",
        "effect":  "Once per session force a creature to reroll a successful roll.",
        "description":  null,
        "source":  "Rare"
    },
    {
        "id":  "loot_33",
        "name":  "Charm of Sudden Renewal",
        "type":  "Artifact",
        "rarity":  "Rare",
        "effect":  "Once per day heal 2d8 health.",
        "description":  null,
        "source":  "Rare"
    },
    {
        "id":  "loot_34",
        "name":  "Spectacles of True Reading",
        "type":  "Wearable",
        "rarity":  "Rare",
        "effect":  "See invisible creatures and magical effects for 1 scene per day.",
        "description":  null,
        "source":  "Rare"
    },
    {
        "id":  "loot_35",
        "name":  "Sash of Command",
        "type":  "Wearable",
        "rarity":  "Rare",
        "effect":  "+2 to persuasion or authority rolls; allies gain +1 morale in your presence.",
        "description":  null,
        "source":  "Rare"
    },
    {
        "id":  "loot_36",
        "name":  "Runebound Warhammer",
        "type":  "Weapon",
        "rarity":  "Rare",
        "effect":  "plus 8 damage; on perfect success knock target prone.",
        "description":  null,
        "source":  "Rare"
    },
    {
        "id":  "loot_37",
        "name":  "Phasing Signet Ring",
        "type":  "Wearable",
        "rarity":  "Rare",
        "effect":  "Once per day ignore one physical attack that hits you.",
        "description":  null,
        "source":  "Rare"
    },
    {
        "id":  "loot_38",
        "name":  "Blade of Measured Time",
        "type":  "Weapon",
        "rarity":  "Rare",
        "effect":  "1d10 damage; once per combat act first regardless of initiative.",
        "description":  null,
        "source":  "Rare"
    },
    {
        "id":  "loot_39",
        "name":  "Medallion of Arcane Reservoir",
        "type":  "Wearable",
        "rarity":  "Rare",
        "effect":  "Gain +2 spell uses per day.",
        "description":  null,
        "source":  "Rare"
    },
    {
        "id":  "loot_40",
        "name":  "Sigil of the Headmaster",
        "type":  "Artifact",
        "rarity":  "Rare",
        "effect":  "Once per session automatically succeed on one roll.",
        "description":  null,
        "source":  "Rare"
    },
    {
        "id":  "loot_41",
        "name":  "Blade of the First Prefect",
        "type":  "Weapon",
        "rarity":  "Epic",
        "effect":  "+12 damage; +3 to attack rolls.",
        "description":  null,
        "source":  "Epic"
    },
    {
        "id":  "loot_42",
        "name":  "Archon’s Duelling Wand",
        "type":  "Weapon",
        "rarity":  "Epic",
        "effect":  "+12 damage; once per combat deal +8 bonus damage.",
        "description":  null,
        "source":  "Epic"
    },
    {
        "id":  "loot_43",
        "name":  "Crown of the Grand Archivist",
        "type":  "Wearable",
        "rarity":  "Epic",
        "effect":  "+3 to spellcasting; +2 to knowledge rolls.",
        "description":  null,
        "source":  "Epic"
    },
    {
        "id":  "loot_44",
        "name":  "Cloak of Absolute Veil",
        "type":  "Wearable",
        "rarity":  "Epic",
        "effect":  "Become invisible for 3 rounds per day; attacks do not break invisibility on first strike.",
        "description":  null,
        "source":  "Epic"
    },
    {
        "id":  "loot_45",
        "name":  "Ring of Boundless Vitality",
        "type":  "Wearable",
        "rarity":  "Epic",
        "effect":  "+15 max health.",
        "description":  null,
        "source":  "Epic"
    },
    {
        "id":  "loot_46",
        "name":  "Gauntlets of Cataclysm",
        "type":  "Wearable",
        "rarity":  "Epic",
        "effect":  "+5 to physical damage rolls.",
        "description":  null,
        "source":  "Epic"
    },
    {
        "id":  "loot_47",
        "name":  "Chrono-Signet of Supremacy",
        "type":  "Wearable",
        "rarity":  "Epic",
        "effect":  "Once per combat take an additional full action.",
        "description":  null,
        "source":  "Epic"
    },
    {
        "id":  "loot_48",
        "name":  "Spectacles of True Authority",
        "type":  "Wearable",
        "rarity":  "Epic",
        "effect":  "See all magical effects; +3 perception; immune to illusion.",
        "description":  null,
        "source":  "Epic"
    },
    {
        "id":  "loot_49",
        "name":  "Runebreaker Greatblade",
        "type":  "Weapon",
        "rarity":  "Epic",
        "effect":  "1d12 damage; ignore 5 defense; deal +5 vs magical targets.",
        "description":  null,
        "source":  "Epic"
    },
    {
        "id":  "loot_50",
        "name":  "Amulet of Sovereign Will",
        "type":  "Wearable",
        "rarity":  "Epic",
        "effect":  "Immunity to fear; +3 to mental resistance.",
        "description":  null,
        "source":  "Epic"
    },
    {
        "id":  "loot_51",
        "name":  "Boots of the Vanishing Stair",
        "type":  "Wearable",
        "rarity":  "Epic",
        "effect":  "Teleport up to 15 meters once per combat.",
        "description":  null,
        "source":  "Epic"
    },
    {
        "id":  "loot_52",
        "name":  "Medallion of Arcane Overflow",
        "type":  "Wearable",
        "rarity":  "Epic",
        "effect":  "+4 spell uses per day; +2 spell damage.",
        "description":  null,
        "source":  "Epic"
    },
    {
        "id":  "loot_53",
        "name":  "Scepter of the Inner Circle",
        "type":  "Weapon/Artifact",
        "rarity":  "Epic",
        "effect":  "1d10 damage; once per session automatically succeed on a spell roll.",
        "description":  null,
        "source":  "Epic"
    },
    {
        "id":  "loot_54",
        "name":  "Seal of the Boundary Master",
        "type":  "Wearable",
        "rarity":  "Epic",
        "effect":  "Reduce all incoming damage by 5; once per day negate all damage from one attack.",
        "description":  null,
        "source":  "Epic"
    },
    {
        "id":  "loot_55",
        "name":  "Hourglass of Absolute Recall",
        "type":  "Artifact",
        "rarity":  "Epic",
        "effect":  "Once per session rewind the last round and replay it differently.",
        "description":  null,
        "source":  "Epic"
    },
    {
        "id":  "loot_56",
        "name":  "Blade of Measured Eternity",
        "type":  "Weapon",
        "rarity":  "Epic",
        "effect":  "1d12 damage; on perfect success target cannot act next round.",
        "description":  null,
        "source":  "Epic"
    },
    {
        "id":  "loot_57",
        "name":  "Ring of the Final Examination",
        "type":  "Wearable",
        "rarity":  "Epic",
        "effect":  "Force a creature to reroll any roll once per combat.",
        "description":  null,
        "source":  "Epic"
    },
    {
        "id":  "loot_58",
        "name":  "Circlet of Supreme Insight",
        "type":  "Wearable",
        "rarity":  "Epic",
        "effect":  "+3 to all knowledge and perception rolls.",
        "description":  null,
        "source":  "Epic"
    },
    {
        "id":  "loot_59",
        "name":  "Sigil of Unbroken Form",
        "type":  "Artifact",
        "rarity":  "Epic",
        "effect":  "If reduced to 0 health, immediately return to 20 health once per session.",
        "description":  null,
        "source":  "Epic"
    },
    {
        "id":  "loot_60",
        "name":  "Throne-Bound Regalia of the Headmaster",
        "type":  "Wearable Set",
        "rarity":  "Epic",
        "effect":  "+3 to all stats; once per session automatically succeed and treat it as a perfect success.",
        "description":  null,
        "source":  "Epic"
    },
    {
        "id":  "loot_61",
        "name":  "Ring of emotional intelligence",
        "type":  "Ring",
        "rarity":  "Epic",
        "effect":  "+5 mental damage; immunity to emotional damage",
        "description":  "",
        "source":  "House Ash"
    },
    {
        "id":  "loot_62",
        "name":  "Cloak of the Cinder Oath (House Ash)",
        "type":  "Wearable",
        "rarity":  "Epic",
        "effect":  "+3 mental damage; immunity to fear.",
        "description":  "",
        "source":  "House Ash"
    },
    {
        "id":  "loot_63",
        "name":  "Ashbrand Duelling Sabre (House Ash)",
        "type":  "Weapon",
        "rarity":  "Epic",
        "effect":  "1d12 damage; +3 attack rolls.",
        "description":  "",
        "source":  "House Ash"
    },
    {
        "id":  "loot_64",
        "name":  "Sigil of the First Flame (House Ash)",
        "type":  "Artifact",
        "rarity":  "Epic",
        "effect":  "Once per combat take an additional attack action.",
        "description":  "",
        "source":  "House Ash"
    },
    {
        "id":  "loot_65",
        "name":  "Belt of Unbroken Steel (House Ironwell)",
        "type":  "Belt",
        "rarity":  "Epic",
        "effect":  "+15 max health.",
        "description":  "An inbued Belt made of dwarf steel that has runes around it",
        "source":  "House Ironwell"
    },
    {
        "id":  "loot_66",
        "name":  "Gauntlets of the Deep Forge (House Ironwell)",
        "type":  "Gloves",
        "rarity":  "Epic",
        "effect":  "+5 physical damage.",
        "description":  "",
        "source":  "House Ironwell"
    },
    {
        "id":  "loot_67",
        "name":  "Ironwell Bastion Blade (House Ironwell)",
        "type":  "Weapon",
        "rarity":  "Epic",
        "effect":  "6 damage; ignore 5 block.",
        "description":  "",
        "source":  "House Ironwell"
    },
    {
        "id":  "loot_68",
        "name":  "Seal of Iron",
        "type":  "Sigil",
        "rarity":  "Epic",
        "effect":  "Reduce all incoming damage by 5; once per session negate all damage from one attack.",
        "description":  "",
        "source":  "House Ironwell"
    },
    {
        "id":  "loot_69",
        "name":  "Vale Whisperblade (House Vale)",
        "type":  "Weapon",
        "rarity":  "Epic",
        "effect":  "1d12 damage; +3 stealth; deal +5 damage when attacking unseen.",
        "description":  "",
        "source":  "House Vale"
    },
    {
        "id":  "loot_70",
        "name":  "Cloak of the Silent Canopy (House Vale)",
        "type":  "Wearable",
        "rarity":  "Epic",
        "effect":  "Once per combat become invisible for 3 rounds.",
        "description":  "",
        "source":  "House Vale"
    },
    {
        "id":  "loot_71",
        "name":  "Circlet of Far Sight (House Vale)",
        "type":  "Wearable",
        "rarity":  "Epic",
        "effect":  "+3 perception; see invisible creatures.",
        "description":  "",
        "source":  "House Vale"
    },
    {
        "id":  "loot_72",
        "name":  "Signet of beyond the Vale",
        "type":  "Artifact",
        "rarity":  "Epic",
        "effect":  "Once per combat teleport up to 20 meters.",
        "description":  "A distored signet that sometimes moves a meter, when grabbed, teleports instantly",
        "source":  "House Vale"
    },
    {
        "id":  "loot_73",
        "name":  "Tome of Veiled Histories",
        "type":  "Artifact",
        "rarity":  "Rare",
        "effect":  "+1 Study; once per day ask the GM one truthful historical fact. Unknown to your knowledge, it collects the history of you as well",
        "description":  "An old tome, with an amalgamation of different histories of the world, with just the right history at  hand every time you look for it",
        "source":  "Forbidden Library"
    },
    {
        "id":  "loot_74",
        "name":  "Ink of Binding Oaths",
        "type":  "Artifact",
        "rarity":  "Rare",
        "effect":  "Once per day bind a creature using your will+soul to a spoken agreement for 1 hour. However, after the hour, the creature will always turn against you and attempt to kill you",
        "description":  "",
        "source":  "Forbidden Library"
    },
    {
        "id":  "loot_75",
        "name":  "Spectacles of the Red Margin",
        "type":  "Wearable",
        "rarity":  "Rare",
        "effect":  "+2 perception; see magical auras. But unknown to you, they emit strong magical aura too, and can be spotted by the people with an eye for it.",
        "description":  "Snake like red pair of glasses with red tinted glass",
        "source":  "Forbidden Library"
    },
    {
        "id":  "loot_76",
        "name":  "Quill of Unseen Script",
        "type":  "Artifact",
        "rarity":  "Rare",
        "effect":  "Write invisible text visible only to you for 24 hours.",
        "description":  "",
        "source":  "Forbidden Library"
    },
    {
        "id":  "loot_77",
        "name":  "Codex of the Fifth Bell",
        "type":  "Artifact",
        "rarity":  "Rare",
        "effect":  "+3 spellcasting; suffer -2 physical defense while attuned.",
        "description":  "",
        "source":  "Forbidden Library"
    },
    {
        "id":  "loot_78",
        "name":  "Chain of Quiet Contemplation",
        "type":  "Wearable",
        "rarity":  "Rare",
        "effect":  "+3 mental resistance; immunity to fear.  But also  drains your other emotions slowly, until you are an emotionless husk.",
        "description":  "",
        "source":  "Forbidden Library"
    },
    {
        "id":  "loot_79",
        "name":  "Lantern of the Lower Stacks",
        "type":  "Artifact",
        "rarity":  "Rare",
        "effect":  "Reveal invisible creatures and hidden doors for 1 scene per day.",
        "description":  "",
        "source":  "Forbidden Library"
    },
    {
        "id":  "loot_80",
        "name":  "Ring of the Sealed Stairs",
        "type":  "Artifact",
        "rarity":  "Epic",
        "effect":  "+D10 spell damage once per day,  after ten uses explodes, goes back to normal and hurts you for D20 damage",
        "description":  "A smooth ring at first that becomes ever more \"staricase-y\" the more you use it",
        "source":  "Forbidden Library"
    },
    {
        "id":  "loot_81",
        "name":  "Ring of the Black Index",
        "type":  "Wearable",
        "rarity":  "Epic",
        "effect":  "Force one creature to reroll a successful roll once per combat.",
        "description":  "",
        "source":  "Forbidden Library"
    },
    {
        "id":  "loot_82",
        "name":  "The Empty Manuscript that fills up",
        "type":  "Artifact",
        "rarity":  "Epic",
        "effect":  "Has to  be bound by the user by putting his bloody fingerpring on the seal to open it. Once per session rewind the last round and replay it differently. BUT if someone else gets the book, they can read and rewrite your fate instead.",
        "description":  "An ancient, worn down empty notebook that slowly fills up with everything that happens to its wearer, once per session he can \"scratch that\" and restart a round.",
        "source":  "Forbidden Library"
    }
];
