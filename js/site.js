(() => {
  const db=window.PROVERB_DATABASE||[];
  const read=(key,fallback)=>{try{const value=localStorage.getItem(key);return value?JSON.parse(value):fallback}catch{return fallback}};
  const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value))}catch{}}
  const getFavorites=()=>read('pvi-favorites',[]);
  const isFavorite=id=>getFavorites().includes(id);
  function toggleFavorite(id){let list=getFavorites();list=list.includes(id)?list.filter(x=>x!==id):[...list,id];write('pvi-favorites',list);document.dispatchEvent(new CustomEvent('pvi:favorites',{detail:list}));return list.includes(id)}
  function selectProverb(id){if(db.some(x=>x.id===id)){try{localStorage.setItem('pvi-selected',id)}catch{}}}
  function getSelected(){const id=(()=>{try{return localStorage.getItem('pvi-selected')}catch{return null}})();return db.find(x=>x.id===id)||db[0]||null}
  function escape(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function card(item){return `<article class="catalog-card" data-id="${escape(item.id)}"><div class="catalog-card-top"><span>${escape(item.category)}</span><button class="card-save ${isFavorite(item.id)?'is-saved':''}" type="button" aria-label="${isFavorite(item.id)?'Убрать из избранного':'Сохранить в избранное'}" aria-pressed="${isFavorite(item.id)}">${isFavorite(item.id)?'★':'☆'}</button></div><h3>${escape(item.text)}</h3><p>${escape(item.meaning)}</p><details><summary>Пример и границы смысла <span>＋</span></summary><div class="catalog-detail"><p><b>В жизни</b>${escape(item.example)}</p><p><b>Когда стоит уточнить</b>${escape(item.caution)}</p><div class="card-actions"><button class="catalog-train" type="button">Тренироваться ↗</button><button class="catalog-ask" type="button">Обсудить с ИИ ✦</button></div></div></details></article>`}
  document.querySelectorAll('.site-nav a').forEach(a=>{if(a.dataset.nav===document.body.dataset.page)a.classList.add('active')});
  const toggle=document.querySelector('.menu-toggle'),nav=document.querySelector('#site-nav');
  if(toggle&&nav){toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню')});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');toggle.setAttribute('aria-expanded','false')}))}
  const daily=document.querySelector('#daily-proverb');
  if(daily&&db.length){const day=Math.floor(Date.now()/86400000),item=db[(day+31)%db.length];daily.innerHTML=`«${escape(item.text)}»<small>${escape(item.meaning)}</small>`;const save=document.querySelector('#daily-save'),open=document.querySelector('#daily-open');if(isFavorite(item.id)){save.textContent='★';save.classList.add('saved')}save.addEventListener('click',()=>{const now=toggleFavorite(item.id);save.textContent=now?'★':'☆';save.classList.toggle('saved',now)});open.addEventListener('click',()=>selectProverb(item.id))}
  const completed=read('pvi-progress',[]);const pct=Math.round(completed.length/3*100);const progress=document.querySelector('#home-progress'),ring=document.querySelector('.progress-ring');if(progress)progress.textContent=pct+'%';if(ring)ring.style.setProperty('--progress',pct+'%');
  const favCount=document.querySelector('#saved-count');if(favCount)favCount.textContent=getFavorites().length;
  window.ProverbApp={db,read,write,getFavorites,isFavorite,toggleFavorite,selectProverb,getSelected,card,escape};
})();
