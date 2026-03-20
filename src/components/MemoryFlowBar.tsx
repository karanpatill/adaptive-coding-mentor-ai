
import { ChevronRight } from 'lucide-react';
import type { MemoryFlowStep } from '../types';

interface MemoryFlowBarProps {
  activeStep: MemoryFlowStep;
}

const STEPS: Array<{ id: MemoryFlowStep; label: string }> = [
  { id: 'retain', label: 'retain' },
  { id: 'recall', label: 'recall' },
  { id: 'reflect', label: 'reflect' },
  { id: 'observe', label: 'observe' },
];

export function MemoryFlowBar({ activeStep }: MemoryFlowBarProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      padding: '8px 12px',
      borderTop: '1px solid var(--color-border)',
      flexShrink: 0,
    }}>
      <span className="label" style={{ marginRight: 4 }}>Memory</span>
      {STEPS.map((step, idx) => (
        <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{
            height: 28,
            padding: '0 8px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            background: activeStep === step.id ? 'var(--color-memory-subtle)' : 'var(--color-bg-subtle)',
            border: activeStep === step.id
              ? '1px solid var(--color-memory)'
              : '1px solid var(--color-border)',
            color: activeStep === step.id ? 'var(--color-memory)' : 'var(--color-text-muted)',
            boxShadow: activeStep === step.id ? '0 0 8px var(--color-memory-glow)' : 'none',
            transition: 'all 0.15s',
          }}>
            <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
              {step.label}
            </span>
          </div>
          {idx < STEPS.length - 1 && (
            <ChevronRight size={12} color="var(--color-border)" />
          )}
        </div>
      ))}
    </div>
  );
}
