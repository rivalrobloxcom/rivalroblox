const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

function esc(s){
  return String(s ?? '').replace(/[&<>"']/g, m => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
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
  let d = Math.floor(Date.now()/1000 - t);
  if(d<60) return 'Just now';
  let m = Math.floor(d/60);
  if(m<60) return m+'m ago';
  let h = Math.floor(m/60);
  if(h<24) return h+'h ago';
  return Math.floor(h/24)+'d ago';
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

async function api(url, opts = {}){
  const r = await fetch(apiTarget(url), {
    credentials:'include',
    headers:{'Content-Type':'application/json'},
    ...opts
  });
  const j = await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(j.error || 'Request failed');
  return j;
}

function uiAlert(message,title='Notice',icon='⚡'){
  alert(`${title}: ${message}`);
}
 
