#!/usr/bin/env node
/**
 * QA 09a-R5 item 4 — THE TWO NEW DISCRIMINATORS ON DETECTOR (D).
 *
 * Round 4 measured two over-catches; the p09a4 suite re-run at this head shows
 * both closed and nothing else moved (31 probes, 0 mismatches,
 * `evidence/17-`). That proves the discriminators do what they were added for.
 * It does not prove they are narrow, and a suppression is the one kind of rule
 * change that can only ever make a gate quieter.
 *
 * So this asks the opposite question: WHAT DOES THE SECOND CONDITION LET
 * THROUGH? The two conditions, as committed:
 *
 *   (i)  if (CAD_VISITOR_OWNED_NOUN.test(noun) && CAD_VISITOR_ACTION.test(sentence)) continue;
 *   (ii) if (CAD_DELIVERABLE_GOVERNOR.test(text.slice(index - 60, index))) continue;
 *
 * Two structural observations drive the probes below, and each one is a
 * prediction that this file tests rather than asserts:
 *
 *   (i)  the possessive is tested on the NOUN but the second person is tested on
 *        the WHOLE SENTENCE, and `SENTENCE_BREAK` does not break on `;`. So any
 *        second-person modal anywhere in the sentence suppresses — including one
 *        attached to a different verb than the claim.
 *
 *   (ii) the governor is tested against 60 characters of RAW FILE TEXT, not
 *        against the sentence. A `rapor…` word can therefore govern across a
 *        full stop it has nothing to do with. And "at most one word between" is
 *        a boundary the gate's own comment walks right up to: it cites
 *        "Kalite raporu ile birlikte tüm CAD formatlarını gönderebilirsiniz"
 *        as still firing at THREE words. At one word it does not.
 *
 * `expect` is what the gate's OWN COMMENT says should happen, quoted per probe,
 * so a mismatch is the gate disagreeing with its own stated design rather than
 * with my taste. Strings go through the gate's real matching path via the
 * p09a4 control-injection mutation; nothing on disk changes.
 */
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const RULE = "cad-format-list-not-derived";

