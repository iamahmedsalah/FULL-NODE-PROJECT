import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Terminal,
  X,
  KeyRound,
  Copy,
  Check,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import useAuthStore from "../stores/authStore";

export default function AppChrome() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const apiKey = user?.apiKey || "";

  const onLogout = async () => {
    await logout();
    navigate("/login");
  };

  const copyApiKey = async () => {
    if (!apiKey) return;
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="min-h-screen">
      <header className="lg:hidden sticky top-0 z-40 h-14 px-4 border-b border-bdr bg-bg/92 backdrop-blur-md flex items-center justify-between">
        <button onClick={() => setOpen(true)} className="w-9 h-9 rounded-lg border border-bdr flex items-center justify-center text-muted hover:text-white hover:bg-bg2">
          <Menu size={16} />
        </button>
        <span className="inline-flex items-center gap-2 font-mono text-accent font-semibold">
          <Terminal size={16} />
          Logizy
        </span>
        <button onClick={onLogout} className="text-[12px] text-muted hover:text-red-300">Logout</button>
      </header>

      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-64 border-r border-bdr bg-bg1/95 backdrop-blur-md flex-col p-4">
        <Brand />
        <nav className="mt-6 flex flex-col gap-2">
          <Item to="/dashboard" icon={<LayoutDashboard size={15} />} label="Dashboard" />
        </nav>
        <ApiKeyCard
          apiKey={apiKey}
          revealed={revealed}
          copied={copied}
          onToggle={() => setRevealed((v) => !v)}
          onCopy={copyApiKey}
        />
        <button onClick={onLogout} className="mt-auto w-full inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/25 bg-red-500/8 px-3 py-2 text-sm text-red-300 hover:bg-red-500/15">
          <LogOut size={14} />
          Logout
        </button>
      </aside>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-50 bg-black/60"
            onClick={() => setOpen(false)}
          >
            <motion.aside
              initial={{ x: -220 }}
              animate={{ x: 0 }}
              exit={{ x: -220 }}
              transition={{ duration: 0.2 }}
              className="h-full w-64 border-r border-bdr bg-bg1 p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <Brand compact />
                <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-lg border border-bdr flex items-center justify-center text-muted hover:text-white">
                  <X size={14} />
                </button>
              </div>
              <nav className="mt-6 flex flex-col gap-2">
                <Item to="/dashboard" icon={<LayoutDashboard size={15} />} label="Dashboard" onClick={() => setOpen(false)} />
              </nav>
              <ApiKeyCard
                apiKey={apiKey}
                revealed={revealed}
                copied={copied}
                onToggle={() => setRevealed((v) => !v)}
                onCopy={copyApiKey}
              />
              <button onClick={onLogout} className="mt-auto w-full inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/25 bg-red-500/8 px-3 py-2 text-sm text-red-300 hover:bg-red-500/15">
                <LogOut size={14} />
                Logout
              </button>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="lg:ml-64">
        <Outlet />
      </main>
    </div>
  );
}

function Brand({ compact }) {
  return (
    <div className={`inline-flex items-center gap-2 font-mono font-semibold text-accent ${compact ? "text-base" : "text-lg"}`}>
      <Terminal size={compact ? 16 : 18} />
      Logizy
    </div>
  );
}

function Item({ to, icon, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm border transition ${
          isActive
            ? "border-accent/45 bg-accent/8 text-accent"
            : "border-bdr text-muted hover:text-white hover:border-bdr2"
        }`
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}

function ApiKeyCard({ apiKey, revealed, copied, onToggle, onCopy }) {
  return (
    <div className="mt-5 rounded-lg border border-bdr bg-bg2/45 p-3">
      <button onClick={onToggle} className="w-full inline-flex items-center justify-between text-[11px] text-muted">
        <span className="inline-flex items-center gap-1.5"><KeyRound size={12} /> API KEY</span>
        <span>{revealed ? "Hide" : "Show"}</span>
      </button>
      <div className="mt-2 flex items-center gap-2">
        <code className="flex-1 truncate rounded bg-bg3 px-2 py-1 text-[11px] text-accent">
          {revealed ? apiKey || "No API key" : "****************"}
        </code>
        <button onClick={onCopy} className="w-7 h-7 rounded border border-bdr flex items-center justify-center text-muted hover:text-accent">
          {copied ? <Check size={12} className="text-emerald-300" /> : <Copy size={12} />}
        </button>
      </div>
    </div>
  );
}
