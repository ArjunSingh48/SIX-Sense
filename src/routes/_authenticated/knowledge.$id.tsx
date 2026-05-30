import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, FileText, ShieldCheck, Clock, Users } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ConfidenceRing } from "@/components/confidence-ring";
import { knowledgeCards, type KnowledgeCard } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/knowledge/$id")({
  loader: ({ params }) => {
    const card = knowledgeCards.find((c) => c.id === params.id);
    if (!card) throw notFound();
    return { card };
  },
  component: KnowledgeCardPage,
  notFoundComponent: () => (
    <div className="py-20 text-center">
      <h2 className="text-lg font-semibold">Knowledge card not found</h2>
      <Link to="/knowledge" className="text-primary text-sm mt-2 inline-block">Back to library</Link>
    </div>
  ),
});

function KnowledgeCardPage() {
  const { card } = Route.useLoaderData() as { card: KnowledgeCard };
  return (
    <div>
      <Link to="/knowledge" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-4">
        <ArrowLeft className="size-3.5" /> Knowledge Library
      </Link>

      <PageHeader
        eyebrow={`${card.department} · ${card.owner}, ${card.ownerRole}`}
        title={card.title}
        description={card.summary}
        actions={
          <>
            <Button variant="outline" size="sm">Request update</Button>
            <Button size="sm">Validate</Button>
          </>
        }
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-card">
            <CardHeader><CardTitle className="text-base">Reasoning</CardTitle></CardHeader>
            <CardContent><p className="text-sm leading-relaxed">{card.reasoning}</p></CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-card">
              <CardHeader><CardTitle className="text-base">Risks</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">{card.risks.map((r) => <li key={r} className="text-sm flex gap-2"><span className="text-warning mt-1">•</span>{r}</li>)}</ul>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardHeader><CardTitle className="text-base">Actions</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">{card.actions.map((r) => <li key={r} className="text-sm flex gap-2"><span className="text-primary mt-1">•</span>{r}</li>)}</ul>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Sources & citations</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Every claim above is traceable to the underlying source documents.</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {card.sources.map((s) => (
                <div key={s.id} className="flex gap-3 p-3 rounded-md border bg-muted/30">
                  <FileText className="size-4 text-primary mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{s.name}{s.page ? <span className="text-muted-foreground"> · page {s.page}</span> : null}</p>
                    <p className="text-xs text-muted-foreground mt-1 italic">"{s.snippet}"</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader><CardTitle className="text-base">Business context</CardTitle></CardHeader>
            <CardContent><p className="text-sm leading-relaxed">{card.businessContext}</p></CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-card">
            <CardContent className="pt-6 text-center">
              <ConfidenceRing value={card.confidence} size={88} />
              <p className="text-xs text-muted-foreground mt-3">Model confidence</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="pt-6 space-y-3 text-sm">
              <Row icon={<ShieldCheck className="size-3.5 text-success" />} label="Status">
                <Badge variant="secondary" className="font-normal capitalize">{card.validationStatus.replace("_"," ")}</Badge>
              </Row>
              <Row icon={<Clock className="size-3.5 text-muted-foreground" />} label="Last reviewed">{card.lastReviewedAt}</Row>
              <Row icon={<Users className="size-3.5 text-muted-foreground" />} label="Stakeholders">
                <span className="text-right">{card.stakeholders.join(", ")}</span>
              </Row>
              <Separator />
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Topics</p>
                <div className="flex flex-wrap gap-1.5">
                  {card.topics.map((t) => <Badge key={t} variant="outline" className="font-normal">{t}</Badge>)}
                </div>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Decisions</p>
                <ul className="space-y-1.5">
                  {card.decisions.map((d) => <li key={d} className="text-sm flex gap-2"><span className="text-primary mt-1">•</span>{d}</li>)}
                </ul>
              </div>
            </CardContent>
          </Card>

          {card.related.length > 0 && (
            <Card className="shadow-card">
              <CardHeader><CardTitle className="text-base">Related knowledge</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {card.related.map((r) => (
                  <Link key={r.id} to="/knowledge/$id" params={{ id: r.id }} className="block text-sm p-2.5 rounded-md border hover:bg-accent hover:border-primary/30 transition-colors">
                    {r.title}
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-muted-foreground flex items-center gap-1.5 text-xs">{icon}{label}</span>
      <span className="text-sm text-right max-w-[60%]">{children}</span>
    </div>
  );
}
