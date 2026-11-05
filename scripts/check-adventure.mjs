import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { loadContent } from './validate-content.mjs';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const context = {};
vm.runInNewContext(fs.readFileSync(dist+'island-progress.js','utf8'), context);
const progress = context.GemIslandProgress;
const oldKey = 'gemstone-tales:v1';
const previous = JSON.stringify({saved:['amethyst','quartz'],visited:['amethyst'],notes:[{id:'old-note',gem:'quartz',text:'我的旧发现：光能穿过薄的地方。',date:'2026-11-03T11:00:00.000Z',mission:'light'}]});
const values = new Map([[oldKey, previous]]);
const storage = {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
assert.equal(progress.read(storage).length,0);
assert.equal(values.get(oldKey),previous,'Reading island progress must leave the old notebook unchanged.');
assert.equal(progress.canCollect('amethyst',null,'quiz'),false);
assert.equal(progress.canCollect('amethyst','fluorite','quiz'),false);
assert.equal(progress.canCollect('amethyst','amethyst','observe'),false);
assert.equal(progress.canCollect('amethyst','amethyst','done'),false);
assert.equal(progress.canCollect('unknown','unknown','quiz'),false);
assert.equal(progress.canCollect('amethyst','amethyst','quiz'),true);
assert.equal(progress.save(storage,['amethyst','amethyst','unknown']),true);
assert.deepEqual(Array.from(progress.read(storage)),['amethyst'],'Repeat completion must not duplicate a stamp.');
assert.equal(values.get(oldKey),previous,'Saving island progress must preserve all old data byte for byte.');
assert.equal(progress.save(storage,['pyrite','amethyst','fluorite','pyrite']),true);
assert.equal(progress.read(storage).length,3);
assert.equal(progress.save(null,['amethyst']),false);
const blocked={getItem(){throw new Error('blocked');},setItem(){throw new Error('quota');}};
assert.equal(progress.read(blocked).length,0);
assert.equal(progress.save(blocked,['amethyst']),false);
values.set(progress.key,'{broken');assert.equal(progress.read(storage).length,0);
values.set(progress.key,JSON.stringify({version:1,completed:['amethyst','amethyst','unknown',null,42]}));
assert.deepEqual(Array.from(progress.read(storage)),['amethyst']);
assert.equal(values.get(oldKey),previous);

const html=fs.readFileSync(dist+'index.html','utf8');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(new Set(ids).size,ids.length,'The integrated page must not contain duplicate IDs.');
for(const view of ['island','atlas','missions','notebook'])assert(html.includes(`id="view-${view}"`),`Missing ${view} view`);
for(const file of ['app.js','gems.js','island.css','adventure-theme.css','island-progress.js','island.js']){
  assert(fs.existsSync(dist+file),`Missing ${file}`);
  assert(html.includes(`"${file}"`),`Page does not load ${file}`);
}
new vm.Script(fs.readFileSync(dist+'app.js','utf8'));
new vm.Script(fs.readFileSync(dist+'island.js','utf8'));
console.log('冒险岛检查通过：旧手记隔离、印章去重与刷新恢复、答对门槛、异常存储容错、页面集成与资源完整。');


const routeContext = {window:{}};
vm.runInNewContext(fs.readFileSync(dist+'island-routes.js','utf8'), routeContext);
const routes = routeContext.window.GemIslandRoutes;
const {gems} = loadContent();
const gemIds = routes.flatMap(route => route.ids);
const allowed = [...gemIds, ...routes.map(route => route.id)];
assert.equal(routes.length, 5);
assert(routes.every(route => route.ids.length === 10 && route.questions.length === 2));
assert(gemIds.length >= 50);
assert.equal(new Set(allowed).size, allowed.length, 'Every station and case needs a unique ID.');
assert.deepEqual([...gemIds].sort(), Array.from(gems, gem => gem.id).sort(), 'Every atlas entry must be playable.');

// Run the real event handlers with the minimal DOM surface used by the adventure.
// Browser layout is checked separately. Here we verify every station and unlock edge.
const nodes = new Map();
const handlers = new Map();
const makeNode = () => ({
  dataset:{}, style:{setProperty(){}}, classList:{toggle(){},add(){}},
  focus(){}, setAttribute(){}, hidden:true,
  querySelector:() => makeNode(),
  querySelectorAll:() => Array.from({length:3}, makeNode)
});
const node = selector => {
  if (!nodes.has(selector)) nodes.set(selector, makeNode());
  return nodes.get(selector);
};
const gameDialog = node('#explore-dialog');
gameDialog.showModal = () => { gameDialog.open = true; };
gameDialog.close = () => { gameDialog.open = false; };
gameDialog.addEventListener = () => {};
const content = node('#dialog-content');
Object.defineProperty(content, 'innerHTML', {
  get() { return this.html; },
  set(markup) {
    this.html = markup;
    node('#feedback').hidden = true;
    node('#feedback').innerHTML = '';
  }
});
const gameContext = {
  window:{GEMS:gems,GemIslandRoutes:routes,GemIslandProgress:progress,addEventListener(){}},
  localStorage:storage,
  CustomEvent:class {},
  document:{
    addEventListener(name, handler) { handlers.set(name, handler); },
    querySelector:node, querySelectorAll:() => [], dispatchEvent(){}
  }
};
function click(attributes, dataset = {}, inside = true) {
  const button = {
    dataset, closest:() => inside ? gameDialog : null,
    hasAttribute:name => attributes.includes(name)
  };
  handlers.get('click')({target:{closest:() => button}});
}
function openStation(id) {
  click([], {station:id}, false);
  assert(gameDialog.open, id + ' did not open.');
  assert(content.innerHTML.includes('data-next'));
  click(['data-next']);
}
function solve(expectedAction) {
  assert.equal([...content.innerHTML.matchAll(/data-answer="/g)].length, 3);
  for (let index = 0; index < 3; index++) {
    click(['data-answer'], {answer:index});
    if (node('#feedback').innerHTML.includes('data-' + expectedAction)) {
      click(['data-' + expectedAction]);
      return;
    }
    assert(node('#feedback').innerHTML.includes('data-retry'), 'Wrong answers must allow retry.');
    click(['data-retry']);
  }
  assert.fail('No valid answer found.');
}
const initialize = () => {
  vm.runInNewContext(fs.readFileSync(dist+'island.js','utf8'),gameContext);
  handlers.get('DOMContentLoaded')();
};
initialize();
assert.equal(node('#header-count').textContent, 1, 'The old amethyst stamp should carry forward.');
assert.equal(node('#chapter-case').disabled, true);
click([], {station:routes[0].id}, false);
assert(!gameDialog.open, 'A locked case must not open.');
for (const route of routes) {
  for (const id of route.ids) {
    openStation(id);
    click(['data-collect']);
    assert(!content.innerHTML.includes('回到冒险地图</button>'), 'Cannot claim a stamp before solving both questions.');
    solve('advance');
    assert(content.innerHTML.includes('② 比较与推理'));
    solve('collect');
    assert(content.innerHTML.includes('印章到手'));
    gameDialog.close();
  }
  assert.equal(node('#chapter-case').disabled, false);
  openStation(route.id);
  solve('advance');
  solve('collect');
  gameDialog.close();
}
assert.equal(node('#header-count').textContent, 50);
assert(node('#stamp-subtitle').textContent.includes('宝石研究员'));
assert.equal(progress.read(storage, allowed).length, 55);
assert.equal(values.get(oldKey), previous, 'The existing notebook must remain untouched.');
initialize();
assert.equal(node('#header-count').textContent, 50);
assert(node('#stamp-subtitle').textContent.includes('宝石研究员'));
console.log('全岛通关检查通过：50 个站点、110 道题、5 次案件解锁、重试、旧存档及刷新恢复。');
