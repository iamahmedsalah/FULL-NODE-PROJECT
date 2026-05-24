import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Terminal,
  Eye,
  EyeOff,
  X,
  CircleAlert,
  Mail,
  Lock,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import useAuthStore from "../stores/authStore";

const emailPattern = /^\S+@\S+\.\S+$/;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [formError, setFormError] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });
  const { login, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const fieldErrors = useMemo(() => {
    const result = { email: "", password: "" };
    if (!email.trim()) result.email = "Email is required.";
    else if (!emailPattern.test(email.trim())) result.email = "Please enter a valid email address.";

    if (!password) result.password = "Password is required.";
    else if (password.length < 8) result.password = "Password must be at least 8 characters.";

    return result;
  }, [email, password]);

  const hasFieldErrors = Boolean(fieldErrors.email || fieldErrors.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setTouched({ email: true, password: true });

    if (hasFieldErrors) {
      setFormError("Please fix the highlighted fields.");
      return;
    }

    setFormError("");
    const res = await login(email.trim(), password);
    if (res.success) navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-bg">
      <div
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none
                   bg-[radial-gradient(circle,rgba(0,229,255,0.06),transparent_70%)]
                   top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      />

      <motion.div
        className="w-full max-w-[430px] bg-bg1/96 border border-bdr rounded-2xl p-9 shadow-[0_24px_80px_rgba(0,0,0,.55)] relative z-10"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-2 font-mono font-semibold text-accent text-lg mb-8">
          <Terminal size={24} /> Logizy
        </div>

        <h1 className="text-2xl font-extrabold text-white mb-1">Sign In</h1>
        <p className="text-[13px] text-muted mb-7">Access your developer dashboard</p>

        <AnimatePresence>
          {(formError || error) && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center justify-between gap-2 bg-red-500/10 border border-red-500/30
                         text-red-300 rounded-lg px-4 py-3 text-[13px] mb-5"
            >
              <span className="inline-flex items-center gap-2">
                <CircleAlert size={14} /> {formError || error}
              </span>
              <button
                onClick={() => {
                  setFormError("");
                  clearError();
                }}
              >
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          <Field label="Email" icon={<Mail size={12} />} error={touched.email ? fieldErrors.email : ""}>
            <input
              type="email"
              value={email}
              onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
              onChange={(e) => {
                setFormError("");
                setEmail(e.target.value);
              }}
              placeholder="dev@example.com"
              autoComplete="email"
              className={inputCls + (touched.email && fieldErrors.email ? " border-red-400/60" : "")}
            />
          </Field>

          <Field label="Password" icon={<Lock size={12} />} error={touched.password ? fieldErrors.password : ""}>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                onChange={(e) => {
                  setFormError("");
                  setPassword(e.target.value);
                }}
                placeholder="********"
                autoComplete="current-password"
                className={inputCls + " pr-10" + (touched.password && fieldErrors.password ? " border-red-400/60" : "")}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
              >
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </Field>

          <motion.button type="submit" disabled={loading} className={btnPrimary} whileTap={{ scale: 0.98 }}>
            {loading ? <Spinner /> : "Sign In"}
          </motion.button>
        </form>

        <p className="text-center text-[13px] text-muted mt-6">
          No account?{" "}
          <Link to="/register" className="text-accent font-semibold hover:underline">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

const inputCls = `w-full bg-bg2 border border-bdr rounded-lg px-3.5 py-2.5 text-white text-sm
  outline-none transition focus:border-accent2 focus:ring-2 focus:ring-accent2/10
  placeholder:text-muted2`;

const btnPrimary = `flex items-center justify-center gap-2 w-full py-2.5 bg-accent
  text-black font-bold text-[13px] rounded-lg transition hover:bg-cyan-300
  active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed`;

const Spinner = () => (
  <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full spin inline-block" />
);

function Field({ label, icon, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-muted uppercase tracking-widest inline-flex items-center gap-1.5">
        {icon}
        {label}
      </label>
      {children}
      {error && <p className="text-[11px] text-red-300">{error}</p>}
    </div>
  );
}
