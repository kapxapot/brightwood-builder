# Story Creation Instructions

## General Rules

1. While generating a story please reference the `schema.json` file.
2. Every story must be started from a start node that is referenced by the `startId` root property.
3. All nodes must have integer ids starting from 1.
4. All nodes referenced by `startId` or other nodes must be defined.
5. Please, note, that there are 4 node types: `action`, `redirect`, `skip` and `finish`.
6. Only `action` node can contain `actions` array. It must be not empty.
7. Only `redirect` node can contain `links` array. It must be not empty.
8. Only `skip` node can have `nextId` property. It must reference an existing node.
9. `finish` node doesn't have any additional properties.
10. Every node must have at least one `text` line.
11. `position` array it used to place nodes in the visual editor. Keep in mind that every node is around 250px wide and 1200px high. Spread the nodes so they are placed from left to right.
12. Use `./neural-uprising/story.json` as an additional reference for the story file structure and a good node balance. When you need a concrete example of story state, also reference `../public/stories/wood-prototype.json` for `data.init`, `conditions`, `effects`, `entryEffects`, and state-driven branching.
13. Fill the root story `id` property with a random UUID.
14. The root story `title` must start with a relevant emoji followed by the title text, for example `🌙 Moonlit Bellarose`.
15. Do not fill the root story `cover` property unless you put there an existing image URL.
16. Do not fill the `key` property of nodes.
17. Do not fill the root story `viewport` property.
18. The actual Brightwood player/runtime lives in the neighboring `../brightwood` project. When story format, interpolation, or runtime behavior matters, use `../brightwood/lib/story-engine.ts`, `../brightwood/lib/message-renderer.ts`, and `../brightwood/components/story-player.tsx` as reference and keep this builder aligned with them unless an intentional divergence is documented.
19. Use camelCase for `data.init` keys and for any state keys, condition names, and effect names you introduce later. Do not use snake_case in story state.
20. In node, action, and redirect `condition` fields you can use inline boolean expressions directly, including bare flags like `metTheo`, negations like `!metTheo`, and larger expressions like `hasLetter && courage > 1`. Missing keys behave like no value and are falsy in conditions. You do not need to define a named condition just to read a boolean state value.
21. Effect assignments can create new state keys dynamically, for example `weapon = 1`. Use `unset("weapon")` to remove a key. `unset` is a reserved built-in effect name and must not be redefined in story data. String literals inside conditions and effect statements must use double quotes, not single quotes. In `entryEffects`, `action.effects`, and `link.effects`, string entries may be written as `effectName`, `effectName()`, `effectName(1, false, "test")`, or direct assignments like `weapon = 1`. Object calls like `{ "name": "hit", "args": [1] }` are still valid and should be preferred only when the shorthand becomes awkward.
22. Effects can emit chat/history messages directly with the built-in `log(message, tone?)` call. Use this when the effect itself should surface feedback like damage, healing, rewards, warnings, or status changes. Example: `log("-" + amount + " health", "danger")` or `log("+2 health", "success")`. Supported tones are `info`, `success`, `warning`, and `danger`; when omitted, the tone defaults to `info`. `log` is a reserved built-in effect name and must not be redefined in story data. These `log(...)` calls become chat messages in the Brightwood player, so prefer them over inventing separate prose nodes just to announce a mechanical effect.
23. Use `data.redirectTriggers` when a state condition must force the story to a terminal or forced node, such as death, running out of time, critical corruption, or any other "the story must end now" state. Put the effects that change those trigger conditions on node `entryEffects` whenever the state change belongs to entering that scene or resolving its consequence. Put those effects on `action.effects` only when the player choice itself directly and immediately changes the state, such as spending the final resource, taking a deliberate hit, or choosing a timed delay. Do not add manual death/time-check redirect nodes after every possible state change; define one redirect trigger and let the runtime route to the finish node.

## Story Creation Process

1. When you create a story, please, create a new folder in the `stories` folder. You can name it like `story-1` or similar to that.
2. Create a `plan.md` file for a new story, put the story setting, plan and key story points into it. Also, define possible endings to the story. DON'T MODIFY `plan.md` AFTER ITS CREATION!
3. Create a story file named `story.json` in that folder. Use `plan.md` for reference.
4. The goal is to create up to 100+ nodes for the story.
5. After each node generation check the `plan.md`.
6. When you append nodes, make sure that their ids go in the ascending order WITH NO GAPS.
7. Don't create too long story branches, carefully plan to finish them by reaching final nodes. Loop the story branches to existing nodes if it makes sense.

## Writing Tips

