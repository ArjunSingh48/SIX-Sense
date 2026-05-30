import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PERSONAS, setCurrentPersona, type Persona } from "@/lib/personas";
import { HOME_FOR_ROLE } from "@/lib/permissions";

export const Route = createFileRoute("/")({
  component: EntryPage,
});

const BG = "#3F0E40";
const STRIP = "#F4EDE4";
const ACCENT = "#611F69";

function EntryPage() {
  const navigate = useNavigate();

  const choose = (p: Persona) => {
    setCurrentPersona(p.id);
    navigate({ to: HOME_FOR_ROLE[p.role] });
  };

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: BG }}>
      {/* Top bar */}
      <header className="px-8 py-6 flex items-center">
        <div className="flex items-center gap-2 text-white">
          <div
            className="size-9 rounded-lg grid place-items-center font-bold"
            style={{ backgroundColor: "#ECB22E", color: "#3F0E40" }}
          >
            S6
          </div>
          <div className="leading-tight">
            <div className="text-xl font-semibold tracking-tight">SIX Sense</div>
            <div className="text-[10px] uppercase tracking-widest opacity-70">
              Governed expert knowledge
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-6 pb-24">
        <h1 className="text-white text-5xl md:text-6xl font-semibold tracking-tight mt-8 mb-10">
          <span className="mr-3" aria-hidden>👋</span>Welcome back
        </h1>

        {/* Strip */}
        <div
          className="rounded-t-lg px-6 py-4 text-[15px]"
          style={{ backgroundColor: STRIP, color: "#1D1C1D" }}
        >
          Personas for <span className="font-semibold">six-sense.demo</span>
        </div>

        {/* Persona cards */}
        <div className="bg-white rounded-b-lg overflow-hidden divide-y divide-neutral-200 shadow-lg">
          {PERSONAS.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-5 px-6 py-5"
            >
              <div
                className={`size-14 rounded-lg ${p.avatarColor} text-white grid place-items-center font-semibold text-lg shrink-0`}
              >
                {p.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-lg font-bold tracking-tight text-neutral-900 truncate">
                  {p.name}
                </div>
                <div className="text-sm text-neutral-600 truncate">{p.email}</div>
              </div>
              <button
                onClick={() => choose(p)}
                className="px-5 py-3 rounded-md text-white text-xs font-bold tracking-[0.15em] uppercase hover:opacity-90 transition-opacity shrink-0"
                style={{ backgroundColor: ACCENT }}
              >
                Enter
              </button>
            </div>
          ))}
        </div>

        {/* Secondary informational band */}
        <div
          className="mt-10 rounded-lg px-6 py-5 flex items-center gap-5 shadow-lg"
          style={{ backgroundColor: "#FFFFFF" }}
        >
          <div
            className="size-14 rounded-lg grid place-items-center text-2xl shrink-0"
            style={{ backgroundColor: "#FCE8D5" }}
            aria-hidden
          >
            🔄
          </div>
          <div className="flex-1 text-[15px] text-neutral-800">
            Need a different view? You can switch personas anytime from the top bar.
          </div>
          <div
            className="px-4 py-2 rounded-md text-xs font-bold tracking-[0.15em] uppercase border"
            style={{ borderColor: ACCENT, color: ACCENT }}
          >
            Role-based access
          </div>
        </div>

        {/* Footer principle */}
        <p className="mt-12 text-center text-xs text-white/60 tracking-wide">
          No source, no answer · No confidence, no action · No access rights, no disclosure
        </p>
      </main>
    </div>
  );
}
