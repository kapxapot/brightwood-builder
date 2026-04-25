# The Clockwork Quest Room

## Setting

The player wakes inside a sealed clockwork quest room built by an absent artificer. The room is one large circular chamber with puzzle stations around the walls: a rolltop desk, a silver mirror, a dry water basin, a bell alcove, an orrery, a marked trapdoor, and the final exit door. The room watches, remembers, and changes what it offers based on what the player has found or learned.

## State Plan

- Track resources: `timeLeft`, `focus`, `tension`, and `clues`.
- Track found objects: `hasBrassKey`, `hasMirrorShard`, `hasInkVial`, `hasTuningFork`, `hasValveHandle`, `hasGlassKey`, `hasChalk`, `hasSunDialGear`, `hasCopperWire`, `hasMoonLens`, `hasCrystalStar`, `hasMasterKey`, `hasExitMap`, and `hasFuse`.
- Track learned information: `learnedMotto`, `learnedBellOrder`, `learnedWaterClock`, `learnedNumberCode`, `learnedOrreryPattern`, `learnedExitTruth`, `learnedPowerRisk`, `learnedFinalSequence`, `learnedRoomVoice`, `learnedTrueExit`, and `learnedRoomName`.
- Track solved room systems: `openedDeskLock`, `drainedBasin`, `solvedBells`, `gearInstalled`, `restoredCircuit`, `restoredPower`, `openedGlassCase`, `mirrorSeal`, `bellSeal`, `waterSeal`, `markedTrapdoor`, `emergencyRoute`, `roomAppeased`, `keeperPromise`, and `roomFreed`.
- Use conditional actions so new options appear only after the right object or knowledge exists.

## Main Flow

1. The player wakes and learns the room is not just locked, but testing attention.
2. The central hub lets the player visit puzzle stations in any order.
3. The desk teaches the motto, gives the brass key, reveals the bell order, and can produce an exit map.
4. The mirror gives the shard, lens, and deeper information about the false exit.
5. The basin teaches the water-clock rule, yields the glass key, and exposes the trapdoor.
6. The bell alcove provides the tuning-fork puzzle, sun gear, copper wire, and power warnings.
7. The orrery restores power and reveals the final door sequence.
8. The final door checks whether the player has actually solved the room or is guessing.
9. The secret alcove and service crawl create a deeper route to the true exit.

## Endings

- Clean Escape: the player opens the correct exit with enough solved systems.
- Narrow Escape: the player escapes without understanding everything.
- Mirror Prison: the player trusts the reflection too early.
- Below Forever: the player opens the trapdoor before the room is powered.
- Out of Time: the room seals itself after the player wastes too much time.
- True Master Exit: the player learns what the room is and chooses what becomes of it.
