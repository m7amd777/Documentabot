const BASE = '/api';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.detail ?? 'Something went wrong.');
  }

  return res.json() as Promise<T>;
}

// ---------- Auth ----------

export interface User {
  id: number;
  name: string;
}

export const auth = {
  me: () => request<User>('/auth/me'),
  login: (name: string, password: string) =>
    request<User>('/auth/login', { method: 'POST', body: JSON.stringify({ name, password }) }),
  register: (name: string, password: string) =>
    request<User>('/auth/register', { method: 'POST', body: JSON.stringify({ name, password }) }),
  logout: () => request<void>('/auth/logout', { method: 'POST' }),
};

// ---------- Documents ----------

export interface Document {
  id: number;
  name: string;
  file_size: number;
  pages: number | null;
  chunks: number | null;
  file_type: string;
  category: string | null;
  owner_id: number;
  owner_name: string;
  status: 'active' | 'inactive';
}

// ---------- Chats ----------

export interface ChatSession {
  id: number;
  name: string;
  created_at?: string;
}

export interface ChatMsg {
  id: number;
  chat_id: number;
  is_response: boolean;
  content: string;
  created_at: string;
}

export interface Source {
  file: string;
  page: number;
}

export const chats = {
  list: () => request<ChatSession[]>('/chats'),
  messages: (chatId: number) => request<ChatMsg[]>(`/chats/${chatId}/messages`),
  create: (question: string) =>
    request<{ chat: ChatSession; answer: string; sources: Source[] }>(
      '/chats', { method: 'POST', body: JSON.stringify({ question }) }
    ),
  send: (chatId: number, question: string) =>
    request<{ answer: string; sources: Source[] }>(
      `/chats/${chatId}/messages`, { method: 'POST', body: JSON.stringify({ question }) }
    ),
};

// ---------- Documents ----------

export const documents = {
  list: () => request<Document[]>('/documents'),
  upload: (file: File, category?: string) => {
    const form = new FormData();
    form.append('file', file);
    if (category) form.append('category', category);
    return fetch(`${BASE}/upload`, {
      method: 'POST',
      credentials: 'include',
      body: form,
    }).then(async (res) => {
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new ApiError(res.status, body.detail ?? 'Upload failed.');
      }
      return res.json() as Promise<{ message: string; data: Document }>;
    });
  },
  delete: (id: number) => request<{ message: string }>(`/documents/${id}`, { method: 'DELETE' }),
};
