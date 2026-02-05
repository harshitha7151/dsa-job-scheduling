/**
 * DataStructures.js
 * Implements various data structures for DSA Lab: MinHeap, Queue, BST, HashMap, LinkedList
 */

// MinHeap Data Structure
class MinHeap {
    constructor() {
        this.heap = [];
    }

    insert(element) {
        this.heap.push(element);
        this._bubbleUp(this.heap.length - 1);
        return { size: this.heap.length };
    }

    extractMin() {
        if (this.heap.length === 0) return null;
        if (this.heap.length === 1) return this.heap.pop();
        
        const min = this.heap[0];
        this.heap[0] = this.heap.pop();
        this._bubbleDown(0);
        return min;
    }

    peek() {
        return this.heap.length > 0 ? this.heap[0] : null;
    }

    clear() {
        this.heap = [];
    }

    _bubbleUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.heap[parentIndex].priority <= this.heap[index].priority) break;
            
            [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
            index = parentIndex;
        }
    }

    _bubbleDown(index) {
        while (true) {
            let smallest = index;
            const left = 2 * index + 1;
            const right = 2 * index + 2;
            
            if (left < this.heap.length && this.heap[left].priority < this.heap[smallest].priority) {
                smallest = left;
            }
            if (right < this.heap.length && this.heap[right].priority < this.heap[smallest].priority) {
                smallest = right;
            }
            if (smallest === index) break;
            
            [this.heap[smallest], this.heap[index]] = [this.heap[index], this.heap[smallest]];
            index = smallest;
        }
    }
}

// Queue Data Structure
class Queue {
    constructor() {
        this.items = [];
    }

    enqueue(element) {
        this.items.push(element);
    }

    dequeue() {
        return this.items.length > 0 ? this.items.shift() : null;
    }

    front() {
        return this.items.length > 0 ? this.items[0] : null;
    }

    isEmpty() {
        return this.items.length === 0;
    }

    size() {
        return this.items.length;
    }

    clear() {
        this.items = [];
    }
}

// Binary Search Tree Data Structure
class BinarySearchTree {
    constructor() {
        this.root = null;
    }

    insert(value) {
        const newNode = { value, left: null, right: null };
        if (this.root === null) {
            this.root = newNode;
        } else {
            this._insertNode(this.root, newNode);
        }
    }

    _insertNode(node, newNode) {
        if (newNode.value < node.value) {
            if (node.left === null) {
                node.left = newNode;
            } else {
                this._insertNode(node.left, newNode);
            }
        } else {
            if (node.right === null) {
                node.right = newNode;
            } else {
                this._insertNode(node.right, newNode);
            }
        }
    }

    delete(value) {
        this.root = this._deleteNode(this.root, value);
    }

    _deleteNode(node, value) {
        if (node === null) return null;
        
        if (value < node.value) {
            node.left = this._deleteNode(node.left, value);
        } else if (value > node.value) {
            node.right = this._deleteNode(node.right, value);
        } else {
            if (node.left === null) return node.right;
            if (node.right === null) return node.left;
            
            let minRight = node.right;
            while (minRight.left !== null) minRight = minRight.left;
            node.value = minRight.value;
            node.right = this._deleteNode(node.right, minRight.value);
        }
        return node;
    }

    search(value) {
        return this._searchNode(this.root, value);
    }

    _searchNode(node, value) {
        if (node === null) return false;
        if (value === node.value) return true;
        if (value < node.value) return this._searchNode(node.left, value);
        return this._searchNode(node.right, value);
    }

    inorder() {
        const result = [];
        this._inorderTraverse(this.root, result);
        return result;
    }

    _inorderTraverse(node, result) {
        if (node !== null) {
            this._inorderTraverse(node.left, result);
            result.push(node.value);
            this._inorderTraverse(node.right, result);
        }
    }

    preorder() {
        const result = [];
        this._preorderTraverse(this.root, result);
        return result;
    }

    _preorderTraverse(node, result) {
        if (node !== null) {
            result.push(node.value);
            this._preorderTraverse(node.left, result);
            this._preorderTraverse(node.right, result);
        }
    }

    postorder() {
        const result = [];
        this._postorderTraverse(this.root, result);
        return result;
    }

    _postorderTraverse(node, result) {
        if (node !== null) {
            this._postorderTraverse(node.left, result);
            this._postorderTraverse(node.right, result);
            result.push(node.value);
        }
    }

    clear() {
        this.root = null;
    }
}

// HashMap Data Structure
class HashMap {
    constructor(size = 16) {
        this.size = size;
        this.buckets = Array(size).fill(null).map(() => []);
    }

    _hash(key) {
        let hash = 0;
        for (let i = 0; i < key.length; i++) {
            hash = ((hash << 5) - hash) + key.charCodeAt(i);
            hash = hash & hash;
        }
        return Math.abs(hash) % this.size;
    }

    put(key, value) {
        const index = this._hash(key);
        const bucket = this.buckets[index];
        
        for (let i = 0; i < bucket.length; i++) {
            if (bucket[i][0] === key) {
                bucket[i][1] = value;
                return { index, collision: false };
            }
        }
        
        bucket.push([key, value]);
        return { index, collision: bucket.length > 1 };
    }

    get(key) {
        const index = this._hash(key);
        const bucket = this.buckets[index];
        
        for (const [k, v] of bucket) {
            if (k === key) return v;
        }
        return null;
    }

    remove(key) {
        const index = this._hash(key);
        const bucket = this.buckets[index];
        
        for (let i = 0; i < bucket.length; i++) {
            if (bucket[i][0] === key) {
                bucket.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    clear() {
        this.buckets = Array(this.size).fill(null).map(() => []);
    }
}

// LinkedList Data Structure
class LinkedList {
    constructor() {
        this.head = null;
        this.tail = null;
        this.length = 0;
    }

    append(data) {
        const node = { data, next: null };
        if (this.head === null) {
            this.head = node;
            this.tail = node;
        } else {
            this.tail.next = node;
            this.tail = node;
        }
        this.length++;
    }

    delete(data) {
        if (this.head === null) return false;
        
        if (this.head.data.name === data.name) {
            this.head = this.head.next;
            this.length--;
            if (this.length === 0) this.tail = null;
            return true;
        }
        
        let current = this.head;
        while (current.next !== null) {
            if (current.next.data.name === data.name) {
                current.next = current.next.next;
                if (current.next === null) this.tail = current;
                this.length--;
                return true;
            }
            current = current.next;
        }
        return false;
    }

    reverse() {
        if (this.length <= 1) return;
        
        let prev = null;
        let current = this.head;
        this.tail = current;
        
        while (current !== null) {
            const next = current.next;
            current.next = prev;
            prev = current;
            current = next;
        }
        
        this.head = prev;
    }

    clear() {
        this.head = null;
        this.tail = null;
        this.length = 0;
    }

    size() {
        return this.length;
    }
}
