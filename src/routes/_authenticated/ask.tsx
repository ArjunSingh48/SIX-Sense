import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Send, Sparkles, FileText, ArrowUpRight, AlertCircle, UserCheck } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ConfidenceRing } from "@/components/confidence-ring";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { knowledgeCards, employees } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/ask")({
  component: AskPage,
});

interface Answer {
  question: string;
  confidence: number;
  answer: string;
  reasoning: string;
  missing: string;
  sources: { id: string; name: string; snippet: string }[];
  supporting: string[];
  related: string[];
  escalation?: { name: string; role: string; department: string };
}

const examples = [
  { q: "What is our T+1 cut-off rationale for Swiss settlement flow?", confidence: 0.94 },
  { q: "Does the 2024 CSDR interpretation apply to triple-listed ADRs?", confidence: 0.72 },
  { q: "What is our cold-storage recovery SLA for crypto custody?", confidence: 0.54 },
];

function buildAnswer(q: string): Answer {
  const found = examples.find((e) => e.q === q);
  const confidence = found?.confidence ?? 0.88;
  if (confidence < 0.6) {
    return {
      question: q,
      confidence,
      answer: "Insufficient evidence. Connecting you with the appropriate SME.",
      reasoning: "Only one fragmentary source was found in the knowledge repository and it predates the current custody offering. Below the 60% confidence threshold — answer withheld per governance policy.",
      missing: "Documented recovery SLA, cold-storage key ceremony cadence, regulatory acknowledgement letter.",
      sources: [],
      supporting: [],
      related: ["Digital Custody Design memo (kc-005)"],
      escalation: { name: "Markus Fehr", role: "Head of Digital Assets", department: "Digital Assets" },
    };
  }
  if (confidence < 0.75) {
    return {
      question: q,
      confidence,
      answer: "Likely yes, but interpretation has not been formally extended to triple-listed instruments.",
      reasoning: "Counsel opinion 2024-09 established that the issuing CSD governs penalty regime for dual-listed names. Triple-listed instruments add a third venue that introduces residual ambiguity. Confidence below 75% — recommending escalation to Senior Compliance Counsel for formal extension.",
      missing: "Explicit interpretation for triple-listed ADRs, FINMA acknowledgement.",
      sources: [
        { id: "kc-002", name: "CSDR Penalty Framework — Internal Interpretation", snippet: "Issuing-CSD precedence rule under Art. 7(2)." },
      ],
      supporting: ["Counsel_Opinion_CSDR_2024-09.pdf"],
      related: ["T+1 Settlement Migration — Risk Framework"],
      escalation: { name: "Lukas Brunner", role: "Senior Compliance Counsel", department: "Compliance" },
    };
  }
  return {
    question: q,
    confidence,
    answer:
      "The 14:00 CET cut-off was selected to align with US pre-market flows while preserving operational buffer for custody clients. Three alternatives (12:00 / 14:00 / 16:00) were evaluated against funding cost, FX exposure and reconciliation throughput. 14:00 minimised total cost of carry while keeping settlement fails under the 1.3% target band.",
    reasoning:
      "Sourced from the T+1 Migration Memo v3, owned by Anja Müller and validated 2026-04-12. Decision was endorsed by the Post-Trade steering committee and acknowledged by FINMA in the Q1 2026 consultation response.",
    missing: "",
    sources: [
      { id: "kc-001", name: "T+1 Settlement Migration — Risk Framework", snippet: "Cut-off analysis section 4.2 — 14:00 CET selected over 12:00 / 16:00 alternatives." },
      { id: "kc-004", name: "Nostro Funding Buffer Policy", snippet: "25bps baseline calibrated using 24 months of settlement data." },
    ],
    supporting: ["T1_Migration_Memo_v3.pdf", "FINMA_Consultation_Response_2025.pdf"],
    related: ["CSDR Penalty Framework — Internal Interpretation"],
  };
}

