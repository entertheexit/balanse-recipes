import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import Ajv from 'ajv';
const schema = JSON.parse(fs.readFileSync('schema/recipe.schema.json', 'utf8'));
const validate = new Ajv({ allErrors: true }).compile(schema);
const catalog = JSON.parse(fs.readFileSync('catalog.json', 'utf8'));
const validateCatalog = new Ajv({ allErrors: true }).compile(JSON.parse(fs.readFileSync('schema/catalog.schema.json', 'utf8')));
if (!validateCatalog(catalog)) throw new Error(JSON.stringify(validateCatalog.errors));
const ids = new Set();
const paths = new Set();
for (const entry of catalog.recipes) {
  if (!/^templates\/[a-z]{2}\/[a-z0-9-]+\/[a-z0-9.-]+\.json$/.test(entry.path)) throw new Error('Unsafe recipe path');
  if (entry.path.split('/')[1].toUpperCase() !== entry.country) throw new Error('Recipe country/path mismatch');
  if (ids.has(entry.templateId) || paths.has(entry.path)) throw new Error('Duplicate recipe');
  ids.add(entry.templateId); paths.add(entry.path);
  const text = fs.readFileSync(entry.path, 'utf8');
  const recipe = JSON.parse(text);
  if (!validate(recipe)) throw new Error(JSON.stringify(validate.errors));
  if (Buffer.byteLength(text) > 262144) throw new Error('Oversized recipe');
  for (const [key, value] of Object.entries({ templateId: recipe.templateId, institutionId: recipe.institutionId,
    country: recipe.country, statementKind: recipe.statementKind, revision: recipe.version })) {
    if (entry[key] !== value) throw new Error(`Metadata mismatch: ${key}`);
  }
  if (createHash('sha256').update(text).digest('hex') !== entry.sha256) throw new Error('Checksum mismatch');
  if (entry.schemaVersion !== 1 || entry.requiredCapabilities.join() !== 'thai-statements-v1') throw new Error('Unsupported capabilities');
  for (const pattern of [...recipe.accountHints.regexes, ...Object.entries(recipe.extraction)
    .filter(([key]) => key.endsWith('Regex')).map(([, value]) => value)]) new RegExp(pattern, 'u');
}
for (const file of fs.readdirSync('templates', { recursive: true }).map(String).filter(file => file.endsWith('.json'))) {
  if (!paths.has(`templates/${file}`)) throw new Error(`Unlisted recipe: ${file}`);
}
console.log(`Validated ${ids.size} recipes.`);

const fixtures = JSON.parse(fs.readFileSync('fixtures/regressions.json', 'utf8'));
const covered = new Set();
for (const fixture of fixtures.cases) {
  if (!ids.has(fixture.templateId) || !fixture.extracted || !Array.isArray(fixture.extracted.items) || !Array.isArray(fixture.expected) || !fixture.expected.length) throw new Error('Invalid synthetic fixture');
  for (const row of fixture.expected) {
    if (!Number.isSafeInteger(row.amountMinor) || !['debit', 'credit'].includes(row.direction) || !/^\d{4}-\d{2}-\d{2}T/.test(row.transactionDateTime)) throw new Error('Invalid parser expectation');
  }
  covered.add(fixture.templateId);
}
for (const id of ids) if (!covered.has(id)) throw new Error(`Missing synthetic fixture: ${id}`);
console.log(`Validated fixture coverage for ${covered.size} recipes. Maintainers must also run Balanse recipes:verify-fixtures.`);
