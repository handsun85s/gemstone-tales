import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
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
