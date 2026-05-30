import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/settings")({
  component: () => (
    <div>
      <PageHeader eyebrow="Settings" title="Workspace & governance" description="Role assignments, integrations and platform configuration." />
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base">Your role</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span>Elena Vogel</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Role</span><Badge variant="secondary" className="font-normal">Compliance Officer</Badge></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Department</span><span>Compliance</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Access</span><span>Public · Department · Restricted</span></div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base">AI & OCR providers</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between items-center"><span>Claude Sonnet</span><Badge variant="outline" className="font-normal text-success border-success/30">Connected</Badge></div>
            <div className="flex justify-between items-center"><span>Mistral OCR</span><Badge variant="outline" className="font-normal text-success border-success/30">Connected</Badge></div>
            <div className="flex justify-between items-center"><span>Supabase pgvector</span><Badge variant="outline" className="font-normal text-success border-success/30">Active</Badge></div>
            <div className="flex justify-between items-center"><span>Supabase Storage</span><Badge variant="outline" className="font-normal text-success border-success/30">Active</Badge></div>
          </CardContent>
        </Card>
      </div>
    </div>
  ),
});
