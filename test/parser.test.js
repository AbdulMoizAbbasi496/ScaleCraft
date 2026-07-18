const test = require("node:test");
const assert = require("node:assert/strict");

const { buildArchitectureSummary } = require("../utils/parser");

test("summarizes routes, database calls, and external API calls", () => {
  const summary = buildArchitectureSummary([
    {
      filename: "server.js",
      content: `
        app.get("/users", async () => db.collection("users").find({}).toArray());
        await fetch("https://api.example.com/profile");
      `
    }
  ]);

  assert.match(summary, /File: server\.js/);
  assert.match(summary, /Contains Route: GET \/users/);
  assert.match(summary, /Contains DB Call:/);
  assert.match(summary, /Contains External API Call:/);
});

test("notes cache and rate-limit usage", () => {
  const summary = buildArchitectureSummary([
    {
      filename: "middleware.js",
      content: "const rateLimit = require('express-rate-limit'); const redis = createClient();"
    }
  ]);

  assert.match(summary, /Contains Cache Usage: yes/);
  assert.match(summary, /Contains Rate Limiting: yes/);
});

test("rejects a non-array input", () => {
  assert.throws(() => buildArchitectureSummary(null), /files must be an array/);
});
