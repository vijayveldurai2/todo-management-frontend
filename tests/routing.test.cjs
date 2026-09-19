const assert = require('node:assert/strict');
const fs = require('node:fs');
const { createRequire } = require('node:module');
const requireProject = createRequire(process.cwd() + '/package.json');
const ts = requireProject('typescript');
const source = fs.readFileSync('src/app/paths.ts', 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const exportsObject = {};
new Function('exports', js)(exportsObject);
const { parsePath, todoPath, projectPath } = exportsObject;
for (const [url, kind] of [
  ['/_/settings','static'], ['/_/notifications','static'],
  ['/morning-bakery/_/settings','static'], ['/morning-bakery/_/notifications','static'],
  ['/morning-bakery/orders/_/board','project'], ['/morning-bakery/orders/_/list','project'],
  ['/morning-bakery/orders/ord-12','todo'], ['/settings/board/abc-1','todo'],
  ['/Acme/website/abc-1','missing'], ['/acme/Website/abc-1','missing'],
  ['/acme/website/ABC-1','missing'], ['/acme/website/abc-x','missing'],
  ['/acme/website/board','missing'], ['/acme/website/_','missing'],
  ['/acme/website/_/BOARD','missing'], ['/w/acme/p/website/board','missing'],
  ['/acme/website/abc-1/extra','missing'], ['/acme/website/abc-1/','missing'],
  ['/acme/_/abc-1','missing'], ['/_/website/abc-1','missing'],
]) assert.equal(parsePath(url).kind, kind, url);
assert.equal(todoPath('morning-bakery','orders','ord-12'), '/morning-bakery/orders/ord-12');
assert.equal(projectPath('morning-bakery','orders','board'), '/morning-bakery/orders/_/board');
console.log('22 routing assertions passed');
