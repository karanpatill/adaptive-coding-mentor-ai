import React, { useState, useEffect } from 'react';
import { History, GitCompare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { recall } from '../api/hindsight';
import type { UserSession } from '../types';

interface TimelineTabProps {
  session: UserSession;
  onCompareDiff: (oldCode: string, title: string, lang: string) => void;
}

const MOCK_DATA = [
  { type: 'success', problem: 'Two Sum', time: new Date(Date.now() - 2 * 60000).toISOString(), summary: 'Solved in 2 attempts using hash map' },
  { type: 'failure', problem: 'Valid Parentheses', time: new Date(Date.now() - 10 * 60000).toISOString(), summary: 'Failed - stack logic incorrect' },
  { type: 'hint', problem: 'FizzBuzz', time: new Date(Date.now() - 25 * 60000).toISOString(), summary: 'Requested hint after 1 attempt' },
  { type: 'success', problem: 'Palindrome Check', time: new Date(Date.now() - 60 * 60000).toISOString(), summary: 'Solved first attempt' },
  { type: 'failure', problem: 'Merge Sorted Arrays', time: new Date(Date.now() - 120 * 60000).toISOString(), summary: 'Failed - off by one error' },
];

export function TimelineTab({ session, onCompareDiff }: TimelineTabProps) {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    const loadTimeline = async () => {
      setLoading(true);
      const startTime = Date.now();

      try {
        const [interactions, history] = await Promise.all([
          recall(session.hindsightKey, session.bankId, `all interactions and attempts by ${session.username}`, 50),
          recall(session.hindsightKey, session.bankId, `${session.username} coding history problems solved failed`, 50)
        ]);

        if (isMounted) {
          // Combine and deduplicate by content
          const combined = [...interactions, ...history];
          const seen = new Set();
          const unique = combined.filter(item => {
            if (seen.has(item.content)) return false;
            seen.add(item.content);
            return true;
          });

          // Sort descending
          unique.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());

          // Minimum 1.5s skeleton display
          const elapsed = Date.now() - startTime;
          if (elapsed < 1500) {
            await new Promise(r => setTimeout(r, 1500 - elapsed));
          }

          if (unique.length > 0) {
            setEvents(unique.map(item => ({
              type: item.metadata?.type || 'chat',
              problem: item.metadata?.problem || 'General',
              time: item.timestamp,
              summary: item.content,
              code: item.metadata?.code,
              lang: item.metadata?.language
            })));
          } else {
            setEvents(MOCK_DATA);
          }
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          const elapsed = Date.now() - startTime;
          if (elapsed < 1500) await new Promise(r => setTimeout(r, 1500 - elapsed));
          setEvents(MOCK_DATA);
          setLoading(false);
        }
      }
    };

    loadTimeline();
    return () => { isMounted = false; };
  }, [session]);

  const getColor = (type: string) => {
    switch(type) {
      case 'success': case 'solved': return 'var(--color-success)';
      case 'failure': case 'failed': return 'var(--color-error)';
      case 'hint': return '#f59e0b';
      case 'chat': default: return '#a855f7';
    }
  };

  return (
    <div style={{ padding: '8px 0', height: '100%', overflowY: 'auto' }}>
      {loading ? (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ display: 'flex', gap: 12, animation: 'pulse 1.5s infinite opacity' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', marginTop: 4, flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ width: 60, height: 10, background: 'rgba(255,255,255,0.1)', borderRadius: 4 }} />
                <div style={{ width: '80%', height: 12, background: 'rgba(255,255,255,0.1)', borderRadius: 4 }} />
                <div style={{ width: '90%', height: 12, background: 'rgba(255,255,255,0.1)', borderRadius: 4 }} />
              </div>
            </div>
          ))}
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
          `}} />
        </div>
      ) : (
        <>
          {events.map((e, idx) => (
            <div key={idx} style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{
                  width: 8, height: 8,
                  borderRadius: '50%',
                  background: getColor(e.type),
                  marginTop: 4,
                  boxShadow: `0 0 10px ${getColor(e.type)}`
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-primary)' }}>{e.problem}</span>
                    <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
                      {e.time ? formatDistanceToNow(new Date(e.time), { addSuffix: true }) : 'unknown'}
                    </span>
                  </div>
                  <p style={{ 
                    fontSize: 11, 
                    color: 'var(--color-text-secondary)', 
                    margin: '6px 0',
                    lineHeight: '1.4'
                  }}>{e.summary}</p>
                  
                  {e.code && (e.type === 'success' || e.type === 'solved') && (
                    <button 
                      onClick={() => onCompareDiff(e.code, e.problem, e.lang || 'javascript')}
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
          ))}
        </>
      )}
    </div>
  );
}
