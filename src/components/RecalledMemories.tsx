import type { MemoryFact } from '../types';
import { Brain } from 'lucide-react';

interface RecalledMemoriesProps {
  memories: MemoryFact[];
}

export function RecalledMemories({ memories }: RecalledMemoriesProps) {
  return (
    <div style={{
      borderTop: '1px solid var(--color-border)',
      flexShrink: 0,
      maxHeight: 140,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        padding: '6px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        flexShrink: 0,
      }}>
        <Brain size={12} color="var(--color-memory)" />
        <span className="label" style={{ color: 'var(--color-memory)' }}>Memory</span>
      </div>

      <div style={{ overflowY: 'auto', padding: '0 8px 8px' }}>
        {memories.length === 0 ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '8px 0',
            color: 'var(--color-text-muted)',
          }}>
            <Brain size={14} color="var(--color-text-muted)" />
            <span style={{ fontSize: 11 }}>No memories yet</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {memories.slice(0, 3).map((m, i) => (
              <div
                key={i}
                style={{
                  padding: '6px 8px',
                  background: 'var(--color-bg-overlay)',
                  borderLeft: '2px solid var(--color-memory)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  animation: 'border-glow 0.8s ease-out',
                }}
              >
                <p style={{
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-text-secondary)',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  lineHeight: 1.5,
                  margin: 0,
                }}>
                  {m.content}
                </p>
                {m.timestamp && (
                  <span style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2, display: 'block' }}>
                    {new Date(m.timestamp).toLocaleDateString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
