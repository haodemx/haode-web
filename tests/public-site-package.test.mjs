import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { buildPublicSite, findForbiddenFiles } from "../scripts/build-public-site.mjs";

const repoRoot = path.resolve(import.meta.dirname, "..");

async function fixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), "haode-public-site-"));
  await mkdir(path.join(root, "assets", "images"), { recursive: true });
  await mkdir(path.join(root, "tests"), { recursive: true });
  await writeFile(path.join(root, "index.html"), '<link rel="stylesheet" href="/style.css"><img src="/assets/images/logo.png">');
  await writeFile(path.join(root, "style.css"), "body{background:url('/assets/images/logo.png')}");
  await writeFile(path.join(root, "assets", "images", "logo.png"), "public-image");
  await writeFile(path.join(root, "tests", "internal-leak.txt"), "must stay private");
  return root;
}

function fixtureManifest(required = ["index.html", "style.css"]) {
  return {
    files: [...new Set(["index.html", "style.css", ...required])],
    trees: [{ path: "assets", extensions: [".png"] }],
    required,
  };
}

test("legacy whole-repository packaging is detected as an internal-file leak", async () => {
  const root = await fixture();
  await mkdir(path.join(root, "admin", "marketing-drafts"), { recursive: true });
  await writeFile(path.join(root, "admin", "marketing-drafts", "index.html"), "draft");

  const forbidden = await findForbiddenFiles(root);
  assert.deepEqual(forbidden, ["admin/marketing-drafts/index.html", "tests/internal-leak.txt"]);
});

test("allowlist build excludes prohibited paths", async () => {
  const source = await fixture();
  const output = path.join(source, "_site");
  await buildPublicSite({ sourceRoot: source, outputRoot: output, manifest: fixtureManifest() });

  assert.equal((await findForbiddenFiles(output)).length, 0);
  await assert.rejects(stat(path.join(output, "tests", "internal-leak.txt")), { code: "ENOENT" });
});

test("build fails when a required public file is missing", async () => {
  const source = await fixture();
  const output = path.join(source, "_site");

  await assert.rejects(
    buildPublicSite({ sourceRoot: source, outputRoot: output, manifest: fixtureManifest(["index.html", "CNAME"]) }),
    /Required public file is missing: CNAME/,
  );
});

test("new unapproved internal test files do not enter the package", async () => {
  const source = await fixture();
  const output = path.join(source, "_site");
  await writeFile(path.join(source, "tests", "future-private-test.js"), "private");
  await buildPublicSite({ sourceRoot: source, outputRoot: output, manifest: fixtureManifest() });

  await assert.rejects(stat(path.join(output, "tests", "future-private-test.js")), { code: "ENOENT" });
});

test("repeated builds remove stale internal files from the controlled output", async () => {
  const source = await fixture();
  const output = path.join(source, "_site");
  await buildPublicSite({ sourceRoot: source, outputRoot: output, manifest: fixtureManifest() });
  await mkdir(path.join(output, "reports"), { recursive: true });
  await writeFile(path.join(output, "reports", "stale-private.json"), "{}");

  await buildPublicSite({ sourceRoot: source, outputRoot: output, manifest: fixtureManifest() });
  await assert.rejects(stat(path.join(output, "reports", "stale-private.json")), { code: "ENOENT" });
});

test("public Firebase config preserves runtime values without exporting the admin allowlist", async () => {
  const fields = ["apiKey", "authDomain", "projectId", "storageBucket", "messagingSenderId", "appId"];
  const readConfig = async (relative) => {
    const source = await readFile(path.join(repoRoot, relative), "utf8");
    return Object.fromEntries(fields.map((field) => {
      const match = source.match(new RegExp(`${field}:\\s*"([^"]+)"`));
      assert.ok(match, `${relative} must define ${field}`);
      return [field, match[1]];
    }));
  };
  const publicSource = await readFile(path.join(repoRoot, "app/firebase-public-config.js"), "utf8");
  assert.deepEqual(await readConfig("app/firebase-public-config.js"), await readConfig("app/firebase-config.js"));
  assert.doesNotMatch(publicSource, /firebaseAdminEmails|@gmail\.com/i);
});
