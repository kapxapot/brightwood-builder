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
11. `position` array it used to place nodes in the visual editor. Keep in mind that every node is around 250px wide and 350px high. Spread the nodes so they are placed from left to right.
12. Use `example.json` as an additional reference for the story file structure.
13. Fill the root story `id` property with a random UUID.
14. Do not fill the root story `cover` property unless you put there an existing image URL.
15. Do not fill the `key` property of nodes.
16. Do not fill the root story `viewport` property.

## Story Creation Process

1. When you create a story, please, create a new folder in the `stories` folder. You can name it like `story-1` or similar to that.
2. Create a `plan.md` file for a new story, put the story setting, plan and key story points into it. Also, define possible endings to the story. DON'T MODIFY `plan.md` AFTER ITS CREATION!
3. Create a story file named `story.json` in that folder. Use `plan.md` for reference.
4. The goal is to create up to 70-100 nodes for the story.
5. If the `story.json` becomes too large (1500+ lines), put new nodes into `nodes.json`.
6. After each node generation check the `plan.md` and update it if needed.
7. When you append nodes, make sure that their ids go in the ascending order WITH NO GAPS.

## Writing Tips

1. Don't break sentences into several text lines (array items in the `text` property). Consider one text line as a paragraph not a sentence or a part of a sentence. But don't create too large paragraphs, 2-3 sentences is enough. Do not write long texts, 60-70 words per node maximum. I REPEAT NO MORE THAN 60-70 WORDS PER NODE.
2. Try to use all node types but use `redirect` type only when something random happens in the story or there are different probabilities for different outcomes.
3. Don't create `redirect` nodes with just one link, use `skip` node instead.
4. There must not be more than 5-6 endings. Don't create too many endings. Of course, if the reader makes a mistake and fails, it also can be an ending, but valid endings should not be more than 5-6.
5. Don't punish the reader with quick negative endings too much.
6. Aim to create long story threads that can entertwine with each other and lead to several endings eventually.
7. There also can be plot cycles that return to some earlier nodes.
8. Don't overuse the time traveling and parallel universe plots, keep it simple but engaging.
9. Use emoji, aim to use at least one emoji per node. Do not use universally available emojis. Use only those that work on both mobile and desktop.
10. You can also put an emoji on a separate text line to emphasize it's effect.
11. You can use `<b></b>` tags for bold text and `<i></i>` tags for italic, but don't overuse it.
12. Don't create long action labels, make them 2-3 words max. Use emoji in action labels (it is not necessary but add them where suitable).
13. Fill node `label` property with a short (2-3 words) title based on its content. I REPEAT AGAIN FILL THE node's `label`!
14. Don't make too many branches! Keep story relatively narrow with 4-5 parallel main story branches. If the branches grow, cut them or merge them at once, don't create 20 branches and then abruptly end them at once. I REPEAT AGAIN THERE MUST BE 5-6 VALID TERMINAL `finish` nodes not 20-30!!!
15. Don't create all actions with 3 choices. Create some with 2, some with 3, depending on the context. I REPEATE DON'T MAKE 3 ACTIONS EVERYWHERE USE A MIX OF 2-3.

## Story Validation

1. Check that all referenced nodes are added to the story.
2. When you fix the story and add missing nodes, don't overexpand the story. Finish the unfinished branches but don't do it abruptly, remember that there shouldn't be too many finish nodes.
3. Check that all nodes are reachable (other nodes reference them).
4. Story `id` must be a valid uuid.
5. Check that there are not too many `finish` nodes. Please remember that there should be around 5-6 valid terminal nodes. If there are too many, edit the story and reduce that amount of `finish` nodes.
