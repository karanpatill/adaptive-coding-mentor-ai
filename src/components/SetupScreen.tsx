import { useState } from 'react';
import { User, Loader2, Rocket } from 'lucide-react';
import { createMemoryBank } from '../api/hindsight';
import type { UserSession } from '../types';
import { MiniTorusCanvas } from './MiniTorusCanvas';

interface SetupScreenProps {
  onComplete: (session: UserSession) => void;
}

const STEPS = ['Initializing', 'Connecting Bank', 'Success'];

export function SetupScreen({ onComplete }: SetupScreenProps) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [progressStep, setProgressStep] = useState(-1);
  const [error, setError] = useState('');

  // These are now handled entirely via environment variables OR defaults
  const groqKey = import.meta.env.VITE_GROQ_API_KEY || '';
  const hindsightKey = import.meta.env.VITE_HINDSIGHT_API_KEY || '';
  const pipelineId = import.meta.env.VITE_HINDSIGHT_PIPELINE_ID || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError('');
    setProgressStep(0);

    try {
      await new Promise(r => setTimeout(r, 800));
      
      let bankId = pipelineId;
      if (!bankId) {
        setProgressStep(1);
        // We use the Hindsight Key from env to create the bank for this user
        bankId = await createMemoryBank(hindsightKey, username);
      }
      
      setProgressStep(2);
      await new Promise(r => setTimeout(r, 600));

      onComplete({ 
        username, 
        groqKey, 
        hindsightKey, 
        bankId 
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Initialization failed. Please check your environment configuration.');
      setProgressStep(-1);
    } finally {
      setLoading(false);
    }
  };

  const progress = progressStep >= 0 ? ((progressStep + 1) / 3) * 100 : 0;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: 24,
    }}>
      <div style={{
        background: 'rgba(17,17,19,0.92)',
        backdropFilter: 'blur(34px)',
        border: '1px solid rgba(99,102,241,0.25)',
        borderRadius: '24px',
        width: 440,
        padding: '48px 40px',
        boxShadow: '0 0 100px rgba(99,102,241,0.15)',
        animation: 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative Glow */}
        <div style={{
          position: 'absolute',
          top: -120,
          right: -120,
          width: 240,
          height: 240,
          background: 'var(--color-accent)',
          filter: 'blur(110px)',
          opacity: 0.1,
          pointerEvents: 'none',
        }} />

        {/* Logo Section */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, marginBottom: 40 }}>
          <div style={{ 
            padding: 4, 
            background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-memory) 100%)',
            borderRadius: '50%',
            boxShadow: '0 0 50px rgba(99,102,241,0.4)',
            animation: 'float 6s ease-in-out infinite',
          }}>
            <div style={{
              background: '#0a0a0b',
              borderRadius: '50%',
              padding: 4,
            }}>
              <MiniTorusCanvas />
            </div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <h1 style={{
              fontSize: 36,
              fontWeight: 700,
              color: 'white',
              letterSpacing: '-0.04em',
              margin: 0,
              background: 'linear-gradient(to bottom, #fff, #94a3b8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              CodeMentor AI
            </h1>
            <p style={{
              fontSize: 16,
              color: 'var(--color-text-secondary)',
              marginTop: 12,
              fontStyle: 'italic',
              maxWidth: 320,
              lineHeight: 1.6,
              opacity: 0.85,
            }}>
              "First, solve the problem. Then, write the code." — <span style={{ color: 'var(--color-accent)', fontWeight: 500 }}>John Johnson</span>
            </p>
          </div>

          {/* Browser limitation warning (placed prominently) */}
          <div style={{
            marginTop: 8,
            padding: '8px 16px',
            background: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            maxWidth: 360,
          }}>
            <span style={{ fontSize: 16 }}>⚠</span>
            <span style={{ 
              fontSize: 11, 
              color: 'rgba(245,158,11,0.9)', 
              fontWeight: 500, 
              lineHeight: 1.4,
              textAlign: 'left'
            }}>
              Browser execution is supported for JavaScript only. Run Python/Java/C++ in your local environment.
            </span>
          </div>
        </div>

        {/* Simplified Interaction Section */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ 
              fontSize: 12, 
              color: 'var(--color-text-muted)', 
              textTransform: 'uppercase', 
              letterSpacing: '0.1em',
              fontWeight: 600,
              marginLeft: 4,
            }}>
              Who is learning today?
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{
                position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)',
              }} />
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter your name"
                required
                disabled={loading}
                autoFocus
                style={{
                  width: '100%',
                  height: 54,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  color: 'white',
                  fontSize: 16,
                  paddingLeft: 48,
                  paddingRight: 16,
                  outline: 'none',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)',
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'var(--color-accent)';
                  e.target.style.background = 'rgba(255,255,255,0.06)';
                  e.target.style.boxShadow = 'inset 0 1px 3px rgba(0,0,0,0.2), 0 0 0 4px rgba(99,102,241,0.15)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.target.style.background = 'rgba(255,255,255,0.03)';
                  e.target.style.boxShadow = 'inset 0 1px 3px rgba(0,0,0,0.2)';
                }}
              />
            </div>
          </div>

          {error && (
            <div style={{
              fontSize: 12,
              color: '#fca5a5',
              padding: '12px 16px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '12px',
              animation: 'fadeIn 0.3s ease-out',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !username.trim()}
            style={{
              width: '100%',
              height: 54,
              background: loading ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg, var(--color-accent) 0%, #4338ca 100%)',
              border: 'none',
              borderRadius: '16px',
              color: 'white',
              fontSize: 16,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: loading ? 'none' : '0 10px 25px rgba(99,102,241,0.3)',
            }}
            onMouseEnter={e => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(99,102,241,0.4)';
              }
            }}
            onMouseLeave={e => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(99,102,241,0.3)';
              }
            }}
          >
            {loading ? (
              <>
                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                Setting up environment...
              </>
            ) : (
              <>
                <Rocket size={18} />
                Start Coding
              </>
            )}
          </button>
        </form>

        {/* Initialization Progress Bar (only while loading) */}
        {loading && progressStep >= 0 && (
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10, animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 500 }}>
                {STEPS[progressStep]}
              </span>
              <span style={{ fontSize: 11, color: 'var(--color-accent)', fontWeight: 600 }}>
                {Math.round(progress)}%
              </span>
            </div>
            <div style={{
              height: 4,
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 2,
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${progress}%`,
                background: 'var(--color-accent)',
                transition: 'width 0.4s ease',
              }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
