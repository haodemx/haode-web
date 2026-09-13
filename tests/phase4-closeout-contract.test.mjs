import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import test from "node:test";

const execFileAsync = promisify(execFile);
const root = path.resolve(import.meta.dirname, "..");

test("the current branch does not track internal admin surfaces or admin allowlists", async () => {
  const { stdout } = await execFileAsync("git", ["ls-files"], { cwd: root });
  const tracked = stdout.trim().split("\n").filter(Boolean);
  const prohibited = tracked.filter((file) =>
    file.startsWith("admin/marketing-drafts/")
      || [
        "app/admin.css",
        "app/admin.html",
        "app/admin.js",
        "app/firebase-config.js",
      ].includes(file),
  );

  assert.deepEqual(prohibited, []);

  for (const relative of [
    "admin/marketing-drafts/index.html",
    "app/admin.css",
    "app/admin.html",
    "app/admin.js",
    "app/firebase-config.js",
  ]) {
    await assert.doesNotReject(
      execFileAsync("git", ["check-ignore", "--quiet", relative], { cwd: root }),
      `${relative} must stay ignored`,
    );
  }
});

test("homepage help links resolve to the existing shipping, FAQ, and product-support content", async () => {
  const homepage = await readFile(path.join(root, "index.html"), "utf8");
  const contact = await readFile(path.join(root, "contacto", "index.html"), "utf8");
  const warranty = await readFile(path.join(root, "garantia", "index.html"), "utf8");

  assert.match(homepage, /href="\/contacto\/#envios">Consultar envíos<\/a>/);
  assert.match(homepage, /href="\/contacto\/#contacto-faq">Preguntas frecuentes<\/a>/);
  assert.match(homepage, /href="\/garantia\/#soporte">Soporte de producto<\/a>/);
  assert.match(contact, /id="envios"/);
  assert.match(contact, /id="contacto-faq"/);
  assert.match(warranty, /id="soporte"/);
});

test("public warranty routes do not expose the internal copywriting note", async () => {
  const internalNote = /Basado en el mismo lenguaje de confianza que usan los mejores sitios mayoristas/i;
  for (const relative of ["garantia.html", path.join("garantia", "index.html")]) {
    assert.doesNotMatch(await readFile(path.join(root, relative), "utf8"), internalNote, relative);
  }
});
