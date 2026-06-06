export interface Doc {
  id: number;
  name: string;
  file_type: string;
  file_size: number;
  pages: number | null;
  chunks: number | null;
  category: string | null;
  owner_id: number;
  owner_name: string;
  status: 'active' | 'inactive';
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

export interface Source {
  file: string;
  page: number;
}

export interface ToolDef {
  id: string;
  label: string;
  icon: string;
}

export interface Message {
  role: 'user' | 'assistant';
  text?: string;
  id?: string;
  status?: 'thinking' | 'done';
  sources?: Source[];
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
