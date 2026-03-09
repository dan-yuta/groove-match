export function sanitizeHtml(str: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
  };
  return str.replace(/[&<>"']/g, (ch) => map[ch]);
}

export function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < 32; i++) array[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function getCsrfToken(): string {
  if (typeof window === 'undefined') return '';
  let token = sessionStorage.getItem('bandmatch-csrf');
  if (!token) {
    token = generateCsrfToken();
    sessionStorage.setItem('bandmatch-csrf', token);
  }
  return token;
}

export function validateCsrfToken(token: string): boolean {
  if (typeof window === 'undefined') return false;
  return token === sessionStorage.getItem('bandmatch-csrf');
}

export function sanitizeInput(input: string): string {
  return sanitizeHtml(input.trim());
}
