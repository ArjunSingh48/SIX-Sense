import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Upload, FileText, Image as ImageIcon, NotebookPen, Mic, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import { requireRoute } from "@/lib/route-guard";

export const Route = createFileRoute("/_authenticated/capture")({
  beforeLoad: () => requireRoute("/capture"),
  component: CapturePage,
});

const tabs = [
  { id: "pdf", label: "PDF document", icon: FileText, hint: "Reports, memos, policies" },
  { id: "image", label: "Image", icon: ImageIcon, hint: "Diagrams, whiteboard photos" },
  { id: "handwritten", label: "Handwritten note", icon: NotebookPen, hint: "Meeting notebooks, sketches" },
  { id: "transcript", label: "Meeting transcript", icon: Mic, hint: "Voice recordings, transcripts" },
];

interface Extraction {
  title: string;
  topics: string[];
  decisions: string[];
  risks: string[];
  reasoning: string;
  actions: string[];
  stakeholders: string[];
  businessContext: string;
}

function mockExtract(): Extraction {
  return {
    title: "T+1 Settlement Migration — Q2 Risk Review",
    topics: ["Settlement", "Post-Trade", "Risk", "Regulatory"],
    decisions: [
      "Adopt 14:00 CET cut-off for Swiss flow",
      "Pre-fund USD nostros by 25 basis points",
      "Open regional override window for APAC desks",
    ],
    risks: [
      "Asia-Pacific clients lose one settlement cycle if instructions arrive after 13:00 CET",
      "Reconciliation engine throughput degrades above 2.1M instructions/day",
    ],
    reasoning:
      "The 14:00 CET cut-off was chosen to align with US pre-market flows while preserving operational buffer for custody clients. Three alternatives evaluated against funding cost, FX exposure and reconciliation throughput — 14:00 minimised total cost of carry while keeping fails under the 1.3% target band.",
    actions: [
      "Deploy regional cut-off override before Q2",
      "Scale reconciliation cluster to 12 nodes",
      "Brief Tier-1 custody clients by 15 June",
    ],
    stakeholders: ["Post-Trade Operations", "Treasury", "FINMA Compliance", "Tier-1 Custody Clients"],
    businessContext:
      "Mandatory alignment with US SEC Rule 15c6-2 and forthcoming EU CSDR amendments. Failure to meet T+1 puts CHF 1.2B daily flow at risk.",
  };
}

function CapturePage() {
  const [progress, setProgress] = useState(0);
  const [extraction, setExtraction] = useState<Extraction | null>(null);
  const [running, setRunning] = useState(false);

  const start = () => {
    setRunning(true);
    setExtraction(null);
    setProgress(0);
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(id);
          setRunning(false);
          setExtraction(mockExtract());
          return 100;
        }
        return p + 8;
      });
    }, 120);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Knowledge Capture"
        title="Capture expert knowledge"
        description="Upload a document, photo, handwritten note or meeting transcript. SIX Sense extracts topics, decisions, reasoning, risks, actions, stakeholders and business context — then generates a Knowledge Card."
      />

      <Tabs defaultValue="pdf">
        <TabsList className="mb-6 bg-muted/60">
          {tabs.map((t) => (
            <TabsTrigger key={t.id} value={t.id} className="gap-2">
              <t.icon className="size-3.5" /> {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((t) => (
          <TabsContent key={t.id} value={t.id} className="mt-0">
            <Card className="shadow-card">
              <CardContent className="p-0">
                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-border rounded-lg m-1 px-10 py-16 text-center bg-gradient-subtle hover:border-primary/40 transition-colors">
                    <div className="size-12 mx-auto rounded-xl bg-primary/10 grid place-items-center mb-4">
                      <Upload className="size-5 text-primary" />
                    </div>
                    <p className="font-medium">Drop your {t.label.toLowerCase()} here</p>
                    <p className="text-sm text-muted-foreground mt-1">{t.hint} · OCR powered by Mistral · processed by Claude Sonnet</p>
                    <Button
                      type="button"
                      className="mt-5"
                      onClick={(e) => {
                        e.preventDefault();
                        start();
                        toast("Processing demo document…");
                      }}
                    >
                      Use demo document
                    </Button>
                  </div>
                </label>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {(running || extraction) && (
        <Card className="mt-6 shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-base flex items-center gap-2">
                {running ? <Loader2 className="size-4 animate-spin text-primary" /> : <CheckCircle2 className="size-4 text-success" />}
                {running ? "Extracting knowledge…" : "Extraction complete"}
              </CardTitle>
              {extraction && <Badge variant="secondary" className="font-normal">Confidence 0.94</Badge>}
            </div>
            <Progress value={progress} className="mt-3" />
          </CardHeader>
          {extraction && (
            <CardContent>
              <h3 className="text-lg font-semibold tracking-tight mb-4">{extraction.title}</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <Facet label="Topics" items={extraction.topics} />
                <Facet label="Decisions" items={extraction.decisions} />
                <Facet label="Risks" items={extraction.risks} />
                <Facet label="Actions" items={extraction.actions} />
                <Facet label="Stakeholders" items={extraction.stakeholders} />
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Business context</p>
                  <p className="text-sm leading-relaxed">{extraction.businessContext}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Reasoning</p>
                  <p className="text-sm leading-relaxed">{extraction.reasoning}</p>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <Button onClick={() => toast.success("Knowledge card created.")}>Create Knowledge Card</Button>
                <Button variant="outline">Edit before saving</Button>
                <Button variant="ghost">Discard</Button>
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}

function Facet({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-2">{label}</p>
      <ul className="space-y-1.5">
        {items.map((i) => (
          <li key={i} className="text-sm flex gap-2"><span className="text-primary mt-1">•</span><span>{i}</span></li>
        ))}
      </ul>
    </div>
  );
}
