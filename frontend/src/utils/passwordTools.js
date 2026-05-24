export function getPasswordStrength(password) {
  const value = String(password || "");
  if (!value) return { score: 0, label: "Empty", width: "0%", color: "bg-bdr2" };

  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  if (value.length >= 14) score += 1;

  if (score <= 1) return { score, label: "Weak", width: "25%", color: "bg-red-500" };
  if (score <= 2) return { score, label: "Fair", width: "45%", color: "bg-amber-400" };
  if (score <= 3) return { score, label: "Good", width: "70%", color: "bg-cyan-400" };
  return { score, label: "Strong", width: "100%", color: "bg-emerald-400" };
}

export function generatePassword(length = 16) {
  const safeLength = Math.max(12, Math.min(32, Number(length) || 16));
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const nums = "23456789";
  const symbols = "!@#$%^&*_-+=";
  const all = upper + lower + nums + symbols;

  const pick = (source) => source[Math.floor(Math.random() * source.length)];
  const chars = [pick(upper), pick(lower), pick(nums), pick(symbols)];

  for (let i = chars.length; i < safeLength; i += 1) {
    chars.push(pick(all));
  }

  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join("");
}
