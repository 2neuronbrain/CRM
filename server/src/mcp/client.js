import { config } from '../config/index.js';

export function sanitize(text) {
  if (!text || typeof text !== 'string') return text;
  if (!config.aqToken) return text;
  return text.replaceAll(config.aqToken, '[REDACTED_AQ_TOKEN]');
}

/**
 * Low-level MCP JSON-RPC Client with robust retry and error reporting
 */
export async function callMcpTool(name, args = {}, attempt = 1) {
  const url = config.mcpUrl;
  const token = config.aqToken;

  if (!token) {
    throw new Error('MCP Call Failed: AQ_TOKEN is not configured.');
  }

  const payload = {
    jsonrpc: '2.0',
    id: Date.now(),
    method: 'tools/call',
    params: {
      name,
      arguments: args
    }
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'accept': 'application/json, text/event-stream',
        'authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.status === 429) {
      const errText = await res.text().catch(() => '');
      const err = new Error(`Rate limit exceeded (HTTP 429): ${sanitize(errText)}`);
      err.isRateLimit = true;
      throw err;
    }

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      throw new Error(`MCP HTTP error ${res.status}: ${sanitize(errBody)}`);
    }

    const data = await res.json();

    if (data.error) {
      throw new Error(`MCP JSON-RPC Error: ${sanitize(data.error.message || JSON.stringify(data.error))}`);
    }

    if (!data.result) {
      throw new Error('Malformed MCP Response: missing result');
    }

    if (data.result.isError) {
      const errMsg = data.result.content?.[0]?.text || 'MCP Tool execution error';
      throw new Error(`MCP Tool Error: ${sanitize(errMsg)}`);
    }

    const rawText = data.result.content?.[0]?.text;
    if (typeof rawText === 'string') {
      try {
        return JSON.parse(rawText);
      } catch {
        return rawText;
      }
    }

    return data.result;
  } catch (err) {
    clearTimeout(timeoutId);

    // If it's a transient socket/fetch error and attempt is 1, wait 3 seconds and retry once
    if (attempt < 2 && !err.isRateLimit && err.name !== 'AbortError') {
      console.warn(`[Client] Tool ${name} failed on attempt 1 (${err.message}). Retrying once in 3s...`);
      await new Promise(r => setTimeout(r, 3000));
      return callMcpTool(name, args, attempt + 1);
    }

    const detailedMsg = err.cause ? `${err.message} (${err.cause.message || err.cause.code || err.cause})` : err.message;
    const cleanErr = new Error(sanitize(detailedMsg));
    if (err.isRateLimit) cleanErr.isRateLimit = true;
    throw cleanErr;
  }
}

export default {
  callMcpTool,
  sanitize
};
