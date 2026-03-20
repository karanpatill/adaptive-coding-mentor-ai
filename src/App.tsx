import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { formatDistanceToNow } from 'date-fns';
import './styles/global.css';
import { ThreeBackground } from './components/ThreeBackground';
import { SetupScreen } from './components/SetupScreen';
import { Sidebar } from './components/Sidebar';
import { EditorPanel } from './components/EditorPanel';
import { MentorPanel } from './components/MentorPanel';
import { MemoryFlowBar } from './components/MemoryFlowBar';
import { RecalledMemories } from './components/RecalledMemories';
import { useHindsight } from './hooks/useHindsight';
import { Brain, LogOut, CheckCircle2, Flame, ChevronDown, ChevronUp, Play, Clock, XCircle, Copy, Languages } from 'lucide-react';
import { evaluateCode } from './utils/evaluator';
import { problems } from './data/problems';
import type { UserSession, Problem, Language, TestResult, ActivityTab, CodeSuggestion, ComplexityInfo } from './types';
import { CommandPalette } from './components/CommandPalette';

export default function App() {
  const [session, setSession] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('codementor_session');
    return saved ? JSON.parse(saved) : null;
  });
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [currentCode, setCurrentCode] = useState('');
  const [solvedIds, setSolvedIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('codementor_solved');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [activeTab, setActiveTab] = useState<ActivityTab>('problems');
  const [statusBarGreen, setStatusBarGreen] = useState(false);
  const [celebrationText, setCelebrationText] = useState<string | null>(null);
  const [brainPulsing, setBrainPulsing] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [language, setLanguage] = useState<Language>('javascript');
  const [showDescription, setShowDescription] = useState(false);
  const [complexity, setComplexity] = useState<ComplexityInfo>({
    time: 'O(1)', space: 'O(1)', hasRecursion: false, isExpensive: false, lines: 0, chars: 0
  });
  const [cursorPos, setCursorPos] = useState({ ln: 1, col: 1 });
  const brainPulseTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { memories, activeStep, retainMemory, recallMemories, reflectOnQuery } = useHindsight({
    hindsightKey: session?.hindsightKey ?? '',
    bankId: session?.bankId ?? '',
  });

  const pulseBrain = useCallback(() => {
    setBrainPulsing(true);
    if (brainPulseTimeout.current) clearTimeout(brainPulseTimeout.current);
    brainPulseTimeout.current = setTimeout(() => setBrainPulsing(false), 350);
  }, []);

  const stats = useMemo(() => {
    const solved = solvedIds.size;
    const totalMemories = memories.length;
    
    const dates = memories
      .map(m => m.timestamp ? new Date(m.timestamp).toDateString() : null)
      .filter((d): d is string => d !== null)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    const uniqueDates = Array.from(new Set(dates));
    let streak = 0;
    if (uniqueDates.length > 0) {
      streak = uniqueDates.length;
    }

    return { solved, totalMemories, streak };
  }, [solvedIds, memories]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleSetupComplete = useCallback(async (s: UserSession) => {
    setSession(s);
    localStorage.setItem('codementor_session', JSON.stringify(s));
    
    // Initial recall on app load
    try {
      await recallMemories(`Overall patterns for user ${s.username}`);
      pulseBrain();
    } catch {
      // Ignore
    }
  }, [recallMemories, pulseBrain]);

  const handleLogout = useCallback(() => {
    setSession(null);
    localStorage.removeItem('codementor_session');
    setSelectedProblem(null);
  }, []);

  const handleSelectProblem = useCallback(async (p: Problem) => {
    setSelectedProblem(p);
    setCurrentCode('');
    pulseBrain();
    try {
      await recallMemories(`${p.title} ${p.tags.join(' ')} ${p.difficulty} mistakes`);
    } catch {
      // ignore
    }
  }, [recallMemories, pulseBrain]);

  const handleRunCode = useCallback(async (
    code: string,
    _language: Language
  ): Promise<TestResult | null> => {
    if (!selectedProblem || !session) return null;

    if (_language !== 'javascript') {
      return {
        pass: false,
        error: `Browser execution is JavaScript only. For ${_language}, run in your local environment or copy the solution for reference.`,
        cases: [],
        totalTime: 0
      };
    }

    if (!selectedProblem.validate || !selectedProblem.testCases) {
      return {
        pass: false,
        error: "This problem is not yet configured for browser evaluation.",
        cases: [],
        totalTime: 0
      };
    }

    // Extract function name from starter code
    const fnMatch = selectedProblem.starterCode.javascript.match(/function\s+([a-zA-Z0-9_]+)/);
    const entryPoint = fnMatch ? fnMatch[1] : '';

    const result = await evaluateCode(
      code,
      selectedProblem.testCases,
      selectedProblem.validate,
      entryPoint
    );

    // Retain result
    const isFirstSolve = result.pass && !solvedIds.has(selectedProblem.id);
    const content = result.pass
      ? `User ${session.username} solved "${selectedProblem.title}" (${selectedProblem.difficulty}) in ${_language}.`
      : `User ${session.username} failed "${selectedProblem.title}" (${selectedProblem.difficulty}). ` +
        `${result.cases.filter((c: any) => !c.pass).length} test(s) failed. ${result.error ?? ''}`.trim();

    await retainMemory(content, {
      type: result.pass ? 'solved' : 'failed',
      problem: selectedProblem.id,
      difficulty: selectedProblem.difficulty,
      tags: selectedProblem.tags,
      code: code, // Saved code for Diff View
      language: _language,
      timestamp: new Date().toISOString(),
    });
    pulseBrain();

    if (isFirstSolve) {
      const nextSolved = new Set(Array.from(solvedIds).concat(selectedProblem.id));
      setSolvedIds(nextSolved);
      localStorage.setItem('codementor_solved', JSON.stringify(Array.from(nextSolved)));

      confetti({
        particleCount: 150,
        spread: 120,
        origin: { y: 0.8 },
        colors: ['#6366f1', '#10b981', '#f59e0b', '#22c55e']
      });

      setStatusBarGreen(true);
      setCelebrationText(`✓ Problem solved! Memory updated.`);
      setTimeout(() => {
        setStatusBarGreen(false);
        setCelebrationText(null);
      }, 3000);
    }

    return result;
  }, [selectedProblem, session, retainMemory, pulseBrain, solvedIds]);

  if (!session) {
    return (
      <>
        <ThreeBackground />
        <SetupScreen onComplete={handleSetupComplete} />
      </>
    );
  }

  return (
    <>
      <ThreeBackground />

      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: 'transparent',
      }}>
        {/* Title Bar */}
        <div style={{
          height: 36,
          background: 'rgba(13,13,15,0.95)',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          flexShrink: 0,
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 18, height: 18,
              borderRadius: 4,
              background: 'var(--color-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span style={{ fontSize: 9, color: 'white', fontWeight: 600 }}>CM</span>
            </div>
            <span style={{ fontSize: 13, color: 'var(--color-text-primary)', fontWeight: 500, fontFamily: 'var(--font-mono)' }}>
              CodeMentor <span style={{ color: 'var(--color-text-muted)', fontSize: 11, fontWeight: 400 }}>v2.0</span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Stats Strip */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12, 
              padding: '2px 12px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 20,
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Brain size={12} color="var(--color-memory)" />
                <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>{stats.totalMemories}</span>
                <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>memories</span>
              </div>
              <div style={{ width: 1, height: 12, background: 'var(--color-border)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle2 size={12} color="var(--color-success)" />
                <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>{stats.solved}</span>
                <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>solved</span>
              </div>
              <div style={{ width: 1, height: 12, background: 'var(--color-border)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Flame size={12} color="#f59e0b" />
                <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>{stats.streak}</span>
                <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>streak</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-text-muted)',
                fontSize: 11,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <LogOut size={12} />
              Logout
            </button>
          </div>
        </div>

        {/* Main content */}
        <div style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
        }}>
          <Sidebar
            problems={problems}
            selectedProblem={selectedProblem}
            onSelectProblem={handleSelectProblem}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            memories={memories}
            solvedIds={solvedIds}
          />

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {/* Problem Info Header */}
            {selectedProblem && (
              <div style={{
                background: 'rgba(13,13,15,0.7)',
                borderBottom: '1px solid var(--color-border)',
              }}>
                <div style={{
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 16px',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                }} onClick={() => setShowDescription(!showDescription)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>{selectedProblem.title}</span>
                    <span style={{ 
                      fontSize: 10, 
                      color: selectedProblem.difficulty === 'easy' ? 'var(--color-success)' : selectedProblem.difficulty === 'medium' ? 'var(--color-warning)' : 'var(--color-error)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>{selectedProblem.difficulty}</span>
                  </div>
                  {showDescription ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>
                
                <div style={{
                  height: showDescription ? 120 : 0,
                  overflow: 'hidden',
                  transition: 'height 0.2s ease-out',
                  padding: showDescription ? '0 16px 12px 16px' : '0 16px',
                  fontSize: 12,
                  color: 'var(--color-text-secondary)',
                  lineHeight: '1.6',
                }}>
                  <p style={{ margin: '0 0 12px 0' }}>{selectedProblem.description}</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {selectedProblem.tags.map(t => (
                      <span key={t} style={{
                        padding: '2px 8px',
                        background: 'rgba(99,102,241,0.1)',
                        color: '#818cf8',
                        border: '1px solid rgba(99,102,241,0.2)',
                        borderRadius: 4,
                        fontSize: 10,
                        fontFamily: 'var(--font-mono)',
                      }}>{t}</span>
                    ))}
                    <span style={{ color: 'var(--color-text-muted)', fontSize: 10, alignSelf: 'center', marginLeft: 'auto' }}>
                      Time: {selectedProblem.timeComplexity} | Space: {selectedProblem.spaceComplexity}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <EditorPanel
              problem={selectedProblem}
              onRunCode={handleRunCode}
              onCodeChange={(code) => { setCurrentCode(code); }}
              onCursorChange={setCursorPos}
              language={language}
              complexity={complexity}
              setComplexity={setComplexity}
            />
          </div>

          <div style={{ width: 340, display: 'flex', flexDirection: 'column', borderLeft: '1px solid var(--color-border)' }}>
            <MentorPanel
              problem={selectedProblem}
              username={session.username}
              groqKey={session.groqKey}
              memories={memories}
              code={currentCode}
              onRetainMemory={retainMemory}
              onReflect={reflectOnQuery}
            />
            <MemoryFlowBar activeStep={activeStep} />
          </div>
        </div>

        {/* Status Bar */}
        <div style={{
          height: 24,
          background: statusBarGreen ? 'var(--color-success)' : 'rgba(13,13,15,0.95)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          flexShrink: 0,
          transition: 'background 0.3s',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 11, color: statusBarGreen ? 'white' : 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
              {celebrationText || (selectedProblem ? `READY: ${selectedProblem.title}` : 'IDLE')}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 11, color: statusBarGreen ? 'white' : 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
              Ln {cursorPos.ln}, Col {cursorPos.col}
            </span>
            <span style={{ fontSize: 11, color: statusBarGreen ? 'white' : 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
              {language.toUpperCase()}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Brain size={11} color={statusBarGreen ? 'white' : 'var(--color-memory)'} />
              <span style={{ fontSize: 11, color: statusBarGreen ? 'white' : 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                {memories.length} facts
              </span>
            </div>
          </div>
        </div>
      </div>

      {showCommandPalette && (
        <CommandPalette
          onClose={() => setShowCommandPalette(false)}
          problems={problems}
          onSelectProblem={handleSelectProblem}
          onRunCode={() => handleRunCode(currentCode, language)}
          onAskMentor={() => {}} // Handle inside MentorPanel usually
          onSwitchLanguage={(l) => setLanguage(l as Language)}
          onSelectTab={setActiveTab}
        />
      )}
    </>
  );
}
