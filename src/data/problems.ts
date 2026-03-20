import type { Problem, TestCase, ValidationHelpers } from '../types';
import { testHelpers } from '../utils/testHelpers';

const { isEqual, compareLinkedLists, compareTrees, compareArraysIgnoreOrder } = testHelpers;

export const problems: Problem[] = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'easy' as const,
    description: 'Given an array of integers and a target, return indices of the two numbers that add up to the target.',
    hint: 'Use a hash map to store complements as you iterate — O(n) is achievable.',
    tags: ['array', 'hash-map'],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  // Your code here
}`,
      python: `from typing import List

def two_sum(nums: List[int], target: int) -> List[int]:
    # Your code here
    pass`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
        return new int[]{};
    }
}`,
      cpp: `#include <vector>
#include <unordered_map>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    // Your code here
    return {};
}`,
    },
    testCases: [
      { input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1], inputDisplay: '[2,7,11,15], target=9', expectedDisplay: '[0,1]' },
      { input: { nums: [3, 2, 4], target: 6 }, expected: [1, 2], inputDisplay: '[3,2,4], target=6', expectedDisplay: '[1,2]' },
      { input: { nums: [3, 3], target: 6 }, expected: [0, 1], inputDisplay: '[3,3], target=6', expectedDisplay: '[0,1]' },
    ],
    validate: (userFn: (...args: unknown[]) => unknown, testCase: TestCase) => {
      const input = testCase.input as { nums: number[]; target: number };
      const got = userFn(input.nums, input.target);
      return { pass: compareArraysIgnoreOrder(got as unknown[], testCase.expected as unknown[]), got };
    },
  },
  {
    id: 'palindrome-check',
    title: 'Palindrome Check',
    difficulty: 'easy' as const,
    description: 'Given a string, determine if it is a palindrome, considering only alphanumeric characters and ignoring cases.',
    hint: 'Use two pointers from both ends, skip non-alphanumeric characters on each step.',
    tags: ['string', 'two-pointers'],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    starterCode: {
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isPalindrome(s) {
  // Your code here
}`,
      python: `def is_palindrome(s: str) -> bool:
    # Your code here
    pass`,
      java: `class Solution {
    public boolean isPalindrome(String s) {
        // Your code here
        return false;
    }
}`,
      cpp: `#include <string>
using namespace std;

bool isPalindrome(string s) {
    // Your code here
    return false;
}`,
    },
    testCases: [
      { input: "A man, a plan, a canal: Panama", expected: true, inputDisplay: '"A man, a plan, a canal: Panama"', expectedDisplay: 'true' },
      { input: "race a car", expected: false, inputDisplay: '"race a car"', expectedDisplay: 'false' },
      { input: " ", expected: true, inputDisplay: '" "', expectedDisplay: 'true' },
    ],
    validate: (userFn: (...args: unknown[]) => unknown, testCase: TestCase) => {
      const got = userFn(testCase.input);
      return { pass: got === testCase.expected, got };
    },
  },
  {
    id: 'fizzbuzz',
    title: 'FizzBuzz',
    difficulty: 'easy' as const,
    description: 'Return an array of strings for numbers 1 to n: "Fizz" for multiples of 3, "Buzz" for multiples of 5, "FizzBuzz" for both.',
    hint: 'Check divisibility by 15 first (both 3 and 5), then by 3, then by 5 — order matters.',
    tags: ['math', 'string'],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    starterCode: {
      javascript: `/**
 * @param {number} n
 * @return {string[]}
 */
function fizzBuzz(n) {
  // Your code here
}`,
      python: `from typing import List

def fizz_buzz(n: int) -> List[str]:
    # Your code here
    pass`,
      java: `import java.util.List;
import java.util.ArrayList;

class Solution {
    public List<String> fizzBuzz(int n) {
        // Your code here
        return new ArrayList<>();
    }
}`,
      cpp: `#include <vector>
#include <string>
using namespace std;

vector<string> fizzBuzz(int n) {
    // Your code here
    return {};
}`,
    },
    testCases: [
      { input: 3, expected: ["1", "2", "Fizz"], inputDisplay: "n=3", expectedDisplay: '["1","2","Fizz"]' },
      { input: 5, expected: ["1", "2", "Fizz", "4", "Buzz"], inputDisplay: "n=5", expectedDisplay: '["1","2","Fizz","4","Buzz"]' },
      { input: 15, expected: ["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"], inputDisplay: "n=15", expectedDisplay: "..." },
    ],
    validate: (userFn: (...args: unknown[]) => unknown, testCase: TestCase) => {
      const got = userFn(testCase.input);
      return { pass: isEqual(got, testCase.expected), got };
    },
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'medium' as const,
    description: 'Given a string containing just brackets, determine if the input string is valid — each open bracket must be closed in the correct order.',
    hint: 'Use a stack: push opening brackets, pop and verify matching when you see a closing bracket.',
    tags: ['stack', 'string'],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    starterCode: {
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
  // Your code here
}`,
      python: `def is_valid(s: str) -> bool:
    # Your code here
    pass`,
      java: `import java.util.Stack;

class Solution {
    public boolean isValid(String s) {
        // Your code here
        return false;
    }
}`,
      cpp: `#include <string>
#include <stack>
using namespace std;

bool isValid(string s) {
    // Your code here
    return false;
}`,
    },
    testCases: [
      { input: "()", expected: true, inputDisplay: '"()"', expectedDisplay: "true" },
      { input: "()[]{}", expected: true, inputDisplay: '"()[]{}"', expectedDisplay: "true" },
      { input: "(]", expected: false, inputDisplay: '"(]"', expectedDisplay: "false" },
      { input: "([)]", expected: false, inputDisplay: '"([)]"', expectedDisplay: "false" },
      { input: "{[]}", expected: true, inputDisplay: '"{[]}"', expectedDisplay: "true" },
    ],
    validate: (userFn: (...args: unknown[]) => unknown, testCase: TestCase) => {
      const got = userFn(testCase.input);
      return { pass: got === testCase.expected, got };
    },
  },
  {
    id: 'fibonacci',
    title: 'Fibonacci N-th Term',
    difficulty: 'medium' as const,
    description: 'Calculate the n-th Fibonacci number where F(0)=0, F(1)=1, and F(n)=F(n-1)+F(n-2).',
    hint: 'Avoid naive recursion (exponential) — use dynamic programming with O(n) or even O(1) space.',
    tags: ['dynamic-programming', 'math'],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    starterCode: {
      javascript: `/**
 * @param {number} n
 * @return {number}
 */
function fib(n) {
  // Your code here
}`,
      python: `def fib(n: int) -> int:
    # Your code here
    pass`,
      java: `class Solution {
    public int fib(int n) {
        // Your code here
        return 0;
    }
}`,
      cpp: `int fib(int n) {
    // Your code here
    return 0;
}`,
    },
    testCases: [
      { input: 0, expected: 0, inputDisplay: "n=0", expectedDisplay: "0" },
      { input: 1, expected: 1, inputDisplay: "n=1", expectedDisplay: "1" },
      { input: 4, expected: 3, inputDisplay: "n=4", expectedDisplay: "3" },
      { input: 10, expected: 55, inputDisplay: "n=10", expectedDisplay: "55" },
    ],
    validate: (userFn: (...args: unknown[]) => unknown, testCase: TestCase) => {
      const got = userFn(testCase.input);
      return { pass: got === testCase.expected, got };
    },
  },
  {
    id: 'merge-sorted-arrays',
    title: 'Merge Two Sorted Arrays',
    difficulty: 'hard' as const,
    description: 'Given two sorted arrays nums1 and nums2, merge nums2 into nums1 as one sorted array in-place.',
    hint: 'Start filling from the end of nums1 using two pointers; this avoids shifting elements.',
    tags: ['array', 'two-pointers', 'sorting'],
    timeComplexity: 'O(m+n)',
    spaceComplexity: 'O(1)',
    starterCode: {
      javascript: `/**
 * @param {number[]} nums1
 * @param {number} m
 * @param {number[]} nums2
 * @param {number} n
 * @return {void}
 */
function merge(nums1, m, nums2, n) {
  // Your code here
}`,
      python: `from typing import List

def merge(nums1: List[int], m: int, nums2: List[int], n: int) -> None:
    # Your code here (do not return anything, modify nums1 in-place)
    pass`,
      java: `class Solution {
    public void merge(int[] nums1, int m, int[] nums2, int n) {
        // Your code here
    }
}`,
      cpp: `#include <vector>
using namespace std;

void merge(vector<int>& nums1, int m, vector<int>& nums2, int n) {
    // Your code here
}`,
    },
    testCases: [
      { input: { nums1: [1,2,3,0,0,0], m: 3, nums2: [2,5,6], n: 3 }, expected: [1,2,2,3,5,6], inputDisplay: "nums1=[1,2,3,0,0,0], nums2=[2,5,6]", expectedDisplay: "[1,2,2,3,5,6]" },
      { input: { nums1: [1], m: 1, nums2: [], n: 0 }, expected: [1], inputDisplay: "nums1=[1], nums2=[]", expectedDisplay: "[1]" },
      { input: { nums1: [0], m: 0, nums2: [1], n: 1 }, expected: [1], inputDisplay: "nums1=[0], nums2=[1]", expectedDisplay: "[1]" },
    ],
    validate: (userFn: (...args: unknown[]) => unknown, testCase: TestCase) => {
      const input = testCase.input as { nums1: number[]; m: number; nums2: number[]; n: number };
      const nums1 = [...input.nums1];
      userFn(nums1, input.m, input.nums2, input.n);
      return { pass: isEqual(nums1, testCase.expected), got: nums1 };
    },
  },
  {
    id: 'binary-search',
    title: 'Binary Search',
    difficulty: 'easy' as const,
    description: 'Given a sorted array of integers and a target, return its index if found, otherwise return -1.',
    hint: 'Divide and conquer: compare the target with the middle element and adjust your search range.',
    tags: ['array', 'binary-search'],
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
function search(nums, target) {
  // Your code here
}`,
      python: `from typing import List

def search(nums: List[int], target: int) -> int:
    # Your code here
    pass`,
      java: `class Solution {
    public int search(int[] nums, int target) {
        // Your code here
        return -1;
    }
}`,
      cpp: `#include <vector>
using namespace std;

int search(vector<int>& nums, int target) {
    // Your code here
    return -1;
}`,
    },
    testCases: [
      { input: { nums: [-1,0,3,5,9,12], target: 9 }, expected: 4, inputDisplay: "[-1,0,3,5,9,12], target=9", expectedDisplay: "4" },
      { input: { nums: [-1,0,3,5,9,12], target: 2 }, expected: -1, inputDisplay: "[-1,0,3,5,9,12], target=2", expectedDisplay: "-1" },
    ],
    validate: (userFn: (...args: unknown[]) => unknown, testCase: TestCase) => {
      const input = testCase.input as { nums: number[]; target: number };
      const got = userFn(input.nums, input.target);
      return { pass: got === testCase.expected, got };
    },
  },
  {
    id: 'reverse-ll',
    title: 'Reverse Linked List',
    difficulty: 'easy' as const,
    description: 'Given the head of a singly linked list, reverse the list and return the new head.',
    hint: 'Iterate through the list and change each node\'s next pointer to the previous node.',
    tags: ['linked-list'],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    starterCode: {
      javascript: `/**
 * Input: head = [1,2,3,4,5]
 * Output: [5,4,3,2,1]
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
function reverseList(head) {
  // Your code here
}`,
      python: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def reverse_list(head: ListNode) -> ListNode:
    # Your code here
    pass`,
      java: `class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

class Solution {
    public ListNode reverseList(ListNode head) {
        // Your code here
        return null;
    }
}`,
      cpp: `struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};

ListNode* reverseList(ListNode* head) {
    // Your code here
    return nullptr;
}`,
    },
    testCases: [
      { input: [1,2,3,4,5], expected: [5,4,3,2,1], inputDisplay: '[1,2,3,4,5]', expectedDisplay: '[5,4,3,2,1]' },
      { input: [1,2], expected: [2,1], inputDisplay: '[1,2]', expectedDisplay: '[2,1]' },
    ],
    validate: (userFn: (...args: unknown[]) => unknown, testCase: TestCase, helpers: any) => {
      const head = helpers.arrayToLinkedList(testCase.input);
      const reversed = userFn(head);
      const got = helpers.linkedListToArray(reversed);
      return { pass: isEqual(got, testCase.expected), got };
    },
  },
  {
    id: 'longest-substring',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'medium' as const,
    description: 'Given a string, find the length of the longest substring without repeating characters.',
    hint: 'Use a sliding window (two pointers) and a set or map to track characters in the current window.',
    tags: ['string', 'sliding-window', 'hash-map'],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(min(n, m))',
    starterCode: {
      javascript: `/**
 * @param {string} s
 * @return {number}
 */
function lengthOfLongestSubstring(s) {
  // Your code here
}`,
      python: `def length_of_longest_substring(s: str) -> int:
    # Your code here
    pass`,
      java: `class Solution {
    public int lengthOfLongestSubstring(String s) {
        // Your code here
        return 0;
    }
}`,
      cpp: `#include <string>
#include <unordered_set>
using namespace std;

int lengthOfLongestSubstring(string s) {
    // Your code here
    return 0;
}`,
    },
    testCases: [
      { input: "abcabcbb", expected: 3, inputDisplay: '"abcabcbb"', expectedDisplay: "3" },
      { input: "bbbbb", expected: 1, inputDisplay: '"bbbbb"', expectedDisplay: "1" },
      { input: "pwwkew", expected: 3, inputDisplay: '"pwwkew"', expectedDisplay: "3" },
    ],
    validate: (userFn: (...args: unknown[]) => unknown, testCase: TestCase) => {
      const got = userFn(testCase.input);
      return { pass: got === testCase.expected, got };
    },
  },
  {
    id: 'max-subarray',
    title: 'Maximum Subarray',
    difficulty: 'medium' as const,
    description: 'Given an integer array, find the contiguous subarray which has the largest sum and return its sum.',
    hint: 'Kadane\'s Algorithm: iterate through the array, keeping track of the current subarray sum and the max sum found so far.',
    tags: ['array', 'dynamic-programming'],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
function maxSubArray(nums) {
  // Your code here
}`,
      python: `from typing import List

def max_sub_array(nums: List[int]) -> int:
    # Your code here
    pass`,
      java: `class Solution {
    public int maxSubArray(int[] nums) {
        // Your code here
        return 0;
    }
}`,
      cpp: `#include <vector>
#include <algorithm>
using namespace std;

int maxSubArray(vector<int>& nums) {
    // Your code here
    return 0;
}`,
    },
    testCases: [
      { input: [-2,1,-3,4,-1,2,1,-5,4], expected: 6, inputDisplay: "[-2,1,-3,4,-1,2,1,-5,4]", expectedDisplay: "6" },
      { input: [1], expected: 1, inputDisplay: "[1]", expectedDisplay: "1" },
      { input: [5,4,-1,7,8], expected: 23, inputDisplay: "[5,4,-1,7,8]", expectedDisplay: "23" },
    ],
    validate: (userFn: (...args: unknown[]) => unknown, testCase: TestCase) => {
      const got = userFn(testCase.input);
      return { pass: got === testCase.expected, got };
    },
  },
  {
    id: 'trapping-rain-water',
    title: 'Trapping Rain Water',
    difficulty: 'hard' as const,
    description: 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
    hint: 'Use two pointers to track the maximum height on both left and right sides as you move toward the center.',
    tags: ['array', 'two-pointers', 'dynamic-programming', 'stack'],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    starterCode: {
      javascript: `/**
 * @param {number[]} height
 * @return {number}
 */
function trap(height) {
  // Your code here
}`,
      python: `from typing import List

def trap(height: List[int]) -> int:
    # Your code here
    pass`,
      java: `class Solution {
    public int trap(int[] height) {
        // Your code here
        return 0;
    }
}`,
      cpp: `#include <vector>
#include <algorithm>
using namespace std;

int trap(vector<int>& height) {
    // Your code here
    return 0;
}`,
    },
    testCases: [
      { input: [0,1,0,2,1,0,1,3,2,1,2,1], expected: 6, inputDisplay: "[0,1,0,2,...]", expectedDisplay: "6" },
      { input: [4,2,0,3,2,5], expected: 9, inputDisplay: "[4,2,0,3,2,5]", expectedDisplay: "9" },
    ],
    validate: (userFn: (...args: unknown[]) => unknown, testCase: TestCase) => {
      const got = userFn(testCase.input);
      return { pass: got === testCase.expected, got };
    },
  },
  {
    id: 'median-arrays',
    title: 'Median of Two Sorted Arrays',
    difficulty: 'hard' as const,
    description: 'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.',
    hint: 'The goal is O(log (m+n)). Use binary search to find the correct partition in the smaller array.',
    tags: ['array', 'binary-search', 'divide-and-conquer'],
    timeComplexity: 'O(log(min(m,n)))',
    spaceComplexity: 'O(1)',
    starterCode: {
      javascript: `/**
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @return {number}
 */
function findMedianSortedArrays(nums1, nums2) {
  // Your code here
}`,
      python: `from typing import List

def find_median_sorted_arrays(nums1: List[int], nums2: List[int]) -> float:
    # Your code here
    pass`,
      java: `class Solution {
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        // Your code here
        return 0.0;
    }
}`,
      cpp: `#include <vector>
#include <algorithm>
using namespace std;

double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
    // Your code here
    return 0.0;
}`,
    },
    testCases: [
      { input: { nums1: [1,3], nums2: [2] }, expected: 2, inputDisplay: "[1,3], [2]", expectedDisplay: "2" },
      { input: { nums1: [1,2], nums2: [3,4] }, expected: 2.5, inputDisplay: "[1,2], [3,4]", expectedDisplay: "2.5" },
    ],
    validate: (userFn: (...args: unknown[]) => unknown, testCase: TestCase) => {
      const input = testCase.input as { nums1: number[]; nums2: number[] };
      const got = userFn(input.nums1, input.nums2);
      return { pass: got === testCase.expected, got };
    },
  },
  {
    id: 'regex-matching',
    title: 'Regular Expression Matching',
    difficulty: 'hard' as const,
    description: 'Given an input string s and a pattern p, implement regular expression matching with support for "." (any character) and "*" (zero or more of preceding).',
    hint: 'Use recursion with memoization or a 2D DP table. The key is handling the "*" wildcard correctly.',
    tags: ['string', 'dynamic-programming', 'recursion'],
    timeComplexity: 'O(m*n)',
    spaceComplexity: 'O(m*n)',
    starterCode: {
      javascript: `/**
 * @param {string} s
 * @param {string} p
 * @return {boolean}
 */
function isMatch(s, p) {
  // Your code here
}`,
      python: `def is_match(s: str, p: str) -> bool:
    # Your code here
    pass`,
      java: `class Solution {
    public boolean isMatch(String s, String p) {
        // Your code here
        return false;
    }
}`,
      cpp: `#include <string>
#include <vector>
using namespace std;

bool isMatch(string s, string p) {
    // Your code here
    return false;
}`,
    },
    testCases: [
      { input: { s: "aa", p: "a" }, expected: false, inputDisplay: 's="aa", p="a"', expectedDisplay: "false" },
      { input: { s: "aa", p: "a*" }, expected: true, inputDisplay: 's="aa", p="a*"', expectedDisplay: "true" },
      { input: { s: "ab", p: ".*" }, expected: true, inputDisplay: 's="ab", p=".*"', expectedDisplay: "true" },
    ],
    validate: (userFn: (...args: unknown[]) => unknown, testCase: TestCase) => {
      const input = testCase.input as { s: string; p: string };
      const got = userFn(input.s, input.p);
      return { pass: got === testCase.expected, got };
    },
  },
  {
    id: 'climbing-stairs',
    title: 'Climbing Stairs',
    difficulty: 'easy' as const,
    description: 'You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
    hint: 'This is a classic DP problem. To reach step n, you must have come from step n-1 or n-2. Sound like Fibonacci?',
    tags: ['dynamic-programming', 'math'],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    starterCode: {
      javascript: `/**
 * @param {number} n
 * @return {number}
 */
function climbStairs(n) {
  // Your code here
}`,
      python: `def climb_stairs(n: int) -> int:
    # Your code here
    pass`,
      java: `class Solution {
    public int climbStairs(int n) {
        // Your code here
        return 0;
    }
}`,
      cpp: `int climbStairs(int n) {
    // Your code here
    return 0;
}`,
    },
    testCases: [
      { input: 2, expected: 2, inputDisplay: "n=2", expectedDisplay: "2" },
      { input: 3, expected: 3, inputDisplay: "n=3", expectedDisplay: "3" },
      { input: 5, expected: 8, inputDisplay: "n=5", expectedDisplay: "8" },
    ],
    validate: (userFn: (...args: unknown[]) => unknown, testCase: TestCase) => {
      const got = userFn(testCase.input);
      return { pass: got === testCase.expected, got };
    },
  },
  {
    id: 'invert-binary-tree',
    title: 'Invert Binary Tree',
    difficulty: 'easy' as const,
    description: 'Given the root of a binary tree, invert the tree and return its root.',
    hint: 'Recursively swap the left and right children of every node in the tree.',
    tags: ['tree', 'recursion', 'dfs'],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h)',
    starterCode: {
      javascript: `/**
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} root
 * @return {TreeNode}
 */
function invertTree(root) {
  // Your code here
}`,
      python: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def invert_tree(root: TreeNode) -> TreeNode:
    # Your code here
    pass`,
      java: `class Solution {
    public TreeNode invertTree(TreeNode root) {
        // Your code here
        return null;
    }
}`,
      cpp: `TreeNode* invertTree(TreeNode* root) {
    // Your code here
    return nullptr;
}`,
    },
    testCases: [
      { input: [4,2,7,1,3,6,9], expected: [4,7,2,9,6,3,1], inputDisplay: "[4,2,7,1,3,6,9]", expectedDisplay: "[4,7,2,9,6,3,1]" },
    ],
    validate: (userFn: (...args: unknown[]) => unknown, testCase: TestCase, helpers: ValidationHelpers) => {
      const root = helpers.arrayToTree(testCase.input as (number | null)[]);
      const inverted = userFn(root);
      const got = helpers.treeToArray(inverted);
      return { pass: isEqual(got, testCase.expected), got };
    },
  },
  {
    id: 'validate-bst',
    title: 'Validate Binary Search Tree',
    difficulty: 'medium' as const,
    description: 'Given the root of a binary tree, determine if it is a valid binary search tree (BST).',
    hint: 'A valid BST means all nodes in the left subtree are smaller than the root, and all in the right are larger. Pass min/max bounds through recursion.',
    tags: ['tree', 'search', 'recursion'],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h)',
    starterCode: {
      javascript: `/**
 * @param {TreeNode} root
 * @return {boolean}
 */
function isValidBST(root) {
  // Your code here
}`,
      python: `def is_valid_bst(root: TreeNode) -> bool:
    # Your code here
    pass`,
      java: `class Solution {
    public boolean isValidBST(TreeNode root) {
        // Your code here
        return false;
    }
}`,
      cpp: `bool isValidBST(TreeNode* root) {
    // Your code here
    return false;
}`,
    },
    testCases: [
      { input: [2,1,3], expected: true, inputDisplay: "[2,1,3]", expectedDisplay: "true" },
      { input: [5,1,4,null,null,3,6], expected: false, inputDisplay: "[5,1,4,null,null,3,6]", expectedDisplay: "false" },
    ],
    validate: (userFn: (...args: unknown[]) => unknown, testCase: TestCase, helpers: ValidationHelpers) => {
      const root = helpers.arrayToTree(testCase.input as (number | null)[]);
      const got = userFn(root);
      return { pass: got === testCase.expected, got };
    },
  },
  {
    id: 'number-of-islands',
    title: 'Number of Islands',
    difficulty: 'medium' as const,
    description: 'Given an m x n 2D binary grid which represents a map of "1"s (land) and "0"s (water), return the number of islands.',
    hint: 'Use DFS or BFS to traverse connected land. When you find land, increment the count and "sink" the island by marking land as water.',
    tags: ['graph', 'dfs', 'bfs'],
    timeComplexity: 'O(m*n)',
    spaceComplexity: 'O(m*n)',
    starterCode: {
      javascript: `/**
 * @param {character[][]} grid
 * @return {number}
 */
function numIslands(grid) {
  // Your code here
}`,
      python: `from typing import List

def num_islands(grid: List[List[str]]) -> int:
    # Your code here
    pass`,
      java: `class Solution {
    public int numIslands(char[][] grid) {
        // Your code here
        return 0;
    }
}`,
      cpp: `#include <vector>
using namespace std;

int numIslands(vector<vector<char>>& grid) {
    // Your code here
    return 0;
}`,
    },
    testCases: [
      { 
        input: [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]], 
        expected: 1, 
        inputDisplay: "Grid (1 island)", 
        expectedDisplay: "1" 
      },
      { 
        input: [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]], 
        expected: 3, 
        inputDisplay: "Grid (3 islands)", 
        expectedDisplay: "3" 
      },
    ],
    validate: (userFn: (...args: unknown[]) => unknown, testCase: TestCase) => {
      const got = userFn(testCase.input);
      return { pass: got === testCase.expected, got };
    },
  },
  {
    id: 'coin-change',
    title: 'Coin Change',
    difficulty: 'medium' as const,
    description: 'Given an integer array of coins and an amount, return the fewest number of coins that you need to make up that amount.',
    hint: 'Use dynamic programming. dp[i] is the min coins for amount i. dp[i] = min(dp[i], dp[i-coin] + 1).',
    tags: ['dynamic-programming'],
    timeComplexity: 'O(n*amount)',
    spaceComplexity: 'O(amount)',
    starterCode: {
      javascript: `/**
 * @param {number[]} coins
 * @param {number} amount
 * @return {number}
 */
function coinChange(coins, amount) {
  // Your code here
}`,
      python: `from typing import List

def coin_change(coins: List[int], amount: int) -> int:
    # Your code here
    pass`,
      java: `class Solution {
    public int coinChange(int[] coins, int amount) {
        // Your code here
        return -1;
    }
}`,
      cpp: `#include <vector>
#include <algorithm>
using namespace std;

int coinChange(vector<int>& coins, int amount) {
    // Your code here
    return -1;
}`,
    },
    testCases: [
      { input: { coins: [1,2,5], amount: 11 }, expected: 3, inputDisplay: "coins=[1,2,5], amount=11", expectedDisplay: "3" },
      { input: { coins: [2], amount: 3 }, expected: -1, inputDisplay: "coins=[2], amount=3", expectedDisplay: "-1" },
      { input: { coins: [1], amount: 0 }, expected: 0, inputDisplay: "coins=[1], amount=0", expectedDisplay: "0" },
    ],
    validate: (userFn: (...args: any[]) => any, testCase: any) => {
      const got = userFn(testCase.input.coins, testCase.input.amount);
      return { pass: got === testCase.expected, got };
    },
  },
  {
    id: 'product-except-self',
    title: 'Product of Array Except Self',
    difficulty: 'medium' as const,
    description: 'Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i].',
    hint: 'O(n) time is required. Use prefix and suffix products to calculate the result without using the division operator.',
    tags: ['array', 'prefix-sum'],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)', // output array doesn't count
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @return {number[]}
 */
function productExceptSelf(nums) {
  // Your code here
}`,
      python: `from typing import List

def product_except_self(nums: List[int]) -> List[int]:
    # Your code here
    pass`,
      java: `class Solution {
    public int[] productExceptSelf(int[] nums) {
        // Your code here
        return new int[]{};
    }
}`,
      cpp: `#include <vector>
using namespace std;

vector<int> productExceptSelf(vector<int>& nums) {
    // Your code here
    return {};
}`,
    },
    testCases: [
      { input: [1,2,3,4], expected: [24,12,8,6], inputDisplay: "[1,2,3,4]", expectedDisplay: "[24,12,8,6]" },
      { input: [-1,1,0,-3,3], expected: [0,0,9,0,0], inputDisplay: "[-1,1,0,-3,3]", expectedDisplay: "[0,0,9,0,0]" },
    ],
    validate: (userFn: (...args: unknown[]) => unknown, testCase: TestCase) => {
      const input = testCase.input as any;
      const got = userFn(input);
      return { pass: isEqual(got, testCase.expected), got };
    },
  },
  {
    id: 'merge-two-lists',
    title: 'Merge Two Sorted Lists',
    difficulty: 'easy' as const,
    description: 'Merge two sorted linked lists and return it as a sorted list. The list should be made by splicing together the nodes of the first two lists.',
    hint: 'Use a dummy head node to simplify the merging logic. Compare the heads of both lists and connect the smaller one to your new list.',
    tags: ['linked-list', 'recursion'],
    timeComplexity: 'O(n+m)',
    spaceComplexity: 'O(1)',
    starterCode: {
      javascript: `/**
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} l1
 * @param {ListNode} l2
 * @return {ListNode}
 */
function mergeTwoLists(l1, l2) {
  // Your code here
}`,
      python: `def merge_two_lists(l1: ListNode, l2: ListNode) -> ListNode:
    # Your code here
    pass`,
      java: `class Solution {
    public ListNode mergeTwoLists(ListNode l1, ListNode l2) {
        // Your code here
        return null;
    }
}`,
      cpp: `ListNode* mergeTwoLists(ListNode* l1, ListNode* l2) {
    // Your code here
    return nullptr;
}`,
    },
    testCases: [
      { input: { l1: [1,2,4], l2: [1,3,4] }, expected: [1,1,2,3,4,4], inputDisplay: "l1=[1,2,4], l2=[1,3,4]", expectedDisplay: "[1,1,2,3,4,4]" },
      { input: { l1: [], l2: [] }, expected: [], inputDisplay: "l1=[], l2=[]", expectedDisplay: "[]" },
      { input: { l1: [], l2: [0] }, expected: [0], inputDisplay: "l1=[], l2=[0]", expectedDisplay: "[0]" },
    ],
    validate: (userFn: (...args: unknown[]) => unknown, testCase: TestCase, helpers: ValidationHelpers) => {
      const input = testCase.input as any;
      const l1 = helpers.arrayToLinkedList(input.l1);
      const l2 = helpers.arrayToLinkedList(input.l2);
      const merged = userFn(l1, l2);
      const got = helpers.linkedListToArray(merged);
      return { pass: isEqual(got, testCase.expected), got };
    },
  },
  {
    id: 'three-sum',
    title: '3Sum',
    difficulty: 'medium' as const,
    description: 'Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.',
    hint: 'Sort the array first. Then iterate through and use two pointers to find pairs that sum to the negative of your current number. Skip duplicates!',
    tags: ['array', 'two-pointers', 'sorting'],
    timeComplexity: 'O(n^2)',
    spaceComplexity: 'O(n)',
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @return {number[][]}
 */
function threeSum(nums) {
  // Your code here
}`,
      python: `from typing import List

def three_sum(nums: List[int]) -> List[List[int]]:
    # Your code here
    pass`,
      java: `import java.util.List;
import java.util.ArrayList;

class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        // Your code here
        return new ArrayList<>();
    }
}`,
      cpp: `#include <vector>
#include <algorithm>
using namespace std;

vector<vector<int>> threeSum(vector<int>& nums) {
    // Your code here
    return {};
}`,
    },
    testCases: [
      { input: [-1,0,1,2,-1,-4], expected: [[-1,-1,2],[-1,0,1]], inputDisplay: "[-1,0,1,2,-1,-4]", expectedDisplay: "[[-1,-1,2],[-1,0,1]]" },
      { input: [0,1,1], expected: [], inputDisplay: "[0,1,1]", expectedDisplay: "[]" },
      { input: [0,0,0], expected: [[0,0,0]], inputDisplay: "[0,0,0]", expectedDisplay: "[[0,0,0]]" },
    ],
    validate: (userFn: (...args: any[]) => any, testCase: any) => {
      const got = userFn(testCase.input);
      return { pass: compareArraysIgnoreOrder(got, testCase.expected), got };
    },
  },
];

