# TODO

## Chat — Prompt Suggestions
**Location:** `frontend/src/components/Chatbot.tsx` → `Welcome` component (commented out)

- [ ] Populate suggestions dynamically from indexed documents rather than hardcoded `PROMPTS` in `data.ts`
- [ ] Add a `GET /documents/suggestions` endpoint that returns common question starters based on available document categories
- [ ] Wire suggestions to call `send()` directly

## Chat — Preview in Context (Citation Panel)
**Location:** `frontend/src/components/CitationPanel.tsx` (actions commented out), `frontend/src/components/ChatParts.tsx` (`CitePill` replaced by `SourcePill`)

- [ ] Store source snippets alongside AI responses so the citation panel can show highlighted passages
- [ ] Re-introduce `CitePill` with hover tooltip and click-to-preview behaviour
- [ ] `CitationPanel` slide-in sidebar (`CitationPanel.tsx`) is already built and styled — wire it back in `Chatbot.tsx` once snippets are available
- [ ] "Open document" button should trigger the PDF preview modal (already built in `KnowledgeBase.tsx` as `PdfPreviewModal`)
- [ ] "Copy link to passage" button needs a shareable deep-link format
