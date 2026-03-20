import React, { useState, useEffect, useRef } from 'react';
import { Database, Search, Sparkles, GitMerge, ChevronDown, ChevronUp, Info } from 'lucide-react';
import type { MemoryFlowStep } from '../types';

interface LogEntry {
  id: number;
  time: string;
  step: MemoryFlowStep;
  message: string;
}

const STEP_COLORS: Record<Exclude<MemoryFlowStep, null>, { border: string; bg: string; icon: any; color: string }> = {
  retain: { border: '#6366f1', bg: 'rgba(99,102,241,0.1)', icon: Database, color: '#a855f7' },
  recall: { border: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: Search, color: '#10b981' },
  reflect: { border: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: Sparkles, color: '#f59e0b' },
  observe: { border: '#ec4899', bg: 'rgba(236,72,153,0.1)', icon: GitMerge, color: '#ec4899' },
};

export function MemoryFlowBar({ activeStep: _propActiveStep }: { activeStep?: MemoryFlowStep }) {
  const [activeStep, setActiveStep] = useState<MemoryFlowStep | null>(null);
  const [activeMsg, setActiveMsg] = useState<string>('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isExpanded, setIsExpanded] = useState(() => {
    return localStorage.getItem('codementor_memoryflow_expanded') !== 'false';
  });
  const [totalFacts, setTotalFacts] = useState(0);
  const [lastActivity, setLastActivity] = useState(0); // seconds ago
  const [bankId, setBankId] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeTimeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    // Tick last activity
    timerRef.current = setInterval(() => {
      setLastActivity((prev: number) => prev + 1);
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, []);

  const addLog = (step: MemoryFlowStep, message: string) => {
    if (!step) return;
    setLogs((prev: LogEntry[]) => {
      const now = new Date();
      const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      const newLogs = [{ id: Date.now() + Math.random(), time, step, message }, ...prev];
      return newLogs.slice(0, 20); // Max 20 entries
    });
    setLastActivity(0);
  };

  useEffect(() => {
    const handleEvent = (e: any) => {
      const { type, message, problemName } = e.detail;
      
      // Clear previous timeouts
      activeTimeouts.current.forEach(clearTimeout);
      activeTimeouts.current = [];
      setActiveStep(null);

      const schedule = (step: MemoryFlowStep, msg: string, delay: number, endDelay = 800) => {
        const t1 = setTimeout(() => {
          setActiveStep(step);
          setActiveMsg(msg);
        }, delay);
        const t2 = setTimeout(() => {
          addLog(step, msg);
          if (step === activeStep) { // only clear if next step hasn't started
             setActiveStep(null);
          }
        }, delay + endDelay);
        activeTimeouts.current.push(t1, t2);
      };

      if (type === 'fail') {
        setTotalFacts((p: number) => p + 1);
        schedule('retain', 'Storing failed attempt...', 0);
        schedule('recall', 'Fetching similar error patterns...', 800);
        schedule('reflect', 'Personalizing AI response...', 1600);
        schedule('observe', 'Updating your skill profile...', 2400);
        const tf = setTimeout(() => setActiveStep(null), 3200);
        activeTimeouts.current.push(tf);
      } else if (type === 'pass') {
        setTotalFacts((p: number) => p + 1);
        schedule('retain', 'Storing successful solution...', 0, 600);
        schedule('observe', 'New skill improvement noted!', 600, 600);
        const tf = setTimeout(() => setActiveStep(null), 1200);
        activeTimeouts.current.push(tf);
      } else if (type === 'select') {
        schedule('recall', `Fetching your history on ${problemName}...`, 0);
        schedule('reflect', 'Preparing personalized context...', 800);
        const tf = setTimeout(() => setActiveStep(null), 1600);
        activeTimeouts.current.push(tf);
      } else if (type === 'chat') {
        schedule('recall', 'Fetching relevant memories...', 0, 600);
        schedule('reflect', 'Generating personalized response...', 600, 800);
        schedule('retain', 'Storing your question...', 1400, 600);
        const tf = setTimeout(() => setActiveStep(null), 2000);
        activeTimeouts.current.push(tf);
      } else if (type === 'init') {
        schedule('retain', 'Initializing memory bank...', 0, 400);
        schedule('recall', 'Checking recent context...', 400, 400);
        schedule('reflect', 'Loading skill patterns...', 800, 400);
        schedule('observe', 'Ready to mentor!', 1200, 400);
        const tf = setTimeout(() => setActiveStep(null), 1600);
        activeTimeouts.current.push(tf);
        setBankId(e.detail.bankId || 'mem-bank-xyz');
        setTotalFacts(e.detail.totalFacts || 0);
      }
    };

    window.addEventListener('memory-flow', handleEvent);
    return () => {
      window.removeEventListener('memory-flow', handleEvent);
      activeTimeouts.current.forEach(clearTimeout);
    };
  }, [activeStep]);

  const toggleExpand = () => {
    const next = !isExpanded;
    setIsExpanded(next);
    localStorage.setItem('codementor_memoryflow_expanded', String(next));
  };

  const stepsList: MemoryFlowStep[] = ['retain', 'recall', 'reflect', 'observe'];

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      borderTop: '1px solid var(--color-border)',
      background: 'rgba(10,10,11,0.95)',
      flexShrink: 0,
      width: '100%',
    }}>
      {/* Header & Stats (Always visible) */}
      <div style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
        padding: '6px 12px', height: 28, cursor: 'pointer', background: 'rgba(255,255,255,0.02)' 
      }} onClick={toggleExpand}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* STATS ROW */}
          <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
            🧠 {totalFacts} facts
          </span>
          <div style={{ width: 1, height: 10, background: 'var(--color-border)' }} />
          <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
            ⚡ {lastActivity === 0 ? 'just now' : `${lastActivity}s ago`}
          </span>
          <div style={{ width: 1, height: 10, background: 'var(--color-border)' }} />
          <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: 80, textOverflow: 'ellipsis' }}>
            📊 {bankId || 'loading...'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {!isExpanded && (
            <div style={{ display: 'flex', gap: 4 }}>
              {stepsList.map(s => (
                <div key={s} style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: activeStep === s ? STEP_COLORS[s!].color : 'var(--color-border)',
                  boxShadow: activeStep === s ? `0 0 6px ${STEP_COLORS[s!].color}` : 'none',
                  transition: 'all 0.3s'
                }} />
              ))}
            </div>
          )}
          {isExpanded ? <ChevronDown size={14} color="var(--color-text-muted)" /> : <ChevronUp size={14} color="var(--color-text-muted)" />}
        </div>
      </div>

      {/* Expanded State */}
      <div style={{ 
        height: isExpanded ? 240 : 0, 
        overflow: 'hidden', 
        transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-primary)', letterSpacing: '0.05em' }}>
              HINDSIGHT MEMORY PIPELINE
            </span>
            <div 
              onMouseEnter={() => setShowTooltip(true)} 
              onMouseLeave={() => setShowTooltip(false)}
              style={{ position: 'relative', cursor: 'help' }}
            >
              <Info size={12} color="var(--color-text-muted)" />
              {showTooltip && (
                <div style={{
                  position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
                  width: 240, background: 'rgba(17,17,19,0.98)',
                  border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8,
                  padding: '10px 12px', fontSize: 11, lineHeight: 1.6, color: 'var(--color-text-secondary)',
                  zIndex: 100, boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                }}>
                  Hindsight gives CodeMentor persistent memory across sessions.
                  Unlike localStorage, it uses semantic search, temporal reasoning,
                  and auto-consolidates patterns into observations — making the AI
                  mentor smarter the more you use it.
                </div>
              )}
            </div>
            {activeStep && <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--color-success)' }}><span style={{ width: 6, height: 6, background: 'var(--color-success)', borderRadius: '50%', animation: 'pulse 1s infinite' }} /> LIVE</span>}
          </div>

          {/* PIPELINE */}
          <div style={{ display: 'flex', gap: 4, height: 80 }}>
            {stepsList.map((step, idx) => {
              const isActive = activeStep === step;
              const conf = STEP_COLORS[step!];
              const Icon = conf.icon;
              return (
                <div key={step} style={{
                  flex: 1, border: `1px solid ${isActive ? conf.border : 'var(--color-border)'}`,
                  background: isActive ? conf.bg : 'rgba(255,255,255,0.01)',
                  borderRadius: 6, padding: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  boxShadow: isActive ? `0 0 12px ${conf.color}40` : 'none',
                  transition: 'all 0.4s', position: 'relative', overflow: 'hidden'
                }}>
                  {isActive && <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 2, background: conf.color, animation: 'slideIn 0.4s ease-out' }} />}
                  <div style={{ transform: isActive ? 'scale(1.15)' : 'scale(1)', transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                    <Icon size={20} color={isActive ? conf.color : 'var(--color-text-muted)'} />
                  </div>
                  <span style={{ fontSize: 10, marginTop: 8, textTransform: 'uppercase', letterSpacing: '0.05em', color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-muted)', fontWeight: isActive ? 600 : 400 }}>
                    {step}
                  </span>
                  {idx < stepsList.length - 1 && (
                    <div style={{ position: 'absolute', right: -6, top: '50%', transform: 'translateY(-50%)', zIndex: 1, color: 'var(--color-border)' }}>→</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ACTIVE LABEL */}
          <div style={{ height: 16, display: 'flex', justifyContent: 'center' }}>
            {activeStep && STEP_COLORS[activeStep as Exclude<MemoryFlowStep, null>] && (
              <span style={{ fontSize: 10, color: STEP_COLORS[activeStep as Exclude<MemoryFlowStep, null>].color, animation: 'fadeIn 0.3s' }}>
                {activeMsg}
              </span>
            )}
          </div>

          {/* LOGS */}
          <div style={{ flex: 1, height: 100, overflowY: 'auto', borderTop: '1px dashed rgba(255,255,255,0.05)', paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {logs.map(log => (
              <div key={log.id} style={{ display: 'flex', gap: 8, alignItems: 'center', animation: 'slideDown 0.2s ease-out' }}>
                <span style={{ fontSize: 10, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>{log.time}</span>
                <span style={{ 
                  fontSize: 9, padding: '2px 6px', borderRadius: 10, textTransform: 'uppercase',
                  background: log.step ? `${STEP_COLORS[log.step as Exclude<MemoryFlowStep, null>]?.color}20` : 'transparent', 
                  color: log.step ? STEP_COLORS[log.step as Exclude<MemoryFlowStep, null>]?.color : 'inherit'
                }}>{log.step}</span>
                <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '65%' }}>
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
}
