const DEFAULT_BASE_URL = "http://localhost:5000";
const VALID_LEVELS = new Set(["INFO", "WARN", "ERROR"]);

const state = {
  apiKey: null,
  appName: null,
  baseUrl: DEFAULT_BASE_URL,
};

function asNonEmptyString(value, fieldName) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${fieldName} must be a non-empty string.`);
  }
  return value.trim();
}

export function init({ apiKey, appName, baseUrl = DEFAULT_BASE_URL } = {}) {
  state.apiKey = asNonEmptyString(apiKey, "apiKey");
  state.appName = asNonEmptyString(appName, "appName");
  state.baseUrl = asNonEmptyString(baseUrl, "baseUrl").replace(/\/+$/, "");

  return {
    appName: state.appName,
    baseUrl: state.baseUrl,
  };
}

export async function log({ message, level = "INFO" } = {}) {
  if (!state.apiKey || !state.appName) {
    throw new Error("SDK is not initialized. Call init({ apiKey, appName }) first.");
  }

  const safeMessage = asNonEmptyString(message, "message");
  const normalizedLevel = asNonEmptyString(level, "level").toUpperCase();

  if (!VALID_LEVELS.has(normalizedLevel)) {
    throw new Error("level must be one of: INFO, WARN, ERROR.");
  }

  const endpoint = `${state.baseUrl}/api/apps/${encodeURIComponent(state.appName)}/logs`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": state.apiKey,
    },
    body: JSON.stringify({
      message: safeMessage,
      level: normalizedLevel,
    }),
  });

  let body = null;
  try {
    body = await response.json();
  } catch (_) {}

  if (!response.ok) {
    const errMessage =
      body?.message || `Failed to send log. HTTP status: ${response.status}.`;
    const error = new Error(errMessage);
    error.status = response.status;
    error.response = body;
    throw error;
  }

  return body;
}

export default {
  init,
  log,
};
