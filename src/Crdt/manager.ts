export class LamportManager {
  private counter: number;

  constructor() {
    this.counter = 0;
  }

  /**
   * 自增
   */
  next(): number {
    this.counter++;
    return this.counter;
  }

  /**
   * 消息同步
   * 拿远程更大的值
   */
  update(timestamp: number) {
    if (timestamp > this.counter) {
      this.counter = timestamp;
    }
  }
}
