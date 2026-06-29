# 📑 AETHON — API Contract (Provisional v0.1)

> **Status:** PROVISIONAL — authored by Frontend (P3) to unblock work. **P2 (Backend) must review & confirm.**
> Until confirmed, the frontend builds against `lib/mock.ts`, which returns these exact shapes.
>
> **Base URL:** `http://localhost:8000` (`NEXT_PUBLIC_API_URL`)
> **WebSocket:** `ws://localhost:8000` (`NEXT_PUBLIC_WS_URL`)
> **Content-Type:** `application/json` unless noted (uploads use `multipart/form-data`)
> **Auth:** `Authorization: Bearer <token>` once auth lands (Phase 3). Omit for now.

---

## ⚠️ CORS Requirement (item 0.4)

The backend **must** allow the frontend origin or every request is blocked:

```python
# P2 — FastAPI CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Endpoints

### 1. Health
`GET /health` → `200`
```json
{ "status": "ok", "model": "llama3.1:8b", "corpus_docs": 4182 }
```

### 2. Copilot (RAG) ⭐
`POST /copilot/query`
```json
// request
{ "query": "Does SOP-44 comply with confined-space entry law?" }
```
```json
// response 200
{
  "answer": "No. SOP-44 omits continuous atmospheric monitoring required by Factory Act §36(1)(b)...",
  "sources": [
    { "doc_name": "Factory_Act_1948.pdf", "page": 42, "snippet": "Continuous monitoring of the atmosphere..." },
    { "doc_name": "OISD-105.pdf", "page": 18, "snippet": "A standby person shall be posted..." }
  ],
  "confidence": 94
}
```

### 3. Documents
`GET /documents` → `200`
```json
{
  "documents": [
    { "id": "d1", "name": "Factory_Act_1948.pdf", "type": "regulation",
      "status": "indexed", "pages": 120, "ingested_at": "2026-06-29T10:00:00Z" }
  ]
}
```
> `status` ∈ `"queued" | "parsing" | "embedding" | "indexed" | "failed"`

### 4. Ingest (upload) ⭐
`POST /ingest` — `multipart/form-data`, field `file`
```json
// response 202 (accepted, processing in background)
{ "id": "d7", "name": "SOP-44.pdf", "status": "queued" }
```
Errors: `413` file too large · `415` unsupported type.

### 5. Ingestion progress (WebSocket) ⭐
`WS /ws/ingest` — server pushes per-document progress:
```json
{ "id": "d7", "stage": "parsing",   "progress": 20 }
{ "id": "d7", "stage": "embedding", "progress": 70 }
{ "id": "d7", "stage": "indexed",   "progress": 100 }
```

### 6. Knowledge Graph
`GET /graph` → `200`
```json
{
  "nodes": [
    { "id": "eq",   "label": "Pump P-204",     "type": "equipment" },
    { "id": "reg1", "label": "OISD-116 §7.2",  "type": "regulation" }
  ],
  "edges": [
    { "from": "eq", "to": "reg1", "relation": "governed_by" }
  ]
}
```
> `type` ∈ `"equipment" | "regulation" | "procedure" | "incident" | "document"`
> **Open decision (with P1):** does the API return `x`/`y` positions, or does the frontend compute layout? Default assumption: **frontend computes layout.**

### 7. Compliance
`GET /compliance/audit` → `200`
```json
{
  "overall_score": 92,
  "standards": [
    { "standard": "Factory Act", "score": 96, "gaps": [] },
    { "standard": "OISD-116",    "score": 91,
      "gaps": [ { "clause": "§7.2", "issue": "No continuous monitoring in SOP-44" } ] }
  ]
}
```

### 8. Conflicts
`GET /conflicts` → `200`
```json
{
  "conflicts": [
    { "doc_a": "OEM_Manual.pdf", "doc_b": "MP-12.docx",
      "field": "lubrication_interval", "value_a": "60 days", "value_b": "90 days" }
  ]
}
```

### 9. Dashboard Stats
`GET /dashboard/stats` → `200`
```json
{
  "docs_indexed": 4182,
  "relationships": 38914,
  "compliance_score": 92,
  "open_conflicts": 7,
  "feed": [
    { "text": "P&ID drawing · Unit 4 cooling loop", "tag": "ingested", "time": "2m" }
  ]
}
```

### 10. Scoreboard (P1 benchmark)
`GET /scoreboard` → `200`
```json
{
  "answer_accuracy": 91,
  "citation_precision": 94,
  "avg_answer_seconds": 2.4,
  "keyword_baseline_seconds": 480,
  "questions_evaluated": 20
}
```

---

## Error shape (all endpoints)
```json
{ "detail": "Human-readable error message" }
```
HTTP codes: `400` bad request · `401` unauthorized · `404` not found · `413/415` upload errors · `500` server error · `503` model/Ollama unavailable.

---

## Change protocol
If P2 changes any shape: **update this file + `lib/types.ts` in the same PR, and ping the team.** The contract is law.
