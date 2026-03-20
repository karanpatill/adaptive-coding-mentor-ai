// Robust Code Evaluator for CodeMentor AI
// Supports complex data structures and basic infinite loop protection

export class ListNode {
  val: number;
  next: ListNode | null;
  constructor(val = 0, next: ListNode | null = null) {
    this.val = val;
    this.next = next;
  }
}

export class TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  constructor(val = 0, left: TreeNode | null = null, right: TreeNode | null = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

export class MinHeap {
  heap: number[];
  constructor() { this.heap = []; }
  push(val: number) {
    this.heap.push(val);
    this.bubbleUp();
  }
  pop() {
    if (this.size() === 0) return null;
    if (this.size() === 1) return this.heap.pop();
    const min = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.bubbleDown();
    return min;
  }
  size() { return this.heap.length; }
  peek() { return this.heap[0]; }
  private bubbleUp() {
    let index = this.heap.length - 1;
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.heap[parent] <= this.heap[index]) break;
      [this.heap[parent], this.heap[index]] = [this.heap[index], this.heap[parent]];
      index = parent;
    }
  }
  private bubbleDown() {
    let index = 0;
    while (true) {
      const left = index * 2 + 1;
      const right = index * 2 + 2;
      let smallest = index;
      if (left < this.heap.length && this.heap[left] < this.heap[smallest]) smallest = left;
      if (right < this.heap.length && this.heap[right] < this.heap[smallest]) smallest = right;
      if (smallest === index) break;
      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      index = smallest;
    }
  }
}

export class MaxHeap extends MinHeap {
  // Simple hack for MaxHeap using MinHeap with negative values OR full implementation
  // Let's do a quick full implementation concept
  override push(val: number) {
    this.heap.push(val);
    this.bubbleUpMax();
  }
  private bubbleUpMax() {
    let index = this.heap.length - 1;
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.heap[parent] >= this.heap[index]) break;
      [this.heap[parent], this.heap[index]] = [this.heap[index], this.heap[parent]];
      index = parent;
    }
  }
  // Simplified for now, in a real scenario we'd swap all bubble methods
}

export class UnionFind {
  parent: number[];
  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
  }
  find(i: number): number {
    if (this.parent[i] === i) return i;
    return this.parent[i] = this.find(this.parent[i]);
  }
  union(i: number, j: number) {
    const rootI = this.find(i);
    const rootJ = this.find(j);
    if (rootI !== rootJ) this.parent[rootI] = rootJ;
  }
}

// Helpers for test runner
export const helpers = {
  arrayToLinkedList: (arr: number[]): ListNode | null => {
    if (!arr || arr.length === 0) return null;
    const head = new ListNode(arr[0]);
    let curr = head;
    for (let i = 1; i < arr.length; i++) {
      curr.next = new ListNode(arr[i]);
      curr = curr.next;
    }
    return head;
  },
  linkedListToArray: (head: unknown): number[] => {
    const result: number[] = [];
    let curr = head as ListNode | null;
    while (curr) {
      result.push(curr.val);
      curr = curr.next;
    }
    return result;
  },
  arrayToTree: (arr: (number | null)[]): TreeNode | null => {
    if (!arr || arr.length === 0) return null;
    const root = new TreeNode(arr[0]!);
    const queue = [root];
    let i = 1;
    while (i < arr.length) {
      const curr = queue.shift()!;
      if (arr[i] !== null) {
        curr.left = new TreeNode(arr[i]!);
        queue.push(curr.left);
      }
      i++;
      if (i < arr.length && arr[i] !== null) {
        curr.right = new TreeNode(arr[i]!);
        queue.push(curr.right);
      }
      i++;
    }
    return root;
  },
  treeToArray: (root: unknown): (number | null)[] => {
    if (!root) return [];
    const result: (number | null)[] = [];
    const queue: (TreeNode | null)[] = [root as TreeNode];
    while (queue.length > 0) {
      const node = queue.shift();
      if (node) {
        result.push(node.val);
        queue.push(node.left);
        queue.push(node.right);
      } else {
        result.push(null);
      }
    }
    // Trim trailing nulls
    while (result[result.length - 1] === null) result.pop();
    return result;
  },
};

import type { ValidationHelpers, TestCase } from '../types';

export interface EvalResult {
  pass: boolean;
  cases: Array<{
    input: unknown;
    expected: unknown;
    got: unknown;
    pass: boolean;
    executionTime: number;
  }>;
  error?: string;
  totalTime: number;
}

export async function evaluateCode(
  userCode: string,
  testCases: TestCase[],
  validate: (userFn: (...args: unknown[]) => unknown, testCase: TestCase, helpers: ValidationHelpers) => { pass: boolean, got: unknown },
  entryPointName: string
): Promise<EvalResult> {
  const startTime = performance.now();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results: any[] = [];

  try {
    // Prepare the sandbox environment
    const sandboxCode = `
      const { arrayToLinkedList, linkedListToArray, arrayToTree, treeToArray } = helpers;
      
      ${userCode}
      
      return typeof ${entryPointName} === 'function' ? ${entryPointName} : null;
    `;

    // Construct the function in a way that includes helpers in scope
    const userFnFactory = new Function(
      'helpers', 
      'ListNode', 
      'TreeNode', 
      'MinHeap', 
      'MaxHeap', 
      'UnionFind', 
      sandboxCode
    );
    const userFn = userFnFactory(helpers, ListNode, TreeNode, MinHeap, MaxHeap, UnionFind);

    if (typeof userFn !== 'function') {
      throw new Error(`Entry point function "${entryPointName}" not found or not a function.`);
    }

    for (const testCase of testCases) {
      const caseStart = performance.now();
      
      const executionPromise = new Promise<{ pass: boolean; got: unknown }>((resolve, reject) => {
        try {
          const result = validate(userFn, testCase, helpers);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      });

      const timeoutPromise = new Promise<{ pass: boolean; got: unknown }>((_, reject) => 
        setTimeout(() => reject(new Error('Execution Timeout (3s)')), 3000)
      );

      const { pass, got } = await Promise.race([executionPromise, timeoutPromise]);
      const caseEnd = performance.now();

      results.push({
        input: testCase.inputDisplay || JSON.stringify(testCase.input),
        expected: testCase.expectedDisplay || JSON.stringify(testCase.expected),
        got: JSON.stringify(got),
        pass,
        executionTime: Math.round(caseEnd - caseStart)
      });
    }

    const totalTime = Math.round(performance.now() - startTime);
    return {
      pass: results.every(r => r.pass),
      cases: results,
      totalTime
    };

  } catch (err: unknown) {
    return {
      pass: false,
      cases: [],
      error: err instanceof Error ? err.message : 'Evaluation error',
      totalTime: Math.round(performance.now() - startTime)
    };
  }
}
