/**
 * QA 09a-R5 item 3 — IS THE UNRENDERED-ROUTE FAILURE ACTUALLY LOUD?
 *
 * C5 reports it proved this by "temporarily forcing routes to look unsettled".
 * A temporary edit is not evidence I can re-run, and `e2e/qa-p09a2-claims-sweep.spec.ts`
 * is DO_NOT_TOUCH to me, so this proves it the other way round: the spec is run
 * EXACTLY AS COMMITTED against a server that serves nothing but a shell.
 *
 * The server returns, for every path, an HTML document whose `document.body.innerText`
 * is 88 characters — the exact length round 4 measured on the two routes it caught
 * mid-flight. Under the OLD spec (`main, .shell-root, #root > *` attached, then a
 * fixed 350 ms) this document satisfies the wait and scans clean; under the new one
 * every route must be reported as never settled and the run must fail.
 *
 * One foreground process: the server runs in-process and Playwright is a child.
 * Nothing is written to the repository outside `reports/qa/phase-09a-r5/`.
 */
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const PORT = Number(process.env.P09A5_SHELL_PORT ?? 4231);

/* Body text is exactly 88 characters, matching the round-4 measurement. */
const SHELL_TEXT = "Mas Technic".padEnd(88, " .").slice(0, 88);
const PAGE = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>shell</title></head>
<body><div id="root"><div class="shell-root"><main>${SHELL_TEXT}</main></div></div></body></html>`;

const server = createServer((req, res) => {
  res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
  res.end(PAGE);
});

await new Promise((resolve) => server.listen(PORT, "127.0.0.1", resolve));
console.log(`# shell-only server on http://127.0.0.1:${PORT} — every path returns ${SHELL_TEXT.length} characters of body text`);
console.log("# running e2e/qa-p09a2-claims-sweep.spec.ts EXACTLY AS COMMITTED against it");
console.log("");

const child = spawn(
  process.platform === "win32" ? "npx.cmd" : "npx",
  ["playwright", "test", "--project=desktop-1280", "e2e/qa-p09a2-claims-sweep.spec.ts", "--reporter=list"],
  {
    cwd: REPO,
    env: {
      ...process.env,
      PLAYWRIGHT_BASE_URL: `http://127.0.0.1:${PORT}`,
      PLAYWRIGHT_PREVIEW_ONLY: "1",
    },
    shell: process.platform === "win32",
  },
);
child.stdout.on("data", (b) => process.stdout.write(b));
child.stderr.on("data", (b) => process.stdout.write(b));
const code = await new Promise((resolve) => child.on("close", resolve));

server.close();
console.log("");
console.log(`playwright exit code: ${code}`);
console.log(code === 0 ? "RESULT: SILENT — the sweep scanned 88-character shells and called them clean" : "RESULT: LOUD — the sweep refused to call an unrendered route a clean route");
process.exitCode = 0;
