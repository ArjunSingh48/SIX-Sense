import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { continuityRisks } from "@/lib/mock-data";

const sevColor: Record<string, string> = {
  high: "text-destructive bg-destructive/10 border-destructive/30",
  medium: "text-warning bg-warning/10 border-warning/30",
  low: "text-success bg-success/10 border-success/30",
};

const signalLabel: Record<string, string> = {
  leaving: "Employee leaving",
  spof: "Single point of failure",
  concentration: "Knowledge concentration",
  missing_docs: "Missing documentation",
};

import { requireRoute } from "@/lib/route-guard";

export const Route = createFileRoute("/_authenticated/risk")({
  beforeLoad: () => requireRoute("/risk"),
  component: () => (
    <div>
      <PageHeader eyebrow="Knowledge Continuity Risk" title="Where knowledge is at risk" description="SIX Sense identifies leaving employees, single-points-of-failure, concentration and missing documentation — and recommends mitigation." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "High-risk signals", value: "2", tone: "text-destructive" },
          { label: "SPOF SMEs", value: "3", tone: "text-warning" },
          { label: "Departures (90d)", value: "1", tone: "text-warning" },
          { label: "Missing capture items", value: "8", tone: "text-muted-foreground" },
        ].map((k) => (
          <Card key={k.label} className="shadow-card"><CardContent className="pt-5"><p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{k.label}</p><p className={`text-2xl font-semibold mt-2 tabular-nums ${k.tone}`}>{k.value}</p></CardContent></Card>
        ))}
      </div>

      <Card className="shadow-card mb-6 bg-gradient-subtle">
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Sparkles className="size-4 text-primary" />AI recommendations</CardTitle></CardHeader>
        <CardContent className="text-sm leading-relaxed">
          Prioritise the Markus Fehr handover (last day 15 July) — 19 owned cards including the regulated crypto custody design. Assign Anja Müller a deputy by end of Q3 to retire the most acute SPOF in Post-Trade. Schedule capture sessions with Treasury head to close 3 missing funding policies referenced by 14 validated cards.
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="size-4 text-warning" />Continuity risk register</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {continuityRisks.map((r, i) => (
            <div key={i} className="border rounded-md p-4 flex gap-4">
              <div className="shrink-0">
                <span className={`inline-block text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded border ${sevColor[r.severity]}`}>{r.severity}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <p className="font-medium">{r.employee}</p>
                  <Badge variant="outline" className="font-normal text-[10px]">{r.department}</Badge>
                  <Badge variant="secondary" className="font-normal text-[10px]">{signalLabel[r.signal]}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{r.detail}</p>
                <p className="text-sm mt-2"><span className="text-[11px] uppercase tracking-wider text-primary font-medium mr-2">Recommendation</span>{r.recommendation}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  ),
});
