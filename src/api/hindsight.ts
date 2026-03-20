const BASE = 'https://api.hindsight.vectorize.io/v1';

const headers = (key: string) => ({
  'Authorization': `Bearer ${key}`,
  'Content-Type': 'application/json',
});

export async function createMemoryBank(key: string, username: string): Promise<string> {
  const res = await fetch(`${BASE}/memory-banks`, {
    method: 'POST',
    headers: headers(key),
    body: JSON.stringify({
      name: `${username.toLowerCase()}-codementor-${Date.now()}`,
      mission: `I am a personalized coding mentor memory bank for ${username}. I track their coding mistakes, error patterns, preferred languages, problem-solving behavior, and learning progress across sessions.`,
      directives: [
        'Always track specific error types: off-by-one, null pointer, wrong algorithm choice, syntax errors',
        'Remember which problem types the user struggles with repeatedly',
        'Note when user successfully applies a concept they previously failed at',
        'Track preferred programming languages and coding style patterns',
      ],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to create memory bank: ${err}`);
  }
  const data = await res.json();
  return data.id || data.bank_id || data.memory_bank_id || '';
}

export async function retain(
  key: string,
  bankId: string,
  content: string,
  metadata: object
): Promise<void> {
  await fetch(`${BASE}/memory-banks/${bankId}/facts`, {
    method: 'POST',
    headers: headers(key),
    body: JSON.stringify({ content, metadata }),
  });
}

export async function recall(
  key: string,
  bankId: string,
  query: string,
  limit = 5
): Promise<Array<{ content: string; timestamp?: string }>> {
  const res = await fetch(`${BASE}/memory-banks/${bankId}/recall`, {
    method: 'POST',
    headers: headers(key),
    body: JSON.stringify({ query, limit }),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.facts || data.results || data.memories || [];
}

export async function reflect(
  key: string,
  bankId: string,
  query: string
): Promise<string> {
  const res = await fetch(`${BASE}/memory-banks/${bankId}/reflect`, {
    method: 'POST',
    headers: headers(key),
    body: JSON.stringify({ query }),
  });
  if (!res.ok) return '';
  const data = await res.json();
  return data.response || data.reflection || '';
}
