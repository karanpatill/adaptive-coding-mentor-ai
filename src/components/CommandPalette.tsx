import React, { useState, useEffect, useMemo } from 'react';
import { Search, Command, Code, Play, Lightbulb, Brain, Layout, History, Trash2, X } from 'lucide-react';
import type { Problem } from '../types';

interface CommandPaletteProps {
  onClose: () => void;
  problems: Problem[];
  onSelectProblem: (p: Problem) => void;
  onRunCode: () => void;
  onAskMentor: () => void;
  onSwitchLanguage: (l: 'javascript' | 'python') => void;
  onSelectTab: (t: 'problems' | 'skills' | 'timeline') => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  onClose,
  problems,
  onSelectProblem,
  onRunCode,
  onAskMentor,
  onSwitchLanguage,
  onSelectTab,
}) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands = useMemo(() => {
    const list = [
      ...problems.map(p => ({
        id: `prob-${p.id}`,
        label: `Go to ${p.title}`,
        icon: <Code size={14} />,
        action: () => onSelectProblem(p),
        category: 'Problems',
      })),
      { id: 'run', label: 'Run current code', icon: <Play size={14} />, action: onRunCode, category: 'Actions' },
      { id: 'hint', label: 'Ask mentor for hint', icon: <Lightbulb size={14} />, action: onAskMentor, category: 'Actions' },
      { id: 'lang-js', label: 'Switch to JavaScript', icon: <Layout size={14} />, action: () => onSwitchLanguage('javascript'), category: 'Settings' },
      { id: 'lang-py', label: 'Switch to Python', icon: <Layout size={14} />, action: () => onSwitchLanguage('python'), category: 'Settings' },
      { id: 'tab-skills', label: 'Show skill radar', icon: <Brain size={14} />, action: () => onSelectTab('skills'), category: 'Navigation' },
      { id: 'tab-timeline', label: 'Show memory timeline', icon: <History size={14} />, action: () => onSelectTab('timeline'), category: 'Navigation' },
    ];

    if (!search) return list;
    return list.filter(c => c.label.toLowerCase().includes(search.toLowerCase()));
  }, [search, problems, onSelectProblem, onRunCode, onAskMentor, onSwitchLanguage, onSelectTab]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % commands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + commands.length) % commands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (commands[selectedIndex]) {
          commands[selectedIndex].action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commands, selectedIndex, onClose]);

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '15vh',
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: 560,
          background: 'rgba(17,17,19,0.96)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: 12,
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          overflow: 'hidden',
          animation: 'command-in 0.15s ease-out',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          borderBottom: '1px solid var(--color-border)',
          height: 56,
        }}>
          <Search size={18} color="var(--color-text-muted)" style={{ marginRight: 12 }} />
          <input
            autoFocus
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Type a command or search problems..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text-primary)',
              fontSize: 15,
              outline: 'none',
              fontFamily: 'var(--font-mono)',
            }}
          />
          <div style={{
            padding: '2px 6px',
            background: 'var(--color-bg-subtle)',
            border: '1px solid var(--color-border)',
            borderRadius: 4,
            fontSize: 10,
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-mono)',
          }}>ESC</div>
        </div>

        <div style={{
          maxHeight: 360,
          overflowY: 'auto',
          padding: '8px 0',
        }}>
          {commands.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>
              No commands found
            </div>
          ) : (
            commands.map((cmd, idx) => (
              <div
                key={cmd.id}
                onClick={() => { cmd.action(); onClose(); }}
                onMouseEnter={() => setSelectedIndex(idx)}
                style={{
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 16px',
                  cursor: 'pointer',
                  background: idx === selectedIndex ? 'rgba(99,102,241,0.1)' : 'transparent',
                  borderLeft: idx === selectedIndex ? '2px solid var(--color-accent)' : '2px solid transparent',
                  transition: 'all 0.1s',
                }}
              >
                <span style={{ 
                  marginRight: 12, 
                  color: idx === selectedIndex ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  {cmd.icon}
                </span>
                <span style={{ 
                  flex: 1,
                  fontSize: 13, 
                  color: idx === selectedIndex ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                }}>
                  {cmd.label}
                </span>
                {idx === selectedIndex && (
                  <span style={{ 
                    fontSize: 10, 
                    color: 'var(--color-text-muted)',
                    fontFamily: 'var(--font-mono)',
                    opacity: 0.6
                  }}>
                    ENTER
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
