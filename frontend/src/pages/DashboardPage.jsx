import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Trash2,
  AppWindow,
  X,
  ChevronRight,
  Clock,
  Hash,
  UserRound,
  CircleAlert,
  Boxes,
  BadgeCheck,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import useAppStore from "../stores/appStore";
import useAuthStore from "../stores/authStore";

export default function DashboardPage() {
  const { apps, fetchApps, createApp, deleteApp, loading, error, clearError } = useAppStore();
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");
  const [touched, setTouched] = useState({ name: false, desc: false });

  useEffect(() => {
    fetchApps();
  }, []);

  const userName = user?.username || user?.name || "Developer";

  const createFieldErrors = useMemo(() => {
    const name = newName.trim();
    const desc = newDesc.trim();
    const result = { name: "", desc: "" };

    if (!name) result.name = "Application name is required.";
    else if (name.length < 3) result.name = "Application name must be at least 3 characters.";
    else if (/\s/.test(name)) result.name = "Application name must not contain spaces.";

    if (!desc) result.desc = "Description is required.";
    else if (desc.length < 10) result.desc = "Description must be at least 10 characters.";

    return result;
  }, [newName, newDesc]);

  const hasCreateErrors = Boolean(createFieldErrors.name || createFieldErrors.desc);

  const handleCreate = async (e) => {
    e.preventDefault();
    setTouched({ name: true, desc: true });

    if (hasCreateErrors) {
      setFormError("Please fix the highlighted fields.");
      return;
    }

    setCreating(true);
    const res = await createApp(newName.trim(), newDesc.trim());
    setCreating(false);

    if (res.success) {
      setShowModal(false);
      setNewName("");
      setNewDesc("");
      setFormError("");
    }
  };

  const handleDelete = async (e, name) => {
    e.stopPropagation();
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(name);
    await deleteApp(name);
    setDeleting(null);
  };

  const subtitle = useMemo(
    () => `${apps.length} application${apps.length !== 1 ? "s" : ""} under monitoring`,
    [apps.length]
  );

  return (
    <motion.div
      className="max-w-6xl mx-auto px-4 md:px-7 py-7 md:py-9 relative"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-[1.55rem] md:text-[1.75rem] font-extrabold text-white leading-tight flex items-center gap-2 flex-wrap break-words">
            <UserRound size={22} className="text-accent" />
            Welcome back,
            <span className="text-accent inline-flex items-center gap-1">
              {userName}
              <BadgeCheck size={16} />
            </span>
          </h1>
          <p className="text-[13px] text-muted mt-1">{subtitle}</p>
        </div>

        <motion.button
          onClick={() => {
            clearError?.();
            setFormError("");
            setTouched({ name: false, desc: false });
            setShowModal(true);
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-accent text-black font-bold text-[13px]
                     rounded-lg hover:bg-cyan-300 transition active:scale-[.98] whitespace-nowrap"
          whileTap={{ scale: 0.97 }}
        >
          <Plus size={15} /> New Application
        </motion.button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center justify-between gap-2 bg-red-500/10 border border-red-500/25 text-red-300
                       rounded-lg px-4 py-3 text-[13px] mb-6"
          >
            <span className="inline-flex items-center gap-2">
              <CircleAlert size={14} /> {error}
            </span>
            <button onClick={() => clearError?.()} className="text-red-300 hover:text-red-100">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {loading && apps.length === 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-44 rounded-2xl shimmer border border-bdr" />
          ))}
        </div>
      ) : apps.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-24 text-muted text-center">
          <AppWindow size={48} className="opacity-25" />
          <h3 className="text-[15px] font-semibold text-white">No applications yet</h3>
          <p className="text-[13px]">Create your first app to start collecting logs</p>
          <button
            onClick={() => {
              clearError?.();
              setFormError("");
              setTouched({ name: false, desc: false });
              setShowModal(true);
            }}
            className="flex items-center gap-2 mt-2 px-5 py-2.5 bg-accent text-black font-bold text-[13px]
                       rounded-lg hover:bg-cyan-300 transition"
          >
            <Plus size={14} /> Create Application
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-5">
          {apps.map((app, index) => {
            const name = app.name || app;
            const desc = app.description || "";
            const logCount = app.logCount || app.logs_count || 0;
            const createdAt = app.createdAt || app.created_at;

            return (
              <motion.div
                key={name}
                onClick={() => navigate(`/apps/${name}`)}
                className="bg-bg1 border border-bdr rounded-2xl p-6 cursor-pointer flex flex-col gap-3
                           transition hover:border-accent2 hover:-translate-y-0.5
                           hover:shadow-[0_8px_32px_rgba(0,229,255,.05)] group"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.035, duration: 0.25 }}
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-bg3 border border-bdr2 flex items-center justify-center text-accent">
                    <Boxes size={18} />
                  </div>

                  <button
                    onClick={(e) => handleDelete(e, name)}
                    disabled={deleting === name}
                    className="w-7 h-7 flex items-center justify-center rounded-md text-muted2 hover:text-red-400
                               hover:bg-red-500/10 transition"
                  >
                    {deleting === name ? (
                      <span className="w-3 h-3 border border-white/20 border-t-white rounded-full spin inline-block" />
                    ) : (
                      <Trash2 size={13} />
                    )}
                  </button>
                </div>

                <h3 className="font-mono font-bold text-white text-[15px]">{name}</h3>
                {desc && <p className="text-[12px] text-muted leading-relaxed flex-1">{desc}</p>}

                <div className="flex gap-3 flex-wrap">
                  <span className="flex items-center gap-1 font-mono text-[11px] text-muted2">
                    <Hash size={10} /> {logCount} logs
                  </span>
                  {createdAt && (
                    <span className="flex items-center gap-1 font-mono text-[11px] text-muted2">
                      <Clock size={10} /> {new Date(createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-bdr text-[12px] text-muted2
                                group-hover:text-accent transition-colors">
                  <span>View details</span>
                  <ChevronRight size={13} />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-[440px] bg-bg1 border border-bdr2 rounded-2xl p-7 shadow-[0_32px_80px_rgba(0,0,0,.6)]"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-white text-[17px]">New Application</h2>
                <button onClick={() => setShowModal(false)} className="text-muted hover:text-white transition">
                  <X size={17} />
                </button>
              </div>

              <AnimatePresence>
                {(formError || error) && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-[12px] text-red-300"
                  >
                    <CircleAlert size={14} />
                    <span>{formError || error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleCreate} className="flex flex-col gap-5">
                <Field label="Application Name" error={touched.name ? createFieldErrors.name : ""}>
                  <input
                    type="text"
                    value={newName}
                    onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
                    onChange={(e) => {
                      setFormError("");
                      setNewName(e.target.value);
                    }}
                    placeholder="my-service"
                    required
                    autoFocus
                    className={inputCls + (touched.name && createFieldErrors.name ? " border-red-400/60" : "")}
                  />
                </Field>

                <Field label="Description" error={touched.desc ? createFieldErrors.desc : ""}>
                  <textarea
                    value={newDesc}
                    onBlur={() => setTouched((prev) => ({ ...prev, desc: true }))}
                    onChange={(e) => {
                      setFormError("");
                      setNewDesc(e.target.value);
                    }}
                    placeholder="Describe your project purpose in at least 10 characters"
                    required
                    minLength={10}
                    rows={3}
                    className={inputCls + " resize-none" + (touched.desc && createFieldErrors.desc ? " border-red-400/60" : "")}
                  />
                </Field>

                <div className="flex justify-end gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-bdr2 text-muted text-[13px] font-semibold rounded-lg
                               hover:text-white hover:bg-bg2 transition"
                  >
                    Cancel
                  </button>

                  <motion.button
                    type="submit"
                    disabled={creating}
                    className="flex items-center gap-2 px-5 py-2 bg-accent text-black font-bold text-[13px]
                               rounded-lg hover:bg-cyan-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    whileTap={{ scale: 0.97 }}
                  >
                    {creating ? (
                      <span className="w-3.5 h-3.5 border-2 border-black/20 border-t-black rounded-full spin inline-block" />
                    ) : (
                      "Create"
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const inputCls = `w-full bg-bg2 border border-bdr rounded-lg px-3.5 py-2.5 text-white text-sm
  outline-none transition focus:border-accent2 focus:ring-2 focus:ring-accent2/10
  placeholder:text-muted2`;

function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-muted uppercase tracking-widest">{label}</label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-[11px] text-red-300"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

