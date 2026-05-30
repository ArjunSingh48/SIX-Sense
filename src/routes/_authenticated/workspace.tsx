import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Hash, Lock, Plus, Send, Sparkles, Star, Bell, Search, HelpCircle,
  ChevronDown, Home, MessageSquare, Activity, FileText, MoreHorizontal,
  Bookmark, Type, AtSign, Smile, Video, Mic, Slash, X, Settings,
  Upload, Layout, List as ListIcon, Workflow, ScanLine, Shield,
  Mail, Hash as HashIcon, Database, Users, Building2,
  Check, ArrowRight, FileUp, Brain, ShieldCheck, LogIn,
  TrendingUp, BarChart3, Loader2, ExternalLink, FileDown, GitBranch,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/workspace")({
  component: WorkspacePage,
});

/* ---------- AI client ---------- */
async function callSenseAI(action: string, payload: Record<string, unknown> = {}) {
  const { data, error } = await supabase.functions.invoke("sense-ai", {
    body: { action, ...payload },
  });
  if (error) throw new Error(error.message);
  if (!data?.ok) throw new Error(data?.error ?? "AI error");
  return data.result;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const s = r.result as string;
      resolve(s.split(",")[1] ?? "");
    };
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

/* ------------------------------------------------------------------ data -- */
type Channel = { id: string; name: string; private?: boolean; topic: string };
type Msg = {
  id: string; channelId: string; author: string; avatarColor: string;
  ts: string; body: React.ReactNode; reactions?: { e: string; n: number }[];
  replies?: { count: number; ago: string };
};

const channels: Channel[] = [
  { id: "external", name: "external_partners_csd", topic: "External CSD & custody partners" },
  { id: "general", name: "general", topic: "SIX Group · firm-wide announcements, votes, and shoutouts" },
  { id: "post-trade", name: "post-trade-ops", topic: "T+1 migration, CSDR penalties, settlement cut-offs" },
  { id: "csdr", name: "csdr-interpretation", topic: "Working group on the 2024 CSDR framework" },
  { id: "digital-assets", name: "digital-assets", private: true, topic: "Custody, key ceremonies, cold-storage SLA" },
  { id: "compliance", name: "compliance", topic: "FINMA, internal policy reviews" },
  { id: "random", name: "random", topic: "Coffee, ski weekends, and lost laptops" },
];

const dms = [
  { id: "self", name: "Arjun Singh", role: "you", color: "bg-emerald-500" },
  { id: "anja", name: "Anja Müller", role: "Head of Post-Trade", color: "bg-rose-500" },
  { id: "lukas", name: "Lukas Brunner", role: "Senior Compliance Counsel", color: "bg-amber-500" },
];

const seedMessages: Msg[] = [
  {
    id: "m1", channelId: "general", author: "Arjun Singh", avatarColor: "bg-violet-500",
    ts: "10:14 AM",
    body: (
      <>
        <p>Hey everyone!</p>
        <p>Big day for the Post-Trade team 🚀</p>
        <p>We just signed off the <strong>T+1 settlement migration</strong> framework with FINMA — full memo + risk register attached in the Files tab.</p>
        <p>It would mean a lot if you could comment, react, or share feedback in the thread below.</p>
        <p className="text-[#1d9bd1] underline break-all">https://intra.six-group.com/post-trade/t-plus-one/memo-v3?utm_source=slack&utm_medium=announce</p>
      </>
    ),
    reactions: [{ e: "🚀", n: 1 }, { e: "✅", n: 6 }],
    replies: { count: 1, ago: "1 day ago" },
  },
  {
    id: "m2", channelId: "general", author: "Jonas Schmid", avatarColor: "bg-sky-500",
    ts: "10:45 AM",
    body: (
      <>
        <p>Hey everybody,</p>
        <p>I'm missing a <em>hardware security module key card</em> and would like to know if anybody has seen it — probably ended up in the boxes of free swag taken from the lockers.</p>
        <p>Thank you for your help in advance!</p>
      </>
    ),
  },
  {
    id: "m3", channelId: "general", author: "Ziad Malik", avatarColor: "bg-indigo-400",
    ts: "7:08 PM",
    body: (
      <>
        <p>Hey all, anybody know a good Zurich <em>Treuhänder</em> that works with regulated entities for our new fintech accelerator portfolio?</p>
        <p>Thanks a lot.</p>
      </>
    ),
  },
  {
    id: "m4", channelId: "general", author: "Markus Fehr", avatarColor: "bg-amber-500",
    ts: "5:35 PM",
    body: (
      <p>Hey team, we're considering whether to purchase a Bloomberg terminal specifically for our digital-assets desk. Could anyone let us know if there are any specific procurement guardrails regarding equipment reimbursement? Thanks!</p>
    ),
  },
];

const initials = (n: string) => n.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

