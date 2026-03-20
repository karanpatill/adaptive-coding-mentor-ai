import React, { useState, useMemo } from 'react';
import { Brain, RefreshCw, Activity, Target, Zap } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import type { MemoryFact, UserSession } from '../types';

interface BrainTabProps {
  session: UserSession;
  memories: MemoryFact[];
  onRefresh: () => void;
}

export function BrainTab({ session, memories, onRefresh }: BrainTabProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh(); // App.tsx will execute the exact query: "{username} all coding patterns"
    setIsRefreshing(false);
  };

  const { radarData, insights } = useMemo(() => {
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
          else if (tag.toLowerCase().includes('dynamic') || tag.toLowerCase().includes('dp')) category = 'DP';
          else if (tag.toLowerCase().includes('stack')) category = 'Stacks';
          else if (tag.toLowerCase().includes('math')) category = 'Math';
          else if (tag.toLowerCase().includes('sort')) category = 'Sorting';

          if (category && scores[category]) {
            scores[category].total++;
            if (meta.type === 'solved' || meta.type === 'success') scores[category].success++;
          }
        });
      }
    });

    const radar = topics.map(t => ({
      subject: t,
      A: scores[t].total === 0 ? 50 : (scores[t].success / scores[t].total) * 100,
      fullMark: 100
    }));

    let strongest = { topic: '-', rate: 0 };
    let weakest = { topic: '-', rate: 100 };
    let mostAttempted = { topic: '-', count: 0 };

    topics.forEach(t => {
      const { total, success } = scores[t];
      if (total > mostAttempted.count) {
        mostAttempted = { topic: t, count: total };
      }
      if (total > 0) {
        const rate = success / total;
        if (rate >= strongest.rate) strongest = { topic: t, rate };
        if (rate <= weakest.rate) weakest = { topic: t, rate };
      }
    });

    return { 
      radarData: radar, 
      insights: {
        strongest: strongest.topic !== '-' ? strongest.topic : 'None yet',
        weakest: weakest.topic !== '-' ? weakest.topic : 'None yet',
        mostAttempted: mostAttempted.topic !== '-' ? `${mostAttempted.topic} (${mostAttempted.count})` : 'None yet'
      }
    };
  }, [memories]);

  if (memories.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 24, textAlign: 'center' }}>
        <div style={{ position: 'relative', marginBottom: 24 }}>
          <Brain size={48} color="var(--color-memory)" style={{ opacity: 0.8 }} />
          <div style={{ 
            position: 'absolute', top: -4, right: -4, width: 12, height: 12, 
            background: 'var(--color-success)', borderRadius: '50%',
            boxShadow: '0 0 12px var(--color-success)',
            animation: 'pulse 1.5s infinite' 
          }} />
        </div>
        <h3 style={{ fontSize: 16, color: 'var(--color-text-primary)', marginBottom: 8 }}>Empty Memory Bank</h3>
        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
          Solve your first problem to start building memory! CodeMentor will learn your patterns, strengths, and weaknesses to guide you better.
        </p>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes pulse { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }
        `}} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header Stat */}
      <div style={{ padding: '24px 16px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
        <div style={{ fontSize: 42, fontWeight: 700, color: 'var(--color-memory)', lineHeight: 1 }}>{memories.length}</div>
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>Memories Stored</div>
        
        <button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          style={{ 
            marginTop: 16, display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 16px', background: 'rgba(99,102,241,0.1)', color: 'var(--color-accent)',
            border: '1px solid rgba(99,102,241,0.2)', borderRadius: 20, fontSize: 11, cursor: isRefreshing ? 'wait' : 'pointer'
          }}
        >
          <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
          {isRefreshing ? 'Recalling...' : 'Refresh Memories'}
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0' }}>
        {/* Radar Chart */}
        <div style={{ width: '100%', height: 200, display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
              <Radar name="User" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* 3 Insights Cards */}
        <div style={{ padding: '0 16px', display: 'flex', gap: 8, marginBottom: 24 }}>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, padding: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <Zap size={14} color="var(--color-success)" />
            <span style={{ fontSize: 9, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Strongest</span>
            <span style={{ fontSize: 11, color: 'var(--color-text-primary)', fontWeight: 600, textAlign: 'center' }}>{insights.strongest}</span>
          </div>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, padding: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <Activity size={14} color="var(--color-error)" />
            <span style={{ fontSize: 9, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Weakest</span>
            <span style={{ fontSize: 11, color: 'var(--color-text-primary)', fontWeight: 600, textAlign: 'center' }}>{insights.weakest}</span>
          </div>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, padding: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <Target size={14} color="var(--color-warning)" />
            <span style={{ fontSize: 9, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Attempted</span>
            <span style={{ fontSize: 11, color: 'var(--color-text-primary)', fontWeight: 600, textAlign: 'center' }}>{insights.mostAttempted}</span>
          </div>
        </div>

        {/* Memory Cards */}
        <div style={{ padding: '0 16px' }}>
          <h4 style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Fact Log</h4>
          {memories.map((m, i) => (
            <div key={i} style={{
              padding: '12px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--color-border)',
              borderRadius: 6,
              marginBottom: 8,
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.5
            }}>
              {m.content}
            </div>
          ))}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
}
