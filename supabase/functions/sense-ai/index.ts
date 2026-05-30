// SIX Sense AI backend: RAG, OCR, summaries, handover/onboarding, performance reports.
// Uses Lovable AI Gateway (LOVABLE_API_KEY is auto-provisioned).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GATEWAY = "https://ai.gateway.lovable.dev/v1";
const CHAT_MODEL = "google/gemini-3-flash-preview";
const VISION_MODEL = "google/gemini-2.5-flash";
const EMBED_MODEL = "openai/text-embedding-3-small"; // 1536 dims

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const admin = createClient(SUPABASE_URL, SERVICE_KEY);

/* ---------- helpers ---------- */
async function chat(messages: any[], opts: { json?: boolean; model?: string } = {}) {
  const body: any = {
    model: opts.model ?? CHAT_MODEL,
    messages,
  };
  if (opts.json) body.response_format = { type: "json_object" };
  const r = await fetch(`${GATEWAY}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (r.status === 429) throw new Error("RATE_LIMIT");
  if (r.status === 402) throw new Error("PAYMENT_REQUIRED");
  if (!r.ok) throw new Error(`AI ${r.status}: ${await r.text()}`);
  const j = await r.json();
  return j.choices?.[0]?.message?.content ?? "";
}

async function embed(input: string): Promise<number[]> {
  const r = await fetch(`${GATEWAY}/embeddings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: EMBED_MODEL, input }),
  });
  if (!r.ok) throw new Error(`Embed ${r.status}: ${await r.text()}`);
  const j = await r.json();
  return j.data[0].embedding;
}

/* ---------- actions ---------- */

// 1) ASK: RAG over documents
async function ask(question: string, threadId?: string) {
  // a) embed the question
  const qVec = await embed(question);
  // b) vector search
  const { data: matches } = await admin.rpc("match_documents", {
    query_embedding: qVec as any,
    match_count: 5,
  });
  const hits = (matches ?? []).filter((m: any) => m.similarity > 0.35);
  const context = hits
    .map((m: any, i: number) => `[Source ${i + 1}: ${m.original_name}]\n${(m.content ?? "").slice(0, 2000)}`)
    .join("\n\n---\n\n");

  // c) prior thread context (last 8 turns)
  let history: any[] = [];
  if (threadId) {
    const { data } = await admin
      .from("chat_messages")
      .select("author_name,body")
      .eq("thread_id", threadId)
      .eq("kind", "twin")
      .order("created_at", { ascending: true })
      .limit(16);
    history = (data ?? []).map((m) => ({
      role: m.author_name === "SIX Sense" ? "assistant" : "user",
      content: m.body,
    }));
  }

  const system = `You are SIX Sense, a governed knowledge assistant for SIX Group employees.
Rules:
- Answer ONLY from the provided sources. If the sources do not contain the answer, say so and recommend escalation to a Subject Matter Expert (SME).
- Always cite sources by their bracketed number.
- Be concise (max 6 sentences). Show reasoning briefly.
- Return strict JSON: { "answer": string, "reasoning": string, "confidence": number (0..1), "sources": string[] (file names), "needs_escalation": boolean, "next_step": string }.`;

  const userMsg = context
    ? `Question: ${question}\n\nSources:\n${context}`
    : `Question: ${question}\n\nNo relevant sources in the knowledge base.`;

  const raw = await chat(
    [
      { role: "system", content: system },
      ...history,
      { role: "user", content: userMsg },
    ],
    { json: true },
  );

  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = { answer: raw, reasoning: "", confidence: 0.5, sources: [], needs_escalation: true, next_step: "Validate with SME." };
  }
  if (!hits.length) {
    parsed.confidence = Math.min(parsed.confidence ?? 0.4, 0.55);
    parsed.needs_escalation = true;
  }
  return parsed;
}

