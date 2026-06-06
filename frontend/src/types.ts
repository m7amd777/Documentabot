export interface Doc {
  id: string;
  name: string;
  type: string;
  cat: string;
  owner: string;
  ownerInit: string;
  updated: string;
  size: string;
  pages: number;
  status: 'indexed' | 'processing' | 'review' | 'failed';
  chunks: number;
  access: string;
  isNew?: boolean;
}

export interface Cite {
  id: number;
  doc: string;
  type: string;
  ref: string;
  conf: number;
  snippet: string;
}

export interface MissingDoc {
  name: string;
  type: string;
  status: string;
  owner: string;
}

export interface AnswerData {
  confidence: number;
  answer: string[];
  cites: Cite[];
  related: string[];
  followups: string[];
  searched: string[];
  noAnswer?: boolean;
  missingDoc?: MissingDoc;
}

export interface Tool {
  id: string;
  label: string;
  detail: string;
  icon: string;
  ms: number;
}

export interface Message {
  role: 'user' | 'assistant';
  text?: string;
  id?: string;
  status?: 'thinking' | 'done';
  data?: AnswerData;
  tools?: Tool[];
  states?: string[];
}

export interface Chat {
  id: string;
  title: string;
  when: string;
}

export interface Prompt {
  q: string;
  key: string;
}

export interface Category {
  name: string;
  count: number;
}

export interface FileTypeConfig {
  label: string;
  color: string;
  bg: string;
}
