export type Difficulty = 'easy' | 'medium' | 'hard';

export type Language = 'javascript' | 'python' | 'java' | 'cpp';

export interface TestCase {
  input: unknown;
  expected: unknown;
  inputDisplay: string;
  expectedDisplay: string;
}

export interface ValidationHelpers {
  arrayToLinkedList: (arr: number[]) => unknown;
  linkedListToArray: (head: unknown) => number[];
  arrayToTree: (arr: (number | null)[]) => unknown;
  treeToArray: (root: unknown) => (number | null)[];
}

export interface TestResult {
  pass: boolean;
  cases: Array<{
    input: string;
    expected: string;
    got: string;
    pass: boolean;
    executionTime: number;
  }>;
  error?: string;
  totalTime: number;
}

export interface Problem {
  id: string;
  title: string;
  difficulty: Difficulty;
  description: string;
  hint: string;
  tags: string[];
  starterCode: Record<Language, string>;
  testCases: TestCase[];
  validate?: (userFn: (...args: unknown[]) => unknown, testCase: TestCase, helpers: ValidationHelpers) => { pass: boolean, got: unknown };
  timeComplexity: string;
  spaceComplexity: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  memoryRecalled?: boolean;
}

export interface MemoryFact {
  id?: string;
  content: string;
  metadata?: Record<string, unknown>;
  timestamp?: string;
}

export type MemoryFlowStep = 'retain' | 'recall' | 'reflect' | 'observe' | null;

export type ActivityTab = 'problems' | 'skills' | 'timeline' | 'memory';

export type OutputTab = 'output' | 'problems' | 'tests';

export interface UserSession {
  username: string;
  groqKey: string;
  hindsightKey: string;
  bankId: string;
  totalSolved?: number;
}

export interface CodeSuggestion {
  original: string;
  suggested: string;
}

export interface ComplexityInfo {
  time: string;
  space: string;
  hasRecursion: boolean;
  isExpensive: boolean;
  lines: number;
  chars: number;
}
