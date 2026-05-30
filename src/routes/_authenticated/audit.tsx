import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { auditEntries } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/audit")({
  component: () => (
    <div>
      <PageHeader eyebrow="Audit Center" title="Complete traceability" description="Knowledge history, access logs, approvals, validations and escalations across SIX Sense." />
      <Card className="shadow-card">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="text-left border-b bg-muted/40">
              <tr>
                <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider text-muted-foreground">Timestamp</th>
                <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider text-muted-foreground">Actor</th>
                <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider text-muted-foreground">Action</th>
                <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider text-muted-foreground">Entity</th>
                <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider text-muted-foreground">Diff</th>
              </tr>
            </thead>
            <tbody>
              {auditEntries.map((e) => (
                <tr key={e.id} className="border-b last:border-0 hover:bg-accent/30">
                  <td className="px-4 py-3 text-muted-foreground tabular-nums text-xs">{e.timestamp}</td>
                  <td className="px-4 py-3">{e.actor}</td>
                  <td className="px-4 py-3"><Badge variant="secondary" className="font-normal capitalize">{e.action}</Badge></td>
                  <td className="px-4 py-3 text-xs"><span className="text-muted-foreground">{e.entity} · </span><code className="text-primary">{e.entityId}</code></td>
                  <td className="px-4 py-3"><code className="text-xs text-muted-foreground">{JSON.stringify(e.diff)}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  ),
});
