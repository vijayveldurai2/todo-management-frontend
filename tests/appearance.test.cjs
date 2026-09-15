const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const cache = new Map();
function load(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} }; cache.set(file,module);
  const js = ts.transpileModule(fs.readFileSync(file,'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  new Function('require','exports','module',js)(name => {
    if (!name.startsWith('.')) return require(name);
    const base = path.resolve(path.dirname(file),name);
    return load([base+'.ts',base+'.tsx',path.join(base,'index.ts')].find(fs.existsSync));
  },module.exports,module);
  return module.exports;
}
const prefs = load('src/app/appearance/preferences.ts');
assert.deepEqual(prefs.parsePreferences(null), { theme:'system', motion:'subtle' });
for (const raw of ['broken','null','{}','{"theme":"blue","motion":"fast"}']) assert.deepEqual(prefs.parsePreferences(raw), { theme:'system', motion:'subtle' });
assert.deepEqual(prefs.parsePreferences('{"theme":"dark","motion":"off"}'), {theme:'dark',motion:'off'});
global.document = { documentElement: { dataset:{},style:{} } };
prefs.applyPreferences({theme:'dark',motion:'off'});
assert.equal(document.documentElement.style.colorScheme,'dark');
assert.equal(document.documentElement.dataset.motion,'off');
const bootstrap = fs.readFileSync('public/appearance-init.js','utf8');
for (const raw of ['{"theme":"light","motion":"off"}','broken']) {
  const doc = {documentElement:{dataset:{},style:{}}};
  vm.runInNewContext(bootstrap,{document:doc,localStorage:{getItem:()=>raw}});
  assert.equal(doc.documentElement.dataset.theme,prefs.parsePreferences(raw).theme);
}
const { LinearLoader, ZigzagLoader } = load('src/components/loaders/Indicators.tsx');
const { LoadingButton } = load('src/components/loaders/LoadingButton.tsx');
const progress = renderToStaticMarkup(React.createElement(LinearLoader,{value:150}));
assert.match(progress,/aria-valuenow="100"/);
assert.doesNotMatch(renderToStaticMarkup(React.createElement(LinearLoader)),/aria-valuenow/);
const button = renderToStaticMarkup(React.createElement(LoadingButton,{loading:true,loadingLabel:'Saving'},'Save'));
assert.match(button,/disabled=""/); assert.match(button,/aria-busy="true"/); assert.match(button,/Saving/);
const waves = renderToStaticMarkup(React.createElement('div',null,React.createElement(ZigzagLoader),React.createElement(ZigzagLoader)));
const ids = [...waves.matchAll(/clipPath id="([^"]+)"/g)].map(m=>m[1]); assert.equal(new Set(ids).size,2);
console.log('Appearance persistence, early theme, accessible loaders and unique SVG IDs passed');
