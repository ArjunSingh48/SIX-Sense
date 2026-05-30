import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, ShieldCheck, Clock } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { knowledgeCards, departments } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/knowledge/")({
  component: KnowledgeListPage,
});

function KnowledgeListPage() {
  const [q, setQ] = useState("");
  const [dept, setDept] = useState<string | null>(null);

  const filtered = knowledgeCards.filter((c) => {
    const text = (c.title + c.summary + c.topics.join(" ")).toLowerCase();
    return (!q || text.includes(q.toLowerCase())) && (!dept || c.department === dept);
  });

  return (
    <div>
      <PageHeader
        eyebrow="Knowledge Library"
        title="Validated institutional knowledge"
        description="Browse decisions, reasoning, and context preserved from across SIX Group."
      />

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[260px] max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search cards, topics, decisions…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <FilterChip label="All" active={dept === null} onClick={() => setDept(null)} />
          {departments.slice(0, 6).map((d) => (
            <FilterChip key={d} label={d} active={dept === d} onClick={() => setDept(d)} />
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <Link key={c.id} to="/knowledge/$id" params={{ id: c.id }}>
            <Card className="shadow-card hover:shadow-elevated hover:border-primary/30 transition-all h-full">
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="font-normal text-[10px]">{c.department}</Badge>
                  <AccessBadge level={c.accessLevel} />
                  {c.validationStatus === "validated" && (
                    <Badge variant="secondary" className="gap-1 font-normal text-[10px]">
                      <ShieldCheck className="size-3 text-success" /> Validated
                    </Badge>
                  )}
                </div>
                <h3 className="text-base font-semibold tracking-tight leading-snug mb-2">{c.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-3">{c.summary}</p>
                <div className="flex items-center justify-between mt-4 pt-3 border-t text-xs text-muted-foreground">
                  <span>{c.owner}</span>
                  <span className="flex items-center gap-1"><Clock className="size-3" /> {c.lastReviewedAt}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
        active ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-accent"
      }`}
    >
      {label}
    </button>
  );
}

function AccessBadge({ level }: { level: string }) {
  const map: Record<string, string> = {
    public: "bg-muted text-muted-foreground",
    department: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-900",
    restricted: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-900",
    executive: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-200 dark:border-purple-900",
  };
  return <span className={`text-[10px] px-2 py-0.5 rounded-md border ${map[level] ?? ""}`}>{level}</span>;
}
