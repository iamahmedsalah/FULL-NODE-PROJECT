import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Filter,
  Clock,
  SortDesc,
  BarChart2,
  Table2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Info,
  AlertTriangle,
  RefreshCw,
  Calendar,
  Hash,
  XCircle,
  SlidersHorizontal,
  Pencil,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import useAppStore from "../stores/appStore";
import useLogStore from "../stores/logStore";
import LogsCharts from "../components/LogsCharts";

const LEVELS = {
  INFO: { icon: <Info size={11} />, ring: "text-linfo  bg-linfo/10  border-linfo/25" },
  WARN: { icon: <AlertTriangle size={11} />, ring: "text-lwarn  bg-lwarn/10  border-lwarn/25" },
  ERROR: { icon: <AlertCircle size={11} />, ring: "text-lerror bg-lerror/10 border-lerror/25" },
};

const fmt = (s) => {
  if (!s) return "-";
  const d = new Date(s);
  return isNaN(d)
    ? "-"
    : d.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
};

export default function AppDetailPage() {
  const { name } = useParams();
  const navigate = useNavigate();
  const { currentApp, fetchAppByName, updateApp, error, clearError } = useAppStore();
  const { logs, pagination, filters, loading, fetchLogs, setFilters, setPage, resetLogs } = useLogStore();

  const [tab, setTab] = useState("table");
  const [searchInput, setSearchInput] = useState("");
  const [searchTimer, setSearchTimer] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editError, setEditError] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    fetchAppByName(name);
    resetLogs();
    fetchLogs(name, { page: 1, sort: "recent", level: "", search: "" });
    return () => resetLogs();
  }, [name]);

  const reload = useCallback(() => fetchLogs(name, { page: pagination.page }), [name, pagination.page]);

  const handleSort = (sort) => {
    setFilters({ sort });
    fetchLogs(name, { sort, page: 1 });
  };

  const handleLevel = (level) => {
    const val = filters.level === level ? "" : level;
    setFilters({ level: val });
    fetchLogs(name, { level: val, page: 1 });
  };

  const handleSearch = (val) => {
    setSearchInput(val);
    clearTimeout(searchTimer);
    setSearchTimer(
      setTimeout(() => {
        setFilters({ search: val });
        fetchLogs(name, { search: val, page: 1 });
      }, 360)
    );
  };

  const handlePage = (p) => {
    setPage(p);
    fetchLogs(name, { page: p });
  };

  const clearAllFilters = () => {
    setSearchInput("");
    setFilters({ level: "", search: "", sort: "recent" });
    fetchLogs(name, { level: "", search: "", sort: "recent", page: 1 });
  };

  const totalLogs = currentApp?.logCount || currentApp?.logs_count || pagination.total;
  const hasFilters = Boolean(filters.level || filters.search || filters.sort !== "recent");

  const openEditModal = () => {
    clearError?.();
    setEditError("");
    setEditName(currentApp?.name || name);
    setEditDesc(currentApp?.description || "");
    setShowEditModal(true);
  };

  const handleUpdateApp = async (e) => {
    e.preventDefault();

    const nextName = editName.trim();
    const nextDesc = editDesc.trim();

    if (!nextName || !nextDesc) {
      setEditError("Application name and description are required.");
      return;
    }

    if (nextName.length < 3) {
      setEditError("Application name must be at least 3 characters.");
      return;
    }

    if (/\s/.test(nextName)) {
      setEditError("Application name must not contain spaces.");
      return;
    }

    if (nextDesc.length < 10) {
      setEditError("Description must be at least 10 characters.");
      return;
    }

    setSavingEdit(true);
    const res = await updateApp(name, nextName, nextDesc);
    setSavingEdit(false);

    if (!res.success) {
      setEditError(res.message || "Failed to update app.");
      return;
    }

    setShowEditModal(false);
    const updatedName = res.app?.name || nextName;
    if (updatedName !== name) {
      navigate(`/apps/${updatedName}`);
      return;
    }

    fetchAppByName(updatedName);
  };

  const tabs = useMemo(
    () => [
      ["table", <Table2 size={13} />, "Logs"],
      ["charts", <BarChart2 size={13} />, "Charts"],
    ],
    []
  );

  return (
    <motion.div
      className="max-w-6xl mx-auto px-4 md:px-7 py-7 md:py-9 relative"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-1 w-8 h-8 flex items-center justify-center rounded-lg border border-bdr text-muted
                       hover:text-white hover:bg-bg2 transition"
          >
            <ArrowLeft size={15} />
          </button>
          <div>
            <div className="font-mono text-[11px] text-muted mb-1">
              Applications / <span className="text-accent">{name}</span>
            </div>
            <h1 className="text-[1.75rem] font-extrabold text-white leading-tight">{name}</h1>
            {currentApp?.description && <p className="text-[13px] text-muted mt-1">{currentApp.description}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap pt-1">
          <button
            onClick={openEditModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-bdr text-[11px] font-mono text-muted
                       hover:text-white hover:border-bdr2 hover:bg-bg2 transition"
          >
            <Pencil size={11} />
            Edit
          </button>
          <Pill icon={<Hash size={11} />} label={`${totalLogs || 0} total logs`} />
          {currentApp?.createdAt && (
            <Pill icon={<Calendar size={11} />} label={`Since ${new Date(currentApp.createdAt).toLocaleDateString()}`} />
          )}
        </div>
      </div>

      <div className="flex gap-1 border-b border-bdr mb-6">
        {tabs.map(([id, icon, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-semibold rounded-t-lg -mb-px border-b-2 transition
                        ${
                          tab === id
                            ? "text-accent border-accent"
                            : "text-muted border-transparent hover:text-white"
                        }`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {tab === "charts" ? (
        <LogsCharts logs={logs} />
      ) : (
        <>
          <motion.div
            className="flex items-start gap-3 flex-wrap mb-4 px-3 md:px-4 py-3.5 bg-bg1 border border-bdr rounded-xl"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="relative w-full lg:flex-1 min-w-45">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted2 pointer-events-none" />
              <input
                value={searchInput}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search messages..."
                className="w-full bg-bg2 border border-bdr rounded-lg pl-8 pr-3 py-2 text-sm text-white outline-none
                           transition focus:border-accent2 placeholder:text-muted2"
              />
            </div>

            <div className="w-full lg:w-auto flex items-center gap-2 rounded-lg border border-bdr bg-bg2/40 px-2 py-1.5 overflow-x-auto">
              <span className="flex items-center gap-1 text-[11px] font-bold text-muted uppercase tracking-widest pr-1">
                <Filter size={11} /> Level
              </span>
              {Object.keys(LEVELS).map((lv) => {
                const active = filters.level === lv;
                const cfg = LEVELS[lv];
                return (
                  <motion.button
                    key={lv}
                    onClick={() => handleLevel(lv)}
                    whileTap={{ scale: 0.95 }}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold font-mono rounded-full border transition
                                ${
                                  active
                                    ? `${cfg.ring} shadow-[0_0_0_1px_rgba(0,229,255,.25)]`
                                    : "text-muted border-bdr hover:text-white hover:border-bdr2"
                                }`}
                  >
                    {cfg.icon} {lv}
                  </motion.button>
                );
              })}
            </div>

            <div className="w-full lg:w-auto grid grid-cols-2 lg:flex lg:items-center gap-1.5 rounded-lg border border-bdr bg-bg2/40 px-2 py-1.5">
              <span className="col-span-2 lg:col-span-1 inline-flex items-center gap-1 text-[11px] text-muted font-bold uppercase tracking-widest pr-1">
                <SlidersHorizontal size={11} /> Sort
              </span>
              {[
                ["recent", <Clock size={11} />, "Recent"],
                ["count", <SortDesc size={11} />, "Most Occurred"],
              ].map(([id, icon, label]) => (
                <button
                  key={id}
                  onClick={() => handleSort(id)}
                  className={`flex items-center justify-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold rounded-lg border transition
                              ${
                                filters.sort === id
                                  ? "text-accent border-accent/50 bg-accent/8"
                                  : "text-muted border-bdr bg-bg2 hover:text-white hover:border-bdr2"
                              }`}
                >
                  {icon} {label}
                </button>
              ))}
            </div>

            <button
              onClick={reload}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-bdr text-muted mt-0.5
                         hover:text-white hover:bg-bg2 transition"
            >
              <RefreshCw size={13} className={loading ? "spin" : ""} />
            </button>

            <AnimatePresence>
              {hasFilters && (
                <motion.button
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 6 }}
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5
                             text-[12px] font-semibold text-red-300 hover:bg-red-500/15"
                >
                  <XCircle size={12} /> Clear
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>

          <div className="md:hidden space-y-3">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="rounded-xl border border-bdr p-4">
                  <div className="h-3.5 rounded shimmer w-24 mb-3" />
                  <div className="h-3.5 rounded shimmer w-full mb-2" />
                  <div className="h-3.5 rounded shimmer w-2/3 mb-3" />
                  <div className="h-3.5 rounded shimmer w-40" />
                </div>
              ))
            ) : logs.length === 0 ? (
              <div className="border border-bdr rounded-xl text-center text-muted py-12 text-[13px]">
                No logs found{hasFilters ? " - try clearing filters" : ""}
              </div>
            ) : (
              logs.map((log, i) => {
                const lv = (log.level || "INFO").toUpperCase();
                const cfg = LEVELS[lv] || LEVELS.INFO;
                return (
                  <motion.div
                    key={log._id || log.id || i}
                    className="rounded-xl border border-bdr bg-bg1 p-4"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.018 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-bold font-mono rounded border ${cfg.ring}`}
                      >
                        {cfg.icon} {lv}
                      </span>
                      <span className="inline-block px-2.5 py-0.5 bg-bg3 border border-bdr2 rounded-full font-mono text-[11px] font-semibold text-white">
                        {log.count || 1}
                      </span>
                    </div>
                    <p className="font-mono text-[12px] text-white wrap-break-word mb-2">{log.message}</p>
                    <p className="font-mono text-[11px] text-muted">First: {fmt(log.firstOccurrence || log.first_occurrence || log.createdAt)}</p>
                    <p className="font-mono text-[11px] text-muted">Last: {fmt(log.lastOccurrence || log.last_occurrence || log.updatedAt)}</p>
                  </motion.div>
                );
              })
            )}
          </div>

          <div className="hidden md:block overflow-x-auto border border-bdr rounded-xl">
            <table className="w-full text-[13px] border-collapse">
              <thead>
                <tr className="bg-bg2 border-b border-bdr2">
                  {["Level", "Message", "Count", "First Seen", "Last Seen"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[11px] font-bold text-muted uppercase tracking-widest whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i} className="border-b border-bdr">
                      {[40, 220, 40, 100, 100].map((w, j) => (
                        <td key={j} className="px-4 py-3.5">
                          <div className="h-3.5 rounded shimmer" style={{ width: w }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-muted py-16 text-[13px]">
                      No logs found{hasFilters ? " - try clearing filters" : ""}
                    </td>
                  </tr>
                ) : (
                  logs.map((log, i) => {
                    const lv = (log.level || "INFO").toUpperCase();
                    const cfg = LEVELS[lv] || LEVELS.INFO;
                    return (
                      <motion.tr
                        key={log._id || log.id || i}
                        className="border-b border-bdr last:border-b-0 hover:bg-bg2/60 transition-colors"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.018 }}
                      >
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-bold font-mono rounded border ${cfg.ring}`}
                          >
                            {cfg.icon} {lv}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 max-w-85">
                          <span className="font-mono text-[12px] text-white block truncate">{log.message}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-block px-2.5 py-0.5 bg-bg3 border border-bdr2 rounded-full font-mono text-[11px] font-semibold text-white">
                            {log.count || 1}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-[11px] text-muted whitespace-nowrap">
                          {fmt(log.firstOccurrence || log.first_occurrence || log.createdAt)}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-[11px] text-muted whitespace-nowrap">
                          {fmt(log.lastOccurrence || log.last_occurrence || log.updatedAt)}
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
              <span className="font-mono text-[12px] text-muted">
                Page {pagination.page} of {pagination.totalPages}
                {pagination.total > 0 && ` · ${pagination.total} total`}
              </span>
              <div className="flex gap-1">
                <PageBtn onClick={() => handlePage(pagination.page - 1)} disabled={pagination.page <= 1}>
                  <ChevronLeft size={13} />
                </PageBtn>
                {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => {
                  const total = pagination.totalPages;
                  const cur = pagination.page;
                  const p =
                    total <= 7
                      ? i + 1
                      : cur <= 4
                      ? i + 1
                      : cur >= total - 3
                      ? total - 6 + i
                      : cur - 3 + i;
                  return (
                    <PageBtn key={p} active={p === pagination.page} onClick={() => handlePage(p)}>
                      {p}
                    </PageBtn>
                  );
                })}
                <PageBtn onClick={() => handlePage(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages}>
                  <ChevronRight size={13} />
                </PageBtn>
              </div>
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {showEditModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowEditModal(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-115 bg-bg1 border border-bdr2 rounded-2xl p-7 shadow-[0_32px_80px_rgba(0,0,0,.6)]"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-white text-[17px]">Edit Application</h2>
                <button onClick={() => setShowEditModal(false)} className="text-muted hover:text-white transition">
                  <X size={17} />
                </button>
              </div>

              <AnimatePresence>
                {(editError || error) && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-[12px] text-red-300"
                  >
                    <AlertCircle size={14} />
                    <span>{editError || error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleUpdateApp} className="flex flex-col gap-5">
                <Field label="Application Name">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => {
                      clearError?.();
                      setEditError("");
                      setEditName(e.target.value);
                    }}
                    placeholder="my-service"
                    required
                    autoFocus
                    className={inputCls}
                  />
                </Field>

                <Field label="Description">
                  <textarea
                    value={editDesc}
                    onChange={(e) => {
                      clearError?.();
                      setEditError("");
                      setEditDesc(e.target.value);
                    }}
                    placeholder="Describe your project purpose"
                    required
                    rows={3}
                    className={inputCls + " resize-none"}
                  />
                </Field>

                <div className="flex justify-end gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 border border-bdr2 text-muted text-[13px] font-semibold rounded-lg
                               hover:text-white hover:bg-bg2 transition"
                  >
                    Cancel
                  </button>

                  <motion.button
                    type="submit"
                    disabled={savingEdit}
                    className="flex items-center gap-2 px-5 py-2 bg-accent text-black font-bold text-[13px]
                               rounded-lg hover:bg-cyan-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    whileTap={{ scale: 0.97 }}
                  >
                    {savingEdit ? (
                      <span className="w-3.5 h-3.5 border-2 border-black/20 border-t-black rounded-full spin inline-block" />
                    ) : (
                      "Save"
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

function Pill({ icon, label }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-bg2 border border-bdr rounded-full font-mono text-[11px] text-muted">
      <span className="text-accent">{icon}</span> {label}
    </div>
  );
}

function PageBtn({ children, active, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-8 h-8 flex items-center justify-center rounded-lg border text-[12px] font-mono transition
                  ${
                    active
                      ? "text-accent border-accent/50 bg-accent/8"
                      : "text-muted border-bdr bg-bg1 hover:text-white hover:border-bdr2"
                  }
                  disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-muted uppercase tracking-widest">{label}</label>
      {children}
    </div>
  );
}

