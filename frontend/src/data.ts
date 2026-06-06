import type { Doc, Category, Chat, Prompt, Tool, AnswerData, FileTypeConfig } from './types';

export const FILE_TYPES: Record<string, FileTypeConfig> = {
  pdf:  { label: 'PDF',  color: '#d6322b', bg: '#fbe9e8' },
  docx: { label: 'DOCX', color: '#2b5fb0', bg: '#e8eefa' },
  xlsx: { label: 'XLSX', color: '#1f8a5b', bg: '#e7f4ec' },
  md:   { label: 'MD',   color: '#5b5b58', bg: '#eeece6' },
  txt:  { label: 'TXT',  color: '#8b8b83', bg: '#efeee9' },
};

export const DOCUMENTS: Doc[] = [
  { id: 'd1', name: 'Employee Handbook',       type: 'pdf',  cat: 'HR Policies',   owner: 'Dana Whitfield', ownerInit: 'DW', updated: 'May 28, 2026', size: '4.2 MB', pages: 86, status: 'indexed',    chunks: 142, access: 'All employees' },
  { id: 'd2', name: 'Compliance Policy',       type: 'docx', cat: 'Compliance',    owner: 'Marcus Reed',    ownerInit: 'MR', updated: 'May 21, 2026', size: '1.1 MB', pages: 24, status: 'indexed',    chunks: 58,  access: 'All employees' },
  { id: 'd3', name: 'IT Security Guidelines',  type: 'pdf',  cat: 'IT & Security', owner: 'Priya Nair',     ownerInit: 'PN', updated: 'Jun 02, 2026', size: '2.8 MB', pages: 41, status: 'indexed',    chunks: 96,  access: 'All employees' },
  { id: 'd4', name: 'Customer Support SOP',    type: 'pdf',  cat: 'Operations',    owner: 'Lena Fischer',   ownerInit: 'LF', updated: 'Apr 30, 2026', size: '3.0 MB', pages: 33, status: 'review',     chunks: 0,   access: 'Support team' },
  { id: 'd5', name: 'Finance Procedures',      type: 'xlsx', cat: 'Finance',       owner: 'Tomás Oliveira', ownerInit: 'TO', updated: 'May 16, 2026', size: '640 KB', pages: 12, status: 'indexed',    chunks: 31,  access: 'Finance, Managers' },
  { id: 'd6', name: 'HR Leave Policy',         type: 'pdf',  cat: 'HR Policies',   owner: 'Dana Whitfield', ownerInit: 'DW', updated: 'May 09, 2026', size: '820 KB', pages: 9,  status: 'indexed',    chunks: 27,  access: 'All employees' },
  { id: 'd7', name: 'Onboarding Guide 2026',   type: 'docx', cat: 'HR Policies',   owner: 'Dana Whitfield', ownerInit: 'DW', updated: 'Jun 03, 2026', size: '1.6 MB', pages: 28, status: 'processing', chunks: 0,   access: 'All employees' },
  { id: 'd8', name: 'Data Retention Standard', type: 'md',   cat: 'Compliance',    owner: 'Marcus Reed',    ownerInit: 'MR', updated: 'Mar 18, 2026', size: '62 KB',  pages: 6,  status: 'indexed',    chunks: 14,  access: 'Legal, IT' },
];

export const CATEGORIES: Category[] = [
  { name: 'HR Policies',   count: 38 },
  { name: 'Compliance',    count: 21 },
  { name: 'IT & Security', count: 19 },
  { name: 'Operations',    count: 17 },
  { name: 'Finance',       count: 14 },
  { name: 'Product',       count: 9  },
  { name: 'Legal',         count: 4  },
  { name: 'Onboarding',    count: 2  },
];

export const CHATS: Chat[] = [
  { id: 'c1', title: 'Leave policy questions',       when: 'Today' },
  { id: 'c2', title: 'IT security requirements',     when: 'Today' },
  { id: 'c3', title: 'Compliance procedure summary', when: 'Yesterday' },
  { id: 'c4', title: 'Finance approval workflow',    when: 'Jun 3' },
  { id: 'c5', title: 'Onboarding process changes',   when: 'May 30' },
];

export const PROMPTS: Prompt[] = [
  { q: 'Summarize the employee leave policy',                key: 'leave' },
  { q: 'What is the approval process for finance requests?', key: 'finance' },
  { q: 'What are the IT password requirements?',             key: 'password' },
  { q: 'Which document mentions customer complaint handling?', key: 'complaint' },
];

export const TOOLBASE: Tool[] = [
  { id: 'search', label: 'Searching document index',   detail: 'semantic + keyword', icon: 'search',   ms: 850 },
  { id: 'meta',   label: 'Fetching document metadata', detail: '8 candidates',       icon: 'database', ms: 700 },
  { id: 'rank',   label: 'Ranking relevant chunks',    detail: 'top 5 of 142',       icon: 'layers',   ms: 900 },
  { id: 'gen',    label: 'Generating grounded answer', detail: 'with citations',     icon: 'spark',    ms: 1100 },
];

