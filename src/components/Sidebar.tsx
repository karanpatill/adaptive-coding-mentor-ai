import { useState, useMemo } from 'react';
import {
  Code2, Brain, CheckCircle2, BarChart3, History,
  Settings, GitCompare, ExternalLink
} from 'lucide-react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis,
  ResponsiveContainer
} from 'recharts';
import { formatDistanceToNow } from 'date-fns';
import { DiffModal } from './DiffModal';
import type { Problem, ActivityTab, MemoryFact } from '../types';

interface SidebarProps {
  problems: Problem[];
  selectedProblem: Problem | null;
  onSelectProblem: (p: Problem) => void;
  activeTab: ActivityTab;
  onTabChange: (tab: ActivityTab) => void;
  memories: MemoryFact[];
  solvedIds: Set<string>;
  currentCode: string;
}

const DIFFICULTY_STYLE: Record<string, React.CSSProperties> = {
  easy: {
    background: '#052e16',
    color: '#4ade80',
    border: '1px solid #166534',
  },
  medium: {
    background: '#451a03',
    color: '#fb923c',
    border: '1px solid #9a3412',
  },
  hard: {
    background: '#450a0a',
    color: '#f87171',
    border: '1px solid #991b1b',
  },
};

export function Sidebar({
  problems,
  selectedProblem,
  onSelectProblem,
  activeTab,
  onTabChange,
  memories,
  solvedIds,
  currentCode,
}: SidebarProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hoveredActivity, setHoveredActivity] = useState<string | null>(null);
  const [showDiff, setShowDiff] = useState<{ old: string, title: string, lang: string } | null>(null);

  const activityItems = [
    { id: 'problems' as ActivityTab, icon: Code2, label: 'Problems' },
    { id: 'skills' as ActivityTab, icon: BarChart3, label: 'Skills' },
    { id: 'timeline' as ActivityTab, icon: History, label: 'Timeline' },
    { id: 'memory' as ActivityTab, icon: Brain, label: 'Memories' },
  ];

  const solvedCount = problems.filter(p => solvedIds.has(p.id)).length;

  // Radar Data Calculation
  const radarData = useMemo(() => {
    const topics = ['Arrays', 'Strings', 'DP', 'Stacks', 'Math', 'Sorting'];
    const scores: Record<string, { success: number, total: number }> = {};
    topics.forEach(t => scores[t] = { success: 0, total: 0 });

    memories.forEach(m => {
      const meta = m.metadata;
      if (meta && meta.tags && Array.isArray(meta.tags)) {
        meta.tags.forEach((tag: unknown) => {
          if (typeof tag !== 'string') return;
          let category = '';
          if (tag.toLowerCase().includes('array')) category = 'Arrays';
          else if (tag.toLowerCase().includes('string')) category = 'Strings';
          else if (tag.toLowerCase().includes('dynamic')) category = 'DP';
          else if (tag.toLowerCase().includes('stack')) category = 'Stacks';
          else if (tag.toLowerCase().includes('math')) category = 'Math';
          else if (tag.toLowerCase().includes('sort')) category = 'Sorting';

          if (category && scores[category]) {
            scores[category].total++;
            if (meta.type === 'solved') scores[category].success++;
          }
        });
      }
    });

    return topics.map(t => ({
      subject: t,
      A: scores[t].total === 0 ? 50 : (scores[t].success / scores[t].total) * 100,
      fullMark: 100
    }));
  }, [memories]);

  const timelineEvents = useMemo(() => {
    return [...memories].sort((a, b) => {
      return new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime();
    });
  }, [memories]);

  return (
    <>
      <div style={{ display: 'flex', height: '100%' }}>
        {/* Activity Bar */}
        <div style={{
          width: 'var(--sidebar-activity)',
          background: 'rgba(13,13,15,0.75)',
          backdropFilter: 'blur(12px)',
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 8,
          paddingBottom: 8,
          gap: 4,
          flexShrink: 0,
        }}>
          {activityItems.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              title={label}
              onClick={() => onTabChange(id)}
              onMouseEnter={() => setHoveredActivity(id)}
              onMouseLeave={() => setHoveredActivity(null)}
              style={{
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-sm)',
                color: activeTab === id
                  ? 'var(--color-accent)'
                  : hoveredActivity === id
                    ? 'var(--color-text-secondary)'
                    : 'var(--color-text-muted)',
                borderLeft: activeTab === id ? '2px solid var(--color-accent)' : '2px solid transparent',
                transition: 'all 0.15s',
                position: 'relative',
              }}
            >
              <Icon size={18} />
            </button>
          ))}

          <div style={{ flex: 1 }} />
          <button
            title="Settings"
            style={{
              width: 36, height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-muted)',
              transition: 'color 0.15s',
            }}
          >
            <Settings size={18} />
          </button>
        </div>

        {/* Panel */}
        <div style={{
          width: 'var(--sidebar-panel)',
          background: 'rgba(10,10,11,0.85)',
          backdropFilter: 'blur(12px)',
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
          flexShrink: 0,
        }}>
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexShrink: 0,
          }}>
            <span style={{ 
              fontSize: 11, 
              fontWeight: 600, 
              color: 'var(--color-text-primary)', 
              textTransform: 'uppercase', 
              letterSpacing: '0.08em' 
            }}>
              {activeTab}
            </span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {activeTab === 'problems' && (
              <div style={{ padding: '4px 0' }}>
                {problems.map(p => (
                  <div
                    key={p.id}
                    onClick={() => onSelectProblem(p)}
                    onMouseEnter={() => setHoveredId(p.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{
                      padding: '8px 16px',
                      cursor: 'pointer',
                      background: selectedProblem?.id === p.id ? 'rgba(99,102,241,0.1)' : hoveredId === p.id ? 'rgba(255,255,255,0.03)' : 'transparent',
                      borderLeft: selectedProblem?.id === p.id ? '2px solid var(--color-accent)' : '2px solid transparent',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ 
                        fontSize: 13, 
                        color: selectedProblem?.id === p.id ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                        fontFamily: 'var(--font-mono)'
                      }}>{p.title}</span>
                      {solvedIds.has(p.id) && <CheckCircle2 size={12} color="var(--color-success)" />}
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <span style={{ fontSize: 9, textTransform: 'uppercase', color: DIFFICULTY_STYLE[p.difficulty].color }}>{p.difficulty}</span>
                      <span style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>{p.tags[0]}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'skills' && (
              <div style={{ padding: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 220, height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.06)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                      <Radar
                        name="User"
                        dataKey="A"
                        stroke="#6366f1"
                        fill="#6366f1"
                        fillOpacity={0.15}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ width: '100%', padding: '0 16px', marginTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>{solvedCount}</div>
                      <div style={{ fontSize: 9, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Solved</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-memory)' }}>{memories.length}</div>
                      <div style={{ fontSize: 9, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Memory</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-accent)' }}>{Math.round((solvedCount / (problems.length || 1)) * 100)}%</div>
                      <div style={{ fontSize: 9, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Progress</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'timeline' && (
              <div style={{ padding: '8px 0' }}>
                {timelineEvents.map((e, idx) => {
                  const isSolved = e.metadata?.type === 'solved';
                  const savedCode = e.metadata?.code as string;
                  return (
                    <div key={idx} style={{ 
                      padding: '12px 16px', 
                      borderBottom: '1px solid rgba(255,255,255,0.03)',
                    }}>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <div style={{
                          width: 8, height: 8,
                          borderRadius: '50%',
                          background: isSolved ? 'var(--color-success)' : 'var(--color-error)',
                          marginTop: 4,
                          boxShadow: `0 0 10px ${isSolved ? 'var(--color-success)' : 'var(--color-error)'}`
                        }} />
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
                            {e.timestamp ? formatDistanceToNow(new Date(e.timestamp), { addSuffix: true }) : 'unknown'}
                          </span>
                          <p style={{ 
                            fontSize: 11, 
                            color: 'var(--color-text-secondary)', 
                            margin: '4px 0',
                            lineHeight: '1.4'
                          }}>{e.content}</p>
                          
                          {isSolved && savedCode && (
                            <button 
                              onClick={() => setShowDiff({ old: savedCode, title: e.metadata?.problem as string, lang: e.metadata?.language as string })}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                                marginTop: 6,
                                padding: '2px 8px',
                                background: 'rgba(99,102,241,0.1)',
                                border: '1px solid rgba(99,102,241,0.2)',
                                borderRadius: 4,
                                color: 'var(--color-accent)',
                                fontSize: 10,
                                cursor: 'pointer',
                              }}
                            >
                              <GitCompare size={10} /> Compare with current
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'memory' && (
              <div style={{ padding: '12px' }}>
                {memories.map((m, i) => (
                  <div key={i} style={{
                    padding: '8px 12px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 4,
                    marginBottom: 8,
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-text-secondary)'
                  }}>
                    {m.content}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showDiff && (
        <DiffModal
          onClose={() => setShowDiff(null)}
          oldCode={showDiff.old}
          newCode={currentCode}
          title={showDiff.title}
          language={showDiff.lang}
        />
      )}
    </>
  );
}
