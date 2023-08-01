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

  /**
   * 浅比较
   */
  equals(other: EventId): boolean {
    return (
      this.timestamp === other.timestamp && this.clientId === other.clientId
    );
  }

  /**
   * 定义规则：
   * 1. Lamport Timestrap 越大越先执行
   * 2. clientId 越大越先执行
   */
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

  /**
   * 标识（墓碑机制）
   */
  delete() {
    this.isDeleted = true;
  }
}

export class DocNode {
  /**
   * 树形结构子节点
   */
  children: Map<EventId, DocNode> = new Map();

  constructor(public text: Text) {
    this.text = text;
  }

  /**
   * 生成树形结构
   * 注意：生成时把节点放在Map里，遍历时再进行序列化
   */
  addNode(node: DocNode) {
    if (!this.hasChildNode(node.text.id)) {
      this.children.set(node.text.id, node);
    }
  }

  /**
   * 子节点是否存在
   */
  hasChildNode(id: EventId): boolean {
    for (const [eventId] of this.children) {
      if (eventId.equals(id)) {
        return true;
      }
    }
    return false;
  }

  /**
   * 广度优先遍历树形结构
   * compare方法确认序列化顺序
   */
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