export const ANSWERS: Record<string, AnswerData> = {
  leave: {
    confidence: 96,
    answer: [
      'Employees accrue **20 days of paid annual leave** per calendar year, accrued monthly. Requests must be submitted through the HR portal **at least 7 days before** the intended start date.',
      '**Manager approval is required first**, followed by final confirmation from HR. Unused leave of up to **5 days** may be carried into the next year; anything beyond that expires on March 31.',
    ],
    cites: [
      { id: 1, doc: 'HR Leave Policy',    type: 'pdf', ref: 'Page 3',       conf: 96, snippet: 'Annual leave requests must be submitted via the HR portal no fewer than seven (7) calendar days prior to the requested start date.' },
      { id: 2, doc: 'Employee Handbook',  type: 'pdf', ref: 'Section 4.2',  conf: 91, snippet: 'Manager approval is required before HR issues final confirmation of any leave request.' },
    ],
    related: ['Employee Handbook', 'Onboarding Guide 2026'],
    followups: ['How is carry-over leave calculated?', 'What about sick leave and parental leave?', 'Who approves leave when my manager is away?'],
    searched: ['HR Leave Policy', 'Employee Handbook', 'Compliance Policy', 'Onboarding Guide 2026'],
  },
  finance: {
    confidence: 89,
    answer: [
      'Finance requests follow a **tiered approval** model. Expenses **under €1,000** require only line-manager approval. Requests **€1,000–€10,000** also need Finance Business Partner sign-off, and anything **above €10,000** escalates to the CFO.',
      'All requests are raised in the procurement system with a cost-center code and supporting documentation attached before routing.',
    ],
    cites: [
      { id: 1, doc: 'Finance Procedures', type: 'xlsx', ref: 'Tab: Approval Matrix', conf: 92, snippet: 'Tier 2 (€1,000–€10,000): Line Manager + Finance Business Partner. Tier 3 (>€10,000): + CFO.' },
      { id: 2, doc: 'Compliance Policy',  type: 'docx', ref: 'Section 7.1',          conf: 84, snippet: 'Supporting documentation must accompany every procurement request prior to approval routing.' },
    ],
    related: ['Compliance Policy', 'Employee Handbook'],
    followups: ['What counts as supporting documentation?', 'How long does CFO approval usually take?', 'Can approvals be delegated?'],
    searched: ['Finance Procedures', 'Compliance Policy', 'Employee Handbook'],
  },
  password: {
    confidence: 94,
    answer: [
      'Passwords must be **at least 14 characters** and include upper- and lower-case letters, a number, and a symbol. They **expire every 90 days** and cannot reuse any of the last 8 passwords.',
      '**Multi-factor authentication (MFA) is mandatory** for all systems handling customer or financial data. Accounts lock after 5 failed attempts.',
    ],
    cites: [
      { id: 1, doc: 'IT Security Guidelines', type: 'pdf', ref: 'Page 12', conf: 95, snippet: 'Minimum password length is fourteen (14) characters with complexity across four character classes; rotation every 90 days.' },
      { id: 2, doc: 'IT Security Guidelines', type: 'pdf', ref: 'Page 14', conf: 90, snippet: 'MFA is required for all systems processing customer or financial data without exception.' },
    ],
    related: ['Data Retention Standard', 'Compliance Policy'],
    followups: ['How do I set up MFA?', 'What is the password manager policy?', 'Who do I contact if I\'m locked out?'],
    searched: ['IT Security Guidelines', 'Data Retention Standard', 'Compliance Policy'],
  },
  complaint: {
    confidence: 0,
    noAnswer: true,
    answer: [
      'I couldn\'t find enough information in the available documents to answer this confidently. The **Customer Support SOP** is the most likely source, but it is currently marked **Needs Review** and has not been indexed yet.',
    ],
    cites: [],
    related: ['Customer Support SOP'],
    followups: ['Re-index the Customer Support SOP', 'Search the Employee Handbook instead', 'Notify the document owner'],
    searched: ['Employee Handbook', 'Compliance Policy', 'Operations'],
    missingDoc: { name: 'Customer Support SOP', type: 'pdf', status: 'review', owner: 'Lena Fischer' },
  },
};

const FALLBACK: AnswerData = {
  confidence: 0,
  noAnswer: true,
  answer: [
    'I couldn\'t find enough information in the available documents. Try rephrasing your question, or upload a relevant document to the knowledge base.',
  ],
  cites: [],
  related: [],
  followups: ['Summarize the employee leave policy', 'What are the IT password requirements?'],
  searched: ['Employee Handbook', 'Compliance Policy', 'IT Security Guidelines'],
};

export function matchAnswer(text: string): AnswerData {
  const t = text.toLowerCase();
  if (/leave|vacation|holiday|time off|pto/.test(t)) return { ...ANSWERS.leave };
  if (/financ|approv|expense|procure|budget|cost/.test(t)) return { ...ANSWERS.finance };
  if (/password|mfa|security|login|credential/.test(t)) return { ...ANSWERS.password };
  if (/complaint|support|customer/.test(t)) return { ...ANSWERS.complaint };
  return { ...FALLBACK };
}
