import * as jsdiff from "diff";

export const diff = (oldStr: string, newStr: string) => {
  const changes = jsdiff.diffChars(oldStr, newStr);
  let index = 0;

  const infoMap = new Map();

  for (const change of changes) {
    let infos = infoMap.get(index);

    if (change.added) {
      if (!infos) {
        infos = [];
        infoMap.set(index, infos);
      }
      infos.push({ operat: "ADD", chars: change.value });
    }

    if (change.removed) {
      if (!infos) {
        infos = [];
        infoMap.set(index + 1, infos);
      }
      infos.push({ operat: "DELETE", chars: change.value });
    }

    if (!change.removed) {
      index += change.count as number;
    }
  }
  let actions = [];
  for (const [position, infos] of infoMap) {
    actions.push({ position, infos });
  }
  actions = getActions(actions);
  return actions;
};

function getActions(oldActions: any[]) {
  const actions = [];
  for (const oldAction of oldActions) {
    for (const info of oldAction.infos) {
      let index = 0;
      const chars = info.chars.split("");
      if (info.operat === "DELETE") {
        index = chars.length - 1;
        chars.reverse();
      }
      for (const char of chars) {
        const realPosition = oldAction.position + index;
        if (info.operat === "DELETE") {
          index--;
        } else {
          index++;
        }
        actions.push({ position: realPosition, action: info.operat, char });
      }
    }
  }
  return actions;
}
