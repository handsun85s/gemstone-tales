/* Persistent island stamps have their own key, independent of the existing notebook. */
((scope) => {
  'use strict';
  const key = 'gemstone-tales:adventure:v1';
  const stationIds = Object.freeze(['amethyst','fluorite','pyrite']);
  const normalize = (values, allowed = stationIds) => [...new Set((Array.isArray(values) ? values : []).filter(id => typeof id === 'string' && allowed.includes(id)))];
  function read(storage, allowed = stationIds) {
    try {
      const value = JSON.parse(storage?.getItem(key) || 'null');
      return value?.version === 1 ? normalize(value.completed, allowed) : [];
    } catch { return []; }
  }
  function save(storage, completed) {
    try {
      if (!storage) return false;
      storage.setItem(key, JSON.stringify({version:1,completed:normalize(completed)}));
      return true;
    } catch { return false; }
  }
  function canCollect(stationId, solvedId, step) {
    return stationIds.includes(stationId) && solvedId === stationId && step === 'quiz';
  }
  scope.GemIslandProgress = Object.freeze({key,stationIds,read,save,canCollect});
})(globalThis);
