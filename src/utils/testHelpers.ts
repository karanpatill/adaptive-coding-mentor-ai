import { ListNode, TreeNode, helpers } from './evaluator';

const { linkedListToArray, treeToArray } = helpers;

export const testHelpers = {
  // Deep comparison for arrays/objects
  isEqual: (a: unknown, b: unknown): boolean => {
    return JSON.stringify(a) === JSON.stringify(b);
  },

  // Linked list comparison
  compareLinkedLists: (head: ListNode | null, expectedArr: number[]): boolean => {
    const got = linkedListToArray(head);
    return JSON.stringify(got) === JSON.stringify(expectedArr);
  },

  // Tree comparison (level-order)
  compareTrees: (root: TreeNode | null, expectedArr: (number | null)[]): boolean => {
    const got = treeToArray(root);
    return JSON.stringify(got) === JSON.stringify(expectedArr);
  },

  // Set-based comparison (ignore order)
  compareArraysIgnoreOrder: (a: unknown[], b: unknown[]): boolean => {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort((x, y) => JSON.stringify(x).localeCompare(JSON.stringify(y)));
    const sortedB = [...b].sort((x, y) => JSON.stringify(x).localeCompare(JSON.stringify(y)));
    return JSON.stringify(sortedA) === JSON.stringify(sortedB);
  }
};
