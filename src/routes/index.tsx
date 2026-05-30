import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { PERSONAS, setCurrentPersona, type Persona } from "@/lib/personas";
import { HOME_FOR_ROLE } from "@/lib/permissions";

export const Route = createFileRoute("/")({
  component: EntryPage,
});

function EntryPage() {
  const navigate = useNavigate();

  const choose = (p: Persona) => {
    setCurrentPersona(p.id);
    navigate({ to: HOME_FOR_ROLE[p.role] });
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-muted/30 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="size-11 rounded-xl bg-gradient-hero grid place-items-center shadow-elevated">
            <span className="text-primary-foreground font-bold tracking-tight">S6</span>
          </div>
          <div className="leading-tight">
            <div className="text-xl font-semibold tracking-tight">SIX Sense</div>
            <div className="text-xs text-muted-foreground">Governed expert knowledge</div>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-center max-w-2xl">
          Continue as
        </h1>
        <p className="mt-2 text-sm text-muted-foreground text-center max-w-md">
          Pick a profile to enter the demo workspace. Each role sees a different view of the same governed knowledge.
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-4xl">
          {PERSONAS.map((p) => (
            <button
              key={p.id}
              onClick={() => choose(p)}
              className="group text-left rounded-2xl border bg-card p-6 shadow-sm hover:shadow-elevated hover:border-primary/40 transition-all relative overflow-hidden"
            >
              <div
                className={`size-14 rounded-full ${p.avatarColor} text-white grid place-items-center font-semibold text-lg shadow`}
              >
                {p.initials}
              </div>
              <div className="mt-5">
                <div className="text-lg font-semibold tracking-tight">{p.name}</div>
                <div className="text-sm text-muted-foreground">{p.email}</div>
              </div>
              <div className="mt-6 flex items-center text-sm font-medium text-primary group-hover:gap-2 transition-all">
                Continue
                <ArrowRight className="size-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>

      <footer className="border-t bg-card/40 backdrop-blur py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5" />
          <span>No source, no answer · No confidence, no action · No access rights, no disclosure</span>
        </div>
      </footer>
    </div>
  );
}
