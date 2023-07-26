import { Document } from "./document";
import { EventId, Text, DocNode } from "./node";

export enum ActionType {
  Add = "ADD",
  Delete = "DELETE",
}

export class Action {
  type: ActionType;
  preId: EventId;
  id: EventId;
  value: string;

  constructor(type: ActionType, preId: EventId, id: EventId, value: string) {
    this.type = type;
    this.preId = preId;
    this.id = id;
    this.value = value;
  }

  /**
   * 根据actionType执行不同方法
   */
  execute(doc: Document) {
    if (this.type === ActionType.Add) {
      this.executeAdd(doc);
    } else if (this.type === ActionType.Delete) {
      this.executeDelete(doc);
    }
  }

  /**
   * 1. 找到父节点
   * 2. 在父节点下生成节点（树形结构的生成）
   */
  private executeAdd(doc: Document) {
    const preNode = doc.getNodeByIdMut(this.preId);
    if (preNode) {
      const text = new Text(this.preId, this.id, this.value);
      const newNode = new DocNode(text);
      preNode.addNode(newNode);
    }
  }

  /**
   * 标记该节点是「删除」
   * 序列化忽略该节点
   */
  private executeDelete(doc: Document) {
    const preNode = doc.getNodeByIdMut(this.preId);
    if (preNode) {
      preNode.text.delete();
    }
  }
}

export class ActionBuilder {
  position: number;
  action: ActionType;
  char: string;

  constructor(position: number, action: ActionType, char: string) {
    this.position = position;
    this.action = action;
    this.char = char;
  }

  /**
   * 创建一个action
   */
  build(preId: EventId, id: EventId): Action {
    return new Action(this.action, preId, id, this.char);
  }
}
