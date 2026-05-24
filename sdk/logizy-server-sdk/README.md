# @logizy/server-sdk

Server SDK to send logs to Logizy.

## Install

```bash
npm install @logizy/server-sdk
```

## Usage

```js
import { init, log } from "@logizy/server-sdk";

init({
  apiKey: process.env.LOGIZY_API_KEY,
  appName: "my-service",
  baseUrl: "https://your-logizy-api.vercel.app",
});

await log({
  message: "Payment gateway timeout",
  level: "ERROR",
});
```

## API

- `init({ apiKey, appName, baseUrl? })`
  - Initializes SDK configuration.
  - `baseUrl` defaults to `http://localhost:5000`.

- `log({ message, level? })`
  - Sends a `POST /api/apps/:appName/logs` request.
  - `level` defaults to `INFO`.
  - Valid levels: `INFO`, `WARN`, `ERROR`.


- `sdk/logizy-server-sdk`

It exposes two methods:

1. `init({ apiKey, appName, baseUrl? })`
2. `log({ message, level? })`

### Usage Example

```js
import { init, log } from "@logizy/server-sdk";

init({
  apiKey: process.env.LOGIZY_API_KEY,
  appName: "my-service",
  baseUrl: "https://your-logizy-api.vercel.app",
});

await log({
  message: "A sample error happened",
  level: "ERROR",
});
```

### Ownership Validation (Security Requirement)

Log ingestion now validates ownership by checking both:

- API key owner (`req.developer` from `validateApiKey`)
- Target application owner (`Application.developer`)

So logs can only be written when the API key belongs to the same developer who owns the target application.
