import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Sparkles, Ticket, Users, FileText, GitCommit } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { employees, sampleActivity, type Employee, type ActivityEntry } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/twin/$employeeId")({
  loader: ({ params }) => {
    const e = employees.find((x) => x.id === params.employeeId);
    if (!e) throw notFound();
    return { employee: e, activity: sampleActivity[e.id] ?? sampleActivity["emp-001"] };
  },
  component: TwinDetail,
});

const kindIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  ticket: Ticket, meeting: Users, doc: FileText, decision: GitCommit,
};

function TwinDetail() {
  const { employee, activity } = Route.useLoaderData() as { employee: Employee; activity: ActivityEntry[] };
  return (
    <div>
      <Link to="/twin" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-4">
        <ArrowLeft className="size-3.5" /> Digital Twins
      </Link>
      <PageHeader eyebrow={`${employee.department} · ${employee.tenure} at SIX`} title={employee.name} description={employee.role} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Tickets closed", value: "84" },
          { label: "Meetings attended", value: "127" },
          { label: "Documents created", value: "23" },
          { label: "Decisions made", value: "19" },
        ].map((s) => (
          <Card key={s.label} className="shadow-card"><CardContent className="pt-5"><p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{s.label}</p><p className="text-2xl font-semibold mt-2 tabular-nums">{s.value}</p></CardContent></Card>
        ))}
      </div>

      <Tabs defaultValue="weekly">
        <TabsList className="bg-muted/60 mb-6">
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
        </TabsList>
        {(["weekly", "monthly", "quarterly"] as const).map((p) => (
          <TabsContent key={p} value={p}>
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 shadow-card">
                <CardHeader><CardTitle className="text-base">Activity timeline</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {activity.map((a) => {
                    const Icon = kindIcon[a.kind];
                    return (
                      <div key={a.id} className="flex gap-3">
                        <div className="size-8 rounded-md bg-accent grid place-items-center shrink-0"><Icon className="size-4 text-primary" /></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2"><p className="text-sm font-medium">{a.title}</p><Badge variant="outline" className="font-normal text-[10px] capitalize">{a.kind}</Badge></div>
                          <p className="text-xs text-muted-foreground mt-0.5">{a.date} · {a.detail}</p>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
              <Card className="shadow-card bg-gradient-subtle">
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Sparkles className="size-4 text-primary" />AI {p} summary</CardTitle></CardHeader>
                <CardContent className="text-sm leading-relaxed">
                  {employee.name} led the T+1 cut-off decision this {p}, captured the Nostro Funding Buffer Policy, and resolved the reconciliation throughput incident affecting Tier-1 custody clients. Continuity risk assessment: {employee.isSpof ? "single point of failure on Post-Trade operations — recommend deputy assignment." : "well-distributed coverage."}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
