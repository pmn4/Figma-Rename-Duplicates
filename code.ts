const DEBUG = false;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function log(...args: any[]) {
  if (!DEBUG) return;

  console.log(...args);
}

// ----------------------------------FIGMA OBJECTS-------------------------------------

// Skip over invisible nodes and their descendants inside instances
// for faster performance.
figma.skipInvisibleInstanceChildren = true;

const frames = figma.currentPage.findAll(
  (node) => node.type === "FRAME" && node.parent?.type !== "FRAME"
);
const components = figma.currentPage.findAll(
  (node) => node.type === "COMPONENT" && node.parent?.type !== "COMPONENT"
);
const instances = figma.currentPage.findAll(
  (node) =>
    node.type === "INSTANCE" &&
    node.parent?.type !== "INSTANCE" &&
    node.parent?.type !== "FRAME" &&
    node.parent?.type !== "COMPONENT"
);
const allNodes = [...frames, ...instances, ...components];

// ----------------------------------FIND DUPLICATES------------------------------------

const duplicateGroups = new Map<string, SceneNode[]>();
allNodes.forEach((v) => {
  const { name } = v;

  const group = duplicateGroups.get(name);

  if (group) {
    group.push(v);
  } else {
    duplicateGroups.set(name, [v]);
  }
});
const duplicates = [...duplicateGroups.values()].filter((v) => v.length > 1);

// ----------------------------------SELECT OBJECTS-------------------------------------
if (duplicates.length > 0) {
  let i = -1;
  let focussedElementId: string | null = null;

  const handlePresentNextDuplicate = () => {
    ++i;
    if (i < duplicates.length) {
      figma.ui.postMessage({
        action: "present-duplicate",
        duplicateNodes: duplicates[i].map((d) => ({
          name: d.name,
          id: d.id,
        })),
        i,
        total: duplicates.length,
      });

      figma.currentPage.selection = duplicates[i];
      figma.viewport.scrollAndZoomIntoView(duplicates[i]);
    } else {
      figma.ui.close();
      figma.closePlugin("✅ Done!");
    }
  };

  figma.showUI(__html__, { themeColors: true });
  figma.ui.onmessage = (message) => {
    if (!message) return;

    switch (message.action) {
      case "skip-remaining":
        figma.closePlugin(
          `Skipping remaining ${duplicates.length - i} Duplicates`
        );
        break;
      case "skip":
        handlePresentNextDuplicate();
        break;
      case "save": {
        const { namesMap = [] } = message;

        namesMap.forEach(
          ({ id, name }: { id: string; name: string | null }) => {
            if (!name) return;
            const dup = duplicates[i].find((d) => d.id === id);
            if (!dup) return;

            log(`Renaming Node ${dup.id} from ${dup.name} to ${name}`);

            dup.name = name;
          }
        );

        handlePresentNextDuplicate();
        break;
      }
      case "input-focus": {
        const { id = null } = message;
        focussedElementId = id;

        const dup = duplicates[i].find((d) => d.id === focussedElementId);

        log("input-focus", { id, dup });

        if (dup) {
          figma.currentPage.selection = [dup];
          figma.viewport.scrollAndZoomIntoView([dup]);
        }

        break;
      }
      case "input-blur":
        log("input-blur", duplicates[i]);

        figma.currentPage.selection = duplicates[i];
        figma.viewport.scrollAndZoomIntoView(duplicates[i]);
        break;
    }
  };
  handlePresentNextDuplicate();
} else {
  figma.closePlugin("✅ No duplicates found");
}
