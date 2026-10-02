import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { expect, test } from "@playwright/test";
import { gotoAndSettle } from "./helpers";

/* ══════════════════════════════════════════════════════════════════════════
   PHASE 09b-2 — WHAT THE CHAT ACTUALLY FORWARDS, AND THE FILTER THAT DECIDES

   THE DEFECT THIS FILE EXISTS FOR
   -------------------------------
   `ChatBot.tsx` stripped its own AI-consent prompt out of the conversation it
   forwards by comparing `m.content` against a STRING LITERAL that the
   component had stopped producing:

     literal   "… (Günlük limit: 5 mesaj)\n\n**Evet** yazarak onaylayabilirsiniz."
     rendered  "… (Kalan: N mesaj)\n\n**Evet** veya **Hayır** yazarak yanıtlayın."

   Nothing matched, nothing was filtered, and the bot's own question went to
   Google with the reader's.

   WHY IT NEEDED A TEST RATHER THAN A FIX ALONE
   --------------------------------------------
   The defect was MASKED. `/gizlilik-politikasi` madde 06, `/cerez-politikasi`
   madde 03 and `/kvkk` madde 04 all describe the payload as "o ana kadarki
   yazışma" — the conversation so far — which is true whether the filter works
   or not. So no legal page was false, no gate was red, and the day somebody
   narrows that clause by one word all three become false at once with nothing
   watching. This file watches the WIRE, so it is independent of the wording.

   THE PRODUCTION-WRITE PROHIBITION IS STRUCTURAL HERE
   ---------------------------------------------------
   Every Supabase origin is aborted at the route level; the chat endpoint is
   intercepted and fulfilled locally with a minimal SSE terminator. No byte of
   this test reaches the project, and that is enforced by the route table
   rather than by the test's good behaviour — if the interception is ever
   removed, the request fails instead of arriving.
   ══════════════════════════════════════════════════════════════════════════ */

const HERE = dirname(fileURLToPath(import.meta.url));
const CHATBOT_SOURCE = resolve(HERE, "..", "src", "components", "ChatBot.tsx");

/** The distinguishing words of the consent prompt, in either of its wordings. */
const CONSENT_PROMPT_MARKER = "AI asistanı kullanmamı ister misiniz";
const UNMATCHABLE_QUESTION = "zzzqqq wwwvvv xxxyyy";

type OutboundBody = { messages?: { role?: string; content?: string; kind?: string }[] };

test.describe("09b-2 — the AI consent filter is keyed on state", () => {
  // Playwright requires the fixtures argument to be a destructuring pattern.
  // eslint-disable-next-line no-empty-pattern
  test.beforeEach(async ({}, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1280", "one canonical transfer lane");
  });

  test("the consent prompt is not forwarded, and the question is sent once", async ({ page }) => {
    /** @type {OutboundBody[]} */
    const outbound: OutboundBody[] = [];

    // Registered FIRST so the chat handler below, registered last, wins:
    // Playwright matches route handlers in reverse registration order.
    await page.route(/supabase\.(co|in)/i, (route) => route.abort());
    await page.route("**/functions/v1/chat", async (route) => {
      const raw = route.request().postData() ?? "{}";
      outbound.push(JSON.parse(raw) as OutboundBody);
      await route.fulfill({
        status: 200,
        contentType: "text/event-stream",
        body: "data: [DONE]\n\n",
      });
    });

    await gotoAndSettle(page, "/kvkk");
    await page.locator("[data-chat-launcher]").click();

    const message = page.getByLabel("Sohbet mesajı");
    await expect(message).toBeVisible();
    await message.fill(UNMATCHABLE_QUESTION);
    await page.getByLabel("Mesajı gönder").click();

    // The local FAQ bundle answers this one with a consent request, not an
    // answer — and no network call has happened yet.
    await expect(page.getByRole("button", { name: /Evet/ })).toBeVisible();
    expect(outbound, "nothing may be sent before consent").toHaveLength(0);

    await page.getByRole("button", { name: /Evet/ }).click();
    await expect.poll(() => outbound.length, { timeout: 15_000 }).toBe(1);

    const messages = outbound[0].messages ?? [];
    expect(messages.length, "the conversation must not be empty").toBeGreaterThan(0);

    // THE ASSERTION. Regressing the filter to a string literal puts the
    // consent prompt back on the wire, and this goes red.
    const forwardedPrompts = messages.filter((m) => (m.content ?? "").includes(CONSENT_PROMPT_MARKER));
    expect(
      forwardedPrompts,
      "the bot's own consent question must not be forwarded to a third party",
    ).toEqual([]);

    // And the reader's question is forwarded exactly once, not duplicated.
    const question = messages.filter((m) => (m.content ?? "").trim() === UNMATCHABLE_QUESTION);
    expect(question).toHaveLength(1);
    expect(question[0].role).toBe("user");

    // "Evet" is consent, not conversation; it is not part of the payload.
    expect(messages.some((m) => (m.content ?? "").trim().toLowerCase() === "evet")).toBe(false);
  });

  test("no request is made when the reader declines", async ({ page }) => {
    const outbound: string[] = [];
    await page.route(/supabase\.(co|in)/i, (route) => route.abort());
    await page.route("**/functions/v1/chat", async (route) => {
      outbound.push(route.request().url());
      await route.fulfill({ status: 200, contentType: "text/event-stream", body: "data: [DONE]\n\n" });
    });

    await gotoAndSettle(page, "/kvkk");
    await page.locator("[data-chat-launcher]").click();
    await page.getByLabel("Sohbet mesajı").fill(UNMATCHABLE_QUESTION);
    await page.getByLabel("Mesajı gönder").click();

    await page.getByRole("button", { name: /Hayır/ }).click();
    await expect(page.getByRole("button", { name: /Evet/ })).toHaveCount(0);
    expect(outbound).toEqual([]);
  });

  test("the filter names a state field and compares no message content to a literal", () => {
    const source = readFileSync(CHATBOT_SOURCE, "utf8");

    // The live filter, in the branch that forwards the conversation.
    expect(
      source,
      "the outbound filter must be keyed on the message's own state field",
    ).toContain('m.kind !== "ai-consent"');

    // The regression, in every spelling a re-introduction could plausibly take.
    // Comments are stripped first: this file's header QUOTES the old literal on
    // purpose, and a quotation is not a filter.
    const code = source
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/(^|[^:])\/\/[^\n]*/g, "$1");
    const literalCompare = /\.content\s*(?:!==|===|==|!=)\s*["'`]/;
    expect(
      literalCompare.test(code),
      "a message filter keyed on a string literal is the defect 09b-2 removed",
    ).toBe(false);

    // The renderer and the filter must be written by the same call, so they
    // cannot drift: the consent message is the only one carrying the kind.
    expect(source).toContain('"ai-consent",');
  });
});
