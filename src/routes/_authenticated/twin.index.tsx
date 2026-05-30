import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { employees } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/twin/")({
  component: () => (
    <div>
      <PageHeader eyebrow="Digital Twins" title="Employee knowledge twins" description="Auto-generated profiles of work completed, decisions made, and knowledge produced." />
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {employees.map((e) => (
          <Link key={e.id} to="/twin/$employeeId" params={{ employeeId: e.id }}>
            <Card className="shadow-card hover:shadow-elevated hover:border-primary/30 transition-all h-full">
              <CardContent className="pt-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="size-10 rounded-full bg-gradient-hero grid place-items-center text-primary-foreground text-sm font-semibold">
                    {e.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  {e.isSpof && <Badge variant="secondary" className="text-[10px] font-normal text-warning">SPOF</Badge>}
                </div>
                <p className="font-medium">{e.name}</p>
                <p className="text-xs text-muted-foreground">{e.role} · {e.department}</p>
                <div className="flex items-center justify-between text-xs mt-4 pt-3 border-t text-muted-foreground">
                  <span>{e.knowledgeCards} cards · {e.tenure}</span>
                  <span className={e.leavingRisk === "high" ? "text-destructive" : e.leavingRisk === "medium" ? "text-warning" : "text-success"}>
                    {e.leavingRisk} risk
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  ),
});