const PROBES = [
  /* ── calibration: the two round-4 over-catches and the claim they must not
        stop catching. If these three disagree with round 4, nothing below is
        measuring what it thinks. ─────────────────────────────────────────── */
  { id: "C1", expect: "FIRES", text: '"Yaygın CAD formatlarını doğrudan işleyebiliyoruz."',
    why: "D1 — the removed sentence; detector (D) exists for it" },
  { id: "C2", expect: "SILENT", text: '"Tüm dosyalarınızı tek adımda yükleyebilirsiniz; hiçbiri üçüncü tarafla paylaşılmaz."',
    why: "R4 over-catch 1 — both halves of (i) present, correctly suppressed" },
  { id: "C3", expect: "SILENT", text: '"Ölçüm raporunu çeşitli formatlarda gönderebilirsiniz."',
    why: "R4 over-catch 2 — the report we deliver, correctly suppressed" },

  /* ── (i): the comment's own requirement, stated at claims-gate.mjs:1102-1105:
        "the possessive suppresses, but ONLY when the predicate is second-person
         too ... because 'Tüm dosyalarınızı kabul ediyoruz' is a first-person
         acceptance claim about an unbounded class and must still fire. Both
         halves, or nothing." ────────────────────────────────────────────────── */
  { id: "V1", expect: "FIRES", text: '"Tüm dosyalarınızı kabul ediyoruz."',
    why: "the comment names this exact string and says it must still fire" },
  { id: "V2", expect: "FIRES", text: '"Tüm dosyalarınızı kabul ediyoruz; dilerseniz e-posta ile de gönderebilirsiniz."',
    why: "V1 with an unrelated second-person clause after a semicolon. SENTENCE_BREAK does not break on ';', so the second-person test sees a modal attached to a DIFFERENT verb" },
  { id: "V3", expect: "FIRES", text: '"Her türlü dosyanızı işleyebiliriz; süreci panelden takip edebilirsiniz."',
    why: "the claim verb is first-person; the second-person modal belongs to a different clause entirely" },
  { id: "V4", expect: "FIRES", text: '"Tüm belgelerinizi destekliyoruz."',
    why: "visitor-owned noun, first-person predicate, no second-person modal — (i) must not reach it" },
  { id: "V5", expect: "SILENT", text: '"Tüm dosyalarınızı güvenle yükleyebilirsiniz."',
    why: "both halves of (i) genuinely present — this is what (i) is for" },

  /* ── (ii): "A report noun GOVERNING the quantified noun phrase (immediately
        before it, at most one word between) suppresses. Adjacency is the point:
        'Kalite raporu ile birlikte tüm CAD formatlarını gönderebilirsiniz' is
        three words away and still fires."  claims-gate.mjs:1107-1113 ───────── */
  { id: "G1", expect: "FIRES", text: '"Kalite raporu ile birlikte tüm CAD formatlarını gönderebilirsiniz."',
    why: "the comment cites this string, at three words, as still firing" },
  { id: "G2", expect: "FIRES", text: '"Kalite raporu ile tüm CAD formatlarını kabul ediyoruz."',
    why: "G1 minus one word. A first-person intake claim about an unbounded class — the report noun governs nothing here" },
  { id: "G3", expect: "FIRES", text: '"Rapor sonrası tüm CAD formatlarını kabul ediyoruz."',
    why: "one word between, and the report is a time reference, not the governed object" },
  { id: "G4", expect: "FIRES", text: '"Raporlama tüm dosya türlerini destekliyoruz."',
    why: "zero words between, and `raporlama` is a service name, not a deliverable governing the noun phrase" },

  /* ── (ii) across a sentence boundary. The offer predicate is tested on
        sentenceAt(); the governor is tested on a raw 60-character slice. ───── */
  { id: "X1", expect: "FIRES", text: '"Ölçüm raporu hazırlanır. Tüm CAD formatlarını kabul ediyoruz."',
    why: "the report noun is in the PREVIOUS sentence and has nothing to do with the claim" },
  { id: "X2", expect: "FIRES", text: '"Kontrol raporu teslim edilir. Yaygın CAD formatlarını doğrudan işleyebiliyoruz."',
    why: "same shape, with C1's exact claim as the second sentence — two words in the previous sentence, so this one may hold" },

  /* ── controls on my own probes: strings that SHOULD stay silent, so a
        detector that has simply become loud is not read as a pass. ─────────── */
  { id: "Q1", expect: "SILENT", text: 'question: "Hangi dosya formatlarını destekliyorsunuz?",',
    why: "a question is not an offer — the round-4 D4 control, restated" },
  { id: "Q2", expect: "SILENT", text: '"Ölçüm raporunu çeşitli formatlarda hazırlıyoruz."',
    why: "no offer predicate at all" },
  { id: "Q3", expect: "SILENT", text: '"Yaygın CAD formatları için ölçülendirilmiş teknik resim gönderilmesi analiz süresini kısaltır."',
    why: "vague scope, no offer predicate — round-4 D5" },
];

function runOne(probe) {
  const args = ["--import=./scripts/qa-probes/p09a4-gate-mutator.mjs", "scripts/claims-gate.mjs"];
  const env = {
    ...process.env,
    P09A4_MUTATION: "inject-probe-controls",
    P09A4_PROBE_AS: "silent",
    P09A4_PROBES: JSON.stringify([{ rule: RULE, text: probe.text }]),
  };
  let out;
  try {
    out = execFileSync(process.execPath, args, { cwd: REPO_ROOT, encoding: "utf8", env });
  } catch (error) {
    out = `${error.stdout ?? ""}${error.stderr ?? ""}`;
  }
  return {
    fired: out.includes("NEGATIVE CONTROL FIRED"),
    other: out.includes("POSITIVE CONTROL DID NOT FIRE") || out.includes("### derived-copy-drift"),
  };
}

console.log("# QA 09a-R5 — detector (D)'s two new discriminators, from the other side");
console.log("# `expect` is what claims-gate.mjs's OWN comment says should happen.");
console.log("");
console.log("id  expect  actual  ok        why");
let bad = 0;
const misses = [];
for (const p of PROBES) {
  const { fired, other } = runOne(p);
  const actual = fired ? "FIRES" : "SILENT";
  const ok = actual === p.expect;
  if (!ok) {
    bad += 1;
    misses.push(p);
  }
  console.log(
    `${p.id.padEnd(3)} ${p.expect.padEnd(7)} ${actual.padEnd(7)} ${(ok ? "ok" : "MISMATCH").padEnd(9)}` +
      `${other ? "[UNRELATED FAILURE] " : ""}${p.why}`,
  );
}
console.log("");
console.log(`${PROBES.length} probes, ${bad} mismatch(es).`);
for (const m of misses) console.log(`  MISMATCH ${m.id}: ${m.text}`);
process.exitCode = 0;
