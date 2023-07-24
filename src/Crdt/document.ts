import { ActionBuilder, Action } from "./action";
import { EventId, Text, DocNode, ClientId } from "./node";
import { LamportManager } from "./manager";

export class Document {
  root: DocNode;
  lamportManager: LamportManager;
  actions: Action[] = [];

  constructor(private clientId: ClientId) {
    if (clientId === 0) {
      throw new Error("Client id must be greater than 0");
    }
    const root_text = new Text(new EventId(0, 0), new EventId(0, 0), "");
    this.root = new DocNode(root_text);
    this.lamportManager = new LamportManager();
  }

  addActionBuilder(action: ActionBuilder) {
    const pre_id = this.getPreId(action.position);
    const id = this.createId();
    const actionObj = action.build(pre_id, id);
    this.addAction(actionObj);
  }

  addActionBuilders(actions: ActionBuilder[]) {
    actions.forEach((action) => {
      this.addActionBuilder(action);
    });
  }

  content() {
    return this.root.toString();
  }

  merge(other: Document) {
    other.actions.forEach((action) => {
      this.addAction(action);
    });
  }

  private createId(): EventId {
    const id = this.lamportManager.next();
    return new EventId(id, this.clientId);
  }

  private addAction(action: Action) {
    if (this.actions.includes(action)) {
      return;
    }
    action.execute(this);
    this.lamportManager.update(action.id.timestamp);
    this.actions.push(action);
  }

  private getPreId(position: number): EventId {
    let pos = position;
    const q: DocNode[] = [this.root];

    while (q.length > 0) {
      const node = q.pop()!;
      if (!node.text.isDeleted) {
        if (pos === 0) {
          return node.text.id;
        }
        pos -= 1;
      }
      for (const child of node.children.values()) {
        q.push(child);
      }
    }

    return new EventId(0, this.clientId);
  }

  getNodeByIdMut(id: EventId): DocNode | undefined {
    if (
      this.root.text.id.timestamp === id.timestamp &&
      this.root.text.id.clientId === id.clientId
    ) {
      return this.root;
    } else {
      const q: DocNode[] = [this.root];

      while (q.length > 0) {
        const node = q.pop()!;
        if (
          node.text.id.timestamp === id.timestamp &&
          node.text.id.clientId === id.clientId
        ) {
          return node;
        }
        if (node.children.has(id)) {
          return node.children.get(id)!;
        }
        for (const child of node.children.values()) {
          q.push(child);
        }
      }
      return undefined;
    }
  }
}
