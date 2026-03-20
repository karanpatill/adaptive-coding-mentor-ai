import { useState, useRef, useEffect, useCallback } from 'react';
import { SendHorizonal, Brain, Lightbulb } from 'lucide-react';
import { getMentorResponse, buildSystemPrompt } from '../api/groq';
import type { ChatMessage, Problem, MemoryFact } from '../types';

interface MentorPanelProps {
  problem: Problem | null;
  username: string;
  groqKey: string;
  memories: MemoryFact[];
  code: string;
  onRetainMemory: (content: string, metadata: object) => void;
  onReflect: (query: string) => Promise<string>;
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: 4, padding: '4px 0', alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <div
          key={i}
          style={{
            width: 4, height: 4,
            borderRadius: '50%',
            background: 'var(--color-accent)',
            animation: `dot-pulse 0.8s ease-in-out ${i * 0.16}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

export function MentorPanel({
  problem,
  username,
  groqKey,
  memories,
  code,
  onRetainMemory,
  onReflect,
}: MentorPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hi ${username}! I'm your CodeMentor. Select a problem to get started, or ask me anything about coding.`,
      timestamp: new Date(),
      memoryRecalled: false,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = useCallback(async (messageText?: string) => {
    const text = (messageText ?? input).trim();
    if (!text || isTyping) return;
    setInput('');

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      // Reflect on user's query using Hindsight
      const reflection = await onReflect(
        `User ${username} asking: ${text}. Problem: ${problem?.title ?? 'none'}`
      );

      const recalledFacts = memories.map(m => m.content);
      if (reflection) recalledFacts.unshift(reflection);

      const systemPrompt = buildSystemPrompt(
        username,
        recalledFacts,
        problem?.title ?? 'General question',
        problem?.difficulty ?? 'unknown',
        code
      );

      let aiText = '';
      const aiMsgId = `ai-${Date.now()}`;

      setMessages(prev => [...prev, {
        id: aiMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        memoryRecalled: recalledFacts.length > 0,
      }]);

      await getMentorResponse(groqKey, text, systemPrompt, (chunk: string) => {
        aiText += chunk;
        setMessages(prev => prev.map(m =>
          m.id === aiMsgId ? { ...m, content: aiText } : m
        ));
      });

      setIsTyping(false);

      // Retain the interaction
      if (problem) {
        await onRetainMemory(
          `User asked: "${text}". AI responded about ${problem.title}.`,
          {
            type: 'chat_interaction',
            problem: problem.id,
            difficulty: problem.difficulty,
            timestamp: new Date().toISOString(),
          }
        );
      }
    } catch (err) {
      setIsTyping(false);
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: err instanceof Error
          ? `Error: ${err.message}`
          : 'Failed to get response. Check your API key.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errMsg]);
    }
  }, [input, isTyping, username, groqKey, problem, memories, code, onRetainMemory, onReflect]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleHintClick = () => {
    if (problem) {
      sendMessage(`Give me a hint for the "${problem.title}" problem.`);
    }
  };

  return (
    <div style={{
      width: 'var(--mentor-width)',
      display: 'flex',
      flexDirection: 'column',
      background: 'rgba(10,10,11,0.85)',
      backdropFilter: 'blur(12px)',
      borderLeft: '1px solid var(--color-border)',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{
        padding: '0 12px',
        height: 36,
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        flexShrink: 0,
        background: 'var(--color-bg-elevated)',
      }}>
        <Brain size={12} color="var(--color-accent)" />
        <span className="label">Mentor</span>
        {problem && (
          <>
            <div style={{ flex: 1 }} />
            <button
              onClick={handleHintClick}
              disabled={isTyping}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
                color: 'var(--color-text-muted)',
                padding: '2px 6px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-bg-subtle)',
                border: '1px solid var(--color-border)',
                transition: 'color 0.1s, border-color 0.1s',
              }}
              onMouseEnter={e => {
                (e.currentTarget).style.color = 'var(--color-warning)';
                (e.currentTarget).style.borderColor = 'rgba(245,158,11,0.3)';
              }}
              onMouseLeave={e => {
                (e.currentTarget).style.color = 'var(--color-text-muted)';
                (e.currentTarget).style.borderColor = 'var(--color-border)';
              }}
            >
              <Lightbulb size={10} />
              Hint
            </button>
          </>
        )}
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}>
        {messages.map(msg => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
              gap: 4,
              animation: 'fadeInUp 0.2s ease-out',
            }}
          >
            {/* Memory badge */}
            {msg.role === 'assistant' && msg.memoryRecalled && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '2px 6px',
                background: 'var(--color-memory-subtle)',
                border: '1px solid rgba(16,185,129,0.2)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: 2,
              }}>
                <Brain size={10} color="var(--color-memory)" />
                <span style={{
                  fontSize: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--color-memory)',
                }}>
                  Memory Recalled
                </span>
              </div>
            )}

            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 6,
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
            }}>
              {/* AI Avatar */}
              {msg.role === 'assistant' && (
                <div style={{
                  width: 24, height: 24,
                  borderRadius: '50%',
                  background: 'var(--color-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 9,
                  fontWeight: 600,
                  color: 'white',
                  flexShrink: 0,
                }}>
                  CM
                </div>
              )}

              {/* Bubble */}
              <div style={{
                maxWidth: msg.role === 'user' ? '85%' : '90%',
                padding: '8px 12px',
                borderRadius: msg.role === 'user'
                  ? '10px 2px 10px 10px'
                  : '2px 10px 10px 10px',
                background: msg.role === 'user'
                  ? 'var(--color-accent-subtle)'
                  : 'var(--color-bg-overlay)',
                border: msg.role === 'user'
                  ? '1px solid rgba(99,102,241,0.2)'
                  : '1px solid var(--color-border)',
                fontSize: 13,
                color: 'var(--color-text-primary)',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}>
                {msg.content || (
                  <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>
                    Thinking...
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 6,
            animation: 'fadeInUp 0.2s ease-out',
          }}>
            <div style={{
              width: 24, height: 24,
              borderRadius: '50%',
              background: 'var(--color-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 9,
              fontWeight: 600,
              color: 'white',
              flexShrink: 0,
            }}>
              CM
            </div>
            <div style={{
              padding: '8px 12px',
              borderRadius: '2px 10px 10px 10px',
              background: 'var(--color-bg-overlay)',
              border: '1px solid var(--color-border)',
            }}>
              <TypingIndicator />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '8px 12px 12px',
        borderTop: '1px solid var(--color-border)',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 8,
          background: 'var(--color-bg-overlay)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '8px 8px 8px 12px',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
          onFocusCapture={e => {
            (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-border-focus)';
            (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 0 3px var(--color-accent-glow)';
          }}
          onBlurCapture={e => {
            (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-border)';
            (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
          }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything... (Enter to send)"
            rows={1}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              color: 'var(--color-text-primary)',
              fontSize: 13,
              lineHeight: 1.5,
              maxHeight: 80,
              overflowY: 'auto',
              alignSelf: 'center',
            }}
            onInput={e => {
              const el = e.target as HTMLTextAreaElement;
              el.style.height = 'auto';
              el.style.height = `${Math.min(el.scrollHeight, 80)}px`;
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isTyping}
            style={{
              width: 28, height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-sm)',
              background: input.trim() && !isTyping ? 'var(--color-accent)' : 'transparent',
              color: input.trim() && !isTyping ? 'white' : 'var(--color-text-muted)',
              transition: 'background 0.15s, color 0.15s',
              flexShrink: 0,
            }}
          >
            <SendHorizonal size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
