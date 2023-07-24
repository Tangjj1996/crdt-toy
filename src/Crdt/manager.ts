export class LamportManager {
  private counter: number;

  constructor() {
    this.counter = 0;
  }

  next(): number {
    this.counter++;
    return this.counter;
  }

  update(timestamp: number) {
    if (timestamp > this.counter) {
      this.counter = timestamp;
    }
  }
}
