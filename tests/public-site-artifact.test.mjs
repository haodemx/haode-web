import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import {
  auditPublicDependencies,
  findForbiddenFiles,
  verifyPackageIntegrity,
} from "../scripts/build-public-site.mjs";

const output = path.resolve(import.meta.dirname, "..", "_site");

test("final package contains no prohibited paths", async () => {
  assert.deepEqual(await findForbiddenFiles(output), []);
});

test("final package file list and hashes match the build manifest", async () => {
  const result = await verifyPackageIntegrity(output);
  assert.equal(result.verified, true);
  assert.ok(result.fileCount > 900, "the package unexpectedly lost most public files");
});

test("final package retains required website and App dynamic resources", async () => {
  const result = await auditPublicDependencies(output);
  assert.deepEqual(result.missing, []);

  for (const relative of [
    "index.html",
    "app/index.html",
    "app/app.js",
    "app/products.json",
    "data/products.generated.js",
    "service-worker.js",
    "manifest.webmanifest",
  ]) {
    assert.ok((await stat(path.join(output, relative))).isFile(), `${relative} must be in _site`);
  }

  assert.doesNotMatch(await readFile(path.join(output, "app", "app.js"), "utf8"), /daily-ad-latest\.json/);
  assert.doesNotMatch(await readFile(path.join(output, "script.js"), "utf8"), /daily-ad-latest\.json/);
});
