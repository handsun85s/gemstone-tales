'use strict';
(() => {
  const concepts = {
    adventure:{code:'A',name:'宝石冒险岛',ux:'地图探险 × 任务引导',hint:'试一试：点地图上的站点 → 找线索 → 回答问题 → 留下探索印章。'},
    space:{code:'B',name:'星际研究站',ux:'太空任务 × 线索推理',hint:'试一试：带着问题出发 → 收集观察线索 → 作出推断 → 查看研究结论。'},
    stickers:{code:'C',name:'宝石贴纸册',ux:'手帐收集 × 自主发现',hint:'试一试：挑一颗喜欢的宝石 → 翻开观察卡 → 完成小挑战 → 收进贴纸册。'},
    maker:{code:'D',name:'造物小工坊',ux:'动手创作 × 材料灵感',hint:'试一试：观察宝石纹样 → 选择形状与配色 → 点击画布创作 → 导出自己的设计。'},
  };
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const storageKey='gemstone-tales:playground-choice:v1';
  let active='adventure';
  let choice='';
  try {const saved=localStorage.getItem(storageKey);if(Object.hasOwn(concepts,saved))choice=saved;}catch{}
  let timer;
  function toast(message){$('#pg-toast').textContent=message;$('#pg-toast').classList.add('visible');clearTimeout(timer);timer=setTimeout(()=>$('#pg-toast').classList.remove('visible'),3500);}
  function updateChoice(){
    $$('.concept').forEach(card=>card.querySelector('.selected-chip').hidden=card.dataset.concept!==choice);
    const isChosen=active===choice;
    $('#choose').setAttribute('aria-pressed',String(isChosen));
    $('#choose').textContent=isChosen?'✓ 已标记为喜欢':'♡ 我更喜欢这套';
    $('#selection-summary').classList.toggle('chosen',!!choice);
    $('#selection-summary span').textContent=choice?`你目前选择了 ${concepts[choice].code} · ${concepts[choice].name}。也可以继续比较。`:'还没决定？四套都可以慢慢试。';
    $('#clear-choice').hidden=!choice;
  }
  function route(scroll=false){
    const key=location.hash.slice(1);active=Object.hasOwn(concepts,key)?key:'adventure';
    const c=concepts[active];
    $$('.concept').forEach(card=>{const current=card.dataset.concept===active;card.classList.toggle('active',current);card.querySelector('button').setAttribute('aria-pressed',String(current));});
    $('#preview-label').textContent=`方案 ${c.code} · ${c.ux}`;$('#preview-title').textContent=c.name;$('#preview-hint').textContent=c.hint;
    if($('#live-preview').getAttribute('src')!==`${active}.html`)$('#live-preview').src=`${active}.html`;
    $('#live-preview').title=`${c.name}交互体验`;$('#standalone').href=`${active}.html`;
    $('#link-fallback').hidden=true;updateChoice();
    if(scroll)$('#preview').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  }
  document.addEventListener('click',event=>{
    const btn=event.target.closest('button');if(!btn)return;
    if(btn.dataset.preview){if(location.hash.slice(1)===btn.dataset.preview)route(true);else location.hash=btn.dataset.preview;}
    if(btn.dataset.device){const mobile=btn.dataset.device==='mobile';$('#preview-surface').classList.toggle('mobile',mobile);$$('[data-device]').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));}
  });
  $('#choose').addEventListener('click',()=>{
    choice=active;let saved=true;try{localStorage.setItem(storageKey,choice);}catch{saved=false;}
    updateChoice();toast(saved?`已记住你喜欢 ${concepts[choice].name}，还可以继续比较。`:'已在本次页面标记喜欢的方案。');
  });
  $('#clear-choice').addEventListener('click',()=>{choice='';try{localStorage.removeItem(storageKey);}catch{}updateChoice();toast('已清除选择，重新挑一个喜欢的世界吧。');});
  $('#copy-link').addEventListener('click',async()=>{
    const url=new URL(location.href);url.hash=active;
    try{await navigator.clipboard.writeText(url.href);toast('方案链接已复制。');}
    catch{$('#share-url').value=url.href;$('#link-fallback').hidden=false;$('#share-url').focus();$('#share-url').select();}
  });
  window.addEventListener('hashchange',()=>route(true));route(false);
})();
