import { readFileSync } from "node:fs";

// Emits the verbatim reference tables for docs/product-classification-gpc.md.
// Source: GPC German schema download (see the doc for the API recipe).
const j = JSON.parse(readFileSync(process.argv[2], "utf8"));
const out = [];

out.push("### All segments\n");
out.push("| Code | Segment |");
out.push("| --- | --- |");
for (const s of [...j.Schema].sort((a, b) => a.Code - b.Code)) {
  out.push(`| \`${s.Code}\` | ${s.Title} |`);
}

const food = j.Schema.find((s) => s.Code === 50000000);
const fams = [...food.Childs].sort((a, b) => a.Code - b.Code);

out.push("\n### Segment 50000000: families\n");
out.push("| Code | Familie | Klassen |");
out.push("| --- | --- | ---: |");
for (const f of fams) {
  out.push(`| \`${f.Code}\` | ${f.Title} | ${f.Childs.length} |`);
}

out.push("\n### Segment 50000000: classes\n");
for (const f of fams) {
  out.push(`\n**\`${f.Code}\` ${f.Title}**\n`);
  out.push("| Code | Klasse | Bricks |");
  out.push("| --- | --- | ---: |");
  for (const c of [...f.Childs].sort((a, b) => a.Code - b.Code)) {
    out.push(`| \`${c.Code}\` | ${c.Title} | ${c.Childs.length} |`);
  }
}

console.log(out.join("\n"));
