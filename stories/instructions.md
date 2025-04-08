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
11. `position` array it used to place nodes in the visual editor. Keep in mind that every node is around 200 px wide and 400+ px high.
12. Use `example.json` as an additional reference for the story file structure.

## Story Creation Process

1. When you create a story, please, create a new folder in the `stories` folder. You can name it like `story-1` or similar to that.
2. Create a `plan.md` file for a new story, put the story setting, plan and key story points into it. Also, define possible endings to the story.
3. Create a story file named `story.json` in that folder. Use `plan.md` for reference.
4. Create 50-100 nodes for the story, don't make it very big.
