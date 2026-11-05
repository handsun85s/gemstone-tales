document.addEventListener('DOMContentLoaded', () => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[char]));
  const icon = name => '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-' + name + '"/></svg>';
  const routes = window.GemIslandRoutes;
  const gems = new Map(window.GEMS.map(gem => [gem.id, gem]));
  const progress = window.GemIslandProgress;
  const allowed = routes.flatMap(route => [...route.ids, route.id]);
  const dialog = $('#explore-dialog');
  const content = $('#dialog-content');
  const featured = {amethyst:'紫水晶洞', fluorite:'萤石山谷', pyrite:'金色矿洞'};
  const total = gems.size;
  let activeRoute = routes[0];
  let completed = new Set(progress.read(getStorage(), allowed));
  let current = null;
  let trigger = null;
  let questionIndex = 0;
  let failures = 0;
  let step = 'observe';
  let solvedId = null;

  function getStorage() {
    try { return localStorage; } catch { return null; }
  }
  const count = route => route.ids.filter(id => completed.has(id)).length;
  const title = id => featured[id] || gems.get(id).name;
  const canOpenCase = route => count(route) === route.ids.length;
  function recommend() {
    for (const route of routes) {
      const remaining = route.ids.find(id => !completed.has(id));
      if (remaining) return remaining;
      if (!completed.has(route.id)) return route.id;
    }
    return null;
  }
  function nextInRoute() {
    const route = current.route;
    const remaining = route.ids.find(id => !completed.has(id));
    if (remaining) return remaining;
    if (!completed.has(route.id)) return route.id;
    return recommend();
  }
  const taskName = id => routes.find(route => route.id === id)?.caseTitle || title(id);
  function setSaveStatus(saved) {
    const status = $('#island-save-status');
    status.textContent = saved
      ? '印章和案件记录保存在当前浏览器，下次可以接着探索。'
      : '当前浏览器无法保存进度，本次页面仍可继续探索。';
    status.classList.toggle('unsaved', !saved);
  }
  function renderRoutes() {
    $('#route-picker').innerHTML = routes.map((route, index) =>
      '<button class="route-choice" data-route="' + route.id + '" aria-pressed="' + (route === activeRoute) +
      '" style="--route-tint:' + route.tint + '"><span aria-hidden="true">' + route.mark +
      '</span><strong>' + (index + 1) + ' · ' + route.title + '</strong><small>' +
      count(route) + ' / ' + route.ids.length + ' 站' + (completed.has(route.id) ? ' · 案件已解' : '') + '</small></button>'
    ).join('');
    $('#route-title').textContent = activeRoute.title;
    $('#route-topic').textContent = activeRoute.topic;
    $('#route-panel').style.setProperty('--route-tint', activeRoute.tint);
    $('#station-grid').innerHTML = activeRoute.ids.map((id, index) => {
      const gem = gems.get(id);
      const done = completed.has(id);
      return '<button class="station-tile" data-station="' + id + '" aria-label="探索' + escape(gem.name) +
        (done ? '，已获得印章' : '') + '"><span class="trail-number' + (done ? ' earned' : '') +
        '" aria-hidden="true">' + (done ? '✓' : String(index + 1).padStart(2,'0')) +
        '</span><strong>' + escape(gem.name) + '</strong><small>' + escape(gem.family) + '</small></button>';
    }).join('');
    const ready = canOpenCase(activeRoute);
    $('#chapter-case').dataset.station = activeRoute.id;
    $('#chapter-case').disabled = !ready;
    $('#chapter-case').textContent = completed.has(activeRoute.id) ? '重开案件' : '打开案件';
    $('#case-name').textContent = activeRoute.caseTitle;
    $('#case-status').textContent = completed.has(activeRoute.id)
      ? '案件已解决，可以再玩。'
      : ready ? '证据已齐。准备好推理了吗？' : '集齐本章的 10 枚印章后开启。';
  }
  function renderProgress() {
    const gemCount = [...gems.keys()].filter(id => completed.has(id)).length;
    const caseCount = routes.filter(route => completed.has(route.id)).length;
    $('#header-count').textContent = gemCount;
    $('#header-total').textContent = total;
    $('#progress-status').textContent = '发现印章 ' + gemCount + ' / ' + total + '，已破解案件 ' + caseCount + ' / ' + routes.length + '。';
    $('#stamp-subtitle').textContent = caseCount === routes.length
      ? '你已完成全岛调查，获得「宝石研究员」称号！'
      : '印章 ' + gemCount + ' / ' + total + ' · 案件 ' + caseCount + ' / ' + routes.length;
    $('#stamp-grid').innerHTML = routes.map(route => {
      const done = completed.has(route.id);
      return '<div class="route-badge' + (done ? ' earned' : '') + '"><span aria-hidden="true">' +
        (done ? '🏅' : route.mark) + '</span><strong>' + route.title + '</strong><small>' +
        count(route) + ' / ' + route.ids.length + ' 枚印章 · ' + (done ? '案件已解决' : '案件待调查') +
        '</small><progress max="' + route.ids.length + '" value="' + count(route) + '" aria-label="' + route.title + '印章"></progress></div>';
    }).join('');
    document.querySelectorAll('.map-board [data-station]').forEach((button, index) => {
      const done = completed.has(button.dataset.station);
      button.classList.toggle('completed', done);
      button.querySelector('.marker').textContent = done ? '✓' : index + 1;
      button.setAttribute('aria-label', '探索' + title(button.dataset.station) + (done ? '，已获得印章' : ''));
    });
    const next = recommend();
    $('#start-title').textContent = next ? (gemCount ? '晶晶找到下一条线索啦！' : '晶晶在紫水晶洞等你。') : '全岛调查完成！';
    $('#start-note').textContent = next ? '五章可以自由探索。每站两题，集齐印章解锁本章案件。' : '把最有趣的证据写进手记，或回到喜欢的地点再探索。';
    $('#start-button').dataset.station = next || routes[0].ids[0];
    $('#start-button').innerHTML = (next ? (gemCount ? '继续 · ' : '出发 · ') + escape(taskName(next)) : '重游紫水晶洞') + icon('arrow');
    renderRoutes();
  }

  const bounds = gem => String(gem.hardness).split(/[–-]/).map(Number);
  function makeQuestion(question, right, wrong, explanation, rotation) {
    const options = [...wrong];
    const answer = rotation % 3;
    options.splice(answer, 0, right);
    return {question, options, answer, explanation};
  }
  function comparison(gem, number) {
    const others = [...gems.values()].filter(item => item !== gem);
    const min = item => bounds(item)[0];
    const max = item => bounds(item).at(-1);
    const rotate = (items, offset) => items.slice(offset).concat(items.slice(0, offset));
    const pool = rotate(others, number % others.length);
    let cards;
    let question;
    let right;
    let explanation;
    if (number % 3 === 0 && gem.family.endsWith('家族')) {
      const same = pool.find(item => item.family === gem.family);
      const similar = pool.find(item => item.family !== gem.family && item.color === gem.color);
      const different = pool.find(item => item.family !== gem.family && item !== similar);
      if (same && similar && different) {
        cards = [same, similar, different];
        right = same;
        question = '哪张卡能和' + gem.name + '放进同一个矿物家族展柜？';
        explanation = same.name + '和' + gem.name + '都属于' + gem.family + '。' + similar.name + '虽然颜色相似，分类却不同。';
      }
    }
    if (!cards) {
      const separate = (a, b) => max(a) < min(b) || max(b) < min(a);
      const choices = pool.filter(item => separate(item, gem));
      const first = choices.find(item => choices.some(other => separate(item, other)));
      const second = choices.find(item => separate(item, first));
      cards = [gem, first, second].sort((a, b) => min(a) - min(b));
      const [soft, middle, hard] = cards;
      const mode = number % 4;
      right = [hard, middle, soft, middle][mode];
      question = [
        '只比较抗刮划能力，哪种材料的整个硬度范围最高？',
        '选一张卡：硬度下限至少为 ' + min(middle) + '，同时在符合条件的材料里硬度最低。',
        '给这三种材料分袋收纳。哪种最需要防止被另外两种刮花？',
        '选一张卡：硬度上限不能超过 ' + max(middle) + '，同时在符合条件的材料里硬度最高。'
      ][mode];
      explanation = '把范围从低到高排好：' + [soft, middle, hard].map(item => item.name + '（' + item.hardness + '）').join('、') +
        '。根据这道题的条件，选择' + right.name + '。硬度描述抗刮划能力。';
    }
    return {
      ...makeQuestion(question, right.name, cards.filter(item => item !== right).map(item => item.name), explanation, number + 1),
      evidence: (cards.includes(gem) ? rotate(cards, number % cards.length) : [gem, ...rotate(cards, number % cards.length)])
        .map(item => item.name + ' · ' + item.family + ' · 硬度 ' + item.hardness)
    };
  }
  function header(label) {
    return '<div class="dialog-header"><span class="dialog-route">' + icon('compass') + escape(label) +
      '</span><button class="close-button" data-close aria-label="返回冒险地图">' + icon('x') + '</button></div>';
  }
  function stepper() {
    const labels = ['找证据', '第一题', '第二题', current.gem ? '收印章' : '破案件'];
    const index = step === 'observe' ? 0 : step === 'done' ? 3 : questionIndex + 1;
    return '<div class="stepper" aria-label="探索步骤">' + labels.map((label, i) =>
      '<span' + (i === index ? ' class="active" aria-current="step"' : '') + '><b>' + (i + 1) + '</b>' + label + '</span>'
    ).join('<i aria-hidden="true"></i>') + '</div>';
  }
  function evidenceList(evidence) {
    return '<ul class="evidence-list">' + evidence.map(line => '<li>' + escape(line) + '</li>').join('') + '</ul>';
  }
  function observe() {
    const gem = current.gem;
    if (!gem) {
      return '<div class="challenge"><span class="fact-label">晶晶的案件档案</span><h2 id="dialog-title">' +
        escape(current.route.caseTitle) + '</h2><p>仔细看调查记录，两题都要用到这些证据。</p>' +
        evidenceList(current.evidence) + '<button class="action" data-next>开始推理 ' + icon('arrow') + '</button></div>';
    }
    const photo = !gem.illustration;
    const picture = photo ? 'assets/' + gem.id + '.jpg' : 'assets/gem-symbol.svg';
    return '<div class="observation"><figure class="specimen" style="--specimen-bg:' + current.route.tint + '">' +
      '<img src="' + picture + '" alt="' + escape(photo ? gem.name + '标本照片' : '宝石图标') + '">' +
      '<small>' + (photo ? '标本照片 · ' : '图标 · ') + escape(gem.en) + '</small></figure><div>' +
      '<span class="fact-label">' + icon('eye') + '先读线索，再下结论</span><h2 id="dialog-title">' + escape(gem.name) + '</h2>' +
      evidenceList(current.evidence) +
      '<a class="detail-source" href="' + escape(gem.source.url) + '" target="_blank" rel="noopener noreferrer">' +
      escape(gem.source.label) + ' ↗</a><br><button class="action" data-next>证据看好啦 ' + icon('arrow') + '</button></div></div>';
  }
  function challenge() {
    const question = current.questions[questionIndex];
    const evidence = question.evidence || current.evidence;
    return '<div class="challenge"><span class="fact-label">' + (questionIndex ? '② 比较与推理' : '① 线索挑战') +
      '</span><h2 id="dialog-title">' + escape(question.question) + '</h2>' +
      '<details class="quiz-evidence"' + (!current.gem || question.evidence ? ' open' : '') +
      '><summary>查看证据卡</summary>' + evidenceList(evidence) + '</details><div id="answers">' +
      question.options.map((option, index) => '<button class="answer-button" data-answer="' + index + '"><span class="answer-letter">' +
        String.fromCharCode(65 + index) + '</span><span>' + escape(option) + '</span></button>').join('') +
      '</div><div class="feedback" id="feedback" role="status" hidden></div><button class="challenge-back" data-observe>回看完整档案</button></div>';
  }
  function done() {
    const gem = current.gem;
    const next = nextInRoute();
    const allCases = routes.every(route => completed.has(route.id));
    const heading = allCases ? '宝石研究员，调查完成！' : gem ? gem.name + '印章到手！' : '「' + current.route.caseTitle + '」破解啦！';
    return '<div class="celebrate" style="--stamp-color:#407559;--stamp-bg:' + current.route.tint +
      '"><div class="big-stamp" aria-hidden="true">' + icon(gem ? 'gem' : 'stamp') + '</div><h2 id="dialog-title">' +
      escape(heading) + '</h2><p>' + (allCases ? '你收集了全岛的 ' + total + ' 枚印章，并破解了 ' + routes.length + ' 件案件。' :
        gem ? '你找到了线索，还用资料支持了自己的判断。' : '你用本章的证据破案，收下一枚章节勋章。') +
      '</p><div class="island-handoff">' + (next ? '<button class="action" data-station="' + next + '">继续 · ' +
        escape(taskName(next)) + ' ' + icon('arrow') + '</button>' : '') +
      '<button class="action secondary" data-close>回到冒险地图</button>' + (gem ?
        '<button class="action secondary" data-record-discovery>写下我的发现</button>' : '') +
      '</div>' + (gem ? '<button class="challenge-back" data-read-card>打开图鉴卡</button>' : '') + '</div>';
  }
  function render(nextStep) {
    step = nextStep;
    content.innerHTML = header(current.gem ? current.route.title + ' · ' + current.gem.name : current.route.title + ' · 综合案件') +
      stepper() + (step === 'observe' ? observe() : step === 'quiz' ? challenge() : done()) +
      '<div class="dialog-safety">' + icon('leaf') + '在游戏里比较资料。观察实物时轻拿轻放。</div>';
    dialog.scrollTop = 0;
    const heading = $('#dialog-title');
    heading.tabIndex = -1;
    if (dialog.open) heading.focus({preventScroll:true});
  }
  function open(id, opener) {
    const route = routes.find(route => route.id === id || route.ids.includes(id));
    if (!route || (id === route.id && !canOpenCase(route))) return;
    const gem = gems.get(id);
    activeRoute = route;
    if (!dialog.open) trigger = opener;
    questionIndex = 0;
    failures = 0;
    solvedId = null;
    if (gem) {
      const evidence = [
        gem.intro, gem.family + ' · 主要成分 ' + gem.formula + ' · 莫氏硬度 ' + gem.hardness,
        gem.formation, '用途 · ' + gem.use
      ];
      current = {id, route, gem, evidence, questions:[gem.quiz, comparison(gem, allowed.indexOf(id))]};
      document.dispatchEvent(new CustomEvent('gemstone:visited', {detail:{id}}));
    } else {
      current = {
        id, route, evidence:route.evidence,
        questions:route.questions.map(([prompt, right, a, b, explanation], index) =>
          makeQuestion(prompt, right, [a,b], explanation, routes.indexOf(route) + index))
      };
    }
    render('observe');
    if (!dialog.open) dialog.showModal();
    $('#dialog-title').focus({preventScroll:true});
  }
  function answer(index) {
    const question = current.questions[questionIndex];
    const correct = index === question.answer;
    const feedback = $('#feedback');
    if (!feedback.hidden) return;
    content.querySelectorAll('[data-answer]').forEach((button, i) => {
      button.disabled = true;
      if (i === index) button.classList.add(correct ? 'correct' : 'wrong');
    });
    const last = questionIndex === current.questions.length - 1;
    if (correct && last) solvedId = current.id;
    if (!correct) failures += 1;
    feedback.hidden = false;
    feedback.innerHTML = '<strong>' + (correct ? '✦ 判断有根据！' : '再看看证据，试一次。') +
      '</strong><p>' + escape(correct || failures >= 2 ? question.explanation :
        '打开题目下方的证据卡，找一条能排除你刚才选择的记录。') + '</p><button class="action" data-' +
      (correct ? (last ? 'collect' : 'advance') : 'retry') + '>' +
      (correct ? (last ? (current.gem ? '收下发现印章' : '提交案件结论') : '进入第二题') : '重新判断') + '</button>';
    feedback.querySelector('button').focus();
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.route) {
      activeRoute = routes.find(route => route.id === button.dataset.route);
      renderRoutes();
      $('#route-picker [aria-pressed="true"]').focus();
      return;
    }
    if (button.dataset.station) { open(button.dataset.station, button); return; }
    if (!button.closest('#explore-dialog') || !current) return;
    if (button.hasAttribute('data-close')) dialog.close();
    if (button.hasAttribute('data-next') || button.hasAttribute('data-retry')) render('quiz');
    if (button.hasAttribute('data-observe')) { solvedId = null; render('observe'); }
    if (button.hasAttribute('data-answer') && step === 'quiz') answer(Number(button.dataset.answer));
    if (button.hasAttribute('data-advance')) {
      questionIndex += 1;
      failures = 0;
      render('quiz');
    }
    if (button.hasAttribute('data-collect') && progress.canCollect(current.id, solvedId, step, allowed)) {
      completed.add(current.id);
      progress.read(getStorage(), allowed).forEach(id => completed.add(id));
      setSaveStatus(progress.save(getStorage(), [...completed], allowed));
      renderProgress();
      render('done');
    }
    if (button.hasAttribute('data-record-discovery') || button.hasAttribute('data-read-card')) {
      const eventName = button.hasAttribute('data-record-discovery') ? 'gemstone:record' : 'gemstone:open';
      const id = current.id;
      dialog.close();
      document.dispatchEvent(new CustomEvent(eventName, {detail:{id}}));
    }
  });
  dialog.addEventListener('close', () => {
    renderRoutes();
    if (document.querySelector('dialog[open]')) return;
    if (trigger?.isConnected) trigger.focus();
    else $('#route-picker [aria-pressed="true"]').focus();
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  window.addEventListener('storage', event => {
    if (event.key !== progress.key) return;
    progress.read(getStorage(), allowed).forEach(id => completed.add(id));
    renderProgress();
  });
  renderProgress();
});
