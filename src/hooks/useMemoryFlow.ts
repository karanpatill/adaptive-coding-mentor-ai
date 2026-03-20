import { useState, useCallback } from 'react';
import type { MemoryFlowStep } from '../types';

export function useMemoryFlow() {
  const [activeStep, setActiveStep] = useState<MemoryFlowStep>(null);

  const triggerStep = useCallback((step: MemoryFlowStep) => {
    setActiveStep(step);
    setTimeout(() => setActiveStep(null), 1350);
  }, []);

  return { activeStep, triggerStep };
}