1. Don't break sentences into several text lines (array items in the `text` property). Consider one text line as a paragraph not a sentence or a part of a sentence. But don't create too large paragraphs, 2-3 sentences is enough. Do not write long texts, 60-70 words per node maximum. I REPEAT NO MORE THAN 60-70 WORDS PER NODE.
2. Try to use all node types but use `redirect` type only when something random happens in the story or there are different probabilities for different outcomes.
3. Don't create `redirect` nodes with just one link, use `skip` node instead.
4. When a `redirect` node resolves automatically, do not write its text like the player is being offered visible alternatives. If the prose says there are several paths, doors, plans, or options, the player must get matching `actions` and choose between them. If the branch should stay random or hidden, narrate the situation so the automatic outcome feels natural and the unseen alternatives stay unspoken.
5. There must not be more than 5-6 endings. Don't create too many endings. Of course, if the reader makes a mistake and fails, it also can be an ending, but valid endings should not be more than 5-6.
6. Don't punish the reader with quick negative endings too much.
7. Aim to create long story threads that can entertwine with each other and lead to several endings eventually.
8. There also can be plot cycles that return to some earlier nodes.
9. Don't overuse the time traveling and parallel universe plots, keep it simple but engaging.
10. Use emoji in the story, but use the right placement for each surface: the story title must start with an emoji, every action label must start with a relevant emoji, and story text should include occasional inline emoji where they emphasize a meaningful object, event, emotion, or turn in the scene. Do not prefix every text block with an emoji as an illustration badge, and do not omit emoji from the story entirely. Use only browser-safe, broadly supported emoji. Target emoji that render correctly in current desktop Chrome, Edge, Firefox, and Safari on common Windows and macOS systems.
11. You can put an emoji on a separate text line only when the emoji itself is the intended beat or emphasis, not as routine decoration.
12. Use `<b></b>` tags for bold text and `<i></i>` tags for italic where appropriate.
13. Don't create long action labels, make them 2-3 words max. Every action label must begin with a relevant emoji followed by a short label, for example `🗝️ Use key` or `🌊 Walk pier`.
14. Fill node `label` property with a short (2-3 words) title based on its content. I REPEAT AGAIN FILL THE node's `label`!
15. Don't make too many branches! Keep story relatively narrow with 4-5 parallel main story branches. If the branches grow, cut them or merge them at once, don't create 20 branches and then abruptly end them at once. I REPEAT AGAIN THERE MUST BE 5-6 VALID TERMINAL `finish` nodes not 20-30!!!
16. Don't create all actions with 3 choices. Create some with 2, some with 3, depending on the context. I REPEATE DON'T MAKE 3 ACTIONS EVERYWHERE USE A MIX OF 2-3.
17. When quoting someone's speech, use double quotes `"`, not single ones `'`.
18. Every action in an `action` node must clearly match the current node text and the immediate follow-up scene. If the prose lists specific options, the action labels must express those same options directly, in the same language, without vague substitutes. Do not offer actions whose outcome jumps to unrelated exposition or a different topic. If a person, object, system, or plan is required for an action, introduce it in the node text before the player sees that action.
19. Do not mention named characters, groups, creatures, or other important actors before the story introduces them. If a character matters in a node, action, or outcome, give the reader a clear introduction first in the current node or earlier story text so the reference never feels like it came from nowhere.
20. Do not jump abruptly between places, times, emotional beats, or topics. When the story moves to a new scene, add a transition that shows the movement, passage, or consequence connecting the old scene to the new one. Prefer a short `skip` node when the transition needs its own beat.
21. Every player action must resolve into an immediate described outcome before the next scene or wider story beat unfolds. Show what happened because of the choice first, then continue. Do not send an action straight into unrelated follow-up exposition or another decision scene without an explicit consequence beat in between.

## Emoji Safety

Before generating or editing a story, check emoji choices against this list of glyphs that have rendered as missing-character rectangles in the browser. Do not use these emoji in story titles, action labels, node labels, or story text:

- `🪙` coin. Use `💰` instead.
- `🪢` knot. Use `🔗` instead.
- `🪞` mirror. Use `✨` instead for mirror/glass magic cues, or `🔎` when the action is inspection.
- `🪜` ladder. Use `⬆️`, `🧭`, or another older navigation/climbing cue instead.

`🪑` chair has been checked in the browser and is allowed.

## Story Validation

1. Check that all referenced nodes are added to the story.
2. When you fix the story and add missing nodes, don't overexpand the story. Finish the unfinished branches but don't do it abruptly, remember that there shouldn't be too many finish nodes.
3. Check that all nodes are reachable (other nodes reference them).
4. Story `id` must be a valid uuid.
5. Check that there are not too many `finish` nodes. Please remember that there should be around 5-6 valid terminal nodes. If there are too many, edit the story and reduce that amount of `finish` nodes.
6. Check that every named character or important actor is introduced before later mentions or action labels depend on them.
7. Check that scene changes have transition text instead of abrupt location or topic jumps.
8. Check that every action has an explicit outcome beat before the following scene or next action node.
9. Check that every hidden or automatic `redirect` node is written like an unseen outcome, not like a missing menu. If the text explicitly presents multiple alternatives, either convert that moment to an `action` node or rewrite the prose so the automatic branch stays invisible.

