/**
 * Lightweight codebase parser for ScaleCraft.
 *
 * This intentionally avoids full AST parsing. The goal is to produce a small,
 * architecture-focused summary that can fit comfortably inside an LLM prompt.
 */

const ROUTE_PATTERNS = [
  // Express app/router style: app.get("/users"), router.post('/api/items')
  /\b(?:app|router)\s*\.\s*(get|post|put|patch|delete|options|head)\s*\(\s*['"`]([^'"`]+)['"`]/gi,

  // Next.js App Router handlers: export async function GET()
  /\bexport\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)\s*\(/gi
];

const DB_PATTERNS = [
  /\bdb\s*\.\s*collection\s*\(\s*['"`]([^'"`]+)['"`]\s*\)\s*\.\s*(find|findOne|insertOne|insertMany|updateOne|updateMany|deleteOne|deleteMany|aggregate)\s*\(/gi,
  /\b(?:prisma|sequelize|mongoose)\s*\.\s*([A-Za-z0-9_$]+)\s*\.\s*(findMany|findFirst|findUnique|create|update|delete|aggregate|findAll|findOne)\s*\(/gi,
  /\b[A-Za-z0-9_$]+\s*\.\s*(find|findOne|findById|create|save|updateOne|deleteOne|aggregate)\s*\(/gi,
  /\b(?:SELECT|INSERT|UPDATE|DELETE)\b[\s\S]{0,120}\b(?:FROM|INTO|SET)\b/gi
];

const EXTERNAL_API_PATTERNS = [
  /\bfetch\s*\(\s*['"`]([^'"`]+)['"`]/gi,
  /\baxios\s*\.\s*(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/gi,
  /\baxios\s*\(\s*{[\s\S]{0,300}url\s*:\s*['"`]([^'"`]+)['"`]/gi
];

const CACHE_PATTERNS = [
  /\b(redis|memcached|cache|lru-cache|node-cache)\b/gi
];

const RATE_LIMIT_PATTERNS = [
  /\b(express-rate-limit|rateLimit|slowDown|throttle)\b/gi
];

function collectMatches(content, patterns, formatter) {
  const results = [];

  for (const pattern of patterns) {
    pattern.lastIndex = 0;
    let match;

    while ((match = pattern.exec(content)) !== null) {
      results.push(formatter(match));
    }
  }

  return [...new Set(results)];
}

function summarizeFile(file) {
  const filename = file.filename || "unknown";
  const content = file.content || "";
  const parts = [`File: ${filename}`];

  const routes = collectMatches(content, ROUTE_PATTERNS, (match) => {
    const method = match[1].toUpperCase();
    const path = match[2] || `/${method.toLowerCase()} handler`;
    return `${method} ${path}`;
  });

  const dbCalls = collectMatches(content, DB_PATTERNS, (match) => {
    const raw = match[0].replace(/\s+/g, " ").trim();
    return raw.length > 90 ? `${raw.slice(0, 87)}...` : raw;
  });

  const externalCalls = collectMatches(content, EXTERNAL_API_PATTERNS, (match) => {
    const method = match[1]?.toUpperCase?.() || "REQUEST";
    const url = match[2] || match[1] || "dynamic-url";
    return `${method} ${url}`;
  });

  if (routes.length) {
    parts.push(`Contains Route: ${routes.join(", ")}`);
  }

  if (dbCalls.length) {
    parts.push(`Contains DB Call: ${dbCalls.join(", ")}`);
  }

  if (externalCalls.length) {
    parts.push(`Contains External API Call: ${externalCalls.join(", ")}`);
  }

  if (CACHE_PATTERNS.some((pattern) => {
    pattern.lastIndex = 0;
    return pattern.test(content);
  })) {
    parts.push("Contains Cache Usage: yes");
  }

  if (RATE_LIMIT_PATTERNS.some((pattern) => {
    pattern.lastIndex = 0;
    return pattern.test(content);
  })) {
    parts.push("Contains Rate Limiting: yes");
  }

  if (parts.length === 1) {
    parts.push("No obvious routes, database calls, external API calls, caching, or rate limiting detected");
  }

  return parts.join(" | ");
}

function buildArchitectureSummary(files) {
  if (!Array.isArray(files)) {
    throw new TypeError("files must be an array");
  }

  return files.map(summarizeFile).join("\n");
}

module.exports = {
  buildArchitectureSummary
};
