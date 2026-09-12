import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const ROOT = path.resolve(import.meta.dirname, "..");
const workflow = await readFile(path.join(ROOT, ".github", "workflows", "haode-check.yml"), "utf8");

function job(name, nextName) {
  const start = workflow.indexOf(`  ${name}:\n`);
  assert.notEqual(start, -1, `missing ${name} job`);
  const end = nextName ? workflow.indexOf(`  ${nextName}:\n`, start + 1) : workflow.length;
  assert.notEqual(end, -1, `missing ${nextName} job after ${name}`);
  return workflow.slice(start, end);
}

test("pull requests exercise the cross-job public artifact integrity chain", () => {
  const critical = job("critical-business-gate", "verify-transferred-artifact");
  const transfer = job("verify-transferred-artifact", "package-pages");

  assert.match(critical, /name: haode-public-site-\$\{\{ github\.sha \}\}/);
  assert.match(critical, /path: _site/);
  assert.doesNotMatch(transfer, /^\s+if:/m, "transfer verification must run on pull_request and branch push");
  assert.match(transfer, /needs: critical-business-gate/);
  assert.match(transfer, /actions\/download-artifact@/);
  assert.match(transfer, /name: haode-public-site-\$\{\{ github\.sha \}\}/);
  assert.match(transfer, /run: npm run verify:public-site/);
});

test("Pages packaging consumes the tested artifact without rebuilding it", () => {
  const packagePages = job("package-pages", "deploy-pages");
  const deployPages = job("deploy-pages", "live-verify");
  const liveVerify = job("live-verify");

  assert.match(packagePages, /if: github\.event_name == 'push' && github\.ref == 'refs\/heads\/main'/);
  assert.match(packagePages, /verify-transferred-artifact/);
  assert.match(packagePages, /actions\/download-artifact@/);
  assert.match(packagePages, /run: npm run verify:public-site/);
  assert.doesNotMatch(packagePages, /npm run build|build-public-site|git archive/);
  assert.match(deployPages, /if: github\.event_name == 'push' && github\.ref == 'refs\/heads\/main'/);
  assert.match(liveVerify, /if: github\.event_name == 'push' && github\.ref == 'refs\/heads\/main'/);
});
