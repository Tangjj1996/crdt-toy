import { ActionBuilder, Action } from "./action";
import { EventId, Text, DocNode, ClientId } from "./node";
import { LamportManager } from "./manager";

export class Document {
  /**
   * 根结点
   */
  root: DocNode;
  /**
   * Lamport Timestrap Manage
   */
  lamportManager: LamportManager;
  /**
   * 所有的操作都会保存在actions中
   */
  actions: Action[] = [];

  /**
   * 实例化
   * 1. 赋值clientId
   * 2. 新增一个空的节点root
   * 3. 实例化一个Lamport Timestrap
   */
  constructor(private clientId: ClientId) {
    if (clientId === 0) {
      throw new Error("Client id must be greater than 0");
    }
    const rootText = new Text(new EventId(0, 0), new EventId(0, 0), "");
    this.root = new DocNode(rootText);
    this.lamportManager = new LamportManager();
  }

  /**
   * 1. 根据位置拿到preId
   * 2. counter + 1，更新Lamport Timestrap(只要是action，都要 + 1)
   * 3. 根据preId、Id，创建一个aciton
   * 4. 执行action
   */
  addActionBuilder(action: ActionBuilder) {
    const preId = this.getPreId(action.position);
    const id = this.createId();
    const actionObj = action.build(preId, id);
    this.addAction(actionObj);
  }

  addActionBuilders(actions: ActionBuilder[]) {
    actions.forEach((action) => {
      this.addActionBuilder(action);
    });
  }

  /**
   * 从root开始
   * 广度优先
   * 根据EventId compare方法序列化遍历
   */
  content() {
    return this.root.toString();
  }

  /**
   * 消息同步
   */
  merge(other: Document) {
    other.actions.forEach((action) => {
      this.addAction(action);
    });
  }

  /**
   * 每次操作都要counter + 1
   */
  private createId(): EventId {
    const id = this.lamportManager.next();
    return new EventId(id, this.clientId);
  }

  /**
   * 1. 操作执行
   * 2. 更新Lamport Timestrap
   * 3. 把所有操作都放在actions中，多叉树的生成就是由action决定
   */
  private addAction(action: Action) {
    if (this.actions.includes(action)) {
      return;
    }
    action.execute(this);
    this.lamportManager.update(action.id.timestamp);
    this.actions.push(action);
  }

  /**
   * 根据位置，广度优先遍历
   * 拿到preId
   */
  private getPreId(position: number): EventId {
    let pos = position;
    const docNode: DocNode[] = [this.root];

    while (docNode.length > 0) {
      const node = docNode.pop()!;
      if (!node.text.isDeleted) {
        if (pos === 0) {
          return node.text.id;
        }
        pos -= 1;
      }
      for (const child of node.children.values()) {
        docNode.push(child);
      }
    }

    return new EventId(0, this.clientId);
  }

  /**
   * 根据id找到DocNode
   */
  getNodeByIdMut(id: EventId): DocNode | undefined {
    if (this.root.text.id.equals(id)) {
      return this.root;
    } else {
      const docNode: DocNode[] = [this.root];

      while (docNode.length > 0) {
        const node = docNode.pop()!;
        if (node.text.id.equals(id)) {
          return node;
        }
        if (node.hasChildNode(id)) {
          return node.children.get(id)!;
        }
        for (const child of node.children.values()) {
          docNode.push(child);
        }
      }
      return undefined;
    }
  }
}
