'use strict';
(() => {
  const icons = {
    gem: '<path d="m4 4 16 0 3 6-11 12L1 10Z"/><path d="m4 4 4 6 4-6 4 6 4-6M1 10h22M8 10l4 12 4-12"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5Z"/>',
    book: '<path d="M12 5v16M12 5C8 2 3 3 2 4v15c3-1 7-1 10 2 3-3 7-3 10-2V4c-1-1-6-2-10 1Z"/>',
    sparkles: '<path d="m12 2 2.8 7.2L22 12l-7.2 2.8L12 22l-2.8-7.2L2 12l7.2-2.8ZM20 2v4m-2-2h4"/>',
    'arrow-right': '<path d="M4 12h16m-6-6 6 6-6 6"/>',
    'arrow-up-right': '<path d="M6 18 18 6M6 6h12v12"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    pencil: '<path d="m15 4 5 5M3 21l5-1L21 7a2 2 0 0 0-5-5L3 15Z"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    bookmark: '<path d="M6 3h12v18l-6-4-6 4Z"/>',
    heart: '<path d="M12 21 3 12C-3 4 7-2 12 5c5-7 15-1 9 7Z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    x: '<path d="m6 6 12 12M6 18 18 6"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 1v2m0 18v2M1 12h2m18 0h2M4 4l1.5 1.5m13 13L20 20M4 20l1.5-1.5m13-13L20 4"/>',
    layers: '<path d="m12 2 10 6-10 6L2 8Zm-10 11 10 6 10-6M2 18l10 5 10-5"/>',
    shield: '<path d="m12 2 9 4v6c0 6-9 10-9 10S3 18 3 12V6Z"/><path d="m8 12 3 3 5-6"/>',
  };
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.gem}</svg>`;
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const hydrate = (root = document) => $$('[data-icon]', root).forEach(el => { el.innerHTML = icon(el.dataset.icon); });
  hydrate();
  const gems = window.GEMS || [];
  if (!gems.length) {
    $('#gem-grid').innerHTML = '<p>图鉴暂时没有加载成功，请刷新页面再试。</p>';
    return;
  }
  const byId = id => gems.find(g => g.id === id);
  const tint = { amethyst:'#eee8f2',quartz:'#eeefeb','rose-quartz':'#f4e9e8',fluorite:'#e8eee9',pyrite:'#efecdf',malachite:'#e5ebe3',agate:'#f0e7dd',aquamarine:'#e6edef' };
  const colors = {紫色:'#b29bcb',无色:'#f5f3ea',粉色:'#e2b6bf',多色:'conic-gradient(#b1c4a7,#b1a0d1,#e3bdcb,#b1c4a7)',金色:'#c8b46f',绿色:'#9bb693',蓝色:'#9cbdc8',红色:'#e5a093',黄色:'#e7c76a',橙色:'#ecb18c',棕色:'#b5977e',黑色:'#778084',白色:'#eeede4'};
  const mineralColors = {fluorite:['多色','紫色','绿色','无色']};
  const gemColors = g => mineralColors[g.id] || [g.color];
  const gemTint = g => tint[g.id] || '#eef3e3';
  const noteDrafts = new Map();
  let state = {saved:[],visited:[],notes:[]};
  let storageAvailable = true;
  try {
    const data = JSON.parse(localStorage.getItem('gemstone-tales:v1') || 'null');
    if (data && typeof data === 'object') {
      state.saved = [...new Set((Array.isArray(data.saved)?data.saved:[]).filter(id => byId(id)))];
      state.visited = [...new Set((Array.isArray(data.visited)?data.visited:[]).filter(id => byId(id)))];
      state.notes = (Array.isArray(data.notes)?data.notes:[]).filter(n => n && typeof n.id === 'string' && typeof n.text === 'string' && n.text.trim() && (n.gem === 'mixed' || byId(n.gem)) && !isNaN(Date.parse(n.date))).map(n => ({id:n.id,gem:n.gem,text:n.text.slice(0,1200),date:n.date,mission:['colors','light','family'].includes(n.mission)?n.mission:undefined}));
    }
  } catch { storageAvailable = false; }
  let toastTimer;
  function toast(message) {
    $('#toast').textContent = message;
    $('#toast').classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 3500);
  }
  function persist() {
    try { localStorage.setItem('gemstone-tales:v1', JSON.stringify(state)); storageAvailable = true; return true; }
    catch { storageAvailable = false; toast('浏览器无法保存数据，请在离开前导出手记。'); return false; }
  }
  const missions = [
    {id:'colors',title:'颜色侦探',subtitle:'同一颗宝石，会有几种颜色？',time:'约 5 分钟',icon:'eye',bg:'#efe8f3',color:'#a08ab4',materials:'一两颗干净完整的标本、一张白纸、自然散射光。',steps:['把宝石放在白纸上，在明亮但没有阳光直射的地方观察。你看见了什么颜色？','轻轻转动宝石，寻找深浅不同的地方。是整颗均匀，还是有色带、小斑点？','在心里给它挑三种颜色，或用彩笔画下来。也可以和图鉴里同一种标本比较。'],question:'照片和你的宝石颜色不同，就一定是不同种类吗？',answer:'不一定。天然标本本来就有差异，光线和屏幕也会改变颜色。辨认矿物需要多条线索，颜色只是其中一条。',starter:'我观察的宝石是：\n我看见的颜色和深浅：\n转动后，我注意到：\n我还想知道：',gem:'mixed'},
    {id:'light',title:'追光小实验',subtitle:'光，能穿过你的宝石吗？',time:'约 8 分钟',icon:'sun',bg:'#f0ecdf',color:'#b4a16d',materials:'水晶或玛瑙标本、普通低亮度 LED 手电筒、一张白纸。请家长陪同。',steps:['先不打光，看看宝石表面：像玻璃一样亮、像蜡一样柔和，还是像金属？','把手电放在宝石侧后方，光朝向白纸，观察薄的边缘。不要把光照向眼睛。','比较有光与无光时的样子。哪些地方光能穿过，哪些地方被挡住了？记录或画下来。'],question:'同一种宝石，为什么有的地方透光，有的地方不透？',answer:'厚薄、裂隙和内部夹杂物都会影响光的通过。一次观察还不能确定原因，试着换个角度，看看证据会不会变化。',starter:'我观察的标本是：\n不打光时的样子：\n从侧后方打光时：\n我猜可能是因为：\n我还需要什么证据：',gem:'quartz'},
    {id:'family',title:'寻找宝石的亲戚',subtitle:'颜色不同，也可能是一家人。',time:'约 10 分钟',icon:'layers',bg:'#e6ece3',color:'#93a183',materials:'打开图鉴；如果宝石盒里有紫水晶、白水晶、粉晶，也可以拿来一起看。',steps:['分别打开紫水晶、白水晶、粉晶的知识卡，找到它们的“家族”和“主要成分”。','记下它们相同和不同的地方：成分、硬度、颜色、能看见的形状。不要实际刮划来测试硬度。','给这三个名字画一棵“家族树”，在共同的树干上写下它们的家族名。'],question:'它们都是石英，为什么会有不同的颜色？',answer:'微量元素、内部微小结构等因素都可能影响颜色。紫水晶的紫色与铁及天然辐射有关；石英家族里的颜色故事并不只有一种。',starter:'我比较了：\n它们共同的家族和成分：\n我找到的相同点：\n我找到的不同点：\n我的新问题：',gem:'mixed'},
  ];
  let activeColor = '全部宝石';
  let onlySaved = false;
  let currentGem = null;
  let photoCredits = [];
  fetch('assets/credits.json').then(r => {if(!r.ok) throw new Error(); return r.json();}).then(data => {
    photoCredits = Array.isArray(data) ? data : data.images || [];
    for (const photo of photoCredits) {
      if (!byId(photo.id) || typeof photo.file !== 'string') continue;
      const file = photo.file.startsWith('assets/') ? photo.file : `assets/${photo.file.split(/[\\/]/).pop()}`;
      $$(`img[data-gem-image="${photo.id}"]`).forEach(img => {img.src=file;if(photo.alt)img.alt=photo.alt;});
      if (photo.id === 'amethyst' && $('#hero-photo')) {$('#hero-photo').src=file;if(photo.alt)$('#hero-photo').alt=photo.alt;}
    }
  }).catch(() => {});
  const photoPath = id => {
    if (byId(id).illustration) return 'assets/gem-symbol.svg';
    const photo = photoCredits.find(p => p.id === id);
    return photo ? (photo.file.startsWith('assets/') ? photo.file : `assets/${photo.file.split(/[\\/]/).pop()}`) : `assets/${id}.jpg`;
  };
  const photoAlt = id => byId(id).illustration ? '宝石图标' : photoCredits.find(p => p.id === id)?.alt || byId(id).name + '标本照片';
  function renderFilters() {
    $('#color-filters').innerHTML = ['全部宝石',...Object.keys(colors)].map(color => `<button class="filter${color===activeColor?' active':''}" data-color="${color}" aria-pressed="${color===activeColor}">${color!=='全部宝石'?`<span class="color-dot" style="--dot:${colors[color]}"></span>`:''}${color}</button>`).join('');
  }
  function renderGems() {
    const query = $('#gem-search').value.trim().toLocaleLowerCase();
    const visible = gems.filter(g => (activeColor==='全部宝石' || gemColors(g).includes(activeColor)) && (!onlySaved || state.saved.includes(g.id)) && (!query || [g.name,g.en,g.family,...gemColors(g),g.tagline].join(' ').toLocaleLowerCase().includes(query)));
    $('#result-summary').textContent = `找到 ${visible.length} 种宝石`;
    $('#empty-results').hidden = visible.length > 0;
    $('#empty-results h3').textContent = onlySaved && !state.saved.length ? '把喜欢的宝石，放进收藏里。' : '这颗宝石还没被找到';
    $('#empty-results p').textContent = onlySaved && !state.saved.length ? '点击宝石卡片右上角的书签，就能在这里找到它。' : '试试“水晶”“绿色”，或者看看全部宝石。';
    $('#gem-grid').innerHTML = visible.map(g => {
      const saved = state.saved.includes(g.id);
      const hardness = parseFloat(g.hardness);
      return `<article class="gem-card" style="--tint:${gemTint(g)}"><button class="gem-image-button" data-open-gem="${g.id}" aria-label="认识${escape(g.name)}"><span class="gem-number">NO. ${String(gems.indexOf(g)+1).padStart(3,'0')}</span>${g.illustration?'<span class="illustration-label">图标</span>':''}<img src="${escape(photoPath(g.id))}" data-gem-image="${g.id}" alt="${escape(photoAlt(g.id))}" loading="lazy" width="280" height="220"></button><button class="bookmark-button" data-save="${g.id}" aria-label="${saved?'取消收藏':'收藏'}${escape(g.name)}" aria-pressed="${saved}">${icon('bookmark')}</button><div class="gem-card-body"><span class="gem-family">${escape(g.family)}</span><div class="gem-name"><h3>${escape(g.name)}</h3><button data-open-gem="${g.id}" aria-label="阅读${escape(g.name)}知识卡">${icon('arrow-up-right')}</button></div><span class="gem-en">${escape(g.en)}</span><p class="gem-tagline">${escape(g.tagline)}</p><div class="gem-meta"><span>${icon('gem')} 莫氏硬度 ${escape(g.hardness)}</span><span class="hardness-dots" aria-hidden="true">${Array.from({length:10},(_,i)=>`<i${i<hardness?' class="filled"':''}></i>`).join('')}</span></div></div></article>`;
    }).join('');
    $('#saved-filter').setAttribute('aria-pressed', String(onlySaved));
    $('#saved-count').textContent = state.saved.length;
  }
  function updateStats() {
    $('#note-count').textContent = state.notes.length;
    $('#note-count').hidden = !state.notes.length;
    $('#visited-stat').textContent = state.visited.length;
    $('#collection-stat').textContent = state.saved.length;
    $('#notes-stat').textContent = state.notes.length;
  }
  function renderMissions() {
    $('#mission-grid').innerHTML = missions.map((m,i) => {
      const done = state.notes.some(n => n.mission === m.id);
      return `<article class="mission-card"><div class="mission-art" style="--mission-bg:${m.bg};--mission-color:${m.color}"><span class="mission-no">EXPEDITION 0${i+1}</span>${done?`<span class="mission-done">${icon('check')}已留下发现</span>`:''}${icon(m.icon)}</div><div class="mission-body"><span class="mission-time">观察任务 0${i+1} · ${m.time}</span><h2>${m.title}</h2><p>${m.subtitle}<br>不需要专业工具，带上好奇心就够了。</p><button class="button secondary" data-mission="${m.id}">${done?'再探索一次':'打开任务卡'}${icon('arrow-right')}</button></div></article>`;
    }).join('');
  }
  const noteName = n => n.gem==='mixed' ? '我的宝石盒' : byId(n.gem)?.name || '宝石观察';
  const dateLabel = date => new Date(date).toLocaleDateString('zh-CN',{year:'numeric',month:'2-digit',day:'2-digit'});
  function renderNotes() {
    $('#notebook-empty').hidden = state.notes.length > 0;
    $('#export-notes').disabled = !state.notes.length;
    $('#notes-grid').innerHTML = [...state.notes].sort((a,b)=>new Date(b.date)-new Date(a.date)).map(n=>`<article class="note-card"><div class="note-top"><span>${escape(noteName(n))}</span><small>${dateLabel(n.date)}</small></div><p>${escape(n.text)}</p><div class="note-actions"><button data-edit-note="${escape(n.id)}">编辑发现</button><button data-delete-note="${escape(n.id)}" aria-label="删除${dateLabel(n.date)}的${escape(noteName(n))}手记">删除</button></div></article>`).join('');
    $('.storage-note span:last-child').textContent = storageAvailable ? '手记和收藏保存在当前浏览器中，不会上传。换设备或清除浏览器数据后不会保留，记得定期导出。' : '当前浏览器无法持久保存数据。手记暂存在本次页面中，请在关闭前导出。';
  }
  function toggleSave(id, sourceButton) {
    const saved = state.saved.includes(id);
    state.saved = saved?state.saved.filter(x=>x!==id):[...state.saved,id];
    const ok = persist();
    const focusWasCard = sourceButton?.matches('[data-save]');
    renderGems(); updateStats();
    if (currentGem?.id === id && $('#gem-dialog').open) updateDetailSave();
    if (focusWasCard) {
      const replacement = $(`[data-save="${id}"]`);
      (replacement || $('#saved-filter')).focus({preventScroll:true});
    }
    if(ok) toast(saved?'已移出收藏':'已放进你的收藏，继续发现吧。');
  }
  function updateDetailSave() {
    const btn = $('#detail-save');
    const saved = state.saved.includes(currentGem.id);
    btn.setAttribute('aria-pressed',String(saved));
    btn.innerHTML = `${icon('bookmark')}${saved?'已收藏 · 点击取消':'收藏这颗宝石'}`;
  }
  function openGem(id) {
    const g = byId(id); if(!g) return;
    currentGem = g;
    if(!state.visited.includes(id)){state.visited.push(id);persist();updateStats();}
    $('#gem-detail').innerHTML = `<div class="detail-layout"><aside class="detail-visual" style="--tint:${gemTint(g)}"><div class="eyebrow">THE GEM COLLECTION · ${String(gems.indexOf(g)+1).padStart(3,'0')}</div><img src="${escape(photoPath(id))}" alt="${escape(photoAlt(g.id))}">${g.illustration?'<span class="detail-illustration-label">宝石图标 · 线索见资料卡</span>':''}<h2 id="gem-dialog-title">${escape(g.name)}</h2><span class="detail-en">${escape(g.en)}</span><div class="detail-properties"><div><span>所属家族</span><strong>${escape(g.family)}</strong></div><div><span>莫氏硬度</span><strong>${escape(g.hardness)} / 10</strong></div><div class="formula-property"><span>主要成分</span><strong>${escape(g.formula)}</strong></div></div><button class="button secondary" id="detail-save" data-save="${id}"></button></aside><div class="detail-content"><button class="circle-button detail-close" data-close aria-label="关闭宝石知识卡">${icon('x')}</button><h3>${escape(g.tagline)}</h3><p class="detail-intro">${escape(g.intro)}</p><div class="detail-tabs" role="tablist" aria-label="宝石知识"><button role="tab" aria-selected="true" aria-controls="detail-panel" id="detail-tab-observe" data-detail-tab="observe">观察线索</button><button role="tab" aria-selected="false" aria-controls="detail-panel" id="detail-tab-story" data-detail-tab="story" tabindex="-1">地球故事</button><button role="tab" aria-selected="false" aria-controls="detail-panel" id="detail-tab-quiz" data-detail-tab="quiz" tabindex="-1">小小挑战</button></div><div class="detail-panel" id="detail-panel" role="tabpanel" aria-labelledby="detail-tab-observe"></div><div class="mini-safety">${icon('shield')}<span>${escape(g.safety)} 硬度是资料中的相对刮划指标，观察时不用自己刮划。</span></div><a class="detail-source" href="${escape(g.source.url)}" target="_blank" rel="noopener noreferrer">知识来源：${escape(g.source.label)} ↗</a></div></div>`;
    $('#gem-dialog').setAttribute('aria-labelledby','gem-dialog-title');
    renderDetailTab('observe'); updateDetailSave();
    $('#gem-dialog').showModal();
    $('#gem-dialog').scrollTop=0;
  }
  function renderDetailTab(tab) {
    const g = currentGem;
    $$('[data-detail-tab]').forEach(b=>{const active=b.dataset.detailTab===tab;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;});
    $('#detail-panel').setAttribute('aria-labelledby',`detail-tab-${tab}`);
    if(tab==='observe') $('#detail-panel').innerHTML = `<h4>${icon('eye')}拿起标本，看一看</h4><ol class="observation-list">${g.lookFor.map(t=>`<li>${escape(t)}</li>`).join('')}</ol><p>图鉴照片是一件标本，不是所有标本的样子。颜色和形状只是线索，不能单独用来确定种类。</p><button class="button primary" data-note-gem="${g.id}">${icon('pencil')}记下我的观察</button>`;
    if(tab==='story') $('#detail-panel').innerHTML = `<h4>${icon('layers')}它是怎么来到地球上的？</h4><p>${escape(g.formation)}</p><h4>${icon('sparkles')}它能用来做什么？</h4><p>${escape(g.use)}</p><details class="detail-question"><summary>${escape(g.wonder.question)}</summary><p>${escape(g.wonder.answer)}</p></details><p>关于“能量”“疗愈”的说法并不是已证实的矿物功能；这里介绍可以用科学证据解释的性质与用途。</p>`;
    if(tab==='quiz') $('#detail-panel').innerHTML = `<div class="quiz-box"><div class="eyebrow">好奇心小测验 · 不计分</div><h4>${escape(g.quiz.question)}</h4>${g.quiz.options.map((o,i)=>`<button class="quiz-option" data-answer="${i}"><span>${String.fromCharCode(65+i)}</span>${escape(o)}</button>`).join('')}<div id="quiz-feedback" class="quiz-feedback" role="status" hidden></div></div>`;
  }
  function answerQuiz(index) {
    const q=currentGem.quiz;
    $$('.quiz-option').forEach((b,i)=>{b.disabled=true;if(i===q.answer)b.classList.add('correct');else if(i===index)b.classList.add('wrong');});
    $('#quiz-feedback').hidden=false;
    $('#quiz-feedback').innerHTML=`<strong>${index===q.answer?'发现正确！':'又多认识了一点。'}</strong><p>${escape(q.explanation)}</p><button class="text-button" id="retry-quiz">再想一遍 ${icon('arrow-right')}</button>`;
  }
  function openNote({gem='mixed',id='',mission=''}={}) {
    const existing=state.notes.find(n=>n.id===id);
    const draftKey = existing ? `edit:${id}` : mission ? `mission:${mission}` : `new:${gem}`;
    const draft = noteDrafts.get(draftKey);
    $('#note-id').value=existing?.id || '';
    $('#note-dialog-title').textContent=existing?'继续这条发现':'记下一点新发现';
    $('#note-gem').innerHTML=`<option value="mixed">我的宝石盒（多种标本）</option>${gems.map(g=>`<option value="${g.id}">${escape(g.name)}</option>`).join('')}`;
    $('#note-gem').value=draft?.gem || existing?.gem || gem;
    const m=missions.find(m=>m.id===mission);
    $('#note-text').value=draft?.text ?? existing?.text ?? m?.starter ?? '';
    $('#note-form').dataset.draftKey=draftKey;
    $('#note-form').dataset.mission=existing?.mission || mission || '';
    $('#note-form').dataset.starter=m?.starter || '';
    $('#note-error').hidden=true;
    $('#note-char-count').textContent=`${$('#note-text').value.length} / 1200`;
    $('#note-dialog').showModal();
    if(draft)toast('已找回刚才未保存的文字。');
    setTimeout(()=>$('#note-text').focus(),50);
  }
  function rememberDraft() {
    const key=$('#note-form').dataset.draftKey;
    if(key)noteDrafts.set(key,{gem:$('#note-gem').value,text:$('#note-text').value});
  }
  function saveNote(event) {
    event.preventDefault();
    const text=$('#note-text').value.trim();
    const error=$('#note-error');
    if(!text || text===$('#note-form').dataset.starter.trim()) {error.hidden=false;error.textContent='加上一点自己的观察或问题，再把发现保存下来。';$('#note-text').focus();return;}
    if(text.length>1200){error.hidden=false;error.textContent='这次发现最多记录 1200 个字。';return;}
    const id=$('#note-id').value;
    const existing=state.notes.find(n=>n.id===id);
    const note={id:existing?.id || (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`),gem:$('#note-gem').value,text,date:existing?.date || new Date().toISOString(),mission:$('#note-form').dataset.mission || undefined};
    if(!byId(note.gem) && note.gem!=='mixed')return;
    if(existing)state.notes=state.notes.map(n=>n.id===id?note:n);else state.notes.push(note);
    noteDrafts.delete($('#note-form').dataset.draftKey);
    const ok=persist();
    $('#note-dialog').close(); renderNotes();renderMissions();updateStats();
    location.hash='notebook';
    if(ok)toast(existing?'发现已更新':'新发现已保存，好奇心又长大了一点。');
  }
  function confirmDelete(id) {
    const n=state.notes.find(n=>n.id===id);if(!n)return;
    $('#info-content').innerHTML=`<div class="dialog-heading"><h2 id="info-title">删除这条发现？</h2><button class="circle-button" data-close aria-label="取消删除">${icon('x')}</button></div><p class="delete-warning">${escape(noteName(n))} · ${dateLabel(n.date)}<br>删除后无法恢复这条手记。</p><div class="confirm-actions"><button class="button secondary" data-close>保留手记</button><button class="button danger" data-confirm-delete="${escape(id)}">确认删除</button></div>`;
    $('#info-dialog').setAttribute('aria-labelledby','info-title');$('#info-dialog').showModal();
  }
  function exportNotes() {
    if(!state.notes.length)return;
    const lines=['宝石奇谭 · 我的小小发现','导出时间：'+new Date().toLocaleString('zh-CN'),''];
    [...state.notes].sort((a,b)=>new Date(b.date)-new Date(a.date)).forEach(n=>lines.push(`${noteName(n)} · ${dateLabel(n.date)}`,n.mission?`探索任务：${missions.find(m=>m.id===n.mission)?.title || ''}`:'',n.text,'','--------------------',''));
    lines.push('我的收藏：'+state.saved.map(id=>byId(id).name).join('、'));
    const url=URL.createObjectURL(new Blob(['\uFEFF'+lines.join('\n')],{type:'text/plain;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download=`宝石奇谭-探索手记-${new Date().toLocaleDateString('en-CA')}.txt`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('手记已导出，请保管好这份小小发现。');
  }
  function openMission(id) {
    const m=missions.find(m=>m.id===id);if(!m)return;
    const done=state.notes.some(n=>n.mission===id);
    $('#mission-content').innerHTML=`<div class="dialog-heading"><div><div class="eyebrow">LITTLE EXPEDITION · ${m.time}</div><h2 id="mission-title">${m.title}</h2></div><button class="circle-button" data-close aria-label="关闭探索任务">${icon('x')}</button></div><p class="detail-intro">${m.subtitle}</p><div class="mission-materials">准备一下：${m.materials}</div><ol class="mission-steps">${m.steps.map(s=>`<li>${s}</li>`).join('')}</ol><details class="mission-question"><summary><strong>一起想一想：</strong>${m.question}</summary><p>${m.answer}</p></details>${done?`<div class="mission-complete">${icon('check')}你已经留下了发现，也可以再观察一次。</div>`:''}<button class="button primary full" data-mission-note="${m.id}">${icon('pencil')}${done?'再记一条新发现':'完成观察，写下发现'}</button><div class="mini-safety">${icon('shield')}<span>只做温和的观察。不浸泡、不加热、不刮划、不研磨。手电不照眼睛，不用激光或紫外线灯。</span></div>`;
    $('#mission-dialog').setAttribute('aria-labelledby','mission-title');$('#mission-dialog').showModal();
  }
  function openInfo(type) {
    const title=type==='sources'?'每一个故事，都有出处。':'陪孩子，把好奇心留久一点。';
    const body=type==='sources'?`<p>图鉴采用 GIA、博物馆和地质机构的公开科普资料，按适合孩子阅读的方式重新讲述。知识卡中附有对应来源；照片展示特定标本，大小、颜色和形状会有差异。标有「图标」的条目用资料卡提供观察线索。</p><h3>知识资料</h3><ul class="source-list">${gems.map(g=>`<li>${escape(g.name)} · <a href="${escape(g.source.url)}" target="_blank" rel="noopener noreferrer">${escape(g.source.label)}</a></li>`).join('')}</ul><h3>标本照片与许可</h3><p>照片在页面中做缩放与混色显示，原始文件未改色。点击许可名或原图链接，可查看复用条件。</p><ul class="source-list photo-credits">${photoCredits.length?photoCredits.map(p=>`<li>${escape(byId(p.id)?.name || p.id)} · ${escape(p.author)} · <a href="${escape(p.licenseUrl)}" target="_blank" rel="noopener noreferrer">${escape(p.license)}</a><br><a href="${escape(p.source || p.url)}" target="_blank" rel="noopener noreferrer">查看原始照片及许可 ↗</a></li>`).join(''):'<li>图片署名暂时未加载，请刷新后查看。</li>'}</ul><p>莫氏硬度是抗刮划能力的相对等级，并不等于抗摔能力。图鉴用于学习观察，不能替代专业鉴定。</p>`:`<p>这是一份为孩子和真实宝石盒准备的探索空间。我们先做好三件事：认识常见标本、学会仔细观察、留下自己的问题。</p><h3>让孩子先说“我看见了什么”</h3><p>先观察，再命名。可以一起问：“你看到了什么？”“你为什么这样想？”“我们还可以找什么证据？”不用急着给出答案，也不把照片相似当成鉴定结论。</p><h3>和宝石安全相处</h3><p>由家长检查尖锐、细碎、掉粉的标本。孩子不入口，不敲击、不刮划、不研磨、不浸泡；观察后洗手。避免直晒、加热和用强光照眼睛。对未知标本先查资料，再安排接触。</p><h3>把实用性质和美好传说分开</h3><p>宝石的颜色、硬度、结构和工业用途可以查证。“疗愈”“转运”等说法属于文化叙事，不能当作已证实的科学功能。本站介绍的是科学知识。</p><h3>手记只留在当前浏览器</h3><p>这里不要求孩子注册，不收集姓名、年龄或照片。收藏、阅读记录和探索手记保存在当前浏览器的本地存储中，不会上传。建议定期在“我的发现”中导出手记；当前版本不能跨设备同步。</p>`;
    $('#info-content').innerHTML=`<div class="dialog-heading"><h2 id="info-title">${title}</h2><button class="circle-button" data-close aria-label="关闭说明">${icon('x')}</button></div><div class="info-body">${body}</div>`;
    $('#info-dialog').setAttribute('aria-labelledby','info-title');$('#info-dialog').showModal();
  }
  function route() {
    const hash=location.hash.slice(1);
    const view=hash==='gem-library'?'atlas':hash==='stamps'?'island':['island','atlas','missions','notebook'].includes(hash)?hash:'island';
    $$('.page-view').forEach(el=>el.hidden=el.id!==`view-${view}`);
    $$('[data-view]').forEach(a=>{const active=a.dataset.view===view;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    if(view==='notebook')renderNotes();
    if(hash==='gem-library')requestAnimationFrame(()=>$('#gem-library').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'}));
    else if(['stamps','island-trails'].includes(hash))requestAnimationFrame(()=>document.getElementById(hash).scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'}));
    else window.scrollTo({top:0,behavior:'instant'});
  }
  document.addEventListener('click', e => {
    const b=e.target.closest('button');if(!b)return;
    if(b.closest('#explore-dialog') || b.hasAttribute('data-station'))return;
    if(b.hasAttribute('data-close')){b.closest('dialog')?.close();return;}
    if(b.dataset.openGem){openGem(b.dataset.openGem);return;}
    if(b.dataset.save){toggleSave(b.dataset.save,b);return;}
    if(b.dataset.color){activeColor=b.dataset.color;renderFilters();renderGems();$(`[data-color="${activeColor}"]`).focus({preventScroll:true});return;}
    if(b.dataset.detailTab){renderDetailTab(b.dataset.detailTab);return;}
    if(b.hasAttribute('data-answer')){answerQuiz(Number(b.dataset.answer));return;}
    if(b.id==='retry-quiz'){renderDetailTab('quiz');return;}
    if(b.dataset.noteGem){$('#gem-dialog').close();openNote({gem:b.dataset.noteGem});return;}
    if(b.dataset.editNote){openNote({id:b.dataset.editNote});return;}
    if(b.dataset.deleteNote){confirmDelete(b.dataset.deleteNote);return;}
    if(b.dataset.confirmDelete){state.notes=state.notes.filter(n=>n.id!==b.dataset.confirmDelete);const ok=persist();$('#info-dialog').close();renderNotes();renderMissions();updateStats();if(ok)toast('这条手记已删除。');return;}
    if(b.dataset.mission){openMission(b.dataset.mission);return;}
    if(b.dataset.missionNote){const m=missions.find(m=>m.id===b.dataset.missionNote);$('#mission-dialog').close();openNote({gem:m.gem,mission:m.id});return;}
    if(b.dataset.info){openInfo(b.dataset.info);return;}
  });
  $('#saved-filter').addEventListener('click',()=>{onlySaved=!onlySaved;renderGems();});
  $('#gem-search').addEventListener('input',renderGems);
  $('#reset-filters').addEventListener('click',()=>{activeColor='全部宝石';onlySaved=false;$('#gem-search').value='';renderFilters();renderGems();$('#gem-search').focus();});
  $('#new-note').addEventListener('click',()=>openNote());
  $('#first-note').addEventListener('click',()=>openNote());
  $('#export-notes').addEventListener('click',exportNotes);
  $('#note-form').addEventListener('submit',saveNote);
  $('#note-text').addEventListener('input',()=>{$('#note-char-count').textContent=`${$('#note-text').value.length} / 1200`;$('#note-error').hidden=true;rememberDraft();});
  $('#note-gem').addEventListener('change',rememberDraft);
  document.addEventListener('keydown',e=>{
    const editing=e.target.matches('input,textarea,select,[contenteditable="true"]');
    if(e.key==='/' && !editing && !document.querySelector('dialog[open]') && !$('#view-atlas').hidden){e.preventDefault();$('#gem-search').focus();}
    if(e.target.matches('[role="tab"]') && ['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){
      e.preventDefault();const tabs=$$('[role="tab"]');let index=tabs.indexOf(e.target);index=e.key==='Home'?0:e.key==='End'?tabs.length-1:(index+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;renderDetailTab(tabs[index].dataset.detailTab);tabs[index].focus();
    }
  });
  $$('dialog').forEach(d=>{d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});});
  document.addEventListener('gemstone:visited',event=>{
    const id=event.detail?.id;if(!byId(id)||state.visited.includes(id))return;
    state.visited.push(id);persist();updateStats();
  });
  document.addEventListener('gemstone:record',event=>{
    const id=event.detail?.id;if(byId(id))openNote({gem:id});
  });
  document.addEventListener('gemstone:open',event=>{
    const id=event.detail?.id;if(byId(id))openGem(id);
  });
  document.addEventListener('click',event=>{
    const link=event.target.closest('a[data-view],.brand,.stamp-pill,.trail-jump');
    if(link && link.hash===location.hash){event.preventDefault();route();}
  });
  window.addEventListener('hashchange',route);
  renderFilters();renderGems();renderMissions();renderNotes();updateStats();route();
})();
