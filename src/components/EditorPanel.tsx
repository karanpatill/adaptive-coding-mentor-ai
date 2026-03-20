import { useState, useRef, useCallback, lazy, Suspense, useEffect } from 'react';
import {
  PlayCircle, Loader2, CheckCircle2, XCircle,
  FileCode2, ChevronDown, Clock, Database, AlertTriangle, Copy, Check
} from 'lucide-react';
import type { Problem, Language, TestResult, OutputTab, ComplexityInfo } from '../types';

const MonacoEditor = lazy(() =>
  import('@monaco-editor/react').then(m => ({ default: m.Editor }))
);

interface EditorPanelProps {
  problem: Problem | null;
  onRunCode: (code: string, language: Language) => Promise<TestResult | null>;
  onCodeChange?: (code: string) => void;
  onCursorChange?: (pos: { ln: number, col: number }) => void;
  language: Language;
  complexity: ComplexityInfo;
  setComplexity: (c: ComplexityInfo) => void;
  passMode: 'single' | 'all';
  setPassMode: (m: 'single' | 'all') => void;
}

type RunState = 'idle' | 'running' | 'pass' | 'fail';

const LANGUAGES: Language[] = ['javascript', 'python', 'java', 'cpp'];
const LANG_LABEL: Record<Language, string> = {
  javascript: 'JavaScript',
  python: 'Python',
  java: 'Java',
  cpp: 'C++',
};

