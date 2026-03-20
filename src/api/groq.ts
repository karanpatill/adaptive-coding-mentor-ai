export async function getMentorResponse(
  apiKey: string,
  userMessage: string,
  systemContext: string,
  onChunk: (text: string) => void
): Promise<void> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemContext },
        { role: 'user', content: userMessage },
      ],
      stream: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) return;

  const decoder = new TextDecoder();
  let finished = false;

  while (!finished) {
    const { done, value } = await reader.read();
    if (done) {
      finished = true;
      break;
    }

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n').filter(line => line.trim() !== '');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') {
          finished = true;
          break;
        }
        try {
          const json = JSON.parse(data);
          const text = json.choices[0]?.delta?.content || '';
          if (text) onChunk(text);
        } catch (e) {
          // Ignore parse errors for incomplete chunks
        }
      }
    }
  }
}

export function buildSystemPrompt(
  username: string,
  recalledFacts: string[],
  problemTitle: string,
  problemDifficulty: string,
  userCode: string
): string {
  const factsSection = recalledFacts.length > 0
    ? recalledFacts.slice(0, 3).join('\n')
    : 'No previous memory for this user yet.';

  return `You are CodeMentor AI, an expert coding tutor for ${username}.
You have persistent memory of their past mistakes via Hindsight.
Be precise, brief (2-4 sentences), and use backticks for code.
Never give away full solutions — guide with targeted hints.

Hindsight memory context:
${factsSection}

Current problem: ${problemTitle} (${problemDifficulty})
User's code (first 400 chars): ${userCode.slice(0, 400)}`;
}
