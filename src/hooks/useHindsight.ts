import { useState, useCallback, useRef } from 'react';
import { retain, recall, reflect } from '../api/hindsight';
import type { MemoryFact, MemoryFlowStep } from '../types';

interface UseHindsightProps {
  hindsightKey: string;
  bankId: string;
}

export function useHindsight({ hindsightKey, bankId }: UseHindsightProps) {
  const [memories, setMemories] = useState<MemoryFact[]>([]);
  const [activeStep, setActiveStep] = useState<MemoryFlowStep>(null);
  const lastRecallRef = useRef<number>(0);

  const flashStep = useCallback((step: MemoryFlowStep) => {
    setActiveStep(step);
    setTimeout(() => setActiveStep(null), 1350);
  }, []);

  const retainMemory = useCallback(async (content: string, metadata: object) => {
    if (!hindsightKey || !bankId) return;
    flashStep('retain');
    try {
      await retain(hindsightKey, bankId, content, metadata);
    } catch (err) {
      console.error('retain failed', err);
    }
  }, [hindsightKey, bankId, flashStep]);

  const recallMemories = useCallback(async (query: string): Promise<MemoryFact[]> => {
    if (!hindsightKey || !bankId) return [];

    const now = Date.now();
    if (now - lastRecallRef.current < 2000) return memories;
    lastRecallRef.current = now;

    flashStep('recall');
    try {
      const results = await recall(hindsightKey, bankId, query);
      const facts: MemoryFact[] = results.map((r: { content: string; timestamp?: string }) => ({
        content: r.content || String(r),
        timestamp: r.timestamp,
      }));
      setMemories(facts);
      return facts;
    } catch (err) {
      console.error('recall failed', err);
      return [];
    }
  }, [hindsightKey, bankId, memories, flashStep]);

  const reflectOnQuery = useCallback(async (query: string): Promise<string> => {
    if (!hindsightKey || !bankId) return '';
    flashStep('reflect');
    try {
      const response = await reflect(hindsightKey, bankId, query);
      setTimeout(() => flashStep('observe'), 1500);
      return response;
    } catch (err) {
      console.error('reflect failed', err);
      return '';
    }
  }, [hindsightKey, bankId, flashStep]);

  return {
    memories,
    activeStep,
    retainMemory,
    recallMemories,
    reflectOnQuery,
  };
}