export function EditorPanel({ 
  problem, 
  onRunCode, 
  onCodeChange, 
  onCursorChange,
  language: initialLang,
  complexity,
  setComplexity,
  passMode,
  setPassMode
}: EditorPanelProps) {
  const [language, setLanguage] = useState<Language>(initialLang);
  const [code, setCode] = useState('');
  const [runState, setRunState] = useState<RunState>('idle');
  const [outputTab, setOutputTab] = useState<OutputTab>('output');
  const [lastResult, setLastResult] = useState<TestResult | null>(null);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const editorRef = useRef<any>(null);

  const currentCode = code || (problem?.starterCode[language] ?? '');

  useEffect(() => {
    setLanguage(initialLang);
  }, [initialLang]);

  // Complexity Analysis Heuristic
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = currentCode.trim();
      const lines = currentCode.split('\n').length;
      const chars = currentCode.length;
      
      // Heuristics
      const hasFor = (currentCode.match(/for\s*\(/g) || []).length;
      const hasWhile = (currentCode.match(/while\s*\(/g) || []).length;
      const nested = (currentCode.match(/for.*for|for.*while|while.*for|while.*while/s) !== null);
      
      let time = 'O(1)';
      if (nested) time = 'O(n²)';
      else if (hasFor || hasWhile) time = 'O(n)';
      
      // Recursion: function calling itself by name
      const funcNameMatch = currentCode.match(/function\s+(\w+)/) || currentCode.match(/const\s+(\w+)\s*=\s*\(/);
      const funcName = funcNameMatch?.[1];
      const hasRecursion = funcName ? (currentCode.split(funcName).length > 2) : false;

      // Space: variables count (naive)
      const vars = (currentCode.match(/let\s|const\s|var\s|int\s|string\s/g) || []).length;
      const space = vars > 5 ? 'O(n)' : 'O(1)';

      setComplexity({
        time,
        space,
        hasRecursion,
        isExpensive: time === 'O(n²)' || time === 'O(2^n)',
        lines,
        chars
      });
    }, 1500);
    return () => clearTimeout(timer);
  }, [currentCode, setComplexity]);

  const handleEditorMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    monaco.editor.defineTheme('codementor-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#0a0a0b',
        'editor.foreground': '#f4f4f5',
        'editor.lineHighlightBackground': '#18181b',
        'editorLineNumber.foreground': '#3f3f46',
        'editorLineNumber.activeForeground': '#71717a',
        'editor.selectionBackground': '#6366f133',
      }
    });
    monaco.editor.setTheme('codementor-dark');

    editor.onDidChangeCursorPosition((e: any) => {
      onCursorChange?.({ ln: e.position.lineNumber, col: e.position.column });
    });
  };

  const handleEditorChange = useCallback((value: string | undefined) => {
    setCode(value ?? '');
    onCodeChange?.(value ?? '');
  }, [onCodeChange]);

  const handleRun = async () => {
    if (!problem) return;
    setRunState('running');
    setOutputTab('tests');
    try {
      const result = await onRunCode(currentCode, language);
      setLastResult(result);
      if (result) {
        setRunState(result.pass ? 'pass' : 'fail');
        setTimeout(() => setRunState('idle'), 2500);
      } else {
        setRunState('idle');
      }
    } catch {
      setRunState('fail');
      setTimeout(() => setRunState('idle'), 2500);
    }
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setCode('');
    setShowLangMenu(false);
    setLastResult(null);
    setRunState('idle');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const monacoLang = language === 'cpp' ? 'cpp' : language === 'java' ? 'java' : language;

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: 'rgba(10,10,11,0.85)',
      backdropFilter: 'blur(12px)',
    }}>
      {/* Tab Bar */}
      <div style={{
        height: 36,
        background: 'var(--color-bg-elevated)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'stretch',
        flexShrink: 0,
      }}>
        {/* File Tab */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '0 16px',
          borderTop: '1px solid var(--color-accent)',
          borderRight: '1px solid var(--color-border)',
          background: 'var(--color-bg-overlay)',
          height: '100%',
        }}>
          <FileCode2 size={12} color="var(--color-text-muted)" />
          <span style={{
            fontSize: 12,
            color: 'var(--color-text-secondary)',
            whiteSpace: 'nowrap',
          }}>
            {problem
              ? `${problem.id}.${language === 'javascript' ? 'js' : language === 'python' ? 'py' : language === 'java' ? 'java' : 'cpp'}`
              : 'untitled.js'
            }
          </span>
        </div>

        <div style={{ flex: 1 }} />

        {/* Language selector */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', padding: '0 12px' }}>
          <button
            onClick={() => setShowLangMenu(v => !v)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12,
              color: 'var(--color-text-muted)',
              padding: '3px 8px',
              borderRadius: 'var(--radius-sm)',
              background: showLangMenu ? 'var(--color-bg-subtle)' : 'transparent',
              transition: 'background 0.1s',
            }}
          >
            {LANG_LABEL[language]}
            <ChevronDown size={10} />
          </button>

          {showLangMenu && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              background: 'var(--color-bg-overlay)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              zIndex: 50,
              minWidth: 120,
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            }}>
              {LANGUAGES.map(lang => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '6px 12px',
                    fontSize: 12,
                    color: language === lang ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                    background: language === lang ? 'var(--color-accent-subtle)' : 'transparent',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => { if ( language !== lang ) (e.target as HTMLElement).style.background = 'var(--color-bg-subtle)'; }}
                  onMouseLeave={e => { if ( language !== lang ) (e.target as HTMLElement).style.background = 'transparent'; }}
                >
                  {LANG_LABEL[lang]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          title="Copy Code"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: '100%',
            color: copied ? 'var(--color-success)' : 'var(--color-text-muted)',
            borderLeft: '1px solid var(--color-border)',
            background: 'transparent',
            transition: 'color 0.2s',
          }}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
        </button>

        {/* Run button */}
        <button
          onClick={handleRun}
          disabled={runState === 'running' || !problem}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '0 16px',
            fontSize: 12,
            fontWeight: 500,
            color: runState === 'pass' ? 'var(--color-success)'
              : runState === 'fail' ? 'var(--color-error)'
                : 'var(--color-accent)',
            borderLeft: '1px solid var(--color-border)',
            background: 'transparent',
            transition: 'color 0.2s',
            whiteSpace: 'nowrap',
          }}
        >
          {runState === 'running' ? (
            <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Running...</>
          ) : runState === 'pass' ? (
            <><CheckCircle2 size={13} /> Passed</>
          ) : runState === 'fail' ? (
            <><XCircle size={13} /> Failed</>
          ) : (
            <><PlayCircle size={13} /> Run</>
          )}
        </button>
      </div>

      {/* Complexity Bar (FEATURE 3) */}
      <div style={{
        height: 24,
        background: '#0d0d0f',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={12} color={complexity.isExpensive ? '#ef4444' : '#22c55e'} />
            <span style={{ 
              fontSize: 11, 
              color: complexity.isExpensive ? '#ef4444' : '#22c55e', 
              fontFamily: 'var(--font-mono)' 
            }}>Time: {complexity.time}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Database size={12} color="#22c55e" />
            <span style={{ fontSize: 11, color: '#22c55e', fontFamily: 'var(--font-mono)' }}>Space: {complexity.space}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {complexity.hasRecursion && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <AlertTriangle size={12} color="#f59e0b" />
              <span style={{ fontSize: 11, color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>Recursion detected</span>
            </div>
          )}
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            {complexity.lines} lines · {complexity.chars} chars
          </span>
          <div style={{
            fontSize: 9,
            padding: '1px 6px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--color-border)',
            borderRadius: 10,
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            {language}
          </div>
        </div>
      </div>

      {/* Monaco Editor */}
      <div style={{ flex: 1, overflow: 'hidden', background: '#0a0a0b', width: '100%', height: '100%' }}>
        <Suspense fallback={
          <div style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-muted)',
            fontSize: 12,
          }}>
            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite', marginRight: 8 }} />
            Loading editor...
          </div>
        }>
          <MonacoEditor
            height="100%"
            language={monacoLang}
            theme="codementor-dark"
            value={currentCode}
            onChange={handleEditorChange}
            onMount={handleEditorMount}
            options={{
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontLigatures: true,
              lineHeight: 22,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              padding: { top: 16, bottom: 16 },
              renderLineHighlight: 'gutter',
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              smoothScrolling: true,
              automaticLayout: true,
              bracketPairColorization: { enabled: true },
              guides: { bracketPairs: true },
              suggest: { showKeywords: true },
              lineNumbers: 'on',
              glyphMargin: false,
              folding: true,
              renderWhitespace: 'none',
              wordWrap: 'on',
            }}
          />
        </Suspense>
      </div>

      {/* Output Bar */}
      <div style={{
        height: 180,
        borderTop: '1px solid var(--color-border)',
        background: '#0d0d0f',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}>
        {/* Output Tabs */}
        <div style={{
          height: 32,
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'stretch',
          flexShrink: 0,
        }}>
          {/* Run Mode Toggle */}
          <div style={{ flex: 1 }} />
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '2px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 4,
            margin: '4px 8px',
            border: '1px solid var(--color-border)',
          }}>
            {(['single', 'all'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setPassMode(mode)}
                style={{
                  padding: '2px 8px',
                  fontSize: 9,
                  borderRadius: 2,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  background: passMode === mode ? 'var(--color-accent)' : 'transparent',
                  color: passMode === mode ? 'white' : 'var(--color-text-muted)',
                  border: 'none',
                  transition: 'background 0.2s, color 0.2s',
                }}
              >
                {mode === 'single' ? 'Run Single' : 'Run All'}
              </button>
            ))}
          </div>
        </div>

        {/* Output Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px 12px',
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          lineHeight: 1.5,
        }}>
          {outputTab === 'output' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {language !== 'javascript' && (
                <div style={{
                  padding: '8px 12px',
                  background: 'rgba(245,158,11,0.1)',
                  border: '1px solid rgba(245,158,11,0.2)',
                  borderRadius: '6px',
                  color: 'var(--color-warning)',
                  fontSize: 11,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <span style={{ fontSize: 14 }}>⚠</span>
                  <span>Browser execution is supported for JavaScript only. Run Python/Java/C++ in your local environment.</span>
                </div>
              )}
              <div>
                {!problem ? (
                  <span style={{ color: 'var(--color-text-muted)' }}>
                    › Select a problem to get started
                  </span>
                ) : lastResult?.error ? (
                  <span style={{ color: 'var(--color-warning)' }}>
                    ⚠ {lastResult.error}
                  </span>
                ) : lastResult ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ color: lastResult.pass ? 'var(--color-success)' : 'var(--color-error)' }}>
                      {lastResult.pass ? '✓ All tests passed' : '✕ Some tests failed'}
                    </span>
                    <span style={{ color: 'var(--color-text-muted)' }}>
                      › {lastResult.cases.filter(c => c.pass).length}/{lastResult.cases.length} cases passed
                    </span>
                  </div>
                ) : (
                  <span style={{ color: 'var(--color-text-muted)' }}>
                    › Click Run to execute your code
                  </span>
                )}
              </div>
            </div>
          )}

          {outputTab === 'problems' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {problem ? (
                <>
                  <span style={{ color: 'var(--color-text-secondary)' }}>{problem.description}</span>
                  <span style={{ color: 'var(--color-text-muted)' }}>
                    › Time: {problem.timeComplexity} · Space: {problem.spaceComplexity}
                  </span>
                  <span style={{ color: 'var(--color-accent)', marginTop: 4 }}>
                    › Hint: {problem.hint}
                  </span>
                </>
              ) : (
                <span style={{ color: 'var(--color-text-muted)' }}>› Select a problem to view details</span>
              )}
            </div>
          )}

          {outputTab === 'tests' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {!lastResult ? (
                <span style={{ color: 'var(--color-text-muted)' }}>› Run code to see test results</span>
              ) : lastResult.error ? (
                <span style={{ color: 'var(--color-warning)' }}>⚠ {lastResult.error}</span>
              ) : (
                lastResult.cases.map((tc, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <span style={{ color: tc.pass ? 'var(--color-success)' : 'var(--color-error)' }}>
                      {tc.pass ? '✓' : '✕'} Case {i + 1}: {tc.input}
                    </span>
                    {!tc.pass && (
                      <span style={{ color: 'var(--color-text-muted)', paddingLeft: 12 }}>
                        Expected: {tc.expected} · Got: {tc.got}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