function AskPage() {
  const [history, setHistory] = useState<Answer[]>([]);
  const [input, setInput] = useState("");

  const submit = (q: string) => {
    const a = buildAnswer(q);
    setHistory((h) => [a, ...h]);
    setInput("");
  };

  return (
    <div>
      <PageHeader
        eyebrow="Ask SIX Sense"
        title="Trusted answers, grounded in your knowledge base"
        description="The assistant answers using validated knowledge cards. When confidence is below 75% it recommends escalation; below 60% it withholds the answer and connects you with an SME."
      />

      <Card className="shadow-card mb-6">
        <CardContent className="p-3">
          <form
            onSubmit={(e) => { e.preventDefault(); if (input.trim()) submit(input.trim()); }}
            className="flex items-center gap-2"
          >
            <div className="size-8 rounded-md bg-primary/10 grid place-items-center"><Sparkles className="size-4 text-primary" /></div>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a decision, policy, risk interpretation, or process…"
              className="border-0 focus-visible:ring-0 shadow-none text-sm"
            />
            <Button type="submit" size="sm" disabled={!input.trim()}>
              <Send className="size-3.5 mr-1" /> Ask
            </Button>
          </form>
        </CardContent>
      </Card>

      {history.length === 0 && (
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">Try a question</p>
          <div className="grid md:grid-cols-3 gap-3">
            {examples.map((e) => (
              <button key={e.q} onClick={() => submit(e.q)} className="text-left p-4 rounded-lg border bg-card hover:border-primary/40 hover:shadow-card transition-all">
                <p className="text-sm font-medium leading-snug">{e.q}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Expected confidence {Math.round(e.confidence * 100)}%
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-6 mt-2">
        {history.map((a, i) => <AnswerBlock key={i} a={a} />)}
      </div>
    </div>
  );
}

function AnswerBlock({ a }: { a: Answer }) {
  const lowConfidence = a.confidence < 0.6;
  return (
    <Card className="shadow-card">
      <CardHeader className="border-b">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Question</p>
            <CardTitle className="text-base font-medium leading-snug">{a.question}</CardTitle>
          </div>
          <ConfidenceRing value={a.confidence} />
        </div>
      </CardHeader>
      <CardContent className="pt-5 space-y-5">
        {lowConfidence ? (
          <div className="rounded-md border border-warning/40 bg-warning/5 p-4 flex gap-3">
            <AlertCircle className="size-4 text-warning mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium">{a.answer}</p>
              <p className="text-xs text-muted-foreground mt-1">Confidence {Math.round(a.confidence * 100)}% — below the 60% governance threshold. SIX Sense will not answer.</p>
            </div>
          </div>
        ) : (
          <p className="text-sm leading-relaxed">{a.answer}</p>
        )}

        <Collapsible>
          <CollapsibleTrigger className="text-xs uppercase tracking-wider text-primary font-medium hover:underline">
            Show reasoning
          </CollapsibleTrigger>
          <CollapsibleContent className="text-sm text-muted-foreground mt-2 leading-relaxed">{a.reasoning}</CollapsibleContent>
        </Collapsible>

        {a.sources.length > 0 && (
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Sources</p>
            <div className="space-y-2">
              {a.sources.map((s) => (
                <Link key={s.id} to="/knowledge/$id" params={{ id: s.id }} className="flex items-start gap-3 p-3 rounded-md border hover:border-primary/30 hover:bg-accent/30 transition-colors">
                  <FileText className="size-4 text-primary mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground italic mt-1">"{s.snippet}"</p>
                  </div>
                  <ArrowUpRight className="size-3.5 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {a.supporting.length > 0 && (
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Supporting documents</p>
            <div className="flex flex-wrap gap-1.5">{a.supporting.map((s) => <Badge key={s} variant="outline" className="font-normal">{s}</Badge>)}</div>
          </div>
        )}

        {a.related.length > 0 && (
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Related cases</p>
            <div className="flex flex-wrap gap-1.5">{a.related.map((s) => <Badge key={s} variant="secondary" className="font-normal">{s}</Badge>)}</div>
          </div>
        )}

        {a.missing && (
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Missing information</p>
            <p className="text-sm text-muted-foreground">{a.missing}</p>
          </div>
        )}

        {a.escalation && (
          <>
            <Separator />
            <div className="rounded-md bg-gradient-subtle border p-4">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-3 flex items-center gap-1.5">
                <UserCheck className="size-3 text-primary" /> Recommended escalation
              </p>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">{a.escalation.name}</p>
                  <p className="text-xs text-muted-foreground">{a.escalation.role} · {a.escalation.department}</p>
                </div>
                <Button size="sm">Generate escalation request</Button>
              </div>
            </div>
          </>
        )}

        {!a.escalation && a.confidence < 0.75 && (
          <div className="rounded-md border-l-2 border-warning/60 bg-warning/5 px-3 py-2 text-xs text-muted-foreground">
            Confidence below 75% — review recommended before relying on this answer.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// suppress unused import warning when employees is referenced for SME directory expansion
void employees;
void knowledgeCards;
