#!/usr/bin/env node
/**
 * Sincroniza questionnaires/ con questionnaires/manifest.json y prepara la app.
 *
 * - Detecta carpetas con {slug}/{slug}.json
 * - Añade o corrige entradas en manifest.json (jsonFile; pdfFile solo si existe el PDF)
 * - Añade created_at / updated_at al JSON si faltan (requerido por QuestionnaireModel)
 * - Si cambia la lista de cuestionarios (orden/entradas/pdfFile), incrementa cacheVersion en src/config/config.js
 *
 * Uso:
 *   node scripts/sync-questionnaires-manifest.mjs
 *   node scripts/sync-questionnaires-manifest.mjs --dry-run
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const QUESTIONNAIRES_DIR = path.join(ROOT, 'questionnaires');
const MANIFEST_PATH = path.join(QUESTIONNAIRES_DIR, 'manifest.json');
const CONFIG_PATH = path.join(ROOT, 'src', 'config', 'config.js');

const dryRun = process.argv.includes('--dry-run');

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function todayIsoZ() {
  return new Date().toISOString().slice(0, 19) + 'Z';
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  const text = `${JSON.stringify(data, null, 2)}\n`;
  if (!dryRun) {
    fs.writeFileSync(filePath, text, 'utf8');
  }
  return text;
}

function discoverQuestionnaireSlugs() {
  if (!fs.existsSync(QUESTIONNAIRES_DIR)) {
    throw new Error(`No existe la carpeta: ${QUESTIONNAIRES_DIR}`);
  }
  const slugs = [];
  for (const name of fs.readdirSync(QUESTIONNAIRES_DIR, { withFileTypes: true })) {
    if (!name.isDirectory() || name.name.startsWith('.')) continue;
    const slug = name.name;
    const jsonPath = path.join(QUESTIONNAIRES_DIR, slug, `${slug}.json`);
    if (fs.existsSync(jsonPath)) {
      slugs.push(slug);
    }
  }
  slugs.sort();
  return slugs;
}

function ensureQuestionnaireJson(slug) {
  const jsonPath = path.join(QUESTIONNAIRES_DIR, slug, `${slug}.json`);
  const raw = fs.readFileSync(jsonPath, 'utf8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    const trimmed = raw.trim();
    const isEmpty = trimmed.length === 0;
    const isIncomplete = e instanceof SyntaxError && e.message.includes('Unexpected end of JSON input');

    console.error(`[error] JSON inválido: ${jsonPath}`);
    if (isEmpty || isIncomplete) {
      console.error(
        `[error] El archivo está vacío o incompleto. ` +
          `Asegúrate de que ${slug}.json tenga un objeto JSON válido con llaves de apertura y cierre.`
      );
    } else {
      console.error(`[error] Detalle del parser: ${e.message}`);
    }
    return null;
  }

  let changed = false;
  const stamp = todayIsoZ();

  if (!data.created_at) {
    data.created_at = stamp;
    changed = true;
  }
  if (!data.updated_at) {
    data.updated_at = stamp;
    changed = true;
  }

  if (data.id !== slug) {
    console.warn(
      `[warn] ${slug}: el campo "id" en el JSON es "${data.id}" pero la carpeta es "${slug}". ` +
        `La app usa el id del JSON; conviene alinearlos manualmente.`
    );
  }

  if (changed) {
    const out = `${JSON.stringify(data, null, 2)}\n`;
    if (!dryRun) {
      fs.writeFileSync(jsonPath, out, 'utf8');
    }
    console.log(`[json] ${slug}: añadidos o actualizados metadatos de fecha (${dryRun ? 'dry-run' : 'escrito'})`);
  }

  return data;
}

function buildManifestEntry(slug, previousItem) {
  const defaultPdf = path.join(QUESTIONNAIRES_DIR, slug, `${slug}.pdf`);
  const entry = {
    id: slug,
    jsonFile: `${slug}/${slug}.json`
  };

  if (fs.existsSync(defaultPdf)) {
    entry.pdfFile = `${slug}/${slug}.pdf`;
    return entry;
  }

  const legacy = previousItem?.pdfFile
    ? path.join(QUESTIONNAIRES_DIR, previousItem.pdfFile)
    : null;
  if (legacy && fs.existsSync(legacy)) {
    entry.pdfFile = previousItem.pdfFile;
    console.log(`[pdf] ${slug}: usando pdfFile existente del manifest: ${previousItem.pdfFile}`);
    return entry;
  }

  const dir = path.join(QUESTIONNAIRES_DIR, slug);
  const pdfs = fs.existsSync(dir)
    ? fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.pdf'))
    : [];
  if (pdfs.length === 1) {
    entry.pdfFile = `${slug}/${pdfs[0]}`;
    console.log(`[pdf] ${slug}: detectado un PDF en la carpeta → ${entry.pdfFile}`);
    return entry;
  }

  if (previousItem?.pdfFile) {
    entry.pdfFile = previousItem.pdfFile;
    console.warn(
      `[warn] ${slug}: no se encontró el PDF en disco; se conserva pdfFile del manifest: ${previousItem.pdfFile}`
    );
    return entry;
  }

  console.warn(`[warn] ${slug}: sin PDF reconocible (${slug}.pdf u otro único .pdf en la carpeta)`);
  return entry;
}

function mergeManifestItems(existingItems, slugs) {
  const previousById = new Map((existingItems || []).map((item) => [item.id, item]));
  const order = [];
  const seen = new Set();

  for (const item of existingItems || []) {
    if (slugs.includes(item.id)) {
      order.push(item.id);
      seen.add(item.id);
    } else {
      console.warn(`[warn] manifest tenía "${item.id}" pero ya no hay carpeta válida; se omite`);
    }
  }

  for (const slug of slugs) {
    if (!seen.has(slug)) {
      order.push(slug);
      seen.add(slug);
    }
  }

  return order.map((slug) => buildManifestEntry(slug, previousById.get(slug)));
}

function bumpCacheVersionIfNeeded(questionnairesChanged) {
  if (!questionnairesChanged || dryRun) return;
  let src = fs.readFileSync(CONFIG_PATH, 'utf8');
  const re = /cacheVersion:\s*(\d+)/;
  const m = src.match(re);
  if (!m) {
    console.warn(`[warn] no se encontró cacheVersion en ${CONFIG_PATH}`);
    return;
  }
  const next = String(Number(m[1]) + 1);
  src = src.replace(re, `cacheVersion: ${next}`);
  fs.writeFileSync(CONFIG_PATH, src, 'utf8');
  console.log(`[config] cacheVersion: ${m[1]} → ${next}`);
}

function main() {
  const slugs = discoverQuestionnaireSlugs();
  if (slugs.length === 0) {
    console.log('No se encontró ninguna carpeta con {slug}/{slug}.json');
    process.exit(0);
  }

  const validSlugs = [];
  const invalidSlugs = [];
  for (const slug of slugs) {
    const data = ensureQuestionnaireJson(slug);
    if (data) {
      validSlugs.push(slug);
    } else {
      invalidSlugs.push(slug);
    }
  }

  if (invalidSlugs.length > 0) {
    console.warn(
      `[warn] Se omitieron ${invalidSlugs.length} cuestionario(s) con JSON inválido: ${invalidSlugs.join(', ')}`
    );
  }

  if (validSlugs.length === 0) {
    console.error('[fatal] No hay cuestionarios válidos para sincronizar.');
    process.exit(1);
  }

  const previous = readJson(MANIFEST_PATH);
  const previousQuestionnaires = previous.questionnaires || [];
  const nextQuestionnaires = mergeManifestItems(previousQuestionnaires, validSlugs);
  const questionnairesChanged =
    JSON.stringify(nextQuestionnaires) !== JSON.stringify(previousQuestionnaires);

  if (!questionnairesChanged) {
    console.log('manifest.json: lista de cuestionarios ya coincidía con las carpetas.');
    process.exit(0);
  }

  const next = {
    version: previous.version || '1.0',
    lastUpdated: todayDateString(),
    questionnaires: nextQuestionnaires
  };

  const nextText = JSON.stringify(next, null, 2) + '\n';

  console.log(dryRun ? '[dry-run] manifest quedaría así:' : '[manifest] escribiendo cambios...');
  if (dryRun) {
    console.log(nextText);
  } else {
    writeJson(MANIFEST_PATH, next);
  }

  bumpCacheVersionIfNeeded(questionnairesChanged);
  console.log('Listo.');
}

try {
  main();
} catch (error) {
  console.error(`[fatal] ${error.message}`);
  process.exit(1);
}
