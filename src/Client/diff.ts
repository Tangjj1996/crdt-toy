import * as jsdiff from "diff";

export const diff = (oldStr: string, newStr: string) => {
  const changes = jsdiff.diffChars(oldStr, newStr);
  // 当前字符在字符串中的位置
  let index = 0;

  // 存储每个位置的差异信息
  const infoMap = new Map();

  for (const change of changes) {
    let infos = infoMap.get(index);

    if (change.added) {
      if (!infos) {
        infos = [];
        // 该位置的字符信息存入「infoMap」
        infoMap.set(index, infos);
      }
      infos.push({ operat: "ADD", chars: change.value });
    }

    if (change.removed) {
      if (!infos) {
        infos = [];
        /**
         * 该位置字符的信息存入「infoMap」
         * root的position为0，子节点需要从1开始
         * */
        infoMap.set(index + 1, infos);
      }
      infos.push({ operat: "DELETE", chars: change.value });
    }

    if (!change.removed) {
      // 这里就不需要 + 1了
      index += change.count as number;
    }
  }
  let actions = [];
  for (const [position, infos] of infoMap) {
    actions.push({ position, infos });
  }
  /**
   * 因为操作的最小单位是char，我们希望把[{ opeat: 'DELETE', chars: 'lo' }]这样的操作
   * 拆分成[{ action: 'DELETE', char: 'o' }, { action: 'DELETE', char: 'l' }]
   */
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
