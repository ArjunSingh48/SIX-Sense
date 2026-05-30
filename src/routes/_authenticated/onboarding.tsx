import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, FileText, GitCommit, Workflow, Users, HelpCircle, Download } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { departments } from "@/lib/mock-data";

import { requireRoute } from "@/lib/route-guard";

export const Route = createFileRoute("/_authenticated/onboarding")({
  beforeLoad: () => requireRoute("/onboarding"),
  component: OnboardingPage,
});

const sections = [
  { id: "docs", title: "Key documents", icon: FileText, items: ["T+1 Migration Memo v3", "CSDR Penalty Framework", "Nostro Funding Buffer Policy", "Onboarding Redesign 2024"] },
  { id: "decisions", title: "Key decisions", icon: GitCommit, items: ["14:00 CET cut-off for Swiss flow", "25bps nostro funding buffer", "Parallel KYC + connectivity onboarding", "3-of-5 multi-sig for crypto custody"] },
  { id: "processes", title: "Key processes", icon: Workflow, items: ["Daily reconciliation cycle", "Quarterly FINMA review", "Tier-1 client escalation path", "Knowledge validation workflow"] },
  { id: "smes", title: "Key SMEs", icon: Users, items: ["Anja Müller — Head of Post-Trade", "Lukas Brunner — Senior Compliance Counsel", "Sofia Reinhardt — Head of Client Onboarding", "Markus Fehr — Head of Digital Assets"] },
  { id: "faq", title: "Frequently asked questions", icon: HelpCircle, items: [
    "What is our T+1 cut-off and why?",
    "How do we apply CSDR penalties to dual-listed names?",
    "Who approves Tier-1 onboarding exceptions?",
    "What is the cold-storage recovery procedure?",
  ] },
];

function OnboardingPage() {
  const [role, setRole] = useState("Compliance Analyst");
  const [dept, setDept] = useState("Compliance");
  return (
    <div>
      <PageHeader eyebrow="Onboarding Center" title="Auto-generated onboarding packs" description="Every new joiner receives a curated pack of the documents, decisions, processes and SMEs they need." />

      <Card className="shadow-card mb-6">
        <CardContent className="p-4 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <p className="text-xs text-muted-foreground mb-1.5">Target role</p>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["Compliance Analyst", "Post-Trade Operations", "Treasury Associate", "Client Onboarding Specialist"].map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <p className="text-xs text-muted-foreground mb-1.5">Department</p>
            <Select value={dept} onValueChange={setDept}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Button><Download className="size-3.5 mr-1" />Export pack</Button>
        </CardContent>
      </Card>

      <Card className="shadow-card bg-gradient-subtle mb-6">
        <CardContent className="pt-5 flex gap-3">
          <Sparkles className="size-4 text-primary mt-1 shrink-0" />
          <p className="text-sm leading-relaxed">
            This pack onboards a <strong>{role}</strong> joining <strong>{dept}</strong>. SIX Sense estimates the curated content saves approximately <strong>11 days</strong> versus a manual onboarding workflow and ensures alignment with current validated interpretations.
          </p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {sections.map((s) => (
          <Card key={s.id} className="shadow-card">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><s.icon className="size-4 text-primary" />{s.title}</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2">{s.items.map((i) => <li key={i} className="text-sm flex gap-2"><span className="text-primary mt-1">•</span>{i}</li>)}</ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
