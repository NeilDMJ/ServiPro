import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const schemaPath = path.join(ROOT, "prisma", "schema.prisma");
const outPath = path.join(ROOT, "docs", "diagrama-prisma.md");

function stripComments(line) {
  const idx = line.indexOf("//");
  return idx >= 0 ? line.slice(0, idx) : line;
}

function parseSchema(text) {
  const lines = text.split(/\r?\n/);

  /** @type {Map<string, Array<{name: string, type: string}>>} */
  const models = new Map();

  /** @type {Array<{from: string, to: string, cardinality: string, field: string}>} */
  const relations = [];

  const modelNames = new Set();

  // 1) collect model names
  for (const rawLine of lines) {
    const line = stripComments(rawLine).trim();
    const m = line.match(/^model\s+(\w+)\s*\{/);
    if (m) modelNames.add(m[1]);
  }

  // 2) parse model blocks
  let i = 0;
  while (i < lines.length) {
    const header = stripComments(lines[i]).trim();
    const m = header.match(/^model\s+(\w+)\s*\{/);
    if (!m) {
      i++;
      continue;
    }

    const modelName = m[1];
    models.set(modelName, []);
    i++;

    while (i < lines.length) {
      const raw = stripComments(lines[i]);
      const line = raw.trim();
      if (line.startsWith("}")) break;

      // skip empty, attributes, blocks
      if (!line || line.startsWith("@@") || line.startsWith("@")) {
        i++;
        continue;
      }

      // field line: name Type ...
      const parts = line.split(/\s+/);
      if (parts.length >= 2) {
        const fieldName = parts[0];
        const fieldType = parts[1];

        models.get(modelName).push({ name: fieldName, type: fieldType });

        // naive relation detection: field type matches model name (with ? or [])
        const baseType = fieldType.replace(/[\?\[\]]/g, "");
        const isArray = fieldType.endsWith("[]");
        const isOptional = fieldType.endsWith("?");

        if (modelNames.has(baseType)) {
          const cardinality = isArray
            ? '"1" --> "*"'
            : isOptional
              ? '"1" --> "0..1"'
              : '"1" --> "1"';

          relations.push({
            from: modelName,
            to: baseType,
            cardinality,
            field: fieldName,
          });
        }
      }

      i++;
    }

    i++; // skip closing brace
  }

  return { models, relations };
}

function toMermaid({ models, relations }) {
  const lines = [];
  lines.push("```mermaid");
  lines.push("classDiagram");
  lines.push("direction TB");

  for (const [modelName, fields] of models.entries()) {
    lines.push(`class ${modelName} {`);
    for (const f of fields) {
      // keep it short: show only scalar types + id-ish fields are still useful
      lines.push(`  +${f.type} ${f.name}`);
    }
    lines.push("}");
    lines.push("");
  }

  // dedupe relations (A->B duplicates)
  const seen = new Set();
  for (const r of relations) {
    const key = `${r.from}|${r.to}|${r.cardinality}`;
    if (seen.has(key)) continue;
    seen.add(key);
    lines.push(`${r.from} ${r.cardinality} ${r.to} : ${r.field}`);
  }

  lines.push("```");
  return lines.join("\n");
}

async function main() {
  const schema = await fs.readFile(schemaPath, "utf8");
  const parsed = parseSchema(schema);
  const mermaid = toMermaid(parsed);

  const out = `# Diagrama generado desde Prisma\n\nFuente: prisma/schema.prisma\n\n${mermaid}\n`;
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, out, "utf8");

  console.log(`OK: ${path.relative(ROOT, outPath)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
