const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

function esc(s){
  return String(s ?? '').replace(/[&<>"']/g, m => ({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;',
    "'":'&#39;'
  }[m]));
}

function rankIconHTML(rank, cls=''){
  const r = String(rank || '').toLowerCase();
  let icon = '🏆';

  if(r.includes('bronze')) icon='🥉';
  else if(r.includes('silver')) icon='🥈';
  else if(r.includes('gold')) icon='🥇';
  else if(r.includes('platinum')) icon='💠';
  else if(r.includes('diamond')) icon='💎';
  else if(r.includes('onyx')) icon='⚫';
  else if(r.includes('nemesis')) icon='🔥';
  else if(r.includes('archnemesis')) icon='👑';

  return `<span class="${cls}">${icon}</span>`;
}

function ago(t){
  const d = Math.floor(Date.now()/1000 - t);
  if(d<60) return 'now';
  if(d<3600) return Math.floor(d/60)+'m';
  if(d<86400) return Math.floor(d/3600)+'h';
  return Math.floor(d/86400)+'d';
}

function apiTarget(url){
  const base = (window.RIVALS_API_BASE_URL ||
    localStorage.getItem('RIVALS_API_BASE_URL') ||
    'https://rivalroblox.pythonanywhere.com'
  ).replace(/\/$/, '');

  if(/^https?:\/\//i.test(url)) return url;
  if(!url.startsWith('/')) url = '/' + url;
  return base + url;
}

async function api(url, opts={}){
  const r = await fetch(apiTarget(url), {
    credentials:'include',
    headers:{'Content-Type':'application/json'},
    ...opts
  });

  const j = await r.json().catch(()=>({}));

  if(!r.ok){
    throw new Error(j.error || 'Request failed');
  }

  return j;
}

function ensureModal(){
  let m = $('#uiModal');
  if(m) return m;

  document.body.insertAdjacentHTML('beforeend', `
    <div id="uiModal" class="ui-modal">
      <div class="ui-modal-card">
        <button class="ui-modal-x">×</button>
        <div class="ui-modal-icon">⚡</div>
        <h3 id="uiModalTitle"></h3>
        <p id="uiModalText"></p>
        <div id="uiModalActions"></div>
      </div>
    </div>
  `);

  m = $('#uiModal');

  m.querySelector('.ui-modal-x').onclick = ()=>m.classList.remove('open');
  m.onclick = e=>{if(e.target===m) m.classList.remove('open')};

  return m;
}

function uiAlert(msg,title='Notice',icon='⚡'){
  const m = ensureModal();
  $('#uiModalTitle').textContent = title;
  $('#uiModalText').textContent = msg;
  $('.ui-modal-icon').textContent = icon;
  $('#uiModalActions').innerHTML = `<button data-ok>OK</button>`;
  m.classList.add('open');

  return new Promise(r=>{
    $('[data-ok]').onclick = ()=>{
      m.classList.remove('open');
      r();
    };
  });
}

function uiConfirm(msg,title='Confirm',icon='❓'){
  const m = ensureModal();
  $('#uiModalTitle').textContent = title;
  $('#uiModalText').textContent = msg;
  $('.ui-modal-icon').textContent = icon;
  $('#uiModalActions').innerHTML = `
    <button data-no>Cancel</button>
    <button data-yes class="primary">Confirm</button>
  `;
  m.classList.add('open');

  return new Promise(r=>{
    $('[data-no]').onclick = ()=>{m.classList.remove('open');r(false)};
    $('[data-yes]').onclick = ()=>{m.classList.remove('open');r(true)};
  });
}

async function loadNotifications(){
  try{
    const d = await api('/api/notifications');
    const box = $('#notifyContent');
    if(!box) return;

    box.innerHTML = d.notifications.length
      ? d.notifications.map(n=>`<div class="notify">${esc(n.message)}</div>`).join('')
      : '<p>No notifications</p>';
  }catch(e){}
}

setInterval(loadNotifications, 3000);
