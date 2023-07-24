export type LamportTimestamp = number;
export type ClientId = number;

export class EventId {
  constructor(
    public timestamp: LamportTimestamp,
    public clientId: ClientId,
  ) {
    this.timestamp = timestamp;
    this.clientId = clientId;
  }

  equals(other: EventId): boolean {
    return (
      this.timestamp === other.timestamp && this.clientId === other.clientId
    );
  }

  compare(other: EventId): number {
    if (this.timestamp === other.timestamp) {
      return this.clientId - other.clientId;
    }
    return this.timestamp - other.timestamp;
  }
}

export class Text {
  constructor(
    public preId: EventId,
    public id: EventId,
    public text: string,
    public isDeleted: boolean = false,
  ) {
    this.preId = preId;
    this.id = id;
    this.text = text;
    this.isDeleted = isDeleted;
  }

  delete() {
    this.isDeleted = true;
  }
}

export class DocNode {
  children: Map<EventId, DocNode> = new Map();

  constructor(public text: Text) {
    this.text = text;
  }

  addNode(node: DocNode) {
    if (!this.children.has(node.text.id)) {
      this.children.set(node.text.id, node);
    }
  }

  hasNode(id: EventId): boolean {
    return this.children.has(id);
  }

  toString(): string {
    let s = "";
    if (!this.text.isDeleted) {
      s += this.text.text;
    } else {
      s += "";
    }
    for (const key of Array.from(this.children.keys()).sort((a, b) =>
      b.compare(a),
    )) {
      s += this.children.get(key)!.toString();
    }
    return s;
  }
}
