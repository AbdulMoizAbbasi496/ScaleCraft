const ROUTE_PATTERNS = [
  /\b(?:app|router)\s*\.\s*(get|post|put|patch|delete)\s*\(\s*["'`]([^"'`]+)["'`]/gi,
  /export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)\s*\(/g
];

const DB_PATTERNS = [
  /\bdb\s*\.\s*collection\s*\(\s*["'`]([^"'`]+)["'`]\s*\)\s*\.\s*(find|findOne|insertOne|updateOne|deleteOne|aggregate)\s*\(/gi,
  /\b(prisma|sequelize|mongoose)\s*\.\s*([a-zA-Z0-9_]+)\s*\.\s*(findMany|findUnique|findFirst|create|update|delete|aggregate)\s*\(/gi,
  /\b([a-zA-Z0-9_]+)\s*\.\s*(find|findOne|findById|save|aggregate|query)\s*\(/gi
];

const EXTERNAL_API_PATTERNS = [
  /\bfetch\s*\(\s*["'`]([^"'`]+)["'`]/gi,
  /\baxios\s*\.\s*(get|post|put|patch|delete)\s*\(\s*["'`]([^"'`]+)["'`]/gi
];

const CACHE_PATTERNS = [/\b(redis|memcached|cache|lru-cache|node-cache)\b/gi];
const RATE_LIMIT_PATTERNS = [/\b(rateLimit|express-rate-limit|throttle|limiter)\b/gi];

function collectMatches(content, patterns, formatter) {
  const matches = [];

  for (const pattern of patterns) {
    pattern.lastIndex = 0;
    let match = pattern.exec(content);

    while (match) {
      matches.push(formatter(match));
      match = pattern.exec(content);
    }
  }

  return [...new Set(matches)];
}

function summarizeFile(file) {
  const content = file.content || "";
  const parts = [`File: ${file.filename}`];

  const routes = collectMatches(content, ROUTE_PATTERNS, (match) => {
    if (match[2]) {
      return `${match[1].toUpperCase()} ${match[2]}`;
    }

    return `${match[1].toUpperCase()} Next.js route handler`;
  });

  const dbCalls = collectMatches(content, DB_PATTERNS, (match) => {
    if (match[0].startsWith("db.collection")) {
      return `db.collection("${match[1]}").${match[2]}()`;
    }

    return match[0].replace(/\s+/g, " ").replace(/\($/, "()");
  });

  const externalCalls = collectMatches(content, EXTERNAL_API_PATTERNS, (match) => {
    const url = match[2] || match[1];
    return url.startsWith("http") ? url : "relative API call";
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

  if (CACHE_PATTERNS.some((pattern) => pattern.test(content))) {
    parts.push("Contains Caching Signal");
  }

  if (RATE_LIMIT_PATTERNS.some((pattern) => pattern.test(content))) {
    parts.push("Contains Rate Limiting Signal");
  }

  if (parts.length === 1) {
    parts.push("No obvious routes, database calls, cache usage, or external API calls detected");
  }

  return parts.join(" | ");
}

export function buildArchitectureSummary(files) {
  return files.map(summarizeFile).join("\n");
}
