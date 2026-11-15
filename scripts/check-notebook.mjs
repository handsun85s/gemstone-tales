import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { loadContent } from './validate-content.mjs';

const { gems } = loadContent();
const app = fs.readFileSync(new URL('../dist/app.js', import.meta.url), 'utf8');
const notebookKey = 'gemstone-tales:v1';
const adventureKey = 'gemstone-tales:adventure:v1';
const legacyNote = {
  id: 'existing-note',
  gem: 'quartz',
  text: '在薄的地方能看到白纸上的线',
  date: '2026-11-03T11:00:00.000Z',
  mission: 'light',
};

function createStorage() {
  const stamps = JSON.stringify({ version: 1, completed: ['amethyst'] });
  const values = new Map([
    [notebookKey, JSON.stringify({ saved: ['quartz'], visited: ['quartz'], notes: [legacyNote] })],
    [adventureKey, stamps],
  ]);
  let blocked = false;
  return {
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) {
      if (blocked) throw new Error('QuotaExceededError');
      values.set(key, value);
    },
    blockWrites() { blocked = true; },
    snapshot() { return JSON.parse(values.get(notebookKey)); },
    checkStamps() { assert.equal(values.get(adventureKey), stamps, 'Notebook actions must preserve adventure stamps.'); },
  };
}

// Give each copy of the production app its own tab state but the same origin storage.
// This checks ordering and persistence without assuming that a DOM stub tests layout or focus.
function openTab(localStorage) {
  const nodes = new Map();
  const documentEvents = new Map();
  function node(selector) {
    if (!nodes.has(selector)) {
      const events = new Map();
      nodes.set(selector, {
        value: '',
        dataset: {},
        classList: { add() {}, remove() {}, toggle() {} },
        setAttribute() {},
        focus() {},
        showModal() { this.open = true; },
        close() { this.open = false; },
        addEventListener(name, action) { events.set(name, action); },
        dispatch(name, detail) { events.get(name)?.(detail); },
      });
    }
    return nodes.get(selector);
  }
  const window = { GEMS: gems, addEventListener() {}, scrollTo() {} };
  const document = {
    querySelector: node,
    querySelectorAll() { return []; },
    addEventListener(name, action) {
      if (!documentEvents.has(name)) documentEvents.set(name, []);
      documentEvents.get(name).push(action);
    },
  };
  function emit(name, event) {
    for (const action of documentEvents.get(name) ?? []) action(event);
  }
  function click(dataset) {
    const button = { dataset, closest() { return null; }, hasAttribute() { return false; } };
    emit('click', { target: { closest: selector => selector === 'button' ? button : null } });
  }
  vm.runInNewContext(app, {
    window, document, localStorage, location: { hash: '' },
    fetch: async () => ({ ok: false }), setTimeout() {}, clearTimeout() {},
  });
  return {
    visit(id) { emit('gemstone:visited', { detail: { id } }); },
    newNote(gem) { emit('gemstone:record', { detail: { id: gem } }); },
    type(text) {
      node('#note-text').value = text;
      node('#note-text').dispatch('input');
    },
    submit() { node('#note-form').dispatch('submit', { preventDefault() {} }); },
    edit(id) { click({ editNote: id }); },
    delete(id) {
      click({ deleteNote: id });
      assert(node('#info-dialog').open, 'Deleting a note should ask for confirmation.');
      click({ confirmDelete: id });
    },
    node,
  };
}

const storage = createStorage();
const a = openTab(storage);
const b = openTab(storage);
assert(a.node('#notes-grid').innerHTML.includes(legacyNote.text), 'Existing notes should be rendered.');
assert(a.node('#mission-grid').innerHTML.includes('已留下发现'), 'Legacy mission completion should be rendered.');

const newText = '紫水晶的两个尖端颜色深浅不同';
a.newNote('amethyst');
a.type(newText);
a.submit();
const created = storage.snapshot().notes.find(note => note.text === newText);
assert.equal(created?.gem, 'amethyst', 'Writing from a station should retain the selected gemstone.');

b.visit('fluorite');
assert.deepEqual(
  storage.snapshot().notes.map(note => note.id).sort(),
  [legacyNote.id, created.id].sort(),
  'A second tab opening a station must not erase a previously saved note.',
);
assert.deepEqual(storage.snapshot().notes.find(note => note.id === legacyNote.id), legacyNote);
assert.deepEqual(storage.snapshot().saved, ['quartz']);

const stale = openTab(storage);
const editor = openTab(storage);
const editingText = '我正在补充白水晶的观察';
editor.edit(legacyNote.id);
editor.type(editingText);
a.delete(legacyNote.id);
stale.visit('pyrite');
assert.deepEqual(
  storage.snapshot().notes.map(note => note.id),
  [created.id],
  'An unrelated write from a stale tab must not restore a deleted note.',
);
editor.submit();
assert.deepEqual(storage.snapshot().notes.map(note => note.id), [created.id], 'Editing a deleted note must not restore it.');
assert(editor.node('#note-dialog').open, 'A rejected edit should leave the editor open.');
assert.equal(editor.node('#note-text').value, editingText, 'A rejected edit must preserve the words the user typed.');
assert.match(editor.node('#note-error').textContent, /删除/);
const refreshed = openTab(storage);
assert(refreshed.node('#notes-grid').innerHTML.includes(newText));
assert(!refreshed.node('#notes-grid').innerHTML.includes(legacyNote.text));
storage.checkStamps();

const blockedStorage = createStorage();
const blockedPage = openTab(blockedStorage);
blockedPage.newNote('amethyst');
blockedPage.type(newText);
blockedStorage.blockWrites();
blockedPage.submit();
assert.deepEqual(blockedStorage.snapshot().notes, [legacyNote], 'A failed write must leave old records intact.');
assert(
  [blockedPage.node('#toast').textContent, blockedPage.node('#note-error').textContent].some(message =>
    /无法保存|保存失败|无法持久保存/.test(String(message)),
  ),
  'Saving failure should be visible to the user.',
);
assert(
  blockedPage.node('#notes-grid').innerHTML.includes(newText) ||
    (blockedPage.node('#note-dialog').open && blockedPage.node('#note-text').value === newText),
  'The unsaved text should remain available on the current page.',
);
blockedStorage.checkStamps();

console.log('手记验收通过：旧存档、从关卡记录、跨标签阅读、已删除手记的旧编辑、写入失败与印章隔离。');
