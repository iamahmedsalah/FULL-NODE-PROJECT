import { Link, useNavigate } from "react-router-dom";
import { LogOut, Terminal, Key, LayoutGrid, Copy, Check } from "lucide-react";
import useAuthStore from "../stores/authStore";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const apiKey = user?.apiKey || user?.api_key || user?.data?.apiKey || "—";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between px-7 h-14
                    bg-bg/90 backdrop-blur-md border-b border-bdr"
    >
      <Link
        to="/dashboard"
        className="flex items-center gap-2 font-mono font-semibold
                                       text-accent text-base tracking-tight"
      >
        <Terminal size={17} />
        Logizy
      </Link>

      {user && (
        <div className="flex items-center gap-3">
          {/* API key chip */}
          <div
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-bg2 border border-bdr
                          rounded-full cursor-pointer group transition-colors hover:border-accent2"
            onClick={() => setRevealed((r) => !r)}
          >
            <Key size={11} className="text-accent" />
            <span className="font-mono text-[10px] font-bold text-accent tracking-widest">
              API KEY
            </span>
            <span className="font-mono text-[10px] text-muted max-w-45 truncate">
              {revealed ? apiKey : "••••••••••••••••"}
            </span>
            {revealed && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy();
                }}
                className="ml-1 text-muted2 hover:text-accent transition-colors"
              >
                {copied ? (
                  <Check size={11} className="text-green-400" />
                ) : (
                  <Copy size={11} />
                )}
              </button>
            )}
          </div>

          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 text-muted text-[13px]
                           font-semibold rounded-lg hover:text-white hover:bg-bg2 transition-colors"
          >
            <LayoutGrid size={14} /> Apps
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-muted text-[13px]
                             font-semibold rounded-lg hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      )}
    </nav>
  );
}
