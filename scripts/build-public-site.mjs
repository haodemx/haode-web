import { createHash } from "node:crypto";
import {
  cp,
  lstat,
  mkdir,
  readFile,
  readdir,
  realpath,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FORBIDDEN = [
  /^\.codex(?:\/|$)/,
  /^\.github(?:\/|$)/,
  /^admin\/marketing-drafts(?:\/|$)/,
  /^android(?:\/|$)/,
  /^app\/admin\.(?:css|html|js)$/,
  /^app\/firebase-config\.js$/,
  /^codex-skills(?:\/|$)/,
  /^data\/(?:backups|maintenance|marketing)(?:\/|$)/,
  /^docs(?:\/|$)/,
  /^reports(?:\/|$)/,
  /^scripts(?:\/|$)/,
  /^tests(?:\/|$)/,
  /^tools(?:\/|$)/,
  /(?:^|\/)(?:\.DS_Store|[^/]*\.(?:bak|log|tmp))$/i,
];
const TEXT_EXTENSIONS = new Set([".css", ".html", ".js", ".json", ".webmanifest", ".xml"]);
const RESOURCE_EXTENSIONS = new Set([
  ".avif", ".css", ".gif", ".html", ".ico", ".jpeg", ".jpg", ".js", ".json", ".mp4",
  ".png", ".svg", ".txt", ".webm", ".webmanifest", ".webp", ".woff", ".woff2", ".xml",
]);
const LOCAL_ORIGIN = "https://haode.com.mx";

function safeRelative(relative) {
  if (typeof relative !== "string" || !relative || path.isAbsolute(relative) || relative.includes("\0")) {
    throw new Error(`Unsafe public path: ${String(relative)}`);
  }
  const normalized = relative.replaceAll("\\", "/").replace(/^\.\//, "");
  if (normalized === ".." || normalized.startsWith("../") || normalized.includes("/../")) {
    throw new Error(`Unsafe public path: ${relative}`);
  }
  return normalized;
}

async function assertRegularSource(sourceRoot, relative) {
  const safe = safeRelative(relative);
  const absolute = path.join(sourceRoot, safe);
  const info = await lstat(absolute).catch((error) => {
    if (error.code === "ENOENT") throw new Error(`Public source is missing: ${safe}`);
    throw error;
  });
  if (info.isSymbolicLink()) throw new Error(`Symbolic links are forbidden in the public package: ${safe}`);
  if (!info.isFile()) throw new Error(`Public source is not a regular file: ${safe}`);
  const resolved = await realpath(absolute);
  const sourcePrefix = `${await realpath(sourceRoot)}${path.sep}`;
  if (!resolved.startsWith(sourcePrefix)) throw new Error(`Public source escapes the repository: ${safe}`);
  return { safe, absolute };
}

async function walkTree(sourceRoot, tree) {
  const treePath = safeRelative(tree.path);
  const root = path.join(sourceRoot, treePath);
  const rootInfo = await lstat(root).catch((error) => {
    if (error.code === "ENOENT") throw new Error(`Public tree is missing: ${treePath}`);
    throw error;
  });
  if (rootInfo.isSymbolicLink() || !rootInfo.isDirectory()) {
    throw new Error(`Public tree must be a real directory: ${treePath}`);
  }
  const allowed = new Set(tree.extensions.map((value) => value.toLowerCase()));
  const files = [];
  async function visit(directory, relativeDirectory) {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      const relative = path.posix.join(relativeDirectory, entry.name);
      const absolute = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`Symbolic links are forbidden in the public package: ${relative}`);
      if (entry.isDirectory()) {
        await visit(absolute, relative);
      } else if (entry.isFile() && allowed.has(path.extname(entry.name).toLowerCase())) {
        files.push(relative);
      }
    }
  }
  await visit(root, treePath);
  return files;
}

async function allFiles(root) {
  const files = [];
  async function visit(directory, relativeDirectory = "") {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const relative = path.posix.join(relativeDirectory, entry.name);
      if (entry.isDirectory()) await visit(path.join(directory, entry.name), relative);
      else if (entry.isFile()) files.push(relative);
      else if (entry.isSymbolicLink()) files.push(relative);
    }
  }
  await visit(root);
  return files.sort();
}

export async function findForbiddenFiles(root) {
  const files = await allFiles(root);
  return files.filter((relative) => FORBIDDEN.some((pattern) => pattern.test(relative)));
}

function normalizeUrl(raw, sourceFile, allowRoute) {
  const value = raw.trim().replaceAll("&amp;", "&");
  if (!value || value.startsWith("#") || /^(?:data|mailto|tel|javascript):/i.test(value) || value.includes("${")) return null;
  let url;
  try {
    url = new URL(value, new URL(path.posix.dirname(`/${sourceFile}`) + "/", LOCAL_ORIGIN));
  } catch {
    return null;
  }
  if (url.origin !== LOCAL_ORIGIN) return null;
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    pathname = url.pathname;
  }
  const relative = pathname.replace(/^\/+/, "");
  if (!relative) return "index.html";
  if (pathname.endsWith("/")) return allowRoute || pathname === "/app/" ? `${relative}index.html` : null;
  const extension = path.posix.extname(relative).toLowerCase();
  if (!extension) return allowRoute ? `${relative}/index.html` : null;
  if (!RESOURCE_EXTENSIONS.has(extension)) return null;
  return relative;
}

