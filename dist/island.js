document.addEventListener('DOMContentLoaded',()=>{
  'use strict';
  const $=s=>document.querySelector(s);
  const icon=name=>`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const places=[
    {id:'amethyst',title:'紫水晶洞',stamp:'紫色发现家',color:'#9464be',bg:'#f1e7f7',border:'#cfb5e2',fact:'紫水晶和白水晶是一家人，主要成分都是二氧化硅。颜色不同，也可能是同一种矿物！',clue:'看看照片，找一找颜色深浅不同的晶体。哪些尖尖更接近深紫色？',source:'https://commons.wikimedia.org/wiki/File:Amatista_Laye_2.jpg'},
    {id:'fluorite',title:'萤石山谷',stamp:'彩色侦探',color:'#3b947b',bg:'#e7f2e7',border:'#a8d3b7',fact:'萤石可以有绿色、紫色、黄色，甚至没有颜色。天然晶体有时像方块，也可能像两座金字塔底对底。',clue:'这张照片里的萤石是绿色的。仔细看，能找到一些平平的面吗？',source:'https://commons.wikimedia.org/wiki/File:3192M-fluorite1.jpg'},
    {id:'pyrite',title:'金色矿洞',stamp:'金光观察员',color:'#ad842a',bg:'#fbf1ce',border:'#dfcd8f',fact:'黄铁矿会闪着金属般的光，却不是黄金！它主要由铁和硫组成，有些天然晶体会长成立方体。',clue:'慢慢看看照片，找找直直的边、平平的面。它是不是有点像一堆小积木？',source:'https://commons.wikimedia.org/wiki/File:Pyrite_-_Huanzala_mine,_Huallanca,_Bolognesi,_Ancash,_Peru.jpg'}
  ];
  const progress=window.GemIslandProgress;
  const completed=new Set(progress.read(localStorageSafe(),places.map(p=>p.id)));
  let solvedId=null;
  let progressSaved=true;
  function localStorageSafe(){try{return localStorage;}catch{return null;}}
  function saveProgress(){progressSaved=progress.save(localStorageSafe(),[...completed]);const status=$('#island-save-status');status.textContent=progressSaved?'印章保存在当前浏览器，下次可以接着探索。':'当前浏览器无法保存印章，暂时保留在本次页面中。';status.classList.toggle('unsaved',!progressSaved);return progressSaved;}
  let current=null;
  let currentStep='observe';
  let timer;
  const dialog=$('#explore-dialog');
  function toast(text){$('#toast').textContent=text;$('#toast').classList.add('visible');clearTimeout(timer);timer=setTimeout(()=>$('#toast').classList.remove('visible'),3200);}
  function stepper(step){return `<div class="stepper" aria-label="探索步骤"><span class="${step==='observe'?'active':''}"><b>1</b>看标本</span><i></i><span class="${step==='quiz'?'active':''}"><b>2</b>解谜题</span><i></i><span class="${step==='done'?'active':''}"><b>3</b>收印章</span></div>`;}
  function header(){return `<div class="dialog-header"><span class="dialog-route">${icon('compass')}探险地点 · ${current.title}</span><button class="close-button" data-close aria-label="返回冒险地图">${icon('x')}</button></div>`;}
  function render(step){
    currentStep=step;
    if(step==='quiz'||step==='observe')solvedId=null;
    const g=window.GEMS?.find(g=>g.id===current.id);
    if(!g){toast('标本资料没有加载成功，请刷新后再试。');return;}
    let body='';
    if(step==='observe')body=`<div class="observation"><figure class="specimen" style="--specimen-bg:${current.bg};margin:0"><img src="assets/${current.id}.jpg" alt="${escape(g.name)}真实矿物标本"><small><span>真实标本 · 每颗形状都不同</span><a href="${current.source}" target="_blank" rel="noopener">图源 ↗</a></small></figure><div><span class="fact-label">${icon('eye')}把眼睛变成放大镜</span><h2 id="dialog-title">你好，${escape(g.name)}！</h2><p class="fact-text">${current.fact}</p><div class="look-clue"><strong>观察小线索</strong>${current.clue}</div><button class="action" data-next>看清楚啦，去解谜 ${icon('arrow')}</button></div></div>`;
    if(step==='quiz')body=`<div class="challenge"><span class="fact-label">${icon('compass')}不着急，线索都在刚才的发现里</span><h2 id="dialog-title">${escape(g.quiz.question)}</h2><div id="answers">${g.quiz.options.map((text,i)=>`<button class="answer-button" data-answer="${i}"><span class="answer-letter">${String.fromCharCode(65+i)}</span><span>${escape(text)}</span></button>`).join('')}</div><div class="feedback" id="feedback" role="status" hidden></div><button class="challenge-back" data-observe>再回去看看标本</button></div>`;
    if(step==='done')body=`<div class="celebrate" style="--stamp-color:${current.color};--stamp-bg:${current.bg}"><div class="big-stamp" aria-hidden="true">${icon('gem')}</div><h2 id="dialog-title">${current.stamp}，就是你！</h2><p>你又读懂了一颗宝石的小秘密。<br>「${current.stamp}」印章已经放进你的发现册啦。</p><div class="island-handoff"><button class="action" data-close>回到地图，继续探险 ${icon('arrow')}</button><button class="action secondary" data-record-discovery>记下我的新发现 ${icon('eye')}</button></div><button class="challenge-back" data-read-card>再认识一下这颗宝石</button><small>已发现 ${completed.size} / 3 个地点 · 每个地点都可以再探索</small></div>`;
    $('#dialog-content').innerHTML=header()+stepper(step)+body+`<div class="dialog-safety">${icon('leaf')}用观察认识宝石，不做敲击、刮划或研磨实验。图鉴线索不能替代专业鉴定。</div>`;
    dialog.scrollTop=0;
    $('#dialog-title').setAttribute('tabindex','-1');
    requestAnimationFrame(()=>$('#dialog-title').focus({preventScroll:true}));
  }
  function openStation(id){current=places.find(p=>p.id===id);if(!current)return;document.dispatchEvent(new CustomEvent('gemstone:visited',{detail:{id}}));render('observe');if(!dialog.open)dialog.showModal();dialog.scrollTop=0;}
  function answer(index){
    const g=window.GEMS.find(g=>g.id===current.id);
    document.querySelectorAll('.answer-button').forEach((button,i)=>{button.disabled=true;if(i===g.quiz.answer)button.classList.add('correct');else if(i===index)button.classList.add('wrong');});
    const correct=index===g.quiz.answer;
    solvedId=correct?current.id:null;
    $('#feedback').hidden=false;
    $('#feedback').innerHTML=`<strong>${correct?'✦ 发现正确！这条线索被你找到啦。':'再想一想，你离发现又近了一步。'}</strong><p>${escape(g.quiz.explanation)}</p><button class="action ${correct?'':'secondary'}" ${correct?'data-collect':'data-retry'}>${correct?'收下我的发现印章':'带着新线索，再试一次'} ${icon(correct?'stamp':'arrow')}</button>`;
    $('#feedback').scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  function renderProgress(){
    $('#header-count').textContent=completed.size;
    $('#stamp-grid').innerHTML=places.map(p=>`<div class="stamp-card ${completed.has(p.id)?'earned':''}" style="--stamp-color:${p.color};--stamp-bg:${p.bg};--stamp-border:${p.border}"><span class="stamp-art" aria-hidden="true">${icon('gem')}</span><div><strong>${completed.has(p.id)?p.stamp:'等待一个新发现'}</strong><p>${p.title} · ${completed.has(p.id)?'印章已收集，欢迎再去看看':'完成观察和小谜题，就能收到印章'}</p></div></div>`).join('');
    places.forEach((p,i)=>{const button=document.querySelector(`.station[data-station="${p.id}"]`);button.classList.toggle('completed',completed.has(p.id));button.querySelector('.marker').textContent=completed.has(p.id)?'✓':i+1;button.setAttribute('aria-label',`探索${p.title}${completed.has(p.id)?'，已收集印章，可再次探索':''}`);});
    $('#progress-status').textContent=`已经获得 ${completed.size} 枚发现印章，共 3 枚。`;
    const next=places.find(p=>!completed.has(p.id));
    if(completed.size){$('#start-title').textContent=next?'新线索在前方，继续去下一个地点吧！':'三处宝石小秘密，你都发现啦！';$('#start-note').textContent=next?'不需要按顺序，你也可以自由挑选喜欢的地点。':'想再仔细看看？每个地点都欢迎你重新探索。';$('#start-button').dataset.station=(next||places[0]).id;$('#start-button').innerHTML=`${next?'下一站！去'+next.title:'再逛逛紫水晶洞'} ${icon('arrow')}`;}
    $('#stamp-subtitle').textContent=completed.size===3?'小小的岛，大大的发现。下一次带着实物再看一看吧！':'不用赶路，每一个新发现都值得收藏。';
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button)return;
    if(button.dataset.station){openStation(button.dataset.station);return;}
    if(!button.closest('#explore-dialog'))return;
    if(button.hasAttribute('data-close')){dialog.close();return;}
    if(button.hasAttribute('data-next')){render('quiz');return;}
    if(button.hasAttribute('data-observe')){render('observe');return;}
    if(button.hasAttribute('data-retry')){render('quiz');return;}
    if(button.hasAttribute('data-answer')){if(currentStep==='quiz')answer(Number(button.dataset.answer));return;}
    if(button.hasAttribute('data-collect')){
      if(!progress.canCollect(current?.id,solvedId,currentStep))return;
      completed.add(current.id);saveProgress();renderProgress();render('done');return;
    }
    if(button.hasAttribute('data-record-discovery')){const id=current.id;dialog.close();document.dispatchEvent(new CustomEvent('gemstone:record',{detail:{id}}));return;}
    if(button.hasAttribute('data-read-card')){const id=current.id;dialog.close();document.dispatchEvent(new CustomEvent('gemstone:open',{detail:{id}}));}
  });
  dialog.addEventListener('click',event=>{if(event.target===dialog){const bounds=dialog.getBoundingClientRect();if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)dialog.close();}});
  renderProgress();
});
