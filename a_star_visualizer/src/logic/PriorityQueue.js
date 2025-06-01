// Priority Queue implementation for A* algorithm
export default class PriorityQueue {
  constructor() {
    this.elements = [];
  }
  
  empty() {
    return this.elements.length === 0;
  }
  
  put(item, priority) {
    this.elements.push({ item, priority });
    this._sort();
  }
  
  get() {
    if (this.empty()) throw new Error("Priority queue is empty");
    return this.elements.shift().item;
  }
  
  _sort() {
    this.elements.sort((a, b) => a.priority - b.priority);
  }
  
  contains(item) {
    return this.elements.some(element => element.item === item);
  }
  
  update_priority(item, newPriority) {
    const index = this.elements.findIndex(element => element.item === item);
    if (index !== -1 && this.elements[index].priority > newPriority) {
      this.elements[index].priority = newPriority;
      this._sort();
      return true;
    }
    return false;
  }
}