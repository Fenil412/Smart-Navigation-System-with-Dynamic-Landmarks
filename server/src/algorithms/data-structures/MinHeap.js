class MinHeap {
  constructor() {
    this.heap = [];
  }

  getParentIndex(index) {
    return Math.floor((index - 1) / 2);
  }

  getLeftChildIndex(index) {
    return 2 * index + 1;
  }

  getRightChildIndex(index) {
    return 2 * index + 2;
  }

  hasParent(index) {
    return this.getParentIndex(index) >= 0;
  }

  hasLeftChild(index) {
    return this.getLeftChildIndex(index) < this.heap.length;
  }

  hasRightChild(index) {
    return this.getRightChildIndex(index) < this.heap.length;
  }

  parent(index) {
    return this.heap[this.getParentIndex(index)];
  }

  leftChild(index) {
    return this.heap[this.getLeftChildIndex(index)];
  }

  rightChild(index) {
    return this.heap[this.getRightChildIndex(index)];
  }

  swap(index1, index2) {
    [this.heap[index1], this.heap[index2]] = [this.heap[index2], this.heap[index1]];
  }

  peek() {
    return this.heap.length > 0 ? this.heap[0] : null;
  }

  insert(value, priority) {
    const node = { value, priority };
    this.heap.push(node);
    this.heapifyUp();
  }

  comparePriority(a, b) {
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    // If we need to compare by k2 when k1 is equal
    if (a.value.key && b.value.key) {
      return a.value.key.k2 - b.value.key.k2;
    }
    return 0;
  }

  extractMin() {
    if (this.heap.length === 0) return null;
    const min = this.heap[0];
    this.heap[0] = this.heap[this.heap.length - 1];
    this.heap.pop();
    this.heapifyDown();
    return min;
  }

  remove(value) {
    const index = this.heap.findIndex(item => item.value === value);
    if (index === -1) return false;
    
    // Move the element to the end and remove it
    this.heap[index] = this.heap[this.heap.length - 1];
    this.heap.pop();
    
    // Re-heapify
    if (index < this.heap.length) {
      this.heapifyUp(index);
      this.heapifyDown(index);
    }
    
    return true;
  }

  heapifyUp(startIndex) {
    let index = startIndex;
    while (this.hasParent(index) && this.parent(index).priority > this.heap[index].priority) {
      this.swap(this.getParentIndex(index), index);
      index = this.getParentIndex(index);
    }
  }
  
  heapifyDown() {
    let index = 0;
    while (this.hasLeftChild(index)) {
      let smallerChildIndex = this.getLeftChildIndex(index);
      if (this.hasRightChild(index) && 
          this.comparePriority(this.heap[this.getRightChildIndex(index)], this.heap[smallerChildIndex]) < 0) {
        smallerChildIndex = this.getRightChildIndex(index);
      }

      if (this.comparePriority(this.heap[index], this.heap[smallerChildIndex]) < 0) {
        break;
      } else {
        this.swap(index, smallerChildIndex);
      }
      index = smallerChildIndex;
    }
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  size() {
    return this.heap.length;
  }
}

export default MinHeap;