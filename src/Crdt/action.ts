import { Document } from "./document";
import { EventId, Text, DocNode } from "./node";

export enum ActionType {
  Add = "ADD",
  Delete = "DELETE",
}

export interface DocOperation {
  preId: EventId;
  id: EventId;
  value: string;
  execute(doc: Document): void;
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

  execute(doc: Document) {
    if (this.type === ActionType.Add) {
      this.executeAdd(doc);
    } else if (this.type === ActionType.Delete) {
      this.executeDelete(doc);
    }
  }

  private executeAdd(doc: Document) {
    const preNode = doc.getNodeByIdMut(this.preId);
    if (preNode) {
      const text = new Text(this.preId, this.id, this.value);
      const newNode = new DocNode(text);
      preNode.addNode(newNode);
    }
  }

  private executeDelete(doc: Document) {
    const preNode = doc.getNodeByIdMut(this.preId);
    if (preNode) {
      preNode.text.delete();
    }
  }
}

export class AddAction implements DocOperation {
  preId: EventId;
  id: EventId;
  value: string;

  constructor(preId: EventId, id: EventId, value: string) {
    this.preId = preId;
    this.id = id;
    this.value = value;
  }

  execute(doc: Document) {
    const preNode = doc.getNodeByIdMut(this.preId);
    if (preNode) {
      const text = new Text(this.preId, this.id, this.value);
      const newNode = new DocNode(text);
      preNode.addNode(newNode);
    }
  }
}

export class DeleteAction implements DocOperation {
  preId: EventId;
  id: EventId;
  value: string;

  constructor(preId: EventId, id: EventId, value: string) {
    this.preId = preId;
    this.id = id;
    this.value = value;
  }

  execute(doc: Document) {
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

  build(preId: EventId, id: EventId): Action {
    return new Action(this.action, preId, id, this.char);
  }
}
