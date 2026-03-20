import React, { useState, useEffect } from 'react';
import { Type, Bot, Settings2, Database, Trash2, Key, Users, Eye, EyeOff } from 'lucide-react';
import type { AppSettings, UserSession } from '../types';

interface SettingsTabProps {
  settings: AppSettings;
  onChange: (newSettings: AppSettings) => void;
  session: UserSession;
  memoryCount: number;
  onLogout: () => void;
  onClearMemories: () => void;
  onUpdateGroqKey: (key: string) => void;
}

export function SettingsTab({
  settings, onChange, session, memoryCount, onLogout, onClearMemories, onUpdateGroqKey
}: SettingsTabProps) {
  const [showGroq, setShowGroq] = useState(false);
  const [groqInput, setGroqInput] = useState('');
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  useEffect(() => {
    setGroqInput(session.groqKey);
  }, [session.groqKey]);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  const maskedKey = session.groqKey ? `sk-${'*'.repeat(Math.min(15, Math.max(0, session.groqKey.length - 12)))}...` : '';

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto' }}>
      {/* APPEARANCE */}
      <section>
        <h3 style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, display: 'flex', gap: 6, alignItems: 'center' }}>
          <Type size={12} /> Appearance
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Font Size</span>
              <span style={{ fontSize: 12, color: 'var(--color-text-primary)' }}>{settings.fontSize}px</span>
            </div>
            <input 
              type="range" min="12" max="18" step="1" 
              value={settings.fontSize}
              onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--color-accent)' }}
            />
          </div>

          <div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 8 }}>Font Family</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['JetBrains Mono', 'Fira Code', 'Cascadia Code'].map(font => (
                <button
                  key={font}
                  onClick={() => updateSetting('fontFamily', font)}
                  style={{
                    padding: '6px 10px',
                    fontSize: 11,
                    background: settings.fontFamily === font ? 'rgba(99,102,241,0.2)' : 'transparent',
                    border: settings.fontFamily === font ? '1px solid var(--color-accent)' : '1px solid rgba(255,255,255,0.1)',
                    color: settings.fontFamily === font ? 'var(--color-accent)' : 'var(--color-text-muted)',
                    borderRadius: 4,
                    cursor: 'pointer',
                  }}
                >
                  {font}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 8 }}>Tab Size</div>
            <div style={{ display: 'flex', gap: 16 }}>
              {[2, 4].map(size => (
                <label key={size} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="tabSize"
                    checked={settings.tabSize === size}
                    onChange={() => updateSetting('tabSize', size)}
                    style={{ accentColor: 'var(--color-accent)' }}
                  />
                  {size} spaces
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AI MENTOR */}
      <section>
        <h3 style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, display: 'flex', gap: 6, alignItems: 'center' }}>
          <Bot size={12} /> AI Mentor
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Response Length</span>
            <select
              value={settings.responseLength}
              onChange={(e) => updateSetting('responseLength', e.target.value as any)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'var(--color-text-primary)',
                padding: '4px 8px',
                borderRadius: 4,
                fontSize: 12,
                outline: 'none'
              }}
            >
              <option value="concise">Concise (Max 200)</option>
              <option value="detailed">Detailed (Max 600)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Hint Style</span>
            <select
              value={settings.hintStyle}
              onChange={(e) => updateSetting('hintStyle', e.target.value as any)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'var(--color-text-primary)',
                padding: '4px 8px',
                borderRadius: 4,
                fontSize: 12,
                outline: 'none'
              }}
            >
              <option value="socratic">Socratic</option>
              <option value="direct">Direct</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Auto-Analyze on Fail</span>
            <button
              onClick={() => updateSetting('autoAnalyze', !settings.autoAnalyze)}
              style={{
                width: 36, height: 20,
                borderRadius: 10,
                background: settings.autoAnalyze ? 'var(--color-success)' : 'rgba(255,255,255,0.1)',
                border: 'none',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
            >
              <div style={{
                position: 'absolute',
                top: 2, left: settings.autoAnalyze ? 18 : 2,
                width: 16, height: 16,
                background: 'white',
                borderRadius: '50%',
                transition: 'left 0.2s'
              }} />
            </button>
          </div>
        </div>
      </section>

      {/* MEMORY */}
      <section>
        <h3 style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, display: 'flex', gap: 6, alignItems: 'center' }}>
          <Database size={12} /> Memory
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 4 }}>Memory Bank ID</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <code style={{ fontSize: 11, color: 'var(--color-text-secondary)', background: 'rgba(0,0,0,0.3)', padding: '2px 4px', borderRadius: 4, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {session.bankId}
              </code>
              <button
                onClick={() => navigator.clipboard.writeText(session.bankId)}
                style={{ fontSize: 10, background: 'var(--color-accent)', color: 'white', border: 'none', padding: '4px 8px', borderRadius: 4, cursor: 'pointer' }}
              >
                Copy
              </button>
            </div>
          </div>

          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
            <span style={{ color: 'var(--color-memory)', fontWeight: 600 }}>{memoryCount}</span> facts stored
          </div>

          {showConfirmClear ? (
            <div style={{ padding: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6 }}>
              <div style={{ fontSize: 12, color: '#fca5a5', marginBottom: 8 }}>This will permanently delete all memories. Are you sure?</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { onClearMemories(); setShowConfirmClear(false); }} style={{ flex: 1, padding: '6px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 4, fontSize: 12, cursor: 'pointer' }}>Yes, clear</button>
                <button onClick={() => setShowConfirmClear(false)} style={{ flex: 1, padding: '6px', background: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmClear(true)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '8px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 4, fontSize: 12, cursor: 'pointer'
              }}
            >
              <Trash2 size={14} /> Clear all memories
            </button>
          )}
        </div>
      </section>

      {/* SESSION */}
      <section>
        <h3 style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, display: 'flex', gap: 6, alignItems: 'center' }}>
          <Users size={12} /> Session
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.05)' }}>
            <div>
              <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 2 }}>Current User</div>
              <div style={{ fontSize: 13, color: 'var(--color-text-primary)', fontWeight: 500 }}>{session.username}</div>
            </div>
            <button
              onClick={onLogout}
              style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-secondary)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, fontSize: 11, cursor: 'pointer' }}
            >
              Switch User
            </button>
          </div>

          <div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}><Key size={12} /> Groq API Key</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
                <input
                  type={showGroq ? 'text' : 'password'}
                  value={groqInput}
                  onChange={(e) => setGroqInput(e.target.value)}
                  placeholder={maskedKey}
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'var(--color-text-primary)',
                    padding: '8px 32px 8px 10px',
                    borderRadius: 4,
                    fontSize: 12,
                    fontFamily: 'var(--font-mono)'
                  }}
                />
                <button
                  onClick={() => setShowGroq(!showGroq)}
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex' }}
                >
                  {showGroq ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <button
                onClick={() => onUpdateGroqKey(groqInput)}
                disabled={!groqInput || groqInput === session.groqKey}
                style={{
                  padding: '0 12px',
                  background: (!groqInput || groqInput === session.groqKey) ? 'rgba(255,255,255,0.05)' : 'var(--color-accent)',
                  color: (!groqInput || groqInput === session.groqKey) ? 'var(--color-text-muted)' : 'white',
                  border: 'none',
                  borderRadius: 4,
                  fontSize: 12,
                  cursor: (!groqInput || groqInput === session.groqKey) ? 'not-allowed' : 'pointer',
                  opacity: (!groqInput || groqInput === session.groqKey) ? 0.7 : 1
                }}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
