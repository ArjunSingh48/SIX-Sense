import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowUpRight, Sparkles, TrendingUp, AlertTriangle } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { execKpis, knowledgeGrowth, departmentActivity, escalations } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const summary = useMemo(
    () =>
      "Knowledge capture is up 18% month-over-month, led by Securities Services following the T+1 migration. Three single-point-of-failure SMEs remain concentrated in Digital Assets and Post-Trade — recommend prioritising the Markus Fehr handover before 15 July. Open escalations are down 30% as Compliance validates new CSDR interpretations.",
    [],
  );

  return (
    <div>
      <PageHeader
        eyebrow="Executive Dashboard"
        title="Enterprise knowledge health"
        description="A real-time view of how SIX Group is capturing, reusing, and protecting its institutional knowledge."
        actions={
          <>
            <Button variant="outline" size="sm">Export</Button>
            <Button size="sm">Schedule briefing</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {execKpis.map((k) => (
          <Card key={k.label} className="shadow-card">
            <CardContent className="pt-5 pb-5">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{k.label}</p>
              <p className="text-2xl font-semibold mt-2 tabular-nums">{k.value}</p>
              <p className={`text-xs mt-1 ${k.positive ? "text-success" : "text-warning"}`}>{k.delta}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Knowledge growth</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Total cards vs. validated, last 12 months</p>
            </div>
            <Badge variant="secondary" className="font-normal"><TrendingUp className="size-3 mr-1" />+18% MoM</Badge>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={knowledgeGrowth}>
                <defs>
                  <linearGradient id="gCards" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-3)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--color-chart-3)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="cards" stroke="var(--color-chart-1)" fill="url(#gCards)" strokeWidth={2} />
                <Area type="monotone" dataKey="validated" stroke="var(--color-chart-3)" fill="url(#gVal)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-subtle">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-md bg-primary/10 grid place-items-center">
                <Sparkles className="size-3.5 text-primary" />
              </div>
              <CardTitle className="text-base">AI executive summary</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-foreground/85">{summary}</p>
            <Button variant="ghost" size="sm" className="mt-4 -ml-2">
              Read full briefing <ArrowUpRight className="size-3.5 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader>
            <CardTitle className="text-base">Department activity</CardTitle>
            <p className="text-xs text-muted-foreground">Captures and queries by department, last 30 days</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={departmentActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="department" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} interval={0} angle={-12} textAnchor="end" height={60} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="captures" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="queries" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-warning" />
              <CardTitle className="text-base">Open escalations</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {escalations.map((e) => (
              <div key={e.id} className="text-sm border-l-2 border-primary/40 pl-3 py-1">
                <p className="font-medium leading-snug">{e.question}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {e.sme} · {e.department} · opened {e.opened}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
