type ModalCloseHandler = () => void;

class ModalStackManager {
  private stack: { id: string; close: ModalCloseHandler; zIndex: number }[] = [];
  private baseZIndex = 70;

  push(id: string, close: ModalCloseHandler): number {
    this.stack = this.stack.filter((m) => m.id !== id);
    const zIndex = this.baseZIndex + this.stack.length * 10;
    this.stack.push({ id, close, zIndex });
    return zIndex;
  }

  pop(id: string): void {
    this.stack = this.stack.filter((m) => m.id !== id);
  }

  handleEscape(): boolean {
    if (this.stack.length === 0) return false;
    const top = this.stack[this.stack.length - 1];
    top.close();
    return true;
  }

  getTopId(): string | null {
    return this.stack.length > 0 ? this.stack[this.stack.length - 1].id : null;
  }
}

export const modalStack = new ModalStackManager();