function referencedUrls(text, sourceFile) {
  const values = new Set();
  const patterns = [
    { regex: /(?:src|href|poster)\s*=\s*["']([^"']+)["']/gi, allowRoute: true },
    { regex: /url\(\s*["']?([^"')]+)["']?\s*\)/gi, allowRoute: false },
    { regex: /["'`](\/(?:assets|app|data|categoria|producto|productos|manifest\.webmanifest|offline\.html|service-worker\.js)[^"'`\s)]*)["'`]/g, allowRoute: false },
  ];
  for (const { regex, allowRoute } of patterns) {
    for (const match of text.matchAll(regex)) {
      const normalized = normalizeUrl(match[1], sourceFile, allowRoute);
      if (normalized) values.add(normalized);
    }
  }
  return values;
}

export async function auditPublicDependencies(outputRoot) {
  const files = await allFiles(outputRoot);
  const available = new Set(files);
  const missing = new Set();
  for (const relative of files) {
    if (!TEXT_EXTENSIONS.has(path.extname(relative).toLowerCase())) continue;
    const text = await readFile(path.join(outputRoot, relative), "utf8");
    for (const dependency of referencedUrls(text, relative)) {
      if (!available.has(dependency)) missing.add(`${relative} -> ${dependency}`);
    }
  }
  return { checkedFiles: files.length, missing: [...missing].sort() };
}

async function hashFile(file) {
  return createHash("sha256").update(await readFile(file)).digest("hex");
}

export async function verifyPackageIntegrity(outputRoot) {
  const manifestFile = path.join(outputRoot, ".public-package.json");
  const manifest = JSON.parse(await readFile(manifestFile, "utf8"));
  if (manifest.version !== 1 || !manifest.files || Array.isArray(manifest.files)) {
    throw new Error("Invalid public package integrity manifest");
  }
  const actualFiles = (await allFiles(outputRoot)).filter((relative) => relative !== ".public-package.json");
  const expectedFiles = Object.keys(manifest.files).sort();
  if (JSON.stringify(actualFiles) !== JSON.stringify(expectedFiles)) {
    throw new Error("Public package file list does not match its integrity manifest");
  }
  const mismatches = [];
  for (const relative of actualFiles) {
    const actual = await hashFile(path.join(outputRoot, relative));
    if (actual !== manifest.files[relative]) mismatches.push(relative);
  }
  if (mismatches.length) throw new Error(`Public package hash mismatch:\n${mismatches.join("\n")}`);
  return { fileCount: actualFiles.length, verified: true };
}

export async function buildPublicSite({
  sourceRoot = DEFAULT_ROOT,
  outputRoot = path.join(sourceRoot, "_site"),
  manifest,
  manifestPath = path.join(sourceRoot, "public-site-files.json"),
} = {}) {
  const source = path.resolve(sourceRoot);
  const output = path.resolve(outputRoot);
  if (output === source || output === path.parse(output).root) throw new Error(`Unsafe output directory: ${output}`);
  const config = manifest ?? JSON.parse(await readFile(manifestPath, "utf8"));
  const selected = new Set(config.files.map(safeRelative));
  for (const tree of config.trees) {
    for (const relative of await walkTree(source, tree)) selected.add(relative);
  }
  for (const required of config.required.map(safeRelative)) {
    if (!selected.has(required)) throw new Error(`Required public file is not allowlisted: ${required}`);
    await stat(path.join(source, required)).catch((error) => {
      if (error.code === "ENOENT") throw new Error(`Required public file is missing: ${required}`);
      throw error;
    });
  }

  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  for (const relative of [...selected].sort()) {
    const { absolute } = await assertRegularSource(source, relative);
    const destination = path.join(output, relative);
    await mkdir(path.dirname(destination), { recursive: true });
    await cp(absolute, destination, { dereference: false, errorOnExist: true });
  }

  const forbidden = await findForbiddenFiles(output);
  if (forbidden.length) throw new Error(`Forbidden files entered the public package:\n${forbidden.join("\n")}`);
  const dependencyAudit = await auditPublicDependencies(output);
  if (dependencyAudit.missing.length) throw new Error(`Missing public dependencies:\n${dependencyAudit.missing.join("\n")}`);

  const packagedFiles = await allFiles(output);
  const hashes = {};
  for (const relative of packagedFiles) hashes[relative] = await hashFile(path.join(output, relative));
  await writeFile(
    path.join(output, ".public-package.json"),
    `${JSON.stringify({ version: 1, files: hashes }, null, 2)}\n`,
  );
  return { outputRoot: output, fileCount: packagedFiles.length + 1, dependencyAudit };
}

function cliArg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const sourceRoot = path.resolve(cliArg("--source") || DEFAULT_ROOT);
  const outputRoot = path.resolve(cliArg("--output") || path.join(sourceRoot, "_site"));
  const manifestPath = path.resolve(cliArg("--manifest") || path.join(sourceRoot, "public-site-files.json"));
  buildPublicSite({ sourceRoot, outputRoot, manifestPath })
    .then((result) => console.log(`Public site built: ${result.fileCount} files -> ${result.outputRoot}`))
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
