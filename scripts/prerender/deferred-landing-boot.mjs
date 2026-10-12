import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export function createLandingBootGate(dist) {
  const code = readFileSync(new URL("./first-paint-bootstrap.js", import.meta.url));
  const name = `inspection-first-paint-${createHash("sha256").update(code).digest("hex").slice(0, 12)}.js`;
  writeFileSync(join(dist, "assets", name), code);
  return document => {
    const deferred = [];
    let entry;
    let result = document.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, tag => {
      const source = tag.match(/<script type="module"[^>]*src="(\/assets\/[^\"]+)"/);
      if (source || tag.includes('[["modulepreload"')) {
        if (source) entry = source[1];
        deferred.push(tag);
        return "";
      }
      return tag;
    });
    result = result.replace(/<link rel="modulepreload"[^>]*>/g, tag => { deferred.push(tag); return ""; });
    if (!entry || !deferred.length) throw new Error("Landing startup entry missing; refusing incomplete boot gate");
    return result.replace("</head>", `<template id="inspection-startup">${deferred.join("\n")}</template><script type="module" crossorigin src="/assets/${name}" data-inspection-entry="${entry}"></script></head>`);
  };
}
