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

function apiTarget(url){
  const base = (window.RIVALS_API_BASE_URL ||
    localStorage.getItem('RIVALS_API_BASE_URL') ||
    'https://rivalroblox.pythonanywhere.com').replace(/\/$/, '');

  if (url.startsWith('http')) return url;
  if (!url.startsWith('/')) url = '/' + url;
  return base + url;
}

async function api(url, opts = {}){
  const r = await fetch(apiTarget(url), {
    credentials: 'include',
    headers: {'Content-Type':'application/json'},
    ...opts
  });

  const j = await r.json().catch(()=>({}));

  if (!r.ok) {
    const err = new Error(j.error || 'Request failed');
    err.status = r.status;
    throw err;
  }
  return j;
}

function uiAlert(msg, title='Notice', icon='⚡'){
  return new Promise(resolve=>{
    const m = document.createElement('div');
    m.className = 'ui-modal open';
    m.innerHTML = `
      <div class="ui-modal-card">
        <button class="ui-modal-x">×</button>
        <div class="ui-modal-icon">${icon}</div>
        <h3>${title}</h3>
        <p>${msg}</p>
        <div class="ui-modal-actions">
          <button class="primary">OK</button>
        </div>
      </div>
    `;
    document.body.appendChild(m);
    m.querySelector('button').onclick = () => { m.remove(); resolve(); };
  });
}

function uiConfirm(msg, title='Confirm', icon='⚠️'){
  return new Promise(resolve=>{
    const m = document.createElement('div');
    m.className = 'ui-modal open';
    m.innerHTML = `
      <div class="ui-modal-card">
        <div class="ui-modal-icon">${icon}</div>
        <h3>${title}</h3>
        <p>${msg}</p>
        <div class="ui-modal-actions">
          <button class="ghost" id="noBtn">Cancel</button>
          <button class="primary" id="yesBtn">Confirm</button>
        </div>
      </div>
    `;
    document.body.appendChild(m);
    m.querySelector('#noBtn').onclick = () => { m.remove(); resolve(false); };
    m.querySelector('#yesBtn').onclick = () => { m.remove(); resolve(true); };
  });
}

async function loadMe(){
  try{
    const r = await api('/api/me');
    const u = r.user;

    $('#profileBtn').textContent = u.username;
    $('#profileName').textContent = u.username;
    $('#profileMeta').textContent = u.rank + ' • ' + u.region;
  }catch(e){
    $('#profileBtn').textContent = 'Guest';
  }
}

async function loadNotifs(){
  try{
    const r = await api('/api/notifications/count');
    const bell = $('#bell');

    if (r.count > 0){
      bell.classList.add('has-alert');
      bell.innerHTML = `<i class="bell-icon"></i><span>${r.count}</span>`;
    }
  }catch(e){}
}

function setupBell(){
  const bell = $('#bell');
  const panel = $('#notifyPanel');
  const close = $('#closeNotify');

  if (!bell || !panel) return;

  bell.onclick = async () => {
    panel.classList.toggle('open');

    if (panel.classList.contains('open')){
      const r = await api('/api/notifications');
      const box = $('#notifyContent');
      box.innerHTML = r.notifications.map(n =>
        `<div class="notif">${esc(n.message)}</div>`
      ).join('');
    }
  };

  close.onclick = () => panel.classList.remove('open');
}

window.addEventListener('load', ()=>{
  loadMe();
  loadNotifs();
  setupBell();
});
