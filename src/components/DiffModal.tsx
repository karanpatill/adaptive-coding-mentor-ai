import React from 'react';
import { X, ArrowRight } from 'lucide-react';

interface DiffModalProps {
  onClose: () => void;
  oldCode: string;
  newCode: string;
  title: string;
  language: string;
}

export function DiffModal({ onClose, oldCode, newCode, title, language }: DiffModalProps) {
  const oldLines = oldCode.split('\n');
  const newLines = newCode.split('\n');

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        width: '90vw',
        height: '85vh',
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
      }}>
        {/* Header */}
        <div style={{
          height: 48,
          padding: '0 20px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255,255,255,0.02)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
              Recall Diff: {title}
            </span>
            <span style={{ 
              fontSize: 10, 
              padding: '2px 6px', 
              background: 'var(--color-bg-subtle)', 
              borderRadius: 4, 
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase'
            }}>{language}</span>
          </div>
          <button onClick={onClose} style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
            padding: 4,
          }} onMouseEnter={e => e.currentTarget.style.color = 'white'} 
             onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}>
            <X size={20} />
          </button>
        </div>

        {/* Diff Content */}
        <div style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
          background: '#0a0a0b',
        }}>
          {/* Saved Code */}
          <div style={{ flex: 1, borderRight: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--color-border)', fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Saved Version
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: 16, fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: '1.6' }}>
              {oldLines.map((line, i) => (
                <div key={i} style={{ display: 'flex', gap: 12 }}>
                  <span style={{ width: 24, color: '#3f3f46', textAlign: 'right', fontSize: 11, userSelect: 'none' }}>{i + 1}</span>
                  <pre style={{ margin: 0, color: '#a1a1aa' }}>{line || ' '}</pre>
                </div>
              ))}
            </div>
          </div>

          {/* Current Code */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--color-border)', fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Current Workspace
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: 16, fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: '1.6' }}>
              {newLines.map((line, i) => {
                const isDifferent = oldLines[i] !== line;
                return (
                  <div key={i} style={{ 
                    display: 'flex', 
                    gap: 12, 
                    background: isDifferent ? 'rgba(99,102,241,0.1)' : 'transparent' 
                  }}>
                    <span style={{ width: 24, color: '#3f3f46', textAlign: 'right', fontSize: 11, userSelect: 'none' }}>{i + 1}</span>
                    <pre style={{ margin: 0, color: isDifferent ? 'var(--color-accent)' : '#a1a1aa' }}>{line || ' '}</pre>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          height: 40,
          padding: '0 20px',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 12,
          background: 'rgba(255,255,255,0.01)',
        }}>
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
            Highlighting structural differences in the workspace.
          </span>
          <button 
            onClick={onClose}
            style={{
              padding: '4px 12px',
              borderRadius: 4,
              background: 'var(--color-accent)',
              border: 'none',
              color: 'white',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >Done</button>
        </div>
      </div>
    </div>
  );
}
