# 🌑 The Ashen Crown

## Setting

Veyrholm is a dark fantasy city built around a cathedral bell that rings for the dead before they die. Beneath it lies the Undertithe, a circular burial city where forgotten saints, drowned kings, oathless knights, and grave merchants all paid pieces of themselves to keep an ancient force called the Hunger asleep. The bell is cracked, the Hunger is waking, and the dead are beginning to collect debts from the living.

The player is Rowan Vale, a condemned oath-breaker spared from execution by Mother Sable, the last bell-priest of Veyrholm. Rowan must descend into the Undertithe before the seventh toll and decide what to do with the Ashen Crown: mend it, break it, wear it, or bind its curse at personal cost.

## Main Cast

- Rowan Vale: the player character, an oath-breaker with a brand that can open old grave-law.
- Mother Sable: the bell-priest who spares Rowan and knows the first rites.
- Elian: a lantern-bearing child ghost who remembers each loop and can anchor Rowan's humanity.
- Sir Cael: a dead knight chained by honor beneath the gallows road.
- Vessa: a courteous grave-merchant who trades in memories, wax, salt, and names.
- Saint Orra: a forgotten saint whose mercy was buried with her teeth.
- The Hunger: the old devouring dark beneath the crown, never fully personified until late story beats.

## State Plan

Core stats:
- `blood`: Rowan's remaining life and bodily strength.
- `candle`: remaining ritual light; low candle invites the Hunger.
- `bellTolls`: time pressure toward the seventh toll.
- `shadowDebt`: bargains, stolen power, and corrupt shortcuts.
- `mercy`: compassionate choices, aid to dead and living.
- `memory`: retained truths across cycles.
- `honor`: kept vows and martial integrity.
- `crownShards`: major ritual authority gathered from branches.

Inventory and flags:
- `hasAshKey`, `hasBlackSalt`, `hasRootTallow`, `hasSaintName`, `hasKnightOath`, `hasDrownedSeal`, `hasMarketWrit`, `hasLastClapper`, `hasCrownVessel`.
- `metElian`, `metCael`, `metVessa`, `metOrra`, `insideFinal`, `crownAwake`.

Mechanics:
- `redirectTriggers` should force failure if `blood <= 0`, `candle <= 0`, or `shadowDebt >= 10` before the final.
- Repeating hub cycle: expeditions return to the Undertithe gate through a "bell loop" node that increments `bellTolls`, consumes candle, and preserves acquired knowledge.
- Final access opens when enough shards or specific alternate components are gathered.
- Several choices should be conditional on retained memory, mercy, shadow debt, or specific items.

## Narrative Structure

1. Surface execution and reprieve.
2. Descent into the Undertithe and first meeting with Elian.
3. Hub cycle at the Iron Well, where Rowan chooses expeditions.
4. Gallows Road: honor, Sir Cael, knightly oath, and a combat-heavy shard.
5. Saint Orra's ossuary: mercy, saint's name, healing, and ritual truth.
6. The Drowned Choir: memory, the drowned seal, and the cost of listening to the dead.
7. Vessa's Market: bargains, black salt, root tallow, the last clapper, and dangerous shortcuts.
8. Final cathedral descent once the crown can be approached.
9. Final ritual choices shaped by state.

## Cycles

The Iron Well hub repeats after most branches. Each return should feel like the same place altered by tolls, candlelight, and what Rowan remembers. Some route entries should change or unlock after earlier discoveries, while some desperate options become tempting if time or candle runs low.

## Endings

1. Dawn Crown: Rowan mends the Ashen Crown with mercy and memory, freeing Veyrholm from the Hunger without enthroning a tyrant.
2. Broken Crown: Rowan destroys the crown and ends grave-law, freeing the dead but leaving the city politically ruined and mortal.
3. Grave Throne: Rowan wears the crown and rules the dead; powerful, coherent, but morally dark.
4. Silent Bell: Rowan binds the Hunger inside their own heart and becomes the last toll.
5. Bloodless Failure: Rowan dies before the final rite.
6. Candleless Failure: the Hunger finds Rowan in darkness before the final rite.