/* ------------------------------------------------------------------- page -- */
function WorkspacePage() {
  const [activeId, setActiveId] = useState("general");
  const [messages, setMessages] = useState<Msg[]>(seedMessages);
  const [draft, setDraft] = useState("");
  const [plusOpen, setPlusOpen] = useState(false);
  const [promoDismissed, setPromoDismissed] = useState(false);
  const [sending, setSending] = useState(false);

  // SIX Sense flow
  const [twinLoginOpen, setTwinLoginOpen] = useState(false);
  const [twinActive, setTwinActive] = useState(false);
  const [twinPanelOpen, setTwinPanelOpen] = useState(false);

  // Settings & overlays
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState<string | null>(null); // employee id or "me"
  const [dmOpen, setDmOpen] = useState<string | null>(null);
  const [railSheet, setRailSheet] = useState<null | "dms" | "activity" | "files">(null);

  // Main channel tabs
  const [mainTab, setMainTab] = useState<"messages" | "canvas" | "files" | "bookmarks">("messages");

  const active = channels.find((c) => c.id === activeId)!;
  const channelMessages = useMemo(() => messages.filter((m) => m.channelId === activeId), [messages, activeId]);

  // Load DB-saved channel messages once
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("kind", "channel")
        .order("created_at", { ascending: true });
      if (error || !data) return;
      const loaded: Msg[] = data.map((r) => ({
        id: r.id,
        channelId: r.channel_id,
        author: r.author_name,
        avatarColor: r.author_color,
        ts: new Date(r.created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
        body: <p>{r.body}</p>,
      }));
      setMessages((prev) => [...prev, ...loaded]);
    })();
  }, []);

  const sendMessage = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    const { data, error } = await supabase
      .from("chat_messages")
      .insert({
        channel_id: activeId,
        author_name: "Arjun Singh",
        author_color: "bg-emerald-500",
        body: text,
        kind: "channel",
      })
      .select()
      .single();
    setSending(false);
    if (error || !data) {
      toast.error("Could not send message");
      return;
    }
    setMessages((prev) => [
      ...prev,
      {
        id: data.id,
        channelId: data.channel_id,
        author: data.author_name,
        avatarColor: data.author_color,
        ts: new Date(data.created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
        body: <p>{text}</p>,
      },
    ]);
    setDraft("");
  };

  const openSixSense = () => {
    setPlusOpen(false);
    if (!twinActive) setTwinLoginOpen(true);
    else setTwinPanelOpen(true);
  };

  const onLoginSuccess = () => {
    setTwinActive(true);
    setTwinLoginOpen(false);
    setTwinPanelOpen(true);
    toast.success("SIX Sense activated", { description: "Your Digital Twin is now running in the background." });
  };

  return (
    <div className="h-screen w-full flex bg-[#1a1d29] text-white overflow-hidden font-sans">
      {/* Workspace rail */}
      <nav className="w-[68px] shrink-0 bg-[#3f0e40] flex flex-col items-center pt-3 gap-1">
        <div className="size-9 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 grid place-items-center font-black text-black text-sm shadow-lg mb-1">
          SIX
        </div>
        <RailItem icon={<Home className="size-5" />} label="Home" active />
        <RailItem icon={<MessageSquare className="size-5" />} label="DMs" onClick={() => setRailSheet("dms")} />
        <RailItem icon={<Activity className="size-5" />} label="Activity" onClick={() => setRailSheet("activity")} />
        <RailItem icon={<FileText className="size-5" />} label="Files" onClick={() => setRailSheet("files")} />
        <RailItem icon={<MoreHorizontal className="size-5" />} label="More" />
        <div className="mt-auto mb-3 flex flex-col items-center gap-2">
          <button onClick={() => setPlusOpen(true)} className="size-9 rounded-full bg-white/10 hover:bg-white/20 grid place-items-center transition" title="New">
            <Plus className="size-4" />
          </button>
          <button onClick={() => setProfileOpen("me")} className="size-8 rounded-full bg-emerald-500 grid place-items-center text-xs font-semibold text-black hover:ring-2 hover:ring-white/30 transition" title="Your profile">AS</button>
        </div>
      </nav>

      {/* Channel sidebar */}
      <aside className="w-[260px] shrink-0 bg-[#19171d] flex flex-col">
        <div className="h-14 px-4 flex items-center justify-between border-b border-white/5">
          <button className="flex items-center gap-1.5 font-bold text-[15px] hover:bg-white/5 px-1.5 py-1 rounded">
            SIX Group <ChevronDown className="size-3.5 opacity-70" />
          </button>
          <div className="flex items-center gap-1 text-white/70">
            <button className="size-7 grid place-items-center rounded hover:bg-white/10" onClick={() => setSettingsOpen(true)} title="Settings">
              <Settings className="size-3.5" />
            </button>
            <button className="size-7 grid place-items-center rounded hover:bg-white/10" title="New message">
              <Type className="size-3.5" />
            </button>
          </div>
        </div>

        {/* SIX Sense promo */}
        {!promoDismissed && (
          <div className="mx-3 mt-3 rounded-md bg-gradient-to-br from-amber-500/20 to-violet-500/20 border border-white/10 p-3 relative">
            <button onClick={() => setPromoDismissed(true)} className="absolute top-2 right-2 text-white/60 hover:text-white" aria-label="Dismiss"><X className="size-3" /></button>
            <div className="flex items-start gap-2">
              <Sparkles className={`size-4 mt-0.5 ${twinActive ? "text-emerald-400" : "text-amber-400"}`} />
              <div>
                <p className="text-[13px] font-semibold leading-tight flex items-center gap-1.5">
                  {twinActive && <span className="size-1.5 rounded-full bg-emerald-400 inline-block" />}
                  {twinActive ? "Digital Twin active" : "Activate SIX Sense"}
                </p>
                <p className="text-[11px] text-white/70 mt-0.5">{twinActive ? "Auto-capturing knowledge from this workspace." : "Your organizational memory, inside Slack."}</p>
                {!twinActive && (
                  <button onClick={() => setTwinLoginOpen(true)} className="mt-2 text-[11px] font-semibold text-amber-300 hover:underline">
                    Connect with work email →
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <ScrollArea className="flex-1 mt-3">
          <SidebarItem icon={<HashIcon className="size-3.5" />} label="Threads" />
          <SidebarItem icon={<Activity className="size-3.5" />} label="Huddles" />
          <SidebarItem icon={<Bookmark className="size-3.5" />} label="Recap" />
          <SidebarItem icon={<ListIcon className="size-3.5" />} label="Directories" />
          {twinActive && (
            <SidebarItem icon={<Brain className="size-3.5 text-amber-400" />} label="SIX Sense · Digital Twin" onClick={() => setTwinPanelOpen(true)} />
          )}

          <div className="mt-4 mb-1 px-4 flex items-center gap-1 text-white/60">
            <ChevronDown className="size-3" />
            <span className="text-[13px] font-semibold">Starred</span>
          </div>
          <SidebarItem indent icon={<Hash className="size-3.5 opacity-60" />} label="csdr-interpretation" onClick={() => setActiveId("csdr")} />

          <div className="mt-4 mb-1 px-4 flex items-center justify-between text-white/60">
            <div className="flex items-center gap-1">
              <ChevronDown className="size-3" />
              <span className="text-[13px] font-semibold">Channels</span>
            </div>
            <Plus className="size-3 hover:text-white cursor-pointer" />
          </div>
          {channels.map((c) => (
            <ChannelRow key={c.id} c={c} active={c.id === activeId} onClick={() => setActiveId(c.id)} />
          ))}

          <div className="mt-4 mb-1 px-4 flex items-center justify-between text-white/60">
            <div className="flex items-center gap-1">
              <ChevronDown className="size-3" />
              <span className="text-[13px] font-semibold">Direct messages</span>
            </div>
            <Plus className="size-3 hover:text-white cursor-pointer" />
          </div>
          {dms.map((d) => (
            <button key={d.id} onClick={() => d.id === "self" ? setProfileOpen("me") : setDmOpen(d.id)} className="w-full flex items-center gap-2 px-4 py-1 hover:bg-white/5 text-left">
              <span className={`size-3.5 rounded-sm ${d.color}`} />
              <span className="text-[14px] text-white/85 truncate">{d.name}</span>
              {d.role === "you" && <span className="text-[11px] text-white/50">you</span>}
            </button>
          ))}
        </ScrollArea>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#1a1d29]">
        {/* Top bar */}
        <div className="h-11 border-b border-white/5 flex items-center px-4 gap-3 bg-[#1a1d29]">
          <div className="flex-1 flex items-center justify-center">
            <div className="w-[560px] max-w-full h-7 rounded bg-white/5 hover:bg-white/10 flex items-center px-3 gap-2 text-xs text-white/60 cursor-text">
              <Search className="size-3.5" /> Search SIX Group
            </div>
          </div>
          <button onClick={() => setSettingsOpen(true)} className="size-7 grid place-items-center rounded hover:bg-white/10 text-white/70" title="Settings">
            <Settings className="size-4" />
          </button>
          <button className="size-7 grid place-items-center rounded hover:bg-white/10 text-white/70"><HelpCircle className="size-4" /></button>
        </div>

        {/* Channel header */}
        <div className="h-14 border-b border-white/5 px-5 flex items-center gap-3">
          <Star className="size-4 text-white/40 hover:text-white cursor-pointer" />
          <div className="flex items-center gap-1.5">
            {active.private ? <Lock className="size-4 text-white/70" /> : <Hash className="size-4 text-white/70" />}
            <span className="font-bold text-[15px]">{active.name}</span>
            <ChevronDown className="size-3.5 text-white/50" />
          </div>
          <Separator orientation="vertical" className="h-5 bg-white/10" />
          <span className="text-[13px] text-white/60 truncate flex-1">{active.topic}</span>
          <div className="flex items-center gap-1 text-white/70 text-xs">
            <Users className="size-3.5" /> 4,623
          </div>
          <Bell className="size-4 text-white/60" />
          <Search className="size-4 text-white/60" />
        </div>

        {/* Tabs row */}
        <div className="h-9 border-b border-white/5 px-5 flex items-center gap-5 text-[13px]">
          <TabPill active={mainTab === "messages"} onClick={() => setMainTab("messages")} icon={<MessageSquare className="size-3.5" />} label="Messages" />
          <TabPill active={mainTab === "canvas"} onClick={() => setMainTab("canvas")} icon={<Layout className="size-3.5" />} label="Canvas" />
          <TabPill active={mainTab === "files"} onClick={() => setMainTab("files")} icon={<FileText className="size-3.5" />} label="Files" />
          <TabPill active={mainTab === "bookmarks"} onClick={() => setMainTab("bookmarks")} icon={<Bookmark className="size-3.5" />} label="Bookmarks" />
          <Plus className="size-3.5 text-white/50 cursor-pointer" />
        </div>

        {/* Main content per tab */}
        <ScrollArea className="flex-1">
          {mainTab === "messages" && (
            <div className="px-5 py-5 space-y-5">
              {channelMessages.map((m) => (
                <MessageBlock key={m.id} m={m} />
              ))}
              <DayDivider label="Today" />
            </div>
          )}
          {mainTab === "canvas" && <CanvasView channelName={active.name} />}
          {mainTab === "files" && <FilesView channelName={active.name} />}
          {mainTab === "bookmarks" && <BookmarksView channelName={active.name} />}
        </ScrollArea>

        {/* Composer */}
        <div className="px-5 pb-5">
          <div className="rounded-md border border-white/15 bg-[#222529]">
            {/* Toolbar */}
            <div className="flex items-center gap-0.5 px-2 py-1 border-b border-white/5 text-white/70 text-xs">
              <FormatBtn label="B">𝐁</FormatBtn>
              <FormatBtn label="I"><em>I</em></FormatBtn>
              <FormatBtn label="S"><s>S</s></FormatBtn>
              <Separator orientation="vertical" className="h-4 bg-white/10 mx-1" />
              <FormatBtn label="Link">🔗</FormatBtn>
              <FormatBtn label="List">≡</FormatBtn>
              <FormatBtn label="Quote">❝</FormatBtn>
              <FormatBtn label="Code">{`</>`}</FormatBtn>
            </div>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
              }}
              placeholder={`Message #${active.name}`}
              rows={2}
              className="w-full resize-none bg-transparent text-sm outline-none px-3 py-2 placeholder:text-white/40"
            />
            {twinActive && (
              <div className="px-3 pb-1.5 flex items-center gap-1.5 text-[11px] text-emerald-400">
                <Sparkles className="size-3" />
                <span className="size-1.5 rounded-full bg-emerald-400 inline-block" />
                SIX Sense active — Digital Twin is logging this conversation
              </div>
            )}
            <div className="flex items-center gap-1 px-2 py-1.5 text-white/70">
              <ComposerBtn onClick={() => setPlusOpen(true)} title="Add">
                <span className="relative">
                  <Plus className="size-4" />
                  {twinActive && <span className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-emerald-400 ring-1 ring-[#222529]" />}
                </span>
              </ComposerBtn>
              <ComposerBtn title="Formatting"><Type className="size-4" /></ComposerBtn>
              <ComposerBtn title="Emoji"><Smile className="size-4" /></ComposerBtn>
              <ComposerBtn title="Mention"><AtSign className="size-4" /></ComposerBtn>
              <ComposerBtn title="Video"><Video className="size-4" /></ComposerBtn>
              <ComposerBtn title="Audio"><Mic className="size-4" /></ComposerBtn>
              <ComposerBtn title="Slash"><Slash className="size-4" /></ComposerBtn>
              <div className="ml-auto flex items-center gap-1">
                <button onClick={sendMessage} disabled={!draft.trim() || sending} className="size-7 grid place-items-center rounded bg-[#007a5a] hover:bg-[#008a66] text-white disabled:opacity-40 disabled:bg-transparent disabled:text-white/40">
                  <Send className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* PLUS MENU (composer add) */}
      <Dialog open={plusOpen} onOpenChange={setPlusOpen}>
        <DialogContent className="p-0 max-w-sm bg-[#1a1d29] border-white/10 text-white gap-0">
          {/* SIX Sense featured card — full width, X button does not overlap content */}
          <button
            onClick={openSixSense}
            className="relative w-full text-left p-4 bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-violet-500/20 hover:from-amber-500/25 hover:to-violet-500/25 transition border-b border-white/10 rounded-t-lg"
          >
            <div className="flex items-center gap-3 pr-8">
              <div className={`size-10 rounded-lg grid place-items-center shrink-0 shadow-lg ${twinActive ? "bg-gradient-to-br from-emerald-400 to-emerald-600" : "bg-gradient-to-br from-amber-400 to-orange-500"}`}>
                <Sparkles className="size-5 text-black" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-bold text-sm">SIX Sense</p>
                  {twinActive && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300">Active</span>}
                </div>
                <p className="text-[11px] text-white/70 mt-0.5 leading-snug">
                  Your governed Digital Twin · ask, upload knowledge, track progress
                </p>
              </div>
            </div>
          </button>

          <div className="py-1.5">
            <PlusItem icon={<Layout className="size-4" />} label="Canvas" />
            <PlusItem icon={<ListIcon className="size-4" />} label="List" />
            <PlusItem icon={<Type className="size-4" />} label="Text snippet" hint="⌘⇧Enter" />
            <PlusItem icon={<Workflow className="size-4" />} label="Workflow" />
            <PlusItem icon={<Upload className="size-4" />} label="Upload from your computer" />
          </div>
        </DialogContent>
      </Dialog>

      {/* SIX SENSE LOGIN */}
      <TwinLoginDialog open={twinLoginOpen} onOpenChange={setTwinLoginOpen} onSuccess={onLoginSuccess} />

      {/* SIX SENSE PANEL */}
      <Sheet open={twinPanelOpen} onOpenChange={setTwinPanelOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg p-0 bg-[#1a1d29] border-white/10 text-white">
          <TwinPanel channel={active} onOpenSettings={() => { setTwinPanelOpen(false); setSettingsOpen(true); }} />
        </SheetContent>
      </Sheet>

      {/* SETTINGS */}
      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl p-0 bg-[#1a1d29] border-white/10 text-white">
          <SettingsPanel twinActive={twinActive} />
        </SheetContent>
      </Sheet>

      {/* PROFILE */}
      <Sheet open={!!profileOpen} onOpenChange={(v) => !v && setProfileOpen(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg p-0 bg-[#1a1d29] border-white/10 text-white">
          {profileOpen && <ProfileSheet who={profileOpen} onOpenDM={(id) => { setProfileOpen(null); setDmOpen(id); }} />}
        </SheetContent>
      </Sheet>

      {/* DM */}
      <Sheet open={!!dmOpen} onOpenChange={(v) => !v && setDmOpen(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 bg-[#1a1d29] border-white/10 text-white">
          {dmOpen && <DMSheet dmId={dmOpen} onOpenProfile={() => { const id = dmOpen; setDmOpen(null); setProfileOpen(id); }} />}
        </SheetContent>
      </Sheet>

      {/* RAIL: DMs / Activity / Files */}
      <Sheet open={!!railSheet} onOpenChange={(v) => !v && setRailSheet(null)}>
        <SheetContent side="left" className="w-full sm:max-w-md p-0 bg-[#19171d] border-white/10 text-white ml-[68px]">
          {railSheet === "dms" && <RailDMsSheet onOpen={(id) => { setRailSheet(null); setDmOpen(id); }} />}
          {railSheet === "activity" && <RailActivitySheet />}
          {railSheet === "files" && <RailFilesSheet />}
        </SheetContent>
      </Sheet>
    </div>
  );
}

/* ------------------------------------------------------------- small UI -- */
function RailItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-0.5 w-14 py-2 rounded-lg hover:bg-white/5 text-white/75">
      <span className={`size-9 grid place-items-center rounded-lg ${active ? "bg-white/15 text-white" : ""}`}>{icon}</span>
      <span className="text-[10px]">{label}</span>
    </button>
  );
}
function SidebarItem({ icon, label, onClick, indent }: { icon: React.ReactNode; label: string; onClick?: () => void; indent?: boolean }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-2 ${indent ? "pl-7 pr-4" : "px-4"} py-[5px] hover:bg-white/5 text-left text-[14px] text-white/85`}>
      <span className="text-white/60">{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  );
}
function ChannelRow({ c, active, onClick }: { c: Channel; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-4 py-[5px] text-left text-[14px] ${active ? "bg-[#1164a3] text-white" : "text-white/75 hover:bg-white/5"}`}
    >
      {c.private ? <Lock className="size-3.5 opacity-70" /> : <Hash className="size-3.5 opacity-70" />}
      <span className="truncate">{c.name}</span>
    </button>
  );
}
function TabPill({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`h-9 flex items-center gap-1.5 border-b-2 px-1 ${active ? "border-white text-white" : "border-transparent text-white/60 hover:text-white"}`}>
      {icon}<span>{label}</span>
    </button>
  );
}
function FormatBtn({ children, label }: { children: React.ReactNode; label: string }) {
  return <button title={label} className="size-7 grid place-items-center rounded hover:bg-white/10 text-white/80">{children}</button>;
}
function ComposerBtn({ children, onClick, title }: { children: React.ReactNode; onClick?: () => void; title?: string }) {
  return <button onClick={onClick} title={title} className="size-7 grid place-items-center rounded hover:bg-white/10">{children}</button>;
}
function PlusItem({ icon, label, hint, accent, onClick }: { icon: React.ReactNode; label: string; hint?: string; accent?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm hover:bg-white/5 ${accent ? "text-amber-300" : "text-white/90"}`}
    >
      <span className="w-5 grid place-items-center text-white/70">{icon}</span>
      <span className="flex-1">{label}</span>
      {hint && <span className="text-[11px] text-white/40">{hint}</span>}
    </button>
  );
}
function DayDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <Separator className="flex-1 bg-white/10" />
      <span className="text-[11px] text-white/60 bg-[#1a1d29] border border-white/15 rounded-full px-3 py-0.5 flex items-center gap-1">{label} <ChevronDown className="size-3" /></span>
      <Separator className="flex-1 bg-white/10" />
    </div>
  );
}
function MessageBlock({ m }: { m: Msg }) {
  return (
    <div className="group flex items-start gap-3 -mx-2 px-2 py-1 rounded hover:bg-white/[0.03]">
      <div className={`size-9 rounded-md ${m.avatarColor} grid place-items-center text-xs font-semibold text-black/80 shrink-0`}>{initials(m.author)}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-[15px]">{m.author}</span>
          <span className="text-[11px] text-white/50">{m.ts}</span>
        </div>
        <div className="text-[14px] text-white/90 leading-relaxed space-y-1">{m.body}</div>
        {m.reactions && (
          <div className="flex gap-1 mt-1.5">
            {m.reactions.map((r, i) => (
              <span key={i} className="inline-flex items-center gap-1 text-[11px] bg-[#1d9bd1]/15 border border-[#1d9bd1]/40 text-[#69b7e8] rounded-full px-2 py-0.5">
                {r.e} <span>{r.n}</span>
              </span>
            ))}
          </div>
        )}
        {m.replies && (
          <button className="mt-1.5 text-[12px] text-[#1d9bd1] font-medium hover:underline">{m.replies.count} reply · {m.replies.ago}</button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------- Twin Login -- */
function TwinLoginDialog({ open, onOpenChange, onSuccess }: { open: boolean; onOpenChange: (v: boolean) => void; onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.endsWith("@six-group.com") && !email.endsWith("@six.com") && !email.includes("@")) {
      toast.error("Use your @six-group.com work email");
      return;
    }
    setBusy(true);
    setTimeout(() => { setBusy(false); onSuccess(); }, 700);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-[#1a1d29] border-white/10 text-white">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="size-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 grid place-items-center"><Sparkles className="size-4 text-black" /></div>
            <DialogTitle className="text-white">Activate SIX Sense</DialogTitle>
          </div>
          <DialogDescription className="text-white/60">
            Log in with your <strong className="text-white">SIX work email</strong>. Your Digital Twin will run quietly in the background of your communication tools.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-xs text-white/60">Work email</label>
            <Input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="firstname.lastname@six-group.com"
              className="bg-white/5 border-white/15 text-white placeholder:text-white/30 mt-1"
            />
          </div>
          <div className="rounded-md bg-white/5 border border-white/10 p-3 text-[11px] text-white/60 space-y-1">
            <div className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-emerald-400" /> Powered by Claude Sonnet 4 with enterprise guardrails</div>
            <div className="flex items-center gap-1.5"><ScanLine className="size-3 text-amber-400" /> Mistral OCR for documents, scans & handwriting</div>
            <div className="flex items-center gap-1.5"><Shield className="size-3 text-sky-400" /> Role-based access · audit-logged · FINMA-aligned</div>
          </div>
          <Button type="submit" disabled={busy} className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold">
            <LogIn className="size-4 mr-1.5" /> {busy ? "Activating…" : "Activate Digital Twin"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}


/* ------------------------------------------------------- Twin Panel -- */
type Turn = {
  q: string;
  a: string;
  reasoning?: string;
  conf: number;
  sources?: string[];
  next_step?: string;
  needs_escalation?: boolean;
  pending?: boolean;
};

function TwinPanel({ channel, onOpenSettings }: { channel: Channel; onOpenSettings: () => void }) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<{ name: string; size: string; summary?: string; status: "processing" | "ready" | "failed" }[]>([]);
  const endRef = useRef<HTMLDivElement>(null);
  const threadId = useMemo(() => `thread-${channel.id}`, [channel.id]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [turns.length]);

  const ask = async (q: string) => {
    if (busy) return;
    setBusy(true);
    setInput("");
    setTurns((t) => [...t, { q, a: "", conf: 0, pending: true }]);

    // log the question
    await supabase.from("chat_messages").insert({
      channel_id: channel.id, thread_id: threadId,
      author_name: "You", author_color: "bg-emerald-500", body: q, kind: "twin",
    });

    try {
      const res = await callSenseAI("ask", { question: q, thread_id: threadId });
      const newTurn: Turn = {
        q,
        a: res.answer ?? "(no answer)",
        reasoning: res.reasoning,
        conf: typeof res.confidence === "number" ? res.confidence : 0.5,
        sources: res.sources ?? [],
        next_step: res.next_step,
        needs_escalation: res.needs_escalation,
      };
      setTurns((t) => [...t.slice(0, -1), newTurn]);

      await supabase.from("chat_messages").insert({
        channel_id: channel.id, thread_id: threadId,
        author_name: "SIX Sense", author_color: "bg-amber-500",
        body: newTurn.a, kind: "twin",
        confidence: newTurn.conf, sources: newTurn.sources ?? null,
      });
    } catch (e: any) {
      const msg = e?.message ?? "AI error";
      const friendly =
        msg === "RATE_LIMIT" ? "Rate limit reached — please wait a moment." :
        msg === "PAYMENT_REQUIRED" ? "AI credits exhausted — top up Lovable AI." :
        msg;
      toast.error(friendly);
      setTurns((t) => [...t.slice(0, -1), { q, a: friendly, conf: 0, needs_escalation: true }]);
    } finally {
      setBusy(false);
    }
  };

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files ?? []);
    if (!list.length) return;
    e.target.value = "";

    for (const f of list) {
      const entry = { name: f.name, size: (f.size / 1024).toFixed(1) + " KB", status: "processing" as const };
      setFiles((s) => [entry, ...s]);
      try {
        const b64 = await fileToBase64(f);
        const res = await callSenseAI("ingest", {
          name: f.name, mime: f.type || "application/octet-stream", base64: b64,
        });
        setFiles((s) => s.map((x) => x.name === f.name ? { ...x, status: "ready", summary: res.summary } : x));
        toast.success(`Indexed: ${f.name}`, { description: `${res.chars} chars extracted into the knowledge base.` });
      } catch (err: any) {
        setFiles((s) => s.map((x) => x.name === f.name ? { ...x, status: "failed" } : x));
        toast.error(`Failed: ${f.name}`, { description: err?.message ?? "OCR error" });
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 h-14 border-b border-white/10 flex items-center gap-2">
        <div className="size-7 rounded bg-gradient-to-br from-amber-400 to-orange-500 grid place-items-center"><Sparkles className="size-3.5 text-black" /></div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">SIX Sense · Digital Twin</p>
          <p className="text-[11px] text-white/60 flex items-center gap-1"><span className="size-1.5 rounded-full bg-emerald-400 inline-block" /> Running · #{channel.name}</p>
        </div>
        <button onClick={onOpenSettings} className="size-7 grid place-items-center rounded hover:bg-white/10" title="Settings"><Settings className="size-4" /></button>
      </div>

      <Tabs defaultValue="ask" className="flex-1 flex flex-col min-h-0">
        <TabsList className="bg-transparent rounded-none border-b border-white/10 h-10 px-2 justify-start overflow-x-auto">
          <TabsTrigger value="ask" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70">Ask</TabsTrigger>
          <TabsTrigger value="upload" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70">Upload</TabsTrigger>
          <TabsTrigger value="progress" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70">Progress</TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70">Reports</TabsTrigger>
        </TabsList>

        {/* Ask */}
        <TabsContent value="ask" className="flex-1 flex flex-col min-h-0 m-0">
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              {turns.length === 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] uppercase tracking-wider text-white/50 font-semibold">Try asking</p>
                  {[
                    "Summarise the documents I've uploaded so far",
                    "What's our T+1 cut-off rationale?",
                    "How does CSDR interpretation apply to dual-listed ADRs?",
                  ].map((q) => (
                    <button key={q} onClick={() => ask(q)} className="block w-full text-left text-[13px] p-2.5 rounded border border-white/10 hover:border-amber-400/40 hover:bg-white/5">
                      {q}
                    </button>
                  ))}
                </div>
              )}
              {turns.map((t, i) => (
                <div key={i} className="space-y-2">
                  <div className="text-[13px] bg-white/5 rounded-md px-3 py-2 ml-8">{t.q}</div>
                  <div className="rounded-md border border-white/10 bg-[#222529] p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5 text-[11px] text-white/60">
                        <Sparkles className="size-3 text-amber-400" /> Gemini · governed RAG
                      </div>
                      {!t.pending && (
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${t.conf > 0.85 ? "bg-emerald-500/20 text-emerald-300" : t.conf > 0.6 ? "bg-amber-500/20 text-amber-300" : "bg-rose-500/20 text-rose-300"}`}>
                          {Math.round(t.conf * 100)}% confidence
                        </span>
                      )}
                    </div>
                    {t.pending ? (
                      <div className="flex items-center gap-2 text-[13px] text-white/60"><Loader2 className="size-3.5 animate-spin" /> Thinking…</div>
                    ) : (
                      <>
                        <p className="text-[13px] text-white/90 leading-relaxed whitespace-pre-wrap">{t.a}</p>
                        {t.reasoning && (
                          <p className="mt-2 text-[11px] text-white/55 italic"><strong className="text-white/70 not-italic">Reasoning:</strong> {t.reasoning}</p>
                        )}
                        {t.next_step && (
                          <div className="mt-2 text-[11px] text-sky-300 bg-sky-500/10 border border-sky-500/30 rounded px-2 py-1">
                            <strong>Next step:</strong> {t.next_step}
                          </div>
                        )}
                        {t.needs_escalation && (
                          <div className="mt-2 text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded px-2 py-1 flex items-center gap-1.5">
                            <Shield className="size-3" /> Recommend SME validation
                          </div>
                        )}
                        {t.sources && t.sources.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-white/10 space-y-1">
                            {t.sources.map((s, idx) => (
                              <div key={idx} className="text-[11px] text-white/60 flex items-center gap-1.5"><FileText className="size-3" /> {s}</div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>
          </ScrollArea>
          <form onSubmit={(e) => { e.preventDefault(); if (input.trim()) ask(input.trim()); }} className="border-t border-white/10 p-3 flex gap-2">
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask your Digital Twin…" disabled={busy} className="bg-white/5 border-white/15 text-white placeholder:text-white/40" />
            <Button type="submit" disabled={!input.trim() || busy} className="bg-amber-500 hover:bg-amber-400 text-black">
              {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
            </Button>
          </form>
        </TabsContent>

        {/* Upload */}
        <TabsContent value="upload" className="flex-1 m-0 p-4 space-y-3 overflow-auto">
          <button onClick={() => fileRef.current?.click()} className="w-full rounded-lg border-2 border-dashed border-white/15 hover:border-amber-400/50 hover:bg-white/[0.03] p-8 text-center transition">
            <FileUp className="size-6 mx-auto text-amber-400 mb-2" />
            <p className="text-sm font-medium">Drop PDFs, images, scans or handwritten notes</p>
            <p className="text-[11px] text-white/60 mt-1">Gemini Vision OCR extracts, summarises, embeds and adds to the governed knowledge base.</p>
          </button>
          <input ref={fileRef} type="file" multiple hidden onChange={onUpload} accept="image/*,application/pdf,text/*" />
          {files.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] uppercase tracking-wider text-white/50 font-semibold">Recently added</p>
              {files.map((f, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded border border-white/10 bg-white/[0.03]">
                  <FileText className="size-4 text-amber-400 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] truncate">{f.name}</span>
                      <span className="text-[11px] text-white/50">{f.size}</span>
                    </div>
                    {f.summary && <p className="text-[11px] text-white/60 mt-0.5 line-clamp-2">{f.summary}</p>}
                  </div>
                  {f.status === "processing" && <Loader2 className="size-3.5 animate-spin text-amber-400" />}
                  {f.status === "ready" && <Badge className="bg-emerald-500/20 text-emerald-300 border-0 text-[10px]">Indexed</Badge>}
                  {f.status === "failed" && <Badge className="bg-rose-500/20 text-rose-300 border-0 text-[10px]">Failed</Badge>}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Progress */}
        <TabsContent value="progress" className="flex-1 m-0 overflow-auto">
          <ProgressTab />
        </TabsContent>

        {/* Reports */}
        <TabsContent value="reports" className="flex-1 m-0 overflow-auto">
          <ReportsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ---------------- Progress Tab ---------------- */
type Task = {
  id: string; external_key: string | null; source: string; title: string;
  status: string; progress: number; priority: string | null;
  assignee_name: string; project: string; url: string | null;
};

function ProgressTab() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("project_tasks").select("*").order("updated_at", { ascending: false });
    setTasks((data ?? []) as Task[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const overall = tasks.length ? Math.round(tasks.reduce((s, t) => s + (t.progress || 0), 0) / tasks.length) : 0;
  const counts = {
    todo: tasks.filter((t) => t.status === "todo").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    review: tasks.filter((t) => t.status === "review").length,
    done: tasks.filter((t) => t.status === "done").length,
  };

  const updateProgress = async (id: string, progress: number) => {
    const status = progress >= 100 ? "done" : progress > 0 ? "in_progress" : "todo";
    await supabase.from("project_tasks").update({ progress, status, updated_at: new Date().toISOString() }).eq("id", id);
    setTasks((s) => s.map((t) => t.id === id ? { ...t, progress, status } : t));
  };

  return (
    <div className="p-4 space-y-4">
      {/* Overall */}
      <div className="rounded-lg border border-white/10 bg-gradient-to-br from-emerald-500/10 to-sky-500/10 p-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[12px] uppercase tracking-wider text-white/60 font-semibold flex items-center gap-1.5"><TrendingUp className="size-3.5 text-emerald-400" /> Your portfolio</p>
          <span className="text-[11px] text-white/60">{tasks.length} tickets</span>
        </div>
        <div className="flex items-baseline gap-2 mb-1.5"><span className="text-3xl font-bold">{overall}%</span><span className="text-[11px] text-white/60">average progress</span></div>
        <Progress value={overall} className="h-1.5" />
        <div className="grid grid-cols-4 gap-2 mt-3">
          <Stat label="To do" value={String(counts.todo)} />
          <Stat label="In prog." value={String(counts.in_progress)} />
          <Stat label="Review" value={String(counts.review)} />
          <Stat label="Done" value={String(counts.done)} />
        </div>
      </div>

      {/* Sources */}
      <div className="flex items-center gap-2 text-[11px] text-white/60">
        <Badge className="bg-sky-500/20 text-sky-300 border-0"><GitBranch className="size-2.5 mr-1" /> Jira · synced</Badge>
        <Badge className="bg-violet-500/20 text-violet-300 border-0"><FileText className="size-2.5 mr-1" /> Confluence · synced</Badge>
        <span className="ml-auto">Last sync: just now</span>
      </div>

      {/* Tasks */}
      {loading ? (
        <div className="text-center py-8 text-white/50 text-[12px]"><Loader2 className="size-4 animate-spin mx-auto mb-1" /> Loading…</div>
      ) : (
        <div className="space-y-2">
          {tasks.map((t) => (
            <div key={t.id} className="rounded border border-white/10 bg-white/[0.03] p-2.5 hover:border-white/20 transition">
              <div className="flex items-start gap-2">
                <Badge className={`text-[10px] border-0 ${t.source === "jira" ? "bg-sky-500/20 text-sky-300" : "bg-violet-500/20 text-violet-300"}`}>
                  {t.external_key ?? t.source}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium leading-tight">{t.title}</p>
                  <div className="flex items-center gap-2 text-[10px] text-white/50 mt-0.5">
                    <span>{t.project}</span> · <span className="capitalize">{t.status.replace("_", " ")}</span>
                    {t.priority && <> · <span className="capitalize">{t.priority}</span></>}
                  </div>
                </div>
                {t.url && (
                  <a href={t.url} target="_blank" rel="noreferrer" className="text-white/40 hover:text-white"><ExternalLink className="size-3" /></a>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Progress value={t.progress} className="h-1 flex-1" />
                <span className="text-[10px] text-white/60 w-8 text-right">{t.progress}%</span>
                <input
                  type="range" min={0} max={100} step={5} value={t.progress}
                  onChange={(e) => updateProgress(t.id, Number(e.target.value))}
                  className="w-20 accent-amber-400"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Reports Tab ---------------- */
type ReportRow = {
  id: string; kind: string; title: string; summary: string;
  content: any; created_at: string;
};

function ReportsTab() {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [open, setOpen] = useState<ReportRow | null>(null);

  const load = async () => {
    const { data } = await supabase.from("performance_reports").select("*").order("created_at", { ascending: false });
    setReports((data ?? []) as ReportRow[]);
  };
  useEffect(() => { load(); }, []);

  const generate = async (kind: string, label: string) => {
    setBusy(kind);
    try {
      const params = kind === "performance" ? { employee: "Arjun Singh", period: "Q3 2026" }
        : kind === "onboarding" ? { role: "Post-Trade Operations Analyst", department: "Post-Trade Ops" }
        : kind === "handover" ? { employee: "Arjun Singh" }
        : kind === "return_recap" ? { employee: "Arjun Singh", since: "2 weeks ago" }
        : kind === "offboarding" ? { employee: "Arjun Singh", lastDay: "2026-07-31", role: "Compliance Officer", department: "Compliance" }
        : {};
      const r = await callSenseAI("report", { kind, params });
      toast.success(`${label} generated`);
      setOpen(r);
      load();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="p-4 space-y-3">
      <p className="text-[11px] uppercase tracking-wider text-white/50 font-semibold">Generate document</p>
      <div className="grid grid-cols-2 gap-2">
        {[
          { k: "handover", l: "Handover note", icon: <FileDown className="size-3.5" />, desc: "Before holidays / leave" },
          { k: "return_recap", l: "Return recap", icon: <Activity className="size-3.5" />, desc: "What changed while away" },
          { k: "onboarding", l: "Onboarding pack", icon: <Users className="size-3.5" />, desc: "For new joiners" },
          { k: "performance", l: "Performance metrics", icon: <TrendingUp className="size-3.5" />, desc: "Your delivery & impact" },
          { k: "dashboard", l: "Stakeholder dashboard", icon: <BarChart3 className="size-3.5" />, desc: "For managers & C-level" },
          { k: "offboarding", l: "Offboarding pack", icon: <LogIn className="size-3.5 rotate-180" />, desc: "Full memory dump for successor" },
        ].map((x) => (
          <button
            key={x.k}
            disabled={busy === x.k}
            onClick={() => generate(x.k, x.l)}
            className="text-left p-2.5 rounded border border-white/10 hover:border-amber-400/50 hover:bg-white/5 transition disabled:opacity-50"
          >
            <div className="flex items-center gap-1.5 text-amber-300 mb-0.5">
              {busy === x.k ? <Loader2 className="size-3.5 animate-spin" /> : x.icon}
              <span className="text-[12px] font-semibold">{x.l}</span>
            </div>
            <p className="text-[10px] text-white/55">{x.desc}</p>
          </button>
        ))}
      </div>

      <Separator className="bg-white/10" />
      <p className="text-[11px] uppercase tracking-wider text-white/50 font-semibold">Recent reports</p>
      {reports.length === 0 ? (
        <p className="text-[12px] text-white/50">No reports yet. Generate one above.</p>
      ) : (
        <div className="space-y-1.5">
          {reports.map((r) => (
            <button key={r.id} onClick={() => setOpen(r)} className="w-full text-left p-2.5 rounded border border-white/10 hover:bg-white/5">
              <div className="flex items-center gap-2 mb-0.5">
                <Badge className="bg-white/10 text-white/80 border-0 text-[10px] capitalize">{r.kind.replace("_", " ")}</Badge>
                <span className="text-[12px] font-medium">{r.title}</span>
              </div>
              <p className="text-[11px] text-white/60 line-clamp-2">{r.summary}</p>
            </button>
          ))}
        </div>
      )}

      {/* Report viewer */}
      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-w-2xl bg-[#1a1d29] border-white/10 text-white max-h-[85vh] overflow-hidden flex flex-col">
          {open && (
            <>
              <DialogHeader>
                <Badge className="bg-amber-500/20 text-amber-300 border-0 text-[10px] capitalize w-fit mb-1">{open.kind.replace("_", " ")}</Badge>
                <DialogTitle className="text-white">{open.title}</DialogTitle>
                <DialogDescription className="text-white/60">{open.summary}</DialogDescription>
              </DialogHeader>
              <ScrollArea className="flex-1 -mx-6 px-6">
                <div className="space-y-4 pb-4">
                  {Array.isArray(open.content?.metrics) && open.content.metrics.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {open.content.metrics.map((m: any, i: number) => (
                        <div key={i} className="rounded border border-white/10 bg-white/[0.03] p-2">
                          <p className="text-[10px] text-white/55 uppercase tracking-wider">{m.label}</p>
                          <p className="text-lg font-bold">{m.value}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {Array.isArray(open.content?.sections) && open.content.sections.map((s: any, i: number) => (
                    <section key={i}>
                      <h3 className="text-[13px] font-bold text-amber-300 mb-1">{s.heading}</h3>
                      {s.body && <p className="text-[12px] text-white/85 whitespace-pre-wrap leading-relaxed">{s.body}</p>}
                      {Array.isArray(s.bullets) && (
                        <ul className="list-disc pl-5 text-[12px] text-white/80 mt-1 space-y-0.5">
                          {s.bullets.map((b: string, j: number) => <li key={j}>{b}</li>)}
                        </ul>
                      )}
                    </section>
                  ))}
                  {Array.isArray(open.content?.recipients_suggestion) && open.content.recipients_suggestion.length > 0 && (
                    <div className="border-t border-white/10 pt-3">
                      <p className="text-[11px] text-white/55 uppercase tracking-wider mb-1">Suggested recipients</p>
                      <div className="flex flex-wrap gap-1">
                        {open.content.recipients_suggestion.map((r: string, i: number) => (
                          <Badge key={i} className="bg-sky-500/20 text-sky-300 border-0 text-[10px]">{r}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="flex gap-2 pt-2 border-t border-white/10">
                <Button onClick={() => { navigator.clipboard.writeText(JSON.stringify(open.content, null, 2)); toast.success("Copied to clipboard"); }} variant="outline" className="bg-white/5 border-white/15 text-white hover:bg-white/10">Copy</Button>
                <Button onClick={() => toast.success("Sent to managers", { description: (open.content?.recipients_suggestion ?? []).join(", ") || "Default distribution list" })} className="bg-amber-500 hover:bg-amber-400 text-black ml-auto">
                  Send to stakeholders
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-white/10 bg-white/[0.03] p-2 text-center">
      <p className="text-lg font-bold">{value}</p>
      <p className="text-[10px] text-white/60 uppercase tracking-wider">{label}</p>
    </div>
  );
}

/* ------------------------------------------------------- Settings -- */
function SettingsPanel({ twinActive }: { twinActive: boolean }) {
  const [integrations, setIntegrations] = useState({
    slack: true, teams: false, outlook: false, jira: false, gdrive: false, confluence: false,
  });
  const toggle = (k: keyof typeof integrations) => setIntegrations((s) => ({ ...s, [k]: !s[k] }));

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 h-14 border-b border-white/10 flex items-center gap-2">
        <Settings className="size-4 text-white/70" />
        <p className="font-semibold">Settings</p>
      </div>
      <Tabs defaultValue="integrations" className="flex-1 flex flex-col min-h-0">
        <TabsList className="bg-transparent rounded-none border-b border-white/10 h-10 px-2 justify-start">
          <TabsTrigger value="integrations" className="data-[state=active]:bg-white/10 text-white/70">Integrations</TabsTrigger>
          <TabsTrigger value="knowledge" className="data-[state=active]:bg-white/10 text-white/70">Knowledge bases</TabsTrigger>
          <TabsTrigger value="models" className="data-[state=active]:bg-white/10 text-white/70">Models & security</TabsTrigger>
          <TabsTrigger value="account" className="data-[state=active]:bg-white/10 text-white/70">Account</TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <TabsContent value="integrations" className="p-5 space-y-2 m-0">
            <p className="text-[12px] text-white/60 mb-2">Connect the communication and productivity tools you already use. SIX Sense ingests in the background — nothing leaves the SIX security perimeter.</p>
            <IntegrationRow icon={<HashIcon className="size-4 text-violet-400" />} name="Slack" desc="Channels, threads & DMs" on={integrations.slack} toggle={() => toggle("slack")} />
            <IntegrationRow icon={<MessageSquare className="size-4 text-sky-400" />} name="Microsoft Teams" desc="Chats, channels & meetings" on={integrations.teams} toggle={() => toggle("teams")} />
            <IntegrationRow icon={<Mail className="size-4 text-blue-400" />} name="Outlook" desc="Email & calendar context" on={integrations.outlook} toggle={() => toggle("outlook")} />
            <IntegrationRow icon={<ListIcon className="size-4 text-emerald-400" />} name="Jira" desc="Tickets, projects & sprints" on={integrations.jira} toggle={() => toggle("jira")} />
            <IntegrationRow icon={<Database className="size-4 text-amber-400" />} name="Google Drive" desc="Shared docs & decks" on={integrations.gdrive} toggle={() => toggle("gdrive")} />
            <IntegrationRow icon={<FileText className="size-4 text-rose-400" />} name="Confluence" desc="Wikis & runbooks" on={integrations.confluence} toggle={() => toggle("confluence")} />
          </TabsContent>

          <TabsContent value="knowledge" className="p-5 space-y-4 m-0">
            <Section title="Personal knowledge base" desc="Memories, decisions and documents you have contributed.">
              <div className="grid grid-cols-3 gap-2">
                <Stat label="Memories" value="247" />
                <Stat label="Decisions" value="38" />
                <Stat label="Documents" value="61" />
              </div>
            </Section>
            <Section title="Department knowledge bases" desc="Based on your role-based access control (RBAC) permissions.">
              {[
                { d: "Post-Trade Operations", scope: "Read · Write", count: "12,431 memories" },
                { d: "Compliance", scope: "Read", count: "8,902 memories" },
                { d: "Digital Assets", scope: "Read (restricted)", count: "3,108 memories" },
                { d: "Legal", scope: "No access", count: "—", locked: true },
              ].map((x) => (
                <div key={x.d} className="flex items-center gap-2 p-2.5 rounded border border-white/10 mb-1.5">
                  <Building2 className="size-4 text-white/60" />
                  <div className="flex-1">
                    <p className="text-[13px] font-medium">{x.d}</p>
                    <p className="text-[11px] text-white/60">{x.scope} · {x.count}</p>
                  </div>
                  {x.locked ? <Lock className="size-4 text-white/40" /> : <Check className="size-4 text-emerald-400" />}
                </div>
              ))}
            </Section>
            <Section title="Organizational twin" desc="Aggregate intelligence across SIX Group. Executive access only.">
              <div className="rounded border border-white/10 p-3 text-[12px] text-white/60 flex items-center gap-2">
                <Lock className="size-4" /> Visible to executives & department heads.
              </div>
            </Section>
          </TabsContent>

          <TabsContent value="models" className="p-5 space-y-4 m-0">
            <Section title="AI models" desc="Hardened, audited and routed inside the SIX perimeter.">
              <ModelRow name="Claude Sonnet 4" use="Reasoning, retrieval & answer synthesis" badge="Primary" />
              <ModelRow name="Mistral OCR" use="Documents, scans, handwriting → structured text" badge="OCR" />
            </Section>
            <Section title="Security guardrails" desc="Always-on safety net for every query and ingestion.">
              <Guard label="PII & client data redaction" />
              <Guard label="Confidence threshold (≥ 60% to answer)" />
              <Guard label="Human escalation on low confidence" />
              <Guard label="Full audit log · FINMA-aligned retention" />
              <Guard label="Role-based access control (RBAC)" />
              <Guard label="Department & sensitivity classification" />
            </Section>
          </TabsContent>

          <TabsContent value="account" className="p-5 space-y-3 m-0">
            <div className="flex items-center gap-3 p-3 rounded border border-white/10">
              <div className="size-10 rounded-full bg-emerald-500 grid place-items-center font-bold text-black">AS</div>
              <div>
                <p className="font-semibold text-sm">Arjun Singh</p>
                <p className="text-[12px] text-white/60">arjun.sharma@six-group.com</p>
                <p className="text-[11px] text-white/50">Compliance Officer · Zurich</p>
              </div>
            </div>
            <div className="rounded border border-white/10 p-3 text-[12px] text-white/70 flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-400" />
              Digital Twin {twinActive ? "active" : "inactive"} · last sync just now
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}

function IntegrationRow({ icon, name, desc, on, toggle }: { icon: React.ReactNode; name: string; desc: string; on: boolean; toggle: () => void }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded border border-white/10">
      <div className="size-8 rounded bg-white/5 grid place-items-center">{icon}</div>
      <div className="flex-1">
        <p className="text-[13px] font-medium">{name}</p>
        <p className="text-[11px] text-white/60">{desc}</p>
      </div>
      {on && <Badge className="bg-emerald-500/20 text-emerald-300 border-0 text-[10px] mr-1">Connected</Badge>}
      <Switch checked={on} onCheckedChange={toggle} />
    </div>
  );
}
function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[13px] font-semibold">{title}</p>
      {desc && <p className="text-[11px] text-white/60 mb-2">{desc}</p>}
      {children}
    </div>
  );
}
function ModelRow({ name, use, badge }: { name: string; use: string; badge: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded border border-white/10 mb-1.5">
      <Brain className="size-4 text-amber-400" />
      <div className="flex-1">
        <p className="text-[13px] font-medium">{name}</p>
        <p className="text-[11px] text-white/60">{use}</p>
      </div>
      <Badge className="bg-amber-500/20 text-amber-300 border-0 text-[10px]">{badge}</Badge>
    </div>
  );
}
function Guard({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 p-2 rounded border border-white/10 mb-1 text-[12px]">
      <ShieldCheck className="size-3.5 text-emerald-400" /> {label}
    </div>
  );
}

/* ============================================================ DEMO DATA ==== */
type PeopleRow = {
  id: string; name: string; role: string; department: string; email: string;
  initials: string; color: string; status: "active" | "away" | "offline"; tz: string;
  bio: string; tenure: string; manager?: string;
  files: { name: string; kind: string; size: string; ago: string }[];
  activity: { ts: string; kind: "decision" | "doc" | "ticket" | "meeting" | "message"; text: string }[];
  dm: { id: string; from: "me" | "them"; ts: string; body: string }[];
};

const people: Record<string, PeopleRow> = {
  me: {
    id: "me", name: "Arjun Singh", role: "Compliance Officer", department: "Compliance",
    email: "arjun.sharma@six-group.com", initials: "AS", color: "bg-emerald-500",
    status: "active", tz: "Zurich · GMT+1", tenure: "2y 4m", manager: "Lukas Brunner",
    bio: "Compliance officer focused on CSDR, T+1 settlement risk and digital-asset custody policy. SIX Sense power user.",
    files: [
      { name: "CSDR_Interpretation_Memo_v3.pdf", kind: "PDF", size: "412 KB", ago: "2h" },
      { name: "T1_Risk_Register.xlsx", kind: "XLSX", size: "88 KB", ago: "yesterday" },
      { name: "FINMA_Q3_response.docx", kind: "DOCX", size: "61 KB", ago: "3d" },
    ],
    activity: [
      { ts: "10:42 AM", kind: "decision", text: "Approved APAC cut-off override for tier-1 custody clients" },
      { ts: "9:15 AM", kind: "doc", text: "Uploaded CSDR_Interpretation_Memo_v3.pdf to SIX Sense" },
      { ts: "Yesterday", kind: "ticket", text: "Closed SIX-218 — penalty framework dual-listing clarification" },
      { ts: "Yesterday", kind: "meeting", text: "Reviewed T+1 risk register with Anja Müller (45m)" },
      { ts: "Mon", kind: "message", text: "Answered 12 questions in #compliance via SIX Sense" },
    ],
    dm: [],
  },
  anja: {
    id: "anja", name: "Anja Müller", role: "Head of Post-Trade", department: "Securities Services",
    email: "anja.mueller@six-group.com", initials: "AM", color: "bg-rose-500",
    status: "active", tz: "Zurich · GMT+1", tenure: "11y", manager: "Stefan Berger",
    bio: "Owns end-to-end Post-Trade. Authority on the T+1 migration and FINMA settlement rules. SPOF risk: 47 knowledge cards.",
    files: [
      { name: "T1_Migration_Memo_v3.pdf", kind: "PDF", size: "1.2 MB", ago: "1d" },
      { name: "Nostro_Funding_Buffer.xlsx", kind: "XLSX", size: "204 KB", ago: "3d" },
    ],
    activity: [
      { ts: "11:08 AM", kind: "decision", text: "Signed off 14:00 CET cut-off for T+1 migration" },
      { ts: "9:30 AM", kind: "meeting", text: "FINMA quarterly review (90m)" },
      { ts: "Yesterday", kind: "doc", text: "Revised Nostro Funding Buffer Policy to v2" },
    ],
    dm: [
      { id: "d1", from: "them", ts: "10:14 AM", body: "Hey Arjun — can you take a look at the CSDR section in the memo?" },
      { id: "d2", from: "me", ts: "10:16 AM", body: "On it. Pulling the latest interpretation from SIX Sense now." },
      { id: "d3", from: "them", ts: "10:18 AM", body: "Thx. Need it before the FINMA call at 2pm." },
    ],
  },
  lukas: {
    id: "lukas", name: "Lukas Brunner", role: "Senior Compliance Counsel", department: "Compliance",
    email: "lukas.brunner@six-group.com", initials: "LB", color: "bg-amber-500",
    status: "away", tz: "Zurich · GMT+1", tenure: "8y", manager: "Head of Legal",
    bio: "Lead counsel on CSDR and FINMA matters. Validates governed knowledge cards in Compliance.",
    files: [
      { name: "Counsel_Opinion_CSDR_2024-09.pdf", kind: "PDF", size: "320 KB", ago: "1w" },
    ],
    activity: [
      { ts: "Yesterday", kind: "decision", text: "Validated kc-002 — CSDR Penalty Framework interpretation" },
      { ts: "2d", kind: "doc", text: "Reviewed 3 incoming knowledge cards from #compliance" },
    ],
    dm: [
      { id: "d1", from: "them", ts: "Yesterday", body: "Pls review kc-002 when you have a moment." },
      { id: "d2", from: "me", ts: "Yesterday", body: "Validated. Pushed to #compliance." },
    ],
  },
};

/* ============================================================ Profile Sheet */
function ProfileSheet({ who, onOpenDM }: { who: string; onOpenDM: (id: string) => void }) {
  const p = people[who] ?? people.me;
  const [tab, setTab] = useState<"about" | "files" | "activity">("about");
  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-5 pb-4 border-b border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent">
        <div className="flex items-start gap-3">
          <div className={`size-14 rounded-lg ${p.color} grid place-items-center text-lg font-bold text-black/80`}>{p.initials}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-bold text-base">{p.name}</p>
              <span className={`size-2 rounded-full ${p.status === "active" ? "bg-emerald-400" : p.status === "away" ? "bg-amber-400" : "bg-white/30"}`} />
              <span className="text-[11px] text-white/60 capitalize">{p.status}</span>
            </div>
            <p className="text-[12px] text-white/70">{p.role} · {p.department}</p>
            <p className="text-[11px] text-white/50 mt-0.5">{p.email}</p>
          </div>
        </div>
        {p.id !== "me" && (
          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={() => onOpenDM(p.id)} className="bg-[#007a5a] hover:bg-[#008a66] text-white h-8"><MessageSquare className="size-3.5 mr-1" /> Message</Button>
            <Button size="sm" variant="outline" className="bg-white/5 border-white/15 text-white hover:bg-white/10 h-8"><Video className="size-3.5 mr-1" /> Huddle</Button>
          </div>
        )}
      </div>
      <div className="px-5 border-b border-white/10 flex gap-5 text-[13px]">
        {(["about", "files", "activity"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`h-9 border-b-2 capitalize ${tab === t ? "border-amber-400 text-white" : "border-transparent text-white/60 hover:text-white"}`}>{t}</button>
        ))}
      </div>
      <ScrollArea className="flex-1">
        {tab === "about" && (
          <div className="p-5 space-y-3 text-[13px]">
            <p className="text-white/85 leading-relaxed">{p.bio}</p>
            <Separator className="bg-white/10" />
            <Row k="Time zone" v={p.tz} />
            <Row k="Tenure" v={p.tenure} />
            {p.manager && <Row k="Manager" v={p.manager} />}
            <Row k="SIX Sense" v={<Badge className="bg-emerald-500/20 text-emerald-300 border-0 text-[10px]">Twin active</Badge>} />
          </div>
        )}
        {tab === "files" && (
          <div className="p-5 space-y-2">
            {p.files.map((f, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded border border-white/10 hover:bg-white/[0.04]">
                <div className="size-9 rounded bg-amber-500/15 grid place-items-center"><FileText className="size-4 text-amber-300" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate">{f.name}</p>
                  <p className="text-[11px] text-white/50">{f.kind} · {f.size} · {f.ago}</p>
                </div>
                <button className="text-white/50 hover:text-white"><FileDown className="size-4" /></button>
              </div>
            ))}
          </div>
        )}
        {tab === "activity" && (
          <div className="p-5 space-y-3">
            {p.activity.map((a, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`size-2.5 rounded-full mt-1.5 ${a.kind === "decision" ? "bg-amber-400" : a.kind === "doc" ? "bg-sky-400" : a.kind === "ticket" ? "bg-violet-400" : a.kind === "meeting" ? "bg-emerald-400" : "bg-white/40"}`} />
                  {i < p.activity.length - 1 && <div className="w-px flex-1 bg-white/10 my-1" />}
                </div>
                <div className="flex-1 pb-3">
                  <p className="text-[11px] text-white/50">{a.ts} · <span className="capitalize">{a.kind}</span></p>
                  <p className="text-[13px] text-white/85">{a.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return <div className="flex items-center justify-between"><span className="text-white/55">{k}</span><span className="text-white/90">{v}</span></div>;
}

/* ============================================================ DM Sheet ==== */
function DMSheet({ dmId, onOpenProfile }: { dmId: string; onOpenProfile: () => void }) {
  const p = people[dmId] ?? people.anja;
  const [msgs, setMsgs] = useState(p.dm);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs.length]);

  const send = () => {
    if (!text.trim()) return;
    setMsgs((s) => [...s, { id: String(Date.now()), from: "me", ts: "now", body: text.trim() }]);
    setText("");
    setTimeout(() => {
      setMsgs((s) => [...s, { id: String(Date.now() + 1), from: "them", ts: "now", body: "Got it — will follow up shortly." }]);
    }, 900);
  };

  return (
    <div className="flex flex-col h-full">
      <button onClick={onOpenProfile} className="px-4 h-14 border-b border-white/10 flex items-center gap-3 hover:bg-white/5 text-left">
        <div className={`size-9 rounded-md ${p.color} grid place-items-center text-xs font-bold text-black/80`}>{p.initials}</div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm flex items-center gap-1.5">{p.name} <span className={`size-1.5 rounded-full ${p.status === "active" ? "bg-emerald-400" : "bg-amber-400"}`} /></p>
          <p className="text-[11px] text-white/60 truncate">{p.role} · {p.tz}</p>
        </div>
        <ChevronDown className="size-4 text-white/40" />
      </button>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {msgs.map((m) => (
            <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-lg px-3 py-2 text-[13px] ${m.from === "me" ? "bg-[#007a5a] text-white" : "bg-white/[0.06] text-white/90"}`}>
                <p>{m.body}</p>
                <p className="text-[10px] opacity-60 mt-0.5">{m.ts}</p>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </ScrollArea>
      <form onSubmit={(e) => { e.preventDefault(); send(); }} className="border-t border-white/10 p-3 flex gap-2">
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder={`Message ${p.name.split(" ")[0]}…`} className="bg-white/5 border-white/15 text-white placeholder:text-white/40" />
        <Button type="submit" disabled={!text.trim()} className="bg-[#007a5a] hover:bg-[#008a66] text-white"><Send className="size-3.5" /></Button>
      </form>
    </div>
  );
}

/* ============================================================ Rail Sheets = */
function RailDMsSheet({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="h-14 border-b border-white/10 px-4 flex items-center gap-2"><MessageSquare className="size-4" /><p className="font-semibold">Direct messages</p></div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {Object.values(people).filter((p) => p.id !== "me").map((p) => {
            const last = p.dm[p.dm.length - 1];
            return (
              <button key={p.id} onClick={() => onOpen(p.id)} className="w-full flex items-start gap-3 p-2.5 rounded hover:bg-white/5 text-left">
                <div className={`size-10 rounded-md ${p.color} grid place-items-center text-xs font-bold text-black/80`}>{p.initials}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-[13px] font-semibold truncate">{p.name}</p>
                    <span className="text-[10px] text-white/45">{last?.ts ?? ""}</span>
                  </div>
                  <p className="text-[12px] text-white/55 truncate">{last?.body ?? p.role}</p>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

function RailActivitySheet() {
  const all = Object.values(people).flatMap((p) => p.activity.map((a) => ({ ...a, who: p.name, color: p.color, initials: p.initials })));
  return (
    <div className="flex flex-col h-full">
      <div className="h-14 border-b border-white/10 px-4 flex items-center gap-2"><Activity className="size-4" /><p className="font-semibold">Activity</p></div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {all.map((a, i) => (
            <div key={i} className="flex gap-3 p-2.5 rounded hover:bg-white/5">
              <div className={`size-8 rounded ${a.color} grid place-items-center text-[10px] font-bold text-black/80`}>{a.initials}</div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px]"><span className="font-semibold">{a.who}</span> · <span className="capitalize text-white/60">{a.kind}</span></p>
                <p className="text-[12px] text-white/80">{a.text}</p>
                <p className="text-[10px] text-white/45 mt-0.5">{a.ts}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function RailFilesSheet() {
  const all = Object.values(people).flatMap((p) => p.files.map((f) => ({ ...f, who: p.name, color: p.color })));
  return (
    <div className="flex flex-col h-full">
      <div className="h-14 border-b border-white/10 px-4 flex items-center gap-2"><FileText className="size-4" /><p className="font-semibold">All files</p></div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1.5">
          {all.map((f, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 rounded border border-white/10 hover:bg-white/[0.04]">
              <div className="size-9 rounded bg-amber-500/15 grid place-items-center"><FileText className="size-4 text-amber-300" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium truncate">{f.name}</p>
                <p className="text-[11px] text-white/55">{f.who} · {f.kind} · {f.size} · {f.ago}</p>
              </div>
              <button className="text-white/50 hover:text-white"><FileDown className="size-4" /></button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

/* ============================================================ Channel Tabs */
function CanvasView({ channelName }: { channelName: string }) {
  return (
    <div className="px-8 py-6 max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-2 text-[11px] text-white/50 uppercase tracking-wider">
        <Layout className="size-3.5" /> Canvas · #{channelName}
      </div>
      <h1 className="text-2xl font-bold">T+1 Migration · Living Brief</h1>
      <p className="text-[13px] text-white/55">Last edited by Anja Müller · 2h ago · 4 contributors</p>
      <Separator className="bg-white/10" />
      <section className="space-y-2">
        <h2 className="text-[15px] font-bold text-amber-300">Where we are</h2>
        <p className="text-[14px] text-white/85 leading-relaxed">FINMA signed off on the 14:00 CET cut-off. APAC fallback window is in pilot with two tier-1 clients. Reconciliation cluster scaled to 12 nodes — throughput holding at 2.4M instructions/day.</p>
      </section>
      <section className="space-y-2">
        <h2 className="text-[15px] font-bold text-amber-300">Open decisions</h2>
        <ul className="list-disc pl-5 text-[14px] text-white/85 space-y-1">
          <li>Whether to extend pre-funding to CHF & EUR nostros (Treasury reviewing)</li>
          <li>Final go-live date for Asia-Pacific override (proposed: 2026-07-01)</li>
          <li>SLA wording for partial-fill scenarios — Legal needed</li>
        </ul>
      </section>
      <section className="space-y-2">
        <h2 className="text-[15px] font-bold text-amber-300">Owners</h2>
        <div className="grid grid-cols-2 gap-2">
          {[{ n: "Anja Müller", r: "Post-Trade lead" }, { n: "Lukas Brunner", r: "Compliance review" }, { n: "Arjun Singh", r: "Risk register" }, { n: "Thomas Keller", r: "Reconciliation eng" }].map((x) => (
            <div key={x.n} className="rounded border border-white/10 p-2.5 text-[12px]"><p className="font-semibold">{x.n}</p><p className="text-white/55">{x.r}</p></div>
          ))}
        </div>
      </section>
    </div>
  );
}

function FilesView({ channelName }: { channelName: string }) {
  const items = [
    { n: "T1_Migration_Memo_v3.pdf", who: "Anja Müller", size: "1.2 MB", ago: "1d", kind: "PDF" },
    { n: "CSDR_Interpretation_Memo_v3.pdf", who: "Arjun Singh", size: "412 KB", ago: "2h", kind: "PDF" },
    { n: "Reconciliation_Cluster_Runbook.md", who: "Thomas Keller", size: "24 KB", ago: "3d", kind: "MD" },
    { n: "Q3_FINMA_response.docx", who: "Lukas Brunner", size: "61 KB", ago: "1w", kind: "DOCX" },
    { n: "Nostro_Funding_Buffer.xlsx", who: "Anja Müller", size: "204 KB", ago: "3d", kind: "XLSX" },
  ];
  return (
    <div className="px-6 py-5 space-y-3">
      <p className="text-[11px] text-white/50 uppercase tracking-wider">Files in #{channelName}</p>
      {items.map((f, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded border border-white/10 hover:bg-white/[0.04]">
          <div className="size-10 rounded bg-amber-500/15 grid place-items-center"><FileText className="size-5 text-amber-300" /></div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium truncate">{f.n}</p>
            <p className="text-[11px] text-white/55">{f.who} · {f.kind} · {f.size} · {f.ago}</p>
          </div>
          <button className="text-white/50 hover:text-white p-1.5 rounded hover:bg-white/10"><FileDown className="size-4" /></button>
        </div>
      ))}
    </div>
  );
}

function BookmarksView({ channelName }: { channelName: string }) {
  const items = [
    { t: "FINMA T+1 official guidance", u: "intra.six-group.com/finma/t-plus-one", who: "Lukas Brunner" },
    { t: "Reconciliation throughput dashboard", u: "grafana.six-group.com/d/recon", who: "Thomas Keller" },
    { t: "CSDR penalty calculator", u: "intra.six-group.com/csdr/calc", who: "Arjun Singh" },
  ];
  return (
    <div className="px-6 py-5 space-y-3">
      <p className="text-[11px] text-white/50 uppercase tracking-wider">Bookmarks in #{channelName}</p>
      {items.map((b, i) => (
        <a key={i} href="#" className="flex items-center gap-3 p-3 rounded border border-white/10 hover:bg-white/[0.04]">
          <Bookmark className="size-4 text-amber-300 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium">{b.t}</p>
            <p className="text-[11px] text-[#69b7e8] truncate">{b.u}</p>
            <p className="text-[10px] text-white/45 mt-0.5">Saved by {b.who}</p>
          </div>
          <ExternalLink className="size-3.5 text-white/40" />
        </a>
      ))}
    </div>
  );
}