// 2) OCR + ingest: takes base64 file, extracts text via Gemini vision, stores + embeds
async function ingest(name: string, mime: string, base64: string, department = "General") {
  // Use Gemini vision for OCR / extraction
  const dataUrl = `data:${mime};base64,${base64}`;
  const isImage = mime.startsWith("image/") || mime === "application/pdf";
  let content = "";
  if (isImage) {
    content = await chat(
      [
        {
          role: "system",
          content:
            "You are an OCR + extraction engine. Output the full document text as markdown. Preserve headings, lists, and tables. No commentary.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: `Extract every word from this file (${name}).` },
            { type: "image_url", image_url: { url: dataUrl } },
          ] as any,
        },
      ],
      { model: VISION_MODEL },
    );
  } else {
    // Plain text fallback
    try {
      content = atob(base64);
    } catch {
      content = "";
    }
  }

  // Summarise
  const summary = await chat([
    { role: "system", content: "Summarise the document in 2-3 sentences for a knowledge base index. Plain text only." },
    { role: "user", content: content.slice(0, 8000) || name },
  ]);

  // Embed (truncate input to keep cost bounded)
  const vec = await embed((summary + "\n\n" + content).slice(0, 6000));

  // Insert
  const { data, error } = await admin
    .from("documents")
    .insert({
      original_name: name,
      mime,
      department,
      status: "ready",
      access_level: "department",
      content,
      summary,
      embedding: vec as any,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return { id: data.id, name, summary, chars: content.length };
}

// 3) Document generators (handover / onboarding / performance / dashboard)
async function generateReport(kind: string, params: any) {
  // Pull knowledge: recent docs + tasks
  const [{ data: docs }, { data: tasks }] = await Promise.all([
    admin.from("documents").select("original_name,summary,department").order("created_at", { ascending: false }).limit(20),
    admin.from("project_tasks").select("external_key,title,status,progress,assignee_name,project,priority,due_at").order("updated_at", { ascending: false }).limit(50),
  ]);

  const ctx = {
    documents: docs ?? [],
    tasks: tasks ?? [],
    params,
  };

  const prompts: Record<string, string> = {
    handover: `Generate a holiday/leave HANDOVER document for ${params.employee ?? "the employee"}.
Include sections: Overview, Active projects, Open Jira tickets with status & progress, Pending decisions, Risks, Key contacts/SMEs, Next steps for the cover person.`,
    onboarding: `Generate an ONBOARDING document for a new joiner in ${params.role ?? "the team"} (${params.department ?? "SIX"}).
Include: Team mission, Key systems, Must-read documents (from sources), Current projects & open tickets, Glossary, First-week checklist, Key people/SMEs.`,
    return_recap: `Generate a RETURN-FROM-LEAVE RECAP for ${params.employee ?? "the employee"} covering changes since ${params.since ?? "their last working day"}.
Include: What changed in active projects, Decisions made, New documents, Tickets that moved, Action items waiting on them.`,
    performance: `Generate a PERFORMANCE METRICS document for ${params.employee ?? "the employee"} for ${params.period ?? "this quarter"}.
Include: Delivery metrics (tasks closed, on-time %, avg progress), Knowledge contributions (docs ingested, questions answered), Project highlights, Risks, Suggested next-quarter goals.`,
    dashboard: `Generate a STAKEHOLDER DASHBOARD summary for managers and C-level.
Include: Department health, Project portfolio status with %, Knowledge gaps detected, SME dependence risks, Top recommendations.`,
  };

  const system = `You are SIX Sense, a governed enterprise knowledge assistant. Produce a structured executive-quality document. Return strict JSON:
{
  "title": string,
  "summary": string (2-3 sentences),
  "sections": [{ "heading": string, "body": string (markdown), "bullets"?: string[] }],
  "metrics": [{ "label": string, "value": string, "trend"?: "up"|"down"|"flat" }],
  "recipients_suggestion": string[]
}`;

  const raw = await chat(
    [
      { role: "system", content: system },
      { role: "user", content: `${prompts[kind] ?? prompts.handover}\n\nContext JSON:\n${JSON.stringify(ctx).slice(0, 8000)}` },
    ],
    { json: true },
  );

  let doc: any;
  try { doc = JSON.parse(raw); } catch { doc = { title: kind, summary: raw, sections: [], metrics: [] }; }

  const { data: saved, error } = await admin
    .from("performance_reports")
    .insert({
      kind,
      title: doc.title ?? `${kind} report`,
      summary: doc.summary ?? "",
      content: doc,
      recipients: doc.recipients_suggestion ?? [],
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return saved;
}

/* ---------- entry ---------- */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { action, ...rest } = await req.json();
    let result: any;
    if (action === "ask") result = await ask(rest.question, rest.thread_id);
    else if (action === "ingest") result = await ingest(rest.name, rest.mime, rest.base64, rest.department);
    else if (action === "report") result = await generateReport(rest.kind, rest.params ?? {});
    else throw new Error(`Unknown action: ${action}`);

    return new Response(JSON.stringify({ ok: true, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    const msg = e?.message ?? "error";
    const status = msg === "RATE_LIMIT" ? 429 : msg === "PAYMENT_REQUIRED" ? 402 : 500;
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
